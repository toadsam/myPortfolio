// 마을이 스스로 모순되지 않는지 한 번에 검사한다.
//
// 배치를 바꾸면(건물 크기·간격·해자·섬) 서로 다른 파일에 흩어진 값들이 조용히
// 어긋난다. 오늘만 해도 해자 사본이 생성기에 따로 있어 나무 55그루가 물에
// 잠겼고, 물길 끝 반지름이 27 로 박혀 있어 개울이 벌판에서 끊겼다.
// 화면으로 찾으면 오래 걸리고 놓치기 쉬우니, 계산으로 끝나는 것은 전부 여기서 본다.
//
// 사용법: npm run check:village
// 실패가 있으면 종료 코드 1 — 생성기를 돌린 뒤 습관처럼 같이 돌리면 된다.
//
// 그냥 `node scripts/check-village.mjs` 로는 안 된다. 마지막 검사가 앱의
// villageWalk.ts 를 **그대로 불러** 쓰기 때문에 타입 제거와 별칭 해석이 필요하다
// (scripts/lib/ts-loader.mjs). 규칙을 베껴 적는 대신 진짜 코드를 부르는 쪽이,
// 검사기가 앱과 다른 마을을 보면서 "통과"라고 말하는 사고를 막는다.

import {readFileSync} from "node:fs";
import {readVillage, readMoat, readIsland} from "./lib/read-village.mjs";

const {buildings, DISTRICT_INNER} = readVillage();
const MOAT = readMoat();
const ISLAND = readIsland();
const layout = JSON.parse(readFileSync("src/data/propsLayout.json", "utf8"));
const terraces = JSON.parse(
  readFileSync("src/data/villageTerraces.json", "utf8")
);

let failed = 0;
const check = (name, ok, detail) => {
  console.log(
    `  ${ok ? "OK  " : "실패"} ${name}${detail ? "  — " + detail : ""}`
  );
  if (!ok) failed++;
};

// ─── 해자 폴리라인 (VillageScene 의 Waterways 와 같은 식) ────────────────────
function moatLine() {
  const STEPS = 132,
    pts = [];
  for (let s = 0; s <= STEPS; s++) {
    const t = s / STEPS,
      ang = t * Math.PI * 2 - Math.PI / 2;
    const drift = Math.sin(ang * 3 + 0.7) * 1.4 + Math.sin(ang * 7) * 0.5;
    const c = Math.cos(ang),
      si = Math.sin(ang);
    const nx = c / MOAT.a,
      nz = si / MOAT.b,
      nl = Math.hypot(nx, nz) || 1;
    pts.push({
      x: MOAT.cx + c * MOAT.a + (nx / nl) * drift,
      z: MOAT.cz + si * MOAT.b + (nz / nl) * drift,
      half: 1.1 * (0.82 + 0.3 * Math.sin(t * Math.PI * 10 + 1.9))
    });
  }
  return pts;
}
const LINE = moatLine();
const inMoat = (x, z) => {
  let best = Infinity,
    half = 1;
  for (const q of LINE) {
    const d = Math.hypot(x - q.x, z - q.z);
    if (d < best) {
      best = d;
      half = q.half;
    }
  }
  return best < half;
};

console.log("── 마을 정합성 검사 ────────────────────────────────\n");

// ① 건물끼리 안 겹치나
{
  let overlap = 0,
    worst = Infinity;
  for (let i = 0; i < buildings.length; i++)
    for (let j = i + 1; j < buildings.length; j++) {
      const a = buildings[i],
        b = buildings[j];
      const g = Math.max(
        Math.abs(a.x - b.x) - (a.w + b.w) / 2,
        Math.abs(a.z - b.z) - (a.d + b.d) / 2
      );
      if (g < 0) overlap++;
      worst = Math.min(worst, g);
    }
  check(
    "건물 겹침",
    overlap === 0,
    `겹침 ${overlap}쌍 · 최소여유 ${worst.toFixed(2)}`
  );
}

