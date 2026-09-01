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
/**
 * 클릭으로 칠 수 있는 포인터 이동 거리(px). 이보다 많이 끌었으면 **드래그**로
 * 보고 클릭 판정을 버린다.
 *
 * 걷기 모드에 드래그 시점이 생기면서(2026-08-29) 이 가드가 바닥뿐 아니라
 * NPC·건물에도 필요해졌다. 화면을 돌리려고 NPC 위에서 끌기 시작했다가 손을
 * 떼면 대화창이 열리고, 건물 위에서였다면 그 건물 안으로 들어가 버린다.
 */
export const CLICK_MAX_DELTA = 5;

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
  [/^(rock-|boulder)/, 0.5],
  // 덤불 — 어깨 높이 수풀이라 몸이 지나가면 그대로 뚫고 선다
  // ("장식 풀을 통과한다", 2026-08-28 사용자 보고). 꽃밭·풀포기(grass-patch·
  // flowerbed)는 발목 높이라 밟고 지나가도 어색하지 않아 그대로 둔다.
  [/^bush-/, 0.32]
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

/**
 * **플레이어만 통과하는 것들** (주민은 그대로 막힌다).
 *
 * 걷기 모드로 실제로 돌아다녀 보면 몸이 걸리는 건 건물이 아니라 길가에 늘어선
 * 울타리 188토막·담장 117토막과 들판의 덤불·바위다. 길 폭이 1.88 인데 양옆을
 * 울타리가 먹고, 블록을 가로지르려면 담장을 빙 돌아야 한다 — "뭐에 자꾸 막힌다"의
 * 정체가 이것이다.
 *
 * 그렇다고 주민까지 통과시키면 **담장을 뚫고 걸어 다니는 주민**이 보인다. 주민은
 * 늘 화면 안에서 천천히 움직이니까 관통이 그대로 눈에 띄는데, 플레이어는 자기가
 * 조종하는 몸이라 살짝 스쳐 지나가는 걸 알아채기 어렵다. 그래서 **비대칭**이 맞다.
 *
 * **나무도 통과시킨다** (2026-08-29). 굵어서 관통이 티가 날 줄 알았는데, 실제로
 * 걸어 보면 들판을 가로지를 때 제일 자주 걸리는 게 나무다 — 마을 안팎에 350그루가
 * 넘고 그 사이가 좁다. 잠깐 스치는 어색함보다 길이 막히는 답답함이 훨씬 크다.
 *
 * 민가·분수·우물·풍차·문기둥·건물은 양쪽 다 막는다 — 통과해서 안으로 들어가면
 * 스치는 정도가 아니라 "안에 갇힌" 그림이 된다.
 */
const SOFT_FOR_PLAYER =
  /^(wall-low|wall-ivy|fence-rail|fence|bush-|rock-|boulder|tree-|far-oak|far-pine|far-sakura)/;

interface Blocker {
  x: number;
  z: number;
  r: number;
  /** 플레이어는 통과, 주민은 막힘 */
  soft?: boolean;
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
  /** 플레이어는 통과, 주민은 막힘 */
  soft?: boolean;
}
const wallSegs: WallSeg[] = [];

/**
 * ─── 다리 상판 곡선 (bridge-arch GLB 정점 실측, 2026-08-28) ─────────────────
 *
 * 걷기 높이의 다리 처리(DECK_CELLS)는 **물 구간의 칸**만 안다. 그런데 다리
 * GLB 는 그보다 길어 경사로가 뭍까지 이어지고, 물폭이 좁아 칸이 2개뿐인
 * 다리는 t 가 0과 1뿐이라 아치 봉긋(sin) 항이 **정확히 0** 이었다 — 상판은
 * 중앙에서 뚝방보다 1.1 이상 솟는데 발은 뚝방 높이 그대로라, 다리 한가운데를
 * 건너는 모두가 허리까지 파묻혔다(2026-08-28 사용자 스크린샷, LIFE 북쪽 다리).
 *
 * 모든 다리가 propsLayout 의 bridge-arch 프롭이므로, 그 배치(중심·각도·배율)에
 * GLB 상판 중앙 띠(|z|<0.12)의 윗면 y 를 실측한 곡선을 태워 걷기 높이를 만든다.
 * 뭍 위 경사로 구간은 지형과 상판 중 **높은 쪽**을 밟는다.
 */
