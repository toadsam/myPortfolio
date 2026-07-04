"use client";

import {useEffect, useRef} from "react";

// 네온 링/닷 커스텀 커서 — 사이트 전역.
// 터치(coarse) 기기에서는 비활성, prefers-reduced-motion이면 트레일(관성) 제거.
const INTERACTIVE = 'a,button,input,select,textarea,label,[role="button"],[data-cursor="hover"]';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // 마우스 없는 기기는 스킵

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("custom-cursor-active");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let visible = false;
    let raf = 0;

    const place = (el: HTMLDivElement, x: number, y: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      if (!visible) {
        visible = true;
        ring.style.opacity = "1";
        dot.style.opacity = "1";
      }
      const target = event.target as Element | null;
      ring.classList.toggle("hover", !!target?.closest?.(INTERACTIVE));
      place(dot, mx, my);
      if (reduce) {
        rx = mx;
        ry = my;
        place(ring, rx, ry);
      }
    };
    const onDown = () => ring.classList.add("down");
    const onUp = () => ring.classList.remove("down");
    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };

    const loop = () => {
      rx += (mx - rx) * 0.75;
      ry += (my - ry) * 0.75;
      place(ring, rx, ry);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      root.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
