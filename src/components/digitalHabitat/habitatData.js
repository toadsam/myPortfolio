export {contactLinks} from "../../data/siteData";

export const habitatIntro = {
  title: "The World I Build",
  subtitle:
    "A living system of interfaces, projects, backend flows, simulations, and growth.",
  description:
    "Interfaces, projects, system flows, simulations, and growth records are connected as one digital habitat.",
  ctas: ["Explore System", "View Works"]
};

export const layerOrder = [
  "core",
  "interface",
  "works",
  "systems",
  "simulation",
  "evolution",
  "signal"
];

export const layers = [
  {
    id: "core",
    nav: "Core",
    subtitle: "About Me",
    layerName: "Living Core",
    meaning:
      "My developer identity: connecting systems, interfaces, and interactions into one usable experience.",
    position: [0, 0.8, 0],
    highlights: [
      "Frontend / Full-stack developer",
      "Interface and system thinking",
      "Interaction-focused implementation",
      "Product experience over decoration"
    ],
    cta: "Read core message"
  },
  {
    id: "interface",
    nav: "Interface",
    subtitle: "Frontend Skills",
    layerName: "Interface Layer",
    meaning:
      "The visible layer users touch directly: UI components, responsive layouts, API-connected states, and interaction details.",
    position: [-1.85, 0.64, 0.72],
    highlights: [
      "React",
      "JavaScript",
      "HTML",
      "CSS / SCSS",
      "UI Components",
      "API Integration"
    ],
    cta: "View related works"
  },
  {
    id: "works",
    nav: "Works",
    subtitle: "Main Projects",
    layerName: "Works Modules",
    meaning:
      "Main projects represented as living modules, each connected to the core by data flow and implementation intent.",
    position: [2.0, 0.62, 0.5],
    highlights: ["MuscleUp", "Ajou Campus Foodmap", "ajouchong", "TSEROF"],
    cta: "Open project modules"
  },
  {
    id: "systems",
    nav: "Systems",
    subtitle: "Backend Flow",
    layerName: "System Layer",
    meaning:
      "The lower infrastructure layer: authentication, REST APIs, database cores, deployment nodes, CORS, HTTPS, and debugging.",
    position: [0.88, 0.22, -1.65],
    highlights: [
      "Spring Boot",
      "Java",
      "REST API",
      "JWT",
      "MySQL / PostgreSQL",
      "Deployment"
    ],
    cta: "Inspect system flow"
  },
  {
    id: "simulation",
    nav: "Simulation",
    subtitle: "Game / XR",
    layerName: "Simulation Layer",
    meaning:
      "Unity, VR, AR, and interaction prototypes shown as a test chamber where input becomes playable experience.",
    position: [-1.78, 0.58, -1.25],
    highlights: [
      "Unity",
      "VR horror",
      "AR interaction",
      "Player input",
      "Prototype systems"
    ],
    cta: "Enter simulation"
  },
  {
    id: "evolution",
    nav: "Evolution",
    subtitle: "Growth Log",
    layerName: "Evolution Log",
    meaning:
      "A curved data stream of learning, team projects, backend integration, deployment issues, XR work, and portfolio evolution.",
    position: [0.05, 0.35, 1.95],
    highlights: [
      "Web learning",
      "React UI",
      "Spring API",
      "Team projects",
      "Deployment issues",
      "Unity / XR"
    ],
    cta: "Trace growth"
  },
  {
    id: "signal",
    nav: "Signal",
    subtitle: "Contact",
    layerName: "Signal Node",
    meaning:
      "External connection node for email, GitHub, resume, and future collaboration.",
    position: [0.1, 1.28, -2.25],
    highlights: ["Email", "GitHub", "Resume"],
    cta: "Send signal"
  }
];

export const layerMap = layers.reduce(function buildMap(result, layer) {
  result[layer.id] = layer;
  return result;
}, {});

