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
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary{display:flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;margin:8px 0 10px!important;padding:8px 10px!important;border:1px solid #d8e4ea!important;border-radius:14px!important;background:linear-gradient(180deg,#fbfdfe 0%,#f6fbfd 100%)!important;box-shadow:inset 4px 0 0 rgba(49,85,104,.18)!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1),
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4){display:grid!important;visibility:visible!important;min-width:165px!important;gap:1px!important;padding:4px 8px!important;border-radius:11px!important;background:#fff!important;border:1px solid #d4e2ea!important;box-shadow:0 1px 0 rgba(15,23,42,.04)!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1){border-left:4px solid #315568!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4){border-left:4px solid #4b7f52!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1) span,
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4) span{font-size:10px!important;font-weight:950!important;line-height:1.1!important;color:#60717c!important;text-transform:uppercase!important;letter-spacing:.025em!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(1) strong,
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem:nth-of-type(4) strong{font-size:12px!important;line-height:1.15!important;color:#173e57!important;max-width:250px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .summaryItem small{display:none!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .saveStatus,
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .driveSummaryPill{display:inline-flex!important;visibility:visible!important;align-items:center!important;min-height:28px!important;padding:4px 8px!important;border-radius:999px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#315568!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .driveSummaryPill.connected{border-color:#b9dfb4!important;background:#f7fcf5!important;color:#285c30!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .driveSummaryPill.error{border-color:#f5b5ad!important;background:#fff7f6!important;color:#9f2c21!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .controlAttentionPill{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary .openControlsButton{display:inline-flex!important;visibility:visible!important;opacity:1!important;margin-left:auto!important;min-height:30px!important;border-radius:999px!important;font-weight:950!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsBody{display:none!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-areas:"setup intakeImport" "workSession businessRecords" "advanced advanced"!important;gap:16px!important;align-items:start!important}
      .walkthroughControlsPanel .walkthroughSetupCard,.walkthroughControlsPanel .tha-walkthrough-setup-card{grid-area:setup!important}
      .walkthroughControlsPanel .intakeImportCard,.walkthroughControlsPanel .homeownerIntakeSectionCard{grid-area:intakeImport!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important;display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;overflow:visible!important;padding-bottom:16px!important}
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
      .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:12px!important;margin-bottom:10px!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader p{display:block!important;max-width:520px!important;margin-top:4px!important;line-height:1.35!important}
      .walkthroughControlsPanel .businessRecordsCard .drivePill{display:inline-flex!important;align-items:center!important;gap:6px!important;min-height:30px!important;border-radius:999px!important;border:2px solid #d97706!important;background:#fffaf0!important;color:#8a4b08!important;padding:4px 9px!important;font-size:11px!important;font-weight:950!important;white-space:nowrap!important;box-shadow:0 0 0 4px rgba(217,119,6,.10)!important}
      .walkthroughControlsPanel .businessRecordsCard .drivePill::before{content:''!important;width:9px!important;height:9px!important;border-radius:999px!important;background:#d97706!important;box-shadow:0 0 0 3px rgba(217,119,6,.15)!important}
      .walkthroughControlsPanel .businessRecordsCard .drivePill.connected{border-color:#16a34a!important;background:#f0fdf4!important;color:#166534!important;box-shadow:0 0 0 4px rgba(22,163,74,.10)!important}
      .walkthroughControlsPanel .businessRecordsCard .drivePill.connected::before{background:#16a34a!important;box-shadow:0 0 0 3px rgba(22,163,74,.18)!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-top:10px!important;align-items:stretch!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions button,
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions a{width:100%!important;min-height:46px!important;border-radius:14px!important;font-weight:950!important;display:grid!important;grid-template-columns:auto 1fr!important;align-items:center!important;justify-items:start!important;column-gap:8px!important;text-align:left!important;padding:8px 10px!important;position:relative!important;white-space:normal!important;line-height:1.15!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions [data-tha-drive-step]::before{content:attr(data-tha-drive-step)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:24px!important;height:24px!important;border-radius:999px!important;background:#eef6fa!important;border:1px solid #cfe0e8!important;color:#315568!important;font-size:11px!important;font-weight:950!important;grid-row:1 / span 2!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions [data-tha-drive-help]::after{content:attr(data-tha-drive-help)!important;display:block!important;grid-column:2!important;font-size:10px!important;font-weight:850!important;color:#60717c!important;margin-top:2px!important;line-height:1.2!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-connect-needed{border:2px solid #d97706!important;background:#fffaf0!important;color:#8a4b08!important;box-shadow:0 0 0 4px rgba(217,119,6,.10)!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-connected{border:2px solid #1d4ed8!important;background:#eff6ff!important;color:#1e3a8a!important;box-shadow:0 0 0 4px rgba(37,99,235,.10)!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-save-primary{border:2px solid #16a34a!important;background:#fff!important;color:#166534!important;box-shadow:none!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-save-waiting{border:2px solid #cbd5e1!important;background:#fff!important;color:#475569!important;box-shadow:none!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-sync-attention{border:2px solid #eab308!important;background:#fefce8!important;color:#854d0e!important;box-shadow:0 0 0 4px rgba(234,179,8,.10)!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-open-folder{border:1px solid #93c5fd!important;background:#eff6ff!important;color:#1e3a8a!important}
      .walkthroughControlsPanel .businessRecordsCard .tha-drive-hidden-duplicate{display:none!important}
      .walkthroughControlsPanel .businessRecordsCard button[aria-label*="collapse" i],
      .walkthroughControlsPanel .businessRecordsCard button[title*="collapse" i],
      .walkthroughControlsPanel .businessRecordsCard button[aria-label*="records" i][aria-label*="close" i],
      .walkthroughControlsPanel .businessRecordsCard button[title*="records" i][title*="close" i]{display:none!important;visibility:hidden!important}

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

  function assignDriveButtonMeta(button, step, help) {
    button.setAttribute('data-tha-drive-step', step);
    button.setAttribute('data-tha-drive-help', help);
  }

  function cleanDriveTile(business) {
    business.querySelectorAll('.tha-drive-simple-guide,.tha-drive-oauth-diagnostic,.tha-drive-failure-guidance').forEach(node => node.remove());

    const drivePill = business.querySelector('.drivePill');
    const connected = Boolean(drivePill?.classList.contains('connected'));
    if (drivePill) {
      drivePill.title = connected ? 'Reporting status: Google Drive is connected for this browser session.' : 'Reporting status: Google Drive is not connected yet.';
    }

    business.querySelectorAll('button').forEach(button => {
      const label = textOf(button).toLowerCase();
      if (/collapse.*records|records.*collapse|close.*records|records.*close/.test(label)) button.remove();
    });

    const buttons = Array.from(business.querySelectorAll('.driveSetupActions button,.driveSetupActions a'));
    let saveSeen = false;

    buttons.forEach(button => {
      const label = textOf(button).toLowerCase();
      button.classList.remove('tha-drive-connect-needed','tha-drive-connected','tha-drive-save-primary','tha-drive-save-waiting','tha-drive-sync-attention','tha-drive-open-folder','tha-drive-hidden-duplicate');
      button.removeAttribute('data-tha-drive-step');
      button.removeAttribute('data-tha-drive-help');

      if (/connect google drive|drive connected|connecting/.test(label)) {
        if (!connected && button.disabled && !/connecting/.test(label)) button.disabled = false;
        button.classList.add(connected ? 'tha-drive-connected' : 'tha-drive-connect-needed');
        button.title = connected ? 'Action A complete: Google Drive is connected for this browser session.' : 'Action A: connect this browser session to Google Drive. Troubleshooting is under Advanced.';
        assignDriveButtonMeta(button, 'A', connected ? 'Connected for this browser session.' : 'Authorize this browser to upload files.');
        return;
      }
      if (/save.*(drive|pmr).*package|save package|upload drive package/.test(label)) {
        if (saveSeen) button.classList.add('tha-drive-hidden-duplicate');
        else {
          saveSeen = true;
          button.classList.add(connected ? 'tha-drive-save-primary' : 'tha-drive-save-waiting');
          assignDriveButtonMeta(button, 'B', connected ? 'Uploads PMR package, photos, and backup data.' : 'Available after Drive connects.');
        }
        return;
      }
      if (/open.*folder|last drive folder/.test(label)) {
        button.classList.add('tha-drive-open-folder');
        assignDriveButtonMeta(button, 'C', 'Opens the last saved Drive package folder.');
        return;
      }
      if (/sync pending photos|sync photos/.test(label)) {
        button.classList.add('tha-drive-sync-attention');
        assignDriveButtonMeta(button, 'D', 'Pushes any locally pending photos after connection.');
        return;
      }
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