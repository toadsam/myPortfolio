// 나무·덤불을 "교차 빌보드"로 구워 4삼각형짜리 대역 모델을 만든다.
//
// 왜 필요한가: 마을을 숲으로 두르고 빈 잔디를 채우려면 나무가 100그루쯤 필요한데,
// Meshy 나무는 그루당 5,600~8,900 삼각형이다. 100그루면 70만 — 마을 전체 예산이
// 1M이니 나무 하나로 예산을 다 쓴다. 게다가 잎사귀는 simplify가 거의 안 먹는다
// (잎마다 UV 섬이라 오차 0.3을 줘도 8,932 → 5,309에서 멈춘다).
//
// 그래서 바닥 타일에 썼던 수법을 세로로 돌려 쓴다: 정투영으로 앞·옆 두 장을 구워
// 알파를 남기고, 십자로 세운 사각형 두 장에 붙인다. 8,932 → 4 삼각형.
//
// 어디에 쓰나: 사람이 걸어 들어가지 않는 자리 — 마을을 두르는 숲 띠, 지구 사이
// 먼 빈 잔디. 앞마당·길가처럼 캐릭터가 다가서는 자리에는 원본을 그대로 쓴다.
// 빌보드는 정면에서 볼 땐 원본과 구분이 안 가지만 바로 밑에서 올려다보면 납작하다.
//
// 최적화 파이프라인을 타지 않고 곧장 public/models/props/impostor/ 에 쓴다.
// optimize_textures.py 가 텍스처를 JPEG로 바꾸는데, JPEG에는 알파가 없어서
// 파이프라인을 태우면 잎 사이 배경이 전부 불투명해진다.
//
// 사용법: node scripts/bake-impostors.mjs [--px 384]

import {readFileSync, writeFileSync, mkdirSync} from "node:fs";
import {join, basename} from "node:path";
import {inflateSync, deflateSync} from "node:zlib";

const SRC = "public/models/props/raw/nature";
const OUT = "public/models/props/impostor";

const pxArg = process.argv.indexOf("--px");
/** 한 시점당 해상도. 나무가 화면에서 커야 100px 남짓이라 384면 충분히 촘촘하다 */
const PX = pxArg >= 0 ? Number(process.argv[pxArg + 1]) : 384;

// 구울 대상 — 여러 그루를 깔 것들만. 바위는 원본이 2천이라 구울 이유가 없다.
//
// 꽃밭(tree-petal-parade)은 구웠다가 뺐다. 납작하고 넓은 물건이라 옆에서 본 그림이
// 종잇장 한 줄로 나온다 — 십자로 세워 봐야 벽 하나와 실 한 가닥이다.
// 빌보드는 "옆에서 봐도 부피가 있는 것"에만 쓴다.
const TARGETS = [
  "tree-golden-canopy.glb",
  "tree-emerald-crown.glb",
  "tree-sakura.glb",
  "bush-emerald-berry.glb"
];

/** 이 알파 밑은 안 그린다. 낮게 잡아야 잎 가장자리가 갉아먹히지 않는다 */
const ALPHA_CUTOFF = 0.4;

// 낮고 넓은 것에는 수평 뚜껑을 한 장 더 얹는다.
//
// 마을 카메라는 40°쯤 내려다본다. 세로 판때기는 그 각도에서 높이가 3분의 2로
// 눌리는데, 나무는 원래 크니까 버티지만 덤불(1.6m)은 눌리고 나면 십자의 옆날이
// 잔디에 꽂힌 나뭇잎처럼 삐죽 튀어나온다 — 실제로 그렇게 보였다.
// 위에서 볼 땐 위에서 본 그림이 필요하다. 수평 한 장이면 6삼각형에 해결된다.
//
// ─── 나무에도 뚜껑을 달았다 (2차) ────────────────────────────────────────────
// 처음엔 덤불에만 달았다. 마을 카메라를 36유닛까지만 당길 수 있어서, 나무를
// 진짜 위에서 내려다볼 일이 없었기 때문이다. 마을이 섬이 되면서 카메라 상한을
// 78로 열었더니 컨셉 아트 같은 부감이 가능해졌는데 — 그 각도에서 숲 700그루가
// 전부 **검은 X자**로 드러났다. 십자 빌보드를 정수리에서 보면 그게 전부다.
// 나무는 뚜껑을 캐노피 한복판(0.68)에 둔다. 눈높이(1.6)보다 한참 위라
// 덤불 때처럼 옆구리로 선반이 튀어나올 일이 없다.
const CAP = {
  "bush-emerald-berry.glb": {at: 0.42, floor: 0.34},
  // 처음엔 0.62였는데 눈높이에서 보면 덤불 옆구리로 초록 선반이 툭 튀어나왔다.
  // 덤불이 가장 굵어지는 높이에 맞추면 실루엣 안에 숨는다.
  "tree-golden-canopy.glb": {at: 0.68, floor: 0.45},
  "tree-emerald-crown.glb": {at: 0.62, floor: 0.4},
  "tree-sakura.glb": {at: 0.68, floor: 0.45}
};

