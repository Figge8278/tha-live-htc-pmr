(() => {
  const CACHE = 'tha-pmcp-care-plan-view-v1';
  const clean = node => String(node?.textContent || '').replace(/\s+/g, ' ').trim();
  const title = card => {
    const h = card.querySelector('h4');
    const value = clean(h) === 'Furnace filter check / replacement' ? 'Furnace filter replacement' : clean(h);
    if (h && h.textContent !== value) h.textContent = value;
    return value || 'Continued care item';
  };
  const items = () => Array.from(document.querySelectorAll('.passWorkspace .passReviewCard')).map(card => ({
    title: title(card), category: clean(card.querySelector('.categoryBadge')) || 'Other care', source: clean(card.querySelector('.sourceBadge')) || 'Supported',
    selected: card.classList.contains('pmcp-selected') || Boolean(card.querySelector('input[type="checkbox"]')?.checked),
    declined: card.classList.contains('pmcp-declined')
  }));
  const signature = list => JSON.stringify(list.map(item => [item.title, item.category, item.source, item.selected, item.declined]));
  const read = () => { try { const data = JSON.parse(sessionStorage.getItem(CACHE) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } };
  const write = list => { try { sessionStorage.setItem(CACHE, JSON.stringify(list)); } catch {} };

  function planCard(item) {
    const node = document.createElement('article');
    node.className = `passReviewCard ${item.selected ? 'pmcp-selected' : (item.declined ? 'pmcp-declined' : 'pmcp-pending')}`;
    node.innerHTML = `<div class="passReviewCardHeader"><div class="passReviewTitle"><h4></h4><p class="passReviewSubline"></p></div></div>`;
    node.querySelector('h4').textContent = item.title;
    node.querySelector('p').textContent = item.selected ? `Active care plan · ${item.source}` : `Available upkeep · ${item.source}`;
    return node;
  }

  function planGroup(name, list, open) {
    const selected = list.filter(item => item.selected).length;
    const group = document.createElement('section');
    group.className = `passCategoryGroup ${selected ? 'hasPmcpSelected' : ''}`;
    const body = document.createElement('div');
    body.className = 'passReviewGrid';
    body.hidden = !open;
    list.forEach(item => body.append(planCard(item)));
    const header = document.createElement('header');
    header.className = 'passCategoryHeader';
    header.innerHTML = `<div class="passCategoryTitle"><span class="passCategoryIcon">${selected ? '✓' : '•'}</span><h3></h3></div><span class="passCategoryCount">${list.length} possibilities · ${selected} selected</span>`;
    header.querySelector('h3').textContent = name;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'secondaryBtn'; button.textContent = open ? 'Close' : 'Open'; button.setAttribute('aria-expanded', String(open));
    button.addEventListener('click', event => { event.stopPropagation(); const next = body.hidden; body.hidden = !next; button.textContent = next ? 'Close' : 'Open'; button.setAttribute('aria-expanded', String(next)); });
    header.append(button); group.append(header, body); return group;
  }

  function planSection(list, pmr, sig) {
    const selected = list.filter(item => item.selected).length;
    const section = document.createElement('section');
    section.className = 'pmrBlock'; section.dataset.thaCarePlan = 'true'; section.dataset.thaPlanSignature = sig;
    section.innerHTML = `<h2>Preventative Maintenance Care Plan</h2><p class="lede">${pmr ? 'Supported home-care opportunities are shown by trade. Green identifies the care items the homeowner has chosen to keep active.' : 'This is the live, read-only plan representation. All supported possibilities remain visible; green identifies active selected care.'}</p><div class="summaryTypeGrid"><div><strong>${list.length}</strong><span>Supported possibilities</span></div><div><strong>${selected}</strong><span>Active selected care</span></div><div><strong>${Math.max(0, list.length - selected)}</strong><span>Still available</span></div></div>`;
    const groups = list.reduce((out, item) => ({ ...out, [item.category]: [...(out[item.category] || []), item] }), {});
    Object.entries(groups).forEach(([name, group]) => section.append(planGroup(name, group, pmr || group.some(item => item.selected))));
    return section;
  }

  function place(host, list, pmr) {
    if (!host || !list.length) return;
    const sig = signature(list); const old = host.querySelector('[data-tha-care-plan="true"]');
    if (old?.dataset.thaPlanSignature === sig) return;
    old?.remove();
    const plan = planSection(list, pmr, sig);
    const anchor = pmr ? host.querySelector('.frontSummary, .homeHealthSnapshot, .snapshot') : host.querySelector('.passReviewPanel');
    if (anchor) anchor.after(plan); else host.append(plan);
    if (pmr && !host.querySelector('.tha-baseline-upkeep') && /No PMR findings recorded|No immediate PMR findings were identified/i.test(clean(host))) {
      const baseline = document.createElement('section'); baseline.className = 'pmrBlock frontSummary tha-baseline-upkeep';
      baseline.innerHTML = '<h2>Baseline Home Care / Upkeep To-Dos</h2><p class="lede">No repair concerns were identified in the reviewed areas. The care-plan opportunities below are practical preventive upkeep items supported by this walkthrough, not defects and not part of the PMR priority counts.</p>';
      plan.before(baseline);
    }
  }

  function builder() {
    document.querySelectorAll('.passWorkspace .passReviewCard').forEach(card => {
      const evidence = clean(card.querySelector('.passSourceEvidence'));
      const source = card.querySelector('.sourceBadge');
      if (source && /intake/i.test(evidence) && /htc/i.test(evidence)) source.textContent = 'Intake + HTC';
      const controls = card.querySelector('.passReviewTop'); const fields = card.querySelector('.passReviewFields');
      if (controls) controls.hidden = !fields;
    });
  }

  function labels() {
    const map = { 'Expand All':'Open All', 'Collapse All':'Close All', Expand:'Open', Collapse:'Close', 'Hide Controls':'Close setup & records', 'Open Controls':'Open setup & records', 'Collapse records':'Close records' };
    document.querySelectorAll('button').forEach(button => { const next = map[clean(button)]; if (next) button.textContent = next; });
    document.querySelectorAll('.formPanel span,.formPanel small,.formPanel em,.formPanel div').forEach(node => {
      if (node.children.length) return; const value = clean(node); const next = value === 'Good' ? 'Condition: Good' : value === 'No PMR' ? 'Repair report: None' : value === 'No notes/photos' ? 'Routine care: None' : /^PASS:\s*(.+)$/i.test(value) ? `Routine care: ${value.replace(/^PASS:\s*/i,'')}` : '';
      if (next) node.textContent = next;
    });
    document.querySelectorAll('.formPanel .roomOverviewCard').forEach(card => {
      if (card.dataset.thaOverviewHandled) return; const header = card.querySelector('.roomOverviewCardHeader'); const body = card.querySelector('.roomOverviewBody'); if (!header || !body) return;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'secondaryBtn'; button.textContent = 'Close overview';
      button.addEventListener('click', event => { event.stopPropagation(); const opening = body.hidden; body.hidden = !opening; button.textContent = opening ? 'Close overview' : 'Open overview'; });
      header.append(button); card.dataset.thaOverviewHandled = 'true';
    });
  }

  function run() {
    builder(); labels(); const live = items(); if (live.length) write(live); place(document.querySelector('.passWorkspace'), live, false); const pmr = Array.from(document.querySelectorAll('.pmr')).find(node => !node.classList.contains('passWorkspace')); place(pmr, live.length ? live : read(), true);
  }
  let queued = false; const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; run(); }); };
  document.addEventListener('change', schedule, true);
  document.addEventListener('click', event => { if (!event.target.closest('[data-tha-care-plan="true"]')) setTimeout(schedule, 0); }, true);
  schedule(); new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
})();
