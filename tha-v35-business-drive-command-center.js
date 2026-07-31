(() => {
  // Temporarily disabled.
  // The prior command-center overlay was interfering with the core Walkthrough Setup & Records panel.
  // Keep this file as a no-op so the app load order stays stable while the core 1-4 setup flow is restored.
  try {
    document.querySelectorAll('[data-tha-business-drive-command-center]').forEach(node => node.remove());
    document.querySelectorAll('.tha-drive-advanced-wrap').forEach(node => node.remove());
  } catch {
    // Restore helper only.
  }
})();