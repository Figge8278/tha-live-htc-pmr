(() => {
  const SCRIPT_ID = 'tha-v56-drive-package-client-report';
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  const originalFetch = window.fetch.bind(window);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const FOLDER_NAMES = {
    client: '01 - Client PMR Report',
    working: '02 - THA Working Files',
    backup: '99 - Backup & Emergency Restore'
  };
  const FOLDER_RENAME = new Map([
    ['Photos', FOLDER_NAMES.working],
    ['Secondary Editable Copies', FOLDER_NAMES.working],
    ['Backup Data', FOLDER_NAMES.backup]
  ]);

  let latestPayload = null;
  const folderParentById = new Map();
  const folderNameById = new Map();
  const clientFolderByPackage = new Map();
  const workingFolderByPackage = new Map();

  function text(value = '') {
    return String(value ?? '').trim();
  }

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function cleanName(value = 'Untitled') {
    return text(value).replace(/[\\/:*?"<>|]/g, '-').slice(0, 90) || 'Untitled';
  }

  function plain(value = '', fallback = 'Not recorded') {
    const out = text(value);
    return out ? escapeHtml(out).replace(/\n/g, '<br/>') : `<span class="muted">${escapeHtml(fallback)}</span>`;
  }

  function headerValue(headers, name) {
    if (!headers) return '';
    if (headers instanceof Headers) return headers.get(name) || headers.get(name.toLowerCase()) || '';
    if (Array.isArray(headers)) {
      const found = headers.find(([key]) => String(key).toLowerCase() === name.toLowerCase());
      return found?.[1] || '';
    }
    return headers[name] || headers[name.toLowerCase()] || '';
  }

  function withHeader(headers = {}, name, value) {
    if (headers instanceof Headers) {
      const next = new Headers(headers);
      next.set(name, value);
      return next;
    }
    if (Array.isArray(headers)) {
      const lower = name.toLowerCase();
      return [...headers.filter(([key]) => String(key).toLowerCase() !== lower), [name, value]];
    }
    return { ...(headers || {}), [name]: value };
  }

  function boundaryFrom(contentType = '') {
    return String(contentType || '').match(/boundary=([^;]+)/i)?.[1]?.replace(/^"|"$/g, '') || '';
  }

  function indexOfBytes(haystack, needle, start = 0) {
    outer: for (let i = Math.max(0, start); i <= haystack.length - needle.length; i += 1) {
      for (let j = 0; j < needle.length; j += 1) if (haystack[i + j] !== needle[j]) continue outer;
      return i;
    }
    return -1;
  }

  function lastIndexOfBytes(haystack, needle) {
    outer: for (let i = haystack.length - needle.length; i >= 0; i -= 1) {
      for (let j = 0; j < needle.length; j += 1) if (haystack[i + j] !== needle[j]) continue outer;
      return i;
    }
    return -1;
  }

  async function parseMultipart(input, init = {}) {
    const headers = init.headers || input?.headers || {};
    const contentType = headerValue(headers, 'Content-Type') || input?.headers?.get?.('Content-Type') || '';
    const boundary = boundaryFrom(contentType);
    const body = init.body || input?.body;
    if (!boundary || !body?.arrayBuffer) return null;

    const bytes = new Uint8Array(await body.arrayBuffer());
    const boundaryBytes = encoder.encode(`--${boundary}`);
    const crlfBoundary = encoder.encode(`\r\n--${boundary}`);
    const doubleCrlf = encoder.encode('\r\n\r\n');
    const finalBoundary = encoder.encode(`\r\n--${boundary}--`);

    const firstHeaderEnd = indexOfBytes(bytes, doubleCrlf, 0);
    if (firstHeaderEnd < 0) return null;
    const firstContentStart = firstHeaderEnd + doubleCrlf.length;
    const firstPartEnd = indexOfBytes(bytes, crlfBoundary, firstContentStart);
    if (firstPartEnd < 0) return null;
    const metadataText = decoder.decode(bytes.slice(firstContentStart, firstPartEnd)).trim();
    let metadata;
    try { metadata = JSON.parse(metadataText); } catch { return null; }

    const secondHeaderStart = firstPartEnd + crlfBoundary.length + 2;
    const secondHeaderEnd = indexOfBytes(bytes, doubleCrlf, secondHeaderStart);
    if (secondHeaderEnd < 0) return null;
    const secondHeaderText = decoder.decode(bytes.slice(secondHeaderStart, secondHeaderEnd));
    const uploadContentType = secondHeaderText.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim() || 'application/octet-stream';
    const contentStart = secondHeaderEnd + doubleCrlf.length;
    let contentEnd = lastIndexOfBytes(bytes, finalBoundary);
    if (contentEnd < 0) contentEnd = bytes.length;
    const contentBytes = bytes.slice(contentStart, contentEnd);

    return { metadata, boundary, uploadContentType, contentBytes, originalContentType: contentType };
  }

  function makeMultipartBody(boundary, metadata, contentBlob, contentType) {
    return new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
      contentBlob,
      `\r\n--${boundary}--`
    ], { type: `multipart/related; boundary=${boundary}` });
  }

  function rewriteFolderName(name = '') {
    return FOLDER_RENAME.get(name) || name;
  }

  function rewriteQueryUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || !rawUrl.includes('googleapis.com/drive/v3/files')) return rawUrl;
    let url;
    try { url = new URL(rawUrl); } catch { return rawUrl; }
    const q = url.searchParams.get('q');
    if (!q) return rawUrl;
    let nextQ = q;
    for (const [from, to] of FOLDER_RENAME.entries()) {
      nextQ = nextQ.replace(new RegExp(`name='${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'), `name='${to}'`);
    }
    if (nextQ !== q) {
      url.searchParams.set('q', nextQ);
      return url.toString();
    }
    return rawUrl;
  }

  async function driveJson(url, options = {}) {
    const response = await originalFetch(url, options);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  function authHeaders(token) {
    return { Authorization: token };
  }

  async function findOrCreateFolder(authHeader, name, parentId) {
    if (!authHeader || !parentId) return '';
    const q = `mimeType='application/vnd.google-apps.folder' and name='${String(name).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`;
    const search = await driveJson(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, { headers: authHeaders(authHeader) });
    const existing = search.files?.[0];
    if (existing?.id) return existing.id;
    const created = await driveJson('https://www.googleapis.com/drive/v3/files?fields=id,name', {
      method: 'POST',
      headers: { ...authHeaders(authHeader), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
    });
    if (created?.id) {
      folderParentById.set(created.id, parentId);
      folderNameById.set(created.id, name);
    }
    return created?.id || '';
  }

  async function clientReportFolder(authHeader, packageId) {
    if (!clientFolderByPackage.has(packageId)) {
      clientFolderByPackage.set(packageId, await findOrCreateFolder(authHeader, FOLDER_NAMES.client, packageId));
    }
    return clientFolderByPackage.get(packageId);
  }

  async function workingFolder(authHeader, packageId) {
    if (!workingFolderByPackage.has(packageId)) {
      workingFolderByPackage.set(packageId, await findOrCreateFolder(authHeader, FOLDER_NAMES.working, packageId));
    }
    return workingFolderByPackage.get(packageId);
  }

  function priority(status = '') {
    if (status === 'Immediate Concern') return 'Immediate';
    if (status === 'Needs Attention') return 'Near-Term';
    if (status === 'Monitor') return 'Monitor';
    return status || 'PMR';
  }

  function statusClass(status = '') {
    if (/immediate/i.test(status)) return 'urgent';
    if (/needs/i.test(status)) return 'attention';
    if (/monitor/i.test(status)) return 'monitor';
    return 'neutral';
  }

  function tradeLabel(trade = '') {
    return trade === 'Handyman' ? 'Handy Services' : (trade || 'Resource TBD');
  }

  function groupBy(items = [], keyFn) {
    return items.reduce((acc, item) => {
      const key = keyFn(item) || 'General';
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
  }

  function photoList(row = {}) {
    const photos = Array.isArray(row?.answer?.photos) ? row.answer.photos : [];
    return photos.map(photo => ({
      ...photo,
      label: photo.label || 'Photo',
      src: photo.thumbnailDataUrl || photo.dataUrl || '',
      link: photo.driveViewLink || photo.webViewLink || ''
    }));
  }

  function photosHtml(row) {
    const photos = photoList(row);
    if (!photos.length) return '<p class="muted">No finding photos attached yet.</p>';
    return `<div class="photoGrid">${photos.map((photo, index) => `<figure class="photoCard">${photo.src ? `<img src="${photo.src}" alt="${escapeHtml(photo.label)} photo ${index + 1}"/>` : '<div class="photoPlaceholder">Photo</div>'}<figcaption><strong>${escapeHtml(photo.label)}</strong>${photo.link ? `<a href="${escapeHtml(photo.link)}" target="_blank" rel="noopener">Open Drive photo</a>` : `<span>${escapeHtml(photo.name || 'Local photo')}</span>`}</figcaption></figure>`).join('')}</div>`;
  }

  function certainty(row = {}) {
    const label = row.answer?.actionCertainty || 'Likely Path';
    const trade = tradeLabel(row.answer?.trade || row.trade);
    if (label === 'Clear Path') return { label, next: `Ready to proceed through ${trade}.`, body: row.action || 'Recommended next step is clear.' };
    if (label === 'Needs Discovery') return { label, next: `Coordinate closer review with ${trade} before pricing or scheduling.`, body: 'More information, pricing, or specialist input is needed before committing.' };
    return { label, next: row.action || 'Start here, then reassess if symptoms continue or hidden conditions are found.', body: 'Likely next step; minor confirmation may still be needed.' };
  }

  function timing(row = {}) {
    const status = row.answer?.status || '';
    if (row.timing?.[status]) return row.timing[status];
    if (status === 'Immediate Concern') return 'Immediate / 0–30 days';
    if (status === 'Needs Attention') return '1–3 months';
    if (status === 'Monitor') return '6–12 months';
    return 'As appropriate';
  }

  function findingBody(row = {}) {
    const cert = certainty(row);
    return `<div class="detailGrid">
      <div><span>What we saw</span><strong>${plain(row.answer?.notes, 'No additional notes recorded yet.')}</strong></div>
      <div><span>Why it matters</span><strong>${plain(row.why, 'No rationale recorded yet.')}</strong></div>
      <div><span>Recommended next step</span><strong>${plain(cert.next)}</strong></div>
      <div><span>Timing</span><strong>${plain(timing(row))}</strong></div>
      <div><span>Resource</span><strong>${plain(tradeLabel(row.answer?.trade || row.trade))}</strong></div>
      <div><span>Action certainty</span><strong>${plain(cert.label)} — ${plain(cert.body)}</strong></div>
    </div>
    <section class="photoEvidence"><h4>Photos / Evidence</h4>${photosHtml(row)}</section>`;
  }

  function findingHeader(row = {}, context = '') {
    const status = row.answer?.status || 'Monitor';
    const cls = statusClass(status);
    return `<div class="findingHead"><div><p>${escapeHtml(context || row.roomName || row.room || 'Location')} · ${escapeHtml(tradeLabel(row.answer?.trade || row.trade))}</p><h3>${escapeHtml(row.item || 'PMR item')}</h3></div><span class="pill ${cls}">${escapeHtml(priority(status))}</span></div><div class="chipLine"><span class="dot ${cls}"></span><span>${escapeHtml(status)}</span><span>${escapeHtml(row.answer?.effort || 'Time TBD')}</span><span>${escapeHtml(certainty(row).label)}</span>${photoList(row).length ? `<span>${photoList(row).length} photo${photoList(row).length === 1 ? '' : 's'}</span>` : ''}</div>`;
  }

  function roomFinding(row, room) {
    return `<article class="findingCard expanded">${findingHeader(row, room)}${findingBody(row)}</article>`;
  }

  function tradeFinding(row, trade) {
    return `<details class="findingCard tradeCollapsed"><summary>${findingHeader(row, trade)}</summary><div class="tradeDetail">${findingBody(row)}</div></details>`;
  }

  function pmcpHtml(items = []) {
    if (!items.length) return '<p class="muted">No PMCP items selected for this PMR.</p>';
    return `<div class="pmcpList">${items.map(item => `<details class="pmcpItem"><summary><strong>${escapeHtml(item.careItem || 'Care item')}</strong><span>${escapeHtml(item.resource || 'Resource TBD')} · ${escapeHtml(item.cadence || 'As Needed')}</span></summary><div class="detailGrid"><div><span>Source</span><strong>${escapeHtml(item.sourceEvidence?.label || item.source || 'PASS / PMCP')}</strong></div><div><span>Reason</span><strong>${plain(item.reason, 'Routine care planning item.')}</strong></div><div><span>Target window</span><strong>${plain(item.nextSuggestedWindow || item.targetWindow || item.suggestedWindow, 'Next normal care window')}</strong></div><div><span>Follow-up status</span><strong>${escapeHtml(item.followUpStatus || 'Verify / Establish Baseline')}</strong></div></div></details>`).join('')}</div>`;
  }

  function keyReferencesHtml(intake = {}) {
    const refs = [
      ['Breaker panel / fuse box', intake.electricalPanel],
      ['Main water shutoff', intake.waterShutoff],
      ['Gas shutoff', intake.gasShutoff || intake.gasValve || intake.gasMeter || intake.gas],
      ['Furnace filter location / size', intake.hvacFilter],
      ['Fire extinguishers', intake.fireExtinguishers],
      ['Smoke / CO detector notes', intake.smokeCO],
      ['Irrigation shutoff / controller', /irrigation|sprinkler|controller|shutoff/i.test(text(intake.sewerIrrigation)) ? intake.sewerIrrigation : '']
    ];
    return `<details class="referenceBox" open><summary><strong>Important Need-to-Know Home References</strong><span>${refs.filter(([, value]) => text(value)).length}/${refs.length} recorded</span></summary><div class="referenceGrid">${refs.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${plain(value, 'Not recorded yet')}</strong></div>`).join('')}</div></details>`;
  }

  function buildClientReportHtml(payload = {}) {
    const client = payload.client || {};
    const intake = payload.intake || {};
    const pmr = Array.isArray(payload.pmr) ? payload.pmr : (payload.rows || []).filter(row => ['Monitor','Needs Attention','Immediate Concern'].includes(row.answer?.status));
    const passItems = Array.isArray(payload.passCareOutlook) ? payload.passCareOutlook : [];
    const groupsByRoom = groupBy(pmr, row => row.roomName || row.room || 'General');
    const groupsByTrade = groupBy(pmr, row => tradeLabel(row.answer?.trade || row.trade));
    const immediate = pmr.filter(row => row.answer?.status === 'Immediate Concern').length;
    const nearTerm = pmr.filter(row => row.answer?.status === 'Needs Attention').length;
    const monitor = pmr.filter(row => row.answer?.status === 'Monitor').length;
    const summary = pmr.length
      ? `This PMR includes ${pmr.length} finding${pmr.length === 1 ? '' : 's'} organized first by room, then by likely resource. Room-by-room details are expanded for homeowner review and printing. Trade-by-trade is collapsed for quick sorting and internal coordination.`
      : 'No immediate PMR findings were identified during this walkthrough. Continued-care items may still appear in the PMCP section.';

    const roomSections = Object.entries(groupsByRoom).map(([room, items]) => `<section class="reportSection roomSection"><h2>${escapeHtml(room)}</h2>${items.map(row => roomFinding(row, room)).join('')}</section>`).join('') || '<p class="muted">No room-by-room PMR findings recorded.</p>';
    const tradeSections = Object.entries(groupsByTrade).map(([trade, items]) => `<details class="reportSection tradeSection"><summary><h2>${escapeHtml(trade)}</h2><span>${items.length} item${items.length === 1 ? '' : 's'}</span></summary>${items.map(row => tradeFinding(row, trade)).join('')}</details>`).join('') || '<p class="muted">No trade-by-trade PMR findings recorded.</p>';

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Client PMR Report</title><style>
      :root{--navy:#0b3658;--gold:#bf8420;--cream:#f6efe3;--ink:#203040;--muted:#60717c;--line:#d8e4ea;--green:#52aa4b;--purple:#7e4c9a;--red:#c74732;--orange:#d49a1f;--shadow:rgba(13,44,73,.08)}
      *{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.45}main{max-width:1080px;margin:0 auto;padding:22px}header{background:#fff;border:1px solid var(--line);border-top:7px solid var(--gold);border-radius:0 0 24px 24px;padding:28px;box-shadow:0 10px 26px var(--shadow)}.eyebrow{margin:0 0 6px;color:var(--gold);font-size:12px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}h1{color:var(--navy);font-size:38px;line-height:1.05;margin:0 0 8px}h2{color:var(--navy);margin:0 0 12px;font-size:24px}h3{color:var(--navy);margin:0;font-size:18px}.lede{color:#40505f;font-size:16px;font-weight:750}.snapshot{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:18px 0}.stat{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 5px 16px var(--shadow)}.stat strong{display:block;color:var(--navy);font-size:30px}.stat span{display:block;color:var(--muted);font-weight:900}.referenceBox,.reportSection,.pmcpSection{display:block;background:#fff;border:1px solid var(--line);border-radius:22px;padding:18px;margin:18px 0;box-shadow:0 8px 22px var(--shadow)}summary{cursor:pointer;list-style:none}summary::-webkit-details-marker{display:none}.referenceBox summary,.tradeSection>summary,.pmcpItem summary{display:flex;justify-content:space-between;align-items:center;gap:12px}.referenceBox summary span,.tradeSection>summary span,.pmcpItem summary span{border:1px solid var(--line);background:#fbfdfe;border-radius:999px;padding:5px 9px;color:var(--muted);font-size:12px;font-weight:950}.referenceGrid,.detailGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-top:12px}.referenceGrid div,.detailGrid div{border:1px solid var(--line);border-radius:14px;background:#fbfdfe;padding:10px}.referenceGrid span,.detailGrid span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:950;margin-bottom:3px}.referenceGrid strong,.detailGrid strong{display:block;color:var(--ink);font-size:13px}.findingCard{background:#fff;border:1px solid var(--line);border-radius:18px;margin:12px 0;padding:15px;break-inside:avoid;page-break-inside:avoid;box-shadow:inset 6px 0 0 var(--gold)}.findingCard.expanded{box-shadow:inset 6px 0 0 var(--gold),0 4px 12px rgba(13,44,73,.045)}.findingHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.findingHead p{margin:0 0 3px;color:var(--muted);font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}.pill{border-radius:999px;padding:6px 10px;font-weight:950;font-size:12px}.pill.urgent{background:#f5d7d3;color:#842218}.pill.attention{background:#fff1c6;color:#805f00}.pill.monitor{background:#dfeedd;color:#285c30}.pill.neutral{background:#edf3f6;color:var(--navy)}.chipLine{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}.chipLine span:not(.dot){border:1px solid var(--line);border-radius:999px;background:#fbfdfe;padding:4px 8px;color:var(--muted);font-size:11px;font-weight:900}.dot{width:11px;height:11px;border-radius:50%;display:inline-block;align-self:center}.dot.urgent{background:var(--red)}.dot.attention{background:var(--orange)}.dot.monitor{background:var(--green)}.dot.neutral{background:#8aa0ad}.photoEvidence{margin-top:12px}.photoEvidence h4{margin:0 0 8px;color:var(--navy)}.photoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.photoCard{margin:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fbfdfe}.photoCard img,.photoPlaceholder{width:100%;height:145px;object-fit:cover;display:block;background:#edf3f6}.photoPlaceholder{display:grid;place-items:center;color:var(--muted);font-weight:950}.photoCard figcaption{padding:8px;display:grid;gap:2px}.photoCard figcaption strong{color:var(--navy)}.photoCard a,.photoCard span{font-size:12px;color:#0b5cad;font-weight:850}.tradeSection{box-shadow:inset -7px 0 0 #7e4c9a,0 8px 22px var(--shadow)}.tradeCollapsed{box-shadow:inset 5px 0 0 #d8e4ea}.tradeCollapsed summary .findingHead{width:100%}.tradeCollapsed:not([open]) .tradeDetail{display:none}.pmcpSection{box-shadow:inset -7px 0 0 var(--green),0 8px 22px var(--shadow)}.pmcpItem{border:1px solid var(--line);border-radius:16px;background:#fbfdfe;margin:10px 0;padding:12px}.muted{color:var(--muted);font-style:italic}.footer{margin:26px 0;color:var(--navy);font-weight:900;text-align:center}
      @media print{body{background:#fff}main{max-width:none;padding:0 18px}header,.referenceBox,.reportSection,.pmcpSection{box-shadow:none;break-inside:avoid}.roomSection{break-before:auto}.findingCard{box-shadow:inset 5px 0 0 var(--gold)!important}.photoCard img,.photoPlaceholder{height:120px}.tradeSection:not([open])>summary{border-bottom:0}.tradeCollapsed:not([open]) .tradeDetail{display:none}.noPrint{display:none!important}}
      @media(max-width:760px){main{padding:12px}.findingHead,.referenceBox summary,.tradeSection>summary,.pmcpItem summary{align-items:flex-start;flex-direction:column}.referenceGrid,.detailGrid{grid-template-columns:1fr}}
    </style></head><body><main><header><p class="eyebrow">The Homeowner Advocate · Preventive Maintenance Report</p><h1>${escapeHtml(client.address || 'Client PMR')}</h1><p class="lede">${escapeHtml(client.name || 'Client')} · ${escapeHtml(client.date || 'Walkthrough Date')}</p><p>${escapeHtml(summary)}</p></header><section class="snapshot"><div class="stat"><strong>${immediate}</strong><span>Immediate</span></div><div class="stat"><strong>${nearTerm}</strong><span>Near-Term</span></div><div class="stat"><strong>${monitor}</strong><span>Monitor</span></div><div class="stat"><strong>${passItems.length}</strong><span>PMCP Items</span></div></section>${keyReferencesHtml(intake)}<section class="reportSection"><h2>Room-by-Room Action List</h2><p class="lede">Expanded for homeowner review, printing, and binder use.</p>${roomSections}</section><section class="reportSection"><h2>Trade-by-Trade Action List</h2><p class="lede">Collapsed by default. This uses the same findings, grouped by likely resource.</p>${tradeSections}</section><section class="pmcpSection"><h2>Preventive Maintenance Care Plan</h2><p class="lede">Selected continued-care items from PASS / PMCP. These are routine care items, not PMR defect counts.</p>${pmcpHtml(passItems)}</section><p class="footer">You don’t hire trades — you hire The Homeowner Advocate. One point of contact. Every step. Every task.</p></main></body></html>`;
  }

  function pdfEscape(value) {
    return String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/\r/g, '').replace(/\n/g, ' ');
  }

  function dataUriToBinaryString(dataUri) {
    return atob(String(dataUri).split(',')[1] || '');
  }

  function buildImagePdf(pages, { title = 'Client PMR Report', pageWidth = 612, pageHeight = 792 } = {}) {
    const enc = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let byteLength = 0;
    const addText = value => { const bytes = enc.encode(value); chunks.push(bytes); byteLength += bytes.length; };
    const addBinary = binary => { const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); chunks.push(bytes); byteLength += bytes.length; };
    const pageCount = pages.length;
    const catalogId = 1;
    const pagesId = 2;
    const firstPageId = 3;
    const imageObjectId = index => firstPageId + pageCount + (index * 2);
    const contentObjectId = index => imageObjectId(index) + 1;
    const writeObjectStart = id => { offsets[id] = byteLength; addText(`${id} 0 obj\n`); };
    addText('%PDF-1.4\n%THA\n');
    writeObjectStart(catalogId); addText(`<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`);
    writeObjectStart(pagesId); addText(`<< /Type /Pages /Kids ${pages.map((_, index) => `${firstPageId + index} 0 R`).join(' ')} /Count ${pageCount} >>\nendobj\n`);
    pages.forEach((page, index) => { const pageId = firstPageId + index; writeObjectStart(pageId); addText(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im${index + 1} ${imageObjectId(index)} 0 R >> >> /Contents ${contentObjectId(index)} 0 R >>\nendobj\n`); });
    pages.forEach((page, index) => {
      const binary = dataUriToBinaryString(page.dataUrl);
      writeObjectStart(imageObjectId(index)); addText(`<< /Type /XObject /Subtype /Image /Width ${page.pixelWidth} /Height ${page.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${binary.length} >>\nstream\n`); addBinary(binary); addText('\nendstream\nendobj\n');
      const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im${index + 1} Do\nQ\n`;
      writeObjectStart(contentObjectId(index)); addText(`<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
    });
    const infoId = firstPageId + pageCount + (pageCount * 2);
    writeObjectStart(infoId); addText(`<< /Title (${pdfEscape(title)}) /Creator (THA PMR Export) /Producer (THA PMR Export) >>\nendobj\n`);
    const xrefStart = byteLength;
    addText(`xref\n0 ${infoId + 1}\n0000000000 65535 f \n`);
    for (let id = 1; id <= infoId; id += 1) addText(`${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`);
    addText(`trailer\n<< /Size ${infoId + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
    const pdfBytes = new Uint8Array(byteLength);
    let cursor = 0;
    chunks.forEach(chunk => { pdfBytes.set(chunk, cursor); cursor += chunk.length; });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  async function imageLoad(src) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  async function htmlToPdfBlob(html) {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:960px;height:1242px;border:0;visibility:hidden;';
    document.body.appendChild(frame);
    try {
      frame.srcdoc = html;
      await new Promise(resolve => { frame.onload = () => requestAnimationFrame(() => requestAnimationFrame(resolve)); setTimeout(resolve, 700); });
      const doc = frame.contentDocument;
      const serializer = new XMLSerializer();
      const styleText = Array.from(doc.querySelectorAll('style')).map(style => style.textContent || '').join('\n').replace(/]]>/g, ']]]]><![CDATA[>');
      const bodyMarkup = Array.from(doc.body.childNodes).map(node => serializer.serializeToString(node)).join('');
      const htmlWidth = 960;
      const pageHeightPx = Math.round(htmlWidth * (792 / 612));
      const totalHeight = Math.max(pageHeightPx, doc.documentElement.scrollHeight, doc.body.scrollHeight);
      const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const pages = [];
      for (let y = 0; y < totalHeight; y += pageHeightPx) {
        const xhtml = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${htmlWidth}px;min-height:${totalHeight}px;background:#fff;"><style><![CDATA[${styleText}]]></style><div style="transform:translateY(-${y}px);transform-origin:top left;width:${htmlWidth}px;">${bodyMarkup}</div></div>`;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${htmlWidth}" height="${pageHeightPx}" viewBox="0 0 ${htmlWidth} ${pageHeightPx}"><rect width="100%" height="100%" fill="#ffffff"/><foreignObject x="0" y="0" width="${htmlWidth}" height="${totalHeight}">${xhtml}</foreignObject></svg>`;
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
        const image = await imageLoad(url);
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(htmlWidth * scale);
        canvas.height = Math.round(pageHeightPx * scale);
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        pages.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), pixelWidth: canvas.width, pixelHeight: canvas.height });
      }
      return buildImagePdf(pages);
    } catch (error) {
      return new Blob([`%PDF-1.4\n%THA fallback PDF\n`], { type: 'application/pdf' });
    } finally {
      frame.remove();
    }
  }

  function textFromBytes(bytes) {
    try { return decoder.decode(bytes); } catch { return ''; }
  }

  function maybeCapturePayload(metadata, contentBytes, contentType) {
    const name = metadata?.name || '';
    if (!/json/i.test(contentType) && !/\.json$/i.test(name)) return;
    const raw = textFromBytes(contentBytes);
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.rows || parsed?.pmr || parsed?.client) latestPayload = parsed;
    } catch {}
  }

  window.fetch = async function(input, init = {}) {
    let url = typeof input === 'string' ? input : input?.url;
    const method = (init.method || input?.method || 'GET').toUpperCase();

    if (typeof url === 'string') {
      const rewritten = rewriteQueryUrl(url);
      if (rewritten !== url) {
        url = rewritten;
        input = typeof input === 'string' ? rewritten : new Request(rewritten, input);
      }
    }

    if (method === 'POST' && typeof url === 'string' && url.includes('googleapis.com/drive/v3/files') && !url.includes('/upload/')) {
      const contentType = headerValue(init.headers || input?.headers, 'Content-Type');
      if (/application\/json/i.test(contentType) && init.body) {
        try {
          const metadata = JSON.parse(init.body);
          if (metadata.mimeType === 'application/vnd.google-apps.folder') metadata.name = rewriteFolderName(metadata.name);
          const nextInit = { ...init, body: JSON.stringify(metadata) };
          const response = await originalFetch(input, nextInit);
          response.clone().json().then(created => {
            if (created?.id && metadata.mimeType === 'application/vnd.google-apps.folder') {
              folderParentById.set(created.id, metadata.parents?.[0] || '');
              folderNameById.set(created.id, metadata.name || '');
            }
          }).catch(() => {});
          return response;
        } catch {}
      }
    }

    if (method === 'POST' && typeof url === 'string' && url.includes('googleapis.com/upload/drive/v3/files')) {
      const parsed = await parseMultipart(input, init).catch(() => null);
      if (parsed?.metadata) {
        const metadata = { ...parsed.metadata };
        let contentType = parsed.uploadContentType;
        let contentBlob = new Blob([parsed.contentBytes], { type: contentType });
        const authHeader = headerValue(init.headers || input?.headers, 'Authorization');
        maybeCapturePayload(metadata, parsed.contentBytes, contentType);

        const parentId = metadata.parents?.[0] || '';
        const packageId = folderNameById.get(parentId) === FOLDER_NAMES.backup || folderNameById.get(parentId) === FOLDER_NAMES.working
          ? folderParentById.get(parentId)
          : parentId;

        if (metadata.name === 'PMR Report Packet.html' || /^01 - Homeowner PMR/i.test(metadata.name || '')) {
          const folderId = await clientReportFolder(authHeader, parentId);
          metadata.parents = [folderId || parentId];
          metadata.name = '01 - Client PMR — Interactive Report.html';
          delete metadata.mimeType;
          const html = buildClientReportHtml(latestPayload || {});
          contentBlob = new Blob([html], { type: 'text/html' });
          contentType = 'text/html';
        } else if (metadata.name === 'PMR Report Packet.pdf' || /^02 - Homeowner PMR/i.test(metadata.name || '')) {
          const folderId = await clientReportFolder(authHeader, parentId);
          metadata.parents = [folderId || parentId];
          metadata.name = '02 - Client PMR — Printable Binder Copy.pdf';
          delete metadata.mimeType;
          const html = buildClientReportHtml(latestPayload || {});
          contentBlob = await htmlToPdfBlob(html);
          contentType = 'application/pdf';
        } else if (/intake summary|htc checklist|photo index|tha office|airtable|internal action/i.test(metadata.name || '')) {
          const rootPackageId = packageId || parentId;
          const folderId = await workingFolder(authHeader, rootPackageId);
          if (folderId) metadata.parents = [folderId];
          metadata.name = cleanName(metadata.name || 'Working File');
        } else if (/Emergency Backup|Full Walkthrough Export|Restore/i.test(metadata.name || '')) {
          metadata.name = metadata.name.replace(/^Emergency Backup — /, '');
        }

        const nextBody = makeMultipartBody(parsed.boundary, metadata, contentBlob, contentType);
        const nextInit = { ...init, headers: withHeader(init.headers || input?.headers || {}, 'Content-Type', `multipart/related; boundary=${parsed.boundary}`), body: nextBody };
        return originalFetch(input, nextInit);
      }
    }

    return originalFetch(input, init);
  };
})();
