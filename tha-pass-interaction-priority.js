(() => {
  function setButton(button, open, closedText, openText) {
    button.textContent = open ? openText : closedText;
    button.setAttribute('aria-expanded', String(open));
  }

  function toggleSection(button) {
    const group = button.closest('.tha-pass-output-group');
    const list = group?.querySelector('.tha-pass-output-card-list');
    if (!list) return false;
    const opening = list.hidden;
    list.hidden = !opening;
    group.classList.toggle('isOpen', opening);
    setButton(button, opening, 'Open section', 'Collapse section');
    return true;
  }

  function toggleDetails(button) {
    const card = button.closest('.tha-output-card');
    const details = card?.querySelector('.findGrid');
    if (!details) return false;
    const opening = details.hidden;
    details.hidden = !opening;
    card.classList.toggle('isDetailsOpen', opening);
    setButton(button, opening, 'View details', 'Hide details');
    return true;
  }

  if (!window.__thaPassInteractionPriority) {
    window.__thaPassInteractionPriority = true;
    window.addEventListener('click', event => {
      const sectionButton = event.target.closest('.tha-output-section-toggle');
      if (sectionButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleSection(sectionButton);
        return;
      }

      const detailButton = event.target.closest('.tha-output-card-toggle');
      if (detailButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleDetails(detailButton);
      }
    }, true);
  }
})();
