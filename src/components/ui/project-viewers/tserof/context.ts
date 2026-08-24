"use client";

import {createContext, useContext, type RefObject} from "react";

/**
 * 스테이지 셀렉트 보드 — 이 방의 유일한 진행 지표.
 *
 * 스펙(portfolio-specs/10-tserof.md A-5)은 11칸이었지만, PDF 의 실제 트러블이
 * 네 건이고 유저테스트가 따로 한 장을 차지해 **13칸**으로 늘렸다.
 * 슬롯 번호는 "00"~"12", 라벨은 아래 SLOTS 가 단일 출처다.
 */
export const SLOTS = [
  {n: "00", label: "부팅"},
  {n: "01", label: "소개"},
  {n: "02", label: "점프"},
  {n: "03", label: "저장 설계"},
  {n: "04", label: "트러블 01"},
  {n: "05", label: "트러블 02"},
  {n: "06", label: "스테이지"},
  {n: "07", label: "트러블 03"},
  {n: "08", label: "트러블 04"},
  {n: "09", label: "유저테스트"},
  {n: "10", label: "구조"},
  {n: "11", label: "결과"},
  {n: "12", label: "회고"}
] as const;

export const SLOT_TOTAL = SLOTS.length;

/** 새로고침해도 열어둔 칸이 유지된다 — 게임의 이어하기를 그대로 옮긴 것. */
export const UNLOCK_KEY = "tserof-unlocked";

export type TserofRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root 로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;

  /** 지금까지 열린 칸의 최대 인덱스(0-based). */
  unlocked: number;
  /** 현재 보고 있는 칸. */
  current: number;
  /** 섹션이 화면에 들어오면 자기 인덱스로 부른다. 내려가지 않는다. */
  reach: (index: number) => void;

  /**
   * 부팅 오버레이와 영상 라이트박스에만 쓴다.
   * 스펙 A-8: **제어권 박탈 0회.** 본문에서는 절대 호출하지 않는다.
   */
  lockScroll: (locked: boolean) => void;
  announce: (message: string) => void;
  onClose: () => void;
};

const TserofContext = createContext<TserofRoomApi | null>(null);

export const TserofProvider = TserofContext.Provider;

export function useTserof(): TserofRoomApi {
  const api = useContext(TserofContext);
  if (!api)
    throw new Error("useTserof는 TserofRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
