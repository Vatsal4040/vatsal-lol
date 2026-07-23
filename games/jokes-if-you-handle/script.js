// ============================================================
// JOKE ROULETTE — script.js
// vatsal.lol
// Dad → icanhazdadjoke.com API
// Dark → jokeapi.dev API
// Wholesome / Cursed / Roast / Gen Z → local pool
// ============================================================

// ---------- Local joke pools ----------
const POOL = {
  wholesome: [
    "Why did the bicycle fall over? Because it was two-tired... but it got back up. Just like you will.",
    "What do you call a bear with no teeth? A gummy bear. Still sweet.",
    "Why do cows wear bells? Because their horns don't work.",
    "What do you call cheese that isn't yours? Nacho cheese.",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "What do you call a sleeping dinosaur? A dino-snore.",
    "Why can't Elsa have a balloon? Because she'll let it go.",
    "What do elves learn in school? The elf-abet.",
    "Why did the golfer bring an extra pair of pants? In case he got a hole in one.",
    "What do you call a fish without eyes? A fsh.",
    "How do you organize a space party? You planet.",
    "Why did the math book look so sad? Because it had too many problems.",
    "What do you call a factory that makes okay products? A satisfactory.",
    "Why did the coffee file a police report? It got mugged.",
    "What do you call a pile of cats? A meow-ntain.",
    "Why don't scientists trust atoms? Because they make up everything.",
    "What do you call an alligator in a vest? An investigator.",
    "Why did the tomato turn red? Because it saw the salad dressing.",
    "What do you call a dinosaur that crashes their car? Tyrannosaurus wrecks.",
    "Why did the stadium get hot after the game? All the fans left.",
    "What do you call a nosy pepper? Jalapeño business.",
    "Why do bees have sticky hair? Because they use honeycombs.",
    "What do you call a dog magician? A labracadabrador.",
    "Why did the picture go to jail? Because it was framed.",
    "What do you call a sad cup of coffee? Depresso."
  ],
  cursed: [
    "A horse walks into a bar. Several patrons get up and leave, recognizing the potential danger of the situation.",
    "I told my dog he was adopted. He said 'I know. A real family would have taught me to talk.'",
    "What's brown and sticky? A stick. What's brown and not sticky? A failed stick.",
    "Why did the scarecrow win a Nobel Prize? He was outstanding in his field but the committee was running low on nominees.",
    "I have a joke about time travel but you didn't like it.",
    "A man walks into a library and asks for books about paranoia. The librarian whispers, 'They're right behind you.' He never returns.",
    "Why don't skeletons fight each other? They don't have the guts. Also they're dead.",
    "I told my cat a joke. He stared at me. He's still staring. It's been three weeks.",
    "What do you call a boomerang that doesn't come back? A stick. What do you call a stick that doesn't work? My life.",
    "A snail gets mugged by two turtles. Police ask what happened. The snail says 'I don't know, it all happened so fast.'",
    "Why did the chicken cross the road? It doesn't matter. Nothing matters.",
    "I asked the universe for a sign. It sent me a stop sign.",
    "What's the last thing to go through a bug's mind when it hits a windshield? Its thorax.",
    "I started a band called 999 Megabytes. We haven't gotten a gig yet.",
    "A photon checks into a hotel. The bellhop asks if he has any luggage. The photon says 'No, I'm traveling light.' The bellhop stares into the void.",
    "Why did the invisible man turn down the job offer? He couldn't see himself doing it.",
    "I told a joke about construction. I'm still working on it. I have been for years.",
    "What do you call a man with no arms and no legs lying in a pile of leaves? Russell. He's fine though.",
    "My therapist says I have a preoccupation with vengeance. We'll see about that.",
    "I asked Siri why I'm still single. She opened the front camera.",
    "Why does Waldo wear stripes? He doesn't want to be spotted. He's also running from something.",
    "A skeleton walks into a bar and orders a beer and a mop.",
    "I have a joke about amnesia but I forget how it goes. Actually I think that's the joke.",
    "What has four legs in the morning, two at noon, three in the evening? A really bad day.",
    "My grandfather has the heart of a lion and a lifetime ban from the zoo."
  ],
  roast: [
    "You've been playing browser games so long your career is loading... still loading... connection timed out.",
    "You call it 'indie gaming culture.' Your bank account calls it a cry for help.",
    "Your productivity is in beta. Has been since 2019.",
    "You play browser games to unwind. From what? You haven't done anything.",
    "Your browser history is 90% browser games and 10% 'how to explain gaps in resume.'",
    "You're not procrastinating. You're 'conducting extensive QA testing on entertainment software.'",
    "You told your boss you were 'developing hand-eye coordination.' He saw your screen.",
    "Your LinkedIn says 'self-motivated.' Your screen time report disagrees.",
    "You've mastered six browser games and one life skill. Typing. Barely.",
    "Your friends ask what you do on weekends. You say 'projects.' They've stopped asking.",
    "You're not addicted to browser games. You're just very committed to not being productive.",
    "Your parents asked when you'd get a real hobby. You refreshed the leaderboard.",
    "You treat every browser game like it's your job. Unfortunately it is not your job.",
    "You've hit level 47 in a game that has no level 47. You made it yourself.",
    "Your New Year's resolution was to touch grass. It's still in backlog.",
    "You play browser games for fun. Your fun is someone else's homework they actually submitted.",
    "You're one spin away from productivity. You've been saying that for six months.",
    "Your time management skill is maxed out — in the game. In real life it's level 2.",
    "You built 33 browser games. That IS your job. Never mind, you're winning.",
    "You took 'work-life balance' literally. Zero work, maximum games. Balanced.",
    "You told yourself just one more game at 11pm. It is now 3am. You're on a new game.",
    "Your screen time report is the only report you check regularly.",
    "You optimized the loading time on your game. You can't find your passport.",
    "People ask what you do. You say 'game developer.' They ask what game. You say 'all of them.'"
  ],
  genz: [
    "Me: I should sleep. Brain: what if we overthought everything from 2011 instead.",
    "The audacity of this Monday to show up again after what it did last week.",
    "POV: you opened 47 tabs to be productive. You've now been on the first tab for 3 hours.",
    "Therapist: what's wrong? Me: it's giving... everything. Everything is wrong.",
    "My villain era started when I stopped replying to 'lol' with 'haha'.",
    "No thoughts. Head empty. Just vibes and a concerning amount of browser game knowledge.",
    "I don't have a sleep schedule. I have a sleep suggestion that I routinely ignore.",
    "The way I said 'I'll do it later' with so much confidence and no plan whatsoever.",
    "Living my best life if you don't look too closely.",
    "My Roman empire is the email I sent and immediately wished I could un-send.",
    "POV: it's 2am and you're googling a question that doesn't matter and won't matter.",
    "I'm not procrastinating. I'm letting the idea marinate. It's been marinating for 8 months.",
    "Brain: remember that embarrassing thing from 2014? Me: I was trying to sleep. Brain: lol.",
    "The way I said 'I'll be ready in 5 minutes' while lying completely horizontal.",
    "Me: I need to be productive. Also me: let me check this one thing first. [4 hours pass]",
    "My attention span said 'slay' and then left.",
    "I've entered my 'doing things for me' era. The things are naps.",
    "Not me telling myself 'this is the last one' for the eleventh time in a row.",
    "The confidence I have while making plans I will absolutely not keep is unmatched.",
    "POV: you refreshed the page hoping something changed. It didn't. You refresh again.",
    "I'm a morning person in the sense that mornings make me a different, worse person.",
    "My work-life balance is that I'm unwell in both areas equally.",
    "I said I'd start fresh on Monday. It's Thursday. I meant next Monday.",
    "The serotonin I get from closing browser tabs is the only thing keeping me going.",
    "Current mood: functional but just barely. Like a browser with 40 tabs open."
  ]
};

