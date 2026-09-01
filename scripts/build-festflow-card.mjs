// FestFlow 목록 카드 그림(2.08:1) 합성.
//
// 왜 스크립트로 두는가: 이 그림은 **현장 캡처 두 장을 잘라 재배치한 결과**라서,
// 원본이 바뀌면 같은 규칙으로 다시 뽑아야 한다. 손으로 만든 합성본이면 다음
// 사람이 어디를 왜 잘랐는지 알 수 없다.
//
// 재료 (둘 다 전용 전시실 P11Field 가 이미 쓰던 파일 — 새로 공개되는 정보 없음):
//   field-admin.webp  관리자 화면. 계정명·전화번호 패널은 이미 잘려 있고 통계 구역만 남았다.
//   field-user.webp   참가자 화면. 얼굴은 복원 불가능하게 뭉갠 상태다.
//
// 배치를 한 번 갈아엎었다. 처음엔 관리자 스트립을 통째로 왼쪽에 눕혔는데,
// 원본이 4.5:1 이라 카드 폭에 맞추면 **0.7배로 줄어** 숫자가 안 읽혔고 아래쪽
// 300px 이 비었다. 목록 카드는 실제로 500px 안팎으로 그려지므로, 그 크기에서
// 424 와 36 이 읽히지 않으면 이 그림은 아무 말도 못 한다. 그래서 KPI 카드 4장을
// 각각 떼어 2×2 로 다시 깔았다 — 같은 폭에서 1.4배가 되고 여백도 사라진다.
//
// 실행: node scripts/build-festflow-card.mjs

import sharp from "sharp";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => path.join(root, ...a);

const W = 1200;
const H = 577; // 2.08:1 — 카드 그림 상자 비율. cover 로 잘리지 않게 정확히 맞춘다.
const PAD = 28;
const GAP = 20;

const ADMIN = p("public/projects/festflow/field-admin.webp");
const USER = p("public/projects/festflow/field-user.webp");

// KPI 카드 4장의 좌표. 눈대중이 아니라 원본 픽셀에서 찾은 값이다.
// 활성 프로필 115(전체 169명) · 전체 신청 424 · 대기중 144 · 성사된 매치 36
//
// 판정 기준을 한 번 틀렸다. 처음엔 "흰 픽셀 비율이 높은 구간"으로 잡았는데,
// 큰 숫자 글자가 그 비율을 끌어내려 **글자 왼쪽 끝을 카드 왼쪽 끝으로** 착각해
// 각 카드의 앞부분("활성", "11", "전체")이 잘려 나갔다. 배경도 거의 흰색이라
// (248,252,255) 밝기로는 안 갈린다 — 카드 안만 **순백(255,255,255)** 이고
// 배경은 푸른기가 남는다는 점으로 갈라야 맞는다.
const CARD_Y = 152;
const CARD_H = 151;
const CARD_X = [37, 300, 560, 820];
const CARD_W = 247;

// 폰: 상단 "실제 사용자 화면" 머리글을 잘라내고 기기만 쓴다.
const PHONE_H = H - PAD * 2;
const PHONE_W = Math.round((465 * PHONE_H) / 720);
const phone = await sharp(USER)
  .extract({left: 0, top: 78, width: 465, height: 720})
  .resize({height: PHONE_H})
  .toBuffer();

// 왼쪽 2×2 격자. 높이가 먼저 차므로 행 높이부터 정하고 폭을 따라 맞춘다.
const GRID_TOP = 76;
const ROW_H = Math.floor((H - GRID_TOP - PAD - GAP) / 2);
const COL_W = Math.round((ROW_H * CARD_W) / CARD_H);
const GRID_W = COL_W * 2 + GAP;
const GRID_X = PAD + Math.round((W - PAD * 3 - PHONE_W - GRID_W) / 2);

const tiles = await Promise.all(
  CARD_X.map(left =>
    sharp(ADMIN)
      .extract({left, top: CARD_Y, width: CARD_W, height: CARD_H})
      .resize({width: COL_W, height: ROW_H})
      .toBuffer()
  )
);

// 배경 + 머리글. 카드 부제가 "아주대 대동제…" 로 시작하므로 그림도 같은 말을
// 해야 한다 — 3초 스캔에서는 글보다 그림이 먼저 눈에 들어온다.
const bg =
  Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#eef3ff"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="${PAD + 6}" cy="45" r="5" fill="#2563eb"/>
  <text x="${PAD + 22}" y="52" font-family="Malgun Gothic, Segoe UI, sans-serif"
        font-size="25" font-weight="700" fill="#2563eb"
        letter-spacing="-0.4">아주대 대동제 2026.05 · AI Match 1일 현장 운영</text>
</svg>`);

await sharp(bg)
  .composite([
    ...tiles.map((input, i) => ({
      input,
      left: GRID_X + (i % 2) * (COL_W + GAP),
      top: GRID_TOP + Math.floor(i / 2) * (ROW_H + GAP)
    })),
    {input: phone, left: W - PAD - PHONE_W, top: PAD}
  ])
  .webp({quality: 90})
  .toFile(p("public/projects/festflow-field.webp"));

console.log(
  `festflow-field.webp  ${W}x${H}  (KPI ${COL_W}x${ROW_H} ×4 = ${(
    COL_W / CARD_W
  ).toFixed(2)}배, phone ${PHONE_W}x${PHONE_H})`
);
