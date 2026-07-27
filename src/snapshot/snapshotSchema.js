export const THA_SNAPSHOT_FILE_TYPE = 'tha-snapshot';
export const THA_SNAPSHOT_SCHEMA_VERSION = 1;
export const THA_SNAPSHOT_APP_VERSION = '3.57';
export const THA_SNAPSHOT_FILE_NAME = 'Restore This THA Snapshot.json';

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

function snapshotId(value = '') {
  const supplied = text(value);
  if (supplied) return supplied;
  if (globalThis.crypto?.randomUUID) return `snapshot-${globalThis.crypto.randomUUID()}`;
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function answersFromRows(rows = []) {
  if (!Array.isArray(rows)) return {};
  return Object.fromEntries(rows
    .filter(row => row && row.id !== undefined && row.id !== null && isPlainObject(row.answer))
    .map(row => [String(row.id), clone(row.answer, {})]));
}

function currentShapeFromSource(source = {}) {
  const htc = isPlainObject(source.htc) ? source.htc : {};
  const pass = isPlainObject(source.pass) ? source.pass : {};
  return {
    client: clone(source.client, {}),
    answers: clone(htc.answers ?? source.answers ?? answersFromRows(source.rows), {}),
    intake: clone(source.intake, {}),
    dynamicRooms: clone(htc.dynamicRooms ?? source.dynamicRooms, []),
    sectionOrder: clone(htc.sectionOrder ?? source.sectionOrder, []),
    itemOrder: clone(htc.itemOrder ?? source.itemOrder, {}),
    pinnedItems: clone(htc.pinnedItems ?? source.pinnedItems, {}),
    roomCapture: clone(htc.roomCapture ?? source.roomCapture, {}),
    passReview: clone(pass.review ?? source.passReview, {}),
    roomOverviewExpandedByRoom: {},
    smartPromptExpandedByRoom: {},
    expandedChecklistItems: {}
  };
}

function canonicalData({ walkthroughName = '', data = {} } = {}) {
  const current = currentShapeFromSource(data);
  return {
    walkthroughName: text(walkthroughName || data.walkthroughName),
    client: current.client,
    intake: current.intake,
    htc: {
      answers: current.answers,
      dynamicRooms: current.dynamicRooms,
      roomCapture: current.roomCapture,
      sectionOrder: current.sectionOrder,
      itemOrder: current.itemOrder,
      pinnedItems: current.pinnedItems
    },
    pass: {
      review: current.passReview
    }
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
  return {
    fileType: THA_SNAPSHOT_FILE_TYPE,
    schemaVersion: THA_SNAPSHOT_SCHEMA_VERSION,
    appVersion: THA_SNAPSHOT_APP_VERSION,
    snapshotId: snapshotId(sessionId),
    createdAt: text(createdAt || stamp),
    updatedAt: stamp,
    data: canonicalData({ walkthroughName: sessionName, data })
  };
}

function unwrapLegacyPayload(input = {}) {
  if (!isPlainObject(input)) return {};
  if (input.fileType === THA_SNAPSHOT_FILE_TYPE) return input;
  if (isPlainObject(input.data) && (input.data.client || input.data.answers || input.data.rows || input.data.intake)) {
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
    if (Number(source.schemaVersion) !== THA_SNAPSHOT_SCHEMA_VERSION) {
      throw new Error(`Unsupported THA Snapshot schema version: ${source.schemaVersion || 'unknown'}.`);
    }
    return {
      ...source,
      data: canonicalData({
        walkthroughName: source.data?.walkthroughName || '',
        data: source.data || {}
      })
    };
  }

  const hasLegacySnapshotData = Boolean(
    source.client || source.intake || source.answers || source.rows || source.pmr || source.roomCapture || source.passReview
  );
  if (!hasLegacySnapshotData) {
    throw new Error('This file does not look like a THA Snapshot or legacy THA walkthrough export.');
  }

  return createSnapshotDocument({
    sessionId: source.snapshotId || source.id || '',
    sessionName: source.walkthroughName || source.name || '',
    data: source,
    createdAt: source.createdAt || source.exportedAt || '',
    updatedAt: source.updatedAt || source.exportedAt || ''
  });
}

export function validateSnapshotDocument(input = {}) {
  const snapshot = migrateLegacySnapshot(input);
  if (snapshot.fileType !== THA_SNAPSHOT_FILE_TYPE) {
    throw new Error('Invalid THA Snapshot file type.');
  }
  if (!isPlainObject(snapshot.data)) {
    throw new Error('THA Snapshot data is missing.');
  }
  if (!isPlainObject(snapshot.data.client)) {
    throw new Error('THA Snapshot client data is missing.');
  }
  if (!isPlainObject(snapshot.data.htc)) {
    throw new Error('THA Snapshot HTC data is missing.');
  }
  return snapshot;
}

export function snapshotToWalkthroughData(input = {}) {
  const snapshot = validateSnapshotDocument(input);
  return currentShapeFromSource({
    ...snapshot.data,
    htc: snapshot.data.htc,
    pass: snapshot.data.pass
  });
}
