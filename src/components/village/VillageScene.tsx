"use client";

import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Billboard,
  ContactShadows,
  Html,
  useGLTF,
  useProgress,
  useTexture
} from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  LUT,
  N8AO,
  ToneMapping
} from "@react-three/postprocessing";
import {ToneMappingMode} from "postprocessing";
import {memo, Suspense, useEffect, useMemo, useRef, useState} from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  Vector3
} from "three";
import propsLayout from "@/data/propsLayout.json";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {
  createThrottledCalculatePosition,
  LABEL_SYNC_STRIDE
} from "@/lib/htmlLabelThrottle";
import {spread, villageBuildings} from "@/lib/constants";
import {AO_ENABLED, LUT_ENABLED, VILLAGE_PALETTE} from "@/lib/villagePalette";
import {makeGradeLut} from "@/lib/villageGrade";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import {MOAT, RELIEF_ENABLED, reliefAt} from "@/lib/villageRelief";
import {makeCloudTexture} from "@/lib/skyClouds";
import {
  advanceWaterFlow,
  applyWaterBed,
  applyWaterFlow,
  applyWaterSurface,
  makeWaterNormal
} from "@/lib/waterFlow";
import {advanceFoliageWind} from "@/lib/foliageWind";
import {applyGroundMacro, makeMacroTexture} from "@/lib/groundMacro";
import {makeBankTexture} from "@/lib/terraceBank";
import {
  DAIS_RADII,
  ISLAND_COMMONS,
  ISLAND_LANES,
  ISLANDS,
  isWater,
  PLAZA_DAIS,
  PLAZA_RING,
  PLAZA_STEP,
  LAGOON,
  shoreDistAt,
  TERRACE_STEP,
  terrainHeightAt,
  WATER_BANK_OUT,
  WATER_CHANNELS,
  WATER_FULL_DEPTH,
  waterHalfAt
} from "@/lib/villageTerrain";
import buildingModels from "@/data/buildingModels.json";
import {buildBuildingStateMap, buildNpcStateMap} from "@/lib/liveState";
import type {NpcRuntimeState, VillageState} from "@/types/live";
import type {
  ExplorationMode,
  NPCData,
  SectionId,
  Vector3Tuple
} from "@/types/portfolio";
import {Building} from "./Building";
import {BuildingNetwork} from "./BuildingNetwork";
import {CameraController} from "./CameraController";
import {CharacterController} from "./CharacterController";
import {NPC, type NpcCommand} from "./NPC";
import {PerfHudPanel, PerfProbe} from "./PerfHud";
import {SeasonAmbience} from "./SeasonAmbience";
import {PropsEditorTray, PropsLayer, usePropsEditor} from "./PropsEditor";

interface VillageSceneProps {
  activeSection: SectionId;
  activeNpcId?: string;
  explorationMode: ExplorationMode;
  isIntro?: boolean;
  onSelectSection: (sectionId: SectionId) => void;
  onSelectNpc: (npc: NPCData) => void;
  onRequestEnter: (buildingId: string) => void;
  npcRuntimeStates: Record<string, NpcRuntimeState>;
  onNpcPositionChange: (npcId: string, position: Vector3Tuple) => void;
  villageState: VillageState | null;
  guideScriptedTarget?: Vector3Tuple | null;
  onGuideArrive?: () => void;
  guideForceHold?: boolean;
  cinematic?: {
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null;
  npcCommand?: NpcCommand | null;
  npcCommandTargets?: Record<string, Vector3Tuple>;
  overseerTarget?: Vector3Tuple | null;
  onEditingChange?: (editing: boolean) => void;
  npcSocialTargets?: Record<string, Vector3Tuple>;
}

// 네트워크 펄스로 연결할 프로젝트 건물들 (한 번만 계산)
const projectNetworkBuildings = villageBuildings.filter(
  b => b.district === "projects"
);

// walk 모드/편집 중엔 건물 클릭 입장을 비활성화 — 매 렌더 새 화살표 함수를 만들지 않도록 고정 참조 사용
const noopRequestEnter = () => {};

// 가이드 NPC 연출 시작 지점 — 매 렌더 새 배열을 만들지 않도록 모듈 상수로 고정
const GUIDE_SCRIPTED_START: [number, number, number] = [-4, 0, 1];

// 광장 한복판의 임시 조형물. 사이버펑크 시절의 파란 결정체라 지금 마을 톤에서
// 혼자 튀는데, 화면 정중앙에 가장 크게 잡히는 물건이라 비워 둘 수도 없었다.
//
// central-plaza.glb 가 들어오면 Building 이 같은 자리에 진짜 기념비를 그리므로
// 이건 자동으로 빠진다 — 모델을 넣고 나서 이 컴포넌트를 지우는 걸 잊어도
// 조형물 두 개가 겹치는 사고가 안 난다.
const PLAZA_LANDMARK_READY = "central-plaza" in buildingModels;

function Statue() {
  const {scene} = useGLTF("/models/environment/statue.glb");
  useMemo(() => lockSceneMaterials(scene), [scene]);
  return (
    <primitive
      object={scene}
      position={[0, 2.5, 2]}
      scale={[3.5, 3.5, 3.5]}
      castShadow
    />
  );
}

useGLTF.preload("/models/environment/statue.glb");

// 마을 바닥.
//
// 예전엔 environment/ground.glb(사이버펑크 원반 + 청록 pointLight)를 깔았는데
// 두 가지가 걸렸다. ① 반지름이 x ±16.2 / z −14.2~18.2 라서, 구역을 바깥으로
// 밀어놓은 지금의 마을(x −19.8~21.3 / z −14.9~22.0)에선 가장자리 건물이 바닥
// 밖에 떠 있었다. ② 안쪽 바닥이 y = −0.3인데 건물은 y = 0에 서 있어 0.3만큼 떴다.
//
// 그래서 잔디 텍스처를 반복해 까는 메시 하나로 바꿨다. 길·광장은 이 위에
// propsLayout.json의 ground 프롭(GLB 타일)이 얹힌다.
//
// ─── 그리고 지금은 호수 위의 섬이다 ──────────────────────────────────────────
//
// 예전엔 90×90 평면 하나였고 fog가 far 70에서 가장자리를 먹어 감췄다. 그래서
// 카메라를 눈높이로 내리면 "초록 판때기 + 그 위 하늘"이 전부였다. 이제 잔디를
// 원반으로 자르고, 그 둘레에 절벽(IslandCliff)을 두르고, 그 밖은 물(Water)이다.
// 물 건너에는 먼 산(DistantHills)이 선다. 마을 → 절벽 → 물 → 산, 네 겹이 겹치면서
// 깊이가 생긴다.
//
// ISLAND_RADIUS 는 마을 밖 프롭까지 다 품어야 한다.
//
// **해자보다 반드시 커야 한다.** 건물을 1.4배로 키우며 해자를 a=40 까지 넓혔는데,
// 해자는 굽이(drift ±1.9)와 리본 반폭(1.23)까지 더해 43.2 까지 나간다. 40 으로
// 두면 물이 잔디 원반을 넘어 절벽 위 허공에 흐른다.
// 그 바깥에 숲 띠가 설 자리(예전 기준 약 10유닛)까지 남겨 53 으로 잡는다.
// 숲은 교차 빌보드라 그루당 6삼각형뿐이므로, 원반을 넓혀도 삼각형 비용은 거의 없다.
const ISLAND_CENTER: [number, number, number] = [0, 0, 3];
const ISLAND_RADIUS = 53;
/** 절벽이 물까지 떨어지는 깊이 */
const CLIFF_DROP = 9;
/** 수면 높이 — 절벽 중턱쯤에 둬야 벼랑이 물에 잠긴 것처럼 보인다 */
const WATER_Y = -5.2;
/** 잔디 텍스처 1장이 덮는 월드 크기(유닛). 작을수록 잔디결이 촘촘해진다. */
// 512px 텍스처를 4유닛에 펴 바르면 카메라를 붙였을 때 결이 뭉개져 초록 죽처럼 보인다.
//
// 길 타일은 512px 텍스처가 1.88유닛(타일 한 칸)을 덮는다. 평면이 2.6유닛이면
// 같은 화면 안에서 평면만 결이 성겨 밉맵에 뭉개지고, 타일의 잔디 갓길만 또렷해서
// 길가에 밝은 사각형이 줄지어 보였다. 타일과 비슷한 밀도로 맞춘다.
// 정확히 1.88로 두면 타일 격자와 주기가 겹쳐 물결무늬가 생기므로 조금 어긋낸다.
const GRASS_TILE_WORLD = 2.0;
// 색 보정은 이제 텍스처에 구워져 있다.
//
// 예전엔 풀숲 슬래브에서 뽑은 그림을 쓰면서, 길 타일 갓길과 색을 맞추려고 선형
// 공간에서 역산한 tint(#e4ed9f)를 곱했다. 그런데 그 그림에는 둔덕 같은 큰 덩어리가
// 있어 2.6유닛마다 격자로 되풀이돼 이불 누빔처럼 보였다.
// 지금은 scripts/make-grass-texture.mjs 가 큰 구조 없는 잔디를 갓길 색 그대로
// 만들어 낸다 — 곱할 게 없으니 흰색이다. 색을 바꾸려면 그 스크립트를 고칠 것.
const GRASS_TINT = "#ffffff";

// 잔디 텍스처는 scripts/make-grass-texture.mjs 가 만든다. 색은 길 타일 갓길에서
// 실측한 값이라, 길이 지나가도 경계가 안 드러난다. 예전 grass.jpg는 연노랑 초록이라
// 길이 잔디 위에 얹힌 초록 리본처럼 떠 보였다.
function Ground() {
  const map = useTexture("/textures/grass-village.png");
  // 대지 얼룩(아래층). 잔디 결과 곱해져서 큰 덩어리를 만든다 — src/lib/groundMacro.ts
  const macro = useMemo(() => makeMacroTexture(), []);
  useEffect(() => {
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    // circleGeometry 의 uv 는 외접 정사각형 기준 0~1 이라, 평면일 때와 같은 식으로
    // 반복 수를 구하면 된다 (지름 = 반지름 × 2).
    const span = ISLAND_RADIUS * 2;
    map.repeat.set(span / GRASS_TILE_WORLD, span / GRASS_TILE_WORLD);
    map.anisotropy = 8;
    map.colorSpace = SRGBColorSpace;
    map.needsUpdate = true;
  }, [map]);

  // ─── 들판 굽이 (villageRelief) ─────────────────────────────────────────────
  // circleGeometry 는 부채꼴 한 장이라 **내부 정점이 없다** — 굽힐 점 자체가
  // 없으므로, 링×세그먼트 격자를 직접 짜고 정점마다 reliefAt 를 넣는다.
  // terrainHeightAt(단+굽이)이 아니라 reliefAt(굽이만)인 이유: 이 원반은 구역 단
  // **밑을 그대로 지나가고**, 단 위는 TerraceTops 가 따로 덮는다.
  //
  // 가장 바깥 링은 반지름 40 — reliefAt 는 39 에서 0 이 되므로 절벽(IslandCliff)
  // 안쪽 링과 정확히 y=0 에서 만난다.
  const geometry = useMemo(() => {
    if (!RELIEF_ENABLED) return null;
    const SEG = 128;
    const RINGS = 44; // 링 간격 ≈ 0.9유닛 — 가장 짧은 파장(7유닛)을 넉넉히 담는다
    const [cx, , cz] = ISLAND_CENTER;
    const positions: number[] = [];
    const gUvs: number[] = [];
    const indices: number[] = [];

    positions.push(cx, reliefAt(cx, cz), cz);
    gUvs.push(0.5, 0.5);
    for (let r = 1; r <= RINGS; r++) {
      const radius = (r / RINGS) * ISLAND_RADIUS;
      for (let s = 0; s < SEG; s++) {
        const a = (s / SEG) * Math.PI * 2;
        const x = cx + Math.cos(a) * radius;
        const z = cz + Math.sin(a) * radius;
        positions.push(x, reliefAt(x, z), z);
        // circleGeometry 의 uv 와 같은 규칙(외접 정사각형 0~1) — 위의
        // map.repeat 계산이 그대로 맞는다.
        gUvs.push(
          (x - cx) / (ISLAND_RADIUS * 2) + 0.5,
          (z - cz) / (ISLAND_RADIUS * 2) + 0.5
        );
      }
    }
    for (let s = 0; s < SEG; s++) {
      // 위(+Y)를 보는 감김 순서 — 뒤집으면 잔디가 밑에서만 보인다
      indices.push(0, 1 + ((s + 1) % SEG), 1 + s);
    }
    for (let r = 1; r < RINGS; r++) {
      const ringA = 1 + (r - 1) * SEG;
      const ringB = 1 + r * SEG;
      for (let s = 0; s < SEG; s++) {
        const sn = (s + 1) % SEG;
        indices.push(ringA + s, ringB + sn, ringB + s);
        indices.push(ringA + s, ringA + sn, ringB + sn);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(gUvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals(); // 굽이가 빛을 받는 건 전부 이 법선 덕이다
    return geo;
  }, []);

  // polygonOffset — 길 타일이 잔디에 파묻히는 걸 막는다.
  // 타일 윗면은 잔디보다 겨우 몇 cm 위인데, 이 거대한 바닥과 깊이값이 사실상 같아서
  // 조금만 멀어지면 잔디가 이겨버려 길이 통째로 사라졌다.
  // 잔디만 깊이 방향으로 뒤로 밀어두면 여유가 얼마든 항상 타일이 이긴다.
  //
  // 사각 평면이 아니라 원반이다 — 섬의 윗면이니까. 절벽(IslandCliff)이 정확히
  // 같은 반지름에서 시작해 이어받는다.
  const material = (
    <meshStandardMaterial
      ref={m => m && applyGroundMacro(m, macro)}
      map={map}
      color={GRASS_TINT}
      roughness={0.95}
      metalness={0}
      polygonOffset
      polygonOffsetFactor={2}
      polygonOffsetUnits={4}
    />
  );

  // 굽이 격자는 월드 좌표로 지었으므로 이동·회전 없이 그대로 놓는다.
  if (geometry) {
    return (
      <mesh geometry={geometry} receiveShadow>
        {material}
      </mesh>
    );
  }
  return (
    <mesh
      position={ISLAND_CENTER}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <circleGeometry args={[ISLAND_RADIUS, 128]} />
      {material}
    </mesh>
  );
}

// ─── 섬 절벽 ─────────────────────────────────────────────────────────────────
// 잔디 원반이 끝나는 자리에서 물까지 떨어지는 바위 벼랑.
//
// 안쪽 테두리는 잔디와 **정확히 같은 반지름**이라 이음매가 안 생긴다. 해안선의
// 불규칙함은 바깥 테두리에서만 만든다 — 어차피 물 위에서 보이는 건 그쪽이다.
// 안쪽을 흔들면 잔디와의 사이가 벌어져 구멍이 뚫린다.
const CLIFF_SEGMENTS = 128;
const CLIFF_RINGS = 6;

function IslandCliff() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const rim = new Color("#6a8557"); // 잔디와 만나는 윗단
    const rock = new Color("#8a7a63"); // 볕 드는 바위
    const deep = new Color("#43382f"); // 물에 잠기는 아래쪽
    const mixed = new Color();

    for (let ri = 0; ri <= CLIFF_RINGS; ri++) {
      const t = ri / CLIFF_RINGS;
      for (let ai = 0; ai <= CLIFF_SEGMENTS; ai++) {
        const angle = (Math.PI * 2 * ai) / CLIFF_SEGMENTS;
        // 바깥으로 나갈수록 튀어나온 곶과 들어간 만이 생긴다
        const jut =
          3.2 +
          2.6 * Math.sin(angle * 3 + 0.9) +
          1.6 * Math.sin(angle * 7 + 2.1);
        const radius = ISLAND_RADIUS + t * Math.max(1.2, jut);
        // t^1.5 — 위쪽은 완만하게 시작해 아래로 갈수록 가팔라진다(벼랑 느낌)
        const y = -CLIFF_DROP * Math.pow(t, 1.5);
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        mixed
          .copy(t < 0.18 ? rim : rock)
          .lerp(deep, Math.min(1, Math.max(0, (t - 0.18) / 0.82)));
        if (t < 0.18) mixed.copy(rim).lerp(rock, t / 0.18);
        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }

    const stride = CLIFF_SEGMENTS + 1;
    for (let ri = 0; ri < CLIFF_RINGS; ri++) {
      for (let ai = 0; ai < CLIFF_SEGMENTS; ai++) {
        const a = ri * stride + ai;
        indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={ISLAND_CENTER} receiveShadow>
      {/* emissive: 밤에 달빛을 등진 곶이 **완전 검정 실루엣**이 되면, 바다 위에
          뜬 각진 검은 다각형(유령 지느러미)으로 읽힌다. 달빛색 바닥광을 깔아
          실루엣에도 바위 형태가 남게 한다. 세기는 등불 세기(GLINT_STRENGTH)를
          따라 밤에만 켜진다 — 한낮에는 0 이라 절벽 색이 안 바랜다. */}
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        metalness={0}
        emissive="#2e3c55"
        emissiveIntensity={0.42 * GLINT_STRENGTH}
      />
    </mesh>
  );
}

// ─── 물 ──────────────────────────────────────────────────────────────────────
// 셰이더 없이 평면 한 장. 삼각형 2개에 draw call 1회다.
// 파도를 넣고 싶어질 텐데, 카메라가 늘 섬 위에 있어서 수면은 늘 멀리 비스듬히
// 보인다 — 그 각도에선 잔물결이 거의 안 읽히고 fog가 대부분 먹는다.
// roughness 를 낮춰 하늘빛을 받는 것만으로 충분히 물처럼 보인다.
function Water() {
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: "#2d6a86",
      roughness: 0.22,
      metalness: 0.25
    });
    // 호수는 **흐르지 않는다.** 두 층을 거의 마주보는 방향으로 흘려 무늬가 한쪽으로
    // 미끄러지는 대신 서로 간섭하게 둔다 — 제자리에서 반짝이는 게 고인 물이다.
    // 속도도 개울의 1/20 이다. 여기서 빠르면 호수가 강처럼 보인다.
    applyWaterFlow(m, makeWaterNormal(), {
      scaleA: 96,
      scaleB: 61,
      dirA: [1, 0.16],
      dirB: [-0.86, 0.42],
      speed: 0.02,
      normalScale: 0.6,
      // 큰 너울 층 — 96 배율 잔결만으로는 바다 전체에 같은 반짝임 타일이
      // 96번 되풀이되는 게 부감에서 그대로 보였다. 성긴 층이 그 주기를 깬다.
      scaleC: 11,
      bigWeight: 1.3
    });
    return m;
  }, []);

  return (
    <mesh
      material={material}
      position={[ISLAND_CENTER[0], WATER_Y, ISLAND_CENTER[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[240, 64]} />
    </mesh>
  );
}

// ─── 밤 물비침 (등불 글린트) ─────────────────────────────────────────────────
// 컨셉의 밤 그림에서 물이 화면을 채우는 건 **등불이 수면에 비쳐서**다. 우리 물은
// 밤에 반사할 광원이 없어 검푸른 판이 됐다. 진짜 평면 반사는 비싸니, 물가
// 등불마다 수면에 가산 블렌딩 타원(가짜 반사)을 눕힌다 — 멀리서는 진짜 비침과
// 구분이 안 되고, 값은 등불당 삼각형 2개다.
//
// 세기는 시간대 팔레트의 lamp(등불 세기)를 따른다 — 한낮(0.7)에는 0 이 되어
// 아예 안 그린다. 등불 자체가 lamp 로 밝아지므로 비침도 같이 밝아지는 게 맞다.
const GLINT_STRENGTH = Math.max(
  0,
  Math.min(1, (VILLAGE_PALETTE.lamp - 0.85) / 1.6)
);

function WaterGlints() {
  const {texture, spots} = useMemo(() => {
    // 세로로 긴 부드러운 타원 스프라이트 — 캔버스 한 장이면 된다
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 64, 2, 32, 64, 62);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.35, "rgba(255,255,255,0.34)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.translate(32, 64);
    ctx.scale(0.5, 1);
    ctx.translate(-32, -64);
    ctx.fillStyle = g;
    ctx.fillRect(-32, 0, 128, 128);
    const tex = new CanvasTexture(c);

    // 물가 등불 찾기 — 등불류 프롭에서 사방 두 반경(1.4 · 2.2)을 훑어, **가장
    // 깊은 물**이 있는 방향으로 한 발 나간 수면 위가 글린트 자리다. 첫 히트를
    // 쓰면 회랑 등불이 데크 밑 물을 잡아 글린트가 돌바닥 위에 눕고, 부두
    // 등불(물가에서 2.29)은 아예 못 찾았다.
    const spots: {x: number; z: number; rot: number; s: number}[] = [];
    for (const p of (
      propsLayout as {
        props: {glb: string; position: number[]}[];
      }
    ).props) {
      if (!/lantern-post|orb-lantern/.test(p.glb)) continue;
      const px = p.position[0];
      const pz = p.position[2];
      let best: {dx: number; dz: number; r: number; deep: number} | null = null;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const dx = Math.cos(a);
        const dz = Math.sin(a);
        for (const r of [1.4, 2.2]) {
          const qx = px + dx * r;
          const qz = pz + dz * r;
          if (!isWater(qx, qz)) continue;
          const deep = shoreDistAt(qx, qz);
          if (!best || deep > best.deep) best = {dx, dz, r, deep};
        }
      }
      if (!best) continue;
      spots.push({
        x: px + best.dx * (best.r + 0.85),
        z: pz + best.dz * (best.r + 0.85),
        rot: Math.atan2(best.dx, best.dz),
        s: 0.8 + ((spots.length * 37) % 10) / 18
      });
    }
    return {texture: tex, spots};
  }, []);

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: texture,
        // 톤매핑·색보정이 채도를 깎으므로 원색은 일부러 진하게 — 화면에서는
        // 등불(#ffd9a8 계열)과 같은 호박색으로 내려앉는다.
        color: new Color("#ff9d38"),
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        opacity: 0
      }),
    [texture]
  );

  // 은은한 일렁임 — 주기 둘을 겹쳐 규칙이 안 보이게 한다
  useFrame(state => {
    const t = state.clock.elapsedTime;
    material.opacity =
      GLINT_STRENGTH *
      (0.5 + 0.13 * Math.sin(t * 1.7) + 0.07 * Math.sin(t * 4.3));
  });

  if (GLINT_STRENGTH <= 0.01 || spots.length === 0) return null;
  return (
    <group>
      {spots.map((s, i) => (
        <mesh
          key={i}
          material={material}
          position={[s.x, WATER_SURFACE_Y + 0.012, s.z]}
          rotation={[-Math.PI / 2, 0, -s.rot]}
          scale={[0.62 * s.s, 2.3 * s.s, 1]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 로딩 베일 ───────────────────────────────────────────────────────────────
// 에셋(GLB ~30MB)이 내려오는 동안 캔버스는 빈 하늘이라 "고장난 것 같은" 첫인상을
// 줬다. 진행률을 보여 주면 같은 시간이 "로딩 중"으로 읽힌다. useProgress 는
// three 의 DefaultLoadingManager 를 구독하므로 Canvas 밖(DOM)에서도 동작한다.
//
// 안전장치: 파일 하나가 404 면 progress 가 100 에 못 미친 채 멈출 수 있다 —
// 25초가 지나면 무조건 걷는다(마을은 그 뒤에도 알아서 마저 뜬다).
function LoadingVeil() {
  const {progress, active} = useProgress();
  const [gone, setGone] = useState(false);
  const finished = !active && progress >= 100;
  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, [finished]);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 25000);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  const pct = Math.round(progress);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "rgba(6, 13, 28, 0.72)",
        pointerEvents: "none",
        transition: "opacity 0.6s ease",
        opacity: finished ? 0 : 1
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 14,
          letterSpacing: "0.18em",
          color: "#9fd7ef"
        }}
      >
        {">"} 마을을 짓는 중… {pct}%
      </div>
      <div
        style={{
          width: 240,
          height: 4,
          borderRadius: 2,
          background: "rgba(159, 215, 239, 0.18)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            background: "linear-gradient(90deg, #3fb1ea, #9fd7ef)",
            transition: "width 0.3s ease"
          }}
        />
      </div>
    </div>
  );
}

// 물·바람이 쓰는 시계를 한 곳에서 돌린다. 재질마다 useFrame 을 걸면 해자와
// 개울이 서로 다른 위상으로 흘러 만나는 지점에서 어긋나고, 나무도 그루마다
// 다른 순간에 같은 돌풍을 맞는다.
function AnimationClock() {
  const gl = useThree(s => s.gl);
  const scene = useThree(s => s.scene);
  const camera = useThree(s => s.camera);

  useFrame(state => {
    const t = state.clock.elapsedTime;
    advanceWaterFlow(t);
    advanceFoliageWind(t);
  });

  // ─── 개발용 콘솔 훅 ────────────────────────────────────────────────────────
  // 셰이더 패치는 "소스는 바뀌었는데 화면은 그대로"인 실패가 흔하다(three 가
  // 캐시된 프로그램을 재사용하는 경우 — foliageWind 의 customProgramCacheKey
  // 주석 참고). 그때 __three.gl.info.programs 의 cacheKey 를 보면 우리 프로그램이
  // 실제로 만들어졌는지 바로 확인된다. 화면만 보고는 절대 못 잡는다.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    (window as unknown as {__three?: unknown}).__three = {gl, scene, camera};
  }, [gl, scene, camera]);

  return null;
}

