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
import {readVillage} from "./lib/read-village.mjs";

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
  return {i0: Math.min(a, c), i1: Math.max(a, c), j0: Math.min(b, d), j1: Math.max(b, d)};
})();
const inV2 = (i, j) =>
  V2_RECT !== null && i >= V2_RECT.i0 && i <= V2_RECT.i1 && j >= V2_RECT.j0 && j <= V2_RECT.j1;

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

// ─── 격자 유틸 ────────────────────────────────────────────────────────────────
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
const [I_MIN, I_MAX, J_MIN, J_MAX] = (() => {
  let i0 = 0, i1 = 0, j0 = 0, j1 = 0;
  for (const b of buildings) {
    i0 = Math.min(i0, Math.floor((b.x - b.w / 2) / PITCH));
    i1 = Math.max(i1, Math.ceil((b.x + b.w / 2) / PITCH));
    j0 = Math.min(j0, Math.floor((b.z - b.d / 2) / PITCH));
    j1 = Math.max(j1, Math.ceil((b.z + b.d / 2) / PITCH));
  }
  return [i0 - MARGIN, i1 + MARGIN, Math.min(j0 - MARGIN, NORTH_END - 1), j1 + MARGIN];
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

// 남쪽 정문 진입 축. 컨셉 아트에서 마을로 들어오는 길은 남쪽 대계단 하나뿐이고,
// 광장까지 일직선으로 뻗는다. 그런데 이 축의 끝은 정의상 막다른 길이라
// 아래 정리 단계가 두 칸씩 갉아먹어 마을 어귀가 사라진다(실제로 j 8·9 가 잘렸다).
// 여기 담긴 칸은 "일부러 벌판으로 뻗은 길"이라 정리에서 뺀다.
// 북쪽 참배로도 같은 이유로 지킨다 — 마을을 지나 개울을 건너 파고다 섬까지 간다.
const CEREMONIAL = new Set();
for (let j = 1; j <= J_MAX - 1; j++) CEREMONIAL.add(key(0, j));
for (let j = NORTH_END; j <= -1; j++) CEREMONIAL.add(key(0, j));

// 구역별 블록 상자 (격자 단위, 건물이 실제로 먹는 칸 기준)
const BLOCK_BOX = new Map();
for (const b of OUTER) {
  const box = BLOCK_BOX.get(b.district) ?? {i0: Infinity, i1: -Infinity, j0: Infinity, j1: -Infinity};
  box.i0 = Math.min(box.i0, Math.floor((b.x - b.w / 2) / PITCH));
  box.i1 = Math.max(box.i1, Math.ceil((b.x + b.w / 2) / PITCH));
  box.j0 = Math.min(box.j0, Math.floor((b.z - b.d / 2) / PITCH));
  box.j1 = Math.max(box.j1, Math.ceil((b.z + b.d / 2) / PITCH));
  BLOCK_BOX.set(b.district, box);
}

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
  const spanFree = (fixed) => {
    if (wide) {
      for (let i = ei0; i <= ei1; i++) if (blocked.has(key(i, fixed))) return false;
    } else {
      for (let j = ej0; j <= ej1; j++) if (blocked.has(key(fixed, j))) return false;
    }
    return true;
  };
  // 광장 반대쪽 바깥 변은 뺀다 — 블록 뒤편은 아무 데도 안 가는 길이다
  const far = wide ? (cj < 0 ? ej0 : ej1) : ci < 0 ? ei0 : ei1;
  const [lo, hi] = wide ? [ej0, ej1] : [ei0, ei1];
  // 빈 줄을 전부 깔면 골목 두 개가 나란히 붙어 **두 칸 폭 대로**가 된다.
  // 실제로 블록 가장자리 줄과 그 바로 옆 줄이 함께 깔려, 위에서 보면 길이
  // 아니라 포장된 벌판이었다. 한 칸 건너뛴다 — 골목과 골목 사이엔 집이 선다.
  let lastLaid = -Infinity;
  for (let n = lo; n <= hi; n++) {
    if (n === far || !spanFree(n) || n - lastLaid < 2) continue;
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
const HUB_SCALE = 4.84;
const HUB_RADIUS = HUB_SCALE * PLAZA_RADIUS_AT_1;
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
  if (n === 3) return {kind: "t", blocked: !N ? "N" : !S ? "S" : !W ? "W" : "E"};
  if (n === 2) {
    if (N && S) return {kind: "straight", axis: "NS"};
    if (W && E) return {kind: "straight", axis: "WE"};
    if (W && S) return {kind: "curve", pair: "WS"};
    if (S && E) return {kind: "curve", pair: "SE"};
    if (E && N) return {kind: "curve", pair: "EN"};
    return {kind: "curve", pair: "NW"}; // N && W
  }
  // 막다른 길 — 이어지는 쪽을 향해 직선을 놓는다. 이웃이 아예 없으면 버린다.
  if (n === 1) return {kind: "straight", axis: N || S ? "NS" : "WE"};
  return null;
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
  roadCenters.some(c => Math.abs(c.x - x) < ROAD_CLEARANCE && Math.abs(c.z - z) < ROAD_CLEARANCE);
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
const round3 = v => Math.round(v * 1000) / 1000;
const props = [];
const counts = {};
const bump = (k, v2 = false) => {
  const at = `${v2 ? "v2" : "v1"}:${k}`;
  counts[at] = (counts[at] ?? 0) + 1;
};

// 광장·앞마당은 길과 달리 칸 단위로 세트를 섞지 않는다 — 원반 한 장이 통째로
// 하나이므로 기본 세트(--v1 이면 예전 것)를 그대로 쓴다.
const PLAZA = (process.argv.includes("--v1") ? SETS.v1 : SETS.v2).tiles.plaza;

// ─── 구역 바닥 포장 ───────────────────────────────────────────────────────────
// 컨셉 아트에서 마을이 "지어진 동네"로 보이는 가장 큰 이유는 **바닥이 돌**이라는
// 것이다. 구역 안쪽이 통째로 포장이고 잔디는 그 바깥 숲에만 있다. 우리는 정반대로
// 초록 벌판에 폭 1.88짜리 길만 실처럼 그어져 있어서, 건물을 아무리 정연하게
// 세워도 "풀밭에 놓인 모형"이었다 — 배치를 다시 짜도 이 인상이 안 바뀌었다.
//
// 판석 한 장이 삼각형 **2개**다(scripts/make-paving-tile.mjs). 300장을 깔아도
// 600삼각형이라, 이 마을에서 가장 값싸게 그림이 바뀌는 수단이다.
//
// 길·앞마당 원반을 피해 가며 깔지 않고 **그 밑에 통째로** 깐다. 원반은 둥글어서
// "중심이 원 안인 칸"만 빼면 가장자리에 반달 모양 잔디가 남는다. 15mm 밑에
// 깔면 겹쳐도 z-파이팅이 없고 길이 그대로 위에 올라온다.
const PAVING = {glb: "/models/props/ground-flat/paving-square.glb", top: 0};
const PAVE_Y = round3(TOP_Y - 0.015);
let pavedCount = 0;
/** 판석을 깐 칸 — 길 타일도 여기서는 갓길이 돌인 변종을 쓴다 */
const pavedCells = new Set();
{
  const cells = pavedCells;
  // ① 구역 블록 — 상자 바깥으로 한 칸 넓혀 건물 뒤 채움 민가까지 딛고 서게 한다
  for (const box of BLOCK_BOX.values())
    for (let i = box.i0 - 1; i <= box.i1 + 1; i++)
      for (let j = box.j0 - 1; j <= box.j1 + 1; j++)
        if (inBounds(i, j)) cells.add(key(i, j));

  // ② 광장 앞치마 — 중앙 원반에서 블록까지 이어지는 넓은 돌마당.
  //    컨셉 아트의 광장은 원반 하나가 아니라 사방으로 퍼지는 포장 면이다.
  const APRON = HUB_RADIUS + 4.2;
  for (let i = I_MIN; i <= I_MAX; i++)
    for (let j = J_MIN; j <= J_MAX; j++)
      if (Math.hypot(worldX(i) - HUB.x, worldZ(j) - HUB.z) < APRON) cells.add(key(i, j));

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
  const {spec, rot} = place(chosen, paved ? SETS.paved : v2 ? SETS.v2 : SETS.v1);
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
  const gi = Math.round(c.x / PITCH), gj = Math.round(c.z / PITCH);
  // 돌바닥 한복판에 풀숲 한 덩이가 놓이면 잡초로 보인다. 포장 칸은 건너뛴다.
  if (pavedCells.has(key(gi, gj))) { grassOnPaving += 1; return; }
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

// ─── 구역 단차(테라스) 데이터 ─────────────────────────────────────────────────
// 컨셉 아트의 마을은 평지가 아니라 계단식이다 — 광장이 제일 낮고 구역마다 한 단
// 올라앉아 있어서, 부감에서 여섯 덩어리가 그림자로도 갈린다.
//
// **높이를 propsLayout.json 에 굽지 않는다.** 여기서는 "어디가 한 단 높은가"만
// 사각형으로 내보내고, 실제 y 는 앱이 `src/lib/villageTerrain.ts` 로 렌더할 때
// 더한다. 그래야 STEP 하나만 0 으로 바꾸면 예전 평지로 정확히 되돌아간다.
//
// 범위는 **블록 상자 그대로**다. 판석은 여기서 한 칸 더 넓게(±1) 깔리므로
// 단 위가 전부 포장이고, 단 둘레에도 지면 높이 판석이 한 줄 남는다 —
// 잔디 위에 판이 떠 있는 그림이 안 나오게 하는 게 이 한 칸이다.
// ±1 로 잡았더니 여섯 구역이 서로 맞붙어 광장만 우물처럼 파인 도넛이 됐다.
{
  const blocks = [];
  for (const [district, box] of BLOCK_BOX) {
    const i0 = box.i0, i1 = box.i1, j0 = box.j0, j1 = box.j1;
    blocks.push({
      district,
      // 칸 중심 격자이므로 바깥 테두리는 반 칸 더 나간다
      x0: round3(worldX(i0) - HALF),
      x1: round3(worldX(i1) + HALF),
      z0: round3(worldZ(j0) - HALF),
      z1: round3(worldZ(j1) + HALF)
    });
  }
  if (!dry) {
    writeFileSync(
      "src/data/villageTerraces.json",
      JSON.stringify({pitch: PITCH, blocks}, null, 2) + "\n"
    );
  }
  console.log(`  구역 단차 사각형 ${blocks.length}개 → src/data/villageTerraces.json`);
}

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
console.log(`  구역 포장  : ${pavedCount}장 (판석, 장당 2삼각형 = ${pavedCount * 2}삼각형)`);
console.log(`  ground 외 프롭 ${kept.length}개는 그대로 유지`);
console.log(`  예상 삼각형 합계 약 ${(tris / 1000).toFixed(0)}k`);

if (dry) {
  console.log("\n--dry 라서 파일은 쓰지 않았습니다.");
} else {
  writeFileSync(LAYOUT, JSON.stringify(layout, null, 2) + "\n");
  console.log(`\n${LAYOUT} 갱신 완료`);
}
