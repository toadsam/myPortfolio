import {
  CanvasTexture,
  NoColorSpace,
  RepeatWrapping,
  type Material,
  type Texture
} from "three";

// 바닥 "대지 얼룩" 레이어 (1단계 — 가짜 그림으로 방식만 검증한다).
//
// ── 왜 이게 필요한가 ────────────────────────────────────────────────────────
// 마을 바닥이 격자로 읽히는 진짜 이유는 타일이 반복돼서가 아니라, **눈이 묶어 보는
// 큰 덩어리가 타일 주기로 되풀이되기 때문**이다. scripts/make-grass-texture.mjs 가
// 이미 이 결론에 도달해서 "가장 긴 파장을 타일의 1/8 로 낮추고 꽃도 안 넣는" 식으로
// 큰 덩어리를 **없애서** 해결했다. 격자는 사라졌지만 그 대가로 잔디가 민무늬가 됐다.
//
// 여기서는 반대로 간다. 큰 덩어리를 **없애는 대신 따로 떼어 내** 이 레이어가 맡는다.
//   아래층(이 파일) = 넓은 얼룩. 유니크. 반복 주기 없음.
//   위층(grass-village.png) = 잔결. 2유닛마다 반복. 지금 그대로.
// 화면 색은 둘을 곱한 값이다. 멀리서는 얼룩이 보이고 코앞에서는 결이 보인다.
//
// ── 왜 그림을 아직 안 넣나 ──────────────────────────────────────────────────
// 손으로 그린(또는 Meshy 로 뽑은) 대지 그림을 넣기 전에 규격을 알아야 한다 —
// 몇 픽셀인지, 얼룩이 얼마나 진해야 하는지, 곱셈이라 얼마나 밝게 그려야 원래 색이
// 유지되는지. 그걸 모르고 발주했다가 못 쓴 전례가 있다(terrace-wall / terrace-slab,
// 위시리스트 B7). 이 파일의 절차적 얼룩으로 숫자를 먼저 확정하고, 2단계에서 같은
// 자리에 진짜 그림을 끼운다. 그때 이 makeMacroTexture 만 파일 로딩으로 바꾸면 된다.
//
// ── 왜 청크로 안 쪼갰나 ─────────────────────────────────────────────────────
// 매크로 uv 를 **월드 좌표**에서 뽑기 때문에(TerraceTops 가 잔디 uv 를 굽는 방식과
// 같다), 바닥 메시를 나중에 몇 조각으로 쪼개도 무늬가 한 픽셀도 안 변한다.
// 이음매가 원천적으로 안 생기고, 확장할 때 조각을 붙여도 얼룩이 그대로 이어진다.
// 그래서 쪼개기는 그림을 넣는 2단계에서 해도 늦지 않다 — 지금 쪼개면 검증할 것만
// 늘어난다.

/** **false 로 두면 예전 바닥 그대로다.** 되돌리기 스위치. */
export const MACRO_ENABLED: boolean = true;

/**
 * 얼룩 텍스처 한 장이 덮는 월드 크기(유닛) = **가장 큰 덩어리의 크기**.
 *
 * 길 타일 격자가 1.88 이므로 이 값이 그 근처면 아무 의미가 없다(같이 격자로 읽힌다).
 * 마을 지름이 80 이라 34 면 마을을 가로질러 두 번 반쯤 변한다.
 */
export const MACRO_WORLD = 34;

/**
 * 얼룩 진하기. 0 이면 지금과 완전히 같고, 1 이면 밝은 데가 2배·어두운 데가 0배다.
 *
 * 이 값이 1단계의 **핵심 산출물**이다. 옅으면 격자가 그대로 보이고, 진하면 얼룩만
 * 보이면서 잔디 결이 죽는다. 화면을 찍어 가며 경계를 찾은 뒤 그 숫자를 그림 발주서에
 * 적는다.
 */
export const MACRO_STRENGTH = 0.35;

/** 텍스처 한 변(px). 얼룩만 담으므로 성길수록 좋다 — 34유닛에 512px 이면 15px/유닛. */
const SIZE = 512;