// ─── GLB 읽기 ─────────────────────────────────────────────────────────────────
function parseGlb(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const total = dv.getUint32(8, true);
  let off = 12, json = null, bin = null;
  while (off < total) {
    const len = dv.getUint32(off, true);
    const type = dv.getUint32(off + 4, true);
    const start = off + 8;
    if (type === 0x4e4f534a) json = JSON.parse(buf.slice(start, start + len).toString("utf8"));
    else if (type === 0x004e4942) bin = buf.slice(start, start + len);
    off = start + len;
    while (off % 4 !== 0) off++;
  }
  return {gltf: json, bin};
}

const COMP = {5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2], 5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4]};
const NUM = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4};

function readAccessor(gltf, bin, index) {
  const acc = gltf.accessors[index];
  const n = NUM[acc.type];
  const [Ctor, bytes] = COMP[acc.componentType];
  const bv = gltf.bufferViews[acc.bufferView];
  const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  const stride = bv.byteStride ?? n * bytes;
  const out = new Float64Array(acc.count * n);
  const src = Buffer.from(bin.buffer, bin.byteOffset, bin.byteLength);
  for (let i = 0; i < acc.count; i++) {
    const at = base + i * stride;
    const slice = src.subarray(at, at + n * bytes);
    const view = new Ctor(slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength));
    for (let c = 0; c < n; c++) out[i * n + c] = view[c];
  }
  return out;
}

// ─── 노드 계층 펴기 ───────────────────────────────────────────────────────────
// 나무 GLB는 줄기/잎/열매가 따로 노드로 매달려 있고 노드마다 변환이 걸려 있다.
// 정점을 전부 루트 좌표계로 옮겨 놓아야 한 화폭에 같이 그릴 수 있다.
const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
    for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function trs(node) {
  if (node.matrix) return node.matrix.slice();
  const m = ident();
  const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const r = [
    1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy + qz * qw), 2 * (qx * qz - qy * qw),
    2 * (qx * qy - qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz + qx * qw),
    2 * (qx * qz + qy * qw), 2 * (qy * qz - qx * qw), 1 - 2 * (qx * qx + qy * qy)
  ];
  const s = [sx, sy, sz];
  for (let c = 0; c < 3; c++) for (let row = 0; row < 3; row++) m[c * 4 + row] = r[c * 3 + row] * s[c];
  m[12] = tx; m[13] = ty; m[14] = tz;
  return m;
}
const apply = (m, x, y, z) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14]
];

function flatten(gltf) {
  const out = [];
  const walk = (nodeIndex, parent) => {
    const node = gltf.nodes[nodeIndex];
    const m = mul(parent, trs(node));
    if (node.mesh !== undefined)
      for (const prim of gltf.meshes[node.mesh].primitives) out.push({prim, m});
    for (const child of node.children ?? []) walk(child, m);
  };
  for (const n of gltf.scenes[gltf.scene ?? 0].nodes) walk(n, ident());
  return out;
}

