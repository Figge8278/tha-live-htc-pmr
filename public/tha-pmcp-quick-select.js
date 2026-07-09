(() => {
  const STYLE_ID = 'tha-pmcp-quick-select-styles';
  const ENHANCED_ATTR = 'data-tha-pmcp-quick-select';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .passReviewCardHeader{position:relative}
      .tha-pmcp-quick-select{display:inline-flex;align-items:center;gap:7px;margin-left:auto;border:1px solid #b9d9ad;border-radius:999px;background:#f3fbf1;color:#285c30;padding:7px 10px;font-size:12px;font-weight:950;line-height:1;box-shadow:inset -4px 0 0 rgba(82,170,75,.35);cursor:pointer;white-space:nowrap;touch-action:manipulation}
      .tha-pmcp-quick-select input{width:16px;height:16px;margin:0;accent-color:#52aa4b;cursor:pointer}
      .passReviewCard.pmcp-selected .tha-pmcp-quick-select{background:#e5f6e3;border-color:#94cf8d;box-shadow:inset -6px 0 0 #52aa4b,0 0 0 2px rgba(82,170,75,.10)}
      .tha-pmcp-details-needed{display:inline-flex;align-items:center;border:1px solid #f2a45f;border-radius:999px;background:#fff4e8;color:#a85107;padding:5px 8px;font-size:11px;font-weight:950;letter-spacing:.01em;white-space:nowrap}
      .passReviewCard:not(.pmcp-selected) .tha-pmcp-details-needed{display:none!important}
      .passReviewCard.pmcp-selected .passReviewCardHeader{box-shadow:inset -5px 0 0 rgba(82,170,75,.35)}
      .passReviewCard.pmcp-selected:has(.workOrderToggle input:checked) .passReviewCardHeader{box-shadow:inset -6px 0 0 rgba(124,58,237,.55)}
      @media(max-width:720px){.passReviewCardHeader{gap:8px;flex-wrap:wrap}.tha-pmcp-quick-select{order:3;width:100%;justify-content:center;margin-left:0;padding:10px 12px}.tha-pmcp-details-needed{font-size:10px}}
    `;
    document.head.append(style);
  }

  function cardSelected(card) {
    const expandedInput = card.querySelector('.includeToggle input[type="checkbox"]');
    if (expandedInput) return Boolean(expandedInput.checked);
    return card.classList.contains('pmcp-selected');
  }

  function waitForIncludeInput(card, attempts = 8) {
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
    const wasOpen = Boolean(card.querySelector('.includeToggle'));

    if (!wasOpen) header?.click();
    const input = await waitForIncludeInput(card);
    if (!input) return;

    if (Boolean(input.checked) !== desiredSelected) {
      input.click();
    }

    window.setTimeout(() => {
      syncCard(card);
      if (!wasOpen && card.querySelector('.includeToggle')) header?.click();
    }, 80);
  }

  function ensureDetailsBadge(card) {
    const badgeRow = card.querySelector('.passReviewBadgeRow');
    if (!badgeRow || badgeRow.querySelector('.tha-pmcp-details-needed')) return;
    const badge = document.createElement('span');
    badge.className = 'tha-pmcp-details-needed';
    badge.textContent = 'Selected — Details Needed';
    badge.title = 'Fast field selection added this item to the PMCP draft. Confirm cadence, target window, resource, follow-up status, and any THA action details before final output.';
    badgeRow.append(badge);
  }

  function ensureQuickSelect(card) {
    const header = card.querySelector('.passReviewCardHeader');
    if (!header) return null;

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
    ensureDetailsBadge(card);
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