export const projects = [
  {
    id: "muscleup",
    name: "득근득근 / MuscleUp",
    summary: "운동 루틴과 기록을 관리하는 Web / Full-stack 서비스",
    category: "Web / Full-stack",
    role: "Frontend UI implementation, API-connected states, routine and record flow integration.",
    tech: ["React", "Spring Boot", "Java", "MySQL", "JWT"],
    features: [
      "Workout record flow",
      "Routine cards",
      "Auth / data integration",
      "Progress-oriented UI"
    ],
    problem:
      "운동 기록과 루틴 데이터가 실제 서비스처럼 신뢰감 있게 보이도록 loading, empty, error, connected state를 정리했습니다.",
    learned:
      "Frontend 화면 구조가 API 계약, 인증 흐름, 데이터 상태와 직접 연결된다는 점을 실전 프로젝트에서 익혔습니다.",
    accent: ["#22D3EE", "#2DD4BF"]
  },
  {
    id: "foodmap",
    name: "Ajou Campus Foodmap",
    summary: "아주대학교 주변 음식점을 탐색하는 캠퍼스 지도 서비스",
    category: "Web",
    role: "Map-based UI, place cards, route-like visual hierarchy, frontend data rendering.",
    tech: ["React", "JavaScript", "Map UI", "REST API"],
    features: [
      "3D map plate",
      "Place markers",
      "Route signal",
      "Floating food cards"
    ],
    problem:
      "분산된 위치 정보를 사용자가 빠르게 탐색할 수 있도록 지도, 카드, 필터의 시각적 우선순위를 정리했습니다.",
    learned:
      "위치 기반 서비스에서는 장식보다 탐색 흐름과 정보 밀도가 더 중요하다는 점을 배웠습니다.",
    accent: ["#38BDF8", "#FACC15"]
  },
  {
    id: "ajouchong",
    name: "ajouchong",
    summary: "학과 커뮤니티 / 캠퍼스 정보 공유 서비스",
    category: "Web / Team Project",
    role: "Reusable screens, post/list interaction, API-driven community flow.",
    tech: ["React", "Spring Boot", "REST API", "PostgreSQL"],
    features: [
      "Post cards",
      "Message nodes",
      "Campus communication flow",
      "Team API workflow"
    ],
    problem:
      "여러 기능이 한 서비스처럼 보이도록 공통 컴포넌트와 일관된 인터랙션 패턴을 맞췄습니다.",
    learned:
      "팀 프로젝트에서 화면 일관성, API 계약, 역할 분담이 결과물 완성도에 미치는 영향을 경험했습니다.",
    accent: ["#8B5CF6", "#38BDF8"]
  },
  {
    id: "tserof",
    name: "TSEROF",
    summary: "웹 기반 팀 서비스 / 대시보드형 프로젝트",
    category: "Web / Team Project",
    role: "UI implementation, service structure, dashboard-like visual system.",
    tech: ["React", "SCSS", "JavaScript", "Deployment"],
    features: [
      "Dashboard panel",
      "Chart blocks",
      "Status indicators",
      "Workflow nodes"
    ],
    problem:
      "프로젝트가 포트폴리오에서 신뢰감 있게 보이도록 정보 구조, 간격, 상태 표시를 정리했습니다.",
    learned:
      "작은 UI 디테일과 시각적 계층이 프로젝트의 전문성을 크게 바꾼다는 점을 배웠습니다.",
    accent: ["#A855F7", "#EC4899"]
  }
];

export const systemNodes = [
  ["Auth Gate", "JWT authentication and authorization flow"],
  ["API Nodes", "REST endpoints and request / response design"],
  ["DB Core", "MySQL / PostgreSQL connected data layer"],
  ["Deploy Node", "CORS, HTTPS, environment and deployment issue solving"],
  ["Postman", "API testing and verification workflow"]
];

export const simulations = [
  ["아주대탐험", "Ajou campus exploration indie game prototype"],
  [
    "The Other Side",
    "VR horror interaction concept with camera and hidden elements"
  ],
  ["AR Monster Shooter", "Mobile AR prototype with monster interaction"]
];

export const evolutionLogs = [
  [
    "01",
    "Web development learning",
    "HTML, CSS, JavaScript and basic programming flow."
  ],
  [
    "02",
    "React UI implementation",
    "Component structure, state, responsive layout, and data rendering."
  ],
  [
    "03",
    "Spring Boot API experience",
    "REST API, auth flow, and backend integration."
  ],
  [
    "04",
    "Team project delivery",
    "Collaboration, API contracts, feature ownership, and project delivery."
  ],
  [
    "05",
    "Deployment issue solving",
    "CORS, HTTPS, environment settings, and production debugging."
  ],
  [
    "06",
    "Unity / VR / AR experience",
    "Game interaction, XR prototypes, and simulation logic."
  ],
  [
    "07",
    "3D interactive portfolio",
    "Turning the portfolio into a living digital habitat."
  ]
];
