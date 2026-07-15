// Slot Machine Controller ("🎰")
// Pull the slot lever to spin the reels. Reels stop at Tens and Units digits. Volume = slot output %.

(function() {
  let containerElement = null;
  let apiRef = null;
  
  let currentVolume = 63;
  let isSpinning = false;

  let tensDigit = 6;
  let unitsDigit = 3;

  let spinIntervals = [null, null];
  let spinDuration = 0;

  function initLocalAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    return new AudioContextClass();
  }

  function playClickSound() {
    const audioCtx = initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    osc.start(); osc.stop(audioCtx.currentTime + 0.03);
  }

  function playWinChime() {
    const audioCtx = initLocalAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.22);
      osc.start(now + idx * 0.1); osc.stop(now + idx * 0.1 + 0.22);
    });
  }

  function startSpin() {
    if (isSpinning) return;
    isSpinning = true;

    // Pull handle animation effect
    const arm = containerElement.querySelector('#slot-arm-lever');
    const knob = containerElement.querySelector('#slot-arm-knob');
    if (arm && knob) {
      arm.setAttribute('y2', '120');
      knob.setAttribute('cy', '120');
      setTimeout(() => {
        arm.setAttribute('y2', '40');
        knob.setAttribute('cy', '40');
      }, 250);
    }

    playClickSound();

    let speed = 60;
    
    // Spin Tens Reel
    spinIntervals[0] = setInterval(() => {
      tensDigit = Math.floor(Math.random() * 10); // 0 to 9
      const tensEl = containerElement.querySelector('#slot-tens');
      if (tensEl) tensEl.textContent = tensDigit;
      playClickSound();
    }, speed);

    // Spin Units Reel
    spinIntervals[1] = setInterval(() => {
      unitsDigit = Math.floor(Math.random() * 10); // 0 to 9
      const unitsEl = containerElement.querySelector('#slot-units');
      if (unitsEl) unitsEl.textContent = unitsDigit;
    }, speed);

    // Stop Reels sequentially
    setTimeout(() => {
      clearInterval(spinIntervals[0]);
      spinIntervals[0] = null;
      playClickSound();
    }, 1200);

    setTimeout(() => {
      clearInterval(spinIntervals[1]);
      spinIntervals[1] = null;
      
      // Stop complete!
      isSpinning = false;
      playWinChime();

      currentVolume = tensDigit * 10 + unitsDigit;
      
      const scoreDisp = containerElement.querySelector('#slot-score');
      if (scoreDisp) scoreDisp.textContent = `VOLUME: ${currentVolume}%`;

      if (apiRef) {
        apiRef.setVolume(currentVolume / 100);
      }
    }, 1800);
  }

  window.controllers = window.controllers || {};
  window.controllers.slot = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      
      tensDigit = Math.floor(currentVolume / 10);
      unitsDigit = currentVolume % 10;
      isSpinning = false;

      container.innerHTML = `
        <div class="dice-container" style="display:flex; flex-direction:column; background:radial-gradient(circle, #800e0e 0%, #300303 100%); border-color:rgba(255,255,255,0.1); width:100%; height:100%; align-items:center; justify-content:center; gap:16px;">
          
          <div style="display:flex; align-items:center; gap:12px; position:relative;">
            <!-- Slot Machine Body -->
            <svg viewBox="0 0 280 150" style="width:220px; height:120px;">
              <!-- Outer Case -->
              <rect x="10" y="10" width="230" height="130" rx="10" fill="#222" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
              
              <!-- Yellow header panel -->
              <rect x="20" y="20" width="210" height="25" rx="3" fill="#ffb700" />
              <text x="125" y="38" text-anchor="middle" font-family="monospace" font-size="12" fill="#000" font-weight="bold">JACKPOT VOLUMIZER</text>

              <!-- Reels Background window -->
              <rect x="25" y="60" width="200" height="65" rx="5" fill="#111" stroke="#333" stroke-width="2" />

              <!-- Tens Reel Window -->
              <rect x="45" y="68" width="60" height="48" rx="4" fill="#fff" />
              <text id="slot-tens" x="75" y="102" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="32" fill="#111" font-weight="bold">${tensDigit}</text>

              <!-- Divider line -->
              <line x1="125" y1="60" x2="125" y2="125" stroke="#333" stroke-width="2" />

              <!-- Units Reel Window -->
              <rect x="145" y="68" width="60" height="48" rx="4" fill="#fff" />
              <text id="slot-units" x="175" y="102" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="32" fill="#111" font-weight="bold">${unitsDigit}</text>
            </svg>

            <!-- Pull Lever Arm -->
            <svg viewBox="0 0 50 150" style="width:40px; height:120px; cursor:pointer;" id="slot-arm-trigger">
              <!-- base hub -->
              <circle cx="10" cy="80" r="10" fill="#444" />
              <!-- rod -->
              <line id="slot-arm-lever" x1="10" y1="80" x2="30" y2="40" stroke="#888" stroke-width="4.5" stroke-linecap="round" />
              <!-- knob -->
              <circle id="slot-arm-knob" cx="30" cy="40" r="8" fill="#ff4a4a" />
            </svg>
          </div>

          <div style="display:flex; align-items:center; gap:16px;">
            <div id="slot-score" style="font-family:'JetBrains Mono', monospace; font-size:1.1rem; font-weight:bold; color:#ffb700; text-shadow:0 0 6px rgba(255,183,0,0.3);">${currentVolume}%</div>
            <button id="slot-spin-btn" class="dice-btn" style="background:#ffb700; color:#000; padding:6px 14px; border-radius:12px; font-weight:bold; font-size:0.75rem; cursor:pointer; outline:none; border:none;">PULL LEVER</button>
          </div>

        </div>
      `;

      container.querySelector('#slot-spin-btn').addEventListener('click', startSpin);
      container.querySelector('#slot-arm-trigger').addEventListener('click', startSpin);
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isSpinning) {
          tensDigit = Math.floor(value / 10);
          unitsDigit = value % 10;
          const tensEl = containerElement.querySelector('#slot-tens');
          const unitsEl = containerElement.querySelector('#slot-units');
          if (tensEl) tensEl.textContent = tensDigit;
          if (unitsEl) unitsEl.textContent = unitsDigit;
          
          const scoreDisp = containerElement.querySelector('#slot-score');
          if (scoreDisp) scoreDisp.textContent = `VOLUME: ${currentVolume}%`;
        }
      }
    },

    destroy() {
      isSpinning = false;
      if (spinIntervals[0]) clearInterval(spinIntervals[0]);
      if (spinIntervals[1]) clearInterval(spinIntervals[1]);
      containerElement = null;
      apiRef = null;
    }
  };
})();
