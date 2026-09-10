// Battery Controller ("🔋")
// Manually drag the charge level or click "PLUG IN" to trigger auto-charging! Volume = battery %.

(function() {
  let containerElement = null;
  let chargeFillEl = null;
  let chargeLightningEl = null;
  let chargeTextEl = null;
  let plugBtn = null;
  let apiRef = null;

  let isDragging = false;
  let currentVolume = 63;

  let isPluggedIn = false;
  let chargeInterval = null;

  let audioCtx = null;
  let humOsc = null;
  let humGain = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function startElectricityHum() {
    initLocalAudio();
    if (!audioCtx || humOsc) return;

    humOsc = audioCtx.createOscillator();
    humGain = audioCtx.createGain();
    
    // Muffled electric spark buzz hum
    humOsc.type = 'triangle';
    humOsc.frequency.setValueAtTime(50, audioCtx.currentTime); // 50Hz electrical hum

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, audioCtx.currentTime);

    humOsc.connect(filter);
    filter.connect(humGain);
    humGain.connect(audioCtx.destination);

    humGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    humGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
    humOsc.start();
  }

  function stopElectricityHum() {
    if (humOsc) {
      if (humGain && audioCtx) {
        humGain.gain.setValueAtTime(humGain.gain.value, audioCtx.currentTime);
        humGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      }
      const tempOsc = humOsc;
      setTimeout(() => {
        try { tempOsc.stop(); } catch (e) {}
      }, 150);
      humOsc = null;
      humGain = null;
    }
  }

  function playClick() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updateBatteryUI() {
    if (chargeFillEl) {
      const w = currentVolume * 2.2; // max width 220px
      chargeFillEl.setAttribute('width', w);
      
      // Change color based on volume level
      if (currentVolume < 20) {
        chargeFillEl.setAttribute('fill', '#ff4a4a');
      } else if (currentVolume < 50) {
        chargeFillEl.setAttribute('fill', '#ffb700');
      } else {
        chargeFillEl.setAttribute('fill', '#34d399');
      }
    }

    if (chargeLightningEl) {
      chargeLightningEl.style.display = isPluggedIn ? 'block' : 'none';
    }

    if (chargeTextEl) {
      chargeTextEl.textContent = `${currentVolume}%`;
    }

    if (plugBtn) {
      plugBtn.textContent = isPluggedIn ? "UNPLUG 🔌" : "PLUG IN ⚡";
      plugBtn.style.borderColor = isPluggedIn ? '#ff4a4a' : 'var(--accent-color)';
      plugBtn.style.color = isPluggedIn ? '#ff4a4a' : 'var(--accent-color)';
    }
  }

  function handlePosition(clientX) {
    const track = containerElement.querySelector('#battery-track');
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    
    let pct = x / width;
    pct = Math.max(0, Math.min(1, pct));
    const newVol = Math.round(pct * 100);

    if (newVol !== currentVolume) {
      currentVolume = newVol;
      updateBatteryUI();
      if (apiRef) {
        apiRef.setVolume(newVol / 100);
      }
    }
  }

  function onMouseDown(e) {
    if (isPluggedIn) return; // disable drag while auto-charging
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handlePosition(clientX);
    playClick();
    if (e.cancelable) e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handlePosition(clientX);
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      playClick();
    }
  }

  function togglePlug() {
    isPluggedIn = !isPluggedIn;
    playClick();

    if (isPluggedIn) {
      startElectricityHum();
      // Auto-charge timer
      chargeInterval = setInterval(() => {
        if (currentVolume < 100) {
          currentVolume = Math.min(100, currentVolume + 1);
          updateBatteryUI();
          if (apiRef) {
            apiRef.setVolume(currentVolume / 100);
          }
        } else {
          togglePlug(); // auto-unplug when full!
        }
      }, 50);
    } else {
      stopElectricityHum();
      if (chargeInterval) {
        clearInterval(chargeInterval);
        chargeInterval = null;
      }
    }
    updateBatteryUI();
  }

  window.controllers = window.controllers || {};
  window.controllers.battery = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      isPluggedIn = false;

      container.innerHTML = `
        <div class="battery-container" style="display:flex; flex-direction:column; width:100%; height:100%; align-items:center; justify-content:center; gap:20px;">
          
          <svg class="battery-svg" viewBox="0 0 280 140" style="width:240px; height:120px;">
            <!-- Battery body casing -->
            <rect id="battery-track" x="15" y="15" width="230" height="110" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="3" style="cursor:pointer;" />
            <!-- Battery terminal nipple on the right -->
            <rect x="245" y="50" width="12" height="40" rx="3" fill="rgba(255, 255, 255, 0.15)" />

            <!-- Green charging cell bar -->
            <rect id="battery-fill" x="20" y="20" width="0" height="100" rx="8" fill="#34d399" pointer-events="none" />

            <!-- Lightning bolt charging indicator inside -->
            <path id="battery-lightning" d="M 130 35 L 105 75 L 125 75 L 115 105 L 140 65 L 120 65 Z" fill="#ffb700" filter="drop-shadow(0 0 4px rgba(255,183,0,0.5))" style="display:none; pointer-events:none;" />
          </svg>

          <div style="display:flex; align-items:center; gap:24px;">
            <div id="battery-text" style="font-family:'JetBrains Mono', monospace; font-size:1.6rem; font-weight:bold; color:var(--text-primary);">${currentVolume}%</div>
            <button id="battery-plug-btn" style="background:transparent; border:2.5px solid var(--accent-color); border-radius:18px; color:var(--accent-color); font-family:inherit; font-weight:bold; font-size:0.8rem; padding:6px 16px; cursor:pointer; outline:none; transition: all 0.2s ease;">PLUG IN ⚡</button>
          </div>

        </div>
      `;

      chargeFillEl = container.querySelector('#battery-fill');
      chargeLightningEl = container.querySelector('#battery-lightning');
      chargeTextEl = container.querySelector('#battery-text');
      plugBtn = container.querySelector('#battery-plug-btn');

      const track = container.querySelector('#battery-track');
      track.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      track.addEventListener('touchstart', onMouseDown, { passive: false });
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);

      plugBtn.addEventListener('click', togglePlug);

      updateBatteryUI();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        updateBatteryUI();
      }
    },

    destroy() {
      isDragging = false;
      isPluggedIn = false;
      stopElectricityHum();
      if (chargeInterval) {
        clearInterval(chargeInterval);
        chargeInterval = null;
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      containerElement = null;
      chargeFillEl = null;
      chargeLightningEl = null;
      chargeTextEl = null;
      plugBtn = null;
      apiRef = null;
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }
  };
})();
