// 구역 단(1.1유닛) 을 오르는 **돌계단 한 벌**을 만든다.
//   → public/models/props/decor/terrace-steps.glb  (44 삼각형)
//
// ─── 왜 또 코드로 만드나 ─────────────────────────────────────────────────────
// 길이 구역으로 들어갈 때 1.1유닛(약 2.3m)짜리 턱을 그냥 뛰어오르고 있었다.
// 받은 `decor/terrace-stair.glb` 는 한 벌이 10,052 삼각형이라 마을에 20곳 넘게
// 놓으면 20만이 넘는다. 담장·울타리에서 통한 방법 그대로, 상자를 쌓아 굽는다.
//
// 계단 네 단 = 상자 넷. 각 상자는 윗면 + 앞면만 필요하다 —
// 옆면은 다음 단과 축대에 가려지고, 밑면·뒷면은 흙 속이다.
// 그래도 옆면을 넣는 이유는 계단이 길보다 좁아서 옆이 드러나기 때문이다.
//
// 사용법: node scripts/make-terrace-steps.mjs [--px 256] [--h 1.1]

import {writeFileSync, mkdirSync} from "node:fs";
import {deflateSync} from "node:zlib";

const OUT_GLB = "public/models/props/decor/terrace-steps.glb";
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? Number(process.argv[i + 1]) : fallback;
};
const SIZE = arg("px", 256);
/** 오를 높이 — src/lib/villageTerrain.ts 의 TERRACE_STEP 과 같아야 한다 */
const RISE = arg("h", 1.1);

/** 계단 폭 — 길 폭(포장 0.55~0.69 × 타일 1.88)보다 조금 넓게 */
const WIDTH = 2.2;
const STEPS = 4;
/** 한 단 깊이. 전체 안길이 = STEPS × TREAD */
const TREAD = 0.42;
const RISER = RISE / STEPS;
const DEPTH = STEPS * TREAD;

// 색 — 담장 갓돌·축대와 같은 계열이라야 "같은 돌로 쌓은 것"으로 보인다.
// (make-low-wall.mjs 의 CAP_STONE 152,145,128 · TerraceBanks 의 #6d6656~#a29a84)
const STONE = [148, 141, 124];
const STONE_DARK = [112, 106, 93];
const MORTAR = [86, 82, 71];
const MOSS = [96, 118, 62];

const smooth = t => t * t * (3 - 2 * t);
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

