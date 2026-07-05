'use strict';

// ── AUDIO ──────────────────────────────────────
let audioCtx = null;
let soundOn = true;

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, type, dur, vol) {
  if (!soundOn) return;
  try {
    const ac = ensureAudio();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + dur);
  } catch(e) {}
}

function playPop(kind) {
  // kind: 'normal'|'golden'|'rainbow'
  if (kind === 'rainbow') { playTone(880,'sine',0.14,0.18); playTone(1100,'sine',0.2,0.12); }
  else if (kind === 'golden') { playTone(660,'sine',0.16,0.16); playTone(880,'sine',0.2,0.1); }
  else { playTone(420 + Math.random()*200,'sine',0.1,0.1); }
}

function playBomb() {
  if (!soundOn) return;
  try {
    const ac = ensureAudio();
    const len = ac.sampleRate * 0.28;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1 - i/len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.28, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.28);
    src.connect(g); g.connect(ac.destination); src.start();
  } catch(e) {}
}

function playGameOver() {
  [400,320,250].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.28,0.18),i*140));
}

// ── CANVAS & HUD HEIGHT ────────────────────────
const canvas = document.getElementById('canvas');
const gc = canvas.getContext('2d');
let HUD_H = 64; // updated after first render

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const hud = document.querySelector('.hud');
  if (hud) HUD_H = hud.getBoundingClientRect().bottom;
}
window.addEventListener('resize', () => { resize(); });
resize();

// ── GAME STATE ─────────────────────────────────
let score=0, lives=3, bestScore=0;
let combo=0, comboTO=null;
let rainbowOn=false, rainbowTO=null;
let difficulty=1;
let raf=null, running=false;
let lastTs=0, spawnAcc=0;
let bubbles=[], parts=[], popups=[];

// ── BUBBLE TYPES ───────────────────────────────
const TYPES = [
  { name:'normal',  chance:0.68, pts:1,  minR:22, maxR:38, colors:['#4fc3f7','#29b6f6','#4dd0e1','#80deea','#80cbc4','#4db6ac','#81d4fa','#b3e5fc'] },
  { name:'golden',  chance:0.11, pts:5,  minR:26, maxR:36, colors:['#ffd54f','#ffca28','#ffb300','#ffe082'] },
  { name:'big',     chance:0.07, pts:3,  minR:40, maxR:54, colors:['#ce93d8','#ba68c8','#f48fb1','#ef9a9a'] },
  { name:'rainbow', chance:0.06, pts:3,  minR:26, maxR:34, colors:['rainbow'] },
  { name:'bomb',    chance:0.08, pts:-1, minR:22, maxR:30, colors:['#546e7a','#607d8b'] },
];

function pickType() {
  let r = Math.random(), acc = 0;
  for (const t of TYPES) { acc += t.chance; if (r < acc) return t; }
  return TYPES[0];
}

// ── COLOR HELPERS ──────────────────────────────
function hexToRgb(hex) {
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)] : [128,128,128];
}
function rgbLerp(hex, t) { // lerp toward white
  const [r,g,b] = hexToRgb(hex);
  return `rgb(${Math.round(r+(255-r)*t)},${Math.round(g+(255-g)*t)},${Math.round(b+(255-b)*t)})`;
}
function rgbDarken(hex, f) {
  const [r,g,b] = hexToRgb(hex);
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
}

// ── BUBBLE ─────────────────────────────────────
class Bubble {
  constructor() {
    const td = pickType();
    this.typeName = td.name;
    this.pts = td.pts;
    this.r = td.minR + Math.random()*(td.maxR - td.minR);
    this.x = this.r*1.2 + Math.random()*(canvas.width - this.r*2.4);
    this.y = canvas.height + this.r + 10;
    // start with a gentle upward nudge; buoyancy in update() accelerates it naturally
    this.vy = -(0.1 + Math.random()*0.2);
    this.squish = 1; this.squishY = 1;
    // wobble stored as phase offset, applied as sin — does NOT accumulate x drift
    this.wobPhase = Math.random()*Math.PI*2;
    this.wobSpeed = 0.025 + Math.random()*0.02;
    this.wobAmp   = 0.5 + Math.random()*1.2;
    this.baseX = this.x; // wobble around base
    this.color = td.colors[Math.floor(Math.random()*td.colors.length)];
    this.hue = Math.random()*360;
    this.pulseT = Math.random()*Math.PI*2;
    this.alive = true;
  }

