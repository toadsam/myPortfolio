// 마을 바닥(길·광장·앞마당·잔디)을 만들어 src/data/propsLayout.json 의 ground 프롭을 갱신한다.
//
// 사용법: node scripts/generate-ground-layout.mjs [--dry] [--v1] [--v2=i0,j0,i1,j1]
//
//   기본       길 전체를 새 타일 세트(ground/v2)로 깐다.
//   --v1       예전 세트(ground/*)로 되돌린다.
//   --v2=사각형 그 격자 사각형 안만 새 것으로 — 두 세트를 나란히 놓고 비교할 때.
//
// ─── 왜 손으로 안 찍고 생성하나 ──────────────────────────────────────────────
// 길 타일은 "어느 방향으로 이어지는가"에 따라 직선/곡선/T/교차를 골라야 하고,
// 방향이 하나만 틀려도 길이 끊겨 보인다. 100장이 넘는 걸 프롭 편집기에서 손으로
// 맞추는 건 비현실적이라, 격자 위에 간선(TRUNKS)만 그리고 나머지는 계산한다.
//
// ─── 설계 ────────────────────────────────────────────────────────────────────
// 바닥을 세 겹으로 나눠 6종을 전부 쓴다.
//   ① 중앙 광장   plaza-tile 을 키워 한 장            — 마을의 중심
//   ② 건물 앞마당 건물마다 plaza-tile 원반 한 장       — 건물이 잔디에 떠 있지 않게
//   ③ 길          straight/curve/t/cross 자동 선택    — 앞마당끼리 잇는다
//   ④ 화단       grass-patch 를 앞마당 둘레에        — 건물을 두르는 꽃밭
//
// 길은 손으로 다 그리지 않는다. 마을을 가로지르는 간선(TRUNKS)만 정하고,
// 건물마다 "가장 가까운 빈 칸"에서 기존 도로망까지 BFS로 최단 지선을 이어붙인 뒤,
// 아무데도 안 닿고 풀밭에서 끊기는 토막은 다시 깎아낸다.
// 그래서 건물이 늘거나 좌표가 바뀌어도 길이 끊기지 않고, 갈 곳 없는 길도 안 남는다.
//
// 프롭 편집기에서 손으로 옮긴 결과와 섞이지 않도록, id가 "ground-"로 시작하는
// 프롭만 지우고 다시 쓴다. 다른 프롭은 그대로 둔다.

import {readFileSync, writeFileSync} from "node:fs";
import {
  readVillage,
  readMoat,
  districtBlocks,
  readWaterHalf
} from "./lib/read-village.mjs";

// 물 치수는 앱(villageTerrain.ts)이 가진다 — 씬이 그리는 폭과 여기가 비워 두는
// 폭이 다르면 길 타일이 물을 덮거나 프롭이 물에 발을 담근다.
const WATER = readWaterHalf();

const LAYOUT = "src/data/propsLayout.json";
const dry = process.argv.includes("--dry");

// 새 타일이 덮을 격자 사각형. null이면 전부 예전 타일, 범위를 안 주면 마을 전체.
const v2Arg = process.argv.find(a => a.startsWith("--v2="));
const V2_RECT = (() => {
  if (process.argv.includes("--v1")) return null;
  if (!v2Arg) return {i0: -Infinity, i1: Infinity, j0: -Infinity, j1: Infinity};
  const raw = v2Arg.split("=")[1];
  const [a, b, c, d] = raw.split(",").map(Number);
  if ([a, b, c, d].some(v => !Number.isFinite(v)))
    throw new Error(`--v2 값은 i0,j0,i1,j1 형식이어야 합니다: ${raw}`);
  return {
    i0: Math.min(a, c),
    i1: Math.max(a, c),
    j0: Math.min(b, d),
    j1: Math.max(b, d)
  };
})();
const inV2 = (i, j) =>
  V2_RECT !== null &&
  i >= V2_RECT.i0 &&
  i <= V2_RECT.i1 &&
  j >= V2_RECT.j0 &&
  j <= V2_RECT.j1;

// ─── 타일 사양 ────────────────────────────────────────────────────────────────
// PITCH: 타일 실측 폭이 1.895~1.899라 1.88 간격으로 깔면 미세하게 겹쳐 틈이 안 생긴다.
const PITCH = 1.88;
const HALF = PITCH / 2;

// 타일 윗면을 잔디(y=0)보다 얼마나 띄울지.
// 예전엔 0.02였는데, 그 정도로는 90유닛짜리 잔디 평면과 깊이값이 사실상 같아서
// 조금만 멀어지면 잔디가 이겨 길이 통째로 사라졌다. VillageScene 쪽 잔디에
// polygonOffset을 걸어 근본 해결했고, 여기서도 여유를 넉넉히 준다.
const TOP_Y = 0.06;

// 각 GLB의 로컬 윗면 높이 — 종류마다 달라서, 그대로 y=0에 두면 타일끼리 턱이 생긴다.
// 윗면을 전부 TOP_Y로 맞추기 위한 보정값으로 쓴다.
const TILE = {
  straight: {
    glb: "/models/props/ground/path-straight.glb",
    top: 0.12,
    tris: 4936
  },
  curve: {glb: "/models/props/ground/path-curve.glb", top: 0.094, tris: 5192},
  t: {glb: "/models/props/ground/path-t.glb", top: 0.112, tris: 6386},
  cross: {glb: "/models/props/ground/path-cross.glb", top: 0.092, tris: 7210},
  plaza: {glb: "/models/props/ground/plaza-tile.glb", top: 0.083, tris: 6151},
  grass: {glb: "/models/props/ground/grass-patch.glb", top: 0.1, tris: 4418}
};

// ─── 새 타일 세트 (--v2) ──────────────────────────────────────────────────────
// 기존 세트는 길 폭이 종류마다 제각각이라(직선 0.96 / 교차 0.62 / T 0.47~0.67)
// 이어붙이면 폭이 확 꺾여 길이 끊겨 보였다. 새 세트는 전부 0.55~0.69로 고르다.
//
// top 은 여기서 의미가 다르다. 기존 표의 값은 bbox 꼭대기(=잔디 잎 끝)라
// 그걸 맞추면 정작 포장면은 타일마다 다른 높이에 놓인다. 새 세트는 **포장면**
// 높이를 적어 두고 그걸 TOP_Y에 맞춘다 — 눈이 따라가는 건 길이지 잔디가 아니다.
//
// 교차로가 두 장(cross / cross-b) 들어왔다. 무늬가 조금 다른 cross-b 는
// 지금은 안 쓰고 예비로 둔다.
//
// 2026-08-09: 타일을 평면으로 구워 바꿨다 (scripts/flatten-ground-tiles.mjs).
// Meshy 타일은 장당 1만 삼각형인데 요철 높이가 타일 폭의 1~3%뿐이라 마을
// 카메라에서는 안 보이고, simplify는 UV 심에 막혀 4,853에서 바닥을 친다
// (오차를 0.02→0.15로 올려도 그대로). 그래서 위에서 구운 그림을 평면에 입혔다.
// 길 68 + 앞마당 27 + 풀숲 29 장에서 634k가 사라진다.
//
// 평면이라 top 은 전부 0이다 — 맞출 요철이 없으니 이음매가 완벽히 붙는다.
const V2_DIR = "/models/props/ground-flat/v2";
const V2_TILE = {
  straight: {glb: `${V2_DIR}/path-straight.glb`, top: 0, tris: 2},
  curve: {glb: `${V2_DIR}/path-curve.glb`, top: 0, tris: 2},
  t: {glb: `${V2_DIR}/path-t.glb`, top: 0, tris: 2},
  cross: {glb: `${V2_DIR}/path-cross.glb`, top: 0, tris: 2},
  plaza: {glb: "/models/props/ground-flat/plaza-tile.glb", top: 0, tris: 32},
  grass: {glb: `${V2_DIR}/grass-patch.glb`, top: 0, tris: 2}
};

// ─── 포장 위에 까는 길 타일 ──────────────────────────────────────────────────
// 위 타일들은 "잔디밭 위의 흙길"이라 양옆에 밝은 초록 갓길이 붙어 있다. 구역
// 바닥을 판석으로 덮고 나서 그대로 얹었더니 돌마당 위에 **초록 격자**가 떠올랐다 —
// 부감으로 보면 잔디밭에 길을 낸 꼴이라, 포장을 깐 의미가 절반쯤 사라졌다.
// scripts/make_paved_road_tiles.py 가 그 갓길만 판석 색으로 바꿔 구운 변종이다.
// 지오메트리·회전은 v2 와 똑같고 텍스처만 다르다.
const PAVED_DIR = "/models/props/ground-flat/paved";
const PAVED_TILE = {
  ...V2_TILE,
  straight: {glb: `${PAVED_DIR}/path-straight.glb`, top: 0, tris: 2},
  curve: {glb: `${PAVED_DIR}/path-curve.glb`, top: 0, tris: 2},
  t: {glb: `${PAVED_DIR}/path-t.glb`, top: 0, tris: 2},
  cross: {glb: `${PAVED_DIR}/path-cross.glb`, top: 0, tris: 2}
};

// plaza-tile 은 정사각 슬래브가 아니라 실제 원반이다 (정점의 0%만 내접원 밖).
// scale 1 일 때 반지름이 이만큼이라, 앞마당 크기를 반지름으로 계산할 수 있다.
const PLAZA_RADIUS_AT_1 = 0.95;

// ─── 각 GLB의 로컬 방향 (텍스처를 XZ로 래스터화해 실측한 값) ──────────────────
// straight : 포장이 로컬 Z축을 따라 달린다        → 회전 0이면 남북
// t        : 로컬 −Z가 막힌 면, 나머지 3면이 열림 → 회전 0이면 북쪽이 막힘
// curve    : 로컬 −X 와 +Z 를 잇는 1/4 원호       → 회전 0이면 서–남
// cross/plaza : 회전 대칭
//
// 새 세트는 통째로 −90° 돌아가 있다: 직선이 회전 0에서 동–서, 곡선이 남–동.
// 그래서 v2 의 회전표는 v1 에서 90°씩 당긴 값이다.
const QUARTER = Math.PI / 2;
const SETS = {
  v1: {
    tiles: TILE,
    straight: {NS: 0, WE: QUARTER},
    curve: {WS: 0, SE: QUARTER, EN: 2 * QUARTER, NW: 3 * QUARTER},
    t: {N: 0, W: QUARTER, S: 2 * QUARTER, E: 3 * QUARTER}
  },
  v2: {
    tiles: V2_TILE,
    straight: {WE: 0, NS: QUARTER},
    curve: {SE: 0, EN: QUARTER, NW: 2 * QUARTER, WS: 3 * QUARTER},
    // T만은 기존과 같다 — 새 것도 회전 0에서 북쪽이 막혀 있다
    t: {N: 0, W: QUARTER, S: 2 * QUARTER, E: 3 * QUARTER}
  },
  // 포장 위 전용. 텍스처만 다른 v2 라 회전표를 그대로 쓴다.
  paved: {
    tiles: PAVED_TILE,
    straight: {WE: 0, NS: QUARTER},
    curve: {SE: 0, EN: QUARTER, NW: 2 * QUARTER, WS: 3 * QUARTER},
    t: {N: 0, W: QUARTER, S: 2 * QUARTER, E: 3 * QUARTER}
  }
};

