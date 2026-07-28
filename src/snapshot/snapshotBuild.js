import {
  THA_SNAPSHOT_APP_VERSION, answerMapAndRows, list, mediaAsset, object, pmcpDecision,
  pmrDecision, rowContext, safeIdPart, text, withoutKeys, workflowProjection
} from './snapshotPrimitives.js';

function careSource(item = {}) {
  const findingIds = list(item.sourceEvidence?.htcRows)
    .map(row => row?.id).filter(id => id !== undefined && id !== null)
    .map(id => `finding-${safeIdPart(id)}`);
  return { type: text(item.source) || (findingIds.length ? 'htc-finding' : 'pass-catalog'), sourceId: text(item.careTopicId || item.id), findingIds };
}
function isoDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function nextYearDate(value = '') {
  const parsed = value ? new Date(`${value}T12:00:00`) : new Date();
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + 1);
  return isoDate(next);
}

function careItems(source, findings, workflowActions) {
  const reviewMap = object(source.passReview ?? source.continuedCare?.review ?? source.pass?.review);
  const supplied = [...list(source.passCareCandidates), ...list(source.passCareOutlook), ...list(source.continuedCare?.items)];
  const byId = new Map();
  supplied.forEach(item => {
    const id = text(item?.careItemId || item?.id || item?.careTopicId);
    if (id) byId.set(id, { ...object(byId.get(id)), ...object(item) });
  });
  Object.keys(reviewMap).forEach(id => { if (!byId.has(id)) byId.set(id, {}); });
  findings.filter(f => f.continuedCare.candidate).forEach(finding => {
    const id = finding.continuedCare.careItemId;
    if (!byId.has(id)) byId.set(id, {
      id, careItem: finding.context.item || 'HTC continued-care item', source: 'htc-finding',
      resource: finding.fields.passResource || finding.fields.trade || finding.context.tradeDefault,
      cadence: finding.fields.passCadence || 'As Needed',
      reason: finding.fields.passNote || finding.context.why,
      sourceEvidence: { htcRows: [{ id: finding.templateItemId }] }
    });
  });
  return [...byId.entries()].map(([careItemId, value]) => {
    const decision = pmcpDecision(value, reviewMap[careItemId]);
    const baseFields = { ...object(value), ...object(reviewMap[careItemId]), id: value.id || careItemId };
    const fields = decision === 'declined'
      ? {
          ...baseFields,
          followUpStatus: baseFields.followUpStatus === 'Completed' ? 'Completed' : 'Deferred',
          deferredAt: text(baseFields.deferredAt) || isoDate(),
          deferredReminderDate: text(baseFields.deferredReminderDate) || nextYearDate(text(baseFields.deferredAt)),
          deferredReason: text(baseFields.deferredReason) || 'Not this year'
        }
      : baseFields;
    const workflow = workflowProjection('continued-care', careItemId, fields);
    if (workflow) workflowActions.push(workflow);
    return {
      careItemId, source: careSource(fields), fields,
      reporting: { pmcpDecision: decision, clientVisible: fields.clientVisible !== false, internalOnlyNoteFields: ['internalNote'] },
      workflowActionIds: workflow ? [workflow.actionId] : []
    };
  });
}

