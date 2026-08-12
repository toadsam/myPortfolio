import {CanvasTexture, NoColorSpace, RepeatWrapping, Vector2, type MeshStandardMaterial, type Texture} from "three";

// 물이 "흐르는" 느낌을 만드는 레이어.
//
// ── 왜 노멀맵인가 ───────────────────────────────────────────────────────────
// 물이 물처럼 보이는 건 색이 아니라 **표면이 하늘빛을 어떻게 꺾어 받느냐**다.
// 지금 해자·개울은 완벽하게 평평해서 리본 전체가 하늘의 같은 지점을 반사한다 —
// 그래서 파랗게 칠한 종이로 읽혔다. 정점을 실제로 출렁이게 만들 필요는 없다.
// 법선만 흔들어도 반사가 흔들리고, 그게 눈에는 물살로 보인다.
//
// ── 왜 두 겹인가 (이게 핵심이다) ────────────────────────────────────────────
// 노멀맵 한 장을 스크롤하면 물이 흐르는 게 아니라 **무늬가 미끄러진다.** 벽지를
// 잡아당기는 것처럼 보이는데, 한번 알아채면 계속 거슬린다. 원인은 모든 픽셀이
// 정확히 같은 속도·같은 방향으로 움직여서 눈이 그 강체 운동을 잡아내기 때문이다.
//
// 배율과 방향이 **다른** 두 장을 겹쳐 흘리면 두 무늬가 서로에 대해 계속 어긋나
// 어디에도 고정된 패턴이 안 남는다. 물살이 뒤섞이는 느낌은 전부 여기서 나온다.
// 층을 셋으로 늘려도 이득이 거의 없다 — 둘이면 충분하다.
//
// ── 왜 재질을 새로 안 짜고 onBeforeCompile 인가 ─────────────────────────────
// groundMacro.ts 와 같은 이유다. MeshStandardMaterial 의 조명·그림자·fog·톤매핑을
// 그대로 타야 한다. 커스텀 ShaderMaterial 로 만들면 그 전부를 다시 짜야 한다.

/** **false 로 두면 예전 물 그대로다.** 되돌리기 스위치. */
export const FLOW_ENABLED: boolean = true;

/** 물결 텍스처 한 변(px). 법선만 담으므로 성겨도 된다. */
const SIZE = 256;

/**
 * 물결을 만드는 사인파들. `fx`·`fy` 가 **정수**라서 [0,1]² 에서 정확히 이어진다 —
 * 노이즈로 만들면 경계를 맞추느라 따로 손을 봐야 하는데, 사인파는 공짜로 이어진다.
 *
 * 낮은 주파수(큰 너울)에 진폭을 몰고 높은 쪽은 잔결만 얹는다. 잔결에 진폭을 주면
 * 멀리서 노이즈로 뭉개져 물이 지저분해 보인다.
 */
// ─── 진폭은 주파수의 제곱에 반비례해야 한다 ─────────────────────────────────
// 처음엔 진폭만 대충 줄여 놨는데(1.0 → 0.11), **기울기**는 진폭 × 주파수라
// 잔결 쪽 기울기가 큰 너울과 맞먹었다. 결과가 백색소음 같은 법선맵이었고,
// 화면에서는 물이 아니라 부순 얼음·아쿠아마린 조각으로 보였다.
//
// 물은 **큰 너울이 형태를 만들고 잔결은 거들기만** 해야 한다. 그러려면
// 진폭 ∝ 1/f² 여서 기울기가 1/f 로 떨어져야 한다. 그리고 아주 높은 주파수
// (예전의 5,1 · 3,-5 · 7,4)는 아예 뺐다 — 축소될 때 스페큘러 에일리어싱만
// 만들고 물결로는 안 읽힌다.
const WAVES: {fx: number; fy: number; amp: number; phase: number}[] = [
  {fx: 1, fy: 2, amp: 1.0, phase: 0.0},
  {fx: 2, fy: -1, amp: 0.8, phase: 1.7},
  {fx: 1, fy: -3, amp: 0.5, phase: 3.1},
  {fx: 3, fy: 1, amp: 0.5, phase: 0.9},
  {fx: 2, fy: 4, amp: 0.25, phase: 2.3},
  {fx: 4, fy: -2, amp: 0.25, phase: 4.4},
];

/**
 * 물결의 **가장 가파른 기울기**. 0.35 면 제일 선 데가 약 19° 다.
 *
 * 이 값이 곧 기울기가 되도록 아래에서 두 번 훑어 정규화한다 — 예전처럼
 * 그냥 곱하기만 하면 파를 하나 추가하는 것만으로 물이 유리조각이 된다.
 * 물은 0.2~0.4 다. 1 을 넘기면 어떤 색을 칠해도 물로 안 보인다.
 */
const STEEPNESS = 0.35;

let cached: CanvasTexture | null = null;

/**
 * 물결 노멀맵. 높이장의 기울기를 **해석적으로** 구한다(사인파라 미분이 정확하다) —
 * 소벨 필터로 근사하면 1픽셀 간격 때문에 잔결이 뭉개진다.
 */
