import propsLayout from "@/data/propsLayout.json";
import {
  BRIDGE_CELLS,
  inLagoon,
  isWater,
  onPlazaRing,
  PLAZA_RING,
  terrainHeightAt,
  waterDepthAt
} from "./villageTerrain";
import {villageBuildings} from "./constants";

// 걸어 다니는 범위와, 몸으로 막히는 것들.
//
// ── 왜 한 파일인가 ──────────────────────────────────────────────────────────
// 범위는 두 곳이 알아야 한다: 캐릭터를 가두는 컨트롤러와, 그 안의 빌보드를
// 원본 모델로 바꿔 심는 장식물 생성기(가까이서 보면 빌보드는 판때기로 들통난다).
// 예전엔 생성기에 `WALK = {x: 13.5, z0: -11, z1: 15}` 를 손으로 적어 두고
// 주석에 "컨트롤러는 x ±11.5 / z −8.8~12.5 로 가둔다"고 써 놨었다 — 애초에
// 값이 서로 달랐고, 구역을 고리로 재배치한 뒤로는 둘 다 낡았다.
// 그래서 범위는 여기 하나만 두고 양쪽이 읽는다.

/**
 * 걸어 다니는 범위의 **바깥 반지름** — 대략적 필터용.
 *
 * 진짜 경계는 반지름이 아니라 **석호 껍질**이다(아래 isWalkable). 물에 들어갈
 * 수 있게 되면서 "섬 = 껍질 안"이 됐고, 껍질 밖은 벌판이라 걸어 나갈 수 없다.
 * 이 상수는 껍질을 감싸는 원(껍질 최대 반지름 34.9)으로, 막는 프롭을 격자에
 * 담을지 말지 같은 **성긴 필터**에만 쓴다. 경계 판정에 쓰면 안 된다 —
 * 껍질은 원이 아니라서 모서리(r 21~35)마다 원과 어긋난다.
 *
 * (예전엔 이 값이 곧 경계였다: 원반 r 18. 껍질 최소 반지름이 21.3 이라
 *  지금 범위는 그때의 순수 확장이다 — 잃는 땅이 없다.)
 */
export const WALK_RADIUS = 35;

/** 캐릭터 몸 반지름 — 막는 것들의 반경에 이만큼 더해 판정한다 */
export const CHARACTER_RADIUS = 0.42;

/**
 * 캐릭터가 처음 서는 자리.
 *
 * 오래 (0, 3.5) 였는데, 기념비가 1.4배로 커지면서 그 상자(반폭 3.33)에 몸
 * 반지름을 더한 3.75 안으로 들어가 **출발점 자체가 막힌 자리**가 됐다. 막힌
 * 자리에서는 어느 방향으로도 첫 걸음이 안 나가서 조작이 통째로 먹통이 된다.
 * 기념비 발치 고리(r 4.47)는 45° 간격으로 축을 비켜 서 있으므로, +Z 축을 타고
 * 그 사이로 나온다. check-village.mjs 가 이 자리가 실제로 밟히는지 매번 본다.
 */
export const SPAWN: readonly [number, number] = [0, 4.6];

/**
 * 장식물 종류별로 몸이 막히는 반경. **여기 없는 것은 통과한다.**
 *
 * 일부러 "막을 것만 적는" 방식이다. 반대로 하면(기본 막힘 + 예외 통과) 새 장식물이
 * 하나 들어올 때마다 보이지 않는 벽이 생기고, 플레이어는 왜 못 지나가는지 알 수가 없다.
 * 반대 방향의 실수 — 새 물건을 그냥 통과하는 것 — 는 지금까지의 상태와 같아서 안전하다.
 *
 * 걸어서 지나가야 하는 것은 여기 넣지 않는다: 판석·길·다리·계단(gatestep·
 * terrace-stair)·연석(verge)·바닥 심기(planting)·머리 위 깃발(bunting)·
 * 길을 가로지르는 현판 아치(arch-*, 다리는 pier-* 가 따로 막는다).
 */
const BLOCK_RADIUS: Array<[RegExp, number]> = [
  // 광장 랜드마크
  [/^(fountain|well|lantern-bearer|windmill|pagoda-portfolio)$/, 1.0],
  // 건물처럼 큰 것
  [/^(house-[abc]|market-stall)$/, 1.0],
  // 나무·바위
  [/^(tree-|far-oak|far-pine|far-sakura)/, 0.45],
  [/^(rock-|boulder)/, 0.5]
];

