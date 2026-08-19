/**
 * 갓생 섬 레이아웃.
 *
 * 마을(`/`)은 손님에게 보여주려고 OG 이미지까지 붙여 둔 곳이지만, 여기는 정반대다.
 * **검색에 잡히면 안 된다** — noindex 를 걸고, `public/robots.txt` 에도
 * `Disallow: /island` 를 넣어 두 겹으로 막는다(robots.txt 는 권고일 뿐이라
 * 메타 태그가 실제 방어선이다).
 *
 * 진짜 방어선은 백엔드의 `require_island` 가드다. 여기 있는 건 "굳이 크롤러가
 * 긁어갈 이유를 만들지 않는다" 정도의 위생 조치다.
 */

import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "갓생 섬",
  robots: {index: false, follow: false, nocache: true},
  openGraph: undefined,
  twitter: undefined
};

export default function IslandLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}
