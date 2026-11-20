import { useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  CELESTIAL_BODIES,
  CelestialCategory,
  getCelestialBodyById,
} from '../../data/celestialBodies';
import {
  EXPLORATION_SCALES,
  ExplorationScaleId,
  formatCosmicDistance,
  formatCosmicSpeed,
  getScaleMeta,
} from '../../utils/cosmicScale';
import { CameraMode, worldState } from '../../utils/worldState';
import { spaceAudio } from '../../utils/sound';
import {
  IconArrowLeft,
  IconAward,
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconCompass,
  IconCrosshair,
  IconEye,
  IconEyeOff,
  IconFlame,
  IconGauge,
  IconInfo,
  IconMap,
  IconNavigation,
  IconPause,
  IconReset,
  IconSliders,
  IconVolumeOff,
  IconVolumeOn,
  IconZoomIn,
  IconZoomOut,
} from './Icons';

interface NavigationHUDProps {
  discoveredIds: Set<string>;
  totalCount: number;
  cameraMode: CameraMode;
  soundEnabled: boolean;
  selectedBodyId: string | null;
  lockedTargetId: string | null;
  autopilotTargetId: string | null;
  surfaceExploreId: string | null;
  recentDiscoveryId: string | null;
  recentArrivalId: string | null;
  hudHidden: boolean;
  onToggleHud: () => void;
  onSelectScale: (scale: ExplorationScaleId) => void;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onToggleCameraMode: () => void;
  onResetView: () => void;
  onToggleSound: () => void;
  onOpenPause: () => void;
  onSelectCompassBody: (id: string) => void;
  onLockRadarBody: (id: string) => void;
  onUnlockTarget: () => void;
  onCancelAutopilot: () => void;
  onInspectBodyFacts: (id: string) => void;
  onEnterSurfaceExplore: (id: string) => void;
  onExitSurfaceExplore: () => void;
}

type RadarZoomMode = 'local' | 'system' | 'galaxy';

const RADAR_MAX_R: Record<RadarZoomMode, number> = {
  local: 280,
  system: 28500,
  galaxy: 340000,
};

const RADAR_RANGE_LABEL: Record<RadarZoomMode, string> = {
  local: 'LOCAL 280u',
  system: 'SOLAR 40 AU',
  galaxy: 'COSMIC 2.8 Mly',
};

const RADAR_TICKS = Array.from({ length: 24 }, (_, idx) => {
  const deg = idx * 15;
  const rad = ((deg - 90) * Math.PI) / 180;
  const isCardinal = deg % 90 === 0;
  const isMajor = deg % 45 === 0;
  const inner = isCardinal ? 50 : isMajor ? 53 : 55.5;
  const outer = 58.5;
  return {
    deg,
    isCardinal,
    x1: 63 + Math.cos(rad) * inner,
    y1: 63 + Math.sin(rad) * inner,
    x2: 63 + Math.cos(rad) * outer,
    y2: 63 + Math.sin(rad) * outer,
  };
});

interface MiniRadarDot {
  id: string;
  name: string;
  type: CelestialCategory;
  hasRings: boolean;
  scaleTier?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  isLocked: boolean;
}

interface AzimuthTick {
  deg: number;
  label: string;
  isCardinal: boolean;
  isMajor: boolean;
  leftPct: number;
}

interface TelemetrySnapshot {
  scale: ExplorationScaleId;
  nearestId: string;
  nearestName: string;
  nearestColor: string;
  nearestDistanceUnits: number;
  lockedDistanceUnits: number | null;
  speedLabel: string;
  speedRatio: number;
  accelerationUnits: number;
  altitudeUnits: number;
  headingDeg: number;
  coords: { x: number; y: number; z: number };
  flightMode: 'Manual' | 'Autopilot' | 'Scale Glide' | 'Orbit';
  isBoosting: boolean;
  autopilotName: string | null;
  azimuthTicks: AzimuthTick[];
  compassPips: { id: string; name: string; color: string; offsetPct: number }[];
  radarDots: MiniRadarDot[];
  shipRadar: { x: number; y: number; yawDeg: number };
  lockedRadarPos: { x: number; y: number } | null;
}

function buildAzimuthTicks(headingDeg: number): AzimuthTick[] {
  const ticks: AzimuthTick[] = [];
  const halfSpanDeg = 75;
  const startStep = Math.floor((headingDeg - halfSpanDeg) / 15) * 15;
  const endStep = Math.ceil((headingDeg + halfSpanDeg) / 15) * 15;

  const cardinals: Record<number, string> = {
    0: 'N',
    45: 'NE',
    90: 'E',
    135: 'SE',
    180: 'S',
    225: 'SW',
    270: 'W',
    315: 'NW',
  };

  for (let d = startStep; d <= endStep; d += 15) {
    const delta = d - headingDeg;
    if (Math.abs(delta) > halfSpanDeg) continue;
    const norm = ((d % 360) + 360) % 360;
    const isCardinal = norm % 90 === 0;
    const isMajor = norm % 45 === 0;
    const label =
      cardinals[norm] ?? (norm % 30 === 0 ? String(norm).padStart(3, '0') : '');
    ticks.push({
      deg: d,
      label,
      isCardinal,
      isMajor,
      leftPct: 50 + (delta / halfSpanDeg) * 48,
    });
  }
  return ticks;
}

