import React, {useEffect, useRef, useState} from "react";
import "./portfolio.css";

const sections = [
  {id: "intro", number: "01", label: "Intro"},
  {id: "skills", number: "02", label: "Skills"},
  {id: "projects", number: "03", label: "Projects"},
  {id: "detail", number: "04", label: "Project Detail"},
  {id: "sub-projects", number: "05", label: "Sub Projects"},
  {id: "contact", number: "06", label: "Contact"}
];

const treeSections = {
  intro: {x: 20, y: 32, secondaryX: 68, secondaryY: 18, mode: "seed"},
  skills: {x: 52, y: 33, secondaryX: 84, secondaryY: 42, mode: "branch"},
  projects: {x: 72, y: 47, secondaryX: 28, secondaryY: 68, mode: "canopy"},
  detail: {x: 58, y: 63, secondaryX: 78, secondaryY: 74, mode: "ring"},
  "sub-projects": {x: 38, y: 74, secondaryX: 66, secondaryY: 82, mode: "sprout"},
  contact: {x: 28, y: 84, secondaryX: 56, secondaryY: 58, mode: "root"}
};

const treeSkillAreas = {
  frontend: {x: 48, y: 28, secondaryX: 34, secondaryY: 42, mode: "leaf"},
  backend: {x: 64, y: 34, secondaryX: 74, secondaryY: 52, mode: "xylem"},
  game: {x: 82, y: 30, secondaryX: 66, secondaryY: 68, mode: "spark"}
};

const livingTreePaths = {
  trunk: "M12 100 C16 82 24 63 39 48 C49 38 55 29 63 17",
  frontend: "M39 48 C49 39 59 31 71 25 C81 20 90 18 99 13",
  backend: "M40 52 C53 48 65 45 78 40 C87 37 94 33 100 28",
  game: "M38 57 C52 59 66 63 78 70 C88 76 95 82 100 89",
  rootA: "M12 100 C23 92 36 88 51 88 C68 88 82 83 100 77",
  rootB: "M12 100 C8 92 4 84 0 75",
  rootC: "M12 100 C18 92 18 84 27 76 C35 70 43 70 55 69",
  canopyA: "M60 20 C66 14 74 10 84 9 C91 9 96 11 100 14",
  canopyB: "M55 30 C64 24 73 23 83 25 C91 27 96 31 100 36",
  canopyC: "M56 56 C67 56 78 61 87 70 C94 77 98 84 100 92"
};

const livingTreeLeaves = [
  {id: "leaf-01", x: "68%", y: "16%", size: "21px", rotate: "-24deg", delay: "-1.2s"},
  {id: "leaf-02", x: "76%", y: "13%", size: "17px", rotate: "18deg", delay: "-4.2s"},
  {id: "leaf-03", x: "86%", y: "17%", size: "20px", rotate: "-8deg", delay: "-6.1s"},
  {id: "leaf-04", x: "62%", y: "25%", size: "15px", rotate: "36deg", delay: "-2.7s"},
  {id: "leaf-05", x: "72%", y: "30%", size: "18px", rotate: "-38deg", delay: "-5.5s"},
  {id: "leaf-06", x: "86%", y: "33%", size: "16px", rotate: "24deg", delay: "-8.1s"},
  {id: "leaf-07", x: "66%", y: "55%", size: "14px", rotate: "-18deg", delay: "-3.3s"},
  {id: "leaf-08", x: "76%", y: "63%", size: "19px", rotate: "14deg", delay: "-6.8s"},
  {id: "leaf-09", x: "88%", y: "72%", size: "16px", rotate: "-32deg", delay: "-9.4s"},
  {id: "leaf-10", x: "32%", y: "67%", size: "13px", rotate: "28deg", delay: "-7.3s"},
  {id: "leaf-11", x: "44%", y: "83%", size: "16px", rotate: "-16deg", delay: "-5.9s"},
  {id: "leaf-12", x: "56%", y: "86%", size: "14px", rotate: "34deg", delay: "-2.1s"}
];

const livingFireflies = [
  {id: "fly-01", x: "14%", y: "64%", size: "7px", dx: "72px", dy: "-48px", duration: "14s", delay: "-1s"},
  {id: "fly-02", x: "21%", y: "44%", size: "5px", dx: "-42px", dy: "-66px", duration: "17s", delay: "-8s"},
  {id: "fly-03", x: "32%", y: "78%", size: "9px", dx: "88px", dy: "-34px", duration: "18s", delay: "-4s"},
  {id: "fly-04", x: "42%", y: "36%", size: "6px", dx: "-56px", dy: "42px", duration: "15s", delay: "-11s"},
  {id: "fly-05", x: "54%", y: "22%", size: "8px", dx: "78px", dy: "58px", duration: "19s", delay: "-6s"},
  {id: "fly-06", x: "63%", y: "58%", size: "5px", dx: "-68px", dy: "-52px", duration: "13s", delay: "-3s"},
  {id: "fly-07", x: "71%", y: "19%", size: "9px", dx: "54px", dy: "78px", duration: "20s", delay: "-13s"},
  {id: "fly-08", x: "83%", y: "41%", size: "7px", dx: "-82px", dy: "42px", duration: "16s", delay: "-7s"},
  {id: "fly-09", x: "91%", y: "69%", size: "5px", dx: "-62px", dy: "-70px", duration: "18s", delay: "-15s"},
  {id: "fly-10", x: "49%", y: "88%", size: "7px", dx: "48px", dy: "-86px", duration: "21s", delay: "-10s"},
  {id: "fly-11", x: "18%", y: "22%", size: "5px", dx: "84px", dy: "42px", duration: "16s", delay: "-5s"},
  {id: "fly-12", x: "73%", y: "83%", size: "7px", dx: "-92px", dy: "-34px", duration: "22s", delay: "-17s"},
  {id: "fly-13", x: "38%", y: "18%", size: "6px", dx: "66px", dy: "64px", duration: "15s", delay: "-9s"},
  {id: "fly-14", x: "58%", y: "72%", size: "9px", dx: "-48px", dy: "-74px", duration: "19s", delay: "-12s"},
  {id: "fly-15", x: "8%", y: "84%", size: "5px", dx: "80px", dy: "-56px", duration: "17s", delay: "-14s"},
  {id: "fly-16", x: "94%", y: "23%", size: "7px", dx: "-72px", dy: "64px", duration: "18s", delay: "-2s"},
  {id: "fly-17", x: "27%", y: "58%", size: "7px", dx: "58px", dy: "-80px", duration: "20s", delay: "-16s"},
  {id: "fly-18", x: "79%", y: "55%", size: "5px", dx: "-74px", dy: "-44px", duration: "14s", delay: "-6s"},
  {id: "fly-19", x: "11%", y: "39%", size: "8px", dx: "96px", dy: "22px", duration: "23s", delay: "-19s"},
  {id: "fly-20", x: "25%", y: "82%", size: "6px", dx: "-46px", dy: "-88px", duration: "18s", delay: "-2.8s"},
  {id: "fly-21", x: "34%", y: "30%", size: "10px", dx: "64px", dy: "-52px", duration: "24s", delay: "-21s"},
  {id: "fly-22", x: "46%", y: "65%", size: "6px", dx: "-78px", dy: "48px", duration: "16s", delay: "-9.6s"},
  {id: "fly-23", x: "52%", y: "43%", size: "8px", dx: "94px", dy: "-62px", duration: "21s", delay: "-14.4s"},
  {id: "fly-24", x: "61%", y: "14%", size: "5px", dx: "-38px", dy: "92px", duration: "18s", delay: "-7.6s"},
  {id: "fly-25", x: "69%", y: "74%", size: "10px", dx: "52px", dy: "-78px", duration: "25s", delay: "-12.3s"},
  {id: "fly-26", x: "77%", y: "33%", size: "6px", dx: "-96px", dy: "54px", duration: "19s", delay: "-4.8s"},
  {id: "fly-27", x: "87%", y: "86%", size: "8px", dx: "-70px", dy: "-82px", duration: "22s", delay: "-16.7s"},
  {id: "fly-28", x: "96%", y: "52%", size: "5px", dx: "-104px", dy: "18px", duration: "15s", delay: "-6.4s"},
  {id: "fly-29", x: "6%", y: "18%", size: "7px", dx: "82px", dy: "76px", duration: "20s", delay: "-11.2s"},
  {id: "fly-30", x: "43%", y: "93%", size: "6px", dx: "74px", dy: "-94px", duration: "24s", delay: "-18.6s"}
];

