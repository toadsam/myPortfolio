// 장식물(간판·가로등·분수·벤치…)을 마을에 배치한다.
//
// generate-ground-layout.mjs 가 `ground-*` 프롭을 통째로 다시 쓰듯, 이 스크립트는
// `decor-*` 프롭만 다시 쓴다. 서로의 결과를 건드리지 않으므로 순서 상관없이
// 따로 돌려도 된다. 다만 길 위치를 바닥 레이아웃에서 읽으므로, 길을 새로 깐
// 다음에는 이쪽도 한 번 돌려야 가로등이 길을 따라간다.
//
// 사용법: node scripts/generate-decor-layout.mjs [--dry]

import {readFileSync, writeFileSync, existsSync} from "node:fs";
import {readVillage, readPositions, districtCenters} from "./lib/read-village.mjs";

const LAYOUT = "src/data/propsLayout.json";
const DRY = process.argv.includes("--dry");

// ─── 규격 ─────────────────────────────────────────────────────────────────────
// Meshy는 뭘 뽑든 높이 1.9 유닛으로 정규화해서 내보낸다. 그대로 놓으면 우편함이
// 건물만 하다. 그래서 물건마다 "실제로 몇 미터짜리인가"를 정하고 마을 축척으로
// 환산한다 — 랜드마크 건물(3.1유닛)을 4층으로 보면 1유닛 ≈ 2.5m 이고,
// 캐릭터 0.8유닛이 1.7m 다.
const UNITS_PER_METER = 1 / 2.5;

// glb: 파일 경로 · h: 원본 GLB 높이(실측) · m: 실물 기준 높이(미터)
// 원본 높이는 bake-prop 으로 잰 값. 모델을 다시 뽑으면 여기도 고쳐야 한다.
const KIT = {
  "sign-study": {glb: "signs/sign-study.glb", h: 1.894, m: 2.6},
  "sign-projects": {glb: "signs/sign-projects.glb", h: 1.897, m: 2.6},
  "sign-skills": {glb: "signs/sign-skills.glb", h: 1.898, m: 2.6},
  "sign-experience": {glb: "signs/sign-experience.glb", h: 1.896, m: 2.6},
  "sign-plaza": {glb: "signs/sign-plaza.glb", h: 1.898, m: 2.6},
  "sign-contact": {glb: "signs/sign-contact.glb", h: 1.897, m: 2.6},
  "sign-theme-project": {glb: "signs/sign-theme-project.glb", h: 1.899, m: 1.9},

  "lantern-post": {glb: "decor/lantern-post.glb", h: 1.894, m: 3.0},
  "lantern-archway": {glb: "decor/lantern-archway.glb", h: 1.741, m: 3.0},
  "gate-arch": {glb: "decor/gate-arch.glb", h: 1.38, m: 2.4},
  "notice-board": {glb: "decor/notice-board.glb", h: 1.697, m: 2.0},
  fountain: {glb: "decor/fountain.glb", h: 1.151, m: 2.2},
  well: {glb: "decor/well.glb", h: 1.9, m: 2.5},
  "lantern-bearer": {glb: "decor/lantern-bearer.glb", h: 1.899, m: 2.2},
  "market-stall": {glb: "decor/market-stall.glb", h: 1.847, m: 2.5},
  "stump-forge": {glb: "decor/stump-forge.glb", h: 1.898, m: 1.3},
  campfire: {glb: "decor/campfire.glb", h: 1.279, m: 0.8},
  "lute-picnic": {glb: "decor/lute-picnic.glb", h: 0.946, m: 0.6},
  mailbox: {glb: "decor/mailbox.glb", h: 1.899, m: 1.5},
  bench: {glb: "decor/bench.glb", h: 1.122, m: 0.9},
  "barrel-iron": {glb: "decor/barrel-iron.glb", h: 1.898, m: 0.9},
  "scroll-barrel": {glb: "decor/scroll-barrel.glb", h: 1.897, m: 1.0},
  // 책·촛불은 실물대로 하면 0.2유닛짜리 소품이라 잔디에 묻힌다.
  // 학습 지구의 표지 구실을 하도록 일부러 키운다.
  "candle-tome": {glb: "decor/candle-tome.glb", h: 1.898, m: 1.1},
  "flower-pot": {glb: "decor/flower-pot.glb", h: 1.894, m: 0.7},
  "orb-lantern": {glb: "decor/orb-lantern.glb", h: 1.899, m: 0.7},
  "leaf-banner": {glb: "decor/leaf-banner.glb", h: 1.898, m: 2.8},
  fence: {glb: "decor/fence.glb", h: 0.944, m: 1.1},
  bunting: {glb: "decor/bunting.glb", h: 0.489, m: 0.8},

  // 나무·바위. 예전엔 VillageScene 이 절차적으로 그린 네온 콘과 검은 다면체였는데,
  // 마을이 따뜻한 스타일로 바뀌면서 혼자 사이버펑크로 남아 겉돌았다.
  // 자리(treePositions / rockPositions)는 오래 다듬은 값이라 그대로 쓴다.
  // 마을 **안쪽** 나무는 4.5~5.0 에서 3.6~4.0 으로 낮췄다. 건물 중앙값이 2.14유닛
  // 이던 시절엔 나무가 건물의 2.3배라 마을이 "숲에 놓인 모형"으로 보였다.
  // 건물을 키우고(constants.ts size ×1.32) 나무를 낮춰 1.4배쯤으로 맞춘다.
  // 테두리 숲(far-*)은 그대로 둔다 — 그쪽은 마을을 가리는 벽이라 클수록 좋다.
  "tree-golden-canopy": {glb: "nature/tree-golden-canopy.glb", h: 1.743, m: 3.6},
  "tree-emerald-crown": {glb: "nature/tree-emerald-crown.glb", h: 1.897, m: 4.0},
  "tree-sakura": {glb: "nature/tree-sakura.glb", h: 1.809, m: 3.6},
  "flower-bed": {glb: "nature/tree-petal-parade.glb", h: 0.877, m: 0.8},
  "berry-bush": {glb: "nature/bush-emerald-berry.glb", h: 1.137, m: 1.3},
  boulder: {glb: "nature/rock-verdant-boulder.glb", h: 1.281, m: 1.7},
  stones: {glb: "nature/rock-three-stones.glb", h: 0.784, m: 0.9},

  // ─── 멀리 세울 대역 모델 ────────────────────────────────────────────────────
  // scripts/bake-impostors.mjs 가 구운 교차 빌보드. 그루당 4삼각형이라 백 그루를
  // 심어도 400이다 — 원본 나무 한 그루가 8,932인 걸 생각하면 사실상 공짜다.
  // 원본과 같은 좌표계·같은 bbox 중심으로 구웠으므로 h·m 을 원본과 똑같이 적으면
  // scaleOf/liftOf 가 그대로 맞는다 (h는 raw 원본 실측값).
  //
  // 캐릭터가 걸어 들어가는 자리(앞마당·길가·광장)에는 쓰지 않는다. 바로 밑에서
  // 올려다보면 판때기 두 장인 게 보인다. 마을 테두리 숲과 먼 빈 잔디 전용.
  "far-oak": {glb: "impostor/tree-golden-canopy.glb", h: 1.746, m: 5.4},
  "far-pine": {glb: "impostor/tree-emerald-crown.glb", h: 1.897, m: 6.6},
  "far-sakura": {glb: "impostor/tree-sakura.glb", h: 1.809, m: 5.0},
  "far-bush": {glb: "impostor/bush-emerald-berry.glb", h: 1.137, m: 1.6}
};

