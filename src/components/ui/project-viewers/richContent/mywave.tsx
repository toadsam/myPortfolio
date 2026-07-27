"use client";

import {motion} from "framer-motion";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";

// ════════════════════════════════════════════════════════════════════════════
//  공통 프레젠테이션 컴포넌트
// ════════════════════════════════════════════════════════════════════════════

// ─── 코드 하이라이터 ──────────────────────────────────────────────────────────

function CodeLine({line, theme}: {line: string; theme: ProjectTheme}) {
  const segs: {text: string; color?: string}[] = [];
  const re =
    /(\/\/.*)|(`[^`]*`|"[^"]*"|'[^']*')|\b(const|let|function|return|import|from|export|interface|type|if|else|async|await|new|map|filter|reduce|useMemo|useState|useEffect|useRef)\b|\b(\d+\.?\d*)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) segs.push({text: line.slice(last, m.index)});
    let color: string | undefined;
    if (m[1]) color = "#5e8c6a";
    else if (m[2]) color = "#d9a45b";
    else if (m[3]) color = theme.primary;
    else if (m[4]) color = "#b58cf0";
    segs.push({text: m[0], color});
    last = re.lastIndex;
  }
  if (last < line.length) segs.push({text: line.slice(last)});
  return (
    <>
      {segs.map((s, i) => (
        <span key={i} style={s.color ? {color: s.color} : undefined}>
          {s.text}
        </span>
      ))}
    </>
  );
}

function CodeBlock({
  filename,
  lines,
  theme,
  caption,
  highlightLines = []
}: {
  filename: string;
  lines: string[];
  theme: ProjectTheme;
  caption?: string;
  highlightLines?: number[];
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}25`, background: "#070d12"}}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{
          borderColor: `${theme.primary}18`,
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-mono text-[11px] font-bold text-white/45">
          {filename}
        </span>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        <pre className="font-mono text-[12px] leading-[1.7]">
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex"
              style={
                highlightLines.includes(i + 1)
                  ? {
                      background: `${theme.primary}12`,
                      marginInline: -16,
                      paddingInline: 16
                    }
                  : undefined
              }
            >
              <span
                className="mr-4 select-none text-right text-white/20"
                style={{minWidth: 18}}
              >
                {i + 1}
              </span>
              <code className="text-white/85">
                <CodeLine line={line} theme={theme} />
              </code>
            </div>
          ))}
        </pre>
      </div>
      {caption ? (
        <div
          className="border-t px-4 py-2 font-mono text-[11px] text-white/40"
          style={{borderColor: `${theme.primary}15`}}
        >
          {"// "}
          {caption}
        </div>
      ) : null}
    </div>
  );
}

// ─── 앱 화면 목업 (variant별) ─────────────────────────────────────────────────

function ScreenFrame({
  title,
  theme,
  children
}: {
  title: string;
  theme: ProjectTheme;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}25`, background: "#06100c"}}
    >
      <div
        className="flex items-center gap-2 border-b px-3 py-2"
        style={{
          borderColor: `${theme.primary}18`,
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
        <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
        <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
        <div className="ml-2 flex-1 rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/35">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function AreaSvg({theme, pts}: {theme: ProjectTheme; pts: number[]}) {
  const max = Math.max(...pts) * 1.1;
  const w = 320;
  const h = 80;
  const line = pts
    .map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / max) * h}`)
    .join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `ar-${theme.primary.replace("#", "")}-${pts.length}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{height: 72}}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.35" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={area}
        fill={`url(#${gid})`}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.8, delay: 0.3}}
      />
      <motion.polyline
        points={line}
        fill="none"
        stroke={theme.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{pathLength: 0}}
        animate={{pathLength: 1}}
        transition={{duration: 1.1, ease: "easeOut"}}
      />
    </svg>
  );
}

