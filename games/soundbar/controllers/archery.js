// Archery Volume Controller ("🏹")
// Drag bow string to aim & pull back. Release to shoot arrow. Target accuracy = volume.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  // Layout points
  const bowPos = { x: 80, y: 130 };
  const targetX = 360;
  const targetY = 130;
  const targetRadius = 40;

  // Arrow & shoot physics
  let isAiming = false;
  let pullBack = 0; // 0 to 60px
  let currentMouse = { x: 0, y: 0 };
  
  let arrow = { x: 80, y: 130, vx: 0, vy: 0, active: false, angle: 0 };

  function playSnapSound(tension = 1.0) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    // Snap string pluck sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150 + tension * 100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.18 * tension, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.start(); osc.stop(audioCtx.currentTime + 0.08);
  }

  function playHitSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    osc.start(); osc.stop(audioCtx.currentTime + 0.12);
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
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updatePhysics() {
    if (arrow.active) {
      arrow.x += arrow.vx;
      arrow.y += arrow.vy;
      arrow.vy += 0.08; // slight drop gravity

      arrow.angle = Math.atan2(arrow.vy, arrow.vx);

      // Hit Target boundary
      if (arrow.x >= targetX) {
        arrow.active = false;
        playHitSound();

        const hitDist = Math.abs(arrow.y - targetY);
        let pct = 1 - (hitDist / targetRadius);
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

    // Target rings
    const ringColors = [
      { r: targetRadius, bg: '#fffbcf', stroke: '#111' }, // Outer white
      { r: targetRadius * 0.75, bg: '#0072b5', stroke: '#fffbcf' }, // Blue
      { r: targetRadius * 0.5, bg: '#ff4a4a', stroke: '#fffbcf' }, // Red
      { r: targetRadius * 0.25, bg: '#ffb700', stroke: '#ff4a4a' } // Gold bull
    ];

    ringColors.forEach(ring => {
      ctx.fillStyle = ring.bg;
      ctx.strokeStyle = ring.stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(targetX, targetY, ring.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Bow drawing (bow arc + string)
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(bowPos.x, bowPos.y, 40, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Bow string lines
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isAiming) {
      const angle = Math.atan2(currentMouse.y - bowPos.y, currentMouse.x - bowPos.x);
      const pullX = bowPos.x + Math.cos(angle) * pullBack;
      const pullY = bowPos.y + Math.sin(angle) * pullBack;
      
      ctx.moveTo(bowPos.x, bowPos.y - 40);
      ctx.lineTo(pullX, pullY);
      ctx.lineTo(bowPos.x, bowPos.y + 40);
      ctx.stroke();

      // Render arrow loaded in bow
      ctx.save();
      ctx.translate(pullX, pullY);
      ctx.rotate(angle + Math.PI); // facing target
      drawArrowGraphic(0, 0);
      ctx.restore();

    } else {
      ctx.moveTo(bowPos.x, bowPos.y - 40);
      ctx.lineTo(bowPos.x, bowPos.y + 40);
      ctx.stroke();

      // Render static loaded arrow if not flying
      if (!arrow.active) {
        ctx.save();
        ctx.translate(bowPos.x, bowPos.y);
        // Find arrow position based on current volume
        const diff = (1 - (currentVolume / 100)) * targetRadius;
        // set height offset
        const targetOffset = targetY + (Math.random() < 0.5 ? diff : -diff);
        arrow.angle = Math.atan2(targetOffset - bowPos.y, targetX - bowPos.x);
        ctx.rotate(arrow.angle);
        drawArrowGraphic(0, 0);
        ctx.restore();
      }
    }

    // Render flying arrow
    if (arrow.active) {
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(arrow.angle);
      drawArrowGraphic(0, 0);
      ctx.restore();
    }

    updatePhysics();
    animFrameId = requestAnimationFrame(draw);
  }

  function drawArrowGraphic(x, y) {
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Arrow tip
    ctx.fillStyle = '#ff4a4a';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y - 4);
    ctx.lineTo(x - 6, y + 4);
    ctx.closePath(); ctx.fill();

    // Arrow fletchings feathers
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x - 36, y - 4);
    ctx.lineTo(x - 32, y);
    ctx.lineTo(x - 36, y + 4);
    ctx.closePath(); ctx.fill();
  }

  function handleMouseDown(e) {
    if (arrow.active) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = (clientX - rect.left) * (440 / rect.width);
    const mouseY = (clientY - rect.top) * (260 / rect.height);

    const dx = mouseX - bowPos.x;
    const dy = mouseY - bowPos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 45) {
      isAiming = true;
      currentMouse.x = mouseX;
      currentMouse.y = mouseY;
      playClick();
      if (e.cancelable) e.preventDefault();
    }
  }

  function handleMouseMove(e) {
    if (!isAiming) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = (clientX - rect.left) * (440 / rect.width);
    const mouseY = (clientY - rect.top) * (260 / rect.height);

    currentMouse.x = mouseX;
    currentMouse.y = mouseY;

    const dx = bowPos.x - currentMouse.x;
    const dy = bowPos.y - currentMouse.y;
    pullBack = Math.max(0, Math.min(60, Math.sqrt(dx * dx + dy * dy)));
  }

  function handleMouseUp() {
    if (!isAiming) return;
    isAiming = false;

    const dx = bowPos.x - currentMouse.x;
    const dy = bowPos.y - currentMouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 15) {
      const angle = Math.atan2(-dy, -dx);
      const force = Math.min(18, distance * 0.3);

      arrow.x = bowPos.x;
      arrow.y = bowPos.y;
      arrow.vx = Math.cos(angle) * force;
      arrow.vy = Math.sin(angle) * force;
      arrow.angle = angle;
      arrow.active = true;

      playSnapSound(distance / 60);
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.archery = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      arrow.active = false;
      isAiming = false;

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="archery-canvas" class="ball-canvas" width="440" height="260" style="display:block; width:100%; height:260px;"></canvas>
          <div class="ball-label">Pull bow string back to aim & shoot arrow at target!</div>
        </div>
      `;

      canvas = container.querySelector('#archery-canvas');
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

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
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
