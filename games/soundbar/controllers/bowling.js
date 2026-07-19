// Bowling Volume Controller ("🎳")
// Position the bowling ball, then click ROLL. Remaining standing pins determine the volume.
// Volume = (pins_left) * 10.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  let isRolling = false;
  let ballX = 220; // 100 to 340
  let ballY = 190;
  let ballSize = 13;
  let ballSpeedY = 0;

  // 10 pins coordinates in 3D perspective
  // Row 1 (back): 4 pins
  // Row 2: 3 pins
  // Row 3: 2 pins
  // Row 4 (front): 1 pin
  let pins = [];
  
  let audioCtx = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function playRollSound() {
    initLocalAudio();
    if (!audioCtx) return;
    
    // Low rumble frequency sweeps down
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 1.0);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
    
    osc.start(); osc.stop(audioCtx.currentTime + 1.0);
  }

  function playPinStrikeSound(pinsHit = 5) {
    initLocalAudio();
    if (!audioCtx) return;
    
    // Noise blast for crashing pins
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    
    const strength = 0.08 + (pinsHit / 10) * 0.15;
    gain.gain.setValueAtTime(strength, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    src.start();

    // High pitch clink frequencies
    for(let j = 0; j < Math.min(4, pinsHit); j++) {
      const osc = audioCtx.createOscillator();
      const oGain = audioCtx.createGain();
      osc.connect(oGain); oGain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000 + Math.random() * 800, audioCtx.currentTime);
      oGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      oGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    }
  }

  function playClick() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function setupPins() {
    pins = [];
    const pinRows = [
      // Row 1 (back, y=45)
      [ {x: 185, y: 45}, {x: 208, y: 45}, {x: 232, y: 45}, {x: 255, y: 45} ],
      // Row 2 (y=55)
      [ {x: 197, y: 55}, {x: 220, y: 55}, {x: 243, y: 55} ],
      // Row 3 (y=65)
      [ {x: 208, y: 65}, {x: 232, y: 65} ],
      // Row 4 (front, y=75)
      [ {x: 220, y: 75} ]
    ];

    let id = 0;
    pinRows.forEach(row => {
      row.forEach(pinCoords => {
        pins.push({
          id: id++,
          x: pinCoords.x,
          y: pinCoords.y,
          standing: true,
          vx: 0,
          vy: 0,
          rot: 0
        });
      });
    });
  }

  function rollBall() {
    if (isRolling) return;
    isRolling = true;
    ballSpeedY = -3.8;
    playRollSound();
  }

  function strikePins() {
    // Determine pin hit calculations based on ball distance
    let hitCount = 0;

    pins.forEach(pin => {
      if (!pin.standing) return;
      
      const dx = ballX - pin.x;
      const dy = ballY - pin.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Hit radius check
      if (dist < 18) {
        pin.standing = false;
        pin.vx = (Math.random() - 0.5) * 6;
        pin.vy = -(1 + Math.random() * 4);
        pin.rot = (Math.random() - 0.5) * 0.3;
        hitCount++;
      }
    });

    if (hitCount > 0) {
      playPinStrikeSound(hitCount);
    }
  }

  function updatePhysics() {
    if (isRolling) {
      ballY += ballSpeedY;
      
      // Slowly shrink ball as it rolls into 3D horizon
      ballSize = 13 - ((190 - ballY) / 150) * 6;

      // Check pin strike bounds
      if (ballY <= 85 && ballY >= 40) {
        strikePins();
      }

      // Roll complete resets
      if (ballY <= 30) {
        isRolling = false;
        ballSpeedY = 0;
        ballY = 190;
        ballSize = 13;
        
        // Volume = pins left standing * 10
        const standingCount = pins.filter(p => p.standing).length;
        currentVolume = standingCount * 10;
        
        if (apiRef) {
          apiRef.setVolume(currentVolume / 100);
        }

        const label = containerElement.querySelector('#bowling-label');
        if (label) {
          label.textContent = `Strike complete! ${standingCount} pins left. Volume is ${currentVolume}%.`;
        }
      }
    }

    // Move fly-away knocked down pins
    pins.forEach(pin => {
      if (!pin.standing && (Math.abs(pin.vx) > 0.05 || Math.abs(pin.vy) > 0.05)) {
        pin.x += pin.vx;
        pin.y += pin.vy;
        pin.vy += 0.25; // gravity
        pin.vx *= 0.98; // friction
      }
    });
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw perspective lane
    ctx.fillStyle = '#22222d';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(150, 30);
    ctx.lineTo(290, 30);
    ctx.lineTo(440, 200);
    ctx.closePath();
    ctx.fill();

    // Wood floor planks lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const startX = 63 * i;
      const endX = 150 + i * 23.3;
      ctx.beginPath();
      ctx.moveTo(startX, 200);
      ctx.lineTo(endX, 30);
      ctx.stroke();
    }

    // Draw gutters
    ctx.fillStyle = '#0f0f14';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(150, 30);
    ctx.lineTo(135, 30);
    ctx.lineTo(0, 200); // left gutter
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(440, 200);
    ctx.lineTo(290, 30);
    ctx.lineTo(305, 30);
    ctx.lineTo(440, 200); // right gutter
    ctx.closePath(); ctx.fill();

    // Render standing pins (from back rows to front to preserve overlapping)
    pins.forEach(pin => {
      if (pin.standing) {
        drawPin(pin.x, pin.y, 6);
      }
    });

    // Render flying knocked down pins
    pins.forEach(pin => {
      if (!pin.standing && pin.y < 220) {
        ctx.save();
        ctx.translate(pin.x, pin.y);
        ctx.rotate(pin.rot * (performance.now() / 40));
        drawPin(0, 0, 5);
        ctx.restore();
      }
    });

    // Render bowling ball
    if (isRolling || ballY !== 190) {
      // Draw ball shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(ballX, ballY + 4, ballSize, 0, Math.PI * 2);
      ctx.fill();

      // Main Ball
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
      ctx.fill();

      // Fingertip holes (three black dots)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(ballX - 3, ballY - 3, ballSize * 0.15, 0, Math.PI * 2);
      ctx.arc(ballX + 3, ballY - 3, ballSize * 0.15, 0, Math.PI * 2);
      ctx.arc(ballX, ballY + 2, ballSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Aiming mode: draw interactive guide line
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(220, 50);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draggable ball on bottom track
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(ballX - 3, ballY - 3, 2, 0, Math.PI * 2);
      ctx.arc(ballX + 3, ballY - 3, 2, 0, Math.PI * 2);
      ctx.arc(ballX, ballY + 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    updatePhysics();
    animFrameId = requestAnimationFrame(draw);
  }

  function drawPin(x, y, scale = 6) {
    // Draw simple white pin outline with a red stripe
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y + scale/2, scale * 1.0, scale * 1.6, 0, 0, Math.PI * 2);
    ctx.ellipse(x, y - scale * 0.9, scale * 0.6, scale * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red neck collar stripe
    ctx.fillStyle = 'var(--red)';
    ctx.fillRect(x - scale * 0.4, y - scale * 0.4, scale * 0.8, scale * 0.35);
  }

  function handleMouseDown(e) {
    if (isRolling) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const mouseX = (clientX - rect.left) * (440 / rect.width);
    const mouseY = (clientY - rect.top) * (200 / rect.height);

    if (mouseY > 150) {
      ballX = Math.max(120, Math.min(320, mouseX));
      playClick();
      if (e.cancelable) e.preventDefault();
    }
  }

  function handleMouseMove(e) {
    if (isRolling) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const mouseX = (clientX - rect.left) * (440 / rect.width);
    const mouseY = (clientY - rect.top) * (200 / rect.height);

    if (e.buttons > 0 || (e.touches && e.touches.length > 0)) {
      ballX = Math.max(120, Math.min(320, mouseX));
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.bowling = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      isRolling = false;
      ballX = 220;
      ballY = 190;
      ballSize = 13;

      setupPins();

      // Knock down pins to reflect current volume on load
      const standingTargetCount = Math.round(currentVolume / 10);
      pins.forEach((pin, idx) => {
        pin.standing = idx < standingTargetCount;
      });

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="bowling-canvas" class="ball-canvas" width="440" height="200" style="display:block; width:100%; height:200px; background:#0c0c10; border-radius:6px; border:1.5px solid var(--border-color);"></canvas>
          <div id="bowling-label" class="ball-label" style="margin-top:6px;">Drag ball horizontally to aim. Standings pins set volume.</div>
          
          <div class="chai-controls" style="margin-top:6px; width:100%; justify-content:center;">
            <button id="bowling-roll-btn" class="chai-btn fill" style="padding: 6px 20px; font-size:0.75rem;">ROLL BALL 🎳</button>
            <button id="bowling-reset-btn" class="chai-btn drain" style="padding: 6px 20px; font-size:0.75rem;">RESET PINS 🧽</button>
          </div>
        </div>
      `;

      canvas = container.querySelector('#bowling-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 200 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '200px';

      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);

      canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
      canvas.addEventListener('touchmove', handleMouseMove, { passive: false });

      container.querySelector('#bowling-roll-btn').addEventListener('click', rollBall);
      container.querySelector('#bowling-reset-btn').addEventListener('click', () => {
        playClick();
        setupPins();
        currentVolume = 100;
        if (apiRef) apiRef.setVolume(1.0);
      });

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isRolling) {
          const standingTargetCount = Math.round(value / 10);
          pins.forEach((pin, idx) => {
            pin.standing = idx < standingTargetCount;
          });
        }
      }
    },

    destroy() {
      isRolling = false;
      cancelAnimationFrame(animFrameId);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
