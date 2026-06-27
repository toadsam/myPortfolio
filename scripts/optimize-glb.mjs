// public/models/props/raw/ 안의 .glb를 압축해 public/models/props/ 로 출력한다.
// 하위 폴더 구조를 그대로 유지한다. 예: raw/buildings/x.glb → props/buildings/x.glb
// 사용법: Meshy GLB를 raw/<카테고리>/ 에 드래그 → `npm run optimize`
// Draco(지오메트리) + webp(텍스처) + 1024 리사이즈로 보통 90~95% 감소.
import {execSync} from "node:child_process";
import {readdirSync, mkdirSync, existsSync, statSync} from "node:fs";
import {join, dirname, relative} from "node:path";

const RAW = "public/models/props/raw";
const OUT = "public/models/props";

mkdirSync(RAW, {recursive: true});
mkdirSync(OUT, {recursive: true});

// raw/ 아래의 모든 .glb를 재귀로 수집
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.toLowerCase().endsWith(".glb")) out.push(full);
  }
  return out;
}

const files = walk(RAW);

if (files.length === 0) {
  console.log(`\n  raw 폴더에 최적화할 .glb가 없습니다.`);
  console.log(`  → Meshy GLB를 카테고리 폴더에 넣고 다시 실행하세요. 예:`);
  console.log(`    ${join(RAW, "buildings")}\\tower.glb\n`);
  process.exit(0);
}

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2);

for (const inPath of files) {
  const rel = relative(RAW, inPath); // 예: buildings/tower.glb
  const outPath = join(OUT, rel);
  mkdirSync(dirname(outPath), {recursive: true});
  const before = mb(inPath);
  console.log(`\n▶ 최적화 중: ${rel}  (${before} MB)`);
  try {
    execSync(
      `npx --yes @gltf-transform/cli optimize "${inPath}" "${outPath}" --compress draco --texture-compress webp --texture-size 1024`,
      {stdio: "inherit"}
    );
    console.log(`✔ 완료: ${outPath}  (${before} MB → ${mb(outPath)} MB)`);
  } catch (err) {
    console.error(`✗ 실패: ${rel} — ${err.message}`);
  }
}

console.log(`\n끝났어요. 편집 모드에서 카테고리별로 배치하면 됩니다.\n`);
