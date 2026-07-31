(() => {
  const SCRIPT_ID = 'tha-v54-pmcp-review-collapse';
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
      /* V3.54: one PMCP reporting tile, fully collapsible, with expandable source-aware line items. */
      main.pmr:not(.passWorkspace) .passCalendar,
      main.pmr:not(.passWorkspace) .passOutlook,
      main.pmr:not(.passWorkspace) .passPlanSummary,
      main.pmr:not(.passWorkspace) .tha-pmcp-timing-panel,
      main.pmr:not(.passWorkspace) .baselineCare,
      main.pmr:not(.passWorkspace) .tha-pmr-supporting-output,
      main.pmr:not(.passWorkspace) .tha-supporting-builder,
      main.pmr:not(.passWorkspace) .tha-v52-pmcp-consolidated,
      main.pmr:not(.passWorkspace) .tha-v52-support-reference{
        display:none!important;
        visibility:hidden!important;
      }

      main.pmr:not(.passWorkspace) .tha-v54-pmcp-review{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:22px!important;
        background:#fff!important;
        margin:18px 0!important;
        overflow:hidden!important;
        box-shadow:inset -7px 0 0 #52aa4b,0 8px 22px rgba(13,44,73,.07)!important;
      }
      .tha-v54-pmcp-review > summary{
        cursor:pointer!important;
        list-style:none!important;
        padding:16px 18px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        background:#fff!important;
      }
      .tha-v54-pmcp-review > summary::-webkit-details-marker{display:none!important}
      .tha-v54-pmcp-title strong{display:block!important;color:#0b3658!important;font-size:22px!important;line-height:1.2!important}
      .tha-v54-pmcp-title small{display:block!important;color:#60717c!important;font-size:13px!important;line-height:1.35!important;margin-top:4px!important}
      .tha-v54-pmcp-count{display:inline-flex!important;border:1px solid #b9dfb4!important;background:#f6fcf4!important;color:#285c30!important;border-radius:999px!important;padding:6px 10px!important;font-size:12px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-v54-pmcp-review > summary::after{content:'Open / close';display:inline-flex!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#60717c!important;border-radius:999px!important;padding:5px 8px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-v54-pmcp-body{border-top:1px solid #e2e8ed!important;padding:16px 18px 18px!important;background:#fbfdfe!important}
      .tha-v54-pmcp-lede{margin:0 0 14px!important;color:#40505f!important;font-size:14px!important;line-height:1.45!important}
      .tha-v54-pmcp-list{display:grid!important;gap:10px!important}
      .tha-v54-pmcp-line{
        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:17px!important;
        background:#fff!important;
        overflow:hidden!important;
        box-shadow:inset -5px 0 0 #52aa4b!important;
      }
      .tha-v54-pmcp-line.needs-info{background:#fcf9ff!important;border-color:#dfccef!important;box-shadow:inset -6px 0 0 #7e4c9a!important}
      .tha-v54-pmcp-line > summary{cursor:pointer!important;list-style:none!important;padding:13px 15px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;background:#fff!important}
      .tha-v54-pmcp-line > summary::-webkit-details-marker{display:none!important}
      .tha-v54-line-title strong{display:block!important;color:#0b3658!important;font-size:16px!important;line-height:1.25!important}
      .tha-v54-line-title small{display:block!important;color:#60717c!important;font-size:12px!important;line-height:1.3!important;margin-top:2px!important}
      .tha-v54-chip-row{display:flex!important;flex-wrap:wrap!important;gap:6px!important;justify-content:flex-end!important;align-items:center!important;min-width:140px!important}
      .tha-v54-chip{display:inline-flex!important;align-items:center!important;gap:4px!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#40505f!important;border-radius:999px!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important;letter-spacing:.01em!important}
      .tha-v54-chip.pmcp{border-color:#b9dfb4!important;color:#285c30!important;background:#f6fcf4!important}
      .tha-v54-chip.source{border-color:#bdd4e6!important;color:#1f5d82!important;background:#eef6fb!important}
      .tha-v54-chip.need{border-color:#dfccef!important;color:#5b327e!important;background:#fbf7ff!important}
      .tha-v54-line-body{border-top:1px solid #e2e8ed!important;padding:13px 15px 15px!important;background:#fff!important;display:grid!important;gap:10px!important}
      .tha-v54-source-note{border:1px solid #d8e4ea!important;border-right:6px solid #52aa4b!important;border-radius:14px!important;background:#fbfdfe!important;padding:10px 12px!important;color:#40505f!important;font-size:12px!important;line-height:1.42!important;font-weight:800!important}
      .tha-v54-source-note.needs-info{border-color:#dfccef!important;border-right-color:#7e4c9a!important;background:#fbf7ff!important;color:#4e3470!important}
      .tha-v54-field-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;gap:8px!important}
      .tha-v54-field{border:1px solid #e2e8ed!important;border-radius:13px!important;background:#fbfdfe!important;padding:9px 10px!important}
      .tha-v54-field span{display:block!important;color:#60717c!important;font-size:10px!important;text-transform:uppercase!important;letter-spacing:.06em!important;font-weight:950!important;margin-bottom:2px!important}
      .tha-v54-field strong{display:block!important;color:#203040!important;font-size:13px!important;line-height:1.35!important;font-weight:750!important}
      .tha-v54-source-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;align-items:center!important}
      .tha-v54-source-actions button{border:1px solid #d8e4ea!important;border-radius:999px!important;background:#fff!important;color:#0b3658!important;padding:7px 10px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-v54-source-actions button.primary{border-color:#b9dfb4!important;background:#f6fcf4!important;color:#285c30!important}
      .tha-v54-empty{border:1px dashed #d8e4ea!important;border-radius:16px!important;background:#fff!important;padding:14px!important;color:#60717c!important;font-weight:800!important}
      main.pmr:not(.passWorkspace) .tha-v54-support-reference{border:1px solid #d8e4ea!important;border-left:1px solid #d8e4ea!important;border-radius:18px!important;background:#fbfdfe!important;margin:18px 0!important;box-shadow:none!important;overflow:hidden!important}
      .tha-v54-support-reference summary{cursor:pointer!important;list-style:none!important;padding:12px 14px!important;display:flex!important;justify-content:space-between!important;gap:10px!important;align-items:center!important}
      .tha-v54-support-reference summary::-webkit-details-marker{display:none!important}
      .tha-v54-support-reference summary strong{color:#0b3658!important;font-size:15px!important}
      .tha-v54-support-reference summary small{display:block!important;color:#60717c!important;font-size:12px!important;margin-top:2px!important}
      .tha-v54-support-reference summary::after{content:'Reference only';display:inline-flex!important;border:1px solid #d8e4ea!important;border-radius:999px!important;background:#fff!important;color:#60717c!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-v54-support-reference .tha-v54-reference-body{border-top:1px solid #e2e8ed!important;padding:12px 14px!important;color:#40505f!important;font-size:13px!important;line-height:1.45!important;background:#fff!important}
      @media(max-width:760px){.tha-v54-pmcp-review > summary,.tha-v54-pmcp-line > summary{align-items:flex-start!important;flex-direction:column!important}.tha-v54-chip-row{justify-content:flex-start!important}.tha-v54-field-grid{grid-template-columns:1fr!important}}
      @media print{.tha-v54-support-reference{display:none!important}.tha-v54-pmcp-review,.tha-v54-pmcp-line{break-inside:avoid!important}.tha-v54-pmcp-review:not([open]) .tha-v54-pmcp-body,.tha-v54-pmcp-line:not([open]) .tha-v54-line-body{display:block!important}}
    `;
    document.head.append(style);
  }

  function headingText(section) {
    return textOf(section?.querySelector?.('h1,h2,h3,summary') || section);
  }

  function directSections(pmr) {
    return Array.from(pmr?.children || []).filter(node => node?.nodeType === 1);
  }

  function findDirect(pmr, patterns, selector = '') {
    return directSections(pmr).find(section => (selector && section.matches?.(selector)) || patterns.some(pattern => pattern.test(headingText(section)))) || null;
  }

  function fieldFromBlock(block) {
    const strong = textOf(block.querySelector('strong,b,span'));
    const label = strong.replace(/:$/, '') || 'Detail';
    const value = textOf(block).replace(new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:?\\s*`, 'i'), '').trim();
    return { label, value: value || 'Not recorded' };
  }

  function extractOutlookItems(pmr) {
    const outlook = pmr.querySelector('.passOutlook');
    const cards = Array.from(outlook?.querySelectorAll?.('.passOutlookCard') || []);
    return cards.map((card, index) => {
      const title = textOf(card.querySelector('.findTop h3,h3')) || `PMCP item ${index + 1}`;
      const subline = textOf(card.querySelector('.findTop p'));
      const fields = Array.from(card.querySelectorAll('.findGrid p,.findGrid .pmrField')).map(fieldFromBlock).filter(field => field.value);
      const joined = [title, subline, ...fields.map(field => `${field.label} ${field.value}`)].join(' ');
      const cadence = fields.find(field => /cadence/i.test(field.label))?.value || '';
      const timing = fields.find(field => /target|window|season|timing|suggested|follow-up/i.test(field.label))?.value || '';
      const resource = fields.find(field => /resource|trade|responsible/i.test(field.label))?.value || (subline.split('·')[0] || '').trim();
      const sourceText = /intake/i.test(joined) && /htc|walkthrough/i.test(joined)
        ? 'PASS selection · Intake + HTC support'
        : /intake/i.test(joined)
          ? 'PASS selection · Intake support'
          : /htc|walkthrough/i.test(joined)
            ? 'PASS selection · HTC support'
            : 'PASS / PMCP selection';
      return { title, subline, fields, cadence, timing, resource, joined, sourceText, source: 'PASS / PMCP selection' };
    }).filter(item => item.title);
  }

  function extractCalendarItems(pmr) {
    const calendar = pmr.querySelector('.passCalendar');
    const rows = Array.from(calendar?.querySelectorAll?.('.passCalendarRow') || []);
    return rows.map((row, index) => {
      const title = textOf(row.querySelector('strong,h4,h3')) || textOf(row).split('·')[0] || `PMCP item ${index + 1}`;
      const fields = Array.from(row.querySelectorAll('span,em,small,p')).slice(0, 8).map((node, i) => ({ label: i === 0 ? 'Calendar detail' : `Detail ${i + 1}`, value: textOf(node) })).filter(field => field.value && field.value !== title);
      const joined = [title, ...fields.map(field => field.value)].join(' ');
      return { title, subline: 'Calendar / baseline view', fields, cadence: '', timing: '', resource: '', joined, sourceText: 'PASS calendar baseline', source: 'PASS Maintenance Calendar' };
    }).filter(item => item.title);
  }

  function needsInfo(item) {
    const text = String(item?.joined || '').toLowerCase();
    return /\b(unknown|verify|establish baseline|not scheduled|needs?|needed|confirm|tbd|to be determined|not recorded|ask|follow[- ]?up|consult|estimate)\b/.test(text);
  }

  function fieldHtml(label, value) {
    return `<div class="tha-v54-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Not recorded')}</strong></div>`;
  }

  function itemSignature(items = []) {
    return items.map(item => [item.title, item.subline, item.cadence, item.timing, item.resource, item.fields.map(field => `${field.label}:${field.value}`).join('|')].join('~')).join('||');
  }

  function pmcpItemHtml(item, index) {
    const infoNeeded = needsInfo(item);
    const meta = [item.cadence, item.timing, item.resource].filter(Boolean).slice(0, 3).join(' · ') || item.subline || 'Open for source detail';
    const displayFields = item.fields.length ? item.fields : [
      { label: 'Source', value: item.source || 'PASS / PMCP' },
      { label: 'Planning detail', value: item.subline || 'No additional detail recorded yet.' }
    ];
    const neededNote = infoNeeded
      ? '<div class="tha-v54-source-note needs-info">🟣 More information is needed before this PMCP line is fully satisfied. Confirm the missing date, trade input, scheduled service, estimate, or completion status before finalizing this care-plan item.</div>'
      : '<div class="tha-v54-source-note">This line is reported from the PASS / PMCP workflow. The expanded fields below show the source context currently available for the homeowner PMR.</div>';
    return `<details class="tha-v54-pmcp-line ${infoNeeded ? 'needs-info' : ''}" ${index === 0 ? 'open' : ''}>
      <summary>
        <div class="tha-v54-line-title"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(meta)}</small></div>
        <div class="tha-v54-chip-row"><span class="tha-v54-chip pmcp">PMCP</span><span class="tha-v54-chip source">${escapeHtml(item.sourceText || item.source || 'PASS')}</span>${infoNeeded ? '<span class="tha-v54-chip need">🟣 Info needed</span>' : ''}</div>
      </summary>
      <div class="tha-v54-line-body">
        ${neededNote}
        <div class="tha-v54-field-grid">
          ${fieldHtml('Reported from', item.sourceText || item.source || 'PASS / PMCP')}
          ${displayFields.map(field => fieldHtml(field.label, field.value)).join('')}
        </div>
        <div class="tha-v54-source-actions">
          <button type="button" class="primary" data-tha-v54-nav="pass">Review / edit in PASS</button>
          <button type="button" data-tha-v54-nav="form">Review HTC source</button>
          <button type="button" data-tha-v54-nav="intake">Review Intake source</button>
        </div>
      </div>
    </details>`;
  }

  function buildPmcpSection(items = []) {
    const section = document.createElement('details');
    section.className = 'pmrBlock tha-v54-pmcp-review';
    section.setAttribute('data-tha-v54-section', 'pmcp');
    section.setAttribute('open', '');
    section.dataset.thaV54Signature = itemSignature(items);
    section.innerHTML = `
      <summary>
        <div class="tha-v54-pmcp-title"><strong>Preventive Maintenance Care Plan</strong><small>Selected PMCP items reported from PASS, with expandable source context and correction paths.</small></div>
        <span class="tha-v54-pmcp-count">${items.length} PMCP item${items.length === 1 ? '' : 's'}</span>
      </summary>
      <div class="tha-v54-pmcp-body">
        <p class="tha-v54-pmcp-lede">This is the PMR reporting view for routine continued care. Open each line item to see where it came from, what still needs confirmation, and where to correct the source before final output.</p>
        ${items.length ? `<div class="tha-v54-pmcp-list">${items.map(pmcpItemHtml).join('')}</div>` : '<div class="tha-v54-empty">No PMCP items have been formalized yet. Select items in PASS before this becomes part of the homeowner-facing PMR.</div>'}
      </div>
    `;
    return section;
  }

  function ensurePmcpReview() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const items = extractOutlookItems(pmr);
    const fallbackItems = items.length ? items : extractCalendarItems(pmr).slice(0, 12);
    const signature = itemSignature(fallbackItems);
    let section = pmr.querySelector('.tha-v54-pmcp-review');
    if (!section || section.dataset.thaV54Signature !== signature) {
      const next = buildPmcpSection(fallbackItems);
      if (section) section.replaceWith(next);
      section = next;
    }
    const trade = findDirect(pmr, [/trade\s*[-–—]?\s*by\s*[-–—]?\s*trade/i, /trade action list/i, /by resource/i], '.tradeActionList,.tradeByTradeActionList,.tradeFindings,.tradeSummary');
    const footer = pmr.querySelector('footer.promise');
    if (trade?.parentNode === pmr && trade.nextElementSibling !== section) trade.after(section);
    else if (!section.parentNode && footer?.parentNode === pmr) pmr.insertBefore(section, footer);
    else if (!section.parentNode) pmr.append(section);
  }

  function ensureReferenceDrawer() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    let drawer = pmr.querySelector('.tha-v54-support-reference');
    if (!drawer) {
      drawer = document.createElement('details');
      drawer.className = 'pmrBlock tha-v54-support-reference';
      drawer.innerHTML = `<summary><div><strong>Supporting Home Care Reference</strong><small>Collapsed reference only — not the PMR report and not the PMCP action list.</small></div></summary><div class="tha-v54-reference-body"><p>This drawer keeps generic home-care reference material out of the main report flow. The selected, reportable PMCP items live in the Preventive Maintenance Care Plan section above.</p></div>`;
    }
    const footer = pmr.querySelector('footer.promise');
    if (footer?.parentNode === pmr && drawer.parentNode !== pmr) pmr.insertBefore(drawer, footer);
    else if (!drawer.parentNode) pmr.append(drawer);
  }

  function navigateTo(view) {
    const labels = { pass: /PASS/i, form: /HTC/i, intake: /Intake/i };
    const pattern = labels[view];
    const button = Array.from(document.querySelectorAll('header nav button, .topbar nav button')).find(btn => pattern.test(textOf(btn)));
    if (button) button.click();
  }

  function sync() {
    installStyles();
    ensurePmcpReview();
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
  document.addEventListener('click', event => {
    const navButton = event.target.closest?.('[data-tha-v54-nav]');
    if (navButton) {
      event.preventDefault();
      event.stopPropagation();
      navigateTo(navButton.dataset.thaV54Nav);
      return;
    }
    if (!event.target.closest?.('.tha-v54-pmcp-review,.tha-v54-support-reference')) setTimeout(sync, 100);
  }, true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'data-tha-v50-hidden'] });
  sync();
})();