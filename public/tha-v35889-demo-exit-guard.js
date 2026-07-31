(() => {
  const ID = 'tha-v35889-demo-exit-guard';
  const START_KEY = 'tha-v358-start-active';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  let loading = false;

  const SCENARIOS = {
    1: {
      minimumUpdates: 12,
      loading: 'Preparing full clean-home demo…',
      rooms: [
        {
          room: /^Exterior\b/i,
          overview: {
            status: 'Looking Good',
            note: 'Clean-home example: the exterior is performing well. Routine seasonal water-management, finish, opening, and roofline care remains documented.',
            pmcp: true
          },
          items: [
            [/Gutters, downspouts, and drainage discharge/i, { status: 'Good', trade: 'Handyman', effort: '1–2 hrs', pace: 'Plan soon', notes: 'Gutters are clear, secure, and discharging away from the foundation. Keep spring and fall cleaning on the care plan.', pmcp: true }],
            [/Exterior paint \/ stain \/ caulk wear/i, { status: 'Good', trade: 'Paint', effort: '1–2 hrs', pace: 'Watchlist only', notes: 'Protective coatings and visible caulk joints are currently intact. Recheck annually for early wear.', pmcp: true }],
            [/Windows and exterior sealant/i, { status: 'Good', trade: 'Windows', effort: '45–60 min', pace: 'Watchlist only', notes: 'Window trim, sealant, screens, and visible drainage paths appear serviceable.' }],
            [/Roofline visible issues/i, { status: 'Good', trade: 'Roof', effort: 'Multi-day / trade scope', pace: 'Watchlist only', notes: 'No obvious roofline concern was visible from the ground. Retain normal seasonal observation.' }]
          ]
        },
        {
          room: /^Kitchen\b/i,
          overview: {
            status: 'Looking Good',
            note: 'Clean, functional kitchen with verified electrical, plumbing, appliance, ventilation, finish, and hardware condition.',
            pmcp: true
          },
          items: [
            [/GFCI outlets, outlets, switches, and covers/i, { status: 'Good', trade: 'Electrical', effort: '30 min', pace: 'Watchlist only', notes: 'Accessible GFCI protection completed the trip/reset check and visible devices appear secure.' }],
            [/Sink, faucet, sprayer hose, and visible leaks/i, { status: 'Good', trade: 'Handyman', effort: '45–60 min', pace: 'Watchlist only', notes: 'Faucet, sprayer, shutoffs, trap, and cabinet floor were dry during operation.' }],
            [/Range hood \/ exhaust \/ filter/i, { status: 'Good', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Fan and light operate normally. Keep filter cleaning in the recurring kitchen-care plan.', pmcp: true }],
            [/Kitchen appliances visible condition and operation/i, { status: 'Good', trade: 'Appliance', effort: '45–60 min', pace: 'Watchlist only', notes: 'Visible appliance condition and basic operation checks did not reveal a current repair concern.' }]
          ]
        },
        {
          room: /^Family Room\b/i,
          overview: {
            status: 'Looking Good',
            note: 'Living-space openings, electrical devices, flooring, finishes, built-ins, and fireplace area are in good working order.'
          },
          items: [
            [/Doors, windows, locks, screens, and hardware/i, { status: 'Good', trade: 'Handyman', effort: '30 min', pace: 'Watchlist only', notes: 'Accessible openings operate and latch normally with no notable draft or failed-seal symptom.' }],
            [/Fireplace interior, hearth, damper, and gas log area/i, { status: 'Good', trade: 'Chimney', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'No active fireplace symptom was observed. Retain annual pre-season inspection/cleaning planning.', pmcp: true }]
          ]
        },
        {
          room: /^Bathroom 1\b/i,
          overview: {
            status: 'Looking Good',
            note: 'Wet-area joints, fixtures, ventilation, electrical protection, flooring, and accessories are currently serviceable.',
            pmcp: true
          },
          items: [
            [/Tile, grout, caulk, and enclosure joints/i, { status: 'Good', trade: 'Handyman', effort: '1–2 hrs', pace: 'Watchlist only', notes: 'Visible grout and caulk joints are intact with no soft surface or active moisture clue.', pmcp: true }],
            [/Bath fan \/ ventilation/i, { status: 'Good', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Bath fan operates with useful airflow. Keep annual cleaning/checking on the care plan.', pmcp: true }],
            [/GFCI, outlets, switches, and covers/i, { status: 'Good', trade: 'Electrical', effort: '30 min', pace: 'Watchlist only', notes: 'Accessible GFCI protection and visible devices appear functional and secure.' }]
          ]
        },
        {
          room: /^Mechanical\b/i,
          overview: {
            status: 'Routine Care / PASS',
            note: 'No active equipment defect is represented. This room demonstrates robust, documented preventative care despite a clean condition.',
            pmcp: true
          },
          items: [
            [/Furnace filter condition and size/i, { status: 'Good', trade: 'Handyman', effort: '15 min', pace: 'Plan soon', notes: 'Filter is clean, correctly oriented, and sized. Continue the established replacement rhythm.', pmcp: true }],
            [/Furnace service history \/ seasonal service/i, { status: 'Good', trade: 'HVAC', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Heating service is current. Retain annual fall HVAC service in the PMCP.', pmcp: true }],
            [/AC \/ heat pump service history \/ seasonal service/i, { status: 'Good', trade: 'HVAC', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Cooling service is current. Retain annual spring HVAC service in the PMCP.', pmcp: true }],
            [/Water heater age, leak signs, flush\/service history/i, { status: 'Good', trade: 'Plumbing', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'No visible leak or venting concern. Keep normal annual plumbing review/service planning.', pmcp: true }],
            [/Main shutoffs and labels if present/i, { status: 'Good', trade: 'Handyman', effort: '30 min', pace: 'Watchlist only', notes: 'Accessible shutoffs are identified, reachable, and clearly labeled.' }]
          ]
        },
        {
          room: /^Laundry\b/i,
          overview: {
            status: 'Looking Good',
            note: 'Laundry plumbing, venting, electrical, finish, storage, and flooring checks are currently satisfactory.',
            pmcp: true
          },
          items: [
            [/Washer hoses, valves, and visible leaks/i, { status: 'Good', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Braided hoses and accessible shutoffs appear dry and serviceable. Continue annual inspection.', pmcp: true }],
            [/Dryer vent, lint path, and duct condition/i, { status: 'Good', trade: 'Handyman', effort: '45–60 min', pace: 'Plan soon', notes: 'Visible ducting is connected and airflow is acceptable. Retain annual dryer-vent cleaning.', pmcp: true }]
          ]
        },
        {
          room: /^Safety\b/i,
          overview: {
            status: 'Routine Care / PASS',
            note: 'Life-safety equipment is present and current; annual testing and date review remain part of continued care.',
            pmcp: true
          },
          items: [
            [/Smoke \/ CO detectors/i, { status: 'Good', trade: 'Safety', effort: '30 min', pace: 'Plan soon', notes: 'Detector placement and visible date information are acceptable for this demonstration. Continue annual testing.', pmcp: true }],
            [/Fire extinguishers/i, { status: 'Good', trade: 'Safety', effort: '15 min', pace: 'Plan soon', notes: 'Extinguishers are accessible and gauges appear in range. Continue annual review.', pmcp: true }]
          ]
        }
      ]
    },
    2: {
      minimumUpdates: 12,
      loading: 'Preparing full older-home planning demo…',
      rooms: [
        {
          room: /^Exterior\b/i,
          overview: {
            status: 'Watch Item / Worth Watching',
            note: 'Older-home exterior with maintenance history gaps, several manageable concerns, and no assumption that age alone is a defect.',
            thaAction: true,
            actionType: 'Follow-up observation'
          },
          items: [
            [/Gutters, downspouts, and drainage discharge/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Roof', effort: '1–2 hrs', pace: 'Plan soon', notes: 'Debris and a short rear downspout extension are allowing discharge close to the foundation. Clean and extend before the next wet season.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/Grading \/ pooling near foundation/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Landscape', effort: 'Multi-day / trade scope', pace: 'Budget for later', notes: 'A shallow low spot is visible near the rear corner. Confirm pooling during rain before committing to drainage work.', thaAction: true, actionType: 'Follow-up observation' }],
            [/Exterior paint \/ stain \/ caulk wear/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Paint', effort: '1–2 hrs', pace: 'Budget for later', notes: 'South-facing trim and several caulk joints show early weathering. Plan selective protection now and a broader finish review later.', pmcp: true, actionType: 'Estimate needed' }],
            [/Windows and exterior sealant/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Windows', effort: '45–60 min', pace: 'Plan soon', notes: 'Two older window joints have drying sealant but no active interior staining. Re-seal and monitor.' }]
          ]
        },
        {
          room: /^Kitchen\b/i,
          overview: {
            status: 'Handy Services',
            note: 'Functional older kitchen with a small group of practical repairs and appliance-maintenance opportunities.'
          },
          items: [
            [/Dishwasher connection and visible leaks/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Appliance', effort: '30 min', pace: 'Plan soon', notes: 'No active leak was seen, though staining at the toe-kick deserves recheck during a full cycle.', thaAction: true, actionType: 'Follow-up observation' }],
            [/Cabinets, drawers, hinges, pulls, and boxes/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '45–60 min', pace: 'Plan soon', notes: 'Two doors are out of alignment and one drawer pull is loose. This is ready for Handy Services.', thaAction: true, actionType: 'Client-approved work' }],
            [/Range hood \/ exhaust \/ filter/i, { status: 'Good', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'The fan operates, while the filter is overdue for cleaning. Keep this as routine PMCP care rather than a defect.', pmcp: true }]
          ]
        },
        {
          room: /^Bedroom 1\b/i,
          overview: {
            status: 'Watch Item / Worth Watching',
            note: 'Comfort and opening issues are present without an urgent safety condition.'
          },
          items: [
            [/Windows, blinds, locks, screens, and seals/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Windows', effort: '30 min', pace: 'Budget for later', notes: 'The window operates and locks, though a noticeable winter draft was homeowner-reported. Start with weatherstripping and reassess.' }],
            [/Doors, hinges, knobs, and latch alignment/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'The bedroom door rubs at the upper corner and the latch misses the strike.', thaAction: true, actionType: 'Client-approved work' }]
          ]
        },
        {
          room: /^Bathroom 1\b/i,
          overview: {
            status: 'Handy Services',
            note: 'Typical older-bath maintenance: failing wet-area sealant, weak ventilation, and no confirmed concealed damage.'
          },
          items: [
            [/Tile, grout, caulk, and enclosure joints/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '1–2 hrs', pace: 'Plan soon', notes: 'Tub surround caulk is splitting at two corners. Remove and renew before moisture reaches the backing.', pmcp: true, thaAction: true, actionType: 'Estimate needed' }],
            [/Bath fan \/ ventilation/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Fan operates loudly with modest airflow. Clean first, then reassess replacement or duct evaluation.', pmcp: true, actionType: 'Follow-up observation' }],
            [/Toilet function, movement, and leaks/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Plumbing', effort: '30 min', pace: 'Plan soon', notes: 'No active leak was seen, though slight base movement needs confirmation before tightening or flange work.' }]
          ]
        },
        {
          room: /^Mechanical\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Unknown service history is separated from confirmed condition. Several systems need baseline trade review rather than automatic replacement.',
            thaAction: true,
            actionType: 'Trade consultation',
            pmcp: true
          },
          items: [
            [/Furnace filter condition and size/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '15 min', pace: 'Do now', notes: 'Filter is heavily loaded and its replacement date is unknown. Replace now and establish the correct cadence.', pmcp: true, thaAction: true, actionType: 'Client-approved work' }],
            [/Furnace service history \/ seasonal service/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'HVAC', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'No current service sticker or records were found. Schedule baseline HVAC service without labeling the system defective.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/Water heater age, leak signs, flush\/service history/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Plumbing', effort: 'Multi-day / trade scope', pace: 'Budget for later', notes: 'Age and flush history are uncertain. No active leak is visible; use a plumbing review to establish condition and replacement planning.', pmcp: true, thaAction: true, actionType: 'Trade consultation' }],
            [/Main shutoffs and labels if present/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Main water shutoff is accessible but not labeled. Add a durable emergency label.', thaAction: true, actionType: 'Client-approved work' }]
          ]
        },
        {
          room: /^Laundry\b/i,
          overview: {
            status: 'Watch Item / Worth Watching',
            note: 'Laundry is operating, with overdue risk-reduction maintenance and one material upgrade recommendation.'
          },
          items: [
            [/Washer hoses, valves, and visible leaks/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Older rubber supply hoses remain in place. Replace with braided lines and verify shutoff operation.', pmcp: true, thaAction: true, actionType: 'Estimate needed' }],
            [/Dryer vent, lint path, and duct condition/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Handyman', effort: '45–60 min', pace: 'Plan soon', notes: 'Airflow is present but service history is unknown. Schedule a baseline cleaning and document the route.', pmcp: true, thaAction: true, actionType: 'Schedule service' }]
          ]
        },
        {
          room: /^Safety\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Safety review identifies outdated equipment without implying a whole-home emergency.',
            pmcp: true
          },
          items: [
            [/Smoke \/ CO detectors/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Safety', effort: '30 min', pace: 'Do now', notes: 'Two visible detector date stamps are beyond the normal replacement window. Replace and document all units.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/Fire extinguishers/i, { status: 'Good', trade: 'Safety', effort: '15 min', pace: 'Plan soon', notes: 'One accessible extinguisher is in range. Add annual gauge/date review to the PMCP.', pmcp: true }]
          ]
        }
      ]
    },
    3: {
      minimumUpdates: 22,
      loading: 'Preparing full multi-trade PMR demo…',
      rooms: [
        {
          room: /^Exterior\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Comprehensive multi-trade exterior example spanning roof, drainage, coatings, carpentry, windows, structure, pest exclusion, chimney, irrigation, and safety.',
            thaAction: true,
            actionType: 'Trade consultation'
          },
          items: [
            [/Roofline visible issues/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Roof', effort: 'Multi-day / trade scope', pace: 'Do now', notes: 'A lifted shingle edge and displaced flashing are visible above the rear addition. Roofer evaluation and weatherproofing are the immediate next step.', thaAction: true, actionType: 'Schedule service' }],
            [/Gutters, downspouts, and drainage discharge/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Roof', effort: '1–2 hrs', pace: 'Plan soon', notes: 'Front gutter is pulling at one end and two downspouts discharge beside the foundation. Repair, clean, and extend.', pmcp: true, thaAction: true, actionType: 'Estimate needed' }],
            [/Grading \/ pooling near foundation/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'Landscape', effort: 'Multi-day / trade scope', pace: 'Budget for later', notes: 'Negative slope and a defined pooling area are present near the northwest corner. Confirm drainage path and develop a landscape/drainage solution.', thaAction: true, actionType: 'Trade consultation' }],
            [/Exterior paint \/ stain \/ caulk wear/i, { status: 'Needs Attention', certainty: 'Likely Path', trade: 'Paint', effort: 'Multi-day / trade scope', pace: 'Budget for later', notes: 'Peeling trim paint, open end-grain, and failed caulk are allowing weather exposure. Scope protective preparation and repainting.', pmcp: true, thaAction: true, actionType: 'Estimate needed' }],
            [/Siding, trim, fascia, and soffit condition/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'Carpentry', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Localized trim softness and an open soffit joint may involve concealed deterioration. Carpentry discovery is needed before final pricing.', thaAction: true, actionType: 'Trade consultation' }],
            [/Windows and exterior sealant/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Windows', effort: '45–60 min', pace: 'Budget for later', notes: 'One insulated unit is fogged and several exterior joints are drying. Separate sealant maintenance from future glass/window replacement planning.' }],
            [/Deck, porch, patio, and railings/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Carpentry', effort: 'Multi-day / trade scope', pace: 'Do now', notes: 'The upper deck guardrail has excessive movement at a corner post. Restrict use at that section and secure or rebuild the connection.', thaAction: true, actionType: 'Schedule service' }],
            [/Visible foundation cracks or movement/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'General Contractor', effort: 'Multi-day / trade scope', pace: 'Budget for later', notes: 'A stepped masonry crack and prior patching are visible. Document movement and obtain structural/foundation input before prescribing repair.', thaAction: true, actionType: 'Research' }],
            [/Pest entry points and exterior gaps/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Pest', effort: '45–60 min', pace: 'Plan soon', notes: 'Rodent-sized gaps are visible at two utility penetrations with nearby nesting material. Coordinate exclusion and pest review.', thaAction: true, actionType: 'Schedule service' }],
            [/Chimney exterior, cap, crown, and flashing/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Chimney', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Crown cracking and staining are visible from the ground. Schedule chimney/masonry review before fall fireplace use.', pmcp: true, thaAction: true, actionType: 'Trade consultation' }],
            [/Irrigation, sprinklers, hose bibs, and exterior water/i, { status: 'Needs Attention', certainty: 'Likely Path', trade: 'Landscape', effort: '45–60 min', pace: 'Plan soon', notes: 'A hose bib drips under pressure and one irrigation zone oversprays siding. Repair the bib and adjust the irrigation pattern.', thaAction: true, actionType: 'Estimate needed' }]
          ]
        },
        {
          room: /^Kitchen\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Kitchen demonstrates simultaneous electrical, plumbing, appliance, cabinetry, ventilation, flooring, and Handy Services findings.',
            thaAction: true,
            actionType: 'Trade consultation'
          },
          items: [
            [/GFCI outlets, outlets, switches, and covers/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Electrical', effort: '30 min', pace: 'Do now', notes: 'The sink-side GFCI did not complete the trip/reset test. Licensed electrical review is required.', thaAction: true, actionType: 'Schedule service' }],
            [/Sink, faucet, sprayer hose, and visible leaks/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Plumbing', effort: '45–60 min', pace: 'Do now', notes: 'An active drip is present at the trap connection and the cabinet floor is damp. Stop the leak and dry the cabinet area.', thaAction: true, actionType: 'Schedule service' }],
            [/Dishwasher connection and visible leaks/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'Appliance', effort: '30 min', pace: 'Plan soon', notes: 'Moisture staining is visible at the toe-kick after a cycle. Determine whether the source is appliance, supply, or drain routing.', thaAction: true, actionType: 'Trade consultation' }],
            [/Cabinets, drawers, hinges, pulls, and boxes/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Carpentry', effort: '1–2 hrs', pace: 'Plan soon', notes: 'The sink-base floor is swollen and two doors no longer align. Stabilize after the plumbing source is corrected.', thaAction: true, actionType: 'Estimate needed' }],
            [/Range hood \/ exhaust \/ filter/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Heavy grease buildup and weak airflow are present. Clean first and reassess fan or duct performance.', pmcp: true, thaAction: true, actionType: 'Client-approved work' }],
            [/Flooring and transitions/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Flooring', effort: '1–2 hrs', pace: 'Budget for later', notes: 'Flooring is swollen near the dishwasher. Confirm the moisture source and dry-down before repair pricing.' }]
          ]
        },
        {
          room: /^Family Room\b/i,
          overview: {
            status: 'Watch Item / Worth Watching',
            note: 'Living area shows fireplace, electrical, opening, built-in, finish, and flooring examples.'
          },
          items: [
            [/Fireplace interior, hearth, damper, and gas log area/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Chimney', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Service history is unknown and the damper is difficult to operate. Schedule inspection/cleaning before use.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/Outlets, switches, covers, lighting, and ceiling fans/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Electrical', effort: '30 min', pace: 'Plan soon', notes: 'One outlet is loose in the wall and the ceiling fan has significant wobble. Secure the device and evaluate the fan mounting.', thaAction: true, actionType: 'Trade consultation' }],
            [/Doors, windows, locks, screens, and hardware/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Windows', effort: '30 min', pace: 'Budget for later', notes: 'The slider is difficult to operate and shows failed weatherstripping. Start with adjustment and seal replacement.' }],
            [/Built-ins, shelving, and wall-mounted features/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Carpentry', effort: '45–60 min', pace: 'Plan soon', notes: 'A wall-mounted shelf is loose at one bracket. Re-anchor before continued loading.', thaAction: true, actionType: 'Client-approved work' }]
          ]
        },
        {
          room: /^Bedroom 1\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Bedroom demonstrates egress/opening, electrical, door, flooring, and life-safety follow-up.'
          },
          items: [
            [/Windows, blinds, locks, screens, and seals/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'Windows', effort: '30 min', pace: 'Plan soon', notes: 'The window does not stay open and may not provide reliable egress. Window specialist review is needed.', thaAction: true, actionType: 'Trade consultation' }],
            [/Outlets, switches, covers, and lighting/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Electrical', effort: '30 min', pace: 'Plan soon', notes: 'A switch intermittently flickers the overhead light. Document and include in the electrical visit.' }],
            [/Doors, hinges, knobs, and latch alignment/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Door rubs heavily and does not latch. Adjust hinges and strike alignment.', thaAction: true, actionType: 'Client-approved work' }],
            [/Flooring and transitions/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Flooring', effort: '45–60 min', pace: 'Budget for later', notes: 'A raised transition creates a minor trip edge. Confirm substrate condition before replacement.' }]
          ]
        },
        {
          room: /^Bathroom 1\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Bathroom combines wet-area maintenance, plumbing, ventilation, electrical, flooring, and possible concealed moisture.',
            thaAction: true,
            actionType: 'Trade consultation'
          },
          items: [
            [/Tile, grout, caulk, and enclosure joints/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '1–2 hrs', pace: 'Plan soon', notes: 'Multiple shower caulk joints are open and grout is cracked at the curb. Renew sealant after confirming surfaces are dry.', pmcp: true, thaAction: true, actionType: 'Estimate needed' }],
            [/Toilet function, movement, and leaks/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'Plumbing', effort: '30 min', pace: 'Plan soon', notes: 'The toilet rocks and staining is present at the base. Confirm flange, seal, and subfloor condition.', thaAction: true, actionType: 'Schedule service' }],
            [/Shower \/ tub valve, drain, caulk, and function/i, { status: 'Needs Attention', certainty: 'Likely Path', trade: 'Plumbing', effort: '45–60 min', pace: 'Plan soon', notes: 'The valve drips after shutoff and the drain is slow. Plumbing service is the likely path.', thaAction: true, actionType: 'Schedule service' }],
            [/Bath fan \/ ventilation/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'HVAC', effort: '30 min', pace: 'Plan soon', notes: 'Fan is noisy and airflow is weak. Clean and verify termination before deciding on replacement.', pmcp: true, actionType: 'Follow-up observation' }],
            [/GFCI, outlets, switches, and covers/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Electrical', effort: '30 min', pace: 'Do now', notes: 'Bathroom GFCI did not reset reliably. Add to the immediate electrical scope.', thaAction: true, actionType: 'Schedule service' }],
            [/Flooring, transitions, soft spots, mildew signs/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'General Contractor', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'A soft area is present beside the tub. Determine moisture extent before finish repair.', thaAction: true, actionType: 'Research' }]
          ]
        },
        {
          room: /^Mechanical\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Mechanical room demonstrates HVAC, plumbing, electrical, condensate, emergency shutoff, and lifecycle planning.',
            thaAction: true,
            actionType: 'Trade consultation',
            pmcp: true
          },
          items: [
            [/Furnace filter condition and size/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '15 min', pace: 'Do now', notes: 'Filter is heavily loaded and airflow direction is not marked. Replace and document size/orientation.', pmcp: true, thaAction: true, actionType: 'Client-approved work' }],
            [/Furnace service history \/ seasonal service/i, { status: 'Needs Attention', certainty: 'Needs Discovery', trade: 'HVAC', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Heating equipment is noisy at startup and service history is unknown. Schedule diagnostic seasonal service.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/AC \/ heat pump service history \/ seasonal service/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'HVAC', effort: 'Multi-day / trade scope', pace: 'Plan soon', notes: 'Outdoor coil is dirty and the last cooling service date is unknown. Schedule spring service.', pmcp: true, actionType: 'Schedule service' }],
            [/Water heater age, leak signs, flush\/service history/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Plumbing', effort: 'Multi-day / trade scope', pace: 'Do now', notes: 'Active moisture and corrosion are present at the water-heater base. Plumber evaluation is immediate.', thaAction: true, actionType: 'Schedule service' }],
            [/Condensate and drain lines/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'HVAC', effort: '30 min', pace: 'Plan soon', notes: 'Condensate line shows staining and poor support. Clean, secure, and verify drainage.', thaAction: true, actionType: 'Client-approved work' }],
            [/Main shutoffs and labels if present/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Emergency shutoffs are accessible but unclear. Label water, gas, and electrical controls.', thaAction: true, actionType: 'Client-approved work' }],
            [/Electrical panel observation only/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Electrical', effort: 'Multi-day / trade scope', pace: 'Do now', notes: 'Rust staining and a missing cover screw are visible at the panel exterior. Licensed electrical safety review is required.', thaAction: true, actionType: 'Schedule service' }]
          ]
        },
        {
          room: /^Laundry\b/i,
          overview: {
            status: 'Handy Services',
            note: 'Laundry includes fire-safety maintenance, plumbing risk reduction, electrical follow-up, moisture clues, and flooring.',
            thaAction: true,
            actionType: 'Estimate needed'
          },
          items: [
            [/Dryer vent, lint path, and duct condition/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Handyman', effort: '45–60 min', pace: 'Do now', notes: 'The duct is crushed behind the dryer with heavy lint accumulation and weak airflow. Correct before continued normal use.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/Washer hoses, valves, and visible leaks/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Plumbing', effort: '30 min', pace: 'Plan soon', notes: 'Rubber hoses are cracked at the fittings and one valve is difficult to operate. Replace hoses and evaluate the valve.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/GFCI, outlets, and appliance power/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Electrical', effort: '30 min', pace: 'Plan soon', notes: 'Outlet cover is damaged and the receptacle is loose. Include in the electrical scope.', thaAction: true, actionType: 'Schedule service' }],
            [/Paint, drywall, and moisture signs/i, { status: 'Monitor', certainty: 'Needs Discovery', trade: 'Handyman', effort: '30 min', pace: 'Plan soon', notes: 'Wall staining behind the washer may be historic. Recheck after plumbing work and moisture testing.' }],
            [/Flooring and transitions/i, { status: 'Monitor', certainty: 'Likely Path', trade: 'Flooring', effort: '30 min', pace: 'Budget for later', notes: 'A transition is loose and the adjacent flooring is stained. Secure after leak risk is addressed.' }]
          ]
        },
        {
          room: /^Safety\b/i,
          overview: {
            status: 'Trade Attention',
            note: 'Life-safety equipment demonstrates immediate replacement, annual PMCP care, and coordinated THA follow-up.',
            thaAction: true,
            actionType: 'Schedule service',
            pmcp: true
          },
          items: [
            [/Smoke \/ CO detectors/i, { status: 'Immediate Concern', certainty: 'Clear Path', trade: 'Safety', effort: '30 min', pace: 'Do now', notes: 'Several detector date stamps are expired and one sleeping-area unit is missing. Replace and document the full set.', pmcp: true, thaAction: true, actionType: 'Schedule service' }],
            [/Fire extinguishers/i, { status: 'Needs Attention', certainty: 'Clear Path', trade: 'Safety', effort: '15 min', pace: 'Plan soon', notes: 'The only extinguisher is inaccessible and the gauge is not in range. Replace and place accessible units.', pmcp: true, thaAction: true, actionType: 'Client-approved work' }]
          ]
        }
      ]
    }
  };

  function demoSourceButton(title) {
    return Array.from(document.querySelectorAll('.demoScenarioCard .demoScenario'))
      .find(article => text(article.querySelector('h4')?.textContent) === title)
      ?.querySelector('button') || null;
  }

  function scenarioNumber(title) {
    const match = text(title).match(/^Demo\s+([123])\b/i);
    return match ? Number(match[1]) : 0;
  }

  function setStartActive(active) {
    localStorage.setItem(START_KEY, active ? 'true' : 'false');
    document.querySelector('.app')?.classList.toggle('thaV358StartActive', active);
  }

  function navButton(pattern) {
    return Array.from(document.querySelectorAll('.topbar nav button'))
      .find(button => pattern.test(text(button.textContent))) || null;
  }

  function pmrNavButton() {
    return navButton(/^PMR$/i);
  }

  function pmrIsVisible() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return false;
    const style = window.getComputedStyle(pmr);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  async function waitFor(getValue, attempts = 50, delay = 100) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const value = getValue();
      if (value) return value;
      await wait(delay);
    }
    return null;
  }

  function restoreTriggerButton(triggerButton) {
    if (!triggerButton) return;
    triggerButton.disabled = false;
    triggerButton.removeAttribute('aria-busy');
    const copy = triggerButton.querySelector('small');
    if (copy?.dataset.loadingCopy) {
      copy.textContent = copy.dataset.loadingCopy;
      delete copy.dataset.loadingCopy;
    }
  }

  function setLoadingCopy(triggerButton, message) {
    const copy = triggerButton?.querySelector('small');
    if (!copy) return;
    if (!copy.dataset.loadingCopy) copy.dataset.loadingCopy = copy.textContent || '';
    copy.textContent = message;
  }

  function setNativeValue(control, value) {
    if (!control) return false;
    const prototype = control instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : control instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(control, value);
    else control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function cardFor(pattern) {
    return Array.from(document.querySelectorAll('.checklistItemCard')).find(card => {
      const heading = card.querySelector('.checklistSummaryMain strong,.expandedItemHead h2');
      return pattern.test(text(heading?.textContent));
    }) || null;
  }

  async function ensureCardOpen(pattern) {
    let card = cardFor(pattern);
    if (!card) return null;
    const summary = card.querySelector('.checklistSummaryRow');
    if (summary?.getAttribute('aria-expanded') !== 'true') {
      summary?.click();
      await wait(70);
      card = cardFor(pattern);
    }
    return card;
  }

  function labeledControl(card, pattern, selector = 'select,input,textarea') {
    const label = Array.from(card?.querySelectorAll('label') || []).find(item => pattern.test(text(item.textContent)));
    return label?.querySelector(selector) || null;
  }

  async function updateChecklistItem(pattern, updates = {}) {
    let card = await ensureCardOpen(pattern);
    if (!card) return false;

    // Apply the ordinary controlled fields together. React's functional state
    // updates retain each change while avoiding a long delay between every field.
    if (updates.status) setNativeValue(card.querySelector('.statusControlField select'), updates.status);
    if (updates.certainty) setNativeValue(labeledControl(card, /^Action Certainty/i, 'select'), updates.certainty);
    if (updates.trade) setNativeValue(labeledControl(card, /^Suggested Trade \/ Resource/i, 'select'), updates.trade);
    if (updates.effort) setNativeValue(labeledControl(card, /^Approx\. Time/i, 'select'), updates.effort);
    if (updates.pace) setNativeValue(labeledControl(card, /^Homeowner Pace/i, 'select'), updates.pace);
    if (updates.notes) setNativeValue(card.querySelector('label.notes textarea'), updates.notes);
    await wait(35);

    card = cardFor(pattern);
    if (!card) return false;
    if (typeof updates.pmcp === 'boolean') {
      const checkbox = card.querySelector('.passCandidateToggle input[type="checkbox"]');
      if (checkbox && checkbox.checked !== updates.pmcp) checkbox.click();
      await wait(30);
    }

    card = cardFor(pattern);
    if (!card) return false;
    if (typeof updates.thaAction === 'boolean') {
      const checkbox = card.querySelector('.workOrderToggle input[type="checkbox"]');
      if (checkbox && checkbox.checked !== updates.thaAction) checkbox.click();
      await wait(30);
    }

    card = cardFor(pattern);
    if (!card) return false;
    if (updates.actionType) {
      setNativeValue(card.querySelector('.thaActionTypeField select'), updates.actionType);
      await wait(30);
    }
    return true;
  }

  async function selectRoom(pattern) {
    const button = Array.from(document.querySelectorAll('.roomNav .sectionSelect, .roomNav button'))
      .find(option => pattern.test(text(option.textContent)));
    if (!button) return false;
    button.click();
    await wait(130);
    await waitFor(() => document.querySelector('.checklistItemCard'), 25, 80);
    const openAll = Array.from(document.querySelectorAll('.checklistToolbar button'))
      .find(option => /^Open All/i.test(text(option.textContent)));
    openAll?.click();
    await wait(100);
    return true;
  }

  async function updateRoomOverview(config = {}) {
    const toggle = document.querySelector('.roomOverviewSummaryButton');
    if (!toggle) return false;
    if (toggle.getAttribute('aria-expanded') !== 'true') {
      toggle.click();
      await wait(65);
    }

    if (config.status) setNativeValue(document.querySelector('.roomOverviewStatusSelect'), config.status);
    await wait(45);
    if (config.note) setNativeValue(document.querySelector('.roomOverviewBody label.notes textarea'), config.note);
    await wait(45);

    if (typeof config.pmcp === 'boolean') {
      const checkbox = document.querySelector('.roomOverviewBody .passCandidateToggle input[type="checkbox"]');
      if (checkbox && checkbox.checked !== config.pmcp) checkbox.click();
      await wait(45);
    }
    if (typeof config.thaAction === 'boolean') {
      const checkbox = document.querySelector('.roomOverviewBody .workOrderToggle input[type="checkbox"]');
      if (checkbox && checkbox.checked !== config.thaAction) checkbox.click();
      await wait(45);
    }
    if (config.actionType) {
      setNativeValue(document.querySelector('.roomOverviewBody .thaActionTypeField select'), config.actionType);
      await wait(45);
    }
    return true;
  }

  async function prepareScenario(sourceButton, scenario, triggerButton) {
    setLoadingCopy(triggerButton, scenario.loading);
    sourceButton.click();

    setStartActive(false);
    await wait(260);
    navButton(/^HTC\b/i)?.click();
    const htc = await waitFor(() => document.querySelector('main.htcPage'));
    if (!htc) {
      openPmr(0, triggerButton);
      return;
    }

    let updated = 0;
    for (const room of scenario.rooms) {
      if (!(await selectRoom(room.room))) continue;
      if (room.overview && await updateRoomOverview(room.overview)) updated += 1;
      for (const [pattern, changes] of room.items) {
        if (await updateChecklistItem(pattern, changes)) updated += 1;
      }
    }

    setLoadingCopy(
      triggerButton,
      updated >= scenario.minimumUpdates
        ? `Opening comprehensive PMR with ${updated} populated demo areas…`
        : `Opening PMR with ${updated} populated areas; some optional demo controls were unavailable…`
    );
    await wait(180);
    openPmr(0, triggerButton);
  }

  function openPmr(attempt = 0, triggerButton = null) {
    setStartActive(false);
    window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }));

    if (!pmrIsVisible()) pmrNavButton()?.click();

    window.requestAnimationFrame(() => {
      setStartActive(false);
      if (pmrIsVisible()) {
        loading = false;
        restoreTriggerButton(triggerButton);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (attempt < 50) {
        window.setTimeout(() => openPmr(attempt + 1, triggerButton), 100);
        return;
      }

      loading = false;
      setStartActive(true);
      restoreTriggerButton(triggerButton);
      const copy = triggerButton?.querySelector('small');
      if (copy) copy.textContent = 'Demo did not finish loading. Select it again.';
    });
  }

  function refreshDemoDescriptions() {
    const descriptions = {
      1: 'Full clean-home example: verified-good conditions across every major area, robust preventative-care planning, and zero repair findings.',
      2: 'Full older-home example: unknown history, moderate findings, monitoring, trade follow-up, preventative care, and THA action planning.',
      3: 'Full current HTC controls example: broad Immediate, Near-Term, and Monitor findings across exterior, structure, electrical, plumbing, HVAC, safety, appliances, Handy Services, and more.'
    };
    document.querySelectorAll('.thaV3588DemoButton').forEach(button => {
      const number = scenarioNumber(button.querySelector('strong')?.textContent);
      const copy = button.querySelector('small');
      if (copy && descriptions[number] && !copy.dataset.loadingCopy && text(copy.textContent) !== descriptions[number]) {
        copy.textContent = descriptions[number];
      }
    });
  }

  document.addEventListener('click', event => {
    const triggerButton = event.target.closest('.thaV3588DemoButton');
    if (!triggerButton) return;
    if (loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const title = text(triggerButton.querySelector('strong')?.textContent);
    const number = scenarioNumber(title);
    const scenario = SCENARIOS[number];
    const sourceButton = demoSourceButton(title);
    if (!scenario || !sourceButton) return;

    loading = true;
    triggerButton.disabled = true;
    triggerButton.setAttribute('aria-busy', 'true');
    setLoadingCopy(triggerButton, 'Loading demo walkthrough…');

    prepareScenario(sourceButton, scenario, triggerButton).catch(() => {
      // The native source scenario has already loaded. Open it rather than
      // redirecting to another demo or stranding the operator on Start.
      setLoadingCopy(triggerButton, 'Opening the native demo after an optional enrichment step was interrupted…');
      openPmr(0, triggerButton);
    });
  }, true);

  refreshDemoDescriptions();
  window.addEventListener('load', refreshDemoDescriptions);
  new MutationObserver(refreshDemoDescriptions).observe(document.documentElement, { childList: true, subtree: true });
})();