(() => {
  const ID = 'tha-v35712-start-streamline';
  const SESSIONS = 'tha-walkthrough-sessions';
  const CURRENT = 'tha-current-walkthrough-id';
  const START_VIEW = 'tha-v3578-start-view-open';
  const SETUP_OPEN = 'tha-v3578-start-setup-open';
  const START_MODE = 'tha-v3577-start-mode';
  if (window[ID]) return;
  window[ID] = true;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const dateLabel = value => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime())
      ? date.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' })
      : text(value);
  };

  function sessions() {
    return Object.values(read(SESSIONS, {}))
      .filter(item => item?.data)
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, 12);
  }

  function driveConnected() {
    const ui = read('tha-v3576-drive-ui-state', {});
    const meta = read('tha-drive-meta', {});
    return Boolean(ui.connectedAt || ui.lastSavedAt || meta.hasConnected || meta.lastSaved);
  }

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaStartPage .thaStartDashboardGrid{display:none!important}
      .thaStartPageShell{max-width:1040px!important;gap:13px!important}
      .thaStartWelcome{padding:16px 18px!important}
      .thaStartWelcome h1{font-size:27px!important}
      .thaSnapshotHomeCard{padding:15px 18px!important}
      .thaStartingPointPanel{padding:16px!important}
      .thaStartingPointPanel>h3{font-size:18px!important;margin-bottom:12px!important}
      .thaStartingPointPanel>.thaStartPrompt{margin:-6px 0 13px;color:#647068;font-size:11px;line-height:1.4}
      .thaStartingPointPanel .thaStartChoices{grid-template-columns:repeat(3,minmax(0,1fr))!important;align-items:stretch!important}
      .thaStartingPointPanel .thaStartChoiceCard{display:flex!important;flex-direction:column!important;gap:8px!important;padding:14px!important;min-width:0!important}
      .thaStartingPointPanel .thaStartChoiceCard p{min-height:0!important;flex:1}
      .thaStartingPointPanel .thaStartChoiceCard button{margin-top:auto}
      .thaLocalStartControls{display:grid;gap:7px;margin-top:3px}
      .thaLocalStartControls label{display:grid;gap:4px;color:#183f2d;font-size:10px;font-weight:900}
      .thaLocalStartControls select{width:100%;min-width:0;padding:8px 9px;border:1px solid #cbd7ce;border-radius:10px;background:#fff;color:#20372a;font-size:10px}
      .thaLocalStartMeta{color:#6b756e;font-size:9px;line-height:1.35}
      .thaPriorSourceButtons{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:3px}
      .thaPriorSourceButtons button{min-width:0;white-space:normal;line-height:1.2}
      .thaPriorSourceNote{margin-top:2px;border-left:3px solid #cfa748;border-radius:7px;background:#fff8e9;padding:7px 8px;color:#6f5b27;font-size:9px;line-height:1.4}
      .thaStartSetupToggle{margin-top:0!important}
      .app.thaStartViewActive.thaStartSetupOpen>.walkthroughControlsPanel{margin:0 auto 30px!important;width:min(calc(100% - 40px),1040px)!important}
      @media(max-width:900px){
        .thaStartingPointPanel .thaStartChoices{grid-template-columns:1fr!important}
        .thaPriorSourceButtons{grid-template-columns:1fr 1fr}
      }
      @media(max-width:560px){
        .thaPriorSourceButtons{grid-template-columns:1fr}
        .app.thaStartViewActive.thaStartSetupOpen>.walkthroughControlsPanel{width:calc(100% - 20px)!important}
      }
    `;
    document.head.append(style);
  }

  function nativeSelect(select, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(select, value); else select.value = value;
    select.dispatchEvent(new Event('input', { bubbles:true }));
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }

  function continueLocal(id) {
    if (!id) return;
    const source = Array.from(document.querySelectorAll('select')).find(select =>
      Array.from(select.options || []).some(option => option.value === id) &&
      /saved local sessions/i.test(text(select.closest('label')?.textContent))
    );
    if (!source) {
      localStorage.setItem(START_VIEW, 'true');
      localStorage.setItem(SETUP_OPEN, 'true');
      schedule();
      return;
    }
    nativeSelect(source, id);
    localStorage.setItem(CURRENT, id);
    localStorage.setItem(START_MODE, 'local');
    localStorage.setItem(START_VIEW, 'false');
    localStorage.setItem(SETUP_OPEN, 'false');
    setTimeout(() => {
      const htc = Array.from(document.querySelectorAll('.topbar nav button')).find(button => /^HTC$/i.test(text(button.textContent)) || /HTC/i.test(text(button.textContent)));
      htc?.click();
      window.scrollTo({ top:0, behavior:'smooth' });
    }, 100);
  }

  function forcePageOrder(app, page, compact, controls) {
    if (page.parentElement !== app || controls.parentElement !== app) return;
    app.insertBefore(page, controls);
    if (compact?.parentElement === app) app.insertBefore(compact, controls);
  }

  function streamline(page, app, controls, compact) {
    const shell = page.querySelector('.thaStartPageShell');
    if (!shell) return;
    forcePageOrder(app, page, compact, controls);

    const welcome = page.querySelector('.thaStartWelcome');
    if (welcome) {
      const heading = welcome.querySelector('h1');
      const copy = welcome.querySelector('p');
      if (heading) heading.textContent = 'Let’s get started';
      if (copy) copy.textContent = 'Choose the source for this visit. Setup and record tools stay available underneath when needed.';
    }

    const dashboard = page.querySelector('.thaStartDashboardGrid');
    dashboard?.remove();

    const startPanel = Array.from(page.querySelectorAll('.thaStartPanel')).find(panel => /start or continue|choose how/i.test(text(panel.querySelector(':scope > h3')?.textContent)));
    if (!startPanel) return;
    startPanel.classList.add('thaStartingPointPanel');
    const title = startPanel.querySelector(':scope > h3');
    if (title) title.textContent = 'Choose how to begin';
    let prompt = startPanel.querySelector(':scope > .thaStartPrompt');
    if (!prompt) {
      prompt = document.createElement('p');
      prompt.className = 'thaStartPrompt';
      title?.after(prompt);
    }
    prompt.textContent = 'Start blank, reopen local work, or use an earlier Snapshot as the source for this visit.';

    const cards = Array.from(startPanel.querySelectorAll('.thaStartChoiceCard'));
    const newCard = cards.find(card => /new snapshot/i.test(text(card.querySelector('h3')?.textContent)));
    const localCard = cards.find(card => /this device/i.test(text(card.querySelector('h3')?.textContent)));
    const priorCard = cards.find(card => /prior snapshot/i.test(text(card.querySelector('h3')?.textContent)));
    const driveCard = cards.find(card => /google drive/i.test(text(card.querySelector('h3')?.textContent)));

    if (newCard) {
      newCard.querySelector('h3').textContent = 'Start a New Snapshot';
      const copy = newCard.querySelector('p');
      if (copy) copy.textContent = 'Create a blank record for a new property or a new walkthrough.';
      const button = newCard.querySelector('button');
      if (button) button.textContent = 'Start Blank Snapshot';
    }

    if (localCard) {
      localCard.querySelector('h3').textContent = 'Continue on This Device';
      const copy = localCard.querySelector('p');
      if (copy) copy.textContent = 'Choose an autosaved walkthrough stored in this tablet or browser.';
      const oldButton = localCard.querySelector(':scope > button');
      oldButton?.remove();
      let controlsHost = localCard.querySelector('.thaLocalStartControls');
      if (!controlsHost) {
        controlsHost = document.createElement('div');
        controlsHost.className = 'thaLocalStartControls';
        localCard.append(controlsHost);
      }
      const recent = sessions();
      const activeId = localStorage.getItem(CURRENT) || recent[0]?.id || '';
      controlsHost.innerHTML = `<label>Saved local walkthrough<select data-local-session ${recent.length ? '' : 'disabled'}>${recent.length ? recent.map(item => { const client = item.data?.client || {}; const label = client.address || client.name || item.name || 'Untitled walkthrough'; return `<option value="${esc(item.id)}" ${item.id === activeId ? 'selected' : ''}>${esc(label)} · ${esc(client.date || dateLabel(item.updatedAt))}</option>`; }).join('') : '<option>No local walkthroughs saved</option>'}</select></label><div class="thaLocalStartMeta">Local sessions are autosaved on this device and are not the formal Drive record.</div><button type="button" data-continue-local ${recent.length ? '' : 'disabled'}>Continue Selected</button>`;
      controlsHost.querySelector('[data-continue-local]')?.addEventListener('click', () => continueLocal(controlsHost.querySelector('[data-local-session]')?.value));
    }

    if (priorCard) {
      priorCard.querySelector('h3').textContent = 'Continue from a Prior Snapshot';
      const copy = priorCard.querySelector('p');
      if (copy) copy.textContent = 'Load an earlier Snapshot, then choose whether to continue that visit or create a protected new dated update.';
      const snapshotButton = priorCard.querySelector(':scope > button,[data-start="snapshot"]');
      if (snapshotButton) snapshotButton.textContent = 'Choose Snapshot File';
      let buttonHost = priorCard.querySelector('.thaPriorSourceButtons');
      if (!buttonHost) {
        buttonHost = document.createElement('div');
        buttonHost.className = 'thaPriorSourceButtons';
        priorCard.append(buttonHost);
      }
      if (snapshotButton && snapshotButton.parentElement !== buttonHost) buttonHost.append(snapshotButton);
      const driveButton = driveCard?.querySelector('button');
      if (driveButton) {
        driveButton.textContent = driveConnected() ? 'Open Drive Records' : 'Connect Google Drive';
        buttonHost.append(driveButton);
      }
      let note = priorCard.querySelector('.thaPriorSourceNote');
      if (!note) {
        note = document.createElement('div');
        note.className = 'thaPriorSourceNote';
        priorCard.append(note);
      }
      note.textContent = 'Drive currently opens the saved property package. Select its Snapshot JSON to bring that earlier record into the next walkthrough.';
    }
    driveCard?.remove();

    const recentPanel = Array.from(page.querySelectorAll('.thaStartPanel')).find(panel => /recent local walkthroughs/i.test(text(panel.querySelector(':scope > h3')?.textContent)));
    recentPanel?.remove();

    const choices = startPanel.querySelector('.thaStartChoices');
    if (choices) [newCard, localCard, priorCard].filter(Boolean).forEach(card => choices.append(card));

    const toggle = page.querySelector('[data-setup-toggle]');
    if (toggle) {
      const strong = toggle.querySelector('strong');
      const small = toggle.querySelector('small');
      const isOpen = app.classList.contains('thaStartSetupOpen');
      if (strong) strong.textContent = `${isOpen ? 'Hide' : 'Open'} Setup & Record Tools`;
      if (small) small.textContent = 'Client details, Intake import, local management, Snapshot restore, Drive records, backup, and troubleshooting.';
      startPanel.after(toggle);
      if (!toggle.dataset.thaV35712Scroll) {
        toggle.dataset.thaV35712Scroll = 'true';
        toggle.addEventListener('click', () => setTimeout(() => {
          if (localStorage.getItem(SETUP_OPEN) === 'true') controls.scrollIntoView({ behavior:'smooth', block:'start' });
        }, 180));
      }
    }
  }

  function run() {
    installStyles();
    const app = document.querySelector('.app');
    const page = app?.querySelector(':scope > .thaStartPage');
    const compact = app?.querySelector(':scope > .thaCompactSnapshotBar');
    const controls = app?.querySelector(':scope > .walkthroughControlsPanel');
    if (!app || !page || !controls) return;
    streamline(page, app, controls, compact);
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
  setInterval(schedule, 2500);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','disabled','value','open'] });
})();