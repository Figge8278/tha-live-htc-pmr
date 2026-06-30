(() => {
  const QUICK_SUMMARIES = {
    '1. What are your top goals or concerns for this walkthrough?': 'Goals, concerns, and what matters most',
    '2. Are there specific rooms, areas, or exterior spaces you want us to prioritize?': 'Priority rooms, areas, and exterior spaces',
    '7. Is there anything you specifically do not want overlooked?': 'Anything THA should be sure not to overlook'
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
      .homeownerLane .tha-quick-intake-note{margin:0 0 12px;padding:10px 12px;border:1px solid #d7e4e9;border-radius:12px;background:#f7fbfd;color:#5e717c;font-size:13px;font-weight:700;line-height:1.4}
      .passWorkspace .passReviewCard h4,.passWorkspace .tha-clean-output-card .findTop h3,.passWorkspace .tha-output-card .findTop h3{color:#5b4674!important}
      .passWorkspace .passReviewCard h4::before,.passWorkspace .tha-clean-output-card .findTop h3:before,.passWorkspace .tha-output-card .findTop h3:before{background:#745a91!important}
      @media(max-width:900px){
        .homeownerLane .structuredIntakeQuestion.tha-quick-card .structuredPromptGrid{grid-template-columns:1fr}
        .homeownerLane .tha-quick-header{align-items:flex-start}
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
    if (fields > 1) return `${fields} related response areas — open when ready`;
    return 'Optional homeowner context — open when ready';
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

    let open = false;
    const toggle = event => {
      event.preventDefault();
      event.stopPropagation();
      open = !open;
      question.classList.toggle('tha-quick-collapsed', !open);
      header.setAttribute('aria-expanded', String(open));
      action.textContent = open ? 'Collapse' : 'Open';
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') toggle(event);
    });

    question.classList.add('tha-quick-card', 'tha-quick-collapsed');
    question.dataset.thaQuickAccordion = 'true';
    question.append(header);
  }

  function organizeQuickIntake() {
    document.querySelectorAll('.homeownerLane .quickIntakeGrid > .intakeQuestion').forEach(buildQuickCard);
    document.querySelectorAll('.homeownerLane .quickIntakeGrid').forEach(grid => {
      if (grid.previousElementSibling?.classList.contains('tha-quick-intake-note')) return;
      const note = document.createElement('p');
      note.className = 'tha-quick-intake-note';
      note.textContent = 'Open only the question you want to answer. Your responses remain homeowner-provided context until THA verifies them during the HTC walkthrough.';
      grid.before(note);
    });
  }

  function run() {
    installStyles();
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
