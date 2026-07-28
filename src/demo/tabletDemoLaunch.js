const DEMO_QUERY_VALUE = 'pmr-pass';
const DEMO_TITLE = 'Demo 3 — PMR findings plus PASS care items';

function requestedDemo() {
  try {
    return new URLSearchParams(window.location.search).get('demo') === DEMO_QUERY_VALUE;
  } catch {
    return false;
  }
}

function replaceLaunchUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('demo');
  url.searchParams.set('demoLoaded', DEMO_QUERY_VALUE);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function announceLoaded() {
  const existing = document.querySelector('[data-tha-tablet-demo-banner]');
  if (existing) return;
  const banner = document.createElement('div');
  banner.dataset.thaTabletDemoBanner = 'true';
  banner.setAttribute('role', 'status');
  banner.style.cssText = 'position:sticky;top:0;z-index:9999;padding:10px 14px;background:#eef8ea;border-bottom:2px solid #52aa4b;color:#173e57;font:800 14px/1.35 Inter,Arial,sans-serif;text-align:center;';
  banner.textContent = 'Tablet demo loaded: PMR findings + PMCP continued care. You can now review, edit, save, and export this walkthrough.';
  document.body.prepend(banner);
}

function findDemoButton() {
  const cards = Array.from(document.querySelectorAll('.demoScenario'));
  const card = cards.find(candidate => candidate.querySelector('h4')?.textContent?.trim() === DEMO_TITLE);
  return card?.querySelector('button');
}

function launchDemo(attempt = 0) {
  if (!requestedDemo()) return;
  const button = findDemoButton();
  if (!button) {
    if (attempt < 80) window.setTimeout(() => launchDemo(attempt + 1), 125);
    return;
  }
  replaceLaunchUrl();
  button.click();
  window.setTimeout(() => {
    announceLoaded();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 250);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => launchDemo(), { once: true });
} else {
  launchDemo();
}
