/**
 * STICK FIGHTER - Playground Core Engine
 * Pure Vanilla JavaScript & HTML5 Canvas
 */

(function () {
  'use strict';

  // --- Canvas Setup ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let viewportWidth = 1280;
  let viewportHeight = 720;
  let scaleRatio = 1;

  function resizeCanvas() {
    canvas.width = window.innerWidth || document.documentElement.clientWidth;
    canvas.height = window.innerHeight || document.documentElement.clientHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- Web Audio Synthesizer ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  const soundBtn = document.getElementById('soundToggleBtn');
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) initAudio();
  });

  function playSound(type) {
    if (!soundEnabled || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;

      if (type === 'slash') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'heavy') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'magic') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.22);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'pan') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'clash') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1200, now);
        osc2.frequency.setValueAtTime(1600, now);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.18);
        osc2.stop(now + 0.18);
      } else if (type === 'hit') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'jump') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'win') {
        const now2 = now;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now2 + i * 0.08);
          gain.gain.setValueAtTime(0.2, now2 + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now2 + i * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now2 + i * 0.08);
          osc.stop(now2 + i * 0.08 + 0.25);
        });
      }
    } catch (e) {
      // ignore
    }
  }

  // --- 12 WEAPONS DATA ---
  const WEAPONS = {
    sword: {
      name: 'SWORD',
      desc: 'Fast • Balanced',
      damage: 15,
      knockback: 12,
      range: 85,
      cooldown: 0.28,
      activeStart: 0.06,
      activeEnd: 0.22,
      hitStop: 3,
      icon: '🗡️'
    },
    axe: {
      name: 'AXE',
      desc: 'Heavy • Powerful',
      damage: 22,
      knockback: 18,
      range: 80,
      cooldown: 0.45,
      activeStart: 0.12,
      activeEnd: 0.32,
      hitStop: 5,
      icon: '🪓'
    },
    boomerang: {
      name: 'BOOMERANG',
      desc: 'Throw • Return',
      damage: 12,
      knockback: 10,
      range: 0, // Projectile item
      cooldown: 0.55,
      activeStart: 0.1,
      activeEnd: 0.3,
      hitStop: 2,
      icon: '🪃'
    },
    shield: {
      name: 'SHIELD',
      desc: 'Block • Bash',
      damage: 10,
      knockback: 22,
      range: 65,
      cooldown: 0.32,
      activeStart: 0.05,
      activeEnd: 0.24,
      hitStop: 4,
      icon: '🛡️'
    },
    bow: {
      name: 'BOW',
      desc: 'Range • Precision',
      damage: 13,
      knockback: 7,
      range: 0, // Ranged
      cooldown: 0.52,
      activeStart: 0.2,
      activeEnd: 0.3,
      hitStop: 2,
      icon: '🏹'
    },
    hammer: {
      name: 'HAMMER',
      desc: 'Slow • Massive',
      damage: 28,
      knockback: 26,
      range: 95,
      cooldown: 0.65,
      activeStart: 0.2,
      activeEnd: 0.42,
      hitStop: 6,
      icon: '🔨'
    },
    gloves: {
      name: 'GLOVES',
      desc: 'Fast • Close',
      damage: 8,
      knockback: 6,
      range: 58,
      cooldown: 0.15,
      activeStart: 0.04,
      activeEnd: 0.12,
      hitStop: 2,
      icon: '🥊'
    },
    wand: {
      name: 'WAND',
      desc: 'Magic • Range',
      damage: 14,
      knockback: 11,
      range: 0, // Magic Orb Projectile
      cooldown: 0.42,
      activeStart: 0.1,
      activeEnd: 0.25,
      hitStop: 3,
      icon: '🪄'
    },
    yoyo: {
      name: 'YO-YO',
      desc: 'Return • Trick',
      damage: 15,
      knockback: 12,
      range: 140, // Extendable yo-yo line
      cooldown: 0.35,
      activeStart: 0.05,
      activeEnd: 0.28,
      hitStop: 3,
      icon: '🪀'
    },
    pan: {
      name: 'PAN',
      desc: 'Funny • Heavy',
      damage: 18,
      knockback: 28,
      range: 75,
      cooldown: 0.42,
      activeStart: 0.1,
      activeEnd: 0.28,
      hitStop: 5,
      icon: '🍳'
    },
    broom: {
      name: 'BROOM',
      desc: 'Wide • Sweep',
      damage: 12,
      knockback: 15,
      range: 110,
      cooldown: 0.38,
      activeStart: 0.08,
      activeEnd: 0.3,
      hitStop: 3,
      icon: '🧹'
    },
    chair: {
      name: 'CHAIR',
      desc: 'Heavy • Chaos',
      damage: 24,
      knockback: 22,
      range: 85,
      cooldown: 0.55,
      activeStart: 0.15,
      activeEnd: 0.38,
      hitStop: 5,
      icon: '🪑'
    }
  };

  // --- 8 ARENAS DATA ---
  const ARENAS = {
    flat: {
      id: 'flat',
      name: 'FLAT ARENA',
      minX: 40,
      maxX: 1240,
      platforms: [
        { x1: 80, x2: 1200, y: 560 }
      ]
    },
    staircase: {
      id: 'staircase',
      name: 'STAIRCASE ARENA',
      minX: 40,
      maxX: 1240,
      steps: [
        { x1: 40, x2: 260, y: 620 },
        { x1: 260, x2: 480, y: 520 },
        { x1: 480, x2: 800, y: 400 },
        { x1: 800, x2: 1020, y: 520 },
        { x1: 1020, x2: 1240, y: 620 }
      ]
    },
    slope: {
      id: 'slope',
      name: 'SLOPE ARENA',
      minX: 40,
      maxX: 1240,
      slope: {
        leftFlat: { x1: 0, x2: 120, y: 640 },
        start: { x: 120, y: 640 },
        end: { x: 1160, y: 360 },
        rightFlat: { x1: 1160, x2: 1280, y: 360 }
      },
      platforms: []
    },
    split: {
      id: 'split',
      name: 'SPLIT PLATFORM',
      minX: 40,
      maxX: 1240,
      platforms: [
        { x1: 60, x2: 540, y: 460 },
        { x1: 740, x2: 1220, y: 460 },
        { x1: 480, x2: 800, y: 640 } // Lower recovery area
      ]
    },
    tower: {
      id: 'tower',
      name: 'TOWER ARENA',
      minX: 40,
      maxX: 1240,
      platforms: [
        { x1: 120, x2: 1160, y: 620 },
        { x1: 180, x2: 560, y: 480 },
        { x1: 720, x2: 1100, y: 480 },
        { x1: 440, x2: 840, y: 340 }
      ]
    },
    valley: {
      id: 'valley',
      name: 'VALLEY ARENA',
      minX: 40,
      maxX: 1240,
      valleyPoly: [
        { x: 0, y: 420 },
        { x: 260, y: 420 },
        { x: 460, y: 620 },
        { x: 820, y: 620 },
        { x: 1020, y: 420 },
        { x: 1280, y: 420 }
      ],
      platforms: []
    },
    zigzag: {
      id: 'zigzag',
      name: 'ZIGZAG ARENA',
      minX: 40,
      maxX: 1240,
      platforms: [
        { x1: 60, x2: 420, y: 620 },
        { x1: 360, x2: 780, y: 500 },
        { x1: 500, x2: 920, y: 380 },
        { x1: 860, x2: 1220, y: 260 },
        { x1: 0, x2: 1280, y: 680 } // Ground recovery
      ]
    },
    smallbox: {
      id: 'smallbox',
      name: 'SMALL BOX',
      minX: 340,
      maxX: 940,
      walls: { left: 340, right: 940 },
      platforms: [
        { x1: 340, x2: 940, y: 560 }
      ]
    }
  };

  // --- GAME STATE ---
  let gameState = 'MENU'; // 'MENU', 'FIGHT', 'END'
  let selectedWeaponKey = 'sword';
  let selectedArenaKey = 'flat';
  let currentArena = ARENAS.flat;
  let matchTimer = 30.0;
  let hitStopFrames = 0;
  let screenShake = 0;

  // Key tracking
  const keys = {
    left: false,
    right: false,
    jump: false,
    attack: false,
    special: false
  };

  // Input Listeners
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.jump = true;
    if (e.code === 'KeyJ') keys.attack = true;
    if (e.code === 'KeyK') keys.special = true;
    initAudio();
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.jump = false;
    if (e.code === 'KeyJ') keys.attack = false;
    if (e.code === 'KeyK') keys.special = false;
  });

  // Touch Controls Setup
  function bindTouchBtn(id, keyProp) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const startHandler = (e) => {
      e.preventDefault();
      keys[keyProp] = true;
      initAudio();
    };
    const endHandler = (e) => {
      e.preventDefault();
      keys[keyProp] = false;
    };
    btn.addEventListener('touchstart', startHandler);
    btn.addEventListener('touchend', endHandler);
    btn.addEventListener('mousedown', startHandler);
    btn.addEventListener('mouseup', endHandler);
  }

  bindTouchBtn('btnLeft', 'left');
  bindTouchBtn('btnRight', 'right');
  bindTouchBtn('btnJump', 'jump');
  bindTouchBtn('btnAttack', 'attack');

  // --- FIGHTER CREATION ---
  function createFighter(isBot, startX) {
    return {
      isBot: isBot,
      x: startX,
      y: 350,
      vx: 0,
      vy: 0,
      width: 32,
      height: 72,
      facing: isBot ? -1 : 1, // 1 = right, -1 = left
      hp: 100,
      maxHp: 100,
      grounded: false,
      weapon: WEAPONS[selectedWeaponKey],
      attackTimer: 0,
      attackCooldown: 0,
      hasHitOpponent: false,
      hurtTimer: 0,
      animTime: 0,
      color: isBot ? '#ef4444' : '#ffffff',

      // AI specific props
      aiTimer: 0,
      aiState: 'APPROACH'
    };
  }

  let player = createFighter(false, 320);
  let bot = createFighter(true, 960);

  // Particles & Projectiles
  let particles = [];
  let projectiles = [];

  function spawnParticles(x, y, count, color, type = 'spark') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'clash' ? 4 + Math.random() * 10 : 2 + Math.random() * 6;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: type === 'clash' ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
        color: color || '#ffffff',
        life: 1.0,
        decay: 0.02 + Math.random() * 0.04,
        type: type
      });
    }
  }

  function spawnDamageNumber(x, y, text, color = '#ffffff') {
    particles.push({
      x: x + (Math.random() * 20 - 10),
      y: y - 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2.5,
      text: text,
      color: color,
      life: 1.0,
      decay: 0.02,
      type: 'text'
    });
  }

  // --- ARENA GEOMETRY SURFACES & COLLISION ---
  function getArenaSurfaceY(x, currentY, vy) {
    if (currentArena.id === 'staircase') {
      if (x < 260) return 620;
      if (x >= 260 && x < 480) return 520;
      if (x >= 480 && x <= 800) return 400;
      if (x > 800 && x <= 1020) return 520;
      return 620;
    }

    if (currentArena.id === 'slope') {
      const sl = currentArena.slope;
      if (x <= sl.start.x) return sl.leftFlat.y;
      if (x >= sl.end.x) return sl.rightFlat.y;
      const ratio = (x - sl.start.x) / (sl.end.x - sl.start.x);
      return sl.start.y + ratio * (sl.end.y - sl.start.y);
    }

    if (currentArena.id === 'valley') {
      const vp = currentArena.valleyPoly;
      if (x <= vp[1].x) return vp[0].y;
      if (x >= vp[4].x) return vp[5].y;
      if (x > vp[1].x && x <= vp[2].x) {
        const ratio = (x - vp[1].x) / (vp[2].x - vp[1].x);
        return vp[1].y + ratio * (vp[2].y - vp[1].y);
      }
      if (x > vp[2].x && x <= vp[3].x) {
        return vp[2].y;
      }
      if (x > vp[3].x && x <= vp[4].x) {
        return vp[3].y + ((x - vp[3].x) / (vp[4].x - vp[3].x)) * (vp[4].y - vp[3].y);
      }
    }

    // Platform based arenas (flat, split, tower, zigzag, smallbox)
    let bestPlatformY = 660; // default floor
    if (currentArena.platforms) {
      for (let p of currentArena.platforms) {
        if (x >= p.x1 - 10 && x <= p.x2 + 10) {
          if (currentY <= p.y + 16) {
            if (p.y < bestPlatformY) {
              bestPlatformY = p.y;
            }
          }
        }
      }
    }
    return bestPlatformY;
  }

  // --- WEAPON HITBOX & CLASH PHYSICS ---
  function getWeaponHitbox(f) {
    if (f.attackTimer <= 0) return null;
    const progress = (f.weapon.cooldown - f.attackTimer) / f.weapon.cooldown;

    if (progress >= f.weapon.activeStart && progress <= f.weapon.activeEnd) {
      const reach = f.weapon.range;
      if (reach <= 0) return null; // Projectile weapons handle their own hitboxes

      return {
        x: f.facing === 1 ? f.x + 10 : f.x - reach - 10,
        y: f.y - 45,
        width: reach,
        height: 50
      };
    }
    return null;
  }

  function checkHitboxOverlap(a, b) {
    if (!a || !b) return false;
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function checkWeaponClash() {
    const boxP = getWeaponHitbox(player);
    const boxB = getWeaponHitbox(bot);

    if (boxP && boxB && !player.hasHitOpponent && !bot.hasHitOpponent) {
      if (checkHitboxOverlap(boxP, boxB)) {
        player.hasHitOpponent = true;
        bot.hasHitOpponent = true;

        player.vx = -player.facing * 10;
        bot.vx = -bot.facing * 10;

        screenShake = 16;
        hitStopFrames = 5;

        const clashX = (player.x + bot.x) / 2;
        const clashY = player.y - 35;

        spawnParticles(clashX, clashY, 35, '#dc2626', 'clash');
        spawnParticles(clashX, clashY, 25, '#ffffff', 'clash');
        spawnDamageNumber(clashX, clashY - 20, 'CLASH!', '#ef4444');

        playSound('clash');
      }
    }
  }

  // --- AI BOT LOGIC ---
  function updateBotAI(dt) {
    bot.aiTimer += dt;
    if (bot.aiTimer > 0.16) {
      bot.aiTimer = 0;

      const dx = player.x - bot.x;
      const dy = player.y - bot.y;
      const dist = Math.abs(dx);
      bot.facing = dx > 0 ? 1 : -1;

      const isRanged = ['BOW', 'WAND', 'BOOMERANG'].includes(bot.weapon.name);
      const idealRange = isRanged ? 360 : bot.weapon.range * 0.82;

      if (dist > idealRange + 30) {
        bot.aiState = 'APPROACH';
      } else if (dist < idealRange - 40 && isRanged) {
        bot.aiState = 'RETREAT';
      } else {
        bot.aiState = 'ATTACK';
      }

      // Jump up onto higher platforms, step walls, or dodge attacks
      if (((dy < -30) || (dist > 40 && Math.abs(bot.vx) < 0.3) || player.attackTimer > 0) && Math.random() < 0.6 && bot.grounded) {
        bot.vy = -12.5;
        playSound('jump');
      }
    }

    if (bot.aiState === 'APPROACH') {
      bot.vx += bot.facing * 1.1;
    } else if (bot.aiState === 'RETREAT') {
      bot.vx -= bot.facing * 1.1;
    }

    const dx = player.x - bot.x;
    const dist = Math.abs(dx);
    const attackRange = ['BOW', 'WAND', 'BOOMERANG'].includes(bot.weapon.name) ? 550 : bot.weapon.range + 15;

    if (dist <= attackRange && bot.attackCooldown <= 0) {
      triggerWeaponAttack(bot);
    }
  }

  // --- ATTACK TRIGGER LOGIC ---
  function triggerWeaponAttack(f) {
    if (f.attackCooldown > 0) return;
    f.attackTimer = f.weapon.cooldown;
    f.attackCooldown = f.weapon.cooldown + 0.08;
    f.hasHitOpponent = false;

    const wName = f.weapon.name;

    if (wName === 'BOW') {
      projectiles.push({
        type: 'arrow',
        x: f.x + f.facing * 20,
        y: f.y - 35,
        vx: f.facing * 18,
        vy: -1.5,
        owner: f,
        life: 2.0
      });
      playSound('slash');
    } else if (wName === 'WAND') {
      projectiles.push({
        type: 'orb',
        x: f.x + f.facing * 20,
        y: f.y - 38,
        vx: f.facing * 14,
        vy: 0,
        owner: f,
        life: 2.2
      });
      playSound('magic');
    } else if (wName === 'BOOMERANG') {
      projectiles.push({
        type: 'boomerang',
        x: f.x + f.facing * 20,
        y: f.y - 35,
        vx: f.facing * 16,
        vy: -1,
        owner: f,
        returning: false,
        life: 2.5,
        hasHit: false
      });
      playSound('slash');
    } else if (wName === 'PAN') {
      playSound('pan');
    } else if (['HAMMER', 'AXE', 'CHAIR'].includes(wName)) {
      playSound('heavy');
    } else {
      playSound('slash');
    }
  }

  // --- FIGHTER UPDATE LOGIC ---
  function updateFighter(f, dt) {
    if (f.attackTimer > 0) f.attackTimer -= dt;
    if (f.attackCooldown > 0) f.attackCooldown -= dt;
    if (f.hurtTimer > 0) f.hurtTimer -= dt;

    if (!f.isBot) {
      if (keys.left) {
        f.vx -= 1.3;
        f.facing = -1;
      }
      if (keys.right) {
        f.vx += 1.3;
        f.facing = 1;
      }
      if ((keys.jump) && f.grounded) {
        f.vy = -13.0;
        f.grounded = false;
        playSound('jump');
      }
      if ((keys.attack || keys.special) && f.attackCooldown <= 0) {
        triggerWeaponAttack(f);
      }
    } else {
      updateBotAI(dt);
    }

    f.vx *= 0.84;
    f.vy += 0.68; // Gravity

    if (f.vx > 7) f.vx = 7;
    if (f.vx < -7) f.vx = -7;

    f.x += f.vx;
    f.y += f.vy;

    // Boundaries & Platform Side Walls
    const minX = currentArena.minX || 40;
    const maxX = currentArena.maxX || 1240;
    if (f.x < minX) { f.x = minX; f.vx = 0; }
    if (f.x > maxX) { f.x = maxX; f.vx = 0; }

    if (currentArena.id === 'staircase') {
      // Side wall blocking on staircase steps to prevent walking inside step faces
      if (f.y > 520) {
        if (f.x > 260 && f.x < 480) { f.x = f.vx > 0 ? 260 : 480; f.vx = 0; }
        else if (f.x > 800 && f.x < 1020) { f.x = f.vx > 0 ? 800 : 1020; f.vx = 0; }
      }
      if (f.y > 400 && f.x >= 480 && f.x <= 800) {
        if (f.x < 500 && f.vx > 0) { f.x = 260; f.vx = 0; }
        if (f.x > 780 && f.vx < 0) { f.x = 1020; f.vx = 0; }
      }
    } else if (currentArena.id === 'smallbox') {
      if (f.x < currentArena.walls.left) { f.x = currentArena.walls.left; f.vx = 0; }
      if (f.x > currentArena.walls.right) { f.x = currentArena.walls.right; f.vx = 0; }
    }

    // Platform surface landing
    const targetGroundY = getArenaSurfaceY(f.x, f.y, f.vy);
    if (f.y >= targetGroundY) {
      f.y = targetGroundY;
      f.vy = 0;
      f.grounded = true;
    } else {
      f.grounded = false;
    }

    // Melee Hit detection
    const op = f.isBot ? player : bot;
    const box = getWeaponHitbox(f);

    if (box && !f.hasHitOpponent) {
      const opBox = {
        x: op.x - 18,
        y: op.y - 65,
        width: 36,
        height: 65
      };

      if (checkHitboxOverlap(box, opBox)) {
        f.hasHitOpponent = true;

        op.hp = Math.max(0, op.hp - f.weapon.damage);
        op.hurtTimer = 0.3;
        op.vx = f.facing * f.weapon.knockback;
        op.vy = -f.weapon.knockback * 0.38;

        screenShake = f.weapon.knockback * 0.75;
        hitStopFrames = f.weapon.hitStop;

        spawnParticles(op.x, op.y - 35, 20, f.color, 'spark');
        spawnDamageNumber(op.x, op.y - 50, `-${f.weapon.damage}`, '#ef4444');

        playSound(f.weapon.name === 'PAN' ? 'pan' : 'hit');
        updateHUD();
      }
    }

    f.animTime += dt;
  }

  // --- PROJECTILES & RETURN WEAPONS UPDATE ---
  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.life -= dt;

      if (p.type === 'arrow') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
      } else if (p.type === 'orb') {
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === 'boomerang') {
        if (!p.returning) {
          p.x += p.vx;
          p.vx *= 0.94;
          if (Math.abs(p.vx) < 1.5) {
            p.returning = true;
          }
        } else {
          const dx = p.owner.x - p.x;
          const dy = (p.owner.y - 35) - p.y;
          const angle = Math.atan2(dy, dx);
          p.vx = Math.cos(angle) * 15;
          p.vy = Math.sin(angle) * 15;
          p.x += p.vx;
          p.y += p.vy;

          // Catch boomerang
          if (Math.hypot(dx, dy) < 25) {
            projectiles.splice(i, 1);
            continue;
          }
        }
      }

      const target = p.owner.isBot ? player : bot;
      const targetBox = {
        x: target.x - 18,
        y: target.y - 65,
        width: 36,
        height: 65
      };

      if (
        p.x >= targetBox.x &&
        p.x <= targetBox.x + targetBox.width &&
        p.y >= targetBox.y &&
        p.y <= targetBox.y + targetBox.height &&
        !p.hasHit
      ) {
        target.hp = Math.max(0, target.hp - p.owner.weapon.damage);
        target.hurtTimer = 0.25;
        target.vx = Math.sign(p.vx || 1) * p.owner.weapon.knockback;

        screenShake = 7;
        spawnParticles(p.x, p.y, 14, '#ef4444', 'spark');
        spawnDamageNumber(p.x, p.y - 15, `-${p.owner.weapon.damage}`, '#ef4444');
        playSound('hit');

        if (p.type !== 'boomerang') {
          projectiles.splice(i, 1);
          updateHUD();
          continue;
        } else {
          p.hasHit = true; // Boomerang hits once then continues returning
          p.returning = true;
        }
      }

      const groundY = getArenaSurfaceY(p.x, p.y, p.vy);
      if ((p.y >= groundY && p.type === 'arrow') || p.life <= 0 || p.x < 10 || p.x > 1270) {
        spawnParticles(p.x, Math.min(p.y, groundY), 6, '#a1a1aa', 'spark');
        projectiles.splice(i, 1);
      }
    }
  }

  // --- RENDER ARENA & ENVIRONMENT ---
  function drawArena() {
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, 1280, 720);

    // Subtle Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }

    ctx.fillStyle = '#121218';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;

    if (currentArena.id === 'staircase') {
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(40, 720);
      ctx.lineTo(40, 620);
      ctx.lineTo(260, 620);
      ctx.lineTo(260, 520);
      ctx.lineTo(480, 520);
      ctx.lineTo(480, 400);
      ctx.lineTo(800, 400);
      ctx.lineTo(800, 520);
      ctx.lineTo(1020, 520);
      ctx.lineTo(1020, 620);
      ctx.lineTo(1240, 620);
      ctx.lineTo(1240, 720);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (currentArena.id === 'slope') {
      const sl = currentArena.slope;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, sl.leftFlat.y);
      ctx.lineTo(sl.start.x, sl.start.y);
      ctx.lineTo(sl.end.x, sl.end.y);
      ctx.lineTo(1280, sl.rightFlat.y);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (currentArena.id === 'valley') {
      const vp = currentArena.valleyPoly;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(vp[0].x, vp[0].y);
      for (let i = 1; i < vp.length; i++) {
        ctx.lineTo(vp[i].x, vp[i].y);
      }
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (currentArena.id === 'smallbox') {
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8;

      // Platform floor
      const p = currentArena.platforms[0];
      ctx.fillRect(p.x1, p.y, p.x2 - p.x1, 720 - p.y);
      ctx.strokeRect(p.x1, p.y, p.x2 - p.x1, 720 - p.y);

      // Side Wall Cage Pillars
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(currentArena.walls.left, p.y);
      ctx.lineTo(currentArena.walls.left, 180);
      ctx.moveTo(currentArena.walls.right, p.y);
      ctx.lineTo(currentArena.walls.right, 180);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // General Platform Array Arenas (flat, split, tower, zigzag)
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8;

      for (let p of currentArena.platforms) {
        const isGroundFloor = p.y >= 600;
        const thickness = isGroundFloor ? (720 - p.y) : 20;
        ctx.fillRect(p.x1, p.y, p.x2 - p.x1, thickness);
        ctx.strokeRect(p.x1, p.y, p.x2 - p.x1, thickness);
      }
      ctx.shadowBlur = 0;
    }
  }

  // --- DRAW STICKMAN CHARACTER & WEAPONS ---
  function drawStickman(f) {
    ctx.save();
    ctx.translate(f.x, f.y);

    const color = f.color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (f.hurtTimer > 0) {
      ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      ctx.strokeStyle = '#ef4444';
    }

    const facing = f.facing;
    const isAttacking = f.attackTimer > 0;
    const attackProgress = isAttacking ? (f.weapon.cooldown - f.attackTimer) / f.weapon.cooldown : 0;

    const headRadius = 14;
    const headY = -52;
    const neckY = -38;
    const pelvisY = -18;

    let legAngle = Math.sin(f.animTime * 12) * Math.min(Math.abs(f.vx) * 0.15, 0.8);
    if (!f.grounded) legAngle = 0.5;

    const leftFootX = -10 + Math.sin(legAngle) * 12;
    const leftFootY = 0;
    const rightFootX = 10 - Math.sin(legAngle) * 12;
    const rightFootY = 0;

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(0, neckY);
    ctx.lineTo(0, pelvisY);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#050507';
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = color;
    if (f.hurtTimer > 0) {
      ctx.beginPath();
      ctx.moveTo(facing * 4 - 3, headY - 3);
      ctx.lineTo(facing * 4 + 3, headY + 3);
      ctx.moveTo(facing * 4 + 3, headY - 3);
      ctx.lineTo(facing * 4 - 3, headY + 3);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(facing * 5, headY - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    let handX = facing * 18;
    let handY = neckY + 10;
    let weaponAngle = facing === 1 ? 0.2 : Math.PI - 0.2;

    const wName = f.weapon.name;

    if (isAttacking) {
      if (['SWORD', 'PAN', 'BROOM'].includes(wName)) {
        const sweep = attackProgress * Math.PI * 1.4;
        weaponAngle = facing === 1 ? -Math.PI * 0.4 + sweep : Math.PI * 1.4 - sweep;
      } else if (['HAMMER', 'AXE', 'CHAIR'].includes(wName)) {
        const slam = Math.sin(attackProgress * Math.PI) * Math.PI * 0.9;
        weaponAngle = facing === 1 ? -Math.PI * 0.5 + slam : Math.PI * 1.5 - slam;
      } else if (wName === 'SHIELD') {
        handX += facing * Math.sin(attackProgress * Math.PI) * 25;
      } else if (wName === 'GLOVES') {
        handX += facing * Math.sin(attackProgress * Math.PI * 3) * 22;
      } else if (wName === 'YO-YO') {
        handX += facing * Math.sin(attackProgress * Math.PI) * 100;
      }
    }

    // Arm
    ctx.beginPath();
    ctx.moveTo(0, neckY + 4);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Render weapon graphics
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(weaponAngle);

    drawWeaponGraphic(f.weapon, facing, isAttacking, attackProgress);

    ctx.restore();
    ctx.restore();
  }

  function drawWeaponGraphic(weapon, facing, isAttacking, attackProgress) {
    ctx.lineWidth = 3;
    const wName = weapon.name;

    if (wName === 'SWORD') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(55, 0);
      ctx.stroke();
      ctx.fillRect(8, -6, 4, 12);
    } else if (wName === 'AXE') {
      ctx.strokeStyle = '#a1a1aa';
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(42, -8, 16, 0, Math.PI * 0.8);
      ctx.fill();
      ctx.stroke();
    } else if (wName === 'BOOMERANG') {
      ctx.strokeStyle = '#dc2626';
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 14);
      ctx.stroke();
    } else if (wName === 'SHIELD') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(10, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(6, -14, 8, 28);
    } else if (wName === 'BOW') {
      ctx.strokeStyle = '#a1a1aa';
      ctx.beginPath();
      ctx.arc(0, 0, 24, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(14, -20);
      ctx.lineTo(14, 20);
      ctx.stroke();
    } else if (wName === 'HAMMER') {
      ctx.strokeStyle = '#71717a';
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 0);
      ctx.stroke();
      ctx.fillRect(40, -16, 22, 32);
      ctx.strokeRect(40, -16, 22, 32);
    } else if (wName === 'GLOVES') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(12, 0, 11, 0, Math.PI * 2);
      ctx.fill();
    } else if (wName === 'WAND') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(42, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (wName === 'YO-YO') {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(12, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (wName === 'PAN') {
      ctx.strokeStyle = '#a1a1aa';
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(42, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (wName === 'BROOM') {
      ctx.strokeStyle = '#a1a1aa';
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(55, 0);
      ctx.stroke();
      ctx.fillRect(52, -12, 18, 24);
    } else if (wName === 'CHAIR') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, -18, 24, 24);
      ctx.beginPath();
      ctx.moveTo(10, 6);
      ctx.lineTo(10, 20);
      ctx.moveTo(34, 6);
      ctx.lineTo(34, 20);
      ctx.stroke();
    }
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;

      if (p.type === 'text') {
        ctx.font = '900 18px monospace';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawProjectiles() {
    for (let p of projectiles) {
      ctx.save();
      if (p.type === 'arrow') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
        ctx.stroke();
      } else if (p.type === 'orb') {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'boomerang') {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 20);
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(12, 0);
        ctx.lineTo(-10, 10);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // --- HUD UPDATES ---
  function updateHUD() {
    const pPct = Math.max(0, (player.hp / player.maxHp) * 100);
    const bPct = Math.max(0, (bot.hp / bot.maxHp) * 100);

    document.getElementById('playerHpFill').style.width = `${pPct}%`;
    document.getElementById('playerHpDamage').style.width = `${pPct}%`;
    document.getElementById('playerHpText').textContent = `${Math.ceil(player.hp)} / 100`;

    document.getElementById('botHpFill').style.width = `${bPct}%`;
    document.getElementById('botHpDamage').style.width = `${bPct}%`;
    document.getElementById('botHpText').textContent = `${Math.ceil(bot.hp)} / 100`;

    const seconds = Math.max(0, Math.ceil(matchTimer));
    const timerText = document.getElementById('timerText');
    timerText.textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`;

    if (seconds <= 5) {
      timerText.classList.add('warning');
    } else {
      timerText.classList.remove('warning');
    }
  }

  // --- MATCH LIFECYCLE ---
  function startMatch() {
    currentArena = ARENAS[selectedArenaKey] || ARENAS.flat;
    document.getElementById('arenaTag').textContent = currentArena.name;

    const startPlayerX = currentArena.id === 'smallbox' ? 420 : 320;
    const startBotX = currentArena.id === 'smallbox' ? 860 : 960;

    player = createFighter(false, startPlayerX);
    bot = createFighter(true, startBotX);

    particles = [];
    projectiles = [];
    matchTimer = 30.0;
    gameState = 'FIGHT';

    document.getElementById('playerWeaponBadge').textContent = player.weapon.name;
    document.getElementById('botWeaponBadge').textContent = bot.weapon.name;

    document.getElementById('hud').classList.add('visible');
    document.getElementById('controlsOverlay').classList.add('visible');
    document.getElementById('setupMenu').classList.remove('active');
    document.getElementById('endScreen').classList.remove('active');

    updateHUD();
  }

  function checkMatchEnd() {
    if (gameState !== 'FIGHT') return;

    let matchOver = false;
    let winnerText = '';
    let winnerClass = '';

    if (player.hp <= 0 || bot.hp <= 0 || matchTimer <= 0) {
      matchOver = true;

      if (player.hp > bot.hp) {
        winnerText = 'PLAYER WINS!';
        winnerClass = 'win';
        playSound('win');
      } else if (bot.hp > player.hp) {
        winnerText = 'BOT WINS!';
        winnerClass = 'lose';
      } else {
        winnerText = 'DRAW!';
        winnerClass = 'draw';
      }
    }

    if (matchOver) {
      gameState = 'END';

      const banner = document.getElementById('resultBanner');
      banner.textContent = winnerText;
      banner.className = `result-banner ${winnerClass}`;

      document.getElementById('finalPlayerHp').textContent = `${Math.ceil(player.hp)} HP`;
      document.getElementById('finalBotHp').textContent = `${Math.ceil(bot.hp)} HP`;
      document.getElementById('finalTimeLeft').textContent = `${Math.ceil(matchTimer)}s`;

      document.getElementById('endScreen').classList.add('active');
    }
  }

  // --- SETUP UI LISTENERS ---
  const weaponCards = document.querySelectorAll('.weapon-card');
  weaponCards.forEach((card) => {
    card.addEventListener('click', () => {
      weaponCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedWeaponKey = card.getAttribute('data-weapon');
    });
  });

  const arenaCards = document.querySelectorAll('.arena-card');
  arenaCards.forEach((card) => {
    card.addEventListener('click', () => {
      arenaCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedArenaKey = card.getAttribute('data-arena');
    });
  });

  // BATTLE button
  document.getElementById('fightBtn').addEventListener('click', () => {
    initAudio();
    startMatch();
  });

  // PLAY AGAIN button (keeps current weapon & arena selections)
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    initAudio();
    startMatch();
  });

  // CHANGE SETUP button (returns to start page setup)
  document.getElementById('changeWeaponBtn').addEventListener('click', () => {
    document.getElementById('endScreen').classList.remove('active');
    document.getElementById('setupMenu').classList.add('active');
    document.getElementById('hud').classList.remove('visible');
    document.getElementById('controlsOverlay').classList.remove('visible');
    gameState = 'MENU';
  });

  // --- MAIN LOOP ---
  let lastTime = performance.now();

  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (hitStopFrames > 0) {
      hitStopFrames--;
      requestAnimationFrame(gameLoop);
      return;
    }

    ctx.save();
    
    // Scale 1280x720 arena coordinate system to fill full viewport screen
    const scaleX = canvas.width / 1280;
    const scaleY = canvas.height / 720;
    ctx.scale(scaleX, scaleY);

    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.translate(shakeX, shakeY);
      screenShake *= 0.85;
      if (screenShake < 0.5) screenShake = 0;
    }

    drawArena();

    if (gameState === 'FIGHT') {
      matchTimer -= dt;

      updateFighter(player, dt);
      updateFighter(bot, dt);
      updateProjectiles(dt);

      checkWeaponClash();
      checkMatchEnd();
      updateHUD();
    }

    drawStickman(player);
    drawStickman(bot);
    drawProjectiles();
    drawParticles();

    ctx.restore();

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
})();