// ─── 북쪽 개울 ───────────────────────────────────────────────────────────────
// 컨셉 아트 위쪽에는 마을 뒤를 가로지르는 작은 물길이 있고, 참배로가 돌다리로
// 그 위를 건너 "AI Portfolio" 섬으로 간다. 우리한테는 다리 모델만 있고 건널 게
// 없어서, 다리를 놓으면 잔디밭 한복판에 아치가 서 있는 꼴이 됐다.
//
// 땅을 파는 대신 **잔디 위에 물 리본을 얹는다.** 부감에서 보면 얕은 개울로
// 읽히고, 지오메트리는 삼각형 60개짜리 띠 하나다. 잔디가 polygonOffset 으로
// 깊이 방향 뒤에 밀려 있어서 y 를 조금만 올려도 확실히 위에 그려진다.
// ─── 마을을 두르는 해자 ──────────────────────────────────────────────────────
// 처음엔 북쪽에 개울 한 줄만 뒀다(참배로가 건널 물이 필요했다). 컨셉 아트와
// 나란히 놓고 보니 물이 마을 **둘레를 감싸고** 있고, 그 물이 절벽에서 폭포로
// 떨어지는 게 조감도의 큰 인상이었다.
//
// 구역 **사이**로 흘리려고 했지만 자리가 없다 — 격자를 찍어 보니 마을이 통째로
// 한 단(윗단)이고 광장만 3×2칸 파여 있다. 그래서 구역 사이가 아니라 마을 둘레다.
//
// 북쪽 꼭짓점이 예전 개울 자리(z −20.7)에 정확히 오도록 중심과 반지름을 잡았다 —
// 돌다리와 참배로를 그대로 쓴다. generate-decor-layout.mjs 에 같은 값이 있다.
// 해자 타원(MOAT)은 villageRelief 가 소유한다 — 들판 굽이가 물길 밑에서 땅을
// 평평하게 잠글 때 같은 타원을 봐야 하기 때문. 여기서 따로 적으면 물은 이쪽에서
// 흐르는데 땅은 저쪽에서 평평해진다.
const MOAT_HALF = 1.1; // 반폭. 다리(5유닛 span)가 넉넉히 걸친다.
// 1.5 로 뒀더니 마을 안 물길과 겹치는 데서 두 리본이 화살표처럼 뭉쳐 보였다.
const MOAT_STEPS = 132; // 한 바퀴를 몇 조각으로
// 물결 UV 한 칸이 덮는 월드 거리의 역수. 0.5 = 2유닛마다 물결 무늬가 한 번 반복.
// 리본 폭이 1~2.2유닛이라 이 값이면 u·v 밀도가 대략 정사각형이 된다 — 어긋나면
// 물결이 한쪽으로 늘어나 물살이 아니라 빗살무늬로 보인다.
const UV_PER_UNIT = 0.5;

// ─── 물길 단면 — 물은 **파인 곳에 고여** 있어야 한다 ─────────────────────────
// 한동안 물은 잔디 위에 얹은 평평한 리본 한 장이었다. 수면이 y=0.05, 그 밑 땅이
// y≈0 이라 **깊이가 5cm** 였다. 위에서 보면 물이 아니라 잔디에 칠한 파란 띠고,
// 다리는 건널 게 없는 자리에 서 있었다.
//
// 땅(잔디 원반)을 실제로 파지는 않는다. 그 원반은 반지름 53 짜리 극좌표 격자라
// 링 간격이 1.2 유닛인데, 물길 폭이 1.2 라 단면에 정점이 두 개도 안 들어간다 —
// 파 봐야 각진 홈이 된다. 대신 **물길을 따라 도랑 리본을 잔디 위에 덮는다**
// (구역 축대 `TerraceBanks` 와 같은 방식). 바깥 입술이 잔디보다 3cm 위라
// 잔디를 확실히 가리고, 거기서 하상까지 내려간다.
/** 하상이 얼마나 파여 있는가 (수면 기준) */
const WATER_DEPTH = 0.32;
/**
 * 수면 높이.
 *
 * ─── 수면을 지면 **아래**로 내리면 안 된다 ─────────────────────────────────
 * "물이 파인 곳에 고여 있어야 한다"가 맞는 말이라 −0.18, −0.10 으로 내려 봤다.
 * 부감에서는 잘 보이는데, **카메라를 낮추면 물이 통째로 사라진다** — 시선이
 * 수평에 가까우면 10cm 위에 있는 잔디가 그대로 앞을 막기 때문이다.
 * "어떨 때는 보이고 어떨 때는 안 보여"의 정체가 이것이었다.
 *
 * 그래서 수면은 잔디보다 **살짝 위**에 둔다(예전 평평한 리본과 같은 높이).
 * 깊이는 파서 만드는 게 아니라 ① 가운데 짙은 물빛 ② 물가의 젖은 자갈 띠
 * ③ 그 바깥 이끼 둔덕이 만드는 3~7cm 짜리 턱, 이 셋이 만든다.
 * 하상(−0.32)은 불투명한 수면에 가려 안 보이지만, 물가에서 한 줄 드러나
 * "여기가 파여 있다"는 단서가 된다.
 */
const WATER_SURFACE_Y = 0.03;

/**
 * 마을의 물줄기 전부 — 수면(`Waterways`)과 도랑(`WaterBanks`)이 **같은 목록**을 본다.
 *
 * 예전엔 리본 세 종류가 `Waterways` 안에 흩어져 있었다. 도랑을 따로 그리려면
 * 그 셋을 또 한 벌 적어야 하는데, 이 리포에서 좌표를 두 벌 둔 것은 예외 없이
 * 낡았다(해자·섬·물길 끝 반지름이 같은 이유로 세 번 어긋났다).
 */
type WaterLine = {
  pts: {x: number; z: number}[];
  /** 리본 반폭. t 는 경로를 따라 0~1 */
  half: (t: number) => number;
  /** 시작점과 끝점이 만나는 닫힌 고리인지 — 해자와 광장 물 고리가 그렇다 */
  closed: boolean;
  /** 수면 y 미세 조정. 물끼리 겹치는 자리에서 같은 높이면 지글거린다 */
  lift: number;
};

