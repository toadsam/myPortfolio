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
  readHubs,
  cornersOf,
  obbContains,
  discOfDistrict,
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
  // 건물이 임의 각으로 돌므로(고리 배치) 범위는 회전 모서리로 잰다
  for (const b of buildings)
    for (const [x, z] of cornersOf(b)) {
      i0 = Math.min(i0, Math.floor(x / PITCH));
      i1 = Math.max(i1, Math.ceil(x / PITCH));
      j0 = Math.min(j0, Math.floor(z / PITCH));
      j1 = Math.max(j1, Math.ceil(z / PITCH));
    }
  return [
    i0 - MARGIN,
    i1 + MARGIN,
    Math.min(j0 - MARGIN, NORTH_END - 1),
    Math.max(j1 + MARGIN, SOUTH_END + 1)
  ];
})();
const inBounds = (i, j) => i >= I_MIN && i <= I_MAX && j >= J_MIN && j <= J_MAX;

// 건물이 깔고 앉은 칸 — 길이 지나갈 수 없다. 회전 상자(OBB)로 잰다.
const blocked = new Set();
for (let i = I_MIN; i <= I_MAX; i++) {
  for (let j = J_MIN; j <= J_MAX; j++) {
    const x = worldX(i);
    const z = worldZ(j);
    const hit = buildings.some(b => obbContains(b, x, z, HALF));
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
// ── 축은 남북 하나뿐이다 ─────────────────────────────────────────────────────
// 예전엔 동서 대로 + 정사각 고리(RINGS)도 있었다. 섬 내부가 격자 골목에서
// **방사 차선**(아래 commons)으로 바뀌면서 격자 길은 남북 참배로만 남는다 —
// 남쪽 정문 대계단 → 광장 → 북쪽 파고다 섬을 잇는 마을의 등뼈이자,
// 컨셉 이미지에서도 위아래로 곧게 지나가는 유일한 직선 길이다.
// 동서 대로는 육각 방위에서 어느 섬도 지나지 않아, 석호를 가로지르는 뜬금없는
// 둑길만 만들기에 걷어냈다.
const TRUNKS = [[0, J_MIN + 1, 0, J_MAX - 1]];

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

// ─── 원반 섬 ──────────────────────────────────────────────────────────────────
// 컨셉 아트의 마을은 **둥근 섬**들이다 — 구역 하나가 원반 하나, 테두리를 축대와
// 난간이 두르고, 섬끼리 다리로 이어진다.
//
// 중심은 **hub**(고리 배치의 중심 — arrange-district-round 가 constants.ts 에
// 적는다)다. 건물 무게중심으로 잡으면 호(arc) 배치 구역에서 중심이 건물 쪽으로
// 쏠려, 미니광장이 섬 한켠에 몰린다. 반지름은 가장 먼 건물 모서리(회전 반영)
// + 둘레 여유 — 계산은 read-village.mjs 의 discOfDistrict 한 곳뿐이다(솔버·검사
// 와 같은 식이어야 섬이 어긋나지 않는다).
const HUBS = readHubs();
const ISLAND = new Map();
for (const [district, hub] of Object.entries(HUBS)) {
  const list = OUTER.filter(b => b.district === district);
  if (!list.length) continue;
  const disc = discOfDistrict(list, hub);
  ISLAND.set(district, {
    district,
    x: round3(disc.x),
    z: round3(disc.z),
    r: round3(disc.r)
  });
}
/** 섬 물가까지 남은 거리 (섬 안이면 0) */
const islandGap = (x, z) => {
  let best = Infinity;
  for (const isl of ISLAND.values())
    best = Math.min(
      best,
      Math.max(0, Math.hypot(x - isl.x, z - isl.z) - isl.r)
    );
  return best;
};
const onIsland = (x, z) => islandGap(x, z) === 0;

// ─── 마을 속을 채우는 물 (석호) ───────────────────────────────────────────────
// 한동안 물은 "잔디 위에 그린 띠"였다 — 광장을 두르는 고리 하나와 골짜기로 빠지는
// 개울 여섯. 컨셉을 다시 보면 발상이 반대다: **물이 바닥이고 땅이 그 위로 솟는다.**
// 구역 단(+1.1)과 광장이 물에서 올라온 섬이고, 높이 0 인 곳은 전부 수면이다.
//
// 그래서 물을 리본으로 그리지 않는다. **높이 0 이면 물**이라는 규칙 하나면 되고,
// 남는 문제는 "어디까지가 마을 속인가" 하나다. 그냥 반지름으로 자르면 구역이
// 얕은 방향에서 벌판 한복판에 물가가 생긴다. 구역 블록 모서리들의 **볼록 껍질**로
// 자르면 껍질이 구역 바깥 변을 따라 지나가므로, 물가가 늘 축대 뒤에 숨는다.
const LAGOON = (() => {
  // 섬 테두리에서 0.6 나간 원둘레 표본들의 볼록 껍질 — 껍질이 늘 섬 물가
  // 바로 밖을 지나므로, 벌판 한복판에 물가가 생기지 않는다.
  const pts = [];
  for (const isl of ISLAND.values())
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      pts.push({
        x: isl.x + Math.cos(a) * (isl.r + 0.6),
        z: isl.z + Math.sin(a) * (isl.r + 0.6)
      });
    }
  const grown = pts;
  // 볼록 껍질 (Andrew monotone chain)
  const sorted = grown.slice().sort((a, b) => a.x - b.x || a.z - b.z);
  const cross = (o, a, b) =>
    (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
  const half = src => {
    const out = [];
    for (const p of src) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2], out[out.length - 1], p) <= 0
      )
        out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  const hull = [...half(sorted), ...half(sorted.slice().reverse())];
  return hull.map(p => ({x: round3(p.x), z: round3(p.z)}));
})();

