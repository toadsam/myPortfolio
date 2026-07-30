import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// DarkLab 룸 전용 서체. 앱 전역 서체(Inter)를 건드리지 않도록
// CSS 변수로만 노출하고 .dl-root 안에서만 참조한다.
export const darkLabSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--dl-font-sans",
});

export const darkLabMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--dl-font-mono",
});
