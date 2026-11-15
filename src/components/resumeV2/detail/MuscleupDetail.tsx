// 득근득근 상세 페이지(v4 시안 이식).
// 시안은 브라우저에서 JSON 을 HTML 문자열로 그렸다. 여기서는 같은 문자열을 서버에서 만들어
// 본문이 HTML 에 그대로 실리게 하고, 움직임은 MuscleupDetailMotion 이 DOM 위에서 붙인다.
// 마크업을 문자열로 두는 이유는 시안 CSS·스크립트가 그 구조를 그대로 전제하기 때문이다.
import Link from "next/link";
import {Nunito} from "next/font/google";
import {STRUCTURE_LABEL, structureHref} from "@/data/structurePages";
import {MU4_DATA} from "./muscleupDetail.data";
import {MuscleupDetailMotion} from "./MuscleupDetailMotion";
import "./muscleupDetail.css";

// 숫자 전용 서체. 시안이 구글 폰트 링크로 불렀던 Nunito 700·800 을 next/font 로 싣는다.
const nunito = Nunito({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--mu4-nunito",
  display: "swap"
});

const DATA = MU4_DATA;
const p = DATA.project;
const r = p.rich;
const c = p.card;

type Img = {
  src: string;
  label: string;
  ratio?: string;
  wide?: boolean;
  fit?: string;
  caption?: string;
};
type Code = {
  filename: string;
  caption?: string;
  highlightLines?: number[];
  lines: string[];
};
type Diagram = {
  title: string;
  viewBox: number[];
  caption: string;
  groups?: {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    dashed?: boolean;
  }[];
  nodes: {
    id: string;
    label: string;
    note?: string;
    sub?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    accent?: boolean;
  }[];
  edges: {
    from: number[];
    to: number[];
    label?: string;
    kind?: string;
    labelAt?: number[] | number;
    labelDy?: number;
    bendX?: number;
  }[];
};
type Challenge = {
  title: string;
  problem: string;
  solution: string;
  code?: Code;
  evidence?: {status: string; note: string; url?: string};
};

/* ── 문자열 도구 ── */
const esc = (s: unknown) =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    ch =>
      ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[
        ch
      ] as string)
  );
const img = (src: string) => src || "";
const OUT =
  '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3h6v6M11 3L3.5 10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEV =
  '<svg class="chev" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const REPLAY = '<span class="replay" aria-hidden="true">다시 보기</span>';
const MORE_LABEL =
  "2건 더 보기 · AI 답변 품질 하네스, 브라우저와 배포 환경의 인증 차이";

function firstSent(s: string): [string, string] {
  const m = /^([\s\S]*?(?:니다|습니다|입니다|니다|다)\.)\s*([\s\S]*)$/.exec(
    String(s || "")
  );
  return m ? [m[1], m[2]] : [String(s || ""), ""];
}
function boldIn(text: string, bold?: string) {
  const t = esc(text);
  if (!bold) return t;
  const b = esc(bold);
  return t.indexOf(b) >= 0
    ? t.replace(b, '<strong class="key">' + b + "</strong>")
    : t;
}
function dims(ratio?: string) {
  const m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(ratio || "16/9");
  const w = 1200;
  const h = m ? Math.round((1200 * +m[2]) / +m[1]) : 675;
  return ' width="' + w + '" height="' + h + '"';
}
function imgTag(src: string, alt: string, ratio?: string, extra?: string) {
  return (
    '<img src="' +
    img(src) +
    '" alt="' +
    esc(alt) +
    '"' +
    dims(ratio) +
    (extra || ' loading="lazy"') +
    ">"
  );
}

/* ── 부품 ── */
function rollNum(str: string) {
  return (
    '<span class="roll-wrap"><span class="sr">' +
    esc(str) +
    '</span><span aria-hidden="true">' +
    String(str)
      .split("")
      .map(ch => {
        if (!/\d/.test(ch)) return "<span>" + esc(ch) + "</span>";
        return (
          '<span class="roll" data-d="' +
          ch +
          '"><i style="transform:translateY(0)">' +
          "0123456789"
            .split("")
            .map(d => "<b>" + d + "</b>")
            .join("") +
          "</i></span>"
        );
      })
      .join("") +
    "</span></span>"
  );
}

const RAMP: {n: number; p50: number; p95: number}[] = (() => {
  const rows: {n: number; p50: number; p95: number}[] = [];
  (r.challenges[2].code.lines || []).forEach((l: string) => {
    const m = /^\s*(\d+)\s+(\d+)ms\s+(\d+)ms/.exec(l);
    if (m) rows.push({n: +m[1], p50: +m[2], p95: +m[3]});
  });
  return rows;
})();

