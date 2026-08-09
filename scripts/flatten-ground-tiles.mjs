// 바닥 타일을 "위에서 구운 그림 한 장을 붙인 평면"으로 바꿔 굽는다.
//
// 왜 필요한가: Meshy 바닥 타일은 장당 1만 삼각형인데, 자갈 요철의 실제 높이는
// 타일 폭의 1~3%뿐이라 마을 카메라(비스듬한 부감)에서는 보이지도 않는다.
// 그런데 simplify로는 못 줄인다 — UV 심이 많아 meshoptimizer가 정점을 못 합치고,
// 오차를 0.02에서 0.15까지 올려도 4,853에서 딱 멈춘다(48%가 바닥).
//
// 그래서 지오메트리를 버리고 그림만 남긴다. 타일을 정투영으로 내려다본 이미지를
// 구워 평면(또는 원반)에 입히면, 위에서 본 모습은 픽셀 단위로 같은데 삼각형은
// 4,853 → 2 가 된다. 길 68장 + 앞마당 27장 + 풀숲 29장이면 634k가 사라진다.
//
// 사용법: node scripts/flatten-ground-tiles.mjs [--px 768]
//   raw/ground/**.glb  →  raw/ground-flat/**.glb  (이후 npm run optimize props)

import {readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync} from "node:fs";
import {join, basename, dirname, relative} from "node:path";
import {inflateSync, deflateSync} from "node:zlib";

const SRC = "public/models/props/raw/ground";
const OUT = "public/models/props/raw/ground-flat";

const pxArg = process.argv.indexOf("--px");
/** 구울 해상도. 타일 실물이 1.88유닛이라 768이면 유닛당 400px — 원본 텍스처보다 촘촘하다 */
const PX = pxArg >= 0 ? Number(process.argv[pxArg + 1]) : 768;

/** 원반으로 구울 타일(모서리가 비어 있어 사각 평면으로 만들면 배경이 딸려 나온다) */
const DISC = new Set(["plaza-tile.glb"]);
/** 원반 둘레를 몇 조각으로 나눌지 — 32면 반지름 4.6유닛에서도 각이 안 보인다 */
const DISC_SEGMENTS = 32;

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
function encodePng(w, h, rgb) {
  const stride = w * 3;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
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
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, {level: 9})), chunk("IEND", Buffer.alloc(0))]);
}

