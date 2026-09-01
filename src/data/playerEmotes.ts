/**
 * 걷기 모드에서 조종 캐릭터가 부리는 **동작**.
 *
 * 클립은 새로 만든 게 아니다 — `player-jaehoon.glb` 에 처음부터 10개가 들어
 * 있었고 그중 셋(걷기·뛰기·숨쉬기)만 쓰고 있었다. 나머지 일곱은 파일에 실려
 * 다운로드까지 되면서 한 번도 화면에 나온 적이 없다. 여기서 꺼내 쓴다.
 *
 * **여기가 유일한 정의다.** 화면 버튼(WalkEmoteBar)·단축키(CharacterController)·
 * 실제 재생(WarriorCharacter) 셋이 전부 이 배열을 읽는다. 동작을 빼거나 순서를
 * 바꾸려면 이 파일만 고치면 되고, 단축키 숫자는 배열 순서에서 자동으로 나온다.
 */
export interface PlayerEmote {
  /** 내부 식별자 겸 애니메이션 액션 이름 */
  id: string;
  /** GLB 안 클립 이름 — **일부만** 맞으면 된다 (WarriorCharacter 의 CLIP_OF 와 같은 방식) */
  clip: string;
  /**
   * 본 동작 앞에 한 번만 트는 도입부.
   *
   * 팔굽혀펴기 클립은 **엎드린 자세에서 시작한다.** 서 있다가 곧바로 틀면 몸이
   * 0.2초 만에 바닥으로 스며드는 것처럼 보인다. GLB 에 마침 `idle_to_push_up`
   * 이라는 전환 클립이 같이 들어 있어서, 그걸 먼저 한 번 재생하고 본 동작으로
   * 넘어간다. (도입부가 없으면 그냥 크로스페이드로 들어간다)
   */
  intro?: string;
  label: string;
  icon: string;
}

export const PLAYER_EMOTES: PlayerEmote[] = [
  {id: "jacks", clip: "jumping_jacks", label: "팔벌려뛰기", icon: "🤸"},
  {id: "squat", clip: "air_squat", label: "스쿼트", icon: "🦵"},
  {id: "curl", clip: "bicep_curl", label: "암컬", icon: "💪"},
  {id: "crunch", clip: "circle_crunch", label: "크런치", icon: "🌀"},
  {
    id: "pushup",
    clip: "push_up",
    intro: "idle_to_push_up",
    label: "팔굽혀펴기",
    icon: "🫱"
  },
  {
    id: "jump-pushup",
    clip: "jump_push_up",
    intro: "idle_to_push_up",
    label: "점프 푸시업",
    icon: "⚡"
  }
];

/** 단축키는 순서에서 나온다 — Digit1 … Digit6 */
export function emoteHotkey(index: number): string {
  return `Digit${index + 1}`;
}

export function emoteByHotkey(code: string): PlayerEmote | null {
  const i = PLAYER_EMOTES.findIndex((_, idx) => emoteHotkey(idx) === code);
  return i < 0 ? null : PLAYER_EMOTES[i]!;
}