// ② 건물이 해자 밖으로 나가지 않았나
{
  const out = buildings.filter(b => {
    const r = Math.max(b.w, b.d) / 2;
    return (
      Math.hypot(
        (Math.abs(b.x - MOAT.cx) + r) / MOAT.a,
        (Math.abs(b.z - MOAT.cz) + r) / MOAT.b
      ) > 0.92
    );
  });
  check(
    "건물이 해자 안",
    out.length === 0,
    out.length ? out.map(b => b.id).join(", ") : "27채 모두"
  );
}

// ③ 해자가 잔디 원반 안에 있나 — 넘으면 물이 절벽 위 허공에 흐른다
{
  const outer = Math.max(MOAT.a, MOAT.b) + 1.9 + 1.23;
  const room = ISLAND.r - outer;
  check(
    "해자 ⊂ 잔디 원반",
    room > 2,
    `원반 ${ISLAND.r} · 해자 바깥끝 ${outer.toFixed(1)} · 여유 ${room.toFixed(
      1
    )}`
  );
}

// ④ 물에 잠긴 프롭 — 물가에 놓으라고 만든 것만 예외
//
// 예전엔 임계값이 "3개 이하"였다. 폭포 3개가 해자 위에 서 있는 게 정상인데
// 그걸 잠긴 것으로 세면서 숫자로 눈감아 준 것이라, 진짜로 빠진 프롭이
// 세 개까지는 조용히 통과했다. 예외는 개수가 아니라 이름으로 적는다.
//
// **해자만 보면 안 된다.** 골짜기를 물로 채운 뒤로 마을 안쪽에도 물이 생겼는데
// 이 검사는 해자만 봤다 — 석호에 프롭이 빠져도 조용히 통과했다. 앱의 판정을
// 그대로 부른다(규칙을 베껴 적으면 언젠가 갈라진다).
{
  const EXEMPT =
    /^decor-(island-north|pagoda-portfolio|waterfall-|bridge-|quay-rock-)/;
  const {isWater} = await import("../src/lib/villageTerrain.ts");
  const sunk = layout.props.filter(
    p =>
      !EXEMPT.test(p.id) &&
      (inMoat(p.position[0], p.position[2]) ||
        isWater(p.position[0], p.position[2]))
  );
  check(
    "물에 안 잠긴 프롭",
    sunk.length === 0,
    sunk.length
      ? `${sunk.length}개: ${sunk
          .slice(0, 5)
          .map(p => p.id)
          .join(", ")}`
      : "없음"
  );
}

// ⑤ 섬 밖(허공)에 심긴 프롭
{
  const off = layout.props.filter(
    p =>
      Math.hypot(p.position[0] - ISLAND.cx, p.position[2] - ISLAND.cz) >
      ISLAND.r
  );
  check(
    "프롭이 섬 안",
    off.length === 0,
    off.length ? `${off.length}개` : `${layout.props.length}개 모두`
  );
}

// ⑥ 물길이 광장에서 나와 해자까지 닿나
{
  const chs = terraces.channels ?? [];
  const rMoatAt = (x, z) => {
    const ang = Math.atan2(z, x),
      c = Math.cos(ang),
      s = Math.sin(ang);
    const A = (c * c) / (MOAT.a * MOAT.a) + (s * s) / (MOAT.b * MOAT.b);
    const B =
      (-2 * MOAT.cx * c) / (MOAT.a * MOAT.a) +
      (-2 * MOAT.cz * s) / (MOAT.b * MOAT.b);
    const C =
      (MOAT.cx * MOAT.cx) / (MOAT.a * MOAT.a) +
      (MOAT.cz * MOAT.cz) / (MOAT.b * MOAT.b) -
      1;
    return (-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A);
  };
  const gaps = chs.map(ch => {
    const e = ch[ch.length - 1];
    return rMoatAt(e.x, e.z) - Math.hypot(e.x, e.z);
  });
  const worst = gaps.length ? Math.max(...gaps) : Infinity;
  check(
    "물길이 해자까지",
    chs.length > 0 && worst < 2.5,
    `${chs.length}줄기 · 해자와 최대 ${
      gaps.length ? worst.toFixed(1) : "-"
    } 남음`
  );
}

