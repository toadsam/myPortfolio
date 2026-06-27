"use client";

import {motion} from "framer-motion";
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

export type ScreenKind = "dashboard" | "bars" | "cards" | "feed" | "stats" | "title";

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

export interface RichProject {
  tagline: string;
  tldr: {k: string; v: string}[];
  demo: {videoLen?: string; live?: string; video?: string; repo?: string};
  meta: {label: string; value: string}[];
  heroScreen: ScreenSpec;
  impact: {n: string; l: string}[];
  features: {t: string; d: string}[];
  problem: string;
  research: {quotes: {q: string; who: string}[]; stat?: {n: string; l: string}};
  beforeCode?: CodeSpec;
  beforeAfter?: {before: {label: string; screen: ScreenSpec}; after: {label: string; screen: ScreenSpec}};
  hypothesis: string;
  process: {t: string; d: string}[];
  architecture: {name: string; desc: string; tag: string}[];
  decisions: {area: string; pick: string; why: string; alt: string}[];
  coreCode: CodeSpec[];
  work: {g: string; items: string[]}[];
  challenges: {title: string; problem: string; solution: string; code?: CodeSpec}[];
  perf?: {rows: {label: string; before: number; after: number; unit: string}[]; note?: string};
  tech: string[];
  resultScreens: ScreenSpec[];
  metrics: {n: string; l: string}[];
  usability?: {rows: {label: string; before: number; after: number; unit: string}[]; note?: string};
  kpt: {keep: string[]; problem: string[]; try: string[]};
  learning: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  프레젠테이션 컴포넌트
// ════════════════════════════════════════════════════════════════════════════

function CodeLine({line, theme}: {line: string; theme: ProjectTheme}) {
  const segs: {text: string; color?: string}[] = [];
  const re =
    /(\/\/.*|#.*)|(`[^`]*`|"[^"]*"|'[^']*')|\b(const|let|var|function|fun|void|public|private|return|import|from|export|interface|type|class|if|else|async|await|new|map|filter|reduce|useMemo|useState|useEffect|useRef|override|suspend|val)\b|\b(\d+\.?\d*)\b/g;
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

export function CodeBlock({theme, spec}: {theme: ProjectTheme; spec: CodeSpec}) {
  const hl = spec.highlightLines ?? [];
  return (
    <div className="overflow-hidden rounded-xl border" style={{borderColor: `${theme.primary}25`, background: "#070d12"}}>
      <div className="flex items-center gap-2 border-b px-4 py-2" style={{borderColor: `${theme.primary}18`, background: "rgba(255,255,255,0.02)"}}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-mono text-[11px] font-bold text-white/45">{spec.filename}</span>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        <pre className="font-mono text-[12px] leading-[1.7]">
          {spec.lines.map((line, i) => (
            <div key={i} className="flex" style={hl.includes(i + 1) ? {background: `${theme.primary}12`, marginInline: -16, paddingInline: 16} : undefined}>
              <span className="mr-4 select-none text-right text-white/20" style={{minWidth: 18}}>{i + 1}</span>
              <code className="text-white/85"><CodeLine line={line} theme={theme} /></code>
            </div>
          ))}
        </pre>
      </div>
      {spec.caption ? (
        <div className="border-t px-4 py-2 font-mono text-[11px] text-white/40" style={{borderColor: `${theme.primary}15`}}>{"// "}{spec.caption}</div>
      ) : null}
    </div>
  );
}

function AreaSvg({theme, pts}: {theme: ProjectTheme; pts: number[]}) {
  const max = Math.max(...pts) * 1.1;
  const w = 320;
  const h = 72;
  const line = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / max) * h}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `ar-${theme.primary.replace("#", "")}-${pts.length}-${Math.round(pts[0] ?? 0)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{height: 64}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.35" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon points={area} fill={`url(#${gid})`} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.8, delay: 0.3}} />
      <motion.polyline points={line} fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 1.1, ease: "easeOut"}} />
    </svg>
  );
}