const BRIDGE_DECK_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [-0.95, -0.241],
  [-0.85, -0.228],
  [-0.76, -0.182],
  [-0.67, -0.14],
  [-0.57, -0.073],
  [-0.47, -0.013],
  [-0.38, 0.058],
  [-0.29, 0.134],
  [-0.19, 0.135],
  [-0.1, 0.162],
  [0.0, 0.171],
  [0.09, 0.16],
  [0.19, 0.143],
  [0.28, 0.108],
  [0.38, 0.053],
  [0.48, 0.009],
  [0.57, -0.08],
  [0.66, -0.147],
  [0.76, -0.184],
  [0.86, -0.228],
  [0.95, -0.245]
];

function deckLocalY(lx: number): number {
  const P = BRIDGE_DECK_PROFILE;
  if (lx <= P[0]![0]) return P[0]![1];
  for (let i = 1; i < P.length; i += 1) {
    if (lx <= P[i]![0]) {
      const [x0, y0] = P[i - 1]!;
      const [x1, y1] = P[i]!;
      const t = (lx - x0) / (x1 - x0 || 1);
      return y0 + (y1 - y0) * t;
    }
  }
  return P[P.length - 1]![1];
}

interface BridgeSpan {
  x: number;
  z: number;
  /** 모델 +X(길이 방향)의 월드 방향 */
  ax: number;
  az: number;
  s: number;
  y: number;
  halfLen: number;
  halfW: number;
}
const BRIDGE_SPANS: BridgeSpan[] = [];

/** 채움 민가 — 건물만큼 시야를 가리는데 상자가 아니라 원으로 들고 있다 */
interface ViewDisc {
  x: number;
  z: number;
  r: number;
  top: number;
}
const viewDiscs: ViewDisc[] = [];

