(() => {
  const STYLE_ID = 'tha-v35-business-drive-command-center-styles';
  const PANEL_ATTR = 'data-tha-business-drive-command-center';
  const ROOT_KEY = 'tha-drive-root-folder-id';
  const ROOT_LABEL_KEY = 'tha-drive-root-folder-label';
  const DESTINATION_KEY = 'tha-drive-upload-destination';
  const SUBMITTED_BY_KEY = 'tha-drive-submitted-by';
  const ROLE_KEY = 'tha-drive-user-role';
  const DRIVE_META_KEY = 'tha-drive-meta';
  const PHOTO_GUARD_STATUS_KEY = 'tha-photo-storage-guard-status-v1';

  const DESTINATIONS = [
    ['incoming', 'Incoming Field Upload', 'Default: raw field upload before Figge review'],
    ['review', 'Review / Ready to File', 'Figge has reviewed and it is ready to move'],
    ['final', 'Final Client Package', 'Use only after review and client-folder decision']
  ];

  const ROLES = [
    ['admin', 'Figge / Admin', 'incoming'],
    ['trusted', 'Trusted helper', 'incoming'],
    ['subcontractor', 'Subcontractor', 'incoming']
  ];

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  }

  function storageValue(key, fallback = '') {
    try { return localStorage.getItem(key) || fallback; }
    catch { return fallback; }
  }

  function setStorage(key, value) {
    try { localStorage.setItem(key, value); }
    catch { /* Field helper only. */ }
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
    return { ready: Boolean(id), id, label: storageValue(ROOT_LABEL_KEY, 'THA app - Clients') };
  }

  function role() {
    const value = storageValue(ROLE_KEY, 'admin');
    return ROLES.some(([id]) => id === value) ? value : 'admin';
  }

  function destination() {
    const value = storageValue(DESTINATION_KEY, 'incoming');
    return DESTINATIONS.some(([id]) => id === value) ? value : 'incoming';
  }

  function submittedBy() {
    return storageValue(SUBMITTED_BY_KEY, 'Figge').trim() || 'Figge';
  }

  function destinationLabel(id = destination()) {
    return DESTINATIONS.find(([key]) => key === id)?.[1] || 'Incoming Field Upload';
  }

  function roleLabel(id = role()) {
    return ROLES.find(([key]) => key === id)?.[1] || 'Figge / Admin';
  }

  function recommendedDestinationForRole(nextRole) {
    return ROLES.find(([id]) => id === nextRole)?.[2] || 'incoming';
  }

  function findButton(patterns) {
    const buttons = Array.from(document.querySelectorAll('button,[role="button"],a'));
    return buttons.find(button => {
      if (button.closest(`[${PANEL_ATTR}]`)) return false;
      return patterns.some(pattern => pattern.test(textOf(button)));
    }) || null;
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
    const old = document.getElementById(STYLE_ID);
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .businessRecordsCard .driveSetupGrid,.businessRecordsCard .driveMetaRow{display:none!important}
      .businessRecordsCard .driveSetupActions{display:none!important}
      .tha-business-drive-command{margin:12px 0 0!important;padding:14px!important;border:1px solid #d8e4ea!important;border-radius:18px!important;background:#fbfdfe!important;color:#173e57!important;display:grid!important;gap:12px!important;box-shadow:none!important}
      .tha-business-drive-command h4{margin:0!important;font-size:16px!important;color:#173e57!important;line-height:1.2!important}.tha-business-drive-command p{margin:0!important;font-size:12px!important;line-height:1.4!important;color:#536b76!important;font-weight:800!important}
      .tha-drive-substep-list{display:grid!important;gap:10px!important}.tha-drive-substep{border:1px solid #d8e4ea!important;border-radius:15px!important;background:#fff!important;padding:11px!important;display:grid!important;gap:8px!important}.tha-drive-substep.good{border-color:#b8d8b2!important;background:#f8fff6!important}.tha-drive-substep.warn{border-color:#efc17f!important;background:#fff9ef!important}.tha-drive-substep.bad{border-color:#edb4a9!important;background:#fff5f3!important}
      .tha-drive-substep-head{display:flex!important;gap:8px!important;align-items:flex-start!important}.tha-drive-step-num{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:34px!important;height:28px!important;border-radius:999px!important;background:#0b3658!important;color:#fff!important;font-size:12px!important;font-weight:1000!important}.tha-drive-substep.good .tha-drive-step-num{background:#23884c!important}.tha-drive-substep.warn .tha-drive-step-num{background:#d97706!important}.tha-drive-substep.bad .tha-drive-step-num{background:#b42318!important}.tha-drive-substep h5{margin:0!important;font-size:14px!important;color:#173e57!important;line-height:1.25!important}.tha-drive-substep small{display:block!important;margin-top:3px!important;color:#657983!important;font-size:11px!important;font-weight:790!important;line-height:1.35!important}
      .tha-drive-fields{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}.tha-drive-fields label{display:grid!important;gap:4px!important;color:#315568!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.03em!important}.tha-drive-fields input,.tha-drive-fields select{width:100%!important;border:1px solid #d6e1e7!important;border-radius:10px!important;background:#fff!important;color:#243d49!important;padding:8px!important;font-size:12px!important;font-weight:850!important}
      .tha-drive-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important}.tha-drive-actions button{border:1px solid #b7c7d0!important;border-radius:999px!important;background:#fff!important;color:#173e57!important;padding:8px 10px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}.tha-drive-actions button.primary{background:#0b3658!important;border-color:#0b3658!important;color:#fff!important}.tha-drive-actions button.green{background:#23884c!important;border-color:#23884c!important;color:#fff!important}.tha-drive-actions button:disabled{opacity:.55!important;cursor:not-allowed!important}
      .tha-drive-chipline{display:flex!important;flex-wrap:wrap!important;gap:6px!important}.tha-drive-chip{border:1px solid #d7e3ea!important;border-radius:999px!important;background:#fff!important;color:#315568!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important}.tha-drive-chip.good{border-color:#abd6a3!important;background:#f3fbf0!important;color:#285c30!important}.tha-drive-chip.warn{border-color:#f0bd82!important;background:#fff4e6!important;color:#8a4b08!important}.tha-drive-chip.bad{border-color:#efb4a9!important;background:#fff1f0!important;color:#b42318!important}
      .tha-drive-admin-note{border:1px dashed #cddfea!important;border-radius:12px!important;background:#fff!important;padding:9px!important}.tha-drive-admin-note summary{cursor:pointer!important;font-size:12px!important;font-weight:950!important;color:#315568!important}.tha-drive-admin-fields{display:grid!important;grid-template-columns:minmax(210px,1fr) minmax(160px,.6fr) auto!important;gap:8px!important;align-items:end!important;margin-top:9px!important}.tha-drive-admin-fields label{display:grid!important;gap:4px!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;color:#315568!important}.tha-drive-admin-fields input{border:1px solid #d6e1e7!important;border-radius:10px!important;padding:8px!important;font-size:12px!important;font-weight:850!important}
      .tha-drive-normal-flow{border:1px solid #d8e4ea!important;border-radius:12px!important;background:#fff!important;padding:9px!important;color:#536b76!important;font-size:12px!important;font-weight:800!important;line-height:1.4!important}.tha-drive-normal-flow strong{color:#173e57!important}
      .tha-drive-advanced-wrap{margin:10px 0!important;border:1px solid #d8e4ea!important;border-radius:18px!important;background:#fbfdfe!important;padding:10px!important}.tha-drive-advanced-wrap>summary{cursor:pointer!important;font-size:13px!important;font-weight:950!important;color:#315568!important}.tha-drive-advanced-wrap .tha-drive-advanced-body{margin-top:10px!important;display:grid!important;gap:10px!important}.tha-drive-advanced-hidden{display:none!important}.tha-secondary-demo-tool{display:none!important}.tha-demo-cleanup-note{display:none!important}
      @media(max-width:980px){.tha-drive-fields,.tha-drive-admin-fields{grid-template-columns:1fr!important}.tha-drive-actions button{width:100%!important;justify-content:center}}
      @media print{.tha-business-drive-command,.tha-drive-advanced-wrap{display:none!important}}
    `;
    document.head.append(style);
  }

  function commandHtml() {
    const root = rootState();
    const connected = driveConnected();
    const currentRole = role();
    const dest = destination();
    const submitter = submittedBy();
    const photoState = photoGuardState();
    const folderStatus = root.ready ? `Folder set: ${root.label}` : 'Folder not set yet';
    const connectStatus = connected ? 'Drive connected' : 'Drive not connected';
    return `
      <section class="tha-business-drive-command" ${PANEL_ATTR}="true">
        <div>
          <h4>Do #4 in this order</h4>
          <p>This section is for the internal business package: intake copy, HTC copy, PMR package, photos, and backup data. Homeowner-facing PMR download/print stays on the PMR screen.</p>
        </div>
        <div class="tha-drive-chipline">
          <span class="tha-drive-chip ${root.ready ? 'good' : 'bad'}">${escapeHtml(folderStatus)}</span>
          <span class="tha-drive-chip ${connected ? 'good' : 'warn'}">${escapeHtml(connectStatus)}</span>
          <span class="tha-drive-chip">Upload lane: ${escapeHtml(destinationLabel(dest))}</span>
          <span class="tha-drive-chip">Photos: ${escapeHtml(photoState)}</span>
        </div>
        <div class="tha-drive-substep-list">
          <article class="tha-drive-substep ${submitter ? 'good' : 'warn'}">
            <div class="tha-drive-substep-head"><span class="tha-drive-step-num">4A</span><div><h5>Confirm who is submitting</h5><small>This creates the uploader lane inside THA app - Clients.</small></div></div>
            <div class="tha-drive-fields">
              <label>Role<select data-tha-command-role>${ROLES.map(([id, label]) => `<option value="${id}" ${id === currentRole ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
              <label>Submitted By<input type="text" data-tha-command-submitted-by value="${escapeHtml(submitter)}" placeholder="Figge, Rick, Luis"></label>
              <label>Upload Lane<select data-tha-command-destination>${DESTINATIONS.map(([id, label]) => `<option value="${id}" ${id === dest ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
            </div>
            <div class="tha-drive-actions"><button type="button" data-tha-command-save-settings>Save uploader/lane</button></div>
          </article>
          <article class="tha-drive-substep ${root.ready ? 'good' : 'bad'}">
            <div class="tha-drive-substep-head"><span class="tha-drive-step-num">4B</span><div><h5>Confirm THA app - Clients folder</h5><small>Admin setup only. Field users should not need to change this once saved.</small></div></div>
            <details class="tha-drive-admin-note"><summary>${root.ready ? 'Folder is set — show admin fields' : 'Set folder now'}</summary><div class="tha-drive-admin-fields"><label>THA Root Folder ID<input type="text" data-tha-command-root-id value="${escapeHtml(root.id)}" placeholder="Paste Drive folder ID"></label><label>Root Label<input type="text" data-tha-command-root-label value="${escapeHtml(root.label || 'THA app - Clients')}" placeholder="THA app - Clients"></label><button type="button" class="primary" data-tha-command-save-admin>Save folder</button></div></details>
          </article>
          <article class="tha-drive-substep ${!root.ready ? 'bad' : connected ? 'good' : 'warn'}">
            <div class="tha-drive-substep-head"><span class="tha-drive-step-num">4C</span><div><h5>Connect Google Drive</h5><small>Use the same Google account that has permission to the THA app - Clients folder.</small></div></div>
            <div class="tha-drive-actions"><button type="button" class="primary" data-tha-command-action="connect">${connected ? 'Drive connected' : 'Connect Google Drive'}</button></div>
          </article>
          <article class="tha-drive-substep ${connected ? 'warn' : 'bad'}">
            <div class="tha-drive-substep-head"><span class="tha-drive-step-num">4D</span><div><h5>Sync photos, then save package</h5><small>Save only after client setup is filled in and Drive is connected.</small></div></div>
            <div class="tha-drive-actions"><button type="button" data-tha-command-action="sync">Sync pending photos</button><button type="button" class="green" data-tha-command-action="save">Save Drive package</button></div>
          </article>
        </div>
        <p class="tha-drive-normal-flow"><strong>Normal folder flow:</strong> field upload → Incoming Field Upload → Figge review → move approved folder into the final admin client folder → Airtable links to the final reviewed folder.</p>
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
    else {
      const header = anchor.querySelector?.('.driveSetupHeader');
      if (header) header.after(panel);
      else anchor.prepend ? anchor.prepend(panel) : anchor.insertBefore(panel, anchor.firstChild);
    }
  }

  function collectAdvancedPanels() {
    return [
      document.querySelector('[data-tha-drive-test-workflow]'),
      document.querySelector('[data-tha-shared-drive-admin]'),
      document.querySelector('[data-tha-production-readiness]'),
      document.querySelector('[data-tha-client-delivery-demo]')
    ].filter(Boolean);
  }

  function tuckAdvancedPanels() {
    const panels = collectAdvancedPanels().filter(panel => !panel.closest('.tha-drive-advanced-wrap'));
    if (!panels.length) return;
    let details = document.querySelector('.tha-drive-advanced-wrap');
    if (!details) {
      details = document.createElement('details');
      details.className = 'tha-drive-advanced-wrap';
      details.innerHTML = '<summary>Advanced / Testing Tools</summary><div class="tha-drive-advanced-body"></div>';
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

  function saveLaneSettings() {
    const nextRole = document.querySelector('[data-tha-command-role]')?.value || role();
    const submitter = document.querySelector('[data-tha-command-submitted-by]')?.value?.trim() || submittedBy();
    const dest = document.querySelector('[data-tha-command-destination]')?.value || destination();
    setStorage(ROLE_KEY, nextRole);
    setStorage(SUBMITTED_BY_KEY, submitter);
    setStorage(DESTINATION_KEY, dest);
    window.dispatchEvent(new Event('tha-drive-root-updated'));
    schedule();
  }

  function saveAdminSettings() {
    const rootId = document.querySelector('[data-tha-command-root-id]')?.value?.trim() || '';
    const label = document.querySelector('[data-tha-command-root-label]')?.value?.trim() || 'THA app - Clients';
    if (!rootId) {
      window.alert('Paste the THA Drive Root Folder ID first.');
      return;
    }
    setStorage(ROOT_KEY, rootId);
    setStorage(ROOT_LABEL_KEY, label);
    window.THA_DRIVE_ROOT?.setRootId?.(rootId, label);
    window.dispatchEvent(new Event('tha-drive-root-updated'));
    schedule();
  }

  function wire() {
    document.querySelectorAll('[data-tha-command-role]').forEach(select => {
      if (select.dataset.wired) return;
      select.dataset.wired = 'true';
      select.addEventListener('change', () => {
        const nextRole = select.value;
        const destSelect = document.querySelector('[data-tha-command-destination]');
        if (destSelect && !storageValue(DESTINATION_KEY)) destSelect.value = recommendedDestinationForRole(nextRole);
        saveLaneSettings();
      });
    });
    document.querySelectorAll('[data-tha-command-destination],[data-tha-command-submitted-by]').forEach(input => {
      if (input.dataset.wired) return;
      input.dataset.wired = 'true';
      input.addEventListener('change', saveLaneSettings);
      input.addEventListener('blur', saveLaneSettings);
    });
    document.querySelectorAll('[data-tha-command-save-settings]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveLaneSettings();
        window.alert('Uploader and upload lane saved.');
      });
    });
    document.querySelectorAll('[data-tha-command-save-admin]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveAdminSettings();
        window.alert('THA app - Clients folder saved.');
      });
    });
    document.querySelectorAll('[data-tha-command-action]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveLaneSettings();
        const action = button.getAttribute('data-tha-command-action');
        if (action === 'connect') clickButton([/connect google drive/i, /^connect drive$/i, /reconnect drive/i], 'Use the native Connect Google Drive button in Business Records & Drive. If Google blocks it, open Advanced / Testing Tools.');
        if (action === 'sync') clickButton([/sync pending photos/i, /sync photos/i], 'No Sync pending photos button was found. Connect Drive first.');
        if (action === 'save') clickButton([/save drive package/i, /save pmr package/i, /upload drive package/i, /save package/i], 'No Save Drive Package button was found. Complete client setup and connect Drive first.');
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