// ─── 건물 ─────────────────────────────────────────────────────────────────────
// 좌표와 크기를 여기에 베껴 두면 constants.ts 를 고칠 때마다 두 곳이 어긋난다
// (실제로 건물 크기를 정리하다 앞마당 원반이 통째로 틀어졌다). 원본에서 읽는다.
const {buildings} = readVillage();

// 중앙 광장은 앞마당 대신 큰 광장 한 장을 따로 깐다
const HUB = buildings.find(b => b.id === "central-plaza");
const OUTER = buildings.filter(b => b.id !== "central-plaza");

// 중앙 광장 원반(기념비 발밑)의 배율과 반지름. 단상·앞치마·물 고리가 전부 이걸
// 기준으로 자리를 잡으므로 배치 계산보다 먼저 있어야 한다.
const HUB_SCALE = 5.4;
const HUB_RADIUS = HUB_SCALE * PLAZA_RADIUS_AT_1;

// ─── 격자 유틸 ────────────────────────────────────────────────────────────────
const round3 = v => Math.round(v * 1000) / 1000;
const key = (i, j) => `${i},${j}`;
const parse = k => k.split(",").map(Number);
const worldX = i => i * PITCH;
const worldZ = j => j * PITCH;

// 격자 범위 — 마을 전체를 여유 있게 덮는다.
//
// 예전엔 -12~12 / -9~13 으로 박아 뒀다. 구역을 컨셉 아트 방위로 옮기면서
// projects 블록이 j −13 까지 올라가자 **블록 하나가 통째로 격자 밖**이 됐고,
// 길이 아예 안 깔려 뒷줄 세 채가 도로망에서 떨어져 나갔다.
// 배치는 앞으로도 계속 움직일 값이므로 건물에서 직접 잰다.
const MARGIN = 3;
// 북쪽 참배로가 닿는 칸. 컨셉 아트 맨 위의 "AI Portfolio" 섬으로 가는 길이다 —
// 남쪽 정문 대계단의 짝. 마을 밖 벌판까지 일부러 뻗으므로 격자도 여기까지 넓힌다.
// z = -26.3. 개울이 j −11(z −20.7)에서 이 길을 가로지르고 그 위에 돌다리가 선다.
const NORTH_END = -14;
// 남쪽 참배로. 해자(VillageScene 의 MOAT)를 건너는 남쪽 돌다리까지 길을 이어야
// 다리가 잔디 위에 뚝 떨어져 있지 않다. 북쪽 참배로와 대칭이다.
const SOUTH_END = 12;
const [I_MIN, I_MAX, J_MIN, J_MAX] = (() => {
  let i0 = 0,
    i1 = 0,
    j0 = 0,
    j1 = 0;
  for (const b of buildings) {
    i0 = Math.min(i0, Math.floor((b.x - b.w / 2) / PITCH));
    i1 = Math.max(i1, Math.ceil((b.x + b.w / 2) / PITCH));
    j0 = Math.min(j0, Math.floor((b.z - b.d / 2) / PITCH));
    j1 = Math.max(j1, Math.ceil((b.z + b.d / 2) / PITCH));
  }
  return [
    i0 - MARGIN,
    i1 + MARGIN,
    Math.min(j0 - MARGIN, NORTH_END - 1),
    Math.max(j1 + MARGIN, SOUTH_END + 1)
  ];
})();
const inBounds = (i, j) => i >= I_MIN && i <= I_MAX && j >= J_MIN && j <= J_MAX;

// 건물이 깔고 앉은 칸 — 길이 지나갈 수 없다
const blocked = new Set();
for (let i = I_MIN; i <= I_MAX; i++) {
  for (let j = J_MIN; j <= J_MAX; j++) {
    const x = worldX(i);
    const z = worldZ(j);
    const hit = buildings.some(
      b =>
        Math.abs(b.x - x) < b.w / 2 + HALF && Math.abs(b.z - z) < b.d / 2 + HALF
    );
    if (hit) blocked.add(key(i, j));
  }
}

// ─── ① 간선 ───────────────────────────────────────────────────────────────────
// [시작i, 시작j, 끝i, 끝j] 로 읽는 축 정렬 구간. 건물에 걸리는 칸은 addSegment 가
// 알아서 건너뛰고, 그 자리는 앞마당 원반이 메우므로 길이 끊겨 보이지 않는다.
//
// ─── 왜 손으로 안 적나 ───────────────────────────────────────────────────────
// 예전엔 14개 구간을 좌표로 박아 뒀다. 그런데 그 좌표는 **그때의 건물 배치**에만
// 맞는 값이라, 구역을 옮길 때마다 길이 건물을 관통하거나 허공에 깔렸다.
// 컨셉 아트 방위로 다시 배치하자 14개 중 쓸모 있는 게 두 개도 안 남았다.
//
// 길의 뼈대는 사실 배치에서 그대로 따라 나온다:
//   · 광장에서 사방으로 뻗는 대로 두 개 (남쪽은 정문 진입로)
//   · 구역 블록마다 광장에서 오는 L자 진입로
//   · 블록 안에서 **건물 줄과 줄 사이 빈 칸**을 잇는 골목
// 이 셋을 배치에서 계산하면 건물을 어떻게 옮겨도 길이 따라온다.
const TRUNKS = [
  // 광장에서 뻗는 두 축 — 마을의 등뼈.
  [I_MIN + 1, 0, I_MAX - 1, 0],
  [0, J_MIN + 1, 0, J_MAX - 1]
];

// ─── 광장 둘레 링 도로 ────────────────────────────────────────────────────────
// 컨셉 아트의 길은 격자가 아니라 **광장에서 뻗는 방사선 + 그걸 두르는 고리**다.
// 우리는 축 둘 + L자 진입로뿐이라 완전한 맨해튼 격자로 보였다.
//
// 한동안 정사각 고리(r 4·8)를 놓았다. 네 모서리에 커브가, 축과 만나는 곳에 T 가
// 자동으로 들어가 부감에서 그럭저럭 고리로 읽혔다. 그런데 **정사각형은 모서리가
// 반지름의 1.41배**라, 구역을 같은 고리(DISTRICT_INNER)에 올린 뒤로는 모서리가
// 구역 단 위로 올라타 바깥 고리가 64칸 중 37칸만 남았다 — 반쪽짜리 고리다.
//
// 그래서 원을 격자에 **래스터화**한다. 칸마다 이웃이 직각 두 방향이면 커브가
// 들어가므로, 계단처럼 꺾이는 자리마다 커브가 박히고 나머지는 직선이 된다.
// 모든 칸이 반지름 ±0.5 안에 있어 정사각형과 달리 띠를 벗어나지 않는다.
const RINGS = [8]; // 구역 안을 지나는 옛 정사각 고리 — 살아남은 조각이 구역 내 골목이 된다
for (const r of RINGS) {
  TRUNKS.push(
    [-r, -r, r, -r], // 북
    [-r, r, r, r], // 남
    [-r, -r, -r, r], // 서
    [r, -r, r, r] // 동
  );
}

// ── 그 고리는 이제 **길이 아니라 물**이다 ────────────────────────────────────
// 한동안 여기에 원을 래스터화한 길 타일 고리(r 9.4)를 깔았다. 컨셉 아트를 확대해
// 다시 보니 광장을 두르고 있는 건 포장길이 아니라 **개울**이었다. 구역으로 가려면
// 반드시 다리를 건너야 하고, 그래서 그림에 다리가 그렇게 많다.
// 고리 자체는 아래 PLAZA_RING(물) 이 그리고, 광장 둘레 포장은 그 안쪽 앞치마가
// 맡는다 — 길 타일 고리는 물과 같은 띠를 두고 다투므로 걷어냈다.

// 남쪽 정문 진입 축. 컨셉 아트에서 마을로 들어오는 길은 남쪽 대계단 하나뿐이고,
// 광장까지 일직선으로 뻗는다. 그런데 이 축의 끝은 정의상 막다른 길이라
// 아래 정리 단계가 두 칸씩 갉아먹어 마을 어귀가 사라진다(실제로 j 8·9 가 잘렸다).
// 여기 담긴 칸은 "일부러 벌판으로 뻗은 길"이라 정리에서 뺀다.
// 북쪽 참배로도 같은 이유로 지킨다 — 마을을 지나 개울을 건너 파고다 섬까지 간다.
const CEREMONIAL = new Set();
for (let j = 1; j <= SOUTH_END; j++) CEREMONIAL.add(key(0, j));
for (let j = NORTH_END; j <= -1; j++) CEREMONIAL.add(key(0, j));

// 구역별 블록 상자 (격자 단위, 건물이 실제로 먹는 칸 기준).
// 사각형 계산은 read-village.mjs 의 blockOf 한 곳에만 있다 — 구역 배치 솔버가
// 같은 값으로 골짜기를 재야 하므로 두 벌로 두면 반드시 어긋난다.
const BLOCK_RECT = districtBlocks(OUTER);
const BLOCK_BOX = new Map();
for (const [district, rect] of BLOCK_RECT) {
  BLOCK_BOX.set(district, {
    i0: Math.round((rect.x0 + HALF) / PITCH),
    i1: Math.round((rect.x1 - HALF) / PITCH),
    j0: Math.round((rect.z0 + HALF) / PITCH),
    j1: Math.round((rect.z1 - HALF) / PITCH)
  });
}

