import React, {useCallback, useEffect, useState} from "react";
import HabitatScene from "./HabitatScene";
import LayerPanel from "./LayerPanel";
import MobileDock from "./MobileDock";
import ProjectCaseModal from "./ProjectCaseModal";
import {habitatIntro, layerMap, layers} from "./habitatData";
import "./digitalHabitat.css";

function HabitatHeader(props) {
  const {activeLayer, hoveredLayer, onClose, onHoverLayer, onSelectLayer} = props;

  return (
    <header className="habitat-header">
      <button className="habitat-brand" type="button" onClick={onClose}>
        <strong>JH</strong>
        <span>Digital Habitat</span>
      </button>
      <nav className="habitat-nav" aria-label="Digital habitat layers">
        {layers.map(function renderLayer(layer) {
          return (
            <button
              className={activeLayer === layer.id ? "is-active" : ""}
              data-layer-nav={layer.id}
              key={layer.id}
              type="button"
              onBlur={function clearHover() {
                onHoverLayer("");
              }}
              onClick={function selectLayer() {
                onSelectLayer(layer.id);
              }}
              onFocus={function focusLayer() {
                onHoverLayer(layer.id);
              }}
              onMouseEnter={function hoverLayer() {
                onHoverLayer(layer.id);
              }}
              onMouseLeave={function leaveLayer() {
                onHoverLayer("");
              }}
            >
              <span>{layer.nav}</span>
              <small>{layer.subtitle}</small>
            </button>
          );
        })}
      </nav>
      <div className="habitat-status">
        <i />
        <span>{activeLayer ? layerMap[activeLayer].nav : hoveredLayer ? layerMap[hoveredLayer].nav : "System"}</span>
      </div>
    </header>
  );
}

function IntroLabel(props) {
  const {onSelectLayer} = props;

  return (
    <section className="habitat-intro-label">
      <span>Digital Habitat / Living System</span>
      <h1>{habitatIntro.title}</h1>
      <p>{habitatIntro.subtitle}</p>
      <div>
        <button type="button" onClick={function openCore() { onSelectLayer("core"); }}>
          {habitatIntro.ctas[0]}
        </button>
        <button type="button" onClick={function openWorks() { onSelectLayer("works"); }}>
          {habitatIntro.ctas[1]}
        </button>
      </div>
    </section>
  );
}

function LayerHint(props) {
  const {activeLayer, hoveredLayer} = props;
  const layer = hoveredLayer ? layerMap[hoveredLayer] : activeLayer ? layerMap[activeLayer] : null;

  return (
    <aside className={layer ? "habitat-layer-hint is-visible" : "habitat-layer-hint"}>
      <span>{layer ? layer.nav + " / " + layer.subtitle : ""}</span>
      <strong>{layer ? layer.meaning : ""}</strong>
    </aside>
  );
}

function DigitalHabitat() {
  const [activeLayer, setActiveLayer] = useState("");
  const [hoveredLayer, setHoveredLayer] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(function applyBodyClass() {
    document.body.classList.add("digital-habitat-body");
    return function cleanupBodyClass() {
      document.body.classList.remove("digital-habitat-body");
    };
  }, []);

  const closeLayer = useCallback(function closeLayer() {
    setActiveLayer("");
    setHoveredLayer("");
  }, []);

  const selectLayer = useCallback(function selectLayer(layerId) {
    setActiveLayer(layerId);
  }, []);

  const openProject = useCallback(function openProject(project) {
    setSelectedProject(project);
  }, []);

  return (
    <main className={activeLayer ? "digital-habitat has-active-layer" : "digital-habitat"}>
      <HabitatScene
        activeLayer={activeLayer}
        hoveredLayer={hoveredLayer}
        onHoverLayer={setHoveredLayer}
        onSelectLayer={selectLayer}
      />
      <div className="habitat-grid" aria-hidden="true" />
      <div className="habitat-vignette" aria-hidden="true" />
      <HabitatHeader
        activeLayer={activeLayer}
        hoveredLayer={hoveredLayer}
        onClose={closeLayer}
        onHoverLayer={setHoveredLayer}
        onSelectLayer={selectLayer}
      />
      {!activeLayer ? <IntroLabel onSelectLayer={selectLayer} /> : null}
      <LayerHint activeLayer={activeLayer} hoveredLayer={hoveredLayer} />
      <LayerPanel
        activeLayer={activeLayer}
        onClose={closeLayer}
        onOpenProject={openProject}
        onSelectLayer={selectLayer}
      />
      <MobileDock activeLayer={activeLayer} onClose={closeLayer} onSelectLayer={selectLayer} />
      <ProjectCaseModal
        project={selectedProject}
        onClose={function closeProject() {
          setSelectedProject(null);
        }}
      />
    </main>
  );
}

export default DigitalHabitat;
