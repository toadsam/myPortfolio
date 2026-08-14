import terraces from "@/data/villageTerraces.json";
import {reliefAt} from "./villageRelief";

// 구역 단차 — 컨셉 아트의 마을은 평지가 아니라 계단식이다. 광장이 제일 낮고
// 여섯 구역이 각각 한 단 올라앉아 있어서, 이름표를 안 읽어도 부감에서 그림자로
// 덩어리가 갈린다.
//
// ── 왜 높이를 propsLayout.json 에 안 굽나 ──────────────────────────────────
// 프롭 1,275개의 y 를 데이터에 써 넣으면 되돌릴 방법이 사실상 없다(생성기를
// 다시 돌려도 그 사이 손으로 옮긴 것까지 같이 날아간다). 대신 좌표는 그대로 두고
// **그릴 때** 이 함수로 y 를 더한다. STEP 을 0 으로 두면 예전 평지로 정확히
// 복귀한다 — 단 한 줄이 되돌리기 스위치다.
//
// ── 왜 경사가 아니라 한 단으로 뚝 끊는가 ────────────────────────────────────
// 바닥 판석은 두께 없는 평면 한 장이다. 경사로 만들면 타일마다 중심 높이만
// 달라져서 이음매마다 틈이 벌어지고 그 사이로 아래가 비친다. 단으로 끊으면
// **모든 타일이 평평한 단 위에 딱 눕는다** — 타일 중심이 사각형 안이면 위, 밖이면 아래.
//
// 처음엔 폭 PITCH 짜리 중간 단을 하나 끼워 0 → STEP/2 → STEP 으로 올렸다. 그런데
// 구역을 떼어 놓고 보니 그 중간 단이 **구역 사이 골짜기를 통째로 덮어** 버렸다
// (골짜기 폭이 2~3칸인데 중간 단이 양쪽에서 한 칸씩 먹는다). 골짜기가 바닥까지
// 안 내려가면 물을 흘릴 수도, 단이 옆에서 보이지도 않는다. 그래서 한 단으로 돌아왔다.

// 알려진 한계: 개발용 프롭 편집기(PropsEditor)의 드래그는 y=0 평면에 레이캐스트하므로,
// 단 위에 놓을 때 커서와 프롭이 단 높이만큼 어긋난다. 놓고 나면 자리는 맞다.

/** 단 높이. **0 으로 두면 예전 평지 그대로다.** */
// 0.7 로는 마을 안에서 층이 거의 안 느껴졌다. 캐릭터 키가 0.8 이니 1.1 은 눈높이 아래다.
export const TERRACE_STEP: number = 1.1;

const PITCH: number = terraces.pitch;
const HALF = PITCH / 2;

export type IslandDisc = {district: string; x: number; z: number; r: number};

/**
 * 구역 **원반 섬** — 컨셉의 마을은 둥근 섬들이다. 반지름은 생성기가 그 구역
 * 건물의 가장 먼 모서리 + 둘레 여유로 계산해 내보낸다. 한동안 사각형이었는데
 * (격자 스냅 시절), 물에 뜬 "섬"으로 읽히려면 원이어야 해서 바꿨다.
 */
export const ISLANDS: IslandDisc[] = terraces.islands ?? [];

/**
 * 구역 사이 골짜기를 흐르는 물길. 생성기(generate-ground-layout.mjs)가 계산해
 * 같은 파일에 내보낸다 — 씬과 장식물 생성기가 **같은 좌표**를 봐야 다리가 물 위에 선다.
 */
export const WATER_CHANNELS: {x: number; z: number}[][] = terraces.channels ?? [];

/**
 * 마을 속을 채우는 물(석호)의 껍질 — 볼록 다각형.
 *
 * 물을 리본으로 그리던 시절이 있었다(광장 고리 + 개울 여섯). 컨셉의 발상은 반대다:
 * **물이 바닥이고 땅이 그 위로 솟는다.** 구역 단(+1.1)과 광장 섬이 물에서 올라온
 * 것이고, 높이 0 인 곳은 전부 수면이다. 그래서 규칙이 "높이 0 이면 물" 하나로
 * 줄고, 남는 문제는 "어디까지가 마을 속인가"뿐이다 — 그게 이 껍질이다.
 *
 * 구역 블록 모서리들의 볼록 껍질이라, 경계가 구역 바깥 변을 따라 지나간다.
 * 그래서 물가가 늘 축대 뒤에 숨고, 벌판 한복판에 물가가 생기지 않는다.
 */
