// 구역 안 건물을 **미니광장을 두르는 고리**로 세운다 — constants.ts 의
// position·rotationY 리터럴과 districtHub 표를 다시 쓴다.
//
// ── 왜 줄이 아니라 고리인가 ─────────────────────────────────────────────────
// 컨셉 이미지의 섬 내부는 격자 줄이 아니다: 섬 가운데 둥근 미니광장(분수)이
// 있고, 건물들이 그 둘레에 서서 전부 **안쪽을 바라본다**. STUDY 는 넷이 광장을
// 두르고, EXPERIENCE 는 셋이 반달 호로 선다. 그 "둘러앉음"이 섬을 섬으로
// 읽히게 한다. (arrange-district-rows.mjs 의 줄 배치는 이걸로 대체됐다)
//
// ── 회전은 임의 각이다 ──────────────────────────────────────────────────────
// 90도 스냅 시절의 "월드 폭/깊이 스왑" 요령은 여기서 끝났다. 발자국이 필요한
// 소비자는 전부 scripts/lib/read-village.mjs 의 OBB 헬퍼(cornersOf 등)를 쓴다.
//
// ── 무엇을 안 건드리나 ──────────────────────────────────────────────────────
// 구역이 광장에서 얼마나 떨어져 어느 방위에 앉는지는 solve-district-ring 이
// 맡는다. 여기는 **구역 안 모양**(고리)만 만든다. 순서:
//   node scripts/arrange-district-round.mjs --write
//   node scripts/solve-district-ring.mjs --write
//   node scripts/generate-ground-layout.mjs && node scripts/generate-decor-layout.mjs
//   npm run check:village
//
// 사용법: node scripts/arrange-district-round.mjs [--write]

import {writeFileSync} from "node:fs";
import {
  readRaw,
  obbGap,
  discOfDistrict,
  TARGET_BEARING
} from "./lib/read-village.mjs";

const CONSTANTS = "src/lib/constants.ts";
const WRITE = process.argv.includes("--write");
const round2 = v => Math.round(v * 100) / 100;
const round4 = v => Math.round(v * 10000) / 10000;

const {source, SPREAD, BUILDING_SCALE, raw} = readRaw();

/** 이웃 건물 사이(호를 따라) 남길 월드 여유. 컨셉의 처마는 거의 붙어 있다. */
const GAP = 0.7;
/** 입구(광장 쪽) 호에 비워 둘 폭 — 다리·계단이 들어오는 자리 */
const OPEN_W = 3.0;

const DIST = {};
for (const b of raw) {
  if (b.district === "plaza") continue;
  (DIST[b.district] ??= []).push(b);
}

/**
 * 한 구역을 고리로 세운다. 반환은 hub 기준 **월드 오프셋**과 회전.
 *
 * 반지름은 두 조건의 최댓값이다:
 *   ① 미니광장 + 가장 깊은 건물이 들어가는 최소 반지름
 *   ② 건물 폭 합 + 사이 여유 + 입구가 원둘레에 들어가는 반지름
 * ①이 이기면(건물이 적으면) 호가 남으므로, 건물을 **광장 반대쪽에 몰아** 반달
 * 호로 세우고 남는 호 전체가 입구가 된다 — 컨셉의 EXPERIENCE·CONTACT 가 이 꼴이다.
 */
