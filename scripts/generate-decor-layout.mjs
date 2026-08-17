// 장식물(간판·가로등·분수·벤치…)을 마을에 배치한다.
//
// generate-ground-layout.mjs 가 `ground-*` 프롭을 통째로 다시 쓰듯, 이 스크립트는
// `decor-*` 프롭만 다시 쓴다. 서로의 결과를 건드리지 않으므로 순서 상관없이
// 따로 돌려도 된다. 다만 길 위치를 바닥 레이아웃에서 읽으므로, 길을 새로 깐
// 다음에는 이쪽도 한 번 돌려야 가로등이 길을 따라간다.
//
// 사용법: node scripts/generate-decor-layout.mjs [--dry]

import {readFileSync, writeFileSync, existsSync} from "node:fs";
import {
  readVillage,
  readPositions,
  districtCenters,
  readMoat,
  readIsland,
  readWalkRadius,
  readWaterHalf,
  obbContains
} from "./lib/read-village.mjs";

const LAYOUT = "src/data/propsLayout.json";
const DRY = process.argv.includes("--dry");

// ─── 해자 물줄기 ──────────────────────────────────────────────────────────────
// 값은 원본(villageRelief.ts)에서 읽는다 — 예전에 손으로 베낀 사본을 두었다가
// 마을을 키우며 해자를 넓혔을 때 여기만 옛 값으로 남아 나무 55그루가 잠겼다.
//
// **순수 타원이 아니라 실제로 그려지는 물줄기**를 따라야 한다. VillageScene 은
// 타원에 drift(±1.9)를 얹어 물을 굽이치게 그리므로, 타원만 피하면 물줄기가
// 바깥으로 벗어나는 구간마다 프롭이 물에 선다. 아래는 Waterways 의 폴리라인 식이다.
const MOAT = readMoat();
// 물 치수는 앱(villageTerrain.ts)이 가진다. 프롭은 수면뿐 아니라 **도랑 비탈**
// 밖에 서야 한다 — 비탈 위에 놓으면 평평한 발이 허공에 뜬다.
const WATER = readWaterHalf();
const WATER_BANK_KEEP = WATER.bankOut;
const MOAT_LINE = (() => {
  const STEPS = 132,
    pts = [];
  for (let s = 0; s <= STEPS; s++) {
    const t = s / STEPS;
    const ang = t * Math.PI * 2 - Math.PI / 2;
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
})();

/** (x,z) 가 해자 물 안인가 — check-village.mjs 의 inMoat 와 같은 판정 */
function inMoatWater(x, z) {
  let best = Infinity,
    half = 1;
  for (const q of MOAT_LINE) {
    const d = Math.hypot(x - q.x, z - q.z);
    if (d < best) {
      best = d;
      half = q.half;
    }
  }
  // 물가에 발이 걸치지 않도록 여유를 준다. 이 값은 씬이 그리는 **도랑 폭**이다
  // (VillageScene 의 WATER_BANK_OUT) — 물길이 파이면서 수면 바깥으로도 비탈이
  // 생겼으므로, 예전 0.5 로는 프롭이 비탈 위에 발끝만 걸치고 떠 있게 된다.
  return best < half + WATER_BANK_KEEP;
}

// ─── 마을 속 물 (석호) ────────────────────────────────────────────────────────
// **높이 0 이면 물이다** — 마을 속(구역 블록 볼록 껍질 안)에서만. 껍질 밖은
// 벌판·숲이고 그 너머에 해자가 따로 있다. 앱의 `villageTerrain.isWater` 와 같은
// 판정이고, 같은 데이터(villageTerraces.json)를 읽으므로 규칙이 두 벌은 아니다.
const TERR = (() => {
  try {
    return JSON.parse(readFileSync("src/data/villageTerraces.json", "utf8"));
  } catch {
    return {};
  }
})();
const LAGOON = TERR.lagoon ?? [];
const DAIS_LINE = TERR.plazaDais ?? [];
/** 구역 **원반 섬** — {district, x, z, r}. 사각 blocks 는 없어졌다. */
const TERR_ISLANDS = TERR.islands ?? [];
const TERR_PAD = (TERR.pitch ?? 1.88) / 2;

const inLagoon = (x, z) => {
  if (LAGOON.length < 3) return false;
  for (let i = 0; i < LAGOON.length; i++) {
    const a = LAGOON[i];
    const b = LAGOON[(i + 1) % LAGOON.length];
    if ((b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x) < 0) return false;
  }
  return true;
};

const daisRadiusAt = ang => {
  if (DAIS_LINE.length < 8) return 0;
  const t = (((ang / (Math.PI * 2)) % 1) + 1) % 1;
  const p = DAIS_LINE[Math.floor(t * DAIS_LINE.length) % DAIS_LINE.length];
  return Math.hypot(p.x, p.z);
};

const onDais = (x, z) => Math.hypot(x, z) <= daisRadiusAt(Math.atan2(z, x));

// 이름은 blocks 시절 그대로 둔다 — 뜻은 "구역 섬 위인가". 원반의 반지름에는
// 둘레 여유가 이미 들어 있어 pad 기본값이 0 이다.
const onBlock = (x, z, pad = 0) =>
  TERR_ISLANDS.some(b => Math.hypot(x - b.x, z - b.z) <= b.r + pad);

/** 그 자리가 물인가 */
function inInnerWater(x, z) {
  if (onDais(x, z)) return false;
  if (onBlock(x, z)) return false;
  return inLagoon(x, z);
}

/**
 * 물가 턱에 걸치는가.
 *
 * 축대 꼭대기 바로 옆에 프롭을 놓으면 반은 허공으로 삐져나온다. 물속은 위에서
 * 막고, 여기서는 **단 위의 물가 쪽 테두리**를 막는다.
 */
const SHORE_KEEP = 0.9;
function nearShore(x, z) {
  if (!onDais(x, z) && !onBlock(x, z)) return false;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8)
    if (
      inInnerWater(x + Math.cos(a) * SHORE_KEEP, z + Math.sin(a) * SHORE_KEEP)
    )
      return true;
  return false;
}

// ─── 규격 ─────────────────────────────────────────────────────────────────────
// Meshy는 뭘 뽑든 높이 1.9 유닛으로 정규화해서 내보낸다. 그대로 놓으면 우편함이
// 건물만 하다. 그래서 물건마다 "실제로 몇 미터짜리인가"를 정하고 마을 축척으로
// 환산한다 — 랜드마크 건물(3.1유닛)을 4층으로 보면 1유닛 ≈ 2.5m 이고,
// 캐릭터 0.8유닛이 1.7m 다.
const UNITS_PER_METER = 1 / 2.5;

// glb: 파일 경로 · h: 원본 GLB 높이(실측) · m: 실물 기준 높이(미터)
// 원본 높이는 bake-prop 으로 잰 값. 모델을 다시 뽑으면 여기도 고쳐야 한다.
const KIT = {
  "sign-study": {glb: "signs/sign-study.glb", h: 1.894, m: 2.6},
  "sign-projects": {glb: "signs/sign-projects.glb", h: 1.897, m: 2.6},
  "sign-skills": {glb: "signs/sign-skills.glb", h: 1.898, m: 2.6},
  "sign-experience": {glb: "signs/sign-experience.glb", h: 1.896, m: 2.6},
  "sign-plaza": {glb: "signs/sign-plaza.glb", h: 1.898, m: 2.6},
  "sign-contact": {glb: "signs/sign-contact.glb", h: 1.897, m: 2.6},
  "sign-theme-project": {glb: "signs/sign-theme-project.glb", h: 1.899, m: 1.9},

  // ─── 구역 현판 아치 ─────────────────────────────────────────────────────────
  // 컨셉 아트에서 구역을 "구역"으로 읽히게 하는 건 건물이 아니라 입구에 걸린
  // 커다란 나무 현판이다. 우리는 높이 1유닛짜리 팻말을 길가에 비켜 세워 놨을
  // 뿐이라, 멀리서 보면 구역 경계가 아예 안 보였다.
  // 길(1.88폭)을 가로질러 서야 하므로 실물 7.5m — 건물(2.5유닛≈6m)보다 높다.
  "arch-projects": {glb: "decor/arch-projects.glb", h: 1.67, m: 7.5},
  "arch-study": {glb: "decor/arch-study.glb", h: 1.529, m: 7.5},
  "arch-experience": {glb: "decor/arch-experience.glb", h: 1.436, m: 7.5},
  "arch-life": {glb: "decor/arch-life.glb", h: 1.669, m: 7.5},
  "arch-skills": {glb: "decor/arch-skills.glb", h: 1.553, m: 7.5},
  "arch-contact": {glb: "decor/arch-contact.glb", h: 1.86, m: 7.5},

  // ─── 채움 민가 ──────────────────────────────────────────────────────────────
  // 클릭도 안 되고 NPC도 없는 배경 집. 컨셉 아트의 블록은 5~8채가 들어차 있는데
  // 우리는 구역당 1~9채(대개 3채)라 블록이 비어 보였다. 진짜 건물과 키를 맞춘다.
  "house-a": {glb: "decor/house-a.glb", h: 1.826, m: 6.0},
  "house-b": {glb: "decor/house-b.glb", h: 1.742, m: 6.0},
  "house-c": {glb: "decor/house-c.glb", h: 1.632, m: 6.0},

  // ─── 세로 깃발 깃대 ─────────────────────────────────────────────────────────
  // 컨셉 아트에서 화면에 가장 많이 찍혀 있는 물건. 파랑·금빛 깃발이 광장 둘레와
  // 대로변에 줄줄이 서서, 부감에서도 "여기가 큰 길"이 읽힌다.
  // 가로등(1.2유닛)보다 확실히 높아야 리듬이 생긴다.
  "flagpole-banner": {glb: "decor/flagpole-banner.glb", h: 1.903, m: 4.6},

  // 포장 위 원형 화단. 바닥을 돌로 덮고 나니 블록 사이가 **아무것도 없는 돌마당**이
  // 됐다. 컨셉 아트는 그 자리를 화단과 나무로 채운다.
  "flowerbed-round": {glb: "decor/flowerbed-round.glb", h: 0.462, m: 0.6},

  // ─── 마을 밖 랜드마크 ───────────────────────────────────────────────────────
  // 섬 테두리에 세우는 큰 것들. 한두 개씩만 놓으므로 삼각형을 아끼지 않는다.
  // 지평선에 수직선을 세워 주는 게 이것들의 일이다 — 마을 안이 아무리 차도
  // 실루엣이 납작하면 조감에서 밋밋하다.
  windmill: {glb: "decor/windmill.glb", h: 1.899, m: 14},
  waterfall: {glb: "decor/waterfall.glb", h: 1.737, m: 20},
  "island-north": {glb: "decor/island-north.glb", h: 1.811, m: 24},
  "pagoda-portfolio": {glb: "decor/pagoda-portfolio.glb", h: 1.904, m: 15},
  "bridge-stone": {glb: "decor/bridge-stone.glb", h: 0.74, m: 5.0},

  // ─── 낮은 돌담 ──────────────────────────────────────────────────────────────
  // scripts/make-low-wall.mjs 가 굽는다(상자 둘, 24 삼각형). 컨셉 아트에서 구역이
  // "구역"으로 읽히는 건 이 선 하나 덕이다 — 담 안은 마당, 담 밖은 길.
  // 마을 전체에 80토막쯤 깔리므로 값이 싸야 한다. 손그림이 오면 raw/decor 에
  // 같은 이름으로 넣고 optimize 만 돌리면 그대로 갈린다.
  // 배율이 1이 되도록 h·m 을 맞춰 놨다 — 생성 스크립트가 이미 월드 크기로 만든다.
  "wall-low": {glb: "decor/wall-low.glb", h: 0.6, m: 1.5},
  // 길가에 길게 까는 가벼운 울타리 (make-fence-rail.mjs, 36삼각형).
  // 받은 fence.glb 는 1,473 이라 200개를 못 깐다 — 가까이 보이는 자리에만 쓴다.
  "fence-rail": {glb: "decor/fence-rail.glb", h: 0.72, m: 1.8},
  // ─── 석축 ───────────────────────────────────────────────────────────────────
  // 축대(擁壁) — 흙이 무너지지 않게 받치는 돌벽. 컨셉 아트는 구역마다 이 벽으로
  // 단을 만들어 올려놨고, 그래서 마을이 "깎아 만든 땅" 위에 선 것처럼 보인다.
  // 받은 terrace-wall 은 **ㄱ자 모서리** 조각이라 직선 구간엔 못 깐다(늘어놓으면
  // ㄱ자만 되풀이된다). 직선 축대는 VillageScene 의 TerraceBanks 가 그리고,
  // 이건 아치 양옆을 받치는 **문기둥**으로 쓴다.
  "terrace-wall": {glb: "decor/terrace-wall.glb", h: 1.21, m: 3.4},

  // 단을 오르는 돌계단. 양옆에 석주가 서 있고 **−Z 쪽으로 오른다**(옆에서 구워
  // 확인) — 회전은 낮은 쪽(+Z)이 구역 바깥을 보게 잡는다.
  //
  // **높이를 bbox 로 맞추면 안 된다.** 모델 꼭대기는 양옆 석주고, 정작 밟는
  // 맨 윗 단은 bbox 높이의 **66%** 지점이다(XZ 높이 지도로 실측: 채널 바닥 0 →
  // 윗단 6/9 단계). m=2.75 로 전체를 1.1 에 맞췄더니 윗 단이 0.73 이라 다 올라가서
  // 0.37 짜리 턱을 한 번 더 밟아야 했다.
  // m=3.85 → 배율 1.484 → 윗 단 1.02(단 1.1 과 0.08 차) · 석주는 0.44 솟는다.
  // 그러면 폭 2.54(길 1.88), 안길이 2.82 라 아래 OUT 도 같이 커져야 한다.
  //
  // 한동안 이 자리에 직접 구운 40삼각형짜리 쐐기(make-terrace-steps.mjs)를 썼다.
  // 원본이 1만 삼각형이라 스무 곳에 못 놓는다고 판단한 건데, 담쟁이 UV 심 때문에
  // 기본 오차로 안 줄었을 뿐이고 오차를 0.03 으로 올리니 8,236 이다.
  // 28곳 × 8천 = 23만이고 예산(180만)에 46만이 남아 있었다 — 회색 쐐기를 깔
  // 이유가 처음부터 없었다. (optimize-glb.mjs 의 TERRACE_SIMPLIFY 참고)
  "terrace-stair": {glb: "decor/terrace-stair.glb", h: 1.038, m: 3.85},

  "lantern-post": {glb: "decor/lantern-post.glb", h: 1.894, m: 3.0},
  "lantern-archway": {glb: "decor/lantern-archway.glb", h: 1.741, m: 3.0},
  "gate-arch": {glb: "decor/gate-arch.glb", h: 1.38, m: 2.4},
  "notice-board": {glb: "decor/notice-board.glb", h: 1.697, m: 2.0},
  fountain: {glb: "decor/fountain.glb", h: 1.151, m: 2.2},
  well: {glb: "decor/well.glb", h: 1.9, m: 2.5},
  "lantern-bearer": {glb: "decor/lantern-bearer.glb", h: 1.899, m: 2.2},
  "market-stall": {glb: "decor/market-stall.glb", h: 1.847, m: 2.5},
  "stump-forge": {glb: "decor/stump-forge.glb", h: 1.898, m: 1.3},
  campfire: {glb: "decor/campfire.glb", h: 1.279, m: 0.8},
  "lute-picnic": {glb: "decor/lute-picnic.glb", h: 0.946, m: 0.6},
  mailbox: {glb: "decor/mailbox.glb", h: 1.899, m: 1.5},
  bench: {glb: "decor/bench.glb", h: 1.122, m: 0.9},
  "barrel-iron": {glb: "decor/barrel-iron.glb", h: 1.898, m: 0.9},
  "scroll-barrel": {glb: "decor/scroll-barrel.glb", h: 1.897, m: 1.0},
  // 책·촛불은 실물대로 하면 0.2유닛짜리 소품이라 잔디에 묻힌다.
  // 학습 지구의 표지 구실을 하도록 일부러 키운다.
  "candle-tome": {glb: "decor/candle-tome.glb", h: 1.898, m: 1.1},
  "flower-pot": {glb: "decor/flower-pot.glb", h: 1.894, m: 0.7},
  "orb-lantern": {glb: "decor/orb-lantern.glb", h: 1.899, m: 0.7},
  "leaf-banner": {glb: "decor/leaf-banner.glb", h: 1.898, m: 2.8},
  fence: {glb: "decor/fence.glb", h: 0.944, m: 1.1},
  bunting: {glb: "decor/bunting.glb", h: 0.489, m: 0.8},

  // 나무·바위. 예전엔 VillageScene 이 절차적으로 그린 네온 콘과 검은 다면체였는데,
  // 마을이 따뜻한 스타일로 바뀌면서 혼자 사이버펑크로 남아 겉돌았다.
  // 자리(treePositions / rockPositions)는 오래 다듬은 값이라 그대로 쓴다.
  // 마을 **안쪽** 나무는 4.5~5.0 에서 3.6~4.0 으로 낮췄다. 건물 중앙값이 2.14유닛
  // 이던 시절엔 나무가 건물의 2.3배라 마을이 "숲에 놓인 모형"으로 보였다.
  // 건물을 키우고(constants.ts size ×1.32) 나무를 낮춰 1.4배쯤으로 맞춘다.
  // 테두리 숲(far-*)은 그대로 둔다 — 그쪽은 마을을 가리는 벽이라 클수록 좋다.
  "tree-golden-canopy": {
    glb: "nature/tree-golden-canopy.glb",
    h: 1.743,
    m: 3.6
  },
  "tree-emerald-crown": {
    glb: "nature/tree-emerald-crown.glb",
    h: 1.897,
    m: 4.0
  },
  "tree-sakura": {glb: "nature/tree-sakura.glb", h: 1.809, m: 3.6},
  "flower-bed": {glb: "nature/tree-petal-parade.glb", h: 0.877, m: 0.8},
  "berry-bush": {glb: "nature/bush-emerald-berry.glb", h: 1.137, m: 1.3},
  boulder: {glb: "nature/rock-verdant-boulder.glb", h: 1.281, m: 1.7},
  stones: {glb: "nature/rock-three-stones.glb", h: 0.784, m: 0.9},

  // ─── 멀리 세울 대역 모델 ────────────────────────────────────────────────────
  // scripts/bake-impostors.mjs 가 구운 교차 빌보드. 그루당 4삼각형이라 백 그루를
  // 심어도 400이다 — 원본 나무 한 그루가 8,932인 걸 생각하면 사실상 공짜다.
  // 원본과 같은 좌표계·같은 bbox 중심으로 구웠으므로 h·m 을 원본과 똑같이 적으면
  // scaleOf/liftOf 가 그대로 맞는다 (h는 raw 원본 실측값).
  //
  // 캐릭터가 걸어 들어가는 자리(앞마당·길가·광장)에는 쓰지 않는다. 바로 밑에서
  // 올려다보면 판때기 두 장인 게 보인다. 마을 테두리 숲과 먼 빈 잔디 전용.
  "far-oak": {glb: "impostor/tree-golden-canopy.glb", h: 1.746, m: 5.4},
  "far-pine": {glb: "impostor/tree-emerald-crown.glb", h: 1.897, m: 6.6},
  "far-sakura": {glb: "impostor/tree-sakura.glb", h: 1.809, m: 5.0},
  "far-bush": {glb: "impostor/bush-emerald-berry.glb", h: 1.137, m: 1.6}
};

// ─── 난수·잡음 ────────────────────────────────────────────────────────────────
// 매번 같은 마을이 나와야 diff가 안 튄다. 시드 난수를 쓴다.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260809);

