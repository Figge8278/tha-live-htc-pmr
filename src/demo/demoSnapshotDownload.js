const DEMO_FILE_URL = '/demo/THA-Snapshot-Demo-PMR-PMCP.json';
const DEMO_FILE_NAME = 'THA-Snapshot-Demo-PMR-PMCP-V3.57.6.json';

function addStyles() {
  if (document.getElementById('tha-demo-snapshot-download-styles')) return;
  const style = document.createElement('style');
  style.id = 'tha-demo-snapshot-download-styles';
  style.textContent = `
    .thaDemoSnapshotCard{margin:10px 0;padding:12px;border:1px solid #b8d3e5;border-left:5px solid #287bb7;border-radius:13px;background:#f3f9fd;color:#173e57}
    .thaDemoSnapshotCard strong,.thaDemoSnapshotCard span{display:block}
    .thaDemoSnapshotCard span{margin:4px 0 9px;color:#40505f;font-size:11px;line-height:1.35}
    .thaDemoSnapshotLink{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 11px;border:0;border-radius:10px;background:#0b3658;color:#fff!important;font:inherit;font-size:12px;font-weight:900;text-decoration:none;cursor:pointer}
    .thaDemoSnapshotLink:focus,.thaDemoSnapshotLink:hover{background:#17496d}
  `;
  document.head.append(style);
}
function downloadJson(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
async function downloadPreparedDemo(button) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Preparing demo…';
  try {
    const response = await fetch(`${DEMO_FILE_URL}?v=3576`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Demo file could not be loaded.');
    const snapshot = await response.json();
    const stamp = new Date().toISOString();
    snapshot.appVersion = '3.57.6';
    snapshot.snapshotId = `snapshot-demo-pmr-pmcp-v3576-${Date.now()}`;
    snapshot.updatedAt = stamp;
    snapshot.data = snapshot.data || {};
    snapshot.data.walkthroughName = 'General Advocate Walkthrough — PMR + PMCP Demo';
    snapshot.data.client = { ...(snapshot.data.client || {}), date: 'July 28, 2026 — V3.57.6 Validation Source' };
    snapshot.data.intake = { ...(snapshot.data.intake || {}), gasService: 'Not applicable — all-electric demo property.' };
    snapshot.data.administration = {
      ...(snapshot.data.administration || {}),
      requiredHomeReferences: {
        electricalPanel: { value: snapshot.data.intake.electricalPanel || '', status: snapshot.data.intake.electricalPanel ? 'Recorded' : 'Not acknowledged' },
        waterShutoff: { value: snapshot.data.intake.waterShutoff || '', status: snapshot.data.intake.waterShutoff ? 'Recorded' : 'Not acknowledged' },
        gasService: { value: snapshot.data.intake.gasService, status: 'Not applicable acknowledged' }
      },
      externalReferences: { ...(snapshot.data.administration?.externalReferences || {}), validationBuild: '3.57.6' }
    };
    downloadJson(snapshot, DEMO_FILE_NAME);
    button.textContent = 'Demo downloaded';
  } catch (error) {
    window.location.href = DEMO_FILE_URL;
    button.textContent = 'Open demo file';
  } finally {
    window.setTimeout(() => { button.disabled = false; button.textContent = original; }, 1800);
  }
}
function demoCard() {
  const card = document.createElement('div');
  card.className = 'thaDemoSnapshotCard';
  card.dataset.thaDemoSnapshotCard = 'true';
  card.innerHTML = '<strong>Validation demo — V3.57.6</strong><span>Use this prepared prior Snapshot to test both restore choices: continue its original visit or create a new update dated today.</span><button type="button" class="thaDemoSnapshotLink">Download Prepared Demo Snapshot</button>';
  card.querySelector('button').addEventListener('click', event => downloadPreparedDemo(event.currentTarget));
  return card;
}
function ensureDemoDownload() {
  addStyles();
  const panel = document.querySelector('.thaSnapshotSourcePanel');
  if (!panel || panel.querySelector('[data-tha-demo-snapshot-card]')) return;
  const restore = panel.querySelector('.snapshotSourceRestoreSection');
  if (restore) restore.before(demoCard());
}
let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; ensureDemoDownload(); });
}
function start() {
  ensureDemoDownload();
  setTimeout(ensureDemoDownload, 400);
  setTimeout(ensureDemoDownload, 1200);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
