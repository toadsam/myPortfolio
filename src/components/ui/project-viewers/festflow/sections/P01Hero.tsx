"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Heading,
  Kicker,
  Page,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 01 — 히어로 · 관제 벽 (모니터 6대)
//
// 개발 실체: 프로젝트 정체 + 시연 영상 · GitHub 저장소 · 배포 주소
// 연출 장치: 링크가 버튼이 아니라 **관제 벽에 걸린 모니터** — 나머지는 실제 지표
//
// 지표 4개는 전부 실측이다:
//   169명 / 424건 / 36건 — 발표자료 27장 「실제 축제 적용 사례」
//   183 커밋 — GitHub 저장소 main 브랜치

const STEPS = [0, 400, 800, 1100, 1500, 1900, 2400];
const IDX = {wall: 0, kicker: 1, line1: 2, line2: 3, summary: 4, chips: 5, tiles: 6};

const REPO = "https://github.com/toadsam/FestFlow";
const VIDEO = "https://www.youtube.com/watch?v=-RomuYp93TQ";
const DEPLOY = "https://fest-flow-smoky.vercel.app";

// 발표자료 5장 「차별점 — 핵심 3 + 보강 3」 원문
const CHIPS = [
  "SW 기반 혼잡도 추정",
  "AI 혼잡도 예측",
  "근거 기반 AI 챗봇",
  "대학 축제 특화 설계",
  "분산형 운영 관리",
  "예약 / QR 체크인"
];

type Tile =
  | {kind: "link"; label: string; value: string; sub: string; href: string; icon: string}
  | {kind: "stat"; label: string; value: string; sub: string; tone: string};

const TILES: Tile[] = [
  {
    kind: "link",
    label: "MON A",
    value: "▶",
    sub: "시연 영상",
    href: VIDEO,
    icon: "video"
  },
  {
    kind: "link",
    label: "MON B",
    value: "< >",
    sub: "GitHub · 183 커밋",
    href: REPO,
    icon: "code"
  },
  {
    kind: "stat",
    label: "MON C",
    value: "169",
    sub: "AI Match 등록자",
    tone: "var(--ff-live)"
  },
  {
    kind: "stat",
    label: "MON D",
    value: "424",
    sub: "매칭 신청 건수",
    tone: "var(--ff-primary)"
  },
  {
    kind: "stat",
    label: "MON E",
    value: "36",
    sub: "성사된 매칭",
    tone: "var(--ff-accent)"
  },
  {
    kind: "link",
    label: "MON F",
    value: "◉",
    sub: "배포 주소",
    href: DEPLOY,
    icon: "deploy"
  }
];

