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
                {"<"}
              </button>
              <button
                className="project-lightbox-nav project-lightbox-next"
                type="button"
                onClick={onNext}
              >
                {">"}
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
  const HighlightText = ({children}) => (
    <span className="muscleup-highlight-text">{children}</span>
  );

  const ProofBlock = ({item, caption, onOpen, large = false}) => {
    if (!item) {
      return null;
    }
    return (
      <div
        className={
          large
            ? "muscleup-proof-block muscleup-proof-block-large"
            : "muscleup-proof-block"
        }
      >
        <div className="muscleup-proof-label">PROOF</div>
        <button
          className="muscleup-proof-thumb"
          type="button"
          onClick={onOpen}
        >
          <img src={item.src} alt={item.alt} />
        </button>
        <div className="muscleup-proof-caption">
          {caption || item.caption}
        </div>
      </div>
    );
  };

  const TextBlock = ({
    badge,
    title,
    highlight,
    bullets,
    chips,
    issueLines,
    variant
  }) => (
    <div
      className={`muscleup-text-block${
        variant ? ` muscleup-text-block-${variant}` : ""
      }`}
    >
      <div className="muscleup-card-header">
        {badge}
        <span className="muscleup-keypoint">KEY POINT</span>
      </div>
      <h4 className="muscleup-card-title">{title}</h4>
      {highlight && <HighlightText>{highlight}</HighlightText>}
      {chips?.length ? (
        <div className="muscleup-chip-row">
          {chips.map((chip, i) => (
            <span key={i} className="muscleup-chip">
              {chip}
            </span>
          ))}
        </div>
      ) : null}
      <ul className="muscleup-card-list">
        {bullets.map((item, i) => (
          <li key={i} className="muscleup-card-item">
            {item}
          </li>
        ))}
      </ul>
      {issueLines?.length ? (
        <div className="muscleup-issue-list">
          {issueLines.map((line, i) => (
            <div key={i} className="muscleup-issue-item">
              <span className="muscleup-issue-label">{line.label}</span>
              <span className="muscleup-issue-text">{line.text}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );

  const ProofSection = ({pattern, text, proof, caption}) => {
    if (pattern === "C") {
      return (
        <section className="muscleup-section muscleup-pattern-c">
          {text}
          <ProofBlock
            item={proof}
            caption={caption}
            onOpen={() => openLightbox([proof], 0)}
            large
          />
        </section>
      );
    }

    if (pattern === "D") {
      return (
        <section className="muscleup-section muscleup-pattern-d">
          <div className="muscleup-card-surface">{text}</div>
          <div className="muscleup-proof-surface">
            <ProofBlock
              item={proof}
              caption={caption}
              onOpen={() => openLightbox([proof], 0)}
            />
          </div>
        </section>
      );
    }

    if (pattern === "B") {
      return (
        <section className="muscleup-section muscleup-pattern-b">
          <ProofBlock
            item={proof}
            caption={caption}
            onOpen={() => openLightbox([proof], 0)}
          />
          {text}
        </section>
      );
    }

    return (
      <section className="muscleup-section muscleup-pattern-a">
        {text}
        <ProofBlock
          item={proof}
          caption={caption}
          onOpen={() => openLightbox([proof], 0)}
        />
      </section>
    );
  };

  const SectionHeading = ({icon, title, subtitle}) => (
    <section className="project-modal-section muscleup-section-heading">
      <div className="muscleup-section-heading-row">
        <span className="muscleup-section-heading-icon">{icon}</span>
        <h3 className="muscleup-section-heading-title">{title}</h3>
      </div>
      {subtitle ? (
        <p className="muscleup-section-heading-subtitle">{subtitle}</p>
      ) : null}
    </section>
  );

  const ServiceIntroSection = () => (
    <section className="project-modal-section muscleup-intro">
      <div className="muscleup-intro-grid">
        <div className="muscleup-intro-copy">
          <h3 className="muscleup-intro-title">What is MuscleUp?</h3>
          <p className="muscleup-intro-hero">
            <HighlightText>
              운동 기록 / 커뮤니티 / AI 코치를 하나의 실서비스 흐름으로 통합
            </HighlightText>
          </p>
          <div className="muscleup-intro-points">
            <div className="muscleup-intro-point">
              <span className="muscleup-intro-icon">P</span>
              <span>
                <strong>Problem</strong> 기록/루틴 분산으로 "오늘 뭐 하지?"에서
                멈춤
              </span>
            </div>
            <div className="muscleup-intro-point">
              <span className="muscleup-intro-icon">S</span>
              <span>
                <strong>Solution</strong> AI 분석 -> 4주 루틴 + 커뮤니티 피드백
              </span>
            </div>
            <div className="muscleup-intro-point">
              <span className="muscleup-intro-icon">O</span>
              <span>
                <strong>Outcome</strong> 인증/보안/배포까지 고려한 실서비스 완성
              </span>
            </div>
          </div>
        </div>
        <div className="muscleup-intro-media">
          <img src={heroProofImage} alt="MuscleUp 서비스 화면" />
          <div className="muscleup-proof-caption">
            실서비스 메인 화면 (모바일/웹)
          </div>
        </div>
      </div>
    </section>
  );

  const QuickSummarySection = () => (
    <section className="project-modal-section">
      <div className="muscleup-summary-box muscleup-summary-wide">
        <h3 className="project-modal-section-title">Quick Summary</h3>
        <div className="muscleup-summary-row">
          <div className="muscleup-summary-item">
            <span className="muscleup-summary-icon">JWT</span>
            <div>
              <div className="muscleup-summary-title">JWT Rotation</div>
              <div className="muscleup-summary-desc">
                탈취 Refresh 재사용 차단
              </div>
            </div>
          </div>
          <div className="muscleup-summary-item">
            <span className="muscleup-summary-icon">AI</span>
            <div>
              <div className="muscleup-summary-title">상태 기반 AI 코칭</div>
              <div className="muscleup-summary-desc">
                히스토리 저장으로 맥락 유지
              </div>
            </div>
          </div>
          <div className="muscleup-summary-item">
            <span className="muscleup-summary-icon">AWS</span>
            <div>
              <div className="muscleup-summary-title">AWS 실서비스 운영</div>
              <div className="muscleup-summary-desc">
                HTTPS/CORS/ACM 이슈 해결
              </div>
            </div>
          </div>
          <div className="muscleup-summary-item">
            <span className="muscleup-summary-icon">ERD</span>
            <div>
              <div className="muscleup-summary-title">도메인 분리 설계</div>
              <div className="muscleup-summary-desc">
                User / Community / AI 확장 구조
              </div>
            </div>
          </div>
          <div className="muscleup-summary-item">
            <span className="muscleup-summary-icon">OPS</span>
            <div>
              <div className="muscleup-summary-title">운영 안정성 확보</div>
              <div className="muscleup-summary-desc">
                배포·인증 이슈 재현-해결-검증
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const SecuritySection = () => (
    <ProofSection
      pattern="A"
      text={
        <TextBlock
          badge={<Badge icon="*" label="Core Design" tone="star" />}
          title="JWT 이중 쿠키 + Rotation"
          bullets={[
            <span className="muscleup-one-liner" key="jwt-one">
              <strong>One-liner:</strong> Rotation으로 탈취 Refresh 재사용 차단
            </span>,
            <>
              <strong>How:</strong>{" "}
              <span className="muscleup-keyword">Access(15m)</span>/
              <span className="muscleup-keyword">Refresh(14d)</span> 분리 +
              Refresh DB 저장, 재발급 시 기존 토큰 즉시 폐기
            </>,
            <>
              <strong>Result:</strong>{" "}
              <span className="muscleup-keyword">HttpOnly</span> 쿠키 + Role 기반
              보호로 세션 안정성 강화
            </>
          ]}
          issueLines={[
            {label: "Threat", text: "로컬스토리지 토큰 XSS 취약"},
            {label: "Control", text: "기존 토큰 폐기 + 신규 저장"}
          ]}
        />
      }
      proof={proofImages.jwt}
      caption="Rotation 로직과 Refresh 저장 구조 증명"
    />
  );

  const AiSection = () => (
    <ProofSection
      pattern="B"
      text={
        <TextBlock
          badge={<Badge icon="*" label="Core Design" tone="star" />}
          title="상태 기반 히스토리 저장 AI"
          chips={["analyze", "plan", "chat"]}
          bullets={[
            <span className="muscleup-one-liner" key="ai-one">
              <strong>One-liner:</strong> 상태 기반 AI 코치로 반복 사용 흐름 유지
            </span>,
            "How: analyze -> plan -> chat 단계 분리, 대화 히스토리 DB 저장",
            "Result: 사용자 맥락 유지로 루틴 수정/재생성이 가능한 제품 형태"
          ]}
        />
      }
      proof={proofImages.ai}
      caption="AI 엔드포인트 분리 + 히스토리 저장 증명"
    />
  );

  const DbSection = () => (
    <ProofSection
      pattern="A"
      text={
        <TextBlock
          badge={<Badge icon="OK" label="Outcome" tone="check" />}
          title="도메인 분리 ERD"
          bullets={[
            <span className="muscleup-one-liner" key="db-one">
              <strong>One-liner:</strong> 사용자/커뮤니티/AI 분리로 확장 가능한
              스키마
            </span>,
            "How: FK 무결성 + 조회 중심 인덱스/페이지네이션 기준 설계",
            <>
              <strong>Result:</strong> users, brag_post, ai_chat_messages,
              refresh_tokens 중심 운영
            </>
          ]}
        />
      }
      proof={proofImages.erd}
      caption="핵심 테이블 분리와 관계 설계 증명"
    />
  );

  const AwsSection = () => (
    <ProofSection
      pattern="B"
      text={
        <TextBlock
          badge={<Badge icon="!" label="Ops & Issue" tone="fire" />}
          title="AWS 운영 이슈 해결"
          bullets={[
            <span className="muscleup-one-liner" key="aws-one">
              <strong>One-liner:</strong> 운영 이슈를 재현 -> 해결 -> 검증까지
              수행
            </span>,
            "How: CloudFront/S3 HTTPS 통일 + CORS allowlist/credentials 유지",
            "Result: 배포 안정성, 보안, 세션 유지 이슈를 운영 관점에서 안정화"
          ]}
          issueLines={[
            {label: "Issue", text: "ACM us-east-1 필요 + Mixed Content 발생"},
            {label: "Fix", text: "CloudFront Invalidation + HTTPS 통일"},
            {label: "Result", text: "CORS credentials 유지, 배포 정상화"}
          ]}
          variant="ops"
        />
      }
      proof={proofImages.aws}
      caption="ACM/CloudFront/CORS 설정 증명"
    />
  );

  const normalizeCategory = label => {
    const key = label.toLowerCase().trim();
    if (key.includes("front")) return "Frontend";
    if (key.includes("back")) return "Backend";
    if (key.includes("db") || key.includes("data")) return "Database";
    if (key.includes("infra")) return "Infrastructure";
    if (key.includes("ai")) return "AI";
    return null;
  };

  const techCategoryOrder = [
    "Frontend",
    "Backend",
    "Database",
    "Infrastructure",
    "AI"
  ];

  const buildTechCategories = techStack => {
    if (!techStack?.length) {
      return [];
    }
    const buckets = techCategoryOrder.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    techStack.forEach(item => {
      const parts = item.split(":");
      const label = parts[0] ? parts[0].trim() : "";
      const category = normalizeCategory(label);
      const list = parts[1] ? parts[1].trim() : item.trim();
      if (category && list) {
        buckets[category].push(list);
      }
    });
    return techCategoryOrder
      .map(category => ({
        category,
        items: buckets[category]
      }))
      .filter(group => group.items.length);
  };

  const techCategoryIcons = {
    Frontend: "FE",
    Backend: "BE",
    Database: "DB",
    Infrastructure: "INF",
    AI: "AI"
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
            {isMuscleUp && <QuickSummarySection />}
            {isMuscleUp && <ServiceIntroSection />}
            {isMuscleUp && (
              <>
                <SectionHeading
                  icon="*"
                  title="Core Design"
                  subtitle="설계 판단과 구조적 증거"
                />
                <SecuritySection />
                <AiSection />
                <DbSection />
                <SectionHeading
                  icon="!"
                  title="Ops & Issue"
                  subtitle="CloudFront / HTTPS / CORS / ACM"
                />
                <AwsSection />
              </>
            )}
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
                    <div className="muscleup-tech-grid">
                      {buildTechCategories(
                        selectedProject.details.overview.techStack
                      ).map(group => (
                        <div
                          key={group.category}
                          className="muscleup-tech-card"
                        >
                          <div className="muscleup-tech-header">
                            <span className="muscleup-tech-icon">
                              {techCategoryIcons[group.category]}
                            </span>
                            <span className="muscleup-tech-title">
                              {group.category}
                            </span>
                          </div>
                          <div className="muscleup-tech-items">
                            {group.items.join(" · ")}
                          </div>
                        </div>
                      ))}
                    </div>
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
































