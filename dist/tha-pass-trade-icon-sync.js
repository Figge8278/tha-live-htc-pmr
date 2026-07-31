(() => {
  const GROUP_CONFIG = {
    'Handy Services': { title: 'Handy Services & Routine Fixes' },
    'Appliances': { title: 'Appliance Care' },
    'Electrical': { title: 'Electrical & Power' },
    'Plumbing': { title: 'Plumbing & Water' },
    'HVAC / Mechanical': { title: 'Heating, Cooling & Mechanical' },
    'General Contractor / Remodel': { title: 'Projects, Structure & Remodel' },
    'Carpentry / Decks / Fences': { title: 'Carpentry, Decks & Fences' },
    'Painting / Staining / Protective Coatings': { title: 'Paint, Stain & Protective Finishes' },
    'Exterior & Site / Grounds': { title: 'Roof, Gutters & Drainage', icon: 'roof' },
    'Safety / Life Safety': { title: 'Safety & Life Safety' },
    'Pest': { title: 'Pest Prevention & Monitoring' },
    'Specialty / Other': { title: 'Specialty & Follow-up' }
  };

  function roofIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('xmlns', ns);
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const roof = document.createElementNS(ns, 'path');
    roof.setAttribute('d', 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
    const doorway = document.createElementNS(ns, 'polyline');
    doorway.setAttribute('points', '9 22 9 12 15 12 15 22');
    svg.append(roof, doorway);
    return svg;
  }

  function categoryFor(group) {
    return group.dataset.thaCategory || group.querySelector('[data-tha-category]')?.dataset.thaCategory || '';
  }

  function reviewGroupFor(category) {
    return Array.from(document.querySelectorAll('.passWorkspace .passCategoryGroup'))
      .find(group => categoryFor(group) === category);
  }

  function nativeIconFor(group, category) {
    if (GROUP_CONFIG[category]?.icon === 'roof') return roofIcon();

    const reviewGroup = group.classList.contains('passCategoryGroup') ? group : reviewGroupFor(category);
    const icon = reviewGroup?.querySelector('.passCategoryIcon svg') ||
      Array.from(reviewGroup?.querySelectorAll('.categoryBadge') || [])
        .find(badge => badge.textContent.trim() === category)?.querySelector('svg');
    return icon ? icon.cloneNode(true) : null;
  }

  function titleFor(category, h3) {
    return GROUP_CONFIG[category]?.title || h3.dataset.thaPassTitle || h3.textContent.trim();
  }

  function normalizeGroup(group) {
    const category = categoryFor(group);
    if (!category) return;
    const config = GROUP_CONFIG[category];
    const h3 = group.querySelector('.passCategoryHeader h3, .tha-pass-output-group-header h3');
    const iconBox = group.querySelector('.passCategoryIcon');
    if (h3) {
      const title = titleFor(category, h3);
      h3.dataset.thaPassTitle = title;
      h3.textContent = title;
    }
    if (iconBox) {
      const icon = nativeIconFor(group, category);
      if (icon) {
        iconBox.replaceChildren(icon);
        iconBox.setAttribute('aria-label', `${config?.title || category} trade`);
      }
    }
  }

  function orderGroups(container) {
    const order = [
      'Handy Services',
      'Appliances',
      'Electrical',
      'Plumbing',
      'HVAC / Mechanical',
      'General Contractor / Remodel',
      'Carpentry / Decks / Fences',
      'Painting / Staining / Protective Coatings',
      'Exterior & Site / Grounds',
      'Safety / Life Safety',
      'Pest',
      'Specialty / Other'
    ];
    const groups = Array.from(container.children).filter(child => child.matches('.passCategoryGroup, .tha-pass-output-group'));
    groups.sort((a, b) => order.indexOf(categoryFor(a)) - order.indexOf(categoryFor(b)));
    groups.forEach(group => container.append(group));
  }

  function syncPassTrades() {
    document.querySelectorAll('.passWorkspace .passCategoryGroup, .passWorkspace .tha-pass-output-group').forEach(normalizeGroup);
    document.querySelectorAll('.passWorkspace .passCategoryGroups, .passWorkspace .passOutlookGrid').forEach(orderGroups);
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncPassTrades();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
