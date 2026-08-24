import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// TSEROF 룸 전용 서체. 이 방은 C# 코드와 프레임 수치가 화면의 절반이라
// 모노가 본문만큼 중요하다.
export const tsSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--ts-font-sans"
});

export const tsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--ts-font-mono"
});
