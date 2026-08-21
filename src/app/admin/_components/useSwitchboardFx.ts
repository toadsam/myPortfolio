"use client";

/**
 * 배전반이 살아 있게 만드는 잡다한 연출들을 한 군데 모은 훅.
 *
 * ## 왜 훅 하나에 몰아넣나
 *
 * 전부 **결과 쪽에만 걸리는 장식**이고, 어느 것도 React 상태를 건드리지 않는다.
 * 컴포넌트마다 흩어 놓으면 렌더가 돌 때마다 리스너가 붙었다 떨어지고, 끄고 싶을 때
 * 끌 곳이 여러 군데가 된다. 여기 하나면 `prefers-reduced-motion` 한 줄로 전부 멈춘다.
 *
 * ## 목업에서 하나 바꾼 것
 *
 * 원안은 포커스하면 **입력값 자체**를 랜덤 숫자로 굴리다 되돌렸다. 그 사이 React
 * state 가 그 쓰레기 값을 그대로 받고, 그때 저장을 누르면 잘못된 기록이 남는다.
 * 여기서는 같은 그림을 **덧씌운 유령 글자**로 만든다 — 진짜 값은 한 번도 안 바뀐다.
 *
 * ## 유휴 방전은 창이 보일 때만 돈다
 *
 * "가만히 있어도 살아있는 느낌"은 이 화면의 핵심이라 살렸지만, 탭을 내려놓거나
 * 창에서 손을 뗀 동안에도 매초 DOM 을 만드는 건 그냥 배터리 낭비다. 그래서
 * `visibilitychange` 와 `blur` 에서 타이머를 멈춘다.
 */

import {useEffect} from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** 살아 있는 회로의 레버에서 불꽃을 조금 튀긴다. */
function sparkFrom(lever: Element, count: number) {
  const row = lever.closest(".sw-row");
  if (!(row instanceof HTMLElement)) return;
  const lr = lever.getBoundingClientRect();
  const rr = row.getBoundingClientRect();
  const ox = lr.left - rr.left + lr.width / 2;
  const oy = lr.top - rr.top + lr.height / 2;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("span");
    spark.className = "sw-spark sw-spark--free";
    spark.style.left = `${ox}px`;
    spark.style.top = `${oy}px`;
    const angle = ((Math.random() * 150 - 75) * Math.PI) / 180;
    const dist = 24 + Math.random() * 40;
    spark.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    spark.style.setProperty("--ty", `${Math.sin(angle) * dist - 12}px`);
    row.appendChild(spark);
    window.setTimeout(() => spark.remove(), 640);
  }
}

