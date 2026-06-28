export type SectionId = "intro" | "projects" | "github" | "experience" | "contact" | "study";
export type ExplorationMode = "click" | "walk";
export type District = "plaza" | "projects" | "skills" | "experience" | "contact" | "life" | "study";

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

export type NPCType = "guide" | "project" | "developer" | "archivist" | "contact";

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
  color: string;
  roofColor: string;
  accentColor: string;
  glbPath?: string;
  techStack?: string[];
}

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
  label: "GitHub" | "Demo";
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
