// 구역 바닥에 깔 **정사각 판석 타일**을 만든다.
//   → public/models/props/ground-flat/paving-square.glb  (2 삼각형)
//
// ─── 왜 만드나 ───────────────────────────────────────────────────────────────
// 컨셉 아트에서 마을이 "지어진 동네"로 보이는 가장 큰 이유는 건물도 나무도 아니라
// **바닥이 돌로 덮여 있다는 것**이다. 구역 안쪽이 통째로 포장이고, 잔디는 그
// 바깥 숲에만 있다. 우리 마을은 정반대였다 — 초록 잔디 벌판에 폭 1.88짜리 길만
// 실처럼 그어져 있어서, 건물을 아무리 정연하게 세워도 "풀밭에 놓인 모형"이었다.
//
// ─── 왜 손그림을 쓰나 ────────────────────────────────────────────────────────
// 처음엔 보로노이로 판석을 절차 생성했다. 이어붙기는 완벽했지만 무늬가 균질해서
// 위에서 보면 자갈을 뿌린 회색 판이었다 — 컨셉 아트의 바닥은 크기가 제각각인
// 판석에 이끼와 잔풀이 낀 그림이다. 절차 생성으로는 그 "손으로 그린 티"가 안 난다.
//
// 그래서 받은 손그림(props/raw/ground/paving-authored.png)에서 윗면을 오려 쓴다.
// 원본 GLB(Mossy_Cobblestone_Tile)를 그대로 쓰지 않는 이유는 값이다 — 한 장이
// 8,476 삼각형이라 386장을 깔면 그것만 327만이다(마을 전체 예산이 100만).
// 그림만 가져와 **삼각형 2개짜리 평면**에 입히면 같은 그림이 사실상 공짜가 된다.
//
// ─── 이음매 ──────────────────────────────────────────────────────────────────
// 손그림은 한 장짜리 슬래브라 그냥 오리면 1.88마다 딱 끊긴다. 오릴 때 오른쪽·
// 아래로 여유를 더 떠서, 왼쪽 띠를 "오른쪽 이웃이 될 화소"와 섞는다. 경계에서
// 정확히 50:50 이 되므로 좌우 끝이 같은 값이 돼 이어붙는다. 자세한 식은 seam() 참고.
//
// 최적화 파이프라인(raw/ → optimize)을 안 탄다 — 태울 게 없다. 정점 4개에
// 텍스처 한 장이고, 그 텍스처도 여기서 최종 형태로 굽는다.
//
// 사용법: node scripts/make-paving-tile.mjs [--px 512]

import {readFileSync, writeFileSync, mkdirSync, existsSync} from "node:fs";
import {deflateSync, inflateSync} from "node:zlib";

const SRC_PNG = "public/models/props/raw/ground/paving-authored.png";
const OUT_GLB = "public/models/props/ground-flat/paving-square.glb";
const pxArg = process.argv.indexOf("--px");
const SIZE = pxArg >= 0 ? Number(process.argv[pxArg + 1]) : 512;

/** 길 타일과 같은 폭이어야 격자에 딱 맞물린다 (generate-ground-layout 의 PITCH) */
const WIDTH = 1.88;

/** 이음매를 녹일 띠 폭 (출력 화소). 넓을수록 이어붙지만 그 띠가 흐려진다.
 *  512분의 26이면 마을 축척으로 9cm — 부감에서 한 화소도 안 된다. */
const SEAM = 26;

// ─── 색 맞추기 ────────────────────────────────────────────────────────────────
// 실측: 길 타일 luma 158 rgb(169,162,103) · 광장 메달리온 172 rgb(193,168,136).
// 포장은 그 사이에 있어야 길과 광장 어느 쪽에도 안 튄다.
/** 길 타일과 광장 사이 밝기. 포장만 밝거나 어두우면 길이 다른 재질로 도드라진다. */
const TARGET_LUMA = 166;
/** 채도. 손그림은 흰 바탕에 렌더한 거라 노란기가 세다 — 그대로 깔면 모래밭이 된다. */
const SATURATION = 0.78;

