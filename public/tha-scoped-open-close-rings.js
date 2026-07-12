(() => {
  const STYLE_ID = 'tha-scoped-open-close-rings-styles';
  const BUTTON_ATTR = 'data-tha-scoped-open-close-ring';

  const APP_BUTTON_SELECTOR = '#root button, main button';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* App-wide Open / Close control language.
         Uses ring/outline styling only — no inserted icons, so it does not alter spacing. */
      #root button.tha-open-close-ring,
      main button.tha-open-close-ring{
        position:relative!important;
        border-style:solid!important;
        border-width:1.5px!important;
        border-color:#9fc7ff!important;
        background:#f6faff!important;
        color:#155799!important;
        font-weight:950!important;
        box-shadow:0 0 0 2px rgba(47,128,237,.16),0 1px 0 rgba(21,87,153,.08)!important;
      }
      #root button.tha-open-close-ring.tha-open-state,
      main button.tha-open-close-ring.tha-open-state{
        background:#f6faff!important;
        border-color:#63a4ff!important;
        color:#155799!important;
        box-shadow:0 0 0 2px rgba(47,128,237,.18),0 1px 0 rgba(21,87,153,.08)!important;
      }
      #root button.tha-open-close-ring.tha-close-state,
      main button.tha-open-close-ring.tha-close-state{
        background:#eef6ff!important;
        border-color:#2f80ed!important;
        color:#0f4c92!important;
        box-shadow:0 0 0 2px rgba(47,128,237,.28),0 0 0 5px rgba(47,128,237,.13),0 1px 0 rgba(21,87,153,.10)!important;
      }
      #root button.tha-open-close-ring:focus-visible,
      main button.tha-open-close-ring:focus-visible{
        outline:3px solid rgba(47,128,237,.34)!important;
        outline-offset:2px!important;
      }
      @media(max-width:720px){
        #root button.tha-open-close-ring,
        main button.tha-open-close-ring{box-shadow:0 0 0 1.5px rgba(47,128,237,.18),0 1px 0 rgba(21,87,153,.08)!important}
        #root button.tha-open-close-ring.tha-close-state,
        main button.tha-open-close-ring.tha-close-state{box-shadow:0 0 0 1.5px rgba(47,128,237,.30),0 0 0 4px rgba(47,128,237,.13),0 1px 0 rgba(21,87,153,.10)!important}
      }
    `;
    document.head.append(style);
  }

  function classifyButton(button) {
    if (!button || !button.isConnected) return;
    const text = textOf(button);
    const isOpenAction = /^(open|show|expand)\b/.test(text)
      || text.includes(' open ')
      || text.includes('open records')
      || text.includes('open control')
      || text.includes('open info')
      || text.includes('open planning')
      || text.includes('open details');
    const isCloseAction = /^(close|collapse|hide)\b/.test(text)
      || text.includes(' close ')
      || text.includes('close control')
      || text.includes('close records')
      || text.includes('close planning')
      || text.includes('close details')
      || text.includes('collapse');

    if (!isOpenAction && !isCloseAction) {
      if (button.getAttribute(BUTTON_ATTR)) {
        button.removeAttribute(BUTTON_ATTR);
        button.classList.remove('tha-open-close-ring', 'tha-open-state', 'tha-close-state');
      }
      return;
    }

    button.setAttribute(BUTTON_ATTR, 'true');
    button.classList.add('tha-open-close-ring');
    button.classList.toggle('tha-open-state', isOpenAction && !isCloseAction);
    button.classList.toggle('tha-close-state', isCloseAction);
  }

  function applyRings(root = document) {
    installStyles();
    root.querySelectorAll?.(APP_BUTTON_SELECTOR).forEach(classifyButton);
  }

  function scheduleApply() {
    window.requestAnimationFrame(() => {
      applyRings(document);
      window.setTimeout(() => applyRings(document), 80);
      window.setTimeout(() => applyRings(document), 250);
    });
  }

  function start() {
    applyRings(document);
    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-expanded', 'style'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(() => applyRings(document), 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
