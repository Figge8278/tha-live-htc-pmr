export const THA_SNAPSHOT_FILE_TYPE = 'tha-snapshot';
export const THA_SNAPSHOT_SCHEMA_VERSION = 3;
export const THA_SNAPSHOT_APP_VERSION = '3.57.2';
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
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'record';
}
export function withoutKeys(source = {}, keys = []) {
  const blocked = new Set(keys);
  return Object.fromEntries(Object.entries(object(source)).filter(([key]) => !blocked.has(key)));
}
export function newSnapshotId(value = '') {
  if (text(value)) return text(value);
  if (globalThis.crypto?.randomUUID) return `snapshot-${globalThis.crypto.randomUUID()}`;
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function rowContext(row = {}, itemId = '') {
  const answer = object(row.answer);
  return {
    source: text(row.source) || 'HTC',
    templateItemId: String(itemId),
    roomId: text(row.sectionKey || row.roomId || answer.sectionKey || answer.roomId),
    roomName: text(row.roomName || row.room),
    roomType: text(row.roomType),
    zone: text(row.zone || row.section),
    category: text(row.category),
    item: text(row.item),
    tradeDefault: text(row.trade),
    effortDefault: text(row.effort),
    prompt: text(row.prompt),
    why: text(row.why),
    recommendedAction: text(row.action),
    timing: object(row.timing),
    pmrGroup: text(row.pmrGroup),
    intakeField: text(row.intakeField),
    intakeFieldLabel: text(row.intakeFieldLabel),
    intakeOnly: Boolean(row.intakeOnly || row.source === 'Intake Follow-Up'),
    catchAll: Boolean(row.catchAll)
  };
}

export function pmrDecision(itemId, fields = {}, context = {}) {
  if (context.intakeOnly || String(itemId).startsWith('intake-follow-up-')) return 'excluded';
  if (typeof fields.includeInPmr === 'boolean') return fields.includeInPmr ? 'included' : 'excluded';
  const status = text(fields.status);
  if (PMR_INCLUDED.has(status)) return 'included';
  if (PMR_EXCLUDED.has(status)) return 'excluded';
  return 'review';
}
export function pmcpDecision(fields = {}, review = {}) {
  const explicit = text(review.pmcpDecision || fields.pmcpDecision).toLowerCase();
  if (PMCP_DECISIONS.has(explicit)) return explicit;
  return review.selected === true || fields.selected === true ? 'selected' : 'pending';
}

export function workflowProjection(sourceType, sourceId, fields = {}) {
  const selected = Boolean(fields.thaActionItem || fields.workOrderNow);
  const actionType = text(fields.thaActionType) || 'Unknown';
  const followUpStatus = text(fields.followUpStatus || fields.passFollowUpStatus) || 'Not Scheduled';
  const internalNote = text(fields.internalNote);
  if (!selected && actionType === 'Unknown' && followUpStatus === 'Not Scheduled' && !internalNote) return null;
  return {
    actionId: `workflow-${safeIdPart(sourceType)}-${safeIdPart(sourceId)}`,
    source: { entityType: sourceType, entityId: sourceId },
    sourceOfTruth: {
      selectedPath: 'fields.thaActionItem', actionTypePath: 'fields.thaActionType',
      followUpStatusPath: 'fields.followUpStatus', internalNotePath: 'fields.internalNote'
    },
    selected, actionType, followUpStatus, internalNote,
    clientVisible: false, generatedFromSource: true
  };
}

export function mediaAsset(photo = {}, owner = {}) {
  const mediaId = text(photo.id) || `photo-${safeIdPart(owner.ownerType)}-${safeIdPart(owner.ownerId)}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    mediaId, scope: owner.scope, ownerType: owner.ownerType, ownerId: owner.ownerId,
    roomId: owner.roomId || '', clientVisible: owner.clientVisible !== false,
    fields: clone({ ...photo, id: mediaId }, {})
  };
}

export function answerMapAndRows(source = {}) {
  const rows = list(source.rows);
  const rowById = new Map(rows.filter(row => row?.id !== undefined && row?.id !== null).map(row => [String(row.id), row]));
  if (isObject(source.answers)) return { answers: source.answers, rowById };
  if (isObject(source.htc?.answers)) return { answers: source.htc.answers, rowById };
  return {
    answers: Object.fromEntries(rows.filter(row => row?.id !== undefined && isObject(row.answer)).map(row => [String(row.id), clone(row.answer, {})])),
    rowById
  };
}
