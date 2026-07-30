"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {useAClub} from "../context";
import {CATEGORY_COLORS, type CategoryName} from "../data";
import {Kicker, Reveal, RevealWords, useInViewOnce} from "../parts";

type ScreenId = "scr-1" | "scr-2" | "scr-3" | "scr-4" | "scr-login";

const SCREENS: Record<ScreenId, {title: string; step: string; path: string; lines: number[]}> = {
  "scr-1": {title: "동아리 둘러보기", step: "1 / 4", path: "/clubs", lines: [2]},
  "scr-2": {title: "동아리 상세", step: "2 / 4", path: "/clubs/:id", lines: [3]},
  "scr-3": {title: "모집 공고", step: "3 / 4", path: "/clubs/:id/recruit", lines: [4]},
  "scr-4": {title: "지원하기", step: "4 / 4", path: "/clubs/:id/apply", lines: [5, 6, 7, 8, 9]},
  "scr-login": {title: "로그인", step: "인증 대기", path: "/login", lines: [10]},
};

const NODES: Record<ScreenId, {top: number; left: number; width: number}> = {
  "scr-1": {top: 0, left: 0, width: 150},
  "scr-2": {top: 60, left: 0, width: 150},
  "scr-3": {top: 120, left: 0, width: 150},
  "scr-4": {top: 180, left: 0, width: 150},
  "scr-login": {top: 180, left: 190, width: 110},
};

const MOCK_CLUBS: {name: string; cat: CategoryName}[] = [
  {name: "빛그림 사진회", cat: "예술"},
  {name: "코드나무", cat: "학술"},
  {name: "달리는 사람들", cat: "운동"},
  {name: "따뜻한 손길", cat: "봉사"},
  {name: "보드게임 연구소", cat: "취미"},
  {name: "한밤의 밴드", cat: "예술"},
];

// routes.tsx — 원본 디자인의 코드 블록이 HTML 파서에 먹혀 닫는 태그가 깨져 있었으므로
// 문자열로 다시 적었다.
const ROUTE_LINES: {no: number; body: ReactNode}[] = [
  {no: 1, body: <>&lt;<Kwd>Routes</Kwd>&gt;</>},
  {
    no: 2,
    body: (
      <>
        {"  "}&lt;<Kwd>Route</Kwd> path=<Strn>&quot;/clubs&quot;</Strn> element={"{"}&lt;<Kwd>List</Kwd>/&gt;{"}"} /&gt;
      </>
    ),
  },
  {
    no: 3,
    body: (
      <>
        {"  "}&lt;<Kwd>Route</Kwd> path=<Strn>&quot;/clubs/:id&quot;</Strn> element={"{"}&lt;<Kwd>Detail</Kwd>/&gt;{"}"} /&gt;
      </>
    ),
  },
  {
    no: 4,
    body: (
      <>
        {"  "}&lt;<Kwd>Route</Kwd> path=<Strn>&quot;/clubs/:id/recruit&quot;</Strn> element={"{"}&lt;<Kwd>Recruit</Kwd>/&gt;
        {"}"} /&gt;
      </>
    ),
  },
  {
    no: 5,
    body: (
      <>
        {"  "}&lt;<Kwd>Route</Kwd> path=<Strn>&quot;/clubs/:id/apply&quot;</Strn> element={"{"}
      </>
    ),
  },
  {no: 6, body: <>{"    "}&lt;<Kwd>RequireAuth</Kwd>&gt;</>},
  {no: 7, body: <>{"      "}&lt;<Kwd>Apply</Kwd>/&gt;</>},
  {no: 8, body: <>{"    "}&lt;/<Kwd>RequireAuth</Kwd>&gt;</>},
  {no: 9, body: <>{"  "}{"}"} /&gt;</>},
  {
    no: 10,
    body: (
      <>
        {"  "}&lt;<Kwd>Route</Kwd> path=<Strn>&quot;/login&quot;</Strn> element={"{"}&lt;<Kwd>Login</Kwd>/&gt;{"}"} /&gt;
      </>
    ),
  },
  {no: 11, body: <>&lt;/<Kwd>Routes</Kwd>&gt;</>},
];

