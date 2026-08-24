"use client";

import {createContext, useContext, type RefObject} from "react";

/**
 * 스테이지 = 이 방의 진행 지표. 캐비닛 상단의 스테이지 표시등이 하나씩 켜진다.
 *
 * 스펙(portfolio-specs/08-ajou-adventure.md)은 11칸이었지만, 포트폴리오
 * PDF(27~34쪽)의 실제 개발 항목이 더 많아 **13칸**으로 늘렸다.
 * 늘어난 칸: UI↔게임 월드 연동, 이벤트 시스템이 각각 독립된 한 장이다.
 * 관람 곡선(어트랙트 → 개발 밀도 최고조 → 크레딧)은 스펙 그대로 유지한다.
 */
export const STAGES = [
  {n: "00", label: "어트랙트"},
  {n: "01", label: "소개"},
  {n: "02", label: "코어 루프"},
  {n: "03", label: "시점 전환"},
  {n: "04", label: "트러블 01"},
  {n: "05", label: "랜덤 스킬"},
  {n: "06", label: "건물 스테이지"},
  {n: "07", label: "몬스터 AI"},
  {n: "08", label: "트러블 02"},
  {n: "09", label: "UI ↔ 월드"},
  {n: "10", label: "이벤트"},
  {n: "11", label: "결과"},
  {n: "12", label: "회고"}
] as const;

export const STAGE_TOTAL = STAGES.length;

/** 새로고침해도 클리어한 스테이지가 남는다 — 오락실 캐비닛의 기록과 같다. */
export const STAGE_KEY = "ajou-stage";

export type AjouRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root 로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;

  /** 지금까지 도달한 최대 스테이지 인덱스(0-based). */
  stage: number;
  /** 현재 보고 있는 칸. */
  current: number;
  /** 섹션이 화면에 들어오면 자기 인덱스로 부른다. 내려가지 않는다. */
  reach: (index: number) => void;

  /**
   * 어트랙트 모드와 이미지 라이트박스에만 쓴다.
   * 스펙 A-8: 본문에서는 절대 호출하지 않는다(페이지 스크롤을 뺏지 말 것).
   */
  lockScroll: (locked: boolean) => void;
  announce: (message: string) => void;
  onClose: () => void;
};

const AjouContext = createContext<AjouRoomApi | null>(null);

export const AjouProvider = AjouContext.Provider;

export function useAjou(): AjouRoomApi {
  const api = useContext(AjouContext);
  if (!api) throw new Error("useAjou는 AjouRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