// 부드러운 값 잡음. 숲을 균일한 확률로 뿌리면 "점묘 같은 나무밭"이 되지만,
// 잡음으로 확률을 흔들면 빽빽한 덤불과 트인 공터가 생겨 숲처럼 읽힌다.
function hash2(i, j) {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const smooth = t => t * t * (3 - 2 * t);
function noise2(x, z) {
  const i = Math.floor(x),
    j = Math.floor(z);
  const fx = smooth(x - i),
    fz = smooth(z - j);
  const a = hash2(i, j),
    b = hash2(i + 1, j),
    c = hash2(i, j + 1),
    d = hash2(i + 1, j + 1);
  return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
}

// ─── 볼록 껍질 ────────────────────────────────────────────────────────────────
// "마을 안쪽 빈터"와 "마을 바깥"을 가르는 선. 안쪽 공터는 정원처럼 성기게 꾸미고,
// 바깥은 숲으로 두른다. 둘을 안 가르면 마을 한복판에 숲이 들어선다.
function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = list => {
    const out = [];
    for (const p of list) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2], out[out.length - 1], p) <= 0
      )
        out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...half(pts), ...half(pts.reverse())];
}

/** 점이 다각형 안인가 (반직선 교차) */
function inPolygon(poly, x, z) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i],
      [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
      inside = !inside;
  }
  return inside;
}

/** 다각형 경계까지의 거리 (안이면 음수) */
function polygonDistance(poly, x, z) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i],
      [xj, zj] = poly[j];
    const dx = xj - xi,
      dz = zj - zi;
    const len2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - xi) * dx + (z - zi) * dz) / len2));
    best = Math.min(best, Math.hypot(x - (xi + dx * t), z - (zi + dz * t)));
  }
  return inPolygon(poly, x, z) ? -best : best;
}

const round3 = v => Math.round(v * 1000) / 1000;
const scaleOf = kind => round3((KIT[kind].m * UNITS_PER_METER) / KIT[kind].h);

// Meshy 모델은 원점이 bbox 한가운데다(바닥 y ≈ −0.95). InstancedProps 는 position 에
// GLB 원점을 그대로 놓으므로, 바닥 오프셋만큼 올려야 땅에 선다. 안 올리면 절반이 묻힌다.
// 원본 높이의 절반이 곧 바닥까지의 거리다(모든 모델이 y 대칭으로 나온다).
const liftOf = kind => round3((KIT[kind].h / 2) * scaleOf(kind));

/** 정면(+Z 기준)이 (dx,dz) 방향을 보도록 하는 회전각 */
const faceTo = (dx, dz) => round3(Math.atan2(dx, dz));

// ─── 마을 읽기 ────────────────────────────────────────────────────────────────
const {buildings} = readVillage();
const layout = JSON.parse(readFileSync(LAYOUT, "utf8"));

const HUB = buildings.find(b => b.id === "central-plaza");
const OUTER = buildings.filter(b => b.id !== "central-plaza");
const centers = districtCenters(OUTER);

// 앞마당 원반 — generate-ground-layout.mjs 와 같은 식이어야 한다.
// 어긋나면 장식물이 원반 위에 올라타므로, 실제로 깔린 타일과 대조해 검산한다.
const PLAZA_RADIUS_AT_1 = 0.95;
// generate-ground-layout.mjs 의 FORECOURT_DRAW 와 같은 값이어야 한다.
// 바로 아래 가드가 어긋나면 잡아 준다 — 실제로 원반을 줄일 때 여기서 걸렸다.
const FORECOURT_DRAW = 0.77;
const discs = OUTER.map(b => ({
  x: b.x,
  z: b.z,
  r: (Math.max(b.w, b.d) / 2 + 0.55) * FORECOURT_DRAW
}));
{
  const yards = new Map(
    layout.props
      .filter(p => p.id.startsWith("ground-yard-"))
      .map(p => [
        p.id.slice("ground-yard-".length),
        p.scale * PLAZA_RADIUS_AT_1
      ])
  );
  for (const b of OUTER) {
    const actual = yards.get(b.id);
    const mine = (Math.max(b.w, b.d) / 2 + 0.55) * FORECOURT_DRAW;
    if (actual !== undefined && Math.abs(actual - mine) > 0.02)
      throw new Error(
        `앞마당 반지름이 바닥 레이아웃과 어긋납니다 (${
          b.id
        }: 여기 ${mine.toFixed(2)} vs 타일 ${actual.toFixed(2)}).\n` +
          `  generate-ground-layout.mjs 의 식이 바뀌었다면 이 파일의 discs 계산도 맞춰주세요.`
      );
  }
}
const HUB_DISC = layout.props.find(p => p.id === "ground-plaza-center");
const HUB_RADIUS = (HUB_DISC?.scale ?? 4.84) * PLAZA_RADIUS_AT_1;

// 길 — 바닥 레이아웃에 깔린 길 타일 + 다리 칸 + **섬 차선**이 곧 길이다.
//
// **다리로 건너는 칸도 길이다.** 바닥 생성기가 물이 지나는 길 타일을 걷어내는데
// (안 그러면 길이 물보다 1cm 높아 물을 덮는다), 그 칸을 길에서 빼면 여기 규칙이
// 줄줄이 어긋난다: 담장이 그 자리를 "길이 아니다"로 보고 **구역 대문을 막아
// 버리고**(문 49곳 → 40곳), 가로등·나무가 다리 앞에 선다.
//
// 섬 차선(laneCells)도 같은 이유로 길이다 — 담장은 스포크가 테두리를 가로지르는
// 자리에서 끊겨야 하고, 프롭이 차선 위에 서면 안 된다. 단, 가로등·깃대처럼
// **길 방향**이 필요한 규칙은 격자 타일(tileRoads)에만 돌린다 — 차선은 격자가
// 아니라 이웃 판정(hasWE)이 안 먹는다. 차선용 가로등은 접선(tx,tz)을 아는
// 전용 절이 따로 있다.
const tileRoads = layout.props
  .filter(p => p.glb.includes("/path-"))
  .map(p => ({x: p.position[0], z: p.position[2]}));
const LANE_CELLS = TERR.laneCells ?? [];
/** 방사 스포크 표본만 — 담장을 끊는 "대문" 판정은 이것만 본다.
 *  고리 차선(테두리를 도는 것)까지 대문으로 치면 담장이 전부 걷힌다. */
const SPOKE_CELLS = LANE_CELLS.filter(c => c.s);
const nearSpoke = (x, z, d = 1.3) =>
  SPOKE_CELLS.some(c => Math.hypot(c.x - x, c.z - z) < d);
const roads = [
  ...tileRoads,
  ...(TERR.bridgeCells ?? []),
  ...LANE_CELLS.map(c => ({x: c.x, z: c.z}))
];
if (roads.length < 20)
  throw new Error(
    `길 타일을 ${roads.length}장밖에 못 찾았습니다 — 먼저 바닥을 생성하세요`
  );

// 타일 간격 — 격자 타일끼리 가장 가까운 거리 (차선 표본은 간격이 달라 뺀다)
const PITCH = round3(
  Math.min(
    ...tileRoads.slice(0, 40).flatMap((a, i) =>
      tileRoads
        .slice(0, 40)
        .filter((_, j) => j !== i)
        .map(b => Math.hypot(a.x - b.x, a.z - b.z))
    )
  )
);
/** 포장 폭의 절반 + 여유 — 이만큼 비켜야 길 위에 안 선다 */
const ROAD_SIDE = round3(PITCH * 0.33);
const HALF_TILE = round3(PITCH / 2);

const onRoad = (x, z, slack = 0) =>
  roads.some(
    r =>
      Math.abs(r.x - x) < ROAD_SIDE + slack &&
      Math.abs(r.z - z) < ROAD_SIDE + slack
  );
const onDisc = (x, z, slack = 0) =>
  discs.some(d => Math.hypot(d.x - x, d.z - z) < d.r + slack) ||
  Math.hypot(HUB.x - x, HUB.z - z) < HUB_RADIUS + slack;
// 건물이 임의 각으로 돌므로(고리 배치) 발자국은 회전 상자(OBB)로 잰다
const onBuilding = (x, z, slack = 0) =>
  buildings.some(b => obbContains(b, x, z, slack));

const props = [];
const taken = [];
/** 이미 놓은 장식물과 겹치지 않는가 */
const free = (x, z, gap) =>
  !taken.some(t => Math.hypot(t.x - x, t.z - z) < gap);

// ─── 담장 선분 ────────────────────────────────────────────────────────────────
// ②-d 가 채운다. 길이 1.94 · 두께 0.4 짜리 **선분**이라 taken 의 점 하나로는
// 표현이 안 된다. 길이 방향과 두께 방향을 따로 재야 담장 옆에 가로등을 붙여
// 세울 수 있다 (원으로 막으면 블록 둘레가 통째로 죽는다).
const walls = [];
const WALL_HALF_LEN = 0.97;
const WALL_HALF_THICK = 0.2;
const onWall = (x, z, slack = 0) =>
  walls.some(w => {
    const dx = x - w.x,
      dz = z - w.z;
    const along = Math.abs(dx * w.ax + dz * w.az);
    const perp = Math.abs(dx * -w.az + dz * w.ax);
    return along < WALL_HALF_LEN + slack && perp < WALL_HALF_THICK + slack;
  });

// ─── 걸어 다니는 구역 ─────────────────────────────────────────────────────────
// CharacterController 는 캐릭터를 광장 중심의 원반 안에 가둔다. 3인칭 카메라는
// 그 뒤 5.5·높이 3.8 이라, 이 안에서는 눈높이에서 물건을 코앞에 두고 본다.
// 빌보드는 그 각도에서 바로 들통난다 — 십자의 옆날이 판때기로 보인다(실제로 봤다).
// 그래서 이 안에서는 대역 모델을 쓰지 않고 원본으로 바꿔 심는다.
// 범위는 **원본(src/lib/villageWalk.ts)에서 읽는다.** 예전엔 여기 사각형을 손으로
// 적고 주석에 컨트롤러 값을 옮겨 놨는데, 애초에 둘이 다른 값이었다.
const WALK_RADIUS = readWalkRadius();
// 걷는 경계가 원반(r 18)에서 **석호 껍질**로 바뀌었다(물에 들어갈 수 있게 되면서
// "섬 = 껍질 안"이 경계다). WALK_RADIUS 는 이제 껍질을 감싸는 성긴 원(35)일 뿐이라
// 그걸 쓰면 껍질 밖 벌판·숲 모서리(r 33~35)까지 원본으로 바꿔 심게 된다 —
// 실제 경계와 같은 껍질 판정을 쓴다.
const inWalkZone = (x, z) =>
  LAGOON.length >= 3 ? inLagoon(x, z) : Math.hypot(x, z) < WALK_RADIUS;
// 대역 모델 → 원본 대응표. null 이면 아예 심지 않는다.
// 덤불만 null 인 이유: 원본이 13,514 삼각형이라(잎마다 UV 섬이라 simplify가 안 먹는다)
// 걸어 다니는 구역 안 30그루를 원본으로 바꿨더니 그것만 40만이 됐다. 게다가 이
// 구역은 광장이라 벤치·화분·가로등·분수로 이미 꽉 차 있어 덤불이 없어도 안 휑하다.
const REAL_OF = {
  "far-oak": "tree-golden-canopy",
  "far-pine": "tree-emerald-crown",
  "far-sakura": "tree-sakura",
  "far-bush": null
};
/** 덤불 자리를 대신 채울 것 — 원본이라도 2~3천이라 부담이 없고 입체감이 산다.
 *  걸어 다니는 구역은 카메라가 가장 오래 머무는 데라, 종류를 늘려 같은 물건이
 *  반복되는 티를 지운다. 전부 decor/ 폴더라 simplify가 잘 먹은 것들이다. */
//
//  화분(5,156)·벤치(5,831)를 섞어 썼다가 뺐다. 여기 심기는 자리가 서른 곳 가까이
//  되는데, 비싼 둘이 절반을 차지하면서 그것만 8만 삼각형이었다. 바위 계열은
//  2,058~3,291 이라 셋을 놓아도 화분 하나 값이다.
const BUSH_STANDIN = [
  "boulder",
  "stones",
  "boulder",
  "barrel-iron",
  "stones",
  "boulder",
  "stones"
];
let promoted = 0;
let dropped = 0;
function kindFor(kind, x, z) {
  if (!(kind in REAL_OF) || !inWalkZone(x, z)) return kind;
  if (REAL_OF[kind] === null) {
    // 전부 빼 버리면 광장 앞 잔디가 휑해진다. 처음엔 셋에 하나(0.36)만 남겼는데,
    // 실측해 보니 장식물 901개 중 걸어 다니는 구역 안에 있는 건 163개뿐이었다 —
    // 바깥 숲은 빽빽한데 정작 카메라가 사는 안쪽이 비어 있었다. 대부분 바꿔 심는다.
    if (rand() < 0.78) {
      promoted += 1;
      return BUSH_STANDIN[Math.floor(rand() * BUSH_STANDIN.length)];
    }
    dropped += 1;
    return null;
  }
  promoted += 1;
  return REAL_OF[kind];
}

// grow: 크기 배수. 같은 GLB를 수십 그루 심을 땐 이걸 흔들어야 복제 티가 안 난다.
// 띄우는 높이도 같은 배수로 커져야 발밑이 땅에 붙는다.
function place(
  id,
  rawKind,
  x,
  z,
  rotationY = 0,
  {grow = 1, onWater = false} = {}
) {
  const kind = kindFor(rawKind, x, z);
  if (kind === null) return false;
  // 물 위 금지 — 여기가 모든 장식물이 지나는 유일한 길목이라 여기서 한 번만 막는다.
  //
  // 해자를 피하는 코드는 원래 숲 쪽(landmarks 금지 원)에만 있었다. 구역을 고리로
  // 재배치하며 민가·담장 띠가 바깥으로 밀리자, 숲이 아닌 그 둘이 물 위에 섰다.
  // 프롭 종류마다 회피를 따로 붙이면 새 종류가 생길 때마다 같은 사고가 난다.
  // 물 위에 서야 하는 것(다리·폭포)만 onWater 로 빠져나간다.
  if (!onWater && (inMoatWater(x, z) || inInnerWater(x, z))) return false;
  // 물가 턱에 걸치면 반은 축대에 박히고 반은 뜬다. 예외 셋 — 계단은 그 턱을
  // 오르라고 있는 물건이고, 울타리(fence-rail)와 돌담(wall-low)은 **턱 위
  // 난간**이라 물가에 서는 게 목적 그 자체다(두께 0.13/0.4 라 삐져나올 몸이 없다).
  // 이 규칙이 구역 섬 울타리 50토막을, 다음엔 물가 쪽 돌담 호를 통째로
  // 소리 없이 거부하고 있었다 — 섬 테두리가 물가에서만 뻥 뚫린 원인.
  if (
    !onWater &&
    kind !== "terrace-stair" &&
    kind !== "fence-rail" &&
    kind !== "wall-low" &&
    nearShore(x, z)
  )
    return false;
  props.push({
    id: `decor-${id}`,
    glb: `/models/props/${KIT[kind].glb}`,
    position: [round3(x), round3(liftOf(kind) * grow), round3(z)],
    rotationY,
    scale: round3(scaleOf(kind) * grow)
  });
  taken.push({x, z});
  return true;
}

/**
 * 길·건물·원반·기존 장식물을 피해 (x,z) 근처에서 빈자리를 찾는다.
 *
 * `allowDisc` 는 앞마당 원반 **안**에도 놓게 해 준다. 원반은 캐릭터가 걸어
 * 다니는 바닥이라 기본값으로 통째로 막아 두는데, 그 탓에 중앙 광장은 기념비
 * 발치 반경 5유닛이 언제나 맨바닥이었다 — 장식이 전부 원반 밖 r 5.8~10.8 에만
 * 깔려 도넛처럼 보였다. 기념비를 두르는 화단처럼 **일부러 안쪽에 놓는 것**만
 * 이걸 켠다.
 */
function findSpot(
  x,
  z,
  {gap = 0.9, radius = 2.4, avoidRoad = true, allowDisc = false} = {}
) {
  for (let ring = 0; ring <= 6; ring++) {
    const dist = (ring / 6) * radius;
    const steps = ring === 0 ? 1 : 8 + ring * 4;
    for (let a = 0; a < steps; a++) {
      const angle = (a / steps) * Math.PI * 2 + ring * 0.37;
      const px = x + Math.cos(angle) * dist;
      const pz = z + Math.sin(angle) * dist;
      if (avoidRoad && onRoad(px, pz, 0.35)) continue;
      if (!allowDisc && onDisc(px, pz, 0.15)) continue;
      if (onBuilding(px, pz, 0.7)) continue;
      if (onWall(px, pz, 0.25)) continue;
      if (!free(px, pz, gap)) continue;
      return {x: px, z: pz};
    }
  }
  return null;
}

const skipped = [];
function tryPlace(id, kind, x, z, rotationY = 0, opts = {}) {
  const spot = findSpot(x, z, opts);
  if (!spot) {
    skipped.push(id);
    return false;
  }
  return place(id, kind, spot.x, spot.z, rotationY, opts);
}

// ─── ① 지구 입구 ──────────────────────────────────────────────────────────────
// 컨셉 아트의 구역 입구는 세 가지가 한 벌이다:
//   길을 가로지르는 커다란 현판 아치 + 양옆을 받치는 석축 + 좌우 깃대.
// 그래서 광장에서 보면 "저기부터 PROJECTS 구역"이 한눈에 읽힌다.
// 우리는 높이 1유닛짜리 팻말 하나를 길가에 비켜 세워 놨을 뿐이었다.
//
// 이제 여섯 구역 모두 아치가 있다. 팻말(SIGN_OF)은 아치가 없는 구역용
// 대역이었는데, 남은 구역이 없어서 실제로는 아무 데도 안 붙는다 —
// 아치 에셋이 깨져서 되돌려야 할 때를 대비해 표만 남겨 둔다.
const ARCH_OF = {
  projects: "arch-projects",
  study: "arch-study",
  experience: "arch-experience",
  life: "arch-life",
  skills: "arch-skills",
  contact: "arch-contact"
};
const SIGN_OF = {
  study: "sign-study",
  projects: "sign-projects",
  skills: "sign-skills",
  experience: "sign-experience",
  contact: "sign-contact"
};

/** 구역별 입구 지점 — ⑬ 깃대 행렬이 이 자리를 다시 쓴다 */
const gateways = [];

// 대문 자리는 이제 길 칸이 아니라 **섬의 광장 쪽 테두리**다 — 둑길 스포크가
// 테두리를 가로지르는 각도(방위 그대로)에 아치를 세우면, 다리를 건너 섬에
// 오르는 사람의 머리 위로 현판이 지나간다.
for (const isl of TERR_ISLANDS) {
  const district = isl.district;
  const len = Math.hypot(isl.x, isl.z) || 1;
  const dir = {x: isl.x / len, z: isl.z / len}; // 광장 → 섬 방향
  // 테두리에서 1.15 안쪽 — 물가 금지(nearShore 0.9)에 안 걸리는 한계선
  const at = {
    x: isl.x - dir.x * (isl.r - 1.15),
    z: isl.z - dir.z * (isl.r - 1.15)
  };
  const perp = {x: -dir.z, z: dir.x};
  const facing = faceTo(-dir.x, -dir.z); // 광장 쪽을 본다
  const arch = ARCH_OF[district];
  gateways.push({district, at, dir, perp, facing, arch: Boolean(arch)});

  if (arch) {
    // 아치는 스포크 차선을 **가로질러** 선다 — 비켜 세우면 그냥 큰 간판이 된다.
    place(`arch-${district}`, arch, at.x, at.z, facing, {gap: 0.1});

    // 아치 양옆을 받치는 석축. 차선 폭 밖으로 밀어 세워야 통행을 안 막는다.
    for (const side of [-1, 1]) {
      const px = at.x + perp.x * (ROAD_SIDE + 1.15) * side;
      const pz = at.z + perp.z * (ROAD_SIDE + 1.15) * side;
      if (onBuilding(px, pz, 0.4) || onDisc(px, pz, 0.1)) continue;
      place(
        `pier-${district}-${side > 0 ? "r" : "l"}`,
        "terrace-wall",
        px,
        pz,
        facing,
        {gap: 0.4}
      );
    }
  } else {
    // 아치가 없는 구역 — 예전처럼 길가 팻말
    const x = at.x + perp.x * (ROAD_SIDE + 0.55);
    const z = at.z + perp.z * (ROAD_SIDE + 0.55);
    place(`sign-${district}`, SIGN_OF[district], x, z, facing, {gap: 1.2});
  }
}

