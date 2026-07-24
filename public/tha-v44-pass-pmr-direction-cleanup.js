(() => {
  const SCRIPT_ID = 'tha-v44-pass-pmr-direction-cleanup';
  const STYLE_ID = 'tha-v44-pass-pmr-direction-cleanup-styles';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-v44-direction-banner{border:1px solid #d8e4ea;border-left:6px solid #bf8420;border-radius:18px;background:#fffdf8;padding:14px 16px;margin:14px 0;color:#203040;box-shadow:0 8px 20px rgba(13,44,73,.07)}
      .tha-v44-direction-banner strong{display:block;color:#0b3658;font-size:16px;margin-bottom:4px}.tha-v44-direction-banner p{margin:4px 0;color:#40505f;font-size:13px;line-height:1.4}.tha-v44-direction-banner .laneGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:10px}.tha-v44-direction-banner .laneCard{border:1px solid #d8e4ea;border-radius:14px;background:#fff;padding:10px}.tha-v44-direction-banner .laneCard span{display:block;color:#8a641f;text-transform:uppercase;letter-spacing:.07em;font-size:10px;font-weight:950;margin-bottom:3px}.tha-v44-direction-banner .laneCard b{display:block;color:#0b3658;font-size:13px}.tha-v44-direction-banner .laneCard small{display:block;color:#60717c;font-weight:800;line-height:1.25;margin-top:2px}
      main.passWorkspace .thaActionTodoList,main.passWorkspace [data-tha-v44-pass-internal-hidden="true"]{display:none!important;visibility:hidden!important}
      main.passWorkspace .tha-v44-pass-handoff-note{border:1px dashed #c8d8e0;border-radius:16px;background:#f8fbfd;color:#315568;padding:12px 14px;margin:12px 0;font-size:13px;line-height:1.35}.tha-v44-pass-handoff-note strong{display:block;color:#0b3658;margin-bottom:3px}.tha-v44-pass-handoff-note button{margin-top:8px}
      main.passWorkspace .passReviewPanel{border-left:6px solid #52aa4b!important}.passReviewPanel .includeToggle{box-shadow:0 0 0 3px rgba(82,170,75,.10)!important;border-color:#b9dfb4!important}.passReviewPanel .includeToggle span strong::after{content:' → homeowner PMCP';font-weight:850;color:#285c30}
      main.passWorkspace .workOrderActionPanel{box-shadow:0 0 0 3px rgba(126,76,154,.10)!important}.passWorkspace .passPlanSummary{border-left:6px solid #315568!important;background:#fbfdfe!important}
      .pmr .tha-v44-output-map{border-left-color:#315568}.pmr .tha-v44-output-map .client{border-left:4px solid #52aa4b}.pmr .tha-v44-output-map .internal{border-left:4px solid #7e4c9a}.pmr .tha-v44-output-map .followup{border-left:4px solid #bf8420}
      .pmr .tha-v44-lane-chip{display:inline-flex;align-items:center;border-radius:999px;border:1px solid #d8e4ea;background:#fff;color:#0b3658;padding:4px 8px;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px}.pmrBlock[data-tha-v44-lane="internal"]{border-left:6px solid #7e4c9a!important}.pmrBlock[data-tha-v44-lane="client"]{border-left:6px solid #52aa4b!important}.pmrBlock[data-tha-v44-lane="pmcp"]{border-left:6px solid #315568!important}.pmrBlock[data-tha-v44-lane="reference"]{border-left:6px solid #bf8420!important}
      .pmrBlock[data-tha-v44-lane="internal"]>.tha-v44-lane-chip{color:#5a2f74;background:#fbf7ff;border-color:#dfccef}.pmrBlock[data-tha-v44-lane="client"]>.tha-v44-lane-chip{color:#285c30;background:#f7fcf5;border-color:#b9dfb4}.pmrBlock[data-tha-v44-lane="pmcp"]>.tha-v44-lane-chip{color:#173e57;background:#f6fbfd;border-color:#cfe0e8}.pmrBlock[data-tha-v44-lane="reference"]>.tha-v44-lane-chip{color:#8a641f;background:#fffdf8;border-color:#eadbc2}
      .pmr .thaActionTodoList{order:20}.pmr .thaActionTodoList h2::after,.pmr .workOrderSummary h2::after{content:' Internal THA';display:inline-flex;margin-left:8px;border-radius:999px;padding:4px 8px;background:#fbf7ff;border:1px solid #dfccef;color:#5a2f74;font-size:10px;text-transform:uppercase;letter-spacing:.05em;vertical-align:middle}.pmr .passPlanSummary h2::after{content:' PMCP';display:inline-flex;margin-left:8px;border-radius:999px;padding:4px 8px;background:#f6fbfd;border:1px solid #cfe0e8;color:#173e57;font-size:10px;text-transform:uppercase;letter-spacing:.05em;vertical-align:middle}
      @media(max-width:900px){.tha-v44-direction-banner{margin:10px 0;padding:12px}.tha-v44-direction-banner .laneGrid{grid-template-columns:1fr}}
      @media print{main.passWorkspace .tha-v44-direction-banner,main.passWorkspace .tha-v44-pass-handoff-note,.pmr .tha-v44-output-map{display:none!important}}
    `;
    document.head.append(style);
  }

  function insertAfter(target, node) {
    if (!target?.parentNode || !node) return;
    target.parentNode.insertBefore(node, target.nextSibling);
  }

  function ensurePassDirection() {
    const main = document.querySelector('main.passWorkspace');
    if (!main) return;
    const header = main.querySelector('.pmrHeader');
    if (header && !main.querySelector('.tha-v44-pass-direction')) {
      const banner = document.createElement('section');
      banner.className = 'tha-v44-direction-banner tha-v44-pass-direction';
      banner.innerHTML = '<strong>PASS is the PMCP builder, not the report.</strong><p>Use this page to review routine care possibilities, select homeowner PMCP items, and mark internal THA follow-up. The actual reporting view belongs on the PMR page.</p><div class="laneGrid"><div class="laneCard"><span>Here</span><b>Build / select PMCP</b><small>Routine care possibilities and selected care-plan items.</small></div><div class="laneCard"><span>PMR page</span><b>Report / separate visibility</b><small>Client PMR, Internal THA, and Airtable/calendar follow-up.</small></div></div>';
      insertAfter(header, banner);
    }

    main.querySelectorAll('.thaActionTodoList').forEach(section => section.setAttribute('data-tha-v44-pass-internal-hidden', 'true'));

    if (!main.querySelector('.tha-v44-pass-handoff-note')) {
      const target = main.querySelector('.passPlanSummary') || main.querySelector('.passReviewPanel') || main.querySelector('.pmrBlock');
      if (target?.parentNode) {
        const note = document.createElement('section');
        note.className = 'tha-v44-pass-handoff-note';
        note.innerHTML = '<strong>Internal action reporting moved to PMR.</strong><span>PASS can still create THA follow-up context, but the THA Action To-Do List is reviewed on the PMR page where client-facing and internal lanes are separated.</span>';
        insertAfter(target, note);
      }
    }

    main.querySelectorAll('h1,h2,h3').forEach(heading => {
      const text = textOf(heading);
      if (/^In-app Preventative Maintenance Care Plan$/i.test(text)) heading.textContent = 'PASS Builder Snapshot';
      if (/^Preventative Maintenance Care Plan Builder$/i.test(text)) heading.textContent = 'PASS / PMCP Builder';
    });
  }

  function laneForBlock(block) {
    const text = textOf(block.querySelector('h2,h3') || block).toLowerCase();
    if (/tha action|near-term follow-up|work order|internal|airtable|office/.test(text)) return { lane: 'internal', label: 'Internal THA' };
    if (/pass|pmcp|preventative maintenance care plan|baseline home care|home-specific care/.test(text)) return { lane: 'pmcp', label: 'PMCP / Care Plan' };
    if (/detail appendix|homeowner goals|intake context|planning guides|photo inbox|visibility/.test(text)) return { lane: 'reference', label: 'Reference / Review' };
    if (/plain-english|home health|room-by-room|trade-by-trade|summary by finding|findings|snapshot/.test(text)) return { lane: 'client', label: 'Client PMR' };
    return null;
  }

  function addLaneChip(block, lane, label) {
    if (!block || block.querySelector(':scope > .tha-v44-lane-chip')) return;
    block.setAttribute('data-tha-v44-lane', lane);
    const chip = document.createElement('span');
    chip.className = 'tha-v44-lane-chip';
    chip.textContent = label;
    block.prepend(chip);
  }

  function ensurePmrDirection() {
    const main = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!main) return;
    const header = main.querySelector('.pmrHeader');
    if (header && !main.querySelector('.tha-v44-output-map')) {
      const banner = document.createElement('section');
      banner.className = 'tha-v44-direction-banner tha-v44-output-map';
      banner.innerHTML = '<strong>PMR output map</strong><p>This page is now the reporting side. Client-facing PMR items, Internal THA action items, and Airtable/calendar follow-up stay visibly separated.</p><div class="laneGrid"><div class="laneCard client"><span>Client PMR</span><b>Clean homeowner-facing report</b><small>Findings, next steps, PMCP summary, and approved photo evidence.</small></div><div class="laneCard internal"><span>Internal THA</span><b>Office action list</b><small>THA follow-up, uncertainty, tasking, and vendor coordination.</small></div><div class="laneCard followup"><span>Airtable / Calendar</span><b>Future reminders</b><small>PMCP reminders and follow-up rows for operations.</small></div></div>';
      insertAfter(header, banner);
    }

    main.querySelectorAll('.pmrBlock,.snapshot').forEach(block => {
      const lane = laneForBlock(block);
      if (lane) addLaneChip(block, lane.lane, lane.label);
    });

    const todo = main.querySelector('.thaActionTodoList');
    const summary = Array.from(main.querySelectorAll('.pmrBlock')).find(block => /Plain-English Summary/i.test(textOf(block)));
    if (todo && summary && todo.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING) {
      insertAfter(summary, todo);
    }
  }

  function sync() {
    installStyles();
    ensurePassDirection();
    ensurePmrDirection();
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
