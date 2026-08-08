// public/models/<그룹>/raw/ 안의 .glb를 압축해 public/models/<그룹>/ 으로 출력한다.
// 하위 폴더 구조는 그대로 유지한다. 예: props/raw/nature/tree.glb → props/nature/tree.glb
//
// 사용법: Meshy GLB를 raw/ 에 드래그 → `npm run optimize`
//         특정 그룹만: `npm run optimize -- buildings`
//
// ─── 왜 3단계로 도나 ─────────────────────────────────────────────────────────
// gltf-transform의 `optimize --texture-compress webp` 한 방이면 될 일인데,
// 이 환경의 sharp/libvips가 깨져 있어 텍스처 단계에서 죽는다
// (`colourspace: parameter space not set`). 그래서 텍스처만 Pillow로 뺐다.
//
//   ① copy    GLB → .gltf + 텍스처 파일들로 풀기
//   ② python  쓸모없는 맵 삭제 + 예산 해상도로 축소 + JPEG (optimize_textures.py)
//   ③ optimize 지오메트리 Draco 압축 + 고아 리소스 정리 → GLB로 다시 묶기

import {execFileSync, execSync} from "node:child_process";
import {existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync} from "node:fs";
import {tmpdir} from "node:os";
import {basename, dirname, join, relative} from "node:path";

const MODELS = "public/models";
// 예산이 정의된 그룹들 (optimize_textures.py의 BUDGETS와 짝)
const GROUPS = ["buildings", "props", "characters", "environment"];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyGroup = args.find((a) => !a.startsWith("--"));
const root = process.cwd();

// Pillow가 설치된 python을 찾는다. backend/.venv는 백엔드 런타임용이라
// Pillow가 없는 게 정상이므로, venv를 우선하지 말고 "PIL이 되는 쪽"을 고른다.
const venvPython =
  process.platform === "win32"
    ? join(root, "backend", ".venv", "Scripts", "python.exe")
    : join(root, "backend", ".venv", "bin", "python");

function findPython() {
  const candidates = [existsSync(venvPython) ? venvPython : null, "python", "python3"].filter(Boolean);
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["-c", "import PIL"], {stdio: "ignore"});
      return candidate;
    } catch {
      // 이 인터프리터엔 Pillow가 없다 — 다음 후보로
    }
  }
  return null;
}

const python = findPython();
const pillowOk = python !== null;
if (!pillowOk) {
  console.log("\n  ! Pillow가 있는 python을 못 찾았습니다 — 텍스처 최적화를 건너뜁니다.");
  console.log("    pip install Pillow   (지오메트리 압축은 그대로 진행)\n");
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.toLowerCase().endsWith(".glb")) out.push(full);
  }
  return out;
}

// 처리 대상 수집 — 그룹마다 raw/ 하위를 훑는다
const jobs = [];
for (const group of GROUPS) {
  if (onlyGroup && group !== onlyGroup) continue;
  const rawDir = join(MODELS, group, "raw");
  if (!existsSync(rawDir)) continue;
  for (const inPath of walk(rawDir)) {
    jobs.push({group, inPath, outPath: join(MODELS, group, relative(rawDir, inPath))});
  }
}

if (jobs.length === 0) {
  console.log(`\n  최적화할 .glb가 없습니다.`);
  console.log(`  → Meshy GLB를 그룹의 raw 폴더에 넣고 다시 실행하세요. 예:`);
  console.log(`    ${join(MODELS, "buildings", "raw")}\\aclub.glb\n`);
  console.log(`  그룹: ${GROUPS.join(" / ")}\n`);
  process.exit(0);
}

const mb = (p) => statSync(p).size / 1024 / 1024;
const gltf = (args) => execSync(`npx --yes @gltf-transform/cli ${args}`, {stdio: ["ignore", "ignore", "inherit"]});

// 스킨드 메시(캐릭터)는 지오메트리를 건드리는 패스가 골격 바인딩을 깨뜨린다.
// simplify는 정점을 지우면서 뼈 가중치를 뭉개고, join/flatten은 스킨이 기대하는
// 노드 계층을 접어버린다. 캐릭터는 텍스처 축소 + Draco만 태운다.
const SKIN_SAFE = "--simplify false --join false --flatten false";

