(() => {
  const COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';
  try {
    localStorage.setItem(COLLAPSED_KEY, 'false');
  } catch {
    // Field helper only.
  }
})();