export function P01Hero() {
  const {reducedMotion, lockScroll, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [video, setVideo] = useState(false);
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
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_46%]">
        {/* ── 왼쪽: 글 ── */}
        <div>
          <Kicker on={on[IDX.kicker]} instant={instant}>
            1인 개발 · 현장 검증을 마친 축제 통합 운영 플랫폼
          </Kicker>

          <div className="mt-4">
            <Heading
              text="내가 안 보고 있어도"
              on={on[IDX.line1]}
              instant={instant}
              className="text-[26px] font-black leading-tight sm:text-[40px]"
            />
            <div className="mt-2.5">
              <Heading
                text="상태는 계속 바뀝니다"
                on={on[IDX.line2]}
                instant={instant}
                className="text-[26px] font-black leading-tight sm:text-[40px]"
                color="var(--ff-primary)"
              />
            </div>
          </div>

          <div className="mt-6" style={rise(on[IDX.summary], instant)}>
            <Body>
              부스 수십 개가 동시에 열리고 닫히고 품절되는데, 운영자는 그걸
              새로고침으로 알 수 없습니다. Fest-A 는 방문객 · 부스 운영자 ·
              스태프 · 관리자를{" "}
              <strong style={{color: "var(--ff-accent)"}}>
                하나의 플랫폼
              </strong>
              으로 묶고, 상태 변경을 <strong>SSE 로 즉시</strong> 흘려보냅니다.
              그리고 <strong>30분 뒤 혼잡도</strong>를 예측합니다.
            </Body>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] transition-colors duration-200 sm:text-[11px] ${
                  on[IDX.chips] && !instant ? "ff-pop" : ""
                }`}
                style={{
                  border: "1px solid rgba(251,191,36,0.22)",
                  color: "rgba(255,255,255,0.75)",
                  opacity: on[IDX.chips] ? 1 : 0,
                  animationDelay: `${i * 60}ms`
                }}
              >
                {c}
              </span>
            ))}
          </div>

          <p
            className="mt-6 font-mono text-[11px] leading-5 text-[var(--ff-faint)]"
            style={rise(on[IDX.chips], instant)}
          >
            2026.03.04 – 06.10 · 2주 단위 7개 스프린트 · React + Vite PWA /
            Spring Boot / PostgreSQL
          </p>
        </div>

        {/* ── 오른쪽: 관제 벽 ── */}
        <div
          className={`rounded-lg p-[16px] sm:p-[20px] ${
            on[IDX.wall] && !instant ? "ff-pop" : ""
          }`}
          style={{
            background: "var(--ff-panel)",
            border: "1px solid rgba(251,191,36,0.24)",
            opacity: on[IDX.wall] ? 1 : 0
          }}
        >
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="font-mono text-[10px] tracking-[0.24em] text-[var(--ff-muted)]">
              CONTROL WALL
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`block h-[6px] w-[6px] rounded-full ${
                  instant ? "" : "ff-pulse"
                }`}
                style={{background: "var(--ff-live)"}}
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] text-[var(--ff-live)]">
                6 / 6 정상
              </span>
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {TILES.map((t, i) => {
              const body = (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--ff-faint)]">
                      {t.label}
                    </span>
                    <span
                      className="block h-[5px] w-[5px] rounded-full"
                      style={{
                        background:
                          t.kind === "stat" ? t.tone : "var(--ff-primary)"
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className="mt-2 font-mono text-[22px] font-black leading-none tabular-nums sm:text-[26px]"
                    style={{
                      color: t.kind === "stat" ? t.tone : "var(--ff-primary)"
                    }}
                  >
                    {t.value}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] leading-4 text-[var(--ff-muted)]">
                    {t.sub}
                  </div>
                </>
              );

              const boxStyle = {
                border: "1px solid rgba(251,191,36,0.20)",
                background: "rgba(0,0,0,0.28)",
                opacity: on[IDX.tiles] ? 1 : 0,
                animationDelay: `${i * 90}ms`
              };
              const cls = `ff-grid relative flex min-h-[104px] flex-col rounded-md p-3 ${
                on[IDX.tiles] && !instant ? "ff-signal" : ""
              }`;

              if (t.kind === "stat") {
                return (
                  <div key={t.label} className={cls} style={boxStyle}>
                    {body}
                  </div>
                );
              }
              if (t.icon === "video") {
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={openVideo}
                    className={`${cls} cursor-pointer text-left transition-[border-color,transform] duration-200 hover:-translate-y-[2px] hover:border-[rgba(251,191,36,0.6)]`}
                    style={boxStyle}
                    aria-label="시연 영상 열기"
                  >
                    {body}
                  </button>
                );
              }
              return (
                <a
                  key={t.label}
                  href={t.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${cls} cursor-pointer transition-[border-color,transform] duration-200 hover:-translate-y-[2px] hover:border-[rgba(251,191,36,0.6)]`}
                  style={boxStyle}
                >
                  {body}
                </a>
              );
            })}
          </div>

          <p className="mt-3 px-1 font-mono text-[10px] leading-4 text-[var(--ff-faint)]">
            C·D·E 는 실제 축제 1일 운영에서 나온 값입니다 (발표자료 27장).
            모니터를 눌러 보세요.
          </p>
        </div>
      </div>

      {/* 시연 영상 라이트박스 */}
      {video ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
          style={{background: "rgba(10,7,2,0.94)", backdropFilter: "blur(8px)"}}
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label="Fest-A 시연 영상"
        >
          <div
            className="w-full max-w-[1000px] overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--ff-border)",
              background: "var(--ff-panel)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{aspectRatio: "16 / 9"}}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/-RomuYp93TQ"
                title="Fest-A 시연 영상"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                style={{border: 0}}
              />
            </div>
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{borderTop: "1px solid rgba(251,191,36,0.12)"}}
            >
              <a
                href={VIDEO}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[12px] text-[var(--ff-muted)] transition-colors hover:text-white"
              >
                YouTube 에서 보기 ↗
              </a>
              <button
                type="button"
                onClick={closeVideo}
                className="font-mono text-[12px] text-[var(--ff-accent)] transition-colors hover:text-white"
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
