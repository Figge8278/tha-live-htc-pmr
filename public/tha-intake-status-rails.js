(() => {
  function installStyles() {
    if (document.getElementById('tha-intake-status-rails-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-intake-status-rails-styles';
    style.textContent = `
      .homeownerLane .tha-quick-card,.cleanFieldPrep .intakeSubsection{position:relative!important}
      .tha-intake-status-rail{position:absolute;left:-17px;top:24px;width:9px;height:9px;border-radius:50%;background:#e97919;box-shadow:0 0 0 3px rgba(233,121,25,.12);z-index:2}
      .tha-intake-status-rail.isBlue{background:#287bb7;box-shadow:0 0 0 3px rgba(40,123,183,.12)}
      .cleanFieldPrep .tha-intake-status-rail{top:27px}
      .tha-prep-completion{display:none!important}
      @media(max-width:900px){
        .tha-intake-status-rail{left:-10px;width:8px;height:8px}
      }
    `;
    document.head.append(style);
  }

  function fieldsFor(container) {
    return Array.from(container.querySelectorAll('input:not([type="checkbox"]), textarea, select'))
      .filter(field => !field.disabled && field.type !== 'hidden');
  }

  function isComplete(container) {
    const fields = fieldsFor(container);
    return Boolean(fields.length) && fields.every(field => String(field.value || '').trim());
  }

  function setRail(container) {
    let rail = container.querySelector(':scope > .tha-intake-status-rail');
    if (!rail) {
      rail = document.createElement('span');
      rail.className = 'tha-intake-status-rail';
      rail.setAttribute('aria-hidden', 'true');
      container.prepend(rail);
    }
    const complete = isComplete(container);
    rail.classList.toggle('isBlue', complete);
    rail.title = complete ? 'Context captured — no more intake questions in this section.' : 'Context still needed — ask or confirm remaining intake questions.';
  }

  function refreshAll() {
    document.querySelectorAll('.homeownerLane .tha-quick-card').forEach(setRail);
    document.querySelectorAll('.cleanFieldPrep .intakeSubsection').forEach(setRail);
  }

  function installLiveUpdates() {
    if (window.__thaIntakeStatusRails) return;
    window.__thaIntakeStatusRails = true;
    const refreshClosest = event => {
      const quick = event.target.closest('.homeownerLane .tha-quick-card');
      if (quick) setRail(quick);
      const prep = event.target.closest('.cleanFieldPrep .intakeSubsection');
      if (prep) setRail(prep);
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
