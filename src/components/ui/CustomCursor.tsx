"use client";

import {useEffect} from "react";

/**
 * 네온 링/닷 커스텀 커서 — 사이트 전역. 터치(coarse) 기기에서는 비활성.
 *
 * **이건 DOM 요소가 아니라 진짜 커서다.** 링과 닷을 캔버스에 한 번 그려 PNG 로 굽고,
 * `cursor: url(...)` 로 단다. 그리는 주체가 브라우저가 아니라 OS 라서
 * **메인 스레드가 아무리 멎어도 절대 안 밀린다.**
 *
 * 왜 이렇게까지 갔나(이 순서로 밟았다):
 *   1. 원래는 rAF 루프에서 `rx += (mx - rx) * 0.75` 로 링이 마우스를 쫓아갔다.
 *      60fps 라도 두 프레임(약 33ms) 뒤처진다.
 *   2. 관성을 빼고 pointerrawupdate 로 좌표를 바로 찍었다. 실측 오차 0px.
 *      그래도 밀렸다 — **DOM 으로 그리는 한 화면에 찍히는 건 다음 프레임**이고,
 *      마을이 GLB 를 파싱하느라 프레임이 안 나오는 구간에서는 그 프레임이 안 온다.
 *   3. 그래서 커서를 프레임 밖으로 꺼냈다. 지금은 마을이 멈춰 있어도 커서만은 움직인다.
 *
 * 덤: **포인터 이벤트 리스너가 통째로 없어졌다.** hover 판정은 CSS 선택자가 한다
 * (예전엔 mousemove 마다 `closest()` 로 DOM 을 거슬러 올라갔다). 마우스를 움직여도
 * 자바스크립트가 한 줄도 안 돈다.
 *
 * 대신 잃은 것: 34 → 52px 로 부드럽게 커지던 0.18초 전환. 커서 이미지는 애니메이션이
 * 안 되므로 즉시 갈아끼는 방식이다. 지연을 없애려고 맞바꾼 값이다.
 *
 * PNG 로 굽는 이유(SVG data URI 가 아니라): Safari 는 SVG 커서를 지원하지 않는다.
 * 캔버스의 shadowBlur 이 CSS box-shadow 와 결이 같아 원래 글로우도 그대로 살릴 수 있다.
 */

// 여기 걸리면 hover 커서. 예전 JS 판정에서 쓰던 목록 그대로다.
const INTERACTIVE = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[data-cursor="hover"]'
];

const GOLD = "#ffbe7a"; // 평소 링·닷
const HOT = "#ff9d38"; // 누를 수 있는 것 위

type Spec = {
  /** 캔버스 한 변. 링 지름 + 글로우가 다 들어가야 한다(Chrome 은 128 넘으면 무시). */
  box: number;
  /** 링 지름 — globals.css 에 있던 width/height 그대로. */
  ring: number;
  stroke: string;
  glow: number;
  glowColor: string;
  fill?: string;
};

const SPECS = {
  idle: {
    box: 64,
    ring: 34,
    stroke: GOLD,
    glow: 10,
    glowColor: "rgba(255, 190, 122, 0.5)"
  },
  hover: {
    box: 96,
    ring: 52,
    stroke: HOT,
    glow: 16,
    glowColor: "rgba(255, 157, 56, 0.5)",
    fill: "rgba(255, 157, 56, 0.08)"
  },
  down: {
    box: 64,
    ring: 26,
    stroke: GOLD,
    glow: 10,
    glowColor: "rgba(255, 190, 122, 0.5)"
  },
  // 누를 수 있는 것 위에서 누른 상태 — 예전에도 .hover.down 은 색은 hover, 크기는 down 이었다.
  hoverDown: {
    box: 64,
    ring: 26,
    stroke: HOT,
    glow: 16,
    glowColor: "rgba(255, 157, 56, 0.5)",
    fill: "rgba(255, 157, 56, 0.08)"
  }
} satisfies Record<string, Spec>;

type SpecName = keyof typeof SPECS;

