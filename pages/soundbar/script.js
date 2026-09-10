// Sound Bar Core Logic Script (VISION.md compliant)
// Handles audio playback, playlist switching, volume state, controller loading, transitions, and space background.

const STATIONS = {
  "Party": [
    "freecompress-AronChupa - I'm an Albatraoz _ OFFICIAL VIDEO.mp3",
    "freecompress-Astrix - Deep Jungle Walk.mp3",
    "freecompress-Babalos - Snow crystal 185 bpm.mp3",
    "freecompress-Belik boom - Avada kadabra (Harry potter).mp3",
    "freecompress-Belik boom - Gulab Jamun (Original Mix).mp3",
    "freecompress-Bhayanak Atma feat. Gagan Mudgal.mp3",
    "freecompress-Blastoyz - Parvati Valley-mc.mp3",
    "freecompress-Hardwell & Armin van Buuren - Off The Hook [OUT NOW!]_HIGH-mc.mp3",
    "freecompress-Mandragora & Devochka - Shiva Style (Original Mix).mp3",
    "freecompress-OxiDaksi_-_Poison_Turtle_178[www.MP3Fiber.com].mp3",
    "freecompress-Shpongle - Divine Moments Of Truth (Astrix, Loud & L.S.D Remix).mp3",
    "freecompress-Technical Hitch - Mama India (Shantrip).mp3",
    "freecompress-Technical Hitch - Mama India (The Revolution).mp3",
    "freecompress-UnderCover_-_Balikali_Original_mix[www.MP3Fiber.com].mp3"
  ],
  "Listen": [
    "freecompress-01 - A Head Full Of Dreams.mp3",
    "freecompress-02 - Magic.mp3",
    "freecompress-03 - Hymn For The Weekend.mp3",
    "freecompress-06 - Gravity.mp3",
    "freecompress-08 - A Message.mp3",
    "freecompress-08 - A Sky Full Of Stars.mp3",
    "freecompress-09 - Amazing Day.mp3",
    "freecompress-11 - Up&Up.mp3",
    "freecompress-John Mayer - Ain't No Sunshine  - Live at the Crossroads Guitar Festival 2010.mp3",
    "freecompress-John Mayer - Gravity [HD].mp3",
    "freecompress-LONDON, ENGLAND Green Day Crowd Singing Bohemian Rhapsody - Hyde Park July 1st, .mp3",
    "freecompress-Led Zeppelin - Stairway To Heaven (NOT LIVE) (Perfect Audio).mp3",
    "freecompress-Passenger - Let Her Go (Lyrics).mp3",
    "freecompress-The Beatles - Hey Jude.mp3",
    "freecompress-Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtra.mp3"
  ],
  "Bollywood": [
    "freecompress-002 Sunn Raha Hai.mp3",
    "freecompress-01  AGAR TUM MIL JAO-------GHOSAL,, --01.mp3",
    "freecompress-01 .Soniye.mp3",
    "freecompress-01 dil ibaadt.mp3",
    "freecompress-014 Dhoom Machale Dhoom.mp3",
    "freecompress-019 Ram Chahe Leela.mp3",
    "freecompress-02 Samjhawan - HUMPTY SHARMA KI DULHANIA.mp3",
    "freecompress-021 Ang Laga De.mp3",
    "freecompress-030 Kashmir Main Tu Kanyakumari.mp3",
    "freecompress-031 1234 Get On The Dance Floor.mp3",
    "freecompress-037 Balam Pichkari.mp3",
    "freecompress-073 Naino Mein Sapna.mp3",
    "freecompress-074 Taki Taki.mp3",
    "freecompress-113 You Are My Love.mp3",
    "freecompress-124 Tera Yaar Hoon Main.mp3"
  ],
  "Car Drive": [
    "freecompress-002 AAP TO AISE NA THE = TOO IS TARAH SE.mp3",
    "freecompress-003 DHARAM VEER = O MERI MAHEBOOBA.mp3",
    "freecompress-004 DO RAASTE = YE RESHMI ZULFE.mp3",
    "freecompress-005 FARZ = MAST BAHARON KA.mp3",
    "freecompress-006 JEENE KI RAAH = AANE SE JISKE AAYE BAHAR.mp3",
    "freecompress-008 LOAFER = AAJ MAUSAM BADA BE- IMAN HAI.mp3",
    "freecompress-01. Black Mail - Pal Pal Dil Ke Paas.mp3",
    "freecompress-02. Kudrat - Hamein Tumse Pyar Kitna.mp3",
    "freecompress-03. Julie - Dil Kya Kare.mp3",
    "freecompress-04. College Girl - Pyar Manga Hai.mp3",
    "freecompress-05. Lahoo Ke Do Rang - Muskurata Hua.mp3",
    "freecompress-06. Darling Darling - Aise Na Mujhe Tu.mp3",
    "freecompress-07. Dream Girl - Title.mp3",
    "freecompress-08. Kalakaar - Neele Neele Amber Par.mp3",
    "freecompress-09. Karz - Om Shanti Om.mp3",
    "freecompress-10. Sanam Teri Kasam - Kitne Bhi Tu Karle.mp3",
    "freecompress-11. Saagar - Saagar Jaisi Aankhonwali.mp3"
  ]
};

