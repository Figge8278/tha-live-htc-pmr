(() => {
  function installStyles() {
    if (document.getElementById('tha-pass-compact-controls-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-compact-controls-styles';
    style.textContent = `
      .passWorkspace .tha-pass-client-selection[hidden]{display:none!important}
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

  function findSelectionControl(card) {
    const checkbox = Array.from(card.querySelectorAll('input[type="checkbox"]')).find(input => {
      const label = input.closest('label') || input.parentElement;
      return /include in pmr|include|pass care plan/i.test(label?.textContent || '');
    });
    if (!checkbox) return null;
    return checkbox.closest('label') || checkbox.parentElement;
  }

  function adaptCard(card) {
    const control = findSelectionControl(card);
    if (!control) return;
    control.classList.add('tha-pass-client-selection');
    control.hidden = !cardIsOpen(card);
  }

  function adaptWorkspace(workspace) {
    Array.from(workspace.querySelectorAll('h1,h2,h3')).forEach(heading => {
      const text = heading.textContent.trim();
      if (text === 'PASS Review Controls' || text === 'THA PASS Planning') heading.textContent = 'PASS Care Plan Builder';
    });
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
