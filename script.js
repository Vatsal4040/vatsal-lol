(function(){
    const games = [
    { slug: "2048", title: "2048" },
    { slug: "8bit-lab", title: "8-Bit Lab" },
    { slug: "adjustme", title: "Adjust Me" },
    { slug: "bubbles", title: "Bubbles" },
    { slug: "bugsmash", title: "Bug Smash" },
    { slug: "can-you-guess-indian-mom", title: "Can You Guess Indian Mom?" },
    { slug: "chaos", title: "Chaos" },
    { slug: "checklist", title: "Checklist" },
    { slug: "draw-a-circle", title: "Draw a Circle" },
    { slug: "emojis-2-movies", title: "Emojis 2 Movies" },
    { slug: "everything-is-progressing", title: "Everything Is Processing" },
    { slug: "flash-memory", title: "Flash Memory" },
    { slug: "focus", title: "Focus" },
    { slug: "future-timeline", title: "Future Timeline" },
    { slug: "guess-the-lie", title: "Guess the Lie" },
    { slug: "hardword", title: "HardWord" },
    { slug: "how_many", title: "How Many" },
    { slug: "jokes-if-you-handle", title: "JOKES If You Handle" },
    { slug: "lets-settle", title: "Let's Settle" },
    { slug: "luckorpredict", title: "Midnight Oracle (Luck or Predict)" },
    { slug: "not_scary", title: "This Is Not A Jump Scare" },
    { slug: "mastermind", title: "Mastermind" },
    { slug: "memories", title: "Memories" },
    { slug: "memory-tiles", title: "Memory Tiles" },
    { slug: "onelightday", title: "One Light Day" },
    { slug: "paddleclub", title: "Paddle Club" },
    { slug: "snake", title: "Snake" },
    { slug: "soundbar", title: "Sound Bar" },
    { slug: "spend-bill-gates-money", title: "Spend Bill Gates Money" },
    { slug: "spot", title: "Spot" },
    { slug: "standing", title: "Standing" },
    { slug: "stick_fighter", title: "Stick Fighter" },
    { slug: "sudoku", title: "Sudoku" },
    { slug: "tower-of-hanoi", title: "Tower of Hanoi" },
    { slug: "under-limit", title: "Under Limit" },
    { slug: "which-number", title: "Which Number" },
    { slug: "wordle", title: "WORDLLE" },
    { slug: "would-you-press-the-button", title: "Would You Press The Button" },
    { slug: "xo", title: "XO" },
    { slug: "your-life-in-numbers", title: "Your Life In Numbers" }
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

  function init() {
    document.body.className = 'view-grid';

    renderGrid();
    setupDateTime();
    setupFlash();
    setupContact();
    setupSearch();
    startFakeViewerFluctuation();
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

  function filterGames(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('#traditionalGrid .t-card');
    const noResults = document.getElementById('noResultsMessage');
    let matchCount = 0;

    games.forEach((game, index) => {
      const card = cards[index];
      if (!card) return;

      if (!q || game.title.toLowerCase().includes(q)) {
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
    games.forEach((game, i) => {
        const card = document.createElement('div');
        card.className = 't-card';
        const isCritical = i < 3;
        const lazyAttr = isCritical ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
        card.innerHTML = `<img src="assets/thumbnails/${game.slug}.webp" alt="${game.title}" width="320" height="180"${lazyAttr} onerror="this.src='assets/logo.png'">`;
        card.onclick = () => window.location.href = `./games/${game.slug}/`;
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