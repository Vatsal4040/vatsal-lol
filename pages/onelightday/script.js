// =========================================================
// ONE LIGHT DAY — CINEMATIC SPACE TELEMETRY ENGINE
// =========================================================

// Global State
let audioCtx = null;
let spaceDrone = null;
let pingInterval = null;
let isAudioPlaying = false;
let currentMilestoneId = "earth";
let analyserNode = null;
let dataArray = null;

// Milestones Database
const MILESTONES = {
  earth: {
    name: "Earth",
    subtitle: "Our Home",
    distanceKm: 0,
    lightTime: "0.00 SECONDS",
    description: "The blue marble. A thin, fragile envelope of life suspended in the harsh cosmic ocean.",
    fact: "The only known place in the universe harbor to life. Every human who ever lived called this pixel home.",
    scale: "0 km (Sea Level)",
    domain: "SURFACE"
  },
  troposphere: {
    name: "Troposphere",
    subtitle: "Cloud Layer",
    distanceKm: 12,
    lightTime: "0.04 MILLISECONDS",
    description: "The dense layer of wind, storms, and commercial flights. It contains 80% of our atmosphere's mass.",
    fact: "Nearly all weather occurs in this thin, active skin of our planet. Mount Everest reaches almost to the top.",
    scale: "0 - 12 km",
    domain: "ATMOSPHERE"
  },
  stratosphere: {
    name: "Stratosphere",
    subtitle: "Upper Atmosphere",
    distanceKm: 50,
    lightTime: "0.17 MILLISECONDS",
    description: "The quiet, ozone-rich buffer where weather balloons ascend and military jets cruise beneath a darkening sky.",
    fact: "This layer holds the ozone layer, which absorbs and scatters solar ultraviolet radiation, shielding life.",
    scale: "12 - 50 km",
    domain: "ATMOSPHERE"
  },
  karman: {
    name: "Kármán Line",
    subtitle: "Edge of Space",
    distanceKm: 100,
    lightTime: "0.33 MILLISECONDS",
    description: "The internationally recognized border where the atmosphere becomes too thin to support aeronautical flight.",
    fact: "Above this line, a vehicle must travel at orbital velocity rather than aerodynamic lift to stay aloft.",
    scale: "100 km",
    domain: "SPACE BORDER"
  },
  iss: {
    name: "ISS & LEO",
    subtitle: "Low Earth Orbit",
    distanceKm: 400,
    lightTime: "1.3 MILLISECONDS",
    description: "A soccer-field-sized laboratory orbiting Earth every 90 minutes. Humanity's continuous foothold in the vacuum.",
    fact: "The ISS travels at 27,600 km/h. Astronauts witness 16 sunrises and sunsets every single day.",
    scale: "400 km",
    domain: "LOW EARTH ORBIT"
  },
  gps: {
    name: "GPS Constellation",
    subtitle: "Navigation Grid",
    distanceKm: 20000,
    lightTime: "67 MILLISECONDS",
    description: "A synchronized grid of nuclear-clock-carrying satellites mapping space and time to guide our journeys on the ground.",
    fact: "GPS clocks run faster than Earth clocks by 38 microseconds/day due to general relativity. Corrections are constant.",
    scale: "20,000 km",
    domain: "MEDIUM ORBIT"
  },
  geoorbit: {
    name: "Geostationary Orbit",
    subtitle: "Communications Belt",
    distanceKm: 36000,
    lightTime: "0.12 SECONDS",
    description: "A synchronized highway of communications and weather satellites matching Earth's rotation perfectly.",
    fact: "Satellites in this orbit hover forever over the same spot, enabling satellite television and global feeds.",
    scale: "36,000 km",
    domain: "HIGH ORBIT"
  },
  moon: {
    name: "The Moon",
    subtitle: "Earth's Companion",
    distanceKm: 384400,
    lightTime: "1.28 SECONDS",
    description: "Humanity's first stepping stone into the cosmos. Silently reflecting sunlight onto our home planet.",
    fact: "Light takes just 1.3 seconds to travel here. Humans walked on its dusty plains and looked back at Earth.",
    scale: "384,400 km",
    domain: "NEAR EARTH SPACE"
  },
  jwst: {
    name: "JWST",
    subtitle: "James Webb Telescope",
    distanceKm: 1500000,
    lightTime: "5.0 SECONDS",
    description: "Orbiting at the Sun-Earth L2 Lagrange point, peerlessly observing the infrared secrets of the first stars.",
    fact: "Webb operates in extreme cold (-233°C), shielded from the heat of the Sun, Earth, and Moon by a 5-layer shield.",
    scale: "1.5 Million km",
    domain: "DEEP SPACE"
  },
  mars: {
    name: "Mars",
    subtitle: "The Red Planet",
    distanceKm: 150000000,
    lightTime: "8.3 MINUTES",
    description: "A cold, iron-rich desert world where liquid water once flowed. The target of humanity's next giant leap.",
    fact: "Mars is home to Olympus Mons, the largest volcano in the Solar System, three times taller than Mount Everest.",
    scale: "150 Million km",
    domain: "INNER SYSTEM"
  },
  asteroidbelt: {
    name: "Asteroid Belt",
    subtitle: "Rocky Debris Ring",
    distanceKm: 350000000,
    lightTime: "19.4 MINUTES",
    description: "A sparse ring of ancient planetary leftovers. Space is so vast that asteroids are millions of kilometers apart.",
    fact: "If you gathered all asteroids in the belt together, they would be smaller than Earth's moon.",
    scale: "2.2 - 3.2 AU",
    domain: "BELT TRANSIT"
  },
  jupiter: {
    name: "Jupiter",
    subtitle: "The Gas Giant",
    distanceKm: 778000000,
    lightTime: "43.3 MINUTES",
    description: "A massive storm-lashed gas giant, twice as heavy as all other planets combined. Home to the Great Red Spot.",
    fact: "Voyager 1 reached Jupiter in March 1979, discovering active volcanoes on Io and faint rings around the giant.",
    scale: "778 Million km",
    domain: "OUTER SYSTEM"
  },
  saturn: {
    name: "Saturn",
    subtitle: "The Ringed Planet",
    distanceKm: 1400000000,
    lightTime: "1.30 HOURS",
    description: "The jewel of the solar system, with spectacular ice rings stretching 280,000 kilometers wide.",
    fact: "Voyager 1's flyby in 1980 studied Titan's thick atmosphere and triggered its exit trajectory from the solar plane.",
    scale: "1.4 Billion km",
    domain: "OUTER SYSTEM"
  },
  uranus: {
    name: "Uranus",
    subtitle: "Ice Giant",
    distanceKm: 2900000000,
    lightTime: "2.69 HOURS",
    description: "A pale cyan world spinning completely on its side, likely tilted by an ancient cataclysmic collision.",
    fact: "Uranus has the coldest atmosphere of any planet in the Solar System, dipping down to -224°C.",
    scale: "2.9 Billion km",
    domain: "OUTER SYSTEM"
  },
  neptune: {
    name: "Neptune",
    subtitle: "Ice Giant",
    distanceKm: 4500000000,
    lightTime: "4.17 HOURS",
    description: "The windiest planet in our solar system, with supersonic methane storms whipping around its deep blue sphere.",
    fact: "Receives only 1/900th of the sunlight that Earth does. It takes Neptune 165 Earth years to complete an orbit.",
    scale: "4.5 Billion km",
    domain: "OUTER SYSTEM"
  },
  pluto: {
    name: "Pluto & Pale Blue Dot",
    subtitle: "Dwarf Planet Outer Boundary",
    distanceKm: 5900000000,
    lightTime: "5.47 HOURS",
    description: "The icy outpost at the system's edge. Here, Voyager 1 turned back to capture the Pale Blue Dot.",
    fact: "From 6 Billion Km, Earth appeared as a single pixel suspended in a sunbeam. It is our entire home.",
    scale: "5.9 Billion km",
    domain: "KUIPER CLOUD"
  },
  void: {
    name: "The Vast Void",
    subtitle: "Interstellar Vacuum",
    distanceKm: 15000000000,
    lightTime: "13.9 HOURS",
    description: "Profound dark silence. No dust, no planetary bodies. Only distant stars and the fading solar wind.",
    fact: "The heliosphere is far behind. The Sun is now merely another star. Interstellar transit is fully active.",
    scale: "6 - 24 Billion km",
    domain: "HELIOSHEATH"
  },
  voyager1: {
    name: "Voyager 1",
    subtitle: "First Interstellar Messenger",
    distanceKm: 25902068371,
    lightTime: "24.00 HOURS",
    description: "Launched in 1977, Voyager 1 is the farthest human-made object, sailing forever into the pristine galactic ocean.",
    fact: "In November 2026, Voyager reaches exactly 1 Light Day. Signals take exactly 24 hours one-way to reach Earth.",
    scale: "25.9 Billion km",
    domain: "INTERSTELLAR MEDIUM"
  }
};

