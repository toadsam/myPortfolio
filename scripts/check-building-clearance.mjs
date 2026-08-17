// 건물을 키우면 어디가 겹치는지 **고치기 전에** 알려준다.
//
// 왜 필요한가: 크기 배율 하나만 바꾸면 27채가 한꺼번에 커지는데 좌표는 그대로라
// 이웃 간 여유가 그만큼 줄어든다. 화면을 띄워 눈으로 찾으면 27×26 쌍을 다
// 확인해야 하고, 지붕이 겹친 건 부감에서 잘 안 보인다. 이건 순수 계산이라 1초다.
//
// 사용법:
//   node scripts/check-building-clearance.mjs             지금 값 그대로
//   node scripts/check-building-clearance.mjs 1.3         건물을 지금의 1.3배로
//   node scripts/check-building-clearance.mjs --spread=1.13 1.3
//                                             간격 1.13배 + 건물 1.3배
//   node scripts/check-building-clearance.mjs --solve     겹침 0 인 조합 찾기
//
// **간격과 크기는 짝으로 움직여야 한다.** 크기만 올리면 바로 겹치고, 간격만
// 벌리면 건물은 그대로인 채 잔디만 넓어진다.
//
// ── 좌표는 두 번 변형된다 (처음에 여기서 틀렸다) ───────────────────────────
// constants.ts 에 적힌 position 은 최종 좌표가 아니다 — applyDistrictOffset 으로
// 구역을 밀고 SPREAD 를 곱한 값이 월드 좌표다. 반면 size 는 BUILDING_SCALE 만
// 탄다. 이 스크립트가 자기 파서를 따로 갖고 있던 동안 그 차이를 놓쳐서, 현재
// 크기에서 이미 24쌍이 겹친다는 엉뚱한 결과를 냈다(실제로는 0쌍).
// 그래서 생성기와 **같은** read-village 를 쓴다. 파서가 하나면 어긋날 일이 없다.

import {chdir} from "node:process";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

// read-village 는 경로를 리포 루트 기준으로 잡는다
chdir(join(dirname(fileURLToPath(import.meta.url)), ".."));
const {readVillage} = await import("./lib/read-village.mjs");

/** 이 값 아래로 붙으면 "너무 좁다"고 본다. 사람이 지나갈 골목 폭. */
const MIN_GAP = 0.9;
/** 캐릭터 키 — characterModels.ts 의 NPC_HEIGHT */
const CHAR = 1.05;

const base = readVillage();

/**
 * 간격 sm 배, 크기 k 배일 때의 건물 표.
 *
 * 간격은 좌표에 그대로 곱하면 된다 — 월드 x 가 이미 (raw+push)×SPREAD 이므로
 * SPREAD 를 sm 배 하는 것과 x 를 sm 배 하는 것이 같다(0.01 반올림 차이뿐).
 */
function variant(sm, k) {
  return base.buildings.map(b => ({
    ...b,
    x: b.x * sm,
    z: b.z * sm,
    w: b.w * k,
    h: b.h * k,
    d: b.d * k
  }));
}

/**
 * 두 건물 사이의 여유(유닛). 축정렬 사각형 기준이라 **회전을 넣기 전인 지금은
 * 정확**하고, 회전을 넣은 뒤에는 살짝 낙관적인 값이 된다(모서리가 튀어나오므로).
 * 그때는 대각선 반경으로 다시 재야 한다.
 */
function gap(a, b) {
  const dx = Math.abs(a.x - b.x) - (a.w + b.w) / 2;
  const dz = Math.abs(a.z - b.z) - (a.d + b.d) / 2;
  // 한 축이라도 떨어져 있으면 안 겹친다. 둘 다 음수면 겹친 깊이가 나온다.
  return Math.max(dx, dz);
}

function pairsOf(list) {
  const out = [];
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const g = gap(list[i], list[j]);
      if (g < MIN_GAP) out.push({a: list[i], b: list[j], g});
    }
  return out.sort((p, q) => p.g - q.g);
}

const args = process.argv.slice(2);