// ─── PNG 읽기 ─────────────────────────────────────────────────────────────────
// Meshy/ChatGPT 가 내보내는 PNG 는 8비트 트루컬러·비인터레이스라 필터만 풀면 된다.
// (sharp 는 이 환경에서 깨져 있고, Pillow 를 부르자고 파이썬을 띄우기엔 과하다.)
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("PNG 가 아닙니다");
  let off = 8,
    w = 0,
    h = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const tag = buf.slice(off + 4, off + 8).toString("ascii");
    const body = buf.slice(off + 8, off + 8 + len);
    if (tag === "IHDR") {
      w = body.readUInt32BE(0);
      h = body.readUInt32BE(4);
      if (body[8] !== 8 || body[9] !== 2 || body[12] !== 0)
        throw new Error(
          `8비트 트루컬러 비인터레이스만 지원합니다 (bit ${body[8]} color ${body[9]} interlace ${body[12]})`
        );
    } else if (tag === "IDAT") idat.push(body);
    else if (tag === "IEND") break;
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * 3;
  const out = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= 3 ? out[y * stride + i - 3] : 0;
      const b = y > 0 ? out[(y - 1) * stride + i] : 0;
      const c = i >= 3 && y > 0 ? out[(y - 1) * stride + i - 3] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + i] = v & 0xff;
    }
  }
  return {w, h, data: out};
}

// raw/ 는 .gitignore 에 걸려 있어(Meshy GLB 가 장당 25MB라) 이 원본 그림은
// 리포에 안 들어간다. 구운 결과(paving-square.glb)만 커밋되므로 마을은 잘 돌지만,
// 새로 클론한 데서 이 스크립트를 다시 돌리려면 그림을 다시 넣어야 한다.
if (!existsSync(SRC_PNG))
  throw new Error(
    `${SRC_PNG} 가 없습니다.\n` +
      `  손그림 판석 원본(Mossy Cobblestone Tile 렌더 PNG)을 그 경로에 넣고 다시 돌리세요.\n` +
      `  구운 결과 ${OUT_GLB} 는 이미 커밋돼 있으므로, 그림을 바꿀 게 아니면 안 돌려도 됩니다.`
  );
const src = decodePng(readFileSync(SRC_PNG));
const at = (x, y, c) => src.data[(y * src.w + x) * 3 + c];

// ─── 윗면 오려내기 ────────────────────────────────────────────────────────────
// 그림은 흰 바탕에 슬래브 한 장이 떠 있는 렌더다. 흰 배경을 걷어 내 슬래브
// 상자를 찾고, 거기서 다시 안쪽으로 파고든다 — 테두리는 모서리가 둥글고
// 아래쪽에는 슬래브 **옆면**(두께)이 보이므로 그대로 쓰면 타일마다 그 그림자가 찍힌다.
const bbox = (() => {
  let x0 = src.w,
    x1 = 0,
    y0 = src.h,
    y1 = 0;
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      // 배경은 순백에 가깝다. 세 채널이 모두 밝으면 배경으로 본다.
      if (at(x, y, 0) > 240 && at(x, y, 1) > 240 && at(x, y, 2) > 240) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return {x0, x1, y0, y1};
})();

// 상자 안에서 정사각형을 뜬다. 위쪽으로 조금 올려 잡아 아래 옆면을 피한다.
const boxW = bbox.x1 - bbox.x0,
  boxH = bbox.y1 - bbox.y0;
/** 윗면 중 안전하게 평평한 비율 — 둥근 모서리와 옆면을 뺀 값 */
const KEEP = 0.8;
const crop = Math.floor(Math.min(boxW, boxH) * KEEP);
const cx0 = bbox.x0 + Math.floor((boxW - crop) / 2);
const cy0 = bbox.y0 + Math.floor((boxH - crop) / 2) - Math.floor(boxH * 0.03);