  update() {
    // buoyancy: accelerate upward up to terminal velocity, then drag kicks in
    const terminal = -(1.4 + difficulty * 0.22);
    if (this.vy > terminal) this.vy -= 0.022;
    this.vy *= 0.992; // air drag — floaty, not rocket-like

    // sinusoidal side drift — feels like water
    this.wobPhase += this.wobSpeed;
    this.x = this.baseX + Math.sin(this.wobPhase) * this.wobAmp * 9;
    this.baseX = Math.max(this.r, Math.min(canvas.width - this.r, this.baseX));
    this.y += this.vy;

    // squish as bubble accelerates
    this.squish  = 1 + Math.abs(this.vy) * 0.012;
    this.squishY = 1 / this.squish;

    this.pulseT += 0.04;
    if (this.typeName === 'rainbow') this.hue = (this.hue + 2.5) % 360;
  }

  draw() {
    const pulse = Math.sin(this.pulseT) * 1.2;
    const r = this.r + pulse;
    const sx = this.squish  || 1;
    const sy = this.squishY || 1;
    gc.save();
    gc.translate(this.x, this.y);
    gc.scale(sx, sy);
    gc.translate(-this.x, -this.y);

    if (this.typeName === 'rainbow') {
      const gr = gc.createRadialGradient(this.x-r*0.3,this.y-r*0.3,r*0.05,this.x,this.y,r);
      const h = this.hue;
      gr.addColorStop(0, `hsla(${h},100%,88%,1)`);
      gr.addColorStop(0.5, `hsla(${(h+120)%360},90%,62%,0.92)`);
      gr.addColorStop(1, `hsla(${(h+240)%360},80%,48%,0.85)`);
      gc.shadowColor = `hsl(${h},100%,70%)`; gc.shadowBlur = 18;
      gc.beginPath(); gc.arc(this.x,this.y,r,0,Math.PI*2);
      gc.fillStyle = gr; gc.fill();
      // shine
      gc.shadowBlur = 0;
      this._drawShine(r);

    } else if (this.typeName === 'bomb') {
      gc.shadowColor = 'rgba(239,83,80,0.35)'; gc.shadowBlur = 12;
      gc.beginPath(); gc.arc(this.x,this.y,r,0,Math.PI*2);
      gc.fillStyle = '#37474f'; gc.fill();
      gc.strokeStyle = '#ef5350'; gc.lineWidth = 2.5; gc.stroke();
      gc.shadowBlur = 0;
      // fuse
      gc.beginPath();
      gc.moveTo(this.x, this.y - r);
      gc.quadraticCurveTo(this.x+10, this.y-r-12, this.x+7, this.y-r-20);
      gc.strokeStyle = '#ffca28'; gc.lineWidth = 2.5; gc.stroke();
      gc.font = `${r*0.88}px serif`; gc.textAlign='center'; gc.textBaseline='middle';
      gc.fillText('💣', this.x, this.y+2);

    } else {
      const col = this.color;
      const isGold = this.typeName === 'golden';
      gc.shadowColor = col;
      gc.shadowBlur = isGold ? 20 : 8;
      const gr = gc.createRadialGradient(this.x-r*0.3,this.y-r*0.35,r*0.05,this.x,this.y,r);
      gr.addColorStop(0, rgbLerp(col,0.62));
      gr.addColorStop(0.5, col);
      gr.addColorStop(1, rgbDarken(col,0.65));
      gc.beginPath(); gc.arc(this.x,this.y,r,0,Math.PI*2);
      gc.fillStyle = gr; gc.fill();
      gc.shadowBlur = 0;
      this._drawShine(r);
      // rim
      gc.beginPath(); gc.arc(this.x,this.y,r,0,Math.PI*2);
      gc.strokeStyle = 'rgba(255,255,255,0.22)'; gc.lineWidth = 1.5; gc.stroke();
      // icon
      if (this.typeName === 'golden') {
        gc.font=`${r*0.72}px serif`; gc.textAlign='center'; gc.textBaseline='middle';
        gc.fillStyle='rgba(0,0,0,0.55)'; gc.fillText('⭐',this.x,this.y);
      } else if (this.typeName === 'big') {
        gc.font=`${r*0.58}px serif`; gc.textAlign='center'; gc.textBaseline='middle';
        gc.fillStyle='rgba(255,255,255,0.65)'; gc.fillText('💎',this.x,this.y);
      }
    }
    gc.restore();
  }