// ─── 난수·잡음 ────────────────────────────────────────────────────────────────
// 매번 같은 마을이 나와야 diff가 안 튄다. 시드 난수를 쓴다.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260809);

// 부드러운 값 잡음. 숲을 균일한 확률로 뿌리면 "점묘 같은 나무밭"이 되지만,
// 잡음으로 확률을 흔들면 빽빽한 덤불과 트인 공터가 생겨 숲처럼 읽힌다.
function hash2(i, j) {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const smooth = (t) => t * t * (3 - 2 * t);
function noise2(x, z) {
  const i = Math.floor(x), j = Math.floor(z);
  const fx = smooth(x - i), fz = smooth(z - j);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
}

// ─── 볼록 껍질 ────────────────────────────────────────────────────────────────
// "마을 안쪽 빈터"와 "마을 바깥"을 가르는 선. 안쪽 공터는 정원처럼 성기게 꾸미고,
// 바깥은 숲으로 두른다. 둘을 안 가르면 마을 한복판에 숲이 들어선다.
function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...half(pts), ...half(pts.reverse())];
}

/** 점이 다각형 안인가 (반직선 교차) */
function inPolygon(poly, x, z) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** 다각형 경계까지의 거리 (안이면 음수) */
function polygonDistance(poly, x, z) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    const dx = xj - xi, dz = zj - zi;
    const len2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - xi) * dx + (z - zi) * dz) / len2));
    best = Math.min(best, Math.hypot(x - (xi + dx * t), z - (zi + dz * t)));
  }
  return inPolygon(poly, x, z) ? -best : best;
}

const round3 = (v) => Math.round(v * 1000) / 1000;
const scaleOf = (kind) => round3((KIT[kind].m * UNITS_PER_METER) / KIT[kind].h);

// Meshy 모델은 원점이 bbox 한가운데다(바닥 y ≈ −0.95). InstancedProps 는 position 에
// GLB 원점을 그대로 놓으므로, 바닥 오프셋만큼 올려야 땅에 선다. 안 올리면 절반이 묻힌다.
// 원본 높이의 절반이 곧 바닥까지의 거리다(모든 모델이 y 대칭으로 나온다).
const liftOf = (kind) => round3((KIT[kind].h / 2) * scaleOf(kind));

/** 정면(+Z 기준)이 (dx,dz) 방향을 보도록 하는 회전각 */
const faceTo = (dx, dz) => round3(Math.atan2(dx, dz));

// ─── 마을 읽기 ────────────────────────────────────────────────────────────────
const {buildings} = readVillage();
const layout = JSON.parse(readFileSync(LAYOUT, "utf8"));

const HUB = buildings.find((b) => b.id === "central-plaza");
const OUTER = buildings.filter((b) => b.id !== "central-plaza");
const centers = districtCenters(OUTER);

// 앞마당 원반 — generate-ground-layout.mjs 와 같은 식이어야 한다.
// 어긋나면 장식물이 원반 위에 올라타므로, 실제로 깔린 타일과 대조해 검산한다.
const PLAZA_RADIUS_AT_1 = 0.95;
// generate-ground-layout.mjs 의 FORECOURT_DRAW 와 같은 값이어야 한다.
// 바로 아래 가드가 어긋나면 잡아 준다 — 실제로 원반을 줄일 때 여기서 걸렸다.
const FORECOURT_DRAW = 0.77;
const discs = OUTER.map((b) => ({x: b.x, z: b.z, r: (Math.max(b.w, b.d) / 2 + 0.55) * FORECOURT_DRAW}));
{
  const yards = new Map(
    layout.props
      .filter((p) => p.id.startsWith("ground-yard-"))
      .map((p) => [p.id.slice("ground-yard-".length), p.scale * PLAZA_RADIUS_AT_1])
  );
  for (const b of OUTER) {
    const actual = yards.get(b.id);
    const mine = (Math.max(b.w, b.d) / 2 + 0.55) * FORECOURT_DRAW;
    if (actual !== undefined && Math.abs(actual - mine) > 0.02)
      throw new Error(
        `앞마당 반지름이 바닥 레이아웃과 어긋납니다 (${b.id}: 여기 ${mine.toFixed(2)} vs 타일 ${actual.toFixed(2)}).\n` +
          `  generate-ground-layout.mjs 의 식이 바뀌었다면 이 파일의 discs 계산도 맞춰주세요.`
      );
  }
}
const HUB_DISC = layout.props.find((p) => p.id === "ground-plaza-center");
const HUB_RADIUS = (HUB_DISC?.scale ?? 4.84) * PLAZA_RADIUS_AT_1;

// 길 — 바닥 레이아웃에 깔린 길 타일이 곧 길이다
const roads = layout.props
  .filter((p) => p.glb.includes("/path-"))
  .map((p) => ({x: p.position[0], z: p.position[2]}));
if (roads.length < 20) throw new Error(`길 타일을 ${roads.length}장밖에 못 찾았습니다 — 먼저 바닥을 생성하세요`);

// 타일 간격 — 가장 가까운 두 타일 사이 거리
const PITCH = round3(
  Math.min(
    ...roads.slice(0, 40).flatMap((a, i) =>
      roads.slice(0, 40).filter((_, j) => j !== i).map((b) => Math.hypot(a.x - b.x, a.z - b.z))
    )
  )
);
/** 포장 폭의 절반 + 여유 — 이만큼 비켜야 길 위에 안 선다 */
const ROAD_SIDE = round3(PITCH * 0.33);
const HALF_TILE = round3(PITCH / 2);

