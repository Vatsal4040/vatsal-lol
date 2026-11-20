import { useEffect, useMemo, useState } from 'react';
import {
  CELESTIAL_BODIES,
  CelestialBodyData,
} from '../../data/celestialBodies';
import { formatCosmicDistance } from '../../utils/cosmicScale';
import { worldState } from '../../utils/worldState';
import { PlanetIllustration } from './PlanetIllustration';
import { spaceAudio } from '../../utils/sound';
import {
  IconAward,
  IconBook,
  IconCalendar,
  IconCheck,
  IconClock,
  IconClose,
  IconCompass,
  IconCrosshair,
  IconHourglass,
  IconInfo,
  IconNavigation,
  IconOrbit,
  IconRocket,
  IconRuler,
  IconSparkles,
  IconSun,
  IconThermometer,
  IconVolumeOff,
  IconVolumeOn,
} from './Icons';

interface PlanetInfoPanelProps {
  body: CelestialBodyData;
  isDiscovered: boolean;
  discoveredCount: number;
  totalCount: number;
  isLocked: boolean;
  isAutopilotingToThis: boolean;
  isSurfaceExploringThis: boolean;
  onClose: () => void;
  onExplorePlanet: (id: string) => void;
  onCancelAutopilot: () => void;
  onLockTarget: (id: string) => void;
  onUnlockTarget: () => void;
  onSelectNearby: (id: string) => void;
  onEnterSurfaceExplore: (id: string) => void;
}

type CardTab = 'overview' | 'facts' | 'discovery' | 'exploration';