  _drawShine(r) {
    const sg = gc.createRadialGradient(this.x-r*0.28,this.y-r*0.38,0,this.x-r*0.15,this.y-r*0.28,r*0.52);
    sg.addColorStop(0,'rgba(255,255,255,0.72)');
    sg.addColorStop(1,'rgba(255,255,255,0)');
    gc.beginPath(); gc.arc(this.x,this.y,r,0,Math.PI*2);
    gc.fillStyle = sg; gc.fill();
  }

  hit(px,py) { return Math.hypot(px-this.x,py-this.y) <= this.r + 8; }
  offScreen() { return this.y < -this.r*2; }
}

// ── PARTICLE ───────────────────────────────────
class Particle {
  constructor(x,y,col) {
    this.x=x; this.y=y; this.col=col;
    const a=Math.random()*Math.PI*2, s=2+Math.random()*6;
    this.vx=Math.cos(a)*s; this.vy=Math.sin(a)*s-1.5;
    this.life=1; this.decay=0.028+Math.random()*0.04;
    this.r=2.5+Math.random()*4.5; this.grav=0.14;
  }
  update() { this.x+=this.vx; this.y+=this.vy; this.vy+=this.grav; this.vx*=0.97; this.life-=this.decay; }
  draw() {
    gc.save(); gc.globalAlpha=Math.max(0,this.life);
    gc.fillStyle=this.col; gc.shadowColor=this.col; gc.shadowBlur=5;
    gc.beginPath(); gc.arc(this.x,this.y,this.r*Math.max(0,this.life),0,Math.PI*2); gc.fill();
    gc.restore();
  }
}

// ── SCORE POPUP ────────────────────────────────
class Popup {
  constructor(x,y,txt,col) { this.x=x; this.y=y; this.txt=txt; this.col=col; this.life=1; this.vy=-1.8; }
  update() { this.y+=this.vy; this.vy*=0.96; this.life-=0.022; }
  draw() {
    gc.save(); gc.globalAlpha=Math.max(0,this.life);
    gc.font=`800 ${19+(1-this.life)*5}px 'Nunito',sans-serif`;
    gc.textAlign='center'; gc.fillStyle=this.col;
    gc.shadowColor=this.col; gc.shadowBlur=8;
    gc.fillText(this.txt,this.x,this.y);
    gc.restore();
  }
}

// ── SPAWN PARTICLES ────────────────────────────
function burst(x,y,col,n) { for(let i=0;i<n;i++) parts.push(new Particle(x,y,col)); }

