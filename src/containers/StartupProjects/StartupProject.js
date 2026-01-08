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
                      isDark ? "experience-card-dark" : "experience-card"
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
                    <div className="experience-banner">
                      <div className="experience-blurred_div"></div>
                      <div className="experience-div-company">
                        <h5 className="experience-text-company">
                          {project.projectName}
                        </h5>
                      </div>
                      {project.image ? (
                        <img
                          className="experience-roundedimg"
                          src={project.image}
                          alt={project.projectName}
                        />
                      ) : null}
                    </div>
                    <div className="experience-text-details project-detail">
                      <h5
                        className={
                          isDark
                            ? "experience-text-role dark-mode-text"
                            : "experience-text-role"
                        }
                      >
                        {project.projectName}
                      </h5>
                      <h5
                        className={
                          isDark
                            ? "experience-text-date dark-mode-text"
                            : "experience-text-date"
                        }
                      >
                        Main Project
                      </h5>
                      <p
                        className={
                          isDark
                            ? "subTitle experience-text-desc dark-mode-text"
                            : "subTitle experience-text-desc"
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
            {selectedProject.details?.overview ? (
              <section className="project-overview">
                <div className="project-overview-header">
                  <h2 className="project-overview-title">
                    {selectedProject.details.overview.title}
                  </h2>
                  <p className="project-overview-subtitle">
                    {selectedProject.details.overview.subtitle}
                  </p>
                </div>
                <div className="project-overview-media">
                  {selectedProject.details.overview.image ? (
                    <img
                      src={selectedProject.details.overview.image}
                      alt={selectedProject.projectName}
                      className="project-overview-image"
                    />
                  ) : null}
                  {selectedProject.details.overview.caption && (
                    <div className="project-overview-caption">
                      {selectedProject.details.overview.caption}
                    </div>
                  )}
                </div>
                <div className="project-overview-grid">
                  {selectedProject.details.overview.role && (
                    <div className="project-overview-block">
                      <h4 className="project-overview-block-title">역할</h4>
                      <p className="project-overview-block-text">
                        {selectedProject.details.overview.role}
                      </p>
                    </div>
                  )}
                  {selectedProject.details.overview.techStack?.length ? (
                    <div className="project-overview-block">
                      <h4 className="project-overview-block-title">
                        기술 스택
                      </h4>
                      <ul className="project-overview-list">
                        {selectedProject.details.overview.techStack.map(
                          (item, i) => (
                            <li key={i} className="project-overview-list-item">
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : null}
                  {selectedProject.details.overview.period && (
                    <div className="project-overview-block">
                      <h4 className="project-overview-block-title">기간</h4>
                      <p className="project-overview-block-text">
                        {selectedProject.details.overview.period}
                      </p>
                    </div>
                  )}
                  {selectedProject.details.overview.coreValue && (
                    <div className="project-overview-block">
                      <h4 className="project-overview-block-title">
                        핵심 가치
                      </h4>
                      <p className="project-overview-block-text">
                        {selectedProject.details.overview.coreValue}
                      </p>
                    </div>
                  )}
                </div>
                {selectedProject.details.overview.links?.length ? (
                  <div className="project-overview-links">
                    <h4 className="project-overview-block-title">링크</h4>
                    <ul className="project-overview-list">
                      {selectedProject.details.overview.links.map((link, i) => (
                        <li key={i} className="project-overview-list-item">
                          <a
                            className="project-overview-link"
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : (
              <>
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
              </>
            )}
            {selectedProject.details?.summary && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Summary</h3>
                <p className="project-modal-paragraph">
                  {selectedProject.details.summary}
                </p>
              </section>
            )}
            {selectedProject.details?.problemSolution && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  문제 정의 & 해결 전략
                </h3>
                <div className="project-ps-grid">
                  <div className="project-ps-card">
                    <h4 className="project-ps-title">Problem</h4>
                    <ul className="project-ps-list">
                      {selectedProject.details.problemSolution.problem.map(
                        (item, i) => (
                          <li key={i} className="project-ps-list-item">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="project-ps-card">
                    <h4 className="project-ps-title">Solution</h4>
                    <p className="project-ps-text">
                      {selectedProject.details.problemSolution.solution}
                    </p>
                  </div>
                </div>
                <div className="project-ps-card project-ps-outcome">
                  <h4 className="project-ps-title">Outcome</h4>
                  <p className="project-ps-text">
                    {selectedProject.details.problemSolution.outcome}
                  </p>
                </div>
              </section>
            )}
            {selectedProject.details?.strategySteps?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  MuscleUp의 해결 전략
                </h3>
                <div className="project-strategy-list">
                  {selectedProject.details.strategySteps.map((step, i) => (
                    <div key={i} className="project-strategy-item">
                      <div className="project-strategy-text">
                        <div className="project-strategy-step">
                          {step.step}
                        </div>
                        <h4 className="project-strategy-title">
                          {step.title}
                        </h4>
                        <p className="project-strategy-desc">
                          {step.description}
                        </p>
                      </div>
                      <div className="project-strategy-media">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="project-strategy-image"
                        />
                        <div className="project-strategy-caption">
                          {step.caption}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {selectedProject.details?.problemGoal?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Problem & Goal</h3>
                <ul className="project-modal-list">
                  {selectedProject.details.problemGoal.map((item, i) => (
                    <li key={i} className="project-modal-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {selectedProject.details?.architecture?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Architecture</h3>
                <ul className="project-modal-list">
                  {selectedProject.details.architecture.map((item, i) => (
                    <li key={i} className="project-modal-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {selectedProject.details?.authSecurity?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Auth & Security</h3>
                <ul className="project-modal-list">
                  {selectedProject.details.authSecurity.map((item, i) => (
                    <li key={i} className="project-modal-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
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
            {selectedProject.details?.coreFeatures?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Core Features</h3>
                <ul className="project-modal-list">
                  {selectedProject.details.coreFeatures.map((item, i) => (
                    <li key={i} className="project-modal-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {selectedProject.details?.coreFeatureShots?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  득근득근 - 핵심 기능 (1/2)
                </h3>
                <div className="project-feature-grid">
                  {selectedProject.details.coreFeatureShots.map((shot, i) => (
                    <div key={i} className="project-feature-item">
                      <div className="project-feature-text">
                        <h4 className="project-feature-title">{shot.title}</h4>
                        <ul className="project-feature-list">
                          {shot.bullets.map((item, j) => (
                            <li key={j} className="project-feature-list-item">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="project-feature-media">
                        <img
                          src={shot.image}
                          alt={shot.title}
                          className="project-feature-image"
                        />
                        <div className="project-feature-caption">
                          {shot.caption}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {selectedProject.details?.deployment?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  Deployment & Troubleshooting
                </h3>
                <ul className="project-modal-list">
                  {selectedProject.details.deployment.map((item, i) => (
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
