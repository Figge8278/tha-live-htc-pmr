(() => {
  const SCRIPT_ID = 'tha-v3575-setup-order-and-proportions';
  const STYLE_ID = 'tha-v3575-setup-order-and-proportions-styles';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.57.5 hotfix: force procedural 1-2-3-4 setup order and balanced landscape quadrants. */
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        grid-template-areas:
          "setup workSession"
          "intakeImport businessRecords"
          "advanced advanced"!important;
        grid-template-rows:repeat(2,minmax(360px,1fr)) auto!important;
        align-items:stretch!important;
        gap:16px!important;
      }
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.walkthroughSetupCard,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.tha-walkthrough-setup-card{
        grid-area:setup!important;
      }
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.localWorkCard{
        grid-area:workSession!important;
      }
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.intakeImportCard,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.tha-import-in-controls{
        grid-area:intakeImport!important;
      }
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.businessRecordsCard{
        grid-area:businessRecords!important;
      }
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.advancedPanel{
        grid-area:advanced!important;
      }
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.walkthroughSetupCard,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.tha-walkthrough-setup-card,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.localWorkCard,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.intakeImportCard,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.tha-import-in-controls,
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.businessRecordsCard{
        box-sizing:border-box!important;
        width:auto!important;
        min-width:0!important;
        min-height:360px!important;
        height:100%!important;
        align-self:stretch!important;
        margin:0!important;
      }
      body .walkthroughControlsPanel.expanded .intakeImportCard>.homeownerImportDetails{
        flex:1 1 auto!important;
        min-height:0!important;
      }
      @media(max-width:900px){
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody{
          grid-template-columns:1fr!important;
          grid-template-areas:
            "setup"
            "workSession"
            "intakeImport"
            "businessRecords"
            "advanced"!important;
          grid-template-rows:none!important;
          grid-auto-rows:auto!important;
          align-items:start!important;
        }
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.walkthroughSetupCard,
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.tha-walkthrough-setup-card,
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.localWorkCard,
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.intakeImportCard,
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.tha-import-in-controls,
        body .walkthroughControlsPanel.expanded .walkthroughControlsBody>.businessRecordsCard{
          min-height:0!important;
          height:auto!important;
        }
      }
    `;
    document.head.append(style);
  }

  function setHeading(card, label) {
    if (!card) return;
    const heading = card.querySelector(':scope > .controlGroupTitle h3, :scope > .driveSetupHeader h3, h3');
    if (heading && heading.textContent.trim() !== label) heading.textContent = label;
  }

  function enforceOrder() {
    installStyles();
    document.querySelectorAll('.walkthroughControlsPanel').forEach(panel => {
      const body = panel.querySelector('.walkthroughControlsBody');
      if (!body) return;
      const setup = body.querySelector('.walkthroughSetupCard,.tha-walkthrough-setup-card');
      const work = body.querySelector('.localWorkCard');
      const intake = body.querySelector('.intakeImportCard,.tha-import-in-controls');
      const records = body.querySelector('.businessRecordsCard');
      const advanced = body.querySelector('.advancedPanel');

      if (setup) setup.classList.add('tha-walkthrough-setup-card');
      if (intake) intake.classList.add('tha-import-in-controls');

      setHeading(setup, '1. Walkthrough Setup');
      setHeading(work, '2. Work Session');
      setHeading(intake, '3. Homeowner Intake');
      setHeading(records, '4. Business Records & Drive');

      const ordered = [setup, work, intake, records].filter(Boolean);
      ordered.forEach(card => body.insertBefore(card, advanced || null));
      body.dataset.thaSetupOrder = ordered.length === 4 ? '1-2-3-4' : 'incomplete';
    });
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enforceOrder();
    });
  }

  function start() {
    enforceOrder();
    setTimeout(enforceOrder, 250);
    setTimeout(enforceOrder, 900);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