// ── POP ────────────────────────────────────────
function popBubble(b) {
  b.alive = false;

  if (b.typeName === 'bomb') {
    playBomb();
    bombFlash();
    burst(b.x,b.y,'#ef5350',18);
    popups.push(new Popup(b.x,b.y-b.r-12,'-1 ❤️','#ef5350'));
    shake();
    loseLife();
    combo=0; clearTimeout(comboTO);
    document.getElementById('combo-display').classList.remove('show');
    return;
  }

  let pts = b.pts;
  if (rainbowOn) pts = Math.max(pts*2,1);

  if (b.typeName === 'rainbow') {
    playPop('rainbow');
    burst(b.x,b.y,`hsl(${Math.random()*360},90%,65%)`,22);
    popups.push(new Popup(b.x,b.y-b.r-12,'🌈 RAINBOW!','#ce93d8'));
    activateRainbow();
  } else {
    playPop(b.typeName === 'golden' ? 'golden' : 'normal');
    const pc = b.typeName==='golden'?'#ffd54f': b.typeName==='big'?'#ce93d8': b.color;
    burst(b.x,b.y,pc, b.typeName==='normal'?11:18);
    combo++;
    clearTimeout(comboTO);
    comboTO = setTimeout(()=>{ combo=0; document.getElementById('combo-display').classList.remove('show'); }, 2200);
    if (combo>=2) {
      const cd=document.getElementById('combo-display');
      cd.textContent=`COMBO ×${combo}`; cd.classList.add('show');
    }
    const ptLabel = pts===1?'+1': pts===2?'+2 🔥':`+${pts} 🌟`;
    const ptCol = b.typeName==='golden'?'#ffd54f': b.typeName==='big'?'#ce93d8':'#69f0ae';
    popups.push(new Popup(b.x,b.y-b.r-12,ptLabel,ptCol));
  }

  score += pts;
  updateHUD();
  difficulty = 1 + Math.floor(score/20)*0.28;
}

function loseLife() {
  lives--;
  updateHUD();
  if (lives<=0) endGame();
}

// AFTER
function shake() {
  const c = document.getElementById('canvas');
  c.classList.remove('shake');
  void c.offsetWidth; // force reflow to restart animation
  c.classList.add('shake');
  setTimeout(()=>c.classList.remove('shake'), 220);
}

function activateRainbow() {
  rainbowOn=true;
  document.getElementById('rainbow-banner').classList.add('show');
  clearTimeout(rainbowTO);
  rainbowTO=setTimeout(()=>{
    rainbowOn=false;
    document.getElementById('rainbow-banner').classList.remove('show');
  },5000);
}

function updateHUD() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-best').textContent = Math.max(score,bestScore);
  const hearts = document.querySelectorAll('.heart');
  hearts.forEach((h,i)=>h.classList.toggle('lost',i>=lives));
}

// ── GAME LOOP ──────────────────────────────────
function loop(ts) {
  if (!running) return;
  const dt = Math.min(ts-lastTs, 48);
  lastTs = ts;

  gc.clearRect(0,0,canvas.width,canvas.height);

  // spawn — faster cadence, multiple bubbles per tick at higher difficulty
  spawnAcc += dt;
  const interval = Math.max(420 - difficulty*55, 130);
  while (spawnAcc > interval) {
    bubbles.push(new Bubble());
    // at higher difficulty, occasionally spawn a second bubble at once
    if (difficulty > 2 && Math.random() < 0.3) bubbles.push(new Bubble());
    spawnAcc -= interval;
  }

  // bubbles
  bubbles = bubbles.filter(b=>{
    if (!b.alive) return false;
    b.update(); b.draw();
    return !b.offScreen();
  });

  // particles
  parts = parts.filter(p=>{ p.update(); p.draw(); return p.life>0; });

  // popups
  popups = popups.filter(p=>{ p.update(); p.draw(); return p.life>0; });

  raf = requestAnimationFrame(loop);
}

// ── INPUT ──────────────────────────────────────
function handleInput(e) {
  if (!running) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const pts = e.changedTouches
    ? Array.from(e.changedTouches).map(t=>({x:t.clientX-rect.left, y:t.clientY-rect.top}))
    : [{x:e.clientX-rect.left, y:e.clientY-rect.top}];

  for (const pt of pts) {
    // skip HUD area
    if (pt.y < HUD_H) continue;
    for (let i=bubbles.length-1;i>=0;i--) {
      if (bubbles[i].alive && bubbles[i].hit(pt.x,pt.y)) {
        popBubble(bubbles[i]); break;
      }
    }
  }
}

