(() => {
  function installStyles() {
    if (document.getElementById('tha-intake-status-rails-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-intake-status-rails-styles';
    style.textContent = `
      .tha-intake-status-dot{display:inline-block;flex:0 0 auto;width:9px;height:9px;margin-right:2px;border-radius:50%;background:#e97919;box-shadow:0 0 0 3px rgba(233,121,25,.12)}
      .tha-intake-status-dot.isBlue{background:#287bb7;box-shadow:0 0 0 3px rgba(40,123,183,.12)}
      .homeownerLane .tha-quick-header{position:relative}
      .homeownerLane .tha-quick-header .tha-intake-status-dot{align-self:center;margin-right:8px}
      .cleanFieldPrep .intakeSubsection h3{padding-left:14px!important;padding-right:14px!important}
      .cleanFieldPrep .intakeSubsection h3 .tha-intake-status-dot{margin-left:0!important;margin-right:8px!important}
      .tha-prep-completion{display:none!important}
      @media(max-width:900px){
        .cleanFieldPrep .intakeSubsection h3{padding-left:10px!important;padding-right:10px!important}
        .tha-intake-status-dot{width:8px;height:8px}
      }
    `;
    document.head.append(style);
  }

  function fieldsFor(container) {
    return Array.from(container.querySelectorAll('input:not([type="checkbox"]), textarea, select'))
      .filter(field => !field.disabled && field.type !== 'hidden');
  }

  function hasAnAnswer(container) {
    return fieldsFor(container).some(field => String(field.value || '').trim());
  }

  function headerFor(container, mode) {
    if (mode === 'quick') return container.querySelector(':scope > .tha-quick-header');
    return container.querySelector(':scope > h3');
  }

  function setDot(container, mode) {
    const header = headerFor(container, mode);
    if (!header) return;
    let dot = header.querySelector(':scope > .tha-intake-status-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'tha-intake-status-dot';
      dot.setAttribute('aria-hidden', 'true');
      header.prepend(dot);
    }
    const answered = hasAnAnswer(container);
    dot.classList.toggle('isBlue', answered);
    dot.title = answered
      ? 'Answer recorded — this intake section has been addressed.'
      : 'No answer recorded yet — this intake section still needs attention.';
  }

  function refreshAll() {
    document.querySelectorAll('.homeownerLane .tha-quick-card').forEach(card => setDot(card, 'quick'));
    document.querySelectorAll('.cleanFieldPrep .intakeSubsection').forEach(section => setDot(section, 'fieldPrep'));
  }

  function installLiveUpdates() {
    if (window.__thaIntakeStatusRails) return;
    window.__thaIntakeStatusRails = true;
    const refreshClosest = event => {
      const quick = event.target.closest('.homeownerLane .tha-quick-card');
      if (quick) setDot(quick, 'quick');
      const prep = event.target.closest('.cleanFieldPrep .intakeSubsection');
      if (prep) setDot(prep, 'fieldPrep');
    };
    document.addEventListener('input', refreshClosest);
    document.addEventListener('change', refreshClosest);
  }

  function run() {
    installStyles();
    installLiveUpdates();
    document.querySelectorAll('.tha-prep-completion').forEach(node => node.remove());
    refreshAll();
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
