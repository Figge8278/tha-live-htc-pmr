(() => {
  const SCRIPT_ID = 'tha-v48-field-cleanup-polish';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Walkthrough setup already has numbered titles. Do not also show numbered circles. */
      .walkthroughControlsPanel .walkthroughControlsBody > .controlGroup h3::before,
      .walkthroughControlsPanel .controlGroup h3::before{
        content:''!important;
        display:none!important;
      }

      /* Remove the restore/import panel from the live intake/setup path for now. */
      .tha-v38-restore-panel,
      .tha-v37-restore-panel{
        display:none!important;
        visibility:hidden!important;
      }

      /* Expanded HTC items should not repeat the title already visible in the collapsed row. */
      .checklistDetailPanel > .itemHead.expandedItemHead{
        display:none!important;
        visibility:hidden!important;
      }
      .checklistDetailPanel{
        padding-top:12px!important;
      }
      .checklistDetailPanel > .prompt{
        margin-top:0!important;
      }

      /* Blank walkthrough sections should look neutral, not pre-highlighted blue. */
      .roomNav .sectionSelect.needsStatusDecision:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext),
      .roomNav .sectionSelect.needsStatusDecision.roomRail-gray:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext),
      .roomNav .sectionSelect.needsStatusDecision.roomRail-blue:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext){
        background:#fff!important;
        border-color:#d8e4ea!important;
        color:#203040!important;
        box-shadow:none!important;
      }
      .roomNav .sectionSelect.needsStatusDecision:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext)::before,
      .roomNav .sectionSelect.needsStatusDecision:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext)::after{
        background:#d8e4ea!important;
        border-color:#d8e4ea!important;
        opacity:.65!important;
      }
      .roomNav .sectionSelect.needsStatusDecision:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext) .roomSummaryBadge,
      .roomNav .sectionSelect.needsStatusDecision:not(.active):not(.hasRoomAttention):not(.hasActionContext):not(.hasFutureContext) .summaryFlag{
        background:#f6f9fb!important;
        border-color:#d8e4ea!important;
        color:#60717c!important;
      }
    `;
    document.head.append(style);
  }

  function removeRestorePanels() {
    document.querySelectorAll('.tha-v38-restore-panel,.tha-v37-restore-panel').forEach(node => node.remove());
  }

  function sync() {
    installStyles();
    removeRestorePanels();
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
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
  sync();
})();