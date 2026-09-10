// Space Invaders Volume Controller ("👾")
// 10 aliens appear. Click them to destroy them in 2 seconds. Leftover aliens determine the volume.
// Volume = (aliens_left) * 9 (or cap at 100% if 10 left).

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  let gameActive = false;
  let timeLeft = 2.0; // 2 seconds
  let lastTime = 0;
  
  let aliens = [];
  const totalAliens = 10;

  let audioCtx = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function playLaserSound() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    osc.start(); osc.stop(audioCtx.currentTime + 0.12);
  }

  function playExplosionSound() {
    initLocalAudio();
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    src.start();
  }

  function playTone(freq, duration, vol = 0.05) {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  }

  function spawnAliens() {
    aliens = [];
    for (let i = 0; i < totalAliens; i++) {
      aliens.push({
        id: i,
        x: 40 + Math.random() * 360,
        y: 40 + Math.random() * 120,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.2),
        vy: (Math.random() - 0.5) * 0.4,
        size: 16,
        alive: true,
        color: `hsl(${100 + i * 20}, 85%, 60%)`,
        wiggleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function startGame() {
    if (gameActive) return;
    spawnAliens();
    timeLeft = 2.0;
    gameActive = true;
    lastTime = performance.now();
    playTone(520, 0.1);
    setTimeout(() => playTone(660, 0.1), 100);
    setTimeout(() => playTone(780, 0.2), 200);

    const btn = containerElement.querySelector('#invaders-btn');
    if (btn) btn.textContent = "DEFEND IN PROGRESS...";
  }

  function stopGame() {
    gameActive = false;
    
    // Count alive aliens
    const aliveCount = aliens.filter(a => a.alive).length;
    
    // Volume = alive * 9 (cap 100% or use alive * 10)
    currentVolume = Math.min(100, aliveCount * 10); // Standard 10% increments feels slightly more predictable, but let's do exactly 9x if user requested!
    currentVolume = aliveCount * 9;
    if (aliveCount === 10) currentVolume = 100; // Let 10 left equal full 100% volume!

    if (apiRef) {
      apiRef.setVolume(currentVolume / 100);
    }

    // Play final success/fail chime
    if (aliveCount === 0) {
      // Perfect clear!
      playTone(880, 0.15, 0.08);
      setTimeout(() => playTone(1320, 0.3, 0.08), 150);
    } else {
      playTone(220, 0.3, 0.08);
    }

    const btn = containerElement.querySelector('#invaders-btn');
    if (btn) btn.textContent = "PLAY AGAIN 👾";

    const label = containerElement.querySelector('#invaders-label');
    if (label) {
      label.textContent = `Time's up! ${aliveCount} aliens left. Volume set to ${currentVolume}%.`;
    }
  }

  function updatePhysics(dt) {
    if (gameActive) {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        stopGame();
      }
    }

    aliens.forEach(alien => {
      if (!alien.alive) return;
      
      // Move
      alien.x += alien.vx;
      alien.y += alien.vy;
      alien.wiggleOffset += 0.08;

      // Bounce bounds
      if (alien.x < 15 || alien.x > 425) {
        alien.vx *= -1;
        alien.x = Math.max(15, Math.min(425, alien.x));
      }
      if (alien.y < 20 || alien.y > 170) {
        alien.vy *= -1;
        alien.y = Math.max(20, Math.min(170, alien.y));
      }
    });
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render retro grid/stars lines background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 440; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 200); ctx.stroke();
    }
    for (let j = 0; j < 200; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(440, j); ctx.stroke();
    }

    // Render aliens
    aliens.forEach(alien => {
      if (!alien.alive) return;

      ctx.fillStyle = alien.color;
      
      // Wiggle legs offset
      const wiggle = Math.sin(alien.wiggleOffset) * 2;

      // Draw pixelated alien shape
      const ax = alien.x;
      const ay = alien.y;
      const s = alien.size;

      ctx.beginPath();
      // Head / body block
      ctx.fillRect(ax - s/2, ay - s/2, s, s - 4);
      // Antennae
      ctx.fillRect(ax - s/2 + 2, ay - s/2 - 3, 2, 3);
      ctx.fillRect(ax + s/2 - 4, ay - s/2 - 3, 2, 3);
      // Legs
      ctx.fillRect(ax - s/2 + wiggle, ay + s/2 - 4, 3, 4);
      ctx.fillRect(ax + s/2 - 3 - wiggle, ay + s/2 - 4, 3, 4);
      // Eyes (black)
      ctx.fillStyle = '#000000';
      ctx.fillRect(ax - 4, ay - 2, 2, 2);
      ctx.fillRect(ax + 2, ay - 2, 2, 2);
    });

    // Draw bottom defender ship (static visual)
    ctx.fillStyle = 'var(--accent-color)';
    ctx.beginPath();
    ctx.moveTo(220 - 15, 195);
    ctx.lineTo(220 + 15, 195);
    ctx.lineTo(220 + 8, 185);
    ctx.lineTo(220 - 8, 185);
    ctx.closePath();
    ctx.fill();

    // Laser nozzle
    ctx.fillRect(220 - 2, 178, 4, 8);

    // Draw timer overlay if active
    if (gameActive) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SHIELD DEPLETION IN: ${timeLeft.toFixed(2)}s`, 15, 20);

      // Simple life meter line
      ctx.fillStyle = 'var(--red)';
      ctx.fillRect(15, 26, (timeLeft / 2.0) * 120, 3);
    }

    // Loop
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    
    updatePhysics(dt);
    animFrameId = requestAnimationFrame(draw);
  }

  function handleCanvasClick(e) {
    if (!gameActive) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (440 / rect.width);
    const y = (clientY - rect.top) * (200 / rect.height);

    playLaserSound();

    // Check hit test
    for (let i = 0; i < aliens.length; i++) {
      const alien = aliens[i];
      if (alien.alive) {
        const dx = x - alien.x;
        const dy = y - alien.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < alien.size + 4) {
          alien.alive = false;
          playExplosionSound();
          break; // only hit one alien per click
        }
      }
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.spaceInvaders = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      gameActive = false;

      // Setup initial visual representation: number of aliens equals current volume divided by 10 (or 9)
      aliens = [];
      const count = currentVolume === 100 ? 10 : Math.round(currentVolume / 9);
      for (let i = 0; i < totalAliens; i++) {
        aliens.push({
          id: i,
          x: 60 + (i % 5) * 75,
          y: 40 + Math.floor(i / 5) * 45,
          vx: 0,
          vy: 0,
          size: 16,
          alive: i < count,
          color: `hsl(${100 + i * 20}, 85%, 60%)`,
          wiggleOffset: 0
        });
      }

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="invaders-canvas" class="ball-canvas" width="440" height="200" style="display:block; width:100%; height:200px; background:#050508; border-radius:6px; border:1.5px solid var(--border-color);"></canvas>
          
          <div id="invaders-label" class="ball-label" style="margin-top:6px;">Kill aliens! Remaining aliens will set the volume level.</div>
          
          <div class="chai-controls" style="margin-top:6px; width:100%; justify-content:center;">
            <button id="invaders-btn" class="chai-btn fill" style="padding: 6px 20px; font-size:0.75rem;">START DEFENCE 👾</button>
          </div>
        </div>
      `;

      canvas = container.querySelector('#invaders-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 200 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '200px';

      canvas.addEventListener('mousedown', handleCanvasClick);
      canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });

      container.querySelector('#invaders-btn').addEventListener('click', startGame);

      lastTime = performance.now();
      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!gameActive) {
          const count = value === 100 ? 10 : Math.round(value / 9);
          aliens.forEach((alien, idx) => {
            alien.alive = idx < count;
          });
        }
      }
    },

    destroy() {
      gameActive = false;
      cancelAnimationFrame(animFrameId);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
