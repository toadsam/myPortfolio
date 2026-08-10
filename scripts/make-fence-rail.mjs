// 길가를 따라 세우는 **나무 울타리 한 토막**을 만든다.
//   → public/models/props/decor/fence-rail.glb  (30 삼각형)
//
// ─── 왜 또 코드로 만드나 ─────────────────────────────────────────────────────
// 컨셉 아트를 보면 길이라는 길에는 전부 나무 울타리가 따라간다. 그 선들이
// "길"과 "마당"을 갈라서, 포장 위에 건물만 서 있는 우리 마을과 결정적으로 다르다.
//
// 이미 있는 `decor/fence.glb`(Meshy)로는 못 두른다 — 한 토막이 1,473 삼각형이라
// 300토막이면 44만이다. 삼각형 예산이 1,305k/1,800k 라 그것만으로 다 먹는다.
// 담장(make-low-wall.mjs)에서 이미 통한 방법을 그대로 쓴다: 상자 다섯 개,
// 30 삼각형. 300토막을 깔아도 9,000 이라 사실상 공짜다.
//
// `fence.glb` 는 그대로 둔다 — 건물 앞 짧은 구간처럼 가까이서 보이는 데는
// 진짜 모델이 낫다. 이건 **길게 이어 까는 용도**다.
//
// 사용법: node scripts/make-fence-rail.mjs [--px 256]

import {writeFileSync, mkdirSync} from "node:fs";
import {deflateSync} from "node:zlib";

const OUT_GLB = "public/models/props/decor/fence-rail.glb";
const pxArg = process.argv.indexOf("--px");
const SIZE = pxArg >= 0 ? Number(process.argv[pxArg + 1]) : 256;

// ─── 치수 ─────────────────────────────────────────────────────────────────────
// 담장(wall-low)과 같은 1.94. 두 가지를 섞어 깔 수 있어야 하고, 길 타일 한 칸이
// 1.88 이라 조금 넉넉해야 이어 붙일 때 실 같은 틈이 안 생긴다.
const LENGTH = 1.94;
/** 기둥 — 양 끝에 하나씩. 살짝 안쪽에 둬야 이웃 토막의 기둥과 안 겹친다 */
const POST_W = 0.13;
const POST_H = 0.72;
const POST_INSET = 0.06;
/** 가로대 두 줄 */
const RAIL_H = 0.09;
const RAIL_D = 0.06;
const RAIL_Y = [0.20, 0.47]; // 밑에서부터
const TOTAL_H = POST_H;

// ─── 색 ───────────────────────────────────────────────────────────────────────
// 마을 목재(아치·민가 처마)에서 눈으로 맞춘 갈색. 판석(182,164,131)보다 확실히
// 어두워야 부감에서 선으로 읽힌다 — 담장 갓돌에서 배운 것과 같다.
const WOOD_DARK = [86, 60, 38];
const WOOD_MID = [124, 88, 55];
const WOOD_LIGHT = [156, 116, 74];
const MOSS = [96, 118, 62];

const smooth = (t) => t * t * (3 - 2 * t);
function hash2(i, j) {
  let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260811);