const STATION_FOLDERS = {
  Party: "BPM",
  Listen: "ENG",
  Bollywood: "HIN",
  "Car Drive": "DAD"
};

const CONTROLLERS = {
  ball: '⚽',
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
  bowling: '🎳',
  spaceInvaders: '👾',
  crane: '🏗',
  coffee: '☕',
  slot: '🎰'
};

// Global controllers registry container
window.controllers = window.controllers || {};

// State
let audio = new Audio();
let currentStation = "Party";
let currentSongFilename = "";
let volume = 0.63; // 0.0 to 1.0

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

function getCleanSongTitle(filename) {
  let name = filename.replace(/\.[^/.]+$/, "");
  name = name.replace(/^\d+[\s.-]*/, "");
  name = name.replace(/_mc|\[HD\]|_[\s]*OFFICIAL[\s]*VIDEO|\[www\.MP3Fiber\.com\]|\(NOT LIVE\)|\(Perfect Audio\)/gi, "");
  name = name.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  
  if (name.length > 38) {
    name = name.substring(0, 35) + "...";
  }
  return name;
}

function updateVolumeUI() {
  const pct = Math.round(volume * 100);
  const badge = document.getElementById('volume-badge');
  if (badge) {
    badge.textContent = `Volume: ${pct}%`;
  }
}

function loadRandomSongFromStation() {
  const playlist = STATIONS[currentStation];
  if (!playlist || playlist.length === 0) return;
  
  let nextIndex = Math.floor(Math.random() * playlist.length);
  if (playlist.length > 1) {
    while (playlist[nextIndex] === currentSongFilename) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    }
  }
  
  currentSongFilename = playlist[nextIndex];
  const folder = STATION_FOLDERS[currentStation];
  const songPath = `songs/${folder}/${currentSongFilename}`;
  
  audio.src = songPath;
  audio.load();
  
  const cleanTitle = getCleanSongTitle(currentSongFilename);
  const displayBanner = document.getElementById('station-now-playing');
  if (displayBanner) {
    displayBanner.textContent = `Now Playing: ${cleanTitle}`;
  }
  
  // Set starting time to 30s + slight random offset (live tuning effect)
  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = 30 + Math.floor(Math.random() * 15);
  }, { once: true });
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
  const stationSelect = document.getElementById('station-select');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Load default station song
  currentStation = stationSelect.value;
  loadRandomSongFromStation();

  // Change Station event listener
  stationSelect.addEventListener('change', (e) => {
    currentStation = e.target.value;
    loadRandomSongFromStation();
    playTrack();
  });

  playBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', () => {
    loadRandomSongFromStation();
    playTrack();
  });

  nextBtn.addEventListener('click', () => {
    loadRandomSongFromStation();
    playTrack();
  });

  // Track finished playing auto-advances to another random song on this station
  audio.addEventListener('ended', () => {
    loadRandomSongFromStation();
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
