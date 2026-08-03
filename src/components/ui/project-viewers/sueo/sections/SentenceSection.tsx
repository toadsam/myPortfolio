"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {CodePanel, fade, Kicker, NoteBox, rise, WordHeading} from "../parts";
import {
  cellDuration,
  convert,
  PRESET_KEYS,
  type Conversion,
  type Token
} from "../sentenceData";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 150, 700, 1200, 1500, 1900, 3000, 3400];
const IDX = {
  label: 0,
  heading: 1,
  p1: 2,
  p2: 3,
  input: 4,
  rows: 5,
  code: 6,
  hint: 7
};

const PIPELINE = [
  {t: "문장 입력", d: "원문 그대로"},
  {t: "형태소 분석", d: "단어와 품사 분리"},
  {t: "불필요 요소 제거", d: "조사·어미 제거"},
  {t: "수어 어순 재배열", d: "시간·장소를 앞으로"},
  {t: "동작 시퀀스 조립", d: "각 단어의 키프레임을 이어 붙임"}
];

// 파이프라인 단계별로 밝히는 코드 줄 번호(1-based).
const STAGE_LINES: number[][] = [
  [],
  [1, 2],
  [4, 5, 6, 7],
  [9, 10, 11],
  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
];

// 항상 옅게 강조해 두는 줄 — 이 페이지의 핵심 주장.
const STATIC_LINES = [10, 11, 18, 19];

const CODE: {n: number; body: React.ReactNode}[] = [
  {n: 1, body: <span className="sd-com">{"  // 1. 형태소 분석"}</span>},
  {
    n: 2,
    body: (
      <>
        {"  "}
        <span className="sd-key">List</span>
        {" tokens = nlpService.tokenize(sentence);"}
      </>
    )
  },
  {n: 3, body: " "},
  {
    n: 4,
    body: (
      <span className="sd-com">
        {"  // 2. 수어에 없는 품사 제거 (조사, 어미 등)"}
      </span>
    )
  },
  {
    n: 5,
    body: (
      <>
        {"  "}
        <span className="sd-key">List</span>
        {" meaningfulTokens = tokens.stream()"}
      </>
    )
  },
  {n: 6, body: "      .filter(t -> !GrammarRule.isRemovableParticle(t))"},
  {n: 7, body: "      .collect(Collectors.toList());"},
  {n: 8, body: " "},
  {
    n: 9,
    body: (
      <span className="sd-com">
        {"  // 3. 수어 어순 재배열 (단순화된 규칙 적용)"}
      </span>
    )
  },
  {
    n: 10,
    body: (
      <>
        {"  "}
        <span className="sd-key">List</span>
        {" orderedTokens = ruleEngine.apply(meaningfulTokens,"}
      </>
    )
  },
  {
    n: 11,
    body: (
      <>
        {"      "}
        <span className="sd-key">OrderRule</span>
        {".TIME_FIRST, "}
        <span className="sd-key">OrderRule</span>
        {".PLACE_SECOND, "}
        <span className="sd-key">OrderRule</span>
        {".VERB_LAST);"}
      </>
    )
  },
  {n: 12, body: " "},
  {
    n: 13,
    body: <span className="sd-com">{"  // 4. 모션 데이터 매핑 및 조립"}</span>
  },
  {
    n: 14,
    body: (
      <>
        {"  "}
        <span className="sd-key">Sequence</span>
        {" sequence = "}
        <span className="sd-key">new</span>
        {" Sequence();"}
      </>
    )
  },
  {
    n: 15,
    body: (
      <>
        {"  "}
        <span className="sd-key">for</span>
        {" (Token t : orderedTokens) {"}
      </>
    )
  },
  {n: 16, body: "      SignData sign = dict.lookup(t.getWord());"},
  {
    n: 17,
    body: (
      <>
        {"      "}
        <span className="sd-key">if</span>
        {" (sign == "}
        <span className="sd-key">null</span>
        {") {"}
      </>
    )
  },
  {
    n: 18,
    body: (
      <span className="sd-com">
        {"          // 사전에 없으면 지문자(Fingerspelling) 시퀀스로 대체"}
      </span>
    )
  },
  {n: 19, body: "          sign = FingerspellGen.generate(t.getWord());"},
  {n: 20, body: "      }"},
  {n: 21, body: "      sequence.append(sign, TransitionConfig.SMOOTH);"},
  {n: 22, body: "  }"}
];

