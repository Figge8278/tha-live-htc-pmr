(() => {
  const ROOT_KEY = 'tha-drive-root-folder-id';
  const ROOT_LABEL_KEY = 'tha-drive-root-folder-label';
  const STATUS_KEY = 'tha-drive-root-status-v1';
  const DEFAULT_ROOT_ID = '1f4UhtzE-nA0mcusxeMCEdGi-1jYtyhlZ';
  const DEFAULT_LABEL = 'THA app - Clients';

  function storageValue(key) {
    try {
      return String(localStorage.getItem(key) || '').trim();
    } catch {
      return '';
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Label-only helper.
    }
  }

  const rootId = storageValue(ROOT_KEY);
  const rootLabel = storageValue(ROOT_LABEL_KEY);

  if (!rootId) setStorage(ROOT_KEY, DEFAULT_ROOT_ID);
  if (!rootLabel || /^THA App Clients$/i.test(rootLabel) || /^THA App Uploads$/i.test(rootLabel) || /^THA Drive Root$/i.test(rootLabel)) {
    setStorage(ROOT_LABEL_KEY, DEFAULT_LABEL);
  }

  try {
    const status = JSON.parse(localStorage.getItem(STATUS_KEY) || 'null') || {};
    localStorage.setItem(STATUS_KEY, JSON.stringify({
      ...status,
      rootId: storageValue(ROOT_KEY) || DEFAULT_ROOT_ID,
      rootLabel: DEFAULT_LABEL,
      message: 'Using THA app - Clients as the default app upload buffer.',
      updatedAt: new Date().toISOString()
    }));
  } catch {
    // Status-only helper.
  }

  window.dispatchEvent(new Event('tha-drive-root-updated'));
})();