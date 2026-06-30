(() => {
  const CATEGORY_ORDER = [
    'Handy Services', 'Appliances', 'Electrical', 'Plumbing', 'HVAC / Mechanical',
    'General Contractor / Remodel', 'Carpentry / Decks / Fences',
    'Painting / Staining / Protective Coatings', 'Exterior & Site / Grounds',
    'Safety / Life Safety', 'Pest', 'Specialty / Other'
  ];

  const CATEGORY_TITLES = {
    'Handy Services': 'Handy Services & Routine Fixes',
    Appliances: 'Appliance Care',
    Electrical: 'Electrical & Power',
    Plumbing: 'Plumbing & Water',
    'HVAC / Mechanical': 'Heating, Cooling & Mechanical',
    'General Contractor / Remodel': 'Projects, Structure & Remodel',
    'Carpentry / Decks / Fences': 'Carpentry, Decks & Fences',
    'Painting / Staining / Protective Coatings': 'Paint, Stain & Protective Finishes',
    'Exterior & Site / Grounds': 'Roof, Gutters & Drainage',
    'Safety / Life Safety': 'Safety & Life Safety',
    Pest: 'Pest Prevention & Monitoring',
    'Specialty / Other': 'Specialty & Follow-up'
  };

  const PREP_HEADINGS = {
    Electrical: 'Electrical',
    Plumbing: 'Plumbing / Water',
    'HVAC / Mechanical': 'HVAC / Comfort',
    'Exterior & Site / Grounds': 'Roof / Exterior / Drainage',
    'Safety / Life Safety': 'Safety / Pests / Fireplaces'
  };

  const EMOJI = {
    'Handy Services': '🧰', Appliances: '⚙️', Electrical: '🔌', Plumbing: '🚿',
    'HVAC / Mechanical': '🌡️', 'General Contractor / Remodel': '🦺',
    'Carpentry / Decks / Fences': '🔨', 'Painting / Staining / Protective Coatings': '🎨',
    'Exterior & Site / Grounds': '🏠', 'Safety / Life Safety': '🛡️', Pest: '🐜', 'Specialty / Other': '🔎'
  };

  function installStyles() {
    if (document.getElementById('tha-clean-interface-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-clean-interface-styles';
    style.textContent = `
      .cleanFieldPrep .intakeSubsection h3{display:flex;align-items:center;gap:9px;margin:0;color:#153e59;font-size:17px}
      .cleanFieldPrep .tha-clean-prep-icon,.passWorkspace .tha-clean-trade-icon{display:inline-grid;place-items:center;flex:0 0 auto;width:32px;height:32px;border-radius:50%;background:#fff7e9;border:1px solid #e4c38d;color:#c77716;box-shadow:0 2px 7px rgba(191,132,32,.12)}
      .cleanFieldPrep .tha-clean-prep-icon svg,.passWorkspace .tha-clean-trade-icon svg{width:17px;height:17px;stroke-width:2.25}
      .cleanFieldPrep .tha-clean-prep-toggle{margin-left:auto;flex:0 0 auto;border:1px solid #c7d7df;border-radius:10px;background:#fff;color:#163f58;padding:7px 10px;font-size:12px;font-weight:900}
      .cleanFieldPrep .intakeSubsection.cleanCollapsed>:not(h3){display:none!important}
      .cleanFieldPrep .intakeSubsection.cleanExpanded{padding-bottom:14px}
      .passWorkspace .tha-clean-output-group{width:100%;border:1px solid #d6e2e8;border-radius:16px;background:#fbfdfe;overflow:hidden;margin:0 0 12px}
      .passWorkspace .tha-clean-output-header{display:flex;align-items:center;gap:10px;padding:12px 13px;background:#f7fbfd}
      .passWorkspace .tha-clean-output-header h3{margin:0;color:#0c344e;font-size:19px;line-height:1.15}
      .passWorkspace .tha-clean-output-header p{margin:3px 0 0;color:#65747e;font-size:12px;font-weight:700}
      .passWorkspace .tha-clean-output-count{margin-left:auto;border:1px solid #d5dde1;border-radius:999px;padding:5px 8px;background:#fff;color:#53616c;font-size:12px;font-weight:900;white-space:nowrap}
      .passWorkspace .tha-clean-section-toggle,.passWorkspace .tha-clean-detail-toggle{border:1px solid #c8d5dc;border-radius:10px;background:#fff;color:#163f58;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}
      .passWorkspace .tha-clean-output-list{display:grid;grid-template-columns:1fr;gap:12px;padding:12px;border-top:1px solid #dce7ec}
      .passWorkspace .tha-clean-output-list[hidden]{display:none!important}
      .passWorkspace .tha-clean-output-card{width:100%;background:#fff}
      .passWorkspace .tha-clean-output-card .findTop{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap}
      .passWorkspace .tha-clean-output-card .findTop>div{min-width:0;flex:1}
      .passWorkspace .tha-clean-output-card .findTop h3{color:#58466f;font-size:20px;font-weight:750;line-height:1.14;margin:0;padding:0 0 6px 10px;border-bottom:1px solid #b8aec5;position:relative}
      .passWorkspace .tha-clean-output-card .findTop h3:before{content:'';position:absolute;left:0;top:2px;bottom:8px;width:3px;border-radius:99px;background:#735c90}
      .passWorkspace .tha-clean-output-card .findGrid{margin-top:14px;padding-top:13px;border-top:1px solid #e1e8eb}
      .passWorkspace .tha-clean-output-card .findGrid[hidden]{display:none!important}
      .passWorkspace .tha-clean-guidance{grid-column:1/-1;margin-top:4px;padding:12px 13px;border:1px solid #d7e2e7;border-radius:12px;background:#f7fbfd;color:#405764}
      .passWorkspace .tha-clean-guidance h5{margin:0 0 8px;color:#173e57;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
      .passWorkspace .tha-clean-guidance p{margin:6px 0;background:transparent!important;padding:0!important;line-height:1.45}
      .passWorkspace .tha-clean-guidance strong{color:#173e57}
      .passWorkspace .passCategoryHeader .passCategoryIcon{background:#fff7e9!important;border:1px solid #e4c38d!important;color:#c77716!important;box-shadow:0 2px 7px rgba(191,132,32,.12)}
      .passWorkspace .passCategoryHeader .passCategoryIcon svg{width:17px;height:17px;stroke-width:2.25}
      @media(max-width:900px){
        .passWorkspace .tha-clean-output-header{align-items:flex-start;flex-wrap:wrap}
        .passWorkspace .tha-clean-output-count{margin-left:0}
        .passWorkspace .tha-clean-section-toggle{width:100%}
      }
    `;
    document.head.append(style);
  }

  function cloneIcon(node) { return node ? node.cloneNode(true) : null; }

  function findPrepHeading(title) {
    return Array.from(document.querySelectorAll('.cleanFieldPrep .intakeSubsection h3')).find(h => h.dataset.cleanTitle === title);
  }

  function iconForCategory(category, root = document) {
    const prepTitle = PREP_HEADINGS[category];
    const prepIcon = prepTitle ? findPrepHeading(prepTitle)?.querySelector('.tha-clean-prep-icon svg') : null;
    if (prepIcon) return cloneIcon(prepIcon);
    const badge = Array.from(root.querySelectorAll('.categoryBadge')).find(node => node.textContent.trim() === category);
    const badgeIcon = badge?.querySelector('svg');
    if (badgeIcon) return cloneIcon(badgeIcon);
    const fallback = document.createElement('span');
    fallback.textContent = EMOJI[category] || '•';
    return fallback;
  }

  function prepareFieldPrep() {
    document.querySelectorAll('details.intakeLane:not(.homeownerLane)').forEach(lane => {
      lane.classList.add('cleanFieldPrep');
      lane.querySelectorAll('.intakeSubsection').forEach(section => {
        const heading = section.querySelector(':scope > h3');
        if (!heading || heading.dataset.cleanPrepared === 'true') return;
        const title = heading.textContent.trim();
        heading.dataset.cleanPrepared = 'true';
        heading.dataset.cleanTitle = title;

        const icon = document.createElement('span');
        icon.className = 'tha-clean-prep-icon';
        const source = section.querySelector('.categoryBadge svg');
        const clone = cloneIcon(source);
        if (clone) icon.append(clone); else icon.textContent = '•';

        const label = document.createElement('span');
        label.textContent = title;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tha-clean-prep-toggle';
        let open = false;
        button.textContent = 'Open fields';
        button.addEventListener('click', () => {
          open = !open;
          section.classList.toggle('cleanCollapsed', !open);
          section.classList.toggle('cleanExpanded', open);
          button.textContent = open ? 'Collapse fields' : 'Open fields';
          button.setAttribute('aria-expanded', String(open));
        });
        heading.replaceChildren(icon, label, button);
        section.classList.add('cleanCollapsed');
      });
    });
  }

  function normalizeCategory(text = '') {
    const raw = text.trim();
    if (CATEGORY_ORDER.includes(raw)) return raw;
    if (/handy/i.test(raw)) return 'Handy Services';
    if (/appliance/i.test(raw)) return 'Appliances';
    if (/electrical/i.test(raw)) return 'Electrical';
    if (/plumb/i.test(raw)) return 'Plumbing';
    if (/hvac|mechanical|heating|cooling/i.test(raw)) return 'HVAC / Mechanical';
    if (/general contractor|remodel|project|structure/i.test(raw)) return 'General Contractor / Remodel';
    if (/carpentry|deck|fence/i.test(raw)) return 'Carpentry / Decks / Fences';
    if (/paint|stain|coating/i.test(raw)) return 'Painting / Staining / Protective Coatings';
    if (/roof|gutter|drainage|exterior|grounds/i.test(raw)) return 'Exterior & Site / Grounds';
    if (/safety|life safety/i.test(raw)) return 'Safety / Life Safety';
    if (/pest/i.test(raw)) return 'Pest';
    return 'Specialty / Other';
  }

  function classifyCard(card) {
    const text = card.textContent.toLowerCase();
    if (/(dryer vent|dryer duct|exterior flap|gutter extension|splash block|handy services)/.test(text)) return 'Handy Services';
    if (/(dishwasher|range hood|appliance)/.test(text)) return 'Appliances';
    if (/(gfci|outlet|breaker|electrical|solar)/.test(text)) return 'Electrical';
    if (/(water heater|plumbing|shutoff|toilet|faucet|sump pump)/.test(text)) return 'Plumbing';
    if (/(furnace|heat pump|a\/c|hvac|filter replacement|cooling)/.test(text)) return 'HVAC / Mechanical';
    if (/(remodel|structural|foundation|permit|general contractor)/.test(text)) return 'General Contractor / Remodel';
    if (/(cabinet|carpentry|deck|fence|hinge|drawer|latch)/.test(text)) return 'Carpentry / Decks / Fences';
    if (/(paint|stain|caulk|coating|finish)/.test(text)) return 'Painting / Staining / Protective Coatings';
    if (/(roof|chimney|fireplace|gutter|downspout|drainage|grading|pooling|window|door|landscape|irrigation|masonry|hardscape)/.test(text)) return 'Exterior & Site / Grounds';
    if (/(smoke|carbon monoxide|co detector|fire extinguisher|life safety)/.test(text)) return 'Safety / Life Safety';
    if (/(pest|rodent|termite|insect|bug)/.test(text)) return 'Pest';
    return 'Specialty / Other';
  }

  function guidanceFor(card) {
    const text = card.textContent.toLowerCase();
    if (/(dryer vent|dryer duct|exterior flap)/.test(text)) return ['Dryer vent care','A clear exhaust path supports dryer performance and reduces lint and heat buildup.','Confirm the exterior flap opens while the dryer runs, lint is not collecting at the outlet, and the duct is not crushed or disconnected.','Use a qualified dryer-vent professional for long, concealed, rooftop, or difficult-access ducts.'];
    if (/(sump pump|sump)/.test(text)) return ['Sump pump test','A simple test helps confirm the pump and discharge path are ready before a heavy-rain event.','When the pit is safe to access, add water slowly until the float activates. Confirm the pump starts and discharge water moves away from the foundation.','Stop and call a plumbing or drainage professional if it does not start, trips power, runs continuously, or discharges back toward the home.'];
    if (/(roof|gutter|downspout|drainage|grading)/.test(text)) return ['Roof and water path','The objective is to move water away from the home before it affects finishes, siding, or the foundation.','Look for debris, loose downspout connections, pooling near the home, and discharge ending too close to the foundation.','Use a roofing, gutter, or drainage professional for roof access, recurring leaks, damaged flashing, or recurring ponding.'];
    return ['Walkthrough guide','This continued-care item keeps a known home system visible before it becomes an urgent repair.','Confirm present condition, note change since the prior review, and verify that timing and the responsible trade remain appropriate.','Use the listed trade when specialized diagnosis, access, licensing, or work beyond routine care is needed.'];
  }

  function configureCard(card) {
    card.classList.add('tha-clean-output-card');
    const top = card.querySelector('.findTop');
    const details = card.querySelector('.findGrid');
    if (!top || !details || card.dataset.cleanCard === 'true') return;
    card.dataset.cleanCard = 'true';
    details.hidden = true;

    const [title, why, check, pro] = guidanceFor(card);
    const guide = document.createElement('section');
    guide.className = 'tha-clean-guidance';
    const guideTitle = document.createElement('h5'); guideTitle.textContent = title;
    const whyP = document.createElement('p'); whyP.innerHTML = `<strong>Why it matters:</strong> ${why}`;
    const checkP = document.createElement('p'); checkP.innerHTML = `<strong>What to look for:</strong> ${check}`;
    const proP = document.createElement('p'); proP.innerHTML = `<strong>When to use a pro:</strong> ${pro}`;
    guide.append(guideTitle, whyP, checkP, proP);
    details.append(guide);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tha-clean-detail-toggle';
    button.textContent = 'View details';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const opening = details.hidden;
      details.hidden = !opening;
      button.textContent = opening ? 'Hide details' : 'View details';
      button.setAttribute('aria-expanded', String(opening));
    });
    top.append(button);
  }

  function buildOutputGroups() {
    document.querySelectorAll('.passWorkspace .passOutlook').forEach(block => {
      const title = block.querySelector('.collapsibleHeader h2')?.textContent || '';
      if (!/Selected PASS Continued Care Plan/i.test(title)) return;
      const grid = block.querySelector('.passOutlookGrid');
      if (!grid || grid.dataset.cleanBuilt === 'true') return;
      const cards = Array.from(grid.querySelectorAll(':scope > .passOutlookCard'));
      if (!cards.length) return;
      grid.dataset.cleanBuilt = 'true';
      const byCategory = new Map(CATEGORY_ORDER.map(category => [category, []]));
      cards.forEach(card => byCategory.get(classifyCard(card)).push(card));
      const fragment = document.createDocumentFragment();
      CATEGORY_ORDER.forEach(category => {
        const entries = byCategory.get(category) || [];
        if (!entries.length) return;
        const group = document.createElement('section');
        group.className = 'tha-clean-output-group';
        group.dataset.thaCategory = category;
        const header = document.createElement('header');
        header.className = 'tha-clean-output-header';
        const icon = document.createElement('span');
        icon.className = 'tha-clean-trade-icon';
        icon.append(iconForCategory(category, block));
        const text = document.createElement('div');
        const heading = document.createElement('h3'); heading.textContent = CATEGORY_TITLES[category] || category;
        const subtitle = document.createElement('p'); subtitle.textContent = 'Selected continued care items';
        text.append(heading, subtitle);
        const count = document.createElement('span'); count.className = 'tha-clean-output-count'; count.textContent = `${entries.length} item${entries.length === 1 ? '' : 's'}`;
        const toggle = document.createElement('button');
        toggle.type = 'button'; toggle.className = 'tha-clean-section-toggle'; toggle.textContent = 'Open section'; toggle.setAttribute('aria-expanded', 'false');
        const list = document.createElement('div'); list.className = 'tha-clean-output-list'; list.hidden = true;
        entries.forEach(card => { configureCard(card); list.append(card); });
        toggle.addEventListener('click', () => {
          const opening = list.hidden;
          list.hidden = !opening;
          toggle.textContent = opening ? 'Collapse section' : 'Open section';
          toggle.setAttribute('aria-expanded', String(opening));
        });
        header.append(icon, text, count, toggle);
        group.append(header, list);
        fragment.append(group);
      });
      grid.replaceChildren(fragment);
    });
  }

  function syncReviewIcons() {
    document.querySelectorAll('.passWorkspace .passCategoryGroup').forEach(group => {
      const heading = group.querySelector('.passCategoryHeader h3');
      const box = group.querySelector('.passCategoryIcon');
      if (!heading || !box) return;
      const category = normalizeCategory(heading.textContent);
      const icon = iconForCategory(category, group);
      box.replaceChildren(icon);
      box.classList.add('tha-clean-trade-icon');
    });
  }

  function run() {
    installStyles();
    prepareFieldPrep();
    syncReviewIcons();
    buildOutputGroups();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; run(); });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
