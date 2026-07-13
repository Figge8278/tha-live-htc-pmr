(() => {
  const STYLE_ID = 'tha-v35-field-sync-reliability-styles';
  const PANEL_ATTR = 'data-tha-field-sync-panel';
  const WALKTHROUGH_SESSIONS_KEY = 'tha-walkthrough-sessions';
  const CURRENT_WALKTHROUGH_ID_KEY = 'tha-current-walkthrough-id';
  const DRIVE_CLIENT_ID_KEY = 'tha-google-drive-client-id';
  const DRIVE_CLIENT_ID_OVERRIDE_KEY = 'tha-google-drive-client-id-override';
  const LEGACY_GOOGLE_CLIENT_ID_KEY = 'tha-google-client-id';
  const DRIVE_QUEUE_KEY = 'tha-drive-pending-queue';
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
    const currentId = storageValue(CURRENT_WALKTHROUGH_ID_KEY);
    if (currentId && sessions[currentId]) return sessions[currentId];
    const list = Object.values(sessions).filter(Boolean);
    return list.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }

  function asPhotoList(value) {
    return Array.isArray(value?.photos) ? value.photos.filter(Boolean) : [];
  }

  function photoStatus(photo = {}) {
    const status = String(photo.uploadStatus || '').toLowerCase();
    if (status.includes('uploaded') || photo.driveFileId || photo.driveViewLink || photo.webViewLink) return 'uploaded';
    if (status.includes('failed')) return 'failed';
    if (status.includes('pending')) return 'pending';
    return photo.dataUrl ? 'local' : 'metadata';
  }

  function addPhotoStats(stats, photo, roomName = 'Unassigned photos') {
    const status = photoStatus(photo);
    stats.total += 1;
    stats[status] = (stats[status] || 0) + 1;
    if (photo.dataUrl) {
      stats.withDataUrl += 1;
      stats.dataUrlChars += String(photo.dataUrl).length;
    }
    if (photo.thumbnailDataUrl) stats.thumbnailChars += String(photo.thumbnailDataUrl).length;
    const room = roomName || 'Unassigned photos';
    if (!stats.rooms[room]) stats.rooms[room] = { room, total: 0, local: 0, pending: 0, uploaded: 0, failed: 0, metadata: 0, withDataUrl: 0 };
    stats.rooms[room].total += 1;
    stats.rooms[room][status] = (stats.rooms[room][status] || 0) + 1;
    if (photo.dataUrl) stats.rooms[room].withDataUrl += 1;
  }

  function photoStats(data = {}) {
    const stats = { total: 0, local: 0, pending: 0, uploaded: 0, failed: 0, metadata: 0, withDataUrl: 0, dataUrlChars: 0, thumbnailChars: 0, rooms: {} };
    Object.entries(data.roomCapture || {}).forEach(([roomName, capture]) => {
      asPhotoList(capture).forEach(photo => addPhotoStats(stats, photo, roomName));
    });
    Object.values(data.answers || {}).forEach(answer => {
      asPhotoList(answer).forEach(photo => addPhotoStats(stats, photo, 'Checklist item photos'));
    });
    return stats;
  }

  function localStorageSizeKb() {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i) || '';
        total += key.length + String(localStorage.getItem(key) || '').length;
      }
      return Math.round((total * 2) / 1024);
    } catch {
      return null;
    }
  }

  function driveStatusFromDom() {
    const pageText = textOf(document.body).toLowerCase();
    if (/drive connected|ready to export/.test(pageText)) return 'connected';
    if (/drive sync pending|pending photos|drive configured/.test(pageText)) return 'configured';
    if (/drive error|unable to connect google drive/.test(pageText)) return 'error';
    return '';
  }

  function driveInfo() {
    const configured = Boolean(storageValue(DRIVE_CLIENT_ID_KEY) || storageValue(DRIVE_CLIENT_ID_OVERRIDE_KEY) || storageValue(LEGACY_GOOGLE_CLIENT_ID_KEY));
    const meta = readJson(DRIVE_META_KEY, {}) || {};
    const queue = readJson(DRIVE_QUEUE_KEY, []) || [];
    const domState = driveStatusFromDom();
    const connected = domState === 'connected' || Boolean(meta.hasConnected || meta.connected || meta.driveConnected);
    const error = domState === 'error' || Boolean(meta.lastError);
    return { configured: configured || connected || domState === 'configured', connected, error, queueCount: Array.isArray(queue) ? queue.length : Object.keys(queue || {}).length, lastError: meta.lastError || '' };
  }

  function kbFromBase64Chars(chars) {
    return Math.max(0, Math.round((chars * 0.75) / 1024));
  }

  function riskLevel(stats, storageKb) {
    if (stats.failed || storageKb > 4300 || stats.withDataUrl >= 10 || kbFromBase64Chars(stats.dataUrlChars) > 3500) return 'high';
    if (stats.pending || stats.local >= 5 || stats.withDataUrl >= 5 || storageKb > 3000) return 'medium';
    return 'low';
  }

  function summaryMessage({ stats, drive, online, storageKb }) {
    if (!online) return 'Offline field mode: capture stays local. Do not clear browser data. Reconnect, then save the Drive package before relying on this from another device.';
    if (!drive.configured) return 'Drive is not configured yet. You can test locally, but Drive package export will not be dependable until Google Drive is configured and connected.';
    if (!drive.connected) return 'Drive appears configured, but not connected in this browser session. Connect Drive before sending a test package or relying on tablet-to-computer handoff.';
    if (stats.local || stats.pending) return 'Drive is connected. Local or pending photos still need a Drive package save before they are safe for client delivery or cross-device handoff.';
    if (storageKb > 3000) return 'Drive is connected. Local browser storage is getting heavy; save the Drive package and consider starting the next walkthrough clean.';
    return 'Drive looks ready. Download, print, and email-test the PMR package from this connected session.';
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-field-sync-panel{margin:12px 0!important;padding:12px!important;border:1px solid #bdd4e6!important;border-radius:16px!important;background:#f7fbfd!important;color:#173e57!important;box-shadow:inset 5px 0 0 rgba(47,128,237,.24)!important;display:grid!important;gap:10px!important}
      .tha-field-sync-panel.medium{border-color:#f2c094!important;background:#fff9f2!important;box-shadow:inset 5px 0 0 rgba(242,140,40,.34)!important}
      .tha-field-sync-panel.high{border-color:#efb4a9!important;background:#fff7f5!important;box-shadow:inset 5px 0 0 rgba(180,35,24,.28)!important}
      .tha-field-sync-panel header{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:10px!important;flex-wrap:wrap!important}
      .tha-field-sync-panel h3{margin:0!important;font-size:14px!important;line-height:1.25!important;color:#173e57!important}
      .tha-field-sync-panel p{margin:0!important;font-size:12px!important;line-height:1.4!important;color:#4a5f6b!important;font-weight:750!important}
      .tha-field-sync-chip-row{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
      .tha-field-sync-chip{display:inline-flex!important;align-items:center!important;gap:5px!important;border:1px solid #cfe0e8!important;border-radius:999px!important;background:#fff!important;color:#315568!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
      .tha-field-sync-chip.good{border-color:#a8d5a1!important;background:#f2fbf0!important;color:#285c30!important}
      .tha-field-sync-chip.warn{border-color:#f2c094!important;background:#fff4e8!important;color:#a85107!important}
      .tha-field-sync-chip.bad{border-color:#efb4a9!important;background:#fff1f0!important;color:#b42318!important}
      .tha-field-room-list{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))!important;gap:7px!important}
      .tha-field-room-pill{border:1px solid #d9e6ed!important;border-radius:12px!important;background:#fff!important;padding:7px 8px!important;color:#3b5563!important;font-size:11px!important;font-weight:850!important;line-height:1.25!important}
      .tha-field-sync-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important;align-items:center!important}
      .tha-field-sync-actions button{border:1px solid #9fc7ff!important;border-radius:999px!important;background:#fff!important;color:#155799!important;padding:7px 10px!important;font-size:11px!important;font-weight:950!important;cursor:pointer!important}
      .tha-field-sync-footnote{font-size:11px!important;color:#697985!important;font-weight:750!important}
      @media(max-width:720px){.tha-field-sync-panel{padding:10px!important}.tha-field-room-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}.tha-field-sync-chip{font-size:10px!important;padding:5px 7px!important}}
      @media print{.tha-field-sync-panel{display:none!important}}
    `;
    document.head.append(style);
  }

  function chip(label, state = '') {
    return `<span class="tha-field-sync-chip ${state}">${label}</span>`;
  }

  function roomHtml(stats) {
    const rooms = Object.values(stats.rooms).sort((a, b) => b.total - a.total || a.room.localeCompare(b.room)).slice(0, 6);
    if (!rooms.length) return '';
    return `<div class="tha-field-room-list">${rooms.map(room => {
      const flags = [];
      if (room.local) flags.push(`${room.local} local`);
      if (room.pending) flags.push(`${room.pending} pending`);
      if (room.uploaded) flags.push(`${room.uploaded} Drive`);
      if (room.failed) flags.push(`${room.failed} failed`);
      return `<div class="tha-field-room-pill"><strong>${room.room}</strong><br>${room.total} photo${room.total === 1 ? '' : 's'} · ${flags.join(' · ') || 'metadata only'}</div>`;
    }).join('')}</div>`;
  }

  function renderPanel(location) {
    const session = currentSession();
    const data = session?.data || {};
    const stats = photoStats(data);
    const drive = driveInfo();
    const online = navigator.onLine !== false;
    const storageKb = localStorageSizeKb() || 0;
    const risk = riskLevel(stats, storageKb);
    const driveState = drive.error ? 'bad' : drive.connected ? 'good' : drive.configured ? 'warn' : 'bad';
    const photoState = stats.failed ? 'bad' : (stats.local || stats.pending || stats.withDataUrl >= 5) ? 'warn' : 'good';
    const onlineState = online ? 'good' : 'warn';
    const storageState = storageKb > 4300 ? 'bad' : storageKb > 3000 ? 'warn' : 'good';
    return `
      <section class="tha-field-sync-panel ${risk}" ${PANEL_ATTR}="${location}">
        <header>
          <div><h3>${location === 'intake' ? 'Field Sync Readiness' : 'Business Records & Drive Readiness'}</h3><p>${summaryMessage({ stats, drive, online, storageKb })}</p></div>
        </header>
        <div class="tha-field-sync-chip-row">
          ${chip(online ? 'Online' : 'Offline / queued only', onlineState)}
          ${chip(drive.connected ? 'Drive connected' : drive.configured ? 'Drive configured, connect needed' : 'Drive not configured', driveState)}
          ${chip(`${stats.total} photo${stats.total === 1 ? '' : 's'}`, photoState)}
          ${chip(`${stats.local + stats.pending} local/pending`, stats.local || stats.pending ? 'warn' : 'good')}
          ${chip(`${stats.uploaded} on Drive`, stats.uploaded ? 'good' : '')}
          ${chip(`Local storage ~${storageKb} KB`, storageState)}
        </div>
        ${roomHtml(stats)}
        <div class="tha-field-sync-actions"><button type="button" data-tha-sync-open-records>Open records / Drive</button><button type="button" data-tha-sync-open-pmr>Open PMR</button></div>
        <p class="tha-field-sync-footnote">Field rule: when service is available, save the Drive package before relying on another device. When service is unavailable, keep the browser/app data intact until the queued local photos are synced or exported.</p>
      </section>`;
  }

  function placePanel(anchor, location, where = 'after') {
    if (!anchor) return;
    const existing = document.querySelector(`[${PANEL_ATTR}="${location}"]`);
    const html = renderPanel(location);
    if (existing) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      existing.replaceWith(wrapper.firstElementChild);
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const panel = wrapper.firstElementChild;
    if (where === 'prepend') anchor.prepend(panel);
    else anchor.after(panel);
  }

  function wireButtons() {
    document.querySelectorAll('[data-tha-sync-open-records]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        const setupButton = Array.from(document.querySelectorAll('button')).find(btn => /open setup|setup & records|open records/i.test(textOf(btn)));
        setupButton?.click();
        window.setTimeout(() => {
          const recordsButton = Array.from(document.querySelectorAll('button')).find(btn => /open records|connect google drive|save pmr package|save drive package/i.test(textOf(btn)));
          recordsButton?.focus();
        }, 80);
      });
    });
    document.querySelectorAll('[data-tha-sync-open-pmr]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        const pmrTab = Array.from(document.querySelectorAll('button,[role="button"]')).find(btn => /^pmr$/i.test(textOf(btn)) || /open pmr|view pmr/i.test(textOf(btn)));
        pmrTab?.click();
      });
    });
  }

  function render() {
    installStyles();
    const intakeAnchor = document.querySelector('.homeownerLane .laneHeader,.intakeLane .laneHeader,.homeownerLane h2,.intakeLane h2');
    placePanel(intakeAnchor, 'intake', 'after');
    const recordsHeader = document.querySelector('.walkthroughControlsPanel .businessRecordsCard .driveSetupHeader');
    placePanel(recordsHeader, 'records', 'after');
    wireButtons();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      render();
      window.setTimeout(render, 180);
    });
  }

  function start() {
    render();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
    window.addEventListener('storage', schedule);
    window.addEventListener('online', schedule);
    window.addEventListener('offline', schedule);
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
    window.setInterval(schedule, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();