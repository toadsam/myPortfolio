import type {BuildingData, SectionMeta, Vector3Tuple} from "@/types/portfolio";

export const sectionMeta: SectionMeta[] = [
  {
    id: "intro",
    label: "Central Plaza",
    navLabel: "Intro",
    title: "중앙 광장",
    description:
      "Developer's City의 시작 지점입니다. 건물을 클릭하면 프로젝트, 기술 스택, 경험, 연락처 공간으로 이동할 수 있습니다."
  },
  {
    id: "projects",
    label: "Project District",
    navLabel: "Projects",
    title: "프로젝트 구역",
    description:
      "각 건물은 하나의 대표 프로젝트입니다. 건물 안으로 들어가면 문제, 접근 방식, 기여도, 결과를 3D 전시처럼 볼 수 있습니다."
  },
  {
    id: "github",
    label: "Skills District",
    navLabel: "Skills",
    title: "기술 스택 구역",
    description:
      "프론트엔드, 백엔드, 3D/모션, 게임/XR, 개발 워크플로를 묶어 정리한 구역입니다."
  },
  {
    id: "experience",
    label: "Experience Archive",
    navLabel: "Archive",
    title: "경험 기록관",
    description:
      "프로젝트를 만들며 쌓은 구현 경험, 협업 경험, 성장 과정을 시간순으로 정리합니다."
  },
  {
    id: "study",
    label: "Study District",
    navLabel: "Study",
    title: "학습 구역",
    description:
      "매일 푼 코딩테스트 풀이와 공부한 CS 전공지식을 기록하는 구역입니다. 알고리즘 도장과 지식 서고에서 최근 학습 기록을 확인할 수 있습니다."
  },
  {
    id: "contact",
    label: "Contact Post",
    navLabel: "Contact",
    title: "연락 우체국",
    description:
      "이메일, GitHub, 블로그 링크를 통해 다음 협업으로 이어지는 동선을 제공합니다."
  },
  {
    id: "life",
    label: "Life District",
    navLabel: "Life",
    title: "인생·일상 구역",
    description:
      "운동, 학습, 가치관, 투자, 음악, 연혁처럼 프로젝트 밖의 일상을 모아둔 구역입니다. 일부 카드는 아직 내용을 채우는 중입니다."
  }
];

const studyBuildings: BuildingData[] = [
  {
    id: "study-codingtest",
    sectionId: "study",
    district: "study",
    contentId: "codingtest",
    kind: "server-tower",
    name: "알고리즘 도장",
    label: "Coding Test",
    description: "백준·프로그래머스에서 푼 문제와 풀이를 기록하는 코딩테스트 공간",
    position: [-2.2, 0, 11.5],
    size: [2.64, 3.3, 2.64],
    color: "#0d1a2e",
    roofColor: "#13314f",
    accentColor: "#38bdf8",
    techStack: ["백준", "프로그래머스", "알고리즘"]
  },
  {
    id: "study-cs",
    sectionId: "study",
    district: "study",
    contentId: "cs",
    kind: "office-rounded",
    name: "지식 서고",
    label: "CS Notes",
    description: "운영체제·네트워크·DB 등 전공 지식을 정리하는 학습 서고",
    position: [2.2, 0, 11.5],
    size: [2.76, 2.51, 2.76],
    color: "#16102a",
    roofColor: "#2c1f4a",
    accentColor: "#a78bfa",
    techStack: ["OS", "네트워크", "DB", "자료구조"]
  }
];

const plazaBuilding: BuildingData = {
  id: "central-plaza",
  sectionId: "intro",
  district: "plaza",
  kind: "plaza",
  name: "중앙 광장",
  label: "Start",
  description: "마을 전체의 허브입니다. 처음 방문했다면 여기에서 안내를 확인하세요.",
  position: [0, 0, 0],
  size: [4.75, 5.54, 4.75],
  color: "#0a1a2e",
  roofColor: "#00d4ff",
  accentColor: "#00d4ff"
};

