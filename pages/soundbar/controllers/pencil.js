// Pencil Notepad Controller ("✏️")
// Freehand drawing notepad. Volume is determined by the height location of the drawing.

(function() {
  let containerElement = null;
  let canvas = null;
  let ctx = null;
  let currentVolume = 63;
  let apiRef = null;

  let isDrawing = false;
  let strokes = [];
  let detectTimeout = null;

  function playScratch() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    const bufferSize = audioCtx.sampleRate * 0.04;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + Math.random() * 400, audioCtx.currentTime);
    filter.Q.setValueAtTime(3.0, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    
    src.start();
  }

  function playCorrectChime() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
      osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  function drawNotebook() {
    if (!ctx) return;
    // Lined notebook page background
    ctx.fillStyle = '#fffdf0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red margin line
    ctx.strokeStyle = '#ffa3a3';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(50, canvas.height); ctx.stroke();

    // Notebook blue lines
    ctx.strokeStyle = '#e6f0fa';
    ctx.lineWidth = 1.2;
    for (let y = 30; y < 270; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Render strokes
    ctx.strokeStyle = 'rgba(50, 50, 60, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.length < 1) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
  }

  function startDrawing(e) {
    isDrawing = true;
    if (detectTimeout) clearTimeout(detectTimeout);
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (440 / rect.width);
    const y = (clientY - rect.top) * (240 / rect.height);
    
    strokes.push([{ x, y }]);
    playScratch();
    if (e.cancelable) e.preventDefault();
  }

  function drawStroke(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (440 / rect.width);
    const y = (clientY - rect.top) * (240 / rect.height);

    const currentStroke = strokes[strokes.length - 1];
    currentStroke.push({ x, y });
    
    if (Math.random() < 0.25) {
      playScratch();
    }

    drawNotebook();
  }

  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Set auto-detection timer (1.2 seconds after lifting pencil)
    detectTimeout = setTimeout(recognizeNumber, 1200);
  }

  function recognizeNumber() {
    if (strokes.length === 0) return;

    // Secret heuristic: parse handwritten volume based on height location of ink
    let totalY = 0;
    let pointCount = 0;
    strokes.forEach(s => {
      s.forEach(p => {
        totalY += p.y;
        pointCount++;
      });
    });

    const avgY = totalY / pointCount;
    // Map vertical coordinate (30px at top = 100%, 230px at bottom = 0%)
    let pct = (230 - avgY) / 200;
    pct = Math.max(0, Math.min(1, pct));
    const newVol = Math.max(1, Math.min(100, Math.round(pct * 100)));

    currentVolume = newVol;
    playCorrectChime();

    // Show handwritten detection notification
    const note = containerElement.querySelector('#pencil-detection-note');
    if (note) {
      note.textContent = `Recognized: ${newVol}% ✓`;
      note.style.opacity = 1;
    }

    if (apiRef) {
      apiRef.setVolume(newVol / 100);
    }
  }

  function clearNotepad() {
    strokes = [];
    isDrawing = false;
    if (detectTimeout) clearTimeout(detectTimeout);
    
    const note = containerElement.querySelector('#pencil-detection-note');
    if (note) {
      note.style.opacity = 0;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNotebook();
    playScratch();
  }

  window.controllers = window.controllers || {};
  window.controllers.pencil = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      strokes = [];

      container.innerHTML = `
        <div class="pencil-container" style="position: relative;">
          <canvas id="pencil-canvas" class="pencil-canvas" width="440" height="240" style="border:1.5px solid var(--border-color); border-radius:6px; display:block;"></canvas>
          
          <div id="pencil-detection-note" style="position: absolute; top: 12px; right: 16px; background: rgba(52, 211, 153, 0.95); color: #000; font-family: monospace; font-size: 0.85rem; font-weight: bold; padding: 4px 10px; border-radius: 4px; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;"></div>
          
          <button id="pencil-clear-btn" style="position: absolute; bottom: 12px; left: 16px; background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-secondary); font-family: inherit; font-size: 0.72rem; font-weight: bold; padding: 4px 10px; cursor: pointer; transition: all 0.2s ease;">Clear</button>
        </div>
      `;

      canvas = container.querySelector('#pencil-canvas');
      ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 240 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '240px';

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', drawStroke);
      window.addEventListener('mouseup', stopDrawing);

      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', drawStroke, { passive: false });
      window.addEventListener('touchend', stopDrawing);

      container.querySelector('#pencil-clear-btn').addEventListener('click', clearNotepad);

      drawNotebook();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        // Don't auto-scribble, just show detection box update
        const note = containerElement.querySelector('#pencil-detection-note');
        if (note) {
          note.textContent = `Recognized: ${value}% ✓`;
          note.style.opacity = 1;
        }
      }
    },

    destroy() {
      isDrawing = false;
      if (detectTimeout) clearTimeout(detectTimeout);
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('touchend', stopDrawing);
      containerElement = null;
      canvas = null;
      ctx = null;
      apiRef = null;
    }
  };
})();
