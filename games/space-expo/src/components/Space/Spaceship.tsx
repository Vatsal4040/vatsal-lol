import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CELESTIAL_BODIES, getCelestialBodyById } from '../../data/celestialBodies';
import {
  computeAdaptiveMaxSpeed,
  computeExplorationScale,
} from '../../utils/cosmicScale';
import { worldState } from '../../utils/worldState';

interface SpaceshipProps {
  onDiscoverNear: (id: string) => void;
  onAutopilotArrive: (id: string) => void;
}

// Pre-allocated math helpers outside render loop (zero GC!)
const _forward = new THREE.Vector3();
const _desiredVel = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _camDesiredPos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _camCurrentLook = new THREE.Vector3(2450, 0, 0);
const _offset = new THREE.Vector3();
const _shipQuat = new THREE.Quaternion();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _streakDummy = new THREE.Object3D();
const _projVec = new THREE.Vector3();
const _labelWorldPos = new THREE.Vector3();
const _camForward = new THREE.Vector3();

const STREAK_COUNT = 42;
const STREAK_SEEDS = Array.from({ length: STREAK_COUNT }, (_, i) => {
  const angle = (i / STREAK_COUNT) * Math.PI * 2 + (i % 5) * 0.37;
  const radius = 2.6 + ((i * 19) % 10) * 0.68;
  const phase = ((i * 37) % 100) / 100;
  return { angle, radius, phase };
});

/**
 * Composite 10-part miniature futuristic explorer spacecraft built with LatheGeometry,
 * beveled ExtrudeGeometry wings, glossy cockpit dome, brushed metal nacelles,
 * and dynamic glowing plasma thrusters.
 */
function SpaceshipModel({
  flameLeftRef,
  flameRightRef,
  flameCenterRef,
}: {
  flameLeftRef: React.RefObject<THREE.Mesh | null>;
  flameRightRef: React.RefObject<THREE.Mesh | null>;
  flameCenterRef: React.RefObject<THREE.Mesh | null>;
}) {
  const hullGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, -1.55),
      new THREE.Vector2(0.32, -1.45),
      new THREE.Vector2(0.54, -0.85),
      new THREE.Vector2(0.62, -0.1),
      new THREE.Vector2(0.52, 0.72),
      new THREE.Vector2(0.3, 1.35),
      new THREE.Vector2(0.0, 1.85),
    ];
    const geo = new THREE.LatheGeometry(pts, 18);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const wingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.4, 0.45);
    shape.lineTo(2.15, -0.85);
    shape.lineTo(1.95, -1.32);
    shape.lineTo(0.38, -1.05);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 2,
    });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0.05, 0);
    return geo;
  }, []);

  const finGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-1.1, 0);
    shape.lineTo(-1.32, 0.92);
    shape.lineTo(-0.72, 0.85);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    geo.rotateY(Math.PI / 2);
    geo.translate(-0.04, 0.35, -0.2);
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      hullGeo.dispose();
      wingGeo.dispose();
      finGeo.dispose();
    };
  }, [hullGeo, wingGeo, finGeo]);

  return (
    <group scale={0.72}>
      <mesh geometry={hullGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.28} metalness={0.18} />
      </mesh>

      <mesh position={[0, 0, 1.52]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.25, 0.65, 16]} />
        <meshStandardMaterial color="#F97316" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, -0.68]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.57, 0.24, 18]} />
        <meshStandardMaterial color="#0EA5E9" roughness={0.32} metalness={0.35} />
      </mesh>

      <mesh position={[0, 0.32, 0.28]} scale={[0.85, 0.62, 1.48]}>
        <sphereGeometry args={[0.52, 20, 16]} />
        <meshPhysicalMaterial
          color="#0284C7"
          emissive="#0369A1"
          emissiveIntensity={0.32}
          roughness={0.08}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      <mesh geometry={wingGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#E2E8F0" roughness={0.36} metalness={0.22} />
      </mesh>

      <mesh geometry={wingGeo} scale={[-1, 1, 1]} castShadow receiveShadow>
        <meshStandardMaterial color="#E2E8F0" roughness={0.36} metalness={0.22} />
      </mesh>

      <mesh position={[2.02, 0, -1.06]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
      <mesh position={[-2.02, 0, -1.06]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#F97316" />
      </mesh>

      <mesh geometry={finGeo} castShadow>
        <meshStandardMaterial color="#F97316" roughness={0.35} metalness={0.18} />
      </mesh>

      {[-0.95, 0.95].map((xPos, idx) => (
        <group key={idx} position={[xPos, -0.08, -0.92]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.21, 0.26, 1.15, 14]} />
            <meshStandardMaterial
              color="#475569"
              metalness={0.82}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, 0, -0.58]}>
            <torusGeometry args={[0.2, 0.04, 10, 18]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
          <mesh
            ref={idx === 0 ? flameLeftRef : flameRightRef}
            position={[0, 0, -1.05]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[0.18, 0.95, 12]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0, -1.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.34, 0.32, 14]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.24} />
      </mesh>
      <mesh
        ref={flameCenterRef}
        position={[0, 0, -2.1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[0.24, 1.25, 14]} />
        <meshBasicMaterial
          color="#FBBF24"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.56, -0.45]} rotation={[0.45, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.04, 0.14, 12]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.22} />
      </mesh>
    </group>
  );
}

