/**
 * Memories — Ambient Web Experience Logic
 */

// Scene Configurations
const scenes = {
  barber: {
    name: "Barber Shop",
    image: "saloon.png", // Mapped from saloon.png
    playlistId: "PLbhNkpM-gLMM",
    effect: "dust",
    vibrate: false,
    horn: false
  },
  auto: {
    name: "Auto Crossroad",
    image: "auto.png",
    playlistId: "PLbhNkpM-gLMM",
    effect: "road",
    vibrate: true,
    horn: false
  },
  dad: {
    name: "Dad's Drive",
    image: "dad.png",
    playlistId: "PLZONSa-8HMVM",
    effect: "road",
    vibrate: false,
    horn: false
  },
  truck: {
    name: "Desi Truck",
    image: "truck.png",
    playlistId: "PLbhNkpM-gLMM",
    effect: "road",
    vibrate: true,
    horn: true
  },
  class95: {
    name: "Class of 1995",
    image: "class95.png",
    playlistId: "PLbhNkpM-gLMM",
    effect: "dust",
    vibrate: false,
    horn: false
  }
};

let currentSceneKey = "barber";
let player = null;
let isPlayerReady = false;
let updateInterval = null;
let autoplayUnlocked = false;

// Audio for Desi Truck Horn
const hornAudio = new Audio("_Dhoom_Bus_Horn_Ringtone_(by Fringster.com).mp3");
hornAudio.volume = 0.8;

// DOM helper
const $ = id => document.getElementById(id);

// Load Custom Playlists from localStorage if saved
Object.keys(scenes).forEach(key => {
  const saved = localStorage.getItem(`playlist_${key}`);
  if (saved) {
    scenes[key].playlistId = saved;
  }
});

// Update Local Browser Clock
function updateClock() {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}
setInterval(updateClock, 1000);
updateClock();

// Serverless Presence Tracking (Real-time concurrent users)
const sessionId = Math.random().toString(36).substring(2, 10);
const bucketUrl = "https://kvdb.io/YTGtTWiAdzX2RUo4Si6Fs8";

async function updatePresence() {
  try {
    // 1. Send heartbeat key with 45 seconds TTL
    await fetch(`${bucketUrl}/presence_${sessionId}?ttl=45`, {
      method: "POST",
      body: "1"
    });

    // 2. Query list of active keys
    const res = await fetch(`${bucketUrl}/?prefix=presence_`);
    const keys = await res.json();
    if (Array.isArray(keys)) {
      const count = keys.length || 1;
      $("live-count").textContent = count;
    }
  } catch (err) {
    console.warn("Presence count warning:", err);
  }
}
updatePresence();
setInterval(updatePresence, 20000); // Heartbeat every 20 seconds

// Inactivity Dimmer (Ambient Mode)
let inactivityTimer;
const resetInactivityTimer = () => {
  document.body.classList.remove("ambient-mode");
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    // Only go into ambient mode if audio is playing
    if (player && player.getPlayerState?.() === YT.PlayerState.PLAYING) {
      document.body.classList.add("ambient-mode");
    }
  }, 10000); // 10 seconds of inactivity
};

window.addEventListener("mousemove", resetInactivityTimer);
window.addEventListener("mousedown", resetInactivityTimer);
window.addEventListener("touchstart", resetInactivityTimer);
window.addEventListener("keydown", resetInactivityTimer);
resetInactivityTimer();

