"use client";

import {Line} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useMemo, useRef} from "react";
import {Vector3, type Mesh} from "three";
import type {BuildingData} from "@/types/portfolio";

// Developer City 이식: 건물 사이를 잇는 네트워크 + 흐르는 펄스 점.
// 각 건물을 가장 가까운 이웃들과 연결하고, 그 선 위로 빛점이 흐른다.

const EDGE_Y = 0.18; // 바닥에서 살짝 띄움
const EDGE_COLOR = "#5b8fd6"; // 스틸블루
const MAX_NEIGHBORS = 2;
const MAX_DISTANCE = 6.5; // 너무 먼 건물끼리는 연결 안 함

interface Edge {
  a: Vector3;
  b: Vector3;
  phase: number; // 펄스 시작 오프셋
}

function buildEdges(buildings: BuildingData[]): Edge[] {
  const points = buildings.map((b) => new Vector3(b.position[0], EDGE_Y, b.position[2]));
  const seen = new Set<string>();
  const edges: Edge[] = [];

  points.forEach((p, i) => {
    // i번 건물에서 가까운 이웃 정렬
    const neighbors = points
      .map((q, j) => ({j, d: p.distanceTo(q)}))
      .filter((n) => n.j !== i && n.d <= MAX_DISTANCE)
      .sort((m, n) => m.d - n.d)
      .slice(0, MAX_NEIGHBORS);

    neighbors.forEach((n) => {
      const key = i < n.j ? `${i}-${n.j}` : `${n.j}-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({a: p, b: points[n.j], phase: Math.random()});
    });
  });

  return edges;
}

function Pulse({edge}: {edge: Edge}) {
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = (performance.now() * 0.00018 + edge.phase) % 1;
    ref.current.position.lerpVectors(edge.a, edge.b, t);
    // 끝부분에서 살짝 페이드
    const fade = Math.sin(t * Math.PI);
    (ref.current.material as {opacity: number}).opacity = 0.25 + fade * 0.65;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshBasicMaterial color={EDGE_COLOR} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

export function BuildingNetwork({buildings}: {buildings: BuildingData[]}) {
  const edges = useMemo(() => buildEdges(buildings), [buildings]);

  return (
    <group>
      {edges.map((e, i) => (
        <Line
          key={`edge-${i}`}
          points={[e.a, e.b]}
          color={EDGE_COLOR}
          transparent
          opacity={0.12}
          lineWidth={1}
          depthWrite={false}
        />
      ))}
      {edges.map((e, i) => (
        <Pulse edge={e} key={`pulse-${i}`} />
      ))}
    </group>
  );
}