/** Projects all celestial body label positions into 2D screen pixels with zero GC */
function updateLabelProjections(
  camera: THREE.Camera,
  width: number,
  height: number
): void {
  camera.getWorldDirection(_camForward);
  const camOriginDist = camera.position.length();

  for (let i = 0; i < CELESTIAL_BODIES.length; i++) {
    const body = CELESTIAL_BODIES[i];
    const proj = worldState.labelProjections[body.id];
    const worldPos = worldState.planetPositions[body.id];
    if (!proj || !worldPos || body.id === 'asteroid-belt') {
      if (proj) proj.visible = false;
      continue;
    }

    const camDist = camera.position.distanceTo(worldPos);

    // Smart multi-scale distance culling so labels stay crisp and never clutter the viewport
    let maxVisibleDist = 42000;
    let minVisibleDist = 0;
    if (body.type === 'Artificial satellite') {
      maxVisibleDist = 260;
    } else if (body.type === 'Natural satellite') {
      maxVisibleDist = 950;
    } else if (body.isHidden) {
      maxVisibleDist = 2400;
    } else if (body.scaleTier === 'interstellar') {
      maxVisibleDist = 320000;
      minVisibleDist = 0;
    } else if (body.scaleTier === 'galactic') {
      maxVisibleDist = 750000;
    } else if (body.scaleTier === 'universe') {
      maxVisibleDist = 950000;
    } else if (body.id === 'sun') {
      maxVisibleDist = 110000;
    } else {
      // Main solar planets: fade cleanly once zoomed far into galactic/universe view
      maxVisibleDist = camOriginDist > 68000 ? 0 : 48000;
    }

    if (camDist > maxVisibleDist || camDist < minVisibleDist) {
      proj.visible = false;
      continue;
    }

    const yLift =
      body.scaleTier === 'universe'
        ? body.radius * 0.85
        : body.scaleTier === 'galactic'
          ? body.radius * 1.4
          : body.scaleTier === 'interstellar'
            ? body.radius * 1.55 + 24
            : body.radius * 1.25 + 1.8;

    _labelWorldPos.set(worldPos.x, worldPos.y + yLift, worldPos.z);
    _toTarget.copy(_labelWorldPos).sub(camera.position);

    if (_toTarget.dot(_camForward) <= 0) {
      proj.visible = false;
      continue;
    }

    _projVec.copy(_labelWorldPos).project(camera);
    if (
      _projVec.z > 1 ||
      _projVec.x < -0.98 ||
      _projVec.x > 0.98 ||
      _projVec.y < -0.94 ||
      _projVec.y > 0.92
    ) {
      proj.visible = false;
      continue;
    }

    const sx = (_projVec.x * 0.5 + 0.5) * width;
    const sy = (-_projVec.y * 0.5 + 0.5) * height;

    // Fade smoothly near max distance threshold
    const fadeStart = maxVisibleDist * 0.72;
    const opacity =
      camDist > fadeStart
        ? THREE.MathUtils.clamp(
            1 - (camDist - fadeStart) / (maxVisibleDist - fadeStart),
            0,
            1
          )
        : 1;

    proj.visible = opacity > 0.05;
    proj.screenX = sx;
    proj.screenY = sy;
    proj.opacity = opacity;
  }
}

