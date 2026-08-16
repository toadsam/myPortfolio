"use client";

import {useEffect, useRef, useState} from "react";
import {useAClub} from "../context";
import {
  CodeWindow,
  HlLine,
  Kicker,
  Kw,
  Reveal,
  RevealWords,
  Str,
  useInViewOnce
} from "../parts";

type View = "assembled" | "exploded";

const LAYERS = [
  {
    no: 1,
    name: "CategoryBar",
    reuse: "4개 화면에서 사용",
    leader: "w-[20px] sm:w-[40px]"
  },
  {
    no: 2,
    name: "CoverImage",
    reuse: "3개 화면에서 사용",
    leader: "w-[30px] sm:w-[50px]"
  },
  {
    no: 3,
    name: "ClubHeading",
    reuse: "4개 화면에서 사용",
    leader: "w-[20px] sm:w-[40px]"
  },
  {
    no: 4,
    name: "TagRow",
    reuse: "4개 화면에서 사용",
    leader: "w-[30px] sm:w-[50px]"
  },
  {
    no: 5,
    name: "StatusBar",
    reuse: "2개 화면에서 사용",
    leader: "w-[20px] sm:w-[40px]"
  }
];

const VARIANTS = [
  {label: "목록", layers: [1, 2, 3, 4, 5], wide: false, badge: false},
  {label: "상세", layers: [1, 2, 3, 4, 5], wide: false, badge: false},
  {label: "마이페이지", layers: [1, 2, 3, 4], wide: false, badge: true},
  {label: "관리자", layers: [1, 3, 4], wide: true, badge: false}
];

const TABLE = [
  {
    name: "CategoryBar",
    takes: "분야 값",
    rejects: "동아리 전체 객체",
    used: "목록 · 상세 · 마이 · 관리자"
  },
  {
    name: "CoverImage",
    takes: "이미지 주소 · 대체 텍스트",
    rejects: "로딩 상태",
    used: "목록 · 상세 · 마이"
  },
  {
    name: "ClubHeading",
    takes: "이름 · 한 줄 소개 · 크기",
    rejects: "클릭 동작",
    used: "목록 · 상세 · 마이 · 관리자"
  },
  {
    name: "TagRow",
    takes: "태그 배열",
    rejects: "필터 상태",
    used: "목록 · 상세 · 마이 · 관리자"
  },
  {
    name: "StatusBar",
    takes: "모집 여부 · 마감일",
    rejects: "지원 로직",
    used: "목록 · 상세"
  }
];

