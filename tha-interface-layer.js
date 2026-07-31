const CATEGORY_ORDER = [
  'Handy Services',
  'Appliances',
  'Electrical',
  'Plumbing',
  'HVAC / Mechanical',
  'General Contractor / Remodel',
  'Carpentry / Decks / Fences',
  'Painting / Staining / Protective Coatings',
  'Exterior & Site / Grounds',
  'Safety / Life Safety',
  'Pest',
  'Specialty / Other'
];

const CATEGORY_PRESENTATION = {
  'Handy Services': { heading: 'Handy Services & Routine Fixes', purpose: 'Small repairs, adjustments, and practical recurring home care.' },
  Appliances: { heading: 'Appliance Care', purpose: 'Routine appliance maintenance, function checks, and performance care.' },
  Electrical: { heading: 'Electrical & Power', purpose: 'Electrical safety, service context, and power-related care.' },
  Plumbing: { heading: 'Plumbing & Water', purpose: 'Water, fixtures, shutoffs, drains, and plumbing maintenance.' },
  'HVAC / Mechanical': { heading: 'Heating, Cooling & Mechanical', purpose: 'Comfort systems, filters, service history, and mechanical planning.' },
  'General Contractor / Remodel': { heading: 'Projects, Structure & Remodel', purpose: 'Larger project, structural, permit, and remodel planning.' },
  'Carpentry / Decks / Fences': { heading: 'Carpentry, Decks & Fences', purpose: 'Woodwork, hardware, decks, fencing, and related repairs.' },
  'Painting / Staining / Protective Coatings': { heading: 'Paint, Stain & Protective Finishes', purpose: 'Finish preservation, coatings, caulk, and surface protection.' },
  'Exterior & Site / Grounds': { heading: 'Exterior, Water & Grounds', purpose: 'Roof-adjacent, drainage, openings, landscape, and site care.' },
  'Safety / Life Safety': { heading: 'Safety & Life Safety', purpose: 'Home safety devices, risk checks, and protective upkeep.' },
  Pest: { heading: 'Pest Prevention & Monitoring', purpose: 'Prevention, monitoring, and specialty pest follow-up.' },
  'Specialty / Other': { heading: 'Specialty & Follow-up', purpose: 'Items that need specialized review or later assignment.' }
};

const CATEGORY_SYMBOLS = {
  'Handy Services': '🧰',
  Appliances: '⚙️',
  Electrical: '🔌',
  Plumbing: '🚿',
  'HVAC / Mechanical': '🌡️',
  'General Contractor / Remodel': '🦺',
  'Carpentry / Decks / Fences': '🔨',
  'Painting / Staining / Protective Coatings': '🎨',
  'Exterior & Site / Grounds': '🏡',
  'Safety / Life Safety': '🛡️',
  Pest: '🐜',
  'Specialty / Other': '🔎'
};

function firstText(node, selector) {
  return node.querySelector(selector)?.textContent?.trim() || '';
}

