(() => {
  const ID = 'tha-v3578-start-page';
  const SESSIONS = 'tha-walkthrough-sessions';
  const CURRENT = 'tha-current-walkthrough-id';
  const START_VIEW = 'tha-v3578-start-view-open';
  const SETUP_OPEN = 'tha-v3578-start-setup-open';
  const START_MODE = 'tha-v3577-start-mode';
  const DRIVE_UI = 'tha-v3576-drive-ui-state';
  const DRIVE_META = 'tha-drive-meta';
  if (window[ID]) return;
  window[ID] = true;

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
  const dateLabel = value => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }) : text(value);
  };

  function activeSession() {
    const sessions = read(SESSIONS, {});
    const id = localStorage.getItem(CURRENT) || '';
    return id && sessions[id]?.data ? sessions[id] : null;
  }

  function recentSessions() {
    return Object.values(read(SESSIONS, {})).filter(item => item?.data).sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))).slice(0,4);
  }

  function sourceLabel(session) {
    if (!session) return 'No starting source selected';
    const sidecars = read('tha-v357-snapshot-sidecars', {});
    const lineage = object(sidecars[session.id]?.originalSnapshot?.data?.administration?.lineage || session.data?.administration?.lineage);
    if (lineage.mode === 'new-update') return `New update from ${lineage.sourceWalkthroughDate || 'prior Snapshot'}`;
    if (lineage.mode === 'continue-original') return `Continuing ${lineage.sourceWalkthroughDate || 'original walkthrough'}`;
    return { new:'New Snapshot', local:'Local session', snapshot:'Prior Snapshot', drive:'Drive record' }[localStorage.getItem(START_MODE)] || 'Local working session';
  }

  function stats(data = {}) {
    const answers = Object.values(object(data.answers));
    const rooms = Object.values(object(data.roomCapture));
    const reviews = Object.values(object(data.passReview));
    const now = answers.filter(item => text(item?.status) === 'Immediate Concern').length;
    const soon = answers.filter(item => text(item?.status) === 'Needs Attention').length;
    const monitor = answers.filter(item => text(item?.status) === 'Monitor').length;
    const planning = [...answers, ...rooms, ...reviews].filter(item => {
      const actionType = text(item?.thaActionType);
      return Boolean(item?.thaActionItem || item?.workOrderNow || (actionType && actionType !== 'Unknown'));
    }).length;
    const reminders = reviews.filter(item => {
      const status = text(item?.followUpStatus || item?.passFollowUpStatus);
      return Boolean(item?.reminderSet || item?.reminderDate || item?.deferredReminderDate || ['Planned','Scheduled','Deferred'].includes(status));
    }).length;
    const photos = answers.reduce((sum, item) => sum + list(item?.photos).length, 0) + rooms.reduce((sum, item) => sum + list(item?.photos).length, 0);
    return { now, soon, monitor, planning, reminders, photos };
  }

  function readiness() {
    const label = text(document.querySelector('.thaReadinessHeading span')?.textContent);
    const match = label.match(/(\d+)%/);
    return { percent: match ? Number(match[1]) : 0, label: label.replace(/^\d+%\s*[·-]?\s*/, '') || 'Getting started' };
  }

  function driveState() {
    const ui = object(read(DRIVE_UI, {}));
    const meta = object(read(DRIVE_META, {}));
    if (ui.lastSavedAt || meta.lastSaved) return { label:'Drive saved', tone:'saved' };
    if (ui.connectedAt || meta.hasConnected) return { label:'Drive connected', tone:'connected' };
    return { label:'Drive not saved', tone:'neutral' };
  }

  function styles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaStartHub{display:none!important}
      .thaStartPage{margin:0;padding:18px 20px 30px;background:#f5f1e9;min-height:calc(100vh - 74px)}
      .thaStartPageShell{max-width:1180px;margin:0 auto;display:grid;gap:15px}
      .thaStartWelcome{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;border-radius:22px;padding:20px;background:linear-gradient(135deg,#fff,#f7f0e2);border:1px solid #ded7ca;box-shadow:0 8px 24px rgba(31,50,39,.07)}
      .thaStartWelcome h1{margin:0;color:#183f2d;font-size:30px;line-height:1}.thaStartWelcome p{margin:7px 0 0;color:#5b685f;font-size:13px}.thaStartWelcomeBadge{border:1px solid #cfa748;border-radius:999px;background:#fffaf0;color:#765713;padding:7px 11px;font-size:11px;font-weight:950;white-space:nowrap}
      .thaSnapshotHomeCard{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;border-radius:22px;padding:18px 20px;background:linear-gradient(135deg,#173f2c,#275d3c);color:#fff;box-shadow:0 10px 24px rgba(23,63,44,.18)}
      .thaSnapshotHomeCard h2{margin:0;color:#fff;font-size:24px}.thaSnapshotHomeCard p{margin:5px 0 0;color:#e1eadf;font-size:12px}.thaHomeMeta{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}.thaHomeMeta span{border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.08);padding:5px 8px;font-size:10px;font-weight:850}
      .thaReadinessRing{display:grid;place-items:center;width:104px;height:104px;border-radius:50%;background:conic-gradient(#d5a536 var(--tha-readiness),rgba(255,255,255,.18) 0);position:relative}.thaReadinessRing::after{content:'';position:absolute;inset:10px;border-radius:50%;background:#214d35}.thaReadinessRing div{position:relative;z-index:1;text-align:center}.thaReadinessRing strong{display:block;font-size:25px}.thaReadinessRing span{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
      .thaStartDashboardGrid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:15px}.thaStartPanel{border:1px solid #d8ddd5;border-radius:19px;background:#fff;padding:15px;box-shadow:0 6px 18px rgba(31,50,39,.05)}.thaStartPanel h3{margin:0 0 10px;color:#183f2d;font-size:15px}.thaOverviewStats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.thaOverviewStat{border:1px solid #e0e5df;border-radius:13px;background:#fbfcfa;padding:11px;text-align:center}.thaOverviewStat strong{display:block;color:#183f2d;font-size:23px}.thaOverviewStat span{display:block;color:#647068;font-size:10px;font-weight:850;margin-top:2px}
      .thaPriorityStrip{display:grid;grid-template-columns:repeat(3,1fr);overflow:hidden;border-radius:13px}.thaPriorityStrip div{padding:11px;text-align:center;color:#fff}.thaPriorityStrip strong,.thaPriorityStrip span{display:block}.thaPriorityStrip strong{font-size:21px}.thaPriorityStrip span{font-size:10px;font-weight:850}.thaPriorityNow{background:#b83b25}.thaPrioritySoon{background:#d5a536}.thaPriorityMonitor{background:#538b43}
      .thaQuickActions{display:grid;gap:7px}.thaQuickAction{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:1px solid #dce3dc;border-radius:12px;background:#fff;padding:10px 11px;color:#183f2d;text-align:left}.thaQuickAction div{display:grid;gap:2px}.thaQuickAction strong{font-size:12px}.thaQuickAction span{color:#68736b;font-size:10px}.thaQuickAction i{font-style:normal;color:#8b967f}
      .thaStartChoices{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.thaStartChoiceCard{display:grid;gap:7px;border:1px solid #d8ddd5;border-radius:17px;background:#fff;padding:13px}.thaStartChoiceCard h3{margin:0;color:#183f2d;font-size:14px}.thaStartChoiceCard p{margin:0;color:#647068;font-size:10px;line-height:1.4;min-height:42px}.thaStartChoiceCard button{width:100%;justify-content:center}
      .thaRecentHomeSessions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.thaRecentHomeSession{border:1px solid #dde3dd;border-radius:14px;background:#fff;padding:11px}.thaRecentHomeSession strong,.thaRecentHomeSession span{display:block}.thaRecentHomeSession strong{color:#183f2d;font-size:12px}.thaRecentHomeSession span{color:#69736c;font-size:9px;margin-top:3px}.thaRecentHomeSession button{width:100%;margin-top:8px;justify-content:center;font-size:10px;padding:7px}
      .thaStartSetupToggle{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;border:1px solid #cbd7ce;border-radius:15px;background:#eff5ef;color:#183f2d;padding:11px 13px;font-weight:950}.thaStartSetupToggle small{display:block;color:#68736b;font-size:9px;font-weight:750;margin-top:2px}.thaStartSetupToggle div{text-align:left}
      .app.thaStartViewActive>*:not(.topbar):not(.thaStartPage):not(.walkthroughControlsPanel){display:none!important}
      .app.thaStartViewActive>.walkthroughControlsPanel{display:none!important;margin:0 20px 30px!important}
      .app.thaStartViewActive.thaStartSetupOpen>.walkthroughControlsPanel{display:block!important}
      .app:not(.thaStartViewActive)>.thaStartPage,.app:not(.thaStartViewActive)>.walkthroughControlsPanel{display:none!important}
      .thaCompactSnapshotBar{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) auto auto auto;align-items:center;gap:9px;margin:8px 20px;border:1px solid #d7e1da;border-radius:13px;background:#fff;padding:7px 10px;box-shadow:0 4px 12px rgba(31,50,39,.05);min-height:44px}.app.thaStartViewActive>.thaCompactSnapshotBar{display:none!important}.thaCompactIdentity{min-width:0}.thaCompactIdentity strong,.thaCompactIdentity span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.thaCompactIdentity strong{color:#183f2d;font-size:11px}.thaCompactIdentity span{color:#68736b;font-size:9px}.thaCompactStatus{border:1px solid #dce4de;border-radius:999px;background:#f7faf7;color:#506057;padding:5px 8px;font-size:9px;font-weight:900;white-space:nowrap}.thaCompactStatus.saved{border-color:#b9d9ad;background:#f0f8ed;color:#285c30}.thaCompactStatus.attention{border-color:#e5be65;background:#fff7df;color:#765713}.thaCompactOpenStart{border-radius:999px!important;padding:6px 10px!important;font-size:9px!important;white-space:nowrap}
      @media(max-width:980px){.thaStartDashboardGrid{grid-template-columns:1fr}.thaStartChoices,.thaRecentHomeSessions{grid-template-columns:repeat(2,minmax(0,1fr))}.thaOverviewStats{grid-template-columns:repeat(2,minmax(0,1fr))}.thaCompactSnapshotBar{grid-template-columns:minmax(0,1fr) auto auto}.thaCompactVisit{display:none}}
      @media(max-width:650px){.thaStartPage{padding:10px}.thaStartWelcome{align-items:flex-start;flex-direction:column}.thaSnapshotHomeCard{grid-template-columns:1fr auto;padding:15px}.thaReadinessRing{width:82px;height:82px}.thaStartChoices,.thaRecentHomeSessions{grid-template-columns:1fr}.thaCompactSnapshotBar{margin:6px 8px;grid-template-columns:minmax(0,1fr) auto;gap:6px}.thaCompactDrive,.thaCompactAutosave{display:none}.thaCompactOpenStart{padding:6px 8px!important}}
      @media print{.thaStartPage,.thaCompactSnapshotBar{display:none!important}}
    `;
    document.head.append(style);
  }

  function nativeSelect(select, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(select, value); else select.value = value;
    select.dispatchEvent(new Event('input', { bubbles:true }));
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }

  function setStartView(open, setupOpen = false) {
    localStorage.setItem(START_VIEW, String(open));
    localStorage.setItem(SETUP_OPEN, String(setupOpen));
    schedule();
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 40);
  }

  function clickNav(pattern) {
    const button = Array.from(document.querySelectorAll('.topbar nav button')).find(item => pattern.test(text(item.textContent)));
    if (!button) return;
    localStorage.setItem(START_VIEW, 'false');
    localStorage.setItem(SETUP_OPEN, 'false');
    button.click();
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 70);
  }

  function openLocalSession(id, goToHtc = true) {
    const select = Array.from(document.querySelectorAll('select')).find(item => Array.from(item.options || []).some(option => option.value === id) && /saved local sessions/i.test(text(item.closest('label')?.textContent)));
    if (!select) { setStartView(true, true); return; }
    nativeSelect(select, id);
    localStorage.setItem(START_MODE, 'local');
    if (goToHtc) setTimeout(() => clickNav(/HTC/i), 80); else setStartView(true, false);
  }

  function startNew() {
    const button = Array.from(document.querySelectorAll('button')).find(item => /new blank local walkthrough/i.test(text(item.textContent)));
    button?.click();
    localStorage.setItem(START_MODE, 'new');
    setStartView(true, true);
    setTimeout(() => document.querySelector('.walkthroughSetupCard input')?.focus(), 120);
  }

  function chooseSnapshot() {
    setStartView(true, true);
    localStorage.setItem(START_MODE, 'snapshot');
    setTimeout(() => {
      const input = document.querySelector('.snapshotSourceImport input[type="file"]');
      input?.click();
      input?.closest('.thaSnapshotSourcePanel')?.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 100);
  }

  function openDrive() {
    setStartView(true, true);
    localStorage.setItem(START_MODE, 'drive');
    setTimeout(() => {
      const records = document.querySelector('.businessRecordsCard');
      const link = records?.querySelector('a.driveFolderLink');
      if (link) link.click();
      else Array.from(records?.querySelectorAll('button') || []).find(item => /connect google drive/i.test(text(item.textContent)))?.click();
      records?.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 100);
  }

  function bindTopNavigation(topbar) {
    let startButton = topbar.querySelector('.thaStartNavButton');
    if (startButton && !startButton.dataset.thaV3578) {
      const replacement = startButton.cloneNode(true);
      replacement.dataset.thaV3578 = 'true';
      replacement.textContent = '⌂ Start';
      replacement.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); setStartView(true, false); });
      startButton.replaceWith(replacement);
      startButton = replacement;
    }
    if (!startButton) {
      startButton = document.createElement('button');
      startButton.type = 'button';
      startButton.className = 'thaStartNavButton';
      startButton.dataset.thaV3578 = 'true';
      startButton.textContent = '⌂ Start';
      startButton.addEventListener('click', () => setStartView(true, false));
      topbar.querySelector('nav')?.prepend(startButton);
    }
    Array.from(topbar.querySelectorAll('nav button')).filter(button => button !== startButton).forEach(button => {
      if (button.dataset.thaV3578ViewBound) return;
      button.dataset.thaV3578ViewBound = 'true';
      button.addEventListener('click', () => {
        localStorage.setItem(START_VIEW, 'false');
        localStorage.setItem(SETUP_OPEN, 'false');
        setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 70);
      }, true);
    });
  }

  function ensureElements(app, topbar) {
    let page = app.querySelector(':scope > .thaStartPage');
    if (!page) {
      page = document.createElement('main');
      page.className = 'thaStartPage noPrint';
      topbar.after(page);
    }
    let compact = app.querySelector(':scope > .thaCompactSnapshotBar');
    if (!compact) {
      compact = document.createElement('section');
      compact.className = 'thaCompactSnapshotBar noPrint';
      page.after(compact);
    }
    return { page, compact };
  }

  function renderPage(page, session) {
    const data = object(session?.data);
    const client = object(data.client);
    const values = stats(data);
    const ready = readiness();
    const drive = driveState();
    const recent = recentSessions();
    const setupOpen = localStorage.getItem(SETUP_OPEN) === 'true';
    const address = text(client.address) || 'Property address not entered';
    const clientName = text(client.name) || 'Client not entered';
    const visit = text(client.date) || 'Visit date not entered';
    const sessionName = text(data.walkthroughName || session?.name) || 'No working session selected';
    const signature = JSON.stringify({ id:session?.id, updated:session?.updatedAt, ready, values, drive, setupOpen, recent:recent.map(item => `${item.id}:${item.updatedAt}`) });
    if (page.dataset.signature === signature) return;
    page.dataset.signature = signature;
    page.innerHTML = `<div class="thaStartPageShell">
      <section class="thaStartWelcome"><div><h1>Let’s get started</h1><p>Start, continue, restore, or manage the active THA Snapshot from one dedicated home page.</p></div><span class="thaStartWelcomeBadge">THA Snapshot Home</span></section>
      <section class="thaSnapshotHomeCard"><div><h2>${esc(address)}</h2><p>${esc(clientName)} · ${esc(visit)}</p><div class="thaHomeMeta"><span>${esc(sessionName)}</span><span>${esc(sourceLabel(session))}</span><span>${session ? `Autosaved ${esc(dateLabel(session.updatedAt))}` : 'No active local session'}</span><span>${esc(drive.label)}</span></div></div><div class="thaReadinessRing" style="--tha-readiness:${Math.max(0,Math.min(100,ready.percent)) * 3.6}deg"><div><strong>${ready.percent}%</strong><span>Snapshot readiness</span></div></div></section>
      <div class="thaStartDashboardGrid"><section class="thaStartPanel"><h3>Overview</h3><div class="thaOverviewStats"><div class="thaOverviewStat"><strong>${values.now + values.soon + values.monitor}</strong><span>PMR findings</span></div><div class="thaOverviewStat"><strong>${values.planning}</strong><span>Active planning</span></div><div class="thaOverviewStat"><strong>${values.reminders}</strong><span>PMCP reminders</span></div><div class="thaOverviewStat"><strong>${values.photos}</strong><span>Photos</span></div></div><h3 style="margin-top:13px">Priority at a glance</h3><div class="thaPriorityStrip"><div class="thaPriorityNow"><strong>${values.now}</strong><span>Now</span></div><div class="thaPrioritySoon"><strong>${values.soon}</strong><span>Soon</span></div><div class="thaPriorityMonitor"><strong>${values.monitor}</strong><span>Monitor</span></div></div></section>
      <section class="thaStartPanel"><h3>Quick actions</h3><div class="thaQuickActions"><button class="thaQuickAction" data-quick="continue"><div><strong>Continue Walkthrough</strong><span>Open the Handy-Triage Checklist</span></div><i>›</i></button><button class="thaQuickAction" data-quick="actions"><div><strong>Review Action Center</strong><span>Needs attention, active planning, reminders, and follow-up</span></div><i>›</i></button><button class="thaQuickAction" data-quick="note"><div><strong>Add Note or Photo</strong><span>Return directly to room-level field capture</span></div><i>›</i></button><button class="thaQuickAction" data-quick="pmcp"><div><strong>Manage PMCP</strong><span>Preventive care and future reminders</span></div><i>›</i></button></div></section></div>
      <section class="thaStartPanel"><h3>Start or continue</h3><div class="thaStartChoices"><article class="thaStartChoiceCard"><h3>Start a New Snapshot</h3><p>Create a blank working record and enter the new property identity.</p><button data-start="new">Start New</button></article><article class="thaStartChoiceCard"><h3>Continue on This Device</h3><p>Open the most recently autosaved local walkthrough.</p><button data-start="local" ${recent.length ? '' : 'disabled'}>Continue Local</button></article><article class="thaStartChoiceCard"><h3>Start From a Prior Snapshot</h3><p>Continue the same visit or create a protected new dated update.</p><button data-start="snapshot">Choose Snapshot</button></article><article class="thaStartChoiceCard"><h3>Open From Google Drive</h3><p>Connect Drive or open the latest property package.</p><button data-start="drive">Drive Records</button></article></div></section>
      ${recent.length ? `<section class="thaStartPanel"><h3>Recent local walkthroughs</h3><div class="thaRecentHomeSessions">${recent.map(item => { const c = object(item.data?.client); return `<article class="thaRecentHomeSession"><strong>${esc(c.address || c.name || item.name || 'Untitled walkthrough')}</strong><span>${esc(c.name || 'Client pending')}</span><span>${esc(c.date || 'Visit date pending')} · ${esc(dateLabel(item.updatedAt))}</span><button data-session="${esc(item.id)}">Continue Walkthrough</button></article>`; }).join('')}</div></section>` : ''}
      <button class="thaStartSetupToggle" data-setup-toggle><div><strong>${setupOpen ? 'Hide' : 'Open'} Snapshot Setup & Records</strong><small>Client identity, local-session management, Intake import, Snapshot restore, Drive, backup, readiness details, and Action Center.</small></div><span>${setupOpen ? '⌃' : '⌄'}</span></button>
    </div>`;
    page.querySelector('[data-quick="continue"]')?.addEventListener('click', () => clickNav(/HTC/i));
    page.querySelector('[data-quick="note"]')?.addEventListener('click', () => clickNav(/HTC/i));
    page.querySelector('[data-quick="pmcp"]')?.addEventListener('click', () => clickNav(/PASS/i));
    page.querySelector('[data-quick="actions"]')?.addEventListener('click', () => {
      setStartView(true, true);
      setTimeout(() => document.querySelector('.thaActionCenter')?.scrollIntoView({ behavior:'smooth', block:'center' }), 100);
    });
    page.querySelector('[data-start="new"]')?.addEventListener('click', startNew);
    page.querySelector('[data-start="local"]')?.addEventListener('click', () => recent[0] && openLocalSession(recent[0].id));
    page.querySelector('[data-start="snapshot"]')?.addEventListener('click', chooseSnapshot);
    page.querySelector('[data-start="drive"]')?.addEventListener('click', openDrive);
    page.querySelectorAll('[data-session]').forEach(button => button.addEventListener('click', () => openLocalSession(button.dataset.session)));
    page.querySelector('[data-setup-toggle]')?.addEventListener('click', () => setStartView(true, !setupOpen));
  }

  function renderCompact(compact, session) {
    const data = object(session?.data);
    const client = object(data.client);
    const ready = readiness();
    const drive = driveState();
    const signature = JSON.stringify({ id:session?.id, updated:session?.updatedAt, ready, drive, client });
    if (compact.dataset.signature === signature) return;
    compact.dataset.signature = signature;
    compact.innerHTML = `<div class="thaCompactIdentity"><strong>${esc(text(client.address) || 'No active property')}</strong><span>${esc(text(client.name) || 'Client pending')} · ${esc(text(client.date) || 'Visit date pending')}</span></div><div class="thaCompactIdentity thaCompactVisit"><strong>${esc(text(data.walkthroughName || session?.name) || 'Working session')}</strong><span>${esc(sourceLabel(session))}</span></div><span class="thaCompactStatus thaCompactAutosave ${session ? 'saved' : 'attention'}">${session ? 'Autosaved ✓' : 'No session'}</span><span class="thaCompactStatus ${ready.percent >= 75 ? 'saved' : 'attention'}">Readiness ${ready.percent}%</span><span class="thaCompactStatus thaCompactDrive ${drive.tone === 'saved' ? 'saved' : ''}">${esc(drive.label)}</span><button class="thaCompactOpenStart">Start / Details</button>`;
    compact.querySelector('.thaCompactOpenStart')?.addEventListener('click', () => setStartView(true, false));
  }

  function run() {
    styles();
    const app = document.querySelector('.app');
    const topbar = app?.querySelector(':scope > .topbar');
    const controls = app?.querySelector(':scope > .walkthroughControlsPanel');
    if (!app || !topbar || !controls) return;
    bindTopNavigation(topbar);
    const { page, compact } = ensureElements(app, topbar);
    const startOpenPreference = localStorage.getItem(START_VIEW);
    const startOpen = startOpenPreference === null ? true : startOpenPreference === 'true';
    const setupOpen = localStorage.getItem(SETUP_OPEN) === 'true';
    app.classList.toggle('thaStartViewActive', startOpen);
    app.classList.toggle('thaStartSetupOpen', startOpen && setupOpen);
    const startButton = topbar.querySelector('.thaStartNavButton');
    startButton?.classList.toggle('on', startOpen);
    renderPage(page, activeSession());
    renderCompact(compact, activeSession());
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
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','disabled','value','checked','open'] });
})();