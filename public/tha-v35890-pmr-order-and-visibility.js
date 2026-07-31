(() => {
  const ID = 'tha-v35890-pmr-order-and-visibility';
  const STYLE_ID = `${ID}-styles`;
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.58.9.0: newer PMR requirements supersede V3.50's retired hide rules. */
      main.pmr:not(.passWorkspace) .pmrInternalActionList,
      main.pmr:not(.passWorkspace) .pmrInternalActionList .thaActionTodoList,
      main.pmr:not(.passWorkspace) .pmrInternalActionList .thaActionTodoList[data-tha-v50-hidden="true"],
      main.pmr:not(.passWorkspace) .thaV35890SupportingReference,
      main.pmr:not(.passWorkspace) .thaV35890SupportingReference[data-tha-v50-hidden="true"]{
        display:block!important;
        visibility:visible!important;
        opacity:1!important;
      }
      main.pmr:not(.passWorkspace) .pmrInternalActionList{
        margin-top:18px!important;
      }
      main.pmr:not(.passWorkspace) .pmrInternalActionList .thaActionTodoList{
        border-left:1px solid #d8e4ea!important;
        border-right:7px solid #7e4c9a!important;
        background:#fbf8ff!important;
        box-shadow:0 8px 22px rgba(76,58,114,.08)!important;
      }
      main.pmr:not(.passWorkspace) .thaV35890SupportingReference{
        margin-top:18px!important;
      }
      main.pmr:not(.passWorkspace) [data-tha-v35890-order="true"]{
        scroll-margin-top:90px;
      }
      @media print{
        main.pmr:not(.passWorkspace) .pmrInternalActionList,
        main.pmr:not(.passWorkspace) .pmrInternalActionList .thaActionTodoList{
          display:none!important;
        }
      }
    `;
    document.head.append(style);
  }

  function directBlocks(pmr) {
    return Array.from(pmr?.children || []).filter(node => node?.nodeType === 1);
  }

  function heading(block) {
    return text(block?.querySelector?.('h1,h2,h3,summary')?.textContent || '');
  }

  function findDirect(pmr, patterns, selector = '') {
    return directBlocks(pmr).find(block => {
      if (selector && block.matches?.(selector)) return true;
      const value = heading(block);
      return patterns.some(pattern => pattern.test(value));
    }) || null;
  }

  function moveAfter(anchor, block) {
    if (!anchor || !block || anchor === block || !anchor.parentNode) return anchor;
    if (anchor.nextElementSibling !== block) anchor.parentNode.insertBefore(block, anchor.nextElementSibling);
    block.dataset.thaV35890Order = 'true';
    return block;
  }

  function revealActionList(pmr) {
    const wrapper = pmr.querySelector(':scope > .pmrInternalActionList');
    const list = wrapper?.querySelector('.thaActionTodoList');
    if (!wrapper || !list) return wrapper;
    wrapper.hidden = false;
    wrapper.removeAttribute('aria-hidden');
    list.hidden = false;
    list.removeAttribute('aria-hidden');
    list.dataset.thaV35890Visible = 'true';
    return wrapper;
  }

  function supportingReference(pmr) {
    const block = findDirect(
      pmr,
      [/^supporting home care reference$/i, /home-specific care supported by intake/i],
      '.thaV35890SupportingReference'
    );
    if (!block) return null;
    block.classList.add('thaV35890SupportingReference');
    block.hidden = false;
    block.removeAttribute('aria-hidden');
    const title = block.querySelector('h2,h3');
    if (title && !/^Supporting Home Care Reference$/i.test(text(title.textContent))) {
      const icon = title.querySelector('svg');
      title.textContent = '';
      if (icon) title.append(icon);
      title.append(document.createTextNode('Supporting Home Care Reference'));
    }
    return block;
  }

  function enforcePmrOrder() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;

    const trade = findDirect(pmr, [/trade\s*[-–—]?\s*by\s*[-–—]?\s*trade/i, /trade action list/i]);
    const detail = findDirect(pmr, [/^detail appendix$/i], '.detailAppendix');
    const carePlan = findDirect(pmr, [/^preventative maintenance care plan$/i, /^preventive maintenance care plan$/i], '.passPlanSummary');
    const homeownerContext = findDirect(pmr, [/homeowner goals.*intake context/i], '.intakeSummary');
    const actionList = revealActionList(pmr);
    const support = supportingReference(pmr);

    let cursor = trade;
    [detail, carePlan, homeownerContext, actionList, support].forEach(block => {
      if (!cursor || !block) return;
      cursor = moveAfter(cursor, block);
    });
  }

  function updateDemoCopy() {
    const demoThree = Array.from(document.querySelectorAll('.thaV3588DemoButton')).find(button => /^Demo 3\b/i.test(text(button.querySelector('strong')?.textContent)));
    const copy = demoThree?.querySelector('small');
    if (copy && !/current HTC controls/i.test(text(copy.textContent))) {
      copy.textContent = 'Current-build mixed demo created from today’s HTC controls, with PMR findings, PMCP care, and THA action items.';
    }
  }

  function sync() {
    installStyles();
    enforcePmrOrder();
    updateDemoCopy();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      sync();
    });
  }

  sync();
  window.addEventListener('load', schedule);
  document.addEventListener('click', () => setTimeout(schedule, 100), true);
  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['class','hidden','aria-hidden','data-tha-v50-hidden']
  });
})();
