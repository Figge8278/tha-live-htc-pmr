(() => {
  const ID = 'tha-v3582-start-and-htc-polish';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };

  function styles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaV358Hero{display:none!important}
      .thaV358BeginHeader h2{font-size:21px!important}.thaV358BeginHeader p{font-size:11px!important}
      .thaV358Path{min-height:210px!important;padding:16px!important;box-shadow:0 5px 16px rgba(31,50,39,.05)!important}.thaV358Path.blank{background:linear-gradient(145deg,#fffdf8,#fff7e8)!important}.thaV358Path.local{background:linear-gradient(145deg,#fff,#eef5f9)!important}.thaV358Path.existing{background:linear-gradient(145deg,#fff,#eef8fd)!important}.thaV358PathNumber{position:absolute;right:13px;top:10px;color:rgba(23,63,44,.18);font-size:26px;font-weight:950}.thaV358Path p{min-height:0!important}.thaV358DriveSourceState{display:block;color:#60717c;font-size:9px;font-weight:850}
      .thaV358FocusedSource{border:1px solid #bfd4e1;border-radius:20px;background:#fff;overflow:hidden;box-shadow:0 8px 22px rgba(23,76,110,.07)}.thaV358FocusedSource[hidden]{display:none!important}.thaV358FocusedSourceHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;background:#eef7fb;border-bottom:1px solid #d4e4ec}.thaV358FocusedSourceHeader h3{margin:0;color:#174d70;font-size:16px}.thaV358FocusedSourceHeader p{margin:2px 0 0;color:#657680;font-size:10px}.thaV358FocusedSourceClose{border-radius:999px!important;background:#fff!important;color:#174d70!important;border:1px solid #c8dae5!important;padding:6px 10px!important;font-size:10px!important}.thaV358FocusedSourceHost{display:grid;gap:10px;padding:14px}.thaV358Parking{display:none!important}
      .thaV358FocusedSource .controlGroup,.thaV358FocusedSource .sessionCard,.thaV358FocusedSource .driveStatus,.thaV358FocusedSource .intakeImportCard,.thaV358FocusedSource .businessRecordsCard,.thaV358FocusedSource .thaSnapshotSourcePanel{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;box-sizing:border-box!important}
      .thaV358FocusedSource label,.thaV358FocusedSource input:not([type=checkbox]):not([type=radio]):not([type=file]),.thaV358FocusedSource select,.thaV358FocusedSource textarea,.thaV358FocusedSource [class*=Grid],.thaV358FocusedSource [class*=grid]{width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important}
      .thaV358FocusedSource .homeownerImportDetails{border:0!important;background:transparent!important;padding:0!important}.thaV358FocusedSource .homeownerImportDetails>summary{display:none!important}.thaV358FocusedSource .homeownerImportDetails>.lede,.thaV358FocusedSource .intakeImportHeader,.thaV358FocusedSource .clientIntakeWorkflowStep>div>p,.thaV358FocusedSource .secondaryPasteImport,.thaV358FocusedSource .sendClientIntakeStep .secondaryBtn{display:none!important}.thaV358FocusedSource .clientIntakeTwoColumnWorkflow{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.thaV358FocusedSource .clientIntakeWorkflowStep{min-width:0!important;padding:12px!important}.thaV358FocusedSource .clientIntakeWorkflowStep h3{margin:0 0 9px!important;font-size:14px!important}.thaV358FocusedSource .clientIntakeActionRow,.thaV358FocusedSource .importActions{display:flex!important;flex-wrap:wrap!important;gap:7px!important}.thaV358FocusedSource .clientIntakeActionRow>*{flex:1 1 170px}.thaV358FocusedSource .primaryImportFileBox{margin:0!important}
      .thaV358FocusedSource .snapshotSourceMetrics,.thaV358FocusedSource .snapshotSourceReviewCue,.thaV358FocusedSource .snapshotSourceConnections,.thaV358FocusedSource .snapshotSourceBackupSection,.thaV358FocusedSource .snapshotSourceLegacy{display:none!important}.thaV358FocusedSource .snapshotSourceCopy{margin:0 0 10px!important}.thaV358FocusedSource .snapshotSourceRestoreSection{margin:0!important}.thaV358FocusedSource .snapshotSourceImport{display:grid!important;place-items:center;min-height:64px!important}
      .thaV358FocusedSource .businessRecordsCard .driveActionHelp,.thaV358FocusedSource .businessRecordsCard .originCard,.thaV358FocusedSource .businessRecordsCard .driveBrowserStatus span:last-child,.thaV358FocusedSource .businessRecordsCard .driveMetaRow span:not(:first-child){display:none!important}.thaV358FocusedSource .businessRecordsCard .driveSetupGrid{grid-template-columns:1fr!important}.thaV358FocusedSource .businessRecordsCard .driveSetupActions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}.thaV358FocusedSource .businessRecordsCard .driveSetupActions>*{flex:1 1 170px;justify-content:center}
      .thaV358ManagementBody{gap:9px!important;padding:10px!important}.thaV358ManagerSection>summary{padding:11px 13px!important}.thaV358ManagementBody .walkthroughSetupCard>*{grid-column:1/-1!important}.thaV358ManagementBody .walkthroughSetupCard label{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important;justify-self:stretch!important}.thaV358ManagementBody .walkthroughSetupCard input{width:100%!important;max-width:none!important;min-width:0!important}.thaV358ManagementBody .walkthroughSetupCard{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important}
      .thaV358PromptFilters{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 11px}.thaV358PromptFilter{border:1px solid #cfdce3!important;border-radius:999px!important;background:#fff!important;color:#365365!important;padding:6px 9px!important;font-size:9px!important;font-weight:900!important}.thaV358PromptFilter.active{background:#0b3658!important;color:#fff!important;border-color:#0b3658!important}.thaV358PromptGroupChip{display:inline-flex;align-items:center;border-radius:999px;background:#edf3f6;color:#46606f;padding:3px 7px;font-size:8px;font-weight:900;white-space:nowrap}.checklistItemCard[data-v358-hidden=true]{display:none!important}.formPanel .thaV358SupportingHeading{font-size:18px!important}.checklistDetailPanel label[data-v358-field=photo-ref]{opacity:.78}
      @media(max-width:900px){.thaV358FocusedSource .clientIntakeTwoColumnWorkflow{grid-template-columns:1fr!important}}
    `;
    document.head.append(style);
  }

  function nativeButton(pattern, root = document) {
    return Array.from(root.querySelectorAll('button')).find(button => pattern.test(text(button.textContent)));
  }
  function nativeSelect(select, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(select, value); else select.value = value;
    select.dispatchEvent(new Event('input', { bubbles:true }));
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }
  function nativeLocalSelect() {
    return Array.from(document.querySelectorAll('select')).find(select => /saved local sessions/i.test(text(select.closest('label')?.textContent)));
  }
  function clickHtc() {
    localStorage.setItem('tha-v358-start-active', 'false');
    const button = Array.from(document.querySelectorAll('.topbar nav button')).find(item => /HTC/i.test(text(item.textContent)));
    button?.click();
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 60);
  }

  function resetRouting(page) {
    const source = page.querySelector('.thaV358FocusedSource');
    const host = source?.querySelector('.thaV358FocusedSourceHost');
    const intakeParking = page.querySelector('[data-v358-intake-parking]');
    const snapshotParking = page.querySelector('[data-v358-snapshot-parking]');
    const recordsHost = page.querySelector('[data-v358-records-host-default]');
    const intake = host?.querySelector('.intakeImportCard');
    const snapshot = host?.querySelector('.thaSnapshotSourcePanel');
    const records = host?.querySelector('.businessRecordsCard');
    host?.removeAttribute('data-v358-existing-host');
    host?.removeAttribute('data-v358-records-host');
    host?.classList.remove('thaSnapshotInformationSourceHost');
    intakeParking?.setAttribute('data-v358-existing-host', '');
    snapshotParking?.classList.add('thaSnapshotInformationSourceHost');
    recordsHost?.setAttribute('data-v358-records-host', '');
    if (intake && intakeParking) intakeParking.append(intake);
    if (snapshot && snapshotParking) snapshotParking.append(snapshot);
    if (records && recordsHost) recordsHost.append(records);
    if (source) { source.hidden = true; source.dataset.v358SourceKind = ''; }
  }

  function showSource(page, kind) {
    resetRouting(page);
    const source = page.querySelector('.thaV358FocusedSource');
    const host = source?.querySelector('.thaV358FocusedSourceHost');
    if (!source || !host) return;
    source.hidden = false;
    source.dataset.v358SourceKind = kind;
    const title = source.querySelector('[data-v358-source-title]');
    const copy = source.querySelector('[data-v358-source-copy]');
    if (kind === 'intake') {
      title.textContent = 'Homeowner Intake';
      copy.textContent = 'Send or import the client’s completed Intake.';
      page.querySelector('[data-v358-intake-parking]')?.removeAttribute('data-v358-existing-host');
      host.setAttribute('data-v358-existing-host', '');
      const card = document.querySelector('.intakeImportCard');
      if (card) host.append(card);
      const details = card?.querySelector('.homeownerImportDetails');
      if (details) details.open = true;
    } else if (kind === 'snapshot') {
      title.textContent = 'Prior Local Snapshot';
      copy.textContent = 'Choose a Snapshot file saved on this device.';
      page.querySelector('[data-v358-snapshot-parking]')?.classList.remove('thaSnapshotInformationSourceHost');
      host.classList.add('thaSnapshotInformationSourceHost');
      const panel = document.querySelector('.thaSnapshotSourcePanel');
      if (panel) host.append(panel);
      const heading = panel?.querySelector('.snapshotSourceHeading h4');
      if (heading) heading.textContent = 'Prior Local Snapshot';
      const label = panel?.querySelector('.snapshotSourceImport');
      if (label) label.childNodes[0].textContent = 'Choose Snapshot File';
    } else if (kind === 'drive') {
      title.textContent = 'Google Drive';
      copy.textContent = 'Connect Drive, open the client folder, or save the current package.';
      page.querySelector('[data-v358-records-host-default]')?.removeAttribute('data-v358-records-host');
      host.setAttribute('data-v358-records-host', '');
      const card = document.querySelector('.businessRecordsCard');
      if (card) host.append(card);
    }
    setTimeout(() => source.scrollIntoView({ behavior:'smooth', block:'start' }), 40);
  }

  function buildStart(page) {
    if (page.dataset.v3582Built === 'true') return;
    const setup = document.querySelector('.walkthroughSetupCard');
    const local = document.querySelector('.localWorkCard');
    const intake = document.querySelector('.intakeImportCard');
    const records = document.querySelector('.businessRecordsCard');
    const advanced = document.querySelector('.advancedPanel');
    const backup = document.querySelector('.localBackupRestore');
    const snapshot = document.querySelector('.thaSnapshotSourcePanel');

    page.querySelector('.thaV358Hero')?.remove();
    const begin = page.querySelector('.thaV358Begin');
    if (!begin) return;
    begin.innerHTML = `<header class="thaV358BeginHeader"><div><h2>Choose your first step</h2><p>Start fresh, resume local work, or bring existing information forward.</p></div><span class="thaV358StepCue">Select one</span></header><div class="thaV358Paths">
      <article class="thaV358Path blank"><span class="thaV358PathNumber">01</span><span class="thaV358PathIcon">＋</span><h3>Start a Blank Snapshot</h3><p>Begin a new property or visit.</p><button type="button" data-v358-start-blank>Start Blank</button></article>
      <article class="thaV358Path local"><span class="thaV358PathNumber">02</span><span class="thaV358PathIcon">↻</span><h3>Continue on This Device</h3><p>Resume a walkthrough saved in this browser.</p><select data-v358-local-select aria-label="Choose local walkthrough"><option value="">Choose local walkthrough</option></select><button type="button" data-v358-continue-local disabled>Continue</button></article>
      <article class="thaV358Path existing"><span class="thaV358PathNumber">03</span><span class="thaV358PathIcon">⇩</span><h3>Start With Existing Information</h3><p>Bring forward an Intake or an earlier Snapshot.</p><div class="thaV358SourceButtons"><button type="button" data-v358-intake>Homeowner Intake</button><button type="button" data-v358-snapshot>Prior Local Snapshot</button><button type="button" data-v358-drive>Google Drive</button></div><small class="thaV358DriveSourceState" data-v358-drive-source-state>Connect Drive first</small></article>
    </div>`;

    let source = page.querySelector('.thaV358FocusedSource');
    if (!source) {
      source = document.createElement('section');
      source.className = 'thaV358FocusedSource';
      source.hidden = true;
      source.innerHTML = `<header class="thaV358FocusedSourceHeader"><div><h3 data-v358-source-title>Existing Information</h3><p data-v358-source-copy></p></div><button type="button" class="thaV358FocusedSourceClose">Close</button></header><div class="thaV358FocusedSourceHost"></div>`;
      begin.after(source);
    }

    const manager = page.querySelector('.thaV358Management');
    if (manager) {
      manager.open = false;
      manager.innerHTML = `<summary><div><strong>Setup & Records</strong><small>Property, local backups, Drive, and advanced tools.</small></div><span>⌄</span></summary><div class="thaV358ManagementBody">
        <details class="thaV358ManagerSection" id="tha-v358-property"><summary><span>Property & Visit</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-property-host></div></details>
        <details class="thaV358ManagerSection" id="tha-v358-local"><summary><span>Local Sessions & Backup</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-local-host></div></details>
        <details class="thaV358ManagerSection" id="tha-v358-records"><summary><span>Google Drive & Records</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-records-host data-v358-records-host-default></div></details>
        <details class="thaV358ManagerSection" id="tha-v358-advanced"><summary><span>Advanced & Troubleshooting</span><span>⌄</span></summary><div class="thaV358ManagerHost" data-v358-advanced-host></div></details>
      </div><div class="thaV358Parking" data-v358-intake-parking data-v358-existing-host></div><div class="thaV358Parking thaSnapshotInformationSourceHost" data-v358-snapshot-parking></div>`;
    }

    page.querySelector('[data-v358-property-host]')?.append(setup || document.createTextNode(''));
    page.querySelector('[data-v358-local-host]')?.append(local || document.createTextNode(''));
    if (backup) page.querySelector('[data-v358-local-host]')?.append(backup);
    page.querySelector('[data-v358-intake-parking]')?.append(intake || document.createTextNode(''));
    page.querySelector('[data-v358-records-host-default]')?.append(records || document.createTextNode(''));
    page.querySelector('[data-v358-advanced-host]')?.append(advanced || document.createTextNode(''));
    page.querySelector('[data-v358-snapshot-parking]')?.append(snapshot || document.createTextNode(''));

    begin.querySelector('[data-v358-start-blank]')?.addEventListener('click', () => {
      nativeButton(/new blank local walkthrough/i)?.click();
      const managerNode = page.querySelector('.thaV358Management');
      const property = page.querySelector('#tha-v358-property');
      if (managerNode) managerNode.open = true;
      if (property) property.open = true;
      setTimeout(() => property?.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
    });
    begin.querySelector('[data-v358-local-select]')?.addEventListener('change', event => { begin.querySelector('[data-v358-continue-local]').disabled = !event.target.value; });
    begin.querySelector('[data-v358-continue-local]')?.addEventListener('click', () => {
      const id = begin.querySelector('[data-v358-local-select]')?.value || '';
      if (!id) return;
      const native = nativeLocalSelect();
      if (native) nativeSelect(native, id);
      setTimeout(clickHtc, 100);
    });
    begin.querySelector('[data-v358-intake]')?.addEventListener('click', () => showSource(page, 'intake'));
    begin.querySelector('[data-v358-snapshot]')?.addEventListener('click', () => showSource(page, 'snapshot'));
    begin.querySelector('[data-v358-drive]')?.addEventListener('click', () => showSource(page, 'drive'));
    source.querySelector('.thaV358FocusedSourceClose')?.addEventListener('click', () => resetRouting(page));
    page.dataset.v3582Built = 'true';
  }

  function updateStart(page) {
    const meta = object(read('tha-drive-meta', {}));
    const label = meta.lastFolderLink ? 'Drive records available' : meta.hasConnected ? 'Drive connected' : meta.lastError ? 'Open Drive setup' : 'Connect Drive first';
    const target = page.querySelector('[data-v358-drive-source-state]');
    if (target) target.textContent = label;
  }

  function promptGroup(card) {
    const value = text(card.textContent).toLowerCase();
    if (/(sink|faucet|drain|toilet|shower|tub|plumb|leak|moisture|water|supply line|disposal)/.test(value)) return 'Water & Moisture';
    if (/(outlet|switch|gfci|electrical|breaker|smoke|carbon monoxide|co detector|fire|safety)/.test(value)) return 'Power & Safety';
    if (/(hvac|vent|fan|airflow|thermostat|temperature|comfort|heating|cooling)/.test(value)) return 'Comfort & Air';
    if (/(window|door|wall|ceiling|floor|paint|trim|caulk|seal|surface|baseboard)/.test(value)) return 'Openings & Surfaces';
    if (/(cabinet|drawer|hinge|hardware|appliance|counter|fixture|railing|closet|shelf|lighting)/.test(value)) return 'Fixtures & Function';
    return 'Other';
  }
  function applyFilter(panel, group) {
    panel.dataset.v358PromptFilter = group;
    panel.querySelectorAll('.thaV358PromptFilter').forEach(button => button.classList.toggle('active', button.dataset.group === group));
    panel.querySelectorAll('.checklistItemCard').forEach(card => { card.dataset.v358Hidden = String(group !== 'All' && card.dataset.v358PromptGroup !== group); });
  }
  function setLabel(label, pattern, replacement, key) {
    if (!label || !pattern.test(text(label.textContent))) return;
    const node = Array.from(label.childNodes).find(child => child.nodeType === Node.TEXT_NODE && text(child.textContent));
    if (node) node.textContent = replacement;
    label.dataset.v358Field = key;
  }
  function polishHtc() {
    document.querySelectorAll('.formPanel').forEach(panel => {
      const toolbar = panel.querySelector('.checklistToolbar');
      if (!toolbar) return;
      const heading = toolbar.querySelector('.thaV358SupportingHeading');
      if (heading) heading.textContent = 'Optional Room Prompts';
      const copy = toolbar.querySelector('.lede');
      if (copy) copy.textContent = 'Use only the prompts that add useful detail beyond the Room Snapshot.';
      const toolbarButtons = toolbar.querySelectorAll('button');
      if (toolbarButtons[0]) toolbarButtons[0].textContent = 'Open Visible Prompts';
      if (toolbarButtons[1]) toolbarButtons[1].textContent = 'Close Visible Prompts';

      let filters = panel.querySelector(':scope > .thaV358PromptFilters');
      if (!filters) {
        filters = document.createElement('nav');
        filters.className = 'thaV358PromptFilters noPrint';
        ['All','Openings & Surfaces','Fixtures & Function','Water & Moisture','Power & Safety','Comfort & Air','Other'].forEach(group => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'thaV358PromptFilter';
          button.dataset.group = group;
          button.textContent = group;
          button.addEventListener('click', () => applyFilter(panel, group));
          filters.append(button);
        });
        toolbar.after(filters);
      }

      panel.querySelectorAll('.checklistItemCard').forEach(card => {
        const group = promptGroup(card);
        card.dataset.v358PromptGroup = group;
        const titleLine = card.querySelector('.checklistSummaryRow .itemTitleLine');
        let chip = titleLine?.querySelector('.thaV358PromptGroupChip');
        if (!chip && titleLine) { chip = document.createElement('span'); chip.className = 'thaV358PromptGroupChip'; titleLine.append(chip); }
        if (chip) chip.textContent = group;
        card.querySelectorAll('.checklistDetailPanel .inputs label').forEach(label => {
          setLabel(label, /^Status(?:\s|$)/i, 'Observation Status', 'status');
          setLabel(label, /^Action Certainty(?:\s|$)/i, 'Next-Step Clarity', 'certainty');
          setLabel(label, /^Suggested Trade \/ Resource(?:\s|$)/i, 'Likely Resource', 'resource');
          setLabel(label, /^Approx\. Time(?:\s|$)/i, 'Approx. Effort', 'effort');
          setLabel(label, /^Homeowner Pace(?:\s|$)/i, 'Homeowner Timing', 'pace');
          setLabel(label, /^Photo Ref(?:\s|$)/i, 'Photo Reference', 'photo-ref');
        });
      });
      applyFilter(panel, panel.dataset.v358PromptFilter || 'All');
    });
  }

  function run() {
    styles();
    const page = document.querySelector('.thaV358StartPage');
    if (page) { buildStart(page); updateStart(page); }
    polishHtc();
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
  setInterval(schedule, 1600);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','open','disabled','value'] });
})();
