// aClub 원페이저 — 2026 출시 저녁의 기록 두 장.
//
// 「2026 프로젝트장」이라는 말의 근거가 페이지에 없었다. 트러블슈팅 카드는
// 전부 2025 팀원 시절(훅·보호 라우트·재방문 판단)이고, 총괄로서 한 일 —
// 회장 전원 섭외 · 저녁 6시 에타 업로드 · 문의 응대 — 는 글로만 있었다.
// 그 저녁이 찍힌 캡처 둘을 갤러리 카드로 만든다.
//
//   1) aclub-launch-post.webp  — 에브리타임 게시글 (03/03 18:44). 실시간 인기 글
//      2위, 인앱 브라우저 안내문까지. 게시판 오른쪽 열(교수 실명이 있는
//      강의평)은 잘라 낸다.
//   2) aclub-launch-replies.webp — 그날 저녁 회장들의 답장 목록 두 화면.
//      「○○ 회장님2026」은 직함이라 두고, 개인 실명 행은 잘라 내며, 프로필
//      사진 열은 흐린다.
//
// 원본은 리포 밖(바탕 화면 「정재훈의 포트폴리오 모음집/aclub」).
//
//   node scripts/build-aclub-launch.mjs
import sharp from "sharp";
import path from "node:path";

const SRC =
  "C:/Users/jk636/OneDrive/바탕 화면/정재훈의 포트폴리오 모음집/aclub";

async function crop(file, [left, top, width, height]) {
  return sharp(path.join(SRC, file))
    .extract({left, top, width, height})
    .png()
    .toBuffer();
}

/** 지정 영역만 흐려서 제자리에 덮는다. 원본 픽셀은 남지 않는다. */
async function blurRegions(buf, regions) {
  const patches = [];
  for (const [left, top, width, height] of regions) {
    patches.push({
      input: await sharp(buf)
        .extract({left, top, width, height})
        .blur(16)
        .png()
        .toBuffer(),
      left,
      top
    });
  }
  return sharp(buf).composite(patches).png().toBuffer();
}

// ── 1) 에타 게시글 ────────────────────────────────────────────────────────
{
  const out = "public/projects/op/aclub-launch-post.webp";
  // 제목(18:44)부터 인앱 브라우저 안내문까지. 위쪽 게시판 머리글과 아래
  // 「스크랩 한 번」 독려 문구는 뺀다 — 근거는 시각·본문·안내문이다.
  const post = await crop(
    "스크린샷 2026-03-03 205255.png",
    [122, 150, 1040, 950]
  );
  await sharp(post).webp({quality: 88}).toFile(out);
  const m = await sharp(out).metadata();
  console.log(out, m.width, m.height);
}

// ── 2) 회장들의 답장 ──────────────────────────────────────────────────────
{
  const out = "public/projects/op/aclub-launch-replies.webp";
  // 왼쪽 화면: 첫 행(개인 실명)을 잘라 내고 리치마작 → 볼랜드 4행.
  let left = await crop("스크린샷 2026-03-03 205010.png", [0, 140, 616, 550]);
  left = await blurRegions(left, [[20, 0, 100, 550]]); // 프로필 사진 열
  // 오른쪽 화면: 클리어 → 샘터야학 4행. 아래 두 행(개인 실명)은 잘라 낸다.
  let right = await crop("스크린샷 2026-03-03 205032.png", [0, 20, 628, 570]);
  right = await blurRegions(right, [[30, 0, 100, 570]]);

  const H = 570,
    GAP = 28;
  const leftW = Math.round((616 / 550) * H);
  const leftBuf = await sharp(left)
    .resize({width: leftW, height: H, fit: "fill"})
    .png()
    .toBuffer();
  const W = GAP + leftW + GAP + 628 + GAP;
  await sharp({
    create: {width: W, height: H + GAP * 2, channels: 3, background: "#ffffff"}
  })
    .composite([
      {input: leftBuf, left: GAP, top: GAP},
      {input: right, left: GAP + leftW + GAP, top: GAP},
      // 두 화면 사이 얇은 구분선
      {
        input: Buffer.from(
          `<svg width="2" height="${H}"><rect width="2" height="${H}" fill="#e5e7eb"/></svg>`
        ),
        left: GAP + leftW + Math.round(GAP / 2),
        top: GAP
      }
    ])
    .webp({quality: 88})
    .toFile(out);
  const m = await sharp(out).metadata();
  console.log(out, m.width, m.height);
}
