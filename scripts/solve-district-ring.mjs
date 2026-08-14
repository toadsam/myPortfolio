// 여섯 구역을 "같은 고리" 위에 올린다 — 구역별 이동 벡터를 구해 constants.ts 에 적는다.
//
// ── 왜 이게 필요한가 ────────────────────────────────────────────────────────
// 컨셉 아트의 마을은 광장을 중심으로 구역들이 한 고리에 얹혀 있다. 지금 마을은
// 구역이 광장에서 시작하는 거리가 제각각이다: LIFE 9.2, SKILLS 11.9,
// EXPERIENCE 18.7, CONTACT 26.5. 광장과 EXPERIENCE 사이에 9칸짜리 빈 잔디가
// 있으니 "여섯 구역이 광장을 두른다"로 안 읽히고, 구역들을 잇는 순환 도로가
// 지나갈 일정한 띠도 없다.
//
// ── 왜 무게중심이 아니라 안쪽 가장자리인가 ──────────────────────────────────
// 무게중심을 맞추면 건물이 9채인 PROJECTS 와 1채인 CONTACT 가 같은 자리에서
// 시작할 수 없다(덩어리 크기가 다르니까). 고리로 읽히게 하는 건 **안쪽 끝**이다.
// 바깥 끝은 구역이 큰 만큼 뻗어도 자연스럽다 — 컨셉 아트도 그렇다.
//
// ── 왜 표를 파일에 적는가 ───────────────────────────────────────────────────
// 예전엔 배치 규칙(applyDistrictOffset)이 constants.ts 와 read-village.mjs 에
// 각각 구현돼 있었다. 규칙이 바뀔 때마다 두 곳을 같이 고쳐야 하고, 한 번이라도
// 빠뜨리면 앱과 생성기가 서로 다른 마을을 본다. 계산은 이 파일에만 두고
// **결과 벡터만** constants.ts 에 표로 적는다. 앱도 생성기도 그 표를 읽기만 한다.
//
// 사용법:
//   node scripts/solve-district-ring.mjs            현재 상태 + 후보 훑기
//   node scripts/solve-district-ring.mjs --write     constants.ts 의 표를 갱신
//   node scripts/solve-district-ring.mjs --inner=12  목표 거리를 바꿔서