function waterLines(): WaterLine[] {
  const lines: WaterLine[] = [];

  // ① 마을을 두르는 해자 (닫힌 타원)
  const moat: {x: number; z: number}[] = [];
  for (let s = 0; s <= MOAT_STEPS; s++) {
    const t = s / MOAT_STEPS;
    const angle = t * Math.PI * 2 - Math.PI / 2; // −90° 에서 시작 = 북쪽 꼭짓점
    const drift = Math.sin(angle * 3 + 0.7) * 1.4 + Math.sin(angle * 7) * 0.5;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = cos / MOAT.a;
    const nz = sin / MOAT.b;
    const nl = Math.hypot(nx, nz) || 1;
    moat.push({
      x: MOAT.cx + cos * MOAT.a + (nx / nl) * drift,
      z: MOAT.cz + sin * MOAT.b + (nz / nl) * drift
    });
  }
  lines.push({
    pts: moat,
    half: t => MOAT_HALF * (0.82 + 0.3 * Math.sin(t * Math.PI * 10 + 1.9)),
    closed: true,
    lift: 0
  });

  // ② 마을 속 물(석호)의 **물가**. 면 자체는 아래 Lagoon 이 한 장으로 깔고,
  //    여기서는 껍질을 따라 리본 하나를 둘러 물가 자갈·둔덕을 만든다.
  // 이 리본의 수면은 **끄면 안 된다** — 석호 스킨은 젖은 칸 경계(물가선 안쪽)
  // 까지만 깔리고, 물가선 도랑의 바깥 절반은 이 리본이 메운다. 꺼 봤더니 석호
  // 둘레에 마른 도랑이 검은 띠로 드러나고 개울 어귀가 고립된 조각이 됐다.
  if (LAGOON.length > 2) {
    lines.push({
      pts: [...LAGOON, LAGOON[0]],
      half: () => 0.6,
      closed: true,
      lift: 0
    });
  }

  // ③ 구역 사이 골짜기로 빠지는 물길. 안쪽은 가늘고 바깥으로 갈수록 넓어진다 —
  //    물이 흘러 내려가는 방향이 읽힌다.
  //
  //    양 끝은 **가늘게 하지 않는다.** 예전엔 taper 로 폭을 0 까지 줄여 끝을
  //    감췄는데, 그러면 고리에서 갈라져 나오는 자리가 바늘 끝이 되어 물길이
  //    안 이어진 것처럼 보였다. 지금은 생성기가 양 끝을 다른 물 속으로 밀어
  //    넣어 두므로 그냥 겹쳐 놓으면 된다. 다만 **같은 높이로 겹치면 지글거려서**
  //    아주 살짝(2mm) 아래로 내린다 — 흐르는 물이 고인 물로 들어가는 쪽이다.
  for (const channel of WATER_CHANNELS)
    lines.push({
      pts: channel,
      half: t => waterHalfAt("channel", t),
      closed: false,
      lift: -0.002
    });

  // ─── 끝 다듬기: 개울 끝이 상대 물을 **지나쳐** 잔디에 얹히는 것 방지 ────────
  // 생성기는 끝을 해자 한가운데로 밀어 넣지만, 해자에는 굽이(drift ±1.9)가 있어
  // 각도에 따라 물길이 해자를 뚫고 반대편 잔디까지 나간다 — 잔디 위의 연한
  // 사각 조각이 그것이다. 끝 4유닛 안에서 "다른 물 속" 마디를 찾으면 거기서
  // 자른다. 폭포로 가는 물길은 끝 근처에 다른 물이 없으므로 안 잘린다.
  for (const line of lines) {
    if (line.closed) continue;
    const others = lines
      .filter(l => l !== line)
      .map(l =>
        l.pts.map((p, i) => ({
          x: p.x,
          z: p.z,
          hw: l.half(i / (l.pts.length - 1))
        }))
      );
    const insideOther = (x: number, z: number) => {
      // 주의: "석호 껍질 다각형 안 = 물"로 판정하면 안 된다 — 껍질 안에는
      // 잔디 들판과 구역 섬도 있어서, 물길이 잔디 한복판에서 잘려 고립된
      // 물 조각이 남는다(실제로 겪었다). 물가 고리 **선**까지의 거리만 본다.
      for (const s of others)
        for (let i = 0; i + 1 < s.length; i++) {
          const dx = s[i + 1].x - s[i].x;
          const dz = s[i + 1].z - s[i].z;
          const l2 = dx * dx + dz * dz || 1;
          const t = Math.min(
            1,
            Math.max(0, ((x - s[i].x) * dx + (z - s[i].z) * dz) / l2)
          );
          const hw = s[i].hw + (s[i + 1].hw - s[i].hw) * t;
          if (
            Math.hypot(x - (s[i].x + dx * t), z - (s[i].z + dz * t)) <
            hw - 0.2
          )
            return true;
        }
      return false;
    };
    const arcs: number[] = [0];
    for (let i = 1; i < line.pts.length; i++)
      arcs.push(
        arcs[i - 1] +
          Math.hypot(
            line.pts[i].x - line.pts[i - 1].x,
            line.pts[i].z - line.pts[i - 1].z
          )
      );
    const total = arcs[arcs.length - 1] || 1;
    // 끝 REACH 유닛 구간을 **안쪽에서 끝 쪽으로** 훑어, 처음 만나는 "다른 물 속"
    // 지점에서 자른다 — 경계에 가장 가까운 물속 마디가 새 끝이 되므로, 다른 물과
    // 겹침은 한 마디(≤0.8유닛)만 남는다. 석호 깊숙이 들어간 머리도, 해자를
    // 뚫고 나간 꼬리도 같은 규칙으로 잘린다.
    const REACH = 4;
    let head = 0;
    {
      let iStart = 0;
      while (iStart + 1 < line.pts.length && arcs[iStart + 1] <= REACH)
        iStart++;
      for (let i = iStart; i >= 0; i--)
        if (insideOther(line.pts[i].x, line.pts[i].z)) {
          head = i;
          break;
        }
    }
    let tail = line.pts.length - 1;
    {
      let iStart = line.pts.length - 1;
      while (iStart - 1 >= 0 && total - arcs[iStart - 1] <= REACH) iStart--;
      for (let i = iStart; i < line.pts.length; i++)
        if (insideOther(line.pts[i].x, line.pts[i].z)) {
          tail = i;
          break;
        }
    }
    if ((head > 0 || tail < line.pts.length - 1) && tail - head >= 2)
      line.pts = line.pts.slice(head, tail + 1);

    // ── 끝 마디를 경계에 딱 붙인다 ──────────────────────────────────────────
    // 잘린 끝은 여전히 다른 물 속으로 최대 한 마디(0.8유닛)까지 들어가 있어,
    // 재질이 다른 물 위에 밝은 마름모 조각으로 걸쳐 보인다. 경계를 이분 탐색해
    // 끝을 "경계에서 0.3 물 쪽"으로 옮기면 이음은 남고 조각은 사라진다.
    const settle = (inP: {x: number; z: number}, outP: {x: number; z: number}) => {
      let lo = 0;
      let hi = 1;
      for (let it = 0; it < 8; it++) {
        const mid = (lo + hi) / 2;
        if (
          insideOther(inP.x + (outP.x - inP.x) * mid, inP.z + (outP.z - inP.z) * mid)
        )
          lo = mid;
        else hi = mid;
      }
      const len = Math.hypot(outP.x - inP.x, outP.z - inP.z) || 1;
      const t = Math.max(0, lo - 0.3 / len);
      return {x: inP.x + (outP.x - inP.x) * t, z: inP.z + (outP.z - inP.z) * t};
    };
    const p = line.pts;
    if (
      p.length >= 2 &&
      insideOther(p[0].x, p[0].z) &&
      !insideOther(p[1].x, p[1].z)
    )
      line.pts = [settle(p[0], p[1]), ...p.slice(1)];
    const q = line.pts;
    const last = q.length - 1;
    if (
      q.length >= 2 &&
      insideOther(q[last].x, q[last].z) &&
      !insideOther(q[last - 1].x, q[last - 1].z)
    )
      line.pts = [...q.slice(0, last), settle(q[last], q[last - 1])];
  }

  return lines;
}

