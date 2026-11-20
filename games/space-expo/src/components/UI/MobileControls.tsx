import { useRef, useState } from 'react';
import * as THREE from 'three';
import { worldState } from '../../utils/worldState';
import {
  IconArrowDown,
  IconArrowUp,
  IconFlame,
  IconZoomIn,
  IconZoomOut,
} from './Icons';

interface MobileControlsProps {
  hideOnCompactSheet?: boolean;
  onManualTakeover: () => void;
}

/**
 * Ergonomic touch controls for phones and tablets:
 * - Bottom-left virtual joystick (forward/back + turn)
 * - Bottom-right large Boost, Up/Down altitude, and Zoom +/- buttons
 * - Open canvas touch-drag smoothly rotates the camera and pinch zooms.
 */
export function MobileControls({
  hideOnCompactSheet = false,
  onManualTakeover,
}: MobileControlsProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [boostActive, setBoostActive] = useState(false);

  const maxRadius = 40;

  const updateJoystick = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobOffset({ x: dx, y: dy });

    const normX = dx / maxRadius;
    const normY = -dy / maxRadius;
    worldState.input.joyX = Math.abs(normX) > 0.08 ? normX : 0;
    worldState.input.joyY = Math.abs(normY) > 0.08 ? normY : 0;

    if (worldState.autopilotTargetId || worldState.inspectTargetId) {
      worldState.autopilotTargetId = null;
      worldState.inspectTargetId = null;
      onManualTakeover();
    }
  };

  const resetJoystick = () => {
    pointerIdRef.current = null;
    setKnobOffset({ x: 0, y: 0 });
    worldState.input.joyX = 0;
    worldState.input.joyY = 0;
  };

  const handleZoom = (delta: number) => {
    worldState.zoomDistance = THREE.MathUtils.clamp(
      worldState.zoomDistance + delta,
      7.5,
      68
    );
  };

  return (
    <div
      className={`mobile-controls${hideOnCompactSheet ? ' mobile-controls--hide-compact' : ''}`}
    >
      {/* Left: Tactile Virtual Steering Joystick */}
      <div
        ref={baseRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          pointerIdRef.current = e.pointerId;
          updateJoystick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          e.stopPropagation();
          updateJoystick(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          e.stopPropagation();
          resetJoystick();
        }}
        onPointerCancel={resetJoystick}
        aria-label="Flight steering joystick"
        className="joystick-base"
      >
        <div className="joystick-ring" />
        <div
          style={{
            transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
          }}
          className="joystick-knob"
        />
      </div>

      {/* Right: Altitude, Zoom & Big Boost Cluster */}
      <div className="touch-right-cluster">
        <div className="touch-stack">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleZoom(-3.2);
            }}
            aria-label="Zoom in"
            className="touch-btn-zoom"
          >
            <IconZoomIn size={19} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleZoom(3.2);
            }}
            aria-label="Zoom out"
            className="touch-btn-zoom"
          >
            <IconZoomOut size={19} />
          </button>
        </div>

        <div className="touch-stack">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              worldState.input.touchUp = true;
              if (worldState.autopilotTargetId || worldState.inspectTargetId) {
                worldState.autopilotTargetId = null;
                worldState.inspectTargetId = null;
                onManualTakeover();
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              worldState.input.touchUp = false;
            }}
            onPointerLeave={() => {
              worldState.input.touchUp = false;
            }}
            onPointerCancel={() => {
              worldState.input.touchUp = false;
            }}
            aria-label="Fly upward"
            className="touch-btn-alt"
          >
            <IconArrowUp size={22} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              worldState.input.touchDown = true;
              if (worldState.autopilotTargetId || worldState.inspectTargetId) {
                worldState.autopilotTargetId = null;
                worldState.inspectTargetId = null;
                onManualTakeover();
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              worldState.input.touchDown = false;
            }}
            onPointerLeave={() => {
              worldState.input.touchDown = false;
            }}
            onPointerCancel={() => {
              worldState.input.touchDown = false;
            }}
            aria-label="Fly downward"
            className="touch-btn-alt"
          >
            <IconArrowDown size={22} />
          </button>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            worldState.input.touchBoost = true;
            setBoostActive(true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            worldState.input.touchBoost = false;
            setBoostActive(false);
          }}
          onPointerLeave={() => {
            worldState.input.touchBoost = false;
            setBoostActive(false);
          }}
          onPointerCancel={() => {
            worldState.input.touchBoost = false;
            setBoostActive(false);
          }}
          aria-label="Boost speed"
          className={`touch-btn-boost${boostActive ? ' is-active' : ''}`}
        >
          <IconFlame size={22} />
          <span>BOOST</span>
        </button>
      </div>
    </div>
  );
}
