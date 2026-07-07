(() => {
  function installStyles() {
    if (document.getElementById('tha-workflow-order-swap-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-workflow-order-swap-styles';
    style.textContent = `
      .walkthroughControlsPanel .walkthroughControlsBody{grid-template-areas:"setup workSession" "intakeImport businessRecords" "advanced advanced"!important}
      @media(max-width:900px){
        .walkthroughControlsPanel .walkthroughControlsBody{grid-template-areas:"setup" "workSession" "intakeImport" "businessRecords" "advanced"!important}
      }
    `;
    document.head.append(style);
  }

  function relabel() {
    document.querySelectorAll('.walkthroughControlsPanel').forEach(panel => {
      panel.querySelectorAll('.localWorkCard h3').forEach(heading => {
        heading.textContent = '2. Work Session';
      });
      panel.querySelectorAll('.intakeImportCard.tha-import-in-controls .intakeImportHeader h2').forEach(heading => {
        heading.textContent = 'Import a Completed Intake';
      });
    });
  }

  function run() {
    installStyles();
    relabel();
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
