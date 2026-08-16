import React from "react";
import {
  contactLinks,
  evolutionLogs,
  layerMap,
  layers,
  projects,
  systemNodes,
  simulations
} from "./habitatData";

function TagList(props) {
  return (
    <div className="habitat-tags">
      {props.items.map(function renderTag(item) {
        return <span key={item}>{item}</span>;
      })}
    </div>
  );
}

function ProjectModuleList(props) {
  const {onOpenProject} = props;

  return (
    <div className="habitat-project-modules">
      {projects.map(function renderProject(project, index) {
        return (
          <article
            className="habitat-module-card"
            key={project.id}
            style={{"--delay": index * 60 + "ms"}}
          >
            <span>{project.category}</span>
            <strong>{project.name}</strong>
            <p>{project.summary}</p>
            <TagList items={project.tech.slice(0, 4)} />
            <button
              type="button"
              data-project-case={project.id}
              onClick={function openCase() {
                onOpenProject(project);
              }}
            >
              Open case
            </button>
          </article>
        );
      })}
    </div>
  );
}

function SystemList() {
  return (
    <div className="habitat-node-list">
      {systemNodes.map(function renderNode(node, index) {
        return (
          <article key={node[0]} style={{"--delay": index * 55 + "ms"}}>
            <span>{"0" + (index + 1)}</span>
            <strong>{node[0]}</strong>
            <p>{node[1]}</p>
          </article>
        );
      })}
    </div>
  );
}

function SimulationList() {
  return (
    <div className="habitat-node-list">
      {simulations.map(function renderSimulation(item, index) {
        return (
          <article key={item[0]} style={{"--delay": index * 55 + "ms"}}>
            <span>{"0" + (index + 1)}</span>
            <strong>{item[0]}</strong>
            <p>{item[1]}</p>
          </article>
        );
      })}
    </div>
  );
}

function EvolutionList() {
  return (
    <ol className="habitat-evolution-list">
      {evolutionLogs.map(function renderLog(log, index) {
        return (
          <li key={log[0]} style={{"--delay": index * 55 + "ms"}}>
            <span>{log[0]}</span>
            <div>
              <strong>{log[1]}</strong>
              <p>{log[2]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ContactList() {
  return (
    <div className="habitat-contact-list">
      {contactLinks.map(function renderLink(link, index) {
        return (
          <a
            href={link.href}
            key={link.label}
            rel={
              link.href.indexOf("http") === 0
                ? "noopener noreferrer"
                : undefined
            }
            style={{"--delay": index * 55 + "ms"}}
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

function ExtraContent(props) {
  const {activeLayer, onOpenProject} = props;

  if (activeLayer === "works") {
    return <ProjectModuleList onOpenProject={onOpenProject} />;
  }
  if (activeLayer === "systems") {
    return <SystemList />;
  }
  if (activeLayer === "simulation") {
    return <SimulationList />;
  }
  if (activeLayer === "evolution") {
    return <EvolutionList />;
  }
  if (activeLayer === "signal") {
    return <ContactList />;
  }
  return null;
}

function LayerPanel(props) {
  const {activeLayer, onClose, onOpenProject, onSelectLayer} = props;
  const layer = layerMap[activeLayer];

  if (!layer) {
    return null;
  }

  return (
    <aside
      className={"habitat-layer-panel is-" + activeLayer}
      data-active-layer={activeLayer}
    >
      <header>
        <div>
          <span>{layer.nav}</span>
          <h2>{layer.layerName}</h2>
          <p>{layer.meaning}</p>
        </div>
        <button type="button" onClick={onClose}>
          System
        </button>
      </header>
      <TagList items={layer.highlights} />
      <div className="habitat-layer-nav">
        {layers.map(function renderLayerButton(item) {
          return (
            <button
              className={item.id === activeLayer ? "is-active" : ""}
              data-layer-panel-button={item.id}
              key={item.id}
              type="button"
              onClick={function selectLayer() {
                onSelectLayer(item.id);
              }}
            >
              {item.nav}
            </button>
          );
        })}
      </div>
      <ExtraContent activeLayer={activeLayer} onOpenProject={onOpenProject} />
    </aside>
  );
}

export default LayerPanel;
