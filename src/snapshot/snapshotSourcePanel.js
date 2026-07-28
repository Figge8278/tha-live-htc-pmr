import { THA_SNAPSHOT_FILE_NAME } from './snapshotSchema.js';

export const PANEL_CLASS = 'thaSnapshotSourcePanel';
export function setPanelStatus(panel, message, tone = 'success') {
  const target = panel?.querySelector('.snapshotSourceStatus');
  if (target) { target.textContent = message || ''; target.dataset.tone = tone; }
}
export function updatePanelMetrics(panel, summary = {}) {
  const values = {
    findings: summary.findings || 0, pmr: summary.pmr || 0,
    pmcp: `${summary.pmcp || 0} selected · ${summary.pmcpCandidates || 0} pending`,
    workflow: summary.workflow || 0, photos: summary.photos || 0
  };
  Object.entries(values).forEach(([key, value]) => {
    const target = panel?.querySelector(`[data-snapshot-metric="${key}"] strong`);
    if (target) target.textContent = String(value);
  });
  const cue = panel?.querySelector('.snapshotSourceReviewCue');
  if (!cue) return;
  cue.textContent = summary.pmrReview ? `${summary.pmrReview} finding${summary.pmrReview === 1 ? '' : 's'} still need a PMR inclusion decision.` : 'Every recorded finding has a clear PMR inclusion decision.';
  cue.dataset.tone = summary.pmrReview ? 'review' : 'ready';
}
export function buildSourcePanel({ onDownload, onImport }) {
  const panel = document.createElement('section');
  panel.className = PANEL_CLASS;
  panel.innerHTML = `<div class="snapshotSourceHeading"><div><p class="snapshotSourceEyebrow">Information source</p><h4>Continue from a Snapshot</h4></div><span>JSON</span></div>
  <p class="snapshotSourceCopy">Use a Snapshot to continue on another device, finish the same visit, or begin a new dated update while preserving the earlier record.</p>
  <div class="snapshotSourceMetrics"><span data-snapshot-metric="findings"><strong>0</strong> Findings</span><span data-snapshot-metric="pmr"><strong>0</strong> PMR</span><span data-snapshot-metric="pmcp"><strong>0</strong> PMCP</span><span data-snapshot-metric="workflow"><strong>0</strong> Workflow</span><span data-snapshot-metric="photos"><strong>0</strong> Photos</span></div>
  <p class="snapshotSourceReviewCue" data-tone="ready">Every recorded finding has a clear PMR inclusion decision.</p>
  <details class="snapshotSourceConnections"><summary>How prior information stays connected</summary><div><p><strong>Same visit:</strong> retain the original walkthrough date and continue the current record.</p><p><strong>New update:</strong> create a new Snapshot identity and today’s visit date while retaining a link to the source Snapshot.</p><p><strong>Photos and findings:</strong> remain available as the starting record rather than being silently overwritten.</p></div></details>
  <div class="snapshotSourceRestoreSection">
    <label class="snapshotSourceImport">Choose Snapshot JSON<input type="file" accept="application/json,.json"/></label>
    <div class="snapshotRestoreChoice" hidden>
      <strong class="snapshotRestoreFileName">Snapshot selected</strong>
      <p>Choose how this file will be used.</p>
      <button type="button" data-restore-mode="new-update" class="snapshotRestorePrimary">Start a new update from this Snapshot</button>
      <button type="button" data-restore-mode="continue">Continue the original walkthrough</button>
      <button type="button" data-restore-mode="cancel" class="snapshotRestoreCancel">Cancel</button>
    </div>
  </div>
  <div class="snapshotSourceBackupSection"><div><strong>Portable backup</strong><span>Available even when Google Drive is disconnected.</span></div><button type="button" class="snapshotSourceDownload">Download Backup Snapshot</button></div>
  <p class="snapshotSourceLegacy">Current V3.57 and legacy V3.56 JSON files are accepted and migrated during restore.</p><div class="snapshotSourceStatus" role="status" aria-live="polite"></div>`;

  let selectedFile = null;
  const input = panel.querySelector('input[type="file"]');
  const choice = panel.querySelector('.snapshotRestoreChoice');
  const fileName = panel.querySelector('.snapshotRestoreFileName');
  input.addEventListener('change', event => {
    selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) return;
    fileName.textContent = selectedFile.name;
    choice.hidden = false;
    setPanelStatus(panel, 'Snapshot selected. Choose whether this is the same visit or a new dated update.', 'info');
  });
  panel.querySelectorAll('[data-restore-mode]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.restoreMode;
    if (mode === 'cancel') {
      selectedFile = null;
      input.value = '';
      choice.hidden = true;
      setPanelStatus(panel, 'Snapshot restore cancelled.', 'info');
      return;
    }
    if (!selectedFile) return;
    const file = selectedFile;
    selectedFile = null;
    input.value = '';
    choice.hidden = true;
    onImport(panel, file, { mode });
  }));
  panel.querySelector('.snapshotSourceDownload').addEventListener('click', () => onDownload(panel));
  return panel;
}
