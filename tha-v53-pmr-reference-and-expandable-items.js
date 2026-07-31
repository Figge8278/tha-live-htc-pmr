(() => {
  const SCRIPT_ID = 'tha-v53-pmr-reference-and-expandable-items';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

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

  function normalizeKey(value = '') {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.53: PMR key home reference drawer + expandable room/trade line items. */
      main.pmr:not(.passWorkspace) .tha-v53-need-to-know{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:18px!important;
        background:#fbfdfe!important;
        margin:14px 0 18px!important;
        overflow:hidden!important;
        box-shadow:0 6px 16px rgba(13,44,73,.045)!important;
      }
      .tha-v53-need-to-know summary{
        cursor:pointer!important;
        list-style:none!important;
        padding:12px 14px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
      }
      .tha-v53-need-to-know summary::-webkit-details-marker{display:none!important}
      .tha-v53-need-title strong{display:block!important;color:#0b3658!important;font-size:16px!important;line-height:1.25!important}
      .tha-v53-need-title small{display:block!important;color:#60717c!important;font-size:12px!important;line-height:1.35!important;margin-top:2px!important}
      .tha-v53-need-chips{display:flex!important;flex-wrap:wrap!important;gap:6px!important;justify-content:flex-end!important;align-items:center!important}
      .tha-v53-need-chip{display:inline-flex!important;align-items:center!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#40505f!important;border-radius:999px!important;padding:4px 8px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-v53-need-chip.recorded{border-color:#b9dfb4!important;background:#f6fcf4!important;color:#285c30!important}
      .tha-v53-need-body{border-top:1px solid #e2e8ed!important;background:#fff!important;padding:12px 14px!important}
      .tha-v53-reference-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important;gap:8px!important}
      .tha-v53-reference-field{border:1px solid #e2e8ed!important;border-radius:13px!important;background:#fbfdfe!important;padding:9px 10px!important}
      .tha-v53-reference-field span{display:block!important;color:#60717c!important;font-size:10px!important;text-transform:uppercase!important;letter-spacing:.06em!important;font-weight:950!important;margin-bottom:2px!important}
      .tha-v53-reference-field strong{display:block!important;color:#203040!important;font-size:13px!important;line-height:1.35!important;font-weight:750!important}
      .tha-v53-reference-field.empty strong{color:#8a6b2b!important;font-style:italic!important}

      main.pmr:not(.passWorkspace) .tha-v53-action-expandable{
        display:block!important;
        border:1px solid #d8e4ea!important;
        border-radius:16px!important;
        background:#fff!important;
        margin:9px 0!important;
        overflow:hidden!important;
        box-shadow:0 4px 12px rgba(13,44,73,.045)!important;
      }
      .tha-v53-action-expandable summary{cursor:pointer!important;list-style:none!important;padding:0!important;background:#fff!important}
      .tha-v53-action-expandable summary::-webkit-details-marker{display:none!important}
      .tha-v53-action-expandable .packetActionRow{margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#fff!important}
      .tha-v53-action-expandable .packetActionRow::after{content:'Open detail';display:inline-flex!important;border:1px solid #d8e4ea!important;border-radius:999px!important;background:#fff!important;color:#60717c!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;align-self:center!important;margin-left:auto!important}
      .tha-v53-action-expandable[open] .packetActionRow::after{content:'Close detail'}
      .tha-v53-action-body{border-top:1px solid #e2e8ed!important;padding:12px 14px!important;background:#fbfdfe!important}
      .tha-v53-detail-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;gap:8px!important}
      .tha-v53-detail-field{border:1px solid #e2e8ed!important;border-radius:13px!important;background:#fff!important;padding:9px 10px!important}
      .tha-v53-detail-field span{display:block!important;color:#60717c!important;font-size:10px!important;text-transform:uppercase!important;letter-spacing:.06em!important;font-weight:950!important;margin-bottom:2px!important}
      .tha-v53-detail-field strong{display:block!important;color:#203040!important;font-size:13px!important;line-height:1.35!important;font-weight:750!important}
      .tha-v53-source-note{margin:9px 0 0!important;color:#60717c!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important}
      @media(max-width:760px){.tha-v53-need-to-know summary{align-items:flex-start!important;flex-direction:column!important}.tha-v53-need-chips{justify-content:flex-start!important}.tha-v53-reference-grid,.tha-v53-detail-grid{grid-template-columns:1fr!important}}
      @media print{.tha-v53-action-expandable .tha-v53-action-body{display:block!important}.tha-v53-action-expandable .packetActionRow::after{display:none!important}}
    `;
    document.head.append(style);
  }

  function currentSessionData() {
    const sessions = safeJson('tha-walkthrough-sessions', {});
    const currentId = localStorage.getItem('tha-current-walkthrough-id') || '';
    if (currentId && sessions?.[currentId]?.data) return sessions[currentId].data;
    const sorted = Object.values(sessions || {}).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    return sorted[0]?.data || {};
  }

  function meaningful(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      return Object.values(value).map(meaningful).filter(Boolean).join(' · ');
    }
    return String(value || '').trim();
  }

  function referenceItems() {
    const data = currentSessionData();
    const intake = data?.intake || safeJson('tha-intake', {}) || {};
    const irrigation = /irrigation|sprinkler|controller|shutoff|blowout/i.test(meaningful(intake.sewerIrrigation)) ? meaningful(intake.sewerIrrigation) : '';
    return [
      { label: 'Breaker panel / fuse box', value: meaningful(intake.electricalPanel) },
      { label: 'Main water shutoff', value: meaningful(intake.waterShutoff) },
      { label: 'Gas shutoff', value: meaningful(intake.gasShutoff || intake.gasValve || intake.gasMeter || intake.gas) },
      { label: 'Furnace filter location / size', value: meaningful(intake.hvacFilter) },
      { label: 'Fire extinguishers', value: meaningful(intake.fireExtinguishers) },
      { label: 'Smoke / CO detector notes', value: meaningful(intake.smokeCO) },
      { label: 'Irrigation shutoff / controller', value: irrigation }
    ];
  }

  function fieldHtml(item) {
    const value = item.value || 'Not recorded yet';
    return `<div class="tha-v53-reference-field ${item.value ? 'recorded' : 'empty'}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function ensureNeedToKnowDrawer() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const plain = Array.from(pmr.children || []).find(section => /plain[- ]english summary/i.test(textOf(section.querySelector?.('h2,h3,summary') || section)));
    if (!plain?.parentNode) return;
    const items = referenceItems();
    const recordedCount = items.filter(item => item.value).length;
    const panelValue = items[0]?.value || 'Not recorded';
    const waterValue = items[1]?.value || 'Not recorded';
    let drawer = pmr.querySelector('.tha-v53-need-to-know');
    const wasOpen = Boolean(drawer?.open);
    if (!drawer) drawer = document.createElement('details');
    drawer.className = 'pmrBlock tha-v53-need-to-know';
    drawer.open = wasOpen;
    drawer.innerHTML = `
      <summary>
        <div class="tha-v53-need-title"><strong>Important Need-to-Know Home References</strong><small>Quick homeowner reference items before the room-by-room findings.</small></div>
        <div class="tha-v53-need-chips"><span class="tha-v53-need-chip ${items[0]?.value ? 'recorded' : ''}">Fuse box: ${escapeHtml(panelValue)}</span><span class="tha-v53-need-chip ${items[1]?.value ? 'recorded' : ''}">Water shutoff: ${escapeHtml(waterValue)}</span><span class="tha-v53-need-chip ${recordedCount ? 'recorded' : ''}">${recordedCount}/${items.length} recorded</span></div>
      </summary>
      <div class="tha-v53-need-body"><div class="tha-v53-reference-grid">${items.map(fieldHtml).join('')}</div></div>
    `;
    if (plain.nextElementSibling !== drawer) plain.after(drawer);
  }

  function parseFieldParagraph(node) {
    const labelNode = node.querySelector?.('strong,b,span.field-label') || null;
    const label = textOf(labelNode).replace(/:$/, '') || 'Detail';
    let value = textOf(node);
    if (label) value = value.replace(new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:?\\s*`, 'i'), '').trim();
    return { label, value: value || 'Not recorded' };
  }

  function appendixDetails(pmr) {
    const details = new Map();
    const fallback = new Map();
    const cards = Array.from(pmr.querySelectorAll('.detailAppendix .appendixFinding'));
    cards.forEach(card => {
      const heading = textOf(card.querySelector('.findTop h3,h3'));
      const match = heading.match(/^(.+?)\s+[—-]\s+(.+)$/);
      const room = match ? match[1].trim() : '';
      const title = match ? match[2].trim() : heading;
      const fields = Array.from(card.querySelectorAll('.findGrid p,.findGrid .detail,.findGrid .pmrField')).map(parseFieldParagraph).filter(field => field.value);
      const item = { room, title, fields };
      if (title) fallback.set(normalizeKey(title), item);
      if (room && title) details.set(`${normalizeKey(room)}|${normalizeKey(title)}`, item);
    });
    return { details, fallback };
  }

  function groupRoom(row) {
    const chip = row.querySelector('.chip.roomChip');
    if (chip) return textOf(chip);
    const groupHeading = row.closest('.packetActionGroup')?.querySelector('h3');
    const clone = groupHeading?.cloneNode(true);
    clone?.querySelectorAll('span').forEach(node => node.remove());
    return textOf(clone || groupHeading);
  }

  function detailFieldsHtml(detail, row) {
    const fields = detail?.fields?.length ? detail.fields : [
      { label: 'Summary line', value: textOf(row.querySelector('.packetActionNext')) || 'Open the Detail Appendix for more context.' }
    ];
    return `<div class="tha-v53-detail-grid">${fields.map(field => `<div class="tha-v53-detail-field"><span>${escapeHtml(field.label)}</span><strong>${escapeHtml(field.value)}</strong></div>`).join('')}</div><p class="tha-v53-source-note">Source detail: pulled from the Detail Appendix for this same PMR finding.</p>`;
  }

  function makeRowsExpandable() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const { details, fallback } = appendixDetails(pmr);
    const sections = Array.from(pmr.querySelectorAll('.compactFindings')).filter(section => /room|trade/i.test(textOf(section.querySelector('h2,h3,summary') || section)));
    sections.forEach(section => {
      Array.from(section.querySelectorAll('.packetActionRow')).forEach(row => {
        if (row.closest('.tha-v53-action-expandable')) return;
        const title = textOf(row.querySelector('h4'));
        const room = groupRoom(row);
        const detail = details.get(`${normalizeKey(room)}|${normalizeKey(title)}`) || fallback.get(normalizeKey(title));
        const wrapper = document.createElement('details');
        wrapper.className = 'tha-v53-action-expandable';
        const summary = document.createElement('summary');
        const body = document.createElement('div');
        body.className = 'tha-v53-action-body';
        body.innerHTML = detailFieldsHtml(detail, row);
        row.parentNode.insertBefore(wrapper, row);
        summary.append(row);
        wrapper.append(summary, body);
      });
    });
  }

  function sync() {
    installStyles();
    ensureNeedToKnowDrawer();
    makeRowsExpandable();
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

  window.addEventListener('load', sync);
  document.addEventListener('DOMContentLoaded', sync);
  document.addEventListener('click', () => setTimeout(sync, 80), true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded', 'open'] });
  sync();
})();