const projectBuildings: BuildingData[] = [
  // MyWave는 별도 저장소가 없고 MyStock-Desk 저장소 안의 화면(frontend/src/mywave)이라
  // 건물을 따로 두지 않고 아래 project-mystock 하나로 합쳤습니다. (2026-07-31)
  {
    id: "project-mystock",
    sectionId: "projects",
    district: "projects",
    contentId: "mystock",
    kind: "tower",
    name: "MyStock-Desk",
    label: "Finance AI",
    description:
      "거래 기록 기반 포트폴리오 분석과 AI 체크리스트, 자산 흐름 대시보드(MyWave)를 담은 서비스",
    position: [-7, 0, -2],
    size: [2.05, 3.3, 2.05],
    color: "#0d1f3a",
    roofColor: "#1a3a6a",
    accentColor: "#00d4ff",
    techStack: ["React", "TypeScript", "Spring Boot"]
  },
  {
    id: "project-festflow",
    sectionId: "projects",
    district: "projects",
    contentId: "festflow",
    kind: "flat-hub",
    name: "FestFlow",
    label: "Festival",
    description: "대학 축제 운영을 위한 실시간 부스 관리 시스템",
    position: [-7, 0, 3],
    size: [3.1, 1.85, 2.28],
    color: "#1a1a0d",
    roofColor: "#3a3a1a",
    accentColor: "#ffcc00",
    techStack: ["React", "Spring Boot", "SSE", "PWA"]
  },
  {
    id: "project-sign-language",
    sectionId: "projects",
    district: "projects",
    contentId: "sign-language",
    kind: "dome",
    name: "수어지구",
    label: "Social Tech",
    description: "수어 동작 영상을 보고 뜻을 익히는 학습 앱",
    position: [-7, 0, 6.5],
    size: [2.88, 2.51, 2.88],
    color: "#0d1a2e",
    roofColor: "#1a2e4a",
    accentColor: "#7eb8ff",
    techStack: ["Spring Boot", "Firebase", "Expo"]
  },
  {
    id: "project-aclub",
    sectionId: "projects",
    district: "projects",
    contentId: "aclub",
    kind: "minimal-office",
    name: "ACLUB",
    label: "Platform",
    description: "동아리 탐색과 모집을 연결하는 캠퍼스 플랫폼",
    position: [-4, 0, -6],
    size: [1.5, 2.51, 0.92],
    color: "#1a0d2e",
    roofColor: "#3a1a5a",
    accentColor: "#cc88ff",
    techStack: ["React", "TypeScript", "Vite"]
  },
  {
    id: "project-ajou-adventure",
    sectionId: "projects",
    district: "projects",
    contentId: "ajou-adventure",
    kind: "arcade",
    name: "아주분투",
    label: "Web Game",
    description: "아주대학교 캠퍼스를 배경으로 한 Phaser 3 기반 2D 러닝 게임",
    position: [-4, 0, 8.5],
    size: [2.64, 2.51, 2.64],
    color: "#1a2a0d",
    roofColor: "#2a4a1a",
    accentColor: "#88ff44",
    techStack: ["TypeScript", "Phaser 3", "Vite"]
  },
  {
    id: "project-ajouchong",
    sectionId: "projects",
    district: "projects",
    contentId: "ajouchong",
    kind: "compact-studio",
    name: "아주총학",
    label: "Student Council",
    description: "아주대학교 총학생회 공식 웹사이트 프론트엔드",
    position: [-4, 0, 11],
    size: [2.51, 2.51, 2.51],
    color: "#1f0d0d",
    roofColor: "#3a1a1a",
    accentColor: "#ff6644",
    techStack: ["React", "Docker", "Nginx"]
  },
  {
    id: "project-muscleup",
    sectionId: "projects",
    district: "projects",
    contentId: "muscleup",
    kind: "server-tower",
    name: "근근 MuscleUp",
    label: "Fitness",
    description: "운동 기록을 성장 루프와 커뮤니티로 연결한 피트니스 플랫폼",
    position: [-7, 0, 9.5],
    size: [2.01, 2.51, 2.01],
    color: "#1a0d0d",
    roofColor: "#3a1a1a",
    accentColor: "#ff4488",
    techStack: ["TypeScript", "Spring Boot", "Socket.IO", "OAuth"]
  },
  {
    id: "project-darklab",
    sectionId: "projects",
    district: "projects",
    contentId: "darklab",
    kind: "townhouse",
    name: "DarkLab",
    label: "Horror Game",
    description: "1인칭 탐색 기반 3D 공포 어드벤처 게임",
    position: [-10, 0, 2],
    size: [2.51, 2.51, 2.51],
    color: "#0d0d0d",
    roofColor: "#1a1a1a",
    accentColor: "#882200",
    techStack: ["Unity", "C#", "Cinemachine", "URP"]
  },
  {
    id: "project-tserof",
    sectionId: "projects",
    district: "projects",
    contentId: "tserof",
    kind: "compact-studio",
    name: "TSEROF",
    label: "3D Platformer",
    description: "잃어버린 아이템을 찾아 스테이지를 클리어하는 3D 플랫폼 게임",
    position: [-10, 0, 6],
    size: [1.72, 1.72, 1.72],
    color: "#0d1a0d",
    roofColor: "#1a2e1a",
    accentColor: "#44aa66",
    techStack: ["Unity", "C#"]
  }
];

