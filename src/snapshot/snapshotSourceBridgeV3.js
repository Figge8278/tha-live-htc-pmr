import {
  THA_SNAPSHOT_FILE_NAME, createSnapshotDocument, snapshotConnectionSummary,
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
function latestSession(sessions = {}) { return Object.values(sessions).filter(session => session?.data).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null; }
function currentSession() {
  const sessions = safeJson(SESSION_KEY, {});
  const id = localStorage.getItem(CURRENT_ID_KEY) || '';
  return (id && sessions[id]?.data ? sessions[id] : null) || latestSession(sessions);
}
function sidecar(sessionId = '') { return safeJson(SIDECAR_KEY, {})[sessionId] || null; }
function saveSidecar(sessionId, snapshot) {
  if (!sessionId || !snapshot) return;
  const all = safeJson(SIDECAR_KEY, {});
  safeSet(SIDECAR_KEY, JSON.stringify({ ...all, [sessionId]: { snapshotId: snapshot.snapshotId, updatedAt: snapshot.updatedAt, originalSnapshot: snapshot } }));
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
  return {
    ...restored, ...current, answers, roomCapture, passReview, rows,
    dynamicRooms: list(current.dynamicRooms).length ? current.dynamicRooms : restored.dynamicRooms,
    sectionOrder: list(current.sectionOrder).length ? current.sectionOrder : restored.sectionOrder,
    itemOrder: Object.keys(object(current.itemOrder)).length ? current.itemOrder : restored.itemOrder,
    pinnedItems: Object.keys(object(current.pinnedItems)).length ? current.pinnedItems : restored.pinnedItems,
    passCareCandidates: care, passCareOutlook: care.filter(item => item.pmcpDecision !== 'declined'),
    property: preserved.data?.property || {}, administration: preserved.data?.administration || {},
    snapshotExtensions: {
      property: preserved.data?.property || {}, administration: preserved.data?.administration || {},
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
  if (!session?.data) { updateMetrics(panel); setPanelStatus(panel, 'Open or save a work session to see its connected Snapshot record.', 'info'); return; }
  try { updateMetrics(panel, snapshotConnectionSummary(snapshotForSession(session))); } catch (error) { setPanelStatus(panel, error.message || 'Connection summary failed.', 'error'); }
}
async function downloadCurrent(panel) {
  triggerSave(); await new Promise(resolve => setTimeout(resolve, 450));
  const session = currentSession();
  if (!session?.data) { setPanelStatus(panel, 'Save or open a work session before downloading the Snapshot source file.', 'error'); return; }
  const snapshot = snapshotForSession(session); saveSidecar(session.id, snapshot); downloadJson(THA_SNAPSHOT_FILE_NAME, snapshot);
  const summary = snapshotConnectionSummary(snapshot); updateMetrics(panel, summary);
  setPanelStatus(panel, `Downloaded ${summary.findings} findings, ${summary.pmr} PMR items, ${summary.pmcp} selected PMCP items, ${summary.workflow} workflow actions, and ${summary.photos} photos.`, 'success');
}
function restoredName(snapshot) {
  const client = snapshot.data?.client || {};
  return snapshot.data?.walkthroughName || [client.name, client.address, client.date].filter(Boolean).join(' — ') || 'Restored THA Snapshot';
}
function saveRestored(snapshot) {
  const sessions = safeJson(SESSION_KEY, {});
  const id = `restored-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const summary = snapshotConnectionSummary(snapshot);
  const session = { id, name: restoredName(snapshot), createdAt: snapshot.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), data: snapshotToWalkthroughData(snapshot) };
  if (!safeSet(SESSION_KEY, JSON.stringify({ ...sessions, [id]: session })) || !safeSet(CURRENT_ID_KEY, id)) throw new Error('This browser could not save the restored Snapshot.');
  saveSidecar(id, snapshot);
  safeSet(PENDING_KEY, JSON.stringify({ id, name: session.name, clientName: snapshot.data?.client?.name || '', expectedFindings: summary.findings, expectedPmr: summary.pmr }));
  return session;
}
async function importFile(panel, file) {
  if (!file) return;
  try {
    const snapshot = validateSnapshotDocument(JSON.parse(await file.text()));
    const session = saveRestored(snapshot); updateMetrics(panel, snapshotConnectionSummary(snapshot));
    setPanelStatus(panel, `Restored ${session.name}. Reloading the connected work session…`, 'success'); setTimeout(() => location.reload(), 500);
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
      setPanelStatus(panel, `${pending.name} is loaded as the active THA Snapshot work session (${pending.expectedFindings || 0} findings; ${pending.expectedPmr || 0} PMR).`, 'success');
      setTimeout(() => refresh(panel, true), 300);
      return;
    }
    pendingOpenBusy = false;
    if (attempt < 40) setTimeout(() => openPending(panel, attempt + 1), 200);
    else setPanelStatus(panel, 'The Snapshot was saved, but the visible work session did not open. Choose the restored session under Saved local sessions before exporting.', 'error');
  }, 300);
}
function target() { return document.querySelector('.walkthroughControlsPanel .localWorkCard') || document.querySelector('.walkthroughControlsPanel .businessRecordsCard') || document.querySelector('.walkthroughControlsPanel'); }
function ensure() {
  const host = target(); if (!host) return;
  let panel = host.querySelector(`:scope > .${PANEL_CLASS}`);
  if (!panel) { panel = buildSourcePanel({ onDownload: downloadCurrent, onImport: importFile }); host.append(panel); }
  refresh(panel); openPending(panel);
}
let scheduled = false;
function schedule() { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; ensure(); }); }
function start() { ensure(); setTimeout(ensure, 350); setTimeout(ensure, 1000); new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true }); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
