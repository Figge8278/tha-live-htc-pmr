(() => {
  const STYLE_ID = 'tha-pmcp-quick-select-styles';
  const ENHANCED_ATTR = 'data-tha-pmcp-quick-select';
  const HEADER_WIRED_ATTR = 'data-tha-pmcp-header-wired';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.3 PMCP field grid: compact by default, full-width only when opened. */
      .passWorkspace .passCategoryGroups{display:flex!important;flex-direction:column!important;gap:16px!important}
      .passWorkspace .passCategoryGroup{padding:14px!important;border-radius:18px!important}
      .passWorkspace .passDomainGroup{margin-top:12px!important}
      .passWorkspace .passDomainGroup>h4{margin:0 0 8px!important;font-size:12px!important;letter-spacing:.05em!important;text-transform:uppercase!important;color:#356f31!important}
      .passWorkspace .passReviewGrid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(178px,1fr))!important;gap:10px!important;align-items:start!important;width:100%!important}
      @media(min-width:980px){.passWorkspace .passReviewGrid{grid-template-columns:repeat(auto-fill,minmax(205px,1fr))!important}}
      @media(max-width:540px){.passWorkspace .passReviewGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}}

      .passReviewCardHeader{position:relative!important;cursor:pointer!important;gap:8px!important;align-items:flex-start!important}
      .passReviewCardToggle{display:none!important}
      .passReviewCard{min-width:0!important;min-height:0!important;transition:box-shadow .15s ease,transform .15s ease!important}
      .passReviewCard:not(.tha-pmcp-expanded){padding:9px!important;border-radius:14px!important;gap:6px!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewCardHeader{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewTitle{min-width:0!important;display:grid!important;gap:4px!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewTitle h4{margin:0!important;font-size:13px!important;line-height:1.22!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewBadgeRow{gap:4px!important;min-height:0!important}
      .passReviewCard:not(.tha-pmcp-expanded) .categoryBadge{max-width:100%!important;font-size:9px!important;padding:3px 5px!important;line-height:1.1!important}
      .passReviewCard:not(.tha-pmcp-expanded) .sourceBadge,.passReviewCard:not(.tha-pmcp-expanded) .passReviewCadence{display:none!important}
      .passReviewCard:not(.tha-pmcp-expanded) .passReviewSubline{margin:0!important;font-size:10px!important;line-height:1.25!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#60717c!important}

      .passReviewCard.tha-pmcp-expanded{grid-column:1/-1!important;padding:16px!important;border-radius:18px!important;box-shadow:0 12px 28px rgba(23,62,87,.12)!important}
      .passReviewCard.tha-pmcp-expanded .passReviewCardHeader{display:flex!important;align-items:flex-start!important}
      .passReviewCard.tha-pmcp-expanded .passReviewTitle h4{font-size:18px!important;line-height:1.25!important;margin:2px 0 0!important}
      .passReviewCard.tha-pmcp-expanded .passReviewSubline,.passReviewCard.tha-pmcp-expanded .passReviewCadence{display:block!important;font-size:12px!important;line-height:1.35!important;margin:3px 0 0!important}
      .passReviewCard.tha-pmcp-expanded .passReviewTop,.passReviewCard.tha-pmcp-expanded .passReviewFields{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:12px!important}
      .passReviewCard.tha-pmcp-expanded .workOrderActionPanel{margin-top:12px!important}

      /* Smaller quick select: keep the good action, remove the bulk. */
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

      @media(max-width:720px){
        .passReviewCardHeader{flex-wrap:nowrap!important}
        .tha-pmcp-quick-select{width:auto!important;min-width:0!important;padding:6px 7px!important;font-size:10px!important}
        .tha-pmcp-details-needed{font-size:9px!important;padding:3px 6px!important}
        .passReviewCard.tha-pmcp-expanded{padding:13px!important}
        .passReviewCard.tha-pmcp-expanded .passReviewTop,.passReviewCard.tha-pmcp-expanded .passReviewFields{grid-template-columns:1fr!important}
      }
    `;
    document.head.append(style);
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

    if (Boolean(input.checked) !== desiredSelected) {
      input.click();
    }

    window.setTimeout(() => {
      syncCard(card);
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

  function syncCard(card) {
    if (!card || !card.isConnected) return;
    card.classList.toggle('tha-pmcp-expanded', isExpanded(card));
    ensureDetailsBadge(card);
    hideCatalogOnlyBadges(card);
    const control = ensureQuickSelect(card);
    const input = control?.querySelector('input');
    if (input) input.checked = cardSelected(card);
  }

  function enhanceCards(root = document) {
    root.querySelectorAll?.('.passReviewCard').forEach(card => {
      card.setAttribute(ENHANCED_ATTR, 'true');
      syncCard(card);
    });
  }

  function start() {
    installStyles();
    enhanceCards();
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('.passReviewCard')) syncCard(node);
          enhanceCards(node);
        });
      }
      document.querySelectorAll(`.passReviewCard[${ENHANCED_ATTR}]`).forEach(syncCard);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
