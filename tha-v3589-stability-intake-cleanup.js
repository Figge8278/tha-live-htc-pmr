(() => {
  const ID = 'tha-v3589-stability-intake-cleanup';
  if (window[ID]) return;
  window[ID] = true;

  const START_KEY = 'tha-v359-start-active';
  const SESSION_KEY = 'tha-walkthrough-sessions';
  const CURRENT_KEY = 'tha-current-walkthrough-id';
  const DRIVE_META_KEY = 'tha-drive-meta';
  const RESOURCE_MIGRATION_KEY = 'tha-v359-resource-default-migrations';

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const setText = (node, value) => { if (node && text(node.textContent) !== text(value)) node.textContent = value; };
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
  const dateLabel = value => {
    const parsed = new Date(value);
    return value && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' })
      : '';
  };

  const CATEGORY_META = [
    { slug:'handy-services', label:'Handy Services', icon:'🧰' },
    { slug:'appliances', label:'Appliances', icon:'⚙️' },
    { slug:'electrical', label:'Electrical', icon:'🔌' },
    { slug:'plumbing', label:'Plumbing', icon:'💧' },
    { slug:'hvac-mechanical', label:'HVAC / Ventilation', icon:'🌀' },
    { slug:'roofing', label:'Roofing / Gutters', icon:'🏠' },
    { slug:'landscaping-site-grounds', label:'Landscaping / Site & Grounds', icon:'🌿' },
    { slug:'windows-exterior-sealant', label:'Windows / Exterior Sealant', icon:'🪟' },
    { slug:'general-contractor-remodel', label:'General Contractor / Structural', icon:'🏗️' },
    { slug:'carpentry-decks-fences', label:'Carpentry / Decks / Fences', icon:'🔨' },
    { slug:'painting-staining-coatings', label:'Painting / Staining', icon:'🎨' },
    { slug:'safety-life-safety', label:'Safety / Life Safety', icon:'🛡️' },
    { slug:'pest', label:'Pest', icon:'🐜' },
    { slug:'chimney', label:'Chimney / Fireplace', icon:'🧱' },
    { slug:'specialty-other', label:'Specialty / Other', icon:'🔎' }
  ];

  const EXTERIOR_RULES = [
    { match:/^Siding, trim, fascia, and soffit condition$/i, category:'handy-services', resourceValue:'Carpentry', resourceLabel:'Carpenter', oldDefault:'Handyman' },
    { match:/^Deck, porch, patio, and railings$/i, category:'handy-services', resourceValue:'Carpentry', resourceLabel:'Carpenter', oldDefault:'Handyman' },
    { match:/^Irrigation, sprinklers, hose bibs, and exterior water$/i, category:'landscaping-site-grounds', resourceValue:'Landscape', resourceLabel:'Landscaping', oldDefault:'Handyman' },
    { match:/^Gutters, downspouts, and drainage discharge$/i, category:'roofing', resourceValue:'Roof', resourceLabel:'Roofing', oldDefault:'Handyman' },
    { match:/^Grading \/ pooling near foundation$/i, category:'landscaping-site-grounds', resourceValue:'Landscape', resourceLabel:'Landscaping', oldDefault:'Drainage' },
    { match:/^Visible foundation cracks or movement$/i, category:'general-contractor-remodel', resourceValue:'General Contractor', resourceLabel:'General Contractor', oldDefault:'General Contractor' },
    { match:/^Exterior paint \/ stain \/ caulk wear$/i, category:'painting-staining-coatings', resourceValue:'Paint', resourceLabel:'Painting', oldDefault:'Handyman' },
    { match:/^Exterior doors, thresholds, and weatherstripping$/i, category:'handy-services', resourceValue:'Handyman', resourceLabel:'Handy Services', oldDefault:'Handyman' },
    { match:/^Roofline visible issues$/i, category:'roofing', resourceValue:'Roof', resourceLabel:'Roofing', oldDefault:'Roof' },
    { match:/^Windows and exterior sealant$/i, category:'windows-exterior-sealant', resourceValue:'Windows', resourceLabel:'Window Specialist', oldDefault:'Handyman' },
    { match:/^Fence and gates if relevant$/i, category:'landscaping-site-grounds', resourceValue:'Carpentry', resourceLabel:'Carpenter / Handy Services', oldDefault:'Handyman' },
    { match:/^Pest entry points and exterior gaps$/i, category:'pest', resourceValue:'Pest', resourceLabel:'Pest', oldDefault:'Handyman' },
    { match:/^Chimney exterior, cap, crown, and flashing$/i, category:'chimney', resourceValue:'Chimney', resourceLabel:'Chimney Sweep', oldDefault:'Chimney' }
  ];

  const CLIENT_FACING_INTAKE = [
    /^Electrical panel location/i,
    /^Main water shut-off location/i,
    /^Gas service \/ shutoff acknowledgement/i,
    /^Furnace filter replacement/i,
    /^Fire extinguishers:/i,
    /^Smoke \/ CO detector/i,
    /^Sewer \/ irrigation history/i
  ];
  const REQUIRED_REFERENCES = [
    /^Electrical panel location/i,
    /^Main water shut-off location/i,
    /^Gas service \/ shutoff acknowledgement/i
  ];

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .walkthroughControlsPanel{display:none!important}
      .thaV359StartPage{display:none;max-width:1220px;margin:0 auto;padding:14px 18px 32px;background:#f5f1e9}
      body.thaV359StartActive>.thaV359StartPage{display:block!important}
      body.thaV359StartActive .app>*:not(.topbar){display:none!important}
      body:not(.thaV359StartActive)>.thaV359StartPage{display:none!important}
      .thaV359StartShell{display:grid;gap:12px}
      .thaV359IdentityBar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #d7dfd8;border-radius:14px;background:#fff;padding:8px 11px;box-shadow:0 4px 12px rgba(31,50,39,.05)}
      .thaV359IdentityBar strong,.thaV359IdentityBar span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.thaV359IdentityBar strong{color:#173f2c;font-size:12px}.thaV359IdentityBar span{color:#6b7770;font-size:9px}.thaV359IdentityPills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.thaV359IdentityPills i{font-style:normal;border:1px solid #dce4de;border-radius:999px;background:#f7faf7;color:#506057;padding:4px 7px;font-size:8px;font-weight:900}
      .thaV359Begin{border:1px solid #d8ddd5;border-radius:20px;background:#fff;padding:15px;box-shadow:0 8px 22px rgba(31,50,39,.05)}.thaV359BeginHeader{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:11px}.thaV359BeginHeader h2{margin:0;color:#173f2c;font-size:22px}.thaV359BeginHeader span{color:#8b6a22;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}
      .thaV359Paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.thaV359Path{position:relative;display:grid;grid-template-columns:39px minmax(0,1fr) auto;grid-template-areas:'icon title action' 'icon copy action';gap:3px 10px;align-items:center;border:1px solid #dbe1dc;border-radius:16px;background:#fff;padding:13px 14px;overflow:hidden}.thaV359Path::before{content:'';position:absolute;inset:0 auto 0 0;width:6px}.thaV359Path.blank::before{background:#bf8420}.thaV359Path.local::before{background:#0b3658}.thaV359Path.existing::before{background:#2b78ad}.thaV359PathIcon{grid-area:icon;display:grid;place-items:center;width:37px;height:37px;border-radius:12px;font-size:19px}.blank .thaV359PathIcon{background:#fff4db}.local .thaV359PathIcon{background:#eaf1f6}.existing .thaV359PathIcon{background:#eaf5fc}.thaV359Path h3{grid-area:title;margin:0;color:#173f2c;font-size:15px}.thaV359Path p{grid-area:copy;margin:0;color:#68746d;font-size:9px;line-height:1.3}.thaV359Path button{grid-area:action;margin:0!important;padding:8px 10px!important;font-size:9px!important;white-space:nowrap}
      .thaV359Workspace{border:1px solid #c7d8df;border-radius:18px;background:#fff;overflow:hidden}.thaV359Workspace[hidden]{display:none!important}.thaV359WorkspaceHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;background:#f0f6f8;border-bottom:1px solid #d8e4e8}.thaV359WorkspaceHeader h3{margin:0;color:#123f5b;font-size:17px}.thaV359WorkspaceHeader p{margin:2px 0 0;color:#65747d;font-size:10px}.thaV359WorkspaceHeader button{padding:6px 9px!important;font-size:9px!important}.thaV359WorkspaceBody{display:grid;gap:10px;padding:12px}.thaV359BlankGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.thaV359BlankGrid label{display:grid;gap:4px;color:#173f2c;font-size:10px;font-weight:900}.thaV359BlankGrid input{width:100%;min-width:0;box-sizing:border-box}.thaV359WorkspaceActions,.thaV359SourceActions{display:flex;flex-wrap:wrap;gap:8px}.thaV359SourceActions button{flex:1 1 180px;justify-content:center}.thaV359LocalGrid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end}.thaV359LocalGrid label{display:grid;gap:4px;font-size:10px;font-weight:900}.thaV359LocalGrid select{width:100%;min-width:0}.thaV359SourceNote{margin:0;border:1px solid #d7e3e9;border-radius:11px;background:#f5f9fb;color:#49616f;padding:9px 10px;font-size:10px;font-weight:800;line-height:1.4}
      .thaV359CompactBar{display:none;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;margin:7px 18px;border:1px solid #d8e1da;border-radius:12px;background:#fff;padding:6px 9px;box-shadow:0 4px 12px rgba(31,50,39,.05)}.app:not(.thaV359StartActive)>.thaV359CompactBar{display:grid}.thaV359CompactBar strong,.thaV359CompactBar span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.thaV359CompactBar strong{font-size:10px;color:#173f2c}.thaV359CompactBar span{font-size:8px;color:#6b7770}.thaV359CompactBar button{border-radius:999px!important;padding:5px 8px!important;font-size:8px!important;white-space:nowrap}

      .intakePage .intakeStatusSummary{display:none!important}
      .thaV359IntakeImportBar{margin:0 0 11px;border:1px solid #cbdce5;border-radius:12px;background:#f6fafc;overflow:hidden}.thaV359IntakeImportBar>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;list-style:none;padding:8px 10px;color:#174d70;font-size:10px;font-weight:950}.thaV359IntakeImportBar>summary::-webkit-details-marker{display:none}.thaV359IntakeImportBody{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #d9e6ec;padding:9px 10px}.thaV359IntakeImportBody p{margin:0;color:#5d707b;font-size:9px;font-weight:800;line-height:1.35}.thaV359IntakeImportBody button{padding:7px 9px!important;font-size:9px!important}
      .homeownerLane .quickIntakeGrid{grid-template-columns:minmax(0,1fr)!important;gap:9px!important}.homeownerLane .intakeQuestion.tha-quick-card{width:100%!important;text-align:left!important;align-items:stretch!important}.homeownerLane .tha-quick-header{justify-content:flex-start!important;align-items:center!important;text-align:left!important;padding:12px 13px!important}.homeownerLane .tha-quick-title{flex:1!important;text-align:left!important}.homeownerLane .tha-quick-title strong,.homeownerLane .tha-quick-title small,.homeownerLane .structuredPromptField,.homeownerLane .structuredPromptField span,.homeownerLane .intakeQuestion>span,.homeownerLane .intakeQuestion>small{text-align:left!important}
      .intakePage label.thaV359ClientFacing,.checklistDetailPanel label.thaV359ClientFacing,.roomOverviewBody label.thaV359ClientFacing{position:relative;border:1px solid #d9b74a!important;border-left:5px solid #bf8420!important;border-radius:11px!important;background:#fff9d8!important;padding:9px!important}.thaV359ClientFacingBadge{display:inline-flex!important;width:max-content!important;margin:0 0 5px!important;border:1px solid #d9b74a!important;border-radius:999px!important;background:#fffef2!important;color:#715b0e!important;padding:3px 6px!important;font-size:8px!important;font-weight:950!important;text-transform:uppercase!important}.intakePage label.thaV359MustAnswer:not(.thaV359Answered){border-color:#d06b19!important;border-left-color:#d06b19!important;background:#fff1dc!important}.intakePage label.thaV359MustAnswer.thaV359Answered{border-color:#5087b3!important;border-left-color:#287bb7!important;background:#eef7fc!important}

      .formPanel .checklistItemCard{margin-top:6px!important;border-left-width:1px!important;border-right-width:1px!important;border-radius:14px!important;overflow:hidden!important;box-shadow:none!important}.formPanel .checklistSummaryRow{padding:9px 10px!important;gap:8px!important;background:#fff!important}.formPanel .checklistSummaryMain{min-width:0!important}.formPanel .checklistSummaryMain .itemTitleLine{display:flex!important;align-items:center!important;gap:6px!important;min-width:0!important;flex-wrap:wrap!important}.formPanel .checklistSummaryMain .itemTitleLine strong{font-size:14px!important;line-height:1.25!important}.formPanel .tradeIcon{width:31px!important;height:31px!important;flex:0 0 31px!important;font-size:17px!important;background:#fff7e9!important;border:1px solid #e4c38d!important}.thaV359CategoryChip{display:inline-flex;align-items:center;border:1px solid #d7e2e7;border-radius:999px;background:#f3f7f9;color:#49616f;padding:2px 6px;font-size:7px;font-weight:950;white-space:nowrap}.formPanel .checklistItemCard::before{content:none!important;display:none!important}.formPanel .checklistToolbar .lede{font-size:10px!important}

      .passReviewCard{position:relative}.passReviewCard.pmcp-selected:not(.thaPmcpActivePlanning),.passReviewCard.pmcp-declined:not(.thaPmcpActivePlanning),.passReviewCard.thaPmcpLongRange:not(.thaPmcpActivePlanning){box-shadow:inset -6px 0 0 #8fc885!important}.passReviewCard.thaPmcpActivePlanning:not(.pmcp-selected):not(.pmcp-declined):not(.thaPmcpLongRange){box-shadow:inset -6px 0 0 #7e4c9a!important}.passReviewCard.thaPmcpActivePlanning.pmcp-selected,.passReviewCard.thaPmcpActivePlanning.pmcp-declined,.passReviewCard.thaPmcpActivePlanning.thaPmcpLongRange{box-shadow:inset -6px 0 0 #8fc885,inset -12px 0 0 #7e4c9a!important}.passCategoryGroup.thaV359HasCare:not(.thaV359HasPlanning){box-shadow:inset -6px 0 0 #8fc885!important}.passCategoryGroup.thaV359HasPlanning:not(.thaV359HasCare){box-shadow:inset -6px 0 0 #7e4c9a!important}.passCategoryGroup.thaV359HasCare.thaV359HasPlanning{box-shadow:inset -6px 0 0 #8fc885,inset -12px 0 0 #7e4c9a!important}
      .thaV359PmrDriveAction{display:flex;justify-content:flex-end;margin:-5px 0 9px}.thaV359PmrDriveAction button{padding:7px 10px!important;font-size:9px!important}

      @media(max-width:760px){.thaV359Paths{grid-template-columns:1fr}.thaV359BlankGrid{grid-template-columns:1fr}.thaV359LocalGrid{grid-template-columns:1fr}.thaV359IdentityBar{grid-template-columns:1fr}.thaV359IdentityPills{justify-content:flex-start}.thaV359CompactBar{margin:6px 8px}.thaV359Path{grid-template-columns:37px minmax(0,1fr) auto}.thaV359Path p{display:none}.thaV359IntakeImportBody{align-items:stretch;flex-direction:column}.thaV359IntakeImportBody button{width:100%!important}}
      @media print{.thaV359StartPage,.thaV359CompactBar,.thaV359IntakeImportBar,.thaV359PmrDriveAction{display:none!important}}
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
  function driveState() {
    const meta = object(read(DRIVE_META_KEY, {}));
    if (meta.lastSaved) return `Drive saved ${meta.lastSaved}`;
    if (meta.hasConnected) return 'Drive connected';
    if (meta.lastError) return 'Drive needs attention';
    return 'Drive not connected';
  }
  function nativeButton(pattern, root = document) {
    return Array.from(root.querySelectorAll('button')).find(button => pattern.test(text(button.textContent)));
  }
  function nativeLocalSelect() {
    return Array.from(document.querySelectorAll('select')).find(select => /saved local sessions/i.test(text(select.closest('label')?.textContent)));
  }
  function nativeField(pattern) {
    const labels = Array.from(document.querySelectorAll('.walkthroughSetupCard label'));
    const label = labels.find(item => pattern.test(text(item.textContent)));
    return label?.querySelector('input,textarea,select') || null;
  }
  function setNativeValue(field, value) {
    if (!field) return;
    const prototype = field instanceof HTMLSelectElement ? HTMLSelectElement.prototype : field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(field, value); else field.value = value;
    field.dispatchEvent(new Event('input', { bubbles:true }));
    field.dispatchEvent(new Event('change', { bubbles:true }));
  }
  function clickNav(pattern) {
    setStart(false);
    const button = Array.from(document.querySelectorAll('.topbar nav button')).find(item => pattern.test(text(item.textContent)));
    button?.click();
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 60);
  }
  function setStart(active) {
    localStorage.setItem(START_KEY, active ? 'true' : 'false');
    document.body?.classList.toggle('thaV359StartActive', active);
    document.querySelector('.app')?.classList.remove('thaV359StartActive');
    if (active) setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 20);
  }

  function blankFields() {
    return [
      { key:'session', label:'Working Session Name', pattern:/working session name|walkthrough name/i },
      { key:'client', label:'Client Name', pattern:/client name/i },
      { key:'address', label:'Project Address', pattern:/project address|property address/i },
      { key:'date', label:'Walkthrough Date', pattern:/walkthrough date|visit date/i, type:'date' }
    ];
  }

  function renderBlankWorkspace(page) {
    const host = page.querySelector('.thaV359WorkspaceBody');
    const fields = blankFields();
    host.innerHTML = `<div class="thaV359BlankGrid">${fields.map(item => {
      const native = nativeField(item.pattern);
      return `<label>${esc(item.label)}<input data-v359-blank-field="${item.key}" type="${item.type || 'text'}" value="${esc(native?.value || '')}"></label>`;
    }).join('')}</div><div class="thaV359WorkspaceActions"><button type="button" data-v359-begin-intake>Continue to Intake</button></div>`;
  }

  function renderLocalWorkspace(page) {
    const host = page.querySelector('.thaV359WorkspaceBody');
    const sessions = recentSessions();
    host.innerHTML = `<div class="thaV359LocalGrid"><label>Saved walkthrough<select data-v359-local-select><option value="">Choose a saved walkthrough</option>${sessions.map(item => {
      const client = object(item.data?.client);
      const title = text(client.address) || text(client.name) || text(item.name) || 'Untitled walkthrough';
      return `<option value="${esc(item.id)}">${esc(title)}${item.updatedAt ? ` · ${esc(dateLabel(item.updatedAt))}` : ''}</option>`;
    }).join('')}</select></label><button type="button" data-v359-local-continue disabled>Continue HTC</button></div><p class="thaV359SourceNote">Only walkthroughs saved in this browser on this device appear here.</p>`;
  }

  function renderExistingWorkspace(page) {
    const host = page.querySelector('.thaV359WorkspaceBody');
    host.innerHTML = `<div class="thaV359SourceActions"><button type="button" data-v359-source="drive">Connect / Open Google Drive</button><button type="button" data-v359-source="snapshot">Upload Prior Snapshot</button><button type="button" data-v359-source="intake">Upload Homeowner Intake</button></div><p class="thaV359SourceNote">These source records repopulate a working Snapshot so the property can be continued now, next year, or later.</p>`;
  }

  function openWorkspace(page, kind) {
    const workspace = page.querySelector('.thaV359Workspace');
    const title = workspace.querySelector('h3');
    const copy = workspace.querySelector('p');
    workspace.hidden = false;
    workspace.dataset.kind = kind;
    if (kind === 'blank') {
      nativeButton(/new blank local walkthrough/i)?.click();
      title.textContent = 'New Snapshot setup';
      copy.textContent = 'Enter the four identity fields for this working Snapshot.';
      renderBlankWorkspace(page);
      setTimeout(() => page.querySelector('[data-v359-blank-field]')?.focus(), 40);
    } else if (kind === 'local') {
      title.textContent = 'Continue on this device';
      copy.textContent = 'Choose one locally saved walkthrough.';
      renderLocalWorkspace(page);
    } else {
      title.textContent = 'Use existing information';
      copy.textContent = 'Connect Drive or upload a prior source record.';
      renderExistingWorkspace(page);
    }
    workspace.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  function triggerSource(kind) {
    if (kind === 'drive') {
      const records = document.querySelector('.businessRecordsCard');
      const open = nativeButton(/open folder|open google drive/i, records || document);
      const connect = nativeButton(/connect google drive/i, records || document);
      (open || connect)?.click();
      return;
    }
    const root = kind === 'snapshot' ? document.querySelector('.thaSnapshotSourcePanel') : document.querySelector('.intakeImportCard');
    const input = root?.querySelector('input[type=file]');
    if (input) input.click();
  }

  function ensureStart() {
    const app = document.querySelector('.app');
    const topbar = app?.querySelector(':scope > .topbar');
    const nav = topbar?.querySelector('nav');
    if (!app || !topbar || !nav) return null;

    let startButton = nav.querySelector('.thaV359StartNav');
    if (!startButton) {
      startButton = document.createElement('button');
      startButton.type = 'button';
      startButton.className = 'thaV359StartNav';
      startButton.textContent = '⌂ Start';
      nav.prepend(startButton);
    }

    let page = document.body.querySelector(':scope > .thaV359StartPage');
    if (!page) {
      page = document.createElement('main');
      page.className = 'thaV359StartPage noPrint';
      page.innerHTML = `<div class="thaV359StartShell"><section class="thaV359IdentityBar"><div><strong data-v359-address>Property not selected</strong><span data-v359-client>Client pending · Visit pending</span></div><div class="thaV359IdentityPills"><i data-v359-session>No active session</i><i data-v359-drive>Drive not connected</i></div></section><section class="thaV359Begin"><header class="thaV359BeginHeader"><h2>Choose your first step</h2><span>Select one</span></header><div class="thaV359Paths"><article class="thaV359Path blank"><span class="thaV359PathIcon">＋</span><h3>Start Blank</h3><p>New Snapshot identity setup</p><button type="button" data-v359-path="blank">Set up</button></article><article class="thaV359Path local"><span class="thaV359PathIcon">↻</span><h3>Continue on This Device</h3><p>Saved walkthroughs only</p><button type="button" data-v359-path="local">Choose</button></article><article class="thaV359Path existing"><span class="thaV359PathIcon">⇩</span><h3>Use Existing Information</h3><p>Drive, prior Snapshot, or homeowner intake</p><button type="button" data-v359-path="existing">Open sources</button></article></div></section><section class="thaV359Workspace" hidden><header class="thaV359WorkspaceHeader"><div><h3>Start</h3><p></p></div><button type="button" data-v359-close>Close</button></header><div class="thaV359WorkspaceBody"></div></section></div>`;
      document.body.append(page);
    }

    let compact = app.querySelector(':scope > .thaV359CompactBar');
    if (!compact) {
      compact = document.createElement('section');
      compact.className = 'thaV359CompactBar noPrint';
      compact.innerHTML = `<div><strong data-v359-compact-address>No active property</strong><span data-v359-compact-client>Client pending · Visit pending</span></div><span data-v359-compact-save>Autosave ready</span><button type="button" data-v359-open-start>Start / Details</button>`;
      page.after(compact);
    }

    const active = localStorage.getItem(START_KEY);
    document.body.classList.toggle('thaV359StartActive', active === null ? true : active === 'true');
    app.classList.remove('thaV359StartActive');
    return { app, nav, page, compact };
  }

  function updateStart(context) {
    const { page, compact } = context;
    const session = activeSession();
    const data = object(session?.data);
    const client = object(data.client);
    const address = text(client.address) || 'Property not selected';
    const clientLine = [text(client.name) || 'Client pending', text(client.date) || 'Visit pending'].join(' · ');
    const sessionName = text(data.walkthroughName || session?.name) || 'No active session';
    const drive = driveState();
    setText(page.querySelector('[data-v359-address]'), address);
    setText(page.querySelector('[data-v359-client]'), clientLine);
    setText(page.querySelector('[data-v359-session]'), sessionName);
    setText(page.querySelector('[data-v359-drive]'), drive);
    setText(compact.querySelector('[data-v359-compact-address]'), address);
    setText(compact.querySelector('[data-v359-compact-client]'), clientLine);
    setText(compact.querySelector('[data-v359-compact-save]'), session?.updatedAt ? `Autosaved ${dateLabel(session.updatedAt)}` : 'Autosave ready');
  }

  function addClientFacingBadge(label, mustAnswer, customText = '') {
    if (!label) return;
    label.classList.add('thaV359ClientFacing');
    label.classList.toggle('thaV359MustAnswer', mustAnswer);
    let badge = label.querySelector(':scope > .thaV359ClientFacingBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'thaV359ClientFacingBadge';
      label.prepend(badge);
    }
    setText(badge, customText || (mustAnswer ? 'Must answer · PMR reference' : 'Client-facing PMR wording'));
    const field = label.querySelector('input,textarea,select');
    label.classList.toggle('thaV359Answered', Boolean(text(field?.value)));
  }

  function decorateIntake() {
    const page = document.querySelector('.intakePage');
    const lane = page?.querySelector('.homeownerLane');
    if (!page || !lane) return;

    let bar = page.querySelector('.thaV359IntakeImportBar');
    if (!bar) {
      bar = document.createElement('details');
      bar.className = 'thaV359IntakeImportBar noPrint';
      bar.innerHTML = `<summary><span>Upload completed Homeowner Intake</span><span>⌄</span></summary><div class="thaV359IntakeImportBody"><p>Duplicate access to the same Intake upload available on Start.</p><button type="button" data-v359-intake-upload>Choose Intake File</button></div>`;
      lane.before(bar);
    }

    page.querySelectorAll('.intakeSubsection label').forEach(label => {
      const value = text(label.textContent);
      if (!CLIENT_FACING_INTAKE.some(pattern => pattern.test(value))) return;
      addClientFacingBadge(label, REQUIRED_REFERENCES.some(pattern => pattern.test(value)));
    });
  }

  function cardTitle(card) {
    return text(card?.querySelector('.checklistSummaryRow .itemTitleLine strong')?.textContent || card?.querySelector('.expandedItemHead h2')?.textContent);
  }
  function cardZone(card) {
    const line = card?.querySelector('.checklistSummaryMain>span:last-child') || card?.querySelector('.expandedItemHead>div>p');
    return text(line?.textContent).split('·')[0].trim();
  }
  function exteriorRule(title) { return EXTERIOR_RULES.find(rule => rule.match.test(title)); }
  function deriveCategory(title, zone) {
    const rule = exteriorRule(title);
    if (rule) return rule.category;
    const value = `${zone} ${title}`.toLowerCase();
    if (/(chimney|fireplace|hearth|damper)/.test(value)) return 'chimney';
    if (/(roof|gutter|downspout|flashing|shingle)/.test(value)) return 'roofing';
    if (/(irrigation|sprinkler|grading|pooling|landscape|site \/ structures|fence|gate)/.test(value)) return 'landscaping-site-grounds';
    if (/(window|exterior sealant|screen|fogging)/.test(value)) return 'windows-exterior-sealant';
    if (/(foundation|structural|movement|remodel|permit)/.test(value)) return 'general-contractor-remodel';
    if (/(pest|rodent|termite|insect|entry point)/.test(value)) return 'pest';
    if (/(paint|stain|coating|interior finish|exterior finish|drywall)/.test(value)) return 'painting-staining-coatings';
    if (/(electrical|gfci|outlet|switch|breaker|panel|lighting)/.test(value)) return 'electrical';
    if (/(plumbing|sink|faucet|drain|toilet|water heater|washer hose|shutoff|wet area)/.test(value)) return 'plumbing';
    if (/(hvac|ventilation|furnace|heat pump|air conditioner|thermostat|exhaust|dryer vent)/.test(value)) return 'hvac-mechanical';
    if (/(appliance|refrigerator|dishwasher|range|oven|disposal)/.test(value)) return 'appliances';
    if (/(safety|smoke|co detector|fire extinguisher)/.test(value)) return 'safety-life-safety';
    if (/(carpentry|cabinet|drawer|shelving|built-in|deck|trim|fascia|soffit)/.test(value)) return 'carpentry-decks-fences';
    if (/(door|threshold|weatherstripping|hardware|hinge|latch|flooring|transition)/.test(value)) return 'handy-services';
    return 'specialty-other';
  }
  function setResourceLine(node, label) {
    if (!node || !label) return;
    const zone = text(node.textContent).split('·')[0].trim();
    const next = `${zone} · Likely resource: ${label}`;
    if (text(node.textContent) !== next) node.textContent = next;
  }
  function migrateResourceDefault(card, rule, roomLabel) {
    if (!rule || rule.resourceValue === rule.oldDefault) return;
    const label = Array.from(card.querySelectorAll('.checklistDetailPanel .inputs > label')).find(item => /Suggested Trade \/ Resource|Likely Resource/i.test(text(item.textContent)));
    const select = label?.querySelector('select');
    if (!select) return;
    const sessionId = localStorage.getItem(CURRENT_KEY) || 'unsaved';
    const key = `${sessionId}::${roomLabel}::${cardTitle(card)}`;
    const migrated = object(read(RESOURCE_MIGRATION_KEY, {}));
    if (migrated[key]) return;
    if (select.value === rule.oldDefault) setNativeValue(select, rule.resourceValue);
    migrated[key] = true;
    write(RESOURCE_MIGRATION_KEY, migrated);
  }

  function decorateChecklist() {
    document.querySelectorAll('.formPanel').forEach(panel => {
      const roomLabel = text(panel.querySelector(':scope > h1')?.textContent).replace(/\s+HTC$/i, '') || 'Walkthrough';
      panel.querySelectorAll('.checklistItemCard').forEach(card => {
        const title = cardTitle(card);
        if (!title) return;
        const rule = exteriorRule(title);
        const slug = deriveCategory(title, cardZone(card));
        const meta = CATEGORY_META.find(item => item.slug === slug) || CATEGORY_META[CATEGORY_META.length - 1];
        card.dataset.v359Category = slug;
        card.querySelectorAll('.tradeIcon').forEach(icon => {
          if (icon.textContent !== meta.icon) icon.textContent = meta.icon;
          icon.title = `${meta.label} system/category. Likely resource is item-specific.`;
        });
        const titleLine = card.querySelector('.checklistSummaryRow .itemTitleLine');
        let chip = titleLine?.querySelector('.thaV359CategoryChip');
        if (!chip && titleLine) {
          chip = document.createElement('span');
          chip.className = 'thaV359CategoryChip';
          titleLine.append(chip);
        }
        if (chip) setText(chip, meta.label);
        if (rule?.resourceLabel) card.querySelectorAll('.checklistSummaryMain>span:last-child,.expandedItemHead>div>p').forEach(node => setResourceLine(node, rule.resourceLabel));
        migrateResourceDefault(card, rule, roomLabel);
        card.querySelectorAll('.checklistDetailPanel label.notes').forEach(label => {
          if (/Notes for PMR detail/i.test(text(label.textContent))) addClientFacingBadge(label, false);
        });
      });
      panel.querySelectorAll('.roomOverviewBody label.notes').forEach(label => {
        if (/Room Note \/ Voice Transcript/i.test(text(label.textContent))) addClientFacingBadge(label, false, 'PMR wording when this room overview is included');
      });
      const copy = panel.querySelector('.checklistToolbar .lede');
      if (copy) setText(copy, 'System/category is shown on each compact row. Changing status or resource will not move the item.');
    });
  }

  function decoratePass() {
    document.querySelectorAll('.passCategoryGroup').forEach(group => {
      const hasCare = Boolean(group.querySelector('.passReviewCard.pmcp-selected,.passReviewCard.pmcp-declined,.passReviewCard.thaPmcpLongRange'));
      const hasPlanning = Boolean(group.querySelector('.passReviewCard.thaPmcpActivePlanning'));
      group.classList.toggle('thaV359HasCare', hasCare);
      group.classList.toggle('thaV359HasPlanning', hasPlanning);
    });
  }

  function addPmrDriveAction() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    const header = pmr?.querySelector(':scope > .pmrHeader');
    if (!pmr || !header || pmr.querySelector(':scope > .thaV359PmrDriveAction')) return;
    const row = document.createElement('div');
    row.className = 'thaV359PmrDriveAction noPrint';
    row.innerHTML = '<button type="button">Save PMR Package to Drive</button>';
    header.after(row);
  }

  function run() {
    installStyles();
    const context = ensureStart();
    if (context) updateStart(context);
    decorateIntake();
    decorateChecklist();
    decoratePass();
    addPmrDriveAction();
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

  document.addEventListener('click', event => {
    const target = event.target.closest('button,summary');
    if (!target) return;
    if (target.closest('.thaV359StartNav') || target.matches('[data-v359-open-start]')) {
      event.preventDefault();
      setStart(true);
      schedule();
      return;
    }
    if (target.closest('.topbar nav') && !target.closest('.thaV359StartNav')) {
      setStart(false);
      setTimeout(schedule, 0);
      return;
    }
    const path = target.dataset.v359Path;
    if (path) {
      const page = document.querySelector('.thaV359StartPage');
      if (page) openWorkspace(page, path);
      return;
    }
    if (target.matches('[data-v359-close]')) {
      const workspace = target.closest('.thaV359Workspace');
      if (workspace) workspace.hidden = true;
      return;
    }
    if (target.matches('[data-v359-begin-intake]')) {
      clickNav(/Intake/i);
      return;
    }
    if (target.matches('[data-v359-local-continue]')) {
      const select = document.querySelector('[data-v359-local-select]');
      if (!select?.value) return;
      const native = nativeLocalSelect();
      if (native) setNativeValue(native, select.value);
      setTimeout(() => clickNav(/HTC/i), 100);
      return;
    }
    if (target.dataset.v359Source) {
      triggerSource(target.dataset.v359Source);
      return;
    }
    if (target.matches('[data-v359-intake-upload]')) {
      triggerSource('intake');
      return;
    }
    if (target.closest('.thaV359PmrDriveAction')) {
      const native = nativeButton(/save drive package to drive|save pmr package to drive/i, document.querySelector('.businessRecordsCard') || document);
      native?.click();
    }
  }, true);

  document.addEventListener('input', event => {
    const key = event.target.dataset?.v359BlankField;
    if (!key) return;
    const config = blankFields().find(item => item.key === key);
    if (config) setNativeValue(nativeField(config.pattern), event.target.value);
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches('[data-v359-local-select]')) {
      const button = document.querySelector('[data-v359-local-continue]');
      if (button) button.disabled = !event.target.value;
    }
    setTimeout(schedule, 0);
  }, true);

  const observer = new MutationObserver(() => schedule());
  const begin = () => {
    run();
    if (document.body) observer.observe(document.body, { childList:true, subtree:true });
    setTimeout(schedule, 250);
    setTimeout(schedule, 800);
    setTimeout(schedule, 1600);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin, { once:true });
  else begin();
  window.addEventListener('storage', schedule);
})();
