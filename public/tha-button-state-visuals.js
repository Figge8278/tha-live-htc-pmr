(() => {
  const STYLE_ID = 'tha-button-state-visuals-styles';
  const WIRED_ATTR = 'data-tha-button-state-visual';

  function normalizedText(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Open / Close buttons: blue ring language anywhere those controls appear. */
      button.tha-open-close-control,
      .tha-open-close-control button{position:relative!important;display:inline-flex!important;align-items:center!important;gap:7px!important;border-color:#9fc7ff!important;color:#155799!important;background:#f5f9ff!important;font-weight:950!important;box-shadow:0 1px 0 rgba(21,87,153,.08)!important}
      button.tha-open-close-control::before,
      .tha-open-close-control button::before{content:"";display:inline-block!important;width:14px!important;height:14px!important;min-width:14px!important;border-radius:999px!important;border:2px solid #2f80ed!important;background:#fff!important;box-sizing:border-box!important;box-shadow:0 0 0 2px rgba(47,128,237,.10)!important}
      button.tha-open-close-control.tha-close-control,
      .tha-open-close-control.tha-close-control button{background:#eef6ff!important;border-color:#2f80ed!important;color:#0f4c92!important}
      button.tha-open-close-control.tha-close-control::before,
      .tha-open-close-control.tha-close-control button::before{border-width:2px!important;box-shadow:0 0 0 2px #fff,0 0 0 4px #2f80ed!important;background:#fafdff!important}
      button.tha-open-close-control:focus-visible{outline:3px solid rgba(47,128,237,.28)!important;outline-offset:2px!important}

      /* Business records / Drive state: configured = needs connection/check, connected = blue. */
      .tha-drive-config-state{display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:999px!important;font-weight:950!important;letter-spacing:.01em!important}
      .tha-drive-config-state.tha-config-pending{border:1px solid #f59e0b!important;background:#fff7ed!important;color:#9a4b00!important;box-shadow:inset 4px 0 0 #f59e0b,0 0 0 2px rgba(245,158,11,.12)!important}
      .tha-drive-config-state.tha-config-connected{border:1px solid #2f80ed!important;background:#eef6ff!important;color:#0f4c92!important;box-shadow:inset 4px 0 0 #2f80ed,0 0 0 2px rgba(47,128,237,.12)!important}

      /* Save package action: green outline before save, solid green once saved. */
      button.tha-save-package-action{border:1px solid #35a852!important;background:#f4fbf1!important;color:#176b2c!important;font-weight:950!important;box-shadow:inset 4px 0 0 rgba(53,168,82,.55),0 0 0 2px rgba(53,168,82,.10)!important}
      button.tha-save-package-action::before{content:"✓";display:inline-flex!important;align-items:center!important;justify-content:center!important;width:16px!important;height:16px!important;min-width:16px!important;border-radius:999px!important;border:1px solid #35a852!important;background:#fff!important;color:#35a852!important;font-size:11px!important;font-weight:950!important;margin-right:6px!important}
      button.tha-save-package-action.tha-save-complete{background:#35a852!important;border-color:#2d8f46!important;color:#fff!important;box-shadow:0 8px 18px rgba(53,168,82,.20)!important}
      button.tha-save-package-action.tha-save-complete::before{background:#fff!important;color:#2d8f46!important;border-color:#fff!important}
    `;
    document.head.append(style);
  }

  function isButtonLike(element) {
    if (!element) return false;
    const tag = element.tagName?.toLowerCase();
    return tag === 'button' || element.getAttribute?.('role') === 'button';
  }

  function markOpenClose(element) {
    const text = normalizedText(element).toLowerCase();
    if (!isButtonLike(element)) return;
    if (text === 'open' || text.startsWith('open ') || text.includes(' open ')) {
      element.classList.add('tha-open-close-control', 'tha-open-control');
      element.classList.remove('tha-close-control');
    }
    if (text === 'close' || text.startsWith('close ') || text.includes(' close ')) {
      element.classList.add('tha-open-close-control', 'tha-close-control');
      element.classList.remove('tha-open-control');
    }
  }

  function connectedContext(element) {
    const context = normalizedText(element.closest?.('section, article, div, main') || element).toLowerCase();
    const negative = /not connected|needs connection|connect drive|connect google|not yet connected|disconnected/.test(context);
    const positive = /connected|authorized|synced|saved|folder linked|drive ready|ready/.test(context);
    return positive && !negative;
  }

  function markConfigured(element) {
    const text = normalizedText(element).toLowerCase();
    if (!text || !/configured|connected|business records|drive/.test(text)) return;

    const exactConfig = text === 'configured' || text.includes('configured');
    const exactConnected = text === 'connected' || /drive connected|google drive connected|records connected|folder connected|ready/.test(text);
    if (!exactConfig && !exactConnected) return;

    element.classList.add('tha-drive-config-state');
    if (exactConnected || connectedContext(element)) {
      element.classList.add('tha-config-connected');
      element.classList.remove('tha-config-pending');
    } else {
      element.classList.add('tha-config-pending');
      element.classList.remove('tha-config-connected');
    }
  }

  function markSavePackage(button) {
    if (!isButtonLike(button)) return;
    const text = normalizedText(button);
    const lower = text.toLowerCase();
    const looksLikeDriveSave = /(save|saved).*(drive|package|pmr)|drive.*(save|saved)|package.*(drive|save|saved)/.test(lower);
    if (!looksLikeDriveSave) return;

    button.classList.add('tha-save-package-action');
    if (/save drive package to drive/i.test(text) || /save package to drive/i.test(text)) {
      button.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /save/i.test(node.textContent || '')) node.textContent = ' Save PMR Package';
      });
      if (normalizedText(button).toLowerCase().includes('save drive package to drive')) button.textContent = 'Save PMR Package';
    }

    const context = normalizedText(button.closest?.('section, article, div, main') || button).toLowerCase();
    const complete = /saved|complete|synced|uploaded|in drive/.test(lower) || /saved to drive|package saved|drive save complete|uploaded to drive/.test(context);
    button.classList.toggle('tha-save-complete', complete);
  }

  function enhance(root = document) {
    installStyles();
    root.querySelectorAll?.('button, [role="button"]').forEach(button => {
      markOpenClose(button);
      markSavePackage(button);
      button.setAttribute(WIRED_ATTR, 'true');
    });
    root.querySelectorAll?.('button, span, strong, em, small, p, div').forEach(element => {
      const text = normalizedText(element);
      if (/configured|connected/i.test(text)) markConfigured(element);
    });
  }

  function scheduleEnhance() {
    window.requestAnimationFrame(() => {
      enhance();
      window.setTimeout(enhance, 80);
      window.setTimeout(enhance, 300);
    });
  }

  function start() {
    enhance();
    const observer = new MutationObserver(scheduleEnhance);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'style', 'disabled'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(enhance, 120));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
