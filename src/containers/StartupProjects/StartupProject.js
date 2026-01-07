import React, {useContext, useEffect, useState} from "react";
import "./StartupProjects.scss";
import {bigProjects} from "../../portfolio";
import {Fade} from "react-reveal";
import StyleContext from "../../contexts/StyleContext";

export default function StartupProject() {
  const [selectedProject, setSelectedProject] = useState(null);

  function openUrlInNewTab(url) {
    if (!url) {
      return;
    }
    var win = window.open(url, "_blank");
    win.focus();
  }

  const {isDark} = useContext(StyleContext);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    }
    if (selectedProject) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  if (!bigProjects.display) {
    return null;
  }

  return (
    <>
      <Fade bottom duration={1000} distance="20px">
        <div className="main" id="projects">
          <div>
            <h1 className="skills-heading">{bigProjects.title}</h1>
            <p
              className={
                isDark
                  ? "dark-mode project-subtitle"
                  : "subTitle project-subtitle"
              }
            >
              {bigProjects.subtitle}
            </p>

            <div className="projects-container">
              {bigProjects.projects.map((project, i) => {
                return (
                  <div
                    key={i}
                    className={
                      isDark
                        ? "dark-mode project-card project-card-dark"
                        : "project-card project-card-light"
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProject(project)}
                    onKeyDown={event => {
                      if (event.key === "Enter") {
                        setSelectedProject(project);
                      }
                    }}
                  >
                    {project.image ? (
                      <div className="project-image">
                        <img
                          src={project.image}
                          alt={project.projectName}
                          className="card-image"
                        ></img>
                      </div>
                    ) : null}
                    <div className="project-detail">
                      <h5
                        className={isDark ? "dark-mode card-title" : "card-title"}
                      >
                        {project.projectName}
                      </h5>
                      <p
                        className={
                          isDark ? "dark-mode card-subtitle" : "card-subtitle"
                        }
                      >
                        {project.projectDesc}
                      </p>
                      {project.footerLink ? (
                        <div className="project-card-footer">
                          {project.footerLink.map((link, i) => {
                            return (
                              <span
                                key={i}
                                className={
                                  isDark
                                    ? "dark-mode project-tag"
                                    : "project-tag"
                                }
                                onClick={event => {
                                  event.stopPropagation();
                                  openUrlInNewTab(link.url);
                                }}
                              >
                                {link.name}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                      <button
                        className={
                          isDark
                            ? "dark-mode project-detail-button"
                            : "project-detail-button"
                        }
                        type="button"
                        onClick={event => {
                          event.stopPropagation();
                          setSelectedProject(project);
                        }}
                      >
                        자세히 보기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Fade>

      {selectedProject && (
        <div
          className="project-modal-overlay"
          role="presentation"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className={isDark ? "dark-mode project-modal" : "project-modal"}
            role="dialog"
            aria-modal="true"
            aria-label="Project Details"
            onClick={event => event.stopPropagation()}
          >
            <button
              className="project-modal-close"
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close"
            >
              X
            </button>
            <div className="project-modal-header">
              {selectedProject.image ? (
                <img
                  src={selectedProject.image}
                  alt={selectedProject.projectName}
                  className="project-modal-image"
                />
              ) : null}
              <div>
                <h2 className="project-modal-title">
                  {selectedProject.projectName}
                </h2>
                <p className="project-modal-subtitle">
                  {selectedProject.projectDesc}
                </p>
              </div>
            </div>
            {selectedProject.details?.stack && (
              <div className="project-modal-stack">
                <span className="project-modal-label">Stack</span>
                <span className="project-modal-value">
                  {selectedProject.details.stack}
                </span>
              </div>
            )}
            {selectedProject.details?.summary && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Summary</h3>
                <p className="project-modal-paragraph">
                  {selectedProject.details.summary}
                </p>
              </section>
            )}
            {selectedProject.details?.role && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Role</h3>
                <p className="project-modal-paragraph">
                  {selectedProject.details.role}
                </p>
              </section>
            )}
            {selectedProject.details?.highlights?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Highlights</h3>
                <ul className="project-modal-list">
                  {selectedProject.details.highlights.map((item, i) => (
                    <li key={i} className="project-modal-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {selectedProject.details?.links?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Links</h3>
                <div className="project-modal-links">
                  {selectedProject.details.links.map((link, i) => (
                    <a
                      key={i}
                      className="project-modal-link"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