const onRoad = (x, z, slack = 0) =>
  roads.some((r) => Math.abs(r.x - x) < ROAD_SIDE + slack && Math.abs(r.z - z) < ROAD_SIDE + slack);
const onDisc = (x, z, slack = 0) =>
  discs.some((d) => Math.hypot(d.x - x, d.z - z) < d.r + slack) ||
  Math.hypot(HUB.x - x, HUB.z - z) < HUB_RADIUS + slack;
const onBuilding = (x, z, slack = 0) =>
  buildings.some((b) => Math.abs(b.x - x) < b.w / 2 + slack && Math.abs(b.z - z) < b.d / 2 + slack);

const props = [];
const taken = [];
/** 이미 놓은 장식물과 겹치지 않는가 */
const free = (x, z, gap) => !taken.some((t) => Math.hypot(t.x - x, t.z - z) < gap);

// ─── 걸어 다니는 구역 ─────────────────────────────────────────────────────────
// CharacterController 는 캐릭터를 x ±11.5 / z −8.8~12.5 안에 가둔다. 3인칭 카메라는
// 그 뒤 5.5·높이 3.8 이라, 이 안에서는 눈높이에서 물건을 코앞에 두고 본다.
// 빌보드는 그 각도에서 바로 들통난다 — 십자의 옆날이 판때기로 보인다(실제로 봤다).
// 그래서 이 안에서는 대역 모델을 쓰지 않고 원본으로 바꿔 심는다.
const WALK = {x: 13.5, z0: -11, z1: 15};
const inWalkZone = (x, z) => Math.abs(x) < WALK.x && z > WALK.z0 && z < WALK.z1;
// 대역 모델 → 원본 대응표. null 이면 아예 심지 않는다.
// 덤불만 null 인 이유: 원본이 13,514 삼각형이라(잎마다 UV 섬이라 simplify가 안 먹는다)
// 걸어 다니는 구역 안 30그루를 원본으로 바꿨더니 그것만 40만이 됐다. 게다가 이
// 구역은 광장이라 벤치·화분·가로등·분수로 이미 꽉 차 있어 덤불이 없어도 안 휑하다.
const REAL_OF = {
  "far-oak": "tree-golden-canopy",
  "far-pine": "tree-emerald-crown",
  "far-sakura": "tree-sakura",
  "far-bush": null
};
/** 덤불 자리를 대신 채울 것 — 원본이라도 2~3천이라 부담이 없고 입체감이 산다.
 *  걸어 다니는 구역은 카메라가 가장 오래 머무는 데라, 종류를 늘려 같은 물건이
 *  반복되는 티를 지운다. 전부 decor/ 폴더라 simplify가 잘 먹은 것들이다. */
const BUSH_STANDIN = ["boulder", "stones", "flower-pot", "bench", "barrel-iron", "stones", "flower-pot"];
let promoted = 0;
let dropped = 0;
function kindFor(kind, x, z) {
  if (!(kind in REAL_OF) || !inWalkZone(x, z)) return kind;
  if (REAL_OF[kind] === null) {
    // 전부 빼 버리면 광장 앞 잔디가 휑해진다. 처음엔 셋에 하나(0.36)만 남겼는데,
    // 실측해 보니 장식물 901개 중 걸어 다니는 구역 안에 있는 건 163개뿐이었다 —
    // 바깥 숲은 빽빽한데 정작 카메라가 사는 안쪽이 비어 있었다. 대부분 바꿔 심는다.
    if (rand() < 0.78) {
      promoted += 1;
      return BUSH_STANDIN[Math.floor(rand() * BUSH_STANDIN.length)];
    }
    dropped += 1;
    return null;
  }
  promoted += 1;
  return REAL_OF[kind];
}

// grow: 크기 배수. 같은 GLB를 수십 그루 심을 땐 이걸 흔들어야 복제 티가 안 난다.
// 띄우는 높이도 같은 배수로 커져야 발밑이 땅에 붙는다.
function place(id, rawKind, x, z, rotationY = 0, {grow = 1} = {}) {
  const kind = kindFor(rawKind, x, z);
  if (kind === null) return false;
  props.push({
    id: `decor-${id}`,
    glb: `/models/props/${KIT[kind].glb}`,
    position: [round3(x), round3(liftOf(kind) * grow), round3(z)],
    rotationY,
    scale: round3(scaleOf(kind) * grow)
  });
  taken.push({x, z});
  return true;
}

/** 길·건물·원반·기존 장식물을 피해 (x,z) 근처에서 빈자리를 찾는다 */
function findSpot(x, z, {gap = 0.9, radius = 2.4, avoidRoad = true} = {}) {
  for (let ring = 0; ring <= 6; ring++) {
    const dist = (ring / 6) * radius;
    const steps = ring === 0 ? 1 : 8 + ring * 4;
    for (let a = 0; a < steps; a++) {
      const angle = (a / steps) * Math.PI * 2 + ring * 0.37;
      const px = x + Math.cos(angle) * dist;
      const pz = z + Math.sin(angle) * dist;
      if (avoidRoad && onRoad(px, pz, 0.35)) continue;
      if (onDisc(px, pz, 0.15)) continue;
      if (onBuilding(px, pz, 0.7)) continue;
      if (!free(px, pz, gap)) continue;
      return {x: px, z: pz};
    }
  }
  return null;
}

const skipped = [];
function tryPlace(id, kind, x, z, rotationY = 0, opts = {}) {
  const spot = findSpot(x, z, opts);
  if (!spot) {
    skipped.push(id);
    return false;
  }
  return place(id, kind, spot.x, spot.z, rotationY, opts);
}

// ─── ① 지구 간판 ──────────────────────────────────────────────────────────────
// 마을 중앙에서 지구로 들어가는 길목에 세운다. 광장에서 걸어 나오는 사람이
// 정면으로 읽도록 판을 중앙 쪽으로 돌린다.
const SIGN_OF = {
  study: "sign-study",
  projects: "sign-projects",
  skills: "sign-skills",
  experience: "sign-experience",
  contact: "sign-contact"
};

