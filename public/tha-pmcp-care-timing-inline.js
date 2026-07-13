(() => {
  const STYLE_ID = 'tha-pmcp-care-timing-inline-styles';
  const STORAGE_KEY = 'tha:care-date-forecasting:v1';
  const INLINE_ATTR = 'data-tha-pmcp-care-timing-inline';

  const CARE_RULES = [
    { key:'furnace-filter', match:['furnace filter replacement','last furnace filter','furnace filter'], careItem:'Furnace filter replacement', cadenceLabel:'Every 1–3 months', cadenceMonths:3, resource:'Handy Services', batch:'Bundle with thermostat check, return-air grille check, and mechanical-room walkthrough.' },
    { key:'furnace-service', match:['furnace service history','last furnace servicing','furnace servicing','furnace service'], careItem:'Furnace service', cadenceLabel:'Annual', cadenceMonths:12, resource:'HVAC', batch:'Forecast before heating season; pairs with filter and vent-path reminders.' },
    { key:'ac-service', match:['a/c service history','a/c or heat pump servicing','ac service history','heat pump service','cooling service'], careItem:'A/C or heat-pump service', cadenceLabel:'Annual', cadenceMonths:12, resource:'HVAC', batch:'Forecast before cooling season; pairs with condenser clearance and thermostat review.' },
    { key:'water-heater', match:['water heater flush','water heater flush / age','water heater'], careItem:'Water heater flush / age review', cadenceLabel:'Annual review', cadenceMonths:12, resource:'Plumbing', batch:'Pairs with shut-off check, leak scan, and fixture/drain notes.' },
    { key:'sewer-scope', match:['sewer / irrigation history','sewer line scope','sewer scope','sewer clean','sewer'], careItem:'Sewer scope / clean-out history', cadenceLabel:'Every 3–5 years or condition-based', cadenceMonths:48, resource:'Plumbing', batch:'Useful before drainage, landscape, or remodel work.' },
    { key:'irrigation-service', match:['sewer / irrigation history','irrigation','sprinkler','sprinkler service','winterization','blowout'], careItem:'Irrigation turn-on / winterization', cadenceLabel:'Seasonal', cadenceMonths:6, resource:'Irrigation/Landscape', batch:'Forecast spring start-up and fall blowout; bundle with exterior-site notes.' },
    { key:'dryer-vent', match:['dryer vent','dryer lint','dryer duct','laundry vent'], careItem:'Dryer vent cleaning', cadenceLabel:'Annual', cadenceMonths:12, resource:'Handy Services', batch:'Good Handy Services add-on with lint path, exterior vent flap, and laundry shut-off check.' },
    { key:'chimney', match:['chimney inspection','chimney','fireplace'], careItem:'Chimney / fireplace inspection', cadenceLabel:'Annual or use-based', cadenceMonths:12, resource:'Chimney', batch:'Forecast before fireplace season; pairs with smoke/CO review and roof/exterior observations.' },
    { key:'smoke-co', match:['smoke / co','smoke/co','smoke detector','co detector','smoke co'], careItem:'Smoke / CO detector age and replacement check', cadenceLabel:'Annual check · replace by manufacturer age', cadenceMonths:12, resource:'Safety', batch:'Pairs with fire extinguisher check and bedroom/hallway safety walkthrough.' },
    { key:'fire-extinguishers', match:['fire extinguishers','fire extinguisher','extinguisher'], careItem:'Fire extinguisher location / age check', cadenceLabel:'Annual check', cadenceMonths:12, resource:'Safety', batch:'Pairs with smoke/CO detector check and kitchen/laundry safety review.' },
    { key:'exterior-paint-stain', match:['last exterior paint','exterior paint','paint / stain','paint stain','paint/stain','stain'], careItem:'Exterior paint / stain planning', cadenceLabel:'Condition-based · usually multi-year', cadenceMonths:72, resource:'Painting / Staining', batch:'Useful for siding/trim caulk, deck stain, masonry touch-up, and gutter/downspout planning.' },
    { key:'roof-age', match:['roof age','last replacement','known roof leaks','roof leaks','roof history'], careItem:'Roof age / inspection planning', cadenceLabel:'Annual visual review', cadenceMonths:12, resource:'Roofing', batch:'Pairs with gutters, downspouts, attic/water staining notes, and exterior drainage planning.' }
  ];

  const TIMEFRAME_OPTIONS = [
    { value:'', label:'Unknown / not captured', monthsAgo:null },
    { value:'within-1-month', label:'Within the last month', monthsAgo:.5 },
    { value:'1-3-months', label:'1–3 months ago', monthsAgo:2 },
    { value:'3-6-months', label:'3–6 months ago', monthsAgo:4.5 },
    { value:'6-12-months', label:'6–12 months ago', monthsAgo:9 },
    { value:'1-2-years', label:'1–2 years ago', monthsAgo:18 },
    { value:'over-2-years', label:'More than 2 years ago', monthsAgo:30 }
  ];

  function readStore(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { return {}; } }
  function textOf(element){ return String(element?.textContent || '').replace(/\s+/g,' ').trim().toLowerCase(); }
  function escapeHtml(value=''){ return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function addMonths(date, months){ const copy = new Date(date.getTime()); copy.setMonth(copy.getMonth() + months); return copy; }
  function formatDate(date){ if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Unknown'; return date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }
  function seasonWindow(date){
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Date unknown';
    const month = date.getMonth(); const year = date.getFullYear();
    if (month <= 1) return `winter ${year}`;
    if (month <= 4) return `spring ${year}`;
    if (month <= 7) return `summer ${year}`;
    if (month <= 10) return `fall ${year}`;
    return `winter ${year}`;
  }
  function dateFromTimeframe(value){
    const option = TIMEFRAME_OPTIONS.find(entry => entry.value === value);
    if (!option || option.monthsAgo == null) return null;
    return addMonths(new Date(), -option.monthsAgo);
  }
  function statusForNext(nextDate){
    if (!(nextDate instanceof Date) || Number.isNaN(nextDate.getTime())) return { label:'Needs baseline', tone:'orange' };
    const days = Math.round((nextDate.getTime() - Date.now()) / 86400000);
    if (days < -30) return { label:'Due / overdue', tone:'red' };
    if (days <= 30) return { label:'Due now', tone:'orange' };
    if (days <= 90) return { label:'Upcoming', tone:'gold' };
    return { label:'Forecasted', tone:'green' };
  }
  function recordForRule(rule, store){
    const saved = store[rule.key] || {};
    let lastDate = saved.lastDate ? new Date(`${saved.lastDate}T12:00:00`) : null;
    let dateSource = saved.lastDate ? 'Exact date' : '';
    if ((!lastDate || Number.isNaN(lastDate.getTime())) && saved.timeframe) {
      lastDate = dateFromTimeframe(saved.timeframe);
      dateSource = TIMEFRAME_OPTIONS.find(option => option.value === saved.timeframe)?.label || 'Approximate timeframe';
    }
    const hasTiming = Boolean((lastDate && !Number.isNaN(lastDate.getTime())) || saved.timeframe || saved.note);
    const nextDate = lastDate && !Number.isNaN(lastDate.getTime()) ? addMonths(lastDate, rule.cadenceMonths || 12) : null;
    return { rule, saved, lastDate, dateSource, nextDate, status: statusForNext(nextDate), hasTiming };
  }
  function records(){ return CARE_RULES.map(rule => recordForRule(rule, readStore())).filter(record => record.hasTiming); }

  function installStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-care-forecast-panel{display:none!important}
      .tha-care-timing-inline{margin-top:10px!important;padding:9px 10px!important;border:1px solid #b9dfb4!important;border-radius:13px!important;background:#f7fcf5!important;color:#285c30!important;box-shadow:inset 4px 0 0 rgba(82,170,75,.28)!important;display:grid!important;gap:6px!important;clear:both!important}
      .tha-care-timing-inline strong{display:flex!important;align-items:center!important;gap:6px!important;flex-wrap:wrap!important;margin:0!important;font-size:12px!important;line-height:1.25!important;color:#285c30!important}
      .tha-care-timing-inline strong::before{content:'🕒';font-size:13px!important;line-height:1!important}
      .tha-care-timing-inline p{margin:0!important;font-size:11px!important;line-height:1.35!important;color:#3d5d3b!important}
      .tha-care-timing-chips{display:flex!important;flex-wrap:wrap!important;gap:5px!important}
      .tha-care-timing-chips span{display:inline-flex!important;align-items:center!important;border:1px solid #cfe6ca!important;border-radius:999px!important;background:#fff!important;color:#285c30!important;padding:4px 7px!important;font-size:10px!important;font-weight:900!important;line-height:1.1!important}
      .tha-care-timing-status{justify-self:start!important;border:1px solid #cfe6ca!important;border-radius:999px!important;background:#fff!important;color:#285c30!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;line-height:1.1!important}
      .tha-care-timing-status.red{background:#fff1f0!important;color:#b42318!important;border-color:#f5b5ad!important}
      .tha-care-timing-status.orange{background:#fff4e8!important;color:#a85107!important;border-color:#f2c094!important}
      .tha-care-timing-status.gold{background:#fff9db!important;color:#8a6b00!important;border-color:#eadb85!important}
      .tha-care-timing-status.green{background:#ecf9ec!important;color:#2f6a2b!important;border-color:#b8dfb4!important}
      .passReviewCard .tha-care-timing-inline,.passCalendarRow .tha-care-timing-inline,.passOutlookCard .tha-care-timing-inline,.passPlanCategoryGrid .tha-care-timing-inline{font-size:11px!important}
      @media(max-width:720px){.tha-care-timing-inline{padding:8px!important}.tha-care-timing-inline strong{font-size:11px!important}.tha-care-timing-inline p{font-size:10px!important}.tha-care-timing-chips span{font-size:9px!important;padding:3px 6px!important}}
      @media print{.tha-care-timing-inline{break-inside:avoid!important;box-shadow:none!important}}
    `;
    document.head.append(style);
  }

  function matchingRecord(element, currentRecords){
    const text = textOf(element);
    return currentRecords.find(record => {
      const title = record.rule.careItem.toLowerCase();
      return text.includes(title) || record.rule.match.some(token => text.includes(token));
    }) || null;
  }

  function inlineHtml(record){
    const last = record.lastDate ? formatDate(record.lastDate) : (record.dateSource || 'Baseline not established');
    const next = record.nextDate ? `${formatDate(record.nextDate)} · ${seasonWindow(record.nextDate)}` : 'Establish baseline during walkthrough';
    const note = record.saved.note ? `<p><strong>Note:</strong> ${escapeHtml(record.saved.note)}</p>` : '';
    return `
      <span class="tha-care-timing-status ${escapeHtml(record.status.tone)}">${escapeHtml(record.status.label)}</span>
      <strong>Care timing</strong>
      <div class="tha-care-timing-chips"><span>${escapeHtml(record.rule.resource)}</span><span>${escapeHtml(record.rule.cadenceLabel)}</span><span>${escapeHtml(record.dateSource || 'Timing note')}</span></div>
      <p><strong>Last known:</strong> ${escapeHtml(last)}</p>
      <p><strong>Next window:</strong> ${escapeHtml(next)}</p>
      <p><strong>Batching:</strong> ${escapeHtml(record.rule.batch)}</p>
      ${note}
    `;
  }

  function shouldSkip(element){
    return Boolean(
      element.closest?.('.baselineCare,.tha-supporting-builder,.tha-pmr-supporting-output,.tha-care-date-widget,.tha-care-forecast-panel') ||
      element.matches?.('.baselineCare,.tha-supporting-builder,.tha-pmr-supporting-output,.tha-care-date-widget,.tha-care-forecast-panel')
    );
  }

  function injectTiming(element, record){
    if (!element || !record || shouldSkip(element)) return;
    let inline = element.querySelector?.(`:scope > [${INLINE_ATTR}="${record.rule.key}"]`);
    if (!inline) {
      inline = document.createElement('div');
      inline.className = 'tha-care-timing-inline';
      inline.setAttribute(INLINE_ATTR, record.rule.key);
      element.append(inline);
    }
    inline.innerHTML = inlineHtml(record);
  }

  function candidateElements(root = document){
    const selectors = [
      'main.pmr.passWorkspace .passReviewCard',
      'main.pmr.passWorkspace .passCalendarRow:not(.baseline)',
      'main.pmr.passWorkspace .passOutlookCard',
      'main.pmr.passWorkspace .passPlanCategoryGrid > *',
      'main.pmr.passWorkspace .thaTodoBucket > *',
      'main.pmr:not(.passWorkspace) .passCalendarRow:not(.baseline)',
      'main.pmr:not(.passWorkspace) .passOutlookCard',
      'main.pmr:not(.passWorkspace) .passPlanCategoryGrid > *'
    ];
    return Array.from(root.querySelectorAll?.(selectors.join(',')) || [])
      .filter(element => !element.classList?.contains('tha-care-timing-inline'))
      .filter(element => !shouldSkip(element));
  }

  function removeStandalonePanels(){
    document.querySelectorAll('.tha-care-forecast-panel').forEach(panel => panel.remove());
  }

  function run(){
    installStyles();
    removeStandalonePanels();
    const currentRecords = records();
    if (!currentRecords.length) return;
    candidateElements(document).forEach(element => {
      const record = matchingRecord(element, currentRecords);
      if (record) injectTiming(element, record);
    });
  }

  let scheduled = false;
  function scheduleRun(){
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      run();
      window.setTimeout(run, 150);
    });
  }

  function start(){
    run();
    new MutationObserver(scheduleRun).observe(document.body, { childList:true, subtree:true, characterData:true });
    document.addEventListener('input', scheduleRun);
    document.addEventListener('change', scheduleRun);
    window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) scheduleRun(); });
    window.addEventListener('tha:set-view', () => window.setTimeout(run, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();