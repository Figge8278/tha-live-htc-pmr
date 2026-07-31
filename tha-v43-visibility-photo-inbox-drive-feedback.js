(() => {
  const SCRIPT_ID = 'tha-v43-visibility-photo-inbox-drive-feedback';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  const VISIBILITY_KEY = 'tha-v43-visibility-decisions';
  const PHOTO_INBOX_KEY = 'tha-v43-photo-inbox-assignments';
  const DRIVE_STATUS_KEY = 'tha-v43-drive-save-status';
  const DRIVE_STRUCTURE_KEY = 'tha-v43-drive-photo-structure';
  const VISIBILITY_OPTIONS = ['Client PMR', 'Internal THA', 'Both', 'Airtable / Calendar Follow-Up', 'Not Used'];
  const PHOTO_TYPES = ['Room Overview', 'Finding Detail', 'Client Submitted', 'Internal THA Reference', 'Unassigned'];
  const PHOTO_SOURCES = ['Tablet / app capture', 'Phone upload', 'Client sent', 'Manual Drive upload', 'Email / text message'];
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  const priorFetch = window.fetch.bind(window);

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function safeJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readVisibility() {
    return safeJson(VISIBILITY_KEY, {});
  }

  function writeVisibility(map) {
    saveJson(VISIBILITY_KEY, map);
  }

  function readPhotoInbox() {
    return Array.isArray(safeJson(PHOTO_INBOX_KEY, [])) ? safeJson(PHOTO_INBOX_KEY, []) : [];
  }

  function writePhotoInbox(items) {
    saveJson(PHOTO_INBOX_KEY, items);
  }

  function parseHeaders(headerText = '') {
    const headers = {};
    headerText.split(/\r?\n/).forEach(line => {
      const index = line.indexOf(':');
      if (index > -1) headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
    });
    return headers;
  }

  async function parseMultipart(body, contentType = '') {
    if (!(body instanceof Blob)) return null;
    const boundary = (body.type || contentType || '').match(/boundary=([^;]+)/i)?.[1];
    if (!boundary) return null;
    const text = await body.text();
    const rawParts = text.split(`--${boundary}`).map(part => part.trim()).filter(part => part && part !== '--');
    const parts = rawParts.map(part => {
      const divider = part.indexOf('\r\n\r\n') > -1 ? '\r\n\r\n' : '\n\n';
      const index = part.indexOf(divider);
      if (index === -1) return null;
      return { headers: parseHeaders(part.slice(0, index)), content: part.slice(index + divider.length).replace(/\r?\n--$/, '').replace(/\r?\n$/, '') };
    }).filter(Boolean);
    const metaPart = parts.find(part => /application\/json/i.test(part.headers['content-type'] || ''));
    const contentPart = parts.find(part => !/application\/json/i.test(part.headers['content-type'] || ''));
    if (!metaPart) return null;
    return { metadata: JSON.parse(metaPart.content), content: contentPart?.content || '', contentType: contentPart?.headers['content-type'] || 'application/octet-stream' };
  }

  function normalizePayload(data = {}) {
    if (data?.client && (data.rows || data.pmr || data.intake)) return data;
    if (data?.data?.client) return data.data;
    return data;
  }

  function authHeaderFrom(init = {}, input = {}) {
    const headers = new Headers(init.headers || input.headers || {});
    return headers.get('authorization') || headers.get('Authorization') || '';
  }

  function roomNameFromRow(row = {}) {
    return row.roomName || row.room || row.section || 'General';
  }

  function itemKey({ source = '', room = '', item = '' } = {}) {
    return [source, room, item].map(value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).filter(Boolean).join('|');
  }

  function currentRoomName() {
    const header = document.querySelector('.roomOverviewCardHeader strong, .roomOverviewCard strong');
    const text = textOf(header).replace(/\s+overview$/i, '');
    return text || textOf(document.querySelector('.roomRailTabs .active, .roomTabs .active, .sectionTab.on')) || 'Current room';
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-v43-visibility-panel{border:1px solid #d8e4ea;border-left:5px solid #7c4dff;background:#fbf8ff;border-radius:16px;padding:12px;margin:12px 0;color:#203040;box-shadow:0 6px 14px rgba(43,30,92,.06)}
      .tha-v43-visibility-panel h4{margin:0 0 6px;color:#0b3658;font-size:15px}.tha-v43-visibility-panel p{margin:3px 0 8px;color:#40505f;font-size:12px;line-height:1.35}.tha-v43-visibility-grid{display:grid;grid-template-columns:minmax(160px,1.1fr) minmax(130px,.9fr);gap:8px;align-items:end}.tha-v43-visibility-panel label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;font-weight:950;color:#6a4b9b}.tha-v43-visibility-panel select{width:100%;min-height:38px;border:1px solid #cdbff0;border-radius:11px;background:#fff;color:#203040;font-weight:850;padding:6px}.tha-v43-followup{display:flex!important;gap:8px!important;align-items:flex-start!important;border:1px solid #e2d8fb;border-radius:12px;background:#fff;padding:8px!important;text-transform:none!important;letter-spacing:0!important;color:#203040!important}.tha-v43-followup input{margin-top:2px}.tha-v43-followup span{font-size:12px;font-weight:850;color:#203040}.tha-v43-chip{display:inline-flex;border-radius:999px;border:1px solid #d8e4ea;background:#fff;color:#0b3658;padding:4px 7px;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.04em;margin-top:6px}.tha-v43-chip.internal{background:#f1ecfb;color:#563e88}.tha-v43-chip.client{background:#eef8eb;color:#285c30}.tha-v43-chip.both{background:#fff7db;color:#785a00}.tha-v43-photo-inbox{border:1px solid #d8e4ea;border-left:5px solid #315568;background:#f8fbfd;border-radius:18px;padding:13px;margin:12px 0;color:#203040}.tha-v43-photo-inbox h4{margin:0 0 4px;color:#0b3658}.tha-v43-photo-inbox p{margin:4px 0;color:#40505f;font-size:12px}.tha-v43-photo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}.tha-v43-photo-grid label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#315568;font-weight:950}.tha-v43-photo-grid input,.tha-v43-photo-grid select{width:100%;min-height:38px;border:1px solid #cfe0e8;border-radius:11px;background:#fff;color:#203040;font-weight:800;padding:6px}.tha-v43-photo-grid .wide{grid-column:1/-1}.tha-v43-photo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.tha-v43-photo-actions button{border-radius:12px!important;font-weight:950!important}.tha-v43-photo-list{display:grid;gap:8px;margin-top:10px}.tha-v43-photo-row{border:1px solid #d8e4ea;background:#fff;border-radius:14px;padding:10px;display:grid;grid-template-columns:1fr auto;gap:8px}.tha-v43-photo-row strong{color:#0b3658}.tha-v43-photo-row small{display:block;color:#60717c;margin-top:2px}.tha-v43-photo-row button{align-self:start}.tha-v43-drive-status{border:1px solid #d8e4ea;border-left:5px solid #52aa4b;background:#f6fcf4;border-radius:14px;padding:9px 11px;margin:9px 0;color:#203040}.tha-v43-drive-status strong{display:block;color:#285c30}.tha-v43-drive-status span{font-size:12px;color:#40505f}.tha-v43-saving{position:relative!important;box-shadow:0 0 0 4px rgba(191,132,32,.14)!important}.tha-v43-saving::after{content:'Saving…';position:absolute;right:10px;bottom:4px;font-size:10px;font-weight:950;color:#8a641f}.tha-v43-saved{position:relative!important;box-shadow:0 0 0 4px rgba(82,170,75,.14)!important}.tha-v43-saved::after{content:'Saved';position:absolute;right:10px;bottom:4px;font-size:10px;font-weight:950;color:#285c30}.tha-v43-folder-note{border:1px solid #d8e4ea;border-left:5px solid #bf8420;background:#fffdf8;border-radius:14px;padding:10px;margin:10px 0;font-size:12px;color:#40505f}.tha-v43-folder-note strong{color:#0b3658}
      @media(max-width:760px){.tha-v43-visibility-grid,.tha-v43-photo-grid{grid-template-columns:1fr}.tha-v43-photo-row{grid-template-columns:1fr}}
      @media print{.tha-v43-visibility-panel,.tha-v43-photo-inbox,.tha-v43-drive-status,.tha-v43-folder-note{display:none!important}}
    `;
    document.head.append(style);
  }

  function chipClass(value = '') {
    if (/internal/i.test(value)) return 'internal';
    if (/both|airtable|calendar/i.test(value)) return 'both';
    if (/client/i.test(value)) return 'client';
    return '';
  }

  function ensureVisibilityPanel(target, data) {
    if (!target || target.querySelector('.tha-v43-visibility-panel')) return;
    const key = itemKey(data);
    const saved = readVisibility()[key] || { visibility: data.defaultVisibility || 'Internal THA', followUp: false };
    const panel = document.createElement('div');
    panel.className = 'tha-v43-visibility-panel';
    panel.dataset.visibilityKey = key;
    panel.innerHTML = `
      <h4>Visibility + Follow-Up</h4>
      <p>Capture this before PMR cleanup so client-facing notes and internal THA actions do not get mixed together.</p>
      <div class="tha-v43-visibility-grid">
        <label>Visibility<select class="tha-v43-visibility-select">${VISIBILITY_OPTIONS.map(option => `<option${option === saved.visibility ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>
        <label class="tha-v43-followup"><input type="checkbox" class="tha-v43-followup-check" ${saved.followUp ? 'checked' : ''}><span>Create THA follow-up / Airtable task</span></label>
      </div>
      <span class="tha-v43-chip ${chipClass(saved.visibility)}">${escapeHtml(saved.visibility)}</span>
    `;
    const persist = () => {
      const map = readVisibility();
      const visibility = panel.querySelector('.tha-v43-visibility-select')?.value || 'Internal THA';
      const followUp = Boolean(panel.querySelector('.tha-v43-followup-check')?.checked);
      map[key] = { ...data, visibility, followUp, updatedAt: new Date().toISOString() };
      writeVisibility(map);
      const chip = panel.querySelector('.tha-v43-chip');
      if (chip) {
        chip.className = `tha-v43-chip ${chipClass(visibility)}`;
        chip.textContent = visibility;
      }
    };
    panel.querySelector('.tha-v43-visibility-select').addEventListener('change', persist);
    panel.querySelector('.tha-v43-followup-check').addEventListener('change', persist);
    target.append(panel);
    persist();
  }

  function addVisibilityControls() {
    document.querySelectorAll('.checklistDetailPanel').forEach(detail => {
      const title = textOf(detail.querySelector('h2')) || textOf(detail.closest('.itemCard')?.querySelector('.itemTitleLine strong')) || 'Checklist item';
      const room = currentRoomName();
      const insertAfter = detail.querySelector('.workOrderActionPanel') || detail.querySelector('.inputs') || detail;
      ensureVisibilityPanel(insertAfter.parentElement || detail, { source: 'HTC Checklist Item', room, item: title, defaultVisibility: 'Internal THA' });
    });

    document.querySelectorAll('.roomOverviewBody').forEach(body => {
      const room = currentRoomName();
      const insertAfter = body.querySelector('.workOrderActionPanel') || body;
      ensureVisibilityPanel(insertAfter.parentElement || body, { source: 'Room Overview', room, item: `${room} overview`, defaultVisibility: 'Internal THA' });
    });

    document.querySelectorAll('.passReviewCard').forEach(card => {
      if (!card.classList.contains('pmcp-selected') && !card.querySelector('.workOrderActionPanel')) return;
      const item = textOf(card.querySelector('h4')) || 'PMCP service';
      const target = card.querySelector('.workOrderActionPanel')?.parentElement || card;
      ensureVisibilityPanel(target, { source: 'PASS / PMCP', room: 'PMCP / Care Plan', item, defaultVisibility: 'Internal THA' });
    });
  }

  function photoInboxPanelHtml() {
    const items = readPhotoInbox();
    return `
      <section class="tha-v43-photo-inbox">
        <h4>Photo Inbox / Assign Photos</h4>
        <p>Use this when photos are taken later, uploaded from a phone, or sent by a client. Folder location can suggest placement; this assignment decides how the PMR should use the photo.</p>
        <div class="tha-v43-photo-grid">
          <label>Photo name / caption<input class="photoName" placeholder="Kitchen sink underside — client photo"></label>
          <label>Drive link or note<input class="photoLink" placeholder="Paste Drive link after upload, or leave blank"></label>
          <label>Room / area<input class="photoRoom" placeholder="Kitchen"></label>
          <label>Finding / checklist item<input class="photoFinding" placeholder="Sink leak / Room overview"></label>
          <label>Photo type<select class="photoType">${PHOTO_TYPES.map(x => `<option>${escapeHtml(x)}</option>`).join('')}</select></label>
          <label>Visibility<select class="photoVisibility">${VISIBILITY_OPTIONS.map(x => `<option>${escapeHtml(x)}</option>`).join('')}</select></label>
          <label class="wide">Source<select class="photoSource">${PHOTO_SOURCES.map(x => `<option>${escapeHtml(x)}</option>`).join('')}</select></label>
        </div>
        <div class="tha-v43-photo-actions"><button type="button" class="tha-v43-add-photo">Add photo assignment</button><button type="button" class="tha-v43-clear-photo-form">Clear</button></div>
        <div class="tha-v43-photo-list">${items.length ? items.map(photoRowHtml).join('') : '<p>No assigned photo inbox items yet.</p>'}</div>
      </section>
    `;
  }

  function photoRowHtml(item = {}) {
    return `<article class="tha-v43-photo-row" data-photo-id="${escapeHtml(item.id)}"><div><strong>${escapeHtml(item.name || 'Unnamed photo')}</strong><small>${escapeHtml(item.room || 'Unassigned room')} · ${escapeHtml(item.finding || 'No finding assigned')} · ${escapeHtml(item.type || 'Unassigned')} · ${escapeHtml(item.visibility || 'Internal THA')}</small>${item.link ? `<small><a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">Open Drive link</a></small>` : '<small>No Drive link recorded yet.</small>'}</div><button type="button" class="tha-v43-remove-photo">Remove</button></article>`;
  }

  function installPhotoInbox() {
    const target = document.querySelector('.walkthroughControlsPanel .localWorkCard') || document.querySelector('.walkthroughControlsPanel .homeownerIntakeSectionCard') || document.querySelector('main.pmr .frontSummary') || document.querySelector('main.intakePage');
    if (!target || target.querySelector('.tha-v43-photo-inbox')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = photoInboxPanelHtml();
    const panel = wrapper.firstElementChild;
    target.append(panel);
    wirePhotoInbox(panel);
  }

  function wirePhotoInbox(panel) {
    const list = panel.querySelector('.tha-v43-photo-list');
    const clearForm = () => panel.querySelectorAll('input').forEach(input => input.value = '');
    const rerender = () => {
      const items = readPhotoInbox();
      list.innerHTML = items.length ? items.map(photoRowHtml).join('') : '<p>No assigned photo inbox items yet.</p>';
    };
    panel.querySelector('.tha-v43-add-photo')?.addEventListener('click', () => {
      const item = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: panel.querySelector('.photoName')?.value.trim() || 'Unnamed photo',
        link: panel.querySelector('.photoLink')?.value.trim() || '',
        room: panel.querySelector('.photoRoom')?.value.trim() || 'Unassigned room',
        finding: panel.querySelector('.photoFinding')?.value.trim() || '',
        type: panel.querySelector('.photoType')?.value || 'Unassigned',
        visibility: panel.querySelector('.photoVisibility')?.value || 'Internal THA',
        source: panel.querySelector('.photoSource')?.value || 'Manual Drive upload',
        createdAt: new Date().toISOString()
      };
      const items = readPhotoInbox();
      items.push(item);
      writePhotoInbox(items);
      clearForm();
      rerender();
    });
    panel.querySelector('.tha-v43-clear-photo-form')?.addEventListener('click', clearForm);
    panel.addEventListener('click', event => {
      const button = event.target.closest('.tha-v43-remove-photo');
      if (!button) return;
      const row = button.closest('[data-photo-id]');
      const id = row?.dataset.photoId;
      writePhotoInbox(readPhotoInbox().filter(item => item.id !== id));
      rerender();
    });
  }

  function updateDriveUi(message, tone = 'info') {
    const business = document.querySelector('.walkthroughControlsPanel .businessRecordsCard');
    if (!business) return;
    let status = business.querySelector('.tha-v43-drive-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'tha-v43-drive-status';
      const actions = business.querySelector('.driveSetupActions');
      if (actions?.parentNode) actions.parentNode.insertBefore(status, actions.nextSibling);
      else business.append(status);
    }
    const stamp = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const saved = { message, tone, stamp, iso: new Date().toISOString() };
    saveJson(DRIVE_STATUS_KEY, saved);
    status.innerHTML = `<strong>${escapeHtml(message)}</strong><span>${escapeHtml(stamp)} · Save Drive Package creates a dated/versioned package folder rather than replacing the previous one.</span>`;
    status.classList.toggle('error', tone === 'error');
  }

  function loadDriveUiStatus() {
    const saved = safeJson(DRIVE_STATUS_KEY, null);
    if (saved?.message) updateDriveUi(saved.message, saved.tone || 'info');
  }

  function decorateDriveButtons() {
    const business = document.querySelector('.walkthroughControlsPanel .businessRecordsCard');
    if (!business) return;
    const saveButton = Array.from(business.querySelectorAll('button,a')).find(button => /save.*drive.*package|save package|upload drive package/i.test(textOf(button)));
    if (saveButton && !saveButton.dataset.thaV43Wired) {
      saveButton.dataset.thaV43Wired = 'true';
      saveButton.addEventListener('click', () => {
        saveButton.classList.remove('tha-v43-saved');
        saveButton.classList.add('tha-v43-saving');
        updateDriveUi('Saving Drive package…', 'info');
        window.setTimeout(() => saveButton.classList.remove('tha-v43-saving'), 12000);
      });
    }
    const openFolder = Array.from(business.querySelectorAll('button,a')).find(button => /open.*last.*drive.*folder|open drive folder/i.test(textOf(button)));
    if (openFolder && !openFolder.dataset.thaV43OpenStyled) {
      openFolder.dataset.thaV43OpenStyled = 'true';
      openFolder.title = 'Open the most recent dated Drive package folder.';
    }
    if (!business.querySelector('.tha-v43-folder-note')) {
      const note = document.createElement('div');
      note.className = 'tha-v43-folder-note';
      note.innerHTML = '<strong>Filing note:</strong> Best path is to make the app Drive root your new active THA client hub, or move whole dated package folders into the client folder. Avoid pulling individual files out of a package unless you are intentionally finalizing a copy.';
      const actions = business.querySelector('.driveSetupActions');
      if (actions?.parentNode) actions.parentNode.insertBefore(note, actions);
      else business.append(note);
    }
  }

  async function createDriveFolder(authHeader, parentId, name) {
    const response = await priorFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink&supportsAllDrives=true', {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parents: [parentId], mimeType: 'application/vnd.google-apps.folder' })
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  function multipartBody(metadata, blob, mimeType = 'application/json') {
    const boundary = `tha_v43_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return {
      boundary,
      body: new Blob([
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
        blob,
        `\r\n--${boundary}--`
      ], { type: `multipart/related; boundary=${boundary}` })
    };
  }

  async function uploadDriveFile({ authHeader, parentId, name, content, mimeType = 'application/json' }) {
    const { boundary, body } = multipartBody({ name, parents: [parentId] }, new Blob([content], { type: mimeType }), mimeType);
    const response = await priorFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink&supportsAllDrives=true', {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  function buildPhotoManifest(payload = {}) {
    const roomNames = new Set();
    (payload.sections || []).forEach(section => roomNames.add(section.label || section.roomName || section.key));
    (payload.rows || []).forEach(row => roomNames.add(roomNameFromRow(row)));
    readPhotoInbox().forEach(item => roomNames.add(item.room));
    const visibility = readVisibility();
    return {
      exportedAt: new Date().toISOString(),
      client: payload.client || {},
      model: {
        purpose: 'Photo staging, assignment, and report placement manifest.',
        rule: 'Folder location suggests placement; app assignment decides whether a photo is room overview, finding detail, client-facing, internal, or unused.',
        photoTypes: PHOTO_TYPES,
        visibilityOptions: VISIBILITY_OPTIONS
      },
      suggestedDriveFolders: ['05 - Photos/00 - Inbox - Unassigned', '05 - Photos/01 - Room Overview Photos/[Room]', '05 - Photos/02 - Finding Detail Photos/[Room - Finding]', '05 - Photos/03 - Client Submitted Photos', '05 - Photos/04 - Internal THA Reference Photos'],
      rooms: Array.from(roomNames).filter(Boolean).sort(),
      manualPhotoInbox: readPhotoInbox(),
      captureVisibilityDecisions: visibility
    };
  }

  async function ensureDrivePhotoStructure({ authHeader, parentId, payload }) {
    const dedupeKey = `${parentId}:${new Date().toDateString()}`;
    const saved = safeJson(DRIVE_STRUCTURE_KEY, {});
    if (saved[dedupeKey]) return;
    const manifest = buildPhotoManifest(payload);
    const photos = await createDriveFolder(authHeader, parentId, '05 - Photos');
    const inbox = await createDriveFolder(authHeader, photos.id, '00 - Inbox - Unassigned');
    const overview = await createDriveFolder(authHeader, photos.id, '01 - Room Overview Photos');
    const findings = await createDriveFolder(authHeader, photos.id, '02 - Finding Detail Photos');
    await createDriveFolder(authHeader, photos.id, '03 - Client Submitted Photos');
    await createDriveFolder(authHeader, photos.id, '04 - Internal THA Reference Photos');
    const roomSubset = manifest.rooms.slice(0, 24);
    for (const room of roomSubset) {
      await createDriveFolder(authHeader, overview.id, room || 'Unassigned room');
    }
    await uploadDriveFile({
      authHeader,
      parentId: photos.id,
      name: 'photo-manifest.json',
      content: JSON.stringify(manifest, null, 2),
      mimeType: 'application/json'
    });
    await uploadDriveFile({
      authHeader,
      parentId: inbox.id,
      name: 'README - Add later photos here.txt',
      content: 'Drop later phone/client/manual photos here first. Then reopen the app, add each photo to Photo Inbox / Assign Photos, and save a new Drive package so the PMR and photo-manifest know how to use them. Folder location suggests placement; app assignment decides final PMR use.',
      mimeType: 'text/plain'
    });
    saved[dedupeKey] = { createdAt: new Date().toISOString(), parentId, photosFolderId: photos.id, findingFolderId: findings.id };
    saveJson(DRIVE_STRUCTURE_KEY, saved);
  }

  function isDriveMultipartUpload(url = '', method = '') {
    return /https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files/i.test(url) && /uploadType=multipart/i.test(url) && method === 'POST';
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    let payload = null;
    let parentId = '';
    let authHeader = '';

    if (isDriveMultipartUpload(url, method)) {
      try {
        const parsed = await parseMultipart(init.body, init.headers?.['Content-Type'] || init.headers?.get?.('Content-Type') || '');
        const name = parsed?.metadata?.name || '';
        if (/Full Walkthrough Export\.json|Restore This Walkthrough/i.test(name)) {
          payload = normalizePayload(JSON.parse(parsed.content || '{}'));
          parentId = parsed.metadata?.parents?.[0] || '';
          authHeader = authHeaderFrom(init, input);
        }
      } catch (error) {
        console.warn('THA V3.43 Drive prep skipped:', error);
      }
    }

    const response = await priorFetch(input, init);

    if (response?.ok && payload && parentId && authHeader) {
      try {
        await ensureDrivePhotoStructure({ authHeader, parentId, payload });
        updateDriveUi('Drive package saved with photo staging folders + manifest.', 'success');
        document.querySelectorAll('.tha-v43-saving').forEach(button => {
          button.classList.remove('tha-v43-saving');
          button.classList.add('tha-v43-saved');
          setTimeout(() => button.classList.remove('tha-v43-saved'), 9000);
        });
      } catch (error) {
        console.warn('THA V3.43 photo folder/manifest upload failed:', error);
        updateDriveUi('Drive package saved; photo staging structure needs retry.', 'error');
      }
    }

    return response;
  };

  function syncUi() {
    installStyles();
    addVisibilityControls();
    installPhotoInbox();
    decorateDriveButtons();
    loadDriveUiStatus();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncUi();
    });
  }

  function start() {
    syncUi();
    window.setTimeout(syncUi, 300);
    window.setTimeout(syncUi, 1000);
    new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
    document.addEventListener('change', scheduleSync);
    document.addEventListener('input', scheduleSync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
