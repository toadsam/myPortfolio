import terraces from "@/data/villageTerraces.json";
import propsLayout from "@/data/propsLayout.json";
import {villageBuildings} from "./constants";

// 들판의 완만한 굽이 — 절차적 지형 프로토타입.
//
// ── 무엇을 하나 ─────────────────────────────────────────────────────────────
// 지금 마을 땅은 당구대처럼 평평해서 "테이블 위의 모형" 느낌이 남는다. 좌표를
// 넣으면 그 자리의 땅 높이를 돌려주는 함수를 만들어, 잔디 원반의 정점과
// terrainHeightAt 을 같이 물린다 — 프롭·건물·NPC·캐릭터가 전부 그 함수를
// 이미 쓰고 있으므로, 여기 하나만 고치면 마을 전체가 새 지형에 올라탄다.
//
// ── 핵심 규칙: 지은 곳은 평평하고, 빈 들판만 굽이친다 ───────────────────────
// 세 가지가 굽이치는 땅과 물리적으로 충돌한다:
//   ① 포장 타일 229장 — 두께 없는 평면이라 밑이 굽으면 모서리가 뜨거나 박힌다
//   ② 물(해자·개울) — 수면이 y=0.05 한 장이라 잔디가 그 위로 올라오면 물이 사라진다
//   ③ 구역 단·축대 — 벽 밑동이 y=0 기준으로 지어져 있다
// 현실 논리와도 맞는다 — 사람은 지을 자리를 먼저 고른다. 그래서 어디가 "지은
// 곳"인지 손으로 안 적고, **실제 배치 데이터에서 자동으로 뽑는다**(타일 위치·
// 건물 발자국·물길 좌표). 나중에 길을 새로 깔아도 그 자리는 저절로 평평해진다.
//
// ── 왜 노이즈가 아니라 사인파 몇 개인가 ─────────────────────────────────────
// 이 작업의 실패 형태는 "노이즈 오트밀" — 잔주름이 많으면 자연스러워지는 게
// 아니라 지저분해진다. 가장 짧은 파장을 7유닛(타일의 4배)으로 묶어 두면
// 잔주름 자체가 존재할 수 없다. waterFlow 의 WAVES 와 같은 사고방식이다.

/** **false 로 두면 예전 평지 그대로다.** 되돌리기 스위치: /?relief=0 */
export const RELIEF_ENABLED: boolean =
  typeof window === "undefined" || new URLSearchParams(window.location.search).get("relief") !== "0";

/**
 * 들판이 오르내리는 최대 폭(유닛). 캐릭터 키가 1.05, 구역 단이 1.1 이므로
 * 0.6 은 "무릎 높이 둔덕" — 층은 단이 만들고 굽이는 거들기만 한다.
 * 아래에서 실측 최대값으로 정규화하므로 이 숫자가 곧 실제 최대 높이다.
 */
const RELIEF_AMP = 0.6;

/**
 * 평평 구역 경계에서 굽이가 완전히 살아나기까지의 거리(유닛).
 *
 * 처음 3.5 로 뒀더니 해자 평탄대·테두리 페이드와 겹쳐 **들판 어디에도 굽이가
 * 온전히 사는 자리가 없었다** (|h|>0.1 인 지점이 섬의 20%뿐, 화면에서는 거의
 * 평지로 보였다). 마진은 안전을 사지만 그만큼 효과를 먹는다 — 2.2 면 타일
 * 모서리(경계에서 0.5유닛)의 들림이 최대 몇 cm 로, 잔디에 가려 안 보인다.
 */
const FADE = 2.2;

// ─── 섬 테두리 ────────────────────────────────────────────────────────────────
// VillageScene 의 ISLAND_CENTER [0,0,3] / ISLAND_RADIUS 40 과 같아야 한다.
// 절벽 안쪽 링이 반지름 40, 높이 0 에서 잔디와 만나므로, 그 전에 굽이를 0 으로
// 눕혀야 이음매가 안 벌어진다.
const ISLAND = {cx: 0, cz: 3, r: 40};
// 35.5 부터 — 33 으로 뒀더니 해자 바깥 들판(r 25~33)이 페이드에 통째로 먹혔다.
// 숲 임포스터 띠(r ~33+)는 프롭이라 굽이를 타고 올라가므로 겹쳐도 문제없다.
const EDGE_FADE_START = 35.5;
const EDGE_FADE_END = 39;

/**
 * 마을을 두르는 해자 타원. Waterways(VillageScene)가 이 값으로 리본을 그린다 —
 * 두 곳이 다른 값을 보면 물은 이쪽에서 흐르는데 땅은 저쪽에서 평평해진다.
 */
export const MOAT = {cx: 0, cz: 1, a: 27, b: 21.7};
/** 해자 리본 반폭 1.23 + 흔들림(drift) 1.9 + 여유 0.3 → 이 안은 전부 평평하게 */
const MOAT_FLAT_HALF = 3.4;

