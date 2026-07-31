(() => {
  const SCRIPT_ID = 'tha-v39-pmr-photo-evidence-output';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  let latestPayload = null;

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function textOnly(value = '') {
    return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  }

  function printable(value = '', fallback = 'Not recorded') {
    const text = String(value ?? '').trim();
    return text ? escapeHtml(text).replace(/\n/g, '<br/>') : `<span class="muted">${escapeHtml(fallback)}</span>`;
  }

  function compact(value = '', fallback = 'Not recorded') {
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
    const boundary = `tha_v39_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

  function headersWithBoundary(headersLike, boundary) {
    const headers = new Headers(headersLike || {});
    headers.set('Content-Type', `multipart/related; boundary=${boundary}`);
    return headers;
  }

  function displayTrade(trade = '') {
    return trade === 'Handyman' ? 'THA Handy Services' : (trade || 'Resource to assign');
  }

  function rowRoom(row = {}) {
    return row.roomName || row.room || row.section || 'Area not recorded';
  }

  function rowText(row = {}) {
    return [rowRoom(row), row.zone, row.category, row.item, row.prompt, row.answer?.notes, row.answer?.trade, row.trade].filter(Boolean).join(' ').toLowerCase();
  }

  function isExteriorRow(row = {}) {
    return /\b(exterior|outside|front|back|rear|side yard|yard|landscape|irrigation|sprinkler|roof|gutter|downspout|drainage|grading|patio|deck|fence|garage door|siding|paint|stain|trim exterior|chimney|masonry|driveway|walkway|porch)\b/.test(rowText(row));
  }

  function priorityRank(row = {}) {
    const status = row.answer?.status || row.status || '';
    if (status === 'Immediate Concern') return 0;
    if (status === 'Needs Attention') return 1;
    if (status === 'Monitor') return 2;
    if (status === 'Good') return 3;
    return 4;
  }

  function sortedRows(rows = []) {
    return [...rows].sort((a, b) => priorityRank(a) - priorityRank(b) || rowRoom(a).localeCompare(rowRoom(b)) || String(a.item || '').localeCompare(String(b.item || '')));
  }

  function statusTone(status = '') {
    if (status === 'Immediate Concern') return 'now';
    if (status === 'Needs Attention') return 'upcoming';
    if (status === 'Monitor') return 'watch';
    if (status === 'Good' || status === 'Looking Good') return 'good';
    return 'neutral';
  }

  function statusLabel(status = '') {
    if (status === 'Immediate Concern') return 'Now';
    if (status === 'Needs Attention') return 'Upcoming';
    if (status === 'Monitor') return 'Monitor';
    if (status === 'Good' || status === 'Looking Good') return 'Looking Good';
    return status || 'Reference';
  }

  function sourceLabel(row = {}) {
    if (row.source === 'room-overview' || row.zone === 'Room Overview' || row.pmrGroup === 'Room Overview') return 'Room Overview';
    if (row.intakeOnly || row.source === 'Homeowner Intake Follow-Up') return 'Intake Follow-Up';
    return 'HTC Checklist Item';
  }

  function timingFor(row = {}) {
    const status = row.answer?.status || '';
    if (row.timing && status && row.timing[status]) return row.timing[status];
    if (status === 'Immediate Concern') return 'Address as soon as practical.';
    if (status === 'Needs Attention') return 'Plan in the next normal repair window.';
    if (status === 'Monitor') return 'Monitor and re-check during the next appropriate visit.';
    return row.answer?.effort || 'Timing to confirm.';
  }

  function nextStepFor(row = {}) {
    const certainty = row.answer?.actionCertainty || 'Likely Path';
    const base = row.action || row.answer?.recommendedNextStep || row.answer?.nextStep || '';
    if (base) return base;
    if (certainty === 'Needs Discovery') return 'Confirm scope, resource, and next step before scheduling work.';
    if (row.answer?.trade === 'Handyman') return 'THA Handy Services can review and address this during a planned service visit where appropriate.';
    return 'THA can help confirm the right resource and coordinate the next step.';
  }

  function field(label, value, fallback = 'Not recorded') {
    return `<div class="pmrField"><span>${escapeHtml(label)}</span><strong>${printable(value, fallback)}</strong></div>`;
  }

  function groupBy(items = [], getKey = item => item) {
    return items.reduce((acc, item) => {
      const key = getKey(item) || 'Other';
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  function photoList(source = {}) {
    return Array.isArray(source?.photos) ? source.photos : [];
  }

  function photoKey(value = '') {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function extractPhotoEvidenceFromHtml(html = '') {
    if (!html || typeof DOMParser === 'undefined') return [];
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return Array.from(doc.querySelectorAll('.photo-line')).map((line, index) => {
        const title = textOnly(line.querySelector('.line-title strong')?.textContent || line.querySelector('strong')?.textContent || 'Photo');
        const context = textOnly(line.querySelector('.line-main p')?.textContent || line.textContent || '');
        const anchor = line.querySelector('a[href]');
        return {
          item: title,
          itemKey: photoKey(title),
          context,
          contextKey: photoKey(context),
          href: anchor?.href || '',
          label: textOnly(line.querySelector('.time-chip')?.textContent || '') || `Photo ${index + 1}`
        };
      }).filter(entry => entry.item || entry.context || entry.href);
    } catch {
      return [];
    }
  }

  function photoEvidenceForRow(row = {}, photoEvidence = []) {
    const itemKey = photoKey(row.item || '');
    const roomKey = photoKey(rowRoom(row));
    const linked = photoEvidence.filter(entry => {
      const itemMatches = itemKey && (entry.itemKey === itemKey || entry.itemKey.includes(itemKey) || itemKey.includes(entry.itemKey));
      const roomMatches = !roomKey || entry.contextKey.includes(roomKey);
      return itemMatches && roomMatches;
    });
    if (linked.length) return linked;
    return photoList(row.answer).map((photo, index) => ({
      item: row.item || 'Finding photo',
      context: `${rowRoom(row)} · ${photo.label || 'Photo'} · ${photo.driveFileName || photo.name || `Photo ${index + 1}`}`,
      href: photo.driveViewLink || photo.webViewLink || '',
      label: photo.label || `Photo ${index + 1}`
    }));
  }

  function photoEvidenceHtml(row = {}, photoEvidence = []) {
    const entries = photoEvidenceForRow(row, photoEvidence);
    if (!entries.length) return field('Photos / evidence', '', 'No finding photos recorded.');
    const links = entries.map((entry, index) => {
      const text = entry.label || `Photo ${index + 1}`;
      const context = entry.context ? `<small>${escapeHtml(entry.context)}</small>` : '';
      const link = entry.href ? `<a href="${escapeHtml(entry.href)}">Open ${escapeHtml(text)}</a>` : `<span>${escapeHtml(text)}</span>`;
      return `<li>${link}${context}</li>`;
    }).join('');
    return `<div class="pmrField photoEvidence"><span>Photos / evidence</span><strong>${entries.length} linked photo${entries.length === 1 ? '' : 's'}</strong><ul>${links}</ul></div>`;
  }

  function findingCard(row = {}, photoEvidence = []) {
    const answer = row.answer || {};
    const tone = statusTone(answer.status);
    return `<article class="findingCard ${tone}">
      <div class="findingHead">
        <div>
          <p class="sourceTag">${escapeHtml(sourceLabel(row))}</p>
          <h4>${escapeHtml(row.item || 'Finding')}</h4>
        </div>
        <span class="statusPill ${tone}">${escapeHtml(statusLabel(answer.status))}</span>
      </div>
      <div class="fieldGrid">
        ${field('Location', rowRoom(row))}
        ${field('Area / line item', row.zone || row.category || sourceLabel(row))}
        ${field('Who handles it', displayTrade(answer.trade || row.trade))}
        ${field('Suggested timing', timingFor(row))}
      </div>
      <div class="noteBlock">${field('Observation', answer.notes, 'No additional observation notes recorded.')}</div>
      <div class="noteBlock">${field('Why it matters', row.why || '', 'Not expanded yet.')}</div>
      <div class="noteBlock">${field('Recommended next step', nextStepFor(row))}</div>
      <div class="noteBlock">${photoEvidenceHtml(row, photoEvidence)}</div>
    </article>`;
  }

  function sectionDetails(title, lede, content, { open = false, kicker = '', className = '' } = {}) {
    return `<details class="reportSection ${className}" ${open ? 'open' : ''}>
      <summary><span>${escapeHtml(kicker)}</span><strong>${escapeHtml(title)}</strong></summary>
      <div class="sectionBody">${lede ? `<p class="lede">${escapeHtml(lede)}</p>` : ''}${content}</div>
    </details>`;
  }

  function homeReferenceSnapshot(payload = {}) {
    const intake = payload.intake || {};
    const irrigation = /irrigation|sprinkler|controller|shutoff|blowout/i.test(String(intake.sewerIrrigation || '')) ? intake.sewerIrrigation : '';
    const items = [
      ['Electrical panel / breaker panel', intake.electricalPanel],
      ['Main water shutoff', intake.waterShutoff],
      ['Fire extinguisher locations', intake.fireExtinguishers],
      ['Smoke / CO detector notes', intake.smokeCO],
      ['Furnace filter location / size', intake.hvacFilter],
      ['Irrigation shutoff / controller', irrigation]
    ];
    return `<section class="referenceSnapshot">
      <h2>Home Reference Snapshot</h2>
      <p class="lede">High-utility home reference points from Intake and walkthrough prep. Sewer cleanout location is intentionally kept out of this homeowner snapshot unless it becomes relevant to a specific finding.</p>
      <div class="fieldGrid">${items.map(([label, value]) => field(label, value)).join('')}</div>
    </section>`;
  }

  function stoplightSummary(rows = [], passItems = []) {
    const now = rows.filter(row => row.answer?.status === 'Immediate Concern');
    const upcoming = rows.filter(row => row.answer?.status === 'Needs Attention');
    const monitor = rows.filter(row => row.answer?.status === 'Monitor');
    return `<section class="stoplightSummary">
      <h2>Stoplight Summary</h2>
      <div class="stoplightGrid">
        <div class="stoplight now"><strong>${now.length}</strong><span>Now</span><p>Safety, active failure, or highest concern items.</p></div>
        <div class="stoplight upcoming"><strong>${upcoming.length}</strong><span>Upcoming</span><p>Plan soon, repair window, or trade review.</p></div>
        <div class="stoplight watch"><strong>${monitor.length}</strong><span>Monitor</span><p>Worth watching or confirming during a future visit.</p></div>
        <div class="stoplight routine"><strong>${passItems.length}</strong><span>PMCP</span><p>Routine care plan items, separate from repair counts.</p></div>
      </div>
    </section>`;
  }

  function roomByRoom(rows = [], photoEvidence = []) {
    const grouped = groupBy(sortedRows(rows), rowRoom);
    return Object.entries(grouped).map(([room, items]) => `<section class="groupBlock"><h3>${escapeHtml(room)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3>${items.map(row => findingCard(row, photoEvidence)).join('')}</section>`).join('') || '<p class="muted">No client-facing findings recorded.</p>';
  }

  function tradeByTrade(rows = [], photoEvidence = []) {
    const grouped = groupBy(sortedRows(rows), row => displayTrade(row.answer?.trade || row.trade));
    return Object.entries(grouped).map(([trade, items]) => `<section class="groupBlock"><h3>${escapeHtml(trade)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3>${items.map(row => findingCard(row, photoEvidence)).join('')}</section>`).join('') || '<p class="muted">No trade/resource groupings recorded.</p>';
  }

  function pmcpSection(passItems = []) {
    if (!passItems.length) return '<p class="muted">No Preventive Maintenance Care Plan items selected yet.</p>';
    return `<div class="pmcpTable">${passItems.map(item => `<article class="pmcpRow">
      ${field('Care item', item.careItem || item.careTopic || 'Routine care item')}
      ${field('Recommended cadence', item.cadence || 'As needed')}
      ${field('Last completed', item.lastCompletedDisplay || item.lastCompletedDate || 'Unknown — verify baseline')}
      ${field('Next suggested service window', item.nextSuggestedWindow || item.targetWindow || 'Establish baseline at next seasonal visit')}
      ${field('Resource / trade', item.resource || 'THA review')}
    </article>`).join('')}</div>`;
  }

  function photoEvidenceSummary(photoEvidence = []) {
    if (!photoEvidence.length) return '';
    const linkedCount = photoEvidence.filter(entry => entry.href).length;
    return `<section class="photoEvidenceSummary"><h2>Photo Evidence Summary</h2><p class="lede">Finding-specific photos are attached inside the related finding cards where possible. The Drive Photos folder remains the full photo record.</p><div class="fieldGrid">${field('Photo index entries', photoEvidence.length)}${field('Linked Drive photos', linkedCount)}${field('How to use this', 'Open the finding first, then use Photos / evidence for the linked photo record.')}</div></section>`;
  }

  function buildClientPmrHtml(payload = {}, originalHtml = '') {
    const photoEvidence = extractPhotoEvidenceFromHtml(originalHtml);
    const client = payload.client || {};
    const allRows = sortedRows((payload.pmr || []).filter(row => row?.answer && !['Unknown', 'Good'].includes(row.answer.status)));
    const exteriorRows = allRows.filter(isExteriorRow);
    const interiorRows = allRows.filter(row => !isExteriorRow(row));
    const passItems = payload.passCareOutlook || [];
    const title = 'Homeowner PMR — Client Facing';
    const generated = new Date().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const scopeNote = 'This PMR is a maintenance planning review prepared by The Homeowner Advocate. It is not a code inspection, structural engineering report, or real-estate home inspection. Internal THA notes and automation follow-up records are intentionally kept separate from the homeowner-facing PMR.';
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>
      :root{--navy:#0b3658;--gold:#bf8420;--cream:#f6efe3;--ink:#203040;--muted:#66747f;--line:#dccdb5;--soft:#f5f9fb;--red:#f5d7d3;--amber:#fff1c6;--green:#dfeedd;--blue:#eaf3f7;--purple:#f1ecfb;--white:#fff;--shadow:rgba(13,44,73,.09)}
      *{box-sizing:border-box} body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.52} main{max-width:1040px;margin:0 auto;padding:24px} header{background:#fff;border-bottom:7px solid var(--gold);border-radius:0 0 26px 26px;padding:28px 24px;box-shadow:0 12px 30px var(--shadow)} h1{font-size:clamp(30px,5vw,48px);line-height:1.05;color:var(--navy);margin:0 0 8px} h2{color:var(--navy);margin:0 0 10px} h3,h4{color:var(--navy)} a{color:#0b5cad;font-weight:900}.eyebrow,.sourceTag,.pmrField span,summary span{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);font-weight:950}.lede{color:#40505f;font-size:15px}.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:16px}.meta .pmrField{background:var(--soft)}.pmrField{border:1px solid #d8e4ea;background:#fff;border-radius:14px;padding:10px 12px}.pmrField strong{display:block;color:var(--ink);font-size:15px;font-weight:750;margin-top:2px}.fieldGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.referenceSnapshot,.stoplightSummary,.scopeCard,.photoEvidenceSummary{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;margin:18px 0;box-shadow:0 8px 22px var(--shadow)}.stoplightGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.stoplight{border-radius:18px;padding:16px;border:1px solid #e2e8ed}.stoplight strong{font-size:38px;color:var(--navy);display:block}.stoplight span{font-weight:950;text-transform:uppercase;letter-spacing:.05em}.stoplight p{margin:4px 0 0;color:#40505f}.stoplight.now{background:var(--red)}.stoplight.upcoming{background:var(--amber)}.stoplight.watch{background:var(--green)}.stoplight.routine{background:var(--purple)}.reportSection{background:#fff;border:1px solid var(--line);border-radius:20px;margin:16px 0;box-shadow:0 8px 22px var(--shadow);overflow:hidden}.reportSection summary{cursor:pointer;list-style:none;padding:18px 20px;display:flex;justify-content:space-between;gap:12px;align-items:center}.reportSection summary::-webkit-details-marker{display:none}.reportSection summary strong{font-size:22px;color:var(--navy)}.reportSection summary:after{content:'Open / close';font-size:11px;font-weight:900;color:var(--muted);border:1px solid #d8e4ea;border-radius:999px;padding:5px 8px;background:#fff}.sectionBody{border-top:1px solid #eadbc2;padding:18px 20px}.groupBlock{border:1px solid #d8e4ea;border-radius:18px;background:#fbfdfe;padding:14px;margin:12px 0}.groupBlock h3{display:flex;justify-content:space-between;gap:10px;margin:0 0 10px}.groupBlock h3 span{color:var(--muted);font-size:12px;text-transform:uppercase}.findingCard{background:#fff;border:1px solid #dbe6eb;border-left:6px solid var(--gold);border-radius:16px;padding:14px;margin:10px 0}.findingCard.now{border-left-color:#c74732}.findingCard.upcoming{border-left-color:#d49a1f}.findingCard.watch{border-left-color:#4c9a58}.findingHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.findingHead h4{margin:2px 0 8px;font-size:18px}.statusPill{border-radius:999px;padding:6px 10px;font-weight:950;font-size:12px;white-space:nowrap}.statusPill.now{background:var(--red);color:#842218}.statusPill.upcoming{background:var(--amber);color:#755600}.statusPill.watch{background:var(--green);color:#285c30}.noteBlock{margin-top:10px}.photoEvidence{background:#f7fbff!important;border-color:#cfe1ec!important;border-left:4px solid #5f9fbd!important}.photoEvidence ul{margin:8px 0 0;padding-left:18px}.photoEvidence li{margin:5px 0}.photoEvidence small{display:block;color:var(--muted);font-weight:700;margin-top:2px}.pmcpTable{display:grid;gap:10px}.pmcpRow{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;border:1px solid #d8e4ea;border-radius:16px;background:#fbfdfe;padding:12px}.muted{color:var(--muted);font-style:italic}.scopeCard{background:#fffdf8;border-left:5px solid var(--gold)}@media print{body{background:#fff}main{padding:0}.reportSection{break-inside:avoid}.reportSection summary:after{display:none}}
    </style></head><body><main>
      <header><p class="eyebrow">The Homeowner Advocate</p><h1>${escapeHtml(title)}</h1><p class="lede">A plain-English maintenance planning report organized by the house: exterior first, interior second, then room-by-room, trade-by-trade, photo evidence, and the Preventive Maintenance Care Plan.</p><div class="meta">${field('Client', client.name)}${field('Property', client.address)}${field('Walkthrough date / visit label', client.date)}${field('Generated', generated)}</div></header>
      ${homeReferenceSnapshot(payload)}
      ${stoplightSummary(allRows, passItems)}
      ${photoEvidenceSummary(photoEvidence)}
      ${sectionDetails('Exterior / Outside Findings', 'Outside and exterior-related findings are presented first, front curb to back fence. Photo evidence is attached inside each finding when available.', exteriorRows.map(row => findingCard(row, photoEvidence)).join('') || '<p class="muted">No exterior findings recorded.</p>', { open: true, kicker: 'Client-facing' })}
      ${sectionDetails('Interior Findings', 'Interior findings are grouped here before the deeper room-by-room and trade-by-trade views. Photo evidence is attached inside each finding when available.', interiorRows.map(row => findingCard(row, photoEvidence)).join('') || '<p class="muted">No interior findings recorded.</p>', { open: true, kicker: 'Client-facing' })}
      ${sectionDetails('Room-by-Room Action List', 'The same client-facing findings, rearranged by location for homeowner review.', roomByRoom(allRows, photoEvidence), { kicker: 'Alternate view' })}
      ${sectionDetails('Trade-by-Trade Action List', 'The same client-facing findings, rearranged by likely resource or trade.', tradeByTrade(allRows, photoEvidence), { kicker: 'Alternate view' })}
      ${sectionDetails('Preventive Maintenance Care Plan', 'Routine and forecasted care from PASS / PMCP. These are not repair-defect counts and do not include internal THA reminder dates.', pmcpSection(passItems), { kicker: 'PMCP' })}
      <section class="scopeCard"><h2>Scope / Visibility Note</h2><p>${escapeHtml(scopeNote)}</p><p><strong>Internal records:</strong> Client-facing PMR is separated from THA internal office records. Internal notes, raw intake context, and automation follow-up fields belong in Secondary Editable Copies, Backup Data, Airtable, or calendar workflows.</p></section>
    </main></body></html>`;
  }

  async function v39Fetch(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    if (!/https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files/i.test(url) || method !== 'POST' || !/uploadType=multipart/i.test(url)) {
      return window.__thaV39PreviousFetch(input, init);
    }

    try {
      const parsed = await parseMultipart(init.body, init.headers?.['Content-Type'] || init.headers?.get?.('Content-Type') || '');
      const name = parsed?.metadata?.name || '';
      if (/Full Walkthrough Export\.json/i.test(name)) {
        latestPayload = normalizePayload(JSON.parse(parsed.content || '{}'));
        return window.__thaV39PreviousFetch(input, init);
      }

      if (name === 'PMR Report Packet.html' && latestPayload) {
        const html = buildClientPmrHtml(latestPayload, parsed.content || '');
        const metadata = { ...parsed.metadata, name: '01 - Homeowner PMR — Client Facing', mimeType: 'application/vnd.google-apps.document' };
        const { boundary, body } = multipartBody(metadata, new Blob([html], { type: 'text/html' }), 'text/html');
        const bypassV37 = window.__thaV37OriginalFetch || window.__thaV39PreviousFetch;
        return bypassV37(input, { ...init, headers: headersWithBoundary(init.headers, boundary), body });
      }
    } catch (error) {
      console.warn('THA V3.9 PMR photo evidence output skipped:', error);
    }

    return window.__thaV39PreviousFetch(input, init);
  }

  window.__thaV39PreviousFetch = window.fetch.bind(window);
  window.fetch = v39Fetch;
})();