// 장식물 — 걷는 범위 근처만 담는다. 나머지는 어차피 갈 수 없다.
for (const p of propsLayout.props as Array<{
  glb: string;
  position: number[];
  rotationY?: number;
  scale?: number;
}>) {
  const x = p.position[0];
  const z = p.position[2];
  if (Math.hypot(x, z) > WALK_RADIUS + 3) continue;
  const name = p.glb.split("/").pop()?.replace(".glb", "") ?? "";
  if (name === "bridge-arch") {
    const a = p.rotationY ?? 0;
    const s = p.scale ?? 1;
    BRIDGE_SPANS.push({
      x,
      z,
      ax: Math.cos(a),
      az: -Math.sin(a),
      s,
      y: p.position[1] ?? 0,
      halfLen: 0.95 * s,
      // 걷는 폭은 상판 안쪽(난간 안) — bbox 반폭 0.413 보다 좁게
      halfW: 0.35 * s
    });
    continue;
  }
  if (WALL_KINDS.test(name)) {
    const a = p.rotationY ?? 0;
    wallSegs.push({
      x,
      z,
      ax: Math.cos(a),
      az: Math.sin(a),
      soft: SOFT_FOR_PLAYER.test(name)
    });
    continue;
  }
  // 성문(gate-arch)은 가운데가 길이다 — 원 하나로 막으면 길이 통째로 메워진다.
  // 양쪽 **기둥만** 작은 원 둘로 막는다 (모델 X ±0.83 이 기둥 중심, bbox 실측).
  // 기둥을 안 막으면 주민이 문틀 옆 기둥을 몸으로 뚫고 다닌다 (2026-08-28
  // 사용자 보고 "문 통과").
  if (name === "gate-arch") {
    const a = p.rotationY ?? 0;
    const s = p.scale ?? 1;
    const ox = Math.cos(a) * 0.83 * s; // 로컬 +X 축의 월드 방향 (건물 상자와 같은 관례)
    const oz = -Math.sin(a) * 0.83 * s;
    // r 은 몸 반지름(0.42)이 더해진다 — 크게 주면 문 가운데 통로가 닫힌다
    // (0.75 − r − 0.42 가 통행 반폭). 0.12 면 통로 0.44, 기둥은 그대로 막힌다.
    addBlocker({x: x + ox, z: z + oz, r: 0.12 * s});
    addBlocker({x: x - ox, z: z - oz, r: 0.12 * s});
    continue;
  }
  // 민가는 시야도 가린다 (건물과 같은 취급). 높이는 실측 대신 넉넉히 2.0 —
  // 카메라가 지붕 위로 넘어가면 어차피 안 가린다.
  if (/^house-[abc]$/.test(name))
    viewDiscs.push({x, z, r: 1.15, top: terrainHeightAt(x, z) + 2});

  const r = radiusFor(p.glb);
  // soft 를 여기서 **반드시** 같이 넣어야 한다. 담장(wallSegs)에만 달고 여기를
  // 빼먹었더니 나무·덤불·바위가 그대로 막혀서, 통과되는 건 울타리뿐이었다
  // (2026-08-29 사용자 보고 "꽃이나 바위가 아직도 막힌다").
  if (r > 0) addBlocker({x, z, r, soft: SOFT_FOR_PLAYER.test(name)});
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
      const h = terrainHeightAt(p.x + (p.x - q.x) / L, p.z + (p.z - q.z) / L);
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
/** 다리 상판 위라면 실측 곡선 높이, 아니면 null (위 BRIDGE_DECK_PROFILE 절) */
function bridgeSpanHeightAt(x: number, z: number): number | null {
  let best: number | null = null;
  for (const b of BRIDGE_SPANS) {
    const dx = x - b.x;
    const dz = z - b.z;
    if (Math.abs(dx) > b.halfLen + 1 || Math.abs(dz) > b.halfLen + 1) continue;
    const u = dx * b.ax + dz * b.az;
    if (Math.abs(u) > b.halfLen) continue;
    const v = -dx * b.az + dz * b.ax;
    if (Math.abs(v) > b.halfW) continue;
    const h = b.y + deckLocalY(u / b.s) * b.s;
    if (best === null || h > best) best = h;
  }
  return best;
}

export function walkHeightAt(x: number, z: number): number {
  // 고리 회랑이 물보다 먼저다 — 데크는 수면 위에 떠 있다
  if (onPlazaRing(x, z)) return PLAZA_RING.deck;
  const span = bridgeSpanHeightAt(x, z);
  if (isWater(x, z)) {
    if (span !== null) return span; // 다리 — 상판 곡선 위를 걷는다
    const deck = bridgeDeckAt(x, z);
    if (deck !== null) return deck; // 안전망 — 프롭이 없는 다리 칸
    return -waterDepthAt(x, z);
  }
  const ground = terrainHeightAt(x, z);
  // 뭍 위 경사로 — 상판이 지형보다 높으면 상판을 밟는다 (안 그러면 경사로에 파묻힌다)
  return span !== null && span > ground ? span : ground;
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

// ─── 카메라 시야 ─────────────────────────────────────────────────────────────
//
// 3인칭 카메라가 건물 뒤로 넘어가면 캐릭터가 벽에 가려 안 보인다. 흔한 해법이
// **스프링 암**이다 — 캐릭터에서 카메라 자리까지 선을 그어, 막히면 맞은 지점
// 앞까지 카메라를 당긴다.
//
// three 의 레이캐스터는 **여기서 쓸 수 없다.** 이 리포는 "히트박스만 레이캐스트"
// 규칙이라 건물 GLB 메시가 전부 `raycast = noop` 이다(포인터 판정을 투명 상자에
// 몰아 준 구조). 쏴 봐야 건물에 안 맞는다.
//
// 대신 걷기 판정이 이미 갖고 있는 **회전된 상자**를 그대로 쓴다. 선 위의 점 몇
// 개를 찍어 상자 안에 들어가는지만 보면 되고, 상자가 27개뿐이라 매 프레임 돌려도
// 공짜다.
//
// **막는 것은 건물과 민가뿐이다.** 나무·울타리는 캐릭터가 통과하도록 열어 뒀는데
// (SOFT_FOR_PLAYER) 카메라만 그걸로 당겨지면 들판에서 화면이 계속 요동친다.
// 통과시키기로 한 것은 카메라도 무시하는 게 일관된다.

interface ViewBox {
  x: number;
  z: number;
  hw: number;
  hd: number;
  cos: number;
  sin: number;
  top: number;
}

const viewBoxes: ViewBox[] = villageBuildings
  .filter(b => Math.hypot(b.position[0], b.position[2]) < WALK_RADIUS + 10)
  .map(b => {
    const r = b.rotationY ?? 0;
    return {
      x: b.position[0],
      z: b.position[2],
      hw: b.size[0] / 2,
      hd: b.size[2] / 2,
      cos: Math.cos(r),
      sin: Math.sin(r),
      top: terrainHeightAt(b.position[0], b.position[2]) + b.size[1]
    };
  });

function insideView(x: number, y: number, z: number): boolean {
  for (const b of viewBoxes) {
    if (y > b.top) continue; // 지붕 위로 넘어간 카메라는 안 가린다
    const dx = x - b.x;
    const dz = z - b.z;
    if (Math.abs(dx) > 7 || Math.abs(dz) > 7) continue;
    const lx = b.cos * dx - b.sin * dz;
    const lz = b.sin * dx + b.cos * dz;
    if (Math.abs(lx) < b.hw && Math.abs(lz) < b.hd) return true;
  }
  for (const d of viewDiscs) {
    if (y > d.top) continue;
    const dx = x - d.x;
    const dz = z - d.z;
    if (dx * dx + dz * dz < d.r * d.r) return true;
  }
  return false;
}

/**
 * 캐릭터(from)에서 카메라 자리(to)까지 **트여 있는 비율**. 1 이면 그대로 두면
 * 되고, 0.4 면 40% 지점까지만 물러날 수 있다는 뜻이다.
 *
 * 선을 따라 점을 찍어 본다. 정확한 선-상자 교차식을 풀 수도 있지만, 표본이면
 * 높이 판정(지붕 위는 안 가림)이 공짜로 따라오고 코드가 절반이다. 표본 간격이
 * 0.35 라 벽 두께(최소 1.2)를 지나칠 수 없다.
 */
export function viewClearFraction(
  fromX: number,
  fromY: number,
  fromZ: number,
  toX: number,
  toY: number,
  toZ: number
): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dz = toZ - fromZ;
  const len = Math.hypot(dx, dy, dz);
  if (len < 0.01) return 1;
  const steps = Math.max(4, Math.ceil(len / 0.35));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    if (insideView(fromX + dx * t, fromY + dy * t, fromZ + dz * t)) {
      // 맞기 **직전** 표본까지가 안전하다
      return Math.max(0, (i - 1) / steps);
    }
  }
  return 1;
}

