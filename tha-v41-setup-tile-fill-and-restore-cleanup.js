(() => {
  const SCRIPT_ID = 'tha-v41-setup-tile-fill-and-restore-cleanup';
  const STYLE_ID = 'tha-v41-setup-tile-fill-and-restore-cleanup-styles';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.41 — Fill setup/Drive cards and keep restore import only in setup records. */
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{align-items:stretch!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup{min-height:340px!important;display:flex!important;flex-direction:column!important;gap:10px!important}

      .walkthroughControlsPanel .walkthroughSetupCard{justify-content:flex-start!important}
      .walkthroughControlsPanel .walkthroughSetupCard label{display:block!important;width:100%!important;max-width:none!important;margin:0!important;flex:1 1 auto!important}
      .walkthroughControlsPanel .walkthroughSetupCard input{display:block!important;width:100%!important;max-width:none!important;min-height:46px!important;border-radius:13px!important;font-size:15px!important;padding:10px 12px!important;background:#fff!important}
      .walkthroughControlsPanel .walkthroughSetupCard small{display:block!important;margin-top:4px!important;min-height:17px!important}

      .walkthroughControlsPanel .businessRecordsCard{justify-content:flex-start!important;gap:10px!important}
      .walkthroughControlsPanel .businessRecordsCard>.driveSetupGrid.drivePrimaryGrid,
      .walkthroughControlsPanel .businessRecordsCard>.driveSetupGrid{display:grid!important;visibility:visible!important;opacity:1!important;grid-template-columns:1fr!important;gap:10px!important;margin:6px 0 10px!important;max-height:none!important;overflow:visible!important}
      .walkthroughControlsPanel .businessRecordsCard .driveBrowserStatus,
      .walkthroughControlsPanel .businessRecordsCard .originCard{display:block!important;visibility:visible!important;opacity:1!important;border:1px solid #d8e4ea!important;border-radius:15px!important;background:#fbfdfe!important;padding:10px 12px!important;margin:0!important;box-shadow:none!important}
      .walkthroughControlsPanel .businessRecordsCard .driveBrowserStatus strong,
      .walkthroughControlsPanel .businessRecordsCard .originCard span{display:block!important;color:#0b3658!important;font-size:13px!important;font-weight:950!important;margin-bottom:3px!important}
      .walkthroughControlsPanel .businessRecordsCard .driveBrowserStatus span,
      .walkthroughControlsPanel .businessRecordsCard .originCard p{display:block!important;color:#40505f!important;font-size:12px!important;line-height:1.3!important;margin:3px 0!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions{margin-top:auto!important}
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions button,
      .walkthroughControlsPanel .businessRecordsCard .driveSetupActions a{min-height:48px!important}

      .walkthroughControlsPanel .homeownerIntakeSectionCard .tha-v38-restore-panel{display:block!important;visibility:visible!important}
      main .tha-v37-restore-panel,
      main .tha-v38-restore-panel[data-tha-v41-outside-setup='true'],
      body>.tha-v37-restore-panel,
      body>.tha-v38-restore-panel{display:none!important;visibility:hidden!important}

      @media(max-width:900px){
        .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup{min-height:0!important}
        .walkthroughControlsPanel .walkthroughSetupCard label{flex:0 1 auto!important}
      }
    `;
    document.head.append(style);
  }

  function fillWalkthroughSetupCard(panel) {
    const setup = panel.querySelector('.walkthroughSetupCard');
    if (!setup) return;
    setup.querySelectorAll('label').forEach(label => {
      label.classList.add('tha-v41-full-width-field');
      const input = label.querySelector('input,textarea,select');
      if (input) input.classList.add('tha-v41-full-width-input');
    });
  }

  function unhideUsefulDriveInfo(panel) {
    const business = panel.querySelector('.businessRecordsCard');
    if (!business) return;
    const grid = business.querySelector(':scope > .driveSetupGrid');
    if (grid) {
      grid.classList.add('drivePrimaryGrid');
      grid.removeAttribute('hidden');
      grid.removeAttribute('aria-hidden');
    }
    business.querySelectorAll('.driveBrowserStatus,.originCard').forEach(card => {
      card.removeAttribute('hidden');
      card.removeAttribute('aria-hidden');
    });
  }

  function removeDuplicateRestorePanels() {
    const setupPanel = document.querySelector('.walkthroughControlsPanel');
    document.querySelectorAll('.tha-v37-restore-panel').forEach(panel => panel.remove());
    document.querySelectorAll('.tha-v38-restore-panel').forEach(panel => {
      const insideSetup = setupPanel?.contains(panel);
      const insideHomeownerIntakeCard = Boolean(panel.closest('.homeownerIntakeSectionCard,.intakeImportCard'));
      if (!insideSetup || !insideHomeownerIntakeCard) {
        panel.setAttribute('data-tha-v41-outside-setup', 'true');
        panel.remove();
      }
    });
  }

  function removeBottomRestoreByText() {
    const setupPanel = document.querySelector('.walkthroughControlsPanel');
    document.querySelectorAll('main section, main article, main div').forEach(element => {
      if (setupPanel?.contains(element)) return;
      const text = textOf(element);
      if (/restore\s*\/\s*continue from drive backup json|import\s*\/\s*continue from drive backup json/i.test(text) && element.querySelector('input[type="file"]')) {
        element.remove();
      }
    });
  }

  function sync() {
    installStyles();
    const panel = document.querySelector('.walkthroughControlsPanel');
    if (panel) {
      fillWalkthroughSetupCard(panel);
      unhideUsefulDriveInfo(panel);
    }
    removeDuplicateRestorePanels();
    removeBottomRestoreByText();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  function start() {
    sync();
    window.setTimeout(sync, 300);
    window.setTimeout(sync, 1000);
    new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-hidden'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
