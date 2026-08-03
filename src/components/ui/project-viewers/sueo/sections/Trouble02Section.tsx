"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {
  Caveat,
  CodePanel,
  fade,
  Kicker,
  LimitList,
  NoteBox,
  rise,
  StatCard,
  WordHeading
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 100, 600, 1100, 1800, 3200];
const IDX = {label: 0, heading: 1, symptom: 2, stage: 3, autoplay: 4, hint: 5};

const TOTAL_FRAMES = 160;

// 단어 3개 + 그 사이 전환 구간 2개로 이뤄진 재현용 타임라인.
type Pt = {x: number; y: number};
interface WordSeg {
  type: "word";
  label: string;
  start: number;
  end: number;
  p0: Pt;
  p1: Pt;
}
interface TransSeg {
  type: "trans";
  start: number;
  end: number;
}

const W1: WordSeg = {
  type: "word",
  label: "내일",
  start: 0,
  end: 40,
  p0: {x: 200, y: 150},
  p1: {x: 350, y: 100}
};
const T1: TransSeg = {type: "trans", start: 40, end: 55};
const W2: WordSeg = {
  type: "word",
  label: "학교",
  start: 55,
  end: 95,
  p0: {x: 500, y: 220},
  p1: {x: 650, y: 180}
};
const T2: TransSeg = {type: "trans", start: 95, end: 110};
const W3: WordSeg = {
  type: "word",
  label: "가다",
  start: 110,
  end: 150,
  p0: {x: 800, y: 120},
  p1: {x: 900, y: 150}
};

const SEQ: (WordSeg | TransSeg)[] = [W1, T1, W2, T2, W3];
const WORDS: WordSeg[] = [W1, W2, W3];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 프레임 번호 → 손 위치. smooth=false면 전환 구간에서 이전 자세에 머문 뒤 순간이동한다. */
function posAt(frame: number, smooth: boolean) {
  if (frame <= W1.end) {
    const t = frame / W1.end;
    return {
      x: lerp(W1.p0.x, W1.p1.x, t),
      y: lerp(W1.p0.y, W1.p1.y, t),
      label: W1.label
    };
  }
  if (frame <= T1.end) {
    if (!smooth) return {x: W1.p1.x, y: W1.p1.y, label: ""};
    const t = (frame - T1.start) / (T1.end - T1.start);
    return {
      x: lerp(W1.p1.x, W2.p0.x, t),
      y: lerp(W1.p1.y, W2.p0.y, t),
      label: ""
    };
  }
  if (frame <= W2.end) {
    const t = (frame - W2.start) / (W2.end - W2.start);
    return {
      x: lerp(W2.p0.x, W2.p1.x, t),
      y: lerp(W2.p0.y, W2.p1.y, t),
      label: W2.label
    };
  }
  if (frame <= T2.end) {
    if (!smooth) return {x: W2.p1.x, y: W2.p1.y, label: ""};
    const t = (frame - T2.start) / (T2.end - T2.start);
    return {
      x: lerp(W2.p1.x, W3.p0.x, t),
      y: lerp(W2.p1.y, W3.p0.y, t),
      label: ""
    };
  }
  if (frame <= W3.end) {
    const t = (frame - W3.start) / (W3.end - W3.start);
    return {
      x: lerp(W3.p0.x, W3.p1.x, t),
      y: lerp(W3.p0.y, W3.p1.y, t),
      label: W3.label
    };
  }
  return {x: W3.p1.x, y: W3.p1.y, label: ""};
}

const CONT_PATH = `M ${W1.p0.x} ${W1.p0.y} L ${W1.p1.x} ${W1.p1.y} L ${W2.p0.x} ${W2.p0.y} L ${W2.p1.x} ${W2.p1.y} L ${W3.p0.x} ${W3.p0.y} L ${W3.p1.x} ${W3.p1.y}`;

