import { useEffect, useRef } from 'react';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { worldState } from '../../utils/worldState';

interface CelestialLabelsOverlayProps {
  selectedId: string | null;
  discoveredIds: Set<string>;
  onSelectBody: (id: string) => void;
}

const LABELABLE_BODIES = CELESTIAL_BODIES.filter(
  (b) => b.id !== 'asteroid-belt'
);

/**
 * High-performance 60fps 3D-to-2D projected label overlay replacing @react-three/drei <Html>.
 * Mutates DOM transforms directly in a single requestAnimationFrame loop with zero React re-renders.
 */
export function CelestialLabelsOverlay({
  selectedId,
  discoveredIds,
  onSelectBody,
}: CelestialLabelsOverlayProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    let rafId = 0;

    const sync = () => {
      for (let i = 0; i < LABELABLE_BODIES.length; i++) {
        const body = LABELABLE_BODIES[i];
        const el = itemRefs.current[body.id];
        if (!el) continue;

        const proj = worldState.labelProjections[body.id];
        if (!proj || !proj.visible) {
          if (el.style.opacity !== '0') {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
          continue;
        }

        el.style.opacity = proj.opacity.toFixed(2);
        el.style.pointerEvents = 'auto';
        el.style.transform = `translate3d(${proj.screenX.toFixed(1)}px, ${proj.screenY.toFixed(1)}px, 0) translate(-50%, -100%)`;
      }

      rafId = window.requestAnimationFrame(sync);
    };

    rafId = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="celestial-labels-layer" aria-hidden="false">
      {LABELABLE_BODIES.map((body) => {
        const discovered = discoveredIds.has(body.id);
        if (body.isHidden && !discovered) return null;
        const isSelected = selectedId === body.id;

        return (
          <button
            key={body.id}
            ref={(el) => {
              itemRefs.current[body.id] = el;
            }}
            type="button"
            onClick={() => onSelectBody(body.id)}
            style={{ opacity: 0, pointerEvents: 'none' }}
            className={`celestial-label${isSelected ? ' is-selected' : ''}`}
          >
            <span
              className="celestial-label__dot"
              style={{
                backgroundColor: isSelected ? '#020617' : body.color,
              }}
            />
            <span>{body.name}</span>
            {discovered && <span className="celestial-label__star">★</span>}
          </button>
        );
      })}
    </div>
  );
}
