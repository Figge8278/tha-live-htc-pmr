(() => {
  const STYLE_ID = 'tha-v36-workflow-recovery-styles';
  const STRIP_ATTR = 'data-tha-workflow-recovery-strip';
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function setSetupOpenPreference() {
    try { localStorage.setItem(COLLAPSED_KEY, 'false'); } catch { /* field helper only */ }
  }

  function controlsPanel() {
    return document.querySelector('.walkthroughControlsPanel');
  }

  function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 10 && rect.height > 10 && style.display !== 'none' && style.visibility !== 'hidden';
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-workflow-recovery-strip{max-width:1180px;margin:12px auto 0;padding:10px 20px;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:#fffdf7;border:1px solid #e2c57f;border-left:7px solid #bf8420;border-radius:18px;box-shadow:0 8px 20px rgba(64,42,10,.08);color:#173e57}
      .tha-workflow-recovery-strip strong{font-size:14px}.tha-workflow-recovery-strip span{font-size:12px;font-weight:800;color:#5d6f78}
      .tha-workflow-recovery-actions{display:flex;gap:8px;flex-wrap:wrap}.tha-workflow-recovery-actions button{border:1px solid #b7c7d0;border-radius:999px;background:#fff;color:#173e57;padding:8px 11px;font-size:12px;font-weight:950;cursor:pointer}.tha-workflow-recovery-actions button.primary{background:#0b3658;border-color:#0b3658;color:#fff}.tha-workflow-recovery-actions button.drive{background:#f4fbf2;border-color:#9fcf99;color:#285c30}
      .walkthroughControlsPanel.tha-force-setup-open{display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important;margin:14px auto!important}
      .walkthroughControlsPanel.tha-force-setup-open .walkthroughControlsBody{display:grid!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important}
      .walkthroughControlsPanel.tha-force-setup-open .walkthroughControlsHeader{display:flex!important;visibility:visible!important;opacity:1!important}
      @media(max-width:760px){.tha-workflow-recovery-actions button{width:100%;justify-content:center}.tha-workflow-recovery-actions{width:100%}}
      @media print{.tha-workflow-recovery-strip{display:none!important}}
    `;
    document.head.append(style);
  }

  function forceOpenControls({ scroll = false } = {}) {
    setSetupOpenPreference();
    const panel = controlsPanel();
    if (!panel) {
      window.setTimeout(() => window.location.reload(), 80);
      return false;
    }

    const openButton = panel.querySelector('.openControlsButton') || Array.from(panel.querySelectorAll('button')).find(button => /open setup|open controls|open/i.test(textOf(button)));
    if (panel.classList.contains('collapsed') && openButton) openButton.click();

    panel.classList.remove('collapsed');
    panel.classList.add('expanded', 'tha-force-setup-open');
    panel.removeAttribute('hidden');
    panel.style.display = 'block';
    panel.style.visibility = 'visible';
    panel.style.opacity = '1';

    const body = panel.querySelector('.walkthroughControlsBody');
    if (body) {
      body.removeAttribute('hidden');
      body.style.visibility = 'visible';
      body.style.opacity = '1';
    }

    if (scroll) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function clickBusinessRecords() {
    const panel = controlsPanel();
    if (!panel) return forceOpenControls({ scroll: true });
    forceOpenControls({ scroll: true });
    window.setTimeout(() => {
      const records = panel.querySelector('.businessRecordsCard');
      const toggle = records?.querySelector('.tha-records-toggle');
      if (records?.classList.contains('tha-records-collapsed') && toggle) toggle.click();
      (records || panel).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return true;
  }

  function placeStrip() {
    if (document.querySelector(`[${STRIP_ATTR}]`)) return;
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const strip = document.createElement('section');
    strip.className = 'tha-workflow-recovery-strip noPrint';
    strip.setAttribute(STRIP_ATTR, 'true');
    strip.innerHTML = `
      <div><strong>Setup & Drive</strong><br><span>Use this if Walkthrough Setup, Intake, Work Session, or Business Records & Drive disappears.</span></div>
      <div class="tha-workflow-recovery-actions">
        <button type="button" class="primary" data-tha-open-setup>Show setup & records</button>
        <button type="button" class="drive" data-tha-open-drive>Open Business Records & Drive</button>
      </div>`;
    topbar.insertAdjacentElement('afterend', strip);
    strip.querySelector('[data-tha-open-setup]')?.addEventListener('click', () => forceOpenControls({ scroll: true }));
    strip.querySelector('[data-tha-open-drive]')?.addEventListener('click', clickBusinessRecords);
  }

  function run() {
    installStyles();
    placeStrip();
    const panel = controlsPanel();
    if (panel && !isVisible(panel)) forceOpenControls({ scroll: false });
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run();
    });
  }

  setSetupOpenPreference();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  window.addEventListener('storage', schedule);
  window.addEventListener('tha:set-view', schedule);
  window.setInterval(schedule, 3500);
})();