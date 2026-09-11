import {JetBrains_Mono} from "next/font/google";

// DarkLab 룸 전용 서체. 앱 전역 서체(Inter)를 건드리지 않도록
// CSS 변수로만 노출하고 .dl-root 안에서만 참조한다.
export const darkLabMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--dl-font-mono"
});
