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
    description:
      "백준·프로그래머스에서 푼 문제와 풀이를 기록하는 코딩테스트 공간",
    position: [-5.22, 0, 3.49],
    size: [2.64, 3.3, 2.64],
    color: "#cfd8e3",
    roofColor: "#3f6fa8",
    accentColor: "#929cf5",
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
    position: [-2.7, 0, 3.49],
    size: [2.76, 2.51, 2.76],
    color: "#ddd4ea",
    roofColor: "#6d4fa0",
    accentColor: "#929cf5",
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
  description:
    "마을 전체의 허브입니다. 처음 방문했다면 여기에서 안내를 확인하세요.",
  position: [0, 0, 0],
  // size 는 **길·충돌·앞마당이 같이 읽는 값**이라 함부로 못 키운다. 기념비를
  // 키우려고 6.6 으로 올렸더니 길 생성기가 이 상자를 피하면서 광장 둘레 도로가
  // 무너졌다(T 20→6, 교차 4→1). 키우는 건 Building.tsx 의 boost 로 따로 한다.
  size: [4.75, 5.54, 4.75],
  color: "#0a1a2e",
  roofColor: "#00d4ff",
  accentColor: "#3fb1ea"
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
    position: [-6.8, 0, -9.25],
    size: [2.05, 3.3, 2.05],
    color: "#0d1f3a",
    roofColor: "#1a3a6a",
    accentColor: "#e88762",
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
    position: [-5.94, 0, -3.16],
    size: [3.1, 1.85, 2.28],
    color: "#1a1a0d",
    roofColor: "#3a3a1a",
    accentColor: "#e88762",
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
    position: [-4.47, 0, -9.25],
    size: [2.88, 2.51, 2.88],
    color: "#dee7f2",
    roofColor: "#4a7fbf",
    accentColor: "#e88762",
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
    position: [-1.95, 0, -3.16],
    size: [1.5, 2.51, 0.92],
    color: "#1a0d2e",
    roofColor: "#3a1a5a",
    accentColor: "#e88762",
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
    position: [-1.9, 0, -9.25],
    size: [2.64, 2.51, 2.64],
    color: "#dbe7c8",
    roofColor: "#5f8c33",
    accentColor: "#e88762",
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
    position: [-4.43, 0, -6.09],
    size: [2.51, 2.51, 2.51],
    color: "#1f0d0d",
    roofColor: "#3a1a1a",
    accentColor: "#e88762",
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
    position: [-6.62, 0, -6.09],
    size: [2.01, 2.51, 2.01],
    color: "#1a0d0d",
    roofColor: "#3a1a1a",
    accentColor: "#e88762",
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
    position: [-2.06, 0, -6.09],
    size: [2.51, 2.51, 2.51],
    color: "#0d0d0d",
    roofColor: "#1a1a1a",
    accentColor: "#e88762",
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
    position: [-3.64, 0, -3.16],
    size: [1.72, 1.72, 1.72],
    color: "#0d1a0d",
    roofColor: "#1a2e1a",
    accentColor: "#e88762",
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
    position: [9.56, 0, -6.21],
    size: [3, 2.51, 3],
    color: "#0d1a2e",
    roofColor: "#0a2a4a",
    accentColor: "#b8a636",
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
    description:
      "Three.js, React Three Fiber, Drei, Framer Motion 기반 인터랙션",
    position: [6.52, 0, -6.21],
    size: [3.8, 3.3, 3.8],
    color: "#1a0d2e",
    roofColor: "#2a1a4a",
    accentColor: "#b8a636",
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
    position: [3.6, 0, -6.21],
    size: [2.68, 4.09, 3.12],
    color: "#1a1a0d",
    roofColor: "#2a2a1a",
    accentColor: "#b8a636",
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
    position: [5.71, 0, -2.66],
    size: [2.64, 2.51, 2.64],
    color: "#2a0d0d",
    roofColor: "#4a1a1a",
    accentColor: "#b8a636",
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
    position: [7.88, 0, -2.66],
    size: [1.82, 1.72, 1.62],
    color: "#1a1a1a",
    roofColor: "#2a2a2a",
    accentColor: "#b8a636",
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
    position: [-8.26, 0, -1.23],
    size: [1.82, 1.72, 1.61],
    color: "#1a0d2e",
    roofColor: "#3a1a5a",
    accentColor: "#c889d7",
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
    position: [-6.71, 0, 1.69],
    size: [2.65, 2.51, 2.38],
    color: "#0d1a2e",
    roofColor: "#1a3a5a",
    accentColor: "#c889d7"
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
    position: [-9.5, 0, 1.69],
    size: [3.47, 3.3, 3.14],
    color: "#0d2a1a",
    roofColor: "#1a4a2a",
    accentColor: "#c889d7",
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
  // z 8.03 → 10.7 (격자 두 칸). 구역 단은 격자에 스냅되므로 한 칸으론 부족하다 — 구역 밀어내기는 **원점에서 바깥으로** 미는 거라, 방향이 비슷한
  // 이웃끼리는 안 벌어진다. contact(67°)와 life(37°)가 그랬다 — 둘의 단이 1.88
  // 겹쳐 골짜기가 사라졌고, 그러면 그 사이엔 물길도 축대 턱도 안 생긴다.
  // 우체국은 이 구역의 유일한 건물이라 이 한 줄로 골짜기가 열린다.
  position: [3.43, 0, 10.7],
  size: [2.77, 2.51, 2.51],
  color: "#f0e2cc",
  roofColor: "#c2502e",
  accentColor: "#e9808f"
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
    position: [5.94, 0, 1.4],
    size: [1.72, 1.72, 1.72],
    color: "#efe4c6",
    roofColor: "#b8862f",
    accentColor: "#dc9243",
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
    position: [5.98, 0, 4.84],
    size: [3.39, 2.51, 3.39],
    color: "#1a0d0d",
    roofColor: "#3a1a1a",
    accentColor: "#dc9243",
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
    position: [5.85, 0, 8.2],
    size: [2.05, 3.3, 2.05],
    color: "#d6ead9",
    roofColor: "#2f8a63",
    accentColor: "#dc9243",
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
    position: [3.77, 0, 1.4],
    size: [2.76, 2.51, 2.76],
    color: "#ecdcc2",
    roofColor: "#8a5a2f",
    accentColor: "#dc9243",
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
    position: [3.14, 0, 4.84],
    size: [2.88, 2.51, 2.88],
    color: "#160d2a",
    roofColor: "#2a1a4a",
    accentColor: "#dc9243",
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
    position: [3.64, 0, 8.2],
    size: [2.53, 4.09, 2.53],
    color: "#dde6f0",
    roofColor: "#3f6a96",
    accentColor: "#dc9243"
  }
];

