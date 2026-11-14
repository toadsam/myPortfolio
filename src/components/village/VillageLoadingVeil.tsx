"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {villageBuildings} from "@/lib/constants";

// 2026-11-14: 나눔명조·Space Mono 를 따로 받던 것을 뺐다. 마을 HUD 가 어두운 판 +
// 굵은 고딕 + 인디고로 바뀌면서(globals.css 「마을 UI 토큰」) 이 화면만 금테 액자에
// 명조로 남아 있었다. 글꼴은 루트 레이아웃이 이미 싣는 Inter + Noto Sans KR 을 쓴다.
// 로딩 화면이 글꼴 두 벌을 더 받지 않아도 된다.

/**
 * 마을 입장 화면 — 두 겹이다. 시안의 구조를 그대로 옮겼다.
 *
 *   아래층  VillageTitleCard  … 계속 깔려 있는 타이틀
 *   위층    VillageLoadingVeil … 청사진 판. 다 지어지면 페이드아웃하며 아래를 드러낸다.
 *
 * 2026-11-14 부터 모양은 금테 액자·명조가 아니라 HUD 와 같은 둥근 어두운 판이다.
 * 두 겹 구조, 건물이 하나씩 켜지는 청사진, 「두둥」 박자는 그대로 두고 색·서체·테두리만
 * 바꿨다. 아래 "시안" 은 8월의 금테 시안을 가리키는 옛 설명이다.
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

// 마을 HUD 토큰(globals.css)과 같은 값. 이 화면은 dynamic 경계 위에서도 뜨므로
// 변수 대신 값으로 든다. 이름은 옛 것을 그대로 뒀다(lantern = 켜진 건물, gold = 옅은 글자).
const C = {
  night: "#0a0c14",
  nightVeil: "rgba(10, 12, 20, 0.96)",
  panel: "#12141d",
  lantern: "#8b85f0",
  accent: "#4f46e5",
  gold: "#c3c0f7",
  wood: "rgba(255, 255, 255, 0.1)",
  moon: "#ffffff",
  sub: "#b4bac6",
  border: "rgba(255, 255, 255, 0.1)"
};

// 루트 레이아웃이 싣는 본문 글꼴 그대로.
const SANS_STACK =
  "var(--font-inter), var(--font-body-kr), ui-sans-serif, system-ui, sans-serif";
const EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// 청사진 좌표계는 시안과 같은 320 정사각. 다만 px 대신 % 로 환산해 둔다 —
// 그래야 좁은 화면에서 통째로 줄어든다(px 로 박으면 360px 기기에서 액자를 뚫는다).
const BOX = 320;
const pct = (v: number) => (v / BOX) * 100;

// 명패 전용 규칙 — 이 화면에서만 쓰여서 globals.css 에 두지 않았다.
const ENTRY_CSS = `

/* 화면 전체가 버튼이라 어디에 올려도 명패가 반응해야 "여기 눌러도 되는구나"가 된다. */
[data-village-enter]:hover [data-village-enter-plaque],
[data-village-enter]:focus-visible [data-village-enter-plaque] {
  background: #4338ca !important;
}
[data-village-enter]:active [data-village-enter-plaque] {
  transform: scale(0.94) !important;
  animation: none !important;
}

