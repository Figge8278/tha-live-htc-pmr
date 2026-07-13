(() => {
  const STYLE_ID = 'tha-v34-care-timing-styles';
  const STORAGE_KEY = 'tha:care-date-forecasting:v1';
  const WIDGET_ATTR = 'data-tha-care-date-widget';
  const MARKER_CLASS = 'tha-care-time-marker';
  const INLINE_ATTR = 'data-tha-care-timing-inline';
  const INTAKE_SOURCE = 'intake-widget-v34';

  const TIMEFRAME_OPTIONS = [
    { value: '', label: 'Unknown / not captured', monthsAgo: null },
    { value: 'within-1-month', label: 'Within the last month', monthsAgo: 0.5 },
    { value: '1-3-months', label: '1–3 months ago', monthsAgo: 2 },
    { value: '3-6-months', label: '3–6 months ago', monthsAgo: 4.5 },
    { value: '6-12-months', label: '6–12 months ago', monthsAgo: 9 },
    { value: '1-2-years', label: '1–2 years ago', monthsAgo: 18 },
    { value: 'over-2-years', label: 'More than 2 years ago', monthsAgo: 30 }
  ];

  const CARE_RULES = [
    { key:'furnace-filter', match:['furnace filter replacement','last furnace filter','furnace filter'], careItem:'Furnace filter replacement', cadenceLabel:'Every 1–3 months', cadenceMonths:3, resource:'Handy Services', batch:'Bundle with thermostat check, return-air grille check, and general mechanical-room walkthrough.', group:'HVAC / Mechanical' },
    { key:'furnace-service', match:['furnace service history','last furnace servicing','furnace servicing','furnace service'], careItem:'Furnace service', cadenceLabel:'Annual', cadenceMonths:12, resource:'HVAC', batch:'Forecast before heating season; THA can coordinate with filter and vent-path reminders.', group:'HVAC / Mechanical' },
    { key:'ac-service', match:['a/c service history','a/c or heat pump servicing','ac service history','heat pump service','cooling service','air conditioner service','a/c service'], careItem:'A/C or heat-pump service', cadenceLabel:'Annual', cadenceMonths:12, resource:'HVAC', batch:'Best forecast before cooling season; pairs with condenser clearance and thermostat review.', group:'HVAC / Mechanical' },
    { key:'water-heater', match:['water heater flush','water heater flush / age','water heater'], careItem:'Water heater flush / age review', cadenceLabel:'Annual review', cadenceMonths:12, resource:'Plumbing', batch:'Pairs well with main shut-off check, leak scan, and fixture/drain notes.', group:'Plumbing / Water' },
    { key:'sewer-scope', match:['sewer / irrigation history','sewer line scope','sewer scope','sewer clean','sewer'], careItem:'Sewer scope / clean-out history', cadenceLabel:'Every 3–5 years or condition-based', cadenceMonths:48, resource:'Plumbing', batch:'Useful for long-term planning; especially valuable before drainage, landscape, or remodel work.', group:'Plumbing / Water' },
    { key:'irrigation-service', match:['sewer / irrigation history','irrigation','sprinkler','sprinkler service','winterization','blowout'], careItem:'Irrigation turn-on / winterization', cadenceLabel:'Seasonal', cadenceMonths:6, resource:'Irrigation/Landscape', batch:'Forecast spring start-up and fall blowout; bundle with downspout, grading, and exterior-site notes.', group:'Exterior & Site' },
    { key:'dryer-vent', match:['dryer vent','dryer lint','dryer duct','laundry vent'], careItem:'Dryer vent cleaning', cadenceLabel:'Annual', cadenceMonths:12, resource:'Handy Services', batch:'Good Handy Services add-on with lint path, exterior vent flap, and laundry shut-off check.', group:'Handy Services' },
    { key:'chimney', match:['chimney inspection','chimney','fireplace'], careItem:'Chimney / fireplace inspection', cadenceLabel:'Annual or use-based', cadenceMonths:12, resource:'Chimney', batch:'Forecast before fireplace season; pairs with smoke/CO review and roof/exterior observations.', group:'Safety / Exterior' },
    { key:'smoke-co', match:['smoke / co','smoke/co','smoke detector','co detector','smoke co'], careItem:'Smoke / CO detector age and replacement check', cadenceLabel:'Annual check · replace by manufacturer age', cadenceMonths:12, resource:'Safety', batch:'Good quick add-on with fire extinguisher check and bedroom/hallway safety walkthrough.', group:'Safety / Life Safety' },
    { key:'fire-extinguishers', match:['fire extinguishers','fire extinguisher','extinguisher'], careItem:'Fire extinguisher location / age check', cadenceLabel:'Annual check', cadenceMonths:12, resource:'Safety', batch:'Pairs with smoke/CO detector check and kitchen/laundry safety review.', group:'Safety / Life Safety' },
    { key:'exterior-paint-stain', match:['last exterior paint','exterior paint','paint / stain','paint stain','paint/stain','stain'], careItem:'Exterior paint / stain planning', cadenceLabel:'Condition-based · usually multi-year', cadenceMonths:72, resource:'Painting / Staining', batch:'Useful forecast for siding/trim caulk, deck stain, masonry touch-up, and gutter/downspout planning.', group:'Exterior Protection' },
    { key:'roof-age', match:['roof age','last replacement','known roof leaks','roof leaks','roof history'], careItem:'Roof age / inspection planning', cadenceLabel:'Annual visual review', cadenceMonths:12, resource:'Roofing', batch:'Pairs with gutters, downspouts, attic/water staining notes, and exterior drainage planning.', group:'Exterior Protection' }
  ];

  function textOf(element) { return String(element?.textContent || '').replace(/\s+/g, ' ').trim(); }
  function normalized(element) { return textOf(element).toLowerCase(); }
  function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char])); }
  function readStore() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { return {}; } }
  function writeStore(store) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* local storage is helpful only */ } }

  function addMonths(date, months) {
    const copy = new Date(date.getTime());
    copy.setMonth(copy.getMonth() + months);
    return copy;
  }
  function formatDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
  }
  function seasonWindow(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Date unknown';
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month <= 1) return `winter ${year}`;
    if (month <= 4) return `spring ${year}`;
    if (month <= 7) return `summer ${year}`;
    if (month <= 10) return `fall ${year}`;
    return `winter ${year}`;
  }
  function dateFromTimeframe(optionValue) {
    const option = TIMEFRAME_OPTIONS.find(entry => entry.value === optionValue);
    if (!option || option.monthsAgo == null) return null;
    return addMonths(new Date(), -option.monthsAgo);
  }
  function statusForNext(nextDate) {
    if (!(nextDate instanceof Date) || Number.isNaN(nextDate.getTime())) return { label:'Needs baseline', tone:'orange' };
    const days = Math.round((nextDate.getTime() - Date.now()) / 86400000);
    if (days < -30) return { label:'Due / overdue', tone:'red' };
    if (days <= 30) return { label:'Due now', tone:'orange' };
    if (days <= 90) return { label:'Upcoming', tone:'gold' };
    return { label:'Forecasted', tone:'green' };
  }

  function recordForRule(rule, store = readStore()) {
    const saved = store[rule.key] || {};
    let lastDate = saved.lastDate ? new Date(`${saved.lastDate}T12:00:00`) : null;
    let dateSource = saved.lastDate ? 'Exact date captured' : '';
    if ((!lastDate || Number.isNaN(lastDate.getTime())) && saved.timeframe) {
      lastDate = dateFromTimeframe(saved.timeframe);
      dateSource = TIMEFRAME_OPTIONS.find(option => option.value === saved.timeframe)?.label || 'Approximate timeframe';
    }
    const hasTiming = Boolean((lastDate && !Number.isNaN(lastDate.getTime())) || saved.timeframe || saved.note);
    const nextDate = lastDate && !Number.isNaN(lastDate.getTime()) ? addMonths(lastDate, rule.cadenceMonths || 12) : null;
    return { rule, saved, lastDate, dateSource, nextDate, status: statusForNext(nextDate), hasTiming };
  }

  function tokenMatchesText(token, lower) {
    if (token === 'hvac') return /\bhvac\b/.test(lower) && /(service|servicing|maintenance|tune|inspection)/.test(lower);
    return lower.includes(token);
  }
  function matchingRulesForText(text) {
    const lower = String(text || '').toLowerCase();
    return CARE_RULES.filter(rule => rule.match.some(token => tokenMatchesText(token, lower)));
  }
  function matchingRulesForLabel(label) { return matchingRulesForText(textOf(label)); }
  function careRelevant(element) { return Boolean(element && (element.querySelector?.('.tha-care-date-widget') || matchingRulesForText(textOf(element)).length)); }
  function candidateLabels(root = document) {
    return Array.from(root.querySelectorAll('.intakeLane label.categoryQuestion, .intakeLane .intakeQuestion, .intakeLane label.notes, .intakeLane .structuredPromptField'));
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-care-date-widget{margin:10px 0 0!important;padding:10px!important;border:1px solid #d6e7f6!important;border-radius:12px!important;background:#f7fbff!important;color:#173e57!important;display:grid!important;gap:8px!important;box-shadow:inset 4px 0 0 rgba(47,128,237,.20)!important}
      .tha-care-date-widget strong{font-size:12px!important;color:#155799!important;display:block!important}
      .tha-care-date-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
      .tha-care-date-widget label{display:grid!important;gap:4px!important;font-size:11px!important;font-weight:900!important;color:#3c5262!important}
      .tha-care-date-widget input,.tha-care-date-widget select{width:100%!important;min-width:0!important;border:1px solid #bdd6ea!important;border-radius:10px!important;padding:8px!important;background:#fff!important;color:#173e57!important;font-size:12px!important}
      .tha-care-date-widget textarea{width:100%!important;min-height:58px!important;border:1px solid #bdd6ea!important;border-radius:10px!important;padding:8px!important;background:#fff!important;color:#173e57!important;font-size:12px!important;resize:vertical!important}
      .tha-care-date-note{font-size:11px!important;color:#5c6d77!important;line-height:1.35!important}

      .tha-care-time-marker{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;border:1px solid #f2a45f!important;border-radius:999px!important;background:#fff4e8!important;color:#a85107!important;padding:5px 8px!important;min-height:28px!important;font-size:10px!important;font-weight:950!important;line-height:1!important;white-space:nowrap!important;box-shadow:0 0 0 2px rgba(242,164,95,.12)!important;flex:0 0 auto!important;align-self:center!important}
      .tha-care-time-marker::before{content:'🕒';font-size:12px!important;line-height:1!important}
      .tha-care-time-marker.is-filled{border-color:#8fd08b!important;background:#ecf9ec!important;color:#2f6a2b!important;box-shadow:0 0 0 2px rgba(82,170,75,.12)!important}
      .tha-care-time-marker.is-filled::before{content:'✓';font-weight:950!important;color:#2f6a2b!important}
      .tha-quick-header{display:flex!important;align-items:center!important;gap:8px!important}
      .tha-quick-header .tha-quick-title{min-width:0!important;flex:1 1 auto!important}
      .tha-quick-header .tha-care-time-marker{margin-left:auto!important;margin-right:0!important;order:2!important}
      .tha-quick-header .tha-quick-action{order:3!important;flex:0 0 auto!important;align-self:center!important;min-height:28px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}
      .intakeSubsection>h3{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:nowrap!important;width:100%!important}
      .intakeSubsection>h3 .tha-prep-completion{order:7!important;margin-left:8px!important;margin-right:0!important;flex:0 0 auto!important}
      .intakeSubsection>h3 .tha-care-time-marker{order:98!important;margin-left:auto!important;margin-right:0!important;vertical-align:middle!important}
      .intakeSubsection>h3 .tha-clean-prep-toggle{order:99!important;margin-left:0!important;margin-right:0!important;flex:0 0 auto!important;align-self:center!important}
      .categoryQuestion>.tha-care-time-marker,label.notes>.tha-care-time-marker{margin-top:8px!important;justify-self:start!important}

      .tha-care-inline{margin-top:10px!important;padding:10px!important;border:1px solid #b9dfb4!important;border-radius:14px!important;background:#f7fcf5!important;box-shadow:inset 4px 0 0 rgba(82,170,75,.28)!important;display:grid!important;gap:7px!important;color:#285c30!important}
      .tha-care-inline strong{font-size:12px!important;color:#285c30!important}
      .tha-care-inline p{margin:0!important;font-size:11px!important;line-height:1.35!important;color:#425743!important}
      .tha-care-inline-meta{display:flex!important;flex-wrap:wrap!important;gap:5px!important}
      .tha-care-inline-meta span{display:inline-flex!important;border:1px solid #cfe8ca!important;border-radius:999px!important;background:#fff!important;color:#285c30!important;padding:4px 7px!important;font-size:10px!important;font-weight:900!important;line-height:1.1!important}
      .tha-care-inline-status{justify-self:start!important;border-radius:999px!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;border:1px solid #d8e4ea!important;background:#f8fafc!important;color:#53616c!important}
      .tha-care-inline-status.red{background:#fff1f0!important;color:#b42318!important;border-color:#f5b5ad!important}
      .tha-care-inline-status.orange{background:#fff4e8!important;color:#a85107!important;border-color:#f2c094!important}
      .tha-care-inline-status.gold{background:#fff9db!important;color:#8a6b00!important;border-color:#eadb85!important}
      .tha-care-inline-status.green{background:#ecf9ec!important;color:#2f6a2b!important;border-color:#b8dfb4!important}
      [data-tha-care-forecast-panel]{display:none!important}

      @media(max-width:720px){.tha-care-date-grid{grid-template-columns:1fr!important}.tha-care-time-marker{padding:4px 6px!important;font-size:9px!important;min-height:26px!important}.tha-care-time-marker::before{font-size:11px!important}.tha-quick-header{gap:6px!important}.intakeSubsection>h3{gap:6px!important;flex-wrap:wrap!important}.intakeSubsection>h3 .tha-care-time-marker{margin-left:auto!important}}
      @media print{.tha-care-date-widget{display:none!important}.tha-care-inline{break-inside:avoid!important;box-shadow:none!important}}
    `;
    document.head.append(style);
  }

  function intakeSavedValue(rule) {
    const saved = readStore()[rule.key] || {};
    return saved.source === INTAKE_SOURCE ? saved : {};
  }

  function buildWidget(rule) {
    const saved = intakeSavedValue(rule);
    const widget = document.createElement('div');
    widget.className = 'tha-care-date-widget';
    widget.setAttribute(WIDGET_ATTR, rule.key);
    widget.innerHTML = `
      <strong>${escapeHtml(rule.careItem)} — care timing</strong>
      <div class="tha-care-date-grid">
        <label>Last done date, if known<input type="date" data-care-field="lastDate" value="${escapeHtml(saved.lastDate || '')}" /></label>
        <label>Approximate timeframe<select data-care-field="timeframe">${TIMEFRAME_OPTIONS.map(option => `<option value="${escapeHtml(option.value)}" ${saved.timeframe === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
      </div>
      <label>Scheduling / batching note<textarea data-care-field="note" placeholder="Example: bundle with spring handy visit, HVAC service, or dryer vent cleaning.">${escapeHtml(saved.note || '')}</textarea></label>
      <div class="tha-care-date-note">This does not create a repair finding. It helps PMCP/PASS timing and batching.</div>`;
    widget.addEventListener('click', event => event.stopPropagation());
    widget.addEventListener('input', event => saveWidgetField(rule.key, event.target));
    widget.addEventListener('change', event => saveWidgetField(rule.key, event.target));
    return widget;
  }

  function saveWidgetField(key, field) {
    const name = field?.dataset?.careField;
    if (!name) return;
    const store = readStore();
    const current = { ...(store[key] || {}), source: INTAKE_SOURCE };
    current[name] = field.value;
    if (!current.lastDate && !current.timeframe && !current.note) delete store[key];
    else store[key] = current;
    writeStore(store);
    scheduleRun();
  }

  function enhanceIntakeFields(root = document) {
    candidateLabels(root).forEach(label => {
      matchingRulesForLabel(label).forEach(rule => {
        if (label.querySelector?.(`[${WIDGET_ATTR}="${rule.key}"]`)) return;
        label.append(buildWidget(rule));
      });
    });
  }

  function widgetVisibleFilled(widget) {
    return Array.from(widget.querySelectorAll('input,select,textarea')).some(field => String(field.value || '').trim());
  }

  function timingFilled(scope) {
    return Array.from(scope.querySelectorAll?.('.tha-care-date-widget') || []).some(widgetVisibleFilled);
  }

  function ensureMarker(container, target, label = 'Time') {
    if (!container || !target || !careRelevant(container)) return;
    let marker = target.querySelector?.(`:scope > .${MARKER_CLASS}`);
    if (!marker) {
      marker = document.createElement('span');
      marker.className = MARKER_CLASS;
      marker.title = 'Care timing field available. Add last-done date or approximate timeframe for PMCP/PASS timing.';
      const action = target.querySelector?.('.tha-quick-action, .tha-clean-prep-toggle, button');
      if (action && action.parentElement === target) target.insertBefore(marker, action);
      else target.append(marker);
    }
    const filled = timingFilled(container);
    marker.classList.toggle('is-filled', filled);
    marker.textContent = filled ? 'Timed' : label;
  }

  function markTimingHeaders(root = document) {
    root.querySelectorAll?.('.homeownerLane .tha-quick-card').forEach(card => ensureMarker(card, card.querySelector('.tha-quick-header'), 'Time'));
    root.querySelectorAll?.('.intakeLane .intakeSubsection').forEach(section => {
      const heading = section.querySelector(':scope > h3');
      ensureMarker(section, heading, 'Time');
      const toggle = heading?.querySelector?.('.tha-clean-prep-toggle');
      if (toggle) toggle.style.marginLeft = section.querySelector(`.${MARKER_CLASS}`) ? '0' : 'auto';
    });
    root.querySelectorAll?.('.intakeLane label.categoryQuestion, .intakeLane label.notes, .intakeLane .intakeQuestion').forEach(label => {
      if (label.closest('.tha-quick-card,.intakeSubsection')) return;
      ensureMarker(label, label, 'Time');
    });
  }

  function inlineHtml(record) {
    const { rule, saved, lastDate, dateSource, nextDate, status } = record;
    const last = lastDate ? formatDate(lastDate) : (dateSource || 'Not captured');
    const next = nextDate ? `${formatDate(nextDate)} · ${seasonWindow(nextDate)}` : 'Establish baseline during walkthrough';
    const note = saved.note ? `<p><strong>THA note:</strong> ${escapeHtml(saved.note)}</p>` : '';
    return `<div class="tha-care-inline" ${INLINE_ATTR}="${escapeHtml(rule.key)}">
      <span class="tha-care-inline-status ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
      <strong>Care timing</strong>
      <div class="tha-care-inline-meta"><span>${escapeHtml(rule.resource)}</span><span>${escapeHtml(rule.cadenceLabel)}</span><span>${escapeHtml(rule.group)}</span></div>
      <p><strong>Last known:</strong> ${escapeHtml(last)}</p>
      <p><strong>Next window:</strong> ${escapeHtml(next)}</p>
      <p><strong>Batching:</strong> ${escapeHtml(rule.batch)}</p>
      ${note}
    </div>`;
  }

  function targetContainers(root = document) {
    return Array.from(root.querySelectorAll('.passReviewCard,.passCalendarRow,.passPlanCard,.passOutlookCard,.pmrBlock.passCalendar .passCalendarRow,.passPlanCategoryGrid article,.passOutlookGrid article'));
  }

  function attachInlineTiming(root = document) {
    const store = readStore();
    const records = CARE_RULES.map(rule => recordForRule(rule, store)).filter(record => record.hasTiming);
    root.querySelectorAll?.(`[${INLINE_ATTR}]`).forEach(existing => existing.remove());
    if (!records.length) return;
    targetContainers(root).forEach(container => {
      const text = normalized(container);
      const record = records.find(entry => entry.rule.match.some(token => tokenMatchesText(token, text)) || text.includes(entry.rule.careItem.toLowerCase()));
      if (!record) return;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = inlineHtml(record);
      container.append(wrapper.firstElementChild);
    });
  }

  function removeStandaloneForecastPanels(root = document) {
    root.querySelectorAll?.('[data-tha-care-forecast-panel],.tha-care-forecast-panel,.tha-pmcp-timing-panel').forEach(panel => panel.remove());
  }

  function run() {
    installStyles();
    enhanceIntakeFields(document);
    markTimingHeaders(document);
    removeStandaloneForecastPanels(document);
    attachInlineTiming(document);
  }

  let scheduled = false;
  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      run();
      window.setTimeout(run, 140);
    });
  }

  function start() {
    run();
    const observer = new MutationObserver(scheduleRun);
    observer.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class','value','aria-expanded'] });
    document.addEventListener('input', scheduleRun);
    document.addEventListener('change', scheduleRun);
    window.addEventListener('tha:set-view', () => window.setTimeout(run, 150));
    window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) scheduleRun(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();