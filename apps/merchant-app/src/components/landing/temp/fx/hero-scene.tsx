'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* A slowly-rotating "network sphere" behind the hero card: a dense field of
 * points distributed evenly over a sphere (Fibonacci lattice) wrapped in a
 * faint wireframe icosahedron so it reads as a connected mesh. Points are
 * tinted bottom→top (cyan → lilac) from the brand palette via vertex colors,
 * and the whole thing drifts under `<Float>`-style idle rotation. Unlit
 * materials → no lights needed; additive blending makes the glow stack.
 *
 * Mounted only on capable, motion-OK, ≥768px devices (see hero-canvas.tsx);
 * everything below the canvas (CSS orb + glass card) is the always-on base. */

const POINT_COUNT = 2600;
const SPHERE_RADIUS = 3.35;
const DUST_COUNT = 420;
const DUST_RADIUS = 6.2;

interface SceneColors {
  /** Primary brand accent (sphere wireframe + mid gradient stop). */
  blue: string;
  /** Cool low-latitude point tint. */
  cyan: string;
  /** Warm high-latitude point tint. */
  lilac: string;
}

/** Evenly-spread points on a unit sphere via the Fibonacci lattice — no
 * clustering at the poles like naive lat/long sampling. */
function fibonacciSphere(count: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2; // 1 → -1
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    out.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return out;
}

/** Sphere of vertex-colored points, tinted by latitude (cyan → lilac). */
function PointSphere({ blue, cyan, lilac }: SceneColors) {
  const geometry = useMemo(() => {
    const points = fibonacciSphere(POINT_COUNT);
    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);

    const cool = new THREE.Color(cyan);
    const mid = new THREE.Color(blue);
    const warm = new THREE.Color(lilac);
    const tint = new THREE.Color();

    points.forEach(([x, y, z], i) => {
      positions[i * 3] = x * SPHERE_RADIUS;
      positions[i * 3 + 1] = y * SPHERE_RADIUS;
      positions[i * 3 + 2] = z * SPHERE_RADIUS;

      // y ∈ [-1, 1] → t ∈ [0, 1]; blend cyan → blue → lilac up the sphere.
      const t = (y + 1) / 2;
      if (t < 0.5) tint.copy(cool).lerp(mid, t * 2);
      else tint.copy(mid).lerp(warm, (t - 0.5) * 2);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [blue, cyan, lilac]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Faint connective wireframe so the points read as a single mesh. */
function WireSphere({ color }: { color: string }) {
  return (
    <mesh>
      <icosahedronGeometry args={[SPHERE_RADIUS, 3]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={0.1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Sparse outer dust for depth — a few points floating off the sphere. */
function Dust({ color }: { color: string }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i += 1) {
      // Deterministic scatter (index-driven) so it never reshuffles on render.
      const a = i * 2.3999632; // golden angle
      const radius = SPHERE_RADIUS + 0.6 + (((i * 53) % 100) / 100) * (DUST_RADIUS - SPHERE_RADIUS);
      const y = Math.sin(a * 1.7) * radius * 0.6;
      const r = Math.sqrt(Math.max(radius * radius - y * y, 0));
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color={color}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Globe(colors: SceneColors) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.09;
      group.current.rotation.z += delta * 0.012;
    }
  });

  return (
    <group ref={group} rotation={[0.42, 0, 0.18]}>
      <PointSphere {...colors} />
      <WireSphere color={colors.blue} />
      <Dust color={colors.cyan} />
    </group>
  );
}

export default function HeroScene(colors: SceneColors) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 11], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Globe {...colors} />
    </Canvas>
  );
}
