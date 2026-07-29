import { INTERNAL_REPORT_STYLES } from './internalReportStyles.js';

function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function list(value) { return Array.isArray(value) ? value : []; }
function text(value = '', fallback = '') { const output = String(value ?? '').trim(); return output || fallback; }
function esc(value = '') { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function rich(value = '', fallback = 'Not recorded') { return esc(text(value, fallback)).replace(/\n/g, '<br/>'); }
function trade(value = '') { return value === 'Handyman' ? 'Handy Services' : text(value, 'Resource to be assigned'); }
function tone(value = '') {
  if (/immediate/i.test(value)) return 'red';
  if (/needs attention|not scheduled|needs follow-up/i.test(value)) return 'orange';
  if (/monitor|watch/i.test(value)) return 'gold';
  if (/selected|scheduled|completed|recorded|good|deferred|not this year|long-range|reminder/i.test(value)) return 'green';
  return 'gray';
}
function header(snapshot, title) {
  const data = object(snapshot.data);
  const client = object(data.client);
  return `<header><p class="eyebrow">The Homeowner Advocate · Internal Working Record</p><h1>${esc(title)}</h1><p class="lede">${esc(client.name || 'Client pending')} · ${esc(client.address || data.property?.address || 'Address pending')}</p><div class="meta"><div><span>Walkthrough date / visit</span><strong>${rich(client.date)}</strong></div><div><span>Working-session type</span><strong>${rich(data.walkthroughName, 'General advocate walkthrough')}</strong></div><div><span>Snapshot ID</span><strong>${esc(snapshot.snapshotId || '')}</strong></div><div><span>Updated</span><strong>${esc(snapshot.updatedAt || '')}</strong></div></div></header>`;
}
function shell(snapshot, title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><style>${INTERNAL_REPORT_STYLES}</style></head><body><main>${header(snapshot,title)}${body}<p class="source">Generated from THA Snapshot ${esc(snapshot.snapshotId || '')} · Schema ${esc(snapshot.schemaVersion || '')}</p><p class="footer">The Homeowner Advocate · One connected record from Intake through continued care.</p></main></body></html>`;
}
function requiredReferences(data = {}) {
  const intake = object(data.intake);
  const status = object(data.administration?.requiredHomeReferences);
  const gas = text(intake.gasShutoff || intake.gasService || intake.gasValve || intake.gasMeter || intake.gas);
  return [
    { id:'electricalPanel', label:'Electrical panel / fuse box', value:text(status.electricalPanel?.value || intake.electricalPanel), state:text(status.electricalPanel?.status) },
    { id:'waterShutoff', label:'Main water shutoff', value:text(status.waterShutoff?.value || intake.waterShutoff), state:text(status.waterShutoff?.status) },
    { id:'gasService', label:'Gas service / shutoff', value:text(status.gasService?.value || gas), state:text(status.gasService?.status) }
  ].map(item => ({ ...item, acknowledged: Boolean(item.value || /not applicable|no gas|unable to locate|needs follow-up|acknowledged/i.test(item.state)) }));
}
function intakeLabel(key = '') {
  const labels = {
    notes:'Homeowner goals / concerns',priorityAreas:'Priority rooms / areas',doNotOverlook:'Do not overlook',electricalPanel:'Electrical panel / fuse box',electricalUpdates:'Electrical history / concerns',waterShutoff:'Main water shutoff',gasService:'Gas service / shutoff',plumbingHistory:'Leaks / drains / plumbing history',waterHeater:'Water heater service / age',sewerIrrigation:'Sewer / irrigation history',hvacFilter:'Furnace filter location / size',hvacService:'Furnace service history',hvacAcService:'A/C / heat-pump service history',comfort:'Comfort notes',roofAge:'Roof age',roofHistory:'Roof history',solar:'Solar context',drainagePooling:'Drainage / pooling',drainageHistory:'Drainage history',gutters:'Gutters / downspouts',windowsDoors:'Windows / doors',fogging:'Fogging / failed seals',paintStain:'Paint / stain timing',productsColors:'Products / colors',pests:'Pest history',fireExtinguishers:'Fire extinguishers',smokeCO:'Smoke / CO detectors',chimney:'Chimney / fireplace',additionalConcerns:'Additional concerns'
  };
  return labels[key] || key.replace(/([A-Z])/g,' $1').replace(/^./,char=>char.toUpperCase());
}
function intakeEntries(intake = {}) {
  const hidden = new Set(['importedRawResponse','importedUnmappedNotes','intakeId','intakeStatus','priorities','pace','budgetStyle','decisionStyle']);
  return Object.entries(intake).filter(([key,value]) => !hidden.has(key) && text(value)).flatMap(([key,value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return Object.entries(value).filter(([,child])=>text(child)).map(([childKey,child])=>({ label:intakeLabel(childKey), value:child }));
    return [{ label:intakeLabel(key), value }];
  });
}
function findingCard(finding = {}) {
  const fields = object(finding.fields);
  const context = object(finding.context);
  const status = text(fields.status,'Review');
  const cardTone = tone(status);
  return `<article class="card ${cardTone}"><div class="cardHead"><div><h3>${esc(context.item || `Checklist item ${finding.templateItemId}`)}</h3><p>${esc(context.roomName || finding.roomId || 'General')} · ${esc(context.zone || context.category || '')}</p></div><span class="pill ${cardTone}">${esc(status)}</span></div><div class="chips"><span class="chip">${esc(trade(fields.trade || context.tradeDefault))}</span><span class="chip">${esc(fields.effort || context.effortDefault || 'Time pending')}</span><span class="chip">PMR: ${esc(finding.reporting?.pmrDecision || 'review')}</span>${finding.continuedCare?.candidate ? '<span class="chip green">PMCP-linked</span>' : ''}</div><div class="detailGrid"><div class="detail wide"><span>Field observation</span><strong>${rich(fields.notes)}</strong></div><div class="detail"><span>Why it matters</span><strong>${rich(context.why)}</strong></div><div class="detail"><span>Recommended action</span><strong>${rich(context.recommendedAction)}</strong></div><div class="detail"><span>Action certainty</span><strong>${rich(fields.actionCertainty,'Likely Path')}</strong></div><div class="detail"><span>Homeowner pace</span><strong>${rich(fields.pref)}</strong></div>${fields.internalNote ? `<div class="detail wide"><span>Internal THA note</span><strong>${rich(fields.internalNote)}</strong></div>` : ''}</div></article>`;
}
function careCard(item = {}) {
  const fields = object(item.fields);
  const decision = text(item.reporting?.pmcpDecision,'pending');
  const followUp = text(fields.followUpStatus || fields.passFollowUpStatus, decision === 'declined' ? 'Long-range / reminder set' : decision);
  const actionType = text(fields.thaActionType,'Unknown');
  const activePlanning = Boolean(fields.thaActionItem || fields.workOrderNow || actionType !== 'Unknown') && !/completed/i.test(followUp);
  const target = text(fields.reminderDate || fields.deferredReminderDate || fields.nextSuggestedWindow || fields.targetWindow || fields.suggestedWindow,'Next normal care window');
  const reminderSet = Boolean(['Planned','Scheduled','Deferred'].includes(followUp) || fields.reminderSet || fields.reminderDate || fields.deferredReminderDate || decision === 'declined');
  const status = activePlanning ? `Active planning · ${actionType}` : followUp;
  const cardTone = activePlanning ? 'purple' : tone(status);
  const reminderLabel = activePlanning ? `Target / next step: ${target}` : reminderSet ? `PMCP reminder: ${target}` : `Suggested window: ${target}`;
  return `<article class="card ${cardTone}"><div class="cardHead"><div><h3>${esc(fields.careItem || fields.careTopic || item.careItemId)}</h3><p>${esc(trade(fields.resource || fields.trade))}</p></div><span class="pill ${cardTone}">${esc(status)}</span></div><div class="detailGrid"><div class="detail"><span>Cadence</span><strong>${rich(fields.cadence,'As Needed')}</strong></div><div class="detail"><span>Last completed</span><strong>${rich(fields.lastCompletedDisplay || fields.lastCompletedDate,'Unknown — establish baseline')}</strong></div><div class="detail"><span>${activePlanning ? 'Active planning target' : reminderSet ? 'Reminder set' : 'Next suggested window'}</span><strong>${rich(reminderLabel)}</strong></div><div class="detail"><span>PMCP decision</span><strong>${esc(decision)}</strong></div><div class="detail wide"><span>Reason</span><strong>${rich(fields.reason || fields.passNote,'Routine continued-care planning item.')}</strong></div>${fields.internalNote ? `<div class="detail wide"><span>Internal THA note</span><strong>${rich(fields.internalNote)}</strong></div>` : ''}</div></article>`;
}

export function renderIntakeSummaryHtml(snapshot = {}) {
  const data = object(snapshot.data);
  const refs = requiredReferences(data);
  const entries = intakeEntries(object(data.intake));
  const body = `<section class="section"><div class="sectionTitle"><h2>Must-Acknowledge Home References</h2><span class="pill orange">${refs.filter(item=>item.acknowledged).length}/${refs.length} acknowledged</span></div><p class="lede">Orange reference fields must be acknowledged before homeowner delivery. “Not applicable” is a valid acknowledgement.</p><div class="grid">${refs.map(item=>`<div class="field required ${item.acknowledged?'':'missing'}"><span>${esc(item.label)}</span><strong>${rich(item.value,item.state || 'Not acknowledged')}</strong></div>`).join('')}</div></section><section class="section"><h2>Recorded Intake & Home Reference Context</h2><div class="grid">${entries.map(item=>`<div class="field"><span>${esc(item.label)}</span><strong>${rich(item.value)}</strong></div>`).join('') || '<p class="empty">No Intake details were recorded.</p>'}</div></section>`;
  return shell(snapshot,'01 - Intake Summary',body);
}
export function renderHtcWorkingRecordHtml(snapshot = {}) {
  const data = object(snapshot.data);
  const findings = list(data.htc?.findings);
  const rooms = findings.reduce((groups,item)=>{const key=text(item.context?.roomName || item.roomId,'General');groups[key]=[...(groups[key]||[]),item];return groups;},{});
  const body = `<section class="section"><h2>HTC Working Summary</h2><div class="stats"><div class="stat"><strong>${findings.length}</strong><span>Recorded observations</span></div><div class="stat"><strong>${list(data.reporting?.pmr?.findingIds).length}</strong><span>Included in client PMR</span></div><div class="stat"><strong>${list(data.reporting?.pmr?.reviewFindingIds).length}</strong><span>Need PMR decision</span></div><div class="stat"><strong>${list(data.media?.assets).length}</strong><span>Connected photos</span></div></div><p class="lede">Untouched catalog prompts are intentionally excluded so meaningful field information is not buried.</p></section>${Object.entries(rooms).map(([room,items])=>`<section class="section"><div class="sectionTitle"><h2>${esc(room)}</h2><span class="pill gray">${items.length} item${items.length===1?'':'s'}</span></div>${items.map(findingCard).join('')}</section>`).join('') || '<section class="section"><p class="empty">No HTC findings or meaningful observations were recorded.</p></section>'}`;
  return shell(snapshot,'02 - HTC Working Record',body);
}
export function renderOfficeActionPlanHtml(snapshot = {}) {
  const data = object(snapshot.data);
  const actions = list(data.workflow?.actions);
  const findings = list(data.htc?.findings).filter(item=>item.reporting?.pmrDecision==='included');
  const care = list(data.continuedCare?.items);
  const actionRows = actions.map(action=>{const source=object(action.source);const linked=source.entityType==='finding'?findings.find(item=>item.findingId===source.entityId):care.find(item=>item.careItemId===source.entityId);const label=linked?.context?.item || linked?.fields?.careItem || source.entityId;return `<tr><td>${esc(label)}</td><td>${esc(action.actionType || 'Unknown')}</td><td>${esc(action.followUpStatus || 'Not Scheduled')}</td><td>${rich(action.internalNote,'')}</td></tr>`;}).join('');
  const reminders = care.filter(item=>{const fields=object(item.fields);return fields.reminderSet || fields.reminderDate || fields.deferredReminderDate || ['Planned','Scheduled','Deferred'].includes(fields.followUpStatus) || item.reporting?.pmcpDecision==='declined';}).length;
  const activePlanning = care.filter(item=>{const fields=object(item.fields);return fields.thaActionItem || fields.workOrderNow || (fields.thaActionType && fields.thaActionType!=='Unknown');}).length;
  const body = `<section class="section"><h2>THA Office Dashboard</h2><div class="stats"><div class="stat"><strong>${findings.length}</strong><span>Client PMR findings</span></div><div class="stat"><strong>${actions.filter(item=>item.selected).length}</strong><span>Selected THA actions</span></div><div class="stat"><strong>${care.filter(item=>item.reporting?.pmcpDecision==='selected').length}</strong><span>Selected PMCP items</span></div><div class="stat"><strong>${reminders}</strong><span>Future reminders</span></div><div class="stat"><strong>${activePlanning}</strong><span>Active planning</span></div></div></section><section class="section"><h2>THA Action Queue</h2><div class="tableWrap"><table><thead><tr><th>Source item</th><th>Action type</th><th>Status</th><th>Internal note</th></tr></thead><tbody>${actionRows || '<tr><td colspan="4">No THA actions selected.</td></tr>'}</tbody></table></div></section><section class="section"><h2>PMR Findings Requiring Coordination</h2>${findings.map(findingCard).join('') || '<p class="empty">No client PMR findings.</p>'}</section><section class="section"><h2>PMCP Care, Reminders & Active Planning</h2><p class="lede">Green identifies preventive care and future reminders. Purple is reserved for agreed research, pricing, scope, trade consultation, or scheduling actions.</p>${care.map(careCard).join('') || '<p class="empty">No continued-care records.</p>'}</section>`;
  return shell(snapshot,'03 - THA Office Action Plan',body);
}
export function renderProjectQueueHtml(snapshot = {}) {
  const data = object(snapshot.data);
  const findings = list(data.htc?.findings).filter(item=>item.reporting?.pmrDecision==='included');
  const rows = findings.map(item=>{const fields=object(item.fields);const context=object(item.context);return `<tr><td>${esc(context.roomName || item.roomId)}</td><td>${esc(context.item)}</td><td><span class="pill ${tone(fields.status)}">${esc(fields.status)}</span></td><td>${esc(trade(fields.trade || context.tradeDefault))}</td><td>${esc(fields.effort || context.effortDefault || '')}</td><td>${esc(fields.thaActionType || '')}</td></tr>`;}).join('');
  return shell(snapshot,'04 - Project Queue',`<section class="section"><h2>Project / Trade Queue</h2><p class="lede">This queue contains actual PMR findings only. It is intended for scoping, trade coordination, estimating, and scheduling.</p><div class="tableWrap"><table><thead><tr><th>Room</th><th>Item</th><th>Status</th><th>Resource</th><th>Time</th><th>THA action</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No PMR findings are currently queued.</td></tr>'}</tbody></table></div></section>`);
}
export function renderPhotoIndexHtml(snapshot = {}) {
  const data = object(snapshot.data);
  const assets = list(data.media?.assets);
  const body = `<section class="section"><h2>Connected Photo Index</h2><div class="stats"><div class="stat"><strong>${assets.length}</strong><span>Total connected photos</span></div><div class="stat"><strong>${assets.filter(item=>item.scope==='room-overview').length}</strong><span>Room overviews</span></div><div class="stat"><strong>${assets.filter(item=>item.scope==='finding-evidence').length}</strong><span>Finding evidence</span></div><div class="stat"><strong>${assets.filter(item=>item.clientVisible!==false).length}</strong><span>Client-visible</span></div></div></section><section class="section"><div class="photoGrid">${assets.map(asset=>{const fields=object(asset.fields);const source=fields.thumbnailDataUrl || fields.dataUrl;const visual=source?`<img src="${esc(source)}" alt="${esc(fields.label || 'Photo')}"/>`:'<div class="photoPlaceholder">Photo reference</div>';const link=fields.driveViewLink || fields.webViewLink;return `<figure class="photo">${visual}<figcaption><strong>${esc(fields.label || asset.scope || 'Photo')}</strong><span>${esc(asset.roomId || asset.ownerId || '')}</span><span>${esc(fields.driveFileName || fields.name || asset.mediaId)}</span>${link?`<a href="${esc(link)}" target="_blank" rel="noopener">Open Drive photo</a>`:''}</figcaption></figure>`;}).join('') || '<p class="empty">No photos are connected to this Snapshot.</p>'}</div></section>`;
  return shell(snapshot,'05 - Photo Index',body);
}
export function renderPackageManifestHtml(snapshot = {}, filing = {}) {
  const data = object(snapshot.data);
  const body = `<section class="section"><h2>Package Identity & Filing</h2><div class="grid"><div class="field"><span>Client</span><strong>${rich(data.client?.name)}</strong></div><div class="field"><span>Project address</span><strong>${rich(data.client?.address || data.property?.address)}</strong></div><div class="field"><span>Walkthrough date / visit</span><strong>${rich(data.client?.date)}</strong></div><div class="field"><span>Working-session type</span><strong>${rich(data.walkthroughName)}</strong></div><div class="field"><span>Client folder</span><strong>${rich(filing.clientFolderName)}</strong></div><div class="field"><span>Address folder</span><strong>${rich(filing.addressFolderName)}</strong></div><div class="field wide"><span>Timeline entry</span><strong>${rich(filing.timelineName)}</strong></div></div></section><section class="section"><h2>Connected Record Counts</h2><div class="stats"><div class="stat"><strong>${list(data.htc?.findings).length}</strong><span>Snapshot findings</span></div><div class="stat"><strong>${list(data.reporting?.pmr?.findingIds).length}</strong><span>Client PMR findings</span></div><div class="stat"><strong>${list(data.reporting?.pmcp?.selectedCareItemIds).length}</strong><span>PMCP selected</span></div><div class="stat"><strong>${list(data.reporting?.pmcp?.candidateCareItemIds).length}</strong><span>PMCP pending</span></div><div class="stat"><strong>${list(data.workflow?.actions).length}</strong><span>Workflow actions</span></div><div class="stat"><strong>${list(data.media?.assets).length}</strong><span>Photos</span></div></div></section><section class="section"><h2>Expected Package Documents</h2><div class="grid">${['01 - Client PMR — Interactive Report.html','02 - Client PMR — Printable Binder Copy.pdf','01 - Intake Summary.html / .pdf','02 - HTC Working Record.html / .pdf','03 - THA Office Action Plan.html / .pdf','04 - Project Queue.html / .pdf','05 - Photo Index.html / .pdf','Restore This THA Snapshot.json'].map(name=>`<div class="field"><strong>${esc(name)}</strong></div>`).join('')}</div></section>`;
  return shell(snapshot,'00 - Package Manifest',body);
}

export function internalReportForName(snapshot, name = '') {
  if (/intake summary/i.test(name)) return { base:'01 - Intake Summary', html:renderIntakeSummaryHtml(snapshot) };
  if (/htc checklist|htc working/i.test(name)) return { base:'02 - HTC Working Record', html:renderHtcWorkingRecordHtml(snapshot) };
  if (/tha office|internal action/i.test(name)) return { base:'03 - THA Office Action Plan', html:renderOfficeActionPlanHtml(snapshot) };
  if (/airtable|project queue/i.test(name)) return { base:'04 - Project Queue', html:renderProjectQueueHtml(snapshot) };
  if (/photo index/i.test(name)) return { base:'05 - Photo Index', html:renderPhotoIndexHtml(snapshot) };
  return null;
}
