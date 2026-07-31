import {
  THA_SNAPSHOT_APP_VERSION, THA_SNAPSHOT_FILE_NAME, createSnapshotDocument, snapshotConnectionSummary,
  snapshotToWalkthroughData, validateSnapshotDocument
} from './snapshotSchema.js';
import './snapshotSource.css';
import { PANEL_CLASS, buildSourcePanel, setPanelStatus } from './snapshotSourcePanel.js';

const SESSION_KEY = 'tha-walkthrough-sessions';
const CURRENT_ID_KEY = 'tha-current-walkthrough-id';
const PENDING_KEY = 'tha-v357-pending-snapshot-restore';
const SIDECAR_KEY = 'tha-v357-snapshot-sidecars';
let pendingOpenBusy = false;

function safeJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function safeSet(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function list(value) { return Array.isArray(value) ? value : []; }
function clone(value, fallback = {}) { try { return JSON.parse(JSON.stringify(value)); } catch { return fallback; } }
function latestSession(sessions = {}) { return Object.values(sessions).filter(session => session?.data).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null; }
function currentSession() {
  const sessions = safeJson(SESSION_KEY, {});
  const id = localStorage.getItem(CURRENT_ID_KEY) || '';
  return (id && sessions[id]?.data ? sessions[id] : null) || latestSession(sessions);
}
function sidecar(sessionId = '') { return safeJson(SIDECAR_KEY, {})[sessionId] || null; }
function saveSidecar(sessionId, snapshot, metadata = {}) {
  if (!sessionId || !snapshot) return;
  const all = safeJson(SIDECAR_KEY, {});
  const prior = object(all[sessionId]);
  safeSet(SIDECAR_KEY, JSON.stringify({
    ...all,
    [sessionId]: {
      ...prior,
      ...metadata,
      snapshotId: snapshot.snapshotId,
      updatedAt: snapshot.updatedAt,
      originalSnapshot: snapshot
    }
  }));
}
function hasMeaningfulAnswer(answer = {}) {
  const status = String(answer.status || '').trim();
  return Boolean(
    (status && status !== 'Unknown') || String(answer.notes || '').trim() || list(answer.photos).length ||
    answer.thaActionItem || answer.workOrderNow || answer.addToPmcpBuilder || answer.passCandidate ||
    (answer.thaActionType && answer.thaActionType !== 'Unknown') || String(answer.passNote || '').trim()
  );
}
function mergedPhotoList(current = [], preserved = []) { return list(current).length ? list(current) : list(preserved); }
function preservedWalkthrough(snapshot = {}) { return snapshotToWalkthroughData(snapshot); }
function originalRows(snapshot = {}, restored = preservedWalkthrough(snapshot)) {
  const mediaById = new Map(list(snapshot.data?.media?.assets).map(asset => [asset.mediaId, asset]));
  return list(snapshot.data?.htc?.findings).map(finding => {
    const id = String(finding.templateItemId);
    const fields = object(finding.fields);
    const photos = list(finding.photoIds).map(mediaId => mediaById.get(mediaId)?.fields).filter(Boolean);
    return { id, ...object(finding.context), answer: { ...fields, photos: photos.length ? photos : list(restored.answers?.[id]?.photos) } };
  });
}
function originalCare(snapshot = {}) {
  return list(snapshot.data?.continuedCare?.items).map(item => ({
    ...object(item.fields), id: item.careItemId, pmcpDecision: item.reporting?.pmcpDecision || 'pending'
  }));
}
function sourceData(session = {}) {
  const preserved = sidecar(session.id)?.originalSnapshot;
  const current = object(session.data);
  if (!preserved) return current;

  const restored = preservedWalkthrough(preserved);
  const currentAnswers = object(current.answers);
  const answers = { ...object(restored.answers), ...currentAnswers };
  const rows = originalRows(preserved, restored).map(row => {
    const base = object(row.answer);
    const candidate = object(currentAnswers[row.id]);
    const answer = hasMeaningfulAnswer(candidate)
      ? { ...base, ...candidate, photos: mergedPhotoList(candidate.photos, base.photos) }
      : base;
    answers[row.id] = answer;
    return { ...row, answer };
  });

  const restoredRooms = object(restored.roomCapture);
  const currentRooms = object(current.roomCapture);
  const roomCapture = { ...restoredRooms, ...currentRooms };
  Object.keys(restoredRooms).forEach(roomId => {
    const base = object(restoredRooms[roomId]);
    const candidate = object(currentRooms[roomId]);
    const candidateHasWork = Boolean(
      (candidate.status && candidate.status !== 'Unknown') || String(candidate.note || '').trim() ||
      list(candidate.photos).length || list(candidate.items).length || candidate.thaActionItem || candidate.addToPmcpBuilder
    );
    roomCapture[roomId] = candidateHasWork
      ? { ...base, ...candidate, photos: mergedPhotoList(candidate.photos, base.photos), items: list(candidate.items).length ? candidate.items : list(base.items) }
      : base;
  });

  const passReview = { ...object(restored.passReview), ...object(current.passReview) };
  const care = originalCare(preserved).map(item => ({ ...item, ...object(passReview[item.id]) }));
  const currentAdministration = object(current.administration);
  const preservedAdministration = object(preserved.data?.administration);
  return {
    ...restored, ...current, answers, roomCapture, passReview, rows,
    dynamicRooms: list(current.dynamicRooms).length ? current.dynamicRooms : restored.dynamicRooms,
    sectionOrder: list(current.sectionOrder).length ? current.sectionOrder : restored.sectionOrder,
    itemOrder: Object.keys(object(current.itemOrder)).length ? current.itemOrder : restored.itemOrder,
    pinnedItems: Object.keys(object(current.pinnedItems)).length ? current.pinnedItems : restored.pinnedItems,
    passCareCandidates: care, passCareOutlook: care.filter(item => item.pmcpDecision !== 'declined'),
    property: preserved.data?.property || {},
    administration: { ...preservedAdministration, ...currentAdministration },
    snapshotExtensions: {
      property: preserved.data?.property || {},
      administration: { ...preservedAdministration, ...currentAdministration },
      nativeWorkflowActions: list(preserved.data?.workflow?.actions).filter(action => action && !action.generatedFromSource),
      supplementalMedia: list(preserved.data?.media?.assets).filter(asset => asset && !['finding', 'room'].includes(asset.ownerType))
    }
  };
}
function snapshotForSession(session) {
  return createSnapshotDocument({
    sessionId: sidecar(session?.id)?.snapshotId || session?.id, sessionName: session?.name,
    data: sourceData(session), createdAt: session?.createdAt, updatedAt: session?.updatedAt
  });
}
function downloadJson(name, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
function triggerSave() { Array.from(document.querySelectorAll('button')).find(button => /save walkthrough|save work session|save local session/i.test(button.textContent || ''))?.click(); }
function updateMetrics(panel, summary = {}) {
  const values = { findings: summary.findings || 0, pmr: summary.pmr || 0, pmcp: `${summary.pmcp || 0} selected · ${summary.pmcpCandidates || 0} pending`, workflow: summary.workflow || 0, photos: summary.photos || 0 };
  Object.entries(values).forEach(([key, value]) => { const target = panel?.querySelector(`[data-snapshot-metric="${key}"] strong`); if (target) target.textContent = String(value); });
  const cue = panel?.querySelector('.snapshotSourceReviewCue');
  if (cue) {
    cue.textContent = summary.pmrReview ? `${summary.pmrReview} finding${summary.pmrReview === 1 ? '' : 's'} still need a PMR inclusion decision.` : 'Every recorded finding has a clear PMR inclusion decision.';
    cue.dataset.tone = summary.pmrReview ? 'review' : 'ready';
  }
}
function refresh(panel, force = false) {
  const session = currentSession();
  const key = session ? `${session.id}:${session.updatedAt || ''}` : 'none';
  if (!force && panel.dataset.summaryKey === key) return;
  panel.dataset.summaryKey = key;
  if (!session?.data) { updateMetrics(panel); setPanelStatus(panel, 'Open a work session to see its connected Snapshot record.', 'info'); return; }
  try { updateMetrics(panel, snapshotConnectionSummary(snapshotForSession(session))); } catch (error) { setPanelStatus(panel, error.message || 'Connection summary failed.', 'error'); }
}
async function downloadCurrent(panel) {
  triggerSave(); await new Promise(resolve => setTimeout(resolve, 450));
  const session = currentSession();
  if (!session?.data) { setPanelStatus(panel, 'Open a work session before downloading the backup Snapshot.', 'error'); return; }
  const snapshot = snapshotForSession(session);
  const existing = sidecar(session.id);
  saveSidecar(session.id, snapshot, { sourceSnapshotId: existing?.sourceSnapshotId || '', restoreMode: existing?.restoreMode || '' });
  downloadJson(THA_SNAPSHOT_FILE_NAME, snapshot);
  const summary = snapshotConnectionSummary(snapshot); updateMetrics(panel, summary);
  setPanelStatus(panel, `Backup downloaded: ${summary.findings} findings, ${summary.pmr} PMR items, ${summary.pmcp} selected PMCP items, ${summary.workflow} workflow actions, and ${summary.photos} photos.`, 'success');
}
function localDateLabel(date = new Date()) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function updateSnapshotFromSource(snapshot, mode = 'new-update') {
  const source = validateSnapshotDocument(snapshot);
  const working = clone(source, {});
  const now = new Date();
  const stamp = now.toISOString();
  const sourceClient = object(source.data?.client);
  const sourceAdministration = object(source.data?.administration);
  const sourceDate = String(sourceClient.date || '').trim();
  const sourceName = String(source.data?.walkthroughName || '').trim();
  const today = localDateLabel(now);
  const priorHistory = list(sourceAdministration.visitHistory);

  working.appVersion = THA_SNAPSHOT_APP_VERSION;
  working.updatedAt = stamp;
  working.data = object(working.data);
  working.data.client = { ...sourceClient };
  working.data.administration = { ...sourceAdministration };

  if (mode === 'new-update') {
    working.snapshotId = `snapshot-update-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    working.createdAt = stamp;
    working.data.client.date = today;
    working.data.administration.lineage = {
      mode: 'new-update',
      sourceSnapshotId: source.snapshotId,
      sourceWalkthroughDate: sourceDate,
      sourceWalkthroughName: sourceName,
      currentVisitDate: today,
      startedAt: stamp
    };
    working.data.administration.visitHistory = [
      ...priorHistory,
      { snapshotId: source.snapshotId, walkthroughDate: sourceDate, walkthroughName: sourceName, relationship: 'source' },
      { snapshotId: working.snapshotId, walkthroughDate: today, walkthroughName: sourceName, relationship: 'current-update', startedAt: stamp }
    ];
  } else {
    working.data.administration.lineage = {
      ...object(sourceAdministration.lineage),
      mode: 'continue-original',
      sourceSnapshotId: source.snapshotId,
      sourceWalkthroughDate: sourceDate,
      sourceWalkthroughName: sourceName,
      currentVisitDate: sourceDate,
      continuedAt: stamp
    };
    working.data.administration.visitHistory = priorHistory;
  }
  return working;
}
function restoredName(snapshot, mode) {
  const client = snapshot.data?.client || {};
  const type = snapshot.data?.walkthroughName || 'THA Snapshot';
  if (mode === 'new-update') return `${type} — ${client.date || localDateLabel()}`;
  return type || [client.name, client.address, client.date].filter(Boolean).join(' — ') || 'Restored THA Snapshot';
}
function saveRestored(snapshot, mode = 'new-update') {
  const sessions = safeJson(SESSION_KEY, {});
  const working = updateSnapshotFromSource(snapshot, mode);
  const id = `${mode === 'new-update' ? 'update' : 'continued'}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const summary = snapshotConnectionSummary(working);
  const session = {
    id,
    name: restoredName(working, mode),
    createdAt: mode === 'new-update' ? working.createdAt : (snapshot.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString(),
    data: snapshotToWalkthroughData(working)
  };
  if (!safeSet(SESSION_KEY, JSON.stringify({ ...sessions, [id]: session })) || !safeSet(CURRENT_ID_KEY, id)) throw new Error('This browser could not save the restored Snapshot.');
  saveSidecar(id, working, { sourceSnapshotId: snapshot.snapshotId, restoreMode: mode });
  safeSet(PENDING_KEY, JSON.stringify({
    id,
    name: session.name,
    mode,
    clientName: working.data?.client?.name || '',
    sourceDate: snapshot.data?.client?.date || '',
    currentDate: working.data?.client?.date || '',
    expectedFindings: summary.findings,
    expectedPmr: summary.pmr
  }));
  return { session, working };
}
async function importFile(panel, file, options = {}) {
  if (!file) return;
  try {
    const snapshot = validateSnapshotDocument(JSON.parse(await file.text()));
    const mode = options.mode === 'continue' ? 'continue-original' : 'new-update';
    const result = saveRestored(snapshot, mode);
    updateMetrics(panel, snapshotConnectionSummary(result.working));
    const message = mode === 'new-update'
      ? `New update created for ${result.working.data?.client?.date || 'today'} from the ${snapshot.data?.client?.date || 'prior'} Snapshot. The original remains unchanged.`
      : `Original walkthrough continued with its existing date of ${snapshot.data?.client?.date || 'the recorded visit'}. A separate local working copy was created.`;
    setPanelStatus(panel, `${message} Reloading…`, 'success');
    setTimeout(() => location.reload(), 650);
  } catch (error) { setPanelStatus(panel, error.message || 'Snapshot restore failed.', 'error'); }
}
function nativeSelectValue(select, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
  if (setter) setter.call(select, value); else select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}
function clientNameInputValue() {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(item => /^\s*Client Name/i.test(item.textContent || ''));
  return String(label?.querySelector('input')?.value || '').trim();
}
function openPending(panel, attempt = 0) {
  const pending = safeJson(PENDING_KEY, null);
  if (!pending?.id || pendingOpenBusy) return;
  const select = Array.from(document.querySelectorAll('select')).find(item => {
    const hasOption = Array.from(item.options || []).some(option => option.value === pending.id);
    return hasOption && /saved local sessions/i.test(item.closest('label')?.textContent || '');
  });
  if (!select) { if (attempt < 40) setTimeout(() => openPending(panel, attempt + 1), 200); return; }

  pendingOpenBusy = true;
  nativeSelectValue(select, pending.id);
  setTimeout(() => {
    const selected = select.value === pending.id;
    const clientLoaded = !pending.clientName || clientNameInputValue() === pending.clientName;
    if (selected && clientLoaded) {
      safeSet(CURRENT_ID_KEY, pending.id);
      localStorage.removeItem(PENDING_KEY);
      pendingOpenBusy = false;
      const lineage = pending.mode === 'new-update'
        ? `New update dated ${pending.currentDate}; based on ${pending.sourceDate || 'the prior Snapshot'}.`
        : `Continuing the original walkthrough dated ${pending.currentDate || pending.sourceDate}.`;
      setPanelStatus(panel, `${lineage} ${pending.name} is active (${pending.expectedFindings || 0} findings; ${pending.expectedPmr || 0} PMR).`, 'success');
      setTimeout(() => refresh(panel, true), 300);
      return;
    }
    pendingOpenBusy = false;
    if (attempt < 40) setTimeout(() => openPending(panel, attempt + 1), 200);
    else setPanelStatus(panel, 'The Snapshot was saved, but the visible work session did not open. Choose it under Saved local sessions before exporting.', 'error');
  }, 300);
}
function target() {
  return document.querySelector('.thaSnapshotInformationSourceHost')
    || document.querySelector('.walkthroughControlsPanel .localWorkCard')
    || document.querySelector('.walkthroughControlsPanel .businessRecordsCard')
    || document.querySelector('.walkthroughControlsPanel');
}
function ensure() {
  const host = target(); if (!host) return;
  let panel = host.querySelector(`:scope > .${PANEL_CLASS}`) || document.querySelector(`.${PANEL_CLASS}`);
  if (!panel) panel = buildSourcePanel({ onDownload: downloadCurrent, onImport: importFile });
  if (panel.parentElement !== host) host.append(panel);
  refresh(panel); openPending(panel);
}
let scheduled = false;
function schedule() { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; ensure(); }); }
function start() { ensure(); setTimeout(ensure, 350); setTimeout(ensure, 1000); new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true }); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