// ⑥-2 마을 속 물(석호) — 껍질이 있고, 광장 섬이 서 있고, 사방에 다리가 있나
{
  const hull = terraces.lagoon ?? [];
  const dais = terraces.plazaDais ?? [];
  const rr = dais.map(p => Math.hypot(p.x, p.z));
  const hullR = hull.map(p => Math.hypot(p.x, p.z));
  check(
    "마을 속 물(석호)",
    hull.length >= 3 && dais.length > 8,
    hull.length < 3
      ? "없음 — generate-ground-layout.mjs 를 돌리세요"
      : `껍질 ${hull.length}각형 r ${Math.min(...hullR).toFixed(1)}~${Math.max(
          ...hullR
        ).toFixed(1)} · 광장 섬 r ${Math.min(...rr).toFixed(1)}~${Math.max(
          ...rr
        ).toFixed(1)}`
  );

  // 물을 건너는 다리가 사방으로 갈려 있어야 한 방향만 뚫린 게 아니다
  const bridges = layout.props.filter(p => /^decor-bridge-cross-/.test(p.id));
  const quads = new Set(
    bridges.map(
      p =>
        Math.round(
          (Math.atan2(p.position[2], p.position[0]) / (Math.PI / 2) + 4) % 4
        ) % 4
    )
  );
  check(
    "물을 건너는 다리",
    bridges.length >= 6 && quads.size >= 4,
    `${bridges.length}개 · 사방 ${quads.size}/4`
  );

  // ─── 이웃 구역마다 직통 다리 ────────────────────────────────────────────────
  // 고리에서 이웃한 여섯 쌍 각각에, 두 단의 가장 가까운 점을 잇는 선 근처(2.6)
  // 건널목이 있어야 한다. 광장을 거치지 않는 순환 동선의 보증이다.
  {
    const ring = (terraces.islands ?? [])
      .map(isl => ({isl, ang: Math.atan2(isl.z, isl.x)}))
      .sort((p, q) => p.ang - q.ang);
    const missing = [];
    for (let i = 0; i < ring.length; i++) {
      const A = ring[i].isl;
      const B = ring[(i + 1) % ring.length].isl;
      // 원끼리 가장 가까운 점 쌍 — 중심을 잇는 선 위
      const cx = B.x - A.x;
      const cz = B.z - A.z;
      const cd = Math.hypot(cx, cz) || 1;
      const ux = cx / cd;
      const uz = cz / cd;
      const pA = {x: A.x + ux * A.r, z: A.z + uz * A.r};
      const pB = {x: B.x - ux * B.r, z: B.z - uz * B.r};
      const dx = pB.x - pA.x;
      const dz = pB.z - pA.z;
      const l2 = dx * dx + dz * dz;
      if (l2 < 0.25) continue; // 맞닿아 있다 — 다리 불필요
      const near = (terraces.crossings ?? []).some(c => {
        const t = Math.max(
          0,
          Math.min(1, ((c.x - pA.x) * dx + (c.z - pA.z) * dz) / l2)
        );
        return (
          Math.hypot(c.x - (pA.x + dx * t), c.z - (pA.z + dz * t)) < 2.6
        );
      });
      if (!near) missing.push(`${A.district}↔${B.district}`);
    }
    check(
      "이웃 구역마다 다리",
      missing.length === 0,
      missing.length ? `빠진 곳: ${missing.join(", ")}` : `${ring.length}쌍 모두`
    );
  }
}

