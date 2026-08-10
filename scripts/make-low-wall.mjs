// 구역 블록을 두르는 **낮은 돌담 한 토막**을 만든다.
//   → public/models/props/decor/wall-low.glb  (24 삼각형)
//
// ─── 왜 코드로 만드나 ────────────────────────────────────────────────────────
// 컨셉 아트에서 구역이 "구역"으로 읽히는 가장 큰 이유는 건물도 간판도 아니라
// **블록마다 허리 높이 돌담이 둘러 있다는 것**이다. 담 안은 마당, 담 밖은 길 —
// 그 선 하나로 여섯 덩어리가 각각 하나의 동네가 된다. 우리 블록은 포장 위에
// 건물만 서 있어서 경계가 아예 없었다.
//
// 받은 축대벽(terrace-wall)으로는 못 두른다. 한 덩이가 10,612 삼각형이라
// 블록 하나에 18개면 그것만 19만이다. 담장은 마을 전체에 80개쯤 깔아야 하는
// 물건이라 **한 토막이 몇십 삼각형**이어야 한다 — Meshy 로는 그 값이 안 나온다
// (벽돌은 UV 섬이 많아 simplify 가 거의 안 먹는다: 10,612 → 8,191 에서 멈췄다).
//
// 그래서 여기서 상자 두 개로 만든다. 몸통 + 갓돌, 24 삼각형. 80개를 깔아도
// 1,920 이라 사실상 공짜다. 무늬는 텍스처가 다 한다.
//
// 손그림 담장 GLB 가 나중에 오면 props/raw/decor/wall-low.glb 로 넣고
// npm run optimize 만 돌리면 이 파일을 덮어쓴다 — 배치 코드는 안 고쳐도 된다.
// (프롬프트는 docs/VILLAGE_ASSET_WISHLIST.md 1순위 ①)
//
// 사용법: node scripts/make-low-wall.mjs [--px 256]

import {writeFileSync, mkdirSync} from "node:fs";
import {deflateSync} from "node:zlib";

const OUT_GLB = "public/models/props/decor/wall-low.glb";
const pxArg = process.argv.indexOf("--px");
const SIZE = pxArg >= 0 ? Number(process.argv[pxArg + 1]) : 256;

// ─── 치수 (월드 유닛) ─────────────────────────────────────────────────────────
// 길 타일 한 칸이 1.88 이다. 담장을 딱 1.88 로 만들면 이어 붙일 때 부동소수점
// 오차로 실 같은 틈이 비친다. 조금 넉넉하게 잡아 서로 겹치게 한다.
const LENGTH = 1.94;
// 0.42(≈1.05m)로 만들었더니 부감에서 벽이 아니라 바닥에 그은 선으로 보였다.
// 그림자가 져야 담장으로 읽히는데 그러기엔 너무 낮았다.
/** 몸통 높이. 캐릭터가 0.8유닛(1.7m)이니 0.50 은 가슴 아래다. */
const BODY_H = 0.5;
const BODY_D = 0.30;
/** 갓돌 — 몸통보다 살짝 넓고 납작해야 "쌓은 담"으로 보인다 */
const CAP_H = 0.10;
const CAP_D = 0.40;
const CAP_OVER = 0.03; // 좌우로 튀어나오는 길이

const TOTAL_H = BODY_H + CAP_H;

// ─── 색 ───────────────────────────────────────────────────────────────────────
// 판석 포장(make-paving-tile.mjs)에서 실측한 평균이 rgb(182,164,131)이다.
//
// 처음엔 갓돌을 196,188,168 로 잡았다 — "위에서 봤을 때 담장 윗면이 선으로
// 보이게" 하려고 바닥보다 **밝게** 만든 건데, 부감으로 찍어 보니 마을에 흰
// 분필선을 그어 놓은 꼴이었다. 돌담이 아니라 화단 경계석으로 보인다.
// 부감에서 보이는 건 거의 갓돌 윗면뿐이므로, 그 색이 곧 담장 색이다.
// 바닥보다 **어둡게** 잡아야 돌로 읽히고, 그림자까지 더해져 선이 더 선명해진다.
const STONES = [
  [138, 130, 114],
  [124, 117, 104],
  [149, 140, 122],
  [114, 108, 97],
  [131, 124, 109]
];
const MORTAR = [88, 85, 73];
/** 갓돌 — 몸통보다 조금만 밝다. 바닥(182,164,131)보다는 확실히 어둡게. */
const CAP_STONE = [152, 145, 128];
/** 밑동 이끼 */
const MOSS = [96, 118, 62];