@keyframes villageEnterPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.35);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 14px 44px rgba(79, 70, 229, 0.65);
  }
}
`;

// 시안의 세 겹 고리 배치 — 개수·반지름·각도 오프셋 그대로.
const RINGS = [
  {count: 6, radius: 60},
  {count: 10, radius: 105},
  {count: 11, radius: 145}
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
 * "들어갔다" 신호
 *
 * 마을은 막 뒤에서 이미 살고 있었다. 루미가 달려오는 연출도, 순찰·사교·마주침
 * 루프도 마운트 즉시 돌았어서, 막이 10~20초 떠 있는 동안 **다 끝나 있었다.**
 * 관람객이 들어오면 루미는 이미 도착해 있고, 달려오는 장면은 아무도 못 봤다.
 *
 * 그래서 「들어가기」를 누를 때까지 마을을 재워 둔다. 로딩 중 헛수고도 그만큼 준다.
 * (씨의 state 로 두지 않는 이유는 villageReadySignal 주석 참고 — 같은 이유다.)
 * ──────────────────────────────────────────────────────────────────────── */

const enteredSignal = {done: false, subs: new Set<() => void>()};

export function markVillageEntered() {
  if (enteredSignal.done) return;
  enteredSignal.done = true;
  for (const fn of enteredSignal.subs) fn();
}

/** 베일이 처음 뜼 때 불러 준다 — 마을을 다시 들어오면 처음부터다. */
export function resetVillageEntry() {
  enteredSignal.done = false;
}

export function useVillageEntered() {
  const [entered, setEntered] = useState(enteredSignal.done);
  useEffect(() => {
    if (enteredSignal.done) {
      setEntered(true);
      return;
    }
    const fn = () => setEntered(true);
    enteredSignal.subs.add(fn);
    return () => {
      enteredSignal.subs.delete(fn);
    };
  }, []);
  return entered;
}

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

  // 「두둥」 — 글씨가 확 떠올랐다가 서서히 잦아든다.
  //   0 숨음 → 1 진하게 떠오름(0.9) → 2 시안의 흐린 상태(0.2)로 가라앉음
  // 시작을 450ms 미루는 이유: 액자가 1.2초에 걸쳐 투명해지는 중이라, 바로 띄우면
  // 정작 제일 진한 순간이 액자에 가려 안 보인다. 액자가 걷히는 결에 맞춰 피어난다.
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (!revealed) {
      setBeat(0);
      return;
    }
    if (reduced) {
      setBeat(2);
      return;
    }
    const rise = window.setTimeout(() => setBeat(1), 450);
    const settle = window.setTimeout(() => setBeat(2), 1900);
    return () => {
      window.clearTimeout(rise);
      window.clearTimeout(settle);
    };
  }, [revealed, reduced]);

  return (
    <>
      <style>{ENTRY_CSS}</style>
      <button
        ref={ref}
        type="button"
        data-village-enter=""
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
          fontFamily: SANS_STACK,
          color: C.moon,
          pointerEvents: revealed && !fading ? "auto" : "none",
          transition: reduced
            ? "none"
            : "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: fading ? 0 : 1
        }}
      >
        {/* 가라앉은 뒤엔 흐리게 남아 아래의 「눌러서 들어가기」에 눈이 가게 한다.
            금색 시절엔 0.2 였는데 흰 글씨는 그만큼 흐리면 꺼진 화면처럼 보여 0.4 로 올렸다. */}
        <div
          style={{
            opacity: beat === 0 ? 0 : beat === 1 ? 1 : 0.4,
            transform: beat === 0 ? "scale(1.05)" : "scale(1)",
            transition: reduced
              ? "none"
              : beat === 2
              ? "opacity 1.6s ease-in-out, transform 1.6s ease-in-out"
              : "opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.3s cubic-bezier(0.16, 1, 0.3, 1)",
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
              fontSize: "clamp(38px, 8.6vw, 72px)",
              // 벌어져 있다가 제자리로 모인다 — 「두둥」의 무게는 여기서 나온다.
              letterSpacing: beat === 0 ? "0.06em" : "-0.04em",
              fontWeight: 900,
              lineHeight: 1.05,
              transition: reduced
                ? "none"
                : "letter-spacing 1.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            Developer&apos;s City
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(15px, 2.4vw, 20px)",
              fontWeight: 700,
              color: C.gold,
              // 제목보다 반 박자 늦게 따라온다.
              opacity: beat === 0 ? 0 : 1,
              transition: reduced ? "none" : "opacity 1.1s ease 0.35s"
            }}
          >
            A 3D Interactive Experience
          </p>
        </div>

        {/* 시안엔 없지만 필요하다 — 20% 짜리 글씨만 두면 **꺼진 화면**으로 보인다.
          글씨 한 줄로는 부족했다. 숨쉬듯 커졌다 작아지는 명패라야 "여기 눌러도
          된다"가 읽힌다. 화면 전체가 버튼이므로 이건 표지판일 뿐 —
          pointerEvents 를 꺼서 클릭은 부모가 받는다(중첩 버튼도 안 된다). */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "13%",
            // 두둥이 가라앉기 전엔 자리만 비워 둔다.
            opacity: beat === 2 ? 1 : 0,
            transition: reduced ? "none" : "opacity 1s ease 0.4s",
            pointerEvents: "none"
          }}
        >
          <span
            data-village-enter-plaque=""
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              height: 58,
              padding: "0 34px",
              borderRadius: 99,
              background: C.accent,
              fontFamily: SANS_STACK,
              fontSize: 17,
              fontWeight: 800,
              color: "#ffffff",
              // 심장박동. reduced 면 가만히 있는 대신 또렷하게 둔다.
              animation:
                reduced || beat !== 2
                  ? "none"
                  : "villageEnterPulse 2.2s ease-in-out infinite",
              transition: `background 0.25s ease, transform 0.45s ${EASE_POP}`
            }}
          >
            눌러서 들어가기
            <span aria-hidden="true" style={{fontSize: 18, lineHeight: 1}}>
              →
            </span>
          </span>
        </span>
      </button>
    </>
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

  return (
    <div
      role="status"
      aria-live="polite"
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
      {/* 타이틀 없이 이 액자만 뜨는 자리(dynamic 폴백)도 있어서 여기도 넣는다. */}
      <style>{ENTRY_CSS}</style>

      {/* 판 — HUD 의 큰 판(.v-frame--grand)과 같은 모양. 금테와 꺾쇠는 뺐다. */}
      <div style={{position: "relative", fontFamily: SANS_STACK}}>
        <div
          style={{
            background: C.panel,
            borderRadius: 36,
            boxShadow: `inset 0 0 0 1px ${C.border}, 0 30px 80px rgba(0,0,0,0.55)`,
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
              fontSize: "clamp(26px, 5.6vw, 38px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: C.moon
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
                opacity: 0.35,
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
                    borderRadius: 4,
                    boxShadow: on
                      ? `0 0 16px rgba(139, 133, 240, 0.85), inset 0 0 0 1px rgba(255,255,255,0.55)`
                      : "none",
                    opacity: on ? 1 : 0.9,
                    // 켜질 때 살짝 넘쳤다가 앉는다(/resume 과 같은 튕김 곡선)
                    transform: on
                      ? `rotate(${s.rot.toFixed(2)}deg) scale(1.15)`
                      : `rotate(${s.rot.toFixed(2)}deg) scale(0.9)`,
                    transition: reduced
                      ? "none"
                      : `opacity 0.5s ease, background-color 0.5s ease, box-shadow 0.6s ease, transform 0.7s ${EASE_POP}`
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12
            }}
          >
            {/* 진행 막대 — 숫자만 있을 때보다 "차오른다"가 먼저 읽힌다 */}
            <div
              aria-hidden="true"
              style={{
                width: "min(260px, 100%)",
                height: 8,
                borderRadius: 99,
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${clamped}%`,
                  height: "100%",
                  borderRadius: 99,
                  background: C.accent,
                  transition: reduced
                    ? "none"
                    : "width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)"
                }}
              />
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.sub,
                fontVariantNumeric: "tabular-nums"
              }}
            >
              건물 {built} / {total} 세움 ·{" "}
              <span style={{color: C.moon}}>{shownPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
