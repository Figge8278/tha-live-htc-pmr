export const THA_SNAPSHOT_FILE_TYPE = 'tha-snapshot';
export const THA_SNAPSHOT_SCHEMA_VERSION = 3;
export const THA_SNAPSHOT_APP_VERSION = '3.57.7';
export const THA_SNAPSHOT_FILE_NAME = 'Restore This THA Snapshot.json';

const PMR_INCLUDED = new Set(['Immediate Concern', 'Needs Attention', 'Monitor']);
const PMR_EXCLUDED = new Set(['Good', 'Unknown']);
const PMCP_DECISIONS = new Set(['pending', 'selected', 'declined']);

export function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
export function clone(value, fallback) {
  if (value === undefined || value === null) return fallback;
  try { return JSON.parse(JSON.stringify(value)); } catch { return fallback; }
}
export function text(value = '') { return String(value ?? '').trim(); }
export function list(value) { return Array.isArray(value) ? clone(value, []) : []; }
export function object(value) { return isObject(value) ? clone(value, {}) : {}; }
export function safeIdPart(value = '') {
  return text(value).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}
export function newSnapshotId(sessionId = '') {
  const base = safeIdPart(sessionId);
  if (base.startsWith('snapshot-')) return base;
  return base && base !== 'item' ? `snapshot-${base}` : `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
export function withoutKeys(source = {}, keys = []) {
  const output = { ...object(source) };
  keys.forEach(key => delete output[key]);
  return output;
}
export function photoId(photo = {}, ownerId = 'record', index = 0) {
  return `media-${safeIdPart(photo.id || photo.driveFileId || `${ownerId}-${index + 1}`)}`;
}
export function mediaAsset(photo = {}, { scope = 'finding-evidence', ownerType = 'finding', ownerId = '', roomId = '', clientVisible = true } = {}, index = 0) {
  return { mediaId: photoId(photo, ownerId, index), scope, ownerType, ownerId, roomId, clientVisible, fields: object(photo) };
}
export function answerMapAndRows(source = {}) {
  const answers = object(source.answers ?? source.htc?.answers);
  const rows = list(source.rows);
  rows.forEach(row => {
    const id = text(row?.id);
    if (id && !answers[id] && row.answer) answers[id] = object(row.answer);
  });
  return { answers, rows, rowById: new Map(rows.map(row => [text(row?.id), object(row)])) };
}
export function rowContext(row = {}, itemId = '') {
  return {
    source: text(row.source || 'HTC'), templateItemId: text(itemId), roomId: text(row.sectionKey || row.roomId || row.roomName || row.room),
    roomName: text(row.roomName || row.room || row.sectionKey), zone: text(row.zone || row.category), category: text(row.category || row.zone),
    item: text(row.item || row.prompt || `Checklist item ${itemId}`), tradeDefault: text(row.trade), effortDefault: text(row.effort),
    why: text(row.why), recommendedAction: text(row.action || row.recommendedAction), timing: object(row.timing),
    intakeOnly: Boolean(row.intakeOnly), catchAll: Boolean(row.catchAll)
  };
}
export function pmrDecision(itemId = '', answer = {}, row = {}) {
  if (row.intakeOnly || text(itemId).startsWith('intake-follow-up-')) return answer.reviewStatus === 'Reviewed — Added PMR Finding' ? 'included' : 'excluded';
  const status = text(answer.status || 'Unknown');
  if (PMR_INCLUDED.has(status)) return 'included';
  if (PMR_EXCLUDED.has(status)) return 'excluded';
  return 'review';
}
export function pmcpDecision(item = {}, review = {}) {
  const value = text(review.pmcpDecision || item.pmcpDecision);
  if (PMCP_DECISIONS.has(value)) return value;
  if (review.included === true || item.included === true || item.selected === true) return 'selected';
  if (review.included === false || item.included === false || item.hidden === true) return 'declined';
  return 'pending';
}
export function workflowProjection(entityType, entityId, fields = {}) {
  const selected = Boolean(fields.thaActionItem || fields.workOrderNow);
  const actionType = text(fields.thaActionType || 'Unknown');
  const internalNote = text(fields.internalNote || fields.passNote);
  const followUpStatus = text(fields.followUpStatus || fields.passFollowUpStatus || 'Not Scheduled');
  if (!selected && actionType === 'Unknown' && !internalNote) return null;
  return {
    actionId: `workflow-${entityType}-${safeIdPart(entityId)}`, source: { entityType, entityId },
    sourceOfTruth: { selectedPath: 'fields.thaActionItem', actionTypePath: 'fields.thaActionType', followUpStatusPath: 'fields.followUpStatus', internalNotePath: 'fields.internalNote' },
    selected, actionType, followUpStatus, internalNote, clientVisible: false, generatedFromSource: true
  };
}
