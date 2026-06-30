(() => {
  const PMCP_BUILDER = 'Preventative Maintenance Care Plan Builder';
  const PMCP_PRODUCT = 'Preventative Maintenance Care Plan';
  const DECISION_KEY = 'tha-pmcp-decisions-v1';

  function readDecisions() {
    try { return JSON.parse(sessionStorage.getItem(DECISION_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeDecisions(next) {
    try { sessionStorage.setItem(DECISION_KEY, JSON.stringify(next)); }
    catch { /* The UI still works when session storage is unavailable. */ }
  }

  function decisionFor(key) {
    return readDecisions()[key] || 'pending';
  }

  function setDecision(key, value) {
    const next = readDecisions();
    if (value === 'pending') delete next[key];
    else next[key] = value;
    writeDecisions(next);
  }

  function installStyles() {
    if (document.getElementById('tha-pass-compact-controls-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-compact-controls-styles';
    style.textContent = `
      .passWorkspace .tha-pass-client-selection[hidden],.passWorkspace .tha-pmcp-decision-panel[hidden]{display:none!important}
      .passWorkspace .passReviewCard{position:relative!important;border-left:5px solid #e97919!important}
      .passWorkspace .passReviewCard.tha-pmcp-reviewed{border-left-color:#287bb7!important}
      .passWorkspace .passReviewCard.tha-pmcp-selected{box-shadow:inset -5px 0 0 #3f8b47,0 5px 14px rgba(14,61,88,.05)!important}
      .passWorkspace .tha-pmcp-note{margin:8px 0 14px;padding:10px 12px;border-left:4px solid #287bb7;border-radius:10px;background:#f4f9fc;color:#45616f;font-size:13px;line-height:1.4}
      .passWorkspace .tha-pmcp-note strong{color:#173e57}
      .passWorkspace .tha-pmcp-decision-panel{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0 2px;padding:10px 11px;border:1px solid #d4e0e6;border-radius:10px;background:#f8fbfc}
      .passWorkspace .tha-pmcp-not-this-year{border:1px solid #b6c9d4;border-radius:9px;background:#fff;color:#31566d;padding:7px 9px;font-size:12px;font-weight:900}
      .passWorkspace .tha-pmcp-decision-copy{color:#5d6f78;font-size:12px;line-height:1.35}
      .passWorkspace .tha-pmcp-decision-copy strong{color:#173e57}
      @media(max-width:900px){
        .passWorkspace .passReviewCard.tha-pmcp-selected{box-shadow:inset -4px 0 0 #3f8b47,0 5px 14px rgba(14,61,88,.05)!important}
      }
    `;
    document.head.append(style);
  }

  function reviewToggle(card) {
    return card.querySelector('.passReviewCardToggle') ||
      Array.from(card.querySelectorAll('button')).find(button => {
        const text = button.textContent.trim();
        return /^(open|collapse|view details|hide details)$/i.test(text);
      });
  }

  function cardIsOpen(card) {
    const toggle = reviewToggle(card);
    if (!toggle) return false;
    const expanded = toggle.getAttribute('aria-expanded');
    if (expanded === 'true') return true;
    if (expanded === 'false') return false;
    return /collapse|hide/i.test(toggle.textContent);
  }

  function selectionInput(card) {
    return Array.from(card.querySelectorAll('input[type="checkbox"]')).find(input => {
      const label = input.closest('label') || input.parentElement;
      return /include in pmr|include|pass care plan|pmcp/i.test(label?.textContent || '');
    }) || null;
  }

  function findSelectionControl(card) {
    const checkbox = selectionInput(card);
    if (!checkbox) return null;
    return checkbox.closest('label') || checkbox.parentElement;
  }

  function cardKey(card) {
    const title = card.querySelector('h4,h3,strong')?.textContent || card.textContent.split('\n')[0] || 'pmcp-item';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function renameSelectionControl(control) {
    if (!control) return;
    const strong = control.querySelector('strong');
    const small = control.querySelector('small');
    if (strong) strong.textContent = 'Add to this homeowner’s PMCP';
    else {
      const textNode = Array.from(control.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (textNode) textNode.textContent = ' Add to this homeowner’s PMCP ';
    }
    if (small) small.textContent = 'Select only after the homeowner chooses this item for the Preventative Maintenance Care Plan.';
  }

  function ensureDefaultOff(card, input) {
    const key = cardKey(card);
    const decision = decisionFor(key);
    if (decision === 'pending' && input.checked && !input.dataset.thaPmcpDefaultCleared) {
      input.dataset.thaPmcpDefaultCleared = 'true';
      input.click();
    }
  }

  function updateCardVisual(card) {
    const input = selectionInput(card);
    if (!input) return;
    const decision = input.checked ? 'selected' : decisionFor(cardKey(card));
    const reviewed = decision === 'selected' || decision === 'declined';
    card.classList.toggle('tha-pmcp-reviewed', reviewed);
    card.classList.toggle('tha-pmcp-selected', decision === 'selected');
  }

  function ensureDecisionPanel(card, input) {
    let panel = card.querySelector('.tha-pmcp-decision-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'tha-pmcp-decision-panel';
      const decline = document.createElement('button');
      decline.type = 'button';
      decline.className = 'tha-pmcp-not-this-year';
      panel.append(decline);
      const copy = document.createElement('span');
      copy.className = 'tha-pmcp-decision-copy';
      panel.append(copy);
      decline.addEventListener('click', () => {
        if (input.checked) input.click();
        setDecision(cardKey(card), 'declined');
        adaptCard(card);
      });
      card.append(panel);
    }

    const decision = input.checked ? 'selected' : decisionFor(cardKey(card));
    const decline = panel.querySelector('.tha-pmcp-not-this-year');
    const copy = panel.querySelector('.tha-pmcp-decision-copy');
    const open = cardIsOpen(card);
    panel.hidden = !open;
    if (decline) decline.textContent = decision === 'declined' ? 'Not this year — recorded' : 'Not this year';
    if (copy) {
      copy.innerHTML = decision === 'selected'
        ? '<strong>Selected.</strong> This item is included in the homeowner’s PMCP.'
        : decision === 'declined'
          ? '<strong>Reviewed.</strong> This item is not included in the homeowner’s PMCP this year.'
          : '<strong>Decision needed.</strong> Add it to the PMCP or record Not this year.';
    }
  }

  function bindInput(card, input) {
    if (input.dataset.thaPmcpBound) return;
    input.dataset.thaPmcpBound = 'true';
    input.addEventListener('change', () => {
      setDecision(cardKey(card), input.checked ? 'selected' : 'pending');
      window.setTimeout(() => adaptCard(card), 0);
    });
  }

  function adaptCard(card) {
    const input = selectionInput(card);
    const control = findSelectionControl(card);
    if (!input || !control) return;
    ensureDefaultOff(card, input);
    renameSelectionControl(control);
    control.classList.add('tha-pass-client-selection');
    control.hidden = !cardIsOpen(card);
    bindInput(card, input);
    ensureDecisionPanel(card, input);
    updateCardVisual(card);
  }

  function replaceHeading(heading) {
    const text = heading.textContent.trim();
    if (text === 'PASS Review Controls' || text === 'THA PASS Planning' || text === 'PASS Care Plan Builder' || text === PMCP_BUILDER) {
      heading.textContent = PMCP_BUILDER;
      heading.dataset.thaPmcpBuilder = 'true';
      return;
    }
    if (/^(Selected PASS Continued Care Plan|Client PASS Care Plan|Continued Care Plan|PASS Continued Care Outlook|Preventative Maintenance Care Plan)$/i.test(text)) {
      heading.textContent = PMCP_PRODUCT;
      heading.dataset.thaPmcpProduct = 'true';
    }
  }

  function addPmcpNote(workspace) {
    const builder = Array.from(workspace.querySelectorAll('h1,h2,h3')).find(heading => heading.textContent.trim() === PMCP_BUILDER);
    if (!builder) return;
    const container = builder.closest('.passReviewPanel, .passReviewSection, section, div') || builder.parentElement;
    if (!container || container.querySelector('.tha-pmcp-note')) return;
    const note = document.createElement('p');
    note.className = 'tha-pmcp-note';
    note.innerHTML = '<strong>PASS → PMCP:</strong> PASS is The Homeowner Advocate’s framework for turning selected upkeep priorities into a homeowner’s Preventative Maintenance Care Plan (PMCP). The PMCP is the care-plan product created through this builder.<br/><strong>Color key:</strong> orange left = homeowner decision needed; blue left = reviewed; green right = selected for the PMCP.';
    builder.after(note);
  }

  function adaptWorkspace(workspace) {
    workspace.querySelectorAll('h1,h2,h3').forEach(replaceHeading);
    addPmcpNote(workspace);
    workspace.querySelectorAll('.passReviewCard').forEach(adaptCard);
  }

  function run() {
    installStyles();
    document.querySelectorAll('.passWorkspace').forEach(adaptWorkspace);
  }

  if (!window.__thaPassCompactControlRefresh) {
    window.__thaPassCompactControlRefresh = true;
    document.addEventListener('click', event => {
      if (event.target.closest('.passReviewCard')) window.setTimeout(run, 0);
      if (/new blank local walkthrough/i.test(event.target.closest('button')?.textContent || '')) {
        try { sessionStorage.removeItem(DECISION_KEY); } catch {}
      }
    }, true);
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