/** 셀에 들어가는 손 픽토그램. */
function CellHand() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-[64px] w-[64px]"
      overflow="visible"
      aria-hidden="true"
    >
      <g
        fill="var(--sd-hand)"
        stroke="var(--sd-hand)"
        strokeWidth="8"
        strokeLinecap="round"
      >
        <path d="M35,90 L35,50 C35,45 40,45 40,50 L40,80" fill="none" />
        <path d="M45,85 L45,35 C45,30 50,30 50,35 L50,80" fill="none" />
        <path d="M55,85 L55,40 C55,35 60,35 60,40 L60,80" fill="none" />
        <path d="M65,90 L65,55 C65,50 70,50 70,55 L70,80" fill="none" />
        <path
          d="M25,75 C20,70 25,65 30,70 L40,80"
          fill="none"
          strokeWidth="9"
        />
        <path d="M30,95 Q50,110 70,95 L65,75 L35,75 Z" stroke="none" />
      </g>
    </svg>
  );
}

function SignCell({item, dimmed}: {item: Token; dimmed: boolean}) {
  return (
    <div
      className={`sd-sign-cell relative flex h-[100px] w-[96px] shrink-0 flex-col items-center justify-end ${
        dimmed ? "opacity-40" : ""
      }`}
      data-dur={cellDuration(item)}
    >
      <div
        className="z-10 mb-2 flex h-[64px] w-[64px] items-center justify-center"
        data-hand
      >
        <CellHand />
      </div>
      <div className="z-10 font-mono text-[10px] text-[var(--sd-accent)]">
        {item.w}
      </div>

      <div
        className="absolute bottom-0 left-[10px] right-[10px] h-[2px] overflow-hidden rounded bg-[rgba(255,255,255,0.1)] opacity-0 transition-opacity"
        data-bar
      >
        <div className="h-full w-0 bg-[var(--sd-primary)]" data-fill />
      </div>

      {dimmed ? (
        <>
          <div className="absolute left-[20px] right-[20px] top-[30%] z-20 h-[2px] rotate-12 bg-[var(--sd-bad)]" />
          <div className="absolute top-[-10px] z-20 rounded border border-[var(--sd-bad)] bg-[var(--sd-bg)] px-1 font-mono text-[9px] text-[var(--sd-bad)]">
            수어에 없음
          </div>
        </>
      ) : item.unknown ? (
        <div className="absolute top-[-10px] z-20 rounded border border-[var(--sd-warn)] bg-[#1a1708] px-1 font-mono text-[9px] text-[var(--sd-warn)]">
          지문자
        </div>
      ) : null}
    </div>
  );
}

