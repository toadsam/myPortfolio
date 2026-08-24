"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  EquipSlot,
  Heading,
  Kicker,
  MetaCell,
  Page,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 01 — 히어로 · 캐비닛 옆면 스티커
//
// 개발 실체: 프로젝트 정체 + GitHub · 플레이 영상 · 개발 범위 (PDF 27쪽 링크/역할)
// 연출 장치: 링크가 **버튼 줄이 아니라 캐비닛 옆면에 붙은 스티커 3장**

const STEPS = [0, 400, 800, 1000, 1450, 1900, 2300, 2800, 3400];
const IDX = {
  cabinet: 0,
  stats: 1,
  kicker: 2,
  line1: 3,
  line2: 4,
  summary: 5,
  chips: 6,
  stickers: 7,
  hint: 8
};

// PDF 27쪽 「링크」 원문
const REPO = "https://github.com/toadsam/Ajou_IndiGame";
const VIDEO = "https://www.youtube.com/watch?v=mtIiIWmrSdg";

// PDF 27쪽 「핵심 기능」 원문
const CHIPS = [
  "시점 전환 (1인칭 ↔ 탑다운)",
  "랜덤 스킬 선택",
  "NavMesh 몬스터 AI",
  "보스 패턴 AI",
  "인벤토리 · 장착",
  "캐릭터 선택",
  "돌발 퀘스트",
  "포탈 씬 전환"
];

