/**
 * 관리자 레이아웃. 하는 일은 둘이다.
 *
 * 1. **설치형 앱(PWA) 선언** — `/admin` 에서만 `public/admin.webmanifest` 를 건다.
 *    루트 layout 에 걸면 착륙장을 연 손님에게도 "앱 설치" 버튼이 뜨는데, 이건 본인
 *    전용 도구라 여기서만 띄운다. 서비스 워커는 없다 — 저장은 어차피 백엔드로 가야
 *    해서 오프라인 셸만 있어도 할 수 있는 게 없다. 크롬은 manifest 와 아이콘만으로
 *    바탕화면·홈 화면 설치를 허용한다.
 * 2. **검색 차단** — 갓생 섬과 같은 이유로 noindex. 진짜 방어선은 금고 문(토큰)이다.
 *
 * `apple-touch-icon` 은 루트 layout 의 icons 에 이미 있어 iOS 홈 화면도 같은 마크를 쓴다.
 */

import type {Metadata, Viewport} from "next";

export const metadata: Metadata = {
  title: "관리자 · Developer's City",
  manifest: "/admin.webmanifest",
  robots: {index: false, follow: false, nocache: true},
  appleWebApp: {
    capable: true,
    title: "배전반",
    statusBarStyle: "black-translucent"
  },
  openGraph: undefined,
  twitter: undefined
};

export const viewport: Viewport = {
  themeColor: "#12161c",
  // 설치형으로 열면 상태 표시줄 뒤까지 화면이 오므로, 계기판·탭 바의
  // env(safe-area-inset-*) 여백이 실제로 쓰인다.
  viewportFit: "cover"
};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}