export const LAGOON: {x: number; z: number}[] = terraces.lagoon ?? [];

/** 길이 물을 건너는 곳 — 여기에 돌다리가 선다 */
export const WATER_CROSSINGS: {x: number; z: number; angle: number}[] =
  terraces.crossings ?? [];

/**
 * 물에 잠겨 걷어낸 **길 칸 그대로**의 목록. 다리가 잇는 자리라 여전히 길이다.
 *
 * 걷기 판정의 구멍을 "건널목 중심 ± 고정 반경"으로 뚫었다가 크게 데었다. 물이
 * 리본이던 시절엔 폭이 2 라 1.6 이면 넉넉했는데, 물이 면이 되면서 광장 섬과 구역
 * 사이가 4 유닛까지 벌어졌다 — 구멍이 물을 다 못 덮어 **다리가 있는데 못 건너고**
 * 걸어서 닿는 건물이 0채가 됐다. 걷어낸 칸을 그대로 뚫으면 폭이 어떻게 변해도 맞다.
 */
export const BRIDGE_CELLS: {x: number; z: number}[] = terraces.bridgeCells ?? [];

// ─── 물의 치수 — **여기 하나뿐이다** ─────────────────────────────────────────
// 이 값을 보는 곳이 넷이다: 수면 리본(VillageScene) · 도랑 단면(WaterBanks) ·
// 걷기 판정(villageWalk) · 배치 생성기 둘(길 타일을 걷어낼 폭, 프롭 금지 반경).
// 예전엔 0.62 니 0.95 니 하는 숫자가 그 넷에 따로 적혀 있었고 이미 서로 달랐다 —
// 걷기 판정만 가장 넓은 값으로 다 막아서 걸어 다닐 땅이 실제보다 훨씬 좁았다.
// 생성기는 `scripts/lib/read-village.mjs` 의 readWaterHalf() 로 여기서 읽어 간다.
//
// ─── 폭을 넓히지 말 것 ───────────────────────────────────────────────────────
// 물이 얇아 보인다고 고리를 0.95, 개울을 0.7~1.2 로 넓혀 봤다. 그림은 나아졌지만
// **걸어 다닐 땅이 반으로 줄었다**(설 수 있는 땅의 82% → 45%, 걸어서 닿는 건물
// 13채 → 3채). 물가 금지 반경이 구역 단 발치·담장과 맞붙어 고리 바깥 띠가
// 통째로 막혔기 때문이다. 물을 두껍게 보이게 하는 건 폭이 아니라 **도랑**이다 —
// WATER_BANK_OUT 을 줄이고 하상 색을 밝히는 쪽으로 해결했다.
export const WATER_HALF = {
  /** 광장을 두르는 물 고리 */
  ring: 1.05,
  /** 골짜기 물길 — 안쪽(고리에서 갈라질 때) */
  channelIn: 0.75,
  /** 〃 바깥(해자에 닿을 때). 넓어지면서 흐르는 방향이 읽힌다 */
  channelOut: 1.3
};

/**
 * 수면 가장자리에서 이만큼 밖이면 다시 지면 높이 — 도랑 비탈이 차지하는 폭.
 *
 * 1.2 로 뒀더니 폭 3.6 짜리 띠 안에서 물이 1.2 뿐이라, 부감에서 개울이 아니라
 * **어두운 고랑**으로 읽혔다. 0.75 면 띠의 절반 가까이가 물이고, 도랑이
 * 먹는 땅도 줄어 걸어 다닐 자리가 남는다.
 */
export const WATER_BANK_OUT = 0.45;

/** 리본 반폭 — t 는 경로를 따라 0~1 */
export function waterHalfAt(kind: "ring" | "channel", t: number): number {
  if (kind === "ring") return WATER_HALF.ring;
  return WATER_HALF.channelIn + (WATER_HALF.channelOut - WATER_HALF.channelIn) * t;
}

