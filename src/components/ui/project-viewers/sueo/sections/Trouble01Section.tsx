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

const STEPS = [0, 50, 600, 1100, 1900];
const IDX = {label: 0, heading: 1, symptom: 2, quiz: 3, hint: 4};

const TARGET = "감사합니다";
const CHIPS = ["감사합니다", "고맙습니다", "감사 합니다", "고마워요"];
const ACCEPTED = ["감사합니다", "고맙습니다", "감사 합니다", "고마워요"];

const ATTEMPTS: {
  how: string;
  result: string;
  verdict: string;
  adopted?: boolean;
}[] = [
  {
    how: "공백만 제거",
    result: "「고맙습니다」는 여전히 오답",
    verdict: "✕ 부족"
  },
  {
    how: "부분 문자열 포함 검사",
    result: "「감사」만 써도 정답 처리됨",
    verdict: "✕ 너무 헐렁함"
  },
  {
    how: "편집 거리로 유사도 판정",
    result: "「감사합니다」와 「감사했습니다」를 구분 못 함",
    verdict: "✕ 뜻과 무관한 기준"
  },
  {
    how: "단어마다 인정 표현 목록",
    result: "관리는 늘지만 판정이 명확해짐",
    verdict: "● 채택",
    adopted: true
  }
];

const norm = (s: string) => s.replace(/\s+/g, "");

