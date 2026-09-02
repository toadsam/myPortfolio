"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion";
import {useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import type {DiagramSpec} from "./ArchitectureDiagram";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";

// ════════════════════════════════════════════════════════════════════════════
//  타입
// ════════════════════════════════════════════════════════════════════════════

export interface CodeSpec {
  filename: string;
  lines: string[];
  caption?: string;
  highlightLines?: number[];
}

export type ScreenKind =
  | "dashboard"
  | "bars"
  | "cards"
  | "feed"
  | "stats"
  | "title";

export interface ScreenSpec {
  title: string;
  kind: ScreenKind;
  chart?: number[];
  kpi?: {l: string; v: string}[];
  bars?: {l: string; p: number; v?: string}[];
  cards?: {l: string; sub?: string}[];
  feed?: string[];
  stats?: {n: string; l: string}[];
  titleText?: string;
  subText?: string;
}

export interface ImgSpec {
  /** 실제 이미지 경로. 비워두면 회색 플레이스홀더가 표시됩니다 (나중에 src만 채우면 교체 완료). */
  src?: string;
  /** 플레이스홀더에 표시할 설명 라벨 */
  label: string;
  /** CSS aspect-ratio (예: "16/9", "4/3"). 기본 16/9 */
  ratio?: string;
  /** 이미지 하단 캡션 */
  caption?: string;
  /**
   * 채움 방식. 기본 "cover" 는 상자 비율에 맞춰 **잘라낸다** — 사진은 괜찮지만
   * 다이어그램·ERD 는 표 이름과 화살표가 잘려 나간다(실측: ERD 원본 1.38 을
   * 1.60 상자에 넣어 14% 잘림). 그림에는 "contain" 을 줄 것.
   */
  fit?: "cover" | "contain";
  /**
   * 갤러리에서 한 줄(3칸)을 다 쓴다. 3칸 격자의 한 칸은 387px 인데,
   * 1600×1000 짜리 시퀀스 다이어그램을 거기 넣으면 **0.24배**로 줄어
   * 글자를 읽을 수 없다(실측). 그림은 읽으라고 그린 것이다.
   */
  wide?: boolean;
}

export interface RichProject {
  tagline: string;
  /** 개요 상단 대표 이미지 (선택) */
  heroImage?: ImgSpec;
  /** 문제 단계 보조 스크린샷 (선택) */
  problemShot?: ImgSpec;
  /** 결과 단계 스크린샷 갤러리 (선택) */
  gallery?: ImgSpec[];
  /** 해결 단계 끝의 21:9 전면 이미지. 이 페이지에서 가장 넓은 자리라
   *  가로로 긴 자료(화면 여러 장·타임라인)만 여기에 넣는다. */
  resultShot?: ImgSpec;
  tldr: {k: string; v: string}[];
  demo: {videoLen?: string; live?: string; video?: string; repo?: string};
  meta: {label: string; value: string}[];
  heroScreen: ScreenSpec;
  impact: {n: string; l: string}[];
  /** 결과 지표의 출처·기간. 캡처보다 이 한 줄이 신뢰도를 더 올린다. */
  metricsNote?: string;
  features: {t: string; d: string}[];
  problem: string;
  research: {quotes: {q: string; who: string}[]; stat?: {n: string; l: string}};
  /**
   * 사용자가 실제로 남긴 반응. 지표가 "얼마나 왔나" 라면 이건 "무슨 일이
   * 벌어졌나" 다 — 대시보드 숫자보다 강하게 읽히므로 결과 섹션 맨 앞에 둔다.
   * 제3자의 사적인 메시지가 출처일 수 있으니 **who 는 익명화해서 적을 것**
   * (실명·단체명·캡처 금지). 근거가 없으면 그냥 비워 둔다.
   */
  testimonial?: {q: string; who: string};
  beforeCode?: CodeSpec;
  /**
   * 「무엇이 어떻게 바뀌었나」를 한 화면에서 보여 주는 자리.
   *
   * 원래 `screen`(목업)만 받았는데, **실제 개선 전/후 캡처가 있으면 목업보다
   * 훨씬 세다** — 목업은 내가 그린 그림이고 캡처는 있었던 일이다. 그래서
   * `shot`(실제 이미지)을 받도록 넓혔다. 둘 다 없으면 그 칸은 그리지 않는다.
   *
   * `note` 는 "그래서 뭐가 달라졌는지" 한 줄. 이게 없으면 관람자가 두 그림을
   * 눈으로 비교하다 포기한다 — Before/After 는 차이를 말로 짚어 줘야 읽힌다.
   */
  beforeAfter?: {
    before: {label: string; screen?: ScreenSpec; shot?: ImgSpec; note?: string};
    after: {label: string; screen?: ScreenSpec; shot?: ImgSpec; note?: string};
  };
  /**
   * KPT 칸 이름. 기본은 Keep / Problem / Try 다.
   *
   * 두 번 만든 프로젝트(득근득근·총학생회)는 **배운 것의 종류가 단계마다
   * 다르다** — 1차는 만드는 법, 2차는 운영·사용자 관점. 그럴 때 칸 이름을
   * 「1.0 에서 배운 것 / 2.0 에서 배운 것」으로 바꿔 주면 목록만 읽어도
   * 성장의 방향이 보인다. Keep/Try 라는 이름표로는 그게 안 읽힌다.
   */
  kptLabels?: {keep: string; problem: string; try: string};
  hypothesis: string;
  process: {t: string; d: string}[];
  architecture: {name: string; desc: string; tag: string}[];
  /**
   * 손으로 배치한 시스템 아키텍처 그림. 없으면 그 자리는 **아무것도 안 그린다**
   * — 예전엔 "시스템 아키텍처 다이어그램" 이라고 적힌 1216×521 빈 점선 상자가
   * 9개 프로젝트 전부에 있었고, 그건 "다이어그램이 없다" 는 광고였다.
   * 자세한 설계 원칙은 ArchitectureDiagram.tsx 머리말 참고.
   *
   * 배열인 이유: 한 프로젝트에 시스템 구성도 + 데이터 모델처럼 **다른 질문에
   * 답하는 그림**이 여러 장 필요하다. 한 장에 다 우겨넣으면 둘 다 안 읽힌다.
   */
  diagrams?: DiagramSpec[];
  decisions: {area: string; pick: string; why: string; alt: string}[];
  coreCode: CodeSpec[];
  work: {g: string; items: string[]}[];
  challenges: {
    title: string;
    problem: string;
    solution: string;
    code?: CodeSpec;
    /**
     * 아래 `perf` 막대를 **이 카드 바로 뒤**에 붙인다.
     *
     * perf 는 프로젝트 단위 필드라 예전엔 카드 세 장을 전부 지나서 그려졌다.
     * 그런데 득근득근의 막대는 「인덱스」 카드의 증거인데, 그 사이에 실시간
     * 카드가 통째로 끼어 있어서 **근거가 주장에서 한 카드 떨어져 있었다.**
     *
     * 표시 안 하면 예전처럼 카드 뒤에 그린다 — 총학의 막대(맡기 전/후 검색
     * 노출)는 특정 카드의 증거가 아니라 프로젝트 전체 결과라 그게 맞다.
     */
    perfAfter?: boolean;
  }[];
  perf?: {
    rows: {label: string; before: number; after: number; unit: string}[];
    note?: string;
    /**
     * 이 칸은 원래 「인덱스 전 → 후」 전용이었다. 그런데 전/후를 실측으로
     * 들이대는 자리는 성능만이 아니다 — 총학은 **맡기 전과 맡은 뒤의 검색
     * 노출**이 같은 모양의 주장이다. 그래서 제목과 방향만 열었다.
     *
     * 기본값은 옛 동작 그대로다(제목 고정 · 작을수록 좋음). 안 넘기면
     * 기존 프로젝트는 한 글자도 안 바뀐다.
     */
    title?: string;
    /** 기본 true(작을수록 좋음). 노출·매출처럼 클수록 좋은 값이면 false. */
    lowerBetter?: boolean;
  };
  /**
   * 사용자가 한 말과, 그래서 한 것.
   *
   * 「넷 중 셋을 반영했다」를 지표로 내세우는 프로젝트는 **그 넷을 한자리에서**
   * 검증할 수 있어야 한다. 예전엔 인용 셋이 Context 에, 나머지 하나가 8스크린
   * 뒤 갤러리 캡션에 흩어져 있어서, 심사자가 3/4 를 확인하려면 스크롤을
   * 왕복해야 했다.
   *
   * done: false 인 줄을 지우지 말 것 — 안 고친 하나가 나머지 셋을 믿게 만든다.
   */
  feedbackMap?: {said: string; did: string; done: boolean}[];
  tech: string[];
  resultScreens: ScreenSpec[];
  metrics: {n: string; l: string}[];
  usability?: {
    rows: {label: string; before: number; after: number; unit: string}[];
    note?: string;
  };
  kpt: {keep: string[]; problem: string[]; try: string[]};
  // 배운 점은 두 조각이다 — 결론 한 줄(learningLead)과 그 근거(learning).
  // 예전엔 한 문자열이었는데, 원페이저에서 30px 가운데 정렬로 통째로 그리다 보니
  // 긴 프로젝트(181~194자)는 4줄이 되고 **결론이 맨 끝에 같은 크기로 묻혔다.**
  // 크기는 큰데 위계가 없어서 "글씨만 크다" 로 읽혔다. 결론을 앞으로 뺀다.
  // 마을(3D) 뷰는 예전처럼 한 덩이로 이어 붙여 쓴다.
  learningLead?: string;
  learning: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  프레젠테이션 컴포넌트
// ════════════════════════════════════════════════════════════════════════════

export function CodeLine({line, theme}: {line: string; theme: ProjectTheme}) {
  const segs: {text: string; color?: string}[] = [];
  const re =
    /(\/\/.*|#.*)|(`[^`]*`|"[^"]*"|'[^']*')|\b(const|let|var|function|fun|void|public|private|return|import|from|export|interface|type|class|if|else|async|await|new|map|filter|reduce|useMemo|useState|useEffect|useRef|override|suspend|val)\b|\b(\d+\.?\d*)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) segs.push({text: line.slice(last, m.index)});
    let color: string | undefined;
    if (m[1]) color = "#74a888";
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

export function CodeBlock({
  theme,
  spec
}: {
  theme: ProjectTheme;
  spec: CodeSpec;
}) {
  const hl = spec.highlightLines ?? [];
  return (
    <motion.div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}25`, background: "#070d12"}}
      initial={{opacity: 0, y: 14}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: "-40px"}}
      transition={{duration: 0.4}}
      whileHover={{y: -3, boxShadow: `0 12px 30px ${theme.primary}1f`}}
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
          {spec.filename}
        </span>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        <pre className="font-mono text-[12px] leading-[1.7]">
          {spec.lines.map((line, i) => (
            <div
              key={i}
              className="flex"
              style={
                hl.includes(i + 1)
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
      {spec.caption ? (
        <div
          className="border-t px-4 py-2 font-mono text-[11px] text-white/40"
          style={{borderColor: `${theme.primary}15`}}
        >
          {"// "}
          {spec.caption}
        </div>
      ) : null}
    </motion.div>
  );
}

function AreaSvg({theme, pts}: {theme: ProjectTheme; pts: number[]}) {
  const max = Math.max(...pts) * 1.1;
  const w = 320;
  const h = 72;
  const line = pts
    .map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / max) * h}`)
    .join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `ar-${theme.primary.replace("#", "")}-${pts.length}-${Math.round(
    pts[0] ?? 0
  )}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{height: 64}}
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

export function MockScreen({
  theme,
  spec
}: {
  theme: ProjectTheme;
  spec: ScreenSpec;
}) {
  return (
    <motion.div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}25`, background: "#06100c"}}
      initial={{opacity: 0, y: 14}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: "-40px"}}
      transition={{duration: 0.4}}
      whileHover={{y: -3, boxShadow: `0 12px 30px ${theme.primary}1f`}}
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
        <div className="ml-2 flex-1 truncate rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/70">
          {spec.title}
        </div>
      </div>
      <div className="p-3">
        {spec.kind === "title" ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <p
              className="font-mono text-xl font-black"
              style={{color: theme.primary}}
            >
              {spec.titleText}
            </p>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/45">
              {spec.subText ?? "▶ PRESS START"}
            </p>
          </div>
        ) : null}

        {spec.kind === "dashboard" ? (
          <>
            {spec.kpi ? (
              <div className="mb-2 grid grid-cols-3 gap-1.5">
                {spec.kpi.map(k => (
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
            ) : null}
            <div
              className="rounded-lg border p-2.5"
              style={{borderColor: `${theme.primary}1a`}}
            >
              <AreaSvg
                theme={theme}
                pts={spec.chart ?? [10, 18, 14, 26, 22, 34, 44, 52, 60]}
              />
            </div>
          </>
        ) : null}

        {spec.kind === "bars" ? (
          <div className="space-y-2">
            {(spec.bars ?? []).map((b, i) => (
              <div key={b.l}>
                <div className="flex justify-between font-mono text-[10px] text-white/55">
                  <span>{b.l}</span>
                  {b.v ? <span>{b.v}</span> : null}
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full"
                    style={{background: theme.primary}}
                    initial={{width: 0}}
                    animate={{width: `${b.p}%`}}
                    transition={{duration: 0.8, delay: i * 0.1}}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {spec.kind === "cards" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {(spec.cards ?? []).map(c => (
              <div
                key={c.l}
                className="rounded-lg border p-2"
                style={{borderColor: `${theme.primary}1a`}}
              >
                <p className="font-mono text-[11px] font-bold text-white/90">
                  {c.l}
                </p>
                {c.sub ? (
                  <p className="mt-0.5 font-mono text-[10px] leading-snug text-white/65">
                    {c.sub}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {spec.kind === "feed" ? (
          <div className="space-y-1">
            {(spec.feed ?? []).map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded border px-2 py-1.5"
                style={{borderColor: `${theme.primary}15`}}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{background: theme.primary}}
                />
                <span className="font-mono text-[10px] text-white/65">{f}</span>
              </div>
            ))}
          </div>
        ) : null}

        {spec.kind === "stats" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {(spec.stats ?? []).map(s => (
              <div
                key={s.l}
                className="rounded-lg border p-2.5 text-center"
                style={{borderColor: `${theme.primary}1a`}}
              >
                <p
                  className="font-mono text-base font-black"
                  style={{color: theme.primary}}
                >
                  {s.n}
                </p>
                <p className="font-mono text-[8px] text-white/40">{s.l}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function ArchDiagram({
  theme,
  layers
}: {
  theme: ProjectTheme;
  layers: {name: string; desc: string; tag: string}[];
}) {
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

function DecisionTable({
  theme,
  rows
}: {
  theme: ProjectTheme;
  rows: {area: string; pick: string; why: string; alt: string}[];
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}22`}}
    >
      <div
        className="grid grid-cols-[64px_92px_1fr] gap-2 border-b px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-white/35"
        style={{
          borderColor: `${theme.primary}18`,
          background: `${theme.primary}08`
        }}
      >
        <span>영역</span>
        <span>선택</span>
        <span>이유 / 대안</span>
      </div>
      {rows.map((r, i) => (
        <motion.div
          key={r.area}
          className="grid grid-cols-[64px_92px_1fr] gap-2 border-b px-3 py-2.5 last:border-0"
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

function ChallengeCard({
  theme,
  index,
  c
}: {
  theme: ProjectTheme;
  index: number;
  c: {title: string; problem: string; solution: string; code?: CodeSpec};
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
        <p className="font-mono text-sm font-black text-white">{c.title}</p>
      </div>
      <div className="mb-1 flex gap-2">
        <span className="shrink-0 font-mono text-[11px] font-black text-[#f87171]">
          문제
        </span>
        <p className="text-[13px] leading-6 text-white/70">{c.problem}</p>
      </div>
      <div className="mb-3 flex gap-2">
        <span
          className="shrink-0 font-mono text-[11px] font-black"
          style={{color: theme.primary}}
        >
          해결
        </span>
        <p className="text-[13px] leading-6 text-white/80">{c.solution}</p>
      </div>
      {c.code ? <CodeBlock theme={theme} spec={c.code} /> : null}
    </motion.div>
  );
}

export function CompareBars({
  theme,
  rows,
  lowerBetter
}: {
  theme: ProjectTheme;
  rows: {label: string; before: number; after: number; unit: string}[];
  lowerBetter: boolean;
}) {
  // 막대 길이는 읽는 사람에게 **양(量)** 이다. 행마다 따로 정규화하면
  // (peak = max(r.before, r.after)) 모든 before 막대가 예외 없이 꽉 찬
  // 길이로 그려져, 11.56ms 와 32.8ms 가 화면에서 같은 길이가 된다.
  // 하필 이 그래프가 놓이는 자리가 "재고 나서 말한다"를 주장하는
  // 섹션이라, 그림이 숫자를 배신하면 그 위 논증까지 같이 의심받는다.
  //
  // 단위가 모두 같을 때만 전체 최대값에 맞춘다. 단위가 섞인 표에서
  // 전체 정규화는 ms 와 개수를 같은 자로 재는 셈이라 더 틀린다 —
  // 그때는 행 단위로 되돌린다.
  const sameUnit = rows.every(r => r.unit === rows[0]?.unit);
  const globalPeak = Math.max(...rows.map(r => Math.max(r.before, r.after)));

  return (
    <div className="flex flex-col gap-4">
      {rows.map((r, i) => {
        const peak = sameUnit ? globalPeak : Math.max(r.before, r.after);
        // 낮을수록 좋은 값에서 "+100%" 는 두 번 틀린다 — 증가처럼 읽히고,
        // 실제 99.8% 를 100%(= 0 이 됐다) 로 부풀린다. 부호를 빼고,
        // 99% 를 넘으면 소수점 한 자리까지 남긴다.
        const raw = lowerBetter
          ? (1 - r.after / r.before) * 100
          : (r.after / r.before - 1) * 100;
        const delta =
          lowerBetter && raw > 99 ? Number(raw.toFixed(1)) : Math.round(raw);
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
                {lowerBetter ? "" : delta >= 0 ? "+" : ""}
                {delta}% {lowerBetter ? "↓" : "↑"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* 예전엔 10px · white/35 였다. 대비를 재 보니 3.22:1 로 AA(4.5)
                  미달인데, 하필 **비교하라고 놓은 숫자**가 이 페이지에서 가장
                  흐렸다. 55% 로 올리고 11px 로 키운다(w-16=64px 안에 "51435ms"
                  까지 들어간다). 아래 after 숫자와 크기를 맞춰야 둘이 한 쌍으로
                  읽힌다. */}
              <span className="w-16 shrink-0 text-right font-mono text-[11px] text-white/55">
                {r.before}
                {r.unit}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className="h-full rounded-full bg-white/25"
                  initial={{width: 0}}
                  animate={{width: `${(r.before / peak) * 100}%`}}
                  transition={{duration: 0.7, delay: i * 0.1}}
                />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="w-16 shrink-0 text-right font-mono text-[11px] font-black"
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
                  animate={{width: `${(r.after / peak) * 100}%`}}
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

function ProcessTimeline({
  theme,
  steps
}: {
  theme: ProjectTheme;
  steps: {t: string; d: string}[];
}) {
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
            <span className="whitespace-nowrap font-mono text-[12px] font-black text-white">
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

function TldrBanner({
  theme,
  rows
}: {
  theme: ProjectTheme;
  rows: {k: string; v: string}[];
}) {
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

function DemoCTA({
  theme,
  demo
}: {
  theme: ProjectTheme;
  demo: RichProject["demo"];
}) {
  const links = [
    demo.live ? {icon: "🔗", label: "라이브 데모", href: demo.live} : null,
    demo.video ? {icon: "▶", label: "풀 영상", href: demo.video} : null,
    demo.repo ? {icon: "⌥", label: "GitHub 저장소", href: demo.repo} : null
  ].filter(Boolean) as {icon: string; label: string; href: string}[];
  return (
    <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
      <motion.div
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border"
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
          데모 영상{demo.videoLen ? ` · ${demo.videoLen}` : ""}
        </span>
      </motion.div>
      <div className="flex flex-col justify-center gap-2.5">
        {links.map((l, i) => (
          <a
            key={l.label}
            className="flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-black transition hover:bg-white/5"
            style={{
              borderColor:
                i === 0 ? `${theme.primary}40` : `${theme.primary}25`,
              color: i === 0 ? theme.primary : theme.accent
            }}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            onClick={e => {
              if (l.href === "#") e.preventDefault();
            }}
          >
            {l.icon} {l.label} <span>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function BeforeAfter({
  theme,
  ba
}: {
  theme: ProjectTheme;
  ba: NonNullable<RichProject["beforeAfter"]>;
}) {
  const side = (
    s: NonNullable<RichProject["beforeAfter"]>["before"],
    tone: string,
    tag: string
  ) => (
    <div
      className="flex flex-col rounded-xl border p-3"
      style={{borderColor: `${tone}33`, background: `${tone}0a`}}
    >
      <p
        className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide"
        style={{color: tone}}
      >
        {tag} · {s.label}
      </p>
      {s.shot ? (
        <ImageSlot theme={theme} spec={s.shot} />
      ) : s.screen ? (
        <MockScreen theme={theme} spec={s.screen} />
      ) : null}
      {s.note ? (
        <p className="mt-2.5 text-[13px] leading-6 text-white/70">{s.note}</p>
      ) : null}
    </div>
  );

  return (
    <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_28px_1fr]">
      {side(ba.before, "#f87171", "Before")}
      <div
        className="flex items-center justify-center font-mono text-lg font-black"
        style={{color: theme.primary}}
      >
        →
      </div>
      {side(ba.after, theme.primary, "After")}
    </div>
  );
}

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
      {">"} <DecodeText text={String(children)} />
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
    <motion.div
      className="rounded-lg border-l-2 px-4 py-3"
      style={{borderColor: theme.primary, background: `${theme.primary}08`}}
      whileHover={{x: 4, background: `${theme.primary}12`}}
      transition={{type: "spring", stiffness: 300, damping: 24}}
    >
      <p className="text-sm leading-7 text-white/80">“{quote}”</p>
      <p className="mt-1 font-mono text-[11px] text-white/40">— {who}</p>
    </motion.div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/8" />;
}

// ── 이미지 슬롯 ──────────────────────────────────────────────────────────────
// src가 있으면 실제 이미지를, 없으면 비율 고정 회색 플레이스홀더를 렌더링.
// 나중에 데이터에서 src만 채우면 그 자리에 사진이 들어갑니다.
function ImgPlaceholder({
  theme,
  spec,
  large
}: {
  theme: ProjectTheme;
  spec: ImgSpec;
  large?: boolean;
}) {
  const ratio = spec.ratio ?? "16/9";
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${theme.primary}08 0 12px, transparent 12px 24px)`
      }}
    >
      <svg
        width={large ? 56 : 34}
        height={large ? 56 : 34}
        viewBox="0 0 24 24"
        fill="none"
        stroke={`${theme.primary}aa`}
        strokeWidth="1.5"
        className="transition-transform duration-500 group-hover:scale-110"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M3 17l5-4 4 3 4-4 5 4" />
      </svg>
      <span
        className={`px-4 text-center font-mono font-bold text-white/45 ${
          large ? "text-sm" : "text-[11px]"
        }`}
      >
        {spec.label}
      </span>
      <span className="font-mono text-[9px] tracking-[0.2em] text-white/25">
        {ratio.replace("/", " : ")} · 이미지 자리
      </span>
    </div>
  );
}

/**
 * 열려 있는 확대창의 수.
 *
 * 확대창과 프로젝트 상세가 **각자** window 에 keydown 을 걸고 있어서,
 * 확대 중에 ESC 를 한 번 누르면 둘 다 닫혀 이력서 목록까지 나가 버렸다.
 * 화살표도 마찬가지로 뒤에서 프로젝트가 넘어갔다. 뒤 화면이 이 값을 보고
 * 자기 단축키를 쉬게 한다. (stopPropagation 은 같은 target 에 걸린 리스너
 * 사이에서는 듣지 않는다 — 등록 순서에 기대는 방법은 더 약하다.)
 */
let openLightboxCount = 0;

export function isLightboxOpen() {
  return openLightboxCount > 0;
}

export function ImageSlot({
  theme,
  spec,
  className
}: {
  theme: ProjectTheme;
  spec: ImgSpec;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ratio = spec.ratio ?? "16/9";
  // 확대 창은 화면이 허락하는 만큼 커져야 한다. 가로만 제한하면 세로로 긴
  // 그림이 화면 밖으로 나가고, 세로만 제한하면 가로로 긴 그림이 작아진다.
  // 비율을 알고 있으니 둘 다 지킨 최대 크기를 직접 계산한다.
  const ratioNum = (() => {
    const [w, h] = ratio.split("/").map(Number);
    return h > 0 ? w / h : 16 / 9;
  })();
  // 확대 창은 **body 로 내보내야** 화면 전체를 쓴다.
  // position:fixed 는 조상에 transform 이 있으면 화면이 아니라 그 조상을
  // 기준으로 잡힌다. 이 화면은 framer-motion 이 곳곳에 transform 을 걸어
  // 두어서, inset-0 짜리 확대 창이 실제로는 본문 칸(1216x805) 안에 갇혀
  // 있었다. 그래서 전체폭으로 그린 다이어그램은 **누르면 오히려 작아졌다**
  // (1214 -> 1134). 포털로 빼면 조상의 transform 과 무관해진다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    // 확대창이 열려 있는 동안은 뒤 화면의 단축키가 듣지 않아야 한다.
    // window 에 걸린 리스너 둘은 서로를 모르므로, 열림 여부를 밖에서
    // 물어볼 수 있게 남긴다(아래 isLightboxOpen).
    openLightboxCount += 1;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      openLightboxCount = Math.max(0, openLightboxCount - 1);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <motion.figure
        className={`group relative m-0 cursor-zoom-in overflow-hidden rounded-xl border ${
          className ?? ""
        }`}
        style={{borderColor: `${theme.primary}25`, background: "#070d12"}}
        initial={{opacity: 0, y: 14}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: "-40px"}}
        transition={{duration: 0.45}}
        whileHover={{y: -4, boxShadow: `0 12px 32px ${theme.primary}22`}}
        onClick={() => setOpen(true)}
        /* 확대가 마우스 전용이었다. 갤러리 그림은 0.24~0.36배로 줄어 있어서
           확대 없이는 글자를 못 읽는다 — 키보드 사용자는 다이어그램 9장을
           하나도 볼 수 없었다는 뜻이다. */
        role="button"
        tabIndex={0}
        aria-label={`${spec.label} — 크게 보기`}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{aspectRatio: ratio}}
        >
          {spec.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spec.src}
              alt={spec.label}
              className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.04] ${
                spec.fit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
          ) : (
            <ImgPlaceholder theme={theme} spec={spec} />
          )}
          <span
            className="pointer-events-none absolute right-2 top-2 rounded px-2 py-1 font-mono text-[10px] font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
            style={{background: "rgba(0,0,0,0.55)", color: theme.accent}}
          >
            ⤢ 확대
          </span>
        </div>
        {spec.caption ? (
          <figcaption
            className="border-t px-4 py-3 text-[12px] leading-relaxed text-white/70"
            style={{borderColor: `${theme.primary}15`}}
          >
            {spec.caption}
          </figcaption>
        ) : null}
      </motion.figure>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-6 sm:p-10"
                  style={{
                    background: "rgba(2,4,8,0.86)",
                    backdropFilter: "blur(4px)"
                  }}
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  onClick={() => setOpen(false)}
                >
                  <motion.figure
                    className="relative m-0 overflow-hidden rounded-2xl border"
                    style={{
                      borderColor: `${theme.primary}40`,
                      background: "#070d12",
                      // 예전엔 max-w-5xl(1024px) 고정이었다. 갤러리의 전체폭
                      // 다이어그램은 이미 1214px 로 그려져서, 확대를 누르면
                      // **더 작아졌다.** 이제 가로 95vw 와 세로 80vh 중 먼저
                      // 걸리는 쪽까지 커진다.
                      width: `min(95vw, ${(ratioNum * 80).toFixed(1)}vh)`
                    }}
                    initial={{scale: 0.92, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    exit={{scale: 0.92, opacity: 0}}
                    transition={{type: "spring", stiffness: 260, damping: 26}}
                    onClick={e => e.stopPropagation()}
                  >
                    <div
                      className="relative w-full"
                      style={{aspectRatio: ratio}}
                    >
                      {spec.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={spec.src}
                          alt={spec.label}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImgPlaceholder theme={theme} spec={spec} large />
                      )}
                    </div>
                    {/* 캡션이 길면 닫기 안내를 밀어내 두 줄로 쪼개지고 서로
                        겹쳤다. 캡션만 줄어들게 하고 안내는 한 줄로 고정한다.
                        한글 캡션이라 모노도 뺀다(자간이 고정폭에 눌린다). */}
                    <figcaption
                      className="flex items-start justify-between gap-6 border-t px-4 py-3 text-[12px] leading-relaxed text-white/70"
                      style={{borderColor: `${theme.primary}20`}}
                    >
                      <span className="min-w-0 flex-1">
                        {spec.caption ?? spec.label}
                      </span>
                      <span className="mono shrink-0 whitespace-nowrap text-[11px] text-white/40">
                        ESC · 클릭으로 닫기
                      </span>
                    </figcaption>
                  </motion.figure>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}

// ── 숫자 카운트업 ────────────────────────────────────────────────────────────
// "40+", "-88%", "<1s" 같은 문자열에서 숫자만 0→목표로 굴리고 접두/접미는 그대로 둠.
export function CountUp({
  value,
  className,
  style
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: "-30px"});
  const motionVal = useMotionValue(0);
  // 구분자가 들어간 값("3 / 4", "8 × 5", "4 → 8")은 굴리지 않는다 —
  // 굴러가는 중간이 "0 / 4"(하나도 안 했다)로 읽혀 뜻이 뒤집힌다.
  const compound = /[/×→~]/.test(value);
  const match = compound ? null : value.match(/-?\d+\.?\d*/);
  const target = match ? parseFloat(match[0]) : 0;
  const decimals = match ? (match[0].split(".")[1] ?? "").length : 0;
  const prefix = match ? value.slice(0, match.index) : value;
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : "";
  const display = useTransform(
    motionVal,
    v => `${prefix}${v.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    if (!match || !inView) return;
    const controls = animate(motionVal, target, {duration: 1, ease: "easeOut"});
    return () => controls.stop();
  }, [inView, motionVal, target, match]);

  if (!match)
    return (
      <span className={className} style={style}>
        {value}
      </span>
    );
  return (
    <motion.span ref={ref} className={className} style={style}>
      {display}
    </motion.span>
  );
}

// ── 디코드(스크램블) 텍스트 ──────────────────────────────────────────────────
// 화면에 들어올 때(또는 hover 시) 랜덤 문자가 좌르륵 돌다가 진짜 글자로 맞춰지는
// 관제 콘솔 느낌. 한글·기호는 그대로 두고 영문/숫자만 스크램블한다.
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&*<>/";
const scrambleable = (c: string) => /[A-Za-z0-9]/.test(c);

export function DecodeText({
  text,
  className,
  style
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: "-20px"});
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(false);

  const run = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    const chars = Array.from(text);
    let progress = 0;
    timer.current = setInterval(() => {
      progress += 0.5;
      const p = Math.floor(progress);
      setDisplay(
        chars
          .map((c, i) =>
            !scrambleable(c) || i < p
              ? c
              : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]
          )
          .join("")
      );
      if (p >= chars.length) {
        if (timer.current) clearInterval(timer.current);
        setDisplay(text);
      }
    }, 38);
  }, [text]);

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      run();
    }
  }, [inView, run]);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );

  return (
    <span ref={ref} className={className} style={style} onMouseEnter={run}>
      {display}
    </span>
  );
}

// ── 단어 단위 페이드업 텍스트 (+ 키워드 hover 하이라이트) ──────────────────────
// 문단이 등장할 때 단어들이 순차적으로 흐릿→선명하게 떠오른다. (글자 단위는 과해서 단어 단위)
// highlight에 기술 키워드를 넘기면 본문 속 해당 단어가 강조되고 hover에 반응한다.
export function RevealText({
  text,
  className,
  style,
  highlight,
  theme
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  highlight?: string[];
  theme?: ProjectTheme;
}) {
  const words = text.split(" ");
  const hi = new Set(
    (highlight ?? []).filter(h => /^[A-Za-z]/.test(h)).map(h => h.toLowerCase())
  );
  return (
    <motion.p
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{once: true, margin: "-30px"}}
      transition={{staggerChildren: 0.022}}
    >
      {words.map((w, i) => {
        const token = w.match(/[A-Za-z][A-Za-z]*/)?.[0];
        const isHi = !!token && theme && hi.has(token.toLowerCase());
        return (
          <span key={i}>
            <motion.span
              className="inline-block"
              variants={{
                hidden: {opacity: 0, y: 8, filter: "blur(3px)"},
                show: {opacity: 1, y: 0, filter: "blur(0px)"}
              }}
              transition={{duration: 0.34}}
            >
              {isHi ? (
                <motion.span
                  className="rounded px-1 font-bold"
                  style={{
                    color: theme!.accent,
                    background: `${theme!.primary}14`,
                    cursor: "help"
                  }}
                  whileHover={{
                    background: `${theme!.primary}38`,
                    color: "#ffffff"
                  }}
                  transition={{duration: 0.15}}
                >
                  {w}
                </motion.span>
              ) : (
                w
              )}
            </motion.span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </motion.p>
  );
}

// ── 마그네틱 ─────────────────────────────────────────────────────────────────
// 마우스가 다가오면 요소가 커서 쪽으로 살짝 끌려가고, 벗어나면 스프링으로 복귀.
export function Magnetic({
  children,
  strength = 0.3,
  className
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, {stiffness: 180, damping: 14, mass: 0.4});
  const sy = useSpring(y, {stiffness: 180, damping: 14, mass: 0.4});

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{x: sx, y: sy, display: "inline-block"}}
      onMouseMove={e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

// ── 시그니처 데모 공통 프레임 ─────────────────────────────────────────────────
// 프로젝트별 인터랙티브 데모가 공유하는 패널 틀(헤더 + 본문 + 푸터).
export function DemoFrame({
  theme,
  label,
  tag,
  controls,
  footer,
  children
}: {
  theme: ProjectTheme;
  label: string;
  tag?: string;
  controls?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${theme.primary}33`,
        background: `${theme.primary}06`
      }}
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5}}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3"
        style={{borderColor: `${theme.primary}22`}}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{background: theme.primary}}
              animate={{scale: [1, 2.4], opacity: [0.6, 0]}}
              transition={{duration: 1.6, repeat: Infinity, ease: "easeOut"}}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{background: theme.primary}}
            />
          </span>
          <span className="font-mono text-sm font-black text-white">
            {label}
          </span>
          {tag ? (
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{color: theme.primary}}
            >
              {tag}
            </span>
          ) : null}
        </div>
        {controls ? (
          <div className="flex items-center gap-2">{controls}</div>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
      {footer ? (
        <div
          className="border-t px-5 py-2.5"
          style={{
            borderColor: `${theme.primary}18`,
            background: "rgba(0,0,0,0.15)"
          }}
        >
          {footer}
        </div>
      ) : null}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  데이터 기반 5단계 렌더러
// ════════════════════════════════════════════════════════════════════════════

export function RichSection({
  step,
  data,
  theme,
  links,
  title
}: {
  step: number;
  data: RichProject;
  theme: ProjectTheme;
  links: ProjectData["links"];
  title: string;
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
            {">"} <DecodeText text={data.tagline} />
          </p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white">
            <Magnetic strength={0.35}>
              <DecodeText text={title} />
            </Magnetic>
          </h1>
        </div>
        {data.heroImage ? (
          <ImageSlot theme={theme} spec={data.heroImage} />
        ) : null}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <TldrBanner theme={theme} rows={data.tldr} />
          <div>
            <SubLabel theme={theme}>데모 · 직접 확인</SubLabel>
            <DemoCTA theme={theme} demo={data.demo} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="rounded-xl border p-4"
            style={{borderColor: `${theme.primary}22`}}
          >
            {data.meta.map(m => (
              <MetaRow
                key={m.label}
                label={m.label}
                value={m.value}
                theme={theme}
              />
            ))}
          </div>
          <MockScreen theme={theme} spec={data.heroScreen} />
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div>
            <SubLabel theme={theme}>한 줄 임팩트</SubLabel>
            <div className="grid grid-cols-3 gap-3">
              {data.impact.map(s => (
                <motion.div
                  key={s.l}
                  className="rounded-xl border p-3 text-center"
                  style={{borderColor: `${theme.primary}22`}}
                  whileHover={{y: -3, borderColor: `${theme.primary}55`}}
                >
                  <CountUp
                    value={s.n}
                    className="font-mono text-2xl font-black"
                    style={{color: theme.primary}}
                  />
                  <p className="mt-1 text-[11px] leading-4 text-white/50">
                    {s.l}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <SubLabel theme={theme}>핵심 기능</SubLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.features.map(f => (
                <motion.div
                  key={f.t}
                  className="rounded-lg border p-3"
                  style={{borderColor: `${theme.primary}1a`}}
                  whileHover={{
                    y: -3,
                    borderColor: `${theme.primary}55`,
                    background: `${theme.primary}0a`
                  }}
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 문제 ──
  if (step === 1) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div>
              <SubLabel theme={theme}>PROBLEM · 무엇이 문제였나</SubLabel>
              <RevealText
                text={data.problem}
                className="text-base leading-8 text-white/85"
                highlight={data.tech}
                theme={theme}
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
                <RevealText
                  text={data.hypothesis}
                  className="text-sm leading-7 text-white/80"
                  highlight={data.tech}
                  theme={theme}
                />
              </div>
            </div>
          </div>
          <div>
            <SubLabel theme={theme}>사용자 리서치</SubLabel>
            <div className="flex flex-col gap-2.5">
              {data.research.quotes.map(q => (
                <QuoteCard key={q.who} theme={theme} quote={q.q} who={q.who} />
              ))}
              {data.research.stat ? (
                <div
                  className="flex items-center gap-3 rounded-lg border px-4 py-3"
                  style={{borderColor: `${theme.primary}22`}}
                >
                  <CountUp
                    value={data.research.stat.n}
                    className="font-mono text-2xl font-black"
                    style={{color: theme.primary}}
                  />
                  <span className="text-sm text-white/65">
                    {data.research.stat.l}
                  </span>
                </div>
              ) : null}
              {data.problemShot ? (
                <ImageSlot
                  theme={theme}
                  spec={data.problemShot}
                  className="mt-1"
                />
              ) : null}
            </div>
          </div>
        </div>
        {data.beforeCode ? (
          <>
            <Divider />
            <div>
              <SubLabel theme={theme}>기존 방식의 한계 (Before)</SubLabel>
              <CodeBlock theme={theme} spec={data.beforeCode} />
            </div>
          </>
        ) : null}
        {data.beforeAfter ? (
          <div>
            <SubLabel theme={theme}>핵심 전환 · Before → After</SubLabel>
            <BeforeAfter theme={theme} ba={data.beforeAfter} />
          </div>
        ) : null}
      </div>
    );
  }

  // ── 접근 ──
  if (step === 2) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div>
          <SubLabel theme={theme}>PROCESS · 진행 과정</SubLabel>
          <ProcessTimeline theme={theme} steps={data.process} />
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div>
            <SubLabel theme={theme}>ARCHITECTURE · 구조</SubLabel>
            <ArchDiagram theme={theme} layers={data.architecture} />
          </div>
          <div>
            <SubLabel theme={theme}>기술 의사결정 · 왜 이걸 골랐나</SubLabel>
            <DecisionTable theme={theme} rows={data.decisions} />
          </div>
        </div>
        <Divider />
        <div>
          <SubLabel theme={theme}>핵심 구현</SubLabel>
          <div className="grid gap-3 xl:grid-cols-2">
            {data.coreCode.map(c => (
              <CodeBlock key={c.filename} theme={theme} spec={c} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 기여 ──
  if (step === 3) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div>
            <SubLabel theme={theme}>WORK · 직접 만든 것</SubLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.work.map(group => (
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
          <div className="flex flex-col gap-6">
            {data.perf ? (
              <div>
                <SubLabel theme={theme}>
                  {data.perf.title ?? "성능 개선 · 측정 기반"}
                </SubLabel>
                <div
                  className="rounded-xl border p-4"
                  style={{borderColor: `${theme.primary}22`}}
                >
                  <CompareBars
                    theme={theme}
                    lowerBetter={data.perf.lowerBetter ?? true}
                    rows={data.perf.rows}
                  />
                  {data.perf.note ? (
                    <p className="mt-3 font-mono text-[11px] text-white/35">
                      {"// "}
                      {data.perf.note}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div>
              <SubLabel theme={theme}>사용 기술</SubLabel>
              <div className="flex flex-wrap gap-2">
                {data.tech.map(t => (
                  <motion.span
                    key={t}
                    className="cursor-default rounded-lg border px-3 py-1.5 font-mono text-sm font-bold"
                    style={{
                      borderColor: `${theme.primary}35`,
                      color: theme.accent
                    }}
                    whileHover={{
                      y: -2,
                      scale: 1.05,
                      borderColor: theme.primary,
                      background: `${theme.primary}1a`,
                      boxShadow: `0 4px 16px ${theme.primary}33`
                    }}
                    whileTap={{scale: 0.96}}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Divider />
        <div>
          <SubLabel theme={theme}>가장 어려웠던 문제 · Challenge</SubLabel>
          <div className="grid gap-3 xl:grid-cols-2">
            {data.challenges.map((c, i) => (
              <ChallengeCard key={c.title} theme={theme} index={i + 1} c={c} />
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
          {data.resultScreens.map(s => (
            <MockScreen key={s.title} theme={theme} spec={s} />
          ))}
        </div>
      </div>
      {data.gallery && data.gallery.length > 0 ? (
        <div>
          <SubLabel theme={theme}>스크린샷</SubLabel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.gallery.map(g => (
              <ImageSlot key={g.label} theme={theme} spec={g} />
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <SubLabel theme={theme}>성과 지표</SubLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.metrics.map(m => (
            <motion.div
              key={m.l}
              className="rounded-xl border p-4"
              style={{borderColor: `${theme.primary}22`}}
              whileHover={{y: -3, borderColor: `${theme.primary}55`}}
            >
              <CountUp
                value={m.n}
                className="font-mono text-2xl font-black"
                style={{color: theme.primary}}
              />
              <p className="mt-1 text-[11px] leading-4 text-white/50">{m.l}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <Divider />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {data.usability ? (
            <div>
              <SubLabel theme={theme}>변화 · Before → After</SubLabel>
              <div
                className="rounded-xl border p-4"
                style={{borderColor: `${theme.primary}22`}}
              >
                <CompareBars
                  theme={theme}
                  lowerBetter={false}
                  rows={data.usability.rows}
                />
                {data.usability.note ? (
                  <p className="mt-3 font-mono text-[11px] text-white/35">
                    {"// "}
                    {data.usability.note}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
          <div>
            <SubLabel theme={theme}>배운 점</SubLabel>
            <div
              className="rounded-xl border-l-2 p-4"
              style={{
                borderColor: `${theme.primary}88`,
                background: `${theme.primary}08`
              }}
            >
              {/* 마을 뷰는 위계를 나눌 자리가 아니라 한 덩이로 읽는 칸이다.
                  데이터가 둘로 갈렸어도 여기서는 다시 붙여 쓴다 —
                  안 그러면 결론 문장이 이 화면에서만 사라진다. */}
              <RevealText
                text={[data.learningLead, data.learning]
                  .filter(Boolean)
                  .join(" ")}
                className="text-sm leading-7 text-white/75"
                highlight={data.tech}
                theme={theme}
              />
            </div>
          </div>
        </div>
        <div>
          <SubLabel theme={theme}>회고 · KPT</SubLabel>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Keep", theme.primary, data.kpt.keep],
                ["Problem", "#f87171", data.kpt.problem],
                ["Try", "#fbbf24", data.kpt.try]
              ] as const
            ).map(([k, c, items]) => (
              <div
                key={k}
                className="rounded-xl border p-3"
                style={{borderColor: `${theme.primary}1a`}}
              >
                <p
                  className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide"
                  style={{color: c}}
                >
                  {k}
                </p>
                {items.map(it => (
                  <div key={it} className="mb-1.5 flex items-start gap-2">
                    <span
                      className="mt-1 h-1 w-1 shrink-0 rounded-full"
                      style={{background: c}}
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
      </div>
      <div className="flex flex-wrap gap-3">
        {links.map(link => (
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
