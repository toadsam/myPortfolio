import {JetBrains_Mono, Noto_Sans_KR} from "next/font/google";

// 아주총 룸 전용 서체. 공지·게시판이 소재라 본문은 또렷한 한글 산세리프,
// 설정 파일·터미널·URL 은 전부 모노로 간다(이 방의 주인공이 nginx.conf 라서).
export const ajSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--aj-font-sans"
});

export const ajMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--aj-font-mono"
});