// ─── PNG ──────────────────────────────────────────────────────────────────────
function decodePng(buf) {
  let off = 8, w = 0, h = 0, colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const tag = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (tag === "IHDR") {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); colorType = data[9];
      if (data[8] !== 8 || data[12] !== 0) throw new Error("8bit 비인터레이스 PNG만 지원");
    } else if (tag === "IDAT") idat.push(data);
    else if (tag === "IEND") break;
    off += 12 + len;
  }
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : (() => {throw new Error(`colorType ${colorType}`);})();
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
/** RGBA PNG — 알파가 있어야 잎 사이로 하늘이 보인다 */
function encodePngRgba(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunk = (tag, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(tag, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8bit RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, {level: 9})),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ─── 옆에서 굽기 ──────────────────────────────────────────────────────────────
// h/v/d = 화폭 가로축 / 세로축 / 깊이축(카메라가 보는 방향)
const VIEWS = [
  {name: "front", h: 0, v: 1, d: 2}, // −Z 에서 본다 (가로 = X)
  {name: "side", h: 2, v: 1, d: 0}   // −X 에서 본다 (가로 = Z)
];
/** 뚜껑용 — 위에서 내려다본다. 화면 세로가 Z라 뒤집지 않는다(glTF UV와 같은 방향) */
const TOP_VIEW = {name: "top", h: 0, v: 2, d: 1, noFlip: true};

function load(path) {
  const {gltf, bin} = parseGlb(readFileSync(path));
  const parts = flatten(gltf);

  const texCache = new Map();
  const texFor = (matIdx) => {
    if (matIdx === undefined) return null;
    if (texCache.has(matIdx)) return texCache.get(matIdx);
    let tex = null;
    const t = gltf.materials?.[matIdx]?.pbrMetallicRoughness?.baseColorTexture;
    if (t) {
      const img = gltf.images[gltf.textures[t.index].source];
      const bv = gltf.bufferViews[img.bufferView];
      const raw = Buffer.from(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0), bv.byteLength);
      if (raw[0] === 0x89) tex = decodePng(raw);
      else throw new Error(`${basename(path)} 의 텍스처가 PNG가 아닙니다 — raw/ 원본을 쓰세요`);
    }
    texCache.set(matIdx, tex);
    return tex;
  };

  const geo = parts.map(({prim, m}) => {
    const pos = readAccessor(gltf, bin, prim.attributes.POSITION);
    const uv = prim.attributes.TEXCOORD_0 !== undefined ? readAccessor(gltf, bin, prim.attributes.TEXCOORD_0) : null;
    const idx = prim.indices !== undefined
      ? readAccessor(gltf, bin, prim.indices)
      : Float64Array.from({length: pos.length / 3}, (_, i) => i);
    const world = new Float64Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      const [x, y, z] = apply(m, pos[i], pos[i + 1], pos[i + 2]);
      world[i] = x; world[i + 1] = y; world[i + 2] = z;
    }
    return {
      pos: world, uv, idx,
      tex: texFor(prim.material),
      base: gltf.materials?.[prim.material]?.pbrMetallicRoughness?.baseColorFactor
    };
  });

  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  let tris = 0;
  for (const g of geo) {
    tris += g.idx.length / 3;
    for (let i = 0; i < g.pos.length; i += 3) for (let c = 0; c < 3; c++) {
      if (g.pos[i + c] < lo[c]) lo[c] = g.pos[i + c];
      if (g.pos[i + c] > hi[c]) hi[c] = g.pos[i + c];
    }
  }
  return {geo, lo, hi, tris};
}

