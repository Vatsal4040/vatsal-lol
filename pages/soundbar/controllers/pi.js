// Pi Controller ("π")
// Type any digits after '3.'. The volume is set to the value of the last two digits typed.
// The joke is that you can redefine Pi to whatever value fits your desired volume!

(function() {
  let containerElement = null;
  let displayEl = null;
  let currentVolume = 63;
  let typedBuffer = "63";
  let apiRef = null;

  function updatePiUI() {
    if (displayEl) {
      let html = `<span class="pi-base" style="color:var(--text-secondary);">π ≈ 3.</span>`;
      for (let i = 0; i < typedBuffer.length; i++) {
        if (i >= typedBuffer.length - 2) {
          html += `<span class="pi-typed" style="color:var(--accent-color); font-weight:bold; text-shadow:0 0 6px var(--accent-color);">${typedBuffer[i]}</span>`;
        } else {
          html += `<span class="pi-base" style="color:var(--text-secondary);">${typedBuffer[i]}</span>`;
        }
      }
      html += `<span class="pi-cursor" style="color:var(--accent-color);">_</span>`;
      displayEl.innerHTML = html;
    }
  }

  function playClick() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function handleDigitInput(digit) {
    playClick();
    
    typedBuffer += digit;
    
    if (typedBuffer.length > 10) {
      typedBuffer = typedBuffer.slice(-10);
    }

    let vol = 0;
    if (typedBuffer.length === 1) {
      vol = parseInt(typedBuffer, 10);
    } else {
      vol = parseInt(typedBuffer.slice(-2), 10);
    }

    currentVolume = vol;
    updatePiUI();

    if (apiRef) {
      apiRef.setVolume(vol / 100);
    }
  }

  function onKeyDown(e) {
    if (/^[0-9]$/.test(e.key)) {
      handleDigitInput(e.key);
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.pi = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      typedBuffer = currentVolume.toString();

      container.innerHTML = `
        <div class="pi-container">
          <div class="pi-display-panel">
            <div class="pi-label">Redefine Pi</div>
            <div class="pi-digits" id="pi-digits-display">π ≈ 3.63_</div>
          </div>

          <div class="pi-keypad">
            <button class="pi-key" data-key="1">1</button>
            <button class="pi-key" data-key="2">2</button>
            <button class="pi-key" data-key="3">3</button>
            <button class="pi-key" data-key="4">4</button>
            <button class="pi-key" data-key="5">5</button>
            <button class="pi-key" data-key="6">6</button>
            <button class="pi-key" data-key="7">7</button>
            <button class="pi-key" data-key="8">8</button>
            <button class="pi-key" data-key="9">9</button>
            <button class="pi-key" data-key="0">0</button>
            <button class="pi-key reset" id="pi-reset-btn">Reset</button>
          </div>
        </div>
      `;

      displayEl = container.querySelector('#pi-digits-display');

      window.addEventListener('keydown', onKeyDown);

      const keys = container.querySelectorAll('.pi-key[data-key]');
      keys.forEach(k => {
        k.addEventListener('click', () => {
          const val = k.getAttribute('data-key');
          if (val) handleDigitInput(val);
        });
      });

      const resetBtn = container.querySelector('#pi-reset-btn');
      resetBtn.addEventListener('click', () => {
        playClick();
        typedBuffer = "0";
        currentVolume = 0;
        updatePiUI();
        if (apiRef) apiRef.setVolume(0);
      });

      updatePiUI();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        typedBuffer = value.toString();
        updatePiUI();
      }
    },

    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      containerElement = null;
      displayEl = null;
      apiRef = null;
    }
  };
})();
