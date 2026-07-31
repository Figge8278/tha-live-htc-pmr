(() => {
  const ID = 'tha-v3578-start-page-polish';
  if (window[ID]) return;
  window[ID] = true;
  const text = value => String(value || '').replace(/\s+/g, ' ').trim();
  function run() {
    const app = document.querySelector('.app.thaStartViewActive.thaStartSetupOpen');
    const panel = app?.querySelector(':scope > .walkthroughControlsPanel.collapsed');
    if (!panel) return;
    const open = Array.from(panel.querySelectorAll('button')).find(button => /open setup|open controls/i.test(text(button.textContent)));
    open?.click();
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; run(); });
  }
  schedule();
  setTimeout(schedule, 500);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
})();