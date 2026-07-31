(() => {
  const ICONS = {
    'Handy Services': '🧰',
    Appliances: '⚙️',
    Electrical: '🔌',
    Plumbing: '🚿',
    'HVAC / Mechanical': '🌡️',
    'Roof, Gutters & Drainage': '🏠',
    'Carpentry / Decks / Fences': '🔨',
    'Paint, Stain & Protective Finishes': '🎨',
    'Safety / Life Safety': '🔥',
    Pest: '🐜',
    'General Contractor / Remodel': '🦺',
    'Specialty / Other': '🔎'
  };

  function installStyles() {
    if (document.getElementById('tha-interface-refinement-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-interface-refinement-styles';
    style.textContent = `
      .passWorkspace .tha-care-item-title{color:#58466f!important;font-size:20px!important;font-weight:750!important;letter-spacing:-.01em!important;padding:0 0 6px 10px!important;border-bottom:1px solid #b8aec5!important}
      .passWorkspace .tha-care-item-title::before{background:#735c90!important;opacity:.8!important;top:2px!important;bottom:8px!important;width:3px!important}
      .passWorkspace .passReviewCard.workflow-orange .tha-care-item-title,.passWorkspace .passReviewCard.workflow-green .tha-care-item-title,.passWorkspace .passReviewCard.workflow-violet .tha-care-item-title,.passWorkspace .passReviewCard.workflow-gray .tha-care-item-title{color:#58466f!important}
      .passWorkspace .passCategoryIcon,.passWorkspace .tha-pass-output-group .passCategoryIcon{background:#fff7e9!important;color:#c77716!important;border:1px solid #e4c38d!important;box-shadow:0 2px 7px rgba(191,132,32,.12)}
      .passWorkspace .tha-readonly-output .passOutlookGrid{display:grid!important;grid-template-columns:1fr!important}
      .passWorkspace .tha-readonly-output .tha-pass-output-group{width:100%!important;grid-column:1/-1!important}
      .passWorkspace .tha-pass-output-card-list{display:grid!important;grid-template-columns:1fr!important}
      .passWorkspace .tha-output-card .tha-care-item-title{color:#58466f!important}
      .passWorkspace .tha-output-card.tha-output-green .tha-care-item-title{color:#3c6f43!important}
      .passWorkspace .tha-care-guidance{grid-column:1/-1!important;margin:2px 0 0;padding:12px 13px;border:1px solid #d7e2e7;border-radius:12px;background:#f7fbfd;color:#405764}
      .passWorkspace .tha-care-guidance h5{margin:0 0 8px;color:#173e57;font-size:12px;letter-spacing:.05em;text-transform:uppercase}
      .passWorkspace .tha-care-guidance p{margin:6px 0!important;padding:0!important;background:transparent!important;border-radius:0!important;line-height:1.45}
      .passWorkspace .tha-care-guidance strong{color:#173e57}
      .tha-field-prep .tha-field-prep-trade-rail{display:none!important}
      .tha-field-prep .intakeSubsection h3{font-size:17px!important;font-weight:800!important;color:#183f58!important}
      .tha-field-prep .tha-prep-tile-icon{display:inline-grid;place-items:center;width:34px;height:34px;margin:0 0 8px;border-radius:11px;background:#fff7e9;border:1px solid #e4c38d;box-shadow:0 2px 7px rgba(191,132,32,.12);font-size:18px;line-height:1}
      .tha-field-prep .tha-prep-field-card{position:relative!important}
      .tha-field-prep .tha-prep-field-card .categoryBadge{display:none!important}
    `;
    document.head.append(style);
  }

  function setButtonLabel(button, open, closedLabel, openLabel) {
    button.textContent = open ? openLabel : closedLabel;
    button.setAttribute('aria-expanded', String(open));
  }

  function careTileTitles() {
    document.querySelectorAll('.passWorkspace .passReviewCard h4, .passWorkspace .tha-output-card h3').forEach(title => title.classList.add('tha-care-item-title'));
    document.querySelectorAll('.passWorkspace .passCategoryIcon, .passWorkspace .tha-pass-output-group .passCategoryIcon').forEach(icon => icon.classList.add('tradeBadge'));
  }

  function guidanceFor(card) {
    const text = card.textContent.toLowerCase();
    if (/(dryer vent|dryer duct|exterior flap)/.test(text)) {
      return {
        title: 'Walkthrough guide: dryer vent care',
        why: 'A clear, intact dryer exhaust path helps the dryer run efficiently and reduces lint and heat buildup.',
        check: 'Confirm the exterior flap opens while the dryer is running, lint is not collecting at the outlet, and the duct route is not crushed or disconnected.',
        pro: 'Use a qualified dryer-vent professional for long, concealed, rooftop, or hard-to-access ducts. For a gas dryer, stop and use a qualified professional if anything involving the gas connection must be moved.'
      };
    }
    if (/(sump pump|sump)/.test(text)) {
      return {
        title: 'Walkthrough guide: sump pump test',
        why: 'A basic test helps confirm the pump and discharge path are ready before a heavy-rain event.',
        check: 'Only when the pit is safe to access, add water slowly until the float activates. Observe that the pump starts, water leaves through the discharge line, and the water does not flow back toward the foundation.',
        pro: 'Stop and call a plumbing or drainage professional if the pump does not start, trips power, runs continuously, makes unusual noise, or the discharge path is blocked or returns water toward the home.'
      };
    }
    if (/(gutter|downspout|roof|flashing|drainage|grading)/.test(text)) {
      return {
        title: 'Walkthrough guide: roof and water path',
        why: 'The goal is to move water from the roof and surrounding grade away from the home before it can affect finishes, siding, or the foundation.',
        check: 'Look for visible debris, loose downspout connections, water pooling near the home, and discharge that ends too close to the foundation.',
        pro: 'Use a roofing, gutter, or drainage professional for roof access, concealed leaks, damaged flashing, recurring ponding, or any suspected structural water issue.'
      };
    }
    if (/(furnace|heat pump|air conditioner|hvac|filter)/.test(text)) {
      return {
        title: 'Walkthrough guide: heating and cooling care',
        why: 'Routine attention supports comfort, equipment life, and early discovery of performance changes.',
        check: 'Confirm the filter size and replacement interval, note unusual noise or airflow changes, and keep service access clear.',
        pro: 'Use a licensed HVAC professional for refrigerant, combustion, electrical, drain-line, or performance issues that do not resolve with normal filter care.'
      };
    }
    if (/(water heater|shutoff|plumbing|faucet|toilet|sink)/.test(text)) {
      return {
        title: 'Walkthrough guide: plumbing and water care',
        why: 'Knowing the condition of water fixtures and shutoffs helps reduce the impact of small leaks and unexpected failures.',
        check: 'Note visible moisture, corrosion, slow drains, fixture operation, and whether the relevant shutoff is known and accessible.',
        pro: 'Use a licensed plumber for active leaks, aging valves that will not operate, drainage backup, water-heater service, or any repair that requires opening piping.'
      };
    }
    return {
      title: 'Walkthrough guide',
      why: 'This continued-care item is intended to keep a known home system visible before it turns into an urgent repair.',
      check: 'During the walkthrough, confirm current condition, note any change since the prior review, and record whether the recommended timing or responsible trade still makes sense.',
      pro: 'Use the listed trade when the item requires specialized diagnosis, access, licensing, or work beyond routine homeowner care.'
    };
  }

  function ensureGuidance(card) {
    const details = card.querySelector('.findGrid');
    if (!details || details.querySelector('.tha-care-guidance')) return;
    const guide = guidanceFor(card);
    const panel = document.createElement('section');
    panel.className = 'tha-care-guidance';
    panel.innerHTML = `<h5>${guide.title}</h5><p><strong>Why it matters:</strong> ${guide.why}</p><p><strong>What to look for:</strong> ${guide.check}</p><p><strong>When to use a pro:</strong> ${guide.pro}</p>`;
    details.append(panel);
  }

  function ensureDetailButton(card) {
    const details = card.querySelector('.findGrid');
    const top = card.querySelector('.findTop');
    if (!details || !top) return;
    ensureGuidance(card);
    let button = card.querySelector('.tha-output-card-toggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'tha-output-card-toggle';
      top.append(button);
    }
    if (!button.dataset.thaDetailReady) {
      details.hidden = true;
      setButtonLabel(button, false, 'View details', 'Hide details');
      button.dataset.thaDetailReady = 'true';
    }
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
        cards.forEach(card => {
          card.classList.toggle('tha-output-green', /\bcompleted\b|verified/i.test(card.textContent));
          ensureDetailButton(card);
        });
        cards.sort((a, b) => Number(b.classList.contains('tha-output-green')) - Number(a.classList.contains('tha-output-green')));
        cards.forEach(card => list.append(card));

        if (!header.querySelector('.tha-output-section-toggle')) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'tha-output-section-toggle';
          let open = false;
          list.hidden = true;
          setButtonLabel(button, open, 'Open section', 'Collapse section');
          button.addEventListener('click', () => {
            open = !open;
            list.hidden = !open;
            group.classList.toggle('isOpen', open);
            setButtonLabel(button, open, 'Open section', 'Collapse section');
          });
          header.append(button);
        }
      });
    });
  }

  function prepGroupFor(node) {
    const text = `${node.dataset?.thaOriginalHeading || ''} ${node.textContent || ''}`.toLowerCase();
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

  function restoreFieldPrepHeadings() {
    document.querySelectorAll('.tha-field-prep').forEach(lane => {
      lane.querySelector('.tha-field-prep-trade-rail')?.remove();
      lane.querySelectorAll('.intakeSubsection').forEach(section => {
        const heading = section.querySelector('h3');
        if (!heading) return;
        const original = heading.dataset.thaOriginalHeading || section.dataset.thaOriginalHeading || heading.textContent.trim();
        heading.dataset.thaOriginalHeading = original;
        const toggle = heading.querySelector('.tha-prep-toggle');
        if (heading.dataset.thaTileHeading !== 'true') {
          heading.replaceChildren(document.createTextNode(original));
          if (toggle) heading.append(toggle);
          heading.dataset.thaTileHeading = 'true';
        }

        section.querySelectorAll('.intakeGrid > label').forEach(tile => {
          const group = prepGroupFor(tile);
          tile.classList.add('tha-prep-field-card');
          tile.dataset.thaPrepGroup = group;
          tile.querySelector('.categoryBadge')?.remove();
          if (!tile.querySelector('.tha-prep-tile-icon')) {
            const icon = document.createElement('span');
            icon.className = 'tha-prep-tile-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = ICONS[group] || '•';
            tile.prepend(icon);
          }
        });
      });
    });
  }

  function installReliableDetailHandler() {
    if (document.documentElement.dataset.thaDetailHandler) return;
    document.documentElement.dataset.thaDetailHandler = 'true';
    document.addEventListener('click', event => {
      const button = event.target.closest('.tha-output-card-toggle');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const card = button.closest('.tha-output-card');
      const details = card?.querySelector('.findGrid');
      if (!details) return;
      const open = details.hidden;
      details.hidden = !open;
      setButtonLabel(button, open, 'View details', 'Hide details');
    }, true);
  }

  function runPolish() {
    installStyles();
    installReliableDetailHandler();
    careTileTitles();
    outputSections();
    restoreFieldPrepHeadings();
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