// Shuffle helper
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Per-vibe indices for local pools
const poolIndex = { wholesome: 0, cursed: 0, roast: 0, genz: 0 };
const poolShuffled = {
  wholesome: shuffle(POOL.wholesome),
  cursed:    shuffle(POOL.cursed),
  roast:     shuffle(POOL.roast),
  genz:      shuffle(POOL.genz)
};

function getLocalJoke(id) {
  const pool = poolShuffled[id];
  let idx = poolIndex[id];
  if (idx >= pool.length) {
    poolShuffled[id] = shuffle(POOL[id]);
    idx = 0;
  }
  const joke = poolShuffled[id][idx];
  poolIndex[id] = idx + 1;
  return joke;
}

// ---------- Segments ----------
const SEGMENTS = [
  { id: "dad",       label: "Dad Joke",  emoji: "👴", colorLight: "#378ADD", colorDark: "#1a5a99" },
  { id: "dark",      label: "Dark",      emoji: "💀", colorLight: "#E24B4A", colorDark: "#8a1f1f" },
  { id: "wholesome", label: "Wholesome", emoji: "🌻", colorLight: "#639922", colorDark: "#2d5c08" },
  { id: "cursed",    label: "Cursed",    emoji: "👁️", colorLight: "#7F77DD", colorDark: "#3d3580" },
  { id: "roast",     label: "Roast",     emoji: "🔥", colorLight: "#D85A30", colorDark: "#7a2a0f" },
  { id: "genz",      label: "Gen Z",     emoji: "💅", colorLight: "#D4537E", colorDark: "#7a1f45" }
];

