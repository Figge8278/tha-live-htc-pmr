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

      /* Keep top setup compact: details belong inside the appropriate panel. */
      .walkthroughControlsPanel .walkthroughControlsSummary,.walkthroughControlsPanel .workflowCueStrip{display:none!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary{display:flex!important;justify-content:flex-end!important;padding:0!important;background:transparent!important;border:0!important;min-height:0!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary>*:not(.openControlsButton){display:none!important}
      .walkthroughControlsPanel.collapsed .openControlsButton{display:inline-flex!important;align-items:center;justify-content:center}
      .walkthroughControlsPanel .homeownerOutputCard{display:none!important}
      .walkthroughControlsPanel .localWorkCard .controlGroupTitle h3,.walkthroughControlsPanel .businessRecordsCard h3{margin-bottom:2px}
      .walkthroughControlsPanel .intakeImportLaunchCard{order:2}
      .walkthroughControlsPanel .localWorkCard{order:3}
      .walkthroughControlsPanel .businessRecordsCard{order:4}
      .walkthroughControlsPanel .intakeImportLaunchCard .controlGroupTitle{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      .walkthroughControlsPanel .intakeImportLaunchCard .controlGroupTitle p{margin:3px 0 0}
      .walkthroughControlsPanel .tha-open-intake-import{border:1px solid #c8d8e1;border-radius:10px;background:#fff;color:#163f58;padding:8px 10px;font-size:12px;font-weight:900;white-space:nowrap}

      /* Business records stay available without occupying the page. */
      .walkthroughControlsPanel .businessRecordsCard.tha-records-collapsed>:not(.driveSetupHeader){display:none!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader{display:flex!important;align-items:center!important;gap:12px!important}
      .walkthroughControlsPanel .tha-records-toggle{margin-left:auto;border:1px solid #c8d8e1;border-radius:10px;background:#fff;color:#163f58;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}

      /* Homeowner deliverables live on the PMR page, not in the setup panel. */
      .pmr .tha-pmr-deliverable-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0 18px;padding:10px 12px;border:1px solid #d5e0e6;border-radius:12px;background:#f7fbfd}
      .pmr .tha-pmr-deliverable-actions strong{margin-right:auto;color:#173e57;font-size:13px}
      .pmr .tha-pmr-deliverable-actions button{display:inline-flex;align-items:center;gap:6px;border:1px solid #aebfca;border-radius:10px;background:#fff;color:#153e59;padding:8px 10px;font-size:12px;font-weight:900}
      .pmr .tha-pmr-deliverable-actions button:disabled{opacity:.48;cursor:not-allowed}
      @media(max-width:900px){
        .walkthroughControlsPanel .tha-records-toggle,.walkthroughControlsPanel .tha-open-intake-import{width:100%;margin-left:0}
        .walkthroughControlsPanel .businessRecordsCard .driveSetupHeader{align-items:flex-start!important;flex-wrap:wrap}
        .walkthroughControlsPanel .intakeImportLaunchCard .controlGroupTitle{align-items:flex-start;flex-wrap:wrap}
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

  function openIntakeImport() {
    const intakeButton = Array.from(document.querySelectorAll('.topbar nav button')).find(button => /\bintake\b/i.test(button.textContent));
    intakeButton?.click();
    window.setTimeout(() => {
      const panel = document.querySelector('.intakeImportPanel');
      if (!panel) return;
      const toggle = panel.querySelector('.tha-import-toggle');
      if (toggle && /expand/i.test(toggle.textContent)) toggle.click();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  function addImportLaunchCard(panel) {
    const body = panel.querySelector('.walkthroughControlsBody');
    if (!body || body.querySelector('.intakeImportLaunchCard')) return;
    const card = document.createElement('section');
    card.className = 'controlGroup sessionCard intakeImportLaunchCard';
    card.setAttribute('aria-label', 'Import Completed Intake');
    const title = document.createElement('div');
    title.className = 'controlGroupTitle';
    const copy = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = '2. Import a Completed Intake';
    const description = document.createElement('p');
    description.textContent = 'Bring in a homeowner-completed intake, review its mapped answers, then apply it to this walkthrough.';
    copy.append(heading, description);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tha-open-intake-import';
    button.textContent = 'Open intake import';
    button.addEventListener('click', openIntakeImport);
    title.append(copy, button);
    card.append(title);
    const firstAfterSetup = body.querySelector('.localWorkCard') || body.firstElementChild?.nextElementSibling;
    body.insertBefore(card, firstAfterSetup || null);
  }

  function simplifyControls() {
    document.querySelectorAll('.walkthroughControlsPanel').forEach(panel => {
      const heading = panel.querySelector('.walkthroughControlsHeader h2');
      const subhead = panel.querySelector('.walkthroughControlsHeader p');
      if (heading) heading.textContent = 'Walkthrough Setup & Records';
      if (subhead) subhead.textContent = panel.classList.contains('collapsed')
        ? 'Open only when you need setup, intake-import, session, or record tools.'
        : 'Set up the walkthrough, import intake context, manage the working session, and save internal records.';

      panel.querySelectorAll('.openControlsButton').forEach(button => { button.textContent = 'Open setup & records'; });
      panel.querySelectorAll('.walkthroughControlsHeader > button').forEach(button => {
        if (/hide controls/i.test(button.textContent)) button.textContent = 'Collapse';
      });

      renameHeading(panel, 'Walkthrough Info', '1. Walkthrough Setup');
      renameHeading(panel, 'Walkthrough Setup', '1. Walkthrough Setup');
      renameHeading(panel, '1. Local Work / This Device', '3. Work Session');
      renameHeading(panel, 'Work Session', '3. Work Session');
      renameHeading(panel, '3. Drive / Business Records', '4. Business Records & Drive');
      renameHeading(panel, 'Business Records & Drive', '4. Business Records & Drive');
      addImportLaunchCard(panel);

      const records = panel.querySelector('.businessRecordsCard');
      const recordsHeader = records?.querySelector('.driveSetupHeader');
      const recordsTitle = recordsHeader?.querySelector('h3');
      const recordsCopy = recordsHeader?.querySelector('p');
      if (recordsTitle) recordsTitle.textContent = '4. Business Records & Drive';
      if (recordsCopy) recordsCopy.textContent = 'Internal archive, editable copies, photos, and recovery backup.';
      if (records && !records.querySelector('.tha-records-toggle')) {
        const toggle = document.createElement('button');
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
        recordsHeader?.append(toggle);
      }
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