const skillBuildings: BuildingData[] = [
  {
    id: "skill-frontend",
    sectionId: "github",
    district: "skills",
    contentId: "Frontend",
    kind: "flat-hub",
    name: "Frontend",
    label: "FE Hub",
    description: "React, Next.js, TypeScript, Tailwind CSS 중심의 UI 구현",
    position: [-2.5, 0, -6.5],
    size: [3, 2.51, 3],
    color: "#0d1a2e",
    roofColor: "#0a2a4a",
    accentColor: "#00d4ff",
    techStack: ["React", "Next.js", "TypeScript", "Tailwind"]
  },
  {
    id: "skill-3d",
    sectionId: "github",
    district: "skills",
    contentId: "3D / Motion",
    kind: "dome",
    name: "3D / Motion",
    label: "3D Lab",
    description: "Three.js, React Three Fiber, Drei, Framer Motion 기반 인터랙션",
    position: [2.5, 0, -6.5],
    size: [3.8, 3.3, 3.8],
    color: "#1a0d2e",
    roofColor: "#2a1a4a",
    accentColor: "#aa44ff",
    techStack: ["Three.js", "R3F", "Drei", "Framer Motion"]
  },
  {
    id: "skill-backend",
    sectionId: "github",
    district: "skills",
    contentId: "Backend",
    kind: "server-tower",
    name: "Backend",
    label: "BE Tower",
    description: "Spring Boot, FastAPI, PostgreSQL, SQLite 기반 API 설계",
    position: [6, 0, -4],
    size: [2.68, 4.09, 3.12],
    color: "#1a1a0d",
    roofColor: "#2a2a1a",
    accentColor: "#fbbf24",
    techStack: ["Spring Boot", "FastAPI", "PostgreSQL"]
  },
  {
    id: "skill-game",
    sectionId: "github",
    district: "skills",
    contentId: "Game / XR",
    kind: "arcade",
    name: "Game / XR",
    label: "Arcade",
    description: "Unity, C#, XR/AR 인터랙션, 게임 루프 구현",
    position: [6, 0, 0.5],
    size: [2.64, 2.51, 2.64],
    color: "#2a0d0d",
    roofColor: "#4a1a1a",
    accentColor: "#ff6600",
    techStack: ["Unity", "C#", "XR"]
  },
  {
    id: "skill-workflow",
    sectionId: "github",
    district: "skills",
    contentId: "Workflow",
    kind: "minimal-office",
    name: "Workflow",
    label: "DevOps",
    description: "GitHub, Docker, Nginx, 배포와 협업 흐름",
    position: [2.5, 0, -3],
    size: [1.82, 1.72, 1.62],
    color: "#1a1a1a",
    roofColor: "#2a2a2a",
    accentColor: "#fbbf24",
    techStack: ["GitHub", "Notion", "Docker", "CI/CD"]
  }
];

const experienceBuildings: BuildingData[] = [
  {
    id: "exp-unity-ui",
    sectionId: "experience",
    district: "experience",
    contentId: "Unity UI Implementation",
    kind: "townhouse",
    name: "2025 Unity UI",
    label: "2025",
    description: "게임 UI 상태와 피드백을 구현한 경험",
    position: [7.2, 0, 3],
    size: [1.82, 1.72, 1.61],
    color: "#1a0d2e",
    roofColor: "#3a1a5a",
    accentColor: "#aa44ff",
    techStack: ["Unity", "C#", "게임 UI"]
  },
  {
    id: "exp-demo-platform",
    sectionId: "experience",
    district: "experience",
    contentId: "Interactive Demo Platform",
    kind: "townhouse",
    name: "2025 Demo Platform",
    label: "2025",
    description: "B2B SaaS 데모 흐름과 행동 로그 구조 설계",
    position: [7.2, 0, 6],
    size: [2.65, 2.51, 2.38],
    color: "#0d1a2e",
    roofColor: "#1a3a5a",
    accentColor: "#00d4ff"
  },
  {
    id: "exp-portfolio",
    sectionId: "experience",
    district: "experience",
    contentId: "AI Portfolio Village",
    kind: "townhouse",
    name: "2026 AI Portfolio",
    label: "2026",
    description: "3D 마을을 통해 프로젝트와 기술 경험을 탐색하는 포트폴리오",
    position: [4.5, 0, 7.8],
    size: [3.47, 3.3, 3.14],
    color: "#0d2a1a",
    roofColor: "#1a4a2a",
    accentColor: "#00ff88",
    techStack: ["React", "Three.js", "TypeScript", "FastAPI"]
  }
];