// ---------- Canvas setup ----------
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const N = SEGMENTS.length;
const ARC = (2 * Math.PI) / N;

let currentAngle = -Math.PI / 2;
let isSpinning = false;
let lastSeg = null;
let jokeCount = 0;

// ---------- Dark mode ----------
function isDark() {
  return document.documentElement.getAttribute("data-mode") === "dark"
    || window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ---------- Draw wheel ----------
function drawWheel(rot) {
  const size = canvas.width;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < N; i++) {
    const start = rot + i * ARC;
    const end = start + ARC;
    const seg = SEGMENTS[i];

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = isDark() ? seg.colorDark : seg.colorLight;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + ARC / 2);
    ctx.textAlign = "right";
    ctx.font = `bold ${Math.floor(size * 0.047)}px Fredoka, sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.fillText(seg.emoji + " " + seg.label, r - 10, 5);
    ctx.restore();
  }

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ---------- Resize canvas ----------
function resizeCanvas() {
  const vw = window.innerWidth;
  let size = 300;
  if (vw <= 380) size = 240;
  else if (vw <= 699) size = 260;
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  const wrap = document.querySelector(".wheel-wrap");
  wrap.style.width = size + "px";
  wrap.style.height = size + "px";
  drawWheel(currentAngle);
}

// ---------- Easing ----------
function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

// ---------- Spin ----------
function spin() {
  if (isSpinning) return;
  isSpinning = true;
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');

  const spinBtn = document.getElementById("spinBtn");
  spinBtn.disabled = true;
  hideActions();
  resetCard();

  const targetIndex = Math.floor(Math.random() * N);
  const extraSpins = 5 + Math.floor(Math.random() * 4);
  const segCenter = (targetIndex + 0.5) * ARC;
  const normalizedAngle = currentAngle % (2 * Math.PI);
  const targetDelta =
    extraSpins * 2 * Math.PI +
    ((2 * Math.PI - segCenter - Math.PI / 2 - normalizedAngle + 4 * Math.PI) % (2 * Math.PI));
  const duration = 3200 + Math.random() * 800;
  const startAngle = currentAngle;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    currentAngle = startAngle + targetDelta * easeOut(t);
    drawWheel(currentAngle);

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;

     const finalAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
     // Needle is fixed at 12 o'clock.
     // currentAngle already starts at -Math.PI/2,
     // so compensate only once for the draw offset.
     const pointerAngle = (Math.PI * 1.5 - finalAngle + 2 * Math.PI) % (2 * Math.PI);

const landed = Math.floor(pointerAngle / ARC) % N;

      lastSeg = SEGMENTS[landed];
      fetchJoke(lastSeg);

      jokeCount++;
      if (jokeCount >= 3) { /* /* window.VatsalLolGameComplete?.() */; */ }
    }
  }

  requestAnimationFrame(step);
}

// ---------- Fetch joke — mixed strategy ----------
async function fetchJoke(seg) {
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
  setVibeBadge(seg);
  setCardGlow(seg);
  showLoading();

  let jokeText = "";

  try {
    if (seg.id === "dad") {
      jokeText = await fetchDadJoke();
    } else if (seg.id === "dark") {
      jokeText = await fetchDarkJoke();
    } else {
      // wholesome / cursed / roast / genz → instant local pool
      jokeText = getLocalJoke(seg.id);
    }
  } catch (e) {
    jokeText = getLocalJoke(seg.id === "dad" ? "wholesome" : "cursed");
  }

  showJoke(jokeText);
  showActions();
}

// Dad joke — icanhazdadjoke.com
async function fetchDadJoke() {
  const resp = await fetch("https://icanhazdadjoke.com/", {
    headers: { Accept: "application/json" }
  });
  const data = await resp.json();
  return data.joke || getLocalJoke("wholesome");
}

// Dark joke — jokeapi.dev
async function fetchDarkJoke() {
  const resp = await fetch(
    "https://v2.jokeapi.dev/joke/Dark?blacklistFlags=racist,sexist&type=single,twopart"
  );
  const data = await resp.json();
  if (data.error) return getLocalJoke("cursed");
  if (data.type === "single") return data.joke;
  if (data.type === "twopart") return data.setup + " ... " + data.delivery;
  return getLocalJoke("cursed");
}

// ---------- UI helpers ----------
function setVibeBadge(seg) {
  const badge = document.getElementById("vibeBadge");
  badge.textContent = seg.emoji + " " + seg.label;
  badge.className = "vibe-badge " + seg.id;
}

function setCardGlow(seg) {
  document.getElementById("jokeCard").className = "joke-card glow-" + seg.id;
}

function showLoading() {
  const jokeText = document.getElementById("jokeText");
  const loadingRow = document.getElementById("loadingRow");
  jokeText.textContent = "";
  jokeText.className = "joke-text";
  loadingRow.className = "loading-row active";
  loadingRow.setAttribute("aria-hidden", "false");
}

function showJoke(text) {
  const jokeText = document.getElementById("jokeText");
  const loadingRow = document.getElementById("loadingRow");
  loadingRow.className = "loading-row";
  loadingRow.setAttribute("aria-hidden", "true");
  jokeText.textContent = "";
  jokeText.className = "joke-text";
  let i = 0;
  const interval = setInterval(() => {
    jokeText.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}

function resetCard() {
  const jokeText = document.getElementById("jokeText");
  const loadingRow = document.getElementById("loadingRow");
  jokeText.textContent = "";
  jokeText.className = "joke-text muted";
  loadingRow.className = "loading-row";
  document.getElementById("jokeCard").className = "joke-card";
  document.getElementById("vibeBadge").textContent = "";
  document.getElementById("vibeBadge").className = "vibe-badge";
}

function showActions() {
  document.getElementById("actionRow").className = "action-row visible";
}

function hideActions() {
  document.getElementById("actionRow").className = "action-row";
}

// ---------- Button wiring ----------
document.getElementById("spinBtn").addEventListener("click", spin);
document.getElementById("anotherBtn").addEventListener("click", () => { if (lastSeg) fetchJoke(lastSeg); });
document.getElementById("respinBtn").addEventListener("click", spin);

// ---------- Keyboard ----------
document.addEventListener("keydown", e => {
  if ((e.key === " " || e.key === "Enter") &&
      (document.activeElement === document.body || document.activeElement === document.getElementById("spinBtn"))) {
    e.preventDefault();
    spin();
  }
});

// ---------- Init ----------
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
/* window.VatsalLolGameComplete call removed */