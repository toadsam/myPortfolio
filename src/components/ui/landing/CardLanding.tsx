"use client";

/**
 * 착륙장 — 이 사이트의 첫 화면 (2026-11-12. 표 착륙장 `TicketLanding` 을 대신한다).
 *
 * ## 모양
 *
 * 이력서 첫 화면과 같은 한 문장("학생회와 동아리에서 직접 겪은 불편을 웹 서비스로
 * 해결해 왔습니다") 아래에 **큰 물건 셋이 둥실 떠 있고, 물건이 곧 버튼**이다 —
 * 집(마을) · 문서(이력서) · 연장(공방). 이력서 물건만 인디고로 채워 주된 길을
 * 못박는다. 손을 올리면 물건이 튀고 밑에 한 줄 설명이 뜬다. 휴대폰에서는 물건 셋이
 * 세로 줄 셋으로 접힌다. 시안 다섯 중 본인이 고른 안(아티팩트 "착륙장 시안 다섯" 5번).
 *
 * 같은 날 아침까지는 둥근 카드 세 장이었다. "첫 문장이 없고 카드 안이 비어 메뉴처럼
 * 보인다"가 이유였다.
 *
 * ## 표 착륙장에서 그대로 가져온 규칙 (바꾸면 안 되는 것)
 *
 * - **three.js 는 한 줄도 없다.** `/` 가 별도 라우트인 유일한 이유가 무게다
 *   (`src/app/page.tsx` 머리 주석). 그림은 전부 인라인 SVG, 움직임은 CSS 뿐이다.
 * - **이름·직무·입사 시점·첫 문장은 `@/data/hero` 에서 읽는다.** `@/data/resume` 를
 *   import 하면 이력서 전체가 첫 화면 번들에 들어온다(측정 216→221KB).
 * - **신원 머리글과 푸터는 절대 배치다.** 무대가 세로 가운데 정렬이라 흐름에 넣으면
 *   물건들이 머리글 높이만큼 내려앉는다. 세로가 짧은 화면은 `max-height` 쿼리로
 *   입사 시점 → 직무 순으로 줄을 접는다.
 * - **PDF 는 푸터에 있다.** 서류 심사는 첨부 PDF 가 본체라 사이트를 안 열고 파일만
 *   받아 가는 경우가 많다.
 * - 마을·공방 청크는 **의도가 보일 때만**(물건에 포인터가 닿거나 포커스가 올 때)
 *   미리 받는다. 마운트 때 부르면 착륙장이 열리자마자 Draco 디코더까지 받는다.
 *
 * ## 색
 *
 * 토큰은 이력서(`resumeV2.css`)와 같은 값이다(인디고 `#4f46e5`). 두 화면이 한 사이트로
 * 읽히는 게 목적이라 바꿀 땐 두 파일을 같이 바꾼다. 그림 SVG 는 `var(--accent*)` 만
 * 읽으므로 색은 CSS 한 곳에서 바뀐다.
 */

import {Nunito} from "next/font/google";
import type {CSSProperties, ReactNode} from "react";
import {useMemo} from "react";
import {projects} from "@/data/projects";
import {autonomousNpcs} from "@/data/npcRoster";
import {portfolioLinks} from "@/data/links";
import {hero, resumePdf} from "@/data/hero";
import {villageBuildings} from "@/lib/constants";
import "./CardLanding.css";

// 숫자·라틴용 둥근 글꼴 — 이력서(`ResumeV2`)와 같은 설정. 한글은 레이아웃이 싣는
// Noto Sans KR(--font-body-kr)로 떨어진다. 글꼴 파일이지 JS 가 아니라 첫 화면 무게
// 규칙과 무관하다.
const nunito = Nunito({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap"
});

interface Props {
  onEnterVillage: () => void;
  onOpenResume: () => void;
  onOpenCommission: () => void;
  onPrepareVillage: () => void;
  /** 공방 물건에 마우스가 닿았을 때. 데스크톱에서만 실제로 뭔가 받는다. */
  onPrepareCommission: () => void;
  /** 이력서 물건에 닿았을 때. 라우트만 미리 받아 전환이 끊기지 않게 한다. */
  onPrepareResume: () => void;
}

const cv = (o: Record<string, string | number>) => o as CSSProperties;

