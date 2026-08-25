"use client";

import {useEffect, useMemo, useRef, type CSSProperties} from "react";
import {Nanum_Myeongjo, Space_Mono} from "next/font/google";
import {villageBuildings} from "@/lib/constants";

// 시안 그대로의 서체. preload 는 끈다 — 한글 명조는 유니코드 구간별로 수십 조각이라
// 미리 받으면 로딩 화면이 로딩을 늦춘다(layout.tsx 의 고운바탕 주석 참고).
const loaderSerif = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  preload: false,
  variable: "--vl-serif"
});

const loaderMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--vl-mono"
});

/**
 * 마을 입장 화면 — 두 겹이다. 시안의 구조를 그대로 옮겼다.
 *
 *   아래층  VillageTitleCard  … 계속 깔려 있는 타이틀
 *   위층    VillageLoadingVeil … 청사진 액자. 다 지어지면 페이드아웃하며 아래를 드러낸다.
 *
 * 시안에서 타이틀 div 가 오버레이 **뒤에** 깔려 있다가 오버레이가 사라지면 드러나는
 * 그 구조다. 액자 안에서 내용을 갈아끼우는 게 아니다.
 *
 * **색은 시안 값 그대로 쓰되 전역에 풀지 않는다.** 시안의 `:root` 는 --v-gold /
 * --v-night 처럼 이 프로젝트가 이미 쓰는 이름을 다른 값으로 다시 정의한다.
 * 그대로 넣으면 `var(--v-*)` 를 참조하는 215곳(HUD 패널·간판·버튼 전부)이 같이
 * 바뀐다. 그래서 여기서는 모듈 상수로만 들고 있는다.
 *
 * **이 파일이 따로 있는 이유.** 예전엔 로딩 화면이 두 개였다:
 *   1. AIPortfolioVillage 의 dynamic(loading:) 폴백 — 사이안 사이버펑크 화면
 *   2. VillageScene 안의 로딩 베일
 * VillageScene 은 dynamic import 라 청크가 늦게 온다. 실측하니
 *   495ms 사이안 화면 → 1497ms 다른 화면 → 2513ms 사라짐
 * 처럼 **전혀 다르게 생긴 화면이 1초 만에 갈아치워져** 깜빡임으로 보였다.
 * 두 자리가 같은 컴포넌트를 쓰면 경계를 넘어도 화면이 안 바뀐다.
 *
 * three 를 import 하지 않는다 — 그래야 dynamic 경계 위쪽에서 써도 three 가
 * 딸려 오지 않는다. constants 는 타입만 three 를 참조하므로 안전하다.
 */

// 시안의 :root 값 — 그대로다.
const C = {
  night: "#040912",
  nightVeil: "rgba(4, 9, 18, 0.94)",
  lantern: "#ff9a3d",
  gold: "#c5a059",
  wood: "#3e2723",
  moon: "#fdfbd3",
  border: "rgba(197, 160, 89, 0.3)"
};

// 시안 body 의 서체 스택 그대로 — 타이틀은 시스템 세리프다.
const SERIF_STACK =
  'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

// 청사진 좌표계는 시안과 같은 320 정사각. 다만 px 대신 % 로 환산해 둔다 —
// 그래야 좁은 화면에서 통째로 줄어든다(px 로 박으면 360px 기기에서 액자를 뚫는다).
const BOX = 320;
const pct = (v: number) => (v / BOX) * 100;

// 시안의 세 겹 고리 배치 — 개수·반지름·각도 오프셋 그대로.
const RINGS = [
  {count: 6, radius: 60},
  {count: 10, radius: 105},
  {count: 11, radius: 145}
] as const;

/* ────────────────────────────────────────────────────────────────────────────
 * 아래층 — 타이틀
 * ────────────────────────────────────────────────────────────────────────── */

