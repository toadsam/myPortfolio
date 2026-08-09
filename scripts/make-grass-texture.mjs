// 마을 바닥 잔디 평면에 깔 텍스처를 만든다. → public/textures/grass-village.png
//
// ─── 왜 사진(구운 그림)을 안 쓰나 ────────────────────────────────────────────
// 처음엔 grass-patch GLB를 위에서 구워 썼는데, 그 그림에는 둔덕 같은 **큰 덩어리**
// 구조가 들어 있다. 90유닛 평면에 2.6유닛 간격으로 깔면 그 덩어리가 격자로
// 규칙적으로 되풀이돼 이불 누빔처럼 보인다. 이음매를 거울로 지운 것도 겹쳐서
// 만화경 같은 무늬가 됐다. 큰 구조가 하나라도 있으면 반복은 반드시 들킨다.
//
// 그래서 여기서는 **큰 구조를 아예 안 만든다.** 가장 긴 파장이 타일의 1/8이라
// 눈이 "무늬"로 묶어 볼 덩어리가 없고, 반복 주기도 알아챌 수 없다. 꽃도 안 넣는다 —
// 같은 자리에 같은 꽃이 2.6유닛마다 피면 그것만으로 격자가 드러난다.
// 꽃과 덤불은 3D 풀숲 프롭(grass-patch)이 맡는다.
//
// 색은 길 타일의 잔디 갓길에서 실측했다(중앙값 rgb 109,166,29). 텍스처에 최종
// 색을 그대로 굽고 머티리얼 tint 는 흰색으로 둔다 — 예전처럼 선형 공간에서
// 역산한 tint 를 곱하면, 텍스처를 손볼 때마다 그 값을 다시 풀어야 한다.
//
// 사용법: node scripts/make-grass-texture.mjs

import {writeFileSync} from "node:fs";
import {deflateSync} from "node:zlib";

const SIZE = 512;
const OUT = "public/textures/grass-village.png";

/**
 * 실측한 잔디 색 — 평평해진 길 타일 세 종(직선·교차·풀숲)의 잔디 부분 평균이
 * rgb(118,169,42) 이다. 이걸 중앙값으로 놓고 위아래로 편차를 준다.
 * 어긋나면 길 타일의 잔디 갓길이 밝은 사각형으로 도드라진다.
 */
// 2차 — 채도를 55%로 내렸다.
//
// flatten-ground-tiles.mjs 가 길 타일 그림을 구울 때 같은 계수로 회색 쪽으로
// 당긴다(SATURATION 0.55). 여기 값은 그걸 손으로 적용한 결과다. 한쪽만 바꾸면
// 길 타일의 잔디 갓길이 평면과 색이 달라 **길가에 밝은 사각형이 줄지어** 보인다
// (예전에 실제로 그랬다). 둘 중 하나를 고치면 반드시 다른 하나도 고칠 것.
const DARK = [104, 127, 70];
const MID = [127, 156, 86];
const LIGHT = [150, 180, 102];

