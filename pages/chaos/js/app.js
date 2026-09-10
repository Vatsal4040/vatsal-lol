/* ==========================================================================
   CHAOS Core Application logic (v2 - Sticker Card Architecture)
   Vanilla JavaScript - Direct UI integration, Web Audio API CORS fix
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let sounds = [];
  let presets = {};
  const activeSoundIds = new Set(); // Stores IDs of sounds that are active (either playing or paused)
  let reduceMotion = false;

  // Particle tracking intervals map (key: soundId, value: intervalId)
  const particleIntervals = new Map();

  // Intentional display order of 30 sounds (non-alphabetical)
  const displayOrder = [
    "rain", "coffee", "volcano", "forest", "hospital", "campfire",
    "construction", "waves", "alien", "office", "casino", "wind",
    "zombie", "train", "dentist", "barn", "lofi", "fireworks",
    "highway", "carnival", "battle", "bee", "playground", "couple",
    "church", "crime", "lawnmower", "haunted", "nuclear", "marching"
  ];

  // DOM Elements
  const soundGrid = document.getElementById('sound-grid');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const presetsCarousel = document.getElementById('presets-carousel');
  const surpriseMeBtn = document.getElementById('surprise-me-btn');
  
  const masterVolumeSlider = document.getElementById('master-volume-slider');
  const masterVolumeText = document.getElementById('master-volume-text');
  

  
  const chaosMeterFill = document.getElementById('chaos-meter-fill');
  const chaosMeterText = document.getElementById('chaos-meter-text');
  const chaosMeterContainer = document.querySelector('.chaos-meter-container');
  const toastContainer = document.getElementById('toast-container');

  // Initial Bootstrapping
  function init() {
    loadSettings();
    loadConfig();
    renderSoundGrid();
    renderPresetsShelf();
    setupEventListeners();
    updateChaosMeter();
  }

  // Load configuration from local script (data.js)
  function loadConfig() {
    sounds = window.soundsData || [];
    presets = window.presetsData || {};
  }

  // Load settings from localStorage
  function loadSettings() {
    // Unlocked Presets
    const savedUnlocked = localStorage.getItem('chaos_unlocked_presets');
    if (savedUnlocked) {
      try {
        unlockedPresets = new Set(JSON.parse(savedUnlocked));
      } catch (err) {
        console.error("Failed to parse unlocked presets:", err);
      }
    }

    // Master Volume
    const savedMasterVol = localStorage.getItem('chaos_master_volume');
    if (savedMasterVol !== null) {
      const vol = parseFloat(savedMasterVol);
      masterVolumeSlider.value = vol;
      masterVolumeText.textContent = `${Math.round(vol * 100)}%`;
    }

    // Reduce Motion
    const savedReduceMotion = localStorage.getItem('chaos_reduce_motion');
    if (savedReduceMotion === 'true') {
      reduceMotion = true;
      document.body.classList.add('reduce-motion');
    }
  }

  // Setup layout events
  function setupEventListeners() {
    // Master volume slider
    masterVolumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      masterVolumeText.textContent = `${Math.round(vol * 100)}%`;
      window.audioManager.setMasterVolume(vol);
    });

    // Clear All active sounds
    clearAllBtn.addEventListener('click', () => {
      window.audioManager.stopAll();
      
      // Toggle all playing/paused cards off
      activeSoundIds.forEach(soundId => {
        const card = document.querySelector(`.sound-card[data-id="${soundId}"]`);
        if (card) {
          card.classList.remove('playing', 'paused', 'muted');
          // Reset slider value to default 0.8 and hide it
          const slider = card.querySelector('.sound-volume-slider');
          const percentText = card.querySelector('.volume-percentage-text');
          if (slider) slider.value = 0.8;
          if (percentText) percentText.textContent = '80%';
        }
        stopParticleEffect(soundId);
      });
      
      activeSoundIds.clear();
      updateChaosMeter();
    });

    // Surprise Me
    surpriseMeBtn.addEventListener('click', () => {
      triggerSurpriseMe();
    });


  }

  // Render Sound Grid cards
  function renderSoundGrid() {
    soundGrid.innerHTML = '';

    // Render in intentional display order
    displayOrder.forEach(soundId => {
      const sound = sounds.find(s => s.id === soundId);
      if (!sound) return;

      const card = document.createElement('div');
      card.className = 'sound-card';
      card.setAttribute('data-id', sound.id);

      // Random rotational wobbly tilt for sticker feel
      const baseTilt = (Math.random() * 3 - 1.5).toFixed(2);
      card.style.transform = `rotate(${baseTilt}deg)`;
      card.dataset.tilt = baseTilt;

      card.innerHTML = `
        <button class="remove-card-btn" title="Remove sound">✕</button>
        <span class="sound-name">${sound.name}</span>
        <div class="mascot-icon-container">
          <img src="assets/icons/${sound.icon}" alt="${sound.name}" class="mascot-icon">
        </div>
        <div class="card-slider-container">
          <input type="range" class="hand-slider sound-volume-slider" min="0" max="1" step="0.02" value="0.8">
          <span class="volume-percentage-text">80%</span>
        </div>
      `;

      // Set up hand-drawn card bounce/squash animations
      card.addEventListener('mouseenter', () => {
        if (reduceMotion) return;
        const tilt = parseFloat(card.dataset.tilt);
        card.style.transform = `translateY(-4px) rotate(${tilt + 0.8}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        const tilt = parseFloat(card.dataset.tilt);
        card.style.transform = `translateY(0) rotate(${tilt}deg) scale(1)`;
      });

      card.addEventListener('mousedown', () => {
        if (reduceMotion) return;
        const tilt = parseFloat(card.dataset.tilt);
        card.style.transform = `translateY(-2px) rotate(${tilt}deg) scale(0.96)`;
      });

      card.addEventListener('mouseup', () => {
        if (reduceMotion) return;
        const tilt = parseFloat(card.dataset.tilt);
        card.style.transform = `translateY(-4px) rotate(${tilt + 0.8}deg) scale(1.02)`;
      });

      // Slider stop propagation to prevent card toggle when sliding volume
      const sliderContainer = card.querySelector('.card-slider-container');
      const volumeSlider = card.querySelector('.sound-volume-slider');
      const percentageText = card.querySelector('.volume-percentage-text');

      sliderContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from toggling sound
      });

      volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        percentageText.textContent = `${Math.round(vol * 100)}%`;
        window.audioManager.setSoundVolume(sound.id, vol);

        // If the sound was paused/muted, dragging the volume slider automatically resumes it
        const activeNode = window.audioManager.activeSounds.get(sound.id);
        if (activeNode && activeNode.muted) {
          resumeSoundCard(sound, card, vol);
        }
      });

      // Remove button listener
      const removeBtn = card.querySelector('.remove-card-btn');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from toggling sound
        removeSoundCard(sound.id, card);
      });

      // Sticker card click play/pause toggle trigger
      card.addEventListener('click', () => {
        toggleSoundCard(sound, card);
      });

      soundGrid.appendChild(card);
    });
  }

  // Toggles play/pause/idle states on click
  function toggleSoundCard(sound, card) {
    if (!activeSoundIds.has(sound.id)) {
      // Idle -> Playing
      activeSoundIds.add(sound.id);
      
      const slider = card.querySelector('.sound-volume-slider');
      const vol = slider ? parseFloat(slider.value) : 0.8;
      
      window.audioManager.playSound(sound, vol);
      card.classList.add('playing');
      card.classList.remove('paused');
      
      startParticleEffect(sound);
    } else {
      // Toggle Playing <-> Paused (using mute under the hood for smooth transition)
      const activeNode = window.audioManager.activeSounds.get(sound.id);
      const isCurrentlyPlaying = activeNode && !activeNode.muted;

      if (isCurrentlyPlaying) {
        // Playing -> Paused
        window.audioManager.setSoundMute(sound.id, true);
        card.classList.remove('playing');
        card.classList.add('paused');
        stopParticleEffect(sound.id);
      } else {
        // Paused -> Playing
        const slider = card.querySelector('.sound-volume-slider');
        const vol = slider ? parseFloat(slider.value) : 0.8;
        resumeSoundCard(sound, card, vol);
      }
    }

    updateChaosMeter();
    checkHiddenPresetUnlocks();
  }

  // Helper to resume/unmute card state
  function resumeSoundCard(sound, card, targetVol) {
    window.audioManager.setSoundMute(sound.id, false);
    window.audioManager.setSoundVolume(sound.id, targetVol);
    card.classList.add('playing');
    card.classList.remove('paused');
    startParticleEffect(sound);
  }

  // Helper to fully remove sound from active mix (return to Idle)
  function removeSoundCard(soundId, card) {
    activeSoundIds.delete(soundId);
    window.audioManager.stopSound(soundId);
    
    card.classList.remove('playing', 'paused', 'muted');
    stopParticleEffect(soundId);
    
    // Reset volume slider to default
    const slider = card.querySelector('.sound-volume-slider');
    const percentText = card.querySelector('.volume-percentage-text');
    if (slider) slider.value = 0.8;
    if (percentText) percentText.textContent = '80%';

    updateChaosMeter();
  }

  // Render Presets Shelf carousel cards
  function renderPresetsShelf() {
    presetsCarousel.innerHTML = '';

    if (!presets.standard) return;

    // Render standard visible presets
    presets.standard.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.innerHTML = `
        <div class="preset-cover-wrapper">
          <img src="assets/icons/${preset.cover}" alt="${preset.title}" class="preset-cover">
        </div>
        <span class="preset-title-text">${preset.title}</span>
      `;
      card.addEventListener('click', () => {
        loadPresetMix(preset);
      });
      presetsCarousel.appendChild(card);
    });

    // Render unlocked secret presets
    if (presets.hidden) {
      presets.hidden.forEach(preset => {
        if (!unlockedPresets.has(preset.id)) return;

        const card = document.createElement('div');
        card.className = 'preset-card';
        card.innerHTML = `
          <div class="preset-secret-badge">SECRET</div>
          <div class="preset-cover-wrapper">
            <img src="assets/icons/${preset.cover}" alt="${preset.title}" class="preset-cover">
          </div>
          <span class="preset-title-text">${preset.title}</span>
        `;
        card.addEventListener('click', () => {
          loadPresetMix(preset);
        });
        presetsCarousel.appendChild(card);
      });
    }
  }

  // Fade out current mix -> load preset -> fade in together
  function loadPresetMix(preset) {
    // 1. Fade out active sounds that are not in the preset
    const presetSoundIds = preset.sounds.map(s => s.id);
    activeSoundIds.forEach(soundId => {
      if (!presetSoundIds.includes(soundId)) {
        window.audioManager.stopSound(soundId);
        activeSoundIds.delete(soundId);
        
        const card = document.querySelector(`.sound-card[data-id="${soundId}"]`);
        if (card) {
          card.classList.remove('playing', 'paused', 'muted');
          const slider = card.querySelector('.sound-volume-slider');
          const percentText = card.querySelector('.volume-percentage-text');
          if (slider) slider.value = 0.8;
          if (percentText) percentText.textContent = '80%';
        }
        stopParticleEffect(soundId);
      }
    });

    // 2. Wait 200ms for linear fade-out to finalize
    setTimeout(() => {
      preset.sounds.forEach(presetSound => {
        const sound = sounds.find(s => s.id === presetSound.id);
        if (!sound) return;

        const card = document.querySelector(`.sound-card[data-id="${sound.id}"]`);

        if (activeSoundIds.has(sound.id)) {
          // Already active, just adjust volume level smoothly
          window.audioManager.setSoundMute(sound.id, false); // ensure unmuted
          window.audioManager.setSoundVolume(sound.id, presetSound.volume);
          
          if (card) {
            const slider = card.querySelector('.sound-volume-slider');
            const percentText = card.querySelector('.volume-percentage-text');
            if (slider) slider.value = presetSound.volume;
            if (percentText) percentText.textContent = `${Math.round(presetSound.volume * 100)}%`;
            card.classList.add('playing');
            card.classList.remove('paused');
          }
        } else {
          // Turn sound on
          activeSoundIds.add(sound.id);
          window.audioManager.playSound(sound, presetSound.volume);
          
          if (card) {
            card.classList.add('playing');
            card.classList.remove('paused');
            const slider = card.querySelector('.sound-volume-slider');
            const percentText = card.querySelector('.volume-percentage-text');
            if (slider) slider.value = presetSound.volume;
            if (percentText) percentText.textContent = `${Math.round(presetSound.volume * 100)}%`;
          }
          startParticleEffect(sound);
        }
      });

      updateChaosMeter();
      checkHiddenPresetUnlocks();
    }, 200);
  }

  // Surprise Me (🎲 Random Chaos)
  function triggerSurpriseMe() {
    // Choose 3 to 8 random unique sounds
    const count = Math.floor(Math.random() * 6) + 3; // 3 - 8
    
    // Shuffle available sounds
    const shuffled = [...sounds].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const randomPreset = {
      sounds: selected.map(sound => ({
        id: sound.id,
        volume: parseFloat((Math.random() * 0.6 + 0.3).toFixed(2)) // 0.3 - 0.9
      }))
    };

    // Load this dynamically generated random mix
    loadPresetMix(randomPreset);
    showToast("🎲 Surprise! Accidental worlds collided.");
  }

  // Chaos Meter rendering & wiggle logic
  function updateChaosMeter() {
    let totalWeight = 0;
    activeSoundIds.forEach(id => {
      // Only active and currently playing (not paused) cards contribute to chaos weight
      const card = document.querySelector(`.sound-card[data-id="${id}"]`);
      if (card && card.classList.contains('playing')) {
        const sound = sounds.find(s => s.id === id);
        if (sound) totalWeight += sound.chaosWeight;
      }
    });

    const chaosPercent = Math.min(100, totalWeight);
    chaosMeterFill.style.width = `${chaosPercent}%`;

    // Color shifting along with progress
    if (chaosPercent <= 15) {
      chaosMeterFill.style.backgroundColor = '#4caf50'; // Green
      chaosMeterText.textContent = `PEACEFUL (${chaosPercent}%)`;
      updateWiggleState('wiggle-low');
    } else if (chaosPercent <= 35) {
      chaosMeterFill.style.backgroundColor = '#8bc34a'; // Yellow-Green
      chaosMeterText.textContent = `CALM (${chaosPercent}%)`;
      updateWiggleState('wiggle-low');
    } else if (chaosPercent <= 60) {
      chaosMeterFill.style.backgroundColor = '#ffc107'; // Orange-Yellow
      chaosMeterText.textContent = `BUSY (${chaosPercent}%)`;
      updateWiggleState('wiggle-medium');
    } else if (chaosPercent <= 85) {
      chaosMeterFill.style.backgroundColor = '#ff9800'; // Orange
      chaosMeterText.textContent = `CHAOTIC (${chaosPercent}%)`;
      updateWiggleState('wiggle-high');
    } else {
      chaosMeterFill.style.backgroundColor = '#f44336'; // Red
      chaosMeterText.textContent = `MAXIMUM CHAOS (${chaosPercent}%)`;
      updateWiggleState('wiggle-max');
    }
  }

  // Safe wiggle class switcher
  function updateWiggleState(wiggleClass) {
    if (reduceMotion) {
      chaosMeterContainer.className = 'chaos-meter-container';
      return;
    }
    // Remove all wiggles
    chaosMeterContainer.classList.remove('wiggle-low', 'wiggle-medium', 'wiggle-high', 'wiggle-max');
    
    let hasPlayingSounds = false;
    activeSoundIds.forEach(id => {
      const card = document.querySelector(`.sound-card[data-id="${id}"]`);
      if (card && card.classList.contains('playing')) {
        hasPlayingSounds = true;
      }
    });

    if (hasPlayingSounds) {
      chaosMeterContainer.classList.add(wiggleClass);
    }
  }

  // Hidden Preset unlock check
  function checkHiddenPresetUnlocks() {
    if (!presets.hidden) return;

    presets.hidden.forEach(preset => {
      // Check if already unlocked
      if (unlockedPresets.has(preset.id)) return;

      // Recipe verify: Does active set contain ALL required sounds?
      const unlocked = preset.recipe.every(requiredId => activeSoundIds.has(requiredId));
      if (unlocked) {
        // Unlock new preset!
        unlockedPresets.add(preset.id);
        localStorage.setItem('chaos_unlocked_presets', JSON.stringify([...unlockedPresets]));
        
        // Dynamic re-render preset cards
        renderPresetsShelf();

        // Spawn toast alert
        showToast(`✨ Secret unlocked: "${preset.title}" preset found!`);
      }
    });
  }

  // Spawn Toast Alert notifications
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-hand';
    toast.textContent = msg;

    toastContainer.appendChild(toast);
    
    // Remove DOM Node on anim completion
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // Particle Effects Spawner
  function startParticleEffect(sound) {
    if (reduceMotion) return;
    
    // Ensure we don't duplicate loop intervals
    if (particleIntervals.has(sound.id)) return;

    const card = document.querySelector(`.sound-card[data-id="${sound.id}"]`);
    if (!card) return;

    // Mapping character emojis to type
    const emojis = {
      drop: '💧', steam: '♨️', spark: '✨', leaf: '🍃', heart: '❤️',
      bubble: '🫧', pulse: '🟢', square: '⬜', coin: '🪙', note: '🎵',
      streak: '⭐', star: '⭐', clash: '💥', bee: '🐝', bolt: '⚡',
      ring: '🔔', siren: '🚨', grass: '🌱', ghost: '👻', radiation: '☢️',
      smoke: '💨', swirl: '🌀', drip: '🩸', music: '🎶'
    };

    const emoji = emojis[sound.particleType] || '✨';

    const intervalId = setInterval(() => {
      // Only spawn if active and not muted
      const activeNode = window.audioManager.activeSounds.get(sound.id);
      if (!activeNode || activeNode.muted) return;

      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = emoji;
      
      // Random horizontal offset and drift
      const leftOffset = Math.random() * 70 + 15; // 15% to 85% width
      particle.style.left = `${leftOffset}%`;
      particle.style.top = '70%';
      particle.style.color = sound.particleColor;
      
      // Random CSS Custom Drift for wobbly trajectory
      const drift = Math.random() * 40 - 20; // -20px to +20px drift
      particle.style.setProperty('--drift', `${drift}px`);

      card.appendChild(particle);

      // Clean up particle element
      setTimeout(() => {
        particle.remove();
      }, 1500);
    }, 1500); // spawn rate (longer interval for fewer particles)

    particleIntervals.set(sound.id, intervalId);
  }

  // Stop Particle loop
  function stopParticleEffect(soundId) {
    if (particleIntervals.has(soundId)) {
      clearInterval(particleIntervals.get(soundId));
      particleIntervals.delete(soundId);
    }
  }

  // Fire initialization
  init();
});
