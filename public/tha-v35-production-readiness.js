(() => {
  const STYLE_ID = 'tha-v35-production-readiness-styles';
  const PANEL_ATTR = 'data-tha-production-readiness';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-production-readiness{margin:14px 0!important;padding:14px!important;border:1px solid #b7d8e5!important;border-radius:18px!important;background:#f8fbfd!important;color:#173e57!important;box-shadow:inset 6px 0 0 rgba(21,87,153,.18)!important;display:grid!important;gap:12px!important}
      .tha-production-readiness h3{margin:0!important;font-size:15px!important;color:#173e57!important;line-height:1.25!important}
      .tha-production-readiness p{margin:0!important;font-size:12px!important;line-height:1.45!important;color:#4d6570!important;font-weight:760!important}
      .tha-prod-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:10px!important}
      .tha-prod-card{border:1px solid #d3e2ea!important;border-radius:14px!important;background:#fff!important;padding:10px!important;display:grid!important;gap:7px!important}
      .tha-prod-card h4{margin:0!important;font-size:13px!important;color:#1d4f66!important;line-height:1.25!important}
      .tha-prod-card ul{margin:0 0 0 18px!important;padding:0!important;color:#526b76!important;font-size:12px!important;line-height:1.38!important;font-weight:780!important}
      .tha-prod-card li{margin:3px 0!important}
      .tha-prod-pill{display:inline-flex!important;width:max-content!important;max-width:100%!important;border:1px solid #d9e6ed!important;border-radius:999px!important;background:#fff!important;color:#436474!important;padding:5px 8px!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.03em!important}
      .tha-prod-pill.green{border-color:#a8d5a1!important;background:#f2fbf0!important;color:#285c30!important}
      .tha-prod-pill.orange{border-color:#f2c094!important;background:#fff4e8!important;color:#a85107!important}
      .tha-prod-pill.blue{border-color:#a9cfff!important;background:#f2f8ff!important;color:#155799!important}
      .tha-prod-callout{border:1px dashed #bad6e2!important;border-radius:14px!important;background:#fff!important;padding:10px!important;color:#3f5d69!important;font-size:12px!important;font-weight:820!important;line-height:1.4!important}
      .tha-prod-callout strong{color:#173e57!important}
      @media(print){.tha-production-readiness{display:none!important}}
    `;
    document.head.append(style);
  }

  function panelHtml() {
    return `
      <section class="tha-production-readiness" ${PANEL_ATTR}="true">
        <header>
          <span class="tha-prod-pill blue">Production readiness</span>
          <h3>Stable Field URL + Media Plan</h3>
          <p>This is the clean field-use target: one stable app URL, one Drive authorization setup, simple photo capture, and careful video handling so the app does not get overloaded.</p>
        </header>
        <div class="tha-prod-grid">
          <article class="tha-prod-card">
            <span class="tha-prod-pill green">Best next setup</span>
            <h4>Use one stable app URL</h4>
            <ul>
              <li>Recommended: <strong>app.thehomeowneradvocate.com</strong> or <strong>pmr.thehomeowneradvocate.com</strong>.</li>
              <li>Use that URL for field tablets, office computers, Google Drive auth, and bookmarked testing.</li>
              <li>Stop using changing Vercel preview URLs for field work once the stable URL is live.</li>
            </ul>
          </article>
          <article class="tha-prod-card">
            <span class="tha-prod-pill orange">Admin only</span>
            <h4>Drive OAuth setup</h4>
            <ul>
              <li>Add the stable app URL as the Google OAuth authorized origin.</li>
              <li>Keep the Google OAuth Client ID in Vercel as <strong>VITE_GOOGLE_OAUTH_CLIENT_ID</strong>.</li>
              <li>After that, field users only see: Connect Drive → Connected.</li>
            </ul>
          </article>
          <article class="tha-prod-card">
            <span class="tha-prod-pill green">Photos now</span>
            <h4>Photo workflow</h4>
            <ul>
              <li>Capture overview, close-up, and context photos by room.</li>
              <li>Store photos locally when offline; sync to Drive when connected.</li>
              <li>Use Drive package export for client electronic folders.</li>
            </ul>
          </article>
          <article class="tha-prod-card">
            <span class="tha-prod-pill orange">Video later</span>
            <h4>Video workflow recommendation</h4>
            <ul>
              <li>Do not store full videos inside the walkthrough save.</li>
              <li>Use short clips only: 10–30 seconds for motion/noise/water flow issues.</li>
              <li>Upload videos directly to Drive media folders, then keep a lightweight link/note in the PMR.</li>
            </ul>
          </article>
        </div>
        <p class="tha-prod-callout"><strong>Field rule:</strong> photos belong in the app workflow now. Videos should be a Drive-linked media add-on, not part of the normal local walkthrough save. That keeps tablet performance stable and still gives clients richer documentation when needed.</p>
      </section>`;
  }

  function placePanel() {
    const anchor = document.querySelector('[data-tha-drive-test-workflow]') || document.querySelector('.walkthroughControlsPanel .businessRecordsCard') || document.querySelector('.walkthroughControlsPanel') || document.querySelector('main');
    if (!anchor || document.querySelector(`[${PANEL_ATTR}]`)) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = panelHtml();
    anchor.after(wrapper.firstElementChild);
  }

  function render() {
    installStyles();
    placePanel();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      render();
      window.setTimeout(render, 160);
    });
  }

  function start() {
    render();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();