(() => {
  const QUICK_SUMMARIES = {
    '1. What are your top goals or concerns for this walkthrough?': '1. Goals, concerns, and what matters most',
    '2. Are there specific rooms, areas, or exterior spaces you want us to prioritize?': '2. Priority rooms, areas, and exterior spaces',
    '7. Is there anything you specifically do not want overlooked?': '7. Anything THA should be sure not to overlook'
  };

  function installStyles() {
    if (document.getElementById('tha-quick-intake-accordion-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-quick-intake-accordion-styles';
    style.textContent = `
      .homeownerLane .quickIntakeGrid{display:grid;grid-template-columns:1fr!important;gap:10px!important}
      .homeownerLane .intakeQuestion.tha-quick-card{display:flex!important;flex-direction:column!important;gap:10px!important;padding:0!important;border:1px solid #d8e4ea!important;border-radius:15px!important;background:#fff!important;overflow:hidden;box-shadow:0 4px 12px rgba(14,61,88,.035)}
      .homeownerLane .intakeQuestion.tha-quick-card.tha-quick-collapsed{padding-bottom:0!important}
      .homeownerLane .tha-quick-header{order:-1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;background:#f7fbfd;color:#153e59;cursor:pointer;user-select:none}
      .homeownerLane .tha-quick-header:focus-visible{outline:3px solid #9bc4dc;outline-offset:-3px}
      .homeownerLane .tha-quick-title{display:grid;gap:3px;min-width:0}
      .homeownerLane .tha-quick-title strong{font-size:15px;line-height:1.25}
      .homeownerLane .tha-quick-title small{color:#667780;font-size:12px;font-weight:700;line-height:1.3}
      .homeownerLane .tha-quick-action{flex:0 0 auto;border:1px solid #c8d8e1;border-radius:10px;padding:6px 9px;background:#fff;color:#163f58;font-size:12px;font-weight:900}
      .homeownerLane .intakeQuestion.tha-quick-card.tha-quick-collapsed>:not(.tha-quick-header){display:none!important}
      .homeownerLane .intakeQuestion.tha-quick-card:not(.tha-quick-collapsed)>:not(.tha-quick-header){margin-left:14px!important;margin-right:14px!important}
      .homeownerLane .intakeQuestion.tha-quick-card:not(.tha-quick-collapsed)>:last-child{margin-bottom:14px!important}
      .homeownerLane .intakeQuestion.tha-quick-card textarea{resize:vertical;min-height:96px}
      .homeownerLane .structuredIntakeQuestion.tha-quick-card .structuredPromptGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .homeownerLane .structuredIntakeQuestion.tha-quick-card .structuredPromptField{padding:10px;border:1px solid #dbe6eb;border-radius:12px;background:#fbfdfe}
      .tha-intake-bulk-controls{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin:0 0 12px}
      .tha-intake-bulk-controls button,.intakeImportHeader .tha-import-toggle{border:1px solid #c8d8e1;border-radius:10px;background:#fff;color:#163f58;padding:7px 10px;font-size:12px;font-weight:900}
      .tha-intake-bulk-controls button:hover,.intakeImportHeader .tha-import-toggle:hover{border-color:#8cabbc;background:#f5fafc}
      .cleanFieldPrep .intakeSubsection h3{position:relative}
      .tha-prep-completion{margin-left:auto;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900;white-space:nowrap}
      .tha-prep-completion.needsContext{background:#fff1e5;color:#a75113;border:1px solid #f0c79e}
      .tha-prep-completion.contextComplete{background:#eaf7e9;color:#2f6a2b;border:1px solid #b8dfb4}
      .intakeImportPanel.tha-import-collapsed>:not(.intakeImportHeader){display:none!important}
      .intakeImportPanel .intakeImportHeader{align-items:flex-start}
      .intakeImportPanel .intakeImportHeader .tha-import-toggle{margin-left:auto;flex:0 0 auto}
      .intakeImportPanel .intakeImportHeader .lede{max-width:680px}
      .passWorkspace .passReviewCard h4,.passWorkspace .tha-clean-output-card .findTop h3,.passWorkspace .tha-output-card .findTop h3{color:#5b4674!important}
      .passWorkspace .passReviewCard h4::before,.passWorkspace .tha-clean-output-card .findTop h3:before,.passWorkspace .tha-output-card .findTop h3:before{background:#745a91!important}
      @media(max-width:900px){
        .homeownerLane .structuredIntakeQuestion.tha-quick-card .structuredPromptGrid{grid-template-columns:1fr}
        .homeownerLane .tha-quick-header{align-items:flex-start}
        .tha-intake-bulk-controls{justify-content:stretch}
        .tha-intake-bulk-controls button{flex:1}
        .tha-prep-completion{margin-left:0}
        .intakeImportPanel .intakeImportHeader .tha-import-toggle{width:100%;margin-left:0}
      }
    `;
    document.head.append(style);
  }

  function sourceQuestionText(question) {
    const prompt = Array.from(question.children).find(child => child.tagName === 'SPAN');
    return prompt?.textContent?.trim() || 'Homeowner intake question';
  }

  function simplifiedTitle(question, prompt) {
    if (QUICK_SUMMARIES[prompt]) return QUICK_SUMMARIES[prompt];
    const questionNumber = prompt.match(/^(\d+)\./)?.[1];
    const brief = prompt.replace(/^\d+\.\s*/, '').replace(/[?!.].*$/, '').trim();
    return questionNumber ? `${questionNumber}. ${brief}` : brief || 'Homeowner context';
  }

  function subline(question) {
    const fields = question.querySelectorAll('textarea,input,select').length;
    return fields > 1 ? `${fields} related response areas` : 'Optional homeowner context';
  }

  function setQuickCardOpen(question, open) {
    const header = question.querySelector('.tha-quick-header');
    const action = question.querySelector('.tha-quick-action');
    question.classList.toggle('tha-quick-collapsed', !open);
    header?.setAttribute('aria-expanded', String(open));
    if (action) action.textContent = open ? 'Collapse' : 'Open';
  }

  function buildQuickCard(question) {
    if (question.dataset.thaQuickAccordion === 'true') return;
    const prompt = sourceQuestionText(question);
    const header = document.createElement('span');
    header.className = 'tha-quick-header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');

    const title = document.createElement('span');
    title.className = 'tha-quick-title';
    const strong = document.createElement('strong');
    strong.textContent = simplifiedTitle(question, prompt);
    const small = document.createElement('small');
    small.textContent = subline(question);
    title.append(strong, small);

    const action = document.createElement('span');
    action.className = 'tha-quick-action';
    action.textContent = 'Open';
    header.append(title, action);

    const toggle = event => {
      event.preventDefault();
      event.stopPropagation();
      setQuickCardOpen(question, question.classList.contains('tha-quick-collapsed'));
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') toggle(event);
    });

    question.classList.add('tha-quick-card', 'tha-quick-collapsed');
    question.dataset.thaQuickAccordion = 'true';
    question.append(header);
  }

  function setFieldPrepSectionOpen(section, open) {
    const button = section.querySelector('.tha-clean-prep-toggle');
    section.classList.toggle('cleanCollapsed', !open);
    section.classList.toggle('cleanExpanded', open);
    if (button) {
      button.textContent = open ? 'Collapse fields' : 'Open fields';
      button.setAttribute('aria-expanded', String(open));
    }
  }

  function makeBulkControls(label, onOpenAll, onCollapseAll) {
    const controls = document.createElement('div');
    controls.className = 'tha-intake-bulk-controls';
    controls.setAttribute('aria-label', `${label} display controls`);
    const openAll = document.createElement('button');
    openAll.type = 'button';
    openAll.textContent = 'Open all';
    openAll.addEventListener('click', onOpenAll);
    const collapseAll = document.createElement('button');
    collapseAll.type = 'button';
    collapseAll.textContent = 'Collapse all';
    collapseAll.addEventListener('click', onCollapseAll);
    controls.append(openAll, collapseAll);
    return controls;
  }

  function addQuickIntakeControls(grid) {
    if (grid.parentElement.querySelector(':scope > .tha-quick-intake-controls')) return;
    const controls = makeBulkControls(
      'Homeowner Quick Intake',
      () => grid.querySelectorAll('.tha-quick-card').forEach(card => setQuickCardOpen(card, true)),
      () => grid.querySelectorAll('.tha-quick-card').forEach(card => setQuickCardOpen(card, false))
    );
    controls.classList.add('tha-quick-intake-controls');
    grid.before(controls);
  }

  function countContextFields(section) {
    const fields = Array.from(section.querySelectorAll('.intakeGrid input,.intakeGrid textarea,.intakeGrid select'));
    const filled = fields.filter(field => String(field.value || '').trim()).length;
    return { filled, total: fields.length };
  }

  function refreshFieldPrepCompletion(section) {
    const heading = section.querySelector(':scope > h3');
    const toggle = heading?.querySelector('.tha-clean-prep-toggle');
    if (!heading || !toggle) return;
    const { filled, total } = countContextFields(section);
    let badge = heading.querySelector('.tha-prep-completion');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'tha-prep-completion';
      toggle.before(badge);
    }
    const complete = total > 0 && filled === total;
    badge.className = `tha-prep-completion ${complete ? 'contextComplete' : 'needsContext'}`;
    badge.textContent = complete ? `Context complete · ${filled}/${total}` : `Context to add · ${filled}/${total}`;
    badge.title = 'This indicates intake context captured, not HTC verification or a PMR finding.';
  }

  function addFieldPrepControls(lane) {
    if (!lane.querySelector(':scope > .tha-field-prep-controls')) {
      const anchor = lane.querySelector('.tha-field-prep-guide') || lane.querySelector('.lede') || lane.querySelector('summary');
      const controls = makeBulkControls(
        'THA Field Prep',
        () => lane.querySelectorAll('.intakeSubsection').forEach(section => setFieldPrepSectionOpen(section, true)),
        () => lane.querySelectorAll('.intakeSubsection').forEach(section => setFieldPrepSectionOpen(section, false))
      );
      controls.classList.add('tha-field-prep-controls');
      anchor?.after(controls);
    }
    lane.querySelectorAll('.intakeSubsection').forEach(refreshFieldPrepCompletion);
  }

  function prepareImportPanel(panel) {
    const header = panel.querySelector('.intakeImportHeader');
    if (!header) return;
    const title = header.querySelector('h2');
    const lede = header.querySelector('.lede');
    if (title) title.textContent = 'Import a Completed Intake';
    if (lede) lede.textContent = 'Paste or upload a completed homeowner response, preview recognized answers, then apply them to this working walkthrough. This imports homeowner context only; it does not create HTC findings or Field Prep notes.';
    panel.querySelectorAll('.importActions button').forEach(button => {
      if (/preview intake import/i.test(button.textContent)) button.textContent = 'Review imported answers';
      if (/apply to current walkthrough/i.test(button.textContent)) button.textContent = 'Add reviewed answers to walkthrough';
    });
    if (panel.tagName === 'DETAILS') {
      panel.classList.remove('tha-import-collapsed');
      header.querySelector('.tha-import-toggle')?.remove();
      return;
    }
    if (header.querySelector('.tha-import-toggle')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'tha-import-toggle';
    let open = false;
    panel.classList.add('tha-import-collapsed');
    toggle.textContent = 'Expand import';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      open = !open;
      panel.classList.toggle('tha-import-collapsed', !open);
      toggle.textContent = open ? 'Collapse import' : 'Expand import';
      toggle.setAttribute('aria-expanded', String(open));
    });
    header.append(toggle);
  }

  function organizeQuickIntake() {
    document.querySelectorAll('.homeownerLane .tha-quick-intake-note').forEach(note => note.remove());
    document.querySelectorAll('.homeownerLane .quickIntakeGrid > .intakeQuestion').forEach(buildQuickCard);
    document.querySelectorAll('.homeownerLane .quickIntakeGrid').forEach(addQuickIntakeControls);
    document.querySelectorAll('details.intakeLane:not(.homeownerLane)').forEach(addFieldPrepControls);
    document.querySelectorAll('.intakeImportPanel').forEach(prepareImportPanel);
  }

  function installLiveFieldPrepCounts() {
    if (window.__thaFieldPrepCompletionCounts) return;
    window.__thaFieldPrepCompletionCounts = true;
    document.addEventListener('input', event => {
      const section = event.target.closest('.cleanFieldPrep .intakeSubsection');
      if (section) refreshFieldPrepCompletion(section);
    });
    document.addEventListener('change', event => {
      const section = event.target.closest('.cleanFieldPrep .intakeSubsection');
      if (section) refreshFieldPrepCompletion(section);
    });
  }

  function run() {
    installStyles();
    installLiveFieldPrepCounts();
    organizeQuickIntake();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
