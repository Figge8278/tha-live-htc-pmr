(() => {
  const ID = 'tha-v35889-demo-exit-guard';
  const START_KEY = 'tha-v358-start-active';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  let loading = false;

  function demoSourceButton(title) {
    return Array.from(document.querySelectorAll('.demoScenarioCard .demoScenario'))
      .find(article => text(article.querySelector('h4')?.textContent) === title)
      ?.querySelector('button') || null;
  }

  function findDemoSource(pattern) {
    return Array.from(document.querySelectorAll('.demoScenarioCard .demoScenario'))
      .find(article => pattern.test(text(article.querySelector('h4')?.textContent)))
      ?.querySelector('button') || null;
  }

  function setStartActive(active) {
    localStorage.setItem(START_KEY, active ? 'true' : 'false');
    document.querySelector('.app')?.classList.toggle('thaV358StartActive', active);
  }

  function navButton(pattern) {
    return Array.from(document.querySelectorAll('.topbar nav button'))
      .find(button => pattern.test(text(button.textContent))) || null;
  }

  function pmrNavButton() {
    return navButton(/^PMR$/i);
  }

  function pmrIsVisible() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return false;
    const style = window.getComputedStyle(pmr);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  async function waitFor(getValue, attempts = 40, delay = 100) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const value = getValue();
      if (value) return value;
      await wait(delay);
    }
    return null;
  }

  function restoreTriggerButton(triggerButton) {
    if (!triggerButton) return;
    triggerButton.disabled = false;
    triggerButton.removeAttribute('aria-busy');
    const copy = triggerButton.querySelector('small');
    if (copy?.dataset.loadingCopy) {
      copy.textContent = copy.dataset.loadingCopy;
      delete copy.dataset.loadingCopy;
    }
  }

  function setLoadingCopy(triggerButton, message) {
    const copy = triggerButton?.querySelector('small');
    if (!copy) return;
    if (!copy.dataset.loadingCopy) copy.dataset.loadingCopy = copy.textContent || '';
    copy.textContent = message;
  }

  function setNativeValue(control, value) {
    if (!control) return false;
    const prototype = control instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : control instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(control, value);
    else control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function cardFor(pattern) {
    return Array.from(document.querySelectorAll('.checklistItemCard')).find(card => {
      const heading = card.querySelector('.checklistSummaryMain strong,.expandedItemHead h2');
      return pattern.test(text(heading?.textContent));
    }) || null;
  }

  async function ensureCardOpen(pattern) {
    let card = cardFor(pattern);
    if (!card) return null;
    const summary = card.querySelector('.checklistSummaryRow');
    if (summary?.getAttribute('aria-expanded') !== 'true') {
      summary?.click();
      await wait(80);
      card = cardFor(pattern);
    }
    return card;
  }

  function labeledControl(card, pattern, selector = 'select,input,textarea') {
    const label = Array.from(card?.querySelectorAll('label') || []).find(item => pattern.test(text(item.textContent)));
    return label?.querySelector(selector) || null;
  }

  async function updateChecklistItem(pattern, updates = {}) {
    let card = await ensureCardOpen(pattern);
    if (!card) return false;

    const apply = async callback => {
      card = cardFor(pattern);
      if (!card) return false;
      const result = callback(card);
      await wait(70);
      return result;
    };

    if (updates.status) await apply(current => setNativeValue(current.querySelector('.statusControlField select'), updates.status));
    if (updates.certainty) await apply(current => setNativeValue(labeledControl(current, /^Action Certainty/i, 'select'), updates.certainty));
    if (updates.trade) await apply(current => setNativeValue(labeledControl(current, /^Suggested Trade \/ Resource/i, 'select'), updates.trade));
    if (updates.effort) await apply(current => setNativeValue(labeledControl(current, /^Approx\. Time/i, 'select'), updates.effort));
    if (updates.pace) await apply(current => setNativeValue(labeledControl(current, /^Homeowner Pace/i, 'select'), updates.pace));
    if (updates.notes) await apply(current => setNativeValue(current.querySelector('label.notes textarea'), updates.notes));
    if (typeof updates.pmcp === 'boolean') await apply(current => {
      const checkbox = current.querySelector('.passCandidateToggle input[type="checkbox"]');
      if (checkbox && checkbox.checked !== updates.pmcp) checkbox.click();
      return Boolean(checkbox);
    });
    if (typeof updates.thaAction === 'boolean') await apply(current => {
      const checkbox = current.querySelector('.workOrderToggle input[type="checkbox"]');
      if (checkbox && checkbox.checked !== updates.thaAction) checkbox.click();
      return Boolean(checkbox);
    });
    if (updates.actionType) await apply(current => setNativeValue(current.querySelector('.thaActionTypeField select'), updates.actionType));
    return true;
  }

  async function updateRoomOverview() {
    const toggle = document.querySelector('.roomOverviewSummaryButton');
    if (toggle?.getAttribute('aria-expanded') !== 'true') {
      toggle?.click();
      await wait(80);
    }
    setNativeValue(document.querySelector('.roomOverviewStatusSelect'), 'Trade Attention');
    await wait(60);
    setNativeValue(document.querySelector('.roomOverviewBody label.notes textarea'), 'Current-build mixed demo: electrical, plumbing, Handy Services, PMCP, and THA follow-up are intentionally represented together.');
    await wait(60);
    const action = document.querySelector('.roomOverviewBody .workOrderToggle input[type="checkbox"]');
    if (action && !action.checked) action.click();
    await wait(60);
    setNativeValue(document.querySelector('.roomOverviewBody .thaActionTypeField select'), 'Follow-up observation');
  }

  async function buildCurrentMixedDemo(triggerButton) {
    setLoadingCopy(triggerButton, 'Loading current-build mixed demo…');

    // Demo 3's original hard-coded row indexes predate the current HTC catalog.
    // Start from the stable clean-home scenario, then populate current controls
    // by visible item names so the demo stays aligned as the catalog evolves.
    const cleanSource = findDemoSource(/^Demo 1\b/i);
    if (!cleanSource) return false;
    cleanSource.click();

    setStartActive(false);
    await wait(220);
    navButton(/^HTC\b/i)?.click();
    const htc = await waitFor(() => document.querySelector('main.htcPage'));
    if (!htc) return false;

    const kitchenButton = Array.from(document.querySelectorAll('.roomNav .sectionSelect, .roomNav button'))
      .find(button => /^Kitchen\b/i.test(text(button.textContent)));
    kitchenButton?.click();
    await wait(180);

    const openAll = Array.from(document.querySelectorAll('.checklistToolbar button'))
      .find(button => /^Open All/i.test(text(button.textContent)));
    openAll?.click();
    await wait(180);

    let updated = 0;
    if (await updateChecklistItem(/GFCI outlets, outlets, switches, and covers/i, {
      status: 'Immediate Concern',
      certainty: 'Clear Path',
      trade: 'Electrical',
      effort: '30 min',
      pace: 'Do now',
      notes: 'Demo finding: the kitchen GFCI did not complete the trip/reset test. Electrician review is the clear next step.',
      thaAction: true,
      actionType: 'Trade consultation'
    })) updated += 1;

    if (await updateChecklistItem(/Sink, faucet, sprayer hose, and visible leaks/i, {
      status: 'Needs Attention',
      certainty: 'Clear Path',
      trade: 'Plumbing',
      effort: '45–60 min',
      pace: 'Do now',
      notes: 'Demo finding: an active drip appeared at the under-sink trap after running water.',
      thaAction: true,
      actionType: 'Schedule service'
    })) updated += 1;

    if (await updateChecklistItem(/Countertop, backsplash, and caulk joints/i, {
      status: 'Monitor',
      certainty: 'Likely Path',
      trade: 'Handyman',
      effort: '1–2 hrs',
      pace: 'Plan soon',
      notes: 'Demo finding: the sink-side caulk is beginning to separate and should be renewed before moisture reaches the joint.',
      thaAction: true,
      actionType: 'Estimate needed'
    })) updated += 1;

    if (await updateChecklistItem(/Range hood \/ exhaust \/ filter/i, {
      status: 'Good',
      certainty: 'Clear Path',
      trade: 'Handyman',
      effort: '30 min',
      notes: 'Demo routine care: operating normally today; retain filter cleaning as a recurring PMCP item.',
      pmcp: true,
      thaAction: false,
      actionType: 'Follow-up observation'
    })) updated += 1;

    await updateRoomOverview();
    await wait(250);

    if (updated < 3) return false;
    setLoadingCopy(triggerButton, 'Opening populated PMR…');
    openPmr(0, triggerButton);
    return true;
  }

  function openPmr(attempt = 0, triggerButton = null) {
    setStartActive(false);
    window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }));

    if (!pmrIsVisible()) pmrNavButton()?.click();

    window.requestAnimationFrame(() => {
      setStartActive(false);
      if (pmrIsVisible()) {
        loading = false;
        restoreTriggerButton(triggerButton);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (attempt < 40) {
        window.setTimeout(() => openPmr(attempt + 1, triggerButton), 100);
        return;
      }

      loading = false;
      setStartActive(true);
      restoreTriggerButton(triggerButton);
      const copy = triggerButton?.querySelector('small');
      if (copy) copy.textContent = 'Demo did not finish loading. Select it again.';
    });
  }

  document.addEventListener('click', event => {
    const triggerButton = event.target.closest('.thaV3588DemoButton');
    if (!triggerButton) return;
    if (loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const title = text(triggerButton.querySelector('strong')?.textContent);
    const sourceButton = demoSourceButton(title);
    if (!sourceButton) return;

    loading = true;
    triggerButton.disabled = true;
    triggerButton.setAttribute('aria-busy', 'true');
    setLoadingCopy(triggerButton, 'Loading demo walkthrough…');

    if (/^Demo 3\b/i.test(title)) {
      buildCurrentMixedDemo(triggerButton).then(success => {
        if (success) return;
        loading = false;
        setStartActive(true);
        restoreTriggerButton(triggerButton);
        const copy = triggerButton.querySelector('small');
        if (copy) copy.textContent = 'Current-build Demo 3 could not be prepared. Select it again.';
      });
      return;
    }

    sourceButton.click();
    window.setTimeout(() => openPmr(0, triggerButton), 0);
  }, true);
})();
