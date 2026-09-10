(function(){
    const games = [
    { slug: "2048", title: "2048", type: "game" },
    { slug: "8bit-lab", title: "8-Bit Lab", type: "page" },
    { slug: "adjustme", title: "Adjust Me", type: "game" },
    { slug: "bubbles", title: "Bubbles", type: "game" },
    { slug: "bugsmash", title: "Bug Smash", type: "game" },
    { slug: "can-you-guess-indian-mom", title: "Can You Guess Indian Mom?", type: "game" },
    { slug: "chaos", title: "Chaos", type: "page" },
    { slug: "checklist", title: "Checklist", type: "page" },
    { slug: "draw-a-circle", title: "Draw a Circle", type: "page" },
    { slug: "emojis-2-movies", title: "Emojis 2 Movies", type: "game" },
    { slug: "everything-is-progressing", title: "Everything Is Processing", type: "page" },
    { slug: "flash-memory", title: "Flash Memory", type: "game" },
    { slug: "focus", title: "Focus", type: "game" },
    { slug: "future-timeline", title: "Future Timeline", type: "page" },
    { slug: "guess-the-lie", title: "Guess the Lie", type: "game" },
    { slug: "hardword", title: "HardWord", type: "game" },
    { slug: "how_many", title: "How Many", type: "page" },
    { slug: "lets-settle", title: "Let's Settle", type: "page" },
    { slug: "luckorpredict", title: "Midnight Oracle (Luck or Predict)", type: "game" },
    { slug: "not_scary", title: "This Is Not A Jump Scare", type: "page" },
    { slug: "mastermind", title: "Mastermind", type: "game" },
    { slug: "memories", title: "Memories", type: "page" },
    { slug: "memory-tiles", title: "Memory Tiles", type: "game" },
    { slug: "onelightday", title: "One Light Day", type: "page" },
    { slug: "paddleclub", title: "Paddle Club", type: "game" },
    { slug: "snake", title: "Snake", type: "game" },
    { slug: "soundbar", title: "Sound Bar", type: "page" },
    { slug: "spend-bill-gates-money", title: "Spend Bill Gates Money", type: "page" },
    { slug: "spot", title: "Spot", type: "game" },
    { slug: "standing", title: "Standing", type: "page" },
    { slug: "stick_fighter", title: "Stick Fighter", type: "game" },
    { slug: "sudoku", title: "Sudoku", type: "game" },
    { slug: "tower-of-hanoi", title: "Tower of Hanoi", type: "game" },
    { slug: "under-limit", title: "Under Limit", type: "game" },
    { slug: "which-number", title: "Which Number", type: "page" },
    { slug: "wordle", title: "WORDLLE", type: "game" },
    { slug: "would-you-press-the-button", title: "Would You Press The Button", type: "game" },
    { slug: "xo", title: "XO", type: "game" },
    { slug: "your-life-in-numbers", title: "Your Life In Numbers", type: "page" }
  ];
const LivingSkyState = {
    season: 'space',
    time: 'night',
    reducedMotion: false
  };

  function resolveAtmosphere() {
    const month = new Date().getMonth();
    // Monsoon in India: June (5) through September (8)
    // TODO: Current implementation assumes Indian seasonal calendar. 
    // Future versions may resolve seasons using user location/locale.
    if (month >= 5 && month <= 8) {
      return 'monsoon';
    }
    return 'space';
  }

  function resolveTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'sunset';
    if (hour >= 19 && hour < 24) return 'night';
    return 'latenight';
  }

  function checkDebugOverrides() {
    const params = new URLSearchParams(window.location.search);
    const debugSeason = params.get('debug-season');
    const debugTime = params.get('debug-time');
    
    if (debugSeason) {
      LivingSkyState.season = debugSeason;
      console.log(`[Living Sky Debug] Season overridden: ${debugSeason}`);
    }
    if (debugTime) {
      LivingSkyState.time = debugTime;
      console.log(`[Living Sky Debug] Time overridden: ${debugTime}`);
    }
  }

  function applyLivingSky(state) {
    document.body.setAttribute('data-season', state.season);
    document.body.setAttribute('data-time', state.time);
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    state.reducedMotion = mediaQuery.matches;
    
    if (state.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }

  function setupLivingSky() {
    LivingSkyState.season = resolveAtmosphere();
    LivingSkyState.time = resolveTimeOfDay();
    checkDebugOverrides();
    applyLivingSky(LivingSkyState);
  }
  let currentFakeCount = null;

  function updateFakeViewerCount() {
    try {
      const istDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const istHour = istDate.getHours();
      
      let min, max;
      if (istHour >= 18 && istHour < 22) {
        // Prime time IST (6 PM - 10 PM)
        min = 35;
        max = 100;
      } else {
        // Non-prime time
        min = 12;
        max = 45;
      }
      
      if (currentFakeCount === null || currentFakeCount < min || currentFakeCount > max) {
        currentFakeCount = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        const delta = Math.floor(Math.random() * 7) - 3;
        currentFakeCount = Math.max(min, Math.min(max, currentFakeCount + delta));
      }
      
      const countEl = document.getElementById('liveViewerCount');
      if (countEl) {
        countEl.textContent = currentFakeCount;
      }
    } catch (e) {
      console.warn("Failed to calculate fake visitor count:", e);
    }
  }

  function startFakeViewerFluctuation() {
    updateFakeViewerCount();
    const nextDelay = 3000 + Math.random() * 3000;
    setTimeout(startFakeViewerFluctuation, nextDelay);
  }

  let currentCategory = 'all';

  function init() {
    document.body.className = 'view-grid';

    renderGrid();
    setupDateTime();
    setupFlash();
    setupContact();
    setupSearch();
    setupCategoryFilter();
    startFakeViewerFluctuation();
  }

  function setupCategoryFilter() {
    const container = document.getElementById('viewCategoryContainer');
    const mobileBtn = document.getElementById('mobileViewToggleBtn');
    if (!container) return;

    if (mobileBtn) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const searchContainer = document.getElementById('searchContainer');
        if (searchContainer && searchContainer.classList.contains('search-active')) {
          const searchInput = document.getElementById('searchInput');
          searchContainer.classList.remove('search-active');
          if (searchInput) searchInput.value = '';
          filterGames('');
        }
        container.classList.toggle('mobile-open');
      });

      document.addEventListener('click', (e) => {
        if (container.classList.contains('mobile-open') && !container.contains(e.target) && !mobileBtn.contains(e.target)) {
          container.classList.remove('mobile-open');
        }
      });
    }

    const buttons = container.querySelectorAll('.view-cat-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = btn.getAttribute('data-category');
        if (cat) {
          currentCategory = cat;
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const searchInput = document.getElementById('searchInput');
          filterGames(searchInput ? searchInput.value : '');

          if (window.innerWidth <= 768) {
            container.classList.remove('mobile-open');
          }
        }
      });
    });
  }

  function setupDateTime() {
    const dateEl = document.getElementById('statusDate');
    const timeEl = document.getElementById('statusTime');
    if (!dateEl || !timeEl) return;
    const update = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).replace(",", ",");

        const timeStr = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        dateEl.textContent = dateStr;
        timeEl.textContent = timeStr;
    };
    update();
    setInterval(update, 10000);
  }

  function setupSearch() {
    const container = document.getElementById('searchContainer');
    const toggleBtn = document.getElementById('searchToggleBtn');
    const input = document.getElementById('searchInput');
    const closeBtn = document.getElementById('searchCloseBtn');
    
    if (!container || !toggleBtn || !input) return;

    const openSearch = () => {
      container.classList.add('search-active');
      const catContainer = document.getElementById('viewCategoryContainer');
      if (catContainer) catContainer.classList.remove('mobile-open');
      input.focus();
    };

    const closeSearch = () => {
      container.classList.remove('search-active');
      input.value = '';
      filterGames('');
    };

    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      if (container.classList.contains('search-active')) {
        closeSearch();
      } else {
        openSearch();
      }
    };

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeSearch();
      };
    }

    input.addEventListener('input', () => {
      filterGames(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    document.addEventListener('click', (e) => {
      if (container.classList.contains('search-active') && !container.contains(e.target) && !input.value.trim()) {
        closeSearch();
      }
    });
  }

  const priorityOrder = ["memories", "wordle", "your-life-in-numbers"];

  function getOrderedGames() {
    const priorityItems = [];
    priorityOrder.forEach(slug => {
      const item = games.find(g => g.slug === slug);
      if (item) priorityItems.push(item);
    });

    const remainingItems = games
      .filter(g => !priorityOrder.includes(g.slug))
      .sort((a, b) => a.slug.localeCompare(b.slug));

    return [...priorityItems, ...remainingItems];
  }

  function filterGames(query) {
    const q = (query || '').trim().toLowerCase();
    const cards = document.querySelectorAll('#traditionalGrid .t-card');
    const noResults = document.getElementById('noResultsMessage');
    let matchCount = 0;
    const orderedGames = getOrderedGames();

    orderedGames.forEach((game, index) => {
      const card = cards[index];
      if (!card) return;

      const matchesSearch = !q || game.title.toLowerCase().includes(q) || game.slug.toLowerCase().includes(q);
      const matchesCategory = currentCategory === 'all' || game.type === currentCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = '';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      if (matchCount === 0) {
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    }
  }

  function renderGrid() {
    const grid = document.getElementById('traditionalGrid');
    const orderedGames = getOrderedGames();
    orderedGames.forEach((game, i) => {
        const card = document.createElement('div');
        card.className = 't-card';
        const isCritical = i < 3;
        const lazyAttr = isCritical ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
        card.innerHTML = `<img src="assets/thumbnails/${game.slug}.webp" alt="${game.title}" width="320" height="180"${lazyAttr} onerror="this.src='assets/logo.png'">`;
        const folderPrefix = game.type === 'page' ? 'pages' : 'games';
        card.onclick = () => window.location.href = `./${folderPrefix}/${game.slug}/`;
        grid.appendChild(card);
    });
  }
  function setupFlash() {
    if (window.innerWidth < 768) return; // Completely skip for mobile
    
    const mascot = document.getElementById('flashMascot');
    const sprint = document.getElementById('fSprint');
    const img = document.getElementById('flashImg');
    const runningImg = sprint ? sprint.querySelector('.f-running-img') : null;
    const lightning = sprint ? sprint.querySelector('.f-lightning') : null;
    
    // Dynamically load heavy assets on desktop
    if (img && img.dataset.src) img.src = img.dataset.src;
    if (runningImg && runningImg.dataset.src) runningImg.src = runningImg.dataset.src;
    if (lightning) lightning.style.backgroundImage = "url('assets/data/flashlighting.png')";
    
    let isRunning = false;

    if (mascot) {
      mascot.onclick = () => {
          if(isRunning) return;
          isRunning = true;
          
          // Hide stationary mascot and trigger sprint
          if (img) img.style.opacity = '0';
          if (sprint) sprint.classList.add('running');
          
          setTimeout(() => {
              if (sprint) sprint.classList.remove('running');
              // Keep hidden for 4 seconds
              setTimeout(() => {
                  if (img) img.style.opacity = '1';
                  isRunning = false;
              }, 4000);
          }, 800);
      };
    }

    // Tiny idle movements
    setInterval(() => {
        if(!isRunning && img) img.style.transform = `translateY(${Math.sin(Date.now()/500)*2}px)`;
    }, 50);
  }

  function setupMeteors() {
    const container = document.getElementById('meteors');
    if (!container) return;
    
    const scheduleMeteor = () => {
      const isMonsoon = document.body.getAttribute('data-season') === 'monsoon';
      
      // Stars Rule: meteors are disabled during Monsoon
      if (isMonsoon) {
        setTimeout(scheduleMeteor, 15000);
        return;
      }
      
      const m = document.createElement('div');
      m.className = 'meteor';
      m.style.top = `${Math.random()*40}%`;
      container.appendChild(m);
      setTimeout(() => m.remove(), 1200);
      
      const baseInterval = window.innerWidth < 768 ? 25000 : 15000;
      const nextDelay = baseInterval + Math.random() * 5000;
      setTimeout(scheduleMeteor, nextDelay);
    };
    
    scheduleMeteor();
  }

  function setupContact() {
    const panel = document.getElementById('contactPanel');
    if (!panel) return;
    const triggers = document.querySelectorAll('.vatsal-v2-coffee-trigger');
    triggers.forEach(btn => {
        btn.onclick = () => panel.classList.add('active');
    });
    const closeBtn = document.getElementById('closePanel');
    if (closeBtn) closeBtn.onclick = () => panel.classList.remove('active');
    panel.onclick = (e) => { if(e.target === panel) panel.classList.remove('active'); };
  }

  init();
})();