"use client";

/**
 * 항해 — 마을에서 갓생 섬으로 건너가는 사이.
 *
 * ## 이 연출의 정체는 '로딩 화면'이다
 *
 * 마을과 섬은 **진짜 다른 페이지**다(`/` → `/island`). 앱 안에서 상태만 바꾸는
 * 게 아니라 통째로 넘어가므로, 마을이 쥐고 있던 Three.js 메모리와 30 MB 짜리
 * GLB 가 전부 해제된다. 그 전환에는 어차피 빈 시간이 생긴다.
 *
 * 그 시간을 가리지 않고 **항해로 쓴다.** 연출과 최적화가 같은 방향을 본다 —
 * 부드럽게 보이려고 라우터로 넘기면 마을 메모리가 안 풀리고, 그러면 섬이
 * 가벼워야 할 이유가 통째로 사라진다.
 *
 * ## 왜 setTimeout 뒤에 이동하나
 *
 * 클릭 즉시 `location.href` 를 바꾸면 브라우저가 곧바로 페이지를 버려서 이
 * 오버레이가 한 프레임도 안 보인다. 그래서 먼저 덮고, 배가 미끄러지는 동안
 * 이동한다. 시간은 짧게 잡았다 — 매일 지나갈 길목이라 길면 그게 곧 마찰이다.
 */

import {motion} from "framer-motion";
import {useEffect} from "react";

/** 배가 미끄러지는 시간. 매일 보는 화면이라 1.4초를 넘기지 않는다. */
const VOYAGE_MS = 1400;

export function VoyageOverlay({href}: {href: string}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = href;
    }, VOYAGE_MS);
    return () => window.clearTimeout(timer);
  }, [href]);

  return (
    <motion.div
      animate={{opacity: 1}}
      className="fixed inset-0 z-[200] grid place-items-center overflow-hidden"
      initial={{opacity: 0}}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 20%, #16263c 0%, #0b1626 55%, #050b14 100%)"
      }}
      transition={{duration: 0.35}}
    >
      {/* 물결 — 가로줄 몇 개가 지나가는 것만으로 '건너간다'가 읽힌다 */}
      {[0, 1, 2, 3].map(i => (
        <motion.span
          animate={{x: ["-30%", "30%"]}}
          className="pointer-events-none absolute h-px w-[140%]"
          key={i}
          style={{
            top: `${52 + i * 5}%`,
            background:
              "linear-gradient(90deg, transparent, rgb(var(--v-moon)/0.35), transparent)"
          }}
          transition={{
            duration: 2.2 + i * 0.4,
            ease: "linear",
            repeat: Infinity
          }}
        />
      ))}

      <div className="relative text-center">
        {/* 배 한 척 — 왼쪽에서 들어와 오른쪽으로 빠진다 */}
        <motion.span
          animate={{x: 90, y: [0, -4, 0]}}
          className="mx-auto block"
          initial={{x: -90}}
          transition={{
            x: {duration: VOYAGE_MS / 1000, ease: "easeInOut"},
            y: {duration: 1.1, repeat: Infinity, ease: "easeInOut"}
          }}
        >
          <Boat />
        </motion.span>

        <motion.p
          animate={{opacity: 1}}
          className="v-serif mt-5 text-lg text-[rgb(var(--v-gold))]"
          initial={{opacity: 0}}
          transition={{delay: 0.25, duration: 0.5}}
        >
          갓생 섬으로 건너갑니다
        </motion.p>
        <p className="mt-1.5 text-xs text-[rgb(var(--v-moon)/0.6)]">
          마을을 내려놓는 중…
        </p>
      </div>
    </motion.div>
  );
}

/** 작은 돛단배. 아이콘 하나를 위해 라이브러리를 들이지 않는다(마을 문장 규칙). */
function Boat() {
  return (
    <svg fill="none" height="52" viewBox="0 0 64 52" width="64">
      <path
        d="M10 38h44l-5 8H15l-5-8z"
        fill="rgb(var(--v-wood))"
        stroke="rgb(var(--v-gold))"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path d="M32 36V6" stroke="rgb(var(--v-gold))" strokeWidth="1.6" />
      <path
        d="M32 9l14 20H32V9z"
        fill="rgb(var(--v-lantern)/0.25)"
        stroke="rgb(var(--v-lantern))"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M30 12L18 29h12V12z"
        fill="rgb(var(--v-gold)/0.16)"
        stroke="rgb(var(--v-gold))"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
