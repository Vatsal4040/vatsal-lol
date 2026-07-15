// Sound Bar Core Logic Script (VISION.md compliant)
// Handles audio playback, playlist switching, volume state, controller loading, transitions, and space background.

const SONGS = [
  // English
  { title: "Dream Waves", artist: "Coldplay", path: "songs/engg/01 - A Head Full Of Dreams.mp3", category: "English" },
  { title: "Magic", artist: "Coldplay", path: "songs/engg/02 - Magic.mp3", category: "English" },
  { title: "Gravity", artist: "Coldplay", path: "songs/engg/06 - Gravity.mp3", category: "English" },
  { title: "I'm an Albatraoz", artist: "AronChupa", path: "songs/engg/AronChupa - I'm an Albatraoz _ OFFICIAL VIDEO.m4a", category: "English" },
  { title: "Deep Jungle Walk", artist: "Astrix", path: "songs/engg/Astrix - Deep Jungle Walk.m4a", category: "English" },
  { title: "Gravity (Live)", artist: "John Mayer", path: "songs/engg/John Mayer - Gravity [HD].m4a", category: "English" },
  // Bollywood
  { title: "Sunn Raha Hai Na Tu", artist: "Ankit Tiwari", path: "songs/hindi/002 Sunn Raha Hai.mp3", category: "Bollywood" },
  { title: "Chahun Main Ya Naa", artist: "Arijit Singh", path: "songs/hindi/003 Chahun Main Ya Naa.mp3", category: "Bollywood" },
  { title: "Hum Mar Jayenge", artist: "Arijit Singh", path: "songs/hindi/004 Hum Mar Jayenge.mp3", category: "Bollywood" },
  { title: "Meri Aashiqui", artist: "Arijit Singh", path: "songs/hindi/005 Meri Aashiqui.mp3", category: "Bollywood" },
  { title: "Piya Aaye Na", artist: "Arijit Singh & Tulsi Kumar", path: "songs/hindi/006 Piya Aaye Na.mp3", category: "Bollywood" },
  // Old Dad Car Songs
  { title: "Pal Pal Dil Ke Paas", artist: "Kishore Kumar", path: "songs/old/01. Black Mail - Pal Pal Dil Ke Paas.mp3", category: "Old Dad Car Songs" },
  { title: "Hamein Tumse Pyar Kitna", artist: "Kishore Kumar", path: "songs/old/02. Kudrat - Hamein Tumse Pyar Kitna.mp3", category: "Old Dad Car Songs" },
  { title: "Dil Kya Kare", artist: "Kishore Kumar", path: "songs/old/03. Julie - Dil Kya Kare.mp3", category: "Old Dad Car Songs" },
  { title: "Pyar Manga Hai", artist: "Kishore Kumar", path: "songs/old/04. College Girl - Pyar Manga Hai.mp3", category: "Old Dad Car Songs" },
  { title: "Muskurata Hua", artist: "Kishore Kumar", path: "songs/old/05. Lahoo Ke Do Rang - Muskurata Hua.mp3", category: "Old Dad Car Songs" }
];

const CONTROLLERS = {
  ball: '🎳',
  pencil: '✏️',
  eclipse: '🌞',
  pump: '🚲',
  dj: '💿',
  dice: '🎲',
  exam: '📝',
  vertical: '📏',
  rocket: '🚀',
  elevator: '🛗',
  thermometer: '🌡️',
  battery: '🔋',
  dart: '🎯',
  archery: '🏹',
  crane: '🏗',
  coffee: '☕',
  safe: '🔐',
  slot: '🎰'
};

// Global controllers registry container
window.controllers = window.controllers || {};

// State
let audio = new Audio();
let currentSongIndex = 0;
let volume = 0.63; // 0.0 to 1.0
let activeCategory = "English";

let activeControllerId = null;
let activeController = null;

// Local API offered to controllers
const controllerAPI = {
  setVolume(value) {
    volume = Math.max(0.0, Math.min(1.0, value));
    audio.volume = volume;
    updateVolumeUI();

    if (activeController && typeof activeController.setVolume === 'function') {
      activeController.setVolume(Math.round(volume * 100));
    }
  },
  
  getVolume() {
    return volume;
  }
};

// ----------------------------------------------------
// UI Render & Logic Helpers
// ----------------------------------------------------

function updateVolumeUI() {
  const pct = Math.round(volume * 100);
  const badge = document.getElementById('volume-badge');
  if (badge) {
    badge.textContent = `Volume: ${pct}%`;
  }
}

function loadSong() {
  const song = SONGS[currentSongIndex];
  audio.src = song.path;
  audio.load();
  document.getElementById('song-select').value = currentSongIndex;
}

function playTrack() {
  audio.play()
    .then(() => {
      document.getElementById('play-btn').textContent = "⏸";
    })
    .catch(e => console.warn("Audio context will unlock on user play interaction."));
}

function pauseTrack() {
  audio.pause();
  document.getElementById('play-btn').textContent = "▶";
}

function togglePlay() {
  if (audio.paused) playTrack(); else pauseTrack();
}

