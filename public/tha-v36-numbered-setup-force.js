(() => {
  const STYLE_ID = 'tha-v36-numbered-setup-force-styles';
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .walkthroughControlsPanel{display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important;max-width:1180px!important;margin:16px auto!important;padding:0 20px!important}
      .walkthroughControlsPanel .walkthroughControlsHeader{display:flex!important;visibility:visible!important;opacity:1!important}
      .walkthroughControlsPanel .walkthroughControlsBody{display:grid!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody,.walkthroughControlsPanel.collapsed .walkthroughControlsBody{display:grid!important}
      .walkthroughControlsPanel .workflowCueStrip,.walkthroughControlsPanel .walkthroughControlsSummary,.walkthroughControlsPanel .homeownerOutputCard{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel .walkthroughControlsBody{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-areas:"setup intakeImport" "workSession businessRecords" "advanced advanced"!important;gap:16px!important;align-items:start!important}
      .walkthroughControlsPanel .walkthroughSetupCard,.walkthroughControlsPanel .tha-walkthrough-setup-card{grid-area:setup!important;display:block!important}
      .walkthroughControlsPanel .intakeImportCard,.walkthroughControlsPanel .homeownerIntakeSectionCard{grid-area:intakeImport!important;display:block!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important;display:block!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important;display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;overflow:visible!important}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important;margin-top:2px!important}
      .walkthroughControlsPanel .businessRecordsCard>.driveSetupGrid,.walkthroughControlsPanel .businessRecordsCard>.driveMetaRow{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel .driveTroubleshooting .driveSetupGrid{display:grid!important;visibility:visible!important}
      .walkthroughControlsPanel .driveSetupActions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin-top:10px!important;align-items:center!important}
      .walkthroughControlsPanel .driveSetupActions button,.walkthroughControlsPanel .driveSetupActions a{min-height:38px!important;border-radius:999px!important;font-weight:950!important}
      .walkthroughControlsPanel .tha-drive-connect-needed{border:2px solid #d97706!important;background:#fffaf0!important;color:#8a4b08!important;box-shadow:0 0 0 4px rgba(217,119,6,.12)!important}
      .walkthroughControlsPanel .tha-drive-connected{border:2px solid #1d4ed8!important;background:#eff6ff!important;color:#1e3a8a!important;box-shadow:0 0 0 4px rgba(37,99,235,.12)!important}
      .walkthroughControlsPanel .tha-drive-configured{border:2px solid #2563eb!important;background:#eff6ff!important;color:#1e3a8a!important}
      .walkthroughControlsPanel .tha-drive-sync-attention{border:2px solid #eab308!important;background:#fefce8!important;color:#854d0e!important;box-shadow:0 0 0 4px rgba(234,179,8,.12)!important}
      .walkthroughControlsPanel .tha-drive-save-primary{border:2px solid #16a34a!important;background:#f0fdf4!important;color:#166534!important;box-shadow:0 0 0 4px rgba(22,163,74,.08)!important}
      .walkthroughControlsPanel .tha-drive-save-waiting{border:2px solid #cbd5e1!important;background:#fff!important;color:#475569!important;box-shadow:none!important}
      .walkthroughControlsPanel .tha-drive-open-folder{border:1px solid #93c5fd!important;background:#eff6ff!important;color:#1e3a8a!important}
      .walkthroughControlsPanel .tha-drive-hidden-duplicate{display:none!important}
      .walkthroughControlsPanel .tha-drive-simple-guide{display:grid!important;gap:5px!important;margin-top:10px!important;padding:10px 11px!important;border:1px solid #d8e4ea!important;border-radius:13px!important;background:#fbfdfe!important;color:#315568!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important}
      .walkthroughControlsPanel .tha-drive-simple-guide.not-configured{border-color:#efb4a9!important;background:#fff5f3!important;color:#9f2c21!important}
      .walkthroughControlsPanel .tha-drive-simple-guide.not-connected{border-color:#efc17f!important;background:#fffaf0!important;color:#74460a!important}
      .walkthroughControlsPanel .tha-drive-simple-guide.connected{border-color:#bfdbfe!important;background:#eff6ff!important;color:#1e3a8a!important}
      .walkthroughControlsPanel .tha-drive-simple-guide strong{color:#173e57!important}
      .walkthroughControlsPanel .tha-drive-oauth-diagnostic{display:grid!important;gap:6px!important;margin-top:8px!important;padding:9px 10px!important;border-radius:12px!important;background:#fff!important;border:1px dashed #f0bd82!important;color:#74460a!important;font-size:11px!important;font-weight:850!important;line-height:1.35!important}
      .walkthroughControlsPanel .tha-drive-oauth-diagnostic code{display:block!important;white-space:normal!important;word-break:break-all!important;color:#173e57!important;background:#f8fafc!important;border-radius:8px!important;padding:6px!important}
      .walkthroughControlsPanel .tha-drive-oauth-diagnostic button{width:max-content!important;border:1px solid #d97706!important;background:#fff7ed!important;color:#8a4b08!important;border-radius:999px!important;padding:6px 9px!important;font-size:11px!important;font-weight:950!important}
      .walkthroughControlsPanel .driveSetupNote{display:block!important;margin-top:8px!important;padding:8px 10px!important;border-radius:11px!important;background:#fff7ed!important;border:1px solid #fed7aa!important;color:#9a3412!important;font-weight:850!important}
      .walkthroughControlsPanel .driveSetupNote.tha-drive-status-connected{background:#eff6ff!important;border-color:#bfdbfe!important;color:#1e3a8a!important}
      .walkthroughControlsPanel .advancedPanel>summary{font-size:13px!important;font-weight:950!important;color:#315568!important}
      .walkthroughControlsPanel .demoScenarioCard,.walkthroughControlsPanel .releaseNoteInline{display:none!important}
      .walkthroughControlsPanel [data-tha-production-readiness],.walkthroughControlsPanel [data-tha-client-delivery-demo],.walkthroughControlsPanel [data-tha-drive-test-workflow],.walkthroughControlsPanel [data-tha-shared-drive-admin]{display:none!important}
      @media(max-width:900px){.walkthroughControlsPanel .walkthroughControlsBody{grid-template-columns:1fr!important;grid-template-areas:"setup" "intakeImport" "workSession" "businessRecords" "advanced"!important}.walkthroughControlsPanel{padding:0 12px!important}}
      @media print{.walkthroughControlsPanel{display:none!important}}
    `;
    document.head.append(style);
  }

  function safeSetOpen() {
    try { localStorage.setItem(COLLAPSED_KEY, 'false'); } catch { /* Field helper only. */ }
  }

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function renameHeadings(panel) {
    const headings = Array.from(panel.querySelectorAll('h2,h3'));
    const rename = (patterns, text) => {
      const found = headings.find(h => patterns.some(re => re.test(h.textContent.trim())));
      if (found) found.textContent = text;
    };
    rename([/^Walkthrough Control Panel$/i, /^Walkthrough Setup & Records$/i], 'Walkthrough Setup & Records');
    rename([/^Walkthrough Info$/i, /^Walkthrough Setup$/i, /^1\. Walkthrough Setup$/i], '1. Walkthrough Setup');
    rename([/^Send \/ Import Homeowner Intake$/i, /^Homeowner Intake$/i, /^2\. Homeowner Intake$/i, /^3\. Homeowner Intake$/i], '2. Homeowner Intake');
    rename([/^Local Work \/ This Device$/i, /^1\. Local Work \/ This Device$/i, /^2\. Work Session$/i, /^Work Session$/i, /^3\. Work Session$/i], '3. Work Session');
    rename([/^Drive \/ Business Records$/i, /^3\. Drive \/ Business Records$/i, /^Business Records & Drive$/i, /^4\. Business Records & Drive$/i], '4. Business Records & Drive');
  }

  function classifyDriveActions(business) {
    const actions = Array.from(business.querySelectorAll('.driveSetupActions button,.driveSetupActions a'));
    const drivePill = business.querySelector('.drivePill');
    const connected = Boolean(drivePill?.classList.contains('connected'));
    const notConfigured = /drive is not configured|not configured/i.test(textOf(business));
    const configured = !notConfigured;
    let saveSeen = false;

    actions.forEach(node => {
      const label = textOf(node).toLowerCase();
      node.classList.remove('tha-drive-connect-needed','tha-drive-connected','tha-drive-configured','tha-drive-sync-attention','tha-drive-save-primary','tha-drive-save-waiting','tha-drive-open-folder','tha-drive-hidden-duplicate');

      if (/connect google drive|drive connected|connecting/.test(label)) {
        node.classList.add(connected ? 'tha-drive-connected' : 'tha-drive-connect-needed');
        if (!connected && node.disabled && !/connecting/i.test(label)) node.disabled = false;
        if (connected) node.title = 'Google Drive is connected for this browser session.';
        else if (!configured) node.title = 'Drive setup is missing. Click anyway to show the exact error, or open Advanced > Drive Setup Help / Troubleshooting and add the OAuth Web Client ID first.';
        else node.title = 'Click to open the Google authorization popup.';
        return;
      }

      if (/save.*(drive|pmr).*package|save package|upload drive package/.test(label)) {
        if (saveSeen) node.classList.add('tha-drive-hidden-duplicate');
        else {
          saveSeen = true;
          node.classList.add(connected ? 'tha-drive-save-primary' : 'tha-drive-save-waiting');
        }
        return;
      }

      if (/sync pending photos|sync photos/.test(label)) {
        node.classList.add('tha-drive-sync-attention');
        return;
      }

      if (/open.*folder|last drive folder/.test(label)) {
        node.classList.add('tha-drive-open-folder');
        return;
      }

      if (/configured|folder set|root folder|setup/.test(label)) node.classList.add('tha-drive-configured');
    });

    return { connected, configured };
  }

  function cleanDriveStatusText(business, connected) {
    const note = business.querySelector('.driveSetupNote');
    if (!note) return;
    note.classList.toggle('tha-drive-status-connected', connected);
    const current = textOf(note);
    if (connected) {
      note.textContent = 'Google Drive is connected for this session. You can save the Drive package.';
      return;
    }
    if (/connected|ready to export/i.test(current)) {
      note.textContent = 'Google Drive is configured, but not connected for this browser session yet. Click Connect Google Drive first.';
    }
  }

  function installOauthDiagnostic(business, configured, connected) {
    let diagnostic = business.querySelector('.tha-drive-oauth-diagnostic');
    if (connected) {
      if (diagnostic) diagnostic.remove();
      return;
    }
    if (!diagnostic) {
      diagnostic = document.createElement('div');
      diagnostic.className = 'tha-drive-oauth-diagnostic';
      const guide = business.querySelector('.tha-drive-simple-guide');
      if (guide) guide.after(diagnostic);
      else business.prepend(diagnostic);
    }
    const origin = window.location.origin;
    diagnostic.innerHTML = configured
      ? `<span>OAuth check: if the Google popup does not finish, this exact origin must be authorized in Google Cloud:</span><code>${origin}</code><button type="button" data-tha-copy-origin>Copy origin</button>`
      : `<span>OAuth setup needed: paste the Web application OAuth Client ID under Advanced → Drive Setup Help / Troubleshooting, and authorize this exact origin in Google Cloud:</span><code>${origin}</code><button type="button" data-tha-copy-origin>Copy origin</button>`;
    const copyButton = diagnostic.querySelector('[data-tha-copy-origin]');
    if (copyButton && !copyButton.dataset.wired) {
      copyButton.dataset.wired = 'true';
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.origin);
          copyButton.textContent = 'Copied';
          window.setTimeout(() => { copyButton.textContent = 'Copy origin'; }, 1600);
        } catch {
          window.prompt('Copy this origin into Google Cloud authorized JavaScript origins:', window.location.origin);
        }
      });
    }
  }

  function cleanBusinessRecordsCopy(panel) {
    const business = panel.querySelector('.businessRecordsCard');
    if (!business) return;

    const headerP = business.querySelector('.driveSetupHeader p');
    if (headerP) headerP.textContent = 'Use this only for the internal business package and Drive backup. Homeowner PMR delivery stays on the PMR screen.';

    const { connected, configured } = classifyDriveActions(business);

    let guide = business.querySelector('.tha-drive-simple-guide');
    if (!guide) {
      guide = document.createElement('div');
      guide.className = 'tha-drive-simple-guide';
      const header = business.querySelector('.driveSetupHeader');
      if (header) header.after(guide);
      else business.prepend(guide);
    }
    guide.classList.toggle('connected', connected);
    guide.classList.toggle('not-connected', !connected && configured);
    guide.classList.toggle('not-configured', !configured);
    guide.innerHTML = connected
      ? '<strong>Drive connected:</strong><span>Save the Drive package when the walkthrough is ready. Use Open Last Drive Folder after saving.</span>'
      : configured
        ? '<strong>Next:</strong><span>Click Connect Google Drive. Approve the Google popup, then save the Drive package.</span>'
        : '<strong>Drive setup needed:</strong><span>Open Advanced → Drive Setup Help / Troubleshooting, paste the OAuth Web Client ID, then click Connect Google Drive.</span>';

    installOauthDiagnostic(business, configured, connected);
    cleanDriveStatusText(business, connected);
  }

  function applySetupLayout() {
    safeSetOpen();
    installStyles();
    const panel = document.querySelector('.walkthroughControlsPanel');
    if (!panel) return;

    const topbar = document.querySelector('.topbar');
    if (topbar && panel.previousElementSibling !== topbar) topbar.insertAdjacentElement('afterend', panel);

    const openButton = panel.querySelector('.openControlsButton') || Array.from(panel.querySelectorAll('button')).find(button => /open setup|open controls|open/i.test(button.textContent || ''));
    if (panel.classList.contains('collapsed') && openButton) openButton.click();

    panel.classList.remove('collapsed');
    panel.classList.add('expanded');
    panel.removeAttribute('hidden');

    const cueStrip = panel.querySelector('.workflowCueStrip');
    if (cueStrip) cueStrip.setAttribute('hidden', 'true');

    const body = panel.querySelector('.walkthroughControlsBody');
    if (body) body.removeAttribute('hidden');

    const business = panel.querySelector('.businessRecordsCard');
    if (business) {
      business.classList.remove('tha-records-collapsed');
      business.classList.add('tha-records-expanded');
      business.removeAttribute('hidden');
    }

    const output = panel.querySelector('.homeownerOutputCard');
    if (output) output.setAttribute('hidden', 'true');

    renameHeadings(panel);
    cleanBusinessRecordsCopy(panel);
  }

  function start() {
    applySetupLayout();
    window.setTimeout(applySetupLayout, 250);
    window.setTimeout(applySetupLayout, 900);
  }

  safeSetOpen();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();