/* 물건 셋. 이력서 첫 화면의 아령·DB 처럼 면으로만 된 두툼한 그림, 세 단계 색. */
const PicHouse = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M12 52 50 18l38 34v34H12z" fill="var(--accent-light)" />
    <path d="M20 56 50 29l30 27v24H20z" fill="var(--accent-mid)" />
    <path d="M6 54 50 14l44 40-6 6-38-34-38 34z" fill="var(--accent)" />
    <rect x="41" y="60" width="18" height="26" rx="5" fill="var(--accent)" />
    <rect x="25" y="58" width="11" height="11" rx="3.5" fill="#fff" />
    <rect x="64" y="58" width="11" height="11" rx="3.5" fill="#fff" />
    <rect x="62" y="20" width="10" height="16" rx="3" fill="var(--accent)" />
  </svg>
);
const PicDoc = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M24 10h36l18 18v62H24z" fill="var(--accent-light)" />
    <path d="M60 10v18h18z" fill="var(--accent-mid)" />
    <rect x="34" y="42" width="32" height="8" rx="4" fill="var(--accent)" />
    <rect x="34" y="56" width="30" height="8" rx="4" fill="var(--accent-mid)" />
    <rect x="34" y="70" width="20" height="8" rx="4" fill="var(--accent-mid)" />
  </svg>
);
const PicTools = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M18 70 52 36l12 12-34 34H18z" fill="var(--accent-mid)" />
    <path d="M52 36l12-12 12 12-12 12z" fill="var(--accent)" />
    <path d="M18 86V70h16z" fill="var(--accent-light)" />
    <path d="M62 62l8-8 20 20-8 8z" fill="var(--accent-light)" />
    <circle cx="28" cy="26" r="9" fill="var(--accent-light)" />
    <circle cx="28" cy="26" r="4" fill="var(--accent)" />
  </svg>
);

type Way = {
  id: "village" | "resume" | "atelier";
  pic: ReactNode;
  title: string;
  sub: string;
  go: () => void;
  prepare?: () => void;
  main?: boolean;
};

export function CardLanding({
  onEnterVillage,
  onOpenResume,
  onOpenCommission,
  onPrepareVillage,
  onPrepareCommission,
  onPrepareResume
}: Props) {
  // 숫자는 데이터에서 뽑는다. 하드코딩한 "27채"는 건물이 늘면 거짓이 된다.
  const counts = useMemo(
    () => ({
      buildings: villageBuildings.length,
      npcs: autonomousNpcs.length,
      projects: projects.length
    }),
    []
  );
  // 주소는 `data/links.ts` 것을 쓴다 — 여기 또 적으면 언젠가 한쪽만 바뀐다.
  const github = portfolioLinks.find(l => l.label === "GitHub");

  // **가운데가 이력서다.** 첫 독자가 채용 심사자라서. 휴대폰에서는 CSS `order` 로 맨 위.
  const ways: Way[] = [
    {
      id: "village",
      pic: PicHouse,
      title: "마을 걸어 보기",
      sub: `${counts.buildings}채 · 주민 ${counts.npcs}명 · 건물이 프로젝트`,
      go: onEnterVillage,
      prepare: onPrepareVillage
    },
    {
      id: "resume",
      pic: PicDoc,
      title: "이력서 보기",
      sub: `한 장으로 읽기 · 프로젝트 ${counts.projects}건 · PDF`,
      go: onOpenResume,
      prepare: onPrepareResume,
      main: true
    },
    {
      id: "atelier",
      pic: PicTools,
      title: "작업 의뢰하기",
      sub: "지하 공방 · AI 가 요구사항을 정리",
      go: onOpenCommission,
      prepare: onPrepareCommission
    }
  ];

  return (
    <div className={`cl-root ${nunito.variable}`}>
      <div className="cl-blobs" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {/* 신원. 물건보다 먼저 읽혀야 하므로 가장 먼저 들어온다. 유일한 h1. */}
      <header className="cl-head">
        <h1 className="cl-name">{hero.name}</h1>
        <p className="cl-role">{hero.roleTag}</p>
        <p className="cl-avail">{hero.availability}</p>
      </header>

      <main className="cl-stage">
        <div className="cl-hero">
          {/* 이력서 첫 화면과 같은 문장. 첫 화면만 보고 가는 사람에게도 사람 이야기가
              한 줄은 있어야 한다. 세 번째 줄("개발자 정재훈")은 이름이 위에 있어 뺀다. */}
          <h2 className="cl-hl">
            {hero.headlineLines[0]}
            <br />
            {hero.headlineLines[1]}
          </h2>
          <p className="cl-lead">어디로 갈지 하나를 고르세요.</p>
        </div>

        <div className="cl-ways">
          {ways.map((w, i) => (
            <button
              className={`cl-way${w.main ? " cl-main" : ""}`}
              key={w.id}
              onClick={e => {
                // 누른 물건의 판에만 view-transition-name 이 붙는다(CSS `.is-pressed`).
                // 그림이 줄며 사라지는 0.14초를 기다렸다가 이동한다 — 전환이 찍는 건 민짜 판이고,
                // 그 판이 화면 전체로 커진다(pushWithTransition 머리 주석). 두 번 누름은 무시.
                const el = e.currentTarget;
                if (el.classList.contains("is-pressed")) return;
                el.classList.add("is-pressed");
                window.setTimeout(w.go, 140);
              }}
              onFocus={w.prepare}
              onPointerEnter={w.prepare}
              style={cv({"--i": i, "--d": `${-i * 1.5}s`})}
              type="button"
            >
              <span className="cl-pic">{w.pic}</span>
              <span className="cl-lb">{w.title}</span>
              <span className="cl-sb">{w.sub}</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="cl-foot">
        <span>
          프로젝트 <b className="cl-num">{counts.projects}</b>
        </span>
        {github ? (
          <a href={github.href} rel="noreferrer" target="_blank">
            {github.value}
          </a>
        ) : null}
        <a download href={resumePdf}>
          ⬇ PDF 이력서
        </a>
      </footer>
    </div>
  );
}