function BreakMarker({x, y}: {x: number; y: number}) {
  return (
    <g transform={`translate(${x - 10}, ${y - 10})`}>
      <line
        x1="-5"
        y1="0"
        x2="5"
        y2="0"
        stroke="var(--sd-bad)"
        strokeWidth="2"
      />
      <line
        x1="0"
        y1="-5"
        x2="0"
        y2="5"
        stroke="var(--sd-bad)"
        strokeWidth="2"
      />
      <text x="8" y="3" fontSize="9" fill="var(--sd-bad)" className="font-mono">
        끊김
      </text>
    </g>
  );
}

export function Trouble02Section() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  const [smooth, setSmooth] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [showError, setShowError] = useState(false);
  const [counted, setCounted] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const handRef = useRef<SVGGElement>(null);
  const spotRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const smoothRef = useRef(true);
  const rafRef = useRef(0);
  const playedBroken = useRef(false);

  smoothRef.current = smooth;

  const drawFrame = useCallback((frame: number) => {
    const pos = posAt(frame, smoothRef.current);
    handRef.current?.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);
    spotRef.current?.setAttribute("cx", String(pos.x));
    spotRef.current?.setAttribute("cy", String(pos.y));

    const svg = svgRef.current;
    const label = labelRef.current;
    if (svg && label) {
      const r = svg.getBoundingClientRect();
      label.style.left = `${pos.x * (r.width / 1000)}px`;
      label.style.top = `${pos.y * (r.height / 300) + 30}px`;
      label.style.opacity = pos.label ? "1" : "0";
      label.textContent = pos.label;
    }
    if (cursorRef.current) {
      cursorRef.current.style.left = `${(frame / TOTAL_FRAMES) * 100}%`;
    }
  }, []);

  useEffect(() => {
    drawFrame(frameRef.current);
  }, [drawFrame, smooth]);

  const play = useCallback(() => {
    if (playing) return;
    setPlaying(true);
    setShowError(false);
    frameRef.current = 0;

    function loop() {
      if (document.hidden) {
        setPlaying(false);
        return;
      }
      frameRef.current += rm ? TOTAL_FRAMES : 1;
      if (frameRef.current > TOTAL_FRAMES) {
        frameRef.current = TOTAL_FRAMES;
        drawFrame(TOTAL_FRAMES);
        setPlaying(false);
        if (!smoothRef.current && !playedBroken.current) {
          playedBroken.current = true;
          window.setTimeout(() => setShowError(true), 200);
        }
        if (!counted) {
          setCounted(true);
          bumpSignCount();
        }
        return;
      }
      drawFrame(frameRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [playing, rm, drawFrame, counted, bumpSignCount]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // 섹션이 보이면 한 번 자동 재생해서 「이어짐」을 먼저 보여준다.
  useEffect(() => {
    if (t[IDX.autoplay] && !rm) play();
    // 자동 재생은 최초 1회만.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t[IDX.autoplay]]);

  function setMode(next: boolean) {
    if (next === smooth) return;
    setSmooth(next);
    setToggled(true);
    announce(
      next
        ? "전환 프레임을 적용했습니다. 동작이 이어집니다."
        : "전환 프레임을 제거했습니다. 단어 사이에서 동작이 끊깁니다."
    );
  }

  const on = (i: number) => t[i] || rm;
  const hintOn = t[IDX.hint] && !toggled && !rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto w-full max-w-[1040px] px-6 py-[100px]"
    >
      {/* ── 증상 ── */}
      <div className="mb-[36px]">
        <Kicker
          on={on(IDX.label)}
          instant={rm}
          color="var(--sd-bad)"
          className="mb-3"
        >
          05 · 트러블슈팅 02
        </Kicker>
        <WordHeading
          text="단어는 맞는데 문장이 되면 이상해 보였다"
          on={on(IDX.heading)}
          instant={rm}
          className="text-[30px] font-black leading-tight"
        />

        <div
          className="mt-[24px] rounded-md border border-[rgba(248,113,113,0.28)] border-l-[3px] border-l-[var(--sd-bad)] bg-[rgba(248,113,113,0.05)] p-[20px]"
          style={{
            opacity: on(IDX.symptom) ? 1 : 0,
            transform: on(IDX.symptom) ? "translateX(0)" : "translateX(-40px)",
            transition: rm ? "none" : "all 0.8s cubic-bezier(0.4,0,0.2,1)"
          }}
        >
          <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-bad)]">
            증상
          </div>
          <p className="m-0 text-[16px] leading-8">
            단어 하나씩 재생하면 자연스러웠다. 그런데 문장으로 이어 붙이면
            <br className="hidden sm:block" /> 단어와 단어 사이에서 손이
            순간이동하듯 튀었다.
            <br className="hidden sm:block" /> 프론트 담당은 데이터가 이상하다고
            했고, 나는 데이터가 맞다고 생각했다.
            <br className="hidden sm:block" /> 둘 다 맞는 말이었다.
          </p>
        </div>
      </div>

      {/* ── 재현 무대 ── */}
      <div
        className="relative flex h-auto w-full flex-col items-center rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px] sm:h-[450px]"
        style={rise(on(IDX.stage), rm)}
      >
        <div
          className="relative z-20 flex h-[32px] w-[220px] rounded border border-[rgba(126,184,255,0.22)] bg-[rgba(255,255,255,0.04)] font-mono text-[11px]"
          role="radiogroup"
          aria-label="전환 프레임 모드"
        >
          <div
            className="absolute inset-0 w-1/2 rounded-[3px] bg-[rgba(255,255,255,0.08)] transition-transform duration-300"
            style={{transform: smooth ? "translateX(0%)" : "translateX(100%)"}}
          />
          <button
            type="button"
            role="radio"
            aria-checked={smooth}
            onClick={() => setMode(true)}
            className="z-10 flex h-full w-1/2 items-center justify-center transition-colors"
            style={{color: smooth ? "var(--sd-ok)" : "var(--sd-muted)"}}
          >
            전환 프레임 있음
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!smooth}
            onClick={() => setMode(false)}
            className={`relative z-10 flex h-full w-1/2 items-center justify-center transition-colors ${
              hintOn ? "sd-hint-pulse" : ""
            }`}
            style={{color: !smooth ? "var(--sd-bad)" : "var(--sd-muted)"}}
          >
            전환 프레임 없음
            <span
              className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity duration-300"
              style={{opacity: hintOn ? 1 : 0}}
            >
              이제 전환 프레임을 꺼보세요
            </span>
          </button>
        </div>

        <div className="relative mt-4 h-[220px] w-full flex-grow overflow-hidden sm:h-auto">
          <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 font-mono text-[12px] text-[rgba(255,255,255,0.72)]">
            내일 학교 가다
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 1000 300"
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              <radialGradient id="sd-spot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(126,184,255,0.08)" />
                <stop offset="100%" stopColor="rgba(126,184,255,0)" />
              </radialGradient>
            </defs>

            {/* 이어진 경로 */}
            <path
              d={CONT_PATH}
              fill="none"
              stroke="rgba(126,184,255,0.28)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-opacity duration-300"
              style={{opacity: smooth ? 1 : 0}}
            />

            {/* 끊어진 경로 + 끊김 표시 */}
            <g
              className="transition-opacity duration-300"
              style={{opacity: smooth ? 0 : 1}}
            >
              {WORDS.map((w, i) => (
                <path
                  key={i}
                  d={`M ${w.p0.x} ${w.p0.y} L ${w.p1.x} ${w.p1.y}`}
                  fill="none"
                  stroke="rgba(126,184,255,0.28)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
              <BreakMarker x={W2.p0.x} y={W2.p0.y} />
              <BreakMarker x={W3.p0.x} y={W3.p0.y} />
            </g>

            <circle ref={spotRef} cx="0" cy="0" r="100" fill="url(#sd-spot)" />

            <g ref={handRef} transform="translate(0,0)">
              <g transform="scale(0.8) translate(-40, -50)">
                <path
                  d="M40,90 C35,90 30,85 30,70 L30,40 C30,35 34,30 40,30 C46,30 50,35 50,40 L50,70 L60,40 C60,35 64,30 70,30 C76,30 80,35 80,40 L80,70 L90,45 C90,40 94,35 100,35 C106,35 110,40 110,45 L110,80 C110,95 90,110 70,110 C50,110 40,100 40,90 Z"
                  fill="var(--sd-hand)"
                  stroke="rgba(126,184,255,0.4)"
                  strokeWidth="1.5"
                />
                <path
                  d="M20,60 C15,60 10,55 10,50 C10,45 15,40 20,40 L30,45 L30,70"
                  fill="none"
                  stroke="var(--sd-hand)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </svg>

          <div
            ref={labelRef}
            className="absolute font-mono text-[13px] font-bold text-[var(--sd-accent)] shadow-lg transition-all duration-100"
            style={{
              left: 0,
              top: 0,
              transform: "translate(-50%, 0)",
              opacity: 0
            }}
          />

          <div
            className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 max-w-[460px] rounded-md border border-[rgba(248,113,113,0.3)] bg-[rgba(6,13,24,0.9)] p-4 transition-opacity duration-500 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
            style={{opacity: showError ? 1 : 0}}
          >
            <div className="text-[17px] leading-9">
              동작 데이터는 맞았습니다.
            </div>
            <div className="mt-[8px] text-[17px] font-bold leading-9 text-[var(--sd-bad)]">
              사이를 안 채워서 보낸 게 문제였습니다.
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-2 flex w-full items-center justify-between">
          <div className="font-mono text-[9px] text-[rgba(255,255,255,0.32)]">
            재현용 예시입니다
          </div>
          <button
            type="button"
            onClick={play}
            disabled={playing}
            className="rounded-md border border-[rgba(126,184,255,0.45)] px-[20px] py-[9px] font-mono text-[12px] font-black text-[var(--sd-primary)] transition-colors hover:bg-[rgba(126,184,255,0.1)] disabled:opacity-50"
          >
            {playing ? "재생 중..." : "문장 재생"}
          </button>
          <div className="w-[100px]" />
        </div>

        {/* 타임라인 */}
        <div className="relative z-20 mt-4 flex h-[54px] w-full flex-col">
          <div className="flex w-full flex-grow items-end overflow-x-auto sm:overflow-hidden">
            <div className="relative flex h-[30px] w-full min-w-[560px] items-end border-b border-[rgba(126,184,255,0.18)]">
              <div
                ref={cursorRef}
                className="absolute bottom-0 top-0 z-10 w-[2px] bg-white opacity-80 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{left: 0}}
              />
              {SEQ.map((s, i) => {
                const width = ((s.end - s.start) / TOTAL_FRAMES) * 100;
                const left = (s.start / TOTAL_FRAMES) * 100;
                const isWord = s.type === "word";
                return (
                  <div
                    key={i}
                    className="absolute bottom-0 origin-left transition-transform duration-500"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      height: isWord ? 12 : smooth ? 12 : 4,
                      borderRight: "1px solid rgba(0,0,0,0.5)",
                      backgroundColor: isWord
                        ? "var(--sd-primary)"
                        : smooth
                        ? "var(--sd-ok)"
                        : "transparent",
                      borderBottom:
                        !isWord && !smooth
                          ? "2px solid var(--sd-bad)"
                          : undefined,
                      transform: on(IDX.stage) ? "scaleX(1)" : "scaleX(0)"
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-1 flex w-full min-w-[560px] justify-between font-mono text-[9px] text-[var(--sd-muted)] sm:min-w-0">
            {SEQ.filter(s => s.type === "word").map(s => (
              <div
                key={s.label}
                className="absolute text-center"
                style={{
                  left: `${(s.start / TOTAL_FRAMES) * 100}%`,
                  width: `${((s.end - s.start) / TOTAL_FRAMES) * 100}%`
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <p className="sr-only">
          수어 동작 시뮬레이션입니다. 모드에 따라 손이 부드럽게 이동하거나, 단어
          사이에서 뚝뚝 끊겨 이동하는 차이를 보여줍니다.
        </p>
      </div>

      {/* ── 누가 채워야 하는가 ── */}
      <NoteBox
        label="누가 채워야 하는가"
        accent="#7eb8ff"
        className="mt-[44px]"
      >
        <p className="mb-4 text-[15px] leading-8">
          프론트에서 두 포즈 사이를 보간하면 될 일 아니냐는 얘기가 나왔다.
          <br className="hidden sm:block" /> 실제로 그렇게 하면 화면은
          부드러워진다.
        </p>
        <p className="mb-4 text-[15px] leading-8">
          그런데 수어에서 단어와 단어 사이의 이동은 아무렇게나 지나가도 되는
          구간이 아니다.
          <br className="hidden sm:block" /> 어디를 거쳐 가느냐가 의미에 영향을
          줄 수 있다.
          <br className="hidden sm:block" /> 그래서 「어떻게 이동할지」를 화면
          쪽 판단에 맡기지 않고
          <br className="hidden sm:block" />{" "}
          <strong className="font-bold text-[var(--sd-accent)]">
            데이터를 만드는 쪽에서 정해서 내려보내기로 했다
          </strong>
          .
        </p>
        <div className="font-mono text-[10px] text-[rgba(255,255,255,0.4)]">
          이 판단은 팀에서 같이 정했고, 서버 쪽 구현을 제가 맡았습니다.
        </div>
      </NoteBox>

      {/* ── 원인 다이어그램 ── */}
      <div className="mt-[40px] rounded-md border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)] p-[24px]">
        <div className="mb-6 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-warn)]">
          원인 · 응답에 무엇이 빠졌나
        </div>

        <div className="relative mb-6 h-[170px] w-full overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 170"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform="translate(0, 20)">
              <text
                x="0"
                y="15"
                fill="var(--sd-text)"
                fontSize="12"
                fontWeight="bold"
              >
                수정 전
              </text>
              <g style={fade(on(IDX.stage), rm)}>
                {[80, 320, 560].map((x, i) => (
                  <g key={x}>
                    <rect
                      x={x}
                      y="0"
                      width="160"
                      height="24"
                      rx="4"
                      fill="rgba(126,184,255,0.2)"
                      stroke="var(--sd-primary)"
                      strokeWidth="1"
                    />
                    <text
                      x={x + 80}
                      y="15"
                      fill="var(--sd-primary)"
                      fontSize="11"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      word {i + 1}
                    </text>
                  </g>
                ))}
                {[
                  [240, 320],
                  [480, 560]
                ].map(([a, b]) => (
                  <g key={a}>
                    <line
                      x1={a}
                      y1="-10"
                      x2={a}
                      y2="34"
                      stroke="var(--sd-bad)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1={b}
                      y1="-10"
                      x2={b}
                      y2="34"
                      stroke="var(--sd-bad)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  </g>
                ))}
                <text
                  x="280"
                  y="46"
                  fill="var(--sd-bad)"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono"
                >
                  정의되지 않은 구간
                </text>
              </g>
            </g>

            <g transform="translate(0, 110)">
              <text
                x="0"
                y="15"
                fill="var(--sd-text)"
                fontSize="12"
                fontWeight="bold"
              >
                수정 후
              </text>
              <g style={fade(on(IDX.stage), rm)}>
                {[80, 320, 560].map((x, i) => (
                  <g key={x}>
                    <rect
                      x={x}
                      y="0"
                      width="160"
                      height="24"
                      rx="4"
                      fill="rgba(126,184,255,0.2)"
                      stroke="var(--sd-primary)"
                      strokeWidth="1"
                    />
                    <text
                      x={x + 80}
                      y="15"
                      fill="var(--sd-primary)"
                      fontSize="11"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      word {i + 1}
                    </text>
                  </g>
                ))}
                {[240, 480].map(x => (
                  <rect
                    key={x}
                    x={x}
                    y="4"
                    width="80"
                    height="16"
                    rx="2"
                    fill="rgba(74,222,128,0.2)"
                    stroke="var(--sd-ok)"
                    strokeWidth="1"
                  />
                ))}
                <text
                  x="280"
                  y="-4"
                  fill="var(--sd-ok)"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono"
                >
                  전환 구간
                </text>
              </g>
            </g>
          </svg>
        </div>

        <p className="m-0 text-[16px] leading-8">
          단어 하나짜리 응답은 완결된 동작이었다. 그래서 단어 API는 처음부터
          문제가 없었다.
          <br className="hidden sm:block" /> 문장 API가 그 단어들을 그냥 이어
          붙여서 보냈고,
          <br className="hidden sm:block" />{" "}
          <strong className="font-bold text-[var(--sd-warn)]">
            이어 붙인 자리에 무엇이 있어야 하는지는 아무도 정의하지 않았다
          </strong>
          .
        </p>
      </div>

      {/* ── 응답 before / after ── */}
      <div className="mt-[40px] flex flex-col gap-4 lg:flex-row">
        <CodePanel
          filename="GET /api/sentence (before)"
          borderColor="rgba(248,113,113,0.28)"
          className="flex-1"
        >
          <div className="overflow-x-auto p-4 font-mono text-[11px] leading-[1.6] sm:text-[12px]">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  {n: 1, c: "{"},
                  {
                    n: 2,
                    c: (
                      <>
                        {"  "}
                        <span className="sd-key">&quot;signs&quot;</span>: [
                      </>
                    )
                  },
                  {n: 3, c: "    {"},
                  {
                    n: 4,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;word&quot;</span>:{" "}
                        <span className="sd-str">&quot;내일&quot;</span>,
                      </>
                    )
                  },
                  {
                    n: 5,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;keyframes&quot;</span>: [
                      </>
                    )
                  },
                  {
                    n: 6,
                    c: (
                      <>
                        {"        { "}
                        <span className="sd-key">&quot;t&quot;</span>:{" "}
                        <span className="sd-num">0</span>,{" "}
                        <span className="sd-key">&quot;pose&quot;</span>
                        {": { ... } },"}
                      </>
                    )
                  },
                  {
                    n: 7,
                    c: (
                      <>
                        {"        { "}
                        <span className="sd-key">&quot;t&quot;</span>:{" "}
                        <span className="sd-num">0.5</span>,{" "}
                        <span className="sd-key">&quot;pose&quot;</span>
                        {": { ... } }"}
                      </>
                    )
                  },
                  {n: 8, c: "      ]"},
                  {
                    n: 9,
                    lit: true,
                    c: (
                      <>
                        {"    }, "}
                        <span className="ml-4 font-mono text-[10px] text-[var(--sd-bad)]">
                          ← 여기가 비어 있다
                        </span>
                      </>
                    )
                  },
                  {n: 10, c: "    {"},
                  {
                    n: 11,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;word&quot;</span>:{" "}
                        <span className="sd-str">&quot;학교&quot;</span>,
                      </>
                    )
                  },
                  {
                    n: 12,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;keyframes&quot;</span>
                        {": [ ... ]"}
                      </>
                    )
                  },
                  {n: 13, c: "    }"},
                  {n: 14, c: "  ]"},
                  {n: 15, c: "}"}
                ].map(l => (
                  <tr
                    key={l.n}
                    style={{
                      background: l.lit ? "rgba(248,113,113,0.12)" : undefined
                    }}
                  >
                    <td className="sd-gutter">{l.n}</td>
                    <td className="whitespace-pre pl-4">{l.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CodePanel>

        <CodePanel
          filename="GET /api/sentence (after)"
          borderColor="rgba(74,222,128,0.28)"
          className="flex-1"
          headerNote={
            <div className="border-b border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.05)] px-4 py-1.5 font-mono text-[11px] text-[var(--sd-ok)] opacity-90">
              // 화면이 알아서 채우게 두지 않고, 서버가 채워서 보낸다
            </div>
          }
        >
          <div className="overflow-x-auto p-4 font-mono text-[11px] leading-[1.6] sm:text-[12px]">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  {n: 1, c: "{"},
                  {
                    n: 2,
                    c: (
                      <>
                        {"  "}
                        <span className="sd-key">
                          &quot;totalMs&quot;
                        </span>: <span className="sd-num">1700</span>,
                      </>
                    )
                  },
                  {
                    n: 3,
                    c: (
                      <>
                        {"  "}
                        <span className="sd-key">&quot;transitionMs&quot;</span>
                        : <span className="sd-num">200</span>,
                      </>
                    )
                  },
                  {
                    n: 4,
                    c: (
                      <>
                        {"  "}
                        <span className="sd-key">&quot;frames&quot;</span>: [
                      </>
                    )
                  },
                  {n: 5, c: "    {"},
                  {
                    n: 6,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;t&quot;</span>:{" "}
                        <span className="sd-num">0</span>,
                      </>
                    )
                  },
                  {
                    n: 7,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;source&quot;</span>:{" "}
                        <span className="sd-str">&quot;WORD:내일&quot;</span>,
                      </>
                    )
                  },
                  {
                    n: 8,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;pose&quot;</span>
                        {": { ... }"}
                      </>
                    )
                  },
                  {n: 9, c: "    },"},
                  {n: 10, c: "    ..."},
                  {n: 11, lit: true, c: "    {"},
                  {
                    n: 12,
                    lit: true,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;t&quot;</span>:{" "}
                        <span className="sd-num">500</span>,
                      </>
                    )
                  },
                  {
                    n: 13,
                    lit: true,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;source&quot;</span>:{" "}
                        <span className="sd-str">
                          &quot;TRANSITION:GENERATED&quot;
                        </span>
                        ,
                      </>
                    )
                  },
                  {
                    n: 14,
                    lit: true,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;pose&quot;</span>
                        {": { ... }"}
                      </>
                    )
                  },
                  {n: 15, lit: true, c: "    },"},
                  {n: 16, c: "    {"},
                  {
                    n: 17,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;t&quot;</span>:{" "}
                        <span className="sd-num">700</span>,
                      </>
                    )
                  },
                  {
                    n: 18,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;source&quot;</span>:{" "}
                        <span className="sd-str">&quot;WORD:학교&quot;</span>,
                      </>
                    )
                  },
                  {
                    n: 19,
                    c: (
                      <>
                        {"      "}
                        <span className="sd-key">&quot;pose&quot;</span>
                        {": { ... }"}
                      </>
                    )
                  },
                  {n: 20, c: "    }"},
                  {n: 21, c: "  ]"},
                  {n: 22, c: "}"}
                ].map(l => (
                  <tr
                    key={l.n}
                    style={{
                      background: l.lit ? "rgba(74,222,128,0.12)" : undefined
                    }}
                  >
                    <td className="sd-gutter">{l.n}</td>
                    <td className="whitespace-pre pl-4">{l.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CodePanel>
      </div>

      {/* ── 조립기 ── */}
      <CodePanel filename="SignSequenceAssembler.java" className="mt-4">
        <div className="overflow-x-auto p-4 font-mono text-[11px] leading-[1.6] sm:text-[12px]">
          <table className="w-full border-collapse">
            <tbody>
              {[
                {
                  n: 1,
                  c: (
                    <>
                      <span className="sd-key">public class</span>
                      {" SignSequenceAssembler {"}
                    </>
                  )
                },
                {
                  n: 2,
                  c: (
                    <>
                      {"    "}
                      <span className="sd-key">
                        private static final double
                      </span>
                      {" TRANSITION_DURATION_MS = "}
                      <span className="sd-num">200.0</span>;
                    </>
                  )
                },
                {
                  n: 3,
                  c: (
                    <>
                      {"    "}
                      <span className="sd-key">
                        private static final double
                      </span>
                      {" CLOSENESS_THRESHOLD = "}
                      <span className="sd-num">0.05</span>;
                    </>
                  )
                },
                {n: 4, c: " "},
                {
                  n: 5,
                  c: (
                    <>
                      {"    "}
                      <span className="sd-key">public</span>
                      {" SentenceResponse assemble(List<SignWord> words) {"}
                    </>
                  )
                },
                {
                  n: 6,
                  c: (
                    <>
                      {"        List timeline = "}
                      <span className="sd-key">new</span>
                      {" ArrayList<>();"}
                    </>
                  )
                },
                {
                  n: 7,
                  c: (
                    <>
                      {"        Pose lastPose = "}
                      <span className="sd-key">null</span>;
                    </>
                  )
                },
                {n: 8, c: " "},
                {
                  n: 9,
                  c: (
                    <>
                      {"        "}
                      <span className="sd-key">for</span>
                      {" (SignWord word : words) {"}
                    </>
                  )
                },
                {
                  n: 10,
                  lit: true,
                  c: (
                    <>
                      {"            "}
                      <span className="sd-key">if</span>
                      {" (lastPose != "}
                      <span className="sd-key">null</span>
                      {" && !isCloseEnough(lastPose, word.getFirstPose())) {"}
                    </>
                  )
                },
                {
                  n: 11,
                  lit: true,
                  c: "                List transition = interpolator.generate("
                },
                {
                  n: 12,
                  lit: true,
                  c: "                    lastPose, word.getFirstPose(), TRANSITION_DURATION_MS);"
                },
                {
                  n: 13,
                  lit: true,
                  c: (
                    <>
                      {"                transition.forEach(f -> f.setSource("}
                      <span className="sd-str">
                        &quot;TRANSITION:GENERATED&quot;
                      </span>
                      {"));"}
                    </>
                  )
                },
                {
                  n: 14,
                  lit: true,
                  c: "                timeline.addAll(transition);"
                },
                {n: 15, lit: true, c: "            }"},
                {n: 16, c: "            timeline.addAll(word.getFrames());"},
                {n: 17, c: "            lastPose = word.getLastPose();"},
                {n: 18, c: "        }"},
                {
                  n: 19,
                  c: (
                    <>
                      {"        "}
                      <span className="sd-key">return new</span>
                      {" SentenceResponse(timeline);"}
                    </>
                  )
                },
                {n: 20, c: "    }"},
                {n: 21, c: "}"}
              ].map(l => (
                <tr
                  key={l.n}
                  style={{
                    background: l.lit ? "rgba(126,184,255,0.12)" : undefined
                  }}
                >
                  <td className="sd-gutter">{l.n}</td>
                  <td className="whitespace-pre pl-4">{l.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CodePanel>
      <div className="mt-2 font-mono text-[10px] text-[rgba(255,255,255,0.35)]">
        이미 비슷한 위치면 전환을 넣지 않습니다. 넣으면 오히려
        부자연스러워졌습니다.
      </div>

      {/* ── 결과 ── */}
      <div className="mt-[40px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
        <StatCard n="연속" l="문장 재생 시 손의 경로" />
        <StatCard n="0.2초" l="단어 사이 전환 길이" />
        <StatCard n="8문장" l="눈으로 확인한 문장 수" />
      </div>
      <Caveat>
        직접 재생해서 눈으로 확인했습니다. 자연스러움을 정량적으로 측정하지는
        않았습니다.
      </Caveat>

      <LimitList
        className="mt-[28px]"
        label="아직 남은 것"
        items={[
          "전환 길이를 0.2초로 고정했습니다. 단어에 따라 달라야 하는데 그건 못 했습니다.",
          "전환 경로를 직선 보간으로만 만듭니다. 실제 수어의 이동 경로는 그렇지 않을 수 있습니다.",
          "전환 구간이 의미에 영향을 주는지 확인해줄 사람이 없었습니다.",
          "응답 크기가 커졌습니다. 문장이 길어지면 프레임 수가 빠르게 늘어납니다."
        ]}
      />
    </section>
  );
}
