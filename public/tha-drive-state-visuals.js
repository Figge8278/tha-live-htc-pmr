(() => {
  const STYLE_ID = 'tha-drive-state-visuals-styles';
  const DRIVE_ATTR = 'data-tha-drive-state-visual';

  const DRIVE_CONTEXT_RE = /(walkthrough setup|business records|drive|google drive|records and drive|save pmr package|save drive package)/i;
  const CONNECTED_RE = /(connected|linked|ready|authorized|synced|saved|complete|success)/i;

  function normalizedText(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Scoped Drive/setup state visuals only. Avoid landing-page/nav buttons. */
      .tha-drive-configured-pending{display:inline-flex!important;align-items:center!important;gap:6px!important;border:2px solid #f28c28!important;background:#fff3e6!important;color:#a94f00!important;border-radius:999px!important;padding:5px 10px!important;font-weight:950!important;box-shadow:0 0 0 3px rgba(242,140,40,.13)!important}
      .tha-drive-configured-ready{display:inline-flex!important;align-items:center!important;gap:6px!important;border:2px solid #2f80ed!important;background:#eef6ff!important;color:#0f4c92!important;border-radius:999px!important;padding:5px 10px!important;font-weight:950!important;box-shadow:0 0 0 3px rgba(47,128,237,.12)!important}
      .tha-drive-configured-pending::before,.tha-drive-configured-ready::before{content:"";width:9px;height:9px;border-radius:999px;display:inline-block;flex:0 0 auto}
      .tha-drive-configured-pending::before{background:#f28c28!important;box-shadow:0 0 0 3px rgba(242,140,40,.18)!important}
      .tha-drive-configured-ready::before{background:#2f80ed!important;box-shadow:0 0 0 3px rgba(47,128,237,.18)!important}

      button.tha-drive-save-pending{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;border:2px solid #52aa4b!important;background:#f7fff4!important;color:#285c30!important;border-radius:999px!important;font-weight:950!important;box-shadow:0 0 0 3px rgba(82,170,75,.12)!important}
      button.tha-drive-save-complete{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;border:2px solid #357a38!important;background:#52aa4b!important;color:#fff!important;border-radius:999px!important;font-weight:950!important;box-shadow:0 6px 14px rgba(82,170,75,.24)!important}
      button.tha-drive-save-pending::before,button.tha-drive-save-complete::before{content:"";width:11px;height:11px;border-radius:999px;display:inline-block;flex:0 0 auto;border:2px solid currentColor;box-sizing:border-box}
      button.tha-drive-save-complete::before{background:#fff!important;border-color:#fff!important;box-shadow:inset 0 0 0 3px #52aa4b!important}
    `;
    document.head.append(style);
  }

  function isDriveContext(element) {
    const root = element.closest?.('section, article, details, .pmrBlock, .frontSummary, .setupPanel, .drivePanel, .recordPanel, main') || element.parentElement;
    return DRIVE_CONTEXT_RE.test(normalizedText(root));
  }

  function resetConfiguredClasses(element) {
    element.classList.remove('tha-drive-configured-pending', 'tha-drive-configured-ready');
  }

  function resetSaveClasses(element) {
    element.classList.remove('tha-drive-save-pending', 'tha-drive-save-complete');
  }

  function markConfigured(element) {
    if (!element || element.getAttribute(DRIVE_ATTR) === 'skip') return;
    const text = normalizedText(element);
    if (!/^configured\b/i.test(text) && !/\bconfigured\b/i.test(text)) return;
    if (!isDriveContext(element)) return;

    const localContext = element.closest?.('section, article, details, .pmrBlock, .setupPanel, .drivePanel, .recordPanel, div') || element;
    const connected = CONNECTED_RE.test(normalizedText(localContext).replace(text, '')) || /\b(connected|ready|linked|saved)\b/i.test(text);
    resetConfiguredClasses(element);
    element.classList.add(connected ? 'tha-drive-configured-ready' : 'tha-drive-configured-pending');
    element.setAttribute(DRIVE_ATTR, connected ? 'configured-ready' : 'configured-pending');
  }

  function simplifySaveButton(button) {
    if (!button || button.getAttribute(DRIVE_ATTR) === 'skip') return;
    const text = normalizedText(button);
    const lower = text.toLowerCase();
    const isDriveSave = lower.includes('save drive package') || lower.includes('save pmr package') || (lower.includes('save') && lower.includes('drive') && lower.includes('package'));
    if (!isDriveSave) return;
    if (!isDriveContext(button)) return;

    if (/save drive package to drive/i.test(text) || /save drive package/i.test(text)) {
      Array.from(button.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /save/i.test(node.textContent || '')) {
          node.textContent = 'Save PMR Package';
        }
      });
      if (normalizedText(button).toLowerCase().includes('save drive package')) button.textContent = 'Save PMR Package';
    }

    const contextText = normalizedText(button.closest?.('section, article, details, .pmrBlock, .setupPanel, .drivePanel, .recordPanel, div') || button);
    const complete = /\b(saved|complete|success|uploaded|drive saved)\b/i.test(contextText) || /\b(saved|complete)\b/i.test(text);
    resetSaveClasses(button);
    button.classList.add(complete ? 'tha-drive-save-complete' : 'tha-drive-save-pending');
    button.setAttribute(DRIVE_ATTR, complete ? 'save-complete' : 'save-pending');
  }

  function applyDriveStateVisuals(root = document) {
    root.querySelectorAll?.('button').forEach(simplifySaveButton);
    root.querySelectorAll?.('span, small, strong, em, b, p, div, button').forEach(element => {
      const text = normalizedText(element);
      if (text.length > 80) return;
      if (/\bconfigured\b/i.test(text)) markConfigured(element);
    });
  }

  function scheduleApply() {
    window.requestAnimationFrame(() => {
      applyDriveStateVisuals(document);
      window.setTimeout(() => applyDriveStateVisuals(document), 120);
    });
  }

  function start() {
    installStyles();
    applyDriveStateVisuals(document);
    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('tha:set-view', () => window.setTimeout(() => applyDriveStateVisuals(document), 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
