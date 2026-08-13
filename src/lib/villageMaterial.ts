import {Vector2, type Material, type MeshStandardMaterial, type Object3D, type Mesh} from "three";
import villageColors from "@/data/villageColors.json";

// 마을 GLB 전부에 **같은 빛 반응**을 강제한다.
//
// ── 왜 필요한가 ─────────────────────────────────────────────────────────────
// 에셋 237개는 Meshy 가 하나씩 따로 생성한 것이라 재질 값이 제각각이다. 어떤
// 지붕은 살짝 광택이 돌고 어떤 벽은 완전 무광인데, **같은 빛 아래서 다르게
// 반응하면 다른 세계의 물건으로 읽힌다.** 색은 LUT 가 묶었지만 반응은 아직
// 제각각이라, "같은 조명 아래 있지만 같은 손으로 만들어지진 않은" 인상이 남는다.
//
// 에셋을 하나씩 고치는 대신 전부가 통과하는 관문을 하나 둔다 — LUT 로 색을 묶은
// 것과 같은 방식이다. 새 에셋이 들어와도 자동으로 같은 규칙을 탄다.
//
// ── metalness 를 0 으로 미는 근거 ───────────────────────────────────────────
// 이 씬에는 **환경맵이 없다**(drei 의 Environment 를 안 쓴다). 금속은 주변을
// 비춰서 금속으로 보이는 건데 비출 게 없으면 확산광만 잃고 검게 남는다.
// 실측하니 재질 199개의 metalness 팩터가 1.0 이었고, 그중 193개는 MR 텍스처가
// 값을 정하지만 캐릭터 6개는 텍스처도 없이 팩터만 1.0 — 순수 금속이었다.
// 환경맵을 들이지 않는 한 metalness 는 이득이 없다.
//
// ── roughness 맵을 버리는 근거 ──────────────────────────────────────────────
// 맵을 남기면 에셋마다 다른 광택 분포가 그대로 남는다. 그게 바로 지우려는
// 차이다. 표면 디테일은 노멀맵이 맡고, 광택은 마을 전체가 하나를 공유한다.
// (창문 광택이 아쉬울 수 있는데, 창문은 이미 emissiveMap 이 따로 켠다)

/** **false 로 두면 GLB 원본 재질 그대로다.** 되돌리기 스위치: /?mat=0 */
export const MATERIAL_LOCK =
  typeof window === "undefined" || new URLSearchParams(window.location.search).get("mat") !== "0";

/**
 * 마을 전체가 공유하는 거칠기. 0.85 는 "칠한 나무·회벽·기와" 대역이다.
 * 1.0 으로 두면 빛이 완전히 퍼져 형태가 밋밋해지고, 0.6 아래면 플라스틱처럼
 * 번들거린다. 태양이 형태를 만드는 지금 조명에서는 이 근처가 안전하다.
 */
const ROUGHNESS = 0.85;

/**
 * 노멀맵 세기. 에셋마다 굴곡이 들쭉날쭉하면 어떤 집만 유난히 우둘투둘해 보인다.
 * 맵 자체는 살려 두되(표면 디테일은 여기서 나온다) 세기만 통일한다.
 */
const NORMAL_SCALE = 0.8;

// ─── 2층: 알베도 색조를 마을 팔레트로 끌어당긴다 ─────────────────────────────
//
// ── 무엇을 하나 ────────────────────────────────────────────────────────────
// LUT 는 화면 전체에 같은 필터를 씌워 분위기를 묶었지만 **색과 색 사이의 차이는
// 그대로 남는다.** A 에셋의 갈색과 B 에셋의 갈색이 여전히 다른 갈색이다.
// 여기서는 재질 고유색(알베도)의 **색조**를 컨셉 아트에서 뽑은 7가지로 끌어당겨
// 차이 자체를 없앤다. 같은 나무는 같은 갈색, 같은 돌은 같은 회색이 된다.
//
// ── 왜 색조만인가 (밝기·채도는 왜 안 건드리나) ──────────────────────────────
// 컨셉 아트는 이미 노을빛과 보라 그림자가 **칠해진 결과물**이다. 거기서 뽑은
// 색을 알베도에 통째로 박으면 우리 조명과 LUT 가 그 위에 또 얹혀 두 번 물든다 —
// 마을이 진흙색이 된다. 물체의 정체성은 "어느 쪽으로 치우친 색인가"에 있으므로
// 방향만 맞추고 밝기·채도는 에셋이 갖고 있던 것을 그대로 둔다.
//
// ── 왜 텍스처 파일을 안 고치고 셰이더인가 ──────────────────────────────────
// baseColor 텍스처 233장 중 119장이 JPEG 라 오프라인으로 고치려면 JPEG 디코더가
// 필요하다. 셰이더에서 하면 원본을 안 건드리니 되돌리기가 공짜고, 세기를 URL 로
// 바로 바꿔 볼 수 있고, 새 에셋도 자동으로 같은 규칙을 탄다.