// ─── 들판을 이루는 파도 ───────────────────────────────────────────────────────
// 방향이 제각각인 사인파 넷. 하나만 쓰면 밭고랑처럼 줄무늬가 지고, 방향을
// 겹치면 줄이 사라지고 둔덕이 된다. 진폭은 파장에 비례해 내린다 — 잔결이
// 형태를 주장하기 시작하면 오트밀이 된다(waterFlow 에서 배운 그 교훈).
// 지배 파장을 27 → 18 로 내렸다. 들판은 폭 6~10유닛의 **띠**라서, 27유닛짜리
// 너울은 띠 안에서 반의반 밖에 못 펼쳐져 완만한 경사로만 보였다. 18 이면 띠를
// 가로질러 둔덕 하나가 통째로 들어간다.
const WAVES: {wavelength: number; amp: number; dirDeg: number; phase: number}[] = [
  {wavelength: 18, amp: 1.0, dirDeg: 15, phase: 0.9},
  {wavelength: 11, amp: 0.55, dirDeg: 74, phase: 2.4},
  {wavelength: 7, amp: 0.28, dirDeg: 133, phase: 4.2},
];
const TAU = Math.PI * 2;
// 미리 계산해 둔 (파수 벡터, 위상)
const WAVE_K = WAVES.map((w) => {
  const rad = (w.dirDeg * Math.PI) / 180;
  const k = TAU / w.wavelength;
  return {kx: Math.cos(rad) * k, kz: Math.sin(rad) * k, amp: w.amp, phase: w.phase};
});

function rawField(x: number, z: number): number {
  let h = 0;
  for (const w of WAVE_K) h += Math.sin(x * w.kx + z * w.kz + w.phase) * w.amp;
  return h;
}

// ─── 평평 구역 마스크 ─────────────────────────────────────────────────────────
// 1유닛 격자에 "지은 곳"을 찍고, 거리 변환으로 부드럽게 번지는 마스크를 만든다.
// 처음엔 블러로 뭉개려 했는데, 블러는 평평해야 할 구역 **안쪽으로도** 새어
// 들어간다 — 타일 가장자리가 슬금슬금 들리는, 눈치채기 힘든 어긋남이 된다.
// 거리 변환은 찍은 곳이 정확히 0 이고 바깥으로만 번진다.
const GX0 = -41;
const GZ0 = -38;
const GN = 84; // 84×84칸 × 1유닛 — 섬(반지름 40)을 다 덮는다
const CELL = 1;

const solid = new Uint8Array(GN * GN); // 1 = 지은 곳
const mask = new Float32Array(GN * GN); // 0 = 평평, 1 = 굽이 온전히

function stampCircle(x: number, z: number, radius: number) {
  const ci = Math.round((x - GX0) / CELL);
  const cj = Math.round((z - GZ0) / CELL);
  const r = Math.ceil(radius / CELL);
  for (let j = cj - r; j <= cj + r; j++) {
    if (j < 0 || j >= GN) continue;
    for (let i = ci - r; i <= ci + r; i++) {
      if (i < 0 || i >= GN) continue;
      const dx = i * CELL + GX0 - x;
      const dz = j * CELL + GZ0 - z;
      if (dx * dx + dz * dz <= radius * radius) solid[j * GN + i] = 1;
    }
  }
}

