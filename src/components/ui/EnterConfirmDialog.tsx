"use client";

import {AnimatePresence, motion} from "framer-motion";
import {villageBuildings} from "@/lib/constants";

interface Props {
  buildingId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DISTRICT_ICONS: Record<string, string> = {
  plaza:      "🏛",
  projects:   "🔬",
  skills:     "⚙️",
  experience: "📚",
  contact:    "📮"
};

export function EnterConfirmDialog({buildingId, onConfirm, onCancel}: Props) {
  const building = buildingId ? villageBuildings.find((b) => b.id === buildingId) ?? null : null;
  const accent = building?.accentColor ?? "#00d4ff";
  const icon = building ? (DISTRICT_ICONS[building.district] ?? "🏠") : "🏠";

  return (
    <AnimatePresence>
      {building ? (
        <motion.div
          animate={{opacity: 1}}
          className="fixed inset-0 z-50 flex items-center justify-center"
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          transition={{duration: 0.2}}
        >
          {/* 배경 블러 */}
          <motion.div
            animate={{opacity: 1}}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            onClick={onCancel}
            transition={{duration: 0.2}}
          />

          {/* 다이얼로그 */}
          <motion.div
            animate={{opacity: 1, scale: 1, y: 0}}
            className="relative z-10 w-[360px] overflow-hidden rounded-2xl border bg-[#06101e] shadow-2xl"
            exit={{opacity: 0, scale: 0.88, y: 16}}
            initial={{opacity: 0, scale: 0.88, y: 16}}
            onClick={(e) => e.stopPropagation()}
            style={{borderColor: `${accent}35`}}
            transition={{type: "spring", stiffness: 420, damping: 28}}
          >
            {/* 상단 액센트 라인 */}
            <motion.div
              animate={{scaleX: 1}}
              className="h-[2px] w-full origin-left"
              initial={{scaleX: 0}}
              style={{background: `linear-gradient(to right, ${accent}, transparent)`}}
              transition={{duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
            />

            <div className="p-7">
              {/* 아이콘 + 레이블 */}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{scale: 1, rotate: 0}}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border bg-[#0a1525] text-2xl"
                  initial={{scale: 0.5, rotate: -15}}
                  style={{borderColor: `${accent}40`}}
                  transition={{type: "spring", stiffness: 380, damping: 22, delay: 0.1}}
                >
                  {icon}
                </motion.div>
                <div>
                  <motion.p
                    animate={{opacity: 1, x: 0}}
                    className="font-mono text-xs font-black uppercase tracking-[0.22em]"
                    initial={{opacity: 0, x: -8}}
                    style={{color: accent}}
                    transition={{duration: 0.4, delay: 0.18}}
                  >
                    {">"} {building.label}
                  </motion.p>
                  <motion.h2
                    animate={{opacity: 1, x: 0}}
                    className="mt-0.5 text-lg font-black text-white"
                    initial={{opacity: 0, x: -8}}
                    transition={{duration: 0.4, delay: 0.24}}
                  >
                    {building.name}
                  </motion.h2>
                </div>
              </div>

              {/* 설명 */}
              <motion.p
                animate={{opacity: 1, y: 0}}
                className="mt-4 text-sm leading-6 text-white/55"
                initial={{opacity: 0, y: 6}}
                transition={{duration: 0.4, delay: 0.3}}
              >
                {building.description}
              </motion.p>

              {/* 기술 스택 뱃지 */}
              {building.techStack && building.techStack.length > 0 && (
                <motion.div
                  animate={{opacity: 1, y: 0}}
                  className="mt-3 flex flex-wrap gap-1.5"
                  initial={{opacity: 0, y: 6}}
                  transition={{duration: 0.4, delay: 0.35}}
                >
                  {building.techStack.map((tech) => (
                    <span
                      className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-black"
                      key={tech}
                      style={{borderColor: `${accent}40`, color: accent, background: `${accent}12`}}
                    >
                      {tech}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* 입장 여부 */}
              <motion.div
                animate={{opacity: 1, y: 0}}
                className="mt-5 flex items-center gap-3 rounded-xl border bg-[#0a1525] px-4 py-3.5"
                initial={{opacity: 0, y: 8}}
                style={{borderColor: `${accent}30`}}
                transition={{duration: 0.4, delay: 0.38}}
              >
                <motion.span
                  animate={{rotate: [0, -8, 8, -5, 5, 0]}}
                  className="text-xl"
                  transition={{duration: 0.6, delay: 0.55}}
                >
                  🚪
                </motion.span>
                <p className="font-mono text-sm font-bold text-white/80">여기로 들어가시겠습니까?</p>
              </motion.div>

              {/* 버튼 */}
              <motion.div
                animate={{opacity: 1, y: 0}}
                className="mt-5 flex gap-3"
                initial={{opacity: 0, y: 8}}
                transition={{duration: 0.4, delay: 0.44}}
              >
                <button
                  className="flex-1 rounded-xl border border-white/10 py-2.5 font-mono text-sm font-bold text-white/50 transition hover:border-white/25 hover:text-white/70 active:scale-95"
                  onClick={onCancel}
                  type="button"
                >
                  취소
                </button>
                <motion.button
                  className="flex-1 rounded-xl py-2.5 font-mono text-sm font-black text-white active:scale-95"
                  onClick={onConfirm}
                  style={{background: `${accent}cc`, boxShadow: `0 0 18px ${accent}40`}}
                  type="button"
                  whileHover={{scale: 1.03, filter: "brightness(1.15)"}}
                  whileTap={{scale: 0.97}}
                >
                  입장하기 →
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
