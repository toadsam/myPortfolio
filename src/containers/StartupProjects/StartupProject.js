import React, {useContext, useEffect, useState} from "react";
import {createPortal} from "react-dom";
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

  const {isDark} = useContext(StyleContext);

  const getProjectStatus = status => {
    if (!status) {
      return null;
    }
    const normalized = String(status).toLowerCase();
    if (normalized === "live") {
      return {key: "live", label: "운영 중"};
    }
    if (normalized === "archived") {
      return {
        key: "archived",
        label: "완료 프로젝트",
        tooltip: "완료 프로젝트입니다."
      };
    }
    return null;
  };

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
            index: (prev.index - 1 + prev.items.length) % prev.items.length
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

  const Badge = ({icon, label, tone = "default"}) => {
    return (
      <span className={`project-badge project-badge-${tone}`}>
        <span className="project-badge-icon">{icon}</span>
        {label}
      </span>
    );
  };

  const renderMultilineText = (text, className) => {
    if (!text) {
      return null;
    }
    const lines = String(text).split("\n");
    return (
      <p className={className}>
        {lines.map((line, index) => (
          <React.Fragment key={`${line}-${index}`}>
            {line}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
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
            aria-label="닫기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="15" y2="15" />
              <line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          </button>
          {items.length > 1 ? (
            <>
              <button
                className="project-lightbox-nav project-lightbox-prev"
                type="button"
                onClick={onPrev}
                aria-label="이전"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="10 3 5 8 10 13" />
                </svg>
              </button>
              <button
                className="project-lightbox-nav project-lightbox-next"
                type="button"
                onClick={onNext}
                aria-label="다음"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 3 11 8 6 13" />
                </svg>
              </button>
            </>
          ) : null}
          <img
            src={current.src}
            alt={current.alt}
            className="project-lightbox-image"
            loading="lazy"
            decoding="async"
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
      src: require("../../assets/images/득근득근/득근득근토큰페기코드.png"),
      alt: "JWT Rotation proof",
      caption: "Rotation: 재발급 시 기존 Refresh 폐기 로직"
    },
    ai: {
      src: require("../../assets/images/득근득근/득근AI관련코드.png"),
      alt: "AI endpoints proof",
      caption: "Endpoints 분리 + 히스토리 저장 로직"
    },
    erd: {
      src: require("../../assets/images/득근득근/득근ERD.png"),
      alt: "ERD proof",
      caption: "핵심 테이블(users, brag_post, ai_chat_messages, refresh_tokens)"
    },
    aws: {
      src: require("../../assets/images/득근득근/득근 AWS.png"),
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
        <button className="muscleup-proof-thumb" type="button" onClick={onOpen}>
          <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
        </button>
        <div className="muscleup-proof-caption">{caption || item.caption}</div>
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
          <img
            src={heroProofImage}
            alt="MuscleUp 서비스 화면"
            loading="lazy"
            decoding="async"
          />
          <div className="muscleup-proof-caption">
            실서비스 메인 화면 (모바일/웹)
          </div>
        </div>
      </div>
    </section>
  );

  const QuickSummarySection = ({items}) => {
    if (!items?.length) {
      return null;
    }
    return (
      <section className="project-modal-section">
        <div className="muscleup-summary-box muscleup-summary-wide">
          <h3 className="project-modal-section-title">Quick Summary</h3>
          <div className="muscleup-summary-row">
            {items.map((item, index) => (
              <div key={index} className="muscleup-summary-item">
                <span className="muscleup-summary-icon">{item.icon}</span>
                <div>
                  <div className="muscleup-summary-title">{item.title}</div>
                  <div className="muscleup-summary-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const SecuritySection = () => (
    <ProofSection
      pattern="A"
      text={
        <TextBlock
          badge={<Badge icon="✦" label="Core Design" tone="star" />}
          title="JWT 이중 쿠키 + Rotation"
          bullets={[
            <div className="muscleup-bullet-group" key="jwt-one">
              <div className="muscleup-bullet-label">ONE-LINER</div>
              <div className="muscleup-bullet-line">
                <span className="muscleup-one-liner">
                  Refresh Token 재사용을 원천 차단하는 Rotation 기반 인증 설계
                </span>
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="jwt-how">
              <div className="muscleup-bullet-label">HOW</div>
              <div className="muscleup-bullet-line">
                Access(15m) / Refresh(14d) 분리 + Refresh DB 저장 및 재발급 시
                즉시 폐기
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="jwt-result">
              <div className="muscleup-bullet-label">RESULT</div>
              <div className="muscleup-bullet-line">
                HttpOnly 쿠키 + Role 기반 보호로 세션 안정성 강화
              </div>
            </div>
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
          badge={<Badge icon="✦" label="Core Design" tone="star" />}
          title="상태 기반 히스토리 저장 AI"
          chips={["analyze", "plan", "chat"]}
          bullets={[
            <div className="muscleup-bullet-group" key="ai-one">
              <div className="muscleup-bullet-label">ONE-LINER</div>
              <div className="muscleup-bullet-line">
                <span className="muscleup-one-liner">
                  상태 기반 AI 코치로 반복 사용 흐름 유지
                </span>
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="ai-how">
              <div className="muscleup-bullet-label">HOW</div>
              <div className="muscleup-bullet-line">
                analyze -&gt; plan -&gt; chat 단계 분리, 대화 히스토리 DB 저장
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="ai-result">
              <div className="muscleup-bullet-label">RESULT</div>
              <div className="muscleup-bullet-line">
                사용자 맥락 유지로 루틴 수정/재생성이 가능한 제품 형태
              </div>
            </div>
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
          badge={<Badge icon="✓" label="Outcome" tone="check" />}
          title="도메인 분리 ERD"
          bullets={[
            <div className="muscleup-bullet-group" key="db-one">
              <div className="muscleup-bullet-label">ONE-LINER</div>
              <div className="muscleup-bullet-line">
                <span className="muscleup-one-liner">
                  사용자/커뮤니티/AI 분리로 확장 가능한 스키마
                </span>
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="db-how">
              <div className="muscleup-bullet-label">HOW</div>
              <div className="muscleup-bullet-line">
                FK 무결성 + 조회 중심 인덱스/페이지네이션 기준 설계
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="db-result">
              <div className="muscleup-bullet-label">RESULT</div>
              <div className="muscleup-bullet-line">
                users, brag_post, ai_chat_messages, refresh_tokens 중심 운영
              </div>
            </div>
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
          badge={<Badge icon="▲" label="Ops & Issue" tone="fire" />}
          title="AWS 운영 이슈 해결"
          bullets={[
            <div className="muscleup-bullet-group" key="aws-one">
              <div className="muscleup-bullet-label">ONE-LINER</div>
              <div className="muscleup-bullet-line">
                <span className="muscleup-one-liner">
                  운영 이슈를 재현 -&gt; 해결 -&gt; 검증까지 수행
                </span>
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="aws-how">
              <div className="muscleup-bullet-label">HOW</div>
              <div className="muscleup-bullet-line">
                CloudFront/S3 HTTPS 통일 + CORS allowlist/credentials 유지
              </div>
            </div>,
            <div className="muscleup-bullet-group" key="aws-result">
              <div className="muscleup-bullet-label">RESULT</div>
              <div className="muscleup-bullet-line">
                배포 안정성, 보안, 세션 유지 이슈를 운영 관점에서 안정화
              </div>
            </div>
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

  const muscleupQuickSummaryItems = [
    {
      icon: "🔐",
      title: "JWT Rotation",
      desc: "탈취 Refresh 재사용 차단"
    },
    {
      icon: "🤖",
      title: "상태 기반 AI 코칭",
      desc: "히스토리 저장으로 맥락 유지"
    },
    {
      icon: "☁️",
      title: "AWS 실서비스 운영",
      desc: "HTTPS/CORS/ACM 이슈 해결"
    },
    {
      icon: "🧩",
      title: "도메인 분리 설계",
      desc: "User / Community / AI 확장 구조"
    },
    {
      icon: "🛠️",
      title: "운영 안정성 확보",
      desc: "배포·인증 이슈 재현-해결-검증"
    }
  ];

  const buildQuickSummaryItems = (details, project) => {
    if (!details) {
      return [];
    }
    if (details.quickSummary?.length) {
      return details.quickSummary;
    }
    const items = [];
    const addItem = (icon, title, desc) => {
      if (title && desc) {
        items.push({icon, title, desc});
      }
    };
    if (details.highlights?.length) {
      addItem("KEY", "핵심 설계", details.highlights[0]);
    }
    if (details.coreFeatures?.length) {
      addItem("FEAT", "핵심 기능", details.coreFeatures[0]);
    }
    if (details.authSecurity?.length) {
      addItem("SEC", "보안/인증", details.authSecurity[0]);
    }
    if (details.deployment?.length) {
      addItem("OPS", "운영 이슈", details.deployment[0]);
    }
    if (details.role) {
      addItem("ROLE", "담당 범위", details.role);
    }
    if (!items.length && project?.projectDesc) {
      addItem("INFO", "프로젝트 요약", project.projectDesc);
    }
    return items.slice(0, 5);
  };

  const buildIntroLines = (details, project) => {
    const fallbackSummary = details?.summary || project?.projectDesc || "";
    const problem = details?.problemSolution?.problem?.[0] || fallbackSummary;
    const solution =
      details?.problemSolution?.solution ||
      details?.highlights?.[0] ||
      details?.coreFeatures?.[0] ||
      "";
    const outcome =
      details?.problemSolution?.outcome ||
      details?.role ||
      details?.deployment?.[0] ||
      "";
    return {problem, solution, outcome};
  };

  const buildCoreDesignItems = details => {
    if (!details) {
      return [];
    }
    if (details.coreDesign?.length) {
      return details.coreDesign;
    }
    const items = [];
    const stackSnippet = details.stack
      ? details.stack.split(",").slice(0, 4).join(" · ")
      : "";
    const summary = details.summary || "";
    const source = [
      ...(details.highlights || []),
      ...(details.coreFeatures || []),
      ...(details.authSecurity || []),
      ...(details.architecture || [])
    ];
    source.forEach(entry => {
      if (!entry) {
        return;
      }
      items.push({
        title: entry,
        oneLiner: entry,
        how: stackSnippet ? `How: ${stackSnippet}` : "",
        result: summary ? `Result: ${summary}` : ""
      });
    });
    return items.slice(0, 4);
  };

  const buildOpsItem = details => {
    if (details?.ops) {
      return {
        oneLiner: details.ops.oneLiner,
        how: details.ops.how,
        result: details.ops.result,
        proofImage: details.ops.proofImage,
        proofCaption: details.ops.proofCaption
      };
    }
    if (!details?.deployment?.length) {
      return null;
    }
    const [first, second, third] = details.deployment;
    return {
      oneLiner: first,
      how: second,
      result: third
    };
  };

  const ProjectIntroSection = ({project}) => {
    if (!project) {
      return null;
    }
    const details = project.details || {};
    const intro = details.intro || {};
    const {problem, solution, outcome} = buildIntroLines(details, project);
    const introProblem = intro.problem || problem;
    const introSolution = intro.solution || solution;
    const introOutcome = intro.outcome || outcome;
    const headline = intro.headline || "What is This Project?";
    const highlight = intro.highlight || details.summary;
    const caption = intro.caption || "대표 화면/결과물";
    const images =
      intro.images && intro.images.length
        ? intro.images
        : [
            details.overview?.image ||
              project.image ||
              require("../../assets/images/saayaHealthLogo.webp")
          ];
    return (
      <section className="project-modal-section muscleup-intro">
        <div className="muscleup-intro-grid">
          <div className="muscleup-intro-copy">
            <h3 className="muscleup-intro-title">{headline}</h3>
            {highlight ? (
              <p className="muscleup-intro-hero">
                <HighlightText>{highlight}</HighlightText>
              </p>
            ) : null}
            <div className="muscleup-intro-points">
              {introProblem ? (
                <div className="muscleup-intro-point">
                  <span className="muscleup-intro-icon">P</span>
                  <span>
                    <strong>Problem</strong> {introProblem}
                  </span>
                </div>
              ) : null}
              {introSolution ? (
                <div className="muscleup-intro-point">
                  <span className="muscleup-intro-icon">S</span>
                  <span>
                    <strong>Solution</strong> {introSolution}
                  </span>
                </div>
              ) : null}
              {introOutcome ? (
                <div className="muscleup-intro-point">
                  <span className="muscleup-intro-icon">O</span>
                  <span>
                    <strong>Outcome</strong> {introOutcome}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="muscleup-intro-media">
            <div className="muscleup-intro-media-list">
              {images.map((img, index) => (
                <img
                  key={`${project.projectName}-${index}`}
                  src={img}
                  alt={`${project.projectName} 화면 ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <div className="muscleup-proof-caption">{caption}</div>
          </div>
        </div>
      </section>
    );
  };
  const normalizeCategory = label => {
    const key = label.toLowerCase().trim();
    if (key.includes("front")) return "Frontend";
    if (key.includes("back")) return "Backend";
    if (key.includes("db") || key.includes("data")) return "Database";
    if (key.includes("infra")) return "Infrastructure";
    if (key.includes("ai")) return "AI";
    if (key.includes("analytics")) return "Analytics";
    if (key.includes("deploy")) return "Deploy";
    if (key.includes("tooling") || key.includes("tools")) return "Tooling";
    if (key.includes("content")) return "Content Ops";
    if (key.includes("promotion")) return "Promotion";
    return null;
  };

  const techCategoryOrder = [
    "Frontend",
    "Backend",
    "Database",
    "Infrastructure",
    "AI",
    "Analytics",
    "Deploy",
    "Tooling",
    "Content Ops",
    "Promotion"
  ];

  const buildTechCategories = (techStack, fallbackStack) => {
    const stackList = Array.isArray(techStack) ? techStack : [];
    if (!stackList.length) {
      if (fallbackStack) {
        return [
          {
            category: "Frontend",
            items: [fallbackStack]
          }
        ];
      }
      return [];
    }
    const buckets = techCategoryOrder.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    const extraBuckets = {};
    const extraOrder = [];
    stackList.forEach(item => {
      const parts = item.split(":");
      const label = parts[0] ? parts[0].trim() : "";
      const category = normalizeCategory(label);
      const list = parts[1] ? parts[1].trim() : item.trim();
      if (!list) {
        return;
      }
      if (category) {
        buckets[category].push(list);
        return;
      }
      const extraKey = label || "Other";
      if (!extraBuckets[extraKey]) {
        extraBuckets[extraKey] = [];
        extraOrder.push(extraKey);
      }
      extraBuckets[extraKey].push(list);
    });
    const primaryGroups = techCategoryOrder
      .map(category => ({
        category,
        items: buckets[category]
      }))
      .filter(group => group.items.length);
    const extraGroups = extraOrder
      .map(category => ({
        category,
        items: extraBuckets[category]
      }))
      .filter(group => group.items.length);
    return [...primaryGroups, ...extraGroups];
  };

  const techCategoryIcons = {
    Frontend: "FE",
    Backend: "BE",
    Database: "DB",
    Infrastructure: "INF",
    AI: "AI",
    Analytics: "AN",
    Deploy: "DEP",
    Tooling: "TL",
    "Content Ops": "OPS",
    Promotion: "PR"
  };

  const getProjectBannerClass = project => {
    const name = (project?.projectName || "").toLowerCase();
    const desc = (project?.projectDesc || "").toLowerCase();
    const value = `${name} ${desc}`;
    const hasOps =
      value.includes("aws") ||
      value.includes("deploy") ||
      value.includes("https") ||
      value.includes("cors") ||
      value.includes("infra") ||
      value.includes("acm") ||
      value.includes("cloudfront");
    if (value.includes("muscleup") || value.includes("득근득근")) {
      return "project-banner-web-ai";
    }
    if (hasOps && (value.includes("web") || value.includes("react"))) {
      return "project-banner-web-ops";
    }
    if (value.includes("tserof") || value.includes("game")) {
      return "project-banner-game";
    }
    if (
      value.includes("monster") ||
      value.includes("ar") ||
      value.includes("xr")
    ) {
      return "project-banner-ar";
    }
    if (value.includes("ajou campus") || value.includes("foodmap")) {
      return "project-banner-web";
    }
    if (value.includes("club") || value.includes("아주대학교 총학생회")) {
      return "project-banner-ops";
    }
    if (value.includes("other side") || value.includes("vr")) {
      return "project-banner-game";
    }
    if (hasOps) {
      return "project-banner-ops";
    }
    return "project-banner-web";
  };

  const buildGenericBullets = (item, keyPrefix) => {
    const groups = [];
    if (item.oneLiner) {
      groups.push(
        <div className="muscleup-bullet-group" key={`${keyPrefix}-one`}>
          <div className="muscleup-bullet-label">ONE-LINER</div>
          <div className="muscleup-bullet-line">
            <span className="muscleup-one-liner">{item.oneLiner}</span>
          </div>
        </div>
      );
    }
    if (item.how) {
      groups.push(
        <div className="muscleup-bullet-group" key={`${keyPrefix}-how`}>
          <div className="muscleup-bullet-label">HOW</div>
          <div className="muscleup-bullet-line">{item.how}</div>
        </div>
      );
    }
    if (item.result) {
      groups.push(
        <div className="muscleup-bullet-group" key={`${keyPrefix}-result`}>
          <div className="muscleup-bullet-label">RESULT</div>
          <div className="muscleup-bullet-line">{item.result}</div>
        </div>
      );
    }
    return groups;
  };

  const quickSummaryItems = isMuscleUp
    ? muscleupQuickSummaryItems
    : buildQuickSummaryItems(selectedProject?.details, selectedProject);
  const coreDesignItems = !isMuscleUp
    ? buildCoreDesignItems(selectedProject?.details)
    : [];
  const opsItem = !isMuscleUp ? buildOpsItem(selectedProject?.details) : null;
  const genericProofImage =
    selectedProject?.details?.overview?.image ||
    selectedProject?.image ||
    require("../../assets/images/saayaHealthLogo.webp");
  const techCategories = buildTechCategories(
    selectedProject?.details?.overview?.techStack,
    selectedProject?.details?.stack
  );
  const linkItems =
    selectedProject?.details?.overview?.links ||
    selectedProject?.details?.links ||
    selectedProject?.footerLink ||
    [];

  const buildOverviewTechStack = techStack => {
    const items = Array.isArray(techStack) ? techStack : [];
    return items
      .map(entry => {
        const [rawCategory, rawItems] = entry.split(":");
        if (!rawItems) {
          return {category: "", items: [entry.trim()]};
        }
        const category = rawCategory.trim();
        const stackItems = rawItems
          .split(",")
          .map(value => value.trim())
          .filter(Boolean);
        return {category, items: stackItems};
      })
      .filter(item => item.items.length);
  };
  const overviewTechStack = buildOverviewTechStack(
    selectedProject?.details?.overview?.techStack
  );
  return (
    <>
      <Fade bottom duration={1000} distance="20px">
        <div className="main" id="projects">
          <div>
            <div className="project-header-row">
              <h1 className="skills-heading">{bigProjects.title}</h1>
              <div className="project-legend">
                <span className="project-legend-item">
                  <span className="project-legend-dot project-legend-web"></span>
                  Blue/Teal: Web Service · Full-Stack 중심의 실서비스 개발
                </span>
                <span className="project-legend-item">
                  <span className="project-legend-dot project-legend-ai"></span>
                  Indigo/Violet: Data · AI 기반 로직 설계 및 분석 중심 프로젝트
                </span>
                <span className="project-legend-item">
                  <span className="project-legend-dot project-legend-game"></span>
                  Emerald/Cyan: Game · Unity 기반 인터랙티브 콘텐츠 개발
                </span>
                <span className="project-legend-item">
                  <span className="project-legend-dot project-legend-ar"></span>
                  Amber/Orange: AR · XR 기반 실감형 사용자 경험 구현
                </span>
                <span className="project-legend-item">
                  <span className="project-legend-dot project-legend-ops"></span>
                  Gray: Ops · 배포, 운영, 인증, 인프라 안정화 중심 프로젝트
                </span>
              </div>
            </div>
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
                const statusMeta = getProjectStatus(project.status);
                const liveFooterLinks =
                  String(project.status).toLowerCase() === "live"
                    ? project.footerLink || []
                    : [];
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
                    {statusMeta ? (
                      <div
                        className={`project-status project-status-${statusMeta.key}`}
                        title={statusMeta.tooltip}
                      >
                        <span className="project-status-dot" />
                        <span className="project-status-text">
                          {statusMeta.label}
                        </span>
                      </div>
                    ) : null}
                    <div
                      className={`experience-banner ${getProjectBannerClass(
                        project
                      )}`}
                    >
                      <div
                        className={`experience-blurred_div ${getProjectBannerClass(
                          project
                        )}`}
                      ></div>
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
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </div>
                    <div className="experience-text-details project-detail">
                      <div className="project-card-content">
                        <h5
                          className={
                            isDark
                              ? "experience-text-role dark-mode-text"
                              : "experience-text-role"
                          }
                        >
                          {project.projectName}
                        </h5>
                        {renderMultilineText(
                          project.recommendation || project.projectDesc,
                          isDark
                            ? "subTitle experience-text-desc project-recommendation dark-mode-text project-desc-text"
                            : "subTitle experience-text-desc project-recommendation project-desc-text"
                        )}
                        {project.tags?.length ? (
                          <div className="project-card-tags">
                            {project.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="project-card-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="project-card-actions">
                        {liveFooterLinks.length ? (
                          <div className="project-card-action-links">
                            {liveFooterLinks.map((link, linkIndex) => (
                              <a
                                key={`${link.name}-${linkIndex}`}
                                className={
                                  isDark
                                    ? "dark-mode project-card-link"
                                    : "project-card-link"
                                }
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={event => event.stopPropagation()}
                              >
                                {link.name}
                              </a>
                            ))}
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
              aria-label="닫기"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>
            {lightbox && typeof document !== "undefined"
              ? createPortal(
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
                  />,
                  document.body
                )
              : null}
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
                <>
                  <div className="project-overview-media">
                    {selectedProject.details.overview.image ? (
                      <img
                        src={selectedProject.details.overview.image}
                        alt={selectedProject.projectName}
                        className="project-overview-image"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    {selectedProject.details.overview.caption && (
                      <div className="project-overview-caption">
                        {selectedProject.details.overview.caption}
                      </div>
                    )}
                  </div>
                  <div className="project-overview-grid">
                    <div className="project-overview-col">
                      {selectedProject.details.overview.role && (
                        <div className="project-overview-block">
                          <h4 className="project-overview-block-title">ROLE</h4>
                          <p className="project-overview-block-text">
                            {selectedProject.details.overview.role}
                          </p>
                        </div>
                      )}
                      {selectedProject.details.overview.period && (
                        <div className="project-overview-block">
                          <h4 className="project-overview-block-title">
                            PERIOD
                          </h4>
                          <p className="project-overview-block-text">
                            {selectedProject.details.overview.period}
                          </p>
                        </div>
                      )}
                      {selectedProject.details.overview.coreValue && (
                        <div className="project-overview-block project-overview-core">
                          <h4 className="project-overview-block-title">
                            CORE VALUE
                          </h4>
                          <p className="project-overview-block-text">
                            {selectedProject.details.overview.coreValue}
                          </p>
                        </div>
                      )}
                    </div>
                    {overviewTechStack.length ? (
                      <div className="project-overview-col">
                        <div className="project-overview-block">
                          <h4 className="project-overview-block-title">
                            TECH STACK
                          </h4>
                          <div className="project-overview-tech-grid">
                            {overviewTechStack.map((group, i) => (
                              <div key={i} className="project-overview-tech">
                                {group.category ? (
                                  <div className="project-overview-tech-title">
                                    {group.category}
                                  </div>
                                ) : null}
                                <div className="project-overview-tech-items">
                                  {group.items.join(" · ")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
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
                                rel="noopener noreferrer"
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
              </section>
            ) : (
              <>
                <div className="project-modal-header">
                  {selectedProject.image ? (
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.projectName}
                      className="project-modal-image"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div>
                    <h2 className="project-modal-title">
                      {selectedProject.projectName}
                    </h2>
                    {renderMultilineText(
                      selectedProject.projectDesc,
                      "project-modal-subtitle project-desc-text"
                    )}
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
            {quickSummaryItems.length ? (
              <QuickSummarySection items={quickSummaryItems} />
            ) : null}
            {isMuscleUp ? (
              <ServiceIntroSection />
            ) : (
              <ProjectIntroSection project={selectedProject} />
            )}
            {isMuscleUp ? (
              <>
                <SectionHeading
                  icon="✦"
                  title="Core Design"
                  subtitle="설계 판단과 구조적 증거"
                />
                <SecuritySection />
                <AiSection />
                <DbSection />
                <SectionHeading
                  icon="▲"
                  title="Ops & Issue"
                  subtitle="CloudFront / HTTPS / CORS / ACM"
                />
                <AwsSection />
              </>
            ) : (
              <>
                {coreDesignItems.length ? (
                  <>
                    <SectionHeading
                      icon="✦"
                      title="Core Design"
                      subtitle="설계 판단과 구조적 증거"
                    />
                    {coreDesignItems.map((item, index) => (
                      <ProofSection
                        key={`${item.title}-${index}`}
                        pattern={index % 2 === 0 ? "A" : "B"}
                        text={
                          <TextBlock
                            badge={
                              <Badge icon="✦" label="Core Design" tone="star" />
                            }
                            title={item.title}
                            bullets={buildGenericBullets(item, `core-${index}`)}
                          />
                        }
                        proof={{
                          src: item.proofImage || genericProofImage,
                          alt:
                            item.proofAlt ||
                            `${selectedProject.projectName} proof`
                        }}
                        caption={item.proofCaption || `${item.title} 증명`}
                      />
                    ))}
                  </>
                ) : null}
                {opsItem ? (
                  <>
                    <SectionHeading
                      icon="▲"
                      title="Ops & Issue"
                      subtitle="운영 이슈 대응 요약"
                    />
                      <ProofSection
                        pattern="B"
                        text={
                          <TextBlock
                            badge={
                              <Badge icon="▲" label="Ops & Issue" tone="fire" />
                            }
                            title="운영 이슈 대응"
                            bullets={buildGenericBullets(opsItem, "ops")}
                            variant="ops"
                          />
                        }
                        proof={{
                          src: opsItem.proofImage || genericProofImage,
                          alt: `${selectedProject.projectName} ops proof`
                        }}
                        caption={opsItem.proofCaption || "운영 이슈 증명"}
                      />
                  </>
                ) : null}
              </>
            )}
            <section className="project-modal-section">
              <Accordion title="Tech Stack">
                {techCategories.length ? (
                  <div className="muscleup-tech-grid">
                    {techCategories.map(group => (
                      <div key={group.category} className="muscleup-tech-card">
                        <div className="muscleup-tech-header">
                          <span className="muscleup-tech-icon">
                            {techCategoryIcons[group.category] || "ST"}
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
                {linkItems.length ? (
                  <div className="project-modal-links">
                    {linkItems.map((link, i) => (
                      <a
                        key={i}
                        className="project-modal-link"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
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
          </div>
        </div>
      )}
    </>
  );
}