// ─── 시드 난수 ────────────────────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── 이어붙는 값 노이즈 ───────────────────────────────────────────────────────
// 격자 크기가 SIZE를 나누어떨어지게 잡고 좌표를 격자 수로 나머지 연산하면
// 상하좌우가 저절로 맞물린다 — 이음매를 나중에 지울 필요가 없다.
function tileableNoise(period, rand) {
  const cells = SIZE / period;
  const lattice = new Float64Array(cells * cells);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const smooth = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = (x / period) % cells;
    const fy = (y / period) % cells;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
    const tx = smooth(fx - x0), ty = smooth(fy - y0);
    const a = lattice[y0 * cells + x0], b = lattice[y0 * cells + x1];
    const c = lattice[y1 * cells + x0], d = lattice[y1 * cells + x1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
}

const rand = mulberry32(20260809);

// 가장 긴 파장이 64px = 타일의 1/8. 이보다 크게 가면 덩어리가 보이기 시작한다.
const octaves = [
  {noise: tileableNoise(64, rand), weight: 0.42},
  {noise: tileableNoise(32, rand), weight: 0.28},
  {noise: tileableNoise(16, rand), weight: 0.18},
  {noise: tileableNoise(8, rand), weight: 0.12}
];

const field = new Float64Array(SIZE * SIZE);
for (let y = 0; y < SIZE; y++)
  for (let x = 0; x < SIZE; x++) {
    let v = 0;
    for (const o of octaves) v += o.noise(x, y) * o.weight;
    field[y * SIZE + x] = v;
  }

// 실제로 쓰인 범위로 늘려 대비를 일정하게 맞춘다 (옥타브를 바꿔도 결과가 안 흔들린다)
let lo = Infinity, hi = -Infinity;
for (const v of field) {
  if (v < lo) lo = v;
  if (v > hi) hi = v;
}
for (let i = 0; i < field.length; i++) field[i] = (field[i] - lo) / (hi - lo);

// ─── 색 입히기 ────────────────────────────────────────────────────────────────
// 0 → DARK, 0.5 → MID, 1 → LIGHT 로 두 구간 보간.
const rgb = Buffer.alloc(SIZE * SIZE * 3);
for (let i = 0; i < field.length; i++) {
  const t = field[i];
  for (let c = 0; c < 3; c++) {
    const v = t < 0.5
      ? DARK[c] + (MID[c] - DARK[c]) * (t / 0.5)
      : MID[c] + (LIGHT[c] - MID[c]) * ((t - 0.5) / 0.5);
    rgb[i * 3 + c] = v;
  }
}

// ─── 풀잎 결 ──────────────────────────────────────────────────────────────────
// 노이즈만 있으면 물감을 풀어놓은 것처럼 뭉근하다. 짧은 획을 잔뜩 그어 잔디처럼
// 보이게 한다. 획은 4px 안팎이라 반복 주기에 기여하지 않는다.
const BLADES = 26000;
for (let n = 0; n < BLADES; n++) {
  const x0 = rand() * SIZE;
  const y0 = rand() * SIZE;
  const angle = rand() * Math.PI * 2;
  const len = 2 + rand() * 3;
  // 주변보다 살짝 밝거나 어둡게 — 절반씩
  const shift = (rand() < 0.5 ? -1 : 1) * (6 + rand() * 12);
  const steps = Math.ceil(len);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + Math.cos(angle) * (s / steps) * len) % SIZE;
    const y = Math.round(y0 + Math.sin(angle) * (s / steps) * len) % SIZE;
    const at = ((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE);
    for (let c = 0; c < 3; c++) {
      // 초록만 살짝 더 흔들어 노란기·푸른기가 섞이게
      const k = c === 1 ? 1.15 : 1;
      rgb[at * 3 + c] = Math.max(0, Math.min(255, rgb[at * 3 + c] + shift * k));
    }
  }
}

// ─── PNG ──────────────────────────────────────────────────────────────────────
let CRC_T = null;
function crc32(buf) {
  if (!CRC_T) {
    CRC_T = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_T[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}
function encodePng(w, h, data) {
  const stride = w * 3;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunk = (tag, body) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(body.length);
    const withTag = Buffer.concat([Buffer.from(tag, "ascii"), body]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(withTag) >>> 0);
    return Buffer.concat([len, withTag, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, {level: 9})),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

const png = encodePng(SIZE, SIZE, rgb);
writeFileSync(OUT, png);

let sum = [0, 0, 0];
for (let i = 0; i < SIZE * SIZE; i++) for (let c = 0; c < 3; c++) sum[c] += rgb[i * 3 + c];
console.log(`${OUT}  ${SIZE}×${SIZE}  ${(png.length / 1024).toFixed(0)}KB`);
console.log(`  평균 rgb(${sum.map((v) => Math.round(v / (SIZE * SIZE))).join(",")})  — 길 타일 갓길 중앙값 rgb(${MID.join(",")})`);
console.log(`  가장 긴 파장 ${64}px (타일의 1/8) — 반복 주기가 눈에 안 잡힌다`);
