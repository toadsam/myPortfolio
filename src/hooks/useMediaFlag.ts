"use client";

import {useEffect, useState} from "react";

/**
 * 미디어 쿼리 한 줄을 React 상태로.
 *
 * 첫 렌더에서는 `null` 이다 — 서버에는 화면이 없어서 모른다. `false` 로 시작하면
 * 수화 직후 레이아웃이 한 번 바뀌어 깜빡인다(useImmersiveCapable 과 같은 이유).
 * 부르는 쪽은 "아직 모르면 데스크톱 기본값" 으로 다룬다.
 */
export function useMediaFlag(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

/**
 * 휴대폰 레이아웃인가 — Tailwind `md` 미만(767px 이하). VillageScene 의 isMobile,
 * HUD 의 `md:hidden` 과 같은 기준이라 세 곳이 같은 화면에서 같이 바뀐다.
 */
export const PHONE_QUERY = "(max-width: 767px)";

export function usePhoneLayout(): boolean | null {
  return useMediaFlag(PHONE_QUERY);
}
