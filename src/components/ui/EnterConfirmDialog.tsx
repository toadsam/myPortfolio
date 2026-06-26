"use client";

import {AnimatePresence, motion} from "framer-motion";
import {villageBuildings} from "@/lib/constants";

interface Props {
  buildingId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EnterConfirmDialog({buildingId, onConfirm, onCancel}: Props) {
  const building = buildingId ? villageBuildings.find((b) => b.id === buildingId) ?? null : null;

  return (
    <AnimatePresence>
      {building ? (
        <motion.div
          animate={{opacity: 1}}
          className="fixed inset-0 z-50 flex items-center justify-center"
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          transition={{duration: 0.18}}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            animate={{opacity: 1, scale: 1, y: 0}}
            className="relative z-10 w-[340px] rounded-2xl border border-[#d6c286] bg-[#fff8e5] p-7 shadow-2xl"
            exit={{opacity: 0, scale: 0.9, y: 12}}
            initial={{opacity: 0, scale: 0.9, y: 12}}
            transition={{duration: 0.24, ease: [0.22, 1, 0.36, 1]}}
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#5e9b5b]">{building.label}</p>
            <h2 className="mt-1.5 text-xl font-black text-[#1f2a24]">{building.name}</h2>
            <p className="mt-2.5 text-sm leading-6 text-[#6a725f]">{building.description}</p>

            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#d6c286] bg-[#fffdf6] px-4 py-3">
              <span className="text-xl">🚪</span>
              <p className="text-sm font-bold text-[#1f2a24]">여기로 들어가시겠습니까?</p>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-[#d0bd81] py-2.5 text-sm font-bold text-[#68715e] transition hover:bg-[#f4e9c7]"
                onClick={onCancel}
                type="button"
              >
                취소
              </button>
              <button
                className="flex-1 rounded-xl bg-[#5f9f4f] py-2.5 text-sm font-black text-white transition hover:bg-[#4f8d42] active:scale-95"
                onClick={onConfirm}
                type="button"
              >
                입장하기 →
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
