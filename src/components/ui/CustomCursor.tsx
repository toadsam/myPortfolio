"use client";

import {useEffect, useRef} from "react";

// 네온 링/닷 커스텀 커서 — 사이트 전역. 터치(coarse) 기기에서는 비활성.
//
// **링은 관성으로 따라오지 않는다.** 예전엔 rAF 루프에서 `rx += (mx - rx) * 0.75`
// 로 쫓아가게 뒀는데, 60fps 라도 두 프레임(약 33ms) 뒤처진다. 그 정도면 "마우스가
// 뻑뻑하다"로 읽히고, 마을 로딩처럼 메인 스레드가 GLB 파싱에 붙들리는 구간에서는
// 프레임이 안 와서 눈에 띄게 늘어졌다. 지금은 닷도 링도 포인터 이벤트에서 곧바로
// 같은 좌표에 놓는다 — 쫓아갈 게 없으니 밀릴 것도 없다.
//
// 위치는 `pointerrawupdate` 로 받는다. pointermove 는 프레임당 한 번으로 묶여
// 나오지만 raw 는 장치가 보고하는 대로(고주사율 마우스면 125~1000Hz) 온다. 없는
// 브라우저는 pointermove 로 떨어진다. hover 판정(closest)은 **raw 에 붙이지 않는다** —
// DOM 을 뒤지는 일이라 초당 수백 번 돌리면 그것 때문에 다시 느려진다.
const INTERACTIVE =
  'a,button,input,select,textarea,label,[role="button"],[data-cursor="hover"]';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // 마우스 없는 기기는 스킵

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor-active");

    let visible = false;

    const place = (el: HTMLDivElement, x: number, y: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    // 위치만 옮긴다. 링과 닷을 같은 좌표에 놓아 지연을 0 으로 만든다.
    const track = (x: number, y: number) => {
      if (!visible) {
        visible = true;
        ring.style.opacity = "1";
        dot.style.opacity = "1";
      }
      place(dot, x, y);
      place(ring, x, y);
    };

    const onRaw = (event: PointerEvent) => {
      // 고주사율 장치는 한 프레임에 여러 번 보고한다. 합쳐 온 것 중 마지막만 쓰면
      // 되지만, getCoalescedEvents 는 배열을 새로 만드므로 그냥 최종 좌표를 쓴다.
      track(event.clientX, event.clientY);
    };

    // hover 판정은 여기서만 — raw 보다 훨씬 드물게 온다.
    const onMove = (event: PointerEvent) => {
      track(event.clientX, event.clientY);
      const target = event.target as Element | null;
      ring.classList.toggle("hover", !!target?.closest?.(INTERACTIVE));
    };

    const onDown = () => ring.classList.add("down");
    const onUp = () => ring.classList.remove("down");
    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };

    const hasRaw = "onpointerrawupdate" in window;
    if (hasRaw) {
      window.addEventListener("pointerrawupdate", onRaw as EventListener, {
        passive: true
      });
    }
    window.addEventListener("pointermove", onMove, {passive: true});
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      root.classList.remove("custom-cursor-active");
      if (hasRaw) {
        window.removeEventListener("pointerrawupdate", onRaw as EventListener);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
