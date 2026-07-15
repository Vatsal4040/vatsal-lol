// Safe Combination Dial Controller ("🔐")
// Drag the dial wheel clockwise/counter-clockwise. Volume follows rotation. Plays satisfying click ticks.

(function() {
  let containerElement = null;
  let dialEl = null;
  let textEl = null;
  let apiRef = null;

  let isDragging = false;
  let currentVolume = 63;
  
  let currentRotation = 0; // degrees
  let lastAngle = 0;

  const dialCenter = { x: 220, y: 110 };

  function playTickSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.015);
    
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);
    osc.start(); osc.stop(audioCtx.currentTime + 0.015);
  }

  function getAngle(clientX, clientY, rect) {
    const x = (clientX - rect.left) * (440 / rect.width) - dialCenter.x;
    const y = (clientY - rect.top) * (240 / rect.height) - dialCenter.y;
    return Math.atan2(y, x);
  }

  function handleMouseDown(e) {
    const rect = dialEl.parentNode.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    isDragging = true;
    lastAngle = getAngle(clientX, clientY, rect);
    dialEl.style.cursor = 'grabbing';
    playTickSound();
    if (e.cancelable) e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const rect = dialEl.parentNode.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const angle = getAngle(clientX, clientY, rect);
    let delta = angle - lastAngle;

    if (delta > Math.PI) {
      delta -= Math.PI * 2;
    } else if (delta < -Math.PI) {
      delta += Math.PI * 2;
    }

    const deltaDegrees = delta * (180 / Math.PI);
    
    // Accumulate total rotation
    const nextRotation = Math.max(0, Math.min(360, currentRotation + deltaDegrees));
    
    // Check if we passed a 1% tick interval (3.6 degrees)
    const oldStep = Math.floor(currentRotation / 3.6);
    const newStep = Math.floor(nextRotation / 3.6);

    if (oldStep !== newStep) {
      playTickSound();
    }

    currentRotation = nextRotation;
    currentVolume = Math.round(currentRotation / 3.6);

    if (dialEl) {
      dialEl.style.transform = `rotate(${currentRotation}deg)`;
    }

    if (textEl) {
      textEl.textContent = `${currentVolume}%`;
    }

    if (apiRef) {
      apiRef.setVolume(currentVolume / 100);
    }

    lastAngle = angle;
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      if (dialEl) dialEl.style.cursor = 'grab';
      playTickSound();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.safe = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      currentRotation = currentVolume * 3.6;

      container.innerHTML = `
        <div class="dj-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;">
          <svg viewBox="0 0 440 220" style="width:100%; height:200px;">
            <defs>
              <linearGradient id="metal-grad-safe" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8a8a9e" />
                <stop offset="35%" stop-color="#4e4e5e" />
                <stop offset="50%" stop-color="#b8b8cc" />
                <stop offset="65%" stop-color="#3b3b47" />
                <stop offset="100%" stop-color="#6e6e7d" />
              </linearGradient>
            </defs>

            <!-- Steel Safe Panel plate background -->
            <rect x="10" y="10" width="420" height="200" rx="8" fill="#181822" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
            
            <!-- Dial ticks border -->
            <circle cx="${dialCenter.x}" cy="${dialCenter.y}" r="75" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3" />
            
            <!-- Dial Spokes ticking lines -->
            ${Array(20).fill(0).map((_, i) => {
              const ang = (i * 18) * (Math.PI / 180);
              const x1 = dialCenter.x + Math.cos(ang) * 72;
              const y1 = dialCenter.y + Math.sin(ang) * 72;
              const x2 = dialCenter.x + Math.cos(ang) * 78;
              const y2 = dialCenter.y + Math.sin(ang) * 78;
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />`;
            }).join('')}

            <!-- Safe Combination Wheel Dial -->
            <g id="safe-dial-wheel" style="cursor: grab; transform-origin: ${dialCenter.x}px ${dialCenter.y}px; transform: rotate(${currentRotation}deg);">
              <circle cx="${dialCenter.x}" cy="${dialCenter.y}" r="64" fill="url(#metal-grad-safe)" stroke="#111" stroke-width="2" />
              <circle cx="${dialCenter.x}" cy="${dialCenter.y}" r="45" fill="none" stroke="#222" stroke-width="1" />
              
              <!-- Indicator pointer notch line -->
              <line x1="${dialCenter.x}" y1="${dialCenter.y - 64}" x2="${dialCenter.x}" y2="${dialCenter.y - 45}" stroke="#ff4a4a" stroke-width="3" stroke-linecap="round" />
              
              <!-- Circular grip holes -->
              <circle cx="${dialCenter.x}" cy="${dialCenter.y - 25}" r="7" fill="#1b1b22" />
              <circle cx="${dialCenter.x}" cy="${dialCenter.y + 25}" r="7" fill="#1b1b22" />
              <circle cx="${dialCenter.x - 25}" cy="${dialCenter.y}" r="7" fill="#1b1b22" />
              <circle cx="${dialCenter.x + 25}" cy="${dialCenter.y}" r="7" fill="#1b1b22" />
              
              <!-- Center bolt cap -->
              <circle cx="${dialCenter.x}" cy="${dialCenter.y}" r="15" fill="#222" />
            </g>
            
            <!-- Red fixed pointer notch at the top -->
            <polygon points="${dialCenter.x},${dialCenter.y - 82} ${dialCenter.x - 5},${dialCenter.y - 92} ${dialCenter.x + 5},${dialCenter.y - 92}" fill="#ff4a4a" />
          </svg>
          
          <div id="safe-dial-text" style="font-family:'JetBrains Mono', monospace; font-size:1.6rem; font-weight:bold; color:var(--accent-color); text-shadow:0 0 6px var(--accent-color);">${currentVolume}%</div>
        </div>
      `;

      dialEl = container.querySelector('#safe-dial-wheel');
      textEl = container.querySelector('#safe-dial-text');

      dialEl.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      dialEl.addEventListener('touchstart', handleMouseDown, { passive: false });
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isDragging) {
          currentRotation = value * 3.6;
          if (dialEl) {
            dialEl.style.transform = `rotate(${currentRotation}deg)`;
          }
          if (textEl) {
            textEl.textContent = `${currentVolume}%`;
          }
        }
      }
    },

    destroy() {
      isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      containerElement = null;
      dialEl = null;
      textEl = null;
      apiRef = null;
    }
  };
})();
