"use client";

import {AnimatePresence, motion} from "framer-motion";
import {villageBuildings} from "@/lib/constants";
import type {BuildingKind} from "@/types/portfolio";

interface Props {
  buildingId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const KIND_ICONS: Record<BuildingKind, string> = {
  plaza: "🏛️",
  lab: "🔬",
  workshop: "🛠️",
  archive: "📚",
  post: "📮"
};

const KIND_ACCENT: Record<BuildingKind, string> = {
  plaza: "#73b960",
  lab: "#5f7be8",
  workshop: "#5f9f4f",
  archive: "#8b3ab5",
  post: "#e06040"
};

export function EnterConfirmDialog({buildingId, onConfirm, onCancel}: Props) {
  const building = buildingId ? villageBuildings.find((b) => b.id === buildingId) ?? null : null;
  const accent = building ? KIND_ACCENT[building.kind] : "#5e9b5b";
  const icon = building ? KIND_ICONS[building.kind] : "🏠";

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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            onClick={onCancel}
            transition={{duration: 0.2}}
          />

          {/* 다이얼로그 */}
          <motion.div
            animate={{opacity: 1, scale: 1, y: 0}}
            className="relative z-10 w-[360px] overflow-hidden rounded-2xl border border-[#d6c286] bg-[#fff8e5] shadow-2xl"
            exit={{opacity: 0, scale: 0.88, y: 16}}
            initial={{opacity: 0, scale: 0.88, y: 16}}
            onClick={(e) => e.stopPropagation()}
            transition={{type: "spring", stiffness: 420, damping: 28}}
          >
            {/* 상단 컬러 액센트 바 */}
            <motion.div
              animate={{scaleX: 1}}
              className="h-1 w-full origin-left"
              initial={{scaleX: 0}}
              style={{backgroundColor: accent}}
              transition={{duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1]}}
            />

            <div className="p-7">
              {/* 아이콘 + 레이블 */}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{scale: 1, rotate: 0}}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d6c286] bg-[#fffdf6] text-2xl shadow-sm"
                  initial={{scale: 0.5, rotate: -15}}
                  transition={{type: "spring", stiffness: 380, damping: 22, delay: 0.1}}
                >
                  {icon}
                </motion.div>
                <div>
                  <motion.p
                    animate={{opacity: 1, x: 0}}
                    className="text-xs font-black uppercase tracking-[0.22em]"
                    initial={{opacity: 0, x: -8}}
                    style={{color: accent}}
                    transition={{duration: 0.4, delay: 0.18}}
                  >
                    {building.label}
                  </motion.p>
                  <motion.h2
                    animate={{opacity: 1, x: 0}}
                    className="mt-0.5 text-lg font-black text-[#1f2a24]"
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
                className="mt-4 text-sm leading-6 text-[#6a725f]"
                initial={{opacity: 0, y: 6}}
                transition={{duration: 0.4, delay: 0.3}}
              >
                {building.description}
              </motion.p>

              {/* 입장 여부 */}
              <motion.div
                animate={{opacity: 1, y: 0}}
                className="mt-5 flex items-center gap-3 rounded-xl border bg-[#fffdf6] px-4 py-3.5"
                initial={{opacity: 0, y: 8}}
                style={{borderColor: `${accent}50`}}
                transition={{duration: 0.4, delay: 0.38}}
              >
                <motion.span
                  animate={{rotate: [0, -8, 8, -5, 5, 0]}}
                  className="text-xl"
                  transition={{duration: 0.6, delay: 0.55}}
                >
                  🚪
                </motion.span>
                <p className="text-sm font-bold text-[#1f2a24]">여기로 들어가시겠습니까?</p>
              </motion.div>

              {/* 버튼 */}
              <motion.div
                animate={{opacity: 1, y: 0}}
                className="mt-5 flex gap-3"
                initial={{opacity: 0, y: 8}}
                transition={{duration: 0.4, delay: 0.44}}
              >
                <button
                  className="flex-1 rounded-xl border border-[#d0bd81] py-2.5 text-sm font-bold text-[#68715e] transition-all duration-200 hover:bg-[#f4e9c7] active:scale-95"
                  onClick={onCancel}
                  type="button"
                >
                  취소
                </button>
                <motion.button
                  className="flex-1 rounded-xl py-2.5 text-sm font-black text-white transition-all duration-200 active:scale-95"
                  style={{backgroundColor: accent}}
                  type="button"
                  whileHover={{scale: 1.04, filter: "brightness(1.1)"}}
                  whileTap={{scale: 0.96}}
                  onClick={onConfirm}
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
