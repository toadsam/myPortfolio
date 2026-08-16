"use client";

import {createContext, useContext, type RefObject} from "react";

export type AClubRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  /** 중첩 호출을 카운트한다. 켠 쪽이 반드시 끄는 책임을 진다. */
  lockScroll: (locked: boolean) => void;
  /** 고정 헤더 오른쪽 판독값 — 필터 장이 실시간으로 갱신한다. */
  setReadout: (text: string) => void;
  /** 스크린리더용 상태 알림 */
  announce: (text: string) => void;
  /** 결과 장에 닿으면 페이지 바닥색을 한 단계 올린다. */
  setLit: (lit: boolean) => void;
  onClose: () => void;
};

const AClubContext = createContext<AClubRoomApi | null>(null);

export const AClubProvider = AClubContext.Provider;

export function useAClub(): AClubRoomApi {
  const api = useContext(AClubContext);
  if (!api)
    throw new Error("useAClub은 AClubRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
