import { THA_SNAPSHOT_FILE_NAME } from './snapshotSchema.js';

export const DRIVE_FOLDERS = {
  client: '01 - Client PMR',
  working: '02 - THA Working Record',
  photos: '03 - Photos',
  backup: '99 - Snapshot Restore & History',
  roomOverview: '01 - Room Overview',
  findingEvidence: '02 - Finding Evidence',
  clientSubmitted: '03 - Client Submitted',
  internalReference: '04 - Internal THA Reference'
};
const RENAMES = new Map([
  ['01 - Client PMR Report', DRIVE_FOLDERS.client],
  ['Photos', DRIVE_FOLDERS.photos],
  ['Secondary Editable Copies', DRIVE_FOLDERS.working],
  ['02 - THA Snapshot Working Files', DRIVE_FOLDERS.working],
  ['Backup Data', DRIVE_FOLDERS.backup],
  ['99 - Backup & Emergency Restore', DRIVE_FOLDERS.backup]
]);
export function text(value = '') { return String(value ?? '').trim(); }
export function cleanName(value = 'Untitled') { return text(value).replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').slice(0, 90) || 'Untitled'; }
export function stripExtension(value = '') { return String(value).replace(/\.[^.\/]+$/, ''); }
export function flatPhotoName({ room = 'Room', item = 'Overview', label = 'Photo', originalName = 'photo' } = {}) {
  return `${[room, item, label, stripExtension(originalName)].map(cleanName).join(' - ')}.jpg`;
}
function queryEscape(value) { return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function localTimestamp(date = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}
export function rewriteFolderName(name = '') { return RENAMES.get(name) || name; }
export function rewriteQueryUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.includes('googleapis.com/drive/v3/files')) return rawUrl;
  let url; try { url = new URL(rawUrl); } catch { return rawUrl; }
  const q = url.searchParams.get('q'); if (!q) return rawUrl;
  let next = q;
  for (const [from, to] of RENAMES.entries()) next = next.replace(new RegExp(`name='${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'), `name='${to}'`);
  if (next === q) return rawUrl;
  url.searchParams.set('q', next); return url.toString();
}

export function createDrivePackageContext(originalFetch) {
  const parentById = new Map();
  const nameById = new Map();
  const foldersByPackage = new Map();
  const organizedPackages = new Map();
  const photoByName = new Map();
  let lastPackageId = '';

  async function driveJson(url, options = {}) {
    const response = await originalFetch(url, options);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
  const authHeaders = auth => ({ Authorization: auth });
  async function findOrCreateFolder(auth, name, parentId) {
    if (!auth || !parentId) return '';
    const q = `mimeType='application/vnd.google-apps.folder' and name='${queryEscape(name)}' and '${parentId}' in parents and trashed=false`;
    const result = await driveJson(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents)`, { headers: authHeaders(auth) });
    const existing = result.files?.[0];
    if (existing?.id) { parentById.set(existing.id, parentId); nameById.set(existing.id, name); return existing.id; }
    const created = await driveJson('https://www.googleapis.com/drive/v3/files?fields=id,name,parents', {
      method: 'POST', headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
    });
    if (created?.id) { parentById.set(created.id, parentId); nameById.set(created.id, name); }
    return created?.id || '';
  }
  function packageIdForParent(parentId = '') {
    const name = nameById.get(parentId);
    if ([DRIVE_FOLDERS.client, DRIVE_FOLDERS.working, DRIVE_FOLDERS.photos, DRIVE_FOLDERS.backup].includes(name)) return parentById.get(parentId) || '';
    return parentId || lastPackageId;
  }
  async function organizePackage(auth, packageId, identity = {}) {
    if (!auth || !packageId) return null;
    if (organizedPackages.has(packageId)) return organizedPackages.get(packageId);
    const packageInfo = await driveJson(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(packageId)}?fields=id,name,parents,description`, { headers: authHeaders(auth) });
    const originalParent = packageInfo.parents?.[0] || '';
    const clientName = cleanName(identity.clientName || 'Unassigned Client');
    const address = cleanName(identity.address || 'Address Pending');
    const sessionName = cleanName(identity.sessionName || identity.visitLabel || 'Walkthrough');
    const demo = Boolean(identity.demo || /\b(demo|test|sample)\b/i.test(`${clientName} ${sessionName} ${identity.visitLabel || ''}`));
    const packageLooksRelevant = /incoming field upload|snapshot|walkthrough|pmr/i.test(packageInfo.name || '') || (String(packageInfo.name || '').includes(clientName) && String(packageInfo.name || '').includes(address));
    if (!originalParent || !packageLooksRelevant) return null;

    let clientParent = originalParent;
    if (demo) clientParent = await findOrCreateFolder(auth, '00 - DEMOS & TESTS', originalParent) || originalParent;
    const clientFolderName = demo ? cleanName(`DEMO - ${clientName}`) : clientName;
    const clientFolderId = await findOrCreateFolder(auth, clientFolderName, clientParent) || clientParent;
    const timelineName = cleanName(`${localTimestamp()} - ${sessionName} - ${address}`);
    const params = new URLSearchParams({ addParents: clientFolderId, removeParents: originalParent, fields: 'id,name,parents,webViewLink' });
    const updated = await driveJson(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(packageId)}?${params.toString()}`, {
      method: 'PATCH',
      headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: timelineName,
        description: `THA Snapshot timeline entry. Client: ${clientName}. Working session: ${sessionName}. Exported: ${new Date().toLocaleString()}.`
      })
    });
    const result = { ...updated, clientFolderId, clientFolderName, timelineName, demo };
    organizedPackages.set(packageId, result);
    return result;
  }
  async function ensureFolders(auth, packageId) {
    if (!auth || !packageId) return {};
    if (foldersByPackage.has(packageId)) return foldersByPackage.get(packageId);
    const client = await findOrCreateFolder(auth, DRIVE_FOLDERS.client, packageId);
    const working = await findOrCreateFolder(auth, DRIVE_FOLDERS.working, packageId);
    const photos = await findOrCreateFolder(auth, DRIVE_FOLDERS.photos, packageId);
    const backup = await findOrCreateFolder(auth, DRIVE_FOLDERS.backup, packageId);
    const value = {
      client, working, photos, backup,
      roomOverview: await findOrCreateFolder(auth, DRIVE_FOLDERS.roomOverview, photos),
      findingEvidence: await findOrCreateFolder(auth, DRIVE_FOLDERS.findingEvidence, photos),
      clientSubmitted: await findOrCreateFolder(auth, DRIVE_FOLDERS.clientSubmitted, photos),
      internalReference: await findOrCreateFolder(auth, DRIVE_FOLDERS.internalReference, photos)
    };
    foldersByPackage.set(packageId, value); lastPackageId = packageId; return value;
  }
  async function uploadRaw(auth, folderId, name, blob, mimeType) {
    if (!auth || !folderId) return null;
    const boundary = `tha_v357_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [folderId] })}\r\n`,
      `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`, blob, `\r\n--${boundary}--`
    ], { type: `multipart/related; boundary=${boundary}` });
    const response = await originalFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST', headers: { Authorization: auth, 'Content-Type': `multipart/related; boundary=${boundary}` }, body
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
  async function trackSearch(response, url) {
    try {
      const q = new URL(url).searchParams.get('q') || '';
      const name = q.match(/name='([^']+)'/)?.[1] || '';
      const parent = q.match(/'([^']+)' in parents/)?.[1] || '';
      const folder = (await response.clone().json().catch(() => null))?.files?.[0];
      if (folder?.id && name && parent) { nameById.set(folder.id, name); parentById.set(folder.id, parent); if ([DRIVE_FOLDERS.client, DRIVE_FOLDERS.working, DRIVE_FOLDERS.photos, DRIVE_FOLDERS.backup].includes(name)) lastPackageId = parent; }
    } catch {}
  }
  async function trackCreate(response, metadata) {
    const created = await response.clone().json().catch(() => null);
    if (!created?.id || metadata.mimeType !== 'application/vnd.google-apps.folder') return;
    const parent = metadata.parents?.[0] || '';
    nameById.set(created.id, metadata.name || ''); parentById.set(created.id, parent);
    if ([DRIVE_FOLDERS.client, DRIVE_FOLDERS.working, DRIVE_FOLDERS.photos, DRIVE_FOLDERS.backup].includes(metadata.name)) lastPackageId = parent;
  }
  function recordPhoto(name, uploaded) { if (name && uploaded) photoByName.set(name, uploaded); }
  function photo(name) { return photoByName.get(name); }
  function timestamp() { return new Date().toISOString().replace(/[:.]/g, '-'); }
  function workingName(name = '') {
    if (/intake summary/i.test(name)) return '01 - Intake Summary.html';
    if (/htc checklist|htc working/i.test(name)) return '02 - HTC Working Record.html';
    if (/tha office|internal action/i.test(name)) return '03 - THA Office Action Plan.html';
    if (/airtable|project queue/i.test(name)) return '04 - Project Queue.html';
    if (/photo index/i.test(name)) return '05 - Photo Index.html';
    if (/manifest/i.test(name)) return '00 - Package Manifest.html';
    return cleanName(name || 'Working File');
  }
  return { packageIdForParent, organizePackage, ensureFolders, uploadRaw, trackSearch, trackCreate, recordPhoto, photo, timestamp, workingName, snapshotFileName: THA_SNAPSHOT_FILE_NAME };
}
