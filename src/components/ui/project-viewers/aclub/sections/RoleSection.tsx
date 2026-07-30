"use client";

import {useEffect, useRef, useState} from "react";
import {useAClub} from "../context";
import {Kicker, NoteBox, Reveal, RevealWords, useInViewOnce} from "../parts";

type Role = "student" | "admin";

const SUBLINES: Record<Role, string> = {
  student: "동아리를 찾고 지원하는 화면입니다",
  admin: "모집을 관리하고 지원자를 확인하는 화면입니다",
};

const COUNTS: Record<Role, string> = {student: "표시 항목 8", admin: "표시 항목 17"};

const COMPARISON = [
  {item: "동아리 정보", student: "읽기", admin: "읽기 · 수정"},
  {item: "모집 공고", student: "읽기", admin: "작성 · 수정 · 마감"},
  {item: "지원자 목록", student: "본인 것만", admin: "전체"},
  {item: "통계", student: "없음", admin: "지원자 수 · 상태별 집계"},
  {item: "네비게이션", student: "상단 탭", admin: "좌측 사이드바"},
];

const APPLICANTS = [
  {name: "지원자 A", date: "3월 12일", status: "검토중", color: "#fbbf24"},
  {name: "지원자 B", date: "3월 10일", status: "합격", color: "#4ade80"},
  {name: "지원자 C", date: "3월 8일", status: "보류", color: "#f87171"},
];

