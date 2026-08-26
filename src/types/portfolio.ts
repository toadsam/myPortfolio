export type SectionId =
  | "intro"
  | "projects"
  | "github"
  | "experience"
  | "contact"
  | "study"
  | "life";
export type ExplorationMode = "click" | "walk";
export type District =
  | "plaza"
  | "projects"
  | "skills"
  | "experience"
  | "contact"
  | "life"
  | "study";

export type BuildingKind =
  | "plaza"
  | "tower"
  | "office-rounded"
  | "compact-studio"
  | "flat-hub"
  | "dome"
  | "server-tower"
  | "arcade"
  | "minimal-office"
  | "townhouse"
  | "post";

export type NPCType =
  | "guide"
  | "project"
  | "developer"
  | "archivist"
  | "contact";

export type Vector3Tuple = [number, number, number];

export interface SectionMeta {
  id: SectionId;
  label: string;
  navLabel: string;
  title: string;
  description: string;
}

export interface BuildingData {
  id: string;
  sectionId: SectionId;
  district: District;
  contentId?: string;
  kind: BuildingKind;
  name: string;
  label: string;
  description: string;
  position: Vector3Tuple;
  size: Vector3Tuple;
  /**
   * 건물이 광장을 보게 도는 각(라디안, 0/±π/2/π 스냅).
   * arrange-district-rows --write 가 적는다. **size 리터럴은 모델 기준**이고,
   * 90도짜리는 constants 내보내기와 read-village 가 월드 폭/깊이를 맞바꾼다.
   */
  rotationY?: number;
  color: string;
  roofColor: string;
  accentColor: string;
  glbPath?: string;
  techStack?: string[];
}

// 3D 캐릭터 모델 식별자. 실제 경로/설정은 data/characterModels.ts에 있다.
// 여기에 추가하면 레지스트리도 채우라고 컴파일러가 강제한다.
export type CharacterModelId =
  | "robot"
  | "lumi"
  // 의인화 동물 캐스팅 — 배정표는 docs/NPC_CHARACTER_PROMPTS.md
  | "tortoise"
  | "meerkat"
  | "buffalo"
  | "parrot"
  | "rabbit"
  | "tiger"
  | "gorilla"
  | "peacock"
  | "stork"
  | "raccoon"
  | "bee"
  | "beaver"
  | "deer"
  | "owl"
  | "chameleon"
  | "elephant"
  | "kangaroo"
  | "squirrel"
  | "panda"
  | "jaehoon";

export interface NPCData {
  id: string;
  sectionId: SectionId;
  type: NPCType;
  name: string;
  location: string;
  role: string;
  dialogue: string;
  position: Vector3Tuple;
  color: string;
  accessoryColor: string;
  agent?: NPCAgentProfile;
  /** 생략하면 DEFAULT_NPC_MODEL */
  model?: CharacterModelId;
}

export interface NPCAgentProfile {
  personality: string;
  specialty: string;
  emotionalBias: string;
  currentGoal: string;
  memoryHooks: string[];
  presetQuestions: string[];
}

export interface ProjectLink {
  // 예전엔 "GitHub" | "Demo" 뿐이었다. 스팀 스토어·시연 영상처럼 종류가
  // 다른 증거가 생겨서 자유 문자열로 연다 — 아이콘은 ProjectOnePager 가
  // 라벨을 보고 고른다.
  label: string;
  href: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  role: string;
  tech: string[];
  features: string[];
  learning: string;
  problem: string;
  approach: string[];
  contribution: string[];
  result: string;
  nextStep: string;
  links: ProjectLink[];
}

export interface SkillData {
  name: string;
  group: "Frontend" | "3D / Motion" | "Backend" | "Game / XR" | "Workflow";
  description: string;
}

export interface PortfolioLink {
  label: string;
  value: string;
  href: string;
}

export interface ExperienceItem {
  year: string;
  title: string;
  description: string;
}