canvas.addEventListener('touchstart', handleInput, {passive:false});
canvas.addEventListener('mousedown',  handleInput);

// ── START / END ────────────────────────────────
function startGame() {
  score=0; lives=3; combo=0; difficulty=1;
  rainbowOn=false; spawnAcc=0;
  bubbles=[]; parts=[]; popups=[];
  clearTimeout(comboTO); clearTimeout(rainbowTO);
  document.getElementById('rainbow-banner').classList.remove('show');
  document.getElementById('combo-display').classList.remove('show');
  updateHUD();
  if (raf) cancelAnimationFrame(raf);
  running=true;
  lastTs=performance.now();
  raf=requestAnimationFrame(loop);
  bubbles.push(new Bubble());
}

function endGame() {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  playGameOver();



  const newBest = score > bestScore;
  if (newBest) bestScore = score;
  localStorage.setItem('bubblePop_best', bestScore);

  document.getElementById('result-score').textContent = score;
  document.getElementById('result-best').textContent = bestScore;
  document.getElementById('new-best-badge').style.display = newBest ? 'inline-block' : 'none';
  document.getElementById('home-best-val').textContent = bestScore;

  const descs = score < 20 ? ["Keep going! 🫧","Bubbles can be slippery!","You'll do better next time!"]
              : score < 60 ? ["Getting warmer! 🔥","Nice run! Pop faster!","Good start!"]
              : score < 120 ? ["You're on fire! 🎉","Excellent reflexes!","Great popping!"]
              : ["LEGENDARY! 🏆","Bubble Master!","Absolutely incredible!"];
  document.getElementById('result-desc').textContent = descs[Math.floor(Math.random() * descs.length)];
 
  showScreen('result');
  const related = document.querySelector('.vatsal-related');
if (related) {
  document.getElementById('result').appendChild(related);
  related.removeAttribute('hidden');
}
  window.VatsalLolGameComplete?.();
}

// ── SCREENS ────────────────────────────────────
function showScreen(id) {
  ['home','game','result'].forEach(s =>
    document.getElementById(s)
      .classList.toggle('hidden', s !== id)
  );

  if (id === 'game') {
    setTimeout(resize, 50);
  }

  // Scroll to top of result screen so footer is reachable by scrolling down
  if (id === 'result') {
    window.scrollTo(0, 0);
  }
}
// ── BUTTONS ────────────────────────────────────
document.getElementById('btn-play').addEventListener('click',()=>{
  try { ensureAudio(); } catch(e){}
  showScreen('game');
  startGame();
});
document.getElementById('btn-again').addEventListener('click',()=>{
  showScreen('game');
  startGame();
});
document.getElementById('sound-btn').addEventListener('click',()=>{
  soundOn=!soundOn;
  document.getElementById('sound-btn').textContent = soundOn?'🔊':'🔇';
});

// ── INIT ───────────────────────────────────────
bestScore = parseInt(localStorage.getItem('bubblePop_best')||'0')||0;
document.getElementById('home-best-val').textContent = bestScore;
document.getElementById('hud-best').textContent = bestScore;
showScreen('home');

document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
const headerAudioBtn =
document.getElementById('audioToggle');

if(headerAudioBtn){

    headerAudioBtn.addEventListener('click',()=>{

        soundOn=!soundOn;

        headerAudioBtn.textContent =
        soundOn ? '🔊' : '🔇';

        const gameBtn =
        document.getElementById('sound-btn');

        if(gameBtn){

            gameBtn.textContent =
            soundOn ? '🔊' : '🔇';
        }
    });
}
// AFTER
function bombFlash(){
  const f = document.getElementById('bomb-flash');
  if(!f) return;
  f.classList.remove('show');
  void f.offsetWidth;
  f.classList.add('show');
  setTimeout(()=>f.classList.remove('show'), 180);
}