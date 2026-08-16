"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useRef} from "react";
import {getProjectTheme, type ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_DATA} from "./project-viewers/richContent/data";
import {MYWAVE_BRIEF} from "./project-viewers/richContent/mywaveBrief";
import type {
  CodeSpec,
  ImgSpec,
  RichProject
} from "./project-viewers/richContent/shared";
import {
  CodeLine,
  CountUp,
  ImageSlot
} from "./project-viewers/richContent/shared";
import "./ProjectDetail.css";

// ════════════════════════════════════════════════════════════════════════════
//  면접관 원페이지 (단일 스크롤 · 빠른 스캔)
//  - 마을 뷰(ProjectViewer)와 달리 탭·복잡한 인터랙션 없이 위에서 아래로 읽는다.
//  - 이력서 모드 전용이므로 프로젝트별 테마색 대신 단일 터미널 톤(시안+블랙)으로 통일.
//  - 레이아웃/스타일은 ProjectDetail.css (.op-detail 스코프).
// ════════════════════════════════════════════════════════════════════════════

function getBrief(id: string): RichProject | null {
  if (RICH_DATA[id]) return RICH_DATA[id]!;
  if (id === "mywave") return MYWAVE_BRIEF;
  return null;
}

const CATEGORY_LABEL: Record<string, string> = {
  dashboard: "DASHBOARD",
  realtime: "REALTIME",
  platform: "PLATFORM",
  game: "GAME"
};

// 이력서 모드는 전 프로젝트를 같은 톤으로 통일한다 (ProjectDetail.css의 --accent와 동일).
// 마을(3D) 뷰는 getProjectTheme()을 각자 호출하므로 이 값에 영향받지 않는다.
const TERMINAL_ACCENT = "#00f5ff";
const TERMINAL_BG = "#050505";

function terminalTheme(base: ProjectTheme): ProjectTheme {
  return {
    ...base,
    primary: TERMINAL_ACCENT,
    secondary: TERMINAL_ACCENT,
    accent: TERMINAL_ACCENT,
    bg: TERMINAL_BG
  };
}

// ─── 아이콘 (아이콘 라이브러리 없이 인라인 SVG — 저장소 관례) ──────────────────

function Icon({name, className}: {name: string; className?: string}) {
  const paths: Record<string, React.ReactNode> = {
    image: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M3 17l5-4 4 3 4-4 5 4" />
      </>
    ),
    layout: (
      <>
        <rect height="18" rx="2" width="18" x="3" y="3" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
    server: (
      <>
        <rect height="8" rx="2" width="20" x="2" y="2" />
        <rect height="8" rx="2" width="20" x="2" y="14" />
        <path d="M6 6h.01M6 18h.01" />
      </>
    ),
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
        <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </>
    ),
    chart: <path d="M3 3v18h18M7 15l4-5 3 3 5-7" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12.5l2.5 2.5L16 9.5" />
      </>
    ),
    x: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </>
    ),
    rocket: (
      <>
        <path d="M5 13l-2 6 6-2 8.5-8.5A4 4 0 0012 3L5 13z" />
        <path d="M9 15l-2-2" />
      </>
    ),
    github: (
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0019.9 4a4.9 4.9 0 00-.1-3.6s-1.2-.3-3.9 1.5a13.4 13.4 0 00-7 0C6.2-.1 5 .2 5 .2A4.9 4.9 0 004.9 3.8 5.2 5.2 0 003.5 7.4c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 00-.9 2.6V22" />
    ),
    arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
    arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
    external: (
      <>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <path d="M15 3h6v6M10 14L21 3" />
      </>
    )
  };
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name] ?? paths.image}
    </svg>
  );
}

const ARCH_ICONS = ["layout", "server", "zap", "database"];

// ─── 이미지 자리 ──────────────────────────────────────────────────────────────
// src가 있으면 기존 ImageSlot(확대 보기 지원)을, 없으면 목업의 점선 플레이스홀더를 쓴다.