export function P01Hero() {
  const {reducedMotion, lockScroll, announce} = useAjou();
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
    announce("플레이 영상을 엽니다. Esc 로 닫습니다.");
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
        {/* ── 캐비닛 ── */}
        <div
          className={`rounded-lg p-[18px] sm:p-[22px] ${
            on[IDX.cabinet] && !instant ? "aj-pop" : ""
          }`}
          style={{
            background: "var(--aj-panel)",
            border: "2px solid rgba(163,230,53,0.26)",
            opacity: on[IDX.cabinet] ? 1 : 0
          }}
        >
          {/* 마키 */}
          <div
            className="rounded px-3 py-2 text-center"
            style={{
              background: "rgba(163,230,53,0.10)",
              border: "1px solid rgba(163,230,53,0.24)"
            }}
          >
            <span
              className="font-mono text-[11px] tracking-[0.26em]"
              style={{color: "var(--aj-primary)"}}
            >
              AJOU INDIE GAME
            </span>
          </div>

          {/* CRT — 실제 게임 시작 화면 */}
          <div
            className="aj-crtglow relative mt-3 overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              aspectRatio: "1029 / 565"
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/projects/ajou-adventure/title.webp"
              alt="아주대탐험 게임 시작 화면"
              width={1029}
              height={565}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="aj-scan absolute inset-0" aria-hidden="true" />
          </div>

          {/* 옆면 스티커 3장 */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <EquipSlot
              slotLabel="저장소"
              caption="Unity · C#"
              href={REPO}
              equipped={on[IDX.stickers]}
              delay={0}
              instant={instant}
              note="muted"
            >
              <span
                className="font-mono text-[20px]"
                style={{color: "rgba(255,255,255,0.78)"}}
                aria-hidden="true"
              >
                &lt; &gt;
              </span>
            </EquipSlot>

            <EquipSlot
              slotLabel="영상"
              caption="플레이 영상"
              onClick={openVideo}
              equipped={on[IDX.stickers]}
              delay={170}
              instant={instant}
            >
              <span
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full"
                style={{border: "1px solid rgba(163,230,53,0.45)"}}
                aria-hidden="true"
              >
                <span
                  className="text-[17px] leading-none"
                  style={{color: "var(--aj-primary)"}}
                >
                  ▶
                </span>
              </span>
            </EquipSlot>

            <EquipSlot
              slotLabel="범위"
              caption="시스템 · UI · AI · 전투 · 성장"
              equipped={on[IDX.stickers]}
              delay={340}
              instant={instant}
              note="muted"
            >
              <span
                className="flex flex-col items-center gap-0.5 font-mono text-[10px]"
                style={{color: "rgba(255,255,255,0.60)"}}
                aria-hidden="true"
              >
                <span>기획</span>
                <span>시스템</span>
                <span>1인</span>
              </span>
            </EquipSlot>
          </div>

          <p
            className="mt-3 text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)]"
            style={{
              opacity: on[IDX.hint] && !touched ? 1 : 0,
              transition: instant ? "none" : "opacity 0.4s var(--aj-ease)"
            }}
            onMouseEnter={() => setTouched(true)}
            onFocus={() => setTouched(true)}
          >
            스티커를 눌러보세요
          </p>
        </div>

        {/* ── 오른쪽 ── */}
        <div>
          <Kicker on={on[IDX.kicker]} instant={instant}>
            Unity · 캠퍼스 액션 어드벤처 · 1인 개발
          </Kicker>

          <div className="mt-4">
            <Heading
              text="기능을 붙이는 게 아니라"
              on={on[IDX.line1]}
              instant={instant}
              className="text-[26px] font-black leading-tight sm:text-[40px]"
            />
            <div className="mt-2.5">
              <Heading
                text="구조를 만들었습니다"
                on={on[IDX.line2]}
                instant={instant}
                className="text-[26px] font-black leading-tight sm:text-[40px]"
                color="var(--aj-primary)"
              />
            </div>
          </div>

          <div className="mt-6" style={rise(on[IDX.summary], instant)}>
            <Body>
              아주대학교 캠퍼스가 무대이고, 마스코트{" "}
              <strong style={{color: "var(--aj-accent)"}}>치토</strong>가 졸업을
              목표로 성장합니다. 건물마다 전투 · 미션 · 퍼즐 테마가 다르고,
              건물에 들어가면 시점이 탑다운으로 바뀝니다. 최종 보스는{" "}
              <strong>졸업</strong>입니다.
            </Body>
          </div>

          {/* 하드 팩트 — 전부 PDF 27쪽 원문 */}
          <div
            className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
            style={rise(on[IDX.summary], instant)}
          >
            <MetaCell value="2024.08" label="– 2024.12" />
            <MetaCell value="1인" label="개인 개발" />
            <MetaCell value="Unity" label="C#" />
            <MetaCell value="4" label="핵심 시스템" />
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] transition-colors duration-200 sm:text-[11px] ${
                  on[IDX.chips] && !instant ? "aj-pop" : ""
                }`}
                style={{
                  border: "1px solid rgba(163,230,53,0.22)",
                  color: "rgba(255,255,255,0.75)",
                  opacity: on[IDX.chips] ? 1 : 0,
                  animationDelay: `${i * 60}ms`
                }}
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <Shot
              src="/projects/ajou-adventure/chito.webp"
              alt="아주대 마스코트 치토"
              caption="주인공 — 아주대 마스코트 치토"
              w={323}
              h={439}
            />
            <Shot
              src="/projects/ajou-adventure/wonchon.webp"
              alt="아주대학교 원천관"
              caption="무대 — 실제 캠퍼스 건물이 그대로 스테이지"
              w={400}
              h={162}
            />
          </div>
        </div>
      </div>

      {/* 플레이 영상 라이트박스 */}
      {video ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
          style={{background: "rgba(6,10,3,0.94)", backdropFilter: "blur(8px)"}}
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label="아주대탐험 플레이 영상"
        >
          <div
            className="w-full max-w-[1000px] overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--aj-border)",
              background: "var(--aj-panel)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{aspectRatio: "16 / 9"}}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/mtIiIWmrSdg"
                title="아주대탐험 플레이 영상"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                style={{border: 0}}
              />
            </div>
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{borderTop: "1px solid rgba(163,230,53,0.12)"}}
            >
              <a
                href={VIDEO}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[12px] text-[var(--aj-muted)] transition-colors hover:text-white"
              >
                YouTube 에서 보기 ↗
              </a>
              <button
                type="button"
                onClick={closeVideo}
                className="font-mono text-[12px] text-[var(--aj-accent)] transition-colors hover:text-white"
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
