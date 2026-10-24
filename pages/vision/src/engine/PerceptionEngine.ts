import { PerceptionProfile, EnvironmentState } from '../types';
import { PERCEPTION_PROFILES } from '../profiles/perceptionProfiles';
import { applyColorMatrix } from './filters/colorMatrix';
import { applyFastBlur } from './filters/blur';
import { applySharpen } from './filters/sharpen';
import { applyVignette } from './filters/vignette';
import { applyOmmatidiaGrid } from './filters/ommatidia';
import {
  applyThermalIR,
  applyUVHighlights,
  applyNightVisionBoost,
  applyHorseBlindSpots,
  applyChromaticAberration,
  applyRadioWaveSpectrum,
  applyXRayDensity,
  applyUVSpectrum,
  applyPolarizedLightBirefringence
} from './filters/effects';

export class PerceptionEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private sourceImage: HTMLImageElement | HTMLCanvasElement | null = null;
  private activeProfile: PerceptionProfile = PERCEPTION_PROFILES[0]; // Default Human
  private humanProfile: PerceptionProfile = PERCEPTION_PROFILES[0];
  
  private renderMode: 'full' | 'split' = 'split'; // Default comparison slider
  private sliderPosition: number = 0.5; // 0.0 to 1.0 (50% split)
  
  private environment: EnvironmentState = {
    lighting: 'daylight',
    distanceMeters: 10,
    motionSpeed: 0,
    showUVGuides: false
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;

    this.offscreenCanvas = document.createElement('canvas');
    const offCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) throw new Error('Offscreen 2D context unavailable');
    this.offscreenCtx = offCtx;
  }

  public setSource(source: HTMLImageElement | HTMLCanvasElement): void {
    this.sourceImage = source;
    const width = source instanceof HTMLImageElement ? source.naturalWidth || source.width : source.width;
    const height = source instanceof HTMLImageElement ? source.naturalHeight || source.height : source.height;

    this.canvas.width = width || 1280;
    this.canvas.height = height || 720;
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    this.render();
  }

  public setProfile(profile: PerceptionProfile): void {
    this.activeProfile = profile;
    this.render();
  }

  public setRenderMode(mode: 'full' | 'split'): void {
    this.renderMode = mode;
    this.render();
  }

  public setSliderPosition(pos: number): void {
    this.sliderPosition = Math.max(0, Math.min(1, pos));
    this.render();
  }

  public setEnvironment(env: Partial<EnvironmentState>): void {
    this.environment = { ...this.environment, ...env };
    this.render();
  }

  public getActiveProfile(): PerceptionProfile {
    return this.activeProfile;
  }

  public getRenderMode(): 'full' | 'split' {
    return this.renderMode;
  }

  public getSliderPosition(): number {
    return this.sliderPosition;
  }

  public render(): void {
    if (!this.sourceImage) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    if (this.renderMode === 'full') {
      // Single species full canvas view
      this.renderProfileToContext(this.activeProfile, this.ctx, width, height);
    } else {
      // Split-view comparison mode (Human baseline on left, Active animal on right)
      // 1. Render active animal profile onto offscreen buffer
      this.renderProfileToContext(this.activeProfile, this.offscreenCtx, width, height);

      // 2. Render human baseline profile onto main canvas
      this.renderProfileToContext(this.humanProfile, this.ctx, width, height);

      // 3. Composite animal slice from offscreen buffer
      const splitX = Math.round(width * this.sliderPosition);
      if (splitX < width) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(splitX, 0, width - splitX, height);
        this.ctx.clip();
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        this.ctx.restore();
      }

      // 4. Draw interactive comparison divider line & badge tags
      this.drawSplitDivider(splitX, width, height);
    }
  }

  /**
   * Main multi-pass perception rendering pipeline
   */
  private renderProfileToContext(
    profile: PerceptionProfile,
    targetCtx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    if (!this.sourceImage) return;

    // 1. Clear target context & draw raw original source image
    targetCtx.clearRect(0, 0, width, height);
    targetCtx.drawImage(this.sourceImage, 0, 0, width, height);

    // 2. Compute environment lighting brightness multiplier
    let lightingFactor = 1.0;
    if (this.environment.lighting === 'bright') lightingFactor = 1.25;
    else if (this.environment.lighting === 'twilight') lightingFactor = 0.65;
    else if (this.environment.lighting === 'night') lightingFactor = 0.25;

    // 3. Extract Pixel Data for direct memory transformations
    let imageData: ImageData | null = null;
    try {
      imageData = targetCtx.getImageData(0, 0, width, height);
    } catch {
      // In case of cross-origin or file:// tainted canvas, skip pixel processing
      // so raw image and split divider still render without throwing unhandled exceptions.
      imageData = null;
    }

    if (imageData) {
      const data = imageData.data;

      // A. Matrix & Tone Curve
      const effBrightness = profile.brightness * lightingFactor;
      if (profile.colorMatrix) {
        applyColorMatrix(
          data,
          profile.colorMatrix,
          effBrightness,
          profile.contrast,
          profile.saturation
        );
      }

      // B. Thermal IR Pit Organ filter (Snake)
      if (profile.thermalMode) {
        applyThermalIR(data);
      }

      // B2. Radio Wave Spectrum (V2)
      if (profile.radioWaveMode) {
        applyRadioWaveSpectrum(data);
      }

      // B3. X-Ray Radiographic Density (V2)
      if (profile.xrayMode) {
        applyXRayDensity(data);
      }

      // B4. UV Spectrum (V2)
      if (profile.uvSpectrumMode) {
        applyUVSpectrum(data);
      }

      // B5. Polarized Light Birefringence (V2)
      if (profile.polarizedLightMode) {
        applyPolarizedLightBirefringence(data);
      }

      // C. UV Nectar Guide boost (Bee, Tetrachromats)
      if (profile.uvBoost || this.environment.showUVGuides) {
        applyUVHighlights(data);
      }

      // D. Night Vision Tapetum Lucidum Boost (Cats, Owls, Night)
      if (profile.nightVisionBoost || this.environment.lighting === 'night') {
        const gain = (profile.nightVisionBoost || 0) + (this.environment.lighting === 'night' ? 0.5 : 0);
        applyNightVisionBoost(data, gain);
      }

      // E. Insect Compound Eye Ommatidia Grid
      if (profile.ommatidiaGrid) {
        applyOmmatidiaGrid(imageData, profile.ommatidiaGrid);
      }

      // F. Acuity Blur (Distance + Species Acuity degradation)
      // Distance > 10m increases blur for lower acuity animals
      const distanceBlur = (this.environment.distanceMeters / 10) * (1.0 / Math.max(0.1, profile.acuityMultiplier));
      const totalBlur = Math.max(0, profile.blur + (distanceBlur > 1 ? distanceBlur * 0.4 : 0));
      if (totalBlur > 0.2) {
        applyFastBlur(imageData, totalBlur);
      }

      // G. Raptor Sharpening Filter (Eagle / Falcon)
      if (profile.sharpen) {
        applySharpen(imageData, 0.45);
      }

      // H. Chromatic Aberration
      if (profile.chromaticAberration) {
        applyChromaticAberration(imageData, profile.chromaticAberration * 4);
      }

      // Put modified pixel data back onto canvas
      targetCtx.putImageData(imageData, 0, 0);
    }

    // 4. Overlays & Canvas Optics
    // A. Vignette & Peripheral Falloff
    if (profile.vignette) {
      applyVignette(targetCtx, width, height, profile.vignette);
    }

    // B. Monocular Horse Blind Spots
    if (profile.monocularBlindSpots) {
      applyHorseBlindSpots(targetCtx, width, height);
    }

    // C. Magnetic Field Vector Flux Lines (V2)
    if (profile.magneticFieldMode) {
      this.drawMagneticFieldOverlay(targetCtx, width, height);
    }

    // D. Sound Wave Acoustic Pressure Overlay (V2)
    if (profile.soundWaveMode) {
      this.drawSoundWaveOverlay(targetCtx, width, height);
    }

    // E. Gravitational Lensing Spacetime Distortion (V2)
    if (profile.gravitationalLensingMode) {
      this.drawGravitationalLensingOverlay(targetCtx, width, height);
    }
  }

  private drawMagneticFieldOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;

    const cx = width / 2;
    const cy = height / 2;

    for (let r = 60; r < Math.max(width, height); r += 45) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.4, r * 0.8, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('🧲 Geomagnetic North Pole (B = 48.5 µT | Dip Angle 62°)', 20, 35);

    ctx.restore();
  }

  private drawSoundWaveOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
    ctx.lineWidth = 2;

    const cx = width / 2;
    const cy = height / 2;

    for (let r = 20; r < Math.max(width, height); r += 35) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(192, 132, 252, 0.9)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('🎵 Acoustic Cymatics: Pressure Wave Node 440 Hz (Concentric Waves)', 20, 35);

    ctx.restore();
  }

  private drawGravitationalLensingOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.28;

    const grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.3);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
    grad.addColorStop(1, 'rgba(236, 72, 153, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(244, 114, 182, 0.9)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('🌌 Spacetime Mass Curvature: Einstein Ring Radius θE = 2.4″', 20, 35);

    ctx.restore();
  }

  /**
   * Render comparison slider line & side label pills
   */
  private drawSplitDivider(splitX: number, width: number, height: number): void {
    const displayedWidth = this.canvas.clientWidth || width;
    const scale = displayedWidth > 0 ? (width / displayedWidth) : 1;

    this.ctx.save();

    // Vertical Divider Line
    this.ctx.strokeStyle = '#38bdf8'; // Sky blue accent
    this.ctx.lineWidth = Math.max(1, Math.round(3 * scale));
    this.ctx.beginPath();
    this.ctx.moveTo(splitX, 0);
    this.ctx.lineTo(splitX, height);
    this.ctx.stroke();

    // Center Drag Handle Button Circle
    const handleRadius = 22 * scale;
    this.ctx.fillStyle = '#0284c7';
    this.ctx.beginPath();
    this.ctx.arc(splitX, height / 2, handleRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = Math.max(1, Math.round(2 * scale));
    this.ctx.beginPath();
    this.ctx.arc(splitX, height / 2, handleRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Left/Right Arrows in handle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('◄ ►', splitX, height / 2);

    // Label Pills
    const marginX = 20 * scale;
    const marginY = 24 * scale;

    // Left side label: Human Standard
    const leftText = '👤 Human Vision (20/20)';
    const leftPillBoxW = this.drawLabelPill(
      this.ctx,
      leftText,
      marginX,
      marginY,
      '#0f172a',
      '#e2e8f0',
      'left',
      scale
    );

    // Right side label: Selected Species
    // Ensure the right pill does not run past canvas edge and does not collide with left pill
    const maxRightBoxW = Math.max(width * 0.4, (width - marginX) - (marginX + leftPillBoxW + 12 * scale));
    const paddingX = 14 * scale;
    const maxTextW = Math.max(30 * scale, maxRightBoxW - paddingX * 2);

    const rightLabelText = this.formatSpeciesLabel(
      this.ctx,
      this.activeProfile.icon,
      this.activeProfile.name,
      this.activeProfile.acuity,
      maxTextW,
      scale
    );

    this.drawLabelPill(
      this.ctx,
      rightLabelText,
      width - marginX,
      marginY,
      '#0369a1',
      '#f0f9ff',
      'right',
      scale
    );

    this.ctx.restore();
  }

  private formatSpeciesLabel(
    ctx: CanvasRenderingContext2D,
    icon: string,
    name: string,
    acuity: string,
    maxTextWidth: number,
    scale: number
  ): string {
    const fontSize = Math.round(13 * scale);
    ctx.font = `bold ${fontSize}px sans-serif`;

    const full = `${icon} ${name} (${acuity})`;
    if (ctx.measureText(full).width <= maxTextWidth) {
      return full;
    }

    // Shorten species name with ellipsis
    let low = 1;
    let high = name.length;
    let best = `${icon} ${name} (${acuity})`;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidateName = name.slice(0, mid).trimEnd() + '…';
      const candidate = `${icon} ${candidateName} (${acuity})`;
      if (ctx.measureText(candidate).width <= maxTextWidth) {
        best = candidate;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (ctx.measureText(best).width > maxTextWidth) {
      let s = `${icon} ${name}`;
      let l = 1;
      let r = s.length;
      while (l <= r) {
        const m = Math.floor((l + r) / 2);
        const cand = s.slice(0, m).trimEnd() + '…';
        if (ctx.measureText(cand).width <= maxTextWidth) {
          best = cand;
          l = m + 1;
        } else {
          r = m - 1;
        }
      }
    }

    return best;
  }

  private drawLabelPill(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    bgColor: string,
    textColor: string,
    align: 'left' | 'right' = 'left',
    scale: number = 1
  ): number {
    const fontSize = Math.round(13 * scale);
    ctx.font = `bold ${fontSize}px sans-serif`;
    const metrics = ctx.measureText(text);
    const paddingX = 14 * scale;
    const boxW = metrics.width + paddingX * 2;
    const boxH = 32 * scale;
    const radius = 16 * scale;

    const boxX = align === 'right' ? x - boxW : x;

    ctx.fillStyle = bgColor;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(boxX, y, boxW, boxH, radius);
    } else {
      ctx.rect(boxX, y, boxW, boxH);
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + paddingX, y + boxH / 2);

    return boxW;
  }
}
