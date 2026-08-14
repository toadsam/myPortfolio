// 구역 안 건물을 **줄**로 세운다 — constants.ts 의 position 좌표를 다시 쓴다.
//
// ── 왜 ──────────────────────────────────────────────────────────────────────
// 컨셉 아트에서 한 구역의 건물들은 앞면을 한 줄로 맞춰 선다. STUDY 는 LIBRARY·
// MUSIC·ALGO DOJO·CS ARCHIVE 넷이 한 줄, SKILLS 는 앞줄 셋 + 뒷줄 셋이다.
// 그 정렬이 "구역"을 구역으로 읽히게 한다.
//
// 지금 좌표는 손으로 찍은 것이라 한 구역 안에서 앞뒤로 15유닛(건물 다섯 채 깊이)
// 까지 흩어져 있다 — 줄이 아니라 덩어리다. 그래서 아무리 색과 조명을 맞춰도
// 배치가 컨셉과 다르게 읽힌다.
//
// ── 왜 회전을 안 쓰나 ───────────────────────────────────────────────────────
// 컨셉의 건물은 저마다 광장 쪽으로 **돌아서** 있다. 그렇게 하려면 건물마다
// rotationY 를 주어야 하는데, 그러면 발자국 상자가 돌아가서 축정렬을 전제로 한
// 곳이 전부 틀어진다 — 건물 겹침 검사·단차 블록(BLOCK_BOX)·걷기 충돌·구역 고리
// 솔버·앞마당 원반. 다섯 군데를 회전 상자로 바꾸는 건 별개의 작업이다.
//
// 대신 **줄 방향을 가까운 축으로 스냅**한다. 구역이 동/서쪽이면 줄은 남북으로,
// 남/북쪽이면 동서로 선다. 축정렬을 유지하면서도 "앞줄이 한 선에 맞는" 효과는
// 그대로 얻는다. 회전은 나중에 따로 올린다.
//
// ── 무엇을 안 건드리나 ──────────────────────────────────────────────────────
// 구역이 광장에서 얼마나 떨어지는지는 여기서 정하지 않는다 — 그건
// solve-district-ring.mjs 가 맡는다. 여기는 **구역 안 모양**만 만들고,
// 구역 덩어리를 고리에 올리는 건 그쪽이다. 그래서 순서가 있다:
//   node scripts/arrange-district-rows.mjs --write
//   node scripts/solve-district-ring.mjs --write
//   node scripts/generate-ground-layout.mjs && node scripts/generate-decor-layout.mjs
//   npm run check:village
//
// 사용법: node scripts/arrange-district-rows.mjs [--write]

import {writeFileSync} from "node:fs";
import {readRaw, readDistrictInner} from "./lib/read-village.mjs";

const CONSTANTS = "src/lib/constants.ts";
const WRITE = process.argv.includes("--write");
const round2 = v => Math.round(v * 100) / 100;

const {source, SPREAD, BUILDING_SCALE, raw} = readRaw();

/** 이웃 건물 사이에 남길 월드 여유. 지금 마을의 최악 여유(0.72)를 기준으로 잡았다. */
const GAP = 0.9;
/** 줄과 줄 사이 여유 — 앞줄 뒤로 사람이 지나갈 만큼.
 *  2.6 이던 걸 3줄이 생기면서 2.1 로 줄였다 — PROJECTS 가 깊이 12.3 이 되어
 *  바깥 건물이 해자를 넘었다. 2.1 이어도 길 폭(1.88)보다 넓어 지나다닌다. */
const ROW_GAP = 2.1;

const DIST = {};
for (const b of raw) {
  if (b.district === "plaza") continue;
  (DIST[b.district] ??= []).push(b);
}

/**
 * 몇 줄로 세울까 — 컨셉의 구역은 **한 줄 아니면 두 줄**이다.
 * (STUDY 는 넷이 한 줄, SKILLS 는 셋+셋 두 줄)
 *
 * 세 줄까지 열어 뒀더니 건물 아홉 채인 PROJECTS 가 3줄이 되면서 구역 깊이가
 * 15유닛으로 늘어, 줄은 맞았는데 덩어리가 더 두꺼워졌다 — 부감에서 얻는 게 없다.
 */
