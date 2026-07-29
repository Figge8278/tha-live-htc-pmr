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
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
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
      { label:'Electrical panel / fuse box', ready:acknowledged(required.electricalPanel?.value || intake.electricalPanel, required.electricalPanel?.status) },
      { label:'Main water shutoff', ready:acknowledged(required.waterShutoff?.value || intake.waterShutoff, required.waterShutoff?.status) },
      { label:'Gas service / shutoff', ready:acknowledged(required.gasService?.value || intake.gasService || intake.gasShutoff, required.gasService?.status) }
    ];
    const referenceCount = references.filter(item => item.ready).length;

    let score = identityCount * 5;
    score += referenceCount * 5;
    const decisionScore = unresolved.length ? Math.max(0, 15 - unresolved.length * 5) : 15;
    score += decisionScore;

    const noteCount = findings.filter(answer => text(answer.notes)).length;
    const contentScore = findings.length
      ? 10 + Math.round((noteCount / findings.length) * 15)
      : Math.round(Math.min(1, rooms.length / 4) * 25);
    score += contentScore;

    const clearCount = findings.filter(answer => {
      const trade = text(answer.trade);
      return trade && trade !== 'Review / Assign Later' && text(answer.actionCertainty);
    }).length;
    const actionScore = findings.length
      ? Math.round((clearCount / findings.length) * 15)
      : (rooms.length >= 4 ? 15 : Math.round((rooms.length / 4) * 15));
    score += actionScore;

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
    const checks = [
      { label:'Property and visit identified', ready:identityCount === 3, detail:`${identityCount}/3 recorded` },
      { label:'Need-to-know home references', ready:referenceCount === 3, detail:`${referenceCount}/3 acknowledged` },
      { label:'Recorded items have PMR decisions', ready:unresolved.length === 0, detail:unresolved.length ? `${unresolved.length} item${unresolved.length === 1 ? '' : 's'} unresolved` : 'No unresolved recorded items' },
      { label:findings.length ? 'Client-facing finding notes' : 'Zero-finding room/area basis', ready:contentScore >= 20, detail:findings.length ? `${noteCount}/${findings.length} findings have notes` : `${rooms.length} meaningful room/area overview${rooms.length === 1 ? '' : 's'}` },
      { label:'Priority, resource, and action clarity', ready:actionScore >= 13, detail:findings.length ? `${clearCount}/${findings.length} findings prepared` : 'Uses room/area review when there are no findings' },
      { label:'PMCP and active-planning timing', ready:careScore >= 8, detail:planning.length ? `${timedPlanning.length}/${planning.length} active-planning items timed` : 'No untimed active-planning item' },
      { label:'Supporting photos', ready:photoCount > 0, detail:photoCount ? `${photoCount} connected photo${photoCount === 1 ? '' : 's'}` : 'Optional supporting depth' }
    ];
    return { score, label, checks };
  }

  function styles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaCompactSnapshotBar .thaCompactReadiness{display:none!important}
      .thaPmrReadiness{margin:12px 0 16px;border:1px solid #d8e2dc;border-radius:16px;background:#fff;padding:12px 14px;box-shadow:0 5px 15px rgba(31,50,39,.05)}
      .thaPmrReadinessTop{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px}.thaPmrReadinessTop strong{display:block;color:#183f2d;font-size:14px}.thaPmrReadinessTop span{color:#4f6157;font-size:11px;font-weight:900;text-align:right}
      .thaPmrReadinessTrack{position:relative;height:12px;margin-top:8px;border:1px solid #cedbd2;border-radius:999px;background:#edf2ee;overflow:hidden}.thaPmrReadinessTrack i{position:absolute;inset-block:0;display:block}.thaPmrReadinessCore{left:0;background:#287bb7}.thaPmrReadinessDepth{left:75%;background:#79bd6e}.thaPmrReadinessTrack::after{content:'';position:absolute;inset-block:0;left:75%;width:2px;background:#183f2d;opacity:.7}
      .thaPmrReadinessMeta{display:flex;justify-content:space-between;gap:10px;margin-top:5px;color:#6a776f;font-size:9px;font-weight:850}.thaPmrReadiness details{margin-top:8px}.thaPmrReadiness summary{cursor:pointer;color:#245f8a;font-size:10px;font-weight:950}.thaPmrReadinessChecks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px}.thaPmrReadinessCheck{border:1px solid #e0e7e2;border-radius:10px;background:#fbfcfb;padding:7px 9px;color:#68756d;font-size:9px}.thaPmrReadinessCheck strong{display:block;color:#183f2d;font-size:10px}.thaPmrReadinessCheck.ready{border-color:#b9d9ad;background:#f3f9f1}
      @media(max-width:720px){.thaPmrReadinessChecks{grid-template-columns:1fr}.thaPmrReadinessTop{grid-template-columns:1fr}.thaPmrReadinessTop span{text-align:left}}
      @media print{.thaPmrReadiness{display:none!important}}
    `;
    document.head.append(style);
  }

  function simplifyCompactBar() {
    document.querySelectorAll('.thaCompactSnapshotBar .thaCompactStatus').forEach(item => {
      if (/^Readiness\s+\d+%/i.test(text(item.textContent))) {
        item.classList.add('thaCompactReadiness');
        item.hidden = true;
      }
    });
  }

  function render() {
    styles();
    simplifyCompactBar();
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    const header = pmr.querySelector(':scope > .pmrHeader');
    if (!header) return;
    let panel = pmr.querySelector(':scope > .thaPmrReadiness');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'thaPmrReadiness noPrint';
      header.after(panel);
    }
    const state = pmrState(activeSession());
    const signature = JSON.stringify(state);
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature;
    const coreWidth = Math.min(75, state.score);
    const depthWidth = Math.max(0, state.score - 75);
    panel.innerHTML = `<div class="thaPmrReadinessTop"><div><strong>PMR Readiness</strong><span>${esc(state.label)}</span></div><span>${state.score}%</span></div><div class="thaPmrReadinessTrack"><i class="thaPmrReadinessCore" style="width:${coreWidth}%"></i><i class="thaPmrReadinessDepth" style="width:${depthWidth}%"></i></div><div class="thaPmrReadinessMeta"><span>Report foundation</span><span>75% ready-for-review marker</span><span>Supporting depth</span></div><details><summary>See what is supporting this PMR</summary><div class="thaPmrReadinessChecks">${state.checks.map(item => `<div class="thaPmrReadinessCheck ${item.ready ? 'ready' : ''}"><strong>${item.ready ? '✓' : '○'} ${esc(item.label)}</strong>${esc(item.detail)}</div>`).join('')}</div></details>`;
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
  setInterval(schedule, 2500);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','hidden','value','checked'] });
})();