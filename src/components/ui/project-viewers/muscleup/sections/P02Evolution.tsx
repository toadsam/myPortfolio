"use client";

import {useCallback, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Caveat,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 02 — 1.0 → 2.0 · 들은 말과 고친 것
//
// 개발 실체: 발표자료 **두 개**가 근거다. 둘 다 지어낸 게 없다.
//   - MuscleUp.pdf (1.0, 28쪽) p.24 「사용자 피드백 & 개선 로드맵」 — 사용자 말 원문
//   - 득근득근2.0.pdf (2.0, 13쪽) — 그 말을 어떻게 고쳤는지
// 연출 장치: **사용자가 한 말을 먼저 보여 주고, 눌러야 고친 화면이 열린다.**
//            읽는 사람이 "그래서 뭘 했는데?" 를 스스로 묻게 만드는 순서다.
//
// 이 칸이 이 방에서 가장 강한 이유:
// 신입 포트폴리오에서 「사용자 피드백을 반영했다」는 거의 다 말뿐이다. 여기는
// **피드백 원문이 1.0 자료에, 반영 결과가 2.0 자료에** 남아 있어 문서 두 개가
// 서로를 증명한다. 그리고 **넷 중 셋만 했다** — 안 한 하나를 그대로 두는 것이
// 나머지 셋의 신뢰를 만든다. 지우지 말 것.
//
// 화면은 전부 2.0 발표자료에 실린 실제 캡처다. 홈 화면 배너에 참여자 얼굴이
// 있어 그 구간은 잘라내고 썼다(public/projects/muscleup/v2/).

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, cards: 3, after: 4};

type Change = {
  key: string;
  /** 1.0 p.24 에 적힌 사용자 말 원문 */
  voice: string;
  /** 2.0 에서 한 일 */
  did: string;
  detail: string;
  shot?: {src: string; alt: string; caption: string; w: number; h: number};
  /** 아직 안 한 것 */
  pending?: boolean;
};

const CHANGES: Change[] = [
  {
    key: "onboard",
    voice: "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요",
    did: "홈을 로비로 바꿨다",
    detail:
      "소개를 읽는 랜딩이 아니라 오늘 할 일을 고르는 첫 화면이 됐습니다. 「오늘 출석 시작」이 메인 액션이고, 그 아래 「지금 해야 할 일」 체크리스트가 남은 퀘스트를 셉니다.",
    shot: {
      src: "/projects/muscleup/v2/home-todo.webp",
      alt: "2.0 홈 — 지금 해야 할 일 · 캐릭터 미리보기 · 라운지 미리보기",
      caption: "첫 화면이 곧 오늘의 할 일 목록이 됐다",
      w: 659,
      h: 349
    }
  },
  {
    key: "social",
    voice: "다른 사람들과 더 많이 소통하고 싶어요",
    did: "실시간 라운지와 크루를 만들었다",
    detail:
      "게시판으로는 「같이 있다」가 안 됐습니다. 캐릭터 위치와 이모트를 Socket.IO 로 동기화하는 공간을 따로 만들고, 팀 단위 목표인 크루 챌린지를 붙였습니다. REST 로는 감당이 안 돼 실시간 서버를 :4001 로 분리했습니다.",
    shot: {
      src: "/projects/muscleup/v2/lounge.webp",
      alt: "실시간 라운지 — 접속자 수 · 핑 · 미니맵",
      caption: "좌상단에 접속자·핑·미니맵. 캐릭터가 같은 공간을 돌아다닌다",
      w: 1062,
      h: 750
    }
  },
  {
    key: "data",
    voice: "내 운동 데이터를 더 자세히 보고 싶어요",
    did: "기록을 캐릭터와 랭킹으로 돌려줬다",
    detail:
      "숫자를 더 보여 주는 대신 기록이 자라는 걸 보이게 했습니다. 레벨·티어·진화 단계가 아바타에 반영되고 공개 랭킹에 올라갑니다. 화면의 MASTER · Stage 8 · Level 85 가 character_profiles 테이블 컬럼 그대로입니다.",
    shot: {
      src: "/projects/muscleup/v2/character.webp",
      alt: "캐릭터 성장 — MASTER · Stage 8 · Level 85",
      caption: "티어·단계·점수가 전부 DB 컬럼에 그대로 있다",
      w: 648,
      h: 536
    }
  },
  {
    key: "speed",
    voice: "AI 답변이 나올 때까지 기다리는 게 길어요",
    did: "아직 못 했습니다",
    detail:
      "2.0 에서 AI 는 인바디 OCR 분석으로 오히려 더 무거워졌고, 응답 속도는 손대지 못했습니다. 스트리밍 응답과 캐싱이 다음 차례입니다. 넷 중 셋만 고쳤다고 적는 편이 정확합니다.",
    pending: true
  }
];

