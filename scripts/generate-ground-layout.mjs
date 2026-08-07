// 마을 바닥(길·광장·앞마당·잔디)을 만들어 src/data/propsLayout.json 의 ground 프롭을 갱신한다.
//
// 사용법: node scripts/generate-ground-layout.mjs [--dry]
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

const LAYOUT = "src/data/propsLayout.json";
const dry = process.argv.includes("--dry");

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

// plaza-tile 은 정사각 슬래브가 아니라 실제 원반이다 (정점의 0%만 내접원 밖).
// scale 1 일 때 반지름이 이만큼이라, 앞마당 크기를 반지름으로 계산할 수 있다.
const PLAZA_RADIUS_AT_1 = 0.95;

// ─── 각 GLB의 로컬 방향 (텍스처를 XZ로 래스터화해 실측한 값) ──────────────────
// straight : 포장이 로컬 Z축을 따라 달린다        → 회전 0이면 남북
// t        : 로컬 −Z가 막힌 면, 나머지 3면이 열림 → 회전 0이면 북쪽이 막힘
// curve    : 로컬 −X 와 +Z 를 잇는 1/4 원호       → 회전 0이면 서–남
// cross/plaza : 회전 대칭
const T_ROT = {N: 0, W: Math.PI / 2, S: Math.PI, E: (3 * Math.PI) / 2};
const CURVE_ROT = {WS: 0, SE: Math.PI / 2, EN: Math.PI, NW: (3 * Math.PI) / 2};

// ─── 건물 (constants.ts 와 같은 계산으로 월드 좌표를 복원) ────────────────────
const SPREAD = 1.45;
const OFFSET = {
  plaza: [0, 0],
  projects: [-3, 0],
  skills: [0, -3],
  experience: [1.5, 2],
  life: [3, 0],
  study: [0, 3],
  contact: [0, 1]
};
const RAW_BUILDINGS = [
  ["central-plaza", "plaza", 0, 0, 2.6, 2.6],
  ["project-mystock", "projects", -7, -2, 1.9, 1.9],
  ["project-festflow", "projects", -7, 3, 2.2, 2.2],
  ["project-sign-language", "projects", -7, 6.5, 2.0, 2.0],
  ["project-aclub", "projects", -4, -6, 1.8, 1.8],
  ["project-ajou-adventure", "projects", -4, 8.5, 1.9, 1.9],
  ["project-ajouchong", "projects", -4, 11, 1.8, 1.8],
  ["project-muscleup", "projects", -7, 9.5, 1.8, 1.8],
  ["project-darklab", "projects", -10, 2, 1.9, 1.9],
  ["project-tserof", "projects", -10, 6, 1.7, 1.7],
  ["skill-frontend", "skills", -2.5, -6.5, 2.6, 2.2],
  ["skill-3d", "skills", 2.5, -6.5, 2.3, 2.3],
  ["skill-backend", "skills", 6, -4, 1.8, 1.8],
  ["skill-game", "skills", 6, 0.5, 2.1, 2.1],
  ["skill-workflow", "skills", 2.5, -3, 1.8, 1.6],
  ["exp-unity-ui", "experience", 7.2, 3, 1.7, 1.5],
  ["exp-demo-platform", "experience", 7.2, 6, 1.9, 1.7],
  ["exp-portfolio", "experience", 4.5, 7.8, 2.1, 1.9],
  ["life-values", "life", 7.5, -6.5, 1.3, 1.3],
  ["life-gym", "life", 10, -3.5, 2.2, 2.2],
  ["life-invest", "life", 11, 1, 1.8, 1.8],
  ["life-library", "life", 10, 5, 2.2, 2.2],
  ["life-music", "life", 11, 8.5, 2.0, 2.0],
  ["life-timeline", "life", 8.5, 8.5, 1.6, 1.6],
  ["study-codingtest", "study", -2.2, 11.5, 1.9, 1.9],
  ["study-cs", "study", 2.2, 11.5, 2.0, 2.0],
  ["post-office", "contact", 0, 8.5, 2.1, 1.9]
];
const buildings = RAW_BUILDINGS.map(([id, district, x, z, w, d]) => ({
  id,
  district,
  x: Math.round((x + OFFSET[district][0]) * SPREAD * 100) / 100,
  z: Math.round((z + OFFSET[district][1]) * SPREAD * 100) / 100,
  w,
  d
}));
// 중앙 광장은 앞마당 대신 큰 광장 한 장을 따로 깐다
const HUB = buildings.find(b => b.id === "central-plaza");
const OUTER = buildings.filter(b => b.id !== "central-plaza");

