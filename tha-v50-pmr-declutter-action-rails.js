(() => {
  const SCRIPT_ID = 'tha-v50-pmr-declutter-action-rails';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  const ACTION_TYPE_META = {
    'Research': { icon: '🔎', label: 'Research', tone: 'research' },
    'Trade consultation': { icon: '👷', label: 'Trade consult', tone: 'trade' },
    'Estimate needed': { icon: '🧾', label: 'Estimate', tone: 'estimate' },
    'Schedule service': { icon: '📅', label: 'Schedule', tone: 'schedule' },
    'Client-approved work': { icon: '✅', label: 'Approved work', tone: 'approved' },
    'Follow-up observation': { icon: '👁️', label: 'Observe', tone: 'observe' },
    'Unknown': { icon: '', label: '', tone: 'unknown' }
  };

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.50: PMR screen follows homeowner-first order. Internal summary cuts are removed from the visible page. */
      main.pmr:not(.passWorkspace) .tha-v37-visibility-legend,
      main.pmr:not(.passWorkspace) .tha-v47-pmr-action-shell,
      main.pmr:not(.passWorkspace) .thaActionTodoList,
      main.pmr:not(.passWorkspace) .workOrderSummary,
      main.pmr:not(.passWorkspace) .roomIssueSummary,
      main.pmr:not(.passWorkspace) .findingTypeSummary,
      main.pmr:not(.passWorkspace) .guideSupportBlock,
      main.pmr:not(.passWorkspace) .roomOverviewSummaryBlock,
      main.pmr:not(.passWorkspace) .roomOverviewStatusNotes,
      main.pmr:not(.passWorkspace) .baselineCare.tha-pmr-supporting-output,
      main.pmr:not(.passWorkspace) .baselineCare.tha-supporting-builder,
      main.pmr:not(.passWorkspace) [data-tha-v50-hidden="true"]{
        display:none!important;
        visibility:hidden!important;
      }

      /* THA action color belongs on the right side. Left edge stays for condition/status structure. */
      .workOrderActionPanel,
      .passWorkspace .workOrderActionPanel,
      .checklistItemCard.hasActionSelected,
      .roomOverviewCard.hasActionSelected,
      .roomNav .sectionSelect.hasActionContext,
      .roomNav .sectionSelect.hasRoomAttention.hasActionContext{
        border-left-color:#d8e4ea!important;
      }
      .workOrderActionPanel.actionSelected,
      .workOrderActionPanel.actionContext,
      .checklistItemCard.hasActionSelected,
      .roomOverviewCard.hasActionSelected,
      .sectionSelect.hasActionContext,
      .summaryFlag.workOrder,
      .tha-v50-action-right-rail{
        box-shadow:inset -6px 0 0 #7e4c9a!important;
      }
      .workOrderActionPanel.actionContext:not(.actionSelected){
        box-shadow:inset -5px 0 0 rgba(126,76,154,.55)!important;
      }

      /* PMCP / PASS uses the right-side green rail. */
      main.pmr:not(.passWorkspace) .passCalendar,
      main.pmr:not(.passWorkspace) .passOutlook,
      main.pmr:not(.passWorkspace) .passPlanSummary,
      main.pmr:not(.passWorkspace) .tha-pmcp-timing-panel{
        border-left:1px solid #d8e4ea!important;
        box-shadow:inset -6px 0 0 #52aa4b,0 8px 22px rgba(13,44,73,.06)!important;
      }

      /* Compact action-type treatment replaces the bulky planning guide on the PMR. */
      .workOrderActionPanel[data-tha-v50-action-tone="research"]{background:#fbf8ff!important;box-shadow:inset -6px 0 0 #8d6ab3!important}
      .workOrderActionPanel[data-tha-v50-action-tone="trade"]{background:#fbf7ff!important;box-shadow:inset -6px 0 0 #744aa0!important}
      .workOrderActionPanel[data-tha-v50-action-tone="estimate"]{background:#fffaff!important;box-shadow:inset -6px 0 0 #9d63a5!important}
      .workOrderActionPanel[data-tha-v50-action-tone="schedule"]{background:#f8f6ff!important;box-shadow:inset -6px 0 0 #6d55b8!important}
      .workOrderActionPanel[data-tha-v50-action-tone="approved"]{background:#f7fbff!important;box-shadow:inset -6px 0 0 #5d4ca3!important}
      .workOrderActionPanel[data-tha-v50-action-tone="observe"]{background:#fbf8ff!important;box-shadow:inset -6px 0 0 #9570bd!important}
      .tha-v50-action-chip{
        display:inline-flex!important;
        align-items:center!important;
        gap:5px!important;
        width:max-content!important;
        border:1px solid #dfccef!important;
        background:#fff!important;
        color:#563e88!important;
        border-radius:999px!important;
        padding:4px 8px!important;
        margin:6px 0 0!important;
        font-size:11px!important;
        font-weight:950!important;
        letter-spacing:.02em!important;
      }
      .tha-v50-action-chip[data-tone="schedule"]{border-color:#c8c0ef!important;color:#493b91!important}
      .tha-v50-action-chip[data-tone="estimate"]{border-color:#e1c5e6!important;color:#743a7c!important}
      .tha-v50-action-chip[data-tone="approved"]{border-color:#c8c0ef!important;color:#493b91!important}

      @media print{
        .tha-v37-visibility-legend,
        .tha-v47-pmr-action-shell,
        .thaActionTodoList,
        .workOrderSummary,
        .roomIssueSummary,
        .findingTypeSummary,
        .guideSupportBlock,
        .roomOverviewSummaryBlock,
        .roomOverviewStatusNotes,
        .baselineCare.tha-pmr-supporting-output,
        .baselineCare.tha-supporting-builder,
        [data-tha-v50-hidden="true"]{display:none!important}
      }
    `;
    document.head.append(style);
  }

  function hideByHeading() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const hidePatterns = [
      /output visibility/i,
      /THA\s+(internal\s+)?action\s+(to-do|to-dos|items)/i,
      /near-term follow-up/i,
      /room[- ]by[- ]room issue count/i,
      /summary by finding type/i,
      /planning guides/i,
      /room overview status notes/i,
      /home-specific care supported by intake/i,
      /optional supporting home care info/i,
      /supporting home care info/i
    ];

    Array.from(pmr.querySelectorAll('section,.pmrBlock,.collapsibleBlock,details,article')).forEach(section => {
      const heading = textOf(section.querySelector('h1,h2,h3,summary') || section);
      if (hidePatterns.some(pattern => pattern.test(heading))) {
        section.setAttribute('data-tha-v50-hidden', 'true');
      }
    });
  }

  function actionMeta(value = '') {
    return ACTION_TYPE_META[String(value || '').trim()] || ACTION_TYPE_META.Unknown;
  }

  function applyActionTypeVisuals() {
    document.querySelectorAll('.workOrderActionPanel').forEach(panel => {
      const select = panel.querySelector('.thaActionTypeField select');
      if (!select) return;
      const meta = actionMeta(select.value);
      panel.dataset.thaV50ActionTone = meta.tone || 'unknown';
      panel.querySelectorAll('.tha-v50-action-chip').forEach(chip => chip.remove());
      if (!meta.label) return;
      const chip = document.createElement('span');
      chip.className = 'tha-v50-action-chip';
      chip.dataset.tone = meta.tone;
      chip.textContent = `${meta.icon} ${meta.label}`.trim();
      const field = panel.querySelector('.thaActionTypeField');
      if (field) field.append(chip);
    });
  }

  function explainPlainEnglish() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const block = Array.from(pmr.querySelectorAll('.pmrBlock,.collapsibleBlock,section')).find(section => /plain-english summary/i.test(textOf(section.querySelector('h2,h3,summary') || section)));
    if (!block || block.querySelector('.tha-v50-plain-english-note')) return;
    const note = document.createElement('p');
    note.className = 'lede tha-v50-plain-english-note';
    note.textContent = 'Quick homeowner-facing orientation before the detailed room-by-room and trade-by-trade views. Keep this short; it should not repeat the full PMR.';
    const existingLede = block.querySelector('.lede,p');
    if (existingLede?.parentNode) existingLede.parentNode.insertBefore(note, existingLede.nextSibling);
    else block.append(note);
  }

  function sync() {
    installStyles();
    hideByHeading();
    applyActionTypeVisuals();
    explainPlainEnglish();
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
  document.addEventListener('change', scheduleSync, true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
  sync();
})();