// ─── ①-b 섬 미니광장 한가운데 ────────────────────────────────────────────────
// 컨셉의 섬마다 가운데 둥근 광장과 **분수(또는 기념물)**가 있다 — 건물들이
// 이걸 둘러싸고 앉아야 "둘러앉음"이 완성된다. 자리는 생성기가 계산한
// commons(미니광장) 중심 그대로다. 여섯 개가 전부 분수면 복제 티가 나므로
// 구역 성격대로 섞는다.
{
  const CENTER_OF = {
    projects: "fountain", // 프로젝트 — 광장 분수
    skills: "lantern-bearer", // 기술 — 등불 든 석상
    life: "fountain", // 생활 — 분수 (컨셉 이미지의 LIFE 도 분수다)
    experience: "well", // 경험 — 우물 (기록을 길어 올리는 자리)
    study: "candle-tome", // 학습 — 촛불 얹은 큰 책
    contact: "notice-board" // 연락 — 게시판
  };
  let put = 0;
  for (const c of TERR.commons ?? []) {
    const kind = CENTER_OF[c.district] ?? "fountain";
    // 광장 쪽을 본다 — 다리를 건너 들어온 사람 정면
    if (
      place(`plazita-${c.district}`, kind, c.x, c.z, faceTo(-c.x, -c.z), {
        gap: 0.5
      })
    )
      put += 1;
  }
  console.log(`  섬 미니광장 기념물 ${put}/${(TERR.commons ?? []).length}곳`);
}

// 중앙 광장 간판은 원반 남쪽 가장자리에서 바깥(남)을 본다
place(
  "sign-plaza",
  "sign-plaza",
  HUB.x,
  HUB.z + HUB_RADIUS + 0.7,
  faceTo(0, 1),
  {gap: 1.2}
);

// ─── ② 지구별 랜드마크 ────────────────────────────────────────────────────────
// 지구 성격에 맞는 물건을 지구 중심 근처 빈자리에 놓는다.
const LANDMARKS = {
  study: ["candle-tome", "notice-board"],
  projects: ["market-stall", "sign-theme-project"],
  skills: ["stump-forge"],
  experience: ["scroll-barrel", "barrel-iron"],
  life: ["campfire", "lute-picnic", "bench"],
  contact: ["mailbox"]
};

for (const [district, kinds] of Object.entries(LANDMARKS)) {
  const c = centers[district];
  if (!c) continue;
  for (const kind of kinds) {
    // 지구 안쪽을 보도록 — 광장에서 온 사람 쪽으로 정면을 돌린다
    const len = Math.hypot(c.x, c.z) || 1;
    tryPlace(
      `${district}-${kind}`,
      kind,
      c.x,
      c.z,
      faceTo(-c.x / len, -c.z / len),
      {
        gap: 1.4,
        radius: 4.5
      }
    );
  }
}

// 광장 랜드마크 — 원반 바로 바깥에 분수·우물·석상을 삼각형으로
const PLAZA_LANDMARK_RING = [
  {kind: "fountain", angle: -Math.PI / 2},
  {kind: "well", angle: Math.PI / 6},
  {kind: "lantern-bearer", angle: (Math.PI * 5) / 6}
];
for (const {kind, angle} of PLAZA_LANDMARK_RING) {
  const dist = HUB_RADIUS + 1.5;
  const x = HUB.x + Math.cos(angle) * dist;
  const z = HUB.z + Math.sin(angle) * dist;
  // 광장 안쪽을 본다
  tryPlace(`plaza-${kind}`, kind, x, z, faceTo(HUB.x - x, HUB.z - z), {
    gap: 1.6,
    radius: 2.0
  });
}

// ─── ②-a2 광장 안뜰 ──────────────────────────────────────────────────────────
// 컨셉 아트의 광장은 기념비를 중심으로 **동심원**이다: 기념비 → 발치를 두른
// 화단과 등불 → 트인 보행 공간 → 가장자리의 벤치와 깃대.
//
// 여기는 그 안쪽 두 겹이 통째로 없었다. findSpot 이 앞마당 원반(r 5.0) 안을
// 전부 막아 놔서, 장식이 원반 **밖에만** 깔렸기 때문이다 — 반경 11 안 장식물
// 128개가 전부 r 5.8~10.8 에 있었고 기념비 둘레는 맨 판석이었다.
//
// 두 겹을 넣는다:
//   ⓐ 발치 고리 — 기념비 상자(반폭 2.4) 바로 바깥. 화단과 등불을 번갈아.
//   ⓑ 벤치 — 원반 가장자리에서 기념비를 바라보게. 앉는 자리라 등을 밖으로 둔다.
//
// **대각선에만 놓는다.** 광장을 남북·동서로 가로지르는 대로가 축 위에 있어,
// 축 방향에 물건을 두면 마을의 등뼈를 막는다. findSpot 도 길을 피하지만,
// 애초에 안 겹치게 각을 고르는 편이 자리를 밀리지 않아 배열이 정연하다.
{
  const HALF_MONUMENT = Math.max(HUB.w, HUB.d) / 2; // 4.75 × 1.4 → 반폭 3.33
  const FOOT_R = HALF_MONUMENT + 1.15; // 발치 고리 — 원반(5.0) 안쪽에 들어간다

  // 축을 비켜선 각도 n개 — 0°/90°/180°/270° 로는 대로가 지나간다.
  // 반 칸(π/n) 밀어서 시작해야 축을 피한다. 그냥 2π/n 로 돌리면 n 이 짝수일 때
  // 반드시 축 위에 얹힌다(45°씩 여덟이면 90°·180°·270° 가 그대로 걸린다).
  const offAxis = n =>
    Array.from({length: n}, (_, k) => Math.PI / n + (k * 2 * Math.PI) / n);

  // ⓐ 발치 고리: 화단 4 + 등불 4 를 45° 간격으로 번갈아
  offAxis(8).forEach((angle, n) => {
    const kind = n % 2 === 0 ? "flowerbed-round" : "orb-lantern";
    const x = HUB.x + Math.cos(angle) * FOOT_R;
    const z = HUB.z + Math.sin(angle) * FOOT_R;
    // 반지름을 좁게 준다 — 넓으면 자리를 못 찾은 것이 바깥으로 밀려나 고리가 흐트러진다
    tryPlace(`plaza-foot-${n}`, kind, x, z, faceTo(HUB.x - x, HUB.z - z), {
      gap: 1.0,
      radius: 0.55,
      allowDisc: true
    });
  });

  // ⓑ 벤치는 분수·우물·석상과 **같은 고리**에, 그 셋 사이 빈 각도로 넣는다.
  //
  // 처음엔 원반 안쪽 가장자리에 뒀는데 발치 고리와 반지름이 4.5 로 겹쳤다 —
  // 기념비 반폭이 3.33 이라 원반(5.0) 안에는 고리를 한 겹밖에 못 넣는다.
  // 셋뿐이던 랜드마크 고리에 셋을 더해 60° 간격 여섯으로 만드는 편이,
  // 부감에서 광장이 동심원으로 읽히는 데 훨씬 낫다.
  PLAZA_LANDMARK_RING.forEach(({angle}, n) => {
    const next =
      PLAZA_LANDMARK_RING[(n + 1) % PLAZA_LANDMARK_RING.length].angle;
    const span = (next - angle + Math.PI * 2) % (Math.PI * 2);
    const mid = angle + span / 2;
    const x = HUB.x + Math.cos(mid) * (HUB_RADIUS + 1.5);
    const z = HUB.z + Math.sin(mid) * (HUB_RADIUS + 1.5);
    // 앉으면 기념비가 보이도록 정면을 광장 안쪽으로
    tryPlace(`plaza-bench-${n}`, "bench", x, z, faceTo(HUB.x - x, HUB.z - z), {
      gap: 1.4,
      radius: 1.6
    });
  });
}

// ─── ②-b 채움 민가 ────────────────────────────────────────────────────────────
// 컨셉 아트의 블록에는 이름표가 붙은 건물 3~4채 뒤로 이름 없는 집이 잔뜩 서 있다.
// 그 집들이 "구역"을 "동네"로 만든다. 우리 블록은 3채가 덩그러니 있어서, 배치를
// 아무리 정연하게 잡아도 모형 전시대처럼 보였다.
//
// 클릭도 NPC도 없는 순수 배경이므로 constants.ts 가 아니라 장식물로 넣는다 —
// 건물로 넣으면 NPC 로스터와 섹션 패널까지 딸려 온다(npcRoster 가 건물마다
// npc-${id} 를 자동 생성한다).
//
// 광장에서 **먼** 자리부터 채운다. 앞줄에 끼워 넣으면 진짜 건물을 가린다.
//
// ②-d 담장이 이 결과를 받아 블록을 두르므로, 여기서 구역별 블록 상자를 남긴다.
/** district → 그 구역이 실제로 차지한 사각형 (채움 민가까지 포함) */
const blockRect = new Map();
{
  // 블록이 클수록 뒤에 붙는 집도 많다. 한 채가 8~12천 삼각형이라 헤프게 못 쓴다.
  // 3·2·2·2·2·1(12채)로는 담장 안이 텅 비어 보였다. 삼각형 상한을 180만으로
  // 올렸으니(PerfHud) 집 한 채 8~12천은 감당된다 — 블록이 차 보이는 데 이만한
  // 수단이 없다. 컨셉 아트의 블록은 이름표 붙은 건물 서넛 + 이름 없는 집 대여섯이다.
  // 컨셉 아트의 블록은 이름표 붙은 건물 서넛 뒤로 이름 없는 집이 대여섯 겹으로
  // 들어차 있다. 7/6/6/6/6/5 로 요청해 25채가 섰는데 아직 성겼다 — 요청을 올린다
  // (자리를 못 찾으면 알아서 덜 선다).
  // 고리 배치로 바꾸며 한 채당 6개 → 구역당 6~9로 줄였다. 섬 내부가 고리·차선·
  // 미니광장으로 이미 차서 민가가 낄 자리도 줄었고, 예산도 1,800k 를 넘겼다
  // (민가 한 채가 8~12k 라 여기가 가장 굵은 손잡이다).
  const PER_DISTRICT = {
    projects: 9,
    skills: 8,
    life: 8,
    experience: 7,
    study: 7,
    contact: 6
  };
  // 두 종으로 12채를 돌려쓰니 위에서 보면 같은 집이 여섯 번씩 나왔다. 세 종이면
  // 한 구역 안에서는 같은 집이 두 번 안 나온다(구역당 최대 3채).
  const KINDS = ["house-a", "house-b", "house-c"];
  let n = 0;
  for (const [district, count] of Object.entries(PER_DISTRICT)) {
    const group = OUTER.filter(b => b.district === district);
    if (group.length === 0) continue;
    // 블록 상자를 집 한 채 폭만큼 바깥으로 넓힌 범위가 후보 영역
    const PAD = 3.4;
    const x0 = Math.min(...group.map(b => b.x - b.w / 2)) - PAD;
    const x1 = Math.max(...group.map(b => b.x + b.w / 2)) + PAD;
    const z0 = Math.min(...group.map(b => b.z - b.d / 2)) - PAD;
    const z1 = Math.max(...group.map(b => b.z + b.d / 2)) + PAD;

    // 블록이 광장에서 뻗어 나가는 방향 — 집은 이 방향 **뒤쪽**에 붙인다
    const cx = group.reduce((s, b) => s + b.x, 0) / group.length;
    const cz = group.reduce((s, b) => s + b.z, 0) / group.length;
    const clen = Math.hypot(cx, cz) || 1;
    const out = {x: cx / clen, z: cz / clen};

    // 뒷줄이 어디까지 나가 있나 — 집은 그 바로 뒤 한 채 폭 띠에 붙인다
    const backEdge = Math.max(
      ...group.map(
        b => (b.x - cx) * out.x + (b.z - cz) * out.z + Math.max(b.w, b.d) / 2
      )
    );
    const halfWide =
      Math.max(
        ...group.map(b => Math.abs((b.x - cx) * -out.z + (b.z - cz) * out.x))
      ) + 1.4;
    const target = backEdge + 1.9;

    const cand = [];
    for (let x = x0; x <= x1; x += 0.7) {
      for (let z = z0; z <= z1; z += 0.7) {
        if (onRoad(x, z, 0.8) || onDisc(x, z, 0.5) || onBuilding(x, z, 1.2))
          continue;
        // 블록 중심 기준으로 "얼마나 뒤쪽인가"와 "얼마나 옆으로 벗어났나"
        const dx = x - cx,
          dz = z - cz;
        const behind = dx * out.x + dz * out.z;
        const lateral = Math.abs(dx * -out.z + dz * out.x);
        if (lateral > halfWide) continue;
        cand.push({x, z, behind, lateral});
      }
    }
    // 처음엔 "광장에서 먼 순", 다음엔 "블록 뒤쪽일수록 좋음"으로 골랐다. 둘 다
    // 집을 블록 **대각 모서리 바깥**으로 밀어냈다 — 후보 영역이 사각형이라
    // 어느 방향이든 "가장 뒤"는 꼭짓점이기 때문이다(실제로 12채가 다 그렇게 섰다).
    // 최댓값이 아니라 **목표 거리**를 잡는다: 뒷줄 바로 뒤, 블록 폭 안쪽.
    //
    // 그리고 띠 하나로는 블록이 안 찬다. 담장을 두르고 나서 부감으로 보니
    // 여섯 블록이 다 "담 안에 건물 서넛, 나머지는 빈 돌마당"이었다 — 컨셉 아트의
    // 블록은 이름표 붙은 건물 뒤로 집이 두세 줄 더 들어차 있다.
    // 뒷줄 바로 뒤 → 그 뒤 한 줄 더 → 앞줄 옆구리 순으로 세 띠를 채운다.
    const BANDS = [target, target + 2.6, backEdge - 1.4];

    // 블록 상자 — 진짜 건물의 외곽에서 시작해 세운 집만큼 넓힌다
    const rect = {
      x0: Math.min(...group.map(b => b.x - b.w / 2)),
      x1: Math.max(...group.map(b => b.x + b.w / 2)),
      z0: Math.min(...group.map(b => b.z - b.d / 2)),
      z1: Math.max(...group.map(b => b.z + b.d / 2))
    };

    let put = 0;
    for (const band of BANDS) {
      if (put >= count) break;
      const ranked = cand
        .map(c => ({
          ...c,
          score: -Math.abs(c.behind - band) - c.lateral * 0.35
        }))
        .sort((a, b) => b.score - a.score);
      // 한 띠에 몰아넣지 않는다 — 앞 띠가 다 차 버리면 뒷줄이 안 생긴다
      const quota = Math.ceil(count / BANDS.length);
      let inBand = 0;
      for (const c of ranked) {
        if (put >= count || inBand >= quota) break;
        // 집끼리, 그리고 다른 장식물과 2.9유닛은 떨어뜨린다 (집 폭이 2.2~2.5다)
        if (!free(c.x, c.z, 2.9)) continue;
        // 정면은 광장 쪽 — 뒷줄이라도 앞을 보고 서야 마을이 한 방향으로 정돈된다.
        //
        // 다만 **정확히** 같은 각으로 세우면 안 된다. 구역마다 회전이 딱 하나뿐이라
        // 34채가 고유 회전 6개를 돌려쓰고 있었고(실측), 3종을 번갈아 써도 위에서 보면
        // 같은 집이 같은 각도로 찍힌 게 그대로 읽혔다. 배율도 1.31~1.47 로 사실상
        // 균일했다. ±17° 와 ±13% 를 흔들면 "광장을 보고 선 줄"은 살아 있으면서
        // 복제 티만 사라진다 — 컨셉 아트의 민가도 줄은 맞되 각도가 제각각이다.
        place(
          `house-${n}`,
          KINDS[n % KINDS.length],
          c.x,
          c.z,
          round3(faceTo(-out.x, -out.z) + (rand() - 0.5) * 0.6),
          {gap: 2.9, grow: round3(0.88 + rand() * 0.26)}
        );
        // 집 한 채가 대략 2.4유닛 폭이다 — 그 절반만큼 상자를 넓힌다
        const HALF_HOUSE = 1.2;
        rect.x0 = Math.min(rect.x0, c.x - HALF_HOUSE);
        rect.x1 = Math.max(rect.x1, c.x + HALF_HOUSE);
        rect.z0 = Math.min(rect.z0, c.z - HALF_HOUSE);
        rect.z1 = Math.max(rect.z1, c.z + HALF_HOUSE);
        put += 1;
        inBand += 1;
        n += 1;
      }
    }
    blockRect.set(district, rect);
  }
}

