import type {Metadata, Viewport} from "next";
import {
  Gowun_Batang,
  Inter,
  Noto_Sans_KR,
  Noto_Serif_KR
} from "next/font/google";
import {Providers} from "@/components/Providers";
import {CustomCursor} from "@/components/ui/CustomCursor";
import "./globals.css";

// 마을 UI 디스플레이 서체 — 간판·패널 제목 전용. 본문은 기존 산세리프 유지.
//
// preload 를 끄는 이유: 한글 구글 폰트는 유니코드 구간별로 95조각으로 쪼개져
// 배포된다(굵기 2개 → 190파일). subsets 에 "latin" 을 적어도 Next 는 한글
// 조각을 이름으로 가려내지 못해 94개를 전부 미리 받았다 — 랜딩 페이지는
// 그중 8개만 쓴다(실측 1,562KB 중 ~130KB). preload 를 끄면 브라우저가
// 화면에 실제로 나온 글자에 맞는 조각만 받아간다.
// 대가는 간판이 잠시 대체 명조로 보이는 것(display:"swap" + 메트릭 보정 폴백).
const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false
});

// 이력서 히어로의 **이름 한 곳에만** 쓰는 무거운 명조.
//
// 고운바탕은 700 이 최대라, 이름을 132px 로 키워도 획이 가늘어 밤 배경에 묻혔다.
// 계열을 고딕으로 바꾸는 선택지도 있었지만 랜딩·마을·공방·프로젝트 상세가 전부
// 고운바탕이라(globals.css · TicketLanding.css · ProjectDetail.css ·
// AtelierInterior · admin.css) 이력서만 바꾸면 다른 사이트처럼 보이고, 전면
// 교체는 밤·숲·등불 세계관을 통째로 갈아엎는 일이 된다. 그래서 **같은 명조
// 안에서 무게만** 올린다. preload 를 끄는 이유는 위 고운바탕과 같다.
// 글자 세 자에만 쓰므로 실제로 받아 가는 조각은 한둘이다.
// 본문 한글.
//
// 이력서 본문 스택이 `Inter, ui-sans-serif, system-ui, …` 였는데 **Inter 에는 한글
// 글리프가 없다.** 그래서 한글이 전부 시스템 폴백으로 빠졌다 — Windows 면 맑은
// 고딕, Mac 이면 애플 SD 산돌고딕. 심사자 기기마다 다르게 보이고, 이 페이지 글자의
// 64%가 12px 이하라 그 크기의 맑은 고딕 한글은 획이 뭉개진다. 한글만 이 서체로
// 받게 스택에 끼워 넣는다(라틴은 그대로 Inter 가 가져간다).
// 굵기를 나열하지 않는 이유: Noto Sans KR 은 가변 폰트라 100~900 축이 서브셋
// 하나에 다 들어 있다. 굵기를 적으면 그 수만큼 서브셋이 복제되는데(400·700 이면
// 124조각 × 2 = 248개 @font-face), 가변으로 받으면 124개로 끝나면서 오히려
// 쓸 수 있는 굵기는 늘어난다. 사이트가 font-black(900) 을 198곳에서 쓰는데
// 400·700 만 실려 있어서 한글 900 이 전부 합성 볼드로 그려지던 것도 같이 풀린다.
//
// 프로젝트 뷰어 8개 방도 각자 Noto Sans KR 을 따로 부르고 있었다(방마다
// 400·500·700·900 → @font-face 497개, CSS 304KB). 이제 전부 이 인스턴스를
// --font-body-kr 로 공유한다. 500 은 어느 방에서도 쓰이지 않았다.
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body-kr",
  display: "swap",
  preload: false
});

const notoSerifKr = Noto_Serif_KR({
  weight: ["900"],
  subsets: ["latin"],
  variable: "--font-display-heavy",
  display: "swap",
  preload: false
});

// 본문 라틴 — 사이트 전역 산세리프. globals.css 의 body 스택과 tailwind 의
// font-sans 가 이 서체를 이름으로 부르고 있었는데 정작 싣는 곳이 없어서,
// 영문·숫자가 전부 system-ui(윈도우 Segoe UI · 맥 SF)로 떨어지고 있었다.
//
// 위 한글 서체들과 달리 preload 를 켜 둔다: 라틴 서브셋은 조각이 몇 개뿐이라
// 한글에서 문제가 됐던 "안 쓰는 94조각까지 선반입" 이 일어나지 않고, 첫 화면
// 본문이 이 서체로 그려지므로 미리 받는 편이 낫다.
//
// weight 를 적지 않는 이유는 가변 폰트라서다 — 100~900 축이 파일 하나에 들어
// 있어 굵기를 나열하는 것보다 작고, 어떤 font-weight 값을 써도 그려진다.
//
// 주의: next/font 는 실제 family 이름을 해시로 만든다(__Inter_xxxx). 스택에
// 그냥 `Inter` 라고 적으면 이 폰트가 아니라 "방문자 PC 에 설치된 Inter" 를
// 찾으므로, 반드시 var(--font-inter) 로 참조해야 한다.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const title = "정재훈 | Developer's City — 3D 인터랙티브 포트폴리오";
const description =
  "건물을 클릭하고 AI NPC와 대화하며 둘러보는 3D 포트폴리오 마을. Next.js · React Three Fiber · Framer Motion으로 만든 풀스택/3D/게임/XR 작업 모음.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jaehun.co.kr/"),
  title,
  description,
  keywords: [
    "정재훈",
    "포트폴리오",
    "프론트엔드",
    "풀스택",
    "React",
    "Three.js",
    "3D",
    "WebGL",
    "게임"
  ],
  authors: [{name: "정재훈 (Jeong Jaehun)"}],
  // 2026-09-06 — 파비콘을 JH 마크(본인 생성 이미지)로 교체. svg 는 그 png 를 품은
  // 래퍼이고, 브라우저가 svg 를 못 쓰면 png/ico 로 떨어진다.
  icons: {
    icon: [
      {url: "/favicon.svg", type: "image/svg+xml"},
      {url: "/favicon-32x32.png", sizes: "32x32", type: "image/png"},
      {url: "/favicon-16x16.png", sizes: "16x16", type: "image/png"}
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title,
    description,
    siteName: "Developer's City",
    locale: "ko_KR",
    type: "website",
    // 링크 미리보기의 첫인상 — 앱 아이콘(384px 정사각)이 아니라 밤 마을 대표
    // 컷을 OG 규격(1200×630)으로 보여 준다. 마을이 크게 바뀌면 다시 찍어서
    // public/og-image.jpg 만 교체하면 된다.
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Developer's City — 밤의 포트폴리오 마을"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#0b1626"
};

export default function RootLayout({
  children
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="ko"
      className={`${gowunBatang.variable} ${notoSerifKr.variable} ${notoSansKr.variable} ${inter.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
