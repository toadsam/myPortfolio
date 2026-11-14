/**
 * 프로젝트 상세 v4 — `/resume/<id>` 의 공용 틀.
 *
 * 득근득근 v4 시안(흰 바탕 · 파랑 하나 · 접힘)을 틀로 삼아 RICH_DATA 한 건을 그린다.
 * 규칙은 셋이다.
 * 1. RICH_DATA 의 글은 한 글자도 고치지 않는다. 문장 경계에서 잘라 "먼저 보일 것"과
 *    "접어 둘 것"만 나눈다. 접힌 글도 서버 HTML 에 그대로 들어 있다.
 * 2. 빠뜨리는 필드가 없다. 마을용 목업 화면(heroScreen · resultScreens)도 접어서 싣는다.
 * 3. 서버 컴포넌트다. 접기·등장 모션·목차 추적은 ProjectDetailV4Motion 이 DOM 에 붙인다.
 */

import {Fragment, type CSSProperties, type ReactNode} from "react";
import Link from "next/link";
import {Nunito} from "next/font/google";
import {RICH_DATA} from "@/components/ui/project-viewers/richContent/data";
import type {
  CodeSpec,
  ImgSpec,
  RichProject,
  SceneSpec,
  ScreenSpec,
  TimelineSpec
} from "@/components/ui/project-viewers/richContent/shared";
import type {DiagramSpec} from "@/components/ui/project-viewers/richContent/ArchitectureDiagram";
import {projects} from "@/data/projects";
import {
  CATEGORY_META,
  FACET_META,
  contact,
  hero,
  mainProjects
} from "@/data/resume";
import {ProjectDetailV4Motion} from "./ProjectDetailV4Motion";
import "./projectDetailV4.css";

// 숫자 전용 서체. 시안과 같은 Nunito 다.
const nunito = Nunito({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--pd4-num-font",
  display: "swap"
});

// ─── 문장 자르기 ─────────────────────────────────────────────────────────────

