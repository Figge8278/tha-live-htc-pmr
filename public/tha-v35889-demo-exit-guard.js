(() => {
  const ID = 'tha-v35889-demo-exit-guard';
  const START_KEY = 'tha-v358-start-active';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  let loading = false;

  function demoSourceButton(title) {
    return Array.from(document.querySelectorAll('.demoScenarioCard .demoScenario'))
      .find(article => text(article.querySelector('h4')?.textContent) === title)
      ?.querySelector('button') || null;
  }

  function setStartActive(active) {
    localStorage.setItem(START_KEY, active ? 'true' : 'false');
    document.querySelector('.app')?.classList.toggle('thaV358StartActive', active);
  }

  function pmrNavButton() {
    return Array.from(document.querySelectorAll('.topbar nav button'))
      .find(button => /^PMR$/i.test(text(button.textContent))) || null;
  }

  function pmrIsVisible() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return false;
    const style = window.getComputedStyle(pmr);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function restoreTriggerButton(triggerButton) {
    if (!triggerButton) return;
    triggerButton.disabled = false;
    triggerButton.removeAttribute('aria-busy');
    const copy = triggerButton.querySelector('small');
    if (copy?.dataset.loadingCopy) {
      copy.textContent = copy.dataset.loadingCopy;
      delete copy.dataset.loadingCopy;
    }
  }

  function openPmr(attempt = 0, triggerButton = null) {
    setStartActive(false);
    window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }));

    if (!pmrIsVisible()) pmrNavButton()?.click();

    window.requestAnimationFrame(() => {
      setStartActive(false);
      if (pmrIsVisible()) {
        loading = false;
        restoreTriggerButton(triggerButton);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (attempt < 24) {
        window.setTimeout(() => openPmr(attempt + 1, triggerButton), 100);
        return;
      }

      // Never strand the operator on an empty shell. If the PMR did not mount,
      // return to Start so the demo can be retried without refreshing the app.
      loading = false;
      setStartActive(true);
      restoreTriggerButton(triggerButton);
      const copy = triggerButton?.querySelector('small');
      if (copy) copy.textContent = 'Demo did not finish loading. Select it again.';
    });
  }

  document.addEventListener('click', event => {
    const triggerButton = event.target.closest('.thaV3588DemoButton');
    if (!triggerButton) return;
    if (loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    // Own this transition in one place. The prior button handler and exit guard
    // both attempted to leave Start, which could race React and expose a blank app.
    event.preventDefault();
    event.stopImmediatePropagation();

    const title = text(triggerButton.querySelector('strong')?.textContent);
    const sourceButton = demoSourceButton(title);
    if (!sourceButton) return;

    loading = true;
    triggerButton.disabled = true;
    triggerButton.setAttribute('aria-busy', 'true');
    const copy = triggerButton.querySelector('small');
    if (copy) {
      copy.dataset.loadingCopy = copy.textContent || '';
      copy.textContent = 'Loading demo walkthrough…';
    }

    sourceButton.click();
    window.setTimeout(() => openPmr(0, triggerButton), 0);
  }, true);
})();
