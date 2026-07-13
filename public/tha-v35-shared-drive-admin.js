(() => {
  const STYLE_ID = 'tha-v35-shared-drive-admin-styles';
  const PANEL_ATTR = 'data-tha-shared-drive-admin';
  const ROOT_KEY = 'tha-drive-root-folder-id';
  const ROOT_LABEL_KEY = 'tha-drive-root-folder-label';
  const MODE_KEY = 'tha-drive-upload-mode';
  const SUBMITTED_BY_KEY = 'tha-drive-submitted-by';

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function storageValue(key) {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function uploadMode() {
    const mode = storageValue(MODE_KEY) || 'incoming';
    return ['incoming', 'demo', 'review', 'final'].includes(mode) ? mode : 'incoming';
  }

  function submittedBy() {
    return storageValue(SUBMITTED_BY_KEY).trim() || 'Field User';
  }

  function modeLabel(mode = uploadMode()) {
    if (mode === 'demo') return 'Demo / Sandbox Upload';
    if (mode === 'review') return 'Review / Ready to File';
    if (mode === 'final') return 'Final Client Package';
    return 'Incoming Field Upload';
  }

  function folderPath(mode = uploadMode()) {
    const person = submittedBy();
    if (mode === 'demo') return `00_Demo Sandbox Uploads / ${person}`;
    if (mode === 'review') return '02_Review Ready to File';
    if (mode === 'final') return '03_Final Client Folders';
    return `01_Incoming Field Uploads / ${person}`;
  }

  function selected(value, expected) {
    return value === expected ? 'selected' : '';
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-shared-drive-admin{margin:12px 0!important;padding:13px!important;border:1px solid #b9d8c2!important;border-radius:18px!important;background:#f4fbf1!important;color:#264c2b!important;box-shadow:inset 6px 0 0 rgba(38,166,91,.28)!important;display:grid!important;gap:10px!important}
      .tha-shared-drive-admin.not-ready{border-color:#f2c094!important;background:#fff9f2!important;box-shadow:inset 6px 0 0 rgba(242,140,40,.34)!important;color:#5c3a10!important}
      .tha-shared-drive-admin h3{margin:0!important;font-size:15px!important;color:#214f2b!important;line-height:1.25!important}
      .tha-shared-drive-admin.not-ready h3{color:#9a4d00!important}
      .tha-shared-drive-admin p{margin:0!important;font-size:12px!important;line-height:1.42!important;color:#405b45!important;font-weight:800!important}
      .tha-shared-drive-fields{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,.65fr) auto!important;gap:8px!important;align-items:end!important}
      .tha-routing-fields{display:grid!important;grid-template-columns:minmax(0,.65fr) minmax(0,.8fr) auto!important;gap:8px!important;align-items:end!important}
      .tha-shared-drive-fields label,.tha-routing-fields label{display:grid!important;gap:4px!important;font-size:11px!important;font-weight:950!important;color:#315a39!important;text-transform:uppercase!important;letter-spacing:.03em!important}
      .tha-shared-drive-fields input,.tha-routing-fields input,.tha-routing-fields select{width:100%!important;border:1px solid #bdd6c5!important;border-radius:10px!important;background:#fff!important;padding:8px 9px!important;color:#1f3d26!important;font-size:12px!important;font-weight:850!important}
      .tha-shared-drive-fields button,.tha-shared-drive-actions button,.tha-routing-fields button{border:1px solid #67a878!important;border-radius:999px!important;background:#fff!important;color:#286536!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-shared-drive-fields button.primary,.tha-routing-fields button.primary{background:#23884c!important;border-color:#23884c!important;color:#fff!important}
      .tha-shared-drive-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important}
      .tha-shared-drive-status{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
      .tha-shared-drive-chip{display:inline-flex!important;border:1px solid #bedcc7!important;border-radius:999px!important;background:#fff!important;color:#286536!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
      .tha-shared-drive-chip.warn{border-color:#f2c094!important;background:#fff4e8!important;color:#a85107!important}
      .tha-shared-drive-chip.blue{border-color:#afd2ef!important;background:#f4faff!important;color:#1b5a83!important}
      .tha-shared-drive-media,.tha-drive-buffer-rule{border:1px dashed #bedcc7!important;border-radius:14px!important;background:#fff!important;padding:10px!important;display:grid!important;gap:5px!important}
      .tha-shared-drive-media strong,.tha-drive-buffer-rule strong{color:#214f2b!important}
      .tha-drive-buffer-rule{border-color:#e8c884!important;background:#fffdf5!important;color:#624810!important}
      .tha-drive-buffer-rule strong{color:#8a5a00!important}
      .tha-shared-drive-admin details{border:1px solid #d8e8dc!important;border-radius:12px!important;background:#fff!important;padding:8px 10px!important}
      .tha-shared-drive-admin summary{cursor:pointer!important;font-size:12px!important;font-weight:950!important;color:#315a39!important}
      .tha-shared-drive-admin code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;background:#eef8f0!important;border:1px solid #cfe3d4!important;border-radius:6px!important;padding:2px 4px!important;word-break:break-all!important}
      @media(max-width:760px){.tha-shared-drive-fields,.tha-routing-fields{grid-template-columns:1fr!important}.tha-shared-drive-fields button,.tha-routing-fields button{width:100%!important}}
      @media print{.tha-shared-drive-admin{display:none!important}}
    `;
    document.head.append(style);
  }

  function currentRootId() {
    return storageValue(ROOT_KEY).trim();
  }

  function currentRootLabel() {
    return storageValue(ROOT_LABEL_KEY).trim() || 'THA Drive Root';
  }

  function rootStatus() {
    const id = currentRootId();
    return {
      ready: Boolean(id),
      id,
      label: currentRootLabel(),
      mode: uploadMode(),
      submittedBy: submittedBy(),
      path: folderPath()
    };
  }

  function renderPanel() {
    const status = rootStatus();
    return `
      <section class="tha-shared-drive-admin ${status.ready ? '' : 'not-ready'}" ${PANEL_ATTR}="true">
        <header>
          <h3>THA Shared Drive Target</h3>
          <p>${status.ready ? 'Drive packages target the configured THA root folder. Normal uploads land in a buffer folder first so Airtable-linked final client folders stay curated.' : 'Set one THA Drive Root Folder so packages do not scatter across each user’s My Drive.'}</p>
        </header>
        <div class="tha-shared-drive-status">
          <span class="tha-shared-drive-chip ${status.ready ? '' : 'warn'}">${status.ready ? 'Shared root configured' : 'Shared root not set'}</span>
          <span class="tha-shared-drive-chip blue">Destination: ${escapeHtml(modeLabel(status.mode))}</span>
          <span class="tha-shared-drive-chip">Submitted by: ${escapeHtml(status.submittedBy)}</span>
          <span class="tha-shared-drive-chip">Path: ${escapeHtml(status.path)}</span>
          ${status.id ? `<span class="tha-shared-drive-chip">Folder ID: ${escapeHtml(status.id.slice(0, 8))}…</span>` : ''}
        </div>
        <div class="tha-routing-fields">
          <label>Upload destination
            <select data-tha-upload-mode>
              <option value="incoming" ${selected(status.mode, 'incoming')}>Incoming Field Upload — default buffer</option>
              <option value="demo" ${selected(status.mode, 'demo')}>Demo / Sandbox Upload</option>
              <option value="review" ${selected(status.mode, 'review')}>Review / Ready to File</option>
              <option value="final" ${selected(status.mode, 'final')}>Final Client Package — use after review</option>
            </select>
          </label>
          <label>Submitted By<input type="text" data-tha-submitted-by value="${escapeHtml(status.submittedBy)}" placeholder="Figge, Rick, Luis, Demo Tester"></label>
          <button type="button" class="primary" data-tha-routing-save>Save routing</button>
        </div>
        <div class="tha-drive-buffer-rule">
          <strong>Buffer rule</strong>
          <p>Use <strong>Incoming Field Upload</strong> for Rick, subcontractors, tablet tests, and normal field collection. Review the package, then move or promote the approved result into the Airtable-linked final client folder.</p>
        </div>
        <div class="tha-shared-drive-fields">
          <label>THA Drive Root Folder ID<input type="text" data-tha-root-id value="${escapeHtml(status.id)}" placeholder="Paste Google Drive folder ID"></label>
          <label>Label<input type="text" data-tha-root-label value="${escapeHtml(status.label)}" placeholder="THA App Uploads"></label>
          <button type="button" class="primary" data-tha-root-save>Save target</button>
        </div>
        <div class="tha-shared-drive-actions">
          <button type="button" data-tha-root-clear>Clear shared target</button>
          <button type="button" data-tha-root-copy-note>Copy setup note for Rick</button>
        </div>
        <div class="tha-shared-drive-media">
          <strong>Media rule</strong>
          <p>Photos are normal app evidence. Videos should be short Drive-linked clips: upload to the Drive media folder, then reference the link/note in the PMR rather than storing video inside the walkthrough save.</p>
        </div>
        <details>
          <summary>How to get the folder ID and who gets access</summary>
          <p>Open the THA shared folder in Google Drive. Copy the long ID from the URL after <code>/folders/</code>. Share the THA app upload folder with approved users as needed. For real work, give subcontractors access only to their incoming folder. For family/friend testing, use Demo / Sandbox Upload.</p>
        </details>
      </section>`;
  }

  function placePanel() {
    const anchor = document.querySelector('[data-tha-drive-test-workflow]') || document.querySelector('.walkthroughControlsPanel .businessRecordsCard') || document.querySelector('.walkthroughControlsPanel') || document.querySelector('main');
    if (!anchor) return;
    const existing = document.querySelector(`[${PANEL_ATTR}]`);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderPanel();
    const panel = wrapper.firstElementChild;
    if (existing) existing.replaceWith(panel);
    else anchor.after(panel);
  }

  function setupNote() {
    const id = currentRootId() || '[paste THA Drive Root Folder ID]';
    return `THA app Drive setup:\n1. Use app.thehomeowneradvocate.com when ready.\n2. Connect Google Drive with your approved Google account.\n3. You need access to the THA shared Drive/folder.\n4. Default upload destination: ${modeLabel()} > ${folderPath()}\n5. THA Drive Root Folder ID: ${id}\n6. Photos upload through the app; videos should be short Drive-linked clips.`;
  }

  function wire() {
    document.querySelectorAll('[data-tha-routing-save]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        const mode = document.querySelector('[data-tha-upload-mode]')?.value || 'incoming';
        const person = document.querySelector('[data-tha-submitted-by]')?.value?.trim() || 'Field User';
        localStorage.setItem(MODE_KEY, mode);
        localStorage.setItem(SUBMITTED_BY_KEY, person);
        window.THA_DRIVE_ROOT?.setUploadRouting?.({ mode, submittedBy: person });
        render();
      });
    });
    document.querySelectorAll('[data-tha-root-save]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        const id = document.querySelector('[data-tha-root-id]')?.value?.trim() || '';
        const label = document.querySelector('[data-tha-root-label]')?.value?.trim() || 'THA App Uploads';
        if (!id) {
          window.alert('Paste the THA Drive Root Folder ID first.');
          return;
        }
        window.THA_DRIVE_ROOT?.setRootId(id, label);
        localStorage.setItem(ROOT_KEY, id);
        localStorage.setItem(ROOT_LABEL_KEY, label);
        render();
      });
    });
    document.querySelectorAll('[data-tha-root-clear]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', () => {
        window.THA_DRIVE_ROOT?.clearRootId();
        localStorage.removeItem(ROOT_KEY);
        localStorage.removeItem(ROOT_LABEL_KEY);
        render();
      });
    });
    document.querySelectorAll('[data-tha-root-copy-note]').forEach(button => {
      if (button.dataset.wired) return;
      button.dataset.wired = 'true';
      button.addEventListener('click', async () => {
        const note = setupNote();
        try {
          await navigator.clipboard.writeText(note);
          window.alert('Copied Drive setup note.');
        } catch {
          window.prompt('Copy this setup note:', note);
        }
      });
    });
  }

  function render() {
    installStyles();
    placePanel();
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
    window.addEventListener('tha-drive-root-updated', schedule);
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();