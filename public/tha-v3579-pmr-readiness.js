(() => {
  const ID = 'tha-v3579-pmr-readiness';
  const SESSIONS = 'tha-walkthrough-sessions';
  const CURRENT = 'tha-current-walkthrough-id';
  if (window[ID]) return;
  window[ID] = true;

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const list = value => Array.isArray(value) ? value : [];
  const PMR_STATUSES = new Set(['Immediate Concern', 'Needs Attention', 'Monitor']);

  function activeSession() {
    const sessions = read(SESSIONS, {});
    const id = localStorage.getItem(CURRENT) || '';
    return id && sessions[id]?.data ? sessions[id] : null;
  }

  function acknowledged(value = '', status = '') {
    return Boolean(text(value) || /not applicable|no gas|unable to locate|needs follow-up|acknowledged|recorded/i.test(text(status)));
  }

  function meaningfulRoom(capture = {}) {
    return Boolean(
      (text(capture.status) && text(capture.status) !== 'Unknown') ||
      text(capture.note) || list(capture.photos).length || list(capture.items).length ||
      capture.thaActionItem || capture.addToPmcpBuilder
    );
  }

  function pmrState(session) {
    const data = object(session?.data);
    const client = object(data.client);
    const intake = object(data.intake);
    const administration = object(data.administration);
    const required = object(administration.requiredHomeReferences);
    const answers = Object.values(object(data.answers));
    const rooms = Object.values(object(data.roomCapture)).filter(meaningfulRoom);
    const reviews = Object.values(object(data.passReview));
    const findings = answers.filter(answer => PMR_STATUSES.has(text(answer?.status)));
    const unresolved = answers.filter(answer => {
      const hasEvidence = text(answer?.notes) || list(answer?.photos).length;
      return hasEvidence && ['Unknown', 'Not Checked', ''].includes(text(answer?.status));
    });

    const identityCount = [client.name, client.address, client.date].filter(value => text(value)).length;
    const references = [
      acknowledged(required.electricalPanel?.value || intake.electricalPanel, required.electricalPanel?.status),
      acknowledged(required.waterShutoff?.value || intake.waterShutoff, required.waterShutoff?.status),
      acknowledged(required.gasService?.value || intake.gasService || intake.gasShutoff, required.gasService?.status)
    ];
    const referenceCount = references.filter(Boolean).length;

    let score = identityCount * 5;
    score += referenceCount * 5;
    score += unresolved.length ? Math.max(0, 15 - unresolved.length * 5) : 15;

    const noteCount = findings.filter(answer => text(answer.notes)).length;
    const contentScore = findings.length
      ? 10 + Math.round((noteCount / findings.length) * 15)
      : Math.round(Math.min(1, rooms.length / 4) * 25);
    score += contentScore;

    const clearCount = findings.filter(answer => {
      const trade = text(answer.trade);
      return trade && trade !== 'Review / Assign Later' && text(answer.actionCertainty);
    }).length;
    score += findings.length
      ? Math.round((clearCount / findings.length) * 15)
      : (rooms.length >= 4 ? 15 : Math.round((rooms.length / 4) * 15));

    const planning = reviews.filter(review => review.thaActionItem || (text(review.thaActionType) && text(review.thaActionType) !== 'Unknown'));
    const reviewedCare = reviews.filter(review => ['selected', 'declined'].includes(text(review.pmcpDecision)));
    const timedPlanning = planning.filter(review => text(review.targetWindow || review.nextSuggestedWindow || review.reminderDate || review.deferredReminderDate));
    let careScore = reviews.length ? Math.min(6, reviewedCare.length * 2) : 3;
    if (!planning.length || timedPlanning.length === planning.length) careScore += 4;
    score += Math.min(10, careScore);

    const photoCount = answers.reduce((sum, answer) => sum + list(answer?.photos).length, 0) + rooms.reduce((sum, room) => sum + list(room?.photos).length, 0);
    if (photoCount) score += 5;
    score = Math.max(0, Math.min(100, score));

    const label = score >= 90 ? 'Well supported and ready for delivery' : score >= 75 ? 'Ready for review' : score >= 60 ? 'A few report decisions remain' : 'Building the report';
    return { score, label };
  }

  function styles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaPmrReadiness{display:none!important}
      .thaV358CompactBar{grid-template-columns:minmax(0,1fr) auto auto auto auto!important}
      .thaV358CompactPmrReadiness{display:grid;grid-template-columns:auto;gap:3px;width:108px;min-width:108px;border:1px solid #cbd9e0;border-radius:10px;background:#f5fafc;padding:5px 7px;color:#174d70;line-height:1}
      .thaV358CompactPmrReadiness strong{display:flex;justify-content:space-between;gap:5px;font-size:8px;font-weight:950;white-space:nowrap}.thaV358CompactPmrReadiness strong b{font-size:9px}.thaV358CompactPmrTrack{height:3px;border-radius:999px;background:#dfe8ec;overflow:hidden}.thaV358CompactPmrTrack i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#287bb7 0 75%,#79bd6e 75% 100%)}
      @media(max-width:900px){.thaV358CompactBar{grid-template-columns:minmax(0,1fr) auto auto!important}.thaV358CompactPmrReadiness{width:92px;min-width:92px}.thaV358CompactPmrReadiness strong span{display:none}}
      @media(max-width:520px){.thaV358CompactPmrReadiness{width:70px;min-width:70px;padding:5px}.thaV358CompactPmrReadiness strong{justify-content:center}.thaV358CompactPmrReadiness strong span{display:none}}
      @media print{.thaV358CompactPmrReadiness{display:none!important}}
    `;
    document.head.append(style);
  }

  function render() {
    styles();
    document.querySelectorAll('.thaPmrReadiness').forEach(panel => panel.remove());
    const bar = document.querySelector('.thaV358CompactBar');
    if (!bar) return;
    let compact = bar.querySelector('.thaV358CompactPmrReadiness');
    if (!compact) {
      compact = document.createElement('div');
      compact.className = 'thaV358CompactPmrReadiness';
      compact.innerHTML = '<strong><span>PMR readiness</span><b>0%</b></strong><span class="thaV358CompactPmrTrack"><i></i></span>';
      const start = bar.querySelector('.thaV358CompactStart');
      if (start) bar.insertBefore(compact, start); else bar.append(compact);
    }
    const state = pmrState(activeSession());
    compact.querySelector('b').textContent = `${state.score}%`;
    compact.querySelector('i').style.width = `${state.score}%`;
    compact.title = `PMR readiness: ${state.score}% — ${state.label}`;
    compact.setAttribute('aria-label', compact.title);
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; render(); });
  }
  schedule();
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setInterval(schedule, 2200);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','hidden','value','checked'] });
})();
