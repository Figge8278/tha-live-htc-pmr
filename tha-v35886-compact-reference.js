(() => {
  const ID = 'tha-v35886-compact-reference';
  if (window[ID]) return;
  window[ID] = true;

  const value = field => String(field?.value || '').trim();

  function requiredFields(root) {
    if (!root) return [];
    const labels = Array.from(root.querySelectorAll(
      'label.thaRequiredField,label.thaV3587MustAnswer,label.thaV3584MustAnswer'
    ));
    const seen = new Set();
    return labels.map(label => label.querySelector('input,textarea,select')).filter(field => {
      if (!field || seen.has(field)) return false;
      seen.add(field);
      return true;
    });
  }

  function missingRequired(root) {
    return requiredFields(root).filter(field => !value(field));
  }

  function refreshSection(section) {
    const heading = section?.querySelector(':scope > h3');
    const toggle = heading?.querySelector('.tha-clean-prep-toggle');
    if (!heading || !toggle) return;
    const required = requiredFields(section);
    const missing = missingRequired(section);
    let alert = heading.querySelector(':scope > .tha-v35886-required-alert');
    if (!required.length || !missing.length) {
      alert?.remove();
      return;
    }
    if (!alert) {
      alert = document.createElement('span');
      alert.className = 'tha-v35886-required-alert';
      toggle.before(alert);
    }
    alert.textContent = `Must answer · ${missing.length} needed`;
    alert.title = 'Open this section to complete the required PMR home-reference field.';
  }

  function refreshLane(lane) {
    if (!lane) return;
    lane.querySelectorAll('.intakeSubsection').forEach(refreshSection);
    const summary = lane.querySelector(':scope > summary');
    if (!summary) return;
    const missing = missingRequired(lane);
    let alert = summary.querySelector(':scope > .tha-v35886-lane-alert');
    if (!missing.length) {
      alert?.remove();
      return;
    }
    if (!alert) {
      alert = document.createElement('span');
      alert.className = 'tha-v35886-lane-alert';
      summary.append(alert);
    }
    alert.textContent = `Must answer · ${missing.length} remaining`;
    alert.title = 'Required home-reference answers remain unresolved inside THA Internal Intake / Field Prep.';
  }

  function refreshIntake() {
    document.querySelectorAll('details.intakeLane:not(.homeownerLane)').forEach(refreshLane);
  }

  function openPmrReferencesOnce() {
    const drawer = document.querySelector('main.pmr:not(.passWorkspace) .tha-v53-need-to-know');
    if (!drawer || drawer.dataset.v35886Opened === 'true') return;
    drawer.dataset.v35886Opened = 'true';
    drawer.open = true;
  }

  function run() {
    refreshIntake();
    openPmrReferencesOnce();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      run();
    });
  }

  document.addEventListener('input', event => {
    if (event.target.closest('.cleanFieldPrep')) schedule();
  }, true);
  document.addEventListener('change', event => {
    if (event.target.closest('.cleanFieldPrep')) schedule();
  }, true);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
  schedule();
})();
