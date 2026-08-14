// src/lib/constants.ts 에서 건물 표를 읽어온다.
//
// constants.ts 는 TS라 스크립트에서 import 할 수 없어 정규식으로 훑는다.
// 예전엔 바닥 생성기가 건물 좌표·크기를 자기 파일에 베껴 두고 있었는데, 건물
// 크기를 손볼 때 앞마당이 통째로 틀어졌다. 배치 스크립트가 둘(바닥·장식물)로
// 늘어나면서 같은 사고가 두 배로 날 수 있어 여기로 모았다.

import {readFileSync} from "node:fs";

const CONSTANTS = "src/lib/constants.ts";

const round2 = v => Math.round(v * 100) / 100;

/**
 * constants.ts 의 건물 표를 **아무 배치 보정도 하지 않은 상태**로 읽는다.
 *
 * `readVillage()` 는 여기에 구역 이동을 얹어 월드 좌표를 만들고,
 * `solve-district-ring.mjs` 는 그 이동량을 구하려고 원본이 필요하다.
 * 파서는 여기 하나뿐이어야 한다 — 두 벌이 되면 형식이 바뀔 때 한쪽만 낡는다.
 */
export function readRaw(source = readFileSync(CONSTANTS, "utf8")) {
  const num = re => {
    const m = source.match(re);
    if (!m) throw new Error(`${CONSTANTS} 에서 ${re} 를 못 찾았습니다`);
    return Number(m[1]);
  };
  const SPREAD = num(/export const SPREAD\s*=\s*([\d.]+)/);

  // 건물 치수 배율 — constants.ts 가 export 할 때 size 에 곱하는 값.
  // **여기서 안 읽으면 생성기만 옛 크기를 본다**: 건물은 커졌는데 앞마당 원반과
  // 길 폭은 그대로라 건물이 제 앞마당을 삐져나온다. size 는 좌표와 달리
  // SPREAD 를 안 타므로 별도 상수다.
  const BUILDING_SCALE = num(/export const BUILDING_SCALE\s*=\s*([\d.]+)/);

  // id 하나가 곧 건물 하나는 아니다(sectionMeta 에도 id가 있다). 다음 id 직전까지만
  // 훑어서 size·position·district 가 모두 있는 것만 건물로 친다.
  const raw = [];
  const ids = [...source.matchAll(/id:\s*"([^"]+)"/g)];
  for (let n = 0; n < ids.length; n++) {
    const start = ids[n].index;
    const end = n + 1 < ids.length ? ids[n + 1].index : source.length;
    const chunk = source.slice(start, end);
    const size = chunk.match(/size:\s*\[([^\]]+)\]/);
    const position = chunk.match(/position:\s*\[([^\]]+)\]/);
    const district = chunk.match(/district:\s*"([^"]+)"/);
    if (!size || !position || !district) continue;
    const [w, h, d] = size[1].split(",").map(v => Number(v.trim()));
    const [px, , pz] = position[1].split(",").map(v => Number(v.trim()));
    raw.push({id: ids[n][1], district: district[1], px, pz, w, h, d});
  }
  if (raw.length < 20)
    throw new Error(
      `${CONSTANTS} 에서 건물을 ${raw.length}개밖에 못 읽었습니다 — 형식이 바뀐 듯합니다`
    );

  return {source, SPREAD, BUILDING_SCALE, raw};
}

/**
 * 구역 이동 벡터 표(월드 단위)를 읽는다.
 *
 * 예전엔 여기서 constants.ts 의 `applyDistrictOffset` **알고리즘을 통째로 베껴**
 * 다시 구현했다(주석에도 "같은 계산이어야 한다"고 적혀 있었다). 그 방식은
 * 규칙이 바뀔 때마다 두 곳을 같이 고쳐야 해서 반드시 어긋난다 — 이 마을에서만
 * 해자·섬·물길 끝 반지름이 같은 이유로 세 번 낡았다.
 *
 * 그래서 계산은 `scripts/solve-district-ring.mjs` 한 곳에만 두고, 결과 벡터만
 * constants.ts 에 표로 적는다. 여기도 씬도 그 표를 **읽기만** 한다.
 */
