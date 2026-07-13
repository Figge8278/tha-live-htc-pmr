(() => {
  const STYLE_ID = 'tha-pmcp-grid-force-styles';
  const GRID_ATTR = 'data-tha-grid-forced';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Emergency field-test grid enforcement: PMCP choices must scan as cards, not a list. */
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid,
      main.pmr.passWorkspace .passReviewGrid.tha-grid-forced,
      .tha-grid-forced{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;align-items:start!important;width:100%!important;max-width:100%!important}
      @media(min-width:760px){main.pmr.passWorkspace .passReviewPanel .passReviewGrid,.tha-grid-forced{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}}
      @media(min-width:1120px){main.pmr.passWorkspace .passReviewPanel .passReviewGrid,.tha-grid-forced{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard,
      .tha-grid-forced>.passReviewCard{width:auto!important;max-width:none!important;min-width:0!important;display:block!important;grid-column:auto!important;margin:0!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded),
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded){padding:8px!important;border-radius:13px!important;min-height:86px!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard.tha-pmcp-expanded,
      .tha-grid-forced>.passReviewCard.tha-pmcp-expanded{grid-column:1/-1!important;width:auto!important;max-width:none!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .passReviewCardHeader,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .passReviewCardHeader{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px!important;align-items:start!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .passReviewTitle h4,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .passReviewTitle h4{font-size:12px!important;line-height:1.18!important;margin:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .passReviewSubline,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .passReviewSubline{font-size:9px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .passWorkflowBadge,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .passWorkflowBadge{font-size:8px!important;padding:3px 5px!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .categoryBadge,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .categoryBadge{font-size:8px!important;padding:3px 5px!important}
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .sourceBadge,
      main.pmr.passWorkspace .passReviewPanel .passReviewGrid>.passReviewCard:not(.tha-pmcp-expanded) .passReviewCadence,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .sourceBadge,
      .tha-grid-forced>.passReviewCard:not(.tha-pmcp-expanded) .passReviewCadence{display:none!important}
      main.pmr.passWorkspace .passPlanCategoryGrid,
      main.pmr.passWorkspace .passOutlookGrid,
      main.pmr.passWorkspace .thaTodoGroups,
      main.pmr.passWorkspace .thaTodoBucket{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;align-items:start!important}
      @media(min-width:900px){main.pmr.passWorkspace .passPlanCategoryGrid,main.pmr.passWorkspace .passOutlookGrid,main.pmr.passWorkspace .thaTodoGroups,main.pmr.passWorkspace .thaTodoBucket{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      main.pmr.passWorkspace .thaTodoBucket>h4{grid-column:1/-1!important}
    `;
    document.head.append(style);
  }

  function setImportant(element, property, value) {
    if (!element) return;
    element.style.setProperty(property, value, 'important');
  }

  function columnTemplate(container) {
    const width = Math.max(container.getBoundingClientRect?.().width || 0, 320);
    if (width >= 1120) return 'repeat(4, minmax(0, 1fr))';
    if (width >= 760) return 'repeat(3, minmax(0, 1fr))';
    return 'repeat(2, minmax(0, 1fr))';
  }

  function forceGrid(container) {
    if (!container || !container.isConnected) return;
    container.classList.add('tha-grid-forced');
    container.setAttribute(GRID_ATTR, 'true');
    setImportant(container, 'display', 'grid');
    setImportant(container, 'grid-template-columns', columnTemplate(container));
    setImportant(container, 'gap', '8px');
    setImportant(container, 'align-items', 'start');
    setImportant(container, 'width', '100%');
    setImportant(container, 'max-width', '100%');

    container.querySelectorAll(':scope > .passReviewCard').forEach(card => {
      setImportant(card, 'width', 'auto');
      setImportant(card, 'max-width', 'none');
      setImportant(card, 'min-width', '0');
      setImportant(card, 'margin', '0');
      setImportant(card, 'display', 'block');
      setImportant(card, 'grid-column', card.classList.contains('tha-pmcp-expanded') ? '1 / -1' : 'auto');
    });
  }

  function forceSelectedGrids(root = document) {
    root.querySelectorAll?.('main.pmr.passWorkspace .passPlanCategoryGrid, main.pmr.passWorkspace .passOutlookGrid, main.pmr.passWorkspace .thaTodoGroups, main.pmr.passWorkspace .thaTodoBucket, .pmr .findingTypeList, .pmr .roomIssueChart').forEach(container => {
      setImportant(container, 'display', 'grid');
      setImportant(container, 'grid-template-columns', columnTemplate(container));
      setImportant(container, 'gap', '10px');
      setImportant(container, 'align-items', 'start');
      setImportant(container, 'width', '100%');
    });
  }

  function forcePmcpBuilderGrids(root = document) {
    const containers = new Set();
    root.querySelectorAll?.('main.pmr.passWorkspace .passReviewPanel .passReviewGrid, main.pmr.passWorkspace .passReviewGrid, .passReviewGrid').forEach(container => containers.add(container));
    root.querySelectorAll?.('.passReviewCard').forEach(card => {
      const grid = card.closest('.passReviewGrid') || card.parentElement;
      if (grid) containers.add(grid);
    });
    containers.forEach(forceGrid);
  }

  function forceAll() {
    installStyles();
    forcePmcpBuilderGrids(document);
    forceSelectedGrids(document);
  }

  function scheduleForce() {
    window.requestAnimationFrame(() => {
      forceAll();
      window.setTimeout(forceAll, 80);
      window.setTimeout(forceAll, 300);
    });
  }

  function start() {
    forceAll();
    const observer = new MutationObserver(scheduleForce);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', scheduleForce);
    window.addEventListener('orientationchange', scheduleForce);
    window.addEventListener('tha:set-view', () => window.setTimeout(forceAll, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
