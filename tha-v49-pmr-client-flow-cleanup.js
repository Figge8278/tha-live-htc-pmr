(() => {
  const SCRIPT_ID = 'tha-v49-pmr-client-flow-cleanup';
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
      /* V3.49: PMR reads client-first. Internal/office items move low and use right-side THA purple context. */
      main.pmr:not(.passWorkspace) .tha-v49-hide,
      main.pmr:not(.passWorkspace) .tha-output-visibility-note,
      main.pmr:not(.passWorkspace) .outputVisibility,
      main.pmr:not(.passWorkspace) [data-output-visibility],
      main.pmr:not(.passWorkspace) [data-tha-output-visibility],
      main.pmr:not(.passWorkspace) .roomOverviewStatusNotes,
      main.pmr:not(.passWorkspace) .roomOverviewSummaryBlock{
        display:none!important;
        visibility:hidden!important;
      }

      main.pmr:not(.passWorkspace) .tha-v47-pmr-action-shell,
      main.pmr:not(.passWorkspace) .tha-v49-internal-bottom{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-right:7px solid #7e4c9a!important;
        background:#fff!important;
        box-shadow:0 8px 20px rgba(76,58,114,.06)!important;
        margin-top:24px!important;
      }
      main.pmr:not(.passWorkspace) .tha-v47-pmr-action-shell h2,
      main.pmr:not(.passWorkspace) .tha-v49-internal-bottom h2{
        color:#0b3658!important;
      }
      main.pmr:not(.passWorkspace) .tha-v49-internal-note{
        display:block;
        color:#6f547c;
        font-size:12px;
        font-weight:850;
        margin:0 0 10px;
      }

      main.pmr:not(.passWorkspace) .passPlanSummary,
      main.pmr:not(.passWorkspace) .passCalendar,
      main.pmr:not(.passWorkspace) .passOutlook{
        border-left:1px solid #d8e4ea!important;
        border-right:7px solid #52aa4b!important;
      }

      main.pmr:not(.passWorkspace) .baselineCare,
      main.pmr:not(.passWorkspace) .tha-pmr-supporting-output{
        border-left:1px solid #d8e4ea!important;
        border-right:5px solid #c9d4db!important;
        background:#fbfdfe!important;
      }
      main.pmr:not(.passWorkspace) .tha-v49-support-collapsed .passCalendarCareGroup,
      main.pmr:not(.passWorkspace) .tha-v49-support-collapsed .passCalendarTable,
      main.pmr:not(.passWorkspace) .tha-v49-support-collapsed .passCalendarRow,
      main.pmr:not(.passWorkspace) .tha-v49-support-collapsed .fieldGrid,
      main.pmr:not(.passWorkspace) .tha-v49-support-collapsed .passOutlookGrid,
      main.pmr:not(.passWorkspace) .tha-v49-support-collapsed .findGrid{
        display:none!important;
      }
      main.pmr:not(.passWorkspace) .tha-v49-support-note{
        border:1px solid #d8e4ea;
        border-radius:12px;
        background:#fff;
        padding:9px 11px;
        margin:8px 0 10px;
        color:#53616c;
        font-size:12px;
        line-height:1.35;
        font-weight:800;
      }

      main.pmr:not(.passWorkspace) .tha-v49-report-collapsible{
        position:relative;
      }
      main.pmr:not(.passWorkspace) .tha-v49-report-toolbar{
        display:flex;
        justify-content:flex-end;
        margin:-4px 0 10px;
      }
      main.pmr:not(.passWorkspace) .tha-v49-report-toggle{
        border:1px solid #cfe0e8!important;
        background:#fff!important;
        color:#315568!important;
        border-radius:999px!important;
        padding:7px 11px!important;
        font-size:12px!important;
        font-weight:950!important;
        cursor:pointer!important;
      }
      main.pmr:not(.passWorkspace) .tha-v49-report-collapsible.tha-v49-collapsed > *:not(.collapsibleHeader):not(.tha-v49-report-toolbar):not(h2):not(h3){
        display:none!important;
      }

      main.pmr:not(.passWorkspace) .tha-v49-plain-note{
        display:block;
        margin:4px 0 0;
        color:#60717c;
        font-size:12px;
        font-weight:800;
        line-height:1.35;
      }

      @media print{
        main.pmr:not(.passWorkspace) .tha-v49-report-toolbar,
        main.pmr:not(.passWorkspace) .tha-v49-internal-note,
        main.pmr:not(.passWorkspace) .tha-v49-support-note{display:none!important}
        main.pmr:not(.passWorkspace) .tha-v49-report-collapsible.tha-v49-collapsed > *{display:block!important}
      }
    `;
    document.head.append(style);
  }

  function headingText(block) {
    return textOf(block?.querySelector?.('h1,h2,h3,summary') || block);
  }

  function allReportBlocks(main) {
    return Array.from(main?.querySelectorAll?.(':scope > section, :scope > details, .pmrBlock, .snapshot, .collapsibleBlock') || []);
  }

  function findBlocks(main, patterns) {
    return allReportBlocks(main).filter(block => patterns.some(pattern => pattern.test(headingText(block) || textOf(block))));
  }

  function findFirstBlock(main, patterns) {
    return findBlocks(main, patterns)[0] || null;
  }

  function removeOutputVisibility(main) {
    if (!main) return;
    findBlocks(main, [/^output visibility/i, /output visibility/i]).forEach(block => block.remove());
    Array.from(main.querySelectorAll('p,div,section,article,aside')).forEach(node => {
      const text = textOf(node);
      if (/^output visibility\b/i.test(text) || /^output visibility:/i.test(text)) {
        const block = node.closest('.pmrBlock,section,details,article') || node;
        block.remove();
      }
    });
  }

  function removeRoomOverviewStandalone(main) {
    findBlocks(main, [/room overview status notes/i, /^room overview notes/i, /room overview summary/i]).forEach(block => block.remove());
  }

  function normalizePlainEnglish(main) {
    const block = findFirstBlock(main, [/plain-english summary/i, /plain english summary/i]);
    if (!block || block.querySelector('.tha-v49-plain-note')) return;
    const heading = block.querySelector('h2,h3');
    const note = document.createElement('span');
    note.className = 'tha-v49-plain-note';
    note.textContent = 'Quick homeowner-facing orientation before the room-by-room and trade-by-trade detail.';
    if (heading) heading.after(note);
  }

  function makeCollapsible(block, { startCollapsed = false } = {}) {
    if (!block || block.querySelector('.tha-v49-report-toolbar') || block.querySelector('.collapseToggle')) return;
    block.classList.add('tha-v49-report-collapsible');
    const toolbar = document.createElement('div');
    toolbar.className = 'tha-v49-report-toolbar noPrint';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tha-v49-report-toggle';
    toolbar.append(button);
    const sync = () => {
      const collapsed = block.classList.contains('tha-v49-collapsed');
      button.textContent = collapsed ? 'Open section' : 'Collapse section';
      button.setAttribute('aria-expanded', String(!collapsed));
    };
    button.addEventListener('click', () => {
      block.classList.toggle('tha-v49-collapsed');
      sync();
    });
    const heading = block.querySelector('h2,h3') || block.firstElementChild;
    if (heading?.parentNode === block) heading.after(toolbar);
    else block.prepend(toolbar);
    if (startCollapsed) block.classList.add('tha-v49-collapsed');
    sync();
  }

  function enhanceRoomAndTradeSections(main) {
    findBlocks(main, [/room-by-room/i, /room by room/i, /room-by-room action list/i]).forEach(block => makeCollapsible(block, { startCollapsed: false }));
    findBlocks(main, [/trade-by-trade/i, /trade by trade/i, /trade-by-trade action list/i]).forEach(block => makeCollapsible(block, { startCollapsed: false }));
  }

  function collapseSupportReference(main) {
    const supportBlocks = [
      ...Array.from(main.querySelectorAll('.baselineCare,.tha-pmr-supporting-output')),
      ...findBlocks(main, [/home-specific care/i, /supported by intake/i, /optional supporting home care/i])
    ];
    supportBlocks.forEach(block => {
      if (!block || block.dataset.thaV49SupportReady) return;
      block.dataset.thaV49SupportReady = 'true';
      block.classList.add('tha-v49-support-collapsed');
      const heading = block.querySelector('h2,h3');
      if (heading && /home-specific care|optional supporting home care|supported by intake/i.test(textOf(heading))) {
        const icon = heading.querySelector('svg');
        heading.textContent = '';
        if (icon) heading.append(icon);
        heading.append(document.createTextNode('Supporting Home Care Reference'));
      }
      const note = document.createElement('p');
      note.className = 'tha-v49-support-note noPrint';
      note.textContent = 'Reference-only material. Keep collapsed unless you intentionally want to review optional supporting care details.';
      const lede = block.querySelector('.lede') || heading;
      if (lede?.parentNode) lede.after(note);
      makeCollapsible(block, { startCollapsed: true });
    });
  }

  function movePmcpBeforeInternal(main) {
    if (!main) return;
    const footer = main.querySelector('footer.promise');
    const internal = main.querySelector('.tha-v47-pmr-action-shell');
    const passBlocks = Array.from(main.querySelectorAll('.passPlanSummary,.passCalendar,.passOutlook')).filter(Boolean);
    const firstInternalOrFooter = internal || footer;
    passBlocks.forEach(block => {
      if (firstInternalOrFooter?.parentNode && block.parentNode === firstInternalOrFooter.parentNode && block.compareDocumentPosition(firstInternalOrFooter) & Node.DOCUMENT_POSITION_PRECEDING) {
        firstInternalOrFooter.parentNode.insertBefore(block, firstInternalOrFooter);
      }
    });
  }

  function moveInternalToBottom(main) {
    const internal = main?.querySelector?.('.tha-v47-pmr-action-shell');
    if (!internal) return;
    internal.classList.add('tha-v49-internal-bottom', 'noPrint');
    if (!internal.querySelector('.tha-v49-internal-note')) {
      const note = document.createElement('span');
      note.className = 'tha-v49-internal-note';
      note.textContent = 'Office-only. This is placed at the bottom so the PMR reads homeowner-first.';
      const heading = internal.querySelector('h2,h3') || internal.firstElementChild;
      if (heading?.parentNode) heading.after(note);
      else internal.prepend(note);
    }
    const footer = main.querySelector('footer.promise');
    if (footer?.parentNode && internal.nextElementSibling !== footer) footer.parentNode.insertBefore(internal, footer);
  }

  function sync() {
    installStyles();
    const main = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!main) return;
    removeOutputVisibility(main);
    removeRoomOverviewStandalone(main);
    normalizePlainEnglish(main);
    collapseSupportReference(main);
    enhanceRoomAndTradeSections(main);
    movePmcpBeforeInternal(main);
    moveInternalToBottom(main);
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