function rowCount(n) {
  // 구역 단이 **원반 섬**이 되면서 기준이 바뀌었다. 원반의 반지름은 덩어리의
  // 반대각선이 정하므로, 같은 넓이면 **정사각형에 가까울수록** 원반이 작다 —
  // 9채를 2줄로 펴면 20×9(반대각 11)지만 3줄이면 12×14(반대각 9.2)다.
  // 예전의 "3줄은 깊이만 는다"는 직사각 단 시절의 판단이라 뒤집는다.
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  // 6채를 2줄(3+3)로 펴면 12×9 — 원반 r 이 11.7 이 되어 이웃과 겹쳤다(실측).
  // 3줄(2+2+2)이면 8×11 로 더 정사각형이라 원반이 작아진다.
  return 3;
}

/**
 * 한 구역을 줄로 세운 결과. `depthOnX` 는 줄이 어느 축으로 서는지다
 * (true = 깊이가 X, 줄은 남북).
 */
function layout(arr, depthOnX) {
  // 월드 기준으로 계산한다 — 좌표는 SPREAD, 치수는 BUILDING_SCALE 로 배율이 달라
  // 원본 좌표에서 여유를 재면 틀린다.
  const w = arr.map(b => ({
    id: b.id,
    x: b.px * SPREAD,
    z: b.pz * SPREAD,
    w: b.w * BUILDING_SCALE,
    d: b.d * BUILDING_SCALE,
    h: b.h * BUILDING_SCALE
  }));
  const cx = w.reduce((s, b) => s + b.x, 0) / w.length;
  const cz = w.reduce((s, b) => s + b.z, 0) / w.length;

  // 바깥 방향 — 광장에서 구역 쪽으로
  const len = Math.hypot(cx, cz) || 1;
  const ux = cx / len;
  const uz = cz / len;

  const depthSign = depthOnX ? Math.sign(ux) || 1 : Math.sign(uz) || 1;
  /** 건물의 "깊이 방향 두께"와 "줄 방향 폭" */
  const depthOf = b => (depthOnX ? b.w : b.d);
  const widthOf = b => (depthOnX ? b.d : b.w);

  // 큰 것을 뒤로 — 앞줄이 뒷줄을 가리지 않게. 높이가 같으면 폭이 넓은 쪽이 뒤로.
  const order = [...w].sort((a, b) => b.h - a.h || b.w * b.d - a.w * a.d);
  const rows = rowCount(w.length);
  const perRow = Math.ceil(w.length / rows);
  /** rows-1 번이 가장 뒤(바깥)쪽 줄 */
  const buckets = Array.from({length: rows}, () => []);
  order.forEach((b, i) => buckets[rows - 1 - Math.floor(i / perRow)].push(b));

  // 각 줄 안에서는 원래 있던 줄 방향 순서를 지킨다 — 손으로 잡아 둔 좌우 관계
  // (예: 프로젝트 구역에서 어느 건물이 왼쪽이었나)를 굳이 뒤집을 이유가 없다.
  const tangential = b => (depthOnX ? b.z : b.x);
  for (const row of buckets) row.sort((a, b) => tangential(a) - tangential(b));

  // 깊이: 앞줄부터 차곡차곡. 줄의 두께는 그 줄에서 가장 두꺼운 건물이 정한다.
  const rowDepth = buckets.map(row => Math.max(...row.map(depthOf)));
  const rowAt = [];
  let acc = 0;
  for (let r = 0; r < rows; r++) {
    rowAt.push(acc + rowDepth[r] / 2);
    acc += rowDepth[r] + ROW_GAP;
  }
  // 구역 무게중심이 제자리에 남도록 가운데를 맞춘다 (구역 각도가 안 틀어진다)
  const mid = acc === 0 ? 0 : (acc - ROW_GAP) / 2;

  const out = [];
  for (let r = 0; r < rows; r++) {
    const row = buckets[r];
    // 줄 방향으로 폭을 다 더하고 가운데 정렬
    const total =
      row.reduce((s, b) => s + widthOf(b), 0) + GAP * (row.length - 1);
    let cur = -total / 2;
    for (const b of row) {
      const t = cur + widthOf(b) / 2;
      cur += widthOf(b) + GAP;
      const depth = (rowAt[r] - mid) * depthSign;
      const nx = depthOnX ? cx + depth : cx + t;
      const nz = depthOnX ? cz + t : cz + depth;
      out.push({id: b.id, x: nx, z: nz});
    }
  }
  return {out, depthOnX, rows, cx, cz, ux, uz};
}

