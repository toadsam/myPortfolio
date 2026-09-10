import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 프로젝트 상세(원페이지) 강조색 = 마을 간판금. 색상 토큰으로 등록해야
        // bg-accent/5 · hover:border-accent 같은 수식어가 생성된다.
        // 2026-08-25 에 형광 시안(#00f5ff)에서 바꿨다 — 이 토큰을 쓰는 곳은
        // ProjectDetail.css 와 ProjectOnePager.tsx 둘뿐이라 파급이 없다.
        accent: "#e2c078",
        village: {
          ink: "#1f2a24",
          moss: "#4f8f5b",
          leaf: "#8fcf68",
          mint: "#d9f7c6",
          cream: "#fff7df",
          sand: "#d9bd82",
          clay: "#b6794d",
          sky: "#cfeee1"
        }
      },
      boxShadow: {
        panel: "0 24px 80px rgba(31, 42, 36, 0.2)",
        glow: "0 0 40px rgba(143, 207, 104, 0.35)"
      },
      fontFamily: {
        // --font-inter 는 이 저장소 어디에서도 정의되지 않는다(Inter 를 next/font
        // 로 싣는 곳이 없다). 정의되지 않은 var 는 통째로 무시되므로 font-sans 는
        // 사실상 system-ui 로 떨어진다 — 그 자체는 기존 동작이라 건드리지 않되,
        // 한글이 OS 기본 폰트로 빠지던 것만 막는다. 라틴보다 뒤에 둬야
        // 영문·숫자는 그대로 두고 한글만 Noto Sans KR 이 가져간다.
        sans: [
          "var(--font-inter)",
          "var(--font-body-kr)",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
