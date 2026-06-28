"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// 아주총학 시그니처 — 흐르는 공지 티커 + 탭으로 전환되는 공식 게시판 SPA 느낌.
const TICKER = ["총회 일정 6/30 안내", "학식 환불 접수 시작", "제휴 카페 3곳 추가", "중간고사 간식 배부", "셔틀 노선 임시 변경"];

const BOARDS: Record<string, {tag: string; title: string; date: string}[]> = {
  공지: [
    {tag: "총회", title: "2026 상반기 전체학생대표자회의 일정", date: "06.24"},
    {tag: "선거", title: "보궐선거 후보 등록 안내", date: "06.20"},
    {tag: "행사", title: "여름 대동제 부스 신청 공고", date: "06.18"},
  ],
  "Q&A": [
    {tag: "답변완료", title: "학식 환불은 어디서 신청하나요?", date: "06.23"},
    {tag: "접수", title: "동아리방 배정 기준 문의", date: "06.22"},
    {tag: "답변완료", title: "셔틀버스 막차 시간 문의", date: "06.19"},
  ],
  복지: [
    {tag: "신규", title: "제휴 카페 ‘공강’ 10% 할인", date: "06.25"},
    {tag: "운영", title: "심야 열람실 연장 운영", date: "06.21"},
    {tag: "신규", title: "교내 우산 대여 서비스 시작", date: "06.17"},
  ],
  자료: [
    {tag: "PDF", title: "6월 정기회의 회의록", date: "06.24"},
    {tag: "PDF", title: "1분기 예산 집행 내역", date: "06.10"},
    {tag: "XLS", title: "제휴업체 전체 목록", date: "06.05"},
  ],
};

const TABS = Object.keys(BOARDS);

export function AjouchongDemo({theme}: {theme: ProjectTheme}) {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <DemoFrame
      theme={theme}
      label="아주대 총학생회"
      tag="OFFICIAL SPA"
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 상단 <span style={{color: theme.primary}}>공지 티커</span>가 흐르고, 탭으로 게시판이 전환됩니다.
        </p>
      }
    >
      {/* 공지 티커 */}
      <div className="mb-4 flex items-center gap-3 overflow-hidden rounded-lg border px-3 py-2" style={{borderColor: `${theme.primary}22`, background: "rgba(0,0,0,0.2)"}}>
        <span className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black" style={{background: theme.primary, color: theme.bg}}>NOTICE</span>
        <div className="relative flex-1 overflow-hidden">
          <motion.div className="flex gap-10 whitespace-nowrap" animate={{x: ["0%", "-50%"]}} transition={{duration: 18, repeat: Infinity, ease: "linear"}}>
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="font-mono text-[12px] text-white/60">📢 {t}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-3 flex gap-1 border-b" style={{borderColor: `${theme.primary}1a`}}>
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="relative px-4 py-2 font-mono text-[12px] font-black"
              style={{color: on ? theme.primary : "rgba(255,255,255,0.4)"}}
            >
              {t}
              {on ? <motion.span layoutId="ajou-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{background: theme.primary}} /> : null}
            </button>
          );
        })}
      </div>

      {/* 게시판 목록 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -10}}
          transition={{duration: 0.22}}
          className="flex flex-col gap-1.5"
        >
          {BOARDS[tab].map((row) => (
            <motion.div
              key={row.title}
              whileHover={{x: 4, background: `${theme.primary}0c`}}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
              style={{borderColor: `${theme.primary}18`}}
            >
              <span className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black" style={{background: `${theme.primary}1a`, color: theme.primary}}>{row.tag}</span>
              <span className="flex-1 truncate text-[13px] text-white/80">{row.title}</span>
              <span className="shrink-0 font-mono text-[10px] text-white/35">{row.date}</span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </DemoFrame>
  );
}
