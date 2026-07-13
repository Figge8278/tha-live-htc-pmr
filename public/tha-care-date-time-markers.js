(() => {
  const STYLE_ID = 'tha-care-date-time-markers-styles';
  const MARKER_CLASS = 'tha-care-time-marker';

  const CARE_MATCHES = [
    'furnace filter replacement',
    'last furnace filter',
    'furnace service history',
    'last furnace servicing',
    'furnace servicing',
    'a/c service history',
    'a/c or heat pump servicing',
    'ac service history',
    'water heater flush',
    'water heater flush / age',
    'water heater',
    'sewer',
    'sewer line scope',
    'sewer / irrigation history',
    'irrigation',
    'sprinkler',
    'dryer vent',
    'dryer lint',
    'dryer duct',
    'chimney inspection',
    'chimney',
    'fireplace',
    'smoke / co',
    'smoke/co',
    'smoke detector',
    'co detector',
    'fire extinguishers',
    'extinguisher',
    'last exterior paint',
    'paint / stain',
    'paint stain',
    'roof age',
    'last replacement',
    'known roof leaks'
  ];

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tha-care-time-marker{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:4px!important;
        border:1px solid #f2a45f!important;
        border-radius:999px!important;
        background:#fff4e8!important;
        color:#a85107!important;
        padding:5px 8px!important;
        min-height:28px!important;
        font-size:10px!important;
        font-weight:950!important;
        line-height:1!important;
        white-space:nowrap!important;
        box-shadow:0 0 0 2px rgba(242,164,95,.12)!important;
        flex:0 0 auto!important;
        align-self:center!important;
      }
      .tha-care-time-marker::before{
        content:'🕒';
        font-size:12px!important;
        line-height:1!important;
      }
      .tha-care-time-marker.is-filled{
        border-color:#8fd08b!important;
        background:#ecf9ec!important;
        color:#2f6a2b!important;
        box-shadow:0 0 0 2px rgba(82,170,75,.12)!important;
      }
      .tha-care-time-marker.is-filled::before{content:'✓';font-weight:950!important;color:#2f6a2b!important}

      /* Quick Intake: title expands, then Time, then Open/Collapse. */
      .tha-quick-header{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
      }
      .tha-quick-header .tha-quick-title{min-width:0!important;flex:1 1 auto!important}
      .tha-quick-header .tha-care-time-marker{
        margin-left:auto!important;
        margin-right:0!important;
        order:2!important;
      }
      .tha-quick-header .tha-quick-action{
        order:3!important;
        flex:0 0 auto!important;
        align-self:center!important;
        min-height:28px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
      }

      /* Field Prep: keep Open fields far right, with Time/Timed immediately to its left. */
      .intakeSubsection>h3{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        flex-wrap:nowrap!important;
        width:100%!important;
      }
      .intakeSubsection>h3 .tha-prep-completion{
        order:7!important;
        margin-left:8px!important;
        margin-right:0!important;
        flex:0 0 auto!important;
      }
      .intakeSubsection>h3 .tha-care-time-marker{
        order:98!important;
        margin-left:auto!important;
        margin-right:0!important;
        vertical-align:middle!important;
      }
      .intakeSubsection>h3 .tha-clean-prep-toggle{
        order:99!important;
        margin-left:0!important;
        margin-right:0!important;
        flex:0 0 auto!important;
        align-self:center!important;
      }
      .categoryQuestion>.tha-care-time-marker,
      label.notes>.tha-care-time-marker{margin-top:8px!important;justify-self:start!important}
      @media(max-width:720px){
        .tha-care-time-marker{padding:4px 6px!important;font-size:9px!important;min-height:26px!important}
        .tha-care-time-marker::before{font-size:11px!important}
        .tha-quick-header{gap:6px!important;align-items:center!important}
        .tha-quick-header .tha-care-time-marker{margin-left:auto!important}
        .intakeSubsection>h3{gap:6px!important;flex-wrap:wrap!important}
        .intakeSubsection>h3 .tha-care-time-marker{margin-left:auto!important}
      }
    `;
    document.head.append(style);
  }

  function careRelevant(element) {
    if (!element) return false;
    if (element.querySelector?.('.tha-care-date-widget')) return true;
    const text = textOf(element);
    return CARE_MATCHES.some(token => text.includes(token));
  }

  function timingFilled(scope) {
    const widgets = Array.from(scope.querySelectorAll?.('.tha-care-date-widget') || []);
    return widgets.some(widget => Array.from(widget.querySelectorAll('input,select,textarea')).some(field => String(field.value || '').trim()));
  }

  function ensureMarker(container, target, label = 'Time') {
    if (!container || !target || !careRelevant(container)) return;
    let marker = target.querySelector?.(`:scope > .${MARKER_CLASS}`);
    if (!marker) {
      marker = document.createElement('span');
      marker.className = MARKER_CLASS;
      marker.textContent = label;
      marker.title = 'Care timing field available. Add last-done date or approximate timeframe for PMR forecasting.';
      const action = target.querySelector?.('.tha-quick-action, .tha-clean-prep-toggle, button');
      if (action && action.parentElement === target) target.insertBefore(marker, action);
      else target.append(marker);
    }
    const filled = timingFilled(container);
    marker.classList.toggle('is-filled', filled);
    marker.textContent = filled ? 'Timed' : label;
  }

  function markQuickIntakeCards(root = document) {
    root.querySelectorAll?.('.homeownerLane .tha-quick-card').forEach(card => {
      const header = card.querySelector('.tha-quick-header');
      ensureMarker(card, header, 'Time');
    });
  }

  function markFieldPrepSections(root = document) {
    root.querySelectorAll?.('.intakeLane .intakeSubsection').forEach(section => {
      const heading = section.querySelector(':scope > h3');
      ensureMarker(section, heading, 'Time');
    });
  }

  function markLooseTimingLabels(root = document) {
    root.querySelectorAll?.('.intakeLane label.categoryQuestion, .intakeLane label.notes, .intakeLane .intakeQuestion').forEach(label => {
      if (label.closest('.tha-quick-card')) return;
      if (label.closest('.intakeSubsection')) return;
      ensureMarker(label, label, 'Time');
    });
  }

  function run() {
    installStyles();
    markQuickIntakeCards(document);
    markFieldPrepSections(document);
    markLooseTimingLabels(document);
  }

  let scheduled = false;
  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      run();
      window.setTimeout(run, 120);
    });
  }

  function start() {
    run();
    const observer = new MutationObserver(scheduleRun);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'value'] });
    document.addEventListener('input', scheduleRun);
    document.addEventListener('change', scheduleRun);
    window.addEventListener('tha:set-view', () => window.setTimeout(run, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();