for (const [district, kind] of Object.entries(SIGN_OF)) {
  const c = centers[district];
  if (!c) continue;
  const len = Math.hypot(c.x, c.z) || 1;
  const dir = {x: c.x / len, z: c.z / len}; // 광장 → 지구 방향

  // 지구로 가는 길 중 광장 쪽에 있는 칸을 고른다
  const approach = roads
    .filter((r) => Math.hypot(r.x, r.z) < len - PITCH)
    .sort(
      (a, b) =>
        Math.hypot(a.x - c.x, a.z - c.z) - Math.hypot(b.x - c.x, b.z - c.z)
    )[0];
  if (!approach) continue;

  // 길 옆으로 비켜 세운다
  const perp = {x: -dir.z, z: dir.x};
  const side = ROAD_SIDE + 0.55;
  const x = approach.x + perp.x * side;
  const z = approach.z + perp.z * side;
  // 판이 광장 쪽(-dir)을 보게
  place(`sign-${district}`, kind, x, z, faceTo(-dir.x, -dir.z), {gap: 1.2});

  // 간판 좌우로 황금잎 깃대 한 쌍 — 지구 입구가 의식을 갖춘 문처럼 보인다.
  // 깃대는 폭이 0.45라 길과 간판 사이 좁은 틈에도 들어간다.
  for (const along of [-1, 1]) {
    const bx = x + dir.x * along * 1.35;
    const bz = z + dir.z * along * 1.35;
    if (onRoad(bx, bz, 0.2) || onBuilding(bx, bz, 0.4)) continue;
    place(`banner-${district}-${along > 0 ? "far" : "near"}`, "leaf-banner", bx, bz,
      faceTo(-dir.x, -dir.z), {gap: 0.6});
  }
}

// 중앙 광장 간판은 원반 남쪽 가장자리에서 바깥(남)을 본다
place("sign-plaza", "sign-plaza", HUB.x, HUB.z + HUB_RADIUS + 0.7, faceTo(0, 1), {gap: 1.2});

// ─── ② 지구별 랜드마크 ────────────────────────────────────────────────────────
// 지구 성격에 맞는 물건을 지구 중심 근처 빈자리에 놓는다.
const LANDMARKS = {
  study: ["candle-tome", "notice-board"],
  projects: ["market-stall", "sign-theme-project"],
  skills: ["stump-forge"],
  experience: ["scroll-barrel", "barrel-iron"],
  life: ["campfire", "lute-picnic", "bench"],
  contact: ["mailbox"]
};

for (const [district, kinds] of Object.entries(LANDMARKS)) {
  const c = centers[district];
  if (!c) continue;
  for (const kind of kinds) {
    // 지구 안쪽을 보도록 — 광장에서 온 사람 쪽으로 정면을 돌린다
    const len = Math.hypot(c.x, c.z) || 1;
    tryPlace(`${district}-${kind}`, kind, c.x, c.z, faceTo(-c.x / len, -c.z / len), {
      gap: 1.4,
      radius: 4.5
    });
  }
}

// 광장 랜드마크 — 원반 바로 바깥에 분수·우물·석상을 삼각형으로
const PLAZA_RING = [
  {kind: "fountain", angle: -Math.PI / 2},
  {kind: "well", angle: Math.PI / 6},
  {kind: "lantern-bearer", angle: (Math.PI * 5) / 6}
];
for (const {kind, angle} of PLAZA_RING) {
  const dist = HUB_RADIUS + 1.5;
  const x = HUB.x + Math.cos(angle) * dist;
  const z = HUB.z + Math.sin(angle) * dist;
  // 광장 안쪽을 본다
  tryPlace(`plaza-${kind}`, kind, x, z, faceTo(HUB.x - x, HUB.z - z), {gap: 1.6, radius: 2.0});
}

// ─── ③ 마을 어귀 ──────────────────────────────────────────────────────────────
// 길의 끝은 지금 풀밭에서 그냥 뚝 끊긴다. 끝마다 문을 세우면 "여기서 마을이
// 끝난다"가 읽혀서 마을에 테두리가 생긴다.
//
// 끝 칸 = 이웃한 길 칸이 하나뿐인 칸. 그중 광장에서 먼 순으로 고른다.
/** 어귀 위치 — 울타리를 여기 길가에 세운다 */
const gates = [];
{
  const isRoad = (x, z) => roads.some((r) => Math.abs(r.x - x) < 0.05 && Math.abs(r.z - z) < 0.05);
  const ends = roads
    .map((r) => {
      const around = [[PITCH, 0], [-PITCH, 0], [0, PITCH], [0, -PITCH]].filter(([dx, dz]) =>
        isRoad(r.x + dx, r.z + dz)
      );
      return {r, around};
    })
    .filter((e) => e.around.length === 1)
    .sort((a, b) => Math.hypot(b.r.x, b.r.z) - Math.hypot(a.r.x, a.r.z));

  ends.slice(0, 5).forEach((e, n) => {
    // 이웃이 있는 쪽이 마을 안쪽 — 문은 그 반대(바깥)를 향해 길을 가로막는다
    const [ix, iz] = e.around[0];
    const inward = {x: ix / PITCH, z: iz / PITCH};
    // 가장 먼 끝은 랜턴 아치(정문), 나머지는 나무 대문. 다섯을 넘기면 감옥처럼 보인다.
    const kind = n === 0 ? "lantern-archway" : "gate-arch";
    place(`gate-${n}`, kind, e.r.x - inward.x * HALF_TILE, e.r.z - inward.z * HALF_TILE,
      faceTo(inward.x, inward.z), {gap: 0.1});
    gates.push({at: e.r, inward});
  });
}

// ─── ④ 길 따라 가로등 ─────────────────────────────────────────────────────────
// 길 칸을 일정 간격으로 건너뛰며 좌우 번갈아 세운다.
//
// 3칸(5.6유닛)마다 세웠더니 마을 전체에 10개뿐이었다. 컨셉 아트는 길마다
// 가로등·깃대·배너가 촘촘히 서서 화면에 **수직 리듬**을 준다 — 우리는 전부
// 납작해서 시선이 미끄러졌다. 2칸(3.8유닛)이면 걷는 눈높이에서 하나가 지나가면
// 다음 게 들어온다. 가로등 하나가 1,780 삼각형이고 인스턴싱이라 draw call 은 그대로다.
const LANTERN_EVERY = 2;
{
  const sorted = roads
    .slice()
    .sort((a, b) => a.z - b.z || a.x - b.x);
  let n = 0;
  for (let i = 0; i < sorted.length; i += LANTERN_EVERY) {
    const r = sorted[i];
    // 이 칸의 길 방향 — 이웃 칸이 어느 쪽에 있는지로 판단
    const hasWE = sorted.some((o) => Math.abs(o.z - r.z) < 0.1 && Math.abs(Math.abs(o.x - r.x) - PITCH) < 0.1);
    const perp = hasWE ? {x: 0, z: 1} : {x: 1, z: 0};
    const sign = n % 2 === 0 ? 1 : -1;
    const side = ROAD_SIDE + 0.42;
    const x = r.x + perp.x * side * sign;
    const z = r.z + perp.z * side * sign;
    if (onDisc(x, z, 0.1) || onBuilding(x, z, 0.5) || !free(x, z, 2.2)) continue;
    place(`lantern-${n}`, "lantern-post", x, z, 0, {gap: 2.2});
    n += 1;
  }
}