// Populate Songs list matching selected playlist category
function populateSongDropdown() {
  const songSelect = document.getElementById('song-select');
  songSelect.innerHTML = '';
  
  let firstIdxInCat = null;

  SONGS.forEach((song, idx) => {
    if (song.category === activeCategory) {
      if (firstIdxInCat === null) firstIdxInCat = idx;
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${song.title} — ${song.artist}`;
      songSelect.appendChild(opt);
    }
  });

  return firstIdxInCat;
}

// ----------------------------------------------------
// Local Registry Controller Switcher (With Transition)
// ----------------------------------------------------
function selectController(id) {
  if (activeControllerId === id) return;

  const container = document.getElementById('controller-area');
  
  // Fade out transition (100ms)
  container.style.opacity = 0;

  setTimeout(() => {
    // Unload previous controller module
    if (activeController && typeof activeController.destroy === 'function') {
      try {
        activeController.destroy();
      } catch (e) {
        console.error(`Error destroying controller "${activeControllerId}":`, e);
      }
    }

    container.innerHTML = '';
    activeControllerId = id;

    // Update active highlight on picker buttons
    document.querySelectorAll('.picker-btn').forEach(btn => {
      if (btn.getAttribute('data-id') === id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    try {
      const controller = window.controllers[id];
      if (!controller) {
        throw new Error(`Controller "${id}" is not registered.`);
      }

      activeController = controller;

      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      container.appendChild(wrapper);

      // Initialize controller
      activeController.init(wrapper, controllerAPI);

      // Sync current volume
      if (typeof activeController.setVolume === 'function') {
        activeController.setVolume(Math.round(volume * 100));
      }
    } catch (err) {
      console.error(`Failed to load controller "${id}":`, err);
      container.innerHTML = `<div class="error-msg" style="color:var(--red); font-size:0.9rem; text-align:center; padding:20px;">Failed loading ${CONTROLLERS[id]}<br><span style="font-size:0.75rem; color:#aaa; font-family:monospace; margin-top:8px; display:block;">${err.message}</span></div>`;
    }

    // Fade in transition (150ms)
    container.style.opacity = 1;
  }, 100);
}

// ----------------------------------------------------
// Application Setup
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const playlistSelect = document.getElementById('playlist-select');
  const songSelect = document.getElementById('song-select');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Set default playlist category state
  activeCategory = playlistSelect.value;
  currentSongIndex = populateSongDropdown();
  loadSong();

  // Change Playlist event listener
  playlistSelect.addEventListener('change', (e) => {
    activeCategory = e.target.value;
    currentSongIndex = populateSongDropdown();
    loadSong();
    playTrack();
  });

  // Change Song event listener
  songSelect.addEventListener('change', (e) => {
    currentSongIndex = parseInt(e.target.value, 10);
    loadSong();
    playTrack();
  });

  playBtn.addEventListener('click', togglePlay);

  // Play next/prev tracks within current category
  prevBtn.addEventListener('click', () => {
    const catSongs = SONGS.filter(s => s.category === activeCategory);
    const currSubIdx = catSongs.findIndex(s => s.path === SONGS[currentSongIndex].path);
    const prevSubIdx = (currSubIdx - 1 + catSongs.length) % catSongs.length;
    const targetSong = catSongs[prevSubIdx];
    
    currentSongIndex = SONGS.findIndex(s => s.path === targetSong.path);
    loadSong();
    playTrack();
  });

  nextBtn.addEventListener('click', () => {
    const catSongs = SONGS.filter(s => s.category === activeCategory);
    const currSubIdx = catSongs.findIndex(s => s.path === SONGS[currentSongIndex].path);
    const nextSubIdx = (currSubIdx + 1) % catSongs.length;
    const targetSong = catSongs[nextSubIdx];
    
    currentSongIndex = SONGS.findIndex(s => s.path === targetSong.path);
    loadSong();
    playTrack();
  });

  audio.addEventListener('ended', () => {
    const catSongs = SONGS.filter(s => s.category === activeCategory);
    const currSubIdx = catSongs.findIndex(s => s.path === SONGS[currentSongIndex].path);
    const nextSubIdx = (currSubIdx + 1) % catSongs.length;
    const targetSong = catSongs[nextSubIdx];
    
    currentSongIndex = SONGS.findIndex(s => s.path === targetSong.path);
    loadSong();
    playTrack();
  });

  // Render picker emojis
  const pickerGrid = document.getElementById('controller-picker');
  pickerGrid.innerHTML = '';
  Object.keys(CONTROLLERS).forEach(id => {
    const btn = document.createElement('button');
    btn.className = 'picker-btn';
    btn.setAttribute('data-id', id);
    btn.textContent = CONTROLLERS[id];
    btn.title = id;

    btn.addEventListener('click', () => {
      selectController(id);
    });
    
    pickerGrid.appendChild(btn);
  });

  audio.volume = volume;
  updateVolumeUI();

  // Initialize space background and load horizontal slider
  initSpaceBackground();
  selectController('default');
});

function initSpaceBackground() {
  const canvas = document.createElement('canvas');
  canvas.id = 'space-bg';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  
  let stars = [];
  const starCount = 65;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.1 + 0.4,
        twinkleSpeed: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function animate() {
    // Pure space black background (#000000)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      star.phase += star.twinkleSpeed;
      const alpha = 0.2 + (Math.sin(star.phase) + 1) * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}
