"use client";

/**
 * 루미 얼굴 — NPC 반응을 글 세 줄 대신 얼굴 하나로.
 *
 * 기분은 `previewNpcMoods` 가 이미 계산한다(서버 규칙의 사본). 여기서는 그 문자열을
 * 표정 넷(졸림·차분·신남·뿌듯)으로 바꿔 그리기만 한다. 기분이 바뀌면 한 번 커지고,
 * 누르면 그 NPC 의 한 줄이 말풍선으로 뜬다.
 */

import {useEffect, useRef, useState} from "react";
import type {NpcPreview} from "@/lib/villageLightPreview";
import {sfx} from "../_lib/sfx";

type Face = "sleepy" | "calm" | "happy" | "proud";

const FACE_OF: Record<string, Face> = {
  sleepy: "sleepy",
  calm: "calm",
  curious: "calm",
  focused: "happy",
  busy: "happy",
  training: "happy",
  proud: "proud"
};

const FACE_PATH: Record<Face, [eyes: string, mouth: string]> = {
  sleepy: ["M22 28h6M36 28h6", "M24 40c2.5-1.5 5.5-2 8-2s5.5.5 8 2"],
  calm: ["M25 27h.01M39 27h.01", "M25 39h14"],
  happy: ["M25 27h.01M39 27h.01", "M24 37c2.5 2.5 5.5 4 8 4s5.5-1.5 8-4"],
  proud: [
    "M22 28l3-3 3 3M36 28l3-3 3 3",
    "M23 36c2.5 3.5 5.5 5.5 9 5.5s6.5-2 9-5.5z"
  ]
};

export function LumiFace({npc}: {npc: NpcPreview | undefined}) {
  const face: Face = FACE_OF[npc?.mood ?? "calm"] ?? "calm";
  const [open, setOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const last = useRef<Face | null>(null);

  useEffect(() => {
    if (last.current && last.current !== face && svgRef.current) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        svgRef.current.animate(
          [
            {transform: "scale(1)"},
            {transform: "scale(1.2)"},
            {transform: "scale(1)"}
          ],
          {duration: 350}
        );
    }
    last.current = face;
  }, [face]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 3400);
    return () => window.clearTimeout(t);
  }, [open]);

  const [eyes, mouth] = FACE_PATH[face];
  return (
    <button
      aria-expanded={open}
      aria-label={`${npc?.name ?? "루미"} · ${
        npc?.moodLabel ?? ""
      }. 한마디 듣기`}
      className="ab-lumi"
      onClick={() => {
        sfx.tick(0.4);
        setOpen(o => !o);
      }}
      type="button"
    >
      <svg aria-hidden="true" ref={svgRef} viewBox="0 0 64 64">
        <circle cx="32" cy="32" fill="#8fd1ff" opacity=".15" r="22" />
        <circle
          cx="32"
          cy="32"
          fill="none"
          r="18"
          stroke="#8fd1ff"
          strokeWidth="1.8"
        />
        <path
          d={eyes}
          fill="none"
          stroke="#8fd1ff"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d={mouth}
          fill="none"
          stroke="#8fd1ff"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </svg>
      <span className="ab-lumi-say">
        {npc?.name ?? "루미"} · {npc?.moodLabel ?? ""}
      </span>
      {open && npc ? <span className="ab-lumi-pop">{npc.line}</span> : null}
    </button>
  );
}
