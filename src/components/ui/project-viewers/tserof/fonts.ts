import {JetBrains_Mono} from "next/font/google";

// TSEROF 룸 전용 서체. 이 방은 C# 코드와 프레임 수치가 화면의 절반이라
// 모노가 본문만큼 중요하다.
export const tsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--ts-font-mono"
});