const HUES = villageColors.hues.map((h) => h.dir as [number, number]);

/**
 * 채도 상한 — 컨셉 아트가 실제로 쓰는 채도의 90퍼센타일.
 *
 * 색조만 맞춰서는 부족했다. Meshy 에셋과 잔디는 컨셉 아트보다 훨씬 쨍해서
 * (잔디 채도 0.162 vs 컨셉 상한 0.107), 색조가 같아져도 "물감으로 칠한 것"과
 * "그림"이 나란히 있는 느낌이 남는다. **컨셉에 없는 채도는 마을에도 없어야 한다.**
 *
 * 감으로 정하면 취향 싸움이 되므로 팔레트에서 실측해 쓴다.
 */
const CHROMA_CEIL = (() => {
  const cs = villageColors.colors.map((c) => Math.hypot(c.a, c.b)).sort((x, y) => x - y);
  return cs[Math.floor(cs.length * 0.9)] ?? 0.107;
})();

/** 색조를 얼마나 끌어당길지 0~1. **0 이면 원본 색 그대로.** /?palette=0.3 으로 조절 */
export const PALETTE_STRENGTH = (() => {
  if (typeof window === "undefined") return 0.55;
  const v = new URLSearchParams(window.location.search).get("palette");
  if (v === null) return 0.55;
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.55;
})();

/**
 * 세기를 재질 전부가 **하나의 유니폼 객체**로 공유한다 (물결·바람과 같은 방식).
 *
 * 이래야 새로고침 없이 값을 바꿔 볼 수 있다. 색보정처럼 "껐다 켰다 해 봐야
 * 판단이 서는" 값은 40초짜리 리로드를 사이에 끼우면 비교가 불가능하다.
 * 개발 모드에서 `window.__palette(0.3)` 으로 즉시 바뀐다.
 */
const STRENGTH = {value: PALETTE_STRENGTH};

export function setPaletteStrength(v: number): void {
  STRENGTH.value = Math.max(0, Math.min(1, v));
}

// Oklab — 거리 1 이 어디서나 비슷하게 달라 보이는 공간. RGB 에서 색조를 돌리면
// 밝기가 같이 흔들려서 지붕만 허옇게 뜨거나 하는 일이 생긴다.
const OKLAB_GLSL = `
vec3 vmLinearToOklab(vec3 c){
  float l = 0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b;
  float m = 0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b;
  float s = 0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b;
  vec3 lms = pow( max( vec3(l,m,s), 0.0 ), vec3(1.0/3.0) );
  return vec3(
    0.2104542553*lms.x + 0.7936177850*lms.y - 0.0040720468*lms.z,
    1.9779984951*lms.x - 2.4285922050*lms.y + 0.4505937099*lms.z,
    0.0259040371*lms.x + 0.7827717662*lms.y - 0.8086757660*lms.z );
}
vec3 vmOklabToLinear(vec3 lab){
  float l_ = lab.x + 0.3963377774*lab.y + 0.2158037573*lab.z;
  float m_ = lab.x - 0.1055613458*lab.y - 0.0638541728*lab.z;
  float s_ = lab.x - 0.0894841775*lab.y - 1.2914855480*lab.z;
  vec3 lms = vec3( l_*l_*l_, m_*m_*m_, s_*s_*s_ );
  return vec3(
     4.0767416621*lms.x - 3.3077115913*lms.y + 0.2309699292*lms.z,
    -1.2684380046*lms.x + 2.6097574011*lms.y - 0.3413193965*lms.z,
    -0.0041960863*lms.x - 0.7034186147*lms.y + 1.7076147010*lms.z );
}
`;

