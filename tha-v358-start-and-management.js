(() => {
  const ID = 'tha-v358-start-and-management';
  const START_KEY = 'tha-v358-start-active';
  const SESSION_KEY = 'tha-walkthrough-sessions';
  const CURRENT_KEY = 'tha-current-walkthrough-id';
  const DRIVE_META_KEY = 'tha-drive-meta';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const list = value => Array.isArray(value) ? value : [];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const dateLabel = value => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }) : '';
  };

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaV358StartPage{display:none;max-width:1220px;margin:0 auto;padding:18px 20px 34px;background:#f5f1e9}
      .app.thaV358StartActive>.thaV358StartPage{display:block!important}
      .app.thaV358StartActive>*:not(.topbar):not(.thaV358StartPage){display:none!important}
      .app:not(.thaV358StartActive)>.thaV358StartPage{display:none!important}
      .thaV358StartShell{display:grid;gap:15px}
      .thaV358Hero{display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid #d9d0bf;border-radius:24px;background:linear-gradient(135deg,#fff,#f8efe0);padding:20px 22px;box-shadow:0 10px 28px rgba(31,50,39,.07)}
      .thaV358Hero h1{margin:0;color:#153f2c;font-size:32px;line-height:1}.thaV358Hero p{margin:7px 0 0;color:#617068;font-size:13px}.thaV358HeroBadge{border:1px solid #d5b365;border-radius:999px;background:#fff9ed;color:#745415;padding:7px 11px;font-size:10px;font-weight:950;white-space:nowrap}
      .thaV358PropertyCard{display:grid;grid-template-columns:minmax(0,1fr) minmax(310px,.72fr);gap:16px;align-items:stretch;border-radius:22px;background:linear-gradient(135deg,#173f2c,#285d40);padding:18px 20px;color:#fff;box-shadow:0 12px 28px rgba(23,63,44,.18)}
      .thaV358PropertyCard h2{margin:0;color:#fff;font-size:24px}.thaV358PropertyCard p{margin:5px 0 0;color:#dfe9df;font-size:12px}.thaV358Meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px}.thaV358Meta span{border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.08);padding:5px 8px;font-size:9px;font-weight:850}
      .thaV358Traffic{display:grid;grid-template-columns:repeat(3,1fr);overflow:hidden;border-radius:16px;min-height:94px}.thaV358Traffic div{display:grid;place-items:center;align-content:center;gap:2px;color:#fff;text-align:center}.thaV358Traffic strong{font-size:26px;line-height:1}.thaV358Traffic span{font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}.thaV358TrafficNow{background:#b6412b}.thaV358TrafficSoon{background:#d6a62f}.thaV358TrafficMonitor{background:#538b43}
      .thaV358Begin{border:1px solid #d8ddd5;border-radius:22px;background:#fff;padding:17px;box-shadow:0 8px 22px rgba(31,50,39,.05)}.thaV358BeginHeader{display:flex;justify-content:space-between;gap:14px;align-items:end;margin-bottom:12px}.thaV358BeginHeader h2{margin:0;color:#173f2c;font-size:20px}.thaV358BeginHeader p{margin:3px 0 0;color:#69756e;font-size:11px}.thaV358StepCue{color:#8b6a22;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}
      .thaV358Paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.thaV358Path{position:relative;display:grid;align-content:start;gap:9px;min-height:205px;border:1px solid #dbe1dc;border-radius:18px;background:#fff;padding:15px;overflow:hidden}.thaV358Path::before{content:'';position:absolute;inset:0 auto 0 0;width:7px}.thaV358Path.blank::before{background:#bf8420}.thaV358Path.local::before{background:#0b3658}.thaV358Path.existing::before{background:#2b78ad}.thaV358PathIcon{display:grid;place-items:center;width:39px;height:39px;border-radius:13px;font-size:20px}.blank .thaV358PathIcon{background:#fff4db;color:#8b6117}.local .thaV358PathIcon{background:#eaf1f6;color:#0b3658}.existing .thaV358PathIcon{background:#eaf5fc;color:#245f8a}.thaV358Path h3{margin:0;color:#173f2c;font-size:16px}.thaV358Path p{margin:0;color:#68746d;font-size:10px;line-height:1.42}.thaV358Path button{justify-content:center;width:100%;margin-top:auto}.thaV358Path select{width:100%;min-width:0}.thaV358SourceButtons{display:grid;grid-template-columns:1fr;gap:6px;margin-top:2px}.thaV358SourceButtons button{margin:0;background:#f1f6f9;color:#174d70;border:1px solid #c9dce8}
      .thaV358Management{border:1px solid #ccd8cf;border-radius:19px;background:#fff;overflow:hidden}.thaV358Management>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;padding:14px 16px;background:#eef5ef;color:#173f2c;font-weight:950;list-style:none}.thaV358Management>summary::-webkit-details-marker{display:none}.thaV358Management>summary small{display:block;margin-top:2px;color:#68746d;font-size:9px;font-weight:750}.thaV358Management[open]>summary{border-bottom:1px solid #d8e1da}.thaV358ManagementBody{display:grid;gap:10px;padding:12px;background:#f8faf8}
      .thaV358ManagerSection{border:1px solid #dce3dd;border-radius:16px;background:#fff;overflow:hidden}.thaV358ManagerSection>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;padding:12px 14px;color:#173f2c;font-size:13px;font-weight:950;list-style:none}.thaV358ManagerSection>summary::-webkit-details-marker{display:none}.thaV358ManagerSection>summary span:last-child{color:#718078}.thaV358ManagerSection[open]>summary{border-bottom:1px solid #e1e7e2;background:#fbfcfb}.thaV358ManagerHost{display:grid;gap:10px;padding:12px}
      .thaV358ManagementBody .controlGroup,.thaV358ManagementBody .sessionCard,.thaV358ManagementBody .clientCard,.thaV358ManagementBody .driveStatus,.thaV358ManagementBody .intakeImportCard,.thaV358ManagementBody .businessRecordsCard{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important;min-width:0!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;align-items:stretch!important}
      .thaV358ManagementBody .walkthroughSetupCard label,.thaV358ManagementBody .walkthroughSetupCard input,.thaV358ManagementBody label,.thaV358ManagementBody input:not([type=checkbox]):not([type=radio]):not([type=file]),.thaV358ManagementBody select,.thaV358ManagementBody textarea,.thaV358ManagementBody details,.thaV358ManagementBody section,.thaV358ManagementBody article,.thaV358ManagementBody [class*=Grid],.thaV358ManagementBody [class*=grid]{width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important}
      .thaV358ManagementBody .walkthroughSetupCard{gap:11px!important}.thaV358ManagementBody .walkthroughSetupCard>.controlGroupTitle{display:none!important}.thaV358ManagementBody .walkthroughSetupCard label{display:grid!important;grid-template-columns:1fr!important;gap:5px!important}.thaV358ManagementBody .requiredSetupField small{margin:0!important}
      .thaV358ManagementBody .clientIntakeTwoColumnWorkflow,.thaV358ManagementBody .driveSetupGrid,.thaV358ManagementBody .drivePrimaryGrid,.thaV358ManagementBody .driveStatusGrid,.thaV358ManagementBody .driveActionGrid,.thaV358ManagementBody .sessionGrid,.thaV358ManagementBody .previewMetaGrid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
      .thaV358ManagementBody .controlGroupTitle,.thaV358ManagementBody .driveSetupHeader{margin:0 0 8px!important;padding:0 0 8px!important}.thaV358ManagementBody .controlGroupTitle h3,.thaV358ManagementBody .driveSetupHeader h3{font-size:15px!important}.thaV358ManagementBody .controlGroupTitle p,.thaV358ManagementBody .driveActionHelp,.thaV358ManagementBody .sectionHelperText{display:none!important}
      .thaV358ManagementBody .walkthroughActions,.thaV358ManagementBody .manualSaveGroup{display:none!important}.thaV358ManagementBody .localBackupRestore{margin:0!important}.thaV358ManagementBody .homeownerOutputCard{display:none!important}.thaV358ManagementBody .advancedPanel{margin:0!important}
      .thaV358ManagementBody .businessRecordsCard .driveBrowserStatus span:last-child,.thaV358ManagementBody .businessRecordsCard .originCard{display:none!important}.thaV358ManagementBody .businessRecordsCard .driveSetupActions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}.thaV358ManagementBody .businessRecordsCard .driveSetupActions>*{flex:1 1 180px;justify-content:center}
      .walkthroughControlsPanel.thaV358NativeControlSource{display:none!important}
      .thaV358CompactBar{display:none;grid-template-columns:minmax(0,1fr) auto auto auto;gap:8px;align-items:center;margin:8px 20px;border:1px solid #d8e1da;border-radius:13px;background:#fff;padding:7px 10px;box-shadow:0 4px 12px rgba(31,50,39,.05)}.app:not(.thaV358StartActive)>.thaV358CompactBar{display:grid}.thaV358CompactIdentity{min-width:0}.thaV358CompactIdentity strong,.thaV358CompactIdentity span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.thaV358CompactIdentity strong{color:#173f2c;font-size:11px}.thaV358CompactIdentity span{color:#6b7770;font-size:9px}.thaV358CompactPill{border:1px solid #dce4de;border-radius:999px;background:#f7faf7;color:#506057;padding:5px 8px;font-size:9px;font-weight:900;white-space:nowrap}.thaV358CompactPill.saved{border-color:#b9d9ad;background:#f0f8ed;color:#285c30}.thaV358CompactPill.attention{border-color:#e5be65;background:#fff7df;color:#765713}.thaV358CompactStart{border-radius:999px!important;padding:6px 10px!important;font-size:9px!important;white-space:nowrap}
      .formPanel .roomOverviewCard{box-shadow:0 12px 28px rgba(13,44,73,.09);border-width:2px!important}.formPanel .roomOverviewEyebrow{color:#8a6218!important}.formPanel .thaV358SupportingHeading{margin:0;color:#0b3658;font-size:18px}.formPanel .checklistToolbar{display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:12px!important;border:1px solid #d8e1e6!important;border-radius:16px!important;background:#f7fafb!important;padding:12px 14px!important}.formPanel .checklistToolbar>div:first-child{display:grid;gap:3px}.formPanel .checklistToolbar .lede{margin:0!important;font-size:11px!important}.formPanel .checklistItemCard{box-shadow:none!important;border-radius:17px!important}.formPanel .checklistSummaryRow{background:#fff!important}
      @media(max-width:900px){.thaV358PropertyCard{grid-template-columns:1fr}.thaV358Paths{grid-template-columns:1fr}.thaV358Path{min-height:0}.thaV358CompactBar{grid-template-columns:minmax(0,1fr) auto}.thaV358CompactPill{display:none}.thaV358Hero{align-items:flex-start;flex-direction:column}.thaV358BeginHeader{align-items:flex-start;flex-direction:column}}
      @media(max-width:650px){.thaV358StartPage{padding:10px}.thaV358PropertyCard,.thaV358Hero{padding:15px}.thaV358Hero h1{font-size:27px}.thaV358CompactBar{margin:6px 8px}}
      @media print{.thaV358StartPage,.thaV358CompactBar{display:none!important}}
    `;
    document.head.append(style);
  }

  function sessionMap() { return object(read(SESSION_KEY, {})); }
  function activeSession() {
    const sessions = sessionMap();
    const id = localStorage.getItem(CURRENT_KEY) || '';
    return id && sessions[id]?.data ? sessions[id] : Object.values(sessions).filter(item => item?.data).sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }
  function recentSessions() { return Object.values(sessionMap()).filter(item => item?.data).sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))); }
  function traffic(data = {}) {
    const answers = Object.values(object(data.answers));
    return {
      now: answers.filter(item => text(item?.status) === 'Immediate Concern').length,
      soon: answers.filter(item => text(item?.status) === 'Needs Attention').length,
      monitor: answers.filter(item => text(item?.status) === 'Monitor').length
    };
  }
  function driveState() {
    const meta = object(read(DRIVE_META_KEY, {}));
    if (meta.lastSaved) return { label:`Drive saved ${meta.lastSaved}`, tone:'saved' };
    if (meta.hasConnected) return { label:'Drive connected', tone:'saved' };
    if (meta.lastError) return { label:'Drive needs attention', tone:'attention' };
    return { label:'Drive not connected', tone:'attention' };
  }
  function nativeSelect(select, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(select, value); else select.value = value;
    select.dispatchEvent(new Event('input', { bubbles:true }));
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }
  function nativeButton(pattern, root = document) { return Array.from(root.querySelectorAll('button')).find(button => pattern.test(text(button.textContent))); }
  function nativeLocalSelect() { return Array.from(document.querySelectorAll('select')).find(select => /saved local sessions/i.test(text(select.closest('label')?.textContent))); }
  function clickNav(pattern) {
    setStart(false);
    const button = Array.from(document.querySelectorAll('.topbar nav button')).find(item => pattern.test(text(item.textContent)));
    button?.click();
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 60);
  }
  function openManager(sectionId) {
    const manager = document.querySelector('.thaV358Management');
    const section = document.getElementById(sectionId);
    if (manager) manager.open = true;
    if (section) section.open = true;
    setTimeout(() => section?.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
  }
  function startBlank() {
    nativeButton(/new blank local walkthrough/i)?.click();
    localStorage.setItem(START_KEY, 'true');
    setTimeout(() => { openManager('tha-v358-property'); document.querySelector('.walkthroughSetupCard input')?.focus(); }, 120);
  }
  function continueLocal() {
    const chooser = document.querySelector('[data-v358-local-select]');
    const id = chooser?.value || '';
    if (!id) return;
    const native = nativeLocalSelect();
    if (native) nativeSelect(native, id);
    setTimeout(() => clickNav(/HTC/i), 120);
  }
  function useHomeownerIntake() {
    openManager('tha-v358-existing');
    setTimeout(() => { const details = document.querySelector('.homeownerImportDetails'); if (details) details.open = true; details?.scrollIntoView({ behavior:'smooth', block:'center' }); }, 90);
  }
  function usePriorSnapshot() {
    openManager('tha-v358-existing');
    setTimeout(() => document.querySelector('.snapshotSourceImport input[type=file]')?.click(), 120);
  }
  function useDrive() {
    openManager('tha-v358-records');
    setTimeout(() => {
      const records = document.querySelector('.businessRecordsCard');
      const link = records?.querySelector('a.driveFolderLink');
      if (link) link.click(); else nativeButton(/connect google drive/i, records || document)?.click();
    }, 100);
  }
  function setStart(active) {
    localStorage.setItem(START_KEY, active ? 'true' : 'false');
    schedule();
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 40);
  }

  function ensureStructure() {
    installStyles();
    const app = document.querySelector('.app');
    const topbar = app?.querySelector(':scope > .topbar');
    const nav = topbar?.querySelector('nav');
    if (!app || !topbar || !nav) return null;

    let startButton = nav.querySelector('.thaV358StartNav');
    if (!startButton) {
      startButton = document.createElement('button');
      startButton.type = 'button';
      startButton.className = 'thaV358StartNav';
      startButton.innerHTML = '⌂ Start';
      startButton.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); setStart(true); });
      nav.prepend(startButton);
    }
    Array.from(nav.querySelectorAll('button')).filter(button => button !== startButton).forEach(button => {
      if (button.dataset.thaV358Bound) return;
      button.dataset.thaV358Bound = 'true';
      button.addEventListener('click', () => setStart(false), true);
    });

    let page = app.querySelector(':scope > .thaV358StartPage');
    if (!page) {
      page = document.createElement('main');
      page.className = 'thaV358StartPage noPrint';
      page.innerHTML = `<div class="thaV358StartShell">
        <section class="thaV358Hero"><div><h1>Choose how to begin</h1><p>Start fresh, continue local work, or bring existing property information forward.</p></div><span class="thaV358HeroBadge">THA Snapshot</span></section>
        <section class="thaV358PropertyCard"><div><h2 data-v358-address>Property not selected</h2><p data-v358-client>Client and visit information will appear here.</p><div class="thaV358Meta"><span data-v358-session>No active work session</span><span data-v358-autosave>Not yet autosaved</span><span data-v358-drive>Drive not connected</span></div></div><div class="thaV358Traffic" aria-label="Priority at a glance"><div class="thaV358TrafficNow"><strong data-v358-now>0</strong><span>Now</span></div><div class="thaV358TrafficSoon"><strong data-v358-soon>0</strong><span>Soon</span></div><div class="thaV358TrafficMonitor"><strong data-v358-monitor>0</strong><span>Monitor</span></div></div></section>
        <section class="thaV358Begin"><header class="thaV358BeginHeader"><div><h2>Choose your next path</h2><p>One of these three paths starts or resumes the working Snapshot.</p></div><span class="thaV358StepCue">Next step</span></header><div class="thaV358Paths">
          <article class="thaV358Path blank"><span class="thaV358PathIcon">＋</span><h3>Start a Blank Snapshot</h3><p>Begin a new property or visit with a clean working record.</p><button type="button" data-v358-start-blank>Start Blank</button></article>
          <article class="thaV358Path local"><span class="thaV358PathIcon">↻</span><h3>Continue on This Device</h3><p>Resume a walkthrough already autosaved in this browser.</p><select data-v358-local-select aria-label="Choose local walkthrough"><option value="">Choose local walkthrough</option></select><button type="button" data-v358-continue-local disabled>Continue</button></article>
          <article class="thaV358Path existing"><span class="thaV358PathIcon">⇩</span><h3>Start With Existing Information</h3><p>Use a homeowner Intake or a prior THA Snapshot as the starting source.</p><div class="thaV358SourceButtons"><button type="button" data-v358-intake>Homeowner Intake</button><button type="button" data-v358-snapshot>Prior Snapshot</button><button type="button" data-v358-drive>Google Drive</button></div></article>
        </div></section>
        <details class="thaV358Management"><summary><div><strong>Snapshot Setup & Records</strong><small>Property, local sessions, information sources, Drive, and backup tools.</small></div><span>⌄</span></summary><div class="thaV358ManagementBody">
          <details class="thaV358ManagerSection" id="tha-v358-property"><summary><span>Property & Visit</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-property-host></div></details>
          <details class="thaV358ManagerSection" id="tha-v358-local"><summary><span>Local Sessions</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-local-host></div></details>
          <details class="thaV358ManagerSection" id="tha-v358-existing"><summary><span>Existing Information</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-existing-host><div class="thaSnapshotInformationSourceHost"></div></div></details>
          <details class="thaV358ManagerSection" id="tha-v358-records"><summary><span>Save & Records</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-records-host></div></details>
          <details class="thaV358ManagerSection" id="tha-v358-advanced"><summary><span>Advanced & Troubleshooting</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-advanced-host></div></details>
        </div></details>
      </div>`;
      topbar.after(page);
      page.querySelector('[data-v358-start-blank]')?.addEventListener('click', startBlank);
      page.querySelector('[data-v358-continue-local]')?.addEventListener('click', continueLocal);
      page.querySelector('[data-v358-local-select]')?.addEventListener('change', event => { page.querySelector('[data-v358-continue-local]').disabled = !event.target.value; });
      page.querySelector('[data-v358-intake]')?.addEventListener('click', useHomeownerIntake);
      page.querySelector('[data-v358-snapshot]')?.addEventListener('click', usePriorSnapshot);
      page.querySelector('[data-v358-drive]')?.addEventListener('click', useDrive);
    }

    let compact = app.querySelector(':scope > .thaV358CompactBar');
    if (!compact) {
      compact = document.createElement('section');
      compact.className = 'thaV358CompactBar noPrint';
      compact.innerHTML = `<div class="thaV358CompactIdentity"><strong data-v358-compact-address>No active property</strong><span data-v358-compact-client>Client pending · Visit pending</span></div><span class="thaV358CompactPill saved" data-v358-compact-autosave>Autosave ready</span><span class="thaV358CompactPill attention" data-v358-compact-drive>Drive not connected</span><button type="button" class="thaV358CompactStart">Start / Details</button>`;
      page.after(compact);
      compact.querySelector('.thaV358CompactStart')?.addEventListener('click', () => setStart(true));
    }
    return { app, nav, startButton, page, compact };
  }

  function moveControls(page) {
    const controls = document.querySelector('.walkthroughControlsPanel');
    if (!controls) return;
    controls.classList.add('thaV358NativeControlSource');
    const propertyHost = page.querySelector('[data-v358-property-host]');
    const localHost = page.querySelector('[data-v358-local-host]');
    const existingHost = page.querySelector('[data-v358-existing-host]');
    const recordsHost = page.querySelector('[data-v358-records-host]');
    const advancedHost = page.querySelector('[data-v358-advanced-host]');
    const setup = controls.querySelector('.walkthroughSetupCard');
    const local = controls.querySelector('.localWorkCard');
    const intake = controls.querySelector('.intakeImportCard');
    const records = controls.querySelector('.businessRecordsCard');
    const advanced = controls.querySelector('.advancedPanel');
    const backup = local?.querySelector('.localBackupRestore');
    if (setup && setup.parentElement !== propertyHost) propertyHost?.append(setup);
    if (local && local.parentElement !== localHost) localHost?.append(local);
    if (intake && intake.parentElement !== existingHost) existingHost?.prepend(intake);
    if (records && records.parentElement !== recordsHost) recordsHost?.append(records);
    if (backup && backup.parentElement !== recordsHost) recordsHost?.prepend(backup);
    if (advanced && advanced.parentElement !== advancedHost) advancedHost?.append(advanced);
    document.querySelectorAll('.homeownerOutputCard').forEach(card => card.style.display = 'none');
  }

  function updatePage(context) {
    const { app, nav, startButton, page, compact } = context;
    const startPreference = localStorage.getItem(START_KEY);
    const startActive = startPreference === null ? true : startPreference === 'true';
    app.classList.toggle('thaV358StartActive', startActive);
    startButton.classList.toggle('on', startActive);
    if (startActive) Array.from(nav.querySelectorAll('button')).filter(button => button !== startButton).forEach(button => button.classList.remove('on'));

    const session = activeSession();
    const data = object(session?.data);
    const client = object(data.client);
    const counts = traffic(data);
    const drive = driveState();
    const address = text(client.address) || 'Property not selected';
    const clientLine = [text(client.name) || 'Client pending', text(client.date) || 'Visit pending'].join(' · ');
    const sessionName = text(data.walkthroughName || session?.name) || 'No active work session';
    page.querySelector('[data-v358-address]').textContent = address;
    page.querySelector('[data-v358-client]').textContent = clientLine;
    page.querySelector('[data-v358-session]').textContent = sessionName;
    page.querySelector('[data-v358-autosave]').textContent = session?.updatedAt ? `Autosaved ${dateLabel(session.updatedAt)}` : 'Not yet autosaved';
    page.querySelector('[data-v358-drive]').textContent = drive.label;
    page.querySelector('[data-v358-now]').textContent = counts.now;
    page.querySelector('[data-v358-soon]').textContent = counts.soon;
    page.querySelector('[data-v358-monitor]').textContent = counts.monitor;

    const chooser = page.querySelector('[data-v358-local-select]');
    const currentValue = chooser.value;
    const sessions = recentSessions();
    const optionHtml = `<option value="">Choose local walkthrough</option>${sessions.map(item => { const c = object(item.data?.client); const title = text(c.address) || text(c.name) || text(item.name) || 'Untitled walkthrough'; return `<option value="${esc(item.id)}">${esc(title)}${item.updatedAt ? ` · ${esc(dateLabel(item.updatedAt))}` : ''}</option>`; }).join('')}`;
    if (chooser.dataset.options !== optionHtml) { chooser.innerHTML = optionHtml; chooser.dataset.options = optionHtml; if (sessions.some(item => item.id === currentValue)) chooser.value = currentValue; }
    const continueButton = page.querySelector('[data-v358-continue-local]');
    continueButton.disabled = !chooser.value;

    compact.querySelector('[data-v358-compact-address]').textContent = address;
    compact.querySelector('[data-v358-compact-client]').textContent = clientLine;
    compact.querySelector('[data-v358-compact-autosave]').textContent = session ? 'Autosaved ✓' : 'No active session';
    const compactDrive = compact.querySelector('[data-v358-compact-drive]');
    compactDrive.textContent = drive.label;
    compactDrive.className = `thaV358CompactPill ${drive.tone}`;
  }

  function polishHtc() {
    document.querySelectorAll('.formPanel .checklistToolbar').forEach(toolbar => {
      let heading = toolbar.querySelector('.thaV358SupportingHeading');
      if (!heading) {
        heading = document.createElement('h2');
        heading.className = 'thaV358SupportingHeading';
        heading.textContent = 'Supporting Component Prompts';
        const copy = toolbar.querySelector('.lede');
        const group = document.createElement('div');
        if (copy) toolbar.insertBefore(group, copy); else toolbar.prepend(group);
        group.append(heading);
        if (copy) group.append(copy);
      }
      const copy = toolbar.querySelector('.lede');
      if (copy) copy.textContent = 'Use these optional prompts only when added detail strengthens the room overview.';
      const buttons = toolbar.querySelectorAll('button');
      if (buttons[0]) buttons[0].textContent = 'Open All Prompts';
      if (buttons[1]) buttons[1].textContent = 'Close All Prompts';
    });
    document.querySelectorAll('.roomOverviewEyebrow').forEach(label => { label.textContent = 'Room Snapshot'; });
  }

  function run() {
    const context = ensureStructure();
    if (!context) return;
    moveControls(context.page);
    updatePage(context);
    polishHtc();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; run(); });
  }
  schedule();
  setTimeout(schedule, 450);
  setTimeout(schedule, 1200);
  setInterval(schedule, 2200);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','disabled','value','open'] });
})();