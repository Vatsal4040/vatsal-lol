/**
 * Hybrid Cosmic Scaling System for Mini Universe Explorer (25x Realistic Scale).
 * Maps playable 3D world units smoothly across 5 exploration levels:
 *   1. Planetary Scale  (km)   — Earth r=16, satellites 24..88u, Moon 88u
 *   2. Solar System     (AU)   — Earth orbit 2,450u (1 AU) out to Pluto 26,200u (39.5 AU)
 *   3. Deep Space       (ly)   — Neighboring star systems 36,000..65,000u
 *   4. Galactic Scale   (kly)  — Milky Way spiral 185,000u radius, Core at 125,000u
 *   5. Universe Scale   (Mly)  — Andromeda & Whirlpool at ~300,000u+
 */

export type ExplorationScaleId =
  | 'planetary'
  | 'solar'
  | 'interstellar'
  | 'galactic'
  | 'universe';

export interface ExplorationScaleMeta {
  id: ExplorationScaleId;
  label: string;
  shortLabel: string;
  unitLabel: string;
  accentColor: string;
  description: string;
}

export const EXPLORATION_SCALES: ExplorationScaleMeta[] = [
  {
    id: 'planetary',
    label: 'Planetary Scale',
    shortLabel: 'Planetary',
    unitLabel: 'km',
    accentColor: '#38BDF8',
    description: 'Low-altitude orbital, satellite & surface exploration',
  },
  {
    id: 'solar',
    label: 'Solar System',
    shortLabel: 'Solar',
    unitLabel: 'AU',
    accentColor: '#FBBF24',
    description: 'Planets, moons, satellites, asteroids & comets',
  },
  {
    id: 'interstellar',
    label: 'Deep Space',
    shortLabel: 'Deep Space',
    unitLabel: 'ly',
    accentColor: '#A78BFA',
    description: 'Neighboring star systems & exoplanets',
  },
  {
    id: 'galactic',
    label: 'Galactic Scale',
    shortLabel: 'Galactic',
    unitLabel: 'kly',
    accentColor: '#34D399',
    description: 'Milky Way spiral arms & galactic core',
  },
  {
    id: 'universe',
    label: 'Universe Scale',
    shortLabel: 'Universe',
    unitLabel: 'Mly',
    accentColor: '#F472B6',
    description: 'Distant spiral galaxies & cosmic clusters',
  },
];

export function getScaleMeta(id: ExplorationScaleId): ExplorationScaleMeta {
  return (
    EXPLORATION_SCALES.find((s) => s.id === id) ?? EXPLORATION_SCALES[1]
  );
}

/**
 * Determines the current exploration scale seamlessly from ship position,
 * proximity to nearest planet/satellite/star, and close surface explore state.
 */
export function computeExplorationScale(
  distFromOrigin: number,
  nearestSurfaceGap: number,
  inSurfaceMode: boolean
): ExplorationScaleId {
  if (inSurfaceMode || nearestSurfaceGap < 95) {
    return 'planetary';
  }
  if (distFromOrigin < 32000) {
    return 'solar';
  }
  if (distFromOrigin < 82000) {
    return 'interstellar';
  }
  if (distFromOrigin < 205000) {
    return 'galactic';
  }
  return 'universe';
}

/**
 * Adaptive dynamic flight speed (cruise & boost) scaled smoothly for the 25x universe
 * so orbital satellite flight feels precise while interplanetary and intergalactic flight feel epic!
 */
