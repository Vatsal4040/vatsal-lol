export type ConfidenceLevel = 'High' | 'Medium' | 'Approximation' | 'Inspired' | 'Physics-Based';

export type CategoryType = 'mammals' | 'birds' | 'insects_reptiles' | 'marine_exotic' | 'human_deficiencies' | 'beyond_biology';

export interface ColorMatrix3x3 {
  // 9-element row-major matrix: [rR, rG, rB, gR, gG, gB, bR, bG, bB]
  // maps [R, G, B] -> [R', G', B']
  matrix: [number, number, number, number, number, number, number, number, number];
}

export interface PerceptionProfile {
  id: string;
  name: string;
  latinName?: string;
  category: CategoryType;
  era?: 'v1' | 'v2';
  icon: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  visionType: string; // e.g. "Dichromatic (Blue/Yellow)", "Radio Astronomy Spectrum"
  summary: string;
  evolutionaryContext: string;
  
  // Biological / Physical Specs
  acuity: string; // e.g., "20/75", "100 GHz Band"
  acuityMultiplier: number; // 1.0 = human 20/20, 0.25 = 20/80, 4.0 = 20/5 eagle
  fovDegrees: number; // total field of view
  binocularFOV: number; // binocular overlap in degrees
  wavelengthRange: string; // e.g. "300 - 650 nm", "0.1mm - 100m"
  flickerFusionHz: number; // e.g., 60 Hz for human, 250 Hz for dragonfly
  receptors: {
    rods: string;
    cones: string;
    specialized?: string;
  };
  
  // Pipeline Filters
  brightness: number; // default 1.0
  contrast: number;   // default 1.0
  saturation: number; // default 1.0
  blur: number;       // acuity blur radius in px
  colorMatrix: [number, number, number, number, number, number, number, number, number] | null;
  
  // Advanced biological & physical spectrum filters
  sharpen?: boolean;
  vignette?: number;  // 0 to 1 strength
  ommatidiaGrid?: number; // 0 = disabled, >0 = hexagon/grid size for insect compound eye
  uvBoost?: boolean;  // highlight UV reflecting patterns
  thermalMode?: boolean; // Thermal IR mapping
  nightVisionBoost?: number; // Tapetum lucidum & rod gain bloom
  chromaticAberration?: number; // Lens edge distortion
  monocularBlindSpots?: boolean; // Horse lateral vision blind spot overlay
  bioluminescenceGain?: boolean; // Deep sea boost

  // V2 Beyond Biology Modes
  radioWaveMode?: boolean;
  xrayMode?: boolean;
  uvSpectrumMode?: boolean;
  magneticFieldMode?: boolean;
  polarizedLightMode?: boolean;
  soundWaveMode?: boolean;
  gravitationalLensingMode?: boolean;
}

export interface EnvironmentState {
  lighting: 'bright' | 'daylight' | 'twilight' | 'night';
  distanceMeters: number; // 1 to 100m
  motionSpeed: number; // 0 to 100
  showUVGuides: boolean;
}