function readTelemetry(radarMode: RadarZoomMode): TelemetrySnapshot {
  const scale = worldState.explorationScale;
  const nearest = getCelestialBodyById(worldState.nearestBodyId);
  const autopilot = worldState.autopilotTargetId
    ? getCelestialBodyById(worldState.autopilotTargetId)
    : null;

  let lockedDistanceUnits: number | null = null;
  if (worldState.lockedTargetId) {
    const lp = worldState.planetPositions[worldState.lockedTargetId];
    const lb = getCelestialBodyById(worldState.lockedTargetId);
    if (lp && lb) {
      lockedDistanceUnits = Math.max(
        0,
        worldState.shipPosition.distanceTo(lp) - lb.radius
      );
    }
  }

  const pips: { id: string; name: string; color: string; offsetPct: number }[] = [];
  const radarDots: MiniRadarDot[] = [];
  const radarMax = RADAR_MAX_R[radarMode];
  const radarCenter = 63;
  const radarScale = 49 / radarMax;

  const originX = radarMode === 'local' ? worldState.shipPosition.x : 0;
  const originZ = radarMode === 'local' ? worldState.shipPosition.z : 0;

  let lockedRadarPos: { x: number; y: number } | null = null;

  const isCosmicScale =
    scale === 'interstellar' || scale === 'galactic' || scale === 'universe';

  for (const body of CELESTIAL_BODIES) {
    const p = worldState.planetPositions[body.id];
    if (!p) continue;

    const isCosmicBody =
      body.scaleTier === 'interstellar' ||
      body.scaleTier === 'galactic' ||
      body.scaleTier === 'universe';

    const showOnRadar =
      radarMode === 'galaxy'
        ? isCosmicBody || body.id === 'sun'
        : radarMode === 'local'
          ? !isCosmicBody && body.id !== 'asteroid-belt' && !body.isHidden
          : !isCosmicBody &&
            !body.isHidden &&
            !body.parentId &&
            body.id !== 'asteroid-belt';

    if (showOnRadar) {
      const rx = radarCenter + (p.x - originX) * radarScale;
      const ry = radarCenter + (p.z - originZ) * radarScale;
      const distR = Math.hypot(rx - radarCenter, ry - radarCenter);
      if (distR <= 51) {
        const isLocked = worldState.lockedTargetId === body.id;
        if (isLocked) {
          lockedRadarPos = { x: rx, y: ry };
        }
        radarDots.push({
          id: body.id,
          name: body.name,
          type: body.type,
          hasRings: Boolean(body.hasRings),
          scaleTier: body.scaleTier,
          x: rx,
          y: ry,
          color: body.color,
          size:
            body.id === 'sun'
              ? 4.4
              : body.scaleTier === 'universe' || body.scaleTier === 'galactic'
                ? 4.5
                : body.scaleTier === 'interstellar'
                  ? 3.4
                  : body.type === 'Artificial satellite'
                    ? 2.2
                    : body.type === 'Natural satellite'
                      ? 2.1
                      : body.id === 'jupiter' || body.id === 'saturn'
                        ? 3.4
                        : 2.5,
          isLocked,
        });
      }
    }

    const showOnCompass = isCosmicScale
      ? isCosmicBody || body.id === 'sun'
      : !isCosmicBody &&
        !body.isHidden &&
        !body.parentId &&
        body.id !== 'asteroid-belt';

    if (showOnCompass) {
      const dx = p.x - worldState.shipPosition.x;
      const dz = p.z - worldState.shipPosition.z;
      const targetBearing = Math.atan2(dx, dz);
      let rel = targetBearing - worldState.shipYaw;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;

      if (Math.abs(rel) < 1.28) {
        const shortLabel =
          body.name === 'The Sun'
            ? 'Sun'
            : body.name === 'Andromeda Galaxy'
              ? 'Andromeda'
              : body.name === 'Whirlpool Galaxy'
                ? 'Whirlpool'
                : body.name === 'Milky Way Core'
                  ? 'MW Core'
                  : body.name === 'Sirius Binary'
                    ? 'Sirius'
                    : body.name === 'Kepler Haven'
                      ? 'Kepler'
                      : body.name;
        pips.push({
          id: body.id,
          name: shortLabel,
          color: body.color,
          offsetPct: 50 - (rel / 1.28) * 45,
        });
      }
    }
  }

  const rawShipX = radarCenter + (worldState.shipPosition.x - originX) * radarScale;
  const rawShipY = radarCenter + (worldState.shipPosition.z - originZ) * radarScale;
  const shipRadarDist = Math.hypot(rawShipX - radarCenter, rawShipY - radarCenter);
  const clampedShipX =
    shipRadarDist > 48
      ? radarCenter + ((rawShipX - radarCenter) / shipRadarDist) * 48
      : rawShipX;
  const clampedShipY =
    shipRadarDist > 48
      ? radarCenter + ((rawShipY - radarCenter) / shipRadarDist) * 48
      : rawShipY;

  const scaleSpeedRef =
    scale === 'planetary'
      ? 240
      : scale === 'solar'
        ? 4200
        : scale === 'interstellar'
          ? 24000
          : scale === 'galactic'
            ? 88000
            : 220000;

  const flightMode: TelemetrySnapshot['flightMode'] = worldState.surfaceExploreId
    ? 'Orbit'
    : worldState.autopilotTargetId
      ? 'Autopilot'
      : worldState.scaleGlideTargetPos
        ? 'Scale Glide'
        : 'Manual';

  const headingDeg =
    ((Math.round((-worldState.shipYaw * 180) / Math.PI) % 360) + 360) % 360;

  return {
    scale,
    nearestId: nearest?.id ?? 'earth',
    nearestName: nearest?.name ?? 'Deep Space',
    nearestColor: nearest?.color ?? '#38BDF8',
    nearestDistanceUnits: worldState.nearestDistance,
    lockedDistanceUnits,
    speedLabel: formatCosmicSpeed(worldState.shipSpeed, scale),
    speedRatio: Math.min(1, worldState.shipSpeed / scaleSpeedRef),
    accelerationUnits: worldState.shipAcceleration,
    altitudeUnits: worldState.shipAltitude,
    headingDeg,
    coords: {
      x: Math.round(worldState.shipPosition.x),
      y: Math.round(worldState.shipPosition.y),
      z: Math.round(worldState.shipPosition.z),
    },
    flightMode,
    isBoosting: worldState.isBoosting,
    autopilotName: autopilot?.name ?? null,
    azimuthTicks: buildAzimuthTicks(headingDeg),
    compassPips: pips,
    radarDots,
    shipRadar: {
      x: clampedShipX,
      y: clampedShipY,
      yawDeg: (-worldState.shipYaw * 180) / Math.PI + 180,
    },
    lockedRadarPos,
  };
}

