"use client";

import {MotionConfig} from "framer-motion";

// 사용자의 "동작 줄이기" 설정을 존중 — framer-motion 전역에서 transform/layout 애니메이션을 자동 완화.
export function Providers({children}: {children: React.ReactNode}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
