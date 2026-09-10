// Rocket Launch Controller ("🚀")
// Drag rocket down to compress launcher spring. Release to launch. Peak altitude = volume.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  let isDragging = false;
  let dragStartY = 0;

  const centerX = 220;
  const groundY = 220;
  
  // Physics state
  let rocketY = 120; // 0 (top) to 220 (ground)
  let rocketVy = 0;
  let springCompression = 0; // 0 to 80
  let isFlying = false;
  let peakAltitude = 0; // 0 to 100%
  let gravity = 0.28;

  let audioCtx = null;
  let thrusterSrc = null;
  let thrusterGain = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function playLaunchSound() {
    initLocalAudio();
    if (!audioCtx) return;

    // Thruster rumble noise
    const bufferSize = audioCtx.sampleRate * 2.0;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    thrusterSrc = audioCtx.createBufferSource();
    thrusterSrc.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 1.5);

    thrusterGain = audioCtx.createGain();
    thrusterGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    thrusterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

    thrusterSrc.connect(filter);
    filter.connect(thrusterGain);
    thrusterGain.connect(audioCtx.destination);
    thrusterSrc.start();

    // High frequency release hiss
    const hissOsc = audioCtx.createOscillator();
    const hissGain = audioCtx.createGain();
    hissOsc.connect(hissGain); hissGain.connect(audioCtx.destination);
    hissOsc.type = 'triangle';
    hissOsc.frequency.setValueAtTime(90, audioCtx.currentTime);
    hissOsc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.3);
    hissGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    hissGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    hissOsc.start(); hissOsc.stop(audioCtx.currentTime + 0.3);
  }

  function playClick() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updatePhysics() {
    if (isFlying) {
      rocketVy += gravity;
      rocketY += rocketVy;

      // Track peak altitude (highest point is lowest Y coordinate)
      const currentAlt = Math.max(0, Math.min(100, Math.round(((groundY - rocketY) / groundY) * 100)));
      if (currentAlt > peakAltitude) {
        peakAltitude = currentAlt;
        currentVolume = peakAltitude;
        if (apiRef) {
          apiRef.setVolume(currentVolume / 100);
        }
      }

      // Landing / impact on ground
      if (rocketY >= groundY) {
        rocketY = groundY;
        rocketVy = 0;
        isFlying = false;
        springCompression = 0;
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars background (subtle static stars)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(80, 40, 2, 2);
    ctx.fillRect(340, 60, 2, 2);
    ctx.fillRect(150, 120, 1.5, 1.5);
    ctx.fillRect(290, 150, 2, 2);

    // Altitude lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let alt = 20; alt < groundY; alt += 40) {
      ctx.beginPath();
      ctx.moveTo(80, alt);
      ctx.lineTo(360, alt);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      const pct = Math.round(((groundY - alt) / groundY) * 100);
      ctx.fillText(`${pct}%`, 74, alt + 3);
    }

    // Spring base launcher
    ctx.strokeStyle = '#555566';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw compressed spring
    const springHeight = 35 - (springCompression * 0.35);
    const springTop = groundY - springHeight;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, groundY);
    let currY = groundY;
    let dir = 1;
    for (let i = 0; i < 6; i++) {
      currY -= springHeight / 6;
      ctx.lineTo(centerX + (dir * 12), currY);
      dir = -dir;
    }
    ctx.lineTo(centerX, springTop);
    ctx.stroke();

    // Launcher Launch Pad platform
    ctx.fillStyle = '#22222c';
    ctx.fillRect(centerX - 24, groundY, 48, 6);

    // Flame fire particles if flying upwards
    if (isFlying && rocketVy < 0) {
      const fWidth = 8 + Math.random() * 8;
      const fHeight = 15 + Math.random() * 20;
      const fireGrad = ctx.createLinearGradient(centerX, rocketY + 12, centerX, rocketY + 12 + fHeight);
      fireGrad.addColorStop(0, '#ffa500');
      fireGrad.addColorStop(0.4, '#ff4500');
      fireGrad.addColorStop(1, 'rgba(255, 69, 0, 0)');
      
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - fWidth / 2, rocketY + 12);
      ctx.lineTo(centerX, rocketY + 12 + fHeight);
      ctx.lineTo(centerX + fWidth / 2, rocketY + 12);
      ctx.closePath();
      ctx.fill();
    }

    // Rocket body
    ctx.save();
    ctx.translate(centerX, rocketY);

    // Fins
    ctx.fillStyle = '#ff4a4a';
    ctx.beginPath();
    ctx.moveTo(-12, 10);
    ctx.lineTo(-20, 16);
    ctx.lineTo(-12, 16);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(20, 16);
    ctx.lineTo(12, 16);
    ctx.closePath(); ctx.fill();

    // Body tube
    ctx.fillStyle = '#eeeeff';
    ctx.fillRect(-8, -12, 16, 24);

    // Nose cone
    ctx.fillStyle = '#ff4a4a';
    ctx.beginPath();
    ctx.moveTo(-8, -12);
    ctx.lineTo(0, -25);
    ctx.lineTo(8, -12);
    ctx.closePath(); ctx.fill();

    // Window
    ctx.fillStyle = 'var(--accent-color)';
    ctx.beginPath();
    ctx.arc(0, -3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Render peak altitude marker line
    if (peakAltitude > 0) {
      const peakY = groundY - (peakAltitude / 100) * groundY;
      ctx.strokeStyle = 'rgba(76, 201, 240, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(80, peakY);
      ctx.lineTo(360, peakY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'var(--accent-color)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Peak: ${peakAltitude}%`, 365, peakY + 3);
    }

    updatePhysics();
    animFrameId = requestAnimationFrame(draw);
  }

  function handleMouseDown(e) {
    if (isFlying) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const mouseY = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const dx = mouseX - centerX;
    const dy = mouseY - rocketY;

    if (Math.abs(dx) < 25 && dy > -30 && dy < 25) {
      isDragging = true;
      dragStartY = mouseY;
      playClick();
      if (e.cancelable) e.preventDefault();
    }
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    let diff = mouseY - dragStartY;
    diff = Math.max(0, Math.min(80, diff));
    springCompression = diff;
    rocketY = groundY - (springCompression * 0.35);

    if (Math.random() < 0.12) {
      playClick();
    }
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;

    if (springCompression > 8) {
      // Launch!
      isFlying = true;
      // spring compression directly translates to thrust velocity
      rocketVy = -(springCompression * 0.22);
      peakAltitude = 0;
      playLaunchSound();
    } else {
      // Reset position
      rocketY = groundY;
      springCompression = 0;
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.rocket = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      rocketY = groundY;
      rocketVy = 0;
      springCompression = 0;
      isFlying = false;
      peakAltitude = currentVolume;

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="rocket-canvas" class="ball-canvas" width="440" height="260" style="display:block; width:100%; height:260px;"></canvas>
          <div class="ball-label">Drag rocket down to load launcher, then release!</div>
        </div>
      `;

      canvas = container.querySelector('#rocket-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 260 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '260px';

      // Start position representing current volume
      rocketY = groundY - (currentVolume / 100) * groundY;

      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        if (!isFlying && !isDragging) {
          rocketY = groundY - (value / 100) * groundY;
          peakAltitude = value;
        }
      }
    },

    destroy() {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (thrusterSrc) {
        try { thrusterSrc.stop(); } catch (e) {}
      }
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
