"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect} from "react";
import {villageBuildings} from "@/lib/constants";

interface Props {
  buildingId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DISTRICT_LABELS: Record<string, string> = {
  plaza: "시작 지점",
  projects: "프로젝트 전시",
  skills: "기술 스택",
  experience: "경험 기록",
  contact: "연락처"
};

export function EnterConfirmDialog({buildingId, onConfirm, onCancel}: Props) {
  const building = buildingId
    ? villageBuildings.find(b => b.id === buildingId) ?? null
    : null;
  const accent = building?.accentColor ?? "#00d4ff";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!building) return;
      if (event.key === "Escape") onCancel();
      if (event.key === "Enter") onConfirm();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [building, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {building ? (
        <motion.div
          animate={{opacity: 1}}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          transition={{duration: 0.2}}
        >
          <motion.div
            animate={{opacity: 1}}
            className="absolute inset-0 bg-black/62 backdrop-blur-sm"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            onClick={onCancel}
            transition={{duration: 0.2}}
          />

          <motion.div
            animate={{opacity: 1, scale: 1, y: 0}}
            className="relative z-10 w-full max-w-[390px] overflow-hidden rounded-lg border bg-[#06101e] shadow-2xl"
            exit={{opacity: 0, scale: 0.92, y: 16}}
            initial={{opacity: 0, scale: 0.92, y: 16}}
            onClick={event => event.stopPropagation()}
            style={{borderColor: `${accent}40`}}
            transition={{type: "spring", stiffness: 420, damping: 30}}
          >
            <motion.div
              animate={{scaleX: 1}}
              className="h-[2px] w-full origin-left"
              initial={{scaleX: 0}}
              style={{
                background: `linear-gradient(to right, ${accent}, transparent)`
              }}
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
            />

            <div className="p-6">
              <div className="flex items-start gap-3">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border bg-[#0a1525] font-mono text-xs font-black"
                  style={{borderColor: `${accent}40`, color: accent}}
                >
                  IN
                </div>
                <div className="min-w-0">
                  <p
                    className="font-mono text-xs font-black uppercase tracking-[0.2em]"
                    style={{color: accent}}
                  >
                    {DISTRICT_LABELS[building.district] ?? building.label}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    {building.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    {building.description}
                  </p>
                </div>
              </div>

              {building.techStack && building.techStack.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {building.techStack.map(tech => (
                    <span
                      className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-black"
                      key={tech}
                      style={{
                        borderColor: `${accent}40`,
                        color: accent,
                        background: `${accent}12`
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : null}

              <div
                className="mt-5 rounded-lg border bg-[#0a1525] px-4 py-3"
                style={{borderColor: `${accent}28`}}
              >
                <p
                  className="font-mono text-xs font-black uppercase tracking-[0.16em]"
                  style={{color: accent}}
                >
                  Enter
                </p>
                <p className="mt-1 text-sm leading-6 text-white/72">
                  이 건물로 들어가면 관련 콘텐츠가 열립니다. Enter로 입장하고
                  ESC로 취소할 수 있습니다.
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  className="flex-1 rounded-lg border border-white/10 py-2.5 font-mono text-sm font-bold text-white/55 transition hover:border-white/25 hover:text-white"
                  onClick={onCancel}
                  type="button"
                >
                  취소
                </button>
                <motion.button
                  className="flex-1 rounded-lg py-2.5 font-mono text-sm font-black text-[#04101e]"
                  onClick={onConfirm}
                  style={{
                    background: accent,
                    boxShadow: `0 0 18px ${accent}40`
                  }}
                  type="button"
                  whileHover={{scale: 1.03, filter: "brightness(1.12)"}}
                  whileTap={{scale: 0.97}}
                >
                  입장하기
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