// ⑦ 구역 단 사이에 골짜기가 남아 있나 — 맞닿으면 물길도 축대도 안 보인다
{
  // 골짜기가 "보이려면" 축대 두 벽 사이에 최소한 한 칸은 있어야 한다.
  // 0.01 로 재면 0.02 짜리 실틈도 통과라고 나오는데, 그건 화면에서 그냥
  // 맞닿은 것과 똑같이 보인다. 눈에 보이는 폭을 기준으로 삼는다.
  const NEED_VALLEY = 1.0;
  const b = terraces.islands ?? [];
  const tight = [];
  for (let i = 0; i < b.length; i++)
    for (let j = i + 1; j < b.length; j++) {
      const A = b[i],
        B = b[j];
      // 원반이라 골짜기 폭 = 중심 거리 − 두 반지름. 멀리 떨어진 쌍(폭 8 이상)은
      // 골짜기를 공유하지 않으니 안 본다.
      const gap = Math.hypot(A.x - B.x, A.z - B.z) - A.r - B.r;
      if (gap > 8) continue;
      if (gap < NEED_VALLEY)
        tight.push(`${A.district}↔${B.district}(${gap.toFixed(2)})`);
    }
  check(
    "구역 단 사이 골짜기",
    tight.length === 0,
    tight.length
      ? `너무 좁음: ${tight.join(", ")}`
      : `마주보는 구역 모두 ${NEED_VALLEY} 이상`
  );
}

// ⑧ 구역 이동 표가 낡지 않았나 — 여섯 구역이 정말 같은 고리에서 시작하나
//
// constants.ts 의 districtShift 는 solve-district-ring.mjs 가 적어 주는 **계산 결과**다.
// 건물 크기(BUILDING_SCALE)나 SPREAD, 구역 구성을 바꾸고 솔버를 다시 안 돌리면
// 표만 옛 값으로 남아 구역이 고리에서 벗어난다 — 화면으로는 알아채기 어렵고,
// 순환 도로가 지나갈 띠도 조용히 사라진다.
{
  const by = {};
  for (const b of buildings) {
    if (b.district === "plaza") continue;
    (by[b.district] ??= []).push(b);
  }
  const edges = Object.entries(by).map(([d, arr]) => [
    d,
    Math.min(
      ...arr.map(b =>
        Math.hypot(
          Math.max(Math.abs(b.x) - b.w / 2, 0),
          Math.max(Math.abs(b.z) - b.d / 2, 0)
        )
      )
    )
  ]);
  const off = edges.filter(([, e]) => Math.abs(e - DISTRICT_INNER) > 0.05);
  check(
    "구역이 같은 고리에서 시작",
    off.length === 0,
    off.length
      ? `${off
          .map(([d, e]) => `${d} ${e.toFixed(1)}`)
          .join(
            ", "
          )} (목표 ${DISTRICT_INNER}) — node scripts/solve-district-ring.mjs --write`
      : `${edges.length}구역 모두 ${DISTRICT_INNER}`
  );
}

