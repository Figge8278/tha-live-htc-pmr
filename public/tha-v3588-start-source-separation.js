(() => {
  const ID = 'tha-v3588-start-source-separation';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      /* Start Blank is identity/setup only. Drive and business-record controls belong
         exclusively to Use Existing Information. */
      .thaV358PathWorkspace[data-kind="blank"] .businessRecordsCard,
      .thaV358PathWorkspace[data-kind="blank"] .driveStatus,
      .thaV358PathWorkspace[data-kind="blank"] .intakeImportCard,
      .thaV358PathWorkspace[data-kind="blank"] .thaSnapshotSourcePanel,
      .thaV358PathWorkspace[data-kind="blank"] .localBackupRestore,
      .thaV358PathWorkspace[data-kind="blank"] .advancedPanel {
        display:none!important;
      }

      .thaV358PathWorkspace[data-kind="blank"] .walkthroughSetupCard {
        display:grid!important;
        width:100%!important;
        gap:10px!important;
      }

      .thaV358PathWorkspace[data-kind="local"] .businessRecordsCard,
      .thaV358PathWorkspace[data-kind="local"] .driveStatus,
      .thaV358PathWorkspace[data-kind="local"] .intakeImportCard,
      .thaV358PathWorkspace[data-kind="local"] .thaSnapshotSourcePanel,
      .thaV358PathWorkspace[data-kind="local"] .walkthroughSetupCard {
        display:none!important;
      }

      .thaV358ExistingChoices {
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
      }
      .thaV358ExistingChoices[hidden] { display:none!important; }
      .thaV358ExistingChoices [data-v3583-source="drive"] { order:0; }
      .thaV358ExistingChoices [data-v3583-source="snapshot"] { order:1; }
      .thaV358ExistingChoices [data-v3583-source="intake"] { order:2; }

      .thaV3588ExistingLead {
        display:none;
        margin:0;
        border:1px solid #d7e3e9;
        border-radius:12px;
        background:#f5f9fb;
        color:#49616f;
        padding:10px 12px;
        font-size:11px;
        font-weight:800;
        line-height:1.4;
      }
      .thaV358PathWorkspace[data-kind="existing"] .thaV3588ExistingLead { display:block; }

      .thaV358PathWorkspace[data-kind="blank"] .thaV358PathHost,
      .thaV358PathWorkspace[data-kind="local"] .thaV358PathHost,
      .thaV358PathWorkspace[data-kind="existing"] .thaV358PathHost {
        min-width:0!important;
      }

      @media(max-width:700px) {
        .thaV358ExistingChoices { display:grid!important; grid-template-columns:1fr!important; }
        .thaV358ExistingChoices[hidden] { display:none!important; }
      }
    `;
    document.head.append(style);
  }

  function ensureExistingLead(workspace) {
    const body = workspace?.querySelector('.thaV358PathWorkspaceBody');
    const choices = body?.querySelector('.thaV358ExistingChoices');
    if (!body || !choices) return null;
    let lead = body.querySelector('.thaV3588ExistingLead');
    if (!lead) {
      lead = document.createElement('p');
      lead.className = 'thaV3588ExistingLead';
      choices.after(lead);
    }
    return lead;
  }

  function updateStartCards(page) {
    const blank = page.querySelector('.thaV358Path.blank');
    const local = page.querySelector('.thaV358Path.local');
    const existing = page.querySelector('.thaV358Path.existing');

    if (blank) {
      const title = blank.querySelector('h3');
      const copy = blank.querySelector('p');
      const button = blank.querySelector('button');
      if (title) title.textContent = 'Start Blank';
      if (copy) copy.textContent = 'Create a new Snapshot';
      if (button) button.textContent = 'Set up new Snapshot';
    }

    if (local) {
      const title = local.querySelector('h3');
      const copy = local.querySelector('p');
      const button = local.querySelector('button');
      if (title) title.textContent = 'Continue on This Device';
      if (copy) copy.textContent = 'Saved walkthroughs only';
      if (button) button.textContent = 'Choose saved walkthrough';
    }

    if (existing) {
      const title = existing.querySelector('h3');
      const copy = existing.querySelector('p');
      const button = existing.querySelector('button');
      if (title) title.textContent = 'Use Existing Information';
      if (copy) copy.textContent = 'Drive, prior Snapshot, or homeowner intake';
      if (button) button.textContent = 'Open sources';
    }
  }

  function updateWorkspace(page) {
    const workspace = page.querySelector('.thaV358PathWorkspace');
    if (!workspace) return;
    const kind = workspace.dataset.kind || '';
    const subkind = workspace.dataset.subkind || '';
    const title = workspace.querySelector('[data-v3583-workspace-title]');
    const copy = workspace.querySelector('[data-v3583-workspace-copy]');
    const lead = ensureExistingLead(workspace);

    const intake = workspace.querySelector('[data-v3583-source="intake"]');
    const snapshot = workspace.querySelector('[data-v3583-source="snapshot"]');
    const drive = workspace.querySelector('[data-v3583-source="drive"]');
    if (drive) drive.textContent = 'Connect / Open Google Drive';
    if (snapshot) snapshot.textContent = 'Upload Prior Snapshot';
    if (intake) intake.textContent = 'Upload Homeowner Intake';

    if (kind === 'blank') {
      if (title) title.textContent = 'New Snapshot setup';
      if (copy) copy.textContent = 'Enter only the working session name, client name, project address, and walkthrough date.';
    } else if (kind === 'local') {
      if (title) title.textContent = 'Continue on this device';
      if (copy) copy.textContent = 'Choose one walkthrough saved in this browser on this device.';
      const meta = workspace.querySelector('.thaV358LocalMeta');
      if (meta) meta.textContent = 'Only walkthroughs saved on this browser/device appear here.';
    } else if (kind === 'existing') {
      if (title) title.textContent = 'Use existing information';
      if (copy) copy.textContent = 'Connect Google Drive or load a prior source record to repopulate a working Snapshot.';
      if (lead) {
        if (subkind === 'drive') {
          lead.textContent = 'Connect or open Google Drive to reach the property records used for a current or future-year Snapshot.';
        } else if (subkind === 'snapshot') {
          lead.textContent = 'Locate the prior Snapshot in Google Drive, then upload that Snapshot file here to repopulate the working record.';
        } else if (subkind === 'intake') {
          lead.textContent = 'Connect Google Drive, then upload the completed Homeowner Intake to populate the working Snapshot with homeowner-provided context.';
        } else {
          lead.textContent = 'These source records repopulate a working Snapshot so the property can be continued now, next year, or in a later year.';
        }
      }
      const snapshotHeading = workspace.querySelector('.snapshotSourceHeading h4');
      if (snapshotHeading) snapshotHeading.textContent = 'Prior Snapshot File';
    }
  }

  function run() {
    installStyles();
    const page = document.querySelector('.thaV358StartPage');
    if (!page) return;
    updateStartCards(page);
    updateWorkspace(page);
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      run();
    });
  }

  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 2200);
  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['class','hidden','data-kind','data-subkind']
  });
})();