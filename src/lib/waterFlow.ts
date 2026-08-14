import {
  CanvasTexture,
  Color,
  NoColorSpace,
  RepeatWrapping,
  Vector2,
  type MeshStandardMaterial,
  type Texture
} from "three";

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
  {fx: 4, fy: -2, amp: 0.25, phase: 4.4}
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
  /**
   * 부감용 **큰 너울** 층 — 같은 노멀맵을 아주 성긴 배율로 한 번 더 샘플링한다.
   *
   * 잔물결 두 층은 눈높이에서는 물이지만 부감(기본 카메라)에서는 너무 작아
   * 정지된 색면으로 읽혔다. 큰 너울이 있어야 멀리서도 수면에 결이 보인다.
   * 정점을 실제로 올리는 너울(swell)은 법선을 안 바꿔 부감에서 안 보인다 —
   * 보이는 건 법선이다. 생략하면 예전 두 층 그대로다.
   */
  scaleC?: number;
  /** 큰 너울의 섞임 세기 (잔물결 xy 에 더해지는 배수) */
  bigWeight?: number;
  /**
   * 정점을 실제로 오르내리게 하는 너울 높이(유닛). 생략하면 0 — 판은 평평하고
   * 법선만 흔들린다. 리본(개울·해자)은 "출렁이는 느낌"이 없다는 지적에 넣었다.
   * 파장·시계를 석호(applyWaterSurface)와 똑같이 쓰므로, 어귀에서 두 물이
   * 겹쳐도 **같이** 출렁여 틈이 안 벌어진다.
   */
  swellAmp?: number;
  /** 너울이 지나가는 빠르기 — 석호와 같은 값을 줄 것 (기본 0.6) */
  swellSpeed?: number;
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

  material.onBeforeCompile = shader => {
    shader.uniforms.uFlowTime = FLOW_TIME;
    shader.uniforms.uFlowDirA = {
      value: new Vector2(options.dirA[0], options.dirA[1])
    };
    shader.uniforms.uFlowDirB = {
      value: new Vector2(options.dirB[0], options.dirB[1])
    };
    shader.uniforms.uFlowScaleA = {value: options.scaleA};
    shader.uniforms.uFlowScaleB = {value: options.scaleB};
    shader.uniforms.uFlowSpeed = {value: options.speed};
    shader.uniforms.uFlowScaleC = {value: options.scaleC ?? 0};
    shader.uniforms.uBigWeight = {value: options.bigWeight ?? 0};
    shader.uniforms.uSwellAmp = {value: options.swellAmp ?? 0};
    shader.uniforms.uSwellSpeed = {value: options.swellSpeed ?? 0.6};
    // groundMacro 와 같은 이유로 남긴다 — onBeforeCompile 은 재질을 만들 때가 아니라
    // 처음 그려질 때 불리므로, 패치를 걸었다는 것만으로 컴파일까지 됐는지 알 수 없다.
    material.userData.__flowCompiled = true;

    // 리본도 실제로 오르내린다 — 파장 셋(0.42·0.35·0.24)과 시계는 석호의
    // 너울과 **완전히 같다.** 다른 값을 쓰면 어귀에서 두 물이 어긋나 틈이 된다.
    // (리본 좌표는 월드로 구워져 있고 메시는 y 이동만 있으므로 local xz = world xz)
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uFlowTime;
uniform float uSwellAmp;
uniform float uSwellSpeed;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
if ( uSwellAmp > 0.0 ) {
  float swellPhase = uFlowTime * uSwellSpeed;
  float swell = sin( transformed.x * 0.42 + swellPhase ) * 0.55
              + sin( transformed.z * 0.35 - swellPhase * 0.86 ) * 0.45
              + sin( ( transformed.x + transformed.z ) * 0.24 + swellPhase * 1.27 ) * 0.35;
  transformed.y += swell * uSwellAmp;
}`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uFlowTime;
uniform vec2 uFlowDirA;
uniform vec2 uFlowDirB;
uniform float uFlowScaleA;
uniform float uFlowScaleB;
uniform float uFlowSpeed;
uniform float uFlowScaleC;
uniform float uBigWeight;`
      )
      .replace(
        "#include <normal_fragment_maps>",
        // 두 층을 "화이트아웃" 방식으로 합친다: xy 는 더하고 z 는 곱한다.
        // 단순 평균은 두 물결이 서로를 상쇄해 평평해지는 구간이 생긴다.
        // 세 번째(큰 너울)는 부감용 — 느리게 흘려 큰 결만 만든다.
        `vec2 flowUvA = vNormalMapUv * uFlowScaleA + uFlowDirA * ( uFlowTime * uFlowSpeed );
vec2 flowUvB = vNormalMapUv * uFlowScaleB + uFlowDirB * ( uFlowTime * uFlowSpeed );
vec3 flowNA = texture2D( normalMap, flowUvA ).xyz * 2.0 - 1.0;
vec3 flowNB = texture2D( normalMap, flowUvB ).xyz * 2.0 - 1.0;
vec2 bigXY = vec2( 0.0 );
if ( uBigWeight > 0.0 ) {
  vec2 flowUvC = vNormalMapUv * uFlowScaleC + uFlowDirA * ( uFlowTime * uFlowSpeed * 0.32 );
  bigXY = ( texture2D( normalMap, flowUvC ).xy * 2.0 - 1.0 ) * uBigWeight;
}
vec3 mapN = normalize( vec3( flowNA.xy + flowNB.xy + bigXY, flowNA.z * flowNB.z ) );
mapN.xy *= normalScale;
normal = normalize( tbn * mapN );`
      );
  };
}