// ─── 위에서 굽기 ──────────────────────────────────────────────────────────────
// 위를 보는 면만 남기는 게 아니라 깊이 버퍼로 "가장 높은 면"을 고른다.
// 조명은 넣지 않는다 — 마을 조명이 다시 칠할 것이므로 알베도만 뽑아야 한다.
function bakeTop(path) {
  const {gltf, bin} = parseGlb(readFileSync(path));
  const prim = gltf.meshes[0].primitives[0];
  const mat = gltf.materials[prim.material ?? 0];
  const texIdx = mat.pbrMetallicRoughness?.baseColorTexture?.index ?? 0;
  const bv = gltf.bufferViews[gltf.images[gltf.textures[texIdx].source].bufferView];
  const tex = decodePng(Buffer.from(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0), bv.byteLength));

  const pos = readAccessor(gltf, bin, prim.attributes.POSITION);
  const uv = readAccessor(gltf, bin, prim.attributes.TEXCOORD_0);
  const idx = readAccessor(gltf, bin, prim.indices);

  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxY = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    minX = Math.min(minX, pos[i]); maxX = Math.max(maxX, pos[i]);
    minZ = Math.min(minZ, pos[i + 2]); maxZ = Math.max(maxZ, pos[i + 2]);
    maxY = Math.max(maxY, pos[i + 1]);
  }
  const spanX = maxX - minX || 1, spanZ = maxZ - minZ || 1;

  const img = Buffer.alloc(PX * PX * 3);
  const depth = new Float64Array(PX * PX).fill(-Infinity);
  const hit = new Uint8Array(PX * PX);

  for (let t = 0; t < idx.length; t += 3) {
    const A = idx[t] * 3, B = idx[t + 1] * 3, C = idx[t + 2] * 3;
    const px = [((pos[A] - minX) / spanX) * PX, ((pos[B] - minX) / spanX) * PX, ((pos[C] - minX) / spanX) * PX];
    const pz = [((pos[A + 2] - minZ) / spanZ) * PX, ((pos[B + 2] - minZ) / spanZ) * PX, ((pos[C + 2] - minZ) / spanZ) * PX];
    const py = [pos[A + 1], pos[B + 1], pos[C + 1]];
    const tu = [uv[idx[t] * 2], uv[idx[t + 1] * 2], uv[idx[t + 2] * 2]];
    const tv = [uv[idx[t] * 2 + 1], uv[idx[t + 1] * 2 + 1], uv[idx[t + 2] * 2 + 1]];

    const i0 = Math.max(0, Math.floor(Math.min(...px))), i1 = Math.min(PX - 1, Math.ceil(Math.max(...px)));
    const j0 = Math.max(0, Math.floor(Math.min(...pz))), j1 = Math.min(PX - 1, Math.ceil(Math.max(...pz)));
    const den = (pz[1] - pz[2]) * (px[0] - px[2]) + (px[2] - px[1]) * (pz[0] - pz[2]);
    if (Math.abs(den) < 1e-12) continue;

    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const qx = i + 0.5, qz = j + 0.5;
      const w0 = ((pz[1] - pz[2]) * (qx - px[2]) + (px[2] - px[1]) * (qz - pz[2])) / den;
      const w1 = ((pz[2] - pz[0]) * (qx - px[2]) + (px[0] - px[2]) * (qz - pz[2])) / den;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const y = w0 * py[0] + w1 * py[1] + w2 * py[2];
      const at = j * PX + i;
      if (y <= depth[at]) continue;
      depth[at] = y;
      hit[at] = 1;
      let u = w0 * tu[0] + w1 * tu[1] + w2 * tu[2];
      let v = w0 * tv[0] + w1 * tv[1] + w2 * tv[2];
      u -= Math.floor(u); v -= Math.floor(v);
      const sx = Math.min(tex.w - 1, Math.floor(u * tex.w));
      // glTF UV 원점은 좌상단 — 뒤집으면 빈 아틀라스를 찍어 새까맣게 나온다
      const sy = Math.min(tex.h - 1, Math.floor(v * tex.h));
      const s = (sy * tex.w + sx) * tex.ch;
      img[at * 3] = tex.data[s];
      img[at * 3 + 1] = tex.ch === 1 ? tex.data[s] : tex.data[s + 1];
      img[at * 3 + 2] = tex.ch === 1 ? tex.data[s] : tex.data[s + 2];
    }
  }

  // 빈 픽셀(원반 바깥 등)은 가장 가까운 색으로 번지게 둔다 — 원반 가장자리에
  // 검은 테두리가 생기면 밉맵에서 새어 나온다.
  for (let pass = 0; pass < 3; pass++) {
    const src = Buffer.from(img);
    const was = Uint8Array.from(hit);
    for (let j = 0; j < PX; j++) for (let i = 0; i < PX; i++) {
      const at = j * PX + i;
      if (was[at]) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= PX || nj >= PX) continue;
        const nat = nj * PX + ni;
        if (!was[nat]) continue;
        r += src[nat * 3]; g += src[nat * 3 + 1]; b += src[nat * 3 + 2]; n++;
      }
      if (!n) continue;
      img[at * 3] = r / n; img[at * 3 + 1] = g / n; img[at * 3 + 2] = b / n;
      hit[at] = 1;
    }
  }

  return {img, minX, maxX, minZ, maxZ, maxY, tris: idx.length / 3};
}

