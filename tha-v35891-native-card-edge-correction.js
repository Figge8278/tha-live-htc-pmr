(() => {
  const ID = 'tha-v35891-native-card-edge-correction';
  if (window[ID]) return;
  window[ID] = true;

  const LABELS = {
    'handy-services': 'Handy Services',
    appliances: 'Appliances',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    'hvac-mechanical': 'HVAC / Ventilation',
    roofing: 'Roofing / Gutters',
    'landscaping-site-grounds': 'Landscaping / Site & Grounds',
    'windows-exterior-sealant': 'Windows / Exterior Sealant',
    'general-contractor-remodel': 'General Contractor / Structural',
    'carpentry-decks-fences': 'Carpentry / Decks / Fences',
    'painting-staining-coatings': 'Painting / Staining',
    'safety-life-safety': 'Safety / Life Safety',
    pest: 'Pest',
    chimney: 'Chimney / Fireplace',
    'specialty-other': 'Specialty / Other'
  };

  const style = document.createElement('style');
  style.id = `${ID}-styles`;
  style.textContent = `
    .thaV359CategoryChip{display:none!important}
    .formPanel .checklistItemCard::before{content:''!important;display:block!important;width:4px!important}
  `;
  document.head.append(style);

  function update() {
    document.querySelectorAll('.checklistItemCard[data-v359-category]').forEach(card => {
      const slug = card.dataset.v359Category || 'specialty-other';
      const label = LABELS[slug] || LABELS['specialty-other'];
      const badge = card.querySelector('.checklistSummaryRow .categoryBadge');
      if (!badge) return;
      Array.from(badge.classList).filter(name => name.startsWith('category-')).forEach(name => badge.classList.remove(name));
      badge.classList.add(`category-${slug}`);
      badge.setAttribute('aria-label', `${label} category`);
      const node = Array.from(badge.childNodes).find(child => child.nodeType === Node.TEXT_NODE);
      if (node) node.textContent = label;
      else badge.append(document.createTextNode(label));
    });
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      update();
    });
  }

  schedule();
  setTimeout(schedule, 300);
  setTimeout(schedule, 900);
  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
})();
