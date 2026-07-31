(() => {
  const ID = 'tha-v35891-demo3-stable-loader';
  const START_KEY = 'tha-v358-start-active';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  let loading = false;
  let overlay = null;

  const f = (pattern, status, trade, notes, options = {}) => [pattern, {
    status,
    trade,
    notes,
    certainty: options.certainty || (status === 'Immediate Concern' ? 'Clear Path' : 'Likely Path'),
    effort: options.effort || (trade === 'Handyman' ? '45–60 min' : 'Multi-day / trade scope'),
    pace: options.pace || (status === 'Immediate Concern' ? 'Do now' : status === 'Needs Attention' ? 'Plan soon' : 'Budget for later'),
    pmcp: Boolean(options.pmcp),
    thaAction: options.thaAction !== false,
    actionType: options.actionType || (status === 'Monitor' ? 'Follow-up observation' : 'Schedule service')
  }];

  const DEMO3 = [
    {
      room: /^Exterior\b/i,
      overview: ['Trade Attention', 'Broad exterior demo spanning roof, drainage, landscaping, coatings, carpentry, windows, structure, pest, chimney, and irrigation.'],
      items: [
        f(/Roofline visible issues/i, 'Immediate Concern', 'Roof', 'Lifted flashing and displaced shingles warrant prompt roofer review.'),
        f(/Gutters, downspouts, and drainage discharge/i, 'Needs Attention', 'Roof', 'Packed gutters and a disconnected downspout are spilling beside the foundation.', { pmcp: true, effort: '1–2 hrs' }),
        f(/Grading \/ pooling near foundation/i, 'Needs Attention', 'Landscape', 'Negative grade and a persistent low spot direct water toward the house.', { certainty: 'Needs Discovery', actionType: 'Trade consultation' }),
        f(/Exterior paint \/ stain \/ caulk wear/i, 'Monitor', 'Paint', 'Peeling trim and failed caulk expose wood at several joints.', { pmcp: true, actionType: 'Estimate needed' }),
        f(/Siding, trim, fascia, and soffit condition/i, 'Needs Attention', 'Carpentry', 'Soft fascia and an open soffit joint need repair before repainting.', { certainty: 'Needs Discovery', actionType: 'Estimate needed' }),
        f(/Windows and exterior sealant/i, 'Needs Attention', 'Windows', 'One window is fogged and several perimeter joints have failed sealant.', { actionType: 'Trade consultation' }),
        f(/Deck, porch, patio, and railings/i, 'Immediate Concern', 'Carpentry', 'The elevated railing moves significantly and one stair tread is loose.'),
        f(/Visible foundation cracks or movement/i, 'Monitor', 'General Contractor', 'A stepped crack needs measurement and specialist review before repair decisions.', { certainty: 'Needs Discovery', actionType: 'Research' }),
        f(/Pest entry points and exterior gaps/i, 'Needs Attention', 'Pest', 'Rodent evidence and open utility penetrations require exclusion and pest review.'),
        f(/Chimney exterior, cap, crown, and flashing/i, 'Needs Attention', 'Chimney', 'The crown is cracked and flashing shows staining.', { certainty: 'Needs Discovery', pmcp: true, actionType: 'Trade consultation' }),
        f(/Irrigation, sprinklers, hose bibs, and exterior water/i, 'Monitor', 'Landscape', 'A leaking hose bib and overspray are wetting siding and foundation soil.', { pmcp: true })
      ]
    },
    {
      room: /^Kitchen\b/i,
      overview: ['Trade Attention', 'Kitchen demo combines immediate electrical and plumbing findings with appliances, carpentry, flooring, ventilation, and PMCP care.'],
      items: [
        f(/GFCI outlets, outlets, switches, and covers/i, 'Immediate Concern', 'Electrical', 'The kitchen GFCI did not complete a reliable trip/reset test.', { effort: '30 min' }),
        f(/Sink, faucet, sprayer hose, and visible leaks/i, 'Immediate Concern', 'Plumbing', 'An active trap drip is dampening the cabinet floor.', { effort: '45–60 min' }),
        f(/Dishwasher connection and visible leaks/i, 'Needs Attention', 'Appliance', 'Moisture staining appeared at the toe-kick after a cycle.', { certainty: 'Needs Discovery', actionType: 'Trade consultation', effort: '30 min' }),
        f(/Cabinets, drawers, hinges, pulls, and boxes/i, 'Needs Attention', 'Carpentry', 'The sink-base floor is swollen and two doors no longer align.', { actionType: 'Estimate needed', effort: '1–2 hrs' }),
        f(/Range hood \/ exhaust \/ filter/i, 'Monitor', 'Handyman', 'Heavy grease buildup and weak airflow are present; clean and reassess.', { pmcp: true, actionType: 'Client-approved work', effort: '30 min' }),
        f(/Flooring and transitions/i, 'Monitor', 'Flooring', 'Flooring is swollen near the dishwasher; confirm dry-down before repair.', { certainty: 'Needs Discovery', thaAction: false, effort: '1–2 hrs' })
      ]
    },
    {
      room: /^Family Room\b/i,
      overview: ['Watch Item / Worth Watching', 'Living-area demo includes fireplace, electrical, windows, and carpentry follow-up.'],
      items: [
        f(/Fireplace interior, hearth, damper, and gas log area/i, 'Monitor', 'Chimney', 'Service history is unknown and the damper is difficult to operate.', { certainty: 'Needs Discovery', pmcp: true }),
        f(/Outlets, switches, covers, lighting, and ceiling fans/i, 'Needs Attention', 'Electrical', 'One outlet is loose and the ceiling fan has significant wobble.', { effort: '30 min', actionType: 'Trade consultation' }),
        f(/Doors, windows, locks, screens, and hardware/i, 'Monitor', 'Windows', 'The slider is difficult to operate and has failed weatherstripping.', { thaAction: false, effort: '30 min' }),
        f(/Built-ins, shelving, and wall-mounted features/i, 'Needs Attention', 'Carpentry', 'A wall-mounted shelf is loose at one bracket.', { effort: '45–60 min', actionType: 'Client-approved work' })
      ]
    },
    {
      room: /^Bedroom 1\b/i,
      overview: ['Trade Attention', 'Bedroom demo includes egress, electrical, door, flooring, and safety follow-up.'],
      items: [
        f(/Windows, blinds, locks, screens, and seals/i, 'Needs Attention', 'Windows', 'The window does not stay open and may not provide reliable egress.', { certainty: 'Needs Discovery', actionType: 'Trade consultation', effort: '30 min' }),
        f(/Outlets, switches, covers, and lighting/i, 'Monitor', 'Electrical', 'A switch intermittently flickers the overhead light.', { thaAction: false, effort: '30 min' }),
        f(/Doors, hinges, knobs, and latch alignment/i, 'Needs Attention', 'Handyman', 'The door rubs heavily and does not latch.', { effort: '30 min', actionType: 'Client-approved work' }),
        f(/Flooring and transitions/i, 'Monitor', 'Flooring', 'A raised transition creates a trip edge.', { certainty: 'Needs Discovery', thaAction: false, effort: '45–60 min' })
      ]
    },
    {
      room: /^Bathroom 1\b/i,
      overview: ['Trade Attention', 'Bathroom demo combines wet-area maintenance, plumbing, ventilation, electrical, flooring, and concealed-moisture concerns.'],
      items: [
        f(/Tile, grout, caulk, and enclosure joints/i, 'Needs Attention', 'Handyman', 'Multiple shower caulk joints are open and grout is cracked at the curb.', { pmcp: true, actionType: 'Estimate needed', effort: '1–2 hrs' }),
        f(/Toilet function, movement, and leaks/i, 'Needs Attention', 'Plumbing', 'The toilet rocks and staining is present at the base.', { certainty: 'Needs Discovery', effort: '30 min' }),
        f(/Shower \/ tub valve, drain, caulk, and function/i, 'Needs Attention', 'Plumbing', 'The valve drips after shutoff and the drain is slow.', { effort: '45–60 min' }),
        f(/Bath fan \/ ventilation/i, 'Monitor', 'HVAC', 'The fan is noisy and airflow is weak.', { pmcp: true, effort: '30 min' }),
        f(/GFCI, outlets, switches, and covers/i, 'Immediate Concern', 'Electrical', 'The bathroom GFCI did not reset reliably.', { effort: '30 min' }),
        f(/Flooring, transitions, soft spots, mildew signs/i, 'Needs Attention', 'General Contractor', 'A soft area beside the tub needs moisture investigation.', { certainty: 'Needs Discovery', actionType: 'Research' })
      ]
    },
    {
      room: /^Mechanical\b/i,
      overview: ['Trade Attention', 'Mechanical demo includes HVAC, plumbing, electrical, condensate, shutoffs, and lifecycle planning.'],
      items: [
        f(/Furnace filter condition and size/i, 'Needs Attention', 'Handyman', 'The filter is heavily loaded and airflow direction is not marked.', { pmcp: true, effort: '15 min', pace: 'Do now', actionType: 'Client-approved work' }),
        f(/Furnace service history \/ seasonal service/i, 'Needs Attention', 'HVAC', 'Heating equipment is noisy at startup and service history is unknown.', { certainty: 'Needs Discovery', pmcp: true }),
        f(/AC \/ heat pump service history \/ seasonal service/i, 'Monitor', 'HVAC', 'The outdoor coil is dirty and the last cooling-service date is unknown.', { pmcp: true }),
        f(/Water heater age, leak signs, flush\/service history/i, 'Immediate Concern', 'Plumbing', 'Active moisture and corrosion are present at the water-heater base.'),
        f(/Condensate and drain lines/i, 'Needs Attention', 'HVAC', 'The condensate line shows staining and poor support.', { effort: '30 min', actionType: 'Client-approved work' }),
        f(/Main shutoffs and labels if present/i, 'Needs Attention', 'Handyman', 'Emergency shutoffs are accessible but unclear.', { effort: '30 min', actionType: 'Client-approved work' }),
        f(/Electrical panel observation only/i, 'Immediate Concern', 'Electrical', 'Rust staining and a missing cover screw are visible at the panel exterior.')
      ]
    },
    {
      room: /^Laundry\b/i,
      overview: ['Handy Services', 'Laundry demo includes fire-safety maintenance, plumbing risk reduction, electrical follow-up, and moisture clues.'],
      items: [
        f(/Dryer vent, lint path, and duct condition/i, 'Immediate Concern', 'Handyman', 'The duct is crushed with heavy lint accumulation and weak airflow.', { pmcp: true, effort: '45–60 min' }),
        f(/Washer hoses, valves, and visible leaks/i, 'Needs Attention', 'Plumbing', 'Rubber hoses are cracked and one valve is difficult to operate.', { pmcp: true, effort: '30 min' }),
        f(/GFCI, outlets, and appliance power/i, 'Needs Attention', 'Electrical', 'The outlet cover is damaged and the receptacle is loose.', { effort: '30 min' }),
        f(/Paint, drywall, and moisture signs/i, 'Monitor', 'Handyman', 'Wall staining behind the washer may be historic.', { certainty: 'Needs Discovery', thaAction: false, effort: '30 min' })
      ]
    },
    {
      room: /^Safety\b/i,
      overview: ['Trade Attention', 'Life-safety demo includes immediate replacement, annual care, and THA follow-up.'],
      items: [
        f(/Smoke \/ CO detectors/i, 'Immediate Concern', 'Safety', 'Several detector date stamps are expired and one sleeping-area unit is missing.', { pmcp: true, effort: '30 min' }),
        f(/Fire extinguishers/i, 'Needs Attention', 'Safety', 'The only extinguisher is inaccessible and its gauge is not in range.', { pmcp: true, effort: '15 min', actionType: 'Client-approved work' })
      ]
    }
  ];

  const totalSteps = DEMO3.reduce((sum, entry) => sum + entry.items.length + 1, 0);

  function installOverlay() {
    overlay?.remove();
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(246,239,227,.97);display:grid;place-items:center;padding:24px';
    overlay.innerHTML = '<div style="width:min(620px,94vw);background:#fff;border:1px solid #d9cbb4;border-bottom:6px solid #bf8420;border-radius:24px;padding:24px;box-shadow:0 22px 70px rgba(11,54,88,.22);font-family:Inter,Segoe UI,Arial,sans-serif;color:#203040"><h2 style="margin:0 0 10px;color:#0b3658">Comprehensive multi-trade demo</h2><p data-message style="line-height:1.45">Loading the selected walkthrough…</p><div style="height:12px;border-radius:999px;background:#edf3f6;overflow:hidden;margin:18px 0 10px"><span data-bar style="display:block;height:100%;width:0;background:#bf8420;transition:width .2s ease"></span></div><small data-count style="color:#65727d;font-weight:700">Preparing current HTC data</small></div>';
    document.body.append(overlay);
  }

  function progress(message, current = 0) {
    if (!overlay) return;
    overlay.querySelector('[data-message]').textContent = message;
    overlay.querySelector('[data-count]').textContent = `${current} of ${totalSteps} demo findings and room summaries prepared`;
    overlay.querySelector('[data-bar]').style.width = `${Math.min(100, Math.round((current / totalSteps) * 100))}%`;
  }

  function closeOverlay() {
    overlay?.remove();
    overlay = null;
  }

  function setStartActive(active) {
    localStorage.setItem(START_KEY, active ? 'true' : 'false');
    document.querySelector('.app')?.classList.toggle('thaV358StartActive', active);
  }

  function navButton(pattern) {
    return Array.from(document.querySelectorAll('.topbar nav button')).find(button => pattern.test(text(button.textContent))) || null;
  }

  function sourceButton() {
    return Array.from(document.querySelectorAll('.demoScenarioCard .demoScenario')).find(article => /^Demo 3\b/i.test(text(article.querySelector('h4')?.textContent)))?.querySelector('button') || null;
  }

  async function waitFor(getValue, attempts = 70, delay = 100) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const value = getValue();
      if (value) return value;
      await wait(delay);
    }
    return null;
  }

  function setValue(control, value) {
    if (!control || value === undefined || value === null || value === '') return false;
    const prototype = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(control, value); else control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  async function change(control, value, delay = 35) {
    if (setValue(control, value)) await wait(delay);
  }

  function cardFor(pattern) {
    return Array.from(document.querySelectorAll('.checklistItemCard')).find(card => pattern.test(text(card.querySelector('.checklistSummaryMain strong,.expandedItemHead h2')?.textContent))) || null;
  }

  function labeled(card, pattern) {
    return Array.from(card?.querySelectorAll('label') || []).find(label => pattern.test(text(label.textContent)))?.querySelector('select,input,textarea') || null;
  }

  async function updateItem(pattern, data) {
    let card = cardFor(pattern);
    if (!card) return false;
    let summary = card.querySelector('.checklistSummaryRow');
    if (summary?.getAttribute('aria-expanded') !== 'true') {
      summary.click();
      await wait(80);
    }
    card = cardFor(pattern);
    if (!card) return false;

    await change(card.querySelector('.statusControlField select'), data.status);
    card = cardFor(pattern); await change(labeled(card, /^Action Certainty/i), data.certainty);
    card = cardFor(pattern); await change(labeled(card, /^Suggested Trade \/ Resource/i), data.trade);
    card = cardFor(pattern); await change(labeled(card, /^Approx\. Time/i), data.effort);
    card = cardFor(pattern); await change(labeled(card, /^Homeowner Pace/i), data.pace);
    card = cardFor(pattern); await change(card?.querySelector('label.notes textarea'), data.notes, 50);

    card = cardFor(pattern);
    const pmcp = card?.querySelector('.passCandidateToggle input[type="checkbox"]');
    if (pmcp && pmcp.checked !== data.pmcp) { pmcp.click(); await wait(40); }
    card = cardFor(pattern);
    const action = card?.querySelector('.workOrderToggle input[type="checkbox"]');
    if (action && action.checked !== data.thaAction) { action.click(); await wait(40); }
    card = cardFor(pattern);
    if (data.thaAction && data.actionType) await change(card?.querySelector('.thaActionTypeField select'), data.actionType, 40);

    card = cardFor(pattern);
    summary = card?.querySelector('.checklistSummaryRow');
    if (summary?.getAttribute('aria-expanded') === 'true') { summary.click(); await wait(35); }
    return true;
  }

  async function selectRoom(pattern) {
    const button = Array.from(document.querySelectorAll('.roomNav .sectionSelect, .roomNav button')).find(item => pattern.test(text(item.textContent)));
    if (!button) return false;
    button.click();
    await wait(180);
    return Boolean(await waitFor(() => document.querySelector('.checklistItemCard'), 30, 80));
  }

  async function updateOverview(status, note) {
    const toggle = document.querySelector('.roomOverviewSummaryButton');
    if (!toggle) return false;
    if (toggle.getAttribute('aria-expanded') !== 'true') { toggle.click(); await wait(80); }
    await change(document.querySelector('.roomOverviewStatusSelect'), status, 45);
    await change(document.querySelector('.roomOverviewBody label.notes textarea'), note, 55);
    const action = document.querySelector('.roomOverviewBody .workOrderToggle input[type="checkbox"]');
    if (action && !action.checked) { action.click(); await wait(40); }
    await change(document.querySelector('.roomOverviewBody .thaActionTypeField select'), 'Trade consultation', 40);
    if (toggle.getAttribute('aria-expanded') === 'true') { toggle.click(); await wait(35); }
    return true;
  }

  function pmrVisible() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return false;
    const style = getComputedStyle(pmr);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  async function openPmr() {
    progress('Building the PMR from the populated walkthrough…', totalSteps);
    setStartActive(false);
    window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }));
    navButton(/^PMR$/i)?.click();
    if (await waitFor(pmrVisible, 90, 100)) {
      scrollTo({ top: 0, behavior: 'auto' });
      await wait(250);
      closeOverlay();
      return true;
    }
    return false;
  }

  async function runDemo3(button) {
    const nativeButton = sourceButton();
    if (!nativeButton) throw new Error('Demo 3 source unavailable');
    nativeButton.click();
    await wait(350);
    setStartActive(false);
    navButton(/^HTC\b/i)?.click();
    if (!(await waitFor(() => document.querySelector('main.htcPage')))) throw new Error('HTC unavailable');

    let completed = 0;
    for (const entry of DEMO3) {
      progress('Preparing the next home area…', completed);
      if (!(await selectRoom(entry.room))) continue;
      if (await updateOverview(...entry.overview)) completed += 1;
      for (const [pattern, data] of entry.items) {
        if (await updateItem(pattern, data)) completed += 1;
        progress(data.notes, completed);
      }
      await wait(100);
    }

    progress(`Comprehensive walkthrough prepared with ${completed} populated findings and care items.`, totalSteps);
    await wait(300);
    if (!(await openPmr())) throw new Error('PMR unavailable');
    loading = false;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }

  async function failSafely(button) {
    try {
      progress('The detailed preparation was interrupted. Opening the native Demo 3 instead of leaving a blank screen…', totalSteps);
      sourceButton()?.click();
      await wait(350);
      if (!(await openPmr())) {
        setStartActive(false);
        navButton(/^HTC\b/i)?.click();
        await wait(300);
        closeOverlay();
      }
    } finally {
      loading = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.thaV3588DemoButton');
    if (!button || !/^Demo 3\b/i.test(text(button.querySelector('strong')?.textContent))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (loading) return;
    loading = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    installOverlay();
    runDemo3(button).catch(() => failSafely(button));
  }, true);
})();
