import type {Metadata, Viewport} from "next";
import {Gowun_Batang} from "next/font/google";
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

const title = "정재훈 | Developer's City — 3D 인터랙티브 포트폴리오";
const description =
  "건물을 클릭하고 AI NPC와 대화하며 둘러보는 3D 포트폴리오 마을. Next.js · React Three Fiber · Framer Motion으로 만든 풀스택/3D/게임/XR 작업 모음.";

export const metadata: Metadata = {
  metadataBase: new URL("https://toadsam.github.io/myPortfolio/"),
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
  authors: [{name: "정재훈 (Jaehoon Jung)"}],
  icons: {
    icon: "/favicon.svg",
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
    <html lang="ko" className={gowunBatang.variable}>
      <body>
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
