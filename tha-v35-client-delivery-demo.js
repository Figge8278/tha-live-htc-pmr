(() => {
  const STYLE_ID = 'tha-v35-client-delivery-demo-styles';
  const PANEL_ATTR = 'data-tha-client-delivery-demo';
  const SESSIONS_KEY = 'tha-walkthrough-sessions';
  const CURRENT_KEY = 'tha-current-walkthrough-id';
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }

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

  function demoData() {
    return {
      client: {
        name: 'Practice Client — Delivery Demo',
        address: '123 Test Package Lane, Boulder, CO',
        date: 'Client Delivery Demo — PMR + PMCP + Drive Test'
      },
      intake: {
        intakeId: 'THA-DEMO-CLIENT-DELIVERY',
        intakeStatus: 'Imported / Entered',
        importedRawResponse: 'Client Delivery Demo loaded locally. Add a few real photos before Drive export testing.',
        importedUnmappedNotes: '',
        notes: 'This demo is designed to show a realistic spread of good items, watch items, Handy Services, trade escalation, PASS/PMCP care planning, and THA follow-up tasks.',
        priorityAreas: 'Kitchen safety, active sink drip, dryer vent, hall bath caulk, exterior drainage, guest bedroom window, safety devices, and care-plan setup.',
        doNotOverlook: 'Add at least three real photos during testing: one room overview, one close-up PMR issue, and one mechanical/safety context photo.',
        knownIssues: {
          leaksMoisture: 'Small drip reported below kitchen sink; past dry stain at basement wall.',
          slowDrainsPlumbing: 'Hall bath sink sometimes drains slowly.',
          electricalConcerns: 'Kitchen GFCI may not reset reliably.',
          comfortIssues: 'Guest bedroom feels cooler in winter.',
          stickyOpeningsDrafts: 'Guest bedroom window sticks and weatherstrip is compressed.',
          pestActivity: 'Spring ants near back slider.',
          drainageGrading: 'Water pools near patio/downspout after storms.',
          odorsNoisesAppliances: 'Dryer takes longer than expected.',
          otherRecurringSymptoms: 'Bath caulk tends to split at rear corner.'
        },
        recentRepairs: {
          furnaceService: 'Furnace serviced last fall.',
          acHeatPumpService: 'A/C service unknown.',
          airDuctsCleaned: 'Unknown.',
          chimneyFireplaceService: 'Fireplace used occasionally; cleaning date unknown.',
          waterHeaterService: 'Water heater flush history unknown.',
          roofRepairedReplaced: 'Minor flashing repair in 2023.',
          exteriorPaintStain: 'Trim paint is weathering; full exterior paint not urgent yet.',
          windowsDoorsRepairedReplaced: 'No recent window/door service.',
          otherMaintenanceHistory: 'Dryer vent cleaning overdue; gutters due this fall.'
        },
        helpfulRecords: {
          recentInspectionReport: 'Old inspection PDF available for reference.',
          roofPaperwork: 'Flashing invoice available.',
          sewerPlumbingRecords: 'No recent sewer scope.',
          solarDocuments: 'Not applicable.',
          paintColorRecords: 'Paint can in garage.',
          otherHelpfulRecords: 'Water heater manual in mechanical room.'
        },
        accessNotes: {
          pets: 'Friendly dog; call before arrival.',
          gatesKeysLockedAreas: 'Side gate latch sticks.',
          atticCrawlBasementMechanical: 'Mechanical room accessible.',
          detachedGarageShedOutbuildings: 'Shed locked unless requested.',
          areasBlockedByStorage: 'Basement rec room wall partly blocked by storage.',
          fragileSensitiveOffLimits: 'Nursery off limits during nap window.'
        },
        electricalPanel: 'Garage panel accessible; labels partly faded.',
        electricalUpdates: 'Kitchen GFCI concern reported.',
        solar: 'No solar system.',
        waterShutoff: 'Mechanical room shutoff; label missing.',
        plumbingHistory: 'Kitchen sink drip and hall bath slow drain.',
        waterHeater: 'Age/service not confirmed.',
        sewerIrrigation: 'No sewer scope found; sprinklers seasonal.',
        hvacFilter: 'Filter changed recently.',
        hvacService: 'Furnace service last fall.',
        hvacAcService: 'A/C service unknown.',
        comfort: 'Guest bedroom cool.',
        roofAge: 'Approx. 12 years.',
        roofHistory: 'Past flashing repair.',
        drainagePooling: 'Back patio pooling.',
        drainageHistory: 'No known drainage correction.',
        gutters: 'Due for cleaning.',
        windowsDoors: 'Guest bedroom window sticks and side gate latch drags.',
        fogging: 'No major fogging reported.',
        paintStain: 'Exterior trim weathering.',
        productsColors: 'Paint can in garage.',
        pests: 'Spring ants near slider.',
        fireExtinguishers: 'Gauge/date unknown.',
        smokeCO: 'Some detector dates unknown.',
        chimney: 'Fireplace used occasionally; cleaning not current.',
        additionalConcerns: 'Use this demo to test PMR printout, Drive folder package, electronic delivery, and photo handling.'
      },
      dynamicRooms: [
        { id: 'default-living-room-1', roomType: 'Living / Family Rooms', roomName: 'Family Room' },
        { id: 'demo-living-room-2', roomType: 'Living / Family Rooms', roomName: 'Basement Rec Room' },
        { id: 'demo-office-1', roomType: 'Living / Family Rooms', roomName: 'Home Office' },
        { id: 'default-bedroom-1', roomType: 'Bedrooms', roomName: 'Primary Bedroom' },
        { id: 'demo-bedroom-2', roomType: 'Bedrooms', roomName: 'Guest Bedroom' },
        { id: 'demo-bedroom-3', roomType: 'Bedrooms', roomName: 'Kids Bedroom' },
        { id: 'default-bathroom-1', roomType: 'Bathrooms', roomName: 'Hall Bathroom' },
        { id: 'demo-bathroom-2', roomType: 'Bathrooms', roomName: 'Primary Bathroom' },
        { id: 'demo-powder-bath-1', roomType: 'Bathrooms', roomName: 'Powder Bath' }
      ],
      sectionOrder: ['Exterior', 'Kitchen', 'Laundry', 'Mechanical', 'Safety', 'Living / Family Rooms', 'Bedrooms', 'Bathrooms'],
      itemOrder: {},
      pinnedItems: { Kitchen: ['0', '1'], Laundry: ['4'], Safety: ['16'], 'demo-bedroom-2': ['demo-bedroom-2-1'], 'demo-bathroom-2': ['demo-bathroom-2-2'] },
      answers: {
        0: answer({ status: 'Immediate Concern', trade: 'Electrical', effort: 'Trade scope', notes: 'Kitchen GFCI did not test/reset correctly during walkthrough; electrical safety follow-up needed.', actionCertainty: 'Clear Path', pref: 'Do now', thaActionItem: true, thaActionType: 'Trade consultation' }),
        1: answer({ status: 'Needs Attention', trade: 'Plumbing', effort: '45–60 min', notes: 'Active drip observed under kitchen sink after running water.', actionCertainty: 'Clear Path', pref: 'Do now', thaActionItem: true, thaActionType: 'Client-approved work' }),
        3: answer({ status: 'Good', trade: 'Appliance', effort: '30 min', addToPmcpBuilder: true, passCadence: 'Quarterly', passResource: 'Handy Services', passNote: 'Range hood filter looked good; keep quarterly cleaning/check on PMCP.' }),
        4: answer({ status: 'Needs Attention', trade: 'Handyman', effort: '1–2 hrs', notes: 'Dryer exterior flap restricted with lint buildup and weak airflow.', addToPmcpBuilder: true, passCadence: 'Annual / Fall', passResource: 'Handy Services', passNote: 'After correction, keep dryer vent cleaning in annual PMCP.', actionCertainty: 'Likely Path', pref: 'Do now', thaActionItem: true, thaActionType: 'Client-approved work' }),
        9: answer({ status: 'Monitor', trade: 'Handyman', effort: '1–2 hrs', notes: 'Tub/shower caulk is beginning to split at rear corner; reseal before water intrusion.', actionCertainty: 'Clear Path', pref: 'Plan soon' }),
        11: answer({ status: 'Good', trade: 'Handyman', effort: '15 min', addToPmcpBuilder: true, passCadence: 'Every 1–3 months', passResource: 'Handy Services', passNote: 'Filter looked acceptable; continue recurring filter rhythm.' }),
        16: answer({ status: 'Needs Attention', trade: 'Safety', effort: '30 min', notes: 'Several smoke/CO detector dates were not confirmed; safety-device review needed.', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'Safety', passNote: 'Add annual detector/extinguisher review to PMCP.', thaActionItem: true, thaActionType: 'Follow-up observation' }),
        18: answer({ status: 'Monitor', trade: 'Chimney', effort: 'Trade scope', addToPmcpBuilder: true, passCadence: 'Before fireplace use', passResource: 'Chimney', notes: 'Fireplace used occasionally; cleaning/inspection should be scheduled before fall use.' }),
        'default-living-room-1-3': answer({ status: 'Monitor', trade: 'Chimney', effort: 'Trade scope', addToPmcpBuilder: true, passCadence: 'Before fall fireplace use', passResource: 'Chimney', passNote: 'Fireplace care belongs in PMCP after current monitoring note.' }),
        'demo-living-room-2-2': answer({ status: 'Monitor', trade: 'Handyman', effort: '30 min', notes: 'Basement rec room wall stain appears dry today; monitor after next storm.' }),
        'demo-bedroom-2-1': answer({ status: 'Needs Attention', trade: 'Handyman', effort: '30 min', notes: 'Guest bedroom window sticks and weatherstrip is compressed.', thaActionItem: true, thaActionType: 'Client-approved work' }),
        'demo-bathroom-2-2': answer({ status: 'Needs Attention', trade: 'Handyman', effort: '1–2 hrs', notes: 'Primary bath caulk/grout joints need touch-up before water intrusion.', addToPmcpBuilder: true, passCadence: 'Annual', passResource: 'Handy Services', passNote: 'Caulk/grout review becomes annual PMCP after repair.' }),
        'intake-follow-up-hvacService': answer({ status: 'Unknown', trade: 'HVAC', effort: 'Trade scope', reviewStatus: 'Reviewed — Context Only', notes: 'Unknown A/C service history stays as care-plan baseline unless HVAC visit finds a defect.' }),
        'intake-follow-up-roofAge': answer({ status: 'Unknown', trade: 'Roof', effort: 'Unknown', reviewStatus: 'Reviewed — Context Only', notes: 'Roof age/history is kept as planning context; no active leak observed in this demo.' })
      },
      roomCapture: {
        Exterior: room({ status: 'Trade Attention', addToPmcpBuilder: true, note: 'Gutters/drainage and exterior trim weathering need PMR + care-plan planning.', thaActionType: 'Estimate needed' }),
        Kitchen: room({ status: 'Immediate Concern', note: 'Kitchen has both GFCI safety concern and active sink drip.', thaActionItem: true, thaActionType: 'Trade consultation' }),
        Laundry: room({ status: 'Handy Services', addToPmcpBuilder: true, note: 'Dryer vent airflow issue should be corrected, then kept on annual PMCP.', thaActionItem: true, thaActionType: 'Client-approved work' }),
        Mechanical: room({ status: 'Routine Care / PASS', addToPmcpBuilder: true, note: 'HVAC filter looks good. A/C service history needs baseline verification.' }),
        Safety: room({ status: 'Trade Attention', addToPmcpBuilder: true, note: 'Smoke/CO and extinguisher dates not fully confirmed.', thaActionItem: true, thaActionType: 'Follow-up observation' }),
        'default-living-room-1': room({ status: 'Looking Good', note: 'Family room looks good except fireplace care is captured separately.' }),
        'demo-living-room-2': room({ status: 'Watch Item / Worth Watching', note: 'Basement stain appears dry today. Keep as watch item after next storm.' }),
        'demo-office-1': room({ status: 'Looking Good', note: 'Home office reviewed; no current action.' }),
        'default-bedroom-1': room({ status: 'Looking Good', note: 'Primary bedroom reviewed; no findings.' }),
        'demo-bedroom-2': room({ status: 'Handy Services', note: 'Guest bedroom window adjustment/weatherstrip review confirmed.', thaActionItem: true, thaActionType: 'Client-approved work' }),
        'demo-bedroom-3': room({ status: 'Looking Good', note: 'Kids bedroom reviewed; no findings.' }),
        'default-bathroom-1': room({ status: 'Needs Attention', note: 'Hall bath slow drain and caulk watch item should show in PMR.' }),
        'demo-bathroom-2': room({ status: 'Handy Services', addToPmcpBuilder: true, note: 'Primary bath caulk/grout touch-up should be corrected and then kept on annual PMCP.' }),
        'demo-powder-bath-1': room({ status: 'Looking Good', note: 'Powder bath reviewed; no current action.' })
      },
      passReview: {
        'generated-pass-furnace-filter-check': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services', thaActionType: 'Schedule service' },
        'generated-pass-ac-heat-pump-service': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'HVAC' },
        'generated-pass-water-heater-flush-service-review': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'Plumbing' },
        'generated-pass-dryer-vent-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services', thaActionItem: true, thaActionType: 'Client-approved work' },
        'generated-pass-gutter-downspout-review': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services' },
        'generated-pass-smoke-co-detector-check': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Safety', thaActionType: 'Follow-up observation' },
        'generated-pass-fire-extinguisher-check': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Safety' },
        'generated-pass-caulk-grout-touch-up-review': { pmcpDecision: 'selected', followUpStatus: 'Planned', resource: 'Handy Services' },
        'generated-pass-chimney-fireplace-inspection-cleaning': { pmcpDecision: 'selected', followUpStatus: 'Verify / Establish Baseline', resource: 'Chimney' }
      },
      roomOverviewExpandedByRoom: {},
      smartPromptExpandedByRoom: {},
      expandedChecklistItems: {}
    };
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-client-demo-panel{margin:14px 0!important;padding:14px!important;border:1px solid #d5c3f0!important;border-radius:18px!important;background:#fbf8ff!important;color:#38284f!important;box-shadow:inset 6px 0 0 rgba(116,90,145,.28)!important;display:grid!important;gap:12px!important}
      .tha-client-demo-panel h3{margin:0!important;font-size:15px!important;color:#4e3470!important;line-height:1.25!important}
      .tha-client-demo-panel p{margin:0!important;font-size:12px!important;line-height:1.4!important;color:#57446f!important;font-weight:780!important}
      .tha-client-demo-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;align-items:center!important}
      .tha-client-demo-actions button{border:1px solid #9d80c1!important;border-radius:999px!important;background:#fff!important;color:#4e3470!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-client-demo-actions button.primary{background:#745a91!important;color:#fff!important;border-color:#745a91!important}
      .tha-client-demo-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;gap:9px!important}
      .tha-client-demo-card{border:1px solid #e2d6ef!important;border-radius:14px!important;background:#fff!important;padding:10px!important;color:#4e3470!important;font-size:12px!important;line-height:1.35!important;font-weight:800!important}
      .tha-client-demo-card strong{display:block!important;margin-bottom:5px!important;color:#38284f!important}
      @media(max-width:720px){.tha-client-demo-panel{padding:11px!important}.tha-client-demo-actions button{font-size:11px!important;padding:7px 9px!important}}
      @media print{.tha-client-demo-panel{display:none!important}}
    `;
    document.head.append(style);
  }

  function loadDemo() {
    const id = `client-delivery-demo-${Date.now()}`;
    const session = {
      id,
      name: 'Client Delivery Demo — PMR + PMCP + Drive Test',
      updatedAt: new Date().toISOString(),
      data: demoData()
    };
    const sessions = readJson(SESSIONS_KEY, {}) || {};
    localStorage.setItem(SESSIONS_KEY, JSON.stringify({ ...sessions, [id]: session }));
    localStorage.setItem(CURRENT_KEY, id);
    localStorage.setItem(COLLAPSED_KEY, 'false');
    window.alert('Client Delivery Demo loaded. The app will reload. Next: add 3 real photos, connect Drive, sync photos, save PMR package, download HTML, and print PMR.');
    window.location.reload();
  }

  function renderPanel() {
    return `<section class="tha-client-demo-panel" ${PANEL_ATTR}="true">
      <h3>Client Delivery Demo Loader</h3>
      <p>Loads a mixed practice client with good items, watch items, immediate concerns, Handy Services, trade escalation, PASS/PMCP planning, THA Action Items, and client-delivery test notes.</p>
      <div class="tha-client-demo-actions"><button type="button" class="primary" data-tha-load-client-demo>Load Client Delivery Demo</button></div>
      <div class="tha-client-demo-grid">
        <div class="tha-client-demo-card"><strong>Add photos after loading</strong>Use real photos for one room overview, one close-up issue, and one mechanical/safety context photo so Drive/photo index output can be tested.</div>
        <div class="tha-client-demo-card"><strong>Electronic delivery test</strong>Connect Drive, sync pending photos, save PMR package, then confirm PMR HTML/PDF, Photos, Secondary Editable Copies, and Backup Data folders.</div>
        <div class="tha-client-demo-card"><strong>Print test</strong>Print PMR for the client-facing handout. Keep the full electronic folder richer, with photos and editable support copies stored in Drive.</div>
      </div>
    </section>`;
  }

  function placePanel() {
    const anchor = document.querySelector('.walkthroughControlsPanel .businessRecordsCard') || document.querySelector('.walkthroughControlsPanel') || document.querySelector('.homePage,.landingPage,main') || document.body;
    if (!anchor || document.querySelector(`[${PANEL_ATTR}]`)) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderPanel();
    anchor.append(wrapper.firstElementChild);
    document.querySelector('[data-tha-load-client-demo]')?.addEventListener('click', loadDemo);
  }

  function render() {
    installStyles();
    placePanel();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      render();
      window.setTimeout(render, 200);
    });
  }

  function start() {
    render();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
    window.addEventListener('tha:set-view', () => window.setTimeout(render, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();