// 컨셉 아트에서 마을 팔레트를 뽑는다.
//
// ── 왜 이게 필요한가 ────────────────────────────────────────────────────────
// 에셋 237개는 Meshy 가 하나씩 따로 만든 것이라 "같은 나무"가 에셋마다 다른
// 갈색이다. LUT 는 화면 전체에 같은 필터를 씌워 분위기를 묶었지만, **색과 색
// 사이의 차이는 그대로 남는다.** 그 차이를 없애려면 기준 색 목록이 있어야 한다.
//
// 그 목록을 감으로 정하면 결국 취향 싸움이 되므로, **컨셉 아트에서 실측**한다.
// 컨셉 아트가 이 프로젝트의 유일한 "정답지"다.
//
// ── 왜 Oklab 인가 ──────────────────────────────────────────────────────────
// RGB 거리로 군집을 내면 사람 눈에 전혀 다른 색이 한 덩어리로 묶인다(특히
// 어두운 쪽). Oklab 은 거리 1 이 어디서나 비슷한 정도로 달라 보이게 만든 공간이라
// 군집 결과가 눈이 보는 것과 맞는다. 변환식은 20줄이라 의존성이 필요 없다.
//
// 사용법: node scripts/extract-palette.mjs [클러스터수]
// 결과는 src/data/villageColors.json 에 쓴다.

import {readFileSync, writeFileSync} from "node:fs";
import {inflateSync} from "node:zlib";

const CONCEPT =
  "C:/Users/jk636/OneDrive/바탕 화면/정재훈의 포트폴리오 모음집/3d 포트폴리오 마을에 대한 정보/전체적인배경사진.png";
const OUT = "src/data/villageColors.json";
const K = Number(process.argv[2]) || 16;

