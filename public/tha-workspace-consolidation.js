(() => {
  function installStyles() {
    if (document.getElementById('tha-workspace-consolidation-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-workspace-consolidation-styles';
    style.textContent = `
      /* Homeowner Quick Intake: keep every compact question left-aligned. */
      .homeownerLane .tha-quick-header{justify-content:flex-start!important;text-align:left!important}
      .homeownerLane .tha-quick-title{flex:1!important;justify-items:start!important;text-align:left!important}
      .homeownerLane .tha-quick-title strong,.homeownerLane .tha-quick-title small{display:block!important;width:100%!important;text-align:left!important;justify-self:start!important}
      .homeownerLane .tha-quick-action{margin-left:auto!important}

      /* Walkthrough setup: 1/2 across, 3/4 beneath. */
      .walkthroughControlsPanel .walkthroughControlsSummary,.walkthroughControlsPanel .workflowCueStrip{display:none!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary{display:flex!important;justify-content:flex-end!important;padding:0!important;background:transparent!important;border:0!important;min-height:0!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary>*:not(.openControlsButton){display:none!important}
      .walkthroughControlsPanel.collapsed .openControlsButton{display:inline-flex!important;align-items:center;justify-content:center}
      .walkthroughControlsPanel .homeownerOutputCard{display:none!important}
      .walkthroughControlsPanel .walkthroughControlsBody{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-areas:"setup workSession" "intakeImport businessRecords" "advanced advanced"!important;align-items:start!important;gap:16px!important}
      .walkthroughControlsPanel .tha-walkthrough-setup-card{grid-area:setup!important}
      .walkthroughControlsPanel .intakeImportCard.tha-import-in-controls{grid-area:intakeImport!important;margin:0!important;align-self:start!important}
      .walkthroughControlsPanel .intakeImportCard .homeownerImportDetails{margin-top:10px!important}
      .walkthroughControlsPanel .homeownerImportDetails>summary{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:12px 14px!important;border:1px solid #d7c4ef!important;border-radius:12px!important;background:#fff!important;color:#4e3470!important;font-weight:900!important;cursor:pointer!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important}
      .walkthroughControlsPanel .localWorkCard .controlGroupTitle h3,.walkthroughControlsPanel .businessRecordsCard h3{margin-bottom:2px}
      .walkthroughControlsPanel .intakeImportCard.tha-import-in-controls .intakeImportHeader{margin-bottom:0!important}
      .walkthroughControlsPanel .intakeImportCard.tha-import-in-controls h2{font-size:inherit!important}
      .walkthroughControlsPanel .tha-autosave-note{margin:7px 0 0;padding:8px 10px;border-left:3px solid #287bb7;border-radius:8px;background:#f5fafc;color:#496470;font-size:12px;font-weight:700;line-height:1.35}
      .walkthroughControlsPanel .tha-autosave-note strong{color:#173e57}

      /* Business records stay available without occupying the page. */
      .walkthroughControlsPanel .businessRecordsCard.tha-records-collapsed>:not(.driveSetupHeader){display:none!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}
      .walkthroughControlsPanel .tha-records-toggle,.walkthroughControlsPanel .tha-drive-save-quick{border:1px solid #c8d8e1;border-radius:10px;background:#fff;color:#163f58;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}
      .walkthroughControlsPanel .tha-records-toggle{margin-left:auto}
      .walkthroughControlsPanel .tha-drive-save-quick{border-color:#9ec9a4;background:#f4fbf4;color:#285d30}
      .walkthroughControlsPanel .tha-drive-save-quick:hover{background:#e8f6e9;border-color:#70aa78}

      /* Homeowner deliverables live on the PMR page, not in the setup panel. */
      .pmr .tha-pmr-deliverable-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0 18px;padding:10px 12px;border:1px solid #d5e0e6;border-radius:12px;background:#f7fbfd}
      .pmr .tha-pmr-deliverable-actions strong{margin-right:auto;color:#173e57;font-size:13px}
      .pmr .tha-pmr-deliverable-actions button{display:inline-flex;align-items:center;gap:6px;border:1px solid #aebfca;border-radius:10px;background:#fff;color:#153e59;padding:8px 10px;font-size:12px;font-weight:900}
      .pmr .tha-pmr-deliverable-actions button:disabled{opacity:.48;cursor:not-allowed}
      @media(max-width:900px){
        .walkthroughControlsPanel .walkthroughControlsBody{grid-template-columns:1fr!important;grid-template-areas:"setup" "workSession" "intakeImport" "businessRecords" "advanced"!important}
        .walkthroughControlsPanel .tha-records-toggle,.walkthroughControlsPanel .tha-drive-save-quick{width:100%;margin-left:0}
        .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader{align-items:flex-start!important;flex-wrap:wrap}
        .pmr .tha-pmr-deliverable-actions{justify-content:stretch}
        .pmr .tha-pmr-deliverable-actions strong{width:100%;margin-right:0}
        .pmr .tha-pmr-deliverable-actions button{flex:1;justify-content:center}
      }
    `;
    document.head.append(style);
  }

  function renameHeading(root, current, replacement) {
    Array.from(root.querySelectorAll('h2,h3')).forEach(heading => {
      if (heading.textContent.trim() === current) heading.textContent = replacement;
    });
  }

  function arrangeImportPanel(body, setup) {
    const importPanel = document.querySelector('.intakeImportPanel');
    if (!importPanel || !body) return;
    const importCard = importPanel.closest('.intakeImportCard') || importPanel;
    importCard.classList.add('tha-import-in-controls');
    const heading = importPanel.querySelector('.intakeImportHeader h2');
    if (heading) heading.textContent = 'Send / Import Homeowner Intake';
    body.querySelector('.intakeImportLaunchCard')?.remove();
    const workSession = body.querySelector('.localWorkCard');
    const anchor = workSession || setup;
    if (importCard.parentElement !== body || importCard.previousElementSibling !== anchor) {
      body.insertBefore(importCard, anchor?.nextElementSibling || body.firstChild);
    }
  }

  function addAutosaveNote(workSession) {
    const title = workSession?.querySelector('.controlGroupTitle');
    if (!title || title.querySelector('.tha-autosave-note')) return;
    const note = document.createElement('p');
    note.className = 'tha-autosave-note';
    note.innerHTML = '<strong>Autosave:</strong> this device only. Drive is a separate business-record save.';
    title.append(note);
  }

  function originalDriveSaveButton(records) {
    return Array.from(records?.querySelectorAll('button') || []).find(button => /save drive package to drive/i.test(button.textContent));
  }

  function originalDriveConnectButton(records) {
    return Array.from(records?.querySelectorAll('button') || []).find(button => /connect google drive/i.test(button.textContent));
  }

  function openRecordPanel(records, toggle) {
    if (!records?.classList.contains('tha-records-collapsed')) return;
    records.classList.remove('tha-records-collapsed');
    if (toggle) {
      toggle.textContent = 'Collapse records';
      toggle.setAttribute('aria-expanded', 'true');
    }
  }

  function addDriveSaveQuickAction(records, recordsHeader, toggle) {
    if (!records || !recordsHeader) return;
    let quick = recordsHeader.querySelector('.tha-drive-save-quick');
    if (!quick) {
      quick = document.createElement('button');
      quick.type = 'button';
      quick.className = 'tha-drive-save-quick';
      quick.textContent = 'Save Drive Package to Drive';
      quick.addEventListener('click', () => {
        openRecordPanel(records, toggle);
        window.setTimeout(() => {
          const save = originalDriveSaveButton(records);
          if (save && !save.disabled) {
            save.click();
            return;
          }
          const connect = originalDriveConnectButton(records);
          connect?.focus();
        }, 0);
      });
      recordsHeader.append(quick);
    }
    const source = originalDriveSaveButton(records);
    quick.title = source?.disabled
      ? 'Connect Google Drive first. This opens the Drive panel and takes you to the connection step.'
      : 'Save the current business record package to Google Drive.';
  }

  function simplifyControls() {
    document.querySelectorAll('.walkthroughControlsPanel').forEach(panel => {
      const heading = panel.querySelector('.walkthroughControlsHeader h2');
      const subhead = panel.querySelector('.walkthroughControlsHeader p');
      if (heading) heading.textContent = 'Walkthrough Setup & Records';
      if (subhead) subhead.textContent = panel.classList.contains('collapsed')
        ? 'Open only when you need setup, work-session, intake-import, or record tools.'
        : 'Set up the walkthrough, manage the working session, import intake context, and save internal records.';

      panel.querySelectorAll('.openControlsButton').forEach(button => { button.textContent = 'Open setup & records'; });
      panel.querySelectorAll('.walkthroughControlsHeader > button').forEach(button => {
        if (/hide controls/i.test(button.textContent)) button.textContent = 'Collapse';
      });

      renameHeading(panel, 'Walkthrough Info', '1. Walkthrough Setup');
      renameHeading(panel, 'Walkthrough Setup', '1. Walkthrough Setup');
      renameHeading(panel, '1. Local Work / This Device', '2. Work Session');
      renameHeading(panel, 'Local Work / This Device', '2. Work Session');
      renameHeading(panel, '3. Work Session', '2. Work Session');
      renameHeading(panel, 'Work Session', '2. Work Session');
      renameHeading(panel, '3. Drive / Business Records', '4. Business Records & Drive');
      renameHeading(panel, 'Business Records & Drive', '4. Business Records & Drive');

      const body = panel.querySelector('.walkthroughControlsBody');
      const setup = body?.querySelector('.sessionCard:not(.localWorkCard):not(.intakeImportLaunchCard)');
      setup?.classList.add('tha-walkthrough-setup-card');
      arrangeImportPanel(body, setup);
      const workSession = panel.querySelector('.localWorkCard');
      addAutosaveNote(workSession);

      const records = panel.querySelector('.businessRecordsCard');
      const recordsHeader = records?.querySelector('.driveSetupHeader');
      const recordsTitle = recordsHeader?.querySelector('h3');
      const recordsCopy = recordsHeader?.querySelector('p');
      if (recordsTitle) recordsTitle.textContent = '4. Business Records & Drive';
      if (recordsCopy) recordsCopy.textContent = 'Connect Drive and save the current business package here. Autosave remains local to this browser.';
      let toggle = recordsHeader?.querySelector('.tha-records-toggle');
      if (records && recordsHeader && !toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'tha-records-toggle';
        toggle.textContent = 'Open records';
        toggle.setAttribute('aria-expanded', 'false');
        records.classList.add('tha-records-collapsed');
        toggle.addEventListener('click', () => {
          const opening = records.classList.contains('tha-records-collapsed');
          records.classList.toggle('tha-records-collapsed', !opening);
          toggle.textContent = opening ? 'Collapse records' : 'Open records';
          toggle.setAttribute('aria-expanded', String(opening));
        });
        recordsHeader.append(toggle);
      }
      addDriveSaveQuickAction(records, recordsHeader, toggle);
    });
  }

  function originalOutputButtons() {
    const panel = document.querySelector('.homeownerOutputCard');
    if (!panel) return {};
    return {
      download: Array.from(panel.querySelectorAll('button')).find(button => /download pmr/i.test(button.textContent)),
      print: Array.from(panel.querySelectorAll('button')).find(button => /print pmr/i.test(button.textContent))
    };
  }

  function makeActionButton(label, sourceButton) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => sourceButton?.click());
    return button;
  }

  function placePMRActions() {
    const { download, print } = originalOutputButtons();
    document.querySelectorAll('.pmr').forEach(pmr => {
      let bar = pmr.querySelector('.tha-pmr-deliverable-actions');
      if (!bar) {
        bar = document.createElement('section');
        bar.className = 'tha-pmr-deliverable-actions noPrint';
        bar.setAttribute('aria-label', 'PMR homeowner deliverables');
        const title = document.createElement('strong');
        title.textContent = 'Homeowner PMR';
        bar.append(title, makeActionButton('Download PMR', download), makeActionButton('Print PMR', print));
        const header = pmr.querySelector('.pmrHeader');
        header?.after(bar);
      }
      const buttons = Array.from(bar.querySelectorAll('button'));
      const downloadButton = buttons.find(button => /download pmr/i.test(button.textContent));
      const printButton = buttons.find(button => /print pmr/i.test(button.textContent));
      if (downloadButton) downloadButton.disabled = Boolean(download?.disabled);
      if (printButton) printButton.disabled = Boolean(print?.disabled);
    });
  }

  function run() {
    installStyles();
    simplifyControls();
    placePMRActions();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