// ─── 광장을 두르는 물 고리 ────────────────────────────────────────────────────
// 컨셉 아트를 확대해 보면 물의 뼈대는 이렇다:
//
//   기념비 → 광장 포장 → 잔디 → ★물 고리★ → (다리) → 구역(단 위)
//
// 즉 물은 광장에서 사방으로 **새어 나가는** 게 아니라 광장을 **감싸고**, 넘친
// 물이 구역 사이 골짜기로 빠진다. 그래서 어느 구역에 가든 다리를 하나 건너게 되고,
// 그 다리가 구역의 정문 노릇을 한다. 우리 물길 넷은 전부 r 7.7 에서 시작해 곧게
// 바깥으로 나가기만 해서, 물이 어디서 와서 어디로 가는지가 안 읽혔다.
//
// 반지름은 **구역 단 발치가 허락하는 만큼** 크게 잡는다. 물이 단 발치에 붙어야
// 축대가 물가 옹벽으로 읽히고, 광장이 넉넉해진다.
/** 씬(Waterways)이 이 고리를 그릴 때 쓰는 리본 반폭 */
const PLAZA_RING_HALF = WATER.ring;
/** 물 가장자리와 단 발치 사이에 남길 풀 여유 */
const PLAZA_RING_MARGIN = 0.5;
// 구역이 멀리 물러난 방향(북·남 참배로 쪽은 아예 구역이 없다)에서 고리가 한없이
// 퍼지지 않게 씌우는 뚜껑. 이 값이 사실상 고리의 반지름이다.
const PLAZA_RING_CAP = 9.6;
const PLAZA_RING = (() => {
  const rects = [...BLOCK_RECT.values()];
  // villageTerrain 의 PLATEAU_PAD 와 같은 값 — 단이 실제로 솟는 범위는 사각형보다
  // 이만큼 넓다. 사각형만 보고 물을 놓으면 물가가 축대 밑으로 파고든다.
  const PAD = HALF;
  /** 단 발치까지 남은 거리 — 사각형 **바깥에서 잰 실거리**다 */
  const footGap = (x, z) => {
    let best = Infinity;
    for (const b of rects) {
      const dx = Math.max(b.x0 - PAD - x, 0, x - (b.x1 + PAD));
      const dz = Math.max(b.z0 - PAD - z, 0, z - (b.z1 + PAD));
      best = Math.min(best, Math.hypot(dx, dz));
    }
    return best;
  };

  // ─── 왜 "광선이 처음 닿는 거리"로 재면 안 되나 ──────────────────────────────
  // 처음엔 각도마다 바깥으로 쏘아 단에 닿는 반지름을 구하고 거기서 1.12 를 뺐다.
  // 단 모서리를 **스치듯 지나가는 방향**에서는 반지름을 1.12 줄여도 사각형과의
  // 수직 거리는 거의 안 늘어난다 — 그래서 두 마디가 축대 밑에 남았다.
  // 실거리로 재면 각도와 무관하게 물가가 항상 그만큼 떨어진다.
  const NEED = PLAZA_RING_HALF + PLAZA_RING_MARGIN;
  const STEPS = 240;
  const limit = [];
  for (let s = 0; s < STEPS; s++) {
    const a = (s / STEPS) * Math.PI * 2;
    const c = Math.cos(a);
    const si = Math.sin(a);
    let r = PLAZA_RING_CAP;
    while (r > 3 && footGap(c * r, si * r) < NEED) r -= 0.05;
    limit.push(r);
  }

  // 그대로 쓰면 SKILLS 블록 모서리가 파고든 구간(318~342°)에서 고리가 각지게
  // 꺾인다. 한 바퀴를 둥글게 평활한 뒤 다시 한계로 눌러, 꺾이지 않으면서도
  // 단을 침범하지 않는 곡선을 만든다.
  const smooth = src => {
    const W = 12; // ±18°
    return src.map((_, i) => {
      let sum = 0;
      let wsum = 0;
      for (let k = -W; k <= W; k++) {
        const w = 1 - Math.abs(k) / (W + 1);
        sum += src[(i + k + STEPS * 2) % STEPS] * w;
        wsum += w;
      }
      return sum / wsum;
    });
  };
  let r = limit;
  for (let pass = 0; pass < 3; pass++)
    r = smooth(r).map((v, i) => Math.min(v, limit[i]));

  return r.map((rr, i) => {
    const a = (i / STEPS) * Math.PI * 2;
    return {x: round3(Math.cos(a) * rr), z: round3(Math.sin(a) * rr)};
  });
})();
/** 닫힌 폴리라인(240마디)에서 그 각도의 반지름을 읽는다 */
const radiusOn = (line, ang) => {
  const t = ((ang / (Math.PI * 2)) % 1 || 0) * line.length;
  const i = ((Math.floor(t) % line.length) + line.length) % line.length;
  return Math.hypot(line[i].x, line[i].z);
};
/** 고리가 그 방향에서 지나는 반지름 — 포장·물길이 물을 피하는 데 쓴다 */
const plazaRingRadius = ang => radiusOn(PLAZA_RING, ang);

// ─── 광장 단상 ────────────────────────────────────────────────────────────────
// 컨셉 아트의 광장은 계단 몇 단 올라선 **단상**이다. 우리 마을은 구역 여섯만
// 단(+1.1) 위에 있고 광장은 잔디·물과 같은 평면이라, 단면으로 보면 마을이
// **가운데가 파인 그릇**이고 기념비가 그 바닥에 서 있었다 — 컨셉과 정반대다.
//
// **구역과 같은 높이(1.1)로 올리면 안 된다.** 그러면 물길 골짜기 말고는 마을
// 전체가 다시 한 평면이 되어, 구역을 떼어 놓기 전의 "층이 하나도 안 느껴진다"로
// 되돌아간다. 컨셉은 세 단이다: 물·잔디(0) → 광장(중간) → 구역(1.1).
//
// 사각형이 아니라 **각도별 반지름**으로 정의한다. 광장 포장은 사각형이 아니고
// (대로 네 개가 축 방향 칸을 먹고, SKILLS 단 모서리가 한쪽을 파고든다) 사각형
// 단을 깔면 네 모서리가 잔디로 튀어나오고 대로가 계단 대신 벽을 만난다.
// 내보내는 선은 **꼭대기 테두리**다. 축대는 거기서 바깥으로 DAIS_WALL_RUN 만큼
// 내려가 지면에 닿는다. 그 발치가 물에 잠기면 안 되므로, 테두리 자리는
// "물가에서 축대 길이 + 여유만큼 안쪽"이 상한이다.
/** 축대가 지면까지 내려오는 데 필요한 수평 거리 */
const DAIS_WALL_RUN = 0.5;
/** 축대 발치와 물가 사이에 남길 풀 여유 */
const DAIS_WATER_GAP = 0.2;
/** 물 고리가 멀리 물러난 방향에서 단상이 같이 퍼지지 않게 씌우는 뚜껑 */
const DAIS_MAX = 8.2;
const PLAZA_DAIS = (() => {
  const raw = PLAZA_RING.map(p => {
    const ring = Math.hypot(p.x, p.z);
    // 물가(고리 중심 − 반폭)에서 축대 길이와 여유를 뺀 자리가 상한
    const room = ring - PLAZA_RING_HALF - DAIS_WATER_GAP - DAIS_WALL_RUN;
    // 기념비 원반보다는 커야 단상이지 발판이 아니다. 다만 물가를 넘지는 않는다 —
    // SKILLS 단 모서리가 파고든 방향(330°)은 원반과 물 사이가 0.6 밖에 없어서
    // 둘 중 하나는 포기해야 하고, 물에 잠기는 쪽이 훨씬 나쁘다.
    return Math.min(DAIS_MAX, Math.max(HUB_RADIUS + 0.4, room), room);
  });
  // 물 고리가 꺾이는 자리에서 단상까지 각지지 않게 한 바퀴 평활한다
  const N = raw.length;
  const W = 10;
  const smoothed = raw.map((_, i) => {
    let sum = 0;
    let wsum = 0;
    for (let k = -W; k <= W; k++) {
      const w = 1 - Math.abs(k) / (W + 1);
      sum += raw[(i + k + N * 2) % N] * w;
      wsum += w;
    }
    return sum / wsum;
  });
  return smoothed.map((r, i) => {
    const a = (i / N) * Math.PI * 2;
    const rr = Math.min(r, raw[i]); // 평활 뒤에도 물가를 넘지 않게 다시 누른다
    return {x: round3(Math.cos(a) * rr), z: round3(Math.sin(a) * rr)};
  });
})();
const plazaDaisRadius = ang => radiusOn(PLAZA_DAIS, ang);

