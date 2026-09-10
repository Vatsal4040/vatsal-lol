// Dice Controller ("🎲")
// Roll 5 dice. Sum of faces determines volume.

(function() {
  let containerElement = null;
  let currentVolume = 63;
  let diceValues = [3, 4, 3, 4, 3];
  let isRolling = false;
  let apiRef = null;

  function getVolumeFromDice(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(((sum - 5) / 25) * 100);
  }

  function setDiceFromVolume(vol) {
    const targetSum = Math.round(5 + (vol / 100) * 25);
    let sum = 5;
    let tempValues = [1, 1, 1, 1, 1];

    let attempts = 0;
    while (sum < targetSum && attempts < 100) {
      for (let i = 0; i < 5; i++) {
        if (tempValues[i] < 6 && sum < targetSum) {
          tempValues[i]++;
          sum++;
        }
      }
      attempts++;
    }
    diceValues = tempValues;
    updateDiceUI();
  }

  function updateDiceUI() {
    if (!containerElement) return;

    for (let idx = 0; idx < 5; idx++) {
      const dieEl = containerElement.querySelector(`#die-${idx}`);
      if (dieEl) {
        dieEl.innerHTML = getDiePipsSVG(diceValues[idx]);
      }
    }

    const sum = diceValues.reduce((a, b) => a + b, 0);
    const sumDisplay = containerElement.querySelector('#dice-sum-display');
    if (sumDisplay) {
      sumDisplay.textContent = `Sum: ${sum} (Volume: ${currentVolume}%)`;
    }
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
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function playRollSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const taps = 5 + Math.floor(Math.random() * 3);
    const time = audioCtx.currentTime;
    for (let i = 0; i < taps; i++) {
      const tapTime = time + i * 0.06 + Math.random() * 0.02;
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();
      osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 60, tapTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, tapTime);
      gain.gain.setValueAtTime(0.12 - (i * 0.015), tapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.04);
      osc.start(tapTime); osc.stop(tapTime + 0.04);
    }
  }

  function getDiePipsSVG(value) {
    let pips = `<rect x="2" y="2" width="46" height="46" rx="8" fill="#1b1b22" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />`;
    
    const center = { cx: 25, cy: 25 };
    const topLeft = { cx: 13, cy: 13 };
    const topRight = { cx: 37, cy: 13 };
    const bottomLeft = { cx: 13, cy: 37 };
    const bottomRight = { cx: 37, cy: 37 };
    const middleLeft = { cx: 13, cy: 25 };
    const middleRight = { cx: 37, cy: 25 };

    const dot = (coords) => `<circle cx="${coords.cx}" cy="${coords.cy}" r="3.8" fill="var(--accent-color)" />`;

    switch (value) {
      case 1: pips += dot(center); break;
      case 2: pips += dot(topLeft) + dot(bottomRight); break;
      case 3: pips += dot(topLeft) + dot(center) + dot(bottomRight); break;
      case 4: pips += dot(topLeft) + dot(topRight) + dot(bottomLeft) + dot(bottomRight); break;
      case 5: pips += dot(topLeft) + dot(topRight) + dot(center) + dot(bottomLeft) + dot(bottomRight); break;
      case 6: pips += dot(topLeft) + dot(topRight) + dot(middleLeft) + dot(middleRight) + dot(bottomLeft) + dot(bottomRight); break;
    }
    return pips;
  }

  function rollAllDice() {
    if (isRolling) return;
    isRolling = true;
    playRollSound();

    let rollCount = 0;
    const maxRolls = 8;
    const interval = setInterval(() => {
      diceValues = diceValues.map(() => Math.floor(Math.random() * 6) + 1);
      
      for (let i = 0; i < 5; i++) {
        const dieEl = containerElement.querySelector(`#die-${i}`);
        if (dieEl) {
          dieEl.style.transform = `translate(${(Math.random() - 0.5) * 6}px, ${(Math.random() - 0.5) * 6}px) rotate(${(Math.random() - 0.5) * 16}deg)`;
        }
      }

      updateDiceUI();
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        isRolling = false;
        
        for (let i = 0; i < 5; i++) {
          const dieEl = containerElement.querySelector(`#die-${i}`);
          if (dieEl) dieEl.style.transform = '';
        }

        const vol = getVolumeFromDice(diceValues);
        currentVolume = vol;
        updateDiceUI();
        if (apiRef) {
          apiRef.setVolume(vol / 100);
        }
      }
    }, 75);
  }

  window.controllers = window.controllers || {};
  window.controllers.dice = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      container.innerHTML = `
        <div class="dice-container">
          <div class="dice-row">
            <svg id="die-0" class="die-svg" viewBox="0 0 50 50"></svg>
            <svg id="die-1" class="die-svg" viewBox="0 0 50 50"></svg>
            <svg id="die-2" class="die-svg" viewBox="0 0 50 50"></svg>
            <svg id="die-3" class="die-svg" viewBox="0 0 50 50"></svg>
            <svg id="die-4" class="die-svg" viewBox="0 0 50 50"></svg>
          </div>
          <div class="dice-controls">
            <div id="dice-sum-display" class="dice-sum">Sum: 17 (Volume: 48%)</div>
            <button id="roll-all-btn" class="dice-btn">ROLL DICE</button>
          </div>
        </div>
      `;

      for (let idx = 0; idx < 5; idx++) {
        const dieEl = container.querySelector(`#die-${idx}`);
        dieEl.addEventListener('click', () => {
          if (isRolling) return;
          diceValues[idx] = (diceValues[idx] % 6) + 1;
          playClick();
          
          const vol = getVolumeFromDice(diceValues);
          currentVolume = vol;
          updateDiceUI();
          if (apiRef) {
            apiRef.setVolume(vol / 100);
          }
        });
      }

      const rollBtn = container.querySelector('#roll-all-btn');
      rollBtn.addEventListener('click', rollAllDice);

      setDiceFromVolume(currentVolume);
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isRolling) {
          setDiceFromVolume(value);
        }
      }
    },

    destroy() {
      isRolling = false;
      containerElement = null;
      apiRef = null;
    }
  };
})();
