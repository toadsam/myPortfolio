import React from "react";
import "./TalkCard.scss";

export default function TalkCard({value, isDark, onOpen, style}) {
  return (
    <button
      className={isDark ? "values-card dark-mode" : "values-card"}
      type="button"
      onClick={onOpen}
      style={style}
    >
      <div className="values-card-title">{value.key}</div>
      <p className="values-card-summary">{value.summary}</p>
      <div className="values-card-cta">View</div>
    </button>
  );
}
