import {CanvasTexture, RepeatWrapping, SRGBColorSpace} from "three";

// 구역 단(축대)의 옆면에 씌우는 **돌쌓기 텍스처**를 런타임에 만든다.
//
// 왜 필요했나: 축대를 정점 색만 넣은 세로 띠 한 장으로 그렸더니, 손그림 판석
// 옆에서 회색 콘크리트 턱으로 보였다("층이 자연스럽게 있어야 하는데 이상하다").
// 층이 안 느껴진 게 아니라 **층의 옆면이 재료로 안 읽힌** 것이다.
//
// 왜 GLB 가 아니라 코드인가: 받은 terrace-wall.glb 는 ㄱ자 **모서리** 조각이라
// 직선 구간을 못 채운다. 여섯 구역 둘레가 280유닛이 넘어 1.88 마다 조각을 놓으면
// 150개, 한 개 8천 삼각형이면 예산이 그 자리에서 터진다. 옆면은 어차피 평평한
// 띠라 텍스처 한 장이면 충분하고, 이러면 삼각형이 0 이다.
// (skyClouds.ts 와 같은 방식 — 텍스처 예산 330/340MB 라 새 PNG 를 못 넣는다.)
//
// ── 첫판을 다시 구운 이유 ───────────────────────────────────────────────────
// 받은 GLB 축대(문기둥)와 이 띠가 한 화면에 같이 찍혔는데, 나란히 놓으니 셋이
// 티가 났다: ① 줄눈이 자·컴퍼스로 그린 격자다 ② 담쟁이가 없다 ③ 아래를 너무
// 어둡게 깎아 회청색으로 식었다. 그래서 켜 높이와 돌 폭을 흔들고, 발치에서
// 기어오르는 담쟁이 줄기를 넣고, 전체를 판석 색(182,164,131) 쪽으로 당겼다.
//
// 가로(u)로만 되풀이된다 — 씬에서 u = 둘레거리 / PITCH 로 감으므로 어느 벽에서나
// 돌 한 장 크기가 같다. 세로는 v 1.28 까지 쓰는데(단면 마디를 따라간 호 길이),
// 되풀이 이음매가 갓돌 밑면 안으로 숨는다.

const W = 256;
const H = 256;

/** 가로 한 칸(=마을 격자 1.88유닛)에 들어가는 돌 개수 */
const PER_TILE = 4;
/** 축대 높이(TERRACE_STEP)를 몇 켜로 쌓나 */
const COURSES = 5;
/** 가로 한 칸에 기어오르는 담쟁이 줄기 수 */
const IVY = 6;