// ─── 건물 크기와 간격은 **짝으로 움직인다** ──────────────────────────────────
// "건물이 전반적으로 작아 보인다"는 진단으로 크기를 키우려 했는데, 재 보니
// 건물 평균 높이는 이미 캐릭터의 2.61배로 정상 비율이었다. 진짜 문제는
// **이웃 간 여유가 0.5유닛뿐**이라는 것 — 어깨 폭도 안 되는 틈에 집이 붙어
// 있으면 덩어리 하나로 읽혀 개별 건물이 작아 보인다.
//
// 그래서 크기만 올리면 바로 겹치고(1.3배에서 14쌍), 간격만 벌리면 건물은
// 그대로인 채 잔디만 넓어진다. 둘을 같이 올려야 한다.
// 조합은 `node scripts/check-building-clearance.mjs --solve` 로 구한다.
//
// 지금 값: 크기 1.4배 ↔ SPREAD 1.86 ↔ 구역 밀어내기 0.7배.
// 이웃 간 최악 여유 0.72유닛(사람이 지나갈 폭), 캐릭터 대비 3.66배.
//
// ── 왜 밀어내기를 0.7 로 줄이면서 SPREAD 를 키우나 ─────────────────────────
// 벌려야 하는 건 **한 구역 안 건물끼리**의 간격이지 구역과 구역 사이가 아니다.
// SPREAD 만 키우면 구역 사이 골짜기까지 같이 벌어져 마을이 통째로 퍼지고,
// 그러면 해자·잔디원반·파고다 섬까지 줄줄이 밀어야 한다.
// 밀어내기를 같이 줄이면 골짜기 폭은 원래대로 유지된다 —
// 월드 기준 밀어내기 = DISTRICT_PUSH × 0.7 × 1.86 = 5.99 로, 예전 6.07 과 거의 같다.
// (골짜기는 물길이 흐르고 축대가 옆에서 보이는 자리라 좁아지면 안 된다)