type Tile = {kind: string; n: string; l: string; sub: string; s: string};
function miniFor(t: Tile) {
  if (t.kind === "dots")
    return (
      '<span class="mini dots" aria-hidden="true">' +
      [0, 1, 2, 3]
        .map(
          i =>
            '<i style="--i:' + i + '"' + (i < 3 ? ' class="on"' : "") + "></i>"
        )
        .join("") +
      "</span>"
    );
  if (t.kind === "bars") {
    const pf = r.perf.rows[4];
    return (
      '<span class="mini bars" aria-hidden="true"><i><b class="b1" data-w="100"></b></i><i><b class="b2" data-w="' +
      ((pf.after / pf.before) * 100).toFixed(1) +
      '"></b></i></span>'
    );
  }
  if (t.kind === "line") {
    const W = 120,
      H = 34,
      maxN = 200,
      maxY = 1200;
    const pts = RAMP.filter(x => x.n <= maxN).map(x => [
      ((x.n / maxN) * W).toFixed(1),
      (H - (Math.min(x.p95, maxY) / maxY) * H).toFixed(1)
    ]);
    const y60 = (H - (60 / maxY) * H).toFixed(1);
    const p100 = pts[2];
    return (
      '<svg class="mini line" viewBox="0 0 ' +
      W +
      " " +
      H +
      '" aria-hidden="true"><line x1="0" y1="' +
      y60 +
      '" x2="' +
      W +
      '" y2="' +
      y60 +
      '" class="base"/><polyline points="' +
      pts.map(q => q.join(",")).join(" ") +
      '"/><circle cx="' +
      p100[0] +
      '" cy="' +
      p100[1] +
      '" r="3"/></svg>'
    );
  }
  return "";
}
function tileBtn(t: Tile, i: number) {
  return (
    '<button type="button" class="tile tilt rv t-' +
    t.kind +
    '" aria-expanded="false" style="--d:' +
    i * 60 +
    'ms"><span class="tin"><span class="lab top">' +
    esc(t.l) +
    '</span><span class="bigrow"><span class="big">' +
    rollNum(t.n) +
    "</span>" +
    miniFor(t) +
    '</span><span class="sub">' +
    esc(t.sub) +
    '</span><span class="lab row"><span>출처</span>' +
    CHEV +
    '</span><span class="srcbox"><span><p>' +
    esc(t.s) +
    "</p></span></span></span></button>"
  );
}
function codeWin(cd: Code | undefined, open: boolean) {
  if (!cd) return "";
  const hi = cd.highlightLines || [];
  const w =
    '<div class="code"><div class="bar">' +
    esc(cd.filename) +
    "</div><pre>" +
    (cd.lines || [])
      .map(
        (l, i) =>
          '<div class="ln' +
          (hi.indexOf(i + 1) >= 0 ? " hi" : "") +
          '" style="--i:' +
          i +
          '"><span>' +
          (i + 1) +
          "</span><span>" +
          esc(l) +
          "</span></div>"
      )
      .join("") +
    '</pre><i class="cur" aria-hidden="true"></i></div>';
  return (
    (cd.caption ? '<p class="code-cap">' + esc(cd.caption) + "</p>" : "") +
    '<details class="codefold"' +
    (open ? " open" : "") +
    '><summary><span class="sumrow">코드 보기 <span>' +
    esc(cd.filename) +
    "</span>" +
    CHEV +
    '</span><span class="peek" aria-hidden="true">' +
    (cd.lines || [])
      .slice(0, 2)
      .map(
        l =>
          "<span>" + esc(l.length > 40 ? l.slice(0, 40) + "…" : l) + "</span>"
      )
      .join("") +
    "</span></summary>" +
    w +
    "</details>"
  );
}
function figure(im: Img | undefined, cls: string, wide?: boolean) {
  if (!im) return "";
  return (
    '<figure class="' +
    (cls || "") +
    (im.wide || wide ? " wide" : "") +
    (im.fit === "contain" ? " contain-fig" : "") +
    '" tabindex="0" role="button" data-cap="' +
    esc(im.caption || "") +
    '" aria-label="' +
    esc(im.label) +
    ' 크게 보기"><div class="im" style="aspect-ratio:' +
    esc(im.ratio || "16/9") +
    '">' +
    (im.src
      ? imgTag(
          im.src,
          im.label,
          im.ratio,
          (im.fit === "contain" ? ' class="contain"' : "") + ' loading="lazy"'
        )
      : "") +
    "</div><figcaption><b>" +
    esc(im.label) +
    "</b>" +
    esc(firstSent(im.caption || "")[0]) +
    "</figcaption></figure>"
  );
}
function diagramSVG(d: Diagram, i: number | string) {
  const w = d.viewBox[0],
    h = d.viewBox[1];
  let s =
    '<svg viewBox="0 0 ' +
    w +
    " " +
    h +
    '" role="img" aria-label="' +
    esc(d.title || "") +
    '"><defs><marker id="mu4-ar' +
    i +
    '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7d8694"/></marker></defs>';
  (d.groups || []).forEach(g => {
    s +=
      '<rect class="dg-group' +
      (g.dashed ? " dashed" : "") +
      '" x="' +
      g.x +
      '" y="' +
      g.y +
      '" width="' +
      g.w +
      '" height="' +
      g.h +
      '" rx="18"/><text class="dg-glabel" x="' +
      (g.x + 16) +
      '" y="' +
      (g.y - 10) +
      '">' +
      esc(g.label) +
      "</text>";
  });
  (d.edges || []).forEach((e, k) => {
    let pth: string;
    if (e.bendX != null)
      pth =
        "M" +
        e.from[0] +
        " " +
        e.from[1] +
        " L" +
        e.bendX +
        " " +
        e.from[1] +
        " L" +
        e.bendX +
        " " +
        e.to[1] +
        " L" +
        e.to[0] +
        " " +
        e.to[1];
    else
      pth = "M" + e.from[0] + " " + e.from[1] + " L" + e.to[0] + " " + e.to[1];
    s +=
      '<path class="dg-edge' +
      (e.kind === "dashed" ? " dashed" : "") +
      '" d="' +
      pth +
      '" style="--i:' +
      k +
      '" marker-end="url(#mu4-ar' +
      i +
      ')"' +
      (e.kind === "double" ? ' marker-start="url(#mu4-ar' + i + ')"' : "") +
      "/>";
    if (e.label) {
      let lx: number, ly: number;
      if (Array.isArray(e.labelAt)) {
        lx = e.labelAt[0];
        ly = e.labelAt[1] + (e.labelDy || 0);
      } else {
        const t = typeof e.labelAt === "number" ? e.labelAt : 0.5;
        lx = e.from[0] + (e.to[0] - e.from[0]) * t;
        ly = e.from[1] + (e.to[1] - e.from[1]) * t + (e.labelDy || -8);
      }
      s +=
        '<text class="dg-elabel" x="' +
        lx +
        '" y="' +
        ly +
        '" text-anchor="middle">' +
        esc(e.label) +
        "</text>";
    }
  });
  (d.nodes || []).forEach((n, k) => {
    const lines: [string, string][] = [["", n.label]];
    if (n.note) lines.push(["note", n.note]);
    if (n.sub) lines.push(["sub", n.sub]);
    const lh = [22, 17, 17];
    const tot = lines.reduce((a, _l, j) => a + lh[j], 0);
    const y0 = n.y + n.h / 2 - tot / 2 + 16;
    s +=
      '<g class="dg-node' +
      (n.accent ? " accent" : "") +
      '" style="--i:' +
      k +
      '"><rect x="' +
      n.x +
      '" y="' +
      n.y +
      '" width="' +
      n.w +
      '" height="' +
      n.h +
      '" rx="16"/>';
    let y = y0;
    lines.forEach((l, j) => {
      s +=
        '<text class="' +
        l[0] +
        '" x="' +
        (n.x + n.w / 2) +
        '" y="' +
        y +
        '" text-anchor="middle">' +
        esc(l[1]) +
        "</text>";
      y += lh[j + 1] || 17;
    });
    s += "</g>";
  });
  return s + "</svg>";
}

/* ── 장면 1: 토큰 회전 시퀀스 ── */
const SEQ_CAP = [
  "탭 A 와 탭 B 가 동시에 401 을 받습니다",
  "재발급 요청은 하나로 묶입니다(single-flight)",
  "2026.04 방식: 서버가 같은 토큰을 돌려줍니다",
  "2026.10 방식: 새 토큰을 내고, 옛 토큰은 30초 유예 안에서만 재발급을 허용합니다",
  "유예가 지난 뒤 옛 토큰이 다시 오면 탈취로 보고 전부 삭제합니다"
];
function tokenSeq() {
  const W = 640,
    H = 262;
  let s =
    '<div class="scene seq" data-scene="seq" data-step="0" tabindex="0" role="img" aria-label="토큰 회전 시퀀스. ' +
    SEQ_CAP.join(". ") +
    '">' +
    REPLAY +
    '<svg viewBox="0 0 ' +
    W +
    " " +
    H +
    '" aria-hidden="true">';
  s +=
    '<text class="lane" x="10" y="67">탭 A</text><text class="lane" x="10" y="133">탭 B</text><text class="lane" x="10" y="215">서버</text>';
  s +=
    '<line class="lanel" x1="64" y1="62" x2="636" y2="62"/><line class="lanel" x1="64" y1="128" x2="636" y2="128"/><line class="lanel" x1="64" y1="210" x2="636" y2="210"/>';
  s +=
    '<g class="s1 badge"><rect x="72" y="47" width="56" height="30" rx="15"/><text x="100" y="68">401</text></g><g class="s1 badge" style="--i:1"><rect x="72" y="113" width="56" height="30" rx="15"/><text x="100" y="134">401</text></g>';
  s +=
    '<path class="s2 arrow a1" d="M136 64 C 178 64, 186 150, 212 203"/><path class="s2 arrow a2 fade" d="M136 130 C 170 130, 188 175, 212 203"/>';
  s +=
    '<g class="s2 tag"><rect x="140" y="152" width="118" height="26" rx="13"/><text x="199" y="170">single-flight</text></g>';
  s +=
    '<g class="s3"><text class="when" x="300" y="34">2026.04</text><g class="chip old"><rect x="259" y="195" width="82" height="30" rx="15"/><text x="300" y="216">토큰 T1</text></g><path class="arrow up" d="M300 193 L300 80"/><g class="chip old sm"><rect x="271" y="48" width="58" height="28" rx="14"/><text x="300" y="68">T1</text></g><g class="chip old sm"><rect x="271" y="114" width="58" height="28" rx="14"/><text x="300" y="134">T1</text></g><text class="note" x="300" y="250">같은 토큰 유지</text></g>';
  s +=
    '<g class="s4"><text class="when" x="470" y="34">2026.10</text><g class="chip new"><rect x="399" y="195" width="82" height="30" rx="15"/><text x="440" y="216">토큰 T2</text></g><g class="chip old ghost"><rect x="489" y="195" width="82" height="30" rx="15"/><text x="530" y="216">T1 폐기</text></g>';
  s +=
    '<rect class="grace-bg" x="489" y="181" width="82" height="7" rx="3.5"/><rect class="grace" x="489" y="181" width="82" height="7" rx="3.5"/><text class="note" x="530" y="172">30초 유예</text>';
  s +=
    '<path class="arrow up" d="M440 193 L440 80"/><g class="chip new sm"><rect x="411" y="48" width="58" height="28" rx="14"/><text x="440" y="68">T2</text></g><g class="ok"><path d="M432 121 l7 7 l12 -14" /><text x="458" y="134">B 재발급 허용</text></g></g>';
  // 5단계 배지는 탭 A 줄 오른쪽에 둔다. 탭 B 줄에 두면 4단계의 「B 재발급 허용」과 겹쳤고,
  // X 를 칩 한가운데 그으면 「T1 폐기」 글자가 가려졌다. X 는 칩 오른쪽 밖에 긋는다.
  s +=
    '<g class="s5"><path class="arrow bad" d="M598 80 C 612 120, 606 160, 592 192"/><g class="badge bad"><rect x="546" y="47" width="88" height="30" rx="15"/><text x="590" y="68">T1 재사용</text></g><g class="x"><line x1="580" y1="200" x2="600" y2="220"/><line x1="600" y1="200" x2="580" y2="220"/></g><text class="note bad" x="530" y="250">전부 삭제 · 탈취로 판단</text></g>';
  // 단계 자막은 버튼의 data-cap 에 실어 둔다. 클라이언트가 데이터를 따로 받지 않게 한다.
  s +=
    '</svg><p class="cap" aria-live="polite"></p><div class="dots" role="tablist" aria-label="단계">' +
    SEQ_CAP.map(
      (cap, i) =>
        '<button type="button" role="tab" data-step="' +
        (i + 1) +
        '" data-cap="' +
        esc(cap) +
        '" aria-label="' +
        (i + 1) +
        '단계"></button>'
    ).join("") +
    "</div></div>";
  return s;
}

