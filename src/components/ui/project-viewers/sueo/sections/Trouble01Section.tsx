"use client";

import {useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {CodePanel, Kicker, LimitList, NoteBox, WordHeading} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 150, 600, 1100, 1900];
const IDX = {label: 0, heading: 1, symptom: 2, repro: 3, hint: 4};

// 영상 파일(Storage)과 단어 메타데이터(Firestore)를 다른 시점에 따로 넣어서
// 한쪽에만 있는 단어가 생겼다. 재현용 고정 예시.
interface Word {
  w: string;
  storage: boolean;
  firestore: boolean;
  /** 스크린리더용 동작 설명 — 손이 장식이 아니라는 걸 지키기 위해 항상 붙인다. */
  motion: string;
}

const WORDS: Word[] = [
  {
    w: "안녕하세요",
    storage: true,
    firestore: true,
    motion: "손을 이마 옆에서 시작해 바깥쪽 아래로 내립니다."
  },
  {
    w: "감사합니다",
    storage: true,
    firestore: true,
    motion: "손날을 세워 턱에서 앞쪽 아래로 내립니다."
  },
  {
    w: "이름",
    storage: false,
    firestore: true,
    motion: "두 손가락을 펴 가슴 앞에서 맞댑니다."
  },
  {
    w: "도와주세요",
    storage: true,
    firestore: false,
    motion: "한 손을 다른 손 아래에 받쳐 함께 앞으로 밉니다."
  },
  {
    w: "학교",
    storage: false,
    firestore: true,
    motion: "두 손을 마주치듯 모읍니다."
  },
  {
    w: "괜찮아요",
    storage: false,
    firestore: false,
    motion: "손바닥을 아래로 향해 가슴 앞에서 가볍게 흔듭니다."
  }
];

const ATTEMPTS: {
  how: string;
  tried: string;
  verdict: string;
  adopted?: boolean;
}[] = [
  {
    how: "영상 파일을 다시 업로드",
    tried: "그 단어만 되고 다음 단어에서 또 남",
    verdict: "✕ 원인이 아님"
  },
  {
    how: "빈 URL이면 에러를 던지기",
    tried: "퀴즈 전체가 멈춤 · 영상 없어도 풀 수 있음",
    verdict: "✕ 과한 처리"
  },
  {
    how: "화면마다 Firestore도 조회",
    tried: "같은 코드가 세 군데로 늘어남",
    verdict: "✕ 흩어짐"
  },
  {
    how: "조회를 한 곳으로 모으고 폴백",
    tried: "호출부는 한 줄로 끝남",
    verdict: "● 채택",
    adopted: true
  }
];

const storagePath = (w: string) => `signs/${w}.mp4`;
const firestorePath = (w: string) => `signs/${w} · videoUrl`;

/** 「안녕하세요」 손. 재생 가능할 때만 루프 애니메이션 클래스를 붙인다. */
function SignHand({playing}: {playing: boolean}) {
  return (
    <svg
      viewBox="0 0 120 160"
      className="h-full w-full"
      style={{fill: "var(--sd-hand)"}}
      aria-hidden="true"
    >
      <g
        className={playing ? "sd-hand-loop" : undefined}
        style={{transformOrigin: "60px 140px"}}
      >
        <rect x="45" y="110" width="30" height="30" rx="4" />
        <path d="M 35 60 L 85 60 A 15 15 0 0 1 100 75 L 100 100 A 15 15 0 0 1 85 115 L 35 115 A 15 15 0 0 1 20 100 L 20 75 A 15 15 0 0 1 35 60 Z" />
        <rect
          x="90"
          y="68"
          width="16"
          height="36"
          rx="8"
          transform="rotate(35 90 70)"
        />
        <rect x="23" y="30" width="12" height="40" rx="6" />
        <rect x="41" y="20" width="12" height="45" rx="6" />
        <rect x="59" y="15" width="12" height="50" rx="6" />
        <rect x="77" y="25" width="12" height="45" rx="6" />
      </g>
    </svg>
  );
}

