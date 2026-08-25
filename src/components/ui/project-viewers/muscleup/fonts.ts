import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// 득근득근 룸 전용 서체. 이 방은 스탯·수치·코드가 화면의 절반이라
// 모노가 본문만큼 중요하다.
export const muSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--mu-font-sans"
});

export const muMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--mu-font-mono"
});
