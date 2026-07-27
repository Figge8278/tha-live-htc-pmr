(() => {
  const SCRIPT_ID = 'tha-v40-office-output-and-setup-balance';
  const STYLE_ID = 'tha-v40-office-output-and-setup-balance-styles';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  const priorFetch = window.fetch.bind(window);
  const uploadedKeys = new Set();

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function compact(value = '', fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
  }

  function normalizePayload(data = {}) {
    if (data?.client && (data.rows || data.pmr || data.intake)) return data;
    if (data?.data?.client) return data.data;
    return data;
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

  function multipartBody(metadata, blob, mimeType = 'text/html') {
    const boundary = `tha_v40_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

  function authHeaderFrom(init = {}, input = {}) {
    const headers = new Headers(init.headers || input.headers || {});
    return headers.get('authorization') || headers.get('Authorization') || '';
  }

  async function uploadDriveArtifact({ authHeader, parentId, name, content, mimeType = 'text/html', asGoogleDoc = false }) {
    if (!authHeader || !parentId) return null;
    const metadata = { name, parents: [parentId], ...(asGoogleDoc ? { mimeType: 'application/vnd.google-apps.document' } : {}) };
    const blob = new Blob([content], { type: mimeType });
    const { boundary, body } = multipartBody(metadata, blob, mimeType);
    const headers = new Headers();
    headers.set('Authorization', authHeader);
    headers.set('Content-Type', `multipart/related; boundary=${boundary}`);
    const response = await priorFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers,
      body
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  function rowRoom(row = {}) {
    return row.roomName || row.room || row.section || 'Area not recorded';
  }

  function displayTrade(trade = '') {
    return trade === 'Handyman' ? 'THA Handy Services' : (trade || 'Resource to assign');
  }

  function statusBucket(status = '') {
    if (status === 'Immediate Concern') return 'Now';
    if (status === 'Needs Attention') return 'Upcoming';
    if (status === 'Monitor') return 'Monitor';
    if (status === 'Good') return 'Good';
    return 'Internal / Review';
  }

  function isPmrRow(row = {}) {
    const status = row.answer?.status || '';
    return Boolean(row?.answer && !['Unknown', 'Good'].includes(status));
  }

  function isThaAction(row = {}) {
    const answer = row.answer || {};
    return Boolean(answer.thaActionItem || (answer.thaActionType && answer.thaActionType !== 'Unknown'));
  }

  function nextStepFor(row = {}) {
    const certainty = row.answer?.actionCertainty || 'Likely Path';
    if (row.action) return row.action;
    if (certainty === 'Needs Discovery') return 'Confirm scope, resource, and next step before scheduling work.';
    if (row.answer?.trade === 'Handyman') return 'THA Handy Services can review and address during a planned service visit where appropriate.';
    return 'THA can confirm the right resource and coordinate the next step.';
  }

  function timingFor(row = {}) {
    const status = row.answer?.status || '';
    if (row.timing && status && row.timing[status]) return row.timing[status];
    if (status === 'Immediate Concern') return 'Address as soon as practical.';
    if (status === 'Needs Attention') return 'Plan in the next normal repair window.';
    if (status === 'Monitor') return 'Monitor and re-check during the next appropriate visit.';
    return row.answer?.effort || 'Timing to confirm.';
  }

  function actionRows(payload = {}) {
    const pmrIds = new Set((payload.pmr || []).map(row => row.id).filter(Boolean));
    const rows = (payload.rows || []).filter(row => row?.answer);
    const mappedRows = rows.map(row => {
      const answer = row.answer || {};
      const clientFacing = pmrIds.has(row.id) || isPmrRow(row);
      const internalOnly = !clientFacing || isThaAction(row) || answer.addToPmcpBuilder;
      const visibility = clientFacing && internalOnly ? 'Both' : clientFacing ? 'Client PMR' : 'Internal THA';
      return {
        visibility,
        location: rowRoom(row),
        source: row.source || (row.intakeOnly ? 'Intake Follow-Up' : 'HTC Checklist Item'),
        section: row.zone || row.category || '',
        item: row.item || 'Untitled item',
        status: answer.status || 'Unknown',
        stoplight: statusBucket(answer.status),
        resource: displayTrade(answer.trade || row.trade),
        approximateTime: answer.effort || 'Unknown',
        homeownerPace: answer.pref || '',
        actionCertainty: answer.actionCertainty || 'Likely Path',
        thaActionItem: Boolean(answer.thaActionItem),
        thaActionType: answer.thaActionType || 'Unknown',
        pmcpCandidate: Boolean(answer.addToPmcpBuilder),
        suggestedTiming: timingFor(row),
        recommendedNextStep: nextStepFor(row),
        notes: answer.notes || '',
        photoCount: Array.isArray(answer.photos) ? answer.photos.length : 0,
        airtableSuggestedStatus: clientFacing ? 'PMR Review' : (isThaAction(row) ? 'THA Follow-Up' : 'Internal Reference'),
        airtableOwner: answer.thaActionItem ? 'THA' : 'Unassigned / Review',
        clientFacing
      };
    });

    const roomRows = Object.entries(payload.roomCapture || {}).flatMap(([key, capture = {}]) => {
      const hasContent = Boolean(capture.note || capture.status !== 'Unknown' || capture.thaActionItem || capture.addToPmcpBuilder || (capture.photos || []).length || (capture.items || []).length);
      if (!hasContent) return [];
      return [{
        visibility: capture.status && !['Unknown', 'Looking Good'].includes(capture.status) ? 'Both' : 'Internal THA',
        location: key,
        source: 'Room Overview',
        section: 'Room Overview',
        item: `${key} overview`,
        status: capture.status || 'Unknown',
        stoplight: capture.status || 'Internal / Review',
        resource: capture.thaActionItem ? 'THA' : 'Review / Assign Later',
        approximateTime: 'Unknown',
        homeownerPace: '',
        actionCertainty: 'Likely Path',
        thaActionItem: Boolean(capture.thaActionItem),
        thaActionType: capture.thaActionType || 'Unknown',
        pmcpCandidate: Boolean(capture.addToPmcpBuilder),
        suggestedTiming: 'Review during office PMR cleanup or next room visit.',
        recommendedNextStep: 'Use room overview as context; promote into a client-facing finding only when confirmed.',
        notes: capture.note || '',
        photoCount: Array.isArray(capture.photos) ? capture.photos.length : 0,
        airtableSuggestedStatus: capture.thaActionItem ? 'THA Follow-Up' : 'Internal Reference',
        airtableOwner: capture.thaActionItem ? 'THA' : 'Unassigned / Review',
        clientFacing: false
      }];
    });

    return [...mappedRows, ...roomRows].filter(row => row.clientFacing || row.thaActionItem || row.pmcpCandidate || row.notes || row.photoCount).sort((a, b) => {
      const rank = { 'Client PMR': 0, Both: 1, 'Internal THA': 2 };
      return (rank[a.visibility] ?? 2) - (rank[b.visibility] ?? 2) || String(a.location).localeCompare(String(b.location)) || String(a.item).localeCompare(String(b.item));
    });
  }

  function reminderRows(payload = {}) {
    return (payload.passCareOutlook || []).map(item => ({
      visibility: 'Internal THA / Client PMCP summary',
      careItem: item.careItem || item.careTopic || 'Routine care item',
      cadence: item.cadence || 'As needed',
      lastCompleted: item.lastCompletedDisplay || item.lastCompletedDate || 'Unknown — verify baseline',
      nextSuggestedWindow: item.nextSuggestedWindow || item.targetWindow || 'Establish baseline at next seasonal visit',
      resource: item.resource || 'THA review',
      internalReminderRule: 'Airtable/calendar reminder target: contact homeowner about 3–4 weeks before the next suggested service window when a real due date is known.',
      clientEmailTemplate: `Your ${item.careItem || item.careTopic || 'home care'} service window is coming up. Unless you would like to pause or change plans, THA can help coordinate the next step.`
    }));
  }

  function buildOfficeModel(payload = {}) {
    const rows = actionRows(payload);
    const reminders = reminderRows(payload);
    return {
      exportedAt: new Date().toISOString(),
      client: payload.client || {},
      visibilityModel: {
        clientFacing: 'Appears in Homeowner PMR.',
        internalTHA: 'Office-only notes, follow-ups, uncertainty, tasking, vendor coordination, Airtable/calendar logic.',
        both: 'Client-facing finding that also creates internal task/follow-up context.'
      },
      actionRows: rows,
      reminderRows: reminders,
      airtableSuggestedTables: {
        ClientProperties: ['Client', 'Property', 'Walkthrough Date', 'Last PMR Folder', 'PMR Status'],
        PMRFindings: ['Visibility', 'Location', 'Item', 'Status', 'Resource', 'Suggested Timing', 'Recommended Next Step', 'Photo Count'],
        THAFollowUps: ['THA Action Item', 'Action Type', 'Owner', 'Target Window', 'Follow-Up Status'],
        PMCPReminders: ['Care Item', 'Cadence', 'Last Completed', 'Next Suggested Window', 'Internal Reminder Rule']
      }
    };
  }

  function officeDocHtml(model = {}) {
    const client = model.client || {};
    const rowHtml = model.actionRows.map(row => `<tr>
      <td>${escapeHtml(row.visibility)}</td><td>${escapeHtml(row.location)}</td><td>${escapeHtml(row.item)}</td><td>${escapeHtml(row.status)}</td><td>${escapeHtml(row.resource)}</td><td>${escapeHtml(row.suggestedTiming)}</td><td>${escapeHtml(row.thaActionType)}</td><td>${escapeHtml(row.airtableSuggestedStatus)}</td>
    </tr>`).join('') || '<tr><td colspan="8">No internal action rows generated.</td></tr>';
    const reminderHtml = model.reminderRows.map(row => `<tr>
      <td>${escapeHtml(row.careItem)}</td><td>${escapeHtml(row.cadence)}</td><td>${escapeHtml(row.lastCompleted)}</td><td>${escapeHtml(row.nextSuggestedWindow)}</td><td>${escapeHtml(row.resource)}</td><td>${escapeHtml(row.internalReminderRule)}</td>
    </tr>`).join('') || '<tr><td colspan="6">No PMCP reminder rows generated.</td></tr>';
    return `<!doctype html><html><head><meta charset="utf-8"><title>THA Office Copy — Internal Action Model</title><style>
      :root{--navy:#0b3658;--gold:#bf8420;--cream:#f6efe3;--ink:#203040;--muted:#66747f;--line:#d8e4ea;--soft:#f6f9fb;--purple:#f1ecfb;--green:#eef8eb;--white:#fff}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.45}main{max-width:1180px;margin:0 auto;padding:24px}header,section{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;margin:16px 0;box-shadow:0 8px 22px rgba(13,44,73,.07)}header{border-bottom:6px solid var(--gold)}h1,h2{color:var(--navy);margin:0 0 8px}.eyebrow,.label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);font-weight:950}.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.meta div{background:var(--soft);border:1px solid var(--line);border-radius:14px;padding:10px}.meta strong{display:block;color:var(--navy)}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips span{border:1px solid var(--line);background:var(--purple);border-radius:999px;padding:6px 10px;font-weight:900;color:var(--navy);font-size:12px}table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}th,td{padding:9px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left;font-size:13px}th{background:var(--navy);color:#fff;text-transform:uppercase;letter-spacing:.04em;font-size:11px}tr:nth-child(even) td{background:#fbfdfe}tr:last-child td{border-bottom:0}.note{border-left:5px solid var(--gold);background:#fffdf8}
    </style></head><body><main>
      <header><p class="eyebrow">Internal THA office copy</p><h1>THA Office Copy — Internal Action Model</h1><p>This is not the homeowner PMR. It is the working office model for PMR review, THA follow-up, Airtable fields, reminders, and future automation.</p><div class="meta"><div><span class="label">Client</span><strong>${escapeHtml(compact(client.name, 'Not recorded'))}</strong></div><div><span class="label">Property</span><strong>${escapeHtml(compact(client.address, 'Not recorded'))}</strong></div><div><span class="label">Visit</span><strong>${escapeHtml(compact(client.date, 'Not recorded'))}</strong></div><div><span class="label">Generated</span><strong>${escapeHtml(new Date(model.exportedAt).toLocaleString())}</strong></div></div></header>
      <section class="note"><h2>Visibility Rules</h2><div class="chips"><span>Client PMR</span><span>Internal THA</span><span>Both</span><span>Airtable follow-up</span></div><p>Client-facing findings stay polished. Internal records hold raw context, uncertainty, tasking, vendor coordination, reminder logic, and Airtable/calendar automation fields.</p></section>
      <section><h2>Airtable-Ready Action Rows</h2><table><thead><tr><th>Visibility</th><th>Location</th><th>Item</th><th>Status</th><th>Resource</th><th>Suggested timing</th><th>THA action type</th><th>Airtable status</th></tr></thead><tbody>${rowHtml}</tbody></table></section>
      <section><h2>PMCP Reminder Rows</h2><table><thead><tr><th>Care item</th><th>Cadence</th><th>Last completed</th><th>Next window</th><th>Resource</th><th>Internal reminder rule</th></tr></thead><tbody>${reminderHtml}</tbody></table></section>
    </main></body></html>`;
  }

  async function uploadInternalOfficeOutputs({ authHeader, parentId, payload }) {
    const model = buildOfficeModel(payload);
    const dedupeKey = `${parentId}:${payload?.client?.name || ''}:${payload?.client?.address || ''}:${payload?.exportedAt || Date.now()}`;
    if (uploadedKeys.has(dedupeKey)) return;
    uploadedKeys.add(dedupeKey);
    await uploadDriveArtifact({
      authHeader,
      parentId,
      name: '03 - THA Office Copy — Internal Action Model',
      content: officeDocHtml(model),
      mimeType: 'text/html',
      asGoogleDoc: true
    });
    await uploadDriveArtifact({
      authHeader,
      parentId,
      name: '04 - Airtable Ready — Internal Action Rows.json',
      content: JSON.stringify(model, null, 2),
      mimeType: 'application/json',
      asGoogleDoc: false
    });
  }

  function isDriveMultipartUpload(url = '', method = '') {
    return /https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files/i.test(url) && /uploadType=multipart/i.test(url) && method === 'POST';
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    let parsed = null;
    let payload = null;
    let parentId = '';
    let authHeader = '';

    if (isDriveMultipartUpload(url, method)) {
      try {
        parsed = await parseMultipart(init.body, init.headers?.['Content-Type'] || init.headers?.get?.('Content-Type') || '');
        const name = parsed?.metadata?.name || '';
        if (/Full Walkthrough Export\.json|Restore This Walkthrough/i.test(name)) {
          payload = normalizePayload(JSON.parse(parsed.content || '{}'));
          parentId = parsed.metadata?.parents?.[0] || '';
          authHeader = authHeaderFrom(init, input);
        }
      } catch (error) {
        console.warn('THA V4.0 office-output prep skipped:', error);
      }
    }

    const response = await priorFetch(input, init);

    if (response?.ok && payload && parentId && authHeader) {
      try {
        await uploadInternalOfficeOutputs({ authHeader, parentId, payload });
      } catch (error) {
        console.warn('THA V4.0 internal office outputs did not upload:', error);
      }
    }

    return response;
  };

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{align-items:stretch!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup{min-height:315px!important;display:flex!important;flex-direction:column!important;border-radius:20px!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup>.controlGroupTitle,
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup>.driveSetupHeader{min-height:72px!important;margin-bottom:10px!important;padding-bottom:10px!important;border-bottom:1px solid #d8e4ea!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup h3{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important;font-size:18px!important;color:#0b3658!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup h3::before{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:28px!important;height:28px!important;border-radius:999px!important;background:#0b3658!important;color:#fff!important;font-size:13px!important;font-weight:950!important;flex:0 0 auto!important}
      .walkthroughControlsPanel .walkthroughSetupCard h3::before{content:'1'!important}
      .walkthroughControlsPanel .localWorkCard h3::before{content:'2'!important}
      .walkthroughControlsPanel .homeownerIntakeSectionCard h3::before{content:'3'!important}
      .walkthroughControlsPanel .businessRecordsCard h3::before{content:'4'!important}
      .walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup p{line-height:1.35!important}
      .walkthroughControlsPanel .tha-v40-open-session-banner{border:1px solid #b9d9ad!important;border-left:5px solid #52aa4b!important;background:#f5fbf2!important;border-radius:15px!important;padding:10px 12px!important;margin:10px 0!important;color:#203040!important;box-shadow:0 6px 14px rgba(22,101,52,.07)!important}
      .walkthroughControlsPanel .tha-v40-open-session-banner strong{display:block!important;color:#285c30!important;font-size:14px!important}
      .walkthroughControlsPanel .tha-v40-open-session-banner span{display:block!important;color:#40505f!important;font-size:12px!important;margin-top:2px!important}
      .walkthroughControlsPanel .tha-v40-open-local-session{border:2px solid #52aa4b!important;background:#f7fcf5!important;border-radius:16px!important;padding:10px 12px!important;box-shadow:0 0 0 4px rgba(82,170,75,.10)!important}
      .walkthroughControlsPanel .tha-v40-open-local-session select{min-height:46px!important;border:2px solid #94cf8d!important;background:#fff!important;color:#173e57!important;font-weight:850!important;border-radius:12px!important}
      .walkthroughControlsPanel .tha-v40-open-local-session::before{content:'Open saved local work session';display:block!important;color:#285c30!important;text-transform:uppercase!important;letter-spacing:.06em!important;font-size:11px!important;font-weight:950!important;margin-bottom:4px!important}
      .walkthroughControlsPanel .localBackupRestore{margin-top:auto!important}
      .walkthroughControlsPanel .tha-v37-restore-panel{margin-top:auto!important;border-radius:16px!important}
      .walkthroughControlsPanel .driveSetupActions{margin-top:auto!important}
      @media(max-width:900px){.walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup{min-height:0!important}.walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup>.controlGroupTitle,.walkthroughControlsPanel.expanded .walkthroughControlsBody>.controlGroup>.driveSetupHeader{min-height:0!important}}
    `;
    document.head.append(style);
  }

  function balanceSetupCards() {
    const panel = document.querySelector('.walkthroughControlsPanel');
    if (!panel) return;
    const localCard = panel.querySelector('.localWorkCard');
    if (localCard && !localCard.querySelector('.tha-v40-open-session-banner')) {
      const savedLabel = Array.from(localCard.querySelectorAll('label')).find(label => /Saved local sessions/i.test(label.textContent || ''));
      if (savedLabel) {
        savedLabel.classList.add('tha-v40-open-local-session');
        const banner = document.createElement('div');
        banner.className = 'tha-v40-open-session-banner';
        banner.innerHTML = '<strong>Continue a saved walkthrough</strong><span>Use this selector to open the current or previously saved local version on this device.</span>';
        savedLabel.parentNode.insertBefore(banner, savedLabel);
      }
    }
  }

  function syncUi() {
    installStyles();
    balanceSetupCards();
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

  window.addEventListener('load', syncUi);
  document.addEventListener('DOMContentLoaded', syncUi);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true });
  syncUi();
})();