"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {CodePanel, fade, Kicker, NoteBox, rise, WordHeading} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 150, 700, 1200, 1800, 2300, 2700];
const IDX = {
  label: 0,
  heading: 1,
  intro: 2,
  quiz: 3,
  queue: 4,
  code: 5,
  hint: 6
};

const POOL = [
  "감사합니다",
  "안녕하세요",
  "사랑합니다",
  "미안합니다",
  "괜찮습니다",
  "이름",
  "만나다",
  "반갑다",
  "수어",
  "배우다",
  "잘",
  "부탁합니다"
].map((word, i) => ({id: i + 1, word}));

type QueueItem = {sign: (typeof POOL)[number]; status: "new" | "review"};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => 0.5 - Math.random());
}

/** 흔들며 인사하는 손 — 문제로 제시되는 동작. */
function QuizHand({playKey, rm}: {playKey: number; rm: boolean}) {
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = gRef.current;
    if (!g || rm) return;
    let raf = 0;
    let t0: number | null = null;

    function tick(now: number) {
      if (t0 === null) t0 = now;
      const p = now - t0;
      const phase = p / 300;
      g!.style.transformOrigin = "50px 90px";
      g!.style.transform = `translate(${Math.cos(phase) * 4}px, ${
        Math.sin(phase * 2) * 3
      }px) rotate(${Math.sin(phase) * 8}deg)`;
      if (p < 1200) raf = requestAnimationFrame(tick);
      else g!.style.transform = "translate(0,0) rotate(0deg)";
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playKey, rm]);

  return (
    <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
      <g
        ref={gRef}
        stroke="var(--sd-hand)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40,90 C40,70 30,60 30,45 C30,35 35,30 40,30 C45,30 48,35 50,40 C52,30 57,25 62,25 C67,25 70,30 70,40 C73,32 78,28 82,28 C87,28 90,35 90,45 C90,65 75,75 75,90" />
        <path d="M40,55 C30,55 20,60 15,70 C12,75 15,80 20,80 C30,80 35,70 40,65" />
      </g>
    </svg>
  );
}

