export const THA_SNAPSHOT_FILE_TYPE = 'tha-snapshot';
export const THA_SNAPSHOT_SCHEMA_VERSION = 2;
export const THA_SNAPSHOT_APP_VERSION = '3.57.1';
export const THA_SNAPSHOT_FILE_NAME = 'Restore This THA Snapshot.json';

const PMR_INCLUDED_STATUSES = new Set(['Immediate Concern', 'Needs Attention', 'Monitor']);
const PMR_EXCLUDED_STATUSES = new Set(['Good', 'Unknown']);
const PMCP_DECISIONS = new Set(['pending', 'selected', 'declined']);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clone(value, fallback) {
  if (value === undefined || value === null) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function text(value = '') {
  return String(value ?? '').trim();
}

function list(value) {
  return Array.isArray(value) ? clone(value, []) : [];
}

function object(value) {
  return isPlainObject(value) ? clone(value, {}) : {};
}

function snapshotId(value = '') {
  const supplied = text(value);
  if (supplied) return supplied;
  if (globalThis.crypto?.randomUUID) return `snapshot-${globalThis.crypto.randomUUID()}`;
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeIdPart(value = '') {
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'record';
}

function withoutKeys(source = {}, keys = []) {
  const blocked = new Set(keys);
  return Object.fromEntries(Object.entries(object(source)).filter(([key]) => !blocked.has(key)));
}

function pmrDecisionFor(itemId, fields = {}) {
  if (String(itemId).startsWith('intake-follow-up-')) return 'excluded';
  if (typeof fields.includeInPmr === 'boolean') return fields.includeInPmr ? 'included' : 'excluded';
  const status = text(fields.status);
  if (PMR_INCLUDED_STATUSES.has(status)) return 'included';
  if (PMR_EXCLUDED_STATUSES.has(status)) return 'excluded';
  return 'review';
}

function pmcpDecisionFor(fields = {}) {
  const decision = text(fields.pmcpDecision).toLowerCase();
  if (PMCP_DECISIONS.has(decision)) return decision;
  return 'pending';
}

function workflowProjection({ sourceType, sourceId, fields = {} }) {
  const selected = Boolean(fields.thaActionItem);
  const actionType = text(fields.thaActionType) || 'Unknown';
  if (!selected && actionType === 'Unknown') return null;
  return {
    actionId: `workflow-${safeIdPart(sourceType)}-${safeIdPart(sourceId)}`,
    source: { entityType: sourceType, entityId: sourceId },
    sourceOfTruth: {
      selectedPath: 'fields.thaActionItem',
      actionTypePath: 'fields.thaActionType',
      followUpStatusPath: 'fields.followUpStatus',
      internalNotePath: 'fields.internalNote'
    },
    selected,
    actionType,
    followUpStatus: text(fields.followUpStatus) || 'Not Scheduled',
    internalNote: text(fields.internalNote),
    clientVisible: false,
    generatedFromSource: true
  };
}

function mediaAsset(photo = {}, owner = {}) {
  const suppliedId = text(photo.id);
  const id = suppliedId || `photo-${safeIdPart(owner.ownerType)}-${safeIdPart(owner.ownerId)}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    mediaId: id,
    scope: owner.scope,
    ownerType: owner.ownerType,
    ownerId: owner.ownerId,
    roomId: owner.roomId || '',
    clientVisible: owner.clientVisible !== false,
    fields: clone({ ...photo, id }, {})
  };
}

function normalizeAnswerMap(source = {}) {
  if (isPlainObject(source.answers)) return source.answers;
  if (!Array.isArray(source.rows)) return {};
  return Object.fromEntries(source.rows
    .filter(row => row && row.id !== undefined && row.id !== null && isPlainObject(row.answer))
    .map(row => [String(row.id), clone(row.answer, {})]));
}

function buildCanonicalSource(source = {}) {
  const extensions = object(source.snapshotExtensions);
  const answers = normalizeAnswerMap(source.htc || source);
  const dynamicRooms = list(source.htc?.dynamicRooms ?? source.dynamicRooms);
  const roomCaptureMap = object(source.htc?.roomCapture ?? source.roomCapture);
  const passReviewMap = object(source.continuedCare?.review ?? source.pass?.review ?? source.passReview);
  const supplementalMedia = list(source.supplementalMedia ?? extensions.supplementalMedia)
    .filter(asset => isPlainObject(asset) && asset.mediaId);
  const media = [...supplementalMedia];
  const nativeWorkflowActions = list(source.nativeWorkflowActions ?? extensions.nativeWorkflowActions)
    .filter(action => isPlainObject(action) && action.actionId && !action.generatedFromSource);
  const workflowActions = [...nativeWorkflowActions];

  const findings = Object.entries(answers).map(([itemId, answerValue]) => {
    const answer = object(answerValue);
    const findingId = `finding-${safeIdPart(itemId)}`;
    const photos = list(answer.photos);
    const photoIds = photos.map(photo => {
      const asset = mediaAsset(photo, {
        scope: 'finding-evidence',
        ownerType: 'finding',
        ownerId: findingId,
        roomId: text(answer.roomId || answer.sectionKey),
        clientVisible: answer.photoClientVisible !== false
      });
      media.push(asset);
      return asset.mediaId;
    });
    const fields = withoutKeys(answer, ['photos']);
    const workflow = workflowProjection({ sourceType: 'finding', sourceId: findingId, fields });
    if (workflow) workflowActions.push(workflow);
    return {
      findingId,
      templateItemId: String(itemId),
      templateReference: { appVersion: THA_SNAPSHOT_APP_VERSION, itemId: String(itemId) },
      roomId: text(answer.roomId || answer.sectionKey),
      fields,
      reporting: {
        pmrDecision: pmrDecisionFor(itemId, fields),
        clientVisible: fields.clientVisible !== false,
        internalOnlyNoteFields: ['internalNote']
      },
      continuedCare: {
        candidate: Boolean(fields.addToPmcpBuilder || fields.passCandidate),
        careItemId: Boolean(fields.addToPmcpBuilder || fields.passCandidate) ? `manual-pass-${safeIdPart(itemId)}` : ''
      },
      workflowActionIds: workflow ? [workflow.actionId] : [],
      photoIds
    };
  });

  const roomCapture = Object.entries(roomCaptureMap).map(([roomId, captureValue]) => {
    const capture = object(captureValue);
    const photos = list(capture.photos);
    const photoIds = photos.map(photo => {
      const asset = mediaAsset(photo, {
        scope: 'room-overview',
        ownerType: 'room',
        ownerId: roomId,
        roomId,
        clientVisible: capture.photoClientVisible !== false
      });
      media.push(asset);
      return asset.mediaId;
    });
    const fields = withoutKeys(capture, ['photos']);
    const workflow = workflowProjection({ sourceType: 'room', sourceId: roomId, fields });
    if (workflow) workflowActions.push(workflow);
    return {
      roomId,
      fields,
      workflowActionIds: workflow ? [workflow.actionId] : [],
      photoIds
    };
  });

  const reviewedCareItems = Object.entries(passReviewMap).map(([careItemId, reviewValue]) => {
    const fields = object(reviewValue);
    const workflow = workflowProjection({ sourceType: 'continued-care', sourceId: careItemId, fields });
    if (workflow) workflowActions.push(workflow);
    return {
      careItemId,
      source: { type: 'pass-review', sourceId: careItemId },
      fields,
      reporting: {
        pmcpDecision: pmcpDecisionFor(fields),
        clientVisible: fields.clientVisible !== false,
        internalOnlyNoteFields: ['internalNote']
      },
      workflowActionIds: workflow ? [workflow.actionId] : []
    };
  });

  const reviewedCareIds = new Set(reviewedCareItems.map(item => item.careItemId));
  const candidateCareItems = findings
    .filter(finding => finding.continuedCare.candidate && !reviewedCareIds.has(finding.continuedCare.careItemId))
    .map(finding => ({
      careItemId: finding.continuedCare.careItemId,
      source: { type: 'htc-finding', sourceId: finding.findingId },
      fields: {},
      reporting: { pmcpDecision: 'pending', clientVisible: true, internalOnlyNoteFields: ['internalNote'] },
      workflowActionIds: []
    }));

  const continuedCareItems = [...reviewedCareItems, ...candidateCareItems];
  const pmrFindingIds = findings.filter(item => item.reporting.pmrDecision === 'included').map(item => item.findingId);
  const pmrReviewIds = findings.filter(item => item.reporting.pmrDecision === 'review').map(item => item.findingId);
  const pmcpSelectedIds = continuedCareItems.filter(item => item.reporting.pmcpDecision === 'selected').map(item => item.careItemId);
  const pmcpCandidateIds = continuedCareItems.filter(item => item.reporting.pmcpDecision === 'pending').map(item => item.careItemId);

  return {
    walkthroughName: text(source.walkthroughName),
    client: object(source.client),
    property: {
      address: text(source.property?.address || extensions.property?.address || source.client?.address),
      fields: object(source.property?.fields ?? extensions.property?.fields)
    },
    intake: object(source.intake),
    rooms: {
      dynamic: dynamicRooms,
      capture: roomCapture
    },
    htc: {
      findings,
      sectionOrder: list(source.htc?.sectionOrder ?? source.sectionOrder),
      itemOrder: object(source.htc?.itemOrder ?? source.itemOrder),
      pinnedItems: object(source.htc?.pinnedItems ?? source.pinnedItems)
    },
    continuedCare: {
      items: continuedCareItems
    },
    workflow: {
      actions: workflowActions,
      sourceRule: 'Workflow actions point back to the finding, room, or continued-care fields that created them.'
    },
    administration: {
      lifecycleStatus: text(source.administration?.lifecycleStatus || extensions.administration?.lifecycleStatus) || 'working',
      reportStatus: {
        pmr: text(source.administration?.reportStatus?.pmr || extensions.administration?.reportStatus?.pmr) || 'source-ready',
        pmcp: text(source.administration?.reportStatus?.pmcp || extensions.administration?.reportStatus?.pmcp) || 'source-ready',
        delivery: text(source.administration?.reportStatus?.delivery || extensions.administration?.reportStatus?.delivery) || 'not-delivered'
      },
      externalReferences: object(source.administration?.externalReferences ?? extensions.administration?.externalReferences),
      internalNotes: text(source.administration?.internalNotes || extensions.administration?.internalNotes)
    },
    media: {
      assets: media
    },
    reporting: {
      pmr: {
        findingIds: pmrFindingIds,
        reviewFindingIds: pmrReviewIds,
        source: 'data.htc.findings',
        rule: 'Only source findings marked included are client-report candidates.'
      },
      pmcp: {
        selectedCareItemIds: pmcpSelectedIds,
        candidateCareItemIds: pmcpCandidateIds,
        source: 'data.continuedCare.items',
        rule: 'Continued care stays separate from defect counts and enters the PMCP through its own decision.'
      },
      privacy: {
        internalOnlyAreas: ['data.workflow', 'data.administration.internalNotes'],
        internalOnlyFieldNames: ['internalNote']
      }
    },
    connections: {
      sourceOfTruth: 'THA Snapshot',
      pmrFindingIds,
      pmcpCareItemIds: [...pmcpSelectedIds, ...pmcpCandidateIds],
      workflowActionIds: workflowActions.map(action => action.actionId),
      mediaIds: media.map(asset => asset.mediaId)
    }
  };
}

function canonicalV1ToLegacyShape(source = {}) {
  const htc = isPlainObject(source.htc) ? source.htc : {};
  const pass = isPlainObject(source.pass) ? source.pass : {};
  return {
    walkthroughName: text(source.walkthroughName),
    client: object(source.client),
    intake: object(source.intake),
    answers: object(htc.answers ?? source.answers ?? normalizeAnswerMap(source)),
    dynamicRooms: list(htc.dynamicRooms ?? source.dynamicRooms),
    sectionOrder: list(htc.sectionOrder ?? source.sectionOrder),
    itemOrder: object(htc.itemOrder ?? source.itemOrder),
    pinnedItems: object(htc.pinnedItems ?? source.pinnedItems),
    roomCapture: object(htc.roomCapture ?? source.roomCapture),
    passReview: object(pass.review ?? source.passReview),
    property: object(source.property),
    administration: object(source.administration),
    snapshotExtensions: object(source.snapshotExtensions)
  };
}

export function createSnapshotDocument({
  sessionId = '',
  sessionName = '',
  data = {},
  createdAt = '',
  updatedAt = '',
  now = new Date().toISOString()
} = {}) {
  const stamp = text(updatedAt || now) || new Date().toISOString();
  const source = {
    ...object(data),
    walkthroughName: text(sessionName || data.walkthroughName)
  };
  return {
    fileType: THA_SNAPSHOT_FILE_TYPE,
    schemaVersion: THA_SNAPSHOT_SCHEMA_VERSION,
    appVersion: THA_SNAPSHOT_APP_VERSION,
    snapshotId: snapshotId(sessionId),
    createdAt: text(createdAt || stamp),
    updatedAt: stamp,
    data: buildCanonicalSource(source)
  };
}

function unwrapLegacyPayload(input = {}) {
  if (!isPlainObject(input)) return {};
  if (input.fileType === THA_SNAPSHOT_FILE_TYPE) return input;
  if (isPlainObject(input.data) && (input.data.client || input.data.answers || input.data.rows || input.data.intake || input.data.htc)) {
    return {
      ...input.data,
      walkthroughName: input.data.walkthroughName || input.name || input.walkthroughName || ''
    };
  }
  return input;
}

export function migrateLegacySnapshot(input = {}) {
  const source = unwrapLegacyPayload(input);
  if (source.fileType === THA_SNAPSHOT_FILE_TYPE) {
    const version = Number(source.schemaVersion || 1);
    if (version === THA_SNAPSHOT_SCHEMA_VERSION) {
      return {
        ...source,
        appVersion: source.appVersion || THA_SNAPSHOT_APP_VERSION,
        data: buildCanonicalSource(snapshotToWalkthroughDataUnsafe(source))
      };
    }
    if (version === 1) {
      return createSnapshotDocument({
        sessionId: source.snapshotId,
        sessionName: source.data?.walkthroughName || '',
        data: canonicalV1ToLegacyShape(source.data || {}),
        createdAt: source.createdAt,
        updatedAt: source.updatedAt
      });
    }
    throw new Error(`Unsupported THA Snapshot schema version: ${source.schemaVersion || 'unknown'}.`);
  }

  const hasLegacySnapshotData = Boolean(
    source.client || source.intake || source.answers || source.rows || source.pmr || source.roomCapture || source.passReview || source.htc
  );
  if (!hasLegacySnapshotData) {
    throw new Error('This file does not look like a THA Snapshot or legacy THA walkthrough export.');
  }

  return createSnapshotDocument({
    sessionId: source.snapshotId || source.id || '',
    sessionName: source.walkthroughName || source.name || '',
    data: canonicalV1ToLegacyShape(source),
    createdAt: source.createdAt || source.exportedAt || '',
    updatedAt: source.updatedAt || source.exportedAt || ''
  });
}

export function validateSnapshotDocument(input = {}) {
  const snapshot = migrateLegacySnapshot(input);
  if (snapshot.fileType !== THA_SNAPSHOT_FILE_TYPE) throw new Error('Invalid THA Snapshot file type.');
  if (!isPlainObject(snapshot.data)) throw new Error('THA Snapshot data is missing.');
  if (!isPlainObject(snapshot.data.client)) throw new Error('THA Snapshot client data is missing.');
  if (!isPlainObject(snapshot.data.htc) || !Array.isArray(snapshot.data.htc.findings)) throw new Error('THA Snapshot HTC findings are missing.');
  if (!isPlainObject(snapshot.data.media) || !Array.isArray(snapshot.data.media.assets)) throw new Error('THA Snapshot media index is missing.');
  return snapshot;
}

function snapshotToWalkthroughDataUnsafe(input = {}) {
  const data = object(input.data);
  if (Array.isArray(data.htc?.findings)) {
    const mediaById = new Map(list(data.media?.assets).map(asset => [asset.mediaId, asset]));
    const answers = Object.fromEntries(data.htc.findings.map(finding => {
      const photos = list(finding.photoIds).map(id => mediaById.get(id)?.fields).filter(Boolean);
      return [String(finding.templateItemId), { ...object(finding.fields), photos }];
    }));
    const roomCapture = Object.fromEntries(list(data.rooms?.capture).map(room => {
      const photos = list(room.photoIds).map(id => mediaById.get(id)?.fields).filter(Boolean);
      return [String(room.roomId), { ...object(room.fields), photos }];
    }));
    const passReview = Object.fromEntries(list(data.continuedCare?.items)
      .filter(item => item.source?.type === 'pass-review')
      .map(item => [String(item.careItemId), object(item.fields)]));
    return {
      walkthroughName: text(data.walkthroughName),
      client: object(data.client),
      answers,
      intake: object(data.intake),
      dynamicRooms: list(data.rooms?.dynamic),
      sectionOrder: list(data.htc?.sectionOrder),
      itemOrder: object(data.htc?.itemOrder),
      pinnedItems: object(data.htc?.pinnedItems),
      roomCapture,
      passReview,
      property: object(data.property),
      administration: object(data.administration),
      snapshotExtensions: {
        property: object(data.property),
        administration: object(data.administration),
        nativeWorkflowActions: list(data.workflow?.actions).filter(action => action && !action.generatedFromSource),
        supplementalMedia: list(data.media?.assets).filter(asset => asset && !['finding', 'room'].includes(asset.ownerType))
      }
    };
  }
  return canonicalV1ToLegacyShape(data);
}

export function snapshotToWalkthroughData(input = {}) {
  const snapshot = validateSnapshotDocument(input);
  const current = snapshotToWalkthroughDataUnsafe(snapshot);
  return {
    client: current.client,
    answers: current.answers,
    intake: current.intake,
    dynamicRooms: current.dynamicRooms,
    sectionOrder: current.sectionOrder,
    itemOrder: current.itemOrder,
    pinnedItems: current.pinnedItems,
    roomCapture: current.roomCapture,
    passReview: current.passReview,
    snapshotExtensions: object(current.snapshotExtensions),
    roomOverviewExpandedByRoom: {},
    smartPromptExpandedByRoom: {},
    expandedChecklistItems: {}
  };
}

export function snapshotConnectionSummary(input = {}) {
  const snapshot = validateSnapshotDocument(input);
  return {
    findings: snapshot.data.htc.findings.length,
    pmr: snapshot.data.reporting.pmr.findingIds.length,
    pmrReview: snapshot.data.reporting.pmr.reviewFindingIds.length,
    pmcp: snapshot.data.reporting.pmcp.selectedCareItemIds.length,
    pmcpCandidates: snapshot.data.reporting.pmcp.candidateCareItemIds.length,
    workflow: snapshot.data.workflow.actions.length,
    photos: snapshot.data.media.assets.length
  };
}