/* ── 장면 2: perf 막대(전 → 후로 줄어듦) ── */
type Perf = {
  rows: {label: string; before: number; after: number; unit: string}[];
  note?: string;
  title?: string;
};
function perfScene(pf: Perf) {
  const rows = pf.rows;
  const mx = Math.max(...rows.map(x => x.before));
  return (
    '<div class="scene perf2 rv" data-scene="perf" tabindex="0" role="group" aria-label="' +
    esc(pf.title || "인덱스 전 → 후") +
    '">' +
    REPLAY +
    "<h3>" +
    esc(pf.title || "인덱스 전 → 후 · 실측") +
    "</h3>" +
    rows
      .map((rw, i) => {
        const last = i === rows.length - 1;
        return (
          '<div class="prow' +
          (last ? " last" : "") +
          '"><div class="pl">' +
          esc(rw.label) +
          '</div><div class="ptrack"><i class="pbar" data-from="' +
          ((rw.before / mx) * 100).toFixed(2) +
          '" data-to="' +
          ((rw.after / mx) * 100).toFixed(2) +
          '"></i>' +
          (last
            ? '<span class="bubble">남은 <b>' +
              esc(rw.after) +
              esc(rw.unit) +
              "</b> 가 count 입니다</span>"
            : "") +
          '</div><div class="pv"><span class="from">' +
          esc(rw.before) +
          esc(rw.unit) +
          '</span><span class="ar">→</span><b>' +
          esc(rw.after) +
          esc(rw.unit) +
          "</b></div></div>"
        );
      })
      .join("") +
    (pf.note ? '<p class="note">' + esc(pf.note) + "</p>" : "") +
    '<p class="src">낮을수록 좋습니다</p></div>'
  );
}

/* ── 장면 3: 동시접속 램프 그래프 ── */
function rampScene() {
  const W = 640,
    H = 260,
    L = 56,
    R = 24,
    T = 40,
    B = 40,
    maxY = 1200,
    maxX = 300;
  const X = (n: number) => L + (W - L - R) * (n / maxX);
  const Y = (v: number) => T + (H - T - B) * (1 - Math.min(v, maxY) / maxY);
  const pts = RAMP.map(d => [X(d.n), Y(d.p95)]);
  const path = pts
    .map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1))
    .join(" ");
  let s =
    '<div class="scene ramp rv" data-scene="ramp" tabindex="0" role="img" aria-label="동시접속 램프. ' +
    RAMP.map(d => d.n + "명 p95 " + d.p95 + "ms").join(", ") +
    '. 100명에서 설계 주기 60ms 를 넘었습니다">' +
    REPLAY +
    '<svg viewBox="0 0 ' +
    W +
    " " +
    H +
    '" aria-hidden="true">';
  [0, 300, 600, 900, 1200].forEach(v => {
    s +=
      '<line class="grid" x1="' +
      L +
      '" y1="' +
      Y(v) +
      '" x2="' +
      (W - R) +
      '" y2="' +
      Y(v) +
      '"/><text class="ax" x="' +
      (L - 8) +
      '" y="' +
      (Y(v) + 4) +
      '" text-anchor="end">' +
      v +
      "</text>";
  });
  s +=
    '<text class="ax unit" x="' +
    (L - 8) +
    '" y="' +
    (T - 16) +
    '" text-anchor="end">p95 ms</text>';
  RAMP.forEach(d => {
    s +=
      '<text class="ax" x="' +
      X(d.n) +
      '" y="' +
      (H - B + 18) +
      '" text-anchor="middle">' +
      d.n +
      "명</text>";
  });
  s +=
    '<line class="base" x1="' +
    L +
    '" y1="' +
    Y(60) +
    '" x2="' +
    (W - R) +
    '" y2="' +
    Y(60) +
    '"/><text class="basel" x="' +
    (W - R) +
    '" y="' +
    (Y(60) - 6) +
    '" text-anchor="end">설계 주기 60ms</text>';
  s += '<path class="line" d="' + path + '"/>';
  RAMP.forEach((d, i) => {
    const q = pts[i],
      over = d.p95 > maxY;
    s +=
      '<circle class="pt' +
      (d.n === 100 ? " hit" : "") +
      '" cx="' +
      q[0] +
      '" cy="' +
      q[1] +
      '" r="' +
      (d.n === 100 ? 6 : 4) +
      '" style="--i:' +
      i +
      '"/>' +
      (over
        ? '<text class="ax over" x="' +
          q[0] +
          '" y="' +
          (q[1] - 10) +
          '" text-anchor="middle">' +
          (d.p95 / 1000).toFixed(1) +
          "초</text>"
        : "");
  });
  const h = pts[2];
  s +=
    '<g class="hitlab"><rect x="' +
    (h[0] + 10) +
    '" y="' +
    (h[1] - 44) +
    '" width="236" height="30" rx="15"/><text x="' +
    (h[0] + 22) +
    '" y="' +
    (h[1] - 24) +
    '">100명에서 p95 85ms. 60ms 를 넘었습니다</text></g>';
  s += "</svg></div>";
  return s;
}

