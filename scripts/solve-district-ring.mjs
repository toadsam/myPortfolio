// 여섯 구역 섬을 **컨셉 이미지의 육각 방위**에 앉힌다 — 구역별 이동 벡터를 구해
// constants.ts 의 districtShift 표에 적는다.
//
// ── 예전과 무엇이 다른가 ────────────────────────────────────────────────────
// 예전 솔버는 "지금 무게중심 방향"을 지키며 반지름만 풀고, 접선 미끄러뜨리기로
// 골짜기를 여는 **탐색**이었다. 컨셉 이미지를 따라가기로 하면서 방위가 목표가
// 됐다: PROJECTS 북 · SKILLS 북동 · LIFE 남동 · CONTACT 남 · STUDY 남서 ·
// EXPERIENCE 북서 (scripts/lib/read-village.mjs 의 TARGET_BEARING).
// 방위가 고정되면 자유도는 반지름 하나뿐이라 탐색이 필요 없다 —
// **섬 안쪽 물가 = DISTRICT_INNER** 가 되도록 대수로 푼다.
//
// ── 판정 단위는 원반 섬이다 ─────────────────────────────────────────────────
// 섬 중심은 hub(고리 배치의 중심, arrange-district-round 가 적는다)이고
// 반지름은 가장 먼 건물 모서리 + 둘레 여유다(discOfDistrict — 바닥 생성기와
// 반드시 같은 식). 건물이 임의 각으로 돌아서 모서리는 OBB 로 잰다.
//
// 사용법:
//   node scripts/solve-district-ring.mjs            현재 상태 + 결과 미리보기
//   node scripts/solve-district-ring.mjs --write     constants.ts 의 표를 갱신
//   node scripts/solve-district-ring.mjs --inner=12  목표 물가 반지름을 바꿔서

import {writeFileSync} from "node:fs";
import {
  readRaw,
  readDistrictInner,
  readDistrictHub,
  readMoat,
  cornersOf,
  discOfDistrict,
  TARGET_BEARING
} from "./lib/read-village.mjs";

const MOAT = readMoat();
const CONSTANTS = "src/lib/constants.ts";
const argv = process.argv.slice(2);
const WRITE = argv.includes("--write");
const INNER = Number(
  argv.find(a => a.startsWith("--inner="))?.slice(8) ?? readDistrictInner()
);
const round2 = v => Math.round(v * 100) / 100;

const {source, SPREAD, BUILDING_SCALE, raw} = readRaw();
const HUB_RAW = readDistrictHub(source);

// 배치 보정 전 월드 좌표 (SPREAD·BUILDING_SCALE 만 적용)
const world = raw.map(b => ({
  id: b.id,
  district: b.district,
  x: b.px * SPREAD,
  z: b.pz * SPREAD,
  w: b.w * BUILDING_SCALE,
  d: b.d * BUILDING_SCALE,
  rotationY: b.rotationY ?? 0
}));

const DIST = {};
for (const b of world) {
  if (b.district === "plaza") continue;
  (DIST[b.district] ??= []).push(b);
}

// ─── 풀기: 섬 물가가 INNER 에 오는 이동 벡터 ─────────────────────────────────
const names = Object.keys(DIST);
const shifts = {};
const discs = {};
for (const d of names) {
  const bearing = TARGET_BEARING[d];
  if (bearing === undefined)
    throw new Error(`TARGET_BEARING 에 ${d} 가 없습니다`);
  if (!HUB_RAW[d]) throw new Error(`districtHub 에 ${d} 가 없습니다`);
  const hub0 = {x: HUB_RAW[d][0] * SPREAD, z: HUB_RAW[d][1] * SPREAD};
  // 반지름은 이동에 불변 — 지금 자리에서 재도 같다
  const r = discOfDistrict(DIST[d], hub0).r;
  // 섬 중심 거리 D: 안쪽 물가 = D − r = INNER
  const D = INNER + r;
  const tx = Math.cos(bearing) * D;
  const tz = Math.sin(bearing) * D;
  shifts[d] = [round2(tx - hub0.x), round2(tz - hub0.z)];
  discs[d] = {x: round2(tx), z: round2(tz), r, district: d};
}

// ─── 평가 ────────────────────────────────────────────────────────────────────
const moved = [];
for (const d of names) {
  const [sx, sz] = shifts[d];
  for (const b of DIST[d]) moved.push({...b, x: b.x + sx, z: b.z + sz});
}

// 골짜기(이웃 원반 사이 물폭)
let gapMin = Infinity;
let gapPair = "";
const ring = Object.values(discs)
  .map(c => ({c, ang: Math.atan2(c.z, c.x)}))
  .sort((p, q) => p.ang - q.ang);
for (let i = 0; i < ring.length; i++) {
  const A = ring[i].c;
  const B = ring[(i + 1) % ring.length].c;
  const g = Math.hypot(A.x - B.x, A.z - B.z) - A.r - B.r;
  if (g < gapMin) {
    gapMin = g;
    gapPair = `${A.district}↔${B.district}`;
  }
}

// 해자 검사 — 모서리(회전 반영)가 타원 0.92 안이어야 한다
const outOfMoat = moved.filter(b =>
  cornersOf(b).some(
    ([x, z]) =>
      Math.hypot((x - MOAT.cx) / MOAT.a, (z - MOAT.cz) / MOAT.b) > 0.92
  )
);
const outer = Math.max(
  ...moved.flatMap(b => cornersOf(b).map(([x, z]) => Math.hypot(x, z)))
);

// ─── 보고 ────────────────────────────────────────────────────────────────────
console.log(`── 육각 방위 배치 (안쪽 물가 ${INNER}) ────────────────`);
for (const {c} of ring) {
  const deg = ((Math.atan2(c.z, c.x) * 180) / Math.PI).toFixed(0);
  console.log(
    `  ${c.district.padEnd(11)} 방위 ${String(deg).padStart(4)}° · ` +
      `섬 r ${c.r.toFixed(1).padStart(4)} · 중심 거리 ${Math.hypot(c.x, c.z)
        .toFixed(1)
        .padStart(5)} · 바깥 물가 ${(Math.hypot(c.x, c.z) + c.r).toFixed(1)}`
  );
}
console.log(
  `  골짜기 최소 ${gapMin.toFixed(
    2
  )} (${gapPair}) · 마을 바깥끝 ${outer.toFixed(1)} · 해자밖 건물 ${
    outOfMoat.length
  }`
);
if (gapMin < 1.0)
  console.error(
    "  ⚠ 골짜기가 좁습니다(1.0 필요) — --inner 를 줄이거나 고리 배치를 좁히세요"
  );
if (outOfMoat.length)
  console.error(
    `  ⚠ 건물이 해자를 넘습니다: ${outOfMoat.map(b => b.id).join(", ")}`
  );

if (WRITE) {
  const order = ring.map(p => p.c.district);
  const body = order
    .map(d => `  ${d}: [${shifts[d][0]}, ${shifts[d][1]}]`)
    .join(",\n");
  const re = /(districtShift[^=]*=\s*\{)[\s\S]*?(\n\};)/;
  if (!re.test(source))
    throw new Error(
      `${CONSTANTS} 의 districtShift 표를 못 찾아 갱신하지 못했습니다`
    );
  const next = source.replace(re, (_, head, tail) => `${head}\n${body}${tail}`);
  writeFileSync(CONSTANTS, next);
  console.log(`\n${CONSTANTS} 의 districtShift 를 갱신했습니다.`);
  console.log(
    "이어서: node scripts/generate-ground-layout.mjs && node scripts/generate-decor-layout.mjs && node scripts/check-village.mjs"
  );
}
