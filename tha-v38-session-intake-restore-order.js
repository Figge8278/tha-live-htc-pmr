(() => {
  const STYLE_ID = 'tha-v38-session-intake-restore-order-styles';
  const PANEL_CLASS = 'tha-v38-restore-panel';
  const SESSION_KEY = 'tha-walkthrough-sessions';
  const CURRENT_ID_KEY = 'tha-current-walkthrough-id';
  const PENDING_IMPORT_KEY = 'tha-v38-pending-restore-session';

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .walkthroughControlsPanel.expanded .walkthroughControlsBody{
        grid-template-areas:"setup workSession" "intakeImport businessRecords" "advanced advanced"!important;
      }
      .walkthroughControlsPanel .walkthroughSetupCard{grid-area:setup!important}
      .walkthroughControlsPanel .localWorkCard{grid-area:workSession!important}
      .walkthroughControlsPanel .homeownerIntakeSectionCard,.walkthroughControlsPanel .intakeImportCard{grid-area:intakeImport!important}
      .walkthroughControlsPanel .businessRecordsCard{grid-area:businessRecords!important}
      .walkthroughControlsPanel .advancedPanel{grid-area:advanced!important}
      .walkthroughControlsPanel .businessRecordsCard>.tha-v37-restore-panel,
      .walkthroughControlsPanel .businessRecordsCard .tha-v37-restore-panel{display:none!important;visibility:hidden!important}
      .${PANEL_CLASS}{border:1px solid #d8e4ea;border-left:5px solid #52aa4b;border-radius:16px;background:#f7fbf6;padding:12px 14px;margin:12px 0 0;color:#203040;box-shadow:0 6px 14px rgba(13,44,73,.05)}
      .${PANEL_CLASS} h4{margin:0 0 4px;color:#0b3658;font-size:15px}
      .${PANEL_CLASS} p{margin:4px 0;color:#40505f;font-size:13px;line-height:1.35}
      .${PANEL_CLASS} input{display:block;margin-top:8px;max-width:100%;font-size:13px}
      .${PANEL_CLASS} .restoreStatus{display:block;margin-top:8px;font-size:12px;font-weight:900;color:#285c30}
      .${PANEL_CLASS} .restoreStatus.error{color:#842218}
      @media(max-width:900px){
        .walkthroughControlsPanel.expanded .walkthroughControlsBody{
          grid-template-areas:"setup" "workSession" "intakeImport" "businessRecords" "advanced"!important;
        }
      }
      @media print{.${PANEL_CLASS}{display:none!important}}
    `;
    document.head.append(style);
  }

  function normalizeExportPayload(data = {}) {
    if (data?.client && (data.rows || data.pmr || data.intake)) return data;
    if (data?.data?.client) return data.data;
    return data;
  }

  function buildAnswersFromPayload(payload = {}) {
    const answerEntries = (payload.rows || [])
      .map(row => [row.id, row.answer])
      .filter(([id, answer]) => id !== undefined && id !== null && answer);
    return Object.fromEntries(answerEntries);
  }

  function buildRestoredSessionData(payload = {}) {
    return {
      client: payload.client || {},
      answers: payload.answers || buildAnswersFromPayload(payload),
      intake: payload.intake || {},
      dynamicRooms: Array.isArray(payload.dynamicRooms) ? payload.dynamicRooms : [],
      sectionOrder: Array.isArray(payload.sectionOrder) ? payload.sectionOrder : [],
      itemOrder: payload.itemOrder || {},
      pinnedItems: payload.pinnedItems || {},
      roomCapture: payload.roomCapture || {},
      passReview: payload.passReview || {},
      roomOverviewExpandedByRoom: payload.roomOverviewExpandedByRoom || {},
      smartPromptExpandedByRoom: payload.smartPromptExpandedByRoom || {},
      expandedChecklistItems: payload.expandedChecklistItems || {}
    };
  }

  function restoreTarget() {
    return document.querySelector('.walkthroughControlsPanel .homeownerIntakeSectionCard')
      || document.querySelector('.walkthroughControlsPanel .intakeImportCard')
      || document.querySelector('.walkthroughControlsPanel .localWorkCard');
  }

  function removeOldBusinessRestorePanels() {
    document.querySelectorAll('.walkthroughControlsPanel .businessRecordsCard .tha-v37-restore-panel').forEach(panel => panel.remove());
  }

  function setStatus(panel, message, tone = 'success') {
    const status = panel?.querySelector('.restoreStatus');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', tone === 'error');
  }

  function saveRestoredSession(payload = {}) {
    const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}') || {};
    const id = `restored-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const client = payload.client || {};
    const name = [client.name, client.address, client.date].filter(Boolean).join(' — ') || 'Restored Walkthrough';
    sessions[id] = {
      id,
      name,
      updatedAt: new Date().toISOString(),
      data: buildRestoredSessionData(payload)
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
    localStorage.setItem(CURRENT_ID_KEY, id);
    localStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify({ id, name }));
    return { id, name };
  }

  function openPendingRestoredSession(panel) {
    let pending = null;
    try {
      pending = JSON.parse(localStorage.getItem(PENDING_IMPORT_KEY) || 'null');
    } catch {
      pending = null;
    }
    if (!pending?.id) return false;
    const selector = Array.from(document.querySelectorAll('select')).find(select => Array.from(select.options || []).some(option => option.value === pending.id));
    if (!selector) return false;
    selector.value = pending.id;
    selector.dispatchEvent(new Event('change', { bubbles: true }));
    localStorage.removeItem(PENDING_IMPORT_KEY);
    setStatus(panel, `Restored ${pending.name}. It is now loaded as the active work session.`);
    return true;
  }

  function ensureRestorePanel() {
    removeOldBusinessRestorePanels();
    const target = restoreTarget();
    if (!target) return;
    let panel = target.querySelector(`.${PANEL_CLASS}`);
    if (!panel) {
      panel = document.createElement('div');
      panel.className = PANEL_CLASS;
      panel.innerHTML = '<h4>Import / continue from Drive backup JSON</h4><p>Use the “00 - Restore This Walkthrough — Full Data Backup.json” file from a Drive package to continue this walkthrough on this device. This belongs with Homeowner Intake / Work Session setup, not the final PMR output.</p><input type="file" accept="application/json,.json"><span class="restoreStatus"></span>';
      const input = panel.querySelector('input');
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const payload = normalizeExportPayload(JSON.parse(await file.text()));
          if (!payload?.client) throw new Error('This file does not look like a THA walkthrough backup.');
          const restored = saveRestoredSession(payload);
          setStatus(panel, `Imported ${restored.name}. Reloading and opening that work session…`);
          setTimeout(() => window.location.reload(), 600);
        } catch (error) {
          setStatus(panel, error?.message || 'Import failed.', 'error');
        }
      });
      target.append(panel);
    }
    openPendingRestoredSession(panel);
  }

  function syncHeadings() {
    const panel = document.querySelector('.walkthroughControlsPanel');
    if (!panel) return;
    const mappings = [
      [/^1\.\s*Walkthrough Setup$/i, '1. Walkthrough Setup'],
      [/^2\.\s*Work Session$/i, '2. Work Session'],
      [/^3\.\s*Homeowner Intake$/i, '3. Homeowner Intake'],
      [/^4\.\s*Business Records & Drive$/i, '4. Business Records & Drive']
    ];
    panel.querySelectorAll('h3').forEach(heading => {
      const text = textOf(heading);
      const match = mappings.find(([pattern]) => pattern.test(text));
      if (match && heading.textContent !== match[1]) heading.textContent = match[1];
    });
  }

  function sync() {
    installStyles();
    syncHeadings();
    ensureRestorePanel();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  function start() {
    sync();
    window.setTimeout(sync, 300);
    window.setTimeout(sync, 1000);
    new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();