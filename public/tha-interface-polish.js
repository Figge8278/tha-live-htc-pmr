(() => {
  const SYMBOLS = {
    'Handy Services': '🧰', Appliances: '⚙️', Electrical: '🔌', Plumbing: '🚿',
    'HVAC / Mechanical': '🌡️', 'General Contractor / Remodel': '🦺',
    'Carpentry / Decks / Fences': '🔨', 'Painting / Staining / Protective Coatings': '🎨',
    'Exterior & Site / Grounds': '🏡', 'Safety / Life Safety': '🛡️', Pest: '🐜', 'Specialty / Other': '🔎'
  };

  function buttonLabel(button, open, closedLabel, openLabel) {
    button.textContent = open ? openLabel : closedLabel;
    button.setAttribute('aria-expanded', String(open));
  }

  function careTileTitles() {
    document.querySelectorAll('.passWorkspace .passReviewCard h4, .passWorkspace .tha-output-card h3').forEach(title => {
      title.classList.add('tha-care-item-title');
    });
  }

  function outputSections() {
    document.querySelectorAll('.passWorkspace .tha-readonly-output').forEach(block => {
      const banner = block.querySelector('.tha-readonly-banner');
      if (banner && !banner.querySelector('.tha-output-rule')) {
        const note = document.createElement('small');
        note.className = 'tha-output-rule';
        note.textContent = 'Included in PMR controls what appears here. Green means completed or verified — it is not a separate homeowner-approval setting.';
        banner.append(note);
      }

      block.querySelectorAll('.tha-pass-output-group').forEach(group => {
        const list = group.querySelector('.tha-pass-output-card-list');
        const header = group.querySelector('.tha-pass-output-group-header');
        if (!list || !header) return;

        const cards = Array.from(list.children);
        cards.forEach(card => {
          const isGreen = /\bcompleted\b|verified/i.test(card.textContent);
          card.classList.toggle('tha-output-green', isGreen);
        });
        cards.sort((a, b) => Number(b.classList.contains('tha-output-green')) - Number(a.classList.contains('tha-output-green')));
        cards.forEach(card => list.append(card));

        if (!header.querySelector('.tha-output-section-toggle')) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'tha-output-section-toggle';
          let open = false;
          list.hidden = true;
          buttonLabel(button, open, 'Open section', 'Collapse section');
          button.addEventListener('click', () => {
            open = !open;
            list.hidden = !open;
            group.classList.toggle('isOpen', open);
            buttonLabel(button, open, 'Open section', 'Collapse section');
          });
          header.append(button);
        }
      });
    });
  }

  function iconForSection(section, category) {
    const existing = Array.from(section.querySelectorAll('.categoryBadge')).find(badge => badge.textContent.trim() === category)?.querySelector('svg');
    if (existing) return existing.cloneNode(true);
    const fallback = document.createElement('span');
    fallback.textContent = SYMBOLS[category] || '•';
    return fallback;
  }

  function fieldPrepVisuals() {
    document.querySelectorAll('.tha-field-prep .intakeSubsection').forEach(section => {
      const category = section.dataset.thaCategory || 'Specialty / Other';
      const heading = section.querySelector('h3');
      if (!heading) return;

      if (!heading.querySelector('.tha-prep-heading-icon')) {
        const icon = document.createElement('span');
        icon.className = 'tha-prep-heading-icon';
        icon.append(iconForSection(section, category));
        heading.prepend(icon);
      }

      section.querySelectorAll('.intakeGrid > label').forEach(label => {
        label.classList.add('tha-prep-field-card');
      });
    });
  }

  function runPolish() {
    careTileTitles();
    outputSections();
    fieldPrepVisuals();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      runPolish();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
