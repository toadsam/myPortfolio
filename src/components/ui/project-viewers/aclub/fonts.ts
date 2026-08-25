import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// ACLUB 룸 전용 서체. 디자인 원안은 Pretendard지만 CDN 의존을 피하려
// 같은 계열의 한글 산세리프(Noto Sans KR)로 대체하고 CSS 변수로만 노출한다.
export const aClubSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--ac-font-sans"
});

export const aClubMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--ac-font-mono"
});