function hash(x: number, y: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * 0..total 을 n 칸으로 나누되 칸마다 폭을 흔든다. **마지막이 정확히 total 이라야**
 * 텍스처가 이어 붙는다 — 그냥 랜덤 폭을 더해 나가면 오른쪽 끝에서 줄눈이 어긋난다.
 */
function jitteredEdges(n: number, total: number, seed: number) {
  const w: number[] = [];
  let sum = 0;
  for (let k = 0; k < n; k++) {
    const v = 0.74 + 0.52 * hash(k, seed);
    w.push(v);
    sum += v;
  }
  const edges = [0];
  let acc = 0;
  for (let k = 0; k < n; k++) {
    acc += (w[k] / sum) * total;
    edges.push(acc);
  }
  return edges;
}

export function makeBankTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(W, H);
  const data = image.data;

  // 켜 높이를 흔든다. 아래쪽 켜를 두껍게 두면 밑을 크게 쌓아 올린 축대로 읽힌다.
  const rows = jitteredEdges(COURSES, H, 17);
  // 켜마다 돌 나누기 + 어긋냄. 켜에만 달린 값이라 미리 구해 둔다.
  const colsOf = Array.from({length: COURSES}, (_, c) =>
    jitteredEdges(PER_TILE, W, 40 + c)
  );
  const shiftOf = Array.from(
    {length: COURSES},
    (_, c) => (c % 2 === 0 ? 0 : W / (PER_TILE * 2)) + hash(c, 29) * W * 0.04
  );

  // 담쟁이 줄기 — 발치에서 시작해 위로 기어오른다. 줄기마다 뻗는 높이가 다르다.
  const vines = Array.from({length: IVY}, (_, k) => ({
    x: ((k + 0.5) / IVY + 0.14 * (hash(k, 3) - 0.5)) * W,
    half: W * (0.016 + 0.026 * hash(k, 5)),
    reach: 0.34 + 0.46 * hash(k, 9),
    phase: hash(k, 11) * Math.PI * 2,
    wob: W * (0.012 + 0.026 * hash(k, 13))
  }));

  for (let j = 0; j < H; j++) {
    // v=0 이 축대 **아래**(골짜기 바닥), v=1 이 갓돌 쪽이다. 씬에서 그렇게 감는다.
    const v = j / H;

    // 이 픽셀이 몇 번째 켜인가
    let course = 0;
    while (course < COURSES - 1 && j >= rows[course + 1]) course += 1;
    const rowTop = rows[course];
    const rowH = rows[course + 1] - rowTop;
    const fy = j - rowTop;

    // 켜마다 반 장씩 어긋나게 = 막힌줄눈. 안 어긋내면 격자무늬 타일로 보인다.
    const cols = colsOf[course];
    const shift = shiftOf[course];

    for (let i = 0; i < W; i++) {
      const at = (j * W + i) * 4;
      const u = (((i + shift) % W) + W) % W;

      let col = 0;
      while (col < PER_TILE - 1 && u >= cols[col + 1]) col += 1;
      const colLeft = cols[col];
      const colW = cols[col + 1] - colLeft;
      const fx = u - colLeft;

      // 돌 한 장마다 색을 흔든다 — 없으면 벽 전체가 한 덩어리 회색이다
      let tone = lerp(0.84, 1.08, hash(col, course));
      // 아래일수록 그늘지지만 **너무 깎으면 회청색으로 식는다.** 0.62 로 뒀다가
      // 판석 옆에서 콘크리트로 보여 0.78 로 올렸다.
      tone *= lerp(0.78, 1.0, Math.min(1, v * 1.5));

      // 줄눈 폭도 켜마다 조금씩 다르게 — 일정하면 자로 그은 티가 난다
      const mortar = 1.8 + 1.1 * hash(col + 5, course + 5);
      const inMortar =
        fx < mortar || fx > colW - mortar || fy < mortar || fy > rowH - mortar;
      // 왼쪽 위를 밝게, 오른쪽 아래를 어둡게 — 노멀맵 없이 돌이 도드라진다
      const bevel =
        fx < colW * 0.16 || fy < rowH * 0.2
          ? 1.09
          : fx > colW * 0.86 || fy > rowH * 0.82
          ? 0.88
          : 1;

      let r: number, g: number, b: number;
      if (inMortar) {
        // 줄눈은 어둡게, 그러나 **따뜻하게.** 차갑게 두면 벽 전체가 시멘트로 보인다.
        r = 112;
        g = 99;
        b = 78;
      } else {
        // 판석(182,164,131)과 같은 계열 — 축대에서 포장으로 재료가 이어져 보인다
        r = 186 * tone * bevel;
        g = 170 * tone * bevel;
        b = 142 * tone * bevel;
      }

      // 발치의 이끼 — 축대가 땅에서 자라난 것처럼 보이게 한다
      const moss =
        Math.max(0, 1 - v * 4.2) * lerp(0.4, 1, hash(col + 71, course + 31));
      if (moss > 0) {
        const m = Math.min(0.66, moss * (0.4 + 0.6 * hash(i, j)));
        r = lerp(r, 104, m);
        g = lerp(g, 124, m);
        b = lerp(b, 66, m);
      }

      // 담쟁이 — 격자를 깨뜨리는 게 절반, 손그림처럼 보이게 하는 게 절반이다.
      // 받은 GLB 축대에서 제일 눈에 띄는 게 이거였다.
      let ivy = 0;
      for (const vine of vines) {
        if (v > vine.reach) continue;
        const cx = vine.x + Math.sin(v * 7.5 + vine.phase) * vine.wob;
        // 가로가 되풀이되므로 거리도 원형으로 재야 이음매에서 줄기가 잘리지 않는다
        const d = Math.min(Math.abs(i - cx), W - Math.abs(i - cx));
        // 잎이 뭉치고 흩어지게 — 폭을 세로로 흔든다
        const half =
          vine.half *
          (0.55 + 0.9 * hash(Math.floor(j / 7), Math.floor(vine.x)));
        if (d > half) continue;
        ivy = Math.max(ivy, (1 - v / vine.reach) * (1 - d / half) * 1.5);
      }
      if (ivy > 0.08) {
        const a = Math.min(0.92, ivy) * (0.55 + 0.45 * hash(i * 5, j * 5));
        const leaf = hash(i * 3 + 1, j * 3 + 1);
        r = lerp(r, lerp(52, 108, leaf), a);
        g = lerp(g, lerp(84, 142, leaf), a);
        b = lerp(b, lerp(40, 62, leaf), a);
      }

      // 자잘한 얼룩 — 완전히 매끈하면 CG 티가 난다
      const grain = (hash(i * 3, j * 3) - 0.5) * 15;
      data[at] = clamp01((r + grain) / 255) * 255;
      data[at + 1] = clamp01((g + grain) / 255) * 255;
      data[at + 2] = clamp01((b + grain) / 255) * 255;
      data[at + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