// ─── 넓은 수면 (석호) ────────────────────────────────────────────────────────
// 위의 `applyWaterFlow` 는 **리본**용이다. 개울·해자는 폭이 1~2유닛이라 법선만
// 흔들어도 충분하다 — 수면이 좁아서 어차피 물가만 보인다.
//
// 석호는 사정이 다르다. 폭이 10유닛을 넘는 자리가 있고 카메라가 그 위를 지난다.
// 넓은 면에서는 법선 스크롤만으로는 **판때기 위를 무늬가 지나가는** 것으로 읽힌다.
// 물처럼 보이려면 네 가지가 같이 있어야 한다:
//
//   ① 면이 실제로 오르내린다   — 물가 선이 숨을 쉬어야 정지 화면이 아니게 된다
//   ② 흐름에 방향이 있다        — 광장을 도는 물이니 방향은 **접선**이다.
//                                 세계 좌표로 한 방향으로 밀면 한쪽 물가에서
//                                 물이 뭍으로 기어오르는 것처럼 보인다
//   ③ 비스듬히 보면 하늘이 비친다 (프레넬) — 이게 없으면 색만 파란 유리다.
//                                 깊이감의 절반이 여기서 나온다
//   ④ 물가에 포말이 인다        — 물이 뭍에 닿는 자리가 어디인지 눈에 알려 준다
//
// ── 왜 재질을 clone 하면 안 되는가 (실제로 겪은 버그) ───────────────────────
// 처음엔 리본 재질을 `material.clone()` 해서 석호에 썼다. three 의 Material.copy 는
// **onBeforeCompile 을 복사하지 않는다** — normalMap 과 normalScale 만 넘어오고
// 셰이더 패치는 통째로 사라진다. 게다가 userData 는 복사되므로 `__flowApplied`
// 딱지까지 따라와서, 뒤늦게 applyWaterFlow 를 다시 걸어도 조용히 무시된다.
// 결과가 **얼어붙은 물결 무늬**였다. 화면만 보면 "물결이 있는데 안 흐르네"라
// 원인을 찾기가 아주 어렵다. 넓은 수면은 반드시 이 함수로 새 재질을 만든다.

