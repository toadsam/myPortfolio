// 전시실 공용 훅 모음. tserof 룸에서 검증된 것을 그대로 뽑아 놓은 것으로,
// 새 전용 전시실(득근득근·아주분투·FestFlow·MyStock)은 전부 여기서 가져다 쓴다.
// tserof 는 자기 사본을 계속 쓴다 — 이미 동작하는 것을 건드리지 않는다.

"use client";

import {useEffect, useRef, useState, type RefObject} from "react";

/** 단계별 등장 타임라인 — delays(ms)마다 해당 인덱스가 true 로 바뀐 배열. */
export function useTimeline(
  delays: number[],
  start = true,
  instant = false
): boolean[] {
  const [done, setDone] = useState<boolean[]>(() => delays.map(() => instant));
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

/** 섹션이 뷰포트에 들어왔는지 — 한 번 true 가 되면 유지된다(타임라인 트리거). */
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
    // options 는 호출부에서 리터럴로 넘길 수 있어 의존성에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return inView;
}

/**
 * 지금 화면에 보이는가 — 들어오고 나가는 걸 계속 따라간다.
 * 모든 방의 공통 규칙: 물리 루프는 **뷰포트 밖에서 반드시 정지**한다.
 */
export function useOnScreen<T extends HTMLElement>(
  ref: RefObject<T | null>,
  threshold = 0.1
): boolean {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) setOnScreen(e.isIntersecting);
      },
      {threshold}
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  return onScreen;
}

/** 탭이 숨겨져 있는지 — 배터리를 위해 루프를 세운다. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const apply = () => setVisible(!document.hidden);
    apply();
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, []);
  return visible;
}

/** 프레임 루프. active 가 false 면 아예 돌지 않는다. */
export function useRafLoop(
  callback: (deltaMs: number, frame: number) => void,
  active: boolean
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      frame += 1;
      cbRef.current(delta, frame);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [active]);
}

/**
 * 스페이스·방향키 캡처 — **해당 컨테이너가 포커스/호버 상태일 때만.**
 *
 * 모든 방에서 가장 강한 규칙이다: 전역으로 잡으면 페이지 스크롤이 죽는다.
 * ("이걸 어기면 배포 금지")
 */
export function useKeyCapture<T extends HTMLElement>(
  ref: RefObject<T | null>,
  keys: string[],
  onDown: (key: string) => void,
  onUp?: (key: string) => void
): {
  active: boolean;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
} {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = hovered || focused;

  const downRef = useRef(onDown);
  downRef.current = onDown;
  const upRef = useRef(onUp);
  upRef.current = onUp;
  const keysRef = useRef(keys);
  keysRef.current = keys;

  useEffect(() => {
    if (!active) return;

    const isMine = (k: string) => keysRef.current.includes(k);

    function handleDown(e: KeyboardEvent) {
      if (!isMine(e.key)) return;
      e.preventDefault();
      downRef.current(e.key);
    }
    function handleUp(e: KeyboardEvent) {
      if (!isMine(e.key)) return;
      e.preventDefault();
      upRef.current?.(e.key);
    }

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [active]);

  return {
    active,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false)
    }
  };
}

/**
 * 섹션이 **화면 한가운데 띠를 지났는가** — 진행 지표(슬롯/레벨/스테이지/모니터)
 * 를 여는 용도.
 *
 * 왜 비율(threshold)을 안 쓰는가: 섹션이 뷰포트보다 길면 자기 높이의 28% 가
 * 화면에 들어오는 일이 **영원히 없다.** 실제로 festflow 의 10·11장은 2,400px
 * 이라 720px 뷰포트에서 비율이 0.30, 600px 짜리 화면에서는 0.25 로 떨어져
 * 그 칸이 끝내 안 열렸다. 그래서 높이와 무관한 「중앙선 통과」로 바꿨다.
 */
export function useCrossedCenter<T extends HTMLElement>(
  ref: RefObject<T | null>
): boolean {
  const [crossed, setCrossed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setCrossed(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) setCrossed(e.isIntersecting);
      },
      // 위아래 45% 를 잘라 남긴 가운데 10% 띠와 겹치면 참.
      {threshold: 0, rootMargin: "-45% 0px -45% 0px"}
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return crossed;
}
