const DEMO_FILE_URL = '/demo/THA-Snapshot-Demo-PMR-PMCP.json';
const DEMO_FILE_NAME = 'THA-Snapshot-Demo-PMR-PMCP.json';

function addStyles() {
  if (document.getElementById('tha-demo-snapshot-download-styles')) return;
  const style = document.createElement('style');
  style.id = 'tha-demo-snapshot-download-styles';
  style.textContent = `
    .thaDemoSnapshotCard{margin:14px 0;padding:14px;border:2px solid #5f9fbd;border-radius:16px;background:#f3f9fd;color:#173e57}
    .thaDemoSnapshotCard strong,.thaDemoSnapshotCard span{display:block}
    .thaDemoSnapshotCard span{margin:5px 0 12px;color:#40505f}
    .thaDemoSnapshotLink{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border-radius:12px;background:#0b3658;color:#fff!important;font-weight:900;text-decoration:none}
    .thaDemoSnapshotLink:focus,.thaDemoSnapshotLink:hover{background:#17496d}
  `;
  document.head.append(style);
}

function demoCard() {
  const card = document.createElement('div');
  card.className = 'thaDemoSnapshotCard';
  card.dataset.thaDemoSnapshotCard = 'true';
  card.innerHTML = `<strong>Round-trip restore demo</strong><span>1. Download this prepared Snapshot. 2. Tap “Restore Snapshot JSON” directly below and choose the downloaded file. The app will reload the restored work session.</span><a class="thaDemoSnapshotLink" href="${DEMO_FILE_URL}" download="${DEMO_FILE_NAME}">Download Demo Snapshot JSON</a>`;
  return card;
}

function ensureDemoDownload() {
  addStyles();
  const panel = document.querySelector('.thaSnapshotSourcePanel');
  if (!panel || panel.querySelector('[data-tha-demo-snapshot-card]')) return;
  const actions = panel.querySelector('.snapshotSourceActions');
  if (actions) actions.before(demoCard());
}

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    ensureDemoDownload();
  });
}

function start() {
  ensureDemoDownload();
  setTimeout(ensureDemoDownload, 400);
  setTimeout(ensureDemoDownload, 1200);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