function Kwd({children}: {children: ReactNode}) {
  return <span style={{color: "#c084fc"}}>{children}</span>;
}
function Strn({children}: {children: ReactNode}) {
  return <span style={{color: "#fcd34d"}}>{children}</span>;
}

export function UserFlowSection() {
  const {reducedMotion} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({threshold: 0.1});

  const [auth, setAuth] = useState<"loggedOut" | "loggedIn">("loggedOut");
  const [stack, setStack] = useState<ScreenId[]>(["scr-1"]);
  const [intended, setIntended] = useState<ScreenId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [visited, setVisited] = useState<Set<ScreenId>>(new Set(["scr-1"]));
  const timers = useRef<number[]>([]);

  const current = stack[stack.length - 1]!;
  const data = SCREENS[current];

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setPhase(4);
      return;
    }
    const push = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    push(() => setPhase(1), 700); // 설명문
    push(() => setPhase(2), 1200); // 기기 · 토글
    push(() => setPhase(3), 1800); // 지도
    push(() => setPhase(4), 2400); // 코드
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [inView, reducedMotion]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  function showToast(msg: string) {
    setToast(msg);
    timers.current.push(window.setTimeout(() => setToast(null), 2500));
  }

  function navigate(target: ScreenId) {
    setInteracted(true);
    // 보호 라우트 — 로그인 전이면 로그인 화면으로 보내고 원래 목적지를 기억한다.
    if (target === "scr-4" && auth === "loggedOut") {
      setIntended("scr-4");
      setStack((s) => [...s, "scr-login"]);
      setVisited((v) => new Set(v).add("scr-login"));
      return;
    }
    setStack((s) => [...s, target]);
    setVisited((v) => new Set(v).add(target));
  }

  function goBack() {
    if (stack.length <= 1) return;
    if (current === "scr-login") setIntended(null);
    setStack((s) => s.slice(0, -1));
  }

  function handleLogin() {
    setAuth("loggedIn");
    const target = intended ?? "scr-1";
    setIntended(null);
    setStack((s) => [...s.slice(0, -1), target]);
    setVisited((v) => new Set(v).add(target));
    showToast("원래 가려던 화면으로 돌아왔습니다");
  }

  function handleSubmit() {
    showToast("지원이 접수되었습니다 (시연용)");
    timers.current.push(window.setTimeout(() => setStack(["scr-1"]), 2000));
  }

  const marker = NODES[current];
  const showHint = phase >= 4 && !interacted;

  function screenStyle(id: ScreenId) {
    const idx = stack.indexOf(id);
    const isActive = id === current;
    if (isActive) return {transform: "translateX(0)", opacity: 1};
    if (idx >= 0) return {transform: "translateX(-30%)", opacity: 0.4};
    return {transform: "translateX(100%)", opacity: 1};
  }

  return (
    <section
      ref={sectionRef}
      id="ac-sec-flow"
      data-ac-section
      className="relative z-10 w-full border-t border-[rgba(192,132,252,0.1)]"
    >
      <div className="mx-auto flex max-w-[1140px] flex-col px-6 py-[120px]">
        <header className="mb-12">
          <Kicker>03 · 사용자 흐름</Kicker>
          <RevealWords
            text="동아리를 고르는 일은 한 화면에서 끝나지 않는다"
            className="mb-5 mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-[40px]"
          />
          <p
            className="max-w-2xl text-[17px] leading-8 text-[rgba(255,255,255,0.88)] transition-all duration-700 ease-out"
            style={{opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(16px)"}}
          >
            둘러보고, 마음에 드는 걸 열어보고, 모집 공고를 확인하고, 지원한다. 네 단계 중 어디서든 나갔다가 다시 들어올
            수 있어야 했다. 아래에서 <strong className="font-bold text-[#d8b4fe]">직접 걸어가 보세요</strong>.
          </p>
        </header>

        <div className="relative flex flex-col items-center gap-5 lg:flex-row lg:items-stretch lg:gap-8">
          {/* ── 기기 ── */}
          <section className="flex w-full flex-col items-center lg:w-[52%]">
            <div
              className="mb-4 flex items-center gap-3 font-mono text-[11px] transition-opacity duration-500"
              style={{opacity: phase >= 2 ? 1 : 0}}
            >
              {(["loggedOut", "loggedIn"] as const).map((state, i) => (
                <span key={state} className="flex items-center gap-3">
                  {i === 1 ? <span className="text-[rgba(255,255,255,0.46)]">|</span> : null}
                  <button
                    type="button"
                    onClick={() => setAuth(state)}
                    className={`rounded px-3 py-1.5 outline-none transition-colors ${
                      auth === state
                        ? "border border-[#c084fc] bg-[#170f26] text-[#c084fc]"
                        : "border border-transparent bg-transparent text-[rgba(255,255,255,0.46)] hover:text-white"
                    }`}
                  >
                    {state === "loggedOut" ? "로그아웃 상태" : "로그인 상태"}
                  </button>
                </span>
              ))}
            </div>

            <div
              className="relative h-[520px] w-[92vw] max-w-[340px] shrink-0 overflow-hidden rounded-[2rem] border-[8px] border-[#1c1329] bg-[#0f0a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] transition-all duration-[600ms] ease-out sm:h-[560px] sm:w-[340px]"
              style={{opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "none" : "translateY(20px)"}}
            >
              <div className="absolute left-1/2 top-0 z-[60] h-[24px] w-[120px] -translate-x-1/2 rounded-b-2xl bg-[#1c1329]" />

              <div className="absolute left-0 top-0 z-[50] flex h-[34px] w-full items-center border-b border-white/5 bg-[#0f0a1a]/90 px-4 pt-2 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="뒤로가기"
                  className="flex h-6 w-6 items-center justify-center text-[rgba(255,255,255,0.88)] outline-none transition-opacity"
                  style={{opacity: stack.length > 1 ? 1 : 0, pointerEvents: stack.length > 1 ? "auto" : "none"}}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h3 className="flex-1 pr-6 text-center text-[13px] font-bold text-[rgba(255,255,255,0.88)] transition-all duration-300">
                  {data.title}
                </h3>
              </div>

              <div className="isolate relative h-full w-full overflow-hidden bg-[#0d0816] pt-[34px]">
                {/* 목록 */}
                <ScreenBox id="scr-1" style={screenStyle("scr-1")} className="ac-no-scrollbar overflow-y-auto p-4 pb-8">
                  <div className="ac-no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
                    {["전체", "예술", "학술", "운동"].map((t, i) => (
                      <span
                        key={t}
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${
                          i === 0
                            ? "border border-[#c084fc]/30 bg-[#c084fc]/20 font-bold text-[#c084fc]"
                            : "border border-white/10 bg-white/5 text-[rgba(255,255,255,0.46)]"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {MOCK_CLUBS.map((c, i) => {
                      const col = CATEGORY_COLORS[c.cat];
                      const isFirst = i === 0;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={isFirst ? () => navigate("scr-2") : undefined}
                          className={`flex w-full flex-col gap-2 rounded-xl border border-white/5 bg-[#170f26] p-3 text-left outline-none transition-colors ${
                            isFirst ? `hover:bg-white/5 ${showHint ? "ac-pulse-purple" : ""}` : "cursor-default"
                          }`}
                        >
                          <span className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded bg-white/5">
                            <span className="font-mono text-[10px] text-[rgba(255,255,255,0.25)]">[IMG]</span>
                            <span
                              className="absolute left-1.5 top-1.5 rounded border border-white/10 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm"
                              style={{color: col, background: `${col}33`}}
                            >
                              {c.cat}
                            </span>
                          </span>
                          <span className="truncate text-[13px] font-bold text-[rgba(255,255,255,0.88)]">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </ScreenBox>

                {/* 상세 */}
                <ScreenBox id="scr-2" style={screenStyle("scr-2")} className="ac-no-scrollbar overflow-y-auto">
                  <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-[#170f26]">
                    <div className="absolute left-3 top-3 rounded border border-[#f472b6]/30 bg-[#f472b6]/20 px-2 py-0.5 text-[10px] font-bold text-[#f472b6] backdrop-blur-md">
                      예술
                    </div>
                    <span className="font-mono text-xs text-[rgba(255,255,255,0.46)]">[IMG-SLOT]</span>
                  </div>
                  <div className="flex flex-col gap-4 p-5">
                    <div>
                      <h1 className="mb-1 text-xl font-black text-[rgba(255,255,255,0.88)]">빛그림 사진회</h1>
                      <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.46)]">
                        카메라 렌즈 너머로 세상을 바라보고, 찰나의 순간을 영원으로 기록하는 사람들의 모임입니다. 필름부터
                        디지털까지 장비 무관.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 rounded-lg border border-white/5 bg-[#170f26] p-4 text-[13px]">
                      {[
                        ["활동 요일", "매주 목요일 19시"],
                        ["모집 인원", "10명"],
                        ["회비", "학기당 30,000원"],
                      ].map(([k, v], i) => (
                        <div key={k} className="flex flex-col gap-3">
                          {i > 0 ? <div className="h-[1px] w-full bg-white/5" /> : null}
                          <div className="flex justify-between">
                            <span className="text-[rgba(255,255,255,0.46)]">{k}</span>
                            <span className="font-medium tabular-nums text-[rgba(255,255,255,0.88)]">{v}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("scr-3")}
                      className="mt-2 w-full rounded-xl bg-[#c084fc] py-3.5 text-[15px] font-bold text-[#0d0816] outline-none transition-colors hover:bg-[#d8b4fe]"
                    >
                      모집 공고 보기
                    </button>
                  </div>
                </ScreenBox>

                {/* 모집 공고 */}
                <ScreenBox id="scr-3" style={screenStyle("scr-3")} className="ac-no-scrollbar overflow-y-auto">
                  <div className="flex items-center justify-center gap-2 border-b border-[#fbbf24]/20 bg-[#fbbf24]/[0.14] p-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#fbbf24]" />
                    <span className="font-mono text-[12px] font-bold tracking-wide text-[#fbbf24]">
                      마감 D-6 · 3월 18일까지
                    </span>
                  </div>
                  <div className="flex flex-col gap-6 p-5 pb-24">
                    <div>
                      <h2 className="mb-3 text-[15px] font-bold text-[rgba(255,255,255,0.88)]">지원 자격</h2>
                      <ul className="ml-1 list-inside list-disc space-y-2 text-sm text-[rgba(255,255,255,0.46)]">
                        <li>사진에 관심이 있는 재학생 누구나</li>
                        <li>카메라 기종 제한 없음 (스마트폰 가능)</li>
                        <li>목요일 정기 모임 참석 가능자</li>
                      </ul>
                    </div>
                    <div>
                      <h2 className="mb-3 text-[15px] font-bold text-[rgba(255,255,255,0.88)]">모집 일정</h2>
                      <div className="relative space-y-4 border-l border-white/10 pl-4 text-[13px]">
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0816] bg-[#c084fc]" />
                          <p className="font-bold text-[rgba(255,255,255,0.88)]">서류 접수</p>
                          <p className="mt-0.5 text-[12px] tabular-nums text-[rgba(255,255,255,0.46)]">3/4(월) ~ 3/18(월)</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0816] bg-white/20" />
                          <p className="font-bold text-[rgba(255,255,255,0.46)]">대면 면접</p>
                          <p className="mt-0.5 text-[12px] tabular-nums text-[rgba(255,255,255,0.28)]">3/20(수) ~ 3/21(목)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0d0816] via-[#0d0816] to-transparent p-4 pb-6">
                    <button
                      type="button"
                      onClick={() => navigate("scr-4")}
                      className="w-full rounded-xl bg-[#c084fc] py-3.5 text-[15px] font-bold text-[#0d0816] shadow-[0_4px_20px_rgba(192,132,252,0.3)] outline-none transition-colors hover:bg-[#d8b4fe]"
                    >
                      지원하기
                    </button>
                  </div>
                </ScreenBox>

                {/* 지원 */}
                <ScreenBox id="scr-4" style={screenStyle("scr-4")} className="ac-no-scrollbar overflow-y-auto">
                  <form
                    className="flex flex-col gap-5 p-5 pb-24"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <div className="mb-2 rounded-lg border border-white/5 bg-[#170f26] p-4">
                      <h4 className="mb-1 text-sm font-bold text-[rgba(255,255,255,0.88)]">빛그림 사진회 지원서</h4>
                      <p className="text-[12px] text-[#fbbf24]">이 양식은 시연용으로, 실제 데이터가 전송되지 않습니다.</p>
                    </div>
                    <label className="flex flex-col gap-1.5">
                      <span className="ml-1 text-[13px] font-bold text-[rgba(255,255,255,0.88)]">지원 동기</span>
                      <textarea
                        className="h-24 w-full resize-none rounded-lg border border-white/10 bg-[#170f26] p-3 text-sm text-[rgba(255,255,255,0.88)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.25)] focus:border-[#c084fc]/50"
                        placeholder="간단히 적어주세요..."
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="ml-1 text-[13px] font-bold text-[rgba(255,255,255,0.88)]">활동 가능 요일</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-white/10 bg-[#170f26] p-3 text-sm text-[rgba(255,255,255,0.88)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.25)] focus:border-[#c084fc]/50"
                        placeholder="예: 평일 저녁, 주말"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="ml-1 text-[13px] font-bold text-[rgba(255,255,255,0.88)]">연락 방법</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-white/10 bg-[#170f26] p-3 text-sm text-[rgba(255,255,255,0.88)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.25)] focus:border-[#c084fc]/50"
                        placeholder="가상의 아이디나 번호"
                      />
                    </label>
                    <button
                      type="submit"
                      className="mt-4 w-full rounded-xl bg-[#c084fc] py-3.5 text-[15px] font-bold text-[#0d0816] outline-none transition-colors hover:bg-[#d8b4fe]"
                    >
                      제출
                    </button>
                  </form>
                </ScreenBox>

                {/* 로그인 */}
                <ScreenBox id="scr-login" style={screenStyle("scr-login")} className="flex flex-col justify-center px-6">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#170f26]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h1 className="mb-2 text-xl font-black text-[rgba(255,255,255,0.88)]">로그인이 필요합니다</h1>
                    <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.46)]">
                      지원서를 작성하려면
                      <br />
                      먼저 로그인해야 합니다.
                    </p>
                  </div>
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                  >
                    <span className="sr-only">시연용 화면이며 입력을 받지 않습니다.</span>
                    <input
                      type="email"
                      value="user@fictional.univ.ac.kr"
                      disabled
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-[#170f26] p-3 text-sm text-[rgba(255,255,255,0.46)]"
                    />
                    <input
                      type="password"
                      value="********"
                      disabled
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-[#170f26] p-3 text-sm tracking-widest text-[rgba(255,255,255,0.46)]"
                    />
                    <button
                      type="submit"
                      className="mt-2 w-full rounded-xl border border-white/5 bg-white/10 py-3.5 text-[15px] font-bold text-[rgba(255,255,255,0.88)] outline-none transition-colors hover:bg-white/20"
                    >
                      로그인
                    </button>
                  </form>
                </ScreenBox>

                {/* 토스트 */}
                <div
                  className="pointer-events-none absolute left-1/2 top-4 z-[100] flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full border border-[#c084fc]/30 bg-[#170f26]/95 px-4 py-2 text-[11px] text-[rgba(255,255,255,0.88)] shadow-lg backdrop-blur transition-all duration-300"
                  style={{
                    opacity: toast ? 1 : 0,
                    transform: toast ? "translate(-50%, 0)" : "translate(-50%, -48px)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{toast ?? ""}</span>
                </div>
              </div>

              <div
                className="pointer-events-none absolute bottom-6 left-1/2 z-[70] w-max -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 font-mono text-[10px] text-[rgba(255,255,255,0.35)] backdrop-blur transition-opacity duration-300"
                style={{opacity: showHint ? 1 : 0}}
              >
                동아리를 하나 눌러보세요
              </div>
            </div>

            <div
              className="mt-4 font-mono text-[11px] tracking-wide tabular-nums text-[rgba(255,255,255,0.46)] transition-opacity duration-500"
              style={{opacity: phase >= 2 ? 1 : 0}}
              aria-live="polite"
            >
              {data.step} · {data.title}
            </div>
          </section>

          {/* ── 라우트 지도 + 코드 ── */}
          <section className="mt-8 flex w-full flex-col gap-5 sm:flex-row lg:mt-0 lg:w-[48%] lg:flex-col lg:gap-6 lg:pt-10">
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border border-[rgba(192,132,252,0.18)] bg-[#170f26] p-4 transition-all duration-[600ms] ease-out lg:h-[300px]"
              style={{opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "none" : "translateY(20px)"}}
            >
              <div className="relative h-[244px] w-[320px] shrink-0">
                <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <marker id="ac-arrow-return" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#4ade80" />
                    </marker>
                  </defs>
                  <path d="M75,44 L75,60 M75,104 L75,120 M75,164 L75,180" stroke="rgba(192,132,252,0.18)" strokeWidth="2" />
                  <path d="M150,202 L190,202" stroke="rgba(192,132,252,0.18)" strokeWidth="2" strokeDasharray="3,3" />
                  <path
                    d="M265,180 Q215,90 75,180"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    markerEnd="url(#ac-arrow-return)"
                  />
                </svg>

                {(Object.keys(NODES) as ScreenId[]).map((id) => {
                  const n = NODES[id];
                  const active = id === current;
                  const seen = visited.has(id);
                  return (
                    <div
                      key={id}
                      className={`absolute flex h-[44px] items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-300 ${
                        id === "scr-login" || id === "scr-4" ? "flex-col" : ""
                      } ${id === "scr-login" ? "border-dashed" : ""}`}
                      style={{
                        top: n.top,
                        left: n.left,
                        width: n.width,
                        border: `1px solid ${active ? "#c084fc" : seen ? "rgba(192,132,252,0.5)" : "rgba(192,132,252,0.18)"}`,
                        background: active ? "rgba(192,132,252,0.12)" : "transparent",
                        color: active ? "#fff" : seen ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.46)",
                      }}
                    >
                      <span className="font-mono text-[11px] leading-tight">{SCREENS[id].path}</span>
                      {id === "scr-4" ? (
                        <span className="mt-0.5 flex items-center gap-1 font-mono text-[9px] text-[#fbbf24]">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          보호 라우트
                        </span>
                      ) : null}
                      {id === "scr-login" ? (
                        <span className="absolute -top-[24px] font-mono text-[9px] text-[#4ade80]">원위치 복귀</span>
                      ) : null}
                    </div>
                  );
                })}

                <div
                  className="pointer-events-none absolute z-10 h-[44px] rounded-md border-2 border-[#c084fc] shadow-[0_0_12px_rgba(192,132,252,0.4)] transition-transform duration-[350ms]"
                  style={{
                    width: marker.width,
                    transform: `translate(${marker.left}px, ${marker.top}px)`,
                    transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </div>
            </div>

            <div
              className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] transition-all duration-[600ms] ease-out lg:h-[250px]"
              style={{opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? "none" : "translateY(20px)"}}
            >
              <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[rgba(192,132,252,0.18)] bg-[#170f26]/30 px-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  ))}
                </div>
                <span className="ml-2 font-mono text-[11px] text-[rgba(255,255,255,0.46)]">routes.tsx</span>
              </div>
              <div className="ac-scroll-thin relative flex-1 overflow-x-auto overflow-y-hidden py-2 font-mono text-[11px] leading-relaxed sm:text-[12px]">
                {ROUTE_LINES.map((line) => {
                  const active = data.lines.includes(line.no);
                  return (
                    <div
                      key={line.no}
                      className="flex whitespace-pre border-l-2 px-4 py-0.5 transition-colors duration-[250ms]"
                      style={{
                        borderLeftColor: active ? "#c084fc" : "transparent",
                        background: active ? "rgba(192,132,252,0.14)" : "transparent",
                      }}
                    >
                      <span className="w-6 select-none pr-4 text-right tabular-nums text-[rgba(255,255,255,0.2)]">
                        {line.no}
                      </span>
                      <span className="text-[rgba(255,255,255,0.88)]">{line.body}</span>
                    </div>
                  );
                })}
                <div className="mt-2 whitespace-nowrap px-4">
                  <span className="text-[10px] opacity-80 sm:text-[11px]" style={{color: "#7a5f8a"}}>
                    {"// 어디로 가려 했는지를 같이 넘기지 않으면, 로그인 후에 홈으로 떨어진다"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Reveal className="mt-[44px] max-w-3xl rounded-md border border-[rgba(192,132,252,0.18)] border-l-[3px] border-l-[#c084fc] bg-[rgba(192,132,252,0.04)] p-[22px]">
          <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c084fc]">
            왜 모달이 아니라 라우트인가
          </h4>
          <p className="text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
            처음엔 동아리 상세를 모달로 띄웠다. 구현이 훨씬 간단했다. 그런데{" "}
            <strong className="font-bold text-[#d8b4fe]">모달은 주소가 없다.</strong> 링크로 보낼 수도 없고, 뒤로가기로
            닫을 수도 없고, 새로고침하면 사라진다. 앞 장에서 겪은 문제가 여기서도 똑같이 나온다는 걸 알고 전부 라우트로
            바꿨다.
          </p>
        </Reveal>

        <Reveal className="mt-[36px] flex w-full flex-col gap-[14px] md:flex-row lg:max-w-4xl">
          {[
            {slot: "[IMG-02] · 9:16", caption: "실제 상세 화면"},
            {slot: "[IMG-03] · 9:16", caption: "실제 모집 공고 화면"},
          ].map((f) => (
            <figure key={f.slot} className="flex flex-1 flex-col">
              <div className="ac-dot-grid flex w-full items-center justify-center overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] shadow-sm max-md:aspect-video md:aspect-[9/16]">
                <span className="font-mono text-[12px] tracking-widest text-[rgba(255,255,255,0.46)]">{f.slot}</span>
              </div>
              <figcaption className="mt-3 text-center text-[13px] text-[rgba(255,255,255,0.46)]">{f.caption}</figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function ScreenBox({
  id,
  style,
  className = "",
  children,
}: {
  id: ScreenId;
  style: {transform: string; opacity: number};
  className?: string;
  children: ReactNode;
}) {
  const isActive = style.transform === "translateX(0)";
  return (
    <div
      id={`ac-${id}`}
      className={`absolute inset-0 bg-[#0d0816] transition-all duration-[350ms] ${className}`}
      style={{
        ...style,
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        zIndex: isActive ? 20 : 1,
        pointerEvents: isActive ? "auto" : "none",
      }}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}
