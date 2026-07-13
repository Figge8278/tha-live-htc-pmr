(() => {
  const ROOT_KEY = 'tha-drive-root-folder-id';
  const ROOT_LABEL_KEY = 'tha-drive-root-folder-label';
  const STATUS_KEY = 'tha-drive-root-status-v1';

  const nativeFetch = window.fetch.bind(window);

  function readRootId() {
    try {
      return String(localStorage.getItem(ROOT_KEY) || '').trim();
    } catch {
      return '';
    }
  }

  function readRootLabel() {
    try {
      return String(localStorage.getItem(ROOT_LABEL_KEY) || '').trim() || 'THA Shared Drive Root';
    } catch {
      return 'THA Shared Drive Root';
    }
  }

  function writeStatus(patch = {}) {
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify({ ...patch, updatedAt: new Date().toISOString() }));
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

  function isTopLevelThaClientsFolderQuery(url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== 'https://www.googleapis.com') return false;
      if (parsed.pathname !== '/drive/v3/files') return false;
      const q = parsed.searchParams.get('q') || '';
      return /mimeType='application\/vnd\.google-apps\.folder'/.test(q)
        && /name='THA Clients'/.test(q)
        && !/ in parents/.test(q);
    } catch {
      return false;
    }
  }

  window.fetch = function thaSharedDriveFetch(input, init) {
    const rootId = readRootId();
    const url = typeof input === 'string' ? input : input?.url;
    if (rootId && isTopLevelThaClientsFolderQuery(url)) {
      writeStatus({ state: 'targeting-shared-root', rootId, rootLabel: readRootLabel(), message: 'Using configured THA Drive Root Folder instead of connected user My Drive root.' });
      return Promise.resolve(new Response(JSON.stringify({ files: [{ id: rootId, name: readRootLabel() }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    if (rootId && typeof url === 'string' && isDriveFilesApi(url)) {
      const nextUrl = withSharedDriveParams(url);
      if (typeof input === 'string') return nativeFetch(nextUrl, init);
      return nativeFetch(new Request(nextUrl, input), init);
    }
    return nativeFetch(input, init);
  };

  window.THA_DRIVE_ROOT = {
    getRootId: readRootId,
    getRootLabel: readRootLabel,
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
    ? { state: 'configured', rootId: readRootId(), rootLabel: readRootLabel(), message: 'Shared Drive root targeting ready.' }
    : { state: 'not-configured', message: 'No THA Drive Root Folder set yet.' });
})();