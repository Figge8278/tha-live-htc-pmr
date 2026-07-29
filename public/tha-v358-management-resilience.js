(() => {
  const ID = 'tha-v358-management-resilience';
  if (window[ID]) return;
  window[ID] = true;

  function place(selector, hostSelector, method = 'append') {
    const host = document.querySelector(hostSelector);
    if (!host) return;
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) return;
    const preferred = nodes.find(node => host.contains(node)) || nodes[nodes.length - 1];
    if (preferred.parentElement !== host) host[method](preferred);
    nodes.filter(node => node !== preferred).forEach(node => { node.style.display = 'none'; node.dataset.thaV358Duplicate = 'true'; });
  }

  function run() {
    const controls = document.querySelector('.walkthroughControlsPanel');
    controls?.classList.add('thaV358NativeControlSource');
    place('.walkthroughSetupCard', '[data-v358-property-host]');
    place('.localWorkCard', '[data-v358-local-host]');
    place('.intakeImportCard', '[data-v358-existing-host]', 'prepend');
    place('.businessRecordsCard', '[data-v358-records-host]');
    place('.advancedPanel', '[data-v358-advanced-host]');
    place('.localBackupRestore', '[data-v358-records-host]', 'prepend');
    const snapshotHost = document.querySelector('.thaSnapshotInformationSourceHost');
    const snapshotPanel = document.querySelector('.thaSnapshotSourcePanel');
    if (snapshotHost && snapshotPanel && snapshotPanel.parentElement !== snapshotHost) snapshotHost.append(snapshotPanel);
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; run(); });
  }
  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 2500);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
})();