(() => {
  const STYLE_ID = 'tha-v35-demo-cleanup-styles';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    const old = document.getElementById(STYLE_ID);
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-demo-cleanup-note{display:none!important}
      .tha-secondary-demo-tool{display:none!important}
      .tha-secondary-demo-tool::before{display:none!important;content:''!important}
      .tha-client-demo-primary{outline:0!important;box-shadow:none!important;border-radius:inherit!important}
      .walkthroughControlsPanel .tha-client-demo-primary:not(.tha-drive-advanced-wrap *){display:none!important}
      @media print{.tha-demo-cleanup-note{display:none!important}}
    `;
    document.head.append(style);
  }

  function nearestCard(element) {
    let current = element;
    for (let i = 0; current && i < 6; i += 1) {
      const cls = current.className ? String(current.className) : '';
      if (/card|panel|demo|scenario|advanced|walkthroughControls|businessRecords/i.test(cls)) return current;
      current = current.parentElement;
    }
    return element?.parentElement || element;
  }

  function markDemoAreas() {
    const buttons = Array.from(document.querySelectorAll('button,[role="button"]'));
    buttons.forEach(button => {
      const label = textOf(button);
      if (/load client delivery demo/i.test(label)) nearestCard(button)?.classList.add('tha-client-demo-primary');
      if (/demo/i.test(label) && !/client delivery demo/i.test(label)) nearestCard(button)?.classList.add('tha-secondary-demo-tool');
    });
  }

  function render() {
    installStyles();
    markDemoAreas();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      render();
      window.setTimeout(render, 160);
    });
  }

  function start() {
    render();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();