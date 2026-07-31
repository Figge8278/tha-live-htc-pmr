(() => {
  const ID = 'tha-v3587-react-safe-checklist-and-pass';
  if (window[ID]) return;
  window[ID] = true;

  // Prevent the two superseded layers from running. They moved React-owned nodes
  // and patched DOM prototypes, which interrupted select controls and room changes.
  window['tha-v3585-exterior-trade-realignment'] = true;
  window['tha-v3586-form-control-stability'] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const CATEGORY_MEMORY_KEY = 'tha-v3587-fixed-checklist-categories';
  const RESOURCE_MIGRATION_KEY = 'tha-v3587-resource-default-migrations';

  const CATEGORY_META = [
    { slug: 'roofing', label: 'Roofing / Gutters', icon: '🏠', rank: 0 },
    { slug: 'landscaping-site-grounds', label: 'Landscaping / Site & Grounds', icon: '🌿', rank: 1 },
    { slug: 'windows-exterior-sealant', label: 'Windows / Exterior Sealant', icon: '🪟', rank: 2 },
    { slug: 'painting-staining-coatings', label: 'Painting / Staining', icon: '🎨', rank: 3 },
    { slug: 'handy-services', label: 'Handy Services', icon: '🧰', rank: 4 },
    { slug: 'carpentry-decks-fences', label: 'Carpentry / Decks / Fences', icon: '🔨', rank: 5 },
    { slug: 'electrical', label: 'Electrical', icon: '🔌', rank: 6 },
    { slug: 'plumbing', label: 'Plumbing', icon: '💧', rank: 7 },
    { slug: 'hvac-mechanical', label: 'HVAC / Ventilation', icon: '🌀', rank: 8 },
    { slug: 'appliances', label: 'Appliances', icon: '⚙️', rank: 9 },
    { slug: 'general-contractor-remodel', label: 'General Contractor / Structural', icon: '🏗️', rank: 10 },
    { slug: 'safety-life-safety', label: 'Safety / Life Safety', icon: '🛡️', rank: 11 },
    { slug: 'pest', label: 'Pest', icon: '🐜', rank: 12 },
    { slug: 'chimney', label: 'Chimney / Fireplace', icon: '🧱', rank: 13 },
    { slug: 'specialty-other', label: 'Specialty / Other', icon: '🔎', rank: 14 }
  ];

  const EXTERIOR_RULES = [
    { match: /^Siding, trim, fascia, and soffit condition$/i, category: 'handy-services', resourceValue: 'Carpentry', resourceLabel: 'Carpenter', oldDefault: 'Handyman' },
    { match: /^Deck, porch, patio, and railings$/i, category: 'handy-services', resourceValue: 'Carpentry', resourceLabel: 'Carpenter', oldDefault: 'Handyman' },
    { match: /^Irrigation, sprinklers, hose bibs, and exterior water$/i, category: 'landscaping-site-grounds', resourceValue: 'Landscape', resourceLabel: 'Landscaping', oldDefault: 'Handyman' },
    { match: /^Gutters, downspouts, and drainage discharge$/i, category: 'roofing', resourceValue: 'Roof', resourceLabel: 'Roofing', oldDefault: 'Handyman' },
    { match: /^Grading \/ pooling near foundation$/i, category: 'landscaping-site-grounds', resourceValue: 'Landscape', resourceLabel: 'Landscaping', oldDefault: 'Drainage' },
    { match: /^Visible foundation cracks or movement$/i, category: 'general-contractor-remodel', resourceValue: 'General Contractor', resourceLabel: 'General Contractor', oldDefault: 'General Contractor' },
    { match: /^Exterior paint \/ stain \/ caulk wear$/i, category: 'painting-staining-coatings', resourceValue: 'Paint', resourceLabel: 'Painting', oldDefault: 'Handyman' },
    { match: /^Exterior doors, thresholds, and weatherstripping$/i, category: 'handy-services', resourceValue: 'Handyman', resourceLabel: 'Handy Services', oldDefault: 'Handyman' },
    { match: /^Roofline visible issues$/i, category: 'roofing', resourceValue: 'Roof', resourceLabel: 'Roofing', oldDefault: 'Roof' },
    { match: /^Windows and exterior sealant$/i, category: 'windows-exterior-sealant', resourceValue: 'Windows', resourceLabel: 'Window Specialist', oldDefault: 'Handyman' },
    { match: /^Fence and gates if relevant$/i, category: 'landscaping-site-grounds', resourceValue: 'Carpentry', resourceLabel: 'Carpenter / Handy Services', oldDefault: 'Handyman' },
    { match: /^Pest entry points and exterior gaps$/i, category: 'pest', resourceValue: 'Pest', resourceLabel: 'Pest', oldDefault: 'Handyman' },
    { match: /^Chimney exterior, cap, crown, and flashing$/i, category: 'chimney', resourceValue: 'Chimney', resourceLabel: 'Chimney Sweep', oldDefault: 'Chimney' }
  ];

  const CLIENT_FACING_INTAKE = [
    /^Electrical panel location/i,
    /^Main water shut-off location/i,
    /^Gas service \/ shutoff acknowledgement/i,
    /^Furnace filter replacement/i,
    /^Fire extinguishers:/i,
    /^Smoke \/ CO detector/i,
    /^Sewer \/ irrigation history/i
  ];
  const REQUIRED_REFERENCES = [
    /^Electrical panel location/i,
    /^Main water shut-off location/i,
    /^Gas service \/ shutoff acknowledgement/i
  ];

  const readSessionObject = (key) => {
    try { return JSON.parse(sessionStorage.getItem(key) || '{}') || {}; }
    catch { return {}; }
  };
  const writeSessionObject = (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  };

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaV358Begin{padding:15px 16px!important}
      .thaV358BeginHeader{margin-bottom:11px!important}
      .thaV358BeginHeader h2{font-size:23px!important;line-height:1.15!important}
      .thaV358StepCue{font-size:11px!important;padding:6px 9px!important}
      .thaV358Paths{gap:12px!important}
      .thaV358Path{grid-template-columns:42px minmax(0,1fr) auto!important;gap:4px 11px!important;padding:15px 16px!important;min-height:82px!important}
      .thaV358PathIcon{width:40px!important;height:40px!important;border-radius:12px!important;font-size:21px!important}
      .thaV358Path h3{font-size:18px!important;line-height:1.2!important}
      .thaV358Path p{font-size:11px!important;line-height:1.35!important}
      .thaV358Path>button{font-size:12px!important;padding:10px 14px!important;min-height:42px!important}
      .thaV358PathWorkspaceHeader h3{font-size:19px!important}
      .thaV358PathWorkspaceHeader p{font-size:12px!important}
      .thaV358ExistingChoices button{font-size:12px!important;padding:11px 13px!important;min-height:43px!important}

      .homeownerLane .quickIntakeGrid{grid-template-columns:minmax(0,1fr)!important;gap:11px!important}
      .homeownerLane .intakeQuestion.tha-quick-card{width:100%!important;text-align:left!important;align-items:stretch!important}
      .homeownerLane .tha-quick-header{justify-content:flex-start!important;align-items:center!important;text-align:left!important;padding:14px 15px!important}
      .homeownerLane .tha-quick-title{flex:1!important;justify-items:start!important;text-align:left!important}
      .homeownerLane .tha-quick-title strong,.homeownerLane .tha-quick-title small{display:block!important;width:100%!important;text-align:left!important;justify-self:start!important}
      .homeownerLane .structuredPromptField,.homeownerLane .structuredPromptField span,.homeownerLane .intakeQuestion>span,.homeownerLane .intakeQuestion>small{text-align:left!important;align-items:flex-start!important;justify-content:flex-start!important}
      .thaV3587IntakeActionRow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:10px 0 12px;border:1px solid #d8e4ea;border-radius:12px;background:#f7fafc;padding:9px 11px}
      .thaV3587IntakeActionRow p{margin:0;color:#60717c;font-size:10px;font-weight:800;line-height:1.35}
      .thaV3587IntakeActionRow .copyIntakeEmailButton{margin-left:auto!important;padding:7px 10px!important;font-size:10px!important;background:#fff!important;color:#174d70!important;border:1px solid #c9dce8!important}
      .intakePage label.thaV3587ClientFacing,.checklistDetailPanel label.thaV3587ClientFacing,.roomOverviewBody label.thaV3587ClientFacing{position:relative;border:1px solid #d9b74a!important;border-left:6px solid #bf8420!important;border-radius:12px!important;background:#fff9d8!important;padding:10px!important}
      .thaV3587ClientFacingBadge{display:inline-flex!important;width:max-content!important;margin:0 0 6px!important;border:1px solid #d9b74a!important;border-radius:999px!important;background:#fffef2!important;color:#715b0e!important;padding:3px 7px!important;font-size:9px!important;font-weight:950!important;letter-spacing:.03em!important;text-transform:uppercase!important}
      .intakePage label.thaV3587MustAnswer:not(.thaV3587Answered){border-color:#d06b19!important;border-left-color:#d06b19!important;background:#fff1dc!important;box-shadow:0 0 0 2px rgba(208,107,25,.12)!important}
      .intakePage label.thaV3587MustAnswer.thaV3587Answered{border-color:#5087b3!important;border-left-color:#287bb7!important;background:#eef7fc!important}

      .formPanel{min-width:0!important}
      .formPanel>.checklistItemCard{margin-top:6px!important}
      .formPanel>.checklistItemCard::before{content:''!important;position:absolute!important;top:0!important;bottom:0!important;left:0!important;width:6px!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;display:block!important;pointer-events:none!important}
      .formPanel>.checklistItemCard[data-v3587-first-group]{margin-top:6px!important}
      .formPanel>.checklistItemCard .checklistSummaryRow{padding:9px 11px 9px 17px!important;gap:8px!important;align-items:center!important}
      .formPanel>.checklistItemCard .checklistSummaryMain .itemTitleLine strong{font-size:15px!important;line-height:1.2!important}
      .formPanel>.checklistItemCard .tradeIcon{display:grid!important;place-items:center!important;align-self:center!important;flex:0 0 32px!important;width:32px!important;height:32px!important;min-width:32px!important;margin:0!important;font-size:18px!important;line-height:1!important;background:#fff7e9!important;border:1px solid #e4c38d!important}

      .passCategoryGroups{display:flex!important;flex-direction:column!important}
      .passCategoryGroup{order:var(--tha-v3587-pass-order,999)!important;position:relative}
      .passReviewCard{position:relative}
      .passReviewCard.pmcp-selected:not(.thaPmcpActivePlanning),
      .passReviewCard.pmcp-declined:not(.thaPmcpActivePlanning),
      .passReviewCard.thaPmcpLongRange:not(.thaPmcpActivePlanning){box-shadow:inset -6px 0 0 #8fc885!important}
      .passReviewCard.thaPmcpActivePlanning:not(.pmcp-selected):not(.pmcp-declined):not(.thaPmcpLongRange){box-shadow:inset -6px 0 0 #7e4c9a!important}
      .passReviewCard.thaPmcpActivePlanning.pmcp-selected,
      .passReviewCard.thaPmcpActivePlanning.pmcp-declined,
      .passReviewCard.thaPmcpActivePlanning.thaPmcpLongRange{box-shadow:inset -6px 0 0 #8fc885,inset -12px 0 0 #7e4c9a!important}
      .passCategoryGroup.thaV3587HasCare:not(.thaV3587HasPlanning){box-shadow:inset -6px 0 0 #8fc885!important}
      .passCategoryGroup.thaV3587HasPlanning:not(.thaV3587HasCare){box-shadow:inset -6px 0 0 #7e4c9a!important}
      .passCategoryGroup.thaV3587HasCare.thaV3587HasPlanning{box-shadow:inset -6px 0 0 #8fc885,inset -12px 0 0 #7e4c9a!important}

      @media(max-width:700px){
        .thaV358Path{grid-template-columns:38px minmax(0,1fr) auto!important}
        .thaV3587IntakeActionRow{align-items:stretch;flex-direction:column}
        .thaV3587IntakeActionRow .copyIntakeEmailButton{width:100%!important;margin-left:0!important;justify-content:center!important}
      }
    `;
    document.head.append(style);
  }

  function polishStart(page) {
    if (!page) return;
    const local = page.querySelector('.thaV358Path.local');
    const existing = page.querySelector('.thaV358Path.existing');
    if (local?.querySelector('h3')) local.querySelector('h3').textContent = 'Continue Local';
    if (local?.querySelector('p')) local.querySelector('p').textContent = 'Resume a saved walkthrough on this device only.';
    if (existing?.querySelector('h3')) existing.querySelector('h3').textContent = 'Use Existing Information';
    if (existing?.querySelector('p')) existing.querySelector('p').textContent = 'Homeowner Intake, prior Snapshot file, or Google Drive.';
    const snapshotChoice = page.querySelector('[data-v3583-source="snapshot"]');
    const driveChoice = page.querySelector('[data-v3583-source="drive"]');
    if (snapshotChoice) snapshotChoice.textContent = 'Prior Snapshot File';
    if (driveChoice) driveChoice.textContent = 'Open Google Drive';
  }

  function moveIntakeEmailAction() {
    const page = document.querySelector('.intakePage');
    const lane = page?.querySelector('.homeownerLane');
    const button = page?.querySelector('.copyIntakeEmailButton');
    if (!page || !lane || !button) return;
    let row = lane.querySelector(':scope > .thaV3587IntakeActionRow');
    if (!row) {
      row = document.createElement('div');
      row.className = 'thaV3587IntakeActionRow noPrint';
      row.innerHTML = '<p>Secondary tool: copies the seven-question homeowner request used before the walkthrough.</p>';
      const lede = lane.querySelector(':scope > .lede');
      if (lede) lede.after(row); else lane.querySelector('summary')?.after(row);
    }
    if (button.parentElement !== row) row.append(button);
    button.innerHTML = button.innerHTML.replace(/Copy Pre-Walkthrough Intake Email|Copy Homeowner Intake Request/i, 'Copy Homeowner Intake Request');
    const feedback = page.querySelector('.intakeStatusSummary .copyFeedback');
    if (feedback && feedback.parentElement !== row) row.append(feedback);
  }

  function addClientFacingBadge(label, mustAnswer, customText = '') {
    if (!label) return;
    label.classList.add('thaV3587ClientFacing');
    if (mustAnswer) label.classList.add('thaV3587MustAnswer');
    let badge = label.querySelector(':scope > .thaV3587ClientFacingBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'thaV3587ClientFacingBadge';
      label.prepend(badge);
    }
    badge.textContent = customText || (mustAnswer ? 'Must answer · PMR reference' : 'Client-facing PMR wording');
    const field = label.querySelector('input,textarea,select');
    const refresh = () => label.classList.toggle('thaV3587Answered', Boolean(text(field?.value)));
    refresh();
    if (field && !field.dataset.v3587ClientFacingBound) {
      field.dataset.v3587ClientFacingBound = 'true';
      field.addEventListener('input', refresh);
      field.addEventListener('change', refresh);
    }
  }

  function decorateClientFacing() {
    document.querySelectorAll('.intakePage .intakeSubsection label').forEach(label => {
      const value = text(label.textContent);
      const clientFacing = CLIENT_FACING_INTAKE.some(pattern => pattern.test(value));
      if (!clientFacing) return;
      addClientFacingBadge(label, REQUIRED_REFERENCES.some(pattern => pattern.test(value)));
    });
    document.querySelectorAll('.checklistDetailPanel label.notes').forEach(label => {
      if (/Notes for PMR detail/i.test(text(label.textContent))) addClientFacingBadge(label, false);
    });
    document.querySelectorAll('.roomOverviewBody label.notes').forEach(label => {
      if (/Room Note \/ Voice Transcript/i.test(text(label.textContent))) addClientFacingBadge(label, false, 'PMR wording when this room overview is included');
    });
  }

  function cardTitle(card) {
    return text(card?.querySelector('.checklistSummaryRow .itemTitleLine strong')?.textContent || card?.querySelector('.expandedItemHead h2')?.textContent);
  }

  function cardZone(card) {
    const line = card?.querySelector('.checklistSummaryMain>span:last-child') || card?.querySelector('.expandedItemHead>div>p');
    return text(line?.textContent).split('·')[0].trim();
  }

  function exteriorRule(title) {
    return EXTERIOR_RULES.find(rule => rule.match.test(title));
  }

  function deriveCategory(title, zone) {
    const value = `${zone} ${title}`.toLowerCase();
    if (/(chimney|fireplace|hearth|damper)/.test(value)) return 'chimney';
    if (/(roof|gutter|downspout|flashing|shingle)/.test(value)) return 'roofing';
    if (/(irrigation|sprinkler|grading|pooling|landscape|site \/ structures|fence|gate)/.test(value)) return 'landscaping-site-grounds';
    if (/(window|exterior sealant|screen|fogging)/.test(value)) return 'windows-exterior-sealant';
    if (/(foundation|structural|movement|remodel|permit)/.test(value)) return 'general-contractor-remodel';
    if (/(pest|rodent|termite|insect|entry point)/.test(value)) return 'pest';
    if (/(paint|stain|coating|interior finish|exterior finish|drywall)/.test(value)) return 'painting-staining-coatings';
    if (/(electrical|gfci|outlet|switch|breaker|panel|lighting)/.test(value)) return 'electrical';
    if (/(plumbing|sink|faucet|drain|toilet|water heater|washer hose|shutoff|wet area)/.test(value)) return 'plumbing';
    if (/(hvac|ventilation|furnace|heat pump|air conditioner|thermostat|exhaust|dryer vent)/.test(value)) return 'hvac-mechanical';
    if (/(appliance|refrigerator|dishwasher|range|oven|disposal)/.test(value)) return 'appliances';
    if (/(safety|smoke|co detector|fire extinguisher)/.test(value)) return 'safety-life-safety';
    if (/(carpentry|cabinet|drawer|shelving|built-in|deck|trim|fascia|soffit)/.test(value)) return 'carpentry-decks-fences';
    if (/(door|threshold|weatherstripping|hardware|hinge|latch|flooring|transition)/.test(value)) return 'handy-services';
    return 'specialty-other';
  }

  function fixedCategory(card, roomLabel) {
    const title = cardTitle(card);
    const rule = exteriorRule(title);
    if (rule) return rule.category;
    const key = `${roomLabel}::${title}`;
    const memory = readSessionObject(CATEGORY_MEMORY_KEY);
    if (memory[key]) return memory[key];
    const category = deriveCategory(title, cardZone(card));
    memory[key] = category;
    writeSessionObject(CATEGORY_MEMORY_KEY, memory);
    return category;
  }

  function setResourceLine(node, label) {
    if (!node || !label) return;
    const zone = text(node.textContent).split('·')[0].trim();
    node.textContent = `${zone} · Likely resource: ${label}`;
  }

  function migrateResourceDefault(card, rule, roomLabel) {
    const resourceLabel = Array.from(card.querySelectorAll('.checklistDetailPanel .inputs > label')).find(label => /Suggested Trade \/ Resource|Likely Resource/i.test(text(label.textContent)));
    const select = resourceLabel?.querySelector('select');
    if (!select) return;
    const firstTextNode = Array.from(resourceLabel.childNodes).find(node => node.nodeType === Node.TEXT_NODE && text(node.textContent));
    if (firstTextNode) firstTextNode.textContent = 'Likely Resource';
    const displayLabels = { Handyman:'Handy Services', Carpentry:'Carpenter', Landscape:'Landscaping', Roof:'Roofing', Paint:'Painting', Windows:'Window Specialist', Chimney:'Chimney Sweep' };
    Array.from(select.options).forEach(option => { if (displayLabels[option.value]) option.textContent = displayLabels[option.value]; });
    if (!rule) return;
    const key = `${roomLabel}::${cardTitle(card)}`;
    const migrated = readSessionObject(RESOURCE_MIGRATION_KEY);
    if (migrated[key]) return;
    if (select.value === rule.oldDefault && rule.resourceValue !== rule.oldDefault) {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
      if (setter) setter.call(select, rule.resourceValue); else select.value = rule.resourceValue;
      select.dispatchEvent(new Event('input', { bubbles:true }));
      select.dispatchEvent(new Event('change', { bubbles:true }));
    }
    migrated[key] = true;
    writeSessionObject(RESOURCE_MIGRATION_KEY, migrated);
  }

  function decorateChecklist() {
    document.querySelectorAll('.formPanel').forEach(panel => {
      const roomLabel = text(panel.querySelector(':scope > h1')?.textContent).replace(/\s+HTC$/i, '') || 'Walkthrough';
      const cards = Array.from(panel.children).filter(node => node.classList?.contains('checklistItemCard'));
      if (!cards.length) return;
      const firstByCategory = new Map();
      cards.forEach((card, index) => {
        card.removeAttribute('data-v3587-first-group');
        const title = cardTitle(card);
        const rule = exteriorRule(title);
        const slug = fixedCategory(card, roomLabel);
        const meta = CATEGORY_META.find(item => item.slug === slug) || CATEGORY_META[CATEGORY_META.length - 1];
        card.dataset.v3587Category = slug;
        card.style.setProperty('--tha-v3587-order', String(100 + meta.rank * 100 + index));
        if (!firstByCategory.has(slug)) firstByCategory.set(slug, card);
        card.querySelectorAll('.tradeIcon').forEach(icon => {
          icon.textContent = meta.icon;
          icon.title = `${meta.label} system/category. The likely fixing resource remains item-specific.`;
          icon.setAttribute('aria-label', `${meta.label} category`);
        });
        const resourceLabel = rule?.resourceLabel;
        card.querySelectorAll('.checklistSummaryMain>span:last-child,.expandedItemHead>div>p').forEach(node => {
          if (resourceLabel) setResourceLine(node, resourceLabel);
          else if (/Suggested:/i.test(node.textContent)) node.textContent = node.textContent.replace(/Suggested:/i, 'Likely resource:');
        });
        migrateResourceDefault(card, rule, roomLabel);
      });
      firstByCategory.forEach((card, slug) => {
        const meta = CATEGORY_META.find(item => item.slug === slug);
        if (meta) card.dataset.v3587FirstGroup = `${meta.icon} ${meta.label}`;
      });
      const toolbarCopy = panel.querySelector('.checklistToolbar .lede');
      if (toolbarCopy) toolbarCopy.textContent = 'Compact line items are visually consolidated by their fixed system/category. Changing a status or resource will not move the item.';
    });
  }

  const PASS_ORDER = [
    'Exterior & Site / Grounds', 'Landscaping / Site & Grounds', 'Handy Services', 'Roofing / Gutters',
    'Painting / Staining / Protective Coatings', 'Painting / Staining', 'Carpentry / Decks / Fences',
    'Windows / Exterior Sealant', 'Electrical', 'Plumbing', 'HVAC / Mechanical', 'Appliances',
    'General Contractor / Remodel', 'General Contractor / Structural', 'Safety / Life Safety', 'Pest', 'Specialty / Other'
  ];

  function decoratePass() {
    document.querySelectorAll('.passCategoryGroups').forEach(host => {
      Array.from(host.children).filter(node => node.classList?.contains('passCategoryGroup')).forEach((group, index) => {
        const label = text(group.querySelector('.passCategoryTitle h3, .passCategoryHeader h3, h3')?.textContent);
        const rank = PASS_ORDER.indexOf(label);
        group.style.setProperty('--tha-v3587-pass-order', String(rank >= 0 ? rank : 100 + index));
        const hasCare = Boolean(group.querySelector('.passReviewCard.pmcp-selected,.passReviewCard.pmcp-declined,.passReviewCard.thaPmcpLongRange'));
        const hasPlanning = Boolean(group.querySelector('.passReviewCard.thaPmcpActivePlanning'));
        group.classList.toggle('thaV3587HasCare', hasCare);
        group.classList.toggle('thaV3587HasPlanning', hasPlanning);
      });
    });
  }

  function run() {
    installStyles();
    polishStart(document.querySelector('.thaV358StartPage'));
    moveIntakeEmailAction();
    decorateClientFacing();
    decoratePass();
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

  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 2500);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
})();