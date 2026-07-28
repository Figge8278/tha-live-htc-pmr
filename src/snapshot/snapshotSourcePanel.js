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
  panel.innerHTML = `<div class="snapshotSourceHeading"><div><p class="snapshotSourceEyebrow">V3.57 connected source of truth</p><h4>THA Snapshot Source File</h4></div><span>JSON</span></div>
  <p class="snapshotSourceCopy"><strong>Record once; use it throughout.</strong> Findings feed the PMR, continued care feeds the PMCP, photos stay attached to their exact records, and selected work feeds THA workflow.</p>
  <div class="snapshotSourceMetrics"><span data-snapshot-metric="findings"><strong>0</strong> Findings</span><span data-snapshot-metric="pmr"><strong>0</strong> PMR</span><span data-snapshot-metric="pmcp"><strong>0</strong> PMCP</span><span data-snapshot-metric="workflow"><strong>0</strong> Workflow</span><span data-snapshot-metric="photos"><strong>0</strong> Photos</span></div>
  <p class="snapshotSourceReviewCue" data-tone="ready">Every recorded finding has a clear PMR inclusion decision.</p>
  <details class="snapshotSourceConnections"><summary>How this file stays connected</summary><div><p><strong>PMR:</strong> included client-visible findings.</p><p><strong>PMCP:</strong> selected continued-care records, separate from defect counts.</p><p><strong>Workflow:</strong> internal actions linked to their original finding, room, or care item.</p><p><strong>Photos:</strong> explicit room-overview or finding-evidence ownership.</p></div></details>
  <div class="snapshotSourceActions"><button type="button" class="snapshotSourceDownload">Download ${THA_SNAPSHOT_FILE_NAME}</button><label class="snapshotSourceImport">Restore Snapshot JSON<input type="file" accept="application/json,.json"/></label></div>
  <p class="snapshotSourceLegacy">Current V3.57 and legacy V3.56 JSON files are accepted and migrated during restore.</p><div class="snapshotSourceStatus" role="status" aria-live="polite"></div>`;
  panel.querySelector('.snapshotSourceDownload').addEventListener('click', () => onDownload(panel));
  panel.querySelector('input').addEventListener('change', event => { onImport(panel, event.target.files?.[0]); event.target.value = ''; });
  return panel;
}
