"use client";

import {createContext, useContext, type RefObject} from "react";

export type FlashPatch = {
  /** 손전등 반경(px). 0이면 완전한 암전. */
  radius?: number;
  /** false면 커서를 따라가지 않는다(카메라 탈취 연출). */
  follow?: boolean;
  /** follow=false일 때 고정할 위치. 생략하면 현재 위치 유지. */
  x?: number;
  y?: number;
};

/** 제어권을 뺏는 연출은 세션당 한 번만 — 이미 봤거나 건너뛴 연출을 표시한다. */
export type SequenceKey = "takeover" | "scroll";

export type DarkLabRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  lightsOn: boolean;
  setLightsOn: (on: boolean) => void;
  /** 중첩 호출을 카운트한다. 켠 쪽이 반드시 끄는 책임을 진다. */
  lockScroll: (locked: boolean) => void;
  setFlash: (patch: FlashPatch) => void;
  sequencesDone: Record<SequenceKey, boolean>;
  markSequenceDone: (key: SequenceKey) => void;
  onClose: () => void;
};

const DarkLabContext = createContext<DarkLabRoomApi | null>(null);

export const DarkLabProvider = DarkLabContext.Provider;

export function useDarkLab(): DarkLabRoomApi {
  const api = useContext(DarkLabContext);
  if (!api) throw new Error("useDarkLab는 DarkLabRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
