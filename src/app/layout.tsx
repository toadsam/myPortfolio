import type {Metadata, Viewport} from "next";
import {Providers} from "@/components/Providers";
import {CustomCursor} from "@/components/ui/CustomCursor";
import "./globals.css";

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
  themeColor: "#050d1a"
};

export default function RootLayout({
  children
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