// 바닥 타일은 평평한 슬래브다. 자갈 요철의 실제 높이는 타일 폭의 1~3%뿐이고
// 눈에 보이는 질감은 전부 노멀맵이 낸다. 그런데 Meshy는 13k tris로 뽑아주고,
// 기본 심플리파이 오차(0.0001)로는 UV 심에 막혀 한 장도 못 줄인다.
// 길 한 줄에 수십 장이 깔리므로 여기만 오차 예산을 크게 준다.
const GROUND_SIMPLIFY = "--simplify-error 0.02 --simplify-ratio 0.05";
const isGroundTile = (inPath) => /[\\/]ground[\\/]/.test(inPath);

// 오차 예산을 더 키워도(0.08) 삼각형이 4895→4819 밖에 안 준다 — UV 심이 많아
// meshoptimizer가 정점을 못 합친다. 풀숲을 100장 넘게 깔아도 InstancedProps가
// 인스턴싱 + 청크 프러스텀 컬링으로 그리므로 그대로 둔다.
function passesFor(group, inPath) {
  if (group === "characters") return SKIN_SAFE;
  if (group === "props" && isGroundTile(inPath)) return GROUND_SIMPLIFY;
  return "";
}

let totalBefore = 0;
let totalAfter = 0;
let skipped = 0;
const failed = [];

for (const {group, inPath, outPath} of jobs) {
  // 이미 최신이면 건너뛴다. 매번 다시 돌리면 JPEG를 재인코딩하게 되고,
  // 재인코딩은 할 때마다 화질을 조금씩 깎아먹는다. 다시 굽고 싶으면 --force.
  if (!force && existsSync(outPath) && statSync(outPath).mtimeMs > statSync(inPath).mtimeMs) {
    skipped += 1;
    continue;
  }

  const before = mb(inPath);
  totalBefore += before;
  console.log(`\n▶ ${group}/${relative(join(MODELS, group, "raw"), inPath)}  (${before.toFixed(2)} MB)`);

  const temp = mkdtempSync(join(tmpdir(), "glb-opt-"));
  try {
    mkdirSync(dirname(outPath), {recursive: true});
    const work = join(temp, "model.gltf");

    // ① 텍스처를 개별 파일로 풀어낸다
    gltf(`copy "${inPath}" "${work}"`);

    // ② 쓸모없는 맵 삭제 + 축소 + JPEG
    if (pillowOk) {
      // PYTHONIOENCODING — 없으면 Windows에서 파이썬이 cp949로 뱉어 한글이 깨진다
      execFileSync(python, [join("scripts", "optimize_textures.py"), work, group], {
        stdio: "inherit",
        env: {...process.env, PYTHONIOENCODING: "utf-8"}
      });
    }

    // ③ Draco + prune(고아 텍스처 정리) → GLB
    //    --texture-compress false: 텍스처는 ②에서 이미 끝냈다 (sharp를 안 타야 함)
    gltf(`optimize "${work}" "${outPath}" --compress draco --texture-compress false ${passesFor(group, inPath)}`);

    const after = mb(outPath);
    totalAfter += after;
    const cut = ((1 - after / before) * 100).toFixed(0);
    console.log(`✔ ${basename(outPath)}  ${before.toFixed(2)} MB → ${after.toFixed(2)} MB  (−${cut}%)`);
  } catch (err) {
    failed.push(relative(root, inPath));
    console.error(`✗ 실패: ${basename(inPath)} — ${err.message.split("\n")[0]}`);
  } finally {
    rmSync(temp, {recursive: true, force: true});
  }
}

const done = jobs.length - failed.length - skipped;
console.log(`\n${"─".repeat(52)}`);
console.log(`  ${done}/${jobs.length}개 처리 · ${totalBefore.toFixed(1)} MB → ${totalAfter.toFixed(1)} MB`);
if (skipped) console.log(`  이미 최신이라 건너뜀: ${skipped}개  (다시 굽기: --force)`);
if (failed.length) console.log(`  실패: ${failed.join(", ")}`);
console.log(`  다음: constants.ts의 glbPath 연결 → 마을에서 F8 계기판으로 확인\n`);
