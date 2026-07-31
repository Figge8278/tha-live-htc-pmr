(() => {
  const ID = 'tha-v3585-exterior-trade-realignment';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();

  const CATEGORY_META = [
    { slug: 'handy-services', label: 'Handy Services', icon: '🧰' },
    { slug: 'appliances', label: 'Appliances', icon: '⚙️' },
    { slug: 'electrical', label: 'Electrical', icon: '🔌' },
    { slug: 'plumbing', label: 'Plumbing', icon: '💧' },
    { slug: 'hvac-mechanical', label: 'HVAC / Ventilation', icon: '🌀' },
    { slug: 'roofing', label: 'Roofing / Gutters', icon: '🏠' },
    { slug: 'landscaping-site-grounds', label: 'Landscaping / Site & Grounds', icon: '🌿' },
    { slug: 'windows-exterior-sealant', label: 'Windows / Exterior Sealant', icon: '🪟' },
    { slug: 'general-contractor-remodel', label: 'General Contractor / Structural', icon: '🏗️' },
    { slug: 'carpentry-decks-fences', label: 'Carpentry / Decks / Fences', icon: '🔨' },
    { slug: 'painting-staining-coatings', label: 'Painting / Staining', icon: '🎨' },
    { slug: 'safety-life-safety', label: 'Safety / Life Safety', icon: '🛡️' },
    { slug: 'pest', label: 'Pest', icon: '🐜' },
    { slug: 'chimney', label: 'Chimney / Fireplace', icon: '🧱' },
    { slug: 'exterior-site-grounds', label: 'Landscaping / Site & Grounds', icon: '🌿' },
    { slug: 'specialty-other', label: 'Specialty / Other', icon: '🔎' }
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
      .thaV358LocalChooser label,.thaV358LocalChooser select,.thaV358LocalChooser button{font-size:12px!important}
      .thaV358LocalMeta{font-size:10px!important}

      .homeownerLane .quickIntakeGrid{grid-template-columns:minmax(0,1fr)!important;gap:11px!important}
      .homeownerLane .intakeQuestion.tha-quick-card{width:100%!important;text-align:left!important;align-items:stretch!important}
      .homeownerLane .tha-quick-header{justify-content:flex-start!important;align-items:center!important;text-align:left!important;padding:14px 15px!important}
      .homeownerLane .tha-quick-title{flex:1!important;justify-items:start!important;text-align:left!important}
      .homeownerLane .tha-quick-title strong,.homeownerLane .tha-quick-title small{display:block!important;width:100%!important;text-align:left!important;justify-self:start!important}
      .homeownerLane .tha-quick-title strong{font-size:15px!important}
      .homeownerLane .tha-quick-title small{font-size:11px!important}
      .homeownerLane .tha-quick-action{margin-left:auto!important}
      .homeownerLane .structuredPromptField,.homeownerLane .structuredPromptField span,.homeownerLane .intakeQuestion>span,.homeownerLane .intakeQuestion>small{text-align:left!important;align-items:flex-start!important;justify-content:flex-start!important}
      .thaV3584IntakeActionRow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:10px 0 12px;border:1px solid #d8e4ea;border-radius:12px;background:#f7fafc;padding:9px 11px}
      .thaV3584IntakeActionRow p{margin:0;color:#60717c;font-size:10px;font-weight:800;line-height:1.35}
      .thaV3584IntakeActionRow .copyIntakeEmailButton{margin-left:auto!important;padding:7px 10px!important;font-size:10px!important;background:#fff!important;color:#174d70!important;border:1px solid #c9dce8!important}
      .thaV3584IntakeActionRow .copyFeedback{font-size:10px!important}

      .intakePage label.thaV3584ClientFacing,.checklistDetailPanel label.thaV3584ClientFacing,.roomOverviewBody label.thaV3584ClientFacing{position:relative;border:1px solid #d9b74a!important;border-left:6px solid #bf8420!important;border-radius:12px!important;background:#fff9d8!important;padding:10px!important}
      .thaV3584ClientFacingBadge{display:inline-flex!important;width:max-content!important;margin:0 0 6px!important;border:1px solid #d9b74a!important;border-radius:999px!important;background:#fffef2!important;color:#715b0e!important;padding:3px 7px!important;font-size:9px!important;font-weight:950!important;letter-spacing:.03em!important;text-transform:uppercase!important}
      .intakePage label.thaV3584MustAnswer:not(.thaV3584Answered){border-color:#d06b19!important;border-left-color:#d06b19!important;background:#fff1dc!important;box-shadow:0 0 0 2px rgba(208,107,25,.12)!important}
      .intakePage label.thaV3584MustAnswer.thaV3584Answered{border-color:#5087b3!important;border-left-color:#287bb7!important;background:#eef7fc!important}
      .intakePage label.thaV3584MustAnswer:not(.thaV3584Answered) .thaV3584ClientFacingBadge{border-color:#d06b19!important;color:#8a4812!important}
      .intakePage label.thaV3584MustAnswer.thaV3584Answered .thaV3584ClientFacingBadge{border-color:#5087b3!important;color:#245f8a!important}
      .checklistDetailPanel label.thaV3584ClientFacing textarea,.roomOverviewBody label.thaV3584ClientFacing textarea,.intakePage label.thaV3584ClientFacing input{background:#fffef6!important;border-color:#d4bf67!important}

      .thaV358PromptFilters,.thaV358PromptGroupChip{display:none!important}
      .thaV3584TradeGroups{display:grid;gap:13px;margin:11px 0 4px}
      .thaV3584TradeGroup{display:grid;gap:6px;border:1px solid #dbe4e8;border-radius:16px;background:#f8fafb;padding:8px}
      .thaV3584TradeGroup[hidden]{display:none!important}
      .thaV3584TradeGroupHeader{display:flex;align-items:center;gap:8px;padding:3px 4px 6px;border-bottom:1px solid #dce5e9;color:#0b3658}
      .thaV3584TradeGroupHeader span{display:grid;place-items:center;width:29px;height:29px;border-radius:9px;background:#fff;border:1px solid #d9e3e7;font-size:16px}
      .thaV3584TradeGroupHeader strong{font-size:13px;line-height:1.2}
      .thaV3584TradeGroupHeader small{display:block;color:#677780;font-size:9px;font-weight:800;margin-top:1px}
      .thaV3584TradeGroupBody{display:grid;gap:6px}
      .thaV3584TradeGroup .checklistItemCard{margin:0!important;border-radius:12px!important}
      .thaV3584TradeGroup .checklistSummaryRow{padding:9px 11px!important;gap:8px!important}
      .thaV3584TradeGroup .checklistSummaryMain{gap:2px!important}
      .thaV3584TradeGroup .checklistSummaryMain .itemTitleLine strong{font-size:15px!important;line-height:1.2!important}
      .thaV3584TradeGroup .checklistSummaryMain>span:last-child{font-size:10px!important}
      .thaV3584TradeGroup .tradeIcon{width:32px!important;height:32px!important;font-size:18px!important;background:#fff7e9!important;border:1px solid #e4c38d!important}
      .thaV3584TradeGroup .statusBadge,.thaV3584TradeGroup .summaryFlag{font-size:9px!important;padding:4px 6px!important}
      .thaV3584TradeGroup .expandHint{font-size:9px!important;padding:5px 7px!important}
      .formPanel .checklistToolbar .thaV358SupportingHeading{font-size:18px!important}
      .formPanel .checklistToolbar .lede{font-size:10px!important}
      @media(max-width:700px){.thaV358Path{grid-template-columns:38px minmax(0,1fr) auto!important}.thaV3584IntakeActionRow{align-items:stretch;flex-direction:column}.thaV3584IntakeActionRow .copyIntakeEmailButton{width:100%!important;margin-left:0!important;justify-content:center!important}}
    `;
    document.head.append(style);
  }

  function polishStart(page) {
    if (!page) return;
    const local = page.querySelector('.thaV358Path.local');
    const existing = page.querySelector('.thaV358Path.existing');
    const localTitle = local?.querySelector('h3');
    const localCopy = local?.querySelector('p');
    const existingTitle = existing?.querySelector('h3');
    const existingCopy = existing?.querySelector('p');
    if (localTitle) localTitle.textContent = 'Continue Local';
    if (localCopy) localCopy.textContent = 'Resume a saved walkthrough on this device only.';
    if (existingTitle) existingTitle.textContent = 'Use Existing Information';
    if (existingCopy) existingCopy.textContent = 'Homeowner Intake, prior Snapshot file, or Google Drive.';
    const snapshotChoice = page.querySelector('[data-v3583-source="snapshot"]');
    const driveChoice = page.querySelector('[data-v3583-source="drive"]');
    if (snapshotChoice) snapshotChoice.textContent = 'Prior Snapshot File';
    if (driveChoice) driveChoice.textContent = 'Open Google Drive';
    const workspace = page.querySelector('.thaV358PathWorkspace');
    const kind = workspace?.dataset.kind || '';
    const subkind = workspace?.dataset.subkind || '';
    const titleNode = page.querySelector('[data-v3583-workspace-title]');
    const copyNode = page.querySelector('[data-v3583-workspace-copy]');
    const host = page.querySelector('.thaV358PathHost');
    if (kind === 'local') {
      if (titleNode) titleNode.textContent = 'Continue local walkthrough';
      if (copyNode) copyNode.textContent = 'Choose a saved walkthrough that remains on this browser.';
      host?.querySelectorAll('.intakeImportCard,.businessRecordsCard,.thaSnapshotSourcePanel').forEach(node => node.style.display = 'none');
    } else host?.querySelectorAll('.intakeImportCard,.businessRecordsCard,.thaSnapshotSourcePanel').forEach(node => node.style.removeProperty('display'));
    if (kind === 'existing' && !subkind) {
      if (titleNode) titleNode.textContent = 'Use existing information';
      if (copyNode) copyNode.textContent = 'Choose a completed Homeowner Intake, a prior Snapshot file, or Google Drive.';
    }
    if (kind === 'existing' && subkind === 'snapshot') {
      if (titleNode) titleNode.textContent = 'Prior Snapshot File';
      if (copyNode) copyNode.textContent = 'Choose a Snapshot file downloaded from Drive or already stored on this device.';
      const heading = host?.querySelector('.snapshotSourceHeading h4');
      if (heading) heading.textContent = 'Prior Snapshot File';
      const label = host?.querySelector('.snapshotSourceImport');
      if (label && label.childNodes[0]) label.childNodes[0].textContent = 'Choose Snapshot File';
    }
  }

  function moveIntakeEmailAction() {
    const page = document.querySelector('.intakePage');
    const lane = page?.querySelector('.homeownerLane');
    const button = page?.querySelector('.copyIntakeEmailButton');
    if (!page || !lane || !button) return;
    let row = lane.querySelector(':scope > .thaV3584IntakeActionRow');
    if (!row) {
      row = document.createElement('div');
      row.className = 'thaV3584IntakeActionRow noPrint';
      row.innerHTML = '<p>Secondary tool: copies the seven-question homeowner request used before the walkthrough.</p>';
      const controls = lane.querySelector(':scope > .tha-quick-intake-controls');
      const lede = lane.querySelector(':scope > .lede');
      if (controls) lane.insertBefore(row, controls);
      else if (lede) lede.after(row);
      else lane.querySelector('summary')?.after(row);
    }
    if (button.parentElement !== row) row.append(button);
    button.innerHTML = button.innerHTML.replace(/Copy Pre-Walkthrough Intake Email/i, 'Copy Homeowner Intake Request');
    const feedback = page.querySelector('.intakeStatusSummary .copyFeedback');
    if (feedback && feedback.parentElement !== row) row.append(feedback);
  }

  function labelMatches(label, patterns) {
    const value = text(label.textContent);
    return patterns.some(pattern => pattern.test(value));
  }

  function addClientFacingBadge(label, mustAnswer) {
    if (!label) return;
    label.classList.add('thaV3584ClientFacing');
    if (mustAnswer) label.classList.add('thaV3584MustAnswer');
    let badge = label.querySelector(':scope > .thaV3584ClientFacingBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'thaV3584ClientFacingBadge';
      label.prepend(badge);
    }
    badge.textContent = mustAnswer ? 'Must answer · PMR reference' : 'Client-facing PMR wording';
    const field = label.querySelector('input,textarea,select');
    const refresh = () => label.classList.toggle('thaV3584Answered', Boolean(text(field?.value)));
    refresh();
    if (field && !field.dataset.v3585ClientFacingBound) {
      field.dataset.v3585ClientFacingBound = 'true';
      field.addEventListener('input', refresh);
      field.addEventListener('change', refresh);
    }
  }

  function decorateIntake() {
    const page = document.querySelector('.intakePage');
    if (!page) return;
    page.querySelectorAll('.intakeSubsection label').forEach(label => {
      if (labelMatches(label, CLIENT_FACING_INTAKE)) addClientFacingBadge(label, labelMatches(label, REQUIRED_REFERENCES));
    });
  }

  function decorateHtcClientFacing() {
    document.querySelectorAll('.checklistDetailPanel label.notes').forEach(label => {
      if (/Notes for PMR detail/i.test(text(label.textContent))) addClientFacingBadge(label, false);
    });
    document.querySelectorAll('.roomOverviewBody label.notes').forEach(label => {
      if (!/Room Note \/ Voice Transcript/i.test(text(label.textContent))) return;
      addClientFacingBadge(label, false);
      const badge = label.querySelector('.thaV3584ClientFacingBadge');
      if (badge) badge.textContent = 'PMR wording when this room overview is included';
    });
  }

  function cardTitle(card) {
    return text(card.querySelector('.checklistSummaryRow .itemTitleLine strong')?.textContent || card.querySelector('.expandedItemHead h2')?.textContent);
  }

  function ruleForCard(card) {
    const title = cardTitle(card);
    return EXTERIOR_RULES.find(rule => rule.match.test(title));
  }

  function currentCategory(card) {
    const explicit = card.dataset.v3585Category;
    if (explicit) return CATEGORY_META.find(meta => meta.slug === explicit) || CATEGORY_META[CATEGORY_META.length - 1];
    return CATEGORY_META.find(meta => card.classList.contains(`category-${meta.slug}`)) || CATEGORY_META[CATEGORY_META.length - 1];
  }

  function assignCategory(card, slug) {
    Array.from(card.classList).filter(name => name.startsWith('category-') && name !== 'categoryCard').forEach(name => card.classList.remove(name));
    card.classList.add(`category-${slug}`);
    card.dataset.v3585Category = slug;
  }

  function setResourceLine(node, label) {
    if (!node) return;
    const zone = text(node.textContent).split('·')[0].trim();
    node.textContent = `${zone} · Likely resource: ${label}`;
  }

  function updateResourceSelect(card, rule) {
    const resourceLabel = Array.from(card.querySelectorAll('.checklistDetailPanel .inputs > label')).find(label => /Suggested Trade \/ Resource|Likely Resource/i.test(text(label.textContent)));
    const select = resourceLabel?.querySelector('select');
    if (!select) return;
    const firstTextNode = Array.from(resourceLabel.childNodes).find(node => node.nodeType === Node.TEXT_NODE && text(node.textContent));
    if (firstTextNode) firstTextNode.textContent = 'Likely Resource';
    const displayLabels = { Handyman: 'Handy Services', Carpentry: 'Carpenter', Landscape: 'Landscaping', Roof: 'Roofing', Paint: 'Painting', Windows: 'Window Specialist', Chimney: 'Chimney Sweep' };
    Array.from(select.options).forEach(option => {
      if (displayLabels[option.value]) option.textContent = displayLabels[option.value];
    });
    if (rule && select.value === rule.oldDefault && rule.resourceValue !== rule.oldDefault) {
      select.value = rule.resourceValue;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function decorateCard(card) {
    const rule = ruleForCard(card);
    if (rule) assignCategory(card, rule.category);
    const meta = currentCategory(card);
    card.querySelectorAll('.tradeIcon').forEach(icon => {
      icon.textContent = meta.icon;
      icon.title = `${meta.label} system/category. The likely fixing resource is listed separately.`;
      icon.setAttribute('aria-label', `${meta.label} category`);
    });
    card.querySelectorAll('.categoryBadge').forEach(badge => { badge.textContent = meta.label; });
    const resourceLabel = rule?.resourceLabel;
    card.querySelectorAll('.checklistSummaryMain>span:last-child,.expandedItemHead>div>p').forEach(node => {
      if (resourceLabel) setResourceLine(node, resourceLabel);
      else if (/Suggested:/i.test(node.textContent)) node.textContent = node.textContent.replace(/Suggested:/i, 'Likely resource:');
    });
    updateResourceSelect(card, rule);
  }

  function groupChecklist(panel) {
    if (!panel) return;
    const cards = Array.from(panel.querySelectorAll('.checklistItemCard'));
    if (!cards.length) return;
    cards.forEach(decorateCard);
    let host = panel.querySelector(':scope > .thaV3584TradeGroups');
    if (!host) {
      host = document.createElement('div');
      host.className = 'thaV3584TradeGroups';
      const anchor = panel.querySelector(':scope > .thaV358PromptFilters') || panel.querySelector(':scope > .checklistToolbar');
      anchor?.after(host);
    }
    host.replaceChildren();
    CATEGORY_META.forEach(meta => {
      const matching = cards.filter(card => currentCategory(card).slug === meta.slug);
      if (!matching.length) return;
      const group = document.createElement('section');
      group.className = 'thaV3584TradeGroup';
      group.dataset.v3585Category = meta.slug;
      group.innerHTML = `<header class="thaV3584TradeGroupHeader"><span aria-hidden="true">${meta.icon}</span><div><strong>${meta.label}</strong><small>System/category · likely resource remains item-specific</small></div></header><div class="thaV3584TradeGroupBody"></div>`;
      const body = group.querySelector('.thaV3584TradeGroupBody');
      matching.forEach(card => body.append(card));
      group.hidden = matching.every(card => card.dataset.v358Hidden === 'true');
      host.append(group);
    });
  }

  function polishChecklist() {
    document.querySelectorAll('.formPanel').forEach(panel => {
      const heading = panel.querySelector('.checklistToolbar .thaV358SupportingHeading');
      const copy = panel.querySelector('.checklistToolbar .lede');
      if (heading) heading.textContent = 'Walkthrough items by system / trade';
      if (copy) copy.textContent = 'Compact line items retain their titles. Open a row only when detailed field notes are needed.';
      groupChecklist(panel);
    });
  }

  function run() {
    installStyles();
    polishStart(document.querySelector('.thaV358StartPage'));
    moveIntakeEmailAction();
    decorateIntake();
    decorateHtcClientFacing();
    polishChecklist();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; run(); });
  }
  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 2400);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open', 'hidden', 'data-v358-hidden', 'data-kind', 'data-subkind'] });
})();