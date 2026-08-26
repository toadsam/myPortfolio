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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
