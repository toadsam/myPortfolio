"use client";

import {motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {AmbientVariant} from "./atmosphere";
import {sound} from "./sound";

// 몰입 사운드 음소거 토글 — 자동재생 정책 때문에 사용자가 직접 켜는 방식.
export function SoundToggle({theme, variant}: {theme: ProjectTheme; variant: AmbientVariant}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (sound) {
      sound.setMood(variant);
      setOn(sound.enabled);
      if (sound.enabled) sound.setEnabled(true); // 무드 반영하며 재개
    }
  }, [variant]);

  const toggle = () => {
    if (!sound) return;
    const next = !sound.enabled;
    sound.setEnabled(next);
    setOn(next);
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      className="fixed right-6 top-16 z-[70] flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[11px] font-black backdrop-blur"
      style={{borderColor: `${theme.primary}55`, color: on ? theme.primary : "rgba(255,255,255,0.5)", background: "rgba(0,0,0,0.4)"}}
      initial={{opacity: 0, y: -8}}
      animate={on ? {opacity: 1, y: 0} : {opacity: 1, y: 0, boxShadow: [`0 0 0 0 ${theme.primary}00`, `0 0 0 6px ${theme.primary}00`]}}
      transition={{duration: 0.3}}
      whileHover={{scale: 1.05}}
      whileTap={{scale: 0.95}}
      title={on ? "사운드 끄기" : "몰입 사운드 켜기"}
    >
      {on ? (
        <>
          <span className="relative flex h-2 w-2">
            <motion.span className="absolute inline-flex h-full w-full rounded-full" style={{background: theme.primary}} animate={{scale: [1, 2.2], opacity: [0.6, 0]}} transition={{duration: 1.4, repeat: Infinity}} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{background: theme.primary}} />
          </span>
          SOUND ON
        </>
      ) : (
        <>🔇 SOUND</>
      )}
    </motion.button>
  );
}