// ─── 광장 섬 ──────────────────────────────────────────────────────────────────
// 광장은 오래 잔디·물과 같은 평면이었다. 단면으로 보면 마을이 **가운데가 파인
// 그릇**이고 기념비가 그 바닥에 서 있었다 — 컨셉과 정반대다.
//
// 한동안 0.55(구역의 절반)로 뒀다. 마을 속 바닥이 전부 물이 된 지금은 **구역과
// 같은 높이**라야 한다 — 사방이 물인데 절반 높이면 가장 중요한 섬이 제일 낮은
// 섬이 되고, 물에서 살짝 나온 여울턱으로 읽힌다.
export const PLAZA_STEP: number = TERRACE_STEP;

/**
 * 단상 꼭대기 테두리 (닫힌 폴리라인 240마디).
 *
 * **사각형이 아닌 이유**: 광장 포장은 사각형이 아니다. 대로 넷이 축 방향 칸을
 * 먹고, SKILLS 단 모서리가 한쪽을 파고든다. 사각형 단을 깔면 네 모서리가 잔디로
 * 튀어나오고 대로가 계단 대신 벽을 만난다. 그래서 각도별 반지름으로 정의하고,
 * 생성기가 구역 단 발치에서 물 폭 + 축대 길이만큼 안쪽으로 물려 계산해 둔다.
 */
export const PLAZA_DAIS: {x: number; z: number}[] = terraces.plazaDais ?? [];

/** 각도별 단상 반지름 — 미리 풀어 두고 조회만 한다(매 프레임 캐릭터가 부른다) */
export const DAIS_RADII: number[] = PLAZA_DAIS.map((p) => Math.hypot(p.x, p.z));
const DAIS_R = DAIS_RADII;

/** 그 자리가 광장 단상 위인가 */
export function onPlazaDais(x: number, z: number): boolean {
  if (PLAZA_STEP === 0 || DAIS_R.length === 0) return false;
  const r = Math.hypot(x, z);
  // 가장 먼 테두리보다 밖이면 각도를 볼 것도 없다 — 프롭 수천 개가 이 분기로 빠진다
  if (r > 9.6) return false;
  const a = Math.atan2(z, x);
  const t = ((a / (Math.PI * 2)) % 1 + 1) % 1;
  return r <= DAIS_R[Math.floor(t * DAIS_R.length) % DAIS_R.length];
}

/**
 * (구식 이름) 판석 반 칸 여유 — 사각 단 시절의 값. 원반 섬의 반지름에는 이미
 * 둘레 여유가 들어 있어 섬 판정에는 안 쓰지만, 플라자 앞치마 등이 아직 읽는다.
 */
export const PLATEAU_PAD = HALF;

/** 섬 위인가 — 원반이라 중심 거리 하나로 끝난다 */
function onAnyIsland(x: number, z: number): boolean {
  for (const isl of ISLANDS) {
    const dx = x - isl.x;
    const dz = z - isl.z;
    if (dx * dx + dz * dz <= isl.r * isl.r) return true;
  }
  return false;
}

/**
 * 그 자리의 지면 높이. 바닥 타일·장식물·건물·NPC·캐릭터가 **전부 이걸 쓴다** —
 * 하나라도 다른 규칙을 쓰면 그것만 공중에 뜨거나 땅에 묻힌다.
 *
 * 구역 단(계단)과 들판 굽이(villageRelief)의 합이다. 굽이는 타일·건물·물길·단
 * 둘레에서 정확히 0 이 되도록 마스크돼 있어, 더해도 지은 곳은 평평하다.
 */
export function terrainHeightAt(x: number, z: number): number {
  const step =
    TERRACE_STEP !== 0 && onAnyIsland(x, z)
      ? TERRACE_STEP
      : onPlazaDais(x, z)
        ? PLAZA_STEP
        : 0;
  return step + reliefAt(x, z);
}

// ─── 물 ───────────────────────────────────────────────────────────────────────
// **높이 0 이면 물이다.** 단, 마을 속(석호 껍질 안)에서만 — 껍질 밖은 벌판·숲이고
// 그 너머에 해자가 따로 있다. 걷기 판정·프롭 배치·바닥 타일이 전부 이 하나를 본다.
const HULL = LAGOON;