function Waterways() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // 마을 전체에 LUT 색보정과 안개가 걸려 있어, 원색으로 넣어도 화면에서는
    // 한 단계 바래 나온다. 개울은 폭이 1유닛대라 조금만 바래도 회색 선이 된다.
    const shallow = new Color("#86dedb"); // 가장자리 — 자갈이 비치는 여울
    const deep = new Color("#2f9dc0"); // 한가운데

    /**
     * 폴리라인 하나를 물 리본으로 만든다. 한 마디마다 정점 셋(왼·오른·가운데)이라
     * 가운데 줄에 짙은 색을 넣어 물에 두께가 있는 것처럼 보인다.
     */
    const ribbon = (
      pts: {x: number; z: number}[],
      halfAt: (t: number) => number,
      /** 시작점과 끝점이 만나는 닫힌 고리인지 — UV 이음매 처리가 다르다. */
      closed: boolean,
      /** 수면 y 미세 조정 (물끼리 겹치는 자리의 지글거림 방지) */
      lift: number
    ) => {
      const base = positions.length / 3;

      // ─── 물결 UV 의 v 축 ─────────────────────────────────────────────────
      // v 는 **경로를 따라 잰 실제 거리**다. i/pts.length 로 잡으면 해자(둘레
      // 155유닛)와 짧은 개울에서 물결 크기가 딴판이 된다.
      //
      // ─── 닫힌 고리의 이음매 ──────────────────────────────────────────────
      // 해자는 한 바퀴 돌아 제자리로 온다. 그런데 총 거리 × UV_PER_UNIT 이
      // 정수가 아니면 시작점의 v(=0)와 끝점의 v(=77.5 → 소수부 0.5)가 안 맞아
      // 북쪽 꼭짓점에 물결이 뚝 끊기는 선이 생긴다.
      // 그래서 닫힌 고리는 총 v 가 정수가 되도록 배율을 아주 살짝 조정한다.
      // (waterFlow 의 scaleA·scaleB 를 정수로 잡아 둔 것도 같은 이유다 —
      //  정수 v 에 정수 배율을 곱해야 이음매가 끝까지 안 생긴다.)
      const arcs: number[] = [0];
      for (let i = 1; i < pts.length; i++) {
        arcs.push(
          arcs[i - 1] +
            Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z)
        );
      }
      const total = arcs[arcs.length - 1] || 1;
      const vScale = closed
        ? Math.max(1, Math.round(total * UV_PER_UNIT)) / total
        : UV_PER_UNIT;

      for (let i = 0; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const uvV = arcs[i] * vScale;
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        const tx = next.x - prev.x;
        const tz = next.z - prev.z;
        const tl = Math.hypot(tx, tz) || 1;
        // 진행 방향의 법선
        const ux = -tz / tl;
        const uz = tx / tl;
        const half = halfAt(t);
        for (const side of [-1, 1]) {
          positions.push(
            pts[i].x + ux * half * side,
            lift,
            pts[i].z + uz * half * side
          );
          colors.push(shallow.r, shallow.g, shallow.b);
          // u 는 리본을 가로지르고 v 는 물길을 따라간다. 흐름을 +v 로만 주면
          // 물이 굽은 해자를 따라 돈다.
          //
          // u 도 **v 와 같은 월드 거리 축척**이어야 한다. 여기를 0~1 정규화로
          // 두면(처음에 그렇게 했다) 폭 1유닛짜리 개울에서 u 가 v 보다 두 배
          // 촘촘해져 물결이 경로 방향으로 늘어난다 — 화면에서 물살이 아니라
          // 지그재그 빗살무늬로 보인다. 폭이 좁을수록 심해진다.
          uvs.push(0.5 + side * half * UV_PER_UNIT, uvV);
        }
        positions.push(pts[i].x, lift, pts[i].z);
        colors.push(deep.r, deep.g, deep.b);
        uvs.push(0.5, uvV);
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = base + i * 3;
        const b = base + (i + 1) * 3;
        indices.push(a, a + 2, b, b, a + 2, b + 2);
        indices.push(a + 2, a + 1, b + 2, b + 2, a + 1, b + 1);
      }
    };

    for (const line of waterLines())
      ribbon(line.pts, line.half, line.closed, line.lift);

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => {
    // 호수(Water)와 같은 재질감 — 하늘빛을 받아야 물로 보인다.
    // 다만 해자·개울은 얕으므로 조금 밝고 덜 반사한다.
    // roughness 0.3 · metalness 0.2 로 뒀더니 태양이 넓은 흰 반사를 깔아 물빛이
    // 통째로 **회백색**이 됐다. 폭이 1유닛대라 그 반사가 수면을 다 덮는다.
    // 조금 거칠게 하면 반사가 좁아져 알베도(청록)가 드러난다. emissive 는
    // 도랑 밑이라 그늘·AO 가 겹쳐도 물이 검게 죽지 않게 바닥을 깔아 주는 값이다 —
    // 빛나 보이라는 게 아니라 회색으로 안 죽으라는 것.
    const m = new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.45,
      metalness: 0.12,
      // 석호(lagoonMaterial)와 **같은 발광**으로 맞춘다. #124f66 × 0.3 으로
      // 더 밝게 뒀더니 밤에 개울만 네온으로 떠서, 석호와 겹치는 어귀에서
      // 겹친 조각이 그대로 드러났다("물이 다 다르다"). 낮에는 햇빛에 묻혀
      // 이 차이가 안 보이므로 밤 통일이 우선이다.
      emissive: new Color("#0f3f57"),
      emissiveIntensity: 0.25
    });
    // 여기는 **흐르는** 물이다. 두 층 모두 +v(물길 방향)로 흘리되 속도를 달리해
    // 무늬가 서로 어긋나게 한다. u 에 살짝 준 값은 물살이 벽에 부딪혀 비스듬히
    // 밀리는 느낌 — 0 으로 두면 물살이 자로 잰 듯 곧게 흘러 인공적으로 보인다.
    // 배율이 **정수**인 건 취향이 아니라 이음매 때문이다. 해자는 닫힌 고리라
    // 총 v 를 정수로 맞춰 놨는데(ribbon 의 vScale), 여기에 소수 배율을 곱하면
    // 정수성이 깨져 북쪽 꼭짓점에 물결이 끊기는 선이 되살아난다.
    // 8:5 는 서로 배수가 아니라 두 층이 겹쳐 고정 무늬를 만들지도 않는다.
    //
    // ─── 왜 3 인가 (8 에서 되돌렸다) ──────────────────────────────────────
    // 물결 한 칸의 월드 크기는 1/(UV_PER_UNIT × scale) 이다. 예전에 8(0.25유닛)
    // 로 올렸던 건 "폭에 물결 여러 줄"을 위해서였는데, 큰 너울 층(scaleC)이
    // 생기고 나서는 형태를 너울이 만들므로 잔결이 촘촘할 이유가 없어졌다.
    // 오히려 0.25유닛 타일은 근접에서 **욕실 타일 바닥**으로 읽혔다(밤 달빛
    // 스페큘러가 정사각 반복을 그대로 드러낸다). 3:2 면 타일 0.67·1.0유닛 —
    // 석호(1.25·1.9)와 같은 부드러운 결 언어가 된다.
    // 정수여야 하는 이유는 위 주석(닫힌 고리 이음매) 그대로다.
    applyWaterFlow(m, makeWaterNormal(), {
      scaleA: 3,
      scaleB: 2,
      dirA: [0.05, 1],
      dirB: [-0.04, 0.62],
      // 월드 속도 = speed/(UV_PER_UNIT × scaleA) = 0.6/1.5 = 0.4유닛/초 —
      // 배율을 8→3 으로 내리며 같은 물살 속도가 되도록 1.6 에서 같이 내렸다.
      speed: 0.6,
      // 맵의 최대 기울기가 이미 0.35 로 묶여 있다(waterFlow 의 STEEPNESS).
      normalScale: 0.5,
      // 부감용 큰 너울 — 0.9 면 타일 2.2유닛, 리본 폭(1~2.2)에 딱 한 번.
      scaleC: 0.9,
      bigWeight: 1.5,
      // 실제 출렁임 — 파장·시계가 석호와 같아 어귀에서 함께 오르내린다.
      // 0.022 × 파고합 1.35 ≈ 0.03: 석호 수면(+0.03)을 안 뚫고 둑 어깨(+0.04)도
      // 안 넘는 최대치다.
      swellAmp: 0.022,
      swellSpeed: 0.6
    });
    return m;
  }, []);

  // ─── 물 면 자체 ─────────────────────────────────────────────────────────────
  // 마을 속 바닥은 전부 물이다. 리본을 촘촘히 까는 대신 **껍질을 한 장으로 덮고**
  // 구역 단(+1.1)과 광장 섬이 그 위로 솟게 둔다 — 물가는 축대가 알아서 가린다.
  // 볼록 다각형이라 중심에서 부챗살로 삼각형을 깔면 끝난다(20삼각형 남짓).
  // ─── 물 면 자체 ─────────────────────────────────────────────────────────────
  // 마을 속 바닥은 전부 물이다. 처음엔 껍질을 부챗살 한 장으로 덮었는데, 그러면
  // 수면이 **한 가지 색 판때기**라 넓이만 있고 깊이가 없다. 물이 깊어 보이는 건
  // 물빛이 아니라 **물가에서 멀어질수록 바닥이 안 보이게 되는 변화**다.
  //
  // 그래서 두 겹으로 깐다:
  //   ① 하상  — 물가에선 젖은 모래, 가운데로 갈수록 캄캄해진다 (불투명)
  //   ② 수면  — 물가에선 맑아 하상이 비치고, 가운데로 갈수록 불투명해진다
  // 둘 다 물가까지의 거리로 색·투명도를 매기므로, 구역이 옮겨 가도 저절로 따라온다.
  //
  // 격자로 잘게 나누는 이유: 정점이 껍질 모서리 열 개뿐이면 색을 매길 자리가 없다.
  const {bed, surface} = useMemo(() => {
    if (LAGOON.length < 3) return {bed: null, surface: null};

    // 물가까지의 거리 — villageTerrain 의 단일 권위. 캐릭터 가라앉음(walkHeightAt)이
    // 같은 함수를 보므로, 색이 짙어지는 곳에서 정확히 그만큼 몸이 잠긴다.
    const shoreDist = shoreDistAt;

    const STEP = 0.85;
    const xs = LAGOON.map(p => p.x);
    const zs = LAGOON.map(p => p.z);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const z0 = Math.min(...zs);
    const z1 = Math.max(...zs);
    const nx = Math.ceil((x1 - x0) / STEP) + 1;
    const nz = Math.ceil((z1 - z0) / STEP) + 1;

    // 정점 격자 — 물이 아닌 자리는 −1 로 비워 둔다
    const at = new Int32Array(nx * nz).fill(-1);
    const bedPos: number[] = [];
    const bedCol: number[] = [];
    const surPos: number[] = [];
    const surCol: number[] = [];
    const surUv: number[] = [];
    /** 물가까지의 월드 거리 — 너울·포말·커스틱이 전부 이걸 본다 (waterFlow 참고) */
    const shore: number[] = [];
    /** 그 자리의 흐름 방향 */
    const flow: number[] = [];

    // 물가 — 젖은 모래·자갈. **마른 흙색도, 회록색도 안 된다.** 그늘에 들어가면
    // 수면의 반사가 사라져 하상이 그대로 드러나는데, 그때 색이 흙빛이면 갯벌,
    // 회록빛이면 물때 낀 웅덩이로 보인다(실제로 회록 #7b8a72 얼룩이 부감에서
    // 지저분하게 떠 보였다). 청록을 섞어 "물빛에 잠긴 바닥"으로 읽히게 한다.
    const sandy = new Color("#5f9a90");
    const abyss = new Color("#0d2436"); // 가운데 — 바닥이 안 보이는 곳
    const clear = new Color("#7fd4d0"); // 얕은 물빛
    const deep = new Color("#1f7fa8"); // 깊은 물빛
    const c0 = new Color();
    const c1 = new Color();

    /** 깊이 0~1 — 물가에서 이만큼 떨어지면 바닥이 완전히 안 보인다 */
    const FULL_DEPTH = WATER_FULL_DEPTH;
    void FULL_DEPTH;

    // ─── 얕은물 얼룩 노이즈 ────────────────────────────────────────────────────
    // 색 램프를 물가 거리로만 매기면 섬 사이 좁은 물(폭 ~2.4)이 통째로 같은
    // "얕음" 색 하나가 되어 **수영장 바닥**처럼 보인다. 거리값을 자리마다
    // 노이즈로 흔들면 밝은 물가 띠의 폭이 굽이치고, 판이 아니라 물로 읽힌다.
    const hashN = (i: number, j: number) => {
      let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const smoothT = (t: number) => t * t * (3 - 2 * t);
    const noise2 = (x: number, z: number) => {
      const i = Math.floor(x);
      const j = Math.floor(z);
      const fx = smoothT(x - i);
      const fz = smoothT(z - j);
      const a = hashN(i, j);
      const b = hashN(i + 1, j);
      const c = hashN(i, j + 1);
      const d = hashN(i + 1, j + 1);
      return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
    };

    // ─── 물가의 톱니는 격자를 **진짜 물가로 당겨서** 없앤다 ──────────────────
    // 격자를 물인 칸에서 딱 끊으면 물가가 0.85 짜리 계단이 된다. 낮은 시점에서
    // 이게 그대로 보인다 — 물결을 아무리 잘 만들어도 가장자리가 톱니면 종이를
    // 오려 붙인 것으로 보인다. 격자를 더 잘게 해도 계단은 안 없어지고 정점만 는다.
    //
    // ── 먼저 시도했다가 되돌린 방법: 뭍 밑으로 한 칸 더 깔기 ──────────────
    // 물가 바깥이 단이면 그 칸까지 물을 깔아 축대 벽 뒤로 숨기는 방법이다.
    // 걷는 땅을 침범하지는 않았지만(격자 실측 0%), **단이 없는 물가는 못 고친다** —
    // 껍질이 트인 들판을 지나는 구간에는 숨겨 줄 축대가 없어서 톱니가 그대로 남고,
    // 거기로 늘리면 물이 잔디 위로 넘친다. 반쪽짜리 해법이었다.
    //
    // (그때 "걷는 땅의 12%가 물에 덮인다"고 읽었는데 오독이었다 — **다리 칸**을
    //  세고 있었다. 다리는 물 위를 건너라고 뚫어 둔 구멍이라 그게 정상이다.
    //  물가 판정을 잴 때는 `isWater` 인 점을 먼저 빼고 세야 한다.)
    //
    // ── 지금 방법: 마른 정점을 물가 선까지 당긴다 ─────────────────────────
    // 물에 닿은 마른 정점을 후보에 넣되, **자리를 격자에 두지 않는다.** 물인
    // 이웃 쪽으로 이분 탐색해 `isWater` 가 바뀌는 지점을 찾아 거기로 옮긴다.
    // 그러면 다각형 테두리가 격자와 무관하게 실제 물가를 따라간다 — 톱니도 없고
    // 뭍을 덮지도 않는다. 8cm 만 뭍 쪽으로 남겨 축대 밑동과 사이가 안 벌어지게 한다.
    const wet = new Uint8Array(nx * nz);
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++)
        if (isWater(x0 + i * STEP, z0 + j * STEP)) wet[j * nx + i] = 1;

    const nearWet = (i: number, j: number) => {
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
          if (wet[jj * nx + ii]) return true;
        }
      return false;
    };

    /** 뭍 쪽으로 남기는 여유 — 축대 밑동과 물 사이에 실틈이 생기지 않게 */
    const SEAL = 0.08;

    /**
     * 마른 정점을 물가 선으로 당긴다. 물인 이웃마다 경계를 이분 탐색해
     * 평균 낸다 — 이웃이 여러 방향이면 그 사이 어딘가로 가는데, 어차피
     * 한 칸(0.85) 안이라 눈에 안 띈다.
     */
    const snapToShore = (x: number, z: number, i: number, j: number) => {
      let sx = 0;
      let sz = 0;
      let k = 0;
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
          if (!wet[jj * nx + ii]) continue;
          const wx = x0 + ii * STEP;
          const wz = z0 + jj * STEP;
          let dry = 0;
          let sea = 1;
          for (let it = 0; it < 7; it++) {
            const m = (dry + sea) / 2;
            if (isWater(x + (wx - x) * m, z + (wz - z) * m)) sea = m;
            else dry = m;
          }
          // 경계보다 살짝 뭍 쪽(dry)에서 멈춘다
          const t = Math.max(0, sea - SEAL / (Math.hypot(wx - x, wz - z) || 1));
          sx += x + (wx - x) * t;
          sz += z + (wz - z) * t;
          k += 1;
        }
      return k ? {x: sx / k, z: sz / k} : {x, z};
    };

    let n = 0;
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const gx = x0 + i * STEP;
        const gz = z0 + j * STEP;
        const isWet = wet[j * nx + i] === 1;
        if (!isWet && !nearWet(i, j)) continue;
        // 물인 칸은 격자 그대로, 마른 칸은 물가 선으로 당겨서
        const p = isWet ? {x: gx, z: gz} : snapToShore(gx, gz, i, j);
        const x = p.x;
        const z = p.z;
        at[j * nx + i] = n++;
        const sd = shoreDist(x, z);
        shore.push(sd);
        // ─── 흐름 방향은 **접선**이다 ──────────────────────────────────────
        // 석호는 광장 섬을 두르는 고리다. 세계 좌표로 한 방향(예: +z)으로 밀면
        // 고리의 한쪽에서는 물이 뭍으로 기어오르고 반대쪽에서는 물가에서
        // 멀어진다 — 물이 아니라 컨베이어 벨트로 보인다. 중심을 도는 접선으로
        // 주면 어느 물가에서나 물이 **나란히 지나가고**, 그게 강가에서 보는
        // 것과 같은 움직임이다.
        const rr0 = Math.hypot(x, z) || 1;
        flow.push(-z / rr0, x / rr0);
        // ─── 깊이 램프는 비선형 + 노이즈 ───────────────────────────────────
        // smoothstep(sd/4.5) 시절엔 섬 사이 좁은 물이 전부 "얕음" 근처에 몰려
        // 민트색 판이 됐다. 지수 램프는 물가 1.3유닛 안에서 이미 63% 깊어져
        // 밝은 띠가 **얇게** 남고, 좁은 물길 가운데도 제 깊이 색이 나온다.
        const wob = 0.7 + 0.6 * noise2(x * 0.21 + 7.3, z * 0.21 + 2.9);
        const k = Math.min(1, 1 - Math.exp(-(sd * wob) / 1.35));
        bedPos.push(x, 0, z);
        c0.copy(sandy).lerp(abyss, k);
        bedCol.push(c0.r, c0.g, c0.b);
        surPos.push(x, 0, z);
        c1.copy(clear).lerp(deep, k);
        // 알파: 물가에선 하상이 비치고 가운데로 갈수록 막힌다.
        // 바닥값을 0.42 → 0.55 로 올렸다. 0.42 는 볕에서는 좋았지만 **그늘에서**
        // 수면의 반사가 사라지자 하상이 58% 로 드러나 물이 흙바닥이 됐다.
        // 0.55 면 그늘에서도 물빛이 이기면서 얕은 데 바닥은 여전히 비친다.
        surCol.push(c1.r, c1.g, c1.b, 0.55 + 0.42 * k);
        surUv.push(x * UV_PER_UNIT, z * UV_PER_UNIT);
      }

    const idx: number[] = [];
    for (let j = 0; j + 1 < nz; j++)
      for (let i = 0; i + 1 < nx; i++) {
        const a0 = at[j * nx + i];
        const b0 = at[j * nx + i + 1];
        const c2 = at[(j + 1) * nx + i];
        const d0 = at[(j + 1) * nx + i + 1];
        if (a0 < 0 || b0 < 0 || c2 < 0 || d0 < 0) continue;
        // 네 귀 중 **하나라도** 물이어야 한다. 이 조건이 없으면 단 안쪽까지
        // 물이 통째로 깔려 구역 광장에 물이 고인다.
        if (
          !wet[j * nx + i] &&
          !wet[j * nx + i + 1] &&
          !wet[(j + 1) * nx + i] &&
          !wet[(j + 1) * nx + i + 1]
        )
          continue;
        idx.push(a0, c2, b0, b0, c2, d0);
      }
    if (idx.length === 0) return {bed: null, surface: null};

    const bedGeo = new BufferGeometry();
    bedGeo.setAttribute("position", new Float32BufferAttribute(bedPos, 3));
    bedGeo.setAttribute("color", new Float32BufferAttribute(bedCol, 3));
    bedGeo.setAttribute("aShore", new Float32BufferAttribute(shore, 1));
    bedGeo.setIndex(idx);
    bedGeo.computeVertexNormals();

    const surGeo = new BufferGeometry();
    surGeo.setAttribute("position", new Float32BufferAttribute(surPos, 3));
    surGeo.setAttribute("color", new Float32BufferAttribute(surCol, 4));
    surGeo.setAttribute("uv", new Float32BufferAttribute(surUv, 2));
    surGeo.setAttribute("aShore", new Float32BufferAttribute(shore.slice(), 1));
    surGeo.setAttribute("aFlow", new Float32BufferAttribute(flow, 2));
    surGeo.setIndex(idx.slice());
    surGeo.computeVertexNormals();

    return {bed: bedGeo, surface: surGeo};
  }, []);

  // ─── 석호 수면 ──────────────────────────────────────────────────────────────
  // **리본 재질을 clone 하면 안 된다.** three 의 Material.copy 는 onBeforeCompile 을
  // 복사하지 않아서 물결이 얼어붙는다(자세한 설명은 waterFlow.ts 의 applyWaterSurface
  // 주석). 넓은 수면은 필요한 것도 다르다 — 너울·프레넬·포말이 여기서 붙는다.
  const lagoonMaterial = useMemo(() => {
    const m = new MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false, // 반투명 면끼리 서로를 지우지 않게
      // 0.28/0.2 로 뒀더니 눈높이에서 햇빛 반사가 수면을 통째로 하얗게 덮었다
      // (해자에서 겪은 "회백색"과 같은 사고다 — 넓은 면이라 더 크게 터진다).
      // 조금 거칠게 하면 반사가 좁아져 물빛이 드러난다.
      roughness: 0.38,
      metalness: 0.12,
      emissive: new Color("#0f3f57"),
      emissiveIntensity: 0.25
    });
    applyWaterSurface(m, makeWaterNormal(), {
      // ─── 배율을 리본(8:5)에서 크게 낮춘 이유 ────────────────────────────
      // 처음엔 리본과 똑같이 8:5 로 뒀다. 개울에서 석호로 이어질 때 물결 크기가
      // 달라지면 이음매가 보일 줄 알았는데, 실제 화면은 **격자무늬 그물**이었다.
      //
      // 물결 텍스처는 타일 한 장이 되풀이되는 것이다. 배율 8 이면 타일 한 칸이
      // 0.25유닛 — 폭 1.5유닛짜리 개울에서는 여섯 번밖에 안 반복되니 잔물결로
      // 읽히지만, 폭 20유닛짜리 석호에서는 **여든 번** 반복된다. 그 정도면 눈이
      // 되풀이를 알아채고 물결이 아니라 짜인 그물로 본다. 비스듬히 볼수록 심하다.
      //
      // 1.6:1.05 면 타일이 1.25 · 1.9유닛이라 석호 폭에 열 번 남짓 들어간다.
      // 마침 실제로도 맞다 — 연못의 잔물결은 개울의 물살보다 크고 느긋하다.
      // (하상을 끄고 찍어 봐서 범인이 수면임을 확인하고 고친 값이다.)
      scaleA: 1.6,
      scaleB: 1.05,
      // 부감용 큰 너울 — 타일 한 장이 9유닛쯤 되는 성긴 층. 잔물결(1.2~1.9유닛)은
      // 기본 카메라(부감)에서 안 읽혀 수면이 정지된 색면으로 보였다.
      scaleC: 0.21,
      bigWeight: 1.5,
      // dirA/dirB 는 안 쓴다(방향이 정점마다 다르다). 인터페이스를 맞추려고 둔다.
      dirA: [0, 1],
      dirB: [0, 1],
      // 월드 속도 = speed / (UV_PER_UNIT × scaleA) = 0.28/0.8 ≈ 0.35유닛/초.
      // 배율을 바꾸면 같은 speed 라도 실제 빠르기가 달라지므로 늘 이 식으로 잡는다.
      speed: 0.28,
      // 물결 한 칸이 커진 만큼 기울기를 낮춰야 한다 — 안 그러면 큰 너울이
      // 하나하나 도드라져 젤리 표면처럼 보인다.
      normalScale: 0.5,
      // 4cm. 이보다 크면 물가에서 수면이 둑을 넘본다.
      swellAmp: 0.045,
      swellSpeed: 0.6,
      foamWidth: 0.5,
      skyTint: "#bcdcea",
      // 3 이면 정면에서도 하늘이 제법 비친다 — 얕아 보인다. 4.5 로 세워
      // 위에서 볼 때는 물속이 보이고 비스듬할 때만 하늘이 덮게 한다.
      fresnelPower: 4.5
    });
    return m;
  }, []);

  // 하상 — 가만히 있고 그 위로 물빛 무늬만 지나간다
  const bedMaterial = useMemo(() => {
    const m = new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.95,
      metalness: 0
    });
    applyWaterBed(m, {
      scale: 1.15,
      speed: 0.5,
      // 물빛(FULL_DEPTH 4.5)보다 얕게 잡는다. 무늬가 물빛보다 **먼저** 사라져야
      // "바닥이 안 보이기 시작하는 곳"이 물빛이 어두워지는 곳보다 앞선다.
      depth: 3.2,
      strength: 0.5,
      color: "#a8d9b4"
    });
    return m;
  }, []);

  return (
    <>
      <WaterBanks />
      {bed ? (
        // 하상 — 잔디보다 살짝 위라 잔디를 가리고, 수면 밑으로 비친다
        <mesh
          geometry={bed}
          material={bedMaterial}
          position={[0, WATER_SURFACE_Y - 0.02, 0]}
          receiveShadow
        />
      ) : null}
      {surface ? (
        // 리본보다 2mm 아래 — 껍질 물가 리본과 같은 높이면 지글거린다
        <mesh
          geometry={surface}
          material={lagoonMaterial}
          position={[0, WATER_SURFACE_Y - 0.002, 0]}
        />
      ) : null}
      <mesh
        geometry={geometry}
        material={material}
        position={[0, WATER_SURFACE_Y, 0]}
      />
    </>
  );
}

