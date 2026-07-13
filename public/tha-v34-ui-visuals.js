(() => {
  const STYLE_ID = 'tha-v34-ui-visuals-styles';
  const MARK_ATTR = 'data-tha-v34-ui-visual';

  const APP_CONTROL_SELECTOR = [
    '#root button',
    'main button',
    '#root .tha-quick-action',
    'main .tha-quick-action',
    '#root [role="button"]',
    'main [role="button"]'
  ].join(',');

  const DRIVE_CONTEXT_RE = /(walkthrough setup|business records|drive|google drive|records and drive|save pmr package|save drive package)/i;
  const CONNECTED_RE = /(connected|linked|ready|authorized|synced|saved|complete|success)/i;

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function textLower(element) {
    return textOf(element).toLowerCase();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.4 consolidated visual layer: open/close rings, Drive states, and intake gold outlines. */
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
      #root .tha-quick-action.tha-open-close-ring,
      main .tha-quick-action.tha-open-close-ring{
        border-radius:10px!important;
        padding:6px 9px!important;
      }

      .tha-drive-configured-pending{display:inline-flex!important;align-items:center!important;gap:6px!important;border:2px solid #f28c28!important;background:#fff3e6!important;color:#a94f00!important;border-radius:999px!important;padding:5px 10px!important;font-weight:950!important;box-shadow:0 0 0 3px rgba(242,140,40,.13)!important}
      .tha-drive-configured-ready{display:inline-flex!important;align-items:center!important;gap:6px!important;border:2px solid #2f80ed!important;background:#eef6ff!important;color:#0f4c92!important;border-radius:999px!important;padding:5px 10px!important;font-weight:950!important;box-shadow:0 0 0 3px rgba(47,128,237,.12)!important}
      .tha-drive-configured-pending::before,.tha-drive-configured-ready::before{content:"";width:9px;height:9px;border-radius:999px;display:inline-block;flex:0 0 auto}
      .tha-drive-configured-pending::before{background:#f28c28!important;box-shadow:0 0 0 3px rgba(242,140,40,.18)!important}
      .tha-drive-configured-ready::before{background:#2f80ed!important;box-shadow:0 0 0 3px rgba(47,128,237,.18)!important}
      button.tha-drive-save-pending{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;border:2px solid #52aa4b!important;background:#f7fff4!important;color:#285c30!important;border-radius:999px!important;font-weight:950!important;box-shadow:0 0 0 3px rgba(82,170,75,.12)!important}
      button.tha-drive-save-complete{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;border:2px solid #357a38!important;background:#52aa4b!important;color:#fff!important;border-radius:999px!important;font-weight:950!important;box-shadow:0 6px 14px rgba(82,170,75,.24)!important}
      button.tha-drive-save-pending::before,button.tha-drive-save-complete::before{content:"";width:11px;height:11px;border-radius:999px;display:inline-block;flex:0 0 auto;border:2px solid currentColor;box-sizing:border-box}
      button.tha-drive-save-complete::before{background:#fff!important;border-color:#fff!important;box-shadow:inset 0 0 0 3px #52aa4b!important}

      .homeownerLane .tha-quick-card,
      .intakeLane .intakeSubsection{
        border-color:#e0b84d!important;
        box-shadow:0 0 0 2px rgba(224,184,77,.22),0 8px 18px rgba(23,62,87,.06)!important;
      }
      .homeownerLane .tha-quick-card:hover,
      .intakeLane .intakeSubsection:hover{
        border-color:#c99516!important;
        box-shadow:0 0 0 2px rgba(201,149,22,.30),0 10px 20px rgba(23,62,87,.08)!important;
      }
      .homeownerLane .tha-quick-card .tha-quick-header,
      .intakeLane .intakeSubsection>h3{
        border-bottom-color:rgba(224,184,77,.28)!important;
      }

      /* Walkthrough Setup & Records order: 1 Setup, 2 Homeowner Intake, 3 Work Session, 4 Records. */
      .walkthroughControlsPanel .walkthroughControlsBody{
        grid-template-areas:"setup intakeImport" "workSession businessRecords" "advanced advanced"!important;
      }

      @media(max-width:900px){
        .walkthroughControlsPanel .walkthroughControlsBody{
          grid-template-areas:"setup" "intakeImport" "workSession" "businessRecords" "advanced"!important;
        }
      }

      @media(max-width:720px){
        #root .tha-open-close-ring,
        main .tha-open-close-ring{box-shadow:0 0 0 1.5px rgba(47,128,237,.18),0 1px 0 rgba(21,87,153,.08)!important}
        #root .tha-open-close-ring.tha-close-state,
        main .tha-open-close-ring.tha-close-state{box-shadow:0 0 0 1.5px rgba(47,128,237,.30),0 0 0 4px rgba(47,128,237,.13),0 1px 0 rgba(21,87,153,.10)!important}
      }
      @media print{
        .homeownerLane .tha-quick-card,
        .intakeLane .intakeSubsection{box-shadow:none!important;border-color:#d8c07a!important}
      }
    `;
    document.head.append(style);
  }

  function isSafeOpenCloseTarget(element) {
    if (!element || !element.isConnected) return false;
    if (element.matches?.('.tha-quick-header')) return false;
    if (element.closest?.('.navTabs,.viewTabs,.homeNav,.landingPage')) return false;
    if (element.matches?.('button,.tha-quick-action')) return true;
    if (element.getAttribute?.('role') === 'button') {
      const text = textLower(element);
      const isShortControl = text.length <= 36;
      const hasExplicitControlClass = element.matches('.collapseToggle,.tha-import-toggle,.tha-clean-prep-toggle,.roomOverviewToggle,.overviewToggle,.detailsToggle');
      return isShortControl || hasExplicitControlClass;
    }
    return false;
  }

  function classifyOpenClose(control) {
    if (!isSafeOpenCloseTarget(control)) return;
    const text = textLower(control);
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
      if (control.getAttribute(MARK_ATTR) === 'open-close') {
        control.removeAttribute(MARK_ATTR);
        control.classList.remove('tha-open-close-ring', 'tha-open-state', 'tha-close-state');
      }
      return;
    }
    control.setAttribute(MARK_ATTR, 'open-close');
    control.classList.add('tha-open-close-ring');
    control.classList.toggle('tha-open-state', isOpenAction && !isCloseAction);
    control.classList.toggle('tha-close-state', isCloseAction);
  }

  function isDriveContext(element) {
    const root = element.closest?.('section, article, details, .pmrBlock, .frontSummary, .setupPanel, .drivePanel, .recordPanel, main') || element.parentElement;
    return DRIVE_CONTEXT_RE.test(textOf(root));
  }

  function resetConfiguredClasses(element) {
    element.classList.remove('tha-drive-configured-pending', 'tha-drive-configured-ready');
  }

  function resetSaveClasses(element) {
    element.classList.remove('tha-drive-save-pending', 'tha-drive-save-complete');
  }

  function markConfigured(element) {
    if (!element || element.getAttribute(MARK_ATTR) === 'skip') return;
    const text = textOf(element);
    if (!/\bconfigured\b/i.test(text)) return;
    if (!isDriveContext(element)) return;
    const localContext = element.closest?.('section, article, details, .pmrBlock, .setupPanel, .drivePanel, .recordPanel, div') || element;
    const connected = CONNECTED_RE.test(textOf(localContext).replace(text, '')) || /\b(connected|ready|linked|saved)\b/i.test(text);
    resetConfiguredClasses(element);
    element.classList.add(connected ? 'tha-drive-configured-ready' : 'tha-drive-configured-pending');
    element.setAttribute(MARK_ATTR, connected ? 'configured-ready' : 'configured-pending');
  }

  function simplifySaveButton(button) {
    if (!button || button.getAttribute(MARK_ATTR) === 'skip') return;
    const text = textOf(button);
    const lower = text.toLowerCase();
    const isDriveSave = lower.includes('save drive package') || lower.includes('save pmr package') || (lower.includes('save') && lower.includes('drive') && lower.includes('package'));
    if (!isDriveSave || !isDriveContext(button)) return;

    if (/save drive package to drive/i.test(text) || /save drive package/i.test(text)) {
      Array.from(button.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /save/i.test(node.textContent || '')) node.textContent = 'Save PMR Package';
      });
      if (textOf(button).toLowerCase().includes('save drive package')) button.textContent = 'Save PMR Package';
    }

    const contextText = textOf(button.closest?.('section, article, details, .pmrBlock, .setupPanel, .drivePanel, .recordPanel, div') || button);
    const complete = /\b(saved|complete|success|uploaded|drive saved)\b/i.test(contextText) || /\b(saved|complete)\b/i.test(text);
    resetSaveClasses(button);
    button.classList.add(complete ? 'tha-drive-save-complete' : 'tha-drive-save-pending');
    button.setAttribute(MARK_ATTR, complete ? 'save-complete' : 'save-pending');
  }

  function setHeading(element, label) {
    if (element && textOf(element) !== label) element.textContent = label;
  }

  function applySetupRecordsOrder(root = document) {
    root.querySelectorAll?.('.walkthroughControlsPanel').forEach(panel => {
      setHeading(panel.querySelector('.tha-walkthrough-setup-card h3, .sessionCard:not(.localWorkCard):not(.intakeImportLaunchCard) h3'), '1. Walkthrough Setup');
      setHeading(panel.querySelector('.intakeImportCard.tha-import-in-controls .intakeImportHeader h2, .intakeImportPanel .intakeImportHeader h2'), '2. Homeowner Intake');
      setHeading(panel.querySelector('.localWorkCard .controlGroupTitle h3, .localWorkCard h3'), '3. Work Session');
      setHeading(panel.querySelector('.businessRecordsCard .driveSetupHeader h3, .businessRecordsCard h3'), '4. Business Records & Drive');
    });
  }

  function applyVisuals(root = document) {
    installStyles();
    applySetupRecordsOrder(root);
    root.querySelectorAll?.(APP_CONTROL_SELECTOR).forEach(classifyOpenClose);
    root.querySelectorAll?.('button').forEach(simplifySaveButton);
    root.querySelectorAll?.('span, small, strong, em, b, p, div, button').forEach(element => {
      const text = textOf(element);
      if (text.length <= 80 && /\bconfigured\b/i.test(text)) markConfigured(element);
    });
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyVisuals(document);
      window.setTimeout(() => applyVisuals(document), 140);
    });
  }

  function start() {
    applyVisuals(document);
    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-expanded', 'style'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(() => applyVisuals(document), 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();