/** 한 시점을 PX×PX RGBA로 래스터화한다. minY 아래 삼각형은 뺀다(뚜껑용) */
function render(geo, view, center, span, minY = -Infinity) {
  const {h: H, v: V, d: D} = view;
  const rgba = Buffer.alloc(PX * PX * 4);
  const depth = new Float64Array(PX * PX).fill(-Infinity);

  for (const {pos, uv, idx, tex, base} of geo) {
    for (let t = 0; t < idx.length; t += 3) {
      const o = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3];
      if (Math.max(pos[o[0] + 1], pos[o[1] + 1], pos[o[2] + 1]) < minY) continue;
      const ph = o.map((k) => ((pos[k + H] - center[H]) / span + 0.5) * PX);
      // 화면 세로는 아래로 자란다 — 모델 위쪽이 이미지 0행이 되도록 뒤집는다
      const pv = view.noFlip
        ? o.map((k) => ((pos[k + V] - center[V]) / span + 0.5) * PX)
        : o.map((k) => PX - ((pos[k + V] - center[V]) / span + 0.5) * PX);
      const pd = o.map((k) => pos[k + D]);

      const e1 = [pos[o[1]] - pos[o[0]], pos[o[1] + 1] - pos[o[0] + 1], pos[o[1] + 2] - pos[o[0] + 2]];
      const e2 = [pos[o[2]] - pos[o[0]], pos[o[2] + 1] - pos[o[0] + 1], pos[o[2] + 2] - pos[o[0] + 2]];
      const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const nl = Math.hypot(...n) || 1;
      // 마을 조명이 위에서 다시 칠하지만, 빌보드는 법선이 전부 위를 봐서 균일하게
      // 밝아진다. 음영을 약하게 구웠더니 나무가 색종이처럼 납작해 보여서, 원본과
      // 나란히 놓고 비교해 대비를 키웠다 — 위를 보는 면은 밝게, 옆·아래는 어둡게.
      const shade = 0.56 + 0.16 * Math.abs(n[D] / nl) + 0.34 * Math.max(0, n[1] / nl);

      const i0 = Math.max(0, Math.floor(Math.min(...ph))), i1 = Math.min(PX - 1, Math.ceil(Math.max(...ph)));
      const j0 = Math.max(0, Math.floor(Math.min(...pv))), j1 = Math.min(PX - 1, Math.ceil(Math.max(...pv)));
      const den = (pv[1] - pv[2]) * (ph[0] - ph[2]) + (ph[2] - ph[1]) * (pv[0] - pv[2]);
      if (Math.abs(den) < 1e-12) continue;

      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const qx = i + 0.5, qy = j + 0.5;
        const w0 = ((pv[1] - pv[2]) * (qx - ph[2]) + (ph[2] - ph[1]) * (qy - pv[2])) / den;
        const w1 = ((pv[2] - pv[0]) * (qx - ph[2]) + (ph[0] - ph[2]) * (qy - pv[2])) / den;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const d = w0 * pd[0] + w1 * pd[1] + w2 * pd[2];
        const at = j * PX + i;
        if (d <= depth[at]) continue;
        depth[at] = d;

        let r = 190, g = 190, b = 190, a = 255;
        if (tex && uv) {
          let u = w0 * uv[idx[t] * 2] + w1 * uv[idx[t + 1] * 2] + w2 * uv[idx[t + 2] * 2];
          let v = w0 * uv[idx[t] * 2 + 1] + w1 * uv[idx[t + 1] * 2 + 1] + w2 * uv[idx[t + 2] * 2 + 1];
          u -= Math.floor(u); v -= Math.floor(v);
          const sx = Math.min(tex.w - 1, Math.floor(u * tex.w));
          // glTF UV 원점은 좌상단 — 뒤집으면 아틀라스의 엉뚱한 칸을 찍는다
          const sy = Math.min(tex.h - 1, Math.floor(v * tex.h));
          const s = (sy * tex.w + sx) * tex.ch;
          r = tex.data[s];
          g = tex.ch === 1 ? r : tex.data[s + 1];
          b = tex.ch === 1 ? r : tex.data[s + 2];
          if (tex.ch === 4) a = tex.data[s + 3];
        } else if (base) {
          r = base[0] * 255; g = base[1] * 255; b = base[2] * 255;
        }
        rgba[at * 4] = Math.min(255, r * shade);
        rgba[at * 4 + 1] = Math.min(255, g * shade);
        rgba[at * 4 + 2] = Math.min(255, b * shade);
        rgba[at * 4 + 3] = a;
      }
    }
  }

  // 투명한 픽셀에 이웃 색을 번지게 한다. 안 하면 밉맵이 검정(빈 픽셀의 RGB)을
  // 잎 색과 섞어 멀리서 나무에 검은 테두리가 생긴다 — 알파 블리딩.
  for (let pass = 0; pass < 4; pass++) {
    const src = Buffer.from(rgba);
    for (let j = 0; j < PX; j++) for (let i = 0; i < PX; i++) {
      const at = j * PX + i;
      if (src[at * 4 + 3] > 0) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= PX || nj >= PX) continue;
        const nat = (nj * PX + ni) * 4;
        if (src[nat + 3] === 0) continue;
        r += src[nat]; g += src[nat + 1]; b += src[nat + 2]; n++;
      }
      if (!n) continue;
      rgba[at * 4] = r / n; rgba[at * 4 + 1] = g / n; rgba[at * 4 + 2] = b / n;
      // 알파는 0 그대로 — 색만 번지게 하고 실루엣은 안 키운다
    }
  }

  let covered = 0;
  for (let i = 0; i < PX * PX; i++) if (rgba[i * 4 + 3] >= ALPHA_CUTOFF * 255) covered++;
  return {rgba, covered};
}