// 문단은 줄바꿈으로 나눈다.
function paragraphs(text: string | undefined): string[] {
  return String(text ?? "")
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// 한 문단을 문장으로 나눈다. 마침표·물음표·느낌표(닫는 따옴표·괄호 포함) 뒤에 공백이 올 때만 자른다.
// "1.0" "57.5ms" 처럼 뒤에 공백이 없는 점은 자르지 않는다. 글자는 버리지 않는다.
function sentencesOf(para: string): string[] {
  const out: string[] = [];
  const re = /[.!?](["”’)\]」』]*)(\s+)/g;
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(para))) {
    const before = para.slice(Math.max(0, m.index - 2), m.index);
    // "1. " 같은 목록 번호는 문장 끝이 아니다
    if (/(^|\s)\d$/.test(before)) continue;
    const end = m.index + 1 + m[1].length;
    out.push(para.slice(start, end).trim());
    start = end + m[2].length;
  }
  if (start < para.length) out.push(para.slice(start).trim());
  return out.filter(Boolean);
}

// 첫 n 문장과 나머지. 나머지는 문단 구분을 줄바꿈으로 지킨다.
function splitHead(
  text: string | undefined,
  n = 1
): {head: string; rest: string} {
  const ps = paragraphs(text);
  if (!ps.length) return {head: "", rest: ""};
  const first = sentencesOf(ps[0]);
  const head = first.slice(0, n).join(" ");
  const restFirst = first.slice(n).join(" ");
  const rest = [restFirst, ...ps.slice(1)].filter(Boolean).join("\n");
  return {head, rest};
}

// 첫 문장 · 가운데 · 마지막 문장. 트러블슈팅 카드의 "한 일 / 결과" 에 쓴다.
function splitEnds(text: string): {
  first: string;
  middle: string;
  last: string;
} {
  const ps = paragraphs(text);
  const all: {s: string; p: number}[] = [];
  ps.forEach((p, pi) => sentencesOf(p).forEach(s => all.push({s, p: pi})));
  if (all.length === 0) return {first: "", middle: "", last: ""};
  if (all.length === 1) return {first: all[0].s, middle: "", last: ""};
  const mid = all.slice(1, -1);
  // 가운데 문장은 원래 문단이 바뀌는 자리에서 줄을 바꾼다
  let middle = "";
  mid.forEach((x, i) => {
    if (i === 0) middle = x.s;
    else middle += (x.p !== mid[i - 1].p ? "\n" : " ") + x.s;
  });
  return {first: all[0].s, middle, last: all[all.length - 1].s};
}

// ─── 작은 부품 ───────────────────────────────────────────────────────────────

const Chev = (
  <svg className="p4-chev" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M5 8l5 5 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Out = (
  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M5 3h6v6M11 3L3.5 10.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function cssVars(v: Record<string, string | number>): CSSProperties {
  return v as unknown as CSSProperties;
}

// 비율 문자열("16/9")로 width/height 속성을 만든다. 레이아웃 흔들림 방지용이다.
function dims(ratio?: string): {width: number; height: number} {
  const m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(ratio || "16/9");
  if (!m) return {width: 1200, height: 675};
  return {
    width: 1200,
    height: Math.round((1200 * Number(m[2])) / Number(m[1]))
  };
}

// 숫자를 굴려 올리는 표기. 화면 낭독기는 원래 문자열을 읽는다.
function RollNum({value}: {value: string}) {
  return (
    <>
      <span className="p4-sr">{value}</span>
      <span aria-hidden="true">
        {Array.from(value).map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="p4-roll" data-d={ch}>
              <i style={{transform: `translateY(-${Number(ch) * 10}%)`}}>
                {"0123456789".split("").map(d => (
                  <b key={d}>{d}</b>
                ))}
              </i>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          )
        )}
      </span>
    </>
  );
}

// "9/16" 처럼 세로가 긴 비율인지
function isPortrait(ratio?: string) {
  const m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(ratio || "");
  return !!m && Number(m[1]) < Number(m[2]);
}

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

// ─── 화면 목업(마을용 heroScreen · resultScreens) ─────────────────────────────

function ScreenMock({s}: {s: ScreenSpec}) {
  const chart = s.chart;
  let points = "";
  if (chart && chart.length > 1) {
    const max = Math.max(...chart);
    const min = Math.min(...chart);
    const span = max - min || 1;
    points = chart
      .map(
        (v, i) =>
          `${((i / (chart.length - 1)) * 200).toFixed(1)},${(
            42 -
            ((v - min) / span) * 38
          ).toFixed(1)}`
      )
      .join(" ");
  }
  return (
    <div className="p4-mock">
      <div className="p4-mt">{s.title}</div>
      {s.titleText || s.subText ? (
        <div className="p4-mtitle">
          {s.titleText ? <b>{s.titleText}</b> : null}
          {s.subText ? <span>{s.subText}</span> : null}
        </div>
      ) : null}
      {s.kpi?.length ? (
        <div className="p4-kpi">
          {s.kpi.map((k, i) => (
            <div key={i}>
              <b>{k.v}</b>
              {k.l}
            </div>
          ))}
        </div>
      ) : null}
      {points ? (
        <svg viewBox="0 0 200 46" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={points} />
        </svg>
      ) : null}
      {s.bars?.length
        ? s.bars.map((b, i) => (
            <div key={i} className="p4-mbar">
              <span>{b.l}</span>
              <i>
                <b style={{width: `${Math.max(0, Math.min(100, b.p))}%`}} />
              </i>
              <span>{b.v ?? ""}</span>
            </div>
          ))
        : null}
      {s.cards?.length ? (
        <div className="p4-mcards">
          {s.cards.map((c, i) => (
            <div key={i}>
              <b>{c.l}</b>
              {c.sub ?? ""}
            </div>
          ))}
        </div>
      ) : null}
      {s.feed?.length ? (
        <div className="p4-mfeed">
          {s.feed.map((f, i) => (
            <div key={i}>{f}</div>
          ))}
        </div>
      ) : null}
      {s.stats?.length ? (
        <div className="p4-mstats">
          {s.stats.map((x, i) => (
            <div key={i}>
              <b>{x.n}</b>
              {x.l}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── 다이어그램 ──────────────────────────────────────────────────────────────

function DiagramSvg({d, mid}: {d: DiagramSpec; mid: string}) {
  const [w, h] = d.viewBox;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={d.title || d.caption}>
      <defs>
        <marker
          id={mid}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="#7d8694" />
        </marker>
      </defs>
      {(d.groups ?? []).map((g, i) => (
        <g key={`g${i}`}>
          <rect
            className={`p4-dg-group${g.dashed ? " p4-dashed" : ""}`}
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx={18}
          />
          <text className="p4-dg-glabel" x={g.x + 16} y={g.y - 10}>
            {g.label}
          </text>
        </g>
      ))}
      {d.edges.map((e, k) => {
        const [x1, y1] = e.from;
        const [x2, y2] = e.to;
        const path =
          e.bendX === undefined
            ? `M ${x1} ${y1} L ${x2} ${y2}`
            : `M ${x1} ${y1} H ${e.bendX} V ${y2} H ${x2}`;
        let lx = 0;
        let ly = 0;
        if (e.label) {
          if (e.labelAt) {
            lx = e.labelAt[0];
            ly = e.labelAt[1] + (e.labelDy ?? 0);
          } else {
            lx = x1 + (x2 - x1) * 0.5;
            ly = y1 + (y2 - y1) * 0.5 + (e.labelDy ?? -8);
          }
        }
        return (
          <g key={`e${k}`}>
            <path
              className={`p4-dg-edge${e.kind === "dashed" ? " p4-dashed" : ""}`}
              d={path}
              markerEnd={`url(#${mid})`}
              markerStart={e.kind === "double" ? `url(#${mid})` : undefined}
            />
            {e.label ? (
              <text className="p4-dg-elabel" x={lx} y={ly} textAnchor="middle">
                {e.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {d.nodes.map((n, k) => {
        const lines: [string, string][] = [["", n.label]];
        if (n.note) lines.push(["p4-note", n.note]);
        if (n.sub) lines.push(["p4-subt", n.sub]);
        const lh = [22, 17, 17];
        const tot = lines.reduce((a, _l, j) => a + lh[j], 0);
        let y = n.y + n.h / 2 - tot / 2 + 16;
        return (
          <g
            key={n.id || `n${k}`}
            className={`p4-dg-node${n.accent ? " p4-accent" : ""}`}
            style={cssVars({"--i": k})}
          >
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={16} />
            {lines.map((l, j) => {
              const el = (
                <text
                  key={j}
                  className={l[0] || undefined}
                  x={n.x + n.w / 2}
                  y={y}
                  textAnchor="middle"
                >
                  {l[1]}
                </text>
              );
              y += lh[j + 1] ?? 17;
              return el;
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 본체 ────────────────────────────────────────────────────────────────────

interface Sec {
  id: string;
  title: string;
  folded: boolean;
}

// draft 를 주면 RICH_DATA 대신 그 데이터로 그린다(확정 전 시안을 따로 띄워 볼 때 쓴다).
export function ProjectDetailV4({
  id,
  draft
}: {
  id: string;
  draft?: RichProject;
}) {
  const r: RichProject | undefined = draft ?? RICH_DATA[id];
  if (!r) return null;
  const project = projects.find(p => p.id === id);
  const card = mainProjects.find(c => c.richId === id || c.id === id);
  const title = project?.title ?? card?.title ?? id;
  const rootId = `pd4-${id}`;

  // 페이지 안에서 겹치지 않는 id
  let seq = 0;
  const nid = (p: string) => `${rootId}-${p}${++seq}`;

  // 문장 접기. 블록용(div)과 줄 안 용(span)을 나눈다 — <p> 안에 <div> 가 들어가면 HTML 이 깨진다.
  const XFold = (label: string, body: ReactNode) => {
    const fid = nid("xf");
    return (
      <div className="p4-xf p4-blk">
        <button
          type="button"
          className="p4-xf-btn"
          aria-expanded="false"
          aria-controls={fid}
          data-l={label}
        >
          <span className="p4-lbl">{label}</span>
          {Chev}
        </button>
        <div className="p4-fold-b" id={fid}>
          <div className="p4-fold-in">
            <div className="p4-xf-in">{body}</div>
          </div>
        </div>
      </div>
    );
  };
  // 접힌 글이 두 줄(120자) 안쪽이고 문단이 하나면 접지 않고 그냥 보여 준다(2026-11-13).
  // 한 줄 보자고 누르게 하는 건 읽는 사람 비용만 얹는다. "원래 문장 보기"·"출처 더 보기"처럼
  // 근거를 꺼내 보는 접기는 라벨이 달라서 그대로 접힌다.
  const SHORT_REST = 120;
  const isShortRest = (text: string) =>
    text.trim().length < SHORT_REST && paragraphs(text).length <= 1;
  const XFoldInline = (label: string, text: string) => {
    if (label === "자세히" && isShortRest(text)) return <> {text}</>;
    const fid = nid("xi");
    return (
      <span className="p4-xf p4-inl">
        <button
          type="button"
          className="p4-xf-btn"
          aria-expanded="false"
          aria-controls={fid}
          data-l={label}
        >
          <span className="p4-lbl">{label}</span>
          {Chev}
        </button>
        <span className="p4-fold-b" id={fid}>
          <span className="p4-fold-in">
            <span className="p4-xf-in">
              {paragraphs(text).map((p, i) => (
                <span key={i} className="p4-para">
                  {p}
                </span>
              ))}
            </span>
          </span>
        </span>
      </span>
    );
  };
  const Paras = ({text}: {text: string}) => (
    <>
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
  // 첫 문장만 보이고 나머지는 줄 안 "자세히". span 안에 둔다.
  const HeadInline = (text: string | undefined, n = 1, label = "자세히") => {
    const {head, rest} = splitHead(text, n);
    return (
      <>
        {head}
        {rest ? XFoldInline(label, rest) : null}
      </>
    );
  };

  const CodeWin = (cd: CodeSpec, open: boolean) => {
    const hi = cd.highlightLines ?? [];
    return (
      <>
        {cd.caption ? <p className="p4-code-cap">{cd.caption}</p> : null}
        <details className="p4-codefold" open={open || undefined}>
          <summary>
            <span className="p4-sumrow">
              코드 보기 <span>{cd.filename}</span>
              {Chev}
            </span>
            <span className="p4-peek" aria-hidden="true">
              {cd.lines.slice(0, 2).map((l, i) => (
                <span key={i}>
                  {l.length > 40 ? `${l.slice(0, 40)}…` : l || " "}
                </span>
              ))}
            </span>
          </summary>
          <div className="p4-code">
            <div className="p4-bar">{cd.filename}</div>
            <pre>
              {cd.lines.map((l, i) => (
                <div
                  key={i}
                  className={hi.includes(i + 1) ? "p4-ln p4-hi" : "p4-ln"}
                  style={cssVars({"--i": i})}
                >
                  <span>{i + 1}</span>
                  <span>{l}</span>
                </div>
              ))}
            </pre>
          </div>
        </details>
      </>
    );
  };

  // 그림 한 장. 제목 + 캡션 첫 문장이 보이고, 나머지 캡션은 "자세히" 와 크게 보기 창에서 읽힌다.
  const Figure = (im: ImgSpec | undefined, cls = "", wide = false) => {
    if (!im) return null;
    const {head, rest} = splitHead(im.caption, 1);
    const classes = [
      cls,
      im.wide || wide ? "p4-wide" : "",
      im.fit === "contain" ? "p4-contain-fig" : "",
      isPortrait(im.ratio) ? "p4-portrait" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const d = dims(im.ratio);
    return (
      <figure className={classes}>
        {im.src ? (
          <button
            type="button"
            className="p4-zoom"
            style={{aspectRatio: im.ratio || "16/9"}}
            data-zoom=""
            data-title={im.label}
            data-cap={im.caption ?? ""}
            aria-label={`${im.label} 크게 보기`}
          >
            <img
              src={im.src}
              alt={im.label}
              width={d.width}
              height={d.height}
              loading="lazy"
            />
          </button>
        ) : (
          <div className="p4-zoom" style={{aspectRatio: im.ratio || "16/9"}}>
            <span className="p4-placeholder">{im.label}</span>
          </div>
        )}
        <figcaption>
          <b>{im.label}</b>
          {head}
          {rest ? XFoldInline("자세히", rest) : null}
        </figcaption>
      </figure>
    );
  };

  // 타일 숫자 옆 작은 그림. 값은 데이터에서, 움직임은 .p4-in 이 켜질 때 CSS 가.
  const Mini = (m: RichProject["metrics"][number]["mini"]) => {
    if (!m) return null;
    if (m.kind === "bars") {
      const max = Math.max(m.before, m.after) || 1;
      return (
        <span className="p4-mini p4-mbars" aria-hidden="true">
          <i>
            <b style={cssVars({"--w": (m.before / max).toFixed(3)})} />
          </i>
          <i>
            <b
              className="p4-b2"
              style={cssVars({"--w": (m.after / max).toFixed(3)})}
            />
          </i>
        </span>
      );
    }
    if (m.kind === "dots") {
      return (
        <span className="p4-mini p4-mdots" aria-hidden="true">
          {Array.from({length: m.of}).map((_, i) => (
            <i
              key={i}
              className={i < m.on ? "p4-on" : undefined}
              style={cssVars({"--i": i})}
            />
          ))}
        </span>
      );
    }
    const pts = m.points;
    if (pts.length < 2) return null;
    const max = Math.max(...pts, m.base ?? 0) || 1;
    const W = 110;
    const H = 30;
    const xy = pts.map(
      (v, i) =>
        [(i / (pts.length - 1)) * W, H - (v / max) * (H - 4) + 2] as const
    );
    const last = xy[xy.length - 1];
    return (
      <svg
        className="p4-mini p4-mline"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        {m.base !== undefined ? (
          <line
            className="p4-base"
            x1={0}
            x2={W}
            y1={H - (m.base / max) * (H - 4) + 2}
            y2={H - (m.base / max) * (H - 4) + 2}
          />
        ) : null}
        <polyline points={xy.map(p => `${p[0]},${p[1]}`).join(" ")} />
        <circle cx={last[0]} cy={last[1]} r={3} />
      </svg>
    );
  };

  const PerfBlock = (
    pf: {
      rows: {label: string; before: number; after: number; unit: string}[];
      note?: string;
      lowerBetter?: boolean;
    },
    heading: string
  ) => (
    <div className="p4-perf p4-rv">
      <h3>{heading}</h3>
      <p className="p4-perf-hint">
        {pf.lowerBetter === false ? "클수록 좋습니다" : "낮을수록 좋습니다"}
      </p>
      {pf.rows.map((row, i) => {
        const max = Math.max(row.before, row.after) || 1;
        const ratio =
          row.before > 0 && row.after > 0
            ? pf.lowerBetter === false
              ? row.after / row.before
              : row.before / row.after
            : 0;
        return (
          <div key={i} className="p4-row">
            <span>
              {row.label}
              {ratio >= 1.05 ? (
                <b className="p4-ratio">
                  ×{ratio.toFixed(ratio >= 10 ? 0 : 1)}
                </b>
              ) : null}
            </span>
            <span className="p4-bars">
              <span className="p4-b">
                <span className="p4-bk">전</span>
                <i>
                  <b style={cssVars({"--w": (row.before / max).toFixed(4)})} />
                </i>
                <span className="p4-bv">
                  {row.before}
                  {row.unit}
                </span>
              </span>
              <span className="p4-b p4-after">
                <span className="p4-bk">후</span>
                <i>
                  <b style={cssVars({"--w": (row.after / max).toFixed(4)})} />
                </i>
                <span className="p4-bv">
                  {row.after}
                  {row.unit}
                </span>
              </span>
            </span>
          </div>
        );
      })}
      {pf.note ? <p className="p4-note">{pf.note}</p> : null}
    </div>
  );

  // ─── 장면(scene) ─────────────────────────────────────────────────────────────
  // 글로 적힌 사실 하나를 움직이는 그림 하나로. 누르면 다시 재생(Motion 의 data-scene).

  const SceneBox = (
    cls: string,
    title: string,
    children: ReactNode,
    note?: string,
    source?: string
  ) => (
    <div
      className={`p4-scene ${cls} p4-rv`}
      data-scene=""
      tabIndex={0}
      role="group"
      aria-label={title}
    >
      <div className="p4-scene-h">
        <h3>{title}</h3>
        <span className="p4-replay" aria-hidden="true">
          다시 보기
        </span>
      </div>
      {children}
      {note ? <p className="p4-note">{note}</p> : null}
      {source ? <p className="p4-src">출처: {source}</p> : null}
    </div>
  );

  // 시간표. "HH:MM" 또는 "YYYY-MM-DD" 를 축 위 비율로 놓는다. 끝을 모르는 구간은 축 끝까지 빗금.
  const SceneTimeline = (tl: TimelineSpec) => {
    const isDate = tl.unit === "date" || /^\d{4}-\d{2}-\d{2}$/.test(tl.from);
    const val = (x: string) => {
      if (isDate) {
        const [y, m, d] = x.split("-").map(Number);
        return Date.UTC(y, (m || 1) - 1, d || 1) / 86400000;
      }
      const [h, m] = x.split(":").map(Number);
      return h * 60 + (m || 0);
    };
    const a = val(tl.from);
    const b = val(tl.to);
    const pct = (x: string) =>
      Math.max(0, Math.min(100, ((val(x) - a) / (b - a || 1)) * 100));
    const ticks: {label: string; at: number}[] = [];
    if (isDate) {
      // 달 단위 눈금
      const [y0, m0] = tl.from.split("-").map(Number);
      const [y1, m1] = tl.to.split("-").map(Number);
      for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); ) {
        const key = `${y}-${String(m).padStart(2, "0")}-01`;
        ticks.push({label: `${y}.${String(m).padStart(2, "0")}`, at: pct(key)});
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
    } else {
      for (let h = Math.ceil(a / 60); h * 60 <= b; h++) {
        const key = `${String(h).padStart(2, "0")}:00`;
        ticks.push({label: key, at: pct(key)});
      }
    }
    const spans = tl.events.filter(e => e.until || e.tone === "fail");
    const dots = tl.events.filter(e => !(e.tone === "fail" && !e.until));
    const totalN = (tl.totals ?? []).reduce((s, t) => s + t.n, 0) || 1;
    const fmt = (x: string) =>
      isDate ? x.replace(/^\d{4}-/, "").replace("-", ".") : x;
    return SceneBox(
      "p4-tl-scene",
      tl.title,
      <>
        <div className="p4-tl-axis" aria-hidden="true">
          {ticks.map(t => (
            <span
              key={t.label}
              className="p4-tl-tick"
              style={{left: `${t.at}%`}}
            >
              {t.label}
            </span>
          ))}
          <i className="p4-tl-track" />
          {spans.map((e, i) => (
            <i
              key={`s${i}`}
              className={`p4-tl-span p4-${e.tone ?? "ok"}${
                e.until ? "" : " p4-open-end"
              }`}
              style={cssVars({
                left: `${pct(e.at)}%`,
                width: `${(e.until ? pct(e.until) : 100) - pct(e.at)}%`,
                "--i": i
              })}
            />
          ))}
          {dots.map((e, i) => (
            <i
              key={`d${i}`}
              className={`p4-tl-dot p4-${e.tone ?? "ok"}`}
              style={cssVars({left: `${pct(e.at)}%`, "--i": i})}
            />
          ))}
        </div>
        <ol className="p4-tl-list">
          {tl.events.map((e, i) => (
            <li
              key={i}
              className={`p4-${e.tone ?? "ok"}`}
              style={cssVars({"--i": i})}
            >
              <b>
                {fmt(e.at)}
                {e.until ? `–${fmt(e.until)}` : ""}
              </b>
              <span>
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noopener noreferrer">
                    {e.label}
                    {Out}
                  </a>
                ) : (
                  e.label
                )}
                {e.detail ? <small>{e.detail}</small> : null}
              </span>
            </li>
          ))}
        </ol>
        {tl.totals?.length ? (
          <div className="p4-tl-tot" aria-label="합계">
            <i className="p4-tl-bar">
              {tl.totals.map((t, i) => (
                <b
                  key={i}
                  className={`p4-${t.tone}`}
                  style={cssVars({"--w": (t.n / totalN).toFixed(3)})}
                />
              ))}
            </i>
            <span className="p4-tl-legend">
              {tl.totals.map((t, i) => (
                <span key={i} className={`p4-${t.tone}`}>
                  <i />
                  {t.label} <b>{t.n.toLocaleString("ko-KR")}</b>
                </span>
              ))}
            </span>
          </div>
        ) : null}
      </>,
      tl.note,
      tl.source
    );
  };

  // 가로 막대 여러 줄. 왼쪽부터 자란다.
  const SceneBars = (sc: Extract<SceneSpec, {kind: "bars"}>) => {
    const max = sc.max ?? Math.max(...sc.rows.map(r => r.value), 1);
    return SceneBox(
      "p4-bars-scene",
      sc.title,
      <div className="p4-hbars">
        {sc.rows.map((row, i) => (
          <div
            key={i}
            className={`p4-hrow p4-${row.tone ?? "ok"}`}
            style={cssVars({"--i": i})}
          >
            <span className="p4-hl2">{row.label}</span>
            <i>
              <b
                style={cssVars({
                  "--w": Math.max(0, Math.min(1, row.value / max)).toFixed(4)
                })}
              />
            </i>
            <span className="p4-hv">
              {row.text ??
                `${row.value.toLocaleString("ko-KR")}${sc.unit ?? ""}`}
            </span>
          </div>
        ))}
      </div>,
      sc.note,
      sc.source
    );
  };

  // 꺾은선. y 가 null 인 지점은 선을 끊는다 — 없는 값을 이어 그리지 않는다.
  const SceneLine = (sc: Extract<SceneSpec, {kind: "line"}>) => {
    const W = 600;
    const H = 200;
    const padL = 44;
    const padR = 20;
    const padT = 18;
    const padB = 34;
    const ys = sc.points.map(p => p.y).filter((y): y is number => y !== null);
    const max = Math.max(...ys, 1);
    const n = sc.points.length;
    const px = (i: number) =>
      padL + (i / Math.max(1, n - 1)) * (W - padL - padR);
    const py = (y: number) => padT + (1 - y / max) * (H - padT - padB);
    // 연속 구간마다 polyline 하나
    const segs: string[] = [];
    let cur: string[] = [];
    sc.points.forEach((p, i) => {
      if (p.y === null) {
        if (cur.length) segs.push(cur.join(" "));
        cur = [];
      } else cur.push(`${px(i).toFixed(1)},${py(p.y).toFixed(1)}`);
    });
    if (cur.length) segs.push(cur.join(" "));
    const grid = [0, 0.5].map(f => max * f);
    return SceneBox(
      "p4-line-scene",
      sc.title,
      <svg
        className="p4-lsvg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={sc.title}
      >
        {grid.map((g, i) => (
          <g key={i}>
            <line
              className="p4-lgrid"
              x1={padL}
              x2={W - padR}
              y1={py(g)}
              y2={py(g)}
            />
            <text
              className="p4-lax"
              x={padL - 8}
              y={py(g) + 4}
              textAnchor="end"
            >
              {Number.isInteger(g) ? g : g.toFixed(1)}
              {sc.unit ?? ""}
            </text>
          </g>
        ))}
        {segs.map((d, i) => (
          <polyline key={i} className="p4-lpath" points={d} />
        ))}
        {sc.points.map((p, i) =>
          p.y === null ? (
            <text
              key={i}
              className="p4-lgap"
              x={px(i)}
              y={py(max / 2)}
              textAnchor="middle"
            >
              값 없음
            </text>
          ) : (
            <g key={i} className="p4-lpt" style={cssVars({"--i": i})}>
              <circle cx={px(i)} cy={py(p.y)} r={5} />
              <text x={px(i)} y={py(p.y) - 12} textAnchor="middle">
                {p.y}
                {sc.unit ?? ""}
              </text>
            </g>
          )
        )}
        {sc.points.map((p, i) => (
          <text
            key={`x${i}`}
            className="p4-lax"
            x={px(i)}
            y={H - 10}
            textAnchor="middle"
          >
            {p.x}
          </text>
        ))}
      </svg>,
      sc.note,
      sc.source
    );
  };

  // 프레임 넘겨 보기. 손잡이(range)로 같은 장면의 시간 경과를 본다.
  const SceneFrames = (sc: Extract<SceneSpec, {kind: "frames"}>) => {
    const d = dims(sc.ratio);
    return SceneBox(
      "p4-frames-scene",
      sc.title,
      <>
        <div
          className="p4-frames"
          style={{
            aspectRatio: sc.ratio || "16/9",
            maxWidth: sc.maxWidth ? `${sc.maxWidth}px` : undefined,
            marginInline: sc.maxWidth ? "auto" : undefined
          }}
          data-frames={sc.frames.length}
        >
          {sc.frames.map((f, i) => (
            <img
              key={i}
              src={f.src}
              alt={f.label}
              width={d.width}
              height={d.height}
              loading="lazy"
              className={i === 0 ? "p4-on" : undefined}
              data-frame={i}
            />
          ))}
          <span className="p4-frame-at" data-frame-at="">
            {sc.frames[0]?.at ?? ""}
          </span>
        </div>
        <div className="p4-frames-ctl">
          <input
            type="range"
            min={0}
            max={sc.frames.length - 1}
            defaultValue={0}
            step={1}
            aria-label="프레임"
            data-frame-range=""
          />
          <ol className="p4-frames-labels">
            {sc.frames.map((f, i) => (
              <li
                key={i}
                className={i === 0 ? "p4-on" : undefined}
                data-frame-label={i}
              >
                {f.at ? <b>{f.at}</b> : null}
                {f.label}
              </li>
            ))}
          </ol>
        </div>
      </>,
      sc.note,
      sc.source
    );
  };

  // 단계 흐름. alt 는 그 단계에서 갈라지는 길(폴백·실패).
  const SceneSteps = (sc: Extract<SceneSpec, {kind: "steps"}>) =>
    SceneBox(
      "p4-steps-scene",
      sc.title,
      <ol className="p4-flow">
        {sc.steps.map((st, i) => (
          <li
            key={i}
            className={`p4-${st.tone ?? "ok"}`}
            style={cssVars({"--i": i})}
          >
            <div className="p4-flow-main">
              <b>{st.t}</b>
              {st.d ? <span>{st.d}</span> : null}
            </div>
            {st.alt ? (
              <div className={`p4-flow-alt p4-${st.alt.tone ?? "muted"}`}>
                <b>{st.alt.t}</b>
                {st.alt.d ? <span>{st.alt.d}</span> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>,
      sc.note,
      sc.source
    );

  // 3×3 퍼즐. 표지판 패턴을 보고 발판을 맞춘다. 동작은 Motion 이 붙인다.
  // `lines` 가 있으면 실제 게임 규칙이다: 칸을 직접 누르지 않고 가로줄 · 세로줄 버튼을 밟아 세 칸씩 넘긴다.
  const ScenePuzzle = (sc: Extract<SceneSpec, {kind: "puzzle"}>) => {
    const n = sc.size;
    const first = sc.patterns[0] ?? [];
    const ln = sc.lines;
    const idx = Array.from({length: n * n}, (_, i) => i);
    const rowCells = (r: number) => idx.filter(i => Math.floor(i / n) === r);
    const colCells = (c: number) => idx.filter(i => i % n === c);
    return SceneBox(
      "p4-puzzle-scene",
      sc.title,
      <div
        className={`p4-puzzle${ln ? " p4-pz-lines" : ""}`}
        data-puzzle=""
        data-patterns={JSON.stringify(sc.patterns)}
        data-interval={sc.demoInterval ?? 8}
        data-size={n}
        {...(ln
          ? {
              "data-states": ln.states.length,
              "data-start": ln.start,
              "data-solved": ln.solved
            }
          : {})}
      >
        <div className="p4-pz-col">
          <span className="p4-pz-lab">표지판 · 정답 패턴</span>
          <div
            className="p4-pz-grid p4-pz-sign"
            style={cssVars({"--n": n})}
            data-pz-sign=""
          >
            {idx.map(i => (
              <i key={i} className={`p4-b${first[i] ?? 0}`} />
            ))}
          </div>
          <span className="p4-pz-timer">
            <i data-pz-timer="" />
          </span>
          <span className="p4-pz-note">
            실제 게임은 {sc.interval}초마다 교체 · 여기서는{" "}
            {sc.demoInterval ?? 8}초
          </span>
        </div>
        <div className="p4-pz-col">
          <span className="p4-pz-lab">
            {ln
              ? "발판 · 줄 버튼을 눌러 세 칸씩 넘기기"
              : "발판 · 눌러서 바꾸기"}
          </span>
          {ln ? (
            <div
              className="p4-pz-grid p4-pz-board p4-pz-withlines"
              style={cssVars({"--n": n + 1})}
              data-pz-board=""
            >
              {Array.from({length: n}).map((_, r) => (
                <Fragment key={r}>
                  {rowCells(r).map(i => (
                    <i key={i} className={`p4-b${ln.start}`} data-pz-cell={i} />
                  ))}
                  <button
                    type="button"
                    className="p4-pz-line"
                    data-pz-line={rowCells(r).join(",")}
                    aria-label={`가로 ${r + 1}번째 줄 넘기기`}
                  >
                    ←
                  </button>
                </Fragment>
              ))}
              {Array.from({length: n}).map((_, c) => (
                <button
                  key={c}
                  type="button"
                  className="p4-pz-line"
                  data-pz-line={colCells(c).join(",")}
                  aria-label={`세로 ${c + 1}번째 줄 넘기기`}
                >
                  ↑
                </button>
              ))}
              <button
                type="button"
                className="p4-pz-line p4-pz-reset"
                data-pz-reset=""
                aria-label="전부 빈칸으로"
              >
                리셋
              </button>
            </div>
          ) : (
            <div
              className="p4-pz-grid p4-pz-board"
              style={cssVars({"--n": n})}
              data-pz-board=""
            >
              {idx.map(i => (
                <button
                  key={i}
                  type="button"
                  className="p4-b0"
                  data-pz-cell={i}
                  aria-label={`발판 ${i + 1}`}
                />
              ))}
            </div>
          )}
          <span className="p4-pz-legend">
            {ln ? (
              ln.states.map((x, i) => (
                <Fragment key={i}>
                  <i className={`p4-b${i}`} /> {x}{" "}
                </Fragment>
              ))
            ) : (
              <>
                <i className="p4-b0" /> {sc.legend[0]} <i className="p4-b1" />{" "}
                {sc.legend[1]}
              </>
            )}
          </span>
          <span className="p4-pz-result" data-pz-result="" aria-live="polite" />
        </div>
      </div>,
      [sc.caveat, sc.note].filter(Boolean).join(" "),
      sc.source
    );
  };

  const Scene = (sc: SceneSpec, i: number) => {
    const key = `${sc.place}${i}`;
    switch (sc.kind) {
      case "timeline":
        return <Fragment key={key}>{SceneTimeline({...sc})}</Fragment>;
      case "bars":
        return <Fragment key={key}>{SceneBars(sc)}</Fragment>;
      case "line":
        return <Fragment key={key}>{SceneLine(sc)}</Fragment>;
      case "frames":
        return <Fragment key={key}>{SceneFrames(sc)}</Fragment>;
      case "steps":
        return <Fragment key={key}>{SceneSteps(sc)}</Fragment>;
      case "puzzle":
        return <Fragment key={key}>{ScenePuzzle(sc)}</Fragment>;
      default:
        return null;
    }
  };
  // 줄인 배치(detail.compact). 대표 장면 하나는 머리로 올라가므로 제자리에서는 뺀다.
  const compact = r.detail?.compact;
  const story = r.detail?.story;
  const featured = compact?.scene
    ? (r.detail?.scenes ?? []).find(x => x.title === compact.scene)
    : undefined;
  const ScenesAt = (place: SceneSpec["place"]) => {
    const list = (r.detail?.scenes ?? []).filter(
      x => x.place === place && x !== featured
    );
    return list.length ? <>{list.map(Scene)}</> : null;
  };

  // 전/후 슬라이더. 사진 둘이 있을 때만. 손잡이는 Motion 이 움직인다.
  const Compare = () => {
    const ba = r.beforeAfter!;
    const [t0, t1] = r.detail?.compareTags ?? ["BEFORE", "AFTER"];
    const sh0 = ba.before.shot!;
    const sh1 = ba.after.shot!;
    const ratio = sh0.ratio || sh1.ratio || "16/9";
    const d = dims(ratio);
    // 세로 사진(폰 화면)은 폭이 420px 이 한계라 오른쪽이 빈다. 그 자리에 설명을 세운다(2026-11-13).
    const portrait = isPortrait(ratio);
    return (
      <div
        className={`p4-scene p4-cmp p4-rv${portrait ? " p4-cmp-portrait" : ""}`}
        data-scene=""
        data-cmp=""
        role="group"
        aria-label="전과 후 비교"
      >
        <div className="p4-cmp-grid">
          <div className="p4-cmp-main">
            <div className="p4-cmp-tabs" role="tablist" aria-label="전후 보기">
              <button type="button" role="tab" data-pos="0">
                {t0}
              </button>
              <button
                type="button"
                role="tab"
                data-pos="50"
                aria-selected="true"
              >
                반반
              </button>
              <button type="button" role="tab" data-pos="100">
                {t1}
              </button>
            </div>
            <div className="p4-cmp-box" style={{aspectRatio: ratio}}>
              <div className="p4-cmp-under">
                <img src={sh0.src} alt={sh0.label} {...d} loading="lazy" />
                <span className="p4-cmp-lab">
                  {t0} · {ba.before.label}
                </span>
              </div>
              <div className="p4-cmp-over">
                <img src={sh1.src} alt={sh1.label} {...d} loading="lazy" />
                <span className="p4-cmp-lab p4-r">
                  {t1} · {ba.after.label}
                </span>
              </div>
              <div
                className="p4-cmp-handle"
                role="slider"
                aria-label="전후 비율"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={50}
                tabIndex={0}
              >
                <i>⇆</i>
              </div>
            </div>
          </div>
          <div className="p4-cmp-side">
            <div className="p4-cmp-notes">
              <div>
                <span className="p4-lbl">{t0}</span>
                {compact ? null : (
                  <strong className="p4-h">{ba.before.label}</strong>
                )}
                {ba.before.note ? <p>{HeadInline(ba.before.note)}</p> : null}
              </div>
              <div>
                <span className="p4-lbl">{t1}</span>
                {compact ? null : (
                  <strong className="p4-h">{ba.after.label}</strong>
                )}
                {ba.after.note ? <p>{HeadInline(ba.after.note)}</p> : null}
              </div>
            </div>
            <p className="p4-src">
              {sh0.label} / {sh1.label}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const canSlide = !!(
    r.beforeAfter?.before.shot?.src && r.beforeAfter?.after.shot?.src
  );

  const sections: Sec[] = [];
  const body: ReactNode[] = [];

  const Section = (
    sid: string,
    eyebrow: string,
    heading: string,
    lead: string,
    content: ReactNode
  ) => {
    // 줄인 배치에서는 열려 있던 절도 접힌 절로 그린다. 한 줄 요약은 compact.summaries 에서.
    if (compact) {
      const k = sid.slice(rootId.length + 1) as keyof NonNullable<
        typeof compact.summaries
      >;
      return FoldSection(
        sid,
        eyebrow,
        heading,
        compact.summaries?.[k] ?? lead,
        content
      );
    }
    sections.push({id: sid, title: heading, folded: false});
    return (
      <section key={sid} className="p4-sec" id={sid}>
        <p className="p4-eyebrow p4-rv">{eyebrow}</p>
        <h2 className="p4-sec-h p4-rv">{heading}</h2>
        {lead ? <p className="p4-sec-p p4-rv">{lead}</p> : null}
        <div className="p4-sec-body">{content}</div>
      </section>
    );
  };
  const FoldSection = (
    sid: string,
    eyebrow: string,
    heading: string,
    summary: string,
    content: ReactNode,
    tocTitle?: string
  ) => {
    sections.push({id: sid, title: tocTitle ?? heading, folded: true});
    return (
      <section key={sid} className="p4-sec p4-fold" id={sid} data-fold="1">
        <button
          type="button"
          className="p4-fold-h"
          aria-expanded="false"
          aria-controls={`${sid}-b`}
        >
          <span>
            <span className="p4-eyebrow">{eyebrow}</span>
            <span className="p4-sec-h">{heading}</span>
            {summary ? <span className="p4-fold-sum">{summary}</span> : null}
          </span>
          {Chev}
        </button>
        <div className="p4-fold-b" id={`${sid}-b`}>
          <div className="p4-fold-in">
            <div className="p4-sec-body">{content}</div>
          </div>
        </div>
      </section>
    );
  };

  // ── 0. 머리 ──
  const links: {label: string; href: string}[] = [];
  const seen = new Set<string>();
  const addLink = (label: string, href?: string) => {
    // PR·커밋 링크는 머리에 두지 않는다(2026-11-13). 설명 없이 보면 뭔지 모르는 화면이라
    // 눌러 볼 이유가 있는 자리(시간표 장면의 사건 줄, 근거 칸)에만 둔다.
    if (!href || seen.has(href) || href.startsWith("mailto:")) return;
    if (/\bPR\b/.test(label) || /\/pull\/\d+|\/commit\//.test(href)) return;
    seen.add(href);
    links.push({label, href});
  };
  (project?.links ?? []).forEach(l => addLink(l.label, l.href));
  (card?.links ?? []).forEach(l => addLink(l.label, l.href));
  addLink("서비스 열기", r.demo.live);
  addLink(
    r.demo.videoLen ? `시연 영상 · ${r.demo.videoLen}` : "시연 영상",
    r.demo.video
  );
  addLink("GitHub", r.demo.repo);
  const videoLenShown =
    !r.demo.videoLen || links.some(l => l.label.includes(r.demo.videoLen!));

  const chips: {t: string; ok?: boolean}[] = [];
  if (card) {
    chips.push({t: card.status, ok: true});
    if (card.renewed) chips.push({t: `${card.renewed} 리뉴얼`, ok: true});
    if (card.period) chips.push({t: card.period});
    if (card.team) chips.push({t: card.team});
  }
  const titleNode = (() => {
    const m = /^(.*?)(\s*\([^)]*\))(.*)$/.exec(title);
    if (!m) return title;
    return (
      <>
        {m[1]}
        <em>{m[2]}</em>
        {m[3]}
      </>
    );
  })();
  // 소개문: 손으로 쓴 칸(detail.intro)이 있으면 그것, 없으면 projects.ts 설명 두 문장.
  const dIntro = r.detail?.intro;
  const intro = dIntro
    ? {head: dIntro.show, rest: ""}
    : splitHead(project?.description ?? "", 2);
  // show 안의 bold 문장만 굵게. 득근득근의 boldIn 과 같다.
  const BoldIn = ({text, bold}: {text: string; bold?: string}) => {
    if (!bold) return <>{text}</>;
    const at = text.indexOf(bold);
    if (at < 0) return <>{text}</>;
    return (
      <>
        {text.slice(0, at)}
        <strong className="p4-key">{bold}</strong>
        {text.slice(at + bold.length)}
      </>
    );
  };
  const hi = compact?.hero ?? r.heroImage;
  const backShot = r.beforeAfter?.before.shot?.src
    ? r.beforeAfter.before.shot
    : undefined;
  const heroCap = splitHead(hi?.caption, 1);

  sections.push({id: `${rootId}-head`, title: "소개", folded: false});
  body.push(
    <section key="head" className="p4-sec p4-hero" id={`${rootId}-head`}>
      <div className="p4-grid">
        <div>
          <p className="p4-eyebrow p4-rv">{card?.subtitle ?? r.tagline}</p>
          <h1 className="p4-rv">{titleNode}</h1>
          {card ? (
            // 종류 하나 + 성격 둘 이하. 예전 영어 한 줄(r.tagline) 자리다.
            // 셋째 성격부터는 버린다 — 알약이 늘면 아래 상태 줄과 섞여 잡음이 된다.
            <div className="p4-kinds p4-rv" aria-label="프로젝트 종류">
              <span className="p4-kind">
                {CATEGORY_META[card.category].label}
              </span>
              {(card.facets ?? [])
                // 종류가 이미 말한 성격은 다시 달지 않는다(Data / AI 옆의 AI).
                .filter(
                  f =>
                    !(
                      card.category === "data" &&
                      (f === "ai" || f === "data")
                    ) && !(card.category === "game" && f === "game")
                )
                .slice(0, 2)
                .map(f => (
                  <span key={f} className="p4-facet" title={FACET_META[f].hint}>
                    {FACET_META[f].label}
                  </span>
                ))}
            </div>
          ) : null}
          {chips.length || !videoLenShown ? (
            <div className="p4-chipsrow p4-rv">
              {chips.map((c, i) => (
                <span key={i} className={c.ok ? "p4-chip p4-ok" : "p4-chip"}>
                  {c.t}
                </span>
              ))}
              {!videoLenShown ? (
                <span className="p4-chip">시연 영상 {r.demo.videoLen}</span>
              ) : null}
            </div>
          ) : null}
          {r.tech.length ? (
            // 기술 스택은 머리에 작게 먼저 보인다(2026-11-15 본인 요청). 예전에는 맨 아래 접힌 절 끝에 있었다.
            <div className="p4-techrow p4-rv" aria-label="기술 스택">
              {r.tech.map((x, i) => (
                <span key={i}>{x}</span>
              ))}
            </div>
          ) : null}
          <div className="p4-intro p4-rv">
            {intro.head ? (
              <p>
                <BoldIn text={intro.head} bold={dIntro?.bold} />
              </p>
            ) : null}
            {intro.rest || dIntro?.more?.length || r.tldr.length
              ? XFold(
                  "더 읽기",
                  <>
                    {dIntro?.more?.length ? (
                      <ul className="p4-more-ul">
                        {dIntro.more.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : null}
                    {intro.rest ? <Paras text={intro.rest} /> : null}
                    {r.tldr.length ? (
                      <dl className="p4-tldr">
                        {r.tldr.map((t, i) => (
                          <div key={i}>
                            <dt>{t.k}</dt>
                            <dd>{t.v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </>
                )
              : null}
          </div>
          {links.length ? (
            <div className="p4-links p4-rv">
              {links.map((l, i) => (
                <a
                  key={l.href}
                  className={`p4-pill p4-press${i === 0 ? " p4-blue" : ""}`}
                  href={l.href}
                  {...(isExternal(l.href)
                    ? {target: "_blank", rel: "noopener noreferrer"}
                    : {})}
                >
                  {l.label}
                  {isExternal(l.href) ? Out : null}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="p4-stack p4-rv">
          {backShot ? (
            <figure className="p4-frame p4-back" aria-hidden="true">
              <div
                className="p4-im"
                style={{aspectRatio: hi?.ratio || backShot.ratio || "16/9"}}
              >
                <img
                  src={backShot.src}
                  alt=""
                  {...dims(backShot.ratio)}
                  loading="lazy"
                />
              </div>
            </figure>
          ) : null}
          {hi ? (
            <figure
              className={`p4-frame p4-front${
                hi.fit === "contain" ? " p4-contain" : ""
              }`}
            >
              {hi.src ? (
                <button
                  type="button"
                  className="p4-zoom p4-im"
                  style={{aspectRatio: hi.ratio || "16/9"}}
                  data-zoom=""
                  data-title={hi.label}
                  data-cap={hi.caption ?? ""}
                  aria-label={`${hi.label} 크게 보기`}
                >
                  <img
                    src={hi.src}
                    alt={hi.label}
                    {...dims(hi.ratio)}
                    fetchPriority="high"
                  />
                </button>
              ) : (
                <div
                  className="p4-im"
                  style={{aspectRatio: hi.ratio || "16/9"}}
                >
                  <ScreenMock s={r.heroScreen} />
                </div>
              )}
              <figcaption>
                <b>{hi.label}</b>
                {heroCap.head}
                {heroCap.rest ? XFoldInline("자세히", heroCap.rest) : null}
              </figcaption>
            </figure>
          ) : (
            <ScreenMock s={r.heroScreen} />
          )}
        </div>
      </div>
      {(() => {
        if (!r.metrics.length) return null;
        const renderTile = (m: (typeof r.metrics)[number], i: number) => {
          // 출처가 있는 타일은 눌러서 펼치는 버튼, 없으면 예전처럼 상자.
          const inner = (
            <>
              <span className="p4-tlab">{m.l}</span>
              <span className="p4-bigrow">
                <span className="p4-big">
                  <RollNum value={m.n} />
                </span>
                {Mini(m.mini)}
              </span>
              {m.sub ? <span className="p4-tsub">{m.sub}</span> : null}
              {m.source ? (
                <>
                  <span className="p4-trow">출처{Chev}</span>
                  <span className="p4-srcbox">
                    <span>
                      <span className="p4-srcp">{m.source}</span>
                    </span>
                  </span>
                </>
              ) : null}
            </>
          );
          const st = cssVars({"--d": `${i * 60}ms`});
          return m.source ? (
            <button
              key={i}
              type="button"
              className="p4-tile p4-tilt p4-rv p4-tbtn"
              aria-expanded="false"
              data-tile=""
              style={st}
            >
              {inner}
            </button>
          ) : (
            <div key={i} className="p4-tile p4-tilt p4-rv" style={st}>
              {inner}
            </div>
          );
        };
        if (!compact) {
          return <div className="p4-tiles">{r.metrics.map(renderTile)}</div>;
        }
        // 줄인 배치: 고른 넷만 위에, 나머지는 "수치 더 보기" 뒤에.
        const top = compact.tiles
          .map(i => r.metrics[i])
          .filter((m): m is (typeof r.metrics)[number] => !!m);
        const rest = r.metrics.filter((_, i) => !compact.tiles.includes(i));
        return (
          <>
            <div className="p4-tiles">{top.map(renderTile)}</div>
            {rest.length || r.metricsNote
              ? XFold(
                  rest.length
                    ? `수치 ${rest.length}개와 출처 더 보기`
                    : "출처 보기",
                  <>
                    {rest.length ? (
                      <div className="p4-tiles p4-tiles-more">
                        {rest.map(renderTile)}
                      </div>
                    ) : null}
                    {r.metricsNote ? (
                      <p className="p4-src">{r.metricsNote}</p>
                    ) : null}
                  </>
                )
              : null}
          </>
        );
      })()}
      {compact?.compareFirst && r.beforeAfter && canSlide ? (
        <div className="p4-renew">
          <p className="p4-renew-h p4-rv">
            <b>{compact.compareTitle ?? "바꾸기 전과 후"}</b>
            <span>손잡이를 끌어 보세요</span>
          </p>
          {Compare()}
        </div>
      ) : null}
      {r.metricsNote && !compact ? (
        <p className="p4-src p4-rv">
          {HeadInline(r.metricsNote, 1, "출처 더 보기")}
        </p>
      ) : null}
      {story ? null : r.detail?.highlights?.length ? (
        <div className="p4-hl p4-rv">
          <b>기술적으로 한 일</b>
          <ul>
            {r.detail.highlights.map((h, i) => (
              <li key={i} className={h.bold ? "p4-key" : undefined}>
                {h.show}
                {h.more ? XFoldInline("자세히", h.more) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : card?.highlights?.length ? (
        <div className="p4-hl p4-rv">
          <b>기술적으로 한 일</b>
          <ul>
            {card.highlights.map((h, i) => (
              <li key={i}>{HeadInline(h)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {/* 대표 장면. 넓은 화면에서는 늘 펴 있고, 휴대폰에서는 버튼 뒤에 접힌다(CSS 가 가른다). */}
      {featured && !story ? (
        <div className="p4-featured">
          {XFold(`장면 보기 · ${featured.title}`, Scene(featured, 0))}
        </div>
      ) : null}
    </section>
  );

  // ── 이야기 배치(story): 머리 아래를 접지 않고 여섯 절로 펼친다 ──
  if (story) {
    const st = story;
    const EmIn = (t: string, em?: string) => {
      if (!em || !t.includes(em)) return t;
      const at = t.indexOf(em);
      return (
        <>
          {t.slice(0, at)}
          <em>{em}</em>
          {t.slice(at + em.length)}
        </>
      );
    };
    const StorySec = (
      k: string,
      toc: string,
      eyebrow: string,
      title: ReactNode,
      lead: string | undefined,
      content: ReactNode,
      extraHead?: ReactNode
    ) => {
      const sid = `${rootId}-${k}`;
      sections.push({id: sid, title: toc, folded: false});
      return (
        <section key={sid} className="p4-sec p4s" id={sid}>
          <p className="p4-eyebrow p4-rv">{eyebrow}</p>
          <h2 className="p4s-h p4-rv">{title}</h2>
          {extraHead}
          {lead ? <p className="p4s-lead p4-rv">{lead}</p> : null}
          {content}
        </section>
      );
    };
    const sceneBy = (title?: string) =>
      title ? r.detail?.scenes?.find(x => x.title === title) : undefined;

    // 1) 문제
    const pb = r.detail?.problems;
    body.push(
      StorySec(
        "s-problem",
        st.toc?.problem ?? "문제",
        st.problem.eyebrow,
        EmIn(st.problem.title, st.problem.em),
        st.problem.lead,
        <>
          {pb ? (
            <div className="p4s-three">
              {pb.items.map((x, i) => (
                <div
                  key={i}
                  className="p4s-pc p4-tilt p4-rv"
                  style={cssVars({"--d": `${i * 90}ms`})}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{x.t}</b>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
          ) : null}
          {st.problem.quote ? (
            <p className="p4s-quote p4-rv">{st.problem.quote}</p>
          ) : null}
          {st.problem.after ? (
            <p className="p4s-p p4-rv">{st.problem.after}</p>
          ) : null}
          {pb?.source ? (
            <p className="p4-src p4-rv">출처: {pb.source}</p>
          ) : null}
        </>
      )
    );

    // 2) 첫 운영(없는 프로젝트는 건너뛴다)
    const fieldScene = sceneBy(st.field?.scene);
    if (st.field)
      body.push(
        StorySec(
          "s-field",
          st.toc?.field ?? "5월 첫 운영",
          st.field.eyebrow,
          EmIn(st.field.title, st.field.em),
          st.field.lead,
          <>
            <div className="p4s-facts">
              {st.field.facts.map((f, i) => (
                <div
                  key={i}
                  className="p4-rv"
                  style={cssVars({"--d": `${i * 90}ms`})}
                >
                  <b>
                    <RollNum value={f.n} />
                  </b>
                  {f.l}
                </div>
              ))}
            </div>
            {fieldScene
              ? Scene(fieldScene, 90)
              : r.fieldDay?.timeline
              ? SceneTimeline(r.fieldDay.timeline)
              : null}
          </>
        )
      );

    // 3) 문제였던 것 → 고친 것 → 확인
    let rowNo = 0;
    const lgCols = st.ledger.cols ?? ["문제였던 것", "고친 것", "확인"];
    body.push(
      StorySec(
        "s-ledger",
        st.toc?.ledger ?? "문제 · 해결 · 확인",
        st.ledger.eyebrow,
        EmIn(st.ledger.title, st.ledger.em),
        st.ledger.lead,
        <div className="p4s-lg" data-lg="" data-show="all">
          <div
            className="p4s-lg-filter p4-rv"
            role="group"
            aria-label="걸러 보기"
          >
            <button
              type="button"
              className="p4-press"
              data-lg-filter="all"
              aria-pressed="true"
            >
              {st.ledger.allLabel ?? "여섯 가지 전부"}
            </button>
            {st.ledger.groups.map((g, gi) => (
              <button
                key={gi}
                type="button"
                className="p4-press"
                data-lg-filter={String(gi)}
                aria-pressed="false"
              >
                {g.short} {g.rows.length}
              </button>
            ))}
          </div>
          {st.ledger.groups.map((g, gi) => (
            <div key={gi} className="p4s-lg-grp" data-lg-grp={String(gi)}>
              <p className="p4s-lg-lab p4-rv">{g.label}</p>
              {g.intro ? <p className="p4s-p p4-rv">{g.intro}</p> : null}
              {g.rows.map((row, ri) => {
                const n = ++rowNo;
                const sc = sceneBy(row.scene);
                const ch =
                  row.challenge != null ? r.challenges[row.challenge] : null;
                const evMail = ch?.evidence?.url?.startsWith("mailto:");
                return (
                  <div key={ri} className="p4s-rowwrap">
                    <div className="p4s-row p4-rv" data-lg-row="">
                      <span className="p4s-n">{n}</span>
                      <div className="p4s-a">
                        <i className="p4s-col">{lgCols[0]}</i>
                        <b className="p4s-t">{row.problem.t}</b>
                        <span className="p4s-d">{row.problem.d}</span>
                      </div>
                      <div className="p4s-b">
                        <i className="p4s-col">{lgCols[1]}</i>
                        <b className="p4s-t">{row.fix.t}</b>
                        <span className="p4s-d">{row.fix.d}</span>
                      </div>
                      <div className="p4s-c">
                        <i className="p4s-col">{lgCols[2]}</i>
                        {row.check.when ? (
                          <span className="p4s-when">{row.check.when}</span>
                        ) : null}
                        {row.check.big ? (
                          <span className="p4s-big">
                            {/^[\d,.]+[^\d\s]*$/.test(row.check.big) ? (
                              <RollNum value={row.check.big} />
                            ) : (
                              row.check.big
                            )}
                          </span>
                        ) : null}
                        {row.check.t ? (
                          <b className="p4s-t">{row.check.t}</b>
                        ) : null}
                        <span className="p4s-d">
                          {row.check.d}
                          {row.check.src ? (
                            <span className="p4s-src">{row.check.src}</span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                    {sc || ch ? (
                      <div className="p4s-more">
                        {sc ? Scene(sc, 100 + n) : null}
                        {ch ? (
                          <div className="p4-rv">
                            {XFold(
                              "자세한 설명과 코드",
                              <>
                                <b className="p4-k">문제</b>
                                <Paras text={ch.problem} />
                                <b
                                  className="p4-k"
                                  style={{marginTop: "1.2em"}}
                                >
                                  한 일
                                </b>
                                <Paras text={ch.solution} />
                                {ch.evidence ? (
                                  <p className="p4s-ev">
                                    <b className="p4-k">
                                      근거: {ch.evidence.status}
                                    </b>
                                    {ch.evidence.note}
                                    {ch.evidence.url ? (
                                      <>
                                        <br />
                                        <a
                                          className="p4-pill p4-sm p4-press"
                                          href={ch.evidence.url}
                                          {...(evMail
                                            ? {}
                                            : {
                                                target: "_blank",
                                                rel: "noopener noreferrer"
                                              })}
                                        >
                                          {evMail
                                            ? "저장소 열람 요청하기"
                                            : "확인한 코드 보기"}
                                          {evMail ? null : Out}
                                        </a>
                                      </>
                                    ) : null}
                                  </p>
                                ) : null}
                                {ch.code ? CodeWin(ch.code, true) : null}
                              </>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )
    );

    // 4) 새로 만든 화면
    const sr = r.secondRun;
    const bt = st.built;
    if (bt)
      body.push(
        StorySec(
          "s-built",
          st.toc?.built ?? "새로 만든 화면",
          bt.eyebrow,
          EmIn(bt.title, bt.em),
          bt.lead,
          <>
            <div className={`p4s-shots${bt.wide ? " p4s-shots-wide" : ""}`}>
              {bt.items.map((x, i) => (
                <figure
                  key={i}
                  className="p4s-shot p4-rv"
                  style={cssVars({"--d": `${(i % 2) * 90}ms`})}
                >
                  <button
                    type="button"
                    className="p4-zoom"
                    data-zoom=""
                    data-title={x.t}
                    data-cap={x.d}
                    aria-label={`${x.t} 크게 보기`}
                  >
                    <img
                      src={x.src}
                      alt=""
                      width={1200}
                      height={750}
                      loading="lazy"
                    />
                  </button>
                  <figcaption>
                    <b>{x.t}</b>
                    <p>{x.d}</p>
                    <p className="p4s-r">{x.r}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            {sr?.remade.length ? (
              <div className="p4s-foldwide p4-rv">
                {XFold(
                  `소개팅에서 다시 만든 ${sr.remade.length}가지`,
                  <>
                    {sr.shots.length ? (
                      <div className="p4-shots">
                        {sr.shots.slice(0, 2).map((x, i) => (
                          <figure key={i}>
                            <button
                              type="button"
                              className="p4-zoom"
                              data-zoom=""
                              data-title={x.label}
                              data-cap={x.alt}
                              aria-label={`${x.label} 크게 보기`}
                            >
                              <img
                                src={x.src}
                                alt={x.alt}
                                width={1200}
                                height={600}
                                loading="lazy"
                              />
                            </button>
                            <figcaption>{x.label}</figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : null}
                    <ul className="p4-remade">
                      {sr.remade.map((x, i) => (
                        <li key={i}>
                          <strong className="p4-h">{x.t}</strong>
                          <div className="p4-ba2">
                            <div>
                              <b>{sr.beforeTag ?? "5월"}</b>
                              {x.before}
                            </div>
                            <div>
                              <b>{sr.afterTag ?? "10월"}</b>
                              {x.after}
                            </div>
                          </div>
                          <p className="p4-src">{x.source}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : null}
          </>
        )
      );

    // 5) 검증
    const vf = st.verify;
    const vsc = sceneBy(vf?.scene);
    if (vf)
      body.push(
        StorySec(
          "s-verify",
          st.toc?.verify ?? "검증",
          vf.eyebrow,
          EmIn(vf.title, vf.em),
          vf.lead,
          <>
            {vsc ? Scene(vsc, 200) : null}
            <div className="p4s-pair">
              {vf.boxes.map((x, i) => (
                <div
                  key={i}
                  className="p4s-box p4-tilt p4-rv"
                  style={cssVars({"--d": `${(i % 2) * 90}ms`})}
                >
                  <b className="p4s-bn">
                    <RollNum value={x.n} />
                    {x.unit ? <small>{x.unit}</small> : null}
                  </b>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
            {r.detail?.bench ? (
              <div className="p4-rv" style={{marginTop: 18}}>
                {XFold(
                  vf.noteLabel ?? "측정 조건",
                  <Paras text={r.detail.bench} />
                )}
              </div>
            ) : null}
          </>,
          <span className="p4s-tag p4-rv">{vf.tag}</span>
        )
      );

    // 6) 결과. 「화면」 절에 이미 실은 그림은 여기서 다시 그리지 않는다.
    const gal = r.gallery ?? [];
    const galRest = bt
      ? gal.filter(g => !bt.items.some(x => x.src === g.src))
      : gal;
    body.push(
      StorySec(
        "s-result",
        st.toc?.result ?? "결과",
        st.result.eyebrow,
        EmIn(st.result.title, st.result.em),
        undefined,
        <>
          {sr?.stats.length ? (
            <div className="p4-tiles p4s-stats">
              {sr.stats.map((x, i) => (
                <div
                  key={i}
                  className="p4-tile p4-smt p4-tilt p4-rv"
                  style={cssVars({"--d": `${(i % 4) * 60}ms`})}
                >
                  <span className="p4-big">
                    <RollNum value={x.n} />
                  </span>
                  <span className="p4-lab">{x.l}</span>
                  <span className="p4-tsrc">{x.s}</span>
                </div>
              ))}
            </div>
          ) : null}
          {sr?.scope.length ? (
            <div className="p4-tblwrap p4-rv" style={{marginTop: 28}}>
              <table className="p4-tbl p4s-tbl">
                <thead>
                  <tr>
                    <th />
                    <th>{sr.beforeHead ?? "2026.05 대동제"}</th>
                    <th>{sr.afterHead ?? "2026.10 가을축제"}</th>
                  </tr>
                </thead>
                <tbody>
                  {sr.scope.map((x, i) => (
                    <tr key={i}>
                      <td>{x.k}</td>
                      <td>{x.before}</td>
                      <td>{x.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {st.result.quote ? (
            <p className="p4s-quote p4-rv">
              “{st.result.quote.q}”<small>{st.result.quote.who}</small>
            </p>
          ) : null}
          {st.result.shots?.length ? (
            <div className="p4s-shots p4s-shots-3" style={{marginTop: 28}}>
              {st.result.shots.map((x, i) => (
                <figure
                  key={i}
                  className="p4s-shot p4-rv"
                  style={cssVars({"--d": `${i * 90}ms`})}
                >
                  <button
                    type="button"
                    className="p4-zoom"
                    data-zoom=""
                    data-title={x.t}
                    data-cap={x.d}
                    aria-label={`${x.t} 크게 보기`}
                  >
                    <img
                      src={x.src}
                      alt=""
                      width={492}
                      height={992}
                      loading="lazy"
                    />
                  </button>
                  <figcaption>
                    <b>{x.t}</b>
                    <p>{x.d}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : galRest.length ? (
            <div
              className={`p4-gal${galRest.length === 3 ? " p4-gal-3" : ""}`}
              style={{marginTop: 28}}
            >
              {galRest.map((im, i) => (
                <Fragment key={i}>{Figure(im, "p4-rv")}</Fragment>
              ))}
            </div>
          ) : null}
          <h3 className="p4s-sub p4-rv">아직 남은 것</h3>
          <ul className="p4s-left">
            {st.result.left.map((x, i) => (
              <li
                key={i}
                className="p4-rv"
                style={cssVars({"--d": `${i * 60}ms`})}
              >
                {x}
              </li>
            ))}
          </ul>
        </>
      )
    );
    body.push(
      <p key="deep-h" className="p4s-deep p4-rv">
        더 자세한 기록
      </p>
    );
  }

  // ── 1. 왜 만들었나 / 들은 말과 한 것 ──
  {
    const prob = splitHead(r.problem, 2);
    const hyp = splitHead(r.hypothesis, 1);
    const fm = r.feedbackMap ?? [];
    const done = fm.filter(f => f.done).length;
    const content = (
      <>
        <div className="p4-rv">
          <p className="p4-lead-p">{prob.head}</p>
          {prob.rest ? (
            isShortRest(prob.rest) ? (
              <p className="p4-lead-p p4-lead-rest">{prob.rest}</p>
            ) : (
              XFold("자세히", <Paras text={prob.rest} />)
            )
          ) : null}
        </div>
        {r.hypothesis ? (
          <div className="p4-hypo p4-rv">
            <b>가설</b>
            <span>{hyp.head}</span>
            {hyp.rest ? XFoldInline("자세히", hyp.rest) : null}
          </div>
        ) : null}
        {r.testimonial ? (
          <blockquote
            className="p4-quote p4-testi p4-rv"
            style={{marginTop: 14}}
          >
            <q>{r.testimonial.q}</q>
            <span className="p4-who">{r.testimonial.who}</span>
          </blockquote>
        ) : null}
        {/* 문제 카드를 직접 그리는 페이지에서는 수치 한 줄 상자를 빼 둔다(카드가 같은 일을 한다). */}
        {r.research.stat && !r.research.quotes.length && !r.detail?.problems ? (
          // 인용이 없을 때 숫자 타일 하나만 2열 격자에 두면 외톨이로 보인다. 한 줄로 적는다.
          <p className="p4-hypo p4-rv" style={{marginTop: 10}}>
            <b>수치</b>
            <span>
              <strong>{r.research.stat.n}</strong> {r.research.stat.l}
            </span>
          </p>
        ) : null}
        {r.research.quotes.length ? (
          <div className="p4-grid2" style={{marginTop: 14}}>
            {r.research.stat ? (
              <div className="p4-tile p4-smt p4-tilt p4-rv">
                <span className="p4-big">
                  <RollNum value={r.research.stat.n} />
                </span>
                <span className="p4-lab">{r.research.stat.l}</span>
              </div>
            ) : null}
            {r.research.quotes.map((q, i) => (
              <blockquote
                key={i}
                className="p4-quote p4-rv"
                style={cssVars({"--d": `${i * 40}ms`})}
              >
                <q>{q.q}</q>
                <span className="p4-who">{q.who}</span>
              </blockquote>
            ))}
          </div>
        ) : null}
        {fm.length ? (
          <>
            <p className="p4-eyebrow p4-rv" style={{marginTop: 18}}>
              들은 말 {fm.length}, 한 것 {done}
            </p>
            <table className="p4-fb p4-rv">
              <tbody>
                {fm.map((f, i) => (
                  <tr key={i} className={f.done ? undefined : "p4-todo"}>
                    <td>“{f.said}”</td>
                    <td>
                      <span className="p4-arrow">→</span>
                      {HeadInline(f.did)}
                      {f.done ? null : (
                        <span className="p4-todo-tag">아직</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
        {r.detail?.problems ? (
          <div className="p4-prob p4-rv">
            <ol className="p4-prob-list">
              {r.detail.problems.items.map((x, i) => (
                <li key={i} style={cssVars({"--d": `${i * 80}ms`})}>
                  <span className="p4-prob-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b>{x.t}</b>
                  <p>{x.d}</p>
                </li>
              ))}
            </ol>
            {r.detail.problems.core ? (
              <p className="p4-prob-core">
                <span>핵심 문제</span>
                {r.detail.problems.core}
              </p>
            ) : null}
            {r.detail.problems.source ? (
              <p className="p4-src">출처: {r.detail.problems.source}</p>
            ) : null}
          </div>
        ) : null}
        {r.problemShot &&
        !r.detail?.problems &&
        !(
          canSlide &&
          (r.problemShot.src === r.beforeAfter?.before.shot?.src ||
            r.problemShot.src === r.beforeAfter?.after.shot?.src)
        ) ? (
          // 전/후 슬라이더에 같은 사진이 또 나오면 문제 그림은 그리지 않는다(2026-11-13).
          <div
            className="p4-rv"
            style={{
              marginTop: 14,
              maxWidth: isPortrait(r.problemShot.ratio) ? 340 : 640
            }}
          >
            {Figure(r.problemShot, "p4-fig")}
          </div>
        ) : null}
        {r.beforeAfter && canSlide && !compact?.compareFirst ? (
          <>
            <p className="p4-eyebrow p4-rv" style={{marginTop: 22}}>
              바꾸기 전과 후 · 손잡이를 끌어 보세요
            </p>
            {Compare()}
          </>
        ) : null}
        {r.beforeAfter && !canSlide ? (
          <>
            <p className="p4-eyebrow p4-rv" style={{marginTop: 22}}>
              바꾸기 전과 후
            </p>
            <div className="p4-ba" style={{marginTop: 10}}>
              {(["before", "after"] as const).map(k => {
                const side = r.beforeAfter![k];
                return (
                  <div
                    key={k}
                    className={`p4-card p4-rv${
                      k === "after" ? " p4-after" : ""
                    }`}
                  >
                    <span className="p4-lbl">
                      {k === "before" ? "BEFORE" : "AFTER"}
                    </span>
                    <strong className="p4-h" style={{marginTop: 4}}>
                      {side.label}
                    </strong>
                    {side.shot ? (
                      <figure
                        className={`p4-baf${
                          side.shot.fit === "contain" ? " p4-contain" : ""
                        }`}
                      >
                        {side.shot.src ? (
                          <button
                            type="button"
                            className="p4-zoom"
                            style={{aspectRatio: side.shot.ratio || "16/9"}}
                            data-zoom=""
                            data-title={side.shot.label}
                            data-cap={side.shot.caption ?? ""}
                            aria-label={`${side.shot.label} 크게 보기`}
                          >
                            <img
                              src={side.shot.src}
                              alt={side.shot.label}
                              {...dims(side.shot.ratio)}
                              loading="lazy"
                            />
                          </button>
                        ) : null}
                        <figcaption>
                          {side.shot.label}
                          {side.shot.caption ? (
                            <> · {HeadInline(side.shot.caption)}</>
                          ) : null}
                        </figcaption>
                      </figure>
                    ) : null}
                    {side.screen ? (
                      <div style={{marginTop: 10}}>
                        <ScreenMock s={side.screen} />
                      </div>
                    ) : null}
                    {side.note ? (
                      <p className="p4-note">{HeadInline(side.note)}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
        {r.beforeCode ? (
          <div className="p4-rv" style={{marginTop: 18}}>
            <p className="p4-eyebrow">바꾸기 전 코드</p>
            {CodeWin(r.beforeCode, false)}
          </div>
        ) : null}
        {ScenesAt("why")}
      </>
    );
    body.push(
      Section(
        `${rootId}-why`,
        fm.length ? "피드백" : "문제",
        fm.length ? "들은 말과 한 것" : "왜 만들었나",
        "",
        content
      )
    );
  }

  // ── 2. 실제로 돌린 날 ──
  if (r.fieldDay) {
    const fd = r.fieldDay;
    const lead = splitHead(fd.lead, 1);
    body.push(
      Section(
        `${rootId}-field`,
        "운영",
        fd.title,
        "",
        <>
          <div className="p4-rv">
            <p className="p4-lead-p">{lead.head}</p>
            {lead.rest ? (
              isShortRest(lead.rest) ? (
                <p className="p4-lead-p p4-lead-rest">{lead.rest}</p>
              ) : (
                XFold("자세히", <Paras text={lead.rest} />)
              )
            ) : null}
          </div>
          {fd.timeline ? SceneTimeline(fd.timeline) : null}
          <ol className="p4-steps" style={{marginTop: 14}}>
            {fd.items.map((it, i) => (
              <li
                key={i}
                className="p4-rv"
                style={cssVars({"--d": `${(i % 3) * 40}ms`})}
              >
                <span className="p4-n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{it.t}</h3>
                  <dl>
                    <dt>그날</dt>
                    <dd>{HeadInline(it.happened)}</dd>
                    <dt>{fd.nowLabel ?? "지금이라면"}</dt>
                    <dd>{HeadInline(it.now)}</dd>
                    <dt>출처</dt>
                    <dd className="p4-src" style={{marginTop: 0}}>
                      {it.source}
                    </dd>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
          {ScenesAt("field")}
        </>
      )
    );
  }

  // ── 3. 트러블슈팅 ──
  const hideCh = compact?.hide?.challenges ?? [];
  if (r.challenges.length) {
    // 숨긴 카드가 있으면 요약(briefs)도 같은 색인을 빼서 짝을 맞춘다.
    const ch = r.challenges.filter((_, i) => !hideCh.includes(i));
    const briefsV = r.detail?.briefs?.filter((_, i) => !hideCh.includes(i));
    const perfClaimed = ch.some(c => c.perfAfter);
    const perfHeading = r.perf?.title ?? "인덱스 전 → 후 · 실측";
    const ChCard = (x: RichProject["challenges"][number], i: number) => {
      const pLabel = (x.problemLabel ?? "").replace(/^\[|\]$/g, "") || "문제";
      const sLabel = x.solutionLabel || "한 일";
      // 손으로 쓴 요약(detail.briefs)이 있으면 그것을 보이고 원문은 통째로 접는다.
      // 없으면 첫 문장·마지막 문장을 자동으로 떼어 쓴다(예전 방식).
      const brief = briefsV?.[i] ?? null;
      const p = brief
        ? {head: brief.problem, rest: x.problem}
        : splitHead(x.problem, 1);
      const s = brief
        ? {first: brief.did, middle: x.solution, last: brief.result}
        : splitEnds(x.solution);
      const evMail = x.evidence?.url?.startsWith("mailto:");
      return (
        <div
          key={`c${i}`}
          className="p4-card p4-rv"
          style={cssVars({"--d": `${(i % 2) * 60}ms`})}
        >
          <h3>{x.title}</h3>
          <div className="p4-brief">
            <p>
              <b className="p4-k">{pLabel}</b>
              {p.head}
            </p>
            <p>
              <b className="p4-k">{sLabel}</b>
              {s.first}
            </p>
            {s.last ? (
              <p className="p4-key">
                <b className="p4-k">결과</b>
                {s.last}
              </p>
            ) : null}
          </div>
          {p.rest || s.middle
            ? XFold(
                brief ? "원래 문장 보기" : "자세히",
                <>
                  {p.rest ? (
                    <>
                      <b className="p4-k">{pLabel}</b>
                      <Paras text={p.rest} />
                    </>
                  ) : null}
                  {s.middle ? (
                    <>
                      <b
                        className="p4-k"
                        style={p.rest ? {marginTop: "1.2em"} : undefined}
                      >
                        {sLabel}
                      </b>
                      <Paras text={s.middle} />
                    </>
                  ) : null}
                </>
              )
            : null}
          {x.evidence ? (
            <details className="p4-ev">
              <summary>근거: {x.evidence.status}</summary>
              <div className="p4-evb">
                {x.evidence.note}
                {x.evidence.url ? (
                  <>
                    <br />
                    <a
                      className="p4-pill p4-sm p4-press"
                      href={x.evidence.url}
                      {...(evMail
                        ? {}
                        : {target: "_blank", rel: "noopener noreferrer"})}
                    >
                      {evMail ? "저장소 열람 요청하기" : "확인한 코드 보기"}
                      {evMail ? null : Out}
                    </a>
                  </>
                ) : null}
              </div>
            </details>
          ) : null}
          {x.code ? CodeWin(x.code, false) : null}
        </div>
      );
    };
    const renderCards = (list: typeof ch, offset: number) => {
      const out: ReactNode[] = [];
      list.forEach((x, j) => {
        out.push(ChCard(x, offset + j));
        if (x.perfAfter && r.perf)
          out.push(
            <Fragment key={`pf${j}`}>{PerfBlock(r.perf, perfHeading)}</Fragment>
          );
      });
      return out;
    };
    // 넷까지는 다 보여 준다. 네 번째가 「더 보기」 뒤에 숨으면 그 카드에 붙은 perf 막대도 같이 숨는다.
    // 2열 격자라 홀수로 자르면 마지막 카드 옆이 통째로 빈다. 다섯 장 이상이면 네 장을 보이고 나머지를 접는다.
    const SHOW = compact ? 2 : 4;
    const shown = ch.slice(0, SHOW);
    const hidden = ch.slice(SHOW);
    const moreId = `${rootId}-morech`;
    const moreLabel = `${hidden.length}건 더 보기 · ${
      r.detail?.moreLabel ?? hidden.map(x => x.title).join(", ")
    }`;
    body.push(
      Section(
        `${rootId}-trouble`,
        "트러블슈팅",
        "막혔던 곳과 푼 방법",
        "",
        <>
          <div className="p4-ch">
            {renderCards(shown, 0)}
            {!perfClaimed && r.perf ? PerfBlock(r.perf, perfHeading) : null}
            {r.usability ? PerfBlock(r.usability, "사용성 전 → 후") : null}
          </div>
          {hidden.length ? (
            <>
              <button
                type="button"
                className="p4-more p4-press p4-rv"
                aria-expanded="false"
                aria-controls={moreId}
                data-l={moreLabel}
              >
                <span className="p4-lbl">{moreLabel}</span>
                {Chev}
              </button>
              <div className="p4-fold-b" id={moreId}>
                <div className="p4-fold-in">
                  <div className="p4-ch" style={{marginTop: 12}}>
                    {renderCards(hidden, SHOW)}
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {r.detail?.bench ? (
            <p className="p4-src p4-bench p4-rv">{r.detail.bench}</p>
          ) : null}
          {ScenesAt("trouble")}
        </>
      )
    );
  }

  // ── 4. 결과 화면 ──
  {
    const gal = r.gallery ?? [];
    // 열 수: 셋 또는 다섯 이상이면 3열, 넷이 전부 세로 사진이면 4열(폰 캡처 넷을 2열로 두면 한 장이 600px 폭이 된다), 그 밖엔 2열.
    const galCols =
      gal.length >= 3 && gal.length !== 4
        ? 3
        : gal.length === 4 && gal.every(g => isPortrait(g.ratio))
        ? 4
        : 2;
    const screens = [r.heroScreen, ...r.resultScreens].filter(Boolean);
    if (gal.length || r.resultShot || screens.length) {
      body.push(
        Section(
          `${rootId}-result`,
          "결과",
          "결과 화면",
          "",
          <>
            {gal.length || r.resultShot ? (
              <div
                className={`p4-gal${
                  galCols === 3 ? " p4-gal-3" : galCols === 4 ? " p4-gal-4" : ""
                }`}
              >
                {gal.map((im, i) => (
                  <Fragment key={i}>{Figure(im, "p4-rv")}</Fragment>
                ))}
                {Figure(r.resultShot, "p4-rv", true)}
              </div>
            ) : null}
            {ScenesAt("result")}
            {screens.length ? (
              <div className="p4-rv" style={{marginTop: 14}}>
                {XFold(
                  "화면 요약 보기",
                  <div className="p4-grid3">
                    {screens.map((s, i) => (
                      <ScreenMock key={i} s={s} />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )
      );
    }
  }

  // ── 5. 두 번째 운영 (접힘) ──
  if (r.secondRun) {
    const s = r.secondRun;
    const beforeTag = s.beforeTag ?? "5월";
    const afterTag = s.afterTag ?? "10월";
    const content = (
      <>
        {story ? null : <p className="p4-sec-p p4-rv">{s.lead}</p>}
        {!story && s.stats.length ? (
          <div className="p4-tiles">
            {s.stats.map((x, i) => (
              <div
                key={i}
                className="p4-tile p4-smt p4-tilt p4-rv"
                style={cssVars({"--d": `${i * 60}ms`})}
              >
                <span className="p4-big">
                  <RollNum value={x.n} />
                </span>
                <span className="p4-lab">{x.l}</span>
                <span className="p4-tsrc">{x.s}</span>
              </div>
            ))}
          </div>
        ) : null}
        {!story && s.scope.length ? (
          <div className="p4-tblwrap p4-rv" style={{marginTop: 14}}>
            <table className="p4-tbl">
              <thead>
                <tr>
                  <th />
                  <th>{s.beforeHead ?? "2026.05 대동제"}</th>
                  <th>{s.afterHead ?? "2026.10 가을축제"}</th>
                </tr>
              </thead>
              <tbody>
                {s.scope.map((x, i) => (
                  <tr key={i}>
                    <td>{x.k}</td>
                    <td>{x.before}</td>
                    <td>{x.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!story && s.shots.length ? (
          <div className="p4-shots" style={{marginTop: 14}}>
            {s.shots.map((x, i) => (
              <figure
                key={i}
                className="p4-rv"
                style={cssVars({"--d": `${i * 40}ms`})}
              >
                <button
                  type="button"
                  className="p4-zoom"
                  data-zoom=""
                  data-title={x.label}
                  data-cap={x.alt}
                  aria-label={`${x.label} 크게 보기`}
                >
                  <img
                    src={x.src}
                    alt={x.alt}
                    width={1200}
                    height={600}
                    loading="lazy"
                  />
                </button>
                <figcaption>{x.label}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        {!story && s.remade.length ? (
          <>
            <h3 className="p4-sub-h p4-rv">{s.remadeTitle}</h3>
            <ul className="p4-remade">
              {s.remade.map((x, i) => (
                <li
                  key={i}
                  className="p4-rv"
                  style={cssVars({"--d": `${i * 40}ms`})}
                >
                  <strong className="p4-h">{x.t}</strong>
                  <div className="p4-ba2">
                    <div>
                      <b>{beforeTag}</b>
                      {x.before}
                    </div>
                    <div>
                      <b>{afterTag}</b>
                      {x.after}
                    </div>
                  </div>
                  <p className="p4-src">{x.source}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {!story && s.added.length ? (
          <>
            <h3 className="p4-sub-h p4-rv">
              {s.addedTitle ?? "새로 만들어 함께 운영한 것"}
            </h3>
            <div className="p4-grid2" style={{marginTop: 10}}>
              {s.added.map((x, i) => (
                <div
                  key={i}
                  className="p4-card p4-tilt p4-rv"
                  style={cssVars({"--d": `${i * 40}ms`})}
                >
                  <strong className="p4-h">{x.t}</strong>
                  <p>{x.what}</p>
                  <p className="p4-res">{x.result}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {s.ai ? (
          <div className="p4-ai p4-rv">
            <h3>{s.ai.title}</h3>
            <p className="p4-sec-p">{s.ai.lead}</p>
            {s.ai.stats.length ? (
              <div className="p4-chips" style={{marginTop: 12}}>
                {s.ai.stats.map((x, i) => (
                  <span key={i}>
                    <b>{x.n}</b> {x.l}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="p4-two" style={{marginTop: 12}}>
              <div className="p4-card">
                <strong className="p4-h">직접 정한 것</strong>
                <ul>
                  {s.ai.roles.mine.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="p4-card">
                <strong className="p4-h">AI 에게 맡긴 것</strong>
                <ul>
                  {s.ai.roles.ai.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p4-card" style={{marginTop: 12}}>
              <p style={{marginTop: 0}}>{s.ai.triage.lead}</p>
              <ul>
                {s.ai.triage.items.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="p4-two" style={{marginTop: 12}}>
              <div className="p4-card">
                <strong className="p4-h">확인한 방법</strong>
                {s.ai.verify.map((x, i) => (
                  <p key={i}>
                    <b>{x.t}</b> {x.d}
                  </p>
                ))}
              </div>
              <div className="p4-card">
                <strong className="p4-h">바로잡은 것</strong>
                {s.ai.corrected.map((x, i) => (
                  <p key={i}>
                    <b>{x.t}</b> {x.d}
                  </p>
                ))}
              </div>
            </div>
            {s.ai.rules.length ? (
              <div className="p4-card" style={{marginTop: 12}}>
                <strong className="p4-h">규칙</strong>
                <ol>
                  {s.ai.rules.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </div>
            ) : null}
            <p className="p4-src">{s.ai.source}</p>
          </div>
        ) : null}
        <div className="p4-two" style={{marginTop: 14}}>
          <div className="p4-card p4-rv">
            <strong className="p4-h">{s.prepTitle ?? "준비"}</strong>
            <p>{s.prep}</p>
          </div>
          {!story && s.gaps.length ? (
            <div className="p4-card p4-rv">
              <strong className="p4-h">아직 남은 것</strong>
              <ul className="p4-plain">
                {s.gaps.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <p className="p4-src p4-rv">{s.source}</p>
      </>
    );
    body.push(
      FoldSection(
        `${rootId}-second`,
        s.label ??
          (story ? "방식" : compact ? "리뉴얼" : "Renewal · Second Run"),
        compact?.secondTitle ?? s.title,
        r.detail?.summaries?.second ?? splitHead(s.lead, 1).head,
        content,
        r.detail?.secondTocTitle ?? "두 번째 운영"
      )
    );
  }

  // ── 6. 구조 (접힘) ──
  {
    const hideDg = compact?.hide?.diagrams ?? [];
    const diagrams = (r.diagrams ?? []).filter((_, i) => !hideDg.includes(i));
    const decisionsV = compact?.hide?.decisions ? [] : r.decisions;
    if (
      r.architecture.length ||
      r.impact.length ||
      diagrams.length ||
      decisionsV.length
    ) {
      const content = (
        <>
          {r.architecture.length ? (
            <div className="p4-grid3">
              {r.architecture.map((x, i) => (
                <div
                  key={i}
                  className="p4-card p4-tilt p4-rv"
                  style={cssVars({"--d": `${i * 40}ms`})}
                >
                  <span className="p4-tag">{x.tag}</span>
                  <strong className="p4-h" style={{marginTop: 8}}>
                    {x.name}
                  </strong>
                  <p>{x.desc}</p>
                </div>
              ))}
            </div>
          ) : null}
          {r.impact.length ? (
            <div className="p4-chips p4-rv" style={{marginTop: 14}}>
              {r.impact.map((x, i) => (
                <span key={i}>
                  <b>{x.n}</b> {x.l}
                </span>
              ))}
            </div>
          ) : null}
          {diagrams.length ? (
            <div className="p4-grid2" style={{marginTop: 14}}>
              {diagrams.map((d, i) => (
                <div key={i} className="p4-diag p4-rv">
                  {d.title ? <h3>{d.title}</h3> : null}
                  <button
                    type="button"
                    className="p4-zoomd"
                    data-diag=""
                    data-title={d.title ?? ""}
                    data-cap={d.caption}
                    aria-label={`${d.title ?? "구조도"} 크게 보기`}
                  >
                    <DiagramSvg d={d} mid={`${rootId}-ar${i}`} />
                  </button>
                  <p>{d.caption}</p>
                </div>
              ))}
            </div>
          ) : null}
          {decisionsV.length ? (
            <>
              <h3 className="p4-sub-h p4-rv">기술 결정</h3>
              <table className="p4-dec p4-rv">
                <thead>
                  <tr>
                    <th>영역</th>
                    <th>선택</th>
                    <th>왜, 그리고 대안</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionsV.map((d, i) => (
                    <tr key={i}>
                      <td>{d.area}</td>
                      <td className="p4-pick">{d.pick}</td>
                      <td>
                        {d.why}
                        <div className="p4-vs">
                          <b>대안</b> {d.alt}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 휴대폰용 카드. 표와 같은 글이고, 폭에 따라 둘 중 하나만 display 된다. */}
              <div className="p4-dec-cards">
                {decisionsV.map((d, i) => (
                  <div key={i} className="p4-card">
                    <b className="p4-area">{d.area}</b>
                    <strong className="p4-h">{d.pick}</strong>
                    <p>{d.why}</p>
                    <p>
                      <b>대안</b> {d.alt}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      );
      body.push(
        FoldSection(
          `${rootId}-arch`,
          "구조",
          "시스템 구성",
          r.detail?.summaries?.arch ??
            r.architecture.map(x => x.name).join(" · "),
          <>
            {content}
            {ScenesAt("arch")}
          </>
        )
      );
    }
  }

  // ── 7. 핵심 코드 (접힘) ──
  if (r.coreCode.length) {
    body.push(
      FoldSection(
        `${rootId}-code`,
        "코드",
        "핵심 코드",
        r.detail?.summaries?.code ??
          r.coreCode.map(c => c.filename).join(" · "),
        <div className="p4-grid2">
          {r.coreCode.map((x, i) => (
            <div
              key={i}
              className="p4-rv"
              style={cssVars({"--d": `${i * 40}ms`})}
            >
              {CodeWin(x, true)}
            </div>
          ))}
        </div>
      )
    );
  }

  // ── 8. 만든 순서와 맡은 일 (접힘) ──
  {
    const content = (
      <>
        {r.process.length ? (
          <ol className="p4-tl">
            {r.process.map((x, i) => (
              <li
                key={i}
                className="p4-rv"
                style={cssVars({"--d": `${i * 40}ms`})}
              >
                <strong className="p4-h">{x.t}</strong>
                <p>{x.d}</p>
              </li>
            ))}
          </ol>
        ) : null}
        {r.work.length ? (
          <div className="p4-grid3 p4-work" style={{marginTop: 14}}>
            {r.work.map((w, i) => (
              <div
                key={i}
                className="p4-card p4-rv"
                style={cssVars({"--d": `${i * 40}ms`})}
              >
                <strong className="p4-h">{w.g}</strong>
                <ul>
                  {w.items.map((x, j) => (
                    <li key={j}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        {r.features.length ? (
          <>
            <p className="p4-eyebrow p4-rv" style={{marginTop: 18}}>
              기능
            </p>
            <div className="p4-grid3" style={{marginTop: 8}}>
              {r.features.map((f, i) => (
                <div
                  key={i}
                  className="p4-card p4-tilt p4-rv"
                  style={cssVars({"--d": `${i * 40}ms`})}
                >
                  <strong className="p4-h">{f.t}</strong>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {r.meta.length ? (
          <dl className="p4-meta p4-rv">
            {r.meta.map((m, i) => (
              <div key={i}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </>
    );
    if (!compact?.hide?.process)
      body.push(
        FoldSection(
          `${rootId}-proc`,
          "과정",
          "만든 순서와 맡은 일",
          r.detail?.summaries?.proc ?? r.process.map(x => x.t).join(" → "),
          <>
            {content}
            {ScenesAt("proc")}
          </>
        )
      );
  }

  // ── 9. 회고 (접힘) ──
  {
    const L = r.kptLabels ?? {keep: "Keep", problem: "Problem", try: "Try"};
    const cols: [keyof typeof r.kpt, string][] = [
      ["keep", L.keep],
      ["problem", L.problem],
      ["try", L.try]
    ];
    const content = (
      <>
        <div className="p4-kpt">
          {cols.map(([k, label], i) => (
            <div
              key={k}
              className="p4-card p4-rv"
              style={cssVars({"--d": `${i * 40}ms`})}
            >
              <h3>{label}</h3>
              <ul>
                {r.kpt[k].map((y, j) => (
                  <li key={j}>{y}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="p4-learn p4-rv">
          {r.learningLead ? <p className="p4-lead">{r.learningLead}</p> : null}
          {paragraphs(r.learning).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </>
    );
    body.push(
      FoldSection(
        `${rootId}-retro`,
        "회고",
        "배운 것과 남은 것",
        compact?.summaries?.retro ??
          r.learningLead ??
          splitHead(r.learning, 1).head,
        content
      )
    );
  }

  // 이야기 배치에서는 왜 · 운영 · 트러블슈팅 · 결과 절을 위 여섯 절이 대신한다.
  if (story) {
    const drop = new Set(
      ["why", "field", "trouble", "result"].map(k => `${rootId}-${k}`)
    );
    for (let i = body.length - 1; i >= 0; i--) {
      const k = (body[i] as {key?: unknown} | null)?.key;
      if (k != null && drop.has(String(k))) body.splice(i, 1);
    }
    for (let i = sections.length - 1; i >= 0; i--)
      if (drop.has(sections[i].id)) sections.splice(i, 1);
  }

  // ── 꼬리: 앞뒤 프로젝트 · 이력서로 ──
  const ids = Object.keys(RICH_DATA);
  const at = ids.indexOf(id);
  const prevId = ids[(at - 1 + ids.length) % ids.length];
  const nextId = ids[(at + 1) % ids.length];
  const nxCard = (pid: string, tag: string) => {
    const pr = RICH_DATA[pid];
    const t = projects.find(p => p.id === pid)?.title ?? pid;
    return (
      <Link href={`/resume/${pid}`}>
        {pr?.heroImage?.src ? (
          <img
            src={pr.heroImage.src}
            alt=""
            width={96}
            height={64}
            loading="lazy"
          />
        ) : (
          <span className="p4-nximg" />
        )}
        <span>
          <small>{tag}</small>
          <b>{t}</b>
        </span>
      </Link>
    );
  };
  sections.push({id: `${rootId}-foot`, title: "이력서로", folded: false});
  body.push(
    <section key="foot" className="p4-sec p4-foot" id={`${rootId}-foot`}>
      <div className="p4-nx p4-rv">
        {nxCard(prevId, "이전 프로젝트")}
        {nxCard(nextId, "다음 프로젝트")}
      </div>
      <div className="p4-me p4-rv">
        <Link className="p4-pill p4-blue p4-press" href="/resume">
          이력서로 돌아가기
        </Link>
        <button
          type="button"
          className="p4-pill p4-press"
          data-copy={contact.email}
        >
          <span className="p4-lbl">{contact.email} 복사</span>
        </button>
        <span>
          {hero.name} · {hero.roleTag}
        </span>
      </div>
    </section>
  );

  return (
    <div
      className={`pd4 ${nunito.variable}${compact ? " p4-compact" : ""}`}
      id={rootId}
    >
      <header className="p4-top">
        <div className="p4-topin">
          <Link href="/resume">← 이력서</Link>
          <span className="p4-name">{title}</span>
          <button type="button" className="p4-tocbtn" data-drawer-open="">
            목차
          </button>
          <span className="p4-prog" aria-hidden="true" />
        </div>
      </header>
      <div className="p4-page">
        <nav className="p4-toc" aria-label="이 페이지 목차">
          <p className="p4-toc-t">이 페이지에서</p>
          <div className="p4-tocwrap">
            <span className="p4-track" aria-hidden="true">
              <i />
            </span>
            <span className="p4-ind" aria-hidden="true" />
            <ol>
              {sections.map(s => (
                <li key={s.id} className={s.folded ? "p4-folded" : undefined}>
                  <a href={`#${s.id}`} data-to={s.id}>
                    {s.title}
                    {s.folded ? (
                      <small>
                        <i />
                        접힘
                      </small>
                    ) : null}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <main className="p4-main">{body}</main>
      </div>
      <div className="p4-drawer">
        <div className="p4-scrim" data-close="" />
        <nav className="p4-dbox" aria-label="목차">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} data-to={s.id}>
              {s.title}
            </a>
          ))}
        </nav>
      </div>
      <div
        className="p4-modal"
        role="dialog"
        aria-modal="true"
        aria-label="크게 보기"
      >
        <button
          type="button"
          className="p4-close"
          data-close=""
          aria-label="닫기"
        >
          ×
        </button>
        <div className="p4-mbox" />
      </div>
      <ProjectDetailV4Motion rootId={rootId} />
    </div>
  );
}
