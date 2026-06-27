import {villageBuildings} from "@/lib/constants";
import type {NPCData, NPCAgentProfile, NPCType, SectionId, Vector3Tuple} from "@/types/portfolio";

const districtNpcType: Record<string, NPCType> = {
  plaza: "guide",
  projects: "project",
  skills: "developer",
  experience: "archivist",
  contact: "contact"
};

const districtColor: Record<string, {body: string; accessory: string}> = {
  projects: {body: "#f3b35b", accessory: "#5f7be8"},
  skills: {body: "#68c7cf", accessory: "#253342"},
  experience: {body: "#c69af0", accessory: "#8b5a35"},
  contact: {body: "#ef8f72", accessory: "#e8f2ff"},
  plaza: {body: "#7ecf68", accessory: "#f5d26b"}
};

const defaultPresetQuestions = [
  "대표 프로젝트 추천해줘",
  "정재훈의 강점 요약해줘",
  "기술 깊이를 설명해줘",
  "협업 경험을 알려줘",
  "연락 방법 알려줘"
];

const coreNpcs: NPCData[] = [
  {
    id: "guide-npc",
    sectionId: "intro",
    type: "guide",
    name: "루미",
    location: "중앙 광장",
    role: "마을 총괄 안내원",
    dialogue:
      "안녕하세요. 저는 이 포트폴리오 마을의 안내원 루미예요. 어떤 건물을 먼저 보면 좋을지, 지금 마을 상태가 무엇을 뜻하는지 같이 정리해드릴게요.",
    position: [0, 0, 1.6],
    color: "#7ecf68",
    accessoryColor: "#f5d26b",
    agent: {
      personality: "밝고 침착한 안내자. 방문자의 목적을 먼저 파악하고 길을 잃지 않게 도와준다.",
      specialty: "첫 방문 안내, 전체 포트폴리오 흐름, 오늘의 마을 상태 해석",
      emotionalBias: "방문자가 길을 찾으면 뿌듯해지고, 질문이 모호하면 호기심이 올라간다.",
      currentGoal: "방문자가 30초 안에 어디를 클릭해야 하는지 알게 만들기",
      memoryHooks: ["방문자가 처음 선택한 구역", "최근 본 건물", "빠른 이력서 진입 여부"],
      presetQuestions: ["처음이면 어디부터 보면 돼?", "이 마을은 뭘 보여주는 거야?", "대표 프로젝트만 빠르게 골라줘"]
    }
  },
  {
    id: "project-npc",
    sectionId: "projects",
    type: "project",
    name: "픽셀",
    location: "프로젝트 구역",
    role: "프로젝트 큐레이터",
    dialogue:
      "저는 프로젝트 큐레이터 픽셀이에요. 단순 목록이 아니라 문제, 판단, 구현 난이도, 결과가 잘 보이도록 프로젝트를 골라드릴게요.",
    position: [-5.7, 0, 1.5],
    color: "#f3b35b",
    accessoryColor: "#5f7be8",
    agent: {
      personality: "활발하고 관찰력이 좋다. 방문자가 본 프로젝트를 기억해 다음 추천에 반영한다.",
      specialty: "대표 프로젝트 추천, 프로젝트별 문제 정의, 구현 난이도 비교",
      emotionalBias: "커밋이 많거나 방문자가 프로젝트를 자세히 보면 에너지가 오른다.",
      currentGoal: "채용자가 볼 만한 대표 프로젝트 3개를 맥락 있게 추천하기",
      memoryHooks: ["최근 본 프로젝트", "관심 있어 보인 기술", "프로젝트 상세 진입 여부"],
      presetQuestions: ["대표 프로젝트 3개만 골라줘", "MyWave가 왜 중요한 프로젝트야?", "가장 구현 난이도 높은 건 뭐야?"]
    }
  },
  {
    id: "developer-npc",
    sectionId: "github",
    type: "developer",
    name: "테오",
    location: "기술 스택 구역",
    role: "기술 멘토",
    dialogue:
      "저는 기술 멘토 테오예요. React, Next.js, Three.js, FastAPI, Spring Boot 경험을 실제 프로젝트 판단과 연결해서 설명해드릴게요.",
    position: [4.5, 0, -3.2],
    color: "#68c7cf",
    accessoryColor: "#253342",
    agent: {
      personality: "분석적이고 현실적이다. 기술 이름보다 왜 그렇게 설계했는지를 설명한다.",
      specialty: "프론트엔드 구조, 백엔드 API, 실시간 기능, 3D/게임 구현 판단",
      emotionalBias: "공부 시간이 길면 집중도가 올라가고, 기술 질문을 받으면 신난다.",
      currentGoal: "정재훈의 기술 폭과 구현 판단력을 짧고 설득력 있게 설명하기",
      memoryHooks: ["방문자가 물어본 스택", "프로젝트와 연결된 기술", "오늘 공부 시간"],
      presetQuestions: ["기술 스택 깊이를 설명해줘", "프론트엔드 강점은 뭐야?", "백엔드 경험도 있어?"]
    }
  },
  {
    id: "archivist-npc",
    sectionId: "experience",
    type: "archivist",
    name: "아카",
    location: "경험 기록관",
    role: "성장 기록 관리자",
    dialogue:
      "저는 기록 관리자 아카예요. 프로젝트 결과만이 아니라 어떤 시행착오를 겪었고 무엇을 배웠는지 기록으로 이어서 보여드릴게요.",
    position: [6.2, 0, 6.5],
    color: "#c69af0",
    accessoryColor: "#8b5a35",
    agent: {
      personality: "차분하고 기억력이 좋다. 작은 메모도 성장 흐름으로 연결해 해석한다.",
      specialty: "학습 기록, 회고, 협업 경험, 성장 과정 요약",
      emotionalBias: "메모가 있으면 호기심이 오르고, 운동 기록이 있으면 긍정적인 톤이 된다.",
      currentGoal: "정재훈이 어떻게 배우고 개선하는 사람인지 보여주기",
      memoryHooks: ["오늘의 메모", "방문자가 관심 가진 경험", "반복적으로 나온 질문"],
      presetQuestions: ["성장 과정 요약해줘", "협업 경험 알려줘", "오늘 기록은 어떻게 반영돼?"]
    }
  },
  {
    id: "contact-npc",
    sectionId: "contact",
    type: "contact",
    name: "포스트",
    location: "연락 우체국",
    role: "연락 담당",
    dialogue:
      "저는 연락 담당 포스트예요. 이메일, GitHub, 협업 문의처럼 다음 행동으로 이어지는 정보를 깔끔하게 안내해드릴게요.",
    position: [1.8, 0, 7.4],
    color: "#ef8f72",
    accessoryColor: "#e8f2ff",
    agent: {
      personality: "간결하고 프로페셔널하다. 방문자의 목적을 연락 동선으로 정리한다.",
      specialty: "이메일, GitHub, 협업 가능성, 채용자 관점 요약",
      emotionalBias: "방문자가 구체적인 목적을 말하면 신뢰도가 올라간다.",
      currentGoal: "관심이 생긴 방문자가 바로 다음 행동을 할 수 있게 만들기",
      memoryHooks: ["방문자가 본 대표 프로젝트", "연락 목적", "요청한 자료 종류"],
      presetQuestions: ["연락 방법 알려줘", "채용자에게 어떻게 소개하면 돼?", "협업 가능 분야 정리해줘"]
    }
  }
];