if (args.includes("--moat")) {
  // 마을을 키우면 해자를 넘어가는 건물이 생긴다 — 해자 타원은 고정값이라
  // SPREAD 를 올려도 같이 안 커지기 때문. 실제로 한 번 당했다.
  const src = readFileSync("src/lib/villageRelief.ts", "utf8");
  const m = src.match(
    /MOAT\s*=\s*\{cx:\s*([-\d.]+),\s*cz:\s*([-\d.]+),\s*a:\s*([-\d.]+),\s*b:\s*([-\d.]+)\}/
  );
  if (!m) throw new Error("villageRelief.ts 에서 MOAT 를 못 읽었다");
  const MOAT = {cx: +m[1], cz: +m[2], a: +m[3], b: +m[4]};
  const rows = base.buildings
    .map(b => {
      const r = Math.max(b.w, b.d) / 2;
      // 건물 모서리까지 포함해 가장 불리한 점으로 잰다
      const t = Math.hypot(
        (Math.abs(b.x - MOAT.cx) + r) / MOAT.a,
        (Math.abs(b.z - MOAT.cz) + r) / MOAT.b
      );
      return {id: b.id, t};
    })
    .sort((p, q) => q.t - p.t);
  console.log(
    `해자 타원 a=${MOAT.a} b=${MOAT.b} (1.0 = 해자 위, >1 = 해자 밖)\n`
  );
  for (const o of rows.slice(0, 8))
    console.log(`   ${o.t.toFixed(2)}  ${o.id}`);
  const bad = rows.filter(o => o.t > 0.92).length;
  console.log(
    `\n   해자에 닿거나 넘은 건물: ${bad}채${bad ? "  ← MOAT 를 키울 것" : ""}`
  );
  process.exit(bad ? 1 : 0);
}

const spreadMul =
  Number(args.find(a => a.startsWith("--spread="))?.split("=")[1]) || 1;
const scales = args
  .filter(a => !a.startsWith("--"))
  .map(Number)
  .filter(n => n > 0);
if (scales.length === 0) scales.push(1);

if (args.includes("--solve")) {
  // 크기별로, 겹침이 사라지는 최소 간격배율을 찾는다.
  // 마을이 무한정 퍼지면 부감에서 듬성해지므로 간격은 1.6배까지만 본다.
  console.log(
    `현재 SPREAD ${base.SPREAD} · BUILDING_SCALE ${base.BUILDING_SCALE}`
  );
  console.log("여기서 더 키우려면 간격을 얼마나 벌려야 하나 (겹침 0 기준)\n");
  console.log("   크기   최소간격   최악여유   마을폭    캐릭터대비");
  for (const k of [1.1, 1.2, 1.3, 1.4, 1.5]) {
    let found = null;
    for (let sm = 1; sm <= 1.6001; sm += 0.01) {
      const list = variant(sm, k);
      const worst = Math.min(...pairsOf(list).map(p => p.g), Infinity);
      if (worst >= 0) {
        found = {sm, worst};
        break;
      }
    }
    if (!found) {
      console.log(`   ${k.toFixed(2)}배  1.6배로도 겹침 해소 안 됨`);
      continue;
    }
    const list = variant(found.sm, k);
    const span = Math.max(...list.map(b => Math.hypot(b.x, b.z))) * 2;
    const avgH = list.reduce((s, b) => s + b.h, 0) / list.length;
    console.log(
      `   ${k.toFixed(2)}배  ${found.sm.toFixed(2)}배   ${found.worst
        .toFixed(2)
        .padStart(6)}   ` +
        `${span.toFixed(1)}유닛   ${(avgH / CHAR).toFixed(2)}배`
    );
  }
  console.log("\n   (마을폭 = 가장 먼 건물까지 지름. 섬 지름은 80유닛)");
  process.exit(0);
}

console.log(
  `건물 ${base.buildings.length}채 · 적용 중인 값: SPREAD ${base.SPREAD} · BUILDING_SCALE ${base.BUILDING_SCALE}\n`
);

for (const scale of scales) {
  const list = variant(spreadMul, scale);
  const pairs = pairsOf(list);
  const overlap = pairs.filter(p => p.g < 0);
  const span = Math.max(...list.map(b => Math.hypot(b.x, b.z))) * 2;
  const avgH = list.reduce((s, b) => s + b.h, 0) / list.length;

  const label =
    scale === 1 && spreadMul === 1
      ? "현재"
      : `간격 ×${spreadMul.toFixed(2)} · 크기 ×${scale.toFixed(2)}`;
  console.log(`── ${label} ${"─".repeat(Math.max(0, 46 - label.length))}`);
  console.log(
    `   겹침 ${overlap.length}쌍 · 좁음(<${MIN_GAP}) ${
      pairs.length - overlap.length
    }쌍` +
      ` · 마을폭 ${span.toFixed(1)}유닛 · 캐릭터대비 ${(avgH / CHAR).toFixed(
        2
      )}배`
  );
  for (const p of pairs.slice(0, 10)) {
    console.log(
      `   ${p.g < 0 ? "겹침" : "좁음"} ${p.g.toFixed(2).padStart(6)}  ${
        p.a.id
      } ↔ ${p.b.id}`
    );
  }
  if (pairs.length > 10) console.log(`   … 외 ${pairs.length - 10}쌍`);
  console.log();
}