function MockScreen({
  variant,
  theme
}: {
  variant: "dashboard" | "flow" | "goals" | "report";
  theme: ProjectTheme;
}) {
  if (variant === "dashboard") {
    return (
      <ScreenFrame title="mywave.app/dashboard" theme={theme}>
        <div className="flex">
          <div
            className="hidden w-24 shrink-0 flex-col gap-1 border-r p-2.5 sm:flex"
            style={{borderColor: `${theme.primary}12`}}
          >
            <div
              className="mb-1.5 font-mono text-[11px] font-black"
              style={{color: theme.primary}}
            >
              ◈ MyWave
            </div>
            {["대시보드", "흐름", "목표", "리포트"].map((m, i) => (
              <div
                key={m}
                className="rounded px-1.5 py-1 font-mono text-[9px] font-bold"
                style={
                  i === 0
                    ? {background: `${theme.primary}1a`, color: theme.primary}
                    : {color: "rgba(255,255,255,0.4)"}
                }
              >
                {m}
              </div>
            ))}
          </div>
          <div className="flex-1 p-3">
            <div className="mb-2 grid grid-cols-3 gap-1.5">
              {[
                {l: "총 자산", v: "₩12.4M"},
                {l: "이번 달", v: "+8.2%"},
                {l: "목표", v: "64%"}
              ].map(k => (
                <div
                  key={k.l}
                  className="rounded-lg border p-2"
                  style={{borderColor: `${theme.primary}1a`}}
                >
                  <p className="font-mono text-[8px] uppercase text-white/35">
                    {k.l}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-black text-white">
                    {k.v}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="rounded-lg border p-2.5"
              style={{borderColor: `${theme.primary}1a`}}
            >
              <p className="mb-1 font-mono text-[9px] font-bold text-white/45">
                이번 달 자산 흐름
              </p>
              <AreaSvg
                theme={theme}
                pts={[12, 18, 15, 26, 22, 34, 30, 42, 48, 44, 58, 64]}
              />
            </div>
          </div>
        </div>
      </ScreenFrame>
    );
  }
  if (variant === "flow") {
    return (
      <ScreenFrame title="mywave.app/flow" theme={theme}>
        <div className="p-3">
          <p className="mb-2 font-mono text-[10px] font-bold text-white/45">
            소비 카테고리 흐름
          </p>
          {[
            {l: "고정지출", p: 72, v: "₩1.8M"},
            {l: "식비", p: 48, v: "₩620K"},
            {l: "여가", p: 30, v: "₩340K"},
            {l: "투자", p: 90, v: "₩2.1M"}
          ].map((c, i) => (
            <div key={c.l} className="mb-2">
              <div className="flex justify-between font-mono text-[10px] text-white/55">
                <span>{c.l}</span>
                <span>{c.v}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full"
                  style={{background: theme.primary}}
                  initial={{width: 0}}
                  animate={{width: `${c.p}%`}}
                  transition={{duration: 0.8, delay: i * 0.1}}
                />
              </div>
            </div>
          ))}
        </div>
      </ScreenFrame>
    );
  }
  if (variant === "goals") {
    return (
      <ScreenFrame title="mywave.app/goals" theme={theme}>
        <div className="grid grid-cols-2 gap-2 p-3">
          {[
            {l: "비상금", p: 80, t: "₩5M"},
            {l: "여행", p: 45, t: "₩3M"},
            {l: "노트북", p: 100, t: "₩2M"},
            {l: "투자 시드", p: 62, t: "₩10M"}
          ].map((g, i) => (
            <div
              key={g.l}
              className="rounded-lg border p-2.5"
              style={{borderColor: `${theme.primary}1a`}}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold text-white/70">
                  {g.l}
                </p>
                <span
                  className="font-mono text-[10px] font-black"
                  style={{color: g.p >= 100 ? theme.primary : theme.accent}}
                >
                  {g.p}%
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[8px] text-white/35">
                목표 {g.t}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full"
                  style={{background: theme.primary}}
                  initial={{width: 0}}
                  animate={{width: `${g.p}%`}}
                  transition={{duration: 0.8, delay: i * 0.08}}
                />
              </div>
            </div>
          ))}
        </div>
      </ScreenFrame>
    );
  }
  // report
  return (
    <ScreenFrame title="mywave.app/report" theme={theme}>
      <div className="p-3">
        <p className="mb-2 font-mono text-[10px] font-bold text-white/45">
          월간 리포트 · 6월
        </p>
        <div
          className="mb-2 rounded-lg border p-2.5"
          style={{borderColor: `${theme.primary}1a`}}
        >
          <AreaSvg
            theme={theme}
            pts={[20, 28, 24, 38, 34, 30, 46, 52, 60, 66]}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            "저축률 28% ↑",
            "충동소비 31% ↓",
            "투자 비중 42%",
            "목표 3개 달성"
          ].map(s => (
            <div
              key={s}
              className="rounded border px-2 py-1.5 font-mono text-[9px] text-white/65"
              style={{borderColor: `${theme.primary}18`}}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

// ─── 아키텍처 다이어그램 ──────────────────────────────────────────────────────

function ArchDiagram({theme}: {theme: ProjectTheme}) {
  const layers = [
    {name: "UI Layer", desc: "React 컴포넌트 · 대시보드/차트/폼", tag: "View"},
    {
      name: "State",
      desc: "Zustand store · 거래·목표·필터 전역 상태",
      tag: "Store"
    },
    {
      name: "Domain Logic",
      desc: "useCashFlow · goalProgress · 통화 정규화",
      tag: "Hooks"
    },
    {name: "Data Source", desc: "REST API ↔ localStorage 캐시", tag: "I/O"}
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {layers.map((l, i) => (
        <div key={l.name}>
          <motion.div
            className="flex items-center gap-3 rounded-lg border px-4 py-3"
            style={{
              borderColor: `${theme.primary}25`,
              background: `${theme.primary}08`
            }}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: i * 0.1}}
          >
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
              style={{background: `${theme.primary}20`, color: theme.primary}}
            >
              {l.tag}
            </span>
            <div>
              <p className="font-mono text-sm font-black text-white">
                {l.name}
              </p>
              <p className="font-mono text-[11px] text-white/45">{l.desc}</p>
            </div>
          </motion.div>
          {i < layers.length - 1 ? (
            <div
              className="my-0.5 text-center font-mono text-xs"
              style={{color: `${theme.primary}88`}}
            >
              ↓
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ─── 기술 결정 테이블 ─────────────────────────────────────────────────────────

function DecisionTable({theme}: {theme: ProjectTheme}) {
  const rows = [
    {
      area: "차트",
      pick: "Recharts",
      why: "선언적 API로 빠른 구현, SVG 기반 커스터마이즈",
      alt: "visx(러닝커브 ↑), D3(과한 복잡도)"
    },
    {
      area: "상태관리",
      pick: "Zustand",
      why: "보일러플레이트 최소, 선택적 구독으로 리렌더 최소화",
      alt: "Redux(무거움), Context(전역 리렌더)"
    },
    {
      area: "스타일",
      pick: "Tailwind",
      why: "반응형을 빠르게, 디자인 일관성 유지",
      alt: "CSS Modules, styled-components"
    },
    {
      area: "데이터",
      pick: "API + localStorage",
      why: "MVP는 로컬로 빠르게, 이후 API 전환 용이하게 추상화",
      alt: "처음부터 풀백엔드(속도 ↓)"
    }
  ];
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}22`}}
    >
      <div
        className="grid grid-cols-[64px_88px_1fr] gap-2 border-b px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-white/35"
        style={{
          borderColor: `${theme.primary}18`,
          background: `${theme.primary}08`
        }}
      >
        <span>영역</span>
        <span>선택</span>
        <span>이유 / 고려한 대안</span>
      </div>
      {rows.map((r, i) => (
        <motion.div
          key={r.area}
          className="grid grid-cols-[64px_88px_1fr] gap-2 border-b px-3 py-2.5 last:border-0"
          style={{borderColor: `${theme.primary}10`}}
          initial={{opacity: 0, x: -10}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: i * 0.08}}
        >
          <span className="font-mono text-[11px] font-bold text-white/55">
            {r.area}
          </span>
          <span
            className="font-mono text-[11px] font-black"
            style={{color: theme.primary}}
          >
            {r.pick}
          </span>
          <span className="text-[11px] leading-5 text-white/70">
            {r.why}
            <span className="mt-0.5 block text-white/35">↔ {r.alt}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Challenge → Solution 카드 ────────────────────────────────────────────────

function ChallengeCard({
  theme,
  index,
  title,
  problem,
  solution,
  code
}: {
  theme: ProjectTheme;
  index: number;
  title: string;
  problem: string;
  solution: string;
  code?: {
    filename: string;
    lines: string[];
    caption?: string;
    highlightLines?: number[];
  };
}) {
  return (
    <motion.div
      className="rounded-xl border p-4"
      style={{borderColor: `${theme.primary}22`}}
      initial={{opacity: 0, y: 14}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4}}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-black"
          style={{background: `${theme.primary}1a`, color: theme.primary}}
        >
          {String(index).padStart(2, "0")}
        </span>
        <p className="font-mono text-sm font-black text-white">{title}</p>
      </div>
      <div className="mb-1 flex gap-2">
        <span className="shrink-0 font-mono text-[11px] font-black text-[#f87171]">
          문제
        </span>
        <p className="text-[13px] leading-6 text-white/70">{problem}</p>
      </div>
      <div className="mb-3 flex gap-2">
        <span
          className="shrink-0 font-mono text-[11px] font-black"
          style={{color: theme.primary}}
        >
          해결
        </span>
        <p className="text-[13px] leading-6 text-white/80">{solution}</p>
      </div>
      {code ? (
        <CodeBlock
          theme={theme}
          filename={code.filename}
          lines={code.lines}
          caption={code.caption}
          highlightLines={code.highlightLines}
        />
      ) : null}
    </motion.div>
  );
}

// ─── 소품 ─────────────────────────────────────────────────────────────────────

function MetaRow({
  label,
  value,
  theme
}: {
  label: string;
  value: string;
  theme: ProjectTheme;
}) {
  return (
    <div
      className="flex gap-3 border-b py-2 last:border-0"
      style={{borderColor: `${theme.primary}12`}}
    >
      <span className="w-14 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wide text-white/35">
        {label}
      </span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}

function SubLabel({
  children,
  theme
}: {
  children: React.ReactNode;
  theme: ProjectTheme;
}) {
  return (
    <p
      className="mb-3 mt-1 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
      style={{color: theme.primary}}
    >
      {">"} {children}
    </p>
  );
}

function QuoteCard({
  theme,
  quote,
  who
}: {
  theme: ProjectTheme;
  quote: string;
  who: string;
}) {
  return (
    <div
      className="rounded-lg border-l-2 px-4 py-3"
      style={{borderColor: theme.primary, background: `${theme.primary}08`}}
    >
      <p className="text-sm leading-7 text-white/80">“{quote}”</p>
      <p className="mt-1 font-mono text-[11px] text-white/40">— {who}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/8" />;
}

// ─── 리크루터 TL;DR 배너 ──────────────────────────────────────────────────────

function TldrBanner({theme}: {theme: ProjectTheme}) {
  const rows = [
    {
      k: "무엇을",
      v: "소비·투자를 하나의 ‘흐름’으로 보는 개인 자산 관리 웹앱 (컨셉/설계)"
    },
    {k: "왜", v: "기존 앱은 거래를 나열만 함 → 누적 흐름 + 목표선으로 재해석"},
    {
      k: "결과",
      v: "거래를 누적 흐름 + 목표선으로 보여주는 대시보드 UX 설계·구현"
    },
    {k: "내 역할", v: "기획 · UX 설계 · 프론트엔드 전체 (1인 프로젝트)"}
  ];
  return (
    <motion.div
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: `${theme.primary}40`,
        background: `${theme.primary}0a`
      }}
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.45}}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{borderColor: `${theme.primary}20`}}
      >
        <span
          className="font-mono text-[10px] font-black uppercase tracking-[0.25em]"
          style={{color: theme.primary}}
        >
          ★ TL;DR · 30초 요약
        </span>
      </div>
      <div className="p-4">
        {rows.map(r => (
          <div key={r.k} className="flex gap-3 py-1.5">
            <span
              className="w-14 shrink-0 font-mono text-[11px] font-black"
              style={{color: theme.accent}}
            >
              {r.k}
            </span>
            <span className="text-[13px] leading-6 text-white/80">{r.v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── 데모 / 라이브 CTA ────────────────────────────────────────────────────────

function DemoCTA({theme}: {theme: ProjectTheme}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
      {/* 영상 프레임 (placeholder) */}
      <motion.div
        className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border"
        style={{borderColor: `${theme.primary}30`, background: "#06100c"}}
        initial={{opacity: 0, scale: 0.97}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.5}}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(${theme.primary}20, transparent 70%)`
          }}
        />
        <motion.div
          className="relative flex h-14 w-14 items-center justify-center rounded-full"
          style={{background: theme.primary}}
          animate={{
            boxShadow: [
              `0 0 0 0 ${theme.primary}55`,
              `0 0 0 16px ${theme.primary}00`
            ]
          }}
          transition={{duration: 1.8, repeat: Infinity}}
        >
          <span className="ml-1 text-xl" style={{color: theme.bg}}>
            ▶
          </span>
        </motion.div>
        <span className="absolute bottom-3 left-3 font-mono text-[11px] font-bold text-white/50">
          데모 영상 · 0:48
        </span>
      </motion.div>
      {/* 링크 버튼 */}
      <div className="flex flex-col justify-center gap-2.5">
        <a
          className="flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-black transition hover:bg-white/5"
          style={{borderColor: `${theme.primary}40`, color: theme.primary}}
          href="#"
          onClick={e => e.preventDefault()}
        >
          🔗 라이브 데모 <span>↗</span>
        </a>
        <a
          className="flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-black transition hover:bg-white/5"
          style={{borderColor: `${theme.primary}25`, color: theme.accent}}
          href="#"
          onClick={e => e.preventDefault()}
        >
          ▶ 풀 영상 (YouTube) <span>↗</span>
        </a>
        <a
          className="flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-black transition hover:bg-white/5"
          style={{borderColor: `${theme.primary}25`, color: theme.accent}}
          href="#"
          onClick={e => e.preventDefault()}
        >
          ⌥ GitHub 저장소 <span>↗</span>
        </a>
      </div>
    </div>
  );
}

// ─── Before → After 비교 ──────────────────────────────────────────────────────

function BeforeAfter({
  theme,
  before,
  after
}: {
  theme: ProjectTheme;
  before: {label: string; body: React.ReactNode};
  after: {label: string; body: React.ReactNode};
}) {
  return (
    <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_28px_1fr]">
      <div
        className="rounded-xl border p-4"
        style={{borderColor: "#f8717133", background: "#f871710a"}}
      >
        <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide text-[#f87171]">
          Before · {before.label}
        </p>
        {before.body}
      </div>
      <div
        className="flex items-center justify-center font-mono text-lg font-black"
        style={{color: theme.primary}}
      >
        →
      </div>
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: `${theme.primary}40`,
          background: `${theme.primary}0a`
        }}
      >
        <p
          className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide"
          style={{color: theme.primary}}
        >
          After · {after.label}
        </p>
        {after.body}
      </div>
    </div>
  );
}

// ─── before/after 비교 바 (성능·결과 공용) ────────────────────────────────────

function CompareBars({
  theme,
  rows,
  lowerBetter
}: {
  theme: ProjectTheme;
  rows: {label: string; before: number; after: number; unit: string}[];
  lowerBetter: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r, i) => {
        const peak = Math.max(r.before, r.after);
        const beforeW = (r.before / peak) * 100;
        const afterW = (r.after / peak) * 100;
        const delta = lowerBetter
          ? Math.round((1 - r.after / r.before) * 100)
          : Math.round((r.after / r.before - 1) * 100);
        return (
          <div key={r.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-white/70">
                {r.label}
              </span>
              <span
                className="font-mono text-[11px] font-black"
                style={{color: theme.primary}}
              >
                {delta >= 0 ? "+" : ""}
                {delta}% {lowerBetter ? "↓" : "↑"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-right font-mono text-[10px] text-white/35">
                {r.before}
                {r.unit}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className="h-full rounded-full bg-white/25"
                  initial={{width: 0}}
                  animate={{width: `${beforeW}%`}}
                  transition={{duration: 0.7, delay: i * 0.1}}
                />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="w-16 shrink-0 text-right font-mono text-[10px] font-black"
                style={{color: theme.primary}}
              >
                {r.after}
                {r.unit}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className="h-full rounded-full"
                  style={{background: theme.primary}}
                  initial={{width: 0}}
                  animate={{width: `${afterW}%`}}
                  transition={{duration: 0.7, delay: 0.15 + i * 0.1}}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 프로세스 타임라인 ────────────────────────────────────────────────────────

function ProcessTimeline({theme}: {theme: ProjectTheme}) {
  const steps = [
    {t: "리서치", d: "03월"},
    {t: "IA·기획", d: "03월"},
    {t: "프로토타입", d: "04월"},
    {t: "개발", d: "04–05월"},
    {t: "테스트", d: "05월"},
    {t: "배포", d: "06월"}
  ];
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <div key={s.t} className="flex items-center">
          <motion.div
            className="flex flex-col items-center rounded-lg border px-3 py-2"
            style={{
              borderColor: `${theme.primary}25`,
              background: `${theme.primary}08`
            }}
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: i * 0.08}}
          >
            <span className="font-mono text-[12px] font-black text-white">
              {s.t}
            </span>
            <span className="font-mono text-[9px] text-white/40">{s.d}</span>
          </motion.div>
          {i < steps.length - 1 ? (
            <span
              className="mx-1 font-mono text-xs"
              style={{color: `${theme.primary}88`}}
            >
              →
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MyWave 리치 섹션
// ════════════════════════════════════════════════════════════════════════════

export function MyWaveRichSection({
  step,
  project,
  theme
}: {
  step: number;
  project: ProjectData;
  theme: ProjectTheme;
}) {
  // ── 개요 ──
  if (step === 0) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div>
          <p
            className="font-mono text-xs font-black uppercase tracking-[0.3em]"
            style={{color: theme.primary}}
          >
            {">"} PERSONAL FINANCE · WEB APP
          </p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white">
            {project.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
            소비와 투자를 따로 보지 않고, 하나의{" "}
            <span style={{color: theme.primary}}>‘돈의 흐름’</span>으로 읽는
            개인 자산 관리 웹앱. 거래 내역을 누적 흐름으로 시각화하고, 목표 대비
            현재 위치를 한 장의 차트로 보여준다.
          </p>
        </div>

        <TldrBanner theme={theme} />

        <div>
          <SubLabel theme={theme}>데모 · 직접 확인</SubLabel>
          <DemoCTA theme={theme} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="rounded-xl border p-4"
            style={{borderColor: `${theme.primary}22`}}
          >
            <MetaRow
              label="기간"
              value="[확인필요] 개인 프로젝트"
              theme={theme}
            />
            <MetaRow
              label="팀"
              value="개인 프로젝트 (기획·디자인·개발 1인)"
              theme={theme}
            />
            <MetaRow
              label="역할"
              value="서비스 기획 · UX 설계 · 프론트엔드 전체"
              theme={theme}
            />
            <MetaRow
              label="스택"
              value="React · TypeScript · Recharts · Zustand · Tailwind"
              theme={theme}
            />
            <MetaRow
              label="성격"
              value="개인 컨셉·설계 프로젝트 (공개 리포 없음)"
              theme={theme}
            />
          </div>
          <MockScreen variant="dashboard" theme={theme} />
        </div>

        <div>
          <SubLabel theme={theme}>한 줄 임팩트</SubLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              {n: "4", l: "핵심 화면(대시보드·흐름·목표·리포트)"},
              {n: "1인", l: "기획·UX·프론트"},
              {n: "흐름+목표선", l: "핵심 UX 컨셉"}
            ].map(s => (
              <div
                key={s.l}
                className="rounded-xl border p-3 text-center"
                style={{borderColor: `${theme.primary}22`}}
              >
                <p
                  className="font-mono text-2xl font-black"
                  style={{color: theme.primary}}
                >
                  {s.n}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-white/50">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SubLabel theme={theme}>핵심 기능</SubLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                t: "자산 흐름 시각화",
                d: "거래를 누적 area 차트로 — 흐름과 목표선을 한 화면에"
              },
              {t: "목표 기반 저축", d: "목표별 진행률·남은 금액 자동 계산"},
              {t: "소비 패턴 분석", d: "카테고리별 비중과 변화 추이"},
              {t: "월간 리포트", d: "저축률·투자 비중을 월 단위로 요약"}
            ].map(f => (
              <div
                key={f.t}
                className="rounded-lg border p-3"
                style={{borderColor: `${theme.primary}1a`}}
              >
                <p
                  className="font-mono text-sm font-black"
                  style={{color: theme.accent}}
                >
                  {f.t}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-white/55">
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 문제 ──
  if (step === 1) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div>
          <SubLabel theme={theme}>PROBLEM · 무엇이 문제였나</SubLabel>
          <p className="text-base leading-8 text-white/85">
            기존 가계부·금융 앱은 거래 내역을{" "}
            <strong className="text-white">단순 표로 나열</strong>한다. 숫자는
            많지만 정작 “내 돈이 어디로 흘러가는지”, “목표까지 얼마나 왔는지”는
            한눈에 보이지 않았다.
          </p>
        </div>

        <div>
          <SubLabel theme={theme}>문제 정의 · 관찰</SubLabel>
          <div className="flex flex-col gap-2.5">
            <QuoteCard
              theme={theme}
              quote="가계부는 쓰는데, 막상 이번 달에 내가 잘 하고 있는 건지 한눈에 안 보인다."
              who="직접 겪은 불편"
            />
            <QuoteCard
              theme={theme}
              quote="투자와 소비가 다른 앱에 흩어져 있어 전체 그림이 안 그려진다."
              who="문제 정의"
            />
          </div>
        </div>

        <Divider />

        <div>
          <SubLabel theme={theme}>기존 방식의 한계 (Before)</SubLabel>
          <CodeBlock
            theme={theme}
            filename="LegacyLedger.tsx"
            caption="거래를 그냥 나열만 함 — 누적 흐름도, 목표 대비 위치도 안 보인다"
            lines={[
              "// 기존: 거래를 시간 역순 테이블로만 출력",
              "function Ledger({ transactions }: Props) {",
              "  return (",
              "    <table>",
              "      {transactions.map((tx) => (",
              "        <tr key={tx.id}>",
              "          <td>{tx.date}</td>",
              "          <td>{tx.title}</td>",
              "          <td>{tx.amount}</td>",
              "        </tr>",
              "      ))}",
              "    </table>",
              "  );",
              "}"
            ]}
          />
        </div>

        <div>
          <SubLabel theme={theme}>핵심 전환 · Before → After</SubLabel>
          <BeforeAfter
            theme={theme}
            before={{
              label: "거래 나열",
              body: (
                <div className="space-y-1">
                  {[
                    "06.21  스타벅스   -5,800",
                    "06.20  급여     +2,400,000",
                    "06.19  쿠팡     -32,100"
                  ].map(r => (
                    <p key={r} className="font-mono text-[11px] text-white/45">
                      {r}
                    </p>
                  ))}
                  <p className="pt-1 font-mono text-[10px] text-[#f87171]">
                    흐름·맥락 안 보임
                  </p>
                </div>
              )
            }}
            after={{
              label: "흐름 + 목표선",
              body: (
                <div>
                  <AreaSvg
                    theme={theme}
                    pts={[10, 16, 14, 24, 20, 30, 28, 38, 44]}
                  />
                  <p
                    className="pt-1 font-mono text-[10px]"
                    style={{color: theme.primary}}
                  >
                    한눈에 ‘지금 위치’가 보임
                  </p>
                </div>
              )
            }}
          />
        </div>

        <div>
          <SubLabel theme={theme}>가설</SubLabel>
          <div
            className="rounded-xl border-l-2 p-4"
            style={{
              borderColor: theme.primary,
              background: `${theme.primary}08`
            }}
          >
            <p className="text-sm leading-7 text-white/80">
              “거래를 <strong className="text-white">누적 흐름 + 목표선</strong>
              으로 바꿔 보여주면, 사용자가 자신의 재정 상태를
              <strong className="text-white"> 즉시 직관적으로</strong> 이해할
              것이다.”
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 접근 ──
  if (step === 2) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div>
          <SubLabel theme={theme}>PROCESS · 진행 과정</SubLabel>
          <ProcessTimeline theme={theme} />
        </div>

        <div>
          <SubLabel theme={theme}>ARCHITECTURE · 레이어 구조</SubLabel>
          <ArchDiagram theme={theme} />
        </div>

        <Divider />

        <div>
          <SubLabel theme={theme}>기술 의사결정 · 왜 이걸 골랐나</SubLabel>
          <DecisionTable theme={theme} />
        </div>

        <Divider />

        <div>
          <SubLabel theme={theme}>핵심 구현 · 흐름으로 바꾸기</SubLabel>
          <p className="mb-3 text-sm leading-7 text-white/70">
            거래 ‘목록’을 <strong className="text-white">일별 누적 흐름</strong>
            으로 변환하고, 그 위에 목표선을 겹쳐 “지금 어디쯤인지”를 한 장의
            차트로 보여주도록 설계했다.
          </p>
          <div className="flex flex-col gap-3">
            <CodeBlock
              theme={theme}
              filename="useCashFlow.ts"
              caption="거래 배열 → 일별 누적 잔액 시계열로 변환"
              highlightLines={[7, 8, 9]}
              lines={[
                "// 거래 목록을 누적 흐름(시계열)으로 가공하는 훅",
                "export function useCashFlow(txns: Transaction[]) {",
                "  return useMemo(() => {",
                "    let running = 0;",
                "    return txns",
                "      .sort((a, b) => a.date - b.date)",
                "      .map((tx) => {",
                "        running += normalizeToKRW(tx);",
                "        return { date: tx.date, balance: running };",
                "      });",
                "  }, [txns]);",
                "}"
              ]}
            />
            <CodeBlock
              theme={theme}
              filename="FlowChart.tsx"
              caption="누적 흐름 위에 목표선을 겹쳐 ‘현재 위치’를 시각화"
              lines={[
                "<AreaChart data={flow}>",
                "  <defs>",
                "    <linearGradient id='wave'>",
                "      <stop offset='0%' stopColor={accent} stopOpacity={0.4} />",
                "      <stop offset='100%' stopOpacity={0} />",
                "    </linearGradient>",
                "  </defs>",
                "  <Area dataKey='balance' stroke={accent} fill='url(#wave)' />",
                "  <ReferenceLine y={goal} label='목표' strokeDasharray='4 4' />",
                "</AreaChart>"
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── 기여 ──
  if (step === 3) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div>
          <SubLabel theme={theme}>WORK · 직접 만든 것</SubLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                g: "기획·UX",
                items: [
                  "문제 정의와 핵심 UX 컨셉 도출",
                  "정보 구조(IA)와 화면 흐름 설계"
                ]
              },
              {
                g: "프론트엔드",
                items: ["흐름 차트·목표·리포트 화면 구현", "반응형 + PWA 대응"]
              },
              {
                g: "데이터",
                items: ["거래→흐름 변환 로직", "Zustand 전역 상태 설계"]
              },
              {
                g: "성능",
                items: ["차트 리렌더 최적화", "수천 건 거래 집계 처리"]
              }
            ].map(group => (
              <div
                key={group.g}
                className="rounded-lg border p-3"
                style={{borderColor: `${theme.primary}1a`}}
              >
                <p
                  className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide"
                  style={{color: theme.primary}}
                >
                  {group.g}
                </p>
                {group.items.map(it => (
                  <div key={it} className="mb-1 flex items-start gap-2">
                    <span
                      className="mt-0.5 font-mono text-xs"
                      style={{color: theme.accent}}
                    >
                      ✓
                    </span>
                    <span className="text-[12px] leading-5 text-white/70">
                      {it}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <SubLabel theme={theme}>가장 어려웠던 문제 · Challenge</SubLabel>
          <div className="flex flex-col gap-3">
            <ChallengeCard
              theme={theme}
              index={1}
              title="실시간 갱신마다 차트가 깜빡였다"
              problem="거래가 추가될 때 차트 데이터 배열이 매번 새 참조로 만들어져, Recharts가 전체를 리마운트하며 애니메이션이 끊기고 깜빡였다."
              solution="흐름 데이터를 useMemo로 안정화하고, 차트의 key를 데이터 길이가 아닌 의미 단위로 고정해 불필요한 리마운트를 제거했다."
              code={{
                filename: "useStableFlow.ts",
                caption: "참조 안정화로 리마운트 제거 → 부드러운 갱신",
                highlightLines: [4],
                lines: [
                  "const flow = useCashFlow(txns);",
                  "// 길이가 같으면 동일 참조 유지 → 차트 리마운트 방지",
                  "const stable = useMemo(() => flow, [flow.length, flow.at(-1)?.balance]);",
                  "return <FlowChart data={stable} key='cashflow' />;"
                ]
              }}
            />
            <ChallengeCard
              theme={theme}
              index={2}
              title="통화가 섞인 거래의 합산"
              problem="해외 결제 등으로 거래 통화가 섞여 있어 단순 합산 시 금액이 왜곡됐다."
              solution="거래 ‘시점’의 환율로 KRW에 정규화한 뒤 누적했다. 환율은 거래에 스냅샷으로 저장해 과거 값이 흔들리지 않게 했다."
              code={{
                filename: "currency.ts",
                caption: "거래 시점 환율로 KRW 정규화 (스냅샷 보존)",
                lines: [
                  "export function normalizeToKRW(tx: Transaction) {",
                  "  if (tx.currency === 'KRW') return tx.amount;",
                  "  // 거래 당시 환율 스냅샷 사용 (현재 환율 X)",
                  "  return Math.round(tx.amount * tx.rateAtTime);",
                  "}"
                ]
              }}
            />
          </div>
        </div>

        <div>
          <SubLabel theme={theme}>사용 기술</SubLabel>
          <div className="flex flex-wrap gap-2">
            {[
              "React",
              "TypeScript",
              "Recharts",
              "Zustand",
              "TailwindCSS",
              "Vite",
              "PWA"
            ].map(t => (
              <span
                key={t}
                className="rounded-lg border px-3 py-1.5 font-mono text-sm font-bold"
                style={{borderColor: `${theme.primary}35`, color: theme.accent}}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 결과 ──
  return (
    <div className="flex flex-col gap-6 py-2">
      <div>
        <SubLabel theme={theme}>RESULT · 완성된 화면</SubLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <MockScreen variant="dashboard" theme={theme} />
          <MockScreen variant="flow" theme={theme} />
          <MockScreen variant="goals" theme={theme} />
          <MockScreen variant="report" theme={theme} />
        </div>
      </div>

      <div>
        <SubLabel theme={theme}>정리 · 무엇을 만들었나</SubLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {n: "4", l: "핵심 화면"},
            {n: "흐름+목표선", l: "핵심 UX 컨셉"},
            {n: "1인", l: "기획·UX·프론트"},
            {n: "React·Recharts", l: "구현 스택"}
          ].map(m => (
            <div
              key={m.l}
              className="rounded-xl border p-4"
              style={{borderColor: `${theme.primary}22`}}
            >
              <p
                className="font-mono text-lg font-black"
                style={{color: theme.primary}}
              >
                {m.n}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-white/50">{m.l}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <div>
        <SubLabel theme={theme}>회고 · KPT</SubLabel>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              k: "Keep",
              c: theme.primary,
              items: [
                "문제→가설→UX 컨셉으로 이어지는 설계 흐름",
                "데이터를 ‘흐름·목표’ 맥락으로 재구성한 관점"
              ]
            },
            {
              k: "Problem",
              c: "#f87171",
              items: [
                "초기 데이터 모델을 너무 일찍 고정",
                "테스트 커버리지 부족"
              ]
            },
            {
              k: "Try",
              c: "#fbbf24",
              items: ["백엔드 연동해 실데이터 검증", "온보딩 A/B 테스트"]
            }
          ].map(col => (
            <div
              key={col.k}
              className="rounded-xl border p-3"
              style={{borderColor: `${theme.primary}1a`}}
            >
              <p
                className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide"
                style={{color: col.c}}
              >
                {col.k}
              </p>
              {col.items.map(it => (
                <div key={it} className="mb-1.5 flex items-start gap-2">
                  <span
                    className="mt-1 h-1 w-1 shrink-0 rounded-full"
                    style={{background: col.c}}
                  />
                  <span className="text-[12px] leading-5 text-white/65">
                    {it}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SubLabel theme={theme}>배운 점</SubLabel>
        <div
          className="rounded-xl border-l-2 p-4"
          style={{
            borderColor: `${theme.primary}88`,
            background: `${theme.primary}08`
          }}
        >
          <p className="text-sm leading-7 text-white/75">
            데이터를 ‘보여주는 것’과 ‘읽히게 하는 것’은 다르다는 걸 체감했다.
            같은 거래 데이터라도 흐름·목표라는 맥락을 입히자 사용자의 반응이
            완전히 달라졌고, 기술 선택은 ‘멋짐’이 아니라 ‘이 문제에 맞는가’로
            판단해야 한다는 걸 배웠다.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {project.links.map(link => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-6 py-3 font-mono text-sm font-black"
            style={{background: theme.primary, color: theme.bg}}
            whileHover={{scale: 1.04, boxShadow: `0 0 24px ${theme.primary}55`}}
            whileTap={{scale: 0.97}}
          >
            {link.label} ↗
          </motion.a>
        ))}
      </div>
    </div>
  );
}