export function PlanetInfoPanel({
  body,
  isDiscovered,
  discoveredCount,
  totalCount,
  isLocked,
  isAutopilotingToThis,
  isSurfaceExploringThis,
  onClose,
  onExplorePlanet,
  onCancelAutopilot,
  onLockTarget,
  onUnlockTarget,
  onSelectNearby,
  onEnterSurfaceExplore,
}: PlanetInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<CardTab>('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setActiveTab('overview');
    spaceAudio.stopSpeaking();
    setIsSpeaking(false);
    return () => {
      spaceAudio.stopSpeaking();
    };
  }, [body.id]);

  const nearbyObjects = useMemo(() => {
    const originPos = worldState.planetPositions[body.id];
    if (!originPos) return [];

    return CELESTIAL_BODIES.filter(
      (other) => other.id !== body.id && !other.isHidden
    )
      .map((other) => {
        const pos = worldState.planetPositions[other.id];
        const dist = pos
          ? Math.max(0, originPos.distanceTo(pos) - other.radius - body.radius)
          : Infinity;
        return { other, dist };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
  }, [body.id, body.radius]);

  const liveDistFromShip = useMemo(() => {
    const p = worldState.planetPositions[body.id];
    if (!p) return 0;
    return Math.max(0, worldState.shipPosition.distanceTo(p) - body.radius);
  }, [body.id, body.radius, activeTab]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      spaceAudio.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const script =
      activeTab === 'facts'
        ? `${body.name} fun facts. ${body.funFacts.join(' ')}`
        : activeTab === 'discovery'
          ? `How ${body.name} was discovered. Discovered by ${body.discoveryInfo.discoveredBy}. ${body.discoveryInfo.historicalBackground}`
          : activeTab === 'exploration'
            ? `Exploring ${body.name}. Badge: ${body.badgeTitle}. ${body.discoveryHint}`
            : `${body.name}. ${body.shortTagline} Temperature: ${body.basicInfo.temperature}. ${body.funFacts[0]}`;

    const started = spaceAudio.speak(script, () => setIsSpeaking(false));
    setIsSpeaking(started);
  };

  const basicRows = [
    {
      label:
        body.type === 'Artificial satellite'
          ? 'Orbit Altitude'
          : body.scaleTier === 'interstellar' ||
              body.scaleTier === 'galactic' ||
              body.scaleTier === 'universe'
            ? 'Distance from Earth'
            : 'Distance from Sun',
      value: body.basicInfo.distanceFromSun,
      icon: IconSun,
      accentClass: 'text-amber',
    },
    {
      label: 'Size / Diameter',
      value: body.basicInfo.diameter,
      icon: IconRuler,
      accentClass: 'text-sky',
    },
    {
      label: 'Temperature',
      value: body.basicInfo.temperature,
      icon: IconThermometer,
      accentClass: 'text-orange',
    },
    {
      label:
        body.type === 'Artificial satellite' ? 'Orbit Period' : 'Length of a Day',
      value: body.basicInfo.lengthOfDay,
      icon: IconClock,
      accentClass: 'text-sky',
    },
    {
      label:
        body.type === 'Artificial satellite'
          ? 'Mission Span'
          : 'Length of a Year',
      value: body.basicInfo.lengthOfYear,
      icon: IconCalendar,
      accentClass: 'text-emerald',
    },
    {
      label:
        body.type === 'Artificial satellite'
          ? 'Orbit Host'
          : body.scaleTier === 'interstellar'
            ? 'Exoplanets'
            : body.scaleTier === 'galactic' || body.scaleTier === 'universe'
              ? 'Stars & Systems'
              : 'Moons',
      value: body.basicInfo.moons,
      icon: IconOrbit,
      accentClass: 'text-indigo',
    },
    {
      label: body.type === 'Artificial satellite' ? 'Launch / Era' : 'Age',
      value: body.basicInfo.age,
      icon: IconHourglass,
      accentClass: 'text-amber',
    },
  ];

  const discoveryPct = Math.round(
    (discoveredCount / Math.max(1, totalCount)) * 100
  );

  return (
    <aside
      aria-label={`${body.name} educational card`}
      className="hud-panel--modal info-panel animate-enter"
    >
      {/* Header */}
      <div className="info-panel__header">
        <div className="info-panel__thumb">
          <div className="animate-float-slow">
            <PlanetIllustration id={body.id} size={52} />
          </div>
        </div>

        <div className="info-panel__head-main">
          <div className="info-panel__title-row">
            <h2 className="info-panel__title">{body.name}</h2>
            <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  if (isLocked) {
                    onUnlockTarget();
                  } else {
                    onLockTarget(body.id);
                  }
                }}
                title={isLocked ? 'Unlock target on radar' : 'Lock target on radar'}
                aria-label={isLocked ? 'Unlock target' : 'Lock target'}
                className={`btn btn--icon-sm ${isLocked ? 'btn--sky' : 'btn--slate'}`}
              >
                <IconCrosshair size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  onClose();
                }}
                aria-label="Close planet info"
                className="btn btn--slate btn--icon-sm"
              >
                <IconClose size={16} />
              </button>
            </div>
          </div>

          <div className="info-panel__meta">
            <span style={{ color: body.color, fontWeight: 600 }}>{body.type}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="font-mono text-sky">
              {formatCosmicDistance(liveDistFromShip)}
            </span>
            {isDiscovered && (
              <>
                <span aria-hidden="true" className="text-muted">
                  ·
                </span>
                <span
                  className="text-amber"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                  }}
                >
                  <IconAward size={13} />
                  <span>{body.badgeTitle}</span>
                </span>
              </>
            )}
          </div>

          <p className="info-panel__tagline">{body.shortTagline}</p>
        </div>
      </div>

      {/* 4-Tab Segmented Switcher */}
      <div className="info-tabs-wrap">
        <div className="info-tabs">
          {(
            [
              { id: 'overview', label: 'Overview', icon: IconInfo },
              { id: 'facts', label: 'Facts', icon: IconSparkles },
              { id: 'discovery', label: 'History', icon: IconBook },
              { id: 'exploration', label: 'Explore', icon: IconCompass },
            ] as const
          ).map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                setActiveTab(id);
              }}
              className={`info-tab${activeTab === id ? ' is-active' : ''}`}
            >
              <TabIcon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Educational Body */}
      <div className="info-panel__body space-scroll">
        {activeTab === 'overview' && (
          <dl className="info-dl">
            {basicRows.map(({ label, value, icon: RowIcon, accentClass }) => (
              <div key={label} className="info-dl__row">
                <div className="info-dl__icon">
                  <RowIcon size={14} className={accentClass} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <dt className="info-dl__label">{label}</dt>
                  <dd className="info-dl__value">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}

        {activeTab === 'facts' && (
          <ul className="fact-list">
            {body.funFacts.map((fact, idx) => (
              <li key={idx} className="fact-item">
                <span className="fact-item__num">{idx + 1}</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'discovery' && (
          <div className="history-block">
            <div>
              <h3 className="history-heading">Who Discovered / Built It</h3>
              <p>{body.discoveryInfo.discoveredBy}</p>
            </div>
            <div>
              <h3 className="history-heading">When It Was Discovered</h3>
              <p>{body.discoveryInfo.discoveryDate}</p>
            </div>
            <div>
              <h3 className="history-heading">How It Was Found</h3>
              <p className="text-secondary">{body.discoveryInfo.howDiscovered}</p>
            </div>
            <div className="history-divider">
              <h3 className="history-heading text-amber">
                Story From Space History
              </h3>
              <p className="text-secondary">
                {body.discoveryInfo.historicalBackground}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'exploration' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="explore-card">
              <div className="hud-row">
                <span
                  className="font-display"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {isDiscovered ? (
                    <IconCheck size={15} className="text-emerald" />
                  ) : (
                    <IconAward size={15} className="text-amber" />
                  )}
                  <span>
                    {isDiscovered ? 'Discovered Badge Earned' : 'Explorer Target'}
                  </span>
                </span>
                <span className="font-mono text-amber" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                  {discoveredCount}/{totalCount} ({discoveryPct}%)
                </span>
              </div>
              <p
                className="text-secondary"
                style={{ fontSize: '12px', lineHeight: 1.5, margin: '8px 0' }}
              >
                <strong className="text-amber">{body.badgeTitle}</strong> —{' '}
                {body.discoveryHint}
              </p>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${discoveryPct}%` }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 className="hud-kicker text-sky">Exploration Activities</h3>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playWarpChime();
                  onEnterSurfaceExplore(body.id);
                }}
                className="explore-action"
              >
                <div className="explore-action__icon btn--amber">
                  <IconCompass size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="font-display" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    360° Close Orbital Inspection
                  </p>
                  <p className="text-muted" style={{ fontSize: '11px' }}>
                    Zoom right in to admire terrain, satellites, rings, or spiral arms
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  spaceAudio.playWarpChime();
                  if (isAutopilotingToThis) {
                    onCancelAutopilot();
                  } else {
                    onExplorePlanet(body.id);
                  }
                }}
                className="explore-action"
              >
                <div className="explore-action__icon btn--sky">
                  <IconRocket size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="font-display" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    {isAutopilotingToThis
                      ? 'Cancel Autopilot Cruise'
                      : `Autopilot Cruise to ${body.name}`}
                  </p>
                  <p className="text-muted" style={{ fontSize: '11px' }}>
                    {isAutopilotingToThis
                      ? 'Return flight control to manual steering'
                      : 'Let your starship chart a smooth scenic approach'}
                  </p>
                </div>
              </button>
            </div>

            {nearbyObjects.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <h3 className="hud-kicker text-sky">Nearby Celestial Objects</h3>
                {nearbyObjects.map(({ other, dist }) => (
                  <button
                    key={other.id}
                    type="button"
                    onClick={() => {
                      spaceAudio.playSelect();
                      onSelectNearby(other.id);
                    }}
                    className="nearby-btn"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span
                        className="hud-dot"
                        style={{ backgroundColor: other.color }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p
                          className="font-display"
                          style={{
                            fontWeight: 600,
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {other.name}
                        </p>
                        <p className="text-muted" style={{ fontSize: '10.5px' }}>
                          {other.type}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sky" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {formatCosmicDistance(dist)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="info-panel__footer">
        {!isSurfaceExploringThis && (
          <button
            type="button"
            onClick={() => {
              spaceAudio.playWarpChime();
              onEnterSurfaceExplore(body.id);
            }}
            className="btn btn--amber btn--md"
            style={{ flex: 1 }}
          >
            <IconCompass size={15} />
            <span>Explore Closer</span>
          </button>
        )}

        {!isSurfaceExploringThis && (
          <button
            type="button"
            onClick={() => {
              if (isAutopilotingToThis) {
                spaceAudio.playClick();
                onCancelAutopilot();
              } else {
                spaceAudio.playWarpChime();
                onExplorePlanet(body.id);
              }
            }}
            title={
              isAutopilotingToThis
                ? 'Cancel autopilot'
                : `Fly autopilot to ${body.name}`
            }
            className={`btn btn--md ${
              isAutopilotingToThis ? 'btn--slate text-amber' : 'btn--sky'
            }`}
          >
            <IconNavigation size={15} />
            <span>{isAutopilotingToThis ? 'Cancel' : 'Fly'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleSpeech}
          title={isSpeaking ? 'Stop reading aloud' : 'Read facts aloud'}
          className={`btn btn--md ${isSpeaking ? 'btn--sky' : 'btn--slate'}`}
          style={isSurfaceExploringThis ? { flex: 1 } : undefined}
        >
          {isSpeaking ? (
            <>
              <IconVolumeOff size={15} />
              <span>Stop</span>
            </>
          ) : (
            <>
              <IconVolumeOn size={15} />
              <span>Listen</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
