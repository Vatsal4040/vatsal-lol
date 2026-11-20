import { GraphicsQuality } from '../../utils/worldState';
import { spaceAudio } from '../../utils/sound';
import {
  IconHome,
  IconOrbit,
  IconPhone,
  IconPlay,
  IconReset,
  IconTag,
  IconVolumeOff,
  IconVolumeOn,
} from './Icons';

interface PauseMenuProps {
  quality: GraphicsQuality;
  soundEnabled: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showTouchControls: boolean;
  onQualityChange: (q: GraphicsQuality) => void;
  onToggleSound: () => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onToggleTouchControls: () => void;
  onResetProgress: () => void;
  onResume: () => void;
  onReturnToTitle: () => void;
}

export function PauseMenu({
  quality,
  soundEnabled,
  showOrbits,
  showLabels,
  showTouchControls,
  onQualityChange,
  onToggleSound,
  onToggleOrbits,
  onToggleLabels,
  onToggleTouchControls,
  onResetProgress,
  onResume,
  onReturnToTitle,
}: PauseMenuProps) {
  return (
    <div className="modal-backdrop modal-backdrop--top">
      <div className="hud-panel--modal pause-modal space-scroll animate-enter">
        <div style={{ textAlign: 'center' }}>
          <h2 className="modal-title" style={{ fontSize: '24px' }}>
            Exploration Paused
          </h2>
          <p className="modal-subtitle">
            Customize your space journey or review flight controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            spaceAudio.playClick();
            onResume();
          }}
          className="btn btn--amber btn--lg"
          style={{ width: '100%' }}
        >
          <IconPlay size={18} />
          <span>Resume Flying</span>
        </button>

        <div className="pause-section">
          <div className="hud-row">
            <span className="text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>
              Graphics Quality
            </span>
            <div className="hud-panel quality-group">
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

          <div className="pause-toggles">
            <button
              type="button"
              onClick={onToggleSound}
              className={`toggle-btn${soundEnabled ? ' is-on' : ''}`}
            >
              {soundEnabled ? (
                <IconVolumeOn size={15} />
              ) : (
                <IconVolumeOff size={15} />
              )}
              <span>Sound: {soundEnabled ? 'On' : 'Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onToggleOrbits();
              }}
              className={`toggle-btn${showOrbits ? ' is-on' : ''}`}
            >
              <IconOrbit size={15} />
              <span>Orbit Rings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onToggleLabels();
              }}
              className={`toggle-btn${showLabels ? ' is-on' : ''}`}
            >
              <IconTag size={15} />
              <span>Object Names</span>
            </button>

            <button
              type="button"
              onClick={() => {
                spaceAudio.playClick();
                onToggleTouchControls();
              }}
              className={`toggle-btn${showTouchControls ? ' is-on' : ''}`}
            >
              <IconPhone size={15} />
              <span>Touch Joystick</span>
            </button>
          </div>
        </div>

        <div className="pause-controls-box">
          <p className="text-sky" style={{ fontWeight: 600, marginBottom: '5px' }}>
            Flight Controls
          </p>
          <p>WASD / Arrows — Move &amp; Steer</p>
          <p>Space / Ctrl — Fly Up / Fly Down</p>
          <p>Shift — Boost / Warp · V — Switch Camera · H — Hide HUD</p>
          <p>Drag Sky — Rotate View · Wheel / Pinch — Zoom</p>
          <p>Click / Tap Planet or Satellite — Read Space Facts</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              onReturnToTitle();
            }}
            className="btn btn--slate btn--md"
            style={{ flex: 1 }}
          >
            <IconHome size={15} />
            <span>Main Menu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              spaceAudio.playClick();
              onResetProgress();
            }}
            className="btn btn--danger btn--md"
          >
            <IconReset size={14} />
            <span>Reset Badges</span>
          </button>
        </div>
      </div>
    </div>
  );
}