export interface WaterSurfaceOptions extends WaterFlowOptions {
  /** 너울 높이(유닛). 물가에서는 0 으로 잦아든다 — 안 그러면 둑 밑이 벌어진다. */
  swellAmp: number;
  /** 너울이 지나가는 빠르기 */
  swellSpeed: number;
  /** 포말 띠 폭(유닛, 물가로부터) */
  foamWidth: number;
  /** 비스듬히 볼 때 비치는 하늘빛 */
  skyTint: string;
  /** 프레넬 지수. 낮을수록 정면에서도 하늘이 비친다(=물이 얕아 보인다). */
  fresnelPower: number;
}

/**
 * 넓은 수면에 물결·너울·프레넬·포말을 한꺼번에 물린다.
 *
 * 지오메트리에 두 가지가 있어야 한다:
 * - `aFlow`  (vec2) 그 자리의 흐름 방향. 길이는 안 본다(셰이더에서 정규화).
 * - `aShore` (float) 물가까지의 **월드 거리**. 너울·포말·투명도가 전부 이걸 본다.
 *
 * 정규화된 0~1 깊이가 아니라 월드 거리를 넣는 이유: 포말 폭을 "0.45유닛"처럼
 * 눈에 보이는 값으로 적을 수 있어야 한다. 정규화 값으로 두면 FULL_DEPTH 를
 * 만질 때마다 포말 폭이 같이 변한다.
 */
