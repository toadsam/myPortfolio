"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {
  Caveat,
  CodePanel,
  fade,
  Kicker,
  NoteBox,
  rise,
  WordHeading
} from "../parts";
import {
  answerOf,
  QUIZ_ITEMS,
  QUIZ_QUESTION_TEXT,
  type QuizItem
} from "../signData";
import {useInView, useTimeline} from "../useTimeline";

// 04 · 반복 학습
// 기준: GitHub 저장소 toadsam/Sign-Language (main).
// - 세션: 활성 문항을 섞어서 N개(QuizService, 앱은 10개를 요청). 응답에 정답 ID 가 없다.
// - 채점: POST /api/quiz/answer 에서 서버가 correctChoiceId 와 비교한다.
// - 복습: GET /api/quiz/session/wrong 이 사용자 문서의 incorrectQuestionCounts 를
//   많이 틀린 순으로 정렬해 다시 뽑는다(getWrongQuizIds).
// 이 도메인은 류태원 코드다. 정재훈 몫은 카테고리 필터와 문항 업로드 스크립트(133eb9a).
// 시연은 5문항으로 줄였고, 아바타 영상 대신 손 그림을 쓴다.

const STEPS = [0, 150, 700, 1200, 1800, 2300];
const IDX = {label: 0, heading: 1, intro: 2, quiz: 3, side: 4, notes: 5};

const SESSION_SIZE = 5;

const CHECK = `// QuizService.java:82-91
String correctChoiceId = normalizeChoiceId(doc.getString("correctChoiceId"));
...
List<String> choices = toStringList(doc.get("choices"));
String selectedChoiceId = normalizeChoiceId(request.selectedChoiceId());
boolean isCorrect = correctChoiceId.equals(selectedChoiceId);
updateQuizStats(request.quizId(), isCorrect);   // FieldValue.increment`;

