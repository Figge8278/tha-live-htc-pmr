(() => {
  const STYLE_ID = 'tha-scoped-open-close-rings-styles';
  const CONTROL_ATTR = 'data-tha-scoped-open-close-ring';

  const APP_CONTROL_SELECTOR = [
    '#root button',
    'main button',
    '#root .tha-quick-action',
    'main .tha-quick-action',
    '#root [role="button"]',
    'main [role="button"]'
  ].join(',');

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* App-wide Open / Close control language.
         Uses ring/outline styling only — no inserted icons, no layout-changing pseudo-elements. */
      #root .tha-open-close-ring,
      main .tha-open-close-ring{
        border-style:solid!important;
        border-width:1.5px!important;
        border-color:#9fc7ff!important;
        background:#f6faff!important;
        color:#155799!important;
        font-weight:950!important;
        box-shadow:0 0 0 2px rgba(47,128,237,.16),0 1px 0 rgba(21,87,153,.08)!important;
      }
      #root .tha-open-close-ring.tha-open-state,
      main .tha-open-close-ring.tha-open-state{
        background:#f6faff!important;
        border-color:#63a4ff!important;
        color:#155799!important;
        box-shadow:0 0 0 2px rgba(47,128,237,.18),0 1px 0 rgba(21,87,153,.08)!important;
      }
      #root .tha-open-close-ring.tha-close-state,
      main .tha-open-close-ring.tha-close-state{
        background:#eef6ff!important;
        border-color:#2f80ed!important;
        color:#0f4c92!important;
        box-shadow:0 0 0 2px rgba(47,128,237,.28),0 0 0 5px rgba(47,128,237,.13),0 1px 0 rgba(21,87,153,.10)!important;
      }
      #root .tha-open-close-ring:focus-visible,
      main .tha-open-close-ring:focus-visible{
        outline:3px solid rgba(47,128,237,.34)!important;
        outline-offset:2px!important;
      }
      /* Homeowner Quick Intake uses a span for the visible Open / Collapse pill. */
      #root .tha-quick-action.tha-open-close-ring,
      main .tha-quick-action.tha-open-close-ring{
        border-radius:10px!important;
        padding:6px 9px!important;
      }
      @media(max-width:720px){
        #root .tha-open-close-ring,
        main .tha-open-close-ring{box-shadow:0 0 0 1.5px rgba(47,128,237,.18),0 1px 0 rgba(21,87,153,.08)!important}
        #root .tha-open-close-ring.tha-close-state,
        main .tha-open-close-ring.tha-close-state{box-shadow:0 0 0 1.5px rgba(47,128,237,.30),0 0 0 4px rgba(47,128,237,.13),0 1px 0 rgba(21,87,153,.10)!important}
      }
    `;
    document.head.append(style);
  }

  function isSafeOpenCloseTarget(element) {
    if (!element || !element.isConnected) return false;
    if (element.matches?.('.tha-quick-header')) return false;
    if (element.closest?.('.navTabs,.viewTabs,.homeNav,.landingPage')) return false;
    if (element.matches?.('button,.tha-quick-action')) return true;

    const role = element.getAttribute?.('role');
    if (role === 'button') {
      const text = textOf(element);
      const isShortControl = text.length <= 36;
      const hasExplicitControlClass = element.matches('.collapseToggle,.tha-import-toggle,.tha-clean-prep-toggle,.roomOverviewToggle,.overviewToggle,.detailsToggle');
      return isShortControl || hasExplicitControlClass;
    }
    return false;
  }

  function classifyControl(control) {
    if (!isSafeOpenCloseTarget(control)) return;
    const text = textOf(control);
    const isOpenAction = /^(open|show|expand)\b/.test(text)
      || text === 'open'
      || text.includes('open all')
      || text.includes('open fields')
      || text.includes('open records')
      || text.includes('open control')
      || text.includes('open overview')
      || text.includes('open info')
      || text.includes('open planning')
      || text.includes('open details')
      || text.includes('expand import');
    const isCloseAction = /^(close|collapse|hide)\b/.test(text)
      || text === 'close'
      || text === 'collapse'
      || text.includes('collapse all')
      || text.includes('collapse fields')
      || text.includes('close control')
      || text.includes('close records')
      || text.includes('close overview')
      || text.includes('close planning')
      || text.includes('close details')
      || text.includes('collapse import');

    if (!isOpenAction && !isCloseAction) {
      if (control.getAttribute(CONTROL_ATTR)) {
        control.removeAttribute(CONTROL_ATTR);
        control.classList.remove('tha-open-close-ring', 'tha-open-state', 'tha-close-state');
      }
      return;
    }

    control.setAttribute(CONTROL_ATTR, 'true');
    control.classList.add('tha-open-close-ring');
    control.classList.toggle('tha-open-state', isOpenAction && !isCloseAction);
    control.classList.toggle('tha-close-state', isCloseAction);
  }

  function applyRings(root = document) {
    installStyles();
    root.querySelectorAll?.(APP_CONTROL_SELECTOR).forEach(classifyControl);
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