/** 저장소 한 칸 — 선택된 단어가 여기 있는지 없는지만 말한다. */
function StorePanel({
  title,
  subtitle,
  hit,
  path
}: {
  title: string;
  subtitle: string;
  hit: boolean;
  path: string;
}) {
  return (
    <div className="rounded-md border border-[rgba(126,184,255,0.16)] bg-[var(--sd-code-bg)] p-[14px]">
      <div className="font-mono text-[11px] text-[var(--sd-primary)]">
        {title}
      </div>
      <div className="mt-0.5 font-mono text-[9px] text-[rgba(255,255,255,0.35)]">
        {subtitle}
      </div>
      <div className="mt-3 font-mono text-[12px]">
        {hit ? (
          <>
            <span style={{color: "var(--sd-ok)"}}>✓ 찾음</span>
            <span className="ml-2 text-[10px] text-[var(--sd-muted)]">
              {path}
            </span>
          </>
        ) : (
          <span className="text-[rgba(255,255,255,0.32)]">✕ 없음</span>
        )}
      </div>
    </div>
  );
}

export function Trouble01Section() {
  const {reducedMotion: rm, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const reproRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  const [wordIdx, setWordIdx] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [handVisible, setHandVisible] = useState(true);

  const word = WORDS[wordIdx];
  // 수정 전은 Storage만 본다. 수정 후는 Storage → Firestore 순으로 본다.
  const resolved = fixed ? word.storage || word.firestore : word.storage;
  const source = word.storage ? "Storage" : "Firestore";

  // 재생 루프는 컨테이너가 화면 밖이거나 탭이 숨겨지면 멈춘다.
  useEffect(() => {
    const el = reproRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setHandVisible(entry.isIntersecting && !document.hidden),
      {threshold: 0}
    );
    io.observe(el);
    const onVis = () => setHandVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  function pick(i: number) {
    setTouched(true);
    setWordIdx(i);
    const w = WORDS[i];
    const ok = fixed ? w.storage || w.firestore : w.storage;
    announce(ok ? "영상을 찾았습니다." : "영상을 찾지 못했습니다.");
  }

  const on = (i: number) => t[i] || rm;
  const hintOn = t[IDX.hint] && !touched && !rm;
  const playing = resolved && handVisible && !rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1020px] flex-col px-6 py-[100px]"
    >
      {/* ── Block A: 증상 ── */}
      <Kicker on={on(IDX.label)} instant={rm} color="var(--sd-bad)">
        03 · 트러블슈팅 01
      </Kicker>
      <WordHeading
        text="에러는 없는데 영상 자리만 비어 있었다"
        on={on(IDX.heading)}
        instant={rm}
        className="mt-2 text-[30px] font-black leading-tight"
      />

      <div
        className="mt-[24px] rounded-md border border-[rgba(248,113,113,0.28)] border-l-[3px] border-l-[var(--sd-bad)] bg-[rgba(248,113,113,0.05)] p-[20px]"
        style={{
          opacity: on(IDX.symptom) ? 1 : 0,
          transform: on(IDX.symptom) ? "translateX(0)" : "translateX(-1rem)",
          transition: rm ? "none" : "all 0.5s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-bad)]">
          증상
        </div>
        <p className="text-[16px] leading-8">
          어떤 단어는 문제와 보기 네 개가 정상으로 떴다. 그런데 동작 영상만
          나오지 않았다. 서버는 200을 돌려줬고 에러 로그도 없었다. 응답을
          열어보니 영상 URL이 빈 문자열이었다. 같은 단어를 다른 화면에서 열면 잘
          나오는 경우도 있었다.
        </p>
      </div>

      {/* ── Block B: 두 저장소 재현 ── */}
      <div
        ref={reproRef}
        className="relative mt-[36px] rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px]"
        style={{
          opacity: on(IDX.repro) ? 1 : 0,
          transform: on(IDX.repro) ? "translateY(0)" : "translateY(16px)",
          transition: rm ? "none" : "all 0.6s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <div className="flex h-[30px] items-center justify-between border-b border-[rgba(126,184,255,0.10)]">
          <span className="font-mono text-[10px] text-[var(--sd-muted)]">
            재현 · 단어를 골라보세요
          </span>
          <div className="flex gap-1" role="group" aria-label="조회 방식">
            {[false, true].map(mode => (
              <button
                key={String(mode)}
                type="button"
                aria-pressed={fixed === mode}
                onClick={() => setFixed(mode)}
                className="rounded px-2 py-0.5 font-mono text-[11px] transition-colors"
                style={
                  fixed === mode
                    ? {
                        background: "rgba(126,184,255,0.14)",
                        color: "var(--sd-primary)"
                      }
                    : {color: "var(--sd-muted)"}
                }
              >
                {mode ? "수정 후" : "수정 전"}
              </button>
            ))}
          </div>
        </div>

        {/* 단어 칩 */}
        <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {WORDS.map((w, i) => {
            const active = i === wordIdx;
            const pulsing = hintOn && w.w === "이름";
            return (
              <button
                key={w.w}
                type="button"
                aria-pressed={active}
                onClick={() => pick(i)}
                className={`shrink-0 rounded-full border px-[15px] py-[7px] font-mono text-[12px] transition-colors ${
                  pulsing ? "sd-chip-pulse" : ""
                }`}
                style={
                  active
                    ? {
                        background: "rgba(126,184,255,0.14)",
                        color: "var(--sd-primary)",
                        borderColor: "var(--sd-primary)"
                      }
                    : {borderColor: "rgba(126,184,255,0.24)"}
                }
              >
                {w.w}
              </button>
            );
          })}
        </div>
        <div
          className="mt-2 h-[14px] font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity"
          style={{opacity: hintOn ? 1 : 0}}
        >
          「이름」을 눌러보세요
        </div>

        <div className="mt-3 flex flex-col gap-[18px] lg:flex-row">
          {/* 재생기 */}
          <div className="w-full lg:w-[46%]">
            <div className="mb-2 text-[15px] font-bold text-[var(--sd-accent)]">
              {word.w}
            </div>
            <div className="relative flex h-[240px] items-center justify-center rounded-md border border-[rgba(126,184,255,0.14)] bg-[var(--sd-code-bg)]">
              {resolved ? (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(126,184,255,0.07)_0%,transparent_65%)]" />
                  <div key={replayKey} className="relative h-[170px] w-[150px]">
                    <SignHand playing={playing} />
                  </div>
                  <span className="sr-only">{word.motion}</span>
                </>
              ) : (
                // 오류처럼 보이면 안 된다 — 이 버그의 성격이 「아무 일도 없어 보인다」는 것.
                <div className="flex h-[170px] w-[150px] items-center justify-center border border-dashed border-[rgba(255,255,255,0.14)]">
                  <span className="font-mono text-[11px] text-[rgba(255,255,255,0.32)]">
                    영상 없음
                  </span>
                  <span className="sr-only">
                    이 단어는 재생할 영상이 없습니다.
                  </span>
                </div>
              )}
            </div>
            {resolved ? (
              <button
                type="button"
                onClick={() => setReplayKey(k => k + 1)}
                className="mt-2 font-mono text-[11px] text-[var(--sd-muted)] transition-colors hover:text-white"
              >
                ↻ 다시 보기
              </button>
            ) : null}
          </div>

          {/* 두 저장소 */}
          <div className="flex w-full flex-col gap-3 lg:w-[54%]">
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <div className="flex-1">
                <StorePanel
                  title="Firebase Storage"
                  subtitle="실제 영상 파일"
                  hit={word.storage}
                  path={storagePath(word.w)}
                />
              </div>

              {/* 폴백 화살표 — 수정 후에 Storage가 비었을 때만 */}
              {fixed && !word.storage ? (
                <div
                  key={`${word.w}-arrow`}
                  className={`flex items-center justify-center sm:hidden lg:flex ${
                    rm ? "" : "sd-arrow-draw"
                  }`}
                  aria-hidden="true"
                >
                  <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                    <path
                      d="M6 0 L6 14 M1.5 9.5 L6 14 L10.5 9.5"
                      stroke="var(--sd-ok)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}

              <div className="flex-1">
                <StorePanel
                  title="Firestore"
                  subtitle="단어 메타데이터 + videoUrl 필드"
                  hit={word.firestore}
                  path={firestorePath(word.w)}
                />
              </div>
            </div>

            {/* 결과 */}
            <div
              className="rounded-md p-3 font-mono text-[12px]"
              style={
                resolved
                  ? {
                      background: "rgba(74,222,128,0.06)",
                      borderLeft: "3px solid var(--sd-ok)"
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      borderLeft: "3px solid rgba(255,255,255,0.14)"
                    }
              }
            >
              {!fixed ? (
                word.storage ? (
                  <div>영상 URL 반환</div>
                ) : (
                  <>
                    <div>빈 문자열 반환 · 에러 아님</div>
                    {word.firestore ? (
                      <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.35)]">
                        Firestore에는 있는데 보지 않았습니다
                      </div>
                    ) : null}
                  </>
                )
              ) : resolved ? (
                <>
                  <div>영상 URL 반환</div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{color: "var(--sd-ok)"}}
                  >
                    출처: {source}
                  </div>
                </>
              ) : (
                <div className="text-[var(--sd-muted)]">
                  영상 없음 · 여전히 빈 값
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 font-mono text-[9px] text-[rgba(255,255,255,0.32)]">
          재현용 예시입니다
        </div>
      </div>

      {/* ── Block C: 먼저 떠올린 해결책들 ── */}
      <div className="mt-[44px] w-full">
        <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
          먼저 떠올린 해결책들
        </div>
        <div className="w-full overflow-x-auto border-t border-white/10 font-mono text-[12px]">
          <div className="min-w-[600px]">
            <div className="flex border-b border-white/10 py-[13px] text-[var(--sd-muted)]">
              <div className="w-[28%] px-2">방법</div>
              <div className="w-[47%] px-2">해봤더니</div>
              <div className="w-[25%] px-2">판단</div>
            </div>
            {ATTEMPTS.map((row, i) => (
              <div
                key={row.how}
                className="flex border-b border-white/10 py-[13px] transition-all duration-500"
                style={{
                  borderLeft: row.adopted
                    ? "2px solid var(--sd-ok)"
                    : undefined,
                  opacity: on(IDX.repro) ? 1 : 0,
                  transform: on(IDX.repro)
                    ? "translateX(0)"
                    : "translateX(-10px)",
                  transitionDelay: rm ? "0s" : `${i * 0.16}s`
                }}
              >
                <div className={`w-[28%] px-2 ${row.adopted ? "pl-4" : ""}`}>
                  {row.how}
                </div>
                <div className="w-[47%] px-2 text-[var(--sd-muted)]">
                  {row.tried}
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

        <p className="mt-[24px] text-[15px] leading-8">
          영상이 없는 게 문제가 아니었다.
          <br />
          <span className="font-bold text-[var(--sd-warn)]">
            어디를 봐야 하는지가 코드마다 달랐던 게 문제였다.
          </span>
        </p>
      </div>

      {/* ── Block D: 원인 ── */}
      <NoteBox label="원인" accent="#fbbf24" className="mt-[40px]">
        <p className="text-[16px] leading-8">
          영상 파일은 Storage에 올리고, 단어 정보는 Firestore에 넣었다. 두
          작업을 다른 시점에 따로 했기 때문에 한쪽에만 있는 단어가 생겼다.
          그런데{" "}
          <span className="font-bold text-[var(--sd-warn)]">
            화면마다 둘 중 아무 쪽이나 조회하고 있었다.
          </span>{" "}
          그래서 같은 단어가 어떤 화면에서는 나오고 어떤 화면에서는 안 나왔다.
        </p>
      </NoteBox>

      {/* ── Block E: 수정 ── */}
      <div className="mt-[40px] flex flex-col gap-4 lg:flex-row">
        <CodePanel
          filename="before — 호출부마다 제각각"
          borderColor="rgba(248,113,113,0.28)"
          className="flex-1"
        >
          <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  {
                    n: 1,
                    c: (
                      <span className="sd-com">
                        {"// QuizService — 문제를 만들 때"}
                      </span>
                    )
                  },
                  {
                    n: 2,
                    lit: true,
                    c: (
                      <>
                        {"String url = storageVideoCache.findUrl(word);"}
                        <span className="ml-4 text-[10px] text-[var(--sd-bad)]">
                          ← 서로 다른 곳을 봄
                        </span>
                      </>
                    )
                  },
                  {n: 3, c: "quiz.setVideoUrl(url);"},
                  {n: 4, c: " "},
                  {
                    n: 5,
                    c: (
                      <span className="sd-com">
                        {"// SignDetailService — 단어 상세를 열 때"}
                      </span>
                    )
                  },
                  {n: 6, c: "SignDoc doc = firestore.findByWord(word);"},
                  {
                    n: 7,
                    lit: true,
                    c: (
                      <>
                        {"String url = doc.getVideoUrl();"}
                        <span className="ml-4 text-[10px] text-[var(--sd-bad)]">
                          ← 서로 다른 곳을 봄
                        </span>
                      </>
                    )
                  },
                  {n: 8, c: "detail.setVideoUrl(url);"}
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
          filename="StorageVideoCache.java (after)"
          borderColor="rgba(74,222,128,0.28)"
          className="flex-1"
          footer="// 호출부는 이 한 줄만 부른다. 어디에 있는지는 이 안에서만 안다."
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
                        {
                          " String findUrlOrFallback(String word, String fallbackUrl) {"
                        }
                      </>
                    )
                  },
                  {n: 2, lit: true, c: "  String storageUrl = findUrl(word);"},
                  {
                    n: 3,
                    c: (
                      <>
                        {"  "}
                        <span className="sd-key">if</span>
                        {" (storageUrl != "}
                        <span className="sd-key">null</span>
                        {" && !storageUrl.isBlank()) {"}
                      </>
                    )
                  },
                  {
                    n: 4,
                    c: (
                      <>
                        {"    "}
                        <span className="sd-key">return</span>
                        {" storageUrl;"}
                      </>
                    )
                  },
                  {n: 5, c: "  }"},
                  {
                    n: 6,
                    lit: true,
                    c: (
                      <>
                        {"  "}
                        <span className="sd-key">return</span>
                        {" fallbackUrl == "}
                        <span className="sd-key">null</span>
                        {" ? "}
                        <span className="sd-str">&quot;&quot;</span>
                        {" : fallbackUrl.trim();"}
                      </>
                    )
                  },
                  {n: 7, c: "}"}
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

      <CodePanel filename="QuizService.java (호출부)" className="mt-4">
        <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
          <div
            className="whitespace-pre px-2 py-1"
            style={{background: "rgba(126,184,255,0.12)"}}
          >
            {
              "String videoUrl = storageVideoCache.findUrlOrFallback(correctChoiceText, firestoreVideoUrl);"
            }
          </div>
        </div>
      </CodePanel>
      <div className="mt-2 font-mono text-[10px] text-[rgba(255,255,255,0.35)]">
        조회 순서를 바꾸고 싶으면 이제 한 파일만 고치면 됩니다.
      </div>

      {/* ── Block F: 검증 + 남은 것 ── */}
      <div className="mt-[40px] rounded-md border border-[rgba(74,222,128,0.22)] bg-[rgba(74,222,128,0.04)] p-4">
        <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-ok)]">
          검증
        </div>
        <ul className="text-[15px] leading-8">
          {[
            "Storage에만 있는 단어 — 정상 재생",
            "Firestore에만 있는 단어 — 폴백으로 정상 재생",
            "둘 다 있는 단어 — Storage 우선, 동작 동일"
          ].map(line => (
            <li key={line}>✓ {line}</li>
          ))}
        </ul>
      </div>
      <div className="mt-2 font-mono text-[10px] text-[rgba(255,255,255,0.32)]">
        단어를 하나씩 직접 열어보는 방식으로 확인했습니다. 자동화된 테스트는
        없습니다.
      </div>

      <LimitList
        className="mt-[28px]"
        label="아직 남은 것"
        items={[
          "두 저장소 모두에 없는 단어는 여전히 빈 값이 나갑니다. 화면에서 조용히 비어 보이는 건 똑같습니다.",
          "조회 결과를 캐시에 담아두는데, 영상을 새로 올려도 캐시를 지우는 절차가 없습니다.",
          "애초에 두 저장소의 단어 표기를 맞추는 일은 코드가 아니라 데이터 정리로 해결해야 합니다. 아직 안 했습니다.",
          "빈 영상이 나갔을 때 그걸 기록해두고 나중에 채우는 절차가 없습니다."
        ]}
      />
    </section>
  );
}
