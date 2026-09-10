// Elevator Volume Controller ("🛗")
// Press floor buttons. Elevator travels, dings, and opens doors at target floor. Floor = volume.

(function() {
  let containerElement = null;
  let apiRef = null;
  
  let currentVolume = 63;
  let targetFloor = 6;
  let currentFloor = 6;
  let doorWidth = 100; // 0% (fully open) to 100% (fully closed)
  
  let motorInterval = null;
  let travelTimeout = null;
  let doorInterval = null;
  let isMoving = false;
  let isDoorClosing = false;
  let isDoorOpening = false;

  let audioCtx = null;
  let motorOsc = null;
  let motorGain = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function startMotorSound() {
    initLocalAudio();
    if (!audioCtx || motorOsc) return;

    motorOsc = audioCtx.createOscillator();
    motorGain = audioCtx.createGain();
    
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(65, audioCtx.currentTime); // Low engine hum

    // Lowpass filter to make it sound muffled
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, audioCtx.currentTime);

    motorOsc.connect(filter);
    filter.connect(motorGain);
    motorGain.connect(audioCtx.destination);
    
    motorGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    motorGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.2);
    motorOsc.start();
  }

  function stopMotorSound() {
    if (motorOsc) {
      if (motorGain && audioCtx) {
        motorGain.gain.setValueAtTime(motorGain.gain.value, audioCtx.currentTime);
        motorGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      }
      const tempOsc = motorOsc;
      setTimeout(() => {
        try { tempOsc.stop(); } catch (e) {}
      }, 200);
      motorOsc = null;
      motorGain = null;
    }
  }

  function playDing() {
    initLocalAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High chime ding
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    osc.start(); osc.stop(audioCtx.currentTime + 0.8);
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

  function animateDoors(targetWidth, callback) {
    if (doorInterval) clearInterval(doorInterval);
    
    doorInterval = setInterval(() => {
      const step = 8;
      if (doorWidth < targetWidth) {
        doorWidth = Math.min(targetWidth, doorWidth + step);
      } else if (doorWidth > targetWidth) {
        doorWidth = Math.max(targetWidth, doorWidth - step);
      }
      
      const leftDoor = containerElement.querySelector('#elevator-door-left');
      const rightDoor = containerElement.querySelector('#elevator-door-right');
      if (leftDoor && rightDoor) {
        leftDoor.style.width = `${doorWidth / 2}%`;
        rightDoor.style.width = `${doorWidth / 2}%`;
      }

      if (doorWidth === targetWidth) {
        clearInterval(doorInterval);
        doorInterval = null;
        if (callback) callback();
      }
    }, 25);
  }

  function travelToFloor() {
    if (currentFloor === targetFloor) {
      // Reached destination! Open doors, ding, set volume.
      stopMotorSound();
      playDing();
      isMoving = false;
      
      const floorIndicator = containerElement.querySelector('#elevator-indicator');
      if (floorIndicator) {
        floorIndicator.textContent = currentFloor === 0 ? "G" : currentFloor;
        floorIndicator.classList.remove('blink');
      }

      currentVolume = currentFloor * 10;
      if (apiRef) {
        apiRef.setVolume(currentVolume / 100);
      }

      // Open doors
      isDoorOpening = true;
      animateDoors(0, () => {
        isDoorOpening = false;
        // Turn off active floor button highlight
        containerElement.querySelectorAll('.el-btn').forEach(btn => {
          btn.classList.remove('active');
        });
      });
      return;
    }

    // Step floor
    if (currentFloor < targetFloor) {
      currentFloor++;
    } else {
      currentFloor--;
    }

    const floorIndicator = containerElement.querySelector('#elevator-indicator');
    if (floorIndicator) {
      floorIndicator.textContent = currentFloor === 0 ? "G" : currentFloor;
    }
    
    playDing(); // Ding at each passing floor

    travelTimeout = setTimeout(travelToFloor, 800);
  }

  function pressFloorButton(floorNum) {
    if (isMoving || isDoorClosing || isDoorOpening) return;
    
    targetFloor = floorNum;
    if (targetFloor === currentFloor) return;

    playClick();
    isMoving = true;
    
    // Highlight button
    const btn = containerElement.querySelector(`.el-btn[data-floor="${floorNum}"]`);
    if (btn) btn.classList.add('active');

    // Blink indicator
    const floorIndicator = containerElement.querySelector('#elevator-indicator');
    if (floorIndicator) {
      floorIndicator.classList.add('blink');
    }

    // Close doors first
    isDoorClosing = true;
    animateDoors(100, () => {
      isDoorClosing = false;
      startMotorSound();
      
      // Start travel loop after doors close
      travelTimeout = setTimeout(travelToFloor, 500);
    });
  }

  window.controllers = window.controllers || {};
  window.controllers.elevator = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      currentFloor = Math.round(currentVolume / 10);
      targetFloor = currentFloor;
      doorWidth = 0; // starts open
      isMoving = false;

      let buttonsHTML = '';
      // Render G (0) to 10
      for (let f = 10; f >= 0; f--) {
        const label = f === 0 ? "G" : f;
        buttonsHTML += `
          <button class="el-btn" data-floor="${f}" style="width:34px; height:34px; border-radius:50%; border:2px solid var(--border-color); background:#1b1b22; color:#fff; font-family:monospace; font-weight:bold; font-size:0.85rem; cursor:pointer; display:flex; justify-content:center; align-items:center; transition: all 0.2s ease; outline:none;">${label}</button>
        `;
      }

      container.innerHTML = `
        <style>
          .el-btn.active {
            border-color: #ffb700 !important;
            box-shadow: 0 0 8px rgba(255, 183, 0, 0.4);
            color: #ffb700 !important;
          }
          #elevator-indicator.blink {
            animation: el-ind-blink 0.5s infinite alternate;
          }
          @keyframes el-ind-blink {
            from { opacity: 0.3; } to { opacity: 1; }
          }
        </style>
        <div class="elevator-container" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; gap:24px; padding:10px;">
          
          <!-- Elevator Shaft/Cabin view -->
          <div class="elevator-shaft" style="width:140px; height:220px; background:#1b1b22; border:3px solid var(--border-color); border-radius:6px; position:relative; overflow:hidden;">
            <!-- Inside Cabin View -->
            <div class="elevator-cabin" style="position:absolute; top:0; bottom:0; left:0; right:0; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#282835;">
              <span style="font-size:2rem;">🔊</span>
              <span style="font-family:monospace; font-size:0.72rem; color:var(--text-secondary); margin-top:8px;">Speaker Inside</span>
            </div>

            <!-- Left sliding door -->
            <div id="elevator-door-left" style="position:absolute; left:0; top:0; bottom:0; width:0%; background:linear-gradient(90deg, #444 0%, #666 80%, #333 100%); border-right:1px solid #111; transition: width 0.05s ease;"></div>
            <!-- Right sliding door -->
            <div id="elevator-door-right" style="position:absolute; right:0; top:0; bottom:0; width:0%; background:linear-gradient(270deg, #444 0%, #666 80%, #333 100%); border-left:1px solid #111; transition: width 0.05s ease;"></div>
          </div>

          <!-- Elevator Keypad Panel -->
          <div class="elevator-panel" style="width:110px; display:flex; flex-direction:column; align-items:center; background:#111116; border:2px solid var(--border-color); border-radius:8px; padding:10px; gap:10px;">
            <!-- LED display -->
            <div style="background:#0a0a0d; border:1px solid #ff4a4a; border-radius:4px; width:100%; height:32px; display:flex; justify-content:center; align-items:center;">
              <span id="elevator-indicator" style="font-family:'JetBrains Mono', monospace; font-size:1.3rem; color:#ff4a4a; font-weight:bold;">${currentFloor === 0 ? "G" : currentFloor}</span>
            </div>
            
            <!-- Button matrix -->
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; justify-items:center;">
              ${buttonsHTML}
            </div>
          </div>

        </div>
      `;

      container.querySelectorAll('.el-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const floor = parseInt(btn.getAttribute('data-floor'), 10);
          pressFloorButton(floor);
        });
      });
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isMoving && !isDoorClosing && !isDoorOpening) {
          currentFloor = Math.round(value / 10);
          targetFloor = currentFloor;
          const ind = containerElement.querySelector('#elevator-indicator');
          if (ind) ind.textContent = currentFloor === 0 ? "G" : currentFloor;
        }
      }
    },

    destroy() {
      isMoving = false;
      stopMotorSound();
      if (travelTimeout) clearTimeout(travelTimeout);
      if (doorInterval) clearInterval(doorInterval);
      containerElement = null;
      apiRef = null;
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }
  };
})();
