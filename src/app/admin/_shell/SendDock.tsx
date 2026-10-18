"use client";

/**
 * 맨 아래 송전 버튼 하나. 예전 탭 바에서 탭을 떼어 내고 버튼만 남겼다.
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

const HOLD_MS = 900;
const RING = 2 * Math.PI * 41;

export function SendDock({
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
    <div className="ab-dock">
      <div className="ab-dock-in">
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
          <svg aria-hidden="true" className="ab-send-ring" viewBox="0 0 88 88">
            <circle
              cx="44"
              cy="44"
              fill="none"
              r="41"
              stroke="#38414d"
              strokeWidth="3"
            />
            <circle
              cx="44"
              cy="44"
              fill="none"
              r="41"
              stroke="#e2c078"
              strokeDasharray={`${progress * RING} 260`}
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
      </div>
    </div>
  );
}
