// 마을이 스스로 모순되지 않는지 한 번에 검사한다.
//
// 배치를 바꾸면(건물 크기·간격·해자·섬) 서로 다른 파일에 흩어진 값들이 조용히
// 어긋난다. 오늘만 해도 해자 사본이 생성기에 따로 있어 나무 55그루가 물에
// 잠겼고, 물길 끝 반지름이 27 로 박혀 있어 개울이 벌판에서 끊겼다.
// 화면으로 찾으면 오래 걸리고 놓치기 쉬우니, 계산으로 끝나는 것은 전부 여기서 본다.
//
// 사용법: node scripts/check-village.mjs
// 실패가 있으면 종료 코드 1 — 생성기를 돌린 뒤 습관처럼 같이 돌리면 된다.

import {readFileSync} from "node:fs";
import {readVillage, readMoat, readIsland} from "./lib/read-village.mjs";

const {buildings} = readVillage();
const MOAT = readMoat();
const ISLAND = readIsland();
const layout = JSON.parse(readFileSync("src/data/propsLayout.json", "utf8"));
const terraces = JSON.parse(readFileSync("src/data/villageTerraces.json", "utf8"));

let failed = 0;
const check = (name, ok, detail) => {
  console.log(`  ${ok ? "OK  " : "실패"} ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) failed++;
};

// ─── 해자 폴리라인 (VillageScene 의 Waterways 와 같은 식) ────────────────────
function moatLine() {
  const STEPS = 132, pts = [];
  for (let s = 0; s <= STEPS; s++) {
    const t = s / STEPS, ang = t * Math.PI * 2 - Math.PI / 2;
    const drift = Math.sin(ang * 3 + 0.7) * 1.4 + Math.sin(ang * 7) * 0.5;
    const c = Math.cos(ang), si = Math.sin(ang);
    const nx = c / MOAT.a, nz = si / MOAT.b, nl = Math.hypot(nx, nz) || 1;
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
  let best = Infinity, half = 1;
  for (const q of LINE) {
    const d = Math.hypot(x - q.x, z - q.z);
    if (d < best) { best = d; half = q.half; }
  }
  return best < half;
};

console.log("── 마을 정합성 검사 ────────────────────────────────\n");

// ① 건물끼리 안 겹치나
{
  let overlap = 0, worst = Infinity;
  for (let i = 0; i < buildings.length; i++)
    for (let j = i + 1; j < buildings.length; j++) {
      const a = buildings[i], b = buildings[j];
      const g = Math.max(
        Math.abs(a.x - b.x) - (a.w + b.w) / 2,
        Math.abs(a.z - b.z) - (a.d + b.d) / 2
      );
      if (g < 0) overlap++;
      worst = Math.min(worst, g);
    }
  check("건물 겹침", overlap === 0, `겹침 ${overlap}쌍 · 최소여유 ${worst.toFixed(2)}`);
}

// ② 건물이 해자 밖으로 나가지 않았나
{
  const out = buildings.filter((b) => {
    const r = Math.max(b.w, b.d) / 2;
    return (
      Math.hypot((Math.abs(b.x - MOAT.cx) + r) / MOAT.a, (Math.abs(b.z - MOAT.cz) + r) / MOAT.b) > 0.92
    );
  });
  check("건물이 해자 안", out.length === 0, out.length ? out.map((b) => b.id).join(", ") : "27채 모두");
}

// ③ 해자가 잔디 원반 안에 있나 — 넘으면 물이 절벽 위 허공에 흐른다
{
  const outer = Math.max(MOAT.a, MOAT.b) + 1.9 + 1.23;
  const room = ISLAND.r - outer;
  check("해자 ⊂ 잔디 원반", room > 2, `원반 ${ISLAND.r} · 해자 바깥끝 ${outer.toFixed(1)} · 여유 ${room.toFixed(1)}`);
}

// ④ 물에 잠긴 프롭 — 파고다 섬은 일부러 물 위라 예외
{
  const EXEMPT = ["decor-island-north", "decor-pagoda-portfolio"];
  const sunk = layout.props.filter(
    (p) => !EXEMPT.includes(p.id) && inMoat(p.position[0], p.position[2])
  );
  check("물에 안 잠긴 프롭", sunk.length <= 3,
    sunk.length ? `${sunk.length}개: ${sunk.slice(0, 4).map((p) => p.id).join(", ")}` : "없음");
}

// ⑤ 섬 밖(허공)에 심긴 프롭
{
  const off = layout.props.filter(
    (p) => Math.hypot(p.position[0] - ISLAND.cx, p.position[2] - ISLAND.cz) > ISLAND.r
  );
  check("프롭이 섬 안", off.length === 0, off.length ? `${off.length}개` : `${layout.props.length}개 모두`);
}

// ⑥ 물길이 광장에서 나와 해자까지 닿나
{
  const chs = terraces.channels ?? [];
  const rMoatAt = (x, z) => {
    const ang = Math.atan2(z, x), c = Math.cos(ang), s = Math.sin(ang);
    const A = (c * c) / (MOAT.a * MOAT.a) + (s * s) / (MOAT.b * MOAT.b);
    const B = (-2 * MOAT.cx * c) / (MOAT.a * MOAT.a) + (-2 * MOAT.cz * s) / (MOAT.b * MOAT.b);
    const C = (MOAT.cx * MOAT.cx) / (MOAT.a * MOAT.a) + (MOAT.cz * MOAT.cz) / (MOAT.b * MOAT.b) - 1;
    return (-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A);
  };
  const gaps = chs.map((ch) => {
    const e = ch[ch.length - 1];
    return rMoatAt(e.x, e.z) - Math.hypot(e.x, e.z);
  });
  const worst = gaps.length ? Math.max(...gaps) : Infinity;
  check("물길이 해자까지", chs.length > 0 && worst < 2.5,
    `${chs.length}줄기 · 해자와 최대 ${gaps.length ? worst.toFixed(1) : "-"} 남음`);
}

// ⑦ 구역 단 사이에 골짜기가 남아 있나 — 맞닿으면 물길도 축대도 안 보인다
{
  // 골짜기가 "보이려면" 축대 두 벽 사이에 최소한 한 칸은 있어야 한다.
  // 0.01 로 재면 0.02 짜리 실틈도 통과라고 나오는데, 그건 화면에서 그냥
  // 맞닿은 것과 똑같이 보인다. 눈에 보이는 폭을 기준으로 삼는다.
  const NEED_VALLEY = 1.0;
  const HALF = terraces.pitch / 2;
  const b = terraces.blocks;
  const tight = [];
  for (let i = 0; i < b.length; i++)
    for (let j = i + 1; j < b.length; j++) {
      const A = b[i], B = b[j];
      // 서로 마주보는(한 축에서 겹치는) 쌍만 본다 — 대각선으로 떨어진 구역은
      // 애초에 골짜기를 공유하지 않는다
      const overlapX = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0) > 0;
      const overlapZ = Math.min(A.z1, B.z1) - Math.max(A.z0, B.z0) > 0;
      if (!overlapX && !overlapZ) continue;
      const dx = Math.max(B.x0 - HALF - (A.x1 + HALF), A.x0 - HALF - (B.x1 + HALF), 0);
      const dz = Math.max(B.z0 - HALF - (A.z1 + HALF), A.z0 - HALF - (B.z1 + HALF), 0);
      const gap = Math.max(dx, dz);
      if (gap < NEED_VALLEY) tight.push(`${A.district}↔${B.district}(${gap.toFixed(2)})`);
    }
  check("구역 단 사이 골짜기", tight.length === 0,
    tight.length ? `너무 좁음: ${tight.join(", ")}` : `마주보는 구역 모두 ${NEED_VALLEY} 이상`);
}

console.log(`\n${failed ? `실패 ${failed}건` : "전부 통과"}`);
process.exit(failed ? 1 : 0);
