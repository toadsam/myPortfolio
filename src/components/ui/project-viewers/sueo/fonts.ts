import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// 수어지교 룸 전용 서체. 앱 전역 서체(Inter)를 건드리지 않도록
// CSS 변수로만 노출하고 .sd-root 안에서만 참조한다.
// 원안은 Pretendard지만 Google Fonts에 없어 같은 계열의 Noto Sans KR로 대체한다.
export const sueoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--sd-font-sans"
});

export const sueoMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--sd-font-mono"
});