// ─── ②-d 블록을 두르는 낮은 돌담 ──────────────────────────────────────────────
// 컨셉 아트를 우리 조감도와 나란히 놓고 가장 크게 다른 게 이것이었다. 컨셉의
// 여섯 구역은 각각 허리 높이 돌담에 둘러싸여 있어서, 이름표를 안 읽어도 덩어리가
// 여섯 개로 보인다. 우리는 포장 위에 건물이 흩어져 있을 뿐이라 어디서 어디까지가
// PROJECTS 인지 알 수가 없었다.
//
// 담을 두르되 **길이 지나는 칸은 비운다** — 그 틈이 곧 구역 대문이 되고,
// ① 에서 세운 현판 아치가 그 자리에 서 있다. 담이 끊긴 데로 걸어 들어가면
// 머리 위에 PROJECTS 현판이 지나가는 그림이 된다.
//
// **담장 선은 구역 단차의 윗단 테두리다.** 예전엔 블록 상자에서 1.45 밀어낸
// 자리였는데, 단차를 넣고 보니 그 선이 윗단·중간단·바닥을 가로질러서 담이
// 한 변 안에서 오르내리는 지그재그가 됐다(72/25/31토막이 서로 다른 단에 섰다).
// 윗단 테두리에 세우면 한 구역의 담이 전부 같은 높이에 서고, 두 단짜리 둔덕이
// 담 **바깥**에 드러나 밖에서 보면 축대 위 난간처럼 읽힌다.
{
  /** 한 토막 길이 (make-low-wall.mjs 의 LENGTH). 살짝 겹치게 놓아 틈을 막는다 */
  const STEP = 1.9;
  /** 단차 사각형 — 바닥 생성기(generate-ground-layout.mjs)가 내보낸 것 */
  const terr = JSON.parse(
    readFileSync("src/data/villageTerraces.json", "utf8")
  );
  /** 담장선 — 섬 물가에서 손톱만큼 안쪽 (부동소수로 물 판정되는 사고 방지) */
  const WALL_INSET = 0.35;

  /** 그 자리가 **섬 위인가 물/골짜기인가** — villageTerrain 과 같은 규칙 */
  const islands = terr.islands ?? [];
  const onPlateau = (x, z) =>
    islands.some(b => Math.hypot(x - b.x, z - b.z) <= b.r);
  let n = 0;
  let openings = 0;
  /** 길이 섬을 나서는 자리 — 아래에서 계단으로 채운다. nx/nz 는 바깥 방향. */
  const gateSteps = [];

  for (const isl of islands) {
    const district = isl.district;
    const R = isl.r - WALL_INSET;
    const count = Math.max(8, Math.round((2 * Math.PI * R) / STEP));
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2;
      const nx = Math.cos(a);
      const nz = Math.sin(a);
      const x = round3(isl.x + nx * R);
      const z = round3(isl.z + nz * R);
      // **스포크(다리로 나가는 방사 차선)나 격자 길이 테두리를 가로지르는
      // 자리만** 비운다 = 구역 대문. onRoad 를 쓰면 안 된다 — 테두리를 도는
      // 고리 차선(담장 안쪽 0.9)이 전부 "길"로 잡혀 담장이 한 토막도 못 선다
      // (실제로 182칸 전부 비었다).
      if (
        nearSpoke(x, z, 1.3) ||
        tileRoads.some(
          r => Math.abs(r.x - x) < 1.35 && Math.abs(r.z - z) < 1.35
        )
      ) {
        openings += 1;
        gateSteps.push({x, z, nx, nz});
        continue;
      }
      if (onBuilding(x, z, 0.15) || onDisc(x, z, 0.05)) continue;
      // 채움 민가·랜드마크가 이미 선 자리면 비켜 준다
      if (!free(x, z, 1.15)) continue;
      // 담장 긴 축(모델 +X)을 접선에 맞춘다. rotationY=r 은 +X 를
      // (cos r, -sin r) 로 돌리므로 접선 t=(-nz, nx) 에는 r = atan2(-nx, -nz).
      const rot = round3(Math.atan2(-nx, -nz));
      // 울타리는 점이 아니라 1.9짜리 선분이라 taken 의 한 점으로는 못 막는다.
      // 실제 선분으로 따로 재야 옆에 가로등을 붙여 세울 수 있다 (onWall).
      // **place 가 성공했을 때만** 등록한다 — 거부된 것을 등록하면 "유령
      // 담장"이 되어, 틈을 메우는 절(⑭-a)이 빈 자리를 이미 찼다고 보고
      // 건너뛴다(실제로 물가 호 전체가 그렇게 뚫린 채 남았다).
      //
      // 종류는 **나무 울타리**다. 돌담(wall-low)으로 둘렀더니 섬이 성벽에
      // 갇힌 요새로 읽혔다 — 컨셉의 섬 테두리는 나무 난간이고, 사용자도
      // 나무를 원했다. 돌은 마을 바깥 테두리(rimwall)에만 남는다.
      if (
        place(`wall-${district}-${n++}`, "fence-rail", x, z, rot, {gap: 1.15})
      )
        walls.push({x, z, ax: Math.cos(rot), az: Math.sin(rot)});
    }
  }
  console.log(`  담장 ${n}토막 · 길이 지나가 비운 자리 ${openings}곳`);

  // ─── 구역 대문 계단 ─────────────────────────────────────────────────────────
  // 위에서 비워 둔 자리마다 계단을 놓는다. 길 타일이 1.88 간격이라 한 대문에
  // 후보가 서넛씩 몰리므로, 3유닛 안에 이미 놓았으면 건너뛴다.
  {
    let put = 0;
    const here = [];
    for (const g of gateSteps) {
      if (here.some(q => Math.hypot(q.x - g.x, q.z - g.z) < 3.6)) continue;
      if (onBuilding(g.x, g.z, 0.2) || onDisc(g.x, g.z, 0.05)) continue;
      // 담장을 비운 이유가 "길이 스쳤다" 정도면 계단이 잔디 위에 혼자 선다.
      // 스포크 **한복판**일 때만 놓는다 — 대문다운 자리만 남는다.
      if (
        !nearSpoke(g.x, g.z, 0.8) &&
        !tileRoads.some(
          r => Math.abs(r.x - g.x) < 1.0 && Math.abs(r.z - g.z) < 1.0
        )
      )
        continue;
      // terrace-stair 는 **−Z 쪽으로 오른다**(bake-prop 옆면으로 확인 — 왼쪽이
      // −Z 이고 거기가 높다). 그러니 낮은 쪽 +Z 가 **구역 바깥**을 봐야 한다.
      // 직접 구웠던 쐐기는 반대로 올라가서 여기 부호가 뒤집혀 있었다.
      const facingOut = Math.atan2(g.nx, g.nz);
      // **경계선 위에 그대로 놓으면 안 된다.** 그 점은 단 안쪽으로 판정돼서
      // terrainHeightAt 이 1.1 을 얹어 버린다 — 계단이 단 위에 통째로 떠 있었다.
      // 안길이 절반만큼 바깥으로 빼면 밑동이 골짜기 바닥에서 시작해, 높은 쪽
      // 끝이 딱 단 모서리에 닿는다. 안길이 1.902 × 배율 1.484 = 2.82 → 절반 1.41.
      // 여기 g 는 담장선(PLATEAU_PAD −0.06)이고 진짜 단 경계는 0.06 더 밖이므로
      // 그만큼 더 민다. 담장선이 물가에서 0.35 안쪽이므로 1.41 + 0.35 = 1.76.
      // (원반 섬에서는 바깥 방향이 곧 방사 방향이라 법선 걱정이 없다.)
      const OUT = 1.76;
      const sx = round3(g.x + g.nx * OUT);
      const sz = round3(g.z + g.nz * OUT);
      // **밀어낸 자리가 또 단 위면 놓지 않는다.** 이웃한 두 구역의 단이 맞닿은
      // 변(예: SKILLS 남쪽 = LIFE 북쪽)에서는 밖으로 나가 봐야 옆 구역 단이라
      // 오를 턱 자체가 없다 — 그런데도 놓았더니 30개 중 9개가 평지 위에 선
      // 계단이 됐다(밑동 지면 1.1, 윗끝 지면 1.1). 격자로 검산해서야 찾았다.
      if (onPlateau(sx, sz)) continue;
      // 다리 어귀 계단은 얕은 물에 발을 담근 채 선다 — 물 금지를 일부러 푼다.
      // (돌계단이 수면에서 시작해 섬 테두리에 닿는, 컨셉의 그 그림이다)
      if (
        place(`gatestep-${put}`, "terrace-stair", sx, sz, round3(facingOut), {
          gap: 1.4,
          onWater: true
        })
      ) {
        here.push({x: sx, z: sz});
        put += 1;
      }
    }
    console.log(`  구역 대문 계단 ${put}곳`);
  }

  // ─── 광장 단상에는 계단 프롭을 안 놓는다 ────────────────────────────────────
  // 한때 대로 넷에 `terrace-stair` 를 세웠다. 단상 테두리와 물가 사이가 0.7 인데
  // 계단 모델 안길이가 2.8 이라 넣는 족족 물 위에 섰다(place 가 전부 되돌렸다).
  // 지금은 축대 단면 자체가 두 단짜리 계단이다 — VillageScene 의 DAIS_PROFILE.
}

// ─── ②-c 남쪽 정문 ────────────────────────────────────────────────────────────
// 컨셉 아트에서 마을로 들어오는 길은 남쪽 하나뿐이고, 광장까지 곧게 뻗은 그 길의
// 초입에 **큰 돌계단**이 있다. 마을의 첫 화면이자 유일한 정문이다.
// generate-ground-layout 의 CEREMONIAL 축(i=0)이 여기까지 이어져 있다.
const southGate = roads
  .filter(r => Math.abs(r.x) < HALF_TILE && r.z > 0)
  .sort((a, b) => b.z - a.z)[0];
if (southGate) {
  // 계단은 길 위에 얹는다 — 옆으로 비키면 아무 데도 안 가는 돌더미가 된다.
  // 구역 대문과 **같은 크기**로 둔다. 여긴 양쪽이 다 평지라 계단이 순전히 연출인데,
  // grow 로 더 키우면 대로를 가로막은 돌덩이로 보인다. KIT 기본(높이 1.54)만으로도
  // 예전(1.2)보다 크다.
  place("gate-stair", "terrace-stair", southGate.x, southGate.z, faceTo(0, 1), {
    gap: 0.1
  });
  // 계단 양옆 석축 — 진입로에 폭과 격을 준다
  for (const side of [-1, 1]) {
    place(
      `gate-pier-${side > 0 ? "r" : "l"}`,
      "terrace-wall",
      southGate.x + (ROAD_SIDE + 1.15) * side,
      southGate.z,
      faceTo(0, 1),
      {gap: 0.4}
    );
  }
}

// ─── ③ 마을 어귀 ──────────────────────────────────────────────────────────────
// 길의 끝은 지금 풀밭에서 그냥 뚝 끊긴다. 끝마다 문을 세우면 "여기서 마을이
// 끝난다"가 읽혀서 마을에 테두리가 생긴다.
//
// 끝 칸 = 이웃한 길 칸이 하나뿐인 칸. 그중 광장에서 먼 순으로 고른다.
/** 어귀 위치 — 울타리를 여기 길가에 세운다 */
const gates = [];
{
  const isRoad = (x, z) =>
    roads.some(r => Math.abs(r.x - x) < 0.05 && Math.abs(r.z - z) < 0.05);
  const ends = tileRoads
    .map(r => {
      const around = [
        [PITCH, 0],
        [-PITCH, 0],
        [0, PITCH],
        [0, -PITCH]
      ].filter(([dx, dz]) => isRoad(r.x + dx, r.z + dz));
      return {r, around};
    })
    .filter(e => e.around.length === 1)
    // 남쪽 정문은 ②-c 가 대계단으로 이미 꾸몄다 — 그 위에 또 문을 세우면 겹친다
    .filter(
      e =>
        !southGate ||
        Math.hypot(e.r.x - southGate.x, e.r.z - southGate.z) > PITCH * 1.5
    )
    .sort((a, b) => Math.hypot(b.r.x, b.r.z) - Math.hypot(a.r.x, a.r.z));

  ends.slice(0, 5).forEach((e, n) => {
    // 이웃이 있는 쪽이 마을 안쪽 — 문은 그 반대(바깥)를 향해 길을 가로막는다
    const [ix, iz] = e.around[0];
    const inward = {x: ix / PITCH, z: iz / PITCH};
    // 가장 먼 끝은 랜턴 아치(정문), 나머지는 나무 대문. 다섯을 넘기면 감옥처럼 보인다.
    const kind = n === 0 ? "lantern-archway" : "gate-arch";
    place(
      `gate-${n}`,
      kind,
      e.r.x - inward.x * HALF_TILE,
      e.r.z - inward.z * HALF_TILE,
      faceTo(inward.x, inward.z),
      {gap: 0.1}
    );
    gates.push({at: e.r, inward});
  });
}

// ─── ③-b 대로변 깃대 행렬 ─────────────────────────────────────────────────────
// 컨셉 아트에서 화면에 가장 많이 찍혀 있는 물건은 건물도 나무도 아니라 **깃대**다.
// 파랑·금빛 세로 깃발이 광장 둘레와 대로변에 줄줄이 서서, 위에서 내려다봐도
// "길"과 "그냥 포장된 땅"이 구분된다. 우리 마을엔 다섯 개뿐이었다.
//
// 마을 전체 길에 깔면 값도 값이지만(하나 3,483 삼각형) 어디가 대로인지가 흐려진다.
// 광장에서 뻗는 두 대로 — 남쪽 정문 진입 축과 동서 대로 — 에만 세운다.
//
// 예전엔 황금잎 깃대(leaf-banner)를 대신 썼다. 그건 잎사귀 장식이지 깃발이 아니라,
// 컨셉 아트의 "파랑 바탕에 금색 문장" 세로기와 모양이 아예 달랐다.
{
  const EVERY = 3; // 몇 칸마다
  const REACH = 18; // 광장에서 이 거리까지만 (깃대가 제대로 생겼으니 조금 더 멀리)
  const onAxis = tileRoads
    .filter(r => Math.abs(r.x) < HALF_TILE || Math.abs(r.z) < HALF_TILE)
    .filter(r => Math.hypot(r.x, r.z) < REACH)
    .sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));

  let n = 0;
  for (let i = 0; i < onAxis.length; i += EVERY) {
    const r = onAxis[i];
    // 남북 축 칸이면 좌우(=x)로, 동서 축 칸이면 앞뒤(=z)로 비켜 세운다
    const northSouth = Math.abs(r.x) < HALF_TILE;
    const perp = northSouth ? {x: 1, z: 0} : {x: 0, z: 1};
    for (const side of [-1, 1]) {
      const x = r.x + perp.x * (ROAD_SIDE + 0.45) * side;
      const z = r.z + perp.z * (ROAD_SIDE + 0.45) * side;
      if (
        onDisc(x, z, 0.1) ||
        onBuilding(x, z, 0.4) ||
        onWall(x, z, 0.25) ||
        !free(x, z, 1.2)
      )
        continue;
      // 깃발 면이 길을 향하도록 — 걸어가는 사람에게 옆면이 아니라 앞면이 보인다
      place(
        `flagpole-${n++}`,
        "flagpole-banner",
        x,
        z,
        faceTo(-perp.x * side, -perp.z * side),
        {gap: 1.2}
      );
    }
  }

  // 광장 둘레에도 한 바퀴. 컨셉 아트의 광장은 깃발이 원을 그리며 둘러선 자리다.
  const RING = 10;
  for (let k = 0; k < RING; k++) {
    const angle = (k / RING) * Math.PI * 2 + Math.PI / RING;
    const dist = HUB_RADIUS + 2.6;
    const x = HUB.x + Math.cos(angle) * dist;
    const z = HUB.z + Math.sin(angle) * dist;
    if (
      onRoad(x, z, 0.3) ||
      onBuilding(x, z, 0.5) ||
      onWall(x, z, 0.25) ||
      !free(x, z, 1.6)
    )
      continue;
    // 광장 안쪽을 본다
    place(
      `flagring-${k}`,
      "flagpole-banner",
      x,
      z,
      faceTo(HUB.x - x, HUB.z - z),
      {gap: 1.6}
    );
  }
}

