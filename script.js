(function(){
  const games = [
    { slug: "2048", title: "2048" },
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
    { slug: "guess-the-lie", title: "Guess the Lie" },
    { slug: "hardword", title: "HardWord" },
    { slug: "jokes-if-you-handle", title: "JOKES If You Handle" },
    { slug: "lets-settle", title: "Let's Settle" },
    { slug: "mastermind", title: "Mastermind" },
    { slug: "memory-tiles", title: "Memory Tiles" },
    { slug: "onelightday", title: "One Light Day" },
    { slug: "paddleclub", title: "Paddle Club" },
    { slug: "snake", title: "Snake" },
    { slug: "spend-bill-gates-money", title: "Spend Bill Gates Money" },
    { slug: "spot", title: "Spot" },
    { slug: "stacking", title: "Stacking" },
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

 function init() {
    if (window.innerWidth < 768) {
        document.body.className = 'view-grid';
    } else {
        renderLauncher();
        setupDateTime(); // Desktop Only
    }

    renderGrid();
    setupToggle();
    setupFlash();
    setupMeteors();
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

        node.innerHTML = `<img src="assets/thumbcircle/${game.slug}.webp" onerror="this.src='assets/logo.png'">`;
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
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 't-card';
        card.innerHTML = `<img src="assets/thumbnails/${game.slug}.webp" onerror="this.src='assets/logo.png'">`;
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
    let isRunning = false;

    mascot.onclick = () => {
        if(isRunning) return;
        isRunning = true;
        
        // Hide stationary mascot and trigger sprint
        img.style.opacity = '0';
        sprint.classList.add('running');
        
        setTimeout(() => {
            sprint.classList.remove('running');
            // Keep hidden for 4 seconds
            setTimeout(() => {
                img.style.opacity = '1';
                isRunning = false;
            }, 4000);
        }, 800);
    };

    // Tiny idle movements
    setInterval(() => {
        if(!isRunning) img.style.transform = `translateY(${Math.sin(Date.now()/500)*2}px)`;
    }, 50);
  }

 function setupMeteors() {
    const container = document.getElementById('meteors');
    const interval = window.innerWidth < 768 ? 25000 : 15000; // Less frequent on mobile
    
    setInterval(() => {
        const m = document.createElement('div');
        m.className = 'meteor';
        m.style.top = `${Math.random()*40}%`;
        container.appendChild(m);
        setTimeout(() => m.remove(), 1200);
    }, interval);
  }

  function setupContact() {
    const panel = document.getElementById('contactPanel');
    document.getElementById('contactBtn').onclick = () => panel.classList.add('active');
    document.getElementById('closePanel').onclick = () => panel.classList.remove('active');
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