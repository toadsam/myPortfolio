import React, {useCallback, useEffect, useMemo, useState} from "react";
import {contactInfo, socialMediaLinks} from "../../portfolio";
import "./livingTree.css";

const heroCopy = {
  eyebrow: "Frontend Developer",
  title: "I design interactive web experiences",
  subtitle: "where ideas grow into real products.",
  body: "A living portfolio shaped like a tree: roots for identity, branches for skills, fruits for projects, rings for growth, and seeds for the next collaboration."
};

const skills = [
  {
    id: "react",
    name: "React",
    group: "Frontend",
    description:
      "Component-driven interfaces, stateful flows, and product-grade UI behavior.",
    projects: ["demotion", "mywave"]
  },
  {
    id: "javascript",
    name: "JavaScript",
    group: "Core",
    description:
      "Interaction logic, DOM behavior, animation timing, and browser-side product details.",
    projects: ["demotion", "ar-lab"]
  },
  {
    id: "typescript",
    name: "TypeScript",
    group: "Core",
    description:
      "Safer frontend contracts and clearer implementation boundaries for growing products.",
    projects: ["demotion", "mywave"]
  },
  {
    id: "html",
    name: "HTML",
    group: "Structure",
    description:
      "Semantic layout and accessible document structure for portfolio and service screens.",
    projects: ["mywave"]
  },
  {
    id: "css",
    name: "CSS",
    group: "Motion UI",
    description:
      "Responsive layouts, layered visual systems, glow states, and motion-friendly surfaces.",
    projects: ["farm-owner", "vr-horror"]
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    group: "Styling",
    description:
      "Utility-first styling patterns and fast iteration for product interfaces.",
    projects: ["mywave"]
  },
  {
    id: "three",
    name: "Three.js",
    group: "3D",
    description:
      "Web 3D foundations for interactive scenes, depth, particles, and spatial UI concepts.",
    projects: ["vr-horror", "ar-lab"]
  },
  {
    id: "gsap",
    name: "GSAP",
    group: "Motion",
    description:
      "Timeline thinking for scroll-driven reveals, energy flow, and scene transitions.",
    projects: ["demotion"]
  },
  {
    id: "framer",
    name: "Framer Motion",
    group: "Motion",
    description:
      "Interaction states, hover feedback, and page transitions with product-level polish.",
    projects: ["demotion", "mywave"]
  },
  {
    id: "spring",
    name: "Spring Boot",
    group: "Backend",
    description:
      "API structure, service boundaries, and backend flows that support frontend products.",
    projects: ["demotion"]
  },
  {
    id: "unity",
    name: "Unity",
    group: "XR / Game",
    description:
      "Game UI implementation, interaction planning, and XR prototype thinking.",
    projects: ["farm-owner", "vr-horror", "ar-lab"]
  },
  {
    id: "github",
    name: "GitHub",
    group: "Workflow",
    description:
      "Version control, collaboration flow, and project delivery hygiene.",
    projects: ["demotion", "mywave", "farm-owner", "vr-horror", "ar-lab"]
  }
];

