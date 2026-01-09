import React, {useContext, useEffect, useState} from "react";
import "./StartupProjects.scss";
import {bigProjects} from "../../portfolio";
import {Fade} from "react-reveal";
import StyleContext from "../../contexts/StyleContext";

export default function StartupProject() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const isMuscleUp =
    selectedProject?.projectName &&
    selectedProject.projectName.includes("MuscleUp");

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
        if (lightbox) {
          setLightbox(null);
          return;
        }
        setSelectedProject(null);
      }
      if (!lightbox) {
        return;
      }
      if (event.key === "ArrowRight") {
        setLightbox(prev => {
          if (!prev) {
            return prev;
          }
          return {...prev, index: (prev.index + 1) % prev.items.length};
        });
      }
      if (event.key === "ArrowLeft") {
        setLightbox(prev => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            index:
              (prev.index - 1 + prev.items.length) % prev.items.length
          };
        });
      }
    }
    if (selectedProject) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, lightbox]);

  if (!bigProjects.display) {
    return null;
  }

  const renderFeatureSection = (title, shots) => {
    if (!shots?.length) {
      return null;
    }
    return (
      <section className="project-modal-section">
        <h3 className="project-modal-section-title">{title}</h3>
        <div className="project-feature-grid">
          {shots.map((shot, i) => (
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
                <div className="project-feature-caption">{shot.caption}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const Badge = ({icon, label, tone = "default"}) => {
    return (
      <span className={`project-badge project-badge-${tone}`}>
        <span className="project-badge-icon">{icon}</span>
        {label}
      </span>
    );
  };

  const DetailCard = ({badge, title, bullets, proof, onViewProof}) => {
    return (
      <div className="project-detail-card">
        <div className="project-detail-card-header">
          {badge}
          <h4 className="project-detail-card-title">{title}</h4>
          {proof?.length ? (
            <button
              className="project-proof-button"
              type="button"
              onClick={() => onViewProof(proof, 0)}
            >
              View Proof ↗
            </button>
          ) : null}
        </div>
        <ul className="project-detail-card-list">
          {bullets.map((item, i) => (
            <li key={i} className="project-detail-card-item">
              {item}
            </li>
          ))}
        </ul>
        {proof?.length ? (
          <div className="project-proof">
            <div className="project-proof-label">Proof</div>
            <ProofThumb
              item={proof[0]}
              onClick={() => onViewProof(proof, 0)}
            />
            {proof[0]?.caption ? (
              <div className="project-proof-caption">{proof[0].caption}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  const ProofThumb = ({item, onClick}) => {
    if (!item) {
      return null;
    }
    return (
      <button className="project-proof-thumb" type="button" onClick={onClick}>
        <img src={item.src} alt={item.alt} />
      </button>
    );
  };

  const ProofLightbox = ({items, index, onClose, onPrev, onNext}) => {
    if (!items?.length) {
      return null;
    }
    const current = items[index];
    return (
      <div className="project-lightbox-overlay" role="presentation">
        <div className="project-lightbox">
          <button
            className="project-lightbox-close"
            type="button"
            onClick={onClose}
          >
            X
          </button>
          {items.length > 1 ? (
            <>
              <button
                className="project-lightbox-nav project-lightbox-prev"
                type="button"
                onClick={onPrev}
              >
                ←
              </button>
              <button
                className="project-lightbox-nav project-lightbox-next"
                type="button"
                onClick={onNext}
              >
                →
              </button>
            </>
          ) : null}
          <img
            src={current.src}
            alt={current.alt}
            className="project-lightbox-image"
          />
          {current.caption ? (
            <div className="project-lightbox-caption">{current.caption}</div>
          ) : null}
        </div>
      </div>
    );
  };

  const Accordion = ({title, children}) => {
    return (
      <details className="project-accordion">
        <summary className="project-accordion-summary">{title}</summary>
        <div className="project-accordion-body">{children}</div>
      </details>
    );
  };

  const openLightbox = (items, index = 0) => {
    setLightbox({items, index});
  };

  const heroProofImage =
    selectedProject?.details?.overview?.image ??
    require("../../assets/images/saayaHealthLogo.webp");

  const proofImages = {
    jwt: {
      src: require("../../assets/images/pwaLogo.webp"),
      alt: "JWT Rotation proof",
      caption: "Rotation: 재발급 시 기존 Refresh 폐기 로직"
    },
    ai: {
      src: require("../../assets/images/googleAssistantLogo.webp"),
      alt: "AI endpoints proof",
      caption: "Endpoints 분리 + 히스토리 저장 로직"
    },
    erd: {
      src: require("../../assets/images/nextuLogo.webp"),
      alt: "ERD proof",
      caption: "핵심 테이블(users, brag_post, ai_chat_messages, refresh_tokens)"
    },
    aws: {
      src: require("../../assets/images/saayaHealthLogo.webp"),
      alt: "AWS ops proof",
      caption: "ACM us-east-1 + CloudFront Invalidation 및 CORS 설정"
    }
  };

  const buildMuscleUpCards = () => {
    return [
      {
        badge: <Badge icon="⭐" label="Core Design" tone="star" />,
        keyPoint: "KEY POINT",
        title: "JWT 이중 쿠키 + Rotation",
        bullets: [
          <>
            Refresh Token <strong>Rotation</strong>으로 탈취 토큰 재사용을
            차단
          </>,
          <>
            <strong>Access(15m)</strong>/<strong>Refresh(14d)</strong> 분리
            + Refresh DB 저장 + 재발급 시 기존 Refresh 즉시 폐기
          </>,
          <>
            <strong>HttpOnly</strong> 쿠키 + <strong>Role</strong> 기반
            보호로 세션 안정성과 보안 강화
          </>
        ],
        highlight: "Rotation으로 탈취 토큰 재사용을 차단",
        proof: [proofImages.jwt],
        layout: "hero"
      },
      {
        badge: <Badge icon="⭐" label="Core Design" tone="star" />,
        keyPoint: "KEY POINT",
        title: "상태 기반 AI 코치",
        bullets: [
          "단순 챗봇이 아닌 ‘상태 기반 AI 코치’로 반복 사용 흐름 구현",
          <>
            Flow: <strong>analyze → plan → chat</strong>, 대화 히스토리 DB
            저장 + 공유 상태 관리
          </>,
          "사용자 맥락 유지로 루틴 수정/재생성이 가능한 제품 형태"
        ],
        highlight: "analyze → plan → chat 흐름을 상태로 관리",
        proof: [proofImages.ai],
        layout: "row-reverse"
      },
      {
        badge: <Badge icon="✅" label="Outcome" tone="check" />,
        title: "도메인 분리 ERD",
        bullets: [
          <>
            사용자/커뮤니티/AI/로그 <strong>도메인 분리</strong>로 확장 가능한
            스키마
          </>,
          "FK 기반 무결성 + 조회 중심 인덱스/페이지네이션 고려",
          "기능 확장 시 충돌 최소화, 핵심 행동 테이블 중심 운영"
        ],
        highlight: "도메인 분리로 확장 가능한 스키마 확보",
        proof: [proofImages.erd],
        layout: "split"
      },
      {
        badge: <Badge icon="🔥" label="Ops & Issue" tone="fire" />,
        title: "AWS 운영 이슈 해결",
        bullets: [
          "CloudFront+S3 HTTPS 배포를 운영하며 장애 이슈를 재현-해결-검증",
          <>
            <strong>HTTPS</strong> 통일(Mixed Content 차단) +{" "}
            <strong>CORS allowlist/credentials</strong>로 쿠키 인증 유지
          </>,
          "배포 반영/보안/세션 이슈를 운영 관점에서 안정화"
        ],
        highlight: "운영 이슈를 재현-해결-검증",
        proof: [proofImages.aws],
        layout: "row"
      }
    ];
  };

  const renderMuscleUpSummary = () => (
    <section className="project-quick-summary">
      <DetailCard
        badge={<Badge icon="⭐" label="Quick Summary" tone="star" />}
        title="10초 핵심 요약"
        bullets={[
          "⭐ JWT 이중 쿠키 + Refresh Token Rotation(재사용 차단)",
          "⭐ AI 분석 → 4주 루틴 → 대화 히스토리 DB 저장",
          "🔥 AWS HTTPS/CDN 배포 + CORS/MixedContent/ACM 이슈 해결",
          "✅ 배포: CloudFront+S3 HTTPS, RDS(MySQL) 운영",
          "✅ 핵심 테이블: users, brag_post, ai_chat_messages, refresh_tokens"
        ]}
      />
    </section>
  );

  const renderMuscleUpHeroProof = () => (
    <section className="project-modal-section">
      <h3 className="project-modal-section-title">Hero Proof</h3>
      <div className="project-hero-proof">
        <img
          src={heroProofImage}
          alt="득근득근 메인 화면"
          className="project-hero-image"
        />
        <div className="project-hero-caption">
          득근득근 메인 화면 (실서비스)
        </div>
      </div>
    </section>
  );

  const renderMuscleUpCard = card => {
    const proofItem = card.proof?.[0];
    const description = (
      <>
        <div className="muscleup-card-header">
          {card.badge}
          {card.keyPoint && (
            <span className="muscleup-keypoint">{card.keyPoint}</span>
          )}
        </div>
        <h4 className="muscleup-card-title">{card.title}</h4>
        {card.highlight && (
          <div className="muscleup-highlight">{card.highlight}</div>
        )}
        <ul className="muscleup-card-list">
          {card.bullets.map((item, i) => (
            <li key={i} className="muscleup-card-item">
              {i === 0 ? <strong>{item}</strong> : item}
            </li>
          ))}
        </ul>
      </>
    );

    if (card.layout === "hero") {
      return (
        <section className="muscleup-section muscleup-hero">
          <div className="muscleup-desc">{description}</div>
          {proofItem && (
            <div className="muscleup-proof">
              <div className="muscleup-proof-label">Proof</div>
              <ProofThumb
                item={proofItem}
                onClick={() => openLightbox(card.proof, 0)}
              />
              <div className="muscleup-proof-caption">
                {proofItem.caption}
              </div>
            </div>
          )}
        </section>
      );
    }

    if (card.layout === "split") {
      return (
        <section className="muscleup-section muscleup-split">
          <div className="muscleup-desc">{description}</div>
          {proofItem && (
            <div className="muscleup-proof-card">
              <div className="muscleup-proof-label">Proof</div>
              <ProofThumb
                item={proofItem}
                onClick={() => openLightbox(card.proof, 0)}
              />
              <div className="muscleup-proof-caption">
                {proofItem.caption}
              </div>
            </div>
          )}
        </section>
      );
    }

    return (
      <section
        className={`muscleup-section muscleup-row${
          card.layout === "row-reverse" ? " reverse" : ""
        }`}
      >
        <div className="muscleup-desc">{description}</div>
        {proofItem && (
          <div className="muscleup-proof">
            <div className="muscleup-proof-label">Proof</div>
            <ProofThumb
              item={proofItem}
              onClick={() => openLightbox(card.proof, 0)}
            />
            <div className="muscleup-proof-caption">
              {proofItem.caption}
            </div>
          </div>
        )}
      </section>
    );
  };

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
            {lightbox && (
              <ProofLightbox
                items={lightbox.items}
                index={lightbox.index}
                onClose={() => setLightbox(null)}
                onPrev={() =>
                  setLightbox(prev => ({
                    ...prev,
                    index:
                      (prev.index - 1 + prev.items.length) %
                      prev.items.length
                  }))
                }
                onNext={() =>
                  setLightbox(prev => ({
                    ...prev,
                    index: (prev.index + 1) % prev.items.length
                  }))
                }
              />
            )}
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
                {!isMuscleUp && (
                  <>
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
                          <h4 className="project-overview-block-title">핵심 가치</h4>
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
                          {selectedProject.details.overview.links.map(
                            (link, i) => (
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
                            )
                          )}
                        </ul>
                      </div>
                    ) : null}
                  </>
                )}
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
            {isMuscleUp && renderMuscleUpSummary()}
            {isMuscleUp && renderMuscleUpHeroProof()}
            {!isMuscleUp && selectedProject.details?.summary && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Summary</h3>
                <p className="project-modal-paragraph">
                  {selectedProject.details.summary}
                </p>
              </section>
            )}
            {!isMuscleUp && selectedProject.details?.problemSolution && (
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
            {!isMuscleUp && selectedProject.details?.strategySteps?.length ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  득근득근 해결 전략
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
            {isMuscleUp ? (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  핵심 카드 요약
                </h3>
                <div className="muscleup-core-stack">
                  {buildMuscleUpCards().map((card, i) => (
                    <div key={i}>{renderMuscleUpCard(card)}</div>
                  ))}
                </div>
              </section>
            ) : null}
            {!isMuscleUp && selectedProject.details?.problemGoal?.length ? (
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
            {!isMuscleUp && selectedProject.details?.architecture?.length ? (
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
            {!isMuscleUp && selectedProject.details?.authSecurity?.length ? (
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
            {!isMuscleUp && selectedProject.details?.role && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">Role</h3>
                <p className="project-modal-paragraph">
                  {selectedProject.details.role}
                </p>
              </section>
            )}
            {!isMuscleUp && selectedProject.details?.highlights?.length ? (
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
            {!isMuscleUp && selectedProject.details?.coreFeatures?.length ? (
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
            {!isMuscleUp && selectedProject.details?.deployment?.length ? (
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
            {isMuscleUp && (
              <section className="project-modal-section">
                <h3 className="project-modal-section-title">
                  Tech + Links (Accordion)
                </h3>
                <Accordion title="Tech Stack">
                  {selectedProject.details?.overview?.techStack?.length ? (
                    <ul className="project-modal-list">
                      {selectedProject.details.overview.techStack.map(
                        (item, i) => (
                          <li key={i} className="project-modal-list-item">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="project-modal-paragraph">
                      기술 스택 정보를 업데이트해 주세요.
                    </p>
                  )}
                </Accordion>
                <Accordion title="Links">
                  {selectedProject.details?.overview?.links?.length ? (
                    <div className="project-modal-links">
                      {selectedProject.details.overview.links.map((link, i) => (
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
                  ) : (
                    <p className="project-modal-paragraph">
                      링크 정보를 업데이트해 주세요.
                    </p>
                  )}
                </Accordion>
              </section>
            )}
            {!isMuscleUp && selectedProject.details?.links?.length ? (
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




















