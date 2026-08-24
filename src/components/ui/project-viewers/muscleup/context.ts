"use client";

import {createContext, useContext, type RefObject} from "react";

/**
 * 레벨 = 이 방의 유일한 진행 지표.
 *
 * 스펙(portfolio-specs/04-muscleup.md A-5)은 Lv.1~Lv.9 의 11칸이었지만,
 * 포트폴리오 PDF(6~13쪽)의 실제 개발 내용이 더 많아 **13칸**으로 늘렸다.
 * 늘어난 칸: 스키마 설계 · AWS 인프라 · 운영 이슈가 각각 독립된 한 장이다.
 * 관람 곡선(동기 → 개발 밀도 최고조 → 정산)은 스펙 그대로 유지한다.
 */
export const LEVELS = [
  {n: "00", label: "캐릭터 생성"},
  {n: "01", label: "소개"},
  {n: "02", label: "서비스 루프"},
  {n: "03", label: "트러블 01"},
  {n: "04", label: "인증"},
  {n: "05", label: "커뮤니티"},
  {n: "06", label: "트러블 02"},
  {n: "07", label: "AI 코치"},
  {n: "08", label: "스키마"},
  {n: "09", label: "인프라"},
  {n: "10", label: "트러블 03"},
  {n: "11", label: "결과"},
  {n: "12", label: "회고"}
] as const;

export const LEVEL_TOTAL = LEVELS.length;

/** 새로고침해도 올려둔 레벨이 유지된다 — 서비스의 기록이 남는 것과 같다. */
export const LEVEL_KEY = "muscleup-level";
/** 레벨업 연출은 세션당 1회 (스펙 A-8). */
export const LEVELUP_KEY = "muscleup-levelup-fired";

export type MuscleUpRoomApi = {
  /** 스크롤 컨테이너 — IntersectionObserver root 로도 쓴다. */
  rootRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;

  /** 지금까지 오른 최대 레벨 인덱스(0-based). */
  level: number;
  /** 현재 보고 있는 칸. */
  current: number;
  /** 0~100 — 헤더 EXP 게이지. rAF 로 갱신되며 React state 를 거치지 않는다. */
  expRef: RefObject<number>;
  /** 섹션이 화면에 들어오면 자기 인덱스로 부른다. 내려가지 않는다. */
  reach: (index: number) => void;

  /**
   * 캐릭터 생성 시퀀스와 영상/이미지 라이트박스에만 쓴다.
   * 스펙 A-8: 본문에서는 절대 호출하지 않는다.
   */
  lockScroll: (locked: boolean) => void;
  announce: (message: string) => void;
  onClose: () => void;
};

const MuscleUpContext = createContext<MuscleUpRoomApi | null>(null);

export const MuscleUpProvider = MuscleUpContext.Provider;

export function useMuscleUp(): MuscleUpRoomApi {
  const api = useContext(MuscleUpContext);
  if (!api)
    throw new Error("useMuscleUp는 MuscleUpRoom 내부에서만 사용할 수 있습니다.");
  return api;
}