export function makeWaterNormal(): CanvasTexture {
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(SIZE, SIZE);
  const data = image.data;

  const TAU = Math.PI * 2;

  // ── 1차: 기울기를 구하면서 가장 가파른 값을 기억한다 ──────────────────────
  // 진폭 합으로 나누는 것만으로는 부족하다. 기울기는 진폭 × **주파수**라
  // 파를 하나 더 넣거나 주파수를 올리면 곱해 놓은 STEEPNESS 와 무관하게
  // 실제 기울기가 튄다. 실측한 최대값으로 나눠야 STEEPNESS 가 약속을 지킨다.
  const gradU = new Float32Array(SIZE * SIZE);
  const gradV = new Float32Array(SIZE * SIZE);
  let maxSlope = 1e-6;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      let du = 0;
      let dv = 0;
      for (const w of WAVES) {
        const c = Math.cos(TAU * (w.fx * u + w.fy * v) + w.phase) * w.amp;
        du += c * TAU * w.fx;
        dv += c * TAU * w.fy;
      }
      const g = y * SIZE + x;
      gradU[g] = du;
      gradV[g] = dv;
      const slope = Math.hypot(du, dv);
      if (slope > maxSlope) maxSlope = slope;
    }
  }

  // ── 2차: 실측 최대 기울기가 정확히 STEEPNESS 가 되도록 맞춰 인코딩 ────────
  const norm = STEEPNESS / maxSlope;

  for (let g = 0; g < SIZE * SIZE; g++) {
    // 높이장의 기울기 → 법선. z 를 1 로 두고 정규화하면 평평한 곳이 (0,0,1) 이다.
    const nx = -gradU[g] * norm;
    const ny = -gradV[g] * norm;
    const len = Math.hypot(nx, ny, 1);

    const i = g * 4;
    data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
    data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
    data[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // **색이 아니라 방향 벡터다.** sRGB 로 두면 three 가 감마를 풀어 법선이 휘어진다.
  texture.colorSpace = NoColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  cached = texture;
  return texture;
}

// ─── 흐름 시각 ────────────────────────────────────────────────────────────────
// 물 재질 전부가 시계 하나를 공유한다. 재질마다 시계를 두면 해자와 개울이 서로
// 다른 위상으로 흘러 만나는 지점에서 어긋난다.
const FLOW_TIME = {value: 0};

/** 매 프레임 한 번 불러 준다. VillageScene 의 WaterClock 이 담당. */
export function advanceWaterFlow(elapsed: number): void {
  FLOW_TIME.value = elapsed;
}

export interface WaterFlowOptions {
  /** 두 층의 UV 배율. 서로 달라야 무늬가 겹쳐 고정되지 않는다. */
  scaleA: number;
  scaleB: number;
  /** 두 층이 흐르는 방향(UV 공간). 리본은 v 축이 물길을 따라간다. */
  dirA: [number, number];
  dirB: [number, number];
  /** 초당 UV 이동량 */
  speed: number;
  /** 법선 세기. 물결이 얼마나 깊어 보이는지. */
  normalScale: number;
}

/**
 * 재질에 흐르는 물결을 물린다.
 *
 * `vNormalMapUv` 를 두 번 다른 배율·오프셋으로 샘플링해 합친다. tbn(접선 프레임)은
 * three 가 `normal_fragment_begin` 에서 화면 미분으로 만들어 두므로 지오메트리에
 * 탄젠트 속성이 없어도 된다 — 리본은 position/color/uv 만 갖고 있다.
 */
export function applyWaterFlow(
  material: MeshStandardMaterial,
  normalTexture: Texture,
  options: WaterFlowOptions
): void {
  if (!FLOW_ENABLED) return;
  if (material.userData.__flowApplied) return;
  material.userData.__flowApplied = true;

  material.normalMap = normalTexture;
  material.normalScale = new Vector2(options.normalScale, options.normalScale);

  // three 의 getProgramCacheKey 는 onBeforeCompile 을 키에 안 넣는다. 키를 갈라
  // 두지 않으면 파라미터가 같은 다른 재질의 캐시된 프로그램을 재사용해 버려서
  // 패치가 통째로 무시된다. 자세한 설명은 foliageWind.ts 의 같은 자리 참고.
  material.customProgramCacheKey = () => "water-flow";

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFlowTime = FLOW_TIME;
    shader.uniforms.uFlowDirA = {value: new Vector2(options.dirA[0], options.dirA[1])};
    shader.uniforms.uFlowDirB = {value: new Vector2(options.dirB[0], options.dirB[1])};
    shader.uniforms.uFlowScaleA = {value: options.scaleA};
    shader.uniforms.uFlowScaleB = {value: options.scaleB};
    shader.uniforms.uFlowSpeed = {value: options.speed};
    // groundMacro 와 같은 이유로 남긴다 — onBeforeCompile 은 재질을 만들 때가 아니라
    // 처음 그려질 때 불리므로, 패치를 걸었다는 것만으로 컴파일까지 됐는지 알 수 없다.
    material.userData.__flowCompiled = true;

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uFlowTime;
uniform vec2 uFlowDirA;
uniform vec2 uFlowDirB;
uniform float uFlowScaleA;
uniform float uFlowScaleB;
uniform float uFlowSpeed;`
      )
      .replace(
        "#include <normal_fragment_maps>",
        // 두 층을 "화이트아웃" 방식으로 합친다: xy 는 더하고 z 는 곱한다.
        // 단순 평균은 두 물결이 서로를 상쇄해 평평해지는 구간이 생긴다.
        `vec2 flowUvA = vNormalMapUv * uFlowScaleA + uFlowDirA * ( uFlowTime * uFlowSpeed );
vec2 flowUvB = vNormalMapUv * uFlowScaleB + uFlowDirB * ( uFlowTime * uFlowSpeed );
vec3 flowNA = texture2D( normalMap, flowUvA ).xyz * 2.0 - 1.0;
vec3 flowNB = texture2D( normalMap, flowUvB ).xyz * 2.0 - 1.0;
vec3 mapN = normalize( vec3( flowNA.xy + flowNB.xy, flowNA.z * flowNB.z ) );
mapN.xy *= normalScale;
normal = normalize( tbn * mapN );`
      );
  };
}
