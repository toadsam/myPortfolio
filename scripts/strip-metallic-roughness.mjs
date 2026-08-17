// 배포 GLB에서 metallicRoughness 텍스처를 도려낸다.
//
// ── 왜 ───────────────────────────────────────────────────────────────────────
// villageMaterial.ts 가 마을 전체에 같은 빛 반응을 강제하면서 런타임에
// metalnessMap / roughnessMap 을 **null 로 밀어버린다**(그 파일의 "roughness 맵을
// 버리는 근거" 주석 참고). 그런데 파일에는 그대로 남아 있어서, 브라우저가
// 내려받아 WebP 디코딩까지 마친 뒤 그대로 버린다. 순수한 낭비다.
//
//   · 다운로드   −2.7MB (이미지 바이트의 12%)
//   · WebP 디코딩 98회 감소 → 첫 로딩이 빨라진다
//   · VRAM       −약 58MB
//   · 화질       **변화 없음** — 애초에 안 쓰던 맵이다
//
// ── 왜 gltf-transform 을 안 쓰고 직접 자르나 ────────────────────────────────
// `gltf-transform copy` 는 KHR_draco_mesh_compression 을 **풀어버린다**
// (579KB → 958KB). 다시 감으면 양자화가 두 번 걸려 지오메트리가 미세하게 뭉갠다.
// 여기서 필요한 건 JSON 몇 줄과 이미지 바이트를 들어내는 것뿐이라, Draco 블록은
// 손대지 않고 바이너리를 그대로 재조립한다.
//
// 사용법: node scripts/strip-metallic-roughness.mjs [--dry]

import {readdirSync, readFileSync, statSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const dry = process.argv.includes("--dry");
// 검증용으로 다른 폴더를 지정할 수 있다: node scripts/strip-... <dir>
const MODELS =
  process.argv.slice(2).find(a => !a.startsWith("--")) ?? "public/models";

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

function listGlb(dir) {
  let out = [];
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "raw") continue; // 원본은 건드리지 않는다
      out = out.concat(listGlb(p));
    } else if (e.name.endsWith(".glb")) out.push(p);
  }
  return out;
}

/** 텍스처 인덱스 → 그 텍스처가 가리키는 image 인덱스들(확장 포함) */
function imagesOfTexture(tex) {
  const out = [];
  if (tex.source !== undefined) out.push(tex.source);
  for (const ext of Object.values(tex.extensions ?? {}))
    if (ext && ext.source !== undefined) out.push(ext.source);
  return out;
}

/** 재질이 참조하는 모든 텍스처 인덱스 (MR 슬롯은 제외하고 셀 수 있게 분리) */
function textureRefs(material, {includeMR}) {
  const out = [];
  const pbr = material.pbrMetallicRoughness;
  if (pbr?.baseColorTexture) out.push(pbr.baseColorTexture.index);
  if (includeMR && pbr?.metallicRoughnessTexture)
    out.push(pbr.metallicRoughnessTexture.index);
  for (const k of ["normalTexture", "occlusionTexture", "emissiveTexture"])
    if (material[k]) out.push(material[k].index);
  for (const ext of Object.values(material.extensions ?? {}))
    for (const v of Object.values(ext ?? {}))
      if (v && typeof v === "object" && v.index !== undefined)
        out.push(v.index);
  return out;
}