// ─── 텍스처: 세로 나뭇결 한 장 ────────────────────────────────────────────────
// 기둥도 가로대도 같은 나무다. 재질을 나누면 인스턴스마다 draw call 이 두 번
// 나가므로 한 장으로 끝낸다. 결은 U 방향(나무가 길게 뻗는 방향)으로 흐른다.
const rgb = Buffer.alloc(SIZE * SIZE * 3);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    // 결 — 가로로 길게 늘인 잡음. 나이테처럼 몇 줄이 진하게 지나간다
    const band = Math.sin((y / SIZE) * Math.PI * 9 + hash2(0, y >> 2) * 3) * 0.5 + 0.5;
    const fine = hash2(x >> 1, y);
    const t = Math.min(1, Math.max(0, band * 0.7 + fine * 0.3));
    // 아래쪽은 흙·이끼로 어둡게
    const foot = Math.max(0, (y / SIZE - 0.72) / 0.28);
    const mossAmt = smooth(Math.min(1, foot * (0.3 + hash2(x >> 3, y >> 3) * 1.5))) * 0.55;
    const at = (y * SIZE + x) * 3;
    for (let c = 0; c < 3; c++) {
      const wood = t < 0.5
        ? WOOD_DARK[c] + (WOOD_MID[c] - WOOD_DARK[c]) * (t / 0.5)
        : WOOD_MID[c] + (WOOD_LIGHT[c] - WOOD_MID[c]) * ((t - 0.5) / 0.5);
      rgb[at + c] = Math.max(0, Math.min(255, wood + (MOSS[c] - wood) * mossAmt));
    }
  }
}
// 나뭇결을 따라 긁힌 자국
for (let n = 0; n < 1800; n++) {
  const y = Math.floor(rand() * SIZE);
  const x0 = rand() * SIZE;
  const len = 4 + rand() * 22;
  const shift = (rand() < 0.5 ? -1 : 1) * (6 + rand() * 12);
  for (let s = 0; s < len; s++) {
    const x = (Math.round(x0 + s) % SIZE + SIZE) % SIZE;
    const at = (y * SIZE + x) * 3;
    for (let c = 0; c < 3; c++) rgb[at + c] = Math.max(0, Math.min(255, rgb[at + c] + shift));
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

// ─── 지오메트리 ───────────────────────────────────────────────────────────────
// 원점은 bbox 한가운데 (Meshy 규격 · generate-decor-layout 의 liftOf 가 그걸 가정한다).
const positions = [];
const normals = [];
const uvs = [];
const indices = [];

/** 상자 하나. 옆·앞뒤 네 면만 만든다 — 밑면은 땅에 묻히고 윗면은 아주 작다. */
function box(cx, cy, cz, hw, hh, hd, withTop) {
  const faces = [
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]]
  ];
  // (1,0,0)×(0,0,1) 은 −Y 다 — 윗면은 세로축을 뒤집어야 바깥을 본다 (wall-low 에서 겪었다)
  if (withTop) faces.push([[0, 1, 0], [1, 0, 0], [0, 0, -1]]);
  const center = [cx, cy, cz];
  const half = [hw, hh, hd];
  const reach = (a) => Math.abs(a[0]) * hw + Math.abs(a[1]) * hh + Math.abs(a[2]) * hd;

  for (const [n, ax, ay] of faces) {
    const base = positions.length / 3;
    const eu = reach(ax);
    const ev = reach(ay);
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      for (let c = 0; c < 3; c++)
        positions.push(center[c] + n[c] * half[c] + ax[c] * eu * su + ay[c] * ev * sv);
      normals.push(n[0], n[1], n[2]);
      // 결은 물체의 긴 축을 따라 흐른다. 가로대는 길고 기둥은 세로로 길다 —
      // 기둥에서 U 를 세로에 물리면 결이 세로로 서서 나무처럼 보인다.
      uvs.push(0.5 + su * (eu / 0.5), 0.5 + sv * (ev / 0.5));
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

const midY = TOTAL_H / 2;
// 기둥 둘 (윗면 있음 — 위에서 내려다보면 기둥머리가 보인다)
for (const side of [-1, 1]) {
  box(side * (LENGTH / 2 - POST_INSET - POST_W / 2), 0, 0, POST_W / 2, POST_H / 2, POST_W / 2, true);
}
// 가로대 둘 (윗면 생략 — 얇아서 안 보이고, 60삼각형이 30으로 준다)
for (const y of RAIL_Y) {
  box(0, y - midY, 0, LENGTH / 2, RAIL_H / 2, RAIL_D / 2, false);
}

const posArr = new Float32Array(positions);
const nrmArr = new Float32Array(normals);
const uvArr = new Float32Array(uvs);
const idxArr = new Uint16Array(indices);
const png = encodePng(SIZE, SIZE, rgb);

const pad4 = (n) => (n + 3) & ~3;
const parts = [];
let offset = 0;
const views = [];
for (const [data, target] of [
  [Buffer.from(idxArr.buffer), 34963],
  [Buffer.from(posArr.buffer), 34962],
  [Buffer.from(nrmArr.buffer), 34962],
  [Buffer.from(uvArr.buffer), 34962],
  [png, null]
]) {
  const padded = Buffer.alloc(pad4(data.length));
  data.copy(padded);
  views.push({buffer: 0, byteOffset: offset, byteLength: data.length, ...(target ? {target} : {})});
  parts.push(padded);
  offset += padded.length;
}
const bin = Buffer.concat(parts);

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < posArr.length; i += 3)
  for (let c = 0; c < 3; c++) {
    min[c] = Math.min(min[c], posArr[i + c]);
    max[c] = Math.max(max[c], posArr[i + c]);
  }

const gltf = {
  asset: {version: "2.0", generator: "make-fence-rail.mjs"},
  scene: 0,
  scenes: [{nodes: [0]}],
  nodes: [{mesh: 0, name: "fence-rail"}],
  meshes: [{primitives: [{attributes: {POSITION: 1, NORMAL: 2, TEXCOORD_0: 3}, indices: 0, material: 0}]}],
  materials: [{
    name: "fence-rail",
    // 얇은 판이라 뒷면도 보인다 — 컬링을 끄지 않으면 가로대 안쪽이 뚫려 보인다
    doubleSided: true,
    pbrMetallicRoughness: {baseColorTexture: {index: 0}, metallicFactor: 0, roughnessFactor: 0.9}
  }],
  textures: [{source: 0, sampler: 0}],
  samplers: [{wrapS: 10497, wrapT: 10497}],
  images: [{bufferView: 4, mimeType: "image/png"}],
  accessors: [
    {bufferView: 0, componentType: 5123, count: idxArr.length, type: "SCALAR"},
    {bufferView: 1, componentType: 5126, count: posArr.length / 3, type: "VEC3", min, max},
    {bufferView: 2, componentType: 5126, count: nrmArr.length / 3, type: "VEC3"},
    {bufferView: 3, componentType: 5126, count: uvArr.length / 2, type: "VEC2"}
  ],
  bufferViews: views,
  buffers: [{byteLength: bin.length}]
};

const jsonBuf = Buffer.from(JSON.stringify(gltf), "utf8");
const jsonPad = Buffer.alloc(pad4(jsonBuf.length), 0x20);
jsonBuf.copy(jsonPad);

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonPad.length + 8 + bin.length, 8);
const chunkHeader = (len, type) => {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(len, 0);
  b.writeUInt32LE(type, 4);
  return b;
};

mkdirSync("public/models/props/decor", {recursive: true});
writeFileSync(OUT_GLB, Buffer.concat([
  header,
  chunkHeader(jsonPad.length, 0x4e4f534a), jsonPad,
  chunkHeader(bin.length, 0x004e4942), bin
]));

console.log(`${OUT_GLB}  ${(png.length / 1024).toFixed(0)}KB 텍스처 · 삼각형 ${idxArr.length / 3}개`);
console.log(`  길이 ${LENGTH} × 높이 ${TOTAL_H}`);
console.log(`  generate-decor-layout.mjs 의 KIT 에  "fence-rail": {h: ${TOTAL_H.toFixed(3)}, m: ${(TOTAL_H * 2.5).toFixed(3)}}  (배율 1)`);
