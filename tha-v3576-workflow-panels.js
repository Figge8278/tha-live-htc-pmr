(() => {
  const ID = 'tha-v3576-workflow-panels';
  const STYLE_ID = `${ID}-styles`;
  const SESSIONS = 'tha-walkthrough-sessions';
  const CURRENT = 'tha-current-walkthrough-id';
  const SIDECARS = 'tha-v357-snapshot-sidecars';
  const DRIVE_UI = 'tha-v3576-drive-ui-state';
  if (window[ID]) return;
  window[ID] = true;

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const text = value => String(value || '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const list = value => Array.isArray(value) ? value : [];
  const timeLabel = value => value ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body .walkthroughControlsPanel.expanded .walkthroughControlsBody{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        grid-template-areas:"workflowOne workflowTwo" "advanced advanced"!important;
        grid-template-rows:auto!important;
        align-items:start!important;
        gap:14px!important;
      }
      .thaWorkflowPanel{min-width:0;border:1px solid #d6e2e8;border-radius:19px;background:#f8fbfc;box-shadow:0 7px 18px rgba(13,44,73,.06);overflow:hidden}
      .thaWorkflowPanelOne{grid-area:workflowOne}.thaWorkflowPanelTwo{grid-area:workflowTwo}
      .thaWorkflowPanelHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:15px 16px 12px;border-bottom:1px solid #dbe5ea;background:#fff}
      .thaWorkflowPanelHeader h3{margin:0!important;color:#0b3658!important;font-size:19px!important;line-height:1.15!important}
      .thaWorkflowPanelHeader p{margin:4px 0 0!important;color:#53636d!important;font-size:12px!important;line-height:1.35!important}
      .thaWorkflowPanelNumber{display:grid;place-items:center;flex:0 0 31px;width:31px;height:31px;border-radius:999px;background:#0b3658;color:#fff;font-size:14px;font-weight:950}
      .thaWorkflowPanelSummary{display:flex;flex-wrap:wrap;gap:6px;padding:9px 16px;border-bottom:1px solid #e2e9ed;background:#f4f8fa}
      .thaWorkflowStatusChip{display:inline-flex;align-items:center;gap:4px;border:1px solid #d5e0e6;border-radius:999px;background:#fff;color:#53636d;padding:5px 8px;font-size:10px;font-weight:900}
      .thaWorkflowStatusChip.ready{border-color:#b9d9ad;background:#f2f9ef;color:#285c30}.thaWorkflowStatusChip.attention{border-color:#e5be65;background:#fff7df;color:#765713}.thaWorkflowStatusChip.info{border-color:#b6d3e6;background:#f1f8fc;color:#245f8a}
      .thaWorkflowPanelContent{display:grid;gap:11px;padding:12px}
      .thaWorkflowSubsection{display:grid;gap:9px;border:1px solid #dbe5ea;border-radius:15px;background:#fff;padding:11px}
      .thaWorkflowSubsectionHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      .thaWorkflowSubsectionHeader h4{margin:0;color:#0b3658;font-size:14px}.thaWorkflowSubsectionHeader p{margin:2px 0 0;color:#60717c;font-size:11px;line-height:1.3}
      .thaWorkflowPanel .controlGroup,.thaWorkflowPanel .sessionCard,.thaWorkflowPanel .intakeImportCard,.thaWorkflowPanel .businessRecordsCard{display:flex!important;flex-direction:column!important;width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;margin:0!important;align-self:start!important;box-shadow:none!important}
      .thaWorkflowPanel .controlGroupTitle,.thaWorkflowPanel .driveSetupHeader,.thaWorkflowPanel .intakeImportHeader{min-height:0!important;margin-bottom:8px!important;padding-bottom:8px!important}
      .thaWorkflowPanel .controlGroupTitle h3,.thaWorkflowPanel .driveSetupHeader h3,.thaWorkflowPanel .intakeImportHeader h2{font-size:14px!important}
      .thaWorkflowPanel .thaRequiredRefs{margin-top:10px!important}
      .thaCurrentWalkthroughHeader{margin:0 0 13px;border:1px solid #d5e0e6;border-left:7px solid #bf8420;border-radius:17px;background:#fff;padding:13px 15px;box-shadow:0 6px 16px rgba(13,44,73,.05)}
      .thaCurrentWalkthroughIdentity{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.thaCurrentWalkthroughIdentity h3{margin:0;color:#0b3658;font-size:18px}.thaCurrentWalkthroughIdentity p{margin:3px 0 0;color:#53636d;font-size:12px;font-weight:750}
      .thaCurrentVisitBadge{border:1px solid #b8d3e5;border-radius:999px;background:#f2f8fc;color:#245f8a;padding:6px 9px;font-size:10px;font-weight:950}
      .thaWorkflowProgress{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:10px}.thaWorkflowProgress span{border:1px solid #d5e0e6;border-radius:999px;background:#f7f9fa;color:#687781;padding:5px 8px;font-size:10px;font-weight:900}.thaWorkflowProgress span.ready{border-color:#b9d9ad;background:#f1f8ef;color:#285c30}.thaWorkflowProgress span.active{border-color:#b8d3e5;background:#edf6fc;color:#245f8a}.thaWorkflowProgress span.attention{border-color:#e5be65;background:#fff6db;color:#765713}
      .thaNextAction{margin-top:9px;border-left:4px solid #287bb7;border-radius:9px;background:#f2f8fc;color:#245f8a;padding:8px 10px;font-size:11px;font-weight:900}
      .thaLocalAutosaveState{display:flex;align-items:center;justify-content:space-between;gap:9px;border:1px solid #b8d3e5;border-radius:11px;background:#f2f8fc;padding:8px 10px;color:#245f8a;font-size:11px;font-weight:900}
      .thaRedundantLocalSave{display:none!important}
      .thaDriveStatusSummary{display:grid;gap:5px;border:1px solid #d6e2e8;border-radius:12px;background:#f7fafb;padding:9px 10px}.thaDriveStatusSummary strong{color:#0b3658;font-size:12px}.thaDriveStatusSummary span{color:#60717c;font-size:10px;line-height:1.35}
      .thaDriveStatusSummary.connected{border-color:#b9d9ad;background:#f2f9ef}.thaDriveStatusSummary.connected strong{color:#285c30}.thaDriveStatusSummary.failed{border-color:#df9d91;background:#fff3f1}.thaDriveStatusSummary.failed strong{color:#842218}
      .thaDriveUnavailable{opacity:.38!important;filter:grayscale(.45);pointer-events:none!important;cursor:not-allowed!important}.thaDriveUnavailable::after{content:'Connect Google Drive to enable';display:block}
      .thaSnapshotInformationSourceHost,.thaRecordStorageExtras{display:grid;gap:9px}
      .thaRecordStorageExtras .snapshotSourceBackupSection{margin:0;border:1px solid #d7e7dc;border-radius:12px;background:#f8fcf7;padding:10px}
      .thaPmrSourceField{position:relative;background:#fff7c7!important}.thaPmrSourceField .thaInlinePmrBadge{display:inline-flex;width:max-content;margin-bottom:5px;border:1px solid #d9b74a;border-radius:999px;background:#fffdf1;color:#715b0e;padding:3px 7px;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.04em}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important}
      @media(max-width:900px){body .walkthroughControlsPanel.expanded .walkthroughControlsBody{grid-template-columns:1fr!important;grid-template-areas:"workflowOne" "workflowTwo" "advanced"!important}.thaWorkflowPanelHeader{padding:13px}.thaWorkflowPanelContent{padding:10px}.thaCurrentWalkthroughHeader{padding:11px 12px}}
    `;
    document.head.append(style);
  }

  function session() {
    const sessions = read(SESSIONS, {});
    const id = localStorage.getItem(CURRENT) || '';
    return (id && sessions[id]?.data ? sessions[id] : null) || Object.values(sessions).filter(item => item?.data).sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }
  function sidecar(id) { return object(read(SIDECARS, {})[id]); }
  function meaningfulRoom(capture = {}) {
    return Boolean((capture.status && capture.status !== 'Unknown') || text(capture.note) || list(capture.photos).length || list(capture.items).length || capture.thaActionItem || capture.addToPmcpBuilder);
  }
  function acknowledgedRooms(data = {}) { return Object.values(object(data.roomCapture)).filter(meaningfulRoom).length; }
  function requiredRefs(data = {}) {
    const intake = object(data.intake);
    return [intake.electricalPanel, intake.waterShutoff, intake.gasService || intake.gasShutoff].filter(value => text(value)).length;
  }
  function intakeCount(data = {}) { return Object.values(object(data.intake)).filter(value => typeof value !== 'object' && text(value)).length; }
  function hasWalkthroughWork(data = {}) {
    return acknowledgedRooms(data) > 0 || Object.values(object(data.answers)).some(answer => answer && ((answer.status && answer.status !== 'Unknown') || text(answer.notes) || list(answer.photos).length));
  }

  function buildWorkflowPanel(kind, number, title, copy) {
    const panel = document.createElement('section');
    panel.className = `thaWorkflowPanel thaWorkflowPanel${kind}`;
    panel.innerHTML = `<header class="thaWorkflowPanelHeader"><div><h3>${number}. ${title}</h3><p>${copy}</p></div><span class="thaWorkflowPanelNumber">${number}</span></header><div class="thaWorkflowPanelSummary"></div><div class="thaWorkflowPanelContent"></div>`;
    return panel;
  }
  function subsection(title, copy, className) {
    const section = document.createElement('section');
    section.className = `thaWorkflowSubsection ${className}`;
    section.innerHTML = `<header class="thaWorkflowSubsectionHeader"><div><h4>${title}</h4><p>${copy}</p></div></header>`;
    return section;
  }
  function setHeading(card, value) {
    const heading = card?.querySelector(':scope > .controlGroupTitle h3,:scope > .driveSetupHeader h3,:scope > .intakeImportPanel .intakeImportHeader h2,h3,h2');
    if (heading && text(heading.textContent) !== value) heading.textContent = value;
  }
  function statusChip(label, tone = '') { return `<span class="thaWorkflowStatusChip ${tone}">${label}</span>`; }

  function ensureStructure() {
    installStyles();
    const root = document.querySelector('.walkthroughControlsPanel');
    const body = root?.querySelector('.walkthroughControlsBody');
    if (!root || !body) return null;
    body.dataset.thaTwoPanelWorkflow = 'true';
    document.documentElement.dataset.thaWorkflowV3576 = 'true';

    const setup = body.querySelector('.walkthroughSetupCard,.tha-walkthrough-setup-card,.sessionCard:not(.localWorkCard):not(.intakeImportLaunchCard)');
    const work = body.querySelector('.localWorkCard');
    const intake = body.querySelector('.intakeImportCard,.tha-import-in-controls');
    const records = body.querySelector('.businessRecordsCard');
    const advanced = body.querySelector('.advancedPanel');
    if (!setup || !work || !intake || !records) return null;

    let header = root.querySelector(':scope > .thaCurrentWalkthroughHeader');
    if (!header) { header = document.createElement('section'); header.className = 'thaCurrentWalkthroughHeader'; body.before(header); }
    let one = body.querySelector(':scope > .thaWorkflowPanelOne');
    if (!one) { one = buildWorkflowPanel('One', 1, 'Walkthrough & Work Session', 'Identify the property, then open or start the local working session.'); body.insertBefore(one, advanced || null); }
    let two = body.querySelector(':scope > .thaWorkflowPanelTwo');
    if (!two) { two = buildWorkflowPanel('Two', 2, 'Intake, Restore & Drive', 'Bring information into the walkthrough and save the complete record out.'); body.insertBefore(two, advanced || null); }

    const oneContent = one.querySelector('.thaWorkflowPanelContent');
    let identity = one.querySelector('.thaIdentitySubsection');
    if (!identity) { identity = subsection('Walkthrough identity', 'Client, property, visit date, and working-session type.', 'thaIdentitySubsection'); oneContent.append(identity); }
    let workSection = one.querySelector('.thaWorkSessionSubsection');
    if (!workSection) { workSection = subsection('Local work session', 'Autosave protects the active session on this device.', 'thaWorkSessionSubsection'); oneContent.append(workSection); }
    if (setup.parentElement !== identity) identity.append(setup);
    if (work.parentElement !== workSection) workSection.append(work);

    const twoContent = two.querySelector('.thaWorkflowPanelContent');
    let sources = two.querySelector('.thaInformationSourcesSubsection');
    if (!sources) { sources = subsection('Information sources', 'Homeowner Intake and prior Snapshots bring context into this walkthrough.', 'thaInformationSourcesSubsection'); twoContent.append(sources); }
    let sourceHost = sources.querySelector('.thaSnapshotInformationSourceHost');
    if (!sourceHost) { sourceHost = document.createElement('div'); sourceHost.className = 'thaSnapshotInformationSourceHost'; sources.append(sourceHost); }
    if (intake.parentElement !== sources) sources.insertBefore(intake, sourceHost);

    let storage = two.querySelector('.thaRecordStorageSubsection');
    if (!storage) { storage = subsection('Record storage', 'Google Drive stores the formal package; the backup Snapshot remains available without Drive.', 'thaRecordStorageSubsection'); twoContent.append(storage); }
    let storageExtras = storage.querySelector('.thaRecordStorageExtras');
    if (!storageExtras) { storageExtras = document.createElement('div'); storageExtras.className = 'thaRecordStorageExtras'; storage.append(storageExtras); }
    if (records.parentElement !== storage) storage.insertBefore(records, storageExtras);
    const backup = document.querySelector('.snapshotSourceBackupSection');
    if (backup && backup.parentElement !== storageExtras) storageExtras.append(backup);

    setHeading(setup, 'Walkthrough identity');
    setHeading(work, 'Work session on this device');
    setHeading(intake, 'Homeowner Intake');
    setHeading(records, 'Google Drive records');
    root.querySelector('.walkthroughControlsHeader h2')?.replaceChildren(document.createTextNode('Walkthrough Setup & Records'));
    const subhead = root.querySelector('.walkthroughControlsHeader p');
    if (subhead) subhead.textContent = 'Two clear stages: establish the active work session, then bring information in and save the record out.';

    const autosaveButton = Array.from(work.querySelectorAll('button')).find(button => /^\s*save local session\s*$/i.test(text(button.textContent)) || /^\s*save work session\s*$/i.test(text(button.textContent)));
    autosaveButton?.classList.add('thaRedundantLocalSave');
    let autosave = workSection.querySelector('.thaLocalAutosaveState');
    if (!autosave) { autosave = document.createElement('div'); autosave.className = 'thaLocalAutosaveState'; workSection.insertBefore(autosave, work); }
    autosave.innerHTML = '<span>✓ Autosaved on this device</span><small>Drive is a separate formal record save.</small>';

    return { root, body, header, one, two, setup, work, intake, records, sourceHost, storageExtras };
  }

  function findButton(records, pattern, exclude = '') {
    return Array.from(records?.querySelectorAll('button,a') || []).find(button => pattern.test(text(button.textContent)) && (!exclude || !button.matches(exclude)));
  }
  function driveState(records) {
    const save = findButton(records, /save (current record|drive package).*drive|save drive package/i, '.tha-drive-save-quick');
    const connect = findButton(records, /connect google drive|reconnect google drive|sign in.*drive/i);
    const recordsText = text(records?.textContent);
    const connected = Boolean((save && !save.disabled) || /drive connected|connected to google drive|google drive.*connected/i.test(recordsText));
    const state = read(DRIVE_UI, {});
    if (connected && !state.connectedAt) { state.connectedAt = new Date().toISOString(); write(DRIVE_UI, state); }
    return { save, connect, connected, state, recordsText };
  }
  function bindDriveActions(records) {
    Array.from(records?.querySelectorAll('button,a') || []).forEach(button => {
      if (button.dataset.thaDriveBound) return;
      const label = text(button.textContent);
      let action = '';
      if (/save (current record|drive package).*drive|save drive package/i.test(label)) action = 'save';
      else if (/open (last|latest).*drive folder|open.*drive folder/i.test(label)) action = 'open';
      else if (/sync.*photo|upload.*photo/i.test(label)) action = 'photos';
      else if (/connect google drive|reconnect google drive/i.test(label)) action = 'connect';
      if (!action) return;
      button.dataset.thaDriveBound = action;
      button.addEventListener('click', () => {
        const state = read(DRIVE_UI, {});
        const stamp = new Date().toISOString();
        if (action === 'save') { state.pendingSaveAt = stamp; state.lastError = ''; }
        if (action === 'open') state.lastOpenedAt = stamp;
        if (action === 'photos') state.lastPhotoActionAt = stamp;
        if (action === 'connect') state.connectRequestedAt = stamp;
        write(DRIVE_UI, state);
        setTimeout(schedule, 150);
        setTimeout(schedule, 1200);
        setTimeout(schedule, 3200);
      }, true);
    });
  }
  function syncDrive(records) {
    if (!records) return { connected: false, state: {} };
    bindDriveActions(records);
    const current = driveState(records);
    const dependent = Array.from(records.querySelectorAll('button,a')).filter(button => /save (current record|drive package).*drive|save drive package|open (last|latest).*drive folder|open.*drive folder|sync.*photo|upload.*photo/i.test(text(button.textContent)));
    dependent.forEach(button => {
      button.classList.toggle('thaDriveUnavailable', !current.connected);
      button.setAttribute('aria-disabled', String(!current.connected));
      if (!current.connected) button.title = 'Connect Google Drive to enable this action.';
    });

    const state = current.state;
    if (state.pendingSaveAt) {
      if (/error|failed|unable to save|upload failed/i.test(current.recordsText)) {
        state.lastError = 'Drive save failed or needs attention.';
        state.pendingSaveAt = '';
      } else if (/package saved|saved to drive|upload complete|successfully saved|drive package.*saved/i.test(current.recordsText)) {
        state.lastSavedAt = new Date().toISOString();
        state.pendingSaveAt = '';
        state.lastError = '';
      }
      write(DRIVE_UI, state);
    }

    let summary = records.parentElement?.querySelector(':scope > .thaDriveStatusSummary');
    if (!summary) { summary = document.createElement('div'); summary.className = 'thaDriveStatusSummary'; records.before(summary); }
    summary.classList.toggle('connected', current.connected && !state.lastError);
    summary.classList.toggle('failed', Boolean(state.lastError));
    const connectionText = current.connected ? '✓ Google Drive connected' : '○ Google Drive not connected';
    let detail = current.connected ? 'Drive actions are available.' : 'Connect Google Drive to enable package, folder, and photo-sync actions.';
    if (state.pendingSaveAt) detail = `Saving current record… started ${timeLabel(state.pendingSaveAt)}.`;
    else if (state.lastError) detail = state.lastError;
    else if (state.lastSavedAt) detail = `Current record last saved ${timeLabel(state.lastSavedAt)}.`;
    summary.innerHTML = `<strong>${connectionText}</strong><span>${detail}</span>`;
    return { connected: current.connected, state };
  }

  function addInlinePmrBadge(label, textValue = 'PMR source') {
    if (!label || label.querySelector(':scope > .thaInlinePmrBadge,.thaPmrSourceBadge')) return;
    const badge = document.createElement('span');
    badge.className = 'thaInlinePmrBadge';
    badge.textContent = textValue;
    label.prepend(badge);
  }
  function markPmrSources() {
    const intakePatterns = [/furnace filter/i,/fire extinguish/i,/smoke.*co/i,/irrigation.*shutoff|sprinkler.*controller/i];
    document.querySelectorAll('.intakePage label').forEach(label => {
      if (!intakePatterns.some(pattern => pattern.test(text(label.textContent)))) return;
      label.classList.add('thaPmrSourceField');
      addInlinePmrBadge(label);
    });
    const included = new Set(['Immediate Concern','Needs Attention','Monitor']);
    document.querySelectorAll('select').forEach(select => {
      if (!included.has(select.value)) return;
      const card = select.closest('.checklistItemCard,.checklistItem,.checklistRow,.questionCard,.roomChecklistCard,.itemCard,[data-item-id]');
      if (!card) return;
      const notes = card.querySelector('textarea');
      const label = notes?.closest('label') || notes?.parentElement;
      if (!label) return;
      label.classList.add('thaPmrSourceField');
      addInlinePmrBadge(label, 'PMR source wording');
    });
  }

  function refreshUi(parts) {
    const active = session();
    const data = object(active?.data);
    const client = object(data.client);
    const lineage = object(sidecar(active?.id).originalSnapshot?.data?.administration?.lineage || data.administration?.lineage);
    const rooms = acknowledgedRooms(data);
    const refs = requiredRefs(data);
    const sources = intakeCount(data);
    const drive = syncDrive(parts.records);

    const clientName = text(client.name) || 'Client not identified';
    const address = text(client.address) || 'Project address not identified';
    const date = text(client.date) || 'Visit date not identified';
    const type = text(data.walkthroughName || active?.name) || 'Working-session type not identified';
    const lineageText = lineage.mode === 'new-update'
      ? `New update based on ${lineage.sourceWalkthroughDate || 'a prior Snapshot'}`
      : lineage.mode === 'continue-original'
        ? `Continuing the original ${lineage.sourceWalkthroughDate || 'walkthrough'}`
        : 'Current local working session';
    parts.header.innerHTML = `<div class="thaCurrentWalkthroughIdentity"><div><h3>${clientName} · ${address}</h3><p>${type} · ${lineageText}</p></div><span class="thaCurrentVisitBadge">Current visit: ${date}</span></div><div class="thaWorkflowProgress"></div><div class="thaNextAction"></div>`;

    const identityReady = Boolean(text(client.name) && text(client.address) && text(client.date));
    const sourceReady = sources > 0 || Boolean(sidecar(active?.id).originalSnapshot);
    const walkthroughReady = hasWalkthroughWork(data);
    const reviewReady = refs === 3;
    const savedReady = Boolean(drive.state.lastSavedAt);
    const progress = parts.header.querySelector('.thaWorkflowProgress');
    progress.innerHTML = [
      ['Setup', identityReady],
      ['Sources', sourceReady],
      [`Walkthrough · ${rooms} area${rooms === 1 ? '' : 's'} acknowledged`, walkthroughReady],
      ['Review', reviewReady],
      ['Drive save', savedReady]
    ].map(([label, ready], index) => `<span class="${ready ? 'ready' : index === 0 || (index === 1 && identityReady) || (index === 2 && sourceReady) || (index === 3 && walkthroughReady) || (index === 4 && reviewReady) ? 'active' : ''}">${ready ? '✓ ' : ''}${label}</span>`).join('');

    let next = 'Next: identify the client, project address, and current visit date.';
    if (identityReady && !sourceReady) next = 'Next: import Homeowner Intake, load a prior Snapshot, or continue with field observations.';
    else if (identityReady && sourceReady && !walkthroughReady) next = 'Next: acknowledge the first room overview or record a meaningful finding.';
    else if (walkthroughReady && refs < 3) next = `Next: confirm ${3 - refs} required need-to-know home reference${3 - refs === 1 ? '' : 's'}.`;
    else if (reviewReady && !drive.connected) next = 'Next: connect Google Drive when you are ready to file the formal record.';
    else if (drive.connected && !savedReady) next = 'Next: save the current record to Drive.';
    else if (savedReady) next = `Drive record saved ${timeLabel(drive.state.lastSavedAt)}. Continue editing or create the next dated package when ready.`;
    parts.header.querySelector('.thaNextAction').textContent = next;

    parts.one.querySelector('.thaWorkflowPanelSummary').innerHTML = `${statusChip(identityReady ? 'Property identified' : 'Identity needs attention', identityReady ? 'ready' : 'attention')}${statusChip(active ? 'Autosave active on this device' : 'No active session', active ? 'info' : 'attention')}${statusChip(`${rooms} room/area overview${rooms === 1 ? '' : 's'} acknowledged`, rooms ? 'ready' : '')}`;
    parts.two.querySelector('.thaWorkflowPanelSummary').innerHTML = `${statusChip(sources ? `Intake · ${sources} recorded field${sources === 1 ? '' : 's'}` : 'Intake not imported', sources ? 'ready' : '')}${statusChip(sidecar(active?.id).originalSnapshot ? 'Snapshot source loaded' : 'No prior Snapshot loaded', sidecar(active?.id).originalSnapshot ? 'ready' : '')}${statusChip(drive.connected ? 'Drive connected' : 'Drive disconnected', drive.connected ? 'ready' : 'attention')}`;
    markPmrSources();
  }

  let scheduled = false;
  function run() {
    scheduled = false;
    const parts = ensureStructure();
    if (parts) refreshUi(parts);
  }
  function schedule() { if (scheduled) return; scheduled = true; requestAnimationFrame(run); }
  function start() {
    schedule();
    setTimeout(schedule, 300);
    setTimeout(schedule, 1000);
    setInterval(schedule, 2500);
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','disabled','value','open'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
