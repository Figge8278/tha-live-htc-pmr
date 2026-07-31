import {
  THA_SNAPSHOT_FILE_NAME,
  createSnapshotDocument,
  snapshotConnectionSummary,
  snapshotToWalkthroughData,
  validateSnapshotDocument
} from './snapshotSchema.js';
import './snapshotSource.css';

const SESSION_KEY = 'tha-walkthrough-sessions';
const CURRENT_ID_KEY = 'tha-current-walkthrough-id';
const PENDING_RESTORE_KEY = 'tha-v357-pending-snapshot-restore';
const SIDECAR_KEY = 'tha-v357-snapshot-sidecars';
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

function snapshotExtensions(snapshot = {}) {
  const data = snapshot.data || {};
  return {
    property: data.property || {},
    administration: data.administration || {},
    nativeWorkflowActions: (data.workflow?.actions || []).filter(action => action && !action.generatedFromSource),
    supplementalMedia: (data.media?.assets || []).filter(asset => asset && !['finding', 'room'].includes(asset.ownerType))
  };
}

function sidecarFor(sessionId = '') {
  return safeJson(SIDECAR_KEY, {})[sessionId] || null;
}

function saveSidecar(sessionId, snapshot) {
  if (!sessionId || !snapshot) return;
  const sidecars = safeJson(SIDECAR_KEY, {});
  safeSet(SIDECAR_KEY, JSON.stringify({
    ...sidecars,
    [sessionId]: {
      snapshotId: snapshot.snapshotId,
      updatedAt: snapshot.updatedAt,
      extensions: snapshotExtensions(snapshot)
    }
  }));
}

function snapshotForSession(session) {
  const sidecar = sidecarFor(session?.id);
  return createSnapshotDocument({
    sessionId: session?.id,
    sessionName: session?.name,
    data: {
      ...(session?.data || {}),
      snapshotExtensions: sidecar?.extensions || session?.data?.snapshotExtensions || {}
    },
    createdAt: session?.createdAt,
    updatedAt: session?.updatedAt
  });
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

function metricText(summary = {}) {
  return {
    findings: String(summary.findings || 0),
    pmr: String(summary.pmr || 0),
    pmcp: `${summary.pmcp || 0} selected · ${summary.pmcpCandidates || 0} pending`,
    workflow: String(summary.workflow || 0),
    photos: String(summary.photos || 0)
  };
}

function updateMetrics(panel, summary) {
  const values = metricText(summary);
  Object.entries(values).forEach(([key, value]) => {
    const target = panel?.querySelector(`[data-snapshot-metric="${key}"] strong`);
    if (target) target.textContent = value;
  });
  const review = panel?.querySelector('.snapshotSourceReviewCue');
  if (review) {
    review.textContent = summary.pmrReview
      ? `${summary.pmrReview} finding${summary.pmrReview === 1 ? '' : 's'} still need a PMR inclusion decision.`
      : 'Every recorded finding has a clear PMR inclusion decision.';
    review.dataset.tone = summary.pmrReview ? 'review' : 'ready';
  }
}

function refreshSummary(panel, force = false) {
  const session = currentSession();
  const summaryKey = session ? `${session.id || ''}:${session.updatedAt || ''}` : 'none';
  if (!force && panel?.dataset.summaryKey === summaryKey) return;
  panel.dataset.summaryKey = summaryKey;
  if (!session?.data) {
    updateMetrics(panel, {});
    setStatus(panel, 'Open or save a work session to see its connected Snapshot record.', 'info');
    return;
  }
  try {
    const snapshot = snapshotForSession(session);
    updateMetrics(panel, snapshotConnectionSummary(snapshot));
  } catch (error) {
    setStatus(panel, error?.message || 'The Snapshot connection summary could not be prepared.', 'error');
  }
}

async function downloadCurrentSnapshot(panel) {
  triggerNativeSave();
  await new Promise(resolve => window.setTimeout(resolve, 400));
  const session = currentSession();
  if (!session?.data) {
    setStatus(panel, 'Save or open a work session before downloading the Snapshot source file.', 'error');
    return;
  }
  const snapshot = snapshotForSession(session);
  const summary = snapshotConnectionSummary(snapshot);
  saveSidecar(session.id, snapshot);
  downloadJson(THA_SNAPSHOT_FILE_NAME, snapshot);
  updateMetrics(panel, summary);
  setStatus(
    panel,
    `Downloaded: ${summary.findings} findings, ${summary.pmr} PMR, ${summary.pmcp} PMCP selected, ${summary.pmcpCandidates} PMCP pending, ${summary.workflow} workflow actions, and ${summary.photos} photos.`,
    'success'
  );
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
  saveSidecar(id, snapshot);
  safeSet(PENDING_RESTORE_KEY, JSON.stringify({ id, name }));
  return session;
}

async function importSnapshotFile(panel, file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const snapshot = validateSnapshotDocument(parsed);
    const summary = snapshotConnectionSummary(snapshot);
    const session = saveRestoredSnapshot(snapshot);
    updateMetrics(panel, summary);
    setStatus(panel, `Restored ${session.name}. Reloading the connected work session…`, 'success');
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
  window.setTimeout(() => refreshSummary(panel, true), 250);
}

function buildPanel() {
  const panel = document.createElement('section');
  panel.className = PANEL_CLASS;
  panel.innerHTML = `
    <div class="snapshotSourceHeading">
      <div>
        <p class="snapshotSourceEyebrow">V3.57 connected source of truth</p>
        <h4>THA Snapshot Source File</h4>
      </div>
      <span>JSON</span>
    </div>
    <p class="snapshotSourceCopy"><strong>Record once; use it throughout.</strong> The Snapshot source connects field findings to the client PMR, continued care to the PMCP, photos to their exact records, and selected items to THA workflow.</p>
    <div class="snapshotSourceMetrics" aria-label="Connected Snapshot record summary">
      <span data-snapshot-metric="findings"><strong>0</strong> Findings</span>
      <span data-snapshot-metric="pmr"><strong>0</strong> PMR</span>
      <span data-snapshot-metric="pmcp"><strong>0</strong> PMCP</span>
      <span data-snapshot-metric="workflow"><strong>0</strong> Workflow</span>
      <span data-snapshot-metric="photos"><strong>0</strong> Photos</span>
    </div>
    <p class="snapshotSourceReviewCue" data-tone="ready">Every recorded finding has a clear PMR inclusion decision.</p>
    <details class="snapshotSourceConnections">
      <summary>How this file stays connected</summary>
      <div>
        <p><strong>PMR:</strong> draws only from findings marked for client reporting.</p>
        <p><strong>PMCP:</strong> draws from continued-care items and stays separate from defect counts.</p>
        <p><strong>Workflow:</strong> points back to the exact finding, room, or care item that created the action.</p>
        <p><strong>Photos:</strong> identify their exact owner as finding evidence, room overview, client-submitted, or internal reference.</p>
      </div>
    </details>
    <div class="snapshotSourceActions">
      <button type="button" class="snapshotSourceDownload">Download ${THA_SNAPSHOT_FILE_NAME}</button>
      <label class="snapshotSourceImport">Restore Snapshot JSON<input type="file" accept="application/json,.json" /></label>
    </div>
    <p class="snapshotSourceLegacy">Current V3.57 files and legacy V3.56 walkthrough JSON are accepted. Older files are migrated into the connected structure during restore.</p>
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
  refreshSummary(panel);
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
