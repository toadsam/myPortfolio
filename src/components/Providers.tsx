"use client";

import {MotionConfig} from "framer-motion";
import {InteractionLayer} from "@/components/InteractionLayer";

// 사용자의 "동작 줄이기" 설정을 존중 — framer-motion 전역에서 transform/layout 애니메이션을 자동 완화.
// InteractionLayer로 전 사이트 클릭에 "주스"(입자 버스트·햅틱)를 일괄 적용.
export function Providers({children}: {children: React.ReactNode}) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <InteractionLayer />
    </MotionConfig>
  );
}
