(() => {
  const STORAGE_KEY = 'tha-htc-room-coverage-v1';

  function readCoverage() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeCoverage(next) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { /* Keep the visual aid working for this page even if storage is unavailable. */ }
  }

  function installStyles() {
    if (document.getElementById('tha-htc-coverage-rails-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-htc-coverage-rails-styles';
    style.textContent = `
      /* Orange = room still needs a walkthrough decision. Blue = at least one item has been documented. */
      .roomNav .sectionSelect.tha-htc-pending{background:#fff4e8!important;border-color:#f0c998!important;color:#6f461f!important}
      .roomNav .sectionSelect.tha-htc-covered{background:#eef7fc!important;border-color:#b7d9ea!important;box-shadow:inset 5px 0 0 #287bb7!important;color:#173e57!important}
      .roomNav .sectionSelect.tha-htc-covered.active{box-shadow:inset 5px 0 0 #287bb7,0 0 0 2px rgba(40,123,183,.16)!important}
      .roomNav .sectionGroupAddButton{background:#edf8ed!important;border-color:#b6dcb8!important;color:#2e6a35!important}
      .roomNav .sectionGroupAddButton:hover{background:#e5f4e6!important;border-color:#83ba89!important}
      .formPanel .checklistItemCard.tha-htc-notated{box-shadow:inset 5px 0 0 #287bb7,0 2px 9px rgba(30,103,150,.06)!important}
      .formPanel .checklistItemCard.tha-htc-notated .checklistSummaryRow{background:linear-gradient(90deg,#f4fbff 0%,#fff 34%)!important}
      @media(max-width:900px){
        .roomNav .sectionSelect.tha-htc-covered{box-shadow:inset 4px 0 0 #287bb7!important}
        .formPanel .checklistItemCard.tha-htc-notated{box-shadow:inset 4px 0 0 #287bb7,0 2px 9px rgba(30,103,150,.06)!important}
      }
    `;
    document.head.append(style);
  }

  function activeRoomName() {
    const heading = document.querySelector('.formPanel > h1');
    return (heading?.textContent || '').replace(/\s+HTC\s*$/i, '').trim();
  }

  function itemKey(card) {
    const title = card.querySelector('.checklistSummaryMain strong, .expandedItemHead h2')?.textContent?.trim() || '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function cardHasActualNotation(card) {
    if (card.querySelector('textarea')?.value?.trim()) return true;
    if (Array.from(card.querySelectorAll('input[type="text"]')).some(input => input.value.trim())) return true;
    if (card.querySelector('.thumbCard')) return true;
    if (card.querySelector('.passCandidateToggle input:checked')) return true;
    return Array.from(card.querySelectorAll('.summaryFlag')).some(flag => !flag.classList.contains('quiet'));
  }

  function roomHasCoverage(roomName) {
    const coverage = readCoverage();
    return Boolean(coverage[roomName] && Object.keys(coverage[roomName]).length);
  }

  function markCard(card) {
    const room = activeRoomName();
    const key = itemKey(card);
    if (!room || !key) return;
    const coverage = readCoverage();
    coverage[room] = { ...(coverage[room] || {}), [key]: true };
    writeCoverage(coverage);
    refresh();
  }

  function refreshCurrentRoomCards() {
    const room = activeRoomName();
    const stored = readCoverage()[room] || {};
    document.querySelectorAll('.formPanel .checklistItemCard').forEach(card => {
      const key = itemKey(card);
      const notated = Boolean(stored[key] || cardHasActualNotation(card));
      card.classList.toggle('tha-htc-notated', notated);
    });
  }

  function refreshRoomNav() {
    document.querySelectorAll('.roomNav .sectionSelect').forEach(button => {
      const name = button.querySelector('.sectionName')?.textContent?.trim() || '';
      const covered = roomHasCoverage(name);
      button.classList.toggle('tha-htc-covered', covered);
      button.classList.toggle('tha-htc-pending', !covered);
      button.title = covered
        ? 'At least one walkthrough item has been documented in this room.'
        : 'This room still needs a walkthrough decision or should be marked not applicable.';
    });
  }

  function refresh() {
    refreshCurrentRoomCards();
    refreshRoomNav();
  }

  function installListeners() {
    if (window.__thaHtcCoverageRails) return;
    window.__thaHtcCoverageRails = true;
    const documentItem = event => {
      const card = event.target.closest('.formPanel .checklistItemCard');
      if (card) markCard(card);
    };
    document.addEventListener('input', documentItem);
    document.addEventListener('change', documentItem);
    document.addEventListener('click', event => {
      if (/new blank local walkthrough/i.test(event.target.closest('button')?.textContent || '')) {
        try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
        window.setTimeout(refresh, 0);
      }
    });
  }

  function run() {
    installStyles();
    installListeners();
    refresh();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
