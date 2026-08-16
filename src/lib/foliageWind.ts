import {
  MeshDepthMaterial,
  RGBADepthPacking,
  Vector2,
  type Material
} from "three";

// 나무·덤불을 바람에 흔든다.
//
// ── 왜 정점 셰이더인가 ──────────────────────────────────────────────────────
// 식생은 이미 InstancedProps 가 GLB 별 InstancedMesh 하나로 묶어 놨다. 나무를
// 오브젝트로 하나씩 돌리려면 469개를 매 프레임 CPU 에서 갱신해야 하지만,
// 정점 셰이더로 밀면 draw call 도 CPU 비용도 **그대로 0 이 늘어난다**.
//
// ── 왜 인스턴스마다 위상이 달라야 하나 ──────────────────────────────────────
// 469그루가 같은 박자로 흔들리면 숲이 아니라 젤리 한 덩어리로 보인다. 인스턴스
// 위치를 해시해 위상을 어긋뜨린다 — 정점 속성을 새로 붙일 필요가 없다
// (instanceMatrix 의 4번째 열이 곧 그 인스턴스의 위치다).
//
// ── 왜 월드 방향으로 되돌리나 ───────────────────────────────────────────────
// 배치마다 rotationY 가 제각각이라, 오브젝트 공간에서 그냥 +x 로 밀면 나무마다
// 다른 쪽으로 눕는다 — 바람이 아니라 제각각 넘어지는 그림이다. 인스턴스의
// 회전 기저에 바람 방향을 투영해서, 세계 어디서나 같은 쪽으로 눕게 한다.
//
// ── 왜 깊이 재질까지 건드리나 ───────────────────────────────────────────────
// 그림자는 별도의 깊이 패스에서 그려진다. 색상 재질만 흔들면 나무는 흔들리는데
// 바닥 그림자는 가만히 있어서, 안 흔드느니만 못한 그림이 된다.

/** **false 로 두면 예전처럼 정지한다.** 되돌리기 스위치. */
export const WIND_ENABLED: boolean = true;

// 바람 시각. 물과 같은 이유로 전부가 시계 하나를 공유한다 — 나무마다 시계를
// 두면 같은 돌풍이 그루마다 다른 순간에 도착한다.
const WIND_TIME = {value: 0};

/** 매 프레임 한 번. VillageScene 의 WaterClock 이 물과 함께 돌린다. */
export function advanceFoliageWind(elapsed: number): void {
  WIND_TIME.value = elapsed;
}

export interface FoliageWindOptions {
  /** 이 GLB 의 바닥 y (로컬 좌표). 여기서 흔들림이 0 이다. */
  minY: number;
  /** 이 GLB 의 높이. 꼭대기에서 흔들림이 1 이다. */
  height: number;
  /** 흔들림 폭(로컬 단위). 인스턴스 배율이 곱해지므로 큰 나무가 더 흔들린다. */
  amplitude: number;
  /** 흔들리는 속도 */
  speed: number;
  /** 바람이 부는 월드 방향(XZ). 정규화해서 넣는다. */
  direction: [number, number];
}

// ─── 정점 셰이더 조각 ─────────────────────────────────────────────────────────
// begin_vertex 가 `transformed` 를 만든 직후에 끼운다. project_vertex 가
// instanceMatrix 를 곱하기 **전**이므로 여기서는 오브젝트 공간이다.
const WIND_UNIFORMS = `
uniform float uWindTime;
uniform vec2 uWindDir;
uniform float uWindAmp;
uniform float uWindSpeed;
uniform float uWindMinY;
uniform float uWindHeight;
`;

