import {Vector3, type Camera, type Object3D} from "three";

// drei Html의 defaultCalculatePosition과 동일한 투영 공식 (drei가 export하지 않아 복제)
const _pos = new Vector3();

function project(
  el: Object3D,
  camera: Camera,
  size: {width: number; height: number}
): [number, number] {
  _pos.setFromMatrixPosition(el.matrixWorld);
  _pos.project(camera);
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  return [_pos.x * widthHalf + widthHalf, -(_pos.y * heightHalf) + heightHalf];
}

/**
 * drei <Html>의 calculatePosition을 매 프레임 대신 stride 프레임마다만 재계산하는 래퍼.
 * 건물/사인처럼 정지된 오브젝트는 카메라만 움직이므로, 위치 재계산 빈도를 낮춰도
 * 육안으로 구분되지 않으면서 매 프레임 Vector3.project() 호출 비용을 줄인다.
 */
export function createThrottledCalculatePosition(stride: number) {
  let frame = 0;
  let cached: [number, number] = [0, 0];
  return (
    el: Object3D,
    camera: Camera,
    size: {width: number; height: number}
  ) => {
    if (frame % stride === 0) {
      cached = project(el, camera, size);
    }
    frame += 1;
    return cached;
  };
}

// 건물 라벨 / 디스트릭트 사인 리프로젝션 주기 (2 = ~30Hz, 60Hz 대비 육안 차이 없음)
export const LABEL_SYNC_STRIDE = 2;
