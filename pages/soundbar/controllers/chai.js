// Chai Cup Fill Controller ("🥤")
// Hold fill button to pour chai, hold drain button to empty.
// Features: steam particles, pouring splash ripples, and cup wobble animations.

(function() {
  let containerElement = null;
  let animFrameId = null;
  let apiRef = null;
  let currentVolume = 63;

  let isFilling = false;
  let isDraining = false;

  let liquidLevel = 63;
  let currentRenderLevel = 63;

  let steamParticles = [];

  let audioCtx = null;
  let noiseBuffer = null;
  let waterSrc = null;
  let waterGain = null;
  let waterInterval = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    audioCtx = new AudioContextClass();
    const bufferSize = audioCtx.sampleRate * 2;
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  function startWaterSound(isDrain = false) {
    initLocalAudio();
    if (!audioCtx || !noiseBuffer || waterSrc) return;

    waterSrc = audioCtx.createBufferSource();
    waterSrc.buffer = noiseBuffer;
    waterSrc.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = isDrain ? 'lowpass' : 'bandpass';
    if (isDrain) {
      filter.frequency.setValueAtTime(250, audioCtx.currentTime);
    } else {
      filter.frequency.setValueAtTime(500, audioCtx.currentTime);
      filter.Q.setValueAtTime(2, audioCtx.currentTime);
    }

    waterGain = audioCtx.createGain();
    waterSrc.connect(filter); filter.connect(waterGain); waterGain.connect(audioCtx.destination);
    waterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    waterGain.gain.linearRampToValueAtTime(isDrain ? 0.08 : 0.05, audioCtx.currentTime + 0.1);
    waterSrc.start(audioCtx.currentTime);

    if (!isDrain) {
      waterInterval = setInterval(() => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const pop = audioCtx.createGain();
        osc.connect(pop); pop.connect(audioCtx.destination);
        osc.type = 'sine';
        const f = 800 + Math.random() * 1200;
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, audioCtx.currentTime + 0.02);
        pop.gain.setValueAtTime(0.02, audioCtx.currentTime);
        pop.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
        osc.start(); osc.stop(audioCtx.currentTime + 0.02);
      }, 80);
    } else {
      waterInterval = setInterval(() => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const pop = audioCtx.createGain();
        osc.connect(pop); pop.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120 + Math.random() * 80, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.06);
        pop.gain.setValueAtTime(0.04, audioCtx.currentTime);
        pop.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        osc.start(); osc.stop(audioCtx.currentTime + 0.06);
      }, 120);
    }
  }

  function stopWaterSound() {
    if (waterSrc) {
      try { waterSrc.stop(); } catch (e) {}
      waterSrc = null;
    }
    waterGain = null;
    if (waterInterval) {
      clearInterval(waterInterval);
      waterInterval = null;
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

  class SteamParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -0.6 - Math.random() * 0.8;
      this.alpha = 0.5 + Math.random() * 0.4;
      this.size = 3 + Math.random() * 5;
      this.life = 1.0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.012;
      this.life -= 0.012;
    }

    draw(ctx) {
      ctx.fillStyle = `rgba(224, 210, 190, ${this.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateChai() {
    if (isFilling) {
      liquidLevel = Math.min(100, liquidLevel + 0.6);
    } else if (isDraining) {
      liquidLevel = Math.max(0, liquidLevel - 0.8);
    }

    currentRenderLevel += (liquidLevel - currentRenderLevel) * 0.12;
    const roundedVol = Math.round(liquidLevel);
    
    if (roundedVol !== currentVolume) {
      currentVolume = roundedVol;
      if (apiRef) {
        apiRef.setVolume(currentVolume / 100);
      }
    }

    // Add steam particles if hot liquid exists
    if (currentRenderLevel > 1 && Math.random() < 0.16) {
      const cupYBase = 210;
      const cupHeight = 110;
      const liquidY = cupYBase - (currentRenderLevel / 100) * cupHeight;
      const cupWidthAtY = 55 + (currentRenderLevel / 100) * 14;
      const randomX = 220 + (Math.random() - 0.5) * (cupWidthAtY - 10);
      
      steamParticles.push(new SteamParticle(randomX, liquidY - 5));
    }
  }

  function draw(canvas, ctx) {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cup wobble physics offset (vobbles when filling or draining)
    let cupWobble = 0;
    if (isFilling || isDraining) {
      cupWobble = Math.sin(Date.now() * 0.045) * 1.6;
    }

    // Spill/faucet ripples animation value
    const rippleOffset = (isFilling || isDraining) ? Math.sin(Date.now() * 0.035) * 2.5 : 0;

    const cupX = 220 + cupWobble;
    const cupYBase = 210;
    const cupHeight = 110;
    const cupWidthTop = 75;
    const cupWidthBottom = 55;

    // Draw tap faucet
    ctx.strokeStyle = '#4e4e5e';
    ctx.lineWidth = 8;
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(170, 40);
    ctx.lineTo(220, 40);
    ctx.lineTo(220, 60);
    ctx.stroke();

    ctx.fillStyle = isFilling ? '#ff4a4a' : '#5c5c6c';
    ctx.beginPath();
    ctx.arc(220, 32, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw Pouring Chai liquid stream
    if (isFilling && liquidLevel < 100) {
      ctx.strokeStyle = '#c68d5c';
      ctx.lineWidth = 4 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(220, 60);
      ctx.lineTo(220, cupYBase - (currentRenderLevel / 100) * cupHeight);
      ctx.stroke();

      ctx.fillStyle = '#d29f73';
      ctx.beginPath();
      ctx.arc(220, cupYBase - (currentRenderLevel / 100) * cupHeight, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Liquid inside Cup
    if (currentRenderLevel > 0.5) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cupX - cupWidthTop / 2, cupYBase - cupHeight);
      ctx.lineTo(cupX + cupWidthTop / 2, cupYBase - cupHeight);
      ctx.lineTo(cupX + cupWidthBottom / 2, cupYBase);
      ctx.lineTo(cupX - cupWidthBottom / 2, cupYBase);
      ctx.closePath();
      ctx.clip();

      const liquidY = cupYBase - (currentRenderLevel / 100) * cupHeight + rippleOffset;
      const teaGrad = ctx.createLinearGradient(cupX - 40, liquidY, cupX + 40, cupYBase);
      teaGrad.addColorStop(0, '#a56c3c');
      teaGrad.addColorStop(0.5, '#c68d5c');
      teaGrad.addColorStop(1, '#824e23');

      ctx.fillStyle = teaGrad;
      ctx.fillRect(cupX - 80, liquidY, 160, cupYBase - liquidY + 20);

      // Liquid surface ripple highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fillRect(cupX - 80, liquidY, 160, 4);

      // Bubbles
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const bubbleCount = Math.floor(currentRenderLevel / 12);
      for (let i = 0; i < bubbleCount; i++) {
        const bX = cupX + Math.sin(i * 38) * (cupWidthBottom / 2 + (currentRenderLevel / 100) * 8);
        ctx.beginPath();
        ctx.arc(bX, liquidY + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Cup Glass Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    
    // Body
    ctx.beginPath();
    ctx.moveTo(cupX - cupWidthTop / 2, cupYBase - cupHeight);
    ctx.lineTo(cupX - cupWidthBottom / 2, cupYBase);
    ctx.lineTo(cupX + cupWidthBottom / 2, cupYBase);
    ctx.lineTo(cupX + cupWidthTop / 2, cupYBase - cupHeight);
    ctx.stroke();

    // Top rim ellipse
    ctx.beginPath();
    ctx.ellipse(cupX, cupYBase - cupHeight, cupWidthTop / 2, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.arc(cupX + cupWidthTop / 2 - 4, cupYBase - cupHeight / 2, 16, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Steam particles
    steamParticles = steamParticles.filter(p => p.life > 0);
    steamParticles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    // Draw Drain Stream
    if (isDraining && currentRenderLevel > 1) {
      ctx.strokeStyle = '#c68d5c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cupX, cupYBase);
      ctx.lineTo(cupX, cupYBase + 30);
      ctx.stroke();
    }

    updateChai();
    animFrameId = requestAnimationFrame(() => draw(canvas, ctx));
  }

  window.controllers = window.controllers || {};
  window.controllers.chai = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      liquidLevel = currentVolume;
      currentRenderLevel = currentVolume;
      steamParticles = [];

      container.innerHTML = `
        <div class="chai-container">
          <canvas id="chai-canvas" class="chai-canvas" width="440" height="200" style="display:block; width:100%; height:200px;"></canvas>
          
          <div class="chai-controls">
            <button id="chai-fill-btn" class="chai-btn fill">POUR CHAI 🥤</button>
            <button id="chai-drain-btn" class="chai-btn drain">DRAIN CUP 🪠</button>
          </div>
        </div>
      `;

      const canvas = container.querySelector('#chai-canvas');
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 200 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '200px';

      const fillBtn = container.querySelector('#chai-fill-btn');
      const drainBtn = container.querySelector('#chai-drain-btn');

      const startFill = (e) => {
        isFilling = true;
        isDraining = false;
        startWaterSound(false);
        playClick();
        if (e.cancelable) e.preventDefault();
      };
      const stopFill = () => {
        if (isFilling) {
          isFilling = false;
          stopWaterSound();
          playClick();
        }
      };

      fillBtn.addEventListener('mousedown', startFill);
      fillBtn.addEventListener('touchstart', startFill, { passive: false });
      fillBtn.addEventListener('mouseup', stopFill);
      fillBtn.addEventListener('mouseleave', stopFill);
      fillBtn.addEventListener('touchend', stopFill);

      const startDrain = (e) => {
        isDraining = true;
        isFilling = false;
        startWaterSound(true);
        playClick();
        if (e.cancelable) e.preventDefault();
      };
      const stopDrain = () => {
        if (isDraining) {
          isDraining = false;
          stopWaterSound();
          playClick();
        }
      };

      drainBtn.addEventListener('mousedown', startDrain);
      drainBtn.addEventListener('touchstart', startDrain, { passive: false });
      drainBtn.addEventListener('mouseup', stopDrain);
      drainBtn.addEventListener('mouseleave', stopDrain);
      drainBtn.addEventListener('touchend', stopDrain);

      draw(canvas, ctx);
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        liquidLevel = value;
      }
    },

    destroy() {
      isFilling = false;
      isDraining = false;
      stopWaterSound();
      cancelAnimationFrame(animFrameId);
      containerElement = null;
      apiRef = null;
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }
  };
})();
