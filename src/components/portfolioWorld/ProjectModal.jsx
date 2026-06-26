import React, {useEffect} from "react";

function Section(props) {
  const {label, children} = props;

  if (!children) {
    return null;
  }

  return (
    <section className="project-modal__section">
      <span>{label}</span>
      <p>{children}</p>
    </section>
  );
}

function ProjectModal(props) {
  const {project, onClose} = props;

  useEffect(function bindEscape() {
    function handleKeyDown(event) {
      if (event.key === "Escape" && project) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return function cleanup() {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) {
    return null;
  }

  const tags = project.tech || [];
  const features = project.features || [];

  return (
    <div className="project-modal" role="dialog" aria-modal="true" aria-label={project.name + " project detail"}>
      <button className="project-modal__backdrop" type="button" aria-label="Close project detail" onClick={onClose} />
      <article className="project-modal__card">
        <header>
          <div>
            <p className="world-eyebrow">{project.category || "Project Detail"}</p>
            <h2>{project.name}</h2>
            <p>{project.oneLine}</p>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="project-modal__tags">
          {tags.map(function renderTag(tag) {
            return <span key={tag}>{tag}</span>;
          })}
        </div>

        <div className="project-modal__body">
          <Section label="Overview">{project.overview}</Section>
          <Section label="My Role">{project.role}</Section>
          <Section label="Problem Solving">{project.problem}</Section>
          <Section label="Result / Learned">{project.result}</Section>
        </div>

        <section className="project-modal__features">
          <span>Key Features</span>
          <div>
            {features.map(function renderFeature(feature) {
              return <strong key={feature}>{feature}</strong>;
            })}
          </div>
        </section>

        <footer>
          <a href={project.github || "#"} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a href={project.demo || "#"} rel="noopener noreferrer" target="_blank">
            Demo
          </a>
        </footer>
      </article>
    </div>
  );
}

export default ProjectModal;
