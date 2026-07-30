"use client";

import {useEffect, useRef, useState} from "react";
import {useDarkLab} from "../context";

// 4초 안에 "왜 만들었나"를 읽히는 게 이 페이지의 유일한 목적이다.
const MOTIVATION =
  "공포 게임에서 제일 어려운 건 무서운 걸 만드는 게 아니라, 아무것도 없는 방을 무섭게 만드는 일이었다. 그게 궁금해서 만들었다.";

export function EntrySection() {
  const {reducedMotion} = useDarkLab();
  const [showMouseHint, setShowMouseHint] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const moved = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setShowScrollHint(true);
      return;
    }

    function onMove() {
      moved.current = true;
      setShowMouseHint(false);
    }

    const t1 = window.setTimeout(() => {
      if (!moved.current) setShowMouseHint(true);
    }, 1200);
    const t2 = window.setTimeout(() => setShowScrollHint(true), 4200);
    window.addEventListener("mousemove", onMove);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reducedMotion]);

  return (
    <section
      id="dl-sec-1"
      data-dl-section
      className="relative flex h-screen w-full flex-col items-center justify-center px-4"
    >
      {reducedMotion ? (
        <p className="absolute top-[70px] z-10 px-4 text-center font-mono text-[12px] text-[rgba(255,255,255,0.42)]">
          이 페이지는 원래 손전등으로 탐색하는 화면입니다. 동작 줄이기 설정이 켜져 있어 밝은 상태로 보여드립니다.
        </p>
      ) : null}

      <div className="absolute left-1/2 top-1/2 z-10 flex w-full -translate-x-1/2 -translate-y-[120px] flex-col items-center text-center">
        <h1 className="text-[44px] font-black leading-none tracking-[-0.02em] md:text-[72px]">DarkLab</h1>
        <h2 className="mt-4 font-mono text-[13px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.42)] md:text-[15px]">
          1인칭 공포 어드벤처 · Unity
        </h2>
      </div>

      <p className="absolute left-1/2 top-1/2 z-10 mt-4 w-full max-w-[520px] -translate-x-1/2 break-keep px-4 text-center text-[16px] leading-9 md:text-[17px]">
        {MOTIVATION.split(" ").map((word, i) => (
          <span key={i} className="dl-word mr-1">
            {word}{" "}
          </span>
        ))}
      </p>

      <div
        className="absolute top-[68vh] z-10 font-mono text-[13px] tracking-[0.15em] text-[rgba(255,255,255,0.42)] transition-opacity duration-[1400ms]"
        style={{opacity: showMouseHint ? 1 : 0}}
        aria-hidden="true"
      >
        [ 마우스를 움직이세요 ]
      </div>

      <div
        className="dl-pulse-slow absolute top-[88vh] z-10 font-mono text-[13px] text-[rgba(255,255,255,0.42)] transition-opacity duration-[1400ms]"
        style={{opacity: showScrollHint ? 1 : 0}}
        aria-hidden="true"
      >
        ↓ 아래로
      </div>
    </section>
  );
}
