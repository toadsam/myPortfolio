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

const skillGroups = [
  {
    label: "Frontend",
    icon: "FE",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    detail: "Component UI, hooks, state flow, responsive motion"
  },
  {
    label: "Backend",
    icon: "BE",
    skills: ["Spring Boot", "Node.js", "REST API", "Socket.io"],
    detail: "Service layer, authentication, realtime events, API design"
  },
  {
    label: "Database & Infra",
    icon: "DB",
    skills: ["MySQL", "MongoDB", "Redis", "AWS"],
    detail: "Schema design, caching, deployment, operational debugging"
  },
  {
    label: "Game Development",
    icon: "GM",
    skills: ["Unity", "C#", "Unreal Engine", "Photon"],
    detail: "Game logic, physics, UI interaction, multiplayer systems"
  },
  {
    label: "Tools & Others",
    icon: "TO",
    skills: ["Git", "Docker", "GitHub Actions", "Figma"],
    detail: "Version control, CI/CD, design handoff, release workflow"
  }
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
  ["Pixel Adventure", "2D Platformer Game", "Unity"],
  ["Weather Dashboard", "날씨 정보 대시보드", "React"],
  ["API Gateway", "마이크로서비스 게이트웨이", "Node.js"],
  ["Dev Blog", "개발 블로그 사이트", "Next.js"],
  ["Memory Puzzle", "퍼즐 게임", "Unity"],
  ["Chat Application", "실시간 채팅 서비스", "Socket.io"],
  ["Portfolio v1", "이전 포트폴리오 버전", "React"],
  ["Asset Store", "게임 에셋 마켓플레이스", "Spring Boot"]
];

const codeSnippets = {
  frontend: [
    "const FestivalCard = ({ data }) => {",
    "  return (",
    "    <article className=\"card\">",
    "      <img src={data.image} />",
    "      <h3>{data.title}</h3>",
    "      <p>{data.location}</p>",
    "    </article>",
    "  );",
    "};"
  ],
  backend: [
    "@GetMapping(\"/api/festivals\")",
    "public ResponseEntity<List<Festival>> getFestivals() {",
    "  List<Festival> list = festivalService.getAll();",
    "  return ResponseEntity.ok(list);",
    "}"
  ],
  realtime: [
    "socket.on(\"message\", (msg) => {",
    "  setMessages(prev => [",
    "    ...prev,",
    "    {...msg, time: new Date()}",
    "  ]);",
    "});"
  ]
};

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
  const {pointer} = props;

  return (
    <div
      aria-hidden="true"
      className="cursor-glow"
      style={{
        transform: "translate3d("
          .concat(pointer.rawX - 120, "px, ")
          .concat(pointer.rawY - 120, "px, 0)")
      }}
    />
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
      style={{transform: "translate3d(".concat(pointer.x * 18, "px, ").concat(pointer.y * 12, "px, 0)")}}
    >
      <div className="window-dots"><i /><i /><i /></div>
      <strong>HelloPortfolio.jsx</strong>
      <pre>
        <code>
          <span><em>const</em> developer = {"{"}</span>
          <span>  name: <b>'Jaehoon'</b>,</span>
          <span>  role: <b>'Full Stack Developer'</b>,</span>
          <span>  focus: [<b>'Web Service'</b>, <b>'Game Dev'</b>],</span>
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
        <strong>RPG Project</strong>
        <span>Unity / C#</span>
      </div>
    </article>
  );
}

function ApiCard(props) {
  const {pointer} = props;

  return (
    <article
      className="floating-card api-card"
      style={{transform: "translate3d(".concat(pointer.x * 14, "px, ").concat(pointer.y * -16, "px, 0)")}}
    >
      <div className="api-card__head">
        <strong>API Server</strong>
        <span>ONLINE</span>
      </div>
      <p>Uptime 23d 14h 32m</p>
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
            <span>Hi, I'm <mark>Jaehoon</mark></span>
            <span>I build interactive</span>
            <span><mark>web services</mark></span>
            <span>and immersive <mark>games</mark>.</span>
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
            style={{transform: "translate3d(".concat(pointer.x * -12, "px, ").concat(pointer.y * -10, "px, 0)")}}
          >
            <span>Performance</span>
            <strong>99</strong>
            <small>/100</small>
          </article>
        </div>
      </div>
    </section>
  );
}

