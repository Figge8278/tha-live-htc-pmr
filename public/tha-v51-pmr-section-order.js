(() => {
  const SCRIPT_ID = 'tha-v51-pmr-section-order';
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
      /* V3.51: PMR closes with findings detail, homeowner plan/context, then THA action items. */
      main.pmr:not(.passWorkspace) [data-tha-v51-ordered="pmr-closing-sequence"]{
        scroll-margin-top:90px;
      }
      main.pmr:not(.passWorkspace) .passCalendar,
      main.pmr:not(.passWorkspace) .passOutlook,
      main.pmr:not(.passWorkspace) .passPlanSummary,
      main.pmr:not(.passWorkspace) .tha-pmcp-timing-panel{
        margin-top:18px!important;
      }
    `;
    document.head.append(style);
  }

  function headingText(section) {
    return textOf(section?.querySelector?.('h1,h2,h3,summary') || section);
  }

  function isHidden(section) {
    if (!section) return true;
    if (section.hidden || section.getAttribute('aria-hidden') === 'true') return true;
    if (section.dataset?.thaV50Hidden === 'true') return true;
    const style = window.getComputedStyle(section);
    return style.display === 'none' || style.visibility === 'hidden';
  }

  function directPmrSections(pmr) {
    return Array.from(pmr.children || []).filter(child => child && child.nodeType === 1);
  }

  function matchAny(text, patterns) {
    return patterns.some(pattern => pattern.test(text));
  }

  function sectionMatches(section, patterns, extraSelector = '') {
    if (!section) return false;
    if (extraSelector && section.matches?.(extraSelector)) return true;
    return matchAny(headingText(section), patterns);
  }

  function findSection(pmr, patterns, extraSelector = '') {
    const direct = directPmrSections(pmr);
    return direct.find(section => !isHidden(section) && sectionMatches(section, patterns, extraSelector)) || null;
  }

  function findAllSections(pmr, patterns, extraSelector = '') {
    return directPmrSections(pmr).filter(section => !isHidden(section) && sectionMatches(section, patterns, extraSelector));
  }

  function firstInDocumentOrder(items = []) {
    return items
      .filter(Boolean)
      .sort((a, b) => {
        if (a === b) return 0;
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
      })[0] || null;
  }

  function markOrdered(section) {
    if (section) section.dataset.thaV51Ordered = 'pmr-closing-sequence';
  }

  function moveBefore(anchor, section) {
    if (!anchor || !section || anchor === section || !anchor.parentNode) return false;
    if (section.nextElementSibling === anchor) {
      markOrdered(section);
      return false;
    }
    anchor.parentNode.insertBefore(section, anchor);
    markOrdered(section);
    return true;
  }

  function moveAfter(anchor, section) {
    if (!anchor || !section || anchor === section || !anchor.parentNode) return false;
    if (anchor.nextElementSibling === section) {
      markOrdered(section);
      return false;
    }
    anchor.parentNode.insertBefore(section, anchor.nextElementSibling);
    markOrdered(section);
    return true;
  }

  function orderPmrSections() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;

    const roomSection = findSection(pmr, [/room\s*[-–—]?\s*by\s*[-–—]?\s*room/i, /room action list/i], '.roomActionList,.roomByRoomActionList,.roomFindings,.roomSummary');
    const tradeSection = findSection(pmr, [/trade\s*[-–—]?\s*by\s*[-–—]?\s*trade/i, /trade action list/i, /by resource/i], '.tradeActionList,.tradeByTradeActionList,.tradeFindings,.tradeSummary');

    const pmcpSections = findAllSections(
      pmr,
      [/preventive maintenance care plan/i, /preventative maintenance care plan/i, /PMCP/i, /PASS maintenance calendar/i, /PASS continued care/i, /continued care outlook/i],
      '.passCalendar,.passOutlook,.passPlanSummary,.tha-pmcp-timing-panel'
    );
    const firstPmcp = firstInDocumentOrder(pmcpSections);

    if (firstPmcp) {
      // Preserve the established findings order before the homeowner care material.
      if (tradeSection) moveBefore(firstPmcp, tradeSection);
      const currentFirstPmcp = firstInDocumentOrder(findAllSections(
        pmr,
        [/preventive maintenance care plan/i, /preventative maintenance care plan/i, /PMCP/i, /PASS maintenance calendar/i, /PASS continued care/i, /continued care outlook/i],
        '.passCalendar,.passOutlook,.passPlanSummary,.tha-pmcp-timing-panel'
      ));
      if (roomSection && currentFirstPmcp) moveBefore(currentFirstPmcp, roomSection);
    }

    if (roomSection && tradeSection && tradeSection.parentNode === pmr && roomSection.nextElementSibling !== tradeSection) {
      pmr.insertBefore(roomSection, tradeSection);
      markOrdered(roomSection);
    }

    // Required closing sequence:
    // Trade-by-Trade → Detail Appendix → Preventative Maintenance Care Plan
    // → Homeowner Goals & Intake Context → THA Action Items.
    const detailAppendix = findSection(pmr, [/detail appendix/i], '.detailAppendix');
    const carePlan = findSection(pmr, [/preventive maintenance care plan/i, /preventative maintenance care plan/i], '.passPlanSummary');
    const homeownerContext = findSection(pmr, [/homeowner goals.*intake context/i], '.intakeSummary');
    const thaActionItems = findSection(pmr, [/THA action/i], '.pmrInternalActionList');

    let cursor = tradeSection;
    [detailAppendix, carePlan, homeownerContext, thaActionItems].forEach(section => {
      if (!cursor || !section) return;
      moveAfter(cursor, section);
      cursor = section;
    });
  }

  function correctPassTitle() {
    const eyebrow = document.querySelector('main.passWorkspace .pmrHeader .eyebrow');
    if (!eyebrow) return;
    const corrected = 'PASS — Precision Annual & Seasonal Services';
    if (textOf(eyebrow) !== corrected) eyebrow.textContent = corrected;
  }

  function sync() {
    installStyles();
    orderPmrSections();
    correctPassTitle();
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
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded', 'data-tha-v50-hidden'] });
  sync();
})();
