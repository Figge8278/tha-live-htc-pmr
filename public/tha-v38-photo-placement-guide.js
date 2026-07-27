(() => {
  const STYLE_ID = 'tha-v38-photo-placement-guide-styles';
  const GUIDE_CLASS = 'tha-v38-photo-placement-guide';
  const ROOM_CUE_CLASS = 'tha-v38-room-photo-cue';
  const ITEM_CUE_CLASS = 'tha-v38-item-photo-cue';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${GUIDE_CLASS}{border:1px solid #d8e4ea;border-left:5px solid #315568;border-radius:16px;background:#fbfdfe;margin:10px 0 14px;padding:0;color:#203040;box-shadow:0 6px 14px rgba(13,44,73,.06)}
      .${GUIDE_CLASS} summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;font-weight:950;color:#0b3658;list-style:none}
      .${GUIDE_CLASS} summary::-webkit-details-marker{display:none}
      .${GUIDE_CLASS} summary span{display:inline-flex;border:1px solid #d8e4ea;border-radius:999px;background:#fff;color:#60717c;padding:4px 8px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:950}
      .${GUIDE_CLASS} .photoGuideBody{border-top:1px solid #e2e8ed;padding:12px 14px;display:grid;gap:10px}
      .${GUIDE_CLASS} .photoGuideGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}
      .${GUIDE_CLASS} .photoGuideTile{border:1px solid #d8e4ea;border-radius:14px;background:#fff;padding:10px 12px}
      .${GUIDE_CLASS} .photoGuideTile strong{display:block;color:#0b3658;margin-bottom:3px}
      .${GUIDE_CLASS} .photoGuideTile p,.${GUIDE_CLASS} p{margin:0;color:#40505f;font-size:13px;line-height:1.35}
      .${ROOM_CUE_CLASS},.${ITEM_CUE_CLASS}{display:block;grid-column:1/-1;border-radius:13px;padding:8px 10px;margin:7px 0 4px;font-size:12px;line-height:1.35;color:#40505f;border:1px solid #d8e4ea;background:#fff}
      .${ROOM_CUE_CLASS}{border-left:4px solid #315568;background:#f6fbfd}
      .${ITEM_CUE_CLASS}{border-left:4px solid #bf8420;background:#fffdf8}
      .${ROOM_CUE_CLASS} strong,.${ITEM_CUE_CLASS} strong{display:block;color:#0b3658;font-size:12px;margin-bottom:2px}
      .roomPhotoBox .photoBox{border-left:5px solid #315568!important;background:linear-gradient(180deg,#fbfdfe 0%,#f6fbfd 100%)!important}
      .checklistDetailPanel .photoBox{border-left:5px solid #bf8420!important;background:linear-gradient(180deg,#fffdf8 0%,#fffaf0 100%)!important}
      .thumbGrid.roomThumbGrid .thumbCard{box-shadow:inset 4px 0 0 rgba(49,85,104,.28)!important}
      .checklistDetailPanel .thumbGrid:not(.roomThumbGrid) .thumbCard{box-shadow:inset 4px 0 0 rgba(191,132,32,.32)!important}
      .tha-v38-photo-scope-chip{display:inline-flex!important;align-items:center!important;border-radius:999px!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#315568!important;padding:3px 7px!important;font-size:10px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.04em!important;margin-left:6px!important;vertical-align:middle!important}
      @media(max-width:720px){.${GUIDE_CLASS}{margin:8px 0 12px}.${GUIDE_CLASS} summary{align-items:flex-start;flex-direction:column}.tha-v38-photo-scope-chip{display:flex!important;margin:4px 0 0!important;width:max-content!important}}
      @media print{.${GUIDE_CLASS},.${ROOM_CUE_CLASS},.${ITEM_CUE_CLASS}{display:none!important}}
    `;
    document.head.append(style);
  }

  function isHtcWorkspace(main) {
    return Boolean(main?.querySelector?.('.roomCaptureShell,.checklistToolbar,.checklistItemCard')) && !main.classList.contains('pmr') && !main.classList.contains('passWorkspace');
  }

  function ensureGuide() {
    const main = Array.from(document.querySelectorAll('main')).find(isHtcWorkspace);
    if (!main || main.querySelector(`.${GUIDE_CLASS}`)) return;
    const guide = document.createElement('details');
    guide.className = GUIDE_CLASS;
    guide.innerHTML = `
      <summary>Photo Placement Guide <span>Open / close</span></summary>
      <div class="photoGuideBody">
        <p>Use photos as evidence, not clutter. Put the photo where the report should explain it.</p>
        <div class="photoGuideGrid">
          <div class="photoGuideTile"><strong>Room Overview Photos</strong><p>Use for broad context: room layout, general condition, before/after overview, or where an issue sits in the room.</p></div>
          <div class="photoGuideTile"><strong>Finding Detail Photos</strong><p>Use on the specific checklist item for the actual issue: close-up, damaged part, stain, leak, label, loose hardware, or trade evidence.</p></div>
          <div class="photoGuideTile"><strong>Rule of thumb</strong><p>If the photo supports a PMR finding, attach it to that finding. If it only helps orient the space, attach it to Room Overview.</p></div>
        </div>
      </div>`;
    const toolbar = main.querySelector('.checklistToolbar');
    const roomShell = main.querySelector('.roomCaptureShell');
    if (toolbar?.parentNode) toolbar.parentNode.insertBefore(guide, toolbar);
    else if (roomShell?.parentNode) roomShell.parentNode.insertBefore(guide, roomShell.nextSibling);
    else main.prepend(guide);
  }

  function ensureScopeChip(box, label) {
    const strong = box.querySelector(':scope > strong');
    if (!strong || strong.querySelector('.tha-v38-photo-scope-chip')) return;
    const chip = document.createElement('span');
    chip.className = 'tha-v38-photo-scope-chip';
    chip.textContent = label;
    strong.append(chip);
  }

  function improveRoomPhotoBoxes() {
    document.querySelectorAll('.roomPhotoBox .photoBox').forEach(box => {
      const strong = box.querySelector(':scope > strong');
      if (strong && !/room overview photos/i.test(textOf(strong))) strong.childNodes[0].textContent = 'Room Overview Photos: ';
      ensureScopeChip(box, 'Room context');
      if (!box.querySelector(`.${ROOM_CUE_CLASS}`)) {
        const cue = document.createElement('span');
        cue.className = ROOM_CUE_CLASS;
        cue.innerHTML = '<strong>Use here for broad room context.</strong>Examples: room layout, overview condition, where an issue is located, or general before/after reference. Specific defects belong on the matching checklist item below.';
        box.append(cue);
      }
    });
  }

  function improveItemPhotoBoxes() {
    document.querySelectorAll('.checklistDetailPanel .photoBox').forEach(box => {
      if (box.closest('.roomPhotoBox')) return;
      const strong = box.querySelector(':scope > strong');
      if (strong) {
        const first = Array.from(strong.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (first) first.textContent = 'Finding Detail Photos: ';
        else strong.prepend('Finding Detail Photos: ');
      }
      ensureScopeChip(box, 'Finding evidence');
      if (!box.querySelector(`.${ITEM_CUE_CLASS}`)) {
        const cue = document.createElement('span');
        cue.className = ITEM_CUE_CLASS;
        cue.innerHTML = '<strong>Use here when the photo supports this exact line item.</strong>Examples: close-up damage, leak evidence, failed caulk, equipment label, unsafe condition, or detail a trade needs to see.';
        box.append(cue);
      }
      const uploadLabel = Array.from(box.querySelectorAll('label')).find(label => /upload/i.test(textOf(label)));
      if (uploadLabel && !/Add Finding Photo/i.test(textOf(uploadLabel))) {
        const input = uploadLabel.querySelector('input');
        uploadLabel.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) node.textContent = ' Add Finding Photo'; });
        if (input) uploadLabel.append(input);
      }
    });
  }

  function markPhotoStatusForReport() {
    document.querySelectorAll('.thumbCard').forEach(card => {
      const isRoom = Boolean(card.closest('.roomThumbGrid'));
      card.setAttribute('data-tha-photo-placement', isRoom ? 'room-overview' : 'finding-detail');
      const status = card.querySelector('.photoStatusText');
      if (status && !status.getAttribute('data-tha-v38-augmented')) {
        status.setAttribute('data-tha-v38-augmented', 'true');
        const scope = document.createElement('span');
        scope.className = 'tha-v38-photo-scope-chip';
        scope.textContent = isRoom ? 'Room context' : 'Finding evidence';
        status.insertAdjacentElement('afterend', scope);
      }
    });
  }

  function apply() {
    installStyles();
    ensureGuide();
    improveRoomPhotoBoxes();
    improveItemPhotoBoxes();
    markPhotoStatusForReport();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function start() {
    apply();
    window.setTimeout(apply, 400);
    window.setTimeout(apply, 1200);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