export function readDistrictShift(source = readFileSync(CONSTANTS, "utf8")) {
  const block = source.match(/districtShift[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block)
    throw new Error(
      `${CONSTANTS} 에서 districtShift 표를 못 찾았습니다 — \`node scripts/solve-district-ring.mjs --write\` 로 만드세요`
    );
  const out = {};
  for (const m of block[1].matchAll(
    /([\w-]+):\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/g
  ))
    out[m[1]] = [Number(m[2]), Number(m[3])];
  if (!Object.keys(out).length)
    throw new Error(`${CONSTANTS} 의 districtShift 가 비었습니다`);
  return out;
}

/**
 * 걸어 다닐 수 있는 반경을 원본(villageWalk.ts)에서 읽는다.
 *
 * 장식물 생성기는 이 안의 빌보드를 원본 모델로 바꿔 심어야 한다 — 가까이서 보면
 * 십자 빌보드는 옆날이 판때기로 보인다. 예전엔 생성기가 `WALK = {x: 13.5, ...}`
 * 라는 **사각형을 손으로** 적어 두고 주석에 "컨트롤러는 x ±11.5 로 가둔다"고
 * 써 놨었다. 처음부터 값이 서로 달랐고 구역을 옮긴 뒤로는 둘 다 낡았다.
 */
export function readWalkRadius() {
  const source = readFileSync("src/lib/villageWalk.ts", "utf8");
  const m = source.match(/export const WALK_RADIUS\s*=\s*([\d.]+)/);
  if (!m)
    throw new Error("src/lib/villageWalk.ts 에서 WALK_RADIUS 를 못 찾았습니다");
  return Number(m[1]);
}

/**
 * 물의 치수를 원본(villageTerrain.ts)에서 읽는다.
 *
 * 씬이 그리는 폭과 생성기가 비워 두는 폭이 다르면, 프롭이 물에 발을 담그거나
 * 길 타일이 물을 덮는다. 실제로 그랬다 — 길 타일이 물보다 1cm 높아 문마다
 * 물이 2유닛씩 끊겨 보였고, 그 위에 선 다리는 건널 게 없는 다리였다.
 */
export function readWaterHalf() {
  const source = readFileSync("src/lib/villageTerrain.ts", "utf8");
  const num = name => {
    const m = source.match(new RegExp(`${name}:\\s*([\\d.]+)`));
    if (!m)
      throw new Error(
        `src/lib/villageTerrain.ts 의 WATER_HALF 에서 ${name} 을 못 찾았습니다`
      );
    return Number(m[1]);
  };
  const bank = source.match(/export const WATER_BANK_OUT\s*=\s*([\d.]+)/);
  if (!bank)
    throw new Error(
      "src/lib/villageTerrain.ts 에서 WATER_BANK_OUT 을 못 찾았습니다"
    );
  return {
    ring: num("ring"),
    channelIn: num("channelIn"),
    channelOut: num("channelOut"),
    bankOut: Number(bank[1])
  };
}

/** 구역이 광장에서 시작해야 하는 거리 — 솔버의 목표값이자 검사 기준 */
export function readDistrictInner(source = readFileSync(CONSTANTS, "utf8")) {
  const m = source.match(/export const DISTRICT_INNER\s*=\s*([\d.]+)/);
  if (!m) throw new Error(`${CONSTANTS} 에서 DISTRICT_INNER 를 못 찾았습니다`);
  return Number(m[1]);
}

export function readVillage() {
  const {source, SPREAD, BUILDING_SCALE, raw} = readRaw();
  const SHIFT = readDistrictShift(source);

  // constants.ts 의 `placeInDistrict` 와 **한 줄까지 같은 식**이어야 한다.
  // (알고리즘이 아니라 표를 더하는 것뿐이라 어긋날 여지가 거의 없다)
  const buildings = raw.map(b => {
    const [sx, sz] = SHIFT[b.district] ?? [0, 0];
    return {
      id: b.id,
      district: b.district,
      x: round2(b.px * SPREAD + sx),
      z: round2(b.pz * SPREAD + sz),
      w: round2(b.w * BUILDING_SCALE),
      h: round2(b.h * BUILDING_SCALE),
      d: round2(b.d * BUILDING_SCALE)
    };
  });

  return {
    SPREAD,
    BUILDING_SCALE,
    SHIFT,
    DISTRICT_INNER: readDistrictInner(source),
    raw,
    buildings
  };
}

/**
 * 마을을 두르는 해자 타원을 원본(villageRelief.ts)에서 읽는다.
 *
 * 씬은 이 타원으로 물을 그리고, 생성기는 같은 타원을 따라 숲 금지 구역을 깐다.
 * 값을 양쪽에 적어 두면 반드시 어긋난다 — 실제로 마을을 키우며 해자를 넓혔을 때
 * 생성기 쪽만 옛 값으로 남아 나무 55그루가 물에 잠겼다.
 */
export function readMoat() {
  const source = readFileSync("src/lib/villageRelief.ts", "utf8");
  const m = source.match(
    /MOAT\s*=\s*\{\s*cx:\s*(-?[\d.]+),\s*cz:\s*(-?[\d.]+),\s*a:\s*(-?[\d.]+),\s*b:\s*(-?[\d.]+)\s*\}/
  );
  if (!m)
    throw new Error(
      "src/lib/villageRelief.ts 에서 MOAT 를 못 찾았습니다 — 형식이 바뀐 듯합니다"
    );
  return {cx: +m[1], cz: +m[2], a: +m[3], b: +m[4]};
}

/**
 * 섬(잔디 원반)의 중심과 반지름을 VillageScene 에서 읽는다.
 *
 * 프롭을 이 밖에 심으면 나무가 절벽 너머 허공에 뜬다. 예전엔 생성기가
 * "잔디 평면은 90×90" 이라는 **사각형**을 손으로 적어 뒀는데, 씬은 진작
 * 원반으로 바뀐 뒤였다(반지름 40 → 53). 값을 베끼면 반드시 이렇게 낡는다.
 */
export function readIsland() {
  const source = readFileSync(
    "src/components/village/VillageScene.tsx",
    "utf8"
  );
  const c = source.match(
    /ISLAND_CENTER[^=]*=\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/
  );
  const r = source.match(/const ISLAND_RADIUS\s*=\s*([\d.]+)/);
  if (!c || !r)
    throw new Error(
      "VillageScene.tsx 에서 ISLAND_CENTER/RADIUS 를 못 찾았습니다"
    );
  return {cx: +c[1], cz: +c[3], r: +r[1]};
}

/**
 * 손으로 찍어 둔 좌표 배열을 읽는다 (treePositions / rockPositions).
 * 나무·바위는 GLB 장식물이 된 뒤에도 자리는 여기 그대로 쓴다 — 오래 다듬은 배치다.
 *
 * 원본은 `[...].map(spread)` 꼴이라 파일에 적힌 값은 **배율 적용 전**이다.
 * 여기서 SPREAD를 곱해 월드 좌표로 돌려준다 (건물 좌표와 같은 처리).
 */
export function readPositions(name) {
  const source = readFileSync(CONSTANTS, "utf8");
  const spread = Number(
    source.match(/export const SPREAD\s*=\s*([\d.]+)/)?.[1]
  );
  if (!Number.isFinite(spread))
    throw new Error(`${CONSTANTS} 에서 SPREAD 를 못 찾았습니다`);
  const block = source.match(
    new RegExp(`${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`)
  );
  if (!block) throw new Error(`${CONSTANTS} 에서 ${name} 을 못 찾았습니다`);
  const out = [];
  for (const m of block[1].matchAll(
    /\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/g
  ))
    out.push([
      Math.round(Number(m[1]) * spread * 100) / 100,
      Number(m[2]),
      Math.round(Number(m[3]) * spread * 100) / 100
    ]);
  if (!out.length)
    throw new Error(
      `${CONSTANTS} 의 ${name} 이 비었습니다 — 형식이 바뀐 듯합니다`
    );
  return out;
}

// ─── 구역 단차 블록 ──────────────────────────────────────────────────────────
// 바닥 타일 격자 간격. 블록 테두리는 이 격자에 맞춰야 한다 — 안 그러면 단 경계가
// 타일 한가운데를 지나 타일이 통째로 들리면서 축대 밖으로 반 칸 삐져나온다.
export const PITCH = 1.88;
const HALF = PITCH / 2;

/**
 * 건물 한 무리를 감싸는 **가장 작은** 격자 정렬 사각형.
 *
 * ─── 왜 floor/ceil 이 아니라 이 식인가 ──────────────────────────────────────
 * 예전엔 `floor(x0 / PITCH)` 로 칸 번호를 구하고 거기서 다시 반 칸을 뺐다.
 * 두 번 바깥으로 나가는 셈이라 한 변마다 최대 PITCH+HALF(2.82) 가 덧붙었다.
 * 건물이 대각선 방향에 늘어선 구역(SKILLS 는 −35°)은 축정렬 사각형의 모서리가
 * 원래도 광장 쪽으로 튀어나오는데, 거기에 2.82 가 더 붙어 **단이 광장 포장
 * 한복판(r 7.2)까지 내려왔다**. 광장을 두르는 물 고리가 들어갈 자리가 없었다.
 *
 * 여기 식은 "건물을 다 담는 칸 중 가장 안쪽"을 고른다: 테두리 x0 = i0·PITCH − HALF
 * 가 건물 왼쪽 끝보다 안쪽으로 오면 안 되므로 i0 = floor((x0 + HALF) / PITCH).
 * 격자 정렬은 그대로 지키면서 군더더기만 사라진다 — 단이 내려오는 한계가
 * 7.2 → 9.8, 구역 사이 골짜기가 3.76 → 5.64 로 넓어진다.
 */
export function blockOf(list) {
  let i0 = Infinity,
    i1 = -Infinity,
    j0 = Infinity,
    j1 = -Infinity;
  for (const b of list) {
    i0 = Math.min(i0, Math.floor((b.x - b.w / 2 + HALF) / PITCH));
    i1 = Math.max(i1, Math.ceil((b.x + b.w / 2 - HALF) / PITCH));
    j0 = Math.min(j0, Math.floor((b.z - b.d / 2 + HALF) / PITCH));
    j1 = Math.max(j1, Math.ceil((b.z + b.d / 2 - HALF) / PITCH));
  }
  return {
    x0: i0 * PITCH - HALF,
    x1: i1 * PITCH + HALF,
    z0: j0 * PITCH - HALF,
    z1: j1 * PITCH + HALF
  };
}

/** 구역 이름 → 단차 블록. plaza(기념비)는 단을 안 만든다. */
export function districtBlocks(buildings) {
  const groups = new Map();
  for (const b of buildings) {
    if (b.district === "plaza") continue;
    if (!groups.has(b.district)) groups.set(b.district, []);
    groups.get(b.district).push(b);
  }
  const out = new Map();
  for (const [district, list] of groups) out.set(district, blockOf(list));
  return out;
}

/** 지구별 건물 무게중심 — 간판을 어디에 세울지의 기준점 */
export function districtCenters(buildings) {
  const groups = {};
  for (const b of buildings) (groups[b.district] ??= []).push(b);
  const out = {};
  for (const [district, list] of Object.entries(groups)) {
    out[district] = {
      x: list.reduce((s, b) => s + b.x, 0) / list.length,
      z: list.reduce((s, b) => s + b.z, 0) / list.length,
      buildings: list
    };
  }
  return out;
}