/**
 * 담장·울타리는 **선분**이다. 원으로 근사하면 안 된다.
 *
 * 두께 0.4·길이 1.94 짜리 판을 반경 1.05 원으로 잡았더니, 원이 판보다 옆으로
 * 훨씬 부풀어 담장 사이의 **문과 골목이 통째로 메워졌다** — 걸어 다닐 수 있는
 * 땅이 원반의 5% 로 줄고 남쪽 참배로 한 줄기만 남았다. 길이 방향과 두께 방향을
 * 따로 재면 실제 판 모양대로 막힌다.
 */
const WALL_KINDS = /^(wall-low|fence-rail|fence|terrace-wall)$/;
const WALL_HALF_LEN = 0.97;
const WALL_HALF_THICK = 0.2;

/**
 * 통과시키는 것들 — 여기 없는 것도 위 표에 없으면 통과한다.
 *
 * 벤치·화분·통·가로등처럼 낮거나 가는 가구는 일부러 막지 않는다. 전부 길가에
 * 놓이는 물건이라 막으면 폭 1.88 짜리 길이 양쪽에서 깎여 사람이 못 지나간다.
 * 지나갈 때 살짝 겹쳐 보이는 것보다, 길이 막혀 조작이 안 되는 쪽이 훨씬 나쁘다.
 */

function radiusFor(glb: string): number {
  const name = glb.split("/").pop()?.replace(".glb", "") ?? "";
  for (const [re, r] of BLOCK_RADIUS) if (re.test(name)) return r;
  return 0;
}

interface Blocker {
  x: number;
  z: number;
  r: number;
}

/**
 * 막는 것들을 격자 칸에 나눠 담는다. 매 프레임 400개를 다 훑으면 이동 한 번에
 * 곱셈이 수천 번이라, 주변 아홉 칸만 본다.
 */
const CELL = 2.5;
const key = (i: number, j: number) => `${i}_${j}`;
const grid = new Map<string, Blocker[]>();

function addBlocker(b: Blocker) {
  const i = Math.floor(b.x / CELL);
  const j = Math.floor(b.z / CELL);
  // 반경이 칸을 넘칠 수 있으니 걸치는 칸에 모두 넣는다
  const span = Math.ceil((b.r + CHARACTER_RADIUS) / CELL);
  for (let di = -span; di <= span; di++)
    for (let dj = -span; dj <= span; dj++) {
      const k = key(i + di, j + dj);
      const at = grid.get(k);
      if (at) at.push(b);
      else grid.set(k, [b]);
    }
}

interface WallSeg {
  x: number;
  z: number;
  ax: number;
  az: number;
}
const wallSegs: WallSeg[] = [];

// 장식물 — 걷는 범위 근처만 담는다. 나머지는 어차피 갈 수 없다.
for (const p of propsLayout.props as Array<{
  glb: string;
  position: number[];
  rotationY?: number;
}>) {
  const x = p.position[0];
  const z = p.position[2];
  if (Math.hypot(x, z) > WALK_RADIUS + 3) continue;
  const name = p.glb.split("/").pop()?.replace(".glb", "") ?? "";
  if (WALL_KINDS.test(name)) {
    const a = p.rotationY ?? 0;
    wallSegs.push({x, z, ax: Math.cos(a), az: Math.sin(a)});
    continue;
  }
  const r = radiusFor(p.glb);
  if (r > 0) addBlocker({x, z, r});
}

// ─── 물 ───────────────────────────────────────────────────────────────────────
// 한동안 물을 통째로 막았다(다리 자리만 구멍). 지금은 반대다 — **물에 들어가진다.**
// 걸어 들어가면 waterDepthAt 만큼 가라앉아 허리까지 잠기고, 다리는 "젖지 않고
// 건너는 길"로 남는다. 못 나가는 경계는 물이 아니라 석호 껍질이 긋는다(isWalkable).
/** 길 칸 반폭 + 몸 반지름 — 다리 칸 한 장이 "마른 길"로 세는 넓이 */
const BRIDGE_OPEN = 0.94 + CHARACTER_RADIUS;

/** 다리가 잇는 자리인가 — 여기서는 물 위라도 젖지 않고 걷는다 */
function onBridge(x: number, z: number): boolean {
  for (const c of BRIDGE_CELLS)
    if (Math.abs(x - c.x) < BRIDGE_OPEN && Math.abs(z - c.z) < BRIDGE_OPEN)
      return true;
  return false;
}