// ─── 텍스처: 판석 몇 장을 이어 붙인 한 장 ─────────────────────────────────────
const rgb = Buffer.alloc(SIZE * SIZE * 3);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    // 가로로 판석 세 장, 세로로 두 켜
    const u = (x / SIZE) * 3;
    const v = (y / SIZE) * 2;
    const sx = Math.floor(u);
    const sy = Math.floor(v);
    const inX = u - sx;
    const inY = v - sy;
    const wob = (hash2(sx, sy) - 0.5) * 0.05;
    const edge = Math.min(inX + wob, 1 - inX - wob, inY, 1 - inY);
    const t = Math.min(1, Math.max(0, edge / 0.06));
    const shade = 0.9 + hash2(sx * 31 + sy, sy * 17) * 0.2;
    const grain = (hash2(x, y) - 0.5) * 9;
    // 아래쪽 켜는 어둡게 — 계단 밑동에 그늘이 앉은 것처럼
    const low = y / SIZE;
    const at = (y * SIZE + x) * 3;
    for (let c = 0; c < 3; c++) {
      const base = STONE[c] + (STONE_DARK[c] - STONE[c]) * low;
      let val =
        MORTAR[c] +
        (Math.min(255, base * shade) + grain - MORTAR[c]) * smooth(t);
      // 모서리 이끼
      const mossAmt =
        smooth(
          Math.min(
            1,
            Math.max(0, (low - 0.78) / 0.22) *
              (0.3 + hash2(x >> 3, y >> 3) * 1.4)
          )
        ) * 0.5;
      val = val + (MOSS[c] - val) * mossAmt;
      rgb[at + c] = Math.max(0, Math.min(255, val));
    }
  }
}
// 마모
for (let n = 0; n < 1500; n++) {
  const x0 = rand() * SIZE;
  const y0 = rand() * SIZE;
  const angle = rand() * Math.PI * 2;
  const len = 2 + rand() * 6;
  const shift = (rand() < 0.5 ? -1 : 1) * (5 + rand() * 10);
  for (let s = 0; s <= len; s++) {
    const x = ((Math.round(x0 + Math.cos(angle) * s) % SIZE) + SIZE) % SIZE;
    const y = Math.max(
      0,
      Math.min(SIZE - 1, Math.round(y0 + Math.sin(angle) * s))
    );
    const at = (y * SIZE + x) * 3;
    for (let c = 0; c < 3; c++)
      rgb[at + c] = Math.max(0, Math.min(255, rgb[at + c] + shift));
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
  for (let i = 0; i < buf.length; i++)
    c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
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
// 모델은 **−Z 쪽이 아래(바닥), +Z 쪽이 위(단 위)** 로 오르게 만든다.
// 회전 0 이면 남쪽에서 북쪽으로 오르는 계단이다.
const positions = [];
const normals = [];
const uvs = [];
const indices = [];

function box(cx, cy, cz, hw, hh, hd) {
  const faces = [
    [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0]
    ],
    [
      [0, 0, -1],
      [-1, 0, 0],
      [0, 1, 0]
    ],
    [
      [1, 0, 0],
      [0, 0, -1],
      [0, 1, 0]
    ],
    [
      [-1, 0, 0],
      [0, 0, 1],
      [0, 1, 0]
    ],
    // (1,0,0)×(0,0,1) 은 −Y — 윗면은 세로축을 뒤집어야 바깥을 본다 (wall-low 에서 겪었다)
    [
      [0, 1, 0],
      [1, 0, 0],
      [0, 0, -1]
    ]
  ];
  const center = [cx, cy, cz];
  const half = [hw, hh, hd];
  const reach = a =>
    Math.abs(a[0]) * hw + Math.abs(a[1]) * hh + Math.abs(a[2]) * hd;
  for (const [n, ax, ay] of faces) {
    const base = positions.length / 3;
    const eu = reach(ax);
    const ev = reach(ay);
    for (const [su, sv] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ]) {
      for (let c = 0; c < 3; c++)
        positions.push(
          center[c] + n[c] * half[c] + ax[c] * eu * su + ay[c] * ev * sv
        );
      normals.push(n[0], n[1], n[2]);
      uvs.push(0.5 + su * (eu / 1.1), 0.5 + sv * (ev / 0.55));
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

// n 번째 단은 바닥에서 (n+1)×RISER 높이까지 차오르고, 안쪽으로 갈수록 짧아진다.
// 상자를 바닥부터 쌓아 계단 옆면이 통짜 벽처럼 보이게 한다(속이 안 비친다).
for (let n = 0; n < STEPS; n++) {
  const top = (n + 1) * RISER;
  const z0 = -DEPTH / 2 + n * TREAD; // 이 단의 앞쪽 모서리
  const z1 = DEPTH / 2; // 안쪽 끝까지
  box(0, top / 2 - RISE / 2, (z0 + z1) / 2, WIDTH / 2, top / 2, (z1 - z0) / 2);
}

const posArr = new Float32Array(positions);
const nrmArr = new Float32Array(normals);
const uvArr = new Float32Array(uvs);
const idxArr = new Uint16Array(indices);
const png = encodePng(SIZE, SIZE, rgb);

const pad4 = n => (n + 3) & ~3;
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
  views.push({
    buffer: 0,
    byteOffset: offset,
    byteLength: data.length,
    ...(target ? {target} : {})
  });
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
  asset: {version: "2.0", generator: "make-terrace-steps.mjs"},
  scene: 0,
  scenes: [{nodes: [0]}],
  nodes: [{mesh: 0, name: "terrace-steps"}],
  meshes: [
    {
      primitives: [
        {
          attributes: {POSITION: 1, NORMAL: 2, TEXCOORD_0: 3},
          indices: 0,
          material: 0
        }
      ]
    }
  ],
  materials: [
    {
      name: "terrace-steps",
      pbrMetallicRoughness: {
        baseColorTexture: {index: 0},
        metallicFactor: 0,
        roughnessFactor: 0.95
      }
    }
  ],
  textures: [{source: 0, sampler: 0}],
  samplers: [{wrapS: 10497, wrapT: 10497}],
  images: [{bufferView: 4, mimeType: "image/png"}],
  accessors: [
    {bufferView: 0, componentType: 5123, count: idxArr.length, type: "SCALAR"},
    {
      bufferView: 1,
      componentType: 5126,
      count: posArr.length / 3,
      type: "VEC3",
      min,
      max
    },
    {
      bufferView: 2,
      componentType: 5126,
      count: nrmArr.length / 3,
      type: "VEC3"
    },
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
writeFileSync(
  OUT_GLB,
  Buffer.concat([
    header,
    chunkHeader(jsonPad.length, 0x4e4f534a),
    jsonPad,
    chunkHeader(bin.length, 0x004e4942),
    bin
  ])
);

console.log(
  `${OUT_GLB}  ${(png.length / 1024).toFixed(0)}KB 텍스처 · 삼각형 ${
    idxArr.length / 3
  }개`
);
console.log(
  `  오름 ${RISE} · 폭 ${WIDTH} · 안길이 ${DEPTH.toFixed(
    2
  )} (${STEPS}단 × ${RISER.toFixed(3)})`
);
console.log(
  `  KIT 에  "terrace-steps": {h: ${RISE.toFixed(3)}, m: ${(RISE * 2.5).toFixed(
    3
  )}}  (배율 1) · −Z 에서 +Z 로 오른다`
);
