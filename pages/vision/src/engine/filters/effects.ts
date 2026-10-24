/**
 * Advanced biological vision effects: Thermal IR, UV Highlights, Night Tapetum, Chromatic Aberration & Lateral Blind Spots.
 */

/**
 * Thermal IR Pit Organ simulation for Snake vision:
 * Converts pixel luminance & warm color weight into a vibrant thermal gradient
 * (Black -> Deep Blue -> Purple -> Red -> Orange -> Bright Yellow/White).
 */
export function applyThermalIR(data: Uint8ClampedArray): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Compute luminance & warmth weighting (red/yellow channel dominance = warm body heat)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    const warmth = Math.max(0, (r - b) / 255.0);
    const heat = Math.min(1.0, luminance * 0.6 + warmth * 0.6);

    // Map heat value [0.0 - 1.0] to thermal palette
    let tr = 0, tg = 0, tb = 0;
    if (heat < 0.2) {
      // Dark navy -> Blue
      const t = heat / 0.2;
      tb = 120 * t;
    } else if (heat < 0.4) {
      // Blue -> Purple
      const t = (heat - 0.2) / 0.2;
      tr = 150 * t;
      tb = 120 + 100 * t;
    } else if (heat < 0.7) {
      // Purple -> Red / Orange
      const t = (heat - 0.4) / 0.3;
      tr = 150 + 105 * t;
      tg = 140 * t;
      tb = 220 * (1 - t);
    } else {
      // Orange -> Bright Yellow / White
      const t = (heat - 0.7) / 0.3;
      tr = 255;
      tg = 140 + 115 * t;
      tb = 255 * t;
    }

    data[i]     = Math.min(255, tr);
    data[i + 1] = Math.min(255, tg);
    data[i + 2] = Math.min(255, tb);
  }
}

/**
 * UV Nectar Guide boost for Bee/Tetrachromat vision:
 * Boosts hidden ultraviolet reflectivity in blues, purples, and flower petals.
 */
export function applyUVHighlights(data: Uint8ClampedArray): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // High blue / purple or yellow center gets strong UV fluorescence shift (cyan-magenta glow)
    if (b > 120 || (r > 150 && g > 150)) {
      data[i]     = Math.min(255, r * 0.8 + 80); // Purple shift
      data[i + 1] = Math.min(255, g * 1.2 + 40); // Cyan boost
      data[i + 2] = Math.min(255, b * 1.4 + 60); // UV blue
    }
  }
}

/**
 * Night vision tapetum lucidum amplifier (Cats, Owls, Anglerfish):
 * Amplifies dim photons, adds slight green phosphor or cyan glow bloom and subtle noise.
 */
export function applyNightVisionBoost(data: Uint8ClampedArray, gain: number): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Boost dim areas significantly
    const boosted = Math.pow(lum / 255.0, 0.6) * 255.0 * (1.0 + gain);

    // Muted phosphor night vision spectrum
    data[i]     = Math.min(255, boosted * 0.4);
    data[i + 1] = Math.min(255, boosted * 1.15);
    data[i + 2] = Math.min(255, boosted * 0.6);
  }
}

/**
 * Monocular Horse lateral blind spots overlay:
 * Draws blind spot gradients directly in front of forehead and directly behind tail.
 */
export function applyHorseBlindSpots(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  // Central forehead nose blind spot cone
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height);
  ctx.lineTo(width * 0.42, height * 0.65);
  ctx.lineTo(width * 0.58, height * 0.65);
  ctx.closePath();
  ctx.fill();

  // Rear tail blind spot dark bands on edges
  const edgeGradLeft = ctx.createLinearGradient(0, 0, width * 0.08, 0);
  edgeGradLeft.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
  edgeGradLeft.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = edgeGradLeft;
  ctx.fillRect(0, 0, width * 0.08, height);

  const edgeGradRight = ctx.createLinearGradient(width, 0, width * 0.92, 0);
  edgeGradRight.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
  edgeGradRight.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = edgeGradRight;
  ctx.fillRect(width * 0.92, 0, width * 0.08, height);

  ctx.restore();
}

/**
 * Chromatic aberration spectral shift (Mantis Shrimp / compound optics):
 */
export function applyChromaticAberration(imageData: ImageData, shiftPx: number): void {
  if (shiftPx <= 0) return;

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  const shift = Math.round(shiftPx);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Shift red channel left, blue channel right
      const rx = Math.max(0, x - shift);
      const bx = Math.min(width - 1, x + shift);

      const rIdx = (y * width + rx) * 4;
      const bIdx = (y * width + bx) * 4;

      data[idx]     = copy[rIdx];     // Red from left
      data[idx + 2] = copy[bIdx + 2]; // Blue from right
    }
  }
}

/**
 * V2 Beyond Biology: Radio Waves False-Color Spectrum
 */
export function applyRadioWaveSpectrum(data: Uint8ClampedArray): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    let rr = 0, rg = 0, rb = 0;
    if (lum < 0.25) {
      const t = lum / 0.25;
      rg = 60 * t;
      rb = 120 + 80 * t;
    } else if (lum < 0.5) {
      const t = (lum - 0.25) / 0.25;
      rr = 180 * t;
      rg = 60 * (1 - t);
      rb = 200 + 55 * t;
    } else if (lum < 0.8) {
      const t = (lum - 0.5) / 0.3;
      rr = 180 + 75 * t;
      rg = 140 * t;
      rb = 255 * (1 - t);
    } else {
      const t = (lum - 0.8) / 0.2;
      rr = 255;
      rg = 140 + 115 * t;
      rb = 255 * t;
    }

    data[i]     = Math.min(255, rr);
    data[i + 1] = Math.min(255, rg);
    data[i + 2] = Math.min(255, rb);
  }
}

/**
 * V2 Beyond Biology: X-Ray Radiographic Density Filter
 */
export function applyXRayDensity(data: Uint8ClampedArray): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    const radiopaque = Math.pow(1.0 - lum, 1.2);

    data[i]     = Math.min(255, radiopaque * 180 + lum * 40);
    data[i + 1] = Math.min(255, radiopaque * 220 + lum * 60);
    data[i + 2] = Math.min(255, radiopaque * 255 + lum * 80);
  }
}

/**
 * V2 Beyond Biology: UV Solar Spectrum
 */
export function applyUVSpectrum(data: Uint8ClampedArray): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

    data[i]     = Math.min(255, r * 0.4 + b * 0.8 + lum * 60);
    data[i + 1] = Math.min(255, g * 0.2 + lum * 30);
    data[i + 2] = Math.min(255, b * 1.5 + lum * 90);
  }
}

/**
 * V2 Beyond Biology: Polarized Light Birefringence Pattern
 */
export function applyPolarizedLightBirefringence(data: Uint8ClampedArray): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    const angle = (r * 0.01 + g * 0.02 + b * 0.03) % (Math.PI * 2);

    data[i]     = Math.min(255, (Math.sin(angle) * 0.5 + 0.5) * 200 + lum * 55);
    data[i + 1] = Math.min(255, (Math.sin(angle + (2 * Math.PI / 3)) * 0.5 + 0.5) * 200 + lum * 55);
    data[i + 2] = Math.min(255, (Math.sin(angle + (4 * Math.PI / 3)) * 0.5 + 0.5) * 200 + lum * 55);
  }
}
