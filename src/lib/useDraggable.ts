"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {CSSProperties, PointerEvent as ReactPointerEvent} from "react";

interface Pos {
  x: number;
  y: number;
}

const RESET_EVENT = "hud-layout-reset";

/** 모든 HUD 패널을 기본 위치로 되돌린다. */
export function resetHudLayout(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RESET_EVENT));
}

/**
 * 떠 있는 HUD 패널을 헤더로 드래그해 이동 + 위치를 localStorage에 기억.
 * fine 포인터(마우스) 기기에서만 활성 — 터치/모바일은 기본 레이아웃 유지.
 */
export function useDraggable(id: string) {
  const key = `hud-pos-${id}`;
  const elRef = useRef<HTMLElement | null>(null);
  const posRef = useRef<Pos | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [enabled, setEnabled] = useState(false);

  const setRef = useCallback((el: HTMLElement | null) => {
    elRef.current = el;
  }, []);

  const apply = useCallback((next: Pos | null) => {
    posRef.current = next;
    setPos(next);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) apply(JSON.parse(raw) as Pos);
    } catch {
      /* noop */
    }

    const onReset = () => {
      apply(null);
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    };
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [key, apply]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (!enabled || event.button !== 0) return;
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offX = event.clientX - rect.left;
      const offY = event.clientY - rect.top;
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;

      const move = (ev: PointerEvent) => {
        if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4)
          return;
        moved = true;
        ev.preventDefault();
        const node = elRef.current;
        const w = node?.offsetWidth ?? 0;
        const h = node?.offsetHeight ?? 0;
        const x = Math.max(
          4,
          Math.min(ev.clientX - offX, window.innerWidth - w - 4)
        );
        const y = Math.max(
          4,
          Math.min(ev.clientY - offY, window.innerHeight - h - 4)
        );
        apply({x, y});
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (moved && posRef.current) {
          try {
            window.localStorage.setItem(key, JSON.stringify(posRef.current));
          } catch {
            /* noop */
          }
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [enabled, key, apply]
  );

  const style: CSSProperties =
    enabled && pos
      ? {left: pos.x, top: pos.y, right: "auto", bottom: "auto"}
      : {};
  const handleProps = {
    onPointerDown: enabled ? onPointerDown : undefined,
    style: (enabled ? {touchAction: "none", cursor: "grab"} : undefined) as
      | CSSProperties
      | undefined
  };

  return {ref: setRef, style, handleProps};
}
