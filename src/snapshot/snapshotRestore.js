import { buildCanonicalSource } from './snapshotBuild.js';
import {
  THA_SNAPSHOT_APP_VERSION, THA_SNAPSHOT_FILE_TYPE, THA_SNAPSHOT_SCHEMA_VERSION,
  list, newSnapshotId, object, text
} from './snapshotPrimitives.js';

function legacyShape(source = {}) {
  const htc = object(source.htc);
  const pass = object(source.pass);
  return {
    walkthroughName: text(source.walkthroughName), client: object(source.client), intake: object(source.intake),
    answers: object(htc.answers ?? source.answers), rows: list(source.rows),
    dynamicRooms: list(htc.dynamicRooms ?? source.dynamicRooms), sectionOrder: list(htc.sectionOrder ?? source.sectionOrder),
    itemOrder: object(htc.itemOrder ?? source.itemOrder), pinnedItems: object(htc.pinnedItems ?? source.pinnedItems),
    roomCapture: object(htc.roomCapture ?? source.roomCapture), passReview: object(pass.review ?? source.passReview),
    passCareCandidates: list(source.passCareCandidates), passCareOutlook: list(source.passCareOutlook),
    property: object(source.property), administration: object(source.administration), snapshotExtensions: object(source.snapshotExtensions)
  };
}

export function createSnapshotDocument({ sessionId = '', sessionName = '', data = {}, createdAt = '', updatedAt = '', now = new Date().toISOString() } = {}) {
  const stamp = text(updatedAt || now) || new Date().toISOString();
  return {
    fileType: THA_SNAPSHOT_FILE_TYPE, schemaVersion: THA_SNAPSHOT_SCHEMA_VERSION, appVersion: THA_SNAPSHOT_APP_VERSION,
    snapshotId: newSnapshotId(sessionId), createdAt: text(createdAt || stamp), updatedAt: stamp,
    data: buildCanonicalSource({ ...object(data), walkthroughName: text(sessionName || data.walkthroughName) })
  };
}

function unwrap(input = {}) {
  if (!object(input)) return {};
  if (input.fileType === THA_SNAPSHOT_FILE_TYPE) return input;
  if (object(input.data) && (input.data.client || input.data.answers || input.data.rows || input.data.htc)) return { ...input.data, walkthroughName: input.data.walkthroughName || input.name || input.walkthroughName || '' };
  return input;
}

function canonicalRows(data = {}) {
  const mediaById = new Map(list(data.media?.assets).map(asset => [asset.mediaId, asset]));
  return list(data.htc?.findings).map(finding => ({
    id: String(finding.templateItemId), ...object(finding.context),
    answer: { ...object(finding.fields), photos: list(finding.photoIds).map(id => mediaById.get(id)?.fields).filter(Boolean) }
  }));
}

export function snapshotToWalkthroughDataUnsafe(input = {}) {
  const data = object(input.data);
  if (!Array.isArray(data.htc?.findings)) return legacyShape(data);
  const rows = canonicalRows(data);
  const roomMedia = new Map(list(data.media?.assets).map(asset => [asset.mediaId, asset]));
  const passReview = Object.fromEntries(list(data.continuedCare?.items).map(item => [String(item.careItemId), { ...object(item.fields), pmcpDecision: item.reporting?.pmcpDecision || 'pending' }]));
  return {
    walkthroughName: text(data.walkthroughName), client: object(data.client), intake: object(data.intake),
    answers: Object.fromEntries(rows.map(row => [row.id, row.answer])), rows,
    dynamicRooms: list(data.rooms?.dynamic), sectionOrder: list(data.htc?.sectionOrder), itemOrder: object(data.htc?.itemOrder), pinnedItems: object(data.htc?.pinnedItems),
    roomCapture: Object.fromEntries(list(data.rooms?.capture).map(room => [String(room.roomId), { ...object(room.fields), photos: list(room.photoIds).map(id => roomMedia.get(id)?.fields).filter(Boolean) }])),
    passReview,
    passCareCandidates: list(data.continuedCare?.items).map(item => ({ ...object(item.fields), id: item.careItemId, pmcpDecision: item.reporting?.pmcpDecision })),
    passCareOutlook: list(data.continuedCare?.items).filter(item => item.reporting?.pmcpDecision !== 'declined').map(item => ({ ...object(item.fields), id: item.careItemId, pmcpDecision: item.reporting?.pmcpDecision })),
    property: object(data.property), administration: object(data.administration),
    snapshotExtensions: {
      originalSnapshot: input,
      property: object(data.property), administration: object(data.administration),
      nativeWorkflowActions: list(data.workflow?.actions).filter(action => action && !action.generatedFromSource),
      supplementalMedia: list(data.media?.assets).filter(asset => asset && !['finding', 'room'].includes(asset.ownerType))
    }
  };
}