// ─── 격자 유틸 ────────────────────────────────────────────────────────────────
const key = (i, j) => `${i},${j}`;
const parse = k => k.split(",").map(Number);
const worldX = i => i * PITCH;
const worldZ = j => j * PITCH;

// 격자 범위 — 마을 전체를 여유 있게 덮는다
const I_MIN = -12;
const I_MAX = 12;
const J_MIN = -9;
const J_MAX = 13;
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
// 광장에서 네 방향. 나머지 길은 여기에 붙는다.
// [시작i, 시작j, 끝i, 끝j] 로 읽는 축 정렬 구간.
// 건물 열 사이의 빈 통로를 골라 남북 대로 / 동서 도로를 깐다. 건물에 걸리는 칸은
// addSegment가 알아서 건너뛰고, 그 자리는 앞마당 원반이 메우므로 길이 끊겨 보이지 않는다.
const TRUNKS = [
  // 광장에서 뻗는 두 축 — 마을의 등뼈
  [-10, 0, 10, 0], // 동서 대로 (프로젝트 ↔ Life)
  [0, -8, 0, 12], // 남북 대로 (스킬 ↔ 우체국 ↔ Study)

  // 프로젝트 구역 — 건물이 세 줄이라 그 사이 두 통로
  [-9, -2, -9, 7],
  [-3, -8, -3, 3],
  [-9, 6, -3, 6],
  [-9, -2, -3, -2],

  // 스킬 구역 — 북쪽 가로 바 + 동쪽 지선
  [-3, -6, 3, -6],
  [3, -8, 3, -3],
  [3, -3, 6, -3],

  // Life 구역 — 동쪽 세로 척추와 광장 연결
  [9, -6, 9, 8],
  [6, -6, 9, -6],

  // Experience 구역 — Life 척추에서 서쪽으로
  [4, 6, 9, 6],

  // Study 구역 — 남쪽 가로 바
  [-3, 12, 3, 12],
  [-3, 9, -3, 12]
];

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
const forecourts = OUTER.map(b => {
  const radius = Math.max(b.w, b.d) / 2 + 0.55;
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
// 중앙 광장도 마찬가지
const HUB_SCALE = 3.4;
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
    if (touchesDisc(i, j)) return false;
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
function pick(i, j) {
  const N = road.has(key(i, j - 1));
  const S = road.has(key(i, j + 1));
  const W = road.has(key(i - 1, j));
  const E = road.has(key(i + 1, j));
  const n = [N, S, W, E].filter(Boolean).length;

  if (n === 4) return {kind: "cross", rot: 0};
  if (n === 3) {
    const blockedSide = !N ? "N" : !S ? "S" : !W ? "W" : "E";
    return {kind: "t", rot: T_ROT[blockedSide]};
  }
  if (n === 2) {
    if (N && S) return {kind: "straight", rot: 0};
    if (W && E) return {kind: "straight", rot: Math.PI / 2};
    if (W && S) return {kind: "curve", rot: CURVE_ROT.WS};
    if (S && E) return {kind: "curve", rot: CURVE_ROT.SE};
    if (E && N) return {kind: "curve", rot: CURVE_ROT.EN};
    return {kind: "curve", rot: CURVE_ROT.NW}; // N && W
  }
  // 막다른 길 — 이어지는 쪽을 향해 직선을 놓는다. 이웃이 아예 없으면 버린다.
  if (n === 1) return {kind: "straight", rot: N || S ? 0 : Math.PI / 2};
  return null;
}

// ─── ⑤ 꽃밭 ──────────────────────────────────────────────────────────────────
// grass-patch 는 꽃이 섞인 잔디 슬래브다. 길 타일에는 이미 꽃 낀 잔디 갓길이
// 붙어 있어서 길가에 두면 겹쳐 보인다. 그래서 앞마당 원반 바로 바깥 고리에 깔아
// 건물을 두르는 화단으로 쓴다. 나중에 벤치·가로등을 놓을 자리이기도 하다.
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

// 건물 하나당 최대 몇 칸까지 화단을 두를지 — 다 두르면 원을 그려 인위적으로 보인다
const BEDS_PER_BUILDING = 1;
const grassCells = [];
{
  const taken = new Set();
  for (const f of forecourts) {
    const ring = [];
    const ci = Math.round(f.b.x / PITCH);
    const cj = Math.round(f.b.z / PITCH);
    for (let i = ci - 2; i <= ci + 2; i++) {
      for (let j = cj - 2; j <= cj + 2; j++) {
        const k = key(i, j);
        if (!inBounds(i, j) || road.has(k) || blocked.has(k) || taken.has(k))
          continue;
        const dist = Math.hypot(worldX(i) - f.b.x, worldZ(j) - f.b.z);
        // 원반 바깥이되 너무 멀지 않은 고리
        if (dist < f.radius + HALF || dist > f.radius + PITCH * 1.3) continue;
        // 다른 건물 원반이나 중앙 광장을 침범하면 안 된다
        const x = worldX(i);
        const z = worldZ(j);
        if (discs.some(d => Math.hypot(d.x - x, d.z - z) < d.r + HALF * 0.9))
          continue;
        ring.push(k);
      }
    }
    // 건물마다 고리에서 무작위로 골라, 화단이 한쪽으로 몰리지 않게 한다
    for (let n = ring.length - 1; n > 0; n--) {
      const m = Math.floor(rand() * (n + 1));
      [ring[n], ring[m]] = [ring[m], ring[n]];
    }
    for (const k of ring.slice(0, BEDS_PER_BUILDING)) {
      taken.add(k);
      grassCells.push(parse(k));
    }
  }
}

// ─── 출력 ─────────────────────────────────────────────────────────────────────
const round3 = v => Math.round(v * 1000) / 1000;
const props = [];
const counts = {};
const bump = k => {
  counts[k] = (counts[k] ?? 0) + 1;
};

// 중앙 광장
props.push({
  id: "ground-plaza-center",
  glb: TILE.plaza.glb,
  position: [HUB.x, round3(TOP_Y - TILE.plaza.top * HUB_SCALE), HUB.z],
  rotationY: 0,
  scale: HUB_SCALE
});
bump("plaza");

// 건물 앞마당
for (const f of forecourts) {
  props.push({
    id: `ground-yard-${f.b.id}`,
    glb: TILE.plaza.glb,
    position: [f.b.x, round3(TOP_Y - TILE.plaza.top * f.scale), f.b.z],
    rotationY: 0,
    scale: f.scale
  });
  bump("plaza");
}

// 길
for (const k of [...road].sort()) {
  const [i, j] = parse(k);
  const chosen = pick(i, j);
  if (!chosen) continue;
  const spec = TILE[chosen.kind];
  bump(chosen.kind);
  props.push({
    id: `ground-${i}_${j}`,
    glb: spec.glb,
    position: [round3(worldX(i)), round3(TOP_Y - spec.top), round3(worldZ(j))],
    rotationY: Math.round(chosen.rot * 10000) / 10000,
    scale: 1
  });
}

// 잔디 덤불 — 크기·각도를 흩어야 복제 티가 안 난다
for (const [i, j] of grassCells) {
  bump("grass");
  props.push({
    id: `ground-grass-${i}_${j}`,
    glb: TILE.grass.glb,
    position: [
      round3(worldX(i)),
      round3(TOP_Y - TILE.grass.top),
      round3(worldZ(j))
    ],
    rotationY: round3(Math.floor(rand() * 4) * (Math.PI / 2)),
    scale: round3(0.85 + rand() * 0.35)
  });
}

// ─── 기존 레이아웃에 병합 ─────────────────────────────────────────────────────
const layout = JSON.parse(readFileSync(LAYOUT, "utf8"));
const kept = (layout.props ?? []).filter(p => !p.id.startsWith("ground-"));
layout.props = [...kept, ...props];

const tris = Object.entries(counts).reduce(
  (sum, [k, v]) => sum + TILE[k].tris * v,
  0
);
console.log(
  `격자 간격 ${PITCH}  ·  윗면 높이 ${TOP_Y}  ·  바닥 프롭 ${props.length}장`
);
console.log(
  "  종류별:",
  Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ")
);
console.log(
  `  앞마당에 먹혀 뺀 길 칸: ${swallowed}개  ·  막다른 길로 깎은 칸: ${pruned}개`
);
console.log(
  `  길이 안 닿은 건물: ${unreachable.length ? unreachable.join(", ") : "없음"}`
);
console.log(`  ground 외 프롭 ${kept.length}개는 그대로 유지`);
console.log(`  예상 삼각형 합계 약 ${(tris / 1000).toFixed(0)}k`);

if (dry) {
  console.log("\n--dry 라서 파일은 쓰지 않았습니다.");
} else {
  writeFileSync(LAYOUT, JSON.stringify(layout, null, 2) + "\n");
  console.log(`\n${LAYOUT} 갱신 완료`);
}
