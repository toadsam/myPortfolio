// 코드에 손으로 박아 둔 색을 마을 팔레트에 맞춰 준다.
//
// ── 왜 필요한가 ────────────────────────────────────────────────────────────
// 팔레트 잠금(villageMaterial)은 **GLB 파일을 불러오는 자리**에 걸려 있다.
// 그런데 물·잔디·축대·링 마커처럼 코드가 직접 그리는 것들은 그 자리를 지나가지
// 않아서 원래 색 그대로 남는다. 주변이 정돈될수록 안 정돈된 게 더 튀어서,
// 지금은 물의 형광 청록과 accentColor 의 네온이 화면에서 제일 시끄럽다.
//
// 이것들은 개수가 적고 값이 코드에 적혀 있으므로 런타임 셰이더 대신 **값 자체를
// 고친다** — 계산 비용 0, 리뷰 가능, 되돌리기는 git.
//
// ── 두 가지 처방을 구분한다 (한 번 잘못 섞었다가 고쳤다) ────────────────────
//
//   mute() — **색조는 두고 채도만 깎는다.**  물 · 잔디 · 산 · 절벽
//     이것들의 문제는 색조가 아니라 채도였다. 청록도 초록도 팔레트 안에 있는
//     색이고 그냥 너무 쨍할 뿐이다. 처음엔 여기까지 색조를 스냅했더니 산이
//     초록에서 **겨자색**이 됐다 — 자연물을 억지로 돌리면 안 된다.
//
//   snap() — **색조를 팔레트로 돌리고 채도도 깎는다.**  accentColor · 마커
//     이건 사이버펑크 시절의 네온이라 색조 자체가 마을에 없는 색이다.
//     #00ff88 같은 건 아무리 채도를 깎아도 마을 색이 안 된다.
//
// 밝기(L)는 둘 다 그대로 둔다. 건드리면 물이 뿌예지고 마커가 안 보인다.
//
// 사용법: node scripts/snap-colors.mjs

import {readFileSync} from "node:fs";

const {colors, hues} = JSON.parse(
  readFileSync("src/data/villageColors.json", "utf8")
);

// ─── Oklab ────────────────────────────────────────────────────────────────────
const toLinear = c =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toSrgb = c =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

