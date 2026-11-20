import { useEffect } from 'react';
import * as THREE from 'three';
import { getCelestialBodyById } from '../data/celestialBodies';
import { worldState } from '../utils/worldState';

interface UseSpaceshipControlsOptions {
  enabled: boolean;
  onTogglePause: () => void;
  onToggleCameraMode: () => void;
  onManualTakeover: () => void;
  onExitSurfaceExplore: () => void;
  onToggleHud?: () => void;
}

/**
 * Binds desktop keyboard flight controls, mouse wheel zoom, pointer-drag camera rotation,
 * and mobile two-finger pinch-to-zoom directly into the mutable worldState ref without
 * triggering React re-renders.
 */
export function useSpaceshipControls({
  enabled,
  onTogglePause,
  onToggleCameraMode,
  onManualTakeover,
  onExitSurfaceExplore,
  onToggleHud,
}: UseSpaceshipControlsOptions): void {
  useEffect(() => {
    const keys = new Set<string>();

    const syncKeyboardInput = () => {
      let forward = 0;
      let turn = 0;
      let vertical = 0;

      if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) turn -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) turn += 1;
      if (keys.has('Space')) vertical += 1;
      if (
        keys.has('ControlLeft') ||
        keys.has('ControlRight') ||
        keys.has('KeyC')
      ) {
        vertical -= 1;
      }

      worldState.input.forward = forward;
      worldState.input.turn = turn;
      worldState.input.vertical = vertical;
      worldState.input.boost =
        keys.has('ShiftLeft') || keys.has('ShiftRight');

      if (
        !worldState.surfaceExploreId &&
        (forward !== 0 || turn !== 0 || vertical !== 0)
      ) {
        if (
          worldState.autopilotTargetId ||
          worldState.inspectTargetId ||
          worldState.scaleGlideTargetPos
        ) {
          worldState.autopilotTargetId = null;
          worldState.inspectTargetId = null;
          worldState.scaleGlideTargetPos = null;
          worldState.scaleGlideLookPos = null;
          onManualTakeover();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (worldState.surfaceExploreId) {
          onExitSurfaceExplore();
          return;
        }
        onTogglePause();
        return;
      }

      if (!enabled) return;

      if (e.code === 'KeyV' && !e.repeat && !worldState.surfaceExploreId) {
        onToggleCameraMode();
        return;
      }

      if (e.code === 'KeyH' && !e.repeat && onToggleHud) {
        onToggleHud();
        return;
      }

      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Space',
          'ControlLeft',
          'ControlRight',
          'KeyC',
          'ShiftLeft',
          'ShiftRight',
        ].includes(e.code)
      ) {
        if (
          e.code === 'Space' ||
          e.code === 'ArrowUp' ||
          e.code === 'ArrowDown'
        ) {
          e.preventDefault();
        }
        keys.add(e.code);
        syncKeyboardInput();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.delete(e.code)) {
        syncKeyboardInput();
      }
    };

    const handleBlur = () => {
      keys.clear();
      syncKeyboardInput();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      keys.clear();
      worldState.input.forward = 0;
      worldState.input.turn = 0;
      worldState.input.vertical = 0;
      worldState.input.boost = false;
    };
  }, [
    enabled,
    onTogglePause,
    onToggleCameraMode,
    onManualTakeover,
    onExitSurfaceExplore,
    onToggleHud,
  ]);

  // Pointer drag camera look, mouse wheel zoom, and mobile two-finger pinch zoom
  useEffect(() => {
    let dragging = false;
    let activePointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let pinchLastDist: number | null = null;

    const isCanvasTarget = (target: EventTarget | null) => {
      return target instanceof HTMLCanvasElement;
    };

    const applyZoomDelta = (deltaAmount: number) => {
      if (worldState.surfaceExploreId) {
        const body = getCelestialBodyById(worldState.surfaceExploreId);
        const radius = body ? body.radius : 12;
        const minDist =
          body?.type === 'Artificial satellite'
            ? Math.max(radius * 2.2, 3.2)
            : Math.max(radius * 1.45, radius + 2.2);
        const maxDist =
          body?.type === 'Artificial satellite'
            ? Math.max(radius * 14, 34)
            : Math.max(radius * 6.8, 54);
        const zoomFactor = Math.max(0.014, radius * 0.0028);
        worldState.surfaceOrbitDistance = THREE.MathUtils.clamp(
          worldState.surfaceOrbitDistance + deltaAmount * zoomFactor,
          minDist,
          maxDist
        );
      } else {
        worldState.zoomDistance = THREE.MathUtils.clamp(
          worldState.zoomDistance + deltaAmount * 0.018,
          7.5,
          68
        );
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!enabled || !isCanvasTarget(e.target)) return;
      if (pinchLastDist !== null) return;
      dragging = true;
      activePointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId || pinchLastDist !== null) {
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (worldState.surfaceExploreId) {
        worldState.surfaceOrbitYaw += dx * 0.0068;
        worldState.surfaceOrbitPitch = THREE.MathUtils.clamp(
          worldState.surfaceOrbitPitch + dy * 0.0055,
          -1.15,
          1.15
        );
      } else {
        worldState.cameraOrbitYaw -= dx * 0.0055;
        worldState.cameraOrbitPitch = THREE.MathUtils.clamp(
          worldState.cameraOrbitPitch + dy * 0.0045,
          -0.55,
          1.15
        );
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === activePointerId) {
        dragging = false;
        activePointerId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!enabled || !isCanvasTarget(e.target)) return;
      e.preventDefault();
      applyZoomDelta(e.deltaY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!enabled || !isCanvasTarget(e.target)) return;
      if (e.touches.length === 2) {
        dragging = false;
        activePointerId = null;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchLastDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!enabled || !isCanvasTarget(e.target)) return;
      if (e.touches.length === 2 && pinchLastDist !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const nextDist = Math.hypot(dx, dy);
        const diff = pinchLastDist - nextDist;
        pinchLastDist = nextDist;
        applyZoomDelta(diff * 2.4);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchLastDist = null;
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled]);
}
