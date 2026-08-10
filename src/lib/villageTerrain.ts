import terraces from "@/data/villageTerraces.json";

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
// ── 왜 매끄러운 경사가 아니라 두 단 계단인가 ────────────────────────────────
// 바닥 판석은 두께 없는 평면 한 장이다. 경사로 만들면 타일마다 중심 높이만
// 달라져서 이음매마다 틈이 벌어지고 그 사이로 아래가 비친다. 격자 한 칸(PITCH)
// 마다 정확히 한 단씩 끊으면 **모든 타일이 평평한 단 위에 딱 눕는다.**
// 그래서 폭이 PITCH 인 중간 단을 하나 두고 0 → STEP/2 → STEP 으로 오른다.

// 알려진 한계: 개발용 프롭 편집기(PropsEditor)의 드래그는 y=0 평면에 레이캐스트하므로,
// 단 위에 놓을 때 커서와 프롭이 단 높이만큼 어긋난다. 놓고 나면 자리는 맞다.

/** 단 높이. **0 으로 두면 예전 평지 그대로다.** */
export const TERRACE_STEP: number = 0.7;

const PITCH: number = terraces.pitch;
const HALF = PITCH / 2;

export type TerraceRect = {district: string; x0: number; x1: number; z0: number; z1: number};

/** 생성기가 내보낸 구역 사각형 (칸 중심 기준). 바닥 판석을 깐 범위와 같다. */
export const TERRACE_RECTS: TerraceRect[] = terraces.blocks;

/** 윗단(플래토)의 실제 경계 — 칸 중심 사각형을 반 칸 넓힌 것 */
export const PLATEAU_PAD = HALF;
/** 중간단 바깥 경계 */
export const BANK_PAD = HALF + PITCH;

function within(r: TerraceRect, x: number, z: number, pad: number) {
  return x >= r.x0 - pad && x <= r.x1 + pad && z >= r.z0 - pad && z <= r.z1 + pad;
}

/**
 * 그 자리의 지면 높이. 바닥 타일·장식물·건물·NPC·캐릭터가 **전부 이걸 쓴다** —
 * 하나라도 다른 규칙을 쓰면 그것만 공중에 뜨거나 땅에 묻힌다.
 */
export function terrainHeightAt(x: number, z: number): number {
  if (TERRACE_STEP === 0) return 0;
  for (const r of TERRACE_RECTS) if (within(r, x, z, PLATEAU_PAD)) return TERRACE_STEP;
  for (const r of TERRACE_RECTS) if (within(r, x, z, BANK_PAD)) return TERRACE_STEP / 2;
  return 0;
}

/** 어느 단인지 (0·1·2). 담장처럼 "한 구역은 한 단" 이어야 하는 것에 쓴다. */
export function terrainLevelAt(x: number, z: number): 0 | 1 | 2 {
  if (TERRACE_STEP === 0) return 0;
  for (const r of TERRACE_RECTS) if (within(r, x, z, PLATEAU_PAD)) return 2;
  for (const r of TERRACE_RECTS) if (within(r, x, z, BANK_PAD)) return 1;
  return 0;
}
