import {LookupTexture} from "postprocessing";

// 화면 전체에 한 번 먹이는 색보정(컬러 그레이딩).
//
// ── 왜 필요한가 ─────────────────────────────────────────────────────────────
// 마을의 에셋 61종은 전부 따로 생성됐다. 각자 자기 나름의 채도·색온도를 갖고
// 있어서, 한 화면에 모아 놓으면 "같은 곳에 있는 물건들"로 안 읽힌다. 지붕은
// 쨍한 주황, 옆 나무는 형광 초록, 그 옆 바위는 중성 회색 — 조명을 아무리 예쁘게
// 깔아도 각 물체가 자기 색을 그대로 주장해서 콜라주처럼 보인다.
//
// 이걸 에셋마다 손으로 맞추면 61번을 고쳐야 하고, 하나 추가할 때마다 또 해야
// 한다. 실사 영화·게임이 쓰는 방법은 반대다 — **개별 색은 놔두고 화면 전체를
// 한 번 통과시킨다.** 그림자는 전부 같은 색으로 가라앉히고 밝은 곳은 전부 같은
// 색으로 뜨게 만들면, 출처가 제각각인 물체들이 같은 공기 아래 놓인다.
//
// ── 왜 LUT 인가 (그냥 셰이더로 계산하면 안 되나) ────────────────────────────
// 계산 자체는 셰이더로도 된다. 하지만 그러면 픽셀마다 매 프레임 S커브·채도·
// 스플릿토닝을 다시 계산한다. LUT 는 **입력 색 → 출력 색을 미리 다 계산해 둔
// 표**다. 로드할 때 32³=32768개를 한 번 굽고, 실행 중에는 3D 텍스처 조회
// 한 번으로 끝난다. 보정 식이 아무리 복잡해져도 런타임 비용이 안 늘어난다.
//
// ── 왜 코드로 굽나 (시중 .cube 파일을 쓰면 되지 않나) ───────────────────────
// 시중 LUT 는 실사 촬영본을 전제로 만들어져서 우리 톤에 안 맞고, 무엇보다
// **시간대마다 다른 보정이 필요하다.** 밤에 노을용 보정을 먹이면 하늘이 진흙이
// 된다. 코드로 구우면 시간대별 값을 villagePalette 에 나란히 적어 둘 수 있고,
// 값 하나 바꿔서 바로 확인할 수 있다.
//
// ── 어느 색공간에서 계산하나 (틀리기 쉬운 부분) ─────────────────────────────
// postprocessing 의 LUT3DEffect 는 inputColorSpace 가 sRGB 라, 이펙트 체인이
// 이 앞에서 리니어 → sRGB 변환을 끼워 준다. 즉 **여기 들어오는 값은 이미
// 감마가 먹은 화면 값**이다. 보정을 리니어에서 하면 S커브의 중간값이 0.5가
// 아니라 0.21 이 돼서 대비가 엉뚱한 데 걸린다. 아래 계산은 전부 sRGB 기준이고,
// 그래서 0.5 를 중간 회색으로 놓고 생각하면 된다.
//
// 톤매핑 **뒤에** 놓아야 하는 것도 같은 이유다. 앞에 놓으면 아직 HDR(1을 넘는
// 값)이라 표를 벗어난 밝은 부분이 통째로 잘린다.

/** LUT 한 변의 칸 수. 32³ = 32768 항목, RGBA float 로 512KB. */
const SIZE = 32;

export interface VillageGrade {
  /** 어두운 쪽에 깔리는 색 */
  shadowTint: string;
  /** 밝은 쪽에 스며드는 색 */
  highlightTint: string;
  /**
   * 그림자 바닥을 shadowTint 로 **들어올리는** 정도 0~0.1.
   *
   * ── 왜 덧셈이어야 하나 (처음에 곱셈으로 짰다가 틀렸다) ────────────────────
   * 그림자 색조를 곱셈으로 넣으면 어두운 곳일수록 효과가 사라진다 —
   * 0 × 무엇을 곱해도 0 이다. 정작 색을 입히고 싶은 게 그늘인데 그늘에만
   * 안 먹고, 이미 색이 진한 지붕·잎에만 먹어서 **색 차이를 벌려 놓는다.**
   * 실측했더니 색상 흩어짐이 76.6° → 94.2° 로 오히려 늘었다.
   *
   * 덧셈으로 바꾸면 검정에 색 바닥이 깔린다. 출처가 제각각인 물체라도 어두운
   * 부분이 전부 같은 색으로 시작하고, 그게 "같은 공기 속에 있다"는 인상을
   * 만든다. 필름의 바랜 느낌·대기 산란이 전부 이거다.
   *
   * 0.05 를 넘기면 검정이 떠서 화면이 뿌옇게 씻긴다.
   */
  lift: number;
  /**
   * 밝은 쪽을 highlightTint 로 기울이는 정도 0~1. 이쪽은 곱셈이 맞다 —
   * 볕이 물체 색을 **비추는** 것이라, 원래 색에 비례해야 자연스럽다.
   */
  gain: number;
  /** S커브 대비 0~1. 어두운 곳은 더 가라앉고 밝은 곳은 더 뜬다. */
  contrast: number;
  /** 채도 배율. 1이 원본. 1 미만이면 에셋별 쨍함이 눌린다. */
  saturation: number;
  /**
   * 밝은 쪽만 따로 채도를 뺀다 0~1.
   * 실제 필름은 빛이 셀수록 색이 빠져 흰색으로 굴러간다. 이게 없으면 밝은
   * 부분이 원색 그대로 포화돼 "물감"처럼 보인다.
   */
  highlightDesat: number;
}

