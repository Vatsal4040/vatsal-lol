// Dart Board Controller ("🎯")
// Throw a dart at the target. Distance from the bullseye center determines the volume.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let currentVolume = 63;
  let apiRef = null;

  const boardCenter = { x: 220, y: 120 };
  const boardRadius = 100;

  // Darts history list
  let darts = []; // objects with { x, y, angle }

  function playThudSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    // Thud sound using noise and exponential filter
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    src.start();

    // Small metallic ping for dart hit
    const ping = audioCtx.createOscillator();
    const pingGain = audioCtx.createGain();
    ping.connect(pingGain); pingGain.connect(audioCtx.destination);
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(700, audioCtx.currentTime);
    pingGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    pingGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    ping.start(); ping.stop(audioCtx.currentTime + 0.08);
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

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = boardCenter.x;
    const cy = boardCenter.y;
    const r = boardRadius;

    // Outer wire frame
    ctx.strokeStyle = '#22222c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric rings (traditional alternate red/green/black/white look)
    const ringColors = [
      { r: r, bg: '#111', stroke: '#fffbcf' },       // Double ring
      { r: r * 0.9, bg: '#fffbcf', stroke: '#111' }, // Outer single
      { r: r * 0.6, bg: '#111', stroke: '#ff4a4a' }, // Triple ring
      { r: r * 0.52, bg: '#ff4a4a', stroke: '#111' },// Inner single
      { r: r * 0.16, bg: '#34d399', stroke: '#fffbcf' }, // Bull
      { r: r * 0.06, bg: '#ff4a4a', stroke: 'none' }  // Double Bull
    ];

    ringColors.forEach(ring => {
      ctx.fillStyle = ring.bg;
      ctx.strokeStyle = ring.stroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.fill();
      if (ring.stroke !== 'none') ctx.stroke();
    });

    // Radial spokes wires
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.stroke();
    }

    // Render thrown darts
    darts.forEach(dart => {
      ctx.save();
      ctx.translate(dart.x, dart.y);
      ctx.rotate(dart.angle);
      
      // Shadow for depth
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(-2, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Dart flight fins
      ctx.fillStyle = '#ff4a4a';
      ctx.beginPath();
      ctx.moveTo(-16, -5);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-16, 5);
      ctx.closePath(); ctx.fill();

      // Dart barrel body shaft
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-2, 0);
      ctx.stroke();

      // Point pin tip center
      ctx.fillStyle = 'var(--accent-color)';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    animFrameId = requestAnimationFrame(draw);
  }

  function handleBoardClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (440 / rect.width);
    const y = (clientY - rect.top) * (260 / rect.height);

    const dx = x - boardCenter.x;
    const dy = y - boardCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate volume based on distance (exact center = 100%, boardRadius = 0%)
    let pct = 1 - (dist / boardRadius);
    pct = Math.max(0, Math.min(1, pct));
    const newVol = Math.round(pct * 100);

    // Add dart
    const randAngle = Math.random() * Math.PI * 2;
    darts.push({ x, y, angle: randAngle });
    if (darts.length > 5) {
      darts.shift(); // keep only last 5 darts on board
    }

    playThudSound();

    currentVolume = newVol;
    if (apiRef) {
      apiRef.setVolume(newVol / 100);
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.dart = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      
      // Calculate a dart position representing current volume
      darts = [];
      const dist = (1 - (currentVolume / 100)) * boardRadius;
      const angle = -Math.PI / 4; // angle offset
      darts.push({
        x: boardCenter.x + Math.cos(angle) * dist,
        y: boardCenter.y + Math.sin(angle) * dist,
        angle: Math.PI / 6
      });

      container.innerHTML = `
        <div class="ball-container">
          <canvas id="dart-canvas" class="ball-canvas" width="440" height="260" style="display:block; width:100%; height:260px;"></canvas>
          <div class="ball-label" id="dart-label">Click on target to throw a dart! Bullseye = 100%</div>
        </div>
      `;

      canvas = container.querySelector('#dart-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 260 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '260px';

      canvas.addEventListener('mousedown', handleBoardClick);
      canvas.addEventListener('touchstart', handleBoardClick, { passive: false });

      draw();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        // Don't add a new dart, just move the last one
        if (darts.length > 0) {
          const dist = (1 - (value / 100)) * boardRadius;
          const angle = -Math.PI / 4;
          darts[darts.length - 1].x = boardCenter.x + Math.cos(angle) * dist;
          darts[darts.length - 1].y = boardCenter.y + Math.sin(angle) * dist;
        }
      }
    },

    destroy() {
      cancelAnimationFrame(animFrameId);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