for (const box of BLOCK_BOX.values()) {
  const ci = Math.round((box.i0 + box.i1) / 2);
  const cj = Math.round((box.j0 + box.j1) / 2);

  // ⓐ 광장 → 블록 L자 진입로. 먼 축을 먼저 달리고 꺾어야 길이 광장 앞에서
  //    부챗살처럼 퍼지지 않고, 대로에 한 번 붙었다가 갈라진다.
  if (Math.abs(ci) >= Math.abs(cj)) {
    TRUNKS.push([0, 0, ci, 0], [ci, 0, ci, cj]);
  } else {
    TRUNKS.push([0, 0, 0, cj], [0, cj, ci, cj]);
  }

  // ⓑ 줄과 줄 사이 골목 — 블록 폭 전체가 비어 있는 줄만 고른다.
  //    한 칸이라도 건물이 걸리면 안 깐다(길이 건물을 뚫고 지나가는 걸 막는다).
  const [ei0, ei1, ej0, ej1] = [box.i0 - 1, box.i1 + 1, box.j0 - 1, box.j1 + 1];

  // 건물 줄이 늘어선 축으로만 깐다. 처음엔 가로·세로 양쪽을 다 깔았더니
  // 길 타일이 123 → 303장으로 늘면서 T자 169개짜리 **격자**가 됐다 —
  // 골목이 난 마을이 아니라 잔디에 그은 바둑판이었다.
  // 블록이 가로로 넓으면 줄도 가로이고, 골목은 줄 사이(같은 j)에 난다.
  const wide = box.i1 - box.i0 >= box.j1 - box.j0;
  const spanFree = fixed => {
    if (wide) {
      for (let i = ei0; i <= ei1; i++)
        if (blocked.has(key(i, fixed))) return false;
    } else {
      for (let j = ej0; j <= ej1; j++)
        if (blocked.has(key(fixed, j))) return false;
    }
    return true;
  };
  // 광장 반대쪽 바깥 변은 뺀다 — 블록 뒤편은 아무 데도 안 가는 길이다
  const far = wide ? (cj < 0 ? ej0 : ej1) : ci < 0 ? ei0 : ei1;
  const [lo, hi] = wide ? [ej0, ej1] : [ei0, ei1];
  // 빈 줄을 전부 깔면 골목 두 개가 나란히 붙어 **두 칸 폭 대로**가 된다.
  // 실제로 블록 가장자리 줄과 그 바로 옆 줄이 함께 깔려, 위에서 보면 길이
  // 아니라 포장된 벌판이었다. 그래서 사이를 띄운다 — 그 사이엔 집이 선다.
  //
  // 간격 2 로 뒀더니 골목 중심 사이가 3.76 유닛인데 골목 폭이 1.88 이라,
  // **블록의 절반이 길**이었다(구역 단 넓이의 34%). 블록 안을 잔디로 되돌리고
  // 부감으로 보니 그 격자가 마을이 아니라 텃밭 두렁으로 보였다. 3 이면 골목
  // 사이가 5.64 라 집 한 채가 들어가고, 길 비율이 3분의 1로 떨어진다.
  const ALLEY_GAP = 3;

  // **lastLaid 만으로는 모자란다.** 그건 골목끼리의 간격만 보는데, 이 블록에는
  // 이미 광장 축과 고리 도로(RINGS 4·8)가 지나간다. 그래서 고리 바로 옆 줄에
  // 골목이 깔려 **길 두 줄 사이에 아무것도 없는 잔디 띠**가 남았다 —
  // STUDY 블록에서 j = 4·6·8 이 그렇게 나란히 깔렸다(부감 캡처로 확인).
  // 이 블록을 실제로 지나가는 간선만 골라 같은 간격을 적용한다.
  const blockers = [];
  for (const [a0, b0, a1, b1] of TRUNKS) {
    if (wide) {
      if (b0 !== b1) continue; // 가로선만
      if (Math.max(a0, a1) < ei0 || Math.min(a0, a1) > ei1) continue; // 이 블록을 안 지난다
      blockers.push(b0);
    } else {
      if (a0 !== a1) continue; // 세로선만
      if (Math.max(b0, b1) < ej0 || Math.min(b0, b1) > ej1) continue;
      blockers.push(a0);
    }
  }

  let lastLaid = -Infinity;
  for (let n = lo; n <= hi; n++) {
    if (n === far || !spanFree(n) || n - lastLaid < ALLEY_GAP) continue;
    if (blockers.some(t => Math.abs(t - n) < ALLEY_GAP)) continue;
    TRUNKS.push(wide ? [ei0, n, ei1, n] : [n, ej0, n, ej1]);
    lastLaid = n;
  }
}

const road = new Set();
function addSegment(i0, j0, i1, j1) {
  if (i0 !== i1 && j0 !== j1)
    throw new Error(
      `대각선 구간은 지원하지 않습니다: ${i0},${j0} → ${i1},${j1}`
    );
  const steps = Math.max(Math.abs(i1 - i0), Math.abs(j1 - j0));
  const di = Math.sign(i1 - i0);
  const dj = Math.sign(j1 - j0);
  for (let s = 0; s <= steps; s++) {
    const i = i0 + di * s;
    const j = j0 + dj * s;
    if (inBounds(i, j) && !blocked.has(key(i, j))) road.add(key(i, j));
  }
}
for (const [i0, j0, i1, j1] of TRUNKS) addSegment(i0, j0, i1, j1);


// ─── ② 건물마다 도로망까지 최단 지선을 잇는다 ────────────────────────────────
// 손으로 노선을 다 그리면 건물 하나가 늘 때마다 길이 끊긴다. 대신 건물에서
// 출발해 이미 깔린 길에 닿을 때까지 BFS로 최단 경로를 찾아 붙인다.
const NEIGHBORS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0]
];

function connect(building) {
  // 건물에 인접한 빈 칸들이 출발점 (여러 개를 동시에 BFS 시작점으로 넣는다)
  const starts = [];
  const ci = Math.round(building.x / PITCH);
  const cj = Math.round(building.z / PITCH);
  for (let i = ci - 2; i <= ci + 2; i++) {
    for (let j = cj - 2; j <= cj + 2; j++) {
      if (!inBounds(i, j) || blocked.has(key(i, j))) continue;
      const dx = worldX(i) - building.x;
      const dz = worldZ(j) - building.z;
      // 건물 외곽에서 한 칸 정도 떨어진 고리만
      if (
        Math.hypot(dx, dz) >
        Math.max(building.w, building.d) / 2 + PITCH * 1.6
      )
        continue;
      starts.push(key(i, j));
    }
  }
  if (starts.length === 0) return {ok: false, added: 0};
  // 이미 길에 닿아 있으면 할 일 없음
  if (starts.some(k => road.has(k))) return {ok: true, added: 0};

  // BFS — 이미 깔린 길에 처음 닿는 지점까지
  const prev = new Map();
  const queue = [];
  for (const s of starts) {
    prev.set(s, null);
    queue.push(s);
  }
  let hit = null;
  for (let head = 0; head < queue.length && !hit; head++) {
    const cur = queue[head];
    const [i, j] = parse(cur);
    for (const [di, dj] of NEIGHBORS) {
      const ni = i + di;
      const nj = j + dj;
      const nk = key(ni, nj);
      if (!inBounds(ni, nj) || blocked.has(nk) || prev.has(nk)) continue;
      prev.set(nk, cur);
      if (road.has(nk)) {
        hit = nk;
        break;
      }
      queue.push(nk);
    }
  }
  if (!hit) return {ok: false, added: 0};

  let added = 0;
  for (let k = hit; k !== null && k !== undefined; k = prev.get(k)) {
    if (!road.has(k)) added++;
    road.add(k);
  }
  return {ok: true, added};
}

// 광장에서 가까운 건물부터 이어야 지선이 짧고 자연스럽게 뻗는다
const byDistance = [...OUTER].sort(
  (a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)
);
const unreachable = [];
for (const b of byDistance) {
  const r = connect(b);
  if (!r.ok) unreachable.push(b.id);
}

// ─── ③ 앞마당 원반 ────────────────────────────────────────────────────────────
// 건물마다 원반을 하나 깔아, 건물이 잔디 위에 덩그러니 떠 있지 않게 한다.
// 나중에 벤치·가로등 같은 장식을 놓을 자리이기도 하다.
//
// ─── 왜 0.77 을 곱하나 ───────────────────────────────────────────────────────
// 컨셉 아트에는 **원이 하나도 없다.** 건물이 연속된 포장이나 잔디 위에 그냥 서
// 있다. 우리는 건물마다 똑같은 살구색 원반이 깔려서, 마을이 아니라 보드게임 판
// 위의 말처럼 보였다 — 27개가 전부 같은 크기·같은 색이라 더 그랬다.
//
// Building.tsx 는 모델의 **바닥 대각선**을 이 원반 지름에 맞춘다. 즉 원반이
// 건물보다 41% 넓고, 그 여백이 통째로 드러나 있었다. 0.77 을 곱하면 원반이
// 건물 옆구리보다 살짝만 나오는 **앞치마**가 되고 네 모서리는 잔디로 넘친다.
// 배율 계약은 Building.tsx 가 자기 식(max(w,d)/2 + 0.55)으로 따로 계산하므로
// 여기를 줄여도 건물 크기는 변하지 않는다.
const FORECOURT_DRAW = 0.77;

const forecourts = OUTER.map(b => {
  const radius = (Math.max(b.w, b.d) / 2 + 0.55) * FORECOURT_DRAW;
  return {
    b,
    radius,
    scale: Math.round((radius / PLAZA_RADIUS_AT_1) * 1000) / 1000
  };
});

// 원반에 먹히는 길 칸은 뺀다. 겹쳐 두면 두 타일이 깊이 싸움을 벌여 지글거린다.
// 길은 원반 가장자리에서 끊기고, 그 자리를 원반이 대신 메운다.
let swallowed = 0;
for (const k of [...road]) {
  const [i, j] = parse(k);
  const x = worldX(i);
  const z = worldZ(j);
  const covered = forecourts.some(
    f => Math.hypot(f.b.x - x, f.b.z - z) < f.radius + HALF * 0.6
  );
  if (covered) {
    road.delete(k);
    swallowed++;
  }
}
// 중앙 광장도 마찬가지.
//
// 반지름을 3.23에서 4.6까지 키웠다. 예전 크기로는 원반이 삼킨 칸 바깥의
// 첫 길 칸이 x=±5.64에 있어서, 원반 가장자리와 길 끝 사이에 1.5유닛짜리
// 맨잔디가 남았다 — 대로가 광장에 닿지 못하고 허공에서 끊겼다.
// 이제 원반이 그 길 끝(안쪽 모서리 4.70)까지 차오른다.
// 기념비를 키우면서(constants.ts 의 central-plaza size) 광장 바닥도 같이 넓혔다.
// 컨셉 아트의 광장은 원반 하나가 아니라 사방으로 퍼지는 큰 돌마당이다.
for (const k of [...road]) {
  const [i, j] = parse(k);
  if (
    Math.hypot(worldX(i) - HUB.x, worldZ(j) - HUB.z) <
    HUB_RADIUS + HALF * 0.6
  ) {
    road.delete(k);
    swallowed++;
  }
}

// 원반(앞마당·중앙광장)에 닿는 칸인가 — 여기서 길이 끝나는 건 자연스럽다.
//
// 여유를 PITCH * 1.6 이나 주는 이유: 원반이 삼킨 칸 바로 바깥에 남은 칸은
// 격자가 원과 안 맞아떨어져 원 가장자리에서 최대 한 칸 반까지 떨어질 수 있다.
// 이 여유가 좁으면 그 칸이 "아무데도 안 닿는 막다른 길"로 판정돼 잘려나가고,
// 잘린 자리가 다시 막다른 길이 되어 대로가 통째로 사라진다(실제로 그랬다).
const TOUCH_MARGIN = PITCH * 1.6;
const discs = [
  ...forecourts.map(f => ({x: f.b.x, z: f.b.z, r: f.radius})),
  {x: HUB.x, z: HUB.z, r: HUB_RADIUS}
];
function touchesDisc(i, j) {
  const x = worldX(i);
  const z = worldZ(j);
  return discs.some(d => Math.hypot(d.x - x, d.z - z) < d.r + TOUCH_MARGIN);
}