const WIND_BODY = `
#ifdef USE_INSTANCING
  {
    // 밑동은 붙어 있고 위로 갈수록 크게 눕는다. 1.5 제곱이면 줄기 아래쪽이
    // 거의 안 움직여서 나무가 뿌리째 미끄러지는 느낌이 안 난다.
    float wHeight = clamp( ( position.y - uWindMinY ) / max( uWindHeight, 0.0001 ), 0.0, 1.0 );
    float w = pow( wHeight, 1.5 );

    // 인스턴스 위치 해시 → 그루마다 다른 위상
    vec3 iPos = instanceMatrix[ 3 ].xyz;
    float phase = fract( sin( dot( iPos.xz, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ) * 6.2831853;

    float t = uWindTime * uWindSpeed + phase;
    // 주기가 다른 두 파를 겹쳐 기계적인 반복을 없앤다.
    float swayAmount = ( sin( t ) * 0.7 + sin( t * 1.7 + 1.3 ) * 0.3 ) * uWindAmp * w;

    // 월드 바람 방향을 이 인스턴스의 회전 기저에 투영한다.
    vec3 windWorld = vec3( uWindDir.x, 0.0, uWindDir.y );
    vec3 axisX = normalize( instanceMatrix[ 0 ].xyz );
    vec3 axisZ = normalize( instanceMatrix[ 2 ].xyz );
    vec2 swayLocal = vec2( dot( windWorld, axisX ), dot( windWorld, axisZ ) );

    transformed.xz += swayLocal * swayAmount;
  }
#endif
`;

function patch(material: Material, options: FoliageWindOptions): void {
  const previous = material.onBeforeCompile;

  material.onBeforeCompile = (shader, renderer) => {
    previous?.call(material, shader, renderer);

    shader.uniforms.uWindTime = WIND_TIME;
    shader.uniforms.uWindDir = {
      value: new Vector2(options.direction[0], options.direction[1])
    };
    shader.uniforms.uWindAmp = {value: options.amplitude};
    shader.uniforms.uWindSpeed = {value: options.speed};
    shader.uniforms.uWindMinY = {value: options.minY};
    shader.uniforms.uWindHeight = {value: options.height};

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>${WIND_UNIFORMS}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>${WIND_BODY}`
      );
  };

  // ─── 이게 없으면 패치가 통째로 무시된다 ────────────────────────────────────
  // three 의 getProgramCacheKey 는 **onBeforeCompile 을 키에 넣지 않는다.**
  // 그래서 파라미터가 같은 다른 재질(바위·담장 등)이 먼저 컴파일돼 있으면,
  // 패치한 재질이 그 캐시된 프로그램을 그대로 재사용한다 — 셰이더 소스는
  // 분명히 바뀌었는데 화면은 1픽셀도 안 움직이는, 아주 찾기 힘든 증상이 된다.
  // 키를 갈라 줘야 우리 소스로 컴파일된 프로그램이 따로 만들어진다.
  material.customProgramCacheKey = () => "foliage-wind";

  // 셰이더 소스가 바뀌었으니 three 가 프로그램을 다시 만들어야 한다.
  material.needsUpdate = true;
}

/** 색상 재질에 바람을 물린다. 이미 물려 있으면 아무것도 안 한다. */
export function applyFoliageWind(
  material: Material,
  options: FoliageWindOptions
): void {
  if (!WIND_ENABLED) return;
  if (material.userData.__windApplied) return;
  material.userData.__windApplied = true;
  patch(material, options);
}

/**
 * 그림자용 깊이 재질. 색상 재질과 **똑같이** 흔들어야 그림자가 따라온다.
 *
 * three 는 customDepthMaterial 이 없으면 내부 공용 깊이 재질을 쓰는데, 거기에
 * 패치를 걸면 씬의 모든 그림자가 흔들린다 — 그래서 메시마다 하나씩 만들어 준다.
 */
export function makeFoliageDepthMaterial(
  options: FoliageWindOptions,
  /** 색상 재질. 알파 설정을 옮겨 오기 위해 받는다. */
  source?: Material
): MeshDepthMaterial | undefined {
  if (!WIND_ENABLED) return undefined;

  const depth = new MeshDepthMaterial({depthPacking: RGBADepthPacking});

  // 알파 컷아웃을 안 옮기면 잎 사이 구멍이 그림자에서 메워져 나무가 통짜
  // 덩어리 그림자를 드리운다. three 의 공용 깊이 재질은 이걸 알아서 해 주는데,
  // customDepthMaterial 을 주는 순간 우리 책임이 된다.
  const src = source as
    | {alphaTest?: number; alphaMap?: unknown; map?: unknown}
    | undefined;
  if (src?.alphaTest) {
    depth.alphaTest = src.alphaTest;
    if (src.alphaMap)
      depth.alphaMap = src.alphaMap as MeshDepthMaterial["alphaMap"];
    if (src.map) depth.map = src.map as MeshDepthMaterial["map"];
  }

  patch(depth, options);
  return depth;
}
