// 장식물(간판·가로등·분수·벤치…)을 마을에 배치한다.
//
// generate-ground-layout.mjs 가 `ground-*` 프롭을 통째로 다시 쓰듯, 이 스크립트는
// `decor-*` 프롭만 다시 쓴다. 서로의 결과를 건드리지 않으므로 순서 상관없이
// 따로 돌려도 된다. 다만 길 위치를 바닥 레이아웃에서 읽으므로, 길을 새로 깐
// 다음에는 이쪽도 한 번 돌려야 가로등이 길을 따라간다.
//
// 사용법: node scripts/generate-decor-layout.mjs [--dry]

import {readFileSync, writeFileSync} from "node:fs";
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
  "tree-golden-canopy": {glb: "nature/tree-golden-canopy.glb", h: 1.743, m: 4.5},
  "tree-emerald-crown": {glb: "nature/tree-emerald-crown.glb", h: 1.897, m: 5.0},
  "tree-sakura": {glb: "nature/tree-sakura.glb", h: 1.809, m: 4.5},
  "flower-bed": {glb: "nature/tree-petal-parade.glb", h: 0.877, m: 0.8},
  "berry-bush": {glb: "nature/bush-emerald-berry.glb", h: 1.137, m: 1.3},
  boulder: {glb: "nature/rock-verdant-boulder.glb", h: 1.281, m: 1.7},
  stones: {glb: "nature/rock-three-stones.glb", h: 0.784, m: 0.9}
};

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
const discs = OUTER.map((b) => ({x: b.x, z: b.z, r: Math.max(b.w, b.d) / 2 + 0.55}));
{
  const yards = new Map(
    layout.props
      .filter((p) => p.id.startsWith("ground-yard-"))
      .map((p) => [p.id.slice("ground-yard-".length), p.scale * PLAZA_RADIUS_AT_1])
  );
  for (const b of OUTER) {
    const actual = yards.get(b.id);
    const mine = Math.max(b.w, b.d) / 2 + 0.55;
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

function place(id, kind, x, z, rotationY = 0, {gap = 0.9} = {}) {
  props.push({
    id: `decor-${id}`,
    glb: `/models/props/${KIT[kind].glb}`,
    position: [round3(x), liftOf(kind), round3(z)],
    rotationY,
    scale: scaleOf(kind)
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
const LANTERN_EVERY = 3;
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
// 건물마다 광장을 향한 쪽 좌우로 두 점 — 한쪽만 놓으면 마을이 휑하고,
// 원반을 빙 두르면 원이 그려져 인위적으로 보인다.
{
  let n = 0;
  const ROTATION = ["bench", "flower-pot", "orb-lantern", "flower-pot", "barrel-iron", "orb-lantern"];
  for (const [index, b] of OUTER.entries()) {
    const disc = discs[index];
    // 광장 반대편(건물 뒤)이 아니라, 광장을 향한 쪽에 둔다
    const len = Math.hypot(b.x, b.z) || 1;
    const inward = {x: -b.x / len, z: -b.z / len};
    const base = Math.atan2(inward.z, inward.x);
    for (const [slot, swing] of [[0, 0.75], [1, -0.75]].entries()) {
      const angle = base + swing[1];
      const dist = disc.r + 0.5;
      const x = b.x + Math.cos(angle) * dist;
      const z = b.z + Math.sin(angle) * dist;
      if (onRoad(x, z, 0.3) || onBuilding(x, z, 0.4) || !free(x, z, 1.1)) continue;
      const kind = ROTATION[(index * 2 + slot) % ROTATION.length];
      place(`yard-${n}`, kind, x, z, faceTo(b.x - x, b.z - z), {gap: 1.1});
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
{
  const FLOWERS = 8;
  const BUSHES = 5;
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

// ─── 쓰기 ─────────────────────────────────────────────────────────────────────
const kept = layout.props.filter((p) => !p.id.startsWith("decor-"));
const next = {...layout, props: [...kept, ...props]};

const tally = {};
for (const p of props) {
  const kind = p.glb.split("/").pop().replace(".glb", "");
  tally[kind] = (tally[kind] ?? 0) + 1;
}

console.log(`장식물 ${props.length}개  (decor 외 프롭 ${kept.length}개는 그대로)`);
console.log(
  "  " +
    Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`)
      .join(", ")
);
if (skipped.length) console.log(`  자리를 못 찾아 뺀 것: ${skipped.join(", ")}`);

if (DRY) {
  console.log("\n--dry — 파일은 안 건드렸습니다");
} else {
  writeFileSync(LAYOUT, JSON.stringify(next, null, 2) + "\n");
  console.log(`\n${LAYOUT} 갱신 완료`);
}
