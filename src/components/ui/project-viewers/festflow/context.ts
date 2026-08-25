"use client";

import {createContext, useContext, type RefObject} from "react";

/**
 * 관제 모니터 = 이 방의 진행 지표. 한 대씩 신호가 들어온다.
 *
 * 스펙(portfolio-specs/03-festflow.md)은 11칸이었지만, 최종 발표자료(31장)에
 * AI 혼잡도 예측 · 모델 선택 · 근거 기반 챗봇 · 실제 축제 현장 검증이 더 있어
 * **13칸**으로 늘렸다. 관람 곡선(기동 → 개발 밀도 최고조 → 종료)은 그대로다.
 */
export const MONITORS = [
  {n: "00", label: "기동"},
  {n: "01", label: "소개"},
  {n: "02", label: "SSE"},
  {n: "03", label: "폴링 비교"},
  {n: "04", label: "지도"},
  {n: "05", label: "권한"},
  {n: "06", label: "AI 예측"},
  {n: "07", label: "폴백"},
  {n: "08", label: "모델 선택"},
  {n: "09", label: "챗봇"},
  {n: "10", label: "구조"},
  {n: "11", label: "현장 검증"},
  {n: "12", label: "회고"}
] as const;

export const MONITOR_TOTAL = MONITORS.length;

/** 새로고침해도 켜둔 모니터가 유지된다. */
export const MONITOR_KEY = "festflow-monitor";

export type FestFlowRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root 로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;

  /** 지금까지 켜진 최대 모니터 인덱스(0-based). */
  monitor: number;
  /** 현재 보고 있는 칸. */
  current: number;
  /** 섹션이 화면에 들어오면 자기 인덱스로 부른다. 내려가지 않는다. */
  reach: (index: number) => void;

  /**
   * 부팅 시퀀스와 이미지 라이트박스에만 쓴다.
   * 스펙 A-8: 본문에서는 절대 호출하지 않는다.
   */
  lockScroll: (locked: boolean) => void;
  announce: (message: string) => void;
  onClose: () => void;
};

const FestFlowContext = createContext<FestFlowRoomApi | null>(null);

export const FestFlowProvider = FestFlowContext.Provider;

export function useFestFlow(): FestFlowRoomApi {
  const api = useContext(FestFlowContext);
  if (!api)
    throw new Error("useFestFlow는 FestFlowRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