// ─── 물길 도랑 (하상 + 둔치) ─────────────────────────────────────────────────
// 물이 깊어 보이게 하는 건 물 자체가 아니라 **물가**다. 수면만 내려도 잔디가
// 그 위에 남아 있으면 물은 잔디 밑에 깔린 파란 판이 된다. 그래서 물줄기마다
// 도랑 단면을 두르고, 그 안에 수면을 넣는다 — `TerraceBanks` 와 같은 방식이다.
//
// 왜 잔디 원반을 안 파나: 그 원반은 반지름 53 짜리 극좌표 격자라 링 간격이
// 1.2 유닛인데 물길 폭이 1.2 다. 단면에 정점이 두 개도 안 들어가므로 파 봐야
// 각진 홈이 된다. 도랑을 **덮는** 쪽이 정확하고, 잔디는 그 밑에 그냥 둔다.
//
// 단면은 **수면 가장자리 기준**으로 적는다: 실제 거리 = 리본 반폭 + out.
// 리본 폭이 물길마다(그리고 해자는 마디마다) 다르므로, 배수로 적으면 좁은
// 개울에서는 둔치가 붙고 넓은 해자에서는 벌어진다. 더하기로 적으면 어디서나
// 물가 모양이 같다. 0번은 하상 한가운데라 out 을 안 본다.
//
// 색은 **밝게** 잡는다. 처음에 하상을 #3b3e36 까지 어둡게 뒀더니, 물이 띠의
// 3분의 1뿐이던 때와 겹쳐 부감에서 개울이 아니라 **검은 고랑**으로 보였다.
// 물속은 수면이 덮으므로 어차피 어두워진다 — 재료는 젖은 자갈색이면 충분하다.
//
// ─── 어깨를 흙색으로 두면 안 된다 ────────────────────────────────────────────
// 처음엔 물 밖 어깨를 마른 흙(#8b7a5c)으로 칠했다. 그 색이 광장 판석과 거의 같아서
// 부감에서 도랑 전체가 **포장된 길**로 보였고, 그 한가운데 가는 파란 줄이 그어진
// 꼴이 됐다. 컨셉의 개울은 잔디밭을 지난다 — 젖은 자갈은 수면 바로 옆 한 줄뿐이고
// 나머지는 풀이다.
//
// 높이는 **수면 기준**으로 적는다. 수면을 올리고 내릴 때 y 를 손으로 다시 맞추면
// 반드시 어긋난다 — 실제로 물가(n2)가 그 바깥 둔덕(n3)보다 높아져 단면이 뒤집힌 적이 있다.
const WATER_PROFILE: {out: number; y: number; color: string}[] = [
  // 한가운데가 가장 깊다 — 바닥이 평평하면 물이 얕은 접시로 보인다
  {out: 0, y: WATER_SURFACE_Y - WATER_DEPTH - 0.05, color: "#4e5646"},
  // 하상 가장자리 (아직 물속)
  {out: -0.22, y: WATER_SURFACE_Y - WATER_DEPTH, color: "#5d6352"},
  // 수면 바로 아래 — 여기가 물가 선이다. 젖은 자갈 한 줄
  {out: 0.05, y: WATER_SURFACE_Y - 0.02, color: "#7b7365"},
  // 이끼 낀 둔덕 — 물보다 4cm 높은 턱. 이 턱이 깊이를 만든다
  {out: 0.24, y: WATER_SURFACE_Y + 0.04, color: "#5f6f3c"},
  // 잔디로 되돌아오는 입술. 잔디(y≈0)보다 위라 잔디를 확실히 덮는다
  {out: WATER_BANK_OUT, y: WATER_SURFACE_Y + 0.02, color: "#6b8748"}
];

function WaterBanks() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const rgb = WATER_PROFILE.map(p => new Color(p.color));

    // ─── 다른 물줄기 속에서는 둑을 안 판다 ─────────────────────────────────
    // 개울은 해자를 **가로질러** 폭포로 나간다. 끝 어귀(MOUTH)만 눕히면 해자
    // 한복판을 개울 둑이, 개울 한복판을 해자 둑이 X자로 가로지른다 — 부감에서
    // 물 위에 검은 막대가 얹힌 그 버그다. 그래서 마디마다 "다른 물줄기의 수면
    // 안인가"를 재서, 안이면 깊이를 0 으로 눕힌다.
    const lines = waterLines();
    const sampled = lines.map(line => {
      const {pts, half} = line;
      return pts.map((p, i) => ({
        x: p.x,
        z: p.z,
        hw: half(i / (pts.length - 1))
      }));
    });
    /** li 번째 물줄기의 (x,z)가 **다른** 물줄기 수면에서 얼마나 떨어져 있나 */
    const otherWaterDist = (li: number, x: number, z: number) => {
      let best = Infinity;
      for (let j = 0; j < sampled.length; j++) {
        if (j === li) continue;
        const s = sampled[j];
        for (let i = 0; i + 1 < s.length; i++) {
          const ax = s[i].x;
          const az = s[i].z;
          const bx = s[i + 1].x;
          const bz = s[i + 1].z;
          const dx = bx - ax;
          const dz = bz - az;
          const l2 = dx * dx + dz * dz || 1;
          const t = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / l2));
          const px = ax + dx * t;
          const pz = az + dz * t;
          const hw = s[i].hw + (s[i + 1].hw - s[i].hw) * t;
          best = Math.min(best, Math.hypot(x - px, z - pz) - hw);
        }
      }
      return best;
    };

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const {pts, half, closed} = line;
      const base = positions.length / 3;
      // 열린 물길은 양 끝이 다른 물(광장 고리·해자) 속으로 들어간다. 거기까지
      // 도랑을 파면 **물 한가운데를 가로지르는 둑**이 생기므로, 끝에서는 깊이를
      // 0 으로 눕혀 상대 도랑에 녹아들게 한다.
      const arcs: number[] = [0];
      for (let i = 1; i < pts.length; i++)
        arcs.push(
          arcs[i - 1] +
            Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z)
        );
      const total = arcs[arcs.length - 1] || 1;
      const MOUTH = 2.2; // 이 거리 안에서 깊이가 0 → 1 로 살아난다
      const depthAt = (i: number) => {
        let k = 1;
        if (!closed) {
          const d = Math.min(arcs[i], total - arcs[i]);
          k = Math.min(1, Math.max(0, d / MOUTH));
        }
        // 다른 물줄기 수면 안(+살짝 밖까지)에서는 눕힌다 — 교차점의 X자 둑 방지.
        // 1.2 는 둑 어깨(WATER_BANK_OUT)가 상대 수면을 밟지 않는 최소 여유다.
        const od = otherWaterDist(li, pts[i].x, pts[i].z);
        k *= Math.min(1, Math.max(0, od / 1.2));
        return k;
      };

      // 한 마디마다 단면 정점을 왼쪽 바깥 → 가운데 → 오른쪽 바깥 순으로 깐다
      const CROSS = WATER_PROFILE.length * 2 - 1;
      for (let i = 0; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        const tx = next.x - prev.x;
        const tz = next.z - prev.z;
        const tl = Math.hypot(tx, tz) || 1;
        const ux = -tz / tl;
        const uz = tx / tl;
        const h = half(t);
        const k = depthAt(i);
        const put = (n: number, side: number) => {
          const p = WATER_PROFILE[n];
          // 0번은 한가운데. 나머지는 수면 가장자리에서 out 만큼 — 하상 가장자리는
          // out 이 음수라 안쪽으로 들어오는데, 중심을 넘어가면 단면이 뒤집히므로 접는다.
          //
          // out 에도 k 를 곱한다: 깊이만 눕히면 어깨(out 0.6)가 물 높이의
          // 팬케이크로 잔디·상대 수면 위에 남는다 — 물길 끝의 연한 파편이
          // 그것이었다. 같이 접으면 눕힌 단면이 수면 폭 안에 들어가 3cm 아래로
          // 숨는다.
          const d = n === 0 ? 0 : Math.max(0.05, h + p.out * k) * side;
          // 눕힌 단면(k→0)은 그냥 y=0 에 두면 안 된다 — 석호는 **반투명**이라
          // 수면 3cm 아래의 팬케이크가 검은 다각형으로 비쳐 보인다. 눕는 만큼
          // 하상(−0.34)보다 아래로 가라앉혀 물 밑에서도 안 보이게 한다.
          const vx = pts[i].x + ux * d;
          const vz = pts[i].z + uz * d;
          let vy = p.y * k - (1 - k) * 0.5;
          // 어깨(수면 위 둔덕)가 **석호 물속**에 서 있으면 가라앉힌다 — 물가
          // 고리의 안쪽 둔덕, 어귀를 가로지르는 개울 둑이 석호 수면 위로 솟아
          // 물을 흙 띠로 갈라 놓았다("끊겨 있다"의 정체). 뭍의 어깨는 그대로다.
          if (p.y > WATER_SURFACE_Y && isWater(vx, vz))
            vy = Math.min(vy, WATER_SURFACE_Y - 0.08);
          positions.push(vx, vy, vz);
          colors.push(rgb[n].r, rgb[n].g, rgb[n].b);
        };
        for (let n = WATER_PROFILE.length - 1; n >= 1; n--) put(n, -1);
        put(0, 1); // 가운데 (out 이 음수라 부호는 의미 없다)
        for (let n = 1; n < WATER_PROFILE.length; n++) put(n, 1);
      }
      // ─── 감기 방향 ───────────────────────────────────────────────────────
      // 진행 방향 T 와 단면 방향 C 의 외적 T×C 는 **−Y** 다(C 가 −90° 법선이라).
      // 그래서 (마디i,단면n) → (마디i+1,단면n) → (마디i,단면n+1) 순으로 감으면
      // 면이 통째로 **아래를 본다**. 앞면만 그리는 재질이라 위에서 보면 도랑이
      // 사라지고, 잔디가 그 자리에 그대로 남아 **0.18 아래 수면을 덮는다** —
      // "물이 아예 없는데"의 정체가 이것이었다. 단면 방향을 먼저 감는다.
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = base + i * CROSS;
        const b = base + (i + 1) * CROSS;
        for (let n = 0; n + 1 < CROSS; n++)
          indices.push(a + n, a + n + 1, b + n, a + n + 1, b + n + 1, b + n);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  );
}

// ─── 광장 단상 ────────────────────────────────────────────────────────────────
// 구역 단(`TerraceBanks`)과 같은 일을 하지만 **사각형이 아니다.** 광장 포장은
// 대로 넷이 축 방향 칸을 먹고 SKILLS 단 모서리가 한쪽을 파고들어 둥글둥글한
// 덩어리라, 사각형 단을 깔면 네 모서리가 잔디로 튀어나온다. 그래서 각도별
// 반지름(`PLAZA_DAIS`)을 따라 축대를 두르고 그 안을 뚜껑 한 장으로 덮는다.
//
// 축대는 **테두리에서 바깥으로** 내려간다. 발치가 물에 잠기면 안 되므로
// 생성기가 테두리 자리를 "물가 − 축대 길이 − 여유"로 잡아 뒀다.
const DAIS_WALL_RUN = 0.5;

// ─── 계단은 축대에 **새겨 넣는다** ───────────────────────────────────────────
// 처음엔 구역 대문처럼 대로 넷에 `terrace-stair` 를 세우려 했다. 그런데 단상
// 테두리와 물가 사이가 0.7 밖에 없다 — 계단 모델은 안길이가 2.8 이라 놓는 족족
// 물 위에 섰고, 절반 크기로 줄여도 안 들어간다.
//
// 그리고 컨셉 아트를 다시 보면 광장은 **둘레 전체가 동심원 계단**이지 네 군데
// 계단참이 아니다. 그러니 축대 단면 자체를 계단으로 깎는 게 맞다 — 어느 방향에서
// 올라가도 계단이고, 프롭이 하나도 안 늘고, 물가와 다툴 일도 없다.
/** (바깥으로 물린 거리, 높이) — 발치에서 꼭대기 순. 두 단 + 갓돌. */
const DAIS_PROFILE: [number, number][] = [
  [DAIS_WALL_RUN, 0],
  [DAIS_WALL_RUN, 0.24],
  [0.28, 0.24],
  [0.28, 0.48],
  [0.1, 0.48],
  [0.1, 0.55],
  [0, 0.55]
];

// ─── 광장 고리 회랑 ──────────────────────────────────────────────────────────
// 컨셉의 광장 섬은 물 위 둥근 산책로가 두른다. 단상 축대 발치를 따라 도는
// 돌 데크 — 방사 다리들이 여기서 갈라져 나가는 그림이 된다.
//
// 치수(폭·데크 높이)는 villageTerrain.PLAZA_RING 이 유일한 권위다. 걷기
// (walkHeightAt)가 같은 값을 보므로, 여기 그린 데크 위를 정확히 그 높이로 걷는다.
//
// 단면: 안쪽 테두리(단상 발치에 밀어 넣음) → 데크 상판 → 바깥 모서리 →
// 수면 아래로 내려가는 치마. 치마가 없으면 데크가 물 위에 뜬 종이가 된다.
function PlazaRingWalk() {
  const texture = useMemo(() => makeBankTexture(), []);

  const geometry = useMemo(() => {
    if (PLAZA_STEP === 0 || PLAZA_DAIS.length < 8) return null;
    const DECK = PLAZA_RING.deck;
    const W = PLAZA_RING.width;
    // (테두리에서 바깥으로, y) — 안쪽부터. 안쪽 끝은 축대 발치 밑으로 0.3
    // 밀어 넣어 실틈이 안 생기게 한다.
    const profile: [number, number][] = [
      [-0.3, DECK],
      [W - 0.12, DECK],
      [W, DECK - 0.06],
      [W, -0.25]
    ];
    const vAt = [0];
    for (let i = 1; i < profile.length; i++)
      vAt.push(
        vAt[i - 1] +
          Math.hypot(
            profile[i][0] - profile[i - 1][0],
            profile[i][1] - profile[i - 1][1]
          ) /
            1.88
      );

    const pts = [...PLAZA_DAIS, PLAZA_DAIS[0]];
    const wp: number[] = [];
    const wuv: number[] = [];
    const widx: number[] = [];
    let arc = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0)
        arc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
      const r = Math.hypot(pts[i].x, pts[i].z) || 1;
      const nx = pts[i].x / r;
      const nz = pts[i].z / r;
      for (let n = 0; n < profile.length; n++) {
        const [out, y] = profile[n];
        wp.push(pts[i].x + nx * out, y, pts[i].z + nz * out);
        wuv.push(arc / 1.88, vAt[n]);
      }
    }
    const CROSS = profile.length;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = i * CROSS;
      const b = (i + 1) * CROSS;
      // 감김은 PlazaDais 와 같은 순서여야 한다. "안→밖 단면이니 반대"라고
      // 뒤집었다가 상판 법선이 −Y 가 되어 **하늘에서 데크가 통째로 컬링**됐다
      // (남는 치마만 검은 지느러미로 보였다). 반시계 고리에서 이 순서가 +Y 다.
      for (let n = 0; n + 1 < CROSS; n++)
        widx.push(a + n, b + n, a + n + 1, a + n + 1, b + n, b + n + 1);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(wp, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(wuv, 2));
    geo.setIndex(widx);
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (!geometry) return null;
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
    </mesh>
  );
}

