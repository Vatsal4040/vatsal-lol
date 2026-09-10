// Crane Machine Controller ("🏗")
// Drag the crane claw left or right, then click "DROP" to release the speaker. Landing position = volume.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  let isDragging = false;
  let clawX = 220; // 50 to 390
  const clawY = 40;

  // Ball physics
  let ball = { x: 220, y: 40, vy: 0, active: false, radius: 10, isDropped: false };
  const groundY = 220;

  const trackX = 50;
  const trackWidth = 340;

  let audioCtx = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function playMotorSound() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
  }

  function playThumpSound() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
    osc.start(); osc.stop(audioCtx.currentTime + 0.18);
  }

  function updatePhysics() {
    if (ball.active) {
      ball.vy += 0.35; // gravity
      ball.y += ball.vy;

      if (ball.y >= groundY - ball.radius) {
        ball.y = groundY - ball.radius;
        ball.vy = 0;
        ball.active = false;
        playThumpSound();

        // Calculate landing volume on the track (50 to 390)
        let pct = (ball.x - trackX) / trackWidth;
        pct = Math.max(0, Math.min(1, pct));
        currentVolume = Math.round(pct * 100);
        if (apiRef) {
          apiRef.setVolume(currentVolume / 100);
        }
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track platform line at bottom
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(trackX, groundY);
    ctx.lineTo(trackX + trackWidth, groundY);
    ctx.stroke();

    // Volume fill level
    const fillWidth = (currentVolume / 100) * trackWidth;
    ctx.strokeStyle = 'var(--accent-color)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(trackX, groundY);
    ctx.lineTo(trackX + fillWidth, groundY);
    ctx.stroke();

    // Markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0%', trackX, groundY + 16);
    ctx.fillText('50%', trackX + trackWidth / 2, groundY + 16);
    ctx.fillText('100%', trackX + trackWidth, groundY + 16);

    // Overhead track rail
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 24);
    ctx.lineTo(410, 24);
    ctx.stroke();

    // Claw carriage/wheel box
    ctx.fillStyle = '#444455';
    ctx.fillRect(clawX - 16, 16, 32, 16);

    // Claw suspension cable
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(clawX, 32);
    ctx.lineTo(clawX, ball.active ? ball.y - ball.radius : clawY);
    ctx.stroke();

    // Claw prongs (draw claws around clawY)
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const cy = ball.active ? ball.y - ball.radius : clawY;
    const clawOpenOffset = ball.active ? 4 : 10;
    
    // Left prong
    ctx.beginPath();
    ctx.moveTo(clawX, cy);
    ctx.quadraticCurveTo(clawX - clawOpenOffset, cy + 6, clawX - clawOpenOffset, cy + 12);
    ctx.stroke();

    // Right prong
    ctx.beginPath();
    ctx.moveTo(clawX, cy);
    ctx.quadraticCurveTo(clawX + clawOpenOffset, cy + 6, clawX + clawOpenOffset, cy + 12);
    ctx.stroke();

    // Speaker Ball
    if (ball.active) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'var(--accent-color)';
      ctx.fillStyle = 'var(--accent-color)';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Speaker cone outline
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (!ball.isDropped) {
      // Attached to claw
      const bx = clawX;
      const by = clawY + ball.radius + 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'var(--accent-color)';
      ctx.fillStyle = 'var(--accent-color)';
      ctx.beginPath();
      ctx.arc(bx, by, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Lying on track base
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'var(--accent-color)';
      ctx.fillStyle = 'var(--accent-color)';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    updatePhysics();
    animFrameId = requestAnimationFrame(draw);
  }

  function dropSpeaker() {
    if (ball.active || isDragging) return;
    
    // Position ball at the claw bottom
    ball.x = clawX;
    ball.y = clawY + ball.radius + 2;
    ball.vy = 0;
    
    ball.active = true;
    ball.isDropped = true;
    playThumpSound();
  }

  function handleMouseDown(e) {
    if (ball.active) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const mouseX = (clientX - rect.left) * (440 / rect.width);
    const mouseY = (clientY - rect.top) * (260 / rect.height);

    if (mouseY < 80 && Math.abs(mouseX - clawX) < 40) {
      isDragging = true;
      playMotorSound();
      if (e.cancelable) e.preventDefault();
    }
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseX = (clientX - rect.left) * (440 / rect.width);

    clawX = Math.max(trackX, Math.min(trackX + trackWidth, mouseX));
    
    // Reset dropped state when moving claw around so they can drop again!
    ball.isDropped = false;

    if (Math.random() < 0.15) {
      playMotorSound();
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      playMotorSound();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.crane = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      clawX = trackX + (currentVolume / 100) * trackWidth;
      ball.x = clawX;
      ball.y = groundY - ball.radius;
      ball.active = false;
      ball.isDropped = true;

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="crane-canvas" class="ball-canvas" width="440" height="260" style="display:block; width:100%; height:260px;"></canvas>
          <div class="chai-controls" style="margin-top:6px; width:100%; justify-content:center;">
            <button id="crane-drop-btn" class="chai-btn fill" style="padding: 6px 16px; font-size:0.75rem;">DROP SPEAKER 🪂</button>
          </div>
        </div>
      `;

      canvas = container.querySelector('#crane-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 260 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '260px';

      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);

      container.querySelector('#crane-drop-btn').addEventListener('click', dropSpeaker);

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!ball.active) {
          clawX = trackX + (value / 100) * trackWidth;
          ball.x = clawX;
          ball.y = groundY - ball.radius;
          ball.isDropped = true;
        }
      }
    },

    destroy() {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