function layoutRing(arr, bearing) {
  const w = arr.map(b => ({
    id: b.id,
    w: b.w * BUILDING_SCALE,
    d: b.d * BUILDING_SCALE,
    // 원래 있던 각도 순서를 지킨다 — 손으로 잡아 둔 이웃 관계를 굳이 안 섞는다
    ang0: Math.atan2(
      b.pz - arr.reduce((s, q) => s + q.pz, 0) / arr.length,
      b.px - arr.reduce((s, q) => s + q.px, 0) / arr.length
    )
  }));
  const n = w.length;
  const maxD = Math.max(...w.map(b => b.d));
  const miniR = n >= 5 ? 2.0 : 1.6;
  const minRho = miniR + maxD / 2 + 0.55;
  const sumW = w.reduce((s, b) => s + b.w, 0);

  // 한 채면 고리가 아니라 "미니광장 뒤 한 채" — 컨셉의 CONTACT(우체국) 꼴
  if (n === 1) {
    const rho = miniR + w[0].d / 2 + 0.7;
    return {
      rho,
      miniR,
      out: [
        {
          id: w[0].id,
          x: Math.cos(bearing) * rho,
          z: Math.sin(bearing) * rho,
          rot: round4(Math.atan2(-Math.cos(bearing), -Math.sin(bearing)))
        }
      ]
    };
  }

  // ── 각도 배분은 **앞모서리 반지름**으로 잰다 ──────────────────────────────
  // 건물이 안쪽(hub)을 보고 서므로 이웃과 처음 닿는 건 **앞줄 모서리**다 —
  // 반지름 ρ−d/2 의 원 위에서 폭 w 가 차지하는 각도는 w/ρ 보다 훨씬 크다.
  // 처음에 w/ρ 로 나눴다가 12번을 키워도 겹침이 안 풀렸다.
  const seq = [...w].sort((a, b) => a.ang0 - b.ang0);
  const angleOf = (b, rho) =>
    2 *
    Math.asin(
      Math.min(0.9, (b.w / 2 + GAP / 2) / Math.max(0.8, rho - b.d / 2))
    );

  let rho = minRho;
  for (let attempt = 0; attempt < 200; attempt++) {
    const angles = seq.map(b => angleOf(b, rho));
    const total = angles.reduce((s, a) => s + a, 0);
    const open = OPEN_W / rho;
    if (total > 2 * Math.PI - open) {
      rho += 0.15;
      continue;
    }
    const arcNeeded = total;
    // 광장 반대쪽(bearing 방향)에 중심을 두고 호를 편다
    const start = bearing - arcNeeded / 2;
    const out = [];
    let acc = 0;
    for (let i = 0; i < seq.length; i++) {
      const b = seq[i];
      const a = start + acc + angles[i] / 2;
      acc += angles[i];
      out.push({
        id: b.id,
        x: Math.cos(a) * rho,
        z: Math.sin(a) * rho,
        // 정면(+Z)이 hub(안쪽)를 본다: dir = (−cos a, −sin a), faceTo=atan2(dx,dz)
        rot: round4(Math.atan2(-Math.cos(a), -Math.sin(a))),
        w: b.w,
        d: b.d
      });
    }
    let worst = Infinity;
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++)
        worst = Math.min(
          worst,
          obbGap(
            {
              x: out[i].x,
              z: out[i].z,
              w: out[i].w,
              d: out[i].d,
              rotationY: out[i].rot
            },
            {
              x: out[j].x,
              z: out[j].z,
              w: out[j].w,
              d: out[j].d,
              rotationY: out[j].rot
            }
          )
        );
    if (worst >= 0.12) return {rho, miniR, out, worst, arcNeeded};
    rho += 0.15;
  }
  throw new Error("고리 반지름을 200번 키워도 건물이 겹칩니다");
}

// ─── 배치 ────────────────────────────────────────────────────────────────────
const plan = {};
console.log("── 구역 고리 배치 ──────────────────────────────────");
for (const [district, arr] of Object.entries(DIST)) {
  const bearing = TARGET_BEARING[district];
  if (bearing === undefined)
    throw new Error(`TARGET_BEARING 에 ${district} 가 없습니다`);
  const lay = layoutRing(arr, bearing);
  plan[district] = lay;

  // 원반 섬 미리보기 — hub 기준
  const world = lay.out.map(o => {
    const src = arr.find(b => b.id === o.id);
    return {
      x: o.x,
      z: o.z,
      w: src.w * BUILDING_SCALE,
      d: src.d * BUILDING_SCALE,
      rotationY: o.rot
    };
  });
  const disc = discOfDistrict(world, {x: 0, z: 0});
  lay.discR = disc.r;
  console.log(
    `  ${district.padEnd(11)}${String(arr.length).padStart(2)}채 · ` +
      `고리 r ${lay.rho.toFixed(1)} · 미니광장 r ${lay.miniR} · ` +
      `섬 r ${disc.r.toFixed(1)}` +
      (lay.arcNeeded
        ? ` · 호 ${((lay.arcNeeded * 180) / Math.PI).toFixed(0)}°`
        : " · 단독") +
      (lay.worst !== undefined ? ` · 이웃여유 ${lay.worst.toFixed(2)}` : "")
  );
}

