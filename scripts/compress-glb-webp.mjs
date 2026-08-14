// 서빙되는 GLB 의 **내장 텍스처만** JPEG/PNG → WebP 로 바꾼다. 지오메트리는
// 1바이트도 안 건드린다 — Draco 를 풀었다 다시 묶으면 재양자화로 형태가 미세하게
// 변하는데, 이 방식은 이미지 청크만 갈아 끼우므로 형태 품질이 100% 보존된다.
//
// ── 왜 gltf-transform CLI 가 아닌가 ─────────────────────────────────────────
// `gltf-transform webp` 는 sharp/libvips 를 쓰는데 이 환경에서 깨져 있다
// (`colourspace: parameter space not set` — optimize-glb.mjs 에 같은 기록).
// 그래서 GLB 컨테이너를 직접 열어(JSON 청크 + BIN 청크) 이미지 bufferView 만
// Pillow 로 변환해 다시 묶는다. WebP 텍스처는 glTF 확장 EXT_texture_webp 로
// 선언한다 — three GLTFLoader 가 정식 지원한다.
//
// ── 품질 ────────────────────────────────────────────────────────────────────
// 원본이 이미 JPEG(q85~92)다. WebP 는 같은 화질에서 JPEG 보다 25~40% 작다:
//   노멀맵 q92 (압축 얼룩이 굴곡으로 보이므로 높게 — optimize_textures.py 와 동일)
//   그 외   q85
// 변환 결과가 원본보다 크면 그 이미지는 원본(JPEG/PNG)을 유지한다.
//
// 사용법: node scripts/compress-glb-webp.mjs [--dry]
// 되돌리기: git checkout -- "public/models/**/*.glb"

import {execFileSync} from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";

const DRY = process.argv.includes("--dry");

// 서빙 대상만 — raw/ 는 원본 보관용이라 제외
const DIRS = [
  "public/models/buildings",
  "public/models/props/decor",
  "public/models/props/nature",
  "public/models/props/signs",
  "public/models/props/ground",
  "public/models/props/ground-flat",
  "public/models/props/ground-flat/v2",
  "public/models/props/ground-flat/paved",
  "public/models/props/impostor",
  "public/models/environment",
  "public/models/characters"
];

const JSON_TYPE = 0x4e4f534a;
const BIN_TYPE = 0x004e4942;
const align4 = n => (n + 3) & ~3;

function readGlb(file) {
  const buf = readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("GLB 매직이 아님");
  let off = 12;
  let json = null;
  let bin = null;
  while (off < buf.length) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    const body = buf.subarray(off + 8, off + 8 + len);
    if (type === JSON_TYPE) json = JSON.parse(body.toString("utf8"));
    else if (type === BIN_TYPE) bin = body;
    off += 8 + len;
  }
  return {json, bin};
}

function writeGlb(file, json, bin) {
  const jsonBuf = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPad = align4(jsonBuf.length);
  const binPad = align4(bin.length);
  const total = 12 + 8 + jsonPad + 8 + binPad;
  const out = Buffer.alloc(total, 0);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(jsonPad, 12);
  out.writeUInt32LE(JSON_TYPE, 16);
  jsonBuf.copy(out, 20);
  // JSON 패딩은 공백(0x20)이어야 한다
  for (let i = 20 + jsonBuf.length; i < 20 + jsonPad; i++) out[i] = 0x20;
  out.writeUInt32LE(binPad, 20 + jsonPad);
  out.writeUInt32LE(BIN_TYPE, 24 + jsonPad);
  bin.copy(out, 28 + jsonPad);
  writeFileSync(file, out);
}

// Pillow 가 있는 python (optimize-glb.mjs 와 같은 요령)
function findPython() {
  for (const c of ["python", "python3"]) {
    try {
      execFileSync(c, ["-c", "import PIL"], {stdio: "ignore"});
      return c;
    } catch {
      /* 다음 후보 */
    }
  }
  throw new Error("Pillow 가 있는 python 을 못 찾았습니다");
}
const PYTHON = findPython();

const work = join(tmpdir(), "glb-webp-work");
rmSync(work, {recursive: true, force: true});
mkdirSync(work, {recursive: true});

/** 이미지 여러 장을 python 한 번에 변환한다 — 장마다 프로세스를 띄우면 느리다 */
function convertBatch(jobs) {
  if (!jobs.length) return;
  const script = `
import sys, io
from PIL import Image
for line in sys.stdin.read().splitlines():
    src, dst, q = line.split("\\t")
    im = Image.open(src)
    im.save(dst, "WEBP", quality=int(q), method=6)
`;
  execFileSync(PYTHON, ["-c", script], {
    input: jobs.map(j => `${j.src}\t${j.dst}\t${j.q}`).join("\n"),
    stdio: ["pipe", "inherit", "inherit"]
  });
}

