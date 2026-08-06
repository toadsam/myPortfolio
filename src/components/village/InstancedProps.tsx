"use client";

// 장식물(prop) 인스턴싱 렌더러.
//
// 기존 방식은 prop 1개당 scene.clone(true) + <primitive> 였다.
// 꽃 500송이 = 지오메트리 500벌 + draw call 500회.
//
// 여기서는 같은 GLB끼리 묶어 InstancedMesh 하나로 그린다.
// 꽃 500송이 = 지오메트리 1벌 + draw call 1회. 5000송이여도 draw call은 그대로 1.
//
// ─── 청크에 대해 ──────────────────────────────────────────────────────────────
// three의 프러스텀 컬링은 "오브젝트" 단위다. 마을 전체 꽃을 InstancedMesh 하나로
// 묶으면 카메라 뒤쪽 꽃까지 전부 그리게 된다. 그래서 배치 좌표를 격자 셀로 나눠
// 셀마다 InstancedMesh를 만든다 — 화면 밖 셀은 통째로 스킵된다.
// 단 셀을 잘게 쪼갤수록 draw call이 늘어나므로, 개수가 임계치를 넘을 때만 쪼갠다.

import {useGLTF} from "@react-three/drei";
import type {ThreeEvent} from "@react-three/fiber";
import {Suspense, useLayoutEffect, useMemo, useRef} from "react";
import {Euler, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3, type BufferGeometry, type Material, type Object3D} from "three";
import type {PropPlacement} from "@/types/props";

/** 이 개수를 넘는 GLB만 격자 청크로 쪼갠다. 그 이하는 통째로 하나. */
const CHUNK_THRESHOLD = 80;
/** 청크 격자 한 칸의 크기(월드 유닛). 마을이 대략 40유닛이므로 15면 3~4칸. */
const CHUNK_SIZE = 15;

// ─── GLB → 인스턴싱 가능한 파트 목록 ──────────────────────────────────────────
// GLB 하나에 메시가 여러 개(지붕/벽/창문...) 들어있을 수 있다. 각각 지오메트리와
// 머티리얼이 다르므로 파트마다 InstancedMesh가 하나씩 필요하다.
// GLB 내부의 노드 변환(부모 group의 위치/회전/스케일)은 파트의 로컬 행렬로 미리 굽는다.
interface Part {
  key: string;
  geometry: BufferGeometry;
  material: Material | Material[];
  /** GLB 루트 기준 이 메시의 변환 */
  local: Matrix4;
}

function extractParts(root: Object3D): Part[] {
  root.updateMatrixWorld(true);
  const rootInverse = new Matrix4().copy(root.matrixWorld).invert();
  const parts: Part[] = [];
  let index = 0;
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    parts.push({
      key: `${mesh.name || "mesh"}_${index++}`,
      geometry: mesh.geometry,
      material: mesh.material,
      local: new Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld),
    });
  });
  return parts;
}

// ─── 배치 목록 → 격자 청크 ────────────────────────────────────────────────────
function chunkPlacements(placements: PropPlacement[]): PropPlacement[][] {
  if (placements.length <= CHUNK_THRESHOLD) return [placements];
  const cells = new Map<string, PropPlacement[]>();
  for (const p of placements) {
    const cx = Math.floor(p.position[0] / CHUNK_SIZE);
    const cz = Math.floor(p.position[2] / CHUNK_SIZE);
    const key = `${cx}:${cz}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(p);
    else cells.set(key, [p]);
  }
  return [...cells.values()];
}

// ─── 파트 하나 × 청크 하나 = InstancedMesh 하나 ───────────────────────────────
function InstancedPart({
  part,
  placements,
  onPropDown,
}: {
  part: Part;
  placements: PropPlacement[];
  onPropDown?: (event: ThreeEvent<PointerEvent>, propId: string) => void;
}) {
  const ref = useRef<InstancedMesh>(null);

  // 배치가 바뀔 때만 행렬을 다시 쓴다. 드래그 중엔 매 이동마다 여기로 들어오는데
  // 2000개여도 행렬 곱 2000번이라 1ms 미만이다.
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const quaternion = new Quaternion();
    const euler = new Euler();
    const scale = new Vector3();

    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      position.set(p.position[0], p.position[1], p.position[2]);
      euler.set(0, p.rotationY, 0);
      quaternion.setFromEuler(euler);
      scale.setScalar(p.scale);
      matrix.compose(position, quaternion, scale);
      // 배치 변환 × GLB 내부 변환
      matrix.multiply(part.local);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.count = placements.length;
    mesh.instanceMatrix.needsUpdate = true;
    // 인스턴스 전체를 감싸는 경계구 — 이게 있어야 프러스텀 컬링이 동작한다
    mesh.computeBoundingSphere();
  }, [placements, part.local]);

  // 인스턴싱된 메시는 클릭 시 instanceId로 어느 개체인지 알 수 있다.
  function handleDown(event: ThreeEvent<PointerEvent>) {
    if (!onPropDown) return;
    const id = event.instanceId;
    if (id == null || id >= placements.length) return;
    onPropDown(event, placements[id].id);
  }

  return (
    <instancedMesh
      ref={ref}
      // args의 count는 최대치. 배치가 늘면 React가 새로 만들도록 key로 강제한다.
      args={[part.geometry, part.material as Material, placements.length]}
      onPointerDown={onPropDown ? handleDown : undefined}
    />
  );
}

// ─── GLB 하나에 속한 모든 배치 ────────────────────────────────────────────────
function GlbInstances({
  glb,
  placements,
  onPropDown,
}: {
  glb: string;
  placements: PropPlacement[];
  onPropDown?: (event: ThreeEvent<PointerEvent>, propId: string) => void;
}) {
  const {scene} = useGLTF(glb);
  const parts = useMemo(() => extractParts(scene), [scene]);
  const chunks = useMemo(() => chunkPlacements(placements), [placements]);

  return (
    <>
      {chunks.map((chunk, chunkIndex) =>
        parts.map((part) => (
          // placements.length가 바뀌면 InstancedMesh를 새로 할당해야 한다 (args 변경)
          <InstancedPart
            key={`${chunkIndex}:${part.key}:${chunk.length}`}
            part={part}
            placements={chunk}
            onPropDown={onPropDown}
          />
        ))
      )}
    </>
  );
}

// ─── 엔트리 ──────────────────────────────────────────────────────────────────
export function InstancedProps({
  items,
  onPropDown,
}: {
  items: PropPlacement[];
  onPropDown?: (event: ThreeEvent<PointerEvent>, propId: string) => void;
}) {
  // GLB별 그룹핑 — 이게 인스턴싱의 전부다
  const groups = useMemo(() => {
    const map = new Map<string, PropPlacement[]>();
    for (const p of items) {
      const bucket = map.get(p.glb);
      if (bucket) bucket.push(p);
      else map.set(p.glb, [p]);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <>
      {groups.map(([glb, placements]) => (
        // GLB별로 Suspense를 나눠 하나가 늦게 와도 나머지는 먼저 보인다
        <Suspense key={glb} fallback={null}>
          <GlbInstances glb={glb} placements={placements} onPropDown={onPropDown} />
        </Suspense>
      ))}
    </>
  );
}
