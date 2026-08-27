// 이미 병합된 캐릭터(raw/<이름>.glb)에 애니메이션 클립을 **추가**한다.
//
// merge-character.mjs 는 "폴더 통째 병합 + 첫 클립 이름 덮어쓰기"라 기존 캐릭터에
// 클립 하나를 얹는 용도로는 못 쓴다(본체의 첫 클립 이름이 파일명으로 바뀌어
// clipOverrides 가 깨진다). 이 스크립트는 본체 클립을 건드리지 않고,
// Meshy 애니메이션 GLB(withSkin)에서 클립만 뼈 "이름"으로 이어 붙인다.
//
// 사용법:
//   node scripts/add-character-clip.mjs <이름> "<클립.glb>" ["<클립2.glb>" ...]
//     → public/models/characters/raw/<이름>.glb 를 제자리 갱신
//   이어서 `npm run optimize -- characters` 로 배포본을 다시 만든다.

import {execSync} from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import {tmpdir} from "node:os";
import {basename, join} from "node:path";

const [outName, ...clipPaths] = process.argv.slice(2);

if (!outName || clipPaths.length === 0) {
  console.log(
    `\n사용법: node scripts/add-character-clip.mjs <이름> "<클립.glb>" [...]`
  );
  process.exit(1);
}

const basePath = join(
  "public",
  "models",
  "characters",
  "raw",
  `${outName}.glb`
);
if (!existsSync(basePath)) {
  console.error(`본체가 없습니다: ${basePath}`);
  process.exit(1);
}
for (const p of clipPaths)
  if (!existsSync(p)) {
    console.error(`클립 파일이 없습니다: ${p}`);
    process.exit(1);
  }

// "Meshy_AI_Animation_Short_Breathe_and_Look_Around_withSkin (3).glb"
//   → "short_breathe_and_look_around"
function clipNameFrom(file) {
  let name = basename(file, ".glb");
  name = name.replace(/\s*\(\d+\)$/, ""); // 브라우저 중복 다운로드 꼬리표
  const marker = "_Animation_";
  const at = name.indexOf(marker);
  if (at >= 0) name = name.slice(at + marker.length);
  name = name.replace(/_withSkin$/i, "");
  return name.toLowerCase();
}

const gltf = args =>
  execSync(`npx --yes @gltf-transform/cli ${args}`, {
    stdio: ["ignore", "ignore", "inherit"]
  });
const temp = mkdtempSync(join(tmpdir(), "char-addclip-"));

try {
  console.log(`\n▶ ${outName} 에 클립 ${clipPaths.length}개 추가`);

  const unpack = (src, i) => {
    const path = join(temp, `src${i}.gltf`);
    gltf(`copy "${src}" "${path}"`);
    return JSON.parse(readFileSync(path, "utf-8"));
  };

  const base = unpack(basePath, 0);
  base.animations = base.animations ?? [];
  base.buffers = base.buffers ?? [];
  base.bufferViews = base.bufferViews ?? [];
  base.accessors = base.accessors ?? [];
  const existing = new Set(base.animations.map(a => a.name));
  console.log(`  본체 클립: ${[...existing].join(", ")}`);

  const nodeIndexByName = new Map();
  base.nodes.forEach((node, index) => {
    if (node.name) nodeIndexByName.set(node.name, index);
  });

  let orphanChannels = 0;

  clipPaths.forEach((clipPath, i) => {
    const clip = clipNameFrom(clipPath);
    if (existing.has(clip)) {
      console.log(`  ! ${clip} — 이미 있어 건너뜁니다`);
      return;
    }
    const src = unpack(clipPath, i + 1);
    if (!src.animations?.length) {
      console.log(`  ! ${clip} — 애니메이션이 없어 건너뜁니다`);
      return;
    }

    const bufferOffset = base.buffers.length;
    for (const buffer of src.buffers ?? []) base.buffers.push({...buffer});

    const bufferViewMap = new Map();
    const accessorMap = new Map();
    const addBufferView = index => {
      if (bufferViewMap.has(index)) return bufferViewMap.get(index);
      const view = {
        ...src.bufferViews[index],
        buffer: bufferOffset + (src.bufferViews[index].buffer ?? 0)
      };
      base.bufferViews.push(view);
      const next = base.bufferViews.length - 1;
      bufferViewMap.set(index, next);
      return next;
    };
    const addAccessor = index => {
      if (accessorMap.has(index)) return accessorMap.get(index);
      const accessor = {...src.accessors[index]};
      if (accessor.bufferView !== undefined)
        accessor.bufferView = addBufferView(accessor.bufferView);
      base.accessors.push(accessor);
      const next = base.accessors.length - 1;
      accessorMap.set(index, next);
      return next;
    };

    for (const animation of src.animations) {
      const samplers = animation.samplers.map(sampler => ({
        ...sampler,
        input: addAccessor(sampler.input),
        output: addAccessor(sampler.output)
      }));
      const channels = [];
      for (const channel of animation.channels) {
        const boneName = src.nodes[channel.target.node]?.name;
        const targetIndex =
          boneName === undefined ? undefined : nodeIndexByName.get(boneName);
        if (targetIndex === undefined) {
          orphanChannels += 1;
          continue;
        }
        channels.push({
          sampler: channel.sampler,
          target: {node: targetIndex, path: channel.target.path}
        });
      }
      base.animations.push({name: clip, channels, samplers});
      existing.add(clip);
      console.log(`  + ${clip.padEnd(30)} 채널 ${channels.length}개`);
    }
  });

  if (orphanChannels > 0)
    console.log(`  ! 본체에 없는 뼈를 가리키는 채널 ${orphanChannels}개 버림`);

  const mergedPath = join(temp, "merged.gltf");
  writeFileSync(mergedPath, JSON.stringify(base));
  gltf(`copy "${mergedPath}" "${basePath}"`);

  const out = statSync(basePath).size;
  console.log(
    `\n✔ ${basePath} — ${(out / 1024 / 1024).toFixed(2)} MB · 클립 ${
      base.animations.length
    }개`
  );
  console.log(`  다음: npm run optimize -- characters\n`);
} finally {
  rmSync(temp, {recursive: true, force: true});
}
