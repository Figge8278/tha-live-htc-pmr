(() => {
  const STYLE_ID = 'tha-v36-stability-cleanup-styles';
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .walkthroughControlsPanel{display:block!important;visibility:visible!important;opacity:1!important;max-width:1180px!important;margin:16px auto!important;padding:0 20px!important;overflow:visible!important}
      .walkthroughControlsPanel .workflowCueStrip,.walkthroughControlsPanel .homeownerOutputCard{display:none!important;visibility:hidden!important}
      .walkthroughControlsPanel .walkthroughControlsSummary{display:flex!important;visibility:visible!important;opacity:1!important}
      .walkthroughControlsPanel.collapsed .walkthroughControlsBody{display:none!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-areas:"setup intakeImport" "workSession businessRecords" "advanced advanced"!important;gap:16px!important;align-items:start!important}
      .walkthroughControlsPanel .walkthroughSetupCard,.walkthroughControlsPanel .tha-walkthrough-setup-card{grid-area:setup!important}
      .walkthroughControlsPanel .intakeImportCard,.walkthroughControlsPanel .homeownerIntakeSectionCard{grid-area:intakeImport!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important;display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;overflow:visible!important}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important;margin-top:2px!important}
      .businessRecordsCard>.driveSetupGrid,.businessRecordsCard>.driveMetaRow{display:none!important;visibility:hidden!important}
      .driveTroubleshooting .driveSetupGrid{display:grid!important;visibility:visible!important}
      .businessRecordsCard .driveSetupActions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin-top:10px!important;align-items:center!important}
      .businessRecordsCard .driveSetupActions button,.businessRecordsCard .driveSetupActions a{min-height:38px!important;border-radius:999px!important;font-weight:950!important}
      .businessRecordsCard .tha-drive-connect-needed{border:2px solid #d97706!important;background:#fffaf0!important;color:#8a4b08!important;box-shadow:0 0 0 4px rgba(217,119,6,.12)!important}
      .businessRecordsCard .tha-drive-connected{border:2px solid #1d4ed8!important;background:#eff6ff!important;color:#1e3a8a!important;box-shadow:0 0 0 4px rgba(37,99,235,.12)!important}
      .businessRecordsCard .tha-drive-save-primary{border:2px solid #16a34a!important;background:#f0fdf4!important;color:#166534!important;box-shadow:0 0 0 4px rgba(22,163,74,.08)!important}
      .businessRecordsCard .tha-drive-save-waiting{border:2px solid #cbd5e1!important;background:#fff!important;color:#475569!important;box-shadow:none!important}
      .businessRecordsCard .tha-drive-sync-attention{border:2px solid #eab308!important;background:#fefce8!important;color:#854d0e!important;box-shadow:0 0 0 4px rgba(234,179,8,.12)!important}
      .businessRecordsCard .tha-drive-open-folder{border:1px solid #93c5fd!important;background:#eff6ff!important;color:#1e3a8a!important}
      .businessRecordsCard .tha-drive-hidden-duplicate{display:none!important}
      .tha-drive-simple-guide{display:grid!important;gap:5px!important;margin-top:10px!important;padding:10px 11px!important;border:1px solid #d8e4ea!important;border-radius:13px!important;background:#fbfdfe!important;color:#315568!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important}
      .tha-drive-simple-guide.not-configured{border-color:#efb4a9!important;background:#fff5f3!important;color:#9f2c21!important}
      .tha-drive-simple-guide.not-connected{border-color:#efc17f!important;background:#fffaf0!important;color:#74460a!important}
      .tha-drive-simple-guide.connected{border-color:#bfdbfe!important;background:#eff6ff!important;color:#1e3a8a!important}
      .tha-drive-oauth-diagnostic,.tha-drive-failure-guidance{display:grid!important;gap:6px!important;margin-top:8px!important;padding:9px 10px!important;border-radius:12px!important;background:#fff!important;border:1px dashed #f0bd82!important;color:#74460a!important;font-size:11px!important;font-weight:850!important;line-height:1.35!important}
      .tha-drive-failure-guidance{border-style:solid!important;border-color:#f5b5ad!important;background:#fff7f6!important;color:#9f2c21!important}
      .tha-drive-oauth-diagnostic code,.tha-drive-failure-guidance code{display:block!important;white-space:normal!important;word-break:break-all!important;color:#173e57!important;background:#f8fafc!important;border-radius:8px!important;padding:6px!important}
      .tha-drive-oauth-diagnostic button,.tha-drive-failure-guidance button{width:max-content!important;border:1px solid #d97706!important;background:#fff7ed!important;color:#8a4b08!important;border-radius:999px!important;padding:6px 9px!important;font-size:11px!important;font-weight:950!important}
      .homeownerLane .tha-care-time-marker,.homeownerLane .tha-care-date-widget,.intakeSubsection>h3>.tha-care-time-marker{display:none!important;visibility:hidden!important}
      .demoScenarioCard,.releaseNoteInline,[data-tha-production-readiness],[data-tha-client-delivery-demo],[data-tha-drive-test-workflow],[data-tha-shared-drive-admin]{display:none!important}
      @media(max-width:900px){.walkthroughControlsPanel.expanded .walkthroughControlsBody{grid-template-columns:1fr!important;grid-template-areas:"setup" "intakeImport" "workSession" "businessRecords" "advanced"!important}.walkthroughControlsPanel{padding:0 12px!important}}
      @media print{.walkthroughControlsPanel{display:none!important}}
    `;
    document.head.append(style);
  }

  function copyOriginButtonHtml() {
    return '<button type="button" data-tha-copy-origin>Copy OAuth origin</button>';
  }

  function wireCopyOrigin(scope) {
    const copyButton = scope?.querySelector?.('[data-tha-copy-origin]');
    if (!copyButton || copyButton.dataset.wired) return;
    copyButton.dataset.wired = 'true';
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        copyButton.textContent = 'Copied';
        window.setTimeout(() => { copyButton.textContent = 'Copy OAuth origin'; }, 1500);
      } catch {
        window.prompt('Copy this OAuth origin:', window.location.origin);
      }
    });
  }

  function renameSetupHeadings(panel) {
    const headings = Array.from(panel.querySelectorAll('h2,h3'));
    const rename = (patterns, text) => {
      const found = headings.find(h => patterns.some(pattern => pattern.test(textOf(h))));
      if (found) found.textContent = text;
    };
    rename([/^Walkthrough Control Panel$/i, /^Walkthrough Setup & Records$/i], 'Walkthrough Setup & Records');
    rename([/^Walkthrough Info$/i, /^Walkthrough Setup$/i, /^1\. Walkthrough Setup$/i], '1. Walkthrough Setup');
    rename([/^Send \/ Import Homeowner Intake$/i, /^Homeowner Intake$/i, /^2\. Homeowner Intake$/i, /^3\. Homeowner Intake$/i], '2. Homeowner Intake');
    rename([/^Local Work \/ This Device$/i, /^Work Session$/i, /^2\. Work Session$/i, /^3\. Work Session$/i], '3. Work Session');
    rename([/^Drive \/ Business Records$/i, /^Business Records & Drive$/i, /^4\. Business Records & Drive$/i], '4. Business Records & Drive');
  }

  function setupDriveGuide(business) {
    const drivePill = business.querySelector('.drivePill');
    const connected = Boolean(drivePill?.classList.contains('connected'));
    const configured = !/drive is not configured|not configured/i.test(textOf(business));
    const buttons = Array.from(business.querySelectorAll('.driveSetupActions button,.driveSetupActions a'));
    let saveSeen = false;

    buttons.forEach(button => {
      const label = textOf(button).toLowerCase();
      button.classList.remove('tha-drive-connect-needed','tha-drive-connected','tha-drive-save-primary','tha-drive-save-waiting','tha-drive-sync-attention','tha-drive-open-folder','tha-drive-hidden-duplicate');
      if (/connect google drive|drive connected|connecting/.test(label)) {
        if (!connected && button.disabled && !/connecting/.test(label)) button.disabled = false;
        button.classList.add(connected ? 'tha-drive-connected' : 'tha-drive-connect-needed');
        return;
      }
      if (/save.*(drive|pmr).*package|save package|upload drive package/.test(label)) {
        if (saveSeen) button.classList.add('tha-drive-hidden-duplicate');
        else {
          saveSeen = true;
          button.classList.add(connected ? 'tha-drive-save-primary' : 'tha-drive-save-waiting');
        }
        return;
      }
      if (/sync pending photos|sync photos/.test(label)) button.classList.add('tha-drive-sync-attention');
      if (/open.*folder|last drive folder/.test(label)) button.classList.add('tha-drive-open-folder');
    });

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
      ? '<strong>Drive connected:</strong><span>Save the Drive package when the walkthrough is ready.</span>'
      : configured
        ? '<strong>Next:</strong><span>Click Connect Google Drive. Approve the Google popup, then save the Drive package.</span>'
        : '<strong>Drive setup needed:</strong><span>Open Advanced → Drive Setup Help / Troubleshooting, paste the OAuth Web Client ID, and authorize this origin.</span>';

    let diagnostic = business.querySelector('.tha-drive-oauth-diagnostic');
    if (!connected) {
      if (!diagnostic) {
        diagnostic = document.createElement('div');
        diagnostic.className = 'tha-drive-oauth-diagnostic';
        guide.after(diagnostic);
      }
      diagnostic.innerHTML = `<span>OAuth origin to authorize in Google Cloud:</span><code>${window.location.origin}</code>${copyOriginButtonHtml()}`;
      wireCopyOrigin(diagnostic);
    } else if (diagnostic) diagnostic.remove();
  }

  function driveFailureGuidanceText(errorText) {
    const lower = errorText.toLowerCase();
    if (/origin|mismatch|not allowed|unauthorized.*origin/.test(lower)) {
      return {
        title: 'Drive failed because Google does not authorize this app origin yet.',
        body: 'Add this exact origin under Google Cloud → APIs & Services → Credentials → OAuth 2.0 Web client → Authorized JavaScript origins.',
        showOrigin: true
      };
    }
    if (/missing client id|client id|not configured/.test(lower)) {
      return {
        title: 'Drive failed because the OAuth Web Client ID is missing for this browser/build.',
        body: 'Open Advanced → Drive Setup Help / Troubleshooting and paste the Google OAuth Web Client ID, or set VITE_GOOGLE_OAUTH_CLIENT_ID in Vercel and redeploy.',
        showOrigin: true
      };
    }
    if (/popup|canceled|cancelled|denied|access_denied/.test(lower)) {
      return {
        title: 'Drive failed because the Google popup was blocked, closed, or denied.',
        body: 'Allow popups for this app, click Connect Google Drive again, and approve the Google Drive permission prompt.',
        showOrigin: false
      };
    }
    if (/drive api|googleapis|api request/.test(lower)) {
      return {
        title: 'Drive failed after sign-in because the Drive API request did not complete.',
        body: 'Confirm the Google Drive API is enabled for the OAuth project and that the signed-in account granted Drive file access.',
        showOrigin: false
      };
    }
    return {
      title: 'Drive connection failed.',
      body: 'Use the technical details below to identify the blocker. The most common causes are OAuth origin mismatch, missing Client ID, popup blocked, or Drive API disabled.',
      showOrigin: true
    };
  }

  function enhanceDriveFailure(business) {
    const errorBox = Array.from(business.querySelectorAll('.driveErrorBox')).find(box => /drive|oauth|origin|client|popup|google/i.test(textOf(box)));
    const old = business.querySelector('.tha-drive-failure-guidance');
    if (!errorBox) {
      if (old) old.remove();
      return;
    }
    const message = textOf(errorBox);
    const guidance = driveFailureGuidanceText(message);
    let panel = old;
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'tha-drive-failure-guidance';
      errorBox.after(panel);
    }
    panel.innerHTML = `<strong>${guidance.title}</strong><span>${guidance.body}</span>${guidance.showOrigin ? `<code>${window.location.origin}</code>${copyOriginButtonHtml()}` : ''}`;
    wireCopyOrigin(panel);
  }

  function stabilizeTimingLabels(root = document) {
    root.querySelectorAll('.homeownerLane .tha-care-date-widget').forEach(widget => widget.remove());
    root.querySelectorAll('.tha-care-time-marker').forEach(marker => {
      marker.textContent = 'Time';
      marker.classList.remove('is-filled');
    });
  }

  function applyCleanup() {
    installStyles();
    try {
      if (localStorage.getItem(COLLAPSED_KEY) == null) localStorage.setItem(COLLAPSED_KEY, 'false');
    } catch {}
    const panel = document.querySelector('.walkthroughControlsPanel');
    if (panel) {
      panel.removeAttribute('hidden');
      const topbar = document.querySelector('.topbar');
      if (topbar && panel.previousElementSibling !== topbar) topbar.insertAdjacentElement('afterend', panel);
      panel.querySelector('.workflowCueStrip')?.setAttribute('hidden', 'true');
      panel.querySelector('.homeownerOutputCard')?.setAttribute('hidden', 'true');
      renameSetupHeadings(panel);
      const business = panel.querySelector('.businessRecordsCard');
      if (business) {
        setupDriveGuide(business);
        enhanceDriveFailure(business);
      }
    }
    stabilizeTimingLabels(document);
  }

  let scheduled = false;
  function scheduleCleanup() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyCleanup();
    });
  }

  function start() {
    applyCleanup();
    window.setTimeout(applyCleanup, 300);
    window.setTimeout(applyCleanup, 1000);
    new MutationObserver(scheduleCleanup).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded', 'disabled'] });
    document.addEventListener('input', scheduleCleanup);
    document.addEventListener('change', scheduleCleanup);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();