// ─── PNG 디코더 (bake-impostors.mjs 와 같은 것) ──────────────────────────────
function decodePng(buf) {
  let off = 8, w = 0, h = 0, colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const tag = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (tag === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      colorType = data[9];
      if (data[8] !== 8 || data[12] !== 0) throw new Error("8bit 비인터레이스 PNG만 지원");
    } else if (tag === "IDAT") idat.push(data);
    else if (tag === "IEND") break;
    off += 12 + len;
  }
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
  if (!ch) throw new Error(`colorType ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(w * h * ch);
  const stride = w * ch;
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const row = raw.subarray(p, p + stride);
    p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= ch ? prev[x - ch] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return {w, h, ch, data: out};
}

// ─── Oklab ────────────────────────────────────────────────────────────────────
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function rgbToOklab(r, g, b) {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}

function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [R, G, B].map((v) => Math.max(0, Math.min(255, Math.round(toSrgb(Math.max(0, Math.min(1, v))) * 255))));
}

const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

// ─── 표본 뽑기 ────────────────────────────────────────────────────────────────
const img = decodePng(readFileSync(CONCEPT));
console.log(`컨셉 아트 ${img.w}×${img.h} (채널 ${img.ch})`);

// ─── 어디를 표본으로 삼는가 ─────────────────────────────────────────────────
// **하늘을 빼야 한다.** 처음엔 위쪽 8% 부터 훑었더니 하늘의 보라·분홍이 표본을
// 지배해서, 정작 재질 색조는 4개(그중 초록 없음)로 뭉개졌다. 하늘은 우리 씬에서
// SkyDome 이 따로 그리므로 재질 팔레트에 들어가면 안 된다.
// UI 패널도 화면 가장자리에 몰려 있으니 같이 잘라 낸다.
const X0 = Math.round(img.w * 0.12), X1 = Math.round(img.w * 0.88);
const Y0 = Math.round(img.h * 0.26), Y1 = Math.round(img.h * 0.9);

const samples = [];
for (let y = Y0; y < Y1; y += 3) {
  for (let x = X0; x < X1; x += 3) {
    const i = (y * img.w + x) * img.ch;
    const r = img.data[i] / 255, g = img.data[i + 1] / 255, b = img.data[i + 2] / 255;
    if (img.ch === 4 && img.data[i + 3] < 200) continue;
    samples.push(rgbToOklab(r, g, b));
  }
}
console.log(`표본 ${samples.length.toLocaleString()}개`);

// ─── k-means (k-means++ 로 초기화) ────────────────────────────────────────────
// 무작위 초기화는 돌릴 때마다 팔레트가 바뀌어서, 값을 고정하려면 씨앗을 박아야 한다.
let seed = 20260813;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const dist2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;

const centers = [samples[Math.floor(rand() * samples.length)]];
while (centers.length < K) {
  // 기존 중심에서 먼 표본일수록 뽑힐 확률이 높다 — 팔레트가 한쪽에 몰리지 않는다
  const d = samples.map((s) => Math.min(...centers.map((c) => dist2(s, c))));
  const total = d.reduce((a, b) => a + b, 0);
  let t = rand() * total;
  let idx = 0;
  while (idx < d.length - 1 && (t -= d[idx]) > 0) idx++;
  centers.push(samples[idx]);
}

const assign = new Int32Array(samples.length);
for (let iter = 0; iter < 40; iter++) {
  let moved = 0;
  for (let i = 0; i < samples.length; i++) {
    let best = 0, bd = Infinity;
    for (let c = 0; c < centers.length; c++) {
      const d = dist2(samples[i], centers[c]);
      if (d < bd) { bd = d; best = c; }
    }
    if (assign[i] !== best) { assign[i] = best; moved++; }
  }
  const sum = centers.map(() => [0, 0, 0, 0]);
  for (let i = 0; i < samples.length; i++) {
    const a = sum[assign[i]];
    a[0] += samples[i][0]; a[1] += samples[i][1]; a[2] += samples[i][2]; a[3]++;
  }
  for (let c = 0; c < centers.length; c++)
    if (sum[c][3]) centers[c] = [sum[c][0] / sum[c][3], sum[c][1] / sum[c][3], sum[c][2] / sum[c][3]];
  if (!moved) break;
}

// 쓰인 빈도순 — 마을을 지배하는 색이 위로 온다
const counts = centers.map(() => 0);
for (const a of assign) counts[a]++;
const order = centers.map((c, i) => ({c, n: counts[i]})).sort((p, q) => q.n - p.n);

console.log("\n마을 팔레트 (빈도순)");
const palette = [];
for (const {c, n} of order) {
  const rgb = oklabToRgb(c[0], c[1], c[2]);
  const share = ((n / samples.length) * 100).toFixed(1);
  const chroma = Math.hypot(c[1], c[2]);
  palette.push({hex: hex(rgb), L: +c[0].toFixed(4), a: +c[1].toFixed(4), b: +c[2].toFixed(4), share: +share});
  console.log(`  ${hex(rgb)}  ${String(share).padStart(5)}%  L=${c[0].toFixed(2)}  채도=${chroma.toFixed(3)}`);
}

// ─── 셰이더가 실제로 쓸 것: **색조(hue) 방향**만 ─────────────────────────────
// 위 팔레트를 알베도에 그대로 강제하면 안 된다. 컨셉 아트는 이미 노을빛과 보라
// 그림자가 **칠해진 결과물**이라, 그 색을 재질 고유색으로 박으면 우리 조명과
// LUT 가 그 위에 또 얹혀 두 번 물든다(마을이 진흙색이 된다).
//
// 물체의 정체성은 밝기나 채도가 아니라 **어느 쪽으로 치우친 색인가**에 있다.
// 그래서 (a,b) 평면에서의 **방향**만 뽑아 쓴다. 밝기와 채도의 세기는 에셋이
// 원래 갖고 있던 것을 그대로 둔다 — 그러면 두 번 물들 일이 없고, "같은 나무는
// 같은 갈색" 이라는 목표만 달성된다.
//
// 비슷한 색조는 합친다. 갈색 계열이 16개 중 9개라 그대로 두면 갈색에만 표가
// 몰려서, 파랑 지붕이 갈색으로 끌려갈 자리가 없어진다.
// 18° — 22° 로 뒀더니 초록이 노랑에 흡수돼 사라졌다. 색조 가족이 뭉개지면
// 지붕·잎·돌이 전부 한 색으로 끌려가 마을이 단색이 된다.
const MERGE_DEG = 18;
const hues = [];
for (const {c, n} of order) {
  const chroma = Math.hypot(c[1], c[2]);
  if (chroma < 0.02) continue; // 무채색은 색조가 없다 — 방향을 정할 수 없다
  const deg = (Math.atan2(c[2], c[1]) * 180) / Math.PI;
  const near = hues.find((h) => {
    const d = Math.abs(((h.deg - deg + 540) % 360) - 180);
    return d < MERGE_DEG;
  });
  if (near) {
    // 빈도로 가중 평균 — 흔한 쪽으로 대표 색조가 기운다
    const w = near.weight + n;
    const ax = Math.cos((near.deg * Math.PI) / 180) * near.weight + Math.cos((deg * Math.PI) / 180) * n;
    const ay = Math.sin((near.deg * Math.PI) / 180) * near.weight + Math.sin((deg * Math.PI) / 180) * n;
    near.deg = (Math.atan2(ay, ax) * 180) / Math.PI;
    near.weight = w;
  } else {
    hues.push({deg, weight: n});
  }
}
hues.sort((p, q) => q.weight - p.weight);
const totalW = hues.reduce((s, h) => s + h.weight, 0);

console.log(`\n셰이더가 쓸 색조 ${hues.length}개 (${MERGE_DEG}° 안쪽은 병합)`);
const hueOut = hues.map((h) => {
  const rad = (h.deg * Math.PI) / 180;
  const dir = [+Math.cos(rad).toFixed(5), +Math.sin(rad).toFixed(5)];
  // 눈으로 확인하라고 대표색을 하나 찍어 준다 (L=0.6, 채도 0.09 로 고정)
  const swatch = hex(oklabToRgb(0.6, dir[0] * 0.09, dir[1] * 0.09));
  console.log(
    `  ${swatch}  ${h.deg.toFixed(0).padStart(4)}°  비중 ${((h.weight / totalW) * 100).toFixed(1)}%`
  );
  return {deg: +h.deg.toFixed(2), dir, share: +((h.weight / totalW) * 100).toFixed(1), swatch};
});

writeFileSync(
  OUT,
  JSON.stringify({source: "전체적인배경사진.png", k: K, colors: palette, hues: hueOut}, null, 2)
);
console.log(`\n→ ${OUT}`);
