(() => {
  const SCRIPT_ID = 'tha-v47-consolidated-field-experience';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  const TODO_CACHE_KEY = 'tha-v47-latest-action-todo-html';
  const DRIVE_STATUS_KEY = 'tha-v47-drive-save-status';
  const DRIVE_STRUCTURE_KEY = 'tha-v47-drive-photo-structure';
  const LEGACY_PHOTO_INBOX_KEY = 'tha-v43-photo-inbox-assignments';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  const priorFetch = window.fetch.bind(window);

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
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

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.47: one consolidated layer replacing V3.42-V3.46 visible patch stack. */
      .tha-v42-pmr-action-shell,
      .tha-v42-pass-moved-note,
      .tha-v43-photo-inbox,
      .tha-v43-visibility-panel,
      .tha-v44-direction-banner,
      .tha-v44-pass-handoff-note,
      .tha-v44-lane-chip,
      .tha-v44-output-map,
      .tha-v45-office-photo-tool,
      .tha-v45-output-strip{
        display:none!important;
        visibility:hidden!important;
      }

      main.passWorkspace .thaActionTodoList{
        display:none!important;
        visibility:hidden!important;
      }
      main.passWorkspace .passSourceEvidence,
      main.passWorkspace .passReviewFields .passSourceEvidence,
      main.passWorkspace .passReviewFields .passInternalNote,
      main.passWorkspace .passReviewCard .sourceBadge,
      main.passWorkspace .workOrderActionPanel small,
      main.passWorkspace .thaActionTypeField small{
        display:none!important;
      }

      main.passWorkspace .passReviewPanel{border-left:6px solid #52aa4b!important;background:#fff!important}
      main.passWorkspace .passReviewGrid{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))!important;gap:10px!important}
      main.passWorkspace .passReviewCard{border-radius:16px!important;box-shadow:0 4px 12px rgba(13,44,73,.05)!important}
      main.passWorkspace .passReviewCardHeader{padding:12px!important}
      main.passWorkspace .passReviewTitle h4{font-size:16px!important;line-height:1.2!important;margin:3px 0!important}
      main.passWorkspace .passReviewSubline,
      main.passWorkspace .passReviewCadence{font-size:12px!important;margin:2px 0!important}
      main.passWorkspace .passReviewSummary{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin:0 12px 10px!important}
      main.passWorkspace .passReviewSummaryItem{padding:8px!important;border-radius:12px!important}
      main.passWorkspace .passReviewTop{padding:0 12px 10px!important;gap:8px!important}
      main.passWorkspace .includeToggle{margin:0!important;padding:9px!important;border-radius:13px!important}
      main.passWorkspace .workOrderActionPanel{margin:0 12px 10px!important;padding:9px!important;border-radius:13px!important;background:#fbf8ff!important;border-style:dashed!important;box-shadow:none!important}
      main.passWorkspace .passReviewDetailsToggle{padding:0 12px 12px!important}
      main.passWorkspace .passReviewDetailsToggle .secondaryBtn::after{content:''!important;display:none!important}

      .tha-v47-pass-packages{border:1px solid #d8e4ea;border-left:6px solid #52aa4b;background:#fbfef9;border-radius:18px;padding:14px 16px;margin:12px 0;color:#203040;box-shadow:0 6px 16px rgba(13,44,73,.05)}
      .tha-v47-pass-packages h2{margin:0 0 4px!important;color:#0b3658!important;font-size:18px!important}
      .tha-v47-pass-packages p{margin:3px 0!important;color:#40505f!important;font-size:13px!important;line-height:1.35!important}
      .tha-v47-package-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin-top:10px}
      .tha-v47-package-card{border:1px solid #d8e4ea;background:#fff;border-radius:14px;padding:10px}
      .tha-v47-package-card strong{display:block;color:#0b3658;font-size:14px;margin-bottom:3px}
      .tha-v47-package-card small{display:block;color:#60717c;font-weight:800;line-height:1.25}

      main.pmr:not(.passWorkspace) .pmrBlock[data-tha-v44-lane],
      main.pmr:not(.passWorkspace) .snapshot[data-tha-v44-lane]{border-left-width:1px!important}
      main.pmr:not(.passWorkspace) .workOrderSummary,
      main.pmr:not(.passWorkspace) .tha-v47-pmr-action-shell{border-left:6px solid #7e4c9a!important}
      main.pmr:not(.passWorkspace) .passPlanSummary{border-left:6px solid #315568!important}
      .tha-v47-pmr-action-shell{border:1px solid #d8e4ea;border-radius:20px;background:#fff;padding:18px;margin:18px 0;box-shadow:0 8px 22px rgba(76,58,114,.08)}
      .tha-v47-pmr-action-shell h2{margin:0 0 6px!important;color:#0b3658!important}
      .tha-v47-pmr-action-shell .lede{margin:0 0 12px!important;color:#40505f!important;line-height:1.45!important}
      .tha-v47-pmr-action-shell .thaActionTodoList{box-shadow:none!important;border:0!important;margin:0!important;padding:0!important;background:transparent!important}
      .tha-v47-pmr-action-shell .thaActionTodoList>h2,
      .tha-v47-pmr-action-shell .thaActionTodoList>.lede{display:none!important}
      .tha-v47-sync-note{border:1px solid #eadbc2;border-left:5px solid #bf8420;background:#fffdf8;border-radius:14px;padding:10px 12px;color:#6b4a14;margin:10px 0;font-weight:800;font-size:12px;line-height:1.35}

      main.pmr:not(.passWorkspace) .homeHealthSnapshot h2,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot h2{display:flex!important;align-items:center!important;gap:8px!important;line-height:1.2!important}
      main.pmr:not(.passWorkspace) .homeHealthSnapshot h2 svg,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot h2 svg{width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;flex:0 0 auto!important;stroke-width:2.25!important}
      main.pmr:not(.passWorkspace) .homeHealthSnapshot .stat strong,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot .stat strong{font-size:clamp(28px,4.4vw,48px)!important;line-height:1!important}
      main.pmr:not(.passWorkspace) .homeHealthSnapshot .stat span,
      main.pmr:not(.passWorkspace) .snapshot.homeHealthSnapshot .stat span{font-size:13px!important;line-height:1.25!important}

      .walkthroughControlsPanel .tha-v47-drive-status{border:1px solid #d8e4ea;border-left:5px solid #52aa4b;background:#f6fcf4;border-radius:14px;padding:9px 11px;margin:9px 0;color:#203040}
      .walkthroughControlsPanel .tha-v47-drive-status strong{display:block;color:#285c30}
      .walkthroughControlsPanel .tha-v47-drive-status span{font-size:12px;color:#40505f}
      .walkthroughControlsPanel .tha-v47-drive-status.error{border-left-color:#b23b2d;background:#fff7f5}
      .walkthroughControlsPanel .tha-v47-drive-status.error strong{color:#842218}
      .tha-v47-saving{position:relative!important;box-shadow:0 0 0 4px rgba(191,132,32,.14)!important}
      .tha-v47-saving::after{content:'Saving…';position:absolute;right:10px;bottom:4px;font-size:10px;font-weight:950;color:#8a641f}
      .tha-v47-saved{position:relative!important;box-shadow:0 0 0 4px rgba(82,170,75,.14)!important}
      .tha-v47-saved::after{content:'Saved';position:absolute;right:10px;bottom:4px;font-size:10px;font-weight:950;color:#285c30}

      @media(max-width:760px){main.passWorkspace .passReviewSummary{grid-template-columns:1fr!important}.tha-v47-package-grid{grid-template-columns:1fr}}
      @media print{.tha-v47-pass-packages,.tha-v47-drive-status,.tha-v47-pmr-action-shell{display:none!important}}
    `;
    document.head.append(style);
  }

  function insertAfter(target, node) {
    if (!target?.parentNode || !node) return;
    target.parentNode.insertBefore(node, target.nextSibling);
  }

  function removeLegacyVisibleNoise() {
    document.querySelectorAll('.tha-v42-pmr-action-shell,.tha-v42-pass-moved-note,.tha-v43-photo-inbox,.tha-v43-visibility-panel,.tha-v44-direction-banner,.tha-v44-pass-handoff-note,.tha-v44-lane-chip,.tha-v44-output-map,.tha-v45-office-photo-tool,.tha-v45-output-strip').forEach(node => node.remove());
  }

  function buildPackageGuide() {
    const section = document.createElement('section');
    section.className = 'tha-v47-pass-packages';
    section.innerHTML = `
      <h2>PASS Service Packages</h2>
      <p>Start with simple service blocks. Open individual items only when a package needs a different cadence, timing, or follow-up note.</p>
      <div class="tha-v47-package-grid">
        <article class="tha-v47-package-card"><strong>Kitchen Refresh</strong><small>Cabinet touch-up, pulls/hinges, sink-base check, appliance filter/vent check · 30–60 min</small></article>
        <article class="tha-v47-package-card"><strong>Bathroom Refresh</strong><small>Caulk check, fan check, toilet movement, supply/shutoff review · 15–30 min per bath</small></article>
        <article class="tha-v47-package-card"><strong>Laundry / Dryer Vent</strong><small>Dryer vent check/cleaning path, washer hose/shutoff review · about 30 min</small></article>
        <article class="tha-v47-package-card"><strong>Seasonal Exterior</strong><small>Hose bibs, downspouts, drainage walkaround, exterior openings · 30–60 min</small></article>
      </div>
    `;
    return section;
  }

  function normalizePass() {
    const main = document.querySelector('main.passWorkspace');
    if (!main) return;
    main.querySelectorAll('h1,h2,h3').forEach(heading => {
      const text = textOf(heading);
      if (/PASS Service Plan Builder|PASS \/ PMCP Builder|Preventative Maintenance Care Plan Builder/i.test(text)) heading.textContent = 'PASS Service Plan Builder';
      if (/Service Plan Snapshot|In-app Preventative Maintenance Care Plan/i.test(text)) heading.textContent = 'Service Plan Snapshot';
    });
    const header = main.querySelector('.pmrHeader');
    if (header && !main.querySelector('.tha-v47-pass-packages')) insertAfter(header, buildPackageGuide());
    const summary = main.querySelector('.passReviewPanel .collapsibleSummary');
    if (summary) summary.textContent = 'Select care-plan items. Open details only when timing, cadence, or follow-up needs a change.';
  }

  function cachePassTodoList() {
    const passMain = document.querySelector('main.passWorkspace');
    const source = passMain?.querySelector('.thaActionTodoList');
    if (!source) return;
    const clone = source.cloneNode(true);
    clone.querySelector('h2')?.replaceChildren(document.createTextNode('THA Internal Action To-Dos'));
    clone.querySelectorAll('button,.noPrint').forEach(node => node.remove());
    localStorage.setItem(TODO_CACHE_KEY, clone.outerHTML);
  }

  function cachedInternalListHtml() {
    const cached = localStorage.getItem(TODO_CACHE_KEY) || '';
    if (cached) return cached;
    return '<div class="tha-v47-sync-note">Open PASS once after marking PMCP THA Action Items so the PMR can sync the full PMCP/internal to-do list. HTC and room-overview action summaries still appear in the PMR when marked.</div>';
  }

  function ensurePmrInternalActions() {
    const pmrMain = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmrMain) return;
    const existing = pmrMain.querySelector('.tha-v47-pmr-action-shell');
    const passPlan = pmrMain.querySelector('.passPlanSummary');
    const summary = Array.from(pmrMain.querySelectorAll('.pmrBlock')).find(block => /Plain-English Summary/i.test(textOf(block.querySelector('h2') || block)));
    const anchor = summary || passPlan || pmrMain.querySelector('.roomIssueSummary') || pmrMain.querySelector('.findingTypeSummary');
    if (!anchor?.parentNode) return;

    const html = `
      <h2>THA Internal Action To-Dos</h2>
      <p class="lede">Office-only follow-up pulled from checked THA Action Items and selected THA Action Types. This keeps internal tasking separate from the homeowner-facing PMR.</p>
      ${cachedInternalListHtml()}
    `;
    if (existing) {
      existing.innerHTML = html;
      return;
    }
    const section = document.createElement('section');
    section.className = 'tha-v47-pmr-action-shell noPrint';
    section.innerHTML = html;
    insertAfter(anchor, section);
  }

  function updateDriveUi(message, tone = 'info') {
    const business = document.querySelector('.walkthroughControlsPanel .businessRecordsCard');
    if (!business) return;
    let status = business.querySelector('.tha-v47-drive-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'tha-v47-drive-status';
      const actions = business.querySelector('.driveSetupActions');
      if (actions?.parentNode) actions.parentNode.insertBefore(status, actions.nextSibling);
      else business.append(status);
    }
    const stamp = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const saved = { message, tone, stamp, iso: new Date().toISOString() };
    saveJson(DRIVE_STATUS_KEY, saved);
    status.innerHTML = `<strong>${escapeHtml(message)}</strong><span>${escapeHtml(stamp)} · Drive saves create a new dated package folder rather than replacing the previous package.</span>`;
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
    if (saveButton && !saveButton.dataset.thaV47Wired) {
      saveButton.dataset.thaV47Wired = 'true';
      saveButton.addEventListener('click', () => {
        saveButton.classList.remove('tha-v47-saved');
        saveButton.classList.add('tha-v47-saving');
        updateDriveUi('Saving Drive package…', 'info');
        window.setTimeout(() => saveButton.classList.remove('tha-v47-saving'), 12000);
      });
    }
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
    const boundary = `tha_v47_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

  function roomNameFromRow(row = {}) {
    return row.roomName || row.room || row.section || 'General';
  }

  function buildPhotoManifest(payload = {}) {
    const roomNames = new Set();
    (payload.sections || []).forEach(section => roomNames.add(section.label || section.roomName || section.key));
    (payload.dynamicRooms || []).forEach(room => roomNames.add(room.label || room.roomName || room.key || room.name));
    (payload.rows || []).forEach(row => roomNames.add(roomNameFromRow(row)));
    Object.keys(payload.roomCapture || {}).forEach(room => roomNames.add(room));
    const legacyManualInbox = Array.isArray(safeJson(LEGACY_PHOTO_INBOX_KEY, [])) ? safeJson(LEGACY_PHOTO_INBOX_KEY, []) : [];
    return {
      exportedAt: new Date().toISOString(),
      client: payload.client || {},
      model: {
        purpose: 'Drive photo staging for later phone/client/manual photos.',
        rule: 'Folder location suggests placement. Final PMR use should still be confirmed during office review.'
      },
      suggestedDriveFolders: [
        '05 - Photos/00 - Inbox - Unassigned',
        '05 - Photos/01 - Room Overview Photos/[Room]',
        '05 - Photos/02 - Finding Detail Photos/[Room - Finding]',
        '05 - Photos/03 - Client Submitted Photos',
        '05 - Photos/04 - Internal THA Reference Photos'
      ],
      rooms: Array.from(roomNames).filter(Boolean).sort(),
      manualPhotoInbox: legacyManualInbox
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
    await createDriveFolder(authHeader, photos.id, '02 - Finding Detail Photos');
    await createDriveFolder(authHeader, photos.id, '03 - Client Submitted Photos');
    await createDriveFolder(authHeader, photos.id, '04 - Internal THA Reference Photos');
    for (const room of manifest.rooms.slice(0, 24)) await createDriveFolder(authHeader, overview.id, room || 'Unassigned room');
    await uploadDriveFile({ authHeader, parentId: photos.id, name: 'photo-manifest.json', content: JSON.stringify(manifest, null, 2), mimeType: 'application/json' });
    await uploadDriveFile({ authHeader, parentId: inbox.id, name: 'README - Add later photos here.txt', content: 'Drop later phone/client/manual photos here first. Folder location suggests placement; final PMR use should be confirmed during office review before sending to the homeowner.', mimeType: 'text/plain' });
    saved[dedupeKey] = { createdAt: new Date().toISOString(), parentId, photosFolderId: photos.id };
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
        console.warn('THA V3.47 Drive prep skipped:', error);
      }
    }

    const response = await priorFetch(input, init);

    if (response?.ok && payload && parentId && authHeader) {
      try {
        await ensureDrivePhotoStructure({ authHeader, parentId, payload });
        updateDriveUi('Drive package saved.', 'success');
        document.querySelectorAll('.tha-v47-saving').forEach(button => {
          button.classList.remove('tha-v47-saving');
          button.classList.add('tha-v47-saved');
          setTimeout(() => button.classList.remove('tha-v47-saved'), 9000);
        });
      } catch (error) {
        console.warn('THA V3.47 photo staging upload failed:', error);
        updateDriveUi('Drive package saved; photo staging folders need retry.', 'error');
      }
    }

    return response;
  };

  function sync() {
    installStyles();
    removeLegacyVisibleNoise();
    normalizePass();
    cachePassTodoList();
    ensurePmrInternalActions();
    decorateDriveButtons();
    loadDriveUiStatus();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  function start() {
    sync();
    window.setTimeout(sync, 300);
    window.setTimeout(sync, 1000);
    document.addEventListener('click', () => setTimeout(sync, 80), true);
    new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();