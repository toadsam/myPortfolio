"use client";

import {Canvas, useFrame} from "@react-three/fiber";
import {AdaptiveDpr, AdaptiveEvents, Billboard, ContactShadows, Html, useGLTF, useTexture} from "@react-three/drei";
import {Bloom, EffectComposer, ToneMapping} from "@react-three/postprocessing";
import {ToneMappingMode} from "postprocessing";
import {memo, Suspense, useEffect, useMemo, useRef} from "react";
import {AdditiveBlending, BackSide, BufferGeometry, Color, Float32BufferAttribute, type Mesh, RepeatWrapping, SphereGeometry, SRGBColorSpace, Vector3} from "three";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {createThrottledCalculatePosition, LABEL_SYNC_STRIDE} from "@/lib/htmlLabelThrottle";
import {spread, villageBuildings} from "@/lib/constants";
import {VILLAGE_PALETTE} from "@/lib/villagePalette";
import {makeCloudTexture} from "@/lib/skyClouds";
import {makeBankTexture} from "@/lib/terraceBank";
import {PLATEAU_PAD, TERRACE_RECTS, TERRACE_STEP, terrainHeightAt, WATER_CHANNELS} from "@/lib/villageTerrain";
import buildingModels from "@/data/buildingModels.json";
import {buildBuildingStateMap, buildNpcStateMap} from "@/lib/liveState";
import type {NpcRuntimeState, VillageState} from "@/types/live";
import type {ExplorationMode, NPCData, SectionId, Vector3Tuple} from "@/types/portfolio";
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
  cinematic?: {position: [number, number, number]; lookAt: [number, number, number]} | null;
  npcCommand?: NpcCommand | null;
  npcCommandTargets?: Record<string, Vector3Tuple>;
  overseerTarget?: Vector3Tuple | null;
  onEditingChange?: (editing: boolean) => void;
  npcSocialTargets?: Record<string, Vector3Tuple>;
}

// 네트워크 펄스로 연결할 프로젝트 건물들 (한 번만 계산)
const projectNetworkBuildings = villageBuildings.filter((b) => b.district === "projects");

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
// ISLAND_RADIUS 는 마을 밖 프롭까지 다 품어야 한다 — 숲 띠 끝이 중심에서 37.4다.
const ISLAND_CENTER: [number, number, number] = [0, 0, 3];
const ISLAND_RADIUS = 40;
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

  // polygonOffset — 길 타일이 잔디에 파묻히는 걸 막는다.
  // 타일 윗면은 잔디보다 겨우 몇 cm 위인데, 이 거대한 바닥과 깊이값이 사실상 같아서
  // 조금만 멀어지면 잔디가 이겨버려 길이 통째로 사라졌다.
  // 잔디만 깊이 방향으로 뒤로 밀어두면 여유가 얼마든 항상 타일이 이긴다.
  //
  // 사각 평면이 아니라 원반이다 — 섬의 윗면이니까. 절벽(IslandCliff)이 정확히
  // 같은 반지름에서 시작해 이어받는다.
  return (
    <mesh position={ISLAND_CENTER} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[ISLAND_RADIUS, 128]} />
      <meshStandardMaterial
        map={map}
        color={GRASS_TINT}
        roughness={0.95}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={2}
        polygonOffsetUnits={4}
      />
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

    const rim = new Color("#5f8a3f");   // 잔디와 만나는 윗단
    const rock = new Color("#8a7a63");  // 볕 드는 바위
    const deep = new Color("#43382f");  // 물에 잠기는 아래쪽
    const mixed = new Color();

    for (let ri = 0; ri <= CLIFF_RINGS; ri++) {
      const t = ri / CLIFF_RINGS;
      for (let ai = 0; ai <= CLIFF_SEGMENTS; ai++) {
        const angle = (Math.PI * 2 * ai) / CLIFF_SEGMENTS;
        // 바깥으로 나갈수록 튀어나온 곶과 들어간 만이 생긴다
        const jut = 3.2 + 2.6 * Math.sin(angle * 3 + 0.9) + 1.6 * Math.sin(angle * 7 + 2.1);
        const radius = ISLAND_RADIUS + t * Math.max(1.2, jut);
        // t^1.5 — 위쪽은 완만하게 시작해 아래로 갈수록 가팔라진다(벼랑 느낌)
        const y = -CLIFF_DROP * Math.pow(t, 1.5);
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        mixed.copy(t < 0.18 ? rim : rock).lerp(deep, Math.min(1, Math.max(0, (t - 0.18) / 0.82)));
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
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  );
}

