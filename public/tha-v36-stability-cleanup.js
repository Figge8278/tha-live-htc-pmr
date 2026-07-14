(() => {
  const STYLE_ID = 'tha-v36-stability-cleanup-styles';
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .walkthroughControlsPanel{display:block!important;visibility:visible!important;opacity:1!important;max-width:1180px!important;margin:16px auto!important;padding:0 20px!important;overflow:visible!important}
      .walkthroughControlsPanel .workflowCueStrip,.walkthroughControlsPanel .homeownerOutputCard{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsSummary{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary{display:flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;margin:8px 0 10px!important;padding:8px 10px!important;border:1px solid #d8e4ea!important;border-radius:14px!important;background:#fbfdfe!important;box-shadow:none!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1),
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4){display:grid!important;visibility:visible!important;min-width:160px!important;gap:1px!important;padding:3px 7px!important;border-radius:10px!important;background:#fff!important;border:1px solid #e5edf2!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1) span,
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4) span{font-size:10px!important;font-weight:900!important;line-height:1.1!important;color:#60717c!important;text-transform:uppercase!important;letter-spacing:.02em!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1) strong,
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4) strong{font-size:12px!important;line-height:1.15!important;color:#173e57!important;max-width:240px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem small{display:none!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .saveStatus,
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .driveSummaryPill{display:inline-flex!important;visibility:visible!important;align-items:center!important;min-height:28px!important;padding:4px 8px!important;border-radius:999px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .controlAttentionPill{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .openControlsButton{display:inline-flex!important;visibility:visible!important;opacity:1!important;margin-left:auto!important;min-height:30px!important;border-radius:999px!important;font-weight:950!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsBody{display:none!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-areas:"setup intakeImport" "workSession businessRecords" "advanced advanced"!important;gap:16px!important;align-items:start!important}
      .walkthroughControlsPanel .walkthroughSetupCard,.walkthroughControlsPanel .tha-walkthrough-setup-card{grid-area:setup!important}
      .walkthroughControlsPanel .intakeImportCard,.walkthroughControlsPanel .homeownerIntakeSectionCard{grid-area:intakeImport!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important;display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;overflow:visible!important}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important;margin-top:2px!important}

      /* Keep setup to the five intended cards only: 1, 2, 3, 4, Advanced. */
      .walkthroughControlsPanel .businessRecordsCard>.driveSetupGrid,
      .walkthroughControlsPanel .businessRecordsCard>.driveMetaRow,
      .walkthroughControlsPanel .businessRecordsCard>.driveErrorBox,
      .walkthroughControlsPanel .businessRecordsCard>.driveStatusBox,
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-simple-guide,
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-oauth-diagnostic,
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-failure-guidance{display:none!important;visibility:hidden!important}

      .walkthroughControlsPanel .driveTroubleshooting .driveSetupGrid{display:grid!important;visibility:visible!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader p{display:block!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin-top:10px!important;align-items:center!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions button,.walkthroughControlsPanel .businessRecordsCard .driveSetupActions a{min-height:38px!important;border-radius:999px!important;font-weight:950!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-connect-needed{border:2px solid #d97706!important;background:#fffaf0!important;color:#8a4b08!important;box-shadow:0 0 0 4px rgba(217,119,6,.12)!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-connected{border:2px solid #1d4ed8!important;background:#eff6ff!important;color:#1e3a8a!important;box-shadow:0 0 0 4px rgba(37,99,235,.12)!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-save-primary{border:2px solid #16a34a!important;background:#fff!important;color:#166534!important;box-shadow:none!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-save-waiting{border:2px solid #cbd5e1!important;background:#fff!important;color:#475569!important;box-shadow:none!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-sync-attention{border:2px solid #eab308!important;background:#fefce8!important;color:#854d0e!important;box-shadow:0 0 0 4px rgba(234,179,8,.12)!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-open-folder{border:1px solid #93c5fd!important;background:#eff6ff!important;color:#1e3a8a!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-hidden-duplicate{display:none!important}

      .homeownerLane .tha-care-time-marker,.homeownerLane .tha-care-date-widget,.intakeSubsection>h3>.tha-care-time-marker{display:none!important;visibility:hidden!important}
      .demoScenarioCard,.releaseNoteInline,[data-tha-production-readiness],[data-tha-client-delivery-demo],[data-tha-drive-test-workflow],[data-tha-shared-drive-admin]{display:none!important}
      @media(max-width:900px){.walkthroughControlsPanel.expanded .walkthroughControlsBody{grid-template-columns:1fr!important;grid-template-areas:"setup" "intakeImport" "workSession" "businessRecords" "advanced"!important}.walkthroughControlsPanel{padding:0 12px!important}.walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1),.walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4){min-width:130px!important;max-width:calc(50vw - 30px)!important}.walkthroughControlsPanel.collapsed .walkthroughControlsSummary .openControlsButton{margin-left:0!important}}
      @media print{.walkthroughControlsPanel{display:none!important}}
    `;
    document.head.append(style);
  }

  function renameSetupHeadings(panel) {
    const headings = Array.from(panel.querySelectorAll('h2,h3'));
    const rename = (patterns, text) => {
      const found = headings.find(h => patterns.some(pattern => pattern.test(textOf(h))));
      if (found) found.textContent = text;
    };
    rename([/^Walkthrough Control Panel$/i, /^Walkthrough Setup & Records$/i], 'Walkthrough Setup & Records');
    rename([/^Walkthrough Info$/i, /^Walkthrough Setup$/i, /^1\. Walkthrough Setup$/i], '1. Walkthrough Setup');
    rename([/^Send \/ Import Homeowner Intake$/i, /^Homeowner Intake$/i, /^2\. Homeowner Intake$/i, /^3\. Homeowner Intake$/i], '3. Homeowner Intake');
    rename([/^Local Work \/ This Device$/i, /^Work Session$/i, /^2\. Work Session$/i, /^3\. Work Session$/i], '2. Work Session');
    rename([/^Drive \/ Business Records$/i, /^Business Records & Drive$/i, /^4\. Business Records & Drive$/i], '4. Business Records & Drive');
  }

  function cleanSetupSummary(panel) {
    const summary = panel.querySelector('.walkthroughControlsSummary');
    if (!summary) return;
    const collapsed = panel.classList.contains('collapsed');
    summary.hidden = false;
    summary.setAttribute('aria-hidden', collapsed ? 'false' : 'true');
    Array.from(summary.children).forEach(child => {
      child.removeAttribute('hidden');
      child.setAttribute('data-tha-summary-compact', collapsed ? 'true' : 'false');
    });
  }

  function cleanDriveTile(business) {
    business.querySelectorAll('.tha-drive-simple-guide,.tha-drive-oauth-diagnostic,.tha-drive-failure-guidance').forEach(node => node.remove());

    const drivePill = business.querySelector('.drivePill');
    const connected = Boolean(drivePill?.classList.contains('connected'));
    const buttons = Array.from(business.querySelectorAll('.driveSetupActions button,.driveSetupActions a'));
    let saveSeen = false;

    buttons.forEach(button => {
      const label = textOf(button).toLowerCase();
      button.classList.remove('tha-drive-connect-needed','tha-drive-connected','tha-drive-save-primary','tha-drive-save-waiting','tha-drive-sync-attention','tha-drive-open-folder','tha-drive-hidden-duplicate');
      if (/connect google drive|drive connected|connecting/.test(label)) {
        if (!connected && button.disabled && !/connecting/.test(label)) button.disabled = false;
        button.classList.add(connected ? 'tha-drive-connected' : 'tha-drive-connect-needed');
        button.title = connected ? 'Google Drive is connected for this browser session.' : 'Connect Google Drive. Troubleshooting is under Advanced.';
        return;
      }
      if (/save.*(drive|pmr).*package|save package|upload drive package/.test(label)) {
        if (saveSeen) button.classList.add('tha-drive-hidden-duplicate');
        else {
          saveSeen = true;
          button.classList.add(connected ? 'tha-drive-save-primary' : 'tha-drive-save-waiting');
        }
        return;
      }
      if (/sync pending photos|sync photos/.test(label)) button.classList.add('tha-drive-sync-attention');
      if (/open.*folder|last drive folder/.test(label)) button.classList.add('tha-drive-open-folder');
    });
  }

  function stabilizeTimingLabels(root = document) {
    root.querySelectorAll('.homeownerLane .tha-care-date-widget').forEach(widget => widget.remove());
    root.querySelectorAll('.tha-care-time-marker').forEach(marker => {
      marker.textContent = 'Time';
      marker.classList.remove('is-filled');
    });
  }

  function applyCleanup() {
    installStyles();
    try {
      if (localStorage.getItem(COLLAPSED_KEY) == null) localStorage.setItem(COLLAPSED_KEY, 'false');
    } catch {}

    const panel = document.querySelector('.walkthroughControlsPanel');
    if (panel) {
      panel.removeAttribute('hidden');
      const topbar = document.querySelector('.topbar');
      if (topbar && panel.previousElementSibling !== topbar) topbar.insertAdjacentElement('afterend', panel);
      panel.querySelector('.workflowCueStrip')?.setAttribute('hidden', 'true');
      panel.querySelector('.homeownerOutputCard')?.setAttribute('hidden', 'true');
      cleanSetupSummary(panel);
      renameSetupHeadings(panel);
      const business = panel.querySelector('.businessRecordsCard');
      if (business) cleanDriveTile(business);
    }

    stabilizeTimingLabels(document);
  }

  let scheduled = false;
  function scheduleCleanup() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyCleanup();
    });
  }

  function start() {
    applyCleanup();
    window.setTimeout(applyCleanup, 300);
    window.setTimeout(applyCleanup, 1000);
    new MutationObserver(scheduleCleanup).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
    document.addEventListener('input', scheduleCleanup);
    document.addEventListener('change', scheduleCleanup);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();