"use client";

import {createContext, useContext, type RefObject} from "react";

export type SueoRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  /** 헤더의 「손동작 n / 12」 — 방문자가 실제로 재생한 수어 동작 수. */
  signCount: number;
  /** 현재 값보다 클 때만 올린다(뒤로 스크롤해도 줄지 않게). */
  raiseSignCount: (next: number) => void;
  bumpSignCount: () => void;
  /** 엔트리 시퀀스처럼 화면을 잡는 연출용. 켠 쪽이 반드시 끄는 책임을 진다. */
  lockScroll: (locked: boolean) => void;
  /** 스크린리더 안내(aria-live). */
  announce: (message: string) => void;
  onClose: () => void;
};

export const SIGN_TOTAL = 12;

const SueoContext = createContext<SueoRoomApi | null>(null);

export const SueoProvider = SueoContext.Provider;

export function useSueo(): SueoRoomApi {
  const api = useContext(SueoContext);
  if (!api)
    throw new Error(
      "useSueo는 SueoDistrictRoom 내부에서만 사용할 수 있습니다."
    );
  return api;
}