/* ── 렌더: 시안 render() 를 그대로 옮겼다 ── */
type SecInfo = {id: string; title: string; fold: boolean};
function renderPage(story: boolean) {
  let xfN = 0;
  const secs: SecInfo[] = [];
  function xfold(label: string, inner: string, cls?: string) {
    xfN++;
    const id = "mu4-xf" + xfN;
    return (
      '<span class="xf' +
      (cls ? " " + cls : "") +
      '"><button type="button" class="xf-btn" aria-expanded="false" aria-controls="' +
      id +
      '" data-l="' +
      esc(label) +
      '"><span class="lbl">' +
      esc(label) +
      "</span>" +
      CHEV +
      '</button><span class="fold-b xf-b" id="' +
      id +
      '"><span class="fold-in"><span class="xf-in">' +
      inner +
      "</span></span></span></span>"
    );
  }
  function sec(
    id: string,
    eyebrow: string,
    title: string,
    lead: string,
    body: string
  ) {
    secs.push({id, title, fold: false});
    return (
      '<section class="sec" id="' +
      id +
      '" data-title="' +
      esc(title) +
      '"><p class="eyebrow rv">' +
      esc(eyebrow) +
      '</p><h2 class="sec-h rv">' +
      esc(title) +
      "</h2>" +
      (lead ? '<p class="sec-p rv">' + esc(lead) + "</p>" : "") +
      '<div class="sec-body">' +
      body +
      "</div></section>"
    );
  }
  function fold(
    id: string,
    eyebrow: string,
    title: string,
    summary: string,
    body: string,
    tocTitle?: string
  ) {
    secs.push({id, title: tocTitle || title, fold: true});
    return (
      '<section class="sec fold" id="' +
      id +
      '" data-title="' +
      esc(tocTitle || title) +
      '" data-fold="1"><button type="button" class="fold-h" aria-expanded="false" aria-controls="' +
      id +
      '-b"><span><span class="eyebrow">' +
      esc(eyebrow) +
      '</span><span class="sec-h">' +
      esc(title) +
      '</span><span class="fold-sum">' +
      esc(summary) +
      "</span></span>" +
      CHEV +
      '</button><div class="fold-b" id="' +
      id +
      '-b"><div class="fold-in"><div class="sec-body">' +
      body +
      "</div></div></div></section>"
    );
  }
  function compareScene() {
    const b = r.beforeAfter.before,
      a = r.beforeAfter.after;
    return (
      '<div class="scene cmp rv" data-scene="cmp"><div class="cmp-tabs" role="tablist" aria-label="1.0 과 2.0"><button type="button" role="tab" data-pos="0">1.0</button><button type="button" role="tab" data-pos="50" aria-selected="true">반반</button><button type="button" role="tab" data-pos="100">2.0</button></div>' +
      '<div class="cmp-box" style="aspect-ratio:' +
      esc(b.shot.ratio || "2/1") +
      '"><div class="cmp-under">' +
      imgTag(b.shot.src, b.shot.label, b.shot.ratio, ' loading="lazy"') +
      '<span class="cmp-lab">BEFORE · 1.0</span></div><div class="cmp-over">' +
      imgTag(a.shot.src, a.shot.label, a.shot.ratio, ' loading="lazy"') +
      '<span class="cmp-lab r">AFTER · 2.0</span></div>' +
      '<div class="cmp-handle" role="slider" tabindex="0" aria-label="전후 비교 손잡이" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><i></i><b>⇆</b></div></div>' +
      '<div class="cmp-notes"><div><span class="lbl">BEFORE</span><h3>' +
      esc(b.label) +
      "</h3><p>" +
      esc(firstSent(b.note)[0]) +
      "</p>" +
      xfold(
        "자세히",
        "<p>" +
          esc(firstSent(b.note)[1] || "") +
          '</p><p class="src">' +
          esc(b.shot.label) +
          "</p>",
        "blk"
      ) +
      '</div><div><span class="lbl on">AFTER</span><h3>' +
      esc(a.label) +
      "</h3><p>" +
      esc(firstSent(a.note)[0]) +
      "</p>" +
      xfold(
        "자세히",
        "<p>" +
          esc(firstSent(a.note)[1] || "") +
          '</p><p class="src">' +
          esc(a.shot.label) +
          "</p>",
        "blk"
      ) +
      "</div></div></div>"
    );
  }

  const out: string[] = [];
  const title = esc(c.title).replace(/(\([^)]*\))/, "<em>$1</em>");
  const chips =
    '<span class="chip ok">' +
    esc(c.status) +
    '</span><span class="chip ok">' +
    esc(c.renewed) +
    ' 리뉴얼</span><span class="chip">' +
    esc(c.period) +
    '</span><span class="chip">' +
    esc(c.team) +
    "</span>";
  const seen: Record<string, 1> = {};
  const links: string[] = [];
  function addL(l: string, h: string) {
    if (!h || seen[h]) return;
    seen[h] = 1;
    links.push(
      '<a class="pill ' +
        (links.length ? "" : "blue ") +
        'press" href="' +
        esc(h) +
        '" target="_blank" rel="noopener">' +
        esc(l) +
        OUT +
        "</a>"
    );
  }
  (p.links || []).forEach(l => addL(l.label, l.href));
  if (r.demo) addL("GitHub", r.demo.repo);
  // 「구조 한눈에 보기」: 사이트 안 주소라 새 창으로 열지 않고 첫 버튼 다음에 둔다.
  const structure = structureHref("muscleup");
  if (structure)
    links.splice(
      Math.min(1, links.length),
      0,
      '<a class="pill press" href="' +
        esc(structure) +
        '">' +
        esc(STRUCTURE_LABEL) +
        "</a>"
    );
  const hi = r.heroImage,
    old = r.beforeAfter.before.shot;
  secs.push({id: "s-head", title: "소개", fold: false});
  out.push(
    '<section class="sec hero" id="s-head" data-title="소개"><div class="grid"><div>' +
      '<p class="eyebrow rv">' +
      esc(c.subtitle) +
      '</p><h1 class="rv">' +
      title +
      "</h1>" +
      '<div class="chipsrow rv">' +
      chips +
      "</div>" +
      // 기술 스택은 머리에 작게 먼저 보인다(2026-11-15 본인 요청).
      '<div class="techrow rv" aria-label="기술 스택">' +
      r.tech.map(x => "<span>" + esc(x) + "</span>").join("") +
      "</div>" +
      '<div class="intro rv"><p>' +
      boldIn(DATA.intro4.show, DATA.intro4.bold) +
      "</p>" +
      xfold(
        "더 읽기",
        DATA.intro4.more.map(s => "<p>" + esc(s) + "</p>").join(""),
        "blk"
      ) +
      "</div>" +
      '<div class="links rv">' +
      links.join("") +
      "</div>" +
      '</div><div class="stack rv"><figure class="frame back" aria-hidden="true"><div style="aspect-ratio:' +
      esc(old.ratio || "2/1") +
      '">' +
      imgTag(old.src, "", old.ratio, ' loading="lazy"') +
      '</div></figure><figure class="frame front"><div style="aspect-ratio:' +
      esc(hi.ratio || "2/1") +
      '">' +
      imgTag(hi.src, hi.label, hi.ratio, ' fetchpriority="high"') +
      "</div><figcaption><b>1.0 → 2.0</b> " +
      esc(hi.label) +
      "</figcaption></figure></div></div>" +
      '<div class="tiles">' +
      DATA.tiles.map(tileBtn).join("") +
      "</div>" +
      // 이야기 배치에서는 표의 줄과 겹쳐서 머리에 두지 않고 「만든 순서와 맡은 일」 접힘으로 옮긴다
      (story ? "" : hlBlock()) +
      "</section>"
  );
  function hlBlock() {
    return (
      '<div class="hl rv"><b>기술적으로 한 일</b><ul>' +
      DATA.hl4
        .map(
          (h: {show: string; more?: string; bold?: boolean}) =>
            "<li" +
            (h.bold ? ' class="key"' : "") +
            ">" +
            esc(h.show) +
            (h.more
              ? xfold("자세히", "<p>" + esc(h.more) + "</p>", "inl")
              : "") +
            "</li>"
        )
        .join("") +
      "</ul></div>"
    );
  }

  /* ── 이야기 배치(story). 머리 아래를 접지 않고 위에서 아래로 읽는 다섯 절 ──
     문제 → 첫 화면(슬라이더 + 접힌 비교 표) → 표(피드백 넷 + 막혔던 곳 여섯, 뒤 셋은 더 보기) → 새로 만든 화면 → 결과와 남은 것.
     장면(토큰 회전 · 인덱스 막대 · 동시접속 램프 · 전후 슬라이더)은 새로 그리지 않고 그대로 끼운다.
     문장은 story4 의 제목·이음말 말고는 전부 기존 원고(rich · brief4)에서 읽는다. */
  function storySections() {
    const S = DATA.story4;
    const run = r.secondRun;
    const chs = r.challenges as Challenge[];
    const gl = r.gallery as Img[];
    const dot = (x: string) => (/[다요]$/.test(x) ? x + "." : x);
    const emIn = (text: string, em?: string) => {
      const t0 = esc(text);
      if (!em) return t0;
      const e0 = esc(em);
      return t0.indexOf(e0) >= 0 ? t0.replace(e0, "<em>" + e0 + "</em>") : t0;
    };
    const ssec = (
      id: string,
      toc: string,
      h: {eyebrow: string; title: string; em?: string; lead?: string},
      body: string
    ) => {
      secs.push({id, title: toc, fold: false});
      out.push(
        '<section class="sec st" id="' +
          id +
          '" data-title="' +
          esc(toc) +
          '"><p class="eyebrow rv">' +
          esc(h.eyebrow) +
          '</p><h2 class="st-h rv">' +
          emIn(h.title, h.em) +
          "</h2>" +
          (h.lead ? '<p class="st-lead rv">' + esc(h.lead) + "</p>" : "") +
          body +
          "</section>"
      );
    };
    const zoomFig = (im: Img, cap: string, cls?: string) =>
      '<figure class="rv' +
      (cls ? " " + cls : "") +
      '" tabindex="0" role="button" data-cap="' +
      esc(im.caption || "") +
      '" aria-label="' +
      esc(im.label) +
      ' 크게 보기"><div class="im" style="aspect-ratio:' +
      esc(im.ratio || "16/9") +
      '">' +
      imgTag(im.src, im.label, im.ratio, ' class="contain" loading="lazy"') +
      "</div><figcaption>" +
      cap +
      "</figcaption></figure>";

    /* 01 문제 */
    let a =
      '<p class="st-lab rv">' +
      esc(S.problem.quotesLabel) +
      '</p><ol class="st-quotes">' +
      r.feedbackMap
        .map(
          (f, i) =>
            '<li class="rv' +
            (f.done ? "" : " todo") +
            '" style="--d:' +
            i * 70 +
            'ms"><span class="st-qn">' +
            (i + 1) +
            "</span><p>“" +
            esc(f.said) +
            '”</p><span class="st-tag ' +
            (f.done ? "ok" : "todo") +
            '">' +
            esc(f.done ? S.tagDone : S.tagTodo) +
            "</span></li>"
        )
        .join("") +
      '</ol><p class="src rv">출처: ' +
      esc(r.research.quotes[0].who) +
      "</p>";
    a +=
      '<div class="st-hyp rv"><b class="k">' +
      esc(S.problem.hypLabel) +
      "</b><p>" +
      boldIn(DATA.fb4.show, DATA.fb4.bold) +
      "</p>" +
      xfold(
        "원래 문장 보기",
        "<p>" +
          esc(r.problem) +
          '</p><p><b class="k">가설</b> ' +
          esc(r.hypothesis) +
          "</p>",
        "blk"
      ) +
      "</div>";
    ssec("s-problem", S.problem.toc, S.problem, a);

    /* 02 첫 화면. 전후 슬라이더는 지금 것을 그대로 쓴다 */
    // 1.0 과 2.0 을 나란히 놓은 표와 준비 과정은 슬라이더 아래에 접어 둔다(따로 절을 두면 같은 말이 반복됐다)
    const scopeFold =
      '<div class="st-scopefold rv">' +
      xfold(
        S.first.scopeLabel,
        '<span class="tblwrap st-scope"><table class="tbl"><thead><tr><th></th><th>' +
          esc(run.beforeHead) +
          "</th><th>" +
          esc(run.afterHead) +
          "</th></tr></thead><tbody>" +
          run.scope
            .map(
              x =>
                "<tr><td>" +
                esc(x.k) +
                "</td><td>" +
                esc(x.before) +
                "</td><td>" +
                esc(x.after) +
                "</td></tr>"
            )
            .join("") +
          '</tbody></table></span><p><b class="k">' +
          esc(run.prepTitle) +
          "</b>" +
          esc(run.prep) +
          '</p><p class="src">' +
          esc(run.source) +
          "</p>",
        "blk"
      ) +
      "</div>";
    ssec(
      "s-first",
      S.first.toc,
      S.first,
      '<p class="st-lab rv">' +
        esc(S.first.hint) +
        "</p>" +
        compareScene() +
        scopeFold
    );

    /* 03 표. 한 줄 = 제목 + 세 칸. 장면이 있는 줄은 줄 아래에 그대로 붙인다 */
    const cell = (k: string, col: string, inner: string) =>
      '<div class="st-' +
      k +
      '"><i class="st-col">' +
      esc(col) +
      "</i>" +
      inner +
      "</div>";
    const rowHtml = (
      n: number,
      title: string,
      tag: string,
      tagCls: string,
      cols: readonly string[],
      cells: [string, string, string],
      more: string
    ) =>
      '<div class="st-rowwrap"><div class="st-row rv"><h3 class="st-rt"><span class="st-n">' +
      n +
      "</span><span>" +
      esc(title) +
      "</span>" +
      (tag
        ? '<span class="st-tag ' + tagCls + '">' + esc(tag) + "</span>"
        : "") +
      '</h3><div class="st-cells">' +
      cell("a", cols[0], cells[0]) +
      cell("b", cols[1], cells[1]) +
      cell("c", cols[2], cells[2]) +
      "</div></div>" +
      more +
      "</div>";
    const headHtml = (_cols: readonly string[]) => "";
    const G = S.ledger.groups;
    let n = 0;
    const rowsA = run.remade
      .map((x, i) => {
        const done = r.feedbackMap[i].done;
        return rowHtml(
          ++n,
          x.t,
          done ? S.tagDone : S.tagTodo,
          done ? "ok" : "todo",
          G[0].cols,
          [
            "<p>" + esc(dot(x.before)) + "</p>",
            "<p>" + esc(dot(x.after)) + "</p>",
            "<p>" +
              esc(S.ledger.fbResults[i]) +
              '</p><span class="st-src">' +
              esc(x.source) +
              "</span>"
          ],
          ""
        );
      })
      .join("");
    const sceneFor = [tokenSeq(), perfScene(r.perf as Perf), rampScene()];
    const rowsBList = chs.map((x, i) => {
      const br = DATA.brief4[i];
      const side =
        (x.evidence
          ? '<div class="st-ev"><b class="k">근거 · ' +
            esc(x.evidence.status) +
            "</b><p>" +
            esc(x.evidence.note) +
            "</p>" +
            (x.evidence.url
              ? '<a class="pill sm press" href="' +
                esc(x.evidence.url) +
                '" target="_blank" rel="noopener">확인한 코드 보기' +
                OUT +
                "</a>"
              : "") +
            "</div>"
          : "") +
        '<div class="st-rest">' +
        xfold(
          "자세한 설명",
          '<p><b class="k">문제</b>' +
            esc(x.problem) +
            '</p><p><b class="k">해결</b>' +
            esc(x.solution).replace(/\n+/g, "</p><p>") +
            "</p>" +
            // 인증 시퀀스 그림은 남색 판이라 흰 화면에 늘 띄워 두지 않고 설명 안에 둔다
            (i === 0
              ? '<span class="gal st-mini">' +
                zoomFig(gl[1], "<b>" + esc(gl[1].label) + "</b>") +
                "</span>"
              : ""),
          "blk"
        ) +
        (x.code ? codeWin(x.code, false) : "") +
        "</div>";
      const sc = sceneFor[i];
      return rowHtml(
        ++n,
        x.title,
        "",
        "",
        G[1].cols,
        [
          "<p>" + esc(br.problem) + "</p>",
          "<p>" + esc(br.did) + "</p>",
          '<p class="key">' + esc(br.result) + "</p>"
        ],
        '<div class="st-more' +
          (sc ? "" : " solo") +
          '">' +
          (sc ? '<div class="st-scene">' + sc + "</div>" : "") +
          '<div class="st-side">' +
          side +
          "</div></div>"
      );
    });
    // 장면이 있는 줄만 열어 두고, 나머지는 「더 보기」 뒤에 둔다(그림 없이 글만 이어지면 집중이 끊겼다)
    const openN = sceneFor.length;
    const rowsB =
      rowsBList.slice(0, openN).join("") +
      (rowsBList.length > openN
        ? '<button type="button" class="more press rv" id="moreBtn" aria-expanded="false" aria-controls="moreCh" data-l="' +
          esc(S.ledger.moreLabel) +
          '"><span class="lbl">' +
          esc(S.ledger.moreLabel) +
          "</span>" +
          CHEV +
          '</button><div class="fold-b" id="moreCh"><div class="fold-in">' +
          rowsBList.slice(openN).join("") +
          "</div></div>"
        : "");
    const lg =
      '<div class="st-lg" data-show="all"><div class="st-lg-filter rv" role="group" aria-label="표 줄 고르기">' +
      (
        [
          ["all", S.ledger.all + " " + (run.remade.length + chs.length)],
          ["0", G[0].short + " " + run.remade.length],
          ["1", G[1].short + " " + chs.length]
        ] as const
      )
        .map(
          (x, i) =>
            '<button type="button" data-st-filter="' +
            x[0] +
            '" aria-pressed="' +
            (i ? "false" : "true") +
            '">' +
            esc(x[1]) +
            "</button>"
        )
        .join("") +
      "</div>" +
      '<div class="st-lg-grp" data-st-grp="0"><p class="st-lg-lab rv">' +
      esc(G[0].label) +
      "</p>" +
      headHtml(G[0].cols) +
      rowsA +
      '</div><div class="st-lg-grp" data-st-grp="1"><p class="st-lg-lab rv">' +
      esc(G[1].label) +
      "</p>" +
      headHtml(G[1].cols) +
      rowsB +
      '</div></div><p class="src rv bench">' +
      esc(DATA.bench) +
      "</p>";
    ssec("s-ledger", S.ledger.toc, S.ledger, lg);

    /* 04 새로 만든 화면 */
    const builtImg = [2, 3, 5, 4];
    const bt =
      '<div class="gal st-built">' +
      run.added
        .map((x, i) =>
          zoomFig(
            gl[builtImg[i]],
            "<b>" +
              esc(x.t) +
              "</b><span>" +
              esc(x.what) +
              '</span><span class="res">' +
              esc(x.result) +
              "</span>"
          )
        )
        .join("") +
      "</div>";
    ssec("s-built", S.built.toc, S.built, bt);

    /* 06 결과와 남은 것 */
    const left = r.kpt.problem as string[];
    // 남은 것을 먼저 짧게 적고 2.0 로비 화면으로 끝낸다. API 지도는 「시스템 구성」 접힘으로 갔다
    const rs =
      '<div class="st-left rv"><b class="k">' +
      esc(r.kptLabels.problem) +
      "</b><ul>" +
      left.map(x => "<li>" + esc(dot(x)) + "</li>").join("") +
      '</ul></div><div class="gal st-one">' +
      zoomFig(
        gl[0],
        "<b>" + esc(gl[0].label) + "</b>" + esc(gl[0].caption || ""),
        "wide"
      ) +
      "</div>";
    ssec("s-result", S.result.toc, {...S.result, lead: run.gaps[1]}, rs);

    out.push('<p class="st-deep rv">' + esc(S.deep) + "</p>");
  }

  /* 1. 들은 말과 한 것 */
  let q =
    '<div class="rv lead-wrap"><p class="lead-p">' +
    boldIn(DATA.fb4.show, DATA.fb4.bold) +
    "</p>" +
    xfold(
      "원래 문장 보기",
      "<p>" +
        esc(r.problem) +
        '</p><p><b class="k">가설</b> ' +
        esc(r.hypothesis) +
        "</p>",
      "blk"
    ) +
    "</div>";
  const done = r.feedbackMap.filter(f => f.done).length;
  q +=
    '<p class="eyebrow rv" style="margin-top:18px">들은 말 ' +
    r.feedbackMap.length +
    ", 한 것 " +
    done +
    '</p><table class="fb rv"><tbody>' +
    r.feedbackMap
      .map(f => {
        let didHtml: string;
        if (f.done) didHtml = esc(f.did);
        else {
          const cut = DATA.fb4.todoCut,
            i = f.did.indexOf(cut);
          if (i < 0) didHtml = esc(f.did);
          else {
            const rest = f.did.slice(i + cut.length).trim();
            didHtml =
              esc(f.did.slice(0, i + cut.length)) +
              '<span class="todo-tag">아직</span>' +
              (rest ? xfold("자세히", "<p>" + esc(rest) + "</p>", "inl") : "");
          }
        }
        return (
          "<tr" +
          (f.done ? "" : ' class="todo"') +
          "><td>“" +
          esc(f.said) +
          '”</td><td><span class="arrow">→</span>' +
          didHtml +
          "</td></tr>"
        );
      })
      .join("") +
    '</tbody></table><p class="src rv">출처: ' +
    esc(r.research.quotes[0].who) +
    "</p>";
  q +=
    '<p class="eyebrow rv" style="margin-top:22px">바꾸기 전과 후 · 손잡이를 끌어 보세요</p>' +
    compareScene();
  if (story) storySections();
  else out.push(sec("s-fb", "피드백", "들은 말과 한 것", "", q));

  /* 2. 트러블슈팅 */
  function chCard(x: Challenge, i: number, scene: string, bi?: number) {
    const b = DATA.brief4[bi == null ? i : bi];
    return (
      '<div class="card rv" style="--d:' +
      (i % 2) * 60 +
      'ms"><h3>' +
      esc(x.title) +
      '</h3><div class="brief"><p><b class="k">문제</b>' +
      esc(b.problem) +
      "</p>" +
      (scene || "") +
      '<p><b class="k">한 일</b>' +
      esc(b.did) +
      '</p><p class="key"><b class="k">결과</b>' +
      esc(b.result) +
      "</p></div>" +
      xfold(
        "자세히",
        '<p><b class="k">문제</b>' +
          esc(x.problem) +
          '</p><p><b class="k">해결</b>' +
          esc(x.solution).replace(/\n+/g, "</p><p>") +
          "</p>",
        "blk"
      ) +
      (x.evidence
        ? '<details class="ev"><summary>근거: ' +
          esc(x.evidence.status) +
          '</summary><div class="evb">' +
          esc(x.evidence.note) +
          (x.evidence.url
            ? '<br><a class="pill sm press" href="' +
              esc(x.evidence.url) +
              '" target="_blank" rel="noopener">확인한 코드 보기' +
              OUT +
              "</a>"
            : "") +
          "</div></details>"
        : "") +
      (x.code ? codeWin(x.code, false) : "") +
      "</div>"
    );
  }
  const ch = r.challenges as Challenge[];
  let t = '<div class="ch two">';
  t += chCard(ch[0], 0, tokenSeq());
  t += chCard(ch[1], 1, "");
  t += chCard(ch[2], 2, rampScene());
  t += perfScene(r.perf as Perf);
  t +=
    '</div><button type="button" class="more press rv" id="moreBtn" aria-expanded="false" aria-controls="moreCh" data-l="' +
    esc(MORE_LABEL) +
    '"><span class="lbl">' +
    esc(MORE_LABEL) +
    "</span>" +
    CHEV +
    '</button><div class="fold-b" id="moreCh"><div class="fold-in"><div class="ch two" style="margin-top:12px">' +
    ch
      .slice(3)
      .map((x, i) => chCard(x, i, "", i + 3))
      .join("") +
    '</div></div></div><p class="src rv bench">' +
    esc(DATA.bench) +
    "</p>";
  if (!story)
    out.push(sec("s-trouble", "트러블슈팅", "막혔던 곳과 푼 방법", "", t));

  /* 3. 결과 화면 */
  const gal =
    '<div class="gal two">' +
    (r.gallery as Img[]).map(im => figure(im, "rv")).join("") +
    figure(r.resultShot as Img, "rv", true) +
    "</div>";
  if (!story) out.push(sec("s-result", "결과", "결과 화면", "", gal));

  /* 4. 1.0 → 2.0 (접힘) */
  const s = r.secondRun;
  let h = "";
  h += '<p class="sec-p rv">' + esc(s.lead) + "</p>";
  h +=
    '<div class="tiles sm4" style="margin-top:14px">' +
    s.stats
      .map(
        (x, i) =>
          '<div class="tile tilt rv sm" style="--d:' +
          i * 60 +
          'ms"><div class="big">' +
          rollNum(x.n) +
          '</div><div class="lab">' +
          esc(x.l) +
          '</div><div class="src">' +
          esc(x.s) +
          "</div></div>"
      )
      .join("") +
    "</div>";
  h +=
    '<div class="tblwrap rv" style="margin-top:14px"><table class="tbl"><thead><tr><th></th><th>' +
    esc(s.beforeHead) +
    "</th><th>" +
    esc(s.afterHead) +
    "</th></tr></thead><tbody>" +
    s.scope
      .map(
        x =>
          "<tr><td>" +
          esc(x.k) +
          "</td><td>" +
          esc(x.before) +
          "</td><td>" +
          esc(x.after) +
          "</td></tr>"
      )
      .join("") +
    "</tbody></table></div>";
  h +=
    '<div class="shots" style="margin-top:14px">' +
    s.shots
      .map(
        (x, i) =>
          '<figure class="rv" style="--d:' +
          i * 40 +
          'ms">' +
          imgTag(x.src, x.alt, "2/1") +
          "<figcaption>" +
          esc(x.label) +
          "</figcaption></figure>"
      )
      .join("") +
    "</div>";
  h +=
    '<h3 class="rv sub-h">' +
    esc(s.remadeTitle) +
    '</h3><ul class="remade" style="padding:0">' +
    s.remade
      .map(
        (x, i) =>
          '<li class="rv" style="--d:' +
          i * 40 +
          'ms"><strong class="h">' +
          esc(x.t) +
          '</strong><div class="ba2"><div><b>' +
          esc(s.beforeTag) +
          "</b>" +
          esc(x.before) +
          "</div><div><b>" +
          esc(s.afterTag) +
          "</b>" +
          esc(x.after) +
          '</div></div><p class="src">' +
          esc(x.source) +
          "</p></li>"
      )
      .join("") +
    "</ul>";
  h +=
    '<h3 class="rv sub-h">' +
    esc(s.addedTitle) +
    '</h3><div class="grid2" style="margin-top:10px">' +
    s.added
      .map(
        (x, i) =>
          '<div class="card tilt rv" style="--d:' +
          i * 40 +
          'ms"><strong class="h">' +
          esc(x.t) +
          "</strong><p>" +
          esc(x.what) +
          '</p><p class="res">' +
          esc(x.result) +
          "</p></div>"
      )
      .join("") +
    "</div>";
  h +=
    '<div class="two" style="margin-top:14px"><div class="card rv"><strong class="h">' +
    esc(s.prepTitle) +
    "</strong><p>" +
    esc(s.prep) +
    '</p></div><div class="card rv"><strong class="h">아직 남은 것</strong><ul class="plain">' +
    s.gaps.map(x => "<li>" + esc(x) + "</li>").join("") +
    '</ul></div></div><p class="src rv">' +
    esc(s.source) +
    "</p>";
  // 이야기 배치에서는 이 접힘의 내용(통계·범위 표·피드백 넷·새로 만든 것·준비·남은 것)이
  // 전부 열린 절로 올라가 있어 접힘 자체를 그리지 않는다.
  if (!story)
    out.push(
      fold(
        "s-second",
        s.label,
        s.title,
        "피드백 넷을 기준으로 2026년 3월 한 달, 커밋 111개로 다시 만들었습니다.",
        h,
        "1.0에서 2.0으로"
      )
    );

  /* 5. 구조 (접힘) */
  let st =
    '<div class="grid3">' +
    r.architecture
      .map(
        (x, i) =>
          '<div class="card tilt rv" style="--d:' +
          i * 40 +
          'ms"><span class="tag">' +
          esc(x.tag) +
          '</span><strong class="h" style="margin-top:8px">' +
          esc(x.name) +
          "</strong><p>" +
          esc(x.desc) +
          "</p></div>"
      )
      .join("") +
    "</div>";
  st +=
    '<div class="chips rv" style="margin-top:14px">' +
    r.impact
      .map(x => "<span><b>" + esc(x.n) + "</b> " + esc(x.l) + "</span>")
      .join("") +
    "</div>";
  st +=
    '<div class="grid2" style="margin-top:14px">' +
    (r.diagrams as Diagram[])
      .map(
        (d, i) =>
          '<div class="diag rv" data-diag="' +
          i +
          '" tabindex="0" role="button" aria-label="' +
          esc(d.title) +
          ' 크게 보기"><h3>' +
          esc(d.title) +
          "</h3>" +
          diagramSVG(d, i) +
          "<p>" +
          esc(d.caption) +
          "</p></div>"
      )
      .join("") +
    "</div>";
  st +=
    '<h3 class="rv sub-h">기술 결정</h3><table class="dec rv"><thead><tr><th>영역</th><th>선택</th><th>왜, 그리고 대안</th></tr></thead><tbody>' +
    r.decisions
      .map(
        d =>
          "<tr><td>" +
          esc(d.area) +
          '</td><td class="pick">' +
          esc(d.pick) +
          "</td><td>" +
          esc(d.why) +
          '<div class="vs"><b>대안</b> ' +
          esc(d.alt) +
          "</div></td></tr>"
      )
      .join("") +
    "</tbody></table>";
  st +=
    '<div class="dec-cards">' +
    r.decisions
      .map(
        d =>
          '<div class="card rv"><b class="area">' +
          esc(d.area) +
          '</b><strong class="h">' +
          esc(d.pick) +
          "</strong><p>" +
          esc(d.why) +
          "</p><p><b>대안</b> " +
          esc(d.alt) +
          "</p></div>"
      )
      .join("") +
    "</div>";
  if (story)
    st +=
      '<div class="gal st-one">' +
      figure(r.resultShot as Img, "rv", true) +
      "</div>";
  out.push(
    fold(
      "s-arch",
      "구조",
      "시스템 구성",
      "REST 서버와 실시간 서버를 나눈 3-tier. 2.0 공개 때 엔티티 31개, 컨트롤러 28개였고 지금은 62개, 46개입니다.",
      st
    )
  );

  /* 6. 핵심 코드 (접힘) */
  out.push(
    fold(
      "s-code",
      "코드",
      "핵심 코드",
      "실시간 서버의 60ms 틱 게이트와 401 재발급 인터셉터.",
      '<div class="grid2">' +
        (r.coreCode as Code[])
          .map(
            (x, i) =>
              '<div class="rv" style="--d:' +
              i * 40 +
              'ms">' +
              codeWin(x, true) +
              "</div>"
          )
          .join("") +
        "</div>"
    )
  );

  /* 7. 순서와 맡은 일 (접힘) */
  let pw =
    '<ol class="tl">' +
    r.process
      .map(
        (x, i) =>
          '<li class="rv" style="--d:' +
          i * 40 +
          'ms"><strong class="h">' +
          esc(x.t) +
          "</strong><p>" +
          esc(x.d) +
          "</p></li>"
      )
      .join("") +
    "</ol>";
  pw +=
    '<div class="grid3 work" style="margin-top:14px">' +
    r.work
      .map(
        (w, i) =>
          '<div class="card rv" style="--d:' +
          i * 40 +
          'ms"><strong class="h">' +
          esc(w.g) +
          "</strong><ul>" +
          w.items.map(x => "<li>" + esc(x) + "</li>").join("") +
          "</ul></div>"
      )
      .join("") +
    "</div>";
  pw +=
    '<p class="eyebrow rv" style="margin-top:18px">기능</p><div class="grid3" style="margin-top:8px">' +
    r.features
      .map(
        (f, i) =>
          '<div class="card tilt rv" style="--d:' +
          i * 40 +
          'ms"><strong class="h">' +
          esc(f.t) +
          "</strong><p>" +
          esc(f.d) +
          "</p></div>"
      )
      .join("") +
    "</div>";
  pw +=
    '<dl class="meta rv">' +
    r.meta
      .map(
        m =>
          "<div><dt>" +
          esc(m.label) +
          "</dt><dd>" +
          esc(m.value) +
          "</dd></div>"
      )
      .join("") +
    "</dl>";
  if (story) pw = hlBlock() + pw;
  out.push(
    fold(
      "s-proc",
      "과정",
      "만든 순서와 맡은 일",
      "루프 기획 → REST 도메인 → 인증 → 실시간 분리 → AI.",
      pw
    )
  );

  /* 8. 회고 (접힘) */
  const KL = r.kptLabels;
  let kk =
    '<div class="kpt' +
    (story ? " kpt2" : "") +
    '">' +
    (
      [
        ["keep", KL.keep],
        ["problem", KL.problem],
        ["try", KL.try]
      ] as const
    )
      // 이야기 배치는 「아직 남은 것」을 결과 절에 열어 두므로 여기서는 뺀다
      .filter(x => !(story && x[0] === "problem"))
      .map(
        (x, i) =>
          '<div class="card rv" style="--d:' +
          i * 40 +
          'ms"><h3>' +
          esc(x[1]) +
          "</h3><ul>" +
          r.kpt[x[0]].map(y => "<li>" + esc(y) + "</li>").join("") +
          "</ul></div>"
      )
      .join("") +
    "</div>";
  kk +=
    // 요약 줄(learningLead)은 접힌 머리에 이미 있어 안쪽에서 다시 그리지 않는다.
    '<div class="learn rv"><p>' + esc(r.learning) + "</p></div>";
  out.push(fold("s-retro", "회고", "배운 것과 남은 것", r.learningLead, kk));

  /* 꼬리. 시안의 이력서 링크(c-family-v6.html)는 /resume 으로 바꿨다 */
  secs.push({id: "s-foot", title: "이력서로", fold: false});
  out.push(
    '<section class="sec foot" id="s-foot" data-title="이력서로"><div class="me rv"><a class="pill blue press" href="/resume">이력서로 돌아가기</a><button type="button" class="pill press" data-copy="' +
      esc(DATA.contact.email) +
      '"><span class="lbl">' +
      esc(DATA.contact.email) +
      " 복사</span></button><span>" +
      esc(DATA.hero.name) +
      " · " +
      esc(DATA.hero.roleTag) +
      "</span></div></section>"
  );

  // 목차와 휴대폰 서랍. 시안은 마운트 뒤 섹션을 읽어 만들었다.
  const toc =
    '<p class="toc-t">이 페이지에서</p><ol><span class="track" aria-hidden="true"><i data-r="tocfill"></i></span><span class="ind" data-r="tocind"></span>' +
    secs
      .map(
        x =>
          '<li class="' +
          (x.fold ? "folded" : "") +
          '"><a href="#' +
          x.id +
          '" data-to="' +
          x.id +
          '">' +
          esc(x.title) +
          (x.fold ? "<small><i></i>접힘</small>" : "") +
          "</a></li>"
      )
      .join("") +
    "</ol>";
  const drawer = secs
    .map(
      x =>
        '<a href="#' +
        x.id +
        '" data-to="' +
        x.id +
        '">' +
        esc(x.title) +
        "</a>"
    )
    .join("");

  // 크게 보기 모달에 넣을 다이어그램. 클라이언트가 이 틀을 복제해 쓴다.
  const diagModal = (r.diagrams as Diagram[]).map(
    (d, i) =>
      '<h3 style="font-size:18px;font-weight:800;margin-bottom:8px">' +
      esc(d.title) +
      "</h3>" +
      diagramSVG(d, "m" + i) +
      '<p style="font-size:14px;color:var(--sub);margin-top:10px">' +
      esc(d.caption) +
      "</p>"
  );

  return {main: out.join(""), toc, drawer, diagModal};
}

