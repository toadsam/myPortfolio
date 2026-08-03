"use client";

import {useEffect, useRef, useState} from "react";

/**
 * 원안의 `setTimeout(...)` 나열 타임라인을 그대로 옮기기 위한 훅.
 * delays(ms)마다 해당 인덱스가 true로 바뀐 boolean 배열을 돌려준다.
 *
 * @param delays  각 단계가 켜지는 시각(ms). 오름차순일 필요는 없다.
 * @param start   false면 대기(섹션이 화면에 들어올 때 시작시키는 용도).
 * @param instant true면 타이머 없이 전부 즉시 true(동작 줄이기 / 건너뛰기).
 */
export function useTimeline(
  delays: number[],
  start = true,
  instant = false
): boolean[] {
  const [done, setDone] = useState<boolean[]>(() => delays.map(() => instant));
  // 배열 리터럴이 매 렌더 새로 만들어져도 이펙트가 재실행되지 않도록 키로 비교한다.
  const key = delays.join(",");
  const skipped = useRef(false);

  useEffect(() => {
    const steps = key.length ? key.split(",").map(Number) : [];

    if (instant) {
      skipped.current = true;
      setDone(steps.map(() => true));
      return;
    }
    if (!start || skipped.current) return;

    setDone(steps.map(() => false));
    const timers = steps.map((ms, i) =>
      window.setTimeout(() => {
        setDone(prev => {
          if (prev[i]) return prev;
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, ms)
    );

    return () => timers.forEach(t => window.clearTimeout(t));
  }, [key, start, instant]);

  return done;
}

/** 섹션이 뷰포트에 들어왔는지 — 스크롤로 시작하는 타임라인의 트리거. */
export function useInView<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options?: IntersectionObserverInit
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        setInView(true);
        observer.disconnect();
      }
    }, options ?? {threshold: 0.15});

    observer.observe(el);
    return () => observer.disconnect();
    // options는 호출부에서 리터럴로 넘길 수 있어 의존성에 넣지 않는다(최초 1회만 관측).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return inView;
}