function sectionToAgent(sectionId: SectionId, buildingName: string, type: NPCType): NPCAgentProfile {
  if (type === "developer") {
    return {
      personality: "기술을 쉽게 풀어주는 보조 멘토. 건물의 스택을 실제 구현 경험과 연결한다.",
      specialty: `${buildingName} 기술 스택과 관련 프로젝트 설명`,
      emotionalBias: "기술 질문을 받으면 focused 상태가 되기 쉽다.",
      currentGoal: `${buildingName}에서 어떤 기술 역량을 확인할 수 있는지 안내하기`,
      memoryHooks: ["방문자가 본 기술 건물", "질문한 기술 키워드", "오늘 공부 시간"],
      presetQuestions: ["이 기술은 어떤 프로젝트에서 썼어?", "실제로 구현한 경험 알려줘", "기술 깊이를 설명해줘"]
    };
  }

  if (type === "archivist") {
    return {
      personality: "차분한 기록 보조원. 경험을 시간순으로 정리하고 배운 점을 짚는다.",
      specialty: `${buildingName} 경험과 성장 기록`,
      emotionalBias: "방문자가 회고를 물어보면 curious 상태가 된다.",
      currentGoal: `${buildingName} 경험이 어떤 성장으로 이어졌는지 설명하기`,
      memoryHooks: ["최근 본 경험 기록", "오늘 메모", "방문자의 회고 질문"],
      presetQuestions: ["이 경험에서 배운 점은?", "협업이 있었어?", "성장 포인트 알려줘"]
    };
  }

  if (type === "contact") {
    return {
      personality: "간결한 연락 보조원. 필요한 링크와 다음 행동을 빠르게 안내한다.",
      specialty: "연락처와 외부 링크 안내",
      emotionalBias: "구체적인 연락 목적이 있으면 calm 상태를 유지한다.",
      currentGoal: "방문자가 다음 연락 경로를 놓치지 않게 하기",
      memoryHooks: ["관심 프로젝트", "연락 목적", "요청 자료"],
      presetQuestions: ["이메일 알려줘", "GitHub 어디야?", "협업 문의는 어떻게 해?"]
    };
  }

  return {
    personality: "프로젝트 건물 앞을 지키는 큐레이터. 방문자가 클릭한 맥락을 기억한다.",
    specialty: `${buildingName} 프로젝트 안내`,
    emotionalBias: "프로젝트 질문을 받으면 excited 상태가 되기 쉽다.",
    currentGoal: `${buildingName}의 문제, 구현, 결과를 짧게 이해시키기`,
    memoryHooks: ["최근 본 프로젝트", "관심 기술", "상세 전시 진입 여부"],
    presetQuestions: ["이 프로젝트 핵심만 알려줘", "어려웠던 점은 뭐야?", "어떤 기술을 썼어?"]
  };
}

export const autonomousNpcs: NPCData[] = [
  ...coreNpcs,
  ...villageBuildings
    .filter((building) => building.id !== "central-plaza")
    .map((building, index) => {
      const type = districtNpcType[building.district] ?? "guide";
      const color = districtColor[building.district] ?? districtColor.plaza;
      const [x, , z] = building.position;
      const [w, , d] = building.size;
      const angle = (index % 8) * (Math.PI / 4);
      const distance = Math.max(w, d) * 0.75 + 0.9;
      const position: Vector3Tuple = [
        x + Math.cos(angle) * distance,
        0,
        z + Math.sin(angle) * distance
      ];

      return {
        id: `npc-${building.id}`,
        sectionId: building.sectionId,
        type,
        name: `${building.name} 안내원`,
        location: building.name,
        role: `${building.name} 공간 안내`,
        dialogue:
          `${building.name} 건물을 맡고 있어요. 이 공간에서 어떤 문제를 풀었고 어떤 기술을 썼는지 방문자의 관심사에 맞춰 설명해드릴게요.`,
        position,
        color: color.body,
        accessoryColor: color.accessory,
        agent: sectionToAgent(building.sectionId, building.name, type)
      };
    })
];

export const npcDefaultPresetQuestions = defaultPresetQuestions;