export function MuscleupDetail({story = false}: {story?: boolean}) {
  const html = renderPage(story);
  return (
    <MuscleupDetailMotion className={`mu4 ${nunito.variable}`}>
      <header className="top">
        <div className="topin">
          {/* 시안의 「시안 목록」 링크는 빼고, 이력서로 가는 링크를 휴대폰에서도 보이게 남겼다 */}
          <Link href="/resume">← 이력서</Link>
          <span className="name" style={{cursor: "default"}}>
            {c.title}
          </span>
          <button type="button" className="tocbtn" data-r="tocbtn">
            목차
          </button>
          <span className="prog" data-r="prog" aria-hidden="true"></span>
        </div>
      </header>
      <div className="page">
        <aside
          className="toc"
          data-r="toc"
          aria-label="이 페이지 목차"
          dangerouslySetInnerHTML={{__html: html.toc}}
        />
        <main data-r="main" dangerouslySetInnerHTML={{__html: html.main}} />
      </div>
      <div className="drawer" data-r="drawer">
        <div className="scrim" data-close=""></div>
        <div
          className="box"
          data-r="drawerbox"
          dangerouslySetInnerHTML={{__html: html.drawer}}
        />
      </div>
      <div
        className="modal"
        data-r="modal"
        role="dialog"
        aria-modal="true"
        aria-label="크게 보기"
      >
        <button type="button" className="close" data-close="" aria-label="닫기">
          ×
        </button>
        <div className="box" data-r="modalbox"></div>
      </div>
      <div className="toast" role="status" aria-live="polite"></div>
      {html.diagModal.map((m, i) => (
        <template
          key={i}
          data-mu4-diag={i}
          dangerouslySetInnerHTML={{__html: m}}
        />
      ))}
    </MuscleupDetailMotion>
  );
}

export default MuscleupDetail;
