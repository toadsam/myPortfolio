import type {BuildingData, SectionMeta, Vector3Tuple} from "@/types/portfolio";

export const sectionMeta: SectionMeta[] = [
  {
    id: "intro",
    label: "Plaza",
    navLabel: "Intro",
    title: "중앙 광장",
    description: "Developer's City의 허브입니다. 각 구역으로 이어지는 빛나는 경로가 시작됩니다."
  },
  {
    id: "projects",
    label: "Project District",
    navLabel: "Projects",
    title: "프로젝트 구역",
    description: "각 건물이 하나의 프로젝트입니다. 건물을 클릭해 상세 내용을 확인하세요."
  },
  {
    id: "github",
    label: "Skills District",
    navLabel: "Skills",
    title: "스킬 구역",
    description: "기술 스택별로 하나의 건물입니다. 프론트엔드부터 게임/XR까지."
  },
  {
    id: "experience",
    label: "Experience District",
    navLabel: "Archive",
    title: "경험 구역",
    description: "시간 순서로 쌓인 경험들이 점점 커지는 건물로 표현됩니다."
  },
  {
    id: "contact",
    label: "Post",
    navLabel: "Contact",
    title: "우체국",
    description: "이메일, GitHub, 블로그 링크를 통해 다음 협업으로 연결됩니다."
  }
];

// ─── 중앙 광장 ───────────────────────────────────────────────────────────────

const plazaBuilding: BuildingData = {
  id: "central-plaza",
  sectionId: "intro",
  district: "plaza",
  kind: "plaza",
  name: "중앙 광장",
  label: "Plaza",
  description: "Developer's City의 시작점",
  position: [0, 0, 0],
  size: [2.6, 0.4, 2.6],
  color: "#0a1a2e",
  roofColor: "#00d4ff",
  accentColor: "#00d4ff"
};

// ─── 프로젝트 구역 (왼쪽, x ~ -6.5) ──────────────────────────────────────────

const projectBuildings: BuildingData[] = [
  {
    id: "project-demotion",
    sectionId: "projects",
    district: "projects",
    contentId: "demotion",
    kind: "tower",
    name: "Demotion",
    label: "B2B SaaS",
    description: "B2B SaaS 데모 생성 및 마케팅 인사이트 플랫폼",
    position: [-6.5, 0, -3.5],
    size: [1.9, 2.8, 1.9],
    color: "#0d1f3a",
    roofColor: "#1a3a6a",
    accentColor: "#00d4ff",
    techStack: ["Spring Boot", "React", "PostgreSQL"],
    // glbPath: "/models/demotion.glb"
  },
  {
    id: "project-mywave",
    sectionId: "projects",
    district: "projects",
    contentId: "mywave",
    kind: "office-rounded",
    name: "MyWave",
    label: "Fintech",
    description: "나만의 투자 흐름을 만드는 금융/투자 관리 웹앱",
    position: [-6.5, 0, 1],
    size: [2.1, 1.9, 2.1],
    color: "#0d2a1a",
    roofColor: "#1a4a2a",
    accentColor: "#00ff88",
    techStack: ["React", "TypeScript", "Chart UI"],
    // glbPath: "/models/mywave.glb"
  },
  {
    id: "project-farm",
    sectionId: "projects",
    district: "projects",
    contentId: "farm-owner",
    kind: "compact-studio",
    name: "일해라 농장주",
    label: "Game / DTx",
    description: "스마트폰 과의존 완화를 위한 농장 육성 DTx 게임",
    position: [-6.5, 0, 5.5],
    size: [1.9, 1.5, 1.9],
    color: "#1a0d2e",
    roofColor: "#3a1a5a",
    accentColor: "#aa44ff",
    techStack: ["Unity", "C#"],
    // glbPath: "/models/farm.glb"
  }
];

// ─── 스킬 구역 (위쪽 중앙) ────────────────────────────────────────────────────

const skillBuildings: BuildingData[] = [
  {
    id: "skill-frontend",
    sectionId: "github",
    district: "skills",
    contentId: "Frontend",
    kind: "flat-hub",
    name: "Frontend",
    label: "FE Hub",
    description: "React, Next.js, TypeScript, Tailwind CSS",
    position: [-2.5, 0, -6.5],
    size: [2.6, 1.6, 2.2],
    color: "#0d1a2e",
    roofColor: "#0a2a4a",
    accentColor: "#00d4ff",
    techStack: ["React", "Next.js", "TypeScript", "Tailwind"],
    glbPath: "/models/frontend.glb"
  },
  {
    id: "skill-3d",
    sectionId: "github",
    district: "skills",
    contentId: "3D / Motion",
    kind: "dome",
    name: "3D / Motion",
    label: "3D Lab",
    description: "Three.js, React Three Fiber, Drei, Framer Motion",
    position: [2.5, 0, -6.5],
    size: [2.3, 2.2, 2.3],
    color: "#1a0d2e",
    roofColor: "#2a1a4a",
    accentColor: "#aa44ff",
    techStack: ["Three.js", "R3F", "Drei", "Framer Motion"],
    // glbPath: "/models/skill-3d.glb"
  },
  {
    id: "skill-backend",
    sectionId: "github",
    district: "skills",
    contentId: "Backend",
    kind: "server-tower",
    name: "Backend",
    label: "BE Tower",
    description: "Spring Boot, PostgreSQL",
    position: [6, 0, -4],
    size: [1.8, 2.6, 1.8],
    color: "#1a1a0d",
    roofColor: "#2a2a1a",
    accentColor: "#fbbf24",
    techStack: ["Spring Boot", "PostgreSQL"],
    glbPath: "/models/backend.glb"
  },
  {
    id: "skill-game",
    sectionId: "github",
    district: "skills",
    contentId: "Game / XR",
    kind: "arcade",
    name: "Game / XR",
    label: "Arcade",
    description: "Unity, C#, XR 인터랙션",
    position: [6, 0, 0.5],
    size: [2.1, 1.9, 2.1],
    color: "#2a0d0d",
    roofColor: "#4a1a1a",
    accentColor: "#ff6600",
    techStack: ["Unity", "C#", "XR"],
    // glbPath: "/models/skill-game.glb"
  },
  {
    id: "skill-workflow",
    sectionId: "github",
    district: "skills",
    contentId: "Workflow",
    kind: "minimal-office",
    name: "Workflow",
    label: "DevOps",
    description: "GitHub, CI/CD",
    position: [2.5, 0, -3],
    size: [1.8, 1.4, 1.6],
    color: "#1a1a1a",
    roofColor: "#2a2a2a",
    accentColor: "#fbbf24",
    techStack: ["GitHub", "CI/CD"],
    // glbPath: "/models/skill-workflow.glb"
  }
];

