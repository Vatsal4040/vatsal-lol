// Ball Shooter Controller ("🎯")
// Physics simulation: shoot ball, bounces off pachinko pegs and walls. Bounces onto track to set volume.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  const gravity = 0.35;
  const bounceLoss = 0.72;
  let ball = { x: 50, y: 250, vx: 0, vy: 0, radius: 8, isRolling: false, active: true };
  let cannon = { x: 50, y: 160, angle: -0.5, power: 12, maxPower: 25, isAiming: false };
  let dragStart = { x: 0, y: 0 };
  let currentMouse = { x: 0, y: 0 };

  const trackX = 50;
  const trackY = 240;
  const trackWidth = 380;

  // Pachinko-style circular pegs to bounce off
  const pegs = [
    { x: 160, y: 100, radius: 8 },
    { x: 260, y: 130, radius: 8 },
    { x: 330, y: 90, radius: 8 }
  ];

  // Target bonus zones drawn on the volume line
  const targets = [
    { start: 0.25, end: 0.38, color: 'rgba(52, 211, 153, 0.4)', label: 'EASY' },
    { start: 0.60, end: 0.72, color: 'rgba(245, 158, 11, 0.4)', label: 'MID' },
    { start: 0.82, end: 0.95, color: 'rgba(139, 92, 246, 0.4)', label: 'HARD' }
  ];

  function resetBall() {
    ball.x = cannon.x;
    ball.y = cannon.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.isRolling = false;
    ball.active = false;
  }

  function playBoing(velocity = 1.0, isPeg = false) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    const duration = isPeg ? 0.08 : 0.12 + (velocity * 0.08);
    const startFreq = isPeg ? 480 + (Math.random() * 200) : 160 + (velocity * 120);
    
    osc.type = isPeg ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isPeg ? startFreq * 1.5 : 90, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(isPeg ? 0.06 : 0.18 * velocity, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  }

  function playClick() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updatePhysics() {
    if (!ball.active) return;

    ball.vy += gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Roof bounce
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy * bounceLoss;
      playBoing(Math.abs(ball.vy) / 10);
    }

    // Wall bounce left/right
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx * bounceLoss;
      playBoing(Math.abs(ball.vx) / 10);
    } else if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.vx = -ball.vx * bounceLoss;
      playBoing(Math.abs(ball.vx) / 10);
    }

    // Peg collisions
    pegs.forEach(peg => {
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = ball.radius + peg.radius;

      if (dist < minDist) {
        // Simple bounce vector math
        const angle = Math.atan2(dy, dx);
        ball.x = peg.x + Math.cos(angle) * minDist;
        ball.y = peg.y + Math.sin(angle) * minDist;

        // Reflect velocity vector
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = Math.cos(angle) * speed * bounceLoss;
        ball.vy = Math.sin(angle) * speed * bounceLoss;

        playBoing(speed / 8, true);
      }
    });

    // Floor track bounce
    if (ball.y + ball.radius >= trackY) {
      ball.y = trackY - ball.radius;
      const impactVel = Math.abs(ball.vy);
      ball.vy = -ball.vy * bounceLoss;
      ball.vx *= 0.95;

      if (impactVel > 0.8) {
        playBoing(impactVel / 8);
      }

      if (ball.x >= trackX && ball.x <= trackX + trackWidth) {
        const pct = (ball.x - trackX) / trackWidth;
        const vol = Math.max(0, Math.min(100, Math.round(pct * 100)));
        if (vol !== currentVolume) {
          currentVolume = vol;
          if (apiRef) {
            apiRef.setVolume(currentVolume / 100);
          }
        }
      }

      if (Math.abs(ball.vy) < 0.25 && Math.abs(ball.vx) < 0.25) {
        ball.vy = 0;
        ball.vx = 0;
        ball.isRolling = true;
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Targets under the volume line
    targets.forEach(target => {
      const xStart = trackX + target.start * trackWidth;
      const xEnd = trackX + target.end * trackWidth;
      ctx.fillStyle = target.color;
      ctx.fillRect(xStart, trackY - 10, xEnd - xStart, 20);
      
      // Target Label
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(target.label, xStart + (xEnd - xStart) / 2, trackY - 14);
    });

    // Volume track line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(trackX, trackY);
    ctx.lineTo(trackX + trackWidth, trackY);
    ctx.stroke();

    const fillWidth = (currentVolume / 100) * trackWidth;
    ctx.strokeStyle = 'var(--accent-color)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(trackX, trackY);
    ctx.lineTo(trackX + fillWidth, trackY);
    ctx.stroke();

    // Pegs
    pegs.forEach(peg => {
      ctx.fillStyle = '#444455';
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Small peg inner pin
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cannon
    ctx.fillStyle = '#22222c';
    ctx.beginPath();
    ctx.arc(cannon.x, cannon.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(cannon.angle);
    ctx.fillStyle = '#444455';
    ctx.fillRect(0, -6, 20, 12);
    ctx.fillStyle = 'var(--accent-color)';
    ctx.fillRect(18, -8, 3, 16);
    ctx.restore();

    if (cannon.isAiming) {
      const dx = cannon.x - currentMouse.x;
      const dy = cannon.y - currentMouse.y;
      const force = Math.min(cannon.maxPower, Math.sqrt(dx * dx + dy * dy) * 0.15);
      const angle = Math.atan2(dy, dx);
      const vx = Math.cos(angle) * force;
      const vy = Math.sin(angle) * force;

      ctx.fillStyle = 'rgba(76, 201, 240, 0.3)';
      let tempX = cannon.x;
      let tempY = cannon.y;
      let tempVy = vy;

      for (let i = 0; i < 35; i += 2) {
        tempVy += gravity * 2;
        tempX += vx * 2;
        tempY += tempVy * 2;
        if (tempY > trackY) break;
        if (tempX < 0 || tempX > canvas.width) break;

        ctx.beginPath();
        ctx.arc(tempX, tempY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (ball.active) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'var(--accent-color)';
      ctx.fillStyle = 'var(--accent-color)';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    updatePhysics();
    animFrameId = requestAnimationFrame(draw);
  }

  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const mouseY = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const dx = mouseX - cannon.x;
    const dy = mouseY - cannon.y;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      cannon.isAiming = true;
      dragStart.x = mouseX;
      dragStart.y = mouseY;
      currentMouse.x = mouseX;
      currentMouse.y = mouseY;
      playClick();
      if (e.cancelable) e.preventDefault();
    }
  }

  function handleMouseMove(e) {
    if (!cannon.isAiming) return;
    const rect = canvas.getBoundingClientRect();
    currentMouse.x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    currentMouse.y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const dx = cannon.x - currentMouse.x;
    const dy = cannon.y - currentMouse.y;
    cannon.angle = Math.atan2(dy, dx);
  }

  function handleMouseUp() {
    if (!cannon.isAiming) return;
    cannon.isAiming = false;

    const dx = cannon.x - currentMouse.x;
    const dy = cannon.y - currentMouse.y;
    const force = Math.min(cannon.maxPower, Math.sqrt(dx * dx + dy * dy) * 0.15);
    
    if (force > 2) {
      ball.x = cannon.x + Math.cos(cannon.angle) * 16;
      ball.y = cannon.y + Math.sin(cannon.angle) * 16;
      ball.vx = Math.cos(cannon.angle) * force;
      ball.vy = Math.sin(cannon.angle) * force;
      ball.active = true;
      ball.isRolling = false;
      playBoing(force / 5);
    }
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) handleMouseDown(e.touches[0]);
  }
  function handleTouchMove(e) {
    if (e.touches.length === 1) {
      handleMouseMove(e.touches[0]);
      e.preventDefault();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.ball = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="ball-canvas" class="ball-canvas" width="440" height="260" style="display:block; width:100%; height:260px;"></canvas>
          <div class="ball-label">Launch speaker off pegs to hit Target Zones!</div>
        </div>
      `;

      canvas = container.querySelector('#ball-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 260 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '260px';

      resetBall();
      ball.x = trackX + (currentVolume / 100) * trackWidth;
      ball.y = trackY - ball.radius;
      ball.active = true;
      ball.isRolling = true;

      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (ball.isRolling) {
          ball.x = trackX + (value / 100) * trackWidth;
          ball.y = trackY - ball.radius;
        }
      }
    },

    destroy() {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
