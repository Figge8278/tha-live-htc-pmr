(() => {
  const SCRIPT_ID = 'tha-v52-pmcp-consolidation';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.52: PMR reports one consolidated PMCP section. Calendar/supporting reference views are hidden from the main report flow. */
      main.pmr:not(.passWorkspace) .passCalendar,
      main.pmr:not(.passWorkspace) .passOutlook,
      main.pmr:not(.passWorkspace) .passPlanSummary,
      main.pmr:not(.passWorkspace) .tha-pmcp-timing-panel,
      main.pmr:not(.passWorkspace) .baselineCare,
      main.pmr:not(.passWorkspace) .tha-pmr-supporting-output,
      main.pmr:not(.passWorkspace) .tha-supporting-builder,
      main.pmr:not(.passWorkspace) [data-tha-v52-original-pmcp="true"],
      main.pmr:not(.passWorkspace) [data-tha-v52-original-reference="true"]{
        display:none!important;
        visibility:hidden!important;
      }

      main.pmr:not(.passWorkspace) .tha-v52-pmcp-consolidated{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:22px!important;
        background:#fff!important;
        padding:18px!important;
        margin:18px 0!important;
        box-shadow:inset -7px 0 0 #52aa4b,0 8px 22px rgba(13,44,73,.07)!important;
      }
      .tha-v52-pmcp-consolidated h2{margin:0 0 6px!important;color:#0b3658!important;font-size:22px!important;line-height:1.2!important}
      .tha-v52-pmcp-consolidated .lede{margin:0 0 14px!important;color:#40505f!important;line-height:1.45!important}
      .tha-v52-pmcp-count{display:inline-flex!important;border:1px solid #b9dfb4!important;background:#f6fcf4!important;color:#285c30!important;border-radius:999px!important;padding:5px 9px!important;font-size:12px!important;font-weight:950!important;margin:0 0 12px!important}
      .tha-v52-pmcp-list{display:grid!important;gap:10px!important}
      .tha-v52-pmcp-item{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:17px!important;
        background:#fbfdfe!important;
        overflow:hidden!important;
        box-shadow:inset -5px 0 0 #52aa4b!important;
      }
      .tha-v52-pmcp-item.needs-info{
        background:#fcf9ff!important;
        box-shadow:inset -6px 0 0 #7e4c9a!important;
        border-color:#dfccef!important;
      }
      .tha-v52-pmcp-item summary{
        cursor:pointer!important;
        list-style:none!important;
        padding:13px 15px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
      }
      .tha-v52-pmcp-item summary::-webkit-details-marker{display:none!important}
      .tha-v52-pmcp-item summary strong{display:block!important;color:#0b3658!important;font-size:16px!important;line-height:1.25!important}
      .tha-v52-pmcp-item summary small{display:block!important;color:#60717c!important;font-size:12px!important;line-height:1.3!important;margin-top:2px!important}
      .tha-v52-pmcp-chips{display:flex!important;flex-wrap:wrap!important;gap:6px!important;justify-content:flex-end!important;align-items:center!important;min-width:130px!important}
      .tha-v52-chip{display:inline-flex!important;align-items:center!important;gap:4px!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#40505f!important;border-radius:999px!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important;letter-spacing:.01em!important}
      .tha-v52-chip.pmcp{border-color:#b9dfb4!important;color:#285c30!important;background:#f6fcf4!important}
      .tha-v52-chip.need{border-color:#dfccef!important;color:#5b327e!important;background:#fbf7ff!important}
      .tha-v52-pmcp-body{border-top:1px solid #e2e8ed!important;padding:13px 15px 15px!important;background:#fff!important;display:grid!important;gap:9px!important}
      .tha-v52-field{border:1px solid #e2e8ed!important;border-radius:13px!important;background:#fbfdfe!important;padding:9px 10px!important}
      .tha-v52-field span{display:block!important;color:#60717c!important;font-size:10px!important;text-transform:uppercase!important;letter-spacing:.06em!important;font-weight:950!important;margin-bottom:2px!important}
      .tha-v52-field strong{display:block!important;color:#203040!important;font-size:13px!important;line-height:1.35!important;font-weight:750!important}
      .tha-v52-field-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;gap:8px!important}
      .tha-v52-needed-note{border:1px solid #dfccef!important;border-right:6px solid #7e4c9a!important;border-radius:14px!important;background:#fbf7ff!important;color:#4e3470!important;padding:10px 12px!important;font-size:12px!important;font-weight:850!important;line-height:1.4!important}
      .tha-v52-empty{border:1px dashed #d8e4ea!important;border-radius:16px!important;background:#fbfdfe!important;padding:14px!important;color:#60717c!important;font-weight:800!important}

      main.pmr:not(.passWorkspace) .tha-v52-support-reference{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:18px!important;
        background:#fbfdfe!important;
        margin:18px 0!important;
        box-shadow:none!important;
        overflow:hidden!important;
      }
      .tha-v52-support-reference summary{cursor:pointer!important;list-style:none!important;padding:12px 14px!important;display:flex!important;justify-content:space-between!important;gap:10px!important;align-items:center!important}
      .tha-v52-support-reference summary::-webkit-details-marker{display:none!important}
      .tha-v52-support-reference summary strong{color:#0b3658!important;font-size:15px!important}
      .tha-v52-support-reference summary small{display:block!important;color:#60717c!important;font-size:12px!important;margin-top:2px!important}
      .tha-v52-support-reference summary::after{content:'Reference only';display:inline-flex!important;border:1px solid #d8e4ea!important;border-radius:999px!important;background:#fff!important;color:#60717c!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-v52-support-reference .tha-v52-reference-body{border-top:1px solid #e2e8ed!important;padding:12px 14px!important;color:#40505f!important;font-size:13px!important;line-height:1.45!important;background:#fff!important}
      @media(max-width:760px){.tha-v52-pmcp-item summary{align-items:flex-start!important;flex-direction:column!important}.tha-v52-pmcp-chips{justify-content:flex-start!important}.tha-v52-field-grid{grid-template-columns:1fr!important}}
      @media print{.tha-v52-support-reference{display:none!important}.tha-v52-pmcp-item{break-inside:avoid!important}.tha-v52-pmcp-item:not([open]) .tha-v52-pmcp-body{display:block!important}}
    `;
    document.head.append(style);
  }

  function sectionHeading(section) {
    return textOf(section?.querySelector?.('h1,h2,h3,summary') || section);
  }

  function directSections(pmr) {
    return Array.from(pmr?.children || []).filter(node => node?.nodeType === 1);
  }

  function findDirect(pmr, patterns, selector = '') {
    return directSections(pmr).find(section => (selector && section.matches?.(selector)) || patterns.some(pattern => pattern.test(sectionHeading(section)))) || null;
  }

  function findAll(pmr, patterns, selector = '') {
    return directSections(pmr).filter(section => (selector && section.matches?.(selector)) || patterns.some(pattern => pattern.test(sectionHeading(section))));
  }

  function parseFieldBlock(block) {
    const label = textOf(block.querySelector('strong,span,b'))
      .replace(/:$/, '')
      .trim();
    const value = textOf(block).replace(new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:?\\s*`, 'i'), '').trim();
    return { label: label || 'Detail', value: value || 'Not recorded' };
  }

  function extractOutlookItems(pmr) {
    const outlook = pmr.querySelector('.passOutlook');
    const cards = Array.from(outlook?.querySelectorAll?.('.passOutlookCard') || []);
    return cards.map((card, index) => {
      const title = textOf(card.querySelector('.findTop h3,h3')) || `PMCP item ${index + 1}`;
      const subline = textOf(card.querySelector('.findTop p'));
      const fields = Array.from(card.querySelectorAll('.findGrid p,.findGrid .pmrField')).map(parseFieldBlock).filter(field => field.value);
      const joined = [title, subline, ...fields.map(field => `${field.label} ${field.value}`)].join(' ');
      const cadence = fields.find(field => /cadence/i.test(field.label))?.value || '';
      const windowText = fields.find(field => /target|window|season|timing|suggested/i.test(field.label))?.value || '';
      const resource = fields.find(field => /resource|trade|responsible/i.test(field.label))?.value || (subline.split('·')[0] || '').trim();
      const reason = fields.find(field => /reason|why|homeowner/i.test(field.label))?.value || '';
      return { title, subline, fields, cadence, windowText, resource, reason, joined, source: 'PASS / PMCP selection' };
    }).filter(item => item.title);
  }

  function extractCalendarItems(pmr) {
    const calendar = pmr.querySelector('.passCalendar');
    const rows = Array.from(calendar?.querySelectorAll?.('.passCalendarRow') || []);
    return rows.map((row, index) => {
      const title = textOf(row.querySelector('strong,h4,h3')) || textOf(row).split('·')[0] || `PMCP item ${index + 1}`;
      const fields = Array.from(row.querySelectorAll('span,em,small,p')).slice(0, 8).map((node, i) => ({ label: i === 0 ? 'Calendar detail' : `Detail ${i + 1}`, value: textOf(node) })).filter(field => field.value && field.value !== title);
      const joined = [title, ...fields.map(field => field.value)].join(' ');
      return { title, subline: 'Calendar / baseline view', fields, cadence: '', windowText: '', resource: '', reason: '', joined, source: 'Calendar baseline' };
    }).filter(item => item.title);
  }

  function needsInfo(item) {
    const text = String(item?.joined || '').toLowerCase();
    return /\b(unknown|verify|establish baseline|not scheduled|needs?|needed|confirm|tbd|to be determined|not recorded|ask|follow[- ]?up|consult|estimate)\b/.test(text);
  }

  function fieldHtml(label, value) {
    return `<div class="tha-v52-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Not recorded')}</strong></div>`;
  }

  function pmcpItemHtml(item, index) {
    const infoNeeded = needsInfo(item);
    const meta = [item.cadence, item.windowText, item.resource].filter(Boolean).slice(0, 3).join(' · ') || item.subline || 'Open for planning detail';
    const displayFields = item.fields.length ? item.fields : [
      { label: 'Source', value: item.source || 'PASS / PMCP' },
      { label: 'Planning detail', value: item.subline || 'No additional detail recorded yet.' }
    ];
    const neededNote = infoNeeded
      ? '<div class="tha-v52-needed-note">🟣 More information is needed before this PMCP line is fully satisfied. Confirm the missing date, trade input, scheduled service, estimate, or completion status during THA follow-up.</div>'
      : '';
    return `<details class="tha-v52-pmcp-item ${infoNeeded ? 'needs-info' : ''}" ${index === 0 ? 'open' : ''}>
      <summary>
        <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(meta)}</small></div>
        <div class="tha-v52-pmcp-chips"><span class="tha-v52-chip pmcp">PMCP</span>${infoNeeded ? '<span class="tha-v52-chip need">🟣 Info needed</span>' : ''}<span class="tha-v52-chip">Open</span></div>
      </summary>
      <div class="tha-v52-pmcp-body">
        ${neededNote}
        <div class="tha-v52-field-grid">
          ${fieldHtml('Source', item.source || 'PASS / PMCP')}
          ${displayFields.map(field => fieldHtml(field.label, field.value)).join('')}
        </div>
      </div>
    </details>`;
  }

  function buildPmcpSection(items = []) {
    const section = document.createElement('section');
    section.className = 'pmrBlock tha-v52-pmcp-consolidated';
    section.setAttribute('data-tha-v52-section', 'pmcp');
    section.innerHTML = `
      <h2>Preventive Maintenance Care Plan</h2>
      <p class="lede">Selected care-plan items from PASS / PMCP. This is the PMR reporting view for routine continued care. Open each line item for the context, timing, source detail, and any missing follow-up needed to satisfy the order.</p>
      <span class="tha-v52-pmcp-count">${items.length} PMCP item${items.length === 1 ? '' : 's'}</span>
      ${items.length ? `<div class="tha-v52-pmcp-list">${items.map(pmcpItemHtml).join('')}</div>` : '<div class="tha-v52-empty">No PMCP items have been formalized yet. Select items in PASS before this becomes part of the homeowner-facing PMR.</div>'}
    `;
    return section;
  }

  function ensureConsolidatedPmcp() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;

    const originalPmcpSections = findAll(
      pmr,
      [/pass maintenance calendar/i, /pass continued care/i, /continued care outlook/i, /preventive maintenance care plan/i, /preventative maintenance care plan/i],
      '.passCalendar,.passOutlook,.passPlanSummary,.tha-pmcp-timing-panel'
    );
    originalPmcpSections.forEach(section => section.setAttribute('data-tha-v52-original-pmcp', 'true'));

    const items = extractOutlookItems(pmr);
    const fallbackItems = items.length ? items : extractCalendarItems(pmr).slice(0, 12);

    let consolidated = pmr.querySelector('.tha-v52-pmcp-consolidated');
    const nextSection = buildPmcpSection(fallbackItems);
    if (consolidated) consolidated.replaceWith(nextSection);
    consolidated = nextSection;

    const trade = findDirect(pmr, [/trade\s*[-–—]?\s*by\s*[-–—]?\s*trade/i, /trade action list/i, /by resource/i], '.tradeActionList,.tradeByTradeActionList,.tradeFindings,.tradeSummary');
    const footer = pmr.querySelector('footer.promise');
    if (trade?.parentNode === pmr) trade.after(consolidated);
    else if (footer?.parentNode === pmr) pmr.insertBefore(consolidated, footer);
    else pmr.append(consolidated);
  }

  function ensureReferenceDrawer() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const references = findAll(
      pmr,
      [/supporting home care reference/i, /home-specific care supported by intake/i, /optional supporting home care info/i, /supporting home care info/i],
      '.baselineCare,.tha-pmr-supporting-output,.tha-supporting-builder'
    );
    references.forEach(section => section.setAttribute('data-tha-v52-original-reference', 'true'));

    let drawer = pmr.querySelector('.tha-v52-support-reference');
    if (!drawer) {
      drawer = document.createElement('details');
      drawer.className = 'pmrBlock tha-v52-support-reference';
      drawer.innerHTML = `<summary><div><strong>Supporting Home Care Reference</strong><small>Reference only — not the PMR report and not the PMCP action list.</small></div></summary><div class="tha-v52-reference-body"><p>This reference drawer keeps generic home-care context out of the main report flow. Use PASS to select actual PMCP line items. The consolidated PMCP section above is what reports selected continued-care items to the homeowner.</p></div>`;
    }
    const footer = pmr.querySelector('footer.promise');
    if (footer?.parentNode === pmr) pmr.insertBefore(drawer, footer);
    else pmr.append(drawer);
  }

  function sync() {
    installStyles();
    ensureConsolidatedPmcp();
    ensureReferenceDrawer();
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
  document.addEventListener('click', () => setTimeout(sync, 100), true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded', 'open', 'data-tha-v50-hidden'] });
  sync();
})();