/** 두 번 두드리는 「감사합니다」 동작. */
function QuizHand({playKey}: {playKey: number}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="relative z-10 h-full w-full drop-shadow-lg"
      aria-hidden="true"
    >
      <path
        d="M20,60 C20,50 40,45 60,50 C70,52 75,60 75,65 C75,70 60,75 40,75 C25,75 20,68 20,60 Z"
        fill="var(--sd-code-bg)"
        stroke="var(--sd-hand)"
        strokeWidth="2"
      />
      <g
        key={playKey}
        className="sd-sign-bye"
        style={{transformOrigin: "80% 20%"}}
      >
        <path
          d="M45,20 C45,10 55,5 65,15 C75,25 80,40 70,55 C65,62 55,65 45,60 C35,55 40,30 45,20 Z"
          fill="var(--sd-code-bg)"
          stroke="var(--sd-hand)"
          strokeWidth="2"
        />
        <path
          d="M50,25 L65,40"
          stroke="var(--sd-hand)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function Trouble01Section() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  const [mode, setMode] = useState<"before" | "after">("before");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | {ok: boolean; submitted: string}>(
    null
  );
  const [shake, setShake] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [touched, setTouched] = useState(false);
  const [counted, setCounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hintOn = t[IDX.hint] && !touched && !rm;

  useEffect(() => {
    if (inView && !counted) {
      setCounted(true);
      bumpSignCount();
    }
  }, [inView, counted, bumpSignCount]);

  const reset = useCallback(() => {
    setValue("");
    setResult(null);
    setShake(false);
    setPlayKey(k => k + 1);
    announce("");
  }, [announce]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const v = value.trim();
    if (!v || result) return;

    const ok =
      mode === "before"
        ? v === TARGET
        : ACCEPTED.some(a => norm(a) === norm(v));

    setResult({ok, submitted: v});
    if (!ok && !rm) {
      setShake(true);
      window.setTimeout(() => setShake(false), 350);
    }
    announce(
      ok
        ? mode === "after"
          ? "정답입니다. 인정된 표현입니다."
          : "정답입니다."
        : `오답으로 처리되었습니다. 정답은 ${TARGET}입니다.`
    );
  }

  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1020px] flex-col px-6 py-[100px]"
    >
      {/* ── 증상 ── */}
      <Kicker on={on(IDX.label)} instant={rm} color="var(--sd-bad)">
        03 · 트러블슈팅 01
      </Kicker>
      <WordHeading
        text="「고맙습니다」라고 썼더니 틀렸다고 나왔다"
        on={on(IDX.heading)}
        instant={rm}
        className="mt-2 text-[30px] font-black leading-tight"
      />

      <div
        className="mt-[24px] max-w-2xl rounded-md border border-[rgba(248,113,113,0.28)] border-l-[3px] border-l-[var(--sd-bad)] bg-[rgba(248,113,113,0.05)] p-[20px]"
        style={{
          opacity: on(IDX.symptom) ? 1 : 0,
          transform: on(IDX.symptom) ? "translateX(0)" : "translateX(-1rem)",
          transition: rm ? "none" : "all 0.5s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-bad)]">
          증상
        </div>
        <p className="text-[16px] leading-[32px]">
          테스트해준 친구가 계속 틀렸다고 했다. 로그를 보니 답을 맞게 쓰고
          있었다.
          <br />
          정답은 「감사합니다」로 저장돼 있었고, 친구는 「고맙습니다」라고 썼다.
          <br />
          같은 동작을 보고 같은 뜻을 말했는데 오답이었다.
        </p>
      </div>

      {/* ── 재현 퀴즈 ── */}
      <div
        className="relative mt-[36px] flex min-h-[420px] w-full flex-col gap-8 rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px] lg:flex-row lg:gap-6"
        style={fade(on(IDX.quiz), rm, "1s")}
      >
        {/* 모드 전환 */}
        <div
          className="absolute right-[22px] top-[22px] z-20 flex items-center gap-1 rounded-md border border-[rgba(126,184,255,0.2)] bg-[var(--sd-bg)] p-1"
          role="radiogroup"
          aria-label="수정 모드 선택"
        >
          {(["before", "after"] as const).map(m => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => {
                setMode(m);
                reset();
              }}
              className="rounded-[4px] px-3 py-1 font-mono text-[11px] transition-colors"
              style={
                mode === m
                  ? {background: "var(--sd-primary)", color: "var(--sd-bg)"}
                  : {color: "var(--sd-muted)"}
              }
            >
              {m === "before" ? "수정 전" : "수정 후"}
            </button>
          ))}
        </div>

        {/* 문제 */}
        <div
          className="relative mt-8 flex w-full flex-col items-center justify-center lg:mt-0 lg:w-[46%]"
          aria-label="수어 퀴즈 문제 영역"
        >
          <div className="mb-6 font-mono text-[12px] text-white/70">
            이 동작의 뜻은 무엇일까요?
          </div>

          <div className="relative mb-6 flex h-[160px] w-[160px] items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[rgba(126,184,255,0.05)] blur-xl" />
            <QuizHand playKey={playKey} />
            <p className="sr-only">
              오른손의 날을 세워 아래로 향하게 한 뒤, 손등이 위를 향한 왼손의 등
              위를 가볍게 두 번 두드리는 동작입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPlayKey(k => k + 1)}
            className="rounded px-2 py-1 font-mono text-[11px] text-[rgba(126,184,255,0.8)] transition-colors hover:text-[var(--sd-primary)]"
          >
            ↻ 다시 보기
          </button>

          <div
            className="absolute bottom-4 font-mono text-[12px] text-[var(--sd-ok)] transition-opacity duration-300"
            style={{opacity: result ? 1 : 0}}
          >
            정답: {TARGET}
          </div>
        </div>

        {/* 답안 */}
        <div
          className="relative flex min-h-[200px] w-full flex-col justify-center lg:w-[54%]"
          aria-label="수어 퀴즈 답안 영역"
        >
          <div className="mx-auto w-full max-w-[320px] lg:mx-0">
            <form onSubmit={submit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={value}
                disabled={!!result}
                onChange={e => {
                  setValue(e.target.value);
                  setTouched(true);
                }}
                onFocus={() => setTouched(true)}
                placeholder="뜻을 입력하세요"
                autoComplete="off"
                aria-label="퀴즈 답안"
                className={`flex-1 rounded-md border bg-white/5 px-[14px] py-[11px] font-mono text-[13px] transition-colors placeholder:text-white/30 ${
                  shake ? "sd-shake" : ""
                }`}
                style={{
                  borderColor: result
                    ? result.ok
                      ? "var(--sd-ok)"
                      : "var(--sd-bad)"
                    : "rgba(126,184,255,0.22)",
                  color: result
                    ? result.ok
                      ? "var(--sd-ok)"
                      : "var(--sd-bad)"
                    : "var(--sd-text)"
                }}
              />
              <button
                type="submit"
                disabled={!!result}
                className="shrink-0 rounded-md bg-[var(--sd-primary)] px-[20px] py-[10px] font-mono text-[12px] font-black text-[var(--sd-bg)] transition-colors hover:bg-[var(--sd-accent)] disabled:opacity-50"
              >
                제출
              </button>
            </form>

            <div className="relative mt-4 flex flex-wrap gap-2">
              {CHIPS.map(c => (
                <div key={c} className="relative inline-block">
                  <button
                    type="button"
                    disabled={!!result}
                    onClick={() => {
                      setTouched(true);
                      setValue(c);
                      inputRef.current?.focus();
                    }}
                    className={`rounded-full border border-[rgba(126,184,255,0.24)] px-[13px] py-[6px] font-mono text-[11px] transition-colors hover:bg-[rgba(126,184,255,0.1)] disabled:opacity-50 ${
                      c === "고맙습니다" && hintOn ? "sd-hint-pulse" : ""
                    }`}
                  >
                    {c}
                  </button>
                  {c === "고맙습니다" ? (
                    <div
                      className="pointer-events-none absolute -bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center whitespace-nowrap font-mono text-[10px] text-white/35 transition-opacity duration-300"
                      style={{opacity: hintOn ? 1 : 0}}
                    >
                      <div className="mb-1 h-2 w-px bg-white/20" />
                      「고맙습니다」로 답해보세요
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* 결과 */}
          {result ? (
            <div className="mt-6 flex w-full flex-col gap-4">
              <div
                className="sd-slide-in flex items-center gap-3 rounded-md p-3"
                style={{
                  background: result.ok
                    ? "rgba(74,222,128,0.1)"
                    : "rgba(248,113,113,0.1)",
                  border: `1px solid ${
                    result.ok ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"
                  }`
                }}
              >
                <div
                  className="font-mono text-[22px]"
                  style={{color: result.ok ? "var(--sd-ok)" : "var(--sd-bad)"}}
                >
                  {result.ok ? "✓" : "✕"}
                </div>
                <div className="flex flex-col">
                  <div
                    className="font-mono text-[13px]"
                    style={{
                      color: result.ok ? "var(--sd-ok)" : "var(--sd-bad)"
                    }}
                  >
                    {result.ok ? "정답입니다" : "오답입니다"}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-white/60">
                    {result.ok
                      ? mode === "after"
                        ? "인정된 표현: 감사합니다 · 고맙습니다 · 고마워요"
                        : ""
                      : `정답: ${TARGET}`}
                  </div>
                  {result.ok && mode === "after" ? (
                    <div className="mt-1 font-mono text-[10px] text-[var(--sd-ok)]">
                      띄어쓰기와 어미 차이는 무시합니다
                    </div>
                  ) : null}
                </div>
              </div>

              {!result.ok ? (
                <div className="flex flex-col gap-4">
                  <div className="max-w-[420px] text-[16px] leading-[32px]">
                    <p>같은 뜻인데 오답 처리됐습니다.</p>
                    <p className="mt-[8px] font-bold text-[var(--sd-bad)]">
                      저장된 정답과 글자가 달랐을 뿐입니다.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 rounded border border-[rgba(248,113,113,0.2)] bg-[rgba(6,13,24,0.5)] p-3 font-mono text-[12px]">
                    <div className="flex gap-4">
                      <span className="w-12 shrink-0 text-[var(--sd-muted)]">
                        입력:
                      </span>
                      <span className="tracking-widest">
                        {Array.from({
                          length: Math.max(
                            result.submitted.length,
                            TARGET.length
                          )
                        }).map((_, i) => {
                          const a = result.submitted[i] ?? "";
                          const b = TARGET[i] ?? "";
                          return (
                            <span
                              key={i}
                              style={{
                                color:
                                  a === b ? "var(--sd-text)" : "var(--sd-bad)"
                              }}
                            >
                              {a}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-12 shrink-0 text-[var(--sd-muted)]">
                        정답:
                      </span>
                      <span className="tracking-widest">{TARGET}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={reset}
          className="absolute bottom-[22px] right-[22px] rounded px-2 py-1 font-mono text-[11px] text-[var(--sd-muted)] transition-colors hover:text-white"
        >
          ↻ 다시 풀기
        </button>
        <div className="absolute bottom-[22px] left-[22px] font-mono text-[9px] text-white/30">
          재현용 예시입니다
        </div>
      </div>

      {/* ── 먼저 떠올린 해결책들 ── */}
      <div className="mt-[44px] w-full">
        <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
          먼저 떠올린 해결책들
        </div>
        <div className="w-full overflow-x-auto border-t border-white/10 font-mono text-[12px]">
          <div className="min-w-[600px]">
            <div className="flex border-b border-white/10 py-[13px] text-[var(--sd-muted)]">
              <div className="w-[25%] px-2">방법</div>
              <div className="w-[50%] px-2">해봤더니</div>
              <div className="w-[25%] px-2">판단</div>
            </div>
            {ATTEMPTS.map((row, i) => (
              <div
                key={row.how}
                className="flex border-b border-white/10 py-[13px] transition-all duration-500"
                style={{
                  background: row.adopted
                    ? "rgba(74,222,128,0.05)"
                    : "rgba(255,255,255,0.02)",
                  borderLeft: row.adopted
                    ? "2px solid var(--sd-ok)"
                    : undefined,
                  opacity: on(IDX.quiz) ? 1 : 0,
                  transform: on(IDX.quiz)
                    ? "translateX(0)"
                    : "translateX(-10px)",
                  transitionDelay: rm ? "0s" : `${i * 0.16}s`
                }}
              >
                <div className={`w-[25%] px-2 ${row.adopted ? "pl-4" : ""}`}>
                  {row.how}
                </div>
                <div
                  className="w-[50%] px-2"
                  style={{
                    color: row.adopted
                      ? "rgba(74,222,128,0.9)"
                      : "var(--sd-muted)"
                  }}
                >
                  {row.result}
                </div>
                <div
                  className="w-[25%] px-2"
                  style={{
                    color: row.adopted ? "var(--sd-ok)" : "var(--sd-muted)",
                    fontWeight: row.adopted ? 700 : 400
                  }}
                >
                  {row.verdict}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-[24px] text-[15px] leading-[32px]">
          문자열을 얼마나 비슷하게 볼지를 조정하는 문제가 아니었다.
          <br />
          <span className="font-bold text-[var(--sd-warn)]">
            애초에 「무엇이 정답인가」를 하나로 정해둔 게 문제였다.
          </span>
        </p>
      </div>

      {/* ── 원인 ── */}
      <NoteBox label="원인" accent="#fbbf24" className="mt-[40px]">
        <p className="text-[16px] leading-[32px]">
          수어 단어 하나에 한국어 단어 하나가 대응한다고 가정하고 데이터를
          만들었다.
          <br />
          그런데 실제로는 하나의 수어 표현이 여러 한국어 단어에 걸쳐 있다.
          <br />
          「감사합니다」와 「고맙습니다」는 다른 단어지만 같은 수어다.
          <br />
          <span className="font-bold text-[var(--sd-warn)]">
            데이터 구조가 언어의 실제 모습과 안 맞았던 것
          </span>
          이다.
        </p>
      </NoteBox>

      {/* ── 코드 before / after ── */}
      <div className="mt-[40px] flex w-full flex-col gap-4 lg:flex-row">
        <CodePanel
          filename="QuizService.java (before)"
          borderColor="rgba(248,113,113,0.28)"
          className="flex-1"
        >
          <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="sd-gutter">1</td>
                  <td className="whitespace-pre pl-4">
                    <span className="sd-key">public boolean</span>{" "}
                    <span className="text-[var(--sd-accent)]">checkAnswer</span>
                    (String submitted, Sign sign) {"{"}
                  </td>
                </tr>
                <tr>
                  <td className="sd-gutter">2</td>
                  <td className="whitespace-pre pl-4">
                    {"    String storedAnswer = sign."}
                    <span className="text-[var(--sd-accent)]">getMeaning</span>
                    ();
                  </td>
                </tr>
                <tr>
                  <td className="sd-gutter">3</td>
                  <td className="whitespace-pre pl-4"> </td>
                </tr>
                <tr style={{background: "rgba(248,113,113,0.1)"}}>
                  <td className="sd-gutter">4</td>
                  <td className="whitespace-pre pl-4">
                    {"    "}
                    <span className="sd-key">return</span> submitted.
                    <span className="text-[var(--sd-accent)]">trim</span>().
                    <span className="text-[var(--sd-accent)]">equals</span>
                    (storedAnswer);
                    <span className="ml-4 font-mono text-[10px] text-[var(--sd-bad)]">
                      ← 정답이 하나뿐
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="sd-gutter">5</td>
                  <td className="whitespace-pre pl-4">{"}"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CodePanel>

        <CodePanel
          filename="QuizService.java (after)"
          borderColor="rgba(74,222,128,0.28)"
          className="flex-1"
          headerNote={
            <div className="border-b border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.05)] px-4 py-1.5 font-mono text-[11px] text-[rgba(74,222,128,0.9)]">
              // 오답으로 처리한 답도 남겨둔다. 사전에 빠진 표현일 수 있으니까.
            </div>
          }
        >
          <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  {
                    n: 1,
                    c: (
                      <>
                        <span className="sd-key">public</span>
                        {" QuizResult "}
                        <span className="text-[var(--sd-accent)]">
                          checkAnswer
                        </span>
                        {"(String sub, Sign sign) {"}
                      </>
                    )
                  },
                  {
                    n: 2,
                    c: (
                      <>
                        {"    String norm = "}
                        <span className="text-[var(--sd-accent)]">
                          normalize
                        </span>
                        {"(sub);"}
                      </>
                    )
                  },
                  {n: 3, c: " "},
                  {
                    n: 4,
                    lit: true,
                    c: (
                      <>
                        {"    "}
                        <span className="sd-key">if</span>
                        {" (sign."}
                        <span className="text-[var(--sd-accent)]">
                          getAcceptedMeanings
                        </span>
                        {"()."}
                        <span className="text-[var(--sd-accent)]">
                          contains
                        </span>
                        {"(norm)) {"}
                      </>
                    )
                  },
                  {
                    n: 5,
                    c: (
                      <>
                        {"        "}
                        <span className="sd-key">return</span>
                        {" QuizResult."}
                        <span className="text-[var(--sd-accent)]">correct</span>
                        {"(norm);"}
                      </>
                    )
                  },
                  {n: 6, c: "    }"},
                  {n: 7, c: " "},
                  {
                    n: 8,
                    lit: true,
                    c: (
                      <>
                        {"    "}
                        <span className="text-[var(--sd-accent)]">
                          logNearMiss
                        </span>
                        {"(sign."}
                        <span className="text-[var(--sd-accent)]">getId</span>
                        {"(), sub);"}
                      </>
                    )
                  },
                  {
                    n: 9,
                    c: (
                      <>
                        {"    "}
                        <span className="sd-key">return</span>
                        {" QuizResult."}
                        <span className="text-[var(--sd-accent)]">wrong</span>
                        {"();"}
                      </>
                    )
                  },
                  {n: 10, c: "}"}
                ].map(l => (
                  <tr
                    key={l.n}
                    style={{
                      background: l.lit ? "rgba(74,222,128,0.1)" : undefined
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

      {/* Firestore 문서 */}
      <div className="mt-4 max-w-2xl overflow-hidden rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-code-bg)]">
        <div className="border-b border-white/10 bg-white/5 px-4 py-2 font-mono text-[11px] text-[var(--sd-muted)]">
          signs 컬렉션 (Firebase)
        </div>
        <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
          <div>{"{"}</div>
          <div className="ml-4">
            <span className="sd-str">&quot;id&quot;</span>:{" "}
            <span className="sd-str">&quot;sign_104&quot;</span>,
          </div>
          <div className="ml-4">
            <span className="sd-str">&quot;primaryLabel&quot;</span>:{" "}
            <span className="sd-str">&quot;감사합니다&quot;</span>,
          </div>
          <div className="-mx-4 my-1 bg-[rgba(126,184,255,0.1)] px-8 py-0.5">
            <span className="sd-str">&quot;acceptedMeanings&quot;</span>: [
            <div className="sd-str ml-4">&quot;감사합니다&quot;,</div>
            <div className="sd-str ml-4">&quot;고맙습니다&quot;,</div>
            <div className="sd-str ml-4">&quot;고마워요&quot;</div>]
          </div>
          <div className="ml-4">
            <span className="sd-str">&quot;reviewQueue&quot;</span>: []
          </div>
          <div>{"}"}</div>
        </div>
      </div>
      <div className="mt-2 font-mono text-[10px] text-white/35">
        데이터를 고치는 게 코드를 고치는 것보다 오래 걸렸습니다. 단어마다 다시
        채워야 했으니까요.
      </div>

      {/* ── 결과 ── */}
      <div className="mt-[40px] flex flex-col gap-[12px] sm:flex-row">
        <StatCard n="12개" l="인정 표현을 채운 단어" />
        <StatCard
          n="2~4개"
          l="단어당 인정 표현 수"
          numberColor="var(--sd-text)"
        />
        <StatCard
          n="0건"
          l="이후 같은 유형 오답 신고"
          numberColor="var(--sd-text)"
        />
      </div>
      <Caveat>
        테스트해준 사람 3명이 다시 풀어보는 방식으로 확인했습니다. 자동화된
        테스트는 없습니다.
      </Caveat>

      <LimitList
        className="mt-[28px]"
        label="아직 남은 것"
        items={[
          "인정 표현 목록은 제가 판단해서 넣었습니다. 수어 전문가가 검토한 게 아닙니다.",
          "단어가 12개뿐입니다. 늘어나면 이 방식의 관리 비용도 같이 늘어납니다.",
          "지역이나 세대에 따라 다른 표현은 전혀 반영하지 못했습니다.",
          "오답으로 기록된 답을 실제로 검토해서 사전에 반영하는 절차는 아직 없습니다."
        ]}
      />
    </section>
  );
}
