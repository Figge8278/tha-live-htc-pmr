const DEMO_FILE_URL = '/demo/THA-Snapshot-Demo-PMR-PMCP.json';
const DEMO_FILE_NAME = 'THA-Snapshot-Demo-PMR-PMCP-V3.57.4.json';

function addStyles() {
  if (document.getElementById('tha-demo-snapshot-download-styles')) return;
  const style = document.createElement('style');
  style.id = 'tha-demo-snapshot-download-styles';
  style.textContent = `
    .thaDemoSnapshotCard{margin:14px 0;padding:14px;border:2px solid #5f9fbd;border-radius:16px;background:#f3f9fd;color:#173e57}
    .thaDemoSnapshotCard strong,.thaDemoSnapshotCard span{display:block}
    .thaDemoSnapshotCard span{margin:5px 0 12px;color:#40505f}
    .thaDemoSnapshotLink{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border:0;border-radius:12px;background:#0b3658;color:#fff!important;font:inherit;font-weight:900;text-decoration:none;cursor:pointer}
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
    const response = await fetch(`${DEMO_FILE_URL}?v=3574`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Demo file could not be loaded.');
    const snapshot = await response.json();
    const stamp = new Date().toISOString();
    snapshot.appVersion = '3.57.4';
    snapshot.snapshotId = `snapshot-demo-pmr-pmcp-v3574-${Date.now()}`;
    snapshot.updatedAt = stamp;
    snapshot.data = snapshot.data || {};
    snapshot.data.walkthroughName = 'General Advocate Walkthrough — PMR + PMCP Demo';
    snapshot.data.client = { ...(snapshot.data.client || {}), date: 'July 28, 2026 — V3.57.4 Validation' };
    snapshot.data.intake = { ...(snapshot.data.intake || {}), gasService: 'Not applicable — all-electric demo property.' };
    snapshot.data.administration = {
      ...(snapshot.data.administration || {}),
      requiredHomeReferences: {
        electricalPanel: { value: snapshot.data.intake.electricalPanel || '', status: snapshot.data.intake.electricalPanel ? 'Recorded' : 'Not acknowledged' },
        waterShutoff: { value: snapshot.data.intake.waterShutoff || '', status: snapshot.data.intake.waterShutoff ? 'Recorded' : 'Not acknowledged' },
        gasService: { value: snapshot.data.intake.gasService, status: 'Not applicable acknowledged' }
      },
      externalReferences: { ...(snapshot.data.administration?.externalReferences || {}), validationBuild: '3.57.4' }
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
  card.innerHTML = '<strong>Round-trip restore demo — V3.57.4</strong><span>Downloads a uniquely dated General Advocate Walkthrough. Restore it below, confirm the connected counts, then edit and export. Demo packages file separately from real clients.</span><button type="button" class="thaDemoSnapshotLink">Download Prepared Demo Snapshot</button>';
  card.querySelector('button').addEventListener('click', event => downloadPreparedDemo(event.currentTarget));
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
