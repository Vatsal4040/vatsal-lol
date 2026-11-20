import { useCallback, useEffect, useState } from 'react';
import {
  canLockLandscape,
  isMobileDevice,
  isMobilePortrait,
  tryLockLandscape,
} from '../../utils/webgl';

interface LandscapeGateProps {
  onBlockedChange: (blocked: boolean) => void;
}

/**
 * Forces landscape-only play on mobile devices.
 * Immediately blocks portrait (vertical) orientation on startup and whenever
 * the user rotates back to vertical, displaying an animated "Rotate Your Phone"
 * screen and attempting Screen Orientation lock where supported.
 */
export function LandscapeGate({ onBlockedChange }: LandscapeGateProps) {
  const [isPortraitBlocked, setIsPortraitBlocked] = useState<boolean>(() =>
    isMobilePortrait()
  );
  const [supportsLock] = useState<boolean>(() => canLockLandscape());
  const [lockAttempted, setLockAttempted] = useState(false);

  const syncOrientation = useCallback(() => {
    setIsPortraitBlocked(isMobilePortrait());
  }, []);

  useEffect(() => {
    onBlockedChange(isPortraitBlocked);
  }, [isPortraitBlocked, onBlockedChange]);

  useEffect(() => {
    syncOrientation();

    // Best-effort silent landscape lock on startup for browsers that allow it
    if (isMobileDevice()) {
      void tryLockLandscape(false);
    }

    const handleChange = () => {
      syncOrientation();
      // iOS Safari sometimes updates innerWidth/innerHeight one frame after orientationchange
      window.setTimeout(syncOrientation, 120);
      window.setTimeout(syncOrientation, 320);
    };

    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);
    window.screen?.orientation?.addEventListener?.('change', handleChange);
    window.visualViewport?.addEventListener('resize', handleChange);

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
      window.screen?.orientation?.removeEventListener?.('change', handleChange);
      window.visualViewport?.removeEventListener('resize', handleChange);
    };
  }, [syncOrientation]);

  const handleForceLandscapeClick = async () => {
    setLockAttempted(true);
    await tryLockLandscape(true);
    syncOrientation();
  };

  if (!isPortraitBlocked) return null;

  return (
    <div
      className="landscape-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="landscape-gate-title"
    >
      <div className="landscape-gate__frame">
        <span className="landscape-gate__corner landscape-gate__corner--tl" />
        <span className="landscape-gate__corner landscape-gate__corner--tr" />
        <span className="landscape-gate__corner landscape-gate__corner--bl" />
        <span className="landscape-gate__corner landscape-gate__corner--br" />

        <div className="landscape-gate__visual" aria-hidden="true">
          <svg
            viewBox="0 0 120 120"
            width="108"
            height="108"
            fill="none"
            className="landscape-gate__svg"
          >
            {/* Subtle orbital guide ring */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Curved clockwise rotation arrow */}
            <path
              d="M 86 28 A 40 40 0 0 1 99 64"
              stroke="#fbbf24"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <polyline
              points="93,58 99,66 105,58"
              stroke="#fbbf24"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated rotating phone silhouette */}
            <g className="landscape-gate__phone">
              <rect
                x="41"
                y="26"
                width="38"
                height="68"
                rx="7"
                fill="rgba(8, 13, 24, 0.96)"
                stroke="#38bdf8"
                strokeWidth="2.4"
              />
              {/* Phone speaker notch */}
              <line
                x1="54"
                y1="32"
                x2="66"
                y2="32"
                stroke="rgba(148, 163, 184, 0.7)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Mini planet inside screen */}
              <circle cx="60" cy="59" r="9" fill="rgba(56, 189, 248, 0.25)" stroke="#7dd3fc" strokeWidth="1.5" />
              <ellipse
                cx="60"
                cy="59"
                rx="14"
                ry="4"
                transform="rotate(-18 60 59)"
                stroke="#fbbf24"
                strokeWidth="1.3"
              />
              {/* Home bar */}
              <line
                x1="53"
                y1="88"
                x2="67"
                y2="88"
                stroke="rgba(148, 163, 184, 0.6)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        <p className="landscape-gate__kicker">LANDSCAPE VIEW REQUIRED</p>
        <h2 id="landscape-gate-title" className="landscape-gate__title">
          Rotate Your Phone
        </h2>
        <p className="landscape-gate__copy">
          Mini Universe Explorer starts in landscape view only. Turn your phone
          sideways to pilot your starship.
        </p>

        {supportsLock && (
          <button
            type="button"
            onClick={handleForceLandscapeClick}
            className="btn btn--amber btn--md landscape-gate__btn"
          >
            Switch to Landscape
          </button>
        )}

        {lockAttempted && (
          <p className="landscape-gate__hint">
            If screen rotation is locked on your phone, turn your device
            sideways or unlock auto-rotate.
          </p>
        )}
      </div>
    </div>
  );
}
