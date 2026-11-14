"use client";

/**
 * 경력 안내 캐릭터 「쪽지」 — /resume 과 /resume/<id> 오른쪽 아래에 떠 있다.
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

/** 모서리가 접힌 쪽지. 착륙장 가운데 이력서 물건과 같은 모양이다. */
export function NoteCharacter({
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
      <path
        d="M32 14H58L72 28V70a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8Z"
        fill="#4f46e5"
      />
      <path d="M58 14V28H72Z" fill="#aeaaf3" />
      <g className="cg-eyes">
        <circle cx="40" cy="44" r="4" fill="#ffffff" />
        <circle cx="56" cy="44" r="4" fill="#ffffff" />
      </g>
      <path
        className="cg-mouth"
        d="M42 54q6 5 12 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="36" y="65" width="24" height="3" rx="1.5" fill="#aeaaf3" />
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
        <NoteCharacter size={40} />
        <span className="cg-fab-label">{open ? "닫기" : "경력 물어보기"}</span>
      </button>
    </div>
  );
}