// ─── ⑤ 앞마당 화분·벤치 ───────────────────────────────────────────────────────
// 건물 앞마당 원반 가장자리에 소품을 둘러 사람이 사는 티를 낸다.
// 광장을 향한 쪽을 중심으로 네 자리. 두 자리만 두면 큰 원반이 여전히 휑하고,
// 원반을 빙 두르면 완전한 원이 그려져 인위적으로 보이므로 앞쪽 반원만 쓴다.
//
// 여긴 캐릭터가 다가서는 자리라 전부 원본 GLB다 — 빌보드는 숲 몫이다.
{
  let n = 0;
  // 자리를 넷으로 늘렸다가 되돌렸다. 앞마당 소품은 캐릭터가 코앞에서 보는
  // 자리라 원본 GLB를 써야 하는데, 화분 하나가 5,156 삼각형이다. 건물 26채에
  // 넷씩이면 화분만 33개 = 17만으로 마을 예산의 6분의 1을 앞마당이 먹었다.
  // 셋이면 원반이 충분히 차면서 값은 4분의 1이 준다.
  const ROTATION = ["bench", "flower-pot", "orb-lantern", "barrel-iron", "orb-lantern", "flower-pot"];
  for (const [index, b] of OUTER.entries()) {
    const disc = discs[index];
    // 광장 반대편(건물 뒤)이 아니라, 광장을 향한 쪽에 둔다
    const len = Math.hypot(b.x, b.z) || 1;
    const inward = {x: -b.x / len, z: -b.z / len};
    const base = Math.atan2(inward.z, inward.x);
    for (const [slot, swing] of [0.6, -0.6, 1.45].entries()) {
      const angle = base + swing;
      const dist = disc.r + 0.5;
      const x = b.x + Math.cos(angle) * dist;
      const z = b.z + Math.sin(angle) * dist;
      if (onRoad(x, z, 0.3) || onBuilding(x, z, 0.4) || !free(x, z, 1.1)) continue;
      const kind = ROTATION[(index * 3 + slot) % ROTATION.length];
      place(`yard-${n}`, kind, x, z, faceTo(b.x - x, b.z - z), {grow: 0.92 + rand() * 0.2});
      n += 1;
    }
  }
}

// ─── ⑥ 광장 위 삼각깃발 ───────────────────────────────────────────────────────
// 광장 둘레를 따라 접선 방향으로 걸어 축제 분위기를 낸다. 가로등 꼭대기(1.2유닛)
// 언저리에 띄워야 줄에 매달린 것처럼 읽힌다 — 낮게 걸면 허공에 뜬 천이 된다.
{
  const SPANS = 8;
  const height = 1.25;
  const radius = HUB_RADIUS + 0.9;
  for (let n = 0; n < SPANS; n++) {
    const angle = (n / SPANS) * Math.PI * 2 + Math.PI / SPANS;
    const x = HUB.x + Math.cos(angle) * radius;
    const z = HUB.z + Math.sin(angle) * radius;
    if (onBuilding(x, z, 0.3)) continue;
    // 접선 방향으로 눕힌다 (반지름 방향 + 90°)
    props.push({
      id: `decor-bunting-${n}`,
      glb: `/models/props/${KIT.bunting.glb}`,
      position: [round3(x), round3(height), round3(z)],
      rotationY: faceTo(Math.cos(angle), Math.sin(angle)),
      scale: scaleOf("bunting")
    });
    taken.push({x, z});
  }
}

// ─── ⑦ 어귀 울타리 ────────────────────────────────────────────────────────────
// 처음엔 길가 아무 데나 세 칸씩 흩어 놨더니, 허허벌판에 널빤지 토막이 굴러다니는
// 꼴이라 오히려 지저분했다. 울타리는 "여기가 경계다"를 말할 때만 쓸모가 있다.
// 그래서 문 옆에만, 길 양옆으로 나란히 세워 진입로를 만든다.
{
  const width = round3(1.899 * scaleOf("fence"));
  const PER_SIDE = 4;
  let n = 0;
  for (const gate of gates) {
    // 문에서 마을 안쪽으로 뻗는 방향
    const along = gate.inward;
    const perp = {x: -along.z, z: along.x};
    for (const side of [1, -1]) {
      for (let k = 0; k < PER_SIDE; k++) {
        // 문 바로 옆(k=0)부터 안쪽으로. 길 폭 밖으로 비켜 세운다.
        const dist = HALF_TILE * 0.6 + k * width;
        const x = gate.at.x + along.x * dist + perp.x * (ROAD_SIDE + 0.42) * side;
        const z = gate.at.z + along.z * dist + perp.z * (ROAD_SIDE + 0.42) * side;
        if (onRoad(x, z, 0.1) || onDisc(x, z, 0.2) || onBuilding(x, z, 0.4) || !free(x, z, 0.7)) break;
        // 판이 길 쪽을 보게 — 울타리 결이 길과 나란해진다
        place(`fence-${n++}`, "fence", x, z, faceTo(perp.x * -side, perp.z * -side), {gap: 0.7});
      }
    }
  }
}

// ─── ⑧ 나무·바위 ──────────────────────────────────────────────────────────────
// constants.ts 의 좌표를 그대로 쓰되, 종류는 좌표에서 결정해 같은 자리엔 늘 같은
// 나무가 서게 한다. 벚나무는 드물어야 눈에 띄므로 다섯 그루에 하나 꼴로만 둔다.
{
  const TREES = ["tree-golden-canopy", "tree-emerald-crown", "tree-golden-canopy", "tree-sakura", "tree-emerald-crown"];
  readPositions("treePositions").forEach((p, n) => {
    const kind = TREES[n % TREES.length];
    // 회전을 그루마다 흩뜨려야 같은 GLB를 19번 쓴 티가 안 난다
    place(`tree-${n}`, kind, p[0], p[2], round3(((n * 137) % 360) * (Math.PI / 180)), {gap: 0.1});
  });

  readPositions("rockPositions").forEach((p, n) => {
    place(`rock-${n}`, n % 2 === 0 ? "boulder" : "stones", p[0], p[2],
      round3(((n * 97) % 360) * (Math.PI / 180)), {gap: 0.1});
  });
}