export function migrateLegacySnapshot(input = {}) {
  const source = unwrap(input);
  if (source.fileType === THA_SNAPSHOT_FILE_TYPE) {
    const version = Number(source.schemaVersion || 1);
    if (version === THA_SNAPSHOT_SCHEMA_VERSION) return source;
    if (version === 1) return createSnapshotDocument({ sessionId: source.snapshotId, sessionName: source.data?.walkthroughName, data: legacyShape(source.data), createdAt: source.createdAt, updatedAt: source.updatedAt });
    if (version === 2) return createSnapshotDocument({ sessionId: source.snapshotId, sessionName: source.data?.walkthroughName, data: snapshotToWalkthroughDataUnsafe(source), createdAt: source.createdAt, updatedAt: source.updatedAt });
    throw new Error(`Unsupported THA Snapshot schema version: ${source.schemaVersion || 'unknown'}.`);
  }
  if (!(source.client || source.intake || source.answers || source.rows || source.pmr || source.roomCapture || source.passReview || source.htc)) throw new Error('This file does not look like a THA Snapshot or legacy THA walkthrough export.');
  return createSnapshotDocument({ sessionId: source.snapshotId || source.id, sessionName: source.walkthroughName || source.name, data: legacyShape(source), createdAt: source.createdAt || source.exportedAt, updatedAt: source.updatedAt || source.exportedAt });
}

export function validateSnapshotDocument(input = {}) {
  const snapshot = migrateLegacySnapshot(input);
  if (snapshot.fileType !== THA_SNAPSHOT_FILE_TYPE) throw new Error('Invalid THA Snapshot file type.');
  if (!object(snapshot.data.client)) throw new Error('THA Snapshot client data is missing.');
  if (!Array.isArray(snapshot.data.htc?.findings)) throw new Error('THA Snapshot HTC findings are missing.');
  if (!Array.isArray(snapshot.data.media?.assets)) throw new Error('THA Snapshot media index is missing.');
  return snapshot;
}

export function snapshotToWalkthroughData(input = {}) {
  const current = snapshotToWalkthroughDataUnsafe(validateSnapshotDocument(input));
  return {
    client: current.client, answers: current.answers, intake: current.intake, dynamicRooms: current.dynamicRooms,
    sectionOrder: current.sectionOrder, itemOrder: current.itemOrder, pinnedItems: current.pinnedItems,
    roomCapture: current.roomCapture, passReview: current.passReview, snapshotExtensions: object(current.snapshotExtensions),
    roomOverviewExpandedByRoom: {}, smartPromptExpandedByRoom: {}, expandedChecklistItems: {}
  };
}

export function snapshotConnectionSummary(input = {}) {
  const snapshot = validateSnapshotDocument(input);
  return {
    findings: snapshot.data.htc.findings.length, pmr: snapshot.data.reporting.pmr.findingIds.length,
    pmrReview: snapshot.data.reporting.pmr.reviewFindingIds.length, pmcp: snapshot.data.reporting.pmcp.selectedCareItemIds.length,
    pmcpCandidates: snapshot.data.reporting.pmcp.candidateCareItemIds.length,
    workflow: snapshot.data.workflow.actions.length, photos: snapshot.data.media.assets.length
  };
}
