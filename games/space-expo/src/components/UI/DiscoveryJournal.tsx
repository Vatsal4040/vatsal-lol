import { useState } from 'react';
import {
  CELESTIAL_BODIES,
  DID_YOU_KNOW_FACTS,
} from '../../data/celestialBodies';
import { PlanetIllustration } from './PlanetIllustration';
import { spaceAudio } from '../../utils/sound';
import {
  IconAward,
  IconClose,
  IconCompass,
  IconNavigation,
  IconRefresh,
  IconSparkles,
} from './Icons';

interface DiscoveryJournalProps {
  discoveredIds: Set<string>;
  onClose: () => void;
  onSelectFromJournal: (id: string) => void;
  onEnterSurfaceExplore: (id: string) => void;
}

type JournalFilter =
  | 'all'
  | 'discovered'
  | 'undiscovered'
  | 'worlds'
  | 'satellites'
  | 'cosmic'
  | 'hidden';

export function DiscoveryJournal({
  discoveredIds,
  onClose,
  onSelectFromJournal,
  onEnterSurfaceExplore,
}: DiscoveryJournalProps) {
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length)
  );
  const [filter, setFilter] = useState<JournalFilter>('all');

  const total = CELESTIAL_BODIES.length;
  const found = discoveredIds.size;
  const pct = Math.round((found / total) * 100);

  const isCosmicBody = (tier?: string) =>
    tier === 'interstellar' || tier === 'galactic' || tier === 'universe';

  const isSatelliteBody = (type: string) =>
    type === 'Artificial satellite' || type === 'Natural satellite';

  const filteredBodies = CELESTIAL_BODIES.filter((body) => {
    const unlocked = discoveredIds.has(body.id);
    if (filter === 'discovered') return unlocked;
    if (filter === 'undiscovered') return !unlocked;
    if (filter === 'worlds') {
      return (
        !body.isHidden &&
        !isCosmicBody(body.scaleTier) &&
        !isSatelliteBody(body.type)
      );
    }
    if (filter === 'satellites') return isSatelliteBody(body.type);
    if (filter === 'cosmic') return isCosmicBody(body.scaleTier);
    if (filter === 'hidden') return Boolean(body.isHidden);
    return true;
  });

  const nextFact = () => {
    spaceAudio.playClick();
    setFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
  };

  const filterTabs: { id: JournalFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: total },
    { id: 'discovered', label: 'Discovered', count: found },
    { id: 'undiscovered', label: 'Undiscovered', count: total - found },
    {
      id: 'worlds',
      label: 'Solar Worlds',
      count: CELESTIAL_BODIES.filter(
        (b) =>
          !b.isHidden &&
          !isCosmicBody(b.scaleTier) &&
          !isSatelliteBody(b.type)
      ).length,
    },
    {
      id: 'satellites',
      label: 'Satellites & Moons',
      count: CELESTIAL_BODIES.filter((b) => isSatelliteBody(b.type)).length,
    },
    {
      id: 'cosmic',
      label: 'Cosmic Systems',
      count: CELESTIAL_BODIES.filter((b) => isCosmicBody(b.scaleTier)).length,
    },
    {
      id: 'hidden',
      label: 'Hidden Wonders',
      count: CELESTIAL_BODIES.filter((b) => b.isHidden).length,
    },
  ];

  return (
    <div className="modal-backdrop">
      <div className="hud-panel--modal journal-modal animate-enter">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Space Discovery Journal</h2>
            <div
              className="modal-subtitle"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
            >
              <span className="font-mono text-amber" style={{ fontWeight: 600 }}>
                {found} of {total} Discovered ({pct}%)
              </span>
              <span aria-hidden="true">·</span>
              <span>Collect all Explorer Badges</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              onClose();
            }}
            aria-label="Close discovery journal"
            className="btn btn--slate btn--icon"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="journal-controls">
          <div className="progress-track progress-track--lg">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="journal-filters space-scroll">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  setFilter(tab.id);
                }}
                className={`btn btn--sm ${
                  filter === tab.id ? 'btn--sky' : 'btn--slate'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono" style={{ opacity: 0.8 }}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="journal-body space-scroll">
          <div className="journal-dyk">
            <div>
              <div
                className="text-sky"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                <IconSparkles size={15} />
                <span>Did You Know?</span>
              </div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.55 }}>
                {DID_YOU_KNOW_FACTS[factIndex]}
              </p>
            </div>
            <button
              type="button"
              onClick={nextFact}
              className="btn btn--slate btn--md"
            >
              <IconRefresh size={14} />
              <span>Another Fact</span>
            </button>
          </div>

          {filteredBodies.length === 0 ? (
            <div
              className="explore-card"
              style={{ padding: '28px', textAlign: 'center' }}
            >
              <IconAward size={30} className="text-amber" />
              <p
                className="font-display"
                style={{ fontWeight: 700, fontSize: '18px', marginTop: '8px' }}
              >
                {filter === 'undiscovered'
                  ? 'Every Single World Discovered!'
                  : 'No worlds in this tab yet'}
              </p>
              <p className="text-muted" style={{ fontSize: '13.5px', marginTop: '4px' }}>
                {filter === 'undiscovered'
                  ? 'You are a Master Universe Explorer! Visit any planet or satellite anytime to explore up close.'
                  : 'Fly around the solar system and click planets or satellites to unlock badges here.'}
              </p>
            </div>
          ) : (
            <div className="journal-grid">
              {filteredBodies.map((body) => {
                const unlocked = discoveredIds.has(body.id);
                return (
                  <div
                    key={body.id}
                    className={`journal-card${unlocked ? '' : ' is-locked'}`}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                        <div className="journal-card__thumb">
                          <PlanetIllustration
                            id={body.id}
                            size={46}
                            locked={!unlocked}
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3
                            className="font-display"
                            style={{
                              fontWeight: 700,
                              fontSize: '15.5px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {unlocked
                              ? body.name
                              : body.isHidden
                                ? 'Hidden Wonder'
                                : body.name}
                          </h3>
                          <p className="text-muted" style={{ fontSize: '11.5px' }}>
                            {body.type}
                          </p>
                          {unlocked ? (
                            <p
                              className="text-amber"
                              style={{
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                              }}
                            >
                              <IconAward size={13} />
                              <span>{body.badgeTitle}</span>
                            </p>
                          ) : (
                            <p
                              className="text-muted"
                              style={{ marginTop: '4px', fontSize: '11.5px' }}
                            >
                              Not discovered yet
                            </p>
                          )}
                        </div>
                      </div>

                      <p
                        className="text-secondary"
                        style={{ fontSize: '12px', lineHeight: 1.55 }}
                      >
                        {unlocked ? body.funFacts[0] : body.discoveryHint}
                      </p>
                    </div>

                    {unlocked ? (
                      <div style={{ display: 'flex', gap: '7px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            spaceAudio.playWarpChime();
                            onSelectFromJournal(body.id);
                          }}
                          className="btn btn--ghost-sky btn--sm"
                          style={{ flex: 1 }}
                        >
                          <IconNavigation size={13} />
                          <span>Fly &amp; Facts</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            spaceAudio.playWarpChime();
                            onEnterSurfaceExplore(body.id);
                          }}
                          title="Inspect up close"
                          className="btn btn--ghost-amber btn--sm"
                        >
                          <IconCompass size={13} />
                          <span>Close</span>
                        </button>
                      </div>
                    ) : (
                      !body.isHidden && (
                        <button
                          type="button"
                          onClick={() => {
                            spaceAudio.playWarpChime();
                            onSelectFromJournal(body.id);
                          }}
                          className="btn btn--slate btn--sm"
                          style={{ width: '100%' }}
                        >
                          <IconNavigation size={13} />
                          <span>Fly Here to Discover</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
