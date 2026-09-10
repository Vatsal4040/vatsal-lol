// Default Horizontal Slider Controller ("Horizontal Slider")
// Simple horizontal slider. The boring fallback.

(function() {
  let containerElement = null;
  let fillEl = null;
  let currentVal = 63;
  let isDragging = false;
  let apiRef = null;

  function updateUI() {
    if (fillEl) {
      fillEl.style.width = `${currentVal}%`;
    }
    const valDisp = containerElement.querySelector('#default-slider-value');
    if (valDisp) {
      valDisp.textContent = `${currentVal}%`;
    }
  }

  function handlePosition(clientX) {
    const rect = containerElement.querySelector('.default-slider-track').getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    
    let pct = x / width;
    pct = Math.max(0, Math.min(1, pct));
    const newVol = Math.round(pct * 100);

    if (newVol !== currentVal) {
      currentVal = newVol;
      updateUI();
      if (apiRef) {
        apiRef.setVolume(newVol / 100);
      }
    }
  }

  function playClick() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start(); osc.stop(ctx.currentTime + 0.04);
  }

  function onMouseDown(e) {
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
    
    if (Math.random() < 0.15) {
      playClick();
    }
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      playClick();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.default = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVal = Math.round(api.getVolume() * 100);

      container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%;">
          <div class="default-slider-track" style="width:320px; height:12px; background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:6px; position:relative; cursor:pointer;">
            <div id="default-slider-fill" style="width:0%; height:100%; background:var(--accent-color); border-radius:6px; pointer-events:none;"></div>
          </div>
          <div id="default-slider-value" style="margin-top:14px; font-family:monospace; font-size:1.1rem; font-weight:bold;">${currentVal}%</div>
        </div>
      `;

      fillEl = container.querySelector('#default-slider-fill');

      const track = container.querySelector('.default-slider-track');
      track.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      track.addEventListener('touchstart', onMouseDown, { passive: false });
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);

      updateUI();
    },

    setVolume(value) {
      if (value !== currentVal) {
        currentVal = value;
        updateUI();
      }
    },

    destroy() {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      containerElement = null;
      fillEl = null;
      apiRef = null;
    }
  };
})();
