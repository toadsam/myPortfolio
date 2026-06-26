import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
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
