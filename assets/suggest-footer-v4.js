/* VATSAL.LOL V4 — Recommendation Footer Component */
(function () {
  'use strict';

  let footerContainer = null;
  let gameList = [];

  function getCurrentSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const gameIdx = parts.indexOf('games');
    if (gameIdx !== -1 && parts[gameIdx + 1]) {
      return parts[gameIdx + 1];
    }
    return '';
  }

  function pickTwoRandomGames(allGames, currentSlug) {
    const filtered = allGames.filter(g => g.slug !== currentSlug);
    if (filtered.length <= 2) return filtered;
    
    // Pseudo-random shuffle based on current date to give stable recommendations per session
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }

  function renderFooter(recommendedGames) {
    if (document.getElementById('vatsal-v4-footer')) return;

    footerContainer = document.createElement('footer');
    footerContainer.id = 'vatsal-v4-footer';
    footerContainer.className = 'vatsal-footer-v4';
    footerContainer.setAttribute('role', 'contentinfo');

    const heading = document.createElement('h3');
    heading.className = 'vatsal-footer-v4-heading';
    heading.textContent = 'YOU MAY LIKE';
    footerContainer.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'vatsal-footer-v4-grid';

    recommendedGames.forEach(game => {
      const card = document.createElement('a');
      card.className = 'vatsal-footer-v4-card';
      card.href = `/games/${game.slug}/`;
      
      const img = document.createElement('img');
      img.className = 'vatsal-footer-v4-thumb';
      img.src = `/${game.thumbnail}`;
      img.alt = game.title;
      img.loading = 'lazy';

      const title = document.createElement('span');
      title.className = 'vatsal-footer-v4-title';
      title.textContent = game.title;

      card.appendChild(img);
      card.appendChild(title);
      grid.appendChild(card);
    });

    footerContainer.appendChild(grid);
    document.body.appendChild(footerContainer);
  }

  function initFooter() {
    fetch('/assets/data/games.json')
      .then(res => res.json())
      .then(data => {
        gameList = data;
        const currentSlug = getCurrentSlug();
        const choices = pickTwoRandomGames(gameList, currentSlug);
        renderFooter(choices);

        window.VatsalLolShowFooter = function () {
          if (footerContainer) {
            footerContainer.classList.add('v4-footer-visible');
            footerContainer.scrollIntoView({ behavior: 'smooth' });
          }
        };

        document.dispatchEvent(new CustomEvent('VatsalFooterReady'));
      })
      .catch(err => {
        console.warn('VATSAL V4 Footer: Failed to load games.json', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();
