(() => {
  function installStyles() {
    if (document.getElementById('tha-pass-selection-semantics-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-selection-semantics-styles';
    style.textContent = `
      .passWorkspace .tha-pass-semantics-key{display:flex;align-items:flex-start;gap:10px;margin:10px 0 14px;padding:11px 12px;border:1px solid #d4e0e6;border-radius:12px;background:#f7fbfd;color:#425962;font-size:13px;line-height:1.4}
      .passWorkspace .tha-pass-semantics-key strong{color:#173e57}
      .passWorkspace .tha-pass-semantics-key .leftRail{display:inline-block;flex:0 0 auto;width:5px;height:26px;border-radius:99px;background:#e97919;box-shadow:13px 0 0 #287bb7}
      .passWorkspace .passReviewCard{position:relative!important;border-left:5px solid #287bb7!important}
      .passWorkspace .passReviewCard.tha-pass-needs-attention{border-left-color:#e97919!important}
      .passWorkspace .passReviewCard.tha-pass-ready-for-selection{border-left-color:#287bb7!important}
      .passWorkspace .passReviewCard.tha-pass-client-selected{box-shadow:inset -5px 0 0 #3f8b47,0 5px 14px rgba(14,61,88,.05)!important}
      .passWorkspace .passReviewCard .tha-pass-selection-control{display:flex;align-items:flex-start;gap:9px;margin:16px 0 4px;padding:11px 12px;border:1px solid #c8dfc8;border-radius:12px;background:#f5fbf5;color:#234e2a}
      .passWorkspace .passReviewCard .tha-pass-selection-control input{margin-top:3px;accent-color:#3f8b47}
      .passWorkspace .passReviewCard .tha-pass-selection-control strong{color:#275d30}
      .passWorkspace .passReviewCard .tha-pass-selection-control small{color:#58705d;line-height:1.35}
      .passWorkspace .passReviewCard .tha-pass-selection-help{margin:8px 0 0;color:#60717a;font-size:12px;line-height:1.35}
      .passWorkspace .tha-clean-output-card,.passWorkspace .tha-output-card{position:relative!important;box-shadow:inset -5px 0 0 #3f8b47!important}
      .passWorkspace .tha-client-pass-output-marker{display:none!important}
      @media(max-width:900px){
        .passWorkspace .passReviewCard.tha-pass-client-selected{box-shadow:inset -4px 0 0 #3f8b47,0 5px 14px rgba(14,61,88,.05)!important}
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

  function cardToggle(card) {
    return card.querySelector('.passReviewCardToggle') ||
      Array.from(card.querySelectorAll('button')).find(button => /^(Open|Collapse)$/i.test(button.textContent.trim()) || /Collapse/i.test(button.textContent));
  }

  function cardIsOpen(card) {
    const toggle = cardToggle(card);
    return Boolean(toggle && /collapse/i.test(toggle.textContent));
  }

  function setWorkflowRail(card) {
    const needsAttention = card.classList.contains('workflow-orange') || /needs input|not scheduled|verify \/ establish/i.test(card.textContent);
    card.classList.toggle('tha-pass-needs-attention', needsAttention);
    card.classList.toggle('tha-pass-ready-for-selection', !needsAttention);
  }

  function adaptSelectionControl(card) {
    const checkbox = findSelectionCheckbox(card);
    if (!checkbox) return;
    const label = selectionLabelFor(checkbox);
    if (!label) return;

    const strong = label.querySelector('strong');
    const small = label.querySelector('small');
    if (strong) strong.textContent = 'Add to this client’s PASS care plan';
    else {
      const text = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (text) text.textContent = ' Add to this client’s PASS care plan ';
    }
    if (small) small.textContent = 'Select only after the client chooses this care item for the current PASS plan.';

    label.classList.add('tha-pass-selection-control');
    if (label.parentElement !== card) card.append(label);

    let help = card.querySelector('.tha-pass-selection-help');
    if (!help) {
      help = document.createElement('p');
      help.className = 'tha-pass-selection-help';
      card.append(help);
    }

    const open = cardIsOpen(card);
    label.hidden = !open;
    help.hidden = !open;
    help.textContent = checkbox.checked
      ? 'Selected: this item will appear in the client’s PASS care plan and PMR continued-care section.'
      : 'Available internally. Leave it unselected until the client chooses it for this year’s PASS plan.';

    card.classList.toggle('tha-pass-client-selected', checkbox.checked);
    setWorkflowRail(card);

    if (!checkbox.dataset.thaSemanticsBound) {
      checkbox.dataset.thaSemanticsBound = 'true';
      checkbox.addEventListener('change', () => {
        window.setTimeout(() => adaptSelectionControl(card), 0);
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
        key.innerHTML = '<span class="leftRail" aria-hidden="true"></span><span><strong>Color key:</strong> orange on the left means THA still needs information or a next step. Blue on the left means the item is ready for a client decision. Green on the right means the client selected it for this year’s PASS care plan.</span>';
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
