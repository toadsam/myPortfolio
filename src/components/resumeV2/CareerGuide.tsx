"use client";

/**
 * 경력 안내 캐릭터 「두꺼비」 — /resume 과 /resume/<id> 오른쪽 아래에 떠 있다.
 *
 * 이 파일에는 버튼과 그림만 있다. 대화창(CareerGuidePanel)은 처음 누를 때 받아 온다.
 * /resume 은 three.js 없이 가벼운 화면이라, 안 쓰는 사람에게 대화 코드를 싣지 않는다.
 * 답은 백엔드 `POST /career/ask` 가 이력서·프로젝트 글에서 근거를 찾아 만든다
 * (backend/app/services/career_service.py).
 */

import dynamic from "next/dynamic";
import {useCallback, useEffect, useState} from "react";
import "./careerGuide.css";

const CareerGuidePanel = dynamic(() => import("./CareerGuidePanel"), {
  ssr: false
});

/**
 * 쪽지를 든 두꺼비. 본인 아이디(toadsam)에서 온 캐릭터다(2026-11-15, 시안 넷 중 본인이 고름).
 * 처음에는 모서리가 접힌 쪽지 모양이었고 이름도 「쪽지」였다. 같은 날 이름을 「두꺼비」로 바꿨다. 손에 든 쪽지는 그 흔적이다.
 * 눈은 가끔 깜빡이고, 답을 찾는 동안에는 눈동자가 쪽지 쪽으로 가고 쪽지가 까딱인다(careerGuide.css).
 */
export function GuideCharacter({
  size = 44,
  thinking = false
}: {
  size?: number;
  thinking?: boolean;
}) {
  return (
    <svg
      className={`cg-char${thinking ? " is-thinking" : ""}`}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
    >
      <ellipse cx="30" cy="82" rx="10" ry="4.5" fill="#4f46e5" />
      <ellipse cx="66" cy="82" rx="10" ry="4.5" fill="#4f46e5" />
      <g className="cg-body">
        <circle cx="33" cy="33" r="12" fill="#4f46e5" />
        <circle cx="63" cy="33" r="12" fill="#4f46e5" />
        <ellipse cx="48" cy="56" rx="31" ry="25" fill="#4f46e5" />
        <ellipse cx="48" cy="68" rx="17" ry="10" fill="#eae9fc" />
        <g className="cg-eyes">
          <circle cx="33" cy="33" r="7" fill="#ffffff" />
          <circle cx="63" cy="33" r="7" fill="#ffffff" />
          <g className="cg-pupils">
            <circle cx="34.5" cy="34" r="3.2" fill="#2a1fe0" />
            <circle cx="61.5" cy="34" r="3.2" fill="#2a1fe0" />
          </g>
        </g>
        <circle cx="26" cy="54" r="4" fill="#aeaaf3" />
        <circle cx="70" cy="54" r="4" fill="#aeaaf3" />
        <path
          d="M35 53q13 10 26 0"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <g className="cg-note" transform="rotate(12 76 66)">
          <rect
            x="69"
            y="58"
            width="14"
            height="17"
            rx="2.5"
            fill="#ffffff"
            stroke="#4f46e5"
            strokeWidth="2"
          />
          <rect x="72" y="63" width="8" height="2" rx="1" fill="#aeaaf3" />
          <rect x="72" y="67.5" width="8" height="2" rx="1" fill="#aeaaf3" />
        </g>
      </g>
    </svg>
  );
}

export function CareerGuide() {
  const [open, setOpen] = useState(false);
  // 한 번 연 뒤에는 닫아도 마운트를 유지한다. 대화가 남아 있어야 다시 열었을 때 이어서 읽는다.
  const [loaded, setLoaded] = useState(false);

  const toggle = useCallback(() => {
    setLoaded(true);
    setOpen(v => !v);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="cg-root">
      {loaded ? <CareerGuidePanel open={open} onClose={close} /> : null}
      <button
        type="button"
        className={`cg-fab${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="cg-panel"
        onClick={toggle}
        // 올리는 순간 대화창 코드를 미리 받는다. 누른 뒤 빈 틈이 없게.
        onPointerEnter={() => void import("./CareerGuidePanel")}
      >
        <GuideCharacter size={40} />
        <span className="cg-fab-label">
          {open ? "닫기" : "두꺼비에게 물어보기"}
        </span>
      </button>
    </div>
  );
}
