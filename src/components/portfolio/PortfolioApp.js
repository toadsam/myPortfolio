import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  HashRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams
} from "react-router-dom";
import {useLocalStorage} from "../../hooks/useLocalStorage";
import {
  contactFormDefaults,
  contactLinks,
  featuredProjectSlug,
  homeHighlights,
  navItems,
  notesArticles,
  philosophyPoints,
  processSteps,
  projects,
  scheduleCard,
  skillGroups,
  socialProof,
  stackCards,
  trustedBy,
  uiExperiments
} from "../../data/siteData";
import "./portfolio.css";

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: function toggleTheme() {}
});

function useTheme() {
  return useContext(ThemeContext);
}

function usePointerPosition() {
  const [pointer, setPointer] = useState({x: 0, y: 0});

  useEffect(() => {
    const handleMove = function handleMove(event) {
      const nextX = event.clientX / window.innerWidth - 0.5;
      const nextY = event.clientY / window.innerHeight - 0.5;
      setPointer({x: nextX, y: nextY});
    };

    window.addEventListener("mousemove", handleMove);
    return function cleanup() {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return pointer;
}

function useTypewriter(lines, delay) {
  const [visibleLines, setVisibleLines] = useState(1);

  useEffect(() => {
    setVisibleLines(1);
    const intervalId = window.setInterval(function tick() {
      setVisibleLines(function update(current) {
        if (current >= lines.length) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, delay);

    return function cleanup() {
      window.clearInterval(intervalId);
    };
  }, [delay, lines]);

  return lines.slice(0, visibleLines);
}

function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({top: 0, behavior: "smooth"});
  }, [location.pathname]);
}

function getProject(slug) {
  return projects.find(function findProject(project) {
    return project.slug === slug;
  });
}

function Reveal(props) {
  const {
    as,
    className,
    delay,
    children,
    threshold,
    ...rest
  } = props;
  const Tag = as || "div";
  const [visible, setVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      function onIntersect(entries) {
        entries.forEach(function each(entry) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {threshold: threshold || 0.18}
    );

    observer.observe(node);
    return function cleanup() {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <Tag
      ref={elementRef}
      className={[
        "reveal",
        visible ? "is-visible" : "",
        className || ""
      ]
        .join(" ")
        .trim()}
      style={{transitionDelay: delay ? "".concat(delay, "ms") : "0ms"}}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function MagneticButton(props) {
  const {
    children,
    className,
    href,
    onClick,
    to,
    variant,
    ...rest
  } = props;
  const [offset, setOffset] = useState({x: 0, y: 0});

  const handleMove = function handleMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = (event.clientX - bounds.left - bounds.width / 2) * 0.18;
    const nextY = (event.clientY - bounds.top - bounds.height / 2) * 0.18;
    setOffset({x: nextX, y: nextY});
  };

  const reset = function reset() {
    setOffset({x: 0, y: 0});
  };

  const content = (
    <span
      className="magnetic-button__inner"
      style={{
        transform: "translate3d(".concat(offset.x, "px, ").concat(offset.y, "px, 0)")
      }}
    >
      {children}
    </span>
  );

  const classes = ["magnetic-button", variant ? "is-".concat(variant) : "", className || ""]
    .join(" ")
    .trim();

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link
        className={classes}
        to={to}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      {...rest}
    >
      {content}
    </button>
  );
}

function CursorGlow() {
  const [position, setPosition] = useState({x: -120, y: -120});

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) {
      return undefined;
    }

    const handleMove = function handleMove(event) {
      setPosition({x: event.clientX, y: event.clientY});
    };

    window.addEventListener("mousemove", handleMove);
    return function cleanup() {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="cursor-glow"
      style={{
        transform: "translate3d("
          .concat(position.x - 110, "px, ")
          .concat(position.y - 110, "px, 0)")
      }}
    />
  );
}

function Header() {
  const {isDark, toggleTheme} = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span>JAEHOON.DEV</span>
        <i />
      </Link>

      <button
        aria-label="Toggle menu"
        className={menuOpen ? "menu-toggle is-open" : "menu-toggle"}
        type="button"
        onClick={function toggleMenu() {
          setMenuOpen(function update(current) {
            return !current;
          });
        }}
      >
        <span />
        <span />
      </button>

      <nav className={menuOpen ? "site-nav is-open" : "site-nav"}>
        {navItems.map(function renderItem(item) {
          return (
            <NavLink
              key={item.label}
              className={function getClassName(navState) {
                return navState.isActive ? "nav-link is-active" : "nav-link";
              }}
              end={item.to === "/"}
              to={item.to}
            >
              {item.label}
            </NavLink>
          );
        })}

        <button
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={isDark ? "theme-switch is-dark" : "theme-switch"}
          type="button"
          onClick={toggleTheme}
        >
          <span />
        </button>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="section-label">Jaehoon.dev</p>
        <p className="footer-copy">
          Building interfaces that stay calm under real product constraints.
        </p>
      </div>

      <div className="footer-links">
        {contactLinks.map(function renderLink(link) {
          return (
            <a href={link.href} key={link.label} rel="noopener noreferrer" target={link.href.indexOf("mailto:") === 0 ? undefined : "_blank"}>
              <span>{link.label}</span>
              <strong>{link.value}</strong>
            </a>
          );
        })}
      </div>
    </footer>
  );
}

function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = function handleScroll() {
      setVisible(window.scrollY > 480);
    };

    window.addEventListener("scroll", handleScroll);
    return function cleanup() {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      aria-label="Scroll to top"
      className={visible ? "scroll-top is-visible" : "scroll-top"}
      type="button"
      onClick={function scrollTop() {
        window.scrollTo({top: 0, behavior: "smooth"});
      }}
    >
      ↑
    </button>
  );
}

function PageHero(props) {
  const {eyebrow, title, description, actions, children, compact} = props;

  return (
    <section className={compact ? "page-hero is-compact" : "page-hero"}>
      <Reveal as="div" className="page-hero__copy">
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-description">{description}</p>
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </Reveal>
      {children ? <div className="page-hero__visual">{children}</div> : null}
    </section>
  );
}

function HeroCluster() {
  const pointer = usePointerPosition();
  const terminalLines = useTypewriter(
    [
      "> npm run dev",
      "> compiled successfully",
      "> local: http://localhost:3000",
      "> ready in 348ms"
    ],
    560
  );

  const layerStyle = function layerStyle(multiplierX, multiplierY, extraY) {
    return {
      transform:
        "translate3d("
          .concat(pointer.x * multiplierX, "px, ")
          .concat(pointer.y * multiplierY + (extraY || 0), "px, 0)")
    };
  };

  return (
    <div className="hero-cluster">
      <div className="hero-orbit hero-orbit--large" />
      <div className="hero-orbit hero-orbit--small" />

      <Reveal className="floating-card code-card" delay={120} style={layerStyle(34, 26, 0)}>
        <div className="floating-card__meta">Button.tsx</div>
        <pre>
          <code>
            export default function Button() {"{"}
            {"\n"}  return &lt;button&gt;ship with clarity&lt;/button&gt;
            {"\n"}
            {"}"}
          </code>
        </pre>
        <span className="floating-card__foot">Ready to ship</span>
      </Reveal>

      <Reveal className="floating-card insight-card" delay={220} style={layerStyle(-28, 24, 40)}>
        <p className="floating-card__meta">Current focus</p>
        <strong>Build with clarity.</strong>
        <strong>Ship with care.</strong>
        <button type="button">→</button>
      </Reveal>

      <Reveal className="floating-card terminal-card" delay={320} style={layerStyle(46, -18, -24)}>
        <div className="floating-card__meta">Terminal</div>
        <pre>
          <code>
            {terminalLines.map(function renderLine(line) {
              return <span key={line}>{line}</span>;
            })}
          </code>
        </pre>
      </Reveal>

      <Reveal className="floating-card score-card" delay={420} style={layerStyle(22, -24, 0)}>
        <span className="floating-card__meta">Performance score</span>
        <strong>99</strong>
        <small>/100</small>
        <div className="sparkline">
          <i />
        </div>
      </Reveal>
    </div>
  );
}

function HomeHeadline() {
  return (
    <span className="home-headline">
      I build{" "}
      <span>{homeHighlights[0]}</span>
      <br />
      that <span>{homeHighlights[1]}</span> with
      <br />
      <span>{homeHighlights[2]}</span>.
    </span>
  );
}

function TrustedStrip() {
  return (
    <Reveal as="section" className="trusted-strip">
      <p className="section-label">Trusted by the stack</p>
      <div className="trusted-strip__items">
        {trustedBy.map(function renderItem(item) {
          return <span key={item}>{item}</span>;
        })}
      </div>
    </Reveal>
  );
}

function StackPreview() {
  return (
    <section className="preview-grid">
      <Reveal className="preview-copy">
        <p className="section-label">About me</p>
        <h2>I care about code that stays clear when products get messy.</h2>
        <p>
          I design frontend experiences around performance, structure, and the
          tiny interaction cues that help people trust the interface quickly.
        </p>
        <Link className="inline-link" to="/about">
          More about the stack →
        </Link>
      </Reveal>

      <div className="stack-preview-grid">
        {stackCards.slice(0, 6).map(function renderCard(card, index) {
          return (
            <Reveal className="glass-card stack-card" delay={index * 70} key={card.name}>
              <span className="stack-card__icon">{card.name.slice(0, 2)}</span>
              <h3>{card.name}</h3>
              <p>{card.blurb}</p>
              <small>{card.version}</small>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function SkillFocus() {
  return (
    <section>
      <Reveal className="section-header">
        <p className="section-label">Core skills</p>
        <div className="section-header__row">
          <h2>기존 포트폴리오의 강점 축을 그대로 살린 기술 구성.</h2>
          <Link className="inline-link" to="/work">
            See applied work
          </Link>
        </div>
      </Reveal>

      <div className="skill-focus-grid">
        {skillGroups.map(function renderSkillGroup(group, index) {
          return (
            <Reveal className="glass-card skill-focus-card" delay={index * 70} key={group.title}>
              <p className="section-label">{group.title}</p>
              <h3>{group.body}</h3>
              <div className="chip-row">
                {group.tags.map(function renderTag(tag) {
                  return <span key={tag}>{tag}</span>;
                })}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ProjectCarousel(props) {
  const {activeProject, onChange} = props;
  const currentIndex = projects.findIndex(function findCurrent(project) {
    return project.slug === activeProject.slug;
  });

  const goTo = function goTo(index) {
    const nextIndex = (index + projects.length) % projects.length;
    onChange(projects[nextIndex]);
  };

  return (
    <div className="carousel-shell">
      <button
        aria-label="Previous project"
        className="carousel-control"
        type="button"
        onClick={function previous() {
          goTo(currentIndex - 1);
        }}
      >
        ←
      </button>

      <div className="carousel-track">
        {projects.map(function renderProject(project, index) {
          const offset = index - currentIndex;
          const isActive = project.slug === activeProject.slug;

          return (
            <article
              className={isActive ? "project-slide is-active" : "project-slide"}
              key={project.slug}
              onClick={function handleClick() {
                if (!isActive) {
                  onChange(project);
                }
              }}
              style={{
                transform:
                  "translateX(".concat(offset * 74, "%) scale(").concat(
                    isActive ? 1 : 0.88,
                    ")"
                  ),
                opacity: isActive ? 1 : 0.52,
                zIndex: isActive ? 3 : 1
              }}
            >
              <div className="project-slide__copy">
                <span className="slide-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="slide-category">{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="chip-row">
                  {project.stack.map(function renderTag(tag) {
                    return <span key={tag}>{tag}</span>;
                  })}
                </div>
                {isActive ? (
                  <MagneticButton to={"/work/".concat(project.slug)} variant="primary">
                    View case study
                  </MagneticButton>
                ) : null}
              </div>

              <div className="project-slide__visual">
                <img alt={project.title} src={project.heroImage} />
              </div>
            </article>
          );
        })}
      </div>

      <button
        aria-label="Next project"
        className="carousel-control"
        type="button"
        onClick={function next() {
          goTo(currentIndex + 1);
        }}
      >
        →
      </button>
    </div>
  );
}

function FeaturedProject(props) {
  const {project} = props;

  return (
    <Reveal className="featured-project">
      <div className="featured-project__copy">
        <p className="section-label">Featured case study</p>
        <h2>{project.title}</h2>
        <p>{project.shortDescription}</p>
        <div className="featured-metrics">
          {project.metrics.slice(0, 3).map(function renderMetric(metric) {
            return (
              <div className="metric-card" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            );
          })}
        </div>
        <div className="hero-actions">
          <MagneticButton to={"/work/".concat(project.slug)} variant="primary">
            View case study
          </MagneticButton>
          {project.liveUrl ? (
            <MagneticButton href={project.liveUrl} variant="ghost">
              Live project
            </MagneticButton>
          ) : null}
        </div>
      </div>
      <div className="featured-project__visual">
        <img alt={project.title} src={project.heroImage} />
      </div>
    </Reveal>
  );
}

function ContactPreview() {
  return (
    <section className="contact-preview">
      <Reveal className="contact-preview__copy">
        <p className="section-label">Let's connect</p>
        <h2>Open to thoughtful products, frontend roles, and collaboration.</h2>
      </Reveal>

      <div className="contact-preview__links">
        {contactLinks.map(function renderLink(link, index) {
          return (
            <Reveal
              as="a"
              className="glass-card contact-link-card"
              delay={index * 90}
              href={link.href}
              key={link.label}
              rel="noopener noreferrer"
              target={link.href.indexOf("mailto:") === 0 ? undefined : "_blank"}
            >
              <span>{link.label}</span>
              <strong>{link.value}</strong>
              <i>↗</i>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function HomePage() {
  const featured = getProject(featuredProjectSlug);
  const [activeProject, setActiveProject] = useState(featured);

  useEffect(() => {
    setActiveProject(featured);
  }, [featured]);

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Hi, I'm Jaehoon"
        title={<HomeHeadline />}
        description="Frontend developer crafting performant, accessible, and highly interactive interfaces with a calm visual system."
        actions={
          <React.Fragment>
            <MagneticButton to="/work" variant="primary">
              Explore work
            </MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Start a project
            </MagneticButton>
          </React.Fragment>
        }
      >
        <HeroCluster />
      </PageHero>

      <TrustedStrip />

      <section className="stats-grid">
        {socialProof.map(function renderProof(item, index) {
          return (
            <Reveal className="glass-card stat-card" delay={index * 80} key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </Reveal>
          );
        })}
      </section>

      <StackPreview />
      <SkillFocus />

      <section className="work-preview">
        <Reveal className="section-header">
          <p className="section-label">Selected work</p>
          <div className="section-header__row">
            <h2>Projects where design meets operational reality.</h2>
            <Link className="inline-link" to="/work">
              View all projects →
            </Link>
          </div>
        </Reveal>

        <ProjectCarousel activeProject={activeProject} onChange={setActiveProject} />
        <FeaturedProject project={activeProject} />
      </section>

      <ContactPreview />
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page-stack">
      <PageHero
        compact
        eyebrow="About / Stack"
        title="Thoughtful by default. Human at the center."
        description="I build frontend systems that stay usable under complexity, and I like work where implementation details matter as much as the visual finish."
      >
        <div className="about-hero-visual">
          <div className="glass-card architecture-card">
            <p className="floating-card__meta">Architecture</p>
            <ul>
              <li>components/</li>
              <li>features/</li>
              <li>hooks/</li>
              <li>styles/</li>
              <li>utils/</li>
            </ul>
          </div>
          <div className="glass-card quality-card">
            <p className="floating-card__meta">Quality</p>
            <strong>A100</strong>
            <span>Performance, accessibility, best practices, SEO</span>
          </div>
        </div>
      </PageHero>

      <section className="about-layout">
        <Reveal className="glass-card philosophy-panel">
          <p className="section-label">Philosophy</p>
          <h2>Interfaces should disappear into the task.</h2>
          <p>
            My goal is to make ambitious products feel obvious to use. That
            usually means cutting friction, clarifying state, and making motion
            serve understanding instead of decoration.
          </p>

          <div className="philosophy-list">
            {philosophyPoints.map(function renderPoint(point) {
              return (
                <div className="philosophy-item" key={point.title}>
                  <i />
                  <div>
                    <strong>{point.title}</strong>
                    <span>{point.body}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <div className="stack-grid" id="stack">
          {stackCards.map(function renderCard(card, index) {
            return (
              <Reveal className="glass-card stack-tile" delay={index * 55} key={card.name}>
                <span className="stack-card__icon">{card.name.slice(0, 2)}</span>
                <h3>{card.name}</h3>
                <p>{card.blurb}</p>
                <small>{card.version}</small>
              </Reveal>
            );
          })}
        </div>
      </section>

      <SkillFocus />

      <section className="build-grid">
        <Reveal className="glass-card build-card">
          <p className="section-label">Tech stack</p>
          <h3>Fast, predictable frontend systems</h3>
          <p>React, TypeScript, Tailwind CSS, and component-first architecture.</p>
        </Reveal>
        <Reveal className="glass-card build-card" delay={80}>
          <p className="section-label">Architecture</p>
          <h3>Maintainable by intent</h3>
          <p>Reusable sections, clear data structures, and route-aware composition.</p>
        </Reveal>
        <Reveal className="glass-card build-card" delay={160}>
          <p className="section-label">Design system</p>
          <h3>Quiet UI with strong hierarchy</h3>
          <p>Spacing, motion, and interaction tokens that create a coherent product feel.</p>
        </Reveal>
        <Reveal className="glass-card build-card" delay={240}>
          <p className="section-label">Quality</p>
          <h3>Operationally aware frontend</h3>
          <p>Responsive QA, edge-state handling, and release polish as part of the build.</p>
        </Reveal>
      </section>

      <Reveal className="resume-banner">
        <div>
          <p className="section-label">Resume</p>
          <h2>Download the current resume.</h2>
          <p>Condensed project history, responsibilities, and core strengths.</p>
        </div>
        <MagneticButton href={contactLinks[2].href} variant="primary">
          Download PDF
        </MagneticButton>
      </Reveal>
    </div>
  );
}

function WorkPage() {
  const [activeProject, setActiveProject] = useState(projects[0]);

  return (
    <div className="page-stack">
      <PageHero
        compact
        eyebrow="Work / Projects"
        title="A project list designed like a product surface."
        description="The center card stays dominant, side cards remain readable, and each case study can expand into the reasoning behind the build."
      >
        <div className="mini-terminal">
          <span>Selected work</span>
          <strong>{projects.length} case studies</strong>
          <small>carousel + detail flow</small>
        </div>
      </PageHero>

      <ProjectCarousel activeProject={activeProject} onChange={setActiveProject} />
      <FeaturedProject project={activeProject} />

      <section className="all-projects-grid">
        {projects.map(function renderProject(project, index) {
          return (
            <Reveal className="glass-card project-list-card" delay={index * 70} key={project.slug}>
              <img alt={project.title} src={project.heroImage} />
              <div>
                <p className="section-label">{project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.shortDescription}</p>
                <Link className="inline-link" to={"/work/".concat(project.slug)}>
                  View case study →
                </Link>
              </div>
            </Reveal>
          );
        })}
      </section>
    </div>
  );
}

function DetailSectionNav(props) {
  const {sections, activeSection} = props;

  return (
    <aside className="detail-nav">
      {sections.map(function renderSection(section, index) {
        return (
          <button
            className={
              activeSection === section.id ? "detail-nav__item is-active" : "detail-nav__item"
            }
            key={section.id}
            type="button"
            onClick={function scrollToSection() {
              const target = document.getElementById(section.id);
              if (target) {
                target.scrollIntoView({behavior: "smooth", block: "start"});
              }
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{section.label}</strong>
          </button>
        );
      })}
    </aside>
  );
}

function ProjectDetailPage() {
  const params = useParams();
  const project = getProject(params.slug);
  const sectionList = useMemo(
    function buildSections() {
      return [
        {id: "overview", label: "Overview"},
        {id: "problem", label: "Problem"},
        {id: "solution", label: "Solution"},
        {id: "role", label: "My Role"},
        {id: "features", label: "Key Features"},
        {id: "assets", label: "Real Assets"},
        {id: "flow", label: "UI Flow"},
        {id: "learning", label: "What I Learned"}
      ];
    },
    []
  );
  const [activeSection, setActiveSection] = useState(sectionList[0].id);

  useEffect(() => {
    const sections = sectionList
      .map(function mapSection(section) {
        return document.getElementById(section.id);
      })
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      function observe(entries) {
        entries.forEach(function each(entry) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0.2
      }
    );

    sections.forEach(function attach(section) {
      observer.observe(section);
    });

    return function cleanup() {
      observer.disconnect();
    };
  }, [project, sectionList]);

  if (!project) {
    return <Navigate replace to="/work" />;
  }

  return (
    <div className="page-stack detail-page">
      <PageHero
        compact
        eyebrow={project.label}
        title={project.title}
        description={project.shortDescription}
        actions={
          <React.Fragment>
            {project.liveUrl ? (
              <MagneticButton href={project.liveUrl} variant="primary">
                Live project
              </MagneticButton>
            ) : null}
            {project.codeUrl ? (
              <MagneticButton href={project.codeUrl} variant="ghost">
                View code
              </MagneticButton>
            ) : null}
          </React.Fragment>
        }
      >
        <div className="detail-hero-visual">
          <img alt={project.title} src={project.heroImage} />
        </div>
      </PageHero>

      <section className="metrics-row">
        {project.metrics.map(function renderMetric(metric, index) {
          return (
            <Reveal className="glass-card metric-card" delay={index * 70} key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </Reveal>
          );
        })}
      </section>

      <section className="detail-layout">
        <DetailSectionNav activeSection={activeSection} sections={sectionList} />

        <div className="detail-content">
          <Reveal className="glass-card detail-section" id="overview">
            <div className="detail-section__header">
              <p className="section-label">Overview</p>
              <div className="chip-row">
                {project.stack.map(function renderStack(item) {
                  return <span key={item}>{item}</span>;
                })}
              </div>
            </div>
            <h2>{project.title} in context</h2>
            <p>{project.overview}</p>
          </Reveal>

          <Reveal className="glass-card detail-section" id="problem" delay={80}>
            <p className="section-label">Problem</p>
            <div className="list-grid">
              {project.problem.map(function renderPoint(item) {
                return (
                  <article className="mini-panel" key={item}>
                    <strong>Issue</strong>
                    <p>{item}</p>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="glass-card detail-section" id="solution" delay={120}>
            <p className="section-label">Solution</p>
            <div className="list-grid">
              {project.solution.map(function renderPoint(item) {
                return (
                  <article className="mini-panel is-accent" key={item}>
                    <strong>Response</strong>
                    <p>{item}</p>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="glass-card detail-section" id="role" delay={160}>
            <p className="section-label">My Role</p>
            <div className="role-grid">
              {project.rolePoints.map(function renderPoint(item) {
                return (
                  <div className="role-pill" key={item}>
                    {item}
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="glass-card detail-section" id="features" delay={200}>
            <div className="detail-section__header">
              <p className="section-label">Key Features</p>
              <Link className="inline-link" to="/work">
                All projects →
              </Link>
            </div>
            <div className="case-study-stack">
              {project.features.map(function renderFeature(feature, index) {
                return (
                  <article
                    className={
                      index % 2 === 1
                        ? "case-study-block is-reversed"
                        : "case-study-block"
                    }
                    key={feature.title}
                  >
                    <div className="case-study-media">
                      <img alt={feature.title} src={feature.image} />
                    </div>
                    <div className="case-study-copy">
                      <span className="case-study-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3>{feature.title}</h3>
                      <p>{feature.body}</p>
                      <div className="chip-row">
                        {project.stack.slice(0, 4).map(function renderStackTag(tag) {
                          return <span key={feature.title + tag}>{tag}</span>;
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="glass-card detail-section" id="assets" delay={220}>
            <div className="detail-section__header">
              <div>
                <p className="section-label">Screenshots / code snippets</p>
                <h2>기존 포트폴리오 자료를 흐름대로 정리했습니다.</h2>
                <p>
                  메인 화면, 기능 화면, 분석 자료, 코드 캡처가 각각 어떤 역할을
                  했는지 같이 볼 수 있게 배치했습니다.
                </p>
              </div>
              <span className="inline-link">{project.gallery.length} images</span>
            </div>
            <div className="asset-story-grid">
              {project.gallery.map(function renderAsset(asset, index) {
                const image = asset.image || asset;
                const caption = asset.caption || "실제 프로젝트 화면 / 코드 캡처";
                const body = asset.body || project.title;

                return (
                  <figure className="asset-story-card" key={project.slug + "-asset-" + index}>
                    <img alt={project.title + " asset " + (index + 1)} src={image} />
                    <figcaption>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{caption}</strong>
                      <small>{body}</small>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="glass-card detail-section" id="flow" delay={240}>
            <p className="section-label">UI Flow</p>
            <div className="flow-row">
              {project.flow.map(function renderStep(step, index) {
                return (
                  <div className="flow-step" key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="glass-card detail-section" id="learning" delay={280}>
            <p className="section-label">What I Learned</p>
            <div className="list-grid">
              {project.learnings.map(function renderLearning(item) {
                return (
                  <article className="mini-panel" key={item}>
                    <strong>Learning</strong>
                    <p>{item}</p>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function NotesPage() {
  return (
    <div className="page-stack">
      <PageHero
        compact
        eyebrow="Process / Notes"
        title="How I think. How I build."
        description="A peek behind the screen: process, notes, and small interface experiments that shape how products get shipped."
      >
        <div className="notes-hero-cluster">
          <div className="glass-card notes-hero-card">
            <p className="floating-card__meta">Process</p>
            <strong>Discover → Define → Build → Refine</strong>
          </div>
          <div className="glass-card notes-hero-card is-dark">
            <p className="floating-card__meta">Terminal</p>
            <strong>ready in 420ms</strong>
          </div>
        </div>
      </PageHero>

      <section className="process-row">
        {processSteps.map(function renderStep(step, index) {
          return (
            <Reveal className="process-step" delay={index * 70} key={step.step}>
              <span>{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          );
        })}
      </section>

      <section className="build-grid">
        <Reveal className="glass-card build-card">
          <p className="section-label">How I build</p>
          <h3>Tech stack</h3>
          <p>React, TypeScript, Tailwind CSS, and motion systems that stay maintainable.</p>
        </Reveal>
        <Reveal className="glass-card build-card" delay={80}>
          <p className="section-label">Architecture</p>
          <h3>Feature-first organization</h3>
          <p>Reusable sections, route-aware content, and data-driven project structure.</p>
        </Reveal>
        <Reveal className="glass-card build-card" delay={160}>
          <p className="section-label">Design system</p>
          <h3>Quiet but interactive</h3>
          <p>Minimal surfaces, strong typography, and deliberate accents instead of noise.</p>
        </Reveal>
        <Reveal className="glass-card build-card" delay={240}>
          <p className="section-label">Quality</p>
          <h3>Measure and refine</h3>
          <p>Performance, accessibility, responsive behavior, and release-time confidence.</p>
        </Reveal>
      </section>

      <section>
        <Reveal className="section-header">
          <p className="section-label">Notes</p>
          <div className="section-header__row">
            <h2>Thoughts on code, design, and product.</h2>
            <span className="inline-link">Browse all →</span>
          </div>
        </Reveal>

        <div className="notes-grid">
          {notesArticles.map(function renderArticle(article, index) {
            return (
              <Reveal className="glass-card note-card" delay={index * 70} key={article.title}>
                <span className="note-meta">
                  {article.category} · {article.readTime}
                </span>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="note-thumb" />
              </Reveal>
            );
          })}
        </div>
      </section>

      <section>
        <Reveal className="section-header">
          <p className="section-label">UI Experiments</p>
          <div className="section-header__row">
            <h2>Small motion studies and interaction drills.</h2>
            <span className="inline-link">View all experiments →</span>
          </div>
        </Reveal>

        <div className="experiment-grid">
          {uiExperiments.map(function renderExperiment(experiment, index) {
            return (
              <Reveal className="glass-card experiment-card" delay={index * 60} key={experiment.title}>
                <div className="experiment-visual" />
                <h3>{experiment.title}</h3>
                <p>{experiment.body}</p>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: contactFormDefaults.subject,
    message: ""
  });

  const updateField = function updateField(event) {
    const {name, value} = event.target;
    setForm(function apply(current) {
      return Object.assign({}, current, {[name]: value});
    });
  };

  const submit = function submit(event) {
    event.preventDefault();
    const body = [
      "Name: ".concat(form.name),
      "Email: ".concat(form.email),
      "",
      form.message
    ].join("\n");

    window.location.href =
      "mailto:toadsam@naver.com?subject="
        .concat(encodeURIComponent(form.subject), "&body=")
        .concat(encodeURIComponent(body));
  };

  return (
    <form className="glass-card contact-form" onSubmit={submit}>
      <div className="contact-form__header">
        <h2>Send a message</h2>
        <p>Share a few details and I will get back to you soon.</p>
      </div>

      <div className="form-grid">
        <label>
          <span>Your name</span>
          <input name="name" onChange={updateField} placeholder="Name" value={form.name} />
        </label>
        <label>
          <span>Email</span>
          <input
            name="email"
            onChange={updateField}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
        </label>
      </div>

      <label>
        <span>Subject</span>
        <input
          name="subject"
          onChange={updateField}
          placeholder="Project inquiry / Collaboration / Other"
          value={form.subject}
        />
      </label>

      <label>
        <span>Message</span>
        <textarea
          maxLength="500"
          name="message"
          onChange={updateField}
          placeholder="Tell me about your project or idea..."
          rows="7"
          value={form.message}
        />
      </label>

      <div className="contact-form__footer">
        <small>{form.message.length} / 500</small>
        <MagneticButton className="contact-form__submit" type="submit" variant="primary">
          Send message
        </MagneticButton>
      </div>
    </form>
  );
}

function ContactPage() {
  return (
    <div className="page-stack">
      <PageHero
        compact
        eyebrow="Let's connect"
        title="Let's build something thoughtful."
        description="I am always open to new opportunities, collaboration, and products that care about quality from the first interaction."
      >
        <div className="glass-card contact-hero-card">
          <p className="section-label">Say hello</p>
          <strong>toadsam@naver.com</strong>
          <span>Drop me a line anytime.</span>
        </div>
      </PageHero>

      <section className="contact-layout">
        <div className="contact-side">
          <Reveal className="glass-card availability-card">
            <span className="status-dot" />
            <div>
              <strong>Available for new opportunities</strong>
              <p>Typically replies within 24 hours.</p>
            </div>
          </Reveal>

          <div className="contact-card-list">
            {contactLinks.map(function renderLink(link, index) {
              return (
                <Reveal
                  as="a"
                  className="glass-card contact-link-card"
                  delay={index * 70}
                  href={link.href}
                  key={link.label}
                  rel="noopener noreferrer"
                  target={link.href.indexOf("mailto:") === 0 ? undefined : "_blank"}
                >
                  <span>{link.label}</span>
                  <strong>{link.value}</strong>
                  <i>↗</i>
                </Reveal>
              );
            })}
          </div>
        </div>

        <ContactForm />
      </section>

      <Reveal className="glass-card schedule-card">
        <div className="schedule-card__calendar">
          <strong>{scheduleCard.month}</strong>
          <div className="calendar-grid">
            {[1, 2, 3, 4, 5, 6, 7].map(function renderDay(day) {
              return <span key={day}>{day}</span>;
            })}
            {[8, 9, 10, 11, 12, 13, 14].map(function renderDay(day) {
              return <span key={day}>{day}</span>;
            })}
            {[15, 16, 17, 18, 19, 20, 21].map(function renderDay(day) {
              return <span key={day}>{day}</span>;
            })}
            {[22, 23, 24, 25, 26, 27, 28].map(function renderDay(day) {
              return (
                <span className={day === 25 ? "is-selected" : ""} key={day}>
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        <div className="schedule-card__copy">
          <p className="section-label">Let's meet</p>
          <h2>{scheduleCard.prompt}</h2>
          <p>{scheduleCard.description}</p>
          <MagneticButton href="mailto:toadsam@naver.com" variant="ghost">
            {scheduleCard.cta}
          </MagneticButton>
        </div>
      </Reveal>
    </div>
  );
}

function AppFrame() {
  const location = useLocation();

  useScrollToTop();

  return (
    <div className="portfolio-shell">
      <CursorGlow />
      <Header />
      <main className="page-shell">
        <Routes location={location}>
          <Route element={<HomePage />} path="/" />
          <Route element={<AboutPage />} path="/about" />
          <Route element={<AboutPage />} path="/stack" />
          <Route element={<WorkPage />} path="/work" />
          <Route element={<ProjectDetailPage />} path="/work/:slug" />
          <Route element={<NotesPage />} path="/notes" />
          <Route element={<ContactPage />} path="/contact" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}

function PortfolioApp() {
  const [theme, setTheme] = useLocalStorage("portfolio-theme", "light");
  const isDark = theme === "dark";

  useEffect(() => {
    document.body.classList.toggle("theme-dark", isDark);
    return function cleanup() {
      document.body.classList.remove("theme-dark");
    };
  }, [isDark]);

  const contextValue = useMemo(
    function buildContextValue() {
      return {
        isDark: isDark,
        toggleTheme: function toggleTheme() {
          setTheme(isDark ? "light" : "dark");
        }
      };
    },
    [isDark, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <HashRouter>
        <AppFrame />
      </HashRouter>
    </ThemeContext.Provider>
  );
}

export default PortfolioApp;
