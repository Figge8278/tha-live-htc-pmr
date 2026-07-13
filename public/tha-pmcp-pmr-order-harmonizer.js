(() => {
  const STYLE_ID = 'tha-pmcp-pmr-order-harmonizer-styles';
  const RUN_ATTR = 'data-tha-order-harmonized';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-pmcp-timing-panel{
        border-color:#b9dfb4!important;
        background:#f7fcf5!important;
        box-shadow:inset 6px 0 0 rgba(82,170,75,.28)!important;
      }
      .tha-pmcp-timing-panel h2::after{content:"PMCP / PASS timing"!important;color:#285c30!important;border-color:#b9dfb4!important;background:#fff!important}
      .tha-pmr-supporting-output{
        border-color:#d7c4ef!important;
        background:#fbf9ff!important;
        box-shadow:inset 6px 0 0 rgba(116,90,145,.22)!important;
      }
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
      @media print{
        .tha-pmr-supporting-output-toggle,.tha-pmr-supporting-output-note{display:none!important}
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
    return sections.find(section => {
      const heading = headingText(section);
      return patterns.some(pattern => pattern.test(heading));
    }) || null;
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
    if (pmrMain && section.parentElement === pmrMain && section.nextElementSibling) {
      pmrMain.append(section);
    } else if (pmrMain && section.parentElement !== pmrMain) {
      pmrMain.append(section);
    }
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
    new MutationObserver(scheduleRun).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('tha:set-view', () => window.setTimeout(run, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();