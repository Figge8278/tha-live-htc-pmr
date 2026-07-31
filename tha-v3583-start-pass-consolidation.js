(() => {
  const ID = 'tha-v3583-start-pass-consolidation';
  const SESSION_KEY = 'tha-walkthrough-sessions';
  const CURRENT_KEY = 'tha-current-walkthrough-id';
  const START_KEY = 'tha-v358-start-active';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const dateLabel = value => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }) : '';
  };

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaV358Begin{padding:11px 12px!important}.thaV358BeginHeader{align-items:center!important;margin-bottom:8px!important}.thaV358BeginHeader h2{font-size:18px!important}.thaV358BeginHeader p{display:none!important}.thaV358StepCue{font-size:8px!important}
      .thaV358Paths{gap:8px!important}.thaV358Path{min-height:0!important;padding:9px 10px!important;display:grid!important;grid-template-columns:32px minmax(0,1fr) auto!important;grid-template-areas:'icon title action' 'icon copy action'!important;align-items:center!important;gap:2px 8px!important;border-radius:14px!important}.thaV358Path::before{width:5px!important}.thaV358PathNumber{display:none!important}.thaV358PathIcon{grid-area:icon;width:30px!important;height:30px!important;border-radius:10px!important;font-size:16px!important}.thaV358Path h3{grid-area:title;font-size:13px!important;line-height:1.15!important}.thaV358Path p{grid-area:copy;font-size:8px!important;line-height:1.2!important}.thaV358Path>button{grid-area:action;width:auto!important;margin:0!important;padding:7px 9px!important;border-radius:10px!important;font-size:9px!important;white-space:nowrap}.thaV358Path select,.thaV358Path .thaV358SourceButtons,.thaV358Path .thaV358DriveSourceState{display:none!important}
      .thaV358PathWorkspace{display:grid;gap:10px;border:1px solid #c7d8df;border-radius:18px;background:#fff;overflow:hidden;box-shadow:0 8px 20px rgba(13,54,88,.06)}.thaV358PathWorkspace[hidden]{display:none!important}.thaV358PathWorkspaceHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;background:#f0f6f8;border-bottom:1px solid #d8e4e8}.thaV358PathWorkspaceHeader h3{margin:0;color:#123f5b;font-size:15px}.thaV358PathWorkspaceHeader p{margin:2px 0 0;color:#65747d;font-size:9px}.thaV358PathWorkspaceClose{border:1px solid #cad9df!important;background:#fff!important;color:#123f5b!important;padding:6px 9px!important;border-radius:999px!important;font-size:9px!important}.thaV358PathWorkspaceBody{display:grid;gap:9px;padding:11px}.thaV358ExistingChoices{display:flex;flex-wrap:wrap;gap:7px}.thaV358ExistingChoices button{flex:1 1 150px;justify-content:center;background:#eef5f8;color:#174d70;border:1px solid #cbdde6;padding:8px 10px;font-size:10px}.thaV358ExistingChoices button.active{background:#174d70;color:#fff}.thaV358PathHost{display:grid;gap:10px;min-width:0}.thaV358PathHost:empty{display:none}
      .thaV358PathWorkspace .controlGroup,.thaV358PathWorkspace .sessionCard,.thaV358PathWorkspace .driveStatus,.thaV358PathWorkspace .intakeImportCard,.thaV358PathWorkspace .businessRecordsCard,.thaV358PathWorkspace .thaSnapshotSourcePanel{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.thaV358PathWorkspace label,.thaV358PathWorkspace input:not([type=checkbox]):not([type=radio]):not([type=file]),.thaV358PathWorkspace select,.thaV358PathWorkspace textarea,.thaV358PathWorkspace [class*=Grid],.thaV358PathWorkspace [class*=grid]{width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important}.thaV358PathWorkspace .walkthroughSetupCard{gap:9px!important}.thaV358PathWorkspace .walkthroughSetupCard>.controlGroupTitle{display:none!important}.thaV358PathWorkspace .walkthroughSetupCard label{display:grid!important;grid-template-columns:1fr!important;gap:4px!important}
      .thaV358LocalChooser{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end}.thaV358LocalChooser label{min-width:0}.thaV358LocalChooser button{justify-content:center}.thaV358LocalMeta{color:#66756e;font-size:9px;font-weight:800}
      .thaV358DriveRequirement{border:1px solid #e6c16f;border-radius:12px;background:#fff8e5;color:#735516;padding:9px 10px;font-size:10px;font-weight:850}.thaV358DriveRequirement.ready{border-color:#b9d9ad;background:#f1f8ee;color:#285c30}.thaV358PathWorkspace .businessRecordsCard .driveSetupHeader p,.thaV358PathWorkspace .businessRecordsCard .drivePill,.thaV358PathWorkspace .businessRecordsCard .driveSetupGrid,.thaV358PathWorkspace .businessRecordsCard .driveMetaRow,.thaV358PathWorkspace .businessRecordsCard .driveSetupNote,.thaV358PathWorkspace .businessRecordsCard .driveActionHelp,.thaV358PathWorkspace .businessRecordsCard .originCard{display:none!important}.thaV358PathWorkspace .businessRecordsCard .driveSetupHeader{margin:0!important;padding:0!important;border:0!important}.thaV358PathWorkspace .businessRecordsCard .driveSetupHeader h3{font-size:14px!important}.thaV358PathWorkspace .businessRecordsCard .driveSetupActions{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;margin-top:8px!important}.thaV358PathWorkspace .businessRecordsCard .driveSetupActions>*{width:100%!important;justify-content:center!important}.thaV358PathWorkspace .businessRecordsCard .thaV358ConnectDrivePrimary{grid-column:1/-1;background:#0b3658!important;color:#fff!important;border:2px solid #bf8420!important;padding:12px 14px!important;font-size:13px!important;box-shadow:0 7px 18px rgba(11,54,88,.15)!important}.thaV358PathWorkspace .businessRecordsCard .thaV358StartHiddenAction{display:none!important}.thaV358PathWorkspace .businessRecordsCard .driveErrorBox{margin-top:8px!important}
      .thaV358LegacyStartHidden{display:none!important}.thaV358ParkingHub{display:none!important}.thaV358MoreTools{border:1px solid #d7e1da;border-radius:14px;background:#fff;overflow:hidden}.thaV358MoreTools>summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:10px 12px;color:#173f2c;font-size:11px;font-weight:950;list-style:none}.thaV358MoreTools>summary::-webkit-details-marker{display:none}.thaV358MoreToolsBody{display:grid;gap:9px;padding:10px;border-top:1px solid #e0e7e2}.thaV358MoreTools .localBackupRestore,.thaV358MoreTools .advancedPanel{width:100%!important;max-width:none!important;margin:0!important}
      .statusKey{display:none!important}.thaV358StartStatusKey{border:1px solid #d7dfd8;border-radius:13px;background:#fff;overflow:hidden}.thaV358StartStatusKey>summary{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:9px 11px;color:#173f2c;font-size:10px;font-weight:950;list-style:none}.thaV358StartStatusKey>summary::-webkit-details-marker{display:none}.thaV358StatusItems{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:8px 10px 10px;border-top:1px solid #e1e7e2}.thaV358StatusItems span{display:flex;align-items:center;gap:5px;color:#53625a;font-size:8px;font-weight:850}.thaV358StatusItems i{width:9px;height:9px;border-radius:50%;flex:0 0 auto}.thaV358StatusItems .red{background:#c74732}.thaV358StatusItems .orange{background:#e97919}.thaV358StatusItems .gold{background:#bf8420}.thaV358StatusItems .violet{background:#7e4c9a}.thaV358StatusItems .green{background:#52aa4b}.thaV358StatusItems .blue{background:#287bb7}.thaV358StatusItems .gray{background:#8b98a0}
      .thaV358PmrDriveAction{display:flex;justify-content:flex-end;margin:-6px 0 10px}.thaV358PmrDriveAction button{background:#0b3658;color:#fff;border:1px solid #bf8420;padding:8px 11px;font-size:10px}.thaV358PmrDriveAction button.needsDrive{background:#fff8e5;color:#735516;border-color:#e6c16f}
      .tha-v47-pass-packages{border-left-width:1px!important;border-right:6px solid #52aa4b!important}.thaV358PackageHeader{display:flex;align-items:center;justify-content:space-between;gap:10px}.thaV358PackageHeader h2{margin:0!important;border:0!important;padding:0!important}.thaV358PackageHeader button{padding:6px 9px!important;font-size:9px!important;white-space:nowrap}.tha-v47-pass-packages.thaV358PackageCollapsed>:not(.thaV358PackageHeader){display:none!important}.passWorkspace .passReviewPanel{border-left-width:1px!important;border-right:6px solid #52aa4b!important}.passReviewCard.pmcp-declined,.passReviewCard.thaPmcpLongRange{box-shadow:inset -6px 0 0 #8fc885!important}.passReviewCard.thaPmcpActivePlanning{box-shadow:inset -6px 0 0 #7e4c9a!important}
      @media(max-width:900px){.thaV358Path{grid-template-columns:30px minmax(0,1fr) auto!important}.thaV358StatusItems{grid-template-columns:repeat(2,minmax(0,1fr))}.thaV358LocalChooser{grid-template-columns:1fr}.thaV358PathWorkspace .businessRecordsCard .driveSetupActions{grid-template-columns:1fr!important}}
      @media(max-width:620px){.thaV358Paths{grid-template-columns:1fr!important}.thaV358Path{grid-template-columns:30px minmax(0,1fr) auto!important}.thaV358Path p{display:none!important}.thaV358StatusItems{grid-template-columns:1fr 1fr}}
    `;
    document.head.append(style);
  }

  function sessionList() {
    return Object.values(object(read(SESSION_KEY, {}))).filter(item => item?.data).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }

  function nativeButton(pattern, root = document) {
    return Array.from(root.querySelectorAll('button')).find(button => pattern.test(text(button.textContent)));
  }

  function nativeLocalSelect() {
    return Array.from(document.querySelectorAll('select')).find(select => /saved local sessions/i.test(text(select.closest('label')?.textContent)));
  }

  function nativeSelect(select, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(select, value); else select.value = value;
    select.dispatchEvent(new Event('input', { bubbles:true }));
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }

  function driveConnected() {
    const nativeCard = document.querySelector('.businessRecordsCard');
    if (nativeCard?.querySelector('.drivePill.connected')) return true;
    const meta = object(read('tha-drive-meta', {}));
    return Boolean(meta.hasConnected && !meta.lastError);
  }

  function cleanRouting(page) {
    page.querySelectorAll('[data-v358-property-host],[data-v358-local-host],[data-v358-existing-host],[data-v358-records-host],[data-v358-advanced-host]').forEach(node => {
      if (!node.closest('.thaV358ParkingHub')) {
        node.removeAttribute('data-v358-property-host');
        node.removeAttribute('data-v358-local-host');
        node.removeAttribute('data-v358-existing-host');
        node.removeAttribute('data-v358-records-host');
        node.removeAttribute('data-v358-advanced-host');
      }
    });
    page.querySelectorAll('.thaSnapshotInformationSourceHost').forEach(node => {
      if (!node.closest('.thaV358ParkingHub')) node.classList.remove('thaSnapshotInformationSourceHost');
    });
  }

  function parking(page) {
    let hub = page.querySelector('.thaV358ParkingHub');
    if (!hub) {
      hub = document.createElement('div');
      hub.className = 'thaV358ParkingHub';
      hub.innerHTML = `<div data-v358-property-host></div><div data-v358-local-host></div><div data-v358-existing-host></div><div data-v358-records-host></div><div data-v358-advanced-host></div><div class="thaSnapshotInformationSourceHost"></div>`;
      page.append(hub);
    }
    return hub;
  }

  function place(selector, host, method = 'append') {
    if (!host) return null;
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) return null;
    const preferred = nodes.find(node => host.contains(node)) || nodes[nodes.length - 1];
    if (preferred.parentElement !== host) host[method](preferred);
    nodes.filter(node => node !== preferred).forEach(node => { node.style.display = 'none'; });
    return preferred;
  }

  function routeNativeCards(page, kind) {
    const hub = parking(page);
    cleanRouting(page);
    const host = page.querySelector('.thaV358PathHost');
    const moreTools = page.querySelector('.thaV358MoreToolsBody');
    const propertyParking = hub.children[0];
    const localParking = hub.children[1];
    const intakeParking = hub.children[2];
    const recordsParking = hub.children[3];
    const advancedParking = hub.children[4];
    const snapshotParking = hub.children[5];
    propertyParking.setAttribute('data-v358-property-host', '');
    localParking.setAttribute('data-v358-local-host', '');
    intakeParking.setAttribute('data-v358-existing-host', '');
    recordsParking.setAttribute('data-v358-records-host', '');
    advancedParking.setAttribute('data-v358-advanced-host', '');
    snapshotParking.classList.add('thaSnapshotInformationSourceHost');

    if (kind === 'blank') {
      propertyParking.removeAttribute('data-v358-property-host');
      recordsParking.removeAttribute('data-v358-records-host');
      host.setAttribute('data-v358-property-host', '');
      host.setAttribute('data-v358-records-host', '');
    } else if (kind === 'intake') {
      recordsParking.removeAttribute('data-v358-records-host');
      host.setAttribute('data-v358-records-host', '');
      if (driveConnected()) {
        intakeParking.removeAttribute('data-v358-existing-host');
        host.setAttribute('data-v358-existing-host', '');
      }
    } else if (kind === 'snapshot') {
      snapshotParking.classList.remove('thaSnapshotInformationSourceHost');
      host.classList.add('thaSnapshotInformationSourceHost');
    } else if (kind === 'drive') {
      recordsParking.removeAttribute('data-v358-records-host');
      host.setAttribute('data-v358-records-host', '');
    }

    place('.walkthroughSetupCard', page.querySelector('[data-v358-property-host]'));
    place('.localWorkCard', page.querySelector('[data-v358-local-host]'));
    place('.intakeImportCard', page.querySelector('[data-v358-existing-host]'), 'prepend');
    place('.businessRecordsCard', page.querySelector('[data-v358-records-host]'));
    place('.advancedPanel', moreTools || page.querySelector('[data-v358-advanced-host]'));
    place('.thaSnapshotSourcePanel', page.querySelector('.thaSnapshotInformationSourceHost'));
    const backup = document.querySelector('.localBackupRestore');
    if (backup && moreTools && backup.parentElement !== moreTools) moreTools.prepend(backup);
  }

  function updateDriveCard(root = document) {
    const card = root.querySelector('.businessRecordsCard');
    if (!card) return;
    const connect = nativeButton(/connect google drive/i, card);
    if (connect) connect.classList.add('thaV358ConnectDrivePrimary');
    Array.from(card.querySelectorAll('button')).forEach(button => {
      const label = text(button.textContent);
      button.classList.toggle('thaV358StartHiddenAction', /save drive package|sync pending photos/i.test(label));
    });
    const heading = card.querySelector('.driveSetupHeader h3');
    if (heading) heading.textContent = 'Google Drive';
  }

  function renderLocalChooser(body) {
    const sessions = sessionList();
    body.innerHTML = `<div class="thaV358LocalChooser"><label>Saved walkthrough<select data-v3583-local-select><option value="">Choose a saved walkthrough</option>${sessions.map(item => {
      const client = object(item.data?.client);
      const title = text(client.address) || text(client.name) || text(item.name) || 'Untitled walkthrough';
      return `<option value="${esc(item.id)}">${esc(title)}${item.updatedAt ? ` · ${esc(dateLabel(item.updatedAt))}` : ''}</option>`;
    }).join('')}</select></label><button type="button" data-v3583-local-continue disabled>Continue HTC</button></div><div class="thaV358LocalMeta">Local sessions stay on this browser until saved to Drive or downloaded as a backup.</div>`;
    const select = body.querySelector('[data-v3583-local-select]');
    const button = body.querySelector('[data-v3583-local-continue]');
    select?.addEventListener('change', () => { button.disabled = !select.value; });
    button?.addEventListener('click', () => {
      if (!select?.value) return;
      const native = nativeLocalSelect();
      if (native) nativeSelect(native, select.value);
      localStorage.setItem(START_KEY, 'false');
      const htc = Array.from(document.querySelectorAll('.topbar nav button')).find(item => /HTC/i.test(text(item.textContent)));
      setTimeout(() => { htc?.click(); window.scrollTo({ top:0, behavior:'smooth' }); }, 100);
    });
  }

  function setWorkspace(page, kind, subkind = '') {
    const workspace = page.querySelector('.thaV358PathWorkspace');
    const host = page.querySelector('.thaV358PathHost');
    const choices = page.querySelector('.thaV358ExistingChoices');
    const requirement = page.querySelector('.thaV358DriveRequirement');
    const title = page.querySelector('[data-v3583-workspace-title]');
    const copy = page.querySelector('[data-v3583-workspace-copy]');
    if (!workspace || !host || !title || !copy) return;
    workspace.hidden = false;
    workspace.dataset.kind = kind;
    workspace.dataset.subkind = subkind;
    routeNativeCards(page, 'none');
    host.innerHTML = '';
    host.removeAttribute('data-v358-property-host');
    host.removeAttribute('data-v358-local-host');
    host.removeAttribute('data-v358-existing-host');
    host.removeAttribute('data-v358-records-host');
    host.classList.remove('thaSnapshotInformationSourceHost');
    choices.hidden = kind !== 'existing';
    requirement.hidden = true;
    page.querySelectorAll('.thaV358Path>button').forEach(button => button.classList.toggle('active', button.dataset.v3583Path === kind));

    if (kind === 'blank') {
      title.textContent = 'New Snapshot setup';
      copy.textContent = 'Enter the property and visit details. Local autosave begins immediately; Drive can be connected here or later.';
      routeNativeCards(page, 'blank');
      updateDriveCard(host);
      setTimeout(() => host.querySelector('.walkthroughSetupCard input')?.focus(), 80);
    } else if (kind === 'local') {
      title.textContent = 'Continue on this device';
      copy.textContent = 'Choose a locally saved walkthrough.';
      routeNativeCards(page, 'none');
      renderLocalChooser(host);
    } else if (kind === 'existing') {
      title.textContent = 'Start with existing information';
      copy.textContent = 'Choose a completed Intake, a prior local Snapshot, or Google Drive.';
      choices.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.v3583Source === subkind));
      if (!subkind) {
        routeNativeCards(page, 'none');
      } else if (subkind === 'intake') {
        const connected = driveConnected();
        requirement.hidden = false;
        requirement.classList.toggle('ready', connected);
        requirement.textContent = connected ? 'Drive connected — open the client folder, then import the completed Intake.' : 'Connect Google Drive first. The completed homeowner Intake is expected to come from the client’s Drive folder.';
        routeNativeCards(page, 'intake');
        updateDriveCard(host);
        if (connected) {
          const details = host.querySelector('.homeownerImportDetails');
          if (details) details.open = true;
        }
      } else if (subkind === 'snapshot') {
        routeNativeCards(page, 'snapshot');
        const heading = host.querySelector('.snapshotSourceHeading h4');
        if (heading) heading.textContent = 'Prior Local Snapshot';
      } else if (subkind === 'drive') {
        requirement.hidden = false;
        requirement.classList.toggle('ready', driveConnected());
        requirement.textContent = driveConnected() ? 'Drive connected — open the property folder or return to the selected workflow.' : 'Connect Google Drive to use a client folder or cloud record.';
        routeNativeCards(page, 'drive');
        updateDriveCard(host);
      }
    }
    setTimeout(() => workspace.scrollIntoView({ behavior:'smooth', block:'nearest' }), 40);
  }

  function closeWorkspace(page) {
    const workspace = page.querySelector('.thaV358PathWorkspace');
    if (workspace) workspace.hidden = true;
    page.querySelectorAll('.thaV358Path>button,.thaV358ExistingChoices button').forEach(button => button.classList.remove('active'));
    routeNativeCards(page, 'none');
  }

  function buildStart(page) {
    if (page.dataset.v3583Built === 'true') return;
    const begin = page.querySelector('.thaV358Begin');
    if (!begin) return;
    page.querySelector('.thaV358FocusedSource')?.classList.add('thaV358LegacyStartHidden');
    page.querySelector('.thaV358Management')?.classList.add('thaV358LegacyStartHidden');
    begin.innerHTML = `<header class="thaV358BeginHeader"><div><h2>Choose your first step</h2></div><span class="thaV358StepCue">Select one</span></header><div class="thaV358Paths"><article class="thaV358Path blank"><span class="thaV358PathIcon">＋</span><h3>Start Blank</h3><p>New property or visit</p><button type="button" data-v3583-path="blank">Set up</button></article><article class="thaV358Path local"><span class="thaV358PathIcon">↻</span><h3>Continue Local</h3><p>Resume on this device</p><button type="button" data-v3583-path="local">Choose</button></article><article class="thaV358Path existing"><span class="thaV358PathIcon">⇩</span><h3>Use Existing Information</h3><p>Intake, Snapshot, or Drive</p><button type="button" data-v3583-path="existing">Choose</button></article></div>`;

    const workspace = document.createElement('section');
    workspace.className = 'thaV358PathWorkspace';
    workspace.hidden = true;
    workspace.innerHTML = `<header class="thaV358PathWorkspaceHeader"><div><h3 data-v3583-workspace-title>Start</h3><p data-v3583-workspace-copy></p></div><button type="button" class="thaV358PathWorkspaceClose">Close</button></header><div class="thaV358PathWorkspaceBody"><div class="thaV358ExistingChoices" hidden><button type="button" data-v3583-source="intake">Homeowner Intake</button><button type="button" data-v3583-source="snapshot">Prior Local Snapshot</button><button type="button" data-v3583-source="drive">Google Drive</button></div><div class="thaV358DriveRequirement" hidden></div><div class="thaV358PathHost"></div></div>`;
    begin.after(workspace);

    const statusKey = document.createElement('details');
    statusKey.className = 'thaV358StartStatusKey';
    statusKey.innerHTML = `<summary><span>Status key</span><span>Immediate · Near-Term · Monitor · Workflow</span></summary><div class="thaV358StatusItems"><span><i class="red"></i>Immediate — act now</span><span><i class="orange"></i>Near-Term — address next</span><span><i class="gold"></i>Monitor — watch for change</span><span><i class="violet"></i>Active planning / THA action</span><span><i class="green"></i>Routine care / reminder</span><span><i class="blue"></i>Reference / homeowner goal</span><span><i class="gray"></i>Parked / inactive</span></div>`;
    page.querySelector('.thaV358PropertyCard')?.after(statusKey);

    const more = document.createElement('details');
    more.className = 'thaV358MoreTools';
    more.innerHTML = `<summary><span>More tools</span><span>Backup · Advanced</span></summary><div class="thaV358MoreToolsBody"></div>`;
    workspace.after(more);

    begin.querySelectorAll('[data-v3583-path]').forEach(button => button.addEventListener('click', () => {
      const kind = button.dataset.v3583Path;
      if (kind === 'blank') nativeButton(/new blank local walkthrough/i)?.click();
      setWorkspace(page, kind);
    }));
    workspace.querySelectorAll('[data-v3583-source]').forEach(button => button.addEventListener('click', () => setWorkspace(page, 'existing', button.dataset.v3583Source)));
    workspace.querySelector('.thaV358PathWorkspaceClose')?.addEventListener('click', () => closeWorkspace(page));
    page.dataset.v3583Built = 'true';
    closeWorkspace(page);
  }

  function updateTrafficLabels(page) {
    const labels = page.querySelectorAll('.thaV358Traffic span');
    if (labels[0]) labels[0].textContent = 'Immediate';
    if (labels[1]) labels[1].textContent = 'Near-Term';
    if (labels[2]) labels[2].textContent = 'Monitor';
  }

  function addPmrDriveAction() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const header = pmr.querySelector(':scope > .pmrHeader');
    if (!header) return;
    let row = pmr.querySelector(':scope > .thaV358PmrDriveAction');
    if (!row) {
      row = document.createElement('div');
      row.className = 'thaV358PmrDriveAction noPrint';
      row.innerHTML = '<button type="button"></button>';
      header.after(row);
      row.querySelector('button')?.addEventListener('click', () => {
        if (driveConnected()) {
          nativeButton(/save drive package to drive/i)?.click();
          return;
        }
        localStorage.setItem(START_KEY, 'true');
        const start = document.querySelector('.thaV358StartNav');
        start?.click();
        setTimeout(() => {
          const page = document.querySelector('.thaV358StartPage');
          if (page) setWorkspace(page, 'existing', 'drive');
        }, 180);
      });
    }
    const button = row.querySelector('button');
    const connected = driveConnected();
    button.textContent = connected ? 'Save PMR Package to Drive' : 'Connect Drive on Start';
    button.classList.toggle('needsDrive', !connected);
  }

  function preparePassPackages() {
    document.querySelectorAll('.tha-v47-pass-packages').forEach(section => {
      if (section.dataset.v3583Prepared === 'true') return;
      const heading = section.querySelector('h2');
      if (!heading) return;
      heading.textContent = 'PASS Service Packages — Draft';
      const header = document.createElement('div');
      header.className = 'thaV358PackageHeader';
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Open draft ideas';
      heading.before(header);
      header.append(heading, button);
      section.classList.add('thaV358PackageCollapsed');
      button.addEventListener('click', () => {
        const collapsed = section.classList.toggle('thaV358PackageCollapsed');
        button.textContent = collapsed ? 'Open draft ideas' : 'Collapse';
      });
      const intro = section.querySelector('p');
      if (intro) intro.textContent = 'Future package concepts only; these service packages have not been finalized.';
      section.dataset.v3583Prepared = 'true';
    });
  }

  function movePassIndicatorsRight() {
    document.querySelectorAll('.passWorkspace .pmrBlock,.passWorkspace .passReviewPanel,.passWorkspace .passReviewCard,.passWorkspace .tha-v47-pass-packages,.passWorkspace .tha-clean-output-group,.passWorkspace .tha-pass-output-group').forEach(node => {
      const style = getComputedStyle(node);
      const width = parseFloat(style.borderLeftWidth || '0');
      const color = style.borderLeftColor || '';
      const green = /rgb\((50, 183, 107|82, 170, 75|143, 200, 133|106, 165, 111)\)/.test(color);
      if (width >= 4 && green) {
        node.style.setProperty('border-left-width', '1px', 'important');
        node.style.setProperty('border-right', `${Math.round(width)}px solid ${color}`, 'important');
      }
    });
  }

  function refreshOpenWorkspace(page) {
    const workspace = page.querySelector('.thaV358PathWorkspace');
    if (!workspace || workspace.hidden) {
      routeNativeCards(page, 'none');
      return;
    }
    const kind = workspace.dataset.kind || '';
    const subkind = workspace.dataset.subkind || '';
    if (kind === 'blank') routeNativeCards(page, 'blank');
    else if (kind === 'existing' && subkind) {
      routeNativeCards(page, subkind === 'snapshot' ? 'snapshot' : subkind);
      if (subkind === 'intake') {
        const requirement = page.querySelector('.thaV358DriveRequirement');
        const connected = driveConnected();
        requirement.hidden = false;
        requirement.classList.toggle('ready', connected);
        requirement.textContent = connected ? 'Drive connected — open the client folder, then import the completed Intake.' : 'Connect Google Drive first. The completed homeowner Intake is expected to come from the client’s Drive folder.';
      }
    }
    updateDriveCard(workspace);
  }

  function run() {
    installStyles();
    const page = document.querySelector('.thaV358StartPage');
    if (page) {
      buildStart(page);
      updateTrafficLabels(page);
      refreshOpenWorkspace(page);
    }
    addPmrDriveAction();
    preparePassPackages();
    movePassIndicatorsRight();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; run(); });
  }
  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 1800);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','open','disabled','value','checked'] });
})();