function hexToOklab(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const R = toLinear(((n >> 16) & 255) / 255);
  const G = toLinear(((n >> 8) & 255) / 255);
  const B = toLinear((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}

function oklabToHex(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ].map(v =>
    Math.max(
      0,
      Math.min(255, Math.round(toSrgb(Math.max(0, Math.min(1, v))) * 255))
    )
  );
  return "#" + rgb.map(v => v.toString(16).padStart(2, "0")).join("");
}

// ─── 채도 상한 — 컨셉 아트에서 실측 ──────────────────────────────────────────
// 감으로 정하면 취향 싸움이 되므로, 컨셉 아트 팔레트가 실제로 쓰는 채도의
// 상위 몇 %를 상한으로 삼는다. 컨셉에 없는 채도는 우리 마을에도 없어야 한다.
const chromas = colors.map(c => Math.hypot(c.a, c.b)).sort((x, y) => x - y);
const CEIL = chromas[Math.floor(chromas.length * 0.9)];
console.log(
  `컨셉 아트 채도: 중앙 ${chromas[Math.floor(chromas.length / 2)].toFixed(
    3
  )} · ` +
    `상한(90%) ${CEIL.toFixed(3)} · 최대 ${chromas[chromas.length - 1].toFixed(
      3
    )}\n`
);

/**
 * @param hex 원래 색
 * @param ceilMul 채도 상한 배율. 강조색은 조금 더 허용해도 된다(1.3 정도).
 */
function snap(hex, ceilMul = 1) {
  const [L, a, b] = hexToOklab(hex);
  const C = Math.hypot(a, b);
  if (C < 1e-4) return {hex, out: hex, note: "무채색 — 색조가 없어 그대로"};
  const dir = [a / C, b / C];
  let best = null,
    bestDot = -2;
  for (const h of hues) {
    const d = dir[0] * h.dir[0] + dir[1] * h.dir[1];
    if (d > bestDot) {
      bestDot = d;
      best = h;
    }
  }
  const newC = Math.min(C, CEIL * ceilMul);
  const out = oklabToHex(L, best.dir[0] * newC, best.dir[1] * newC);
  const turn = Math.round(
    (Math.acos(Math.max(-1, Math.min(1, bestDot))) * 180) / Math.PI
  );
  return {
    hex,
    out,
    note: `색조 ${turn}° 돌림 · 채도 ${C.toFixed(3)}→${newC.toFixed(3)}${
      newC < C ? " (깎임)" : ""
    }`
  };
}

/** 색조는 그대로, 채도만 상한까지 깎는다 — 자연물용 */
function mute(hex, ceilMul = 1) {
  const [L, a, b] = hexToOklab(hex);
  const C = Math.hypot(a, b);
  const ceil = CEIL * ceilMul;
  if (C <= ceil)
    return {
      hex,
      out: hex,
      note: `채도 ${C.toFixed(3)} — 이미 상한 이하, 그대로`
    };
  const k = ceil / C;
  return {
    hex,
    out: oklabToHex(L, a * k, b * k),
    note: `채도 ${C.toFixed(3)} → ${ceil.toFixed(3)} (색조 유지)`
  };
}

function show(title, list, fn, ceilMul = 1) {
  console.log(`── ${title} ${"─".repeat(Math.max(0, 40 - title.length))}`);
  for (const [label, hex] of list) {
    const r = fn(hex, ceilMul);
    console.log(`   ${label.padEnd(26)} ${r.hex} → ${r.out}   ${r.note}`);
  }
  console.log();
}

// ① 물 — 화면에서 제일 튀는 것. 색조(청록)는 팔레트 안에 있으니 채도만.
//    물은 배경이 아니라 눈길이 가야 하는 요소라 상한을 조금 더 준다.
show(
  "물 (채도만)",
  [
    ["호수 (Water)", "#2d6a86"],
    ["개울 가장자리 shallow", "#63c7c4"],
    ["개울 한가운데 deep", "#2f8fa6"]
  ],
  mute,
  0.8
);

// ② 먼 산 / 절벽 — 멀리 있는 배경이라 더 눌러야 공기원근이 산다
show(
  "먼 산 · 절벽 (채도만)",
  [
    ["산 골짜기 low", "#3f6b39"],
    ["산 능선 high", "#7fa958"],
    ["절벽 윗단 rim", "#5f8a3f"],
    ["절벽 바위 rock", "#8a7a63"],
    ["절벽 물속 deep", "#43382f"]
  ],
  mute,
  0.7
);

// ③ accentColor — 하나씩 눌러 봐야 "19가지 제각각"은 그대로다.
//
// 이 색은 기능이 있다: 구역을 구분하고, 강조 링·경로선·라벨에 쓰인다. 그러니
// **구역마다 하나씩** 팔레트에서 배정하는 게 맞다. 19종 → 7종이 되면서
// 네온도 사라지고 "이 색은 저 구역" 이라는 규칙도 생긴다.
//
// 어느 가족을 줄지는 이미 있는 구역 리본 색(VillageScene 의 DISTRICT_SIGNS)을
// 따른다 — 현판과 강조색이 따로 놀면 구역 정체성이 두 개가 된다.
const ACCENT_L = 0.72;
const ACCENT_C = 0.13;
const DISTRICT_HUE = [
  ["projects", "리본 #8a4a2e 흙갈", 41],
  ["skills", "리본 #2f5d4a 청록", 100],
  ["experience", "리본 #4a3b6b 보라", -40],
  ["study", "리본 #2c4a6b 남색", -82],
  ["life", "리본 #6b5423 황금", 64],
  ["contact", "리본 #7a2f2f 적갈", 12],
  ["plaza", "중심 랜드마크", -125]
];
console.log("── 구역별 accentColor (팔레트에서 배정) ──────────");
for (const [district, why, deg] of DISTRICT_HUE) {
  const h = hues.reduce((best, x) =>
    Math.abs(((x.deg - deg + 540) % 360) - 180) <
    Math.abs(((best.deg - deg + 540) % 360) - 180)
      ? x
      : best
  );
  const out = oklabToHex(ACCENT_L, h.dir[0] * ACCENT_C, h.dir[1] * ACCENT_C);
  console.log(
    `   ${district.padEnd(12)} ${out}   ${Math.round(h.deg)}°   ${why}`
  );
}
console.log();

// ④ 마커 · 살아있는 장식 — UI 기능이 있어 눈에 띄어야 한다
show(
  "마커 · 발광 (색조+채도)",
  [
    ["경로 링 / 포인트라이트", "#00d4ff"],
    ["훈련 동상", "#7ed957"],
    ["학습 분수", "#00ff88"]
  ],
  snap,
  1.3
);