// ─── 십자 사각형 GLB 쓰기 ─────────────────────────────────────────────────────
function buildGlb(cells, center, span, capY = null) {
  const half = span / 2;
  const [cx, cy, cz] = center;
  const positions = [], uvs = [], normals = [], indices = [];

  /** 칸 하나가 아틀라스에서 차지하는 u 구간 */
  const cellU = 1 / cells.length;

  // 앞면 사각형 — X 로 눕고 Z 중앙에 선다
  const quads = [
    [[cx - half, cy + half, cz], [cx + half, cy + half, cz], [cx + half, cy - half, cz], [cx - half, cy - half, cz]],
    // 옆면 사각형 — Z 로 눕고 X 중앙에 선다
    [[cx, cy + half, cz - half], [cx, cy + half, cz + half], [cx, cy - half, cz + half], [cx, cy - half, cz - half]]
  ];
  // 수평 뚜껑 — 위에서 본 그림. UV의 v가 +Z 방향이라 좌상단이 (−X, −Z) 다.
  if (capY !== null)
    quads.push([
      [cx - half, capY, cz - half], [cx + half, capY, cz - half],
      [cx + half, capY, cz + half], [cx - half, capY, cz + half]
    ]);

  quads.forEach((quad, cell) => {
    const u0 = cell * cellU, u1 = (cell + 1) * cellU;
    const base = positions.length / 3;
    // 좌상 → 우상 → 우하 → 좌하. 이미지 0행이 위쪽이라 v는 0이 위다.
    const corners = [[u0, 0], [u1, 0], [u1, 1], [u0, 1]];
    quad.forEach((p, k) => {
      positions.push(p[0], p[1], p[2]);
      uvs.push(corners[k][0], corners[k][1]);
      // 법선을 위로 세우는 게 잎사귀의 정석이다. 세로 판의 진짜 법선(수평)을 쓰면
      // 위에서 오는 빛에 거의 안 맞아 나무가 통째로 어두워진다.
      normals.push(0, 1, 0);
    });
    indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  });

  // 아틀라스 — 시점을 가로로 이어 붙인다
  const W = PX * cells.length;
  const atlas = Buffer.alloc(W * PX * 4);
  cells.forEach(({rgba}, cell) => {
    for (let j = 0; j < PX; j++)
      rgba.copy(atlas, (j * W + cell * PX) * 4, j * PX * 4, (j + 1) * PX * 4);
  });
  const png = encodePngRgba(W, PX, atlas);

  const posBuf = Buffer.from(new Float32Array(positions).buffer);
  const nrmBuf = Buffer.from(new Float32Array(normals).buffer);
  const uvBuf = Buffer.from(new Float32Array(uvs).buffer);
  const idxBuf = Buffer.from(new Uint16Array(indices).buffer);

  // 청크는 4바이트 배수로 채운다. BIN은 0으로, JSON은 반드시 공백으로 —
  // 0으로 채우면 JSON.parse 가 "Unexpected non-whitespace character" 로 죽는다.
  const pad = (b, fill = 0) => (b.length % 4 === 0 ? b : Buffer.concat([b, Buffer.alloc(4 - (b.length % 4), fill)]));
  const parts = [posBuf, nrmBuf, uvBuf, idxBuf, png].map((p) => pad(p));
  const offsets = [];
  let cursor = 0;
  for (const p of parts) { offsets.push(cursor); cursor += p.length; }
  const bin = Buffer.concat(parts);

  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let n = 0; n < positions.length; n += 3) for (let c = 0; c < 3; c++) {
    lo[c] = Math.min(lo[c], positions[n + c]);
    hi[c] = Math.max(hi[c], positions[n + c]);
  }

  const gltf = {
    asset: {version: "2.0", generator: "bake-impostors.mjs"},
    scene: 0,
    scenes: [{nodes: [0]}],
    nodes: [{mesh: 0}],
    meshes: [{primitives: [{attributes: {POSITION: 0, NORMAL: 1, TEXCOORD_0: 2}, indices: 3, material: 0}]}],
    materials: [{
      pbrMetallicRoughness: {baseColorTexture: {index: 0}, metallicFactor: 0, roughnessFactor: 1},
      // MASK(알파 테스트)여야 깊이를 쓴다. BLEND로 하면 나무끼리 앞뒤 정렬이
      // 카메라가 돌 때마다 뒤집혀 잎이 깜빡인다.
      alphaMode: "MASK",
      alphaCutoff: ALPHA_CUTOFF,
      doubleSided: true
    }],
    textures: [{source: 0, sampler: 0}],
    samplers: [{magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071}],
    images: [{bufferView: 4, mimeType: "image/png"}],
    accessors: [
      {bufferView: 0, componentType: 5126, count: positions.length / 3, type: "VEC3", min: lo, max: hi},
      {bufferView: 1, componentType: 5126, count: normals.length / 3, type: "VEC3"},
      {bufferView: 2, componentType: 5126, count: uvs.length / 2, type: "VEC2"},
      {bufferView: 3, componentType: 5123, count: indices.length, type: "SCALAR"}
    ],
    bufferViews: [
      {buffer: 0, byteOffset: offsets[0], byteLength: posBuf.length, target: 34962},
      {buffer: 0, byteOffset: offsets[1], byteLength: nrmBuf.length, target: 34962},
      {buffer: 0, byteOffset: offsets[2], byteLength: uvBuf.length, target: 34962},
      {buffer: 0, byteOffset: offsets[3], byteLength: idxBuf.length, target: 34963},
      {buffer: 0, byteOffset: offsets[4], byteLength: png.length}
    ],
    buffers: [{byteLength: bin.length}]
  };

  const jsonBuf = pad(Buffer.from(JSON.stringify(gltf), "utf8"), 0x20);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + bin.length, 8);
  const chunk = (type, data) => {
    const h = Buffer.alloc(8);
    h.writeUInt32LE(data.length, 0);
    h.writeUInt32LE(type, 4);
    return Buffer.concat([h, data]);
  };
  return {glb: Buffer.concat([header, chunk(0x4e4f534a, jsonBuf), chunk(0x004e4942, bin)]), pngBytes: png.length};
}