/** (x,z) 가 석호 껍질 안인가 — 볼록이라 모든 변의 같은 쪽이면 안이다 */
const inLagoon = (x, z) => {
  for (let i = 0; i < LAGOON.length; i++) {
    const a = LAGOON[i];
    const b = LAGOON[(i + 1) % LAGOON.length];
    if ((b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x) < 0) return false;
  }
  return true;
};

/** 닫힌 폴리라인(240마디)에서 그 각도의 반지름을 읽는다 */
const radiusOn = (line, ang) => {
  const t = ((ang / (Math.PI * 2)) % 1 || 0) * line.length;
  const i = ((Math.floor(t) % line.length) + line.length) % line.length;
  return Math.hypot(line[i].x, line[i].z);
};

// ─── 광장 단상 ────────────────────────────────────────────────────────────────
// 마을 속 바닥이 전부 물이 되면 광장은 **섬**이다. 그러니 구역과 같은 높이(+1.1)로
// 올라가야 대등한 섬으로 읽힌다 — 0.55 로 두면 가장 중요한 섬이 제일 낮은 섬이 된다.
//
// 사각형이 아니라 **각도별 반지름**으로 정의한다. 광장 포장은 사각형이 아니고
// (대로 네 개가 축 방향 칸을 먹는다) 사각형 단을 깔면 네 모서리가 물로 튀어나온다.
// 내보내는 선은 **꼭대기 테두리**이고, 축대는 거기서 바깥으로 내려가 수면에 닿는다.
/** 축대가 수면까지 내려오는 데 필요한 수평 거리 */
const DAIS_WALL_RUN = 0.5;
/** 단상 축대 발치와 구역 축대 발치 사이에 남길 물 폭 — 이게 석호의 목폭이다 */
const LAGOON_MIN_WIDTH = 2.6;
/** 구역이 멀리 물러난 방향에서 단상이 같이 퍼지지 않게 씌우는 뚜껑 */
const DAIS_MAX = 9.0;
const PLAZA_DAIS = (() => {
  /** 구역 섬 물가까지 남은 거리 — 원반이라 중심 거리에서 반지름을 빼면 끝이다 */
  const footGap = islandGap;

  // ─── 왜 "광선이 처음 닿는 거리"로 재면 안 되나 ──────────────────────────────
  // 각도마다 바깥으로 쏘아 단에 닿는 반지름에서 일정 값을 빼는 방식은, 단 모서리를
  // **스치듯 지나가는 방향**에서 수직 거리가 거의 안 늘어난다. 실거리로 재면
  // 각도와 무관하게 물 폭이 늘 그만큼 확보된다.
  const NEED = LAGOON_MIN_WIDTH + DAIS_WALL_RUN;
  const STEPS = 240;
  const limit = [];
  for (let s = 0; s < STEPS; s++) {
    const a = (s / STEPS) * Math.PI * 2;
    const c = Math.cos(a);
    const si = Math.sin(a);
    let r = DAIS_MAX;
    while (r > 3 && footGap(c * r, si * r) < NEED) r -= 0.05;
    limit.push(r);
  }

  // 구역 모서리가 파고든 방향에서 테두리가 각지지 않게 한 바퀴 평활한 뒤
  // 다시 한계로 눌러, 꺾이지 않으면서도 물 폭을 잃지 않는 곡선을 만든다.
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
const plazaDaisRadius = ang => radiusOn(PLAZA_DAIS, ang);

/** 그 자리가 물인가 — 마을 속(석호 껍질 안)이면서 섬 위가 아닌 곳 */
const isWater = (x, z) => {
  if (!inLagoon(x, z)) return false;
  if (Math.hypot(x, z) <= plazaDaisRadius(Math.atan2(z, x))) return false;
  if (onIsland(x, z)) return false;
  return true;
};

// ── 블록 L자 진입로·골목은 없어졌다 ──────────────────────────────────────────
// 격자 줄 배치 시절의 것이다. 섬 내부가 고리 배치(미니광장 + 방사 차선)로
// 바뀌면서 섬 안 길은 아래 commons 절이 **리본 메시**로 만든다 — 격자 타일로
// 방사선을 그리면 계단처럼 삐뚤어진다.

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

// 4-이웃 — 아래 여러 절(물에 잠긴 칸 묶기·외톨이 정리·막다른 길 다듬기)이 쓴다
const NEIGHBORS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0]
];