function classifyPassCard(card) {
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

function setButtonLabel(button, open, openText = 'Open', closeText = 'Collapse') {
  button.textContent = open ? closeText : openText;
  button.setAttribute('aria-expanded', String(open));
}

function reviewToggle(card) {
  return Array.from(card.querySelectorAll('button')).find(button => /^(Open|Collapse)$/.test(button.textContent.trim()));
}

function ensureReviewToolbar(panel) {
  const content = panel.querySelector('.collapsibleContent') || panel;
  if (content.querySelector('.tha-review-toolbar')) return;

  const toolbar = document.createElement('div');
  toolbar.className = 'tha-review-toolbar';
  toolbar.innerHTML = '<span>Review cards stay compact until you open one.</span>';
  const expand = document.createElement('button');
  expand.type = 'button';
  expand.textContent = 'Open all';
  expand.addEventListener('click', () => {
    panel.querySelectorAll('.passReviewCard').forEach(card => {
      const toggle = reviewToggle(card);
      if (toggle && toggle.textContent.trim() === 'Open') toggle.click();
    });
  });
  const collapse = document.createElement('button');
  collapse.type = 'button';
  collapse.textContent = 'Collapse all';
  collapse.addEventListener('click', () => {
    panel.querySelectorAll('.passReviewCard').forEach(card => {
      const toggle = reviewToggle(card);
      if (toggle && toggle.textContent.trim() === 'Collapse') toggle.click();
    });
  });
  toolbar.append(expand, collapse);
  const intro = content.querySelector('p');
  intro?.after(toolbar);
}

function enhanceReviewCards() {
  document.querySelectorAll('.passWorkspace .passReviewPanel').forEach(panel => {
    ensureReviewToolbar(panel);
    panel.querySelectorAll('.passCategoryGroup').forEach(group => {
      const h3 = group.querySelector('.passCategoryHeader h3');
      if (!h3) return;
      const rawCategory = h3.dataset.thaCategory || h3.textContent.trim();
      h3.dataset.thaCategory = rawCategory;
      const present = CATEGORY_PRESENTATION[rawCategory];
      if (present) h3.textContent = present.heading;
      group.dataset.thaCategory = rawCategory;
      if (!group.querySelector('.tha-category-purpose') && present) {
        const note = document.createElement('p');
        note.className = 'tha-category-purpose';
        note.textContent = present.purpose;
        group.querySelector('.passCategoryHeader')?.after(note);
      }
    });

    panel.querySelectorAll('.passReviewCard').forEach(card => {
      card.classList.add('tha-review-card');
      if (!card.dataset.thaInitialCollapse) {
        card.dataset.thaInitialCollapse = 'true';
        const toggle = reviewToggle(card);
        if (toggle && toggle.textContent.trim() === 'Collapse') toggle.click();
      }
    });
  });
}

function outputGroupIcon(category) {
  const reviewGroup = Array.from(document.querySelectorAll('.passWorkspace .passCategoryGroup')).find(group => group.dataset.thaCategory === category);
  const reviewIcon = reviewGroup?.querySelector('.passCategoryIcon');
  if (reviewIcon) return reviewIcon.cloneNode(true);
  const fallback = document.createElement('span');
  fallback.className = 'passCategoryIcon tha-fallback-icon';
  fallback.textContent = CATEGORY_SYMBOLS[category] || '•';
  return fallback;
}

function buildOutputGroup(category, cards) {
  const section = document.createElement('section');
  section.className = 'tha-pass-output-group';
  section.dataset.thaCategory = category;
  const present = CATEGORY_PRESENTATION[category];
  const header = document.createElement('header');
  header.className = 'tha-pass-output-group-header';
  const title = document.createElement('div');
  title.className = 'tha-pass-output-group-title';
  title.append(outputGroupIcon(category));
  const text = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.textContent = present?.heading || category;
  const p = document.createElement('p');
  p.textContent = present?.purpose || 'Selected continued care.';
  text.append(h3, p);
  title.append(text);
  const count = document.createElement('span');
  count.className = 'passCategoryCount';
  count.textContent = `${cards.length} item${cards.length === 1 ? '' : 's'}`;
  header.append(title, count);
  const list = document.createElement('div');
  list.className = 'tha-pass-output-card-list';
  cards.forEach(card => list.append(card));
  section.append(header, list);
  return section;
}

function enhanceOutputCard(card) {
  if (card.dataset.thaOutputCard) return;
  card.dataset.thaOutputCard = 'true';
  card.classList.add('tha-output-card');
  const top = card.querySelector('.findTop');
  const details = card.querySelector('.findGrid');
  const title = card.querySelector('h3');
  if (!top || !details || !title) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tha-output-card-toggle';
  const controlsId = `tha-output-${Math.random().toString(36).slice(2)}`;
  details.id = controlsId;
  button.setAttribute('aria-controls', controlsId);
  let open = false;
  details.hidden = true;
  setButtonLabel(button, open, 'View details', 'Hide details');
  button.addEventListener('click', () => {
    open = !open;
    details.hidden = !open;
    setButtonLabel(button, open, 'View details', 'Hide details');
  });
  top.append(button);
}

function enhanceReadOnlyOutput() {
  document.querySelectorAll('.passWorkspace .passOutlook').forEach(block => {
    const heading = firstText(block, '.collapsibleHeader h2');
    if (!/Selected PASS Continued Care Plan/i.test(heading)) return;
    block.classList.add('tha-readonly-output');
    const content = block.querySelector('.collapsibleContent') || block;
    if (!content.querySelector('.tha-readonly-banner')) {
      const banner = document.createElement('div');
      banner.className = 'tha-readonly-banner';
      banner.innerHTML = '<strong>Read-only homeowner output preview</strong><span>This is the PASS content that can appear in the PMR. Edit or include items only in THA PASS Review Controls above.</span>';
      const grid = content.querySelector('.passOutlookGrid');
      grid?.before(banner);
    }

    const grid = content.querySelector('.passOutlookGrid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(':scope > .passOutlookCard'));
    if (!cards.length) return;

    cards.forEach(enhanceOutputCard);
    const groups = new Map(CATEGORY_ORDER.map(category => [category, []]));
    cards.forEach(card => groups.get(classifyPassCard(card)).push(card));
    const fragment = document.createDocumentFragment();
    CATEGORY_ORDER.forEach(category => {
      const groupCards = groups.get(category) || [];
      if (groupCards.length) fragment.append(buildOutputGroup(category, groupCards));
    });
    grid.replaceChildren(fragment);
  });
}

function intakeCategoryFromSection(section) {
  const badges = Array.from(section.querySelectorAll('.categoryBadge')).map(node => node.textContent.trim());
  for (const category of CATEGORY_ORDER) {
    if (badges.includes(category)) return category;
  }
  const heading = firstText(section, 'h3').toLowerCase();
  if (heading.includes('electrical')) return 'Electrical';
  if (heading.includes('plumbing')) return 'Plumbing';
  if (heading.includes('hvac') || heading.includes('comfort')) return 'HVAC / Mechanical';
  if (heading.includes('safety')) return 'Safety / Life Safety';
  if (heading.includes('pest')) return 'Pest';
  return 'Exterior & Site / Grounds';
}

function fieldPrepTitle(section, category) {
  const raw = firstText(section, 'h3');
  const present = CATEGORY_PRESENTATION[category];
  return present ? present.heading : raw;
}

function enhanceFieldPrep() {
  document.querySelectorAll('.intakeLane').forEach(lane => {
    lane.classList.add('tha-field-prep');
    const summary = lane.querySelector(':scope > summary');
    if (summary && !summary.querySelector('.tha-field-prep-summary')) {
      const chip = document.createElement('span');
      chip.className = 'tha-field-prep-summary';
      chip.textContent = 'Context → HTC verification → PMR findings only if confirmed → PASS for recurring care';
      summary.append(chip);
    }
    if (!lane.querySelector('.tha-field-prep-guide')) {
      const guide = document.createElement('div');
      guide.className = 'tha-field-prep-guide';
      guide.innerHTML = '<strong>THA Field Prep flow</strong><span>Keep homeowner context separate from confirmed findings. Use each section to focus the walkthrough, document what is verified in HTC, and send recurring care to PASS only when appropriate.</span>';
      const firstSection = lane.querySelector('.intakeSubsection');
      firstSection?.before(guide);
    }

    lane.querySelectorAll('.intakeSubsection').forEach(section => {
      const category = intakeCategoryFromSection(section);
      section.dataset.thaCategory = category;
      const heading = section.querySelector('h3');
      if (heading && !heading.dataset.thaOriginalHeading) {
        heading.dataset.thaOriginalHeading = heading.textContent.trim();
        heading.textContent = fieldPrepTitle(section, category);
      }
      if (heading && !heading.querySelector('.tha-prep-toggle')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tha-prep-toggle';
        let open = false;
        section.dataset.thaPrepOpen = 'false';
        setButtonLabel(button, open, 'Open fields', 'Collapse fields');
        button.addEventListener('click', () => {
          open = !open;
          section.dataset.thaPrepOpen = String(open);
          setButtonLabel(button, open, 'Open fields', 'Collapse fields');
        });
        heading.append(button);
      }
      section.querySelectorAll('.intakeGrid > label').forEach(label => {
        const badge = label.querySelector('.categoryBadge');
        const categoryName = badge?.textContent.trim();
        const order = CATEGORY_ORDER.indexOf(categoryName);
        if (order >= 0) label.style.order = String(order);
      });
    });
  });
}

function runEnhancements() {
  enhanceReviewCards();
  enhanceReadOnlyOutput();
  enhanceFieldPrep();
}

let scheduled = false;
function scheduleEnhancements() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    runEnhancements();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleEnhancements, { once: true });
} else {
  scheduleEnhancements();
}

new MutationObserver(scheduleEnhancements).observe(document.documentElement, { childList: true, subtree: true });
