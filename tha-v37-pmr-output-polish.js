(() => {
  const STYLE_ID = 'tha-v37-pmr-output-polish-styles';
  const SESSION_KEY = 'tha-walkthrough-sessions';
  const CURRENT_ID_KEY = 'tha-current-walkthrough-id';
  const PENDING_IMPORT_KEY = 'tha-v37-pending-restore-note';
  const OUTPUT_VISIBILITY_NOTE = 'Client-facing PMR is separated from THA internal office records. Internal notes, raw intake context, and automation follow-up fields belong in Secondary Editable Copies, Backup Data, Airtable, or calendar workflows.';

  let latestPayload = null;
  let latestPolishedHtml = '';

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function plain(value = '') {
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

  function priorityRank(row = {}) {
    const status = row.answer?.status || row.status || '';
    if (status === 'Immediate Concern') return 0;
    if (status === 'Needs Attention') return 1;
    if (status === 'Monitor') return 2;
    if (status === 'Good') return 3;
    return 4;
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

  function groupBy(items = [], getKey = item => item) {
    return items.reduce((acc, item) => {
      const key = getKey(item) || 'Other';
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  function sortedRows(rows = []) {
    return [...rows].sort((a, b) => priorityRank(a) - priorityRank(b) || rowRoom(a).localeCompare(rowRoom(b)) || String(a.item || '').localeCompare(String(b.item || '')));
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

  function findingCard(row = {}) {
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

  function roomByRoom(rows = []) {
    const grouped = groupBy(sortedRows(rows), rowRoom);
    return Object.entries(grouped).map(([room, items]) => `<section class="groupBlock"><h3>${escapeHtml(room)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3>${items.map(findingCard).join('')}</section>`).join('') || '<p class="muted">No client-facing findings recorded.</p>';
  }

  function tradeByTrade(rows = []) {
    const grouped = groupBy(sortedRows(rows), row => displayTrade(row.answer?.trade || row.trade));
    return Object.entries(grouped).map(([trade, items]) => `<section class="groupBlock"><h3>${escapeHtml(trade)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3>${items.map(findingCard).join('')}</section>`).join('') || '<p class="muted">No trade/resource groupings recorded.</p>';
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

  function buildPolishedPmrHtml(payload = {}) {
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
      *{box-sizing:border-box} body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.52} main{max-width:1040px;margin:0 auto;padding:24px} header{background:#fff;border-bottom:7px solid var(--gold);border-radius:0 0 26px 26px;padding:28px 24px;box-shadow:0 12px 30px var(--shadow)} h1{font-size:clamp(30px,5vw,48px);line-height:1.05;color:var(--navy);margin:0 0 8px} h2{color:var(--navy);margin:0 0 10px} h3,h4{color:var(--navy)} .eyebrow,.sourceTag,.pmrField span,summary span{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);font-weight:950}.lede{color:#40505f;font-size:15px}.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:16px}.meta .pmrField{background:var(--soft)} .pmrField{border:1px solid #d8e4ea;background:#fff;border-radius:14px;padding:10px 12px}.pmrField strong{display:block;color:var(--ink);font-size:15px;font-weight:750;margin-top:2px}.fieldGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.referenceSnapshot,.stoplightSummary,.scopeCard{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;margin:18px 0;box-shadow:0 8px 22px var(--shadow)}.stoplightGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.stoplight{border-radius:18px;padding:16px;border:1px solid #e2e8ed}.stoplight strong{font-size:38px;color:var(--navy);display:block}.stoplight span{font-weight:950;text-transform:uppercase;letter-spacing:.05em}.stoplight p{margin:4px 0 0;color:#40505f}.stoplight.now{background:var(--red)}.stoplight.upcoming{background:var(--amber)}.stoplight.watch{background:var(--green)}.stoplight.routine{background:var(--purple)}.reportSection{background:#fff;border:1px solid var(--line);border-radius:20px;margin:16px 0;box-shadow:0 8px 22px var(--shadow);overflow:hidden}.reportSection summary{cursor:pointer;list-style:none;padding:18px 20px;display:flex;justify-content:space-between;gap:12px;align-items:center}.reportSection summary::-webkit-details-marker{display:none}.reportSection summary strong{font-size:22px;color:var(--navy)}.reportSection summary:after{content:'Open / close';font-size:11px;font-weight:900;color:var(--muted);border:1px solid #d8e4ea;border-radius:999px;padding:5px 8px;background:#fff}.sectionBody{border-top:1px solid #eadbc2;padding:18px 20px}.groupBlock{border:1px solid #d8e4ea;border-radius:18px;background:#fbfdfe;padding:14px;margin:12px 0}.groupBlock h3{display:flex;justify-content:space-between;gap:10px;margin:0 0 10px}.groupBlock h3 span{color:var(--muted);font-size:12px;text-transform:uppercase}.findingCard{background:#fff;border:1px solid #dbe6eb;border-left:6px solid var(--gold);border-radius:16px;padding:14px;margin:10px 0}.findingCard.now{border-left-color:#c74732}.findingCard.upcoming{border-left-color:#d49a1f}.findingCard.watch{border-left-color:#4c9a58}.findingHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.findingHead h4{margin:2px 0 8px;font-size:18px}.statusPill{border-radius:999px;padding:6px 10px;font-weight:950;font-size:12px;white-space:nowrap}.statusPill.now{background:var(--red);color:#842218}.statusPill.upcoming{background:var(--amber);color:#755600}.statusPill.watch{background:var(--green);color:#285c30}.noteBlock{margin-top:10px}.pmcpTable{display:grid;gap:10px}.pmcpRow{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;border:1px solid #d8e4ea;border-radius:16px;background:#fbfdfe;padding:12px}.muted{color:var(--muted);font-style:italic}.scopeCard{background:#fffdf8;border-left:5px solid var(--gold)}@media print{body{background:#fff}main{padding:0}.reportSection{break-inside:avoid}.reportSection summary:after{display:none}}
    </style></head><body><main>
      <header><p class="eyebrow">The Homeowner Advocate</p><h1>${escapeHtml(title)}</h1><p class="lede">A plain-English maintenance planning report organized by the house: exterior first, interior second, then room-by-room, trade-by-trade, and the Preventive Maintenance Care Plan.</p><div class="meta">${field('Client', client.name)}${field('Property', client.address)}${field('Walkthrough date / visit label', client.date)}${field('Generated', generated)}</div></header>
      ${homeReferenceSnapshot(payload)}
      ${stoplightSummary(allRows, passItems)}
      ${sectionDetails('Exterior / Outside Findings', 'Outside and exterior-related findings are presented first, front curb to back fence.', exteriorRows.map(findingCard).join('') || '<p class="muted">No exterior findings recorded.</p>', { open: true, kicker: 'Client-facing' })}
      ${sectionDetails('Interior Findings', 'Interior findings are grouped here before the deeper room-by-room and trade-by-trade views.', interiorRows.map(findingCard).join('') || '<p class="muted">No interior findings recorded.</p>', { open: true, kicker: 'Client-facing' })}
      ${sectionDetails('Room-by-Room Action List', 'The same client-facing findings, rearranged by location for homeowner review.', roomByRoom(allRows), { kicker: 'Alternate view' })}
      ${sectionDetails('Trade-by-Trade Action List', 'The same client-facing findings, rearranged by likely resource or trade.', tradeByTrade(allRows), { kicker: 'Alternate view' })}
      ${sectionDetails('Preventive Maintenance Care Plan', 'Routine and forecasted care from PASS / PMCP. These are not repair-defect counts and do not include internal THA reminder dates.', pmcpSection(passItems), { kicker: 'PMCP' })}
      <section class="scopeCard"><h2>Scope / Visibility Note</h2><p>${escapeHtml(scopeNote)}</p><p><strong>Internal records:</strong> ${escapeHtml(OUTPUT_VISIBILITY_NOTE)}</p></section>
    </main></body></html>`;
  }

  function reportTextFromPayload(payload = {}) {
    const rows = sortedRows((payload.pmr || []).filter(row => row?.answer && !['Unknown', 'Good'].includes(row.answer.status)));
    const lines = [
      'The Homeowner Advocate — Homeowner PMR',
      `Client: ${compact(payload.client?.name)}`,
      `Property: ${compact(payload.client?.address)}`,
      `Visit: ${compact(payload.client?.date)}`,
      '',
      'Home Reference Snapshot',
      `Electrical panel: ${compact(payload.intake?.electricalPanel)}`,
      `Main water shutoff: ${compact(payload.intake?.waterShutoff)}`,
      `Fire extinguishers: ${compact(payload.intake?.fireExtinguishers)}`,
      `Smoke / CO: ${compact(payload.intake?.smokeCO)}`,
      '',
      'Findings'
    ];
    rows.forEach(row => {
      lines.push('', `${statusLabel(row.answer?.status)} — ${rowRoom(row)} — ${row.item || 'Finding'}`, `Who handles it: ${displayTrade(row.answer?.trade || row.trade)}`, `Observation: ${compact(row.answer?.notes, 'No notes recorded')}`, `Next step: ${nextStepFor(row)}`, `Timing: ${timingFor(row)}`);
    });
    const passItems = payload.passCareOutlook || [];
    if (passItems.length) {
      lines.push('', 'Preventive Maintenance Care Plan');
      passItems.forEach(item => lines.push('', `${compact(item.careItem || item.careTopic, 'Care item')}`, `Cadence: ${compact(item.cadence)}`, `Last completed: ${compact(item.lastCompletedDisplay || item.lastCompletedDate)}`, `Next window: ${compact(item.nextSuggestedWindow || item.targetWindow)}`, `Resource: ${compact(item.resource)}`));
    }
    return lines.join('\n');
  }

  function pdfEscape(value = '') {
    return String(value ?? '').replace(/[\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '').replace(/[\\()]/g, '\\$&');
  }

  function wrapLine(line = '', width = 92) {
    const words = String(line).split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    words.forEach(word => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > width && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    lines.push(current || '');
    return lines;
  }

  function buildSimplePdfBlob(text = 'PMR print copy') {
    const encoder = new TextEncoder();
    const allLines = String(text || '').split(/\r?\n/).flatMap(line => wrapLine(line, 92));
    const linesPerPage = 44;
    const pages = [];
    for (let i = 0; i < allLines.length; i += linesPerPage) pages.push(allLines.slice(i, i + linesPerPage));
    if (!pages.length) pages.push(['PMR print copy']);
    const objects = [];
    const addObject = body => { objects.push(body); return objects.length; };
    const catalogId = addObject('');
    const pagesId = addObject('');
    const pageIds = [];
    const contentIds = [];
    pages.forEach(pageLines => {
      const content = ['BT', '/F1 10 Tf', '50 750 Td', '14 TL', ...pageLines.map(line => `(${pdfEscape(line)}) Tj T*`), 'ET'].join('\n');
      const contentId = addObject(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`);
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentId} 0 R >>`);
      contentIds.push(contentId);
      pageIds.push(pageId);
    });
    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    let pdf = '%PDF-1.4\n%THA PMR\n';
    const offsets = [0];
    objects.forEach((body, index) => {
      offsets[index + 1] = encoder.encode(pdf).length;
      pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let id = 1; id <= objects.length; id += 1) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: 'application/pdf' });
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .topbar .brand span{font-weight:900!important;color:#0b3658!important}
      main.passWorkspace [data-tha-v37-hidden-pmr-control="true"]{display:none!important}
      .tha-v37-visibility-legend{border:1px solid #d8e4ea;border-left:5px solid #bf8420;border-radius:16px;background:#fffdf8;padding:12px 14px;margin:12px 0;color:#203040;box-shadow:0 6px 14px rgba(13,44,73,.06)}
      .tha-v37-visibility-legend strong{color:#0b3658}.tha-v37-visibility-legend p{margin:4px 0;color:#40505f;font-size:13px}.tha-v37-visibility-legend .chipRow{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.tha-v37-visibility-legend span{display:inline-flex;border-radius:999px;border:1px solid #d8e4ea;background:#fff;color:#0b3658;padding:5px 8px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}
      .tha-v37-restore-panel{border:1px solid #d8e4ea;border-left:5px solid #52aa4b;border-radius:16px;background:#f7fbf6;padding:12px 14px;margin:12px 0;color:#203040}.tha-v37-restore-panel h4{margin:0 0 4px;color:#0b3658}.tha-v37-restore-panel p{margin:4px 0;color:#40505f;font-size:13px}.tha-v37-restore-panel input{display:block;margin-top:8px;max-width:100%}.tha-v37-restore-panel .restoreStatus{display:block;margin-top:8px;font-size:12px;font-weight:900;color:#285c30}
      .pmr .field-label,.pmr .detail span.field-label{font-size:11px!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:#8a641f!important;font-weight:950!important}.pmr .detail{background:#fffdf8!important}.pmr .detail .not-recorded{font-size:13px!important}
    `;
    document.head.append(style);
  }

  function syncNavOrder() {
    const brand = document.querySelector('.topbar .brand span');
    if (brand && brand.textContent.trim() !== 'Intake → HTC → PASS → PMR → Metrics') brand.textContent = 'Intake → HTC → PASS → PMR → Metrics';
    const nav = document.querySelector('.topbar nav');
    if (!nav) return;
    const buttons = Array.from(nav.children);
    const pass = buttons.find(button => /\bPASS\b/i.test(button.textContent || ''));
    const pmr = buttons.find(button => /\bPMR\b/i.test(button.textContent || ''));
    if (pass && pmr && Array.from(nav.children).indexOf(pass) > Array.from(nav.children).indexOf(pmr)) nav.insertBefore(pass, pmr);
  }

  function hidePassPmrControls() {
    const main = document.querySelector('main.passWorkspace');
    if (!main) return;
    main.querySelectorAll('button,a').forEach(element => {
      const text = (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      if (/PMR/i.test(text) && /(download|print|homeowner)/i.test(text)) {
        element.setAttribute('data-tha-v37-hidden-pmr-control', 'true');
        element.setAttribute('aria-hidden', 'true');
        element.tabIndex = -1;
      }
    });
  }

  function ensureVisibilityLegend() {
    const pmrMain = document.querySelector('main.pmr:not(.passWorkspace)');
    if (pmrMain && !pmrMain.querySelector('.tha-v37-visibility-legend')) {
      const legend = document.createElement('section');
      legend.className = 'tha-v37-visibility-legend';
      legend.innerHTML = '<strong>Output visibility</strong><p>The PMR page is the homeowner-facing packet. THA action tasks, raw intake context, timing triggers, and Airtable follow-up fields stay in internal office records.</p><div class="chipRow"><span>Client PMR</span><span>Internal THA</span><span>Airtable follow-up</span></div>';
      const firstCard = pmrMain.querySelector('.card,section,article');
      if (firstCard?.parentNode) firstCard.parentNode.insertBefore(legend, firstCard.nextSibling);
      else pmrMain.prepend(legend);
    }
  }

  function normalizeExportPayload(data = {}) {
    if (data?.client && (data.rows || data.pmr || data.intake)) return data;
    if (data?.data?.client) return data.data;
    return data;
  }

  function addRestorePanel() {
    const controls = Array.from(document.querySelectorAll('section,article,div')).find(element => /Business Records & Drive/i.test(element.textContent || '') && element.querySelector('button,input,select'));
    if (!controls || controls.querySelector('.tha-v37-restore-panel')) return;
    const panel = document.createElement('div');
    panel.className = 'tha-v37-restore-panel';
    panel.innerHTML = '<h4>Restore / continue from Drive backup JSON</h4><p>Use the Full Data Backup JSON from Drive to add this walkthrough to Saved Work Sessions on another device. After import, open it from the Work Session selector.</p><input type="file" accept="application/json,.json"><span class="restoreStatus"></span>';
    const input = panel.querySelector('input');
    const status = panel.querySelector('.restoreStatus');
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const payload = normalizeExportPayload(JSON.parse(await file.text()));
        if (!payload?.client) throw new Error('This file does not look like a THA walkthrough backup.');
        const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}') || {};
        const id = `restored-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const name = [payload.client.name, payload.client.address, payload.client.date].filter(Boolean).join(' — ') || 'Restored Walkthrough';
        sessions[id] = { id, name, updatedAt: new Date().toISOString(), data: {
          client: payload.client || {},
          answers: Object.fromEntries((payload.rows || []).map(row => [row.id, row.answer]).filter(([id, answer]) => id && answer)),
          intake: payload.intake || {},
          dynamicRooms: payload.dynamicRooms || [],
          sectionOrder: payload.sectionOrder || [],
          itemOrder: payload.itemOrder || {},
          pinnedItems: payload.pinnedItems || {},
          roomCapture: payload.roomCapture || {},
          passReview: payload.passReview || {}
        }};
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
        localStorage.setItem(CURRENT_ID_KEY, id);
        localStorage.setItem(PENDING_IMPORT_KEY, `Restored ${name}. Open it from Work Session to continue editing, then save a new Drive package.`);
        status.textContent = 'Imported to Saved Work Sessions. Reloading…';
        setTimeout(() => window.location.reload(), 700);
      } catch (error) {
        status.textContent = error?.message || 'Import failed.';
        status.style.color = '#842218';
      }
    });
    controls.append(panel);
    const note = localStorage.getItem(PENDING_IMPORT_KEY);
    if (note) {
      status.textContent = note;
      localStorage.removeItem(PENDING_IMPORT_KEY);
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

  function multipartBody(metadata, blob, mimeType = 'text/html') {
    const boundary = `tha_v37_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

  function enrichBackupPayload(payload = {}) {
    return {
      ...payload,
      thaOutputModel: {
        workflowOrder: ['Intake', 'HTC', 'PASS / PMCP Builder', 'PMR', 'Metrics'],
        clientFacing: ['Home Reference Snapshot', 'Stoplight Summary', 'Exterior Findings', 'Interior Findings', 'Room-by-Room Action List', 'Trade-by-Trade Action List', 'Preventive Maintenance Care Plan'],
        internalOnly: ['Raw homeowner intake context', 'THA Action To-Do List', 'Airtable follow-up triggers', 'Reminder dates', 'Vendor coordination notes'],
        note: OUTPUT_VISIBILITY_NOTE
      }
    };
  }

  async function polishedDriveFetch(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    if (!/https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files/i.test(url) || method !== 'POST' || !/uploadType=multipart/i.test(url)) {
      return window.__thaV37OriginalFetch(input, init);
    }

    try {
      const parsed = await parseMultipart(init.body, init.headers?.['Content-Type'] || init.headers?.get?.('Content-Type') || '');
      if (!parsed?.metadata?.name) return window.__thaV37OriginalFetch(input, init);
      const name = parsed.metadata.name;

      if (/Emergency Backup.*Full Walkthrough Export\.json/i.test(name)) {
        const payload = JSON.parse(parsed.content || '{}');
        latestPayload = normalizeExportPayload(payload);
        const enriched = enrichBackupPayload(latestPayload);
        const metadata = { ...parsed.metadata, name: '00 - Restore This Walkthrough — Full Data Backup.json' };
        const { boundary, body } = multipartBody(metadata, new Blob([JSON.stringify(enriched, null, 2)], { type: 'application/json' }), 'application/json');
        return window.__thaV37OriginalFetch(input, { ...init, headers: headersWithBoundary(init.headers, boundary), body });
      }

      if (name === 'PMR Report Packet.html') {
        const payload = latestPayload || null;
        const html = payload ? buildPolishedPmrHtml(payload) : parsed.content;
        latestPolishedHtml = html;
        const metadata = { ...parsed.metadata, name: '01 - Homeowner PMR — Client Facing', mimeType: 'application/vnd.google-apps.document' };
        const { boundary, body } = multipartBody(metadata, new Blob([html], { type: 'text/html' }), 'text/html');
        return window.__thaV37OriginalFetch(input, { ...init, headers: headersWithBoundary(init.headers, boundary), body });
      }

      if (name === 'PMR Report Packet.pdf') {
        const payload = latestPayload || null;
        const pdfText = payload ? reportTextFromPayload(payload) : plain(latestPolishedHtml || 'THA PMR print copy');
        const pdfBlob = buildSimplePdfBlob(pdfText);
        const metadata = { ...parsed.metadata, name: '02 - Homeowner PMR — PDF Print Copy.pdf' };
        const { boundary, body } = multipartBody(metadata, pdfBlob, 'application/pdf');
        return window.__thaV37OriginalFetch(input, { ...init, headers: headersWithBoundary(init.headers, boundary), body });
      }
    } catch (error) {
      console.warn('THA V3.7 Drive output polish skipped for this upload:', error);
    }
    return window.__thaV37OriginalFetch(input, init);
  }

  function installFetchInterceptor() {
    if (window.__thaV37OriginalFetch) return;
    window.__thaV37OriginalFetch = window.fetch.bind(window);
    window.fetch = polishedDriveFetch;
  }

  function syncUi() {
    installStyles();
    syncNavOrder();
    hidePassPmrControls();
    ensureVisibilityLegend();
    addRestorePanel();
  }

  installFetchInterceptor();
  const observer = new MutationObserver(() => syncUi());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', syncUi);
  document.addEventListener('DOMContentLoaded', syncUi);
  syncUi();
})();