// ─── (없어짐) 건물 → 도로망 BFS 지선 ─────────────────────────────────────────
// 격자 길 시절엔 건물마다 가장 가까운 길까지 타일 지선을 이었다. 지금 건물은
// 전부 섬 위 고리에 서고 문 앞을 **차선 고리**(commons)가 지나므로, 타일
// 지선을 이으면 섬 잔디에 격자 토막만 남는다.

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
  const islands = [...ISLAND.values()];
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

    const angles = islands
      .map(isl => Math.atan2(isl.z, isl.x))
      .sort((x, y) => x - y);

    const onPlateau = onIsland;
    const clearOf = islandGap;

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
    // 물길은 **석호가 끝나는 자리**에서 갈라져 나간다. 석호 안은 이미 물이므로
    // 거기까지 리본을 그리면 같은 높이 면이 겹쳐 지글거린다.
    const startRadius = startAng => {
      const c = Math.cos(startAng);
      const si = Math.sin(startAng);
      let r = 6;
      // 껍질 밖으로 나가는 첫 반지름 — 거기서부터가 개울이다
      while (r < 40 && inLagoon(c * r, si * r)) r += 0.3;
      return r - 0.9; // 석호에 살짝 담가 이어 붙인다
    };

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

  // ─── 물에 잠기는 길 타일을 걷어낸다 ────────────────────────────────────────
  // 마을 속 바닥이 전부 물이 됐으므로, 단 위가 아닌 길 칸은 전부 물속이다.
  // 길 타일은 y 0.060, 수면은 0.030 이라 그냥 두면 **길이 물을 덮어** 물이 그
  // 밑으로 사라지고, 그 위에 선 다리는 마른 길 위에 놓인 다리가 된다.
  // 물이 지나는 자리는 길이 아니라 다리다 — 타일을 빼고 그 자리를 다리가 잇는다.
  {
    const CUT = HALF + Math.max(WATER.ring, WATER.channelOut);
    const segDist = (x, z, a, b) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const l2 = dx * dx + dz * dz;
      const t = l2
        ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2))
        : 0;
      return Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
    };
    const nearChannel = (x, z) =>
      channels.some(line => {
        for (let n = 0; n + 1 < line.length; n++)
          if (segDist(x, z, line[n], line[n + 1]) < CUT) return true;
        return false;
      });

    const wetCells = new Set();
    for (const k of [...road]) {
      const [i, j] = parse(k);
      const x = worldX(i);
      const z = worldZ(j);
      if (!isWater(x, z) && !nearChannel(x, z)) continue;
      road.delete(k);
      wetCells.add(k);
      bridgeCells.push({x: round3(x), z: round3(z)});
    }

    // ─── 건널목 = 걷어낸 칸이 이어진 덩어리 하나 ──────────────────────────────
    // 예전엔 물길 마디를 훑어 "여기 길이 있었나"로 찾았다. 물이 면이 된 지금은
    // 물길 폴리라인이 없는 자리(석호 한복판)에서도 길이 끊기므로, 걷어낸 칸
    // 자체를 4-이웃으로 묶는 쪽이 일반적이다.
    const seen = new Set();
    for (const k of wetCells) {
      if (seen.has(k)) continue;
      const group = [];
      const stack = [k];
      seen.add(k);
      while (stack.length) {
        const cur = stack.pop();
        group.push(cur);
        const [i, j] = parse(cur);
        for (const [di, dj] of NEIGHBORS) {
          const nk = key(i + di, j + dj);
          if (wetCells.has(nk) && !seen.has(nk)) {
            seen.add(nk);
            stack.push(nk);
          }
        }
      }
      const xs = group.map(g => worldX(parse(g)[0]));
      const zs = group.map(g => worldZ(parse(g)[1]));
      const cx = xs.reduce((a, b) => a + b, 0) / group.length;
      const cz = zs.reduce((a, b) => a + b, 0) / group.length;
      // 덩어리가 길게 뻗은 축이 곧 길 방향이다. 다리 모델의 긴 축(+X)은 물
      // 진행 방향에 맞춰야 물을 **가로지르므로**, 길 방향에 수직으로 눕힌다.
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanZ = Math.max(...zs) - Math.min(...zs);
      const roadAng = spanX >= spanZ ? 0 : Math.PI / 2;
      crossings.push({
        x: round3(cx),
        z: round3(cz),
        angle: round3(roadAng + Math.PI / 2)
      });
    }

    // 건널목 하나가 칸 여럿을 먹으므로 사이에 낀 외톨이가 남는다 — 이웃이 하나도
    // 없는 포장 조각이라 다리 옆 부스러기로 보인다. 물가에 닿은 칸은 다리가
    // 내려앉는 자리이므로 지킨다.
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

    // ─── 섬 대문 각도 수집 ────────────────────────────────────────────────────
    // 다리(둑길·이웃 다리)가 섬 테두리에 닿는 각도. 아래 commons 절이 이
    // 각도마다 방사 스포크 차선을 내고, 장식물 생성기는 그 스포크를 "길"로
    // 읽어 담장을 끊는다(구역 대문).
    for (const [, isl] of ISLAND) isl.gates = [];

    // ─── 구역마다 광장에서 오는 다리를 **보장한다** ───────────────────────────
    // 위의 "걷어낸 길 칸" 만으로는 구역 여섯 중 절반에만 다리가 생긴다. 대로가
    // 구역 정면으로 곧게 가지 않고 L 자로 도는 탓이라, 물을 건너는 자리가 구역
    // 앞이 아니라 엉뚱한 각도에 생긴다 — 걸어서 닿는 건물이 6채까지 떨어졌다.
    // 구역마다 무게중심 방향으로 **둑길 한 줄**을 놓아 광장 섬과 잇는다.
    for (const [district, isl] of ISLAND) {
      const ang = Math.atan2(isl.z, isl.x);
      const c = Math.cos(ang);
      const si = Math.sin(ang);
      const span = [];
      for (let r = plazaDaisRadius(ang) - PITCH; r < 40; r += PITCH * 0.5) {
        const x = c * r;
        const z = si * r;
        if (!isWater(x, z)) {
          // 물을 벗어났는데 아직 시작도 안 했으면 계속 나간다(광장 섬 위)
          if (span.length === 0) continue;
          break;
        }
        span.push({x: round3(x), z: round3(z)});
      }
      if (span.length === 0) continue;
      for (const q of span) bridgeCells.push(q);
      const mid = span[Math.floor(span.length / 2)];
      if (!crossings.some(q => Math.hypot(q.x - mid.x, q.z - mid.z) < 3))
        crossings.push({
          x: mid.x,
          z: mid.z,
          angle: round3(ang + Math.PI / 2)
        });
      // 둑길은 섬의 광장 쪽 테두리에 닿는다 — 섬 중심에서 본 각도는 ang+π
      ISLAND.get(district).gates.push(round3(ang + Math.PI));
    }

    // ─── 구역끼리 잇는 다리 — **고리의 이웃 6쌍 전부** ─────────────────────────
    // 골짜기가 통째로 물이 되면 구역 사이 직통이 끊긴다. 광장을 거치지 않고도
    // 옆 구역으로 도는 순환 동선이 되게, 이웃마다 하나씩 놓는다.
    //
    // 예전엔 "축이 겹치는 쌍"만 찾았다 — 좌우·상하로 나란히 마주보는 구역만
    // 걸려서 여섯 골짜기 중 **둘**에만 다리가 섰다. 고리에서 이웃한 구역은
    // 대각선으로 어긋난 경우가 더 많다. 이제 각도로 이웃을 정하고, 두 단의
    // 가장 가까운 점끼리 이어 그 사이 물 구간에 놓는다.
    {
      // 광장 기준 각도로 한 바퀴 정렬 — i 와 i+1 이 곧 이웃이다
      const ring = [...ISLAND.values()]
        .map(isl => ({isl, ang: Math.atan2(isl.z, isl.x)}))
        .sort((p, q) => p.ang - q.ang);

      let put = 0;
      for (let i = 0; i < ring.length; i++) {
        const A = ring[i].isl;
        const B = ring[(i + 1) % ring.length].isl;
        // 원끼리 가장 가까운 점 쌍 — 중심을 잇는 선 위에 있다
        const cx = B.x - A.x;
        const cz = B.z - A.z;
        const cd = Math.hypot(cx, cz) || 1;
        const ux = cx / cd;
        const uz = cz / cd;
        const pA = {x: A.x + ux * A.r, z: A.z + uz * A.r};
        const pB = {x: B.x - ux * B.r, z: B.z - uz * B.r};
        const dx = pB.x - pA.x;
        const dz = pB.z - pA.z;
        const len = Math.hypot(dx, dz);
        if (len < 0.5) continue; // 섬끼리 맞닿아 있다 — 다리가 필요 없다

        // 잇는 선을 따라 걸으며 물 구간을 줍는다. 다리 프롭은 가운데,
        // 걷기 구멍은 구간 전부 — 안 뚫으면 다리가 있어도 못 건넌다.
        const span = [];
        for (let t = -0.15; t <= 1.15; t += (PITCH * 0.5) / len) {
          const x = pA.x + dx * t;
          const z = pA.z + dz * t;
          if (!isWater(x, z)) {
            if (span.length === 0) continue;
            break;
          }
          span.push({x: round3(x), z: round3(z)});
        }
        if (span.length === 0) continue;
        const mid = span[Math.floor(span.length / 2)];
        // 다리 프롭끼리 몸이 겹칠 때만 피한다(돌다리 길이 ≈2.8). 반경 4 로
        // 뒀더니 광장 둑길 건널목이 여섯 골짜기 중 넷을 먹어 버렸다 — 둑길은
        // 광장↔구역 길이지 구역↔구역 직통이 아니라서, 양보하면 순환 동선이 없다.
        if (crossings.some(c => Math.hypot(c.x - mid.x, c.z - mid.z) < 2.5))
          continue;
        for (const q of span) bridgeCells.push(q);
        crossings.push({
          x: mid.x,
          z: mid.z,
          // 저장 규약은 "건너는 방향 + 90°" (다리 모델의 긴 축 정렬)
          angle: round3(Math.atan2(dz, dx) + Math.PI / 2)
        });
        // 이웃 다리가 두 섬 테두리에 닿는 각도 — 서로를 향한 방향
        A.gates.push(round3(Math.atan2(cz, cx)));
        B.gates.push(round3(Math.atan2(-cz, -cx)));
        put += 1;
      }
      console.log(`  구역끼리 잇는 다리 ${put}개 / 이웃 ${ring.length}쌍`);
    }

    console.log(
      `  물에 잠겨 걷어낸 길 칸: ${wetCells.size}개 · 외톨이 ${orphan}개 정리 · 건널목 ${crossings.length}곳`
    );
  }

  // ─── 섬 공유지: 미니광장 + 차선 ─────────────────────────────────────────────
  // 컨셉 이미지의 섬 내부는 격자 골목이 아니라 **동심원**이다: 가운데 둥근
  // 미니광장(분수) → 문 앞을 도는 안쪽 차선 → 담장 안쪽을 도는 테두리 차선 →
  // 다리 각도마다 밖으로 나가는 방사 스포크. 격자 타일로 방사선을 그리면
  // 계단처럼 삐뚤어지므로, 여기서는 **좌표만** 내보내고 VillageScene 이 리본
  // 메시로 그린다. 장식물 생성기는 laneCells 를 "길"로 읽는다(담장 대문·가로등).
  const commons = [];
  const lanes = [];
  const laneCells = [];
  {
    const pushLane = (pts, closed) => {
      lanes.push({
        closed,
        pts: pts.map(p => ({x: round3(p.x), z: round3(p.z)}))
      });
      const n = pts.length;
      const end = closed ? n : n - 1;
      for (let i = 0; i < end; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % n];
        const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        const tx = (b.x - a.x) / len;
        const tz = (b.z - a.z) / len;
        for (let s = 0; s < len; s += 1.25)
          laneCells.push({
            x: round3(a.x + tx * s),
            z: round3(a.z + tz * s),
            tx: round3(tx),
            tz: round3(tz),
            // 스포크(열린 차선) 표식 — 담장을 끊는 대문 판정은 이것만 본다.
            // 고리 차선까지 대문으로 치면 테두리를 도는 차선이 담장을 전부
            // 걷어낸다(실제로 182칸 전부가 "길"이 되어 돌담 0토막이 됐다).
            s: closed ? 0 : 1
          });
      }
    };
    /** 스포크가 건물을 뚫지 않는가 */
    const clearPath = (isl, ang, r0, r1) => {
      const list = OUTER.filter(b => b.district === isl.district);
      for (let r = r0; r <= r1; r += 0.4) {
        const x = isl.x + Math.cos(ang) * r;
        const z = isl.z + Math.sin(ang) * r;
        if (list.some(b => obbContains(b, x, z, 0.45))) return false;
      }
      return true;
    };

    for (const [district, isl] of ISLAND) {
      const list = OUTER.filter(b => b.district === district);
      let doorR = Infinity;
      for (const b of list)
        doorR = Math.min(doorR, Math.hypot(b.x - isl.x, b.z - isl.z) - b.d / 2);
      // 안쪽 차선은 문 앞 0.75, 미니광장은 그 안쪽. 테두리 차선은 담장
      // (물가 −0.35) 에서 0.9 안쪽 — 담장 대문 판정(onRoad 0.75)이 테두리
      // 차선을 대문으로 오인하지 않는 거리다.
      const laneR = Math.max(1.5, doorR - 0.75);
      const rimR = isl.r - 1.25;
      const plazaR = Math.max(1.3, laneR - 1.05);
      commons.push({
        district,
        x: isl.x,
        z: isl.z,
        plazaR: round3(plazaR),
        laneR: round3(laneR),
        rimR: round3(rimR)
      });

      const ringOf = r => {
        const N = Math.max(20, Math.round((2 * Math.PI * r) / 0.9));
        return Array.from({length: N}, (_, k) => {
          const a = (k / N) * Math.PI * 2;
          return {x: isl.x + Math.cos(a) * r, z: isl.z + Math.sin(a) * r};
        });
      };
      pushLane(ringOf(laneR), true);
      if (rimR > laneR + 1.2) pushLane(ringOf(rimR), true);

      // 방사 스포크: 대문(다리) 각도마다 테두리 차선 → 섬 밖(다리 어귀)까지.
      // 건물이 안 막는 각도면 안쪽 차선까지 이어 광장으로 통하게 한다.
      for (const a of isl.gates ?? []) {
        const inner = clearPath(isl, a, laneR, rimR)
          ? plazaR + 0.1
          : rimR - 0.2;
        pushLane(
          [
            {
              x: isl.x + Math.cos(a) * inner,
              z: isl.z + Math.sin(a) * inner
            },
            {
              x: isl.x + Math.cos(a) * (isl.r + 0.5),
              z: isl.z + Math.sin(a) * (isl.r + 0.5)
            }
          ],
          false
        );
      }
    }
    console.log(
      `  섬 공유지: 미니광장 ${commons.length}곳 · 차선 ${lanes.length}줄 (표본 ${laneCells.length}칸)`
    );
  }

  const daisR = PLAZA_DAIS.map(p => Math.hypot(p.x, p.z));
  const hullR = LAGOON.map(p => Math.hypot(p.x, p.z));
  console.log(
    `  마을 속 물(석호) 껍질 ${LAGOON.length}각형 · 반지름 ${Math.min(
      ...hullR
    ).toFixed(1)}~${Math.max(...hullR).toFixed(1)}  ·  바깥 물길 ${
      channels.length
    }줄기`
  );
  console.log(
    `  광장 단상(섬) 반지름 ${Math.min(...daisR).toFixed(1)}~${Math.max(
      ...daisR
    ).toFixed(1)}  (기념비 원반 ${HUB_RADIUS.toFixed(1)})`
  );

  if (!dry) {
    writeFileSync(
      "src/data/villageTerraces.json",
      JSON.stringify(
        {
          pitch: PITCH,
          // gates(대문 각도)는 위에서 계산용으로만 쓰고 굽지 않는다
          islands: islands.map(({district, x, z, r}) => ({district, x, z, r})),
          channels,
          lagoon: LAGOON,
          plazaDais: PLAZA_DAIS,
          crossings,
          bridgeCells,
          commons,
          lanes,
          laneCells
        },
        null,
        2
      ) + "\n"
    );
  }
  console.log(
    `  구역 원반 섬 ${islands.length}개 (r ${Math.min(
      ...islands.map(i => i.r)
    ).toFixed(1)}~${Math.max(...islands.map(i => i.r)).toFixed(
      1
    )}) → src/data/villageTerraces.json`
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
// (옛 사정) v1 풀숲은 장당 4.8k 삼각형이라 개수가 그대로 예산이었다. 건물마다
// 두 자리씩 놓으면 113장 = 545k 로 마을 예산 1M 의 절반을 먹어 계기판이
// 빨개졌다. 그래서 한 자리로 줄였다 — 이 값은 그 시절 그대로가 맞다.
const CLUMPS_PER_BUILDING = 1;
/** 한 자리에서 **뽑는** 장수. 실제로 심는 건 PATCHES_PLANTED 장뿐이다 */
const PATCHES_PER_CLUMP = [2, 3];
/**
 * 그중 실제로 심는 장수. **1 = 겹쳐 심지 않는다 (2026-08-31).**
 *
 * 예전에는 뽑은 2~3장을 전부, 그것도 아래에서 반쯤 겹치게 흩뿌려 심었다.
 * "정사각 윤곽을 묻고 덩어리감을 살린다"는 계산이었고, 그건 v1 풀숲이
 * **높이 0.48 의 입체 풀더미**였을 때 맞는 얘기였다.
 *
 * v2 로 갈아타면서 풀숲은 `ground-flat/v2/grass-patch.glb` — **삼각형 2개짜리
 * 납작한 사각 데칼**이 됐다. 평면끼리 겹치면 정반대 결과가 나온다:
 *   ① 전부 y = TOP_Y 로 **높이가 완전히 같다**(top: 0 이라 배율과 무관). 바닥
 *      잔디는 polygonOffset 으로 뒤로 밀려 있지만 타일끼리는 서로 밀어내는
 *      장치가 없어, 겹친 부분이 z-파이팅으로 지글거린다.
 *   ② 텍스처가 두 겹 얹혀 겹친 데만 색이 진해진다.
 *   ③ 사각 윤곽이 묻히기는커녕 경계가 하나 더 는다.
 * 실제로 25장이 11개 무리에서 15쌍, 33~78% 씩 겹쳐 있었다(2026-08-31 사용자 보고).
 *
 * ── 왜 PATCHES_PER_CLUMP 를 [1, 1] 로 안 줄였나 ──────────────────────────────
 * rand() 는 씨앗 하나에서 **순서대로** 뽑는다. 뽑는 횟수를 줄이면 그 뒤 스트림이
 * 통째로 밀려서, 살아남아야 할 풀숲 13장까지 전부 다른 자리로 옮겨 간다(해 봤다).
 * 그래서 뽑기는 그대로 두고 **심기만** 끊는다 — 남는 13장은 좌표·배율·회전이
 * 예전과 한 글자도 다르지 않고, 겹쳐 있던 12장만 사라진다.
 *
 * 한 장이면 사각 윤곽은 한 겹으로 남는다. 그게 거슬리면 겹치기로 되돌릴 게
 * 아니라 풀숲을 빼고 3D 덤불·꽃밭(generate-decor-layout ⑨)에 자리를 넘기는
 * 쪽이 맞다.
 */
const PATCHES_PLANTED = 1;

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
      // 겹쳐 심던 시절의 흩뜨림. 지금은 n === 0 만 심으므로 늘 0 이다.
      const off = n === 0 ? 0 : 0.45 + rand() * 0.5;
      const dir = rand() * Math.PI * 2;
      const x = spot.x + Math.cos(dir) * off;
      const z = spot.z + Math.sin(dir) * off;
      // ── 아래 세 줄의 순서를 바꾸지 말 것 ────────────────────────────────
      // rand() 는 씨앗 하나에서 순서대로 뽑는다. plantable 이 막은 자리에서는
      // scale·rot 을 **원래 안 뽑았다** — 이 검사를 뒤로 미루면 뽑는 횟수가 늘어
      // 그 뒤 스트림이 통째로 밀리고, 남겨야 할 풀숲까지 다른 자리로 간다.
      if (!plantable(x, z)) continue;
      const scale = 0.62 + rand() * 0.5;
      const rot = rand() * Math.PI * 2;
      // 버리는 장도 뽑기까지는 똑같이 다 한 뒤에 버린다 (PATCHES_PLANTED 참고)
      if (n >= PATCHES_PLANTED) continue;
      clumps.push({x, z, scale, rot});
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
  // ─── 원반 테두리에 걸친 잔디 타일은 뺀다 ─────────────────────────────────
  // 타일은 1.88 정사각형(반대각 1.33)이라, 중심이 섬 안이어도 모서리가 둥근
  // 테두리 밖 물 위로 삐져나온다 — 부감에서 물에 뜬 초록 네모로 보인다.
  // 섬 위 잔디는 TerraceTops 의 원형 뚜껑이 이미 덮으므로 빼도 구멍이 없다.
  // 길 타일은 유지한다 — 문(계단·다리) 연결이 끊기면 안 되고, 걸친 부분은
  // 계단·다리 프롭이 가린다.
  if (chosen.kind === "grass") {
    let hang = false;
    for (const isl of ISLAND.values()) {
      const d = Math.hypot(worldX(i) - isl.x, worldZ(j) - isl.z);
      if (d <= isl.r && d + 1.33 > isl.r) {
        hang = true;
        break;
      }
    }
    if (hang) continue;
  }
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