export function ComponentSection() {
  const {reducedMotion, announce} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({
    threshold: 0.1
  });
  const {ref: stageRef, inView: stageInView} = useInViewOnce<HTMLDivElement>({
    threshold: 0.5
  });

  const [view, setView] = useState<View>("assembled");
  const [interacted, setInteracted] = useState(false);
  const [autoHint, setAutoHint] = useState(false);
  const [annotations, setAnnotations] = useState(0);
  const [chipVisible, setChipVisible] = useState(false);
  const [stripVisible, setStripVisible] = useState(false);
  const [highlight, setHighlight] = useState<number[] | null>(null);
  const [size, setSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      setSize(w < 640 ? "mobile" : w < 900 ? "tablet" : "desktop");
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(
      () => setStripVisible(true),
      1200 + VARIANTS.length * 80
    );
    return () => window.clearTimeout(t);
  }, [inView]);

  useEffect(
    () => () => {
      timers.current.forEach(t => window.clearTimeout(t));
    },
    []
  );

  function setState(next: View, byUser = true) {
    if (byUser) setInteracted(true);
    if (next === view) return;
    setView(next);
    setAutoHint(false);
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];

    announce(
      next === "exploded"
        ? "컴포넌트가 분해되었습니다. 5개의 계층 구조를 보여줍니다."
        : "컴포넌트가 다시 조립되었습니다."
    );

    if (next === "exploded") {
      if (reducedMotion) {
        setAnnotations(LAYERS.length);
        setChipVisible(true);
        return;
      }
      LAYERS.forEach((_, i) => {
        timers.current.push(
          window.setTimeout(
            () => setAnnotations(n => Math.max(n, i + 1)),
            400 + i * 90
          )
        );
      });
      timers.current.push(window.setTimeout(() => setChipVisible(true), 1800));
    } else {
      setAnnotations(0);
      setChipVisible(false);
      setHighlight(null);
    }
  }

  // 자동 시연 — 5초 두고 한 번 분해했다가 되돌린다.
  useEffect(() => {
    if (!stageInView || reducedMotion || interacted) return;
    const t = window.setTimeout(() => {
      if (interacted) return;
      setAutoHint(true);
      setState("exploded", false);
      const back = window.setTimeout(() => {
        if (interacted) return;
        setState("assembled", false);
      }, 3500);
      timers.current.push(back);
    }, 5000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageInView, reducedMotion, interacted]);

  const exploded = view === "exploded";

  const wrapperTransform = !exploded
    ? "rotateX(0deg) rotateY(0deg)"
    : size === "mobile"
    ? "rotateX(0deg) rotateY(0deg)"
    : size === "tablet"
    ? "rotateX(9deg) rotateY(-7deg)"
    : "rotateX(18deg) rotateY(-14deg)";

  function layerTransform(index: number) {
    if (!exploded) return "translateZ(0) translateY(0)";
    if (size === "mobile") return `translateY(${index * 40}px)`;
    const z = size === "tablet" ? 40 : 64;
    return `translateZ(${(4 - index) * z}px)`;
  }

  function layerVisual(no: number) {
    const dim = highlight !== null && !highlight.includes(no);
    return {
      opacity: dim ? 0.35 : 1,
      filter: dim
        ? "grayscale(0.5)"
        : highlight?.includes(no)
        ? "brightness(1.1)"
        : "none",
      boxShadow: exploded ? "0 10px 30px -10px rgba(0,0,0,0.7)" : "none",
      outline: exploded ? "1px dashed #c084fc" : "none"
    };
  }

  return (
    <section
      ref={sectionRef}
      id="ac-sec-components"
      data-ac-section
      className="relative z-10 w-full border-t border-[rgba(192,132,252,0.1)]"
    >
      <div className="mx-auto flex max-w-[1080px] flex-col items-center px-6 py-[120px]">
        <div className="w-full">
          <Kicker>06 · 공통 컴포넌트</Kicker>
          <RevealWords
            text="같은 카드가 네 화면에서 조금씩 다르게 필요했다"
            className="mt-4 text-[28px] font-black leading-tight text-[rgba(255,255,255,0.88)]"
          />
          <Reveal delay={0.7} className="mt-5 max-w-[740px]">
            <p className="text-[16px] leading-8 text-[rgba(255,255,255,0.88)]">
              목록에서는 작게, 상세에서는 크게, 마이페이지에서는 상태 배지가
              붙고, 관리자 화면에서는 아예 가로로 눕는다. 매번 새로 만들다가 네
              번째쯤에 규칙을 정했다.
            </p>
          </Reveal>
        </div>

        {/* ── 분해도 ── */}
        <div
          ref={stageRef}
          className="relative mt-[40px] h-[580px] w-full overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] bg-[#170f26] p-5 sm:h-[520px] sm:p-7"
          style={{perspective: "1100px"}}
        >
          <div className="absolute right-5 top-5 z-50 flex flex-col items-end gap-2 sm:right-7 sm:top-7">
            <div
              className="relative inline-flex rounded-md border border-[rgba(192,132,252,0.22)] bg-[#0f0a1a] p-1"
              role="radiogroup"
              aria-label="컴포넌트 보기 모드"
            >
              <div
                className="absolute top-1 h-[calc(100%-8px)] rounded bg-[rgba(192,132,252,0.14)] transition-all duration-[350ms]"
                style={{
                  left: exploded ? "50%" : "4px",
                  width: "calc(50% - 4px)",
                  transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)"
                }}
              />
              {(["assembled", "exploded"] as View[]).map((v, i) => (
                <button
                  key={v}
                  ref={el => void (radios.current[i] = el)}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  tabIndex={view === v ? 0 : -1}
                  onClick={() => setState(v)}
                  onKeyDown={e => {
                    if (
                      [
                        "ArrowRight",
                        "ArrowLeft",
                        "ArrowUp",
                        "ArrowDown"
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                      const other = i === 0 ? 1 : 0;
                      setState(other === 0 ? "assembled" : "exploded");
                      radios.current[other]?.focus();
                    }
                  }}
                  className="relative z-10 rounded px-5 py-1.5 font-mono text-[11px] outline-none transition-colors"
                  style={{
                    color: view === v ? "#c084fc" : "rgba(255,255,255,0.46)"
                  }}
                >
                  {v === "assembled" ? "조립" : "분해"}
                </button>
              ))}
            </div>
            <p
              className="font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity duration-300"
              style={{opacity: autoHint ? 1 : 0}}
            >
              자동 시연
            </p>
          </div>

          <div className="sr-only">
            <h3>컴포넌트 구조</h3>
            <ul>
              {LAYERS.map(l => (
                <li key={l.no}>
                  {l.no}. {l.name} — {l.reuse}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center pb-[90px] transition-transform duration-[400ms]"
            style={{
              transformStyle: "preserve-3d",
              transform: wrapperTransform,
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)"
            }}
          >
            <div
              className="relative flex w-[280px] flex-col rounded-md border border-white/5 bg-[#0f0a1a]"
              style={{transformStyle: "preserve-3d"}}
            >
              {LAYERS.map((layer, i) => {
                const visual = layerVisual(layer.no);
                const annotationOn = annotations > i;
                return (
                  <div
                    key={layer.no}
                    className="ac-comp-layer relative w-full"
                    style={{transform: layerTransform(i), ...visual}}
                    onMouseEnter={() => exploded && setHighlight([layer.no])}
                    onMouseLeave={() => exploded && setHighlight(null)}
                  >
                    {layer.no === 1 ? (
                      <div className="h-1 w-full rounded-t-md bg-[#f472b6]" />
                    ) : null}

                    {layer.no === 2 ? (
                      <div className="flex h-[130px] items-center justify-center border-y border-white/5 bg-[#170f26]">
                        <span className="select-none font-mono text-[11px] text-white/30">
                          [IMG-SLOT]
                        </span>
                      </div>
                    ) : null}

                    {layer.no === 3 ? (
                      <div className="bg-[#0f0a1a] p-4 pb-2">
                        <h3 className="text-[18px] font-black leading-tight text-[rgba(255,255,255,0.88)]">
                          빛그림 사진회
                        </h3>
                        <p className="mt-1.5 text-[12px] leading-[1.6] text-white/60">
                          필름 카메라로 한 학기에 한 번 전시를 엽니다
                        </p>
                      </div>
                    ) : null}

                    {layer.no === 4 ? (
                      <div className="flex flex-wrap gap-1.5 bg-[#0f0a1a] px-4 pb-3">
                        <span className="rounded border border-[#f472b6]/20 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-[#f472b6]">
                          예술
                        </span>
                        {["신입생 환영", "주말 활동 없음"].map(t => (
                          <span
                            key={t}
                            className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {layer.no === 5 ? (
                      <div className="flex items-center justify-between rounded-b-md border-t border-white/5 bg-[#0f0a1a] px-4 py-3">
                        <span className="font-mono text-[10px] tabular-nums text-[#4ade80]">
                          모집중 · D-6
                        </span>
                        <span className="pointer-events-none select-none rounded bg-[#c084fc] px-3 py-1.5 text-[11px] font-bold leading-none text-[#0f0a1a]">
                          지원하기
                        </span>
                      </div>
                    ) : null}

                    {/* 지시선 + 이름표 */}
                    <div
                      className="ac-comp-annotation absolute left-[100%] top-1/2 flex -translate-y-1/2 items-center transition-all duration-300"
                      style={{
                        opacity: annotationOn ? 1 : 0,
                        transform: `translateY(-50%) translateX(${
                          annotationOn ? 0 : 32
                        }px)`
                      }}
                    >
                      <div
                        className={`${layer.leader} mr-2 h-px origin-left bg-[#c084fc]/40 transition-transform duration-300 sm:mr-3`}
                        style={{
                          transform: annotationOn ? "scaleX(1)" : "scaleX(0)"
                        }}
                      />
                      <div className="flex flex-col">
                        <span
                          className="whitespace-nowrap rounded border border-[rgba(192,132,252,0.30)] bg-[#0f0a1a] px-2 py-1 font-mono text-[10px] text-[#c084fc] transition-all duration-300"
                          style={{
                            opacity: annotationOn ? 1 : 0,
                            transform: annotationOn ? "none" : "translateX(8px)"
                          }}
                        >
                          {layer.name}
                        </span>
                        <span
                          className="mt-1 whitespace-nowrap pl-1 text-[9px] text-[rgba(255,255,255,0.46)] transition-all duration-300 delay-[400ms]"
                          style={{
                            opacity: annotationOn ? 1 : 0,
                            transform: annotationOn ? "none" : "translateX(8px)"
                          }}
                        >
                          {layer.reuse}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-[106px] right-7 z-10 rounded border border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] px-3 py-1.5 font-mono text-[10px] text-[rgba(255,255,255,0.46)] transition-all duration-500"
            style={{
              opacity: chipVisible ? 1 : 0,
              transform: chipVisible ? "none" : "translateY(8px)"
            }}
          >
            컴포넌트 5종 · 사용처 17곳
          </div>

          {/* 변형 목록 */}
          <div
            className="ac-scroll-thin absolute inset-x-0 bottom-0 z-40 flex h-[90px] items-center gap-3 overflow-x-auto border-t border-[rgba(192,132,252,0.12)] bg-[#170f26]/90 px-4 backdrop-blur-md transition-opacity duration-500 sm:gap-4 sm:px-7"
            style={{opacity: stripVisible ? 1 : 0}}
          >
            {VARIANTS.map(v => (
              <button
                key={v.label}
                type="button"
                onMouseEnter={() => setHighlight(v.layers)}
                onMouseLeave={() => setHighlight(null)}
                onFocus={() => setHighlight(v.layers)}
                onBlur={() => setHighlight(null)}
                className={`group flex shrink-0 flex-col items-center gap-1.5 rounded p-1 outline-none transition-colors hover:bg-white/5 ${
                  v.wide ? "w-[100px] sm:w-[110px]" : "w-[84px] sm:w-[92px]"
                }`}
              >
                <span
                  className={`relative flex w-full items-center rounded border border-white/10 bg-[#0f0a1a] shadow-sm transition-colors group-hover:border-[#c084fc]/40 ${
                    v.wide ? "aspect-[16/9] px-1" : "aspect-[3/4]"
                  }`}
                >
                  {v.badge ? (
                    <span className="absolute right-1 top-1 h-[6px] w-[6px] rounded-full bg-[#4ade80] shadow-[0_0_4px_rgba(74,222,128,0.5)]" />
                  ) : null}
                  {v.wide ? (
                    <span className="flex h-full w-full flex-col justify-center gap-1 opacity-40">
                      <span className="h-0.5 w-full rounded bg-white/20" />
                      <span className="h-0.5 w-1/2 rounded bg-white/20" />
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[9px] text-[rgba(255,255,255,0.46)] transition-colors group-hover:text-[#c084fc]">
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 컴포넌트와 사용처 ── */}
        <Reveal className="mt-[48px] w-full">
          <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[rgba(255,255,255,0.46)]">
            컴포넌트와 사용처
          </div>

          <div className="hidden overflow-hidden rounded-md border border-white/10 bg-[#0f0a1a] shadow-lg sm:grid sm:grid-cols-[1.2fr_1.5fr_1.5fr_1fr]">
            {["컴포넌트", "받는 것", "안 받는 것", "사용처"].map((h, i) => (
              <div
                key={h}
                className={`border-b border-white/10 bg-[#130d1c] px-4 py-3 font-mono text-[12px] font-bold ${
                  i > 0 ? "border-l" : ""
                } ${i === 0 || i === 3 ? "text-[#c084fc]" : "text-white/70"}`}
              >
                {h}
              </div>
            ))}
            {TABLE.map((row, r) => {
              const last = r === TABLE.length - 1;
              const edge = last ? "" : "border-b border-white/10";
              return [
                <div
                  key={`${row.name}-n`}
                  className={`px-4 py-3 font-mono text-[12px] text-white/80 ${edge}`}
                >
                  {row.name}
                </div>,
                <div
                  key={`${row.name}-t`}
                  className={`border-l border-white/10 px-4 py-3 font-mono text-[12px] text-white/70 ${edge}`}
                >
                  {row.takes}
                </div>,
                <div
                  key={`${row.name}-r`}
                  className={`border-l border-white/10 px-4 py-3 font-mono text-[12px] text-[rgba(255,255,255,0.55)] ${edge}`}
                >
                  ✕ {row.rejects}
                </div>,
                <div
                  key={`${row.name}-u`}
                  className={`border-l border-white/10 px-4 py-3 font-mono text-[12px] text-[#c084fc] ${edge}`}
                >
                  {row.used}
                </div>
              ];
            })}
          </div>

          <div className="flex flex-col gap-3 sm:hidden">
            {TABLE.map(row => (
              <div
                key={row.name}
                className="rounded-md border border-white/10 bg-[#0f0a1a] p-4"
              >
                <div className="mb-2 font-mono text-[12px] font-bold text-[#c084fc]">
                  {row.name}
                </div>
                <div className="font-mono text-[11px] text-white/70">
                  받는 것: {row.takes}
                </div>
                <div className="mt-1 font-mono text-[11px] text-[rgba(255,255,255,0.55)]">
                  ✕ 안 받는 것: {row.rejects}
                </div>
                <div className="mt-2 font-mono text-[11px] text-[#c084fc]">
                  사용처: {row.used}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-[800px] text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
            규칙은 하나였다. 컴포넌트는 자기가 그릴 값만 받고,{" "}
            <strong className="font-bold text-[#d8b4fe]">
              그 값이 어디서 왔는지는 모른다
            </strong>
            . StatusBar가 지원 로직을 알기 시작하면 관리자 화면에서는 못 쓴다.
          </p>
        </Reveal>

        <Reveal className="mt-[40px] w-full">
          <CodeWindow
            file="ClubCard.tsx"
            footer={
              "// 카드가 라우터를 알기 시작하면, 라우터가 없는 화면에서는 못 쓴다"
            }
            className="shadow-xl"
          >
            <HlLine>
              <Kw>type</Kw> ClubCardVm = {"{"} name: <Kw>string</Kw>; intro:{" "}
              <Kw>string</Kw>; coverUrl: <Kw>string</Kw>; category:{" "}
              <Kw>string</Kw>; tags: <Kw>string</Kw>[]; recruiting:{" "}
              <Kw>boolean</Kw>; deadline: <Kw>string</Kw>; {"}"};
            </HlLine>
            <HlLine>
              <Kw>type</Kw> Variant = <Str>&quot;list&quot;</Str> |{" "}
              <Str>&quot;detail&quot;</Str> | <Str>&quot;mypage&quot;</Str> |{" "}
              <Str>&quot;admin&quot;</Str>;
            </HlLine>
            <Kw>interface</Kw>
            {" Props { vm: ClubCardVm; variant: Variant; onSelect?: () => "}
            <Kw>void</Kw>
            {"; }\n\n"}
            <span style={{color: "#7a5f8a"}}>
              {
                "// 카드가 라우터를 알기 시작하면, 라우터가 없는 화면에서는 못 쓴다"
              }
            </span>
            {"\n"}
            <Kw>export function</Kw>
            {" ClubCard({ vm, variant, onSelect }: Props) {\n  "}
            <Kw>const</Kw>
            {" size = variant === "}
            <Str>&quot;detail&quot;</Str>
            {" ? "}
            <Str>&quot;lg&quot;</Str>
            {" : "}
            <Str>&quot;sm&quot;</Str>
            {";\n\n  "}
            <Kw>return</Kw>
            {" (\n"}
            {"    <article className={cardVariants(variant)}>\n"}
            {"      <CategoryBar category={vm.category} />\n"}
            {
              "      <CoverImage src={vm.coverUrl} alt={vm.name} size={size} />\n"
            }
            {
              "      <ClubHeading name={vm.name} intro={vm.intro} size={size} onClick={onSelect} />\n"
            }
            {"      {variant !== "}
            <Str>&quot;admin&quot;</Str>
            {" && <TagRow tags={vm.tags} />}\n"}
            {
              "      <StatusBar recruiting={vm.recruiting} deadline={vm.deadline} />\n"
            }
            {"    </article>\n  );\n}"}
          </CodeWindow>
        </Reveal>

        <Reveal className="mt-6 w-full max-w-[800px]">
          <p className="text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
            variant를 4개까지 늘린 건 사실{" "}
            <strong className="font-bold text-[#fbbf24]">
              아슬아슬한 선택이었다
            </strong>
            . 여기서 하나만 더 늘었으면 컴포넌트를 쪼개야 했을 것이다. 지금
            구조는 「4개까지는 괜찮다」는 판단이지, 무한히 늘려도 된다는 뜻은
            아니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
