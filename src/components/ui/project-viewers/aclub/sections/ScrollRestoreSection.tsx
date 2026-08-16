"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAClub} from "../context";
import {SCROLL_CLUBS} from "../data";
import {
  CodeWindow,
  HlLine,
  Kicker,
  Kw,
  MetricCell,
  NoteBox,
  Num,
  Reveal,
  RevealWords,
  Str,
  useInViewOnce
} from "../parts";

type Mode = "before" | "after";

export function ScrollRestoreSection() {
  const {reducedMotion, announce} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({
    threshold: 0.1
  });

  const [mode, setMode] = useState<Mode>("before");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [readout, setReadout] = useState("스크롤 0px · 1번째");
  const [ghost, setGhost] = useState({
    text: "직전 위치: 0px · 1번째",
    visible: false
  });
  const [marker, setMarker] = useState<{
    text: string;
    tone: "error" | "success";
  } | null>(null);
  const [bugVisible, setBugVisible] = useState(false);
  const [bugMessage, setBugMessage] =
    useState("아까 20번째를 보고 계셨습니다.");
  const [flash, setFlash] = useState(false);
  const [hintOn, setHintOn] = useState(true);
  const [highlight, setHighlight] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const savedTop = useRef(0);
  const lastClicked = useRef(-1);
  const hasScrolled = useRef(false);
  const ticking = useRef(false);
  const timers = useRef<number[]>([]);
  const rowHeight = useRef(84);

  useEffect(() => {
    rowHeight.current = window.innerWidth < 720 ? 76 : 84;
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(t => window.clearTimeout(t));
    },
    []
  );

  const updateReadout = useCallback((top: number) => {
    const index = Math.max(
      1,
      Math.min(SCROLL_CLUBS.length, Math.floor(top / rowHeight.current) + 1)
    );
    setReadout(`스크롤 ${Math.floor(top)}px · ${index}번째`);
  }, []);

  function onScroll() {
    hasScrolled.current = true;
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      updateReadout(listRef.current?.scrollTop ?? 0);
      ticking.current = false;
    });
  }

  // 처음 보이면 목록을 살짝 내렸다 올려서 "스크롤되는 상자"임을 알린다.
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const t = window.setTimeout(() => {
      const el = listRef.current;
      if (!el || hasScrolled.current) return;
      const target = window.innerWidth < 720 ? 152 : 168;
      let start = 0;
      const down = (now: number) => {
        if (hasScrolled.current) return;
        if (!start) start = now;
        const p = Math.min((now - start) / 800, 1);
        const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
        el.scrollTop = ease * target;
        if (p < 1) requestAnimationFrame(down);
        else {
          timers.current.push(
            window.setTimeout(() => {
              let up = 0;
              const back = (t2: number) => {
                if (hasScrolled.current) return;
                if (!up) up = t2;
                const p2 = Math.min((t2 - up) / 500, 1);
                const e2 = p2 < 0.5 ? 2 * p2 * p2 : 1 - (-2 * p2 + 2) ** 2 / 2;
                el.scrollTop = target - e2 * target;
                if (p2 < 1) requestAnimationFrame(back);
              };
              requestAnimationFrame(back);
            }, 400)
          );
        }
      };
      requestAnimationFrame(down);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [inView, reducedMotion]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    if (listRef.current) listRef.current.scrollTop = 0;
    savedTop.current = 0;
    lastClicked.current = -1;
    setOpenIndex(null);
    setBugVisible(false);
    setMarker(null);
    setGhost(g => ({...g, visible: false}));
    updateReadout(0);
  }

  function openDetail(index: number) {
    setHintOn(false);
    savedTop.current = listRef.current?.scrollTop ?? 0;
    lastClicked.current = index;
    setOpenIndex(index);
    setGhost({
      text: `직전 위치: ${Math.round(savedTop.current)}px · ${index + 1}번째`,
      visible: false
    });
  }

  function closeDetail() {
    setOpenIndex(null);
    const el = listRef.current;

    if (mode === "before") {
      // 저장한 위치가 아예 없으니 맨 위로 튄다.
      if (el) el.scrollTop = 0;
      updateReadout(0);
      setFlash(true);
      timers.current.push(window.setTimeout(() => setFlash(false), 620));
      setMarker({text: "← 여기로 튐", tone: "error"});
      setBugMessage(`아까 ${lastClicked.current + 1}번째를 보고 계셨습니다.`);
      timers.current.push(window.setTimeout(() => setBugVisible(true), 400));
      timers.current.push(window.setTimeout(() => setBugVisible(false), 3900));
      timers.current.push(window.setTimeout(() => setMarker(null), 2800));
      announce("수정 전 모드: 목록 맨 위로 이동했습니다.");
      return;
    }

    if (el) el.scrollTop = savedTop.current;
    updateReadout(savedTop.current);
    setGhost(g => ({...g, visible: true}));
    timers.current.push(
      window.setTimeout(() => setGhost(g => ({...g, visible: false})), 2000)
    );
    setMarker({text: "← 원래 자리", tone: "success"});
    timers.current.push(window.setTimeout(() => setMarker(null), 2800));
    // 위치만 맞추는 게 아니라 "아까 그거 여기 있어요"까지 알려준다.
    setHighlight(lastClicked.current);
    timers.current.push(window.setTimeout(() => setHighlight(null), 1300));
    announce("수정 후 모드: 이전에 보던 위치로 돌아왔습니다.");
  }

  const detailClub = openIndex !== null ? SCROLL_CLUBS[openIndex] : null;

  return (
    <section
      ref={sectionRef}
      id="ac-sec-scroll"
      data-ac-section
      className="relative z-10 w-full border-t border-[rgba(192,132,252,0.1)]"
    >
      <div className="mx-auto flex max-w-[1020px] flex-col px-6 py-[120px]">
        <div className="mb-6">
          <Kicker tone="bad">04 · 트러블슈팅 02</Kicker>
          <RevealWords
            text="스무 번째 동아리를 보고 나오면 다시 첫 번째였다"
            className="mt-4 text-[30px] font-black leading-tight text-[rgba(255,255,255,0.88)]"
          />
        </div>

        <Reveal className="mt-6">
          <NoteBox label="증상" tone="bad">
            <p className="text-[16px] leading-8 text-[rgba(255,255,255,0.88)]">
              목록을 한참 내려서 마음에 드는 동아리를 열어봤다가, 아니다 싶어
              뒤로 나오면 목록 맨 위였다. 다시 스무 번을 스크롤해야 아까 그
              자리였다.
              <br />
              버그 리포트로는 안 올라오는데, 쓰다 보면 지치는 종류의 문제였다.
            </p>
          </NoteBox>
        </Reveal>

        {/* ── 스크롤 복원 시뮬레이터 ── */}
        <div className="relative mt-9 w-full">
          <div className="mb-2 flex justify-end gap-2 font-mono text-[11px]">
            {(["before", "after"] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded px-2 py-1 outline-none transition-colors ${
                  mode === m
                    ? "bg-[rgba(192,132,252,0.14)] text-[#c084fc]"
                    : "text-[rgba(255,255,255,0.46)] hover:text-white"
                }`}
              >
                {m === "before" ? "수정 전" : "수정 후"}
              </button>
            ))}
          </div>

          <p
            className="mb-2 font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity duration-300"
            style={{opacity: hintOn ? 1 : 0}}
          >
            목록을 한참 내린 다음, 동아리를 하나 열었다가 돌아와 보세요
          </p>

          <div className="relative h-[460px] w-full overflow-hidden rounded-lg border border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] shadow-2xl sm:h-[520px]">
            <div className="relative z-30 flex h-[36px] shrink-0 items-center justify-between border-b border-[rgba(192,132,252,0.14)] bg-[#170f26] px-4">
              <span className="select-none font-mono text-[11px] text-[rgba(255,255,255,0.72)]">
                동아리 목록
              </span>
              <span
                className={`select-none font-mono text-[11px] tabular-nums transition-colors ${
                  flash ? "ac-flash-text" : "text-[rgba(255,255,255,0.46)]"
                }`}
                aria-live="polite"
              >
                {readout}
              </span>
            </div>

            <div
              className="pointer-events-none absolute right-4 top-[36px] z-20 rounded bg-[rgba(15,10,26,0.9)] px-2 py-1 font-mono text-[10px] tabular-nums text-[rgba(255,255,255,0.40)] transition-opacity duration-300"
              style={{opacity: ghost.visible ? 1 : 0}}
            >
              {ghost.text}
            </div>

            <div className="relative h-[calc(100%-36px)] w-full overflow-hidden">
              <div
                ref={listRef}
                onScroll={onScroll}
                className="ac-scroll-thin absolute inset-0 z-10 h-full w-full overflow-y-auto bg-[#0d0816]"
                style={{overflow: openIndex !== null ? "hidden" : undefined}}
              >
                <div className="flex w-full flex-col">
                  {SCROLL_CLUBS.map((club, i) => (
                    <button
                      key={club.name}
                      type="button"
                      onClick={() => openDetail(i)}
                      aria-label={`${club.name} 상세 보기`}
                      className={`flex h-[76px] w-full items-center justify-between border-b border-white/5 bg-transparent px-4 py-3.5 text-left outline-none transition-colors hover:bg-white/5 sm:h-[84px] ${
                        highlight === i ? "ac-row-highlight" : ""
                      }`}
                    >
                      <span className="flex w-full items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/5 bg-[#170f26] sm:h-14 sm:w-14">
                          <span className="font-mono text-[10px] text-[rgba(255,255,255,0.3)] sm:text-[11px]">
                            IMG
                          </span>
                        </span>
                        <span className="flex flex-col gap-1 overflow-hidden">
                          <span className="truncate text-[13px] font-black leading-none text-[rgba(255,255,255,0.88)] sm:text-[14px]">
                            {club.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-[rgba(255,255,255,0.46)]">
                              {club.cat}
                            </span>
                            <span className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-[rgba(255,255,255,0.46)]">
                              D-{(i % 7) + 1}
                            </span>
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-4 pl-2">
                        <span className="select-none font-mono text-[18px] font-bold tabular-nums text-[rgba(255,255,255,0.1)] sm:text-[22px]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-[rgba(255,255,255,0.46)]"
                          aria-hidden="true"
                        >
                          <path
                            d="M9 18l6-6-6-6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="ac-scroll-thin absolute inset-0 z-20 h-full w-full overflow-y-auto bg-[#0d0816] transition-transform duration-300"
                style={{
                  transform:
                    openIndex !== null ? "translateX(0)" : "translateX(100%)"
                }}
                aria-hidden={openIndex === null}
              >
                <div className="sticky top-0 z-10 flex items-center border-b border-white/5 bg-[#0d0816]/90 px-4 py-3 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="rounded px-2 py-1 font-mono text-[12px] text-[rgba(255,255,255,0.88)] outline-none transition-colors hover:text-white"
                  >
                    ← 목록으로
                  </button>
                </div>
                <div className="flex flex-col gap-5 p-5">
                  <div className="flex h-[130px] w-full items-center justify-center rounded-md border border-white/5 bg-[#170f26]">
                    <span className="font-mono text-[11px] text-[rgba(255,255,255,0.3)]">
                      [IMG-SLOT]
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[rgba(255,255,255,0.88)]">
                    {detailClub?.name}
                  </h3>
                  <p className="text-[14px] leading-7 text-[rgba(255,255,255,0.6)]">
                    이 동아리는 매주 정기적으로 모임을 가지며, 다양한 활동을
                    통해 회원들의 성장을 도모합니다. 신입 회원이라도 누구나 쉽게
                    참여할 수 있는 분위기를 지향합니다.
                  </p>
                  <p className="text-[14px] leading-7 text-[rgba(255,255,255,0.6)]">
                    학기 중에는 주 1회 정기 모임을 필수로 참여해야 하며, 방학
                    중에는 자율 참여로 전환됩니다. 회비는 학기당 20,000원이며,
                    첫 학기는 면제됩니다.
                  </p>
                </div>
              </div>

              <div
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[rgba(13,8,22,0.85)] p-6 backdrop-blur-sm transition-opacity duration-500"
                style={{
                  opacity: bugVisible ? 1 : 0,
                  pointerEvents: bugVisible ? "auto" : "none"
                }}
                aria-hidden={!bugVisible}
              >
                <div className="max-w-[420px] text-center">
                  <p className="text-[17px] leading-9 tabular-nums text-[rgba(255,255,255,0.88)]">
                    {bugMessage}
                  </p>
                  <p className="mt-2 text-[17px] font-bold leading-9 text-[#f87171]">
                    돌아오니 1번째입니다.
                  </p>
                </div>
              </div>

              {marker ? (
                <div
                  className="pointer-events-none absolute right-4 top-[8px] z-30 rounded border px-2 py-1 font-mono text-[10px] tabular-nums transition-opacity duration-300"
                  style={{
                    background:
                      marker.tone === "error"
                        ? "rgba(248,113,113,0.15)"
                        : "rgba(74,222,128,0.15)",
                    borderColor:
                      marker.tone === "error"
                        ? "rgba(248,113,113,0.3)"
                        : "rgba(74,222,128,0.3)",
                    color: marker.tone === "error" ? "#f87171" : "#4ade80"
                  }}
                >
                  {marker.text}
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-3 text-center font-mono text-[9px] text-[rgba(255,255,255,0.32)]">
            이 스크롤은 이 상자 안에서만 일어납니다 · 재현용 시뮬레이터
          </p>
        </div>

        <Reveal className="mt-11 rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] p-5">
          <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[rgba(255,255,255,0.46)]">
            먼저 시도했다가 실패한 것
          </div>
          <p className="text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
            목록으로 돌아올 때 저장해둔 위치로 스크롤하도록 먼저 고쳤다. 그런데
            여전히 맨 위였다.{" "}
            <strong className="font-bold text-[#fbbf24]">
              리스트가 그려지기 전에 실행돼서
            </strong>
            , 높이가 0인 요소를 1,640px 지점으로 스크롤하려 한 것이었다. 그러고
            나서 리스트가 그려지니 다시 0이 됐다.
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <NoteBox label="원인" tone="warn">
            <p className="text-[16px] leading-8 text-[rgba(255,255,255,0.88)]">
              문제는 두 겹이었다. 첫째, 위치를 저장하는 곳이 없었다. 둘째,
              저장해도{" "}
              <strong className="font-bold text-[#fbbf24]">
                복원 시점이 틀렸다.
              </strong>{" "}
              스크롤은 「그릴 것이 다 그려진 다음」에만 의미가 있는데,
              컴포넌트가 마운트되는 시점은 아직 그려지기 전이다.
            </p>
          </NoteBox>
        </Reveal>

        <Reveal className="mt-10">
          <CodeWindow
            file="useScrollRestore.ts"
            footer={"// 저장은 쉬웠다. 어려운 건 「언제 복원할지」였다."}
          >
            <HlLine>
              <Kw>const</Kw> savedOffsets = <Kw>new</Kw> <Kw>Map</Kw>&lt;
              <Kw>string</Kw>, <Kw>number</Kw>&gt;();{" "}
              <span style={{color: "#7a5f8a"}}>
                {"// 모듈 레벨 — 언마운트 후에도 살아 있다"}
              </span>
            </HlLine>
            <Kw>export function</Kw>
            {" useScrollRestore(routeKey: "}
            <Kw>string</Kw>
            {") {\n  "}
            <Kw>const</Kw>
            {" ref = useRef<HTMLDivElement>("}
            <Kw>null</Kw>
            {");\n  "}
            <Kw>const</Kw>
            {" rafRef = useRef<"}
            <Kw>number</Kw>
            {">("}
            <Num>0</Num>
            {");\n\n  "}
            <span style={{color: "#7a5f8a"}}>
              {"// 1. 스크롤할 때마다 저장 (프레임당 1회)"}
            </span>
            {"\n  useEffect(() => {\n    "}
            <Kw>const</Kw>
            {" el = ref.current;\n    "}
            <Kw>if</Kw>
            {" (!el) "}
            <Kw>return</Kw>
            {";\n    "}
            <Kw>let</Kw>
            {" ticking = "}
            <Kw>false</Kw>
            {";\n    "}
            <Kw>const</Kw>
            {" onScroll = () => {\n      "}
            <Kw>if</Kw>
            {
              " (!ticking) {\n        requestAnimationFrame(() => {\n          savedOffsets."
            }
            <Kw>set</Kw>
            {"(routeKey, el.scrollTop);\n          ticking = "}
            <Kw>false</Kw>
            {";\n        });\n        ticking = "}
            <Kw>true</Kw>
            {";\n      }\n    };\n    el.addEventListener("}
            <Str>&apos;scroll&apos;</Str>
            {", onScroll);\n    "}
            <Kw>return</Kw>
            {" () => el.removeEventListener("}
            <Str>&apos;scroll&apos;</Str>
            {", onScroll);\n  }, [routeKey]);\n\n  "}
            <span style={{color: "#7a5f8a"}}>
              {"// 2. 마운트 후 복원 — 레이아웃 완료까지 대기"}
            </span>
            {"\n  useEffect(() => {\n    "}
            <Kw>const</Kw>
            {" el = ref.current;\n    "}
            <Kw>if</Kw>
            {" (!el) "}
            <Kw>return</Kw>
            {";\n    "}
            <Kw>const</Kw>
            {" target = savedOffsets.get(routeKey) ?? "}
            <Num>0</Num>
            {";\n    "}
            <Kw>let</Kw>
            {" retries = "}
            <Num>0</Num>
            {";\n\n    "}
            <Kw>const</Kw>
            {" tryRestore = () => {\n"}
            <HlLine>
              {"      "}
              <Kw>if</Kw>
              {" (el.scrollHeight >= target + el.clientHeight) {"}
            </HlLine>
            {"        el.scrollTop = target;\n      } "}
            <Kw>else if</Kw>
            {" (retries < "}
            <Num>60</Num>
            {
              ") {\n        retries++;\n        rafRef.current = requestAnimationFrame(tryRestore);\n      }\n    };\n\n    rafRef.current = requestAnimationFrame(tryRestore);\n    "
            }
            <Kw>return</Kw>
            {
              " () => cancelAnimationFrame(rafRef.current);\n  }, [routeKey]);\n\n  "
            }
            <Kw>return</Kw>
            {" ref;\n}"}
          </CodeWindow>
        </Reveal>

        <Reveal className="mt-5 max-w-[800px]">
          <p className="text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
            돌아왔을 때 아까 눌렀던 항목을 1.2초 동안 살짝 밝게 표시하는 것도
            같이 넣었다. 위치만 맞으면 되는 게 아니라,{" "}
            <strong className="font-bold text-[#d8b4fe]">
              「아까 그거 여기 있어요」까지
            </strong>{" "}
            알려줘야 사용자가 다시 헤매지 않는다.
          </p>
        </Reveal>

        <Reveal className="mt-7 w-full">
          <div className="ac-media-grid flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)]">
            <span className="font-mono text-[12px] text-[rgba(255,255,255,0.3)]">
              [IMG-04] · 21:9 · 복원 직후 목록 캡처
            </span>
          </div>
          <p className="mt-3 px-3 py-1 font-mono text-[11px] text-[rgba(255,255,255,0.48)]">
            실제 화면 · 목록으로 돌아온 직후 (직전에 본 항목이 강조됨)
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="flex w-full flex-col gap-[12px] sm:flex-row">
            <MetricCell value="±0px" label="복원 후 위치 오차" />
            <MetricCell value="24개" label="테스트한 항목 수" />
            <MetricCell value="3곳" label="같은 훅을 적용한 목록 화면" />
          </div>
          <p className="mt-3 font-mono text-[10px] text-[rgba(255,255,255,0.32)]">
            직접 스크롤해가며 확인했습니다. 자동화된 테스트는 없습니다.
          </p>
        </Reveal>

        <Reveal className="mt-7 rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] p-5">
          <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[rgba(255,255,255,0.46)]">
            아직 남은 것
          </div>
          <ul className="space-y-1 text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
            <li>
              · 목록 항목 수가 바뀌면(조건을 바꾸고 돌아오면) 위치가 어긋난다.
              그때는 맨 위로 보낸다.
            </li>
            <li>
              · 이미지가 늦게 로드되면 높이가 밀린다. 썸네일에 고정 높이를 줘서
              완화했을 뿐이다.
            </li>
            <li>
              · 가상 스크롤을 쓰는 목록에는 이 방식이 그대로 통하지 않는다.
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
