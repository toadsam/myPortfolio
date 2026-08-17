// public/models/buildings/ 에 있는 GLB를 건물 id에 자동으로 붙여 준다.
//
// 왜 필요한가: 건물 27채 중 23채가 아직 절차적 상자다. 하나씩 Meshy로 뽑아 넣을
// 때마다 constants.ts 를 열어 glbPath 한 줄을 손으로 추가해야 했는데, 23번 반복할
// 일이고 파일명 규칙도 제각각이었다(frontend.glb 는 건물 id가 skill-frontend,
// life-values.glb 는 그대로 life-values). 오타 한 번이면 조용히 상자로 남는다.
//
// 규칙은 하나다: **파일명 = 건물 id**.
//   public/models/buildings/skill-3d.glb  →  건물 skill-3d 가 그 모델을 쓴다
//
// 그래서 새 건물을 넣는 절차가 이렇게 줄어든다:
//   ① Meshy GLB를 public/models/buildings/raw/<건물id>.glb 로 저장
//   ② npm run optimize        (끝나면 이 스크립트가 자동으로 돈다)
//   ③ 새로고침
//
// 크기·원점은 안 맞춰도 된다. Building.tsx 의 GlbModel 이 바운딩 박스를 재서
// size[1] 높이에 맞추고 바닥을 y=0으로 끌어올린다.
//
// 사용법: node scripts/generate-building-manifest.mjs [--dry]

import {readFileSync, writeFileSync, existsSync, readdirSync} from "node:fs";
import {basename} from "node:path";

const DIR = "public/models/buildings";
const OUT = "src/data/buildingModels.json";
const CONSTANTS = "src/lib/constants.ts";
const DRY = process.argv.includes("--dry");

// ─── 건물 id 목록 ─────────────────────────────────────────────────────────────
// constants.ts 는 TS라 import 할 수 없어 정규식으로 훑는다 (scripts/lib/read-village.mjs
// 와 같은 방식). id 하나가 곧 건물은 아니라서, size·district 가 같이 있는 것만 친다.
function buildingIds() {
  const source = readFileSync(CONSTANTS, "utf8");
  const ids = [...source.matchAll(/id:\s*"([^"]+)"/g)];
  const out = [];
  for (let n = 0; n < ids.length; n++) {
    const chunk = source.slice(
      ids[n].index,
      n + 1 < ids.length ? ids[n + 1].index : source.length
    );
    if (!/size:\s*\[/.test(chunk) || !/district:\s*"/.test(chunk)) continue;
    out.push(ids[n][1]);
  }
  if (out.length < 20)
    throw new Error(
      `${CONSTANTS} 에서 건물을 ${out.length}채밖에 못 읽었습니다 — 형식이 바뀐 듯합니다`
    );
  return out;
}

const ids = new Set(buildingIds());
const models = {};
const orphans = [];

if (existsSync(DIR)) {
  for (const file of readdirSync(DIR)) {
    if (!file.toLowerCase().endsWith(".glb")) continue;
    const id = basename(file, ".glb");
    if (ids.has(id)) models[id] = `/${DIR.replace(/^public\//, "")}/${file}`;
    else orphans.push(file);
  }
}

// 키를 정렬해 둔다 — 파일 순서에 따라 diff가 흔들리지 않게
const sorted = Object.fromEntries(
  Object.keys(models)
    .sort()
    .map(k => [k, models[k]])
);

const missing = [...ids].filter(id => !(id in sorted));
console.log(
  `건물 ${ids.size}채 중 ${Object.keys(sorted).length}채에 모델이 붙었습니다.`
);
if (missing.length)
  console.log(
    `  아직 상자로 그려지는 건물 ${missing.length}채:\n    ${missing.join(
      ", "
    )}`
  );
if (orphans.length)
  console.log(
    `  ! 건물 id와 이름이 안 맞아 안 붙은 파일 ${
      orphans.length
    }개: ${orphans.join(", ")}\n` +
      `    파일명을 건물 id와 똑같이 바꾸세요 (예: 3d.glb → skill-3d.glb)`
  );

if (DRY) {
  console.log("\n--dry — 파일은 안 건드렸습니다");
} else {
  writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n${OUT} 갱신 완료`);
}
