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
    ['incoming', 'Incoming Field Upload', 'Default buffer before Figge review'],
    ['demo', 'Demo / Sandbox Upload', 'Testing only — no client record'],
    ['review', 'Review / Ready to File', 'Ready for Figge to promote'],
    ['final', 'Final Client Package', 'Use only after review']
  ];

  const ROLES = [
    ['admin', 'Figge / Admin', 'incoming'],
    ['trusted', 'Rick / Trusted Helper', 'incoming'],
    ['subcontractor', 'Subcontractor', 'incoming'],
    ['demo', 'Demo Tester', 'demo']
  ];

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
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
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-business-drive-command{margin:14px 0!important;padding:16px!important;border:1px solid #f1c27b!important;border-radius:22px!important;background:#fffaf2!important;color:#3f2b10!important;box-shadow:inset 7px 0 0 rgba(242,140,40,.5),0 8px 20px rgba(84,55,16,.08)!important;display:grid!important;gap:14px!important}
      .tha-business-drive-command.ready{border-color:#9fcf99!important;background:#f5fbf2!important;box-shadow:inset 7px 0 0 rgba(72,164,72,.48),0 8px 20px rgba(31,84,31,.08)!important;color:#173c1d!important}
      .tha-business-drive-command.blocked{border-color:#efb4a9!important;background:#fff7f5!important;box-shadow:inset 7px 0 0 rgba(180,35,24,.42),0 8px 20px rgba(84,31,31,.08)!important}
      .tha-business-drive-command h3{margin:0!important;font-size:18px!important;line-height:1.18!important;color:#173e57!important}
      .tha-business-drive-command p{margin:0!important;font-size:13px!important;line-height:1.43!important;color:#4b5e66!important;font-weight:790!important}
      .tha-command-header{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:flex-start!important;flex-wrap:wrap!important}
      .tha-command-chipline{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
      .tha-command-chip{display:inline-flex!important;align-items:center!important;border:1px solid #d7e3ea!important;border-radius:999px!important;background:#fff!important;color:#315568!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
      .tha-command-chip.good{border-color:#abd6a3!important;background:#f3fbf0!important;color:#285c30!important}.tha-command-chip.warn{border-color:#f0bd82!important;background:#fff4e6!important;color:#8a4b08!important}.tha-command-chip.bad{border-color:#efb4a9!important;background:#fff1f0!important;color:#b42318!important}.tha-command-chip.info{border-color:#b7d8e5!important;background:#f5fbfd!important;color:#173e57!important}
      .tha-guided-steps{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
      .tha-guided-step{position:relative!important;border:1px solid #edd2ab!important;border-radius:18px!important;background:#fff!important;padding:12px!important;display:grid!important;gap:8px!important;align-content:start!important;min-height:172px!important}
      .tha-guided-step.good{border-color:#b7d9ae!important;background:#f8fff6!important}.tha-guided-step.warn{border-color:#f0bd82!important;background:#fff8ee!important}.tha-guided-step.bad{border-color:#efb4a9!important;background:#fff5f3!important}
      .tha-guided-step .step-num{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:26px!important;height:26px!important;border-radius:999px!important;background:#d97706!important;color:#fff!important;font-size:12px!important;font-weight:1000!important}.tha-guided-step.good .step-num{background:#23884c!important}.tha-guided-step.bad .step-num{background:#b42318!important}
      .tha-guided-step h4{margin:0!important;font-size:14px!important;color:#173e57!important;line-height:1.24!important}.tha-guided-step span,.tha-guided-step small{font-size:12px!important;color:#536b76!important;font-weight:800!important;line-height:1.34!important}.tha-guided-step small{font-size:11px!important;color:#6a7f88!important}
      .tha-step-fields{display:grid!important;gap:7px!important}.tha-step-fields label{display:grid!important;gap:4px!important;color:#315568!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.03em!important}.tha-step-fields input,.tha-step-fields select{width:100%!important;border:1px solid #d6e1e7!important;border-radius:11px!important;background:#fff!important;color:#243d49!important;padding:8px!important;font-size:12px!important;font-weight:850!important}
      .tha-step-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important;margin-top:auto!important}.tha-step-actions button{border:1px solid #d78b2b!important;border-radius:999px!important;background:#fff!important;color:#8a4b08!important;padding:8px 10px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}.tha-step-actions button.primary{background:#d97706!important;border-color:#d97706!important;color:#fff!important;box-shadow:0 0 0 4px rgba(217,119,6,.16)!important}.tha-guided-step.good .tha-step-actions button.primary{background:#23884c!important;border-color:#23884c!important;box-shadow:0 0 0 4px rgba(35,136,76,.14)!important}.tha-step-actions button.green{background:#23884c!important;border-color:#23884c!important;color:#fff!important}
      .tha-command-roadmap{border:1px dashed #cddfea!important;border-radius:14px!important;background:#fff!important;padding:10px 12px!important;color:#3f5d69!important;font-size:12px!important;font-weight:820!important;line-height:1.4!important}.tha-command-roadmap strong{color:#173e57!important}
      .tha-command-admin-inline{border:1px solid #d8e4ea!important;border-radius:16px!important;background:#fbfdfe!important;padding:10px!important}.tha-command-admin-inline summary{cursor:pointer!important;font-size:13px!important;font-weight:950!important;color:#315568!important}.tha-command-admin-fields{display:grid!important;grid-template-columns:minmax(220px,1fr) minmax(200px,.6fr) auto!important;gap:8px!important;align-items:end!important;margin-top:10px!important}.tha-command-admin-fields label{display:grid!important;gap:4px!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;color:#315568!important}.tha-command-admin-fields input{border:1px solid #d6e1e7!important;border-radius:11px!important;padding:8px!important;font-size:12px!important;font-weight:850!important}.tha-command-admin-fields button{border:1px solid #61a9b5!important;border-radius:999px!important;background:#fff!important;color:#075564!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}.tha-command-admin-fields button.primary{background:#07859a!important;border-color:#07859a!important;color:#fff!important}
      .tha-drive-advanced-wrap{margin:10px 0!important;border:1px solid #d8e4ea!important;border-radius:18px!important;background:#fbfdfe!important;padding:10px!important}.tha-drive-advanced-wrap>summary{cursor:pointer!important;font-size:13px!important;font-weight:950!important;color:#315568!important}.tha-drive-advanced-wrap .tha-drive-advanced-body{margin-top:10px!important;display:grid!important;gap:10px!important}.tha-drive-advanced-hidden{display:none!important}
      @media(max-width:980px){.tha-guided-steps{grid-template-columns:1fr!important}.tha-guided-step{min-height:0!important}.tha-command-admin-fields{grid-template-columns:1fr!important}.tha-step-actions button{width:100%!important}}
      @media print{.tha-business-drive-command,.tha-drive-advanced-wrap{display:none!important}}
    `;
    document.head.append(style);
  }

  function panelClass({ root, connected }) {
    if (!root.ready) return 'blocked';
    if (connected) return 'ready';
    return '';
  }

  function commandHtml() {
    const root = rootState();
    const connected = driveConnected();
    const dest = destination();
    const submitter = submittedBy();
    const currentRole = role();
    const photoState = photoGuardState();
    const rootLabel = root.ready ? root.label : 'Admin setup needed';
    const destText = destinationLabel(dest);
    return `
      <section class="tha-business-drive-command ${panelClass({ root, connected })}" ${PANEL_ATTR}="true">
        <div class="tha-command-header">
          <div>
            <h3>Business Records & Drive — Guided Checklist</h3>
            <p>Use the cards left to right. Orange means next action. Green means done. Red means admin setup is missing.</p>
          </div>
          <div class="tha-command-chipline">
            <span class="tha-command-chip ${root.ready ? 'good' : 'bad'}">${root.ready ? 'THA folder set' : 'Admin setup needed'}</span>
            <span class="tha-command-chip ${connected ? 'good' : 'warn'}">${connected ? 'Drive connected' : 'Drive needs connection'}</span>
            <span class="tha-command-chip info">${escapeHtml(destText)}</span>
            <span class="tha-command-chip info">Photos: ${escapeHtml(photoState)}</span>
          </div>
        </div>

        <div class="tha-guided-steps">
          <article class="tha-guided-step ${submitter ? 'good' : 'warn'}">
            <span class="step-num">1</span>
            <h4>Confirm user + upload lane</h4>
            <span>This decides where the package lands. Default is the incoming buffer, not the final Airtable-linked client folder.</span>
            <div class="tha-step-fields">
              <label>Role<select data-tha-command-role>${ROLES.map(([id, label]) => `<option value="${id}" ${id === currentRole ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
              <label>Submitted By<input type="text" data-tha-command-submitted-by value="${escapeHtml(submitter)}" placeholder="Figge, Rick, Luis, Demo Tester"></label>
              <label>Upload Lane<select data-tha-command-destination>${DESTINATIONS.map(([id, label]) => `<option value="${id}" ${id === dest ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
            </div>
            <div class="tha-step-actions"><button type="button" data-tha-command-save-settings>Save lane</button></div>
          </article>

          <article class="tha-guided-step ${!root.ready ? 'bad' : connected ? 'good' : 'warn'}">
            <span class="step-num">2</span>
            <h4>Connect Google Drive</h4>
            <span>${!root.ready ? 'Admin needs to set the THA Drive Root Folder first.' : connected ? 'Connected. You can sync photos and save the package.' : 'Use the same Google account that has access to the THA shared folder.'}</span>
            <small>Target: ${escapeHtml(rootLabel)}</small>
            <div class="tha-step-actions"><button type="button" class="primary" data-tha-command-action="connect">${connected ? 'Drive connected' : 'Connect Google Drive'}</button></div>
          </article>

          <article class="tha-guided-step ${connected ? 'warn' : 'bad'}">
            <span class="step-num">3</span>
            <h4>Sync + save package</h4>
            <span>${connected ? 'Sync pending photos, then save the PMR package to the selected upload lane.' : 'Connect Drive first, then return here.'}</span>
            <small>After saving: review incoming upload, then promote approved folder to Airtable-linked client folder.</small>
            <div class="tha-step-actions">
              <button type="button" data-tha-command-action="sync">Sync photos</button>
              <button type="button" class="primary" data-tha-command-action="save">Save PMR package</button>
              <button type="button" data-tha-command-action="demo">Load demo</button>
            </div>
          </article>
        </div>

        <p class="tha-command-roadmap"><strong>Normal workflow:</strong> field uploads go to Incoming/Demo first. Figge reviews the package. Approved packages move to the final client folder. Airtable links to the final reviewed folder, not the raw incoming upload.</p>

        <details class="tha-command-admin-inline">
          <summary>Admin setup / troubleshooting</summary>
          <div class="tha-command-admin-fields">
            <label>THA Root Folder ID<input type="text" data-tha-command-root-id value="${escapeHtml(root.id)}" placeholder="Paste Drive folder ID"></label>
            <label>Root Label<input type="text" data-tha-command-root-label value="${escapeHtml(root.label || 'THA App Uploads')}" placeholder="THA App Uploads"></label>
            <button type="button" class="primary" data-tha-command-save-admin>Save admin setup</button>
          </div>
          <p style="margin-top:8px!important;font-size:12px!important;color:#536b76!important;font-weight:800!important;">Only Figge/admin should need this. Field users should only confirm their lane, connect Drive, and save.</p>
        </details>
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
    const label = document.querySelector('[data-tha-command-root-label]')?.value?.trim() || 'THA App Uploads';
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
        window.alert('Upload lane saved.');
      });
    });
    document.querySelectorAll('[data-tha-command-save-admin]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveAdminSettings();
        window.alert('Admin Drive setup saved.');
      });
    });
    document.querySelectorAll('[data-tha-command-action]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        saveLaneSettings();
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