import * as THREE from 'three';
import { CELESTIAL_BODIES, getCelestialBodyById } from '../data/celestialBodies';
import { ExplorationScaleId } from './cosmicScale';

export type CameraMode = 'third-person' | 'first-person';
export type GraphicsQuality = 'high' | 'balanced' | 'eco';

export interface FlightInputState {
  forward: number; // -1 to 1
  turn: number; // -1 (left) to 1 (right)
  vertical: number; // -1 (down) to 1 (up)
  boost: boolean;
  /** Touch joystick vector overrides */
  joyX: number;
  joyY: number;
  touchUp: boolean;
  touchDown: boolean;
  touchBoost: boolean;
}

export interface TargetMarkerProjection {
  visible: boolean;
  targetId: string | null;
  screenX: number; // 0..100 (% viewport width)
  screenY: number; // 0..100 (% viewport height)
  isOnScreen: boolean;
  edgeAngleDeg: number;
  distanceUnits: number;
}

export interface ProjectedBodyLabel {
  id: string;
  visible: boolean;
  screenX: number; // pixels
  screenY: number; // pixels
  opacity: number;
}

export interface WorldRuntimeState {
  /** Current 3D world positions of every celestial body, updated in useFrame without GC */
  planetPositions: Record<string, THREE.Vector3>;
  /** Real-time 2D projected label coordinates (replaces @react-three/drei Html with zero overhead) */
  labelProjections: Record<string, ProjectedBodyLabel>;
  /** Spaceship world state */
  shipPosition: THREE.Vector3;
  shipVelocity: THREE.Vector3;
  shipYaw: number;
  shipPitch: number;
  shipRoll: number;
  shipSpeed: number;
  shipAcceleration: number;
  shipAltitude: number;
  isBoosting: boolean;
  /** Camera orbital offsets relative to spaceship */
  cameraOrbitYaw: number;
  cameraOrbitPitch: number;
  zoomDistance: number;
  cameraMode: CameraMode;
  /** Target Lock, Autopilot & Cinematic Inspection */
  lockedTargetId: string | null;
  autopilotTargetId: string | null;
  inspectTargetId: string | null;
  inspectOrbitAngle: number;
  /** Smooth cosmic scale zoom-out/zoom-in glide target */
  scaleGlideTargetPos: THREE.Vector3 | null;
  scaleGlideLookPos: THREE.Vector3 | null;
  /** Close low-altitude planet / satellite / star system / galaxy exploration mode */
  surfaceExploreId: string | null;
  surfaceOrbitYaw: number;
  surfaceOrbitPitch: number;
  surfaceOrbitDistance: number;
  /** Current cosmic exploration scale level */
  explorationScale: ExplorationScaleId;
  /** Real-time 3D-to-2D target lock marker projection (read by 60fps reticle overlay) */
  targetMarker: TargetMarkerProjection;
  /** Telemetry snapshots read on a throttled interval by the HUD */
  nearestBodyId: string;
  nearestDistance: number;
  /** Paused simulation flag */
  isPaused: boolean;
  isMenuOpen: boolean;
  /** Elapsed simulation time (pauses cleanly when paused) */
  simTime: number;
  /** Live pilot input */
  input: FlightInputState;
}

function createInitialPlanetPositions(): Record<string, THREE.Vector3> {
  const map: Record<string, THREE.Vector3> = {};

  // First pass: primary bodies & cosmic objects
  for (const body of CELESTIAL_BODIES) {
    if (body.cosmicPos) {
      map[body.id] = new THREE.Vector3(
        body.cosmicPos[0],
        body.cosmicPos[1],
        body.cosmicPos[2]
      );
    } else if (!body.parentId) {
      const x = Math.cos(body.initialAngle) * body.orbitRadius;
      const z = Math.sin(body.initialAngle) * body.orbitRadius;
      map[body.id] = new THREE.Vector3(
        x,
        body.inclination ? Math.sin(body.initialAngle) * body.inclination : 0,
        z
      );
    }
  }

  // Second pass: natural & artificial satellites relative to their parent planet
  for (const body of CELESTIAL_BODIES) {
    if (body.parentId) {
      const parentPos = map[body.parentId] ?? new THREE.Vector3();
      const x = parentPos.x + Math.cos(body.initialAngle) * body.orbitRadius;
      const y =
        parentPos.y +
        (body.inclination ? Math.sin(body.initialAngle) * body.inclination : 0);
      const z = parentPos.z + Math.sin(body.initialAngle) * body.orbitRadius;
      map[body.id] = new THREE.Vector3(x, y, z);
    }
  }

  return map;
}

