(() => {
  const SECTION_ICON_SOURCES = {
    'Electrical': ['Electrical'],
    'Plumbing / Water': ['Plumbing'],
    'HVAC / Comfort': ['HVAC'],
    'Roof / Exterior / Drainage': ['Roof', 'Drainage', 'Exterior'],
    'Windows / Doors / Paint': ['Windows', 'Paint', 'Exterior'],
    'Safety / Pests / Fireplaces': ['Safety', 'Pest', 'Chimney'],
    'Product info / documents / unknowns': ['Specialty / Other', 'General Contractor'],
    'Additional THA notes': ['Specialty / Other']
  };

  const FALLBACKS = {
    'Electrical': '⚡',
    'Plumbing / Water': '💧',
    'HVAC / Comfort': '🌬️',
    'Roof / Exterior / Drainage': '🏠',
    'Windows / Doors / Paint': '🪟',
    'Safety / Pests / Fireplaces': '🛡️',
    'Product info / documents / unknowns': '📋',
    'Additional THA notes': '📝'
  };

  function installHeaderIconStyles() {
    if (document.getElementById('tha-field-prep-heading-icon-styles')) return;
    const style = document.createElement('style');
    style.id = 'tha-field-prep-heading-icon-styles';
    style.textContent = `
      .tha-field-prep .intakeSubsection h3{display:flex!important;align-items:center!important;gap:9px!important}
      .tha-field-prep .tha-prep-header-icon{display:inline-grid;place-items:center;flex:0 0 auto;width:32px;height:32px;border-radius:50%;background:#fff7e9;border:1px solid #e4c38d;color:#c77716;box-shadow:0 2px 7px rgba(191,132,32,.12)}
      .tha-field-prep .tha-prep-header-icon svg{width:17px;height:17px;stroke-width:2.25}
      .tha-field-prep .tha-prep-header-icon+.tha-prep-header-label{min-width:0}
      .tha-field-prep .tha-prep-header-label{display:inline-block}
      .tha-field-prep .tha-prep-toggle{margin-left:auto}
    `;
    document.head.append(style);
  }

  function sectionTitle(heading) {
    return heading.dataset.thaOriginalHeading || heading.textContent.replace(/Open fields|Collapse fields/g, '').trim();
  }

  function matchingSource(section, labels) {
    const badges = Array.from(section.querySelectorAll('.categoryBadge'));
    for (const label of labels || []) {
      const badge = badges.find(node => node.textContent.trim() === label);
      const svg = badge?.querySelector('svg');
      if (svg) return svg;
    }
    return section.querySelector('.categoryBadge svg, .tradeBadge svg');
  }

  function decorateFieldPrepHeaders() {
    document.querySelectorAll('.tha-field-prep .intakeSubsection').forEach(section => {
      const heading = section.querySelector('h3');
      if (!heading) return;
      const title = sectionTitle(heading);
      const toggle = heading.querySelector('.tha-prep-toggle');
      const source = matchingSource(section, SECTION_ICON_SOURCES[title]);

      const icon = document.createElement('span');
      icon.className = 'tha-prep-header-icon';
      icon.setAttribute('aria-hidden', 'true');
      if (source) icon.append(source.cloneNode(true));
      else icon.textContent = FALLBACKS[title] || '•';

      const label = document.createElement('span');
      label.className = 'tha-prep-header-label';
      label.textContent = title;

      heading.replaceChildren(icon, label);
      if (toggle) heading.append(toggle);
    });
  }

  function run() {
    installHeaderIconStyles();
    decorateFieldPrepHeaders();
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      run();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