const projects = [
  {
    id: "demotion",
    name: "Demotion",
    type: "B2B Marketing Insight",
    oneLine:
      "Interactive SaaS demos with behavior analytics for product-led sales.",
    role: "Frontend/backend structure design and demo generation/log analysis flow implementation.",
    tech: ["React", "Spring Boot", "Analytics", "iframe", "CTA Tracking"],
    features: [
      "Demo creation flow",
      "iframe embed structure",
      "CTA click tracking",
      "ViewLog / PageViewLog / StepViewLog",
      "Completion, dwell time, and CTR analysis"
    ],
    process:
      "Defined the demo viewing flow first, then connected page/step level logs to insight cards so marketers can read user intent without opening raw logs.",
    result:
      "Learned how frontend interaction design and backend event modeling should be planned together for analytics products.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "#"}
    ],
    image: require("../../assets/images/ajouchong_main.webp"),
    accent: "#61f0a7"
  },
  {
    id: "mywave",
    name: "MyWave",
    type: "Finance / Asset Flow",
    oneLine:
      "A personal finance web app for shaping investment and spending flows.",
    role: "Service planning, UI/UX design, and screen architecture.",
    tech: ["React", "UX", "Data Visualization", "Design System"],
    features: [
      "Asset flow visualization",
      "Spending and investment records",
      "Goal management",
      "Personal insight cards"
    ],
    process:
      "Focused on making financial information feel like a flow instead of a static ledger, with calm hierarchy and clear decision points.",
    result:
      "Clarified how visual hierarchy changes the way users understand money, goals, and long-term progress.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "#"}
    ],
    image: require("../../assets/images/AjouCampusFood/ACF메인화면.png"),
    accent: "#8df7c2"
  },
  {
    id: "farm-owner",
    name: "일해라 농장주",
    type: "DTx Game UI",
    oneLine: "A farm-growing DTx game for easing smartphone overdependence.",
    role: "UI image generation and Unity UI code implementation.",
    tech: ["Unity", "C#", "Game UI", "Visual Asset"],
    features: [
      "Farm growth UI screens",
      "Reward-state interface visuals",
      "Unity UI layout implementation",
      "Game screen feedback components"
    ],
    process:
      "Implemented the interface layer and UI assets around the farm-growth metaphor while keeping runtime/session systems outside my claimed scope.",
    result:
      "Learned how visual feedback and UI state can support behavior-change products without overstating implementation ownership.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "#"}
    ],
    image: require("../../assets/images/아주대탐험/치토.png"),
    accent: "#b2ff72"
  },
  {
    id: "vr-horror",
    name: "VR Horror Game",
    type: "VR Interaction Concept",
    oneLine:
      "A 폐병원 VR horror game where a special camera reveals hidden enemies, paths, and clues.",
    role: "Game concept planning and interaction structure design.",
    tech: ["Unity", "VR", "Interaction", "Level Flow"],
    features: [
      "Special vision mechanic",
      "Hidden clue discovery",
      "Fear pacing",
      "VR object interaction"
    ],
    process:
      "Built the concept around controlled visibility: the player does not just see the world, they choose when to reveal its hidden layer.",
    result:
      "Learned how interaction rules can create tension more reliably than simple visual scares.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "#"}
    ],
    image: require("../../assets/images/VR/메인제목.png"),
    accent: "#55df9b"
  },
  {
    id: "ar-lab",
    name: "AR Lab Project",
    type: "AR Foundation Practice",
    oneLine:
      "AR Plane Tracking, Tap Spawn, and UI interaction practice with Unity AR Foundation.",
    role: "AR object placement, UI connection, and touch interaction implementation.",
    tech: ["Unity", "AR Foundation", "C#", "Touch Interaction"],
    features: [
      "AR Plane Tracking",
      "Tap Spawn",
      "UI-connected AR object state",
      "Mobile touch interaction"
    ],
    process:
      "Connected plane detection, object placement, and screen UI as one interaction loop for a practical AR prototype.",
    result:
      "Understood the importance of making real-world spatial feedback readable on a small mobile screen.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "#"}
    ],
    image: require("../../assets/images/AR/게임시작화면.png"),
    accent: "#78ffd6"
  }
];

const growth = [
  {
    year: "2025",
    title: "Unity UI Implementation",
    body: "Implemented interface screens and visual states for game-oriented interaction projects."
  },
  {
    year: "2025",
    title: "Interactive Demo Platform",
    body: "Designed a product-demo flow connected to user behavior logs and marketing insight."
  },
  {
    year: "2026",
    title: "Frontend Portfolio Development",
    body: "Rebuilt the portfolio as an interactive system rather than a static project list."
  }
];

function Header(props) {
  const {activeSection} = props;
  const nav = [
    ["hero", "Root"],
    ["skills", "Branches"],
    ["projects", "Fruits"],
    ["growth", "Rings"],
    ["contact", "Seed"]
  ];

  return (
    <header className="tree-header">
      <a className="tree-brand" href="#hero" aria-label="Go to intro">
        <span>JH</span>
        <strong>Living Tree</strong>
      </a>
      <nav aria-label="Portfolio sections">
        {nav.map(function renderNav(item) {
          return (
            <a
              className={activeSection === item[0] ? "is-active" : ""}
              href={"#" + item[0]}
              key={item[0]}
            >
              {item[1]}
            </a>
          );
        })}
      </nav>
    </header>
  );
}

function Preloader(props) {
  const {isVisible} = props;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="tree-preloader" aria-label="Loading portfolio">
      <div className="tree-preloader__seed">
        <span />
      </div>
      <p>Growing interface roots</p>
    </div>
  );
}

