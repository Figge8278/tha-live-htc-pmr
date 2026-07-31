(() => {
  const STYLE_ID = 'tha-v34-pmr-output-control-styles';
  const SECTION_ATTR = 'data-tha-supporting-info-builder';
  const ROW_ATTR = 'data-tha-supporting-info-row';
  const STORAGE_KEY = 'tha:pmr:supporting-info:selected:v1';
  const RUN_ATTR = 'data-tha-pmr-output-controlled';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function readSelectedMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function writeSelectedMap(map) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); }
    catch { /* Local storage is helpful, not mission-critical. */ }
  }

  function textKey(value = '') {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `item-${Math.random().toString(36).slice(2)}`;
  }

  function itemTitle(row) {
    return row.querySelector('strong')?.textContent?.trim() || row.textContent.trim().slice(0, 80) || 'Supporting item';
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.4 PMR output control: optional supporting info + PMR/PASS output order. */
      .baselineCare.tha-supporting-builder{border-color:#d7c4ef!important;background:#fbf9ff!important;box-shadow:inset 6px 0 0 rgba(116,90,145,.22)!important}
      .baselineCare.tha-supporting-builder h2{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}
      .baselineCare.tha-supporting-builder h2::after{content:"Optional client-support info";display:inline-flex;border:1px solid #d7c4ef;border-radius:999px;background:#fff;color:#5b4674;padding:4px 8px;font-size:11px;font-weight:950;letter-spacing:.02em}
      .tha-supporting-builder-note{margin:8px 0 12px!important;padding:10px 12px!important;border:1px solid #d7c4ef!important;border-radius:12px!important;background:#fff!important;color:#51415f!important;font-size:13px!important;font-weight:800!important;line-height:1.4!important}
      .tha-supporting-toolbar{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;margin:12px 0!important;padding:10px 12px!important;border:1px solid #d7c4ef!important;border-radius:14px!important;background:#fff!important}
      .tha-supporting-toolbar button{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;border:1px solid #b9aacd!important;border-radius:999px!important;background:#fff!important;color:#4e3470!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-supporting-toolbar button.primary{background:#745a91!important;color:#fff!important;border-color:#745a91!important}
      .tha-supporting-toolbar .tha-supporting-status{margin-left:auto!important;border:1px solid #d7c4ef!important;border-radius:999px!important;background:#fbf8ff!important;color:#4e3470!important;padding:7px 10px!important;font-size:12px!important;font-weight:950!important}
      .baselineCare.tha-supporting-collapsed .passCalendarCareGroup{display:none!important}
      .baselineCare.tha-supporting-collapsed .tha-supporting-builder-note{margin-bottom:0!important}
      .baselineCare.tha-supporting-builder .passCalendarCareGroup{margin-top:14px!important;padding:12px!important;border:1px solid #e3d9ef!important;border-radius:16px!important;background:#fff!important}
      .baselineCare.tha-supporting-builder .passCalendarCareGroup h3{margin:0 0 10px!important;color:#4e3470!important;font-size:14px!important;text-transform:uppercase!important;letter-spacing:.05em!important}
      .baselineCare.tha-supporting-builder .passCalendarTable{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(225px,1fr))!important;gap:10px!important;align-items:start!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline{display:block!important;min-width:0!important;border:1px solid #dfe8df!important;border-radius:14px!important;background:#fff!important;padding:10px!important;box-shadow:0 6px 14px rgba(23,62,87,.06)!important;opacity:.62!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline.tha-supporting-selected{opacity:1!important;border-color:#9ecf93!important;background:#f4fbf1!important;box-shadow:inset -5px 0 0 #52aa4b,0 8px 16px rgba(23,62,87,.08)!important}
      .tha-supporting-send-control{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:0 0 8px!important;padding:7px 8px!important;border:1px solid #d8e8d0!important;border-radius:12px!important;background:#f8fcf6!important;color:#285c30!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important}
      .tha-supporting-send-control input{width:17px!important;height:17px!important;margin:0!important;accent-color:#52aa4b!important;cursor:pointer!important}
      .tha-supporting-include-chip{display:inline-flex!important;border:1px solid #e0d4ef!important;border-radius:999px!important;background:#fff!important;color:#6f5aa5!important;padding:4px 7px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}
      .tha-supporting-selected .tha-supporting-include-chip{border-color:#9ecf93!important;background:#e5f6e3!important;color:#285c30!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline>div{margin:0 0 8px!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline strong{display:block!important;font-size:14px!important;line-height:1.25!important;color:#173e57!important;margin-bottom:4px!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline small{display:block!important;font-size:12px!important;line-height:1.35!important;color:#53616c!important;margin-top:4px!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline>span,.baselineCare.tha-supporting-builder .passCalendarRow.baseline em{display:inline-flex!important;margin:3px 4px 0 0!important;border:1px solid #e2e8ed!important;border-radius:999px!important;background:#fff!important;color:#53616c!important;padding:4px 7px!important;font-size:10px!important;font-style:normal!important;font-weight:850!important;line-height:1.15!important}
      .baselineCare.tha-supporting-builder .passCalendarRow.baseline .nextWindow{background:#eef6fb!important;color:#1f5d82!important;border-color:#bdd4e6!important}
      .tha-supporting-empty{display:none;margin:12px 0 0!important;padding:12px!important;border:1px dashed #d7c4ef!important;border-radius:12px!important;background:#fff!important;color:#5b4674!important;font-weight:850!important}
      .baselineCare.tha-supporting-none-selected .tha-supporting-empty{display:block!important}

      .tha-pmcp-timing-panel{border-color:#b9dfb4!important;background:#f7fcf5!important;box-shadow:inset 6px 0 0 rgba(82,170,75,.28)!important}
      .tha-pmcp-timing-panel h2::after{content:"PMCP / PASS timing"!important;color:#285c30!important;border-color:#b9dfb4!important;background:#fff!important}
      .tha-pmr-supporting-output{border-color:#d7c4ef!important;background:#fbf9ff!important;box-shadow:inset 6px 0 0 rgba(116,90,145,.22)!important}
      .tha-pmr-supporting-output h2{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}
      .tha-pmr-supporting-output h2::after{content:"optional / accessory"!important;display:inline-flex!important;border:1px solid #d7c4ef!important;border-radius:999px!important;background:#fff!important;color:#5b4674!important;padding:4px 8px!important;font-size:11px!important;font-weight:950!important;letter-spacing:.02em!important;text-transform:uppercase!important}
      .tha-pmr-supporting-output .tha-supporting-toolbar,
      .tha-pmr-supporting-output .tha-supporting-builder-note,
      .tha-pmr-supporting-output .tha-supporting-send-control,
      .tha-pmr-supporting-output .tha-supporting-empty{display:none!important}
      .tha-pmr-supporting-output .passCalendarRow.baseline:not(.tha-supporting-selected){display:none!important}
      .tha-pmr-supporting-output .passCalendarRow.baseline.tha-supporting-selected{opacity:1!important;background:#fff!important;border-color:#d7c4ef!important;box-shadow:none!important}
      .tha-pmr-supporting-output.tha-output-collapsed .passCalendarCareGroup,
      .tha-pmr-supporting-output.tha-output-collapsed .passCalendarTable,
      .tha-pmr-supporting-output.tha-output-collapsed .passCalendarRow.baseline,
      .tha-pmr-supporting-output.tha-output-collapsed .tha-supporting-none-selected{display:none!important}
      .tha-pmr-supporting-output-toggle{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;border:1px solid #b9aacd!important;border-radius:999px!important;background:#fff!important;color:#4e3470!important;padding:8px 11px!important;font-size:12px!important;font-weight:950!important;cursor:pointer!important;margin:8px 0 12px!important}
      .tha-pmr-supporting-output-note{margin:8px 0 10px!important;padding:10px 12px!important;border:1px solid #e1d6ee!important;border-radius:12px!important;background:#fff!important;color:#5b4674!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important}
      .tha-pass-supporting-anchor-note{margin:10px 0 0!important;padding:10px 12px!important;border:1px solid #d7c4ef!important;border-radius:12px!important;background:#fff!important;color:#5b4674!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important}
      .tha-order-spacer{margin-top:18px!important}

      @media(max-width:720px){
        .baselineCare.tha-supporting-builder .passCalendarTable{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
        .tha-supporting-toolbar .tha-supporting-status{width:100%!important;margin-left:0!important}
        .baselineCare.tha-supporting-builder .passCalendarRow.baseline{padding:9px!important}
        .baselineCare.tha-supporting-builder .passCalendarRow.baseline strong{font-size:12px!important}
        .baselineCare.tha-supporting-builder .passCalendarRow.baseline small{font-size:11px!important}
        .tha-supporting-send-control{font-size:11px!important;padding:7px!important}
      }
      @media print{
        .tha-supporting-toolbar,.tha-supporting-builder-note,.tha-supporting-send-control,.tha-supporting-empty,.tha-pmr-supporting-output-toggle,.tha-pmr-supporting-output-note{display:none!important}
        .baselineCare.tha-supporting-builder .passCalendarTable{display:block!important}
        .baselineCare.tha-supporting-builder .passCalendarRow.baseline:not(.tha-supporting-selected){display:none!important}
        .baselineCare.tha-supporting-builder .passCalendarRow.baseline.tha-supporting-selected{break-inside:avoid!important;opacity:1!important;box-shadow:none!important;border-color:#d5e0d2!important;background:#fff!important;margin-bottom:8px!important}
        .tha-pmr-supporting-output.tha-output-collapsed .passCalendarCareGroup,
        .tha-pmr-supporting-output.tha-output-collapsed .passCalendarTable,
        .tha-pmr-supporting-output.tha-output-collapsed .passCalendarRow.baseline.tha-supporting-selected{display:block!important}
      }
    `;
    document.head.append(style);
  }

  function headingText(section) {
    return textOf(section?.querySelector?.('h1,h2,h3,summary') || section);
  }

  function findSectionByHeading(root, patterns) {
    if (!root) return null;
    const sections = Array.from(root.querySelectorAll('section,.pmrBlock,.collapsibleBlock,details,article'));
    return sections.find(section => patterns.some(pattern => pattern.test(headingText(section)))) || null;
  }

  function setHeading(section, title) {
    const heading = section?.querySelector?.('h2,h3,summary');
    if (!heading) return;
    const firstText = Array.from(heading.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (firstText) firstText.textContent = title;
    else heading.prepend(document.createTextNode(title));
  }

  function setLede(section, text) {
    const lede = section?.querySelector?.('.lede,p');
    if (lede) lede.textContent = text;
  }

  function baselineSection(root = document) {
    return root.querySelector?.('.pmrBlock.baselineCare') || null;
  }

  function updateToolbar(section) {
    const rows = Array.from(section.querySelectorAll('.passCalendarRow.baseline'));
    const selected = rows.filter(row => row.classList.contains('tha-supporting-selected'));
    section.classList.toggle('tha-supporting-none-selected', selected.length === 0);
    const status = section.querySelector('.tha-supporting-status');
    if (status) status.textContent = `${selected.length}/${rows.length} selected for PMR`;
    const toggle = section.querySelector('.tha-supporting-toggle');
    if (toggle) toggle.textContent = section.classList.contains('tha-supporting-collapsed') ? 'Open info builder' : 'Collapse info builder';
  }

  function setRowSelected(row, selected) {
    row.classList.toggle('tha-supporting-selected', selected);
    const checkbox = row.querySelector('.tha-supporting-send-control input');
    if (checkbox) checkbox.checked = selected;
    const chip = row.querySelector('.tha-supporting-include-chip');
    if (chip) chip.textContent = selected ? 'Will send' : 'Not included';
  }

  function wireRow(row, map, section) {
    if (row.getAttribute(ROW_ATTR)) return;
    row.setAttribute(ROW_ATTR, 'true');
    const key = textKey(itemTitle(row));
    row.dataset.thaSupportingKey = key;

    const control = document.createElement('label');
    control.className = 'tha-supporting-send-control';
    control.innerHTML = '<span>Send info</span><input type="checkbox"/><em class="tha-supporting-include-chip">Not included</em>';
    const checkbox = control.querySelector('input');
    checkbox.addEventListener('change', () => {
      const next = readSelectedMap();
      if (checkbox.checked) next[key] = true;
      else delete next[key];
      writeSelectedMap(next);
      setRowSelected(row, checkbox.checked);
      updateToolbar(section);
      scheduleRun();
    });
    row.prepend(control);
    setRowSelected(row, Boolean(map[key]));
  }

  function addToolbar(section) {
    if (section.querySelector('.tha-supporting-toolbar')) return;
    section.classList.add('tha-supporting-builder', 'tha-supporting-collapsed');
    section.setAttribute(SECTION_ATTR, 'true');

    const heading = section.querySelector('h2');
    if (heading && /baseline home care/i.test(heading.textContent)) {
      heading.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /Baseline Home Care/i.test(node.textContent)) node.textContent = ' Supporting Home Care Info Builder';
      });
    }

    const note = document.createElement('p');
    note.className = 'tha-supporting-builder-note';
    note.textContent = 'Use this as an optional client-information builder. Check only the upkeep topics the homeowner wants included so the PMR stays useful instead of turning into a maintenance encyclopedia.';

    const toolbar = document.createElement('div');
    toolbar.className = 'tha-supporting-toolbar noPrint';
    toolbar.innerHTML = '<button type="button" class="primary tha-supporting-toggle">Open info builder</button><button type="button" class="tha-supporting-select-all">Select all</button><button type="button" class="tha-supporting-clear">Clear selected</button><span class="tha-supporting-status">0 selected</span>';

    const empty = document.createElement('p');
    empty.className = 'tha-supporting-empty';
    empty.textContent = 'No supporting information selected yet. Open the builder and check the topics the homeowner wants included.';

    const lede = section.querySelector('.lede');
    if (lede) lede.after(note, toolbar, empty);
    else section.insertBefore(toolbar, section.firstChild?.nextSibling || null);

    toolbar.querySelector('.tha-supporting-toggle')?.addEventListener('click', () => {
      section.classList.toggle('tha-supporting-collapsed');
      updateToolbar(section);
    });
    toolbar.querySelector('.tha-supporting-select-all')?.addEventListener('click', () => {
      const next = readSelectedMap();
      section.querySelectorAll('.passCalendarRow.baseline').forEach(row => {
        next[row.dataset.thaSupportingKey || textKey(itemTitle(row))] = true;
        setRowSelected(row, true);
      });
      writeSelectedMap(next);
      updateToolbar(section);
      scheduleRun();
    });
    toolbar.querySelector('.tha-supporting-clear')?.addEventListener('click', () => {
      const next = readSelectedMap();
      section.querySelectorAll('.passCalendarRow.baseline').forEach(row => {
        delete next[row.dataset.thaSupportingKey || textKey(itemTitle(row))];
        setRowSelected(row, false);
      });
      writeSelectedMap(next);
      updateToolbar(section);
      scheduleRun();
    });
  }

  function enhanceSupportingInfo(root = document) {
    const section = baselineSection(root) || baselineSection(document);
    if (!section) return;
    addToolbar(section);
    const map = readSelectedMap();
    section.querySelectorAll('.passCalendarRow.baseline').forEach(row => wireRow(row, map, section));
    updateToolbar(section);
  }

  function reframeTimingPanels(root = document) {
    root.querySelectorAll?.('.tha-care-forecast-panel').forEach(panel => {
      panel.classList.add('tha-pmcp-timing-panel');
      setHeading(panel, 'PMCP Timing Forecast');
      setLede(panel, 'Captured last-done dates and approximate timeframes feed the PMCP/PASS plan. Use this for next-window forecasting, scheduling, and batching Handy Services or trade visits.');
    });
  }

  function movePassTimingPanel(passMain) {
    const panel = passMain?.querySelector?.('[data-tha-care-forecast-panel="pass"]');
    if (!panel) return;
    const selectedPlan = passMain.querySelector('.passPlanSummary,.passOutlook,.passSelectedPlan,.passPlanCategoryGrid');
    const todoList = passMain.querySelector('.thaActionTodoList,.thaTodoList,.thaTodoGroups');
    const builder = passMain.querySelector('.passReviewPanel');
    const anchor = selectedPlan || builder || todoList;
    if (anchor?.parentElement && panel.previousElementSibling !== anchor) {
      anchor.after(panel);
      panel.classList.add('tha-order-spacer');
    }
  }

  function movePmrTimingPanel(pmrMain) {
    const panel = pmrMain?.querySelector?.('[data-tha-care-forecast-panel="pmr"]');
    if (!panel) return;
    const pmcpAnchor = findSectionByHeading(pmrMain, [/PASS Continued Care/i, /Preventative Maintenance Care Plan/i, /PMCP/i, /PASS Maintenance Calendar/i]);
    if (pmcpAnchor?.parentElement && panel.previousElementSibling !== pmcpAnchor) {
      pmcpAnchor.after(panel);
      panel.classList.add('tha-order-spacer');
    }
  }

  function ensurePmrSupportingToggle(section) {
    if (!section || section.querySelector('.tha-pmr-supporting-output-toggle')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'tha-pmr-supporting-output-toggle noPrint';
    const sync = () => {
      toggle.textContent = section.classList.contains('tha-output-collapsed') ? 'Open supporting info' : 'Collapse supporting info';
      toggle.setAttribute('aria-expanded', String(!section.classList.contains('tha-output-collapsed')));
    };
    section.classList.add('tha-output-collapsed');
    toggle.addEventListener('click', () => {
      section.classList.toggle('tha-output-collapsed');
      sync();
    });
    sync();

    const note = document.createElement('p');
    note.className = 'tha-pmr-supporting-output-note';
    note.textContent = 'Accessory reference material only. This belongs low in the PMR and does not replace the room-by-room, trade-by-trade, or PMCP action sections.';

    const lede = section.querySelector('.lede');
    if (lede) lede.after(note, toggle);
    else section.prepend(toggle);
  }

  function convertPmrSupportingToOutput(pmrMain) {
    const section = pmrMain?.querySelector?.('.baselineCare.tha-supporting-builder');
    if (!section) return;
    section.classList.remove('tha-supporting-collapsed');
    section.classList.add('tha-pmr-supporting-output', 'tha-order-spacer');
    setHeading(section, 'Optional Supporting Home Care Info');
    setLede(section, 'Extra homeowner-care reference material included in the PMR only when selected. This is accessory information, not an action list or project-management section.');
    ensurePmrSupportingToggle(section);
    if (pmrMain && section.parentElement === pmrMain && section.nextElementSibling) pmrMain.append(section);
    else if (pmrMain && section.parentElement !== pmrMain) pmrMain.append(section);
  }

  function addPassSupportingPlacementNote(passMain) {
    if (!passMain || passMain.querySelector('.tha-pass-supporting-anchor-note')) return;
    const anchor = passMain.querySelector('[data-tha-care-forecast-panel="pass"]') || passMain.querySelector('.thaActionTodoList,.thaTodoList,.thaTodoGroups,.passPlanSummary,.passReviewPanel');
    if (!anchor?.parentElement) return;
    const note = document.createElement('p');
    note.className = 'tha-pass-supporting-anchor-note tha-order-spacer';
    note.textContent = 'Supporting Home Care Info Builder belongs low in the PASS / PMCP workflow. PMR only receives the selected supporting reference items as an accessory section near the bottom.';
    anchor.after(note);
  }

  function run() {
    installStyles();
    enhanceSupportingInfo(document);
    reframeTimingPanels(document);
    const passMain = document.querySelector('main.pmr.passWorkspace');
    const pmrMain = document.querySelector('main.pmr:not(.passWorkspace)');
    movePassTimingPanel(passMain);
    movePmrTimingPanel(pmrMain);
    convertPmrSupportingToOutput(pmrMain);
    addPassSupportingPlacementNote(passMain);
    document.body?.setAttribute(RUN_ATTR, 'true');
  }

  let scheduled = false;
  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      run();
      window.setTimeout(run, 150);
    });
  }

  function start() {
    run();
    new MutationObserver(scheduleRun).observe(document.body, { childList:true, subtree:true, characterData:true });
    window.addEventListener('tha:set-view', () => window.setTimeout(run, 150));
    window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) scheduleRun(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();