// 이음매를 녹이려면 정사각형 **양옆**으로 여유 화소가 필요하다 (아래 fold 참고).
// 여유를 뺀 나머지가 실제 타일 크기다.
const B0 = Math.round((SEAM / SIZE) * crop);
const TILE = Math.min(
  crop - 2 * B0,
  bbox.x1 - cx0 - 2 * B0,
  bbox.y1 - cy0 - 2 * B0
);
if (TILE < 64)
  throw new Error(
    `오려낼 윗면이 너무 작습니다 (${TILE}px) — KEEP 이나 SEAM 을 줄이세요`
  );
const B = B0;

/** 원본에서 (u,v)∈[−B, TILE+B) 를 읽는다 */
const s = (u, v, c) => at(cx0 + B + u, cy0 + B + v, c);

// ─── 이어붙게 만들기 ──────────────────────────────────────────────────────────
// 한 축을 보자. 끝에서 B 화소 안쪽까지만 손대고, 거기서 **반대쪽 이웃이 될 화소**를
// 섞는다:
//   왼쪽 띠  u<B        : a = 0.5·(1 − u/B)   짝 = S(u + TILE)
//   오른쪽 띠 u≥TILE−B  : a = 0.5·(u−(TILE−B))/B  짝 = S(u − TILE)
// 그러면 out(0) 과 out(TILE) 이 둘 다 0.5·S(0) + 0.5·S(TILE) 로 같아져 이어붙는다.
// 가운데(B 바깥)는 a=0 이라 그림이 그대로 남는다.
function fold(u) {
  if (u < B) return {alt: u + TILE, a: 0.5 * (1 - u / B)};
  if (u >= TILE - B) return {alt: u - TILE, a: (0.5 * (u - (TILE - B))) / B};
  return {alt: u, a: 0};
}

// 두 축을 따로 돌리면 네 귀퉁이에서 가중치가 어긋나 모서리에만 얼룩이 남는다.
// 가로·세로 가중치를 곱해 네 화소를 한 번에 섞는다.
const foldU = Array.from({length: TILE}, (_, u) => fold(u));
const foldV = Array.from({length: TILE}, (_, v) => fold(v));
const blended = new Float32Array(TILE * TILE * 3);
for (let v = 0; v < TILE; v++) {
  const fv = foldV[v];
  for (let u = 0; u < TILE; u++) {
    const fu = foldU[u];
    for (let c = 0; c < 3; c++) {
      blended[(v * TILE + u) * 3 + c] =
        s(u, v, c) * (1 - fu.a) * (1 - fv.a) +
        s(fu.alt, v, c) * fu.a * (1 - fv.a) +
        s(u, fv.alt, c) * (1 - fu.a) * fv.a +
        s(fu.alt, fv.alt, c) * fu.a * fv.a;
    }
  }
}
const passB = blended;

// ─── 축소 ─────────────────────────────────────────────────────────────────────
// 상자 필터. 판석 그림은 고주파가 많아 최근접으로 줄이면 줄눈이 끊긴다.
const rgb = Buffer.alloc(SIZE * SIZE * 3);
const scale = TILE / SIZE;
for (let y = 0; y < SIZE; y++) {
  const v0 = Math.floor(y * scale),
    v1 = Math.max(v0 + 1, Math.floor((y + 1) * scale));
  for (let x = 0; x < SIZE; x++) {
    const u0 = Math.floor(x * scale),
      u1 = Math.max(u0 + 1, Math.floor((x + 1) * scale));
    for (let c = 0; c < 3; c++) {
      let sum = 0,
        n = 0;
      for (let v = v0; v < v1; v++)
        for (let u = u0; u < u1; u++) {
          sum += passB[(v * TILE + u) * 3 + c];
          n++;
        }
      rgb[(y * SIZE + x) * 3 + c] = Math.max(
        0,
        Math.min(255, Math.round(sum / n))
      );
    }
  }
}