function createInitialLabelProjections(): Record<string, ProjectedBodyLabel> {
  const labels: Record<string, ProjectedBodyLabel> = {};
  for (const body of CELESTIAL_BODIES) {
    labels[body.id] = {
      id: body.id,
      visible: false,
      screenX: -999,
      screenY: -999,
      opacity: 0,
    };
  }
  return labels;
}

const initialPositions = createInitialPlanetPositions();
const initEarth = initialPositions.earth;
const initToSun = initEarth.clone().normalize().multiplyScalar(-40);

/**
 * Shared mutable simulation state accessed inside Three.js useFrame loops
 * so 60fps flight, orbits, target tracking, and camera damping never cause React re-renders.
 */
export const worldState: WorldRuntimeState = {
  planetPositions: initialPositions,
  labelProjections: createInitialLabelProjections(),
  // Start beside the sunlit side of enlarged low-poly Earth with ISS & Moon nearby!
  shipPosition: new THREE.Vector3(
    initEarth.x + initToSun.x + 18,
    initEarth.y + 11,
    initEarth.z + initToSun.z + 22
  ),
  shipVelocity: new THREE.Vector3(),
  shipYaw: Math.PI * 0.88,
  shipPitch: 0,
  shipRoll: 0,
  shipSpeed: 0,
  shipAcceleration: 0,
  shipAltitude: 34,
  isBoosting: false,
  cameraOrbitYaw: 0,
  cameraOrbitPitch: 0.24,
  zoomDistance: 16.5,
  cameraMode: 'third-person',
  lockedTargetId: null,
  autopilotTargetId: null,
  inspectTargetId: null,
  inspectOrbitAngle: 0,
  scaleGlideTargetPos: null,
  scaleGlideLookPos: null,
  surfaceExploreId: null,
  surfaceOrbitYaw: 0.7,
  surfaceOrbitPitch: 0.26,
  surfaceOrbitDistance: 36,
  explorationScale: 'planetary',
  targetMarker: {
    visible: false,
    targetId: null,
    screenX: 50,
    screenY: 50,
    isOnScreen: true,
    edgeAngleDeg: 0,
    distanceUnits: 0,
  },
  nearestBodyId: 'earth',
  nearestDistance: 34,
  isPaused: false,
  isMenuOpen: true,
  simTime: 0,
  input: {
    forward: 0,
    turn: 0,
    vertical: 0,
    boost: false,
    joyX: 0,
    joyY: 0,
    touchUp: false,
    touchDown: false,
    touchBoost: false,
  },
};

export function enterSurfaceExplore(id: string): void {
  const body = getCelestialBodyById(id);
  const pos = worldState.planetPositions[id];
  if (!body || !pos) return;

  const isCosmicObject =
    body.scaleTier === 'interstellar' ||
    body.scaleTier === 'galactic' ||
    body.scaleTier === 'universe';

  const sunAngle =
    !isCosmicObject && pos.lengthSq() > 1
      ? Math.atan2(-pos.z, -pos.x)
      : 0.85;

  worldState.surfaceExploreId = id;
  worldState.surfaceOrbitYaw = sunAngle + 0.45;
  worldState.surfaceOrbitPitch =
    body.scaleTier === 'universe' || body.scaleTier === 'galactic'
      ? 0.56
      : body.hasRings
        ? 0.36
        : 0.24;

  if (body.scaleTier === 'universe') {
    worldState.surfaceOrbitDistance = body.radius * 2.55;
  } else if (body.scaleTier === 'galactic') {
    worldState.surfaceOrbitDistance = body.radius * 3.8;
  } else if (body.scaleTier === 'interstellar') {
    worldState.surfaceOrbitDistance = body.radius * 5.4;
  } else if (body.type === 'Artificial satellite') {
    worldState.surfaceOrbitDistance = Math.max(body.radius * 4.5, 6.2);
  } else {
    worldState.surfaceOrbitDistance = body.hasRings
      ? body.radius * 3.15
      : Math.max(body.radius * 2.35, body.radius + 7.5);
  }

  worldState.autopilotTargetId = null;
  worldState.inspectTargetId = null;
  worldState.scaleGlideTargetPos = null;
  worldState.scaleGlideLookPos = null;
  worldState.shipVelocity.set(0, 0, 0);
}