// 마을 확장 + 건물 간격 넓힘 — 모든 좌표에 동일 배수 적용
// 컨셉 아트의 건물은 처마가 서로 겹칠 만큼 붙어 있다. 1.45 는 그에 비해
// 성겼다 — 1.32 로 6% 좁혔다. 더 줄여도 상자는 안 겹치고(1.28 까지 확인) 길도
// 다 닿지만, 앞마당 원반이 서로 먹기 시작해 길 칸이 깎인다.
export const SPREAD = 1.86;
export function spread(p: number[]): Vector3Tuple {
  return [
    Math.round((p[0] ?? 0) * SPREAD * 100) / 100,
    p[1] ?? 0,
    Math.round((p[2] ?? 0) * SPREAD * 100) / 100
  ];
}

/**
 * 건물 치수 배율. **1 로 되돌리면 예전 크기 그대로다.**
 *
 * 27채의 size 리터럴을 하나하나 고치지 않고 여기서 한 번에 곱한다 — 값을
 * 되돌리거나 다시 시험할 때 숫자 하나만 만지면 되도록. `spread` 와 같은 방식이다.
 *
 * **바닥·장식물 생성기도 이 값을 읽는다**(scripts/lib/read-village.mjs).
 * 여기만 바꾸고 생성기를 안 돌리면 건물만 커지고 앞마당·길 폭은 옛날 크기로
 * 남는다 — 건물이 제 앞마당을 삐져나온다.
 */
export const BUILDING_SCALE = 1.4;
function scaleSize(s: Vector3Tuple): Vector3Tuple {
  return [
    Math.round(s[0] * BUILDING_SCALE * 100) / 100,
    Math.round(s[1] * BUILDING_SCALE * 100) / 100,
    Math.round(s[2] * BUILDING_SCALE * 100) / 100
  ];
}

// ─── 구역을 광장 둘레의 같은 고리 위에 올린다 ────────────────────────────────
// 컨셉 아트의 마을은 여섯 구역이 광장을 한 고리로 두른다. 여기는 구역이
// 광장에서 시작하는 거리가 제각각이었다 — LIFE 9.2, SKILLS 11.9,
// EXPERIENCE 18.7, CONTACT 26.5. 광장과 EXPERIENCE 사이에 아홉 칸짜리 빈
// 잔디가 있으니 "광장을 두른다"로 안 읽히고, 구역들을 잇는 순환 도로가
// 지나갈 일정한 띠도 없었다.
//
// 맞추는 기준은 무게중심이 아니라 **안쪽 가장자리**다. 건물이 아홉 채인
// PROJECTS 와 한 채인 CONTACT 는 덩어리 크기가 달라 무게중심을 맞출 수 없다.
// 고리로 읽히게 하는 건 광장에서 보이는 앞줄이고, 바깥 끝은 구역이 큰 만큼
// 뻗어도 자연스럽다 — 컨셉 아트도 그렇다.
//
// ── 왜 규칙이 아니라 표인가 ─────────────────────────────────────────────────
// 전에는 배치 규칙(구역 무게중심 방향으로 DISTRICT_PUSH 만큼 밀기)이 여기와
// scripts/lib/read-village.mjs 에 **각각 구현**돼 있었다. 규칙을 손볼 때마다
// 두 곳을 같이 고쳐야 하고, 한 번이라도 빠뜨리면 앱과 배치 생성기가 서로 다른
// 마을을 본다. 계산은 scripts/solve-district-ring.mjs 한 곳에 두고 결과만
// 여기에 적는다 — 씬도 생성기도 이 표를 **읽기만** 한다.
//
// **표를 손으로 고치지 마세요.** 건물 크기·SPREAD·구역 구성을 바꿨다면:
//   node scripts/solve-district-ring.mjs --write
// (check-village.mjs 가 표가 낡았는지 매번 검사한다)

