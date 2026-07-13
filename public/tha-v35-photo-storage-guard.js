(() => {
  const WALKTHROUGH_SESSIONS_KEY = 'tha-walkthrough-sessions';
  const PHOTO_DB_NAME = 'tha-photo-safety-cache-v1';
  const PHOTO_STORE_NAME = 'photos';
  const PHOTO_CACHE_KEYS_META = 'tha-photo-safety-cache-keys-v1';
  const PHOTO_CACHE_STATUS_META = 'tha-photo-safety-cache-meta';
  const GUARD_STATUS_KEY = 'tha-photo-storage-guard-status-v1';

  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  let knownCachedKeys = new Set(readJson(PHOTO_CACHE_KEYS_META, []));
  let lastWrite = null;
  let caching = false;

  function readJson(key, fallback) {
    try {
      const raw = originalGetItem.call(localStorage, key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      originalSetItem.call(localStorage, key, JSON.stringify(value));
    } catch {
      // Helpful metadata only.
    }
  }

  function estimateKb(text = '') {
    return Math.round((String(text).length * 2) / 1024);
  }

  function photoKey({ sessionId = '', location = '', ownerKey = '', photo = {}, index = 0 }) {
    return [
      sessionId || 'walkthrough',
      location || 'photo',
      ownerKey || 'owner',
      photo.id || photo.name || index
    ].map(part => String(part || '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80)).join(':');
  }

  function isPhotoLike(value) {
    return value && typeof value === 'object' && typeof value.dataUrl === 'string' && value.dataUrl.startsWith('data:image/');
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available.'));
        return;
      }
      const request = indexedDB.open(PHOTO_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
          db.createObjectStore(PHOTO_STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Unable to open photo cache.'));
    });
  }

  function putPhotoRecords(records) {
    return new Promise(async (resolve, reject) => {
      if (!records.length) {
        resolve({ count: 0, dataChars: 0 });
        return;
      }
      try {
        const db = await openDb();
        const tx = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = tx.objectStore(PHOTO_STORE_NAME);
        let dataChars = 0;
        records.forEach(record => {
          dataChars += String(record.dataUrl || '').length;
          store.put(record);
        });
        tx.oncomplete = () => {
          db.close?.();
          resolve({ count: records.length, dataChars });
        };
        tx.onerror = () => {
          db.close?.();
          reject(tx.error || new Error('Photo cache write failed.'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  function cloneAndCollectSessions(sessions, { slimCached = false } = {}) {
    const clone = JSON.parse(JSON.stringify(sessions || {}));
    const records = [];
    let totalPhotos = 0;
    let fullDataPhotos = 0;
    let strippedPhotos = 0;

    Object.entries(clone || {}).forEach(([sessionId, session]) => {
      const data = session?.data || {};
      Object.entries(data.roomCapture || {}).forEach(([roomKey, capture]) => {
        if (!Array.isArray(capture?.photos)) return;
        capture.photos = capture.photos.map((photo, index) => processPhoto(photo, { sessionId, location: 'room', ownerKey: roomKey, index }));
      });
      Object.entries(data.answers || {}).forEach(([answerKey, answer]) => {
        if (!Array.isArray(answer?.photos)) return;
        answer.photos = answer.photos.map((photo, index) => processPhoto(photo, { sessionId, location: 'item', ownerKey: answerKey, index }));
      });
    });

    function processPhoto(photo, context) {
      if (!photo || typeof photo !== 'object') return photo;
      totalPhotos += 1;
      const key = photo.cacheKey || photo.storageKey || photoKey({ ...context, photo });
      const next = { ...photo, cacheKey: key, storageKey: key };
      if (isPhotoLike(photo)) {
        fullDataPhotos += 1;
        records.push({
          key,
          sessionId: context.sessionId,
          location: context.location,
          ownerKey: context.ownerKey,
          name: photo.name || 'photo.jpg',
          type: photo.type || 'image/jpeg',
          label: photo.label || '',
          dataUrl: photo.dataUrl,
          thumbnailDataUrl: photo.thumbnailDataUrl || '',
          uploadStatus: photo.uploadStatus || 'local',
          driveFileId: photo.driveFileId || '',
          driveFileName: photo.driveFileName || '',
          driveViewLink: photo.driveViewLink || photo.webViewLink || '',
          cachedAt: new Date().toISOString()
        });
        if (slimCached && knownCachedKeys.has(key)) {
          strippedPhotos += 1;
          next.dataUrl = '';
          next.photoStorage = 'indexeddb';
          next.cacheStatus = 'cached';
          next.needsRestoreForDrive = !next.driveFileId && !next.driveViewLink && !next.webViewLink;
        } else {
          next.cacheStatus = 'pending-cache';
        }
      }
      return next;
    }

    return { clone, records, totalPhotos, fullDataPhotos, strippedPhotos };
  }

  function writeGuardStatus(status) {
    writeJson(GUARD_STATUS_KEY, {
      ...status,
      updatedAt: new Date().toISOString()
    });
  }

  async function cacheThenSlimOriginalSave(rawValue) {
    if (caching) return;
    caching = true;
    try {
      const sessions = JSON.parse(rawValue || '{}') || {};
      const firstPass = cloneAndCollectSessions(sessions, { slimCached: false });
      const recordsToCache = firstPass.records.filter(record => !knownCachedKeys.has(record.key));
      writeGuardStatus({ state: recordsToCache.length ? 'caching' : 'ready', message: recordsToCache.length ? `Caching ${recordsToCache.length} photo payload${recordsToCache.length === 1 ? '' : 's'} before slimming local save.` : 'Photo cache already current.', pending: recordsToCache.length, stripped: 0 });
      if (recordsToCache.length) {
        await putPhotoRecords(recordsToCache);
        recordsToCache.forEach(record => knownCachedKeys.add(record.key));
        writeJson(PHOTO_CACHE_KEYS_META, Array.from(knownCachedKeys));
      }
      const slimPass = cloneAndCollectSessions(sessions, { slimCached: true });
      const slimValue = JSON.stringify(slimPass.clone);
      originalSetItem.call(localStorage, WALKTHROUGH_SESSIONS_KEY, slimValue);
      writeJson(PHOTO_CACHE_STATUS_META, {
        supported: 'indexedDB' in window,
        cachedCount: knownCachedKeys.size,
        cachedDataKb: Math.round((recordsToCache.reduce((sum, record) => sum + String(record.dataUrl || '').length, 0) * 0.75) / 1024),
        lastCachedAt: new Date().toISOString(),
        status: 'cached',
        error: ''
      });
      writeGuardStatus({
        state: 'slimmed',
        message: `Photo payloads cached outside localStorage. ${slimPass.strippedPhotos} photo payload${slimPass.strippedPhotos === 1 ? '' : 's'} slimmed from the saved walkthrough copy.`,
        pending: 0,
        stripped: slimPass.strippedPhotos,
        localStorageKb: estimateKb(slimValue)
      });
      window.dispatchEvent(new Event('tha-photo-storage-guard-updated'));
    } catch (error) {
      writeGuardStatus({ state: 'error', message: error?.message || 'Photo storage guard could not cache/slim photos safely.', pending: 0, stripped: 0 });
    } finally {
      caching = false;
    }
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    if (this === localStorage && key === WALKTHROUGH_SESSIONS_KEY && typeof value === 'string') {
      lastWrite = value;
      try {
        const sessions = JSON.parse(value || '{}') || {};
        const safePass = cloneAndCollectSessions(sessions, { slimCached: true });
        const safeValue = JSON.stringify(safePass.clone);
        originalSetItem.call(this, key, safeValue);
        window.setTimeout(() => cacheThenSlimOriginalSave(lastWrite), 0);
        return;
      } catch {
        // Fall through to normal save if parsing fails.
      }
    }
    return originalSetItem.call(this, key, value);
  };

  window.THA_PHOTO_STORAGE_GUARD = {
    cacheNow() {
      const raw = originalGetItem.call(localStorage, WALKTHROUGH_SESSIONS_KEY) || lastWrite || '{}';
      return cacheThenSlimOriginalSave(raw);
    },
    status() {
      return readJson(GUARD_STATUS_KEY, { state: 'unknown' });
    },
    originalGetItem(key) {
      return originalGetItem.call(localStorage, key);
    },
    originalRemoveItem(key) {
      return originalRemoveItem.call(localStorage, key);
    }
  };

  writeGuardStatus({ state: 'ready', message: 'Photo storage guard loaded before React app.', pending: 0, stripped: 0 });
})();
