(() => {
  const ID = 'tha-v35710-start-cleanup-drive-help';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const read = (key, fallback = {}) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  };

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaStartPage .thaStartDashboardGrid{grid-template-columns:minmax(0,1fr)!important}
      .thaStartPage .thaStartDashboardGrid.thaSinglePanelDashboard{display:block!important}
      .app.thaStartViewActive .thaActionCenter{display:none!important}

      .thaWorkflowPanelContent,
      .thaWorkflowSubsection,
      .thaWorkflowSubsection > *,
      .thaWorkflowPanel .controlGroup,
      .thaWorkflowPanel .sessionCard,
      .thaWorkflowPanel .intakeImportCard,
      .thaWorkflowPanel .businessRecordsCard,
      .thaWorkflowPanel .thaSnapshotSourcePanel,
      .thaWorkflowPanel .thaSnapshotInformationSourceHost,
      .thaWorkflowPanel .thaRecordStorageExtras{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        box-sizing:border-box!important;
        justify-self:stretch!important;
        align-self:stretch!important;
      }
      .thaWorkflowPanel .controlGroup,
      .thaWorkflowPanel .sessionCard,
      .thaWorkflowPanel .intakeImportCard,
      .thaWorkflowPanel .businessRecordsCard{
        align-items:stretch!important;
      }
      .thaWorkflowPanel label,
      .thaWorkflowPanel details,
      .thaWorkflowPanel section,
      .thaWorkflowPanel article,
      .thaWorkflowPanel [class*="Grid"],
      .thaWorkflowPanel [class*="grid"]{
        max-width:none!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      .thaWorkflowPanel input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
      .thaWorkflowPanel select,
      .thaWorkflowPanel textarea{
        width:100%!important;
        max-width:none!important;
        box-sizing:border-box!important;
      }
      .thaWorkflowPanel .inputs,
      .thaWorkflowPanel .clientIntakeTwoColumnWorkflow,
      .thaWorkflowPanel .driveSetupGrid,
      .thaWorkflowPanel .driveStatusGrid,
      .thaWorkflowPanel .driveActionGrid,
      .thaWorkflowPanel .sessionGrid,
      .thaWorkflowPanel .previewMetaGrid{
        width:100%!important;
        max-width:none!important;
        align-items:stretch!important;
      }
      .thaDriveAuthHelp{margin-top:10px;border:1px solid #e5be65;border-radius:12px;background:#fff9e8;padding:10px 11px;color:#665216}
      .thaDriveAuthHelp[open]{box-shadow:inset 4px 0 0 #c48b20}
      .thaDriveAuthHelp summary{cursor:pointer;font-size:11px;font-weight:950;color:#765713}
      .thaDriveAuthHelpBody{display:grid;gap:8px;margin-top:8px;font-size:10px;line-height:1.45}
      .thaDriveAuthHelpBody p{margin:0!important}
      .thaDriveOriginRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}
      .thaDriveOriginRow code{display:block;min-width:0;overflow-wrap:anywhere;border:1px solid #e2d09e;border-radius:8px;background:#fff;padding:7px 8px;color:#4d421f;font-size:9px}
      .thaDriveOriginRow button{white-space:nowrap;padding:7px 9px!important;font-size:9px!important}
      @media(max-width:700px){.thaDriveOriginRow{grid-template-columns:1fr}.thaDriveOriginRow button{width:100%}}
    `;
    document.head.append(style);
  }

  function removeStartExtras() {
    const page = document.querySelector('.thaStartPage');
    if (!page) return;
    page.querySelectorAll('.thaStartPanel').forEach(panel => {
      if (/^Quick actions$/i.test(text(panel.querySelector(':scope > h3')?.textContent))) panel.remove();
    });
    const dashboard = page.querySelector('.thaStartDashboardGrid');
    if (dashboard) dashboard.classList.toggle('thaSinglePanelDashboard', dashboard.children.length <= 1);
    page.querySelectorAll('[data-quick="actions"]').forEach(button => button.remove());
  }

  function driveFailureText(records) {
    const ui = read('tha-v3576-drive-ui-state');
    const meta = read('tha-drive-meta');
    return [
      ui.lastError,
      ui.message,
      meta.lastError,
      ...Array.from(records.querySelectorAll('[role="alert"],.driveErrorBox,.thaDriveStatusSummary.failed,.driveSetupNote')).map(node => node.textContent)
    ].map(text).filter(Boolean).join(' ');
  }

  function ensureDriveHelp() {
    const records = document.querySelector('.businessRecordsCard');
    if (!records) return;
    let help = records.querySelector(':scope > .thaDriveAuthHelp');
    if (!help) {
      help = document.createElement('details');
      help.className = 'thaDriveAuthHelp';
      records.append(help);
    }
    const origin = window.location.origin;
    const failure = driveFailureText(records);
    const blocked = /access is blocked|access blocked|authorization error|origin[_\s-]?mismatch|unauthorized|access_denied|invalid client|not a valid origin/i.test(failure);
    help.open = blocked;
    help.innerHTML = `<summary>${blocked ? 'Drive authorization was blocked — check Google Cloud settings' : 'Drive authorization troubleshooting'}</summary><div class="thaDriveAuthHelpBody"><p>Use a Google OAuth client of type <strong>Web application</strong>. Add the exact address below under <strong>Authorized JavaScript origins</strong>.</p><div class="thaDriveOriginRow"><code>${origin}</code><button type="button" data-copy-origin>Copy origin</button></div><p>If the OAuth app is in <strong>Testing</strong>, add the Google account you are signing in with under <strong>Test users</strong>. If its audience is <strong>Internal</strong>, accounts outside that Google Workspace organization will be blocked.</p><p>This permission is controlled in Google Cloud; the THA app cannot bypass a blocked OAuth audience or origin.</p></div>`;
    help.querySelector('[data-copy-origin]')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      try {
        await navigator.clipboard.writeText(origin);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => { button.textContent = 'Copy origin'; }, 1400);
    });
  }

  function run() {
    installStyles();
    removeStartExtras();
    ensureDriveHelp();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; run(); });
  }

  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 2500);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','open','disabled'] });
})();