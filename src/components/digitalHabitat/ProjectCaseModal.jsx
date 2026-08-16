import React, {useEffect} from "react";

function ProjectCaseModal(props) {
  const {project, onClose} = props;

  useEffect(
    function bindEscape() {
      function handleKeyDown(event) {
        if (event.key === "Escape" && project) {
          onClose();
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return function cleanup() {
        window.removeEventListener("keydown", handleKeyDown);
      };
    },
    [project, onClose]
  );

  if (!project) {
    return null;
  }

  return (
    <div
      className="habitat-project-modal"
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
    >
      <button
        className="habitat-project-modal__backdrop"
        type="button"
        aria-label="Close project case"
        onClick={onClose}
      />
      <article className="habitat-project-modal__card">
        <header>
          <div>
            <span>{project.category}</span>
            <h2>{project.name}</h2>
            <p>{project.summary}</p>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="habitat-project-modal__tags">
          {project.tech.map(function renderTech(tech) {
            return <span key={tech}>{tech}</span>;
          })}
        </div>
        <div className="habitat-project-modal__grid">
          <section>
            <span>My Role</span>
            <p>{project.role}</p>
          </section>
          <section>
            <span>Problem Solving</span>
            <p>{project.problem}</p>
          </section>
          <section>
            <span>Key Features</span>
            <div>
              {project.features.map(function renderFeature(feature) {
                return <strong key={feature}>{feature}</strong>;
              })}
            </div>
          </section>
          <section>
            <span>Learned</span>
            <p>{project.learned}</p>
          </section>
        </div>
        <footer>
          <button type="button">GitHub</button>
          <button type="button">Demo</button>
        </footer>
      </article>
    </div>
  );
}

export default ProjectCaseModal;