if (!WRITE) {
  console.log("\n--write 를 붙이면 constants.ts 를 갱신합니다.");
  process.exit(0);
}

// ─── 쓰기 ────────────────────────────────────────────────────────────────────
// hub 는 **지금 구역 무게중심(원시 좌표)** 그대로 둔다 — 구역을 어디로 옮길지는
// 솔버 몫이고, 여기는 hub 둘레의 상대 배치만 적는다.
let next = source;
let nPos = 0;
for (const [district, arr] of Object.entries(DIST)) {
  const hubX = arr.reduce((s, b) => s + b.px, 0) / arr.length;
  const hubZ = arr.reduce((s, b) => s + b.pz, 0) / arr.length;
  for (const o of plan[district].out) {
    const rx = round2(hubX + o.x / SPREAD);
    const rz = round2(hubZ + o.z / SPREAD);
    const re = new RegExp(
      `(id:\\s*"${o.id}"[\\s\\S]{0,600}?position:\\s*\\[)\\s*-?[\\d.]+\\s*,\\s*(-?[\\d.]+)\\s*,\\s*-?[\\d.]+(\\s*\\])`
    );
    if (!re.test(next)) throw new Error(`${o.id} 의 position 을 못 찾았습니다`);
    next = next.replace(re, `$1${rx}, $2, ${rz}$3`);

    // 회전 리터럴 — **반드시 그 건물의 청크 안에서만** 교체한다.
    // `id … 800자 안의 rotationY` 식은 자기한테 없을 때 다음 건물 것을 덮는다
    // (실제로 26개를 썼다면서 19개만 남은 사고가 있었다).
    const start = next.indexOf(`id: "${o.id}"`);
    if (start < 0) throw new Error(`${o.id} 청크를 못 찾았습니다`);
    const chunkEnd = next.indexOf(`id: "`, start + 6);
    const end = chunkEnd < 0 ? next.length : chunkEnd;
    let chunk = next.slice(start, end);
    if (/rotationY:\s*-?[\d.]+/.test(chunk)) {
      chunk = chunk.replace(/rotationY:\s*-?[\d.]+/, `rotationY: ${o.rot}`);
    } else {
      if (!/size:\s*\[[^\]]+\]/.test(chunk))
        throw new Error(`${o.id} 의 size 를 못 찾았습니다`);
      chunk = chunk.replace(
        /(size:\s*\[[^\]]+\])/,
        `$1,\n    rotationY: ${o.rot}`
      );
    }
    next = next.slice(0, start) + chunk + next.slice(end);
    nPos++;
  }
}

// districtHub 표 — hub(원시 좌표)를 적는다
{
  const body = Object.entries(DIST)
    .map(([district, arr]) => {
      const hubX = round2(arr.reduce((s, b) => s + b.px, 0) / arr.length);
      const hubZ = round2(arr.reduce((s, b) => s + b.pz, 0) / arr.length);
      return `  ${district}: [${hubX}, ${hubZ}]`;
    })
    .join(",\n");
  const re = /(districtHub[^=]*=\s*\{)[\s\S]*?(\n\};)/;
  if (!re.test(next))
    throw new Error(`${CONSTANTS} 의 districtHub 표를 못 찾았습니다`);
  next = next.replace(re, (_, head, tail) => `${head}\n${body}${tail}`);
}

writeFileSync(CONSTANTS, next);
console.log(
  `\n${CONSTANTS} 의 건물 ${nPos}채 위치·회전과 districtHub 를 다시 썼습니다.`
);
console.log("이어서: node scripts/solve-district-ring.mjs --write");
