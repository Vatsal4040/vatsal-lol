import * as THREE from 'three';

/**
 * Checks whether the current browser / device supports WebGL 1 or 2.
 */
export function isWebGLSupported(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    (gl as WebGLRenderingContext)
      .getExtension('WEBGL_lose_context')
      ?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect software WebGL renderers (SwiftShader, llvmpipe, etc.) from GPU string.
 * Used strictly for rendering cost tuning (pixel ratio, antialiasing, shadows).
 */
export const isSoftwareGl: boolean = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Detects handheld mobile & tablet devices (Android, iOS, touch tablets, and mobile emulators).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const uaMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      ua
    );
  const touch = isTouchDevice();
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  return uaMobile || (touch && minDim <= 1024);
}

/**
 * Returns true when running on a mobile/handheld device held vertically (portrait).
 */
export function isMobilePortrait(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isMobileDevice()) return false;
  return window.innerHeight > window.innerWidth;
}

interface LockableOrientation {
  lock?: (orientation: 'landscape') => Promise<void>;
}

export function canLockLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  const orientation = window.screen?.orientation as
    | LockableOrientation
    | undefined;
  return typeof orientation?.lock === 'function';
}

/**
 * Safely attempts to lock mobile browsers into landscape orientation.
 * Optionally enters fullscreen first when triggered by a user gesture (required by Android Chrome).
 */
export async function tryLockLandscape(
  requestFullscreen = false
): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    if (
      requestFullscreen &&
      !document.fullscreenElement &&
      typeof document.documentElement.requestFullscreen === 'function'
    ) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen may be blocked inside iframes or unsupported on iOS Safari
  }

  try {
    const orientation = window.screen?.orientation as
      | LockableOrientation
      | undefined;
    if (orientation && typeof orientation.lock === 'function') {
      await orientation.lock('landscape');
      return true;
    }
  } catch {
    // Orientation lock is unsupported or requires native rotation (e.g. iOS Safari)
  }
  return false;
}

/** Deterministic PRNG for procedural low-poly planets & textures */
export function createSeededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Simple 3D trigonometric value noise for continent & terrain sculpting */
export function fbm3D(x: number, y: number, z: number, seed = 1): number {
  let value = 0;
  let amp = 0.52;
  let freq = 1.45;
  for (let i = 0; i < 4; i++) {
    const n =
      Math.sin(x * freq + seed * 1.7) *
        Math.cos(y * freq * 1.13 + seed * 2.3) +
      Math.sin(z * freq * 1.27 - seed * 0.9) *
        Math.cos((x + z) * freq * 0.71 + y * freq * 0.85);
    value += n * 0.5 * amp;
    freq *= 2.05;
    amp *= 0.48;
  }
  return value;
}

/**
 * Generates crisp procedural albedo CanvasTextures for gas giants, ice giants,
 * rocky planets, natural moons (Europa, Titan), and Pluto's iconic heart.
 * Zero external image dependencies.
 */
