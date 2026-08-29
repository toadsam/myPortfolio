"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  EquipSlot,
  Heading,
  Kicker,
  MetaCell,
  Page,
  StatRow,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 01 — 히어로 · 장비 슬롯
//
// 개발 실체: 프로젝트 정체 + 배포 주소 · GitHub · 시연 영상 · 담당 범위
// 연출 장치: 링크가 **버튼 줄이 아니라 캐릭터 시트의 장비 슬롯**에 장착된 아이템
//
// 스펙은 슬롯 3칸(영상·저장소·범위)이지만 PDF 6쪽에 **실제 배포 주소**가 있어
// 4칸으로 늘렸다. 링크를 버튼 줄로 늘어놓지 않는다는 규칙은 그대로다.

const STEPS = [0, 400, 800, 1000, 1450, 1900, 2300, 2800, 3400];
const IDX = {
  sheet: 0,
  stats: 1,
  kicker: 2,
  line1: 3,
  line2: 4,
  summary: 5,
  chips: 6,
  equip: 7,
  hint: 8
};

// PDF 6쪽 「링크」 원문
// 배포 주소(muscle-up.click)는 응답이 없어 링크로 걸지 않는다 — 아래 EquipSlot 참고.
const REPO = "https://github.com/toadsam/Ajou_MuscleUp";
const VIDEO = "https://www.youtube.com/watch?v=y6pbAoxveQM";

// PDF 6쪽 「기술 스택」 원문
const STATS = [
  {label: "기술 스택", value: "5", pct: 100},
  {label: "핵심 기능", value: "4", pct: 100},
  {label: "인증 방식", value: "2", pct: 100},
  {label: "담당 범위", value: "전 구간", pct: 100}
];

// PDF 8·9쪽 「핵심 기능 1/2·2/2」에서 그대로 뽑은 것. 지어낸 기능은 없다.
// 「Refresh 로테이션」은 뺐다 — 2026-04-01 에 걷어내서 지금 코드에 없다(P03 참고).
// 대신 그 자리를 실제로 돌고 있는 것(재발급 단일화)으로 채웠다.
const CHIPS = [
  "JWT 이중 쿠키",
  "재발급 단일화 (single-flight)",
  "이메일 인증 (SMTP)",
  "Google OAuth2",
  "AI 4주 루틴",
  "대화 히스토리 저장",
  "자랑글 · 댓글 · 좋아요",
  "권한 기반 접근 제어",
  "AWS 정적 배포"
];