function strip(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32LE(0) !== GLB_MAGIC) return null;

  const jsonLen = buf.readUInt32LE(12);
  if (buf.readUInt32LE(16) !== CHUNK_JSON) return null;
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));

  const binHeader = 20 + jsonLen;
  if (
    binHeader + 8 > buf.length ||
    buf.readUInt32LE(binHeader + 4) !== CHUNK_BIN
  )
    return null;
  const binLen = buf.readUInt32LE(binHeader);
  const bin = buf.subarray(binHeader + 8, binHeader + 8 + binLen);

  const materials = json.materials ?? [];
  const textures = json.textures ?? [];
  const images = json.images ?? [];

  // ① MR 참조를 지운다
  let dropped = 0;
  for (const mat of materials) {
    if (mat.pbrMetallicRoughness?.metallicRoughnessTexture) {
      delete mat.pbrMetallicRoughness.metallicRoughnessTexture;
      dropped += 1;
    }
  }
  if (!dropped) return {path, skipped: true};

  // ② 아무도 안 쓰게 된 텍스처/이미지를 추린다.
  //    (다른 슬롯과 공유하는 텍스처는 그대로 남는다 — 참조를 세서 판단한다)
  const texUsed = new Set();
  for (const mat of materials)
    for (const i of textureRefs(mat, {includeMR: true})) texUsed.add(i);

  const keepTex = textures.map((_, i) => texUsed.has(i));
  const imgUsed = new Set();
  textures.forEach((t, i) => {
    if (keepTex[i]) for (const s of imagesOfTexture(t)) imgUsed.add(s);
  });
  const keepImg = images.map((_, i) => imgUsed.has(i));

  // ③ 살아남는 bufferView 만 모아 BIN 을 다시 만든다.
  //    이미지가 아닌 bufferView(Draco 블록·accessor)는 **바이트 그대로** 옮긴다.
  const views = json.bufferViews ?? [];
  const viewDead = new Set();
  images.forEach((img, i) => {
    if (!keepImg[i] && img.bufferView !== undefined)
      viewDead.add(img.bufferView);
  });

  const viewMap = new Map();
  const chunks = [];
  let offset = 0;
  views.forEach((v, i) => {
    if (viewDead.has(i)) return;
    const start = v.byteOffset ?? 0;
    const slice = bin.subarray(start, start + v.byteLength);
    // glTF 는 bufferView 시작을 4바이트 정렬로 요구한다
    const pad = (4 - (offset % 4)) % 4;
    if (pad) {
      chunks.push(Buffer.alloc(pad));
      offset += pad;
    }
    viewMap.set(i, {index: chunks.length, byteOffset: offset});
    chunks.push(slice);
    offset += slice.length;
  });

  const newViews = [];
  const viewIndex = new Map();
  views.forEach((v, i) => {
    if (viewDead.has(i)) return;
    viewIndex.set(i, newViews.length);
    newViews.push({...v, byteOffset: viewMap.get(i).byteOffset});
  });

  // ④ bufferView 를 가리키는 모든 곳을 새 인덱스로 갈아끼운다
  const remapView = (obj, key) => {
    if (obj && obj[key] !== undefined) {
      const next = viewIndex.get(obj[key]);
      if (next === undefined) delete obj[key];
      else obj[key] = next;
    }
  };
  for (const acc of json.accessors ?? []) {
    remapView(acc, "bufferView");
    if (acc.sparse) {
      remapView(acc.sparse.indices, "bufferView");
      remapView(acc.sparse.values, "bufferView");
    }
  }
  for (const mesh of json.meshes ?? [])
    for (const prim of mesh.primitives ?? [])
      for (const ext of Object.values(prim.extensions ?? {}))
        remapView(ext, "bufferView");

  // ⑤ 이미지·텍스처 배열을 압축하고 참조를 갈아끼운다
  const imgIndex = new Map();
  const newImages = [];
  images.forEach((img, i) => {
    if (!keepImg[i]) return;
    imgIndex.set(i, newImages.length);
    const next = {...img};
    remapView(next, "bufferView");
    newImages.push(next);
  });

  const texIndex = new Map();
  const newTextures = [];
  textures.forEach((t, i) => {
    if (!keepTex[i]) return;
    texIndex.set(i, newTextures.length);
    const next = {...t};
    if (next.source !== undefined) next.source = imgIndex.get(next.source);
    if (next.extensions) {
      next.extensions = {...next.extensions};
      for (const [k, v] of Object.entries(next.extensions))
        if (v && v.source !== undefined)
          next.extensions[k] = {...v, source: imgIndex.get(v.source)};
    }
    newTextures.push(next);
  });

  const remapTex = slot => {
    if (slot && slot.index !== undefined) slot.index = texIndex.get(slot.index);
  };
  for (const mat of materials) {
    remapTex(mat.pbrMetallicRoughness?.baseColorTexture);
    for (const k of ["normalTexture", "occlusionTexture", "emissiveTexture"])
      remapTex(mat[k]);
    for (const ext of Object.values(mat.extensions ?? {}))
      for (const v of Object.values(ext ?? {}))
        if (v && typeof v === "object" && v.index !== undefined) remapTex(v);
  }

  json.images = newImages;
  json.textures = newTextures;
  json.bufferViews = newViews;

  const newBin = Buffer.concat(chunks);
  json.buffers = [{byteLength: newBin.length}];

  // 더 이상 안 쓰는 확장은 선언에서 뺀다 (WebP 이미지가 전부 사라진 경우 등)
  const stillWebp = newImages.some(i => i.mimeType === "image/webp");
  if (!stillWebp && json.extensionsUsed)
    json.extensionsUsed = json.extensionsUsed.filter(
      e => e !== "EXT_texture_webp"
    );

  // ⑥ GLB 재조립 (청크는 각각 4바이트 정렬, JSON 은 공백, BIN 은 0 으로 패딩)
  let jsonBuf = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);
  const binPad = (4 - (newBin.length % 4)) % 4;
  const binBuf = binPad
    ? Buffer.concat([newBin, Buffer.alloc(binPad)])
    : newBin;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(GLB_MAGIC, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binBuf.length, 8);

  const jsonHead = Buffer.alloc(8);
  jsonHead.writeUInt32LE(jsonBuf.length, 0);
  jsonHead.writeUInt32LE(CHUNK_JSON, 4);
  const binHead = Buffer.alloc(8);
  binHead.writeUInt32LE(binBuf.length, 0);
  binHead.writeUInt32LE(CHUNK_BIN, 4);

  const out = Buffer.concat([header, jsonHead, jsonBuf, binHead, binBuf]);
  return {
    path,
    before: buf.length,
    after: out.length,
    dropped,
    imagesRemoved: images.length - newImages.length,
    out
  };
}

const files = listGlb(MODELS);
let before = 0,
  after = 0,
  touched = 0,
  imgs = 0;
const failed = [];

for (const f of files) {
  let r;
  try {
    r = strip(f);
  } catch (err) {
    failed.push(`${f} — ${err.message}`);
    continue;
  }
  if (!r || r.skipped) continue;
  before += r.before;
  after += r.after;
  imgs += r.imagesRemoved;
  touched += 1;
  if (!dry) writeFileSync(f, r.out);
}

console.log(
  `${dry ? "[미리보기] " : ""}GLB ${touched}/${
    files.length
  }개 수정 · 이미지 ${imgs}장 제거`
);
console.log(
  `  ${(before / 1048576).toFixed(2)} MB → ${(after / 1048576).toFixed(
    2
  )} MB  (−${(((before - after) / before) * 100).toFixed(1)}%)`
);
if (failed.length) {
  console.log(`\n실패 ${failed.length}건:`);
  for (const f of failed) console.log(`  ${f}`);
}