// ─── ⑨ 꽃밭·덤불 ──────────────────────────────────────────────────────────────
// 잔디만 깔린 빈 구석에 색을 넣는다. 꽃밭은 1만 삼각형, 덤불은 1만 3천이라
// (잎사귀마다 UV 섬이 있어 simplify가 거의 안 먹는다) 개수를 아껴 쓴다.
//
// 예전엔 여기서 13개를 깔아 15만 삼각형을 썼다. "빈 구석 채우기"는 이제 ⑪ 빈터가
// 빌보드로 훨씬 싸게 하므로, 여기는 광장에서 가장 가까운 몇 채에만 남긴다 —
// 카메라가 오래 머무는 자리에는 진짜 입체가 서 있어야 한다.
{
  const FLOWERS = 2;
  const BUSHES = 2;
  let n = 0;
  // 광장에서 가까운 순으로 — 눈길이 가장 오래 머무는 데부터 채운다
  const spots = OUTER.slice()
    .sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z))
    .map((b, i) => ({b, i}));

  for (const {b, i} of spots) {
    if (n >= FLOWERS + BUSHES) break;
    const kind = n < FLOWERS ? "flower-bed" : "berry-bush";
    // 건물 뒤쪽(광장 반대편)에 둬 앞마당 동선을 안 막는다
    const len = Math.hypot(b.x, b.z) || 1;
    const away = {x: b.x / len, z: b.z / len};
    const dist = discs[OUTER.indexOf(b)].r + 0.9;
    if (tryPlace(`green-${n}`, kind, b.x + away.x * dist, b.z + away.z * dist,
      round3(((i * 61) % 360) * (Math.PI / 180)), {gap: 1.5, radius: 2.6})) n += 1;
  }
}

// ─── ⑩ 마을을 두르는 숲 ───────────────────────────────────────────────────────
// 지금까지 마을은 끝이 없었다. 건물이 끊긴 자리부터 90유닛짜리 잔디 평면이
// 지평선까지 그대로 뻗어서, 아무리 안을 채워도 "무대 세트를 벌판에 놓은" 꼴이었다.
// 마을은 테두리가 있어야 마을로 읽힌다.
//
// 어디까지가 마을인가는 건물 모서리와 길 칸의 볼록 껍질로 정한다. 그 껍질 바깥
// 띠에만 심으므로 구역 사이 오목한 골짜기는 숲이 안 먹는다(거긴 ⑪ 몫).
//
// 전부 빌보드다. 130그루를 심어도 520 삼각형 — 원본이었으면 100만이다.
const hull = convexHull([
  ...buildings.flatMap((b) => [
    [b.x - b.w / 2, b.z - b.d / 2], [b.x + b.w / 2, b.z - b.d / 2],
    [b.x + b.w / 2, b.z + b.d / 2], [b.x - b.w / 2, b.z + b.d / 2]
  ]),
  ...roads.map((r) => [r.x, r.z])
]);

// 잔디 평면은 90×90 이고 z로 3 밀려 있다 (VillageScene 의 Ground).
// 이 밖에 심으면 나무가 허공에 뜬다.
const GROUND = {x0: -45 + 3, x1: 45 - 3, z0: -42 + 3, z1: 48 - 3};

/** 껍질 바깥으로 얼마부터 숲인가 — 이보다 가까우면 마을 앞마당이다 */
const BELT_IN = -1.2;
/** 숲 띠의 두께 */
const BELT_DEPTH = 12;

{
  const STEP = 1.5;
  const TREES = ["far-pine", "far-oak", "far-pine", "far-sakura", "far-oak", "far-pine"];
  let n = 0;
  for (let x = GROUND.x0; x <= GROUND.x1; x += STEP) {
    for (let z = GROUND.z0; z <= GROUND.z1; z += STEP) {
      const px = x + (rand() - 0.5) * STEP * 0.9;
      const pz = z + (rand() - 0.5) * STEP * 0.9;
      if (px < GROUND.x0 || px > GROUND.x1 || pz < GROUND.z0 || pz > GROUND.z1) continue;

      // 껍질에서 일정 거리를 띄우면 마을 둘레에 도넛이 그려진다 — 위에서 보면
      // 미스터리 서클이다. 큰 파장의 잡음으로 안쪽 경계를 들쭉날쭉하게 흔들어,
      // 어떤 방향에선 숲이 뒷마당까지 밀고 들어오고 어떤 방향에선 물러나게 한다.
      const wobble = noise2(px * 0.045, pz * 0.045);
      const inHere = BELT_IN + wobble * 4.2;

      const d = polygonDistance(hull, px, pz);
      if (d < inHere) continue;
      // 흔들다 보면 경계가 껍질 안으로도 들어간다(BELT_IN이 음수일 때). 껍질 안엔
      // 길과 건물이 있으므로 여기서 막아야 대로 한복판에 나무가 선다.
      if (onRoad(px, pz, 1.2) || onDisc(px, pz, 0.6) || onBuilding(px, pz, 1.2)) continue;
      const t = (d - inHere) / BELT_DEPTH;
      if (t > 1) continue;

      // 안쪽은 성기게, 깊이 들어갈수록 빽빽하게 — 숲 가장자리가 흐릿해진다.
      // 잡음을 곱해 빈 공터와 덤불 덩어리를 만든다. 균일 확률이면 나무밭이 된다.
      let p = Math.min(1, 0.38 + t * 1.8) * (0.25 + 1.15 * noise2(px * 0.11, pz * 0.11));
      if (rand() > p) continue;
      if (!free(px, pz, 1.4)) continue;

      // 벚나무는 캐노피가 납작한 원반이라 십자 빌보드로 구우면 위에서 봤을 때
      // 판때기 두 장인 게 드러난다. 마을에서 먼 띠 안쪽(t>0.35)에만 둔다.
      // 침엽수는 원래 원뿔이라 어느 각도에서 봐도 멀쩡하고, 활엽수도 잎이
      // 뭉텅이라 잘 버틴다.
      let kind = TREES[Math.floor(rand() * TREES.length)];
      if (kind === "far-sakura" && t < 0.35) kind = "far-oak";
      const grow = (kind === "far-sakura" ? 0.85 : 0.78) + rand() * 0.5;
      place(`forest-${n++}`, kind, px, pz, round3(rand() * Math.PI * 2), {grow});
    }
  }
  // 숲 바닥에 덤불을 조금 — 나무 줄기 사이가 훤히 비면 세워 놓은 판때기가 드러난다
  const trunks = props.filter((p) => p.id.startsWith("decor-forest-"));
  let b = 0;
  for (const t of trunks) {
    if (rand() > 0.45) continue;
    const a = rand() * Math.PI * 2;
    const r = 0.9 + rand() * 1.1;
    const x = t.position[0] + Math.cos(a) * r;
    const z = t.position[2] + Math.sin(a) * r;
    if (x < GROUND.x0 || x > GROUND.x1 || z < GROUND.z0 || z > GROUND.z1) continue;
    place(`thicket-${b++}`, "far-bush", x, z, round3(rand() * Math.PI * 2), {grow: 0.7 + rand() * 0.7});
  }
}

