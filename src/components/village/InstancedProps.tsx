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
import {Euler, InstancedMesh, Matrix4, Mesh, type MeshDepthMaterial, Quaternion, Vector3, type BufferGeometry, type Material, type Object3D} from "three";
import type {PropPlacement} from "@/types/props";
import {terrainHeightAt} from "@/lib/villageTerrain";
import {applyGroundMacro, makeMacroTexture} from "@/lib/groundMacro";
import {applyFoliageWind, makeFoliageDepthMaterial, type FoliageWindOptions} from "@/lib/foliageWind";

/** 이 개수를 넘는 GLB만 격자 청크로 쪼갠다. 그 이하는 통째로 하나. */
const CHUNK_THRESHOLD = 80;
/** 청크 하나가 대략 몇 개를 담게 할지 */
const CHUNK_TARGET = 120;
/** GLB 하나가 만들 수 있는 청크 수 상한 */
const MAX_CHUNKS = 9;

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

  // 칸 크기를 고정하면(예전엔 15유닛) 넓게 흩어진 GLB일수록 청크가 폭발한다.
  // 마을을 두르는 숲 띠는 지름 80유닛에 걸쳐 있어 15유닛 격자로는 30칸 —
  // 즉 draw call 30회다. 컬링으로 아끼는 것보다 나누느라 쓰는 게 많아진다.
  // 배치가 퍼진 넓이에서 거꾸로 칸 크기를 구해 청크 수를 MAX_CHUNKS 안에 묶는다.
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const p of placements) {
    x0 = Math.min(x0, p.position[0]);
    x1 = Math.max(x1, p.position[0]);
    z0 = Math.min(z0, p.position[2]);
    z1 = Math.max(z1, p.position[2]);
  }
  const want = Math.min(MAX_CHUNKS, Math.max(1, Math.round(placements.length / CHUNK_TARGET)));
  const size = Math.max(8, Math.sqrt(Math.max(1, (x1 - x0) * (z1 - z0)) / want));

  const cells = new Map<string, PropPlacement[]>();
  for (const p of placements) {
    const cx = Math.floor(p.position[0] / size);
    const cz = Math.floor(p.position[2] / size);
    const key = `${cx}:${cz}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(p);
    else cells.set(key, [p]);
  }
  return [...cells.values()];
}

// ─── 파트 하나 × 청크 하나 = InstancedMesh 하나 ───────────────────────────────
// ─── 그림자 역할 ─────────────────────────────────────────────────────────────
// InstancedMesh는 인스턴스 수와 무관하게 그림자 패스에서도 draw call 1회다.
// 그래도 종류별로 나눠 준다:
//   · 길·광장 타일은 납작한 슬래브라 자기 그림자를 드리울 게 없다 — 받기만.
//   · 임포스터는 교차 빌보드다. 그림자를 켜면 나무 실루엣이 아니라 판때기 두 장이
//     바닥에 X자로 찍힌다. 게다가 숲 띠는 마을 밖이라 그림자 카메라 범위 밖이다.
//   · 나머지(나무·바위·간판·가로등)만 드리운다.
// ─── 잎사귀 색 보정 ──────────────────────────────────────────────────────────
// Meshy 나무는 잎이 아주 밝은 연두다. 잔디(#7f9c56)와 명도가 거의 같아서, 위에서
// 내려다보면 나무와 잔디가 한 덩어리로 뭉갠다 — 컨셉 아트는 나무가 진한 침엽수
// 색이라 밝은 땅 위에서 또렷하게 떨어진다.
//
// 머티리얼 color 는 텍스처에 **곱해지는** 값이라 어둡게만 만들 수 있다. 다행히
// 여기서 필요한 게 정확히 그거다: 빨강·파랑을 더 많이 깎아 초록만 남기면
// 어두워지면서 채도가 오른다.
const FOLIAGE_TINT = {r: 0.68, g: 0.84, b: 0.6};
const isFoliage = (glb: string) => /(tree|bush)-/.test(glb);

// ─── 바람 ────────────────────────────────────────────────────────────────────
// 마을 전체가 한 방향으로 분다. 방위는 컨셉의 노을(서쪽)을 등지는 쪽으로 잡았다.
const WIND_DIRECTION: [number, number] = [0.82, 0.57];
/** 꼭대기가 제 키의 몇 배만큼 눕는지. 나무는 낭창하고 덤불은 뻣뻣하다. */
const WIND_SWAY = {tree: 0.045, bush: 0.022};
/** 흔들리는 속도. 작은 것일수록 빠르게 떤다. */
const WIND_SPEED = {tree: 1.0, bush: 1.6};

// 대지 얼룩을 탈 것 = 땅으로 읽히는 타일. shadowRole 과 같은 판정이다
// (ground/ 와 ground-flat/ 두 갈래). 담장·나무처럼 땅 위에 **서 있는** 것은
// 걸면 안 된다 — 얼룩은 지면의 성질이지 물건의 성질이 아니다.
const isGroundTile = (glb: string) => /ground[-/]/.test(glb);

function shadowRole(glb: string) {
  if (glb.includes("impostor/")) return {cast: false, receive: false};
  // 폴더 이름이 ground/ 와 ground-flat/ 두 갈래다 — 둘 다 잡는다
  if (/ground[-/]/.test(glb)) return {cast: false, receive: true};
  return {cast: true, receive: true};
}

function InstancedPart({
  part,
  placements,
  onPropDown,
  cast,
  receive,
  depthMaterial,
}: {
  part: Part;
  placements: PropPlacement[];
  onPropDown?: (event: ThreeEvent<PointerEvent>, propId: string) => void;
  cast: boolean;
  receive: boolean;
  /** 바람에 흔들리는 식생용. 없으면 three 의 공용 깊이 재질을 쓴다. */
  depthMaterial?: MeshDepthMaterial;
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
      // 구역 단차는 좌표 데이터에 안 굽고 여기서 더한다 — 자세한 이유는
      // src/lib/villageTerrain.ts 머리말. 판석·담장·나무가 전부 이 한 줄로 같이 오른다.
      position.set(
        p.position[0],
        p.position[1] + terrainHeightAt(p.position[0], p.position[2]),
        p.position[2]
      );
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
      castShadow={cast}
      receiveShadow={receive}
      // 그림자도 같이 흔들리게 한다. undefined 면 three 가 공용 깊이 재질을 쓴다.
      customDepthMaterial={depthMaterial}
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
  const {cast, receive} = useMemo(() => shadowRole(glb), [glb]);

  // useGLTF 는 같은 경로를 캐시해 돌려주므로 머티리얼도 하나뿐이다 —
  // 여기서 한 번 물들이면 그 GLB 를 쓰는 모든 인스턴스에 적용된다.
  useMemo(() => {
    if (!isFoliage(glb)) return;
    for (const part of parts) {
      const mats = Array.isArray(part.material) ? part.material : [part.material];
      for (const m of mats) {
        const tinted = m as unknown as {color?: {setRGB: (r: number, g: number, b: number) => void}};
        tinted.color?.setRGB(FOLIAGE_TINT.r, FOLIAGE_TINT.g, FOLIAGE_TINT.b);
      }
    }
  }, [glb, parts]);

  // ─── 바람 ──────────────────────────────────────────────────────────────────
  // 흔들림 가중치는 **그 파트 지오메트리 자신의 y 범위**로 잰다. 셰이더의
  // position 이 바로 그 공간이라, GLB 안에 메시가 여럿이어도 각자 제 밑동이
  // 0 이 되고 제 꼭대기가 1 이 된다.
  //
  // 깊이 재질을 파트마다 따로 만드는 이유는 흔들림 파라미터가 파트마다 다르기
  // 때문이다 — 하나를 돌려쓰면 줄기와 잎의 그림자가 서로 다르게 눕는다.
  const depthByPart = useMemo(() => {
    const map = new Map<string, MeshDepthMaterial | undefined>();
    if (!isFoliage(glb)) return map;
    const bush = /bush-/.test(glb);

    for (const part of parts) {
      part.geometry.computeBoundingBox();
      const box = part.geometry.boundingBox;
      if (!box) continue;
      const height = Math.max(0.001, box.max.y - box.min.y);
      const options: FoliageWindOptions = {
        minY: box.min.y,
        height,
        amplitude: height * (bush ? WIND_SWAY.bush : WIND_SWAY.tree),
        speed: bush ? WIND_SPEED.bush : WIND_SPEED.tree,
        direction: WIND_DIRECTION,
      };
      const mats = Array.isArray(part.material) ? part.material : [part.material];
      for (const m of mats) applyFoliageWind(m, options);
      map.set(part.key, makeFoliageDepthMaterial(options, mats[0]));
    }
    return map;
  }, [glb, parts]);

  // 바닥 타일도 대지 얼룩을 탄다.
  //
  // 잔디 평면에만 걸었더니 **오히려 경계가 더 드러났다** — 평면은 얼룩지고 그 위의
  // 잔디 패치·길 타일만 균일해서, 타일 사각형이 전보다 또렷하게 떠올랐다.
  // 얼룩이 바닥 전체를 하나로 묶으려면 같은 대지를 밟는 것끼리 다 걸려야 한다.
  useMemo(() => {
    if (!isGroundTile(glb)) return;
    const macro = makeMacroTexture();
    for (const part of parts) {
      const mats = Array.isArray(part.material) ? part.material : [part.material];
      for (const m of mats) applyGroundMacro(m, macro);
    }
  }, [glb, parts]);

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
            cast={cast}
            receive={receive}
            depthMaterial={cast ? depthByPart.get(part.key) : undefined}
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