export function P01Hero() {
  const {reducedMotion, lockScroll, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [video, setVideo] = useState(false);
  const [touched, setTouched] = useState(false);
  const videoRef = useRef(false);
  videoRef.current = video;

  const openVideo = useCallback(() => {
    setVideo(true);
    lockScroll(true);
    announce("시연 영상을 엽니다. Esc 로 닫습니다.");
  }, [lockScroll, announce]);

  const closeVideo = useCallback(() => {
    setVideo(prev => {
      if (prev) lockScroll(false);
      return false;
    });
  }, [lockScroll]);

  useEffect(() => {
    if (!video) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      closeVideo();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [video, closeVideo]);

  useEffect(
    () => () => {
      if (videoRef.current) lockScroll(false);
    },
    [lockScroll]
  );

  return (
    <Page index={1} innerRef={ref} maxWidth="1120px" className="!pt-[120px]">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[46%_1fr]">
        {/* ── 캐릭터 시트 ── */}
        <div
          className={`rounded-lg p-[22px] sm:p-[26px] ${
            on[IDX.sheet] && !instant ? "mu-sheetin" : ""
          }`}
          style={{
            background: "var(--mu-panel)",
            border: "1px solid rgba(244,114,182,0.24)",
            opacity: on[IDX.sheet] ? 1 : 0
          }}
        >
          <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--mu-muted)]">
            CHARACTER SHEET
          </div>

          <div
            className="mt-4 text-[26px] font-black sm:text-[30px]"
            style={{color: "var(--mu-primary)"}}
          >
            득근득근
          </div>
          <div className="mt-1 font-mono text-[12px] text-[var(--mu-muted)]">
            MuscleUp · 풀스택 · 1인 개발
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            {STATS.map((s, i) => (
              <StatRow
                key={s.label}
                label={s.label}
                value={s.value}
                pct={s.pct}
                on={on[IDX.stats]}
                delay={i * 100}
                instant={instant}
              />
            ))}
          </div>

          <div
            className="mt-6 pt-6"
            style={{borderTop: "1px solid rgba(244,114,182,0.14)"}}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* href 를 뺐다 — muscle-up.click 은 현재 응답이 없다(2026-08-28).
                  주소는 그대로 보여 주되 누르면 죽은 페이지가 뜨는 링크는 만들지
                  않는다. resume.ts 와 P11Result 도 같은 이유로 링크를 뺐다. */}
              <EquipSlot
                slotLabel="배포"
                caption="muscle-up.click (일시 중단)"
                equipped={on[IDX.equip]}
                delay={0}
                instant={instant}
                note="muted"
              >
                <span
                  className="text-[22px]"
                  style={{color: "var(--mu-primary)"}}
                  aria-hidden="true"
                >
                  ◉
                </span>
              </EquipSlot>

              <EquipSlot
                slotLabel="영상"
                caption="시연 영상"
                onClick={openVideo}
                equipped={on[IDX.equip]}
                delay={160}
                instant={instant}
              >
                <span
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full"
                  style={{border: "1px solid rgba(244,114,182,0.45)"}}
                  aria-hidden="true"
                >
                  <span
                    className="text-[18px] leading-none"
                    style={{color: "var(--mu-primary)"}}
                  >
                    ▶
                  </span>
                </span>
              </EquipSlot>

              <EquipSlot
                slotLabel="저장소"
                caption="React + Spring Boot"
                href={REPO}
                equipped={on[IDX.equip]}
                delay={320}
                instant={instant}
                note="muted"
              >
                <span
                  className="font-mono text-[22px]"
                  style={{color: "rgba(255,255,255,0.78)"}}
                  aria-hidden="true"
                >
                  &lt; &gt;
                </span>
              </EquipSlot>

              <EquipSlot
                slotLabel="범위"
                caption="기획 · UI · API · 인증 · 배포"
                equipped={on[IDX.equip]}
                delay={480}
                instant={instant}
                note="muted"
              >
                <span
                  className="flex flex-col items-center gap-0.5 font-mono text-[10px]"
                  style={{color: "rgba(255,255,255,0.60)"}}
                  aria-hidden="true"
                >
                  <span>기획</span>
                  <span>프론트</span>
                  <span>백엔드</span>
                </span>
              </EquipSlot>
            </div>

            <p
              className="mt-4 text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)]"
              style={{
                opacity: on[IDX.hint] && !touched ? 1 : 0,
                transition: instant ? "none" : "opacity 0.4s var(--mu-ease)"
              }}
              onMouseEnter={() => setTouched(true)}
              onFocus={() => setTouched(true)}
            >
              슬롯을 눌러보세요
            </p>
          </div>
        </div>

        {/* ── 오른쪽 ── */}
        <div>
          <Kicker on={on[IDX.kicker]} instant={instant}>
            풀스택 · AI 피트니스 커뮤니티 실서비스
          </Kicker>

          <div className="mt-4">
            <Heading
              text="흩어진 기록은"
              on={on[IDX.line1]}
              instant={instant}
              className="text-[26px] font-black leading-tight sm:text-[40px]"
            />
            <div className="mt-2.5">
              <Heading
                text="루틴이 되지 않는다"
                on={on[IDX.line2]}
                instant={instant}
                className="text-[26px] font-black leading-tight sm:text-[40px]"
                color="var(--mu-primary)"
              />
            </div>
          </div>

          <div className="mt-6" style={rise(on[IDX.summary], instant)}>
            <Body>
              운동 기록과 커뮤니티와 AI 코치를{" "}
              <strong style={{color: "var(--mu-accent)"}}>
                하나의 실서비스 흐름
              </strong>
              으로 묶었습니다. 인증·보안·배포·운영까지 직접 맡아 실제로 쓸 수
              있는 상태까지 올린 1인 풀스택 프로젝트입니다.
            </Body>
          </div>

          {/* 하드 팩트 — 전부 PDF 6쪽 원문 */}
          <div
            className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
            style={rise(on[IDX.summary], instant)}
          >
            <MetaCell value="2025.09 –" label="진행 중" />
            <MetaCell value="1인" label="개인 개발" />
            {/* DB 는 프로파일마다 다르다 — 로컬 MySQL, 운영 PostgreSQL. */}
            <MetaCell value="Spring Boot" label="React · MySQL / PostgreSQL" />
            {/* RDS 는 1.0 때 쓰다 주석 처리된 옛 로컬 설정에만 남아 있다 —
                운영 DB 는 PostgreSQL 이다(P09Infra 와 같은 사실). */}
            <MetaCell value="AWS" label="S3 · CloudFront" />
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] transition-colors duration-200 sm:text-[11px] ${
                  on[IDX.chips] && !instant ? "mu-pop" : ""
                }`}
                style={{
                  border: "1px solid rgba(244,114,182,0.24)",
                  color: "rgba(255,255,255,0.75)",
                  opacity: on[IDX.chips] ? 1 : 0,
                  animationDelay: `${i * 60}ms`
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 시연 영상 라이트박스 */}
      {video ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
          style={{
            background: "rgba(12,3,10,0.93)",
            backdropFilter: "blur(8px)"
          }}
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label="득근득근 시연 영상"
        >
          <div
            className="w-full max-w-[1000px] overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--mu-border)",
              background: "var(--mu-panel)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{aspectRatio: "16 / 9"}}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/y6pbAoxveQM"
                title="득근득근 시연 영상"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                style={{border: 0}}
              />
            </div>
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{borderTop: "1px solid rgba(244,114,182,0.12)"}}
            >
              <a
                href={VIDEO}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[12px] text-[var(--mu-muted)] transition-colors hover:text-white"
              >
                YouTube 에서 보기 ↗
              </a>
              <button
                type="button"
                onClick={closeVideo}
                className="font-mono text-[12px] text-[var(--mu-accent)] transition-colors hover:text-white"
              >
                닫기 (Esc)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Page>
  );
}