/**
 * 구역이 광장에서 시작하는 거리(월드). 순환 도로가 이 안쪽 띠를 지난다.
 *
 * 14 인 이유는 **건물이 아니라 단차 블록** 때문이다. 블록은 구역 건물을 감싼
 * 사각형을 격자(1.88)에 스냅해서 만드는데, 그러느라 건물보다 최대 2.82 더
 * 안쪽까지 내려온다. 12.5 로 뒀을 때 블록이 r 9.3 까지 내려와 광장 둘레를
 * 거의 닫아 버렸고, 골짜기로 낼 물길이 6곳 중 4곳에서 r≈10 에 막혔다.
 * 14 면 블록이 10.7 에서 멈춰 광장(7.7)과의 사이에 띠가 남고, 골짜기도
 * 3.76 → 5.64 로 넓어진다. 14.5 부터는 건물이 해자를 넘는다.
 */
export const DISTRICT_INNER = 15.5;

/** 구역별 이동 벡터(월드). solve-district-ring.mjs 가 적는다. */
const districtShift: Record<string, [number, number]> = {
  projects: [-2.84, -9.29],
  skills: [5.15, -3.71],
  life: [9.23, 5.29],
  contact: [-6.36, -2.64],
  study: [-5.82, 8.13],
  experience: [-4.87, -2.46]
};

const round2 = (v: number) => Math.round(v * 100) / 100;

/** 원본 좌표 → 월드 좌표. read-village.mjs 의 readVillage 와 같은 식이다. */
function placeInDistrict(
  position: Vector3Tuple,
  district: string
): Vector3Tuple {
  const [sx, sz] = districtShift[district] ?? [0, 0]; // plaza 는 안 움직인다
  return [
    round2((position[0] ?? 0) * SPREAD + sx),
    position[1] ?? 0,
    round2((position[2] ?? 0) * SPREAD + sz)
  ];
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
].map(b => ({
  ...b,
  position: placeInDistrict(b.position, b.district),
  size: scaleSize(b.size)
}));

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

const rawCameraTargets: Record<
  string,
  {position: Vector3Tuple; lookAt: Vector3Tuple}
> = {
  intro: {position: [2, 18, 17], lookAt: [0, 0, 2]},
  projects: {position: [-10, 7, 3], lookAt: [-6.5, 1, 1]},
  github: {position: [3, 8, 0], lookAt: [2, 1, -4.5]},
  experience: {position: [10, 6, 6], lookAt: [7, 1, 5.5]},
  contact: {position: [2, 6, 13], lookAt: [0, 1, 8.5]},
  life: {position: [14, 8, 4], lookAt: [10, 1, 2]},
  study: {position: [0, 8, 17], lookAt: [0, 1, 11.5]}
};

// 카메라 타깃도 건물과 **같은 변환**을 태워, 옮겨진 구역 덩어리를 정확히 비추게 한다.
export const cameraTargets: Record<
  string,
  {position: Vector3Tuple; lookAt: Vector3Tuple}
> = Object.fromEntries(
  Object.entries(rawCameraTargets).map(([key, value]) => {
    const district = viewKeyDistrict[key] ?? "plaza";
    return [
      key,
      {
        position: placeInDistrict(value.position, district),
        lookAt: placeInDistrict(value.lookAt, district)
      }
    ];
  })
);
