(() => {
  const DECISION_KEY = 'tha-pass-client-decisions-v2';

  function readDecisions() {
    try { return JSON.parse(localStorage.getItem(DECISION_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeDecisions(next) {
    localStorage.setItem(DECISION_KEY, JSON.stringify(next));
  }

  function installStyles() {
    if (document.getElementById('tha-pass-selection-semantics-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-selection-semantics-styles';
    style.textContent = `
      .passWorkspace .tha-pass-semantics-key{display:flex;align-items:flex-start;gap:10px;margin:10px 0 14px;padding:11px 12px;border:1px solid #d4e0e6;border-radius:12px;background:#f7fbfd;color:#425962;font-size:13px;line-height:1.4}
      .passWorkspace .tha-pass-semantics-key strong{color:#173e57}
      .passWorkspace .tha-pass-semantics-key .leftRail{display:inline-block;flex:0 0 auto;width:5px;height:26px;border-radius:99px;background:#e97919;box-shadow:13px 0 0 #287bb7}
      .passWorkspace .passReviewCard{position:relative!important;border-left:5px solid #e97919!important}
      .passWorkspace .passReviewCard.tha-pass-decision-recorded{border-left-color:#287bb7!important}
      .passWorkspace .passReviewCard.tha-pass-client-selected{box-shadow:inset -5px 0 0 #3f8b47,0 5px 14px rgba(14,61,88,.05)!important}
      .passWorkspace .passReviewCard .tha-pass-selection-panel{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;margin:14px 0 2px;padding:11px 12px;border:1px solid #c8dfc8;border-radius:12px;background:#f5fbf5}
      .passWorkspace .passReviewCard .tha-pass-selection-panel[hidden]{display:none!important}
      .passWorkspace .passReviewCard .tha-pass-selection-control{display:flex;align-items:flex-start;gap:9px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:#234e2a}
      .passWorkspace .passReviewCard .tha-pass-selection-control input{margin-top:3px;accent-color:#3f8b47}
      .passWorkspace .passReviewCard .tha-pass-selection-control strong{color:#275d30}
      .passWorkspace .passReviewCard .tha-pass-selection-control small{color:#58705d;line-height:1.35}
      .passWorkspace .passReviewCard .tha-pass-not-this-year{border:1px solid #b9cbd8;border-radius:9px;background:#fff;color:#31566d;padding:7px 9px;font-size:12px;font-weight:900;white-space:nowrap}
      .passWorkspace .passReviewCard .tha-pass-selection-help{grid-column:1/-1;margin:0;color:#60717a;font-size:12px;line-height:1.35}
      .passWorkspace .tha-clean-output-card,.passWorkspace .tha-output-card{position:relative!important;box-shadow:inset -5px 0 0 #3f8b47!important}
      .passWorkspace .tha-client-pass-output-marker{display:none!important}
      @media(max-width:900px){
        .passWorkspace .passReviewCard.tha-pass-client-selected{box-shadow:inset -4px 0 0 #3f8b47,0 5px 14px rgba(14,61,88,.05)!important}
        .passWorkspace .passReviewCard .tha-pass-selection-panel{grid-template-columns:1fr}
        .passWorkspace .passReviewCard .tha-pass-not-this-year{width:100%}
      }
    `;
    document.head.append(style);
  }

  function exactHeadingChange(root, from, to) {
    root.querySelectorAll('h1,h2,h3').forEach(heading => {
      if (heading.dataset.thaSemanticsTitle === 'true') return;
      if (heading.textContent.trim() === from) {
        heading.textContent = to;
        heading.dataset.thaSemanticsTitle = 'true';
      }
    });
  }

  function selectionLabelFor(checkbox) {
    const labeled = checkbox.closest('label');
    if (labeled) return labeled;
    return checkbox.parentElement?.closest('label') || checkbox.parentElement || null;
  }

  function findSelectionCheckbox(card) {
    const candidates = Array.from(card.querySelectorAll('input[type="checkbox"]'));
    return candidates.find(input => /include in pmr|include|pass plan/i.test(selectionLabelFor(input)?.textContent || '')) || candidates[0] || null;
  }

  function cardTitle(card) {
    const title = card.querySelector('h4,h3,strong');
    return (title?.textContent || card.textContent.split('\n')[0] || 'PASS item')
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function cardKey(card) {
    return cardTitle(card).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function outputKey(card) {
    return cardTitle(card).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function toggleFor(card) {
    return card.querySelector('.passReviewCardToggle') ||
      Array.from(card.querySelectorAll('button')).find(button => {
        const label = button.textContent.trim();
        return /^(open|collapse|show details|hide details)$/i.test(label);
      });
  }

  function cardIsOpen(card) {
    const toggle = toggleFor(card);
    const aria = toggle?.getAttribute('aria-expanded');
    if (aria === 'true') return true;
    if (aria === 'false') return false;
    const label = toggle?.textContent.trim() || '';
    if (/collapse|hide/i.test(label)) return true;
    if (/open|show/i.test(label)) return false;
    return card.classList.contains('expanded') || card.classList.contains('isOpen');
  }

  function getDecision(key) {
    return readDecisions()[key] || '';
  }

  function setDecision(key, decision) {
    const next = readDecisions();
    if (decision) next[key] = decision;
    else delete next[key];
    writeDecisions(next);
  }

  function clientSelected(card, checkbox) {
    return Boolean(checkbox?.checked || getDecision(cardKey(card)) === 'selected');
  }

  function syncOutputSelection() {
    const decisions = readDecisions();
    document.querySelectorAll('.passWorkspace .tha-clean-output-card, .passWorkspace .tha-output-card').forEach(card => {
      const key = outputKey(card);
      const selected = decisions[key] === 'selected';
      card.hidden = !selected;
    });
    document.querySelectorAll('.passWorkspace .tha-clean-output-group, .passWorkspace .tha-pass-output-group').forEach(group => {
      const cards = Array.from(group.querySelectorAll('.tha-clean-output-card, .tha-output-card'));
      if (cards.length) group.hidden = cards.every(card => card.hidden);
    });
  }

  function defaultToUnselected(card, checkbox) {
    const key = cardKey(card);
    const decision = getDecision(key);
    if (!decision && checkbox.checked && !checkbox.dataset.thaDefaultCleared) {
      checkbox.dataset.thaDefaultCleared = 'true';
      checkbox.click();
      setDecision(key, '');
    }
  }

  function adaptSelectionControl(card) {
    const checkbox = findSelectionCheckbox(card);
    if (!checkbox) return;
    const label = selectionLabelFor(checkbox);
    if (!label) return;
    const key = cardKey(card);

    defaultToUnselected(card, checkbox);

    const strong = label.querySelector('strong');
    const small = label.querySelector('small');
    if (strong) strong.textContent = 'Add to this client’s PASS care plan';
    else {
      const text = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (text) text.textContent = ' Add to this client’s PASS care plan ';
    }
    if (small) small.textContent = 'Choose this only after the client selects the item for this year’s PASS care plan.';
    label.classList.add('tha-pass-selection-control');

    let panel = card.querySelector('.tha-pass-selection-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'tha-pass-selection-panel';
      card.append(panel);
    }
    if (!panel.contains(label)) panel.prepend(label);

    let decline = panel.querySelector('.tha-pass-not-this-year');
    if (!decline) {
      decline = document.createElement('button');
      decline.type = 'button';
      decline.className = 'tha-pass-not-this-year';
      panel.append(decline);
      decline.addEventListener('click', () => {
        if (checkbox.checked) checkbox.click();
        setDecision(key, 'declined');
        adaptSelectionControl(card);
        syncOutputSelection();
      });
    }

    let help = panel.querySelector('.tha-pass-selection-help');
    if (!help) {
      help = document.createElement('p');
      help.className = 'tha-pass-selection-help';
      panel.append(help);
    }

    const selected = clientSelected(card, checkbox);
    const declined = getDecision(key) === 'declined';
    const open = cardIsOpen(card);
    panel.hidden = !open;
    card.classList.toggle('tha-pass-decision-recorded', selected || declined);
    card.classList.toggle('tha-pass-client-selected', selected);
    decline.textContent = declined ? 'Not this year — recorded' : 'Not this year';
    help.textContent = selected
      ? 'Selected: this item appears in the client’s PASS care plan and PMR continued-care section.'
      : declined
        ? 'Decision recorded: this item is not included in the client’s PASS care plan this year.'
        : 'Decision needed: select it for the client’s plan or record Not this year.';

    if (!checkbox.dataset.thaSemanticsBound) {
      checkbox.dataset.thaSemanticsBound = 'true';
      checkbox.addEventListener('change', () => {
        setDecision(key, checkbox.checked ? 'selected' : '');
        window.setTimeout(() => {
          adaptSelectionControl(card);
          syncOutputSelection();
        }, 0);
      });
    }
  }

  function adaptPlanningWorkspace() {
    document.querySelectorAll('.passWorkspace').forEach(workspace => {
      exactHeadingChange(workspace, 'PASS Review Controls', 'PASS Care Plan Builder');
      exactHeadingChange(workspace, 'THA PASS Planning', 'PASS Care Plan Builder');
      const planningPanel = workspace.querySelector('.passReviewPanel');
      if (planningPanel && !planningPanel.querySelector('.tha-pass-semantics-key')) {
        const key = document.createElement('p');
        key.className = 'tha-pass-semantics-key';
        key.innerHTML = '<span class="leftRail" aria-hidden="true"></span><span><strong>Color key:</strong> orange on the left means a client decision is still needed. Blue on the left means the item has been reviewed. Green on the right means the client selected it for this year’s PASS care plan.</span>';
        const intro = planningPanel.querySelector('.passReviewIntro, .lede, p');
        intro?.after(key);
      }
      workspace.querySelectorAll('.passReviewCard').forEach(adaptSelectionControl);
    });
  }

  function adaptClientPlanOutput() {
    document.querySelectorAll('.passWorkspace').forEach(workspace => {
      exactHeadingChange(workspace, 'Selected PASS Continued Care Plan', 'Client PASS Care Plan');
      workspace.querySelectorAll('.tha-clean-output-card, .tha-output-card').forEach(card => {
        const top = card.querySelector('.findTop');
        if (!top || top.querySelector('.tha-client-pass-output-marker')) return;
        const marker = document.createElement('span');
        marker.className = 'tha-client-pass-output-marker';
        marker.textContent = 'In client PASS plan';
        top.append(marker);
      });
    });
    syncOutputSelection();
  }

  function installToggleRefresh() {
    if (window.__thaPassSelectionToggleRefresh) return;
    window.__thaPassSelectionToggleRefresh = true;
    document.addEventListener('click', event => {
      if (!event.target.closest('.passReviewCardToggle, .passReviewCard button')) return;
      window.setTimeout(() => document.querySelectorAll('.passWorkspace .passReviewCard').forEach(adaptSelectionControl), 0);
    }, true);
  }

  function run() {
    installStyles();
    installToggleRefresh();
    adaptPlanningWorkspace();
    adaptClientPlanOutput();
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