// ─── 경험 구역 (오른쪽, x ~ 7) ───────────────────────────────────────────────

const experienceBuildings: BuildingData[] = [
  {
    id: "exp-unity-ui",
    sectionId: "experience",
    district: "experience",
    contentId: "Unity UI Implementation",
    kind: "townhouse",
    name: "2025 · Unity UI",
    label: "2025",
    description: "게임 UI 구현과 사용자 행동 피드백 인터페이스",
    position: [7.2, 0, 3],
    size: [1.7, 1.3, 1.5],
    color: "#1a0d2e",
    roofColor: "#3a1a5a",
    accentColor: "#aa44ff",
    // glbPath: "/models/exp-2025a.glb"
  },
  {
    id: "exp-demo-platform",
    sectionId: "experience",
    district: "experience",
    contentId: "Interactive Demo Platform",
    kind: "townhouse",
    name: "2025 · Demo Platform",
    label: "2025",
    description: "B2B SaaS 데모 흐름과 행동 로그 수집 구조 설계",
    position: [7.2, 0, 6],
    size: [1.9, 1.6, 1.7],
    color: "#0d1a2e",
    roofColor: "#1a3a5a",
    accentColor: "#00d4ff",
    // glbPath: "/models/exp-2025b.glb"
  },
  {
    id: "exp-portfolio",
    sectionId: "experience",
    district: "experience",
    contentId: "AI Portfolio Village",
    kind: "townhouse",
    name: "2026 · AI Portfolio",
    label: "2026",
    description: "3D 마을 은유를 활용한 탐색형 포트폴리오",
    position: [4.5, 0, 7.8],
    size: [2.1, 2.0, 1.9],
    color: "#0d2a1a",
    roofColor: "#1a4a2a",
    accentColor: "#00ff88",
    // glbPath: "/models/exp-2026.glb"
  }
];

// ─── 연락처 ───────────────────────────────────────────────────────────────────

const contactBuilding: BuildingData = {
  id: "post-office",
  sectionId: "contact",
  district: "contact",
  kind: "post",
  name: "우체국",
  label: "Contact",
  description: "연락처와 링크가 모인 우체국",
  position: [0, 0, 8.5],
  size: [2.1, 1.5, 1.9],
  color: "#2a1a0d",
  roofColor: "#e07055",
  accentColor: "#ff6600",
  // glbPath: "/models/post-office.glb"
};

export const villageBuildings: BuildingData[] = [
  plazaBuilding,
  ...projectBuildings,
  ...skillBuildings,
  ...experienceBuildings,
  contactBuilding
];

// ─── 트리 위치 ────────────────────────────────────────────────────────────────

export const treePositions: Vector3Tuple[] = [
  // 프로젝트 구역 주변
  [-8.2, 0, -5.2],
  [-8.2, 0, -1.2],
  [-8.2, 0, 3.0],
  [-8.2, 0, 7.5],
  [-4.8, 0, -5.5],
  // 스킬 구역 주변
  [-0.5, 0, -8.2],
  [4.0, 0, -8.2],
  [8.2, 0, -6.0],
  // 경험 구역 주변
  [8.8, 0, 1.5],
  [8.8, 0, 4.8],
  [8.8, 0, 7.5],
  // 중앙 주변
  [-3.5, 0, 3.8],
  [1.5, 0, 3.5],
  // 연락처 주변
  [-2.5, 0, 9.5],
  [2.5, 0, 9.5]
];

export const rockPositions: Vector3Tuple[] = [
  [-4.5, 0, -1.5],
  [-4.5, 0,  3.5],
  [ 0.5, 0, -4.0],
  [ 4.0, 0, -1.5],
  [ 4.0, 0,  2.8],
  [ 1.5, 0,  6.5]
];

// ─── 카메라 타겟 ──────────────────────────────────────────────────────────────

export const cameraTargets: Record<string, {position: Vector3Tuple; lookAt: Vector3Tuple}> = {
  intro:      {position: [2, 14, 14],   lookAt: [0, 0, 2]},
  projects:   {position: [-10, 7, 3],   lookAt: [-6.5, 1, 1]},
  github:     {position: [3, 8, 0],     lookAt: [2, 1, -4.5]},
  experience: {position: [10, 6, 6],    lookAt: [7, 1, 5.5]},
  contact:    {position: [2, 6, 13],    lookAt: [0, 1, 8.5]}
};
