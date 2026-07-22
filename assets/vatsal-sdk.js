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

  // Load footer dependencies dynamically
  function loadFooterDependencies() {
    if (!document.getElementById('suggest-footer-v4-css')) {
      const link = document.createElement('link');
      link.id = 'suggest-footer-v4-css';
      link.rel = 'stylesheet';
      link.href = '/assets/suggest-footer-v4.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('suggest-footer-v4-js')) {
      const script = document.createElement('script');
      script.id = 'suggest-footer-v4-js';
      script.src = '/assets/suggest-footer-v4.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  // Single Public API: Game Completion Callback
  window.VatsalLolGameComplete = function () {
    if (typeof window.VatsalLolShowFooter === 'function') {
      window.VatsalLolShowFooter();
    } else {
      document.addEventListener('VatsalFooterReady', function () {
        window.VatsalLolShowFooter?.();
      }, { once: true });
    }
  };

  // Initialize on DOM ready
  function init() {
    initBranding();
    loadFooterDependencies();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