export function applyWaterSurface(
  material: MeshStandardMaterial,
  normalTexture: Texture,
  options: WaterSurfaceOptions
): void {
  if (!FLOW_ENABLED) return;
  if (material.userData.__surfaceApplied) return;
  material.userData.__surfaceApplied = true;

  material.normalMap = normalTexture;
  material.normalScale = new Vector2(options.normalScale, options.normalScale);
  material.customProgramCacheKey = () => "water-surface";

  material.onBeforeCompile = shader => {
    shader.uniforms.uFlowTime = FLOW_TIME;
    shader.uniforms.uFlowScaleA = {value: options.scaleA};
    shader.uniforms.uFlowScaleB = {value: options.scaleB};
    shader.uniforms.uFlowSpeed = {value: options.speed};
    shader.uniforms.uFlowScaleC = {value: options.scaleC ?? 0};
    shader.uniforms.uBigWeight = {value: options.bigWeight ?? 0};
    shader.uniforms.uSwellAmp = {value: options.swellAmp};
    shader.uniforms.uSwellSpeed = {value: options.swellSpeed};
    shader.uniforms.uFoamWidth = {value: options.foamWidth};
    shader.uniforms.uFresnelPower = {value: options.fresnelPower};
    shader.uniforms.uSkyTint = {value: new Color(options.skyTint)};
    material.userData.__surfaceCompiled = true;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec2 aFlow;
attribute float aShore;
uniform float uFlowTime;
uniform float uSwellAmp;
uniform float uSwellSpeed;
varying vec2 vFlowDir;
varying float vShore;
varying vec2 vWorldXZ;`
      )
      .replace(
        "#include <begin_vertex>",
        // 메시는 회전·배율이 없고 좌표를 월드로 구워 넣었으므로 local xz = world xz 다.
        //
        // 사인 셋을 겹치는 이유는 노멀맵과 같다 — 하나면 줄무늬가 통째로 미끄러진다.
        // 파장(0.42 · 0.35 · 0.24)은 서로 배수가 아니라 무늬가 되풀이되지 않는다.
        //
        // **물가에서 잦아들게 하는 게 중요하다.** 물가 정점까지 출렁이면 수면이
        // 둑 위로 올라갔다 내려가면서 물가에 틈이 벌어진다. smoothstep 으로
        // 1.6유닛 안쪽은 붙박아 둔다.
        `#include <begin_vertex>
vFlowDir = aFlow;
vShore = aShore;
vWorldXZ = transformed.xz;
float swellPhase = uFlowTime * uSwellSpeed;
float swell = sin( transformed.x * 0.42 + swellPhase ) * 0.55
            + sin( transformed.z * 0.35 - swellPhase * 0.86 ) * 0.45
            + sin( ( transformed.x + transformed.z ) * 0.24 + swellPhase * 1.27 ) * 0.35;
transformed.y += swell * uSwellAmp * smoothstep( 0.0, 1.6, aShore );`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uFlowTime;
uniform float uFlowScaleA;
uniform float uFlowScaleB;
uniform float uFlowSpeed;
uniform float uFlowScaleC;
uniform float uBigWeight;
uniform float uFoamWidth;
uniform float uFresnelPower;
uniform vec3 uSkyTint;
varying vec2 vFlowDir;
varying float vShore;
varying vec2 vWorldXZ;`
      )
      .replace(
        "#include <normal_fragment_maps>",
        // ① 물결 — 두 층을 그 자리의 흐름 방향으로 흘린다. 방향이 정점마다
        //    다르므로 광장을 도는 물살이 된다. 세 번째 층은 부감용 큰 너울 —
        //    잔물결은 기본 카메라(부감)에서 너무 작아 정지된 색면으로 읽혔다.
        `vec2 flowDir = normalize( vFlowDir + vec2( 1e-4 ) );
vec2 flowSide = vec2( -flowDir.y, flowDir.x );
float flowT = uFlowTime * uFlowSpeed;
vec2 flowUvA = vNormalMapUv * uFlowScaleA + flowDir * flowT;
vec2 flowUvB = vNormalMapUv * uFlowScaleB + ( flowDir * 0.62 + flowSide * 0.22 ) * flowT;
vec3 flowNA = texture2D( normalMap, flowUvA ).xyz * 2.0 - 1.0;
vec3 flowNB = texture2D( normalMap, flowUvB ).xyz * 2.0 - 1.0;
vec2 bigXY = vec2( 0.0 );
if ( uBigWeight > 0.0 ) {
  vec2 flowUvC = vNormalMapUv * uFlowScaleC + flowDir * flowT * 0.3;
  bigXY = ( texture2D( normalMap, flowUvC ).xy * 2.0 - 1.0 ) * uBigWeight;
}
vec3 mapN = normalize( vec3( flowNA.xy + flowNB.xy + bigXY, flowNA.z * flowNB.z ) );
mapN.xy *= normalScale;
normal = normalize( tbn * mapN );

// ② 프레넬 — 비스듬히 볼수록 하늘이 비치고 불투명해진다.
//    물결로 흔들린 법선을 쓰기 때문에 반사도 같이 일렁인다. 평평한 법선으로
//    계산하면 넓이에 따라 매끈한 그라데이션이 되어 도로 유리판이 된다.
//    세기는 **0.6 → 0.32 로 낮췄다.** 0.6 이면 눈높이에서 수면 전체가 하늘색으로
//    덮여 물이 아니라 눈밭이 된다. 프레넬은 "저 멀리 수면이 하얘진다"는 힌트만
//    주면 충분하고, 물빛은 알베도가 내는 게 맞다.
float fres = pow( 1.0 - clamp( dot( normal, normalize( vViewPosition ) ), 0.0, 1.0 ), uFresnelPower );
diffuseColor.rgb = mix( diffuseColor.rgb, uSkyTint, fres * 0.32 );
diffuseColor.a = clamp( diffuseColor.a + fres * 0.3, 0.0, 1.0 );

// ③ 물가 포말 — 띠 폭 자체를 출렁이게 해서 물이 뭍을 핥게 만든다.
//    폭을 고정하면 섬 둘레에 흰 테두리를 그린 것처럼 보인다.
float lap = sin( ( vWorldXZ.x + vWorldXZ.y ) * 1.6 + uFlowTime * 1.05 )
          + sin( ( vWorldXZ.x - vWorldXZ.y ) * 2.3 - uFlowTime * 0.77 );
float foamEdge = max( uFoamWidth * ( 0.55 + 0.3 * lap ), 0.02 );
float foam = 1.0 - smoothstep( 0.0, foamEdge, vShore );
diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.90, 0.96, 0.97 ), foam * 0.75 );
diffuseColor.a = max( diffuseColor.a, foam * 0.9 );`
      );
  };
}

