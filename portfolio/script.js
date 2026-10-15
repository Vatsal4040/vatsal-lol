(() => {
  'use strict';

  /* =========================================================
     CODE RAIN — hero background
     ========================================================= */
  const codeRain = document.getElementById('codeRain');
  if (codeRain) {
    const snippets = [
      'const curiosity = true;', 'while (curiosity) {', '  learn();', '  build();', '  ship();', '}',
      'support++;', 'frontend++;', 'games++;', 'function solve(bug) {', '  return understand(bug);', '}',
      'export default Vatsal;', 'status: "shipping"', 'git commit -m "ship it"',
      'npm run build', 'console.log("built one game at a time");'
    ];
    for (let i = 0; i < 14; i++) {
      const el = document.createElement('div');
      el.className = 'code-rain__line';
      el.textContent = snippets[Math.floor(Math.random() * snippets.length)];
      el.style.left = Math.random() * 90 + '%';
      el.style.top  = Math.random() * 100 + '%';
      const dur = 18 + Math.random() * 14;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay   = (Math.random() * -dur) + 's';
      codeRain.appendChild(el);
    }
  }

  /* =========================================================
     TERMINAL — sequential check-in
     ========================================================= */
  const terminal = document.getElementById('heroTerminal');
  if (terminal) {
    const labels = ['Profile Loaded','Shopcircle Experience','Frontend Experience','VATSAL.LOL Active'];
    terminal.querySelectorAll('[data-line]').forEach((line, i) => {
      line.textContent = '';
      const isLast = i === labels.length - 1;
      setTimeout(() => {
        line.innerHTML =
          '<span class="hero__terminal-check">✓</span> ' + labels[i] +
          (isLast ? '<span class="hero__terminal-cursor" aria-hidden="true"></span>' : '');
        line.classList.add('is-typed');
      }, i * 260 + 200);
    });
  }

  /* =========================================================
     SCROLL PROGRESS BAR
     ========================================================= */
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const pct = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = (pct > 0 ? scrollY / pct * 100 : 0) + '%';
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* =========================================================
     GENERIC REVEAL (IntersectionObserver)
     ========================================================= */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* =========================================================
     STAT COUNTERS
     ========================================================= */
  const animateCounter = (el) => {
    const target = +el.dataset.count || 0, suffix = el.dataset.suffix || '';
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cntObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cntObs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__num').forEach(el => cntObs.observe(el));

  /* =========================================================
     JOURNEY MAP — sticky active milestone tracking
     ========================================================= */
  const panels = Array.from(document.querySelectorAll('.story-panel'));
  const mapItems = Array.from(document.querySelectorAll('.jmap__item'));
  const mapLines = Array.from(document.querySelectorAll('.jmap__line'));

  const setMilestone = (activeIndex) => {
    mapItems.forEach((item, i) => {
      if (i < activeIndex)       item.dataset.state = 'completed';
      else if (i === activeIndex) item.dataset.state = 'active';
      else                        item.dataset.state = 'upcoming';
    });
    // fill connector lines up to active
    mapLines.forEach((line, i) => {
      line.style.setProperty('--fill', i < activeIndex ? '1' : '0');
      // toggle inline via class
      if (i < activeIndex) line.classList.add('is-active');
      else line.classList.remove('is-active');
    });
  };

  // Use IntersectionObserver for each story panel
  const panelObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const idx = panels.indexOf(e.target);
      if (e.isIntersecting && idx !== -1) {
        e.target.classList.add('is-active');
        setMilestone(idx);
      } else {
        e.target.classList.remove('is-active');
      }
    });
  }, { threshold: 0.45 });

  panels.forEach(p => panelObs.observe(p));
  // init first
  if (mapItems.length) setMilestone(0);

  /* =========================================================
     TURNING POINT — cinematic two-phase animation
     The .turning wrapper is 260vh tall; section is sticky 100vh.
     We map scroll position within the wrapper to animation phases:
       0%–35%  → line-1 fades in
       35%–60% → line-1 holds
       60%–75% → line-1 exits, line-2 arrives
       75%–100%→ line-2 holds
     ========================================================= */
  const turningEl  = document.getElementById('turning-point');
  const line1      = document.getElementById('turningLine1');
  const line2      = document.getElementById('turningLine2');

  if (turningEl && line1 && line2) {
    const onTurnScroll = () => {
      const rect   = turningEl.getBoundingClientRect();
      const total  = turningEl.offsetHeight - innerHeight;
      // how far we've scrolled inside the wrapper (0–1)
      const ratio  = Math.max(0, Math.min(1, -rect.top / total));

      if (ratio < 0.35) {
        // Phase 1: line-1 fading in
        line1.classList.remove('t-show', 't-exit');
        line1.style.opacity = ratio / 0.35;
        line2.classList.remove('t-show');
      } else if (ratio < 0.60) {
        // Phase 2: line-1 solid
        line1.classList.add('t-show');
        line1.classList.remove('t-exit');
        line2.classList.remove('t-show');
      } else if (ratio < 0.75) {
        // Phase 3: line-1 exits, line-2 enters
        line1.classList.add('t-exit');
        line2.classList.add('t-show');
      } else {
        // Phase 4: line-2 solid
        line1.classList.add('t-exit');
        line2.classList.add('t-show');
      }
    };
    addEventListener('scroll', onTurnScroll, { passive: true });
    onTurnScroll();
  }

  /* =========================================================
     SKILL TREE — sequential unlock
     ========================================================= */
  const skillTree = document.querySelector('.skilltree');
  if (skillTree) {
    const nodes = Array.from(skillTree.querySelectorAll('.skilltree__node'));
    const links = Array.from(skillTree.querySelectorAll('.skilltree__link'));
    const activate = () => {
      nodes.forEach((n, i) => setTimeout(() => n.classList.add('is-active'), i * 220));
      links.forEach((l, i) => setTimeout(() => l.classList.add('is-active'), i * 220 + 110));
    };
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { activate(); } });
    }, { threshold: 0.4 }).observe(skillTree);
  }

  /* =========================================================
     GAME LIBRARY — dynamic card rendering
     ========================================================= */
  const GAMES = [
    { slug: 'guess-the-lie',              title: 'Guess the Lie',              hue: 260 },
    { slug: 'would-you-press-the-button', title: 'Would You Press the Button', hue: 340 },
    { slug: 'under-limit',                title: 'Under Limit',                hue: 200 },
    { slug: 'which-number',               title: 'Which Number',               hue: 290 },
    { slug: 'spend-bill-gates-money',     title: "Spend Bill Gates' Money",    hue: 50  },
    { slug: 'draw-a-circle',              title: 'Draw a Circle',              hue: 170 },
    { slug: 'flash-memory',               title: 'Flash Memory',               hue: 220 },
    { slug: 'tower-of-hanoi',             title: 'Tower of Hanoi',             hue: 30  },
    { slug: 'snake',                      title: 'Snake',                      hue: 150 },
    { slug: 'memory-tiles',               title: 'Memory Tiles',               hue: 270 },
    { slug: 'hardword',                   title: 'Hardword',                   hue: 160 },
    { slug: 'bubbles',                    title: 'Bubbles',                    hue: 190 },
    { slug: 'xo',                         title: 'XO',                         hue: 0   },
    { slug: '2048',                       title: '2048',                       hue: 35  },
    { slug: 'mastermind',                 title: 'Mastermind',                 hue: 250 },
    { slug: 'sudoku',                     title: 'Sudoku',                     hue: 210 },
    { slug: 'paddleclub',                 title: 'Paddle Club',                hue: 175 },
    { slug: 'bugsmash',                   title: 'Bug Smash',                  hue: 80  },
    { slug: 'adjustme',                   title: 'Adjust Me',                  hue: 45  },
    { slug: 'can-you-guess-indian-mom',   title: 'Guess Indian Mom',           hue: 20  },
    { slug: 'emojis-2-movies',            title: 'Emojis 2 Movies',            hue: 60  },
    { slug: 'your-life-in-numbers',       title: 'Your Life in Numbers',       hue: 230 },
    { slug: 'lets-settle',                title: "Let's Settle",               hue: 320 },
    { slug: 'checklist',                  title: 'Checklist',                  hue: 95  },
    { slug: 'wordle',                     title: 'Wordle',                     hue: 165 },
    { slug: 'memories',                   title: 'Memories',                   hue: 285 },
    { slug: 'not_scary',                  title: 'Jump Scare',                 hue: 15  },
    { slug: 'stick_fighter',              title: 'Stick Fighter',              hue: 350 },
    { slug: 'standing',                   title: 'Standing',                   hue: 105 },
    { slug: 'onelightday',                title: 'One Light Day',              hue: 45  },
    { slug: '8bit-lab',                   title: '8-Bit Lab',                  hue: 135 },
    { slug: 'how_many',                   title: 'How Many',                   hue: 195 },
    { slug: 'luckorpredict',              title: 'Luck or Predict',            hue: 265 },
    { slug: 'everything-is-progressing',  title: 'Everything is Progressing',  hue: 175 },
    { slug: 'chaos',                      title: 'Chaos',                      hue: 325 },
    { slug: 'future-timeline',            title: 'Future Timeline',            hue: 215 },
    { slug: 'soundbar',                   title: 'Sound Bar',                  hue: 75  },
    { slug: 'spot',                       title: 'Spot',                       hue: 55  },
    { slug: 'focus',                      title: 'Focus',                      hue: 185 }
  ];

  const BASE_URL = 'https://vatsal.lol/games/';
  const THUMB_URL = 'https://vatsal.lol/assets/thumbnails/';

  /**
   * Render 6 randomly-selected game cards into the grid.
   * Call this with a custom games array later if needed.
   * @param {Array} games - array of {slug, title, hue}
   */
  function renderFeaturedGames(games) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Shuffle and pick 6
    const shuffled = [...games].sort(() => Math.random() - 0.5).slice(0, 6);

    shuffled.forEach((game, i) => {
      const a = document.createElement('a');
      a.href = BASE_URL + game.slug + '/';
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'game-card reveal';
      a.dataset.reveal = 'up';
      a.setAttribute('aria-label', game.title);

      // Try thumbnail; fallback to gradient
      const img = document.createElement('img');
      img.className = 'game-card__thumb';
      img.alt = game.title;
      img.loading = 'lazy';
      img.src = THUMB_URL + game.slug + '.webp';
      img.onerror = () => {
        img.remove();
        const fb = document.createElement('div');
        fb.className = 'game-card__fallback';
        fb.style.setProperty('--hue', game.hue);
        fb.innerHTML = `<span class="game-card__fallback-emoji" aria-hidden="true">🎮</span>`;
        a.insertBefore(fb, a.firstChild);
      };

      const overlay = document.createElement('div');
      overlay.className = 'game-card__overlay';
      overlay.innerHTML = `<span class="game-card__title">${game.title}</span>`;

      a.appendChild(img);
      a.appendChild(overlay);
      grid.appendChild(a);
    });

    // Re-observe new cards for reveal animation
    grid.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  }

  // Initial render
  renderFeaturedGames(GAMES);
  // Expose for external use (vatsal-footer-v25.js or future scripts)
  window.renderFeaturedGames = renderFeaturedGames;
  window.VATSAL_GAMES = GAMES;

  /* =========================================================
     ACCORDION
     ========================================================= */
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel  = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });
  const syncPanels = () => {
    document.querySelectorAll('.accordion__trigger[aria-expanded="true"]').forEach(t => {
      t.nextElementSibling.style.maxHeight = t.nextElementSibling.scrollHeight + 'px';
    });
  };
  addEventListener('load', syncPanels);
  addEventListener('resize', syncPanels);

})();