// ─── 밝기·채도 맞추기 ─────────────────────────────────────────────────────────
// 채도를 먼저 죽이고 밝기를 맞춘다. 순서를 바꾸면 노란기가 남은 채로 밝아져서
// 모래밭이 된다 (실제로 한 번 그렇게 나왔다 — rgb(200,176,130)).
{
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = rgb[i * 3],
      g = rgb[i * 3 + 1],
      b = rgb[i * 3 + 2];
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    rgb[i * 3] = Math.round(grey + (r - grey) * SATURATION);
    rgb[i * 3 + 1] = Math.round(grey + (g - grey) * SATURATION);
    rgb[i * 3 + 2] = Math.round(grey + (b - grey) * SATURATION);
  }
  let luma = 0;
  for (let i = 0; i < SIZE * SIZE; i++)
    luma +=
      0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2];
  luma /= SIZE * SIZE;
  const gain = TARGET_LUMA / luma;
  for (let i = 0; i < SIZE * SIZE * 3; i++)
    rgb[i] = Math.min(255, Math.round(rgb[i] * gain));
  console.log(
    `  밝기 ${luma.toFixed(0)} → ${TARGET_LUMA} (×${gain.toFixed(
      2
    )}) · 채도 ×${SATURATION}`
  );
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

// ─── GLB (정점 4개짜리 사각형 한 장) ──────────────────────────────────────────
const png = encodePng(SIZE, SIZE, rgb);
const H = WIDTH / 2;

const positions = new Float32Array([-H, 0, -H, H, 0, -H, H, 0, H, -H, 0, H]);
const normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
// 감기 방향에 주의 — (0,1,2) 로 감으면 법선이 −Y 라 위에서 봤을 때 뒷면이 된다.
// 마을 카메라는 늘 위에서 내려다보므로 이게 뒤집히면 바닥이 통째로 사라진다.
const indices = new Uint16Array([0, 2, 1, 0, 3, 2]);

const pad4 = n => (n + 3) & ~3;
const parts = [];
let offset = 0;
const views = [];
for (const [data, target] of [
  [Buffer.from(indices.buffer), 34963],
  [Buffer.from(positions.buffer), 34962],
  [Buffer.from(normals.buffer), 34962],
  [Buffer.from(uvs.buffer), 34962],
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

const gltf = {
  asset: {version: "2.0", generator: "make-paving-tile.mjs"},
  scene: 0,
  scenes: [{nodes: [0]}],
  nodes: [{mesh: 0, name: "paving-square"}],
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
      name: "paving",
      pbrMetallicRoughness: {
        baseColorTexture: {index: 0},
        metallicFactor: 0,
        // 젖은 돌처럼 반짝이면 잔디와 안 붙는다. 거의 완전 무광.
        roughnessFactor: 0.95
      }
    }
  ],
  textures: [{source: 0, sampler: 0}],
  // 포장은 여러 장이 이어 붙으므로 UV 가 가장자리에서 반복돼야 이음매가 안 뜬다
  samplers: [{wrapS: 10497, wrapT: 10497}],
  images: [{bufferView: 4, mimeType: "image/png"}],
  accessors: [
    {bufferView: 0, componentType: 5123, count: 6, type: "SCALAR"},
    {
      bufferView: 1,
      componentType: 5126,
      count: 4,
      type: "VEC3",
      min: [-H, 0, -H],
      max: [H, 0, H]
    },
    {bufferView: 2, componentType: 5126, count: 4, type: "VEC3"},
    {bufferView: 3, componentType: 5126, count: 4, type: "VEC2"}
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

mkdirSync("public/models/props/ground-flat", {recursive: true});
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

let sum = [0, 0, 0];
for (let i = 0; i < SIZE * SIZE; i++)
  for (let c = 0; c < 3; c++) sum[c] += rgb[i * 3 + c];
console.log(
  `${OUT_GLB}  ${(png.length / 1024).toFixed(0)}KB 텍스처 · 삼각형 2개`
);
console.log(
  `  손그림 ${src.w}×${src.h} → 윗면 ${TILE}px 오림 → ${SIZE}×${SIZE} · 폭 ${WIDTH} (길 타일과 동일)`
);
console.log(
  `  평균 rgb(${sum.map(v => Math.round(v / (SIZE * SIZE))).join(",")})`
);
