// Meshy에서 애니메이션별로 따로 받은 캐릭터 GLB들을 하나로 합친다.
//
// Meshy는 애니메이션 하나당 GLB 하나를 내주는데, 파일마다 메시와 텍스처가
// 통째로 중복돼 있다 (실측: 루미 5개 파일 35MB 중 다른 건 애니 10~90KB뿐,
// 나머지 6.9MB×5는 같은 복사본. 텍스처 VRAM은 22MB가 아니라 112MB가 된다).
//
// 여기서는 첫 파일을 본체로 삼고 나머지에서 애니메이션 클립만 뽑아 붙인다.
// 뼈대 노드는 파일마다 이름이 같으므로 인덱스가 아니라 "이름"으로 연결한다.
//
// 사용법:
//   node scripts/merge-character.mjs "<입력폴더>" <이름>
//     → public/models/characters/raw/<이름>.glb
//   이어서 `npm run optimize -- characters` 로 텍스처까지 줄인다.

import {execSync} from "node:child_process";
import {existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {basename, join} from "node:path";

const [inputDir, outName] = process.argv.slice(2);

if (!inputDir || !outName) {
  console.log(`\n사용법: node scripts/merge-character.mjs "<입력폴더>" <이름>`);
  console.log(`예:    node scripts/merge-character.mjs "C:/.../루미" lumi\n`);
  process.exit(1);
}
if (!existsSync(inputDir)) {
  console.error(`입력 폴더가 없습니다: ${inputDir}`);
  process.exit(1);
}

const sources = readdirSync(inputDir)
  .filter((f) => f.toLowerCase().endsWith(".glb"))
  .sort();

if (sources.length === 0) {
  console.error(`폴더에 .glb가 없습니다: ${inputDir}`);
  process.exit(1);
}

// "Meshy_AI_Greenleaf_Scout_biped_Animation_Idle_14_withSkin.glb" → "idle_14"
function clipNameFrom(file) {
  let name = basename(file, ".glb");
  const marker = "_Animation_";
  const at = name.indexOf(marker);
  if (at >= 0) name = name.slice(at + marker.length);
  name = name.replace(/_withSkin$/i, "");
  return name.toLowerCase();
}

const gltf = (args) => execSync(`npx --yes @gltf-transform/cli ${args}`, {stdio: ["ignore", "ignore", "inherit"]});
const temp = mkdtempSync(join(tmpdir(), "char-merge-"));

try {
  console.log(`\n▶ ${sources.length}개 파일 병합 — ${outName}`);

  // ── 전부 .gltf로 풀어낸다 (JSON에서 직접 다뤄야 인덱스 재매핑이 가능하다)
  const docs = sources.map((file, i) => {
    const path = join(temp, `src${i}.gltf`);
    gltf(`copy "${join(inputDir, file)}" "${path}"`);
    return {file, path, json: JSON.parse(readFileSync(path, "utf-8")), clip: clipNameFrom(file)};
  });

  // ── 첫 파일이 본체. 메시·스킨·텍스처는 여기 것만 남는다.
  const base = docs[0].json;
  base.animations = base.animations ?? [];
  base.buffers = base.buffers ?? [];
  base.bufferViews = base.bufferViews ?? [];
  base.accessors = base.accessors ?? [];

  // 본체 클립 이름도 파일명 기준으로 통일
  if (base.animations.length > 0) base.animations[0].name = docs[0].clip;
  console.log(`  · ${docs[0].clip.padEnd(28)} (본체 + 클립)`);

  const nodeIndexByName = new Map();
  base.nodes.forEach((node, index) => {
    if (node.name) nodeIndexByName.set(node.name, index);
  });

  let orphanChannels = 0;

  for (const doc of docs.slice(1)) {
    const src = doc.json;
    if (!src.animations?.length) {
      console.log(`  ! ${doc.clip} — 애니메이션이 없어 건너뜁니다`);
      continue;
    }

    // 이 소스의 버퍼들을 본체에 이어붙인다. .bin 파일도 같은 폴더에 있어야 한다.
    const bufferOffset = base.buffers.length;
    for (const buffer of src.buffers ?? []) base.buffers.push({...buffer});

    // 애니메이션이 실제로 참조하는 accessor/bufferView만 복사한다 (메시 데이터는 안 가져옴)
    const bufferViewMap = new Map();
    const accessorMap = new Map();

    const addBufferView = (index) => {
      if (bufferViewMap.has(index)) return bufferViewMap.get(index);
      const view = {...src.bufferViews[index], buffer: bufferOffset + (src.bufferViews[index].buffer ?? 0)};
      base.bufferViews.push(view);
      const next = base.bufferViews.length - 1;
      bufferViewMap.set(index, next);
      return next;
    };
    const addAccessor = (index) => {
      if (accessorMap.has(index)) return accessorMap.get(index);
      const accessor = {...src.accessors[index]};
      if (accessor.bufferView !== undefined) accessor.bufferView = addBufferView(accessor.bufferView);
      base.accessors.push(accessor);
      const next = base.accessors.length - 1;
      accessorMap.set(index, next);
      return next;
    };

    for (const animation of src.animations) {
      const samplers = animation.samplers.map((sampler) => ({
        ...sampler,
        input: addAccessor(sampler.input),
        output: addAccessor(sampler.output)
      }));

      // 채널의 target.node는 소스 기준 인덱스다. 뼈 "이름"으로 본체 인덱스를 찾는다.
      const channels = [];
      for (const channel of animation.channels) {
        const boneName = src.nodes[channel.target.node]?.name;
        const targetIndex = boneName === undefined ? undefined : nodeIndexByName.get(boneName);
        if (targetIndex === undefined) {
          orphanChannels += 1;
          continue;
        }
        channels.push({sampler: channel.sampler, target: {node: targetIndex, path: channel.target.path}});
      }

      base.animations.push({name: doc.clip, channels, samplers});
      console.log(`  · ${doc.clip.padEnd(28)} 채널 ${channels.length}개`);
    }
  }

  if (orphanChannels > 0) {
    console.log(`  ! 본체에 없는 뼈를 가리키는 채널 ${orphanChannels}개를 버렸습니다`);
  }

  // ── 합친 JSON을 쓰고 GLB로 되묶는다.
  //    .bin들은 이미 temp 안에 있으므로 경로가 그대로 맞는다.
  const mergedPath = join(temp, "merged.gltf");
  writeFileSync(mergedPath, JSON.stringify(base));

  const outDir = join("public", "models", "characters", "raw");
  mkdirSync(outDir, {recursive: true});
  const outPath = join(outDir, `${outName}.glb`);
  gltf(`copy "${mergedPath}" "${outPath}"`);

  const totalIn = sources.reduce((sum, f) => sum + statSync(join(inputDir, f)).size, 0);
  const out = statSync(outPath).size;
  console.log(`\n✔ ${outPath}`);
  console.log(`  ${(totalIn / 1024 / 1024).toFixed(2)} MB (${sources.length}개) → ${(out / 1024 / 1024).toFixed(2)} MB · 클립 ${base.animations.length}개`);
  console.log(`\n  다음: npm run optimize -- characters\n`);
} finally {
  rmSync(temp, {recursive: true, force: true});
}