// ─── 막다른 길 정리 ───────────────────────────────────────────────────────────
// BFS 지선과 간선 끝단은 풀밭 한가운데서 뚝 끊긴 토막을 남긴다.
// 다만 "더 깎을 게 없을 때까지" 돌리면 안 된다. 간선도 끝은 막다른 길이라,
// 끝에서부터 다음 교차로까지 통째로 먹혀 구역 하나가 통째로 사라진다(실제로 그랬다).
// 끝단을 이만큼만 다듬는다 — 1~2칸짜리 지저분한 토막은 지우고 간선은 남는다.
const PRUNE_PASSES = 2;
let pruned = 0;
for (let pass = 0; pass < PRUNE_PASSES; pass++) {
  const dead = [...road].filter(k => {
    const [i, j] = parse(k);
    if (CEREMONIAL.has(k) || touchesDisc(i, j)) return false;
    const n = NEIGHBORS.filter(([di, dj]) =>
      road.has(key(i + di, j + dj))
    ).length;
    return n <= 1;
  });
  if (dead.length === 0) break;
  for (const k of dead) road.delete(k);
  pruned += dead.length;
}

// ─── 구역 단차(테라스) 데이터 ─────────────────────────────────────────────────
// 컨셉 아트의 마을은 평지가 아니라 계단식이다 — 광장이 제일 낮고 구역마다 한 단
// 올라앉아 있어서, 부감에서 여섯 덩어리가 그림자로도 갈린다.
//
// **높이를 propsLayout.json 에 굽지 않는다.** 여기서는 "어디가 한 단 높은가"만
// 사각형으로 내보내고, 실제 y 는 앱이 `src/lib/villageTerrain.ts` 로 렌더할 때
// 더한다. 그래야 STEP 하나만 0 으로 바꾸면 예전 평지로 정확히 되돌아간다.
//
// 범위는 **블록 상자 그대로**다. 예전엔 판석을 여기서 한 칸 더 넓게(±1) 깔아
// 단 둘레에 지면 높이 판석을 한 줄 남겼는데, 블록 포장을 걷어낸 뒤로는 단 위도
// 아래도 잔디라 그럴 이유가 없어졌다.
// ±1 로 잡았더니 여섯 구역이 서로 맞붙어 광장만 우물처럼 파인 도넛이 됐다.
{
  const blocks = [];
  for (const [district, box] of BLOCK_BOX) {
    const i0 = box.i0,
      i1 = box.i1,
      j0 = box.j0,
      j1 = box.j1;
    blocks.push({
      district,
      // 칸 중심 격자이므로 바깥 테두리는 반 칸 더 나간다
      x0: round3(worldX(i0) - HALF),
      x1: round3(worldX(i1) + HALF),
      z0: round3(worldZ(j0) - HALF),
      z1: round3(worldZ(j1) + HALF)
    });
  }
  // ─── 구역 사이 골짜기를 따라 흐르는 물길 ────────────────────────────────────
  // 컨셉 아트에서 물은 마을 **안**을, 구역 덩어리 사이를 지난다. 처음엔 마을을
  // 두르는 해자만 놨는데 반지름이 27이라 숲에 완전히 가려, 기본 카메라에서 물이
  // 아예 안 보였다 — "물이 있는 느낌이 하나도 안 든다"는 게 그래서였다.
  //
  // 구역을 바깥으로 밀어(DISTRICT_PUSH) 사이에 바닥 높이 골짜기가 생겼으므로
  // 이제 그 틈으로 흘린다. 단이 양옆에 서 있어서 물이 **파인 것처럼** 보인다.
  //
  // 좌표를 여기서 계산해 terraces.json 에 같이 내보낸다 — 씬(Waterways)과
  // 장식물 생성기(다리·숲 제외)가 반드시 같은 값을 읽어야 한다.
  const channels = [];
  {
    // 이미 깔린 길 칸 — 물길이 길 위를 **따라 달리면** 안 된다(가로지르는 건 된다).
    //
    // 예전엔 이미 만들어 둔 길 타일 프롭에서 좌표를 뽑았다. 그래서 이 절이 타일을
    // 다 찍은 **뒤에** 있어야 했고, 그 순서 때문에 "물이 지나는 칸의 길 타일을
    // 빼는" 일을 할 수가 없었다(이미 찍힌 걸 되돌려야 하니까).
    // road 집합은 그 타일들과 같은 칸이므로 여기서 바로 읽으면 순서가 풀린다.
    const roadAt = [...road].map(k => {
      const [i, j] = parse(k);
      return {x: worldX(i), z: worldZ(j)};
    });
    const roadGap = (x, z) => {
      let best = Infinity;
      for (const r of roadAt)
        best = Math.min(best, Math.hypot(r.x - x, r.z - z));
      return best;
    };

    const angles = blocks
      .map(b => Math.atan2((b.z0 + b.z1) / 2, (b.x0 + b.x1) / 2))
      .sort((x, y) => x - y);

    const onPlateau = (x, z) =>
      blocks.some(
        b =>
          x >= b.x0 - HALF &&
          x <= b.x1 + HALF &&
          z >= b.z0 - HALF &&
          z <= b.z1 + HALF
      );
    const clearOf = (x, z) => {
      let best = Infinity;
      for (const b of blocks) {
        const dx = Math.max(b.x0 - HALF - x, 0, x - (b.x1 + HALF));
        const dz = Math.max(b.z0 - HALF - z, 0, z - (b.z1 + HALF));
        best = Math.min(best, Math.hypot(dx, dz));
      }
      return best;
    };

    const NEED = 0.9; // 물 반폭 + 여유
    const ROAD_KEEP = 1.5; // 길 타일 중심에서 이만큼 안쪽은 "길 위"
    // 이보다 짧게 스치면 **건너는 것** — 다리를 놓는다. 길면 나란히 달린 것으로 본다.
    //
    // 폭 1.88 짜리 길을 수직으로 건너면 roadGap < ROAD_KEEP(1.5) 인 구간이 3.0 쯤
    // 되므로, 2.8 로 두면 **건너기가 나란히 달리기로 오인**된다.
    //
    // 한때 4.5 였다. 광장 둘레에 링 **도로**가 있던 시절, 방사 물길이 그걸 반드시
    // 가로질러야 해서 여유를 크게 줬다. 그 링 도로는 이제 물 고리로 바뀌었고,
    // 4.5 는 물길이 큰길과 4.5 유닛이나 **나란히 달리는 것**을 허용해 동쪽 대로가
    // 통째로 걷혔다(길 타일 셋 연속). 3.4 면 비스듬히 건너는 건 통과하고 나란히
    // 달리는 건 막는다.
    const CROSS_MAX = 3.4;
    const STEP_R = 0.6;
    // 물길은 **광장이 아니라 물 고리에서** 갈라져 나간다. 예전엔 여기가
    // HUB_RADIUS + 2.6 이라 네 줄기가 전부 r 7.7 에서 시작했고, 광장 한복판에서
    // 물이 솟아 사방으로 새는 모양이었다. 이제는 고리에 고인 물이 넘쳐
    // 골짜기로 빠지는 모양이 된다 — 시작점이 고리 위에 붙는다.
    const startRadius = ang => plazaRingRadius(ang) - PLAZA_RING_HALF * 0.5;

    // ─── 물길은 **해자까지 가야 한다** ────────────────────────────────────────
    // 예전엔 끝 반지름이 27 로 박혀 있었다. 마을을 키우면서 구역 단이 r≈31 까지
    // 뻗고 해자는 a=40/b=33 으로 나갔는데 여기만 27 로 남아, 물이 해자에
    // 닿기는커녕 **구역 한가운데 벌판에서 뚝 끊겼다**. 6개 골짜기 중 1개만
    // 통과한 것도 이 때문 — 27 까지 가는 길목이 죄다 구역 단에 막혀 있었다.
    //
    // "물이 어디서 와서 어디로 가는지 안 읽힌다"는 게 정확히 이 증상이다.
    // 물은 높은 데(광장)에서 낮은 데(해자)로 흘러 **어딘가로 모여야** 한다.
    // 그래서 끝점을 해자 타원에서 그 각도의 반지름으로 구한다.
    const MOAT = readMoat();
    /** 중심에서 각 ang 방향으로 해자 타원과 만나는 거리 */
    const moatRadiusAt = ang => {
      // (r·cos−cx)²/a² + (r·sin−cz)²/b² = 1 을 r 에 대해 푼다
      const c = Math.cos(ang),
        s = Math.sin(ang);
      const A = (c * c) / (MOAT.a * MOAT.a) + (s * s) / (MOAT.b * MOAT.b);
      const B =
        (-2 * MOAT.cx * c) / (MOAT.a * MOAT.a) +
        (-2 * MOAT.cz * s) / (MOAT.b * MOAT.b);
      const C =
        (MOAT.cx * MOAT.cx) / (MOAT.a * MOAT.a) +
        (MOAT.cz * MOAT.cz) / (MOAT.b * MOAT.b) -
        1;
      const disc = Math.max(0, B * B - 4 * A * C);
      return (-B + Math.sqrt(disc)) / (2 * A);
    };

    for (let k = 0; k < angles.length; k++) {
      let a0 = angles[k];
      let a1 = angles[(k + 1) % angles.length];
      if (a1 <= a0) a1 += Math.PI * 2;

      // 각도를 훑으며 광장 밖 ~ 해자까지 **끝까지 이어지는** 방향을 찾는다.
      //
      // 처음엔 길에서 1.5 떨어지기를 요구했는데, 광장 둘레 링 도로(RINGS)가
      // r 7.5 와 15 에 있어서 물길이 그걸 못 넘고 전부 r 17 바깥에서만 시작했다.
      // 마을 안쪽에 물이 하나도 안 들어와 아무 데서도 안 보였다.
      // 길은 **건너면 된다** — 짧게 스치는 건 허용하고 거기에 다리를 놓는다.
      // 길을 따라 나란히 달리는 것(긴 구간)만 막는다.
      // ── 직선이 아니라 **비켜 가며** 뻗는다 ────────────────────────────────
      // 예전엔 중심에서 뻗은 곧은 직선 하나로만 시도했다. 마을이 커지며 구역 단이
      // 넓어지자 6개 골짜기 중 5개가 r≈7.7 에서 바로 막혀 물길이 하나만 남았다 —
      // 그마저 벌판 한가운데서 끊겨 "어디서 와서 어디로 가는지" 안 읽혔다.
      //
      // 실제 개울은 막히면 돌아간다. 반지름을 한 칸씩 늘려 가며 각도를 조금씩
      // 틀어, 그 자리에서 가장 트인 쪽을 고른다. 곧은 수로가 아니라 굽이치는
      // 개울이 되고, 좁은 틈도 비집고 나간다.
      const ANG_STEP = 0.035; // 한 칸에서 틀 수 있는 최대 각도(rad) ≈ 2°
      const ANG_TRY = [0, 1, -1, 2, -2, 3, -3];

      const why = {막힘: 0, 길나란히: 0, 짧음: 0, 최원: 0};
      /** 한 각도에서 출발해 해자까지 굽이쳐 나가 본다. 실패하면 null. */
      const trace = startAng => {
        let ang = startAng;
        const out = [];
        let onRoadRun = 0;
        let crossings = 0;
        let worst = Infinity;
        const rEnd = () => moatRadiusAt(ang) - 0.6;
        for (let r = startRadius(startAng); r <= rEnd(); r += STEP_R) {
          let pick = null;
          for (const k of ANG_TRY) {
            const a = ang + k * ANG_STEP;
            // 골짜기 밖으로 새어 나가지 않게 원래 부채꼴 안에 묶는다
            if (a < a0 + (a1 - a0) * 0.05 || a > a0 + (a1 - a0) * 0.95)
              continue;
            const x = Math.cos(a) * r,
              z = Math.sin(a) * r;
            if (onPlateau(x, z)) continue;
            const clear = clearOf(x, z);
            if (clear < NEED) continue;
            // **길도 같이 피해야 한다.** 예전엔 구역 단 여유만 보고 골랐더니,
            // 골짜기 한가운데로 길도 같이 지나가는 바람에 물길이 길 위를 따라
            // 나란히 달려 실패했다(6곳 중 5곳이 이 이유였다). 둘 중 더 가까운
            // 쪽을 점수로 삼으면 길과 단 사이의 틈을 알아서 찾아간다.
            const score = Math.min(clear, roadGap(x, z));
            if (!pick || score > pick.score) pick = {a, clear, score, x, z};
          }
          if (!pick) {
            why.막힘++;
            why.최원 = Math.max(why.최원, r);
            return null;
          }
          ang = pick.a;
          if (roadGap(pick.x, pick.z) < ROAD_KEEP) {
            onRoadRun += STEP_R;
            if (onRoadRun > CROSS_MAX) {
              why.길나란히++;
              why.최원 = Math.max(why.최원, r);
              return null;
            } // 길을 따라 나란히 달린다
          } else {
            if (onRoadRun > 0) crossings += 1;
            onRoadRun = 0;
          }
          worst = Math.min(worst, pick.clear);
          out.push({x: pick.x, z: pick.z});
        }
        if (out.length <= 8) {
          why.짧음++;
          return null;
        }
        return {pts: out, worst, crossings};
      };

      let best = null;
      let tried = 0;
      for (let t = 0.12; t <= 0.88; t += 0.02) {
        tried++;
        const got = trace(a0 + (a1 - a0) * t);
        if (!got) continue;
        const score = got.worst - got.crossings * 0.15; // 덜 건너는 쪽을 조금 선호
        if (!best || score > best.score) best = {...got, score};
      }
      if (!best) {
        const deg = ((((a0 + a1) / 2) * 180) / Math.PI).toFixed(0);
        console.log(
          `    골짜기 ${deg}° 물길 실패 — 출발각 ${tried}개 · 막힘 ${
            why.막힘
          } · 길나란히 ${why.길나란히} · 너무짧음 ${
            why.짧음
          } (최원 r=${why.최원.toFixed(1)})`
        );
        continue;
      }

      // 자로 그은 듯한 곡선이면 수로지 개울이 아니다. 진행 방향의 법선으로 흔든다.
      const pts = best.pts.map((p, n, arr) => {
        const t = n / Math.max(1, arr.length - 1);
        const prev = arr[Math.max(0, n - 1)],
          next = arr[Math.min(arr.length - 1, n + 1)];
        const tx = next.x - prev.x,
          tz = next.z - prev.z;
        const tl = Math.hypot(tx, tz) || 1;
        const w =
          Math.sin(t * Math.PI * 2.3) * 0.45 +
          Math.sin(t * Math.PI * 5.1) * 0.16;
        return {
          x: round3(p.x + (-tz / tl) * w),
          z: round3(p.z + (tx / tl) * w)
        };
      });

      // ─── 양 끝을 물에 **담근다** ────────────────────────────────────────────
      // 예전엔 리본 양 끝을 폭 0 으로 가늘게(taper) 그려 끝을 감췄다. 그래서
      // 물길이 고리에서 갈라져 나오는 자리가 바늘 끝이 되어 **안 이어진 것처럼**
      // 보였다. 이제는 끝을 다른 물(안쪽=광장 고리 · 바깥=해자) 속으로 밀어 넣어
      // 겹치게 하고 taper 를 끈다 — 두 물이 실제로 만나는 그림이 된다.
      const dip = (from, to, dist) => {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const l = Math.hypot(dx, dz) || 1;
        return {
          x: round3(to.x + (dx / l) * dist),
          z: round3(to.z + (dz / l) * dist)
        };
      };
      pts.unshift(dip(pts[1], pts[0], 0.8));
      pts.push(dip(pts[pts.length - 2], pts[pts.length - 1], 1.6));

      channels.push(pts);
    }
  }

  /** 길이 물을 건너는 곳 — 여기에 돌다리가 선다 (장식물 생성기가 읽는다) */
  const crossings = [];
  /** 물이 지나가 걷어낸 길 칸 — 다리가 잇는 자리라 **여전히 길이다** */
  const bridgeCells = [];

  // ─── 물이 지나는 칸의 길 타일을 걷어낸다 ──────────────────────────────────────
  // 길 타일은 y 0.060, 수면은 0.050 이다. 딱 1cm 차이로 **길이 물을 덮어** 물이
  // 그 밑으로 사라진다. 문 넷마다 2유닛씩 물이 뚝 끊긴 것처럼 보였고, 그 위에 선
  // 돌다리는 마른 길 위에 놓인 다리가 됐다(고리 241마디 중 29마디가 이 상태였다).
  //
  // y 를 조정해 물을 위로 올리는 방법도 있지만 그건 물이 **길 위로 흐르는** 그림이다.
  // 물이 지나는 자리는 길이 아니라 다리다 — 타일을 빼고 그 자리를 다리가 잇는다.
  {
    const WATER_HALF = Math.max(WATER.ring, WATER.channelOut);
    // **점이 아니라 선분까지의 거리**로 재야 한다. 마디마다 사각형으로 재면
    // (칸 반폭 0.94 를 x·z 양쪽에 적용) 실제로는 1.56 만 겹치면 되는데 대각으로
    // 2.2 까지 걸려, 걷어낸 칸이 37개 = 도로망의 40% 였다.
    const CUT = HALF + WATER_HALF;
    const lines = [...channels, [...PLAZA_RING, PLAZA_RING[0]]];
    const segDist = (x, z, a, b) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const l2 = dx * dx + dz * dz;
      const t = l2 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)) : 0;
      return Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
    };
    const wetCells = new Set();
    for (const k of [...road]) {
      const [i, j] = parse(k);
      const x = worldX(i);
      const z = worldZ(j);
      const wet = lines.some(line => {
        for (let n = 0; n + 1 < line.length; n++)
          if (segDist(x, z, line[n], line[n + 1]) < CUT) return true;
        return false;
      });
      if (wet) {
        road.delete(k);
        wetCells.add(k);
        bridgeCells.push({x: round3(x), z: round3(z)});
      }
    }

    // 건널목 하나가 칸 둘을 먹으므로, 그 사이에 낀 외톨이 한 칸이 남는다 —
    // 이웃이 하나도 없는 포장 조각이라 다리 옆에 떨어진 부스러기로 보인다.
    // 다만 **물가에 닿은 칸은 지키다** — 그게 다리가 내려앉는 자리다.
    const touchesWater = k => {
      const [i, j] = parse(k);
      return NEIGHBORS.some(([di, dj]) => wetCells.has(key(i + di, j + dj)));
    };
    let orphan = 0;
    for (const k of [...road]) {
      const [i, j] = parse(k);
      if (NEIGHBORS.some(([di, dj]) => road.has(key(i + di, j + dj)))) continue;
      if (touchesWater(k)) continue;
      road.delete(k);
      orphan += 1;
    }

    // ─── 건널목을 좌표로 내보낸다 ─────────────────────────────────────────────
    // 예전엔 장식물 생성기가 "물길 마디가 길 타일 위에 있으면 다리를 놓는다"로
    // 스스로 찾았다. 그런데 여기서 그 길 타일을 걷어내 버리므로, 그 규칙으로는
    // **다리가 한 개도 안 선다**(실제로 15개 → 1개가 됐다). 건널목을 아는 건
    // 타일을 걷어낸 이 자리뿐이니, 여기서 정해 terraces.json 에 같이 내보낸다.
    //
    // ─── 걷어낸 칸을 뭉치로 묶으면 안 된다 ────────────────────────────────────
    // 처음엔 걷어낸 칸끼리 가까우면 한 건널목으로 묶었다. 그런데 물길 하나가
    // 큰길과 **나란히** 달리는 구간에서는 칸 대여섯이 한 줄로 걷혀 뭉치 하나가
    // 되고, 바로 옆 물 고리의 건널목까지 같이 삼킨다 — 동쪽 문이 그렇게 사라졌다.
    //
    // 대신 **물줄기마다 따로** 훑는다. 마디를 따라가며 "여기 길이 있었나"를 보고,
    // 이어지는 구간 하나가 건널목 하나다. 그러면 고리의 문과 개울의 건널목이
    // 서로 다른 줄기라 절대 안 섞인다.
    const wasRoad = (x, z) =>
      [...wetCells].some(k => {
        const [i, j] = parse(k);
        return (
          Math.abs(worldX(i) - x) < HALF + 0.3 &&
          Math.abs(worldZ(j) - z) < HALF + 0.3
        );
      });
    for (const line of lines) {
      let run = [];
      const flush = () => {
        if (run.length === 0) return;
        const mid = run[Math.floor(run.length / 2)];
        const prev = line[Math.max(0, mid - 1)];
        const next = line[Math.min(line.length - 1, mid + 1)];
        crossings.push({
          x: round3(line[mid].x),
          z: round3(line[mid].z),
          // 모델의 긴 축(+X)을 물 진행 방향에 맞춘다 — 그래야 물을 **가로지른다**
          angle: round3(Math.atan2(next.z - prev.z, next.x - prev.x))
        });
        run = [];
      };
      for (let n = 0; n < line.length; n++) {
        if (wasRoad(line[n].x, line[n].z)) run.push(n);
        else flush();
      }
      flush();
    }

    // ─── 물길 초입마다 징검다리 하나 ──────────────────────────────────────────
    // 고리 바깥에는 구역 앞까지 이어지는 띠가 한 바퀴 돈다. 그런데 물길 여섯이
    // 그 띠를 여섯 조각으로 자르고, 고리를 건너는 문은 넷뿐이라 **두 조각은
    // 어느 문에서도 못 간다**(설 수 있는 땅의 28% 가 섬이 됐다).
    // 북문으로 나갔다가 동쪽 구역에 가려면 광장으로 되돌아와야 한다는 뜻이다.
    //
    // 물길이 고리에서 갈라지는 자리에 다리를 하나씩 놓으면 띠가 다시 한 바퀴
    // 이어진다. 컨셉 아트에도 이런 자리마다 작은 다리가 있다.
    for (const ch of channels) {
      let at = -1;
      for (let n = 1; n + 1 < ch.length; n++) {
        // 고리 바깥으로 조금 나온 첫 마디 — 여기가 개울의 초입이다
        const r = Math.hypot(ch[n].x, ch[n].z);
        if (r > plazaRingRadius(Math.atan2(ch[n].z, ch[n].x)) + 1.4) {
          at = n;
          break;
        }
      }
      if (at < 0) continue;
      const here = ch[at];
      // 이미 옆에 다리가 있으면 겹쳐 놓지 않는다
      if (crossings.some(c => Math.hypot(c.x - here.x, c.z - here.z) < 3.2))
        continue;
      crossings.push({
        x: round3(here.x),
        z: round3(here.z),
        angle: round3(
          Math.atan2(ch[at + 1].z - ch[at - 1].z, ch[at + 1].x - ch[at - 1].x)
        )
      });
    }

    console.log(
      `  물이 지나가 걷어낸 길 칸: ${wetCells.size}개 · 외톨이 ${orphan}개 정리 · 건널목 ${crossings.length}곳 (여기에 돌다리가 선다)`
    );
  }
  const ringR = PLAZA_RING.map(p => Math.hypot(p.x, p.z));
  const daisR = PLAZA_DAIS.map(p => Math.hypot(p.x, p.z));
  console.log(
    `  광장 물 고리 반지름 ${Math.min(...ringR).toFixed(1)}~${Math.max(
      ...ringR
    ).toFixed(1)}  ·  구역 사이 물길 ${channels.length}줄기`
  );
  console.log(
    `  광장 단상 반지름 ${Math.min(...daisR).toFixed(1)}~${Math.max(
      ...daisR
    ).toFixed(1)}  (기념비 원반 ${HUB_RADIUS.toFixed(1)})`
  );

  if (!dry) {
    writeFileSync(
      "src/data/villageTerraces.json",
      JSON.stringify(
        {
          pitch: PITCH,
          blocks,
          channels,
          plazaRing: PLAZA_RING,
          plazaDais: PLAZA_DAIS,
          crossings,
          bridgeCells
        },
        null,
        2
      ) + "\n"
    );
  }
  console.log(
    `  구역 단차 사각형 ${blocks.length}개 → src/data/villageTerraces.json`
  );
}