function CursorEffect() {
  const [cursor, setCursor] = useState({x: -120, y: -120, active: false});
  const [pulses, setPulses] = useState([]);

  useEffect(function bindCursor() {
    function moveCursor(event) {
      setCursor({x: event.clientX, y: event.clientY, active: true});
    }

    function addPulse(event) {
      const id = Date.now();
      setPulses(function add(current) {
        return current
          .concat([{id: id, x: event.clientX, y: event.clientY}])
          .slice(-5);
      });

      window.setTimeout(function removePulse() {
        setPulses(function remove(current) {
          return current.filter(function filterPulse(pulse) {
            return pulse.id !== id;
          });
        });
      }, 850);
    }

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", addPulse);

    return function cleanupCursor() {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", addPulse);
    };
  }, []);

  return (
    <div className="tree-cursor-layer" aria-hidden="true">
      <span
        className={cursor.active ? "tree-cursor is-active" : "tree-cursor"}
        style={{"--cursor-x": cursor.x + "px", "--cursor-y": cursor.y + "px"}}
      />
      {pulses.map(function renderPulse(pulse) {
        return (
          <i
            key={pulse.id}
            style={{"--pulse-x": pulse.x + "px", "--pulse-y": pulse.y + "px"}}
          />
        );
      })}
    </div>
  );
}

function EnergyTree(props) {
  const {activeSkill, activeProjectId} = props;

  return (
    <div className="energy-tree" aria-hidden="true">
      <svg viewBox="0 0 900 760" role="img">
        <defs>
          <linearGradient id="treeEnergy" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="#1e9f5b" />
            <stop offset="48%" stopColor="#74ffad" />
            <stop offset="100%" stopColor="#d5ff8c" />
          </linearGradient>
          <filter id="treeGlow">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          className="tree-root-path"
          d="M448 716 C410 648 424 566 448 492 C478 402 478 310 448 218"
        />
        <path
          className="tree-branch branch-a"
          d="M450 460 C340 428 252 360 178 266"
        />
        <path
          className="tree-branch branch-b"
          d="M462 418 C562 386 656 314 736 214"
        />
        <path
          className="tree-branch branch-c"
          d="M448 348 C382 302 348 248 330 164"
        />
        <path
          className="tree-branch branch-d"
          d="M462 316 C520 254 578 178 610 88"
        />
        <path
          className="tree-energy-flow"
          d="M448 716 C410 648 424 566 448 492 C478 402 478 310 448 218 C520 254 578 178 610 88"
        />
        <path
          className="tree-energy-flow flow-alt"
          d="M448 492 C340 428 252 360 178 266"
        />
        <path
          className="tree-energy-flow flow-alt-two"
          d="M462 418 C562 386 656 314 736 214"
        />
        <g className="tree-leaf-cluster">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(function renderLeaf(index) {
            return (
              <circle
                cx={180 + index * 68}
                cy={190 + (index % 3) * 52}
                key={index}
                r={9 + (index % 4)}
              />
            );
          })}
        </g>
      </svg>
      <div className="tree-energy-status">
        <span>
          {activeSkill
            ? "Skill energy linked"
            : activeProjectId
            ? "Project core opened"
            : "Root energy stable"}
        </span>
      </div>
    </div>
  );
}

function Hero(props) {
  const {onActivatePulse} = props;

  return (
    <section className="living-section tree-hero" data-section="hero" id="hero">
      <div className="tree-hero__copy">
        <span className="tree-eyebrow">{heroCopy.eyebrow}</span>
        <h1>{heroCopy.title}</h1>
        <p className="tree-hero__subtitle">{heroCopy.subtitle}</p>
        <p>{heroCopy.body}</p>
        <div className="tree-actions">
          <a
            className="tree-button"
            href="#projects"
            onMouseEnter={onActivatePulse}
          >
            Explore fruits
          </a>
          <a
            className="tree-button is-secondary"
            href="#skills"
            onMouseEnter={onActivatePulse}
          >
            View branches
          </a>
        </div>
      </div>
      <div className="tree-hero__system">
        <div className="root-core">
          <span />
          <i />
          <strong>ROOT</strong>
        </div>
        <div className="root-signal signal-a" />
        <div className="root-signal signal-b" />
        <div className="root-signal signal-c" />
      </div>
    </section>
  );
}

