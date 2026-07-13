(() => {
  const STYLE_ID = 'tha-v35-drive-test-workflow-styles';
  const PANEL_ATTR = 'data-tha-drive-test-workflow';
  const WALKTHROUGH_SESSIONS_KEY = 'tha-walkthrough-sessions';
  const CURRENT_WALKTHROUGH_ID_KEY = 'tha-current-walkthrough-id';
  const PHOTO_GUARD_STATUS_KEY = 'tha-photo-storage-guard-status-v1';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }

  function currentSession() {
    const sessions = readJson(WALKTHROUGH_SESSIONS_KEY, {}) || {};
    const id = localStorage.getItem(CURRENT_WALKTHROUGH_ID_KEY) || '';
    if (id && sessions[id]) return sessions[id];
    return Object.values(sessions).filter(Boolean).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }

  function photoList(value) {
    return Array.isArray(value?.photos) ? value.photos.filter(Boolean) : [];
  }

  function walkStats() {
    const data = currentSession()?.data || {};
    const roomPhotos = Object.values(data.roomCapture || {}).flatMap(photoList);
    const itemPhotos = Object.values(data.answers || {}).flatMap(photoList);
    const photos = [...roomPhotos, ...itemPhotos];
    return {
      client: data.client || {},
      total: photos.length,
      fullData: photos.filter(photo => photo.dataUrl).length,
      cached: photos.filter(photo => photo.photoStorage || photo.cacheStatus === 'cached' || photo.cacheStatus === 'restored').length,
      uploaded: photos.filter(photo => photo.driveFileId || photo.driveViewLink || photo.webViewLink || String(photo.uploadStatus || '').toLowerCase() === 'uploaded').length,
      localPending: photos.filter(photo => !(photo.driveFileId || photo.driveViewLink || photo.webViewLink || String(photo.uploadStatus || '').toLowerCase() === 'uploaded')).length,
      guard: readJson(PHOTO_GUARD_STATUS_KEY, { state: 'unknown', message: 'Photo storage guard status unavailable.' })
    };
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-drive-test-panel{margin:14px 0!important;padding:14px!important;border:1px solid #8ac6cf!important;border-radius:18px!important;background:#f3fcfd!important;color:#123e48!important;box-shadow:inset 6px 0 0 rgba(0,128,148,.28)!important;display:grid!important;gap:12px!important}
      .tha-drive-test-panel h3{margin:0!important;font-size:15px!important;color:#0f4f5b!important;line-height:1.25!important}
      .tha-drive-test-panel p{margin:0!important;font-size:12px!important;line-height:1.4!important;color:#405b63!important;font-weight:760!important}
      .tha-drive-test-grid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(220px,.8fr)!important;gap:12px!important;align-items:start!important}
      .tha-drive-test-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}
      .tha-drive-test-actions button{border:1px solid #61a9b5!important;border-radius:999px!important;background:#fff!important;color:#075564!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-drive-test-actions button.primary{background:#07859a!important;color:#fff!important;border-color:#07859a!important}
      .tha-drive-test-stats{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
      .tha-drive-test-chip{display:inline-flex!important;border:1px solid #b7dce2!important;border-radius:999px!important;background:#fff!important;color:#075564!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
      .tha-drive-tree{border:1px solid #c7e2e6!important;border-radius:14px!important;background:#fff!important;padding:10px 12px!important;font-size:12px!important;line-height:1.45!important;color:#284b55!important;font-weight:800!important}
      .tha-drive-tree ul{margin:5px 0 0 18px!important;padding:0!important}
      .tha-drive-tree li{margin:2px 0!important}
      .tha-drive-test-note{border:1px dashed #9fcfd7!important;border-radius:12px!important;background:#fff!important;padding:9px 10px!important;color:#3c5c64!important;font-size:12px!important;font-weight:820!important}
      @media(max-width:760px){.tha-drive-test-grid{grid-template-columns:1fr!important}.tha-drive-test-actions button{font-size:11px!important;padding:7px 9px!important}}
      @media print{.tha-drive-test-panel{display:none!important}}
    `;
    document.head.append(style);
  }

  function findButton(patterns) {
    const buttons = Array.from(document.querySelectorAll('button,[role="button"],a'));
    return buttons.find(button => patterns.some(pattern => pattern.test(textOf(button)))) || null;
  }

  function clickButton(patterns, fallbackMessage) {
    const button = findButton(patterns);
    if (button) {
      button.click();
      return true;
    }
    window.alert(fallbackMessage);
    return false;
  }

  function renderPanel() {
    const stats = walkStats();
    const clientName = stats.client.name || 'Client Name';
    const address = stats.client.address || 'Project Address';
    return `
      <section class="tha-drive-test-panel" ${PANEL_ATTR}="true">
        <header>
          <h3>Drive Package Test Workflow</h3>
          <p>Use this when you want to prove the full path: connect Drive, sync photos, save the PMR package, download/print it, and confirm what the client-facing packet looks like.</p>
        </header>
        <div class="tha-drive-test-stats">
          <span class="tha-drive-test-chip">${stats.total} photos</span>
          <span class="tha-drive-test-chip">${stats.localPending} local/pending</span>
          <span class="tha-drive-test-chip">${stats.uploaded} on Drive</span>
          <span class="tha-drive-test-chip">${stats.fullData} full payloads active</span>
          <span class="tha-drive-test-chip">Photo guard: ${stats.guard.state || 'unknown'}</span>
        </div>
        <div class="tha-drive-test-grid">
          <div>
            <div class="tha-drive-test-actions">
              <button type="button" class="primary" data-tha-drive-click="connect">1. Connect Drive</button>
              <button type="button" data-tha-drive-click="sync">2. Sync pending photos</button>
              <button type="button" data-tha-drive-click="restore">Restore cached photos</button>
              <button type="button" class="primary" data-tha-drive-click="save">3. Save PMR package</button>
              <button type="button" data-tha-drive-click="download">Download PMR HTML</button>
              <button type="button" data-tha-drive-click="print">Print PMR</button>
            </div>
            <p class="tha-drive-test-note">Recommended test path: fill client name/address/date, add a few room photos, connect Drive, sync pending photos, save the PMR package, then open Drive and confirm the folder tree below. If offline, capture locally and wait to save the package until reconnected.</p>
          </div>
          <div class="tha-drive-tree">
            <strong>Expected Drive file tree</strong>
            <ul>
              <li>THA Clients</li>
              <li>_HTC PMR Incoming</li>
              <li>${clientName} / ${address}</li>
              <li>PMR Report Packet.html</li>
              <li>PMR Report Packet.pdf</li>
              <li>Photos
                <ul><li>room overview photos</li><li>checklist item photos</li></ul>
              </li>
              <li>Secondary Editable Copies
                <ul><li>Intake Summary</li><li>HTC Checklist</li><li>Photo Index</li></ul>
              </li>
              <li>Backup Data
                <ul><li>full JSON export</li><li>emergency HTML backup</li></ul>
              </li>
            </ul>
          </div>
        </div>
      </section>`;
  }

  function placePanel() {
    const anchor = document.querySelector('.walkthroughControlsPanel .businessRecordsCard') || document.querySelector('.walkthroughControlsPanel') || document.querySelector('.pmrHeader') || document.querySelector('main');
    if (!anchor) return;
    const existing = document.querySelector(`[${PANEL_ATTR}]`);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderPanel();
    const panel = wrapper.firstElementChild;
    if (existing) existing.replaceWith(panel);
    else anchor.append(panel);
  }

  function wireActions() {
    document.querySelectorAll('[data-tha-drive-click]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-tha-drive-click');
        if (action === 'connect') clickButton([/connect google drive/i, /^connect drive$/i, /reconnect drive/i], 'Open Business Records & Drive, then use Connect Google Drive.');
        if (action === 'sync') clickButton([/sync pending photos/i, /sync photos/i], 'No Sync pending photos button was found on this screen. Connect Drive and open Business Records & Drive.');
        if (action === 'save') clickButton([/save pmr package/i, /save drive package/i, /upload drive package/i, /save package/i], 'No Save PMR package button was found. Complete client setup and connect Drive first.');
        if (action === 'download') clickButton([/download styled pmr/i, /download pmr/i, /pmr html/i], 'No PMR download button was found. Complete client setup first.');
        if (action === 'print') clickButton([/^print pmr$/i, /print/i], 'No PMR print button was found. Complete client setup first.');
        if (action === 'restore') {
          if (window.THA_PHOTO_STORAGE_GUARD?.restoreNow) window.THA_PHOTO_STORAGE_GUARD.restoreNow().then(schedule);
          else window.alert('Photo restore guard is not available yet.');
        }
      });
    });
  }

  function render() {
    installStyles();
    placePanel();
    wireActions();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      render();
      window.setTimeout(render, 160);
    });
  }

  function start() {
    render();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
    window.addEventListener('storage', schedule);
    window.addEventListener('tha-photo-storage-guard-updated', schedule);
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
    window.setInterval(schedule, 6000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