// ─── ⑪ 마을 안 빈터 ───────────────────────────────────────────────────────────
// 구역과 구역 사이에 건물도 길도 없는 잔디밭이 넓게 남아 있다. 위에서 내려다본
// 지도로 보면 마을 동쪽에만 12×10 유닛짜리 초록 공백이 있었다.
//
// 여기는 숲으로 메우면 안 된다 — 마을이 숲에 파묻힌다. 나무 한 그루에 덤불과
// 돌을 붙인 작은 무리를 띄엄띄엄 놓아 "손 안 댄 들판"으로 만든다.
// 무리로 놓는 게 핵심이다. 하나씩 흩으면 개수를 아무리 늘려도 휑해 보인다.
{
  // 자리를 격자로 훑어 "가장 가까운 마을 요소까지 얼마나 트여 있나"를 재고,
  // 넓은 데부터 채운다. 처음엔 onRoad 같은 사각 판정에 여유를 3유닛씩 줬는데,
  // 길 칸 간격이 1.88이라 그 판정만으로 마을 안쪽이 통째로 막혀 빈터가 3개밖에
  // 안 나왔다. 진짜 거리를 재면 규칙 하나로 넓은 데를 정확히 골라낸다.
  const distRoad = (x, z) => {
    let best = Infinity;
    for (const r of roads) best = Math.min(best, Math.hypot(r.x - x, r.z - z));
    return best - ROAD_SIDE;
  };
  const distBuilding = (x, z) => {
    let best = Infinity;
    for (const b of buildings) {
      const dx = Math.max(0, Math.abs(b.x - x) - b.w / 2);
      const dz = Math.max(0, Math.abs(b.z - z) - b.d / 2);
      best = Math.min(best, Math.hypot(dx, dz));
    }
    return best;
  };
  const distDisc = (x, z) => {
    let best = Math.hypot(HUB.x - x, HUB.z - z) - HUB_RADIUS;
    for (const d of discs) best = Math.min(best, Math.hypot(d.x - x, d.z - z) - d.r);
    return best;
  };
  const openness = (x, z) => Math.min(distRoad(x, z), distBuilding(x, z), distDisc(x, z));

  /** 이보다 좁으면 동선이라 비워 둔다 */
  const MIN_OPEN = 1.7;
  const STEP = 1.2;
  const candidates = [];
  for (let x = -34; x <= 38; x += STEP) {
    for (let z = -30; z <= 38; z += STEP) {
      const px = x + (rand() - 0.5) * STEP;
      const pz = z + (rand() - 0.5) * STEP;
      // 껍질 안쪽만 — 바깥은 ⑩ 숲이 맡는다
      if (polygonDistance(hull, px, pz) > -0.5) continue;
      // 광장 앞은 트여 있어야 한다 — 마을의 첫인상이자 카메라가 늘 보는 자리
      if (Math.hypot(px - HUB.x, pz - HUB.z) < HUB_RADIUS + 3.5) continue;
      const open = openness(px, pz);
      if (open < MIN_OPEN) continue;
      candidates.push({x: px, z: pz, open});
    }
  }
  // 넓은 데부터 — 좁은 틈을 먼저 채우면 정작 큰 공터에 자리가 안 남는다
  candidates.sort((a, b) => b.open - a.open);

  const glades = [];
  for (const c of candidates) {
    // 트인 만큼 무리 사이를 띄운다. 좁은 틈엔 하나만, 넓은 벌판엔 여러 무리.
    const spacing = Math.min(5.2, 2.6 + c.open * 0.5);
    // free() 에 spacing 을 그대로 넘겼더니 후보 84곳이 전부 걸렸다 — 마을 안쪽은
    // 5유닛 안에 가로등이든 화분이든 반드시 하나는 있다. 겹치지만 않으면 되므로
    // 프롭 간 최소 간격과 무리 간 간격은 따로 잡는다.
    if (!free(c.x, c.z, 1.8)) continue;
    if (glades.some((g) => Math.hypot(g.x - c.x, g.z - c.z) < spacing)) continue;
    glades.push(c);
  }

  // 빈터는 마을 안이라 카메라가 가까이 붙는다. 벚나무 빌보드는 여기서 바로
  // 들통나므로 빼고, 어느 각도에서나 버티는 침엽수를 주로 쓴다.
  const TREES = ["far-pine", "far-oak", "far-pine", "far-pine", "far-oak"];
  let n = 0;
  glades.forEach((g, i) => {
    place(`glade-${n++}`, TREES[i % TREES.length], g.x, g.z, round3(rand() * Math.PI * 2), {
      grow: 0.8 + rand() * 0.35
    });
    // 나무 밑에 덤불·돌 두어 개. 한 그루만 서 있으면 심어 놓은 가로수처럼 보인다.
    const around = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < around; k++) {
      const a = rand() * Math.PI * 2;
      const r = 1.0 + rand() * Math.min(2.2, g.open * 0.6);
      const x = g.x + Math.cos(a) * r;
      const z = g.z + Math.sin(a) * r;
      if (openness(x, z) < 1.2) continue;
      // 돌은 원본을 써도 2~3천 삼각형이라 부담이 없고, 빌보드가 아니라 진짜 입체라
      // 어느 각도에서도 버틴다. 예전엔 다섯에 하나만 섞었는데(0.2), 부감이 열리면서
      // 덤불 임포스터의 수평 뚜껑이 잔디에 붙은 잎사귀로 보이는 게 드러나 뒤집었다.
      // 빈터는 마을 안이라 부감에 그대로 들어온다.
      const kind = rand() < 0.6 ? (rand() < 0.5 ? "stones" : "boulder") : "far-bush";
      place(`glade-${n++}`, kind, x, z, round3(rand() * Math.PI * 2), {grow: 0.65 + rand() * 0.6});
    }
  });
}

