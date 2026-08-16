import React, {useCallback, useEffect, useState} from "react";
import MobileDock from "./MobileDock";
import ProjectModal from "./ProjectModal";
import WorldScene from "./WorldScene";
import ZonePanel from "./ZonePanel";
import {zoneMap, zones} from "./worldData";
import "./portfolioWorld.css";

function Header(props) {
  const {activeZone, onClose, onSelectZone} = props;

  return (
    <header className="portfolio-world__header">
      <button
        className="portfolio-world__brand"
        type="button"
        onClick={onClose}
      >
        <strong>JH</strong>
        <span>Portfolio World</span>
      </button>
      <nav
        className="portfolio-world__nav"
        aria-label="Portfolio world shortcuts"
      >
        {zones.map(function renderShortcut(zone) {
          return (
            <button
              className={activeZone === zone.id ? "is-active" : ""}
              data-zone-button={zone.id}
              key={zone.id}
              type="button"
              onClick={function selectZone() {
                onSelectZone(zone.id);
              }}
            >
              {zone.shortLabel}
            </button>
          );
        })}
      </nav>
      <div className="portfolio-world__status">
        <span />
        <strong>{activeZone ? zoneMap[activeZone].label : "World view"}</strong>
      </div>
    </header>
  );
}

function HoverHint(props) {
  const {hoveredZone, activeZone} = props;
  const zone = hoveredZone
    ? zoneMap[hoveredZone]
    : activeZone
    ? zoneMap[activeZone]
    : null;

  return (
    <div className={zone ? "world-hover-hint is-visible" : "world-hover-hint"}>
      <span>{zone ? zone.label : "Move through the world"}</span>
      <strong>
        {zone
          ? zone.subtitle
          : "Hover a glowing marker, then click to enter a zone."}
      </strong>
    </div>
  );
}

function PortfolioWorld() {
  const [activeZone, setActiveZone] = useState("");
  const [hoveredZone, setHoveredZone] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(function applyWorldBody() {
    document.body.classList.add("portfolio-world-body");
    return function cleanupWorldBody() {
      document.body.classList.remove("portfolio-world-body");
    };
  }, []);

  const closeZone = useCallback(function closeZone() {
    setActiveZone("");
    setHoveredZone("");
  }, []);

  const selectZone = useCallback(function selectZone(zoneId) {
    setActiveZone(zoneId);
  }, []);

  const openProject = useCallback(function openProject(project) {
    setSelectedProject(project);
  }, []);

  return (
    <main
      className={
        activeZone ? "portfolio-world has-active-zone" : "portfolio-world"
      }
    >
      <WorldScene
        activeZone={activeZone}
        hoveredZone={hoveredZone}
        onHoverZone={setHoveredZone}
        onSelectZone={selectZone}
      />
      <div className="portfolio-world__grain" aria-hidden="true" />
      <div className="portfolio-world__vignette" aria-hidden="true" />
      <Header
        activeZone={activeZone}
        onClose={closeZone}
        onSelectZone={selectZone}
      />
      <HoverHint activeZone={activeZone} hoveredZone={hoveredZone} />
      <ZonePanel
        activeZone={activeZone}
        onClose={closeZone}
        onOpenProject={openProject}
        onSelectZone={selectZone}
      />
      <MobileDock
        activeZone={activeZone}
        onClose={closeZone}
        onSelectZone={selectZone}
      />
      <ProjectModal
        project={selectedProject}
        onClose={function closeProject() {
          setSelectedProject(null);
        }}
      />
    </main>
  );
}

export default PortfolioWorld;