// ─── 하상의 물빛 무늬 (커스틱) ───────────────────────────────────────────────
// 수면이 렌즈 노릇을 해서 햇빛을 바닥에 그물처럼 모으는 것. 얕은 물에서만 보인다.
//
// 이게 깊이감에 결정적인 이유: 무늬가 **보이는 곳은 바닥이 보이는 곳**이고,
// 무늬가 사라지는 곳은 바닥이 안 보이는 곳이다. 색만으로 어둡게 칠하면 그냥
// 어두운 물이지만, 무늬가 얕은 데서 밝게 일렁이다 깊은 데서 사라지면 눈이
// 그 차이를 **깊이**로 읽는다. 하상은 가만히 있고 무늬만 움직이는 게 맞다 —
// 바닥까지 흔들면 지진이 된다.
export interface WaterBedOptions {
  /** 무늬 촘촘함(월드 좌표 배율) */
  scale: number;
  /** 무늬가 일렁이는 빠르기 */
  speed: number;
  /** 이보다 깊으면 무늬가 안 보인다(유닛) */
  depth: number;
  /** 무늬 세기 */
  strength: number;
  /** 무늬 색 — 순백이 아니라 물빛이 섞인 연둣빛이 자연스럽다 */
  color: string;
}

/**
 * 하상에 움직이는 물빛 무늬를 얹는다. 지오메트리에 `aShore`(물가까지 월드 거리)가
 * 있어야 한다 — 수면과 같은 값이라 같은 루프에서 같이 채우면 된다.
 */
export function applyWaterBed(
  material: MeshStandardMaterial,
  options: WaterBedOptions
): void {
  if (!FLOW_ENABLED) return;
  if (material.userData.__bedApplied) return;
  material.userData.__bedApplied = true;

  material.customProgramCacheKey = () => "water-bed";

  material.onBeforeCompile = shader => {
    shader.uniforms.uFlowTime = FLOW_TIME;
    shader.uniforms.uCausticScale = {value: options.scale};
    shader.uniforms.uCausticSpeed = {value: options.speed};
    shader.uniforms.uCausticDepth = {value: options.depth};
    shader.uniforms.uCausticStrength = {value: options.strength};
    shader.uniforms.uCausticColor = {value: new Color(options.color)};
    material.userData.__bedCompiled = true;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute float aShore;
varying float vBedShore;
varying vec2 vBedXZ;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vBedShore = aShore;
vBedXZ = transformed.xz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uFlowTime;
uniform float uCausticScale;
uniform float uCausticSpeed;
uniform float uCausticDepth;
uniform float uCausticStrength;
uniform vec3 uCausticColor;
varying float vBedShore;
varying vec2 vBedXZ;`
      )
      .replace(
        // 색이 정해진 **직후** 얹는다. 조명 전이라 그늘에 들어가면 무늬도 같이
        // 어두워진다 — 커스틱은 햇빛이 만드는 것이니 그게 맞다. gl_FragColor 에
        // 더하면 그늘에서도 똑같이 빛나 스티커처럼 붙어 보인다.
        "#include <color_fragment>",
        `#include <color_fragment>
{
  // 사인 안에 사인을 넣어 물결이 휜다. 순수 격자 사인은 체크무늬가 되어
  // 커스틱이 아니라 타일 바닥으로 보인다.
  vec2 cp = vBedXZ * uCausticScale;
  float ct = uFlowTime * uCausticSpeed;
  float ca = sin( cp.x + sin( cp.y * 0.73 + ct ) * 1.35 + ct );
  float cb = sin( cp.y * 0.91 + sin( cp.x * 0.61 - ct * 0.8 ) * 1.2 - ct * 1.13 );
  // 5제곱: 밝은 데만 남기고 나머지는 눌러 **가는 그물**로 만든다.
  // 지수를 낮추면 바닥 전체가 뿌옇게 밝아져 안개처럼 보인다.
  float band = pow( clamp( ( ca + cb ) * 0.25 + 0.5, 0.0, 1.0 ), 5.0 );
  float shallow = 1.0 - smoothstep( 0.0, uCausticDepth, vBedShore );
  diffuseColor.rgb += uCausticColor * band * shallow * uCausticStrength;
}`
      );
  };
}
