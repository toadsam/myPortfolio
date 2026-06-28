"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useMemo, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// MyStock-Desk 시그니처 — 직접 매수/매도하면 평가액·수익률·자산비중이 실시간 갱신.
interface Holding {
  id: string;
  name: string;
  price: number;
  day: number; // 당일 등락률
  color: string;
}

const HOLDINGS: Holding[] = [
  {id: "s1", name: "삼성전자", price: 74000, day: 0.018, color: "#5b9bd5"},
  {id: "s2", name: "에코프로", price: 128000, day: 0.046, color: "#7bc47f"},
  {id: "s3", name: "카카오", price: 42500, day: -0.021, color: "#f0c419"},
  {id: "s4", name: "NAVER", price: 192000, day: 0.009, color: "#e8806c"},
];

const INIT_QTY: Record<string, number> = {s1: 12, s2: 3, s3: 8, s4: 2};

function won(n: number) {
  return "₩" + Math.round(n).toLocaleString();
}

export function MyStockDemo({theme}: {theme: ProjectTheme}) {
  const [qty, setQty] = useState<Record<string, number>>(INIT_QTY);

  const rows = useMemo(
    () =>
      HOLDINGS.map((h) => {
        const q = qty[h.id] ?? 0;
        const value = q * h.price;
        return {...h, q, value, dayPnl: value * h.day};
      }),
    [qty],
  );

  const total = rows.reduce((s, r) => s + r.value, 0);
  const totalDayPnl = rows.reduce((s, r) => s + r.dayPnl, 0);
  const returnPct = total > 0 ? (totalDayPnl / total) * 100 : 0;
  const up = returnPct >= 0;
  const pnlColor = up ? theme.primary : "#f87171";

  const trade = (id: string, delta: number) =>
    setQty((prev) => ({...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta)}));

  return (
    <DemoFrame
      theme={theme}
      label="MyStock-Desk"
      tag="LIVE PORTFOLIO"
      controls={
        <button
          type="button"
          onClick={() => setQty(INIT_QTY)}
          className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black text-white/50 transition hover:bg-white/5"
          style={{borderColor: "rgba(255,255,255,0.15)"}}
        >
          ↺ 초기화
        </button>
      }
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 매수/매도하면 <span style={{color: theme.primary}}>평가액 · 수익률 · 자산 비중</span>이 즉시 다시 계산됩니다 — 외부 연동 없이 입력만으로.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* 좌: 요약 + 비중 */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border p-4" style={{borderColor: `${theme.primary}22`, background: "rgba(0,0,0,0.2)"}}>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/40">평가액</p>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={Math.round(total)}
                className="font-mono text-3xl font-black text-white"
                initial={{opacity: 0, y: -8}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: 8}}
                transition={{duration: 0.2}}
              >
                {won(total)}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 font-mono text-sm font-black" style={{color: pnlColor}}>
              {up ? "▲" : "▼"} {won(Math.abs(totalDayPnl))} ({up ? "+" : ""}{returnPct.toFixed(2)}%) 오늘
            </p>
            {/* 자산 비중 스택 바 */}
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full" style={{background: "rgba(255,255,255,0.06)"}}>
              {rows.map((r) => (
                <motion.div
                  key={r.id}
                  className="h-full"
                  style={{background: r.color}}
                  animate={{width: total > 0 ? `${(r.value / total) * 100}%` : "0%"}}
                  transition={{type: "spring", stiffness: 160, damping: 22}}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {rows.map((r) => (
                <span key={r.id} className="flex items-center gap-1.5 font-mono text-[10px] text-white/50">
                  <span className="h-2 w-2 rounded-sm" style={{background: r.color}} />
                  {r.name} {total > 0 ? Math.round((r.value / total) * 100) : 0}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 우: 종목별 매매 */}
        <div className="flex flex-col gap-1.5">
          <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.18em]" style={{color: theme.primary}}>
            보유 종목 · 매수/매도
          </p>
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{borderColor: `${theme.primary}1f`, background: "rgba(255,255,255,0.02)"}}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{background: r.color}} />
                  <span className="font-mono text-[12px] font-bold text-white/85">{r.name}</span>
                  <span className="font-mono text-[10px]" style={{color: r.day >= 0 ? theme.primary : "#f87171"}}>
                    {r.day >= 0 ? "+" : ""}{(r.day * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/35">{won(r.price)} · {r.q}주 · {won(r.value)}</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.button type="button" onClick={() => trade(r.id, -1)} whileTap={{scale: 0.85}} className="h-7 w-7 rounded-md border font-mono text-sm font-black text-white/70" style={{borderColor: "#f8717155"}}>−</motion.button>
                <motion.button type="button" onClick={() => trade(r.id, 1)} whileTap={{scale: 0.85}} className="h-7 w-7 rounded-md border font-mono text-sm font-black" style={{borderColor: `${theme.primary}66`, color: theme.primary}}>+</motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}
