"use client";

import {AnimatePresence, motion} from "framer-motion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import {useAClub} from "../context";
import {
  CATEGORY_COLORS,
  CATEGORY_NAMES,
  CLUBS,
  SORT_LABELS,
  type CategoryName,
  type SortKey
} from "../data";
import {Cmt, Kw, Num, Str, useInViewOnce} from "../parts";

const EASE = [0.22, 1, 0.36, 1] as const;

type Filters = {
  categories: (CategoryName | "전체")[];
  recruitingOnly: boolean;
  newbieWelcome: boolean;
  noWeekend: boolean;
  sort: SortKey;
};

const INITIAL: Filters = {
  categories: ["전체"],
  recruitingOnly: false,
  newbieWelcome: false,
  noWeekend: false,
  sort: "deadline"
};

// ── 카테고리별 모티프 ────────────────────────────────────────────────────────

function Motif({cat, color}: {cat: CategoryName; color: string}) {
  const common = {
    className: "h-10 w-10 opacity-[0.35]",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.5
  } as const;
  if (cat === "예술")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 4v16M4 12h16" />
        <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.1" />
      </svg>
    );
  if (cat === "학술")
    return (
      <svg {...common} aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 12h16" />
      </svg>
    );
  if (cat === "운동")
    return (
      <svg {...common} aria-hidden="true">
        <polygon points="12 2 22 22 2 22" fill={color} fillOpacity="0.1" />
      </svg>
    );
  if (cat === "봉사")
    return (
      <svg {...common} aria-hidden="true">
        <path
          d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"
          fill={color}
          fillOpacity="0.1"
        />
        <path d="M12 12L12 8M12 16h.01" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 4L4 20h16L12 4z" fill={color} fillOpacity="0.1" />
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

// ── 토글 스위치 ─────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex shrink-0 cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-[18px] w-8 rounded-full outline-none transition-colors ${
          checked ? "bg-[#c084fc]" : "bg-[rgba(255,255,255,0.2)]"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-[14px] w-[14px] rounded-full bg-white transition-transform ${
            checked ? "translate-x-[14px]" : "translate-x-0"
          }`}
        />
      </button>
      <span className="font-mono text-[12px] text-[rgba(255,255,255,0.7)] transition-colors group-hover:text-white">
        {label}
      </span>
    </label>
  );
}

// ── 카운터 ─────────────────────────────────────────────────────────────────

function LiveCount({
  count,
  reducedMotion
}: {
  count: number;
  reducedMotion: boolean;
}) {
  const [display, setDisplay] = useState(count);
  const raf = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(count);
      return;
    }
    const start = display;
    if (start === count) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 350, 1);
      setDisplay(Math.round(start + (count - start) * p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, reducedMotion]);

  return (
    <span className="font-mono text-[14px] tabular-nums text-[#c084fc]">
      {display} / 24
    </span>
  );
}

// ── 코드 패널 ───────────────────────────────────────────────────────────────

const DEFAULT_CAPTION = "// 위에서 조건을 바꾸면 이 순서대로 실행됩니다";

export type CodePanelHandle = {playHighlight: () => void};

const CodePanel = forwardRef<CodePanelHandle>(function CodePanel(_props, ref) {
  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(t => window.clearTimeout(t));
    },
    []
  );

  useImperativeHandle(ref, () => ({
    playHighlight() {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
      blocks.current.forEach(el => el?.classList.remove("ac-sweeping"));
      void blocks.current[0]?.offsetWidth;

      const step = (i: number, ms: number, text?: string) => {
        timers.current.push(
          window.setTimeout(() => {
            blocks.current[i]?.classList.add("ac-sweeping");
            if (text) setCaption(text);
          }, ms)
        );
      };

      step(0, 0);
      step(1, 140, "// 안 켠 조건은 아예 함수로 만들지 않는다");
      step(
        2,
        280,
        "// 정렬 기준이 같을 때 순서가 흔들리면 벽이 이유 없이 다시 섞인다"
      );
      step(3, 420, "// 필터 객체가 그대로면 다시 계산하지 않는다");
      timers.current.push(
        window.setTimeout(() => setCaption(DEFAULT_CAPTION), 1620)
      );
    }
  }));

  const Block = ({index, children}: {index: number; children: ReactNode}) => (
    <div
      ref={el => void (blocks.current[index] = el)}
      className="ac-sweep-target -ml-2 px-2 py-0.5"
    >
      {children}
    </div>
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex h-[36px] shrink-0 items-center border-b border-[rgba(192,132,252,0.18)] bg-[#170f26] px-4">
        <div className="mr-4 flex gap-1.5">
          {["#ff5f56", "#ffbd2e", "#27c93f"].map(c => (
            <span
              key={c}
              className="h-[8px] w-[8px] rounded-full"
              style={{background: c}}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-[rgba(255,255,255,0.45)]">
          useClubFilter.ts
        </span>
      </div>

      <div className="ac-scroll-thin relative flex-1 overflow-auto pb-[56px] pt-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
        <div className="absolute bottom-0 left-0 top-0 flex w-8 select-none flex-col items-center border-r border-[rgba(192,132,252,0.10)] bg-[rgba(13,8,22,0.5)] pt-4 text-[rgba(255,255,255,0.22)]">
          {Array.from({length: 29}, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div className="w-max min-w-full whitespace-pre pl-12 pr-4 text-[rgba(255,255,255,0.88)]">
          <Block index={0}>
            <Kw>type</Kw> Filters = {"{"}
            {"\n  categories: "}
            <Kw>string</Kw>
            {"[];\n  recruitingOnly: "}
            <Kw>boolean</Kw>
            {";\n  newbieWelcome: "}
            <Kw>boolean</Kw>
            {";\n  noWeekend: "}
            <Kw>boolean</Kw>
            {";\n};\n\n"}
            <Kw>type</Kw> ClubItem = {"{"} id: <Kw>string</Kw>; name:{" "}
            <Kw>string</Kw> {"}"};
          </Block>

          <div className="my-1 h-4" />

          <Block index={1}>
            <Kw>const</Kw> predicates = [
            {"\n  (c: ClubItem) => filters.categories.includes("}
            <Str>&apos;전체&apos;</Str>
            {
              ") ||\n                   filters.categories.includes(c.category),\n  filters.recruitingOnly && ((c: ClubItem) => c.recruiting),\n  filters.newbieWelcome && ((c: ClubItem) => c.newbieWelcome),\n  filters.noWeekend && ((c: ClubItem) => c.noWeekend)\n].filter("
            }
            <Kw>Boolean</Kw>
            {");"}
          </Block>

          <div className="my-1 h-4" />

          <Block index={2}>
            <Kw>let</Kw>
            {
              " result = sourceList.filter(c =>\n  predicates.every(p => p(c))\n);\n\nresult.sort((a, b) => {\n  "
            }
            <Kw>const</Kw>
            {" cmp = sortByKey(a, b, selectedSort);\n  "}
            <Kw>return</Kw>
            {" cmp !== "}
            <Num>0</Num>
            {" ? cmp : a.id.localeCompare(b.id);\n});"}
          </Block>

          <div className="my-1 h-4" />

          <Block index={3}>
            <Kw>const</Kw>
            {" memoizedResult = useMemo(() => {\n  "}
            <Kw>return</Kw>
            {" applyFilters(clubs, filters);\n}, [clubs, filters]);\n\n"}
            <Kw>return</Kw>
            {" { items: memoizedResult, count: memoizedResult.length };"}
          </Block>

          <div className="mt-3">
            <Cmt>{"// 조건이 늘어도 predicate 하나만 추가하면 된다"}</Cmt>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex h-[36px] items-center border-t border-[rgba(192,132,252,0.12)] bg-[#0f0a1a] px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
        <div
          key={caption}
          className="font-mono text-[11px] text-[rgba(255,255,255,0.45)] transition-opacity duration-200"
        >
          {caption}
        </div>
      </div>
    </div>
  );
});

// ── 섹션 ───────────────────────────────────────────────────────────────────

export function FilterSection() {
  const {reducedMotion, setReadout, rootRef} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({
    threshold: 0.1
  });
  const [phase, setPhase] = useState(-1);
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [history, setHistory] = useState<Filters[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [initialMount, setInitialMount] = useState(true);
  const [wallInView, setWallInView] = useState(true);
  const wallRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<CodePanelHandle>(null);
  const updates = useRef(0);
  const timers = useRef<number[]>([]);

  // ── 진입 타임라인 ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setPhase(6);
      setInitialMount(false);
      return;
    }
    setPhase(0);
    const push = (fn: () => void, ms: number) =>
      timers.current.push(window.setTimeout(fn, ms));
    push(() => setPhase(1), 700);
    push(() => setPhase(2), 1200);
    push(() => setPhase(3), 1700);
    push(() => {
      setPhase(4);
      push(() => setInitialMount(false), 1000);
    }, 2200);
    push(() => setPhase(5), 2900);
    push(() => setPhase(6), 3300);
    return () => {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
    };
  }, [inView, reducedMotion]);

  // 벽이 화면 밖이면 재배치 애니메이션을 생략한다.
  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setWallInView(Boolean(entry?.isIntersecting)),
      {
        root: rootRef.current ?? null,
        threshold: 0.1
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

  const filtered = useMemo(() => {
    const list = CLUBS.filter(c => {
      if (
        !filters.categories.includes("전체") &&
        !filters.categories.includes(c.category)
      )
        return false;
      if (filters.recruitingOnly && !c.recruiting) return false;
      if (filters.newbieWelcome && !c.newbieWelcome) return false;
      if (filters.noWeekend && !c.noWeekend) return false;
      return true;
    });

    list.sort((a, b) => {
      if (filters.sort === "deadline") {
        if (a.recruiting !== b.recruiting) return a.recruiting ? -1 : 1;
        if (a.recruiting && a.daysLeft !== b.daysLeft)
          return a.daysLeft - b.daysLeft;
      } else if (filters.sort === "name") {
        const cmp = a.name.localeCompare(b.name, "ko-KR");
        if (cmp !== 0) return cmp;
      } else if (filters.sort === "recent") {
        if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
      }
      // 정렬 기준이 같을 때 순서가 흔들리지 않도록 id로 고정한다.
      return a.id.localeCompare(b.id);
    });

    return list;
  }, [filters]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.recruitingOnly) n += 1;
    if (filters.newbieWelcome) n += 1;
    if (filters.noWeekend) n += 1;
    if (!filters.categories.includes("전체")) n += filters.categories.length;
    return n;
  }, [filters]);

  useEffect(() => {
    setReadout(`포스터 ${filtered.length} / 24  ·  필터 ${activeCount}`);
  }, [filtered.length, activeCount, setReadout]);

  function update(
    partial: Partial<Filters> | ((prev: Filters) => Partial<Filters>)
  ) {
    setFilters(prev => {
      const next =
        typeof partial === "function"
          ? {...prev, ...partial(prev)}
          : {...prev, ...partial};
      setHistory(h => [...h, prev]);
      setHasInteracted(true);
      return next;
    });
    if (updates.current > 0) codeRef.current?.playHighlight();
    updates.current += 1;
  }

  function toggleCategory(cat: CategoryName | "전체") {
    if (cat === "전체") {
      update({categories: ["전체"]});
      return;
    }
    update(prev => {
      let next = prev.categories.filter(c => c !== "전체");
      next = next.includes(cat) ? next.filter(c => c !== cat) : [...next, cat];
      return {categories: next.length === 0 ? ["전체"] : next};
    });
  }

  function resetAll() {
    update(INITIAL);
    setHistory([]);
  }

  function releaseLast() {
    if (history.length === 0) {
      resetAll();
      return;
    }
    setFilters(history[history.length - 1]!);
    setHistory(h => h.slice(0, -1));
    codeRef.current?.playHighlight();
    updates.current += 1;
  }

  const chips: (CategoryName | "전체")[] = ["전체", ...CATEGORY_NAMES];
  const tapeVariants = {
    hidden: {scaleX: 0},
    visible: {scaleX: 1, transition: {duration: 0.2}}
  };

  return (
    <section
      ref={sectionRef}
      id="ac-sec-filter"
      data-ac-section
      className="relative w-full border-t border-[rgba(192,132,252,0.1)] pb-24 pt-12"
    >
      <div className="relative mx-auto w-full max-w-[1180px] px-6">
        <div className="max-w-[740px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.25em] text-[rgba(255,255,255,0.46)]">
            01 · 필터와 재배치
          </div>

          <h2 className="mt-3 flex flex-wrap gap-x-2 text-[28px] font-black text-[rgba(255,255,255,0.88)]">
            {"검색창에 뭘 쳐야 할지 모르는 사람을 위한 화면"
              .split(" ")
              .map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{opacity: 0, y: 10}}
                  animate={
                    phase >= 0 ? {opacity: 1, y: 0} : {opacity: 0, y: 10}
                  }
                  transition={{delay: 0.15 + i * 0.03, duration: 0.4}}
                >
                  {w}
                </motion.span>
              ))}
          </h2>

          <motion.p
            className="mt-5 text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)]"
            initial={{opacity: 0, y: 10}}
            animate={phase >= 1 ? {opacity: 1, y: 0} : {opacity: 0, y: 10}}
            transition={{duration: 0.5}}
          >
            학생들은 「사진 동아리」를 검색하지 않는다.
            <br className="hidden sm:block" />
            「이번 학기에 모집하고, 주말에 안 모이고, 신입생도 받는 곳」을
            찾는다.
            <br className="hidden sm:block" />
            그건 검색어로 표현할 수 있는 조건이 아니다.
          </motion.p>

          <motion.p
            className="mt-[18px] text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)]"
            initial={{opacity: 0, y: 10}}
            animate={phase >= 2 ? {opacity: 1, y: 0} : {opacity: 0, y: 10}}
            transition={{duration: 0.5}}
          >
            그래서 검색 대신 조건을 눌러 좁히는 구조로 만들었다.
            <br className="hidden sm:block" />
            아래 필터를{" "}
            <strong className="font-bold text-[#d8b4fe]">
              직접 눌러보세요
            </strong>
            . 오른쪽 코드에서 지금 어느 단계가 도는지 보입니다.
          </motion.p>
        </div>

        {/* ── 필터 바 ── */}
        <motion.div
          className="sticky top-[66px] z-40 mt-12 w-full rounded-md border border-[rgba(192,132,252,0.18)] bg-[#170f26] px-5 py-[18px] shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
          initial={{opacity: 0, y: 14}}
          animate={phase >= 3 ? {opacity: 1, y: 0} : {opacity: 0, y: 14}}
          transition={{duration: 0.5}}
        >
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
            <div className="flex w-full flex-1 flex-col gap-3 overflow-hidden">
              <div className="ac-no-scrollbar flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 md:pb-0">
                <span className="mr-2 shrink-0 font-mono text-[10px] text-[rgba(255,255,255,0.46)]">
                  분야
                </span>
                {chips.map((cat, i) => {
                  const isActive = filters.categories.includes(cat);
                  const activeColor =
                    cat === "전체" ? "#c084fc" : CATEGORY_COLORS[cat];
                  const pulse = cat === "예술" && !hasInteracted && phase >= 6;
                  return (
                    <motion.button
                      key={cat}
                      type="button"
                      role="checkbox"
                      aria-checked={isActive}
                      onClick={() => toggleCategory(cat)}
                      initial={{opacity: 0, scale: 0.9}}
                      animate={{opacity: 1, scale: 1}}
                      transition={{delay: 0.04 * i, duration: 0.3}}
                      className="relative rounded-full px-[14px] py-[7px] font-mono text-[12px] outline-none transition-all"
                      style={{
                        border: `1px solid ${
                          isActive ? activeColor : "rgba(255,255,255,0.14)"
                        }`,
                        backgroundColor: isActive
                          ? `${activeColor}24`
                          : "transparent",
                        color: isActive ? activeColor : "rgba(255,255,255,0.70)"
                      }}
                    >
                      {cat}
                      {pulse ? (
                        <span
                          className="ac-pulse-ring pointer-events-none absolute inset-[-2px] rounded-full"
                          style={{border: `1px solid ${activeColor}`}}
                        />
                      ) : null}
                    </motion.button>
                  );
                })}
                {!hasInteracted && phase >= 6 ? (
                  <span className="ml-2 font-mono text-[10px] text-[rgba(255,255,255,0.35)]">
                    조건을 눌러보세요
                  </span>
                ) : null}
              </div>

              <div className="ac-no-scrollbar flex w-full items-center gap-4 overflow-x-auto whitespace-nowrap pb-1 md:pb-0">
                <span className="mr-2 shrink-0 font-mono text-[10px] text-[rgba(255,255,255,0.46)]">
                  조건
                </span>
                <Toggle
                  label="모집중만"
                  checked={filters.recruitingOnly}
                  onChange={() =>
                    update(p => ({recruitingOnly: !p.recruitingOnly}))
                  }
                />
                <Toggle
                  label="신입생 환영"
                  checked={filters.newbieWelcome}
                  onChange={() =>
                    update(p => ({newbieWelcome: !p.newbieWelcome}))
                  }
                />
                <Toggle
                  label="주말 활동 없음"
                  checked={filters.noWeekend}
                  onChange={() => update(p => ({noWeekend: !p.noWeekend}))}
                />
              </div>

              <div className="mt-1 flex items-center gap-2 pb-1 md:pb-0">
                <span className="mr-2 shrink-0 font-mono text-[10px] text-[rgba(255,255,255,0.46)]">
                  정렬
                </span>
                <div
                  role="radiogroup"
                  aria-label="정렬"
                  className="hidden items-center gap-1 rounded-md border border-[rgba(192,132,252,0.20)] bg-[#0d0816] p-1 sm:flex"
                >
                  {SORT_LABELS.map(({key, label}) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={filters.sort === key}
                      onClick={() => update({sort: key})}
                      className={`rounded-sm px-3 py-1.5 font-mono text-[12px] outline-none transition-colors ${
                        filters.sort === key
                          ? "bg-[#170f26] text-[#c084fc] shadow-sm"
                          : "text-[rgba(255,255,255,0.46)] hover:text-[rgba(255,255,255,0.70)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  className="rounded border border-[rgba(192,132,252,0.20)] bg-[#0d0816] px-2 py-1 font-mono text-[12px] text-white outline-none sm:hidden"
                  value={filters.sort}
                  onChange={e => update({sort: e.target.value as SortKey})}
                  aria-label="정렬"
                >
                  {SORT_LABELS.map(({key, label}) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-row items-center justify-between border-t border-[rgba(192,132,252,0.10)] pt-3 md:w-auto md:flex-col md:items-end md:border-t-0 md:pt-0">
              <LiveCount
                count={filtered.length}
                reducedMotion={reducedMotion}
              />
              <button
                type="button"
                onClick={resetAll}
                className="mt-0 rounded px-2 py-1 font-mono text-[11px] text-[rgba(255,255,255,0.46)] outline-none transition-colors hover:text-white md:mt-2"
              >
                ↻ 조건 초기화
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── 포스터 벽 + 코드 ── */}
        <div
          ref={wallRef}
          className="mt-10 flex flex-col gap-[18px] min-[1100px]:flex-row"
        >
          <div className="min-h-[560px] w-full min-[1100px]:w-[62%]">
            <ul
              role="list"
              className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 min-[1100px]:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {phase >= 4 &&
                  filtered.map((c, i) => {
                    const deadlineColor =
                      c.daysLeft < 0
                        ? "text-[rgba(255,255,255,0.46)]"
                        : c.daysLeft <= 7
                        ? "text-[#f87171]"
                        : c.daysLeft <= 14
                        ? "text-[#fbbf24]"
                        : "text-[rgba(255,255,255,0.46)]";
                    const animate = wallInView && !reducedMotion;
                    return (
                      <motion.li
                        layout
                        key={c.id}
                        initial={{opacity: 0, y: -26, scale: 0.95}}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            delay: animate
                              ? initialMount
                                ? i * 0.025
                                : 0.3 + i * 0.03
                              : 0,
                            duration: animate ? 0.3 : 0
                          }
                        }}
                        exit={{
                          opacity: 0,
                          y: 120,
                          rotate: c.exitRotate,
                          transition: {
                            duration: animate ? 0.42 : 0,
                            ease: [0.4, 0, 1, 1],
                            delay: animate ? i * 0.015 : 0
                          }
                        }}
                        transition={{
                          layout: {duration: animate ? 0.5 : 0, ease: EASE}
                        }}
                        className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-sm border border-[rgba(192,132,252,0.20)] bg-[#170f26] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.3)] will-change-transform"
                      >
                        <div
                          className="absolute inset-x-0 top-0 h-[4px]"
                          style={{backgroundColor: CATEGORY_COLORS[c.category]}}
                        />
                        <div className="relative mb-3 flex h-[62px] w-full items-center justify-center overflow-hidden rounded-sm border border-[rgba(255,255,255,0.04)] bg-[rgba(13,8,22,0.5)]">
                          <Motif
                            cat={c.category}
                            color={CATEGORY_COLORS[c.category]}
                          />
                        </div>
                        <h3 className="max-h-[2.4em] overflow-hidden text-[14px] font-black leading-tight text-[rgba(255,255,255,0.88)]">
                          {c.name}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span
                            className="rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 font-mono text-[9px]"
                            style={{color: CATEGORY_COLORS[c.category]}}
                          >
                            {c.category}
                          </span>
                          {c.newbieWelcome ? (
                            <span className="rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 font-mono text-[9px] text-[rgba(255,255,255,0.50)]">
                              신입생 환영
                            </span>
                          ) : null}
                          {c.noWeekend ? (
                            <span className="rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 font-mono text-[9px] text-[rgba(255,255,255,0.50)]">
                              주말 활동 없음
                            </span>
                          ) : null}
                        </div>
                        <motion.span
                          variants={tapeVariants}
                          className="absolute left-[10px] top-[-6px] z-10 h-[10px] w-[22px] origin-center rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm"
                        />
                        <motion.span
                          variants={tapeVariants}
                          className="absolute right-[10px] top-[-6px] z-10 h-[10px] w-[22px] origin-center -rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm"
                        />
                        {c.daysLeft >= 0 ? (
                          <div
                            className={`absolute bottom-3 left-3 font-mono text-[9px] tabular-nums ${deadlineColor}`}
                          >
                            D-{c.daysLeft}
                          </div>
                        ) : null}
                        <div
                          className={`absolute bottom-3 right-3 rounded-full px-2 py-[2px] font-mono text-[9px] ${
                            c.recruiting
                              ? "bg-[#4ade80]/[0.16] text-[#4ade80]"
                              : "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.46)]"
                          }`}
                        >
                          {c.recruiting ? "모집중" : "모집 마감"}
                        </div>
                      </motion.li>
                    );
                  })}

                {phase >= 4 && filtered.length === 0 ? (
                  <motion.li
                    key="empty"
                    initial={{opacity: 0, scale: 0.95}}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {duration: 0.3, delay: 0.4}
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      transition: {duration: 0.2}
                    }}
                    className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed border-[rgba(255,255,255,0.16)] bg-[rgba(23,15,38,0.5)] py-16"
                  >
                    <div className="font-mono text-[13px] text-[rgba(255,255,255,0.55)]">
                      조건에 맞는 동아리가 없습니다
                    </div>
                    <div className="mb-4 mt-1 font-mono text-[11px] text-[rgba(255,255,255,0.40)]">
                      조건을 하나 풀어보세요
                    </div>
                    <button
                      type="button"
                      onClick={releaseLast}
                      className="rounded-sm border border-[rgba(192,132,252,0.35)] px-4 py-2 font-mono text-[11px] text-[#c084fc] outline-none transition-colors hover:bg-[rgba(192,132,252,0.10)]"
                    >
                      [ 마지막 조건 해제 ]
                    </button>
                  </motion.li>
                ) : null}
              </AnimatePresence>
            </ul>
          </div>

          <div className="relative w-full min-[1100px]:w-[38%]">
            <motion.div
              className="h-auto max-h-[520px] min-[1100px]:sticky min-[1100px]:top-[88px] min-[1100px]:h-[560px] min-[1100px]:max-h-none"
              initial={{opacity: 0, y: 14}}
              animate={phase >= 5 ? {opacity: 1, y: 0} : {opacity: 0, y: 14}}
              transition={{duration: 0.5}}
            >
              <CodePanel ref={codeRef} />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="mt-10"
          initial={{opacity: 0, y: 20}}
          animate={phase >= 5 ? {opacity: 1, y: 0} : {opacity: 0, y: 20}}
          transition={{duration: 0.5, delay: 0.2}}
        >
          <div
            className="rounded-md border border-[rgba(192,132,252,0.22)] bg-[rgba(192,132,252,0.04)] p-[22px]"
            style={{borderLeft: "3px solid #c084fc"} as CSSProperties}
          >
            <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-[#c084fc]">
              왜 애니메이션을 넣었나
            </div>
            <div className="text-[15px] leading-[32px] text-[rgba(255,255,255,0.88)]">
              그냥 다시 그리면 사용자는 화면이 「바뀌었다」는 것만 안다.
              <br className="hidden sm:block" />
              어떤 게 빠지고 어떤 게 남았는지는 모른다.
              <br />
              남는 카드가 자리를 옮기는 걸 보여주면, 자기가 뭘 걸러냈는지가
              눈으로 확인된다.
              <br />
              그래서{" "}
              <strong className="font-bold text-[#d8b4fe]">
                사라지는 것과 남는 것의 움직임을 일부러 다르게
              </strong>{" "}
              만들었다.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
