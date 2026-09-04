// aClub 원페이저 히어로 — 2026 실제 화면 3장(홈 · 모집공고 · 상세)을 한 장(16/9)으로.
//
// 왜 합성인가: 히어로 칸은 16/9 한 장인데 2026 사이트는 폰 폭 앱이라 캡처가
// 전부 세로로 길다. 한 장만 넣으면 cover 가 위아래를 잘라 홈 배너만 남고,
// 예전 히어로(`aclub.webp`)는 아예 **2025 옛 사이트**(ACM 로고)였다 — 내가
// 총괄한 2026 디자인이 페이지에 한 장도 없었다.
//
// 원본은 리포 밖(바탕 화면 「정재훈의 포트폴리오 모음집/aclub」)에 있다.
// 여기 적힌 crop/blur 좌표는 그 파일들의 픽셀 기준이다.
//
// 가리는 것: 모집 상세 포스터의 전화번호. 공개 이력서에 실을 이유가 없다.
//
//   node scripts/build-aclub-screens.mjs
import sharp from "sharp";
import path from "node:path";

const SRC =
  "C:/Users/jk636/OneDrive/바탕 화면/정재훈의 포트폴리오 모음집/aclub";
const OUT = "public/projects/aclub-2026-screens.webp";

const W = 1920,
  H = 1080,
  SCREEN_H = 980,
  TOP = (H - SCREEN_H) / 2,
  RADIUS = 18,
  BG = "#eef2f8";

/** @type {{file:string; crop:[number,number,number,number]; blur?:[number,number,number,number][]}[]} */
const SCREENS = [
  // 로그인 스플래시(스크린샷 2026-03-03 193254, Fold 캡처)는 넣었다가 뺐다 —
  // 화면의 8할이 빈 여백이고 남는 건 가려 놓은 Gmail 줄뿐이라, 넉 장 중
  // 한 장이 "빈 폰" 이었다. 세 장을 더 크게 놓는 쪽이 낫다.
  // 홈 — 검색 · 배너 · 지금 모집중인 공고
  {file: "스크린샷 2026-02-26 174945.png", crop: [100, 0, 875, 1459]},
  // 모집공고 목록 — 최근 게시순 그리드
  {file: "스크린샷 2026-03-03 175907.png", crop: [240, 0, 640, 1389]},
  // 모집공고 상세 — 포스터 · 본문 · 신청하기
  {
    file: "스크린샷 2026-03-03 181229.png",
    crop: [0, 0, 561, 1448],
    blur: [[228, 860, 285, 60]] // 포스터 하단 "010-…" 전화번호
  }
];

function roundedMask(w, h) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/></svg>`
  );
}

async function prepare(s) {
  const [left, top, width, height] = s.crop;
  let img = sharp(path.join(SRC, s.file)).extract({left, top, width, height});
  if (s.blur?.length) {
    // 가릴 자리만 잘라 흐리고 제자리에 덮는다. 원본 픽셀은 남지 않는다.
    const base = await img.png().toBuffer();
    const patches = [];
    for (const [bx, by, bw, bh] of s.blur) {
      const patch = await sharp(base)
        .extract({left: bx, top: by, width: bw, height: bh})
        .blur(14)
        .png()
        .toBuffer();
      patches.push({input: patch, left: bx, top: by});
    }
    // sharp 는 composite 를 resize **뒤에** 적용한다 — 원본 좌표의 패치를
    // 줄어든 그림 위에 얹으려다 터진다. 먼저 굳히고 나서 줄인다.
    img = sharp(await sharp(base).composite(patches).png().toBuffer());
  }
  const scaledW = Math.round((width / height) * SCREEN_H);
  const buf = await img
    .resize({width: scaledW, height: SCREEN_H, fit: "fill"})
    .png()
    .toBuffer();
  const rounded = await sharp(buf)
    .composite([{input: roundedMask(scaledW, SCREEN_H), blend: "dest-in"}])
    .png()
    .toBuffer();
  return {buf: rounded, w: scaledW};
}

const shots = [];
for (const s of SCREENS) shots.push(await prepare(s));
const total = shots.reduce((a, s) => a + s.w, 0);
const gap = Math.floor((W - total) / (shots.length + 1));
if (gap < 24) throw new Error(`화면이 너무 넓다: 합 ${total}px, 간격 ${gap}px`);

let x = gap;
const comps = [];
for (const s of shots) {
  comps.push({input: s.buf, left: x, top: TOP});
  x += s.w + gap;
}

await sharp({create: {width: W, height: H, channels: 3, background: BG}})
  .composite(comps)
  .webp({quality: 88})
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(
  `${OUT} ${meta.width}x${meta.height} · 화면 폭 ${shots
    .map(s => s.w)
    .join("/")} · 간격 ${gap}`
);