export function P02Evolution() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [open, setOpen] = useState<string | null>(null);

  const toggle = useCallback(
    (c: Change) => {
      setOpen(prev => {
        const next = prev === c.key ? null : c.key;
        if (next) announce(`${c.voice} — ${c.did}`);
        return next;
      });
    },
    [announce]
  );

  return (
    <Page index={2} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        02 · 1.0 → 2.0
      </Kicker>

      <div className="mt-4">
        <Heading
          text="한 번 만들고 나서 들은 말"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[760px]" style={rise(on[IDX.body], instant)}>
        <Body>
          1.0 은 <strong>보여 주는 홈페이지</strong>였습니다. 기능을 소개하고
          분위기를 전달하는 랜딩이었고, 그때까지는 그게 맞다고 생각했습니다.
          그런데 써 본 사람들이 남긴 말이 네 개 있었습니다.{" "}
          <strong style={{color: "var(--mu-accent)"}}>
            그 말들이 2.0 을 만들었습니다.
          </strong>{" "}
          아래 말풍선을 눌러 보세요 — 그래서 무엇을 고쳤는지 나옵니다.
        </Body>
      </div>

      <div
        className="mt-9 flex flex-col gap-3"
        style={rise(on[IDX.cards], instant)}
      >
        {CHANGES.map(c => {
          const isOpen = open === c.key;
          const tone = c.pending ? "var(--mu-warn)" : "var(--mu-accent)";
          return (
            <div
              key={c.key}
              className="rounded-md"
              style={{
                border: `1px solid ${isOpen ? tone : "var(--mu-border)"}`,
                background: "var(--mu-panel)"
              }}
            >
              <button
                type="button"
                onClick={() => toggle(c)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left"
              >
                <span
                  className="shrink-0 font-mono text-[11px] tracking-[0.18em]"
                  style={{color: "var(--mu-muted)"}}
                >
                  1.0 피드백
                </span>
                <span className="flex-1 text-[15px] leading-7 text-[var(--mu-text)] sm:text-[16px]">
                  “{c.voice}”
                </span>
                <span
                  className="shrink-0 font-mono text-[11px] font-bold"
                  style={{color: tone}}
                >
                  {isOpen ? "닫기" : c.pending ? "미해결" : "고친 것 보기 →"}
                </span>
              </button>

              {isOpen ? (
                <div
                  className="px-5 pb-5"
                  style={{borderTop: "1px solid var(--mu-border)"}}
                >
                  <p
                    className="mt-4 text-[17px] font-black"
                    style={{color: tone}}
                  >
                    {c.did}
                  </p>
                  <p className="mt-2 max-w-[760px] text-[14px] leading-7 text-[var(--mu-muted)]">
                    {c.detail}
                  </p>
                  {c.shot ? (
                    <div className="mt-4 max-w-[720px]">
                      <Shot
                        src={c.shot.src}
                        alt={c.shot.alt}
                        caption={c.shot.caption}
                        w={c.shot.w}
                        h={c.shot.h}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <Hint>
          넷 중 <strong>셋</strong>을 고쳤습니다. 마지막 하나는 아직입니다 —
          지운다고 아무도 모르겠지만, 남겨 두는 편이 나머지 셋을 믿게 만듭니다.
        </Hint>
      </div>

      <div
        className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.after], instant)}
      >
        <Panel label="성격이 바뀌었다">
          <p className="text-[13px] leading-6">
            정보 중심 → <strong>실행 중심</strong>. 홈은 로비가 되고, 출석은
            성장 데이터가 되고, 관리자 페이지는 운영 콘솔이 됐습니다.
          </p>
        </Panel>
        <Panel label="그래서 커졌다">
          <p className="text-[13px] leading-6">
            1.0 은 도메인 4개였습니다. 지금은{" "}
            <strong>8개 도메인 · 엔티티 31개 · 컨트롤러 28개</strong>. 늘어난
            쪽이 크루 · 캐릭터 · 이벤트 CMS 입니다.
          </p>
        </Panel>
        <Panel label="운영이 생겼다">
          <p className="text-[13px] leading-6">
            1.0 때 만들어만 두고 안 보던 <code>analytics_events</code> 와{" "}
            <code>audit_logs</code> 를 2.0 에서 관리자 콘솔로 꺼내 읽기
            시작했습니다.
          </p>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Shot
          src="/projects/muscleup/v2/admin.webp"
          alt="2.0 관리자 콘솔 — 개요 · 행동 추적 · 검수/콘텐츠 · 출석 기록 · 운영 자동화"
          caption="관리자 페이지가 대시보드가 됐다 — 탭 다섯 개가 각각 운영 업무 하나다"
          w={1400}
          h={1080}
        />
        <Caveat>
          이 칸의 근거는 발표자료 <strong>두 개</strong>입니다 — 1.0(28쪽)의
          「사용자 피드백 &amp; 개선 로드맵」과 2.0(13쪽)의 기능 소개. 피드백
          문장은 원문 그대로 옮겼고, 화면은 2.0 자료에 실린 실제 캡처입니다. 홈
          화면 배너에 참여자 얼굴이 있어 그 부분은 잘라냈습니다.
        </Caveat>
      </div>
    </Page>
  );
}
