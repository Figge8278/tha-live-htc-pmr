import { createSnapshotDocument, validateSnapshotDocument } from './snapshotSchema.js';
import { buildSnapshotReportModel } from '../report/snapshotReportModel.js';
import { renderClientPmrHtml } from '../report/renderClientPmrHtml.js';
import { createDrivePackageContext, DRIVE_FOLDERS, flatPhotoName, rewriteFolderName, rewriteQueryUrl } from './drivePackageContext.js';
import { decodeJson, headerValue, multipartBody, parseMultipart, withHeader } from './driveMultipart.js';
import { htmlToPdfBlob } from './drivePdf.js';

(() => {
  const SCRIPT_ID = 'tha-v357-connected-drive-report';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;
  const originalFetch = window.fetch.bind(window);
  const drive = createDrivePackageContext(originalFetch);
  let latestPayload = null;
  let latestSnapshot = null;

  function isSnapshotLike(value = {}) {
    return Boolean(value?.fileType === 'tha-snapshot' || value?.client || value?.rows || value?.answers || value?.htc);
  }
  function enrichPhoto(photo = {}, expectedName = '') {
    const uploaded = drive.photo(expectedName);
    if (!uploaded) return photo;
    return {
      ...photo, uploadStatus: 'uploaded', driveFileId: uploaded.id || photo.driveFileId || '',
      driveFileName: uploaded.name || expectedName, driveViewLink: uploaded.webViewLink || photo.driveViewLink || '',
      webViewLink: uploaded.webViewLink || photo.webViewLink || '', uploadedAt: photo.uploadedAt || new Date().toISOString()
    };
  }
  function enrichLegacyPhotos(payload = {}) {
    const next = JSON.parse(JSON.stringify(payload));
    const sectionById = Object.fromEntries((next.sectionFlow || []).map(section => [section.key, section]));
    Object.entries(next.roomCapture || {}).forEach(([roomId, capture]) => {
      const section = sectionById[roomId] || {};
      const room = section.roomName || section.label || roomId || 'Room';
      capture.photos = (capture.photos || []).map(photo => enrichPhoto(photo, flatPhotoName({ room, item: 'Overview', label: photo.label || 'Overview', originalName: photo.name })));
    });
    (next.rows || []).forEach(row => {
      const room = row.roomName || row.room || 'Room';
      if (!row.answer) row.answer = {};
      row.answer.photos = (row.answer.photos || []).map(photo => enrichPhoto(photo, flatPhotoName({ room, item: row.item || 'Checklist Item', label: photo.label || 'Photo', originalName: photo.name })));
    });
    return next;
  }
  function snapshotFrom(payload = {}) {
    if (payload.fileType === 'tha-snapshot') return validateSnapshotDocument(payload);
    const enriched = enrichLegacyPhotos(payload);
    return createSnapshotDocument({
      sessionId: enriched.snapshotId || enriched.id || '', sessionName: enriched.walkthroughName || enriched.name || '', data: enriched,
      createdAt: enriched.createdAt || enriched.exportedAt || '', updatedAt: enriched.updatedAt || enriched.exportedAt || new Date().toISOString()
    });
  }
  function currentReportHtml() {
    if (!latestSnapshot) return '';
    return renderClientPmrHtml(buildSnapshotReportModel(latestSnapshot));
  }
  function photoFolder(folders, name = '') { return /overview/i.test(name) ? folders.roomOverview : folders.findingEvidence; }

  window.fetch = async function connectedDriveFetch(input, init = {}) {
    let url = typeof input === 'string' ? input : input?.url;
    const method = (init.method || input?.method || 'GET').toUpperCase();
    if (typeof url === 'string') {
      const rewritten = rewriteQueryUrl(url);
      if (rewritten !== url) { url = rewritten; input = typeof input === 'string' ? rewritten : new Request(rewritten, input); }
    }
    if (method === 'GET' && typeof url === 'string' && url.includes('googleapis.com/drive/v3/files')) {
      const response = await originalFetch(input, init); await drive.trackSearch(response, url); return response;
    }
    if (method === 'POST' && typeof url === 'string' && url.includes('googleapis.com/drive/v3/files') && !url.includes('/upload/')) {
      const contentType = headerValue(init.headers || input?.headers, 'Content-Type');
      if (/application\/json/i.test(contentType) && init.body) {
        try {
          const metadata = JSON.parse(init.body);
          if (metadata.mimeType === 'application/vnd.google-apps.folder') metadata.name = rewriteFolderName(metadata.name);
          const response = await originalFetch(input, { ...init, body: JSON.stringify(metadata) });
          await drive.trackCreate(response, metadata); return response;
        } catch {}
      }
    }
    if (method === 'POST' && typeof url === 'string' && url.includes('googleapis.com/upload/drive/v3/files')) {
      const parsed = await parseMultipart(input, init).catch(() => null);
      if (parsed?.metadata) {
        const metadata = { ...parsed.metadata };
        const originalName = metadata.name || '';
        let contentType = parsed.uploadContentType;
        let contentBlob = new Blob([parsed.contentBytes], { type: contentType });
        const auth = headerValue(init.headers || input?.headers, 'Authorization');
        const packageId = drive.packageIdForParent(metadata.parents?.[0] || '');
        const folders = await drive.ensureFolders(auth, packageId);
        const json = (/json/i.test(contentType) || /\.json$/i.test(originalName)) ? decodeJson(parsed.contentBytes) : null;
        if (json && isSnapshotLike(json)) { latestPayload = json; latestSnapshot = snapshotFrom(json); }

        if (/^image\//i.test(contentType)) {
          const target = photoFolder(folders, originalName); if (target) metadata.parents = [target];
        } else if (/intake summary|htc checklist|photo index|tha office|airtable|internal action/i.test(originalName)) {
          if (folders.working) metadata.parents = [folders.working]; metadata.name = drive.workingName(originalName);
        } else if (/Emergency Backup|Full Walkthrough Export|Restore This THA Snapshot/i.test(originalName) && latestSnapshot) {
          const snapshotBlob = new Blob([JSON.stringify(latestSnapshot, null, 2)], { type: 'application/json' });
          if (folders.working) await drive.uploadRaw(auth, folders.working, drive.snapshotFileName, snapshotBlob, 'application/json');
          if (folders.backup) metadata.parents = [folders.backup];
          metadata.name = `Emergency Restore — ${drive.timestamp()}.json`; contentBlob = snapshotBlob; contentType = 'application/json';
        } else if (originalName === 'PMR Report Packet.html' || /^01 - (Homeowner|Client) PMR/i.test(originalName)) {
          const html = currentReportHtml(); if (folders.client) metadata.parents = [folders.client];
          metadata.name = '01 - Client PMR — Interactive Report.html'; delete metadata.mimeType;
          if (html) { contentBlob = new Blob([html], { type: 'text/html' }); contentType = 'text/html'; }
        } else if (originalName === 'PMR Report Packet.pdf' || /^02 - (Homeowner|Client) PMR/i.test(originalName)) {
          const html = currentReportHtml(); if (folders.client) metadata.parents = [folders.client];
          metadata.name = '02 - Client PMR — Printable Binder Copy.pdf'; delete metadata.mimeType;
          if (html) { contentBlob = await htmlToPdfBlob(html); contentType = 'application/pdf'; }
        }
        const body = multipartBody(parsed.boundary, metadata, contentBlob, contentType);
        const response = await originalFetch(input, {
          ...init, headers: withHeader(init.headers || input?.headers || {}, 'Content-Type', `multipart/related; boundary=${parsed.boundary}`), body
        });
        if (/^image\//i.test(contentType)) {
          drive.recordPhoto(originalName, await response.clone().json().catch(() => null));
          if (latestPayload) latestSnapshot = snapshotFrom(latestPayload);
        }
        return response;
      }
    }
    return originalFetch(input, init);
  };

  const diagnostics = {
    version: '3.57.2', folderNames: DRIVE_FOLDERS,
    getLatestSnapshot: () => latestSnapshot,
    buildLatestReportModel: () => latestSnapshot ? buildSnapshotReportModel(latestSnapshot) : null
  };
  window.thaSnapshotDrivePackage = diagnostics;
  window.__thaConnectedDriveReport = diagnostics;
})();