// ----------------------------------------------------
// Ambient Canvas Overlay Animation
// ----------------------------------------------------
const canvas = $("ambient-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let sweeps = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Update background image for mobile/desktop aspect ratio switch
  const scene = scenes[currentSceneKey];
  if (scene) {
    const isMobile = window.innerWidth <= 768;
    const sceneImg = isMobile ? `m_${scene.image}` : scene.image;
    $("scene").style.backgroundImage = `url("${sceneImg}")`;
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Dust Particle Constructor
class DustParticle {
  constructor() {
    this.reset();
    // Start randomly on screen
    this.y = Math.random() * canvas.height;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = Math.random() * 0.4 - 0.2;
    this.speedY = Math.random() * 0.3 + 0.1;
    this.opacity = Math.random() * 0.5 + 0.15;
    this.fadeSpeed = Math.random() * 0.005 + 0.002;
    this.pulseDir = Math.random() > 0.5 ? 1 : -1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Slight opacity pulsing to feel like sparkling dust in sunlight
    this.opacity += this.pulseDir * this.fadeSpeed;
    if (this.opacity > 0.7 || this.opacity < 0.15) {
      this.pulseDir *= -1;
    }

    if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    // Soft golden sunlight color
    ctx.fillStyle = `rgba(243, 225, 180, ${this.opacity})`;
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(243, 225, 180, 0.4)";
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  }
}

// Light Sweep/Reflection Constructor (simulates passing streetlights or shadows)
class LightSweep {
  constructor() {
    this.reset();
  }

  reset() {
    this.progress = -0.5; // Start offscreen
    this.speed = Math.random() * 0.004 + 0.002;
    this.width = Math.random() * 200 + 150;
    this.opacity = Math.random() * 0.08 + 0.02;
    this.angle = Math.PI / 6; // 30 degrees tilt
  }

  update() {
    this.progress += this.speed;
    if (this.progress > 1.5) {
      this.reset();
    }
  }

  draw() {
    const x = this.progress * canvas.width;
    const grad = ctx.createLinearGradient(x - this.width, 0, x + this.width, 0);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.5, `rgba(255, 235, 190, ${this.opacity})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(this.angle);
    ctx.fillStyle = grad;
    ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
    ctx.restore();
  }
}

// Initialize particles & sweeps
for (let i = 0; i < 40; i++) particles.push(new DustParticle());
for (let i = 0; i < 2; i++) sweeps.push(new LightSweep());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const currentEffect = scenes[currentSceneKey].effect;

  if (currentEffect === "dust") {
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  } else if (currentEffect === "road") {
    sweeps.forEach(s => {
      s.update();
      s.draw();
    });
  }

  requestAnimationFrame(animate);
}
animate();

// ----------------------------------------------------
// YouTube Player & API Integration
// ----------------------------------------------------

// Load YouTube API script
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Automatically called by YT API
function onYouTubeIframeAPIReady() {
  player = new YT.Player("yt-player", {
    height: "200",
    width: "200",
    playerVars: {
      playsinline: 1,
      rel: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  isPlayerReady = true;
  // Load playlist for the default/current scene
  const playlistId = scenes[currentSceneKey].playlistId;
  player.loadPlaylist({
    listType: "playlist",
    list: playlistId,
    index: 0
  });
  player.setVolume(75);
  updateFooterLink(playlistId);
}

function onPlayerStateChange(event) {
  const state = event.data;
  const playPauseBtn = $("play-pause");
  const cassette = document.querySelector(".cassette-holder");

  if (state === YT.PlayerState.PLAYING) {
    playPauseBtn.innerHTML = "Ⅱ"; // Pause symbol
    cassette.classList.add("playing");
    
    // Start metadata track updating
    startMetaTracking();
  } else {
    playPauseBtn.innerHTML = "▶"; // Play symbol
    cassette.classList.remove("playing");
    stopMetaTracking();
  }
}

function startMetaTracking() {
  if (updateInterval) clearInterval(updateInterval);
  
  // Tick immediately and then every 1 second
  updateTrackMeta();
  updateInterval = setInterval(updateTrackMeta, 1000);
}

function stopMetaTracking() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return "0:00";
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const remS = s % 60;
  return `${m}:${String(remS).padStart(2, '0')}`;
}

function updateTrackMeta() {
  if (!isPlayerReady || !player) return;

  try {
    const data = (typeof player.getVideoData === "function") ? player.getVideoData() : {};
    const title = data.title || "Ambient Memory Song";
    const channel = data.author || "Nostalgic Moments";

    $("song-title").textContent = title;
    $("song-artist").textContent = channel;
  } catch (err) {
    console.warn("Failed to get video data:", err);
    $("song-title").textContent = "Ambient Memory Song";
    $("song-artist").textContent = "Nostalgic Moments";
  }

  try {
    const current = (typeof player.getCurrentTime === "function") ? player.getCurrentTime() : 0;
    const duration = (typeof player.getDuration === "function") ? player.getDuration() : 0;

    if (duration > 0) {
      const percent = (current / duration) * 100;
      $("progress-bar").style.width = `${percent}%`;
      $("time-current").textContent = formatTime(current);
      $("time-duration").textContent = formatTime(duration);
    } else {
      $("progress-bar").style.width = "0%";
      $("time-current").textContent = "0:00";
      $("time-duration").textContent = "0:00";
    }
  } catch (err) {
    console.warn("Failed to get time/duration:", err);
  }
}

function updateFooterLink(playlistId) {
  $("playlist-link").href = `https://music.youtube.com/playlist?list=${playlistId}`;
}

// Controls Logic
$("play-pause").onclick = (e) => {
  e.stopPropagation();
  if (!isPlayerReady) return;

  const state = player.getPlayerState?.();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    // If the playlist has not been loaded or started yet, load it
    if (state === YT.PlayerState.CUED || state === -1) {
      player.playVideo();
    } else {
      player.playVideo();
    }
  }
};

$("prev").onclick = (e) => {
  e.stopPropagation();
  if (isPlayerReady) player.previousVideo();
};

$("next").onclick = (e) => {
  e.stopPropagation();
  if (isPlayerReady) player.nextVideo();
};

$("mute").onclick = (e) => {
  e.stopPropagation();
  if (!isPlayerReady) return;

  const muteBtn = $("mute");
  if (player.isMuted()) {
    player.unMute();
    muteBtn.innerHTML = "🔊";
  } else {
    player.mute();
    muteBtn.innerHTML = "🔇";
  }
};

// Interactive Seek Bar
$("slider-container").onclick = function(e) {
  e.stopPropagation();
  if (!isPlayerReady || !player) return;

  const rect = this.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const ratio = Math.max(0, Math.min(1, clickX / width));
  
  const duration = player.getDuration?.() || 0;
  if (duration > 0) {
    player.seekTo(duration * ratio, true);
    // Immediately update progress bar
    $("progress-bar").style.width = `${ratio * 100}%`;
  }
};

// ----------------------------------------------------
// Scene Switching & Page Management
// ----------------------------------------------------
function setScene(sceneKey) {
  const scene = scenes[sceneKey];
  if (!scene) return;

  const oldSceneKey = currentSceneKey;
  currentSceneKey = sceneKey;

  // 1. Update active styling in scene selectors
  document.querySelectorAll(".scene-btn").forEach(btn => {
    if (btn.dataset.scene === sceneKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 2. Set engine vibration styling
  const sceneEl = $("scene");
  if (scene.vibrate) {
    sceneEl.classList.add("engine-vibrate");
  } else {
    sceneEl.classList.remove("engine-vibrate");
  }

  // 3. Handle horn hotspot
  const hornHotspot = $("horn-hotspot");
  if (scene.horn) {
    hornHotspot.style.display = "block";
  } else {
    hornHotspot.style.display = "none";
  }

  // 4. Update scene background image
  const isMobile = window.innerWidth <= 768;
  const sceneImg = isMobile ? `m_${scene.image}` : scene.image;
  sceneEl.style.backgroundImage = `url("${sceneImg}")`;

  // 5. Handle Audio Loading
  if (isPlayerReady && player) {
    // If the new scene uses a DIFFERENT playlist, load it
    if (scene.playlistId !== scenes[oldSceneKey].playlistId) {
      player.loadPlaylist({
        listType: "playlist",
        list: scene.playlistId,
        index: 0
      });
      updateFooterLink(scene.playlistId);
    }
  }
}

// Scene Selector Buttons Click Handler
document.querySelectorAll(".scene-btn").forEach(btn => {
  btn.onclick = (e) => {
    e.stopPropagation();
    const key = btn.dataset.scene;
    setScene(key);
  };
});

// Fallback play gesture on first click if browser blocks autoplay
document.addEventListener("click", () => {
  if (isPlayerReady && player) {
    const state = player.getPlayerState?.();
    if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING) {
      player.playVideo();
    }
  }
}, { once: true });

// Horn Hotspot Click Handler
$("horn-hotspot").onclick = (e) => {
  e.stopPropagation();
  // Play horn ringtone sound immediately
  hornAudio.currentTime = 0; // Rewind to start
  hornAudio.play().catch(err => console.log("Audio play failed:", err));
};

// ----------------------------------------------------
// Custom Playlist ID Modifiers
// ----------------------------------------------------
$("playlist-edit-btn").onclick = (e) => {
  e.stopPropagation();
  const playlistModal = $("playlist-modal");
  $("playlist-input").value = scenes[currentSceneKey].playlistId;
  playlistModal.classList.add("show");
};

$("modal-cancel").onclick = (e) => {
  e.stopPropagation();
  $("playlist-modal").classList.remove("show");
};

$("modal-save").onclick = (e) => {
  e.stopPropagation();
  const newId = $("playlist-input").value.trim();
  if (newId) {
    // Save to configuration and localStorage
    scenes[currentSceneKey].playlistId = newId;
    localStorage.setItem(`playlist_${currentSceneKey}`, newId);

    // Update link & load
    updateFooterLink(newId);
    if (isPlayerReady && player) {
      player.loadPlaylist({
        listType: "playlist",
        list: newId,
        index: 0
      });
    }
  }
  $("playlist-modal").classList.remove("show");
};

// Clicking outside the modal closes it
$("playlist-modal").onclick = (e) => {
  if (e.target === $("playlist-modal")) {
    $("playlist-modal").classList.remove("show");
  }
};

// Start default scene immediately
setScene(currentSceneKey);
