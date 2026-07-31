(() => {
  const ID = 'tha-v35889-demo-exit-guard';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();

  function exposeLoadedDemoPmr() {
    localStorage.setItem('tha-v358-start-active', 'false');
    document.querySelector('.app')?.classList.remove('thaV358StartActive');

    window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }));

    const pmrButton = Array.from(document.querySelectorAll('.topbar nav button'))
      .find(button => /^PMR$/i.test(text(button.textContent)));
    if (pmrButton && !pmrButton.classList.contains('on') && !pmrButton.classList.contains('active')) {
      pmrButton.click();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', event => {
    const demoButton = event.target.closest('.thaV3588DemoButton');
    if (!demoButton) return;

    window.requestAnimationFrame(() => window.setTimeout(exposeLoadedDemoPmr, 0));
    window.setTimeout(exposeLoadedDemoPmr, 180);
    window.setTimeout(exposeLoadedDemoPmr, 500);
  }, true);
})();