const WRONG = `// QuizService.java:174-189
Map<String, Integer> wrongCounts = toStringIntegerMap(userDoc.get("incorrectQuestionCounts"));
if (!wrongCounts.isEmpty()) {
  List<Map.Entry<String, Integer>> entries = new ArrayList<>(wrongCounts.entrySet());
  entries.sort(
      Comparator.comparingInt((Map.Entry<String, Integer> entry) -> entry.getValue()).reversed()
          .thenComparing(Map.Entry::getKey));
  ...
}`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 아바타 영상 자리 — 실제 앱은 팀원이 만든 3D 아바타 영상을 튼다. */
function StandInHand({playKey, rm}: {playKey: number; rm: boolean}) {
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
    <svg width="110" height="110" viewBox="0 0 100 100" aria-hidden="true">
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
  const on = (i: number) => t[i] || rm;

  const [mode, setMode] = useState<"normal" | "wrong">("normal");
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [stats, setStats] = useState({attempt: 0, correct: 0});
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const current = queue[index];

  const start = useCallback(
    (m: "normal" | "wrong", counts: Record<string, number>) => {
      let next: QuizItem[];
      if (m === "wrong") {
        const ids = Object.entries(counts)
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([id]) => id);
        next = ids
          .map(id => QUIZ_ITEMS.find(q => q.id === id))
          .filter((q): q is QuizItem => Boolean(q));
      } else {
        next = shuffle(QUIZ_ITEMS).slice(0, SESSION_SIZE);
      }
      setMode(m);
      setQueue(next);
      setIndex(0);
      setPicked(null);
      setDone(false);
      setPlayKey(k => k + 1);
    },
    []
  );

  useEffect(() => {
    if (inView && !queue.length) start("normal", {});
  }, [inView, queue.length, start]);

  function answer(choiceIdx: number) {
    if (picked || !current) return;
    const letter = "ABCD"[choiceIdx];
    const ok = letter === current.correct;
    setPicked(letter);
    setStats(s => ({
      attempt: s.attempt + 1,
      correct: s.correct + (ok ? 1 : 0)
    }));
    bumpSignCount();
    if (!ok) {
      setWrongCounts(c => ({...c, [current.id]: (c[current.id] ?? 0) + 1}));
    }
    announce(
      ok
        ? "정답입니다."
        : `오답입니다. 정답은 ${answerOf(
            current
          )}입니다. 오답 횟수에 기록했습니다.`
    );
  }

  function next() {
    if (index + 1 >= queue.length) {
      setDone(true);
      announce("세션이 끝났습니다.");
      return;
    }
    setIndex(i => i + 1);
    setPicked(null);
    setPlayKey(k => k + 1);
  }

  const wrongList = Object.entries(wrongCounts).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto w-full max-w-[1120px] px-6 py-[100px] lg:px-8"
    >
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
          text="채점은 서버가 하고, 많이 틀린 문제부터 다시 낸다"
          on={on(IDX.heading)}
          instant={rm}
          stepMs={60}
          className="mb-5 text-[26px] font-black leading-tight md:text-[28px]"
        />
        <p
          className="max-w-[760px] text-[16px] leading-[36px]"
          style={rise(on(IDX.intro), rm)}
        >
          동작 영상을 보여주고 보기 네 개 중 뜻을 고르게 한다. 세션을 줄 때
          정답은 빼고 보내고, 고른 보기를 받아{" "}
          <span className="font-bold text-[var(--sd-accent)]">서버가 채점</span>
          한다. 틀리면 사용자 문서에 문항별 오답 횟수가 쌓이고, 오답 복습은 그
          횟수가 큰 문항부터 다시 뽑는다. 이 흐름은 프론트 담당 팀원이 화면과
          API 를 함께 만들었고, 나는 기초 단어·일상 회화 카테고리 필터와 20문항
          업로드 스크립트를 붙였다.
        </p>
      </div>

      <div className="flex flex-col gap-[20px] lg:flex-row">
        {/* ── 퀴즈 ── */}
        <div
          className="relative flex min-h-[480px] w-full flex-col rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-5 lg:w-[56%]"
          style={rise(on(IDX.quiz), rm)}
        >
          {done ? (
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-5 text-center">
              <h3 className="text-[16px] font-bold">
                {mode === "wrong" ? "오답 복습 끝" : "세션 끝"}
              </h3>
              <p className="max-w-[340px] text-[15px] leading-8 text-[var(--sd-muted)]">
                {wrongList.length
                  ? "틀린 문항이 오답 횟수로 쌓였습니다. 복습 세션은 그 횟수가 큰 문항부터 뽑습니다."
                  : "틀린 문항이 없어 복습 세션은 비어 있습니다. 일부러 틀려 보셔도 됩니다."}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => start("normal", wrongCounts)}
                  className="rounded border border-[rgba(126,184,255,0.3)] px-4 py-2 font-mono text-[11px] text-[var(--sd-muted)] hover:text-white"
                >
                  ↻ 새 세션 · GET /api/quiz/session
                </button>
                <button
                  type="button"
                  disabled={!wrongList.length}
                  onClick={() => start("wrong", wrongCounts)}
                  className="rounded border border-[var(--sd-warn)] px-4 py-2 font-mono text-[11px] text-[var(--sd-warn)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  오답 복습 · GET /api/quiz/session/wrong
                </button>
              </div>
            </div>
          ) : current ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] tabular-nums text-[rgba(255,255,255,0.72)]">
                  {mode === "wrong" ? "오답 복습 " : ""}
                  {index + 1} / {queue.length} · {current.id}
                </span>
                <span className="font-mono text-[11px] text-[var(--sd-muted)]">
                  {current.category === "basic" ? "기초 단어" : "일상 회화"}
                </span>
              </div>

              <div className="relative mb-3 flex h-[170px] items-center justify-center overflow-hidden rounded border border-[rgba(126,184,255,0.1)] bg-[var(--sd-bg)]">
                <StandInHand playKey={playKey} rm={rm} />
                <span className="absolute left-2 top-2 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-[var(--sd-muted)]">
                  아바타 영상 자리 · 재현
                </span>
                {mode === "wrong" ? (
                  <span className="absolute right-2 top-2 rounded border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--sd-warn)]">
                    틀린 횟수 {wrongCounts[current.id] ?? 0}
                  </span>
                ) : null}
              </div>

              <p className="mb-3 text-[15px] font-bold">
                {QUIZ_QUESTION_TEXT[current.category]}
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {current.choices.map((c, i) => {
                  const letter = "ABCD"[i];
                  const isAnswer = letter === current.correct;
                  const showOk = picked && isAnswer;
                  const showBad = picked === letter && !isAnswer;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={!!picked}
                      onClick={() => answer(i)}
                      className="rounded-md border p-[10px_14px] text-left font-mono text-[12px] transition-colors"
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
                      <span className="mr-2 text-[var(--sd-muted)]">
                        {letter}
                      </span>
                      {c}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex min-h-[40px] items-center justify-between gap-3">
                <span className="font-mono text-[10px] leading-4 text-[var(--sd-muted)]">
                  {picked
                    ? `POST /api/quiz/answer {selectedChoiceId:"${picked}"} → isCorrect=${
                        picked === current.correct
                      }`
                    : "보기를 고르면 서버가 채점합니다"}
                </span>
                <button
                  type="button"
                  onClick={next}
                  className="shrink-0 font-mono text-[12px] text-[var(--sd-primary)] hover:text-white"
                  style={{
                    opacity: picked ? 1 : 0,
                    pointerEvents: picked ? "auto" : "none"
                  }}
                >
                  다음 →
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* ── 기록 + 코드 ── */}
        <div
          className="flex w-full flex-col gap-[20px] lg:w-[44%]"
          style={fade(on(IDX.side), rm)}
        >
          <div className="rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[18px]">
            <div className="mb-3 font-mono text-[10px] tracking-[0.12em] text-[var(--sd-muted)]">
              users/{"{uid}"} · incorrectQuestionCounts
            </div>
            {wrongList.length ? (
              <div className="flex flex-col gap-1.5">
                {wrongList.map(([id, n]) => {
                  const q = QUIZ_ITEMS.find(x => x.id === id)!;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5 font-mono text-[11px]"
                    >
                      <span>
                        {id} · {answerOf(q)}
                      </span>
                      <span className="text-[var(--sd-warn)]">{n}회</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="font-mono text-[11px] text-[rgba(255,255,255,0.35)]">
                아직 틀린 문항이 없습니다
              </div>
            )}
            <div className="mt-3 font-mono text-[10px] tabular-nums text-[var(--sd-muted)]">
              이 세션 · 시도 {stats.attempt} · 정답 {stats.correct}
            </div>
          </div>

          <CodePanel
            filename="QuizService.java · 팀원 코드"
            footer="// 정답은 세션 응답에 없고, 채점은 여기서만 한다"
          >
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)]">
              {CHECK}
            </pre>
          </CodePanel>
          <CodePanel filename="QuizService.getWrongQuizIds · 팀원 코드">
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)]">
              {WRONG}
            </pre>
          </CodePanel>
        </div>
      </div>
      <Caveat>
        보기와 정답은 update_quiz_items.py 의 실제 20문항입니다. 시연은
        5문항으로 줄였고(앱은 10문항), 기록은 이 브라우저 안에서만 흉내 냅니다.
      </Caveat>

      <div
        className="mt-[40px] flex flex-col gap-4"
        style={fade(on(IDX.notes), rm)}
      >
        <NoteBox label="코드가 말하는 약점" accent="#fbbf24">
          <ul className="space-y-2 text-[15px] leading-8">
            <li>
              · 채점은 서버가 하지만, 사용자 기록을 남기는{" "}
              <span className="font-mono text-[13px]">
                PATCH /api/users/{"{uid}"}/tryQuestion
              </span>{" "}
              은 앱이 보낸 isCorrect 를 그대로 믿습니다. 인증도 없어서 누구든
              정답이라고 보낼 수 있습니다.
            </li>
            <li>
              · 문항 통계는 FieldValue.increment 로 원자적으로 올리지만, 사용자
              기록은 문서를 읽고 고쳐 다시 쓰기 때문에 동시 요청에서 갱신이
              사라질 수 있습니다.
            </li>
            <li>
              · 통계 저장이 실패하면 채점 흐름을 막지 않으려고 예외를 삼키는데,
              로그를 남기지 않아 틀어져도 알 방법이 없습니다.
            </li>
          </ul>
        </NoteBox>
      </div>

      {/* ── 화면 캡처 ── 배포본(GitHub Pages)에서 찍은 실제 화면.
          폰 비율(500×1023)이라 contain 으로 넣는다. */}
      <div className="mt-[36px] flex flex-col gap-[14px] sm:flex-row">
        {[
          {
            src: "/projects/sign-language/quiz.webp",
            cap: "실제 퀴즈 화면 · 아바타 영상을 보고 보기 4개 중 뜻을 고른다"
          },
          {
            src: "/projects/sign-language/learn.webp",
            cap: "학습하기 · 기초 단어 · 오답 복습 · 일상 회화"
          }
        ].map(shot => (
          <div
            key={shot.src}
            className="relative flex aspect-[9/16] flex-1 flex-col overflow-hidden rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-code-bg)] sm:aspect-auto sm:h-[400px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.cap}
              className="h-full w-full object-contain"
            />
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