export function ReviewLoopSection() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<(typeof POOL)[number][]>([]);
  const [answered, setAnswered] = useState<null | {
    pickedId: number;
    ok: boolean;
  }>(null);
  const [history, setHistory] = useState<{word: string; ok: boolean}[]>([]);
  const [stats, setStats] = useState({correct: 0, wrong: 0, waiting: 0});
  const [done, setDone] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [insertedIdx, setInsertedIdx] = useState(-1);
  const [touched, setTouched] = useState(false);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const current = queue[index];

  const buildOptions = useCallback((answer: (typeof POOL)[number]) => {
    const wrong = shuffle(POOL.filter(s => s.id !== answer.id)).slice(0, 3);
    setOptions(shuffle([...wrong, answer]));
  }, []);

  const startSession = useCallback(() => {
    const initial: QueueItem[] = shuffle(POOL)
      .slice(0, 5)
      .map(sign => ({sign, status: "new" as const}));
    setQueue(initial);
    setIndex(0);
    setAnswered(null);
    setHistory([]);
    setStats({correct: 0, wrong: 0, waiting: 0});
    setDone(false);
    setInsertedIdx(-1);
    buildOptions(initial[0].sign);
    setPlayKey(k => k + 1);
  }, [buildOptions]);

  useEffect(() => {
    if (inView && !queue.length) startSession();
  }, [inView, queue.length, startSession]);

  function answer(picked: (typeof POOL)[number]) {
    if (answered || !current) return;
    setTouched(true);
    const ok = picked.id === current.sign.id;
    setAnswered({pickedId: picked.id, ok});
    setHistory(h => [...h, {word: current.sign.word, ok}]);
    bumpSignCount();

    if (ok) {
      setStats(s => ({...s, correct: s.correct + 1}));
      announce("정답입니다.");
    } else {
      setStats(s => ({...s, wrong: s.wrong + 1, waiting: s.waiting + 1}));
      // 오답은 두 문제 뒤에 다시 낸다 — 바로 다음에 내면 외운 게 아니라 방금 본 것이다.
      const at = index + 2;
      setQueue(q => {
        const next = [...q];
        next.splice(at, 0, {sign: current.sign, status: "review"});
        return next;
      });
      setInsertedIdx(at);
      announce(
        `오답입니다. 정답은 ${current.sign.word}입니다. 복습 목록에 추가되었습니다.`
      );
    }
  }

  function next() {
    const at = index + 1;
    if (at >= queue.length) {
      setDone(true);
      announce(
        "세션이 종료되었습니다. 틀린 단어는 다음에 접속해도 먼저 나옵니다."
      );
      return;
    }
    setIndex(at);
    setAnswered(null);
    setInsertedIdx(-1);
    buildOptions(queue[at].sign);
    setPlayKey(k => k + 1);
  }

  useEffect(() => {
    if (!answered) return;
    const timer = window.setTimeout(() => nextBtnRef.current?.focus(), 1400);
    return () => window.clearTimeout(timer);
  }, [answered]);

  // 숫자키 1~4로 답하고, Enter/Space로 다음 문제.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!inView || done) return;
      if (answered) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          next();
        }
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && options[n - 1]) {
        e.preventDefault();
        answer(options[n - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const waitingCount = queue.filter(
    (q, i) => i >= index && q.status === "new"
  ).length;
  const reviewCount = queue.filter(
    (q, i) => i >= index && q.status === "review"
  ).length;
  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto w-full max-w-[1120px] px-6 py-[100px] lg:px-8"
    >
      {/* ── 도입 ── */}
      <div className="mb-12">
        <Kicker
          on={on(IDX.label)}
          instant={rm}
          color="var(--sd-primary)"
          className="mb-4"
        >
          04 · 반복 학습
        </Kicker>
        <WordHeading
          text="한 번 맞혔다고 아는 게 아니다"
          on={on(IDX.heading)}
          instant={rm}
          className="mb-5 text-[28px] font-black leading-tight"
        />
        <p
          className="max-w-[740px] text-[16px] leading-[36px]"
          style={rise(on(IDX.intro), rm)}
        >
          처음엔 문제를 무작위로 냈다. 그러니 이미 아는 단어가 계속 나오고,
          헷갈리는 단어는 어쩌다 한 번 나왔다.
          <br />
          <span className="font-bold text-[var(--sd-accent)]">
            틀린 걸 다시 보여주는 게 학습
          </span>
          이지, 문제를 많이 푸는 게 학습은 아니었다.
        </p>
      </div>

      <div className="flex flex-col gap-[20px] lg:flex-row">
        {/* ── 퀴즈 ── */}
        <div
          className="relative flex h-[480px] w-full flex-col rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-5 shadow-lg shadow-black/20 lg:h-[520px] lg:w-[54%]"
          style={rise(on(IDX.quiz), rm)}
        >
          {done ? (
            <div className="flex h-full flex-col items-center justify-center">
              <h3 className="mb-6 text-[16px] font-bold">세션 결과</h3>
              <div className="mb-8 w-full max-w-[280px] space-y-2">
                {history.map((h, i) => (
                  <div
                    key={`${h.word}-${i}`}
                    className="flex items-center justify-between border-b border-[rgba(126,184,255,0.12)] py-2"
                  >
                    <span className="font-mono text-[12px] text-[var(--sd-muted)]">
                      {i + 1}. {h.word}
                    </span>
                    <span
                      className="font-mono text-[12px]"
                      style={{color: h.ok ? "var(--sd-ok)" : "var(--sd-bad)"}}
                    >
                      {h.ok ? "✓" : "✕"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mb-8 text-center text-[15px] leading-8">
                틀린 단어는 다음에 접속해도 먼저 나옵니다.
              </p>
              <button
                type="button"
                onClick={startSession}
                className="flex items-center gap-2 rounded border border-[rgba(126,184,255,0.18)] bg-[var(--sd-bg)] px-4 py-2 font-mono text-[11px] text-[var(--sd-muted)] transition-colors hover:text-white"
              >
                <span>↻</span> 다시 풀기
              </button>
            </div>
          ) : current ? (
            <>
              <div className="mb-2 flex h-[34px] items-center justify-between">
                <span className="font-mono text-[11px] tabular-nums text-[rgba(255,255,255,0.72)]">
                  문제 {index + 1} / {queue.length}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--sd-muted)]">
                  맞음 {stats.correct} · 틀림 {stats.wrong} · 복습 대기{" "}
                  {stats.waiting}
                </span>
              </div>

              <div className="relative flex flex-1 flex-col">
                <div className="relative mb-4 flex flex-1 items-center justify-center overflow-hidden rounded border border-[rgba(126,184,255,0.1)] bg-[var(--sd-bg)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(126,184,255,0.08)_0%,transparent_70%)]" />

                  <div
                    className="absolute left-1/2 top-4 -translate-x-1/2 rounded border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.1)] px-2 py-1 font-mono text-[10px] text-[var(--sd-warn)] transition-opacity"
                    style={{opacity: current.status === "review" ? 1 : 0}}
                  >
                    아까 틀린 문제입니다
                  </div>

                  <QuizHand playKey={playKey} rm={rm} />

                  <div
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[16px] font-bold tracking-wide text-white transition-opacity"
                    style={{opacity: answered ? 1 : 0}}
                  >
                    {current.sign.word}
                  </div>

                  <div className="absolute bottom-3 flex w-full items-end justify-between px-4">
                    <button
                      type="button"
                      onClick={() => setPlayKey(k => k + 1)}
                      className="font-mono text-[11px] text-[var(--sd-muted)] transition-colors hover:text-[var(--sd-text)]"
                    >
                      ↻ 다시 보기
                    </button>
                    <div className="flex gap-2">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--sd-muted)]">
                        0.5x
                      </span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[var(--sd-text)]">
                        1x
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-2 flex h-[30px] items-center justify-between px-1">
                  <div
                    className="font-mono text-[11px] transition-opacity"
                    style={{
                      opacity: answered ? 1 : 0,
                      color: answered?.ok ? "var(--sd-ok)" : "var(--sd-warn)"
                    }}
                  >
                    {answered?.ok ? "맞았습니다" : "복습 목록에 추가했습니다"}
                  </div>
                  <button
                    ref={nextBtnRef}
                    type="button"
                    onClick={next}
                    className="font-mono text-[12px] text-[var(--sd-primary)] transition-opacity hover:text-white"
                    style={{
                      opacity: answered ? 1 : 0,
                      pointerEvents: answered ? "auto" : "none"
                    }}
                  >
                    다음 문제 →
                  </button>
                </div>

                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  aria-label="다음 수어의 의미를 선택하세요. 동작 설명: 손을 들어 가볍게 흔드는 동작"
                >
                  {options.map((opt, i) => {
                    const isAnswer = opt.id === current.sign.id;
                    const picked = answered?.pickedId === opt.id;
                    const showOk = answered && isAnswer;
                    const showBad = answered && picked && !isAnswer;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!!answered}
                        onClick={() => answer(opt)}
                        className="relative w-full rounded-md border p-[10px_14px] text-left font-mono text-[12px] transition-colors"
                        style={{
                          borderColor: showOk
                            ? "var(--sd-ok)"
                            : showBad
                            ? "var(--sd-bad)"
                            : "rgba(126,184,255,0.22)",
                          background: showOk
                            ? "rgba(74,222,128,0.1)"
                            : showBad
                            ? "rgba(248,113,113,0.1)"
                            : "rgba(255,255,255,0.02)",
                          color: showOk
                            ? "var(--sd-ok)"
                            : showBad
                            ? "var(--sd-bad)"
                            : "var(--sd-text)"
                        }}
                      >
                        {answered ? (
                          <span className="flex w-full items-center justify-between">
                            <span>{opt.word}</span>
                            {showOk ? (
                              <span className="text-[14px]">✓</span>
                            ) : null}
                            {showBad ? (
                              <span className="text-[14px]">✕</span>
                            ) : null}
                          </span>
                        ) : (
                          <>
                            <span className="mr-2 text-[var(--sd-muted)]">
                              {i + 1}.
                            </span>
                            <span>{opt.word}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="absolute -bottom-7 left-0 w-full text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity"
                  style={{opacity: !touched && on(IDX.hint) ? 1 : 0}}
                >
                  일부러 틀려보셔도 됩니다. 그게 이 페이지의 요점입니다.
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* ── 대기열 + 코드 ── */}
        <div className="flex w-full flex-col gap-[20px] lg:w-[46%]">
          <div
            className="relative flex h-[230px] flex-col rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[18px] shadow-lg shadow-black/20"
            style={fade(on(IDX.queue), rm)}
          >
            <div className="mb-3 shrink-0 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
              출제 대기열
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-gradient-to-b from-[var(--sd-panel)] via-transparent to-[var(--sd-panel)] opacity-60" />
              <div className="flex h-full flex-col gap-2 overflow-y-auto px-1 pb-6 pt-2">
                {queue.map((item, i) => {
                  const past = i < index;
                  const cur = i === index;
                  const label = past
                    ? "완료"
                    : item.status === "new"
                    ? "처음"
                    : "복습";
                  const color = past
                    ? "rgba(255,255,255,0.2)"
                    : item.status === "new"
                    ? "rgba(255,255,255,0.55)"
                    : "var(--sd-warn)";
                  return (
                    <div
                      key={`${item.sign.id}-${i}`}
                      className={`flex items-center justify-between rounded p-[7px_12px] transition-all duration-300 ${
                        past
                          ? "opacity-30"
                          : cur
                          ? "bg-[rgba(126,184,255,0.1)] opacity-100 ring-1 ring-[rgba(126,184,255,0.5)]"
                          : "bg-white/5 opacity-80"
                      }`}
                      style={
                        i === insertedIdx && !rm
                          ? {
                              animation:
                                "sd-slide-in-right 0.4s cubic-bezier(0.4,0,0.2,1)"
                            }
                          : undefined
                      }
                    >
                      <span className="font-mono text-[11px] text-white">
                        {item.sign.word}
                      </span>
                      <span className="font-mono text-[10px]" style={{color}}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 shrink-0 font-mono text-[10px] tabular-nums text-[var(--sd-muted)]">
              대기 {waitingCount} · 복습 {reviewCount}
            </div>
          </div>

          <div style={rise(on(IDX.code), rm)}>
            <CodePanel
              filename="QuizScheduler.java"
              className="min-h-[260px] flex-1"
            >
              <div className="flex-1 overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
                <pre className="m-0 text-[var(--sd-muted)]">
                  <code className="block">
                    <span className="sd-key">public class</span> QuizScheduler{" "}
                    {"{"}
                    {"\n\n  "}
                    <span className="sd-key">public</span> Session{" "}
                    <span className="text-[var(--sd-accent)]">
                      buildSession
                    </span>
                    (Learner state, Pool pool) {"{"}
                    {"\n    List<Sign> dueReviews = pool."}
                    <span className="text-[var(--sd-accent)]">getReviews</span>
                    (state);
                    {"\n    List<Sign> unseen = pool."}
                    <span className="text-[var(--sd-accent)]">getUnseen</span>
                    (state);
                    {"\n\n    Session s = "}
                    <span className="sd-key">new</span> Session(MAX_ITEMS);
                    {"\n    s."}
                    <span className="text-[var(--sd-accent)]">add</span>
                    (dueReviews);
                    {"\n    s."}
                    <span className="text-[var(--sd-accent)]">fillWith</span>
                    (unseen);
                    {"\n    "}
                    <span className="sd-key">return</span> s;
                    {"\n  }\n\n  "}
                    <span className="sd-key">public void</span>{" "}
                    <span className="text-[var(--sd-accent)]">
                      onWrongAnswer
                    </span>
                    (Sign sign, Session current) {"{"}
                    {"\n    sign."}
                    <span className="text-[var(--sd-accent)]">
                      markForReview
                    </span>
                    ();
                    {"\n"}
                  </code>
                </pre>
                <div className="-mx-4 my-0.5 border-l-2 border-[var(--sd-primary)] bg-[rgba(126,184,255,0.12)] px-4 py-0.5">
                  <pre className="m-0">
                    <code>
                      <span className="sd-com">
                        {
                          "// 같은 세션에서 연속으로 맞히는 건 외운 게 아니라 방금 본 것이다"
                        }
                      </span>
                      {"\n    current."}
                      <span className="text-[var(--sd-accent)]">insertAt</span>
                      (current.index() + <span className="sd-num">2</span>,
                      sign);
                    </code>
                  </pre>
                </div>
                <pre className="m-0 text-[var(--sd-muted)]">
                  <code className="block">
                    {"  }\n\n  "}
                    <span className="sd-key">public void</span>{" "}
                    <span className="text-[var(--sd-accent)]">onCorrect</span>
                    (Sign sign) {"{"}
                    {"\n    "}
                    <span className="sd-key">if</span>{" "}
                    {"(sign.consecutiveDays() >= "}
                    <span className="sd-num">3</span>
                    {") {"}
                    {"\n      sign."}
                    <span className="text-[var(--sd-accent)]">markLearned</span>
                    ();
                    {"\n    }\n  }\n}"}
                  </code>
                </pre>
              </div>
            </CodePanel>
          </div>
        </div>
      </div>

      {/* ── 일부러 넣지 않은 것 ── */}
      <NoteBox
        label="일부러 넣지 않은 것"
        accent="#7eb8ff"
        className="mt-[44px]"
      >
        <ul className="space-y-3 text-[15px] leading-8">
          <li className="flex items-start">
            <span className="mr-2">·</span>
            <span>
              연속 정답 기록(스트릭)을 넣지 않았다. 하루 빠졌다고 압박을 주고
              싶지 않았다.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">·</span>
            <span>
              점수 순위표를 넣지 않았다. 배우는 속도는 사람마다 다르다.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">·</span>
            <span>
              틀렸을 때 정답을 바로 보여준다. 다시 맞힐 기회를 주는 것보다 지금
              알려주는 게 낫다.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">·</span>
            <span>
              정답 효과음을 넣지 않았다. 이 서비스는 소리로 정보를 주지 않는다.
            </span>
          </li>
        </ul>
      </NoteBox>

      {/* ── 화면 캡처 자리 ── */}
      <div className="mt-[36px] flex flex-col gap-[14px] sm:flex-row">
        {[
          {id: "IMG-01", cap: "실제 퀴즈 화면"},
          {id: "IMG-02", cap: "오답 직후 화면 · 정답을 바로 보여준다"}
        ].map(shot => (
          <div
            key={shot.id}
            className="relative flex aspect-[9/16] flex-1 flex-col overflow-hidden rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-code-bg)] sm:aspect-auto sm:h-[400px]"
          >
            <div className="flex flex-1 items-center justify-center font-mono text-[12px] text-[rgba(255,255,255,0.2)]">
              [{shot.id}] · 9:16
            </div>
            <div className="absolute bottom-0 w-full border-t border-[rgba(126,184,255,0.18)] bg-[rgba(6,13,24,0.8)] p-[10px_14px] backdrop-blur-sm">
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.48)]">
                {shot.cap}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