// ─── 물 ──────────────────────────────────────────────────────────────────────
// 셰이더 없이 평면 한 장. 삼각형 2개에 draw call 1회다.
// 파도를 넣고 싶어질 텐데, 카메라가 늘 섬 위에 있어서 수면은 늘 멀리 비스듬히
// 보인다 — 그 각도에선 잔물결이 거의 안 읽히고 fog가 대부분 먹는다.
// roughness 를 낮춰 하늘빛을 받는 것만으로 충분히 물처럼 보인다.
function Water() {
  return (
    <mesh position={[ISLAND_CENTER[0], WATER_Y, ISLAND_CENTER[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[240, 64]} />
      <meshStandardMaterial color="#2d6a86" roughness={0.22} metalness={0.25} />
    </mesh>
  );
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
const MOAT = {cx: 0, cz: 1, a: 27, b: 21.7};
const MOAT_HALF = 1.1;   // 반폭. 다리(5유닛 span)가 넉넉히 걸친다.
// 1.5 로 뒀더니 마을 안 물길과 겹치는 데서 두 리본이 화살표처럼 뭉쳐 보였다.
const MOAT_STEPS = 132;  // 한 바퀴를 몇 조각으로

function Waterways() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const shallow = new Color("#63c7c4"); // 가장자리 — 자갈이 비치는 여울
    const deep = new Color("#2f8fa6");    // 한가운데

    /**
     * 폴리라인 하나를 물 리본으로 만든다. 한 마디마다 정점 셋(왼·오른·가운데)이라
     * 가운데 줄에 짙은 색을 넣어 물에 두께가 있는 것처럼 보인다.
     * @param taper 끝을 가늘게 할지 — 해자는 닫힌 고리라 안 하고, 물길은 한다
     */
    const ribbon = (
      pts: {x: number; z: number}[],
      halfAt: (t: number) => number,
      taper: boolean
    ) => {
      const base = positions.length / 3;
      for (let i = 0; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        const tx = next.x - prev.x;
        const tz = next.z - prev.z;
        const tl = Math.hypot(tx, tz) || 1;
        // 진행 방향의 법선
        const ux = -tz / tl;
        const uz = tx / tl;
        const fade = taper ? Math.min(1, Math.min(t, 1 - t) * 8) : 1;
        const half = halfAt(t) * fade;
        for (const side of [-1, 1]) {
          positions.push(pts[i].x + ux * half * side, 0, pts[i].z + uz * half * side);
          colors.push(shallow.r, shallow.g, shallow.b);
        }
        positions.push(pts[i].x, 0, pts[i].z);
        colors.push(deep.r, deep.g, deep.b);
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = base + i * 3;
        const b = base + (i + 1) * 3;
        indices.push(a, a + 2, b, b, a + 2, b + 2);
        indices.push(a + 2, a + 1, b + 2, b + 2, a + 1, b + 1);
      }
    };

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
    ribbon(moat, (t) => MOAT_HALF * (0.82 + 0.3 * Math.sin(t * Math.PI * 10 + 1.9)), false);

    // ② 구역 사이 골짜기를 흐르는 물길 — 단이 양옆에 서 있어 파인 것처럼 보인다.
    //    광장 쪽 끝은 가늘게, 해자에 닿는 바깥쪽은 넓게.
    for (const channel of WATER_CHANNELS) {
      // 안쪽은 가늘고 바깥으로 갈수록 넓어진다 — 물이 흘러 내려가는 방향이 읽힌다.
      // 0.55~1.3 은 너무 굵어 잔디 위에 붙인 색종이처럼 보였다.
      ribbon(channel, (t) => 0.5 + t * 0.45, true);
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0.05, 0]}>
      {/* 호수(Water)와 같은 재질감 — 하늘빛을 받아야 물로 보인다.
          다만 해자·개울은 얕으므로 조금 밝고 덜 반사한다. */}
      <meshStandardMaterial vertexColors roughness={0.3} metalness={0.2} />
    </mesh>
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
      const d = Math.hypot(profile[i][0] - profile[i - 1][0], profile[i][1] - profile[i - 1][1]);
      vAt.push(vAt[i - 1] + d / TERRACE_STEP);
    }

    for (const r of TERRACE_RECTS) {
      const x0 = r.x0 - PLATEAU_PAD, x1 = r.x1 + PLATEAU_PAD;
      const z0 = r.z0 - PLATEAU_PAD, z1 = r.z1 + PLATEAU_PAD;

      /** 바깥으로 o 만큼 물린 네 귀퉁이. 모서리는 두 변의 법선을 더한 대각선이라
          변끼리 어긋나지 않고 맞물린다. */
      const corners = (o: number): [number, number][] => [
        [x0 - o, z0 - o], [x1 + o, z0 - o], [x1 + o, z1 + o], [x0 - o, z1 + o]
      ];

      // u 는 둘레를 따라간 거리 / 격자 한 칸 — 어느 벽에서나 돌 한 장 크기가 같다.
      // 물린 거리를 빼고 원래 변 길이로 재야 마디마다 줄눈이 세로로 딱 맞는다.
      const sideLen = [x1 - x0, z1 - z0, x1 - x0, z1 - z0];

      for (let i = 0; i + 1 < profile.length; i++) {
        const A = corners(profile[i][0]);
        const B = corners(profile[i + 1][0]);
        const yA = profile[i][1], yB = profile[i + 1][1];
        const vA = vAt[i], vB = vAt[i + 1];

        for (let s = 0; s < 4; s++) {
          const e = (s + 1) % 4;
          const u1 = sideLen[s] / 1.88;
          const base = positions.length / 3;
          // 시작 귀퉁이의 A·B, 끝 귀퉁이의 A·B 순. 이 순서가 곧 면의 앞뒤다 —
          // 수직 마디는 A 가 아래라 바깥을 보고, 수평 마디는 A 가 바깥이면
          // 위를, 안쪽이면 아래를 본다. profile 을 그 규칙에 맞춰 적어 뒀다.
          positions.push(A[s][0], yA, A[s][1]); uvs.push(0, vA);
          positions.push(B[s][0], yB, B[s][1]); uvs.push(0, vB);
          positions.push(A[e][0], yA, A[e][1]); uvs.push(u1, vA);
          positions.push(B[e][0], yB, B[e][1]); uvs.push(u1, vB);
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
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
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
  const layer = 1 + 0.6 * Math.max(0, (radius - HILL_INNER - 34) / 40) * (1.4 + Math.sin(angle * 4 + 1.1));
  return WATER_Y - 4 + ramp * Math.max(2, ridge) * layer;
}

function DistantHills() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // 능선이 높을수록 밝은 녹색, 골짜기는 어두운 침엽수 색. 정점 색이라 공짜다.
    const low = new Color("#3f6b39");
    const high = new Color("#7fa958");
    const mixed = new Color();

    for (let ri = 0; ri <= HILL_RINGS; ri++) {
      const radius = HILL_INNER + ((HILL_OUTER - HILL_INNER) * ri) / HILL_RINGS;
      for (let ai = 0; ai <= HILL_SEGMENTS; ai++) {
        const angle = (Math.PI * 2 * ai) / HILL_SEGMENTS;
        const y = hillHeight(radius, angle);
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        mixed.copy(low).lerp(high, Math.min(1, Math.max(0, (y - WATER_Y) / 22)));
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
      <meshBasicMaterial vertexColors side={BackSide} depthWrite={false} fog={false} toneMapped={false} />
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
function CloudLayer({light, dark, cover}: {light: string; dark: string; cover: number}) {
  const ref = useRef<Mesh>(null);
  const texture = useMemo(() => (cover > 0 ? makeCloudTexture(light, dark, cover) : null), [light, dark, cover]);
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
function SunDisc({direction, radius, color}: {direction: [number, number, number]; radius: number; color: string}) {
  const position = useMemo(() => {
    const v = new Vector3(...direction).normalize().multiplyScalar(SKY_RADIUS * 0.94);
    return v;
  }, [direction]);
  return (
    <Billboard position={position} renderOrder={-1}>
      <mesh>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color={color} depthWrite={false} fog={false} toneMapped={false} />
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
const DISTRICT_BANNERS: {district: string; label: string; ribbon: string; ink: string}[] = [
  {district: "projects", label: "PROJECTS", ribbon: "#8a4a2e", ink: "#ffe2a8"},
  {district: "skills", label: "SKILLS", ribbon: "#2f5d4a", ink: "#ffe2a8"},
  {district: "experience", label: "EXPERIENCE", ribbon: "#4a3b6b", ink: "#ffe2a8"},
  {district: "study", label: "STUDY", ribbon: "#2c4a6b", ink: "#ffe2a8"},
  {district: "life", label: "LIFE", ribbon: "#6b5423", ink: "#ffe2a8"},
  {district: "contact", label: "CONTACT", ribbon: "#7a2f2f", ink: "#ffe2a8"}
];

/** 구역별 건물 무게중심 — 현판을 그 위에 띄운다 */
const DISTRICT_CENTERS: Record<string, {x: number; z: number; top: number}> = (() => {
  const acc: Record<string, {x: number; z: number; n: number; top: number}> = {};
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
    Object.entries(acc).map(([k, v]) => [k, {x: v.x / v.n, z: v.z / v.n, top: v.top}])
  );
})();

function DistrictBanner({label, ribbon, ink, at}: {
  label: string;
  ribbon: string;
  ink: string;
  at: {x: number; z: number; top: number};
}) {
  const calculatePosition = useMemo(() => createThrottledCalculatePosition(LABEL_SYNC_STRIDE), []);
  const plate = useRef<HTMLDivElement>(null);
  const here = useMemo(() => new Vector3(at.x, at.top + 1.8, at.z), [at]);
  // 화면 고정 크기라 코앞에서도 안 줄어든다 — 걸어 다닐 때 눈앞을 가리지 않게
  // 가까우면 지운다. 멀리 있는 다른 구역 현판은 그대로 남아 길잡이가 된다.
  const tick = useRef(0);
  useFrame(({camera}) => {
    if (!plate.current || (tick.current = (tick.current + 1) % 6) !== 0) return;
    const d = camera.position.distanceTo(here);
    plate.current.style.opacity = String(Math.min(1, Math.max(0, (d - 14) / 10)));
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
      <div ref={plate} style={{
        // 나무 현판 — 가운데가 밝고 위아래가 어두운 원통형 음영
        background: `linear-gradient(180deg, ${ribbon} 0%, ${shade(ribbon, 1.35)} 45%, ${ribbon} 78%, ${shade(ribbon, 0.7)} 100%)`,
        border: "2px solid #c79a4e",
        borderRadius: 6,
        boxShadow: "0 4px 10px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.22)",
        padding: "3px 12px",
        whiteSpace: "nowrap"
      }}>
        <span style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: ink,
          textShadow: "0 1px 0 rgba(0,0,0,0.6)"
        }}>
          {label}
        </span>
      </div>
    </Html>
  );
}

/** #rrggbb 를 배수만큼 밝게/어둡게 */
function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.max(0, Math.min(255, Math.round(c * factor)))
  );
  return `rgb(${ch.join(",")})`;
}

function ActiveRoute({activeSection}: {activeSection: SectionId}) {
  const building = villageBuildings.find((b) => b.sectionId === activeSection && b.district !== "plaza");

  if (!building || activeSection === "intro") {
    return (
      <group>
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.66, 64]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.22} />
        </mesh>
        <pointLight color="#00d4ff" intensity={0.5} distance={4} decay={2} position={[0, 0.4, 0]} />
      </group>
    );
  }

  const [x, , z] = building.position;
  const dist = Math.sqrt(x * x + z * z);
  const angle = Math.atan2(z, x);

  return (
    <group>
      {/* 길 타일 윗면이 y=0.02라, 예전 높이(0.014/0.015)에 그리면 길 밑에 깔려 안 보인다 */}
      <mesh position={[x / 2, 0.05 + terrainHeightAt(x / 2, z / 2), z / 2]} rotation={[-Math.PI / 2, 0, angle]}>
        <planeGeometry args={[dist, 0.07]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.3} />
      </mesh>
      <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.3, 48]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.28} />
      </mesh>
      <pointLight color={building.accentColor} intensity={0.6} distance={4} decay={2} position={[x, 0.6, z]} />
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
            <meshStandardMaterial color="#26364a" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, 0.72, 0]}>
            <boxGeometry args={[0.28, 0.72, 0.18]} />
            <meshStandardMaterial color="#7ed957" emissive="#7ed957" emissiveIntensity={0.18} />
          </mesh>
          <pointLight color="#7ed957" intensity={0.8} distance={3} decay={2} position={[0, 1.1, 0]} />
        </group>
      ) : null}

      {unlocked.has("lab-beacon") ? (
        <group position={[-4.2, 0, -3.4]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 12]} />
            <meshStandardMaterial color="#0a1a2e" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.16, 18, 18]} />
            <meshBasicMaterial color="#00d4ff" />
          </mesh>
          <pointLight color="#00d4ff" intensity={1.5} distance={5} decay={2} position={[0, 1.2, 0]} />
        </group>
      ) : null}

      {unlocked.has("study-fountain") ? (
        <group position={[2.2, 0, -2.1]}>
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.48, 32]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function VillageSceneImpl({
  activeSection, activeNpcId, explorationMode, isIntro = false,
  onSelectNpc, onRequestEnter, npcRuntimeStates, onNpcPositionChange, villageState,
  guideScriptedTarget, onGuideArrive, guideForceHold, cinematic,
  npcCommand, npcCommandTargets, overseerTarget, onEditingChange, npcSocialTargets
}: VillageSceneProps) {
  const isWalkMode = explorationMode === "walk";
  const propsApi = usePropsEditor();
  const editing = propsApi.enabled && propsApi.editMode;
  const sky = VILLAGE_PALETTE;
  // 모바일 라이트 모드 — 해상도/안티앨리어싱을 낮춰 성능·배터리 확보
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
    []
  );
  // villageState는 30초 주기로만 바뀌므로, npcRuntimeStates가 바뀌는 2~3초마다
  // 매번 Array.find로 선형 탐색하지 않도록 Map을 villageState가 바뀔 때만 새로 만든다.
  const buildingStateMap = useMemo(() => buildBuildingStateMap(villageState), [villageState]);
  const npcStateMap = useMemo(() => buildNpcStateMap(villageState), [villageState]);

  // 편집 모드일 때 부모가 자동 갱신(순찰·잡담·폴링)을 멈추도록 알린다.
  // (편집 중 잦은 리렌더 + 후처리 아웃라인이 R3F 재조정 루프를 유발하는 문제 방지)
  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative h-[48vh] min-h-[390px] overflow-hidden border-y border-[#00d4ff]/15 bg-[#050d1a] shadow-[inset_0_-30px_70px_rgba(0,100,255,0.1)] md:h-screen md:min-h-[720px] md:border-y-0 md:border-r"
      onDragOver={editing ? (e) => e.preventDefault() : undefined}
      onDrop={editing ? (e) => {
        const glb = e.dataTransfer.getData("application/x-prop-glb");
        if (glb) {
          e.preventDefault();
          propsApi.setPendingDrop({glb, clientX: e.clientX, clientY: e.clientY});
        }
      } : undefined}
    >
      <Canvas
        camera={{fov: 40, position: [4, 14, 16]}}
        dpr={isMobile ? [1, 1] : [1, 1.25]}
        performance={{min: isMobile ? 0.4 : 0.5}}
        // toneMappingExposure — 마을 전체 밝기의 유일한 손잡이. 자세한 이유는
        // timePalette 주석 참고(요약: 1.0에서는 잔디가 ACES 어깨에 붙어 그림자가 눌린다).
        gl={{antialias: !isMobile, powerPreference: "high-performance", toneMappingExposure: 0.68}}
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
        <directionalLight
          color={sky.sun}
          intensity={sky.sunI}
          position={sky.sunPos}
          castShadow
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
        <directionalLight color={sky.fill} intensity={sky.fillI} position={[-6, 12, -4]} />
        <hemisphereLight args={[sky.hSky, sky.hGround, sky.hI]} />

        {/* 구역마다 살짝 다른 색감을 주는 보조광. 원래는 네온(청록/보라/연두/주황)이라
            잔디 위에서 색이 튀어서, 노을 톤 안에서 온도만 다른 따뜻한 색으로 낮췄다.
            sky.lamp 로 시간대에 따라 세기를 바꾼다 — 낮엔 햇빛에 묻히도록 죽이고
            밤엔 이것만 남아 창문·가로등 주변이 주황으로 뜬다. */}
        <pointLight color="#ffd9a8" intensity={1.2 * sky.lamp} distance={22} decay={2} position={[-5, 5, 0]} />
        <pointLight color="#e8c4ff" intensity={0.9 * sky.lamp} distance={20} decay={2} position={[3, 5, -5]} />
        <pointLight color="#d8f0b0" intensity={0.9 * sky.lamp} distance={20} decay={2} position={[6, 5, 5]} />
        <pointLight color="#ffbe86" intensity={0.9 * sky.lamp} distance={16} decay={2} position={[0, 4, 9]} />

        <Suspense fallback={null}>
          <SkyDome horizon={sky.skyHorizon} top={sky.skyTop} />
          <CloudLayer light={sky.cloudLight} dark={sky.cloudDark} cover={sky.cloudCover} />
          <SunDisc direction={sky.sunPos} radius={sky.discRadius} color={sky.discColor} />
          <Ground />
          <IslandCliff />
          <Water />
          <Waterways />
          <TerraceBanks />
          <DistantHills />
          {PLAZA_LANDMARK_READY ? null : <Statue />}

          {/* 예전엔 네온 팻말 넷을 좌표로 박아 뒀는데, 구역을 컨셉 아트 방위로
              다시 배치하면서 넷 다 엉뚱한 자리에 남아 허공에 뜬 색판이 됐다.
              이제 건물 무게중심에서 계산하므로 배치를 옮겨도 따라온다. */}
          {DISTRICT_BANNERS.map((b) =>
            DISTRICT_CENTERS[b.district] ? (
              <DistrictBanner key={b.district} label={b.label} ribbon={b.ribbon} ink={b.ink} at={DISTRICT_CENTERS[b.district]} />
            ) : null
          )}

          {!isWalkMode && <ActiveRoute activeSection={activeSection} />}
          <BuildingNetwork buildings={projectNetworkBuildings} />
          <LiveDecorations villageState={villageState} />
          <PropsLayer api={propsApi} />

          {villageBuildings.map((building) => {
            const ov = propsApi.buildingOverrides[building.id];
            const merged = ov?.position ? {...building, position: ov.position} : building;
            return (
              <Building
                key={building.id}
                building={merged}
                buildingState={buildingStateMap.get(building.id)}
                isActive={activeSection === building.sectionId}
                onRequestEnter={isWalkMode || editing ? noopRequestEnter : onRequestEnter}
                edit={editing ? {
                  editing: true,
                  selected: propsApi.selection?.kind === "building" && propsApi.selection.id === building.id,
                  rotationY: ov?.rotationY ?? 0,
                  scale: ov?.scale ?? 1,
                  onSelectDown: () => {
                    propsApi.setSelection({kind: "building", id: building.id});
                    propsApi.setDragging(true);
                  },
                } : undefined}
              />
            );
          })}

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
              scriptedTarget={npc.id === "guide-npc" ? guideScriptedTarget : npc.id === "overseer-npc" ? overseerTarget : undefined}
              scriptedStart={npc.id === "guide-npc" ? GUIDE_SCRIPTED_START : undefined}
              onScriptedArrive={npc.id === "guide-npc" ? onGuideArrive : undefined}
              forceHold={npc.id === "guide-npc" ? guideForceHold : undefined}
              command={npcCommand}
              commandTarget={npcCommandTargets?.[npc.id]}
              commandSlot={index}
              commandTotal={autonomousNpcs.length}
            />
          ))}

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
            <ContactShadows blur={1.5} far={12} frames={1} opacity={0.15} position={[0, 0.035, 2]} scale={26} />
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
            <EffectComposer enableNormalPass={false}>
              <Bloom
                mipmapBlur
                intensity={0.55 + sky.lamp * 0.5}
                luminanceThreshold={0.72}
                luminanceSmoothing={0.22}
                radius={0.72}
              />
              {/* 이게 없으면 마을이 통째로 칙칙해진다. EffectComposer 가 끼면
                  WebGLRenderer 의 톤매핑 단계를 건너뛰고 컴포저가 직접 화면에
                  내보내기 때문 — 처음엔 이걸 빼먹어서 노을 하늘이 흙빛
                  판때기가 됐다. 렌더러에 걸어 둔 ACES + 노출 0.68 을 여기서
                  똑같이 재현한다. */}
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          )}

          {isWalkMode
            ? <CharacterController />
            : <CameraController activeSection={activeSection} isIntro={isIntro} lockRotate={editing} cinematic={cinematic} />
          }
        </Suspense>
      </Canvas>

      {isWalkMode ? (
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-xl border border-[#00d4ff]/30 bg-[#050d1a]/85 px-4 py-2.5 backdrop-blur-md">
          {[["W", "앞"], ["A", "왼쪽"], ["S", "뒤"], ["D", "오른쪽"]].map(([key, label]) => (
            <span className="flex flex-col items-center gap-0.5" key={key}>
              <kbd className="rounded border border-[#00d4ff]/50 bg-[#0a1a30] px-2 py-0.5 font-mono text-xs font-black text-[#00d4ff]">{key}</kbd>
              <span className="font-mono text-[10px] text-[#0066aa]">{label}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-[#00d4ff]/25 bg-[#050d1a]/85 px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/70 backdrop-blur-md">
          {sky.label === "밤" ? "🌙" : sky.label === "새벽" ? "🌅" : sky.label === "노을" ? "🌇" : "☀️"} {sky.label}
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
