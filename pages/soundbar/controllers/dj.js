// DJ Vinyl Controller ("💿")
// Spin record clockwise to turn up volume, counter-clockwise to turn down.
// Features momentum physics: releasing the record keeps it spinning briefly with friction.

(function() {
  let containerElement = null;
  let vinylEl = null;
  let currentVolume = 63;
  let apiRef = null;

  let isDragging = false;
  let lastAngle = 0;
  let lastTime = 0;
  let currentRotation = 0;

  // Inertia momentum state
  let spinVelocity = 0; // degrees per frame
  const friction = 0.965; // inertia deceleration factor
  let animFrameId = null;

  const deckCenter = { x: 220, y: 120 };

  let audioCtx = null;
  let noiseBuffer = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    audioCtx = new AudioContextClass();
    const bufferSize = audioCtx.sampleRate * 1.5;
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  function playDJScratch(direction = 1) {
    initLocalAudio();
    if (!audioCtx || !noiseBuffer) return;

    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    const noiseGain = audioCtx.createGain();
    
    osc.connect(oscGain); oscGain.connect(audioCtx.destination);
    src.connect(filter); filter.connect(noiseGain); noiseGain.connect(audioCtx.destination);

    const duration = 0.15;
    const t = audioCtx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(direction > 0 ? 100 : 180, t);
    osc.frequency.exponentialRampToValueAtTime(direction > 0 ? 220 : 80, t + duration);
    oscGain.gain.setValueAtTime(0.0, t);
    oscGain.gain.linearRampToValueAtTime(0.12, t + 0.03);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.setValueAtTime(1.5, t);
    noiseGain.gain.setValueAtTime(0.0, t);
    noiseGain.gain.linearRampToValueAtTime(0.04, t + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t); osc.stop(t + duration);
    src.start(t, Math.random() * 1.0); src.stop(t + duration);
  }

  function playClick() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(700, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function getAngle(clientX, clientY, rect) {
    const x = (clientX - rect.left) * (440 / rect.width) - deckCenter.x;
    const y = (clientY - rect.top) * (240 / rect.height) - deckCenter.y;
    return Math.atan2(y, x);
  }

  function handleMouseDown(e) {
    const rect = vinylEl.parentNode.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    isDragging = true;
    spinVelocity = 0; // reset momentum on click
    lastAngle = getAngle(clientX, clientY, rect);
    lastTime = Date.now();
    vinylEl.style.cursor = 'grabbing';
    playClick();
    if (e.cancelable) e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const rect = vinylEl.parentNode.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const angle = getAngle(clientX, clientY, rect);
    const now = Date.now();
    const dt = Math.max(1, now - lastTime);
    
    let delta = angle - lastAngle;

    if (delta > Math.PI) {
      delta -= Math.PI * 2;
    } else if (delta < -Math.PI) {
      delta += Math.PI * 2;
    }

    const deltaDegrees = delta * (180 / Math.PI);
    currentRotation += deltaDegrees;
    
    // Store drag speed for momentum calculation
    spinVelocity = deltaDegrees;

    if (vinylEl) {
      vinylEl.style.transform = `rotate(${currentRotation}deg)`;
    }

    const volChange = (deltaDegrees / 360) * 45;
    const newVol = Math.max(0, Math.min(100, currentVolume + volChange));

    if (newVol !== currentVolume) {
      currentVolume = newVol;
      
      if (Math.abs(deltaDegrees) > 1.8 && Math.random() < 0.28) {
        playDJScratch(deltaDegrees > 0 ? 1 : -1);
      }

      if (apiRef) {
        apiRef.setVolume(currentVolume / 100);
      }
    }

    lastAngle = angle;
    lastTime = now;
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      if (vinylEl) vinylEl.style.cursor = 'grab';
      playClick();
    }
  }

  function updateInertia() {
    if (!isDragging && Math.abs(spinVelocity) > 0.05) {
      spinVelocity *= friction;
      currentRotation += spinVelocity;

      if (vinylEl) {
        vinylEl.style.transform = `rotate(${currentRotation}deg)`;
      }

      const volChange = (spinVelocity / 360) * 45;
      const newVol = Math.max(0, Math.min(100, currentVolume + volChange));

      if (newVol !== currentVolume) {
        currentVolume = newVol;
        if (apiRef) {
          apiRef.setVolume(currentVolume / 100);
        }
      }
    }

    animFrameId = requestAnimationFrame(updateInertia);
  }

  window.controllers = window.controllers || {};
  window.controllers.dj = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      currentRotation = (currentVolume / 100) * 720;
      spinVelocity = 0;

      container.innerHTML = `
        <div class="dj-container">
          <svg class="dj-svg" viewBox="0 0 440 240">
            <defs>
              <radialGradient id="vinyl-shimmer" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
                <stop offset="45%" stop-color="rgba(0,0,0,0)" />
                <stop offset="55%" stop-color="rgba(0,0,0,0)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0.15)" />
              </radialGradient>
            </defs>

            <rect x="15" y="10" width="410" height="220" rx="10" fill="#1b1b22" stroke="rgba(255, 255, 255, 0.06)" stroke-width="2" />
            
            <g transform="translate(0, 0)">
              <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="92" fill="#111116" stroke="#222" stroke-width="3" />
              
              <g id="vinyl-record" style="cursor: grab; transform-origin: ${deckCenter.x}px ${deckCenter.y}px; transform: rotate(${currentRotation}deg);">
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="88" fill="#0d0d10" />
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="80" fill="none" stroke="#16161c" stroke-width="1" />
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="72" fill="none" stroke="#181822" stroke-width="1" />
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="64" fill="none" stroke="#14141a" stroke-width="1.5" />
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="56" fill="none" stroke="#1a1a24" stroke-width="1" />
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="48" fill="none" stroke="#16161e" stroke-width="1" />

                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="88" fill="url(#vinyl-shimmer)" pointer-events="none" />

                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="28" fill="var(--accent-color)" />
                <circle cx="${deckCenter.x}" cy="${deckCenter.y}" r="8" fill="#15151a" />
                <circle cx="${deckCenter.x + 18}" cy="${deckCenter.y - 18}" r="4" fill="#ffffff" />
              </g>

              <path d="M 330 50 L 300 100 L 245 120" fill="none" stroke="#a0a0b5" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="237" y="114" width="12" height="11" rx="1" fill="#ff4a4a" style="transform-origin: 245px 120px; transform: rotate(18deg);" />
            </g>
          </svg>
        </div>
      `;

      vinylEl = container.querySelector('#vinyl-record');

      vinylEl.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      vinylEl.addEventListener('touchstart', handleMouseDown, { passive: false });
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);

      updateInertia();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isDragging) {
          currentRotation = (value / 100) * 720;
          if (vinylEl) {
            vinylEl.style.transform = `rotate(${currentRotation}deg)`;
          }
        }
      }
    },

    destroy() {
      isDragging = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      containerElement = null;
      vinylEl = null;
      apiRef = null;
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }
  };
})();
