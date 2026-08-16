"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useCallback, useEffect, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";

// ════════════════════════════════════════════════════════════════════════════
//  FestFlow 라이브 데모 — 부스 상태를 직접 바꾸면 피드·지도·현황에 즉시 전파되는
//  모습으로 SSE 브로드캐스트를 "설명"이 아니라 "시연"한다.
// ════════════════════════════════════════════════════════════════════════════

type Status = "운영중" | "혼잡" | "품절";
const ORDER: Status[] = ["운영중", "혼잡", "품절"];

interface Booth {
  id: string;
  name: string;
  zone: string;
}

const BOOTHS: Booth[] = [
  {id: "b1", name: "떡볶이", zone: "푸드존"},
  {id: "b2", name: "츄러스", zone: "푸드존"},
  {id: "b3", name: "핸드메이드", zone: "플리마켓"},
  {id: "b4", name: "빈티지", zone: "플리마켓"},
  {id: "b5", name: "VR 체험", zone: "체험존"},
  {id: "b6", name: "캐리커처", zone: "체험존"},
  {id: "b7", name: "포토존", zone: "체험존"},
  {id: "b8", name: "메인 무대", zone: "무대"}
];

const INITIAL: Record<string, Status> = {
  b1: "운영중",
  b2: "혼잡",
  b3: "운영중",
  b4: "품절",
  b5: "운영중",
  b6: "운영중",
  b7: "혼잡",
  b8: "운영중"
};

interface FeedItem {
  key: number;
  name: string;
  zone: string;
  status: Status;
  who: "나" | "스태프";
  time: string;
}

