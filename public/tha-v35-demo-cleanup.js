(() => {
  const STYLE_ID = 'tha-v35-demo-cleanup-styles';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-demo-cleanup-note{margin:10px 0!important;padding:10px 12px!important;border:1px solid #cbdfea!important;border-radius:14px!important;background:#f7fbfd!important;color:#315568!important;font-size:12px!important;font-weight:850!important;line-height:1.4!important}
      .tha-demo-cleanup-note strong{color:#0f4f5b!important}
      .tha-secondary-demo-tool{opacity:.72!important;filter:saturate(.78)!important}
      .tha-secondary-demo-tool::before{content:'Advanced demo tool';display:inline-flex!important;margin:0 0 6px 0!important;padding:4px 7px!important;border:1px solid #d8e4ea!important;border-radius:999px!important;background:#fff!important;color:#536b77!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.03em!important}
      .tha-client-demo-primary{outline:3px solid rgba(34,197,94,.22)!important;box-shadow:0 0 0 5px rgba(34,197,94,.08)!important;border-radius:16px!important}
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
      if (/load client delivery demo/i.test(label)) {
        nearestCard(button)?.classList.add('tha-client-demo-primary');
      }
      if (/demo/i.test(label) && !/client delivery demo/i.test(label)) {
        nearestCard(button)?.classList.add('tha-secondary-demo-tool');
      }
    });
  }

  function addNote() {
    const primaryButton = Array.from(document.querySelectorAll('button,[role="button"]')).find(button => /load client delivery demo/i.test(textOf(button)));
    if (!primaryButton) return;
    const card = nearestCard(primaryButton);
    if (!card || card.querySelector('.tha-demo-cleanup-note')) return;
    const note = document.createElement('div');
    note.className = 'tha-demo-cleanup-note';
    note.innerHTML = '<strong>Main test path:</strong> use Client Delivery Demo for Drive, photo, PMR print, and electronic client-folder testing. Other demo tools are advanced/development checks.';
    card.insertBefore(note, card.firstChild);
  }

  function render() {
    installStyles();
    markDemoAreas();
    addNote();
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