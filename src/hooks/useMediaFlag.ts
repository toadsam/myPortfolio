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

/**
 * 가로로 든 휴대폰 — 폭은 `md` 를 넘지만(812px) 높이가 520px 이하이고 손가락
 * 기기다. 폭 기준 `md:` 클래스가 데스크톱 배치를 켜 버리므로 따로 본다.
 * 걷기 모드(조이스틱)는 이 상태를 전제로 짰다(2026-10-19).
 */
export const TOUCH_LANDSCAPE_QUERY =
  "(pointer: coarse) and (orientation: landscape) and (max-height: 520px)";

export function useTouchLandscape(): boolean | null {
  return useMediaFlag(TOUCH_LANDSCAPE_QUERY);
}

/** 세로로 든 손가락 기기 — 가로 안내 문을 띄우는 조건 */
export const COARSE_PORTRAIT_QUERY =
  "(pointer: coarse) and (orientation: portrait) and (max-width: 767px)";

/** VillageScene 의 가벼운 렌더 설정이 보는 기준 — 세로 휴대폰 + 가로 휴대폰 */
export const MOBILE_SCENE_QUERY = `${PHONE_QUERY}, ${TOUCH_LANDSCAPE_QUERY}`;
