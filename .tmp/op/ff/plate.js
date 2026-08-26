const sharp = require("sharp");
const D = __dirname + "/";
const OUT = D + "out/";

// 마을 팔레트 (globals.css :root)
const NIGHT = "#0b1626",
  GOLD = "#e2c078",
  MOON = "#a9bdd6",
  PAPER = "#f3e6c8";
const MONO = "Consolas, 'Courier New', monospace";
const KR = "'Malgun Gothic', sans-serif";
const buf = s => Buffer.from(s);

// 모든 폰 캡처를 같은 비율(390:844 = 0.462)로 맞춘다. 위에서부터 자른다.
async function normalize(file) {
  const m = await sharp(D + file).metadata();
  const want = Math.round(m.width / 0.4621);
  const h = Math.min(want, m.height);
  return sharp(D + file).extract({left: 0, top: 0, width: m.width, height: h});
}

/** 폰 캡처를 지정 폭으로 줄이고 모서리를 깎아 버퍼로 준다. */
async function phone(file, w) {
  const base = (await normalize(file)).resize({width: w});
  const {info} = await base.clone().toBuffer({resolveWithObject: true});
  const r = Math.round(w * 0.055);
  const mask = buf(
    `<svg width="${info.width}" height="${info.height}"><rect width="${info.width}" height="${info.height}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  );
  return {
    buf: await base
      .composite([{input: mask, blend: "dest-in"}])
      .png()
      .toBuffer(),
    w: info.width,
    h: info.height
  };
}

// ─────────────────── HERO 16:9 — 같은 지도, 다른 역할 ───────────────────
// 왼쪽은 방문객이 보는 OSM 부스 지도, 오른쪽은 운영진이 보는 무대 혼잡 관제.
// 한 앱이라는 건 프론트 CSS 의 data-route-scope="public|ops" 가 가른다.
async function hero() {
  // 정사각이다. 이 그림이 앉는 자리는 12칸 중 5칸(약 480px)이라
  // 16:9 로 만들면 폰이 96px 폭으로 쪼그라들고 오른쪽 칸 아래가 비어 버린다.
  const W = 1240,
    H = 1240,
    PH = 1000;
  const pw = Math.round(PH * 0.4621);
  const L = await phone("c-final.png", pw);
  const R = await phone("ops-map.png", pw);
  const lx = 320 - Math.round(pw / 2),
    rx = 920 - Math.round(pw / 2),
    py = 152;

  const bg = buf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${NIGHT}"/>
    <line x1="620" y1="120" x2="620" y2="1160" stroke="${GOLD}" stroke-opacity="0.24" stroke-width="1"/>
    <text x="320" y="104" text-anchor="middle" font-family="${MONO}" font-size="30"
      letter-spacing="7" fill="${MOON}" fill-opacity="0.7">PUBLIC</text>
    <text x="920" y="104" text-anchor="middle" font-family="${MONO}" font-size="30"
      letter-spacing="7" fill="${GOLD}" fill-opacity="0.92">OPS</text>
    <text x="320" y="1214" text-anchor="middle" font-family="${KR}" font-size="34"
      fill="${PAPER}" fill-opacity="0.85">방문객 — 부스 지도</text>
    <text x="920" y="1214" text-anchor="middle" font-family="${KR}" font-size="34"
      fill="${PAPER}" fill-opacity="0.85">운영진 — 무대 혼잡 관제</text>
  </svg>`);
  const fr = buf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="${lx}" y="${py}" width="${pw}" height="${L.h}" rx="18" fill="none"
      stroke="${MOON}" stroke-opacity="0.30" stroke-width="2"/>
    <rect x="${rx}" y="${py}" width="${pw}" height="${R.h}" rx="18" fill="none"
      stroke="${GOLD}" stroke-opacity="0.34" stroke-width="2"/>
  </svg>`);
  await sharp(bg)
    .composite([
      {input: L.buf, left: lx, top: py},
      {input: R.buf, left: rx, top: py},
      {input: fr, left: 0, top: 0}
    ])
    .webp({quality: 88})
    .toFile(OUT + "festflow-two-faces.webp");
  console.log("hero");
}

// ───────── 21:9 결과 띠 — 기능 4종 (이 페이지에서 가장 넓은 자리) ─────────
async function strip() {
  const W = 2100,
    H = 900,
    PH = 700;
  const pw = Math.round(PH * 0.4621);
  const items = [
    ["pub-booths.png", "부스 목록 · 거리 · 대기", MOON],
    ["c-events.png", "공연 일정 · 진행 상태", MOON],
    ["c-more.png", "AI 허브 · 챗봇 · 예측", MOON],
    ["ops-insight.png", "관제 · 데이터 분석", GOLD]
  ];
  const gap = Math.round((W - 300 - 4 * pw) / 3);
  const parts = [],
    over = [];
  for (let i = 0; i < 4; i++) {
    const x = 150 + i * (pw + gap),
      y = 88;
    const p = await phone(items[i][0], pw);
    parts.push({input: p.buf, left: x, top: y});
    over.push(
      `<rect x="${x}" y="${y}" width="${pw}" height="${p.h}" rx="18" fill="none" stroke="${items[i][2]}" stroke-opacity="0.30" stroke-width="2"/>`
    );
    over.push(
      `<text x="${x + pw / 2}" y="${y + PH + 56}" text-anchor="middle" font-family="${KR}" font-size="29" fill="${PAPER}" fill-opacity="0.8">${items[i][1]}</text>`
    );
  }
  await sharp(
    buf(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${NIGHT}"/></svg>`
    )
  )
    .composite([
      ...parts,
      {
        input: buf(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${over.join("")}</svg>`
        ),
        left: 0,
        top: 0
      }
    ])
    .webp({quality: 88})
    .toFile(OUT + "festflow-screens.webp");
  console.log("strip");
}

// ───────── 갤러리 4:5 — 관리자 콘솔 (가로 캡처를 종이처럼 앉힌다) ─────────
// 이 화면이 SSE 팬아웃의 출발점이다 — 여기서 공지를 발행하면 방문객 화면이 갱신된다.
async function adminPlate() {
  const W = 1000,
    H = 1250,
    CW = 940;
  const crop = await sharp(D + "a-admin-headless.png")
    .extract({left: 150, top: 108, width: 980, height: 612})
    .resize({width: CW})
    .png()
    .toBuffer();
  const ch = Math.round((CW * 612) / 980);
  const y = Math.round((H - ch) / 2);
  const mask = buf(
    `<svg width="${CW}" height="${ch}"><rect width="${CW}" height="${ch}" rx="16" ry="16" fill="#fff"/></svg>`
  );
  const card = await sharp(crop)
    .composite([{input: mask, blend: "dest-in"}])
    .png()
    .toBuffer();
  await sharp(
    buf(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${NIGHT}"/></svg>`
    )
  )
    .composite([
      {input: card, left: 30, top: y},
      {
        input: buf(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="30" y="${y}" width="${CW}" height="${ch}" rx="16" fill="none" stroke="${GOLD}" stroke-opacity="0.30" stroke-width="3"/><text x="500" y="${y - 46}" text-anchor="middle" font-family="${MONO}" font-size="27" letter-spacing="3" fill="${GOLD}" fill-opacity="0.8">ADMIN CONSOLE</text><text x="500" y="${y + ch + 66}" text-anchor="middle" font-family="${KR}" font-size="30" fill="${PAPER}" fill-opacity="0.8">여기서 발행한 공지가 SSE 로 나간다</text><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="10" fill="none" stroke="${MOON}" stroke-opacity="0.12" stroke-width="2"/></svg>`
        ),
        left: 0,
        top: 0
      }
    ])
    .webp({quality: 90})
    .toFile(OUT + "festflow-g-admin.webp");
  console.log("admin plate");
}

// ───────── 갤러리 4:5 — 폰 한 대씩 ─────────
async function gallery() {
  const W = 1000,
    H = 1250,
    PH = 1096;
  const items = [
    ["ops-chat.png", "festflow-g-chat.webp", GOLD],
    ["ops-lost.png", "festflow-g-lost.webp", GOLD]
  ];
  for (const [src, out, stroke] of items) {
    const pw = Math.round(PH * 0.4621);
    const p = await phone(src, pw);
    const x = Math.round((W - pw) / 2),
      y = Math.round((H - p.h) / 2);
    await sharp(
      buf(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${NIGHT}"/></svg>`
      )
    )
      .composite([
        {input: p.buf, left: x, top: y},
        {
          input: buf(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${x}" y="${y}" width="${pw}" height="${p.h}" rx="26" fill="none" stroke="${stroke}" stroke-opacity="0.30" stroke-width="3"/></svg>`
          ),
          left: 0,
          top: 0
        }
      ])
      .webp({quality: 88})
      .toFile(OUT + out);
    console.log("gallery", out);
  }
}

// ───────── 갤러리 4:5 — 모델 실험 근거 (matplotlib 원본 2장) ─────────
// 흰 배경 도표라 종이 카드처럼 올려 둔다. 숫자는 캡션이 글로 말한다.
async function mlPlate() {
  const W = 1000,
    H = 1250,
    CW = 880;
  const figs = [
    "ml-model_performance_comparison.png",
    "ml-feature_importance_random_forest.png"
  ];
  const parts = [],
    over = [];
  let y = 96;
  for (const f of figs) {
    const m = await sharp(D + f).metadata();
    const h = Math.round((CW * m.height) / m.width);
    const card = await sharp(D + f)
      .resize({width: CW})
      .flatten({background: "#ffffff"})
      .png()
      .toBuffer();
    const mask = buf(
      `<svg width="${CW}" height="${h}"><rect width="${CW}" height="${h}" rx="14" ry="14" fill="#fff"/></svg>`
    );
    parts.push({
      input: await sharp(card)
        .composite([{input: mask, blend: "dest-in"}])
        .png()
        .toBuffer(),
      left: 60,
      top: y
    });
    over.push(
      `<rect x="60" y="${y}" width="${CW}" height="${h}" rx="14" fill="none" stroke="${GOLD}" stroke-opacity="0.28" stroke-width="2"/>`
    );
    y += h + 44;
  }
  over.push(
    `<text x="500" y="66" text-anchor="middle" font-family="${MONO}" font-size="27" letter-spacing="3" fill="${GOLD}" fill-opacity="0.85">exports/ml/figures</text>`
  );
  await sharp(
    buf(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${NIGHT}"/></svg>`
    )
  )
    .composite([
      ...parts,
      {
        input: buf(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${over.join("")}</svg>`
        ),
        left: 0,
        top: 0
      }
    ])
    .webp({quality: 90})
    .toFile(OUT + "festflow-g-ml.webp");
  console.log("ml stack bottom =", y);
}

(async () => {
  await hero();
  await strip();
  await gallery();
  await adminPlate();
})();
