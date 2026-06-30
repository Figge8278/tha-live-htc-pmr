(() => {
  function installStyles() {
    if (document.getElementById('tha-pass-selection-semantics-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-selection-semantics-styles';
    style.textContent = `
      .passWorkspace .tha-pass-semantics-key{display:flex;align-items:flex-start;gap:10px;margin:10px 0 14px;padding:11px 12px;border:1px solid #d4e0e6;border-radius:12px;background:#f7fbfd;color:#425962;font-size:13px;line-height:1.4}
      .passWorkspace .tha-pass-semantics-key strong{color:#173e57}
      .passWorkspace .tha-pass-selection-dot{display:inline-block;flex:0 0 auto;width:10px;height:10px;margin-top:4px;border-radius:50%;background:#287bb7;box-shadow:0 0 0 3px rgba(40,123,183,.12)}
      .passWorkspace .passReviewCard{position:relative}
      .passWorkspace .passReviewCard.tha-pass-client-selected{box-shadow:inset -5px 0 0 #287bb7,0 5px 14px rgba(14,61,88,.05)}
      .passWorkspace .passReviewCard.tha-pass-client-selected::after{content:'Selected for client PASS plan';position:absolute;right:13px;bottom:12px;padding:5px 8px;border-radius:999px;background:#eaf4fb;border:1px solid #b7d8eb;color:#1f6d9e;font-size:11px;font-weight:900;line-height:1;pointer-events:none}
      .passWorkspace .passReviewCard .tha-pass-selection-help{margin:8px 0 0;color:#60717a;font-size:12px;line-height:1.35}
      .passWorkspace .passReviewCard.tha-pass-client-selected .tha-pass-selection-help{padding-right:150px}
      .passWorkspace .tha-client-pass-output-marker{display:inline-flex;align-items:center;gap:5px;margin-left:auto;padding:5px 8px;border-radius:999px;background:#eaf4fb;border:1px solid #b7d8eb;color:#1f6d9e;font-size:11px;font-weight:900;line-height:1;white-space:nowrap}
      .passWorkspace .tha-client-pass-output-marker::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#287bb7}
      .passWorkspace .tha-clean-output-card .findTop,.passWorkspace .tha-output-card .findTop{position:relative}
      @media(max-width:900px){
        .passWorkspace .passReviewCard.tha-pass-client-selected::after{position:static;display:inline-block;margin:8px 0 0}
        .passWorkspace .passReviewCard.tha-pass-client-selected .tha-pass-selection-help{padding-right:0}
        .passWorkspace .tha-client-pass-output-marker{margin-left:0}
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
    if (small) small.textContent = 'Blue means the client selected this for the current PASS plan. It is separate from the orange, violet, or green THA workflow status.';

    let help = card.querySelector('.tha-pass-selection-help');
    if (!help) {
      help = document.createElement('p');
      help.className = 'tha-pass-selection-help';
      label.after(help);
    }
    help.textContent = checkbox.checked
      ? 'Client selection: this item appears in the homeowner-facing PASS care plan.'
      : 'Available internally. It will not appear in this client’s current PASS care plan unless selected.';

    card.classList.toggle('tha-pass-client-selected', checkbox.checked);
    if (!checkbox.dataset.thaSemanticsBound) {
      checkbox.dataset.thaSemanticsBound = 'true';
      checkbox.addEventListener('change', () => {
        window.setTimeout(() => adaptSelectionControl(card), 0);
      });
    }
  }

  function adaptPlanningWorkspace() {
    document.querySelectorAll('.passWorkspace').forEach(workspace => {
      exactHeadingChange(workspace, 'PASS Review Controls', 'THA PASS Planning');
      const planningPanel = workspace.querySelector('.passReviewPanel');
      if (planningPanel && !planningPanel.querySelector('.tha-pass-semantics-key')) {
        const key = document.createElement('p');
        key.className = 'tha-pass-semantics-key';
        key.innerHTML = '<span class="tha-pass-selection-dot" aria-hidden="true"></span><span><strong>How PASS color works:</strong> the left color is THA workflow status—orange needs attention, violet is planned, and green is verified or complete. Blue is different: it means the client selected the item for this year’s PASS care plan.</span>';
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

  function run() {
    installStyles();
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
