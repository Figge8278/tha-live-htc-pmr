(() => {
  const FIELD_PREP_FOR_CATEGORY = {
    'Electrical': 'Electrical',
    'Plumbing': 'Plumbing / Water',
    'HVAC / Mechanical': 'HVAC / Comfort',
    'Exterior & Site / Grounds': 'Roof / Exterior / Drainage',
    'Safety / Life Safety': 'Safety / Pests / Fireplaces'
  };

  function sectionHeading(title) {
    return Array.from(document.querySelectorAll('.tha-field-prep .intakeSubsection h3')).find(heading => {
      const label = heading.querySelector('.tha-prep-header-label')?.textContent?.trim() || heading.textContent.replace(/Open fields|Collapse fields/g, '').trim();
      return label === title;
    });
  }

  function iconFromFieldPrep(category) {
    const title = FIELD_PREP_FOR_CATEGORY[category];
    const icon = title ? sectionHeading(title)?.querySelector('.tha-prep-header-icon svg') : null;
    return icon ? icon.cloneNode(true) : null;
  }

  function iconFromCategoryBadge(category, root) {
    const badge = Array.from(root.querySelectorAll('.categoryBadge')).find(node => node.textContent.trim() === category);
    const icon = badge?.querySelector('svg');
    return icon ? icon.cloneNode(true) : null;
  }

  function passCategoryIcon(category, group) {
    return iconFromFieldPrep(category) || iconFromCategoryBadge(category, group) || null;
  }

  function syncPassIcons() {
    document.querySelectorAll('.passWorkspace .passCategoryGroup, .passWorkspace .tha-pass-output-group').forEach(group => {
      const category = group.dataset.thaCategory || '';
      const box = group.querySelector('.passCategoryIcon');
      if (!category || !box) return;
      const icon = passCategoryIcon(category, group);
      if (icon) {
        box.replaceChildren(icon);
        box.classList.add('tha-unified-trade-icon');
        box.setAttribute('aria-label', `${category} trade`);
      }
    });
  }

  function setButton(button, open, closedText, openText) {
    button.textContent = open ? openText : closedText;
    button.setAttribute('aria-expanded', String(open));
  }

  function sectionToggle(button) {
    const group = button.closest('.tha-pass-output-group');
    const list = group?.querySelector('.tha-pass-output-card-list');
    if (!list) return false;
    const opening = list.hidden;
    list.hidden = !opening;
    group.classList.toggle('isOpen', opening);
    setButton(button, opening, 'Open section', 'Collapse section');
    return true;
  }

  function detailToggle(button) {
    const card = button.closest('.tha-output-card');
    const details = card?.querySelector('.findGrid');
    if (!details) return false;
    const opening = details.hidden;
    details.hidden = !opening;
    card.classList.toggle('isDetailsOpen', opening);
    setButton(button, opening, 'View details', 'Hide details');
    return true;
  }

  function installReliableToggles() {
    if (document.documentElement.dataset.thaPassOutputControls) return;
    document.documentElement.dataset.thaPassOutputControls = 'true';
    document.addEventListener('click', event => {
      const sectionButton = event.target.closest('.tha-output-section-toggle');
      if (sectionButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        sectionToggle(sectionButton);
        return;
      }
      const detailButton = event.target.closest('.tha-output-card-toggle');
      if (detailButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        detailToggle(detailButton);
      }
    }, true);
  }

  function installStyles() {
    if (document.getElementById('tha-pass-output-controls-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-output-controls-styles';
    style.textContent = `
      .passWorkspace .passCategoryIcon.tha-unified-trade-icon{width:32px!important;height:32px!important;border-radius:50%!important;background:#fff7e9!important;border:1px solid #e4c38d!important;color:#c77716!important;box-shadow:0 2px 7px rgba(191,132,32,.12)!important}
      .passWorkspace .passCategoryIcon.tha-unified-trade-icon svg{width:17px!important;height:17px!important;stroke-width:2.25}
      .passWorkspace .tha-pass-output-group.isOpen>.tha-pass-output-group-header{border-bottom:1px solid #dce7ec}
      .passWorkspace .tha-output-card.isDetailsOpen{box-shadow:0 8px 18px rgba(11,54,88,.08)}
    `;
    document.head.append(style);
  }

  function run() {
    installStyles();
    installReliableToggles();
    syncPassIcons();
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