const contactBuilding: BuildingData = {
  id: "post-office",
  sectionId: "contact",
  district: "contact",
  kind: "post",
  name: "연락 우체국",
  label: "Contact",
  description: "이메일, GitHub, 블로그 링크가 모인 연락 공간",
  position: [0, 0, 8.5],
  size: [2.77, 2.51, 2.51],
  color: "#2a1a0d",
  roofColor: "#e07055",
  accentColor: "#ff6600"
};

// 인생/일상 구역 — 운동·투자·학습·음악·연혁·가치관. (지오메트리는 임시, 추후 에셋 교체)
const lifeBuildings: BuildingData[] = [
  {
    id: "life-values",
    sectionId: "life",
    district: "life",
    contentId: "values",
    kind: "minimal-office",
    name: "가치관 비석",
    label: "Values",
    description: "내가 왜 개발하는가 — 일하는 원칙과 가치관.",
    position: [7.5, 0, -6.5],
    size: [1.72, 1.72, 1.72],
    color: "#1a160d",
    roofColor: "#3a2f1a",
    accentColor: "#fbbf24",
    techStack: ["GitHub", "Email", "Blog"]
  },
  {
    id: "life-gym",
    sectionId: "life",
    district: "life",
    contentId: "gym",
    kind: "flat-hub",
    name: "헬스장",
    label: "Fitness",
    description: "운동 스트릭과 오늘의 운동 기록 — 꾸준함의 공간.",
    position: [10, 0, -3.5],
    size: [3.39, 2.51, 3.39],
    color: "#1a0d0d",
    roofColor: "#3a1a1a",
    accentColor: "#ff5a5a",
    techStack: ["운동", "스트릭"]
  },
  {
    id: "life-invest",
    sectionId: "life",
    district: "life",
    contentId: "invest",
    kind: "tower",
    name: "투자 타워",
    label: "Invest",
    description: "포트폴리오 흐름과 시장 분위기 (금액은 비공개).",
    position: [11, 0, 1],
    size: [2.05, 3.3, 2.05],
    color: "#0d2a1a",
    roofColor: "#1a4a2a",
    accentColor: "#34d399",
    techStack: ["투자", "원칙"]
  },
  {
    id: "life-library",
    sectionId: "life",
    district: "life",
    contentId: "library",
    kind: "office-rounded",
    name: "도서관",
    label: "Library",
    description: "읽은 책과 학습 기록 — 오늘의 학습 시간 반영.",
    position: [10, 0, 5],
    size: [2.76, 2.51, 2.76],
    color: "#1f160d",
    roofColor: "#3a2a1a",
    accentColor: "#d9a45b",
    techStack: ["독서", "학습"]
  },
  {
    id: "life-music",
    sectionId: "life",
    district: "life",
    contentId: "music",
    kind: "dome",
    name: "음악 스튜디오",
    label: "Music",
    description: "플레이리스트와 사운드를 모아둔 공간.",
    position: [11, 0, 8.5],
    size: [2.88, 2.51, 2.88],
    color: "#160d2a",
    roofColor: "#2a1a4a",
    accentColor: "#c084fc",
    techStack: ["음악", "오디오"]
  },
  {
    id: "life-timeline",
    sectionId: "life",
    district: "life",
    contentId: "timeline",
    kind: "tower",
    name: "연혁 타임라인",
    label: "Timeline",
    description: "입학·전향·첫 커밋·프로젝트 — 내 인생의 순간들.",
    position: [8.5, 0, 8.5],
    size: [2.53, 4.09, 2.53],
    color: "#0d1a2e",
    roofColor: "#1a3a5a",
    accentColor: "#7eb8ff"
  }
];