// ─── 실행 ─────────────────────────────────────────────────────────────────────
mkdirSync(OUT, {recursive: true});
console.log(`시점당 ${PX}×${PX}  ·  알파 컷오프 ${ALPHA_CUTOFF}\n`);
let before = 0;
let after = 0;
for (const name of TARGETS) {
  const {geo, lo, hi, tris} = load(join(SRC, name));
  const center = [0, 1, 2].map((c) => (lo[c] + hi[c]) / 2);
  // 두 시점이 같은 크기여야 십자가 안 찌그러진다. 가장 긴 변에 맞추고 여유를 조금.
  const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) * 1.04;
  const height = hi[1] - lo[1];
  const cap = CAP[name];
  const capped = Boolean(cap);
  const cells = VIEWS.map((v) => render(geo, v, center, span));
  if (cap) cells.push(render(geo, TOP_VIEW, center, span, lo[1] + height * cap.floor));
  const capY = cap ? lo[1] + height * cap.at : null;
  const {glb, pngBytes} = buildGlb(cells, center, span, capY);
  writeFileSync(join(OUT, name), glb);
  before += tris;
  const faces = capped ? 6 : 4;
  after += faces;
  const fill = ((cells[0].covered / (PX * PX)) * 100).toFixed(0);
  console.log(
    `  ${name.padEnd(26)} ${String(Math.round(tris)).padStart(6)} → ${faces} 삼각형` +
      `   높이 ${height.toFixed(3)}   화면 채움 ${fill}%   png ${(pngBytes / 1024).toFixed(0)}KB` +
      (capped ? "   +수평 뚜껑" : "")
  );
}
console.log(`\n합계 ${Math.round(before).toLocaleString()} → ${after} 삼각형`);
console.log(`${OUT} 에 바로 씁니다 — optimize 파이프라인을 타면 JPEG로 바뀌어 알파가 날아갑니다`);
