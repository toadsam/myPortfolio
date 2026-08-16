"use client";

import {useFrame} from "@react-three/fiber";
import {useMemo, useRef} from "react";
import {AdditiveBlending, NormalBlending, type Points} from "three";

type Variant = "snow" | "petals" | "leaves" | "fireflies";

const CONFIG: Record<
  Variant,
  {
    count: number;
    color: string;
    size: number;
    fall: number;
    drift: number;
    opacity: number;
    rise: boolean;
    glow: boolean;
  }
> = {
  snow: {
    count: 340,
    color: "#ffffff",
    size: 0.17,
    fall: 1.2,
    drift: 0.5,
    opacity: 0.85,
    rise: false,
    glow: false
  },
  petals: {
    count: 210,
    color: "#ffcfe4",
    size: 0.17,
    fall: 0.85,
    drift: 1.0,
    opacity: 0.8,
    rise: false,
    glow: false
  },
  leaves: {
    count: 190,
    color: "#e0863a",
    size: 0.2,
    fall: 1.05,
    drift: 1.3,
    opacity: 0.85,
    rise: false,
    glow: false
  },
  fireflies: {
    count: 90,
    color: "#ffe27a",
    size: 0.16,
    fall: 0,
    drift: 0,
    opacity: 0.95,
    rise: true,
    glow: true
  }
};

const AREA = 34;
const TOP = 18;

function pickVariant(): Variant | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  if (hour >= 20 || hour < 5) return "fireflies"; // 밤 — 계절 무관 반딧불
  if (month === 12 || month <= 2) return "snow";
  if (month >= 3 && month <= 5) return "petals";
  if (month >= 9 && month <= 11) return "leaves";
  return null; // 여름 낮 — 조용
}

function Particles({variant, lite}: {variant: Variant; lite: boolean}) {
  const cfg = CONFIG[variant];
  const count = lite ? Math.round(cfg.count * 0.5) : cfg.count;
  const ref = useRef<Points>(null);

  const {positions, seeds} = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * AREA * 2;
      positions[i * 3 + 1] = cfg.rise
        ? 0.7 + Math.random() * 2.4
        : Math.random() * TOP;
      positions[i * 3 + 2] = (Math.random() - 0.5) * AREA * 2;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return {positions, seeds};
  }, [count, cfg.rise]);

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < count; i += 1) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      const seed = seeds[i] ?? 0;
      if (cfg.rise) {
        arr[ix] = (arr[ix] ?? 0) + Math.cos(t * 0.5 + seed) * 0.006;
        arr[iz] = (arr[iz] ?? 0) + Math.sin(t * 0.4 + seed * 1.3) * 0.006;
        let y = (arr[iy] ?? 0) + Math.sin(t * 0.8 + seed) * 0.004;
        if (y < 0.6) y = 0.6;
        if (y > 3.2) y = 3.2;
        arr[iy] = y;
      } else {
        let y = (arr[iy] ?? 0) - cfg.fall * dt;
        arr[ix] = (arr[ix] ?? 0) + Math.sin(t + seed) * cfg.drift * dt;
        if (y < 0) {
          y = TOP;
          arr[ix] = (Math.random() - 0.5) * AREA * 2;
          arr[iz] = (Math.random() - 0.5) * AREA * 2;
        }
        arr[iy] = y;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={cfg.color}
        size={cfg.size}
        transparent
        opacity={cfg.opacity}
        sizeAttenuation
        depthWrite={false}
        blending={cfg.glow ? AdditiveBlending : NormalBlending}
      />
    </points>
  );
}

export function SeasonAmbience({lite = false}: {lite?: boolean}) {
  const variant = useMemo(() => pickVariant(), []);
  if (!variant) return null;
  return <Particles variant={variant} lite={lite} />;
}
