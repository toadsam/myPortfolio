"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// A-Club 시그니처 — 태그 필터를 누르면 동아리 카드가 부드럽게 재배치(layout)되는 탐색 UX.
interface Club {
  name: string;
  cat: string;
  emoji: string;
  status: "모집중" | "마감";
  members: number;
}

const CLUBS: Club[] = [
  {
    name: "사운드웨이브",
    cat: "음악",
    emoji: "🎸",
    status: "모집중",
    members: 24
  },
  {
    name: "코드크래프트",
    cat: "개발",
    emoji: "💻",
    status: "모집중",
    members: 31
  },
  {name: "프레임", cat: "사진", emoji: "📷", status: "모집중", members: 18},
  {name: "FC아주", cat: "운동", emoji: "⚽", status: "마감", members: 40},
  {name: "재즈라운지", cat: "음악", emoji: "🎷", status: "모집중", members: 12},
  {name: "알고리즘", cat: "개발", emoji: "🧩", status: "모집중", members: 27},
  {name: "스냅샷", cat: "사진", emoji: "🖼️", status: "마감", members: 22},
  {name: "스매시", cat: "운동", emoji: "🏸", status: "모집중", members: 16}
];

const CATS = ["전체", "음악", "개발", "사진", "운동"];

export function AClubDemo({theme}: {theme: ProjectTheme}) {
  const [cat, setCat] = useState("전체");
  const list = cat === "전체" ? CLUBS : CLUBS.filter(c => c.cat === cat);

  return (
    <DemoFrame
      theme={theme}
      label="A-Club"
      tag="CLUB DISCOVERY"
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 태그를 누르면 동아리 카드가{" "}
          <span style={{color: theme.primary}}>실시간으로 필터·재배치</span>
          됩니다.
        </p>
      }
    >
      {/* 필터 칩 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATS.map(c => {
          const active = c === cat;
          return (
            <motion.button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              whileTap={{scale: 0.94}}
              className="rounded-full border px-3.5 py-1.5 font-mono text-[12px] font-bold"
              style={
                active
                  ? {
                      borderColor: theme.primary,
                      background: theme.primary,
                      color: theme.bg
                    }
                  : {
                      borderColor: `${theme.primary}33`,
                      color: theme.accent,
                      background: "transparent"
                    }
              }
            >
              {c}
            </motion.button>
          );
        })}
      </div>

      {/* 카드 그리드 — layout 애니메이션으로 재배치 */}
      <motion.div
        layout
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {list.map(club => (
            <motion.div
              key={club.name}
              layout
              initial={{opacity: 0, scale: 0.85}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.85}}
              transition={{type: "spring", stiffness: 260, damping: 24}}
              whileHover={{y: -4, borderColor: `${theme.primary}66`}}
              className="flex flex-col gap-1.5 rounded-xl border p-3"
              style={{
                borderColor: `${theme.primary}22`,
                background: "rgba(255,255,255,0.02)"
              }}
            >
              <span className="text-2xl">{club.emoji}</span>
              <span className="font-mono text-[12px] font-black text-white/85">
                {club.name}
              </span>
              <span className="font-mono text-[9px] text-white/35">
                {club.cat} · {club.members}명
              </span>
              <span
                className="mt-0.5 w-fit rounded px-1.5 py-0.5 font-mono text-[9px] font-black"
                style={
                  club.status === "모집중"
                    ? {background: `${theme.primary}1f`, color: theme.primary}
                    : {
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.4)"
                      }
                }
              >
                {club.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </DemoFrame>
  );
}
