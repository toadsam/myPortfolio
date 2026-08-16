"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring
} from "framer-motion";
import {useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// DarkLab 시그니처 — 커서가 손전등이 되어 어둠 속에 숨은 내용을 비춰야 보이는 1인칭 공포 연출.
export function DarkLabReveal({theme}: {theme: ProjectTheme}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useSpring(useMotionValue(280), {stiffness: 350, damping: 30});
  const my = useSpring(useMotionValue(150), {stiffness: 350, damping: 30});
  const [lit, setLit] = useState(false);

  const mask = useMotionTemplate`radial-gradient(circle 130px at ${mx}px ${my}px, #000 0%, #000 26%, rgba(0,0,0,0.35) 55%, transparent 78%)`;

  return (
    <DemoFrame
      theme={theme}
      label="DARKLAB"
      tag="FLASHLIGHT"
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          🔦 마우스를 움직여{" "}
          <span style={{color: theme.primary}}>어둠 속을 비춰보세요</span> —
          1인칭 탐색의 긴장감을 그대로.
        </p>
      }
    >
      <div
        ref={ref}
        className="relative h-[300px] w-full overflow-hidden rounded-xl border"
        style={{
          borderColor: `${theme.primary}22`,
          background: "#05060a",
          cursor: "none"
        }}
        onMouseMove={e => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
          setLit(true);
        }}
        onMouseLeave={() => setLit(false)}
      >
        {/* 숨겨진 씬 — 손전등 마스크 안에서만 보임 */}
        <motion.div
          className="absolute inset-0"
          style={{WebkitMaskImage: mask, maskImage: mask}}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 40%, #161a24, #07080d 80%)"
            }}
          />
          {/* 실험실 오브젝트들 */}
          <div
            className="absolute left-[12%] top-[22%] font-mono text-[13px] font-bold"
            style={{color: theme.accent}}
          >
            ⚠ SECTOR 7 — 격리 구역
          </div>
          <div
            className="absolute left-[16%] top-[44%] h-20 w-28 rounded border"
            style={{
              borderColor: `${theme.primary}55`,
              background: `${theme.primary}0c`
            }}
          >
            <span className="absolute bottom-1 left-1 font-mono text-[9px] text-white/40">
              실험체 보관함
            </span>
          </div>
          <div className="absolute right-[18%] top-[30%] font-mono text-[11px] leading-5 text-white/55">
            출입 기록: 03:14 AM
            <br />
            마지막 접속자: 미상
            <br />
            상태: <span style={{color: "#f87171"}}>연결 끊김</span>
          </div>
          <div className="absolute bottom-[14%] right-[24%] text-3xl">🩸</div>
          <div className="absolute bottom-[12%] left-[40%] font-mono text-[10px] text-white/30">
            “여기서 나가야 해...”
          </div>
          <div className="absolute left-[8%] bottom-[16%] text-2xl">🔬</div>
        </motion.div>

        {/* 손전등 테두리 글로우 */}
        <motion.div
          className="pointer-events-none absolute h-[260px] w-[260px] rounded-full"
          style={{
            left: mx,
            top: my,
            x: "-50%",
            y: "-50%",
            background: `radial-gradient(circle, ${theme.primary}10 0%, transparent 60%)`,
            opacity: lit ? 1 : 0
          }}
        />

        {/* 안내 (비추기 전) */}
        {!lit ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.p
              className="font-mono text-sm font-bold text-white/35"
              animate={{opacity: [0.25, 0.6, 0.25]}}
              transition={{duration: 2, repeat: Infinity}}
            >
              🔦 마우스로 어둠을 비춰보세요
            </motion.p>
          </div>
        ) : null}
      </div>
    </DemoFrame>
  );
}
