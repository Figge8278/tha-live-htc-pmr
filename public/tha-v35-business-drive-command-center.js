(() => {
  const STYLE_ID = 'tha-v35-business-drive-command-center-styles';
  const PANEL_ATTR = 'data-tha-business-drive-command-center';
  const ROOT_KEY = 'tha-drive-root-folder-id';
  const ROOT_LABEL_KEY = 'tha-drive-root-folder-label';
  const DESTINATION_KEY = 'tha-drive-upload-destination';
  const SUBMITTED_BY_KEY = 'tha-drive-submitted-by';
  const DRIVE_META_KEY = 'tha-drive-meta';
  const PHOTO_GUARD_STATUS_KEY = 'tha-photo-storage-guard-status-v1';

  const DESTINATIONS = [
    ['incoming', 'Incoming Field Upload', 'Default buffer before review'],
    ['demo', 'Demo / Sandbox Upload', 'Testing only, no client record'],
    ['review', 'Review / Ready to File', 'Ready for Figge review'],
    ['final', 'Final Client Package', 'Use after review / Airtable link']
  ];

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

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

  function storageValue(key, fallback = '') {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Field helper only.
    }
  }

  function driveConnected() {
    const text = textOf(document.body).toLowerCase();
    const meta = readJson(DRIVE_META_KEY, {}) || {};
    return /drive connected|ready to export|google drive is connected/.test(text) || Boolean(meta.hasConnected || meta.connected || meta.driveConnected);
  }

  function photoGuardState() {
    return readJson(PHOTO_GUARD_STATUS_KEY, { state: 'unknown' })?.state || 'unknown';
  }

  function rootState() {
    const id = storageValue(ROOT_KEY).trim();
    return {
      ready: Boolean(id),
      id,
      label: storageValue(ROOT_LABEL_KEY, 'THA App Uploads')
    };
  }

  function destination() {
    const value = storageValue(DESTINATION_KEY, 'incoming');
    return DESTINATIONS.some(([id]) => id === value) ? value : 'incoming';
  }

  function submittedBy() {
    return storageValue(SUBMITTED_BY_KEY, 'Figge').trim() || 'Figge';
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

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-business-drive-command{margin:14px 0!important;padding:16px!important;border:1px solid #f1c27b!important;border-radius:20px!important;background:#fffaf2!important;color:#3f2b10!important;box-shadow:inset 7px 0 0 rgba(242,140,40,.5),0 8px 20px rgba(84,55,16,.08)!important;display:grid!important;gap:13px!important}
      .tha-business-drive-command.ready{border-color:#9fcf99!important;background:#f5fbf2!important;box-shadow:inset 7px 0 0 rgba(72,164,72,.48),0 8px 20px rgba(31,84,31,.08)!important;color:#173c1d!important}
      .tha-business-drive-command h3{margin:0!important;font-size:18px!important;line-height:1.18!important;color:#173e57!important}
      .tha-business-drive-command p{margin:0!important;font-size:13px!important;line-height:1.43!important;color:#4b5e66!important;font-weight:790!important}
      .tha-command-header{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:flex-start!important;flex-wrap:wrap!important}
      .tha-command-steps{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important;gap:9px!important}
      .tha-command-step{border:1px solid #edd2ab!important;border-radius:16px!important;background:#fff!important;padding:11px!important;display:grid!important;gap:6px!important;min-height:96px!important}
      .tha-command-step.good{border-color:#b7d9ae!important;background:#f8fff6!important}
      .tha-command-step.warn{border-color:#f0bd82!important;background:#fff8ee!important}
      .tha-command-step strong{font-size:13px!important;color:#173e57!important}
      .tha-command-step span{font-size:12px!important;color:#546873!important;font-weight:780!important;line-height:1.36!important}
      .tha-command-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}
      .tha-command-actions button{border:1px solid #d78b2b!important;border-radius:999px!important;background:#fff!important;color:#8a4b08!important;padding:9px 12px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-command-actions button.primary{background:#d97706!important;border-color:#d97706!important;color:#fff!important;box-shadow:0 0 0 4px rgba(217,119,6,.16)!important}
      .tha-business-drive-command.ready .tha-command-actions button.primary{background:#23884c!important;border-color:#23884c!important;box-shadow:0 0 0 4px rgba(35,136,76,.14)!important}
      .tha-command-fields{display:grid!important;grid-template-columns:minmax(170px,.7fr) minmax(220px,1fr) minmax(220px,1fr)!important;gap:9px!important;align-items:end!important}
      .tha-command-fields label{display:grid!important;gap:4px!important;color:#315568!important;font-size:11px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.03em!important}
      .tha-command-fields input,.tha-command-fields select{width:100%!important;border:1px solid #d6e1e7!important;border-radius:12px!important;background:#fff!important;color:#243d49!important;padding:9px!important;font-size:12px!important;font-weight:850!important}
      .tha-command-chipline{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
      .tha-command-chip{display:inline-flex!important;align-items:center!important;border:1px solid #d7e3ea!important;border-radius:999px!important;background:#fff!important;color:#315568!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
      .tha-command-chip.good{border-color:#abd6a3!important;background:#f3fbf0!important;color:#285c30!important}
      .tha-command-chip.warn{border-color:#f0bd82!important;background:#fff4e6!important;color:#8a4b08!important}
      .tha-command-chip.bad{border-color:#efb4a9!important;background:#fff1f0!important;color:#b42318!important}
      .tha-command-roadmap{border:1px dashed #cddfea!important;border-radius:14px!important;background:#fff!important;padding:10px 12px!important;color:#3f5d69!important;font-size:12px!important;font-weight:820!important;line-height:1.4!important}
      .tha-command-roadmap ol{margin:6px 0 0 20px!important;padding:0!important}.tha-command-roadmap li{margin:3px 0!important}
      .tha-drive-advanced-wrap{margin:10px 0!important;border:1px solid #d8e4ea!important;border-radius:18px!important;background:#fbfdfe!important;padding:10px!important}
      .tha-drive-advanced-wrap>summary{cursor:pointer!important;font-size:13px!important;font-weight:950!important;color:#315568!important}
      .tha-drive-advanced-wrap .tha-drive-advanced-body{margin-top:10px!important;display:grid!important;gap:10px!important}
      .tha-drive-advanced-hidden{display:none!important}
      @media(max-width:820px){.tha-command-fields{grid-template-columns:1fr!important}.tha-command-actions button{width:100%!important}}
      @media print{.tha-business-drive-command,.tha-drive-advanced-wrap{display:none!important}}
    `;
    document.head.append(style);
  }

  function commandHtml() {
    const root = rootState();
    const connected = driveConnected();
    const dest = destination();
    const submitter = submittedBy();
    const readyClass = connected ? 'ready' : '';
    const rootLabel = root.ready ? root.label : 'Not set yet';
    const destLabel = DESTINATIONS.find(([id]) => id === dest)?.[1] || 'Incoming Field Upload';
    return `
      <section class="tha-business-drive-command ${readyClass}" ${PANEL_ATTR}="true">
        <div class="tha-command-header">
          <div>
            <h3>Business Records & Drive — Start Here</h3>
            <p>Use this one panel first. It controls who is submitting, where the package lands, and the Drive actions needed for field work.</p>
          </div>
          <div class="tha-command-chipline">
            <span class="tha-command-chip ${connected ? 'good' : 'warn'}">${connected ? 'Drive connected' : 'Drive not connected'}</span>
            <span class="tha-command-chip ${root.ready ? 'good' : 'warn'}">${root.ready ? 'Shared target set' : 'Shared target needed'}</span>
            <span class="tha-command-chip">${escapeHtml(destLabel)}</span>
          </div>
        </div>
        <div class="tha-command-steps">
          <div class="tha-command-step ${submitter ? 'good' : 'warn'}"><strong>1. Who is submitting?</strong><span>${escapeHtml(submitter)}. Use Figge, Rick, Subcontractor name, or Demo Tester.</span></div>
          <div class="tha-command-step ${root.ready ? 'good' : 'warn'}"><strong>2. Where will it land?</strong><span>${escapeHtml(rootLabel)} → ${escapeHtml(destLabel)}. Default should stay Incoming until reviewed.</span></div>
          <div class="tha-command-step ${connected ? 'good' : 'warn'}"><strong>3. Is Drive connected?</strong><span>${connected ? 'Connected. Sync photos and save the PMR package.' : 'Not yet. Use the orange Connect Google Drive button.'}</span></div>
          <div class="tha-command-step warn"><strong>4. What happens after upload?</strong><span>Review the incoming package, then move/promote the approved folder to the Airtable-linked final client folder.</span></div>
        </div>
        <div class="tha-command-fields">
          <label>Submitted By<input type="text" data-tha-command-submitted-by value="${escapeHtml(submitter)}" placeholder="Figge, Rick, Luis, Demo Tester"></label>
          <label>Upload Destination<select data-tha-command-destination>${DESTINATIONS.map(([id, label, hint]) => `<option value="${id}" ${id === dest ? 'selected' : ''}>${label} — ${hint}</option>`).join('')}</select></label>
          <label>THA Root Folder ID<input type="text" data-tha-command-root-id value="${escapeHtml(root.id)}" placeholder="Paste Drive folder ID when ready"></label>
        </div>
        <div class="tha-command-actions">
          <button type="button" data-tha-command-save-settings>Save these settings</button>
          <button type="button" class="primary" data-tha-command-action="connect">Connect Google Drive</button>
          <button type="button" data-tha-command-action="sync">Sync pending photos</button>
          <button type="button" class="primary" data-tha-command-action="save">Save PMR package</button>
          <button type="button" data-tha-command-action="demo">Load Client Delivery Demo</button>
        </div>
        <div class="tha-command-roadmap"><strong>Roadmap:</strong><ol><li>Incoming / Demo uploads are the buffer.</li><li>Figge reviews and cleans the package.</li><li>Approved package moves to the final client folder.</li><li>Airtable links to the final reviewed folder, not raw field uploads.</li></ol></div>
      </section>`;
  }

  function anchorElement() {
    return document.querySelector('.walkthroughControlsPanel .businessRecordsCard')
      || document.querySelector('.walkthroughControlsPanel')
      || document.querySelector('[data-tha-drive-test-workflow]')
      || document.querySelector('main');
  }

  function placeCommand() {
    const anchor = anchorElement();
    if (!anchor) return;
    const existing = document.querySelector(`[${PANEL_ATTR}]`);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = commandHtml();
    const panel = wrapper.firstElementChild;
    if (existing) existing.replaceWith(panel);
    else anchor.prepend ? anchor.prepend(panel) : anchor.insertBefore(panel, anchor.firstChild);
  }

  function collectAdvancedPanels() {
    return [
      document.querySelector('[data-tha-drive-test-workflow]'),
      document.querySelector('[data-tha-shared-drive-admin]'),
      document.querySelector('[data-tha-production-readiness]')
    ].filter(Boolean);
  }

  function tuckAdvancedPanels() {
    const panels = collectAdvancedPanels().filter(panel => !panel.closest('.tha-drive-advanced-wrap'));
    if (!panels.length) return;
    let details = document.querySelector('.tha-drive-advanced-wrap');
    if (!details) {
      details = document.createElement('details');
      details.className = 'tha-drive-advanced-wrap';
      details.innerHTML = '<summary>Advanced / Admin Details</summary><div class="tha-drive-advanced-body"></div>';
      const command = document.querySelector(`[${PANEL_ATTR}]`);
      if (command) command.after(details);
      else anchorElement()?.append(details);
    }
    const body = details.querySelector('.tha-drive-advanced-body');
    panels.forEach(panel => body.append(panel));
  }

  function hideDuplicateReadinessPanels() {
    Array.from(document.querySelectorAll('*')).forEach(element => {
      const text = textOf(element);
      const cls = String(element.className || '');
      if (/Business Records & Drive Readiness/i.test(text) && /panel|card|readiness|sync|field/i.test(cls)) {
        if (!element.closest(`[${PANEL_ATTR}]`) && !element.closest('.tha-drive-advanced-wrap')) element.classList.add('tha-drive-advanced-hidden');
      }
    });
  }

  function saveSettings() {
    const submitter = document.querySelector('[data-tha-command-submitted-by]')?.value?.trim() || 'Figge';
    const dest = document.querySelector('[data-tha-command-destination]')?.value || 'incoming';
    const rootId = document.querySelector('[data-tha-command-root-id]')?.value?.trim() || '';
    setStorage(SUBMITTED_BY_KEY, submitter);
    setStorage(DESTINATION_KEY, dest);
    if (rootId) {
      setStorage(ROOT_KEY, rootId);
      if (!storageValue(ROOT_LABEL_KEY)) setStorage(ROOT_LABEL_KEY, 'THA App Uploads');
      window.THA_DRIVE_ROOT?.setRootId?.(rootId, storageValue(ROOT_LABEL_KEY, 'THA App Uploads'));
    }
    window.dispatchEvent(new Event('tha-drive-root-updated'));
    schedule();
  }

  function wire() {
    document.querySelectorAll('[data-tha-command-save-settings]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveSettings();
        window.alert('Business Records & Drive settings saved.');
      });
    });
    document.querySelectorAll('[data-tha-command-action]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveSettings();
        const action = button.getAttribute('data-tha-command-action');
        if (action === 'connect') clickButton([/connect google drive/i, /^connect drive$/i, /reconnect drive/i], 'Use the native Connect Google Drive button in Business Records & Drive. If Google blocks it, open Advanced / Admin Details.');
        if (action === 'sync') clickButton([/sync pending photos/i, /sync photos/i], 'No Sync pending photos button was found. Connect Drive first.');
        if (action === 'save') clickButton([/save pmr package/i, /save drive package/i, /upload drive package/i, /save package/i], 'No Save PMR package button was found. Complete client setup and connect Drive first.');
        if (action === 'demo') clickButton([/load client delivery demo/i], 'No Client Delivery Demo loader was found.');
      });
    });
  }

  function render() {
    installStyles();
    placeCommand();
    tuckAdvancedPanels();
    hideDuplicateReadinessPanels();
    wire();
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
    window.addEventListener('tha-drive-root-updated', schedule);
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
    window.setInterval(schedule, 6000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();