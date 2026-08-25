// 이력서/포트폴리오 카드 이미지 압축.
//
// 왜 있는가: /resume 가 이미지만 59.7 MB 를 내려받고 있었다. 서브 프로젝트
// 썸네일이 2048x2048 PNG(장당 7~10 MB)인데 화면에는 172x107 로 그려진다.
// 전송 포맷(PNG)과 표시 크기가 40배 어긋난 상태였다.
//
// 무엇을 하는가: public/projects/**.{png,jpg} 를 표시 크기의 2배 폭 WebP 로
// 다시 굽고 원본을 대체한다. 원본은 src/assets/images/ 에 그대로 있으므로
// 되돌릴 수 있다. 확장자가 바뀌므로 resume.ts / data.ts 의 경로도 같이 고친다.
//
// 실행: node scripts/optimize-project-images.mjs [--dry]

import {readdir, stat, writeFile, unlink} from "node:fs/promises";
import {join, extname, basename, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const DRY = process.argv.includes("--dry");

// 표시 크기 기준 폭. 카드는 148~172px, 원페이저 갤러리는 더 크므로 넉넉히 2~3배.
const TARGETS = [
  {dir: "public/projects", width: 640, quality: 82},
  {dir: "public/projects/sub", width: 480, quality: 80},
  {dir: "public/projects/op", width: 1200, quality: 82}
];

const KB = n => `${(n / 1024).toFixed(0)} KB`;

async function run() {
  let before = 0;
  let after = 0;
  const renames = [];

  for (const target of TARGETS) {
    const abs = join(root, target.dir);
    let entries;
    try {
      entries = await readdir(abs, {withFileTypes: true});
    } catch {
      continue; // 없는 폴더는 건너뛴다 (op/ 는 있을 수도 없을 수도)
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = extname(entry.name).toLowerCase();
      if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

      const src = join(abs, entry.name);
      const {size} = await stat(src);
      const out = join(abs, `${basename(entry.name, ext)}.webp`);

      const img = sharp(src);
      const meta = await img.metadata();
      // 원본이 이미 목표보다 작으면 확대하지 않는다 — 확대는 용량만 늘린다.
      const width = Math.min(meta.width ?? target.width, target.width);

      const buf = await img
        .resize({width, withoutEnlargement: true})
        .webp({quality: target.quality})
        .toBuffer();

      before += size;
      after += buf.length;
      console.log(
        `${entry.name.padEnd(26)} ${KB(size).padStart(9)} -> ${KB(
          buf.length
        ).padStart(8)}  (${meta.width}x${meta.height} -> ${width}px)`
      );

      if (!DRY) {
        await writeFile(out, buf);
        if (src !== out) await unlink(src);
      }
      renames.push([
        `/${target.dir.replace("public/", "")}/${entry.name}`,
        `/${target.dir.replace("public/", "")}/${basename(
          entry.name,
          ext
        )}.webp`
      ]);
    }
  }

  console.log(
    `\n합계  ${KB(before)} -> ${KB(after)}  (${(
      100 -
      (after / before) * 100
    ).toFixed(1)}% 감소)`
  );
  if (!DRY) {
    await writeFile(
      join(root, ".tmp/image-renames.json"),
      JSON.stringify(renames, null, 2)
    );
    console.log(`경로 변경 ${renames.length}건 -> .tmp/image-renames.json`);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