// ─── 줄 방향은 구역마다 따로 정할 수 없다 ────────────────────────────────────
// 처음엔 구역마다 "바깥 방향에 가까운 축"으로 각자 정했다. 그랬더니 서쪽에 나란히
// 있는 STUDY 와 EXPERIENCE 가 **둘 다 남북으로 길쭉해져 맞붙었다** — 골짜기가
// 0 이 되어 물길이 아예 못 지나간다. 45° 근처 구역은 어느 축으로 눕히든 각도상
// 비슷해서, 혼자 보면 어느 쪽이 나은지 알 수 없다.
//
// 구역이 여섯이니 조합은 64가지뿐이다. 전부 만들어 보고 **골짜기가 가장 넓은
// 조합**을 고른다.
const PITCH = 1.88; // generate-ground-layout 의 격자 — 단차 블록이 여기에 스냅된다
const HALF = PITCH / 2;
const INNER = readDistrictInner();

/** 구역 하나의 단차 블록 — generate-ground-layout.mjs 의 BLOCK_BOX 와 같은 계산 */
function blockOf(list) {
  let i0 = Infinity,
    i1 = -Infinity,
    j0 = Infinity,
    j1 = -Infinity;
  for (const b of list) {
    i0 = Math.min(i0, Math.floor((b.x - b.w / 2) / PITCH));
    i1 = Math.max(i1, Math.ceil((b.x + b.w / 2) / PITCH));
    j0 = Math.min(j0, Math.floor((b.z - b.d / 2) / PITCH));
    j1 = Math.max(j1, Math.ceil((b.z + b.d / 2) / PITCH));
  }
  return {
    x0: i0 * PITCH - HALF,
    x1: i1 * PITCH + HALF,
    z0: j0 * PITCH - HALF,
    z1: j1 * PITCH + HALF
  };
}
function blockGap(A, B) {
  const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0) > 0;
  const oz = Math.min(A.z1, B.z1) - Math.max(A.z0, B.z0) > 0;
  if (!ox && !oz) return Infinity;
  return Math.max(
    Math.max(B.x0 - A.x1, A.x0 - B.x1, 0),
    Math.max(B.z0 - A.z1, A.z0 - B.z1, 0)
  );
}

/**
 * 그 조합의 골짜기 최소폭. 구역을 안쪽 끝이 INNER 에 오도록 방사로만 옮겨 본다 —
 * 접선 미끄러뜨리기는 solve-district-ring 이 나중에 더 해 주므로, 여기서는
 * 조합끼리 견주기만 하면 된다.
 */
function valleyOf(combo) {
  const blocks = [];
  for (const [district, arr] of Object.entries(DIST)) {
    const lay = layout(arr, combo[district]);
    const sized = lay.out.map(o => {
      const src = arr.find(b => b.id === o.id);
      return {
        x: o.x,
        z: o.z,
        w: src.w * BUILDING_SCALE,
        d: src.d * BUILDING_SCALE
      };
    });
    const inner = Math.min(
      ...sized.map(b =>
        Math.hypot(
          Math.max(Math.abs(b.x) - b.w / 2, 0),
          Math.max(Math.abs(b.z) - b.d / 2, 0)
        )
      )
    );
    const t = INNER - inner;
    blocks.push(
      blockOf(
        sized.map(b => ({...b, x: b.x + lay.ux * t, z: b.z + lay.uz * t}))
      )
    );
  }
  let min = Infinity;
  for (let i = 0; i < blocks.length; i++)
    for (let j = i + 1; j < blocks.length; j++)
      min = Math.min(min, blockGap(blocks[i], blocks[j]));
  return min;
}