const PALETTE_BODY = `
{
  vec3 vmLab = vmLinearToOklab( max( diffuseColor.rgb, 0.0 ) );
  float vmC = length( vmLab.yz );
  if ( vmC > 0.0005 ) {
    vec2 vmDir = vmLab.yz / vmC;
    vec2 vmBest = vmDir;
    float vmMax = -2.0;
    for ( int i = 0; i < VM_HUES; i ++ ) {
      float d = dot( vmDir, uPaletteHues[ i ] );
      if ( d > vmMax ) { vmMax = d; vmBest = uPaletteHues[ i ]; }
    }
    // 회색에 가까울수록 덜 움직인다 — 채도가 낮으면 색조가 불안정해서
    // 억지로 끌면 무채색 벽이 엉뚱한 색으로 물든다.
    float vmW = uPaletteStrength * smoothstep( 0.0, 0.045, vmC );
    vec2 vmNew = normalize( mix( vmDir, vmBest, vmW ) );
    // 채도 상한 — 컨셉에 없는 쨍함을 깎는다. 색조만 맞추면 "같은 색인데
    // 하나만 물감처럼 진한" 상태가 남는다. 세기에 비례해 눌러야 palette=0 일 때
    // 원본으로 정확히 돌아온다.
    float vmC2 = mix( vmC, min( vmC, uPaletteChromaCeil ), uPaletteStrength );
    vmLab.yz = vmNew * vmC2;
    diffuseColor.rgb = max( vmOklabToLinear( vmLab ), 0.0 );
  }
}
`;

function patchPalette(std: MeshStandardMaterial): void {
  // 0 으로 시작해도 패치는 걸어 둔다 — 안 그러면 실행 중에 세기를 올릴 수 없다
  if (HUES.length === 0) return;
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    (window as unknown as {__palette?: (v: number) => void}).__palette = setPaletteStrength;
  }

  const previous = std.onBeforeCompile;
  std.onBeforeCompile = (shader, renderer) => {
    previous?.call(std, shader, renderer);
    shader.uniforms.uPaletteHues = {value: HUES.map(([a, b]) => new Vector2(a, b))};
    shader.uniforms.uPaletteStrength = STRENGTH;
    shader.uniforms.uPaletteChromaCeil = {value: CHROMA_CEIL};
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
#define VM_HUES ${HUES.length}
uniform vec2 uPaletteHues[ VM_HUES ];
uniform float uPaletteStrength;
uniform float uPaletteChromaCeil;
${OKLAB_GLSL}`
      )
      // map_fragment 가 텍스처와 color 를 곱해 diffuseColor 를 완성한 **직후**.
      // 조명은 아직 안 붙었으므로 여기서 바꾸면 재질 고유색만 바뀐다.
      .replace("#include <map_fragment>", `#include <map_fragment>${PALETTE_BODY}`);
  };

  // three 의 getProgramCacheKey 는 onBeforeCompile 을 키에 안 넣는다. 안 갈라 두면
  // 파라미터가 같은 다른 재질의 캐시된 프로그램을 재사용해 패치가 통째로 무시된다
  // (오늘 바람에서 한 번 당했다). foliageWind 가 이미 키를 걸어 뒀을 수 있으므로
  // 덮어쓰지 말고 이어 붙인다 — 안 그러면 잎 재질과 벽 재질이 같은 키를 갖는다.
  const before = std.customProgramCacheKey ? std.customProgramCacheKey() : "";
  std.customProgramCacheKey = () => `${before}+village-palette`;
  std.needsUpdate = true;
}

function lockOne(material: Material): void {
  const std = material as MeshStandardMaterial;
  // MeshBasicMaterial 등 PBR 이 아닌 재질은 건너뛴다
  if (!std || !("roughness" in std)) return;
  if (std.userData.__matLocked) return;
  std.userData.__matLocked = true;

  std.metalness = 0;
  std.roughness = ROUGHNESS;
  // 맵을 지우는 건 셰이더 define 을 바꾸는 일이라 needsUpdate 가 필수다
  std.metalnessMap = null;
  std.roughnessMap = null;

  if (std.normalMap && std.normalScale) {
    std.normalScale = new Vector2(NORMAL_SCALE, NORMAL_SCALE);
  }

  // 2층 — 색조를 팔레트로. 반응(1층)과 색(2층)을 같이 잠가야 "하나의 손"이 된다.
  patchPalette(std);

  std.needsUpdate = true;
}

/**
 * GLB 트리 전체의 재질을 잠근다.
 *
 * useGLTF 는 같은 경로를 캐시해 돌려주므로 재질도 공유된다 — `__matLocked`
 * 플래그로 한 번만 건드린다(안 그러면 인스턴스마다 needsUpdate 가 걸려
 * 셰이더를 계속 다시 만든다).
 */
export function lockSceneMaterials(root: Object3D): void {
  if (!MATERIAL_LOCK) return;
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) if (m) lockOne(m);
  });
}

/** 재질 하나만 잠근다 — 인스턴싱처럼 트리를 안 거치는 경로용 */
export function lockMaterial(material: Material | Material[]): void {
  if (!MATERIAL_LOCK) return;
  const mats = Array.isArray(material) ? material : [material];
  for (const m of mats) if (m) lockOne(m);
}