import {readFileSync, writeFileSync} from "node:fs";
import {
  readRaw,
  readDistrictInner,
  readMoat,
  blockOf
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

// 배치 보정 전 월드 좌표 (SPREAD 만 적용).
// 90도로 돌아선 건물은 월드 폭/깊이가 맞바뀐다 — readVillage 와 같은 규칙.
// 여기서 안 바꾸면 솔버만 돌기 전 발자국으로 풀어서, 검사(돈 발자국)와 0.2쯤
// 어긋난 고리가 나온다(실제로 experience 가 15.7 vs 목표 15.5 로 걸렸다).
const world = raw.map(b => {
  const quarter = Math.abs(Math.abs(b.rotationY ?? 0) - Math.PI / 2) < 0.1;
  const [w, d] = quarter ? [b.d, b.w] : [b.w, b.d];
  return {
    id: b.id,
    district: b.district,
    x: b.px * SPREAD,
    z: b.pz * SPREAD,
    w: w * BUILDING_SCALE,
    d: d * BUILDING_SCALE
  };
});

const DIST = {};
for (const b of world) {
  if (b.district === "plaza") continue;
  (DIST[b.district] ??= []).push(b);
}

/** 구역이 광장에서 시작하는 거리 = 건물 상자 중 원점에 가장 가까운 모서리까지 */
const innerEdge = (arr, [sx, sz] = [0, 0]) =>
  Math.min(
    ...arr.map(b =>
      Math.hypot(
        Math.max(Math.abs(b.x + sx) - b.w / 2, 0),
        Math.max(Math.abs(b.z + sz) - b.d / 2, 0)
      )
    )
  );

/** 미는 방향 — 구역 무게중심 쪽 (광장에서 곧게 바깥으로) */
function direction(arr) {
  const cx = arr.reduce((s, b) => s + b.x, 0) / arr.length;
  const cz = arr.reduce((s, b) => s + b.z, 0) / arr.length;
  const len = Math.hypot(cx, cz) || 1;
  return [cx / len, cz / len];
}

/**
 * 구역을 (접선 u, 방사 t) 만큼 **평행이동**한 결과.
 *
 * 회전은 쓰지 않는다. 건물이 전부 축정렬(rotationY 없음)이라 구역만 돌리면
 * 처마와 줄이 격자에서 어긋나 오히려 "삐뚤어져" 보인다. 평행이동은 건물 방향을
 * 건드리지 않으므로 손으로 다듬어 둔 구역 내부 배치가 그대로 보존된다.
 */
function place(arr, {u = 0, t = 0} = {}) {
  const [ux, uz] = direction(arr);
  const sx = ux * t - uz * u; // 접선은 반지름에 수직
  const sz = uz * t + ux * u;
  return arr.map(b => ({...b, x: b.x + sx, z: b.z + sz}));
}
const shiftVec = (arr, {u = 0, t = 0}) => {
  const [ux, uz] = direction(arr);
  return [round2(ux * t - uz * u), round2(uz * t + ux * u)];
};

/**
 * 접선 위치 u 를 정해 두고, 안쪽 끝이 목표 거리에 오도록 방사 이동 t 를 구한다.
 *
 * 가장 안쪽 모서리가 정확히 반지름 방향에 있지는 않아서 "이동량 = 목표 − 현재"가
 * 딱 맞지 않는다. 한 번 옮기면 어느 건물이 가장 안쪽인지도 바뀔 수 있다. 그래서
 * 옮겨 보고 남은 차이를 다시 더하는 식으로 돌린다 — 6~8회면 0.001 이하로 붙는다.
 */
function solveT(arr, target, u) {
  let t = 0;
  for (let i = 0; i < 32; i++) {
    const err = target - innerEdge(place(arr, {u, t}));
    if (Math.abs(err) < 1e-4) break;
    t += err;
  }
  return t;
}

// ─── 평가: 이 배치가 마을을 깨뜨리지 않는지 ─────────────────────────────────
//
// 판정 기준은 건물 상자가 아니라 **단차 블록**이다. 블록은 구역 건물들을 감싼
// 축정렬 사각형을 격자(PITCH)에 스냅해서 만드는데, 스냅이 양옆으로 조금씩 불려
// 놓는다. 건물 사이가 4.7 남아도 블록끼리는 훨씬 좁게 맞닿을 수 있다 — 실제로
// 그렇게 됐고, 맞닿으면 골짜기가 사라져 물길이 아예 생성되지 않는다.
// 계산은 read-village.mjs 의 blockOf 하나뿐이다 — 바닥 생성기도 같은 걸 쓴다.

// ─── 판정 단위가 사각 블록에서 **원반 섬**으로 바뀌었다 ─────────────────────
// 단이 원반이 되면서(generate-ground-layout 의 ISLAND) 구역의 몸집은 사각형이
// 아니라 "블록 중심에서 가장 먼 건물 모서리 + 둘레 여유(1.5)"의 원이다.
// 사각형으로 재면 **대각선 방향 몸집을 몰라** 원반끼리 겹친다 — 실제로
// study↔experience 가 0.99 겹친 채 통과했다. 원반 공식은 바닥 생성기와
// 반드시 같아야 한다.
const ISLAND_PAD = 1.5;
function discOf(arr) {
  const b = blockOf(arr);
  const cx = (b.x0 + b.x1) / 2;
  const cz = (b.z0 + b.z1) / 2;
  let r = 0;
  for (const q of arr)
    r = Math.max(
      r,
      Math.hypot(Math.abs(q.x - cx) + q.w / 2, Math.abs(q.z - cz) + q.d / 2)
    );
  return {x: cx, z: cz, r: r + ISLAND_PAD};
}
/** 원반 사이 골짜기 폭 — 멀리 떨어진 쌍(8 이상)은 골짜기를 공유하지 않는다 */
function discGap(A, B) {
  const g = Math.hypot(A.x - B.x, A.z - B.z) - A.r - B.r;
  return g > 8 ? Infinity : g;
}

function evaluate(plan) {
  const set = {};
  for (const [d, arr] of Object.entries(DIST)) set[d] = place(arr, plan[d]);
  const moved = Object.values(set).flat();

  let overlap = 0;
  for (let i = 0; i < moved.length; i++)
    for (let j = i + 1; j < moved.length; j++) {
      const a = moved[i],
        b = moved[j];
      if (
        Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1e-6 &&
        Math.abs(a.z - b.z) < (a.d + b.d) / 2 - 1e-6
      )
        overlap++;
    }

  const discs = Object.entries(set).map(([d, arr]) => [d, discOf(arr)]);
  let gap = Infinity,
    pair = "";
  for (let i = 0; i < discs.length; i++)
    for (let j = i + 1; j < discs.length; j++) {
      const g = discGap(discs[i][1], discs[j][1]);
      if (g < gap) {
        gap = g;
        pair = `${discs[i][0]}↔${discs[j][0]}`;
      }
    }
  const outer = Math.max(
    ...moved.map(b => Math.hypot(b.x, b.z) + Math.max(b.w, b.d) / 2)
  );

  // 섬이 광장 쪽으로 내려오는 한계 — **건물이 아니라 이 값**이 광장과 물 고리가
  // 쓸 수 있는 띠를 정한다. 원반은 대각선 몸집까지 포함하므로 건물 안쪽 끝보다
  // 더 안쪽까지 내려온다.
  const blockInner = Math.min(
    ...discs.map(([, c]) => Math.max(0, Math.hypot(c.x, c.z) - c.r))
  );

  // 해자를 넘는 건물 (check-village.mjs 의 ② 와 같은 판정)
  const outOfMoat = moved.filter(b => {
    const r = Math.max(b.w, b.d) / 2;
    return (
      Math.hypot(
        (Math.abs(b.x - MOAT.cx) + r) / MOAT.a,
        (Math.abs(b.z - MOAT.cz) + r) / MOAT.b
      ) > 0.92
    );
  }).length;

  return {overlap, gap, pair, outer, blockInner, outOfMoat};
}

const names = Object.keys(DIST);

/** 접선 위치가 정해지면 방사 이동은 목표 거리가 결정한다 */
const planFrom = (target, us) =>
  Object.fromEntries(
    names.map(d => [d, {u: us[d], t: solveT(DIST[d], target, us[d])}])
  );

/**
 * 구역을 옆으로 미끄러뜨려 골짜기를 연다.
 *
 * 여섯 구역을 같은 고리에 올리면 이웃끼리 가까워지는데, 단차 블록이 격자에 스냅된
 * 축정렬 사각형이라 서로 맞닿기 쉽다(CONTACT 와 LIFE 는 37° 밖에 안 떨어져 있다).
 * 좌표 하나씩 훑어 내려가며 "가장 좁은 골짜기"를 넓히는 쪽으로 조금씩 민다.
 */
// ─── 골짜기만 넓히면 광장이 좁아진다 ────────────────────────────────────────
// 오래 목표가 "가장 좁은 골짜기를 넓히는 것" 하나였다. 그런데 골짜기를 벌리려고
// 구역을 접선으로 밀면 **축정렬 사각형의 모서리가 광장 쪽으로 돌아 나온다.**
// SKILLS(−35°)가 그랬다: 골짜기는 7.5 로 넓은데 블록 모서리가 광장에서 9.7 까지
// 내려와, 물 고리가 그 방향에서만 9.2 → 6.8 로 파이고 광장 단상도 같이 잘렸다.
//
// 골짜기는 물길이 지나갈 만큼만 있으면 되고(2.2), 그 위로 더 넓혀 봐야 얻는 게
// 없다. 그래서 **골짜기를 충분한 선까지만 벌리고, 남는 자유도는 광장 쪽 여유
// (blockInner)를 넓히는 데 쓴다.**
const GAP_ENOUGH = 4.0;
/** 이 배치가 얼마나 좋은가 — 클수록 좋다 */
const scoreOf = e =>
  Math.min(e.gap, GAP_ENOUGH) * 2 + e.blockInner;

function optimise(target) {
  const us = Object.fromEntries(names.map(d => [d, 0]));
  let best = evaluate(planFrom(target, us));
  // 사각 블록 시절엔 출발 배치가 늘 "겹침 없음"이라 좋은 수만 받으면 됐다.
  // 원반은 대각선 몸집이 커서 **출발부터 겹친다** — 그때 "골짜기 ≥ 2.2" 문을
  // 걸어 두면 한 발짝도 못 떼고 그대로 끝난다(실제로 contact↔life 가 −5 인 채
  // 여섯 목표 거리 전부 제자리였다). 그래서 두 단계다:
  //   겹친 동안은 골짜기가 넓어지는 수라면 무엇이든 받고,
  //   풀린 뒤에는 예전처럼 점수 오르는 수만 받는다.
  const feasible = e => e.gap >= 2.2;
  for (let step = 4.8; step > 0.05; step *= 0.6)
    for (let round = 0; round < 8; round++) {
      let improved = false;
      for (const d of names)
        for (const dir of [1, -1]) {
          const trial = {...us, [d]: us[d] + dir * step};
          const e = evaluate(planFrom(target, trial));
          if (e.overlap !== 0) continue; // 건물끼리 겹치는 수는 늘 무효
          const take = feasible(best)
            ? feasible(e) && scoreOf(e) > scoreOf(best) + 1e-4
            : e.gap > best.gap + 1e-4;
          if (take) {
            us[d] = trial[d];
            best = e;
            improved = true;
          }
        }
      if (!improved) break;
    }
  return {us, plan: planFrom(target, us), e: best};
}

// ─── 보고 ───────────────────────────────────────────────────────────────────
const order = names
  .slice()
  .sort(
    (a, b) =>
      Math.atan2(...direction(DIST[a]).reverse()) -
      Math.atan2(...direction(DIST[b]).reverse())
  );

console.log("── 지금: 구역이 광장에서 시작하는 거리 ─────────────");
for (const d of order)
  console.log(
    `  ${d.padEnd(11)} ${innerEdge(DIST[d]).toFixed(2).padStart(6)}   ${
      DIST[d].length
    }채`
  );
console.log(
  `  → 편차 ${(
    Math.max(...order.map(d => innerEdge(DIST[d]))) -
    Math.min(...order.map(d => innerEdge(DIST[d])))
  ).toFixed(1)}칸`
);

if (!WRITE) {
  console.log("\n── 목표 거리별 결과 (접선 미끄러뜨리기 포함) ────────");
  for (let t = 10; t <= 15; t += 0.5) {
    const {e} = optimise(t);
    console.log(
      `  안쪽끝 ${t.toFixed(1)}  겹침 ${String(e.overlap).padStart(
        2
      )}  골짜기 ${e.gap.toFixed(2).padStart(5)} (${e.pair.padEnd(21)})  ` +
        `단이 내려오는 한계 ${e.blockInner
          .toFixed(1)
          .padStart(4)}  바깥끝 ${e.outer.toFixed(1)}  해자밖 ${e.outOfMoat}`
    );
  }
}

const {plan, e} = optimise(INNER);
const shifts = Object.fromEntries(
  names.map(d => [d, shiftVec(DIST[d], plan[d])])
);
console.log(`\n── 선택: 안쪽끝 ${INNER} ────────────────────────────`);
for (const d of order) {
  const [sx, sz] = shifts[d];
  const {u, t} = plan[d];
  console.log(
    `  ${d.padEnd(11)} [${sx.toFixed(2).padStart(6)}, ${sz
      .toFixed(2)
      .padStart(6)}]  ` +
      `${t >= 0 ? "바깥" : "안쪽"}으로 ${Math.abs(t).toFixed(1)}` +
      (Math.abs(u) > 0.05 ? ` · 옆으로 ${Math.abs(u).toFixed(1)}` : "")
  );
}
console.log(
  `  건물겹침 ${e.overlap} · 골짜기 최소 ${e.gap.toFixed(2)} (${e.pair}) · ` +
    `단이 내려오는 한계 ${e.blockInner.toFixed(
      1
    )} · 마을 바깥끝 ${e.outer.toFixed(1)} · 해자밖 ${e.outOfMoat}`
);
if (e.overlap) console.error("  ⚠ 건물이 겹칩니다 — 목표 거리를 바꾸세요");
if (e.gap < 2.2)
  console.error("  ⚠ 골짜기가 좁아 물길이 못 지나갑니다(2.2 필요)");
if (e.outOfMoat) console.error("  ⚠ 건물이 해자를 넘습니다");

if (WRITE) {
  const body = order
    .map(d => `  ${d}: [${shifts[d][0]}, ${shifts[d][1]}]`)
    .join(",\n");
  const next = source.replace(
    /(districtShift[^=]*=\s*\{)[\s\S]*?(\n\};)/,
    (_, head, tail) => `${head}\n${body}${tail}`
  );
  if (next === source)
    throw new Error(
      `${CONSTANTS} 의 districtShift 표를 못 찾아 갱신하지 못했습니다`
    );
  writeFileSync(CONSTANTS, next);
  console.log(`\n${CONSTANTS} 의 districtShift 를 갱신했습니다.`);
  console.log(
    "이어서: node scripts/generate-ground-layout.mjs && node scripts/generate-decor-layout.mjs && node scripts/check-village.mjs"
  );
}