function PlazaDais() {
  const texture = useMemo(() => makeBankTexture(), []);
  const grass = useTexture("/textures/grass-village.png");
  const macro = useMemo(() => makeMacroTexture(), []);
  const grassMap = useMemo(() => {
    const t = grass.clone();
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.anisotropy = 8;
    t.colorSpace = SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [grass]);

  const {wall, top} = useMemo(() => {
    if (PLAZA_STEP === 0 || PLAZA_DAIS.length < 8)
      return {wall: null, top: null};
    const pts = [...PLAZA_DAIS, PLAZA_DAIS[0]];

    // ── 옆면: 계단 단면을 한 바퀴 두른다. 높이는 PLAZA_STEP 에 맞춰 늘인다 —
    //    표는 0.55 기준으로 적혀 있으므로 단 높이를 바꿔도 비율이 유지된다.
    const k = PLAZA_STEP / 0.55;
    const profile: [number, number][] = DAIS_PROFILE.map(([o, y]) => [
      o,
      y * k
    ]);
    const wp: number[] = [];
    const wuv: number[] = [];
    const widx: number[] = [];
    // v 는 단면을 따라간 거리 / 단 높이 — 어느 단에서나 돌 한 장 크기가 같다
    const vAt = [0];
    for (let i = 1; i < profile.length; i++)
      vAt.push(
        vAt[i - 1] +
          Math.hypot(
            profile[i][0] - profile[i - 1][0],
            profile[i][1] - profile[i - 1][1]
          ) /
            PLAZA_STEP
      );

    let arc = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0)
        arc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
      const r = Math.hypot(pts[i].x, pts[i].z) || 1;
      const nx = pts[i].x / r; // 바깥 방향 = 중심에서 나가는 방향
      const nz = pts[i].z / r;
      for (let n = 0; n < profile.length; n++) {
        const [out, y] = profile[n];
        wp.push(pts[i].x + nx * out, y, pts[i].z + nz * out);
        wuv.push(arc / 1.88, vAt[n]);
      }
    }
    const CROSS = profile.length;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = i * CROSS;
      const b = (i + 1) * CROSS;
      for (let n = 0; n + 1 < CROSS; n++)
        widx.push(a + n, b + n, a + n + 1, a + n + 1, b + n, b + n + 1);
    }
    const wallGeo = new BufferGeometry();
    wallGeo.setAttribute("position", new Float32BufferAttribute(wp, 3));
    wallGeo.setAttribute("uv", new Float32BufferAttribute(wuv, 2));
    wallGeo.setIndex(widx);
    wallGeo.computeVertexNormals();

    // ── 뚜껑: 중심에서 부챗살로. 판석이 그 위를 거의 덮지만, 포장이 못 닿는
    //    테두리 한 줄(타일 반대각만큼)이 잔디로 남아야 단 위가 안 뚫린다.
    const tp: number[] = [0, PLAZA_STEP, 0];
    const tuv: number[] = [0, 0];
    const tidx: number[] = [];
    for (let i = 0; i < PLAZA_DAIS.length; i++) {
      const p = PLAZA_DAIS[i];
      tp.push(p.x, PLAZA_STEP, p.z);
      tuv.push(p.x / GRASS_TILE_WORLD, p.z / GRASS_TILE_WORLD);
    }
    for (let i = 0; i < PLAZA_DAIS.length; i++) {
      const a = 1 + i;
      const b = 1 + ((i + 1) % PLAZA_DAIS.length);
      tidx.push(0, b, a); // 위를 보게
    }
    const topGeo = new BufferGeometry();
    topGeo.setAttribute("position", new Float32BufferAttribute(tp, 3));
    topGeo.setAttribute("uv", new Float32BufferAttribute(tuv, 2));
    topGeo.setIndex(tidx);
    topGeo.computeVertexNormals();

    return {wall: wallGeo, top: topGeo};
  }, []);

  if (!wall || !top) return null;
  return (
    <>
      <mesh geometry={wall} receiveShadow castShadow>
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
      {/* 판석이 이 면보다 몇 cm 위라, 안 밀면 멀어질수록 잔디가 이겨 포장이 사라진다 */}
      <mesh geometry={top} receiveShadow>
        <meshStandardMaterial
          ref={m => m && applyGroundMacro(m, macro)}
          map={grassMap}
          roughness={0.95}
          metalness={0}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
    </>
  );
}

// ─── 구역 단차의 옆면 (축대) ──────────────────────────────────────────────────
// `villageTerrain.ts` 가 구역 판석을 한 계단 올려 놓는데, 판석은 **두께 없는
// 평면 한 장**이라 옆에서 보면 공중에 뜬 판이다. 그 옆구리를 메우는 축대다.
//
// ── 처음엔 세로 띠 한 장이었다 ─────────────────────────────────────────────
// 사각형마다 8삼각형짜리 상자 옆면에 정점 색만 얹었는데, 손그림 판석 옆에서
// **회색 콘크리트 턱**으로 보였다. 층이 안 느껴진 게 아니라 층의 옆면이
// 재료로 안 읽힌 것이다. 그래서 두 가지를 더한다:
//
//   ① 돌쌓기 텍스처 (terraceBank.ts, 런타임 canvas) — 줄눈·이끼·돌마다 다른 색
//   ② 세 마디 단면 — 지대석(발치에서 튀어나온 받침) / 벽면 / 갓돌(위에서 덮는 챙)
//      벽면 하나만 있으면 어디까지가 축대인지 경계가 안 생긴다. 갓돌 챙이
//      드리우는 그림자 한 줄이 부감에서 "여기가 단의 끝"을 만든다.
//
// ── 왜 받은 terrace-wall.glb 를 안 까나 ────────────────────────────────────
// 그건 **ㄱ자 모서리** 조각이라 직선 구간에 늘어놓으면 ㄱ자만 되풀이된다.
// 게다가 여섯 구역 둘레가 280유닛이 넘어 1.88마다 놓으면 150개 × 8천 삼각형이다.
// 직선은 여기(삼각형 288개)가 맡고, 모서리에만 그 조각을 놓는다.
const PLINTH_OUT = 0.1;
const PLINTH_H = 0.2;
const CAP_OUT = 0.12;
const CAP_H = 0.15;

