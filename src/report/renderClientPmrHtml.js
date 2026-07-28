import { CLIENT_PMR_STYLES } from './clientPmrStyles.js';
function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function richText(value = '', fallback = 'Not recorded') {
  const text = String(value ?? '').trim();
  return escapeHtml(text || fallback).replace(/\n/g, '<br/>');
}
function photoHtml(photo = {}, index = 0) {
  const visual = photo.source ? `<img src="${escapeHtml(photo.source)}" alt="${escapeHtml(photo.label)} photo ${index + 1}"/>` : '<div class="photoPlaceholder">Photo reference</div>';
  const reference = photo.link ? `<a href="${escapeHtml(photo.link)}" target="_blank" rel="noopener">Open Drive photo</a>` : `<span>${escapeHtml(photo.name || 'Photo')}</span>`;
  return `<figure class="photoCard">${visual}<figcaption><strong>${escapeHtml(photo.label)}</strong>${reference}</figcaption></figure>`;
}
function findingBody(finding = {}) {
  const photos = finding.photos?.length ? `<section class="photoEvidence"><h4>Photos / Evidence</h4><div class="photoGrid">${finding.photos.map(photoHtml).join('')}</div></section>` : '<section class="photoEvidence"><h4>Photos / Evidence</h4><p class="muted">No client-visible finding photos are attached.</p></section>';
  return `<div class="detailGrid"><div><span>What we saw</span><strong>${richText(finding.notes)}</strong></div><div><span>Why it matters</span><strong>${richText(finding.why)}</strong></div><div><span>Recommended next step</span><strong>${richText(finding.recommendedAction)}</strong></div><div><span>Timing</span><strong>${richText(finding.timing)}</strong></div><div><span>Resource</span><strong>${richText(finding.trade)}</strong></div><div><span>Action certainty</span><strong>${richText(finding.certainty?.label)} — ${richText(finding.certainty?.explanation)}</strong></div></div>${photos}`;
}
function findingHeader(finding = {}, context = '') {
  const priorityClass = finding.priority?.key || 'reference';
  return `<div class="findingHead"><div><p>${escapeHtml(context || finding.room)} · ${escapeHtml(finding.trade)}</p><h3>${escapeHtml(finding.item)}</h3></div><span class="priority ${priorityClass}">${escapeHtml(finding.priority?.label || finding.status)}</span></div><div class="chipLine"><span class="dot ${priorityClass}"></span><span>${escapeHtml(finding.status)}</span><span>${escapeHtml(finding.effort)}</span><span>${escapeHtml(finding.certainty?.label || 'Likely Path')}</span>${finding.photos?.length ? `<span>${finding.photos.length} photo${finding.photos.length === 1 ? '' : 's'}</span>` : ''}</div>`;
}
function roomSection(room, findings = []) {
  return `<section class="reportSection roomSection"><h2>${escapeHtml(room)}</h2>${findings.map(finding => `<article class="findingCard expanded">${findingHeader(finding, room)}${findingBody(finding)}</article>`).join('')}</section>`;
}
function tradeSection(trade, findings = []) {
  return `<details class="reportSection tradeSection"><summary><h2>${escapeHtml(trade)}</h2><span>${findings.length} item${findings.length === 1 ? '' : 's'}</span></summary>${findings.map(finding => `<details class="findingCard tradeFinding"><summary>${findingHeader(finding, trade)}</summary><div class="tradeDetail">${findingBody(finding)}</div></details>`).join('')}</details>`;
}
function referencesHtml(references = []) {
  const recorded = references.filter(item => item.value).length;
  return `<details class="referenceBox" open><summary><strong>Important Need-to-Know Home References</strong><span>${recorded}/${references.length} recorded</span></summary><div class="referenceGrid">${references.map(item => `<div><span>${escapeHtml(item.label)}</span><strong>${richText(item.value, 'Not recorded yet')}</strong></div>`).join('')}</div></details>`;
}
function careItemHtml(item = {}) {
  return `<article class="careItem"><div class="careHead"><div><p>${escapeHtml(item.sourceLabel)}</p><h3>${escapeHtml(item.careItem)}</h3></div><span>${escapeHtml(item.followUpStatus)}</span></div><div class="detailGrid"><div><span>Recommended cadence</span><strong>${richText(item.cadence)}</strong></div><div><span>Last completed</span><strong>${richText(item.lastCompleted)}</strong></div><div><span>Next suggested window</span><strong>${richText(item.targetWindow)}</strong></div><div><span>Resource</span><strong>${richText(item.resource)}</strong></div><div class="wide"><span>Why this is included</span><strong>${richText(item.reason)}</strong></div></div></article>`;
}
export function renderClientPmrHtml(model = {}) {
  const client = model.client || {};
  const roomSections = Object.entries(model.roomGroups || {}).map(([room, findings]) => roomSection(room, findings)).join('') || '<p class="muted">No room-by-room PMR findings recorded.</p>';
  const tradeSections = Object.entries(model.tradeGroups || {}).map(([trade, findings]) => tradeSection(trade, findings)).join('') || '<p class="muted">No trade-by-trade PMR findings recorded.</p>';
  const careItems = model.pmcp?.selected?.length ? model.pmcp.selected.map(careItemHtml).join('') : '<p class="muted">No continued-care items have been selected for the PMCP yet.</p>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Client PMR Report</title><style>${CLIENT_PMR_STYLES}</style></head><body><main><header><p class="eyebrow">The Homeowner Advocate · Preventive Maintenance Report</p><h1>${escapeHtml(client.address || model.property?.address || 'Client PMR')}</h1><p class="lede">${escapeHtml(client.name || 'Client')} · ${escapeHtml(client.date || 'Walkthrough date')}</p><p>${escapeHtml(model.summary || '')}</p></header><section class="snapshot"><div class="stat"><strong>${model.counts?.immediate || 0}</strong><span>Immediate</span></div><div class="stat"><strong>${model.counts?.nearTerm || 0}</strong><span>Near-Term</span></div><div class="stat"><strong>${model.counts?.monitor || 0}</strong><span>Monitor</span></div><div class="stat"><strong>${model.counts?.findings || 0}</strong><span>PMR Findings</span></div><div class="stat"><strong>${model.counts?.pmcp || 0}</strong><span>PMCP Items</span></div><div class="stat"><strong>${model.counts?.photos || 0}</strong><span>Finding Photos</span></div></section>${referencesHtml(model.references || [])}<section class="reportSection"><h2>Room-by-Room Action List</h2><p class="lede">Expanded for homeowner review, printing, and binder use. These are the primary finding details.</p>${roomSections}</section><section class="reportSection"><h2>Trade-by-Trade Action List</h2><p class="lede">Collapsed by default. This is a second view of the same findings, grouped by likely resource.</p>${tradeSections}</section><section class="pmcpSection"><h2>Preventive Maintenance Care Plan</h2><p class="pmcpNote">${escapeHtml(model.pmcp?.note || 'PMCP continued care is separate from PMR defect counts.')}</p>${careItems}</section><p class="sourceNote">Generated from THA Snapshot ${escapeHtml(model.source?.snapshotId || '')} · Schema ${escapeHtml(model.source?.schemaVersion || '')} · Updated ${escapeHtml(model.source?.updatedAt || '')}</p><p class="footer">You don’t hire trades — you hire The Homeowner Advocate. One point of contact. Every step. Every task.</p></main></body></html>`;
}
