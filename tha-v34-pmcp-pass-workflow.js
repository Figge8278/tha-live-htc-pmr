(() => {
  const STYLE_ID = 'tha-v34-pmcp-pass-workflow-styles';
  const ENHANCED_ATTR = 'data-tha-v34-pmcp-enhanced';
  const HEADER_WIRED_ATTR = 'data-tha-v34-pmcp-header-wired';
  const GRID_ATTR = 'data-tha-v34-grid-forced';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.4 consolidated PASS / PMCP workflow layer. */
      .passWorkspace .passCategoryGroups{display:flex!important;flex-direction:column!important;gap:16px!important}
      .passWorkspace .passCategoryGroup{padding:14px!important;border-radius:18px!important}
      .passWorkspace .passDomainGroup{margin-top:12px!important}
      .passWorkspace .passDomainGroup>h4{margin:0 0 8px!important;font-size:12px!important;letter-spacing:.05em!important;text-transform:uppercase!important;color:#356f31!important}

      main.pmr.passWorkspace .passReviewPanel .passReviewGrid,
      main.pmr.passWorkspace .passReviewGrid.tha-grid-forced,
      .passWorkspace .passReviewGrid,
      .tha-pmcp-grid-parent,
      .tha-grid-forced{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;align-items:start!important;width:100%!important;max-width:100%!important}
      @media(min-width:760px){main.pmr.passWorkspace .passReviewPanel .passReviewGrid,.passWorkspace .passReviewGrid,.tha-pmcp-grid-parent,.tha-grid-forced{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}}
      @media(min-width:1120px){main.pmr.passWorkspace .passReviewPanel .passReviewGrid,.passWorkspace .passReviewGrid,.tha-pmcp-grid-parent,.tha-grid-forced{grid-template-columns:repeat(4,minmax(0,1fr))!important}}

      .passReviewCardHeader{position:relative!important;cursor:pointer!important;gap:8px!important;align-items:flex-start!important}
      .passReviewCardToggle{display:none!important}
      .passReviewCard{width:auto!important;max-width:none!important;min-width:0!important;min-height:0!important;display:block!important;margin:0!important;transition:box-shadow .15s ease,transform .15s ease!important}
      .passReviewCard:not(.tha-pmcp-expanded){grid-column:auto!important;padding:8px!important;border-radius:13px!important;gap:6px!important;min-height:86px!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewCardHeader{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px!important;align-items:start!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewTitle{min-width:0!important;display:grid!important;gap:4px!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewTitle h4{margin:0!important;font-size:12px!important;line-height:1.18!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewBadgeRow{gap:4px!important;min-height:0!important}
      .passReviewCard:not(.tha-pmcp-expanded) .categoryBadge{max-width:100%!important;font-size:8px!important;padding:3px 5px!important;line-height:1.1!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passWorkflowBadge{font-size:8px!important;padding:3px 5px!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .passReviewCard:not(.tha-pmcp-expanded) .sourceBadge,.passReviewCard:not(.tha-pmcp-expanded) .passReviewCadence{display:none!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewSubline{margin:0!important;font-size:9px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#60717c!important}

      .passReviewCard.tha-pmcp-expanded{grid-column:1/-1!important;width:auto!important;max-width:none!important;padding:16px!important;border-radius:18px!important;box-shadow:0 12px 28px rgba(23,62,87,.12)!important}
      .passReviewCard.tha-pmcp-expanded .passReviewCardHeader{display:flex!important;align-items:flex-start!important}
      .passReviewCard.tha-pmcp-expanded .passReviewTitle h4{font-size:18px!important;line-height:1.25!important;margin:2px 0 0!important}
      .passReviewCard.tha-pmcp-expanded .passReviewSubline,.passReviewCard.tha-pmcp-expanded .passReviewCadence{display:block!important;font-size:12px!important;line-height:1.35!important;margin:3px 0 0!important}
      .passReviewCard.tha-pmcp-expanded .passReviewTop,.passReviewCard.tha-pmcp-expanded .passReviewFields{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:12px!important}
      .passReviewCard.tha-pmcp-expanded .workOrderActionPanel{margin-top:12px!important}

      .tha-pmcp-quick-select{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;margin-left:0!important;border:1px solid #b9d9ad!important;border-radius:999px!important;background:#f3fbf1!important;color:#285c30!important;padding:5px 7px!important;font-size:10px!important;font-weight:950!important;line-height:1!important;box-shadow:inset -3px 0 0 rgba(82,170,75,.35)!important;cursor:pointer!important;white-space:nowrap!important;touch-action:manipulation!important;align-self:start!important}
      .tha-pmcp-quick-select input{width:14px!important;height:14px!important;margin:0!important;accent-color:#52aa4b!important;cursor:pointer!important}
      .passReviewCard.pmcp-selected .tha-pmcp-quick-select{background:#e5f6e3!important;border-color:#94cf8d!important;box-shadow:inset -5px 0 0 #52aa4b,0 0 0 2px rgba(82,170,75,.10)!important}
      .passReviewCard.tha-pmcp-expanded .tha-pmcp-quick-select{padding:7px 10px!important;font-size:12px!important}
      .passReviewCard.tha-pmcp-expanded .tha-pmcp-quick-select input{width:16px!important;height:16px!important}

      .tha-pmcp-details-needed{display:inline-flex!important;align-items:center!important;border:1px solid #f2a45f!important;border-radius:999px!important;background:#fff4e8!important;color:#a85107!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;letter-spacing:.01em!important;white-space:nowrap!important}
      .passReviewCard:not(.pmcp-selected) .tha-pmcp-details-needed{display:none!important}
      .passReviewCard.pmcp-selected .passReviewCardHeader{box-shadow:inset -4px 0 0 rgba(82,170,75,.35)!important}
      .passReviewCard.pmcp-selected:has(.workOrderToggle input:checked) .passReviewCardHeader{box-shadow:inset -5px 0 0 rgba(124,58,237,.55)!important}
      .tha-hidden-catalog-only{display:none!important}

      .passWorkspace .passPlanSummary .passCalendarTable,
      .passWorkspace .passCalendarTable.tha-notation-grid,
      .pmr .passPlanSummary .passCalendarTable,
      .pmr .passCalendarTable.tha-notation-grid,
      .pmr .passOutlookGrid,
      .passWorkspace .passOutlookGrid,
      .pmr .findingTypeList,
      .passWorkspace .findingTypeList,
      .pmr .roomIssueChart,
      .passWorkspace .thaTodoGroups,
      .pmr .thaTodoGroups,
      main.pmr.passWorkspace .passPlanCategoryGrid,
      main.pmr.passWorkspace .thaTodoBucket{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;align-items:start!important;width:100%!important}
      @media(min-width:900px){.passWorkspace .passPlanSummary .passCalendarTable,.passWorkspace .passCalendarTable.tha-notation-grid,.pmr .passPlanSummary .passCalendarTable,.pmr .passCalendarTable.tha-notation-grid,.pmr .passOutlookGrid,.passWorkspace .passOutlookGrid,.pmr .findingTypeList,.passWorkspace .findingTypeList,.pmr .roomIssueChart,.passWorkspace .thaTodoGroups,.pmr .thaTodoGroups,main.pmr.passWorkspace .passPlanCategoryGrid,main.pmr.passWorkspace .thaTodoBucket{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      .passWorkspace .thaTodoBucket,.pmr .thaTodoBucket{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))!important;gap:10px!important;align-items:start!important}
      .passWorkspace .thaTodoBucket>h4,.pmr .thaTodoBucket>h4{grid-column:1/-1!important}
      .pmr .findingTypeList>article,.passWorkspace .findingTypeList>article,.pmr .passOutlookCard,.passWorkspace .passOutlookCard,.pmr .roomIssueRow,.passWorkspace .thaTodoRoomGroup,.pmr .thaTodoRoomGroup{min-width:0!important;border-radius:16px!important;box-shadow:0 8px 18px rgba(23,62,87,.06)!important}
      .pmr .passCalendarRow,.passWorkspace .passCalendarRow{min-width:0!important;border-radius:14px!important;box-shadow:0 6px 14px rgba(23,62,87,.05)!important}
      .pmr .passCalendarTable.tha-notation-grid .passCalendarRow,.passWorkspace .passCalendarTable.tha-notation-grid .passCalendarRow{display:block!important;padding:12px!important}
      .pmr .passCalendarTable.tha-notation-grid .passCalendarRow>div,.passWorkspace .passCalendarTable.tha-notation-grid .passCalendarRow>div{margin:0 0 8px!important}
      .pmr .passCalendarTable.tha-notation-grid .passCalendarRow>span,.passWorkspace .passCalendarTable.tha-notation-grid .passCalendarRow>span,.pmr .passCalendarTable.tha-notation-grid .passCalendarRow em,.passWorkspace .passCalendarTable.tha-notation-grid .passCalendarRow em{display:inline-flex!important;margin:3px 4px 0 0!important;border:1px solid #e2e8ed!important;border-radius:999px!important;background:#fff!important;color:#53616c!important;padding:4px 7px!important;font-size:10px!important;font-style:normal!important;font-weight:850!important;line-height:1.15!important}

      @media(max-width:720px){
        .passReviewCardHeader{flex-wrap:nowrap!important}
        .tha-pmcp-quick-select{width:auto!important;min-width:0!important;padding:6px 7px!important;font-size:10px!important}
        .tha-pmcp-details-needed{font-size:9px!important;padding:3px 6px!important}
        .passReviewCard.tha-pmcp-expanded{padding:13px!important}
        .passReviewCard.tha-pmcp-expanded .passReviewTop,.passReviewCard.tha-pmcp-expanded .passReviewFields{grid-template-columns:1fr!important}
        .pmr .findingTypeList,.passWorkspace .findingTypeList,.pmr .passOutlookGrid,.passWorkspace .passOutlookGrid,.passWorkspace .passPlanSummary .passCalendarTable,.pmr .passPlanSummary .passCalendarTable,.passWorkspace .thaTodoGroups,.pmr .thaTodoGroups,.passWorkspace .thaTodoBucket,.pmr .thaTodoBucket{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
      }
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

  function isExpanded(card) {
    return Boolean(card.querySelector('.includeToggle, .passReviewTop, .passReviewFields, .workOrderActionPanel'));
  }

  function cardSelected(card) {
    const expandedInput = card.querySelector('.includeToggle input[type="checkbox"]');
    if (expandedInput) return Boolean(expandedInput.checked);
    return card.classList.contains('pmcp-selected');
  }

  function waitForIncludeInput(card, attempts = 10) {
    return new Promise(resolve => {
      const tick = remaining => {
        const input = card.querySelector('.includeToggle input[type="checkbox"]');
        if (input || remaining <= 0) {
          resolve(input || null);
          return;
        }
        window.requestAnimationFrame(() => tick(remaining - 1));
      };
      tick(attempts);
    });
  }

  async function setSelectedFromCompact(card, desiredSelected) {
    const header = card.querySelector('.passReviewCardHeader');
    const wasOpen = isExpanded(card);
    if (!wasOpen) header?.click();
    const input = await waitForIncludeInput(card);
    if (!input) return;
    if (Boolean(input.checked) !== desiredSelected) input.click();
    window.setTimeout(() => {
      syncCard(card);
      forceCardGridState(card);
      if (!wasOpen && isExpanded(card)) header?.click();
    }, 80);
  }

  function ensureDetailsBadge(card) {
    const badgeRow = card.querySelector('.passReviewBadgeRow');
    if (!badgeRow || badgeRow.querySelector('.tha-pmcp-details-needed')) return;
    const badge = document.createElement('span');
    badge.className = 'tha-pmcp-details-needed';
    badge.textContent = 'Details needed';
    badge.title = 'Selected for the PMCP draft. Confirm cadence, target window, resource, follow-up status, and any THA action details before final output.';
    badgeRow.append(badge);
  }

  function hideCatalogOnlyBadges(card) {
    card.querySelectorAll('.sourceBadge, .passReviewBadgeRow span').forEach(element => {
      const text = element.textContent.trim().toLowerCase();
      if (text === 'catalog only' || text === 'catalog-only') {
        element.classList.add('tha-hidden-catalog-only');
        element.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function ensureQuickSelect(card) {
    const header = card.querySelector('.passReviewCardHeader');
    if (!header) return null;

    if (!header.getAttribute(HEADER_WIRED_ATTR)) {
      header.setAttribute(HEADER_WIRED_ATTR, 'true');
      header.addEventListener('click', () => window.setTimeout(() => syncCard(card), 60));
      header.addEventListener('keydown', () => window.setTimeout(() => syncCard(card), 60));
    }

    let control = header.querySelector('.tha-pmcp-quick-select');
    if (control) return control;

    control = document.createElement('label');
    control.className = 'tha-pmcp-quick-select';
    control.title = 'Quick-add this service to the PMCP draft. Details still need review.';
    control.innerHTML = '<input type="checkbox" aria-label="Add to PMCP draft"/><span>PMCP</span>';
    control.addEventListener('click', event => event.stopPropagation());
    control.addEventListener('keydown', event => event.stopPropagation());

    const input = control.querySelector('input');
    input.addEventListener('change', event => {
      event.stopPropagation();
      setSelectedFromCompact(card, event.target.checked);
    });

    const toggle = header.querySelector('.passReviewCardToggle');
    if (toggle) header.insertBefore(control, toggle);
    else header.append(control);
    return control;
  }

  function forceCardGridState(card) {
    if (!card) return;
    setImportant(card, 'width', 'auto');
    setImportant(card, 'max-width', 'none');
    setImportant(card, 'min-width', '0');
    setImportant(card, 'margin', '0');
    setImportant(card, 'display', 'block');
    setImportant(card, 'grid-column', card.classList.contains('tha-pmcp-expanded') ? '1 / -1' : 'auto');
  }

  function syncCard(card) {
    if (!card || !card.isConnected) return;
    card.setAttribute(ENHANCED_ATTR, 'true');
    card.classList.toggle('tha-pmcp-expanded', isExpanded(card));
    ensureDetailsBadge(card);
    hideCatalogOnlyBadges(card);
    const control = ensureQuickSelect(card);
    const input = control?.querySelector('input');
    if (input) input.checked = cardSelected(card);
    forceCardGridState(card);
  }

  function forceGrid(container) {
    if (!container || !container.isConnected) return;
    container.classList.add('tha-grid-forced', 'tha-pmcp-grid-parent');
    container.setAttribute(GRID_ATTR, 'true');
    setImportant(container, 'display', 'grid');
    setImportant(container, 'grid-template-columns', columnTemplate(container));
    setImportant(container, 'gap', '8px');
    setImportant(container, 'align-items', 'start');
    setImportant(container, 'width', '100%');
    setImportant(container, 'max-width', '100%');
    container.querySelectorAll(':scope > .passReviewCard').forEach(forceCardGridState);
  }

  function forcePmcpBuilderGrids(root = document) {
    const containers = new Set();
    root.querySelectorAll?.('main.pmr.passWorkspace .passReviewPanel .passReviewGrid, main.pmr.passWorkspace .passReviewGrid, .passReviewGrid').forEach(container => containers.add(container));
    root.querySelectorAll?.('.passReviewCard').forEach(card => {
      syncCard(card);
      const grid = card.closest('.passReviewGrid') || card.parentElement;
      if (grid) containers.add(grid);
    });
    containers.forEach(forceGrid);
  }

  function forceSelectedGrids(root = document) {
    root.querySelectorAll?.('main.pmr.passWorkspace .passPlanCategoryGrid, main.pmr.passWorkspace .passOutlookGrid, main.pmr.passWorkspace .thaTodoGroups, main.pmr.passWorkspace .thaTodoBucket, .pmr .findingTypeList, .pmr .roomIssueChart, .passCalendarTable, .passOutlookGrid, .thaTodoGroups').forEach(container => {
      container.classList.add('tha-notation-grid');
      setImportant(container, 'display', 'grid');
      setImportant(container, 'grid-template-columns', columnTemplate(container));
      setImportant(container, 'gap', '10px');
      setImportant(container, 'align-items', 'start');
      setImportant(container, 'width', '100%');
    });
  }

  function run(root = document) {
    installStyles();
    forcePmcpBuilderGrids(root);
    forceSelectedGrids(root);
  }

  let scheduled = false;
  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      run(document);
      window.setTimeout(() => run(document), 80);
      window.setTimeout(() => run(document), 300);
    });
  }

  function start() {
    run(document);
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('.passReviewCard')) syncCard(node);
          if (node.querySelector?.('.passReviewCard,.passReviewGrid,.passCalendarTable,.passOutlookGrid,.thaTodoGroups')) run(node);
        });
      }
      scheduleRun();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', scheduleRun);
    window.addEventListener('orientationchange', scheduleRun);
    window.addEventListener('tha:set-view', () => window.setTimeout(() => run(document), 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();