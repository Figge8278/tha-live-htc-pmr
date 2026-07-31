(() => {
  const STYLE_ID = 'tha-workspace-consolidation-styles';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .homeownerLane .tha-quick-header{justify-content:flex-start!important;text-align:left!important}
      .homeownerLane .tha-quick-title{flex:1!important;justify-items:start!important;text-align:left!important}
      .homeownerLane .tha-quick-title strong,.homeownerLane .tha-quick-title small{display:block!important;width:100%!important;text-align:left!important;justify-self:start!important}
      .homeownerLane .tha-quick-action{margin-left:auto!important}

      .walkthroughControlsPanel .walkthroughControlsSummary,.walkthroughControlsPanel .workflowCueStrip{display:none!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary{display:flex!important;justify-content:flex-end!important;padding:0!important;background:transparent!important;border:0!important;min-height:0!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsSummary>*:not(.openControlsButton){display:none!important}
      .walkthroughControlsPanel.collapsed .openControlsButton{display:inline-flex!important;align-items:center;justify-content:center}
      .walkthroughControlsPanel .homeownerOutputCard{display:none!important}
      .walkthroughControlsPanel .homeownerImportDetails>summary{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:12px 14px!important;border:1px solid #d7c4ef!important;border-radius:12px!important;background:#fff!important;color:#4e3470!important;font-weight:900!important;cursor:pointer!important}
      .walkthroughControlsPanel .tha-autosave-note{margin:7px 0 0;padding:8px 10px;border-left:3px solid #287bb7;border-radius:8px;background:#f5fafc;color:#496470;font-size:12px;font-weight:700;line-height:1.35}
      .walkthroughControlsPanel .tha-autosave-note strong{color:#173e57}

      .pmr .tha-pmr-deliverable-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0 18px;padding:10px 12px;border:1px solid #d5e0e6;border-radius:12px;background:#f7fbfd}
      .pmr .tha-pmr-deliverable-actions strong{margin-right:auto;color:#173e57;font-size:13px}
      .pmr .tha-pmr-deliverable-actions button{display:inline-flex;align-items:center;gap:6px;border:1px solid #aebfca;border-radius:10px;background:#fff;color:#153e59;padding:8px 10px;font-size:12px;font-weight:900}
      .pmr .tha-pmr-deliverable-actions button:disabled{opacity:.48;cursor:not-allowed}
      @media(max-width:900px){
        .pmr .tha-pmr-deliverable-actions{justify-content:stretch}
        .pmr .tha-pmr-deliverable-actions strong{width:100%;margin-right:0}
        .pmr .tha-pmr-deliverable-actions button{flex:1;justify-content:center}
      }
    `;
    document.head.append(style);
  }

  function addAutosaveNote(workSession) {
    const title = workSession?.querySelector('.controlGroupTitle');
    if (!title || title.querySelector('.tha-autosave-note')) return;
    const note = document.createElement('p');
    note.className = 'tha-autosave-note';
    note.innerHTML = '<strong>Autosave:</strong> this device only. Google Drive is a separate formal record save.';
    title.append(note);
  }

  function prepareControls() {
    document.querySelectorAll('.walkthroughControlsPanel').forEach(panel => {
      const heading = panel.querySelector('.walkthroughControlsHeader h2');
      const subhead = panel.querySelector('.walkthroughControlsHeader p');
      if (heading) heading.textContent = 'Walkthrough Setup & Records';
      if (subhead && document.documentElement.dataset.thaWorkflowV3576 !== 'true') {
        subhead.textContent = panel.classList.contains('collapsed')
          ? 'Open setup, information-source, and record-storage tools.'
          : 'Establish the active walkthrough, bring information in, and save the formal record out.';
      }
      panel.querySelectorAll('.openControlsButton').forEach(button => { button.textContent = 'Open setup & records'; });
      panel.querySelectorAll('.walkthroughControlsHeader > button').forEach(button => {
        if (/hide controls/i.test(button.textContent)) button.textContent = 'Collapse';
      });
      addAutosaveNote(panel.querySelector('.localWorkCard'));
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
        pmr.querySelector('.pmrHeader')?.after(bar);
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
    prepareControls();
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
