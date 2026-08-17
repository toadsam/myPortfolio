"use client";

/**
 * 금박 문장(紋章) — src/data/villageCrests.ts 의 글리프를 그린다.
 *
 * 색을 CSS 로 안 주고 SVG 안에서 그라디언트로 칠하는 이유: 컨셉의 아이콘은
 * 단색이 아니라 **위에서 빛을 받는 금붙이**다. 위쪽은 흰빛이 도는 상아색,
 * 아래로 내려가며 구리색으로 어두워진다. globals.css 의 .v-emboss 가 글자에
 * 쓰는 것과 같은 색 계단이라, 문장과 각인 글자가 같은 금속으로 읽힌다.
 *
 * 그라디언트 id 는 **인스턴스마다 달라야 한다.** 한 화면에 문장이 열 개 넘게
 * 뜨는데 id 가 겹치면 브라우저가 먼저 나온 정의를 전부에게 적용한다 — 크기가
 * 다른 문장들이 남의 그라디언트를 물려받아 색이 튄다. useId 로 피한다.
 */

import {useId} from "react";
import {type CrestName, villageCrests} from "@/data/villageCrests";

export function Crest({
  name,
  size = 18,
  className,
  /** 금박 대신 한 가지 색으로 — 구역 강조색을 입힐 때 쓴다 */
  tone
}: {
  name: CrestName;
  size?: number;
  className?: string;
  tone?: string;
}) {
  const gid = useId();
  const crest = villageCrests[name];

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {tone ? null : (
        <defs>
          <linearGradient id={gid} x1="0" x2="0.25" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff3d2" />
            <stop offset="34%" stopColor="#f6d68d" />
            <stop offset="63%" stopColor="#d4a044" />
            <stop offset="100%" stopColor="#f8e4b4" />
          </linearGradient>
        </defs>
      )}
      <path
        d={crest.d}
        stroke={tone ?? `url(#${gid})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={"w" in crest ? crest.w : 1.6}
      />
    </svg>
  );
}
