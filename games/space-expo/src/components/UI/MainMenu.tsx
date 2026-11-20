import { useMemo, useState } from 'react';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { GraphicsQuality } from '../../utils/worldState';
import { spaceAudio } from '../../utils/sound';
import { PlanetIllustration } from './PlanetIllustration';
import {
  IconAward,
  IconClose,
  IconHelp,
  IconRocket,
  IconSliders,
  IconSparkles,
} from './Icons';

interface MainMenuProps {
  discoveredCount: number;
  totalCount: number;
  quality: GraphicsQuality;
  onQualityChange: (q: GraphicsQuality) => void;
  onStart: (startBodyId?: string) => void;
}

const FEATURED_STARTS = [
  { id: 'earth', label: 'Earth' },
  { id: 'iss-station', label: 'ISS' },
  { id: 'saturn', label: 'Saturn' },
  { id: 'mars', label: 'Mars' },
  { id: 'jupiter', label: 'Jupiter' },
];

export function MainMenu({
  discoveredCount,
  totalCount,
  quality,
  onQualityChange,
  onStart,
}: MainMenuProps) {
  const [showControls, setShowControls] = useState(false);

  const counts = useMemo(() => {
    const satellites = CELESTIAL_BODIES.filter(
      (b) =>
        b.type === 'Artificial satellite' || b.type === 'Natural satellite'
    ).length;
    const cosmic = CELESTIAL_BODIES.filter(
      (b) =>
        b.scaleTier === 'interstellar' ||
        b.scaleTier === 'galactic' ||
        b.scaleTier === 'universe'
    ).length;
    const hidden = CELESTIAL_BODIES.filter((b) => b.isHidden).length;
    const worlds = CELESTIAL_BODIES.length - satellites - cosmic - hidden;
    return { worlds, satellites, cosmic, hidden };
  }, []);

  return (
    <div className="menu-screen">
      {/* Asymmetric left scrim leaves sunlit low-poly Earth & orbiting satellites wide open */}
      <div className="menu-scrim" />

      {/* Top Bar */}
      <div className="menu-topbar">
        <div className="menu-brand">
          <span className="menu-brand__mark" />
          <span className="menu-brand__name">Solar Playground</span>
          <span aria-hidden="true" className="text-muted">
            ·
          </span>
          <span className="menu-brand__count">
            {discoveredCount} / {totalCount} Discovered
          </span>
        </div>

        <div className="hud-panel quality-group quality-group--desktop">
          <IconSliders
            size={14}
            className="text-muted"
            style={{ marginLeft: '6px', marginRight: '4px' }}
          />
          {(['high', 'balanced', 'eco'] as GraphicsQuality[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onQualityChange(q);
              }}
              className={`quality-btn${quality === q ? ' is-active' : ''}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Hero Left Lockup */}
      <div className="menu-hero">
        <h1 className="menu-title">
          Mini <span className="menu-title__accent">Universe</span>
          <br />
          Explorer
        </h1>

        <p className="menu-copy">
          Pilot your explorer starship across a true-scale deep-black universe —
          from Earth&apos;s low-poly continents and orbiting satellites out to
          neighboring star systems, our Milky Way galaxy, and distant spiral
          galaxies.
        </p>

        <div className="menu-actions">
          <button
            type="button"
            onClick={() => {
              spaceAudio.playWarpChime();
              onStart();
            }}
            className="btn btn--amber btn--lg"
          >
            <IconRocket size={19} />
            <span>
              {discoveredCount > 0 ? 'Continue Exploring' : 'Launch Explorer'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              setShowControls((v) => !v);
            }}
            className="btn btn--slate btn--md"
            style={{ padding: '12px 16px', fontSize: '14px' }}
          >
            <IconHelp size={16} className="text-sky" />
            <span>Controls</span>
          </button>
        </div>

        <div className="menu-quick-section">
          <p className="menu-quick-label">
            <IconAward size={14} className="text-amber" />
            <span>Or jump straight to a destination</span>
          </p>
          <div className="menu-quick-list">
            {FEATURED_STARTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  spaceAudio.playWarpChime();
                  onStart(item.id);
                }}
                className="hud-panel menu-quick-btn"
              >
                <PlanetIllustration id={item.id} size={24} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Quiet Info Strip & Mobile Quality Switcher */}
      <div className="menu-footer">
        <div className="menu-stats">
          <span>{counts.worlds} Solar Worlds</span>
          <span aria-hidden="true">·</span>
          <span>{counts.satellites} Satellites &amp; Moons</span>
          <span aria-hidden="true">·</span>
          <span>{counts.cosmic} Star Systems &amp; Galaxies</span>
          <span aria-hidden="true">·</span>
          <span>{counts.hidden} Hidden Wonders</span>
        </div>

        <div className="hud-panel quality-group quality-group--mobile">
          {(['high', 'balanced', 'eco'] as GraphicsQuality[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onQualityChange(q);
              }}
              className={`quality-btn${quality === q ? ' is-active' : ''}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Controls Modal */}
      {showControls && (
        <div className="modal-backdrop">
          <div className="hud-panel--modal controls-modal animate-enter">
            <div className="hud-row">
              <h2
                className="font-display"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <IconSparkles size={19} className="text-amber" />
                <span>How to Fly</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  setShowControls(false);
                }}
                aria-label="Close flight controls"
                className="btn btn--slate btn--icon"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="controls-modal__grid">
              <div>
                <p className="controls-modal__heading text-sky">Desktop</p>
                <p>WASD / Arrows — Fly &amp; Steer</p>
                <p>Space / Ctrl — Up &amp; Down</p>
                <p>Shift — Star Boost / Warp</p>
                <p>Drag Sky / Scroll — Look &amp; Zoom</p>
                <p>V — Cockpit · H — Hide HUD · Esc — Pause</p>
              </div>
              <div>
                <p className="controls-modal__heading text-amber">
                  Phone &amp; Tablet
                </p>
                <p>Left Joystick — Steer Ship</p>
                <p>Drag Open Sky — Orbit View</p>
                <p>Two-Finger Pinch — Zoom In / Out</p>
                <p>Right Buttons — Up / Down / Boost</p>
                <p>Tap any World or Satellite — Facts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