// 사람 눈이 느끼는 밝기. 초록이 압도적으로 무겁다 — 단순 평균으로 하면
// 채도를 뺐을 때 초록 잎이 실제보다 훨씬 어두워진다.
const LR = 0.2126;
const LG = 0.7152;
const LB = 0.0722;

function luma(r: number, g: number, b: number): number {
  return LR * r + LG * g + LB * b;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * 곱셈용 색조 — **밝기 1로 정규화**한다.
 *
 * 이걸 안 하면 어두운 색을 색조로 넣는 순간 화면이 통째로 더 어두워져, 색을
 * 고른 게 아니라 노출을 내린 꼴이 된다. 밝기를 1로 맞춰 두면 곱해도 전체
 * 밝기는 그대로고 **색만** 기운다 — 대비와 색조를 따로 만질 수 있다.
 */
function gainTint(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const l = Math.max(luma(r, g, b), 1e-4);
  return [r / l, g / l, b / l];
}

/**
 * 덧셈용 색조 — **가장 큰 채널을 1로** 맞춘다.
 *
 * 덧셈에서는 밝기 정규화가 오히려 방해가 된다. 어두운 남색을 밝기 1로 키우면
 * 파랑이 1을 훌쩍 넘어가서, lift 를 조금만 올려도 그림자가 형광 파랑이 된다.
 * 최대 채널을 1로 두면 lift 값이 곧 "바닥을 얼마나 들어올리는지"가 돼서
 * 눈으로 예측할 수 있다.
 */
function liftTint(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const m = Math.max(r, g, b, 1e-4);
  return [r / m, g / m, b / m];
}

/** 0~1 S커브. 3x²-2x³ 는 양 끝의 기울기가 0이라 잘리는 구간 없이 부드럽다. */
function smoothstep01(x: number): number {
  return x * x * (3 - 2 * x);
}

/**
 * 보정표를 굽는다. 모듈 로드 때 한 번만 부른다.
 *
 * 데이터 배치는 postprocessing 의 규약을 따른다 —
 * 인덱스 = (r + g*size + b*size²) * 4, 값은 0~1 float.
 */
export function makeGradeLut(grade: VillageGrade): LookupTexture {
  const lut = LookupTexture.createNeutral(SIZE);
  const data = lut.image.data as Float32Array;

  const sTint = liftTint(grade.shadowTint);
  const hTint = gainTint(grade.highlightTint);
  const step = 1 / (SIZE - 1);

  for (let bi = 0; bi < SIZE; bi++) {
    for (let gi = 0; gi < SIZE; gi++) {
      for (let ri = 0; ri < SIZE; ri++) {
        let r = ri * step;
        let g = gi * step;
        let b = bi * step;

        // ① 대비 — 색조보다 먼저다. 색을 먼저 기울여 놓고 대비를 주면
        //    기울인 만큼이 같이 증폭돼 색조 세기를 예측할 수 없게 된다.
        const c = grade.contrast;
        if (c > 0) {
          r += (smoothstep01(r) - r) * c;
          g += (smoothstep01(g) - g) * c;
          b += (smoothstep01(b) - b) * c;
        }

        // ② 밝은 쪽 색조 (gain, 곱셈) — 볕이 물체를 비추는 것이라 원래 색에
        //    비례한다. 가중치에 smoothstep 을 쓰는 이유: 그냥 휘도를 쓰면
        //    중간톤(마을 대부분)까지 같이 물들어 색필터처럼 보인다.
        const w = smoothstep01(Math.min(1, Math.max(0, luma(r, g, b))));
        const gn = grade.gain * w;
        r *= 1 + (hTint[0] - 1) * gn;
        g *= 1 + (hTint[1] - 1) * gn;
        b *= 1 + (hTint[2] - 1) * gn;

        // ③ 그림자 바닥 깔기 (lift, 덧셈) — **에셋을 묶는 건 이 단계가 한다.**
        //    (1-x) 를 곱해 어두운 곳에 몰아 준다. 밝은 곳까지 들어올리면
        //    화면 전체가 안개 낀 것처럼 씻긴다.
        const lf = grade.lift;
        r += sTint[0] * lf * (1 - r);
        g += sTint[1] * lf * (1 - g);
        b += sTint[2] * lf * (1 - b);

        // ④ 전체 채도
        const l = luma(r, g, b);
        const s = grade.saturation;
        r = l + (r - l) * s;
        g = l + (g - l) * s;
        b = l + (b - l) * s;

        // ⑤ 밝은 쪽 채도 빼기. 0.55 부터 서서히 시작해 1 에서 최대다 —
        //    문턱을 더 올리면 진짜 흰 부분에만 걸려서 티가 안 난다.
        const hw =
          smoothstep01(Math.min(1, Math.max(0, (l - 0.55) / 0.45))) *
          grade.highlightDesat;
        if (hw > 0) {
          r += (l - r) * hw;
          g += (l - g) * hw;
          b += (l - b) * hw;
        }

        const i4 = (ri + gi * SIZE + bi * SIZE * SIZE) * 4;
        data[i4] = Math.min(1, Math.max(0, r));
        data[i4 + 1] = Math.min(1, Math.max(0, g));
        data[i4 + 2] = Math.min(1, Math.max(0, b));
        data[i4 + 3] = 1;
      }
    }
  }

  lut.name = "village-grade";
  lut.needsUpdate = true;
  return lut;
}
