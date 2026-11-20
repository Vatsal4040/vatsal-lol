import { useEffect, useState } from 'react';
import {
  CELESTIAL_BODIES,
  getCelestialBodyById,
} from '../../data/celestialBodies';
import { formatCosmicDistance } from '../../utils/cosmicScale';
import { worldState } from '../../utils/worldState';
import { PlanetIllustration } from './PlanetIllustration';
import { spaceAudio } from '../../utils/sound';
import {
  IconClose,
  IconCompass,
  IconCrosshair,
  IconLock,
  IconNavigation,
  IconSparkles,
  IconZoomIn,
  IconZoomOut,
} from './Icons';

interface UniverseMapProps {
  discoveredIds: Set<string>;
  selectedId: string | null;
  lockedTargetId: string | null;
  onClose: () => void;
  onFlyTo: (id: string) => void;
  onLockTarget: (id: string) => void;
  onEnterSurfaceExplore: (id: string) => void;
}

type MapZoomPreset = 'inner' | 'solar' | 'deep' | 'universe';

const ZOOM_PRESET_MAX_R: Record<MapZoomPreset, number> = {
  inner: 4200,
  solar: 28500,
  deep: 68000,
  universe: 345000,
};

const MAP_TICKS = Array.from({ length: 36 }, (_, i) => {
  const deg = i * 10;
  const rad = ((deg - 90) * Math.PI) / 180;
  const isCardinal = deg % 90 === 0;
  const isMajor = deg % 30 === 0;
  const inner = isCardinal ? 160 : isMajor ? 164 : 168;
  const outer = 173;
  return {
    deg,
    isCardinal,
    x1: 180 + Math.cos(rad) * inner,
    y1: 180 + Math.sin(rad) * inner,
    x2: 180 + Math.cos(rad) * outer,
    y2: 180 + Math.sin(rad) * outer,
  };
});

interface LiveMapCoords {
  positions: Record<string, { x: number; y: number; inView: boolean }>;
  distances: Record<string, number>;
  ship: { x: number; y: number; yaw: number; inView: boolean };
}

function computeMapCoords(maxR: number): LiveMapCoords {
  const center = 180;
  const scale = 154 / maxR;
  const positions: Record<string, { x: number; y: number; inView: boolean }> = {};
  const distances: Record<string, number> = {};

  for (const body of CELESTIAL_BODIES) {
    const p = worldState.planetPositions[body.id];
    if (p) {
      const x = center + p.x * scale;
      const y = center + p.z * scale;
      const rFromCenter = Math.hypot(x - center, y - center);
      positions[body.id] = {
        x,
        y,
        inView: rFromCenter <= 162,
      };
      distances[body.id] = Math.max(
        0,
        worldState.shipPosition.distanceTo(p) - body.radius
      );
    }
  }

  const sx = center + worldState.shipPosition.x * scale;
  const sy = center + worldState.shipPosition.z * scale;
  const shipDist = Math.hypot(sx - center, sy - center);
  const clampedShipX =
    shipDist > 156 ? center + ((sx - center) / shipDist) * 156 : sx;
  const clampedShipY =
    shipDist > 156 ? center + ((sy - center) / shipDist) * 156 : sy;

  return {
    positions,
    distances,
    ship: {
      x: clampedShipX,
      y: clampedShipY,
      yaw: worldState.shipYaw,
      inView: shipDist <= 160,
    },
  };
}