function SkillKeyboard(props) {
  const {activeSkill, onSelectSkill, relatedProjectIds} = props;
  const selectedSkill =
    skills.find(function findSkill(skill) {
      return skill.id === activeSkill;
    }) || skills[0];

  return (
    <section
      className="living-section skill-section"
      data-section="skills"
      id="skills"
    >
      <div className="section-copy">
        <span className="tree-eyebrow">Branches / Leaves</span>
        <h2>Skills grow as connected branches.</h2>
        <p>
          Each branch keeps a practical skill connected to the products it
          helped shape.
        </p>
      </div>
      <div className="skill-layout">
        <div
          className="skill-keyboard"
          role="list"
          aria-label="Interactive skill keyboard"
        >
          {skills.map(function renderSkill(skill, index) {
            const isActive = skill.id === activeSkill;
            return (
              <button
                aria-pressed={isActive}
                aria-label={"Select " + skill.name + " skill"}
                className={isActive ? "skill-key is-active" : "skill-key"}
                key={skill.id}
                onClick={function selectSkill() {
                  onSelectSkill(skill.id);
                }}
                onFocus={function focusSkill() {
                  onSelectSkill(skill.id);
                }}
                onMouseEnter={function hoverSkill() {
                  onSelectSkill(skill.id);
                }}
                style={{"--key-index": index}}
                type="button"
              >
                <span>{skill.name}</span>
                <small>{skill.group}</small>
              </button>
            );
          })}
        </div>
        <aside className="skill-orbit-panel">
          <span>{selectedSkill.group}</span>
          <h3>{selectedSkill.name}</h3>
          <p>{selectedSkill.description}</p>
          <div className="linked-projects">
            {projects
              .filter(function filterProject(project) {
                return relatedProjectIds.indexOf(project.id) >= 0;
              })
              .map(function renderLinked(project) {
                return <strong key={project.id}>{project.name}</strong>;
              })}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Projects(props) {
  const {activeSkill, onOpenProject} = props;

  return (
    <section
      className="living-section project-section"
      data-section="projects"
      id="projects"
    >
      <div className="section-copy">
        <span className="tree-eyebrow">Fruits / Energy Cores</span>
        <h2>Projects are fruits grown from the same root system.</h2>
        <p>
          Each core holds a product story, implementation role, and what the
          work taught me.
        </p>
      </div>
      <div className="fruit-orchard">
        {projects.map(function renderProject(project, index) {
          const linked = activeSkill
            ? (
                skills.find(function findSkill(skill) {
                  return skill.id === activeSkill;
                }) || {projects: []}
              ).projects.indexOf(project.id) >= 0
            : false;

          return (
            <button
              aria-label={"Open " + project.name + " project details"}
              className={linked ? "fruit-card is-linked" : "fruit-card"}
              key={project.id}
              onClick={function openProject() {
                onOpenProject(project);
              }}
              style={{"--fruit-accent": project.accent, "--fruit-index": index}}
              type="button"
            >
              <span className="fruit-core">
                <img alt="" src={project.image} />
              </span>
              <span className="fruit-meta">{project.type}</span>
              <strong>{project.name}</strong>
              <small>{project.oneLine}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProjectDetail(props) {
  const {onClose, project} = props;

  if (!project) {
    return null;
  }

  return (
    <div
      className="project-portal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-portal-title"
    >
      <button
        className="project-portal__backdrop"
        type="button"
        aria-label="Close project detail"
        onClick={onClose}
      />
      <article
        className="project-portal__panel"
        style={{"--portal-accent": project.accent}}
      >
        <header>
          <div>
            <span>{project.type}</span>
            <h2 id="project-portal-title">{project.name}</h2>
            <p>{project.oneLine}</p>
          </div>
          <button
            className="portal-close"
            type="button"
            aria-label="Close project detail"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div className="portal-body">
          <div className="portal-preview">
            <img alt={project.name + " preview"} src={project.image} />
          </div>
          <div className="portal-grid">
            <section>
              <span>Role</span>
              <p>{project.role}</p>
            </section>
            <section>
              <span>Tech</span>
              <div className="portal-tags">
                {project.tech.map(function renderTech(tech) {
                  return <strong key={tech}>{tech}</strong>;
                })}
              </div>
            </section>
            <section>
              <span>Core Features</span>
              <ul>
                {project.features.map(function renderFeature(feature) {
                  return <li key={feature}>{feature}</li>;
                })}
              </ul>
            </section>
            <section>
              <span>Process</span>
              <p>{project.process}</p>
            </section>
            <section>
              <span>Result / Learning</span>
              <p>{project.result}</p>
            </section>
          </div>
        </div>
        <footer>
          {project.links.map(function renderLink(link) {
            return (
              <a
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target={link.href === "#" ? undefined : "_blank"}
              >
                {link.label}
              </a>
            );
          })}
        </footer>
      </article>
    </div>
  );
}

function GrowthTimeline() {
  return (
    <section
      className="living-section growth-section"
      data-section="growth"
      id="growth"
    >
      <div className="section-copy">
        <span className="tree-eyebrow">Rings / Growth</span>
        <h2>Each ring marks a clearer product instinct.</h2>
      </div>
      <div className="growth-rings">
        <div className="ring-visual" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <ol>
          {growth.map(function renderGrowth(item) {
            return (
              <li key={item.title}>
                <span>{item.year}</span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Contact() {
  const email =
    contactInfo.email_address || socialMediaLinks.gmail || "toadsam@naver.com";
  const github = socialMediaLinks.github || "https://github.com/toadsam";

  return (
    <section
      className="living-section contact-section"
      data-section="contact"
      id="contact"
    >
      <div className="seed-core">
        <span />
      </div>
      <div className="section-copy">
        <span className="tree-eyebrow">Seed / Next Link</span>
        <h2>Let&apos;s plant the next idea together.</h2>
        <p>
          Portfolio ends here, but the next product can start from this seed.
        </p>
      </div>
      <div className="contact-links">
        <a href={"mailto:" + email}>Email · {email}</a>
        <a href={github} rel="noreferrer" target="_blank">
          GitHub · {github.replace(/^https?:\/\//, "")}
        </a>
      </div>
    </section>
  );
}

function Credits() {
  return (
    <footer className="tree-credits">
      <span>
        Interaction structure inspired by Jayant Potdar&apos;s MIT licensed 3D
        Portfolio. Reimagined as a custom Living Tree portfolio with original
        content and styling.
      </span>
    </footer>
  );
}

function LivingTreePortfolio() {
  const [activeSection, setActiveSection] = useState("hero");
  const [activeSkill, setActiveSkill] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(0);
  const selectedSkill = skills.find(function findSkill(skill) {
    return skill.id === activeSkill;
  });
  const relatedProjectIds = selectedSkill ? selectedSkill.projects : [];

  useEffect(function applyTreeBody() {
    document.body.classList.add("living-tree-body");

    return function cleanupTreeBody() {
      document.body.classList.remove("living-tree-body");
    };
  }, []);

  useEffect(function finishLoading() {
    const timer = window.setTimeout(function hideLoader() {
      setLoading(false);
    }, 1150);

    return function clearLoader() {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(function observeSections() {
    const nodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-section]")
    );

    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      function onObserve(entries) {
        entries.forEach(function handleEntry(entry) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-section"));
            entry.target.classList.add("is-visible");
          }
        });
      },
      {rootMargin: "-34% 0px -46% 0px", threshold: 0.08}
    );

    nodes.forEach(function observeNode(node) {
      observer.observe(node);
    });

    return function cleanupObserver() {
      observer.disconnect();
    };
  }, []);

  useEffect(function closeOnEscape() {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return function cleanupEscape() {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(
    function lockProjectPortalScroll() {
      const previousBodyOverflow = document.body.style.overflow;
      const previousRootOverflow = document.documentElement.style.overflow;

      if (selectedProject) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      }

      return function restoreProjectPortalScroll() {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousRootOverflow;
      };
    },
    [selectedProject]
  );

  const triggerPulse = useCallback(function triggerPulse() {
    setPulse(function nextPulse(value) {
      return value + 1;
    });
  }, []);

  const openProject = useCallback(
    function openProject(project) {
      triggerPulse();
      setSelectedProject(project);
    },
    [triggerPulse]
  );

  const treeStatus = useMemo(
    function getTreeStatus() {
      return {
        activeSkill: activeSkill,
        activeProjectId: selectedProject ? selectedProject.id : "",
        pulse: pulse
      };
    },
    [activeSkill, pulse, selectedProject]
  );

  return (
    <main className="living-tree-portfolio">
      <Preloader isVisible={loading} />
      <CursorEffect />
      <Header activeSection={activeSection} />
      <EnergyTree
        activeProjectId={treeStatus.activeProjectId}
        activeSkill={treeStatus.activeSkill}
        pulse={treeStatus.pulse}
      />
      <Hero onActivatePulse={triggerPulse} />
      <SkillKeyboard
        activeSkill={activeSkill}
        onSelectSkill={setActiveSkill}
        relatedProjectIds={relatedProjectIds}
      />
      <Projects activeSkill={activeSkill} onOpenProject={openProject} />
      <GrowthTimeline />
      <Contact />
      <Credits />
      <ProjectDetail
        project={selectedProject}
        onClose={function closeProject() {
          setSelectedProject(null);
        }}
      />
    </main>
  );
}

export default LivingTreePortfolio;