export function createPlanetTexture(
  id: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(
    id.split('').reduce((acc, c) => acc + c.charCodeAt(0) * 31, 13)
  );

  if (id === 'jupiter') {
    const bands = [
      '#E8D3B0',
      '#C87D4B',
      '#F5E6CC',
      '#B45F36',
      '#E2B480',
      '#F8EDE0',
      '#C46A3B',
      '#D6A068',
      '#F3DFC1',
      '#B5623A',
      '#E6C89F',
    ];
    for (let y = 0; y < height; y++) {
      const t = (y / height) * (bands.length - 1);
      const idx = Math.floor(t);
      const frac = t - idx;
      const c1 = new THREE.Color(bands[idx]);
      const c2 = new THREE.Color(bands[Math.min(idx + 1, bands.length - 1)]);
      c1.lerp(c2, frac);
      ctx.fillStyle = `#${c1.getHexString()}`;
      ctx.fillRect(0, y, width, 1);
    }
    for (let i = 0; i < 65; i++) {
      const y = rand() * height;
      const h = 3 + rand() * 8;
      ctx.fillStyle =
        rand() > 0.5 ? 'rgba(255,248,235,0.22)' : 'rgba(155,72,34,0.22)';
      ctx.beginPath();
      ctx.ellipse(
        rand() * width,
        y,
        40 + rand() * 90,
        h,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Great Red Spot
    const spotX = width * 0.62;
    const spotY = height * 0.62;
    const grad = ctx.createRadialGradient(spotX, spotY, 4, spotX, spotY, 34);
    grad.addColorStop(0, '#EA580C');
    grad.addColorStop(0.55, '#C2410C');
    grad.addColorStop(0.85, '#F59E0B');
    grad.addColorStop(1, 'rgba(234,88,12,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, 36, 22, 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'saturn') {
    const bands = [
      '#D6B982',
      '#F4E3B2',
      '#E4C684',
      '#FBF0CE',
      '#D9B46B',
      '#F3DFAB',
      '#C8A35E',
      '#EAD29A',
    ];
    for (let y = 0; y < height; y++) {
      const t = (y / height) * (bands.length - 1);
      const idx = Math.floor(t);
      const frac = t - idx;
      const c1 = new THREE.Color(bands[idx]);
      const c2 = new THREE.Color(bands[Math.min(idx + 1, bands.length - 1)]);
      c1.lerp(c2, frac);
      ctx.fillStyle = `#${c1.getHexString()}`;
      ctx.fillRect(0, y, width, 1);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(255, 250, 230, 0.16)';
      ctx.fillRect(0, rand() * height, width, 2 + rand() * 5);
    }
  } else if (id === 'venus') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#FDE68A');
    grad.addColorStop(0.35, '#F5B952');
    grad.addColorStop(0.55, '#E39733');
    grad.addColorStop(0.8, '#F6C86E');
    grad.addColorStop(1, '#FEF3C7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle =
        rand() > 0.4 ? 'rgba(255,247,214,0.28)' : 'rgba(180,98,20,0.2)';
      ctx.beginPath();
      ctx.ellipse(
        rand() * width,
        rand() * height,
        55 + rand() * 90,
        8 + rand() * 14,
        (rand() - 0.5) * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  } else if (id === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#A5F3FC');
    grad.addColorStop(0.4, '#67E8F9');
    grad.addColorStop(0.7, '#38D6EC');
    grad.addColorStop(1, '#CFFAFE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.fillRect(0, rand() * height, width, 4 + rand() * 9);
    }
  } else if (id === 'neptune') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#60A5FA');
    grad.addColorStop(0.3, '#2563EB');
    grad.addColorStop(0.6, '#1D4ED8');
    grad.addColorStop(0.85, '#3B82F6');
    grad.addColorStop(1, '#93C5FD');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 55; i++) {
      ctx.fillStyle =
        rand() > 0.5 ? 'rgba(125,211,252,0.28)' : 'rgba(15,23,90,0.28)';
      ctx.beginPath();
      ctx.ellipse(
        rand() * width,
        rand() * height,
        35 + rand() * 80,
        4 + rand() * 8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(15, 23, 85, 0.55)';
    ctx.beginPath();
    ctx.ellipse(width * 0.45, height * 0.58, 28, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'pluto') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#E7D4C0');
    grad.addColorStop(0.4, '#C59A78');
    grad.addColorStop(0.75, '#8F5B42');
    grad.addColorStop(1, '#DFCBB8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle =
        rand() > 0.5 ? 'rgba(120,62,40,0.32)' : 'rgba(248,236,220,0.24)';
      ctx.beginPath();
      ctx.arc(rand() * width, rand() * height, 8 + rand() * 24, 0, Math.PI * 2);
      ctx.fill();
    }
    const hx = width * 0.52;
    const hy = height * 0.52;
    ctx.fillStyle = '#F8F1E7';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 28);
    ctx.bezierCurveTo(hx - 40, hy + 4, hx - 42, hy - 28, hx - 16, hy - 28);
    ctx.bezierCurveTo(hx - 4, hy - 28, hx, hy - 14, hx, hy - 10);
    ctx.bezierCurveTo(hx, hy - 14, hx + 4, hy - 28, hx + 16, hy - 28);
    ctx.bezierCurveTo(hx + 42, hy - 28, hx + 40, hy + 4, hx, hy + 28);
    ctx.fill();
  } else if (id === 'europa') {
    // Gleaming icy crust crisscrossed by reddish-brown mineral lineae cracks
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(0.5, '#DBEAFE');
    grad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 38; i++) {
      ctx.strokeStyle =
        i % 3 === 0 ? 'rgba(180, 83, 9, 0.55)' : 'rgba(146, 64, 14, 0.35)';
      ctx.lineWidth = 1 + rand() * 2.4;
      ctx.beginPath();
      const x1 = rand() * width;
      const y1 = rand() * height;
      const cx = x1 + (rand() - 0.5) * 200;
      const cy = y1 + (rand() - 0.5) * 120;
      const x2 = x1 + (rand() - 0.5) * 300;
      const y2 = y1 + (rand() - 0.5) * 160;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.stroke();
    }
  } else if (id === 'titan') {
    // Rich golden-amber organic methane haze bands
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#D97706');
    grad.addColorStop(0.25, '#F59E0B');
    grad.addColorStop(0.55, '#FBBF24');
    grad.addColorStop(0.8, '#D97706');
    grad.addColorStop(1, '#B45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 36; i++) {
      ctx.fillStyle =
        rand() > 0.5 ? 'rgba(254, 243, 199, 0.2)' : 'rgba(146, 64, 14, 0.2)';
      ctx.fillRect(0, rand() * height, width, 4 + rand() * 10);
    }
  } else if (id === 'mercury' || id === 'moon') {
    const base = id === 'moon' ? '#CBD5E1' : '#9CA3AF';
    const dark = id === 'moon' ? '#94A3B8' : '#6B7280';
    const light = id === 'moon' ? '#F1F5F9' : '#D1D5DB';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = dark;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(
        rand() * width,
        rand() * height,
        24 + rand() * 48,
        18 + rand() * 34,
        rand() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 55; i++) {
      const cx = rand() * width;
      const cy = rand() * height;
      const r = 4 + rand() * 14;
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(cx + 0.8, cy + 0.8, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, 0, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.min(maxAnisotropy, 8);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates radial ring texture for Saturn & Uranus with Cassini division gap.
 */
export function createRingTexture(variant: 'saturn' | 'uranus'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  if (variant === 'saturn') {
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0.0, 'rgba(217, 180, 120, 0.0)');
    grad.addColorStop(0.08, 'rgba(217, 180, 120, 0.45)');
    grad.addColorStop(0.22, 'rgba(253, 230, 170, 0.92)');
    grad.addColorStop(0.45, 'rgba(244, 212, 145, 0.85)');
    grad.addColorStop(0.57, 'rgba(180, 140, 88, 0.72)');
    grad.addColorStop(0.61, 'rgba(20, 20, 35, 0.08)');
    grad.addColorStop(0.66, 'rgba(20, 20, 35, 0.08)');
    grad.addColorStop(0.71, 'rgba(250, 224, 165, 0.82)');
    grad.addColorStop(0.88, 'rgba(235, 198, 130, 0.65)');
    grad.addColorStop(0.96, 'rgba(215, 180, 120, 0.2)');
    grad.addColorStop(1.0, 'rgba(215, 180, 120, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 16);

    for (let x = 16; x < size - 8; x += 4) {
      if (x > size * 0.6 && x < size * 0.67) continue;
      ctx.fillStyle =
        x % 8 === 0 ? 'rgba(255, 252, 235, 0.25)' : 'rgba(120, 82, 42, 0.16)';
      ctx.fillRect(x, 0, 1.5, 16);
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0.0, 'rgba(165, 243, 252, 0)');
    grad.addColorStop(0.25, 'rgba(165, 243, 252, 0.42)');
    grad.addColorStop(0.55, 'rgba(207, 250, 254, 0.15)');
    grad.addColorStop(0.78, 'rgba(125, 211, 252, 0.48)');
    grad.addColorStop(1.0, 'rgba(165, 243, 252, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 16);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Soft radial sprite texture for glowing stars, sun corona, and deep-space nebulae.
 */
export function createSoftGlowTexture(
  innerColor: string,
  midColor: string,
  outerColor = 'rgba(0,0,0,0)'
): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