/**
 * 캐릭터·NPC 가 밟는 높이. 지형 높이에 **물 깊이**를 뺀 것이다.
 *
 * 프롭·건물은 terrainHeightAt(물 위 0)을 그대로 쓴다 — 다리·바위가 몸처럼
 * 가라앉으면 안 되니까. 가라앉는 건 걷는 것들뿐이다.
 *
 * 잠기는 그림은 하상이 그린다: 하상이 불투명 메시라 그 아래로 내려간 다리는
 * 하상에 가려 사라지고, 수면 위 상체만 남는다.
 */
export function walkHeightAt(x: number, z: number): number {
  // 고리 회랑이 물보다 먼저다 — 데크는 수면 위에 떠 있다
  if (onPlazaRing(x, z)) return PLAZA_RING.deck;
  if (isWater(x, z) && !onBridge(x, z)) return -waterDepthAt(x, z);
  return terrainHeightAt(x, z);
}

/** 건물은 상자로 막는다 — 원으로 근사하면 모서리가 뭉개져 벽을 뚫는다 */
const boxes = villageBuildings
  .filter(b => Math.hypot(b.position[0], b.position[2]) < WALK_RADIUS + 8)
  .map(b => ({
    x: b.position[0],
    z: b.position[2],
    hw: b.size[0] / 2,
    hd: b.size[2] / 2
  }));

/**
 * 그 자리에 설 수 있나. 컨트롤러가 매 프레임 다음 위치로 물어본다.
 *
 * 예전에는 **건물만** 봤다. 그런데 걷는 범위 안에 닿는 건물은 둘뿐이고,
 * 실제로 몸이 부딪히는 건 분수·축대·가로등·나무 같은 장식물 108개였다 —
 * 그게 전부 그냥 통과됐다. "캐릭터가 건물을 통과한다"의 정체가 이것이다.
 */
export function isWalkable(x: number, z: number): boolean {
  // **섬 밖으로는 못 나간다.** 경계는 석호 껍질(볼록 10각형) — 껍질 안은
  // 물이든 단이든 어디든 다니고, 껍질 밖은 벌판이라 발을 딛을 수 없다.
  // 울타리 프롭은 이 경계를 눈에 보이게 그린 것일 뿐, 막는 건 이 한 줄이다 —
  // 토막 사이 틈으로 새는 사고가 원천적으로 없다.
  if (!inLagoon(x, z)) return false;

  for (const b of boxes) {
    if (
      x > b.x - b.hw - CHARACTER_RADIUS &&
      x < b.x + b.hw + CHARACTER_RADIUS &&
      z > b.z - b.hd - CHARACTER_RADIUS &&
      z < b.z + b.hd + CHARACTER_RADIUS
    )
      return false;
  }

  const near = grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
  if (near) {
    for (const b of near) {
      const rr = b.r + CHARACTER_RADIUS;
      const dx = x - b.x;
      const dz = z - b.z;
      if (dx * dx + dz * dz < rr * rr) return false;
    }
  }

  for (const w of wallSegs) {
    const dx = x - w.x;
    const dz = z - w.z;
    if (Math.abs(dx) > 1.6 || Math.abs(dz) > 1.6) continue; // 멀면 각도 계산도 생략
    const along = Math.abs(dx * w.ax + dz * w.az);
    const perp = Math.abs(dx * -w.az + dz * w.ax);
    if (
      along < WALL_HALF_LEN + CHARACTER_RADIUS &&
      perp < WALL_HALF_THICK + CHARACTER_RADIUS
    )
      return false;
  }
  return true;
}

/**
 * 막히면 벽을 따라 미끄러진다.
 *
 * 막히자마자 멈춰 세우면 벽에 비스듬히 걸었을 때 캐릭터가 그 자리에 붙어버려
 * "조작이 먹통"으로 느껴진다. 한 축씩 따로 시도해 통과하는 축만 살린다 —
 * 벽을 스치며 걷는 흔한 처리다.
 */
export function slideTo(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number
): {x: number; z: number} {
  if (isWalkable(toX, toZ)) return {x: toX, z: toZ};
  if (isWalkable(toX, fromZ)) return {x: toX, z: fromZ};
  if (isWalkable(fromX, toZ)) return {x: fromX, z: toZ};
  return {x: fromX, z: fromZ};
}