// 마을 확장 + 건물 간격 넓힘 — 모든 좌표에 동일 배수 적용
export const SPREAD = 1.45;
export function spread(p: number[]): Vector3Tuple {
  return [Math.round((p[0] ?? 0) * SPREAD * 100) / 100, p[1] ?? 0, Math.round((p[2] ?? 0) * SPREAD * 100) / 100];
}

// 구역별 이동 오프셋 — 구역 내부 간격은 그대로, 구역 덩어리만 광장에서 바깥으로 살짝 밀어 분리감을 준다.
const districtOffset: Record<string, [number, number]> = {
  plaza: [0, 0],
  projects: [-3, 0],      // 서쪽
  skills: [0, -3],        // 북쪽(안쪽)
  experience: [1.5, 2],   // 남동쪽
  life: [3, 0],           // 동쪽
  study: [0, 3],          // 남쪽(앞쪽)
  contact: [0, 1]         // 앞쪽 살짝
};

function applyDistrictOffset(position: Vector3Tuple, district: string): Vector3Tuple {
  const [ox, oz] = districtOffset[district] ?? [0, 0];
  return [position[0] + ox, position[1], position[2] + oz];
}

// 카메라/미니맵이 구역을 가리킬 때 쓰는 view-key → district 매핑
const viewKeyDistrict: Record<string, string> = {
  intro: "plaza",
  projects: "projects",
  github: "skills",
  experience: "experience",
  contact: "contact",
  life: "life",
  study: "study"
};

export const villageBuildings: BuildingData[] = [
  plazaBuilding,
  ...projectBuildings,
  ...skillBuildings,
  ...experienceBuildings,
  ...lifeBuildings,
  ...studyBuildings,
  contactBuilding
].map((b) => ({...b, position: spread(applyDistrictOffset(b.position, b.district))}));

export const treePositions: Vector3Tuple[] = [
  [-8.2, 0, -5.2],
  [-8.2, 0, -1.2],
  [-8.2, 0, 3.0],
  [-8.2, 0, 7.5],
  [-4.8, 0, -5.5],
  [-0.5, 0, -8.2],
  [4.0, 0, -8.2],
  [8.2, 0, -6.0],
  [8.8, 0, 1.5],
  [8.8, 0, 4.8],
  [8.8, 0, 7.5],
  [-3.5, 0, 3.8],
  [1.5, 0, 3.5],
  [-2.5, 0, 9.5],
  [2.5, 0, 9.5],
  [13.5, 0, 2.5],
  [12.5, 0, -6.5],
  [13.5, 0, 11.5]
].map(spread);

export const rockPositions: Vector3Tuple[] = [
  [-4.5, 0, -1.5],
  [-4.5, 0, 3.5],
  [0.5, 0, -4.0],
  [4.0, 0, -1.5],
  [4.0, 0, 2.8],
  [1.5, 0, 6.5],
  [12.5, 0, 6.5]
].map(spread);

const rawCameraTargets: Record<string, {position: Vector3Tuple; lookAt: Vector3Tuple}> = {
  intro: {position: [2, 18, 17], lookAt: [0, 0, 2]},
  projects: {position: [-10, 7, 3], lookAt: [-6.5, 1, 1]},
  github: {position: [3, 8, 0], lookAt: [2, 1, -4.5]},
  experience: {position: [10, 6, 6], lookAt: [7, 1, 5.5]},
  contact: {position: [2, 6, 13], lookAt: [0, 1, 8.5]},
  life: {position: [14, 8, 4], lookAt: [10, 1, 2]},
  study: {position: [0, 8, 17], lookAt: [0, 1, 11.5]}
};

// 카메라 타깃도 같은 구역 오프셋만큼 이동시켜, 분리된 구역 덩어리를 정확히 비추게 한다.
export const cameraTargets: Record<string, {position: Vector3Tuple; lookAt: Vector3Tuple}> = Object.fromEntries(
  Object.entries(rawCameraTargets).map(([key, value]) => {
    const district = viewKeyDistrict[key] ?? "plaza";
    return [
      key,
      {
        position: spread(applyDistrictOffset(value.position, district)),
        lookAt: spread(applyDistrictOffset(value.lookAt, district))
      }
    ];
  })
);
