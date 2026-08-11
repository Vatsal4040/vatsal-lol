/* ==========================================================================
   CHAOS Audio Manager
   Pure HTML5 Audio Engine - Avoids CORS restrictions on file:// protocols
   ========================================================================== */

class AudioManager {
  constructor() {
    this.masterVolume = 0.75;
    this.activeSounds = new Map(); // key: soundId, value: activeNodeConfig
    
    // Load stored master volume
    const savedMasterVol = localStorage.getItem('chaos_master_volume');
    if (savedMasterVol !== null) {
      this.masterVolume = parseFloat(savedMasterVol);
    }
  }

  /**
   * Sets the master volume level and updates all active playing volumes.
   * @param {number} value - Volume float between 0.0 and 1.0.
   */
  setMasterVolume(value) {
    this.masterVolume = value;
    localStorage.setItem('chaos_master_volume', value);

    // Update all active playing sounds instantly
    for (const [soundId, node] of this.activeSounds) {
      if (!node.isFadingOut && !node.muted) {
        node.audio.volume = node.volume * this.masterVolume;
      }
    }
  }

  /**
   * Plays a sound and fades it in over 250ms.
   * @param {Object} sound - Sound config object from soundsData.
   * @param {number} targetVolume - Volume float between 0.0 and 1.0.
   */
  playSound(sound, targetVolume = 0.6) {
    // If already active and fading out, stop fading out and restore volume
    if (this.activeSounds.has(sound.id)) {
      const activeNode = this.activeSounds.get(sound.id);
      if (activeNode.isFadingOut) {
        activeNode.isFadingOut = false;
        if (activeNode.fadeIntervalId) {
          clearInterval(activeNode.fadeIntervalId);
        }
        activeNode.volume = targetVolume;
        this.fadeVolume(activeNode.audio, activeNode.audio.volume, targetVolume * this.masterVolume, 250);
      }
      return;
    }

    // Select a random variation file
    const variations = sound.files;
    const randomIndex = Math.floor(Math.random() * variations.length);
    const initialFile = `assets/sound/${variations[randomIndex]}`;

    // Create standard HTML5 Audio element
    const audio = new Audio();
    audio.src = initialFile;
    audio.loop = false; // We loop manually to change variations
    audio.volume = 0;   // Start at 0 for clean fade-in

    const activeNodeConfig = {
      audio: audio,
      soundId: sound.id,
      currentFileIndex: randomIndex,
      volume: targetVolume,
      muted: false,
      isFadingOut: false,
      fadeIntervalId: null
    };

    this.activeSounds.set(sound.id, activeNodeConfig);

    // Audio Playback
    audio.play().then(() => {
      // Smoothly fade in to target scaled volume over 250ms
      this.fadeVolume(audio, 0, targetVolume * this.masterVolume, 250);
    }).catch(err => {
      console.warn(`Audio playback failed for ${sound.id}. Check browser autoplay policies.`, err);
      this.activeSounds.delete(sound.id);
    });

    // Listeners for Manual Looping (pick next variation)
    audio.addEventListener('ended', () => {
      const node = this.activeSounds.get(sound.id);
      if (!node || node.isFadingOut) return;

      // Choose a DIFFERENT file variation index
      let nextIndex = 0;
      if (variations.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * variations.length);
        } while (nextIndex === node.currentFileIndex);
      }
      node.currentFileIndex = nextIndex;

      const nextFile = `assets/sound/${variations[node.currentFileIndex]}`;
      audio.src = nextFile;
      audio.volume = node.muted ? 0 : node.volume * this.masterVolume;
      
      // Play variation
      audio.play().catch(playErr => {
        console.warn(`Failed to play variation ${nextFile}, falling back to index 0:`, playErr);
        // Graceful error fallback to index 0
        node.currentFileIndex = 0;
        audio.src = `assets/sound/${variations[0]}`;
        audio.volume = node.muted ? 0 : node.volume * this.masterVolume;
        audio.play().catch(fallbackErr => console.error(`Critical loop failure for ${sound.id}:`, fallbackErr));
      });
    });

    // Graceful error recovery loading files
    audio.addEventListener('error', (e) => {
      const node = this.activeSounds.get(sound.id);
      if (!node || node.isFadingOut) return;

      console.warn(`File variation load error for ${sound.id}, attempting fallback to variation index 0`, e);
      if (node.currentFileIndex !== 0) {
        node.currentFileIndex = 0;
        audio.src = `assets/sound/${variations[0]}`;
        audio.volume = node.muted ? 0 : node.volume * this.masterVolume;
        audio.play().catch(fallbackErr => console.error("Fallback play failed:", fallbackErr));
      }
    });
  }

  /**
   * Smoothly fades a sound's volume down to 0 and stops playback.
   * @param {string} soundId - Unique ID of the sound to stop.
   */
  stopSound(soundId) {
    const activeNode = this.activeSounds.get(soundId);
    if (!activeNode || activeNode.isFadingOut) return;

    activeNode.isFadingOut = true;
    
    // Clear any active fade interval
    if (activeNode.fadeIntervalId) {
      clearInterval(activeNode.fadeIntervalId);
    }

    // Fade to 0 over 250ms, then pause
    this.fadeVolume(activeNode.audio, activeNode.audio.volume, 0, 250, () => {
      // Re-verify sound node state before pausing
      const node = this.activeSounds.get(soundId);
      if (node && node.isFadingOut) {
        node.audio.pause();
        node.audio.currentTime = 0;
        this.activeSounds.delete(soundId);
      }
    });
  }

  /**
   * Set volume scale for a single sound.
   * @param {string} soundId - Unique sound ID.
   * @param {number} volume - Volume float between 0.0 and 1.0.
   */
  setSoundVolume(soundId, volume) {
    const activeNode = this.activeSounds.get(soundId);
    if (!activeNode || activeNode.isFadingOut) return;

    activeNode.volume = volume;
    if (!activeNode.muted) {
      if (activeNode.fadeIntervalId) {
        clearInterval(activeNode.fadeIntervalId);
      }
      activeNode.audio.volume = volume * this.masterVolume;
    }
  }

  /**
   * Mute or unmute an active sound.
   * @param {string} soundId - Unique sound ID.
   * @param {boolean} isMuted - Mute state boolean.
   */
  setSoundMute(soundId, isMuted) {
    const activeNode = this.activeSounds.get(soundId);
    if (!activeNode || activeNode.isFadingOut) return;

    activeNode.muted = isMuted;
    
    if (activeNode.fadeIntervalId) {
      clearInterval(activeNode.fadeIntervalId);
    }

    const targetGain = isMuted ? 0 : activeNode.volume * this.masterVolume;
    this.fadeVolume(activeNode.audio, activeNode.audio.volume, targetGain, 250);
  }

  /**
   * Helper function for smooth volume fading using basic javascript intervals.
   * Prevents browser CORS limitations on file:// paths.
   */
  fadeVolume(audio, startVal, targetVal, durationMs, onComplete) {
    if (audio.fadeIntervalId) {
      clearInterval(audio.fadeIntervalId);
    }

    const steps = 15;
    const intervalTime = durationMs / steps;
    const stepVal = (targetVal - startVal) / steps;
    let currentVal = startVal;
    let stepCount = 0;

    audio.volume = Math.max(0, Math.min(1, startVal));

    audio.fadeIntervalId = setInterval(() => {
      currentVal += stepVal;
      stepCount++;
      audio.volume = Math.max(0, Math.min(1, currentVal));

      if (stepCount >= steps) {
        clearInterval(audio.fadeIntervalId);
        audio.fadeIntervalId = null;
        audio.volume = Math.max(0, Math.min(1, targetVal));
        if (onComplete) onComplete();
      }
    }, intervalTime);
  }

  /**
   * Stops every active sound cleanly.
   */
  stopAll() {
    for (const [soundId] of this.activeSounds) {
      this.stopSound(soundId);
    }
  }
}

// Global instance exposed
window.audioManager = new AudioManager();
