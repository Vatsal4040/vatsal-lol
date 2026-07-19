(function(){
  const games = [
    { slug: "2048", title: "2048" },
    { slug: "8bit-lab", title: "8-Bit Lab" },
    { slug: "adjustme", title: "Adjust Me" },
    { slug: "bubbles", title: "Bubbles" },
    { slug: "bugsmash", title: "Bug Smash" },
    { slug: "can-you-guess-indian-mom", title: "Can You Guess Indian Mom?" },
    { slug: "chaotic-fortune-teller", title: "Chaotic Fortune Teller" },
    { slug: "checklist", title: "Checklist" },
    { slug: "draw-a-circle", title: "Draw a Circle" },
    { slug: "emojis-2-movies", title: "Emojis 2 Movies" },
    { slug: "everything-is-progressing", title: "Everything Is Processing" },
    { slug: "flash-memory", title: "Flash Memory" },
    { slug: "focus", title: "Focus" },
    { slug: "future-timeline", title: "Future Timeline" },
    { slug: "guess-the-lie", title: "Guess the Lie" },
    { slug: "hardword", title: "HardWord" },
    { slug: "jokes-if-you-handle", title: "JOKES If You Handle" },
    { slug: "lets-settle", title: "Let's Settle" },
    { slug: "luckorpredict", title: "Luck or Predict" },
    { slug: "not_scary", title: "This Is Not A Jump Scare" },
    { slug: "mastermind", title: "Mastermind" },
    { slug: "memory-tiles", title: "Memory Tiles" },
    { slug: "onelightday", title: "One Light Day" },
    { slug: "paddleclub", title: "Paddle Club" },
    { slug: "snake", title: "Snake" },
    { slug: "soundbar", title: "Sound Bar" },
    { slug: "spend-bill-gates-money", title: "Spend Bill Gates Money" },
    { slug: "spot", title: "Spot" },
    { slug: "stacking", title: "Stacking" },
    { slug: "standing", title: "Standing" },
    { slug: "sudoku", title: "Sudoku" },
    { slug: "tetris", title: "Tetris" },
    { slug: "tower-of-hanoi", title: "Tower of Hanoi" },
    { slug: "under-limit", title: "Under Limit" },
    { slug: "which-number", title: "Which Number" },
    { slug: "wordle", title: "WORDLLE" },
    { slug: "would-you-press-the-button", title: "Would You Press The Button" },
    { slug: "xo", title: "XO" },
    { slug: "your-life-in-numbers", title: "Your Life In Numbers" }
  ];

 // Pre-defined Handcrafted Layout (Desktop: Optimized Spacing)
  const coordinates = [
    {x: 50, y: 48}, {x: 40, y: 40}, {x: 60, y: 40}, {x: 40, y: 56}, {x: 60, y: 56},
    {x: 50, y: 30}, {x: 50, y: 66}, {x: 30, y: 48}, {x: 70, y: 48}, {x: 30, y: 32},
    {x: 70, y: 32}, {x: 30, y: 64}, {x: 70, y: 64}, {x: 50, y: 15}, {x: 50, y: 81},
    {x: 20, y: 48}, {x: 80, y: 48}, {x: 18, y: 25}, {x: 82, y: 25}, {x: 18, y: 71},
    {x: 82, y: 71}, {x: 10, y: 48}, {x: 90, y: 48}, {x: 40, y: 18}, {x: 60, y: 18},
    {x: 40, y: 78}, {x: 60, y: 78}, {x: 28, y: 12}, {x: 72, y: 12}, {x: 28, y: 84},
    {x: 72, y: 84}, {x: 10, y: 15}, {x: 90, y: 81}
  ];
 // Handcrafted Mobile Fixed Layout (Portrait optimized, no overlap)
  const mobileFixedCoordinates = [
    {x: 50, y: 47}, {x: 22, y: 41}, {x: 78, y: 41}, {x: 22, y: 54}, {x: 78, y: 54},
    {x: 50, y: 33}, {x: 50, y: 61}, {x: 10, y: 47}, {x: 90, y: 47}, {x: 20, y: 28},
    {x: 80, y: 28}, {x: 20, y: 67}, {x: 80, y: 67}, {x: 50, y: 19}, {x: 50, y: 75},
    {x: 35, y: 12}, {x: 65, y: 12}, {x: 35, y: 82}, {x: 65, y: 82}, {x: 10, y: 12},
    {x: 90, y: 12}, {x: 10, y: 82}, {x: 90, y: 82}, {x: 42, y: 39}, {x: 58, y: 39},
    {x: 42, y: 55}, {x: 58, y: 55}, {x: 12, y: 28}, {x: 88, y: 28}, {x: 12, y: 67},
    {x: 88, y: 67}, {x: 30, y: 50}, {x: 70, y: 50}
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
    initLoneRipple();
  }

  function initLoneRipple() {
    const triggerRipple = () => {
      const isMonsoon = document.body.getAttribute('data-season') === 'monsoon';
      const isReduced = document.body.classList.contains('reduced-motion');
      
      if (isMonsoon && !isReduced) {
        const nodes = document.querySelectorAll('.game-node');
        if (nodes.length > 0) {
          const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
          randomNode.classList.add('ripple-active');
          
          setTimeout(() => {
            randomNode.classList.remove('ripple-active');
          }, 2000);
        }
      }
      
      const nextDelay = 20000 + Math.random() * 30000;
      setTimeout(triggerRipple, nextDelay);
    };
    
    triggerRipple();
  }

  function init() {
    // Temporarily simplify to Grid View only for Soft Release v3.9
    document.body.className = 'view-grid';

    renderGrid();
    setupDateTime();
    setupFlash();
    setupContact();
  }

  function setupDateTime() {
    const el = document.getElementById('statusArea');
    if (!el) return;
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

el.innerHTML = `
<div class="status-date">${dateStr}</div>
<div class="status-time">${timeStr}</div>
`;
    };
    update();
    setInterval(update, 10000);
  }

 function renderLauncher() {
    const container = document.getElementById('launcherNodes');
    container.innerHTML = ''; // Clear for resizing if needed
    
    const isMobile = window.innerWidth <= 768;
    const activeCoords = isMobile ? mobileFixedCoordinates : coordinates;
    const floatAmount = isMobile ? '2px' : '5px';

    games.forEach((game, i) => {
        const node = document.createElement('div');
        node.className = 'game-node';
        node.setAttribute('data-title', game.title);
        
        const pos = activeCoords[i] || {x: Math.random()*80 + 10, y: Math.random()*80+10};
        node.style.left = `${pos.x}%`;
        node.style.top = `${pos.y}%`;
        
        const dur = 3 + Math.random() * 2;
        const delay = Math.random() * -5;
        node.style.animation = `floatNode${isMobile ? 'Mobile' : ''} ${dur}s ease-in-out ${delay}s infinite`;

        const isCritical = i < 3;
        const lazyAttr = isCritical ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
        node.innerHTML = `<img src="assets/thumbcircle/${game.slug}.webp" alt="${game.title}" width="90" height="90"${lazyAttr} onerror="this.src='assets/logo.png'">`;
        node.onclick = () => window.location.href = `./games/${game.slug}/`;
        container.appendChild(node);
    });
  }

  // Handle mobile resize/orientation
  window.addEventListener('resize', () => {
    if (document.body.classList.contains('view-launcher')) renderLauncher();
  });

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

function setupToggle() {
    const btnL = document.getElementById('showLauncher');
    const btnG = document.getElementById('showGrid');

    // Sync active state on load
    if (document.body.classList.contains('view-grid')) {
        btnG.classList.add('active');
        btnL.classList.remove('active');
    }

    btnL.onclick = () => {
        if (window.innerWidth < 768) return;
        document.body.className = 'view-launcher';
        btnL.classList.add('active'); btnG.classList.remove('active');
    };
    btnG.onclick = () => {
        document.body.className = 'view-grid';
        btnG.classList.add('active'); btnL.classList.remove('active');
    };
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

// Floating Keyframes
const style = document.createElement('style');
style.textContent = `
@keyframes floatNode {
    0%, 100% { transform: translate(0,0); }
    50% { transform: translate(0, -5px); }
    }
@keyframes floatNodeMobile {
    0%, 100% { transform: translate(0,0); }
    50% { transform: translate(0, -1.5px); }
}`;
document.head.appendChild(style);