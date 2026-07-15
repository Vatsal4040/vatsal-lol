// Solar Eclipse Controller ("🌞")
// Drag the moon to cover the sun. Volume = covered area percentage.
// Darkens the page background and grows the corona glow as coverage increases.

(function() {
  let containerElement = null;
  let moonEl = null;
  let coronaEl = null;
  let overlayEl = null;
  let valueDisplayEl = null;
  let apiRef = null;

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  const sunCenter = { x: 220, y: 120 };
  let moonPos = { x: 220, y: 120 };
  let currentVolume = 63;

  function playSwell(intensity = 1.0) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(75, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(75 + (intensity * 40), audioCtx.currentTime + 0.4);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120 + (intensity * 300), audioCtx.currentTime + 0.4);
    filter.Q.setValueAtTime(4.0, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12 * intensity, audioCtx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc.start(); osc.stop(audioCtx.currentTime + 0.45);
  }

  function playClick() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
  }

  function updateEclipse() {
    const dx = moonPos.x - sunCenter.x;
    const dy = moonPos.y - sunCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Coverage maps from 0 (at 100px dist) to 100 (at 0px overlap)
    const coverage = Math.max(0, Math.min(100, Math.round(100 - dist)));
    currentVolume = coverage;

    if (moonEl) {
      moonEl.setAttribute('cx', moonPos.x);
      moonEl.setAttribute('cy', moonPos.y);
    }

    if (coronaEl) {
      const scale = 1 + (coverage / 100) * 0.75;
      const opacity = 0.2 + (coverage / 100) * 0.8;
      coronaEl.style.transform = `translate(${sunCenter.x}px, ${sunCenter.y}px) scale(${scale})`;
      coronaEl.style.opacity = opacity;
    }

    if (overlayEl) {
      // Subtle darkening: max opacity 0.82 to avoid pure screen blacking out
      overlayEl.style.opacity = (coverage / 100) * 0.82;
    }

    if (valueDisplayEl) {
      valueDisplayEl.textContent = `Eclipse Coverage: ${coverage}%`;
    }

    if (isDragging && Math.random() < 0.15) {
      playSwell(coverage / 100);
    }

    if (apiRef) {
      apiRef.setVolume(coverage / 100);
    }
  }

  function onMouseDown(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const moonBoundingRect = moonEl.getBoundingClientRect();
    const moonScreenCenterX = moonBoundingRect.left + moonBoundingRect.width / 2;
    const moonScreenCenterY = moonBoundingRect.top + moonBoundingRect.height / 2;
    const dist = Math.sqrt(Math.pow(clientX - moonScreenCenterX, 2) + Math.pow(clientY - moonScreenCenterY, 2));

    if (dist < 55) {
      isDragging = true;
      dragOffset.x = clientX - moonScreenCenterX;
      dragOffset.y = clientY - moonScreenCenterY;
      moonEl.style.cursor = 'grabbing';
      playClick();
      if (e.cancelable) e.preventDefault();
    }
  }

  function onMouseMove(e) {
    if (!isDragging) return;

    const svg = containerElement.querySelector('.eclipse-svg');
    const svgRect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = 440 / svgRect.width;
    const scaleY = 240 / svgRect.height;
    
    moonPos.x = (clientX - svgRect.left - dragOffset.x) * scaleX;
    moonPos.y = (clientY - svgRect.top - dragOffset.y) * scaleY;

    moonPos.x = Math.max(20, Math.min(420, moonPos.x));
    moonPos.y = Math.max(20, Math.min(220, moonPos.y));

    updateEclipse();
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      if (moonEl) moonEl.style.cursor = 'grab';
      playClick();
    }
  }

  window.controllers = window.controllers || {};
  window.controllers.eclipse = {
    init(container, api) {
      containerElement = container;
      apiRef = api;
      currentVolume = Math.round(api.getVolume() * 100);

      const dist = 100 - currentVolume;
      moonPos.x = sunCenter.x + dist;
      moonPos.y = sunCenter.y;

      container.innerHTML = `
        <div class="eclipse-container">
          <div class="sun-corona" id="eclipse-corona" style="left:0; top:0; transform-origin: 0 0; position: absolute; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, #fffbcf 0%, #ff7700 60%, rgba(255, 119, 0, 0) 100%); filter: blur(8px); pointer-events: none; left: calc(50% - 50px); top: calc(50% - 70px); opacity: 0.3; transition: transform 0.1s ease, opacity 0.1s ease;"></div>
          
          <svg class="eclipse-svg" viewBox="0 0 440 240" style="display:block;">
            <defs>
              <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fffbcf" />
                <stop offset="60%" stop-color="#ffb700" />
                <stop offset="100%" stop-color="#ff7700" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="moon-grad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#2a2a35" />
                <stop offset="70%" stop-color="#14141a" />
                <stop offset="100%" stop-color="#0a0a0d" />
              </radialGradient>
              <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle id="sun-element" cx="${sunCenter.x}" cy="${sunCenter.y}" r="45" fill="url(#sun-grad)" filter="url(#glow-filter)" />
            <circle id="moon-element" cx="${moonPos.x}" cy="${moonPos.y}" r="44" fill="url(#moon-grad)" style="cursor: grab;" />
          </svg>

          <div class="eclipse-label" id="eclipse-value-display">Eclipse Coverage: ${currentVolume}%</div>
        </div>
      `;

      moonEl = container.querySelector('#moon-element');
      coronaEl = container.querySelector('#eclipse-corona');
      valueDisplayEl = container.querySelector('#eclipse-value-display');

      overlayEl = document.getElementById('eclipse-dim-overlay');
      if (!overlayEl) {
        overlayEl = document.createElement('div');
        overlayEl.id = 'eclipse-dim-overlay';
        overlayEl.className = 'eclipse-dim-overlay';
        document.body.appendChild(overlayEl);
      }

      moonEl.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      moonEl.addEventListener('touchstart', onMouseDown, { passive: false });
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);

      updateEclipse();
    },

    setVolume(value) {
      if (value !== currentVolume) {
        currentVolume = value;
        const dist = 100 - value;
        moonPos.x = sunCenter.x + dist;
        moonPos.y = sunCenter.y;
        updateEclipse();
      }
    },

    destroy() {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);

      if (overlayEl) {
        overlayEl.style.opacity = 0;
        setTimeout(() => {
          if (overlayEl && !isDragging) {
            overlayEl.remove();
            overlayEl = null;
          }
        }, 200);
      }

      containerElement = null;
      moonEl = null;
      coronaEl = null;
      valueDisplayEl = null;
      apiRef = null;
    }
  };
})();