export function exitSurfaceExplore(): void {
  const id = worldState.surfaceExploreId;
  worldState.surfaceExploreId = null;
  if (!id) return;

  const body = getCelestialBodyById(id);
  const pos = worldState.planetPositions[id];
  if (!body || !pos) return;

  const releaseDist =
    body.scaleTier === 'universe'
      ? body.radius * 3.1
      : body.scaleTier === 'galactic'
        ? body.radius * 4.4
        : body.scaleTier === 'interstellar'
          ? body.radius * 6.0
          : body.type === 'Artificial satellite'
            ? Math.max(body.radius * 5.2, 8.5)
            : Math.max(
                body.hasRings ? body.radius * 3.4 + 12 : body.radius * 2.5 + 14,
                22
              );

  const yaw = worldState.surfaceOrbitYaw;
  worldState.shipPosition.set(
    pos.x + Math.cos(yaw) * releaseDist,
    pos.y + Math.sin(worldState.surfaceOrbitPitch) * (body.radius * 0.7) + 4.5,
    pos.z + Math.sin(yaw) * releaseDist
  );
  worldState.shipVelocity.set(0, 0, 0);
  worldState.shipYaw = Math.atan2(
    pos.x - worldState.shipPosition.x,
    pos.z - worldState.shipPosition.z
  );
  worldState.shipPitch = 0;
  worldState.shipRoll = 0;
  worldState.cameraOrbitYaw = 0;
  worldState.cameraOrbitPitch = 0.22;
  worldState.zoomDistance = 16.5;
}

/**
 * Smoothly glides the spaceship to a scenic vantage point for any of the 5 Cosmic Scales
 * calibrated for the enlarged 25x universe!
 */
export function initiateScaleTransition(scale: ExplorationScaleId): void {
  worldState.surfaceExploreId = null;
  worldState.autopilotTargetId = null;
  worldState.inspectTargetId = null;

  const earthPos = worldState.planetPositions.earth;

  if (scale === 'planetary') {
    const targetId = worldState.lockedTargetId ?? worldState.nearestBodyId ?? 'earth';
    const body = getCelestialBodyById(targetId) ?? getCelestialBodyById('earth')!;
    const p = worldState.planetPositions[body.id] ?? earthPos;
    const radial =
      p.lengthSq() > 1
        ? p.clone().normalize().multiplyScalar(-1)
        : new THREE.Vector3(0, 0, 1);
    const dist =
      body.type === 'Artificial satellite'
        ? Math.max(body.radius * 5.5, 9)
        : Math.max(body.radius * 2.8 + 14, 34);
    worldState.scaleGlideTargetPos = new THREE.Vector3(
      p.x + radial.x * dist + 8,
      p.y + body.radius * 0.42 + 6,
      p.z + radial.z * dist + 8
    );
    worldState.scaleGlideLookPos = p.clone();
  } else if (scale === 'solar') {
    worldState.scaleGlideTargetPos = new THREE.Vector3(6800, 5600, 10800);
    worldState.scaleGlideLookPos = new THREE.Vector3(0, 0, 0);
  } else if (scale === 'interstellar') {
    worldState.scaleGlideTargetPos = new THREE.Vector3(24000, 19500, 34000);
    worldState.scaleGlideLookPos = new THREE.Vector3(2000, 0, -4000);
  } else if (scale === 'galactic') {
    worldState.scaleGlideTargetPos = new THREE.Vector3(48000, 78000, 92000);
    worldState.scaleGlideLookPos = new THREE.Vector3(0, 0, -64000);
  } else {
    // Universe Scale overlooking Milky Way + Andromeda + Whirlpool!
    worldState.scaleGlideTargetPos = new THREE.Vector3(62000, 185000, 245000);
    worldState.scaleGlideLookPos = new THREE.Vector3(0, 0, -125000);
  }
}

export function resetSpaceshipView(): void {
  const earthPos = worldState.planetPositions.earth;
  // Spawn facing the sunlit side of enlarged Earth with ISS & Moon framed nearby
  const toSun = earthPos.clone().normalize().multiplyScalar(-42);
  worldState.shipPosition.set(
    earthPos.x + toSun.x + 18,
    earthPos.y + 11.5,
    earthPos.z + toSun.z + 22
  );
  worldState.shipVelocity.set(0, 0, 0);
  worldState.shipYaw = Math.atan2(
    earthPos.x - worldState.shipPosition.x,
    earthPos.z - worldState.shipPosition.z
  );
  worldState.shipPitch = 0;
  worldState.shipRoll = 0;
  worldState.cameraOrbitYaw = 0;
  worldState.cameraOrbitPitch = 0.22;
  worldState.zoomDistance = 16.5;
  worldState.autopilotTargetId = null;
  worldState.inspectTargetId = null;
  worldState.surfaceExploreId = null;
  worldState.scaleGlideTargetPos = null;
  worldState.scaleGlideLookPos = null;
}