const cursorFireflies = [
  {id: "cursor-fly-01", size: "12px", orbitX: "54px", orbitY: "-42px", orbitX2: "34px", orbitY2: "28px", orbitX3: "-28px", orbitY3: "42px", orbitX4: "-30px", orbitY4: "-24px", delay: "-0.8s", duration: "7.4s", follow: "0.68s"},
  {id: "cursor-fly-02", size: "9px", orbitX: "-72px", orbitY: "34px", orbitX2: "-26px", orbitY2: "-38px", orbitX3: "42px", orbitY3: "-32px", orbitX4: "22px", orbitY4: "34px", delay: "-3.1s", duration: "9.2s", follow: "1.04s"},
  {id: "cursor-fly-03", size: "7px", orbitX: "32px", orbitY: "74px", orbitX2: "-54px", orbitY2: "16px", orbitX3: "-18px", orbitY3: "-66px", orbitX4: "48px", orbitY4: "-14px", delay: "-4.7s", duration: "8.4s", follow: "1.32s"}
];

const simpleIconBaseUrl = "https://cdn.simpleicons.org/";

const skillLogoSlugs = {
  "C#": "dotnet",
  Docker: "docker",
  Figma: "figma",
  "Framer Motion": "framer",
  Git: "git",
  GitHub: "github",
  "GitHub Actions": "githubactions",
  Java: "openjdk",
  JavaScript: "javascript",
  MySQL: "mysql",
  "Next.js": "nextdotjs",
  "Node.js": "nodedotjs",
  PostgreSQL: "postgresql",
  Postman: "postman",
  Python: "python",
  React: "react",
  Redis: "redis",
  "Socket.io": "socketdotio",
  "Spring Boot": "springboot",
  SQL: "postgresql",
  "Tailwind CSS": "tailwindcss",
  TypeScript: "typescript",
  Unity: "unity/111111"
};

const skillAreas = [
  {
    id: "frontend",
    label: "Frontend",
    icon: "screen",
    accent: "#2fbd5f",
    title: "From web services\nto game systems.",
    intro: "사용자에게 직접 보이는 화면과 인터랙션을 깔끔한 컴포넌트 구조와 부드러운 움직임으로 구현합니다.",
    summary: "Build responsive, accessible interfaces with great UX.",
    short: "User-facing interfaces with motion and structure.",
    bullets: [
      "Component-driven UI architecture",
      "Performance optimization",
      "Responsive & accessible design",
      "Modern tooling & workflows"
    ],
    tags: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"],
    languages: ["JavaScript", "TypeScript"],
    tools: ["Git", "GitHub", "Figma", "Framer Motion"],
    projects: ["FestFlow", "MyWave", "Portfolio", "UI Motion Lab"],
    projectSkill: "React"
  },
  {
    id: "backend",
    label: "Backend",
    icon: "server",
    accent: "#2fbd5f",
    title: "From APIs\nto reliable systems.",
    intro: "서비스 로직, API, 데이터 흐름을 설계하며 안정적인 제품 경험을 뒷받침하는 구조를 만듭니다.",
    summary: "Design reliable APIs and scalable server-side systems.",
    short: "Service logic, data flow, and scalable APIs.",
    bullets: [
      "REST API design",
      "Authentication & authorization",
      "Database modeling",
      "Service layer architecture",
      "Realtime event handling"
    ],
    tags: ["Spring Boot", "Node.js", "REST API", "PostgreSQL", "MySQL", "Redis", "Socket.io"],
    languages: ["Java", "JavaScript", "SQL", "Python"],
    tools: ["Docker", "AWS", "Postman", "GitHub Actions", "GitHub"],
    projects: ["Demotion", "MetricHub", "API Gateway", "Admin CMS"],
    projectSkill: "Spring Boot"
  },
  {
    id: "game",
    label: "Game Development",
    icon: "gamepad",
    accent: "#2fbd5f",
    title: "From input\nto playable systems.",
    intro: "플레이어의 입력, 상호작용, 게임 로직을 구현하며 반응성 있고 재미있는 게임 시스템을 만듭니다.",
    summary: "Create engaging gameplay systems and interactive experiences.",
    short: "Gameplay loops, interaction systems, and prototypes.",
    bullets: [
      "Player input & interaction",
      "Physics-based mechanics",
      "Inventory / quest / reward systems",
      "Game UI implementation",
      "Prototype and iteration"
    ],
    tags: ["Unity", "C#", "Physics", "Game Logic", "UI", "Interaction"],
    languages: ["C#"],
    tools: ["Unity", "Git", "GitHub", "Figma"],
    projects: ["Void Runners", "Farm DTx", "Pixel Adventure", "AR Demo"],
    projectSkill: "Unity"
  }
];

const languageItems = [
  {name: "JavaScript", slug: "javascript", color: "#f7df1e"},
  {name: "TypeScript", slug: "typescript", color: "#3178c6"},
  {name: "Java", slug: "openjdk", color: "#e11d2e"},
  {name: "C#", slug: "dotnet", color: "#512bd4"},
  {name: "SQL", slug: "postgresql", color: "#4169e1"},
  {name: "Python", slug: "python", color: "#3776ab"}
];

const toolItems = [
  {name: "Git", slug: "git", color: "#f05032", tooltip: "Version control and branching workflow"},
  {name: "GitHub", slug: "github", color: "#181717", tooltip: "Repository collaboration and reviews"},
  {name: "Docker", slug: "docker", color: "#2496ed", tooltip: "Containerized development and deployment"},
  {
    name: "AWS",
    color: "#ff9900",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    tooltip: "Cloud deployment and service operations"
  },
  {name: "Figma", slug: "figma", color: "#f24e1e", tooltip: "UI design and handoff"},
  {name: "Postman", slug: "postman", color: "#ff6c37", tooltip: "API testing and documentation"},
  {name: "Unity", slug: "unity/111111", color: "#111111", tooltip: "Gameplay systems and interactive prototypes"},
  {name: "GitHub Actions", slug: "githubactions", color: "#2088ff", tooltip: "CI checks and release workflows"},
  {name: "Framer Motion", slug: "framer", color: "#0055ff", tooltip: "Motion design for interface feedback"}
];

const projects = [
  {
    id: "festflow",
    title: "FestFlow",
    category: "Full-stack",
    tags: ["React", "Spring Boot", "Socket.io", "AWS"],
    description: "축제 정보를 모으고 실시간 소통을 돕는 커뮤니티 플랫폼.",
    metric: "2,300+ users",
    color: "#31c36b"
  },
  {
    id: "rpg-eclipse",
    title: "RPG: Project Eclipse",
    category: "Game",
    tags: ["Unity", "C#", "Photon"],
    description: "탐험, 전투, 성장 루프를 가진 3D RPG 프로토타입.",
    metric: "12 stages",
    color: "#5575ff"
  },
  {
    id: "battle-arena",
    title: "Battle Arena",
    category: "Game",
    tags: ["Unity", "C#", "Socket.io"],
    description: "짧은 세션에 집중한 실시간 아레나 전투 실험.",
    metric: "60 fps",
    color: "#ff8c42"
  },
  {
    id: "api-server",
    title: "API Gateway",
    category: "Tool",
    tags: ["Node.js", "REST API", "AWS"],
    description: "서비스별 API 요청을 정리하는 인증/라우팅 게이트웨이.",
    metric: "99.9% uptime",
    color: "#21a67a"
  },
  {
    id: "portfolio-v1",
    title: "Portfolio v1",
    category: "Web",
    tags: ["React", "Figma", "Tailwind CSS"],
    description: "프로젝트 맥락과 코드 과정을 보여주는 인터랙티브 포트폴리오.",
    metric: "A score",
    color: "#35c47b"
  },
  {
    id: "dev-blog",
    title: "Dev Blog",
    category: "Web",
    tags: ["Next.js", "TypeScript", "GitHub Actions"],
    description: "개발 기록과 실험을 쌓는 정적 블로그 시스템.",
    metric: "42 notes",
    color: "#161d1a"
  },
  {
    id: "weather-dashboard",
    title: "Weather Dashboard",
    category: "Experiment",
    tags: ["React", "TypeScript", "REST API"],
    description: "날씨 데이터를 카드와 그래프로 읽기 쉽게 시각화.",
    metric: "4 APIs",
    color: "#48b9e7"
  },
  {
    id: "asset-store",
    title: "Asset Store",
    category: "Tool",
    tags: ["Spring Boot", "MySQL", "Docker"],
    description: "게임 에셋을 태그, 버전, 상태 기준으로 관리하는 내부 도구.",
    metric: "180 assets",
    color: "#a577ff"
  }
];