export function SentenceSection() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  const [text, setText] = useState("내일 학교에 갑니다");
  const [data, setData] = useState<Conversion>(() =>
    convert("내일 학교에 갑니다")
  );
  const [playedOnce, setPlayedOnce] = useState(false);
  const [converting, setConverting] = useState(false);
  const [stage, setStage] = useState(-1);

  const strip1 = useRef<HTMLDivElement>(null);
  const strip2 = useRef<HTMLDivElement>(null);
  const pipeRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anims = useRef<
    {
      id: number;
      seq: {el: HTMLElement; start: number; end: number; dur: number}[];
      t0: number;
      total: number;
      active: number;
    }[]
  >([]);
  const rafRef = useRef(0);

  const dur1 = data.kor.reduce((a, x) => a + cellDuration(x), 0);
  const dur2 = data.sign.reduce((a, x) => a + cellDuration(x), 0);
  const hasUnknown = [...data.kor, ...data.sign].some(x => x.unknown);
  const movedIdx = data.sign.findIndex(x => x.movedFront);

  const cleanCell = useCallback((el: HTMLElement | undefined) => {
    if (!el) return;
    el.classList.remove("sd-cell-playing");
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const fill = el.querySelector<HTMLElement>("[data-fill]");
    const hand = el.querySelector<HTMLElement>("[data-hand]");
    if (bar) bar.style.opacity = "0";
    if (fill) fill.style.width = "0%";
    if (hand) hand.style.transform = "none";
  }, []);

  const loop = useCallback(
    (now: number) => {
      let running = false;

      for (let i = anims.current.length - 1; i >= 0; i--) {
        const a = anims.current[i];
        const elapsed = now - a.t0;

        if (elapsed >= a.total) {
          cleanCell(a.seq[a.active]?.el);
          anims.current.splice(i, 1);
          continue;
        }
        running = true;

        const next = a.seq.findIndex(
          s => elapsed >= s.start && elapsed < s.end
        );
        if (next !== a.active) {
          cleanCell(a.seq[a.active]?.el);
          a.active = next;
          const el = a.seq[next]?.el;
          if (el) {
            if (!rm) el.classList.add("sd-cell-playing");
            const bar = el.querySelector<HTMLElement>("[data-bar]");
            if (bar) bar.style.opacity = "1";
          }
        }

        if (a.active !== -1) {
          const cur = a.seq[a.active];
          const p = (elapsed - cur.start) / cur.dur;
          const fill = cur.el.querySelector<HTMLElement>("[data-fill]");
          if (fill) fill.style.width = `${p * 100}%`;
          if (!rm && !cur.el.classList.contains("opacity-40")) {
            const hand = cur.el.querySelector<HTMLElement>("[data-hand]");
            if (hand) {
              const rot = Math.sin(p * Math.PI * 2) * 15;
              const sy = 1 - Math.sin(p * Math.PI) * 0.1;
              hand.style.transform = `rotate(${rot}deg) scaleY(${sy})`;
            }
          }
        }
      }

      if (running) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = 0;
        if (!playedOnce) {
          setPlayedOnce(true);
          bumpSignCount();
        }
      }
    },
    [cleanCell, rm, playedOnce, bumpSignCount]
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function playRow(rowId: 1 | 2) {
    if (anims.current.some(a => a.id === rowId)) return;
    const strip = (rowId === 1 ? strip1 : strip2).current;
    if (!strip) return;

    const cells = Array.from(
      strip.querySelectorAll<HTMLElement>(".sd-sign-cell")
    );
    let acc = 0;
    const seq = cells.map(el => {
      const d = parseInt(el.dataset.dur || "1000", 10);
      const entry = {el, start: acc, end: acc + d, dur: d};
      acc += d;
      return entry;
    });
    if (!seq.length) return;

    anims.current.push({
      id: rowId,
      seq,
      t0: performance.now(),
      total: acc,
      active: -1
    });
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
  }

  function playBoth() {
    if (anims.current.length) return;
    playRow(1);
    playRow(2);
  }

  // ── 변환: 파이프라인 점이 5단계를 지나간 뒤 결과를 갈아끼운다 ──────────────
  function runConvert(input: string) {
    if (converting) return;
    anims.current = [];
    [strip1, strip2].forEach(r =>
      r.current
        ?.querySelectorAll<HTMLElement>(".sd-sign-cell")
        .forEach(cleanCell)
    );

    if (rm) {
      setData(convert(input));
      return;
    }

    setConverting(true);
    let step = 0;
    const tick = () => {
      if (step >= PIPELINE.length) {
        setStage(-1);
        setConverting(false);
        const next = convert(input);
        setData(next);
        announce(
          `수어 어순으로 ${next.sign.length}개 단어가 배열되었습니다. 조사 ${
            next.kor.filter(x => x.drop).length
          }개가 제외되었습니다.`
        );
        if (dotRef.current) dotRef.current.style.opacity = "0";
        return;
      }

      const node = nodeRefs.current[step];
      const box = pipeRef.current;
      if (node && box && dotRef.current) {
        const r = node.getBoundingClientRect();
        const c = box.getBoundingClientRect();
        dotRef.current.style.opacity = "1";
        dotRef.current.style.transform = `translate(${
          r.left - c.left + r.width / 2 - 4
        }px, ${r.top - c.top + r.height / 2 - 4 - 15}px)`;
      }
      setStage(step);
      step++;
      window.setTimeout(tick, 500);
    };
    tick();
  }

  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1080px] flex-col items-center px-6 py-[100px]"
    >
      {/* ── 도입 ── */}
      <div className="mb-[36px] w-full max-w-[740px] text-center">
        <Kicker on={on(IDX.label)} instant={rm} className="mb-4">
          02 · 문장 변환
        </Kicker>
        <WordHeading
          text="단어를 하나씩 바꿔 넣으면 말이 안 된다"
          on={on(IDX.heading)}
          instant={rm}
          className="mb-8 justify-center text-[28px] font-black leading-tight"
        />
        <div className="space-y-[18px] text-left">
          <p
            className="text-[16px] leading-[36px]"
            style={rise(on(IDX.p1), rm)}
          >
            처음엔 문장을 단어로 쪼개서 각 단어의 동작을 순서대로 이어 붙였다.
            문법적으로 틀린 문장이 나왔다.
          </p>
          <p
            className="text-[16px] leading-[36px]"
            style={rise(on(IDX.p2), rm)}
          >
            한국수어는 한국어를 손으로 옮긴 게 아니라{" "}
            <strong className="font-bold text-[var(--sd-primary)]">
              문법이 다른 별개의 언어다.
            </strong>{" "}
            시간 표현이 앞에 오고, 조사가 없고, 어순이 다르다. 아래에서 같은
            문장을 두 가지 순서로 나란히 재생해보세요.
          </p>
        </div>
      </div>

      {/* ── 입력 ── */}
      <div
        className="mb-[36px] flex w-full max-w-[640px] flex-col items-center gap-4"
        style={rise(on(IDX.input), rm)}
      >
        <div className="flex w-full gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") runConvert(text);
            }}
            placeholder="문장을 입력하세요"
            aria-label="변환할 문장"
            className="flex-1 rounded-md border border-[rgba(126,184,255,0.22)] bg-[rgba(255,255,255,0.04)] px-[14px] py-[11px] font-mono text-[13px] text-white transition-colors focus:border-[var(--sd-primary)]"
          />
          <button
            type="button"
            onClick={() => runConvert(text)}
            disabled={converting}
            className="shrink-0 rounded-md bg-[var(--sd-primary)] px-[20px] py-[10px] font-mono text-[12px] font-black text-[var(--sd-bg)] transition-colors hover:bg-[var(--sd-accent)] disabled:opacity-50"
          >
            변환하기
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {PRESET_KEYS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setText(p);
                runConvert(p);
              }}
              className="rounded-full border border-[rgba(126,184,255,0.24)] px-[13px] py-[6px] font-mono text-[11px] text-[var(--sd-muted)] transition-colors hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── 두 줄 비교 ── */}
      <div className="relative mb-[48px] flex w-full flex-col gap-[14px]">
        <div className="z-20 mb-2 flex flex-col items-center">
          <div className="relative">
            <button
              type="button"
              onClick={playBoth}
              className={`rounded-md border border-[rgba(126,184,255,0.45)] px-[20px] py-[9px] font-mono text-[12px] font-black text-[var(--sd-primary)] transition-all duration-500 hover:bg-[rgba(126,184,255,0.1)] ${
                !playedOnce && on(IDX.hint) && !rm ? "sd-play-pulse" : ""
              }`}
              style={{
                opacity: on(IDX.rows) ? 1 : 0,
                transform: on(IDX.rows) ? "translateY(0)" : "translateY(1rem)"
              }}
            >
              두 줄 같이 재생
            </button>
          </div>
          <div
            className="absolute top-[44px] font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity"
            style={{opacity: !playedOnce && on(IDX.hint) ? 1 : 0}}
          >
            두 줄을 같이 재생해보세요
          </div>
        </div>

        {/* 한국어 순서 */}
        <div
          className="flex h-auto flex-col gap-4 overflow-hidden rounded-md border border-[rgba(255,255,255,0.14)] bg-[var(--sd-panel)] p-[18px] sm:h-[180px] sm:flex-row"
          style={rise(on(IDX.rows), rm)}
        >
          <div className="flex w-full shrink-0 flex-col justify-between sm:w-[150px]">
            <div>
              <h3 className="mb-1 font-mono text-[13px] text-[rgba(255,255,255,0.72)]">
                한국어 순서 그대로
              </h3>
              <p className="font-mono text-[10px] text-[var(--sd-muted)]">
                단어를 그대로 치환
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-start sm:gap-2">
              <div className="flex items-center gap-1 font-mono text-[12px] text-[var(--sd-bad)]">
                <span aria-hidden="true">✕</span> 문법에 맞지 않음
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playRow(1)}
                  aria-label="한국어 순서 재생"
                  className="flex h-[28px] w-[28px] items-center justify-center rounded border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.1)]"
                >
                  ▶
                </button>
                <span className="font-mono text-[10px] tabular-nums text-[var(--sd-muted)]">
                  {(dur1 / 1000).toFixed(1)}초
                </span>
              </div>
            </div>
          </div>
          <div
            ref={strip1}
            className="relative flex flex-1 items-center overflow-x-auto pl-2 pt-4 sm:pt-0"
          >
            {data.kor.map((item, i) => (
              <SignCell
                key={`${item.w}-${i}`}
                item={item}
                dimmed={!!item.drop}
              />
            ))}
          </div>
        </div>

        {/* 수어 순서 */}
        <div
          className="flex h-auto flex-col gap-4 overflow-hidden rounded-md border border-[rgba(126,184,255,0.35)] bg-[var(--sd-panel)] p-[18px] sm:h-[180px] sm:flex-row"
          style={rise(on(IDX.rows), rm)}
        >
          <div className="flex w-full shrink-0 flex-col justify-between sm:w-[150px]">
            <div>
              <h3 className="mb-1 font-mono text-[13px] text-[var(--sd-primary)]">
                수어 순서
              </h3>
              <p className="font-mono text-[10px] text-[var(--sd-muted)]">
                시간 → 장소 → 동작
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-start sm:gap-2">
              <div className="flex items-center gap-1 font-mono text-[12px] text-[var(--sd-ok)]">
                <span aria-hidden="true">✓</span> 수어 어순
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playRow(2)}
                  aria-label="수어 순서 재생"
                  className="flex h-[28px] w-[28px] items-center justify-center rounded border border-[rgba(126,184,255,0.3)] text-[var(--sd-primary)] hover:bg-[rgba(126,184,255,0.1)]"
                >
                  ▶
                </button>
                <span className="font-mono text-[10px] tabular-nums text-[var(--sd-muted)]">
                  {(dur2 / 1000).toFixed(1)}초
                </span>
              </div>
            </div>
          </div>
          <div
            ref={strip2}
            className="relative flex flex-1 items-center overflow-x-auto pl-2 pt-6 sm:pt-4"
          >
            {movedIdx >= 0 ? (
              <div
                className="pointer-events-none absolute top-0 z-0 flex items-center whitespace-nowrap font-mono text-[9px] text-[var(--sd-primary)] transition-opacity"
                style={{left: `${movedIdx * 96 + 30}px`, opacity: 1}}
              >
                <svg
                  width="60"
                  height="12"
                  viewBox="0 0 60 12"
                  fill="none"
                  className="mr-2"
                >
                  <path
                    d="M60 11C40 11 20 11 5 11C5 11 5 5 5 5L1 5L5 1L9 5L5 5"
                    stroke="var(--sd-primary)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                시간 표현이 앞으로
              </div>
            ) : null}
            {data.sign.map((item, i) => (
              <SignCell key={`${item.w}-${i}`} item={item} dimmed={false} />
            ))}
          </div>
        </div>

        <div
          className="mt-2 h-[20px] text-center transition-opacity"
          style={{opacity: hasUnknown ? 1 : 0}}
        >
          <span className="font-mono text-[11px] text-[var(--sd-warn)]">
            사전에 없는 단어는 지문자로 처리합니다
          </span>
        </div>

        <p
          className="mx-auto mt-4 max-w-[700px] text-center text-[15px] leading-[32px] transition-opacity"
          style={{opacity: playedOnce ? 1 : 0}}
        >
          위쪽은 단어를 그대로 이어 붙인 것이고, 아래쪽이 실제 수어 어순입니다.
          <br />
          조사는 아예 사라지고, 시간을 나타내는 말이 맨 앞으로 옵니다.
        </p>
      </div>

      {/* ── 변환 단계 ── */}
      <div className="relative mb-[40px] w-full rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-6">
        <div className="mb-6 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-primary)]">
          변환 단계
        </div>
        <div
          ref={pipeRef}
          className="relative flex flex-col items-center justify-between gap-6 md:flex-row md:gap-0"
        >
          <div ref={dotRef} className="sd-pipe-dot" aria-hidden="true" />
          <div className="absolute left-[75px] right-[75px] top-[25px] z-0 hidden h-px bg-[rgba(126,184,255,0.2)] md:block" />

          {PIPELINE.map((node, i) => (
            <div
              key={node.t}
              ref={el => {
                nodeRefs.current[i] = el;
              }}
              className="relative z-10 flex w-[150px] flex-col items-center"
            >
              <div
                className="flex h-[50px] w-full items-center justify-center rounded border bg-[var(--sd-bg)] font-mono text-[12px] transition-colors duration-300"
                style={{
                  borderColor:
                    stage === i ? "var(--sd-primary)" : "rgba(126,184,255,0.3)",
                  background:
                    stage === i ? "rgba(126,184,255,0.12)" : "var(--sd-bg)"
                }}
              >
                {node.t}
              </div>
              <div className="mt-2 text-center font-mono text-[9px] text-[var(--sd-muted)]">
                {node.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 코드 ── */}
      <div className="w-full" style={rise(on(IDX.code), rm)}>
        <CodePanel
          filename="SignSentenceService.java"
          footer="// 규칙 몇 개로 어순을 맞춘 것이지, 문법을 구현한 게 아니다"
        >
          <div className="flex-1 overflow-x-auto p-4 font-mono text-[12px] leading-relaxed">
            <table className="w-full border-collapse">
              <tbody>
                {CODE.map(line => {
                  const lit =
                    stage >= 0 && STAGE_LINES[stage]?.includes(line.n);
                  const staticLit = STATIC_LINES.includes(line.n);
                  return (
                    <tr
                      key={line.n}
                      className="transition-colors duration-300"
                      style={{
                        backgroundColor: lit
                          ? "rgba(126,184,255,0.14)"
                          : staticLit
                          ? "rgba(126,184,255,0.12)"
                          : "transparent"
                      }}
                    >
                      <td className="sd-gutter">{line.n}</td>
                      <td className="whitespace-pre pl-4">{line.body}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CodePanel>

        <NoteBox label="이 방식의 한계" accent="#fbbf24" className="mt-[32px]">
          <ul className="space-y-1 text-[15px] leading-[32px]">
            <li>
              · 어순 규칙이 세 개뿐이다. 실제 한국수어 문법은 이보다 훨씬
              복잡하다.
            </li>
            <li>
              · 표정과 비수지 신호를 다루지 않아서, 의문문과 평서문을 구분하지
              못한다.
            </li>
            <li>
              · 문맥에 따라 달라지는 표현을 처리하지 못한다. 단어 단위 사전만
              본다.
            </li>
            <li>
              · 이 변환 결과가 자연스러운 수어인지 확인해줄 사람이 없었다.
            </li>
          </ul>
        </NoteBox>
      </div>
    </section>
  );
}
