// Thermometer Volume Controller ("🌡️")
// Drag the red mercury bulb line up and down to change temperature & volume.

(function() {
  let containerElement = null;
  let mercuryEl = null;
  let currentVolume = 63;
  let apiRef = null;
  let isDragging = false;

  const trackTop = 40;
  const trackBottom = 190;
  const trackHeight = trackBottom - trackTop;

  function playTemperatureSwell(pct = 0.5) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    // As temperature rises, pitch rises!
    const freq = 120 + (pct * 600);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq + 40, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.start(); osc.stop(audioCtx.currentTime + 0.08);
  }

  function playClick() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updateMercuryUI() {
    if (mercuryEl) {
      const height = (currentVolume / 100) * trackHeight;
      mercuryEl.setAttribute('y', trackBottom - height);
      mercuryEl.setAttribute('height', height + 8); // overlap with bottom bulb
    }
    const valDisp = containerElement.querySelector('#thermometer-val');
    if (valDisp) {
      valDisp.textContent = `${currentVolume}°C`;
    }
  }

  function handlePosition(clientY) {
    const svg = containerElement.querySelector('.therm-svg');
    const rect = svg.getBoundingClientRect();
    const y = (clientY - rect.top) * (240 / rect.height);
    
    let pct = (trackBottom - y) / trackHeight;
    pct = Math.max(0, Math.min(1, pct));
    const newVol = Math.round(pct * 100);

    if (newVol !== currentVolume) {
      currentVolume = newVol;
      updateMercuryUI();
      if (Math.random() < 0.2) {
        playTemperatureSwell(pct);
      }
      if (apiRef) {
        apiRef.setVolume(newVol / 100);
      }
    }
  }

  function onMouseDown(e) {
    isDragging = true;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    handlePosition(clientY);
    playClick();
    if (e.cancelable) e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    handlePosition(clientY);
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      playClick();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.thermometer = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      container.innerHTML = `
        <div class="thermometer-container" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; gap:20px;">
          <!-- Left side graphic display -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <span style="font-size:1.8rem; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🔥</span>
            <span id="thermometer-val" style="font-family:'JetBrains Mono', monospace; font-size:1.5rem; font-weight:bold; color:#ff4a4a;">${currentVolume}°C</span>
            <span style="font-size:1.8rem; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">❄️</span>
          </div>

          <!-- Glass Thermometer SVG -->
          <svg class="therm-svg" viewBox="0 0 100 240" style="width:100px; height:240px; cursor:pointer;">
            <defs>
              <linearGradient id="bulb-grad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#ff7f7f" />
                <stop offset="70%" stop-color="#ff1a1a" />
                <stop offset="100%" stop-color="#b30000" />
              </linearGradient>
              <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.02)" />
                <stop offset="30%" stop-color="rgba(255,255,255,0.15)" />
                <stop offset="70%" stop-color="rgba(255,255,255,0.02)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0.06)" />
              </linearGradient>
            </defs>

            <!-- Outer glass casing -->
            <rect x="42" y="20" width="16" height="180" rx="8" fill="url(#glass-grad)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
            <circle cx="50" cy="200" r="18" fill="url(#glass-grad)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />

            <!-- Inner channel casing -->
            <rect x="46" y="30" width="8" height="162" rx="4" fill="rgba(0,0,0,0.25)" />

            <!-- Red mercury filling -->
            <rect id="mercury-fill" x="47" y="${trackBottom}" width="6" height="8" fill="url(#bulb-grad)" />
            <circle cx="50" cy="200" r="13" fill="url(#bulb-grad)" />
            
            <!-- White highlight reflection -->
            <circle cx="46" cy="196" r="3" fill="#fff" opacity="0.3" />
            <line x1="45" y1="35" x2="45" y2="180" stroke="#fff" stroke-width="0.8" opacity="0.12" />
          </svg>
        </div>
      `;

      mercuryEl = container.querySelector('#mercury-fill');

      const svg = container.querySelector('.therm-svg');
      svg.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      svg.addEventListener('touchstart', onMouseDown, { passive: false });
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);

      updateMercuryUI();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        updateMercuryUI();
      }
    },

    destroy() {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      containerElement = null;
      mercuryEl = null;
      apiRef = null;
    }
  };
})();
