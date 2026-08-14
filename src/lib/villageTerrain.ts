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

export type TerraceRect = {district: string; x0: number; x1: number; z0: number; z1: number};

/** 생성기가 내보낸 구역 사각형 (칸 중심 기준). 바닥 판석을 깐 범위와 같다. */
export const TERRACE_RECTS: TerraceRect[] = terraces.blocks;

/**
 * 구역 사이 골짜기를 흐르는 물길. 생성기(generate-ground-layout.mjs)가 계산해
 * 같은 파일에 내보낸다 — 씬과 장식물 생성기가 **같은 좌표**를 봐야 다리가 물 위에 선다.
 */
export const WATER_CHANNELS: {x: number; z: number}[][] = terraces.channels ?? [];

/**
 * 광장을 두르는 물 고리 (닫힌 고리).
 *
 * 컨셉 아트에서 물은 광장에서 뻗는 바큇살이 아니라 광장을 **감싸고** 있고,
 * 거기서 넘친 물이 구역 사이 골짜기(WATER_CHANNELS)로 빠진다. 그래서 어느
 * 구역에 가든 다리를 하나 건너게 된다 — 다리가 곧 구역의 정문이다.
 * 완전한 원은 아니다: SKILLS 단 모서리가 광장 쪽으로 파고든 방향에서는
 * 고리도 같이 안으로 물러난다(생성기가 단 발치를 재서 정한다).
 */
export const PLAZA_WATER_RING: {x: number; z: number}[] = terraces.plazaRing ?? [];

/** 길이 물을 건너는 곳 — 여기에 돌다리가 서고, 걷기 판정도 여기만 뚫는다 */
export const WATER_CROSSINGS: {x: number; z: number; angle: number}[] =
  terraces.crossings ?? [];

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

// ─── 광장 단상 ────────────────────────────────────────────────────────────────
// 컨셉 아트의 광장은 계단 몇 단 올라선 단상이다. 구역 여섯만 단(+1.1) 위에 있고
// 광장은 잔디·물과 같은 평면이라, 단면으로 보면 마을이 **가운데가 파인 그릇**이고
// 기념비가 그 바닥에 서 있었다.
//
// **구역과 같은 높이로 올리지 않는다.** 그러면 물길 골짜기 말고는 마을 전체가
// 다시 한 평면이 되어, 구역을 떼어 놓기 전의 "층이 하나도 안 느껴진다"로 돌아간다.
// 컨셉은 세 단이다: 물·잔디(0) → 광장(0.55) → 구역(1.1).
export const PLAZA_STEP: number = TERRACE_STEP === 0 ? 0 : 0.55;

/**
 * 단상 꼭대기 테두리 (닫힌 폴리라인 240마디).
 *
 * **사각형이 아닌 이유**: 광장 포장은 사각형이 아니다. 대로 넷이 축 방향 칸을
 * 먹고, SKILLS 단 모서리가 한쪽을 파고든다. 사각형 단을 깔면 네 모서리가 잔디로
 * 튀어나오고 대로가 계단 대신 벽을 만난다. 그래서 각도별 반지름으로 정의하고,
 * 생성기가 물 고리에서 축대 길이만큼 안쪽으로 물려 계산해 둔다.
 */
export const PLAZA_DAIS: {x: number; z: number}[] = terraces.plazaDais ?? [];

/** 각도별 단상 반지름 — 미리 풀어 두고 조회만 한다(매 프레임 캐릭터가 부른다) */
const DAIS_R: number[] = PLAZA_DAIS.map((p) => Math.hypot(p.x, p.z));

/** 그 자리가 광장 단상 위인가 */
export function onPlazaDais(x: number, z: number): boolean {
  if (PLAZA_STEP === 0 || DAIS_R.length === 0) return false;
  const r = Math.hypot(x, z);
  // 가장 먼 테두리보다 밖이면 각도를 볼 것도 없다 — 프롭 수천 개가 이 분기로 빠진다
  if (r > 8.6) return false;
  const a = Math.atan2(z, x);
  const t = ((a / (Math.PI * 2)) % 1 + 1) % 1;
  return r <= DAIS_R[Math.floor(t * DAIS_R.length) % DAIS_R.length];
}

/**
 * 윗단(플래토)의 실제 경계 — 칸 중심 사각형을 반 칸 넓힌 것.
 * 이 값이 곧 **가장 바깥 판석의 바깥 모서리**라 축대가 타일과 딱 맞물린다.
 */
export const PLATEAU_PAD = HALF;

function within(r: TerraceRect, x: number, z: number, pad: number) {
  return x >= r.x0 - pad && x <= r.x1 + pad && z >= r.z0 - pad && z <= r.z1 + pad;
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
    TERRACE_STEP !== 0 && TERRACE_RECTS.some((r) => within(r, x, z, PLATEAU_PAD))
      ? TERRACE_STEP
      : onPlazaDais(x, z)
        ? PLAZA_STEP
        : 0;
  return step + reliefAt(x, z);
}

/** 구역 단 위인가. 물길·계단처럼 "위냐 아래냐"만 필요한 데 쓴다. */
export function onTerrace(x: number, z: number): boolean {
  if (TERRACE_STEP === 0) return false;
  return TERRACE_RECTS.some((r) => within(r, x, z, PLATEAU_PAD));
}