function buildMask() {
  const pad = terraces.pitch / 2; // villageTerrain 의 PLATEAU_PAD 와 같은 식

  // ① 구역 단 — 축대 발치(y=0)가 평평한 땅을 전제로 지어져 있다
  for (const r of terraces.blocks as {x0: number; x1: number; z0: number; z1: number}[]) {
    const m = pad + 0.8;
    for (let z = r.z0 - m; z <= r.z1 + m; z += CELL * 0.9) {
      for (let x = r.x0 - m; x <= r.x1 + m; x += CELL * 0.9) stampCircle(x, z, 0.7);
    }
  }

  // ② 포장 타일·광장 원반. 풀숲(grass-patch)은 땅을 따라도 되므로 뺀다.
  for (const p of (propsLayout as {props: {id: string; glb: string; position: number[]; scale: number}[]}).props) {
    if (!p.id.startsWith("ground-")) continue;
    if (p.glb.includes("grass-patch")) continue;
    // 타일 한 칸이 1.88유닛 — 반대각 1.33 에 여유를 더한다. 광장 원반은 scale 로 커진다.
    stampCircle(p.position[0], p.position[2], 1.6 * (p.scale || 1));
  }

  // ③ 건물 발자국 — 바닥 링·앞마당이 평평한 땅을 전제로 한다
  for (const b of villageBuildings) {
    stampCircle(b.position[0], b.position[2], Math.max(b.size[0], b.size[2]) / 2 + 1.0);
  }

  // ④ 물길 — 수면(y=0.05)보다 잔디가 높아지면 물이 사라진다
  for (const channel of (terraces.channels ?? []) as {x: number; z: number}[][]) {
    for (let i = 0; i + 1 < channel.length; i++) {
      const a = channel[i];
      const b = channel[i + 1];
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const steps = Math.max(1, Math.ceil(len / 0.5));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        stampCircle(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 2.4);
      }
    }
  }

  // ⑤ 해자 띠 — 타원 한 바퀴를 촘촘히 밟으며 찍는다
  const STEPS = 280;
  for (let s = 0; s < STEPS; s++) {
    const ang = (s / STEPS) * TAU;
    stampCircle(MOAT.cx + Math.cos(ang) * MOAT.a, MOAT.cz + Math.sin(ang) * MOAT.b, MOAT_FLAT_HALF);
  }

  // ── 거리 변환(chamfer, 앞뒤 두 번 훑기) → 지은 곳에서 멀수록 굽이가 살아난다
  const INF = 1e9;
  const dist = new Float32Array(GN * GN);
  for (let g = 0; g < GN * GN; g++) dist[g] = solid[g] ? 0 : INF;
  const D = CELL;
  const DIAG = CELL * Math.SQRT2;
  for (let j = 0; j < GN; j++) {
    for (let i = 0; i < GN; i++) {
      const g = j * GN + i;
      if (i > 0) dist[g] = Math.min(dist[g], dist[g - 1] + D);
      if (j > 0) dist[g] = Math.min(dist[g], dist[g - GN] + D);
      if (i > 0 && j > 0) dist[g] = Math.min(dist[g], dist[g - GN - 1] + DIAG);
      if (i < GN - 1 && j > 0) dist[g] = Math.min(dist[g], dist[g - GN + 1] + DIAG);
    }
  }
  for (let j = GN - 1; j >= 0; j--) {
    for (let i = GN - 1; i >= 0; i--) {
      const g = j * GN + i;
      if (i < GN - 1) dist[g] = Math.min(dist[g], dist[g + 1] + D);
      if (j < GN - 1) dist[g] = Math.min(dist[g], dist[g + GN] + D);
      if (i < GN - 1 && j < GN - 1) dist[g] = Math.min(dist[g], dist[g + GN + 1] + DIAG);
      if (i > 0 && j < GN - 1) dist[g] = Math.min(dist[g], dist[g + GN - 1] + DIAG);
    }
  }
  for (let g = 0; g < GN * GN; g++) {
    const t = Math.min(1, dist[g] / FADE);
    mask[g] = t * t * (3 - 2 * t); // smoothstep — 경계에서 꺾임 없이 이어진다
  }
}

/** 마스크를 부드럽게 읽는다(이중선형). 격자 밖은 0 — 굽이 없음. */
function maskAt(x: number, z: number): number {
  const fx = (x - GX0) / CELL;
  const fz = (z - GZ0) / CELL;
  const i = Math.floor(fx);
  const j = Math.floor(fz);
  if (i < 0 || j < 0 || i >= GN - 1 || j >= GN - 1) return 0;
  const tx = fx - i;
  const tz = fz - j;
  const g = j * GN + i;
  const a = mask[g] + (mask[g + 1] - mask[g]) * tx;
  const b = mask[g + GN] + (mask[g + GN + 1] - mask[g + GN]) * tx;
  return a + (b - a) * tz;
}

// ─── 정규화 ──────────────────────────────────────────────────────────────────
// waterFlow 에서 배운 것: 파를 더하거나 빼면 합성 최대값이 예측 불가로 튄다.
// 실측 최대로 나눠야 RELIEF_AMP 가 약속(실제 최대 높이)을 지킨다.
let norm = 0;

function measureNorm() {
  let maxAbs = 1e-6;
  for (let z = GZ0; z < GZ0 + GN; z += 2) {
    for (let x = GX0; x < GX0 + GN; x += 2) {
      const a = Math.abs(rawField(x, z));
      if (a > maxAbs) maxAbs = a;
    }
  }
  norm = RELIEF_AMP / maxAbs;
}

if (RELIEF_ENABLED) {
  buildMask();
  measureNorm();
}

/**
 * 그 자리의 들판 굽이 높이. terrainHeightAt 이 구역 단 위에 더해 쓴다.
 * 지은 곳(타일·건물·물길·단 둘레)에서는 정확히 0 이다.
 */
export function reliefAt(x: number, z: number): number {
  if (!RELIEF_ENABLED) return 0;
  const m = maskAt(x, z);
  if (m <= 0) return 0;
  // 섬 테두리로 갈수록 눕혀서 절벽 이음매(r=40, y=0)를 지킨다
  const dx = x - ISLAND.cx;
  const dz = z - ISLAND.cz;
  const r = Math.hypot(dx, dz);
  if (r >= EDGE_FADE_END) return 0;
  let edge = 1;
  if (r > EDGE_FADE_START) {
    const t = 1 - (r - EDGE_FADE_START) / (EDGE_FADE_END - EDGE_FADE_START);
    edge = t * t * (3 - 2 * t);
  }
  return rawField(x, z) * norm * m * edge;
}