export function buildCanonicalSource(source = {}) {
  const extensions = object(source.snapshotExtensions);
  const { answers, rowById } = answerMapAndRows(source);
  const media = list(source.supplementalMedia ?? extensions.supplementalMedia).filter(asset => asset?.mediaId);
  const workflowActions = list(source.nativeWorkflowActions ?? extensions.nativeWorkflowActions).filter(action => action?.actionId && !action.generatedFromSource);

  const findings = Object.entries(answers).map(([itemId, answerValue]) => {
    const answer = object(answerValue);
    const context = rowContext(object(rowById.get(String(itemId))), itemId);
    const findingId = `finding-${safeIdPart(itemId)}`;
    const photoIds = list(answer.photos).map(photo => {
      const asset = mediaAsset(photo, {
        scope: 'finding-evidence', ownerType: 'finding', ownerId: findingId,
        roomId: context.roomId || text(answer.roomId || answer.sectionKey), clientVisible: answer.photoClientVisible !== false
      });
      media.push(asset); return asset.mediaId;
    });
    const fields = withoutKeys(answer, ['photos']);
    const workflow = workflowProjection('finding', findingId, fields);
    if (workflow) workflowActions.push(workflow);
    return {
      findingId, templateItemId: String(itemId),
      templateReference: { appVersion: THA_SNAPSHOT_APP_VERSION, itemId: String(itemId) },
      roomId: context.roomId || text(answer.roomId || answer.sectionKey), context, fields,
      reporting: { pmrDecision: pmrDecision(itemId, fields, context), clientVisible: fields.clientVisible !== false, internalOnlyNoteFields: ['internalNote'] },
      continuedCare: { candidate: Boolean(fields.addToPmcpBuilder || fields.passCandidate), careItemId: Boolean(fields.addToPmcpBuilder || fields.passCandidate) ? `manual-pass-${safeIdPart(itemId)}` : '' },
      workflowActionIds: workflow ? [workflow.actionId] : [], photoIds
    };
  });

  const roomCapture = Object.entries(object(source.roomCapture ?? source.htc?.roomCapture)).map(([roomId, captureValue]) => {
    const capture = object(captureValue);
    const photoIds = list(capture.photos).map(photo => {
      const asset = mediaAsset(photo, { scope: 'room-overview', ownerType: 'room', ownerId: roomId, roomId, clientVisible: capture.photoClientVisible !== false });
      media.push(asset); return asset.mediaId;
    });
    const fields = withoutKeys(capture, ['photos']);
    const workflow = workflowProjection('room', roomId, fields);
    if (workflow) workflowActions.push(workflow);
    return { roomId, fields, workflowActionIds: workflow ? [workflow.actionId] : [], photoIds };
  });

  const continuedCareItems = careItems(source, findings, workflowActions);
  const pmrFindingIds = findings.filter(f => f.reporting.pmrDecision === 'included' && f.reporting.clientVisible).map(f => f.findingId);
  const pmrReviewIds = findings.filter(f => f.reporting.pmrDecision === 'review').map(f => f.findingId);
  const pmcpSelectedIds = continuedCareItems.filter(item => item.reporting.pmcpDecision === 'selected' && item.reporting.clientVisible).map(item => item.careItemId);
  const pmcpCandidateIds = continuedCareItems.filter(item => item.reporting.pmcpDecision === 'pending').map(item => item.careItemId);

  return {
    walkthroughName: text(source.walkthroughName), client: object(source.client),
    property: { address: text(source.property?.address || extensions.property?.address || source.client?.address), fields: object(source.property?.fields ?? extensions.property?.fields) },
    intake: object(source.intake),
    rooms: { dynamic: list(source.dynamicRooms ?? source.htc?.dynamicRooms), capture: roomCapture },
    htc: { findings, sectionOrder: list(source.sectionOrder ?? source.htc?.sectionOrder), itemOrder: object(source.itemOrder ?? source.htc?.itemOrder), pinnedItems: object(source.pinnedItems ?? source.htc?.pinnedItems) },
    continuedCare: { items: continuedCareItems },
    workflow: { actions: workflowActions, sourceRule: 'Actions point back to the finding, room, or continued-care record that created them.' },
    administration: {
      lifecycleStatus: text(source.administration?.lifecycleStatus || extensions.administration?.lifecycleStatus) || 'working',
      reportStatus: {
        pmr: text(source.administration?.reportStatus?.pmr || extensions.administration?.reportStatus?.pmr) || 'source-ready',
        pmcp: text(source.administration?.reportStatus?.pmcp || extensions.administration?.reportStatus?.pmcp) || 'source-ready',
        delivery: text(source.administration?.reportStatus?.delivery || extensions.administration?.reportStatus?.delivery) || 'not-delivered'
      },
      externalReferences: object(source.administration?.externalReferences ?? extensions.administration?.externalReferences),
      requiredHomeReferences: object(source.administration?.requiredHomeReferences ?? extensions.administration?.requiredHomeReferences),
      internalNotes: text(source.administration?.internalNotes || extensions.administration?.internalNotes)
    },
    media: { assets: media },
    reporting: {
      pmr: { findingIds: pmrFindingIds, reviewFindingIds: pmrReviewIds, source: 'data.htc.findings', rule: 'Only included, client-visible source findings are PMR candidates.' },
      pmcp: { selectedCareItemIds: pmcpSelectedIds, candidateCareItemIds: pmcpCandidateIds, source: 'data.continuedCare.items', rule: 'Continued care remains separate from PMR defect counts.' },
      privacy: { internalOnlyAreas: ['data.workflow', 'data.administration.internalNotes'], internalOnlyFieldNames: ['internalNote'] }
    },
    connections: { sourceOfTruth: 'THA Snapshot', pmrFindingIds, pmcpCareItemIds: [...pmcpSelectedIds, ...pmcpCandidateIds], workflowActionIds: workflowActions.map(a => a.actionId), mediaIds: media.map(a => a.mediaId) }
  };
}
