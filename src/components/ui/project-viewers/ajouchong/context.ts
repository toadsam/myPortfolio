"use client";

import {createContext, useContext, type RefObject} from "react";

/** 흩어진 공지 장에서 방문자가 찾아내야 하는 공지 수 — 헤더 진행도의 분모. */
export const NOTICE_TOTAL = 6;

export type AjouRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;

  /** 흩어진 채널에서 방문자가 찾아낸 공지 수. 뒤로 스크롤해도 줄지 않는다. */
  noticeCount: number;
  raiseNoticeCount: (next: number) => void;

  /**
   * 새로고침 장에서 `try_files` 를 켰는지.
   * 이 방의 서사가 「배포가 무너졌다 → 한 줄로 고쳤다」라서 헤더가 이 값을 띄운다.
   */
  deployFixed: boolean;
  setDeployFixed: (fixed: boolean) => void;

  /** 엔트리 시퀀스처럼 화면을 잡는 연출용. 켠 쪽이 반드시 끄는 책임을 진다. */
  lockScroll: (locked: boolean) => void;
  /** 스크린리더 안내(aria-live). */
  announce: (message: string) => void;
  onClose: () => void;
};

const AjouContext = createContext<AjouRoomApi | null>(null);

export const AjouProvider = AjouContext.Provider;

export function useAjou(): AjouRoomApi {
  const api = useContext(AjouContext);
  if (!api)
    throw new Error("useAjou는 AjouchongRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
