(() => {
  const ROOT_KEY = 'tha-drive-root-folder-id';
  const ROOT_LABEL_KEY = 'tha-drive-root-folder-label';
  const STATUS_KEY = 'tha-drive-root-status-v1';
  const MODE_KEY = 'tha-drive-upload-mode';
  const SUBMITTED_BY_KEY = 'tha-drive-submitted-by';
  const CURRENT_WALKTHROUGH_ID_KEY = 'tha-current-walkthrough-id';

  const nativeFetch = window.fetch.bind(window);
  const destinationParentIds = new Set();

  function storageValue(key) {
    try {
      return String(localStorage.getItem(key) || '').trim();
    } catch {
      return '';
    }
  }

  function readRootId() {
    return storageValue(ROOT_KEY);
  }

  function readRootLabel() {
    return storageValue(ROOT_LABEL_KEY) || 'THA Shared Drive Root';
  }

  function uploadMode() {
    const mode = storageValue(MODE_KEY) || 'incoming';
    return ['incoming', 'demo', 'review', 'final'].includes(mode) ? mode : 'incoming';
  }

  function submittedBy() {
    return storageValue(SUBMITTED_BY_KEY) || 'Field User';
  }

  function modeLabel(mode = uploadMode()) {
    if (mode === 'demo') return 'Demo / Sandbox Upload';
    if (mode === 'review') return 'Review / Ready to File';
    if (mode === 'final') return 'Final Client Package';
    return 'Incoming Field Upload';
  }

  function folderPathParts(mode = uploadMode()) {
    const person = submittedBy();
    if (mode === 'demo') return ['00_Demo Sandbox Uploads', person];
    if (mode === 'review') return ['02_Review Ready to File'];
    if (mode === 'final') return ['03_Final Client Folders'];
    return ['01_Incoming Field Uploads', person];
  }

  function cleanDriveName(value = '') {
    return String(value || '')
      .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140) || 'Untitled';
  }

  function currentSessionSuffix() {
    const id = storageValue(CURRENT_WALKTHROUGH_ID_KEY);
    return id ? id.slice(-6) : Math.random().toString(36).slice(2, 8);
  }

  function stagedPackageName(originalName = '') {
    const mode = uploadMode();
    const cleanOriginal = cleanDriveName(originalName || 'Client Package');
    if (mode === 'final') return cleanOriginal;
    const date = new Date().toISOString().slice(0, 10);
    return cleanDriveName(`${date} - ${cleanOriginal} - ${modeLabel(mode)} - ${submittedBy()} - ${currentSessionSuffix()}`);
  }

  function writeStatus(patch = {}) {
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify({
        mode: uploadMode(),
        modeLabel: modeLabel(),
        submittedBy: submittedBy(),
        folderPath: folderPathParts().join(' / '),
        ...patch,
        updatedAt: new Date().toISOString()
      }));
      window.dispatchEvent(new Event('tha-drive-root-updated'));
    } catch {
      // Status only.
    }
  }

  function isDriveFilesApi(url) {
    return /^https:\/\/www\.googleapis\.com\/(upload\/)?drive\/v3\/files/.test(String(url || ''));
  }

  function withSharedDriveParams(url) {
    try {
      const parsed = new URL(url);
      if (!isDriveFilesApi(parsed.href)) return url;
      parsed.searchParams.set('supportsAllDrives', 'true');
      if (!parsed.pathname.includes('/upload/')) parsed.searchParams.set('includeItemsFromAllDrives', 'true');
      return parsed.toString();
    } catch {
      return url;
    }
  }

  function driveQueryEscape(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  function folderQueryParts(url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== 'https://www.googleapis.com' || parsed.pathname !== '/drive/v3/files') return null;
      const q = parsed.searchParams.get('q') || '';
      if (!/mimeType='application\/vnd\.google-apps\.folder'/.test(q)) return null;
      const nameMatch = q.match(/name='((?:\\'|[^'])*)'/);
      const parentMatch = q.match(/'([^']+)' in parents/);
      return {
        parsed,
        q,
        name: nameMatch ? nameMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : '',
        parentId: parentMatch ? parentMatch[1] : ''
      };
    } catch {
      return null;
    }
  }

  function isTopLevelThaClientsFolderQuery(url) {
    const parts = folderQueryParts(url);
    return Boolean(parts && parts.name === 'THA Clients' && !parts.parentId);
  }

  function isNativeIncomingFolderQuery(url, rootId) {
    const parts = folderQueryParts(url);
    return Boolean(parts && parts.name === '_HTC PMR Incoming' && parts.parentId === rootId);
  }

  function isDestinationPackageQuery(url) {
    const parts = folderQueryParts(url);
    return Boolean(parts && parts.parentId && destinationParentIds.has(parts.parentId) && !folderPathParts().includes(parts.name));
  }

  function rewriteFolderQueryName(url, newName) {
    const parts = folderQueryParts(url);
    if (!parts) return url;
    parts.parsed.searchParams.set('q', parts.q.replace(/name='((?:\\'|[^'])*)'/, `name='${driveQueryEscape(newName)}'`));
    return parts.parsed.toString();
  }

  function authTokenFrom(input, init) {
    try {
      const headers = new Headers(init?.headers || input?.headers || {});
      const auth = headers.get('Authorization') || headers.get('authorization') || '';
      return auth.replace(/^Bearer\s+/i, '').trim();
    } catch {
      return '';
    }
  }

  function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }

  async function driveApi(accessToken, url, options = {}) {
    const response = await nativeFetch(withSharedDriveParams(url), {
      ...options,
      headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) }
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw Object.assign(new Error(body || `Drive API failed: ${response.status}`), { status: response.status, url, body });
    }
    return response.json();
  }

  async function findFolder(accessToken, name, parentId) {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${driveQueryEscape(name)}' and '${parentId}' in parents and trashed=false`;
    const result = await driveApi(accessToken, `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`);
    return result.files?.[0] || null;
  }

  async function createFolder(accessToken, name, parentId) {
    const metadata = { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] };
    return driveApi(accessToken, 'https://www.googleapis.com/drive/v3/files?fields=id,name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });
  }

  async function findOrCreateFolder(accessToken, name, parentId) {
    const existing = await findFolder(accessToken, name, parentId);
    if (existing?.id) return existing;
    return createFolder(accessToken, name, parentId);
  }

  async function ensureDestinationParent(accessToken, rootId) {
    if (!accessToken) throw new Error('Google Drive access token is unavailable. Connect Google Drive first.');
    let parentId = rootId;
    let parentName = readRootLabel();
    for (const part of folderPathParts()) {
      const folder = await findOrCreateFolder(accessToken, part, parentId);
      parentId = folder.id;
      parentName = folder.name || part;
    }
    destinationParentIds.add(parentId);
    writeStatus({
      state: 'staged-destination-ready',
      rootId,
      rootLabel: readRootLabel(),
      destinationParentId: parentId,
      destinationParentName: parentName,
      message: `Drive packages will land in ${folderPathParts().join(' / ')}.`
    });
    return { id: parentId, name: parentName };
  }

  async function fetchWithUrl(input, init, url) {
    const nextUrl = withSharedDriveParams(url);
    if (typeof input === 'string') return nativeFetch(nextUrl, init);
    return nativeFetch(new Request(nextUrl, input), init);
  }

  async function maybeRewriteFolderCreate(input, init, url) {
    try {
      const method = String(init?.method || input?.method || 'GET').toUpperCase();
      if (method !== 'POST') return null;
      const parsed = new URL(url);
      if (parsed.origin !== 'https://www.googleapis.com' || parsed.pathname !== '/drive/v3/files') return null;
      const bodyText = typeof init?.body === 'string' ? init.body : '';
      if (!bodyText) return null;
      const metadata = JSON.parse(bodyText);
      if (metadata?.mimeType !== 'application/vnd.google-apps.folder') return null;
      const parentId = metadata.parents?.[0] || '';
      if (!destinationParentIds.has(parentId) || uploadMode() === 'final') return null;
      const nextMetadata = { ...metadata, name: stagedPackageName(metadata.name) };
      writeStatus({ state: 'naming-staged-package', packageName: nextMetadata.name, message: 'Using staged package folder naming to prevent overlap.' });
      const nextInit = { ...(init || {}), body: JSON.stringify(nextMetadata) };
      return fetchWithUrl(input, nextInit, url);
    } catch {
      return null;
    }
  }

  window.fetch = async function thaSharedDriveFetch(input, init) {
    const rootId = readRootId();
    const url = typeof input === 'string' ? input : input?.url;

    if (rootId && isTopLevelThaClientsFolderQuery(url)) {
      writeStatus({ state: 'targeting-shared-root', rootId, rootLabel: readRootLabel(), message: 'Using configured THA Drive Root Folder instead of connected user My Drive root.' });
      return jsonResponse({ files: [{ id: rootId, name: readRootLabel() }] });
    }

    if (rootId && isNativeIncomingFolderQuery(url, rootId)) {
      try {
        const destination = await ensureDestinationParent(authTokenFrom(input, init), rootId);
        return jsonResponse({ files: [{ id: destination.id, name: destination.name }] });
      } catch (error) {
        writeStatus({ state: 'error', rootId, rootLabel: readRootLabel(), message: error?.message || 'Unable to prepare staged Drive destination.' });
        throw error;
      }
    }

    if (rootId && isDestinationPackageQuery(url) && uploadMode() !== 'final') {
      const parts = folderQueryParts(url);
      return fetchWithUrl(input, init, rewriteFolderQueryName(url, stagedPackageName(parts?.name || 'Client Package')));
    }

    const rewrittenCreate = rootId ? await maybeRewriteFolderCreate(input, init, url) : null;
    if (rewrittenCreate) return rewrittenCreate;

    if (rootId && typeof url === 'string' && isDriveFilesApi(url)) return fetchWithUrl(input, init, url);
    return nativeFetch(input, init);
  };

  window.THA_DRIVE_ROOT = {
    getRootId: readRootId,
    getRootLabel: readRootLabel,
    getMode: uploadMode,
    getSubmittedBy: submittedBy,
    getFolderPath: () => folderPathParts().join(' / '),
    setUploadRouting({ mode = uploadMode(), submittedBy: person = submittedBy() } = {}) {
      const cleanMode = ['incoming', 'demo', 'review', 'final'].includes(mode) ? mode : 'incoming';
      localStorage.setItem(MODE_KEY, cleanMode);
      localStorage.setItem(SUBMITTED_BY_KEY, String(person || 'Field User').trim() || 'Field User');
      writeStatus({ state: 'routing-configured', message: `Upload routing set to ${modeLabel(cleanMode)}.` });
    },
    setRootId(rootId, label = '') {
      const clean = String(rootId || '').trim();
      if (!clean) throw new Error('Drive Root Folder ID is required.');
      localStorage.setItem(ROOT_KEY, clean);
      if (label) localStorage.setItem(ROOT_LABEL_KEY, String(label || '').trim());
      writeStatus({ state: 'configured', rootId: clean, rootLabel: label || readRootLabel(), message: 'THA Drive Root Folder configured.' });
    },
    clearRootId() {
      localStorage.removeItem(ROOT_KEY);
      localStorage.removeItem(ROOT_LABEL_KEY);
      writeStatus({ state: 'cleared', message: 'THA Drive Root Folder cleared. Uploads will use connected user Drive root unless reset.' });
    },
    status() {
      try {
        return JSON.parse(localStorage.getItem(STATUS_KEY) || 'null') || { state: readRootId() ? 'configured' : 'not-configured' };
      } catch {
        return { state: readRootId() ? 'configured' : 'not-configured' };
      }
    }
  };

  writeStatus(readRootId()
    ? { state: 'configured', rootId: readRootId(), rootLabel: readRootLabel(), message: `Shared Drive root targeting ready. Default destination: ${folderPathParts().join(' / ')}.` }
    : { state: 'not-configured', message: 'No THA Drive Root Folder set yet.' });
})();