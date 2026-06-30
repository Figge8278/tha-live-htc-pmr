(() => {
  const PLAN_CACHE_KEY = 'tha-pmcp-care-plan-view-v1';
  const canonicalTitles = {
    'Furnace filter check / replacement': 'Furnace filter replacement'
  };

  function text(node) {
    return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function categoryForCard(card) {
    return text(card.querySelector('.categoryBadge')) || 'Other care';
  }

  function titleForCard(card) {
    const heading = card.querySelector('h4');
    const current = text(heading) || 'Continued care item';
    const next = canonicalTitles[current] || current;
    if (heading && heading.textContent !== next) heading.textContent = next;
    return next;
  }

  function sourceForCard(card) {
    return text(card.querySelector('.sourceBadge')) || 'Supported';
  }

  function statusForCard(card) {
    return text(card.querySelector('.passWorkflowBadge')) || 'Pending PMCP decision';
  }

  function isSelected(card) {
    return Boolean(card.classList.contains('pmcp-selected') || card.querySelector('input[type="checkbox"]')?.checked);
  }

  function isDeclined(card) {
    return card.classList.contains('pmcp-declined') || /not this year/i.test(statusForCard(card));
  }

  function careItems() {
    return Array.from(document.querySelectorAll('.passWorkspace .passReviewCard')).map(card => ({
      key: titleForCard(card).toLowerCase(),
      category: categoryForCard(card),
      title: titleForCard(card),
      source: sourceForCard(card),
      status: statusForCard(card),
      selected: isSelected(card),
      declined: isDeclined(card)
    }));
  }

  function savePlan(items) {
    try {
      sessionStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(items));
    } catch (_) {
      // Native PMCP decisions remain authoritative. This only preserves the read-only visual map while switching tabs.
    }
  }

  function readPlan() {
    try {
      const value = JSON.parse(sessionStorage.getItem(PLAN_CACHE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function groupItems(items) {
    return items.reduce((groups, item) => {
      const key = item.category || 'Other care';
      groups[key] = [...(groups[key] || []), item];
      return groups;
    }, {});
  }

  function planLine(item) {
    const line = document.createElement('article');
    line.className = `passReviewCard ${item.selected ? 'pmcp-selected' : (item.declined ? 'pmcp-declined' : 'pmcp-pending')}`;
    const top = document.createElement('div');
    top.className = 'passReviewCardHeader';
    const copy = document.createElement('div');
    copy.className = 'passReviewTitle';
    const title = document.createElement('h4');
    title.textContent = item.title;
    const meta = document.createElement('p');
    meta.className = 'passReviewSubline';
    meta.textContent = item.selected ? `Active care plan · ${item.source}` : `Available upkeep · ${item.source}`;
    copy.append(title, meta);
    top.append(copy);
    line.append(top);
    return line;
  }

  function planGroup(name, items, { open = false } = {}) {
    const selected = items.filter(item => item.selected).length;
    const group = document.createElement('section');
    group.className = `passCategoryGroup ${selected ? 'hasPmcpSelected' : ''}`;
    const header = document.createElement('header');
    header.className = 'passCategoryHeader';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'passCategoryTitle';
    const icon = document.createElement('span');
    icon.className = 'passCategoryIcon';
    icon.textContent = selected ? '✓' : '•';
    const title = document.createElement('h3');
    title.textContent = name;
    titleWrap.append(icon, title);
    const count = document.createElement('span');
    count.className = 'passCategoryCount';
    count.textContent = `${items.length} possibilities · ${selected} selected`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondaryBtn';
    button.textContent = open ? 'Close' : 'Open';
    button.setAttribute('aria-expanded', String(open));
    const body = document.createElement('div');
    body.className = 'passReviewGrid';
    body.hidden = !open;
    items.forEach(item => body.append(planLine(item)));
    button.addEventListener('click', () => {
      const nextOpen = body.hidden;
      body.hidden = !nextOpen;
      button.textContent = nextOpen ? 'Close' : 'Open';
      button.setAttribute('aria-expanded', String(nextOpen));
    });
    header.append(titleWrap, count, button);
    group.append(header, body);
    return group;
  }

  function planSection(items, { pmr = false } = {}) {
    const selected = items.filter(item => item.selected).length;
    const section = document.createElement('section');
    section.className = 'pmrBlock';
    section.dataset.thaCarePlan = 'true';
    const heading = document.createElement('h2');
    heading.textContent = 'Preventative Maintenance Care Plan';
    const lede = document.createElement('p');
    lede.className = 'lede';
    lede.textContent = pmr
      ? 'Supported home-care opportunities are shown by trade. Green identifies the care items the homeowner has chosen to keep active.'
      : 'This is the live, read-only plan representation. All supported possibilities remain visible; green identifies active selected care.';
    const stats = document.createElement('div');
    stats.className = 'summaryTypeGrid';
    stats.innerHTML = `<div><strong>${items.length}</strong><span>Supported possibilities</span></div><div><strong>${selected}</strong><span>Active selected care</span></div><div><strong>${Math.max(items.length - selected, 0)}</strong><span>Still available</span></div>`;
    section.append(heading, lede, stats);
    const groups = groupItems(items);
    Object.entries(groups).forEach(([name, grouped]) => section.append(planGroup(name, grouped, { open: pmr || grouped.some(item => item.selected) })));
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'lede';
      empty.textContent = 'No supported care possibilities are available yet. Add relevant Intake context or mark an HTC row as a PASS Candidate.';
      section.append(empty);
    }
    return section;
  }

  function placePassCarePlan(items) {
    const workspace = document.querySelector('.passWorkspace');
    if (!workspace) return;
    workspace.querySelector('[data-tha-care-plan="true"]')?.remove();
    const builder = workspace.querySelector('.passReviewPanel');
    const section = planSection(items);
    if (builder) builder.after(section);
    else workspace.append(section);
  }

  function placePmrCarePlan(items) {
    const pmr = Array.from(document.querySelectorAll('.pmr')).find(node => !node.classList.contains('passWorkspace'));
    if (!pmr || !items.length) return;
    pmr.querySelector('[data-tha-care-plan="true"]')?.remove();
    const existing = pmr.querySelector('.frontSummary, .homeHealthSnapshot, .snapshot');
    const section = planSection(items, { pmr: true });
    if (existing) existing.after(section);
    else pmr.append(section);
    if (!pmr.querySelector('.tha-baseline-upkeep')) {
      const noFindings = /No PMR findings recorded|No immediate PMR findings were identified/i.test(text(pmr));
      if (noFindings) {
        const baseline = document.createElement('section');
        baseline.className = 'pmrBlock frontSummary tha-baseline-upkeep';
        baseline.innerHTML = '<h2>Baseline Home Care / Upkeep To-Dos</h2><p class="lede">No repair concerns were identified in the reviewed areas. The care-plan opportunities below are practical preventive upkeep items supported by this walkthrough, not defects and not part of the PMR priority counts.</p>';
        section.before(baseline);
      }
    }
  }

  function tightenBuilder() {
    document.querySelectorAll('.passWorkspace .passReviewCard').forEach(card => {
      card.classList.add('tha-pmcp-card');
      const source = card.querySelector('.sourceBadge');
      const evidence = text(card.querySelector('.passSourceEvidence'));
      if (source && /intake/i.test(evidence) && /htc/i.test(evidence)) source.textContent = 'Intake + HTC';
      const controls = card.querySelector('.passReviewTop');
      const fields = card.querySelector('.passReviewFields');
      if (!controls) return;
      controls.hidden = !fields;
      if (fields && controls.previousElementSibling !== fields) fields.after(controls);
    });
  }

  function renameDisclosureControls() {
    const exact = new Map([
      ['Expand All', 'Open All'],
      ['Collapse All', 'Close All'],
      ['Expand', 'Open'],
      ['Collapse', 'Close'],
      ['Hide Controls', 'Close setup & records'],
      ['Open Controls', 'Open setup & records'],
      ['Collapse records', 'Close records']
    ]);
    document.querySelectorAll('button').forEach(button => {
      const label = text(button);
      if (!label || button.dataset.thaDisclosureFixed === 'true') return;
      const next = exact.get(label);
      if (next && next !== label) {
        button.textContent = next;
        button.dataset.thaDisclosureFixed = 'true';
      }
    });
  }

  function clarifyHtcStatusStrips() {
    const map = value => {
      if (value === 'Good') return 'Condition: Good';
      if (value === 'No PMR') return 'Repair report: None';
      if (value === 'No notes/photos') return 'Routine care: None';
      const pass = value.match(/^PASS:\s*(.+)$/i);
      if (pass) return `Routine care: ${pass[1]}`;
      return '';
    };
    document.querySelectorAll('.formPage span, .formPage small, .formPage em, .formPage div').forEach(node => {
      if (node.children.length || node.dataset.thaStatusFixed === 'true') return;
      const value = text(node);
      const next = map(value);
      if (!next) return;
      node.textContent = next;
      node.dataset.thaStatusFixed = 'true';
    });
  }

  function addRoomOverviewControls() {
    const candidates = Array.from(document.querySelectorAll('.formPage section, .formPage article, .formPage div')).filter(node => {
      if (node.dataset.thaOverviewHandled === 'true') return false;
      const ownText = text(node).slice(0, 90);
      return /room overview/i.test(ownText) && node.querySelectorAll('button').length === 0 && node.children.length > 1;
    });
    candidates.forEach(container => {
      const lines = Array.from(container.children).filter(child => child.tagName !== 'BUTTON');
      if (lines.length < 2) return;
      const body = document.createElement('div');
      body.className = 'tha-room-overview-body';
      lines.slice(1).forEach(child => body.append(child));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondaryBtn';
      button.textContent = 'Close overview';
      button.setAttribute('aria-expanded', 'true');
      button.addEventListener('click', () => {
        const opening = body.hidden;
        body.hidden = !opening;
        button.textContent = opening ? 'Close overview' : 'Open overview';
        button.setAttribute('aria-expanded', String(opening));
      });
      container.append(button, body);
      container.dataset.thaOverviewHandled = 'true';
    });
  }

  function run() {
    tightenBuilder();
    renameDisclosureControls();
    clarifyHtcStatusStrips();
    addRoomOverviewControls();
    const liveItems = careItems();
    if (liveItems.length) {
      savePlan(liveItems);
      placePassCarePlan(liveItems);
    }
    placePmrCarePlan(liveItems.length ? liveItems : readPlan());
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

  document.addEventListener('change', schedule, true);
  document.addEventListener('click', () => setTimeout(schedule, 0), true);
  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
