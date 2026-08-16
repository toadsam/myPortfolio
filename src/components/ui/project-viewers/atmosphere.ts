import type {ProjectTheme} from "@/data/projectThemes";

// 프로젝트별 "분위기" — 진입 인트로 · 앰비언트 배경 · 사운드가 공유하는 한 가지 키.
export type AmbientVariant = "horror" | "energy" | "data" | "arcade" | "calm";

const BY_ID: Record<string, AmbientVariant> = {
  mywave: "energy",
  mystock: "data",
  festflow: "data",
  muscleup: "energy",
  aclub: "calm",
  ajouchong: "calm",
  "sign-language": "calm",
  darklab: "horror",
  "ajou-adventure": "arcade",
  tserof: "arcade"
};

export function ambientFor(id: string, theme: ProjectTheme): AmbientVariant {
  if (BY_ID[id]) return BY_ID[id];
  if (theme.category === "game")
    return theme.mood === "horror" ? "horror" : "arcade";
  if (theme.category === "platform") return "calm";
  return "data";
}

// 인트로 카피 — 변형별 분위기 텍스트.
export const INTRO_COPY: Record<AmbientVariant, {kicker: string; sub: string}> =
  {
    horror: {kicker: "ENTERING", sub: "어둠 속으로 진입 중…"},
    energy: {kicker: "LOADING", sub: "세션을 준비합니다"},
    data: {kicker: "SYSTEM ONLINE", sub: "실시간 데이터 연결 중…"},
    arcade: {kicker: "INSERT COIN", sub: "▶ PRESS START"},
    calm: {kicker: "WELCOME", sub: "프로젝트를 불러옵니다"}
  };