// ─── 평면/원반 GLB 쓰기 ───────────────────────────────────────────────────────
function buildGlb({img, minX, maxX, minZ, maxZ, y, disc}) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const u = (x) => (x - minX) / (maxX - minX);
  const v = (z) => (z - minZ) / (maxZ - minZ);

  if (disc) {
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const rx = (maxX - minX) / 2, rz = (maxZ - minZ) / 2;
    positions.push(cx, y, cz);
    uvs.push(u(cx), v(cz));
    for (let n = 0; n <= DISC_SEGMENTS; n++) {
      const a = (n / DISC_SEGMENTS) * Math.PI * 2;
      const x = cx + Math.cos(a) * rx, z = cz + Math.sin(a) * rz;
      positions.push(x, y, z);
      uvs.push(u(x), v(z));
    }
    for (let n = 1; n <= DISC_SEGMENTS; n++) indices.push(0, n + 1, n);
  } else {
    // 위에서 봤을 때 앞면이 보이도록 감는다 (법선 +Y)
    positions.push(minX, y, minZ, maxX, y, minZ, maxX, y, maxZ, minX, y, maxZ);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(0, 2, 1, 0, 3, 2);
  }

  const posBuf = Buffer.from(new Float32Array(positions).buffer);
  const uvBuf = Buffer.from(new Float32Array(uvs).buffer);
  const normals = [];
  for (let n = 0; n < positions.length / 3; n++) normals.push(0, 1, 0);
  const nrmBuf = Buffer.from(new Float32Array(normals).buffer);
  const idxBuf = Buffer.from(new Uint16Array(indices).buffer);
  const png = encodePng(PX, PX, img);

  // 청크는 4바이트 배수로 채워야 한다. BIN은 0으로, JSON은 반드시 공백으로 —
  // 0으로 채우면 JSON.parse가 "Unexpected non-whitespace character" 로 죽는다.
  const pad = (b, fill = 0) => (b.length % 4 === 0 ? b : Buffer.concat([b, Buffer.alloc(4 - (b.length % 4), fill)]));
  const parts = [posBuf, nrmBuf, uvBuf, idxBuf, png].map(pad);
  const offsets = [];
  let cursor = 0;
  for (const p of parts) {
    offsets.push(cursor);
    cursor += p.length;
  }
  const bin = Buffer.concat(parts);

  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let n = 0; n < positions.length; n += 3)
    for (let c = 0; c < 3; c++) {
      lo[c] = Math.min(lo[c], positions[n + c]);
      hi[c] = Math.max(hi[c], positions[n + c]);
    }

  const gltf = {
    asset: {version: "2.0", generator: "flatten-ground-tiles.mjs"},
    scene: 0,
    scenes: [{nodes: [0]}],
    nodes: [{mesh: 0}],
    meshes: [{primitives: [{attributes: {POSITION: 0, NORMAL: 1, TEXCOORD_0: 2}, indices: 3, material: 0}]}],
    materials: [{
      pbrMetallicRoughness: {baseColorTexture: {index: 0}, metallicFactor: 0, roughnessFactor: 1},
      doubleSided: false
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
  return Buffer.concat([header, chunk(0x4e4f534a, jsonBuf), chunk(0x004e4942, bin)]);
}

// ─── 실행 ─────────────────────────────────────────────────────────────────────
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.toLowerCase().endsWith(".glb")) out.push(full);
  }
  return out;
}

if (!existsSync(SRC)) throw new Error(`${SRC} 가 없습니다`);
let before = 0, after = 0;
console.log(`해상도 ${PX}×${PX}\n`);
for (const inPath of walk(SRC)) {
  const name = basename(inPath);
  const disc = DISC.has(name);
  const baked = bakeTop(inPath);
  // 평면은 GLB 원점(y=0)에 놓는다. 원본은 타일마다 포장면 높이가 제각각이라
  // generate-ground-layout 의 TILE.top 표로 일일이 맞춰 줘야 했는데, 평평해진
  // 다음엔 맞출 요철 자체가 없다 — 전부 top 0 이면 이음매가 완벽히 붙는다.
  const glb = buildGlb({...baked, y: 0, disc});
  const outPath = join(OUT, relative(SRC, inPath));
  mkdirSync(dirname(outPath), {recursive: true});
  writeFileSync(outPath, glb);
  const tris = disc ? DISC_SEGMENTS : 2;
  before += baked.tris;
  after += tris;
  console.log(
    `  ${relative(SRC, inPath).replace(/\\/g, "/").padEnd(24)} ${String(Math.round(baked.tris)).padStart(6)} → ${String(tris).padStart(3)} 삼각형` +
      `   윗면 y ${baked.maxY.toFixed(3)}   ${disc ? "원반" : "평면"}`
  );
}
console.log(`\n합계 ${Math.round(before).toLocaleString()} → ${after} 삼각형`);
console.log(`${OUT} 생성 — 이제 npm run optimize props 로 압축하세요`);
