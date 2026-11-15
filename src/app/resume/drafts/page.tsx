/**
 * 시안 모음 — `/resume/drafts`.
 * 본인 확인용 임시 쪽이다(검색 제외). 아직 적용하지 않은 이야기 배치 시안을 한곳에서 눌러 본다.
 * 시안을 적용하거나 버리면 이 목록에서 지우고, 다 끝나면 이 폴더를 지운다.
 */

import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "시안 모음 — 정재훈 이력서",
  robots: {index: false, follow: false}
};

const DRAFTS = [
  {
    href: "/resume/ajou-indigame-story",
    now: "/resume/ajou-indigame",
    name: "아주대탐험",
    note: "혼자 만든 Unity 3D. 표 네 줄(시점 전환 · 랜덤 스킬 · 웨이브와 보스 · 돌발 미션과 포탈). 캡처가 작아 큰 것 네 장만."
  },
  {
    href: "/resume/darklab-story",
    now: "/resume/darklab",
    name: "DarkLab",
    note: "3인 팀. 표 세 줄(응시 판정 · 할머니 이벤트 · 침대와 램프). 화면 구역 없이 결과에 세 시각 캡처."
  },
  {
    href: "/resume/otherside-vr-story",
    now: "/resume/otherside-vr",
    name: "The Other Side (VR)",
    note: "4인 팀. 표 세 줄(감지와 행동 분리 · 손전등 빛 11점 · 5초 뒤 추격 해제). 팀원 카메라 화면은 뺌."
  },
  {
    href: "/resume/monsterpoint-ar-story",
    now: "/resume/monsterpoint-ar",
    name: "INTO MONSTER POINT (AR)",
    note: "4인 팀. 문제를 전장 크기(팀원 코드)에서 무기 쪽으로 다시 씀. 표 세 줄(발사 조건 · 전환과 잠금 · 쿨타임 칸)."
  },
  {
    href: "/resume/ajou-adventure-story",
    now: "/resume/ajou-adventure",
    name: "아주분투",
    note: "저장소와 처음 대조함. 그림 네 장이 다른 게임 것이어서 실제 화면으로 바꿨고, 풀링 · 배경 전환 기준 · 배포 서술을 고침."
  }
];

export default function DraftsPage() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "56px 20px 96px",
        fontFamily: "system-ui, sans-serif",
        color: "#111118",
        lineHeight: 1.65
      }}
    >
      <h1 style={{fontSize: 28, fontWeight: 900, margin: 0}}>시안 모음</h1>
      <p style={{color: "#5b5f6b", marginTop: 8}}>
        아직 적용하지 않은 상세 페이지 시안 다섯 장입니다. 왼쪽이 시안, 오른쪽이
        지금 페이지입니다.
      </p>
      <ul style={{listStyle: "none", padding: 0, margin: "28px 0 0"}}>
        {DRAFTS.map(d => (
          <li
            key={d.href}
            style={{
              background: "#f3f4f7",
              borderRadius: 20,
              padding: "18px 20px",
              marginBottom: 12
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center"
              }}
            >
              <b style={{fontSize: 18, flex: "1 1 200px"}}>{d.name}</b>
              <Link
                href={d.href}
                style={{
                  background: "#4f46e5",
                  color: "#fff",
                  borderRadius: 99,
                  padding: "8px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none"
                }}
              >
                시안 보기
              </Link>
              <Link
                href={d.now}
                style={{
                  background: "#fff",
                  color: "#4f46e5",
                  borderRadius: 99,
                  padding: "8px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none"
                }}
              >
                지금 페이지
              </Link>
            </div>
            <p style={{margin: "8px 0 0", color: "#33363f", fontSize: 15}}>
              {d.note}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