const names = Object.keys(DIST);
let best = null;
for (let mask = 0; mask < 1 << names.length; mask++) {
  const combo = Object.fromEntries(
    names.map((d, i) => [d, ((mask >> i) & 1) === 1])
  );
  const v = valleyOf(combo);
  if (!best || v > best.v) best = {combo, v};
}

const plan = {};
for (const [district, arr] of Object.entries(DIST))
  plan[district] = layout(arr, best.combo[district]);
console.log(
  `줄 방향 조합 ${
    1 << names.length
  }가지 중 골짜기가 가장 넓은 것 선택 — 최소 ${best.v.toFixed(2)}\n`
);

// ─── 보고 ───────────────────────────────────────────────────────────────────
const moved = new Map();
for (const p of Object.values(plan)) for (const b of p.out) moved.set(b.id, b);

// "줄이 맞았나" 는 **줄 방향에 수직인 좌표**가 얼마나 같은지로 잰다.
// 광장에서의 거리로 재면 줄이 몇 개인지가 같이 섞여서(3줄이면 당연히 깊다)
// 정렬이 좋아졌는데 숫자는 나빠지는 일이 생긴다.
const depthSpread = (arr, get, depthOnX) => {
  const f = arr.map(b => {
    const m = get(b);
    return depthOnX ? m.x : m.z;
  });
  return Math.max(...f) - Math.min(...f);
};

console.log("줄 정렬 — 줄 방향에 수직인 좌표가 몇 개로 모이나");
for (const [d, arr] of Object.entries(DIST)) {
  const p = plan[d];
  const before = depthSpread(
    arr,
    b => ({x: b.px * SPREAD, z: b.pz * SPREAD}),
    p.depthOnX
  );
  const after = depthSpread(arr, b => moved.get(b.id), p.depthOnX);
  // 줄 자리가 실제로 몇 군데인지 (한 줄이면 1, 두 줄이면 2 여야 한다)
  const lines = new Set(
    arr.map(
      b =>
        Math.round((p.depthOnX ? moved.get(b.id).x : moved.get(b.id).z) * 2) / 2
    )
  );
  console.log(
    `  ${d.padEnd(11)}${String(arr.length).padStart(2)}채  ${p.rows}줄 · 줄은 ${
      p.depthOnX ? "남북" : "동서"
    }으로` +
      `   깊이 ${before.toFixed(1).padStart(5)} → ${after
        .toFixed(1)
        .padStart(4)}` +
      `   줄 자리 ${arr.length}곳 → ${lines.size}곳`
  );
}

// 겹침 확인 (구역 안에서만 — 구역끼리는 solve-district-ring 이 본다)
let overlap = 0;
for (const [, p] of Object.entries(plan)) {
  const list = p.out.map(o => ({...o, ...raw.find(r => r.id === o.id)}));
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i],
        b = list[j];
      if (
        Math.abs(a.x - b.x) < ((a.w + b.w) * BUILDING_SCALE) / 2 - 1e-6 &&
        Math.abs(a.z - b.z) < ((a.d + b.d) * BUILDING_SCALE) / 2 - 1e-6
      )
        overlap++;
    }
}
console.log(`\n구역 안 건물 겹침 ${overlap}쌍`);

if (WRITE) {
  // position 리터럴만 골라 바꾼다. id 뒤 첫 position 이 그 건물의 것이다.
  let next = source;
  let n = 0;
  for (const [id, at] of moved) {
    const rx = round2(at.x / SPREAD);
    const rz = round2(at.z / SPREAD);
    const re = new RegExp(
      `(id:\\s*"${id}"[\\s\\S]{0,600}?position:\\s*\\[)\\s*-?[\\d.]+\\s*,\\s*(-?[\\d.]+)\\s*,\\s*-?[\\d.]+(\\s*\\])`
    );
    if (!re.test(next)) throw new Error(`${id} 의 position 을 못 찾았습니다`);
    next = next.replace(re, `$1${rx}, $2, ${rz}$3`);
    n++;
  }
  writeFileSync(CONSTANTS, next);
  console.log(`\n${CONSTANTS} 의 건물 좌표 ${n}개를 다시 썼습니다.`);
  console.log("이어서: node scripts/solve-district-ring.mjs --write");
}
