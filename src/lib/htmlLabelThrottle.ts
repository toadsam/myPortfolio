import {Vector3, type Camera, type Object3D} from "three";

// drei Html의 defaultCalculatePosition과 동일한 투영 공식 (drei가 export하지 않아 복제)
const _pos = new Vector3();

/**
 * 가장자리 여백. **가로가 세로보다 훨씬 큰 이유가 있다.**
 *
 * 이 helper 가 받는 건 `el`(Object3D)·`camera`·`size` 뿐이라 라벨의 폭을 모른다.
 * 그런데 drei `<Html center>` 는 라벨을 좌표의 **중심**에 놓는다 —
 * `Html.js:177` 이 안쪽 div 에 `translate3d(-50%,-50%,0)` 를 건다(크롬에서
 * 계산된 값도 `matrix(1,0,0,1,-63.8,-17.25)` = 폭·높이의 절반).
 * 그래서 중심점만 화면 안으로 밀면 **라벨 절반이 그대로 삐져나간다.**
 *
 * 여백은 **실측한 최대 상자의 절반**이다. 마을 라벨은 `distanceFactor` 때문에
 * 가까울수록 커져서, 다 띄운 상태에서 잰 최대치가 폭 197 · 높이 51 이었다.
 * 절반이 각각 99 / 26, 거기에 숨 쉴 틈을 더해 110 / 38 로 잡는다.
 *
 * 참고: `size` 는 **캔버스** 크기이고, 캔버스는 이미 헤더(fixed h-[65px]) 아래에서
 * 시작한다(`AIPortfolioVillage` 의 section 이 `pt-[65px]`). 그러니 여기서 헤더
 * 높이를 또 빼면 안 된다 — 두 번 빼면 라벨이 제 건물에서 65px 씩 떨어져 뜬다.
 */
const EDGE_MARGIN_X = 110;
const EDGE_MARGIN_Y = 38;

/** drei Html 이 화면 밖으로 치워 두는 자리. 사실상 '숨김'이다. */
const OFFSCREEN: [number, number] = [-10000, -10000];

function projectSafe(
  el: Object3D,
  camera: Camera,
  size: {width: number; height: number}
): [number, number] {
  _pos.setFromMatrixPosition(el.matrixWorld);
  _pos.project(camera);

  // ── ① 카메라 뒤면 숨긴다 ──
  // project() 는 NDC 를 주는데, 카메라 **뒤**에 있는 점은 z > 1 이면서 x·y 가
  // 뒤집힌 채로 나온다. z 를 안 보면 등 뒤 건물의 이름표가 앞쪽 화면 한복판에
  // 유령처럼 떠 있게 된다(원래 이 함수가 그랬다).
  if (_pos.z > 1) return OFFSCREEN;

  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  const x = _pos.x * widthHalf + widthHalf;
  const y = -(_pos.y * heightHalf) + heightHalf;

  // ── ② 앵커가 화면 밖이면 숨긴다 ──
  // 앵커는 건물 지붕 위의 점이다. 그게 화면 밖이면 **건물이 안 보인다**는 뜻이라
  // 라벨을 남길 이유가 없다.
  if (x < 0 || x > size.width || y < 0 || y > size.height) return OFFSCREEN;

  // ── ③ 앵커가 화면 안이면 살려서 안전영역으로 민다 ──
  //
  // 이 두 단계를 나눈 데는 잰 근거가 있다. 처음엔 **전부 밀었더니**
  // 잘림은 0이 됐지만 겹침이 3쌍 → **8쌍**으로 늘었다. 밖으로 나가려던 라벨이
  // 죄다 같은 경계선(y=38)에 포개진 탓이다. 반대로 **전부 숨겼더니** 겹침·잘림은
  // 0이 됐지만 라벨 34개 중 **1개**만 남았다.
  //
  // 앵커 위치로 가르면 둘 다 피한다 — 안 보이는 건물 것은 숨고(포갤 일이 없다),
  // 보이는 건물 것만 최대 여백만큼(110px) 밀린다. 밀리는 거리가 짧으니
  // 제 건물 근처를 벗어나지도 않는다.
  return [
    clamp(x, EDGE_MARGIN_X, size.width - EDGE_MARGIN_X),
    clamp(y, EDGE_MARGIN_Y, size.height - EDGE_MARGIN_Y)
  ];
}

function clamp(value: number, min: number, max: number): number {
  // 창이 여백 두 겹보다 좁으면 min > max 로 뒤집힌다 — 그때는 가운데로 모은다.
  if (max < min) return (min + max) / 2;
  return value < min ? min : value > max ? max : value;
}

/**
 * drei <Html>의 calculatePosition 대체품. 두 가지를 한다.
 *
 * **1) 스로틀** — 매 프레임 대신 stride 프레임마다만 재투영한다. 건물·사인처럼
 * 정지한 오브젝트는 카메라만 움직이므로 육안 차이 없이 Vector3.project() 비용을 줄인다.
 *
 * **2) 안전영역** — 카메라 뒤이거나 앵커가 화면 밖인 라벨은 숨기고, 화면 안인
 * 것만 안전영역으로 민다. 라벨은 좌표의 중심에 놓이므로 가장자리에는 절반이
 * 들어갈 자리를 비워 둔다(위 EDGE_MARGIN_X 주석).
 *
 * 마을의 라벨(건물 이름표·구역 현판·공방 해치·섬 선착장)이 전부 이 함수를 쓰므로,
 * 잘림 규칙을 고치려면 **여기 한 곳만** 고치면 된다.
 *
 * 참고: 라벨끼리 겹치는 문제는 이 함수로 못 고친다. 여기는 라벨 하나가 자기
 * 위치만 아는 자리라, 서로 밀어내려면 프레임마다 전체 목록을 모아 푸는 별도
 * 레이어가 필요하다.
 */
export function createThrottledCalculatePosition(stride: number) {
  let frame = 0;
  let cached: [number, number] = OFFSCREEN;
  return (
    el: Object3D,
    camera: Camera,
    size: {width: number; height: number}
  ) => {
    if (frame % stride === 0) {
      cached = projectSafe(el, camera, size);
    }
    frame += 1;
    return cached;
  };
}

// 건물 라벨 / 디스트릭트 사인 리프로젝션 주기 (2 = ~30Hz, 60Hz 대비 육안 차이 없음)
export const LABEL_SYNC_STRIDE = 2;
