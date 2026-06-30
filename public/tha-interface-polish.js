(() => {
  const PREP_ORDER = [
    'Handy Services', 'Appliances', 'Electrical', 'Plumbing', 'HVAC / Mechanical',
    'Roof, Gutters & Drainage', 'Carpentry / Decks / Fences',
    'Paint, Stain & Protective Finishes', 'Safety / Life Safety', 'Pest',
    'General Contractor / Remodel', 'Specialty / Other'
  ];

  const PREP_ICONS = {
    'Handy Services': '🧰', Appliances: '⚙️', Electrical: '🔌', Plumbing: '🚿',
    'HVAC / Mechanical': '🌡️', 'Roof, Gutters & Drainage': '🏠',
    'Carpentry / Decks / Fences': '🔨', 'Paint, Stain & Protective Finishes': '🎨',
    'Safety / Life Safety': '🛡️', Pest: '🐜', 'General Contractor / Remodel': '🦺', 'Specialty / Other': '🔎'
  };

  function applyPolishStyles() {
    if (document.getElementById('tha-interface-refinement-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-interface-refinement-styles';
    style.textContent = `
      .passWorkspace .tha-care-item-title{color:#58466f!important;font-size:20px!important;font-weight:750!important;letter-spacing:-.01em!important;padding:0 0 6px 10px!important;border-bottom:1px solid #b8aec5!important}
      .passWorkspace .tha-care-item-title::before{background:#735c90!important;opacity:.8!important;top:2px!important;bottom:8px!important;width:3px!important}
      .passWorkspace .passReviewCard.workflow-orange .tha-care-item-title,.passWorkspace .passReviewCard.workflow-green .tha-care-item-title,.passWorkspace .passReviewCard.workflow-violet .tha-care-item-title,.passWorkspace .passReviewCard.workflow-gray .tha-care-item-title{color:#58466f!important}
      .passWorkspace .passCategoryIcon,.passWorkspace .tha-pass-output-group .passCategoryIcon{background:#fff7e9!important;color:#c77716!important;border:1px solid #e4c38d!important;box-shadow:0 2px 7px rgba(191,132,32,.12)}
      .passWorkspace .tha-pass-output-card-list{grid-template-columns:1fr!important}
      .passWorkspace .tha-output-card .tha-care-item-title{color:#58466f!important}
      .passWorkspace .tha-output-card.tha-output-green .tha-care-item-title{color:#3c6f43!important}
      .tha-field-prep .tha-prep-heading-icon{background:#fff7e9!important;color:#c77716!important;border:1px solid #e4c38d!important;box-shadow:0 2px 7px rgba(191,132,32,.12)}
      .tha-field-prep .tha-field-prep-trade-rail{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
      .tha-field-prep .tha-field-prep-trade-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid #e4c38d;border-radius:999px;background:#fff7e9;color:#805715;font-size:12px;font-weight:850;line-height:1}
      .tha-field-prep .tha-field-prep-trade-chip b{font-size:14px;line-height:1}
      .tha-field-prep .intakeSubsection h3{font-size:17px!important;font-weight:800!important;color:#183f58!important}
      .tha-field-prep .tha-prep-field-card .categoryBadge{background:#fff7e9!important;border-color:#e4c38d!important;color:#9a6511!important}
      .tha-field-prep .tha-prep-field-card .categoryBadge svg{color:#c77716!important}
    `;
    document.head.append(style);
  }

  function buttonLabel(button, open, closedLabel, openLabel) {
    button.textContent = open ? openLabel : closedLabel;
    button.setAttribute('aria-expanded', String(open));
  }

  function careTileTitles() {
    document.querySelectorAll('.passWorkspace .passReviewCard h4, .passWorkspace .tha-output-card h3').forEach(title => title.classList.add('tha-care-item-title'));
    document.querySelectorAll('.passWorkspace .passCategoryIcon, .passWorkspace .tha-pass-output-group .passCategoryIcon').forEach(icon => icon.classList.add('tradeBadge'));
  }

  function outputSections() {
    document.querySelectorAll('.passWorkspace .tha-readonly-output').forEach(block => {
      const banner = block.querySelector('.tha-readonly-banner');
      if (banner && !banner.querySelector('.tha-output-rule')) {
        const note = document.createElement('small');
        note.className = 'tha-output-rule';
        note.textContent = 'Included in PMR controls what appears here. Green means completed or verified — it is not a separate homeowner-approval setting.';
        banner.append(note);
      }

      block.querySelectorAll('.tha-pass-output-group').forEach(group => {
        const list = group.querySelector('.tha-pass-output-card-list');
        const header = group.querySelector('.tha-pass-output-group-header');
        if (!list || !header) return;
        const cards = Array.from(list.children);
        cards.forEach(card => card.classList.toggle('tha-output-green', /\bcompleted\b|verified/i.test(card.textContent)));
        cards.sort((a, b) => Number(b.classList.contains('tha-output-green')) - Number(a.classList.contains('tha-output-green')));
        cards.forEach(card => list.append(card));

        if (!header.querySelector('.tha-output-section-toggle')) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'tha-output-section-toggle';
          let open = false;
          list.hidden = true;
          buttonLabel(button, open, 'Open section', 'Collapse section');
          button.addEventListener('click', () => {
            open = !open;
            list.hidden = !open;
            group.classList.toggle('isOpen', open);
            buttonLabel(button, open, 'Open section', 'Collapse section');
          });
          header.append(button);
        }
      });
    });
  }

  function prepGroupFor(section) {
    const text = `${section.dataset.thaOriginalHeading || ''} ${section.textContent}`.toLowerCase();
    if (/(roof|gutter|downspout|drainage|ice dam|flashing)/.test(text)) return 'Roof, Gutters & Drainage';
    if (/(paint|stain|coating|caulk|finish)/.test(text)) return 'Paint, Stain & Protective Finishes';
    if (/(dryer vent|handy|minor repair|adjustment)/.test(text)) return 'Handy Services';
    if (/(dishwasher|washer|dryer|refrigerator|appliance)/.test(text)) return 'Appliances';
    if (/(electrical|outlet|panel|breaker|gfci|solar)/.test(text)) return 'Electrical';
    if (/(plumbing|water heater|shutoff|sink|toilet|faucet|sump)/.test(text)) return 'Plumbing';
    if (/(hvac|furnace|heat pump|air conditioner|thermostat|filter)/.test(text)) return 'HVAC / Mechanical';
    if (/(deck|fence|carpentry|cabinet|trim|hinge|drawer)/.test(text)) return 'Carpentry / Decks / Fences';
    if (/(smoke|co detector|fire extinguisher|safety)/.test(text)) return 'Safety / Life Safety';
    if (/(pest|rodent|termite|ant|insect)/.test(text)) return 'Pest';
    if (/(remodel|structural|foundation|permit|general contractor)/.test(text)) return 'General Contractor / Remodel';
    return 'Specialty / Other';
  }

  function headingIcon(section, group) {
    const source = section.querySelector('.categoryBadge svg');
    const icon = document.createElement('span');
    icon.className = 'tha-prep-heading-icon tradeBadge';
    if (source) icon.append(source.cloneNode(true));
    else icon.textContent = PREP_ICONS[group] || '•';
    return icon;
  }

  function restoreFieldPrepHeadings() {
    document.querySelectorAll('.tha-field-prep .intakeSubsection').forEach(section => {
      const heading = section.querySelector('h3');
      if (!heading) return;
      const original = heading.dataset.thaOriginalHeading || section.dataset.thaOriginalHeading || heading.textContent.trim();
      heading.dataset.thaOriginalHeading = original;
      const group = prepGroupFor(section);
      section.dataset.thaPrepGroup = group;

      const toggle = heading.querySelector('.tha-prep-toggle');
      if (heading.dataset.thaRefined !== 'true') {
        heading.replaceChildren(headingIcon(section, group), document.createTextNode(original));
        if (toggle) heading.append(toggle);
        heading.dataset.thaRefined = 'true';
      }
      section.querySelectorAll('.intakeGrid > label').forEach(label => label.classList.add('tha-prep-field-card'));
    });
  }

  function buildFieldPrepRail() {
    document.querySelectorAll('.tha-field-prep').forEach(lane => {
      const groups = new Set(Array.from(lane.querySelectorAll('.intakeSubsection')).map(prepGroupFor));
      let rail = lane.querySelector('.tha-field-prep-trade-rail');
      if (!rail) {
        rail = document.createElement('div');
        rail.className = 'tha-field-prep-trade-rail';
        lane.querySelector('.tha-field-prep-guide')?.after(rail);
      }
      rail.replaceChildren(...PREP_ORDER.filter(group => groups.has(group)).map(group => {
        const chip = document.createElement('span');
        chip.className = 'tha-field-prep-trade-chip';
        chip.innerHTML = `<b aria-hidden="true">${PREP_ICONS[group]}</b>${group}`;
        return chip;
      }));
    });
  }

  function runPolish() {
    applyPolishStyles();
    careTileTitles();
    outputSections();
    restoreFieldPrepHeadings();
    buildFieldPrepRail();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      runPolish();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
