"use client";

import {useRef, useState} from "react";
import {clearTouchMove, setTouchMove} from "@/lib/touchWalk";

const RADIUS = 46; // 손잡이가 움직이는 반지름(px)

/**
 * 걷기 모드 가상 조이스틱 — 휴대폰 가로 화면의 왼쪽 아래.
 *
 * DOM 요소라 캔버스의 드래그(시점 회전)와 섞이지 않는다. 손가락을 잡는 동안
 * `setPointerCapture` 로 따라가고, 떼면 0 으로 돌린다. 값은 touchWalk 모듈로
 * 흘러가 CharacterController 가 매 프레임 읽는다 — React state 는 손잡이
 * 그림 하나만 움직인다.
 */
export function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({x: 0, y: 0});

  function update(clientX: number, clientY: number) {
    const base = baseRef.current;
    if (!base) return;
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({x: dx, y: dy});
    // 화면 위쪽이 앞이다
    setTouchMove(dx / RADIUS, -dy / RADIUS);
  }

  function release() {
    idRef.current = null;
    setKnob({x: 0, y: 0});
    clearTouchMove();
  }

  return (
    <div
      ref={baseRef}
      role="slider"
      aria-label="이동 조이스틱"
      aria-valuenow={0}
      className="pointer-events-auto absolute bottom-5 left-5 h-[124px] w-[124px] touch-none select-none rounded-full border border-[#e2c078]/35 bg-[#0b1626]/55 backdrop-blur-sm"
      onPointerDown={e => {
        if (idRef.current !== null) return;
        idRef.current = e.pointerId;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // 끝난 포인터면 캡처가 던진다. 탭이 죽지 않게 삼킨다.
        }
        update(e.clientX, e.clientY);
      }}
      onPointerMove={e => {
        if (idRef.current !== e.pointerId) return;
        update(e.clientX, e.clientY);
      }}
      onPointerUp={e => {
        if (idRef.current === e.pointerId) release();
      }}
      onPointerCancel={e => {
        if (idRef.current === e.pointerId) release();
      }}
      onLostPointerCapture={release}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e2c078]/40" />
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-[#ffd9ae]/70 bg-[#ff9d38]/35 shadow-[0_0_14px_rgba(255,157,56,0.45)]"
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`
        }}
      />
    </div>
  );
}
