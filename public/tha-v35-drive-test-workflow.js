(() => {
  const STYLE_ID = 'tha-v35-drive-test-workflow-styles';
  const PANEL_ATTR = 'data-tha-drive-test-workflow';
  const WALKTHROUGH_SESSIONS_KEY = 'tha-walkthrough-sessions';
  const CURRENT_WALKTHROUGH_ID_KEY = 'tha-current-walkthrough-id';
  const PHOTO_GUARD_STATUS_KEY = 'tha-photo-storage-guard-status-v1';
  const DRIVE_CLIENT_ID_KEY = 'tha-google-drive-client-id';
  const DRIVE_CLIENT_ID_OVERRIDE_KEY = 'tha-google-drive-client-id-override';
  const LEGACY_GOOGLE_CLIENT_ID_KEY = 'tha-google-client-id';
  const DRIVE_META_KEY = 'tha-drive-meta';

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

  function storageValue(key) {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function currentSession() {
    const sessions = readJson(WALKTHROUGH_SESSIONS_KEY, {}) || {};
    const id = storageValue(CURRENT_WALKTHROUGH_ID_KEY) || '';
    if (id && sessions[id]) return sessions[id];
    return Object.values(sessions).filter(Boolean).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }

  function photoList(value) {
    return Array.isArray(value?.photos) ? value.photos.filter(Boolean) : [];
  }

  function driveDomText() {
    return textOf(document.body).toLowerCase();
  }

  function driveState() {
    const text = driveDomText();
    const configuredByLocal = Boolean(storageValue(DRIVE_CLIENT_ID_KEY) || storageValue(DRIVE_CLIENT_ID_OVERRIDE_KEY) || storageValue(LEGACY_GOOGLE_CLIENT_ID_KEY));
    const meta = readJson(DRIVE_META_KEY, {}) || {};
    const connected = /drive connected|ready to export/.test(text) || Boolean(meta.hasConnected || meta.connected || meta.driveConnected);
    const configured = connected || configuredByLocal || /drive configured/.test(text);
    const error = /drive error|unable to connect google drive/.test(text) || Boolean(meta.lastError);
    const notConfigured = !configured && /drive not configured|google drive setup required|missing google oauth client/i.test(text);
    return {
      configured,
      connected,
      error,
      notConfigured,
      lastError: meta.lastError || '',
      source: connected ? 'Connected session' : configuredByLocal ? 'Saved/fallback Client ID' : configured ? 'App/environment Client ID likely present' : 'No Client ID detected yet'
    };
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
      guard: readJson(PHOTO_GUARD_STATUS_KEY, { state: 'unknown', message: 'Photo storage guard status unavailable.' }),
      drive: driveState()
    };
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-drive-test-panel{margin:14px 0!important;padding:14px!important;border:1px solid #8ac6cf!important;border-radius:18px!important;background:#f3fcfd!important;color:#123e48!important;box-shadow:inset 6px 0 0 rgba(0,128,148,.28)!important;display:grid!important;gap:12px!important}
      .tha-drive-test-panel.needs-setup{border-color:#efb4a9!important;background:#fff7f5!important;box-shadow:inset 6px 0 0 rgba(180,35,24,.28)!important}
      .tha-drive-test-panel.needs-connect{border-color:#f2c094!important;background:#fff9f2!important;box-shadow:inset 6px 0 0 rgba(242,140,40,.34)!important}
      .tha-drive-test-panel.ready{border-color:#9ecf93!important;background:#f4fbf1!important;box-shadow:inset 6px 0 0 rgba(82,170,75,.28)!important}
      .tha-drive-test-panel h3{margin:0!important;font-size:15px!important;color:#0f4f5b!important;line-height:1.25!important}
      .tha-drive-test-panel p{margin:0!important;font-size:12px!important;line-height:1.4!important;color:#405b63!important;font-weight:760!important}
      .tha-drive-test-grid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(220px,.8fr)!important;gap:12px!important;align-items:start!important}
      .tha-drive-test-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}
      .tha-drive-test-actions button{border:1px solid #61a9b5!important;border-radius:999px!important;background:#fff!important;color:#075564!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-drive-test-actions button.primary{background:#07859a!important;color:#fff!important;border-color:#07859a!important}
      .tha-drive-test-stats{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
      .tha-drive-test-chip{display:inline-flex!important;border:1px solid #b7dce2!important;border-radius:999px!important;background:#fff!important;color:#075564!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
      .tha-drive-test-chip.good{border-color:#a8d5a1!important;background:#f2fbf0!important;color:#285c30!important}
      .tha-drive-test-chip.warn{border-color:#f2c094!important;background:#fff4e8!important;color:#a85107!important}
      .tha-drive-test-chip.bad{border-color:#efb4a9!important;background:#fff1f0!important;color:#b42318!important}
      .tha-drive-tree{border:1px solid #c7e2e6!important;border-radius:14px!important;background:#fff!important;padding:10px 12px!important;font-size:12px!important;line-height:1.45!important;color:#284b55!important;font-weight:800!important}
      .tha-drive-tree ul{margin:5px 0 0 18px!important;padding:0!important}
      .tha-drive-tree li{margin:2px 0!important}
      .tha-drive-test-note{border:1px dashed #9fcfd7!important;border-radius:12px!important;background:#fff!important;padding:9px 10px!important;color:#3c5c64!important;font-size:12px!important;font-weight:820!important}
      .tha-drive-setup-box{border:1px solid #f0c5bc!important;border-radius:14px!important;background:#fff!important;padding:10px 12px!important;color:#65433e!important;display:grid!important;gap:6px!important;font-size:12px!important;font-weight:820!important;line-height:1.35!important}
      .tha-drive-setup-box strong{color:#b42318!important}
      .tha-drive-setup-box code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;background:#fff4f1!important;border:1px solid #f0c5bc!important;border-radius:6px!important;padding:2px 4px!important}
      @media(max-width:760px){.tha-drive-test-grid{grid-template-columns:1fr!important}.tha-drive-test-actions button{font-size:11px!important;padding:7px 9px!important}}
      @media print{.tha-drive-test-panel{display:none!important}}
    `;
    document.head.append(style);
  }

  function chip(label, state = '') {
    return `<span class="tha-drive-test-chip ${state}">${label}</span>`;
  }

  function panelTone(drive) {
    if (drive.connected) return 'ready';
    if (drive.configured) return 'needs-connect';
    return 'needs-setup';
  }

  function setupBox(drive) {
    if (drive.connected) return `<p class="tha-drive-test-note">Drive is connected for this browser session. Next: sync pending photos, save the PMR package, then open Google Drive to confirm the file tree.</p>`;
    if (drive.configured) return `<p class="tha-drive-test-note">Drive appears configured, but this browser session still needs authorization. Use <strong>Connect Drive</strong>, then save the package.</p>`;
    return `<div class="tha-drive-setup-box"><strong>Drive setup is the likely blocker.</strong><span>Add a Google OAuth Web Client ID to Vercel as <code>VITE_GOOGLE_OAUTH_CLIENT_ID</code>, or paste the fallback Client ID inside Business Records & Drive. The OAuth client also needs this deployed app URL listed as an authorized JavaScript origin.</span><span>After that: redeploy, open this build, and use Connect Drive.</span></div>`;
  }

  function renderPanel() {
    const stats = walkStats();
    const clientName = stats.client.name || 'Client Name';
    const address = stats.client.address || 'Project Address';
    const drive = stats.drive;
    return `
      <section class="tha-drive-test-panel ${panelTone(drive)}" ${PANEL_ATTR}="true">
        <header>
          <h3>Drive Package Test Workflow</h3>
          <p>Use this to prove the full path: connect Drive, sync photos, save the PMR package, download/print it, and confirm what the client-facing packet looks like.</p>
        </header>
        <div class="tha-drive-test-stats">
          ${chip(drive.connected ? 'Drive connected' : drive.configured ? 'Drive configured — connect needed' : 'Drive setup needed', drive.connected ? 'good' : drive.configured ? 'warn' : 'bad')}
          ${chip(drive.source, drive.connected ? 'good' : drive.configured ? 'warn' : 'bad')}
          ${chip(`${stats.total} photos`)}
          ${chip(`${stats.localPending} local/pending`, stats.localPending ? 'warn' : 'good')}
          ${chip(`${stats.uploaded} on Drive`, stats.uploaded ? 'good' : '')}
          ${chip(`${stats.fullData} full payloads active`)}
          ${chip(`Photo guard: ${stats.guard.state || 'unknown'}`, stats.guard.state === 'error' ? 'bad' : stats.guard.state === 'slimmed' || stats.guard.state === 'restored' ? 'good' : '')}
        </div>
        ${setupBox(drive)}
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

  function wireActions() {
    document.querySelectorAll('[data-tha-drive-click]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-tha-drive-click');
        if (action === 'connect') clickButton([/connect google drive/i, /^connect drive$/i, /reconnect drive/i], 'Open Business Records & Drive, then use Connect Google Drive. If no connect option appears, add VITE_GOOGLE_OAUTH_CLIENT_ID in Vercel or paste the fallback Client ID in Drive setup.');
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