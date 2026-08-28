"use client";

import {useEffect, useRef, useState, type RefObject} from "react";

/**
 * 단계별 등장 타임라인 — delays(ms)마다 해당 인덱스가 true 로 바뀐 배열을 돌려준다.
 *
 * 룸들은 의도적으로 자족적이다(각자 css·fonts·context 를 따로 둔다). 이 훅도
 * 수어지교 것과 같은 모양이지만 방끼리 얽히지 않게 이 방 안에 둔다 —
 * 한 방의 연출을 손보다가 다른 방이 깨지는 일이 없어야 한다.
 *
 * @param delays  각 단계가 켜지는 시각(ms).
 * @param start   false면 대기(섹션이 화면에 들어올 때 시작시키는 용도).
 * @param instant true면 타이머 없이 전부 즉시 true(동작 줄이기).
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
  ref: RefObject<T | null>,
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
