(() => {
  const ID = 'tha-v3576-drive-action-confirmation';
  const STORE = 'tha-v3576-drive-ui-state';
  if (window[ID]) return;
  window[ID] = true;

  const read = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { return {}; } };
  const write = value => { try { localStorage.setItem(STORE, JSON.stringify(value)); } catch {} };
  const isDriveRequest = value => /https:\/\/www\.googleapis\.com\/(?:upload\/)?drive\/v3\/files/i.test(String(value || ''));
  const previousFetch = window.fetch.bind(window);
  let completionTimer = null;

  function scheduleCompletion() {
    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(() => {
      const state = read();
      if (!state.pendingSaveAt || state.lastError) return;
      state.lastSavedAt = new Date().toISOString();
      state.pendingSaveAt = '';
      state.lastError = '';
      state.lastCompletionSource = 'successful-drive-request-sequence';
      write(state);
      window.dispatchEvent(new CustomEvent('tha-drive-record-saved', { detail: { savedAt: state.lastSavedAt } }));
    }, 2200);
  }

  window.fetch = async function thaDriveConfirmationFetch(input, init) {
    const url = typeof input === 'string' ? input : input?.url || '';
    try {
      const response = await previousFetch(input, init);
      const state = read();
      if (state.pendingSaveAt && isDriveRequest(url)) {
        if (response.ok) {
          state.lastDriveRequestAt = new Date().toISOString();
          state.lastError = '';
          write(state);
          scheduleCompletion();
        } else {
          state.lastError = `Google Drive returned ${response.status || 'an error'} during the save.`;
          state.pendingSaveAt = '';
          write(state);
          window.clearTimeout(completionTimer);
        }
      }
      return response;
    } catch (error) {
      const state = read();
      if (state.pendingSaveAt && isDriveRequest(url)) {
        state.lastError = error?.message || 'Google Drive save request failed.';
        state.pendingSaveAt = '';
        write(state);
        window.clearTimeout(completionTimer);
      }
      throw error;
    }
  };
})();
