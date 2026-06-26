import React from "react";
import {layers} from "./habitatData";

function MobileDock(props) {
  const {activeLayer, onClose, onSelectLayer} = props;

  return (
    <nav className="habitat-mobile-dock" aria-label="Digital habitat mobile navigation">
      <button className={!activeLayer ? "is-active" : ""} type="button" onClick={onClose}>
        System
      </button>
      {layers.map(function renderLayer(layer) {
        return (
          <button
            className={activeLayer === layer.id ? "is-active" : ""}
            data-mobile-layer={layer.id}
            key={layer.id}
            type="button"
            onClick={function selectLayer() {
              onSelectLayer(layer.id);
            }}
          >
            {layer.nav}
          </button>
        );
      })}
    </nav>
  );
}

export default MobileDock;