function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260810);
const smooth = (t) => t * t * (3 - 2 * t);
function hash2(i, j) {
  let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ─── 텍스처 아틀라스 ──────────────────────────────────────────────────────────
// 한 장에 두 재질을 담는다 — 재질을 둘로 나누면 인스턴스마다 draw call 이
// 두 번 나간다(담장이 80개면 160회).
//   위 3/4 (v 0 ~ 0.75) : 몸통 — 가로 줄눈으로 쌓은 막돌
//   아래 1/4 (v 0.75~1) : 갓돌 — 매끈한 판석
const SPLIT = Math.floor(SIZE * 0.75);
const rgb = Buffer.alloc(SIZE * SIZE * 3);

// ─── 몸통: 가로 켜로 쌓은 막돌 ────────────────────────────────────────────────
// 켜마다 반 칸씩 어긋나게 쌓는다(막힌줄눈). 나란히 쌓으면 벽돌 장난감처럼 보인다.
// 가로로는 반드시 이어붙어야 한다 — 담장 토막이 옆으로 계속 이어지므로,
// 한 토막 끝에서 무늬가 끊기면 그 자리가 전부 세로 줄로 보인다.
const COURSES = 4;
const PER_COURSE = 5;
{
  const courseH = SPLIT / COURSES;
  for (let y = 0; y < SPLIT; y++) {
    const course = Math.floor(y / courseH);
    // 홀수 켜는 반 칸 어긋난다
    const shift = (course % 2) * 0.5;
    const inCourse = (y - course * courseH) / courseH; // 0(위) ~ 1(아래)
    for (let x = 0; x < SIZE; x++) {
      // 돌 한 장의 좌표. 나머지 연산이라 x=SIZE 에서 x=0 으로 자연스럽게 넘어간다.
      const u = x / SIZE * PER_COURSE + shift;
      const block = Math.floor(u);
      const inBlock = u - block;
      // 막돌이라 가장자리가 반듯하지 않다 — 줄눈 폭을 돌마다 흔든다
      const wobbleX = (hash2(block, course) - 0.5) * 0.06;
      const wobbleY = (hash2(course, block + 71) - 0.5) * 0.10;
      const edge = Math.min(
        inBlock + wobbleX, 1 - inBlock - wobbleX,
        (inCourse + wobbleY) * 1.6, (1 - inCourse - wobbleY) * 1.6
      );
      const t = Math.min(1, Math.max(0, edge / 0.09)); // 0=줄눈 한복판

      const stone = STONES[Math.floor(hash2(block + course * 13, course * 7) * STONES.length)];
      const shade = 0.88 + hash2(block * 31 + course, course * 17) * 0.24;
      // 돌 한 장 안에서도 미세하게 얼룩지게
      const grain = (hash2(x, y) - 0.5) * 10;

      // 밑동 이끼 — 아래로 갈수록 짙게, 잡음으로 들쭉날쭉하게
      const foot = Math.max(0, (y / SPLIT - 0.6) / 0.4);
      const mossAmt = smooth(Math.min(1, foot * (0.4 + hash2(x >> 3, y >> 3) * 1.6))) * 0.75;

      const at = (y * SIZE + x) * 3;
      for (let c = 0; c < 3; c++) {
        let v = MORTAR[c] + (Math.min(255, stone[c] * shade) + grain - MORTAR[c]) * smooth(t);
        v = v + (MOSS[c] - v) * mossAmt;
        rgb[at + c] = Math.max(0, Math.min(255, v));
      }
    }
  }
}

// ─── 갓돌: 길게 이어지는 판석 ─────────────────────────────────────────────────
{
  for (let y = SPLIT; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // 갓돌은 큼직해서 한 토막에 세 장쯤
      const u = (x / SIZE) * 3;
      const slab = Math.floor(u);
      const inSlab = u - slab;
      const edge = Math.min(inSlab, 1 - inSlab);
      const t = Math.min(1, edge / 0.05);
      const shade = 0.92 + hash2(slab * 53, 991) * 0.16;
      const grain = (hash2(x, y + 333) - 0.5) * 12;
      const at = (y * SIZE + x) * 3;
      for (let c = 0; c < 3; c++) {
        const v = MORTAR[c] + (Math.min(255, CAP_STONE[c] * shade) + grain - MORTAR[c]) * smooth(t);
        rgb[at + c] = Math.max(0, Math.min(255, v));
      }
    }
  }
}

