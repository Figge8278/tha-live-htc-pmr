(() => {
  const STYLE_ID = 'tha-scoped-open-close-rings-styles';
  const BUTTON_ATTR = 'data-tha-scoped-open-close-ring';

  const SCOPED_SELECTORS = [
    'main.pmr .collapsibleBlock .collapseToggle',
    'main.pmr.passWorkspace .passPlanCategoryMeta > button.secondaryBtn',
    'main.pmr.passWorkspace .passReviewDetailsToggle > button.secondaryBtn',
    'main.pmr .tha-supporting-toolbar > button.tha-supporting-toggle'
  ].join(',');

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Scoped only to PMR/PASS panel controls. Do not touch landing/nav buttons. */
      main.pmr button.tha-open-close-ring{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:7px!important;
        border-color:#9fc7ff!important;
        background:#f6faff!important;
        color:#155799!important;
        font-weight:950!important;
        box-shadow:0 1px 0 rgba(21,87,153,.08)!important;
      }
      main.pmr button.tha-open-close-ring::before{
        content:"";
        display:inline-block!important;
        width:12px!important;
        height:12px!important;
        min-width:12px!important;
        border-radius:999px!important;
        box-sizing:border-box!important;
        background:#fff!important;
        border:2px solid #2f80ed!important;
        box-shadow:0 0 0 1px rgba(47,128,237,.10)!important;
      }
      main.pmr button.tha-open-close-ring.tha-open-state{
        background:#f6faff!important;
        border-color:#9fc7ff!important;
        color:#155799!important;
      }
      main.pmr button.tha-open-close-ring.tha-open-state::before{
        border-width:2px!important;
        box-shadow:0 0 0 1px rgba(47,128,237,.12)!important;
      }
      main.pmr button.tha-open-close-ring.tha-close-state{
        background:#eef6ff!important;
        border-color:#2f80ed!important;
        color:#0f4c92!important;
      }
      main.pmr button.tha-open-close-ring.tha-close-state::before{
        border-width:2px!important;
        box-shadow:0 0 0 3px rgba(47,128,237,.22), inset 0 0 0 2px #fff!important;
      }
      main.pmr button.tha-open-close-ring:focus-visible{
        outline:3px solid rgba(47,128,237,.32)!important;
        outline-offset:2px!important;
      }
      @media(max-width:720px){
        main.pmr button.tha-open-close-ring{gap:5px!important;padding-inline:9px!important}
        main.pmr button.tha-open-close-ring::before{width:10px!important;height:10px!important;min-width:10px!important}
      }
    `;
    document.head.append(style);
  }

  function classifyButton(button) {
    if (!button || !button.isConnected) return;
    const text = textOf(button);
    const isOpenAction = /^open\b/.test(text) || text.includes(' open ') || text.includes('open info') || text.includes('open planning');
    const isCloseAction = /^close\b/.test(text) || text.includes(' close ') || text.includes('collapse') || text.includes('close planning');
    if (!isOpenAction && !isCloseAction) return;

    button.setAttribute(BUTTON_ATTR, 'true');
    button.classList.add('tha-open-close-ring');
    button.classList.toggle('tha-open-state', isOpenAction && !isCloseAction);
    button.classList.toggle('tha-close-state', isCloseAction);
  }

  function applyScopedRings(root = document) {
    installStyles();
    root.querySelectorAll?.(SCOPED_SELECTORS).forEach(classifyButton);
  }

  function scheduleApply() {
    window.requestAnimationFrame(() => {
      applyScopedRings(document);
      window.setTimeout(() => applyScopedRings(document), 80);
    });
  }

  function start() {
    applyScopedRings(document);
    const observer = new MutationObserver(mutations => {
      let shouldApply = false;
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') shouldApply = true;
        if (mutation.type === 'attributes' && mutation.target instanceof Element && mutation.target.matches?.(SCOPED_SELECTORS)) shouldApply = true;
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(SCOPED_SELECTORS) || node.querySelector?.(SCOPED_SELECTORS)) shouldApply = true;
        });
      }
      if (shouldApply) scheduleApply();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(() => applyScopedRings(document), 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
