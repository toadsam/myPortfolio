"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useAClub} from "../context";
import {CATEGORY_COLORS, SIM_CLUBS} from "../data";
import {CodeWindow, HlLine, Kicker, Kw, MetricCell, NoteBox, Num, Reveal, useInViewOnce} from "../parts";

type Mode = "before" | "after";
type SimFilters = {art: boolean; acad: boolean; rec: boolean; newbie: boolean};
type Entry = {url: string; view: "list" | "detail"};

const NO_FILTERS: SimFilters = {art: false, acad: false, rec: false, newbie: false};
const BASE_URL = "aclub.app/clubs";

const FILTER_CHIPS: {key: keyof SimFilters; label: string}[] = [
  {key: "art", label: "예술"},
  {key: "acad", label: "학술"},
  {key: "rec", label: "모집중만"},
  {key: "newbie", label: "신입생 환영"},
];

function toQuery(f: SimFilters): string {
  const params: string[] = [];
  const cats = [f.art ? "art" : null, f.acad ? "acad" : null].filter(Boolean);
  if (cats.length > 0) params.push(`cat=${cats.join(",")}`);
  if (f.rec) params.push("recruiting=1");
  if (f.newbie) params.push("fresh=1");
  return params.join("&");
}

function fromQuery(url: string): SimFilters {
  const f = {...NO_FILTERS};
  const qs = url.split("?")[1];
  if (!qs) return f;
  const sp = new URLSearchParams(qs);
  const cat = sp.get("cat") ?? "";
  if (cat.includes("art")) f.art = true;
  if (cat.includes("acad")) f.acad = true;
  if (sp.get("recruiting") === "1") f.rec = true;
  if (sp.get("fresh") === "1") f.newbie = true;
  return f;
}

const HEAD_WORDS = ["조건을", "다섯 개", "걸어놓고", "뒤로가기를", "누르면"];

const TRANSITIONS = [
  {
    no: "01 · 공유",
    body: ["조건을 걸어둔 화면을 링크로 보낼 수 없었다.", "받는 사람은 항상 아무 조건도 없는 첫 화면을 봤다."],
    fix: "→ 조건을 쿼리스트링으로 옮겨서, 주소만 보내면 같은 화면이 열리게",
  },
  {
    no: "02 · 뒤로가기",
    body: ["상세를 보고 뒤로 나오면 조건이 전부 풀렸다.", "사용자는 매번 다시 다섯 번을 눌러야 했다."],
    fix: "→ 목록 화면이 조건을 기억하는 게 아니라, 주소가 기억하게",
  },
  {
    no: "03 · 새로고침",
    body: ["새로고침하면 초기화됐다.", "화면이 멈춘 것 같아서 새로고침했는데 오히려 잃어버렸다."],
    fix: "→ 첫 렌더에서 주소를 읽어 조건을 복원",
  },
];

