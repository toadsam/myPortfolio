"use client";

/**
 * 아래 탭과 가운데 송전 버튼.
 *
 * ## 저장은 "꾹 누르기"다
 *
 * 저장은 하루 기록 전체를 덮어쓰는 동작이라, 스크롤하다 엄지가 스치는 것만으로
 * 일어나면 안 된다. 그래서 0.9초 눌러야 고리가 다 차고 송전된다. 손을 일찍 떼면
 * 취소다. 키보드(Enter·Space)는 실수로 누를 일이 적어서 바로 송전한다.
 */

import {useEffect, useRef, useState} from "react";
import type * as React from "react";
import {buzz, sfx} from "../_lib/sfx";

export type BoardTab = "today" | "orders" | "log" | "drawer";

const HOLD_MS = 900;
const RING = 2 * Math.PI * 38;

export function TabBar({
  tab,
  onTab,
  onSend,
  canSend,
  sending,
  ordersAlert,
  drawerAlert,
  pulseToday
}: {
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  onSend: () => void;
  /** 보낼 것이 없으면 누를 때 이유를 알려 준다 */
  canSend: boolean;
  sending: boolean;
  ordersAlert: boolean;
  drawerAlert: number;
  /** 지시서가 완료돼 배전반에 값이 흘러들었다 — 탭 아이콘이 한 번 뛴다 */
  pulseToday: number;
}) {
  return (
    <nav aria-label="배전반 화면" className="ab-tabbar">
      <div className="ab-tabbar-in">
        <TabButton
          active={tab === "today"}
          label="배전반"
          onClick={() => onTab("today")}
          pulse={pulseToday}
        >
          <rect height="16" rx="2" width="18" x="3" y="4" />
          <path d="M8 9v6M12 7v10M16 10v4" />
        </TabButton>
        <TabButton
          active={tab === "orders"}
          dot={ordersAlert}
          label="지시서"
          onClick={() => onTab("orders")}
        >
          <rect height="18" rx="2" width="14" x="5" y="3" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </TabButton>
        <SendButton canSend={canSend} onSend={onSend} sending={sending} />
        <TabButton
          active={tab === "log"}
          label="기록실"
          onClick={() => onTab("log")}
        >
          <rect height="16" rx="2" width="18" x="3" y="5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </TabButton>
        <TabButton
          active={tab === "drawer"}
          badge={drawerAlert}
          label="서랍"
          onClick={() => onTab("drawer")}
        >
          <rect height="18" rx="2" width="18" x="3" y="3" />
          <path d="M3 12h18M10 7.5h4M10 16.5h4" />
        </TabButton>
      </div>
    </nav>
  );
}

function TabButton({
  active,
  label,
  onClick,
  children,
  dot,
  badge,
  pulse
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  dot?: boolean;
  badge?: number;
  pulse?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!pulse || !ref.current) return;
    ref.current.animate(
      [
        {transform: "scale(1)"},
        {transform: "scale(1.35)"},
        {transform: "scale(1)"}
      ],
      {duration: 500, iterations: 2}
    );
  }, [pulse]);

  return (
    <button
      aria-current={active ? "page" : undefined}
      className="ab-tb"
      onClick={() => {
        sfx.tick();
        buzz(6);
        onClick();
      }}
      type="button"
    >
      <svg
        fill="none"
        ref={ref}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
      {label}
      {badge ? (
        <i className="ab-tb-badge">{badge}</i>
      ) : dot ? (
        <i className="ab-tb-dot" />
      ) : null}
    </button>
  );
}

function SendButton({
  canSend,
  sending,
  onSend
}: {
  canSend: boolean;
  sending: boolean;
  onSend: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const raf = useRef(0);
  const start = useRef(0);
  const lastBeep = useRef(0);

  function say(text: string) {
    setHint(text);
    window.setTimeout(() => setHint(null), 1800);
  }

  function frame(now: number) {
    const p = Math.min(1, (now - start.current) / HOLD_MS);
    setProgress(p);
    if (now - lastBeep.current > 90) {
      sfx.charge(p);
      buzz(5);
      lastBeep.current = now;
    }
    if (p >= 1) {
      raf.current = 0;
      setProgress(0);
      onSend();
      return;
    }
    raf.current = requestAnimationFrame(frame);
  }

  function down(e: React.PointerEvent) {
    if (sending) return;
    if (!canSend) {
      say("켜진 회로가 없어요");
      return;
    }
    e.preventDefault();
    start.current = performance.now();
    raf.current = requestAnimationFrame(frame);
  }

  function up() {
    if (!raf.current) return;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    setProgress(0);
    say("조금 더 꾹 눌러 주세요");
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <button
      aria-label="송전: 꾹 눌러서 오늘 기록 저장"
      className={`ab-send${progress > 0 ? " is-charging" : ""}${
        canSend && !sending ? " is-ready" : ""
      }${sending ? " is-sending" : ""}`}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => {
        if ((e.key === "Enter" || e.key === " ") && canSend && !sending) {
          e.preventDefault();
          onSend();
        }
      }}
      onPointerCancel={up}
      onPointerDown={down}
      onPointerLeave={up}
      onPointerUp={up}
      type="button"
    >
      <svg aria-hidden="true" className="ab-send-ring" viewBox="0 0 82 82">
        <circle
          cx="41"
          cy="41"
          fill="none"
          r="38"
          stroke="#38414d"
          strokeWidth="3"
        />
        <circle
          cx="41"
          cy="41"
          fill="none"
          r="38"
          stroke="#e2c078"
          strokeDasharray={`${progress * RING} 240`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className="ab-send-core">
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      </span>
      <span className="ab-send-label">
        {hint ?? (sending ? "송전 중…" : "꾹 눌러 송전")}
      </span>
    </button>
  );
}
