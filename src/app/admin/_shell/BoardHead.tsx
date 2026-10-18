"use client";

/**
 * 위에 붙은 머리 — 스크롤해도 떠 있는 결과판.
 *
 * 날짜 한 줄, 지도 + 루미, 고리 셋 + 송전 대기. "값을 만지면 마을이 켜진다"가 이
 * 화면의 약속이라, 지도는 스크롤 아래가 아니라 **손이 닿는 곳에 늘 보여야** 한다.
 * 예전 계기판의 kWh 막대·등급은 기록실로 보냈다. 숫자 세 개가 동시에 움직이면
 * 뭘 봐야 할지 모른다.
 */

import {useState} from "react";
import type {NpcPreview} from "@/lib/villageLightPreview";
import type {ActivityInput} from "@/types/live";
import {LiveVillagePreview} from "../_components/LiveVillagePreview";
import {DAILY_GOALS} from "../_lib/options";
import {isSoundOn, setSoundOn, sfx} from "../_lib/sfx";
import {LumiFace} from "./LumiFace";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function shortDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return `${d.getMonth() + 1}.${d.getDate()} ${WEEK[d.getDay()]}`;
}

const RING_R = 11;
const RING_L = 2 * Math.PI * RING_R;

export function BoardHead({
  date,
  isToday,
  hasRecord,
  form,
  npcPreview,
  studyOverrides,
  pending,
  pickNote,
  highlightIds,
  onShift,
  onToday,
  onPickBuilding,
  onMore
}: {
  date: string;
  isToday: boolean;
  hasRecord: boolean;
  form: ActivityInput;
  npcPreview: NpcPreview[];
  studyOverrides: Record<string, number>;
  pending: number;
  pickNote: string | null;
  /** 목표선을 넘긴 회로의 짝 건물 — 잠깐 조준 고리를 건다 */
  highlightIds: string[];
  onShift: (delta: number) => void;
  onToday: () => void;
  onPickBuilding: (buildingId: string) => void;
  onMore: () => void;
}) {
  const [sound, setSound] = useState(isSoundOn);
  const rings: [label: string, value: number, goal: number, color: string][] = [
    [
      "운동",
      form.workout_done ? form.workout_minutes : 0,
      DAILY_GOALS.workout,
      "var(--ab-c-workout)"
    ],
    ["공부", form.study_minutes, DAILY_GOALS.study, "var(--ab-c-study)"],
    ["코딩", form.coding_minutes, DAILY_GOALS.coding, "var(--ab-c-coding)"]
  ];

  return (
    <header className="ab-head">
      <div className="ab-head-top">
        <div className="ab-date-nav">
          <button
            aria-label="이전 날"
            onClick={() => onShift(-1)}
            type="button"
          >
            ◀
          </button>
          <button className="ab-date-lbl" onClick={onToday} type="button">
            {shortDate(date)}
            {isToday ? " · 오늘" : ""}
          </button>
          <button
            aria-label="다음 날"
            disabled={isToday}
            onClick={() => onShift(1)}
            type="button"
          >
            ▶
          </button>
        </div>
        {!hasRecord ? <span className="ab-empty-tag">빈 날</span> : null}
        <button
          aria-label={sound ? "효과음 끄기" : "효과음 켜기"}
          aria-pressed={sound}
          className="ab-icon-btn"
          onClick={() => {
            setSoundOn(!sound);
            setSound(!sound);
            if (!sound) sfx.tick(0.5);
          }}
          style={{marginLeft: "auto"}}
          type="button"
        >
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 9v6h4l5 4V5L8 9z" />
            {sound ? (
              <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
            ) : (
              <path d="M17 9l5 6M22 9l-5 6" />
            )}
          </svg>
        </button>
        <button
          aria-label="더보기"
          className="ab-icon-btn"
          onClick={onMore}
          type="button"
        >
          <svg fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="ab-stage">
        <div className="ab-map-wrap">
          <LiveVillagePreview
            caption=""
            form={form}
            highlightIds={highlightIds.length ? highlightIds : undefined}
            onPickBuilding={onPickBuilding}
            overrides={studyOverrides}
            study={{codingToday: 0, codingTotal: 0, csToday: 0, csTotal: 0}}
            wide
          />
          <span className={`ab-map-note${pickNote ? " is-warn" : ""}`}>
            {pickNote ?? "건물을 누르면 그 회로로"}
          </span>
        </div>
        <LumiFace npc={npcPreview.find(n => n.id === "guide-npc")} />
      </div>

      <div className="ab-rings">
        {rings.map(([label, value, goal, color]) => {
          const p = Math.min(1, value / goal);
          return (
            <span className="ab-ring" key={label}>
              <svg aria-hidden="true" viewBox="0 0 28 28">
                <circle
                  cx="14"
                  cy="14"
                  fill="none"
                  r={RING_R}
                  stroke="#232b34"
                  strokeWidth="4"
                />
                <circle
                  cx="14"
                  cy="14"
                  fill="none"
                  r={RING_R}
                  stroke={color}
                  strokeDasharray={`${p * RING_L} 99`}
                  strokeLinecap="round"
                  strokeWidth="4"
                  style={{transition: "stroke-dasharray .4s"}}
                  transform="rotate(-90 14 14)"
                />
              </svg>
              {label} <b>{value}</b>/{goal}
            </span>
          );
        })}
        <span className="ab-pend">
          송전 대기 <b>+{pending}</b>
        </span>
      </div>
    </header>
  );
}