export function VillageTitleCard({
  revealed = false,
  fading = false,
  reduced = false,
  onEnter
}: {
  /** 위층 액자가 걷혀 이 화면이 실제로 보이는 상태. */
  revealed?: boolean;
  fading?: boolean;
  reduced?: boolean;
  onEnter?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // 액자가 걷히고 나서야 여기가 누를 곳이 된다. 그 전에 초점을 가져가면
  // 로딩 중인데 스크린리더가 「마을로 들어가기」를 먼저 읽어 버린다.
  useEffect(() => {
    if (revealed && !fading) ref.current?.focus();
  }, [revealed, fading]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onEnter}
      aria-label="마을로 들어가기"
      aria-hidden={revealed ? undefined : true}
      tabIndex={revealed ? 0 : -1}
      style={{
        position: "fixed",
        inset: 0,
        // 로딩 액자(300) 바로 아래 — 액자가 투명해지면서 이게 드러난다.
        zIndex: 299,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: C.night,
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        fontFamily: SERIF_STACK,
        color: C.gold,
        pointerEvents: revealed && !fading ? "auto" : "none",
        transition: reduced
          ? "none"
          : "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: fading ? 0 : 1
      }}
    >
      {/* 시안의 opacity-20 그대로 — 어둠 속에 잠긴 간판처럼 흐리게 뜬다. */}
      <div
        style={{
          opacity: 0.2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 24px"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(34px, 8vw, 60px)", // 시안 text-6xl
            textTransform: "uppercase",
            letterSpacing: "-0.05em", // tracking-tighter
            fontWeight: 700,
            lineHeight: 1.05
          }}
        >
          Developer&apos;s City
        </h1>
        <p
          style={{
            margin: "16px 0 0", // 시안 mt-4
            fontSize: "clamp(15px, 2.4vw, 20px)", // 시안 text-xl
            fontStyle: "italic"
          }}
        >
          A 3D Interactive Experience
        </p>
      </div>

      {/* 시안엔 없지만 필요하다 — 20% 짜리 글씨만 두면 멈춘 화면으로 보인다. */}
      <span
        style={{
          position: "absolute",
          bottom: "12%",
          fontFamily: "var(--vl-mono), ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: C.gold,
          opacity: 0.45
        }}
      >
        Click to enter
      </span>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 위층 — 청사진 액자
 * ────────────────────────────────────────────────────────────────────────── */

export function VillageLoadingVeil({
  progress,
  fading = false,
  reduced = false
}: {
  /** 0~100. 단조 증가해야 한다 — 뒤로 가면 세운 건물이 도로 꺼져 깜빡인다. */
  progress: number;
  fading?: boolean;
  reduced?: boolean;
}) {
  const total = villageBuildings.length;

  // 시안의 세 겹 고리 배치. 실제 마을 좌표가 아니라 **장식**이라 배치가 바뀌어도 그대로다.
  // 고리마다 각도를 0.5rad 씩 어긋내 살이 일렬로 서지 않게 한다(시안 그대로).
  const spots = useMemo(() => {
    const out: {left: number; top: number; rot: number}[] = [];
    RINGS.forEach((ring, ringIdx) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + ringIdx * 0.5;
        out.push({
          left: pct(BOX / 2 + Math.cos(angle) * ring.radius - 6),
          top: pct(BOX / 2 + Math.sin(angle) * ring.radius - 9),
          rot: (angle * 180) / Math.PI + 90
        });
      }
    });
    return out.slice(0, total);
  }, [total]);

  const clamped = Math.max(0, Math.min(100, progress));
  const built = Math.floor((clamped / 100) * total);
  const shownPct = Math.round(clamped);

  const cornerBase: CSSProperties = {
    position: "absolute",
    width: 20,
    height: 20,
    zIndex: 2,
    pointerEvents: "none"
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${loaderSerif.variable} ${loaderMono.variable}`}
      style={{
        position: "fixed",
        inset: 0,
        // 마을 쪽 집기가 생각보다 높은 데까지 있다 — 실측:
        //   VillageHud·Header·PerfHud z-30/40/52 · ConciergePanel z-55 ·
        //   색종이 z-100 · InteractionLayer·VoyageOverlay z-200 · 커서 z-99999.
        // 시안의 55 로 두면 ConciergePanel 과 동률이라 DOM 순서가 승부를 가른다.
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: C.nightVeil,
        // 막이 보이는 동안은 클릭을 막는다. 통과시키면 막에 가려 안 보이는
        // HUD 버튼(헤더·지도·제작 의뢰…)이 눌린다. 사라지는 동안만 통과시킨다.
        pointerEvents: fading ? "none" : "auto",
        transition: reduced
          ? "none"
          : "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: fading ? 0 : 1
      }}
    >
      {/* 액자 — 시안의 .v-frame.v-frame--grand */}
      <div
        style={{
          position: "relative",
          padding: 2,
          background: C.gold,
          border: `1px solid ${C.gold}`,
          outline: `4px solid ${C.night}`,
          outlineOffset: -8,
          boxShadow: "0 0 30px rgba(0,0,0,0.5)"
        }}
      >
        {/* 꺾쇠 둘 — 시안의 ::before / ::after */}
        <span
          aria-hidden="true"
          style={{
            ...cornerBase,
            top: -6,
            left: -6,
            borderTop: `2px solid ${C.gold}`,
            borderLeft: `2px solid ${C.gold}`
          }}
        />
        <span
          aria-hidden="true"
          style={{
            ...cornerBase,
            bottom: -6,
            right: -6,
            borderBottom: `2px solid ${C.gold}`,
            borderRight: `2px solid ${C.gold}`
          }}
        />

        <div
          style={{
            background: C.night,
            border: `1px solid ${C.border}`,
            // 시안은 4rem 5rem 고정인데, 그러면 액자가 화면보다 커져 1280×700
            // 노트북에서 위아래가 잘린다. 높이·너비에 묶어 줄인다.
            padding: "clamp(24px, 5vh, 64px) clamp(20px, 6vw, 80px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(20px, 3.6vh, 40px)"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--vl-serif), serif",
              fontSize: "clamp(24px, 5.4vw, 36px)", // 시안 2.25rem
              fontWeight: 500,
              letterSpacing: "0.15em",
              color: C.gold,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)"
            }}
          >
            마을을 짓는 중
          </h2>

          {/* 청사진 */}
          <div
            style={{
              position: "relative",
              width: "min(320px, 66vw, 36vh)",
              aspectRatio: "1"
            }}
          >
            {/* 광장 고리 — 시안은 keyframe 으로 돌린다. 여기서는 margin 으로 중심을
                잡아 회전 transform 과 부딪히지 않게 했다. */}
            <div
              aria-hidden="true"
              className={reduced ? undefined : "animate-spin"}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${pct(60)}%`,
                height: `${pct(60)}%`,
                marginLeft: `${-pct(60) / 2}%`,
                marginTop: `${-pct(60) / 2}%`,
                border: `1.5px dashed ${C.gold}`,
                borderRadius: "50%",
                opacity: 0.4,
                animationDuration: "20s"
              }}
            />

            {spots.map((s, i) => {
              const on = i < built;
              return (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: `${s.left}%`,
                    top: `${s.top}%`,
                    width: `${pct(12)}%`,
                    height: `${pct(18)}%`,
                    background: on ? C.lantern : C.wood,
                    border: on
                      ? `1px solid ${C.moon}`
                      : "1px solid rgba(197, 160, 89, 0.2)",
                    boxShadow: on
                      ? `0 0 15px ${C.lantern}, 0 0 5px ${C.moon}`
                      : "none",
                    opacity: on ? 1 : 0.6,
                    transform: on
                      ? `scale(1.1) rotate(${s.rot.toFixed(2)}deg)`
                      : `rotate(${s.rot.toFixed(2)}deg)`,
                    transition: reduced
                      ? "none"
                      : "opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.6s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              fontFamily: "var(--vl-mono), ui-monospace, monospace",
              fontSize: 14, // 시안 0.9rem
              letterSpacing: "0.1em",
              color: C.gold,
              opacity: 0.8,
              marginTop: 16,
              fontVariantNumeric: "tabular-nums"
            }}
          >
            건물 {built} / {total} 세움 · {shownPct}%
          </div>
        </div>
      </div>
    </div>
  );
}
