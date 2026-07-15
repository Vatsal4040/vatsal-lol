// Vertical Cylinder Liquid Ladder Controller ("📏")
// A vertical pipe on the left, with horizontal liquid fill bars growing to the right.
// Dragging vertically adjusts the volume.

(function() {
  let containerElement = null;
  let currentVal = 63;
  let isDragging = false;
  let apiRef = null;

  function updateUI() {
    if (!containerElement) return;
    
    const bars = containerElement.querySelectorAll('.cyl-bar-fill');
    const barCount = bars.length;
    
    // For each of the 10 bars (from bottom to top, index 0 is bottom, index 9 is top)
    for (let i = 0; i < barCount; i++) {
      const barValStart = i * 10;
      const barValEnd = (i + 1) * 10;
      
      const fillEl = bars[i];
      if (currentVal >= barValEnd) {
        fillEl.style.width = '100%';
      } else if (currentVal > barValStart) {
        const pct = (currentVal - barValStart) / 10;
        fillEl.style.width = `${pct * 100}%`;
      } else {
        fillEl.style.width = '0%';
      }
    }

    const valDisp = containerElement.querySelector('#v-slider-value');
    if (valDisp) {
      valDisp.textContent = `${currentVal}%`;
    }
  }

  function handlePosition(clientY) {
    const rect = containerElement.querySelector('.cyl-ladder-track').getBoundingClientRect();
    const y = clientY - rect.top;
    const height = rect.height;
    
    let pct = (height - y) / height;
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
    osc.frequency.setValueAtTime(1100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(); osc.stop(ctx.currentTime + 0.05);
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
  window.controllers.vertical = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVal = Math.round(api.getVolume() * 100);

      let barsHTML = '';
      // Render 10 horizontal bars from top (9) to bottom (0)
      for (let i = 9; i >= 0; i--) {
        // Taper the bar widths (top is wide 100px, bottom is narrow 40px)
        const maxWidth = 40 + (i * 8);
        barsHTML += `
          <div class="cyl-bar-row" style="display:flex; align-items:center; height:14px; margin: 4px 0;">
            <!-- Left vertical alignment connector -->
            <div style="width:2px; height:100%; background:rgba(255,255,255,0.15);"></div>
            <!-- Horizontal Liquid fill bar -->
            <div class="cyl-bar-bg" style="width:${maxWidth}px; height:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:3px; margin-left:8px; overflow:hidden; position:relative;">
              <div class="cyl-bar-fill" style="width:0%; height:100%; background:linear-gradient(90deg, #0072b5 0%, var(--accent-color) 100%); transition: width 0.05s ease;"></div>
            </div>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="v-slider-container" style="user-select:none; -webkit-user-select:none;">
          <div class="cyl-ladder-track" style="display:flex; position:relative; cursor:pointer; padding: 10px 20px;">
            <!-- Thick vertical cylinder spine on the left -->
            <div style="width:14px; height:200px; background:linear-gradient(90deg, #333 0%, #666 50%, #222 100%); border-radius:7px; border:1px solid rgba(255,255,255,0.1); margin-right:12px; box-shadow: inset 1px 1px 3px rgba(255,255,255,0.2);"></div>
            
            <!-- Rows of horizontal bars -->
            <div style="display:flex; flex-direction:column; justify-content:space-between; height:200px;">
              ${barsHTML}
            </div>
          </div>
          <div id="v-slider-value" class="v-slider-value" style="margin-top:10px;">${currentVal}%</div>
        </div>
      `;

      const track = container.querySelector('.cyl-ladder-track');
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
      apiRef = null;
    }
  };
})();
