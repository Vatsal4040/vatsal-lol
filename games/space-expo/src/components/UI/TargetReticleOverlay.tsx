import { useEffect, useRef } from 'react';
import { getCelestialBodyById } from '../../data/celestialBodies';
import { formatCosmicDistance } from '../../utils/cosmicScale';
import { worldState } from '../../utils/worldState';
import { spaceAudio } from '../../utils/sound';

interface TargetReticleOverlayProps {
  lockedTargetId: string | null;
  onFocusTarget: (id: string) => void;
}

/**
 * 60fps 3D-to-2D aerospace optical target bracket & off-screen directional indicator.
 * Reads worldState.targetMarker in a lightweight rAF loop with zero React re-renders.
 */
export function TargetReticleOverlay({
  lockedTargetId,
  onFocusTarget,
}: TargetReticleOverlayProps) {
  const onScreenRef = useRef<HTMLDivElement | null>(null);
  const offScreenRef = useRef<HTMLButtonElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const onDistRef = useRef<HTMLSpanElement | null>(null);
  const offDistRef = useRef<HTMLSpanElement | null>(null);

  const lockedBody = lockedTargetId ? getCelestialBodyById(lockedTargetId) : null;

  useEffect(() => {
    if (!lockedTargetId || !lockedBody) return;

    let rafId = 0;
    let lastDistText = '';

    const update = () => {
      const m = worldState.targetMarker;
      const onEl = onScreenRef.current;
      const offEl = offScreenRef.current;

      if (!m.visible || m.targetId !== lockedTargetId) {
        if (onEl) onEl.style.opacity = '0';
        if (offEl) {
          offEl.style.opacity = '0';
          offEl.style.pointerEvents = 'none';
        }
      } else {
        const distText = formatCosmicDistance(m.distanceUnits);
        if (distText !== lastDistText) {
          lastDistText = distText;
          if (onDistRef.current) onDistRef.current.textContent = distText;
          if (offDistRef.current) offDistRef.current.textContent = distText;
        }

        const px = (m.screenX / 100) * window.innerWidth;
        const py = (m.screenY / 100) * window.innerHeight;

        if (m.isOnScreen) {
          if (onEl) {
            onEl.style.opacity = '1';
            onEl.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (offEl) {
            offEl.style.opacity = '0';
            offEl.style.pointerEvents = 'none';
          }
        } else {
          if (onEl) onEl.style.opacity = '0';
          if (offEl) {
            offEl.style.opacity = '1';
            offEl.style.pointerEvents = 'auto';
            offEl.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (arrowRef.current) {
            arrowRef.current.style.transform = `rotate(${m.edgeAngleDeg.toFixed(1)}deg)`;
          }
        }
      }

      rafId = window.requestAnimationFrame(update);
    };

    rafId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(rafId);
  }, [lockedTargetId, lockedBody]);

  if (!lockedBody) return null;

  const accent = lockedBody.color || '#38BDF8';

  return (
    <div className="reticle-layer">
      {/* On-screen precision aerospace optical bracket */}
      <div
        ref={onScreenRef}
        style={{ opacity: 0 }}
        className="reticle-onscreen"
      >
        <div className="reticle-brackets">
          <svg width="66" height="66" viewBox="0 0 66 66" fill="none" aria-hidden="true">
            {/* Corner rangefinder brackets */}
            <path
              d="M4 17 V4 H17 M49 4 H62 V17 M4 49 V62 H17 M49 62 H62 V49"
              stroke={accent}
              strokeWidth="1.8"
              strokeLinecap="square"
            />
            {/* Inner subtle cross ticks */}
            <line x1="33" y1="22" x2="33" y2="27" stroke={accent} strokeWidth="1" opacity="0.65" />
            <line x1="33" y1="39" x2="33" y2="44" stroke={accent} strokeWidth="1" opacity="0.65" />
            <line x1="22" y1="33" x2="27" y2="33" stroke={accent} strokeWidth="1" opacity="0.65" />
            <line x1="39" y1="33" x2="44" y2="33" stroke={accent} strokeWidth="1" opacity="0.65" />
            <circle cx="33" cy="33" r="1.8" fill={accent} />
          </svg>
        </div>

        <div className="hud-panel reticle-tag">
          <span className="hud-dot" style={{ backgroundColor: accent }} />
          <span className="reticle-tag__name">{lockedBody.name}</span>
          <span ref={onDistRef} className="reticle-tag__dist" />
        </div>
      </div>

      {/* Off-screen edge-clamped directional indicator */}
      <button
        ref={offScreenRef}
        type="button"
        onClick={() => {
          spaceAudio.playSelect();
          onFocusTarget(lockedBody.id);
        }}
        style={{ opacity: 0, pointerEvents: 'none' }}
        title={`Locked target: ${lockedBody.name} — click to open info`}
        className="hud-panel reticle-offscreen"
      >
        <div ref={arrowRef} className="reticle-offscreen__arrow">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1 L12 11.5 L7 8.8 L2 11.5 Z" fill={accent} />
          </svg>
        </div>
        <div className="reticle-offscreen__text">
          <p className="reticle-tag__name">{lockedBody.name}</p>
          <span ref={offDistRef} className="reticle-tag__dist" />
        </div>
      </button>
    </div>
  );
}
