import React from "react";
import {zones} from "./worldData";

function MobileDock(props) {
  const {activeZone, onClose, onSelectZone} = props;

  return (
    <nav
      className="mobile-world-dock"
      aria-label="Mobile portfolio world navigation"
    >
      <button
        className={!activeZone ? "is-active" : ""}
        type="button"
        onClick={onClose}
      >
        World
      </button>
      {zones.map(function renderZone(zone) {
        return (
          <button
            className={activeZone === zone.id ? "is-active" : ""}
            data-mobile-zone-button={zone.id}
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
  );
}

export default MobileDock;
