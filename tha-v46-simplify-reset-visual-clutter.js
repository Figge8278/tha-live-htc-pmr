(() => {
  const SCRIPT_ID = 'tha-v46-simplify-reset-visual-clutter';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.46: pull back the visual clutter from V3.43-V3.45. Keep the data helpers under the hood; remove the visible noise. */
      .tha-v43-photo-inbox,
      .tha-v45-office-photo-tool,
      main.pmr:not(.passWorkspace) .tha-v45-output-strip,
      main.pmr:not(.passWorkspace) .tha-v44-output-map,
      main.pmr:not(.passWorkspace) .tha-v44-lane-chip,
      main.pmr:not(.passWorkspace) .tha-v43-visibility-panel,
      main.passWorkspace .tha-v43-visibility-panel,
      main.passWorkspace .tha-v44-direction-banner,
      main.passWorkspace .tha-v44-pass-handoff-note,
      .walkthroughControlsPanel .tha-v43-visibility-panel,
      .walkthroughControlsPanel .tha-v43-photo-inbox{
        display:none!important;
        visibility:hidden!important;
      }

      /* Undo the fake chip/button-feeling labels added to section titles. */
      main.passWorkspace .passReviewPanel > .collapsibleHeader h2::after,
      main.pmr .thaActionTodoList h2::after,
      main.pmr .workOrderSummary h2::after,
      main.pmr .passPlanSummary h2::after{
        content:''!important;
        display:none!important;
      }

      /* Keep PASS simple and readable. */
      main.passWorkspace .passReviewPanel{
        border-left:6px solid #52aa4b!important;
      }
      main.passWorkspace .passReviewCard{
        border-radius:16px!important;
        box-shadow:0 4px 12px rgba(13,44,73,.05)!important;
      }
      main.passWorkspace .passReviewCard .sourceBadge,
      main.passWorkspace .passSourceEvidence,
      main.passWorkspace .passReviewFields .passSourceEvidence,
      main.passWorkspace .passReviewFields .passInternalNote,
      main.passWorkspace .workOrderActionPanel small,
      main.passWorkspace .thaActionTypeField small{
        display:none!important;
      }
      main.passWorkspace .passReviewDetailsToggle .secondaryBtn::after{
        content:''!important;
        display:none!important;
      }

      /* Restore proportion on the Home Health Snapshot title/icon area. */
      main.pmr:not(.passWorkspace) .homeHealthSnapshot h2,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot h2{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        line-height:1.2!important;
      }
      main.pmr:not(.passWorkspace) .homeHealthSnapshot h2 svg,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot h2 svg{
        width:22px!important;
        height:22px!important;
        min-width:22px!important;
        min-height:22px!important;
        flex:0 0 auto!important;
        stroke-width:2.25!important;
      }
      main.pmr:not(.passWorkspace) .homeHealthSnapshot .stat strong,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot .stat strong{
        font-size:clamp(28px,4.4vw,48px)!important;
        line-height:1!important;
      }
      main.pmr:not(.passWorkspace) .homeHealthSnapshot .stat span,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot .stat span{
        font-size:13px!important;
        line-height:1.25!important;
      }

      /* Keep the PMR feeling like a report, not a labeled data model. */
      main.pmr:not(.passWorkspace) .pmrBlock[data-tha-v44-lane],
      main.pmr:not(.passWorkspace) .snapshot[data-tha-v44-lane]{
        border-left-width:1px!important;
      }
      main.pmr:not(.passWorkspace) .workOrderSummary,
      main.pmr:not(.passWorkspace) .thaActionTodoList{
        border-left:6px solid #7e4c9a!important;
      }
      main.pmr:not(.passWorkspace) .passPlanSummary{
        border-left:6px solid #315568!important;
      }

      @media print{
        .tha-v43-photo-inbox,
        .tha-v45-office-photo-tool,
        .tha-v45-output-strip,
        .tha-v44-output-map,
        .tha-v44-lane-chip,
        .tha-v43-visibility-panel{display:none!important}
      }
    `;
    document.head.append(style);
  }

  function removeVisibleNoise() {
    document.querySelectorAll('.tha-v43-photo-inbox,.tha-v45-office-photo-tool,main.pmr:not(.passWorkspace) .tha-v45-output-strip,main.pmr:not(.passWorkspace) .tha-v44-output-map,main.pmr:not(.passWorkspace) .tha-v44-lane-chip,main.pmr:not(.passWorkspace) .tha-v43-visibility-panel,main.passWorkspace .tha-v43-visibility-panel,.walkthroughControlsPanel .tha-v43-visibility-panel').forEach(node => node.remove());
  }

  function normalizePassCopy() {
    const main = document.querySelector('main.passWorkspace');
    if (!main) return;
    main.querySelectorAll('h1,h2,h3').forEach(heading => {
      const text = textOf(heading);
      if (/PASS Service Plan Builder|PASS \/ PMCP Builder|Preventative Maintenance Care Plan Builder/i.test(text)) heading.textContent = 'PASS Service Plan Builder';
      if (/Preventative Maintenance Care Plan Builder/i.test(text)) heading.textContent = 'PASS Service Menu';
      if (/Service Plan Snapshot|In-app Preventative Maintenance Care Plan/i.test(text)) heading.textContent = 'Service Plan Snapshot';
    });
    const summary = main.querySelector('.passReviewPanel .collapsibleSummary');
    if (summary) summary.textContent = 'Select care-plan items. Open details only when the timing, cadence, or follow-up needs a change.';
  }

  function sync() {
    installStyles();
    removeVisibleNoise();
    normalizePassCopy();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  window.addEventListener('load', sync);
  document.addEventListener('DOMContentLoaded', sync);
  document.addEventListener('click', () => setTimeout(sync, 80), true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true });
  sync();
})();
