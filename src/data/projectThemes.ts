// 프로젝트별 카테고리와 테마 토큰.
// category가 전용 레이아웃과 연출을 결정하고, 색상 토큰이 화면의 개성을 만든다.

export type ProjectCategory = "dashboard" | "realtime" | "platform" | "game";
export type GameMood = "horror" | "arcade" | "platformer";

export interface ProjectTheme {
  category: ProjectCategory;
  /** game 카테고리 안의 분위기 */
  mood?: GameMood;
  primary: string;
  secondary: string;
  /** 베이스 배경색 */
  bg: string;
  /** 강조색 */
  accent: string;
}

export const projectThemes: Record<string, ProjectTheme> = {
  // 대시보드형 프로젝트
  mywave: {
    category: "dashboard",
    primary: "#34d399",
    secondary: "#10b981",
    bg: "#04110c",
    accent: "#6ee7b7",
  },
  mystock: {
    category: "dashboard",
    primary: "#38bdf8",
    secondary: "#0ea5e9",
    bg: "#040d18",
    accent: "#7dd3fc",
  },

  // 실시간 서비스형 프로젝트
  festflow: {
    category: "realtime",
    primary: "#fbbf24",
    secondary: "#f59e0b",
    bg: "#140f04",
    accent: "#fcd34d",
  },
  muscleup: {
    category: "realtime",
    primary: "#f472b6",
    secondary: "#ec4899",
    bg: "#140510",
    accent: "#f9a8d4",
  },

  // 플랫폼/공공 서비스형 프로젝트
  aclub: {
    category: "platform",
    primary: "#c084fc",
    secondary: "#a855f7",
    bg: "#0d0816",
    accent: "#d8b4fe",
  },
  ajouchong: {
    category: "platform",
    primary: "#fb7185",
    secondary: "#f43f5e",
    bg: "#160709",
    accent: "#fda4af",
  },
  "sign-language": {
    category: "platform",
    primary: "#7eb8ff",
    secondary: "#60a5fa",
    bg: "#060d18",
    accent: "#bfdbfe",
  },

  // 게임형 프로젝트
  darklab: {
    category: "game",
    mood: "horror",
    primary: "#ef4444",
    secondary: "#991b1b",
    bg: "#070405",
    accent: "#ff5a4d",
  },
  "ajou-adventure": {
    category: "game",
    mood: "arcade",
    primary: "#a3e635",
    secondary: "#84cc16",
    bg: "#0a0f04",
    accent: "#bef264",
  },
  tserof: {
    category: "game",
    mood: "platformer",
    primary: "#34d399",
    secondary: "#059669",
    bg: "#04120d",
    accent: "#6ee7b7",
  },
};

export const DEFAULT_THEME: ProjectTheme = {
  category: "dashboard",
  primary: "#7ed9ff",
  secondary: "#38bdf8",
  bg: "#040608",
  accent: "#7ed9ff",
};

export function getProjectTheme(id: string): ProjectTheme {
  return projectThemes[id] ?? DEFAULT_THEME;
}
