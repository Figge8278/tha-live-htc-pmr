(() => {
  const PMCP_BUILDER = 'Preventative Maintenance Care Plan Builder';
  const PMCP_PRODUCT = 'Preventative Maintenance Care Plan';

  function installStyles() {
    if (document.getElementById('tha-pass-compact-controls-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-pass-compact-controls-styles';
    style.textContent = `
      .passWorkspace .tha-pass-client-selection[hidden]{display:none!important}
      .passWorkspace .tha-pmcp-note{margin:8px 0 14px;padding:10px 12px;border-left:4px solid #287bb7;border-radius:10px;background:#f4f9fc;color:#45616f;font-size:13px;line-height:1.4}
      .passWorkspace .tha-pmcp-note strong{color:#173e57}
    `;
    document.head.append(style);
  }

  function reviewToggle(card) {
    return card.querySelector('.passReviewCardToggle') ||
      Array.from(card.querySelectorAll('button')).find(button => {
        const text = button.textContent.trim();
        return /^(open|collapse|view details|hide details)$/i.test(text);
      });
  }

  function cardIsOpen(card) {
    const toggle = reviewToggle(card);
    if (!toggle) return false;
    const expanded = toggle.getAttribute('aria-expanded');
    if (expanded === 'true') return true;
    if (expanded === 'false') return false;
    return /collapse|hide/i.test(toggle.textContent);
  }

  function findSelectionControl(card) {
    const checkbox = Array.from(card.querySelectorAll('input[type="checkbox"]')).find(input => {
      const label = input.closest('label') || input.parentElement;
      return /include in pmr|include|pass care plan|pmcp/i.test(label?.textContent || '');
    });
    if (!checkbox) return null;
    return checkbox.closest('label') || checkbox.parentElement;
  }

  function adaptCard(card) {
    const control = findSelectionControl(card);
    if (!control) return;
    control.classList.add('tha-pass-client-selection');
    control.hidden = !cardIsOpen(card);
  }

  function replaceHeading(heading) {
    const text = heading.textContent.trim();
    if (text === 'PASS Review Controls' || text === 'THA PASS Planning' || text === 'PASS Care Plan Builder' || text === PMCP_BUILDER) {
      heading.textContent = PMCP_BUILDER;
      return;
    }
    if (/^(Selected PASS Continued Care Plan|Client PASS Care Plan|Continued Care Plan|PASS Continued Care Outlook|Preventative Maintenance Care Plan)$/i.test(text)) {
      heading.textContent = PMCP_PRODUCT;
    }
  }

  function addPmcpNote(workspace) {
    const builder = Array.from(workspace.querySelectorAll('h1,h2,h3')).find(heading => heading.textContent.trim() === PMCP_BUILDER);
    if (!builder) return;
    const container = builder.closest('.passReviewPanel, .passReviewSection, section, div') || builder.parentElement;
    if (!container || container.querySelector('.tha-pmcp-note')) return;
    const note = document.createElement('p');
    note.className = 'tha-pmcp-note';
    note.innerHTML = '<strong>PASS → PMCP:</strong> PASS is The Homeowner Advocate’s framework for turning selected upkeep priorities into a homeowner’s Preventative Maintenance Care Plan (PMCP). The PMCP is the care-plan product created through this builder.';
    builder.after(note);
  }

  function adaptWorkspace(workspace) {
    workspace.querySelectorAll('h1,h2,h3').forEach(replaceHeading);
    addPmcpNote(workspace);
    workspace.querySelectorAll('.passReviewCard').forEach(adaptCard);
  }

  function run() {
    installStyles();
    document.querySelectorAll('.passWorkspace').forEach(adaptWorkspace);
  }

  if (!window.__thaPassCompactControlRefresh) {
    window.__thaPassCompactControlRefresh = true;
    document.addEventListener('click', event => {
      if (event.target.closest('.passReviewCard')) window.setTimeout(run, 0);
    }, true);
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

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
