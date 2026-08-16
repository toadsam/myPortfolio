import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  bigProjects,
  contactInfo,
  greeting,
  skillsSection,
  socialMediaLinks,
  techStack
} from "../../portfolio";
import "./motionPortfolio.css";

const accents = [
  "#29e7a7",
  "#67d8ff",
  "#f6c85f",
  "#ff6b91",
  "#a78bfa",
  "#74f2ce",
  "#ff9f6e",
  "#8ae66e"
];

function asArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function compact(items) {
  return items.filter(Boolean);
}

function flattenText(value) {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(flattenText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return flattenText([
      value.title,
      value.desc,
      value.description,
      value.oneLiner
    ]);
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function joinText() {
  return Array.prototype.slice
    .call(arguments)
    .map(flattenText)
    .filter(Boolean)
    .join(" ");
}

function shorten(text, maxLength) {
  const clean = flattenText(text);

  if (clean.length <= maxLength) {
    return clean;
  }

  return clean.slice(0, maxLength - 1).trim() + "...";
}

function unique(items) {
  return items.filter(function filterUnique(item, index) {
    return item && items.indexOf(item) === index;
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseStack(project) {
  const details = project.details || {};
  const overview = details.overview || {};
  const tagStack = asArray(project.tags).map(function cleanTag(tag) {
    return String(tag).replace(/^#/, "").trim();
  });
  const overviewStack = asArray(overview.techStack).flatMap(function parseLine(
    line
  ) {
    const text = String(line);
    const stackText =
      text.indexOf(":") >= 0 ? text.split(":").slice(1).join(":") : text;

    return stackText.split(",").map(function trimStack(item) {
      return item.trim();
    });
  });

  return unique(tagStack.concat(overviewStack)).slice(0, 7);
}

function getProjectLinks(project) {
  const details = project.details || {};
  const rawLinks = asArray(details.links).concat(asArray(project.footerLink));
  const seen = {};

  return rawLinks
    .filter(function hasUrl(link) {
      return link && link.url && !seen[link.url];
    })
    .map(function rememberLink(link) {
      seen[link.url] = true;
      return link;
    });
}

function getProjectGallery(project, heroImage) {
  const details = project.details || {};
  const overview = details.overview || {};
  const intro = details.intro || {};
  const coreDesignImages = asArray(details.coreDesign).map(function mapDesign(
    item
  ) {
    return item.proofImage || item.image;
  });
  const featureImages = asArray(details.coreFeatureShots).map(
    function mapFeature(item) {
      return item.proofImage || item.image;
    }
  );
  const rawImages = compact(
    [heroImage, overview.image, project.image]
      .concat(asArray(intro.images))
      .concat(coreDesignImages)
      .concat(featureImages)
  );
  const seen = {};

  return rawImages
    .filter(function onlyUnique(image) {
      const key = String(image);

      if (seen[key]) {
        return false;
      }

      seen[key] = true;
      return true;
    })
    .slice(0, 5);
}

function getMetrics(project, stack) {
  const details = project.details || {};
  const quickSummary = asArray(details.quickSummary).map(function mapSummary(
    item
  ) {
    return {
      value: item.title,
      label: item.desc
    };
  });

  if (quickSummary.length) {
    return quickSummary.slice(0, 3);
  }

  return [
    {
      value: project.status === "live" ? "LIVE" : "CASE",
      label: "Project status"
    },
    {value: stack[0] || "React", label: "Primary stack"},
    {value: (details.overview || {}).period || "Portfolio", label: "Timeline"}
  ];
}

function normalizeProject(project, index) {
  const details = project.details || {};
  const overview = details.overview || {};
  const intro = details.intro || {};
  const problemSolution = details.problemSolution || {};
  const stack = parseStack(project);
  const heroImage = overview.image || asArray(intro.images)[0] || project.image;
  const title = project.projectName || overview.title || "Untitled Project";
  const links = getProjectLinks(project);
  const problem = asArray(problemSolution.problem)
    .concat(asArray(details.problemGoal))
    .concat(asArray(intro.problem))
    .map(flattenText)
    .filter(Boolean)
    .slice(0, 3);
  const solution = asArray(problemSolution.solution)
    .concat(asArray(problemSolution.outcome))
    .concat(asArray(intro.solution))
    .concat(asArray(intro.outcome))
    .concat(asArray(overview.coreValue))
    .map(flattenText)
    .filter(Boolean)
    .slice(0, 3);

  return {
    id: "project-" + index,
    number: String(index + 1).padStart(2, "0"),
    title: title,
    label: project.status === "live" ? "Live Work" : "Case Archive",
    category:
      project.tags && project.tags.length
        ? String(project.tags[0]).replace("#", "")
        : "Project",
    role: overview.role || details.role || "Planning / Development",
    period: overview.period || "",
    description: shorten(
      joinText(project.recommendation, project.projectDesc),
      176
    ),
    deepDescription: joinText(
      overview.coreValue,
      project.projectDesc,
      project.recommendation
    ),
    image: heroImage,
    gallery: getProjectGallery(project, heroImage),
    stack: stack,
    metrics: getMetrics(project, stack),
    problem: problem.length ? problem : [shorten(project.projectDesc, 120)],
    solution: solution.length
      ? solution
      : [shorten(project.recommendation, 120)],
    links: links,
    accent: accents[index % accents.length]
  };
}

function getPrimaryLink(project) {
  return project.links.find(function findLive(link) {
    return link.url.indexOf("github.com") < 0;
  });
}

function getCodeLink(project) {
  return project.links.find(function findCode(link) {
    return link.url.indexOf("github.com") >= 0;
  });
}

function HudHeader(props) {
  const {activeProject, clock, menuOpen, onOpenMenu, onScrollTo} = props;
  const navItems = [
    ["home", "Home"],
    ["works", "Works"],
    ["stack", "Stack"],
    ["contact", "Contact"]
  ];

  return (
    <header className="mp-hud" aria-label="Portfolio navigation">
      <button
        className="mp-brand"
        type="button"
        onClick={function scrollHome() {
          onScrollTo("home");
        }}
      >
        <strong>JH</strong>
        <span>Interactive Portfolio</span>
      </button>
      <nav className="mp-nav" aria-label="Primary">
        {navItems.map(function renderNav(item) {
          return (
            <button
              key={item[0]}
              type="button"
              onClick={function scrollToSection() {
                onScrollTo(item[0]);
              }}
            >
              {item[1]}
            </button>
          );
        })}
      </nav>
      <div className="mp-hud__right">
        <span className="mp-status" title={activeProject.title}>
          {activeProject.number} / {activeProject.category}
        </span>
        <span className="mp-clock">{clock}</span>
        <button
          aria-expanded={menuOpen}
          aria-label="Open navigation menu"
          className="mp-menu-button"
          type="button"
          onClick={onOpenMenu}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function MenuOverlay(props) {
  const {isOpen, onClose, onScrollTo} = props;
  const menuItems = [
    ["home", "HOME", "Intro and current focus"],
    ["works", "WORKS", "Scroll-driven project cards"],
    ["stack", "STACK", "Systems, skills, and process"],
    ["contact", "CONTACT", "Email, GitHub, resume"]
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="mp-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <button
        className="mp-menu__backdrop"
        type="button"
        aria-label="Close menu"
        onClick={onClose}
      />
      <section className="mp-menu__panel">
        <div className="mp-menu__top">
          <span>Navigation</span>
          <button
            className="mp-square-button"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
        <div className="mp-menu__links">
          {menuItems.map(function renderItem(item) {
            return (
              <button
                key={item[0]}
                type="button"
                onClick={function openSection() {
                  onScrollTo(item[0]);
                }}
              >
                <strong>{item[1]}</strong>
                <span>{item[2]}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function LivingField(props) {
  const {activeProject, projects, scrollProgress} = props;
  const particles = projects
    .concat(projects)
    .slice(0, 12)
    .map(function mapParticle(project, index) {
      return {
        id: project.id + "-particle-" + index,
        accent: project.accent,
        left: 8 + ((index * 17) % 86),
        top: 12 + ((index * 23) % 76),
        size: 5 + (index % 4) * 2,
        delay: -index * 0.7,
        duration: 7 + (index % 5) * 1.4
      };
    });

  return (
    <div
      className="mp-living-field"
      aria-hidden="true"
      style={{
        "--active-accent": activeProject.accent,
        "--scroll-progress": scrollProgress
      }}
    >
      <div className="mp-living-field__cursor" />
      <div className="mp-living-field__mesh" />
      <div className="mp-living-field__scanner" />
      <div className="mp-living-routes">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="mp-living-particles">
        {particles.map(function renderParticle(particle) {
          return (
            <i
              key={particle.id}
              style={{
                "--particle-accent": particle.accent,
                "--particle-delay": particle.delay + "s",
                "--particle-duration": particle.duration + "s",
                "--particle-left": particle.left + "%",
                "--particle-size": particle.size + "px",
                "--particle-top": particle.top + "%"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function HeroPreview(props) {
  const {projects} = props;

  return (
    <div className="mp-hero-preview" aria-label="Featured project preview">
      <div className="mp-preview-grid" aria-hidden="true" />
      {projects.slice(0, 4).map(function renderPreview(project, index) {
        return (
          <article
            className={"mp-preview-card mp-preview-card--" + index}
            key={project.id}
            style={{"--project-accent": project.accent}}
          >
            <img src={project.image} alt="" />
            <div>
              <span>{project.number}</span>
              <strong>{project.title}</strong>
            </div>
          </article>
        );
      })}
      <div className="mp-signal-panel">
        <span>Scroll Sequence</span>
        <strong>Cards lock, move, and hand off by scroll depth.</strong>
      </div>
    </div>
  );
}

function Hero(props) {
  const {projects, onScrollTo} = props;

  return (
    <section className="mp-hero" id="home">
      <div className="mp-hero__copy">
        <span className="mp-eyebrow">Web / Full-Stack / Interaction</span>
        <h1>정재훈</h1>
        <p>{flattenText(greeting.subTitle)}</p>
        <div className="mp-hero__actions">
          <button
            className="mp-action-button"
            type="button"
            onClick={function openWorks() {
              onScrollTo("works");
            }}
          >
            <i className="fas fa-layer-group" aria-hidden="true" />
            View Works
          </button>
          <button
            className="mp-action-button is-secondary"
            type="button"
            onClick={function openStack() {
              onScrollTo("stack");
            }}
          >
            <i className="fas fa-terminal" aria-hidden="true" />
            System Stack
          </button>
        </div>
      </div>
      <HeroPreview projects={projects} />
      <aside className="mp-hero__rail" aria-hidden="true">
        <span>Scroll to operate</span>
        <i />
      </aside>
    </section>
  );
}

function ProjectCard(props) {
  const {focus, isActive, offset, onOpenProject, project, style} = props;
  const primaryLink = getPrimaryLink(project);
  const codeLink = getCodeLink(project);
  const tabIndex = isActive ? 0 : -1;
  const miniGallery = project.gallery.slice(1, 4);

  return (
    <article
      aria-hidden={!isActive}
      className={isActive ? "mp-project-card is-active" : "mp-project-card"}
      style={style}
    >
      <div className="mp-card__media">
        <span className="mp-card__corner mp-card__corner--tl" />
        <span className="mp-card__corner mp-card__corner--tr" />
        <span className="mp-card__corner mp-card__corner--bl" />
        <span className="mp-card__corner mp-card__corner--br" />
        <img src={project.image} alt={project.title + " preview"} />
        <div className="mp-card__depth-map" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="mp-mini-gallery" aria-hidden="true">
          {miniGallery.map(function renderMiniImage(image, index) {
            return (
              <img
                alt=""
                key={String(image) + index}
                src={image}
                style={{
                  "--mini-delay": index * 60 + "ms",
                  "--mini-y-offset": index * -8 + "px"
                }}
              />
            );
          })}
        </div>
        <div className="mp-card__scan" aria-hidden="true" />
        <div className="mp-card__pulse" aria-hidden="true" />
        <div className="mp-card__media-label">
          <span>{project.label}</span>
          <strong>{project.number}</strong>
        </div>
      </div>
      <div className="mp-card__body">
        <div className="mp-card__meta">
          <span>{project.category}</span>
          <span>
            {focus > 0.78 ? "In focus" : offset < 0 ? "Leaving" : "Approaching"}
          </span>
        </div>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="mp-metric-row">
          {project.metrics.map(function renderMetric(metric) {
            return (
              <section key={metric.value + metric.label}>
                <strong>{shorten(metric.value, 24)}</strong>
                <span>{shorten(metric.label, 42)}</span>
              </section>
            );
          })}
        </div>
        <div className="mp-chip-row">
          {project.stack.slice(0, 5).map(function renderChip(stack) {
            return <span key={stack}>{stack}</span>;
          })}
        </div>
        <div className="mp-card__actions">
          <button
            className="mp-action-button"
            type="button"
            tabIndex={tabIndex}
            onClick={function openProject() {
              onOpenProject(project);
            }}
          >
            <i className="fas fa-search-plus" aria-hidden="true" />
            Case details
          </button>
          {primaryLink ? (
            <a
              className="mp-icon-link"
              href={primaryLink.url}
              rel="noreferrer"
              target="_blank"
              tabIndex={tabIndex}
            >
              <i className="fas fa-external-link-alt" aria-hidden="true" />
              Live
            </a>
          ) : null}
          {codeLink ? (
            <a
              className="mp-icon-link"
              href={codeLink.url}
              rel="noreferrer"
              target="_blank"
              tabIndex={tabIndex}
            >
              <i className="fab fa-github" aria-hidden="true" />
              Code
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProjectSequence(props) {
  const {
    activeIndex,
    onOpenProject,
    onScrollToProject,
    projects,
    scrollProgress,
    trackRef
  } = props;
  const activeProject = projects[activeIndex];
  const safeProgress = Number.isFinite(scrollProgress) ? scrollProgress : 0;
  const continuousIndex = safeProgress * Math.max(projects.length - 1, 1);
  const stagePercent = Math.round(safeProgress * 100);

  return (
    <section
      className="mp-project-sequence"
      id="works"
      ref={trackRef}
      style={{
        "--active-accent": activeProject.accent,
        "--sequence-progress": safeProgress,
        minHeight: Math.max(projects.length * 126, 620) + "vh"
      }}
    >
      <div className="mp-project-stage">
        <aside className="mp-sequence-info">
          <span className="mp-eyebrow">Featured Work</span>
          <h2>{activeProject.title}</h2>
          <p>{activeProject.role}</p>
          <div className="mp-progress-readout">
            <strong>{activeProject.number}</strong>
            <span>{String(projects.length).padStart(2, "0")}</span>
          </div>
          <div className="mp-stage-telemetry" aria-hidden="true">
            <span>Timeline</span>
            <i style={{"--telemetry-progress": stagePercent + "%"}} />
            <strong>{stagePercent}%</strong>
          </div>
        </aside>
        <div className="mp-card-stack" aria-live="polite">
          {projects.map(function renderProject(project, index) {
            const offset = index - continuousIndex;
            const absOffset = Math.abs(offset);
            const clampedOffset = Math.max(-3, Math.min(3, offset));
            const focus = clamp(1 - absOffset, 0, 1);
            const scale =
              0.82 + focus * 0.18 - Math.min(absOffset * 0.025, 0.06);
            const x = clampedOffset * 96;
            const y =
              offset === 0
                ? 0
                : clampedOffset * 58 + Math.pow(absOffset, 1.2) * 18;
            const rotate = clampedOffset * -5.6;
            const rawOpacity =
              offset < -2.2 || offset > 3.2
                ? 0
                : Math.max(
                    0,
                    0.12 + focus * 0.88 - Math.max(absOffset - 1, 0) * 0.14
                  );
            const opacity = Number.isFinite(rawOpacity) ? rawOpacity : 0;
            const style = {
              "--abs-offset": absOffset,
              "--card-shine-opacity": focus * 0.55,
              "--content-opacity": 0.34 + focus * 0.66,
              "--content-shift": Math.min(absOffset * 28, 44) + "px",
              "--corner-opacity": 0.35 + focus * 0.5,
              "--depth-opacity": 0.12 + focus * 0.34,
              "--depth-shift": clampedOffset * 6 + "px",
              "--focus": focus,
              "--image-drift": clampedOffset * -18 + "px",
              "--image-scale": 1.08 - focus * 0.04,
              "--mini-opacity": 0.12 + focus * 0.88,
              "--mini-shift": clampedOffset * 22 + "px",
              "--mini-y": (1 - focus) * 16 + "px",
              "--pulse-opacity": focus * 0.84,
              "--project-accent": project.accent,
              "--ring-opacity": 0.12 + focus * 0.42,
              "--scan-opacity": 0.16 + focus * 0.36,
              "--shine-shift": clampedOffset * 9 + "px",
              filter: "blur(" + Math.min(absOffset * 0.7, 2.6) + "px)",
              opacity: opacity,
              transform:
                "translate3d(" +
                x +
                "px, " +
                y +
                "px, 0) rotate(" +
                rotate +
                "deg) scale(" +
                scale +
                ")",
              zIndex: Math.round(100 - absOffset * 10)
            };

            return (
              <ProjectCard
                isActive={index === activeIndex}
                key={project.id}
                focus={focus}
                offset={offset}
                onOpenProject={onOpenProject}
                project={project}
                style={style}
              />
            );
          })}
        </div>
        <nav className="mp-project-dots" aria-label="Project sequence">
          {projects.map(function renderDot(project, index) {
            return (
              <button
                aria-current={index === activeIndex ? "step" : undefined}
                aria-label={"Move to " + project.title}
                key={project.id}
                type="button"
                onClick={function scrollToProject() {
                  onScrollToProject(index);
                }}
              >
                <span>{project.number}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

function StackSection(props) {
  const {projects} = props;
  const skillNames = asArray(skillsSection.softwareSkills)
    .map(function mapSkill(skill) {
      return skill.skillName;
    })
    .slice(0, 12);
  const processCards = [
    {
      number: "01",
      title: "Problem Flow",
      body: "기능보다 먼저 사용자가 막히는 흐름과 운영 리스크를 정리합니다."
    },
    {
      number: "02",
      title: "Interface Motion",
      body: "카드, 패널, CTA가 순서대로 등장하도록 화면의 리듬을 설계합니다."
    },
    {
      number: "03",
      title: "API Contract",
      body: "프론트 상태와 백엔드 응답이 어긋나지 않도록 데이터 흐름을 맞춥니다."
    },
    {
      number: "04",
      title: "Deploy Check",
      body: "HTTPS, CORS, 인증 만료 같은 운영 문제까지 확인합니다."
    }
  ];

  return (
    <section className="mp-system-section" id="stack">
      <div className="mp-section-copy">
        <span className="mp-eyebrow">System Stack</span>
        <h2>Interactive UI, backed by service thinking.</h2>
        <p>
          웹 프로젝트는 화면만 멋있으면 끝나지 않습니다. 인증, API, 배포,
          피드백까지 이어지는 구조를 기준으로 인터랙션을 설계합니다.
        </p>
      </div>
      <div className="mp-process-grid">
        {processCards.map(function renderProcess(card) {
          return (
            <article key={card.number}>
              <span>{card.number}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          );
        })}
      </div>
      <div className="mp-stack-band">
        <div className="mp-stack-band__copy">
          <span>{projects.length} featured projects</span>
          <strong>
            {asArray(techStack.experience)
              .map(function mapStack(item) {
                return item.Stack;
              })
              .join(" / ")}
          </strong>
        </div>
        <div className="mp-stack-tags">
          {skillNames.map(function renderSkill(skill) {
            return <span key={skill}>{skill}</span>;
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const email =
    contactInfo.email_address || socialMediaLinks.gmail || "toadsam@naver.com";
  const links = [
    {
      label: "Email",
      value: email,
      href: "mailto:" + email,
      icon: "fas fa-envelope"
    },
    {
      label: "GitHub",
      value: socialMediaLinks.github || "https://github.com/toadsam",
      href: socialMediaLinks.github || "https://github.com/toadsam",
      icon: "fab fa-github"
    }
  ];

  return (
    <section className="mp-contact-section" id="contact">
      <div>
        <span className="mp-eyebrow">Signal</span>
        <h2>프로젝트를 실제로 움직이는 화면으로 만듭니다.</h2>
        <p>{contactInfo.subtitle}</p>
      </div>
      <div className="mp-contact-links">
        {links.map(function renderLink(link) {
          return (
            <a
              href={link.href}
              key={link.label}
              rel="noreferrer"
              target={link.href.indexOf("mailto:") === 0 ? undefined : "_blank"}
            >
              <i className={link.icon} aria-hidden="true" />
              <span>{link.label}</span>
              <strong>{link.value.replace(/^https?:\/\//, "")}</strong>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function ProjectModal(props) {
  const {onClose, project} = props;
  const primaryLink = getPrimaryLink(project);
  const codeLink = getCodeLink(project);

  return (
    <div
      className="mp-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mp-modal-title"
    >
      <button
        className="mp-modal__backdrop"
        type="button"
        aria-label="Close case details"
        onClick={onClose}
      />
      <article className="mp-modal__panel">
        <header>
          <div>
            <span className="mp-eyebrow">{project.label}</span>
            <h2 id="mp-modal-title">{project.title}</h2>
            <p>{project.deepDescription || project.description}</p>
          </div>
          <button
            className="mp-square-button"
            type="button"
            aria-label="Close case details"
            onClick={onClose}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>
        <div className="mp-modal__gallery">
          {project.gallery.map(function renderImage(image, index) {
            return (
              <img
                alt={project.title + " screenshot " + (index + 1)}
                key={String(image) + index}
                src={image}
              />
            );
          })}
        </div>
        <div className="mp-modal__grid">
          <section>
            <span>Problem</span>
            {project.problem.map(function renderProblem(item) {
              return <p key={item}>{item}</p>;
            })}
          </section>
          <section>
            <span>Solution</span>
            {project.solution.map(function renderSolution(item) {
              return <p key={item}>{item}</p>;
            })}
          </section>
          <section>
            <span>Role</span>
            <p>{project.role}</p>
          </section>
          <section>
            <span>Stack</span>
            <div className="mp-chip-row">
              {project.stack.map(function renderStack(stack) {
                return <span key={stack}>{stack}</span>;
              })}
            </div>
          </section>
        </div>
        <footer>
          {primaryLink ? (
            <a
              className="mp-action-button"
              href={primaryLink.url}
              rel="noreferrer"
              target="_blank"
            >
              <i className="fas fa-external-link-alt" aria-hidden="true" />
              Open Live
            </a>
          ) : null}
          {codeLink ? (
            <a
              className="mp-action-button is-secondary"
              href={codeLink.url}
              rel="noreferrer"
              target="_blank"
            >
              <i className="fab fa-github" aria-hidden="true" />
              View Code
            </a>
          ) : null}
        </footer>
      </article>
    </div>
  );
}

function MotionPortfolio() {
  const trackRef = useRef(null);
  const projects = useMemo(function normalizeProjects() {
    return (bigProjects.projects || []).slice(0, 6).map(normalizeProject);
  }, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [clock, setClock] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mouse, setMouse] = useState({x: 50, y: 50});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const activeProject = projects[activeIndex] || projects[0];

  useEffect(function applyBodyClass() {
    document.body.classList.add("motion-portfolio-body");

    return function cleanupBodyClass() {
      document.body.classList.remove("motion-portfolio-body");
    };
  }, []);

  useEffect(function updateClock() {
    function setCurrentClock() {
      const formatter = new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit"
      });

      setClock(formatter.format(new Date()));
    }

    setCurrentClock();
    const timer = window.setInterval(setCurrentClock, 30000);

    return function clearClock() {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(
    function syncScrollProgress() {
      const raf = window.requestAnimationFrame || window.setTimeout;
      let ticking = false;

      function updateActiveProject() {
        const track = trackRef.current;

        if (!track || projects.length < 2) {
          return;
        }

        const rect = track.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 1;
        const scrollableDistance = Math.max(
          track.offsetHeight - viewportHeight,
          1
        );
        const progress = Math.max(
          0,
          Math.min(1, -rect.top / scrollableDistance)
        );
        const nextIndex = Math.min(
          projects.length - 1,
          Math.round(progress * (projects.length - 1))
        );

        setScrollProgress(function updateProgress(currentProgress) {
          return Math.abs(currentProgress - progress) < 0.001
            ? currentProgress
            : progress;
        });
        setActiveIndex(function updateIndex(currentIndex) {
          return currentIndex === nextIndex ? currentIndex : nextIndex;
        });
      }

      function onScroll() {
        if (ticking) {
          return;
        }

        ticking = true;
        raf(function runUpdate() {
          updateActiveProject();
          ticking = false;
        });
      }

      updateActiveProject();
      window.addEventListener("scroll", onScroll, {passive: true});
      window.addEventListener("resize", onScroll);

      return function cleanupScroll() {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    },
    [projects.length]
  );

  useEffect(function closeOnEscape() {
    function onKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      setMenuOpen(false);
      setSelectedProject(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return function cleanupEscape() {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const scrollToSection = useCallback(function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);

    setMenuOpen(false);

    if (element) {
      element.scrollIntoView({behavior: "smooth", block: "start"});
    }
  }, []);

  const scrollToProject = useCallback(
    function scrollToProject(index) {
      const track = trackRef.current;

      if (!track || projects.length < 2) {
        return;
      }

      const trackTop = track.getBoundingClientRect().top + window.pageYOffset;
      const distance = Math.max(track.offsetHeight - window.innerHeight, 1);
      const targetTop = trackTop + distance * (index / (projects.length - 1));

      window.scrollTo({top: targetTop, behavior: "smooth"});
    },
    [projects.length]
  );

  const handlePointerMove = useCallback(function handlePointerMove(event) {
    const nextMouse = {
      x: Math.round((event.clientX / Math.max(window.innerWidth, 1)) * 100),
      y: Math.round((event.clientY / Math.max(window.innerHeight, 1)) * 100)
    };

    setMouse(function updateMouse(currentMouse) {
      if (
        Math.abs(currentMouse.x - nextMouse.x) < 2 &&
        Math.abs(currentMouse.y - nextMouse.y) < 2
      ) {
        return currentMouse;
      }

      return nextMouse;
    });
  }, []);

  if (!activeProject) {
    return null;
  }

  return (
    <main
      className="motion-portfolio"
      onMouseMove={handlePointerMove}
      style={{
        "--active-accent": activeProject.accent,
        "--mouse-x": mouse.x + "%",
        "--mouse-y": mouse.y + "%",
        "--scroll-progress": scrollProgress
      }}
    >
      <LivingField
        activeProject={activeProject}
        projects={projects}
        scrollProgress={scrollProgress}
      />
      <div className="mp-frame" aria-hidden="true" />
      <HudHeader
        activeProject={activeProject}
        clock={clock}
        menuOpen={menuOpen}
        onOpenMenu={function openMenu() {
          setMenuOpen(true);
        }}
        onScrollTo={scrollToSection}
      />
      <MenuOverlay
        isOpen={menuOpen}
        onClose={function closeMenu() {
          setMenuOpen(false);
        }}
        onScrollTo={scrollToSection}
      />
      <Hero projects={projects} onScrollTo={scrollToSection} />
      <ProjectSequence
        activeIndex={activeIndex}
        onOpenProject={setSelectedProject}
        onScrollToProject={scrollToProject}
        projects={projects}
        scrollProgress={scrollProgress}
        trackRef={trackRef}
      />
      <StackSection projects={projects} />
      <ContactSection />
      {selectedProject ? (
        <ProjectModal
          project={selectedProject}
          onClose={function closeProject() {
            setSelectedProject(null);
          }}
        />
      ) : null}
    </main>
  );
}

export default MotionPortfolio;