// Selection of Milestones for Left Timeline
const TIMELINE_KEYS = [
  "voyager1",
  "void",
  "pluto",
  "neptune",
  "uranus",
  "saturn",
  "jupiter",
  "mars",
  "moon",
  "iss",
  "earth"
];

// Voyager Historical Tracks Data
const FLIGHT_LOGS = [
  { date: "Sept 5, 1977", event: "LAUNCH SUCCESS", desc: "Titan IIIE launches from Cape Canaveral." },
  { date: "Mar 5, 1979", event: "JUPITER FLYBY", desc: "Closest approach 349k km. Discovered active volcanoes on Io." },
  { date: "Nov 12, 1980", event: "SATURN ENGAGED", desc: "Discovered Titan atmosphere. Slingshotted out of solar plane." },
  { date: "Feb 14, 1990", event: "PALE BLUE DOT", desc: "Took final historic picture of Earth from 6 Billion km." },
  { date: "Dec 2004", event: "TERMINATION SHOCK", desc: "Entered Heliosheath border. Solar winds drastically slowed." },
  { date: "Aug 25, 2012", event: "INTERSTELLAR SPACE", desc: "Crossed Heliopause boundary, entering the galactic deep." },
  { date: "Nov 2026", event: "ONE LIGHT DAY", desc: "Sails past 1 light day (25.9B km) from Earth. Stable telemetry." }
];