function hash(x: number, y: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * 가로·세로 **둘 다** 주기가 맞는 값 노이즈.
 *
 * skyClouds 의 것은 가로(periodX)만 되풀이된다 — 하늘 돔은 세로로 이어 붙을 일이
 * 없어서다. 바닥은 월드 uv 로 무한히 반복되므로 세로도 맞지 않으면 34유닛마다
 * 가로줄 이음매가 생긴다.
 */
function valueNoise(x: number, y: number, period: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const wrap = (v: number) => ((v % period) + period) % period;
  const x0 = wrap(xi),
    x1 = wrap(xi + 1);
  const y0 = wrap(yi),
    y1 = wrap(yi + 1);
  const a = hash(x0, y0),
    b = hash(x1, y0),
    c = hash(x0, y1),
    d = hash(x1, y1);
  const u = smooth(xf),
    v = smooth(yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** period 를 2의 거듭제곱으로 두면 옥타브마다 주기가 정수로 유지된다 */
function fbm(x: number, y: number, period: number, octaves: number) {
  let sum = 0,
    amp = 0.5,
    freq = 1,
    norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, period * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

let cached: CanvasTexture | null = null;

/**
 * 얼룩 지도. 회색 한 장이고 0.5 가 "변화 없음"이다.
 *
 * 2단계에서 진짜 그림으로 바꿀 때도 **이 규약을 지켜야 한다** — 중간 회색이 원래 색,
 * 밝으면 볕 든 마른 땅, 어두우면 그늘지고 축축한 땅.
 */
export function makeMacroTexture(): CanvasTexture {
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(SIZE, SIZE);
  const data = image.data;

  // 주기 4 = 텍스처 한 장 안에 가장 큰 덩어리가 네 개. 옥타브 4 면 가장 잔 것이
  // 1/8 크기(약 4유닛)라 잔디 결(2유닛)보다 크다 — 두 층의 역할이 안 겹친다.
  const PERIOD = 4;
  const OCTAVES = 4;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const n = fbm((x / SIZE) * PERIOD, (y / SIZE) * PERIOD, PERIOD, OCTAVES);
      // fbm 은 0.5 근처에 몰려 있다. 가운데를 기준으로 벌려 대비를 세운다 —
      // 여기서 벌리지 않으면 셰이더의 strength 를 올려도 밋밋한 채로 어두워지기만 한다.
      const v = Math.max(0, Math.min(1, 0.5 + (n - 0.5) * 1.7));
      const i = (y * SIZE + x) * 4;
      const b = Math.round(v * 255);
      data[i] = b;
      data[i + 1] = b;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // **색이 아니라 곱셈 계수다.** sRGB 로 두면 three 가 감마를 풀어 버려 얼룩이
  // 의도보다 짙어진다. raw 값 그대로 읽어야 0.5 가 "변화 없음"이 된다.
  texture.colorSpace = NoColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  cached = texture;
  return texture;
}

/**
 * 재질에 얼룩 레이어를 물린다. **월드 XZ 로 샘플링**하므로 메시를 어떻게 쪼개든
 * 무늬가 같은 자리에 남는다.
 *
 * 재질을 통째로 갈아 끼우지 않고 onBeforeCompile 로 한 줄만 끼워 넣는 이유는,
 * MeshStandardMaterial 의 조명·그림자·톤매핑을 그대로 타야 하기 때문이다.
 * 커스텀 셰이더로 만들면 그 전부를 다시 짜야 한다.
 */
export function applyGroundMacro(material: Material, macro: Texture): void {
  if (!MACRO_ENABLED) return;
  // ref 콜백은 렌더마다 불릴 수 있다. 두 번 끼우면 셰이더가 중복 선언으로 깨진다.
  if (material.userData.__macroApplied) return;
  material.userData.__macroApplied = true;

  material.onBeforeCompile = shader => {
    shader.uniforms.macroMap = {value: macro};
    shader.uniforms.macroWorld = {value: MACRO_WORLD};
    shader.uniforms.macroStrength = {value: MACRO_STRENGTH};
    // 셰이더에 **정말로** 들어갔다는 표시. onBeforeCompile 은 재질을 만들 때가 아니라
    // 그 재질이 처음 그려질 때 불리므로, userData.__macroApplied(패치를 걸었다)만으로는
    // 컴파일까지 됐는지 알 수 없다. 화면으로는 이 효과를 분리 검증할 수 없어서
    // (씬 애니메이션이 차분을 덮는다) 이 플래그가 유일한 확인 수단이다.
    material.userData.__macroCompiled = true;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vMacroXZ;")
      .replace(
        "#include <begin_vertex>",
        // 바닥 타일은 InstancedMesh 다. instanceMatrix 를 빼먹으면 한 청크의 타일
        // 수백 장이 **전부 원점의 얼룩 한 점**을 읽어서 통짜 단색이 된다.
        // (three 는 이 행렬을 project_vertex 에서야 곱하므로 여기서 직접 곱해야 한다)
        `#include <begin_vertex>
         vec4 macroLocal = vec4(transformed, 1.0);
         #ifdef USE_INSTANCING
           macroLocal = instanceMatrix * macroLocal;
         #endif
         vMacroXZ = (modelMatrix * macroLocal).xz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform sampler2D macroMap;
         uniform float macroWorld;
         uniform float macroStrength;
         varying vec2 vMacroXZ;`
      )
      // color_fragment 뒤여야 한다 — 그 앞이면 map(잔디 결)이 아직 안 곱해져 있어서
      // 얼룩만 있고 결이 없는 바닥이 된다.
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         float macroS = texture2D(macroMap, vMacroXZ / macroWorld).r;
         diffuseColor.rgb *= mix(1.0, macroS * 2.0, macroStrength);`
      );
  };

  // 같은 셰이더를 쓰는 다른 재질과 프로그램이 섞이지 않게 한다. 이게 없으면
  // three 가 "같은 MeshStandardMaterial"로 보고 패치 안 된 프로그램을 재사용할 수 있다.
  material.customProgramCacheKey = () => "ground-macro-v1";
  material.needsUpdate = true;
}
