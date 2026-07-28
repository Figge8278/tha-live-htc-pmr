import { validateSnapshotDocument } from '../snapshot/snapshotSchema.js';

function text(value = '', fallback = '') {
  const output = String(value ?? '').trim();
  return output || fallback;
}
function list(value) { return Array.isArray(value) ? value : []; }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function tradeLabel(value = '') { return value === 'Handyman' ? 'Handy Services' : text(value, 'Resource to be assigned'); }
function priority(status = '') {
  if (status === 'Immediate Concern') return { key: 'immediate', label: 'Immediate' };
  if (status === 'Needs Attention') return { key: 'near-term', label: 'Near-Term' };
  if (status === 'Monitor') return { key: 'monitor', label: 'Monitor' };
  return { key: 'reference', label: text(status, 'Review') };
}
function timingFor(finding = {}) {
  const status = finding.fields?.status || '';
  const configured = finding.context?.timing?.[status];
  if (configured) return configured;
  if (status === 'Immediate Concern') return 'Immediate / 0–30 days';
  if (status === 'Needs Attention') return '1–3 months';
  if (status === 'Monitor') return '6–12 months';
  return 'As appropriate';
}
function certaintyFor(finding = {}) {
  const label = text(finding.fields?.actionCertainty, 'Likely Path');
  const trade = tradeLabel(finding.fields?.trade || finding.context?.tradeDefault);
  if (label === 'Clear Path') return { label, explanation: 'Scope and next step are reasonably clear.', nextStep: `This appears ready to proceed through ${trade}.` };
  if (label === 'Needs Discovery') return { label, explanation: 'More information, pricing, or specialist input is needed before committing.', nextStep: `Coordinate a closer review with ${trade} before pricing or scheduling.` };
  return { label: 'Likely Path', explanation: 'A practical starting point is identified, with minor confirmation still possible.', nextStep: text(finding.context?.recommendedAction, 'Start here, then reassess if symptoms continue or hidden conditions are found.') };
}
function groupBy(items = [], keyFn) {
  return items.reduce((groups, item) => { const key = text(keyFn(item), 'General'); groups[key] = [...(groups[key] || []), item]; return groups; }, {});
}
function referencesFromIntake(intake = {}) {
  const sewerIrrigation = text(intake.sewerIrrigation);
  return [
    { id: 'electrical-panel', label: 'Breaker panel / fuse box', value: text(intake.electricalPanel) },
    { id: 'water-shutoff', label: 'Main water shutoff', value: text(intake.waterShutoff) },
    { id: 'gas-shutoff', label: 'Gas shutoff', value: text(intake.gasShutoff || intake.gasValve || intake.gasMeter || intake.gas) },
    { id: 'furnace-filter', label: 'Furnace filter location / size', value: text(intake.hvacFilter) },
    { id: 'fire-extinguishers', label: 'Fire extinguishers', value: text(intake.fireExtinguishers) },
    { id: 'smoke-co', label: 'Smoke / CO detector notes', value: text(intake.smokeCO) },
    { id: 'irrigation', label: 'Irrigation shutoff / controller', value: /irrigation|sprinkler|controller|shutoff/i.test(sewerIrrigation) ? sewerIrrigation : '' }
  ];
}
function photoModel(asset = {}) {
  const fields = object(asset.fields);
  return { id: asset.mediaId, label: text(fields.label, asset.scope === 'room-overview' ? 'Overview' : 'Photo'), name: text(fields.driveFileName || fields.name, 'Photo'), source: text(fields.thumbnailDataUrl || fields.dataUrl), link: text(fields.driveViewLink || fields.webViewLink), scope: asset.scope, clientVisible: asset.clientVisible !== false };
}
function findingModel(finding = {}, mediaById = new Map()) {
  const fields = object(finding.fields);
  const context = object(finding.context);
  const status = text(fields.status, 'Monitor');
  const certainty = certaintyFor(finding);
  return {
    id: finding.findingId, roomId: finding.roomId, room: text(context.roomName || context.roomId || finding.roomId, 'General'),
    item: text(context.item, `Checklist item ${finding.templateItemId}`), zone: text(context.zone || context.category),
    trade: tradeLabel(fields.trade || context.tradeDefault), status, priority: priority(status),
    effort: text(fields.effort || context.effortDefault, 'Time to be confirmed'), notes: text(fields.notes, 'No additional field notes recorded.'),
    why: text(context.why, 'The condition was recorded so the homeowner can plan an appropriate next step.'),
    recommendedAction: text(context.recommendedAction, certainty.nextStep), timing: timingFor(finding),
    homeownerPreference: text(fields.pref, 'Not recorded'), certainty,
    photos: list(finding.photoIds).map(id => mediaById.get(id)).filter(asset => asset?.clientVisible !== false).map(photoModel)
  };
}
function careModel(item = {}) {
  const fields = object(item.fields);
  return {
    id: item.careItemId, careItem: text(fields.careItem || fields.careTopic, 'Continued-care item'),
    resource: tradeLabel(fields.resource || fields.trade), cadence: text(fields.cadence, 'As Needed'),
    reason: text(fields.reason || fields.passNote, 'Routine continued-care planning item.'),
    targetWindow: text(fields.nextSuggestedWindow || fields.targetWindow || fields.suggestedWindow, 'Next normal maintenance window'),
    lastCompleted: text(fields.lastCompletedDisplay || fields.lastCompletedDate, 'Unknown — establish baseline'),
    followUpStatus: text(fields.followUpStatus || fields.passFollowUpStatus, 'Verify / Establish Baseline'),
    sourceLabel: text(fields.sourceEvidence?.label || item.source?.type, 'PASS / PMCP'), findingIds: list(item.source?.findingIds)
  };
}
export function buildSnapshotReportModel(input = {}) {
  const snapshot = validateSnapshotDocument(input);
  const data = snapshot.data;
  const findingById = new Map(list(data.htc?.findings).map(item => [item.findingId, item]));
  const careById = new Map(list(data.continuedCare?.items).map(item => [item.careItemId, item]));
  const mediaById = new Map(list(data.media?.assets).map(item => [item.mediaId, item]));
  const findings = list(data.reporting?.pmr?.findingIds).map(id => findingById.get(id)).filter(item => item?.reporting?.clientVisible !== false).map(item => findingModel(item, mediaById));
  const selectedCare = list(data.reporting?.pmcp?.selectedCareItemIds).map(id => careById.get(id)).filter(item => item?.reporting?.clientVisible !== false).map(careModel);
  const pendingCare = list(data.reporting?.pmcp?.candidateCareItemIds).map(id => careById.get(id)).filter(item => item?.reporting?.clientVisible !== false).map(careModel);
  const counts = {
    immediate: findings.filter(item => item.status === 'Immediate Concern').length,
    nearTerm: findings.filter(item => item.status === 'Needs Attention').length,
    monitor: findings.filter(item => item.status === 'Monitor').length,
    findings: findings.length, pmcp: selectedCare.length,
    photos: findings.reduce((sum, item) => sum + item.photos.length, 0)
  };
  return {
    source: { fileType: snapshot.fileType, schemaVersion: snapshot.schemaVersion, appVersion: snapshot.appVersion, snapshotId: snapshot.snapshotId, updatedAt: snapshot.updatedAt },
    client: object(data.client), property: object(data.property), walkthroughName: text(data.walkthroughName),
    references: referencesFromIntake(object(data.intake)), findings,
    roomGroups: groupBy(findings, finding => finding.room), tradeGroups: groupBy(findings, finding => finding.trade),
    pmcp: { selected: selectedCare, pending: pendingCare, note: 'PMCP continued care is separate from PMR defect counts.' },
    counts,
    summary: findings.length ? `This PMR includes ${findings.length} finding${findings.length === 1 ? '' : 's'} drawn from the connected THA Snapshot record. The room and trade views below use the same findings rather than separate copies.` : 'No immediate PMR findings were identified in the connected THA Snapshot record. Selected PMCP continued-care items may still appear below.'
  };
}
