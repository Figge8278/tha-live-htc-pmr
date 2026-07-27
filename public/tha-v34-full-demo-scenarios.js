(() => {
  const STYLE_ID = 'tha-v34-full-demo-scenarios-styles';
  const SESSIONS_KEY = 'tha-walkthrough-sessions';
  const PENDING_KEY = 'tha:v34:pending-demo-session-id';
  const CONTROLS_COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function answer({
    status = 'Good', trade = 'Handyman', effort = 'Unknown', notes = '', addToPmcpBuilder = false,
    passCadence = '', passResource = '', passFollowUpStatus = 'Not Scheduled', passNote = '',
    reviewStatus = '', actionCertainty = 'Likely Path', pref = 'Plan soon', thaActionItem = false,
    thaActionType = 'Unknown'
  } = {}) {
    return {
      status, trade, effort, notes, addToPmcpBuilder, passCandidate: addToPmcpBuilder,
      passTargetWindow: '', passCadence, passResource, passFollowUpStatus, passNote,
      reviewStatus, actionCertainty, pref, thaActionItem, thaActionType,
      photos: [], photoRef: '', reassignTo: ''
    };
  }

  function room({ status = 'Looking Good', note = '', addToPmcpBuilder = false, thaActionItem = false, thaActionType = 'Unknown', items = [] } = {}) {
    return { status, note, addToPmcpBuilder, thaActionItem, thaActionType, photos: [], items };
  }

  const dynamicRooms = [
    { id: 'default-living-room-1', roomType: 'Living / Family Rooms', roomName: 'Family Room' },
    { id: 'demo-living-room-2', roomType: 'Living / Family Rooms', roomName: 'Basement Rec Room' },
    { id: 'demo-office-1', roomType: 'Living / Family Rooms', roomName: 'Home Office' },
    { id: 'default-bedroom-1', roomType: 'Bedrooms', roomName: 'Primary Bedroom' },
    { id: 'demo-bedroom-2', roomType: 'Bedrooms', roomName: 'Guest Bedroom' },
    { id: 'demo-bedroom-3', roomType: 'Bedrooms', roomName: 'Kids Bedroom' },
    { id: 'default-bathroom-1', roomType: 'Bathrooms', roomName: 'Hall Bathroom' },
    { id: 'demo-bathroom-2', roomType: 'Bathrooms', roomName: 'Primary Bathroom' },
    { id: 'demo-powder-bath-1', roomType: 'Bathrooms', roomName: 'Powder Bath' }
  ];

  const sectionOrder = ['Exterior', 'Kitchen', 'Laundry', 'Mechanical', 'Safety', 'Living / Family Rooms', 'Bedrooms', 'Bathrooms'];

  function intake(overrides = {}) {
    return {
      intakeId: '', intakeStatus: 'Imported / Entered', importedRawResponse: 'Full-system V3.4 demo intake context loaded from Advanced demo scenario.', importedUnmappedNotes: '',
      notes: '', priorityAreas: '', doNotOverlook: '',
      knownIssues: {
        leaksMoisture: '', slowDrainsPlumbing: '', electricalConcerns: '', comfortIssues: '', stickyOpeningsDrafts: '', pestActivity: '', drainageGrading: '', odorsNoisesAppliances: '', otherRecurringSymptoms: ''
      },
      recentRepairs: {
        furnaceService: '', acHeatPumpService: '', airDuctsCleaned: '', chimneyFireplaceService: '', waterHeaterService: '', roofRepairedReplaced: '', exteriorPaintStain: '', windowsDoorsRepairedReplaced: '', otherMaintenanceHistory: ''
      },
      helpfulRecords: {
        recentInspectionReport: '', roofPaperwork: '', sewerPlumbingRecords: '', solarDocuments: '', paintColorRecords: '', otherHelpfulRecords: ''
      },
      accessNotes: {
        pets: '', gatesKeysLockedAreas: '', atticCrawlBasementMechanical: '', detachedGarageShedOutbuildings: '', areasBlockedByStorage: '', fragileSensitiveOffLimits: ''
      },
      electricalPanel: '', electricalUpdates: '', solar: '', waterShutoff: '', plumbingHistory: '', waterHeater: '', sewerIrrigation: '', hvacFilter: '', hvacService: '', hvacAcService: '', comfort: '', roofAge: '', roofHistory: '', drainagePooling: '', drainageHistory: '', gutters: '', windowsDoors: '', fogging: '', paintStain: '', productsColors: '', pests: '', fireExtinguishers: '', smokeCO: '', chimney: '', additionalConcerns: '',
      ...overrides
    };
  }

  function baseData({ client, intakeData, answers, roomCapture, passReview, pinnedItems = {}, itemOrder = {}, sectionOrderState = [] }) {
    return {
      client,
      intake: intake(intakeData),
      answers,
      dynamicRooms,
      sectionOrder: sectionOrderState,
      itemOrder,
      pinnedItems,
      roomCapture,
      passReview,
      roomOverviewExpandedByRoom: {
        Exterior: true, Kitchen: true, Laundry: true, Mechanical: true, Safety: true,
        'default-living-room-1': true, 'demo-living-room-2': true, 'demo-office-1': true,
        'default-bedroom-1': true, 'demo-bedroom-2': true, 'demo-bedroom-3': true,
        'default-bathroom-1': true, 'demo-bathroom-2': true, 'demo-powder-bath-1': true
      },
      smartPromptExpandedByRoom: {},
      expandedChecklistItems: {}
    };
  }

  const DEMOS = [
    {
      id: 'v34-full-demo-1',
      title: 'Demo 1 — Full Workflow / Clean Home + PASS',
      description: 'Tests intake, field prep, HTC room review, extra rooms, selected PASS care, and PMR reporting with no major repair findings.',
      checks: ['Homeowner Intake and Field Prep are populated.', 'HTC includes static rooms plus extra living, bedroom, and bathroom rooms.', 'PASS shows selected routine care even with clean PMR counts.', 'PMR reports PASS/PMCP care separately from repair findings.'],
      data: baseData({
        client: { name: 'Demo 1 Client — Clean PASS Home', address: '101 Full-System Lane, Boulder, CO', date: 'Demo 1 — Intake + HTC + PASS + PMR' },
        intakeData: {
          notes: 'Homeowner wants a full baseline walkthrough and a practical ongoing care calendar. No active repair concerns reported.',
          priorityAreas: 'Mechanical room, dryer vent, gutters, kitchen appliances, safety devices, and extra bedrooms/bathrooms.',
          doNotOverlook: 'Please do not overlook the basement rec room and the powder bath.',
          knownIssues: { comfortIssues: 'Guest bedroom can run slightly cool in winter.', drainageGrading: 'Back downspout area should be watched during spring runoff.', stickyOpeningsDrafts: 'Powder bath door rubs lightly only in humid weather.' },
          recentRepairs: { furnaceService: 'Serviced March 2026.', acHeatPumpService: 'A/C checked May 2026.', waterHeaterService: 'Flushed August 2025.', roofRepairedReplaced: 'Roof replaced 2021.', exteriorPaintStain: 'Exterior painted 2024.', otherMaintenanceHistory: 'Dryer vent cleaned fall 2025; gutters cleaned spring 2026.' },
          helpfulRecords: { roofPaperwork: 'Roof warranty PDF available.', paintColorRecords: 'Paint cans and colors stored in garage.', sewerPlumbingRecords: 'Sewer scope from 2022 available.' },
          accessNotes: { pets: 'One friendly dog.', atticCrawlBasementMechanical: 'Mechanical room unlocked.', detachedGarageShedOutbuildings: 'Detached shed available if needed.' },
          electricalPanel: 'Main panel in garage; labeled and accessible.', waterShutoff: 'Main shutoff in mechanical room.', hvacFilter: '16x25x1 filter changed last month.', hvacService: 'Furnace service completed March 2026.', hvacAcService: 'A/C service completed May 2026.', roofAge: 'Approx. 5 years old.', gutters: 'Cleaned spring 2026.', smokeCO: 'Combination alarms tested this year.', fireExtinguishers: 'One extinguisher in kitchen, one in garage.', chimney: 'No active fireplace use.', additionalConcerns: 'Build a clean baseline PMR and PASS calendar.'
        },
        answers: {
          3: answer({ trade: 'Appliance', effort: '30 min', addToPmcpBuilder: true, passCadence: 'Quarterly', passResource: 'Handy Services', passNote: 'Range hood filter is clean; keep quarterly cleaning/check on PASS.' }),
          4: answer({ trade: 'Handyman', effort: '30 min', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'Handy Services', passNote: 'Dryer vent looked clear; keep annual cleaning in PASS.' }),
          11: answer({ trade: 'Handyman', effort: '15 min', addToPmcpBuilder: true, passCadence: 'Every 1–3 months', passResource: 'Handy Services', passNote: 'Filter was clean and correctly installed.' }),
          16: answer({ trade: 'Safety', effort: '30 min', addToPmcpBuilder: true, passCadence: 'Annual safety review', passResource: 'Safety', passNote: 'Smoke/CO and extinguisher review belong in yearly PASS.' }),
          'default-bathroom-1-2': answer({ trade: 'Handyman', effort: '30 min', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'Handy Services', passNote: 'Bath fan cleaning/check added as routine care.' }),
          'demo-powder-bath-1-1': answer({ trade: 'Handyman', effort: '15 min', addToPmcpBuilder: true, passCadence: 'As Needed', passResource: 'Handy Services', passNote: 'Door rub is not a PMR finding; keep as light Handy Services watch item.' })
        },
        roomCapture: {
          Exterior: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'No active defect. Gutter/downspout and exterior finish reviews stay on PASS.' }),
          Kitchen: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Appliance filters and under-sink visual checks are PASS care only.' }),
          Laundry: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Dryer vent is clear today; annual cleaning remains in PASS.' }),
          Mechanical: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'HVAC filter and seasonal service are current; next windows should show in PMR/PASS.' }),
          Safety: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Annual safety device review requested.' }),
          'default-living-room-1': room({ status: 'Looking Good', note: 'Family room looks good; no action item.' }),
          'demo-living-room-2': room({ status: 'Looking Good', note: 'Basement rec room added as extra room; no findings.' }),
          'demo-office-1': room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Home office added as extra room; keep seasonal outlet/cord and window check in PASS.' }),
          'default-bedroom-1': room({ status: 'Looking Good', note: 'Primary bedroom reviewed; no findings.' }),
          'demo-bedroom-2': room({ status: 'Watch Item / Worth Watching', note: 'Guest bedroom comfort history noted for seasonal HVAC balance watch.' }),
          'demo-bedroom-3': room({ status: 'Looking Good', note: 'Kids bedroom reviewed; no findings.' }),
          'default-bathroom-1': room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Hall bath fan and caulk review remain routine PASS.' }),
          'demo-bathroom-2': room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Primary bath added as extra room; keep caulk/grout review on annual PASS.' }),
          'demo-powder-bath-1': room({ status: 'Watch Item / Worth Watching', note: 'Powder bath door rub noted as light watch item only.' })
        },
        passReview: {
          'generated-pass-furnace-filter-check': { pmcpDecision: 'selected', followUpStatus: 'Planned', thaActionType: 'Schedule service' },
          'generated-pass-dryer-vent-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services' },
          'generated-pass-range-hood-filter-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Planned' },
          'generated-pass-gutter-downspout-review': { pmcpDecision: 'selected', followUpStatus: 'Planned' },
          'generated-pass-smoke-co-detector-check': { pmcpDecision: 'selected', followUpStatus: 'Planned' },
          'generated-pass-fire-extinguisher-check': { pmcpDecision: 'selected', followUpStatus: 'Planned' }
        }
      })
    },
    {
      id: 'v34-full-demo-2',
      title: 'Demo 2 — Full Workflow / Unknown History + Watch Items',
      description: 'Tests homeowner uncertainty, field-prep follow-ups, HTC verification, extra rooms, PASS baseline planning, watch items, and PMR output.',
      checks: ['Unknown intake history creates review prompts without automatically becoming PMR findings.', 'Confirmed HTC issues and room overviews report to PMR.', 'PASS establishes baseline care windows.', 'Extra rooms appear in HTC and PMR context.'],
      data: baseData({
        client: { name: 'Demo 2 Client — Older Home', address: '42 Heritage Avenue, Longmont, CO', date: 'Demo 2 — Unknown History + PASS Baseline' },
        intakeData: {
          notes: 'Older home with limited service records. Homeowner wants help separating true concerns from normal maintenance planning.',
          priorityAreas: 'Mechanical room, roof/chimney history, basement rec room, hall bath, gutters, and electrical panel.',
          doNotOverlook: 'Please look at the basement rec room exterior wall and the guest bedroom window.',
          knownIssues: { leaksMoisture: 'Past stain at basement rec room wall; not sure if active.', slowDrainsPlumbing: 'Hall bath sink sometimes drains slowly.', electricalConcerns: 'Panel labels may be incomplete.', comfortIssues: 'Guest bedroom is cooler than main floor.', drainageGrading: 'Water has pooled near front walk in storms.' },
          recentRepairs: { furnaceService: 'Unknown; no sticker found.', acHeatPumpService: 'Unknown.', chimneyFireplaceService: 'Unknown; fireplace used occasionally.', waterHeaterService: 'Unknown age/service.', roofRepairedReplaced: 'Seller thought roof was older but no paperwork.', otherMaintenanceHistory: 'Gutter cleaning date unknown.' },
          helpfulRecords: { recentInspectionReport: 'Prior inspection summary may be available later.', sewerPlumbingRecords: 'No records found yet.', roofPaperwork: 'No roof paperwork found.' },
          accessNotes: { atticCrawlBasementMechanical: 'Basement mechanical room accessible.', areasBlockedByStorage: 'One basement wall partially blocked by storage.' },
          electricalPanel: 'Panel in basement; some labels missing.', electricalUpdates: 'Unknown updates.', waterShutoff: 'Likely in mechanical room; confirm.', plumbingHistory: 'Slow hall bath sink; no known active leak.', waterHeater: 'Age/service not confirmed.', sewerIrrigation: 'Sewer scope unknown; irrigation not currently active.', hvacFilter: 'Filter date unknown.', hvacService: 'Service history unknown.', hvacAcService: 'A/C history unknown.', comfort: 'Guest bedroom cooler in winter.', roofAge: 'Approximate age unknown.', roofHistory: 'No leak reported; records missing.', drainagePooling: 'Pooling near front walk during storms.', drainageHistory: 'Unknown drainage work.', gutters: 'Cleaning date unknown.', windowsDoors: 'Guest bedroom window sticks.', paintStain: 'Exterior finish appears older.', pests: 'Occasional ants in spring.', smokeCO: 'Detector dates unknown.', fireExtinguishers: 'No extinguisher location confirmed.', chimney: 'Fireplace used occasionally; service unknown.', additionalConcerns: 'Clarify what belongs in PMR versus PASS baseline care.'
        },
        answers: {
          0: answer({ status: 'Monitor', trade: 'Electrical', effort: 'Trade scope', notes: 'Panel labels incomplete; no unsafe condition confirmed today. Recommend label review during electrical/service visit.', actionCertainty: 'Needs Discovery', pref: 'Plan soon' }),
          1: answer({ status: 'Needs Attention', trade: 'Plumbing', effort: '45–60 min', notes: 'Hall bath sink slow drain confirmed during walkthrough; PMR plumbing/handy triage item.', actionCertainty: 'Likely Path', pref: 'Plan soon' }),
          11: answer({ status: 'Monitor', trade: 'HVAC', effort: 'Trade scope', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'HVAC', notes: 'HVAC service history unknown; no active failure observed. Establish baseline HVAC service.', passNote: 'Use PASS to establish HVAC baseline and filter cadence.' }),
          18: answer({ status: 'Monitor', trade: 'Chimney', effort: 'Trade scope', addToPmcpBuilder: true, passCadence: 'Before fireplace use', passResource: 'Chimney', notes: 'Chimney/fireplace service history unknown; plan inspection before use.', passNote: 'Conditional PASS item because fireplace is used occasionally.' }),
          'intake-follow-up-hvacService': answer({ status: 'Unknown', trade: 'HVAC', effort: 'Trade scope', reviewStatus: 'Reviewed — Context Only', notes: 'Unknown service history kept as PASS baseline unless HVAC visit finds a defect.' }),
          'intake-follow-up-roofAge': answer({ status: 'Unknown', trade: 'Roof', effort: 'Unknown', reviewStatus: 'Reviewed — Context Only', notes: 'Roof age remains context; no active roof leak observed.' }),
          'demo-bedroom-2-1': answer({ status: 'Needs Attention', trade: 'Handyman', effort: '30 min', notes: 'Guest bedroom window sticks and needs adjustment/weatherstrip review.', actionCertainty: 'Clear Path', pref: 'Plan soon' })
        },
        pinnedItems: { Bathroom: ['1'], Mechanical: ['11'], 'demo-bedroom-2': ['demo-bedroom-2-1'] },
        roomCapture: {
          Exterior: room({ status: 'Watch Item / Worth Watching', addToPmcpBuilder: true, note: 'Older roof/finish and drainage context should report to PMR as watch/planning context.' }),
          Kitchen: room({ status: 'Looking Good', note: 'Kitchen checked; no active kitchen PMR item.' }),
          Laundry: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Dryer vent history unknown; add baseline cleaning/check to PASS.' }),
          Mechanical: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'HVAC/water-heater histories unknown; establish baseline service windows.' }),
          Safety: room({ status: 'Trade Attention', note: 'Detector dates and extinguishers not confirmed; safety review belongs in PMR/PASS.', thaActionType: 'Follow-up observation' }),
          'default-living-room-1': room({ status: 'Looking Good', note: 'Main living area reviewed.' }),
          'demo-living-room-2': room({ status: 'Watch Item / Worth Watching', note: 'Basement rec room past stain observed; no active moisture confirmed. Keep as PMR watch context.' }),
          'demo-office-1': room({ status: 'Looking Good', note: 'Office added and reviewed.' }),
          'default-bedroom-1': room({ status: 'Looking Good', note: 'Primary bedroom reviewed.' }),
          'demo-bedroom-2': room({ status: 'Handy Services', note: 'Guest bedroom window adjustment/weatherstrip review confirmed.', thaActionItem: true, thaActionType: 'Client-approved work' }),
          'demo-bedroom-3': room({ status: 'Looking Good', note: 'Kids bedroom reviewed.' }),
          'default-bathroom-1': room({ status: 'Handy Services', note: 'Hall bath slow drain confirmed and should show as PMR/Handy or plumbing triage.' }),
          'demo-bathroom-2': room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Primary bath caulk/grout review added to PASS.' }),
          'demo-powder-bath-1': room({ status: 'Looking Good', note: 'Powder bath reviewed.' })
        },
        passReview: {
          'generated-pass-furnace-service': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'HVAC' },
          'generated-pass-ac-heat-pump-service': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'HVAC' },
          'generated-pass-water-heater-flush-service-review': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'Plumbing' },
          'generated-pass-chimney-fireplace-inspection-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'Chimney' },
          'generated-pass-gutter-downspout-review': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline' },
          'generated-pass-smoke-co-detector-check': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', thaActionType: 'Follow-up observation' }
        }
      })
    },
    {
      id: 'v34-full-demo-3',
      title: 'Demo 3 — Full Workflow / PMR Findings + PASS + THA Actions',
      description: 'Tests the busiest path: intake, field prep, HTC defects, extra rooms, PMR reporting, selected PASS care, and THA action items.',
      checks: ['PMR shows immediate, near-term, Handy Services, trade, and monitor items.', 'PASS remains separate but selected care appears in PMR/PASS sections.', 'THA Action Items show purple context.', 'Extra rooms and room overview statuses report correctly.'],
      data: baseData({
        client: { name: 'Demo 3 Client — PMR + PASS Action Plan', address: '77 Mixed Findings Court, Boulder, CO', date: 'Demo 3 — Findings + Care Plan + THA Actions' },
        intakeData: {
          notes: 'Homeowner wants a clear PMR action plan plus recurring PASS support after immediate issues are handled.',
          priorityAreas: 'Kitchen GFCI, sink drip, dryer vent, hall bath caulk, gutters, basement rec room, guest bedroom, and safety devices.',
          doNotOverlook: 'Do not overlook the exterior dryer flap, guest bedroom window, or basement rec room wall.',
          knownIssues: { leaksMoisture: 'Small drip under kitchen sink and past basement wall stain.', slowDrainsPlumbing: 'Hall bath sink slow.', electricalConcerns: 'Kitchen GFCI may not reset.', comfortIssues: 'Guest bedroom cooler than rest of house.', stickyOpeningsDrafts: 'Guest bedroom window sticks.', pestActivity: 'Ants near back slider in spring.', drainageGrading: 'Water pools near patio/downspout.', odorsNoisesAppliances: 'Dryer takes longer than normal.', otherRecurringSymptoms: 'Bath caulk splits every year.' },
          recentRepairs: { furnaceService: 'Last fall.', acHeatPumpService: 'Unknown.', waterHeaterService: 'No recent flush known.', roofRepairedReplaced: 'Minor flashing repair 2023.', exteriorPaintStain: 'Exterior paint older, trim beginning to weather.', windowsDoorsRepairedReplaced: 'No recent window/door repair.', otherMaintenanceHistory: 'Dryer vent cleaning overdue; gutters due this fall.' },
          helpfulRecords: { recentInspectionReport: 'Old inspection PDF available.', roofPaperwork: 'Flashing invoice available.', sewerPlumbingRecords: 'No recent sewer scope.', paintColorRecords: 'Paint can in garage.' },
          accessNotes: { pets: 'Dog crated during visit.', gatesKeysLockedAreas: 'Side gate sticks.', atticCrawlBasementMechanical: 'Basement mechanical room accessible.', detachedGarageShedOutbuildings: 'Shed locked unless requested.', areasBlockedByStorage: 'Basement rec room wall partly blocked.' },
          electricalPanel: 'Garage panel accessible; labels partly faded.', electricalUpdates: 'Kitchen GFCI concern reported.', waterShutoff: 'Mechanical room shutoff; label missing.', plumbingHistory: 'Kitchen sink drip and hall bath slow drain.', waterHeater: 'Flush history unknown.', sewerIrrigation: 'No sewer scope found; sprinklers seasonal.', hvacFilter: 'Filter changed recently.', hvacService: 'Furnace service last fall.', hvacAcService: 'A/C service unknown.', comfort: 'Guest bedroom cool.', roofAge: 'Approx 12 years.', roofHistory: 'Past flashing repair.', drainagePooling: 'Back patio pooling.', drainageHistory: 'No known drainage correction.', gutters: 'Due for cleaning.', windowsDoors: 'Guest bedroom window sticks and side gate latch drags.', fogging: 'No major fogging reported.', paintStain: 'Exterior trim weathering.', productsColors: 'Paint can in garage.', pests: 'Spring ants near slider.', fireExtinguishers: 'Gauge/date unknown.', smokeCO: 'Some detector dates unknown.', chimney: 'Fireplace used occasionally; cleaning not current.', additionalConcerns: 'Create PMR and PASS plan with THA action items.'
        },
        answers: {
          0: answer({ status: 'Immediate Concern', trade: 'Electrical', effort: 'Trade scope', notes: 'Kitchen GFCI did not test/reset correctly during walkthrough; electrical safety follow-up needed.', actionCertainty: 'Clear Path', pref: 'Do now', thaActionItem: true, thaActionType: 'Trade consultation' }),
          1: answer({ status: 'Needs Attention', trade: 'Plumbing', effort: '45–60 min', notes: 'Active drip observed under kitchen sink after running water.', actionCertainty: 'Clear Path', pref: 'Do now', thaActionItem: true, thaActionType: 'Client-approved work' }),
          4: answer({ status: 'Needs Attention', trade: 'Handyman', effort: '1–2 hrs', notes: 'Dryer exterior flap restricted with lint buildup and weak airflow.', addToPmcpBuilder: true, passCadence: 'Annual / Fall', passResource: 'Handy Services', passNote: 'After correction, keep dryer vent cleaning in annual PASS.', actionCertainty: 'Likely Path', pref: 'Do now', thaActionItem: true, thaActionType: 'Client-approved work' }),
          9: answer({ status: 'Monitor', trade: 'Handyman', effort: '1–2 hrs', notes: 'Tub/shower caulk is beginning to split at rear corner; reseal before water intrusion.', actionCertainty: 'Clear Path', pref: 'Plan soon' }),
          11: answer({ status: 'Good', trade: 'Handyman', effort: '15 min', addToPmcpBuilder: true, passCadence: 'Every 1–3 months', passResource: 'Handy Services', passNote: 'Filter looked acceptable; continue recurring filter rhythm.' }),
          16: answer({ status: 'Needs Attention', trade: 'Safety', effort: '30 min', notes: 'Several smoke/CO detector dates were not confirmed; safety-device review needed.', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'Safety', passNote: 'Add annual detector/extinguisher review to PASS.', thaActionItem: true, thaActionType: 'Follow-up observation' }),
          18: answer({ status: 'Monitor', trade: 'Chimney', effort: 'Trade scope', addToPmcpBuilder: true, passCadence: 'Before fireplace use', passResource: 'Chimney', notes: 'Fireplace used occasionally; cleaning/inspection should be scheduled before fall use.' }),
          'default-living-room-1-3': answer({ status: 'Monitor', trade: 'Chimney', effort: 'Trade scope', addToPmcpBuilder: true, passCadence: 'Before fall fireplace use', passResource: 'Chimney', passNote: 'Fireplace care belongs in PASS after current monitoring note.' }),
          'demo-living-room-2-2': answer({ status: 'Monitor', trade: 'Handyman', effort: '30 min', notes: 'Basement rec room wall stain appears dry today; monitor after next storm.' }),
          'demo-bedroom-2-1': answer({ status: 'Needs Attention', trade: 'Handyman', effort: '30 min', notes: 'Guest bedroom window sticks and weatherstrip is compressed.', thaActionItem: true, thaActionType: 'Client-approved work' }),
          'demo-bathroom-2-2': answer({ status: 'Needs Attention', trade: 'Handyman', effort: '1–2 hrs', notes: 'Primary bath caulk/grout joints need touch-up before water intrusion.', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'Handy Services', passNote: 'Caulk/grout review becomes annual PASS after repair.' })
        },
        pinnedItems: { Kitchen: ['0', '1'], Laundry: ['4'], Safety: ['16'], 'demo-bedroom-2': ['demo-bedroom-2-1'], 'demo-bathroom-2': ['demo-bathroom-2-2'] },
        roomCapture: {
          Exterior: room({ status: 'Trade Attention', addToPmcpBuilder: true, note: 'Gutters/drainage and exterior trim weathering need PMR + PASS planning.', thaActionType: 'Estimate needed' }),
          Kitchen: room({ status: 'Trade Attention', note: 'Kitchen has electrical GFCI and plumbing drip PMR findings.', thaActionItem: true, thaActionType: 'Trade consultation' }),
          Laundry: room({ status: 'Handy Services', addToPmcpBuilder: true, note: 'Dryer vent is current PMR item; future cleaning stays PASS.', thaActionItem: true, thaActionType: 'Client-approved work' }),
          Mechanical: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'Filter rhythm is PASS; water heater/A/C baseline also need scheduling.' }),
          Safety: room({ status: 'Trade Attention', addToPmcpBuilder: true, note: 'Safety-device dates incomplete; review/replacement planning needed.', thaActionItem: true, thaActionType: 'Follow-up observation' }),
          'default-living-room-1': room({ status: 'Watch Item / Worth Watching', addToPmcpBuilder: true, note: 'Fireplace/chimney care and living room monitoring included.' }),
          'demo-living-room-2': room({ status: 'Watch Item / Worth Watching', note: 'Basement rec room stain is dry; monitor after storms.' }),
          'demo-office-1': room({ status: 'Looking Good', note: 'Office added and reviewed; no finding.' }),
          'default-bedroom-1': room({ status: 'Looking Good', note: 'Primary bedroom reviewed.' }),
          'demo-bedroom-2': room({ status: 'Handy Services', note: 'Guest bedroom window adjustment/weatherstrip needed.', thaActionItem: true, thaActionType: 'Client-approved work' }),
          'demo-bedroom-3': room({ status: 'Looking Good', note: 'Kids bedroom reviewed.' }),
          'default-bathroom-1': room({ status: 'Monitor', note: 'Hall bath slow-drain history noted; no active leak.' }),
          'demo-bathroom-2': room({ status: 'Handy Services', addToPmcpBuilder: true, note: 'Primary bath caulk/grout PMR item and future PASS routine.', thaActionItem: true, thaActionType: 'Client-approved work' }),
          'demo-powder-bath-1': room({ status: 'Looking Good', note: 'Powder bath reviewed.' })
        },
        passReview: {
          'generated-pass-dryer-vent-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services', thaActionItem: true, thaActionType: 'Schedule service' },
          'generated-pass-furnace-filter-check': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services' },
          'generated-pass-water-heater-flush-service-review': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'Plumbing' },
          'generated-pass-gutter-downspout-review': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services', thaActionType: 'Estimate needed' },
          'generated-pass-smoke-co-detector-check': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Safety', thaActionItem: true, thaActionType: 'Follow-up observation' },
          'generated-pass-chimney-fireplace-inspection-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Chimney' },
          'generated-pass-caulk-grout-touch-up-review': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services' }
        }
      })
    }
  ];

  function readSessions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  }

  function saveFullDemo(demo) {
    const id = `${demo.id}-${Date.now()}`;
    const sessions = readSessions();
    sessions[id] = { id, name: demo.title, updatedAt: new Date().toISOString(), data: demo.data };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    localStorage.setItem(CONTROLS_COLLAPSED_KEY, 'false');
    sessionStorage.setItem(PENDING_KEY, id);
    window.location.reload();
  }

  function selectPendingDemo() {
    const id = sessionStorage.getItem(PENDING_KEY);
    if (!id) return;
    const select = Array.from(document.querySelectorAll('select')).find(input => Array.from(input.options || []).some(option => option.value === id));
    if (!select) return;
    sessionStorage.removeItem(PENDING_KEY);
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    window.setTimeout(() => {
      const pmrButton = Array.from(document.querySelectorAll('button')).find(button => /^\s*PMR\s*$/i.test(button.textContent || '') || (button.textContent || '').includes('PMR'));
      pmrButton?.click();
    }, 500);
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .demoScenarioCard .tha-v34-demo-note{margin:8px 0 12px;padding:9px 12px;border:1px solid #d7c4ef;border-radius:12px;background:#fbf8ff;color:#4e3470;font-weight:900;font-size:12px}
      .demoScenarioCard .tha-v34-full-demo-button{border:2px solid #745a91!important;background:#745a91!important;color:#fff!important;border-radius:999px!important;font-weight:950!important;padding:9px 13px!important;box-shadow:0 6px 14px rgba(116,90,145,.18)!important}
      .demoScenarioCard .tha-v34-full-demo-button small{display:block;color:#efe7f6;font-size:10px;font-weight:800;line-height:1.2;margin-top:2px}
    `;
    document.head.append(style);
  }

  function enhanceDemoCards() {
    installStyles();
    const intro = document.querySelector('.demoScenarioIntro');
    if (intro && !intro.querySelector('.tha-v34-demo-note')) {
      const note = document.createElement('p');
      note.className = 'tha-v34-demo-note';
      note.textContent = 'V3.4 full-system demos load real saved walkthrough sessions that exercise Intake, Field Prep, HTC rooms, extra rooms, PASS/PMCP, THA actions, and PMR output.';
      intro.append(note);
    }
    const cards = Array.from(document.querySelectorAll('.demoScenarioGrid .demoScenario'));
    cards.forEach((card, index) => {
      const demo = DEMOS[index];
      if (!demo) return;
      const title = card.querySelector('h4');
      const body = card.querySelector('p');
      const list = card.querySelector('ul');
      if (title) title.textContent = demo.title;
      if (body) body.textContent = demo.description;
      if (list) list.innerHTML = demo.checks.map(check => `<li>${check}</li>`).join('');
      const oldButton = card.querySelector('button');
      if (!oldButton || oldButton.dataset.v34FullDemo === demo.id) return;
      const button = oldButton.cloneNode(false);
      button.type = 'button';
      button.className = `${oldButton.className || ''} tha-v34-full-demo-button`.trim();
      button.dataset.v34FullDemo = demo.id;
      button.innerHTML = `Load Full Demo<small>${demo.title.replace(/^Demo \d+ —\s*/, '')}</small>`;
      button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); saveFullDemo(demo); });
      oldButton.replaceWith(button);
    });
    selectPendingDemo();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhanceDemoCards();
      window.setTimeout(enhanceDemoCards, 250);
    });
  }

  function start() {
    enhanceDemoCards();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.setTimeout(selectPendingDemo, 300);
    window.setTimeout(selectPendingDemo, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();