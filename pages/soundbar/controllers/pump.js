// Air Pump Volume Controller ("🚲")
// Repeated pump strokes are required to build pressure. Valve releases pressure with a leakage sound.

(function() {
  let containerElement = null;
  let handleEl = null;
  let gaugeNeedleEl = null;
  let pressureFillEl = null;
  let valveEl = null;
  let valveStatusTextEl = null;
  let apiRef = null;

  let isDragging = false;
  let startY = 0;
  let currentVolume = 63;
  let isLocked = true;

  const minY = 50;
  const maxY = 170;
  let handleY = 170;
  let lastHandleY = 170;

  let decayInterval = null;

  // Web Audio Context variables for leak sound
  let audioCtx = null;
  let leakNoiseSource = null;
  let leakGainNode = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function playPumpSound() {
    initLocalAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    const bufferSize = audioCtx.sampleRate * 0.25;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.2);
    filter.Q.setValueAtTime(2.0, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    src.start();
  }

  function startLeakSound() {
    initLocalAudio();
    if (!audioCtx || leakNoiseSource) return;

    const bufferSize = audioCtx.sampleRate * 1.0;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    leakNoiseSource = audioCtx.createBufferSource();
    leakNoiseSource.buffer = buffer;
    leakNoiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, audioCtx.currentTime);

    leakGainNode = audioCtx.createGain();
    leakGainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
    leakGainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.15);

    leakNoiseSource.connect(filter);
    filter.connect(leakGainNode);
    leakGainNode.connect(audioCtx.destination);

    leakNoiseSource.start();
  }

  function stopLeakSound() {
    if (leakNoiseSource) {
      if (leakGainNode && audioCtx) {
        leakGainNode.gain.setValueAtTime(leakGainNode.gain.value, audioCtx.currentTime);
        leakGainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      }
      const tempSrc = leakNoiseSource;
      setTimeout(() => {
        try { tempSrc.stop(); } catch (e) {}
      }, 100);
      leakNoiseSource = null;
      leakGainNode = null;
    }
  }

  function playClick() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updatePumpUI() {
    if (handleEl) {
      handleEl.setAttribute('transform', `translate(0, ${handleY - maxY})`);
    }

    if (gaugeNeedleEl) {
      const angle = -120 + (currentVolume / 100) * 240;
      gaugeNeedleEl.style.transform = `rotate(${angle}deg)`;
    }

    if (pressureFillEl) {
      const fillHeight = (currentVolume / 100) * 120;
      pressureFillEl.setAttribute('height', fillHeight);
      pressureFillEl.setAttribute('y', 220 - fillHeight);
    }
  }

  function handleMouseDown(e) {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDragging = true;
    startY = clientY - handleY;
    playClick();
    if (e.cancelable) e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let newY = clientY - startY;
    newY = Math.max(minY, Math.min(maxY, newY));

    const deltaY = newY - lastHandleY;
    
    // We only increase volume when pushing the pump shaft down!
    if (deltaY > 1.8) {
      // 1.8 units of downward movement translates to a small volume boost
      // A full pump stroke (120px) now adds only 10% volume, requiring ~10 full pumps!
      const inject = (deltaY / (maxY - minY)) * 10;
      currentVolume = Math.min(100, currentVolume + inject);
      
      if (deltaY > 8 && Math.random() < 0.2) {
        playPumpSound();
      }
      
      if (apiRef) {
        apiRef.setVolume(currentVolume / 100);
      }
    }

    handleY = newY;
    lastHandleY = newY;
    updatePumpUI();
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      playClick();
    }
  }

  function toggleValve() {
    isLocked = !isLocked;
    playClick();
    
    if (valveEl) {
      valveEl.style.transform = isLocked ? 'rotate(0deg)' : 'rotate(-90deg)';
    }

    if (valveStatusTextEl) {
      valveStatusTextEl.textContent = isLocked ? "VALVE: LOCKED" : "VALVE: OPEN (LEAKING)";
      valveStatusTextEl.style.fill = isLocked ? "var(--accent-color)" : "var(--red)";
    }

    if (!isLocked && currentVolume > 0) {
      startLeakSound();
    } else {
      stopLeakSound();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.pump = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      isLocked = true;

      handleY = maxY;
      lastHandleY = maxY;

      container.innerHTML = `
        <div class="pump-container">
          <svg class="pump-svg" viewBox="0 0 440 260">
            <defs>
              <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#4e4e5e" />
                <stop offset="50%" stop-color="#8a8a9e" />
                <stop offset="100%" stop-color="#3b3b47" />
              </linearGradient>
              <linearGradient id="pressure-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#005a87" />
                <stop offset="50%" stop-color="#4CC9F0" />
                <stop offset="100%" stop-color="#0072b5" />
              </linearGradient>
            </defs>

            <g transform="translate(80, 5)">
              <rect id="pump-shaft" x="43" y="40" width="14" height="130" fill="#a0a0b5" />
              <g id="pump-handle" style="cursor: grab;">
                <rect x="10" y="30" width="80" height="14" rx="4" fill="#1b1b22" />
                <rect x="40" y="44" width="20" height="8" fill="#333" />
              </g>
              <rect x="15" y="235" width="70" height="12" rx="3" fill="#1b1b22" />
              <rect x="35" y="80" width="30" height="155" rx="2" fill="url(#metal-grad)" />
              <rect x="38" y="82" width="24" height="151" fill="rgba(255,255,255,0.04)" />
            </g>

            <path d="M 130 240 Q 200 270 250 220" fill="none" stroke="#1b1b22" stroke-width="7" stroke-linecap="round" />

            <g transform="translate(250, 20)">
              <rect x="25" y="100" width="50" height="120" rx="5" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="2" />
              <rect id="pressure-fill" x="27" y="220" width="46" height="0" rx="3" fill="url(#pressure-grad)" style="transition: height 0.05s ease;" />
              <circle cx="50" cy="50" r="35" fill="#1c1c24" stroke="rgba(255, 255, 255, 0.1)" stroke-width="2.5" />
              <path d="M 24 60 A 26 26 0 1 1 76 60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3.5" stroke-linecap="round" />
              <circle cx="50" cy="50" r="2" fill="#fff" />
              <line x1="50" y1="24" x2="50" y2="28" stroke="#ff4a4a" stroke-width="2" />
              <line id="gauge-needle" x1="50" y1="50" x2="50" y2="28" stroke="#ff4a4a" stroke-width="2" stroke-linecap="round" style="transform-origin: 50px 50px; transition: transform 0.1s cubic-bezier(0.1, 0.8, 0.3, 1);" />

              <g id="pump-valve" style="cursor: pointer; transform-origin: 90px 160px; transition: transform 0.3s ease;">
                <rect x="75" y="150" width="10" height="20" fill="url(#metal-grad)" />
                <rect x="85" y="140" width="10" height="40" rx="3" fill="#ff4a4a" />
                <circle cx="90" cy="160" r="4" fill="#333" />
              </g>
              <text id="valve-status-text" x="50" y="240" text-anchor="middle" font-family="monospace" font-size="9" fill="var(--accent-color)" font-weight="bold">VALVE: LOCKED</text>
            </g>
          </svg>
        </div>
      `;

      handleEl = container.querySelector('#pump-handle');
      gaugeNeedleEl = container.querySelector('#gauge-needle');
      pressureFillEl = container.querySelector('#pressure-fill');
      valveEl = container.querySelector('#pump-valve');
      valveStatusTextEl = container.querySelector('#valve-status-text');

      handleEl.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      handleEl.addEventListener('touchstart', handleMouseDown, { passive: false });
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);

      valveEl.addEventListener('click', toggleValve);

      decayInterval = setInterval(() => {
        if (!isLocked && currentVolume > 0) {
          // Rapid decay leakage: empty full pressure in ~4 seconds
          currentVolume = Math.max(0, currentVolume - 0.8);
          updatePumpUI();
          if (apiRef) {
            apiRef.setVolume(currentVolume / 100);
          }
          if (currentVolume <= 0) {
            stopLeakSound();
          }
        }
      }, 33);

      updatePumpUI();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        updatePumpUI();
      }
    },

    destroy() {
      isDragging = false;
      stopLeakSound();
      if (decayInterval) {
        clearInterval(decayInterval);
        decayInterval = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      containerElement = null;
      handleEl = null;
      gaugeNeedleEl = null;
      pressureFillEl = null;
      valveEl = null;
      valveStatusTextEl = null;
      apiRef = null;
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }
  };
})();
