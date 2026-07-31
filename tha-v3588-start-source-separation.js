(() => {
  const ID = 'tha-v3588-start-source-separation';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };

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

      /* Drive is the gate for both remote source imports. Orange means connection
         is still required; blue means the source buttons are available. */
      .thaV358ExistingChoices [data-v3583-source="drive"].thaV3588DriveNeeded {
        background:#e97919!important;
        border-color:#bd5d0d!important;
        color:#fff!important;
        box-shadow:0 5px 13px rgba(233,121,25,.2)!important;
      }
      .thaV358ExistingChoices [data-v3583-source="drive"].thaV3588DriveReady {
        background:#287bb7!important;
        border-color:#1f648f!important;
        color:#fff!important;
        box-shadow:0 5px 13px rgba(40,123,183,.18)!important;
      }
      .thaV358ExistingChoices button:disabled {
        cursor:not-allowed!important;
        background:#eef1f3!important;
        border-color:#d5dce0!important;
        color:#8a969d!important;
        box-shadow:none!important;
        opacity:.68!important;
      }

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

      /* Demo access exists only inside Continue on This Device. The former native
         Advanced/Drive demo card remains mounted for its React handlers but is hidden. */
      .demoScenarioCard { display:none!important; }
      .thaV3588DemoPanel {
        display:none;
        margin-top:2px;
        border:1px solid #d5e0e6;
        border-radius:14px;
        background:#f7fafc;
        overflow:hidden;
      }
      .thaV358PathWorkspace[data-kind="local"] .thaV3588DemoPanel { display:block; }
      .thaV3588DemoHeader {
        padding:10px 12px 8px;
        border-bottom:1px solid #dce6eb;
        background:#eef5f8;
      }
      .thaV3588DemoHeader strong { display:block; color:#174d70; font-size:12px; }
      .thaV3588DemoHeader small { display:block; margin-top:2px; color:#627681; font-size:9px; font-weight:750; }
      .thaV3588DemoGrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; padding:10px; }
      .thaV3588DemoButton {
        display:grid!important;
        justify-items:start!important;
        align-content:start!important;
        gap:3px!important;
        min-height:70px;
        width:100%;
        padding:10px!important;
        border:1px solid #c8dae5!important;
        border-radius:11px!important;
        background:#fff!important;
        color:#174d70!important;
        text-align:left!important;
      }
      .thaV3588DemoButton:hover,.thaV3588DemoButton:focus-visible { border-color:#287bb7!important; background:#f1f8fc!important; }
      .thaV3588DemoButton strong { font-size:10px; line-height:1.25; }
      .thaV3588DemoButton small { color:#687984; font-size:8px; line-height:1.3; font-weight:700; }

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

      @media(max-width:900px) {
        .thaV3588DemoGrid { grid-template-columns:1fr!important; }
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

  function driveConnected() {
    const nativeCard = document.querySelector('.businessRecordsCard');
    if (nativeCard?.querySelector('.drivePill.connected')) return true;
    const meta = object(read('tha-drive-meta', {}));
    return Boolean(meta.hasConnected && !meta.lastError);
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
      if (copy && copy.textContent !== 'Saved walkthroughs and demos') copy.textContent = 'Saved walkthroughs and demos';
      if (button && button.textContent !== 'Choose Saved Walkthrough') button.textContent = 'Choose Saved Walkthrough';
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

  function originalDemoArticles() {
    return Array.from(document.querySelectorAll('.demoScenarioCard .demoScenario'));
  }

  function leaveStartForPmr() {
    localStorage.setItem('tha-v358-start-active', 'false');
    window.setTimeout(() => {
      const pmrButton = Array.from(document.querySelectorAll('.topbar nav button')).find(button => /^PMR$/i.test(text(button.textContent)));
      pmrButton?.click();
      window.scrollTo({ top:0, behavior:'smooth' });
    }, 80);
  }

  function activateDemo(title) {
    const article = originalDemoArticles().find(item => text(item.querySelector('h4')?.textContent) === title);
    const button = article?.querySelector('button');
    if (!button) return;
    button.click();
    leaveStartForPmr();
  }

  function ensureDemoPanel(workspace) {
    const body = workspace?.querySelector('.thaV358PathWorkspaceBody');
    if (!body) return;
    const demos = originalDemoArticles().map(article => ({
      title: text(article.querySelector('h4')?.textContent),
      description: text(article.querySelector('p')?.textContent)
    })).filter(item => item.title);
    if (!demos.length) return;

    let panel = body.querySelector('.thaV3588DemoPanel');
    const signature = demos.map(item => item.title).join('|');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'thaV3588DemoPanel';
      panel.setAttribute('aria-label', 'Demo Walkthroughs');
      body.append(panel);
    }
    if (panel.dataset.signature === signature) return;

    panel.dataset.signature = signature;
    panel.innerHTML = `<div class="thaV3588DemoHeader"><strong>Demo Walkthroughs</strong><small>Load prefilled test data to review the completed forms, PASS selections, THA actions, and PMR output.</small></div><div class="thaV3588DemoGrid"></div>`;
    const grid = panel.querySelector('.thaV3588DemoGrid');
    demos.forEach(demo => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'thaV3588DemoButton';
      button.innerHTML = `<strong>${demo.title.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}</strong><small>${demo.description.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}</small>`;
      button.addEventListener('click', () => activateDemo(demo.title));
      grid.append(button);
    });
  }

  function updateDriveGate(workspace, { intake, snapshot, drive, lead, subkind }) {
    if (!workspace || workspace.dataset.kind !== 'existing') return;
    const connected = driveConnected();
    if (drive) {
      drive.classList.toggle('thaV3588DriveNeeded', !connected);
      drive.classList.toggle('thaV3588DriveReady', connected);
      drive.setAttribute('aria-label', connected ? 'Google Drive connected — open Drive' : 'Connect Google Drive');
    }
    [snapshot, intake].forEach(button => {
      if (!button) return;
      button.disabled = !connected;
      button.setAttribute('aria-disabled', connected ? 'false' : 'true');
      button.title = connected ? '' : 'Connect Google Drive first';
    });
    if (lead && !connected && subkind !== 'drive') {
      lead.textContent = 'Connect Google Drive first. Prior Snapshot and Homeowner Intake uploads become available after Drive is connected.';
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
      if (copy && copy.textContent !== 'Choose a saved walkthrough or load a prefilled demo walkthrough.') copy.textContent = 'Choose a saved walkthrough or load a prefilled demo walkthrough.';
      const meta = workspace.querySelector('.thaV358LocalMeta');
      if (meta && meta.textContent !== 'Saved walkthroughs and demos stay on this browser/device.') meta.textContent = 'Saved walkthroughs and demos stay on this browser/device.';
      ensureDemoPanel(workspace);
    } else if (kind === 'existing') {
      if (title && title.textContent !== 'Use existing information') title.textContent = 'Use existing information';
      if (copy && copy.textContent !== 'Connect Drive first, then load a prior source record into the working Snapshot.') copy.textContent = 'Connect Drive first, then load a prior source record into the working Snapshot.';
      if (lead) {
        const connected = driveConnected();
        const leadCopy = !connected
          ? 'Connect Google Drive first. Prior Snapshot and Homeowner Intake uploads become available after Drive is connected.'
          : subkind === 'drive'
            ? 'Google Drive is connected. Open Drive or choose one of the available upload sources.'
            : subkind === 'snapshot'
              ? 'Locate the prior Snapshot in Google Drive, then upload that Snapshot file here to repopulate the working record.'
              : subkind === 'intake'
                ? 'Upload the completed Homeowner Intake to populate the working Snapshot with homeowner-provided context.'
                : 'Drive is connected. Choose a prior Snapshot or Homeowner Intake to repopulate a working Snapshot now or in a future year.';
        if (lead.textContent !== leadCopy) lead.textContent = leadCopy;
      }
      const snapshotHeading = workspace.querySelector('.snapshotSourceHeading h4');
      if (snapshotHeading && snapshotHeading.textContent !== 'Prior Snapshot File') snapshotHeading.textContent = 'Prior Snapshot File';
    }

    updateDriveGate(workspace, { intake, snapshot, drive, lead, subkind });
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
    if (event.target.closest('.topbar nav button,.thaV358StartNav,.thaV358ExistingChoices button')) setTimeout(schedule, 0);
  }, true);
  window.addEventListener('storage', event => {
    if (event.key === 'tha-drive-meta') schedule();
  });
  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['class','hidden','data-kind','data-subkind']
  });
})();