// ─── ④ 이웃 연결로 길 타일 종류·회전 결정 ────────────────────────────────────
// 이웃만 보고 "무슨 갈래인지"를 정한다. 어느 GLB를 몇 도 돌려 놓을지는
// 타일 세트마다 다르므로 place() 에서 따로 푼다.
function pick(i, j) {
  const N = road.has(key(i, j - 1));
  const S = road.has(key(i, j + 1));
  const W = road.has(key(i - 1, j));
  const E = road.has(key(i + 1, j));
  const n = [N, S, W, E].filter(Boolean).length;

  if (n === 4) return {kind: "cross"};
  if (n === 3)
    return {kind: "t", blocked: !N ? "N" : !S ? "S" : !W ? "W" : "E"};
  if (n === 2) {
    if (N && S) return {kind: "straight", axis: "NS"};
    if (W && E) return {kind: "straight", axis: "WE"};
    if (W && S) return {kind: "curve", pair: "WS"};
    if (S && E) return {kind: "curve", pair: "SE"};
    if (E && N) return {kind: "curve", pair: "EN"};
    return {kind: "curve", pair: "NW"}; // N && W
  }
  // 막다른 길 — 이어지는 쪽을 향해 직선을 놓는다.
  if (n === 1) return {kind: "straight", axis: N || S ? "NS" : "WE"};
  // 이웃이 하나도 없는 칸. 위에서 부스러기는 이미 걷어냈으므로 여기 남은 건
  // **다리가 내려앉는 자리**뿐이다 — 양옆이 전부 물이라 이웃이 없는 것이다.
  // 예전엔 null 을 돌려 버렸는데, 그러면 다리 밑이 맨 잔디가 되어 다리가
  // 허공에서 시작한다(건널목 10곳이 그랬다). 사방이 트인 교차 타일이 착지판이 된다.
  return {kind: "cross"};
}

