/**
 * 갓생 섬 작업실 — 무엇을 어디에 놓는가.
 *
 * ## 마을의 유닛 체계를 일부러 안 쓴다
 *
 * 마을은 `1 유닛 = 2.5 m` 로 살고, 좌표가 `constants.ts` 의 `spread()` 에 묶여 있다.
 * 여기는 그 좌표계와 **공유하는 게 하나도 없는 독립된 방**이라, 유닛으로 환산하면
 * 방 한 칸이 2×2 짜리 소수점 놀이가 된다. 그래서 **전부 미터로 적는다.**
 * (`@/lib/constants` 를 import 하지 않는 이유이기도 하다 — 그 모듈은 로드되는
 * 순간 마을 건물 배열을 통째로 계산한다.)
 *
 * ## 두 가지 원점 규칙 — 이걸 섞으면 물건이 바닥에 묻힌다
 *
 * 실측(gltf-transform)으로 확인한 사실:
 *
 * - **프롭**은 원점이 bbox 한가운데다(`minY ≈ -h/2`). 바닥에 세우려면
 *   높이의 절반만큼 올려야 한다 → `y = metres / 2`
 * - **캐릭터**는 발이 원점이다(`minY = 0`). 그대로 0 에 놓으면 선다 → `y = 0`
 *
 * `h` 는 원본 GLB 의 실측 높이다. 모델을 다시 뽑으면 여기도 고쳐야 한다
 * (마을의 `scripts/generate-decor-layout.mjs` 의 KIT 표와 같은 값).
 */

export interface RoomProp {
  glb: string;
  /** 원본 GLB 높이 — 배율 계산에 쓴다 */
  h: number;
  /** 이 방에서 갖고 싶은 실제 높이(미터) */
  metres: number;
  /** 바닥 위치 [x, z] (미터) */
  at: [number, number];
  rotationY?: number;
  /** 캐릭터처럼 발이 원점인 모델은 true — y 보정을 하지 않는다 */
  feetAtOrigin?: boolean;
}

const P = "/models/props/decor/";

/**
 * 방 크기는 6×6 m. 고정 카메라 한 대에서 한눈에 들어오는 최대치다.
 * 뒤(-z)가 벽, 앞(+z)이 카메라 쪽이라 앞쪽은 비워 둔다.
 */
export const ROOM_SIZE = 11;

/**
 * 배치의 제약 두 가지 — 둘 다 실제로 한 번씩 어겼다.
 *
 * **① 가운데는 비운다.** 이 방 위에는 폭 ~490px 짜리 패널 기둥이 화면 한가운데
 * 떠 있다. 거기 놓은 물건은 그냥 안 보인다(게시판을 정중앙에 뒀다가 통째로 가렸다).
 * 눈에 걸릴 것들은 좌우로 밀고, 가운데엔 게시판만 깊숙이 세워 머리만 걸치게 한다.
 *
 * **② 높이만 보고 놓지 않는다.** Meshy 모델은 최대 변이 ~1.9 로 정규화돼 있어서
 * `h`(높이)가 크기를 대표하지 못한다. 실측 가로/세로 비:
 *
 *   wall-low 3.3배 · bench 1.7배 · campfire 1.5배 · notice-board 1.1배 · lantern-post 0.2배
 *
 * `wall-low` 를 1.6 m 높이로 세웠더니 **가로 5.3 m 짜리 담**이 되어 화면 좌우를
 * 통째로 먹었다. 그래서 낮은 담은 뺐다 — 방의 테두리는 `IslandRoom` 의 벽 판이
 * 이미 만든다. 넓적한 모델을 새로 놓을 땐 위 비율을 곱해서 실제 폭을 먼저 볼 것.
 */
export const ROOM_PROPS: RoomProp[] = [
  // ── 뒷벽 한가운데: 게시판. 패널 위쪽으로만 걸치도록 깊이 넣는다 ──
  {glb: `${P}notice-board.glb`, h: 1.697, metres: 2.3, at: [0, -4.6]},

  // ── 왼쪽 무리 ──
  {glb: `${P}campfire.glb`, h: 1.279, metres: 0.9, at: [-3.4, -3.2]},
  {glb: `${P}scroll-barrel.glb`, h: 1.897, metres: 1.1, at: [-2.7, -4.2]},
  {glb: `${P}orb-lantern.glb`, h: 1.899, metres: 0.75, at: [-2.0, -2.6]},
  {
    glb: `${P}candle-tome.glb`,
    h: 1.898,
    metres: 1.1,
    at: [-3.3, -1.8],
    rotationY: 0.6
  },

  // ── 오른쪽 무리 ──
  {glb: `${P}lantern-post.glb`, h: 1.894, metres: 3.0, at: [3.6, -3.4]},
  {glb: `${P}barrel-iron.glb`, h: 1.898, metres: 1.0, at: [2.6, -4.3]},
  {
    glb: `${P}bench.glb`,
    h: 1.122,
    metres: 1.0,
    at: [4.4, -2.9],
    rotationY: -1.1
  }
];

/**
 * 코치.
 *
 * 루미(444 KB)가 아니라 로봇(233 KB)을 쓴다 — 루미는 마을 안내역이라 얼굴이
 * 겹치면 "딴 곳에 왔다"는 느낌이 흐려지고, 용량도 절반이다.
 * 바꾸고 싶으면 이 한 줄만 `/models/characters/lumi.glb` 로 고치면 된다.
 */
export const COACH: RoomProp = {
  glb: "/models/characters/neon-robot-npc.glb",
  h: 1.7,
  metres: 1.7,
  // **패널 기둥을 피하려면 x 만으로는 부족하다 — 깊이도 같이 봐야 한다.**
  // 화면 가로 중앙 ~490px 를 패널이 덮는데, 깊은 곳(z=-2.5)에서는 시야 반폭이
  // 7.4 m 라 x=2.4 가 화면 940px 에 떨어져 그대로 가려졌다. 앞으로 당길수록
  // 시야 반폭이 좁아져 같은 x 가 더 바깥으로 밀린다. z 를 -1.5 로 당기고
  // x 를 3.2 로 키워 패널 오른쪽(≈1050px) 밖에 세운다.
  at: [3.2, -1.5],
  rotationY: -0.85,
  feetAtOrigin: true
};

/** 배율과 y 위치 — 위 주석의 두 원점 규칙이 여기 한 곳에만 있다. */
export function placementOf(prop: RoomProp): {scale: number; y: number} {
  const scale = prop.metres / prop.h;
  return {scale, y: prop.feetAtOrigin ? 0 : prop.metres / 2};
}

/** 미리 받아둘 파일 목록 — 로딩 중 하나씩 튀어나오지 않게 한다. */
export const ROOM_GLBS = [
  ...new Set([...ROOM_PROPS.map(p => p.glb), COACH.glb])
];
