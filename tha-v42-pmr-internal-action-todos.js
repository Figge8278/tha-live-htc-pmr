(() => {
  const SCRIPT_ID = 'tha-v42-pmr-internal-action-todos';
  const STYLE_ID = 'tha-v42-pmr-internal-action-todos-styles';
  const CACHE_KEY = 'tha-v42-latest-action-todo-html';
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
      main.passWorkspace .thaActionTodoList{display:none!important;visibility:hidden!important}
      .tha-v42-pass-moved-note{border:1px solid #d8e4ea;border-left:5px solid #7c3aed;border-radius:16px;background:#fbf7ff;padding:12px 14px;margin:14px 0;color:#203040;box-shadow:0 6px 14px rgba(76,58,114,.07)}
      .tha-v42-pass-moved-note strong{display:block;color:#4c3a72;font-size:14px}.tha-v42-pass-moved-note span{display:block;color:#40505f;font-size:12px;margin-top:3px;line-height:1.35}
      .tha-v42-pmr-action-shell{border:1px solid #d8e4ea;border-left:6px solid #7c3aed;border-radius:20px;background:#fff;padding:18px;margin:18px 0;box-shadow:0 8px 22px rgba(76,58,114,.08)}
      .tha-v42-pmr-action-shell h2{margin:0 0 6px!important;color:#0b3658!important;display:flex!important;align-items:center!important;gap:8px!important}
      .tha-v42-pmr-action-shell .tha-v42-kicker{margin:0 0 8px;color:#7c3aed;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:950}
      .tha-v42-pmr-action-shell .tha-v42-lede{margin:0 0 14px;color:#40505f;line-height:1.45}
      .tha-v42-visibility-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:12px 0 16px}
      .tha-v42-visibility-card{border:1px solid #d8e4ea;border-radius:15px;background:#fbfdfe;padding:11px 12px}
      .tha-v42-visibility-card.client{border-left:5px solid #0b3658}.tha-v42-visibility-card.internal{border-left:5px solid #7c3aed}.tha-v42-visibility-card.followup{border-left:5px solid #52aa4b}
      .tha-v42-visibility-card strong{display:block;color:#0b3658;font-size:13px}.tha-v42-visibility-card span{display:block;color:#40505f;font-size:12px;margin-top:3px;line-height:1.35}
      .tha-v42-client-summary{border:1px solid #d8e4ea;border-radius:16px;background:#f6f9fb;padding:12px;margin:12px 0}
      .tha-v42-client-summary h3{margin:0 0 8px!important;color:#0b3658!important;font-size:16px!important}.tha-v42-client-summary p{margin:6px 0;color:#203040}
      .tha-v42-internal-list{border-top:1px solid #eadbc2;margin-top:14px;padding-top:14px}
      .tha-v42-internal-list .pmrBlock{box-shadow:none!important;border:0!important;margin:0!important;padding:0!important;background:transparent!important}
      .tha-v42-internal-list .thaActionTodoList>h2{display:none!important}.tha-v42-internal-list .thaActionTodoList>.lede{display:none!important}
      .tha-v42-stale-note{border:1px solid #f2a45f;border-left:5px solid #f2a45f;background:#fffaf0;border-radius:14px;padding:10px 12px;color:#805000;margin:10px 0;font-weight:800;font-size:12px}
      @media print{.tha-v42-pmr-action-shell{break-inside:avoid}.tha-v42-pass-moved-note{display:none!important}}
    `;
    document.head.append(style);
  }

  function cachePassTodoList() {
    const passMain = document.querySelector('main.passWorkspace');
    const source = passMain?.querySelector('.thaActionTodoList');
    if (!source) return;
    const clone = source.cloneNode(true);
    clone.querySelector('h2')?.replaceChildren(document.createTextNode('THA Action To-Do List — Internal THA'));
    clone.querySelectorAll('button,.noPrint').forEach(node => node.remove());
    localStorage.setItem(CACHE_KEY, clone.outerHTML);

    if (!passMain.querySelector('.tha-v42-pass-moved-note')) {
      const note = document.createElement('section');
      note.className = 'tha-v42-pass-moved-note';
      note.innerHTML = '<strong>THA Action To-Do List moved to PMR</strong><span>PASS stays focused on building the PMCP. Internal THA task reporting now lives on the PMR page under the internal action section, with client-facing and internal usage separated.</span>';
      const planSummary = passMain.querySelector('.passPlanSummary') || source;
      if (planSummary?.parentNode) planSummary.parentNode.insertBefore(note, planSummary.nextSibling);
      else passMain.append(note);
    }
  }

  function clientActionSummaryHtml(pmrMain) {
    const summary = pmrMain.querySelector('.workOrderSummary');
    if (!summary) {
      return '<section class="tha-v42-client-summary"><h3>Client-facing THA follow-up summary</h3><p>No client-facing THA action items are currently marked on the PMR.</p></section>';
    }
    const clone = summary.cloneNode(true);
    clone.querySelector('h2')?.replaceChildren(document.createTextNode('Client-facing THA follow-up summary'));
    clone.querySelectorAll('button,.noPrint').forEach(node => node.remove());
    return `<section class="tha-v42-client-summary">${clone.innerHTML}</section>`;
  }

  function cachedInternalListHtml() {
    const cached = localStorage.getItem(CACHE_KEY) || '';
    if (cached) return cached;
    return '<div class="tha-v42-stale-note">Open PASS once after marking PMCP THA Action Items so the PMR can sync the full PMCP/internal to-do list. HTC and room-overview action summaries already appear above when marked.</div>';
  }

  function ensurePmrActionSection() {
    const pmrMain = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmrMain) return;
    const existing = pmrMain.querySelector('.tha-v42-pmr-action-shell');
    const anchor = pmrMain.querySelector('.passPlanSummary') || pmrMain.querySelector('.roomIssueSummary') || pmrMain.querySelector('.findingTypeSummary');
    if (!anchor?.parentNode) return;

    const html = `
      <p class="tha-v42-kicker">Internal THA / PMR support</p>
      <h2>THA Action To-Do List</h2>
      <p class="tha-v42-lede">This is the PMR-side action reporting area. It separates what can be discussed with the homeowner from what belongs in THA office follow-up, Airtable, calendar reminders, trade coordination, and scheduling.</p>
      <div class="tha-v42-visibility-grid">
        <div class="tha-v42-visibility-card client"><strong>Client-facing</strong><span>Confirmed PMR findings and plain-English next steps the homeowner may see.</span></div>
        <div class="tha-v42-visibility-card internal"><strong>Internal THA</strong><span>Working tasks, raw follow-up context, action types, uncertainty, and office notes.</span></div>
        <div class="tha-v42-visibility-card followup"><strong>Airtable / calendar follow-up</strong><span>Reminder dates, scheduling status, vendor coordination, and automation-ready fields.</span></div>
      </div>
      ${clientActionSummaryHtml(pmrMain)}
      <section class="tha-v42-internal-list"><h3>Internal THA task detail</h3>${cachedInternalListHtml()}</section>
    `;

    if (existing) {
      existing.innerHTML = html;
      return;
    }
    const section = document.createElement('section');
    section.className = 'tha-v42-pmr-action-shell';
    section.innerHTML = html;
    anchor.parentNode.insertBefore(section, anchor);
  }

  function markOriginalSummaryAsClientFacing() {
    const summary = document.querySelector('main.pmr:not(.passWorkspace) .workOrderSummary');
    if (!summary) return;
    summary.setAttribute('data-tha-v42-client-summary-source', 'true');
    const h2 = summary.querySelector('h2');
    if (h2 && !/Client-facing/i.test(textOf(h2))) h2.append(document.createTextNode(' — Client-facing source'));
  }

  function sync() {
    installStyles();
    cachePassTodoList();
    ensurePmrActionSection();
    markOriginalSummaryAsClientFacing();
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
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  sync();
})();