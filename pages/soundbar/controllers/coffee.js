// Coffee Machine Controller ("☕")
// Hold brew button to fill the coffee mug. Foam rises on top. Coffee height = volume.

(function() {
  let containerElement = null;
  let animFrameId = null;
  let apiRef = null;
  let currentVolume = 63;

  let isBrewing = false;
  let fillLevel = 63; // 0 to 100
  let currentRenderLevel = 63;

  let steamParticles = [];

  let audioCtx = null;
  let noiseSrc = null;
  let noiseGain = null;
  let brewInterval = null;

  function initLocalAudio() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  function startBrewSound() {
    initLocalAudio();
    if (!audioCtx || noiseSrc) return;

    // Steam bubbling noise
    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = buffer;
    noiseSrc.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.0, audioCtx.currentTime);

    noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.1);

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseSrc.start();

    // Bubble splats sound
    brewInterval = setInterval(() => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 + Math.random() * 200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }, 120);
  }

  function stopBrewSound() {
    if (noiseSrc) {
      try { noiseSrc.stop(); } catch (e) {}
      noiseSrc = null;
    }
    noiseGain = null;
    if (brewInterval) {
      clearInterval(brewInterval);
      brewInterval = null;
    }
  }

  function playClick() {
    initLocalAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(700, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  class SteamParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -0.5 - Math.random() * 0.6;
      this.alpha = 0.4 + Math.random() * 0.4;
      this.size = 2.5 + Math.random() * 4.5;
      this.life = 1.0;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.015;
      this.life -= 0.015;
    }
    draw(ctx) {
      ctx.fillStyle = `rgba(240, 240, 240, ${this.alpha * 0.25})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateCoffee() {
    if (isBrewing) {
      fillLevel = Math.min(100, fillLevel + 0.45);
    }
    currentRenderLevel += (fillLevel - currentRenderLevel) * 0.12;

    const roundedVol = Math.round(fillLevel);
    if (roundedVol !== currentVolume) {
      currentVolume = roundedVol;
      if (apiRef) {
        apiRef.setVolume(currentVolume / 100);
      }
    }

    if (currentRenderLevel > 1 && Math.random() < 0.12) {
      const mugYBase = 200;
      const mugHeight = 90;
      const liquidY = mugYBase - (currentRenderLevel / 100) * mugHeight;
      const randomX = 220 + (Math.random() - 0.5) * 56;
      steamParticles.push(new SteamParticle(randomX, liquidY - 5));
    }
  }

  function draw(canvas, ctx) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mugX = 220;
    const mugYBase = 200;
    const mugHeight = 90;
    const mugWidth = 72;

    // Coffee dispenser tap head
    ctx.fillStyle = '#2b2b35';
    ctx.fillRect(mugX - 20, 30, 40, 30);
    ctx.fillStyle = '#111';
    ctx.fillRect(mugX - 6, 60, 12, 8);

    // Drip stream
    if (isBrewing && fillLevel < 100) {
      ctx.strokeStyle = '#5a3d28';
      ctx.lineWidth = 3 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(mugX, 68);
      ctx.lineTo(mugX, mugYBase - (currentRenderLevel / 100) * mugHeight);
      ctx.stroke();
    }

    // Coffee inside Mug
    if (currentRenderLevel > 0.5) {
      ctx.save();
      // Clip path for inside mug
      ctx.beginPath();
      ctx.rect(mugX - mugWidth / 2 + 3, mugYBase - mugHeight + 3, mugWidth - 6, mugHeight - 6);
      ctx.clip();

      const liquidY = mugYBase - (currentRenderLevel / 100) * mugHeight;

      // Draw dark coffee liquid
      ctx.fillStyle = '#4a2c11';
      ctx.fillRect(mugX - mugWidth / 2, liquidY, mugWidth, mugYBase - liquidY);

      // Foam layer (white/froth gradient)
      const foamHeight = Math.min(12, (currentRenderLevel / 100) * 12);
      const foamGrad = ctx.createLinearGradient(mugX, liquidY, mugX, liquidY + foamHeight);
      foamGrad.addColorStop(0, '#f2e6d9');
      foamGrad.addColorStop(1, '#a8805b');
      ctx.fillStyle = foamGrad;
      ctx.fillRect(mugX - mugWidth / 2, liquidY, mugWidth, foamHeight);

      ctx.restore();
    }

    // Mug Glass/Ceramic outlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    
    // Mug body
    ctx.beginPath();
    ctx.rect(mugX - mugWidth / 2, mugYBase - mugHeight, mugWidth, mugHeight);
    ctx.stroke();

    // Handle on the right
    ctx.beginPath();
    ctx.arc(mugX + mugWidth / 2 + 1, mugYBase - mugHeight / 2, 14, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Steam particles rendering
    steamParticles = steamParticles.filter(p => p.life > 0);
    steamParticles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    updateCoffee();
    animFrameId = requestAnimationFrame(() => draw(canvas, ctx));
  }

  window.controllers = window.controllers || {};
  window.controllers.coffee = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);
      fillLevel = currentVolume;
      currentRenderLevel = currentVolume;
      steamParticles = [];

      container.innerHTML = `
        <div class="chai-container">
          <canvas id="coffee-canvas" class="chai-canvas" width="440" height="210" style="display:block; width:100%; height:210px;"></canvas>
          
          <div class="chai-controls">
            <button id="coffee-brew-btn" class="chai-btn fill" style="user-select:none; -webkit-user-select:none;">BREW COFFEE ☕</button>
            <button id="coffee-reset-btn" class="chai-btn drain">RESET MUG 🧽</button>
          </div>
        </div>
      `;

      const canvas = container.querySelector('#coffee-canvas');
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 440 * dpr;
      canvas.height = 210 * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '440px';
      canvas.style.height = '210px';

      const brewBtn = container.querySelector('#coffee-brew-btn');
      const resetBtn = container.querySelector('#coffee-reset-btn');

      const startBrew = (e) => {
        isBrewing = true;
        startBrewSound();
        playClick();
        if (e.cancelable) e.preventDefault();
      };
      const stopBrew = () => {
        if (isBrewing) {
          isBrewing = false;
          stopBrewSound();
          playClick();
        }
      };

      brewBtn.addEventListener('mousedown', startBrew);
      brewBtn.addEventListener('touchstart', startBrew, { passive: false });
      brewBtn.addEventListener('mouseup', stopBrew);
      brewBtn.addEventListener('mouseleave', stopBrew);
      brewBtn.addEventListener('touchend', stopBrew);

      resetBtn.addEventListener('click', () => {
        playClick();
        fillLevel = 0;
        currentVolume = 0;
        if (apiRef) apiRef.setVolume(0);
      });

      draw(canvas, ctx);
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        fillLevel = value;
      }
    },

    destroy() {
      isBrewing = false;
      stopBrewSound();
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
