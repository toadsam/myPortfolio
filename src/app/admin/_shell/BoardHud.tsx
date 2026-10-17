"use client";

/**
 * 위쪽 계기판 — 스크롤해도 붙어 있는 한 줄.
 *
 * 날짜, 등급과 전력 막대, 연속 가동일만 둔다. 전력 막대의 빗금 부분은 **아직 송전하지
 * 않은 오늘 몫**이다. 저장하면 빗금이 실선으로 바뀐다 — "저장 안 했다"를 경고문 대신
 * 막대 모양으로 알려 준다.
 */

import {useState} from "react";
import type {PowerSummary} from "../_lib/power";
import {isSoundOn, setSoundOn, sfx} from "../_lib/sfx";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function shortDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return `${d.getMonth() + 1}.${d.getDate()} ${WEEK[d.getDay()]}`;
}

export function BoardHud({
  date,
  isToday,
  hasRecord,
  power,
  pending,
  streak,
  busy,
  onShift,
  onToday,
  onCopyYesterday,
  onGithubSync,
  onLock
}: {
  date: string;
  isToday: boolean;
  hasRecord: boolean;
  power: PowerSummary;
  /** 아직 송전하지 않은 전력 */
  pending: number;
  streak: number;
  busy: boolean;
  onShift: (delta: number) => void;
  onToday: () => void;
  onCopyYesterday: () => void;
  onGithubSync: () => void;
  onLock: () => void;
}) {
  const [sound, setSound] = useState(isSoundOn);
  const [menu, setMenu] = useState(false);
  const span = Math.max(1, power.next - power.floor);
  const filled = Math.min(100, ((power.total - power.floor) / span) * 100);
  const pend = Math.max(0, Math.min(100 - filled, (pending / span) * 100));

  return (
    <header className="ab-hud">
      <div className="ab-hud-row">
        <span className="ab-eyebrow">Village Control Board</span>
        <button
          aria-label={sound ? "효과음 끄기" : "효과음 켜기"}
          aria-pressed={sound}
          className="ab-icon-btn"
          onClick={() => {
            setSoundOn(!sound);
            setSound(!sound);
            if (!sound) sfx.tick();
          }}
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
        <div className="relative">
          <button
            aria-expanded={menu}
            aria-label="더보기"
            className="ab-icon-btn"
            onClick={() => setMenu(m => !m)}
            type="button"
          >
            <svg fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          {menu ? (
            <div className="ab-menu" onClick={() => setMenu(false)}>
              <button disabled={busy} onClick={onGithubSync} type="button">
                GitHub 커밋 동기화
              </button>
              <button onClick={onCopyYesterday} type="button">
                어제 기록 복사
              </button>
              <a href="/village">마을 보기</a>
              <button onClick={onLock} type="button">
                배전반 잠그기
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="ab-hud-row" style={{marginTop: 8}}>
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
        <div className="ab-streak">
          <svg
            fill="none"
            height="16"
            stroke="#ff9d38"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
          >
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
          </svg>
          <span className="ab-streak-lbl">연속 가동 </span>
          <b>{streak}</b>일
        </div>
      </div>

      <div className="ab-lv">
        <span className="ab-lv-badge">Lv.{power.level}</span>
        <div className="min-w-0 flex-1">
          <div className="ab-xp-bar">
            <i className="ab-xp-fill" style={{width: `${filled}%`}} />
            <i
              className="ab-xp-pend"
              style={{left: `${filled}%`, width: `${pend}%`}}
            />
          </div>
          <div className="ab-xp-txt">
            <span>
              {power.total.toLocaleString()} / {power.next.toLocaleString()} kWh
            </span>
            <span>
              송전 대기 <b>+{pending}</b>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
