/* VATSAL.LOL V4 — Lightweight Platform SDK */
(function () {
  'use strict';

  // Helper to resolve root URL
  function getRootUrl() {
    return '/';
  }

  // Inject top-left vatsal.lol branding link
  function initBranding() {
    if (document.getElementById('vatsal-v4-logo')) return;

    const logo = document.createElement('a');
    logo.id = 'vatsal-v4-logo';
    logo.className = 'vatsal-v4-branding';
    logo.href = getRootUrl();
    logo.textContent = 'vatsal.lol';
    logo.setAttribute('aria-label', 'Return to VATSAL.LOL home');

    document.body.appendChild(logo);
  }

  // Stub Public API: Game Completion Callback (no-op for V4.0.1 maintenance)
  window.VatsalLolGameComplete = function () {
    // Recommendation system terminated.
  };

  // Initialize on DOM ready
  function init() {
    initBranding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