export function RoleSection() {
  const {reducedMotion, announce} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({threshold: 0.1});
  const {ref: cardRef, inView: cardInView} = useInViewOnce<HTMLDivElement>({threshold: 0.5});

  const [role, setRole] = useState<Role>("student");
  const [interacted, setInteracted] = useState(false);
  const [autoCaption, setAutoCaption] = useState(false);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  function pick(next: Role, byUser = true) {
    if (byUser) setInteracted(true);
    if (next === role) return;
    setRole(next);
    announce(next === "student" ? "학생 화면입니다" : "운영진 화면입니다");
  }

  // 자동 시연 — 사용자가 먼저 만지면 취소된다.
  useEffect(() => {
    if (!cardInView || reducedMotion || interacted) return;
    const t1 = window.setTimeout(() => {
      if (interacted) return;
      setAutoCaption(true);
      pick("admin", false);
      const t2 = window.setTimeout(() => {
        if (interacted) return;
        pick("student", false);
        setAutoCaption(false);
      }, 2200);
      timers.current.push(t2);
    }, 1800);
    timers.current.push(t1);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardInView, reducedMotion, interacted]);

  const isAdmin = role === "admin";

  return (
    <section
      ref={sectionRef}
      id="ac-sec-role"
      data-ac-section
      className="relative z-10 w-full border-t border-[rgba(192,132,252,0.1)] pt-[120px]"
    >
      <div className="mx-auto flex max-w-[1080px] flex-col items-center px-6 pb-[120px]">
        <div className="mb-6 w-full">
          <Kicker>05 · 역할 분리</Kicker>
          <RevealWords
            text="학생에게는 포스터, 운영진에게는 서류"
            className="mt-4 text-[28px] font-black leading-tight text-[rgba(255,255,255,0.88)]"
          />
          <p
            className="mt-5 max-w-[740px] text-[16px] leading-9 text-[rgba(255,255,255,0.88)] transition-opacity duration-700"
            style={{opacity: inView ? 1 : 0}}
          >
            같은 동아리 데이터인데 보는 사람에 따라 필요한 게 완전히 다르다. 학생은 「어떤 동아리인지」를 보고, 운영진은
            「몇 명이 지원했는지」를 본다. 두 화면을{" "}
            <strong className="font-bold text-[#d8b4fe]">억지로 하나로 합치지 않기로 했다</strong>.
          </p>
        </div>

        {/* ── 역할 선택 ── */}
        <Reveal className="mt-8 flex w-full flex-col items-center">
          <div
            className="relative inline-flex rounded-md border border-[rgba(192,132,252,0.22)] bg-[#0f0a1a] p-1"
            role="radiogroup"
            aria-label="역할 선택"
          >
            <div
              className="absolute top-1 h-[calc(100%-8px)] rounded bg-[rgba(192,132,252,0.14)] transition-all duration-300"
              style={{left: isAdmin ? "50%" : "4px", width: "calc(50% - 4px)", transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)"}}
            />
            {(["student", "admin"] as Role[]).map((r, i) => (
              <button
                key={r}
                ref={(el) => void (radios.current[i] = el)}
                type="button"
                role="radio"
                aria-checked={role === r}
                tabIndex={role === r ? 0 : -1}
                onClick={() => pick(r)}
                onKeyDown={(e) => {
                  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
                    e.preventDefault();
                    const other = i === 0 ? 1 : 0;
                    pick(other === 0 ? "student" : "admin");
                    radios.current[other]?.focus();
                  }
                }}
                className="relative z-10 rounded px-6 py-2 font-mono text-[12px] outline-none transition-colors"
                style={{color: role === r ? "#c084fc" : "rgba(255,255,255,0.46)"}}
              >
                {r === "student" ? "학생" : "운영진"}
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-[rgba(255,255,255,0.46)] transition-all duration-300">
            {SUBLINES[role]}
          </p>
        </Reveal>

        {/* ── 같은 데이터, 다른 카드 ── */}
        <Reveal className="mt-10 w-full max-w-[700px]">
          <div className="mb-2 flex justify-end">
            <span className="font-mono text-[10px] text-[rgba(255,255,255,0.46)]">{COUNTS[role]}</span>
          </div>
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] bg-[#170f26] p-7 transition-[height] duration-500"
            style={{
              perspective: "1200px",
              height: isAdmin ? 360 : 360,
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              className="relative h-full w-full transition-transform duration-[600ms]"
              style={{
                transformStyle: "preserve-3d",
                transform: isAdmin ? "rotateY(180deg)" : "rotateY(0deg)",
                transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* 학생: 포스터 */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{backfaceVisibility: "hidden"}}
                aria-hidden={isAdmin}
              >
                <div className="flex w-[260px] flex-col overflow-hidden rounded-md border border-white/5 bg-[#0f0a1a]">
                  <div className="h-1 bg-[#f472b6]" />
                  <div className="flex h-[120px] items-center justify-center bg-[#170f26]">
                    <span className="font-mono text-[11px] text-white/30">[IMG-SLOT]</span>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <h3 className="text-[18px] font-black text-[rgba(255,255,255,0.88)]">빛그림 사진회</h3>
                    <span className="w-fit font-mono text-[10px] text-[#f472b6]">예술</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["신입생 환영", "주말 활동 없음"].map((t) => (
                        <span key={t} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/60">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-[12px] leading-6 text-white/60">필름 카메라로 한 학기에 한 번 전시를 엽니다</p>
                    <span className="font-mono text-[10px] tabular-nums text-[#4ade80]">모집중 · D-6</span>
                    <button
                      type="button"
                      className="mt-1 w-full rounded bg-[#c084fc] py-2 text-[13px] font-bold text-[#0f0a1a] transition-colors hover:bg-[#d8b4fe]"
                      tabIndex={isAdmin ? -1 : 0}
                    >
                      지원하기
                    </button>
                  </div>
                </div>
              </div>

              {/* 운영진: 서류 */}
              <div
                className="absolute inset-0"
                style={{backfaceVisibility: "hidden", transform: "rotateY(180deg)"}}
                aria-hidden={!isAdmin}
              >
                <div className="flex h-full w-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[15px] font-black text-[rgba(255,255,255,0.88)]">빛그림 사진회</h3>
                      <span className="rounded border border-[#f472b6]/20 bg-[#f472b6]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#f472b6]">
                        예술
                      </span>
                    </div>
                    <div className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-white/60">
                      모집중 ▾
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      {v: "12", l: "지원자", c: "rgba(255,255,255,0.88)"},
                      {v: "5", l: "미확인", c: "rgba(255,255,255,0.88)"},
                      {v: "4", l: "합격", c: "#4ade80"},
                      {v: "20", l: "정원", c: "rgba(255,255,255,0.88)"},
                    ].map((s) => (
                      <div key={s.l} className="rounded border border-white/5 bg-[#0f0a1a] p-3">
                        <div className="font-mono text-[20px] font-black tabular-nums" style={{color: s.c}}>
                          {s.v}
                        </div>
                        <div className="mt-1 font-mono text-[9px] text-[rgba(255,255,255,0.46)]">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded border border-white/5 bg-[#0f0a1a]">
                    <div className="border-b border-white/5 px-3 py-2 font-mono text-[9px] uppercase text-[rgba(255,255,255,0.46)]">
                      지원자 미리보기
                    </div>
                    <div className="flex flex-col">
                      {APPLICANTS.map((a, i) => (
                        <div
                          key={a.name}
                          className={`flex items-center justify-between px-3 py-2 ${
                            i < APPLICANTS.length - 1 ? "border-b border-white/5" : ""
                          }`}
                        >
                          <span className="font-mono text-[11px] text-white/70">{a.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-[rgba(255,255,255,0.46)]">{a.date}</span>
                            <span
                              className="rounded px-1.5 py-0.5 font-mono text-[9px]"
                              style={{color: a.color, background: `${a.color}1a`, border: `1px solid ${a.color}33`}}
                            >
                              {a.status}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2" aria-hidden="true">
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/60">
                      공고 수정
                    </span>
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/60">
                      지원자 전체보기
                    </span>
                    <span className="rounded border border-[#f87171]/20 bg-[#f87171]/10 px-3 py-1.5 font-mono text-[11px] text-[#f87171]">
                      모집 마감
                    </span>
                  </div>
                  <p className="font-mono text-[9px] text-white/35">지원자 정보는 예시 표시입니다</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── 두 화면 와이어프레임 ── */}
        <Reveal className="mt-12 w-full">
          <div className="flex flex-col gap-[18px] lg:flex-row">
            <div
              className="flex-1 overflow-hidden rounded-md border bg-[#170f26] transition-all duration-[350ms]"
              style={{
                aspectRatio: "16 / 10",
                opacity: isAdmin ? 0.45 : 1,
                borderColor: isAdmin ? "rgba(192,132,252,0.18)" : "rgba(192,132,252,0.40)",
                boxShadow: isAdmin ? "none" : "0 0 20px rgba(192,132,252,0.10)",
              }}
            >
              <div className="flex h-[26px] items-center border-b border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] px-3">
                <span className="font-mono text-[9px] text-[rgba(255,255,255,0.46)]">학생 화면</span>
              </div>
              <div className="flex h-[calc(100%-26px)] flex-col gap-3 p-4">
                <div className="flex gap-2">
                  <div className="h-7 flex-1 rounded border border-white/10 bg-white/5" />
                  <div className="h-7 w-20 rounded border border-white/10 bg-white/5" />
                </div>
                <div className="grid flex-1 grid-cols-3 gap-2">
                  {Array.from({length: 6}, (_, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded border border-white/5 bg-white/5 p-2">
                      <div className="aspect-[4/3] rounded border border-white/5 bg-[#170f26]" />
                      <div className="h-3 w-3/4 rounded bg-white/10" />
                      <div className="h-2 w-1/2 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="flex-1 overflow-hidden rounded-md border bg-[#170f26] transition-all duration-[350ms]"
              style={{
                aspectRatio: "16 / 10",
                opacity: isAdmin ? 1 : 0.45,
                borderColor: isAdmin ? "rgba(192,132,252,0.40)" : "rgba(192,132,252,0.18)",
                boxShadow: isAdmin ? "0 0 20px rgba(192,132,252,0.10)" : "none",
              }}
            >
              <div className="flex h-[26px] items-center border-b border-[rgba(192,132,252,0.18)] bg-[#0f0a1a] px-3">
                <span className="font-mono text-[9px] text-[rgba(255,255,255,0.46)]">운영진 화면</span>
              </div>
              <div className="flex h-[calc(100%-26px)] gap-3 p-4">
                <div className="flex w-24 shrink-0 flex-col gap-2 rounded border border-white/5 bg-[#0f0a1a] p-2">
                  <div className="h-2 w-full rounded bg-[#c084fc]/20" />
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-2 w-full rounded bg-white/5" />
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded border border-white/5 bg-[#0f0a1a]" />
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 rounded border border-white/5 bg-[#0f0a1a] p-2">
                    <div className="h-3 w-full rounded bg-white/10" />
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-3 w-full rounded bg-white/5" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p
            className="mt-2 text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity duration-300"
            style={{opacity: autoCaption ? 1 : 0}}
          >
            자동 시연
          </p>

          {/* ── 권한 비교표 ── */}
          <div className="mt-8 w-full">
            <div className="hidden grid-cols-3 overflow-hidden rounded-md border border-[rgba(255,255,255,0.08)] sm:grid">
              {["항목", "학생", "운영진"].map((h, i) => (
                <div
                  key={h}
                  className={`border-b border-[rgba(255,255,255,0.08)] bg-[#0f0a1a] px-4 py-3 font-mono text-[12px] ${
                    i > 0 ? "border-l" : ""
                  } ${i === 1 ? "text-[rgba(255,255,255,0.70)]" : "text-[#c084fc]"}`}
                >
                  {h}
                </div>
              ))}
              {COMPARISON.map((row, r) => {
                const last = r === COMPARISON.length - 1;
                return [
                  <div
                    key={`${row.item}-i`}
                    className={`px-4 py-[13px] font-mono text-[12px] text-white/70 ${last ? "" : "border-b border-[rgba(255,255,255,0.08)]"}`}
                  >
                    {row.item}
                  </div>,
                  <div
                    key={`${row.item}-s`}
                    className={`border-l border-[rgba(255,255,255,0.08)] px-4 py-[13px] font-mono text-[12px] text-[rgba(255,255,255,0.70)] ${
                      last ? "" : "border-b"
                    }`}
                  >
                    {row.student}
                  </div>,
                  <div
                    key={`${row.item}-a`}
                    className={`border-l border-[rgba(255,255,255,0.08)] px-4 py-[13px] font-mono text-[12px] text-[#c084fc] ${
                      last ? "" : "border-b"
                    }`}
                  >
                    {row.admin}
                  </div>,
                ];
              })}
            </div>

            <div className="flex flex-col gap-3 sm:hidden">
              {COMPARISON.map((row) => (
                <div key={row.item} className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f0a1a] p-4">
                  <div className="mb-2 font-mono text-[12px] text-[#c084fc]">{row.item}</div>
                  <div className="flex justify-between font-mono text-[12px] text-white/70">
                    <span>학생</span>
                    <span>{row.student}</span>
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[12px] text-[#c084fc]">
                    <span>운영진</span>
                    <span>{row.admin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-11 w-full">
          <NoteBox label="분명히 해둘 것" tone="warn">
            <p className="text-[15px] leading-8 text-[rgba(255,255,255,0.88)]">
              <strong className="font-bold text-[#fbbf24]">화면 분리이지 권한 제어가 아니다.</strong> 백엔드가 없으니
              프론트에서 역할에 따라 다른 화면을 그리는 데까지만 했다. 실제로는 서버가 요청마다 권한을 확인해야 하고,
              프론트의 분기는 그걸 대신할 수 없다. 이 차이를 모르고 만든 게 아니라, 알면서 여기서 멈춘 것이다.
            </p>
          </NoteBox>
        </Reveal>

        <Reveal className="mt-8 w-full">
          <div className="flex flex-col gap-[14px] sm:flex-row">
            {["[IMG-05] · 16:10", "[IMG-06] · 16:10"].map((slot) => (
              <div
                key={slot}
                className="ac-media-grid flex flex-1 items-center justify-center overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)]"
                style={{aspectRatio: "16 / 10"}}
              >
                <span className="font-mono text-[12px] text-[rgba(255,255,255,0.3)]">{slot}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-[14px] sm:flex-row">
            <p className="flex-1 px-3 py-2 font-mono text-[11px] text-[rgba(255,255,255,0.48)]">실제 학생 화면</p>
            <p className="flex-1 px-3 py-2 font-mono text-[11px] text-[rgba(255,255,255,0.48)]">실제 관리자 화면</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