function Shot({
  spec,
  ratio,
  theme,
  className = "",
  iconName = "image",
  big = false
}: {
  spec?: ImgSpec;
  ratio: string;
  theme: ProjectTheme;
  className?: string;
  iconName?: string;
  big?: boolean;
}) {
  if (spec?.src) {
    return <ImageSlot className={className} spec={spec} theme={theme} />;
  }
  return (
    <div
      className={`placeholder-box ${className}`}
      data-ratio={ratio.replace("/", ":")}
      style={{aspectRatio: ratio.replace("/", " / ")}}
    >
      <Icon
        className={`${big ? "h-12 w-12" : "h-8 w-8"} mb-2 opacity-20`}
        name={iconName}
      />
      <p className="px-4 text-center text-[10px] uppercase tracking-widest text-[#444] md:text-xs">
        {spec?.label ?? "이미지 자리"}
      </p>
    </div>
  );
}

// ─── 코드 창 ──────────────────────────────────────────────────────────────────

function CodeWindow({spec, theme}: {spec: CodeSpec; theme: ProjectTheme}) {
  const hl = spec.highlightLines ?? [];
  return (
    <div className="code-window">
      <div className="code-header">
        <div className="code-dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <span className="mono text-[10px] text-gray-500">{spec.filename}</span>
      </div>
      <pre className="mono overflow-x-auto p-6 text-xs leading-relaxed text-[#d4d4d4]">
        {spec.lines.map((line, i) => (
          <div
            key={i}
            style={
              hl.includes(i + 1)
                ? {
                    background: "rgba(0,245,255,0.07)",
                    marginInline: -24,
                    paddingInline: 24
                  }
                : undefined
            }
          >
            {line.trim() === "" ? " " : <CodeLine line={line} theme={theme} />}
          </div>
        ))}
      </pre>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  메인
// ════════════════════════════════════════════════════════════════════════════

interface Props {
  project: ProjectData | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  index?: number;
  total?: number;
}

export function ProjectOnePager({
  project,
  onClose,
  onPrev,
  onNext,
  index,
  total
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rawTheme = project ? getProjectTheme(project.id) : null;
  const theme = rawTheme ? terminalTheme(rawTheme) : null;
  const data = project ? getBrief(project.id) : null;

  // 프로젝트가 바뀌면 스크롤을 맨 위로.
  useEffect(() => {
    scrollRef.current?.scrollTo({top: 0, behavior: "auto"});
  }, [project?.id]);

  // 스크롤 등장 — 목업과 동일하게 IntersectionObserver로 .visible을 붙인다.
  // root를 스크롤 컨테이너로 지정해야 오버레이 내부 스크롤에서도 동작한다.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !project) return;
    const targets = root.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // 화면에 들어왔거나, 빠르게 스크롤해 이미 위로 지나가 버린 경우에도 등장 처리.
          // (지나간 요소를 그대로 두면 opacity 0으로 영영 안 보인다)
          const scrolledPast =
            !!entry.rootBounds &&
            entry.boundingClientRect.bottom < entry.rootBounds.top;
          if (entry.isIntersecting || scrolledPast) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      {root, rootMargin: "0px 0px -80px 0px", threshold: 0.1}
    );
    targets.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose, onNext, onPrev]);

  if (!project || !theme || !data) {
    return <AnimatePresence />;
  }

  // "득근득근 (MuscleUp)"처럼 괄호가 붙은 제목은 괄호 부분만 강조색으로.
  const titleMatch = project.title.match(/^(.*?)\s*(\([^)]*\))\s*$/);
  const repoHref = data.demo.repo ?? project.links[0]?.href;
  const teamMeta = data.meta.find(m => m.label === "팀");
  const roleRow = (k: string) => k.includes("역할");
  // 실시간 계층처럼 핵심이 되는 계층은 목업처럼 강조 카드로.
  const heroLayer = data.architecture.findIndex(l =>
    /realtime|실시간|socket/i.test(`${l.tag} ${l.name} ${l.desc}`)
  );

  return (
    <AnimatePresence>
      <motion.div
        animate={{opacity: 1}}
        className="op-detail fixed inset-0 z-[70] w-full overflow-y-auto"
        exit={{opacity: 0}}
        initial={{opacity: 0}}
        key={project.id}
        ref={scrollRef}
        transition={{duration: 0.25}}
      >
        {/* ══════════ 상단 바 ══════════ */}
        {/* 목업은 position:fixed지만, 스크롤 컨테이너 안에서는 sticky가 같은 결과를 준다 */}
        <nav className="sticky top-0 z-50 w-full border-b border-[#1a1a1a] bg-black/80 px-5 py-4 backdrop-blur-md md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button
              className="flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-white"
              onClick={onClose}
              type="button"
            >
              <Icon className="h-4 w-4" name="arrowLeft" />
              목록으로
            </button>

            <div className="mono hidden items-center gap-6 text-[10px] uppercase tracking-widest text-[#444] md:flex">
              <span>
                Status: <span className="text-green-500">Deployed</span>
              </span>
              <span className="text-accent">
                {CATEGORY_LABEL[theme.category] ?? "PROJECT"} ·{" "}
                {project.id.toUpperCase()}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {typeof index === "number" && typeof total === "number" ? (
                <span className="mono hidden text-[10px] text-[#444] sm:inline">
                  {index + 1} / {total}
                </span>
              ) : null}
              {onPrev ? (
                <button
                  aria-label="이전 프로젝트"
                  className="mono rounded-full border border-[#1a1a1a] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-accent hover:text-white"
                  onClick={onPrev}
                  type="button"
                >
                  ‹
                </button>
              ) : null}
              {onNext ? (
                <button
                  aria-label="다음 프로젝트"
                  className="mono rounded-full border border-[#1a1a1a] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-accent hover:text-white"
                  onClick={onNext}
                  type="button"
                >
                  ›
                </button>
              ) : null}
              {repoHref ? (
                <a
                  aria-label="GitHub 저장소"
                  className="rounded-full border border-[#1a1a1a] p-2 transition-colors hover:border-accent"
                  href={repoHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" name="github" />
                </a>
              ) : null}
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl space-y-24 px-5 pb-20 pt-10 md:px-8 md:space-y-32">
          {/* ══════════ HERO ══════════ */}
          <section className="anim-fade-up grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            <div className="anim-slide-left delay-1 space-y-8 lg:col-span-7">
              <div>
                <h1 className="mb-4 text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl">
                  {titleMatch ? (
                    <>
                      {titleMatch[1]}{" "}
                      <span className="text-accent">{titleMatch[2]}</span>
                    </>
                  ) : (
                    project.title
                  )}
                </h1>
                <p className="text-base font-medium uppercase tracking-widest text-gray-400 md:text-xl">
                  {data.tagline}
                </p>
              </div>

              {/* 핵심 요약 */}
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
                <div className="section-label mb-4">Core Summary</div>
                <table className="cyber-table w-full text-sm">
                  <tbody>
                    {data.tldr.map(r => (
                      <tr key={r.k}>
                        <td className="mono w-24 text-accent">{r.k}</td>
                        <td
                          className={`text-gray-300 ${
                            roleRow(r.k) ? "font-bold" : ""
                          }`}
                        >
                          {r.v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 뱃지 — 팀 구성 + 기술 스택 (앞 3개는 강조) */}
              <div className="flex flex-wrap gap-2">
                {teamMeta ? (
                  <span className="badge">Team: {teamMeta.value}</span>
                ) : null}
                {data.tech.map((t, i) => (
                  <span
                    className={`badge ${
                      i < 3 ? "border-accent text-accent" : ""
                    }`}
                    key={t}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 pt-4">
                {project.links.map(link => (
                  <a
                    className="flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-accent"
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon className="h-4 w-4" name="github" />
                    {link.label}
                  </a>
                ))}
                <button
                  className="flex cursor-not-allowed items-center gap-2 rounded-md border border-[#1a1a1a] px-6 py-3 text-sm font-bold text-[#444]"
                  disabled
                  type="button"
                >
                  <Icon className="h-4 w-4" name="external" />
                  라이브 데모 (준비 중)
                </button>
              </div>
            </div>

            {/* 대표 화면 */}
            <div className="anim-slide-right delay-2 h-full min-h-[300px] lg:col-span-5 lg:min-h-[400px]">
              <Shot
                big
                className="h-full w-full rounded-xl"
                ratio="16/9"
                spec={data.heroImage}
                theme={theme}
              />
            </div>
          </section>

          {/* ══════════ 문제 정의 ══════════ */}
          <section className="reveal grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="reveal-left order-2 space-y-4 lg:order-1 lg:col-span-5">
              <Shot
                className="w-full"
                ratio="4/3"
                spec={data.problemShot}
                theme={theme}
              />
              {/* 리서치 인용 — 목업엔 없지만 근거 자료라 이미지 아래에 배치 */}
              {data.research.quotes.map(q => (
                <blockquote
                  className="border-l-2 border-[#1a1a1a] pl-4 text-sm italic leading-relaxed text-gray-500"
                  key={q.who}
                >
                  “{q.q}”
                  <span className="mono mt-1 block not-italic text-[10px] uppercase tracking-widest text-[#444]">
                    — {q.who}
                  </span>
                </blockquote>
              ))}
            </div>

            <div className="reveal-right order-1 space-y-8 lg:order-2 lg:col-span-7">
              <div className="section-label">Context</div>
              <div className="space-y-6">
                <h3 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
                  <Icon className="h-7 w-7 text-red-500" name="alert" />
                  Problem
                </h3>
                <p className="text-base leading-relaxed text-gray-400 md:text-lg">
                  {data.problem}
                </p>

                <div className="highlight-box mt-12 p-6 md:p-8">
                  <h4 className="mono mb-4 text-xs uppercase tracking-widest text-accent">
                    Hypothesis
                  </h4>
                  <blockquote className="text-lg font-light italic leading-snug text-white md:text-2xl">
                    {data.hypothesis}
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ 아키텍처 ══════════ */}
          <section className="reveal space-y-12 md:space-y-16">
            <div className="section-label">Architecture &amp; Design</div>

            <div className="stagger-children grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {data.architecture.map((layer, i) => {
                const hero = i === heroLayer;
                return (
                  <div
                    className={`arch-card reveal ${
                      hero ? "border-accent bg-accent/5" : ""
                    }`}
                    key={layer.name}
                  >
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded ${
                        hero
                          ? "bg-accent text-black"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      <Icon
                        className="h-5 w-5"
                        name={ARCH_ICONS[i % ARCH_ICONS.length]}
                      />
                    </div>
                    <h4 className="mb-2 text-sm font-bold uppercase tracking-wider">
                      {layer.tag}
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${
                        hero ? "font-bold text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {layer.name}: {layer.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <Shot
              big
              className="w-full rounded-xl"
              iconName="share"
              ratio="21/9"
              spec={{label: "시스템 아키텍처 다이어그램", ratio: "21/9"}}
              theme={theme}
            />

            <div className="reveal space-y-8">
              <h3 className="text-xl font-bold tracking-tight md:text-2xl">
                Technical Decision Table
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[#1a1a1a]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="mono bg-[#111] text-[10px] uppercase tracking-widest text-accent">
                    <tr>
                      <th className="border-b border-[#1a1a1a] p-4">영역</th>
                      <th className="border-b border-[#1a1a1a] p-4">
                        선택 (Choice)
                      </th>
                      <th className="border-b border-[#1a1a1a] p-4">
                        이유 / 대안 (Why vs Alternatives)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {data.decisions.map(d => (
                      <tr
                        className="transition-colors hover:bg-white/[0.02]"
                        key={d.area}
                      >
                        <td className="p-4 font-bold text-white">{d.area}</td>
                        <td className="p-4 text-accent">{d.pick}</td>
                        <td className="p-4 text-gray-400">
                          {d.why} ↔ {d.alt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ══════════ 핵심 구현 ══════════ */}
          {data.coreCode.length > 0 ? (
            <section className="reveal space-y-12">
              <div className="section-label">Implementation</div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {data.coreCode.map((c, i) => (
                  <div
                    className={`space-y-4 ${
                      i % 2 === 0 ? "reveal-left" : "reveal-right"
                    }`}
                    key={c.filename}
                  >
                    <p className="text-sm font-medium text-gray-400">
                      <span className="text-accent">💡</span>{" "}
                      {c.caption ?? c.filename}
                    </p>
                    <CodeWindow spec={c} theme={theme} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* ══════════ 트러블슈팅 ══════════ */}
          {data.challenges.length > 0 ? (
            <section className="reveal space-y-12">
              <div className="section-label">Troubleshooting</div>

              <div className="stagger-children grid grid-cols-1 gap-8 lg:grid-cols-2">
                {data.challenges.map(c => (
                  <div
                    className="reveal flex flex-col overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]"
                    key={c.title}
                  >
                    <div className="border-b border-red-500/20 bg-red-500/10 p-6">
                      <h5 className="mono mb-2 text-[10px] uppercase tracking-widest text-red-500">
                        [PROBLEM]
                      </h5>
                      <p className="font-bold text-gray-200">{c.title}</p>
                    </div>
                    <div className="flex-grow space-y-4 p-6">
                      <p className="text-sm leading-relaxed text-gray-400">
                        {c.problem}
                      </p>
                      <div className="flex items-center gap-2 text-accent">
                        <Icon className="h-4 w-4" name="arrowRight" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Solution
                        </span>
                      </div>
                      <p className="rounded border-l-2 border-accent bg-accent/5 p-4 text-sm leading-relaxed text-gray-200">
                        {c.solution}
                      </p>
                      {c.code ? (
                        <CodeWindow spec={c.code} theme={theme} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <Shot
                big
                className="w-full rounded-xl"
                iconName="chart"
                ratio="21/9"
                spec={{label: "개선 결과 화면", ratio: "21/9"}}
                theme={theme}
              />
            </section>
          ) : null}

          {/* ══════════ 결과 & 회고 ══════════ */}
          <section className="reveal space-y-12 md:space-y-16">
            <div className="section-label">Results &amp; Retrospective</div>

            {/* 지표 */}
            <div className="stagger-children grid grid-cols-2 gap-6 lg:grid-cols-4">
              {data.metrics.map(m => (
                <div className="stat-tile reveal" key={m.l}>
                  <div className="mono mb-1 text-[10px] uppercase tracking-widest text-muted">
                    {m.l}
                  </div>
                  <CountUp
                    className="mono block text-3xl font-black text-accent md:text-4xl"
                    value={m.n}
                  />
                </div>
              ))}
            </div>

            {/* 결과 스크린샷 */}
            {data.gallery && data.gallery.length > 0 ? (
              <div className="stagger-children grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.gallery.map(g => (
                  <div className="reveal" key={g.label}>
                    <Shot
                      className="w-full"
                      ratio={g.ratio ?? "16/10"}
                      spec={g}
                      theme={theme}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {/* KPT */}
            <div className="stagger-children grid grid-cols-1 gap-8 md:grid-cols-3">
              {(
                [
                  ["Keep", "text-green-500", "check", data.kpt.keep],
                  ["Problem", "text-red-500", "x", data.kpt.problem],
                  ["Try", "text-blue-500", "rocket", data.kpt.try]
                ] as const
              ).map(([label, color, icon, items]) => (
                <div
                  className="reveal rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6"
                  key={label}
                >
                  <h6
                    className={`mono mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${color}`}
                  >
                    <Icon className="h-4 w-4" name={icon} /> {label}
                  </h6>
                  <ul className="space-y-3 text-sm leading-relaxed text-gray-400">
                    {items.map(it => (
                      <li key={it}>• {it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* 핵심 배움 */}
            <div className="reveal-scale space-y-4 rounded-2xl border border-accent/20 bg-accent/10 p-8 text-center md:p-12">
              <div className="mono mb-2 text-xs uppercase tracking-widest text-accent">
                The Core Takeaway
              </div>
              <p className="text-lg font-light leading-snug md:text-2xl lg:text-3xl">
                {data.learning}
              </p>
            </div>
          </section>
        </main>

        {/* ══════════ 푸터 ══════════ */}
        <footer className="mt-24 border-t border-[#1a1a1a] bg-[#050505] py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="text-sm font-bold tracking-tight">
                {project.title}
              </div>
              <p className="mono text-xs uppercase tracking-widest text-[#444]">
                Fullstack Developer: Sam Kim
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span className="mono flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#444]">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                System Operational: 100%
              </span>
              {onNext ? (
                <button
                  className="mono rounded-lg border border-[#1a1a1a] px-6 py-3 text-xs font-bold text-gray-400 transition-colors hover:border-accent hover:text-white"
                  onClick={onNext}
                  type="button"
                >
                  다음 프로젝트 →
                </button>
              ) : null}
              <button
                className="text-xs text-gray-500 underline underline-offset-4 transition-colors hover:text-accent"
                onClick={() =>
                  scrollRef.current?.scrollTo({top: 0, behavior: "smooth"})
                }
                type="button"
              >
                Top of Page
              </button>
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
