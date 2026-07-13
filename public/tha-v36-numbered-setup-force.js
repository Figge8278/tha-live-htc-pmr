(() => {
  const STYLE_ID = 'tha-v36-numbered-setup-force-styles';
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .walkthroughControlsPanel{display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important;max-width:1180px!important;margin:16px auto!important;padding:0 20px!important}
      .walkthroughControlsPanel .walkthroughControlsHeader{display:flex!important;visibility:visible!important;opacity:1!important}
      .walkthroughControlsPanel .walkthroughControlsBody{display:grid!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{display:grid!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsBody{display:grid!important}
      .walkthroughControlsPanel .workflowCueStrip{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel .walkthroughControlsSummary{display:none!important}
      .walkthroughControlsPanel .homeownerOutputCard{display:none!important}
      .walkthroughControlsPanel .walkthroughControlsBody{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-areas:"setup intakeImport" "workSession businessRecords" "advanced advanced"!important;gap:16px!important;align-items:start!important}
      .walkthroughControlsPanel .walkthroughSetupCard,.walkthroughControlsPanel .tha-walkthrough-setup-card{grid-area:setup!important;display:block!important}
      .walkthroughControlsPanel .intakeImportCard,.walkthroughControlsPanel .homeownerIntakeSectionCard{grid-area:intakeImport!important;display:block!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important;display:block!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important;display:block!important}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important}
      .walkthroughControlsPanel .businessRecordsCard.tha-records-collapsed>:not(.driveSetupHeader){display:none!important}
      .walkthroughControlsPanel .businessRecordsCard:not(.tha-records-collapsed)>*{display:revert!important}
      @media(max-width:900px){.walkthroughControlsPanel .walkthroughControlsBody{grid-template-columns:1fr!important;grid-template-areas:"setup" "intakeImport" "workSession" "businessRecords" "advanced"!important}.walkthroughControlsPanel{padding:0 12px!important}}
      @media print{.walkthroughControlsPanel{display:none!important}}
    `;
    document.head.append(style);
  }

  function safeSetOpen() {
    try { localStorage.setItem(COLLAPSED_KEY, 'false'); } catch { /* field helper only */ }
  }

  function renameHeadings(panel) {
    const headings = Array.from(panel.querySelectorAll('h2,h3'));
    const rename = (patterns, text) => {
      const found = headings.find(h => patterns.some(re => re.test(h.textContent.trim())));
      if (found) found.textContent = text;
    };
    rename([/^Walkthrough Control Panel$/i, /^Walkthrough Setup & Records$/i], 'Walkthrough Setup & Records');
    rename([/^Walkthrough Info$/i, /^Walkthrough Setup$/i, /^1\. Walkthrough Setup$/i], '1. Walkthrough Setup');
    rename([/^Send \/ Import Homeowner Intake$/i, /^Homeowner Intake$/i, /^2\. Homeowner Intake$/i, /^3\. Homeowner Intake$/i], '2. Homeowner Intake');
    rename([/^Local Work \/ This Device$/i, /^1\. Local Work \/ This Device$/i, /^2\. Work Session$/i, /^Work Session$/i, /^3\. Work Session$/i], '3. Work Session');
    rename([/^Drive \/ Business Records$/i, /^3\. Drive \/ Business Records$/i, /^Business Records & Drive$/i, /^4\. Business Records & Drive$/i], '4. Business Records & Drive');
  }

  function forceOpenPanel() {
    safeSetOpen();
    const panel = document.querySelector('.walkthroughControlsPanel');
    if (!panel) return;

    const topbar = document.querySelector('.topbar');
    if (topbar && panel.previousElementSibling !== topbar) topbar.insertAdjacentElement('afterend', panel);

    const openButton = panel.querySelector('.openControlsButton') || Array.from(panel.querySelectorAll('button')).find(button => /open setup|open controls|open/i.test(button.textContent || ''));
    if (panel.classList.contains('collapsed') && openButton) openButton.click();

    panel.classList.remove('collapsed');
    panel.classList.add('expanded');
    panel.removeAttribute('hidden');
    panel.style.display = 'block';
    panel.style.visibility = 'visible';
    panel.style.opacity = '1';

    const cueStrip = panel.querySelector('.workflowCueStrip');
    if (cueStrip) {
      cueStrip.setAttribute('hidden', 'true');
      cueStrip.style.display = 'none';
    }

    const body = panel.querySelector('.walkthroughControlsBody');
    if (body) {
      body.removeAttribute('hidden');
      body.style.display = 'grid';
      body.style.visibility = 'visible';
      body.style.opacity = '1';
    }

    renameHeadings(panel);
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      installStyles();
      forceOpenPanel();
    });
  }

  safeSetOpen();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  window.setInterval(schedule, 2500);
})();