function SkillsSection(props) {
  const {onSelectSkill} = props;

  return (
    <section className="portfolio-section skills-section" id="skills">
      <div className="section-grid is-skills">
        <Reveal className="section-copy">
          <p className="eyebrow">02 Skills</p>
          <h2>My <mark>Skills</mark></h2>
          <p>다양한 기술 스택을 활용해 아이디어를 현실화합니다.</p>
          <small>[ scroll down ]</small>
        </Reveal>

        <div className="skill-lanes">
          {skillGroups.map(function renderGroup(group, groupIndex) {
            return (
              <Reveal className="skill-lane" delay={groupIndex * 100} key={group.label}>
                <div className="skill-lane__label">
                  <i>{group.icon}</i>
                  <strong>{group.label}</strong>
                  <span>{group.detail}</span>
                </div>
                <div className="skill-row">
                  {group.skills.map(function renderSkill(skill, index) {
                    return (
                      <button
                        className="skill-chip"
                        key={skill}
                        style={{transitionDelay: groupIndex * 60 + index * 40 + "ms"}}
                        type="button"
                        onClick={function handleSkillClick() {
                          onSelectSkill(skill);
                          scrollToSection("projects");
                        }}
                      >
                        <span>{skill.slice(0, 2)}</span>
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Reveal className="architecture-card">
        <div>
          <p className="eyebrow">Architecture</p>
          <h3>Client → API → Service → Database → Realtime</h3>
          <p>프론트엔드 화면부터 서버, 데이터, 실시간 이벤트까지 하나의 흐름으로 설계합니다.</p>
        </div>
        <div className="architecture-map">
          {["Client", "API", "Service", "DB", "Cache", "Game"].map(function renderNode(node) {
            return <button key={node} type="button">{node}</button>;
          })}
        </div>
      </Reveal>
    </section>
  );
}

function ProjectVisual(props) {
  const {project} = props;

  return (
    <div className="project-visual" style={{"--project-color": project.color}}>
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
        <button className="round-control" type="button" onClick={function previous() { moveProject(-1); }}>←</button>
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
                  isSkillMatch ? "is-highlighted" : ""
                ].join(" ").trim()}
                key={project.id}
                style={{
                  "--project-color": project.color,
                  transform: "translateX(".concat(offset * 78, "%) scale(").concat(isActive ? 1 : 0.9, ")"),
                  opacity: isActive ? 1 : 0.55,
                  zIndex: isActive ? 5 : 3 - Math.abs(offset)
                }}
                onClick={function handleClick() {
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
                  <button type="button" onClick={function openDetail(event) { event.stopPropagation(); scrollToSection("detail"); }}>
                    View project →
                  </button>
                </div>
                <ProjectVisual project={project} />
              </article>
            );
          })}
        </div>
        <button className="round-control" type="button" onClick={function next() { moveProject(1); }}>→</button>
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
    ["frontend", "Frontend"],
    ["backend", "Backend"],
    ["realtime", "Realtime"]
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
    <div className="code-tabs">
      <div className="code-tabs__nav">
        {tabs.map(function renderTab(tab) {
          return (
            <button
              className={activeTab === tab[0] ? "is-active" : ""}
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
        <button className="copy-button" type="button" onClick={copySnippet}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>
          {codeSnippets[activeTab].map(function renderLine(line, index) {
            return (
              <span key={line + index}>
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

      <div className="detail-nav">
        {["Overview", "Features", "Tech Stack", "Code", "Challenges", "What I Learned"].map(function renderItem(item, index) {
          return <button className={index === 0 ? "is-active" : ""} key={item} type="button">{item}</button>;
        })}
      </div>

      <div className="detail-content-grid">
        <Reveal className="detail-panel problem-panel">
          <p className="eyebrow">Overview</p>
          <h3>코드로 문제를 해결합니다.</h3>
          <p>
            실제 프로젝트 흐름에서 필요한 데이터, 인터랙션, API 연결, 실시간 상태를
            한 화면에서 이해할 수 있도록 구조화했습니다.
          </p>
          <div className="metric-grid">
            {["2,300+ users", "150+ contents", "10,000+ views", "AWS deploy"].map(function renderMetric(metric) {
              return <strong key={metric}>{metric}</strong>;
            })}
          </div>
        </Reveal>

        <Reveal className="detail-panel" delay={100}>
          <p className="eyebrow">Problem → Solution</p>
          <div className="problem-solution">
            {[
              ["Information Overload", "Unified Discovery"],
              ["Poor Planning Tools", "Smart Schedule"],
              ["Scattered Updates", "Live Updates"]
            ].map(function renderPair(pair) {
              return (
                <article key={pair[0]}>
                  <span>{pair[0]}</span>
                  <i />
                  <strong>{pair[1]}</strong>
                </article>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="detail-panel code-panel" delay={180}>
          <p className="eyebrow">Code</p>
          <CodeTabs />
        </Reveal>

        <Reveal className="detail-panel" delay={220}>
          <p className="eyebrow">UI Flow</p>
          <div className="flow-stepper">
            {["Onboarding", "Select Interests", "AI Recommendations", "Build Schedule", "Explore Map", "Earn Rewards"].map(function renderStep(step, index) {
              return (
                <button className={index === 2 ? "is-active" : ""} key={step} type="button">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SubProjectsSection() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Web", "Game", "Tool", "Experiment"];

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
        {subProjects.map(function renderProject(item, index) {
          return (
            <Reveal className="sub-project-card" delay={index * 45} key={item[0]}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              <div>
                <strong>{item[0]}</strong>
                <p>{item[1]}</p>
                <span>{item[2]}</span>
              </div>
              <button type="button">→</button>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="micro-grid">
        {["Ripple Effect", "Cursor Blob", "Card Lift", "Loading Skeleton", "Joystick Widget"].map(function renderMicro(title) {
          return (
            <article className="micro-card" key={title}>
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
              <a href={link[0] === "Email" ? "mailto:jaehoon.dev@gmail.com" : "https://" + link[1]} key={link[0]} rel="noopener noreferrer" target={link[0] === "Email" ? undefined : "_blank"}>
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
          <button type="submit">
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
  const [darkMode, setDarkMode] = useState(false);
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(function applyTheme() {
    document.body.classList.toggle("portfolio-dark", darkMode);
    return function cleanup() {
      document.body.classList.remove("portfolio-dark");
    };
  }, [darkMode]);

  return (
    <div className="interactive-portfolio">
      <CursorGlow pointer={pointer} />
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
        <SkillsSection onSelectSkill={setSelectedSkill} />
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
