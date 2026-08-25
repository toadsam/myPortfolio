import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// FestFlow 룸 전용 서체. 관제 화면이라 수치와 상태 라벨이 화면의 절반이다.
export const ffSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--ff-font-sans"
});

export const ffMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--ff-font-mono"
});
