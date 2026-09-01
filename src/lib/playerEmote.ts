/**
 * 지금 조종 캐릭터가 부리고 있는 **동작 하나**.
 *
 * 왜 모듈 전역인가 — 이 값을 건드리는 셋이 서로 남남이기 때문이다:
 *   · 누르는 쪽  : 화면 버튼(WalkEmoteBar, DOM) 과 숫자키(CharacterController, 캔버스)
 *   · 지우는 쪽  : CharacterController — 걷기 시작하면 즉시 끊는다
 *   · 읽는 쪽    : WarriorCharacter — 매 프레임 본다
 *
 * React state 로 두면 이 값을 VillageScene 까지 끌어올려 prop 으로 두 갈래로
 * 내려야 하고, 버튼 한 번에 마을이 통째로 다시 렌더된다(정적 자식을 memo 로
 * 묶어 둔 사정과 같다 — villageGreeting 이 전역인 이유도 같다).
 *
 * 대신 구독을 붙여 둔다. 걷다가 동작이 **저절로 끊길 때** 버튼 불이 같이 꺼져야
 * 하는데, ref 만으로는 DOM 쪽이 그걸 알 방법이 없다.
 */

let current: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function getPlayerEmote(): string | null {
  return current;
}

export function setPlayerEmote(id: string | null): void {
  if (current === id) return;
  current = id;
  emit();
}

/** 같은 걸 다시 누르면 끈다 — 버튼이자 스위치다 */
export function togglePlayerEmote(id: string): void {
  setPlayerEmote(current === id ? null : id);
}

/** 걷기 모드를 나갈 때. 남겨 두면 다시 들어왔을 때 스쿼트를 하고 있다 */
export function resetPlayerEmote(): void {
  setPlayerEmote(null);
}

export function subscribePlayerEmote(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