export function UniverseMap({
  discoveredIds,
  selectedId,
  lockedTargetId,
  onClose,
  onFlyTo,
  onLockTarget,
  onEnterSurfaceExplore,
}: UniverseMapProps) {
  const initialMaxR =
    worldState.explorationScale === 'universe' ||
    worldState.explorationScale === 'galactic'
      ? ZOOM_PRESET_MAX_R.universe
      : worldState.explorationScale === 'interstellar'
        ? ZOOM_PRESET_MAX_R.deep
        : ZOOM_PRESET_MAX_R.solar;

  const [maxRadius, setMaxRadius] = useState<number>(initialMaxR);
  const [focusedId, setFocusedId] = useState<string>(
    selectedId ?? lockedTargetId ?? 'earth'
  );
  const [coords, setCoords] = useState<LiveMapCoords>(() =>
    computeMapCoords(initialMaxR)
  );

  useEffect(() => {
    setCoords(computeMapCoords(maxRadius));
    const interval = window.setInterval(() => {
      setCoords(computeMapCoords(maxRadius));
    }, 180);
    return () => window.clearInterval(interval);
  }, [maxRadius]);

  const visibleBodies = CELESTIAL_BODIES.filter(
    (b) => !b.isHidden || discoveredIds.has(b.id)
  );
  const hiddenRemaining = CELESTIAL_BODIES.filter(
    (b) => b.isHidden && !discoveredIds.has(b.id)
  ).length;

  const focusedBody = getCelestialBodyById(focusedId) ?? visibleBodies[0];

  const handleZoomStep = (factor: number) => {
    spaceAudio.playClick();
    setMaxRadius((prev) =>
      Math.max(1200, Math.min(390000, Math.round(prev * factor)))
    );
  };

  const applyPreset = (preset: MapZoomPreset) => {
    spaceAudio.playClick();
    setMaxRadius(ZOOM_PRESET_MAX_R[preset]);
  };

  const isCosmicView = maxRadius > 32000;

  return (
    <div className="modal-backdrop">
      <div className="hud-panel--modal map-modal animate-enter">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Cosmic Universe Map</h2>
            <p className="modal-subtitle">
              Switch scales from Inner Orbits &amp; Satellites to Deep Space Stars &amp; Distant Galaxies.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              onClose();
            }}
            aria-label="Close universe map"
            className="btn btn--slate btn--icon"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="map-modal__content space-scroll">
          {/* Left: Precision Astrometric Cosmic Chart */}
          <div className="map-chart-col">
            <div className="map-toolbar">
              <div className="map-presets">
                {(
                  [
                    { id: 'inner', label: 'Inner' },
                    { id: 'solar', label: 'Solar' },
                    { id: 'deep', label: 'Deep Space' },
                    { id: 'universe', label: 'Universe' },
                  ] as const
                ).map((preset) => {
                  const target = ZOOM_PRESET_MAX_R[preset.id];
                  const active = Math.abs(maxRadius - target) / target < 0.25;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`map-preset-btn${active ? ' is-active' : ''}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleZoomStep(0.62)}
                  aria-label="Zoom in map"
                  className="btn btn--slate btn--icon-sm"
                >
                  <IconZoomIn size={15} className="text-sky" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoomStep(1.6)}
                  aria-label="Zoom out map"
                  className="btn btn--slate btn--icon-sm"
                >
                  <IconZoomOut size={15} className="text-sky" />
                </button>
              </div>
            </div>

            <div className="map-scope-frame">
              <svg viewBox="0 0 360 360" className="map-svg">
                {/* Astrometric Crosshair & Outer Bezel Degree Ticks */}
                <line
                  x1="22"
                  y1="180"
                  x2="338"
                  y2="180"
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                />
                <line
                  x1="180"
                  y1="22"
                  x2="180"
                  y2="338"
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                />
                {MAP_TICKS.map((t) => (
                  <line
                    key={t.deg}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={
                      t.isCardinal
                        ? 'rgba(125, 211, 252, 0.65)'
                        : 'rgba(148, 163, 184, 0.28)'
                    }
                    strokeWidth={t.isCardinal ? '1.4' : '0.9'}
                  />
                ))}

                {isCosmicView && (
                  <>
                    <circle
                      cx="180"
                      cy="180"
                      r="52"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="1"
                      strokeDasharray="3 4"
                    />
                    <circle
                      cx="180"
                      cy="180"
                      r="104"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="1"
                      strokeDasharray="3 4"
                    />
                    <circle
                      cx="180"
                      cy="180"
                      r="154"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="1"
                    />
                    {coords.positions['milky-way-core'] && (
                      <g opacity="0.28">
                        <circle
                          cx={coords.positions['milky-way-core'].x}
                          cy={coords.positions['milky-way-core'].y}
                          r={Math.min(118, (140000 / maxRadius) * 154)}
                          fill="none"
                          stroke="#60A5FA"
                          strokeWidth="12"
                          strokeDasharray="24 14"
                        />
                        <circle
                          cx={coords.positions['milky-way-core'].x}
                          cy={coords.positions['milky-way-core'].y}
                          r={Math.min(70, (72000 / maxRadius) * 154)}
                          fill="none"
                          stroke="#A78BFA"
                          strokeWidth="7"
                          strokeDasharray="16 10"
                        />
                      </g>
                    )}
                  </>
                )}

                {!isCosmicView &&
                  CELESTIAL_BODIES.filter(
                    (b) => b.orbitRadius > 0 && !b.parentId && !b.isHidden
                  ).map((b) => {
                    const ringR = (b.orbitRadius / maxRadius) * 154;
                    if (ringR > 168 || ringR < 3) return null;
                    return (
                      <circle
                        key={b.id}
                        cx="180"
                        cy="180"
                        r={ringR}
                        fill="none"
                        stroke={
                          focusedId === b.id
                            ? b.color
                            : b.id === 'asteroid-belt'
                              ? '#64748B'
                              : '#263449'
                        }
                        strokeWidth={
                          b.id === 'asteroid-belt'
                            ? 4
                            : focusedId === b.id
                              ? 1.5
                              : 1
                        }
                        strokeDasharray={
                          b.id === 'asteroid-belt' ? '2 4' : undefined
                        }
                        opacity={
                          focusedId === b.id
                            ? 0.85
                            : b.id === 'asteroid-belt'
                              ? 0.4
                              : 0.55
                        }
                      />
                    );
                  })}

                {visibleBodies.map((body) => {
                  const pt = coords.positions[body.id];
                  if (!pt || !pt.inView) return null;

                  const isCosmicBody =
                    body.scaleTier === 'interstellar' ||
                    body.scaleTier === 'galactic' ||
                    body.scaleTier === 'universe';

                  if (isCosmicView && !isCosmicBody && body.id !== 'sun') {
                    return null;
                  }
                  // Keep moons & artificial satellites uncluttered unless zoomed in
                  if (body.parentId && maxRadius > 5500) return null;

                  const dotR =
                    body.scaleTier === 'universe'
                      ? 10
                      : body.scaleTier === 'galactic'
                        ? 9
                        : body.scaleTier === 'interstellar'
                          ? 7.2
                          : body.id === 'sun'
                            ? isCosmicView
                              ? 6
                              : 10.5
                            : body.id === 'jupiter' || body.id === 'saturn'
                              ? 7.5
                              : body.parentId
                                ? 3.4
                                : 5.4;

                  const isFocused = focusedId === body.id;
                  const isLocked = lockedTargetId === body.id;

                  const showLabel =
                    body.id !== 'asteroid-belt' &&
                    (!body.parentId || isFocused) &&
                    (isCosmicView ||
                      maxRadius <= 6500 ||
                      body.id === 'sun' ||
                      body.id === 'earth' ||
                      body.id === 'mars' ||
                      body.id === 'jupiter' ||
                      body.id === 'saturn' ||
                      body.id === 'uranus' ||
                      body.id === 'neptune' ||
                      body.id === 'pluto' ||
                      body.isHidden ||
                      isFocused);

                  const shortName =
                    body.name === 'The Sun'
                      ? isCosmicView
                        ? 'Solar System'
                        : 'Sun'
                      : body.name === 'The Moon'
                        ? 'Moon'
                        : body.name === 'Voyager Star Probe'
                          ? 'Voyager'
                          : body.name === "Halley's Comet"
                            ? 'Halley'
                            : body.name === 'Andromeda Galaxy'
                              ? 'Andromeda'
                              : body.name === 'Whirlpool Galaxy'
                                ? 'Whirlpool'
                                : body.name;

                  return (
                    <g
                      key={body.id}
                      onClick={() => {
                        spaceAudio.playSelect();
                        setFocusedId(body.id);
                      }}
                      onDoubleClick={() => {
                        spaceAudio.playWarpChime();
                        onFlyTo(body.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {(isFocused || isLocked) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={dotR + 5}
                          fill="none"
                          stroke={isFocused ? '#38BDF8' : '#FBBF24'}
                          strokeWidth="1.8"
                          strokeDasharray={isLocked && !isFocused ? '3 2' : undefined}
                        />
                      )}
                      {(body.id === 'saturn' || body.scaleTier === 'universe') && (
                        <ellipse
                          cx={pt.x}
                          cy={pt.y}
                          rx={dotR + 6}
                          ry={dotR * 0.48}
                          fill="none"
                          stroke={body.scaleTier === 'universe' ? body.color : '#FDE68A'}
                          strokeWidth="1.5"
                          opacity="0.85"
                        />
                      )}
                      {body.type === 'Artificial satellite' ? (
                        <rect
                          x={pt.x - 3}
                          y={pt.y - 3}
                          width="6"
                          height="6"
                          transform={`rotate(45 ${pt.x} ${pt.y})`}
                          fill="#020617"
                          stroke={body.color}
                          strokeWidth="1.6"
                        />
                      ) : (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={dotR}
                          fill={body.color}
                          stroke="#000000"
                          strokeWidth="1.2"
                        />
                      )}
                      {showLabel && (
                        <text
                          x={pt.x}
                          y={pt.y - dotR - 4}
                          textAnchor="middle"
                          fontSize={isFocused ? '10.5' : '9.2'}
                          fontWeight={isFocused ? '700' : '600'}
                          fill={isFocused ? '#FFFFFF' : '#CBD5E1'}
                          stroke="#000000"
                          strokeWidth="2.8"
                          paintOrder="stroke"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {shortName}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Sleek Delta Spacecraft Marker */}
                <g
                  transform={`translate(${coords.ship.x}, ${coords.ship.y}) rotate(${
                    (-coords.ship.yaw * 180) / Math.PI + 180
                  })`}
                >
                  <path
                    d="M 0 -9 L 5.5 6.5 L 1.6 3.5 L 0 6.8 L -1.6 3.5 L -5.5 6.5 Z"
                    fill="#38BDF8"
                    stroke="#FFFFFF"
                    strokeWidth="1.1"
                  />
                </g>
              </svg>
            </div>

            {focusedBody && (
              <div className="hud-panel map-focus-bar">
                <div style={{ minWidth: 0 }}>
                  <p
                    className="font-display"
                    style={{
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {focusedBody.name}
                  </p>
                  <p
                    className="font-mono text-muted"
                    style={{
                      fontSize: '11.5px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatCosmicDistance(coords.distances[focusedBody.id] ?? 0)} ·{' '}
                    {focusedBody.type}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      spaceAudio.playSelect();
                      onLockTarget(focusedBody.id);
                    }}
                    title="Lock target on HUD"
                    className="btn btn--slate btn--icon-sm"
                  >
                    <IconCrosshair size={14} className="text-sky" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      spaceAudio.playWarpChime();
                      onEnterSurfaceExplore(focusedBody.id);
                    }}
                    title="Inspect up close"
                    className="btn btn--slate btn--sm"
                  >
                    <IconCompass size={13} className="text-amber" />
                    <span>Orbit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      spaceAudio.playWarpChime();
                      onFlyTo(focusedBody.id);
                    }}
                    className="btn btn--amber btn--sm"
                  >
                    <IconNavigation size={13} />
                    <span>Fly</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Multi-Scale Destination Cards List */}
          <div className="map-list space-scroll">
            {visibleBodies.map((body) => {
              const discovered = discoveredIds.has(body.id);
              const isFocused = focusedId === body.id;
              const liveDist = coords.distances[body.id] ?? 0;
              const isCosmicBody =
                body.scaleTier === 'interstellar' ||
                body.scaleTier === 'galactic' ||
                body.scaleTier === 'universe';

              return (
                <div
                  key={body.id}
                  onClick={() => {
                    spaceAudio.playSelect();
                    setFocusedId(body.id);
                    if (body.scaleTier === 'universe' || body.scaleTier === 'galactic') {
                      setMaxRadius(ZOOM_PRESET_MAX_R.universe);
                    } else if (body.scaleTier === 'interstellar') {
                      setMaxRadius(ZOOM_PRESET_MAX_R.deep);
                    } else if (body.parentId === 'earth') {
                      setMaxRadius(ZOOM_PRESET_MAX_R.inner);
                    } else if (maxRadius > 32000) {
                      setMaxRadius(ZOOM_PRESET_MAX_R.solar);
                    }
                  }}
                  className={`map-list-item${isFocused ? ' is-focused' : ''}`}
                >
                  <div className="map-list-item__thumb">
                    <PlanetIllustration id={body.id} size={36} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span
                        className="font-display"
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {body.name}
                      </span>
                      {isCosmicBody && (
                        <span
                          className="font-display text-purple"
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {body.scaleTier === 'universe'
                            ? 'Galaxy'
                            : body.scaleTier === 'galactic'
                              ? 'Core'
                              : 'Star System'}
                        </span>
                      )}
                      {body.type === 'Artificial satellite' && (
                        <span
                          className="font-display text-sky"
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Satellite
                        </span>
                      )}
                      {discovered && (
                        <span className="text-amber" style={{ fontSize: '12px' }}>
                          ★
                        </span>
                      )}
                    </div>
                    <p
                      className="font-mono text-muted"
                      style={{
                        fontSize: '11.5px',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {body.type} · {formatCosmicDistance(liveDist)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      spaceAudio.playWarpChime();
                      onFlyTo(body.id);
                    }}
                    className="btn btn--ghost-sky btn--sm"
                  >
                    <IconNavigation size={13} />
                    <span>Fly</span>
                  </button>
                </div>
              );
            })}

            {hiddenRemaining > 0 && (
              <div className="map-hidden-banner">
                <div className="toast-badge-icon">
                  <IconLock size={18} />
                </div>
                <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  <p
                    className="text-amber"
                    style={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <IconSparkles size={14} />
                    <span>
                      {hiddenRemaining} Hidden Cosmic{' '}
                      {hiddenRemaining === 1 ? 'Wonder' : 'Wonders'} Left to Find
                    </span>
                  </p>
                  <p className="text-muted">
                    Explore high above Jupiter and far beyond Neptune to spot secret
                    space travelers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