export function computeAdaptiveMaxSpeed(
  distFromOrigin: number,
  nearestSurfaceGap: number,
  isBoosting: boolean
): { maxSpeed: number; vertSpeed: number; cruiseCap: number } {
  let cruise = 64;
  let boost = 210;

  if (nearestSurfaceGap < 48) {
    // Delicate orbital & satellite maneuvering
    cruise = 42;
    boost = 130;
  } else if (nearestSurfaceGap < 180) {
    const t = (nearestSurfaceGap - 48) / 132;
    cruise = 42 + t * 280;
    boost = 130 + t * 880;
  } else if (distFromOrigin < 32000) {
    // Vast 25x Solar System interplanetary cruise
    const t = Math.min(1, Math.max(0, (distFromOrigin - 800) / 28000));
    cruise = 420 + t * 2600;
    boost = 1450 + t * 8400;
  } else if (distFromOrigin < 82000) {
    const t = Math.min(1, (distFromOrigin - 32000) / 50000);
    cruise = 3200 + t * 8500;
    boost = 10500 + t * 24000;
  } else if (distFromOrigin < 205000) {
    const t = Math.min(1, (distFromOrigin - 82000) / 123000);
    cruise = 12500 + t * 26000;
    boost = 36000 + t * 68000;
  } else {
    const t = Math.min(1, (distFromOrigin - 205000) / 220000);
    cruise = 40000 + t * 55000;
    boost = 110000 + t * 140000;
  }

  return {
    maxSpeed: isBoosting ? boost : cruise,
    vertSpeed: (isBoosting ? boost : cruise) * 0.44,
    cruiseCap: boost,
  };
}

/**
 * Formats a 3D world distance into intuitive astronomical units based on 25x magnitude:
 *  - Planetary: km   (Earth orbit gap / satellites)
 *  - Solar System: AU (Earth at 2,450u = 1.00 AU, Pluto at 26,200u ~ 39.5 AU)
 *  - Deep Space: ly  (Alpha Centauri ~50,400u ~ 4.37 ly)
 *  - Galactic: kly   (Milky Way Core ~125,000u ~ 26 kly)
 *  - Universe: Mly   (Andromeda ~324,000u ~ 2.5 Mly)
 */
export function formatCosmicDistance(
  worldUnits: number,
  forceScale?: ExplorationScaleId
): string {
  const d = Math.max(0, worldUnits);

  if (forceScale === 'planetary' || (!forceScale && d < 260)) {
    const km = Math.round(d * 420);
    return `${km.toLocaleString()} km`;
  }

  if (forceScale === 'solar' || (!forceScale && d < 32000)) {
    // Nonlinear map so Earth (2,450u) = 1.00 AU and Pluto (26,200u) ~ 39 AU
    const au = Math.pow(d / 2450, 1.54);
    if (au < 0.05) {
      return `${Math.round(d * 420).toLocaleString()} km`;
    }
    return `${au < 10 ? au.toFixed(2) : au.toFixed(1)} AU`;
  }

  if (forceScale === 'interstellar' || (!forceScale && d < 82000)) {
    const ly = 0.8 + ((d - 28000) / 54000) * 42;
    return `${ly < 10 ? ly.toFixed(2) : ly.toFixed(1)} ly`;
  }

  if (forceScale === 'galactic' || (!forceScale && d < 205000)) {
    const kly = Math.max(0.5, ((d - 75000) / 130000) * 58);
    return `${kly.toFixed(1)} kly`;
  }

  // Universe scale: Mly (Andromeda at ~324,000u ~ 2.50 Mly)
  const mly = Math.max(0.2, ((d - 180000) / 145000) * 2.5);
  return `${mly.toFixed(2)} Mly`;
}

/**
 * Formats spaceship speed into intuitive km/s or Warp Factor (×c)
 */
export function formatCosmicSpeed(
  worldSpeed: number,
  scale: ExplorationScaleId
): string {
  if (worldSpeed < 0.4) return '0 km/s';
  if (scale === 'planetary') {
    const kms = Math.round(worldSpeed * 1.4);
    return `${kms.toLocaleString()} km/s`;
  }
  if (scale === 'solar') {
    const kms = Math.round(worldSpeed * 8.5);
    return `${kms.toLocaleString()} km/s`;
  }
  if (scale === 'interstellar') {
    const cFactor = (worldSpeed / 2200).toFixed(1);
    return `${cFactor}×c`;
  }
  if (scale === 'galactic') {
    const lyS = (worldSpeed / 5800).toFixed(1);
    return `${lyS} ly/s`;
  }
  const klyS = (worldSpeed / 12000).toFixed(1);
  return `${klyS} kly/s`;
}
