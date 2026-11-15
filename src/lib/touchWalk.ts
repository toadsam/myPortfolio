/**
 * 걷기 모드의 **터치 입력 통로** (2026-10-19).
 *
 * 가상 조이스틱(VirtualJoystick, DOM)·두 손가락 줌·구역 순간이동 요청을
 * CharacterController(캔버스, 매 프레임)가 읽어 간다. playerEmote 와 같은 이유로
 * React state 가 아니라 모듈 전역이다 — 스틱을 밀 때마다 마을 전체가 다시
 * 렌더되면 안 되고, 두 쪽이 서로 남남이다.
 */

/** 카메라 기준 이동 벡터. x = 오른쪽(+), y = 앞(+). 길이 0~1. */
export const touchMove = {x: 0, y: 0};

/** 두 손가락 줌으로 쌓인 카메라 거리 변화. 컨트롤러가 읽고 0 으로 돌린다. */
export const touchZoom = {delta: 0};

/** 다음 프레임에 캐릭터를 이 자리에 세운다(구역 순간이동). 읽으면 비운다. */
export const teleportRequest: {to: [number, number] | null} = {to: null};

export function setTouchMove(x: number, y: number): void {
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  touchMove.x = x;
  touchMove.y = y;
}

export function clearTouchMove(): void {
  touchMove.x = 0;
  touchMove.y = 0;
}

export function requestTeleport(x: number, z: number): void {
  teleportRequest.to = [x, z];
}