const subProjects = [
  ["Pixel Adventure", "2D Platformer Game", "Unity", "Game"],
  ["Weather Dashboard", "Realtime weather dashboard", "React", "Web"],
  ["API Gateway", "Microservice routing gateway", "Node.js", "Tool"],
  ["Dev Blog", "Writing system for build notes", "Next.js", "Web"],
  ["Memory Puzzle", "Small puzzle game loop", "Unity", "Game"],
  ["Chat Application", "Realtime chat service", "Socket.io", "Experiment"],
  ["Portfolio v1", "Previous interactive portfolio", "React", "Experiment"],
  ["Asset Store", "Game asset management tool", "Spring Boot", "Tool"]
];

const codeSnippets = {
  frontend: [
    "function FestivalCard({ data, onSelect }) {",
    "  return (",
    "    <article className=\"card\" onClick={() => onSelect(data.id)}>",
    "      <img src={data.image} />",
    "      <h3>{data.title}</h3>",
    "      <StatusBadge value={data.realtimeStatus} />",
    "    </article>",
    "  );",
    "}"
  ],
  backend: [
    "@GetMapping(\"/api/festivals/{id}\")",
    "public ResponseEntity<FestivalDto> getFestival(@PathVariable Long id) {",
    "  Festival festival = festivalService.findDetail(id);",
    "  return ResponseEntity.ok(FestivalDto.from(festival));",
    "}"
  ],
  database: [
    "SELECT festival_id, COUNT(*) AS views, AVG(rating) AS score",
    "FROM festival_logs",
    "WHERE created_at >= NOW() - INTERVAL '7 days'",
    "GROUP BY festival_id",
    "ORDER BY views DESC",
    "LIMIT 10;"
  ],
  game: [
    "public class PlayerController : MonoBehaviour {",
    "  void Update() {",
    "    Vector3 input = ReadMovementInput();",
    "    character.Move(input * moveSpeed * Time.deltaTime);",
    "    interaction.TryInteract(currentTarget);",
    "  }",
    "}"
  ]
};

const detailSections = [
  {id: "detail-overview", number: "01", label: "Overview"},
  {id: "detail-problem", number: "02", label: "Problem"},
  {id: "detail-solution", number: "03", label: "Solution"},
  {id: "detail-role", number: "04", label: "My Role"},
  {id: "detail-code", number: "05", label: "Code"},
  {id: "detail-features", number: "06", label: "Features"},
  {id: "detail-flow", number: "07", label: "UI Flow"},
  {id: "detail-results", number: "08", label: "Results"},
  {id: "detail-learned", number: "09", label: "What I Learned"}
];

function scrollToSection(id) {
  const target = document.getElementById(id);

  if (target) {
    target.scrollIntoView({behavior: "smooth", block: "start"});
  }
}