// ─── ⑫ 길가 ──────────────────────────────────────────────────────────────────
// 길은 가로등만 서 있고 나머지는 맨 잔디라, 걸어가는 동안 눈이 쉴 데가 없었다.
// 가로등 사이사이에 작은 것들을 번갈아 놓아 길에 리듬을 준다.
{
  // 처음엔 덤불 빌보드가 4/6이었다("길가는 스치는 자리라 대역으로 충분하다").
  // 카메라 상한을 78로 열고 나서 보니 아니었다 — 덤불 임포스터의 **수평 뚜껑**이
  // 위에서 내려다보면 잔디에 붙은 잎사귀 한 장으로 보인다. 뚜껑은 눈높이에서
  // 십자의 옆날이 드러나는 걸 막으려고 단 건데, 부감에서는 그게 정체를 드러낸다.
  // 길가는 마을 안쪽이라 부감에 그대로 들어오므로 진짜 입체를 주로 쓴다.
  // 돌은 2~3천이라 부담이 없다. 덤불은 여섯에 하나만 남겨 실루엣만 섞는다.
  const KINDS = ["stones", "boulder", "flower-pot", "stones", "far-bush", "boulder"];
  const sorted = roads.slice().sort((a, b) => a.z - b.z || a.x - b.x);
  let n = 0;
  for (const r of sorted) {
    const hasWE = sorted.some((o) => Math.abs(o.z - r.z) < 0.1 && Math.abs(Math.abs(o.x - r.x) - PITCH) < 0.1);
    const perp = hasWE ? {x: 0, z: 1} : {x: 1, z: 0};
    const sign = n % 2 === 0 ? 1 : -1;
    const side = ROAD_SIDE + 0.5 + rand() * 0.45;
    const x = r.x + perp.x * side * sign;
    const z = r.z + perp.z * side * sign;
    if (onDisc(x, z, 0.15) || onBuilding(x, z, 0.5) || onRoad(x, z, 0.05)) continue;
    // 가로등(2.2 간격)과 겹치지 않게. 여기서 걸리는 칸이 많아야 정상이다 —
    // 남는 자리에만 들어가야 길가가 물건으로 꽉 차 보이지 않는다.
    if (!free(x, z, 1.35)) continue;
    const kind = KINDS[n % KINDS.length];
    place(`verge-${n++}`, kind, x, z, round3(rand() * Math.PI * 2), {grow: 0.7 + rand() * 0.45});
  }
}

// ─── 쓰기 ─────────────────────────────────────────────────────────────────────
const kept = layout.props.filter((p) => !p.id.startsWith("decor-"));
const next = {...layout, props: [...kept, ...props]};

// 삼각형 청구서. 개수만 세면 "빌보드 300개"와 "원본 나무 300그루"가 같아 보인다.
// GLB의 JSON 청크에서 인덱스 개수를 읽는다 (Draco여도 accessor.count 는 남아 있다).
function trianglesOf(glb) {
  const file = `public${glb}`;
  if (!existsSync(file)) return null;
  const buf = readFileSync(file);
  let off = 12, gltf = null;
  while (off < buf.length && !gltf) {
    const len = buf.readUInt32LE(off);
    if (buf.readUInt32LE(off + 4) === 0x4e4f534a) gltf = JSON.parse(buf.slice(off + 8, off + 8 + len).toString("utf8"));
    off += 8 + len;
    while (off % 4) off++;
  }
  let t = 0;
  for (const mesh of gltf?.meshes ?? [])
    for (const prim of mesh.primitives)
      t += (prim.indices != null ? gltf.accessors[prim.indices].count : gltf.accessors[prim.attributes.POSITION].count) / 3;
  return t;
}

const tally = {};
for (const p of props) {
  // 같은 이름이 nature/ 와 impostor/ 양쪽에 있다 — 폴더까지 적어야 구분된다
  const kind = p.glb.split("/").slice(-2).join("/").replace(".glb", "");
  tally[kind] = (tally[kind] ?? 0) + 1;
}
const triCache = new Map();
let totalTris = 0;
const missing = [];
const billed = Object.entries(tally).map(([kind, count]) => {
  const glb = props.find((p) => p.glb.includes(`${kind}.glb`)).glb;
  if (!triCache.has(glb)) triCache.set(glb, trianglesOf(glb));
  const each = triCache.get(glb);
  if (each === null) missing.push(glb);
  const sum = (each ?? 0) * count;
  totalTris += sum;
  return {kind, count, each, sum};
});

// 어느 층이 몇 개를 놓았나 — 규칙을 손볼 때 여기부터 본다
const bySection = {};
for (const p of props) {
  const section = p.id.replace(/^decor-/, "").replace(/-?\d+$/, "") || "기타";
  bySection[section] = (bySection[section] ?? 0) + 1;
}

console.log(`장식물 ${props.length}개  (decor 외 프롭 ${kept.length}개는 그대로)`);
console.log(
  "  층별: " +
    Object.entries(bySection)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")
);
for (const {kind, count, each, sum} of billed.sort((a, b) => b.sum - a.sum))
  console.log(
    `  ${kind.padEnd(34)} ${String(count).padStart(4)}개` +
      ` × ${each === null ? "  ?  " : String(Math.round(each)).padStart(5)}` +
      ` = ${String(Math.round(sum / 1000)).padStart(4)}k`
  );
console.log(`  ${"합계".padEnd(34)} ${String(props.length).padStart(4)}개              ${(totalTris / 1000).toFixed(0)}k 삼각형`);
if (missing.length) console.log(`  ! 파일을 못 찾아 못 센 것: ${missing.join(", ")}`);
console.log(`  걸어 다니는 구역: 원본으로 바꿔 심음 ${promoted}개 · 빼버림 ${dropped}개`);
if (skipped.length) console.log(`  자리를 못 찾아 뺀 것: ${skipped.join(", ")}`);

if (DRY) {
  console.log("\n--dry — 파일은 안 건드렸습니다");
} else {
  writeFileSync(LAYOUT, JSON.stringify(next, null, 2) + "\n");
  console.log(`\n${LAYOUT} 갱신 완료`);
}
