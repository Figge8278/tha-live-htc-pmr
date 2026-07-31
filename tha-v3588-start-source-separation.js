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
      /* Keep the complete THA logo visible in the primary application header. */
      .topbar .brand .thaLogo.full {
        display:block!important;
        visibility:visible!important;
        opacity:1!important;
        width:auto!important;
        height:64px!important;
        max-width:280px!important;
        object-fit:contain!important;
      }

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

      /* Intake goes directly from its title to one slim import shortcut and Quick Intake. */
      .intakePage > .intakeStatusSummary { display:none!important; }
      .thaV3588IntakeUploadBar {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin:10px 0 12px;
        padding:8px 10px 8px 13px;
        border:1px solid #c9dce8;
        border-left:5px solid #2b78ad;
        border-radius:13px;
        background:#f3f8fb;
        color:#174d70;
        box-shadow:0 4px 12px rgba(13,54,88,.05);
      }
      .thaV3588IntakeUploadBarText { min-width:0; }
      .thaV3588IntakeUploadBar strong { display:block; font-size:12px; }
      .thaV3588IntakeUploadBar small {
        display:block;
        margin-top:2px;
        color:#647782;
        font-size:9px;
        font-weight:750;
        line-height:1.25;
      }
      .thaV3588IntakeUploadButton {
        flex:0 0 auto;
        justify-content:center!important;
        border:1px solid #174d70!important;
        border-radius:10px!important;
        background:#174d70!important;
        color:#fff!important;
        padding:8px 11px!important;
        font-size:10px!important;
        white-space:nowrap;
      }

      @media(max-width:700px) {
        .thaV358ExistingChoices { display:grid!important; grid-template-columns:1fr!important; }
        .thaV358ExistingChoices[hidden] { display:none!important; }
        .topbar .brand .thaLogo.full { height:52px!important; max-width:220px!important; }
        .thaV3588IntakeUploadBar { align-items:stretch; flex-direction:column; }
        .thaV3588IntakeUploadButton { width:100%; }
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
      if (title && title.textContent !== 'Start Blank') title.textContent = 'Start Blank';
      if (copy && copy.textContent !== 'Create a new Snapshot') copy.textContent = 'Create a new Snapshot';
      if (button && button.textContent !== 'Set up new Snapshot') button.textContent = 'Set up new Snapshot';
    }

    if (local) {
      const title = local.querySelector('h3');
      const copy = local.querySelector('p');
      const button = local.querySelector('button');
      if (title && title.textContent !== 'Continue on This Device') title.textContent = 'Continue on This Device';
      if (copy && copy.textContent !== 'Saved walkthroughs only') copy.textContent = 'Saved walkthroughs only';
      if (button && button.textContent !== 'Choose saved walkthrough') button.textContent = 'Choose saved walkthrough';
    }

    if (existing) {
      const title = existing.querySelector('h3');
      const copy = existing.querySelector('p');
      const button = existing.querySelector('button');
      if (title && title.textContent !== 'Use Existing Information') title.textContent = 'Use Existing Information';
      if (copy && copy.textContent !== 'Drive, prior Snapshot, or homeowner intake') copy.textContent = 'Drive, prior Snapshot, or homeowner intake';
      if (button && button.textContent !== 'Open sources') button.textContent = 'Open sources';
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
    if (drive && drive.textContent !== 'Connect / Open Google Drive') drive.textContent = 'Connect / Open Google Drive';
    if (snapshot && snapshot.textContent !== 'Upload Prior Snapshot') snapshot.textContent = 'Upload Prior Snapshot';
    if (intake && intake.textContent !== 'Upload Homeowner Intake') intake.textContent = 'Upload Homeowner Intake';

    if (kind === 'blank') {
      if (title && title.textContent !== 'New Snapshot setup') title.textContent = 'New Snapshot setup';
      if (copy && copy.textContent !== 'Enter only the working session name, client name, project address, and walkthrough date.') copy.textContent = 'Enter only the working session name, client name, project address, and walkthrough date.';
    } else if (kind === 'local') {
      if (title && title.textContent !== 'Continue on this device') title.textContent = 'Continue on this device';
      if (copy && copy.textContent !== 'Choose one walkthrough saved in this browser on this device.') copy.textContent = 'Choose one walkthrough saved in this browser on this device.';
      const meta = workspace.querySelector('.thaV358LocalMeta');
      if (meta && meta.textContent !== 'Only walkthroughs saved on this browser/device appear here.') meta.textContent = 'Only walkthroughs saved on this browser/device appear here.';
    } else if (kind === 'existing') {
      if (title && title.textContent !== 'Use existing information') title.textContent = 'Use existing information';
      if (copy && copy.textContent !== 'Connect Google Drive or load a prior source record to repopulate a working Snapshot.') copy.textContent = 'Connect Google Drive or load a prior source record to repopulate a working Snapshot.';
      if (lead) {
        const leadCopy = subkind === 'drive'
          ? 'Connect or open Google Drive to reach the property records used for a current or future-year Snapshot.'
          : subkind === 'snapshot'
            ? 'Locate the prior Snapshot in Google Drive, then upload that Snapshot file here to repopulate the working record.'
            : subkind === 'intake'
              ? 'Connect Google Drive, then upload the completed Homeowner Intake to populate the working Snapshot with homeowner-provided context.'
              : 'These source records repopulate a working Snapshot so the property can be continued now, next year, or in a later year.';
        if (lead.textContent !== leadCopy) lead.textContent = leadCopy;
      }
      const snapshotHeading = workspace.querySelector('.snapshotSourceHeading h4');
      if (snapshotHeading && snapshotHeading.textContent !== 'Prior Snapshot File') snapshotHeading.textContent = 'Prior Snapshot File';
    }
  }

  function openStartIntakeReview() {
    document.querySelector('.thaV358StartNav')?.click();
    window.setTimeout(() => document.querySelector('[data-v3583-path="existing"]')?.click(), 70);
    window.setTimeout(() => document.querySelector('[data-v3583-source="intake"]')?.click(), 150);
  }

  function chooseNativeIntakeFile() {
    const input = document.querySelector('.intakeImportCard .primaryTxtUpload input[type="file"], .intakeImportCard input[type="file"][accept*="text/plain"]');
    if (!input) {
      openStartIntakeReview();
      return;
    }

    let changed = false;
    const cleanup = () => {
      input.removeEventListener('change', handleChange);
      window.removeEventListener('focus', handleFocus);
    };
    const handleChange = () => {
      changed = true;
      cleanup();
      window.setTimeout(openStartIntakeReview, 100);
    };
    const handleFocus = () => {
      window.setTimeout(() => {
        if (!changed) cleanup();
      }, 250);
    };

    input.addEventListener('change', handleChange, { once:true });
    window.addEventListener('focus', handleFocus, { once:true });
    input.click();
  }

  function ensureIntakeUploadBar() {
    const page = document.querySelector('main.intakePage');
    if (!page) return;
    const header = page.querySelector(':scope > .pmrHeader');
    const quickIntake = page.querySelector(':scope > .homeownerLane');
    if (!header || !quickIntake) return;

    let bar = page.querySelector(':scope > .thaV3588IntakeUploadBar');
    if (!bar) {
      bar = document.createElement('section');
      bar.className = 'thaV3588IntakeUploadBar noPrint';
      bar.setAttribute('aria-label', 'Intake Upload');
      bar.innerHTML = `<div class="thaV3588IntakeUploadBarText"><strong>Intake Upload</strong><small>Same import workflow as Start. Select the completed homeowner intake, then review and apply the mapped answers.</small></div><button type="button" class="thaV3588IntakeUploadButton">Upload Homeowner Intake</button>`;
      quickIntake.before(bar);
      bar.querySelector('button')?.addEventListener('click', chooseNativeIntakeFile);
    } else if (bar.nextElementSibling !== quickIntake) {
      quickIntake.before(bar);
    }
  }

  function run() {
    installStyles();
    const page = document.querySelector('.thaV358StartPage');
    if (page) {
      updateStartCards(page);
      updateWorkspace(page);
    }
    ensureIntakeUploadBar();
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
  document.addEventListener('click', event => {
    if (event.target.closest('.topbar nav button,.thaV358StartNav')) setTimeout(schedule, 0);
  }, true);
  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['class','hidden','data-kind','data-subkind']
  });
})();