export function Spaceship({
  onDiscoverNear,
  onAutopilotArrive,
}: SpaceshipProps) {
  const shipGroupRef = useRef<THREE.Group>(null);
  const flameLeftRef = useRef<THREE.Mesh>(null);
  const flameRightRef = useRef<THREE.Mesh>(null);
  const flameCenterRef = useRef<THREE.Mesh>(null);
  const streaksRef = useRef<THREE.InstancedMesh>(null);
  const streakMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const discoveredProximityCache = useRef<Set<string>>(new Set());
  const prevSpeedRef = useRef<number>(0);
  const { camera, size } = useThree();

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);

    if (!worldState.isPaused) {
      worldState.simTime += dt;
    }

    // Main Menu cinematic showcase: frame sunlit enlarged low-poly Earth heroically on right-center
    if (worldState.isMenuOpen) {
      const t = state.clock.elapsedTime;
      const earthPos = worldState.planetPositions.earth;
      const radialAngle = Math.atan2(earthPos.z, earthPos.x);
      const camAngle = radialAngle + 1.08 + Math.sin(t * 0.14) * 0.14;
      const camDist = 42.5;
      _camDesiredPos.set(
        earthPos.x + Math.cos(camAngle) * camDist,
        earthPos.y + 11.2 + Math.sin(t * 0.22) * 1.4,
        earthPos.z + Math.sin(camAngle) * camDist
      );
      camera.position.lerp(_camDesiredPos, 1 - Math.exp(-3.2 * dt));

      const sideX = -Math.sin(camAngle) * 8.5;
      const sideZ = Math.cos(camAngle) * 8.5;
      _camLookTarget.set(
        earthPos.x + sideX,
        earthPos.y - 0.8,
        earthPos.z + sideZ
      );
      _camCurrentLook.lerp(_camLookTarget, 1 - Math.exp(-3.4 * dt));
      camera.lookAt(_camCurrentLook);

      if (shipGroupRef.current) {
        const shipAngle = camAngle - 0.55 + Math.sin(t * 0.45) * 0.16;
        shipGroupRef.current.position.set(
          earthPos.x + Math.cos(shipAngle) * 26.5,
          earthPos.y + 6.5 + Math.sin(t * 1.8) * 0.6,
          earthPos.z + Math.sin(shipAngle) * 26.5
        );
        shipGroupRef.current.rotation.set(0.08, -shipAngle + 0.15, 0.22);
        shipGroupRef.current.visible = true;
        worldState.shipPosition.copy(shipGroupRef.current.position);
      }
      return;
    }

    if (worldState.isPaused) {
      updateLabelProjections(camera, size.width, size.height);
      return;
    }

    // Combine keyboard + touch joystick inputs
    const throttle = THREE.MathUtils.clamp(
      worldState.input.forward + worldState.input.joyY,
      -1,
      1
    );
    const turnInput = THREE.MathUtils.clamp(
      worldState.input.turn + worldState.input.joyX,
      -1,
      1
    );
    const verticalInput = THREE.MathUtils.clamp(
      worldState.input.vertical +
        (worldState.input.touchUp ? 1 : 0) -
        (worldState.input.touchDown ? 1 : 0),
      -1,
      1
    );
    const boosting = worldState.input.boost || worldState.input.touchBoost;
    worldState.isBoosting =
      !worldState.surfaceExploreId &&
      boosting &&
      (Math.abs(throttle) > 0.05 || !!worldState.autopilotTargetId);

    // 0. Close Planet / Satellite / Surface Exploration Mode (360-degree low-altitude orbital view)
    if (worldState.surfaceExploreId) {
      const targetBody = getCelestialBodyById(worldState.surfaceExploreId);
      const bodyPos = worldState.planetPositions[worldState.surfaceExploreId];
      if (targetBody && bodyPos) {
        if (Math.abs(turnInput) > 0.05) {
          worldState.surfaceOrbitYaw += turnInput * 1.45 * dt;
        }
        if (Math.abs(throttle) > 0.05) {
          worldState.surfaceOrbitPitch = THREE.MathUtils.clamp(
            worldState.surfaceOrbitPitch + throttle * 1.05 * dt,
            -1.15,
            1.15
          );
        }

        const yaw = worldState.surfaceOrbitYaw;
        const pitch = worldState.surfaceOrbitPitch;
        const dist = worldState.surfaceOrbitDistance;
        const cosPitch = Math.cos(pitch);

        _camDesiredPos.set(
          bodyPos.x + Math.cos(yaw) * cosPitch * dist,
          bodyPos.y + Math.sin(pitch) * dist,
          bodyPos.z + Math.sin(yaw) * cosPitch * dist
        );
        camera.position.lerp(_camDesiredPos, 1 - Math.exp(-7.5 * dt));

        _camLookTarget.copy(bodyPos);
        _camCurrentLook.lerp(_camLookTarget, 1 - Math.exp(-9 * dt));
        camera.lookAt(_camCurrentLook);

        const camPersp = camera as THREE.PerspectiveCamera;
        if (Math.abs(camPersp.fov - 50) > 0.05) {
          camPersp.fov = THREE.MathUtils.damp(camPersp.fov, 50, 5, dt);
          camPersp.updateProjectionMatrix();
        }

        const shipAngle = yaw + 0.52;
        const shipDist =
          targetBody.type === 'Artificial satellite'
            ? Math.max(targetBody.radius * 4.2 + 3.5, dist * 1.15)
            : Math.max(targetBody.radius * 1.65 + 4.5, dist * 0.92);
        _targetPos.set(
          bodyPos.x + Math.cos(shipAngle) * shipDist,
          bodyPos.y +
            targetBody.radius * 0.25 +
            Math.sin(state.clock.elapsedTime * 1.8) * 0.35,
          bodyPos.z + Math.sin(shipAngle) * shipDist
        );
        worldState.shipPosition.lerp(_targetPos, 1 - Math.exp(-4.2 * dt));
        worldState.shipVelocity.set(0, 0, 0);
        worldState.shipSpeed = 0;
        worldState.nearestBodyId = targetBody.id;
        worldState.nearestDistance = Math.max(
          0,
          worldState.shipPosition.distanceTo(bodyPos) - targetBody.radius
        );

        if (shipGroupRef.current) {
          shipGroupRef.current.position.copy(worldState.shipPosition);
          const orbitTangentYaw = Math.atan2(
            -Math.sin(shipAngle),
            Math.cos(shipAngle)
          );
          _euler.set(0.06, orbitTangentYaw, 0.24);
          _shipQuat.setFromEuler(_euler);
          shipGroupRef.current.quaternion.copy(_shipQuat);
          shipGroupRef.current.visible = true;
        }
        if (streakMatRef.current) {
          streakMatRef.current.opacity = 0;
        }
        worldState.explorationScale =
          targetBody.scaleTier === 'universe'
            ? 'universe'
            : targetBody.scaleTier === 'galactic'
              ? 'galactic'
              : targetBody.scaleTier === 'interstellar'
                ? 'interstellar'
                : 'planetary';
        worldState.shipAltitude = worldState.nearestDistance;
        worldState.shipAcceleration = 0;
        worldState.targetMarker.visible = false;
        return;
      } else {
        worldState.surfaceExploreId = null;
      }
    }

    // 0.5. Smooth Cosmic Scale Glide Transition
    if (worldState.scaleGlideTargetPos && worldState.scaleGlideLookPos) {
      const distToGlide = worldState.shipPosition.distanceTo(
        worldState.scaleGlideTargetPos
      );
      if (distToGlide > Math.max(12, distToGlide * 0.015)) {
        const glideRate = 1 - Math.exp(-3.4 * dt);
        const prevPosLen = worldState.shipPosition.length();
        worldState.shipPosition.lerp(worldState.scaleGlideTargetPos, glideRate);
        const moved =
          Math.abs(worldState.shipPosition.length() - prevPosLen) /
          Math.max(dt, 0.001);
        worldState.shipVelocity.set(0, 0, moved);

        _toTarget
          .copy(worldState.scaleGlideLookPos)
          .sub(worldState.shipPosition);
        if (_toTarget.lengthSq() > 0.01) {
          const targetYaw = Math.atan2(_toTarget.x, _toTarget.z);
          let diff = targetYaw - worldState.shipYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          worldState.shipYaw += diff * (1 - Math.exp(-5 * dt));
        }
        worldState.shipRoll = THREE.MathUtils.damp(worldState.shipRoll, 0, 5, dt);
        worldState.shipPitch = THREE.MathUtils.damp(worldState.shipPitch, 0, 5, dt);
        worldState.isBoosting = distToGlide > 800;
      } else {
        worldState.scaleGlideTargetPos = null;
        worldState.scaleGlideLookPos = null;
        worldState.shipVelocity.multiplyScalar(0.15);
      }
    } else if (worldState.autopilotTargetId) {
      // 1. Autopilot glide toward any selected planet, satellite, star system, or distant galaxy
      const targetBody = getCelestialBodyById(worldState.autopilotTargetId);
      const bodyPos = worldState.planetPositions[worldState.autopilotTargetId];

      if (targetBody && bodyPos) {
        const stopDist =
          targetBody.scaleTier === 'universe'
            ? targetBody.radius * 2.9
            : targetBody.scaleTier === 'galactic'
              ? targetBody.radius * 4.2
              : targetBody.scaleTier === 'interstellar'
                ? targetBody.radius * 5.6
                : targetBody.type === 'Artificial satellite'
                  ? Math.max(targetBody.radius * 5.2, 8.5)
                  : targetBody.hasRings
                    ? targetBody.radius * 3.2 + 12
                    : Math.max(targetBody.radius * 2.65 + 10, 18);

        _toTarget.copy(bodyPos);
        if (_toTarget.lengthSq() > 1 && !targetBody.scaleTier) {
          _toTarget.normalize().multiplyScalar(-stopDist);
        } else {
          _toTarget.set(stopDist * 0.65, stopDist * 0.38, stopDist * 0.72);
        }
        _targetPos.copy(bodyPos).add(_toTarget);
        if (!targetBody.scaleTier) {
          _targetPos.y += targetBody.radius * 0.32 + 2.4;
        }

        const distToStop = worldState.shipPosition.distanceTo(_targetPos);
        const dir = _toTarget.copy(_targetPos).sub(worldState.shipPosition);
        const arriveEps =
          targetBody.scaleTier === 'universe'
            ? 850
            : targetBody.scaleTier === 'galactic'
              ? 420
              : targetBody.scaleTier === 'interstellar'
                ? 140
                : targetBody.type === 'Artificial satellite'
                  ? 2.2
                  : 5.5;

        if (distToStop > arriveEps) {
          dir.normalize();
          const cruiseSpeed = THREE.MathUtils.clamp(distToStop * 2.1, 24, 165000);
          _desiredVel.copy(dir).multiplyScalar(cruiseSpeed);
          worldState.shipVelocity.lerp(_desiredVel, 1 - Math.exp(-4.8 * dt));
          worldState.shipPosition.addScaledVector(worldState.shipVelocity, dt);

          const targetYaw = Math.atan2(dir.x, dir.z);
          let diff = targetYaw - worldState.shipYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          worldState.shipYaw += diff * (1 - Math.exp(-5 * dt));
          worldState.shipRoll = THREE.MathUtils.damp(
            worldState.shipRoll,
            THREE.MathUtils.clamp(-diff * 0.7, -0.5, 0.5),
            6,
            dt
          );
          worldState.shipPitch = THREE.MathUtils.damp(
            worldState.shipPitch,
            -dir.y * 0.35,
            5,
            dt
          );
          worldState.isBoosting = distToStop > 180;
        } else {
          const arrivedId = worldState.autopilotTargetId;
          worldState.autopilotTargetId = null;
          worldState.inspectTargetId = arrivedId;
          worldState.shipVelocity.multiplyScalar(0.2);
          onAutopilotArrive(arrivedId);
        }
      } else {
        worldState.autopilotTargetId = null;
      }
    } else if (worldState.inspectTargetId) {
      // Gentle scenic parking hover while reading the planet/satellite card
      const body = getCelestialBodyById(worldState.inspectTargetId);
      const bodyPos = worldState.planetPositions[worldState.inspectTargetId];
      if (body && bodyPos) {
        worldState.inspectOrbitAngle += dt * 0.1;
        const dist =
          body.type === 'Artificial satellite'
            ? Math.max(body.radius * 5.0, 8.5)
            : body.scaleTier === 'universe'
              ? body.radius * 2.8
              : body.scaleTier === 'galactic'
                ? body.radius * 4.0
                : body.scaleTier === 'interstellar'
                  ? body.radius * 5.4
                  : Math.max(body.radius * 2.55 + 9.5, 16);
        const baseAngle =
          Math.atan2(-bodyPos.z, -bodyPos.x) + worldState.inspectOrbitAngle;
        _targetPos.set(
          bodyPos.x + Math.cos(baseAngle) * dist,
          bodyPos.y + body.radius * 0.28 + 2.0,
          bodyPos.z + Math.sin(baseAngle) * dist
        );
        worldState.shipPosition.lerp(_targetPos, 1 - Math.exp(-2.8 * dt));
        worldState.shipVelocity.set(0, 0, 0);

        const lookYaw = Math.atan2(
          bodyPos.x - worldState.shipPosition.x,
          bodyPos.z - worldState.shipPosition.z
        );
        let diff = lookYaw - worldState.shipYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        worldState.shipYaw += diff * (1 - Math.exp(-4.5 * dt));
        worldState.shipRoll = THREE.MathUtils.damp(worldState.shipRoll, 0.08, 4, dt);
        worldState.shipPitch = THREE.MathUtils.damp(worldState.shipPitch, 0, 4, dt);
      }
    } else {
      // 2. Free Manual Flight Controls with Dynamic Multi-Scale Speed
      const turnSpeed = 1.95;
      worldState.shipYaw -= turnInput * turnSpeed * dt;

      if (Math.abs(throttle) > 0.1 || Math.abs(turnInput) > 0.1) {
        worldState.cameraOrbitYaw = THREE.MathUtils.damp(
          worldState.cameraOrbitYaw,
          0,
          2.2,
          dt
        );
      }

      const distFromOriginNow = worldState.shipPosition.length();
      const { maxSpeed, vertSpeed } = computeAdaptiveMaxSpeed(
        distFromOriginNow,
        worldState.nearestDistance,
        boosting
      );

      _forward.set(
        Math.sin(worldState.shipYaw),
        0,
        Math.cos(worldState.shipYaw)
      );

      _desiredVel.copy(_forward).multiplyScalar(throttle * maxSpeed);
      _desiredVel.y = verticalInput * vertSpeed;

      const accelLambda =
        Math.abs(throttle) > 0.05 || Math.abs(verticalInput) > 0.05 ? 4.2 : 2.6;
      worldState.shipVelocity.lerp(_desiredVel, 1 - Math.exp(-accelLambda * dt));
      worldState.shipPosition.addScaledVector(worldState.shipVelocity, dt);

      // Expanded 25x Cosmic Universe boundary (580,000 units covering all 5 scales)
      const distFromCenter = worldState.shipPosition.length();
      if (distFromCenter > 580000) {
        worldState.shipPosition.multiplyScalar(580000 / distFromCenter);
      }
      worldState.shipPosition.y = THREE.MathUtils.clamp(
        worldState.shipPosition.y,
        -240000,
        260000
      );

      worldState.shipRoll = THREE.MathUtils.damp(
        worldState.shipRoll,
        -turnInput * 0.45,
        6.5,
        dt
      );
      worldState.shipPitch = THREE.MathUtils.damp(
        worldState.shipPitch,
        -verticalInput * 0.28,
        6.0,
        dt
      );
    }

    // Keep ship gently outside planet/star interiors + automatic proximity discovery across all scales
    let closestId = 'sun';
    let closestDist = Infinity;

    for (const body of CELESTIAL_BODIES) {
      const pPos = worldState.planetPositions[body.id];
      if (!pPos) continue;
      const dist = worldState.shipPosition.distanceTo(pPos);
      const surfaceGap = dist - body.radius;

      if (surfaceGap < closestDist) {
        closestDist = surfaceGap;
        closestId = body.id;
      }

      if (
        body.id !== 'asteroid-belt' &&
        body.scaleTier !== 'universe' &&
        body.scaleTier !== 'galactic'
      ) {
        const minSafe =
          body.type === 'Artificial satellite'
            ? body.radius + 2.4
            : body.radius + 4.2;
        if (dist < minSafe && dist > 0.001) {
          _toTarget
            .copy(worldState.shipPosition)
            .sub(pPos)
            .normalize()
            .multiplyScalar(minSafe);
          worldState.shipPosition.copy(pPos).add(_toTarget);
        }
      }

      const discoverThreshold =
        body.scaleTier === 'universe'
          ? body.radius * 4.5
          : body.scaleTier === 'galactic'
            ? body.radius * 6.0
            : body.scaleTier === 'interstellar'
              ? body.radius * 9.0
              : body.type === 'Artificial satellite'
                ? body.radius * 10 + 16
                : body.isHidden
                  ? body.radius * 6 + 65
                  : body.radius * 3.4 + 34;

      if (
        dist < discoverThreshold &&
        !discoveredProximityCache.current.has(body.id)
      ) {
        discoveredProximityCache.current.add(body.id);
        onDiscoverNear(body.id);
      }
    }

    worldState.nearestBodyId = closestId;
    worldState.nearestDistance = Math.max(0, closestDist);
    worldState.shipAltitude = worldState.nearestDistance;
    worldState.shipSpeed = worldState.shipVelocity.length();
    worldState.shipAcceleration =
      (worldState.shipSpeed - prevSpeedRef.current) / Math.max(dt, 0.001);
    prevSpeedRef.current = worldState.shipSpeed;
    worldState.explorationScale = computeExplorationScale(
      worldState.shipPosition.length(),
      worldState.nearestDistance,
      false
    );

    if (shipGroupRef.current) {
      shipGroupRef.current.position.copy(worldState.shipPosition);
      shipGroupRef.current.position.y +=
        Math.sin(state.clock.elapsedTime * 2.6) * 0.14;
      _euler.set(worldState.shipPitch, worldState.shipYaw, worldState.shipRoll);
      _shipQuat.setFromEuler(_euler);
      shipGroupRef.current.quaternion.copy(_shipQuat);
      shipGroupRef.current.visible = worldState.cameraMode !== 'first-person';
    }

    const flameIntensity = worldState.isBoosting
      ? 2.0 + Math.sin(state.clock.elapsedTime * 35) * 0.35
      : 0.45 +
        Math.min(1, worldState.shipSpeed / 120) * 0.9 +
        Math.sin(state.clock.elapsedTime * 24) * 0.12;

    if (flameLeftRef.current && flameRightRef.current && flameCenterRef.current) {
      flameLeftRef.current.scale.set(1, flameIntensity, 1);
      flameRightRef.current.scale.set(1, flameIntensity, 1);
      flameCenterRef.current.scale.set(
        worldState.isBoosting ? 1.35 : 0.85,
        flameIntensity * (worldState.isBoosting ? 1.45 : 0.85),
        worldState.isBoosting ? 1.35 : 0.85
      );
    }

    // High-speed starlight streak tunnel during boost or fast warp autopilot
    if (streaksRef.current && streakMatRef.current) {
      const speedFactor = THREE.MathUtils.clamp(
        (worldState.shipSpeed - 120) / 360,
        0,
        1
      );
      const targetOpacity = worldState.isBoosting
        ? Math.max(0.32, speedFactor * 0.55)
        : speedFactor * 0.35;
      streakMatRef.current.opacity = THREE.MathUtils.damp(
        streakMatRef.current.opacity,
        targetOpacity,
        7,
        dt
      );

      if (streakMatRef.current.opacity > 0.01) {
        const flowSpeed = 1.6 + speedFactor * 2.4;
        const streakLen = 1.6 + speedFactor * 3.4;
        for (let i = 0; i < STREAK_COUNT; i++) {
          const s = STREAK_SEEDS[i];
          const progress = (s.phase + state.clock.elapsedTime * flowSpeed) % 1;
          const zPos = 14 - progress * 28;
          _streakDummy.position.set(
            Math.cos(s.angle) * s.radius,
            Math.sin(s.angle) * s.radius,
            zPos
          );
          _streakDummy.rotation.set(0, 0, 0);
          _streakDummy.scale.set(0.055, 0.055, streakLen);
          _streakDummy.updateMatrix();
          streaksRef.current.setMatrixAt(i, _streakDummy.matrix);
        }
        streaksRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    // 3. Smooth Damped Camera System (3rd-person, 1st-person, and Planet Inspect)
    const camPersp = camera as THREE.PerspectiveCamera;
    const targetFov = worldState.isBoosting ? 64 : 54;
    if (Math.abs(camPersp.fov - targetFov) > 0.05) {
      camPersp.fov = THREE.MathUtils.damp(camPersp.fov, targetFov, 5, dt);
      camPersp.updateProjectionMatrix();
    }

    if (worldState.cameraMode === 'first-person') {
      _forward.set(
        Math.sin(worldState.shipYaw),
        -Math.sin(worldState.shipPitch),
        Math.cos(worldState.shipYaw)
      );
      _camDesiredPos.copy(worldState.shipPosition);
      _camDesiredPos.y += 0.65;
      camera.position.lerp(_camDesiredPos, 1 - Math.exp(-16 * dt));

      const lookYaw = worldState.shipYaw + worldState.cameraOrbitYaw;
      const lookPitch = -worldState.cameraOrbitPitch * 0.55;
      _camLookTarget.set(
        worldState.shipPosition.x + Math.sin(lookYaw) * Math.cos(lookPitch) * 25,
        worldState.shipPosition.y + Math.sin(lookPitch) * 25 + 0.4,
        worldState.shipPosition.z + Math.cos(lookYaw) * Math.cos(lookPitch) * 25
      );
      _camCurrentLook.lerp(_camLookTarget, 1 - Math.exp(-14 * dt));
      camera.lookAt(_camCurrentLook);
    } else if (
      worldState.inspectTargetId &&
      worldState.planetPositions[worldState.inspectTargetId]
    ) {
      const body = getCelestialBodyById(worldState.inspectTargetId)!;
      const bodyPos = worldState.planetPositions[worldState.inspectTargetId];
      const totalYaw = worldState.shipYaw + worldState.cameraOrbitYaw;
      const dist =
        body.type === 'Artificial satellite'
          ? Math.max(worldState.zoomDistance * 0.75, 9.5)
          : Math.max(worldState.zoomDistance, Math.min(body.radius * 1.45 + 8, 95));

      _offset.set(
        -Math.sin(totalYaw) * Math.cos(worldState.cameraOrbitPitch) * dist,
        Math.sin(worldState.cameraOrbitPitch) * dist + 2.2,
        -Math.cos(totalYaw) * Math.cos(worldState.cameraOrbitPitch) * dist
      );
      _camDesiredPos.copy(worldState.shipPosition).add(_offset);
      camera.position.lerp(_camDesiredPos, 1 - Math.exp(-5.5 * dt));

      _camLookTarget.copy(bodyPos).lerp(worldState.shipPosition, 0.25);
      _camCurrentLook.lerp(_camLookTarget, 1 - Math.exp(-6.5 * dt));
      camera.lookAt(_camCurrentLook);
    } else {
      const totalYaw = worldState.shipYaw + worldState.cameraOrbitYaw;
      const dist = worldState.zoomDistance;
      _offset.set(
        -Math.sin(totalYaw) * Math.cos(worldState.cameraOrbitPitch) * dist,
        Math.sin(worldState.cameraOrbitPitch) * dist + 2.2,
        -Math.cos(totalYaw) * Math.cos(worldState.cameraOrbitPitch) * dist
      );
      _camDesiredPos.copy(worldState.shipPosition).add(_offset);
      camera.position.lerp(_camDesiredPos, 1 - Math.exp(-7.5 * dt));

      _camLookTarget.set(
        worldState.shipPosition.x + Math.sin(worldState.shipYaw) * 5,
        worldState.shipPosition.y + 0.8,
        worldState.shipPosition.z + Math.cos(worldState.shipYaw) * 5
      );
      _camCurrentLook.lerp(_camLookTarget, 1 - Math.exp(-9 * dt));
      camera.lookAt(_camCurrentLook);
    }

    // 4. Real-Time 3D-to-2D Target Lock Screen Marker Projection
    const lockId = worldState.lockedTargetId;
    if (lockId && worldState.planetPositions[lockId]) {
      const targetPos = worldState.planetPositions[lockId];
      const targetBody = getCelestialBodyById(lockId);
      const distUnits = Math.max(
        0,
        worldState.shipPosition.distanceTo(targetPos) - (targetBody?.radius ?? 0)
      );

      camera.getWorldDirection(_camForward);
      _toTarget.copy(targetPos).sub(camera.position);
      const isInFront = _toTarget.dot(_camForward) > 0;

      _projVec.copy(targetPos).project(camera);
      let sx = (_projVec.x * 0.5 + 0.5) * 100;
      let sy = (-_projVec.y * 0.5 + 0.5) * 100;

      const onScreen =
        isInFront && sx >= 6 && sx <= 94 && sy >= 10 && sy <= 88;

      if (!onScreen) {
        let dx = _projVec.x;
        let dy = -_projVec.y;
        if (!isInFront) {
          dx = -dx;
          dy = -dy;
        }
        const angle = Math.atan2(dy, dx);
        const padX = 43;
        const padY = 39;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const scale = Math.min(
          Math.abs(cosA) > 0.001 ? padX / Math.abs(cosA) : 999,
          Math.abs(sinA) > 0.001 ? padY / Math.abs(sinA) : 999
        );
        sx = 50 + cosA * scale;
        sy = 50 + sinA * scale;
        worldState.targetMarker.edgeAngleDeg = (angle * 180) / Math.PI + 90;
      } else {
        worldState.targetMarker.edgeAngleDeg = 0;
      }

      worldState.targetMarker.visible = true;
      worldState.targetMarker.targetId = lockId;
      worldState.targetMarker.screenX = sx;
      worldState.targetMarker.screenY = sy;
      worldState.targetMarker.isOnScreen = onScreen;
      worldState.targetMarker.distanceUnits = distUnits;
    } else {
      worldState.targetMarker.visible = false;
      worldState.targetMarker.targetId = null;
    }

    // 5. Real-Time 2D Label Projections (zero-overhead replacement for drei Html)
    updateLabelProjections(camera, size.width, size.height);
  });

  return (
    <group ref={shipGroupRef} position={[2450, 12, 60]}>
      <SpaceshipModel
        flameLeftRef={flameLeftRef}
        flameRightRef={flameRightRef}
        flameCenterRef={flameCenterRef}
      />
      <pointLight
        position={[0, 0.5, 2.2]}
        color="#E0F2FE"
        intensity={1.4}
        distance={22}
        decay={2}
      />
      <instancedMesh
        ref={streaksRef}
        args={[undefined, undefined, STREAK_COUNT]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          ref={streakMatRef}
          color="#BAE6FD"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