/** 링 하나를 그려 PNG data URI 로 돌려준다. dpr 배로 크게 그려 두면 image-set 이 쓴다. */
function bake(spec: Spec, dpr: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.round(spec.box * dpr);
  const g = canvas.getContext("2d");
  if (!g) return "";
  g.scale(dpr, dpr);

  const mid = spec.box / 2;
  const r = spec.ring / 2 - 0.75; // 선 두께 1.5 의 절반만큼 안으로 — 바깥지름을 맞춘다

  g.beginPath();
  g.arc(mid, mid, r, 0, Math.PI * 2);
  if (spec.fill) {
    g.fillStyle = spec.fill;
    g.fill();
  }
  g.lineWidth = 1.5;
  g.strokeStyle = spec.stroke;

  // 글로우 먼저 두 번(box-shadow 만큼 번지게), 그 위에 또렷한 선을 얹는다.
  g.shadowColor = spec.glowColor;
  g.shadowBlur = spec.glow;
  g.stroke();
  g.stroke();
  g.shadowBlur = 0;
  g.stroke();

  // 가운데 닷 — 예전엔 별도 요소였다. 핫스팟이 여기라 위치는 정확히 같다.
  g.shadowColor = "rgba(255, 190, 122, 0.85)";
  g.shadowBlur = 6;
  g.beginPath();
  g.arc(mid, mid, 3, 0, Math.PI * 2);
  g.fillStyle = GOLD;
  g.fill();

  return canvas.toDataURL("image/png");
}

export function CustomCursor() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // 마우스 없는 기기는 스킵

    const at1: Partial<Record<SpecName, string>> = {};
    const at2: Partial<Record<SpecName, string>> = {};
    // 고해상도 화면에서 커서가 뭉개지지 않게 2배도 굽는다. 커서 이미지의 크기는
    // 고유 픽셀 수로 정해지므로, 2배짜리를 그냥 달면 커서가 두 배로 커진다 —
    // image-set 으로 "이건 2x 용"이라고 알려 줘야 한다.
    const wantsHiDpi = window.devicePixelRatio > 1;
    for (const name of Object.keys(SPECS) as SpecName[]) {
      at1[name] = bake(SPECS[name], 1);
      if (wantsHiDpi) at2[name] = bake(SPECS[name], 2);
    }
    if (!at1.idle) return; // 캔버스를 못 얻었다 — 조용히 기본 커서로 둔다

    const decl = (name: SpecName, keyword: string) => {
      const hot = SPECS[name].box / 2;
      const a = at1[name];
      const b = at2[name];
      const tail = `${hot} ${hot}, ${keyword} !important;`;
      // 첫 줄은 모든 브라우저용. image-set 을 아는 브라우저는 뒤 두 줄로 덮어쓴다.
      const lines = [`  cursor: url(${a}) ${tail}`];
      if (b) {
        lines.push(
          `  cursor: -webkit-image-set(url(${a}) 1x, url(${b}) 2x) ${tail}`,
          `  cursor: image-set(url(${a}) 1x, url(${b}) 2x) ${tail}`
        );
      }
      return lines.join("\n");
    };

    // 특이도 순서가 상태 우선순위를 만든다:
    //   누른 채 버튼 위 (0,2,2) > 누른 채 (0,2,1) > 버튼 위 (0,1,2) > 평소 (0,1,1)
    const base = "html.custom-cursor-active";
    const held = "html.custom-cursor-active.custom-cursor-down";
    const css = [
      `${base}, ${base} * {\n${decl("idle", "auto")}\n}`,
      `${INTERACTIVE.map(s => `${base} ${s}`).join(",\n")} {\n${decl(
        "hover",
        "pointer"
      )}\n}`,
      `${held}, ${held} * {\n${decl("down", "auto")}\n}`,
      `${INTERACTIVE.map(s => `${held} ${s}`).join(",\n")} {\n${decl(
        "hoverDown",
        "pointer"
      )}\n}`
    ].join("\n\n");

    const style = document.createElement("style");
    style.setAttribute("data-custom-cursor", "");
    style.textContent = css;
    document.head.appendChild(style);

    const root = document.documentElement;
    root.classList.add("custom-cursor-active");

    // 마우스를 **움직일 때는** 아무것도 안 돈다. 누를 때만 클래스 하나.
    const onDown = () => root.classList.add("custom-cursor-down");
    const onUp = () => root.classList.remove("custom-cursor-down");
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    // 창 밖에서 손을 떼면 mouseup 이 안 온다 — 눌린 커서로 굳는 걸 막는다.
    window.addEventListener("blur", onUp);

    return () => {
      root.classList.remove("custom-cursor-active", "custom-cursor-down");
      style.remove();
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  // 그릴 요소가 없다. 커서는 OS 가 그린다.
  return null;
}