export function UrlStateSection() {
  const {reducedMotion, announce} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({threshold: 0.1});

  const [mode, setMode] = useState<Mode>("before");
  const [history, setHistory] = useState<Entry[]>([{url: BASE_URL, view: "list"}]);
  const [index, setIndex] = useState(0);
  const [filters, setFilters] = useState<SimFilters>(NO_FILTERS);
  const [address, setAddress] = useState(BASE_URL);
  const [addressFlash, setAddressFlash] = useState<"" | "error" | "success">("");
  const [marker, setMarker] = useState<{text: string; tone: "error" | "success" | "neutral"} | null>(null);
  const [toast, setToast] = useState<{text: string; tone: "error" | "success"} | null>(null);
  const [bugVisible, setBugVisible] = useState(false);
  const [detail, setDetail] = useState<(typeof SIM_CLUBS)[number] | null>(null);
  const [cardAnim, setCardAnim] = useState<"none" | "fall" | "pop">("none");
  const [hintOn, setHintOn] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [pulse, setPulse] = useState(false);

  const timers = useRef<number[]>([]);
  const typing = useRef(0);
  const stackRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    window.clearTimeout(typing.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // 섹션에 들어오면 잠깐 뒤에 조작 유도를 켠다.
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const t1 = window.setTimeout(() => {
      setHintOn(true);
      setPulse(true);
    }, 2000);
    const t2 = window.setTimeout(() => setPulse(false), 4000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [inView, reducedMotion]);

  const visible = useMemo(
    () =>
      SIM_CLUBS.filter((c) => {
        if (filters.art && c.cat !== "예술") return false;
        if (filters.acad && c.cat !== "학술") return false;
        if (filters.rec && !c.rec) return false;
        if (filters.newbie && !c.newbie) return false;
        return true;
      }),
    [filters],
  );

  function resetSim(nextMode: Mode) {
    clearTimers();
    setMode(nextMode);
    setHistory([{url: BASE_URL, view: "list"}]);
    setIndex(0);
    setFilters(NO_FILTERS);
    setAddress(BASE_URL);
    setDetail(null);
    setBugVisible(false);
    setMarker(null);
    setToast(null);
    setCardAnim("none");
  }

  function flash(tone: "error" | "success") {
    setAddressFlash("");
    window.setTimeout(() => setAddressFlash(tone), 10);
    timers.current.push(window.setTimeout(() => setAddressFlash(""), 620));
  }

  function showMarker(text: string, tone: "error" | "success" | "neutral") {
    setMarker({text, tone});
    timers.current.push(window.setTimeout(() => setMarker(null), 2000));
  }

  function typeAddress(url: string) {
    if (reducedMotion) {
      setAddress(url);
      return;
    }
    const prefix = `${BASE_URL}?`;
    let i = prefix.length;
    setAddress(prefix);
    const step = () => {
      if (i > url.length) return;
      setAddress(url.slice(0, i));
      i += 1;
      typing.current = window.setTimeout(step, 15);
    };
    step();
  }

  function dismissHint() {
    if (hintDismissed) return;
    setHintDismissed(true);
    setHintOn(false);
    setPulse(false);
  }

  function onFilterClick(key: keyof SimFilters) {
    const next = {...filters, [key]: !filters[key]};
    setFilters(next);

    if (mode === "before") {
      // 화면만 바뀌고 주소는 그대로 — 이게 버그의 본체다.
      flash("error");
      showMarker("주소는 그대로", "error");
      return;
    }

    const qs = toQuery(next);
    const url = qs ? `${BASE_URL}?${qs}` : BASE_URL;
    setHistory((h) => [...h.slice(0, index + 1), {url, view: "list"}]);
    setIndex((i) => i + 1);
    flash("success");
    typeAddress(url);
  }

  function openDetail(club: (typeof SIM_CLUBS)[number]) {
    dismissHint();
    const url = `${BASE_URL}/${club.id}`;
    window.clearTimeout(typing.current);
    setHistory((h) => [...h.slice(0, index + 1), {url, view: "detail"}]);
    setIndex((i) => i + 1);
    setAddress(url);
    setDetail(club);
  }

  function goBack() {
    if (index <= 0) return;
    dismissHint();
    const cameFrom = history[index]!.view;
    const target = history[index - 1]!;
    setIndex(index - 1);
    window.clearTimeout(typing.current);
    setAddress(target.url);
    setDetail(target.view === "detail" ? detail : null);

    if (mode === "before") {
      if (cameFrom === "detail") void replayBug();
      return;
    }

    const restored = fromQuery(target.url);
    setFilters(restored);
    if (cameFrom === "detail") {
      showMarker("조건 유지됨", "success");
      announce("수정 후 모드: 뒤로가기 후 조건이 유지되었습니다.");
      if (!reducedMotion) {
        setCardAnim("pop");
        timers.current.push(window.setTimeout(() => setCardAnim("none"), 500));
      }
    } else {
      showMarker("조건 변경도 히스토리에 남습니다", "neutral");
    }
  }

  // 수정 전 모드: 조건이 하나씩 풀리고 카드가 떨어진 뒤 해설이 뜬다.
  async function replayBug() {
    announce("수정 전 모드: 뒤로가기 후 모든 조건이 해제되었습니다.");

    if (reducedMotion) {
      setFilters(NO_FILTERS);
      setBugVisible(true);
      timers.current.push(window.setTimeout(() => setBugVisible(false), 4000));
      return;
    }

    const wait = (ms: number) => new Promise<void>((r) => timers.current.push(window.setTimeout(r, ms)));
    const active = (Object.keys(filters) as (keyof SimFilters)[]).filter((k) => filters[k]);
    for (const key of active) {
      setFilters((f) => ({...f, [key]: false}));
      await wait(60);
    }
    setFilters(NO_FILTERS);
    setCardAnim("fall");
    await wait(500);
    setCardAnim("pop");
    setBugVisible(true);
    timers.current.push(window.setTimeout(() => setCardAnim("none"), 500));
    timers.current.push(window.setTimeout(() => setBugVisible(false), 4000));
  }

  function share() {
    const isBefore = mode === "before";
    setToast({
      text: isBefore ? `복사됨: ${BASE_URL} — 조건은 포함되지 않았습니다` : "복사됨: 조건이 포함된 주소",
      tone: isBefore ? "error" : "success",
    });
    timers.current.push(window.setTimeout(() => setToast(null), 3000));
  }

  useEffect(() => {
    const el = stackRef.current?.parentElement;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [history, index]);

  const seqIn = inView;

  return (
    <section
      ref={sectionRef}
      id="ac-sec-url"
      data-ac-section
      className="relative z-10 flex w-full flex-col items-center border-t border-[rgba(192,132,252,0.1)] px-6 py-[120px] text-[rgba(255,255,255,0.88)]"
    >
      <div className="w-full max-w-[1040px]">
        <Kicker tone="bad">02 · 트러블슈팅 01</Kicker>
        <h2 className="mt-4 flex flex-wrap gap-x-2 text-[30px] font-black leading-tight text-white">
          {HEAD_WORDS.map((w, i) => (
            <span
              key={w}
              className="inline-block transition-all duration-[400ms] ease-out"
              style={{
                transitionDelay: `${i * 0.15}s`,
                opacity: seqIn ? 1 : 0,
                transform: seqIn ? "none" : "translateY(10px)",
              }}
            >
              {w}
            </span>
          ))}
        </h2>

        <div
          className="mt-[24px] transition-all duration-[600ms] ease-out"
          style={{transitionDelay: "0.6s", opacity: seqIn ? 1 : 0, transform: seqIn ? "none" : "translateX(-12px)"}}
        >
          <NoteBox label="증상" tone="bad">
            <p className="text-[16px] leading-[32px]">
              친구한테 「이 조건으로 보면 딱 좋아」 하면서 링크를 보냈는데, 그냥 첫 화면이 열렸다.
              <br />
              나도 동아리 상세를 보고 뒤로 나오면 조건이 다 풀려 있었다.
              <br />
              기능은 다 되는데 쓸 수가 없는 화면이었다.
            </p>
          </NoteBox>
        </div>

        {/* ── 브라우저 시뮬레이터 ── */}
        <div
          className="relative mt-[36px] w-full transition-all duration-[600ms] ease-out"
          style={{transitionDelay: "1.1s", opacity: seqIn ? 1 : 0, transform: seqIn ? "none" : "translateY(18px)"}}
        >
          <div className="absolute -top-8 right-0 flex gap-2 font-mono text-[11px]">
            {(["before", "after"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => resetSim(m)}
                aria-label={m === "before" ? "수정 전 모드" : "수정 후 모드"}
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

          <div className="relative flex h-[500px] w-full flex-col overflow-hidden rounded-lg border border-[rgba(192,132,252,0.20)] bg-[#0f0a1a] shadow-2xl">
            {/* 크롬 */}
            <div className="relative z-20 flex h-[44px] shrink-0 items-center border-b border-[rgba(192,132,252,0.14)] bg-[#170f26] px-4">
              <div className="hidden w-14 gap-1.5 sm:flex">
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                  <span key={c} className="h-[9px] w-[9px] rounded-full" style={{background: c}} />
                ))}
              </div>
              <div className="mr-3 flex shrink-0 items-center gap-1 sm:mr-4 sm:gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={index <= 0}
                  aria-label="뒤로가기"
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.20)] font-mono text-[15px] text-[rgba(255,255,255,0.75)] outline-none transition-all ${
                    index <= 0 ? "cursor-not-allowed opacity-50" : "hover:bg-[rgba(255,255,255,0.1)]"
                  } ${pulse && !hintDismissed ? "ac-pulse-red" : ""}`}
                >
                  ←
                </button>
                <span
                  className="flex h-[30px] w-[30px] cursor-not-allowed items-center justify-center rounded-full border border-[rgba(255,255,255,0.20)] font-mono text-[15px] text-[rgba(255,255,255,0.75)] opacity-50"
                  aria-hidden="true"
                >
                  →
                </span>
                <button
                  type="button"
                  onClick={() => resetSim(mode)}
                  aria-label="새로고침"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full font-mono text-[15px] text-[rgba(255,255,255,0.75)] outline-none transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                >
                  ↻
                </button>
              </div>

              <div className="relative flex min-w-0 flex-1 items-center justify-center">
                <div
                  className={`flex h-[28px] w-full max-w-[500px] items-center overflow-hidden truncate rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)] px-2 font-mono text-[11px] text-[rgba(255,255,255,0.70)] sm:px-[14px] ${
                    addressFlash === "error" ? "ac-flash-error" : addressFlash === "success" ? "ac-flash-success" : ""
                  }`}
                  aria-live="polite"
                >
                  {address}
                </div>
                {marker ? (
                  <div
                    className="pointer-events-none absolute top-[32px] font-mono text-[9px]"
                    style={{
                      color:
                        marker.tone === "error" ? "#f87171" : marker.tone === "success" ? "#4ade80" : "rgba(255,255,255,0.46)",
                    }}
                  >
                    {marker.text}
                  </div>
                ) : null}
              </div>

              <div className="ml-2 flex w-20 shrink-0 justify-end sm:w-24">
                <button
                  type="button"
                  onClick={share}
                  className="rounded border border-[rgba(255,255,255,0.16)] px-2 py-[4px] font-mono text-[11px] text-[rgba(255,255,255,0.88)] outline-none transition-colors hover:bg-[rgba(255,255,255,0.05)] sm:px-[12px]"
                >
                  링크 복사
                </button>
              </div>
            </div>

            {hintOn && !hintDismissed ? (
              <div className="pointer-events-none absolute left-1/2 top-[48px] z-30 -translate-x-1/2 whitespace-nowrap rounded bg-[#0f0a1a] px-2 py-1 font-mono text-[10px] text-[rgba(255,255,255,0.35)]">
                조건을 걸고, 동아리를 하나 열고, 뒤로가기를 눌러보세요
              </div>
            ) : null}

            {/* 뷰포트 */}
            <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[#0d0816]">
              {toast ? (
                <div
                  className="absolute bottom-6 left-1/2 z-50 max-w-[90%] -translate-x-1/2 truncate whitespace-nowrap rounded border bg-[#0f0a1a] px-4 py-2 text-center font-mono text-[11px] shadow-lg"
                  style={{
                    borderColor: toast.tone === "error" ? "rgba(248,113,113,0.35)" : "rgba(74,222,128,0.35)",
                    color: toast.tone === "error" ? "#f87171" : "#4ade80",
                  }}
                >
                  {toast.text}
                </div>
              ) : null}

              <div
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[rgba(13,8,22,0.85)] p-6 backdrop-blur-sm transition-opacity duration-500"
                style={{opacity: bugVisible ? 1 : 0, pointerEvents: bugVisible ? "auto" : "none"}}
                aria-hidden={!bugVisible}
              >
                <div className="max-w-[460px] text-center">
                  <div className="text-[15px] leading-[36px] text-[rgba(255,255,255,0.88)] sm:text-[17px]">
                    방금 그게, 제 첫 버전에서 사용자가 겪던 일입니다.
                  </div>
                  <div className="mt-2 text-[15px] font-bold leading-[36px] text-[#f87171] sm:text-[17px]">
                    조건은 화면 안에만 있었고, 주소에는 없었습니다.
                  </div>
                </div>
              </div>

              <div className="relative h-full w-full overflow-hidden">
                <div
                  className="ac-scroll-thin absolute inset-0 flex h-full w-full flex-col items-center overflow-y-auto px-4 pb-12 pt-6 transition-transform duration-[350ms]"
                  style={{
                    transform: detail ? "translateX(-100%)" : "translateX(0)",
                    transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <div className="mb-6 flex w-full max-w-[420px] flex-wrap justify-center gap-2">
                    {FILTER_CHIPS.map((chip) => {
                      const on = filters[chip.key];
                      return (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={() => onFilterClick(chip.key)}
                          className={`rounded-full border px-3 py-1.5 font-mono text-[11px] outline-none transition-colors ${
                            on
                              ? "border-[#c084fc] bg-[rgba(192,132,252,0.15)] text-[#c084fc]"
                              : "border-[rgba(255,255,255,0.14)] text-[rgba(255,255,255,0.7)] hover:text-white"
                          } ${pulse && !hintDismissed ? "ac-pulse-purple" : ""}`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid w-full max-w-[420px] grid-cols-2 justify-items-center gap-3.5 sm:grid-cols-3">
                    {visible.map((c, i) => {
                      const col = CATEGORY_COLORS[c.cat];
                      const anim =
                        cardAnim === "fall"
                          ? `ac-fall-drop 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.02}s forwards`
                          : cardAnim === "pop"
                            ? `ac-pop-in 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.02}s forwards`
                            : undefined;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => openDetail(c)}
                          aria-label={`${c.name} 상세 보기`}
                          className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-sm border border-[rgba(192,132,252,0.20)] bg-[#170f26] p-3 text-left outline-none transition-colors hover:border-[rgba(192,132,252,0.5)]"
                          style={{animation: anim, opacity: cardAnim === "pop" ? 0 : 1}}
                        >
                          <span className="absolute inset-x-0 top-0 h-[3px]" style={{backgroundColor: col}} />
                          <span className="mb-2 flex h-[45px] w-full items-center justify-center rounded-sm border border-[rgba(255,255,255,0.04)] bg-[rgba(13,8,22,0.5)] sm:h-[50px]">
                            <span
                              className="h-5 w-5 rounded border border-dashed opacity-30 sm:h-6 sm:w-6"
                              style={{borderColor: col}}
                            />
                          </span>
                          <span className="flex-1 truncate text-[11px] font-black leading-tight text-[rgba(255,255,255,0.88)] sm:text-[12px]">
                            {c.name}
                          </span>
                          <span className="mt-auto flex flex-wrap gap-1">
                            <span
                              className="rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-1 py-[1px] font-mono text-[8px]"
                              style={{color: col}}
                            >
                              {c.cat}
                            </span>
                            {c.rec ? (
                              <span className="rounded-sm border border-[#4ade80]/20 bg-[#4ade80]/10 px-1 py-[1px] font-mono text-[8px] text-[#4ade80]">
                                모집중
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-[#0d0816] p-6 transition-transform duration-[350ms]"
                  style={{
                    transform: detail ? "translateX(0)" : "translateX(100%)",
                    transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <div className="flex w-full max-w-[320px] flex-col items-center text-center">
                    <div
                      className="mb-4 rounded-sm border bg-[rgba(255,255,255,0.02)] px-2 py-1 font-mono text-[10px]"
                      style={{
                        color: detail ? CATEGORY_COLORS[detail.cat] : undefined,
                        borderColor: detail ? CATEGORY_COLORS[detail.cat] : "transparent",
                      }}
                    >
                      {detail?.cat}
                    </div>
                    <h3 className="mb-3 text-[22px] font-black">{detail?.name}</h3>
                    <p className="mb-8 text-[14px] leading-7 text-[rgba(255,255,255,0.6)]">
                      동아리 상세 정보 화면입니다.
                      <br />
                      화면이 렌더링되면서 새로운 주소가 부여되었습니다.
                    </p>
                    <button
                      type="button"
                      onClick={goBack}
                      className="rounded-sm border border-[rgba(192,132,252,0.3)] px-5 py-2 font-mono text-[11px] text-[#c084fc] outline-none transition-colors hover:bg-[rgba(192,132,252,0.1)]"
                    >
                      [ 목록으로 ]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 히스토리 스택 */}
            <div className="ac-no-scrollbar relative z-20 flex h-[34px] shrink-0 items-center overflow-x-auto border-t border-[rgba(192,132,252,0.12)] bg-[#170f26] px-4">
              <div ref={stackRef} className="flex h-full items-center gap-1.5">
                {history.map((s, i) => {
                  const label = s.view === "detail" ? "Detail" : s.url.includes("?") ? "List (F)" : "List";
                  const active = i === index;
                  return (
                    <div
                      key={`${s.url}-${i}`}
                      className={`shrink-0 rounded-sm px-2 py-0.5 font-mono text-[9px] transition-colors duration-300 ${
                        active
                          ? "bg-[#c084fc] text-[#0d0816]"
                          : "border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.46)]"
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 text-center font-mono text-[9px] text-[rgba(255,255,255,0.32)]">
            재현용 시뮬레이터입니다. 실제 브라우저 히스토리를 조작하지 않습니다.
          </div>
        </div>

        {/* ── 세 갈래로 드러난 문제 ── */}
        <div className="mt-[44px] grid grid-cols-1 gap-[14px] md:grid-cols-3">
          {TRANSITIONS.map((t, i) => (
            <Reveal
              key={t.no}
              delay={i * 0.12}
              className="w-full rounded-md border border-[rgba(255,255,255,0.10)] border-t-[3px] border-t-[#f87171] bg-[#170f26] p-[20px]"
            >
              <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[#f87171]">{t.no}</div>
              <p className="mb-4 text-[15px] leading-[32px]">
                {t.body[0]}
                <br />
                {t.body[1]}
              </p>
              <div className="font-mono text-[12px] text-[#4ade80]">{t.fix}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-[40px]">
          <NoteBox label="원인" tone="warn">
            <p className="text-[16px] leading-[32px]">
              필터 상태를 컴포넌트 안의 상태로만 들고 있었다. 화면이 언마운트되면 같이 사라진다.
              <br />
              그런데 사용자 입장에서 조건은 「화면의 일시적인 설정」이 아니라
              <br />
              「내가 지금 보고 있는 곳」이다.
              <br />
              <strong className="font-bold text-[#fbbf24]">
                지금 보고 있는 곳을 표현하는 자리는 원래부터 주소창이었다.
              </strong>
            </p>
          </NoteBox>
        </Reveal>

        {/* ── before / after 코드 ── */}
        <Reveal className="mt-[40px] flex flex-col gap-[16px] lg:flex-row">
          <CodeWindow file="ClubListPage.tsx (before)" tone="bad" className="flex-1">
            <Kw>export function</Kw>
            {" ClubListPage() {\n  "}
            <span style={{color: "#7a5f8a"}}>{"// 로컬 상태로 필터 관리"}</span>
            <HlLine tone="bad">
              {"  "}
              <Kw>const</Kw>
              {" [filters, setFilters] = useState({});"}
              <span className="hidden font-mono text-[10px] text-[#f87171] sm:inline">
                {"    ← 화면이 사라지면 같이 사라진다"}
              </span>
            </HlLine>
            {"  "}
            <Kw>const</Kw>
            {" { items } = useClubFilter(clubs, filters);\n\n  "}
            <Kw>const</Kw>
            {" toggleFilter = (key: "}
            <Kw>string</Kw>
            {") => {\n    setFilters(prev => ({ ...prev, [key]: !prev[key] }));\n  };\n\n  "}
            <Kw>return</Kw>
            {" ("}
            {"\n    <div>{/* 렌더링 영역 */}</div>\n  );\n}"}
          </CodeWindow>

          <CodeWindow
            file="useFilterParams.ts (after)"
            tone="ok"
            className="flex-1"
            subHeader={
              <div className="border-b border-[rgba(74,222,128,0.1)] bg-[rgba(74,222,128,0.05)] px-4 py-2">
                <div className="font-mono text-[11px] text-[#4ade80]">
                  {"// 상태를 주소에서 파생시키면, 뒤로가기와 공유는 공짜로 따라온다"}
                </div>
              </div>
            }
          >
            <Kw>export function</Kw>
            {" useFilterParams() {\n  "}
            <Kw>const</Kw>
            {" [searchParams, setSearchParams] = useSearchParams();\n"}
            <HlLine tone="ok">
              {"  "}
              <Kw>const</Kw>
              {" filters = parseParams(searchParams);"}
            </HlLine>
            {"  "}
            <Kw>const</Kw>
            {" updateFilters = (next: Filters) => {\n    "}
            <Kw>const</Kw>
            {" nextParams = serialize(next);\n    "}
            <Kw>const</Kw>
            {" isRapidChange = Date.now() - lastChange.current < "}
            <Num>1000</Num>
            {";\n"}
            <HlLine tone="ok">{"    setSearchParams(nextParams, { replace: isRapidChange });"}</HlLine>
            {"    lastChange.current = Date.now();\n  };\n\n  "}
            <Kw>return</Kw>
            {" { filters, updateFilters };\n}"}
          </CodeWindow>
        </Reveal>

        <Reveal className="mt-[20px] max-w-[800px]">
          <p className="text-[15px] leading-[32px] text-[rgba(255,255,255,0.88)]">
            처음엔 조건을 바꿀 때마다 히스토리에 쌓았더니, 칩을 다섯 번 누르면 뒤로가기를 다섯 번 눌러야 목록을 벗어났다.
            그래서 <strong className="font-bold text-[#d8b4fe]">짧은 시간 안의 연속 변경은 히스토리를 덮어쓰도록</strong>{" "}
            바꿨다.
          </p>
        </Reveal>

        <Reveal className="relative mt-[28px] w-full">
          <div className="ac-media-grid relative flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)]">
            <span className="pointer-events-none select-none font-mono text-[12px] text-[rgba(255,255,255,0.3)]">
              [IMG-01] · 21:9 · 주소창이 보이는 캡처
            </span>
          </div>
          <div className="mt-3 px-3 py-1 font-mono text-[11px] text-[rgba(255,255,255,0.48)]">
            실제 화면 · 주소창에 조건이 남아 있는 상태
          </div>
        </Reveal>

        <Reveal className="mt-[40px]">
          <div className="flex w-full flex-col gap-[12px] sm:flex-row">
            <MetricCell value="3종" label="복구된 브라우저 동작" />
            <MetricCell value="1회" label="조건 5개 변경 시 뒤로가기 횟수" />
            <MetricCell value="동일" label="링크 공유 시 상대가 보는 화면" />
          </div>

          <div className="mt-[12px] font-mono text-[10px] text-[rgba(255,255,255,0.32)]">
            브라우저에서 직접 눌러가며 확인했습니다. 자동화된 테스트는 없습니다.
          </div>

          <div className="mt-[28px] rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] p-[20px]">
            <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[rgba(255,255,255,0.46)]">아직 남은 것</div>
            <ul className="space-y-1 text-[15px] leading-[32px] text-[rgba(255,255,255,0.88)]">
              <li>· 조건이 많아지면 주소가 길어진다. 짧은 코드로 압축하는 건 하지 않았다.</li>
              <li>· 잘못된 파라미터는 기본값으로 되돌리기만 한다. 사용자에게 알려주지는 않는다.</li>
              <li>· 스크롤 위치는 여전히 복원되지 않는다. 그건 다음 장에서 다룬다.</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
