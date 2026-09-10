// Seesaw Controller ("⚖️")
// Physics balance: drag plank ends to tilt, ball rolls.
// Registers to window.controllers.seesaw

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let apiRef = null;

  let isDragging = false;
  let currentVolume = 63;

  const gravity = 0.18;
  const friction = 0.985;
  const bounceLoss = 0.55;

  const pivotX = 220;
  const pivotY = 160;
  const plankLength = 320;

  let plankAngle = 0;
  let targetPlankAngle = 0;
  let ballPos = 0;
  let ballVel = 0;
  const ballRadius = 10;

  function playBoing(velocity = 1.0) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + velocity * 90, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12 * velocity, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.start(); osc.stop(audioCtx.currentTime + 0.12);
  }

  function playTiltSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, audioCtx.currentTime);
    filter.Q.setValueAtTime(8, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updatePhysics() {
    plankAngle += (targetPlankAngle - plankAngle) * 0.12;

    const accel = gravity * Math.sin(plankAngle);
    
    ballVel += accel;
    ballVel *= friction;
    ballPos += ballVel;

    const maxPos = (plankLength / 2) - ballRadius;
    
    if (ballPos > maxPos) {
      ballPos = maxPos;
      if (Math.abs(ballVel) > 0.4) {
        playBoing(Math.abs(ballVel) / 5);
      }
      ballVel = -ballVel * bounceLoss;
    } else if (ballPos < -maxPos) {
      ballPos = -maxPos;
      if (Math.abs(ballVel) > 0.4) {
        playBoing(Math.abs(ballVel) / 5);
      }
      ballVel = -ballVel * bounceLoss;
    }

    const pct = (ballPos + maxPos) / (maxPos * 2);
    const vol = Math.max(0, Math.min(100, Math.round(pct * 100)));
    
    if (vol !== currentVolume) {
      currentVolume = vol;
      if (apiRef) {
        apiRef.setVolume(vol / 100);
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#22222c';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX - 20, pivotY + 50);
    ctx.lineTo(pivotX + 20, pivotY + 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4e4e5e';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(plankAngle);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.fillRect(-plankLength / 2, -5, plankLength, 10);
    ctx.strokeRect(-plankLength / 2, -5, plankLength, 10);

    ctx.strokeStyle = 'var(--accent-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-plankLength / 2, -5);
    ctx.lineTo(plankLength / 2, -5);
    ctx.stroke();

    ctx.fillStyle = '#ff4a4a';
    ctx.fillRect(-plankLength / 2 - 2, -15, 4, 20);
    ctx.fillStyle = 'var(--accent-color)';
    ctx.fillRect(plankLength / 2 - 2, -15, 4, 20);

    const ballX = ballPos;
    const ballY = -5 - ballRadius;
    
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'var(--accent-color)';
    
    const sphereGrad = ctx.createRadialGradient(ballX - 3, ballY - 3, 2, ballX, ballY, ballRadius);
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.3, 'var(--accent-color)');
    sphereGrad.addColorStop(1, '#005a87');
    
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Seesaw volume: ${currentVolume}%`, pivotX, 40);

    updatePhysics();
    animFrameId = requestAnimationFrame(draw);
  }

  function handleTilt(clientX, clientY) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left) * (440 / rect.width);
    const mouseY = (clientY - rect.top) * (260 / rect.height);

    const dx = mouseX - pivotX;
    const dy = mouseY - pivotY;

    let angle = Math.atan2(dy, dx);
    if (dx < 0) {
      angle = angle > 0 ? angle - Math.PI : angle + Math.PI;
    }
    
    const maxAngle = 22 * (Math.PI / 180);
    targetPlankAngle = Math.max(-maxAngle, Math.min(maxAngle, angle));

    if (Math.abs(targetPlankAngle - plankAngle) > 0.03 && Math.random() < 0.12) {
      playTiltSound();
    }
  }

  function onMouseDown(e) {
    if (!canvas) return;
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    handleTilt(clientX, clientY);
    if (e.cancelable) e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging || !canvas) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    handleTilt(clientX, clientY);
  }

  function onMouseUp() {
    isDragging = false;
  }

  window.controllers = window.controllers || {};
  window.controllers.seesaw = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      const maxPos = (plankLength / 2) - ballRadius;
      const pct = currentVolume / 100;
      ballPos = -maxPos + pct * (maxPos * 2);
      ballVel = 0;
      plankAngle = 0;
      targetPlankAngle = 0;

      container.innerHTML = `
        <div class="seesaw-container">
          <canvas id="seesaw-canvas" class="seesaw-canvas" width="440" height="260" style="display:block; width:100%; height:260px;"></canvas>
          <div class="ball-label">Drag plank ends left/right to balance the ball!</div>
        </div>
      `;

      canvas = container.querySelector('#seesaw-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 260 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '260px';

      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      canvas.addEventListener('touchstart', onMouseDown, { passive: false });
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isDragging) {
          const maxPos = (plankLength / 2) - ballRadius;
          const pct = value / 100;
          ballPos = -maxPos + pct * (maxPos * 2);
          ballVel = 0;
        }
      }
    },

    destroy() {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
