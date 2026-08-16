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
    images: [
      {
        url: "/android-chrome-384x384.png",
        width: 384,
        height: 384,
        alt: "Developer's City"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/android-chrome-384x384.png"]
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
