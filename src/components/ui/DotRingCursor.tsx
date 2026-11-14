"use client";

/**
 * 점 + 고리 커서 — 흰 바탕 화면(`/` 착륙장, `/resume*`) 전용 (2026-11-13).
 *
 * 작은 인디고 점이 포인터에 딱 붙어 오고, 고리가 한 박자 늦게 따라온다. 누를 수 있는 것
 * (링크·버튼) 위에서는 고리가 커지며 연하게 차고, 누르면 줄어든다. 커서 후보 일곱 중
 * 본인이 고른 안(아티팩트 "커서 후보" 3번).
 *
 * 마을의 금색 커서(`CustomCursor.tsx`)와 **일부러 다른 방식**이다. 그쪽은 PNG 로 구워
 * `cursor: url()` 로 다는 OS 커서라 GLB 파싱으로 프레임이 멎어도 안 밀리지만, 그 대신
 * 크기가 부드럽게 변하지 못한다. 여기는 "고리가 늦게 따라오는 것" 자체가 모양이라
 * DOM 요소를 rAF 로 움직인다. 착륙장·이력서는 three 가 없어 프레임이 멎을 일이 없다.
 * 어느 쪽을 쓸지는 `CustomCursor` 가 주소를 보고 고른다.
 *
 * 규칙:
 * - `(pointer: fine)` 에서만. 휴대폰·태블릿은 아무것도 안 그린다.
 * - 글 입력칸(input·textarea·contenteditable) 위에서는 점·고리를 숨기고 I 자 커서로
 *   돌아간다. 안 그러면 글 쓰는 자리가 안 보인다.
 * - 모션 줄이기 설정이면 고리가 지연 없이 점에 붙는다(크기 전환은 CSS 가 같이 끈다).
 * - 색은 CSS 에 값으로 적는다 — 요소가 body 끝에 붙어 `.rv2`·`.cl-root` 의 `--accent`
 *   가 안 닿는다. 인디고를 바꾸면 `DotRingCursor.css` 도 같이 바꾼다.
 * - 루프는 고리가 점에 닿으면 멈추고 다음 움직임에 다시 돈다. 가만히 있을 때 CPU 0.
 */

import {useEffect} from "react";
import "./DotRingCursor.css";

// 고리가 커지는 대상. 마을 커서(`CustomCursor.INTERACTIVE`)와 같은 목록이되 글 입력칸은 뺀다.
const HOT =
  'a, button, select, label, summary, [role="button"], [data-cursor="hover"]';
// 이 위에서는 우리 커서를 숨기고 브라우저 I 자 커서를 쓴다(CSS `html.drc-text` 와 짝).
const TEXT =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]), textarea, [contenteditable=""], [contenteditable="true"]';

const FOLLOW = 0.18; // 고리가 한 프레임에 좁히는 거리 비율. 시안과 같은 값.

export function DotRingCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const follow = reduce ? 1 : FOLLOW;

    const dot = document.createElement("div");
    dot.className = "drc-dot";
    const ring = document.createElement("div");
    ring.className = "drc-ring";
    document.body.append(dot, ring);

    const root = document.documentElement;
    root.classList.add("drc-active");

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let shown = false;

    const step = () => {
      rx += (mx - rx) * follow;
      ry += (my - ry) * follow;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.2) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        // 첫 움직임: 고리가 화면 밖(-100)에서 날아오지 않게 그 자리에서 시작한다.
        shown = true;
        rx = mx;
        ry = my;
        root.classList.add("drc-shown");
      }
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const t = e.target as Element | null;
      const el = t && t.nodeType === 1 ? t : null;
      root.classList.toggle("drc-hot", !!el?.closest(HOT));
      root.classList.toggle("drc-text", !!el?.closest(TEXT));
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      root.classList.add("drc-down");
    };
    const onUp = () => root.classList.remove("drc-down");
    // 창 밖으로 나가면 숨긴다. mouseout 의 relatedTarget 이 null 이면 문서를 떠난 것.
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget === null) root.classList.remove("drc-shown");
    };
    const onOver = () => {
      if (shown) root.classList.add("drc-shown");
    };

    window.addEventListener("pointermove", onMove, {passive: true});
    window.addEventListener("pointerdown", onDown, {passive: true});
    window.addEventListener("pointerup", onUp, {passive: true});
    window.addEventListener("blur", onUp);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseover", onOver);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseover", onOver);
      root.classList.remove(
        "drc-active",
        "drc-shown",
        "drc-hot",
        "drc-text",
        "drc-down"
      );
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
}