// 마모 — 짧은 획으로 긁힘. 단색 면은 플라스틱처럼 보인다.
for (let n = 0; n < 2600; n++) {
  const x0 = rand() * SIZE, y0 = rand() * SIZE;
  const angle = rand() * Math.PI * 2;
  const len = 2 + rand() * 5;
  const shift = (rand() < 0.5 ? -1 : 1) * (4 + rand() * 8);
  const steps = Math.ceil(len);
  for (let s = 0; s <= steps; s++) {
    const x = ((Math.round(x0 + Math.cos(angle) * (s / steps) * len) % SIZE) + SIZE) % SIZE;
    const y = Math.max(0, Math.min(SIZE - 1, Math.round(y0 + Math.sin(angle) * (s / steps) * len)));
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
// 원점은 **bbox 한가운데**다. Meshy 모델이 전부 그렇게 나오고,
// generate-decor-layout 의 liftOf() 가 "원본 높이의 절반만큼 올린다"는 그 규칙에
// 기대고 있다. 밑면을 원점에 두면 담장이 반쯤 공중에 뜬다.
const positions = [];
const normals = [];
const uvs = [];
const indices = [];

/** 상자 하나를 붙인다. v0~v1 은 이 상자가 아틀라스에서 쓸 세로 구간. */
function box(cx, cy, cz, hw, hh, hd, v0, v1, uRepeat) {
  //            면 방향        가로축        세로축
  const faces = [
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],   // +Z (앞)
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]], // −Z (뒤)
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],  // +X (오른쪽 끝)
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],  // −X (왼쪽 끝)
    // 위·아래 면의 세로축은 다른 넷과 반대로 잡아야 감기가 바깥을 향한다.
    // (1,0,0)×(0,0,1) 은 −Y 라, 그대로 두면 갓돌 윗면이 뒷면이 돼 위에서 보면 사라진다.
    [[0, 1, 0], [1, 0, 0], [0, 0, -1]],  // +Y (윗면)
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]]   // −Y (밑면)
  ];
  const center = [cx, cy, cz];
  const half = [hw, hh, hd];
  /** 축 a 방향으로 이 상자가 원점에서 얼마나 뻗어 있나 */
  const reach = (a) => Math.abs(a[0]) * hw + Math.abs(a[1]) * hh + Math.abs(a[2]) * hd;

  for (const [n, ax, ay] of faces) {
    const base = positions.length / 3;
    const eu = reach(ax);  // 이 면의 가로 반폭
    const ev = reach(ay);  // 이 면의 세로 반폭
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      for (let c = 0; c < 3; c++)
        positions.push(center[c] + n[c] * half[c] + ax[c] * eu * su + ay[c] * ev * sv);
      normals.push(n[0], n[1], n[2]);
      // 긴 면은 무늬를 uRepeat 번, 짧은 마구리는 폭에 비례해 조금만 — 그래야
      // 끝면에서 돌 한 장이 늘어져 보이지 않는다.
      const uSpan = ((eu * 2) / LENGTH) * uRepeat;
      uvs.push(0.5 + (su * uSpan) / 2, v0 + ((sv + 1) / 2) * (v1 - v0));
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

// 몸통 — 아틀라스 위 3/4. 갓돌에 가려질 만큼만 위로 올린다.
box(0, -TOTAL_H / 2 + BODY_H / 2, 0, LENGTH / 2, BODY_H / 2, BODY_D / 2, 0, 0.75, 1);
// 갓돌 — 아틀라스 아래 1/4
box(0, TOTAL_H / 2 - CAP_H / 2, 0, LENGTH / 2 + CAP_OVER, CAP_H / 2, CAP_D / 2, 0.75, 1, 1);

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

let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < posArr.length; i += 3)
  for (let c = 0; c < 3; c++) {
    min[c] = Math.min(min[c], posArr[i + c]);
    max[c] = Math.max(max[c], posArr[i + c]);
  }

const gltf = {
  asset: {version: "2.0", generator: "make-low-wall.mjs"},
  scene: 0,
  scenes: [{nodes: [0]}],
  nodes: [{mesh: 0, name: "wall-low"}],
  meshes: [{primitives: [{attributes: {POSITION: 1, NORMAL: 2, TEXCOORD_0: 3}, indices: 0, material: 0}]}],
  materials: [{
    name: "wall-low",
    pbrMetallicRoughness: {baseColorTexture: {index: 0}, metallicFactor: 0, roughnessFactor: 0.95}
  }],
  textures: [{source: 0, sampler: 0}],
  // 가로(U)만 반복이면 된다. 세로는 아틀라스라 반복하면 갓돌이 몸통에 나온다.
  samplers: [{wrapS: 10497, wrapT: 33071}],
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
header.writeUInt32LE(0x46546c67, 0); // "glTF"
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
console.log(`  길이 ${LENGTH} × 높이 ${TOTAL_H.toFixed(2)} (몸통 ${BODY_H} + 갓돌 ${CAP_H}) · 두께 ${CAP_D}`);
console.log(`  generate-decor-layout.mjs 의 KIT 에  "wall-low": {h: ${TOTAL_H.toFixed(3)}, m: ${(TOTAL_H * 2.5).toFixed(3)}}  로 적을 것 (배율 1)`);