function TerraceBanks() {
  const texture = useMemo(() => makeBankTexture(), []);

  const geometry = useMemo(() => {
    if (TERRACE_STEP === 0) return null;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // 단면을 (바깥으로 튀어나온 거리, 높이) 목록으로 적는다. 아래에서 위로.
    // 마디를 따라간 실제 거리(호 길이)를 v 로 쓰므로 지대석·갓돌 위에도
    // 돌 무늬가 이어진다 — 수평면만 단색으로 남으면 거기가 플라스틱처럼 보인다.
    const profile: [number, number][] = [
      [PLINTH_OUT, 0],
      [PLINTH_OUT, PLINTH_H],
      [0, PLINTH_H],
      [0, TERRACE_STEP - CAP_H],
      [CAP_OUT, TERRACE_STEP - CAP_H],
      [CAP_OUT, TERRACE_STEP],
      [0, TERRACE_STEP]
    ];
    const vAt: number[] = [0];
    for (let i = 1; i < profile.length; i++) {
      const d = Math.hypot(
        profile[i][0] - profile[i - 1][0],
        profile[i][1] - profile[i - 1][1]
      );
      vAt.push(vAt[i - 1] + d / TERRACE_STEP);
    }

    for (const isl of ISLANDS) {
      // 원반 섬 — 사각 단 시절의 "네 귀퉁이 + 변"이 "원둘레 N마디"가 됐다.
      // 마디 0.9유닛이면 곡률이 눈에 안 걸린다(제일 작은 섬 r 4.3 에서 30마디).
      const N = Math.max(24, Math.round((2 * Math.PI * isl.r) / 0.9));
      const ring = (o: number): [number, number][] =>
        Array.from({length: N}, (_, k) => {
          const a = (k / N) * Math.PI * 2;
          return [
            isl.x + Math.cos(a) * (isl.r + o),
            isl.z + Math.sin(a) * (isl.r + o)
          ];
        });
      // u 는 둘레를 따라간 거리 / 격자 한 칸 — 어느 섬에서나 돌 한 장 크기가 같다
      const segLen = (2 * Math.PI * isl.r) / N;

      for (let i = 0; i + 1 < profile.length; i++) {
        const A = ring(profile[i][0]);
        const B = ring(profile[i + 1][0]);
        const yA = profile[i][1],
          yB = profile[i + 1][1];
        const vA = vAt[i],
          vB = vAt[i + 1];

        for (let s = 0; s < N; s++) {
          const e = (s + 1) % N;
          const u0 = (s * segLen) / 1.88;
          const u1 = ((s + 1) * segLen) / 1.88;
          const base = positions.length / 3;
          // 각도 증가 방향이 사각형 시절의 귀퉁이 순서와 같은 감기라 면의
          // 앞뒤 규칙(profile 주석)이 그대로 성립한다.
          positions.push(A[s][0], yA, A[s][1]);
          uvs.push(u0, vA);
          positions.push(B[s][0], yB, B[s][1]);
          uvs.push(u0, vB);
          positions.push(A[e][0], yA, A[e][1]);
          uvs.push(u1, vA);
          positions.push(B[e][0], yB, B[e][1]);
          uvs.push(u1, vB);
          indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
        }
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (!geometry) return null;
  return (
    <>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
      <TerraceTops />
    </>
  );
}

// ─── 구역 단의 윗면 ───────────────────────────────────────────────────────────
// 단 위(y = TERRACE_STEP)를 덮는 잔디 뚜껑. 사각형마다 2삼각형, 여섯 구역 합쳐 12개다.
//
// 왜 필요한가: `Ground` 의 잔디 원반은 y ≈ 0 에 있고 지형을 따라 올라오지 않는다.
// 한동안 단 위는 판석 454장이 덮고 있어서 이게 없어도 됐는데, 그 판석을 걷어내
// 잔디로 되돌리면서 단 위가 뻥 뚫려 1.1 아래가 보이게 됐다.
//
// 텍스처는 `Ground` 와 **같은 그림에 같은 배율**(2유닛에 한 장)이라, 단 위 잔디와
// 아래 잔디가 같은 결로 보인다. 다만 repeat 를 건드리면 원반 쪽이 같이 망가지므로
// 복제해서 쓰고, 반복은 uv 에 직접 굽는다.
function TerraceTops() {
  const base = useTexture("/textures/grass-village.png");
  // 단 위도 같은 얼룩을 탄다. 안 걸면 단 위만 민무늬로 남아 층이 색으로 갈린다.
  const macro = useMemo(() => makeMacroTexture(), []);
  const map = useMemo(() => {
    const t = base.clone();
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(1, 1);
    t.anisotropy = 8;
    t.colorSpace = SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [base]);

  const geometry = useMemo(() => {
    if (TERRACE_STEP === 0) return null;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (const isl of ISLANDS) {
      // 원반 뚜껑 — 가운데 정점에서 부챗살. uv 는 **월드 좌표**라 섬마다 잔디
      // 결이 이어지고, 크기가 달라도 늘어나지 않는다.
      const N = Math.max(24, Math.round((2 * Math.PI * isl.r) / 0.9));
      const center = positions.length / 3;
      positions.push(isl.x, TERRACE_STEP, isl.z);
      uvs.push(isl.x / GRASS_TILE_WORLD, isl.z / GRASS_TILE_WORLD);
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        const x = isl.x + Math.cos(a) * isl.r;
        const z = isl.z + Math.sin(a) * isl.r;
        positions.push(x, TERRACE_STEP, z);
        uvs.push(x / GRASS_TILE_WORLD, z / GRASS_TILE_WORLD);
      }
      // 위를 보게 — 각도 증가(반시계) 순서에서 (중심, k+1, k) 가 +Y 법선이다
      for (let k = 0; k < N; k++)
        indices.push(center, center + 1 + ((k + 1) % N), center + 1 + k);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (!geometry) return null;
  // polygonOffset 은 `Ground` 와 같은 이유다 — 길 타일·앞마당 원반이 이 면보다
  // 겨우 몇 cm 위라, 안 밀면 멀어질수록 잔디가 이겨 길이 사라진다.
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        ref={m => m && applyGroundMacro(m, macro)}
        map={map}
        roughness={0.95}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={2}
        polygonOffsetUnits={4}
      />
    </mesh>
  );
}

// ─── 섬 공유지: 미니광장 + 차선 ──────────────────────────────────────────────
// 컨셉의 섬 내부는 동심원이다 — 가운데 포장 미니광장(분수 자리), 문 앞을 도는
// 안쪽 차선, 담장 안쪽을 도는 테두리 차선, 다리로 나가는 방사 스포크.
// 격자 타일로 방사선을 그리면 계단처럼 삐뚤어지므로, 좌표는 생성기
// (generate-ground-layout → villageTerraces.json)가 내보내고 여기서는 리본
// 메시로만 그린다. 재질은 축대·회랑과 같은 돌(makeBankTexture) — 섬의 돌
// 요소가 한 재질로 묶여야 "깎아 만든 땅"으로 읽힌다.
const LANE_W = 1.15;

function IslandCommons() {
  const texture = useMemo(() => makeBankTexture(), []);

  const geometry = useMemo(() => {
    if (TERRACE_STEP === 0) return null;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];

    // ① 미니광장 원반 — 부챗살. 감김은 TerraceTops 와 같다(+Y).
    for (const c of ISLAND_COMMONS) {
      const N = Math.max(20, Math.round((2 * Math.PI * c.plazaR) / 0.6));
      const center = pos.length / 3;
      pos.push(c.x, TERRACE_STEP + 0.02, c.z);
      uv.push(c.x / 1.88, c.z / 1.88);
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        const x = c.x + Math.cos(a) * c.plazaR;
        const z = c.z + Math.sin(a) * c.plazaR;
        pos.push(x, TERRACE_STEP + 0.02, z);
        uv.push(x / 1.88, z / 1.88);
      }
      for (let k = 0; k < N; k++)
        idx.push(center, center + 1 + ((k + 1) % N), center + 1 + k);
    }

    // ② 차선 리본 — 마디 접선의 수직으로 좌우 반폭. 닫힌 고리는 첫 마디를
    //    한 번 더 밟아 이음매를 붙인다.
    for (const lane of ISLAND_LANES) {
      const p = lane.pts;
      const n = p.length;
      if (n < 2) continue;
      const base = pos.length / 3;
      const count = lane.closed ? n + 1 : n;
      let arc = 0;
      for (let i = 0; i < count; i++) {
        const cur = p[i % n];
        const prev = p[(i - 1 + n) % n];
        const next = p[(i + 1) % n];
        const useP = lane.closed || i > 0 ? prev : cur;
        const useN = lane.closed || i < n - 1 ? next : cur;
        let dx = useN.x - useP.x;
        let dz = useN.z - useP.z;
        const l = Math.hypot(dx, dz) || 1;
        dx /= l;
        dz /= l;
        if (i > 0) {
          const q = p[(i - 1 + n) % n];
          arc += Math.hypot(cur.x - q.x, cur.z - q.z);
        }
        pos.push(
          cur.x - dz * (LANE_W / 2),
          TERRACE_STEP + 0.03,
          cur.z + dx * (LANE_W / 2)
        );
        uv.push(arc / 1.88, 0.05);
        pos.push(
          cur.x + dz * (LANE_W / 2),
          TERRACE_STEP + 0.03,
          cur.z - dx * (LANE_W / 2)
        );
        uv.push(arc / 1.88, 0.55);
      }
      // 감김: (L, L+1, R) 순이 +Y — 반대로 감으면 위에서 통째로 컬링된다
      // (고리 회랑에서 한 번 당한 함정이다)
      for (let i = 0; i + 1 < count; i++) {
        const a = base + i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (!geometry) return null;
  // TerraceTops(잔디 뚜껑)가 polygonOffset 으로 뒤로 밀려 있으므로 여기는
  // 기본값이면 이긴다. 몇 cm 위에 떠 있어 그림자도 자연스럽다.
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={texture} roughness={0.92} metalness={0} />
    </mesh>
  );
}

// 마을을 두르는 먼 언덕.
//
// 마을이 웅장해 보이지 않던 가장 큰 이유는 소품 수가 아니라 **지평선이 없다**는
// 것이었다. 모든 게 y=0 평면 위에 놓여 있어서, 카메라를 눈높이로 내리면
// "초록 판때기 + 그 위의 하늘"이 전부였다. 사람은 멀리 있는 큰 덩어리에서
// 깊이감을 얻는다.
//
// 그렇다고 바닥 자체를 울퉁불퉁하게 만들 수는 없다. 길 타일·건물·소품 900여 개가
// 전부 y=0 기준으로 배치돼 있어서 지형을 건드리면 전부 뜨거나 파묻힌다.
// 그래서 **아무것도 배치돼 있지 않은 바깥(r ≥ 30)에만** 언덕 고리를 세운다.
// 마을 안은 손대지 않으므로 기존 배치가 한 개도 안 깨진다.
//
// 삼각형 4,800개짜리 메시 하나 = draw call 1회. 나머지는 fog가 공기 원근을 만든다.
//
// 섬이 되면서 언덕은 **물 건너 산**이 됐다. 안쪽 반지름을 절벽(40) 한참 밖으로
// 밀어 두 사이에 수면이 넓게 드러나게 한다 — 그 물 폭이 곧 거리감이다.
const HILL_INNER = 62;
const HILL_OUTER = 130;
const HILL_RINGS = 20;
const HILL_SEGMENTS = 120;

function hillHeight(radius: number, angle: number) {
  // 능선 — 주기가 다른 사인 3겹. 노이즈를 쓸 만큼 정교할 필요가 없다.
  const ridge =
    9 +
    6.5 * Math.sin(angle * 3 + 0.7) +
    4.2 * Math.sin(angle * 5 + 2.3) +
    2.4 * Math.sin(angle * 9 + 4.1);
  // 안쪽 가장자리는 **수면 아래**에서 시작한다. 물 위에서 시작하면 호수 한가운데
  // 초록 선반이 떠 있는 꼴이 된다. 30유닛에 걸쳐 물 밖으로 올라온다.
  const t = Math.min(1, (radius - HILL_INNER) / 30);
  const ramp = t * t * (3 - 2 * t);
  // 바깥으로 갈수록 한 겹 더 높은 능선 — 산줄기가 겹쳐 보이게
  const layer =
    1 +
    0.6 *
      Math.max(0, (radius - HILL_INNER - 34) / 40) *
      (1.4 + Math.sin(angle * 4 + 1.1));
  return WATER_Y - 4 + ramp * Math.max(2, ridge) * layer;
}

function DistantHills() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // 능선이 높을수록 밝은 녹색, 골짜기는 어두운 침엽수 색. 정점 색이라 공짜다.
    const low = new Color("#466941");
    const high = new Color("#89a473");
    const mixed = new Color();

    for (let ri = 0; ri <= HILL_RINGS; ri++) {
      const radius = HILL_INNER + ((HILL_OUTER - HILL_INNER) * ri) / HILL_RINGS;
      for (let ai = 0; ai <= HILL_SEGMENTS; ai++) {
        const angle = (Math.PI * 2 * ai) / HILL_SEGMENTS;
        const y = hillHeight(radius, angle);
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        mixed
          .copy(low)
          .lerp(high, Math.min(1, Math.max(0, (y - WATER_Y) / 22)));
        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }

    const stride = HILL_SEGMENTS + 1;
    for (let ri = 0; ri < HILL_RINGS; ri++) {
      for (let ai = 0; ai < HILL_SEGMENTS; ai++) {
        const a = ri * stride + ai;
        indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 그림자는 주고받지 않는다 — 그림자 카메라는 마을만 덮도록 좁게 잡았고,
  // 이만큼 먼 물체를 넣으면 섀도맵 해상도를 통째로 낭비한다.
  return (
    <mesh geometry={geometry} position={ISLAND_CENTER}>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

// ─── 하늘 ────────────────────────────────────────────────────────────────────
// 예전엔 `<color attach="background">` 단색 한 장이었다. 컨셉 아트와 나란히 놓고
// 보니 위쪽 3분의 1이 통째로 빈 공간이었다 — 노을 그림에서 하늘은 주인공인데
// 우리 하늘엔 아무것도 없었다.
//
// 안쪽을 칠한 큰 구 하나. 정점 색으로 지평선 → 꼭대기 그라데이션을 굽고,
// 지평선 색은 fog 와 같게 맞춘다 — 그래야 먼 산이 하늘로 자연스럽게 녹아든다.
// fog 를 끄는 게 중요하다(켜면 돔 전체가 fog 색으로 덮여 그라데이션이 사라진다).
// depthWrite 를 끄고 렌더 순서를 뒤로 밀어 모든 것 뒤에 그린다.
const SKY_RADIUS = 420;

function SkyDome({horizon, top}: {horizon: string; top: string}) {
  const geometry = useMemo(() => {
    const geo = new SphereGeometry(SKY_RADIUS, 32, 20);
    const lo = new Color(horizon);
    const hi = new Color(top);
    const mixed = new Color();
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      // 지평선(y=0) 바로 위에서 빠르게 밝아지고 위로 갈수록 천천히 — 실제 하늘의 느낌
      const t = Math.max(0, pos.getY(i) / SKY_RADIUS);
      mixed.copy(lo).lerp(hi, Math.pow(t, 0.55));
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return geo;
  }, [horizon, top]);

  return (
    <mesh geometry={geometry} renderOrder={-1} frustumCulled={false}>
      <meshBasicMaterial
        vertexColors
        side={BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// 하늘 돔 안쪽에 도는 구름 껍질.
//
// 그라데이션 돔 하나만 있으면 하늘이 "색칠한 배경판"으로 보인다. 컨셉 아트의
// 하늘에는 지평선 위로 낮게 깔린 구름 덩어리가 있고, 그게 노을을 실제 하늘로
// 만든다. 텍스처는 파일이 아니라 코드로 만든다 — 이유는 lib/skyClouds.ts 머리말.
//
// 아주 느리게 돈다(약 26분에 한 바퀴). 멈춰 있으면 스티커처럼 보이고,
// 눈에 띄게 돌면 시선을 뺏는다.
function CloudLayer({
  light,
  dark,
  cover
}: {
  light: string;
  dark: string;
  cover: number;
}) {
  const ref = useRef<Mesh>(null);
  const texture = useMemo(
    () => (cover > 0 ? makeCloudTexture(light, dark, cover) : null),
    [light, dark, cover]
  );
  useEffect(() => () => texture?.dispose(), [texture]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.004;
  });
  if (!texture) return null;
  return (
    <mesh ref={ref} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[SKY_RADIUS * 0.96, 48, 24]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        transparent
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// 해(밤엔 달). 하늘 돔 바로 안쪽, 태양광과 **같은 방향**에 둔다 —
// 빛은 오른쪽에서 오는데 해가 왼쪽에 떠 있으면 바로 눈에 걸린다.
function SunDisc({
  direction,
  radius,
  color
}: {
  direction: [number, number, number];
  radius: number;
  color: string;
}) {
  const position = useMemo(() => {
    const v = new Vector3(...direction)
      .normalize()
      .multiplyScalar(SKY_RADIUS * 0.94);
    return v;
  }, [direction]);
  return (
    <Billboard position={position} renderOrder={-1}>
      <mesh>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={color}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </mesh>
      {/* 번짐 — 원반만 있으면 스티커처럼 보인다 */}
      <mesh position={[0, 0, -0.5]}>
        <circleGeometry args={[radius * 3.4, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.18}
          depthWrite={false}
          fog={false}
          toneMapped={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
}

// ─── 구역 이름 현판 ──────────────────────────────────────────────────────────
// 컨셉 아트에서 조감도를 펼쳤을 때 제일 먼저 읽히는 건 건물이 아니라 구역 위에
// 큼직하게 떠 있는 **리본 현판**이다 — PROJECTS · SKILLS · LIFE …
// 그게 있어서 여섯 덩어리가 각각 무슨 구역인지 한눈에 들어온다.
//
// 우리한테도 입구 현판 아치가 있지만 그건 길 위 사람 눈높이(7.5m)에 서 있어서,
// 카메라를 부감으로 빼면 점처럼 보인다. 아치는 "문"으로 두고, 위에서 읽히는
// **이름표는 따로** 띄운다.
//
// 3D 글자(troika Text)를 안 쓴 이유: 기본 폰트를 CDN에서 받아 오는데 이 앱은
// 폰트를 로컬에 안 들고 있다. Html 은 이 씬이 이미 쓰고 있고(NPC 말풍선),
// 시스템 폰트라 한글도 안 깨진다.
const DISTRICT_BANNERS: {
  district: string;
  label: string;
  ribbon: string;
  ink: string;
}[] = [
  {district: "projects", label: "PROJECTS", ribbon: "#8a4a2e", ink: "#ffe2a8"},
  {district: "skills", label: "SKILLS", ribbon: "#2f5d4a", ink: "#ffe2a8"},
  {
    district: "experience",
    label: "EXPERIENCE",
    ribbon: "#4a3b6b",
    ink: "#ffe2a8"
  },
  {district: "study", label: "STUDY", ribbon: "#2c4a6b", ink: "#ffe2a8"},
  {district: "life", label: "LIFE", ribbon: "#6b5423", ink: "#ffe2a8"},
  {district: "contact", label: "CONTACT", ribbon: "#7a2f2f", ink: "#ffe2a8"}
];

/** 구역별 건물 무게중심 — 현판을 그 위에 띄운다 */
const DISTRICT_CENTERS: Record<string, {x: number; z: number; top: number}> =
  (() => {
    const acc: Record<string, {x: number; z: number; n: number; top: number}> =
      {};
    for (const b of villageBuildings) {
      if (b.district === "plaza") continue;
      const at = (acc[b.district] ??= {x: 0, z: 0, n: 0, top: 0});
      at.x += b.position[0];
      at.z += b.position[2];
      at.n += 1;
      // 가장 높은 건물보다 위로 띄워야 지붕에 안 걸린다
      at.top = Math.max(at.top, b.size[1]);
    }
    return Object.fromEntries(
      Object.entries(acc).map(([k, v]) => [
        k,
        {x: v.x / v.n, z: v.z / v.n, top: v.top}
      ])
    );
  })();

function DistrictBanner({
  label,
  ribbon,
  ink,
  at
}: {
  label: string;
  ribbon: string;
  ink: string;
  at: {x: number; z: number; top: number};
}) {
  const calculatePosition = useMemo(
    () => createThrottledCalculatePosition(LABEL_SYNC_STRIDE),
    []
  );
  const plate = useRef<HTMLDivElement>(null);
  const here = useMemo(() => new Vector3(at.x, at.top + 1.8, at.z), [at]);
  // 화면 고정 크기라 코앞에서도 안 줄어든다 — 걸어 다닐 때 눈앞을 가리지 않게
  // 가까우면 지운다. 멀리 있는 다른 구역 현판은 그대로 남아 길잡이가 된다.
  const tick = useRef(0);
  useFrame(({camera}) => {
    if (!plate.current || (tick.current = (tick.current + 1) % 6) !== 0) return;
    const d = camera.position.distanceTo(here);
    plate.current.style.opacity = String(
      Math.min(1, Math.max(0, (d - 14) / 10))
    );
  });
  return (
    <Html
      center
      calculatePosition={calculatePosition}
      // distanceFactor 를 쓰면 원근을 타서 "마을 위에 걸린 물건"처럼 보이는데,
      // 정작 이 현판이 필요한 건 섬 전체를 담는 부감이다. 14 로 잡았을 때
      // 거리 63 에서 배율 0.22 → 57×14px 로 찍혀 아예 안 읽혔다.
      // 그래서 지도 라벨처럼 **화면 고정 크기**로 간다. 대신 가까이 가면
      // 눈앞을 가리므로 아래 opacity 로 걷어낸다.
      position={[at.x, at.top + 1.8, at.z]}
      zIndexRange={[6, 0]}
      style={{pointerEvents: "none", userSelect: "none"}}
    >
      <div
        ref={plate}
        style={{
          // 나무 현판 — 가운데가 밝고 위아래가 어두운 원통형 음영
          background: `linear-gradient(180deg, ${ribbon} 0%, ${shade(
            ribbon,
            1.35
          )} 45%, ${ribbon} 78%, ${shade(ribbon, 0.7)} 100%)`,
          border: "2px solid #c79a4e",
          borderRadius: 6,
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.22)",
          padding: "3px 12px",
          whiteSpace: "nowrap"
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: ink,
            textShadow: "0 1px 0 rgba(0,0,0,0.6)"
          }}
        >
          {label}
        </span>
      </div>
    </Html>
  );
}

/** #rrggbb 를 배수만큼 밝게/어둡게 */
function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c =>
    Math.max(0, Math.min(255, Math.round(c * factor)))
  );
  return `rgb(${ch.join(",")})`;
}

function ActiveRoute({activeSection}: {activeSection: SectionId}) {
  const building = villageBuildings.find(
    b => b.sectionId === activeSection && b.district !== "plaza"
  );

  if (!building || activeSection === "intro") {
    return (
      <group>
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.66, 64]} />
          <meshBasicMaterial color="#53cdff" transparent opacity={0.22} />
        </mesh>
        <pointLight
          color="#53cdff"
          intensity={0.5}
          distance={4}
          decay={2}
          position={[0, 0.4, 0]}
        />
      </group>
    );
  }

  const [x, , z] = building.position;
  const dist = Math.sqrt(x * x + z * z);
  const angle = Math.atan2(z, x);

  return (
    <group>
      {/* 길 타일 윗면이 y=0.02라, 예전 높이(0.014/0.015)에 그리면 길 밑에 깔려 안 보인다 */}
      <mesh
        position={[x / 2, 0.05 + terrainHeightAt(x / 2, z / 2), z / 2]}
        rotation={[-Math.PI / 2, 0, angle]}
      >
        <planeGeometry args={[dist, 0.07]} />
        <meshBasicMaterial
          color={building.accentColor}
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.3, 48]} />
        <meshBasicMaterial
          color={building.accentColor}
          transparent
          opacity={0.28}
        />
      </mesh>
      <pointLight
        color={building.accentColor}
        intensity={0.6}
        distance={4}
        decay={2}
        position={[x, 0.6, z]}
      />
    </group>
  );
}

function LiveDecorations({villageState}: {villageState: VillageState | null}) {
  if (!villageState) return null;

  const unlocked = new Set(villageState.unlocked_items);

  return (
    <group>
      {unlocked.has("training-statue") ? (
        <group position={[1.7, 0, 1.8]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.35, 0.42, 0.36, 18]} />
            <meshStandardMaterial
              color="#26364a"
              metalness={0.5}
              roughness={0.35}
            />
          </mesh>
          <mesh castShadow position={[0, 0.72, 0]}>
            <boxGeometry args={[0.28, 0.72, 0.18]} />
            <meshStandardMaterial
              color="#d4bf47"
              emissive="#d4bf47"
              emissiveIntensity={0.18}
            />
          </mesh>
          <pointLight
            color="#d4bf47"
            intensity={0.8}
            distance={3}
            decay={2}
            position={[0, 1.1, 0]}
          />
        </group>
      ) : null}

      {unlocked.has("lab-beacon") ? (
        <group position={[-4.2, 0, -3.4]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 12]} />
            <meshStandardMaterial
              color="#0a1a2e"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.16, 18, 18]} />
            <meshBasicMaterial color="#53cdff" />
          </mesh>
          <pointLight
            color="#53cdff"
            intensity={1.5}
            distance={5}
            decay={2}
            position={[0, 1.2, 0]}
          />
        </group>
      ) : null}

      {unlocked.has("study-fountain") ? (
        <group position={[2.2, 0, -2.1]}>
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.48, 32]} />
            <meshBasicMaterial color="#ecd862" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#ecd862"
              emissive="#ecd862"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function VillageSceneImpl({
  activeSection,
  activeNpcId,
  explorationMode,
  isIntro = false,
  onSelectNpc,
  onRequestEnter,
  npcRuntimeStates,
  onNpcPositionChange,
  villageState,
  guideScriptedTarget,
  onGuideArrive,
  guideForceHold,
  cinematic,
  npcCommand,
  npcCommandTargets,
  overseerTarget,
  onEditingChange,
  npcSocialTargets
}: VillageSceneProps) {
  const isWalkMode = explorationMode === "walk";
  const propsApi = usePropsEditor();
  const editing = propsApi.enabled && propsApi.editMode;
  const sky = VILLAGE_PALETTE;
  // 모바일 라이트 모드 — 해상도/안티앨리어싱을 낮춰 성능·배터리 확보
  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
    []
  );
  // villageState는 30초 주기로만 바뀌므로, npcRuntimeStates가 바뀌는 2~3초마다
  // 매번 Array.find로 선형 탐색하지 않도록 Map을 villageState가 바뀔 때만 새로 만든다.
  // 색보정표. 팔레트가 새로고침 전까지 안 바뀌므로 딱 한 번 굽는다.
  // 모바일은 후처리 자체를 안 돌리니 굽지도 않는다.
  const gradeLut = useMemo(
    () => (isMobile || !LUT_ENABLED ? null : makeGradeLut(sky.grade)),
    [isMobile, sky.grade]
  );

  const buildingStateMap = useMemo(
    () => buildBuildingStateMap(villageState),
    [villageState]
  );
  const npcStateMap = useMemo(
    () => buildNpcStateMap(villageState),
    [villageState]
  );

  // 편집 모드일 때 부모가 자동 갱신(순찰·잡담·폴링)을 멈추도록 알린다.
  // (편집 중 잦은 리렌더 + 후처리 아웃라인이 R3F 재조정 루프를 유발하는 문제 방지)
  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative h-[48vh] min-h-[390px] overflow-hidden border-y border-[#00d4ff]/15 bg-[#050d1a] shadow-[inset_0_-30px_70px_rgba(0,100,255,0.1)] md:h-screen md:min-h-[720px] md:border-y-0 md:border-r"
      onDragOver={editing ? e => e.preventDefault() : undefined}
      onDrop={
        editing
          ? e => {
              const glb = e.dataTransfer.getData("application/x-prop-glb");
              if (glb) {
                e.preventDefault();
                propsApi.setPendingDrop({
                  glb,
                  clientX: e.clientX,
                  clientY: e.clientY
                });
              }
            }
          : undefined
      }
    >
      <LoadingVeil />
      <Canvas
        camera={{fov: 40, position: [4, 14, 16]}}
        dpr={isMobile ? [1, 1] : [1, 1.25]}
        performance={{min: isMobile ? 0.4 : 0.5}}
        // toneMappingExposure — 마을 전체 밝기의 유일한 손잡이. 자세한 이유는
        // timePalette 주석 참고(요약: 1.0에서는 잔디가 ACES 어깨에 붙어 그림자가 눌린다).
        gl={{
          antialias: !isMobile,
          powerPreference: "high-performance",
          toneMappingExposure: 0.68
        }}
        // 모바일은 끈다 — 섀도맵 패스가 통째로 한 번 더 도는 비용이 크다.
        //
        // 데스크톱은 기본값(PCF). 처음엔 "soft"(PCFSoftShadowMap)로 뒀는데 이 three
        // 버전에서 폐기돼 매 로드마다 경고를 뱉고 어차피 PCF로 대체된다.
        // 2048 섀도맵을 68유닛에 펴 발라 텍셀이 3cm다. 그림자 경계가 거슬리면
        // mapSize 를 올리는 쪽이 낫다.
        shadows={!isMobile}
      >
        {/* 움직일 땐 해상도/이벤트 자동 저하 → 멈추면 선명하게 */}
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
        {/* 개발 모드 계기판 — Suspense 밖이라 로딩 중에도 계측된다 */}
        <PerfProbe />
        <color args={[sky.skyHorizon]} attach="background" />
        <fog args={[sky.fog, sky.near, sky.far]} attach="fog" />
        <ambientLight color="#ffffff" intensity={sky.amb} />

        {/* 그림자를 드리우는 유일한 광원.
            ─── 왜 하나뿐인가 ──────────────────────────────────────────────────
            섀도맵은 광원마다 씬을 통째로 한 번 더 그린다. 캐스터를 둘로 늘리면
            그림자가 교차하면서 만화 톤이 지저분해지기도 한다. 태양 하나만 켜고
            나머지는 순수 채움광으로 둔다.

            ─── 위치를 [8,20,8] 에서 밀어낸 이유 ────────────────────────────────
            방향광의 섀도 카메라는 광원 위치에 놓인 정사영 상자다. 마을은
            x −20~21 / z −15~22 로 퍼져 있어서, 광원이 마을 한복판 위(20유닛)에
            있으면 상자 near 면이 건물을 잘라 먹는다. 밖으로 빼서 마을 전체가
            near~far 사이에 들어오게 한다.

            ─── bias ───────────────────────────────────────────────────────────
            텍셀이 3cm라 잔디처럼 거의 수평인 면에서 섀도 애크니(줄무늬)가 뜬다.
            normalBias 로 표면 법선 방향으로 밀어내는 쪽이 bias 만 키우는 것보다
            피터패닝(그림자가 물체에서 떨어져 보임)이 덜하다. */}
        {/* 밤(달빛)에는 그림자를 끈다 — 섬 테두리 울타리 수십 토막의 그림자가
            달빛 저각에서 합쳐져, 석호 위에 가장자리가 직선인 **검은 다각형
            덩어리**로 떴다(하나씩 꺼 보면 티가 안 나는데 다 끄면 사라지는,
            "합쳐진 그림자" 버그). 밤 형태감은 팔레트 설계대로 AO(2.2)가 진다. */}
        <directionalLight
          color={sky.sun}
          intensity={sky.sunI}
          position={sky.sunPos}
          castShadow={GLINT_STRENGTH < 0.95}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={12}
          shadow-camera-far={170}
          shadow-camera-left={-48}
          shadow-camera-right={48}
          shadow-camera-top={48}
          shadow-camera-bottom={-48}
          shadow-bias={-0.0006}
          shadow-normalBias={0.05}
        />
        <directionalLight
          color={sky.fill}
          intensity={sky.fillI}
          position={[-6, 12, -4]}
        />
        <hemisphereLight args={[sky.hSky, sky.hGround, sky.hI]} />

        {/* 구역마다 살짝 다른 색감을 주는 보조광. 원래는 네온(청록/보라/연두/주황)이라
            잔디 위에서 색이 튀어서, 노을 톤 안에서 온도만 다른 따뜻한 색으로 낮췄다.
            sky.lamp 로 시간대에 따라 세기를 바꾼다 — 낮엔 햇빛에 묻히도록 죽이고
            밤엔 이것만 남아 창문·가로등 주변이 주황으로 뜬다. */}
        <pointLight
          color="#ffd9a8"
          intensity={1.2 * sky.lamp}
          distance={22}
          decay={2}
          position={[-5, 5, 0]}
        />
        <pointLight
          color="#e8c4ff"
          intensity={0.9 * sky.lamp}
          distance={20}
          decay={2}
          position={[3, 5, -5]}
        />
        <pointLight
          color="#d8f0b0"
          intensity={0.9 * sky.lamp}
          distance={20}
          decay={2}
          position={[6, 5, 5]}
        />
        <pointLight
          color="#ffbe86"
          intensity={0.9 * sky.lamp}
          distance={16}
          decay={2}
          position={[0, 4, 9]}
        />

        <Suspense fallback={null}>
          <SkyDome horizon={sky.skyHorizon} top={sky.skyTop} />
          <CloudLayer
            light={sky.cloudLight}
            dark={sky.cloudDark}
            cover={sky.cloudCover}
          />
          <SunDisc
            direction={sky.sunPos}
            radius={sky.discRadius}
            color={sky.discColor}
          />
          <Ground />
          <IslandCliff />
          <AnimationClock />
          <Water />
          <Waterways />
          <WaterGlints />
          <TerraceBanks />
          <PlazaDais />
          <PlazaRingWalk />
          <IslandCommons />
          <DistantHills />
          {PLAZA_LANDMARK_READY ? null : <Statue />}

          {/* 예전엔 네온 팻말 넷을 좌표로 박아 뒀는데, 구역을 컨셉 아트 방위로
              다시 배치하면서 넷 다 엉뚱한 자리에 남아 허공에 뜬 색판이 됐다.
              이제 건물 무게중심에서 계산하므로 배치를 옮겨도 따라온다. */}
          {DISTRICT_BANNERS.map(b =>
            DISTRICT_CENTERS[b.district] ? (
              <DistrictBanner
                key={b.district}
                label={b.label}
                ribbon={b.ribbon}
                ink={b.ink}
                at={DISTRICT_CENTERS[b.district]}
              />
            ) : null
          )}

          {!isWalkMode && <ActiveRoute activeSection={activeSection} />}
          <BuildingNetwork buildings={projectNetworkBuildings} />
          <LiveDecorations villageState={villageState} />

          {/* ─── 무거운 것들은 저마다의 Suspense 에 ────────────────────────
              전부 한 경계에 있으면 GLB 하나라도 안 오면 **마을 전체가** 빈
              하늘이다. 경계를 쪼개면 지형·하늘·물(위쪽, GLB 없음)이 먼저 뜨고
              프롭 → 건물 → NPC 가 내려오는 대로 차례차례 나타난다 —
              같은 로딩 시간이 "짓는 중"으로 보인다. */}
          <Suspense fallback={null}>
            <PropsLayer api={propsApi} />
          </Suspense>

          <Suspense fallback={null}>
            {villageBuildings.map(building => {
              const ov = propsApi.buildingOverrides[building.id];
              const merged = ov?.position
                ? {...building, position: ov.position}
                : building;
              return (
                <Building
                  key={building.id}
                  building={merged}
                  buildingState={buildingStateMap.get(building.id)}
                  isActive={activeSection === building.sectionId}
                  onRequestEnter={
                    isWalkMode || editing ? noopRequestEnter : onRequestEnter
                  }
                  edit={
                    editing
                      ? {
                          editing: true,
                          selected:
                            propsApi.selection?.kind === "building" &&
                            propsApi.selection.id === building.id,
                          rotationY: ov?.rotationY ?? 0,
                          scale: ov?.scale ?? 1,
                          onSelectDown: () => {
                            propsApi.setSelection({
                              kind: "building",
                              id: building.id
                            });
                            propsApi.setDragging(true);
                          }
                        }
                      : undefined
                  }
                />
              );
            })}
          </Suspense>

          <Suspense fallback={null}>
            {autonomousNpcs.map((npc, index) => (
              <NPC
                behavior={npcBehaviorProfiles[npc.id]}
                bubbleText={visibleBubble(npcRuntimeStates[npc.id])}
                buildings={villageBuildings}
                isActive={activeNpcId === npc.id}
                key={npc.id}
                npc={npc}
                baseNpcState={npcStateMap.get(npc.id)}
                runtimeMood={npcRuntimeStates[npc.id]?.mood}
                runtimeMemory={npcRuntimeStates[npc.id]?.memory}
                currentAction={npcRuntimeStates[npc.id]?.currentAction}
                onPositionChange={onNpcPositionChange}
                onSelect={onSelectNpc}
                facePoint={npcRuntimeStates[npc.id]?.facePoint}
                holdUntil={npcRuntimeStates[npc.id]?.holdUntil}
                emote={visibleEmote(npcRuntimeStates[npc.id])}
                socialTarget={npcSocialTargets?.[npc.id]}
                scriptedTarget={
                  npc.id === "guide-npc"
                    ? guideScriptedTarget
                    : npc.id === "overseer-npc"
                    ? overseerTarget
                    : undefined
                }
                scriptedStart={
                  npc.id === "guide-npc" ? GUIDE_SCRIPTED_START : undefined
                }
                onScriptedArrive={
                  npc.id === "guide-npc" ? onGuideArrive : undefined
                }
                forceHold={npc.id === "guide-npc" ? guideForceHold : undefined}
                command={npcCommand}
                commandTarget={npcCommandTargets?.[npc.id]}
                commandSlot={index}
                commandTotal={autonomousNpcs.length}
              />
            ))}
          </Suspense>

          {/* 나무·바위는 propsLayout.json 의 decor 프롭으로 옮겼다 (scripts/generate-decor-layout.mjs).
              예전엔 여기서 네온 콘과 검은 다면체를 절차적으로 그렸는데, 마을이 따뜻한
              스타일로 바뀌면서 혼자 사이버펑크로 남아 겉돌았다. 자리는 constants.ts 의
              treePositions / rockPositions 를 그대로 쓴다. */}

          {/* 모바일 전용 대체 그림자.
              데스크톱은 이제 진짜 섀도맵이 돌아가므로 이걸 같이 깔면 광장 주변만
              두 번 어두워진다. 모바일은 섀도맵을 끄기 때문에 이 한 장이라도 있어야
              건물이 잔디에 붙어 보인다.
              길 타일 윗면(y=0.02)과 같은 높이면 z-파이팅이 나므로 살짝 위로. */}
          {isMobile ? (
            <ContactShadows
              blur={1.5}
              far={12}
              frames={1}
              opacity={0.15}
              position={[0, 0.035, 2]}
              scale={26}
            />
          ) : null}

          <SeasonAmbience lite={isMobile} />

          {/* ─── 빛 번짐 ────────────────────────────────────────────────────
              컨셉 아트에서 눈을 잡아끄는 건 형태가 아니라 **빛이 번지는 것**이다.
              창문·랜턴·간판 하나하나가 뽀얗게 퍼지면서 노을 하늘과 섞인다.
              @react-three/postprocessing 은 진작 package.json 에 있었는데
              마을 씬에서는 한 번도 안 쓰고 있었다(옛 habitat 씬에만 걸려 있었다).

              문턱을 0.72 로 잡은 이유: 낮에 잔디·판석이 0.6~0.7 언저리라
              그보다 낮추면 마을 전체가 뿌옇게 날아간다. 실제로 빛나는 것
              (창문 emissive · 태양 원반 · 물 반사)만 걸리게 한다.
              모바일은 끈다 — 풀스크린 패스가 두 번 더 도는 비용이 크다. */}
          {isMobile ? null : (
            // EffectComposer 의 children 타입은 Element | Element[] 라 null 도 주석
            // 슬롯(undefined)도 못 낀다. 그래서 조건부 패스는 JSX 안에서 삼항으로
            // 넣지 말고 여기처럼 배열로 만들어 넘긴다.
            <EffectComposer enableNormalPass={false}>
              {[
                // ─── 접촉면 그늘 (앰비언트 오클루전) ──────────────────────────
                // 그림자를 드리우는 광원이 태양 하나뿐이라, 태양이 안 닿는 곳은
                // 전부 채움광으로 균일하게 밝았다. 담장 안쪽 구석·나무 밑동·
                // 건물이 지면과 만나는 자리에 그늘이 없으니, 소품이 땅에 **놓인**
                // 게 아니라 얹혀 보였다.
                //
                // N8AO 는 깊이 버퍼에서 법선을 복원하므로 노멀 패스가 필요 없다
                // (enableNormalPass 는 false 그대로 둔다).
                //
                // ─── 순서 ─────────────────────────────────────────────────
                // Bloom 보다 **앞**이다. AO 로 먼저 어둡게 깎은 뒤에 남은 밝은
                // 것만 번져야 한다. 뒤에 두면 이미 번진 빛을 도로 깎아
                // 창문·랜턴 주변이 지저분해진다.
                //
                // ─── halfRes ──────────────────────────────────────────────
                // AO 는 저주파(넓고 부드러운) 성분이라 절반 해상도로 만들어
                // 깊이 기준으로 늘려도 눈에 거의 티가 안 난다. 성능이 부족하면
                // quality 를 내리기 전에 이걸 먼저 확인할 것.
                //
                // ─── aoRadius ─────────────────────────────────────────────
                // 월드 단위다. 마을이 40유닛 폭이고 배럴·랜턴 같은 소품이
                // 0.5~1유닛이라 1.2 가 접촉면만 먹는 크기다. 키우면 그늘이
                // 넓게 퍼져 지면이 얼룩덜룩 때 탄 것처럼 보인다.
                ...(AO_ENABLED
                  ? [
                      <N8AO
                        key="ao"
                        color={sky.aoColor}
                        intensity={sky.aoI}
                        aoRadius={1.2}
                        distanceFalloff={1}
                        quality="medium"
                        halfRes
                        depthAwareUpsampling
                      />
                    ]
                  : []),
                <Bloom
                  key="bloom"
                  mipmapBlur
                  intensity={0.55 + sky.lamp * 0.5}
                  luminanceThreshold={0.72}
                  luminanceSmoothing={0.22}
                  radius={0.72}
                />,
                // 이게 없으면 마을이 통째로 칙칙해진다. EffectComposer 가 끼면
                // WebGLRenderer 의 톤매핑 단계를 건너뛰고 컴포저가 직접 화면에
                // 내보내기 때문 — 처음엔 이걸 빼먹어서 노을 하늘이 흙빛
                // 판때기가 됐다. 렌더러에 걸어 둔 ACES + 노출 0.68 을 여기서
                // 똑같이 재현한다.
                <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
                // ─── 색보정 ────────────────────────────────────────────────
                // **반드시 톤매핑 뒤다.** 앞에 두면 아직 1을 넘는 HDR 값이라
                // 표 범위를 벗어난 밝은 부분이 통째로 잘려 하늘이 판때기가 된다.
                //
                // tetrahedralInterpolation: 32칸짜리 표를 부드럽게 잇는다.
                // 안 켜면 밤하늘처럼 완만한 그라데이션에서 칸 경계가 띠로
                // 보인다(밴딩). 표를 64로 키우는 것보다 이게 싸다.
                ...(gradeLut
                  ? [<LUT key="lut" lut={gradeLut} tetrahedralInterpolation />]
                  : [])
              ]}
            </EffectComposer>
          )}

          {isWalkMode ? (
            <CharacterController />
          ) : (
            <CameraController
              activeSection={activeSection}
              isIntro={isIntro}
              lockRotate={editing}
              cinematic={cinematic}
            />
          )}
        </Suspense>
      </Canvas>

      {isWalkMode ? (
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-xl border border-[#00d4ff]/30 bg-[#050d1a]/85 px-4 py-2.5 backdrop-blur-md">
          {[
            ["W", "앞"],
            ["A", "왼쪽"],
            ["S", "뒤"],
            ["D", "오른쪽"]
          ].map(([key, label]) => (
            <span className="flex flex-col items-center gap-0.5" key={key}>
              <kbd className="rounded border border-[#00d4ff]/50 bg-[#0a1a30] px-2 py-0.5 font-mono text-xs font-black text-[#00d4ff]">
                {key}
              </kbd>
              <span className="font-mono text-[10px] text-[#0066aa]">
                {label}
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-[#00d4ff]/25 bg-[#050d1a]/85 px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/70 backdrop-blur-md">
          {sky.label === "밤"
            ? "🌙"
            : sky.label === "새벽"
            ? "🌅"
            : sky.label === "노을"
            ? "🌇"
            : "☀️"}{" "}
          {sky.label}
        </div>
      )}

      <PropsEditorTray api={propsApi} />
      <PerfHudPanel />
    </div>
  );
}

// 무관한 부모(AIPortfolioVillage) 리렌더에서 자체 .map() 재구성(건물 28개 + NPC 전체)을 스킵.
// npcRuntimeStates/villageState 등 실제 입력이 바뀔 때는 평소처럼 다시 렌더된다.
export const VillageScene = memo(VillageSceneImpl);

function visibleBubble(runtime?: NpcRuntimeState) {
  if (!runtime?.bubbleText || !runtime.bubbleExpiresAt) return undefined;
  return runtime.bubbleExpiresAt > Date.now() ? runtime.bubbleText : undefined;
}

function visibleEmote(runtime?: NpcRuntimeState) {
  if (!runtime?.emote || !runtime.emoteExpiresAt) return undefined;
  return runtime.emoteExpiresAt > Date.now() ? runtime.emote : undefined;
}
