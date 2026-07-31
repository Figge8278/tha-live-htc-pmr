(() => {
  const SCRIPT_ID = 'tha-v45-simplify-pass-office-tools';
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
      /* Pull the newest advanced tooling back out of the live field path. */
      .walkthroughControlsPanel .tha-v43-photo-inbox,
      main.intakePage > .tha-v43-photo-inbox,
      .walkthroughControlsPanel .tha-v45-hidden-office-tool{
        display:none!important;
        visibility:hidden!important;
      }

      /* PASS should feel like a care-plan/service selector, not another inspection form. */
      main.passWorkspace .tha-v44-direction-banner,
      main.passWorkspace .tha-v44-pass-handoff-note,
      main.passWorkspace .tha-v43-visibility-panel,
      main.passWorkspace .passSourceEvidence,
      main.passWorkspace .passReviewFields .passSourceEvidence,
      main.passWorkspace .passReviewFields .passInternalNote,
      main.passWorkspace .passReviewCard .sourceBadge{
        display:none!important;
        visibility:hidden!important;
      }
      main.passWorkspace .pmrHeader{
        margin-bottom:12px!important;
      }
      main.passWorkspace .pmrHeader p:not(.eyebrow){
        max-width:760px!important;
      }
      main.passWorkspace .frontSummary{
        border-left:6px solid #52aa4b!important;
        background:#fbfef9!important;
      }
      main.passWorkspace .passReviewPanel{
        border-left:6px solid #52aa4b!important;
        background:#fff!important;
      }
      main.passWorkspace .passReviewPanel .collapsibleSummary{
        color:#40505f!important;
      }
      main.passWorkspace .passReviewPanel > .collapsibleHeader h2::after{
        content:' simplified service menu';
        display:inline-flex;
        margin-left:8px;
        border:1px solid #b9dfb4;
        background:#f7fcf5;
        color:#285c30;
        border-radius:999px;
        padding:4px 8px;
        font-size:10px;
        letter-spacing:.05em;
        text-transform:uppercase;
        vertical-align:middle;
      }
      main.passWorkspace .passCategoryHeader{
        padding:12px 14px!important;
      }
      main.passWorkspace .passCategoryHeader .passCategoryCount{
        opacity:.82!important;
      }
      main.passWorkspace .passReviewGrid{
        grid-template-columns:repeat(auto-fit,minmax(260px,1fr))!important;
        gap:10px!important;
      }
      main.passWorkspace .passReviewCard{
        border-radius:16px!important;
        box-shadow:0 4px 12px rgba(13,44,73,.05)!important;
        border-left-width:5px!important;
      }
      main.passWorkspace .passReviewCardHeader{
        padding:12px!important;
      }
      main.passWorkspace .passReviewBadgeRow{
        gap:6px!important;
        margin-bottom:5px!important;
      }
      main.passWorkspace .passWorkflowBadge,
      main.passWorkspace .passReviewBadgeRow .categoryBadge{
        transform:scale(.92);
        transform-origin:left center;
      }
      main.passWorkspace .passReviewTitle h4{
        font-size:16px!important;
        line-height:1.2!important;
        margin:3px 0!important;
      }
      main.passWorkspace .passReviewSubline,
      main.passWorkspace .passReviewCadence{
        font-size:12px!important;
        margin:2px 0!important;
      }
      main.passWorkspace .passReviewSummary{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:8px!important;
        margin:0 12px 10px!important;
      }
      main.passWorkspace .passReviewSummaryItem{
        padding:8px!important;
        border-radius:12px!important;
      }
      main.passWorkspace .passReviewSummaryItem strong{
        font-size:11px!important;
      }
      main.passWorkspace .passReviewSummaryItem p{
        font-size:12px!important;
        margin:2px 0 0!important;
      }
      main.passWorkspace .passReviewTop{
        padding:0 12px 10px!important;
        gap:8px!important;
      }
      main.passWorkspace .includeToggle{
        margin:0!important;
        padding:9px!important;
        border-radius:13px!important;
      }
      main.passWorkspace .includeToggle span strong{
        font-size:13px!important;
      }
      main.passWorkspace .includeToggle span small{
        font-size:11px!important;
        line-height:1.25!important;
      }
      main.passWorkspace .workOrderActionPanel{
        margin:0 12px 10px!important;
        padding:9px!important;
        border-radius:13px!important;
        background:#fbf8ff!important;
        border-style:dashed!important;
        box-shadow:none!important;
      }
      main.passWorkspace .workOrderActionPanel small,
      main.passWorkspace .thaActionTypeField small{
        display:none!important;
      }
      main.passWorkspace .thaActionTypeField{
        font-size:11px!important;
      }
      main.passWorkspace .passReviewDetailsToggle{
        padding:0 12px 12px!important;
      }
      main.passWorkspace .passReviewDetailsToggle .secondaryBtn::after{
        content:' only if needed';
        font-weight:800;
        opacity:.75;
      }
      main.passWorkspace .passReviewFields{
        margin:0 12px 12px!important;
        padding:10px!important;
        border-radius:13px!important;
        background:#fbfdfe!important;
      }

      /* Keep the report understandable without turning every block into a loud data lane. */
      main.pmr:not(.passWorkspace) .tha-v44-output-map{
        display:none!important;
        visibility:hidden!important;
      }
      main.pmr:not(.passWorkspace) .tha-v44-lane-chip{
        font-size:9px!important;
        padding:3px 6px!important;
        opacity:.72!important;
        margin-bottom:4px!important;
      }
      main.pmr:not(.passWorkspace) .tha-v43-visibility-panel{
        display:none!important;
        visibility:hidden!important;
      }
      main.pmr:not(.passWorkspace) .tha-v45-output-strip{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        align-items:center;
        border:1px solid #d8e4ea;
        background:#f8fbfd;
        border-left:5px solid #315568;
        border-radius:14px;
        padding:10px 12px;
        margin:10px 0 14px;
        color:#203040;
        font-size:12px;
      }
      main.pmr:not(.passWorkspace) .tha-v45-output-strip strong{color:#0b3658;margin-right:4px}
      main.pmr:not(.passWorkspace) .tha-v45-output-strip span{border:1px solid #d8e4ea;background:#fff;border-radius:999px;padding:4px 8px;font-weight:900;color:#315568}

      .tha-v45-pass-packages{
        border:1px solid #d8e4ea;
        border-left:6px solid #52aa4b;
        background:#fbfef9;
        border-radius:18px;
        padding:14px 16px;
        margin:12px 0;
        color:#203040;
        box-shadow:0 6px 16px rgba(13,44,73,.05);
      }
      .tha-v45-pass-packages h2{margin:0 0 4px;color:#0b3658;font-size:18px}
      .tha-v45-pass-packages p{margin:3px 0;color:#40505f;font-size:13px;line-height:1.35}
      .tha-v45-package-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin-top:10px}
      .tha-v45-package-card{border:1px solid #d8e4ea;background:#fff;border-radius:14px;padding:10px}
      .tha-v45-package-card strong{display:block;color:#0b3658;font-size:14px;margin-bottom:3px}
      .tha-v45-package-card small{display:block;color:#60717c;font-weight:800;line-height:1.25}

      .tha-v45-office-photo-tool{
        border:1px solid #d8e4ea;
        border-left:5px solid #7e4c9a;
        background:#fbf8ff;
        border-radius:16px;
        margin:12px 0;
        color:#203040;
        overflow:hidden;
      }
      .tha-v45-office-photo-tool > summary{
        cursor:pointer;
        list-style:none;
        padding:12px 14px;
        display:flex;
        flex-direction:column;
        gap:3px;
      }
      .tha-v45-office-photo-tool > summary::-webkit-details-marker{display:none}
      .tha-v45-office-photo-tool > summary strong{color:#0b3658;font-size:15px}
      .tha-v45-office-photo-tool > summary small{color:#60717c;font-weight:800;line-height:1.3}
      .tha-v45-office-photo-tool .tha-v45-office-photo-body{padding:0 14px 14px;border-top:1px solid #e4d9f4;background:#fff}
      .tha-v45-office-photo-tool .tha-v43-photo-inbox{display:block!important;visibility:visible!important;border:0!important;box-shadow:none!important;margin:10px 0 0!important;padding:0!important;background:#fff!important}
      .tha-v45-office-photo-tool .tha-v43-photo-inbox h4{display:none!important}
      .tha-v45-office-photo-tool .tha-v43-photo-inbox p{font-size:12px!important}
      .tha-v45-office-photo-tool:not([open]) .tha-v43-photo-inbox{display:none!important}

      @media(max-width:760px){
        main.passWorkspace .passReviewSummary{grid-template-columns:1fr!important}
        .tha-v45-package-grid{grid-template-columns:1fr}
      }
      @media print{
        .tha-v45-pass-packages,
        .tha-v45-office-photo-tool,
        main.pmr:not(.passWorkspace) .tha-v45-output-strip{display:none!important}
      }
    `;
    document.head.append(style);
  }

  function insertAfter(target, node) {
    if (!target?.parentNode || !node) return;
    target.parentNode.insertBefore(node, target.nextSibling);
  }

  function buildPackageGuide() {
    const section = document.createElement('section');
    section.className = 'tha-v45-pass-packages';
    section.innerHTML = `
      <h2>PASS Service Packages</h2>
      <p>Start with simple service blocks. Open individual items only when a package needs a different cadence, timing, or follow-up note.</p>
      <div class="tha-v45-package-grid">
        <article class="tha-v45-package-card"><strong>Kitchen Refresh</strong><small>Cabinet touch-up, pulls/hinges, sink-base check, appliance filter/vent check · 30–60 min</small></article>
        <article class="tha-v45-package-card"><strong>Bathroom Refresh</strong><small>Caulk check, fan check, toilet movement, supply/shutoff review · 15–30 min per bath</small></article>
        <article class="tha-v45-package-card"><strong>Laundry / Dryer Vent</strong><small>Dryer vent check/cleaning path, washer hose/shutoff review · about 30 min</small></article>
        <article class="tha-v45-package-card"><strong>Seasonal Exterior</strong><small>Hose bibs, downspouts, drainage walkaround, exterior openings · 30–60 min</small></article>
      </div>
    `;
    return section;
  }

  function simplifyPass() {
    const main = document.querySelector('main.passWorkspace');
    if (!main) return;
    main.classList.add('tha-v45-simplified-pass');

    main.querySelectorAll('h1,h2,h3').forEach(heading => {
      const text = textOf(heading);
      if (/^PASS \/ PMCP Builder$/i.test(text) || /^Preventative Maintenance Care Plan Builder$/i.test(text)) heading.textContent = 'PASS Service Plan Builder';
      if (/^PASS Builder Snapshot$/i.test(text)) heading.textContent = 'Service Plan Snapshot';
      if (/^Preventative Maintenance Care Plan Builder$/i.test(text)) heading.textContent = 'PASS Service Menu';
    });

    const header = main.querySelector('.pmrHeader');
    if (header && !main.querySelector('.tha-v45-pass-packages')) insertAfter(header, buildPackageGuide());

    const reviewHeader = main.querySelector('.passReviewPanel .collapsibleHeader');
    const summary = reviewHeader?.querySelector('.collapsibleSummary');
    if (summary) summary.textContent = 'Select simple care-plan items. Open details only for exceptions, special timing, or follow-up notes.';

    main.querySelectorAll('.tha-v43-photo-inbox').forEach(node => node.remove());
  }

  function simplePmrStrip() {
    const main = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!main) return;
    const header = main.querySelector('.pmrHeader');
    if (!header || main.querySelector('.tha-v45-output-strip')) return;
    const strip = document.createElement('section');
    strip.className = 'tha-v45-output-strip';
    strip.innerHTML = '<strong>PMR lanes:</strong><span>Client Report</span><span>Internal THA</span><span>PMCP Care Plan</span><span>Office Follow-Up</span>';
    insertAfter(header, strip);
  }

  function relocatePhotoInboxToOfficeTool() {
    document.querySelectorAll('.walkthroughControlsPanel .tha-v43-photo-inbox, main.intakePage > .tha-v43-photo-inbox').forEach(node => node.remove());

    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    if (pmr.querySelector('.tha-v45-office-photo-tool')) return;

    const detailAppendix = Array.from(pmr.querySelectorAll('.pmrBlock,.collapsibleBlock')).find(block => /Detail Appendix/i.test(textOf(block.querySelector('h2') || block)));
    const target = detailAppendix || pmr.querySelector('.workOrderSummary') || pmr.querySelector('.frontSummary') || pmr.querySelector('.pmrHeader');
    if (!target) return;

    const details = document.createElement('details');
    details.className = 'tha-v45-office-photo-tool noPrint';
    details.innerHTML = `
      <summary><strong>Office tool: add later photos</strong><small>Collapsed by default. Use only during PMR review when phone/client/Drive photos need to be assigned later.</small></summary>
      <div class="tha-v45-office-photo-body"><p>Later photos should stay review-only until assigned to a room, a finding, and a visibility lane.</p></div>
    `;
    insertAfter(target, details);

    const existing = document.querySelector('.tha-v43-photo-inbox');
    if (existing) {
      details.querySelector('.tha-v45-office-photo-body').append(existing);
    }
  }

  function quietOverlays() {
    // V43 can keep re-adding photo inbox and visibility controls through observers. This keeps them out of the live path.
    document.querySelectorAll('.walkthroughControlsPanel .tha-v43-photo-inbox, main.intakePage > .tha-v43-photo-inbox').forEach(node => node.remove());
    document.querySelectorAll('main.passWorkspace .tha-v43-visibility-panel').forEach(node => node.remove());
  }

  function sync() {
    installStyles();
    simplifyPass();
    simplePmrStrip();
    relocatePhotoInboxToOfficeTool();
    quietOverlays();
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
  document.addEventListener('click', () => setTimeout(sync, 60), true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true });
  sync();
})();