// Voyager Museum Exhibits Data
const MUSEUM_DATA = [
  {
    title: "Golden Record",
    desc: "A gold-plated copper phonograph record containing sounds, music, greetings in 55 languages, and images. It is a cosmic message in a bottle.",
    icon: "music"
  },
  {
    title: "Plutonium RTGs",
    desc: "Powered by three Radioisotope Thermoelectric Generators decaying plutonium-238. Power drops by 4 Watts per year.",
    icon: "battery-charging"
  },
  {
    title: "Silent Horizon",
    desc: "By 2030, all instruments will be powered off. Voyager will drift silently forever, passing near star AC+79 3888 in 40,000 years.",
    icon: "moon-star"
  }
];

// 1. Initialize Space Background Canvas (2D Parallax)
class SpaceStarfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.lastScrollY = window.scrollY;
    
    this.resize();
    this.generateStars();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => this.onScroll());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  generateStars() {
    this.stars = [];
    const starCount = Math.min(220, Math.floor(window.innerWidth / 6));
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.6 + 0.2,
        opacity: Math.random() * 0.8 + 0.1,
        speedFactor: Math.random() * 0.05 + 0.015,
        color: Math.random() > 0.85 ? '#a5f3fc' : (Math.random() > 0.9 ? '#fef08a' : '#ffffff')
      });
    }
  }

  onScroll() {
    const currentScroll = window.scrollY;
    const delta = currentScroll - this.lastScrollY;
    this.lastScrollY = currentScroll;

    // Beautiful parallax drift scrolling
    this.stars.forEach(star => {
      star.y -= delta * star.speedFactor * 0.8;
      if (star.y < 0) {
        star.y = this.canvas.height;
        star.x = Math.random() * this.canvas.width;
      } else if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    });

    // Occasional shooting stars trigger on heavy scrolls
    if (Math.abs(delta) > 5 && Math.random() < 0.08 && this.shootingStars.length < 2) {
      this.triggerShootingStar();
    }
  }

  triggerShootingStar() {
    this.shootingStars.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * (this.canvas.height * 0.5),
      dx: (Math.random() * 14 + 10),
      dy: (Math.random() * 5 + 2),
      length: Math.random() * 80 + 40,
      opacity: 1,
      decay: Math.random() * 0.03 + 0.02
    });
  }

  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Slowly drift stars sideways to make space alive
    this.stars.forEach(star => {
      star.x -= 0.015;
      if (star.x < 0) star.x = this.canvas.width;

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.opacity;
      this.ctx.fill();
    });

    // Render shooting stars
    this.shootingStars.forEach((ss, idx) => {
      this.ctx.beginPath();
      const grad = this.ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.dx, ss.y - ss.dy);
      grad.addColorStop(0, `rgba(165, 243, 252, ${ss.opacity})`);
      grad.addColorStop(0.3, `rgba(56, 189, 248, ${ss.opacity * 0.4})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 1.8;
      this.ctx.moveTo(ss.x, ss.y);
      this.ctx.lineTo(ss.x - ss.dx, ss.y - ss.dy);
      this.ctx.stroke();

      ss.x += ss.dx;
      ss.y += ss.dy;
      ss.opacity -= ss.decay;

      if (ss.opacity <= 0) {
        this.shootingStars.splice(idx, 1);
      }
    });

    this.ctx.globalAlpha = 1.0;
    requestAnimationFrame(() => this.animate());
  }
}

// 2. Web Audio API Analog Synthesizer (Space Drone & Audio Oscilloscope)
function initSpaceSynth() {
  if (isAudioPlaying) {
    stopSpaceSynth();
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Setup Analyser Node for visual representation
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Master Lowpass Filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, audioCtx.currentTime);

    // Detuned sub oscillators
    const subOsc = audioCtx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55.4, audioCtx.currentTime); // C#1 Deep Sub

    const beatOsc = audioCtx.createOscillator();
    beatOsc.type = 'sawtooth';
    beatOsc.frequency.setValueAtTime(55.7, audioCtx.currentTime); // Chorus beating

    const humOsc = audioCtx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(110.8, audioCtx.currentTime); // Octave hum

    // Gain stages
    const subGain = audioCtx.createGain();
    const beatGain = audioCtx.createGain();
    const humGain = audioCtx.createGain();
    const masterGain = audioCtx.createGain();

    subGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    beatGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    humGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime); // Safe volume

    // Wire up nodes
    subOsc.connect(subGain);
    beatOsc.connect(beatGain);
    humOsc.connect(humGain);

    subGain.connect(filter);
    beatGain.connect(filter);
    humGain.connect(filter);

    filter.connect(analyserNode);
    analyserNode.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Start oscillators
    subOsc.start();
    beatOsc.start();
    humOsc.start();

    spaceDrone = { subOsc, beatOsc, humOsc, masterGain, filter };

    // Launch high-pitch cosmic pings interval
    startTelemetryPings();

    isAudioPlaying = true;
    updateSynthUI(true);
    animateOscilloscope();
  } catch (err) {
    console.error("Web Audio failed to load:", err);
  }
}

function startTelemetryPings() {
  pingInterval = setInterval(() => {
    if (!audioCtx || Math.random() > 0.45) return;

    try {
      const pingOsc = audioCtx.createOscillator();
      const pingGain = audioCtx.createGain();

      pingOsc.type = 'sine';
      const frequencies = [1100, 1500, 1750, 2200];
      const selectedFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
      pingOsc.frequency.setValueAtTime(selectedFreq, audioCtx.currentTime);

      pingGain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

      pingOsc.connect(pingGain);
      pingGain.connect(audioCtx.destination);

      pingOsc.start();
      pingOsc.stop(audioCtx.currentTime + 0.9);
    } catch(e){}
  }, 1400);
}

function stopSpaceSynth() {
  if (spaceDrone) {
    try {
      spaceDrone.subOsc.stop();
      spaceDrone.beatOsc.stop();
      spaceDrone.humOsc.stop();
    } catch(e){}
    spaceDrone = null;
  }
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  isAudioPlaying = false;
  updateSynthUI(false);
}

function updateSynthUI(active) {
  const muteBtn = document.getElementById('audio-mute-btn');
  const led = document.getElementById('synth-status-led');
  const txt = document.getElementById('synth-state-txt');
  const icon = document.getElementById('mute-icon');

  if (active) {
    led.className = "w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse";
    txt.innerText = "SYNTH TELEMETRY";
    txt.className = "text-cyan-400 font-bold";
    icon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>`;
  } else {
    led.className = "w-1.5 h-1.5 rounded-full bg-zinc-600";
    txt.innerText = "SYNTH COLD";
    txt.className = "text-zinc-500";
    icon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>`;
  }
}

// Draw the dynamic audio wave visualization
function animateOscilloscope() {
  const canvas = document.getElementById('oscilloscope-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  function draw() {
    if (!isAudioPlaying || !analyserNode) {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return;
    }

    requestAnimationFrame(draw);

    analyserNode.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  draw();
}

function toggleAudio() {
  initSpaceSynth();
}

// 3. Dynamic Telemetry Scrolling Mechanics & Tracking
function handleScrollingTelemetry() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollY = window.scrollY;
  
  if (docHeight <= 0) return;

  // Calculate scrolling progression inverted (Bottom = 0, Top = 1)
  const rawProgress = 1 - (scrollY / docHeight);
  // Apply a smooth non-linear curve to model the immense gaps in space
  const progress = Math.pow(Math.max(0, Math.min(rawProgress, 1)), 1.5);

  // Deep space stats mapping
  const currentAltKm = progress * 25902068371; // Max Voyager KM
  const currentLightSeconds = progress * 86400; // Max 24 hours

  // Update Top HUD
  const formatter = new Intl.NumberFormat('en-US');
  document.getElementById('hud-distance').innerText = formatter.format(Math.round(currentAltKm));
  
  // Format light travel delay beautifully
  let timeStr = "";
  if (currentLightSeconds < 1) {
    timeStr = `${(currentLightSeconds * 1000).toFixed(0)} MILLISECONDS`;
  } else if (currentLightSeconds < 60) {
    timeStr = `${currentLightSeconds.toFixed(2)} SECONDS`;
  } else if (currentLightSeconds < 3600) {
    timeStr = `${(currentLightSeconds / 60).toFixed(2)} MINUTES`;
  } else {
    timeStr = `${(currentLightSeconds / 3600).toFixed(2)} HOURS`;
  }
  document.getElementById('hud-lighttime').innerText = timeStr;

  // Track active milestone sections & highlight target
  const sections = document.querySelectorAll('section[data-milestone-id]');
  let closestId = "earth";
  let minDiff = Infinity;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const centerDiff = Math.abs(rect.top + rect.height/2 - window.innerHeight/2);
    if (centerDiff < minDiff) {
      minDiff = centerDiff;
      closestId = sec.getAttribute('data-milestone-id');
    }
  });

  if (closestId !== currentMilestoneId) {
    currentMilestoneId = closestId;
    updateSelectedMilestoneCard(closestId);
  }

  // Update scaling of Voyager 1 Climax model based on proximity to section
  const voyagerSection = document.querySelector('section[data-milestone-id="voyager1"]');
  if (voyagerSection) {
    const rect = voyagerSection.getBoundingClientRect();
    const viewportOffset = window.innerHeight/2 - (rect.top + rect.height/2);
    
    // Scale factor grows as voyager section approaches center of screen
    let scaleVal = 0.05;
    if (rect.top < window.innerHeight) {
      const progressToCenter = Math.max(0, 1 - Math.abs(viewportOffset) / (window.innerHeight * 1.2));
      scaleVal = 0.05 + progressToCenter * 1.45;
    }
    const scaleDiv = document.getElementById('voyager-scaler');
    if (scaleDiv) {
      scaleDiv.style.transform = `scale(${scaleVal})`;
      scaleDiv.style.opacity = `${Math.min(1.0, scaleVal * 1.8)}`;
    }

    const statusBox = document.getElementById('voyager-status-box');
    if (statusBox) {
      if (scaleVal > 0.45) {
        statusBox.innerHTML = `
          <div class="flex flex-col gap-3 animate-fade-in">
            <p class="text-zinc-200 text-sm leading-relaxed font-sans">
              Sailing through interstellar space, our Sun is now merely another star. Perfect cosmic quiet.
            </p>
            <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
              [ TRANSMISSION STEADY — 24H DELAY ]
            </span>
          </div>
        `;
      } else {
        statusBox.innerHTML = `
          <p class="text-sm font-mono text-zinc-500 tracking-wider uppercase animate-pulse">
            Keep scrolling up to approach the probe...
          </p>
        `;
      }
    }
  }

  // Audio Synthesizer real-time modulation on scroll
  if (isAudioPlaying && spaceDrone) {
    try {
      // Adjust master lowpass cutoff based on height (gets darker/softer in interstellar vacuum)
      const baseFreq = 80 + (1 - progress) * 160;
      spaceDrone.filter.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      
      // Shift detuned beating rate slightly to reflect velocity variations
      spaceDrone.beatOsc.frequency.setValueAtTime(55.4 + (progress * 0.8), audioCtx.currentTime);
    } catch(e){}
  }
}

// 4. Update UI details card
function updateSelectedMilestoneCard(id) {
  const data = MILESTONES[id];
  if (!data) return;

  // Update HUD Domain indicator
  document.getElementById('hud-domain').innerText = data.domain;

  // Target Profile updates
  const cardName = document.getElementById('card-name');
  const cardScale = document.getElementById('card-scale');
  const cardSubtitle = document.getElementById('card-subtitle');
  const cardDesc = document.getElementById('card-desc');
  const cardFact = document.getElementById('card-fact');

  // Smooth fade transitions
  [cardName, cardSubtitle, cardDesc, cardFact].forEach(el => {
    if (el) {
      el.style.opacity = '0.3';
      el.style.transform = 'translateY(2px)';
    }
  });

  setTimeout(() => {
    if (cardName) cardName.innerText = data.name;
    if (cardScale) cardScale.innerText = data.scale;
    if (cardSubtitle) cardSubtitle.innerText = data.subtitle;
    if (cardDesc) cardDesc.innerText = data.description;
    if (cardFact) cardFact.innerText = data.fact;

    [cardName, cardSubtitle, cardDesc, cardFact].forEach(el => {
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 180);

  // Highlight active Left Timeline Node
  document.querySelectorAll('.timeline-node').forEach(node => {
    const nodeKey = node.getAttribute('data-node-key');
    const dot = node.querySelector('.timeline-dot');
    const label = node.querySelector('.timeline-label');
    
    if (nodeKey === id) {
      dot.classList.add('active');
      label.classList.add('active', 'text-cyan-400');
      label.classList.remove('text-zinc-500');
    } else {
      dot.classList.remove('active');
      label.classList.remove('active', 'text-cyan-400');
      label.classList.add('text-zinc-500');
    }
  });
}

// Smoothly scroll to milestone
function scrollToMilestone(id) {
  const sec = document.querySelector(`section[data-milestone-id="${id}"]`);
  if (sec) {
    sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Generate Left-hand Sidebar Timeline Nodes
function renderLeftTimeline() {
  const container = document.getElementById('timeline-nodes-container');
  if (!container) return;

  container.innerHTML = "";
  TIMELINE_KEYS.forEach(key => {
    const data = MILESTONES[key];
    if (!data) return;

    const node = document.createElement('div');
    node.className = "timeline-node flex items-center gap-3 cursor-pointer group select-none py-1";
    node.setAttribute('data-node-key', key);
    node.onclick = () => scrollToMilestone(key);

    node.innerHTML = `
      <div class="timeline-dot w-2 h-2 rounded-full bg-zinc-700 border border-zinc-500/20 group-hover:scale-125"></div>
      <span class="timeline-label text-[9px] font-mono text-zinc-500 tracking-wider uppercase group-hover:text-white transition-colors">
        ${data.name}
      </span>
    `;

    container.appendChild(node);
  });
}

// Generate museum exhibit cards
function renderMuseumExhibits() {
  const grid = document.getElementById('museum-exhibits');
  if (!grid) return;

  grid.innerHTML = "";
  MUSEUM_DATA.forEach(ex => {
    const card = document.createElement('div');
    card.className = "bg-white/5 border border-white/5 hover:border-blue-500/20 p-6 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all duration-300 flex flex-col gap-4 group";
    
    let iconName = ex.icon;

    card.innerHTML = `
      <div class="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl w-fit group-hover:bg-cyan-500/25 transition-colors">
        <i data-lucide="${iconName}" class="w-4 h-4 text-cyan-400"></i>
      </div>
      <div class="space-y-1.5">
        <h4 class="text-sm font-bold uppercase tracking-wide text-zinc-100">${ex.title}</h4>
        <p class="text-[11px] text-zinc-400 leading-relaxed">${ex.desc}</p>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Generate right side historical logs
function renderFlightLogs() {
  const container = document.getElementById('flight-logs');
  if (!container) return;

  container.innerHTML = "";
  FLIGHT_LOGS.forEach(log => {
    const item = document.createElement('div');
    item.className = "flex gap-2.5 items-start py-1.5 border-b border-white/5 last:border-0";
    item.innerHTML = `
      <div class="flex flex-col items-center">
        <span class="text-[8px] font-mono bg-blue-500/10 text-cyan-400 border border-cyan-500/25 px-1 py-0.5 rounded leading-none">
          ${log.date.split(',')[1] || log.date.split(' ')[2] || log.date}
        </span>
      </div>
      <div class="space-y-0.5">
        <span class="font-bold text-zinc-200 block text-[9px] tracking-wide uppercase">${log.event}</span>
        <p class="text-[10px] text-zinc-500 leading-normal">${log.desc}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

// 5. Initiate Launch Sequence Trigger
function launchMission() {
  // Activate audio
  initSpaceSynth();

// Hide V2.5 header once experience starts
const vatsalHeader = document.querySelector(".vatsal-header");
if (vatsalHeader) {
  vatsalHeader.style.transition = "opacity .35s ease";
  vatsalHeader.style.opacity = "0";
  vatsalHeader.style.pointerEvents = "none";
}

  // Hide intro splash
  const intro = document.getElementById('intro-screen');
  if (intro) {
    intro.style.opacity = '0';
    intro.style.pointerEvents = 'none';
    setTimeout(() => intro.style.display = 'none', 1000);
  }

  // Make scrolling active & visible
  const scrollTrack = document.getElementById('scroll-track');
  if (scrollTrack) {
    scrollTrack.classList.remove('invisible');
  }

  document.body.classList.remove('h-screen', 'overflow-y-hidden');

  // Fade-in UI overlays
  const hud = document.getElementById('hud-deck');
  const leftTimeline = document.getElementById('left-timeline');
  const rightConsole = document.getElementById('right-console');
  
  [hud, leftTimeline, rightConsole].forEach(el => {
    if (el) {
      el.classList.remove('opacity-0');
      el.classList.add('opacity-100');
    }
  });

  // Smooth scroll user to Earth (bottom of page) immediately to begin ascent!
  setTimeout(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'auto'
    });
  }, 50);

  // Trigger floating alert banner after launch
  const tip = document.getElementById('download-tip');
  if (tip) {
    setTimeout(() => {
      tip.classList.remove('translate-y-20', 'opacity-0');
    }, 4500);
  }
}

function closeTip() {
  const tip = document.getElementById('download-tip');
  if (tip) {
    tip.classList.add('opacity-0', 'pointer-events-none');
  }
}

// Main initializer on page readiness
window.addEventListener('DOMContentLoaded', () => {
  // Generate Canvas starfield background
  new SpaceStarfield('starfield-canvas');

  // Set height lock on landing
  document.body.classList.add('h-screen', 'overflow-y-hidden');

  // Dynamic layout generations
  renderLeftTimeline();
  renderMuseumExhibits();
  renderFlightLogs();

  // Re-enable lucide icons for dynamic classes
  lucide.createIcons();

  // Listen to scroll actions
  window.addEventListener('scroll', handleScrollingTelemetry);
});