/** 갈래 + 타일 세트 → 어떤 GLB를 몇 도 돌려 놓을지 */
function place(chosen, set) {
  const spec = set.tiles[chosen.kind];
  let rot = 0;
  if (chosen.kind === "straight") rot = set.straight[chosen.axis];
  else if (chosen.kind === "curve") rot = set.curve[chosen.pair];
  else if (chosen.kind === "t") rot = set.t[chosen.blocked];
  return {spec, rot};
}

// ─── ⑤ 풀숲 ──────────────────────────────────────────────────────────────────
// grass-patch 는 둔덕과 들꽃이 있는 잔디 슬래브다. 길 타일에는 이미 꽃 낀 갓길이
// 붙어 있어서 길가에 두면 겹쳐 보이므로, 앞마당 원반 바깥 고리에 둘러 심는다.
//
// 한 칸에 딱 한 장씩 격자에 맞춰 놓으면 정사각형 슬래브 윤곽이 그대로 드러나
// "바닥에 타일 깔았네"로 읽힌다. 그래서 한 자리에 2~3장을 서로 겹치게 두고
// 위치를 격자에서 흩뜨리고 회전을 임의 각도로 준다 — 겹친 가장자리가 서로를
// 가려 덤불 덩어리로 보인다.
//
// 앞마당 원반 위와 길은 비워 둔다. 벤치·가로등·나무가 들어갈 자리다.
// 매번 같은 그림이 나와야 diff가 안 튀므로 시드 난수를 쓴다.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260808);

// 건물 하나당 풀숲을 몇 자리에 둘지. 고리를 다 채우면 원을 그려 인위적으로 보인다.
//
// 장당 4.8k 삼각형이라 개수가 그대로 예산이 된다. 건물마다 두 자리씩 놓으면
// 113장 = 545k로 마을 전체 예산 1M의 절반을 풀숲이 먹어 계기판이 빨개졌다.
// 한 자리로 줄이고 대신 한 자리에 더 겹쳐 덩어리감을 살린다.
const CLUMPS_PER_BUILDING = 1;
/** 한 자리에 겹쳐 심는 장수 */
const PATCHES_PER_CLUMP = [2, 3];

// 그마저도 건물마다 놓으면 57장 = 279k 로 마을 최대 삼각형 소비자가 된다.
// 장식물(간판·벤치·화분·우물…)이 들어오면서 "건물 옆 빈 잔디를 채운다"는 역할이
// 통째로 겹치므로, 풀숲은 한 채 걸러 한 채만 두고 예산을 장식물에 넘긴다.
// 듬성듬성 한 장씩 까느니 절반만 심고 덩어리감을 남기는 쪽이 보기에도 낫다.
const CLUMP_EVERY_NTH_BUILDING = 2;
/** 풀숲이 길 타일을 침범하지 않도록 둘 최소 거리 */
const ROAD_CLEARANCE = HALF + 0.55;

const roadCenters = [...road].map(k => {
  const [i, j] = parse(k);
  return {x: worldX(i), z: worldZ(j)};
});
const nearRoad = (x, z) =>
  roadCenters.some(
    c =>
      Math.abs(c.x - x) < ROAD_CLEARANCE && Math.abs(c.z - z) < ROAD_CLEARANCE
  );
const onDisc = (x, z, slack = 0) =>
  discs.some(d => Math.hypot(d.x - x, d.z - z) < d.r + slack);

/** 심어도 되는 자리인가 — 길·건물·원반을 피한다 */
function plantable(x, z) {
  if (nearRoad(x, z)) return false;
  if (onDisc(x, z, 0.35)) return false;
  return !buildings.some(
    b => Math.abs(b.x - x) < b.w / 2 + 0.7 && Math.abs(b.z - z) < b.d / 2 + 0.7
  );
}

// {x, z, scale, rot} 목록 — 격자가 아니라 실좌표로 흩뿌린다
const clumps = [];
const placed = [];
for (const [index, f] of forecourts.entries()) {
  if (index % CLUMP_EVERY_NTH_BUILDING !== 0) continue;
  // 원반 바깥 고리를 12방향으로 훑어 심을 수 있는 각도를 모은다
  const spots = [];
  for (let a = 0; a < 12; a++) {
    const angle = (a / 12) * Math.PI * 2 + rand() * 0.2;
    const dist = f.radius + 0.75 + rand() * 0.7;
    const x = f.b.x + Math.cos(angle) * dist;
    const z = f.b.z + Math.sin(angle) * dist;
    if (!inBounds(Math.round(x / PITCH), Math.round(z / PITCH))) continue;
    if (!plantable(x, z)) continue;
    // 이미 심은 덤불과 너무 가까우면 뭉쳐 보인다
    if (placed.some(p => Math.hypot(p.x - x, p.z - z) < 1.7)) continue;
    spots.push({x, z});
  }
  for (let n = spots.length - 1; n > 0; n--) {
    const m = Math.floor(rand() * (n + 1));
    [spots[n], spots[m]] = [spots[m], spots[n]];
  }

  for (const spot of spots.slice(0, CLUMPS_PER_BUILDING)) {
    placed.push(spot);
    const [lo, hi] = PATCHES_PER_CLUMP;
    const count = lo + Math.floor(rand() * (hi - lo + 1));
    for (let n = 0; n < count; n++) {
      // 서로 반쯤 겹치게 흩뜨려야 정사각 윤곽이 묻힌다
      const off = n === 0 ? 0 : 0.45 + rand() * 0.5;
      const dir = rand() * Math.PI * 2;
      const x = spot.x + Math.cos(dir) * off;
      const z = spot.z + Math.sin(dir) * off;
      if (!plantable(x, z)) continue;
      clumps.push({
        x,
        z,
        scale: 0.62 + rand() * 0.5,
        rot: rand() * Math.PI * 2
      });
    }
  }
}

