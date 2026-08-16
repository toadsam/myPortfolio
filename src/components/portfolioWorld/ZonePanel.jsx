import React from "react";
import {
  backendItems,
  contactLinks,
  gameProjects,
  growthSteps,
  mainProjects,
  skillGroups,
  zoneMap,
  zones
} from "./worldData";

function StaggerItem(props) {
  const {children, index, className} = props;

  return (
    <div
      className={className || "world-stagger"}
      style={{"--delay": index * 65 + "ms"}}
    >
      {children}
    </div>
  );
}

function ZonePicker(props) {
  const {activeZone, onSelectZone} = props;

  return (
    <div className="zone-picker" aria-label="Portfolio world zones">
      {zones.map(function renderZone(zone) {
        return (
          <button
            className={
              activeZone === zone.id
                ? "zone-picker__button is-active"
                : "zone-picker__button"
            }
            data-zone-button={zone.id}
            key={zone.id}
            type="button"
            onClick={function selectZone() {
              onSelectZone(zone.id);
            }}
          >
            <span>{zone.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

function TagList(props) {
  const {items} = props;

  return (
    <div className="world-tag-list">
      {items.map(function renderTag(tag) {
        return <span key={tag}>{tag}</span>;
      })}
    </div>
  );
}

function ProjectCard(props) {
  const {project, index, onOpenProject} = props;

  return (
    <StaggerItem className="world-project-card world-stagger" index={index}>
      <article>
        <div>
          <span>{project.category || project.type}</span>
          <h4>{project.name}</h4>
          <p>{project.oneLine || project.text}</p>
        </div>
        <TagList items={(project.tech || [project.type]).slice(0, 4)} />
        <button
          data-project-button={project.id || project.name}
          type="button"
          onClick={function openProject() {
            onOpenProject(project);
          }}
        >
          View case
          <span aria-hidden="true">+</span>
        </button>
      </article>
    </StaggerItem>
  );
}

function IntroPanel(props) {
  const {onSelectZone} = props;

  return (
    <aside className="zone-panel zone-panel--intro" data-panel-zone="world">
      <p className="world-eyebrow">3D Portfolio World</p>
      <h1>
        Explore the world.
        <br />
        Open each living zone.
      </h1>
      <p>
        A submission-ready interactive portfolio built as one compact 3D world.
        Each structure represents a part of my work: skills, projects, backend
        systems, game/XR, growth, and contact.
      </p>
      <div className="zone-panel__quick-actions">
        <button
          type="button"
          onClick={function openProjects() {
            onSelectZone("projects");
          }}
        >
          View projects
        </button>
        <button
          type="button"
          onClick={function openSkills() {
            onSelectZone("skills");
          }}
        >
          Open skills
        </button>
      </div>
      <ZonePicker activeZone="" onSelectZone={onSelectZone} />
      <div className="world-panel-note">
        <span>Hover the glowing markers</span>
        <strong>
          Click a zone to fly closer and reveal the related story.
        </strong>
      </div>
    </aside>
  );
}

function AboutContent() {
  const strengths = [
    "Interactive UI",
    "API-connected product flow",
    "Project storytelling",
    "Game/XR interaction"
  ];

  return (
    <div className="zone-content">
      <StaggerItem index={0}>
        <div className="world-profile-card">
          <span>Developer profile</span>
          <h3>Frontend 중심으로 서비스와 인터랙션을 구현합니다.</h3>
          <p>
            사용자에게 보이는 화면, 실제 API 흐름, 프로젝트 완성도를 함께
            다룹니다. 단순히 예쁜 화면보다 사용자가 이해하고 움직일 수 있는
            경험을 만드는 데 집중합니다.
          </p>
        </div>
      </StaggerItem>
      <div className="world-metric-grid">
        {["React UI", "Spring API", "Unity XR"].map(function renderMetric(
          item,
          index
        ) {
          return (
            <StaggerItem
              className="world-metric world-stagger"
              index={index + 1}
              key={item}
            >
              <strong>{item}</strong>
              <span>
                {index === 0
                  ? "Interface"
                  : index === 1
                  ? "System"
                  : "Interaction"}
              </span>
            </StaggerItem>
          );
        })}
      </div>
      <StaggerItem index={4}>
        <TagList items={strengths} />
      </StaggerItem>
    </div>
  );
}

function SkillsContent() {
  return (
    <div className="zone-content">
      {skillGroups.map(function renderSkill(group, index) {
        return (
          <StaggerItem
            className="world-skill-card world-stagger"
            index={index}
            key={group.title}
          >
            <article>
              <span>{group.title}</span>
              <h4>{group.summary}</h4>
              <p>{group.proof.join(" / ")}</p>
              <TagList items={group.stack} />
            </article>
          </StaggerItem>
        );
      })}
    </div>
  );
}

function ProjectsContent(props) {
  const {onOpenProject} = props;

  return (
    <div className="zone-content world-project-grid">
      {mainProjects.map(function renderProject(project, index) {
        return (
          <ProjectCard
            index={index}
            key={project.id}
            project={project}
            onOpenProject={onOpenProject}
          />
        );
      })}
    </div>
  );
}

function BackendContent() {
  return (
    <div className="zone-content">
      {backendItems.map(function renderItem(item, index) {
        return (
          <StaggerItem
            className="world-system-card world-stagger"
            index={index}
            key={item.title}
          >
            <article>
              <span>{"0" + (index + 1)}</span>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          </StaggerItem>
        );
      })}
      <StaggerItem index={backendItems.length}>
        <TagList
          items={[
            "Spring Boot",
            "Java",
            "REST API",
            "JWT",
            "MySQL",
            "PostgreSQL",
            "CORS",
            "HTTPS"
          ]}
        />
      </StaggerItem>
    </div>
  );
}

function GameContent(props) {
  const {onOpenProject} = props;

  return (
    <div className="zone-content world-project-grid">
      {gameProjects.map(function renderGame(project, index) {
        return (
          <ProjectCard
            index={index}
            key={project.name}
            project={{
              id: project.name,
              name: project.name,
              oneLine: project.text,
              category: project.type,
              tech: ["Unity", "C#", "Interaction"],
              overview: project.text,
              role: "Designed and implemented playable interaction flow, system logic, and prototype feedback.",
              features: [
                "Player interaction",
                "Prototype loop",
                "Scene flow",
                "Game UI"
              ],
              problem:
                "The core challenge was making player actions feel clear and responsive inside a prototype scope.",
              result:
                "Improved my sense of interaction timing, feedback, and game-system structure.",
              github: "#",
              demo: "#"
            }}
            onOpenProject={onOpenProject}
          />
        );
      })}
    </div>
  );
}

function GrowthContent() {
  return (
    <ol className="world-growth-list">
      {growthSteps.map(function renderStep(step, index) {
        return (
          <li
            className="world-stagger"
            key={step[0]}
            style={{"--delay": index * 75 + "ms"}}
          >
            <span>{step[0]}</span>
            <div>
              <strong>{step[1]}</strong>
              <p>{step[2]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ContactContent() {
  return (
    <div className="zone-content world-contact-list">
      {contactLinks.map(function renderLink(link, index) {
        return (
          <a
            className="world-contact-link world-stagger"
            href={link.href}
            key={link.label}
            rel={
              link.href.indexOf("http") === 0
                ? "noopener noreferrer"
                : undefined
            }
            style={{"--delay": index * 70 + "ms"}}
            target={link.href.indexOf("http") === 0 ? "_blank" : undefined}
          >
            <span>{link.label}</span>
            <strong>{link.value}</strong>
          </a>
        );
      })}
    </div>
  );
}

function renderZoneContent(activeZone, onOpenProject) {
  if (activeZone === "about") {
    return <AboutContent />;
  }
  if (activeZone === "skills") {
    return <SkillsContent />;
  }
  if (activeZone === "projects") {
    return <ProjectsContent onOpenProject={onOpenProject} />;
  }
  if (activeZone === "backend") {
    return <BackendContent />;
  }
  if (activeZone === "game") {
    return <GameContent onOpenProject={onOpenProject} />;
  }
  if (activeZone === "growth") {
    return <GrowthContent />;
  }
  if (activeZone === "contact") {
    return <ContactContent />;
  }
  return null;
}

function ZonePanel(props) {
  const {activeZone, onClose, onOpenProject, onSelectZone} = props;
  const zone = zoneMap[activeZone];

  if (!zone) {
    return <IntroPanel onSelectZone={onSelectZone} />;
  }

  return (
    <aside className={"zone-panel is-" + zone.id} data-panel-zone={zone.id}>
      <div className="zone-panel__head">
        <div>
          <p className="world-eyebrow">{zone.label}</p>
          <h2>{zone.title}</h2>
          <p>{zone.description}</p>
        </div>
        <button className="zone-panel__close" type="button" onClick={onClose}>
          World
        </button>
      </div>
      <ZonePicker activeZone={activeZone} onSelectZone={onSelectZone} />
      {renderZoneContent(activeZone, onOpenProject)}
    </aside>
  );
}

export default ZonePanel;