export function MockScreen({theme, spec}: {theme: ProjectTheme; spec: ScreenSpec}) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{borderColor: `${theme.primary}25`, background: "#06100c"}}>
      <div className="flex items-center gap-2 border-b px-3 py-2" style={{borderColor: `${theme.primary}18`, background: "rgba(255,255,255,0.02)"}}>
        <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
        <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
        <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
        <div className="ml-2 flex-1 truncate rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/35">{spec.title}</div>
      </div>
      <div className="p-3">
        {spec.kind === "title" ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <p className="font-mono text-xl font-black" style={{color: theme.primary}}>{spec.titleText}</p>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/45">{spec.subText ?? "▶ PRESS START"}</p>
          </div>
        ) : null}

        {spec.kind === "dashboard" ? (
          <>
            {spec.kpi ? (
              <div className="mb-2 grid grid-cols-3 gap-1.5">
                {spec.kpi.map((k) => (
                  <div key={k.l} className="rounded-lg border p-2" style={{borderColor: `${theme.primary}1a`}}>
                    <p className="font-mono text-[8px] uppercase text-white/35">{k.l}</p>
                    <p className="mt-0.5 font-mono text-xs font-black text-white">{k.v}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="rounded-lg border p-2.5" style={{borderColor: `${theme.primary}1a`}}>
              <AreaSvg theme={theme} pts={spec.chart ?? [10, 18, 14, 26, 22, 34, 44, 52, 60]} />
            </div>
          </>
        ) : null}

        {spec.kind === "bars" ? (
          <div className="space-y-2">
            {(spec.bars ?? []).map((b, i) => (
              <div key={b.l}>
                <div className="flex justify-between font-mono text-[10px] text-white/55"><span>{b.l}</span>{b.v ? <span>{b.v}</span> : null}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div className="h-full rounded-full" style={{background: theme.primary}} initial={{width: 0}} animate={{width: `${b.p}%`}} transition={{duration: 0.8, delay: i * 0.1}} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {spec.kind === "cards" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {(spec.cards ?? []).map((c) => (
              <div key={c.l} className="rounded-lg border p-2" style={{borderColor: `${theme.primary}1a`}}>
                <p className="font-mono text-[10px] font-bold text-white/75">{c.l}</p>
                {c.sub ? <p className="mt-0.5 font-mono text-[8px] text-white/40">{c.sub}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {spec.kind === "feed" ? (
          <div className="space-y-1">
            {(spec.feed ?? []).map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded border px-2 py-1.5" style={{borderColor: `${theme.primary}15`}}>
                <span className="h-1.5 w-1.5 rounded-full" style={{background: theme.primary}} />
                <span className="font-mono text-[10px] text-white/65">{f}</span>
              </div>
            ))}
          </div>
        ) : null}

        {spec.kind === "stats" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {(spec.stats ?? []).map((s) => (
              <div key={s.l} className="rounded-lg border p-2.5 text-center" style={{borderColor: `${theme.primary}1a`}}>
                <p className="font-mono text-base font-black" style={{color: theme.primary}}>{s.n}</p>
                <p className="font-mono text-[8px] text-white/40">{s.l}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ArchDiagram({theme, layers}: {theme: ProjectTheme; layers: {name: string; desc: string; tag: string}[]}) {
  return (
    <div className="flex flex-col gap-1.5">
      {layers.map((l, i) => (
        <div key={l.name}>
          <motion.div className="flex items-center gap-3 rounded-lg border px-4 py-3" style={{borderColor: `${theme.primary}25`, background: `${theme.primary}08`}} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: i * 0.1}}>
            <span className="rounded px-2 py-0.5 font-mono text-[10px] font-black" style={{background: `${theme.primary}20`, color: theme.primary}}>{l.tag}</span>
            <div>
              <p className="font-mono text-sm font-black text-white">{l.name}</p>
              <p className="font-mono text-[11px] text-white/45">{l.desc}</p>
            </div>
          </motion.div>
          {i < layers.length - 1 ? <div className="my-0.5 text-center font-mono text-xs" style={{color: `${theme.primary}88`}}>↓</div> : null}
        </div>
      ))}
    </div>
  );
}

function DecisionTable({theme, rows}: {theme: ProjectTheme; rows: {area: string; pick: string; why: string; alt: string}[]}) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{borderColor: `${theme.primary}22`}}>
      <div className="grid grid-cols-[64px_92px_1fr] gap-2 border-b px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-white/35" style={{borderColor: `${theme.primary}18`, background: `${theme.primary}08`}}>
        <span>영역</span><span>선택</span><span>이유 / 대안</span>
      </div>
      {rows.map((r, i) => (
        <motion.div key={r.area} className="grid grid-cols-[64px_92px_1fr] gap-2 border-b px-3 py-2.5 last:border-0" style={{borderColor: `${theme.primary}10`}} initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}} transition={{delay: i * 0.08}}>
          <span className="font-mono text-[11px] font-bold text-white/55">{r.area}</span>
          <span className="font-mono text-[11px] font-black" style={{color: theme.primary}}>{r.pick}</span>
          <span className="text-[11px] leading-5 text-white/70">{r.why}<span className="mt-0.5 block text-white/35">↔ {r.alt}</span></span>
        </motion.div>
      ))}
    </div>
  );
}

function ChallengeCard({theme, index, c}: {theme: ProjectTheme; index: number; c: {title: string; problem: string; solution: string; code?: CodeSpec}}) {
  return (
    <motion.div className="rounded-xl border p-4" style={{borderColor: `${theme.primary}22`}} initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{duration: 0.4}}>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-black" style={{background: `${theme.primary}1a`, color: theme.primary}}>{String(index).padStart(2, "0")}</span>
        <p className="font-mono text-sm font-black text-white">{c.title}</p>
      </div>
      <div className="mb-1 flex gap-2"><span className="shrink-0 font-mono text-[11px] font-black text-[#f87171]">문제</span><p className="text-[13px] leading-6 text-white/70">{c.problem}</p></div>
      <div className="mb-3 flex gap-2"><span className="shrink-0 font-mono text-[11px] font-black" style={{color: theme.primary}}>해결</span><p className="text-[13px] leading-6 text-white/80">{c.solution}</p></div>
      {c.code ? <CodeBlock theme={theme} spec={c.code} /> : null}
    </motion.div>
  );
}

function CompareBars({theme, rows, lowerBetter}: {theme: ProjectTheme; rows: {label: string; before: number; after: number; unit: string}[]; lowerBetter: boolean}) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r, i) => {
        const peak = Math.max(r.before, r.after);
        const delta = lowerBetter ? Math.round((1 - r.after / r.before) * 100) : Math.round((r.after / r.before - 1) * 100);
        return (
          <div key={r.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-white/70">{r.label}</span>
              <span className="font-mono text-[11px] font-black" style={{color: theme.primary}}>{delta >= 0 ? "+" : ""}{delta}% {lowerBetter ? "↓" : "↑"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-right font-mono text-[10px] text-white/35">{r.before}{r.unit}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6"><motion.div className="h-full rounded-full bg-white/25" initial={{width: 0}} animate={{width: `${(r.before / peak) * 100}%`}} transition={{duration: 0.7, delay: i * 0.1}} /></div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="w-16 shrink-0 text-right font-mono text-[10px] font-black" style={{color: theme.primary}}>{r.after}{r.unit}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6"><motion.div className="h-full rounded-full" style={{background: theme.primary}} initial={{width: 0}} animate={{width: `${(r.after / peak) * 100}%`}} transition={{duration: 0.7, delay: 0.15 + i * 0.1}} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProcessTimeline({theme, steps}: {theme: ProjectTheme; steps: {t: string; d: string}[]}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <div key={s.t} className="flex items-center">
          <motion.div className="flex flex-col items-center rounded-lg border px-3 py-2" style={{borderColor: `${theme.primary}25`, background: `${theme.primary}08`}} initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} transition={{delay: i * 0.08}}>
            <span className="whitespace-nowrap font-mono text-[12px] font-black text-white">{s.t}</span>
            <span className="font-mono text-[9px] text-white/40">{s.d}</span>
          </motion.div>
          {i < steps.length - 1 ? <span className="mx-1 font-mono text-xs" style={{color: `${theme.primary}88`}}>→</span> : null}
        </div>
      ))}
    </div>
  );
}

function TldrBanner({theme, rows}: {theme: ProjectTheme; rows: {k: string; v: string}[]}) {
  return (
    <motion.div className="overflow-hidden rounded-xl border" style={{borderColor: `${theme.primary}40`, background: `${theme.primary}0a`}} initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{duration: 0.45}}>
      <div className="flex items-center gap-2 border-b px-4 py-2" style={{borderColor: `${theme.primary}20`}}>
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{color: theme.primary}}>★ TL;DR · 30초 요약</span>
      </div>
      <div className="p-4">
        {rows.map((r) => (
          <div key={r.k} className="flex gap-3 py-1.5">
            <span className="w-14 shrink-0 font-mono text-[11px] font-black" style={{color: theme.accent}}>{r.k}</span>
            <span className="text-[13px] leading-6 text-white/80">{r.v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DemoCTA({theme, demo}: {theme: ProjectTheme; demo: RichProject["demo"]}) {
  const links = [
    demo.live ? {icon: "🔗", label: "라이브 데모", href: demo.live} : null,
    demo.video ? {icon: "▶", label: "풀 영상", href: demo.video} : null,
    demo.repo ? {icon: "⌥", label: "GitHub 저장소", href: demo.repo} : null,
  ].filter(Boolean) as {icon: string; label: string; href: string}[];
  return (
    <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
      <motion.div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border" style={{borderColor: `${theme.primary}30`, background: "#06100c"}} initial={{opacity: 0, scale: 0.97}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.5}}>
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{backgroundImage: `radial-gradient(${theme.primary}20, transparent 70%)`}} />
        <motion.div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{background: theme.primary}} animate={{boxShadow: [`0 0 0 0 ${theme.primary}55`, `0 0 0 16px ${theme.primary}00`]}} transition={{duration: 1.8, repeat: Infinity}}>
          <span className="ml-1 text-xl" style={{color: theme.bg}}>▶</span>
        </motion.div>
        <span className="absolute bottom-3 left-3 font-mono text-[11px] font-bold text-white/50">데모 영상{demo.videoLen ? ` · ${demo.videoLen}` : ""}</span>
      </motion.div>
      <div className="flex flex-col justify-center gap-2.5">
        {links.map((l, i) => (
          <a key={l.label} className="flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-black transition hover:bg-white/5" style={{borderColor: i === 0 ? `${theme.primary}40` : `${theme.primary}25`, color: i === 0 ? theme.primary : theme.accent}} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" onClick={(e) => {if (l.href === "#") e.preventDefault();}}>
            {l.icon} {l.label} <span>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function BeforeAfter({theme, ba}: {theme: ProjectTheme; ba: NonNullable<RichProject["beforeAfter"]>}) {
  return (
    <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_28px_1fr]">
      <div className="rounded-xl border p-3" style={{borderColor: "#f8717133", background: "#f871710a"}}>
        <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide text-[#f87171]">Before · {ba.before.label}</p>
        <MockScreen theme={theme} spec={ba.before.screen} />
      </div>
      <div className="flex items-center justify-center font-mono text-lg font-black" style={{color: theme.primary}}>→</div>
      <div className="rounded-xl border p-3" style={{borderColor: `${theme.primary}40`, background: `${theme.primary}0a`}}>
        <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide" style={{color: theme.primary}}>After · {ba.after.label}</p>
        <MockScreen theme={theme} spec={ba.after.screen} />
      </div>
    </div>
  );
}

function MetaRow({label, value, theme}: {label: string; value: string; theme: ProjectTheme}) {
  return (
    <div className="flex gap-3 border-b py-2 last:border-0" style={{borderColor: `${theme.primary}12`}}>
      <span className="w-14 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wide text-white/35">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}

function SubLabel({children, theme}: {children: React.ReactNode; theme: ProjectTheme}) {
  return <p className="mb-3 mt-1 font-mono text-[11px] font-black uppercase tracking-[0.2em]" style={{color: theme.primary}}>{">"} {children}</p>;
}

function QuoteCard({theme, quote, who}: {theme: ProjectTheme; quote: string; who: string}) {
  return (
    <div className="rounded-lg border-l-2 px-4 py-3" style={{borderColor: theme.primary, background: `${theme.primary}08`}}>
      <p className="text-sm leading-7 text-white/80">“{quote}”</p>
      <p className="mt-1 font-mono text-[11px] text-white/40">— {who}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/8" />;
}

// ════════════════════════════════════════════════════════════════════════════
//  데이터 기반 5단계 렌더러
// ════════════════════════════════════════════════════════════════════════════

export function RichSection({step, data, theme, links, title}: {step: number; data: RichProject; theme: ProjectTheme; links: ProjectData["links"]; title: string}) {
  // ── 개요 ──
  if (step === 0) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.3em]" style={{color: theme.primary}}>{">"} {data.tagline}</p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white">{title}</h1>
        </div>
        <TldrBanner theme={theme} rows={data.tldr} />
        <div><SubLabel theme={theme}>데모 · 직접 확인</SubLabel><DemoCTA theme={theme} demo={data.demo} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4" style={{borderColor: `${theme.primary}22`}}>
            {data.meta.map((m) => <MetaRow key={m.label} label={m.label} value={m.value} theme={theme} />)}
          </div>
          <MockScreen theme={theme} spec={data.heroScreen} />
        </div>
        <div>
          <SubLabel theme={theme}>한 줄 임팩트</SubLabel>
          <div className="grid grid-cols-3 gap-3">
            {data.impact.map((s) => (
              <div key={s.l} className="rounded-xl border p-3 text-center" style={{borderColor: `${theme.primary}22`}}>
                <p className="font-mono text-2xl font-black" style={{color: theme.primary}}>{s.n}</p>
                <p className="mt-1 text-[11px] leading-4 text-white/50">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SubLabel theme={theme}>핵심 기능</SubLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.features.map((f) => (
              <div key={f.t} className="rounded-lg border p-3" style={{borderColor: `${theme.primary}1a`}}>
                <p className="font-mono text-sm font-black" style={{color: theme.accent}}>{f.t}</p>
                <p className="mt-1 text-[12px] leading-5 text-white/55">{f.d}</p>
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
        <div><SubLabel theme={theme}>PROBLEM · 무엇이 문제였나</SubLabel><p className="text-base leading-8 text-white/85">{data.problem}</p></div>
        <div>
          <SubLabel theme={theme}>사용자 리서치</SubLabel>
          <div className="flex flex-col gap-2.5">
            {data.research.quotes.map((q) => <QuoteCard key={q.who} theme={theme} quote={q.q} who={q.who} />)}
            {data.research.stat ? (
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3" style={{borderColor: `${theme.primary}22`}}>
                <span className="font-mono text-2xl font-black" style={{color: theme.primary}}>{data.research.stat.n}</span>
                <span className="text-sm text-white/65">{data.research.stat.l}</span>
              </div>
            ) : null}
          </div>
        </div>
        {data.beforeCode ? (<><Divider /><div><SubLabel theme={theme}>기존 방식의 한계 (Before)</SubLabel><CodeBlock theme={theme} spec={data.beforeCode} /></div></>) : null}
        {data.beforeAfter ? (<div><SubLabel theme={theme}>핵심 전환 · Before → After</SubLabel><BeforeAfter theme={theme} ba={data.beforeAfter} /></div>) : null}
        <div>
          <SubLabel theme={theme}>가설</SubLabel>
          <div className="rounded-xl border-l-2 p-4" style={{borderColor: theme.primary, background: `${theme.primary}08`}}><p className="text-sm leading-7 text-white/80">{data.hypothesis}</p></div>
        </div>
      </div>
    );
  }

  // ── 접근 ──
  if (step === 2) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <div><SubLabel theme={theme}>PROCESS · 진행 과정</SubLabel><ProcessTimeline theme={theme} steps={data.process} /></div>
        <div><SubLabel theme={theme}>ARCHITECTURE · 구조</SubLabel><ArchDiagram theme={theme} layers={data.architecture} /></div>
        <Divider />
        <div><SubLabel theme={theme}>기술 의사결정 · 왜 이걸 골랐나</SubLabel><DecisionTable theme={theme} rows={data.decisions} /></div>
        <Divider />
        <div>
          <SubLabel theme={theme}>핵심 구현</SubLabel>
          <div className="flex flex-col gap-3">{data.coreCode.map((c) => <CodeBlock key={c.filename} theme={theme} spec={c} />)}</div>
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
            {data.work.map((group) => (
              <div key={group.g} className="rounded-lg border p-3" style={{borderColor: `${theme.primary}1a`}}>
                <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide" style={{color: theme.primary}}>{group.g}</p>
                {group.items.map((it) => (
                  <div key={it} className="mb-1 flex items-start gap-2"><span className="mt-0.5 font-mono text-xs" style={{color: theme.accent}}>✓</span><span className="text-[12px] leading-5 text-white/70">{it}</span></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Divider />
        <div>
          <SubLabel theme={theme}>가장 어려웠던 문제 · Challenge</SubLabel>
          <div className="flex flex-col gap-3">{data.challenges.map((c, i) => <ChallengeCard key={c.title} theme={theme} index={i + 1} c={c} />)}</div>
        </div>
        {data.perf ? (
          <div>
            <SubLabel theme={theme}>성능 개선 · 측정 기반</SubLabel>
            <div className="rounded-xl border p-4" style={{borderColor: `${theme.primary}22`}}>
              <CompareBars theme={theme} lowerBetter rows={data.perf.rows} />
              {data.perf.note ? <p className="mt-3 font-mono text-[11px] text-white/35">{"// "}{data.perf.note}</p> : null}
            </div>
          </div>
        ) : null}
        <div>
          <SubLabel theme={theme}>사용 기술</SubLabel>
          <div className="flex flex-wrap gap-2">{data.tech.map((t) => <span key={t} className="rounded-lg border px-3 py-1.5 font-mono text-sm font-bold" style={{borderColor: `${theme.primary}35`, color: theme.accent}}>{t}</span>)}</div>
        </div>
      </div>
    );
  }

  // ── 결과 ──
  return (
    <div className="flex flex-col gap-6 py-2">
      <div>
        <SubLabel theme={theme}>RESULT · 완성된 화면</SubLabel>
        <div className="grid gap-3 sm:grid-cols-2">{data.resultScreens.map((s) => <MockScreen key={s.title} theme={theme} spec={s} />)}</div>
      </div>
      <div>
        <SubLabel theme={theme}>성과 지표</SubLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.metrics.map((m) => (
            <div key={m.l} className="rounded-xl border p-4" style={{borderColor: `${theme.primary}22`}}>
              <p className="font-mono text-2xl font-black" style={{color: theme.primary}}>{m.n}</p>
              <p className="mt-1 text-[11px] leading-4 text-white/50">{m.l}</p>
            </div>
          ))}
        </div>
      </div>
      {data.usability ? (
        <div>
          <SubLabel theme={theme}>변화 · Before → After</SubLabel>
          <div className="rounded-xl border p-4" style={{borderColor: `${theme.primary}22`}}>
            <CompareBars theme={theme} lowerBetter={false} rows={data.usability.rows} />
            {data.usability.note ? <p className="mt-3 font-mono text-[11px] text-white/35">{"// "}{data.usability.note}</p> : null}
          </div>
        </div>
      ) : null}
      <Divider />
      <div>
        <SubLabel theme={theme}>회고 · KPT</SubLabel>
        <div className="grid gap-3 sm:grid-cols-3">
          {([["Keep", theme.primary, data.kpt.keep], ["Problem", "#f87171", data.kpt.problem], ["Try", "#fbbf24", data.kpt.try]] as const).map(([k, c, items]) => (
            <div key={k} className="rounded-xl border p-3" style={{borderColor: `${theme.primary}1a`}}>
              <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide" style={{color: c}}>{k}</p>
              {items.map((it) => <div key={it} className="mb-1.5 flex items-start gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{background: c}} /><span className="text-[12px] leading-5 text-white/65">{it}</span></div>)}
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel theme={theme}>배운 점</SubLabel>
        <div className="rounded-xl border-l-2 p-4" style={{borderColor: `${theme.primary}88`, background: `${theme.primary}08`}}><p className="text-sm leading-7 text-white/75">{data.learning}</p></div>
      </div>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <motion.a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="rounded-lg px-6 py-3 font-mono text-sm font-black" style={{background: theme.primary, color: theme.bg}} whileHover={{scale: 1.04, boxShadow: `0 0 24px ${theme.primary}55`}} whileTap={{scale: 0.97}}>{link.label} ↗</motion.a>
        ))}
      </div>
    </div>
  );
}
