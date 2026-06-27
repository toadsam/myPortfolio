import type {NpcActionDefinition} from "@/types/live";

export const npcActions: NpcActionDefinition[] = [
  {
    id: "welcome-visitor",
    npcId: "guide-npc",
    label: "방문자 환영",
    description: "처음 온 방문자에게 마을의 첫 동선을 안내합니다.",
    triggerKeywords: ["처음", "시작", "안내", "어디", "intro"],
    preferredMoods: ["calm", "proud", "training"],
    animationKey: "wave",
    targetId: "central-plaza",
    durationMs: 4200
  },
  {
    id: "recommend-route",
    npcId: "guide-npc",
    label: "다음 목적지 추천",
    description: "방문자의 목적에 맞춰 다음에 볼 구역을 추천합니다.",
    triggerKeywords: ["추천", "동선", "다음", "빠르게", "순서"],
    preferredMoods: ["curious", "focused"],
    animationKey: "point",
    targetId: "project-mywave",
    durationMs: 4400
  },
  {
    id: "celebrate-activity",
    npcId: "guide-npc",
    label: "오늘 활동 축하",
    description: "오늘 기록을 보고 마을 전체 상태를 활기차게 소개합니다.",
    triggerKeywords: ["오늘", "활동", "운동", "상태", "기록"],
    preferredMoods: ["training", "proud", "excited"],
    animationKey: "wave",
    targetId: "central-plaza",
    durationMs: 4200
  },
  {
    id: "recommend-projects",
    npcId: "project-npc",
    label: "대표 프로젝트 추천",
    description: "방문자에게 대표 프로젝트 3개를 추천합니다.",
    triggerKeywords: ["대표", "추천", "프로젝트", "best", "채용자"],
    preferredMoods: ["excited", "focused", "busy"],
    animationKey: "point",
    targetId: "project-mywave",
    durationMs: 4600
  },
  {
    id: "point-project-building",
    npcId: "project-npc",
    label: "프로젝트 건물 가리키기",
    description: "관심 있는 프로젝트 건물을 가리키는 행동입니다.",
    triggerKeywords: ["mywave", "festflow", "건물", "상세", "클릭"],
    preferredMoods: ["curious", "excited"],
    animationKey: "point",
    targetId: "project-mywave",
    durationMs: 4300
  },
  {
    id: "prepare-exhibition",
    npcId: "project-npc",
    label: "전시 자료 정리",
    description: "프로젝트 전시 내용을 정리하는 행동입니다.",
    triggerKeywords: ["전시", "정리", "커밋", "구현", "결과"],
    preferredMoods: ["busy", "focused"],
    animationKey: "open-hologram",
    targetId: "project-festflow",
    durationMs: 5200
  },
  {
    id: "analyze-tech-stack",
    npcId: "developer-npc",
    label: "기술 스택 분석",
    description: "기술 스택을 프로젝트 사례와 연결해 분석합니다.",
    triggerKeywords: ["기술", "스택", "분석", "아키텍처", "구조"],
    preferredMoods: ["focused", "excited"],
    animationKey: "think",
    targetId: "skill-backend",
    durationMs: 5000
  },
  {
    id: "prepare-architecture-board",
    npcId: "developer-npc",
    label: "아키텍처 보드 준비",
    description: "서비스 구조와 데이터 흐름을 설명할 보드를 준비합니다.",
    triggerKeywords: ["구조", "흐름", "백엔드", "api", "설계"],
    preferredMoods: ["focused", "busy"],
    animationKey: "open-hologram",
    targetId: "skill-backend",
    durationMs: 5200
  },
  {
    id: "explain-code-flow",
    npcId: "developer-npc",
    label: "코드 흐름 정리",
    description: "구현 흐름을 단계별로 설명할 준비를 합니다.",
    triggerKeywords: ["코드", "구현", "흐름", "개발", "로직"],
    preferredMoods: ["focused"],
    animationKey: "type",
    targetId: "skill-frontend",
    durationMs: 4800
  },
  {
    id: "summarize-daily-log",
    npcId: "archivist-npc",
    label: "오늘 기록 정리",
    description: "오늘의 공부, 커밋, 메모를 성장 기록으로 정리합니다.",
    triggerKeywords: ["오늘", "기록", "메모", "성장", "회고"],
    preferredMoods: ["curious", "focused"],
    animationKey: "type",
    targetId: "exp-portfolio",
    durationMs: 4600
  },
  {
    id: "read-growth-log",
    npcId: "archivist-npc",
    label: "성장 로그 읽기",
    description: "프로젝트 경험과 회고를 연결해서 읽어줍니다.",
    triggerKeywords: ["회고", "경험", "배운", "협업", "성장"],
    preferredMoods: ["calm", "curious"],
    animationKey: "think",
    targetId: "exp-portfolio",
    durationMs: 4700
  },
  {
    id: "archive-reflection",
    npcId: "archivist-npc",
    label: "회고 보관",
    description: "방문자의 질문을 성장 기록의 단서로 보관합니다.",
    triggerKeywords: ["보관", "정리", "기억", "질문"],
    preferredMoods: ["focused"],
    animationKey: "type",
    targetId: "exp-demo-platform",
    durationMs: 4300
  },
  {
    id: "share-contact",
    npcId: "contact-npc",
    label: "연락처 안내",
    description: "이메일과 연락 동선을 안내합니다.",
    triggerKeywords: ["연락", "메일", "문의", "contact", "이메일"],
    preferredMoods: ["calm", "proud"],
    animationKey: "send",
    targetId: "post-office",
    durationMs: 4200
  },
  {
    id: "deliver-github-link",
    npcId: "contact-npc",
    label: "GitHub 링크 전달",
    description: "GitHub 링크를 방문자에게 전달합니다.",
    triggerKeywords: ["github", "깃허브", "코드", "링크", "저장소"],
    preferredMoods: ["calm", "focused"],
    animationKey: "send",
    targetId: "post-office",
    durationMs: 4200
  },
  {
    id: "organize-collaboration-inquiry",
    npcId: "contact-npc",
    label: "협업 문의 정리",
    description: "협업이나 채용 문의에 필요한 정보를 정리합니다.",
    triggerKeywords: ["협업", "채용", "인터뷰", "지원", "문의"],
    preferredMoods: ["focused", "proud"],
    animationKey: "type",
    targetId: "post-office",
    durationMs: 4700
  }
];

const dynamicNpcFallback: Record<string, string> = {
  project: "point-project-building",
  skill: "analyze-tech-stack",
  exp: "read-growth-log",
  post: "share-contact"
};

export function getNpcActions(npcId: string): NpcActionDefinition[] {
  const exact = npcActions.filter((action) => action.npcId === npcId);
  if (exact.length > 0) return exact;

  const fallbackActionId = Object.entries(dynamicNpcFallback).find(([token]) => npcId.includes(token))?.[1];
  if (!fallbackActionId) return npcActions.filter((action) => action.npcId === "guide-npc");

  const fallback = npcActions.find((action) => action.id === fallbackActionId);
  return fallback ? [fallback] : [];
}
