(() => {
  const HTC_ICONS = {
    'Handy Services': '🧰',
    Appliances: '⚙️',
    Electrical: '🔌',
    Plumbing: '🚿',
    'HVAC / Mechanical': '🌡️',
    'General Contractor / Remodel': '🦺',
    'Carpentry / Decks / Fences': '🔨',
    'Painting / Staining / Protective Coatings': '🎨',
    'Exterior & Site / Grounds': '🏠',
    'Safety / Life Safety': '🔥',
    Pest: '🐜',
    'Specialty / Other': '🔎'
  };

  const FIELD_PREP_ICON = {
    Electrical: '🔌',
    'Plumbing / Water': '🚿',
    'HVAC / Comfort': '🌡️',
    'Roof / Exterior / Drainage': '🏠',
    'Windows / Doors / Paint': '🪟',
    'Safety / Pests / Fireplaces': '🔥',
    'Product info / documents / unknowns': '📋',
    'Additional THA notes': '📝'
  };

  function installStyles() {
    if (document.getElementById('tha-layout-repair-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-layout-repair-styles';
    style.textContent = `
      /* One clear layout: compact collapsed cards, full-width detail when opened. */
      .passWorkspace .passReviewGrid{grid-template-columns:1fr!important}
      .passWorkspace .passReviewCard{width:100%!important}
      .passWorkspace .passOutlookGrid{display:block!important}
      .passWorkspace .passOutlookGrid>*{display:block!important;width:100%!important;grid-column:1/-1!important}
      .passWorkspace .tha-clean-output-group,.passWorkspace .tha-pass-output-group{display:block!important;width:100%!important}
      .passWorkspace .tha-clean-output-list,.passWorkspace .tha-pass-output-card-list{display:grid!important;grid-template-columns:1fr!important}
      .passWorkspace .tha-clean-output-card,.passWorkspace .tha-output-card{width:100%!important}
      .cleanFieldPrep .tha-clean-prep-icon,.passWorkspace .passCategoryIcon,.passWorkspace .tha-clean-trade-icon,.passWorkspace .tha-pass-output-group .passCategoryIcon{font-size:18px!important;line-height:1!important}
      .cleanFieldPrep .tha-clean-prep-icon svg,.passWorkspace .passCategoryIcon svg,.passWorkspace .tha-clean-trade-icon svg,.passWorkspace .tha-pass-output-group .passCategoryIcon svg{display:none!important}
    `;
    document.head.append(style);
  }

  function textOfHeading(heading) {
    return heading.dataset.cleanTitle || heading.dataset.thaOriginalHeading ||
      heading.querySelector('.tha-prep-header-label')?.textContent?.trim() ||
      heading.textContent.replace(/Open fields|Collapse fields/g, '').trim();
  }

  function fixFieldPrepIcons() {
    document.querySelectorAll('.cleanFieldPrep .intakeSubsection').forEach(section => {
      const heading = section.querySelector(':scope > h3');
      if (!heading) return;
      const title = textOfHeading(heading);
      const emoji = FIELD_PREP_ICON[title];
      if (!emoji) return;
      let icon = heading.querySelector('.tha-clean-prep-icon');
      if (!icon) {
        icon = document.createElement('span');
        icon.className = 'tha-clean-prep-icon';
        heading.prepend(icon);
      }
      icon.replaceChildren(document.createTextNode(emoji));
    });
  }

  function categoryForGroup(group) {
    const explicit = group.dataset.thaCategory;
    if (explicit && HTC_ICONS[explicit]) return explicit;
    const title = group.querySelector('h3')?.textContent?.toLowerCase() || '';
    if (/handy/.test(title)) return 'Handy Services';
    if (/appliance/.test(title)) return 'Appliances';
    if (/electrical/.test(title)) return 'Electrical';
    if (/plumb/.test(title)) return 'Plumbing';
    if (/hvac|heating|cooling|mechanical/.test(title)) return 'HVAC / Mechanical';
    if (/general contractor|project|structure|remodel/.test(title)) return 'General Contractor / Remodel';
    if (/carpentry|deck|fence/.test(title)) return 'Carpentry / Decks / Fences';
    if (/paint|stain|finish|coating/.test(title)) return 'Painting / Staining / Protective Coatings';
    if (/roof|gutter|drainage|exterior|grounds/.test(title)) return 'Exterior & Site / Grounds';
    if (/safety/.test(title)) return 'Safety / Life Safety';
    if (/pest/.test(title)) return 'Pest';
    return 'Specialty / Other';
  }

  function fixPassIcons() {
    document.querySelectorAll('.passWorkspace .passCategoryGroup, .passWorkspace .tha-clean-output-group, .passWorkspace .tha-pass-output-group').forEach(group => {
      const category = categoryForGroup(group);
      const emoji = HTC_ICONS[category];
      if (!emoji) return;
      let box = group.querySelector('.passCategoryIcon, .tha-clean-trade-icon');
      if (!box && group.classList.contains('tha-clean-output-group')) {
        box = document.createElement('span');
        box.className = 'tha-clean-trade-icon';
        group.querySelector('.tha-clean-output-header')?.prepend(box);
      }
      if (box) {
        box.replaceChildren(document.createTextNode(emoji));
        box.setAttribute('aria-label', `${category} trade`);
      }
    });
  }

  function closeReviewCards() {
    document.querySelectorAll('.passWorkspace .passReviewCard').forEach(card => {
      if (card.dataset.thaStartCollapsed === 'true') return;
      const button = card.querySelector('.passReviewCardToggle');
      if (button && /collapse/i.test(button.textContent)) button.click();
      card.dataset.thaStartCollapsed = 'true';
    });
  }

  function directFieldPrepToggle(button) {
    const section = button.closest('.intakeSubsection');
    if (!section) return;
    const opening = section.classList.contains('cleanCollapsed');
    section.classList.toggle('cleanCollapsed', !opening);
    section.classList.toggle('cleanExpanded', opening);
    button.textContent = opening ? 'Collapse fields' : 'Open fields';
    button.setAttribute('aria-expanded', String(opening));
  }

  function directOutputSectionToggle(button) {
    const group = button.closest('.tha-clean-output-group, .tha-pass-output-group');
    const list = group?.querySelector('.tha-clean-output-list, .tha-pass-output-card-list');
    if (!list) return;
    const opening = list.hidden;
    list.hidden = !opening;
    button.textContent = opening ? 'Collapse section' : 'Open section';
    button.setAttribute('aria-expanded', String(opening));
  }

  function directOutputDetailToggle(button) {
    const card = button.closest('.tha-clean-output-card, .tha-output-card');
    const details = card?.querySelector('.findGrid');
    if (!details) return;
    const opening = details.hidden;
    details.hidden = !opening;
    button.textContent = opening ? 'Hide details' : 'View details';
    button.setAttribute('aria-expanded', String(opening));
  }

  function installControls() {
    if (window.__thaLayoutRepairControls) return;
    window.__thaLayoutRepairControls = true;
    document.addEventListener('click', event => {
      const fieldButton = event.target.closest('.tha-clean-prep-toggle');
      if (fieldButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        directFieldPrepToggle(fieldButton);
        return;
      }
      const sectionButton = event.target.closest('.tha-clean-section-toggle, .tha-output-section-toggle');
      if (sectionButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        directOutputSectionToggle(sectionButton);
        return;
      }
      const detailButton = event.target.closest('.tha-clean-detail-toggle, .tha-output-card-toggle');
      if (detailButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        directOutputDetailToggle(detailButton);
      }
    }, true);
  }

  function run() {
    installStyles();
    installControls();
    fixFieldPrepIcons();
    fixPassIcons();
    closeReviewCards();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