let totalBefore = 0;
let totalAfter = 0;
let filesChanged = 0;
// 임시 파일명은 ASCII 일련번호 — GLB 이름을 쓰면 한글 파일명(바닥.glb)이
// python stdin 인코딩(cp949)에서 깨져 FileNotFoundError 가 난다
let fileSeq = 0;

for (const dir of DIRS) {
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter(f => f.endsWith(".glb"));
  for (const name of files) {
    const file = join(dir, name);
    const before = statSync(file).size;
    let parsed;
    try {
      parsed = readGlb(file);
    } catch (e) {
      console.log(`  건너뜀 ${file}: ${e.message}`);
      continue;
    }
    const {json, bin} = parsed;
    if (!json?.images?.length || !bin) continue;
    // 이미 WebP 면 할 일 없음
    if (json.images.every(im => im.mimeType === "image/webp")) continue;

    // ① 이미지 추출 → 임시 파일
    const seq = fileSeq++;
    const jobs = [];
    json.images.forEach((im, i) => {
      if (im.bufferView === undefined) return;
      if (im.mimeType !== "image/jpeg" && im.mimeType !== "image/png") return;
      const bv = json.bufferViews[im.bufferView];
      const bytes = bin.subarray(
        bv.byteOffset ?? 0,
        (bv.byteOffset ?? 0) + bv.byteLength
      );
      const ext = im.mimeType === "image/png" ? "png" : "jpg";
      const src = join(work, `f${seq}_${i}.${ext}`);
      writeFileSync(src, bytes);
      // 노멀맵은 압축 얼룩이 굴곡으로 보이므로 높게 (optimize_textures.py 와 동일)
      const isNormal = /normal/i.test(im.name ?? "");
      jobs.push({
        i,
        src,
        dst: join(work, `f${seq}_${i}.webp`),
        q: isNormal ? 92 : 85
      });
    });
    if (!jobs.length) continue;
    convertBatch(jobs);

    // ② 더 작아진 것만 채택
    const replaced = new Map();
    for (const j of jobs) {
      const webp = readFileSync(j.dst);
      const bv = json.bufferViews[json.images[j.i].bufferView];
      if (webp.length < bv.byteLength * 0.97) replaced.set(j.i, webp);
    }
    if (!replaced.size) continue;

    // ③ BIN 재조립 — bufferView 를 순서대로 복사하되 교체 이미지는 새 바이트로
    const chunks = [];
    let cursor = 0;
    const viewOwner = new Map(); // bufferView → image index (교체 대상만)
    json.images.forEach((im, i) => {
      if (replaced.has(i)) viewOwner.set(im.bufferView, i);
    });
    json.bufferViews.forEach((bv, vi) => {
      const src = viewOwner.has(vi)
        ? replaced.get(viewOwner.get(vi))
        : bin.subarray(
            bv.byteOffset ?? 0,
            (bv.byteOffset ?? 0) + bv.byteLength
          );
      bv.byteOffset = cursor;
      bv.byteLength = src.length;
      chunks.push(src);
      const padded = align4(src.length);
      if (padded > src.length) chunks.push(Buffer.alloc(padded - src.length));
      cursor += padded;
    });
    const newBin = Buffer.concat(chunks);
    json.buffers[0].byteLength = newBin.length;

    // ④ WebP 선언 — mimeType + EXT_texture_webp (three 가 정식 지원)
    for (const i of replaced.keys()) json.images[i].mimeType = "image/webp";
    for (const tex of json.textures ?? []) {
      if (tex.source === undefined || !replaced.has(tex.source)) continue;
      tex.extensions = {
        ...(tex.extensions ?? {}),
        EXT_texture_webp: {source: tex.source}
      };
      delete tex.source;
    }
    for (const key of ["extensionsUsed", "extensionsRequired"]) {
      json[key] = json[key] ?? [];
      if (!json[key].includes("EXT_texture_webp"))
        json[key].push("EXT_texture_webp");
    }

    if (!DRY) writeGlb(file, json, newBin);
    const after = DRY ? before : statSync(file).size;
    totalBefore += before;
    totalAfter += after;
    filesChanged += 1;
    console.log(
      `  ${file}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(
        0
      )}KB` + ` (이미지 ${replaced.size}/${json.images.length}장 교체)`
    );
  }
}

rmSync(work, {recursive: true, force: true});
console.log(
  `\n합계 ${filesChanged}개 파일: ${(totalBefore / 1048576).toFixed(1)}MB → ${(
    totalAfter / 1048576
  ).toFixed(1)}MB${DRY ? "  (--dry, 파일은 안 씀)" : ""}`
);
