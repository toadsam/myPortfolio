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
const WALL_KINDS = /^(wall-low|wall-ivy|fence-rail|fence|terrace-wall)$/;
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

/**
 * 다리 칸마다 미리 계산한 **상판 높이**.
 *
 * 예전엔 다리 칸이 그냥 "젖지 않는 구멍"이라 걷기 높이가 지면(≈0, 수면)이었다.
 * 아치 돌다리 GLB 가 들어오면서 눈에 보이는 상판은 은행 높이(1.1)에서 봉긋하게
 * 솟는데 발은 물 높이로 건너니, **다리를 건너는 모두가 수면 위를 걷는 사람**으로
 * 보였다(2026-08-27 사용자 보고 — "갑자기 물에 빠져서 뛰어다닌다"의 정체가
 * 분신 순찰의 다리 건너기였다). 사슬(다리 하나)로 묶어 양끝 은행 높이를 재고,
 * 사이를 잇되 가운데를 ARCH_BUMP 만큼 올린다 — 끝은 은행과 같아 턱이 없다.
 */
const ARCH_BUMP = 0.6;

interface DeckCell {
  x: number;
  z: number;
  h: number;
}

const DECK_CELLS: DeckCell[] = (() => {
  const cells = BRIDGE_CELLS;
  const n = cells.length;
  const parent = Array.from({length: n}, (_, i) => i);
  const find = (i: number): number =>
    parent[i] === i ? i : (parent[i] = find(parent[i]!));
  for (let i = 0; i < n; i += 1)
    for (let j = i + 1; j < n; j += 1) {
      const a = cells[i]!;
      const b = cells[j]!;
      if (Math.hypot(a.x - b.x, a.z - b.z) < 1.2) parent[find(i)] = find(j);
    }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i += 1) {
    const r = find(i);
    const at = groups.get(r);
    if (at) at.push(i);
    else groups.set(r, [i]);
  }
  const out: DeckCell[] = [];
  for (const idxs of groups.values()) {
    let ea = idxs[0]!;
    let eb = idxs[0]!;
    let span = -1;
    for (const i of idxs)
      for (const j of idxs) {
        const a = cells[i]!;
        const b = cells[j]!;
        const d = Math.hypot(a.x - b.x, a.z - b.z);
        if (d > span) {
          span = d;
          ea = i;
          eb = j;
        }
      }
    const A = cells[ea]!;
    const B = cells[eb]!;
    const L = Math.max(span, 0.001);
    // 끝 칸 너머 1 유닛의 지면이 은행 높이 — 표본이 물이면 단 높이로 대체
    const bank = (p: {x: number; z: number}, q: {x: number; z: number}) => {
      const h = terrainHeightAt(
        p.x + (p.x - q.x) / L,
        p.z + (p.z - q.z) / L
      );
      return h > 0.2 ? h : PLAZA_RING.deck;
    };
    const hA = bank(A, B);
    const hB = bank(B, A);
    for (const i of idxs) {
      const c = cells[i]!;
      const t = Math.hypot(c.x - A.x, c.z - A.z) / L;
      out.push({
        x: c.x,
        z: c.z,
        h: hA + (hB - hA) * t + ARCH_BUMP * Math.sin(Math.PI * t)
      });
    }
  }
  return out;
})();

/** 다리 위라면 상판 높이, 아니면 null — 가까운 칸들의 역거리 가중 평균.
 * 반경 1.1: 칸 간격 0.94 라 복도는 안 끊기고, 다리 **옆** 물에 선 플레이어가
 * 보이지 않는 상판에 올라서는 폭은 최소로 줄인다. */
function bridgeDeckAt(x: number, z: number): number | null {
  let wsum = 0;
  let hsum = 0;
  for (const c of DECK_CELLS) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < 1.1) {
      const w = 1 / (d + 0.15);
      wsum += w;
      hsum += w * c.h;
    }
  }
  return wsum > 0 ? hsum / wsum : null;
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
  if (isWater(x, z)) {
    const deck = bridgeDeckAt(x, z);
    if (deck !== null) return deck; // 다리 — 상판 위를 걷는다
    return -waterDepthAt(x, z);
  }
  return terrainHeightAt(x, z);
}

/**
 * 건물은 상자로 막는다 — 원으로 근사하면 모서리가 뭉개져 벽을 뚫는다.
 *
 * 건물이 임의 각으로 돌게 되면서(고리 배치) 축정렬 상자로는 안 된다 — 45도로
 * 돌아선 건물이면 축정렬 외접 상자가 실제보다 41% 부풀어 문 앞이 막힌다.
 * 점을 건물의 모델 좌표로 되돌려(역회전) 재면 돌아간 그대로 막힌다.
 */
const boxes = villageBuildings
  .filter(b => Math.hypot(b.position[0], b.position[2]) < WALK_RADIUS + 8)
  .map(b => {
    const r = b.rotationY ?? 0;
    return {
      x: b.position[0],
      z: b.position[2],
      hw: b.size[0] / 2,
      hd: b.size[2] / 2,
      cos: Math.cos(r),
      sin: Math.sin(r)
    };
  });

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
    const dx = x - b.x;
    const dz = z - b.z;
    if (Math.abs(dx) > 6 || Math.abs(dz) > 6) continue; // 먼 건물은 회전 계산 생략
    // 모델 좌표로 역회전: rotationY=r 이 +X→(cos r,−sin r) 이므로 역은 전치
    const lx = b.cos * dx - b.sin * dz;
    const lz = b.sin * dx + b.cos * dz;
    if (
      Math.abs(lx) < b.hw + CHARACTER_RADIUS &&
      Math.abs(lz) < b.hd + CHARACTER_RADIUS
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
  return slideWith(isWalkable, fromX, fromZ, toX, toZ);
}