/** (x,z) 가 석호 껍질 안인가 — 볼록 다각형이라 모든 변의 같은 쪽이면 안이다 */
export function inLagoon(x: number, z: number): boolean {
  if (HULL.length < 3) return false;
  for (let i = 0; i < HULL.length; i++) {
    const a = HULL[i];
    const b = HULL[(i + 1) % HULL.length];
    if ((b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x) < 0) return false;
  }
  return true;
}

/** 그 자리가 물인가 — 마을 속이면서 섬 위가 아닌 곳 */
export function isWater(x: number, z: number): boolean {
  if (TERRACE_STEP === 0) return false;
  if (onPlazaDais(x, z)) return false;
  if (onAnyIsland(x, z)) return false;
  return inLagoon(x, z);
}

/** 구역 섬 위인가. 물길·계단처럼 "위냐 아래냐"만 필요한 데 쓴다. */
export function onTerrace(x: number, z: number): boolean {
  if (TERRACE_STEP === 0) return false;
  return onAnyIsland(x, z);
}

// ─── 물가까지의 거리와 물 깊이 ────────────────────────────────────────────────
// 물빛 셰이딩(VillageScene)과 캐릭터 가라앉음이 **같은 함수**를 봐야 한다 —
// 색이 짙어지는 곳에서 정확히 그만큼 몸이 잠겨야 눈과 발이 같은 물을 믿는다.
// 원래 VillageScene 안에 있던 계산을 여기로 올렸다.

/** 물빛이 완전히 짙어지는 물가 거리 — 석호 색·투명도 그라데이션의 축척 */
export const WATER_FULL_DEPTH = 4.5;

/**
 * 캐릭터가 최대로 잠기는 깊이(허리께). 캐릭터 키가 0.8 이니 0.55 면 가슴 아래다.
 *
 * 축척이 색(4.5)과 **다른** 이유: 골짜기 물은 폭이 4 라 물가거리가 최대 2 다.
 * 색 축척으로 깊이를 재면 골짜기 한가운데서 무릎(0.2)에서 멈춰 "빠지는 느낌"이
 * 안 난다. 몸은 두 걸음(1.6)이면 허리까지 잠기는 게 물답다.
 */
export const WADE_MAX = 0.55;
const WADE_FULL = 1.6;

/**
 * 물가(구역 단·광장 섬·석호 껍질 중 가장 가까운 것)까지의 거리.
 * 물 안에서 부르는 것을 전제한다 — 뭍에서 부르면 "가장 가까운 물가"가 아니라
 * 지금 선 뭍 자신까지의 거리(0)가 나온다.
 */
export function shoreDistAt(x: number, z: number): number {
  let best = Infinity;
  for (const isl of ISLANDS)
    best = Math.min(
      best,
      Math.max(0, Math.hypot(x - isl.x, z - isl.z) - isl.r)
    );
  const rr = Math.hypot(x, z);
  if (rr < 12 && DAIS_R.length) {
    const t = (((Math.atan2(z, x) / (Math.PI * 2)) % 1) + 1) % 1;
    const dr = DAIS_R[Math.floor(t * DAIS_R.length) % DAIS_R.length];
    best = Math.min(best, Math.abs(rr - dr));
  }
  for (let i = 0; i < HULL.length; i++) {
    const p0 = HULL[i];
    const p1 = HULL[(i + 1) % HULL.length];
    const dx = p1.x - p0.x;
    const dz = p1.z - p0.z;
    const l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - p0.x) * dx + (z - p0.z) * dz) / l2));
    best = Math.min(best, Math.hypot(x - (p0.x + dx * t), z - (p0.z + dz * t)));
  }
  return best;
}

/**
 * 그 자리의 물 깊이(양수). 물이 아니면 0.
 * 물가에서 0 으로 시작해 smoothstep 으로 내려가므로, 걸어 들어가면 턱 없이
 * 발목 → 무릎 → 허리 순서로 잠긴다.
 */
export function waterDepthAt(x: number, z: number): number {
  if (!isWater(x, z)) return 0;
  const d = Math.min(1, shoreDistAt(x, z) / WADE_FULL);
  return WADE_MAX * d * d * (3 - 2 * d);
}
