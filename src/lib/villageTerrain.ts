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
      : 0;
  return step + reliefAt(x, z);
}

/** 구역 단 위인가. 물길·계단처럼 "위냐 아래냐"만 필요한 데 쓴다. */
export function onTerrace(x: number, z: number): boolean {
  if (TERRACE_STEP === 0) return false;
  return TERRACE_RECTS.some((r) => within(r, x, z, PLATEAU_PAD));
}
