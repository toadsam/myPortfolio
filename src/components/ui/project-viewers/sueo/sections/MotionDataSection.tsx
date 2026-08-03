"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {CodePanel, fade, Kicker, rise, WordHeading} from "../parts";
import {cloneSigns, SIGNS, WORD_ORDER, type SignData} from "../signData";
import {useInView, useTimeline} from "../useTimeline";

const TOTAL_FRAMES = 4; // 키프레임 5개 → 구간 4개
const STEPS = [0, 150, 700, 1200, 1700, 2200];
const IDX = {label: 0, heading: 1, p1: 2, p2: 3, panels: 4, handLabel: 5};

const DECISIONS: {item: string; keep: boolean; verdict: string; why: string}[] =
  [
    {
      item: "손 위치 좌표",
      keep: true,
      verdict: "저장",
      why: "같은 손 모양도 위치가 뜻을 바꾼다"
    },
    {
      item: "이동 경로",
      keep: true,
      verdict: "저장",
      why: "직선인지 곡선인지가 다른 단어가 된다"
    },
    {
      item: "손가락 굽힘 정도",
      keep: true,
      verdict: "저장",
      why: "지문자와 단어를 같은 구조로 다룰 수 있다"
    },
    {
      item: "표정",
      keep: false,
      verdict: "✕ 안 함",
      why: "표정도 문법의 일부인데 이번 범위에서 뺐다"
    },
    {
      item: "속도",
      keep: false,
      verdict: "✕ 안 함",
      why: "재생 속도는 학습자가 정하게 했다"
    },
    {
      item: "손의 외형",
      keep: false,
      verdict: "✕ 안 함",
      why: "피부색·성별 같은 건 데이터에 넣지 않았다"
    }
  ];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 두 키프레임 사이를 보간한 현재 포즈. */
function interpolate(sign: SignData, frameFloat: number, linear: boolean) {
  const i1 = Math.floor(frameFloat);
  const i2 = Math.min(Math.ceil(frameFloat), sign.keyframes.length - 1);
  const kf1 = sign.keyframes[i1];
  if (i1 === i2) return kf1;

  const kf2 = sign.keyframes[i2];
  const t = frameFloat - i1;
  // 원안과 같은 ease-in-out. 동작 줄이기에서는 선형으로 둔다.
  const e = linear ? t : t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  return {
    timeOffset: 0,
    position: {
      x: lerp(kf1.position.x, kf2.position.x, e),
      y: lerp(kf1.position.y, kf2.position.y, e)
    },
    wristRotation: lerp(kf1.wristRotation, kf2.wristRotation, e),
    fingerFlex: kf1.fingerFlex.map((v, i) => lerp(v, kf2.fingerFlex[i], e))
  };
}

/** JSON 한 줄. 키프레임 블록에는 data-idx를 달아 강조 대상으로 삼는다. */
function Line({
  n,
  idx,
  children
}: {
  n: number;
  idx?: number;
  children: React.ReactNode;
}) {
  return (
    <tr data-kf={idx}>
      <td className="sd-gutter">{n}</td>
      <td className={idx === undefined ? "whitespace-pre pl-4" : "sd-code-td"}>
        {children}
      </td>
    </tr>
  );
}