function statusColor(status: Status, theme: ProjectTheme) {
  if (status === "혼잡") return "#fbbf24";
  if (status === "품절") return "#f87171";
  return theme.primary;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function nowStr() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function FestFlowLiveDemo({theme}: {theme: ProjectTheme}) {
  const [statuses, setStatuses] = useState<Record<string, Status>>(INITIAL);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [paused, setPaused] = useState(false);

  const statusesRef = useRef(statuses);
  const idRef = useRef(1);
  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  const apply = useCallback(
    (id: string, next: Status, who: "나" | "스태프") => {
      const booth = BOOTHS.find(b => b.id === id);
      if (!booth) return;
      setStatuses(prev => ({...prev, [id]: next}));
      setFeed(prev =>
        [
          {
            key: idRef.current++,
            name: booth.name,
            zone: booth.zone,
            status: next,
            who,
            time: nowStr()
          },
          ...prev
        ].slice(0, 7)
      );
    },
    []
  );

  const cycle = useCallback(
    (id: string) => {
      const cur = statusesRef.current[id];
      const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
      apply(id, next, "나");
    },
    [apply]
  );

  // 자동 스트림 — 다른 스태프가 현장에서 상태를 바꾸는 것처럼.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      const booth = BOOTHS[Math.floor(Math.random() * BOOTHS.length)];
      const cur = statusesRef.current[booth.id];
      const options = ORDER.filter(o => o !== cur);
      const next = options[Math.floor(Math.random() * options.length)];
      apply(booth.id, next, "스태프");
    }, 2600);
    return () => clearInterval(t);
  }, [paused, apply]);

  const reset = useCallback(() => {
    setStatuses(INITIAL);
    setFeed([]);
  }, []);

  const counts = ORDER.map(s => ({
    status: s,
    n: BOOTHS.filter(b => statuses[b.id] === s).length
  }));

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${theme.primary}33`,
        background: `${theme.primary}06`
      }}
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5}}
    >
      {/* 헤더 */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3"
        style={{borderColor: `${theme.primary}22`}}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{background: theme.primary}}
              animate={{scale: [1, 2.4], opacity: [0.6, 0]}}
              transition={{duration: 1.6, repeat: Infinity, ease: "easeOut"}}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{background: theme.primary}}
            />
          </span>
          <span className="font-mono text-sm font-black text-white">
            FestFlow
          </span>
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{color: theme.primary}}
          >
            LIVE DEMO
          </span>
          <span className="hidden font-mono text-[11px] text-white/40 sm:inline">
            · 실제 SSE 동작 시연
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused(p => !p)}
            className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black transition hover:bg-white/5"
            style={{borderColor: `${theme.primary}35`, color: theme.accent}}
          >
            {paused ? "▶ 스트림 재개" : "⏸ 스트림 정지"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black text-white/50 transition hover:bg-white/5"
            style={{borderColor: "rgba(255,255,255,0.15)"}}
          >
            ↺ 초기화
          </button>
        </div>
      </div>

      {/* 본문 3패널 */}
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.05fr_1fr]">
        {/* 1. 부스 — 클릭 */}
        <div>
          <p
            className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]"
            style={{color: theme.primary}}
          >
            부스 · 👆 클릭해서 상태 변경
          </p>
          <div className="flex flex-col gap-1.5">
            {BOOTHS.map(b => {
              const st = statuses[b.id];
              const c = statusColor(st, theme);
              return (
                <motion.button
                  key={b.id}
                  type="button"
                  onClick={() => cycle(b.id)}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-left"
                  style={{
                    borderColor: `${theme.primary}1f`,
                    background: "rgba(255,255,255,0.02)"
                  }}
                  whileHover={{
                    x: 3,
                    borderColor: `${c}88`,
                    background: `${c}10`
                  }}
                  whileTap={{scale: 0.97}}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-white/80">
                      {b.name}
                    </span>
                    <span className="font-mono text-[9px] text-white/30">
                      {b.zone}
                    </span>
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={st}
                      className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
                      style={{background: `${c}1f`, color: c}}
                      initial={{opacity: 0, scale: 0.6}}
                      animate={{opacity: 1, scale: 1}}
                      exit={{opacity: 0, scale: 0.6}}
                      transition={{duration: 0.18}}
                    >
                      {st}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 2. 실시간 피드 */}
        <div>
          <p
            className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]"
            style={{color: theme.primary}}
          >
            실시간 피드 · SSE Push
          </p>
          <div
            className="flex min-h-[260px] flex-col gap-1.5 rounded-lg border p-2.5"
            style={{
              borderColor: `${theme.primary}1a`,
              background: "rgba(0,0,0,0.2)"
            }}
          >
            <AnimatePresence initial={false}>
              {feed.length === 0 ? (
                <motion.p
                  key="empty"
                  className="flex flex-1 items-center justify-center px-4 text-center font-mono text-[11px] leading-5 text-white/30"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                >
                  부스를 클릭하거나 잠시 기다리면
                  <br />
                  상태 변경이 여기에 실시간으로 쌓입니다.
                </motion.p>
              ) : (
                feed.map(f => {
                  const c = statusColor(f.status, theme);
                  return (
                    <motion.div
                      key={f.key}
                      layout
                      className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                      style={{borderColor: `${c}33`, background: `${c}0a`}}
                      initial={{opacity: 0, y: -12, height: 0}}
                      animate={{opacity: 1, y: 0, height: "auto"}}
                      exit={{opacity: 0, height: 0}}
                      transition={{duration: 0.28}}
                    >
                      <span className="font-mono text-[9px] text-white/30">
                        {f.time}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[8px] font-black"
                        style={
                          f.who === "나"
                            ? {
                                background: `${theme.accent}22`,
                                color: theme.accent
                              }
                            : {
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.4)"
                              }
                        }
                      >
                        {f.who}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-white/75">
                        {f.name}
                      </span>
                      <span className="font-mono text-[11px] text-white/30">
                        →
                      </span>
                      <span
                        className="font-mono text-[11px] font-black"
                        style={{color: c}}
                      >
                        {f.status}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. 지도 + 현황 */}
        <div>
          <p
            className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]"
            style={{color: theme.primary}}
          >
            지도 · 현황
          </p>
          <div
            className="grid grid-cols-4 gap-1.5 rounded-lg border p-2.5"
            style={{
              borderColor: `${theme.primary}1a`,
              background: "rgba(0,0,0,0.2)"
            }}
          >
            {BOOTHS.map(b => {
              const c = statusColor(statuses[b.id], theme);
              return (
                <div
                  key={b.id}
                  className="flex flex-col items-center gap-1 rounded-md py-2"
                  style={{background: `${c}0d`}}
                >
                  <motion.span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{background: c, boxShadow: `0 0 10px ${c}`}}
                    animate={{scale: [1, 1.25, 1]}}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="font-mono text-[8px] text-white/45">
                    {b.name}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {counts.map(({status, n}) => {
              const c = statusColor(status, theme);
              return (
                <div
                  key={status}
                  className="rounded-lg border p-2 text-center"
                  style={{borderColor: `${c}2a`}}
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={n}
                      className="font-mono text-lg font-black"
                      style={{color: c}}
                      initial={{opacity: 0, y: -6}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: 6}}
                      transition={{duration: 0.2}}
                    >
                      {n}
                    </motion.p>
                  </AnimatePresence>
                  <p className="font-mono text-[9px] text-white/40">{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 푸터 메시지 */}
      <div
        className="border-t px-5 py-2.5"
        style={{
          borderColor: `${theme.primary}18`,
          background: "rgba(0,0,0,0.15)"
        }}
      >
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 당신이 바꾼 상태가{" "}
          <span style={{color: theme.primary}}>피드 · 지도 · 현황</span>에 1초
          안에 반영됩니다 — 이것이 SSE 브로드캐스트입니다.
        </p>
      </div>
    </motion.div>
  );
}