// ─── 출력 ─────────────────────────────────────────────────────────────────────
const props = [];
const counts = {};
const bump = (k, v2 = false) => {
  const at = `${v2 ? "v2" : "v1"}:${k}`;
  counts[at] = (counts[at] ?? 0) + 1;
};

// 광장·앞마당은 길과 달리 칸 단위로 세트를 섞지 않는다 — 원반 한 장이 통째로
// 하나이므로 기본 세트(--v1 이면 예전 것)를 그대로 쓴다.
const PLAZA = (process.argv.includes("--v1") ? SETS.v1 : SETS.v2).tiles.plaza;

// ─── 광장 포장 ────────────────────────────────────────────────────────────────
// **한때 구역 블록 안쪽도 통째로 포장이었다. 되돌렸다.**
//
// 컨셉 아트를 보고 "마을이 지어진 동네로 보이는 건 바닥이 돌이기 때문"이라고
// 읽었는데, 부감을 나란히 놓고 세어 보니 그 반대였다. 컨셉의 바닥은 **풀밭이
// 기본**이고 돌은 큰길과 광장에만 깔린다. 블록 안까지 깔았더니 판석이 613장,
// 2,167유닛² — 구역 단 넓이(1,159)를 통째로 덮고도 남는 양이라 **마을 전체가
// 하나의 거대한 광장**으로 보였다. 초록이 골짜기와 마을 밖에만 남았다.
//
// 지금 포장은 세 군데뿐이다: 광장 앞치마 · 길 타일 · 건물 앞마당 원반.
// 나머지는 잔디다. 단 위(y=1.1)의 잔디는 타일이 아니라 `VillageScene` 의
// `TerraceBanks` 가 사각형마다 뚜껑 한 장(2삼각형)으로 덮는다 —
// 여기서 판석을 걷어내면 단 위가 뻥 뚫려 1.1 아래 잔디 평면이 보인다.
const PAVING = {glb: "/models/props/ground-flat/paving-square.glb", top: 0};
const PAVE_Y = round3(TOP_Y - 0.015);
let pavedCount = 0;
/** 판석을 깐 칸 — 길 타일도 여기서는 갓길이 돌인 변종을 쓴다 */
const pavedCells = new Set();
{
  const cells = pavedCells;
  // 광장 앞치마 — 중앙 원반에서 사방으로 퍼지는 돌마당.
  // 컨셉 아트의 광장도 원반 하나가 아니라 퍼지는 포장 면이다.
  //
  // 바깥 끝은 **단상 테두리**가 정한다. 칸 중심이 테두리보다 이만큼 안쪽이어야
  // 타일(반대각 1.33)이 축대 밖으로 안 삐져나온다.
  const APRON_EDGE = 0.9;
  for (let i = I_MIN; i <= I_MAX; i++)
    for (let j = J_MIN; j <= J_MAX; j++) {
      const dx = worldX(i) - HUB.x;
      const dz = worldZ(j) - HUB.z;
      const r = Math.hypot(dx, dz);
      if (r >= plazaDaisRadius(Math.atan2(dz, dx)) - APRON_EDGE) continue;
      cells.add(key(i, j));
    }

  // 판석 그림은 이어붙게 구웠지만 **같은 그림**이라, 그냥 깔면 1.88 격자가
  // 부감에서 무늬로 읽힌다(예전 절차 생성 판에서 붉은 악센트 하나 때문에 빨간
  // 바둑판이 떠오른 것과 같은 문제다). 칸마다 90°씩 돌려 준다 — 텍스처는 한 장
  // 그대로, 삼각형도 그대로인데 주기가 네 배로 길어진다. 정사각형에 이음매가
  // 이어붙으므로 어느 각도로 돌려도 옆 칸과 계속 맞물린다.
  const QUARTER = Math.PI / 2;
  for (const k of [...cells].sort()) {
    const [i, j] = parse(k);
    // 좌표 해시 — 같은 칸은 늘 같은 각도라야 다시 돌려도 diff 가 안 튄다
    let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    props.push({
      id: `ground-pave-${i}_${j}`,
      glb: PAVING.glb,
      position: [round3(worldX(i)), PAVE_Y, round3(worldZ(j))],
      rotationY: round3(((h >>> 16) & 3) * QUARTER),
      scale: 1
    });
    pavedCount += 1;
  }
}

// 중앙 광장
props.push({
  id: "ground-plaza-center",
  glb: PLAZA.glb,
  position: [HUB.x, round3(TOP_Y - PLAZA.top * HUB_SCALE), HUB.z],
  rotationY: 0,
  scale: HUB_SCALE
});
bump("plaza", PLAZA === SETS.v2.tiles.plaza);

// 건물 앞마당
//
// 예전엔 여기도 plaza-tile 을 썼다. 그런데 그 타일은 **해 무늬가 박힌 원형
// 메달리온**이다 — 광장 한복판에 한 장 놓으라고 만든 것이라, 건물 26채 밑에
// 깔아 놓으니 같은 해 무늬가 마을 곳곳에 26번 되풀이됐다. 조감에서 제일 먼저
// 눈에 걸리는 반복이었다.
//
// 구역 바닥을 판석으로 깔고 나서는 앞마당을 따로 보일 이유도 없어졌다 —
// 컨셉 아트에서도 건물은 그냥 포장 위에 서 있다. 같은 판석으로 바꿔
// 주변 포장에 녹인다. id·scale 은 그대로 둔다: generate-decor-layout 의
// 앞마당 반지름 검산 가드가 이 값을 읽는다.
for (const f of forecourts) {
  props.push({
    id: `ground-yard-${f.b.id}`,
    glb: PAVING.glb,
    position: [f.b.x, round3(TOP_Y - PLAZA.top * f.scale), f.b.z],
    rotationY: 0,
    scale: f.scale
  });
  bump("plaza", PLAZA === SETS.v2.tiles.plaza);
}

// 길
let v2Count = 0;
for (const k of [...road].sort()) {
  const [i, j] = parse(k);
  const chosen = pick(i, j);
  if (!chosen) continue;
  const v2 = inV2(i, j);
  if (v2) v2Count++;
  // 판석 위를 지나는 길은 갓길이 돌인 변종. 포장 밖(남쪽 진입로·북쪽 참배로)은
  // 잔디를 밟고 가므로 원본 그대로가 맞다.
  const paved = pavedCells.has(k);
  const {spec, rot} = place(
    chosen,
    paved ? SETS.paved : v2 ? SETS.v2 : SETS.v1
  );
  bump(chosen.kind, v2);
  props.push({
    id: `ground-${i}_${j}`,
    glb: spec.glb,
    position: [round3(worldX(i)), round3(TOP_Y - spec.top), round3(worldZ(j))],
    rotationY: Math.round(rot * 10000) / 10000,
    scale: 1
  });
}

// 풀숲 — 크기·각도를 흩어야 복제 티가 안 난다
let grassOnPaving = 0;
clumps.forEach((c, n) => {
  const gi = Math.round(c.x / PITCH),
    gj = Math.round(c.z / PITCH);
  // 돌바닥 한복판에 풀숲 한 덩이가 놓이면 잡초로 보인다. 포장 칸은 건너뛴다.
  if (pavedCells.has(key(gi, gj))) {
    grassOnPaving += 1;
    return;
  }
  const v2 = inV2(gi, gj);
  const spec = (v2 ? SETS.v2 : SETS.v1).tiles.grass;
  bump("grass", v2);
  props.push({
    // 좌표가 격자에 안 맞으므로 순번으로 id를 만든다 (재생성마다 같은 순서)
    id: `ground-grass-${n}`,
    glb: spec.glb,
    position: [round3(c.x), round3(TOP_Y - spec.top * c.scale), round3(c.z)],
    rotationY: round3(c.rot),
    scale: round3(c.scale)
  });
});


// ─── 기존 레이아웃에 병합 ─────────────────────────────────────────────────────
const layout = JSON.parse(readFileSync(LAYOUT, "utf8"));
const kept = (layout.props ?? []).filter(p => !p.id.startsWith("ground-"));
layout.props = [...kept, ...props];

const tris = Object.entries(counts).reduce((sum, [k, v]) => {
  const [set, kind] = k.split(":");
  return sum + SETS[set].tiles[kind].tris * v;
}, 0);
console.log(
  `격자 간격 ${PITCH}  ·  윗면 높이 ${TOP_Y}  ·  바닥 프롭 ${props.length}장`
);
const bySet = set =>
  Object.entries(counts)
    .filter(([k]) => k.startsWith(`${set}:`))
    .map(([k, v]) => `${k.slice(3)} ${v}`)
    .join(", ") || "없음";
const partial = V2_RECT !== null && Number.isFinite(V2_RECT.i0);
if (!V2_RECT || partial) console.log(`  예전 타일: ${bySet("v1")}`);
if (V2_RECT) {
  const where = partial
    ? `   (구역 i ${V2_RECT.i0}~${V2_RECT.i1} / j ${V2_RECT.j0}~${V2_RECT.j1}, 길 ${v2Count}칸)`
    : "";
  console.log(`  새 타일  : ${bySet("v2")}${where}`);
}
console.log(
  `  앞마당에 먹혀 뺀 길 칸: ${swallowed}개  ·  막다른 길로 깎은 칸: ${pruned}개`
);
console.log(
  `  길이 안 닿은 건물: ${unreachable.length ? unreachable.join(", ") : "없음"}`
);
console.log(
  `  구역 포장  : ${pavedCount}장 (판석, 장당 2삼각형 = ${
    pavedCount * 2
  }삼각형)`
);
console.log(`  ground 외 프롭 ${kept.length}개는 그대로 유지`);
console.log(`  예상 삼각형 합계 약 ${(tris / 1000).toFixed(0)}k`);

if (dry) {
  console.log("\n--dry 라서 파일은 쓰지 않았습니다.");
} else {
  writeFileSync(LAYOUT, JSON.stringify(layout, null, 2) + "\n");
  console.log(`\n${LAYOUT} 갱신 완료`);
}