export function useSwitchboardFx(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia(REDUCED).matches) return;
    // 손가락으로 쓰는 화면에는 마우스 연출이 의미가 없다
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const cleanups: (() => void)[] = [];

    /* 리스너는 전부 **document 에 위임**한다.
       처음엔 `.sw-main` 이나 버튼을 직접 찾아서 걸었는데, 이 훅은 잠금이 풀린
       바로 그 렌더에서 도는 반면 대시보드 DOM 은 그 다음 렌더에 생긴다. 그래서
       조회가 빈손으로 돌아왔고, 조명 추적과 자석 버튼만 조용히 죽어 있었다
       (불꽃과 파문은 위임이라 멀쩡했다 — 그래서 더 늦게 알아챘다).
       위임으로 바꾸면 요소가 언제 생기든 상관없다. */

    /* ── ① 회로 판을 따라다니는 조명 ─────────────────────────────────────
       마우스가 지나간 자리만 아주 옅게 밝아진다. 프레임마다 스타일을 쓰면
       레이아웃이 흔들리므로 CSS 변수만 갱신하고 색은 CSS 가 만든다. */
    let raf = 0;
    let pending: {el: HTMLElement; x: number; y: number} | null = null;
    let litMain: HTMLElement | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const main = target?.closest?.<HTMLElement>(".sw-main") ?? null;

      if (main !== litMain) {
        litMain?.classList.remove("is-lit");
        litMain = main;
        main?.classList.add("is-lit");
      }
      if (main) {
        const rect = main.getBoundingClientRect();
        pending = {
          el: main,
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        };
        if (!raf) {
          raf = requestAnimationFrame(() => {
            raf = 0;
            if (!pending) return;
            pending.el.style.setProperty("--sw-mx", `${pending.x}%`);
            pending.el.style.setProperty("--sw-my", `${pending.y}%`);
          });
        }
      }

      /* ── ③ 자석 버튼 ────────────────────────────────────────────────
         목업은 0.15 로 끌어당겼는데 저장 버튼이 그만큼 움직이면 누르려는 순간
         목표가 도망간다. 0.08 로 낮추고 최대 이동을 4px 로 묶었다. */
      const magnet =
        target?.closest?.<HTMLElement>(
          ".sw-busbar .sub-button, .sw-busbar button[type='submit'], .sw-save-main"
        ) ?? null;
      if (magnet !== lastMagnet) {
        if (lastMagnet) lastMagnet.style.transform = "";
        lastMagnet = magnet;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = Math.max(
          -4,
          Math.min((e.clientX - r.left - r.width / 2) * 0.08, 4)
        );
        const dy = Math.max(
          -4,
          Math.min((e.clientY - r.top - r.height / 2) * 0.08, 4)
        );
        magnet.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    let lastMagnet: HTMLElement | null = null;

    document.addEventListener("pointermove", onPointerMove);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onPointerMove);
      litMain?.classList.remove("is-lit");
      if (lastMagnet) lastMagnet.style.transform = "";
    });

    /* ── ② 회로 판 클릭 파문 ──────────────────────────────────────────── */
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          ".sw-lever, .sw-readout, .sw-gauge, button, input, select, a"
        )
      ) {
        return;
      }
      const row = target.closest<HTMLElement>(".sw-row");
      if (!row) return;
      const rect = row.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "sw-ripple";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      row.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 620);
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    /* ── ④ 저장 버튼에 손을 올리면 회로들이 차례로 반응한다 ───────────── */
    const onOver = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement)?.closest?.("button[type='submit']");
      if (!btn) return;
      document
        .querySelectorAll<HTMLElement>(".sw-row.is-live")
        .forEach((row, i) => {
          window.setTimeout(() => {
            row.classList.add("is-primed");
            window.setTimeout(() => row.classList.remove("is-primed"), 300);
          }, i * 50);
        });
    };
    document.addEventListener("pointerover", onOver);
    cleanups.push(() => document.removeEventListener("pointerover", onOver));

    /* ── ⑤ 유휴 방전 — 가만히 있어도 배전반이 살아 있다 ───────────────── */
    let idle = 0;
    const tick = () => {
      const live = document.querySelectorAll(".sw-row.is-live .sw-lever");
      if (live.length && Math.random() > 0.45) {
        const lever = live[Math.floor(Math.random() * live.length)];
        sparkFrom(lever, 1 + Math.floor(Math.random() * 3));
      }
    };
    const start = () => {
      if (idle) return;
      idle = window.setInterval(tick, 1400);
    };
    const stop = () => {
      window.clearInterval(idle);
      idle = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", stop);
    window.addEventListener("focus", start);
    cleanups.push(() => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", stop);
      window.removeEventListener("focus", start);
    });

    return () => cleanups.forEach(fn => fn());
  }, [enabled]);
}

/**
 * 판독창에 포커스가 들어오면 숫자가 자리를 찾아가듯 굴러간다.
 *
 * **진짜 값은 건드리지 않는다.** 목업은 `input.value` 를 직접 랜덤으로 덮었는데,
 * 그러면 그 사이 React state 가 쓰레기 값을 받는다. 여기서는 입력 위에 유령 글자를
 * 얹었다 지운다 — 그림은 같고 데이터는 안전하다.
 */
export function scrambleOverlay(input: HTMLInputElement) {
  if (window.matchMedia(REDUCED).matches) return;
  const real = input.value;
  if (!real || real.length > 4) return;
  const host = input.parentElement;
  if (!host) return;

  const ghost = document.createElement("span");
  ghost.className = "sw-scramble";
  ghost.setAttribute("aria-hidden", "true");
  ghost.textContent = real;
  host.appendChild(ghost);
  input.classList.add("is-scrambling");

  let step = 0;
  const timer = window.setInterval(() => {
    ghost.textContent = real
      .split("")
      .map((ch, i) =>
        i < Math.floor(step) ? ch : String(Math.floor(Math.random() * 10))
      )
      .join("");
    step += 0.5;
    if (step >= real.length) {
      window.clearInterval(timer);
      ghost.remove();
      input.classList.remove("is-scrambling");
    }
  }, 45);
}