/**
 * 그 자리에 설 수 있나. 컨트롤러가 매 프레임 다음 위치로 물어본다.
 *
 * 예전에는 **건물만** 봤다. 그런데 걷는 범위 안에 닿는 건물은 둘뿐이고,
 * 실제로 몸이 부딪히는 건 분수·축대·가로등·나무 같은 장식물 108개였다 —
 * 그게 전부 그냥 통과됐다. "캐릭터가 건물을 통과한다"의 정체가 이것이다.
 */
export function isWalkable(x: number, z: number): boolean {
  return walkableWith(x, z, false);
}

/**
 * 플레이어 전용 판정 — 위 `SOFT_FOR_PLAYER` 는 통과한다.
 * 섬 경계·건물·민가·분수 같은 큰 것만 그대로 막힌다.
 */
export function isWalkablePlayer(x: number, z: number): boolean {
  return walkableWith(x, z, true);
}

function walkableWith(x: number, z: number, asPlayer: boolean): boolean {
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
      if (asPlayer && b.soft) continue;
      const rr = b.r + CHARACTER_RADIUS;
      const dx = x - b.x;
      const dz = z - b.z;
      if (dx * dx + dz * dz < rr * rr) return false;
    }
  }

  for (const w of wallSegs) {
    if (asPlayer && w.soft) continue;
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
  // **플레이어 판정이다.** 주민은 slideToDry/steerDry 를 쓰고 그쪽은 엄격한
  // isWalkable 을 본다 — 울타리·덤불을 뚫고 다니는 주민이 안 생기도록.
  return slideWith(isWalkablePlayer, fromX, fromZ, toX, toZ);
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
