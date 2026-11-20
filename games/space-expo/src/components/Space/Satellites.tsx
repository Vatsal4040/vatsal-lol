import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CELESTIAL_BODIES,
  CelestialBodyData,
} from '../../data/celestialBodies';
import { createPlanetTexture } from '../../utils/webgl';
import { worldState } from '../../utils/worldState';

interface SatellitesProps {
  selectedId: string | null;
  showOrbits: boolean;
  onSelect: (id: string) => void;
}

/** Composite multi-part International Space Station model */
function ISSModel() {
  return (
    <group scale={0.55}>
      {/* Central integrated aluminum truss spine */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.22, 5.4, 0.22]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.72} roughness={0.32} />
      </mesh>
      {/* Pressurized Destiny / Zvezda habitat core perpendicular to truss */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 2.5, 10]} />
        <meshStandardMaterial color="#F8FAFC" metalness={0.28} roughness={0.38} />
      </mesh>
      {/* Node docking hubs & Cupola observation dome */}
      <mesh position={[0, 0, 1.38]}>
        <cylinderGeometry args={[0.24, 0.28, 0.45, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.32, 0.25]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={0.45}
          metalness={0.5}
          roughness={0.18}
        />
      </mesh>
      {/* Side Columbus & Kibo science modules */}
      <mesh position={[0.7, 0, 0.52]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.95, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.35} roughness={0.42} />
      </mesh>
      <mesh position={[-0.7, 0, 0.52]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.95, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.35} roughness={0.42} />
      </mesh>
      {/* 8 Photovoltaic Solar Array Wings (4 starboard, 4 port) */}
      {[-2.35, -1.62, 1.62, 2.35].map((xPos, i) => (
        <group key={i} position={[xPos, 0, 0]}>
          {/* Upper solar wing */}
          <mesh position={[0, 0, 1.25]}>
            <boxGeometry args={[0.56, 0.04, 1.95]} />
            <meshStandardMaterial
              color="#1E3A8A"
              emissive="#1D4ED8"
              emissiveIntensity={0.22}
              metalness={0.62}
              roughness={0.26}
            />
          </mesh>
          {/* Gold structural spine */}
          <mesh position={[0, 0.025, 1.25]}>
            <boxGeometry args={[0.07, 0.03, 1.98]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.24} />
          </mesh>
          {/* Lower solar wing */}
          <mesh position={[0, 0, -1.25]}>
            <boxGeometry args={[0.56, 0.04, 1.95]} />
            <meshStandardMaterial
              color="#1E3A8A"
              emissive="#1D4ED8"
              emissiveIntensity={0.22}
              metalness={0.62}
              roughness={0.26}
            />
          </mesh>
          <mesh position={[0, 0.025, -1.25]}>
            <boxGeometry args={[0.07, 0.03, 1.98]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.24} />
          </mesh>
        </group>
      ))}
      {/* Thermal radiator panels */}
      <mesh position={[0.92, 0, -0.78]}>
        <boxGeometry args={[0.35, 0.03, 0.95]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-0.92, 0, -0.78]}>
        <boxGeometry args={[0.35, 0.03, 0.95]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

/** Composite multi-part Hubble Space Telescope model */
function HubbleModel() {
  return (
    <group scale={0.58}>
      {/* Main silver reflective optical tube */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.44, 2.3, 12]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.84} roughness={0.22} />
      </mesh>
      {/* Aft equipment shroud */}
      <mesh position={[0, 0, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.54, 0.52, 0.85, 12]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.78} roughness={0.3} />
      </mesh>
      {/* Open hinged aperture door */}
      <mesh position={[0, 0.42, 1.38]} rotation={[0.62, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 12]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.24} />
      </mesh>
      {/* Deep dark optical lens opening */}
      <mesh position={[0, 0, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 12]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Twin blue photovoltaic solar array wings */}
      {[-1.55, 1.55].map((xPos, i) => (
        <group key={i} position={[xPos, 0, -0.25]}>
          <mesh>
            <boxGeometry args={[2.1, 0.05, 0.68]} />
            <meshStandardMaterial
              color="#1D4ED8"
              emissive="#2563EB"
              emissiveIntensity={0.24}
              metalness={0.62}
              roughness={0.24}
            />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[2.12, 0.02, 0.06]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Twin high-gain communication dish antennas */}
      <mesh position={[0, 0.88, -0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.34, -0.35]}>
        <coneGeometry args={[0.28, 0.14, 10]} />
        <meshStandardMaterial color="#F8FAFC" metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Composite multi-part GPS Navigation Satellite model */
function GpsSatelliteModel() {
  return (
    <group scale={0.56}>
      {/* Golden thermal-foil octagonal spacecraft bus */}
      <mesh>
        <cylinderGeometry args={[0.56, 0.56, 0.88, 8]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.86}
          roughness={0.24}
          flatShading
        />
      </mesh>
      {/* Phased-array Earth-facing navigation antenna plate */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.16, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Helical radio transmitter pins */}
      {[
        [0.18, -0.7, 0.18],
        [-0.18, -0.7, 0.18],
        [0.18, -0.7, -0.18],
        [-0.18, -0.7, -0.18],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.045, 0.045, 0.24, 6]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0EA5E9"
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}
      {/* Twin wide solar wings on articulated booms */}
      {[-1.75, 1.75].map((xPos, i) => (
        <group key={i} position={[xPos, 0, 0]}>
          <mesh position={[xPos > 0 ? -0.9 : 0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.65, 6]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh>
            <boxGeometry args={[2.1, 0.05, 0.85]} />
            <meshStandardMaterial
              color="#1E40AF"
              emissive="#1D4ED8"
              emissiveIntensity={0.25}
              metalness={0.65}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[2.12, 0.02, 0.07]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.85} roughness={0.22} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Textured low-poly natural moon (Europa / Titan) */
function NaturalSatelliteMesh({
  data,
  hovered,
}: {
  data: CelestialBodyData;
  hovered: boolean;
}) {
  const texture = useMemo(() => createPlanetTexture(data.id, 4), [data.id]);
  const haloMat = useMemo(() => {
    if (!data.atmosphereColor) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(data.atmosphereColor) },
        uIntensity: { value: data.id === 'titan' ? 0.55 : 0.28 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vec3 viewDir = normalize(vViewPos);
          float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
          float glow = pow(rim, 3.2) * uIntensity;
          gl_FragColor = vec4(uColor, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
  }, [data.atmosphereColor, data.id]);

  useEffect(() => {
    return () => {
      texture.dispose();
      haloMat?.dispose();
    };
  }, [texture, haloMat]);

  return (
    <group scale={hovered ? 1.08 : 1}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[data.radius, 3]} />
        <meshStandardMaterial
          map={texture}
          roughness={data.id === 'europa' ? 0.42 : 0.78}
          metalness={data.id === 'europa' ? 0.14 : 0.04}
          flatShading
        />
      </mesh>
      {haloMat && (
        <mesh renderOrder={3}>
          <sphereGeometry args={[data.radius * 1.08, 22, 22]} />
          <primitive object={haloMat} attach="material" />
        </mesh>
      )}
    </group>
  );
}

function SatelliteOrbiter({
  data,
  isSelected,
  showOrbit,
  onSelect,
}: {
  data: CelestialBodyData;
  isSelected: boolean;
  showOrbit: boolean;
  onSelect: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const orbitRingRef = useRef<THREE.LineLoop>(null);
  const [hovered, setHovered] = useState(false);

  const isArtificial = data.type === 'Artificial satellite';

  const orbitGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segs = 72;
    const inc = data.inclination ?? 0;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * data.orbitRadius,
          Math.sin(a) * inc,
          Math.sin(a) * data.orbitRadius
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [data.orbitRadius, data.inclination]);

  useEffect(() => {
    return () => orbitGeo.dispose();
  }, [orbitGeo]);

  useFrame((_, delta) => {
    const parentId = data.parentId;
    if (!parentId) return;
    const parentPos = worldState.planetPositions[parentId];
    if (!parentPos) return;

    if (orbitRingRef.current) {
      orbitRingRef.current.position.copy(parentPos);
    }

    const angle = data.initialAngle + worldState.simTime * data.orbitSpeed;
    const sx = parentPos.x + Math.cos(angle) * data.orbitRadius;
    const sy = parentPos.y + Math.sin(angle) * (data.inclination ?? 0);
    const sz = parentPos.z + Math.sin(angle) * data.orbitRadius;

    if (groupRef.current) {
      groupRef.current.position.set(sx, sy, sz);
    }
    if (worldState.planetPositions[data.id]) {
      worldState.planetPositions[data.id].set(sx, sy, sz);
    }

    if (spinRef.current && !worldState.isPaused) {
      if (isArtificial) {
        // Keep artificial satellites gracefully oriented along their orbital velocity vector
        spinRef.current.rotation.y = -angle + Math.PI * 0.5;
        spinRef.current.rotation.z = data.tilt;
      } else {
        spinRef.current.rotation.y += Math.min(delta, 0.05) * data.rotationSpeed;
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  return (
    <group>
      {showOrbit && (
        <lineLoop ref={orbitRingRef} geometry={orbitGeo}>
          <lineBasicMaterial
            color={isSelected ? data.color : isArtificial ? '#38BDF8' : '#94A3B8'}
            transparent
            opacity={isSelected ? 0.62 : isArtificial ? 0.24 : 0.18}
          />
        </lineLoop>
      )}

      <group
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <group ref={spinRef} scale={isArtificial && hovered ? 1.15 : 1}>
          {data.id === 'iss-station' ? (
            <ISSModel />
          ) : data.id === 'hubble-telescope' ? (
            <HubbleModel />
          ) : data.id === 'gps-satellite' ? (
            <GpsSatelliteModel />
          ) : (
            <NaturalSatelliteMesh data={data} hovered={hovered} />
          )}
        </group>

        {/* Subtle click-assist hull for smaller artificial satellites */}
        {isArtificial && (
          <mesh visible={false}>
            <sphereGeometry args={[data.radius * 1.85, 8, 8]} />
            <meshBasicMaterial />
          </mesh>
        )}

        {(hovered || isSelected) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.48, data.radius * 1.62, 24]} />
            <meshBasicMaterial
              color={isSelected ? '#38BDF8' : '#F8FAFC'}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * Renders artificial Earth satellites (ISS, Hubble, GPS) and major outer moons (Europa, Titan).
 */
export function Satellites({
  selectedId,
  showOrbits,
  onSelect,
}: SatellitesProps) {
  const satellites = useMemo(
    () =>
      CELESTIAL_BODIES.filter(
        (b) => b.parentId && b.id !== 'moon'
      ),
    []
  );

  return (
    <group>
      {satellites.map((sat) => (
        <SatelliteOrbiter
          key={sat.id}
          data={sat}
          isSelected={selectedId === sat.id}
          showOrbit={showOrbits}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
