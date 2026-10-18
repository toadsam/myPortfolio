"use client";

/**
 * 지시서 한 줄 — 회로 블록 안에 산다.
 *
 * 손짓은 둘뿐이다. **오른쪽으로 밀면 완료**, **누르면 고치기**(분량 칩 · 내일로 · 지우기).
 * 왼쪽 밀기 같은 숨은 제스처는 뺐다. 키보드는 Enter/Space 로 완료한다.
 *
 * 완료 연출은 부모(`CircuitBlock`)가 한다. 이 줄은 "완료하겠다"는 뜻만 올려 보낸다.
 */

import {useRef, useState} from "react";
import type * as React from "react";
import type {PlanItem} from "@/types/live";
import {buzz, sfx} from "../_lib/sfx";

const SWIPE = 80;
const MINUTES = [15, 30, 45, 60, 90];

export function fmtMinutes(m: number): string {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  return `${h}시간${m % 60 ? ` ${m % 60}분` : ""}`;
}

export function OrderRow({
  item,
  noCircuit,
  onToggle,
  onMinutes,
  onDefer,
  onRemove
}: {
  item: PlanItem;
  /** 회로 없음 묶음 — 분량 칩을 안 보여 준다 */
  noCircuit?: boolean;
  /** 완료 ↔ 되돌리기. el 은 연출 시작점. */
  onToggle: (el: HTMLElement) => void;
  onMinutes: (minutes: number) => void;
  onDefer: () => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    lock: boolean | null;
    buzzed: boolean;
  } | null>(null);
  const moved = useRef(false);
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);

  function end() {
    const d = drag.current;
    drag.current = null;
    const el = ref.current;
    if (el) el.classList.remove("is-dragging");
    const final = dx;
    setDx(0);
    if (d?.lock && final > SWIPE && el) onToggle(el);
    window.setTimeout(() => (moved.current = false), 0);
  }

  return (
    <div className="ab-order-wrap">
      <div aria-hidden="true" className="ab-order-under">
        {item.done ? "되돌리기 ▶" : "완료 ▶"}
      </div>
      <div
        aria-expanded={open}
        aria-label={`${item.title}, ${item.done ? "완료됨" : "미완료"}`}
        className={`ab-order${item.done ? " is-done" : ""}`}
        onClick={() => {
          if (moved.current) return;
          sfx.tick(0.3);
          setOpen(o => !o);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (ref.current) onToggle(ref.current);
          }
        }}
        onPointerCancel={end}
        onPointerDown={e => {
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            lock: null,
            buzzed: false
          };
          moved.current = false;
        }}
        onPointerMove={e => {
          const d = drag.current;
          if (!d) return;
          const mx = e.clientX - d.x;
          const my = e.clientY - d.y;
          if (d.lock === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) {
            d.lock = Math.abs(mx) > Math.abs(my);
            if (d.lock) {
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // 캡처가 안 돼도 밀기는 된다
              }
              e.currentTarget.classList.add("is-dragging");
            }
          }
          if (!d.lock) return;
          moved.current = true;
          const next = Math.max(0, mx);
          setDx(next);
          if (next > SWIPE && !d.buzzed) {
            d.buzzed = true;
            buzz(12);
            sfx.tick(0.8);
          }
        }}
        onPointerUp={end}
        ref={ref}
        role="button"
        style={
          dx
            ? {transform: `translateX(${dx}px) rotate(${dx / 60}deg)`}
            : undefined
        }
        tabIndex={0}
      >
        <span aria-hidden="true" className="ab-fuse" />
        <span className="ab-o-title">
          {item.title}
          {item.due_label ? (
            <span className="ab-o-due">{item.due_label}</span>
          ) : null}
        </span>
        <span className="ab-o-min">
          {item.minutes ? fmtMinutes(item.minutes) : "+10kWh"}
        </span>
        <span aria-hidden="true" className="ab-stamp">
          완료
        </span>
      </div>
      {open ? (
        <div className="ab-o-edit">
          {noCircuit
            ? null
            : MINUTES.map(m => (
                <button
                  aria-pressed={item.minutes === m}
                  className="ab-chip"
                  key={m}
                  onClick={() => {
                    sfx.tick(0.4);
                    onMinutes(m);
                  }}
                  type="button"
                >
                  {fmtMinutes(m)}
                </button>
              ))}
          {!item.done ? (
            <button
              className="ab-chip is-quiet"
              onClick={() => {
                sfx.tick(0.2);
                onDefer();
              }}
              type="button"
            >
              내일로
            </button>
          ) : null}
          <button
            className="ab-chip is-danger"
            onClick={() => {
              sfx.tick(0.1);
              onRemove();
            }}
            type="button"
          >
            지우기
          </button>
        </div>
      ) : null}
    </div>
  );
}
