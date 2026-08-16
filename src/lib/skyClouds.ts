import {CanvasTexture, Color, RepeatWrapping, SRGBColorSpace} from "three";

// 하늘 돔에 얹는 구름 텍스처를 **런타임에** 만든다.
//
// 왜 파일이 아니라 코드인가: 텍스처 예산이 330MB/340MB 로 이미 꽉 차 있어서
// 새 PNG 를 리포에 넣기 부담스럽고, 무엇보다 구름 색을 시간대 팔레트에서
// 받아야 한다(노을엔 주황, 새벽엔 분홍, 밤엔 잿빛). 색마다 그림을 굽는 대신
// 값 노이즈로 한 장 그리고 팔레트 색 두 개를 섞는다. 1024×512 RGBA = 2MB.
//
// 가로(u)는 **주기 노이즈**라 이음매가 없다 — 돔을 한 바퀴 감아도 안 끊긴다.
// 세로는 지평선 근처 띠에만 구름이 앉게 마스크를 씌운다. 컨셉 아트의 구름도
// 머리 위가 아니라 지평선 위에 낮게 깔려 있다.

const W = 1024;
const H = 512;

function hash(x: number, y: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** periodX 로 가로가 되풀이되는 값 노이즈 */
function valueNoise(x: number, y: number, periodX: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const x0 = ((xi % periodX) + periodX) % periodX;
  const x1 = (((xi + 1) % periodX) + periodX) % periodX;
  const a = hash(x0, yi),
    b = hash(x1, yi),
    c = hash(x0, yi + 1),
    d = hash(x1, yi + 1);
  const u = smooth(xf),
    v = smooth(yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** periodX 를 2의 거듭제곱으로 두면 옥타브마다 주기가 정수로 유지된다 */
function fbm(x: number, y: number, periodX: number, octaves: number) {
  let sum = 0,
    amp = 0.5,
    freq = 1,
    norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, periodX * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

/**
 * @param light 볕 받는 구름 윗면
 * @param dark  그늘진 구름 밑면
 * @param cover 0~1. 낮을수록 구름이 성기다. 0 이면 아예 안 그린다.
 */
export function makeCloudTexture(light: string, dark: string, cover: number) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(W, H);
  const data = image.data;

  const hi = new Color(light);
  const lo = new Color(dark);
  const mixed = new Color();

  // 구름이 앉는 띠 — v 0 이 돔 꼭대기, 0.5 가 지평선. 지평선 아래는 안 그린다.
  //
  // **v 를 그냥 "지평선 근처"로 읽으면 안 된다.** v 는 천정각이라 고도 = 90−v×180 이다.
  // 처음에 0.10~0.49 로 잡았는데 그게 고도 2°~72°, 곧 하늘 거의 전부였다. 게다가
  // 마을을 내려다보는 기본 카메라는 지평선 언저리(고도 0~20°)만 본다 — 구름은
  // 화면 **위쪽 밖**에 다 떠 있고, 보이는 건 그 아래 빈 하늘뿐이었다.
  // 지금 범위는 고도 약 2°~50°, 가장 짙은 곳이 18°다.
  //
  // 아래 끝을 0.488 로 둬 스카이라인 바로 위는 비운다(먼 산이 구름에 안 묻히게).
  const TOP = 0.22;
  const PEAK = 0.4;
  const BOTTOM = 0.488;

  // ── 문턱을 그냥 (n - t)/(1 - t) 로 잡으면 안 된다 ────────────────────────────
  // 이 fbm 은 실측 분포가 0.13~0.84, 90%가 0.33~0.69 사이에 몰려 있다. 문턱을
  // 0.45 로 두니 **띠의 71%가 구름**이 돼서, 뭉치가 아니라 하늘 전체에 낀
  // 갈색 막이 됐다(실제로 그렇게 나왔다).
  //
  // 그래서 두 단계로 나눈다: ① 쓰이는 구간(0.36~0.66)을 0~1 로 편다 ②
  // 그 위에서 smoothstep 으로 끊는다. cover 0.72 면 띠의 35%쯤이 구름이 된다.
  const SPREAD_LO = 0.36;
  const SPREAD_SPAN = 0.3;
  const cut = 1 - cover * 0.52;
  const EDGE = 0.12;

  for (let j = 0; j < H; j++) {
    const v = j / H;
    let mask: number;
    if (v < TOP || v > BOTTOM) mask = 0;
    else if (v < PEAK) mask = smooth((v - TOP) / (PEAK - TOP));
    else mask = smooth((BOTTOM - v) / (BOTTOM - PEAK));

    for (let i = 0; i < W; i++) {
      const at = (j * W + i) * 4;
      if (mask <= 0) {
        data[at + 3] = 0;
        continue;
      }
      // 가로 좌표는 **정확히 periodX 만큼** 돌아야 u=1 과 u=0 이 이어진다.
      // (i/W)*10 에 periodX 16 을 주면 이음매가 벌어진다 — 실제로 그렇게 썼다가 고쳤다.
      const raw = fbm((i / W) * 12, v * 13, 12, 5);
      const n = Math.min(1, Math.max(0, (raw - SPREAD_LO) / SPREAD_SPAN));
      if (n <= cut) {
        data[at + 3] = 0;
        continue;
      }
      const a = smooth(Math.min(1, (n - cut) / EDGE)) * mask * 0.9;
      // 두꺼운 데(노이즈가 높은 곳)를 볕 받는 윗면으로 — 이것만으로 덩어리가 생긴다
      mixed.copy(lo).lerp(hi, Math.min(1, (n - cut) / 0.3));
      data[at] = mixed.r * 255;
      data[at + 1] = mixed.g * 255;
      data[at + 2] = mixed.b * 255;
      data[at + 3] = a * 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