// ⑨ 걸어서 어디까지 갈 수 있나 — **앱의 진짜 충돌 함수를 그대로 불러** 쓴다
//
// 충돌을 넣을 때의 실패는 두 방향이다: 안 막혀서 뚫고 지나가거나, 너무 막혀서
// 광장에 갇히거나. 뒤쪽이 훨씬 나쁘고 눈으로는 "왜 안 가지" 하다 마는 정도라
// 놓치기 쉽다. 그래서 출발점에서 물을 붓듯 퍼뜨려 갈 수 있는 땅을 세고,
// 구역까지 실제로 닿는지 본다.
//
// 여기서 villageWalk.ts 를 **다시 구현하지 않고 import 한다** — scripts/lib/ts-loader.mjs
// 가 앱 모듈을 그대로 읽게 해 준다. 베껴 적으면 반드시 어긋난다(오늘만 세 번).
{
  const {
    isWalkable,
    WALK_RADIUS,
    CHARACTER_RADIUS,
    SPAWN: START
  } = await import("@/lib/villageWalk.ts");
  const SPAWN = {x: START[0], z: START[1]};
  const STEP = 0.35; // 캐릭터 반지름보다 작아야 틈으로 새지 않는다

  const k = (i, j) => `${i}_${j}`;
  const seen = new Set();
  const start = {i: Math.round(SPAWN.x / STEP), j: Math.round(SPAWN.z / STEP)};
  const queue = [start];
  seen.add(k(start.i, start.j));
  let reach = 0;
  while (queue.length) {
    const c = queue.pop();
    const x = c.i * STEP;
    const z = c.j * STEP;
    if (!isWalkable(x, z)) continue;
    reach++;
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const n = {i: c.i + di, j: c.j + dj};
      const key = k(n.i, n.j);
      if (seen.has(key)) continue;
      if (Math.hypot(n.i * STEP, n.j * STEP) > WALK_RADIUS) continue;
      seen.add(key);
      queue.push(n);
    }
  }

  // 출발점이 막혀 있으면 첫 칸부터 못 퍼진다
  check(
    "출발점에 설 수 있음",
    isWalkable(SPAWN.x, SPAWN.z),
    `(${SPAWN.x}, ${SPAWN.z})`
  );

  // ─── 섬 밖 탈출 불가 ────────────────────────────────────────────────────────
  // 물에 들어갈 수 있게 되면서 경계는 석호 껍질 하나다. 껍질 밖 표본이 하나라도
  // 걸을 수 있으면 경계가 새는 것이다 — 누가 경계를 원반으로 되돌리면 여기서 잡힌다.
  {
    const {inLagoon} = await import("@/lib/villageTerrain.ts");
    let leaks = 0;
    let outside = 0;
    for (let x = -40; x <= 40; x += 0.8)
      for (let z = -40; z <= 40; z += 0.8) {
        if (inLagoon(x, z)) continue;
        outside++;
        if (isWalkable(x, z)) leaks++;
      }
    check(
      "섬 밖 탈출 불가",
      leaks === 0,
      leaks ? `${leaks}곳이 걸을 수 있음` : `껍질 밖 표본 ${outside}점 전부 막힘`
    );
  }

  // ─── "갇혔나"는 **설 수 있는 땅 대비**로 재야 한다 ──────────────────────────
  // 예전엔 원반 넓이 대비 45% 를 기준으로 삼았다. 그 값은 물이 몸을 안 막던
  // 시절의 것이라, 광장 물 고리를 막자마자(물이 원반의 15%를 먹는다) 설계대로
  // 동작하는데도 실패로 떨어졌다 — 기준이 마을 설계를 거스른다.
  //
  // 진짜 물어야 할 건 "설 수 있는 땅 중 출발점에서 갈 수 있는 비율"이다.
  // 물·건물·담장이 얼마를 먹든 그 값은 "어딘가 섬처럼 끊겼나"만 본다.
  let standable = 0;
  const span = Math.ceil(WALK_RADIUS / STEP);
  for (let i = -span; i <= span; i++)
    for (let j = -span; j <= span; j++) {
      const x = i * STEP;
      const z = j * STEP;
      if (Math.hypot(x, z) > WALK_RADIUS) continue;
      if (isWalkable(x, z)) standable++;
    }
  const discCells = (Math.PI * WALK_RADIUS * WALK_RADIUS) / (STEP * STEP);
  const pct = (reach / Math.max(1, standable)) * 100;
  check(
    "갇히지 않음",
    pct > 80 && standable / discCells > 0.3,
    `설 수 있는 땅의 ${pct.toFixed(0)}% 에 갈 수 있음 ` +
      `(원반의 ${((standable / discCells) * 100).toFixed(0)}% 가 땅, ` +
      `${((reach / discCells) * 100).toFixed(0)}% 가 실제 활동 범위)`
  );

  // 걸어서 구역 건물 앞까지 갈 수 있나
  const nearBuilding = buildings.filter(b => {
    if (b.district === "plaza") return false;
    const pad = CHARACTER_RADIUS + 0.8;
    for (const key of seen) {
      const [i, j] = key.split("_").map(Number);
      const x = i * STEP;
      const z = j * STEP;
      if (!isWalkable(x, z)) continue;
      if (
        Math.abs(x - b.x) < b.w / 2 + pad &&
        Math.abs(z - b.z) < b.d / 2 + pad
      )
        return true;
    }
    return false;
  });
  check(
    "걸어서 건물 앞까지",
    nearBuilding.length >= 5,
    `${nearBuilding.length}채: ${
      nearBuilding.map(b => b.id).join(", ") || "없음"
    }`
  );
}

console.log(`\n${failed ? `실패 ${failed}건` : "전부 통과"}`);
process.exit(failed ? 1 : 0);