export function NavigationHUD({
  discoveredIds,
  totalCount,
  cameraMode,
  soundEnabled,
  selectedBodyId,
  lockedTargetId,
  autopilotTargetId,
  surfaceExploreId,
  recentDiscoveryId,
  recentArrivalId,
  hudHidden,
  onToggleHud,
  onSelectScale,
  onOpenMap,
  onOpenJournal,
  onToggleCameraMode,
  onResetView,
  onToggleSound,
  onOpenPause,
  onSelectCompassBody,
  onLockRadarBody,
  onUnlockTarget,
  onCancelAutopilot,
  onInspectBodyFacts,
  onEnterSurfaceExplore,
  onExitSurfaceExplore,
}: NavigationHUDProps) {
  const [radarMode, setRadarMode] = useState<RadarZoomMode>('local');
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(() =>
    readTelemetry('local')
  );
  const [telemetryExpanded, setTelemetryExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // Auto-adapt radar scale to player's current cosmic scale tier
  useEffect(() => {
    if (
      telemetry.scale === 'interstellar' ||
      telemetry.scale === 'galactic' ||
      telemetry.scale === 'universe'
    ) {
      setRadarMode('galaxy');
    } else if (telemetry.scale === 'solar') {
      setRadarMode((prev) => (prev === 'galaxy' ? 'system' : prev));
    }
  }, [telemetry.scale]);

  useEffect(() => {
    setTelemetry(readTelemetry(radarMode));
    const id = window.setInterval(() => {
      setTelemetry(readTelemetry(radarMode));
    }, 120);
    return () => window.clearInterval(id);
  }, [radarMode]);

  if (hudHidden) {
    return (
      <div className="hud-restore-wrap">
        <button
          type="button"
          onClick={() => {
            spaceAudio.playClick();
            onToggleHud();
          }}
          title="Restore HUD (H)"
          className="hud-panel btn hud-restore-btn"
        >
          <IconEye size={15} />
          <span>Show HUD (H)</span>
        </button>
      </div>
    );
  }

  const recentBody = recentDiscoveryId
    ? getCelestialBodyById(recentDiscoveryId)
    : null;
  const arrivalBody =
    recentArrivalId && recentArrivalId !== recentDiscoveryId
      ? getCelestialBodyById(recentArrivalId)
      : null;
  const lockedBody = lockedTargetId ? getCelestialBodyById(lockedTargetId) : null;
  const surfaceBody = surfaceExploreId
    ? getCelestialBodyById(surfaceExploreId)
    : null;

  const scaleMeta = getScaleMeta(telemetry.scale);
  const currentScaleIdx = EXPLORATION_SCALES.findIndex(
    (s) => s.id === telemetry.scale
  );

  const nextUndiscovered = CELESTIAL_BODIES.find(
    (b) => !b.isHidden && !discoveredIds.has(b.id)
  );

  const discoveredCount = discoveredIds.size;
  const progressPct = Math.round((discoveredCount / totalCount) * 100);

  const showApproachPrompt =
    !surfaceExploreId &&
    !telemetry.autopilotName &&
    telemetry.nearestDistanceUnits <= 85 &&
    telemetry.nearestId !== 'asteroid-belt' &&
    selectedBodyId !== telemetry.nearestId;

  const handleSurfaceZoom = (direction: -1 | 1) => {
    if (!surfaceBody) return;
    spaceAudio.playClick();
    const step =
      (surfaceBody.type === 'Artificial satellite'
        ? Math.max(1.2, surfaceBody.radius * 0.7)
        : Math.max(3.2, surfaceBody.radius * 0.36)) * direction;
    const minDist =
      surfaceBody.type === 'Artificial satellite'
        ? Math.max(surfaceBody.radius * 2.2, 3.2)
        : Math.max(surfaceBody.radius * 1.45, surfaceBody.radius + 2.2);
    const maxDist =
      surfaceBody.type === 'Artificial satellite'
        ? Math.max(surfaceBody.radius * 14, 34)
        : Math.max(surfaceBody.radius * 6.8, 54);
    worldState.surfaceOrbitDistance = THREE.MathUtils.clamp(
      worldState.surfaceOrbitDistance + step,
      minDist,
      maxDist
    );
  };

  return (
    <div className="hud-layer">
      {/* Precision Aerospace 1st-Person Flight-Path Reticle */}
      {cameraMode === 'first-person' && !surfaceExploreId && (
        <div className="cockpit-reticle" aria-hidden="true">
          <svg width="110" height="60" viewBox="0 0 110 60" fill="none">
            {/* Horizon pitch wings */}
            <path
              d="M12 30 H34 L39 35 M98 30 H76 L71 35"
              stroke="rgba(125, 211, 252, 0.62)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Optical boresight ring & center pip */}
            <circle
              cx="55"
              cy="30"
              r="7.5"
              stroke="rgba(56, 189, 248, 0.55)"
              strokeWidth="1.2"
            />
            <line
              x1="55"
              y1="17"
              x2="55"
              y2="22.5"
              stroke="rgba(56, 189, 248, 0.65)"
              strokeWidth="1.2"
            />
            <circle cx="55" cy="30" r="1.8" fill="#FBBF24" />
          </svg>
        </div>
      )}

      {/* Top HUD Band */}
      {surfaceBody ? (
        <div className="hud-top hud-top--surface">
          <div className="hud-panel surface-header-card">
            <span
              className="hud-dot"
              style={{ backgroundColor: surfaceBody.color }}
            />
            <div>
              <p className="surface-header-title">
                Exploring {surfaceBody.name}
              </p>
              <p className="surface-header-sub">
                Drag or WASD to orbit 360° · Scroll or pinch to zoom
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              onExitSurfaceExplore();
            }}
            style={{ pointerEvents: 'auto' }}
            className="btn btn--amber btn--md"
          >
            <IconArrowLeft size={15} />
            <span>Return to Space</span>
          </button>
        </div>
      ) : (
        <div className="hud-top">
          {/* Top-Left: Cosmic Scale + Telemetry Pod + Discovery Bar */}
          <div className="hud-left-col">
            <div className="hud-panel hud-card">
              <div className="hud-row">
                <span className="hud-kicker">Cosmic Scale</span>
                <span
                  className="hud-scale-name"
                  style={{ color: scaleMeta.accentColor }}
                >
                  {scaleMeta.label} ({scaleMeta.unitLabel})
                </span>
              </div>

              <div className="hud-scale-grid">
                {EXPLORATION_SCALES.map((s) => {
                  const active = s.id === telemetry.scale;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        spaceAudio.playWarpChime();
                        onSelectScale(s.id);
                      }}
                      title={`Glide to ${s.label}: ${s.description}`}
                      className={`hud-scale-btn${active ? ' is-active' : ''}`}
                      style={
                        active ? { backgroundColor: s.accentColor } : undefined
                      }
                    >
                      {s.shortLabel === 'Deep Space' ? 'Deep' : s.shortLabel}
                    </button>
                  );
                })}
              </div>

              <div className="hud-scale-mobile">
                <button
                  type="button"
                  disabled={currentScaleIdx <= 0}
                  onClick={() => {
                    if (currentScaleIdx > 0) {
                      spaceAudio.playWarpChime();
                      onSelectScale(EXPLORATION_SCALES[currentScaleIdx - 1].id);
                    }
                  }}
                  className="btn btn--slate btn--sm"
                >
                  Zoom In
                </button>
                <span className="hud-scale-level">
                  Lv {currentScaleIdx + 1}/5
                </span>
                <button
                  type="button"
                  disabled={currentScaleIdx >= EXPLORATION_SCALES.length - 1}
                  onClick={() => {
                    if (currentScaleIdx < EXPLORATION_SCALES.length - 1) {
                      spaceAudio.playWarpChime();
                      onSelectScale(EXPLORATION_SCALES[currentScaleIdx + 1].id);
                    }
                  }}
                  className="btn btn--slate btn--sm"
                >
                  Zoom Out
                </button>
              </div>
            </div>

            {/* Spaceship Telemetry Pod */}
            <div className="hud-panel hud-card">
              <div className="hud-row">
                <div className="hud-location">
                  <span
                    className="hud-dot"
                    style={{ backgroundColor: telemetry.nearestColor }}
                  />
                  <span className="hud-location-name">
                    {telemetry.autopilotName
                      ? `To ${telemetry.autopilotName}`
                      : `Near ${telemetry.nearestName}`}
                  </span>
                </div>
                <span
                  className={`hud-speed${telemetry.isBoosting ? ' is-boosting' : ''}`}
                >
                  {telemetry.isBoosting && (
                    <>
                      <IconFlame size={13} />
                      <span className="hud-speed-tag">
                        {telemetry.scale === 'planetary' ||
                        telemetry.scale === 'solar'
                          ? 'BOOST'
                          : 'WARP'}
                      </span>
                    </>
                  )}
                  <span>{telemetry.speedLabel}</span>
                </span>
              </div>

              <div className="hud-vel-bar">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const filled = telemetry.speedRatio >= (idx + 1) / 10;
                  const segClass = !filled
                    ? 'hud-vel-seg'
                    : telemetry.isBoosting || idx >= 7
                      ? 'hud-vel-seg is-amber'
                      : 'hud-vel-seg is-sky';
                  return <div key={idx} className={segClass} />;
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  setTelemetryExpanded((v) => !v);
                }}
                className="hud-telem-toggle"
              >
                <span className="hud-telem-toggle-label">
                  <IconGauge size={13} className="text-sky" />
                  <span>Telemetry · {telemetry.flightMode}</span>
                </span>
                <span className="hud-telem-hdg">
                  <span>
                    HDG {String(telemetry.headingDeg).padStart(3, '0')}°
                  </span>
                  {telemetryExpanded ? (
                    <IconChevronUp size={13} />
                  ) : (
                    <IconChevronDown size={13} />
                  )}
                </span>
              </button>

              {telemetryExpanded && (
                <div className="hud-telem-grid">
                  <div>
                    <span className="hud-telem-key">Altitude</span>
                    <span className="hud-telem-val">
                      {formatCosmicDistance(telemetry.altitudeUnits)}
                    </span>
                  </div>
                  <div>
                    <span className="hud-telem-key">Accel</span>
                    <span
                      className={`hud-telem-val${
                        telemetry.accelerationUnits > 1.5
                          ? ' hud-telem-val--pos'
                          : telemetry.accelerationUnits < -1.5
                            ? ' hud-telem-val--neg'
                            : ''
                      }`}
                    >
                      {telemetry.accelerationUnits >= 0 ? '+' : ''}
                      {telemetry.accelerationUnits.toFixed(1)} u/s²
                    </span>
                  </div>
                  <div className="hud-telem-span">
                    <span className="hud-telem-key">Coords</span>
                    <span className="hud-telem-val text-sky">
                      X:{telemetry.coords.x} · Y:{telemetry.coords.y} · Z:
                      {telemetry.coords.z}
                    </span>
                  </div>
                  {lockedBody && telemetry.lockedDistanceUnits !== null && (
                    <div className="hud-telem-span hud-telem-target">
                      <span className="hud-telem-key">
                        Target: {lockedBody.name}
                      </span>
                      <span className="hud-telem-val text-amber">
                        {formatCosmicDistance(telemetry.lockedDistanceUnits)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Explorer Discovery Progress */}
            <button
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onOpenJournal();
              }}
              className="hud-panel hud-progress-btn"
            >
              <div className="hud-row">
                <span className="hud-progress-label">
                  <IconAward size={14} className="text-amber" />
                  <span>Discoveries</span>
                </span>
                <span className="hud-progress-count">
                  {discoveredCount}/{totalCount}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </button>
          </div>

          {/* Top-Center: Precision Scrolling Azimuth Heading Tape & Target Action Bar */}
          <div className="hud-center-col">
            <div className="hud-panel azimuth-tape">
              {/* Center Heading Readout Badge */}
              <div className="azimuth-tape__lubber">
                <span className="azimuth-tape__hdg-badge">
                  {String(telemetry.headingDeg).padStart(3, '0')}°
                </span>
              </div>

              {/* Upper Degree Scale Ticks */}
              <div className="azimuth-tape__scale">
                {telemetry.azimuthTicks.map((tick) => (
                  <div
                    key={tick.deg}
                    className="azimuth-tape__tick"
                    style={{ left: `${tick.leftPct}%` }}
                  >
                    {tick.label && (
                      <span
                        className={`azimuth-tape__tick-label${tick.isCardinal ? ' is-cardinal' : ''}`}
                      >
                        {tick.label}
                      </span>
                    )}
                    <span
                      className={`azimuth-tape__tick-line${tick.isMajor ? ' is-major' : ''}`}
                    />
                  </div>
                ))}
              </div>

              {/* Lower Interactive Celestial Bearing Markers */}
              <div className="azimuth-tape__bodies">
                {telemetry.compassPips.map((pip) => (
                  <button
                    key={pip.id}
                    type="button"
                    onClick={() => {
                      spaceAudio.playSelect();
                      onSelectCompassBody(pip.id);
                    }}
                    style={{ left: `${pip.offsetPct}%` }}
                    className="azimuth-pip"
                  >
                    <span
                      className="azimuth-pip__dot"
                      style={{ backgroundColor: pip.color }}
                    />
                    <span style={{ color: pip.color }}>{pip.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {lockedBody && (
              <div className="hud-panel hud-panel--accent target-bar">
                <IconCrosshair size={14} style={{ color: lockedBody.color }} />
                <div className="target-bar__info">
                  <span className="target-bar__name">{lockedBody.name}</span>
                  {telemetry.lockedDistanceUnits !== null && (
                    <span className="target-bar__dist">
                      {formatCosmicDistance(telemetry.lockedDistanceUnits)}
                    </span>
                  )}
                </div>

                <div className="target-bar__actions">
                  {autopilotTargetId === lockedBody.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        spaceAudio.playClick();
                        onCancelAutopilot();
                      }}
                      className="btn btn--slate btn--sm text-amber"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        spaceAudio.playWarpChime();
                        onSelectCompassBody(lockedBody.id);
                      }}
                      className="btn btn--sky btn--sm"
                    >
                      <IconNavigation size={12} />
                      <span>Fly</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      spaceAudio.playWarpChime();
                      onEnterSurfaceExplore(lockedBody.id);
                    }}
                    title="Inspect up close"
                    className="btn btn--amber btn--sm"
                  >
                    <IconCompass size={12} />
                    <span>Orbit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      spaceAudio.playSelect();
                      onInspectBodyFacts(lockedBody.id);
                    }}
                    title="Open object details"
                    className="btn btn--slate btn--sm"
                  >
                    <IconInfo size={12} className="text-sky" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      spaceAudio.playClick();
                      onUnlockTarget();
                    }}
                    aria-label="Unlock target"
                    title="Unlock target"
                    className="btn btn--slate btn--sm"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Top-Right: Precision Astrometric Radar Scope */}
          <div className="hud-panel radar-pod">
            <div className="radar-tabs">
              {(
                [
                  { id: 'local', label: 'Local' },
                  { id: 'system', label: 'System' },
                  { id: 'galaxy', label: 'Galaxy' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    spaceAudio.playClick();
                    setRadarMode(mode.id);
                  }}
                  className={`radar-tab${radarMode === mode.id ? ' is-active' : ''}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <svg
              width="126"
              height="126"
              viewBox="0 0 126 126"
              className="radar-svg"
              aria-label="Astrometric navigation radar scope"
            >
              <defs>
                <radialGradient id="radarScopeBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#071122" />
                  <stop offset="100%" stopColor="#02050B" />
                </radialGradient>
                <linearGradient id="sensorCone" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Outer Instrument Bezel */}
              <circle
                cx="63"
                cy="63"
                r="58.5"
                fill="url(#radarScopeBg)"
                stroke="rgba(148, 163, 184, 0.34)"
                strokeWidth="1.2"
              />

              {/* Concentric Range Rings */}
              <circle
                cx="63"
                cy="63"
                r="42"
                fill="none"
                stroke="rgba(56, 189, 248, 0.16)"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
              <circle
                cx="63"
                cy="63"
                r="24"
                fill="none"
                stroke="rgba(56, 189, 248, 0.18)"
                strokeWidth="0.8"
              />

              {/* Subtle Astrometric Crosshair Axes */}
              <line
                x1="12"
                y1="63"
                x2="114"
                y2="63"
                stroke="rgba(148, 163, 184, 0.14)"
                strokeWidth="0.7"
              />
              <line
                x1="63"
                y1="12"
                x2="63"
                y2="114"
                stroke="rgba(148, 163, 184, 0.14)"
                strokeWidth="0.7"
              />

              {/* 360° Radial Degree Ticks */}
              {RADAR_TICKS.map((t) => (
                <line
                  key={t.deg}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={
                    t.isCardinal
                      ? 'rgba(125, 211, 252, 0.72)'
                      : 'rgba(148, 163, 184, 0.35)'
                  }
                  strokeWidth={t.isCardinal ? '1.2' : '0.8'}
                />
              ))}

              {/* Subtle Cardinal Letters */}
              <text
                x="63"
                y="18.5"
                textAnchor="middle"
                fontSize="6.5"
                fontFamily="JetBrains Mono, monospace"
                fill="#7DD3FC"
              >
                N
              </text>
              <text
                x="108"
                y="65.2"
                textAnchor="middle"
                fontSize="6"
                fontFamily="JetBrains Mono, monospace"
                fill="#64748B"
              >
                E
              </text>
              <text
                x="63"
                y="112"
                textAnchor="middle"
                fontSize="6"
                fontFamily="JetBrains Mono, monospace"
                fill="#64748B"
              >
                S
              </text>
              <text
                x="18"
                y="65.2"
                textAnchor="middle"
                fontSize="6"
                fontFamily="JetBrains Mono, monospace"
                fill="#64748B"
              >
                W
              </text>

              {/* Galactic Arm Arc in Galaxy Mode */}
              {radarMode === 'galaxy' && (
                <circle
                  cx="63"
                  cy="63"
                  r="27"
                  fill="none"
                  stroke="#38BDF8"
                  strokeOpacity="0.18"
                  strokeWidth="7"
                  strokeDasharray="11 8"
                />
              )}

              {/* Sensor Heading Field-of-View Cone */}
              <g
                transform={`translate(${telemetry.shipRadar.x}, ${telemetry.shipRadar.y}) rotate(${telemetry.shipRadar.yawDeg})`}
              >
                <path d="M 0 0 L -13 -28 A 31 31 0 0 1 13 -28 Z" fill="url(#sensorCone)" />
              </g>

              {/* Dashed Bearing Line to Locked Target */}
              {telemetry.lockedRadarPos && (
                <line
                  x1={telemetry.shipRadar.x}
                  y1={telemetry.shipRadar.y}
                  x2={telemetry.lockedRadarPos.x}
                  y2={telemetry.lockedRadarPos.y}
                  stroke="#38BDF8"
                  strokeWidth="1"
                  strokeDasharray="2.5 2.5"
                  opacity="0.8"
                />
              )}

              {/* Clickable Celestial Body Glyphs (distinct shapes for satellites, ringed worlds, stars, planets) */}
              {telemetry.radarDots.map((dot) => (
                <g
                  key={dot.id}
                  onClick={() => {
                    spaceAudio.playSelect();
                    onLockRadarBody(dot.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`Lock ${dot.name}`}</title>
                  {dot.isLocked && (
                    <g
                      transform={`translate(${dot.x}, ${dot.y})`}
                      stroke="#38BDF8"
                      strokeWidth="1.2"
                      fill="none"
                    >
                      <path
                        d={`M ${-dot.size - 3} ${-dot.size - 1} V ${-dot.size - 3} H ${-dot.size - 1}
                            M ${dot.size + 1} ${-dot.size - 3} H ${dot.size + 3} V ${-dot.size - 1}
                            M ${-dot.size - 3} ${dot.size + 1} V ${dot.size + 3} H ${-dot.size - 1}
                            M ${dot.size + 1} ${dot.size + 3} H ${dot.size + 3} V ${dot.size + 1}`}
                      />
                    </g>
                  )}
                  {/* Generous click hit target */}
                  <circle cx={dot.x} cy={dot.y} r="5.5" fill="transparent" />

                  {dot.type === 'Artificial satellite' ? (
                    <rect
                      x={dot.x - 2.1}
                      y={dot.y - 2.1}
                      width="4.2"
                      height="4.2"
                      transform={`rotate(45 ${dot.x} ${dot.y})`}
                      fill="none"
                      stroke={dot.color}
                      strokeWidth="1.2"
                    />
                  ) : dot.id === 'sun' || dot.scaleTier === 'interstellar' ? (
                    <g>
                      <circle cx={dot.x} cy={dot.y} r={dot.size} fill={dot.color} />
                      <line
                        x1={dot.x - dot.size - 2}
                        y1={dot.y}
                        x2={dot.x + dot.size + 2}
                        y2={dot.y}
                        stroke={dot.color}
                        strokeWidth="0.9"
                        opacity="0.7"
                      />
                      <line
                        x1={dot.x}
                        y1={dot.y - dot.size - 2}
                        x2={dot.x}
                        y2={dot.y + dot.size + 2}
                        stroke={dot.color}
                        strokeWidth="0.9"
                        opacity="0.7"
                      />
                    </g>
                  ) : (
                    <g>
                      {dot.hasRings && (
                        <ellipse
                          cx={dot.x}
                          cy={dot.y}
                          rx={dot.size + 2.8}
                          ry={dot.size * 0.48}
                          fill="none"
                          stroke={dot.color}
                          strokeWidth="0.9"
                          opacity="0.75"
                        />
                      )}
                      <circle cx={dot.x} cy={dot.y} r={dot.size} fill={dot.color} />
                    </g>
                  )}
                </g>
              ))}

              {/* Sleek Aerospace Delta-Wing Craft Vector Icon */}
              <g
                transform={`translate(${telemetry.shipRadar.x}, ${telemetry.shipRadar.y}) rotate(${telemetry.shipRadar.yawDeg})`}
              >
                <path
                  d="M 0 -5.6 L 3.8 4.2 L 1.2 2.4 L 0 4.6 L -1.2 2.4 L -3.8 4.2 Z"
                  fill="#38BDF8"
                  stroke="#F8FAFC"
                  strokeWidth="0.7"
                />
              </g>
            </svg>

            <div className="radar-range-row">
              <span>RNG</span>
              <span className="text-sky">{RADAR_RANGE_LABEL[radarMode]}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onOpenMap();
              }}
              className="btn btn--slate radar-map-btn"
            >
              <IconSliders size={12} />
              <span>Full Map</span>
            </button>
          </div>
        </div>
      )}

      {/* New Discovery Celebration Toast */}
      {recentBody && (
        <div className="toast-wrap animate-enter">
          <div className="hud-panel hud-panel--amber toast-card">
            <div className="toast-badge-icon">
              <IconAward size={19} />
            </div>
            <div>
              <p className="toast-kicker">New Cosmic Discovery</p>
              <p className="toast-title">
                {recentBody.name} — {recentBody.badgeTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Autopilot Arrival Toast */}
      {arrivalBody && (
        <div className="toast-wrap animate-enter">
          <div className="hud-panel hud-panel--accent toast-card">
            <IconCheck size={17} className="text-sky" />
            <p className="toast-title">Arrived at {arrivalBody.name}</p>
          </div>
        </div>
      )}

      {/* Proximity Approach Prompt */}
      {showApproachPrompt && (
        <div className="approach-prompt animate-enter">
          <div className="hud-panel approach-prompt__inner">
            <div className="approach-prompt__meta">
              <span
                className="hud-dot"
                style={{ backgroundColor: telemetry.nearestColor }}
              />
              <span className="approach-prompt__name">
                Approaching {telemetry.nearestName}
              </span>
              <span className="approach-prompt__dist">
                · {formatCosmicDistance(telemetry.nearestDistanceUnits)}
              </span>
            </div>

            <div className="approach-prompt__actions">
              <button
                type="button"
                onClick={() => {
                  spaceAudio.playWarpChime();
                  onEnterSurfaceExplore(telemetry.nearestId);
                }}
                className="btn btn--amber btn--sm"
              >
                <IconCompass size={13} />
                <span>Explore Closer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  spaceAudio.playSelect();
                  onInspectBodyFacts(telemetry.nearestId);
                }}
                className="btn btn--slate btn--sm"
              >
                <IconInfo size={13} className="text-sky" />
                <span>Facts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Command Dock */}
      {surfaceBody ? (
        <div className="hud-dock-wrap">
          <div className="hud-panel hud-dock">
            <button
              type="button"
              onClick={() => handleSurfaceZoom(-1)}
              aria-label="Zoom closer"
              className="btn btn--slate btn--md"
            >
              <IconZoomIn size={15} className="text-sky" />
              <span>Closer</span>
            </button>

            <button
              type="button"
              onClick={() => handleSurfaceZoom(1)}
              aria-label="Zoom wider"
              className="btn btn--slate btn--md"
            >
              <IconZoomOut size={15} className="text-sky" />
              <span>Wider</span>
            </button>

            <button
              type="button"
              onClick={() => {
                spaceAudio.playSelect();
                onInspectBodyFacts(surfaceBody.id);
              }}
              className="btn btn--sky btn--md"
            >
              <IconInfo size={15} />
              <span>Facts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onExitSurfaceExplore();
              }}
              className="btn btn--amber btn--md"
            >
              <IconArrowLeft size={15} />
              <span>Return to Space</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="hud-dock-wrap">
          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              setDockCollapsed((c) => !c);
            }}
            aria-label={dockCollapsed ? 'Show toolbar' : 'Collapse toolbar'}
            className="hud-panel btn hud-dock-toggle"
          >
            {dockCollapsed ? (
              <>
                <IconChevronUp size={13} className="text-sky" />
                <span>Controls</span>
              </>
            ) : (
              <>
                <IconChevronDown size={13} className="text-sky" />
                <span>Minimize Bar</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <nav aria-label="Spaceship toolbar" className="hud-panel hud-dock">
              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onOpenMap();
                }}
                className="btn btn--sky btn--md"
              >
                <IconMap size={15} />
                <span>Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onOpenJournal();
                }}
                className="btn btn--slate btn--md"
              >
                <IconBook size={15} className="text-amber" />
                <span>Journal</span>
              </button>

              {nextUndiscovered && (
                <button
                  type="button"
                  onClick={() => {
                    spaceAudio.playWarpChime();
                    onSelectCompassBody(nextUndiscovered.id);
                  }}
                  title={`Fly to ${nextUndiscovered.name}`}
                  className="btn btn--amber btn--md"
                >
                  <IconNavigation size={14} />
                  <span>Next: {nextUndiscovered.name}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onToggleCameraMode();
                }}
                title="Switch 3rd-person / Cockpit camera (V)"
                className="btn btn--slate btn--md"
              >
                <IconEye size={15} className="text-sky" />
                <span>
                  {cameraMode === 'third-person' ? '3rd Person' : 'Cockpit'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onResetView();
                }}
                title="Return near Earth"
                className="btn btn--slate btn--md"
              >
                <IconReset size={15} />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onToggleHud();
                }}
                title="Hide all HUD overlays (H)"
                aria-label="Hide HUD"
                className="btn btn--slate btn--icon"
              >
                <IconEyeOff size={15} />
              </button>

              <button
                type="button"
                onClick={onToggleSound}
                aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
                className="btn btn--slate btn--icon"
              >
                {soundEnabled ? (
                  <IconVolumeOn size={15} className="text-sky" />
                ) : (
                  <IconVolumeOff size={15} className="text-muted" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onOpenPause();
                }}
                aria-label="Pause and settings"
                className="btn btn--slate btn--icon"
              >
                <IconPause size={15} />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
