"use client";

/**
 * 장식 액자 — 마을 UI에서 '큰 것'을 담는 껍데기.
 *
 * globals.css 의 .v-frame / .v-frame-body 가 금속 두께와 안쪽 판을 만들고,
 * 여기서는 **네 귀퉁이 당초 장식**을 얹는다.
 *
 * 귀퉁이를 CSS 로 안 하고 SVG 로 하는 이유 두 가지:
 *   ① 당초(덩굴 무늬)는 그라디언트로 흉내 낼 수 있는 모양이 아니다. 기존
 *      .v-corner 는 13px 짜리 둥근 사각형이라 '못대가리'까지가 한계였다.
 *   ② currentColor 를 타므로 급마다 색만 바꿔 톤을 조절할 수 있다.
 *
 * 장식은 pointer-events:none 이다 — 액자 모서리가 버튼을 가려서 안 눌리는 일이
 * 없어야 한다(패널 안에 닫기 버튼이 모서리에 붙는 경우가 실제로 있다).
 */

import type {CSSProperties, ReactNode} from "react";

type Variant = "grand" | "plaque" | "bar";

/** 왼쪽 위 기준 당초 한 조각. 나머지 세 귀퉁이는 scale 로 뒤집어 쓴다. */
const CORNER_PATH =
  "M1.6 13.4C1.6 6.9 6.9 1.6 13.4 1.6M3.4 13.4c0-5.5 4.5-10 10-10M6.8 3.6c1.4 0 2.6 1.2 2.6 2.6S8.2 8.8 6.8 8.8 4.2 7.6 4.2 6.2 5.4 3.6 6.8 3.6z";

function Corner({
  flipX,
  flipY,
  size
}: {
  flipX?: boolean;
  flipY?: boolean;
  size: number;
}) {
  const style: CSSProperties = {
    position: "absolute",
    [flipY ? "bottom" : "top"]: -1,
    [flipX ? "right" : "left"]: -1,
    transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    transformOrigin: "center",
    pointerEvents: "none"
  };
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d={CORNER_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

const CORNER_SIZE: Record<Variant, number> = {
  grand: 20,
  plaque: 14,
  bar: 14
};

export function VillageFrame({
  children,
  variant = "plaque",
  className = "",
  bodyClassName = "",
  /** 귀퉁이 당초를 뺀다 — 가로로 아주 좁은 칩에서는 장식이 글자를 침범한다 */
  bare = false,
  style,
  // HUD 패널은 useDraggable 이 바깥 요소의 ref 를 잡는다. React 19 부터 함수
  // 컴포넌트가 ref 를 그냥 prop 으로 받으므로 forwardRef 가 필요 없다.
  ref,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  bodyClassName?: string;
  bare?: boolean;
  style?: CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style" | "className">) {
  const size = CORNER_SIZE[variant];
  // 귀퉁이 장식(absolute inset-0)의 기준점이 필요하다. 다만 globals.css 에
  // position 을 박으면 사용처의 `fixed` 를 이겨 버리므로(그 파일 주석 참고),
  // 여기서 클래스로 붙이되 **이미 위치가 잡힌 경우엔 건드리지 않는다.**
  const positioned = /(^|\s)(fixed|absolute|sticky)(\s|$)/.test(className);
  return (
    <div
      className={`v-frame v-frame--${variant} ${
        positioned ? "" : "relative"
      } ${className}`}
      ref={ref}
      style={style}
      {...rest}
    >
      <div className={`v-frame-body ${bodyClassName}`}>{children}</div>
      {bare ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-[#f0d69a]/55"
        >
          <Corner size={size} />
          <Corner flipX size={size} />
          <Corner flipY size={size} />
          <Corner flipX flipY size={size} />
        </span>
      )}
    </div>
  );
}
