// src/lib/constants.ts 에서 건물 표를 읽어온다.
//
// constants.ts 는 TS라 스크립트에서 import 할 수 없어 정규식으로 훑는다.
// 예전엔 바닥 생성기가 건물 좌표·크기를 자기 파일에 베껴 두고 있었는데, 건물
// 크기를 손볼 때 앞마당이 통째로 틀어졌다. 배치 스크립트가 둘(바닥·장식물)로
// 늘어나면서 같은 사고가 두 배로 날 수 있어 여기로 모았다.

import {readFileSync} from "node:fs";

const CONSTANTS = "src/lib/constants.ts";

export function readVillage() {
  const source = readFileSync(CONSTANTS, "utf8");

  const num = (re) => {
    const m = source.match(re);
    if (!m) throw new Error(`${CONSTANTS} 에서 ${re} 를 못 찾았습니다`);
    return Number(m[1]);
  };
  const SPREAD = num(/export const SPREAD\s*=\s*([\d.]+)/);

  const OFFSET = {};
  {
    const block = source.match(/districtOffset[^=]*=\s*\{([\s\S]*?)\};/);
    if (!block) throw new Error(`${CONSTANTS} 에서 districtOffset 을 못 찾았습니다`);
    for (const line of block[1].split("\n")) {
      const m = line.match(/(\w[\w-]*)\s*:\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
      if (m) OFFSET[m[1]] = [Number(m[2]), Number(m[3])];
    }
  }

  // id 하나가 곧 건물 하나는 아니다(sectionMeta 에도 id가 있다). 다음 id 직전까지만
  // 훑어서 size·position·district 가 모두 있는 것만 건물로 친다.
  const buildings = [];
  const ids = [...source.matchAll(/id:\s*"([^"]+)"/g)];
  for (let n = 0; n < ids.length; n++) {
    const start = ids[n].index;
    const end = n + 1 < ids.length ? ids[n + 1].index : source.length;
    const chunk = source.slice(start, end);
    const size = chunk.match(/size:\s*\[([^\]]+)\]/);
    const position = chunk.match(/position:\s*\[([^\]]+)\]/);
    const district = chunk.match(/district:\s*"([^"]+)"/);
    if (!size || !position || !district) continue;
    const [w, h, d] = size[1].split(",").map((v) => Number(v.trim()));
    const [px, , pz] = position[1].split(",").map((v) => Number(v.trim()));
    const [ox, oz] = OFFSET[district[1]] ?? [0, 0];
    buildings.push({
      id: ids[n][1],
      district: district[1],
      x: Math.round((px + ox) * SPREAD * 100) / 100,
      z: Math.round((pz + oz) * SPREAD * 100) / 100,
      w,
      h,
      d
    });
  }
  if (buildings.length < 20)
    throw new Error(`${CONSTANTS} 에서 건물을 ${buildings.length}개밖에 못 읽었습니다 — 형식이 바뀐 듯합니다`);

  return {SPREAD, OFFSET, buildings};
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
  const spread = Number(source.match(/export const SPREAD\s*=\s*([\d.]+)/)?.[1]);
  if (!Number.isFinite(spread)) throw new Error(`${CONSTANTS} 에서 SPREAD 를 못 찾았습니다`);
  const block = source.match(new RegExp(`${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`));
  if (!block) throw new Error(`${CONSTANTS} 에서 ${name} 을 못 찾았습니다`);
  const out = [];
  for (const m of block[1].matchAll(/\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/g))
    out.push([
      Math.round(Number(m[1]) * spread * 100) / 100,
      Number(m[2]),
      Math.round(Number(m[3]) * spread * 100) / 100
    ]);
  if (!out.length) throw new Error(`${CONSTANTS} 의 ${name} 이 비었습니다 — 형식이 바뀐 듯합니다`);
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