function JsonRows({sign}: {sign: SignData}) {
  const rows: React.ReactNode[] = [];
  let n = 1;

  rows.push(
    <Line key="o" n={n++}>
      <span className="sd-key">{"{"}</span>
    </Line>
  );
  const head: [string, React.ReactNode][] = [
    ["id", <span className="sd-str">&quot;{sign.id}&quot;</span>],
    ["label", <span className="sd-str">&quot;{sign.label}&quot;</span>],
    ["durationMs", <span className="sd-num">{sign.durationMs}</span>],
    [
      "handedness",
      <span className="sd-str">&quot;{sign.handedness}&quot;</span>
    ],
    ["note", <span className="sd-str">&quot;{sign.note}&quot;</span>]
  ];
  head.forEach(([k, v]) => {
    rows.push(
      <Line key={k} n={n++}>
        {"  "}
        <span className="sd-str">&quot;{k}&quot;</span>: {v},
      </Line>
    );
  });
  rows.push(
    <Line key="kfo" n={n++}>
      {"  "}
      <span className="sd-str">&quot;keyframes&quot;</span>:{" "}
      <span className="sd-key">[</span>
    </Line>
  );

  sign.keyframes.forEach((kf, idx) => {
    const last = idx === sign.keyframes.length - 1;
    rows.push(
      <Line key={`${idx}-a`} n={n++} idx={idx}>
        {"    "}
        <span className="sd-key">{"{"}</span>
      </Line>,
      <Line key={`${idx}-b`} n={n++} idx={idx}>
        {"      "}
        <span className="sd-str">&quot;timeOffset&quot;</span>:{" "}
        <span className="sd-num">{kf.timeOffset.toFixed(2)}</span>,
      </Line>,
      <Line key={`${idx}-c`} n={n++} idx={idx}>
        {"      "}
        <span className="sd-str">&quot;position&quot;</span>: {"{ "}
        <span className="sd-str">&quot;x&quot;</span>:{" "}
        <span className="sd-num" data-val="x">
          {Math.round(kf.position.x)}
        </span>
        , <span className="sd-str">&quot;y&quot;</span>:{" "}
        <span className="sd-num" data-val="y">
          {Math.round(kf.position.y)}
        </span>
        {" },"}
      </Line>,
      <Line key={`${idx}-d`} n={n++} idx={idx}>
        {"      "}
        <span className="sd-str">&quot;wristRotation&quot;</span>:{" "}
        <span className="sd-num">{Math.round(kf.wristRotation)}</span>,
      </Line>,
      <Line key={`${idx}-e`} n={n++} idx={idx}>
        {"      "}
        <span className="sd-str">&quot;fingerFlex&quot;</span>: [
        <span className="sd-num">
          {kf.fingerFlex.map(f => f.toFixed(1)).join(", ")}
        </span>
        ]{kf.hold ? "," : ""}
      </Line>
    );
    if (kf.hold) {
      rows.push(
        <Line key={`${idx}-h`} n={n++} idx={idx}>
          {"      "}
          <span className="sd-str">&quot;hold&quot;</span>:{" "}
          <span className="sd-key">true</span>
        </Line>
      );
    }
    rows.push(
      <Line key={`${idx}-f`} n={n++} idx={idx}>
        {"    "}
        <span className="sd-key">{"}"}</span>
        {last ? "" : ","}
      </Line>
    );
  });

  rows.push(
    <Line key="kfc" n={n++}>
      {"  "}
      <span className="sd-key">]</span>
    </Line>,
    <Line key="c" n={n++}>
      <span className="sd-key">{"}"}</span>
    </Line>
  );

  return <>{rows}</>;
}

