window.AudioEngine = class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.initialized = false;
        this.volume = 0.8;
        
        // Audio nodes
        this.masterGain = null;
        this.droneOsc = null;
        this.droneFilter = null;
        this.droneGain = null;
        
        this.scrollOsc = null;
        this.scrollFilter = null;
        this.scrollGain = null;
        
        this.padOscs = [];
        this.padFilter = null;
        this.padGain = null;
        
        this.delayNode = null;
        this.delayFeedback = null;
        
        this.fmCarrier = null;
        this.fmModulator = null;
        this.fmModGain = null;
        this.fmGain = null;
        
        this.noiseNode = null;
        this.noiseFilter = null;
        this.noiseGain = null;
        
        this.currentScene = 0;
        this.scrollVelocity = 0;
        this.lastScrollTime = 0;
        this.lastScrollPos = 0;
        
        // Chord definitions (frequencies)
        this.chords = {
            3: [130.81, 164.81, 196.00], // C3 Major (C, E, G) - 3D Volume
            4: [130.81, 164.81, 196.00], // C3 Major (modulated) - 4D Time
            5: [130.81, 155.56, 196.00, 220.00], // C3 minor 6 (C, Eb, G, A) - 5D Choices
            6: [116.54, 146.83, 174.61, 220.00], // Bb3 Major 7 (Bb, D, F, A) - 6D Parallel Universes
            7: [110.00, 138.59, 164.81, 207.65], // A3 Major 7 (slightly detuned) - 7D Laws
            8: [98.00, 116.54, 146.83, 174.61],   // G3 minor 7 - 8D Clusters
            9: [87.31, 110.00, 130.81, 164.81],   // F3 Major 7 - 9D Cosmic Web
            10: [73.42, 87.31, 110.00, 130.81],    // D3 minor 7 - 10D Strings
            11: [65.41, 98.00, 130.81, 196.00]     // C2 open fifths - 11D Membranes
        };
    }

    init() {
        if (this.initialized) return;
        
        // Create context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        
        // 1. DRONE SYNTH (0D & general ambient)
        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc.type = 'sawtooth';
        this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 (Sub-bass)
        
        this.droneFilter = this.ctx.createBiquadFilter();
        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.setValueAtTime(110, this.ctx.currentTime);
        this.droneFilter.Q.setValueAtTime(5, this.ctx.currentTime);
        
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        
        this.droneOsc.connect(this.droneFilter);
        this.droneFilter.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);
        
        // LFO for drone breathing
        const droneLFO = this.ctx.createOscillator();
        droneLFO.type = 'sine';
        droneLFO.frequency.setValueAtTime(0.15, this.ctx.currentTime); // Slow breathing
        
        const droneLFOGain = this.ctx.createGain();
        droneLFOGain.gain.setValueAtTime(30, this.ctx.currentTime);
        
        droneLFO.connect(droneLFOGain);
        droneLFOGain.connect(this.droneFilter.frequency);
        
        droneLFO.start();
        this.droneOsc.start();
        
        // 2. SCROLL MELODY/SWEEP SYNTH (1D & 2D)
        this.scrollOsc = this.ctx.createOscillator();
        this.scrollOsc.type = 'sine';
        this.scrollOsc.frequency.setValueAtTime(220, this.ctx.currentTime);
        
        this.scrollFilter = this.ctx.createBiquadFilter();
        this.scrollFilter.type = 'lowpass';
        this.scrollFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
        
        this.scrollGain = this.ctx.createGain();
        this.scrollGain.gain.setValueAtTime(0, this.ctx.currentTime); // Start silent
        
        this.scrollOsc.connect(this.scrollFilter);
        this.scrollFilter.connect(this.scrollGain);
        this.scrollGain.connect(this.masterGain);
        
        this.scrollOsc.start();

        // 3. POLYPHONIC PAD SYNTH & DELAY (3D to 11D)
        this.padFilter = this.ctx.createBiquadFilter();
        this.padFilter.type = 'lowpass';
        this.padFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
        this.padFilter.Q.setValueAtTime(1, this.ctx.currentTime);
        
        this.padGain = this.ctx.createGain();
        this.padGain.gain.setValueAtTime(0, this.ctx.currentTime); // Start silent
        
        // Delay Line
        this.delayNode = this.ctx.createDelay(1.0);
        this.delayNode.delayTime.setValueAtTime(0.4, this.ctx.currentTime); // 400ms echo
        
        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime);
        
        // Connect Delay Loop
        this.padFilter.connect(this.padGain);
        this.padGain.connect(this.masterGain);
        
        // Pad to Delay
        this.padGain.connect(this.delayNode);
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode); // feedback loop
        this.delayFeedback.connect(this.masterGain); // output to master
        
        this.setupChords();
        
        // 4. SURREAL FM SYNTH (7D)
        this.fmCarrier = this.ctx.createOscillator();
        this.fmCarrier.type = 'triangle';
        this.fmCarrier.frequency.setValueAtTime(150, this.ctx.currentTime);
        
        this.fmModulator = this.ctx.createOscillator();
        this.fmModulator.type = 'sine';
        this.fmModulator.frequency.setValueAtTime(73.4, this.ctx.currentTime);
        
        this.fmModGain = this.ctx.createGain();
        this.fmModGain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        this.fmGain = this.ctx.createGain();
        this.fmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        this.fmModulator.connect(this.fmModGain);
        this.fmModGain.connect(this.fmCarrier.frequency);
        
        this.fmCarrier.connect(this.fmGain);
        this.fmGain.connect(this.masterGain);
        
        this.fmCarrier.start();
        this.fmModulator.start();
        
        // 5. NOISE SWEEP GENERATOR (11D & Membrane Collision)
        this.noiseNode = this.createNoiseBufferNode();
        this.noiseFilter = this.ctx.createBiquadFilter();
        this.noiseFilter.type = 'bandpass';
        this.noiseFilter.frequency.setValueAtTime(600, this.ctx.currentTime);
        this.noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
        
        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        if (this.noiseNode) {
            this.noiseNode.connect(this.noiseFilter);
            this.noiseFilter.connect(this.noiseGain);
            this.noiseGain.connect(this.masterGain);
            this.noiseNode.start();
        }

        // LFO for FM modulating
        const fmLFO = this.ctx.createOscillator();
        fmLFO.type = 'sine';
        fmLFO.frequency.setValueAtTime(0.5, this.ctx.currentTime);
        const fmLFOGain = this.ctx.createGain();
        fmLFOGain.gain.setValueAtTime(200, this.ctx.currentTime);
        fmLFO.connect(fmLFOGain);
        fmLFOGain.connect(this.fmModGain.gain);
        fmLFO.start();

        this.initialized = true;
    }

    createNoiseBufferNode() {
        if (!this.ctx) return null;
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        return whiteNoise;
    }

    setupChords() {
        // Create 4 oscillators for the pad chord
        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, this.ctx.currentTime);
            osc.connect(this.padFilter);
            osc.start();
            this.padOscs.push(osc);
        }
    }

    mute() {
        this.isMuted = true;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        }
    }

    unmute() {
        this.isMuted = false;
        if (this.ctx) {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.masterGain) {
                this.masterGain.gain.exponentialRampToValueAtTime(0.8, this.ctx.currentTime + 0.3);
            }
        }
    }

    setVolume(vol) {
        this.volume = vol;
        if (!this.initialized || this.isMuted || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const targetVol = Math.max(0.0001, Math.min(vol, 1.0));
        this.masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.05);
    }

    setScrollProgress(progress, sceneIndex) {
        if (!this.initialized || this.isMuted) return;
        
        const now = this.ctx.currentTime;
        this.currentScene = sceneIndex;
        
        // Calculate scroll speed/velocity
        const timeNow = Date.now();
        const deltaT = (timeNow - this.lastScrollTime) / 1000;
        if (deltaT > 0.01) {
            const deltaPos = Math.abs(progress - this.lastScrollPos);
            this.scrollVelocity = deltaPos / deltaT;
            this.lastScrollTime = timeNow;
            this.lastScrollPos = progress;
        }

        // --- SCENE DYNAMIC MIXING ---
        
        // Sub-bass drone: always present, but filters open/close
        if (sceneIndex >= 10) {
            // Melt into vibration (10D): Drone gets louder and warmer
            this.droneGain.gain.linearRampToValueAtTime(0.45, now + 0.1);
            this.droneFilter.frequency.linearRampToValueAtTime(250, now + 0.1);
        } else {
            this.droneGain.gain.linearRampToValueAtTime(0.25, now + 0.2);
            this.droneFilter.frequency.linearRampToValueAtTime(90 + (sceneIndex * 15), now + 0.2);
        }

        // Scroll Synth volume tracking scroll velocity
        const targetScrollVol = Math.min(this.scrollVelocity * 0.4, 0.3);
        this.scrollGain.gain.linearRampToValueAtTime(targetScrollVol, now + 0.1);
        
        // Scroll Synth pitch sweeps
        if (sceneIndex === 2) {
            // 1D: Sweep pitch upwards based on progress
            const sceneProgress = (progress * 14) % 1;
            const targetFreq = 160 + (sceneProgress * 340); // 160Hz to 500Hz
            this.scrollOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);
            this.scrollOsc.type = 'sine';
        } else if (sceneIndex === 3) {
            // 2D: Perfect fifth harmony added to scroll synth
            const sceneProgress = (progress * 14) % 1;
            const rootFreq = 220;
            const targetFreq = rootFreq * (sceneProgress > 0.5 ? 1.5 : 1.0); // jump between root and fifth
            this.scrollOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);
            this.scrollOsc.type = 'triangle';
        } else {
            // Default pitch
            this.scrollOsc.frequency.linearRampToValueAtTime(220, now + 0.2);
            this.scrollOsc.type = 'sine';
        }

        // Pad chords volume (3D to 11D)
        if (sceneIndex >= 4 && sceneIndex <= 12) {
            // 3D is index 4. Chords are active.
            this.padGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
            
            // Set chord frequencies
            const activeChordFrequencies = this.chords[sceneIndex];
            if (activeChordFrequencies) {
                for (let i = 0; i < 4; i++) {
                    const freq = activeChordFrequencies[i] || activeChordFrequencies[i % activeChordFrequencies.length] * 2;
                    this.padOscs[i].frequency.exponentialRampToValueAtTime(freq, now + 0.4);
                }
            }
            
            // 4D (Time): Filter ticking modulation
            if (sceneIndex === 5) {
                // Apply rhythmic pulsing frequency LFO
                const tempo = 4; // Hz
                const filterPulse = 400 + Math.sin(this.ctx.currentTime * tempo * Math.PI) * 150;
                this.padFilter.frequency.setValueAtTime(filterPulse, now);
            } else {
                this.padFilter.frequency.linearRampToValueAtTime(500 + (sceneIndex * 60), now + 0.2);
            }

            // 5D (Choices): Increase Delay/Echo
            if (sceneIndex === 6) {
                this.delayFeedback.gain.linearRampToValueAtTime(0.65, now + 0.2);
                this.delayNode.delayTime.linearRampToValueAtTime(0.55, now + 0.3);
            } else {
                this.delayFeedback.gain.linearRampToValueAtTime(0.35, now + 0.2);
                this.delayNode.delayTime.linearRampToValueAtTime(0.4, now + 0.3);
            }
        } else {
            // Mute pads
            this.padGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        }

        // FM Synth volume (7D - Different Laws)
        if (sceneIndex === 8) { // 7D is index 8
            this.fmGain.gain.linearRampToValueAtTime(0.3, now + 0.2);
            const sceneProgress = (progress * 14) % 1;
            this.fmCarrier.frequency.linearRampToValueAtTime(100 + (sceneProgress * 300), now + 0.1);
            this.fmModulator.frequency.linearRampToValueAtTime(50 + (sceneProgress * 150), now + 0.1);
        } else {
            this.fmGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        }

        // Noise Sweep volume (11D - Membranes)
        if (sceneIndex === 12) { // 11D is index 12
            this.noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
            // Oscillate filter representing membranes breathing
            const noiseFreq = 400 + Math.sin(this.ctx.currentTime * 0.4) * 200;
            this.noiseFilter.frequency.setValueAtTime(noiseFreq, now);
        } else {
            this.noiseGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        }

        // 9D (Connections - index 10): heartbeat pulse simulation
        if (sceneIndex === 10) {
            // Heartbeat heartbeat... every 1.5 seconds
            const pulse = (Math.sin(this.ctx.currentTime * Math.PI * 1.3) > 0.8) ? 0.4 : 0.05;
            this.droneGain.gain.setValueAtTime(0.2 + pulse, now);
        }
    }

    // Trigger plucks for 10D Strings
    triggerStringPluck(pitch = 220) {
        if (!this.initialized || this.isMuted || this.currentScene !== 11) return;
        
        const now = this.ctx.currentTime;
        const pluckOsc = this.ctx.createOscillator();
        pluckOsc.type = 'triangle';
        pluckOsc.frequency.setValueAtTime(pitch, now);
        
        const pluckGain = this.ctx.createGain();
        pluckGain.gain.setValueAtTime(0.35, now);
        pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        const pluckFilter = this.ctx.createBiquadFilter();
        pluckFilter.type = 'lowpass';
        pluckFilter.frequency.setValueAtTime(2000, now);
        pluckFilter.frequency.exponentialRampToValueAtTime(100, now + 0.6);
        
        pluckOsc.connect(pluckFilter);
        pluckFilter.connect(pluckGain);
        pluckGain.connect(this.masterGain);
        
        pluckOsc.start(now);
        pluckOsc.stop(now + 0.9);
    }
}