/**
 * **주민은 물에 안 들어간다.** 플레이어는 걸어 들어가 허리까지 잠기는 게 기능이지만
 * (위 "물" 절), NPC 가 그러면 그냥 물에 빠진 사람으로 보인다 — 실제로 32명 중
 * 상시 1~4명이 물속에 잠긴 채 서 있었다(월드 좌표 실측, 최대 −0.59).
 *
 * 마른 땅 판정은 `walkHeightAt` 부호 하나로 끝난다: 물이면 음수(−깊이),
 * 데크·단·잔디면 0 이상이다.
 *
 * 단, 다리 위에서는 플레이어보다 **좁게** 통과시킨다. 플레이어의 다리 여유
 * (1.36)는 "몸 반지름이 판자 끝에 걸쳐도 젖지 않는" 기준이라, 그대로 쓰면
 * NPC 가 다리 칸의 판자 **밖** 가장자리 — 시각적으로는 물 위 — 를 합법적으로
 * 걸어 다닌다(2026-08-27 실측: 다리 옆 수면에 떠서 걷는 NPC 스크린샷).
 * 중심이 판자 위(반경 0.85, 유클리드 — 사각형이면 대각 다리에서 모서리가
 * 옆으로 불거진다)에 있어야만 마른 길로 센다. 칸 간격이 0.94 라 반경 0.85 면
 * 사이 허리도 0.7 은 남아 복도가 안 끊긴다.
 */
const BRIDGE_OPEN_NPC = 0.85;

function onBridgePlank(x: number, z: number): boolean {
  for (const c of BRIDGE_CELLS) {
    const dx = x - c.x;
    const dz = z - c.z;
    if (dx * dx + dz * dz < BRIDGE_OPEN_NPC * BRIDGE_OPEN_NPC) return true;
  }
  return false;
}

export function isWalkableDry(x: number, z: number): boolean {
  if (!isWalkable(x, z)) return false;
  if (isWater(x, z) && !onPlazaRing(x, z) && !onBridgePlank(x, z)) return false;
  return walkHeightAt(x, z) >= 0;
}

/** 물을 피하는 미끄러짐 — NPC 전용 */
export function slideToDry(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number
): {x: number; z: number} {
  return slideWith(isWalkableDry, fromX, fromZ, toX, toZ);
}

/**
 * 막히면 **방향을 튼다** — NPC 배회·사회적 이동용 조향.
 *
 * 슬라이드는 벽에 비스듬히 닿았을 때만 살고, 목표가 건물 정반대편이면 NPC 가
 * 벽에 얼굴을 박은 채 갈리거나 서 버린다("건물로 뛰어드는" 그림의 정체).
 * 대신 원하는 방향이 막히면 좌우로 30°씩, 최대 165°까지 틀어 **처음 뚫리는
 * 방향으로 걷는다** — 건물에 닿은 주민은 벽을 따라 돌아 나가거나 아예
 * 딴 데로 걸어간다.
 *
 * prefer(+1/−1)는 지난 프레임에 튼 쪽이다. 매 프레임 좌우를 번갈아 고르면
 * 문틀 앞에서 좌우로 떠는데, 같은 쪽을 먼저 시도하면 한 방향으로 매끈하게
 * 돌아 나간다. 전 방향이 막히면 moved=false — 그때만 목적지를 새로 뽑는다.
 */
const STEER_DEGS = [30, 60, 90, 130, 165] as const;

export function steerDry(
  fromX: number,
  fromZ: number,
  dirX: number,
  dirZ: number,
  step: number,
  prefer: 1 | -1
): {x: number; z: number; moved: boolean; side: 1 | -1} {
  const base = Math.atan2(dirX, dirZ); // rotation.y 와 같은 관례: (sin, cos)
  const tryAt = (a: number) => {
    const nx = fromX + Math.sin(a) * step;
    const nz = fromZ + Math.cos(a) * step;
    return isWalkableDry(nx, nz) ? {x: nx, z: nz} : null;
  };
  const straight = tryAt(base);
  if (straight) return {...straight, moved: true, side: prefer};
  for (const deg of STEER_DEGS) {
    for (const s of [prefer, -prefer]) {
      const hit = tryAt(base + (deg * Math.PI * s) / 180);
      if (hit) return {...hit, moved: true, side: s as 1 | -1};
    }
  }
  return {x: fromX, z: fromZ, moved: false, side: prefer};
}

function slideWith(
  ok: (x: number, z: number) => boolean,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number
): {x: number; z: number} {
  if (ok(toX, toZ)) return {x: toX, z: toZ};
  if (ok(toX, fromZ)) return {x: toX, z: fromZ};
  if (ok(fromX, toZ)) return {x: fromX, z: toZ};
  return {x: fromX, z: fromZ};
}