export function MotionDataSection() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  // 드래그로 편집되는 데이터는 ref로 들고, 표시 갱신이 필요할 때만 리렌더한다.
  const signsRef = useRef(cloneSigns());
  const [wordId, setWordId] = useState<string>("hello");
  const [, forceRender] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [edited, setEdited] = useState(false);
  const [interacted, setInteracted] = useState(false);

  const frameRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const scrubbingRef = useRef(false);
  const dragIdxRef = useRef(0);

  const stageRef = useRef<SVGSVGElement>(null);
  const handRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const fingersRef = useRef<(SVGRectElement | null)[]>([]);
  const codeRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLInputElement>(null);
  const readoutRef = useRef<HTMLSpanElement[]>([]);
  const timeRef = useRef<HTMLSpanElement[]>([]);
  const trailBuf = useRef<{x: number; y: number; age: number}[]>([]);

  const sign = signsRef.current[wordId];

  playingRef.current = playing;
  speedRef.current = speed;

  const clearTrail = useCallback(() => {
    trailBuf.current = [];
    trailRef.current?.setAttribute("d", "");
  }, []);

  // ── 렌더 루프 ────────────────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    let last: number | null = null;

    function draw(now: number) {
      const dt = last === null ? 0 : now - last;
      last = now;
      const s = signsRef.current[wordId];

      if (playingRef.current && !scrubbingRef.current && dt > 0) {
        frameRef.current +=
          (dt / s.durationMs) * speedRef.current * TOTAL_FRAMES;
        if (frameRef.current >= TOTAL_FRAMES) {
          frameRef.current = TOTAL_FRAMES;
          setPlaying(false);
          playingRef.current = false;
          clearTrail();
          bumpSignCount();
        }
      }

      const f = frameRef.current;
      const pose = interpolate(s, f, rm);

      handRef.current?.setAttribute(
        "transform",
        `translate(${pose.position.x}, ${pose.position.y}) rotate(${pose.wristRotation})`
      );
      fingersRef.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleY(${1 - pose.fingerFlex[i] * 0.75})`;
      });

      // 잔상 — 재생 중에만 남기고 0.8초 뒤 사라진다.
      if (!rm && playingRef.current && dt > 0) {
        trailBuf.current.push({x: pose.position.x, y: pose.position.y, age: 0});
        let d = "";
        const next: typeof trailBuf.current = [];
        for (const pt of trailBuf.current) {
          pt.age += dt;
          if (pt.age < 800) {
            next.push(pt);
            d += `${next.length === 1 ? "M" : "L"}${pt.x},${pt.y} `;
          }
        }
        trailBuf.current = next;
        trailRef.current?.setAttribute("d", d);
      }

      highlight(f);

      const frameInt = Math.round(f) + 1;
      const secs = ((f / TOTAL_FRAMES) * (s.durationMs / 1000)).toFixed(2);
      readoutRef.current.forEach(
        el => el && (el.textContent = String(frameInt))
      );
      timeRef.current.forEach(el => el && (el.textContent = `${secs}s`));
      if (scrubRef.current && !scrubbingRef.current) {
        scrubRef.current.value = String(f);
        scrubRef.current.setAttribute("aria-valuenow", String(frameInt));
        scrubRef.current.setAttribute("aria-valuetext", `프레임 ${frameInt}`);
      }

      raf = requestAnimationFrame(draw);
    }

    function highlight(f: number) {
      const box = codeRef.current;
      if (!box) return;
      box.querySelectorAll<HTMLElement>(".sd-code-td").forEach(td => {
        td.style.backgroundColor = "transparent";
        td.style.borderLeftColor = "transparent";
      });
      if (chipRef.current) chipRef.current.style.opacity = "0";

      const i1 = Math.floor(f);
      const i2 = Math.ceil(f);
      const progress = f - i1;
      const snapped = progress < 0.05 || progress > 0.95 || i1 === i2;

      const paint = (idx: number, bg: string, border: string) =>
        box
          .querySelectorAll<HTMLElement>(`tr[data-kf="${idx}"] .sd-code-td`)
          .forEach(td => {
            td.style.backgroundColor = bg;
            td.style.borderLeftColor = border;
          });

      if (snapped) {
        const target = Math.round(f);
        paint(target, "rgba(126,184,255,0.14)", "#7eb8ff");
        if (playingRef.current) {
          const row = box.querySelector<HTMLElement>(`tr[data-kf="${target}"]`);
          if (row) {
            box.scrollTo({
              top: row.offsetTop - box.clientHeight / 2 + 50,
              behavior: rm ? "auto" : "smooth"
            });
          }
        }
      } else {
        paint(i1, "rgba(126,184,255,0.05)", "rgba(126,184,255,0.3)");
        paint(i2, "rgba(126,184,255,0.05)", "rgba(126,184,255,0.3)");
        const row2 = box.querySelector<HTMLElement>(`tr[data-kf="${i2}"]`);
        if (row2 && chipRef.current) {
          chipRef.current.style.top = `${row2.offsetTop - 10}px`;
          chipRef.current.style.opacity = "1";
          if (playingRef.current) {
            box.scrollTo({
              top: row2.offsetTop - box.clientHeight / 2,
              behavior: "auto"
            });
          }
        }
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [wordId, rm, bumpSignCount, clearTrail]);

  // ── 조작 ─────────────────────────────────────────────────────────────────
  function togglePlay() {
    setInteracted(true);
    if (playing) {
      setPlaying(false);
      clearTrail();
    } else {
      if (frameRef.current >= TOTAL_FRAMES) frameRef.current = 0;
      setPlaying(true);
    }
  }

  function step(dir: number) {
    setInteracted(true);
    setPlaying(false);
    const next = Math.max(
      0,
      Math.min(TOTAL_FRAMES, Math.round(frameRef.current) + dir)
    );
    frameRef.current = next;
    clearTrail();
    announce(`프레임 ${next + 1}`);
  }

  function pickWord(id: string) {
    if (id === wordId) return;
    setWordId(id);
    setPlaying(false);
    frameRef.current = 0;
    clearTrail();
    setEdited(false);
    announce(
      `${signsRef.current[id].label} 선택됨. ${signsRef.current[id].note}`
    );
  }

  // ── 손 드래그로 키프레임 좌표 편집 ───────────────────────────────────────
  function onPointerDown(e: React.PointerEvent<SVGGElement>) {
    if (playingRef.current) return;
    const idx = Math.round(frameRef.current);
    dragIdxRef.current = idx;
    frameRef.current = idx;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handRef.current?.classList.add("sd-dragging");
    dragPrev.current = toSvg(e.clientX, e.clientY);
  }

  const dragPrev = useRef<{x: number; y: number} | null>(null);

  function toSvg(clientX: number, clientY: number) {
    const svg = stageRef.current;
    if (!svg) return {x: 0, y: 0};
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return {x: 0, y: 0};
    const p = pt.matrixTransform(ctm.inverse());
    return {x: p.x, y: p.y};
  }

  function onPointerMove(e: React.PointerEvent<SVGGElement>) {
    if (!dragPrev.current) return;
    const cur = toSvg(e.clientX, e.clientY);
    const dx = cur.x - dragPrev.current.x;
    const dy = cur.y - dragPrev.current.y;
    dragPrev.current = cur;

    const kf = signsRef.current[wordId].keyframes[dragIdxRef.current];
    kf.position.x += dx;
    kf.position.y += dy;

    // 드래그 중에는 리렌더 없이 해당 줄의 숫자만 직접 갱신한다(원안과 동일).
    const row = codeRef.current?.querySelector(
      `tr[data-kf="${dragIdxRef.current}"] [data-val="x"]`
    ) as HTMLElement | null;
    const rowY = codeRef.current?.querySelector(
      `tr[data-kf="${dragIdxRef.current}"] [data-val="y"]`
    ) as HTMLElement | null;
    if (row) {
      row.textContent = String(Math.round(kf.position.x));
      row.style.color = "var(--sd-warn)";
    }
    if (rowY) {
      rowY.textContent = String(Math.round(kf.position.y));
      rowY.style.color = "var(--sd-warn)";
    }
  }

  function onPointerUp() {
    if (!dragPrev.current) return;
    dragPrev.current = null;
    handRef.current?.classList.remove("sd-dragging");
    setEdited(true);
  }

  function revert() {
    const idx = dragIdxRef.current;
    const orig = SIGNS[wordId].keyframes[idx].position;
    signsRef.current[wordId].keyframes[idx].position = {...orig};
    setEdited(false);
    forceRender(v => v + 1);
    announce("수정한 프레임을 원래 값으로 되돌렸습니다.");
  }

  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1140px] flex-col items-center px-6 py-[100px] lg:px-8"
    >
      {/* ── 도입 ── */}
      <div className="mb-[80px] w-full max-w-[740px] text-center">
        <Kicker on={on(IDX.label)} instant={rm} className="mb-4">
          01 · 동작 데이터
        </Kicker>
        <WordHeading
          text="사진 한 장으로는 수어를 담을 수 없다"
          on={on(IDX.heading)}
          instant={rm}
          stepMs={30}
          className="mb-8 justify-center text-[28px] font-black leading-tight"
        />
        <div className="space-y-[18px] text-left">
          <p
            className="text-[16px] leading-[36px]"
            style={fade(on(IDX.p1), rm)}
          >
            수어 사전들이 대부분 손 모양 사진을 보여준다. 그런데 같은 손
            모양이라도 어디서 시작해서 어디로 가는지에 따라 뜻이 달라진다. 정지
            이미지로는 그 차이를 표현할 방법이 없었다.
          </p>
          <p
            className="text-[16px] leading-[36px]"
            style={fade(on(IDX.p2), rm)}
          >
            그래서 동작을{" "}
            <strong className="font-bold text-[var(--sd-accent)]">
              시간 순서가 있는 데이터
            </strong>
            로 저장하기로 했다. 아래 손을 직접 재생하고 멈춰보세요. 지금 어느
            프레임인지 오른쪽에서 보입니다.
          </p>
        </div>
      </div>

      {/* ── 플레이어 + 코드 ── */}
      <div className="flex w-full flex-col items-start gap-[20px] lg:flex-row">
        {/* 플레이어 */}
        <div
          className="relative flex h-auto w-full flex-col rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-5 lg:h-[520px] lg:w-[52%]"
          style={rise(on(IDX.panels), rm)}
        >
          <div className="mb-2 flex h-[32px] items-center justify-between">
            <span className="font-mono text-[11px] text-[rgba(255,255,255,0.72)]">
              동작 재생기
            </span>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="단어 선택"
            >
              {WORD_ORDER.map(id => {
                const active = id === wordId;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => pickWord(id)}
                    className="rounded-full border border-[rgba(126,184,255,0.24)] px-[12px] py-[5px] font-mono text-[11px] transition-colors"
                    style={
                      active
                        ? {
                            background: "rgba(126,184,255,0.14)",
                            color: "var(--sd-primary)"
                          }
                        : {color: "var(--sd-muted)"}
                    }
                  >
                    {SIGNS[id].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 무대 */}
          <div className="relative flex h-[240px] flex-1 flex-col items-center justify-center overflow-hidden rounded border border-[rgba(0,0,0,0.5)] bg-[#09121f] shadow-inner sm:h-[340px] lg:h-auto">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(126,184,255,0.05)_0%,transparent_60%)]" />

            <svg
              ref={stageRef}
              viewBox="-150 -150 300 300"
              className="absolute inset-0 h-full w-full"
            >
              <path
                ref={trailRef}
                fill="none"
                stroke="rgba(126,184,255,0.28)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g
                ref={handRef}
                className="sd-draggable"
                transform="translate(0,0) rotate(0)"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <path
                  d="M-28,10 Q-35,-40 -28,-75 L28,-75 Q35,-40 28,10 Z"
                  fill="var(--sd-hand)"
                />
                <path d="M-28,10 Q0,25 28,10 Z" fill="var(--sd-hand)" />
                <g transform="translate(-25, -20) rotate(-45)">
                  <rect
                    ref={el => {
                      fingersRef.current[0] = el;
                    }}
                    className="sd-hand-part"
                    x="-7"
                    y="-35"
                    width="14"
                    height="35"
                    rx="7"
                    fill="var(--sd-hand)"
                  />
                </g>
                <g transform="translate(-18, -72)">
                  <rect
                    ref={el => {
                      fingersRef.current[1] = el;
                    }}
                    className="sd-hand-part"
                    x="-6.5"
                    y="-50"
                    width="13"
                    height="50"
                    rx="6.5"
                    fill="var(--sd-hand)"
                  />
                </g>
                <g transform="translate(0, -75)">
                  <rect
                    ref={el => {
                      fingersRef.current[2] = el;
                    }}
                    className="sd-hand-part"
                    x="-7"
                    y="-55"
                    width="14"
                    height="55"
                    rx="7"
                    fill="var(--sd-hand)"
                  />
                </g>
                <g transform="translate(18, -72)">
                  <rect
                    ref={el => {
                      fingersRef.current[3] = el;
                    }}
                    className="sd-hand-part"
                    x="-6.5"
                    y="-50"
                    width="13"
                    height="50"
                    rx="6.5"
                    fill="var(--sd-hand)"
                  />
                </g>
                <g transform="translate(34, -60) rotate(10)">
                  <rect
                    ref={el => {
                      fingersRef.current[4] = el;
                    }}
                    className="sd-hand-part"
                    x="-5"
                    y="-40"
                    width="10"
                    height="40"
                    rx="5"
                    fill="var(--sd-hand)"
                  />
                </g>
              </g>
            </svg>

            <div
              className="pointer-events-none absolute bottom-4 flex flex-col items-center"
              style={fade(on(IDX.handLabel), rm)}
            >
              <span className="font-mono text-[13px] font-bold text-[var(--sd-accent)] drop-shadow-md">
                {sign.label}
              </span>
              <span className="mt-1 font-mono text-[10px] text-[var(--sd-muted)]">
                한국수어 · 예시 표현
              </span>
            </div>

            <button
              type="button"
              onClick={revert}
              className="absolute top-4 flex items-center gap-2 rounded-full border border-[rgba(251,191,36,0.3)] bg-[#1a1708] px-3 py-1.5 font-mono text-[10px] text-[var(--sd-warn)] shadow-lg transition-opacity hover:bg-[#2a240d]"
              style={{
                opacity: edited ? 1 : 0,
                pointerEvents: edited ? "auto" : "none"
              }}
            >
              이 프레임을 수정했습니다 · ↻ 되돌리기
            </button>
          </div>

          {/* 컨트롤 */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="재생/일시정지"
                  className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[rgba(126,184,255,0.35)] transition-colors hover:bg-[rgba(126,184,255,0.1)] ${
                    !interacted && on(IDX.handLabel) && !rm
                      ? "sd-play-pulse"
                      : ""
                  }`}
                >
                  {playing ? (
                    <span className="flex gap-[4px]">
                      <span className="h-[12px] w-[3px] rounded-sm bg-[var(--sd-primary)]" />
                      <span className="h-[12px] w-[3px] rounded-sm bg-[var(--sd-primary)]" />
                    </span>
                  ) : (
                    <span className="ml-1 h-0 w-0 border-b-[7px] border-l-[11px] border-t-[7px] border-b-transparent border-l-[var(--sd-primary)] border-t-transparent" />
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="이전 프레임"
                    title="이전 프레임"
                    className="flex h-[32px] w-[32px] items-center justify-center rounded font-mono text-[14px] text-[var(--sd-primary)] transition-colors hover:bg-[rgba(126,184,255,0.1)]"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="다음 프레임"
                    title="다음 프레임"
                    className="flex h-[32px] w-[32px] items-center justify-center rounded font-mono text-[14px] text-[var(--sd-primary)] transition-colors hover:bg-[rgba(126,184,255,0.1)]"
                  >
                    ▶
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-1 font-mono text-[12px] tabular-nums text-[var(--sd-muted)] sm:flex">
                  프레임{" "}
                  <span
                    ref={el => {
                      if (el) readoutRef.current[0] = el;
                    }}
                    className="text-white"
                  >
                    1
                  </span>{" "}
                  / 5 ·{" "}
                  <span
                    ref={el => {
                      if (el) timeRef.current[0] = el;
                    }}
                    className="inline-block w-[38px] text-right"
                  >
                    0.00s
                  </span>
                </div>

                <div
                  className="flex rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.05)] p-[2px]"
                  role="radiogroup"
                  aria-label="재생 속도"
                >
                  {[0.5, 1, 2].map(s => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={speed === s}
                      onClick={() => setSpeed(s)}
                      className="rounded-full px-2 py-1 font-mono text-[10px] transition-colors"
                      style={
                        speed === s
                          ? {
                              background: "rgba(126,184,255,0.15)",
                              color: "var(--sd-primary)"
                            }
                          : {color: "var(--sd-muted)"}
                      }
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 font-mono text-[12px] tabular-nums text-[var(--sd-muted)] sm:hidden">
              프레임{" "}
              <span
                ref={el => {
                  if (el) readoutRef.current[1] = el;
                }}
                className="text-white"
              >
                1
              </span>{" "}
              / 5 ·{" "}
              <span
                ref={el => {
                  if (el) timeRef.current[1] = el;
                }}
                className="inline-block w-[38px] text-right"
              >
                0.00s
              </span>
            </div>

            {/* 스크러버 */}
            <div className="relative flex h-[24px] items-center">
              <div className="pointer-events-none absolute flex h-[10px] w-full justify-between px-[7px]">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-full w-[2px] rounded-sm bg-[rgba(191,219,254,0.45)]"
                  />
                ))}
              </div>
              <input
                ref={scrubRef}
                type="range"
                min={0}
                max={TOTAL_FRAMES}
                step={0.001}
                defaultValue={0}
                aria-label="프레임 탐색"
                aria-valuemin={1}
                aria-valuemax={5}
                className="sd-scrubber absolute inset-0 z-10 m-0 w-full"
                onPointerDown={() => {
                  scrubbingRef.current = true;
                  setPlaying(false);
                  setInteracted(true);
                }}
                onPointerUp={() => {
                  scrubbingRef.current = false;
                  announce(`프레임 ${Math.round(frameRef.current) + 1}`);
                }}
                onInput={e => {
                  let v = parseFloat((e.target as HTMLInputElement).value);
                  // 키프레임 근처에서는 딱 붙게 스냅한다.
                  const near = Math.round(v);
                  if (Math.abs(v - near) < 0.12) v = near;
                  frameRef.current = v;
                }}
                onKeyDown={e => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    step(1);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    step(-1);
                  } else if (e.key === "Home") {
                    frameRef.current = 0;
                  } else if (e.key === "End") {
                    frameRef.current = TOTAL_FRAMES;
                  }
                }}
              />
            </div>

            <div
              className="h-[14px] text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity duration-500"
              style={{opacity: interacted ? 0 : 1}}
            >
              재생하고, 멈추고, 끌어보세요
            </div>
          </div>
        </div>

        {/* 코드 패널 */}
        <div className="w-full lg:w-[48%]" style={rise(on(IDX.panels), rm)}>
          <CodePanel
            filename={`GET /api/signs/${wordId}`}
            className="h-[460px] lg:h-[520px]"
            footer="// 손 모양만 저장하면 「안녕하세요」와 「안녕히 가세요」를 구분할 수 없다"
          >
            <div
              ref={codeRef}
              className="relative flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed"
            >
              <div
                ref={chipRef}
                className="pointer-events-none absolute right-4 z-10 -translate-y-1/2 rounded border border-[rgba(191,219,254,0.3)] bg-[#1a2c47] px-2 py-1 font-mono text-[10px] text-[var(--sd-accent)] opacity-0 shadow transition-opacity duration-200"
              >
                보간 중
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  <JsonRows sign={sign} />
                </tbody>
              </table>
            </div>
          </CodePanel>
        </div>
      </div>

      {/* ── 스키마 결정표 ── */}
      <div className="mt-[48px] w-full">
        <div className="mb-6 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
          스키마에서 내린 결정
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <table className="w-full min-w-[600px] border-collapse text-left font-mono text-[12px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.2)]">
                <th className="px-4 py-3 font-normal text-[var(--sd-muted)]">
                  항목
                </th>
                <th className="px-4 py-3 font-normal text-[var(--sd-muted)]">
                  저장한다 / 안 한다
                </th>
                <th className="px-4 py-3 font-normal text-[var(--sd-muted)]">
                  이유
                </th>
              </tr>
            </thead>
            <tbody>
              {DECISIONS.map((d, i) => (
                <tr
                  key={d.item}
                  className="border-b border-[rgba(255,255,255,0.08)] transition-opacity duration-500"
                  style={{
                    opacity: on(IDX.panels) ? 1 : 0,
                    transitionDelay: rm ? "0s" : `${0.2 + i * 0.1}s`,
                    // 표정 행만 경고색 좌측선 — 「빼기로 한 결정」을 눈에 남긴다.
                    borderLeft:
                      d.item === "표정"
                        ? "1px solid rgba(251,191,36,0.28)"
                        : undefined
                  }}
                >
                  <td className="px-4 py-[13px] text-white">{d.item}</td>
                  <td
                    className="px-4 py-[13px]"
                    style={{
                      color: d.keep ? "var(--sd-ok)" : "rgba(255,255,255,0.55)"
                    }}
                  >
                    {d.verdict}
                  </td>
                  <td className="px-4 py-[13px] text-[rgba(255,255,255,0.7)]">
                    {d.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-[800px] text-[15px] leading-[32px]">
          표정을 뺀 건 기술적인 이유가 아니라 범위 때문이었다.
          <br />
          한국수어에서{" "}
          <strong className="font-bold text-[var(--sd-warn)]">
            표정은 장식이 아니라 문법이다.
          </strong>{" "}
          의문문인지 부정문인지가 표정에서 갈린다.
          <br />
          그걸 빼고 만든 이상, 이 서비스는 「단어를 익히는 도구」까지이고
          <br />
          「문장을 정확히 표현하는 도구」는 아니다.
        </p>
      </div>
    </section>
  );
}