// ─── ③-c 포장 위 화단 ─────────────────────────────────────────────────────────
// 구역 바닥을 판석으로 덮고 나서 생긴 문제다. 포장 전에는 블록 사이 빈 곳이
// 잔디라 아무것도 안 놔도 "정원"으로 보였는데, 돌로 덮고 나니 같은 자리가
// **아무것도 없는 돌마당**이 됐다. 컨셉 아트의 포장 위에는 둥근 돌 화단이
// 여기저기 놓여 그 삭막함을 막는다.
//
// 한 개가 9,898 삼각형이라 헤프게 못 쓴다. **정말로 비어 있는 포장 칸**에만 놓는다.
//
// 처음엔 "광장 앞치마 네 귀퉁이 + 구역 입구 양옆" 처럼 좌표를 계산해서 넣었는데
// 12자리 중 한 곳도 안 섰다. 마을이 생각보다 빡빡해서다 — 광장 원반이 반지름
// 4.6인데 가장 가까운 건물이 7.5 에 있어 그 사이 3유닛은 길 넷이 다 쓰고 있었다.
// 자리를 **깔린 포장 타일에서 직접 고르면** 이런 추측이 필요 없다.
// 심을 자리 후보 — ③-c 나무·화단과 ③-e 구역 살림이 여기서 고른다.
//
// 예전엔 **깔린 판석에서만** 골랐다. 그때는 구역 안쪽이 통째로 포장이라 그게 곧
// "마을 안 평평한 땅"이었기 때문이다. 그런데 블록 포장을 걷어 잔디로 되돌리자
// 판석이 613→69장(광장뿐)으로 줄어, 나무가 15→7 그루가 되고 화단은 0 이 됐다 —
// **잔디로 바꿨더니 초록이 오히려 줄어드는** 어처구니없는 결과였다.
//
// 그래서 후보를 "포장 칸"이 아니라 **광장 포장 + 구역 단 위 칸** 으로 바꾼다.
// 단 사각형은 바닥 생성기가 villageTerraces.json 으로 내보낸 것을 그대로 쓴다.
const plots = (() => {
  const out = layout.props
    .filter(p => p.id.startsWith("ground-pave-"))
    .map(p => ({x: p.position[0], z: p.position[2]}));
  const terr = JSON.parse(
    readFileSync("src/data/villageTerraces.json", "utf8")
  );
  const pitch = terr.pitch;
  const seen = new Set(
    out.map(c => `${Math.round(c.x / pitch)},${Math.round(c.z / pitch)}`)
  );
  for (const b of terr.islands ?? []) {
    for (
      let i = Math.round((b.x - b.r) / pitch);
      i <= Math.round((b.x + b.r) / pitch);
      i++
    ) {
      for (
        let j = Math.round((b.z - b.r) / pitch);
        j <= Math.round((b.z + b.r) / pitch);
        j++
      ) {
        // 원반 밖 모서리 칸은 물 위다
        if (Math.hypot(i * pitch - b.x, j * pitch - b.z) > b.r - 0.4) continue;
        const k = `${i},${j}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({x: round3(i * pitch), z: round3(j * pitch)});
      }
    }
  }
  return out;
})();

// 각 포장 칸이 얼마나 트여 있나 — 가장 가까운 길·건물·원반·담장·기존 장식물까지.
// taken 을 그때그때 읽으므로, 먼저 놓은 것이 뒤에 놓는 것의 후보를 자동으로 줄인다.
const clearance = (x, z) => {
  let best = Infinity;
  for (const r of roads)
    best = Math.min(best, Math.hypot(r.x - x, r.z - z) - ROAD_SIDE);
  for (const b of buildings) {
    const dx = Math.max(0, Math.abs(b.x - x) - b.w / 2);
    const dz = Math.max(0, Math.abs(b.z - z) - b.d / 2);
    best = Math.min(best, Math.hypot(dx, dz));
  }
  for (const d of discs)
    best = Math.min(best, Math.hypot(d.x - x, d.z - z) - d.r);
  best = Math.min(best, Math.hypot(HUB.x - x, HUB.z - z) - HUB_RADIUS);
  for (const w of walls) {
    const dx = x - w.x,
      dz = z - w.z;
    best = Math.min(
      best,
      Math.hypot(
        Math.max(0, Math.abs(dx * w.ax + dz * w.az) - WALL_HALF_LEN),
        Math.max(0, Math.abs(dx * -w.az + dz * w.ax) - WALL_HALF_THICK)
      )
    );
  }
  for (const t of taken) best = Math.min(best, Math.hypot(t.x - x, t.z - z));
  return best;
};

{
  /** 화단 지름이 0.9유닛이니 사방 1.1은 비어야 한다 */
  const NEED = 1.1;
  /** 심은 것끼리 이만큼은 떨어뜨린다 — 몰아 놓으면 화단밭이 된다 */
  //
  // 3.6 → 2.6. 부감 캡처를 컨셉과 나란히 놓고 세어 보니 마을 **안쪽** 초록이
  // 나무 18 + 여기 32 뿐이었다. 바깥 테두리 숲은 276그루로 빽빽한데, 정작
  // 카메라가 사는 안쪽이 휑해서 "초록 접시 위에 건물을 얹은" 꼴로 보였다.
  // 컨셉 아트는 건물 사이사이가 나무로 메워져 있다.
  const APART = 2.6;
  const MAX = 64;

  // ─── 화단만으로는 부족했다 ─────────────────────────────────────────────────
  // 길 갓길까지 돌색으로 바꾸고 나니 구역 안쪽이 통째로 베이지 한 색이 됐다.
  // 컨셉 아트의 포장 위에는 **나무가 촘촘히 심겨** 있고, 그 초록이 돌바닥을
  // 삭막하지 않게 만든다. 원래 그 일을 하던 ⑪ 빈터는 잔디 공터를 찾는 규칙이라
  // 포장을 깔고 나서는 후보가 네 곳밖에 안 남았다.
  //
  // 여기는 카메라가 가장 오래 머무는 자리라 전부 원본 GLB 다 — 빌보드를 쓰면
  // 부감에서 판때기 두 장인 게 그대로 드러난다.
  // 침엽수(5,652)를 주로 쓰고 값비싼 활엽수(8,932)·벚나무(8,789)는 드물게 섞는다.
  //
  // 개수를 34 → 64 로 올리면서 **비율을 침엽수 쪽으로 몰았다.** 예전 비율(화단
  // 3/8)을 그대로 두 배로 늘리면 화단만 24개 = 24만 삼각형이라 예산이 안 맞는다.
  // 침엽수 5,652 · 활엽수 8,932 · 벚나무 8,789 · 화단 9,898 이라, 가장 싼 것을
  // 골격으로 깔고 비싼 셋을 점처럼 섞는 게 같은 값에 가장 빽빽해진다.
  const ROTATION = [
    "tree-emerald-crown",
    "tree-emerald-crown",
    "tree-golden-canopy",
    "tree-emerald-crown",
    "flowerbed-round",
    "tree-emerald-crown",
    "tree-sakura",
    "tree-emerald-crown"
  ];

  const cand = plots
    .map(c => ({...c, open: clearance(c.x, c.z)}))
    .filter(c => c.open >= NEED)
    // 트인 곳부터 — 좁은 틈부터 채우면 정작 넓은 돌마당이 빈 채로 남는다
    .sort((a, b) => b.open - a.open);

  let n = 0;
  const put = [];
  for (const c of cand) {
    if (n >= MAX) break;
    if (put.some(q => Math.hypot(q.x - c.x, q.z - c.z) < APART)) continue;
    const kind = ROTATION[n % ROTATION.length];
    // 나무는 칸 한복판에서 조금씩 흩어야 가로수처럼 줄 서 보이지 않는다
    const jitter = kind === "flowerbed-round" ? 0 : (rand() - 0.5) * 0.5;
    place(
      `planting-${n++}`,
      kind,
      c.x + jitter,
      c.z - jitter,
      round3(rand() * Math.PI * 2),
      {gap: NEED, grow: kind === "flowerbed-round" ? 1 : 0.82 + rand() * 0.3}
    );
    put.push(c);
  }
}

// ─── ③-e 건물 앞뜰 세트 ───────────────────────────────────────────────────────
// 예전엔 구역당 6개를 블록 전체에 **흩어** 놓았다. 컨셉 아트와 나란히 놓고 보니
// 그게 결정적으로 달랐다 — 컨셉의 소품은 흩어져 있지 않고 **건물 입구마다 서넛이
// 뭉쳐** 있다. 벤치 옆에 화분, 그 옆에 등불. 그 덩어리가 "가게 앞"으로 읽힌다.
// 흩어 놓으면 같은 개수라도 그냥 바닥에 물건이 떨어져 있는 것처럼 보인다.
//
// 그래서 기준을 구역이 아니라 **건물**로 바꿨다. 건물마다 광장 쪽 앞자리를 찾아
// 거기 바짝 붙여 3개를 놓는다. 구역 성격에 맞는 물건만 골라 쓰는 건 그대로다.
{
  const KIT_OF = {
    projects: [
      "market-stall",
      "notice-board",
      "barrel-iron",
      "lantern-post",
      "orb-lantern",
      "barrel-iron"
    ],
    skills: [
      "stump-forge",
      "barrel-iron",
      "orb-lantern",
      "lantern-post",
      "barrel-iron"
    ],
    experience: [
      "scroll-barrel",
      "candle-tome",
      "barrel-iron",
      "orb-lantern",
      "lantern-post"
    ],
    study: [
      "candle-tome",
      "notice-board",
      "scroll-barrel",
      "orb-lantern",
      "candle-tome",
      "lantern-post"
    ],
    // 컨셉 아트의 장터(줄지어 선 줄무늬 천막)는 생활 구역 쪽에 있다. 별도의
    // 장터 광장을 내려면 자리가 필요한데 마을에 반경 4 이상 빈 땅이 일곱 곳뿐이고
    // 그마저 다 가장자리다 — 그래서 광장을 따로 내는 대신 앞뜰 세트에 천막을 섞는다.
    // 건물마다 4개씩 도는 목록이라, 여섯 중 하나면 생활 구역에 천막이 두엇 선다.
    life: [
      "campfire",
      "market-stall",
      "bench",
      "flower-pot",
      "orb-lantern",
      "lute-picnic",
      "lantern-post"
    ],
    contact: ["mailbox", "notice-board", "orb-lantern", "bench", "lantern-post"]
  };
  /** 건물 한 채 앞에 몇 개까지 */
  const PER_BUILDING = 4;
  /** 세트 안에서는 바짝 붙인다 — 이 값이 "흩뿌림"과 "뭉치"를 가른다 */
  const APART = 1;
  /** 사방이 이만큼은 비어야 놓는다 */
  const NEED = 0.65;
  /** 앞뜰로 볼 반경. 3 으로는 26채 중 16채에만 붙었다 — 건물 뒤쪽이 잘려 후보가 모자란다 */
  const YARD = 4.2;

  let n = 0;
  let placed = 0;
  for (const b of OUTER) {
    const kinds = KIT_OF[b.district];
    if (!kinds) continue;
    // 광장 쪽이 앞이다 — 건물 정면도 그쪽을 보고 서 있다
    const len = Math.hypot(b.x, b.z) || 1;
    const toPlaza = {x: -b.x / len, z: -b.z / len};
    const fx = b.x + toPlaza.x * (Math.max(b.w, b.d) / 2 + 1.3);
    const fz = b.z + toPlaza.z * (Math.max(b.w, b.d) / 2 + 1.3);

    // **clearance() 를 쓰면 안 된다.** 그건 앞마당 원반까지 장애물로 세는데,
    // 원반이 바로 여기서 찾는 앞뜰이다 — 처음엔 그렇게 했다가 26채 중 8채에만,
    // 그것도 10개밖에 안 놓였다. 길·건물·담장·이미 놓은 것만 피하면 된다.
    const cand = plots
      .map(c => ({...c, near: Math.hypot(c.x - fx, c.z - fz)}))
      .filter(c => c.near < YARD)
      .filter(c => !onRoad(c.x, c.z, 0.15) && !onBuilding(c.x, c.z, 0.25))
      .filter(c => Math.hypot(HUB.x - c.x, HUB.z - c.z) > HUB_RADIUS + 0.4)
      .filter(c => !onWall(c.x, c.z, 0.1) && free(c.x, c.z, NEED))
      // 앞뜰 한복판부터 채운다 — 멀리부터 채우면 세트가 흩어진다
      .sort((x, y) => x.near - y.near);

    const here = [];
    let put = 0;
    for (const c of cand) {
      if (put >= PER_BUILDING) break;
      if (here.some(q => Math.hypot(q.x - c.x, q.z - c.z) < APART)) continue;
      const jx = (rand() - 0.5) * 0.5,
        jz = (rand() - 0.5) * 0.5;
      place(
        `yardset-${n}`,
        kinds[n % kinds.length],
        c.x + jx,
        c.z + jz,
        faceTo(toPlaza.x, toPlaza.z),
        {gap: NEED, grow: 0.85 + rand() * 0.3}
      );
      here.push(c);
      put += 1;
      n += 1;
    }
    if (put > 0) placed += 1;
  }
  console.log(`  건물 앞뜰 세트 ${n}개 (${placed}채)`);
}

// ─── ③-d 마을 밖 랜드마크 ─────────────────────────────────────────────────────
// 컨셉 아트의 조감도가 웅장해 보이는 건 마을 안이 빽빽해서가 아니라 **바깥에 큰
// 것들이 서 있어서**다: 위쪽에 다리로 건너가는 파고다 섬, 오른쪽 언덕의 풍차,
// 좌·우·우하단 절벽의 폭포 셋. 우리 섬은 테두리가 통째로 숲이라, 어느 방향을 봐도
// 나무 벽 하나로 끝났다.
//
// 여기 놓는 것들은 한두 개씩이라 삼각형을 아끼지 않는다. 대신 **숲이 이 자리를
// 비켜 가야** 한다 — 아래 ⑩·⑪ 이 landmarks 를 읽어 그 반경 안에는 안 심는다.
/** 숲·빈터가 피해야 할 큰 물건 {x, z, r} */
const landmarks = [];

// 방위: 컨셉 아트를 남쪽에서 본 그림으로 읽었다 — −Z 가 북, +X 가 동, +Z 가 남.
// generate-ground-layout.mjs 의 NORTH_END 와 VillageScene 의 CREEK_Z 에 맞춘 값들이다.
// 해자 물줄기(MOAT · MOAT_LINE · inMoatWater)는 파일 맨 위에서 한 번 만든다 —
// place() 가 물 위 배치를 거기서 막으므로 그보다 먼저 있어야 한다.
const CREEK_Z = round3(MOAT.cz - MOAT.b);
const MOAT_SOUTH_Z = round3(MOAT.cz + MOAT.b);
{
  // ─── 남북 참배로: 해자 → 돌다리 → (북) 파고다 섬 / (남) 마을 밖 ───────────
  // 광장에 서서 북쪽을 보면 길 끝에 다리가 있고 그 너머 언덕 위에 파고다가 선다.
  // 남쪽은 대계단을 내려와 같은 물을 건넌다 — 축이 대칭이라야 조감도가 정돈된다.
  //
  // 다리는 물(동서)을 가로질러야 하므로 90° 돌린다 — 모델의 긴 축이 +X 다.
  place("bridge-north", "bridge-stone", 0, CREEK_Z, round3(Math.PI / 2), {
    gap: 0.1,
    onWater: true
  });
  landmarks.push({x: 0, z: CREEK_Z, r: 4.5});
  place("bridge-south", "bridge-stone", 0, MOAT_SOUTH_Z, round3(Math.PI / 2), {
    gap: 0.1,
    onWater: true
  });
  landmarks.push({x: 0, z: MOAT_SOUTH_Z, r: 4.5});

  // ─── 구역 사이 물길: 다리 + 숲 제외 ────────────────────────────────────────
  // 물길 좌표는 바닥 생성기가 계산해 villageTerraces.json 에 넣어 둔다. 씬과
  // 여기가 같은 값을 읽어야 다리가 정확히 물 위에 선다.
  {
    // 담장 절의 terr 는 그 블록 안에 갇혀 있다 — 여기서 다시 읽는다
    const terr = JSON.parse(
      readFileSync("src/data/villageTerraces.json", "utf8")
    );
    // 광장을 두르는 물 고리도 같은 취급이다: 물 위엔 아무것도 안 심는다.
    const ring = terr.plazaRing ?? [];
    const waterLines = [
      ...(terr.channels ?? []),
      ...(ring.length > 2 ? [[...ring, ring[0]]] : [])
    ];
    for (const pts of waterLines)
      for (const q of pts) landmarks.push({x: q.x, z: q.z, r: 2.2});

    // ─── 돌다리는 **바닥 생성기가 정한 건널목**에 놓는다 ────────────────────────
    // 예전엔 여기서 "물길 마디가 길 타일 위에 있으면 다리"로 직접 찾았다.
    // 그런데 바닥 생성기가 물이 지나는 길 타일을 걷어내기 시작하면서(안 그러면
    // 길이 물보다 1cm 높아 물을 덮어 버린다) 그 규칙으로는 다리가 **한 개도**
    // 안 섰다(15 → 1). 건널목을 아는 건 타일을 걷어낸 그쪽뿐이므로,
    // 좌표와 각도를 받아 놓기만 한다.
    const crossings = terr.crossings ?? [];
    crossings.forEach((cr, n) => {
      place(`bridge-cross-${n}`, "bridge-stone", cr.x, cr.z, cr.angle, {
        gap: 0.1,
        onWater: true
      });
      landmarks.push({x: cr.x, z: cr.z, r: 3.4});
    });

    console.log(
      `  물길 ${terr.channels?.length ?? 0}줄기 + 광장 물 고리 ${
        ring.length > 2 ? 1 : 0
      }개 · 건널목 돌다리 ${crossings.length}개`
    );
  }

  // 해자를 따라 숲을 비운다.
  //
  // ── 순수 타원이 아니라 **실제로 그려지는 물줄기**를 따라가야 한다 ──────────
  // 예전엔 타원 위의 점에만 금지 원을 깔았는데, VillageScene 은 거기에 drift
  // (±1.9유닛)를 얹어 물을 굽이치게 그린다. 그래서 물줄기가 금지 구역 밖으로
  // 벗어나는 구간마다 나무가 물 속에 섰다 — 반경을 2.0 으로 잡아도 drift 가
  // 그보다 크니 소용이 없었다. 아래는 Waterways 의 폴리라인 식을 그대로 옮긴 것이다.
  //
  // 반경은 물 반폭(최대 1.23)에 물가 여유를 더한 값. 크게 잡으면 섬 테두리가
  // 휑해지므로(2.8 에서 숲 360→205) 물가에 나무가 바짝 서는 선까지만 준다.
  {
    // 타원이 커지면 한 바퀴도 길어진다 — 간격을 일정하게 유지하려고 둘레에 맞춘다
    const steps = Math.max(
      140,
      Math.round((Math.PI * (MOAT.a + MOAT.b)) / 1.2)
    );
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const angle = t * Math.PI * 2 - Math.PI / 2;
      const drift = Math.sin(angle * 3 + 0.7) * 1.4 + Math.sin(angle * 7) * 0.5;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nx = cos / MOAT.a;
      const nz = sin / MOAT.b;
      const nl = Math.hypot(nx, nz) || 1;
      landmarks.push({
        x: round3(MOAT.cx + cos * MOAT.a + (nx / nl) * drift),
        z: round3(MOAT.cz + sin * MOAT.b + (nz / nl) * drift),
        r: 2
      });
    }
  }

  // ─── 마을 테두리 담장 ───────────────────────────────────────────────────────
  // 컨셉 아트에서 마을을 "성읍"으로 읽히게 하는 건 **바깥을 한 바퀴 두른 돌담**이다.
  // 담장이 있어야 그 안이 마을이고 밖이 들판으로 갈린다. 지금까지는 구역마다
  // 블록을 두르는 담장(wall-low)만 있고 마을 전체를 두르는 선이 없었다 —
  // 실측하면 담장 134토막 중 테두리(r>34)에 선 것이 11토막뿐이었다.
  //
  // 자리는 **해자 안쪽 기슭에서 조금 들어온 곳**이다. 담장 다음에 물이 오는 게
  // 성읍의 순서고, 각도별로 재 보면 마을 바깥끝과 물 기슭 사이가 가장 좁은 데도
  // 5.7 남아 담장 한 줄이 넉넉히 들어간다.
  //
  // 해자와 **같은 폴리라인**을 쓴다 — 타원만 따라가면 물이 드리프트로 굽이칠 때
  // 담장이 물에 들어간다(나무가 그렇게 잠긴 적이 있다).
  {
    const INSET = 2.6; // 물 기슭에서 담장까지
    const SEG = 1.94; // wall-low 한 토막 길이
    const perim = Math.PI * (MOAT.a + MOAT.b); // 타원 둘레 근사
    const steps = Math.max(80, Math.round(perim / SEG));
    let put = 0;
    let skipped = 0;
    for (let k = 0; k < steps; k++) {
      const angle = (k / steps) * Math.PI * 2 - Math.PI / 2;
      const drift = Math.sin(angle * 3 + 0.7) * 1.4 + Math.sin(angle * 7) * 0.5;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nx = cos / MOAT.a;
      const nz = sin / MOAT.b;
      const nl = Math.hypot(nx, nz) || 1;
      // 물줄기 중심 → 안쪽 법선으로 (반폭 + INSET) 만큼 들어온다
      const inward = 1.23 + INSET;
      const x = round3(MOAT.cx + cos * MOAT.a + (nx / nl) * (drift - inward));
      const z = round3(MOAT.cz + sin * MOAT.b + (nz / nl) * (drift - inward));

      // 남쪽 대계단과 북쪽 참배로는 **문**이다 — 거기서 담장을 끊어야 길이 나간다
      if (Math.abs(x) < 2.6) {
        skipped++;
        continue;
      }
      if (onRoad(x, z, 0.6) || onBuilding(x, z, 0.6) || onDisc(x, z, 0.2)) {
        skipped++;
        continue;
      }
      if (!free(x, z, 0.9)) {
        skipped++;
        continue;
      }
      // 담장은 둘레 방향(접선)으로 눕는다
      const rot = round3(Math.atan2(-(nx / nl), nz / nl));
      if (place(`rimwall-${put}`, "wall-low", x, z, rot, {gap: 0.9})) {
        walls.push({x, z, ax: Math.cos(rot), az: Math.sin(rot)});
        put++;
      }
    }
    console.log(
      `  마을 테두리 담장 ${put}토막 (자리 ${steps}곳 중 ${skipped}곳은 문·길·건물로 비움)`
    );
  }

  // 섬 — 원본은 밑동이 뾰족한 부유섬이라 그대로 세우면 원뿔이 드러난다.
  // 아래쪽을 땅에 묻어 **윗면이 평평한 바위 언덕**으로 쓴다.
  // 파고다 섬은 **북쪽 다리 건너**에 서야 한다 — 광장에서 북쪽을 보면 길 끝에
  // 다리가 있고 그 너머 언덕 위에 파고다가 보이는 구도다.
  // 예전엔 z −29.5 로 박아 뒀는데, 해자를 넓히자 다리(z −32)보다 **앞**으로
  // 와서 구도가 뒤집혔다. 다리에서 일정 거리 뒤로 두어 자동으로 따라오게 한다.
  const ISLAND_GAP = 8.8; // 해자 b=21.7 시절의 다리–섬 간격. 그때 구도가 좋았다.
  const ISLAND_Z = round3(CREEK_Z - ISLAND_GAP);
  const ISLAND_TOP = 3.9; // 이 높이에 파고다가 선다
  {
    const scale = scaleOf("island-north");
    const half = round3((KIT["island-north"].h / 2) * scale);
    props.push({
      id: "decor-island-north",
      glb: `/models/props/${KIT["island-north"].glb}`,
      // 윗면이 ISLAND_TOP 에 오도록 — liftOf 를 안 쓰고 직접 잡는다
      position: [0, round3(ISLAND_TOP - half), ISLAND_Z],
      rotationY: 0,
      scale
    });
    taken.push({x: 0, z: ISLAND_Z});
    landmarks.push({x: 0, z: ISLAND_Z, r: round3(1.893 * scale * 0.6 + 2)});
  }
  // 파고다 — 섬 윗면 위에. 여기가 컨셉 아트의 "AI Portfolio" 자리다.
  {
    const scale = scaleOf("pagoda-portfolio");
    props.push({
      id: "decor-pagoda-portfolio",
      glb: `/models/props/${KIT["pagoda-portfolio"].glb}`,
      // 정면(+Z)이 마을(남쪽)을 보게 — 참배로에서 걸어오면 현관이 보인다
      position: [
        0,
        round3(ISLAND_TOP + (KIT["pagoda-portfolio"].h / 2) * scale),
        ISLAND_Z
      ],
      rotationY: 0,
      scale
    });
  }

  // ─── 풍차 — 북동 언덕 ──────────────────────────────────────────────────────
  // 컨셉 아트 우상단. 마을 바깥 실루엣에 큰 수직선을 하나 세워 준다.
  place("windmill", "windmill", 24, -21, faceTo(-24, 21), {gap: 0.1});
  landmarks.push({x: 24, z: -21, r: 5.5});

  // ─── 폭포 셋 — 섬 테두리 ───────────────────────────────────────────────────
  // 섬(중심 0,3 · 반지름 40)의 가장자리에 세워 물이 절벽 바깥으로 떨어지게 한다.
  // 정면(+Z)이 바깥을 봐야 조감에서 물줄기가 보인다 — 안쪽을 보게 두면 마을에서는
  // 바위 뒷면만 보이고 정작 물은 숲에 가린다.
  const FALLS = [
    [-35.5, 5],
    [35, 0],
    [25, 28]
  ];
  FALLS.forEach(([x, z], n) => {
    place(`waterfall-${n}`, "waterfall", x, z, faceTo(x - 0, z - 3), {
      gap: 0.1,
      onWater: true
    });
    landmarks.push({x, z, r: 6.5});
  });
}

/** 랜드마크 반경 안인가 — 숲·빈터가 여기를 침범하면 안 된다 */
const nearLandmark = (x, z) =>
  landmarks.some(l => Math.hypot(l.x - x, l.z - z) < l.r);

// ─── ④ 길 따라 가로등 ─────────────────────────────────────────────────────────
// 길 칸을 일정 간격으로 건너뛰며 좌우 번갈아 세운다.
//
// 3칸(5.6유닛)마다 세웠더니 마을 전체에 10개뿐이었다. 컨셉 아트는 길마다
// 가로등·깃대·배너가 촘촘히 서서 화면에 **수직 리듬**을 준다 — 우리는 전부
// 납작해서 시선이 미끄러졌다. 2칸(3.8유닛)이면 걷는 눈높이에서 하나가 지나가면
// 다음 게 들어온다. 가로등 하나가 1,780 삼각형이고 인스턴싱이라 draw call 은 그대로다.
// 가로등은 가는 기둥이라(밑동 지름 0.3 남짓) 다른 장식물과 1.5 를 띄울 이유가 없다.
// 1.5 로 두었을 때 후보 자리 중 86곳이 "너무 붙음"으로 탈락했다 — 길가는 화단·
// 깃대·연석이 늘어선 자리라 그 정도 여유가 잘 안 난다.
const LANTERN_GAP = 1.1;
const LANTERN_EVERY = 2;
{
  const sorted = tileRoads.slice().sort((a, b) => a.z - b.z || a.x - b.x);
  let n = 0;
  const why = {원반: 0, 건물: 0, 담장: 0, 자리없음: 0};
  for (let i = 0; i < sorted.length; i += LANTERN_EVERY) {
    const r = sorted[i];
    // 이 칸의 길 방향 — 이웃 칸이 어느 쪽에 있는지로 판단
    const hasWE = sorted.some(
      o =>
        Math.abs(o.z - r.z) < 0.1 && Math.abs(Math.abs(o.x - r.x) - PITCH) < 0.1
    );
    const perp = hasWE ? {x: 0, z: 1} : {x: 1, z: 0};
    const side = ROAD_SIDE + 0.42;

    // ── 한쪽이 막히면 **반대쪽도 본다** ────────────────────────────────────
    // 예전엔 좌우를 번갈아 정해 놓고 그 자리가 막히면 그냥 넘어갔다. 길가는
    // 앞마당 원반과 담장이 늘어선 자리라 한쪽이 막히는 일이 흔해서, 2칸마다
    // 세우려던 것이 길 153장에 21개(7.3장당 하나)까지 줄어 있었다.
    // 번갈아 시작하는 것은 그대로 두되(그래야 좌우로 지그재그가 생긴다),
    // 막히면 반대쪽에 세운다.
    const first = n % 2 === 0 ? 1 : -1;
    let put = false;
    for (const sign of [first, -first]) {
      const x = r.x + perp.x * side * sign;
      const z = r.z + perp.z * side * sign;
      if (onDisc(x, z, 0.1)) {
        why.원반++;
        continue;
      }
      if (onBuilding(x, z, 0.5)) {
        why.건물++;
        continue;
      }
      if (onWall(x, z, 0.2)) {
        why.담장++;
        continue;
      }
      if (!free(x, z, LANTERN_GAP)) {
        why.자리없음++;
        continue;
      }
      place(`lantern-${n}`, "lantern-post", x, z, 0, {gap: LANTERN_GAP});
      n += 1;
      put = true;
      break;
    }
    void put;
  }
  console.log(
    `  가로등 ${n}개 (격자 길 ${tileRoads.length}장 · ${LANTERN_EVERY}장마다 시도) — ` +
      `막힌 자리: 원반 ${why.원반} · 건물 ${why.건물} · 담장 ${why.담장} · 너무붙음 ${why.자리없음}`
  );
}

// ─── ④-b 차선 가로등 ─────────────────────────────────────────────────────────
// 컨셉 이미지에서 섬을 섬으로 읽히게 하는 건 **차선을 따라 줄지어 선 등불**이다
// — 밤 부감에서 섬마다 빛 고리 두 겹(안쪽 차선·테두리 차선)이 그려진다.
// 격자 가로등(④)은 길 방향을 이웃 칸으로 판정해서 차선(비격자)에는 못 세운다.
// 차선 표본(laneCells)은 접선(tx,tz)을 가지고 있으므로 그 수직으로 비켜 세운다.
//
// 간격: 표본이 1.25 간격이니 5칸 = 6.25유닛. 등 하나가 1,780 삼각형이라
// 촘촘함과 예산의 절충점이다(전체 청구서는 맨 아래 삼각형 표가 알려 준다).
{
  const EVERY = 5;
  let n = 0;
  for (let i = 0; i < LANE_CELLS.length; i += EVERY) {
    const c = LANE_CELLS[i];
    // 좌우 교대로 시작하되, 막히면(테두리 차선의 바깥쪽은 물가 금지에 걸린다)
    // 반대쪽에 세운다 — 격자 가로등(④)과 같은 요령이다.
    const first = n % 2 === 0 ? 1 : -1;
    for (const side of [first, -first]) {
      const px = c.x + -c.tz * (ROAD_SIDE + 0.4) * side;
      const pz = c.z + c.tx * (ROAD_SIDE + 0.4) * side;
      if (
        onRoad(px, pz, 0.25) ||
        onDisc(px, pz, 0.1) ||
        onBuilding(px, pz, 0.35) ||
        onWall(px, pz, 0.2) ||
        !free(px, pz, 1.3)
      )
        continue;
      if (place(`lanelamp-${n}`, "lantern-post", px, pz, 0, {gap: 1.3})) {
        n += 1;
        break;
      }
    }
  }
  console.log(
    `  차선 가로등 ${n}개 (표본 ${LANE_CELLS.length}칸 · ${EVERY}칸마다)`
  );
}

// ─── ⑤ 앞마당 화분·벤치 ───────────────────────────────────────────────────────
// 건물 앞마당 원반 가장자리에 소품을 둘러 사람이 사는 티를 낸다.
// 광장을 향한 쪽을 중심으로 네 자리. 두 자리만 두면 큰 원반이 여전히 휑하고,
// 원반을 빙 두르면 완전한 원이 그려져 인위적으로 보이므로 앞쪽 반원만 쓴다.
//
// 여긴 캐릭터가 다가서는 자리라 전부 원본 GLB다 — 빌보드는 숲 몫이다.
{
  let n = 0;
  // 앞마당 소품은 캐릭터가 코앞에서 보는 자리라 원본 GLB를 써야 하는데,
  // 화분 하나가 5,156 삼각형이다. 자리를 넷 → 셋 → 둘로 줄여 왔다.
  //
  // ─── 셋에서 둘로, 그리고 싼 것 위주로 ──────────────────────────────────────
  // 앞마당 소품 42개가 18만 삼각형을 먹고 있었다 — 마을 장식물 예산의 4분의 1을
  // 원반 가장자리의 화분과 벤치가 쓴 셈이다. 그 값으로 채움 민가 12채를 살 수
  // 있고, 블록이 차 보이는 데는 민가 쪽이 비교가 안 되게 낫다.
  // 화분 5,156 · 벤치 5,831 에 견줘 구슬등 2,827 · 철통 3,223 이라
  // 회전표도 싼 쪽으로 기울인다. 구슬등은 저녁에 빛나기까지 한다.
  const ROTATION = [
    "orb-lantern",
    "barrel-iron",
    "orb-lantern",
    "flower-pot",
    "orb-lantern",
    "bench"
  ];
  for (const [index, b] of OUTER.entries()) {
    const disc = discs[index];
    // 광장 반대편(건물 뒤)이 아니라, 광장을 향한 쪽에 둔다
    const len = Math.hypot(b.x, b.z) || 1;
    const inward = {x: -b.x / len, z: -b.z / len};
    const base = Math.atan2(inward.z, inward.x);
    for (const [slot, swing] of [0.6, -0.6].entries()) {
      const angle = base + swing;
      const dist = disc.r + 0.5;
      const x = b.x + Math.cos(angle) * dist;
      const z = b.z + Math.sin(angle) * dist;
      if (
        onRoad(x, z, 0.3) ||
        onBuilding(x, z, 0.4) ||
        onWall(x, z, 0.25) ||
        !free(x, z, 1.1)
      )
        continue;
      // 자리를 셋에서 둘로 줄였으니 보폭도 셋 → 둘. 3 을 그대로 두면
      // index*3 mod 6 이 0,3,0,3 만 돌아 회전표 여섯 중 넷만 쓰인다.
      const kind = ROTATION[(index * 2 + slot) % ROTATION.length];
      place(`yard-${n}`, kind, x, z, faceTo(b.x - x, b.z - z), {
        grow: 0.92 + rand() * 0.2
      });
      n += 1;
    }
  }
}

// ─── ⑥ 광장 위 삼각깃발 ───────────────────────────────────────────────────────
// 광장 둘레를 따라 접선 방향으로 걸어 축제 분위기를 낸다. 가로등 꼭대기(1.2유닛)
// 언저리에 띄워야 줄에 매달린 것처럼 읽힌다 — 낮게 걸면 허공에 뜬 천이 된다.
{
  const SPANS = 8;
  const height = 1.25;
  const radius = HUB_RADIUS + 0.9;
  for (let n = 0; n < SPANS; n++) {
    const angle = (n / SPANS) * Math.PI * 2 + Math.PI / SPANS;
    const x = HUB.x + Math.cos(angle) * radius;
    const z = HUB.z + Math.sin(angle) * radius;
    if (onBuilding(x, z, 0.3)) continue;
    // 접선 방향으로 눕힌다 (반지름 방향 + 90°)
    props.push({
      id: `decor-bunting-${n}`,
      glb: `/models/props/${KIT.bunting.glb}`,
      position: [round3(x), round3(height), round3(z)],
      rotationY: faceTo(Math.cos(angle), Math.sin(angle)),
      scale: scaleOf("bunting")
    });
    taken.push({x, z});
  }
}

// ─── ⑦ 어귀 울타리 ────────────────────────────────────────────────────────────
// 처음엔 길가 아무 데나 세 칸씩 흩어 놨더니, 허허벌판에 널빤지 토막이 굴러다니는
// 꼴이라 오히려 지저분했다. 울타리는 "여기가 경계다"를 말할 때만 쓸모가 있다.
// 그래서 문 옆에만, 길 양옆으로 나란히 세워 진입로를 만든다.
{
  const width = round3(1.899 * scaleOf("fence"));
  const PER_SIDE = 4;
  let n = 0;
  for (const gate of gates) {
    // 문에서 마을 안쪽으로 뻗는 방향
    const along = gate.inward;
    const perp = {x: -along.z, z: along.x};
    for (const side of [1, -1]) {
      for (let k = 0; k < PER_SIDE; k++) {
        // 문 바로 옆(k=0)부터 안쪽으로. 길 폭 밖으로 비켜 세운다.
        const dist = HALF_TILE * 0.6 + k * width;
        const x =
          gate.at.x + along.x * dist + perp.x * (ROAD_SIDE + 0.42) * side;
        const z =
          gate.at.z + along.z * dist + perp.z * (ROAD_SIDE + 0.42) * side;
        if (
          onRoad(x, z, 0.1) ||
          onDisc(x, z, 0.2) ||
          onBuilding(x, z, 0.4) ||
          onWall(x, z, 0.2) ||
          !free(x, z, 0.7)
        )
          break;
        // 판이 길 쪽을 보게 — 울타리 결이 길과 나란해진다
        place(
          `fence-${n++}`,
          "fence",
          x,
          z,
          faceTo(perp.x * -side, perp.z * -side),
          {gap: 0.7}
        );
      }
    }
  }
}

// ─── ⑧ 나무·바위 ──────────────────────────────────────────────────────────────
// constants.ts 의 좌표를 그대로 쓰되, 종류는 좌표에서 결정해 같은 자리엔 늘 같은
// 나무가 서게 한다. 벚나무는 드물어야 눈에 띄므로 다섯 그루에 하나 꼴로만 둔다.
{
  const TREES = [
    "tree-golden-canopy",
    "tree-emerald-crown",
    "tree-golden-canopy",
    "tree-sakura",
    "tree-emerald-crown"
  ];
  readPositions("treePositions").forEach((p, n) => {
    const kind = TREES[n % TREES.length];
    // 회전을 그루마다 흩뜨려야 같은 GLB를 19번 쓴 티가 안 난다.
    // 회전만으로는 부족했다 — 배율이 0.80~0.84 로 사실상 균일해서 나무가 전부
    // 같은 키였고, 그게 부감에서 "심어 놓은 가로수"로 보였다. 바깥 숲(0.95~1.78)이
    // 자연스러운 이유가 배율 폭이다. 안쪽도 같은 폭으로 흔든다.
    place(
      `tree-${n}`,
      kind,
      p[0],
      p[2],
      round3(((n * 137) % 360) * (Math.PI / 180)),
      {gap: 0.1, grow: round3(0.85 + rand() * 0.5)}
    );
  });

  readPositions("rockPositions").forEach((p, n) => {
    place(
      `rock-${n}`,
      n % 2 === 0 ? "boulder" : "stones",
      p[0],
      p[2],
      round3(((n * 97) % 360) * (Math.PI / 180)),
      {gap: 0.1}
    );
  });
}

// ─── ⑨ 꽃밭·덤불 ──────────────────────────────────────────────────────────────
// 잔디만 깔린 빈 구석에 색을 넣는다. 꽃밭은 1만 삼각형, 덤불은 1만 3천이라
// (잎사귀마다 UV 섬이 있어 simplify가 거의 안 먹는다) 개수를 아껴 쓴다.
//
// 예전엔 여기서 13개를 깔아 15만 삼각형을 썼다. "빈 구석 채우기"는 이제 ⑪ 빈터가
// 빌보드로 훨씬 싸게 하므로, 여기는 광장에서 가장 가까운 몇 채에만 남긴다 —
// 카메라가 오래 머무는 자리에는 진짜 입체가 서 있어야 한다.
{
  // 꽃밭 10,096 · 덤불 13,514 — 넷이서 4만 7천을 먹었다. 채움 민가 12채가
  // 들어오면서 "빈 구석"이 원래 별로 안 남는데, 이 넷은 그중에서도 가장 비싼
  // 방법으로 구석을 채우고 있었다. 광장에서 가장 가까운 한 자리만 남긴다.
  const FLOWERS = 1;
  const BUSHES = 0;
  let n = 0;
  // 광장에서 가까운 순으로 — 눈길이 가장 오래 머무는 데부터 채운다
  const spots = OUTER.slice()
    .sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z))
    .map((b, i) => ({b, i}));

  for (const {b, i} of spots) {
    if (n >= FLOWERS + BUSHES) break;
    const kind = n < FLOWERS ? "flower-bed" : "berry-bush";
    // 건물 뒤쪽(광장 반대편)에 둬 앞마당 동선을 안 막는다
    const len = Math.hypot(b.x, b.z) || 1;
    const away = {x: b.x / len, z: b.z / len};
    const dist = discs[OUTER.indexOf(b)].r + 0.9;
    if (
      tryPlace(
        `green-${n}`,
        kind,
        b.x + away.x * dist,
        b.z + away.z * dist,
        round3(((i * 61) % 360) * (Math.PI / 180)),
        {gap: 1.5, radius: 2.6}
      )
    )
      n += 1;
  }
}

// ─── ⑩ 마을을 두르는 숲 ───────────────────────────────────────────────────────
// 지금까지 마을은 끝이 없었다. 건물이 끊긴 자리부터 90유닛짜리 잔디 평면이
// 지평선까지 그대로 뻗어서, 아무리 안을 채워도 "무대 세트를 벌판에 놓은" 꼴이었다.
// 마을은 테두리가 있어야 마을로 읽힌다.
//
// 어디까지가 마을인가는 건물 모서리와 길 칸의 볼록 껍질로 정한다. 그 껍질 바깥
// 띠에만 심으므로 구역 사이 오목한 골짜기는 숲이 안 먹는다(거긴 ⑪ 몫).
//
// 전부 빌보드다. 130그루를 심어도 520 삼각형 — 원본이었으면 100만이다.
//
// ─── 길을 껍질에 넣지 않는다 ─────────────────────────────────────────────────
// 예전엔 길 칸도 껍질 점으로 썼다. 그런데 남쪽 정문 진입 축은 일부러 마을 밖
// 벌판까지 뻗어 나가는 길이라, 껍질이 그걸 따라 남쪽으로 길게 늘어졌다.
// 그 결과 정문 양옆 벌판이 통째로 "마을 안"으로 분류돼 숲이 한 그루도 안 심겼고,
// 마을 남쪽 절반이 맨 잔디였다. 마을의 경계는 건물이 정한다.
const hull = convexHull(
  buildings.flatMap(b => [
    [b.x - b.w / 2, b.z - b.d / 2],
    [b.x + b.w / 2, b.z - b.d / 2],
    [b.x + b.w / 2, b.z + b.d / 2],
    [b.x - b.w / 2, b.z + b.d / 2]
  ])
);

// 잔디는 **원반**이다 (VillageScene 의 Ground). 이 밖에 심으면 나무가 절벽
// 너머 허공에 뜬다. 예전엔 "90×90 평면"이라는 사각형을 손으로 적어 뒀는데,
// 씬은 진작 원반으로 바뀐 뒤라 모서리 쪽 나무가 허공에 서 있었다.
// 이제 원본에서 읽고, 아래에서 원형으로 판정한다.
const ISLAND = readIsland();
/** 원반 가장자리 여유 — 딱 붙여 심으면 절벽 경사면에 반쯤 걸친다 */
const ISLAND_INSET = 3;
const GROUND = {
  x0: ISLAND.cx - ISLAND.r + ISLAND_INSET,
  x1: ISLAND.cx + ISLAND.r - ISLAND_INSET,
  z0: ISLAND.cz - ISLAND.r + ISLAND_INSET,
  z1: ISLAND.cz + ISLAND.r - ISLAND_INSET
};
/** 원반 안인가 — 사각형 격자를 훑되 원 밖은 버린다 */
const onIsland = (x, z) =>
  Math.hypot(x - ISLAND.cx, z - ISLAND.cz) <= ISLAND.r - ISLAND_INSET;

/** 껍질 바깥으로 얼마부터 숲인가 — 이보다 가까우면 마을 앞마당이다 */
const BELT_IN = -1.2;
/** 숲 띠의 두께 */
const BELT_DEPTH = 12;

{
  // 껍질에서 길을 뺀 뒤로 숲이 덮을 면적이 크게 늘었는데, 예전 밀도(STEP 1.5,
  // 기본 확률 0.38)를 그대로 쓰니 320그루가 넓은 데 흩뿌려져 "듬성한 잡목"이 됐다.
  // 컨셉 아트의 숲은 블록 사이를 빈틈없이 메운 침엽수 덩어리다.
  // 빌보드 한 그루가 6삼각형이라 두 배로 심어도 값이 안 든다.
  const STEP = 1.25;
  const TREES = [
    "far-pine",
    "far-oak",
    "far-pine",
    "far-sakura",
    "far-oak",
    "far-pine"
  ];
  let n = 0;
  for (let x = GROUND.x0; x <= GROUND.x1; x += STEP) {
    for (let z = GROUND.z0; z <= GROUND.z1; z += STEP) {
      const px = x + (rand() - 0.5) * STEP * 0.9;
      const pz = z + (rand() - 0.5) * STEP * 0.9;
      if (!onIsland(px, pz)) continue;

      // 껍질에서 일정 거리를 띄우면 마을 둘레에 도넛이 그려진다 — 위에서 보면
      // 미스터리 서클이다. 큰 파장의 잡음으로 안쪽 경계를 들쭉날쭉하게 흔들어,
      // 어떤 방향에선 숲이 뒷마당까지 밀고 들어오고 어떤 방향에선 물러나게 한다.
      const wobble = noise2(px * 0.045, pz * 0.045);
      const inHere = BELT_IN + wobble * 4.2;

      const d = polygonDistance(hull, px, pz);
      if (d < inHere) continue;
      // 흔들다 보면 경계가 껍질 안으로도 들어간다(BELT_IN이 음수일 때). 껍질 안엔
      // 길과 건물이 있으므로 여기서 막아야 대로 한복판에 나무가 선다.
      if (onRoad(px, pz, 1.2) || onDisc(px, pz, 0.6) || onBuilding(px, pz, 1.2))
        continue;
      // 폭포·풍차·파고다 섬·개울은 껍질 바깥이라 여기 그대로 두면 숲이 덮어 버린다
      if (nearLandmark(px, pz) || onWall(px, pz, 0.6)) continue;
      const t = (d - inHere) / BELT_DEPTH;
      if (t > 1) continue;

      // 안쪽은 성기게, 깊이 들어갈수록 빽빽하게 — 숲 가장자리가 흐릿해진다.
      // 잡음을 곱해 빈 공터와 덤불 덩어리를 만든다. 균일 확률이면 나무밭이 된다.
      let p =
        Math.min(1, 0.6 + t * 1.8) *
        (0.35 + 1.2 * noise2(px * 0.11, pz * 0.11));
      if (rand() > p) continue;
      if (!free(px, pz, 1.15)) continue;

      // 벚나무는 캐노피가 납작한 원반이라 십자 빌보드로 구우면 위에서 봤을 때
      // 판때기 두 장인 게 드러난다. 마을에서 먼 띠 안쪽(t>0.35)에만 둔다.
      // 침엽수는 원래 원뿔이라 어느 각도에서 봐도 멀쩡하고, 활엽수도 잎이
      // 뭉텅이라 잘 버틴다.
      let kind = TREES[Math.floor(rand() * TREES.length)];
      if (kind === "far-sakura" && t < 0.35) kind = "far-oak";
      const grow = (kind === "far-sakura" ? 0.85 : 0.78) + rand() * 0.5;
      place(`forest-${n++}`, kind, px, pz, round3(rand() * Math.PI * 2), {
        grow
      });
    }
  }
  // 숲 바닥에 덤불을 조금 — 나무 줄기 사이가 훤히 비면 세워 놓은 판때기가 드러난다
  const trunks = props.filter(p => p.id.startsWith("decor-forest-"));
  let b = 0;
  for (const t of trunks) {
    if (rand() > 0.45) continue;
    const a = rand() * Math.PI * 2;
    const r = 0.9 + rand() * 1.1;
    const x = t.position[0] + Math.cos(a) * r;
    const z = t.position[2] + Math.sin(a) * r;
    if (x < GROUND.x0 || x > GROUND.x1 || z < GROUND.z0 || z > GROUND.z1)
      continue;
    if (nearLandmark(x, z)) continue;
    place(`thicket-${b++}`, "far-bush", x, z, round3(rand() * Math.PI * 2), {
      grow: 0.7 + rand() * 0.7
    });
  }
}

// ─── ⑪ 마을 안 빈터 ───────────────────────────────────────────────────────────
// 구역과 구역 사이에 건물도 길도 없는 잔디밭이 넓게 남아 있다. 위에서 내려다본
// 지도로 보면 마을 동쪽에만 12×10 유닛짜리 초록 공백이 있었다.
//
// 여기는 숲으로 메우면 안 된다 — 마을이 숲에 파묻힌다. 나무 한 그루에 덤불과
// 돌을 붙인 작은 무리를 띄엄띄엄 놓아 "손 안 댄 들판"으로 만든다.
// 무리로 놓는 게 핵심이다. 하나씩 흩으면 개수를 아무리 늘려도 휑해 보인다.
{
  // 자리를 격자로 훑어 "가장 가까운 마을 요소까지 얼마나 트여 있나"를 재고,
  // 넓은 데부터 채운다. 처음엔 onRoad 같은 사각 판정에 여유를 3유닛씩 줬는데,
  // 길 칸 간격이 1.88이라 그 판정만으로 마을 안쪽이 통째로 막혀 빈터가 3개밖에
  // 안 나왔다. 진짜 거리를 재면 규칙 하나로 넓은 데를 정확히 골라낸다.
  const distRoad = (x, z) => {
    let best = Infinity;
    for (const r of roads) best = Math.min(best, Math.hypot(r.x - x, r.z - z));
    return best - ROAD_SIDE;
  };
  const distBuilding = (x, z) => {
    let best = Infinity;
    for (const b of buildings) {
      const dx = Math.max(0, Math.abs(b.x - x) - b.w / 2);
      const dz = Math.max(0, Math.abs(b.z - z) - b.d / 2);
      best = Math.min(best, Math.hypot(dx, dz));
    }
    return best;
  };
  const distDisc = (x, z) => {
    let best = Math.hypot(HUB.x - x, HUB.z - z) - HUB_RADIUS;
    for (const d of discs)
      best = Math.min(best, Math.hypot(d.x - x, d.z - z) - d.r);
    return best;
  };
  const openness = (x, z) =>
    Math.min(distRoad(x, z), distBuilding(x, z), distDisc(x, z));

  /** 이보다 좁으면 동선이라 비워 둔다 */
  //
  // 1.7 → 1.3. 구역 단 위를 0.5 격자로 재 보니 길에서 3유닛 이상 떨어진 땅이
  // 36% 나 되는데도 무리가 1개밖에 안 섰다. openness 는 길·건물·앞마당 원반 중
  // **가장 가까운 것**이라, 길이 멀어도 앞마당 원반이 커서 값이 눌린다.
  const MIN_OPEN = 1.3;
  const STEP = 1.2;
  const candidates = [];
  // 이 절이 몇 개를 심었는지 아무도 안 보고 있었다. 실측해 보니 **2개**였다 —
  // 마을 안쪽을 채우라고 만든 규칙이 사실상 안 돌고 있었고, 그게 "바깥 숲은
  // 빽빽한데 안은 휑하다"의 진짜 원인이었다. 어디서 걸러지는지 세어서 찍는다.
  const cut = {hull: 0, hub: 0, open: 0, landmark: 0};

  // ─── 껍질만으로는 정작 빈 데를 못 고른다 ───────────────────────────────────
  // 껍질은 **진짜 건물**의 볼록 껍질이다. 그런데 구역 단(terrace)은 건물 상자보다
  // 넓고, 담장은 그 단 테두리에 선다 — 그래서 담 안쪽인데 껍질 밖인 땅이 생긴다.
  // 부감으로 보면 STUDY·EXPERIENCE 블록 안에 담으로 둘러싸인 **텅 빈 잔디 사각형**이
  // 그대로 보이는데, 여기가 정확히 그 땅이라 규칙이 한 그루도 안 심고 있었다.
  // (실측: 후보 3477곳 중 2768곳이 이 컷에 걸렸고, 살아남은 30곳 중 29곳은
  //  이미 프롭이 있어서 결국 무리 1개만 섰다.)
  //
  // 담 안은 마을이다. 껍질 **또는** 구역 섬 안이면 후보로 친다.
  const inTerrace = (x, z) => onBlock(x, z);

  for (let x = -34; x <= 38; x += STEP) {
    for (let z = -30; z <= 38; z += STEP) {
      const px = x + (rand() - 0.5) * STEP;
      const pz = z + (rand() - 0.5) * STEP;
      // 껍질 안 또는 구역 단 위만 — 그 바깥은 ⑩ 숲이 맡는다
      if (polygonDistance(hull, px, pz) > -0.5 && !inTerrace(px, pz)) {
        cut.hull += 1;
        continue;
      }
      // 광장 앞은 트여 있어야 한다 — 마을의 첫인상이자 카메라가 늘 보는 자리
      if (Math.hypot(px - HUB.x, pz - HUB.z) < HUB_RADIUS + 3.5) {
        cut.hub += 1;
        continue;
      }
      const open = openness(px, pz);
      if (open < MIN_OPEN) {
        cut.open += 1;
        continue;
      }
      if (nearLandmark(px, pz) || onWall(px, pz, 0.6)) {
        cut.landmark += 1;
        continue;
      }
      candidates.push({x: px, z: pz, open});
    }
  }
  // 넓은 데부터 — 좁은 틈을 먼저 채우면 정작 큰 공터에 자리가 안 남는다
  candidates.sort((a, b) => b.open - a.open);

  const glades = [];
  const cut2 = {free: 0, spacing: 0};
  for (const c of candidates) {
    // 트인 만큼 무리 사이를 띄운다. 좁은 틈엔 하나만, 넓은 벌판엔 여러 무리.
    //
    // 구역 바닥을 판석으로 깔고 나서 좁혔다. 포장이 깔리기 전에는 블록 사이
    // 빈 곳이 잔디라 나무가 없어도 "정원"으로 보였는데, 돌로 덮고 나니 같은
    // 자리가 **아무것도 없는 돌마당**이 됐다. 컨셉 아트의 포장 위에는 나무와
    // 화단이 촘촘히 서 있고, 그게 돌바닥을 삭막하지 않게 만든다.
    const spacing = Math.min(3.4, 1.7 + c.open * 0.4);
    // free() 에 spacing 을 그대로 넘겼더니 후보 84곳이 전부 걸렸다 — 마을 안쪽은
    // 5유닛 안에 가로등이든 화분이든 반드시 하나는 있다. 겹치지만 않으면 되므로
    // 프롭 간 최소 간격과 무리 간 간격은 따로 잡는다.
    // 1.5 → 1.1. 살아남은 후보의 대부분이 여기서 죽고 있었다(97곳 중 80곳).
    // 마을 안은 어디를 짚어도 1.5유닛 안에 가로등이든 담장이든 하나는 있다.
    if (!free(c.x, c.z, 1.1)) {
      cut2.free += 1;
      continue;
    }
    if (glades.some(g => Math.hypot(g.x - c.x, g.z - c.z) < spacing)) {
      cut2.spacing += 1;
      continue;
    }
    glades.push(c);
  }
  console.log(
    `  빈터 후보: 격자에서 ${candidates.length}곳 남음 ` +
      `(껍질밖 ${cut.hull} · 광장앞 ${cut.hub} · 안트임 ${cut.open} · 랜드마크/담장 ${cut.landmark} 컷)` +
      `\n         → 무리 ${glades.length}개 (기존프롭겹침 ${cut2.free} · 무리간격 ${cut2.spacing} 컷)`
  );

  // 빈터는 마을 안이라 카메라가 가까이 붙는다. 벚나무 빌보드는 여기서 바로
  // 들통나므로 빼고, 어느 각도에서나 버티는 침엽수를 주로 쓴다.
  const TREES = ["far-pine", "far-oak", "far-pine", "far-pine", "far-oak"];
  let n = 0;
  glades.forEach((g, i) => {
    place(
      `glade-${n++}`,
      TREES[i % TREES.length],
      g.x,
      g.z,
      round3(rand() * Math.PI * 2),
      {
        grow: 0.8 + rand() * 0.35
      }
    );
    // 나무 밑에 덤불·돌 두어 개. 한 그루만 서 있으면 심어 놓은 가로수처럼 보인다.
    const around = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < around; k++) {
      const a = rand() * Math.PI * 2;
      const r = 1.0 + rand() * Math.min(2.2, g.open * 0.6);
      const x = g.x + Math.cos(a) * r;
      const z = g.z + Math.sin(a) * r;
      if (openness(x, z) < 1.2 || onWall(x, z, 0.4)) continue;
      // 돌은 원본을 써도 2~3천 삼각형이라 부담이 없고, 빌보드가 아니라 진짜 입체라
      // 어느 각도에서도 버틴다. 예전엔 다섯에 하나만 섞었는데(0.2), 부감이 열리면서
      // 덤불 임포스터의 수평 뚜껑이 잔디에 붙은 잎사귀로 보이는 게 드러나 뒤집었다.
      // 빈터는 마을 안이라 부감에 그대로 들어온다.
      const kind =
        rand() < 0.6 ? (rand() < 0.5 ? "stones" : "boulder") : "far-bush";
      place(`glade-${n++}`, kind, x, z, round3(rand() * Math.PI * 2), {
        grow: 0.65 + rand() * 0.6
      });
    }
  });
}

// ─── ⑫ 길가 ──────────────────────────────────────────────────────────────────
// 길은 가로등만 서 있고 나머지는 맨 잔디라, 걸어가는 동안 눈이 쉴 데가 없었다.
// 가로등 사이사이에 작은 것들을 번갈아 놓아 길에 리듬을 준다.
{
  // 처음엔 덤불 빌보드가 4/6이었다("길가는 스치는 자리라 대역으로 충분하다").
  // 카메라 상한을 78로 열고 나서 보니 아니었다 — 덤불 임포스터의 **수평 뚜껑**이
  // 위에서 내려다보면 잔디에 붙은 잎사귀 한 장으로 보인다. 뚜껑은 눈높이에서
  // 십자의 옆날이 드러나는 걸 막으려고 단 건데, 부감에서는 그게 정체를 드러낸다.
  // 길가는 마을 안쪽이라 부감에 그대로 들어오므로 진짜 입체를 주로 쓴다.
  // 돌은 2~3천이라 부담이 없다. 덤불은 여섯에 하나만 남겨 실루엣만 섞는다.
  const KINDS = [
    "stones",
    "boulder",
    "boulder",
    "stones",
    "far-bush",
    "boulder"
  ];
  const sorted = tileRoads.slice().sort((a, b) => a.z - b.z || a.x - b.x);
  let n = 0;
  for (const r of sorted) {
    const hasWE = sorted.some(
      o =>
        Math.abs(o.z - r.z) < 0.1 && Math.abs(Math.abs(o.x - r.x) - PITCH) < 0.1
    );
    const perp = hasWE ? {x: 0, z: 1} : {x: 1, z: 0};
    const sign = n % 2 === 0 ? 1 : -1;
    const side = ROAD_SIDE + 0.5 + rand() * 0.45;
    const x = r.x + perp.x * side * sign;
    const z = r.z + perp.z * side * sign;
    if (
      onDisc(x, z, 0.15) ||
      onBuilding(x, z, 0.5) ||
      onRoad(x, z, 0.05) ||
      onWall(x, z, 0.25)
    )
      continue;
    // 가로등(2.2 간격)과 겹치지 않게. 여기서 걸리는 칸이 많아야 정상이다 —
    // 남는 자리에만 들어가야 길가가 물건으로 꽉 차 보이지 않는다.
    if (!free(x, z, 1.35)) continue;
    const kind = KINDS[n % KINDS.length];
    place(`verge-${n++}`, kind, x, z, round3(rand() * Math.PI * 2), {
      grow: 0.7 + rand() * 0.45
    });
  }
}

// ─── ⑬ 참배로 울타리 (맨 마지막) ──────────────────────────────────────────────
// **한때 마을의 모든 길 양옆에 세웠다. 되돌렸다.**
//
// 그때 이유는 "포장을 넓게 깔아 놔서 어디까지가 길인지 안 읽힌다"였다. 구역
// 안쪽이 통째로 판석이던 시절엔 맞는 말이었다. 그런데 블록을 잔디로 되돌리자
// **돌길이 초록 위에서 저절로 읽히고**, 남은 건 울타리 133토막이 부감에서 그리는
// 갈색 격자뿐이었다 — 길 사이 잔디 띠마다 울타리가 두 줄씩 서서 마을이 아니라
// **축사 우리**처럼 보였다(캡처로 확인).
//
// 울타리는 "뭔가를 둘러쌀 때"만 값을 한다. 그래서 남쪽 참배로에만 남긴다 —
// 마을에 들어서는 첫 길 양옆에 늘어서면 격식이 생기고, 그 한 줄뿐이라 눈에 걸리지
// 않는다. 구역 테두리는 담장(wall-low)이 이미 맡고 있다.
//
// **맨 마지막에 놓는다.** 처음엔 ③-b 깃대 바로 뒤에 뒀는데, 길가 자리를 울타리가
// 먼저 차지해 버려서 화단이 34→15, 가로등이 13→4, 앞마당 소품이 25→5 로 줄었다.
{
  const key = (x, z) => `${Math.round(x / PITCH)}_${Math.round(z / PITCH)}`;
  const roadAt = new Set(tileRoads.map(r => key(r.x, r.z)));
  const has = (x, z) => roadAt.has(key(x, z));
  /** 참배로 = 바닥 생성기의 i=0 축(남쪽 진입로 + 북쪽 파고다 길) */
  const onAxis = r => Math.abs(r.x) < PITCH * 0.6;

  let n = 0;
  let skippedJunction = 0;
  for (const r of roads) {
    if (!onAxis(r)) continue;
    const ew = has(r.x - PITCH, r.z) || has(r.x + PITCH, r.z);
    const ns = has(r.x, r.z - PITCH) || has(r.x, r.z + PITCH);
    // 사거리·T 자 — 어느 쪽으로도 울타리를 세울 수 없다
    if (ew && ns) {
      skippedJunction += 1;
      continue;
    }
    if (!ew && !ns) continue;

    const perp = ew ? {x: 0, z: 1} : {x: 1, z: 0};
    const rot = ew ? 0 : round3(Math.PI / 2);
    for (const side of [-1, 1]) {
      const x = round3(r.x + perp.x * (ROAD_SIDE + 0.3) * side);
      const z = round3(r.z + perp.z * (ROAD_SIDE + 0.3) * side);
      // 울타리는 두께 0.13 짜리 얇은 판이라 다른 소품에 바짝 붙어도 안 겹친다.
      // 여유를 0.8 로 뒀더니 63토막밖에 안 서서 길을 못 그렸다.
      if (onRoad(x, z, 0.02) || onDisc(x, z, 0.1) || onBuilding(x, z, 0.2))
        continue;
      if (onWall(x, z, 0.05) || !free(x, z, 0.5)) continue;
      place(`fence-${n++}`, "fence-rail", x, z, rot, {gap: 0.5});
      // 담장과 같은 선분 판정에 태운다 — 뒤에 오는 절들이 여기 겹쳐 심지 않게
      walls.push({x, z, ax: ew ? 1 : 0, az: ew ? 0 : 1});
    }
  }
  console.log(
    `  참배로 울타리 ${n}토막 · 교차로라 건너뛴 칸 ${skippedJunction}곳`
  );
}

// ─── ⑭-a 구역 섬 울타리 — 돌담의 틈을 채워 **닫힌 섬**으로 ────────────────────
// 골짜기가 물이 되면서 구역 하나하나가 섬이다. 그런데 ②-d 의 돌담은 91토막을
// 여섯 구역이 나눠 갖는 성긴 줄이라(길·민가·랜드마크에 밀려 빈 틈 투성이) 섬이
// "둘러싸였다"로 안 읽힌다. 돌담이 못 선 틈마다 **울타리(fence-rail)** 를 채워
// 구역마다 완전히 닫힌 테두리를 만든다 — 돌담과 울타리가 섞인 줄은 오히려
// 마을답다(전부 같은 토막이면 공장 티가 난다).
//
// **문은 두 군데만 연다**: ① 길이 지나는 자리(현판 아치·대문 계단이 서는 곳),
// ② 다리·둑길이 닿는 자리. 그리로만 옆 구역·광장·물로 나간다.
//
// 회전 규약: rotationY=r 은 모델 +X 를 (cos r, -sin r) 로 돌린다. 변 방향
// (dx,dz) 에 맞추려면 r = atan2(-dz, dx).
{
  const SEG = 1.9;
  /** 다리·둑길이 닿는 자리인가 — 건널목 좌표에서 이 안이면 문이다 */
  const nearCrossing = (x, z) =>
    (TERR.crossings ?? []).some(c => Math.hypot(c.x - x, c.z - z) < 2.2);
  // 진짜 문의 표지 — 대문 계단·현판 아치가 이미 서 있는 자리.
  // onRoad(0.75) 를 문으로 쳤더니 **테두리를 따라 도는 길**까지 전부 문이 되어
  // 170칸 중 84칸이 비고 울타리가 1토막 섰다. 길이 테두리와 나란한 것과
  // 테두리를 **가로질러 나가는** 것은 다르다 — 나가는 자리에는 반드시 계단이나
  // 아치가 서 있으므로 그걸 표지로 삼는다.
  const gateProps = props.filter(p =>
    /^decor-(gatestep-|arch-|gate-|pier-)/.test(p.id)
  );
  const nearGate = (x, z) =>
    gateProps.some(p => Math.hypot(p.position[0] - x, p.position[2] - z) < 2.4);
  let put = 0;
  let gates = 0;
  let cutWall = 0;
  let cutBuilding = 0;
  let cutFree = 0;
  for (const isl of TERR_ISLANDS) {
    // 담장(②-d)과 같은 선 — 물가에서 0.35 안쪽 원둘레
    const R = isl.r - 0.35;
    const count = Math.max(8, Math.round((2 * Math.PI * R) / SEG));
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2;
      const nx = Math.cos(a);
      const nz = Math.sin(a);
      const x = round3(isl.x + nx * R);
      const z = round3(isl.z + nz * R);
      // 문: 다리 어귀·대문 계단·현판 아치 자리 **뿐이다.** onRoad 는 어떤
      // 여유로도 쓰면 안 된다 — 구역 안 길이 테두리에 바짝 붙어 돌아서
      // 0.35 로도 40칸 넘게 문이 됐다. 밖으로 나가는 길에는 반드시 계단이나
      // 아치나 건널목이 서 있으므로 그 표지로 충분하다.
      if (nearCrossing(x, z) || nearGate(x, z)) {
        gates++;
        continue;
      }
      // 이미 돌담(또는 앞서 놓은 울타리)이 서 있으면 그 토막이 담당이다
      if (onWall(x, z, 0.55)) {
        cutWall++;
        continue;
      }
      if (onBuilding(x, z, 0.15) || onDisc(x, z, 0.05)) {
        cutBuilding++;
        continue;
      }
      if (!free(x, z, 0.5)) {
        cutFree++;
        continue;
      }
      // 접선 정렬 — ②-d 담장과 같은 식
      const rot = round3(Math.atan2(-nx, -nz));
      if (place(`isle-fence-${put}`, "fence-rail", x, z, rot, {gap: 0.5})) {
        walls.push({x, z, ax: Math.cos(rot), az: Math.sin(rot)});
        put++;
      }
    }
  }
  console.log(
    `  구역 섬 울타리 ${put}토막 · 문 ${gates} · 돌담 ${cutWall} · 건물/원반 ${cutBuilding} · 기존프롭 ${cutFree}`
  );
}

// ─── ⑭ 물가 단장 ──────────────────────────────────────────────────────────────
// 골짜기를 물로 채우면서 장식물 262개가 사라졌다 — 나무 58, 가로등 20, 돌 26,
// 채움 민가 20, 담장 73토막. 전부 이제 물이 된 자리에 서 있던 것들이다.
//
// **그런데 단 위로 "옮길" 자리는 없다.** 실측해 보니 구역 단은 어느 점을 짚어도
// 반경 2.2 안에 건물이나 프롭이 있다(빈 땅 0%). 물이 삼킨 건 원래 구역 **사이**
// 였고, 거긴 이제 물인 게 맞다.
//
// 정말로 빈 곳은 따로 있었다 — **물가**다. 물은 마을에서 가장 긴 테두리를
// 새로 그었는데, 그 선을 위해 놓인 물건이 하나도 없다. 게다가 `place` 의
// `nearShore` 규칙(물가 0.9 안 금지)이 그 띠를 **구조적으로** 비워 두고 있었다.
// 그래서 물 건너에서 구역을 보면 축대 위가 민둥 잔디로 끝난다.
//
// 여기서 채우는 건 "잃은 것을 되돌리기"가 아니라 **물가라서 생긴 새 자리**다:
// 축대 위를 따라 늘어선 가로등, 물을 보고 앉은 벤치, 둑 밑에 반쯤 잠긴 바위.
//
// ── 왜 담장 안쪽 1.35 인가 ─────────────────────────────────────────────────
// 단 테두리에는 이미 ②-d 의 낮은 돌담이 서 있다. 그 바깥은 곧장 축대 절벽이라
// 놓을 데가 없다. 담 안쪽에 세우면 물 건너에서 볼 때 물 → 축대 → 돌담 → 가로등
// 순으로 층이 쌓여 **부두**처럼 읽힌다. 1.35 면 담장 선분(반두께 0.2)에서
// 1.29 떨어져 겹치지 않고, 물에서도 2.29 라 `nearShore` 에 안 걸린다.
//
// ── 물가 바위만 물 위에 놓는다 ─────────────────────────────────────────────
// 축대 밑동이 물과 만나는 선이 자로 그은 듯 곧아서 인공적으로 보인다. 그 선에
// 바위를 걸쳐 놓으면 선이 부서진다. 프롭 높이는 씬이 `terrainHeightAt` 로 얹는데
// 물 위는 0 이라 바위가 수면(0.03)에 반쯤 잠긴다 — 노린 그림이 그대로 나온다.
{
  const terr = JSON.parse(
    readFileSync("src/data/villageTerraces.json", "utf8")
  );
  const INSET = 1.35;
  /** 테두리를 훑는 간격. 아래 리듬은 이 간격의 배수로 잡는다. */
  const STEP = 1.1;

  /** {x,z} 는 놓을 자리, {ex,ez} 는 물가 선, {ox,oz} 는 물 쪽 단위벡터 */
  const rim = [];
  const outIsWater = (ex, ez, ox, oz) =>
    inInnerWater(ex + ox * 1.4, ez + oz * 1.4);

  for (const isl of terr.islands ?? []) {
    // 원반 섬 — 물가는 원둘레, 바깥 방향은 방사 방향이다
    const count = Math.max(8, Math.round((2 * Math.PI * isl.r) / STEP));
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2;
      const ox = Math.cos(a);
      const oz = Math.sin(a);
      const ex = isl.x + ox * isl.r;
      const ez = isl.z + oz * isl.r;
      // 이웃 섬과 마주 붙은 좁은 목은 물가가 아니다
      if (!outIsWater(ex, ez, ox, oz)) continue;
      rim.push({
        x: ex - ox * INSET,
        z: ez - oz * INSET,
        ex,
        ez,
        ox,
        oz
      });
    }
  }

  // 광장 섬. 240 마디를 3칸씩 건너뛰면 0.7 간격이라 구역 테두리와 비슷해진다.
  for (let i = 0; i < DAIS_LINE.length; i += 3) {
    const p = DAIS_LINE[i];
    const r = Math.hypot(p.x, p.z) || 1;
    const ox = p.x / r;
    const oz = p.z / r;
    if (!outIsWater(p.x, p.z, ox, oz)) continue;
    rim.push({
      x: p.x - ox * INSET,
      z: p.z - oz * INSET,
      ex: p.x,
      ez: p.z,
      ox,
      oz
    });
  }

  /**
   * 테두리를 따라가며 종류별로 다른 주기로 놓는다.
   *
   * 주기를 서로 **서로소**로 잡는 게 요령이다. 7·17·23·29·61 은 공배수가 멀어
   * 같은 자리에 두 개가 겹치는 일이 거의 없고, 무엇보다 반복 주기가 안 보인다.
   * 전부 6의 배수로 잡으면 "가로등-벤치-화분"이 한 세트로 되풀이되는 게 눈에 띈다.
   */
  const MENU = [
    // 가로등이 가장 촘촘하다 — 물가 리듬을 만드는 건 결국 불빛이다 (1,780 삼각형)
    {kind: "lantern-post", every: 7, phase: 0, gap: 1.1, face: true},
    // 물을 보고 앉은 벤치. 물가에 사람이 머무는 이유가 된다.
    {kind: "bench", every: 17, phase: 3, gap: 1.5, face: true},
    {kind: "flower-pot", every: 23, phase: 9, gap: 1.2, face: true},
    {kind: "barrel-iron", every: 29, phase: 14, gap: 1.0},
    // 물 위로 늘어진 벚나무. 드물어야 눈에 띈다.
    {kind: "tree-sakura", every: 61, phase: 31, gap: 2.0, grow: 0.85}
  ];

  const tally = {};
  // 어디서 걸러지는지 세어 둔다. 이 파일에서 여러 번 당한 실패가 "규칙은 도는데
  // 결과가 한 자리 수"라 로그 없이는 원인을 못 찾는다.
  const cut = {road: 0, disc: 0, building: 0, wall: 0, free: 0, place: 0};
  let n = 0;
  rim.forEach((s, i) => {
    for (const m of MENU) {
      if ((i + m.phase) % m.every !== 0) continue;
      if (onRoad(s.x, s.z, 0.4)) {
        cut.road += 1;
        continue;
      }
      if (onDisc(s.x, s.z, 0.1)) {
        cut.disc += 1;
        continue;
      }
      if (onBuilding(s.x, s.z, 0.5)) {
        cut.building += 1;
        continue;
      }
      if (onWall(s.x, s.z, 0.3)) {
        cut.wall += 1;
        continue;
      }
      const rot = m.face
        ? faceTo(s.ox, s.oz)
        : round3(((i * 137) % 360) * (Math.PI / 180));
      // 정확히 그 점이 막혔으면 **물가를 따라** 조금 비켜 놓는다. 그냥 버리면
      // (처음엔 그랬다) 89번 시도해 9개밖에 안 섰다 — 물가 띠에는 이미 담장·
      // 가로등·앞뜰이 있어 정확한 한 점이 비어 있을 확률이 낮다.
      //
      // **비키는 방향은 접선뿐이다.** 범용 `findSpot` 을 썼더니 물 쪽으로도
      // 밀어서 28개가 `nearShore` 에 걸려 되돌아왔다. 물가에서의 거리는 이
      // 절의 전제(담장 안쪽 1.35)라 건드리면 안 된다.
      const tx = -s.oz;
      const tz = s.ox;
      let put = false;
      for (const d of [0, 0.55, -0.55, 1.1, -1.1]) {
        const px = s.x + tx * d;
        const pz = s.z + tz * d;
        if (!free(px, pz, m.gap)) continue;
        if (onWall(px, pz, 0.3) || onBuilding(px, pz, 0.5)) continue;
        if (
          place(`quay-${n}`, m.kind, px, pz, rot, {
            gap: m.gap,
            grow: m.grow ?? 1
          })
        ) {
          tally[m.kind] = (tally[m.kind] ?? 0) + 1;
          n += 1;
          put = true;
        }
        break;
      }
      if (!put) cut.free += 1;
      break; // 한 자리엔 하나만
    }
  });
  console.log(
    `  물가 컷: 길 ${cut.road} · 앞마당 ${cut.disc} · 건물 ${cut.building} · ` +
      `담장 ${cut.wall} · 기존프롭 ${cut.free} · place ${cut.place}`
  );

  // ─── 둑 밑 바위 ─────────────────────────────────────────────────────────────
  // 물 위라 `onWater` 로 물·물가 검사를 건너뛴다. 다리 자리는 피한다 —
  // 건널목마다 반경 3.4 짜리 금지 원이 landmarks 에 들어 있다.
  let rocks = 0;
  rim.forEach((s, i) => {
    if ((i + 5) % 9 !== 0) return;
    const x = round3(s.ex + s.ox * 0.55);
    const z = round3(s.ez + s.oz * 0.55);
    if (nearLandmark(x, z)) return;
    if (!free(x, z, 1.6)) return;
    const kind = (i / 9) % 2 === 0 ? "stones" : "boulder";
    if (
      place(
        `quay-rock-${rocks}`,
        kind,
        x,
        z,
        round3(((i * 97) % 360) * (Math.PI / 180)),
        {
          gap: 1.6,
          grow: round3(0.55 + rand() * 0.45),
          onWater: true
        }
      )
    )
      rocks += 1;
  });

  console.log(
    `  물가 단장 ${n}개 (${Object.entries(tally)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")}) · 둑 밑 바위 ${rocks}개  [테두리 표본 ${rim.length}]`
  );
}

// ─── ⑮ 고리 회랑 가로등 ───────────────────────────────────────────────────────
// 광장을 두르는 물 위 데크(VillageScene 의 PlazaRingWalk)에 가로등을 띄엄띄엄.
// 컨셉의 고리 산책로에는 등이 줄지어 서서, 밤 부감에서 광장이 빛 고리로 읽힌다.
//
// 데크는 물 위라 place() 의 물 금지에 걸린다 — onWater 로 지나간다. 높이는
// 씬이 terrainHeightAt(물 위 0)을 얹으므로 데크(0.14)에 맞춰 미리 띄운다.
{
  const DECK = 0.14;
  const EVERY = Math.PI / 6; // 30° — 한 바퀴 12자리
  let put = 0;
  for (let a = EVERY / 2; a < Math.PI * 2; a += EVERY) {
    const dr = daisRadiusAt(a);
    if (dr === 0) break;
    const x = round3(Math.cos(a) * (dr + 1.55));
    const z = round3(Math.sin(a) * (dr + 1.55));
    // 다리가 갈라지는 어귀는 비운다 — 등이 다리 난간과 겹친다
    if ((TERR.crossings ?? []).some(c => Math.hypot(c.x - x, c.z - z) < 2.4))
      continue;
    if (!free(x, z, 1.6)) continue;
    const p = props.length;
    if (
      place(`ring-lantern-${put}`, "lantern-post", x, z, faceTo(-x, -z), {
        gap: 1.6,
        onWater: true
      })
    ) {
      // place 는 y 를 지면 기준으로 잡는다 — 데크 높이만큼 올린다
      props[p].position[1] = round3(props[p].position[1] + DECK);
      put += 1;
    }
  }
  console.log(`  고리 회랑 가로등 ${put}개`);
}

// ─── ⑮-b 고리 회랑 난간 ──────────────────────────────────────────────────────
// 섬 테두리처럼 광장 회랑(물 위 데크)의 바깥 가장자리도 나무 울타리로 두른다 —
// 다리가 갈라져 나가는 어귀만 뚫는다. 데크에서 물로 떨어지는 유일한 낭떠러지가
// 여기였다. 울타리는 걷기 충돌 선분(fence-rail)이라 세우는 즉시 몸도 막는다.
//
// 가로등(⑮)을 먼저 세우고 여기서는 free() 를 안 본다 — 난간은 이어져야 값을
// 하는 물건이라 등불 옆이라고 끊으면 안 되고, 등불 기둥이 난간 위로 솟는 그림이
// 컨셉 그대로다.
{
  // 데크 폭의 권위는 villageTerrain.PLAZA_RING — 값을 베끼면 낡는다
  const RING_W = Number(
    readFileSync("src/lib/villageTerrain.ts", "utf8").match(
      /width:\s*([\d.]+)/
    )?.[1] ?? 2.1
  );
  const DECK = 0.14;
  const SEG = 1.9;
  const bridgeCells = TERR.bridgeCells ?? [];
  const nearBridge = (x, z) =>
    bridgeCells.some(c => Math.hypot(c.x - x, c.z - z) < 1.15);
  let put = 0;
  let gates = 0;
  // 반지름은 각도별 데크 바깥 가장자리에서 반 뼘 안쪽
  const R_OF = a => daisRadiusAt(a) + RING_W - 0.28;
  const COUNT = Math.max(24, Math.round((2 * Math.PI * R_OF(0)) / SEG));
  for (let k = 0; k < COUNT; k++) {
    const a = (k / COUNT) * Math.PI * 2;
    const nx = Math.cos(a);
    const nz = Math.sin(a);
    const R = R_OF(a);
    const x = round3(nx * R);
    const z = round3(nz * R);
    // 다리 어귀는 문이다 — 건널목(다리 몸통)과 둑길 칸 둘 다 본다
    if (
      (TERR.crossings ?? []).some(c => Math.hypot(c.x - x, c.z - z) < 2.3) ||
      nearBridge(x, z)
    ) {
      gates++;
      continue;
    }
    if (onWall(x, z, 0.3)) continue;
    const rot = round3(Math.atan2(-nx, -nz));
    const p = props.length;
    if (
      place(`ring-fence-${put}`, "fence-rail", x, z, rot, {
        gap: 0.1,
        onWater: true
      })
    ) {
      // place 는 y 를 지면 기준으로 잡는다 — 데크 높이만큼 올린다 (⑮ 와 같다)
      props[p].position[1] = round3(props[p].position[1] + DECK);
      walls.push({x, z, ax: Math.cos(rot), az: Math.sin(rot)});
      put++;
    }
  }
  console.log(`  고리 회랑 난간 ${put}토막 · 다리 어귀 ${gates}곳 비움`);
}

// ─── 쓰기 ─────────────────────────────────────────────────────────────────────
const kept = layout.props.filter(p => !p.id.startsWith("decor-"));
const next = {...layout, props: [...kept, ...props]};

// 삼각형 청구서. 개수만 세면 "빌보드 300개"와 "원본 나무 300그루"가 같아 보인다.
// GLB의 JSON 청크에서 인덱스 개수를 읽는다 (Draco여도 accessor.count 는 남아 있다).
function trianglesOf(glb) {
  const file = `public${glb}`;
  if (!existsSync(file)) return null;
  const buf = readFileSync(file);
  let off = 12,
    gltf = null;
  while (off < buf.length && !gltf) {
    const len = buf.readUInt32LE(off);
    if (buf.readUInt32LE(off + 4) === 0x4e4f534a)
      gltf = JSON.parse(buf.slice(off + 8, off + 8 + len).toString("utf8"));
    off += 8 + len;
    while (off % 4) off++;
  }
  let t = 0;
  for (const mesh of gltf?.meshes ?? [])
    for (const prim of mesh.primitives)
      t +=
        (prim.indices != null
          ? gltf.accessors[prim.indices].count
          : gltf.accessors[prim.attributes.POSITION].count) / 3;
  return t;
}

const tally = {};
for (const p of props) {
  // 같은 이름이 nature/ 와 impostor/ 양쪽에 있다 — 폴더까지 적어야 구분된다
  const kind = p.glb.split("/").slice(-2).join("/").replace(".glb", "");
  tally[kind] = (tally[kind] ?? 0) + 1;
}
const triCache = new Map();
let totalTris = 0;
const missing = [];
const billed = Object.entries(tally).map(([kind, count]) => {
  const glb = props.find(p => p.glb.includes(`${kind}.glb`)).glb;
  if (!triCache.has(glb)) triCache.set(glb, trianglesOf(glb));
  const each = triCache.get(glb);
  if (each === null) missing.push(glb);
  const sum = (each ?? 0) * count;
  totalTris += sum;
  return {kind, count, each, sum};
});

// 어느 층이 몇 개를 놓았나 — 규칙을 손볼 때 여기부터 본다
const bySection = {};
for (const p of props) {
  const section = p.id.replace(/^decor-/, "").replace(/-?\d+$/, "") || "기타";
  bySection[section] = (bySection[section] ?? 0) + 1;
}

console.log(
  `장식물 ${props.length}개  (decor 외 프롭 ${kept.length}개는 그대로)`
);
console.log(
  "  층별: " +
    Object.entries(bySection)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")
);
for (const {kind, count, each, sum} of billed.sort((a, b) => b.sum - a.sum))
  console.log(
    `  ${kind.padEnd(34)} ${String(count).padStart(4)}개` +
      ` × ${each === null ? "  ?  " : String(Math.round(each)).padStart(5)}` +
      ` = ${String(Math.round(sum / 1000)).padStart(4)}k`
  );
console.log(
  `  ${"합계".padEnd(34)} ${String(props.length).padStart(4)}개              ${(
    totalTris / 1000
  ).toFixed(0)}k 삼각형`
);
if (missing.length)
  console.log(`  ! 파일을 못 찾아 못 센 것: ${missing.join(", ")}`);
console.log(
  `  걸어 다니는 구역: 원본으로 바꿔 심음 ${promoted}개 · 빼버림 ${dropped}개`
);
if (skipped.length)
  console.log(`  자리를 못 찾아 뺀 것: ${skipped.join(", ")}`);

if (DRY) {
  console.log("\n--dry — 파일은 안 건드렸습니다");
} else {
  writeFileSync(LAYOUT, JSON.stringify(next, null, 2) + "\n");
  console.log(`\n${LAYOUT} 갱신 완료`);
}
