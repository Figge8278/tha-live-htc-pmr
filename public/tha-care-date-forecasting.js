(() => {
  const STYLE_ID = 'tha-care-date-forecasting-styles';
  const STORAGE_KEY = 'tha:care-date-forecasting:v1';
  const WIDGET_ATTR = 'data-tha-care-date-widget';
  const PANEL_ATTR = 'data-tha-care-forecast-panel';

  const CARE_RULES = [
    {
      key: 'furnace-filter',
      match: ['furnace filter replacement', 'last furnace filter'],
      careItem: 'Furnace filter replacement',
      cadenceLabel: 'Every 1–3 months',
      cadenceMonths: 3,
      resource: 'Handy Services',
      batch: 'Bundle with thermostat check, return-air grille check, and general mechanical-room walkthrough.',
      group: 'HVAC / Mechanical'
    },
    {
      key: 'furnace-service',
      match: ['furnace service history', 'last furnace servicing', 'furnace servicing'],
      careItem: 'Furnace service',
      cadenceLabel: 'Annual',
      cadenceMonths: 12,
      resource: 'HVAC',
      batch: 'Good to forecast before heating season; THA can coordinate with filter and vent-path reminders.',
      group: 'HVAC / Mechanical'
    },
    {
      key: 'ac-service',
      match: ['a/c service history', 'a/c or heat pump servicing', 'ac service history'],
      careItem: 'A/C or heat-pump service',
      cadenceLabel: 'Annual',
      cadenceMonths: 12,
      resource: 'HVAC',
      batch: 'Best forecast before cooling season; pairs with condenser clearance and thermostat review.',
      group: 'HVAC / Mechanical'
    },
    {
      key: 'water-heater',
      match: ['water heater flush', 'water heater flush / age', 'water heater'],
      careItem: 'Water heater flush / age review',
      cadenceLabel: 'Annual review',
      cadenceMonths: 12,
      resource: 'Plumbing',
      batch: 'Pairs well with main shut-off check, leak scan, and fixture/drain notes.',
      group: 'Plumbing / Water'
    },
    {
      key: 'sewer-scope',
      match: ['sewer', 'sewer line scope', 'sewer / irrigation history'],
      careItem: 'Sewer scope / clean-out history',
      cadenceLabel: 'Every 3–5 years or condition-based',
      cadenceMonths: 48,
      resource: 'Plumbing',
      batch: 'Useful for long-term planning; especially valuable before drainage, landscape, or remodel work.',
      group: 'Plumbing / Water'
    },
    {
      key: 'irrigation-service',
      match: ['irrigation', 'sprinkler', 'sewer / irrigation history'],
      careItem: 'Irrigation turn-on / winterization',
      cadenceLabel: 'Seasonal',
      cadenceMonths: 6,
      resource: 'Irrigation/Landscape',
      batch: 'Forecast spring start-up and fall blowout; bundle with downspout, grading, and exterior-site notes.',
      group: 'Exterior & Site'
    },
    {
      key: 'dryer-vent',
      match: ['dryer vent', 'dryer lint', 'dryer duct'],
      careItem: 'Dryer vent cleaning',
      cadenceLabel: 'Annual',
      cadenceMonths: 12,
      resource: 'Handy Services',
      batch: 'Good Handy Services add-on with lint path, exterior vent flap, and laundry shut-off check.',
      group: 'Handy Services'
    },
    {
      key: 'chimney',
      match: ['chimney inspection', 'chimney', 'fireplace'],
      careItem: 'Chimney / fireplace inspection',
      cadenceLabel: 'Annual or use-based',
      cadenceMonths: 12,
      resource: 'Chimney',
      batch: 'Forecast before fireplace season; pairs with smoke/CO review and roof/exterior observations.',
      group: 'Safety / Exterior'
    },
    {
      key: 'smoke-co',
      match: ['smoke / co', 'smoke/co', 'smoke detector', 'co detector'],
      careItem: 'Smoke / CO detector age and replacement check',
      cadenceLabel: 'Annual check · replace by manufacturer age',
      cadenceMonths: 12,
      resource: 'Safety',
      batch: 'Good quick add-on with fire extinguisher check and bedroom/hallway safety walkthrough.',
      group: 'Safety / Life Safety'
    },
    {
      key: 'fire-extinguishers',
      match: ['fire extinguishers', 'extinguisher'],
      careItem: 'Fire extinguisher location / age check',
      cadenceLabel: 'Annual check',
      cadenceMonths: 12,
      resource: 'Safety',
      batch: 'Pairs with smoke/CO detector check and kitchen/laundry safety review.',
      group: 'Safety / Life Safety'
    },
    {
      key: 'exterior-paint-stain',
      match: ['last exterior paint', 'paint / stain', 'paint stain', 'paint / stain'],
      careItem: 'Exterior paint / stain planning',
      cadenceLabel: 'Condition-based · usually multi-year',
      cadenceMonths: 72,
      resource: 'Painting / Staining',
      batch: 'Useful forecast for siding/trim caulk, deck stain, masonry touch-up, and gutter/downspout planning.',
      group: 'Exterior Protection'
    },
    {
      key: 'roof-age',
      match: ['roof age', 'last replacement', 'known roof leaks'],
      careItem: 'Roof age / inspection planning',
      cadenceLabel: 'Annual visual review',
      cadenceMonths: 12,
      resource: 'Roofing',
      batch: 'Pairs with gutters, downspouts, attic/water staining notes, and exterior drainage planning.',
      group: 'Exterior Protection'
    }
  ];

  const TIMEFRAME_OPTIONS = [
    { value: '', label: 'Unknown / not captured', monthsAgo: null },
    { value: 'within-1-month', label: 'Within the last month', monthsAgo: 0.5 },
    { value: '1-3-months', label: '1–3 months ago', monthsAgo: 2 },
    { value: '3-6-months', label: '3–6 months ago', monthsAgo: 4.5 },
    { value: '6-12-months', label: '6–12 months ago', monthsAgo: 9 },
    { value: '1-2-years', label: '1–2 years ago', monthsAgo: 18 },
    { value: 'over-2-years', label: 'More than 2 years ago', monthsAgo: 30 }
  ];

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function writeStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch { /* non-critical */ }
  }

  function normalizedText(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function addMonths(date, months) {
    const copy = new Date(date.getTime());
    copy.setMonth(copy.getMonth() + months);
    return copy;
  }

  function formatDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
    const now = new Date();
    return addMonths(now, -option.monthsAgo);
  }

  function statusForNext(nextDate) {
    if (!(nextDate instanceof Date) || Number.isNaN(nextDate.getTime())) return { label: 'Needs baseline', tone: 'orange' };
    const now = new Date();
    const days = Math.round((nextDate.getTime() - now.getTime()) / 86400000);
    if (days < -30) return { label: 'Due / overdue', tone: 'red' };
    if (days <= 30) return { label: 'Due now', tone: 'orange' };
    if (days <= 90) return { label: 'Upcoming', tone: 'gold' };
    return { label: 'Forecasted', tone: 'green' };
  }

  function recordForRule(rule, store) {
    const saved = store[rule.key] || {};
    let lastDate = saved.lastDate ? new Date(`${saved.lastDate}T12:00:00`) : null;
    let dateSource = saved.lastDate ? 'Exact date captured' : '';
    if ((!lastDate || Number.isNaN(lastDate.getTime())) && saved.timeframe) {
      lastDate = dateFromTimeframe(saved.timeframe);
      dateSource = TIMEFRAME_OPTIONS.find(option => option.value === saved.timeframe)?.label || 'Approximate timeframe';
    }
    const hasTiming = Boolean((lastDate && !Number.isNaN(lastDate.getTime())) || saved.timeframe || saved.note);
    const nextDate = lastDate && !Number.isNaN(lastDate.getTime()) ? addMonths(lastDate, rule.cadenceMonths || 12) : null;
    const status = statusForNext(nextDate);
    return { rule, saved, lastDate, dateSource, nextDate, status, hasTiming };
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
      .tha-care-forecast-panel{border-color:#c9e3f6!important;background:#f8fcff!important;box-shadow:inset 6px 0 0 rgba(47,128,237,.22)!important}
      .tha-care-forecast-panel h2{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}
      .tha-care-forecast-panel h2::after{content:"date-driven";display:inline-flex;border:1px solid #bdd6ea;border-radius:999px;background:#fff;color:#155799;padding:4px 8px;font-size:11px;font-weight:950;letter-spacing:.02em;text-transform:uppercase}
      .tha-care-forecast-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(235px,1fr))!important;gap:12px!important;align-items:start!important;margin-top:12px!important}
      .tha-care-forecast-card{border:1px solid #dce8f0!important;border-radius:16px!important;background:#fff!important;padding:12px!important;box-shadow:0 8px 18px rgba(23,62,87,.06)!important;display:grid!important;gap:8px!important;min-width:0!important}
      .tha-care-forecast-card h3{margin:0!important;font-size:15px!important;line-height:1.25!important;color:#173e57!important}
      .tha-care-forecast-card p{margin:0!important;font-size:12px!important;line-height:1.35!important;color:#53616c!important}
      .tha-care-forecast-meta{display:flex!important;flex-wrap:wrap!important;gap:5px!important}
      .tha-care-forecast-meta span{display:inline-flex!important;border:1px solid #e0e8ee!important;border-radius:999px!important;background:#fff!important;color:#526470!important;padding:4px 7px!important;font-size:10px!important;font-weight:900!important;line-height:1.1!important}
      .tha-care-forecast-status{justify-self:start!important;border-radius:999px!important;padding:5px 8px!important;font-size:11px!important;font-weight:950!important;border:1px solid #d8e4ea!important;background:#f8fafc!important;color:#53616c!important}
      .tha-care-forecast-status.red{background:#fff1f0!important;color:#b42318!important;border-color:#f5b5ad!important}
      .tha-care-forecast-status.orange{background:#fff4e8!important;color:#a85107!important;border-color:#f2c094!important}
      .tha-care-forecast-status.gold{background:#fff9db!important;color:#8a6b00!important;border-color:#eadb85!important}
      .tha-care-forecast-status.green{background:#ecf9ec!important;color:#2f6a2b!important;border-color:#b8dfb4!important}
      .tha-care-batch-panel{margin-top:14px!important;border:1px solid #d8e4ea!important;border-radius:16px!important;background:#fff!important;padding:12px!important}
      .tha-care-batch-panel h3{margin:0 0 8px!important;color:#173e57!important;font-size:15px!important}
      .tha-care-batch-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))!important;gap:10px!important}
      .tha-care-batch-card{border:1px solid #e1e9ee!important;border-radius:14px!important;background:#fbfdfe!important;padding:10px!important;font-size:12px!important;line-height:1.35!important;color:#53616c!important}
      .tha-care-batch-card strong{display:block!important;color:#173e57!important;margin-bottom:4px!important}
      @media(max-width:720px){.tha-care-date-grid{grid-template-columns:1fr!important}.tha-care-forecast-grid,.tha-care-batch-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.tha-care-forecast-card{padding:10px!important}.tha-care-forecast-card h3{font-size:13px!important}.tha-care-forecast-card p{font-size:11px!important}}
      @media print{.tha-care-date-widget{display:none!important}.tha-care-forecast-panel{break-inside:avoid!important}.tha-care-forecast-card{break-inside:avoid!important;box-shadow:none!important}}
    `;
    document.head.append(style);
  }

  function matchingRuleForLabel(label) {
    const text = normalizedText(label);
    return CARE_RULES.find(rule => rule.match.some(token => text.includes(token)));
  }

  function candidateLabels(root = document) {
    return Array.from(root.querySelectorAll('.intakeLane label.categoryQuestion, .intakeLane .intakeQuestion, .intakeLane label.notes'));
  }

  function buildWidget(rule) {
    const store = readStore();
    const saved = store[rule.key] || {};
    const widget = document.createElement('div');
    widget.className = 'tha-care-date-widget';
    widget.setAttribute(WIDGET_ATTR, rule.key);
    widget.innerHTML = `
      <strong>Care timing for PMR forecasting</strong>
      <div class="tha-care-date-grid">
        <label>Last done date, if known<input type="date" data-care-field="lastDate" value="${saved.lastDate || ''}" /></label>
        <label>Approximate timeframe<select data-care-field="timeframe">${TIMEFRAME_OPTIONS.map(option => `<option value="${option.value}" ${saved.timeframe === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label>
      </div>
      <label>Scheduling / batching note<textarea data-care-field="note" placeholder="Example: bundle with spring handy visit, HVAC service, or dryer vent cleaning.">${saved.note || ''}</textarea></label>
      <div class="tha-care-date-note">This does not create a repair finding. It helps the PMR forecast future upkeep and bundle Handy Services.</div>
    `;
    widget.addEventListener('click', event => event.stopPropagation());
    widget.addEventListener('input', event => saveWidgetField(rule.key, event.target));
    widget.addEventListener('change', event => saveWidgetField(rule.key, event.target));
    return widget;
  }

  function saveWidgetField(key, field) {
    const name = field?.dataset?.careField;
    if (!name) return;
    const store = readStore();
    const current = store[key] || {};
    current[name] = field.value;
    store[key] = current;
    writeStore(store);
    scheduleEnhance();
  }

  function enhanceIntakeFields(root = document) {
    candidateLabels(root).forEach(label => {
      if (label.querySelector?.('.tha-care-date-widget')) return;
      const rule = matchingRuleForLabel(label);
      if (!rule) return;
      label.append(buildWidget(rule));
    });
  }

  function forecastRecords() {
    const store = readStore();
    return CARE_RULES
      .map(rule => recordForRule(rule, store))
      .filter(record => record.hasTiming)
      .sort((a, b) => {
        const av = a.nextDate instanceof Date && !Number.isNaN(a.nextDate.getTime()) ? a.nextDate.getTime() : Number.MAX_SAFE_INTEGER;
        const bv = b.nextDate instanceof Date && !Number.isNaN(b.nextDate.getTime()) ? b.nextDate.getTime() : Number.MAX_SAFE_INTEGER;
        return av - bv || a.rule.careItem.localeCompare(b.rule.careItem);
      });
  }

  function batchGroups(records) {
    const groups = new Map();
    records.forEach(record => {
      const dueKey = record.nextDate ? seasonWindow(record.nextDate) : 'baseline to establish';
      const key = `${dueKey} · ${record.rule.resource}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record.rule.careItem);
    });
    return Array.from(groups.entries()).filter(([, items]) => items.length > 1);
  }

  function panelHtml(records, context) {
    const cards = records.map(record => {
      const rule = record.rule;
      const last = record.lastDate ? formatDate(record.lastDate) : (record.dateSource || 'Not captured');
      const next = record.nextDate ? `${formatDate(record.nextDate)} · ${seasonWindow(record.nextDate)}` : 'Establish baseline during walkthrough';
      const note = record.saved.note ? `<p><strong>THA note:</strong> ${escapeHtml(record.saved.note)}</p>` : '';
      return `<article class="tha-care-forecast-card">
        <span class="tha-care-forecast-status ${record.status.tone}">${record.status.label}</span>
        <h3>${escapeHtml(rule.careItem)}</h3>
        <div class="tha-care-forecast-meta"><span>${escapeHtml(rule.group)}</span><span>${escapeHtml(rule.resource)}</span><span>${escapeHtml(rule.cadenceLabel)}</span></div>
        <p><strong>Last known:</strong> ${escapeHtml(last)}</p>
        <p><strong>Next forecast:</strong> ${escapeHtml(next)}</p>
        <p><strong>Batching:</strong> ${escapeHtml(rule.batch)}</p>
        ${note}
      </article>`;
    }).join('');

    const groups = batchGroups(records);
    const batchHtml = groups.length ? `<div class="tha-care-batch-panel"><h3>Batching opportunities</h3><div class="tha-care-batch-grid">${groups.map(([key, items]) => `<div class="tha-care-batch-card"><strong>${escapeHtml(key)}</strong>${escapeHtml(items.join(' · '))}</div>`).join('')}</div></div>` : '';

    return `<section class="pmrBlock tha-care-forecast-panel" ${PANEL_ATTR}="${context}">
      <h2>Care-Date Forecast</h2>
      <p class="lede">Timestamped intake answers create PMR forecasting without turning routine upkeep into repair findings. Use this to show what is due, what is coming up, and what can be bundled into Handy Services or trade visits.</p>
      ${records.length ? `<div class="tha-care-forecast-grid">${cards}</div>${batchHtml}` : `<p class="lede">No care dates or approximate timeframes captured yet. Add last-done timing in Intake to generate forecasted PMR reminders.</p>`}
    </section>`;
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function insertForecastPanel() {
    const records = forecastRecords();
    document.querySelectorAll(`[${PANEL_ATTR}]`).forEach(panel => panel.remove());

    const pmrMain = document.querySelector('main.pmr:not(.passWorkspace)');
    if (pmrMain) {
      const anchor = pmrMain.querySelector('.frontSummary, .collapsibleBlock.passCalendar, .pmrBlock.passCalendar');
      const wrapper = document.createElement('div');
      wrapper.innerHTML = panelHtml(records, 'pmr');
      const panel = wrapper.firstElementChild;
      if (anchor?.parentElement) anchor.after(panel);
      else pmrMain.prepend(panel);
    }

    const passMain = document.querySelector('main.pmr.passWorkspace');
    if (passMain) {
      const anchor = passMain.querySelector('.frontSummary');
      const wrapper = document.createElement('div');
      wrapper.innerHTML = panelHtml(records, 'pass');
      const panel = wrapper.firstElementChild;
      if (anchor?.parentElement) anchor.after(panel);
      else passMain.prepend(panel);
    }
  }

  function run() {
    installStyles();
    enhanceIntakeFields(document);
    insertForecastPanel();
  }

  let scheduled = false;
  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      run();
    });
  }

  function start() {
    run();
    const observer = new MutationObserver(scheduleEnhance);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('tha:set-view', () => window.setTimeout(run, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
