// MCQ Exam Sheet Controller ("📝")
// Compact OMR selection sheet with a Tens column and a Units column.
// Selecting "7" in Tens and "3" in Units sets the volume to 73%.

(function() {
  let containerElement = null;
  let currentVolume = 63;
  let apiRef = null;

  let selectedTens = 60;
  let selectedUnits = 3;

  function playScratch() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1300, audioCtx.currentTime);
    filter.Q.setValueAtTime(3.5, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    src.start();
  }

  function updateOMR() {
    if (!containerElement) return;

    // Reset all bubbles
    containerElement.querySelectorAll('.exam-bubble').forEach(b => {
      b.classList.remove('filled');
      b.innerHTML = '';
    });

    // Check special 100 case
    if (currentVolume === 100) {
      selectedTens = 100;
      selectedUnits = 0;
    } else {
      selectedTens = Math.floor(currentVolume / 10) * 10;
      selectedUnits = currentVolume % 10;
    }

    // Fill Tens bubble
    const tensBubble = containerElement.querySelector(`.exam-bubble[data-col="tens"][data-val="${selectedTens}"]`);
    if (tensBubble) {
      tensBubble.classList.add('filled');
      tensBubble.innerHTML = getGraphiteSVG();
    }

    // Fill Units bubble (only if volume is not 100, which overrides units)
    if (selectedTens !== 100) {
      const unitsBubble = containerElement.querySelector(`.exam-bubble[data-col="units"][data-val="${selectedUnits}"]`);
      if (unitsBubble) {
        unitsBubble.classList.add('filled');
        unitsBubble.innerHTML = getGraphiteSVG();
      }
    }

    // Update volume score display
    const scoreDisplay = containerElement.querySelector('#exam-score');
    if (scoreDisplay) {
      scoreDisplay.textContent = `SELECTED VALUE: ${currentVolume}%`;
    }
  }

  function getGraphiteSVG() {
    return `
      <svg viewBox="0 0 24 24" class="exam-graphite">
        <path d="M 6 12 Q 18 6 12 18 Q 8 10 18 12 Q 12 6 16 18 Q 6 12 14 10" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" />
        <path d="M 12 6 Q 6 18 18 12 Q 10 8 12 16" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    `;
  }

  function handleBubbleClick(column, val) {
    playScratch();

    if (column === 'tens') {
      selectedTens = val;
      if (selectedTens === 100) {
        currentVolume = 100;
      } else {
        currentVolume = selectedTens + selectedUnits;
      }
    } else {
      selectedUnits = val;
      if (selectedTens === 100) {
        selectedTens = 90; // drop down to 90 if they select a unit bubble
      }
      currentVolume = selectedTens + selectedUnits;
    }

    updateOMR();
    if (apiRef) {
      apiRef.setVolume(currentVolume / 100);
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.exam = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      let html = `
        <div class="exam-container">
          <div class="exam-sheet">
            <div class="exam-header">
              <div class="exam-title">OMR VOLUME SELECTION SHEET</div>
              <div class="exam-meta">
                <span>CLASS: SOUND BAR</span>
                <span>EXAM NO: 100</span>
              </div>
            </div>
            
            <div class="exam-columns">
              <!-- Tens Column -->
              <div class="exam-column-panel">
                <div class="exam-col-label">Tens Digit</div>
                <div style="display:flex; flex-direction:column; gap:1px;">
      `;

      // Render Tens Bubbles: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
      const tensValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      tensValues.forEach(val => {
        const label = val === 100 ? "100" : `${val / 10}`;
        html += `
          <div class="exam-bubble-row">
            <span class="exam-bubble-label">${label}</span>
            <button class="exam-bubble" data-col="tens" data-val="${val}"></button>
          </div>
        `;
      });

      html += `
                </div>
              </div>

              <!-- Units Column -->
              <div class="exam-column-panel">
                <div class="exam-col-label">Units Digit</div>
                <div style="display:flex; flex-direction:column; gap:1px;">
      `;

      // Render Units Bubbles: 0 to 9
      for (let i = 0; i <= 9; i++) {
        html += `
          <div class="exam-bubble-row">
            <span class="exam-bubble-label">${i}</span>
            <button class="exam-bubble" data-col="units" data-val="${i}"></button>
          </div>
        `;
      }

      html += `
                </div>
              </div>
            </div>

            <div class="exam-footer">
              <div id="exam-score" class="exam-score">SELECTED VALUE: ${currentVolume}%</div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      container.querySelectorAll('.exam-bubble').forEach(b => {
        b.addEventListener('click', () => {
          const col = b.getAttribute('data-col');
          const val = parseInt(b.getAttribute('data-val'), 10);
          handleBubbleClick(col, val);
        });
      });

      updateOMR();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        updateOMR();
      }
    },

    destroy() {
      containerElement = null;
      apiRef = null;
    }
  };
})();