function usePointer() {
  const [pointer, setPointer] = useState({x: 0, y: 0, rawX: -200, rawY: -200});

  useEffect(function attachPointer() {
    function handleMove(event) {
      setPointer({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
        rawX: event.clientX,
        rawY: event.clientY
      });
    }

    window.addEventListener("mousemove", handleMove);
    return function cleanup() {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return pointer;
}

function useActiveSection() {
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(function observeSections() {
    const nodes = sections
      .map(function mapSection(section) {
        return document.getElementById(section.id);
      })
      .filter(Boolean);

    const observer = new IntersectionObserver(
      function onIntersect(entries) {
        entries.forEach(function each(entry) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {rootMargin: "-42% 0px -42% 0px", threshold: 0.01}
    );

    nodes.forEach(function observe(node) {
      observer.observe(node);
    });

    return function cleanup() {
      observer.disconnect();
    };
  }, []);

  return activeId;
}

function CursorGlow(props) {
  const {pointer, variant} = props;
  const scaleMap = {
    button: 2.2,
    card: 3,
    code: 1.6,
    game: 2.8,
    default: 1
  };
  const scale = scaleMap[variant] || scaleMap.default;

  return (
    <div
      aria-hidden="true"
      className={"cursor-glow is-" + (variant || "default")}
      style={{
        transform: "translate3d("
          .concat(pointer.rawX, "px, ")
          .concat(pointer.rawY, "px, 0) translate(-50%, -50%) scale(")
          .concat(scale, ")")
      }}
    />
  );
}

function LivingTreeLayer(props) {
  const {activeAreaId, activeId, pointer, pulse} = props;
  const sectionFocus = treeSections[activeId] || treeSections.intro;
  const skillFocus = activeId === "skills" ? treeSkillAreas[activeAreaId] : null;
  const focus = skillFocus || sectionFocus;
  const pointerX = pointer ? pointer.x : 0;
  const pointerY = pointer ? pointer.y : 0;
  const cursorX = pointer && typeof pointer.rawX === "number" ? pointer.rawX : -200;
  const cursorY = pointer && typeof pointer.rawY === "number" ? pointer.rawY : -200;
  const pulseType = pulse ? pulse.type || "button" : "idle";

  return (
    <div
      aria-hidden="true"
      className={[
        "living-tree-layer",
        "is-" + focus.mode,
        pulse ? "has-pulse" : "",
        activeId ? "is-section-" + activeId : "",
        skillFocus ? "is-skill-" + activeAreaId : ""
      ].join(" ").trim()}
      style={{
        "--tree-x": focus.x + "%",
        "--tree-y": focus.y + "%",
        "--tree-secondary-x": focus.secondaryX + "%",
        "--tree-secondary-y": focus.secondaryY + "%",
        "--cursor-light-x": cursorX + "px",
        "--cursor-light-y": cursorY + "px",
        "--tree-drift-x": pointerX * 18 + "px",
        "--tree-drift-y": pointerY * 18 + "px",
        "--tree-drift-soft-x": pointerX * -10 + "px",
        "--tree-drift-soft-y": pointerY * -10 + "px",
        "--pulse-x": pulse ? pulse.x + "px" : "-200px",
        "--pulse-y": pulse ? pulse.y + "px" : "-200px"
      }}
    >
      <svg className="living-tree-organism" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="living-tree-bark-gradient" x1="0%" x2="100%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(49, 68, 45, 0.28)" />
            <stop offset="42%" stopColor="rgba(31, 104, 55, 0.42)" />
            <stop offset="100%" stopColor="rgba(47, 189, 95, 0.26)" />
          </linearGradient>
          <linearGradient id="living-tree-sap-gradient" x1="0%" x2="100%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(47, 189, 95, 0)" />
            <stop offset="44%" stopColor="rgba(104, 238, 143, 0.86)" />
            <stop offset="56%" stopColor="rgba(224, 255, 229, 0.95)" />
            <stop offset="100%" stopColor="rgba(47, 189, 95, 0)" />
          </linearGradient>
          <filter id="living-tree-runner-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="living-tree-shadow living-tree-shadow--trunk" d={livingTreePaths.trunk} />
        <path className="living-tree-shadow living-tree-shadow--root" d={livingTreePaths.rootA} />
        <path className="living-tree-shadow living-tree-shadow--branch" d={livingTreePaths.frontend} />
        <path className="living-tree-shadow living-tree-shadow--branch" d={livingTreePaths.backend} />
        <path className="living-tree-shadow living-tree-shadow--branch" d={livingTreePaths.game} />
        <path className="living-tree-wood living-tree-trunk" id="living-tree-path-trunk" d={livingTreePaths.trunk} />
        <path className="living-tree-wood living-tree-root root--a" id="living-tree-path-root-a" d={livingTreePaths.rootA} />
        <path className="living-tree-wood living-tree-root root--b" d={livingTreePaths.rootB} />
        <path className="living-tree-wood living-tree-root root--c" d={livingTreePaths.rootC} />
        <path className="living-tree-wood living-tree-branch branch--frontend" id="living-tree-path-frontend" d={livingTreePaths.frontend} />
        <path className="living-tree-wood living-tree-branch branch--backend" id="living-tree-path-backend" d={livingTreePaths.backend} />
        <path className="living-tree-wood living-tree-branch branch--game" id="living-tree-path-game" d={livingTreePaths.game} />
        <path className="living-tree-wood living-tree-canopy-vein" d={livingTreePaths.canopyA} />
        <path className="living-tree-wood living-tree-canopy-vein" d={livingTreePaths.canopyB} />
        <path className="living-tree-wood living-tree-canopy-vein" d={livingTreePaths.canopyC} />
        <path className="living-tree-sap-path sap--trunk" d={livingTreePaths.trunk} />
        <path className="living-tree-sap-path sap--root" d={livingTreePaths.rootA} />
        <path className="living-tree-sap-path sap--frontend" d={livingTreePaths.frontend} />
        <path className="living-tree-sap-path sap--backend" d={livingTreePaths.backend} />
        <path className="living-tree-sap-path sap--game" d={livingTreePaths.game} />
        <g className="living-tree-nodes">
          <circle className="living-tree-node node--trunk" cx="39" cy="48" r="1.2" />
          <circle className="living-tree-node node--frontend" cx="88" cy="18" r="1" />
          <circle className="living-tree-node node--backend" cx="87" cy="37" r="1" />
          <circle className="living-tree-node node--game" cx="88" cy="76" r="1" />
          <circle className="living-tree-node node--root" cx="51" cy="88" r="0.9" />
        </g>
        <g className="living-tree-runners" filter="url(#living-tree-runner-glow)">
          <circle className="living-tree-runner runner--trunk" r="0.56">
            <animateMotion dur="13s" repeatCount="indefinite" begin="-2s">
              <mpath href="#living-tree-path-trunk" />
            </animateMotion>
          </circle>
          <circle className="living-tree-runner runner--frontend" r="0.42">
            <animateMotion dur="10s" repeatCount="indefinite" begin="-6s">
              <mpath href="#living-tree-path-frontend" />
            </animateMotion>
          </circle>
          <circle className="living-tree-runner runner--backend" r="0.44">
            <animateMotion dur="11s" repeatCount="indefinite" begin="-4s">
              <mpath href="#living-tree-path-backend" />
            </animateMotion>
          </circle>
          <circle className="living-tree-runner runner--game" r="0.44">
            <animateMotion dur="12s" repeatCount="indefinite" begin="-8s">
              <mpath href="#living-tree-path-game" />
            </animateMotion>
          </circle>
          <circle className="living-tree-runner runner--root" r="0.38">
            <animateMotion dur="16s" repeatCount="indefinite" begin="-10s">
              <mpath href="#living-tree-path-root-a" />
            </animateMotion>
          </circle>
        </g>
      </svg>
      <div className="living-tree-fiber living-tree-fiber--primary" />
      <div className="living-tree-fiber living-tree-fiber--secondary" />
      <div className="living-tree-core" />
      <div className="living-tree-understory" />
      <div className="living-tree-leaves">
        {livingTreeLeaves.map(function renderLeaf(leaf) {
          return (
            <span
              className="living-tree-leaf"
              key={leaf.id}
              style={{
                "--leaf-delay": leaf.delay,
                "--leaf-rotate": leaf.rotate,
                "--leaf-size": leaf.size,
                "--leaf-x": leaf.x,
                "--leaf-y": leaf.y
              }}
            />
          );
        })}
      </div>
      <div className="living-fireflies">
        {livingFireflies.map(function renderFirefly(firefly) {
          return (
            <span
              className="living-firefly"
              key={firefly.id}
              style={{
                "--firefly-delay": firefly.delay,
                "--firefly-duration": firefly.duration,
                "--firefly-dx": firefly.dx,
                "--firefly-dy": firefly.dy,
                "--firefly-size": firefly.size,
                "--firefly-x": firefly.x,
                "--firefly-y": firefly.y
              }}
            />
          );
        })}
      </div>
      <div className="living-cursor-lights">
        <span className="cursor-light-field" />
        {cursorFireflies.map(function renderCursorFirefly(firefly) {
          return (
            <span
              className="cursor-firefly"
              key={firefly.id}
              style={{
                "--cursor-firefly-delay": firefly.delay,
                "--cursor-firefly-duration": firefly.duration,
                "--cursor-firefly-follow": firefly.follow,
                "--cursor-firefly-size": firefly.size,
                "--cursor-orbit-x": firefly.orbitX,
                "--cursor-orbit-y": firefly.orbitY,
                "--cursor-orbit-x-2": firefly.orbitX2,
                "--cursor-orbit-y-2": firefly.orbitY2,
                "--cursor-orbit-x-3": firefly.orbitX3,
                "--cursor-orbit-y-3": firefly.orbitY3,
                "--cursor-orbit-x-4": firefly.orbitX4,
                "--cursor-orbit-y-4": firefly.orbitY4
              }}
            />
          );
        })}
      </div>
      {pulse ? <span key={pulse.id} className={"living-tree-pulse is-" + pulseType} /> : null}
    </div>
  );
}

function TopNav(props) {
  const {activeId, darkMode, onToggleTheme} = props;

  return (
    <header className="top-nav">
      <button className="brand-mark" type="button" onClick={function goHome() { scrollToSection("intro"); }}>
        JH
      </button>
      <nav>
        {sections.map(function renderNav(section) {
          return (
            <button
              className={activeId === section.id ? "top-nav__item is-active" : "top-nav__item"}
              key={section.id}
              type="button"
              onClick={function handleClick() {
                scrollToSection(section.id);
              }}
            >
              <span>{section.number}</span> {section.label}
            </button>
          );
        })}
      </nav>
      <button
        aria-label="Toggle color mode"
        className={darkMode ? "theme-toggle is-dark" : "theme-toggle"}
        data-cursor="button"
        type="button"
        onClick={onToggleTheme}
      >
        <span>☼</span>
        <span>●</span>
      </button>
    </header>
  );
}

function SectionIndicator(props) {
  const {activeId} = props;
  const active = sections.find(function findActive(section) {
    return section.id === activeId;
  }) || sections[0];

  return (
    <aside className="section-indicator">
      <button className="section-indicator__logo" type="button" onClick={function goHome() { scrollToSection("intro"); }}>
        JH
      </button>
      <div className="section-indicator__current">
        <strong>{active.number}</strong>
        <span>{active.label}</span>
      </div>
      <div className="section-indicator__dots">
        {sections.map(function renderDot(section) {
          return (
            <button
              aria-label={section.label}
              className={activeId === section.id ? "section-dot is-active" : "section-dot"}
              data-cursor="button"
              key={section.id}
              type="button"
              onClick={function handleClick() {
                scrollToSection(section.id);
              }}
            />
          );
        })}
      </div>
      <div className="section-indicator__links">
        <a href="https://github.com/toadsam" rel="noopener noreferrer" target="_blank">GH</a>
        <a href="mailto:jaehoon.dev@gmail.com">Mail</a>
        <a href="#contact" onClick={function handleClick(event) { event.preventDefault(); scrollToSection("contact"); }}>Hire</a>
      </div>
    </aside>
  );
}

function Reveal(props) {
  const {children, className, delay, as, ...rest} = props;
  const Tag = as || "div";
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(function observeReveal() {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      function handleIntersect(entries) {
        entries.forEach(function each(entry) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {threshold: 0.18}
    );

    observer.observe(node);

    return function cleanup() {
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={["reveal", visible ? "is-visible" : "", className || ""].join(" ").trim()}
      style={{transitionDelay: delay ? delay + "ms" : "0ms"}}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function MagneticButton(props) {
  const {children, onClick, variant} = props;
  const [offset, setOffset] = useState({x: 0, y: 0});

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setOffset({
      x: (event.clientX - rect.left - rect.width / 2) * 0.18,
      y: (event.clientY - rect.top - rect.height / 2) * 0.18
    });
  }

  return (
    <button
      className={variant ? "magnetic-button is-" + variant : "magnetic-button"}
      data-cursor="button"
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={function reset() { setOffset({x: 0, y: 0}); }}
      onClick={onClick}
    >
      <span style={{transform: "translate3d(".concat(offset.x, "px, ").concat(offset.y, "px, 0)")}}>
        {children}
      </span>
    </button>
  );
}

function CodeCard(props) {
  const {pointer} = props;

  return (
    <article
      className="floating-card code-card"
      data-cursor="code"
      style={{transform: "translate3d(".concat(pointer.x * 18, "px, ").concat(pointer.y * 12, "px, 0)")}}
    >
      <div className="window-dots"><i /><i /><i /></div>
      <strong>HelloPortfolio.jsx</strong>
      <pre>
        <code>
          <span><em>const</em> developer = {"{"}</span>
          <span>  name: <b>'Jaehoon'</b>,</span>
          <span>  stack: <b>'React + TypeScript'</b>,</span>
          <span>  role: <b>'Full-stack / Game Developer'</b>,</span>
          <span>  passion: <b>'Building products users love'</b>,</span>
          <span>{"};"}</span>
        </code>
      </pre>
      <small>READY TO SHIP</small>
    </article>
  );
}

function GamePreviewCard(props) {
  const {pointer} = props;

  return (
    <article
      className="floating-card game-card"
      data-cursor="game"
      style={{transform: "translate3d(".concat(pointer.x * -24, "px, ").concat(pointer.y * 18, "px, 0) rotate(1deg)")}}
    >
      <div className="game-scene">
        <div className="game-sky" />
        <div className="game-mountains" />
        <div className="game-player" />
        <div className="game-hud">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="mini-card game-label">
        <strong>Unity Game System</strong>
        <span>Controller / Quest / Physics</span>
      </div>
    </article>
  );
}

function ApiCard(props) {
  const {pointer} = props;

  return (
    <article
      className="floating-card api-card"
      data-cursor="card"
      style={{transform: "translate3d(".concat(pointer.x * 14, "px, ").concat(pointer.y * -16, "px, 0)")}}
    >
      <div className="api-card__head">
        <strong>Spring Boot API</strong>
        <span>ONLINE</span>
      </div>
      <p>Response 128ms · Uptime 23d 14h</p>
      <svg viewBox="0 0 220 70" role="img" aria-label="API uptime graph">
        <path d="M4 44 C30 18, 44 54, 72 38 S118 42, 142 26 S188 8, 216 24" />
      </svg>
    </article>
  );
}

function IntroSection(props) {
  const {pointer} = props;

  return (
    <section className="portfolio-section intro-section" id="intro">
      <div className="section-grid">
        <Reveal className="hero-copy">
          <p className="eyebrow">01 Intro</p>
          <h1>
            <span>Hi, I'm <mark>Jaehoon.</mark></span>
            <span>I build <mark>interactive</mark></span>
            <span><mark>web services</mark></span>
            <span>and playful <mark>game systems</mark>.</span>
          </h1>
          <p>
            사용자 경험을 설계하고, 확장 가능한 풀스택 서비스를 개발하며,
            게임으로 새로운 몰입형 경험을 만듭니다.
          </p>
          <div className="hero-actions">
            <MagneticButton variant="primary" onClick={function handleClick() { scrollToSection("projects"); }}>
              Explore my work <i />
            </MagneticButton>
            <MagneticButton onClick={function handleClick() { scrollToSection("contact"); }}>
              Contact me
            </MagneticButton>
          </div>
          <button className="scroll-cue" type="button" onClick={function handleClick() { scrollToSection("skills"); }}>
            Scroll to discover <span />
          </button>
        </Reveal>

        <div className="hero-stage">
          <div
            className="dotted-orbit"
            style={{transform: "translate3d(".concat(pointer.x * 8, "px, ").concat(pointer.y * 8, "px, 0)")}}
          />
          <CodeCard pointer={pointer} />
          <GamePreviewCard pointer={pointer} />
          <ApiCard pointer={pointer} />
          <article
            className="floating-card performance-card"
            data-cursor="card"
            style={{transform: "translate3d(".concat(pointer.x * -12, "px, ").concat(pointer.y * -10, "px, 0)")}}
          >
            <span>Lighthouse / UX / FPS</span>
            <strong>99</strong>
            <small>API 128ms · 60fps</small>
          </article>
        </div>
      </div>
    </section>
  );
}

function getLogoFallback(name) {
  return name.split(/\s+/).map(function mapWord(word) {
    return word.charAt(0);
  }).join("").replace(/[^a-z0-9#+]/gi, "").slice(0, 3).toUpperCase();
}

function SkillLogo(props) {
  const {fallback, name, slug, url} = props;
  const logoSlug = slug || skillLogoSlugs[name];
  const imageUrl = url || (logoSlug ? simpleIconBaseUrl + logoSlug : "");

  if (!imageUrl) {
    if (!fallback) {
      return null;
    }

    return (
      <span className="skill-logo-frame skill-logo-frame--fallback" aria-hidden="true">
        {fallback}
      </span>
    );
  }

  return (
    <span className="skill-logo-frame" aria-hidden="true">
      <img
        alt=""
        onError={function handleLogoError(event) {
          event.currentTarget.parentElement.classList.add("is-broken");
        }}
        src={imageUrl}
      />
      <span className="skill-logo-fallback">{fallback || getLogoFallback(name)}</span>
    </span>
  );
}

function SkillAreaIcon(props) {
  const {type} = props;
  return (
    <span className={"skill-area-icon skill-area-icon--" + type} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function SkillLinkedRow(props) {
  const {activeItems, items, kind, title, subtitle} = props;

  return (
    <div className={"skill-linked-row skill-linked-row--" + kind}>
      <div className="skill-linked-row__label">
        <span>{kind === "languages" ? "</>" : "TL"}</span>
        <div>
          <strong>{title}</strong>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="skill-linked-tags">
        {items.map(function renderItem(item, index) {
          const name = item.name || item;
          const isActive = activeItems.indexOf(name) >= 0;

          return (
            <span
              className={isActive ? "linked-tag is-active" : "linked-tag"}
              key={name}
              style={{
                "--tag-color": item.color || "var(--green)",
                "--pulse-delay": index * 0.34 + "s",
                transitionDelay: index * 50 + "ms"
              }}
              title={item.tooltip || name}
            >
              <SkillLogo fallback={item.fallback} name={name} slug={item.slug} url={item.url} />
              {name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SkillLiveSystem(props) {
  const {isActive, type} = props;
  const className = "skill-live-system skill-live-system--" + type + (isActive ? " is-live" : "");

  if (type === "backend") {
    return (
      <div className={className} aria-hidden="true">
        <div className="live-node live-node--client">UI</div>
        <div className="live-flow"><i /><i /><i /></div>
        <div className="live-node live-node--server">API</div>
        <div className="live-flow live-flow--delay"><i /><i /><i /></div>
        <div className="live-node live-node--db">DB</div>
        <div className="live-status">
          <span>POST /auth</span>
          <strong>128ms</strong>
        </div>
      </div>
    );
  }

  if (type === "game") {
    return (
      <div className={className} aria-hidden="true">
        <div className="live-game-field">
          <span className="live-game-player" />
          <span className="live-game-target" />
          <span className="live-game-pulse" />
          <i className="live-game-path" />
        </div>
        <div className="live-game-hud">
          <span>INPUT</span>
          <span>PHYSICS</span>
          <span>FEEDBACK</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <div className="live-ui-shell">
        <div className="live-ui-topbar"><span /><span /><span /></div>
        <div className="live-ui-hero" />
        <div className="live-ui-grid"><i /><i /><i /></div>
        <div className="live-ui-cursor" />
      </div>
      <div className="live-ui-stack">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function SkillsSection(props) {
  const {onSelectArea, onSelectSkill, pointer} = props;
  const [activeAreaId, setActiveAreaId] = useState(skillAreas[0].id);
  const activeArea = skillAreas.find(function findArea(area) {
    return area.id === activeAreaId;
  }) || skillAreas[0];
  const pointerX = (pointer && pointer.x) || 0;
  const pointerY = (pointer && pointer.y) || 0;

  function selectArea(area) {
    setActiveAreaId(area.id);
    onSelectSkill(area.projectSkill);
    if (onSelectArea) {
      onSelectArea(area.id);
    }
  }

  function handleAreaKeyDown(event, area) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectArea(area);
    }
  }

  function goToRelatedProjects() {
    onSelectSkill(activeArea.projectSkill);
    scrollToSection("projects");
  }

  return (
    <section
      className="portfolio-section skills-section skills-section--linked"
      data-active-area={activeArea.id}
      id="skills"
      style={{
        "--skill-accent": activeArea.accent,
        "--skill-card-x": pointerX * 2.2 + "px",
        "--skill-card-y": pointerY * 2.2 + "px",
        "--skill-pointer-x": pointerX * 28 + "px",
        "--skill-pointer-y": pointerY * 28 + "px",
        "--skill-pointer-x-soft": pointerX * -15 + "px",
        "--skill-pointer-y-soft": pointerY * -15 + "px"
      }}
    >
      <div className="skills-linked-grid">
        <Reveal className="section-copy skills-linked-copy">
          <p className="eyebrow">02 Skills</p>
          <div className="skills-copy-switch" key={activeArea.id}>
            <h2>
              {activeArea.title.split("\n").map(function renderTitleLine(line) {
                return <span key={line}>{line}</span>;
              })}
            </h2>
            <p>{activeArea.intro}</p>
          </div>
          <button className="skills-related-button" data-cursor="button" type="button" onClick={goToRelatedProjects}>
            View related projects <i />
          </button>
        </Reveal>

        <Reveal className="skill-area-panel" delay={120}>
          <div className="skill-area-cards" data-active-area={activeArea.id}>
            {skillAreas.map(function renderArea(area) {
              const isActive = area.id === activeArea.id;

              return (
                <article
                  aria-pressed={isActive}
                  className={isActive ? "skill-area-card is-active" : "skill-area-card"}
                  data-cursor="card"
                  key={area.id}
                  onClick={function handleClick() {
                    selectArea(area);
                  }}
                  onKeyDown={function handleKeyDown(event) {
                    handleAreaKeyDown(event, area);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="skill-area-card__top">
                    <SkillAreaIcon type={area.icon} />
                    {isActive ? <span className="skill-active-badge">Active</span> : null}
                    <span className="skill-card-arrow" aria-hidden="true" />
                  </div>
                  <h3>{area.label}</h3>
                  <p>{isActive ? area.summary : area.short}</p>
                  <div className="skill-card-compact-tags">
                    {area.tags.slice(0, 3).map(function renderCompactTag(tag) {
                      return (
                        <span key={tag}>
                          <SkillLogo name={tag} />
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                  <div className="skill-card-details" aria-hidden={!isActive}>
                    {isActive ? <SkillLiveSystem isActive={isActive} type={area.id} /> : null}
                    <span className="skill-card-divider" />
                    <ul>
                      {area.bullets.map(function renderBullet(bullet, index) {
                        return <li key={bullet} style={{transitionDelay: index * 70 + "ms"}}>{bullet}</li>;
                      })}
                    </ul>
                    <div className="skill-card-tags">
                      {area.tags.map(function renderTag(tag, index) {
                        return (
                          <span key={tag} style={{transitionDelay: 180 + index * 45 + "ms"}}>
                            <SkillLogo name={tag} />
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>

      <Reveal className="skill-linked-panels" delay={220}>
        <SkillLinkedRow
          activeItems={activeArea.languages}
          items={languageItems}
          kind="languages"
          title="Languages"
          subtitle="Core languages I work with"
        />
        <SkillLinkedRow
          activeItems={activeArea.tools}
          items={toolItems}
          kind="tools"
          title="Tools"
          subtitle="Daily tools & platforms"
        />
        <div className="skill-linked-row skill-linked-row--projects">
          <div className="skill-linked-row__label">
            <span>RP</span>
            <div>
              <strong>Related projects</strong>
              <p>Projects that showcase my {activeArea.label.toLowerCase()} work</p>
            </div>
          </div>
          <div className="skill-project-cards" key={activeArea.id}>
            {activeArea.projects.map(function renderProject(project, index) {
              return (
                <button
                  className="skill-project-card"
                  data-cursor="button"
                  key={project}
                  style={{
                    "--project-pulse-delay": index * 0.28 + "s",
                    transitionDelay: index * 80 + "ms"
                  }}
                  type="button"
                  onClick={goToRelatedProjects}
                >
                  <span>{project.slice(0, 1)}</span>
                  <strong>{project}</strong>
                  <i />
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ProjectVisual(props) {
  const {project} = props;

  return (
    <div
      className="project-visual"
      data-cursor={project.category === "Game" ? "game" : "card"}
      style={{"--project-color": project.color}}
    >
      <div className="mock-browser">
        <div className="mock-browser__bar"><i /><i /><i /></div>
        <div className="mock-browser__hero">
          <span>{project.category}</span>
          <strong>{project.title}</strong>
        </div>
        <div className="mock-browser__grid">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="mock-phone">
        <span />
        <strong>{project.metric}</strong>
        <i />
      </div>
    </div>
  );
}

function MainProjectsSection(props) {
  const {activeProject, onSelectProject, selectedSkill} = props;
  const [filter, setFilter] = useState("All");
  const [dragStart, setDragStart] = useState(null);
  const [openingId, setOpeningId] = useState("");
  const filters = ["All", "Web", "Full-stack", "Game", "Tool", "Experiment"];
  const filteredProjects = projects.filter(function filterProject(project) {
    return filter === "All" || project.category === filter;
  });
  const activeIndex = filteredProjects.findIndex(function findProject(project) {
    return project.id === activeProject.id;
  });
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  function moveProject(direction) {
    const nextIndex = (safeIndex + direction + filteredProjects.length) % filteredProjects.length;
    onSelectProject(filteredProjects[nextIndex]);
  }

  function handleFilter(nextFilter) {
    const nextProjects = projects.filter(function filterProject(project) {
      return nextFilter === "All" || project.category === nextFilter;
    });
    setFilter(nextFilter);

    if (nextProjects.length) {
      onSelectProject(nextProjects[0]);
    }
  }

  function handleDragEnd(clientX) {
    if (dragStart === null) {
      return;
    }

    const distance = clientX - dragStart;
    setDragStart(null);

    if (Math.abs(distance) > 45) {
      moveProject(distance < 0 ? 1 : -1);
    }
  }

  function openProjectDetail(project) {
    onSelectProject(project);
    setOpeningId(project.id);
    window.setTimeout(function scrollDetail() {
      scrollToSection("detail");
      setOpeningId("");
    }, 180);
  }

  return (
    <section className="portfolio-section projects-section" id="projects">
      <div className="projects-head">
        <Reveal className="section-copy">
          <p className="eyebrow">03 Projects</p>
          <h2>Main <mark>Projects</mark></h2>
          <p>사용자 경험을 만드는 과정에 주요 포인트를 담았습니다.</p>
        </Reveal>
        <Reveal className="project-filters" delay={160}>
          {filters.map(function renderFilter(item) {
            return (
              <button
                className={filter === item ? "filter-button is-active" : "filter-button"}
                data-cursor="button"
                key={item}
                type="button"
                onClick={function handleClick() {
                  handleFilter(item);
                }}
              >
                {item}
              </button>
            );
          })}
        </Reveal>
      </div>

      <div className="project-carousel-wrap">
        <button className="round-control" data-cursor="button" type="button" onClick={function previous() { moveProject(-1); }}>←</button>
        <div
          className="project-carousel"
          onMouseDown={function startDrag(event) { setDragStart(event.clientX); }}
          onMouseUp={function endDrag(event) { handleDragEnd(event.clientX); }}
          onTouchStart={function startTouch(event) { setDragStart(event.touches[0].clientX); }}
          onTouchEnd={function endTouch(event) { handleDragEnd(event.changedTouches[0].clientX); }}
        >
          {filteredProjects.map(function renderProject(project, index) {
            const offset = index - safeIndex;
            const isActive = project.id === activeProject.id;
            const isSkillMatch = selectedSkill && project.tags.indexOf(selectedSkill) >= 0;

            return (
              <article
                className={[
                  "project-card",
                  isActive ? "is-active" : "",
                  isSkillMatch ? "is-highlighted" : "",
                  openingId === project.id ? "is-opening" : ""
                ].join(" ").trim()}
                data-cursor="card"
                key={project.id}
                style={{
                  "--project-color": project.color,
                  transform: "translateX(".concat(offset * 78, "%) scale(").concat(
                    openingId === project.id ? 1.05 : isActive ? 1 : 0.9,
                    ")"
                  ),
                  opacity: isActive ? 1 : 0.55,
                  zIndex: isActive ? 5 : 3 - Math.abs(offset)
                }}
                onClick={function handleClick() {
                  if (isActive) {
                    openProjectDetail(project);
                    return;
                  }

                  onSelectProject(project);
                }}
              >
                <div className="project-card__copy">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div>
                    {project.tags.slice(0, 4).map(function renderTag(tag) {
                      return <small key={tag}>{tag}</small>;
                    })}
                  </div>
                  <button
                    data-cursor="button"
                    type="button"
                    onClick={function openDetail(event) {
                      event.stopPropagation();
                      openProjectDetail(project);
                    }}
                  >
                    View project →
                  </button>
                </div>
                <ProjectVisual project={project} />
              </article>
            );
          })}
        </div>
        <button className="round-control" data-cursor="button" type="button" onClick={function next() { moveProject(1); }}>→</button>
      </div>

      <div className="project-counter">
        <span>{String(safeIndex + 1).padStart(2, "0")}</span>
        <i />
        <span>{String(filteredProjects.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}

function CodeTabs() {
  const [activeTab, setActiveTab] = useState("frontend");
  const [copied, setCopied] = useState(false);
  const tabs = [
    ["frontend", "Frontend / React"],
    ["backend", "Backend / Spring Boot"],
    ["database", "Database / SQL"],
    ["game", "Game Logic / Unity C#"]
  ];

  function copySnippet() {
    const text = codeSnippets[activeTab].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }

    setCopied(true);
    window.setTimeout(function resetCopied() {
      setCopied(false);
    }, 1400);
  }

  return (
    <div className="code-tabs" data-cursor="code">
      <div className="code-tabs__nav">
        {tabs.map(function renderTab(tab) {
          return (
            <button
              className={activeTab === tab[0] ? "is-active" : ""}
              data-cursor="button"
              key={tab[0]}
              type="button"
              onClick={function handleClick() {
                setActiveTab(tab[0]);
              }}
            >
              {tab[1]}
            </button>
          );
        })}
        <button className="copy-button" data-cursor="button" type="button" onClick={copySnippet}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>
          {codeSnippets[activeTab].map(function renderLine(line, index) {
            return (
              <span className={index === 2 || index === 4 ? "is-important" : ""} key={line + index}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {line}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

function ProjectDetailSection(props) {
  const {activeProject} = props;
  const [detailActive, setDetailActive] = useState(detailSections[0].id);
  const [activeFlow, setActiveFlow] = useState(2);
  const flowSteps = [
    ["01", "Onboarding", "User intent and project context"],
    ["02", "Select Interests", "Choose web, API, or game interaction goals"],
    ["03", "Main Dashboard", "Show realtime state and core content"],
    ["04", "Detail Page", "Open deeper data, screenshots, and code"],
    ["05", "Save / Plan", "Persist selected content or gameplay state"],
    ["06", "Result", "Return measurable feedback and next actions"]
  ];

  useEffect(function observeDetailSections() {
    const nodes = detailSections
      .map(function mapSection(section) {
        return document.getElementById(section.id);
      })
      .filter(Boolean);

    if (!nodes.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      function onIntersect(entries) {
        entries.forEach(function each(entry) {
          if (entry.isIntersecting) {
            setDetailActive(entry.target.id);
          }
        });
      },
      {rootMargin: "-28% 0px -58% 0px", threshold: 0.12}
    );

    nodes.forEach(function observe(node) {
      observer.observe(node);
    });

    return function cleanup() {
      observer.disconnect();
    };
  }, [activeProject]);

  return (
    <section className="portfolio-section detail-section" id="detail">
      <div className="detail-hero">
        <Reveal className="section-copy">
          <p className="eyebrow">04 Project Detail</p>
          <h2>{activeProject.title}</h2>
          <p>{activeProject.description}</p>
          <div className="detail-tags">
            {activeProject.tags.map(function renderTag(tag) {
              return <span key={tag}>{tag}</span>;
            })}
          </div>
          <div className="hero-actions">
            <MagneticButton variant="primary" onClick={function handleClick() { scrollToSection("contact"); }}>
              Live site <i />
            </MagneticButton>
            <MagneticButton onClick={function handleClick() { scrollToSection("sub-projects"); }}>
              GitHub
            </MagneticButton>
          </div>
        </Reveal>
        <Reveal className="detail-device" delay={160}>
          <ProjectVisual project={activeProject} />
        </Reveal>
      </div>

      <div className="detail-scroll-layout">
        <aside className="detail-side-nav">
          <p className="eyebrow">Case Study</p>
          {detailSections.map(function renderDetailNav(section) {
            return (
              <button
                className={detailActive === section.id ? "is-active" : ""}
                data-cursor="button"
                key={section.id}
                type="button"
                onClick={function handleClick() {
                  scrollToSection(section.id);
                }}
              >
                <span>{section.number}</span>
                <i />
                <strong>{section.label}</strong>
              </button>
            );
          })}
        </aside>

        <div className="detail-story">
          <Reveal className="detail-panel detail-story-section" id="detail-overview">
            <p className="eyebrow">01 Overview</p>
            <h3>Build the product as a connected system.</h3>
            <p>
              {activeProject.title} is presented as a full product flow: frontend UI,
              backend API, realtime data, deployment context, and interaction design.
              The goal is to show how the project was structured, not just what it looks like.
            </p>
            <div className="metric-grid">
              {["2,300+ users", "150+ contents", "10,000+ views", "AWS deploy"].map(function renderMetric(metric) {
                return <strong key={metric}>{metric}</strong>;
              })}
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={80} id="detail-problem">
            <p className="eyebrow">02 Problem</p>
            <div className="issue-grid">
              {["Information overload", "Poor planning tools", "Low engagement", "Scattered updates"].map(function renderIssue(issue) {
                return (
                  <article data-cursor="card" key={issue}>
                    <span>Problem</span>
                    <strong>{issue}</strong>
                    <p>Users need a clearer path from discovery to action.</p>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={100} id="detail-solution">
            <p className="eyebrow">03 Solution</p>
            <div className="problem-solution">
              {[
                ["Information overload", "Unified discovery"],
                ["Poor planning tools", "Smart schedule"],
                ["Scattered updates", "Realtime status"]
              ].map(function renderPair(pair) {
                return (
                  <article data-cursor="card" key={pair[0]}>
                    <span>{pair[0]}</span>
                    <i />
                    <strong>{pair[1]}</strong>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={120} id="detail-role">
            <p className="eyebrow">04 My Role</p>
            <div className="role-card-grid">
              {[
                ["Frontend Development", "Built responsive pages, API data rendering, and interaction states."],
                ["Backend API", "Designed controller/service boundaries and reliable response DTOs."],
                ["Database Modeling", "Structured data for logs, saved content, and statistics."],
                ["Game System Design", "Connected player control, interaction, quest, inventory, and physics logic."],
                ["Deployment", "Handled release checks, uptime, and production edge cases."]
              ].map(function renderRole(role) {
                return (
                  <article data-cursor="card" key={role[0]}>
                    <strong>{role[0]}</strong>
                    <p>{role[1]}</p>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section code-panel" delay={140} id="detail-code">
            <p className="eyebrow">05 Code</p>
            <h3>Full-stack and game logic in one case study.</h3>
            <CodeTabs />
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={160} id="detail-features">
            <p className="eyebrow">06 Features</p>
            <div className="feature-grid">
              {["AI Recommendations", "Smart Schedule", "Live Updates", "Rewards & Badges", "Map Discovery", "Game Interaction"].map(function renderFeature(feature) {
                return (
                  <article data-cursor="card" key={feature}>
                    <i />
                    <strong>{feature}</strong>
                    <p>Hover states and clear feedback make the feature feel responsive.</p>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={180} id="detail-flow">
            <p className="eyebrow">07 UI Flow</p>
            <div className="flow-stepper">
              {flowSteps.map(function renderStep(step, index) {
                return (
                  <button
                    className={activeFlow === index ? "is-active" : ""}
                    data-cursor="button"
                    key={step[1]}
                    type="button"
                    onClick={function handleFlowClick() {
                      setActiveFlow(index);
                    }}
                  >
                    <span>{step[0]}</span>
                    {step[1]}
                  </button>
                );
              })}
            </div>
            <div className="flow-description">
              <strong>{flowSteps[activeFlow][1]}</strong>
              <p>{flowSteps[activeFlow][2]}</p>
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={200} id="detail-results">
            <p className="eyebrow">08 Results</p>
            <div className="result-grid">
              {[
                ["12.3K+", "tracked actions"],
                ["47.2%", "completion lift"],
                ["3m 18s", "avg session"],
                ["4.8 / 5", "rating"]
              ].map(function renderResult(result) {
                return (
                  <article data-cursor="card" key={result[0]}>
                    <strong>{result[0]}</strong>
                    <span>{result[1]}</span>
                    <i />
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="detail-panel detail-story-section" delay={220} id="detail-learned">
            <p className="eyebrow">09 What I Learned</p>
            <div className="learning-grid">
              {[
                "A strong product demo needs visible system thinking, not only screenshots.",
                "Realtime feedback and motion should clarify state instead of adding noise.",
                "Game interaction work improves how I think about web micro-interactions.",
                "Backend reliability shapes frontend trust more than users directly notice."
              ].map(function renderLearning(item) {
                return <article data-cursor="card" key={item}>{item}</article>;
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SubProjectsSection() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Web", "Game", "Tool", "Experiment"];
  const visibleSubProjects = subProjects.filter(function filterSubProject(item) {
    return filter === "All" || item[3] === filter;
  });

  return (
    <section className="portfolio-section sub-projects-section" id="sub-projects">
      <div className="projects-head">
        <Reveal className="section-copy">
          <p className="eyebrow">05 Sub Projects</p>
          <h2>Other <mark>Projects</mark></h2>
          <p>작은 아이디어를 실험하고 새로운 기술을 시도한 프로젝트들입니다.</p>
        </Reveal>
        <Reveal className="project-filters" delay={120}>
          {filters.map(function renderFilter(item) {
            return (
              <button
                className={filter === item ? "filter-button is-active" : "filter-button"}
                data-cursor="button"
                key={item}
                type="button"
                onClick={function handleClick() {
                  setFilter(item);
                }}
              >
                {item}
              </button>
            );
          })}
        </Reveal>
      </div>

      <div className="sub-project-grid">
        {visibleSubProjects.map(function renderProject(item, index) {
          return (
            <Reveal className="sub-project-card" data-cursor="card" delay={index * 45} key={item[0]}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              <div>
                <strong>{item[0]}</strong>
                <p>{item[1]}</p>
                <span>{item[2]}</span>
              </div>
              <button data-cursor="button" type="button">→</button>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="micro-grid">
        {["Ripple Effect", "Cursor Blob", "Card Lift", "Loading Skeleton", "Joystick Widget"].map(function renderMicro(title) {
          return (
            <article className="micro-card" data-cursor="card" key={title}>
              <div className="micro-visual" />
              <strong>{title}</strong>
              <span>micro interaction</span>
            </article>
          );
        })}
      </Reveal>
    </section>
  );
}

function ContactSection() {
  const [status, setStatus] = useState("idle");

  function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    window.setTimeout(function complete() {
      setStatus("sent");
    }, 900);
  }

  return (
    <section className="portfolio-section contact-section" id="contact">
      <div className="contact-grid">
        <Reveal className="section-copy contact-copy">
          <p className="eyebrow">06 Contact</p>
          <h2>Let's create something <mark>great</mark> together.</h2>
          <p>새로운 프로젝트나 협업 제안이 있다면 언제든 연락해주세요.</p>
          <div className="terminal-card">
            <span>$ whoami</span>
            <strong>&gt; jaehoon.dev</strong>
            <span>$ role</span>
            <strong>&gt; full-stack & game developer</strong>
            <span>$ status</span>
            <strong className="is-green">&gt; available for work</strong>
          </div>
        </Reveal>

        <Reveal className="contact-card-list" delay={120}>
          {[
            ["Email", "jaehoon.dev@gmail.com"],
            ["GitHub", "github.com/toadsam"],
            ["LinkedIn", "linkedin.com/in/jaehoon-dev"]
          ].map(function renderLink(link) {
            return (
              <a data-cursor="card" href={link[0] === "Email" ? "mailto:jaehoon.dev@gmail.com" : "https://" + link[1]} key={link[0]} rel="noopener noreferrer" target={link[0] === "Email" ? undefined : "_blank"}>
                <i>{link[0].slice(0, 2)}</i>
                <span>{link[0]}</span>
                <strong>{link[1]}</strong>
              </a>
            );
          })}
        </Reveal>

        <Reveal as="form" className="contact-form" delay={220} onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input placeholder="your@email.com" type="email" />
          </label>
          <label>
            <span>Message</span>
            <textarea placeholder="메시지를 입력하세요" rows="5" />
          </label>
          <button data-cursor="button" type="submit">
            {status === "sending" ? "Sending..." : status === "sent" ? "Sent!" : "Send message"} →
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function PortfolioApp() {
  const pointer = usePointer();
  const activeId = useActiveSection();
  const treePulseId = useRef(0);
  const treePulseTimer = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkillArea, setSelectedSkillArea] = useState(skillAreas[0].id);
  const [cursorVariant, setCursorVariant] = useState("default");
  const [treePulse, setTreePulse] = useState(null);

  useEffect(function applyTheme() {
    document.body.classList.toggle("portfolio-dark", darkMode);
    return function cleanup() {
      document.body.classList.remove("portfolio-dark");
    };
  }, [darkMode]);

  useEffect(function watchCursorTargets() {
    function handlePointerOver(event) {
      const target = event.target.closest("[data-cursor]");

      if (target) {
        setCursorVariant(target.getAttribute("data-cursor") || "default");
      }
    }

    function handlePointerOut(event) {
      const target = event.target.closest("[data-cursor]");
      const nextTarget = event.relatedTarget;

      if (target && (!nextTarget || !target.contains(nextTarget))) {
        setCursorVariant("default");
      }
    }

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);

    return function cleanup() {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, []);

  useEffect(function watchLivingTreeActions() {
    function handlePointerDown(event) {
      if (!event.target || !event.target.closest) {
        return;
      }

      const target = event.target.closest("[data-cursor], button, a");

      if (!target || target.closest(".living-tree-layer")) {
        return;
      }

      treePulseId.current += 1;
      setTreePulse({
        id: treePulseId.current,
        x: event.clientX,
        y: event.clientY,
        type: target.getAttribute("data-cursor") || "button"
      });
      if (treePulseTimer.current) {
        window.clearTimeout(treePulseTimer.current);
      }
      treePulseTimer.current = window.setTimeout(function clearTreePulse() {
        setTreePulse(null);
      }, 1400);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);

    return function cleanup() {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      if (treePulseTimer.current) {
        window.clearTimeout(treePulseTimer.current);
      }
    };
  }, []);

  return (
    <div className="interactive-portfolio">
      <CursorGlow pointer={pointer} variant={cursorVariant} />
      <LivingTreeLayer
        activeAreaId={selectedSkillArea}
        activeId={activeId}
        pointer={pointer}
        pulse={treePulse}
      />
      <TopNav
        activeId={activeId}
        darkMode={darkMode}
        onToggleTheme={function toggleTheme() {
          setDarkMode(function update(current) {
            return !current;
          });
        }}
      />
      <SectionIndicator activeId={activeId} />
      <main>
        <IntroSection pointer={pointer} />
        <SkillsSection
          onSelectArea={setSelectedSkillArea}
          onSelectSkill={setSelectedSkill}
          pointer={pointer}
        />
        <MainProjectsSection
          activeProject={activeProject}
          onSelectProject={setActiveProject}
          selectedSkill={selectedSkill}
        />
        <ProjectDetailSection activeProject={activeProject} />
        <SubProjectsSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default PortfolioApp;
