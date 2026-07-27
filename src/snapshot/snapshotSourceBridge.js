import {
  THA_SNAPSHOT_FILE_NAME,
  createSnapshotDocument,
  snapshotToWalkthroughData,
  validateSnapshotDocument
} from './snapshotSchema.js';
import './snapshotSource.css';

const SESSION_KEY = 'tha-walkthrough-sessions';
const CURRENT_ID_KEY = 'tha-current-walkthrough-id';
const PENDING_RESTORE_KEY = 'tha-v357-pending-snapshot-restore';
const PANEL_CLASS = 'thaSnapshotSourcePanel';

function textOf(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function safeJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function latestSession(sessions = {}) {
  return Object.values(sessions || {})
    .filter(session => session?.data)
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
}

function currentSession() {
  const sessions = safeJson(SESSION_KEY, {});
  const currentId = localStorage.getItem(CURRENT_ID_KEY) || '';
  return (currentId && sessions[currentId]?.data ? sessions[currentId] : null) || latestSession(sessions);
}

function setStatus(panel, message, tone = 'success') {
  const status = panel?.querySelector('.snapshotSourceStatus');
  if (!status) return;
  status.textContent = message || '';
  status.dataset.tone = tone;
}

function downloadJson(fileName, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function triggerNativeSave() {
  const button = Array.from(document.querySelectorAll('button'))
    .find(candidate => /save walkthrough|save work session/i.test(textOf(candidate)));
  button?.click();
}

async function downloadCurrentSnapshot(panel) {
  triggerNativeSave();
  await new Promise(resolve => window.setTimeout(resolve, 350));
  const session = currentSession();
  if (!session?.data) {
    setStatus(panel, 'Save or open a work session before downloading the Snapshot source file.', 'error');
    return;
  }
  const snapshot = createSnapshotDocument({
    sessionId: session.id,
    sessionName: session.name,
    data: session.data,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  });
  downloadJson(THA_SNAPSHOT_FILE_NAME, snapshot);
  setStatus(panel, `${THA_SNAPSHOT_FILE_NAME} downloaded. This is the app reload file; the PMR is not.`, 'success');
}

function restoredSessionName(snapshot) {
  const client = snapshot.data?.client || {};
  return snapshot.data?.walkthroughName
    || [client.name, client.address, client.date].filter(Boolean).join(' — ')
    || 'Restored THA Snapshot';
}

function saveRestoredSnapshot(snapshot) {
  const sessions = safeJson(SESSION_KEY, {});
  const id = `restored-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const name = restoredSessionName(snapshot);
  const session = {
    id,
    name,
    createdAt: snapshot.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: snapshotToWalkthroughData(snapshot)
  };
  const nextSessions = { ...sessions, [id]: session };
  if (!safeSet(SESSION_KEY, JSON.stringify(nextSessions)) || !safeSet(CURRENT_ID_KEY, id)) {
    throw new Error('This browser could not save the restored Snapshot. Download a backup before clearing storage.');
  }
  safeSet(PENDING_RESTORE_KEY, JSON.stringify({ id, name }));
  return session;
}

async function importSnapshotFile(panel, file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const snapshot = validateSnapshotDocument(parsed);
    const session = saveRestoredSnapshot(snapshot);
    setStatus(panel, `Restored ${session.name}. Reloading that work session…`, 'success');
    window.setTimeout(() => window.location.reload(), 450);
  } catch (error) {
    setStatus(panel, error?.message || 'Snapshot restore failed.', 'error');
  }
}

function pendingRestore() {
  return safeJson(PENDING_RESTORE_KEY, null);
}

function openPendingRestore(panel, attempt = 0) {
  const pending = pendingRestore();
  if (!pending?.id) return;
  const selector = Array.from(document.querySelectorAll('select'))
    .find(select => Array.from(select.options || []).some(option => option.value === pending.id));
  if (!selector) {
    if (attempt < 20) window.setTimeout(() => openPendingRestore(panel, attempt + 1), 200);
    return;
  }
  selector.value = pending.id;
  selector.dispatchEvent(new Event('change', { bubbles: true }));
  localStorage.removeItem(PENDING_RESTORE_KEY);
  setStatus(panel, `${pending.name} is loaded as the active THA Snapshot work session.`, 'success');
}

function buildPanel() {
  const panel = document.createElement('section');
  panel.className = PANEL_CLASS;
  panel.innerHTML = `
    <div class="snapshotSourceHeading">
      <div>
        <p class="snapshotSourceEyebrow">V3.57 source of truth</p>
        <h4>THA Snapshot Source File</h4>
      </div>
      <span>JSON</span>
    </div>
    <p class="snapshotSourceCopy"><strong>THA Snapshot data creates the PMR.</strong> Use this structured file to continue or restore the app. Do not use the PMR as the reload file.</p>
    <div class="snapshotSourceActions">
      <button type="button" class="snapshotSourceDownload">Download ${THA_SNAPSHOT_FILE_NAME}</button>
      <label class="snapshotSourceImport">Restore Snapshot JSON<input type="file" accept="application/json,.json" /></label>
    </div>
    <p class="snapshotSourceLegacy">Legacy V3.56 walkthrough JSON is accepted and migrated into the V3.57 Snapshot format during restore.</p>
    <div class="snapshotSourceStatus" role="status" aria-live="polite"></div>
  `;
  panel.querySelector('.snapshotSourceDownload')?.addEventListener('click', () => downloadCurrentSnapshot(panel));
  panel.querySelector('input[type="file"]')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    importSnapshotFile(panel, file);
    event.target.value = '';
  });
  return panel;
}

function targetCard() {
  return document.querySelector('.walkthroughControlsPanel .localWorkCard')
    || document.querySelector('.walkthroughControlsPanel .businessRecordsCard')
    || document.querySelector('.walkthroughControlsPanel');
}

function ensurePanel() {
  const target = targetCard();
  if (!target) return null;
  let panel = target.querySelector(`:scope > .${PANEL_CLASS}`);
  if (!panel) {
    panel = buildPanel();
    target.append(panel);
  }
  openPendingRestore(panel);
  return panel;
}

let scheduled = false;
function schedulePanel() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    ensurePanel();
  });
}

function start() {
  ensurePanel();
  window.setTimeout(ensurePanel, 350);
  window.setTimeout(ensurePanel, 1000);
  new MutationObserver(schedulePanel).observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
