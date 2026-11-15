// 득근득근 상세(v4 시안) 본문. 문장은 사실 확인을 거친 원고라 고치지 않는다.
// 2026-11-13 저녁: 저장소 HEAD(2026-10-20)를 다시 세어 네 군데만 보탰다(docs/BACKEND_EVIDENCE.md).
//   ① 타일 넷 추가(테스트 130 · 인덱스 28/복합 UNIQUE 24 · 마이그레이션 13+7 · 도메인 4→8). kind 는 plain 만
//      쓴다. miniFor 가 kind 별로 고정 데이터를 그리기 때문이다.
//   ② 카드 지표의 「도메인 4 → 8」을 「2.0배 · 20만 행」과 「테스트 130개」로.
//   ③ KPT 의 「테스트는 하네스·컨텍스트 로드·토큰 회전 5개」는 2026-10-11 시점 문장이라 지금 수로 고쳤다.
//   ④ 트러블슈팅 여섯째 「한 번만 일어나야 하는 일」(출석 UNIQUE + 재시도 · 보너스 행 잠금). 맨 뒤에 붙였다.
//      MuscleupDetail 이 challenges[2] 를 색인으로 쓰므로 앞 순서는 건드리지 않는다.
// 시안 muscleup-v4.html 의 data JSON 을 그대로 옮겼다.

import {stripCodeLinks} from "../../../lib/codeLinks";

export const MU4_DATA = {
  hero: {
    name: "정재훈",
    roleTag: "Web Full-Stack · Backend Developer"
  },
  contact: {
    email: "toadsam@naver.com",
    github: "https://github.com/toadsam"
  },
  intro:
    "운동 기록을 게임처럼 지속하게 만드는 피트니스 커뮤니티 플랫폼입니다. 헬스 동아리 회장으로 회원이 꾸준히 쓸 기능을 고민하며 만들었습니다. 1.0 은 기능을 소개하는 랜딩이었고, 써 본 사람들은 “어디서 뭘 해야 할지 모르겠다”고 했습니다. AI 응답 지연은 아직 남은 과제이지만, 홈을 출석과 캐릭터 성장이 보이는 로비로 바꾸고 관리자가 운영 기록을 보게 개편해 1.0 피드백 4건 중 3건을 반영했습니다.",
  tiles: [
    {
      kind: "plain",
      n: "55명",
      l: "가입 회원",
      sub: "운영 API 실측 2026.10.18",
      s: "운영 API 로 센 가입 회원 수입니다(2026.10.18)."
    },
    {
      kind: "dots",
      n: "3 / 4",
      l: "반영한 사용자 피드백",
      sub: "남은 1건은 AI 응답 지연",
      s: "1.0 발표자료 p.24 의 피드백 원문 4건과 2.0 발표자료를 대조했습니다. 남은 1건은 AI 응답 지연입니다."
    },
    {
      kind: "bars",
      n: "2.0배",
      l: "한 페이지 응답 · 20만 행 SQL 실측",
      sub: "목록 정렬만은 700배",
      s: "PostgreSQL 17.4, 합성 데이터 20만 행, 7회 중앙값. 목록 SQL 과 count SQL 의 합산이고 HTTP 응답 시간은 아닙니다. 한 페이지 117.4ms → 57.5ms, 목록 정렬만은 700배 빨라졌습니다."
    },
    {
      kind: "line",
      n: "100명",
      l: "p95 가 60ms 를 넘은 동시접속",
      sub: "50명까지는 p95 9ms",
      s: "100명에서 p95 85ms 로 설계 주기 60ms 를 넘었습니다. 50명은 9ms 였습니다. 한 대, 루프백, 16초 × 3회 중앙값, 고치기 전 측정값입니다."
    },
    {
      kind: "plain",
      n: "130개",
      l: "서버 테스트",
      sub: "32파일 · 2026.10 에 붙임",
      s: "28개 파일이 스프링을 통째로 띄우고 test 프로필이 로컬 MySQL 을 써서, CI 없이 로컬에서만 돕니다."
    },
    {
      kind: "plain",
      n: "28 · 24",
      l: "인덱스 · 복합 UNIQUE",
      sub: "지금 저장소의 엔티티 62개 기준",
      s: "출석의 (user_id, workout_date) 처럼 중복을 막는 UNIQUE 가 날짜 범위 조회 인덱스를 겸합니다."
    },
    {
      kind: "plain",
      n: "13 + 7",
      l: "SQL 마이그레이션 · Flyway 데이터",
      sub: "스키마는 아직 ddl-auto=update",
      s: "backend/sql 의 수동 SQL 13개(2025.12~2026.08)와 Flyway 데이터 마이그레이션 V1~V7(2026.10)입니다. 스키마 자체는 아직 Hibernate ddl-auto=update 가 만듭니다."
    },
    {
      kind: "plain",
      n: "4 → 8",
      l: "도메인 (1.0 → 2.0)",
      sub: "인증 · 커뮤니티 · 크루 · 채팅 등",
      s: "저장소 소스 기준입니다. 1.0 은 도메인 4개였고 2.0 에서 인증·커뮤니티·크루·친구 채팅·프로틴 공유·기록 AI·이벤트·운영 8개가 됐습니다."
    }
  ],
  project: {
    id: "muscleup",
    title: "득근득근 (MuscleUp)",
    links: [
      {
        label: "서비스 열기",
        href: "https://musclehub.co.kr"
      },
      {
        label: "시연 영상",
        href: "https://youtu.be/0X-BIADC1eQ"
      },
      {
        label: "GitHub",
        href: "https://github.com/toadsam/Ajou_MuscleUp"
      }
    ],
    card: {
      title: "득근득근 (MuscleUp)",
      subtitle:
        "사용자 피드백을 반영해 동아리 소개 홈페이지에 운동 기록·커뮤니티·AI 코칭 기능을 추가했습니다.",
      status: "운영중",
      renewed: "2026.10",
      renewal: false,
      period: "2025.09 ~ 진행 중",
      team: "개인 개발 (1.0 → 2.0 → 3.0)",
      role: "1.0 소개형 홈페이지 · 인증/배포 → 2.0 게임형 개편(캐릭터 · 랭킹 · 라운지) → 3.0 디자인 · 모임 구조 · 인증 재설계",
      metrics: [
        {
          value: "3 / 4",
          label: "반영한 사용자 피드백"
        },
        {
          value: "2.0배",
          label: "한 페이지 응답 · 20만 행 SQL"
        },
        {
          value: "55명",
          label: "가입 회원"
        }
      ],
      metricsSource:
        "피드백 3/4 는 1.0·2.0 발표자료 대조 · 2.0배는 PostgreSQL 17.4 합성 20만 행 7회 중앙값(목록+count SQL, HTTP 아님) · 회원 수는 운영 API 실측(2026.10.18)",
      image: "/projects/muscleup/v2/home-lobby.webp",
      highlights: [
        "Refresh Token Rotation 이 동시 재발급에서 로그아웃을 일으켜 2026.04 에 회전을 멈췄다가, 2026.10 에 폐기 후 30초 유예와 재사용 감지를 넣어 회전을 다시 도입했습니다. 토큰은 해시로만 저장하고 리프레시는 HttpOnly 쿠키로만 받으며 테스트 5개로 확인합니다.",
        "1.0 AWS 배포에서 HTTPS·Mixed Content·CORS credentials 문제를 해결했고(현재는 Railway · Vercel · S3), 1.0 사용자 피드백 4건 중 3건을 2.0 에 반영했습니다.",
        "운동 기록·커뮤니티·AI 코칭을 한 사용자 흐름으로 묶고, Access/Refresh 토큰을 HttpOnly 이중 쿠키로 분리했습니다."
      ]
    },
    rich: {
      tagline: "GAMIFIED FITNESS · 3-TIER FULL-STACK",
      heroImage: {
        src: "/projects/muscleup/v2/home-lobby.webp",
        label: "2.0 홈. 첫 버튼이 「오늘 출석 시작」입니다",
        ratio: "2/1"
      },
      beforeAfter: {
        before: {
          label: "1.0 · 둘러보라고 하는 첫 화면",
          shot: {
            src: "/projects/muscleup/v1/home-1.0.webp",
            label: "1.0 홈. 배포된 muscle-up.click 실제 화면",
            ratio: "2/1"
          },
          note: "버튼은 「받기」와 「둘러보기」 둘이고, 오늘 뭘 하라는 말이 없습니다. 아래 숫자 셋은 서버가 아니라 소스에 적힌 상수였습니다."
        },
        after: {
          label: "2.0 · 출석을 첫 동작으로 안내하는 로비",
          shot: {
            src: "/projects/muscleup/v2/lobby-responsive.webp",
            label: "2.0 로비 · 데스크톱과 모바일",
            ratio: "2/1"
          },
          note: "버튼 둘이 시키는 일 하나로 바뀌었습니다. 데스크톱은 「지금 해야 할 일」 카드, 모바일은 화면 아래 고정 「출석하기」입니다. 숫자도 소스 상수가 아니라 서버에서 읽습니다(연속 출석 2일, 이번 주 2/7)."
        }
      },
      resultShot: {
        src: "/projects/muscleup/api-map.svg",
        label: "백엔드 API 도메인 지도 · 2.0 공개 시점 · 컨트롤러 28개, 엔드포인트 136개",
        ratio: "21/9",
        caption:
          "컨트롤러 28개를 8개 도메인으로 묶었습니다. 크루는 여섯 기능이 컨트롤러 하나에 다 들어 있고, 자랑방은 글과 반응을 둘로 갈랐습니다. 같은 저장소 안에 상반된 두 선택입니다."
      },
      gallery: [
        {
          src: "/projects/muscleup/v2/lobby-responsive.webp",
          label: "2.0 로비 · 데스크톱과 모바일",
          ratio: "2/1",
          wide: true,
          caption:
            "데스크톱은 「지금 해야 할 일 · 캐릭터 · 라운지」 3열, 모바일은 같은 화면을 세로 한 줄로 접고 「출석하기 · 운동모임」을 화면 아래 고정 바로 내립니다. 왼쪽 카드의 연속 출석 2일, 이번 주 2/7 은 1.0 의 박힌 상수와 달리 그 사람 기록입니다."
        },
        {
          src: "/projects/muscleup/auth-sequence.svg",
          label: "인증 시퀀스 · 로그인, 만료, 재발급",
          ratio: "16/10",
          wide: true,
          fit: "contain",
          caption:
            "access 가 15분에 만료돼도 화면은 끊기지 않습니다. 여러 요청이 동시에 401 을 받아도 재발급은 axios 인터셉터에서 한 번만 나가고(single-flight), 나머지는 큐에서 기다렸다가 함께 재시도됩니다."
        },
        {
          src: "/projects/muscleup/v2/lounge.webp",
          fit: "contain",
          label: "실시간 라운지 · Socket.IO",
          ratio: "16/10",
          caption:
            "“다른 사람들과 더 많이 소통하고 싶어요” 에 대한 답입니다. 캐릭터 위치와 이모트가 실시간으로 맞춰지고, 그 동기화는 별도 Socket.IO 서버가 맡습니다."
        },
        {
          src: "/projects/muscleup/v2/character.webp",
          label: "캐릭터 성장 · 레벨, 티어, 진화 단계",
          ratio: "6/5",
          caption:
            "“내 운동 데이터를 더 자세히 보고 싶어요” 에 대한 답입니다. 화면의 MASTER, Stage 8, Level 85 가 ERD 의 character_profiles 컬럼 그대로입니다."
        },
        {
          src: "/projects/muscleup/v2/admin.webp",
          fit: "contain",
          label: "관리자 콘솔 · 탭 5개",
          ratio: "16/12",
          caption:
            "개요, 행동 추적, 검수/콘텐츠, 출석 기록, 운영 자동화. analytics_events 와 audit_logs 를 읽는 화면입니다. 1.0 에서는 테이블만 쌓고 보지 않던 것을 2.0 에서 화면으로 세웠습니다."
        },
        {
          src: "/projects/muscleup/v2/inbody.webp",
          fit: "contain",
          label: "인바디 AI 분석",
          ratio: "16/10",
          caption:
            "이미지나 PDF 를 올리면 OCR 로 읽어 현재 대 목표를 고정 축으로 비교하고 탄단지 비율을 냅니다. 1.0 의 루틴 추천이 체성분 분석으로 올라간 지점입니다."
        }
      ],
      tldr: [
        {
          k: "무엇을",
          v: "운동 기록을 게임처럼 지속하게 만드는 피트니스 커뮤니티 플랫폼"
        },
        {
          k: "왜",
          v: "헬스 동아리 회장으로 회원이 꾸준히 이용할 수 있는 기능을 고민했습니다. 1.0 은 기능을 소개하는 랜딩이었고, 써 본 사람들은 “어디서 뭘 해야 할지 모르겠다”고 했습니다"
        },
        {
          k: "결과",
          v: "홈에서 출석과 캐릭터 성장을 확인하고, 관리자가 운영 기록을 조회하도록 개편했습니다. 1.0 사용자 피드백 4건 중 3건을 반영했습니다. AI 응답 지연은 남은 과제로 기록했습니다."
        },
        {
          k: "리뉴얼",
          v: "1.0 2025.09 동아리 소개 홈페이지 → 2.0 2026.03 출석·운동 기록·커뮤니티 기능 추가 (1.0 피드백 4건 중 3건 반영)"
        },
        {
          k: "내 역할",
          v: "1.0 기획·개발과 2.0의 출석·커뮤니티·관리자 기능 개발을 혼자 맡았습니다."
        }
      ],
      demo: {
        repo: "https://github.com/toadsam/Ajou_MuscleUp"
      },
      secondRun: {
        label: "Renewal · 1.0 → 2.0",
        beforeHead: "1.0 · 2025.09",
        afterHead: "2.0 · 2026.03 리뉴얼",
        beforeTag: "1.0",
        afterTag: "2.0",
        addedTitle: "2.0 에서 새로 만든 것",
        prepTitle: "어떻게 다시 만들었나",
        title: "동아리 소개 홈페이지에 출석·운동 기록·커뮤니티 기능 추가",
        lead: "1.0 은 AI 상담, 자랑방, 프로틴, 프로그램 신청을 소개하는 정보 중심 홈페이지였습니다. 써 본 사람들의 피드백 넷을 기준으로 2026년 3월에 출석, 커뮤니티, 관리자 기능을 더했습니다. 홈은 로비, 출석은 성장 데이터, 관리자는 운영 콘솔이 됐습니다.",
        stats: [
          {
            n: "3 / 4",
            l: "반영한 1.0 피드백",
            s: "1.0·2.0 발표자료 대조"
          },
          {
            n: "4 → 8",
            l: "도메인",
            s: "1.0 자료 · 2.0 저장소"
          },
          {
            n: "111개",
            l: "2026.03 커밋",
            s: "저장소 커밋 기록"
          },
          {
            n: "55명",
            l: "가입 회원",
            s: "운영 API 실측 2026.10.18"
          }
        ],
        scope: [
          {
            k: "서비스 성격",
            before: "기능을 소개하는 정보 중심 홈페이지",
            after:
              "첫 화면에서 출석을 시작하고 운동 기록과 캐릭터 성장을 확인하는 서비스"
          },
          {
            k: "첫 화면",
            before:
              "「받기 · 둘러보기」 버튼 둘. 아래 숫자 셋은 소스에 박힌 상수",
            after:
              "「오늘 출석 시작」 하나. 연속 출석 · 이번 주 출석은 서버에서 읽은 그 사람 기록"
          },
          {
            k: "도메인",
            before: "4개 (AI 상담 · 자랑방 · 프로틴 · 프로그램 신청)",
            after: "8개 · 엔티티 31 · 컨트롤러 28"
          },
          {
            k: "소통",
            before: "게시판형 자랑방",
            after: "실시간 라운지(Socket.IO 서버 분리)와 크루 챌린지"
          },
          {
            k: "운영",
            before: "로그 테이블만 있고 보는 화면이 없었습니다",
            after:
              "관리자 콘솔 탭 5개(개요 · 행동 추적 · 검수 · 출석 기록 · 운영 자동화)"
          }
        ],
        shots: [
          {
            label: "1.0 · 둘러보라고 하는 첫 화면",
            src: "/projects/muscleup/v1/home-1.0.webp",
            alt: "득근득근 1.0 홈 화면. 받기와 둘러보기 버튼"
          },
          {
            label: "2.0 · 출석을 첫 동작으로 안내하는 로비",
            src: "/projects/muscleup/v2/home-lobby.webp",
            alt: "득근득근 2.0 로비. 오늘 출석 시작 버튼"
          },
          {
            label: "2.0 새로 · 실시간 라운지",
            src: "/projects/muscleup/v2/lounge.webp",
            alt: "득근득근 2.0 실시간 라운지 화면"
          },
          {
            label: "2.0 새로 · 관리자 콘솔",
            src: "/projects/muscleup/v2/admin.webp",
            alt: "득근득근 2.0 관리자 콘솔 화면"
          }
        ],
        remadeTitle: "피드백 넷에 대한 답",
        remade: [
          {
            t: "“처음 사용할 때 어디서 뭘 해야 할지 몰랐어요”",
            before: "첫 화면이 기능 소개와 둘러보기 버튼이었습니다",
            after:
              "홈을 로비로 바꾸고 첫 버튼을 「오늘 출석 시작」 하나로. 데스크톱은 「지금 해야 할 일」 카드, 모바일은 화면 아래 고정 「출석하기」",
            source:
              "1.0 발표자료 p.24 피드백 원문 · 2.0 발표자료 · 저장소 Home 화면"
          },
          {
            t: "“다른 사람들과 더 많이 소통하고 싶어요”",
            before: "글을 올리고 댓글을 다는 자랑방뿐이었습니다",
            after:
              "캐릭터 위치와 이모트가 실시간으로 맞춰지는 라운지(Socket.IO 를 별도 서버로)와 크루 챌린지",
            source: "1.0 발표자료 p.24"
          },
          {
            t: "“내 운동 데이터를 더 자세히 보고 싶어요”",
            before: "루틴 추천 수준이었습니다",
            after:
              "출석이 캐릭터 레벨 · 티어 · 진화로 쌓이고, 공개 랭킹과 인바디 OCR 분석으로 체성분까지 봅니다",
            source: "1.0 발표자료 p.24 · character_profiles 테이블"
          },
          {
            t: "“AI 답변이 나올 때까지 기다리는 게 길어요”",
            before: "응답을 통째로 기다리는 동기 호출이었습니다",
            after: "아직 못 고쳤습니다. 스트리밍으로 바꿔야 풀리는 문제입니다",
            source: "1.0 발표자료 p.24"
          }
        ],
        added: [
          {
            t: "실시간 라운지",
            what: "자주 바뀌는 위치, 채팅, 이모트를 실시간으로 맞추려고 Socket.IO 서버(:4001)로 따로 뺐습니다.",
            result:
              "REST 서버(:8080)와 실시간 서버가 갈린 3-tier 구조가 됐습니다."
          },
          {
            t: "캐릭터 성장과 랭킹",
            what: "출석과 운동 기록이 레벨, 티어, 진화 단계로 쌓입니다.",
            result: "출석과 운동 기록에 따라 캐릭터가 성장합니다."
          },
          {
            t: "인바디 AI 분석",
            what: "이미지나 PDF 를 올리면 OCR 로 읽어 현재와 목표를 고정 축으로 비교하고 탄단지 비율을 냅니다.",
            result: "1.0 의 루틴 추천에서 체성분 분석으로 올라갔습니다."
          },
          {
            t: "관리자 콘솔",
            what: "analytics_events 와 audit_logs 를 읽는 탭 5개를 세웠습니다.",
            result: "운영자가 행동 추적, 검수, 출석 기록을 화면에서 봅니다."
          }
        ],
        prep: "1.0 발표자료에 남은 사용자 피드백 원문 넷을 기준으로 무엇을 바꿀지 정했습니다. 작업은 2026년 2월 말부터 3월 말에 몰려 있고, 3월 한 달 커밋이 111개입니다. 이벤트, 챌린지, 출석, 캐릭터, 라운지, 관리자 개편 순서로 나갔습니다. 반영 결과는 1.0 과 2.0 발표자료를 대조해 확인했습니다.",
        gaps: [
          "AI 응답 지연 피드백은 아직 고치지 못했습니다. 스트리밍으로 바꿔야 합니다.",
          "55명은 운영 API 로 센 가입 회원 수입니다."
        ],
        source:
          "1.0 MuscleUp.pdf(28쪽)와 2.0 득근득근2.0.pdf(13쪽) 대조, 저장소 toadsam/Ajou_MuscleUp 커밋 기록과 소스입니다. 화면은 두 발표자료에 실린 캡처이고, 2.0 홈 배너의 참여자 얼굴 구간은 잘라 냈습니다."
      },
      meta: [
        {
          label: "기간",
          value: "2025.09 ~ 진행 중"
        },
        {
          label: "팀",
          value: "개인 개발 (1.0 → 2.0 → 3.0)"
        },
        {
          label: "역할",
          value:
            "1.0 소개형 홈페이지 · 인증/배포 → 2.0 게임형 개편(캐릭터 · 랭킹 · 라운지) → 3.0 디자인 · 모임 구조 · 인증 재설계"
        },
        {
          label: "스택",
          value:
            "React 19 · TS · TanStack Query · Spring Boot 3.5 · Socket.IO · JWT/OAuth · S3"
        },
        {
          label: "실행",
          value: "3-tier(FE:5173 · BE:8080 · Realtime:4001)"
        }
      ],
      heroScreen: {
        title: "muscleup/home",
        kind: "bars",
        bars: [
          {
            l: "REST API",
            p: 90,
            v: "Controller 28"
          },
          {
            l: "실시간",
            p: 70,
            v: "Socket.IO"
          },
          {
            l: "인증",
            p: 80,
            v: "JWT+OAuth"
          }
        ]
      },
      impact: [
        {
          n: "3",
          l: "실행 단위(FE/BE/RT)"
        },
        {
          n: "28",
          l: "Controller"
        },
        {
          n: "Socket.IO",
          l: "실시간 라운지"
        }
      ],
      features: [
        {
          t: "출석 & 캐릭터 성장",
          d: "운동 기록이 캐릭터 티어·레벨·진화로 반영"
        },
        {
          t: "실시간 라운지",
          d: "Socket.IO로 접속자 이동·채팅·이모트 동기화"
        },
        {
          t: "AI 인바디 상담",
          d: "이미지/PDF 기반 분석·계획·PDF 리포트(OpenAI·PDFBox)"
        },
        {
          t: "인증·운영",
          d: "JWT access/refresh + Google OAuth · 관리자 CMS"
        }
      ],
      problem:
        "운동 기록 말고도 회원이 함께 쓸 커뮤니티와 성장 기능을 더하려 했습니다. 기록이 캐릭터 성장, 랭킹, 실시간 커뮤니티로 바로 이어지는 경험이 필요했고, 자주 바뀌는 실시간 상태는 REST 와 떼어 내야 했습니다.",
      research: {
        quotes: [
          {
            q: "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요",
            who: "1.0 사용자 피드백 · 발표자료 p.24 원문"
          },
          {
            q: "다른 사람들과 더 많이 소통하고 싶어요",
            who: "같은 자료, 두 번째 피드백"
          },
          {
            q: "AI 답변이 나올 때까지 기다리는 게 길어요",
            who: "같은 자료, 네 번째 피드백"
          }
        ],
        stat: {
          n: "4",
          l: "1.0 사용자 피드백 원문 · 그중 셋을 2.0 에서 고쳤습니다"
        }
      },
      feedbackMap: [
        {
          said: "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요",
          did: "홈을 로비로. 첫 화면 CTA 를 「오늘 출석 시작」 하나로",
          done: true
        },
        {
          said: "다른 사람들과 더 많이 소통하고 싶어요",
          did: "실시간 라운지(Socket.IO) + 크루 챌린지",
          done: true
        },
        {
          said: "내 운동 데이터를 더 자세히 보고 싶어요",
          did: "캐릭터 레벨·티어·진화 + 공개 랭킹 + 인바디 OCR 분석",
          done: true
        },
        {
          said: "AI 답변이 나올 때까지 기다리는 게 길어요",
          did: "그때는 방법을 몰라 못 고쳤습니다. 응답을 통째로 기다리는 동기 호출이라 스트리밍으로 바꿔야 하는 일이었습니다",
          done: false
        }
      ],
      hypothesis:
        "운동 기록이 캐릭터 성장, 랭킹, 라운지로 바로 이어져야 다시 올 이유가 생긴다고 봤습니다. 자주 바뀌는 위치, 채팅, 이모트를 Socket.IO 서버로 떼어 내면 실시간 통신이 REST API 를 막지 않게 됩니다.",
      process: [
        {
          t: "루프 기획",
          d: "기록→성장"
        },
        {
          t: "REST 도메인",
          d: "8 도메인 · 28 컨트롤러"
        },
        {
          t: "인증",
          d: "JWT+OAuth"
        },
        {
          t: "실시간 분리",
          d: "Socket.IO :4001"
        },
        {
          t: "AI",
          d: "OpenAI·PDF"
        }
      ],
      diagrams: [
        {
          title: "System Architecture",
          viewBox: [1180, 470],
          caption:
            "왼쪽에서 경로가 갈라집니다. 자주 바뀌는 상태(위치, 채팅)만 Socket.IO 가 받고 나머지는 REST 로 갑니다. 점선 상자는 제가 만들지 않은 것입니다.",
          groups: [
            {
              label: "BROWSER",
              x: 20,
              y: 60,
              w: 250,
              h: 330
            },
            {
              label: "MY SERVERS",
              x: 360,
              y: 30,
              w: 400,
              h: 400
            },
            {
              label: "EXTERNAL",
              x: 860,
              y: 210,
              w: 300,
              h: 220,
              dashed: true
            }
          ],
          nodes: [
            {
              id: "fe",
              label: "React SPA",
              note: "Vite · :5173",
              sub: "pages 38 · components 23",
              x: 40,
              y: 150,
              w: 210,
              h: 150
            },
            {
              id: "api",
              label: "Spring Boot",
              note: ":8080 · REST",
              sub: "Controller 28 · Service 25",
              x: 385,
              y: 80,
              w: 350,
              h: 150,
              accent: true
            },
            {
              id: "rt",
              label: "Socket.IO",
              note: ":4001 · WebSocket",
              sub: "server.ts · rooms.ts · types.ts",
              x: 385,
              y: 310,
              w: 350,
              h: 95
            },
            {
              id: "db",
              label: "PostgreSQL",
              note: "운영 · JPA · Entity 31",
              sub: "로컬은 MySQL",
              x: 880,
              y: 70,
              w: 260,
              h: 80
            },
            {
              id: "s3",
              label: "AWS S3",
              note: "app.s3.enabled 로 전환",
              x: 880,
              y: 250,
              w: 260,
              h: 70
            },
            {
              id: "ai",
              label: "OpenAI GPT",
              note: "/ai/analyze · plan · chat",
              x: 880,
              y: 340,
              w: 260,
              h: 70
            }
          ],
          edges: [
            {
              from: [250, 195],
              to: [381, 140],
              label: "HTTP / REST",
              kind: "solid",
              labelAt: [316, 152]
            },
            {
              from: [258, 268],
              to: [381, 348],
              label: "WebSocket",
              kind: "double",
              labelAt: [316, 330]
            },
            {
              from: [383, 215],
              to: [268, 243],
              label: "401 → refresh → 재요청",
              kind: "dashed",
              labelAt: [338, 243]
            },
            {
              from: [737, 110],
              to: [876, 110],
              label: "JPA",
              kind: "solid",
              labelAt: [806, 100]
            },
            {
              from: [737, 170],
              to: [876, 285],
              label: "이미지",
              kind: "solid",
              bendX: 810,
              labelAt: [810, 218]
            },
            {
              from: [737, 200],
              to: [876, 375],
              label: "AI 코치",
              kind: "solid",
              bendX: 786,
              labelAt: [786, 320]
            }
          ]
        },
        {
          title: "Data Model · 31 tables / 8 domains",
          viewBox: [1200, 656],
          caption:
            "@Entity 31개를 도메인별로 묶었습니다. users 한 곳으로 관계 28개가 모이는 허브라, 탈퇴나 권한 변경이 전 도메인에 걸립니다.",
          nodes: [
            {
              id: "users",
              label: "users",
              note: "id · name · email · password",
              sub: "nickname · created_at · FK 28 유입",
              x: 30,
              y: 268,
              w: 292,
              h: 130,
              accent: true
            },
            {
              id: "d0",
              label: "인증 · 계정",
              note: "테이블 4 · users FK 2",
              sub: "User · RefreshToken · EmailVerification · UserBodyStats",
              x: 396,
              y: 8,
              w: 764,
              h: 76
            },
            {
              id: "d1",
              label: "커뮤니티",
              note: "테이블 3 · users FK 3",
              sub: "BragPost · BragComment · BragLike",
              x: 396,
              y: 88,
              w: 764,
              h: 76
            },
            {
              id: "d2",
              label: "크루",
              note: "테이블 4 · users FK 4",
              sub: "WorkoutCrew · Member · JoinRequest · CrewChallenge",
              x: 396,
              y: 168,
              w: 764,
              h: 76
            },
            {
              id: "d3",
              label: "친구 · 채팅",
              note: "테이블 4 · users FK 7",
              sub: "Friendship · FriendRequest · ChatRoom · ChatMessage",
              x: 396,
              y: 248,
              w: 764,
              h: 76
            },
            {
              id: "d4",
              label: "프로틴 공유",
              note: "테이블 4 · users FK 4",
              sub: "Protein · ShareApplication · ShareMessage · Review",
              x: 396,
              y: 328,
              w: 764,
              h: 76
            },
            {
              id: "d5",
              label: "기록 · AI",
              note: "테이블 4 · users FK 4",
              sub: "AttendanceLog · AiChatMessage · CharacterProfile · EvolutionHistory",
              x: 396,
              y: 408,
              w: 764,
              h: 76
            },
            {
              id: "d6",
              label: "이벤트 · 프로그램",
              note: "테이블 4 · users FK 1",
              sub: "Event · EventParticipant · CmsEvent · ProgramApplication",
              x: 396,
              y: 488,
              w: 764,
              h: 76
            },
            {
              id: "d7",
              label: "운영 · 로그",
              note: "테이블 4 · users FK 3",
              sub: "AuditLog · AnalyticsEvent · LoungeVisitLog · Inquiry",
              x: 396,
              y: 568,
              w: 764,
              h: 76
            }
          ],
          edges: [
            {
              from: [322, 333],
              to: [392, 46],
              label: "×2",
              kind: "solid",
              labelAt: [345, 171]
            },
            {
              from: [322, 333],
              to: [392, 126],
              label: "×3",
              kind: "solid",
              labelAt: [345, 216]
            },
            {
              from: [322, 333],
              to: [392, 206],
              label: "×4",
              kind: "solid",
              labelAt: [345, 261]
            },
            {
              from: [322, 333],
              to: [392, 286],
              label: "×7",
              kind: "solid",
              labelAt: [345, 305]
            },
            {
              from: [322, 333],
              to: [392, 366],
              label: "×4",
              kind: "solid",
              labelAt: [345, 350]
            },
            {
              from: [322, 333],
              to: [392, 446],
              label: "×4",
              kind: "solid",
              labelAt: [345, 395]
            },
            {
              from: [322, 333],
              to: [392, 526],
              label: "×1",
              kind: "solid",
              labelAt: [345, 440]
            },
            {
              from: [322, 333],
              to: [392, 606],
              label: "×3",
              kind: "solid",
              labelAt: [345, 485]
            }
          ]
        }
      ],
      architecture: [
        {
          tag: "View",
          name: "React 19 + TanStack Query",
          desc: "홈·라운지·랭킹·AI (PWA)"
        },
        {
          tag: "API",
          name: "Spring Boot 3.5",
          desc: "Controller 28개 · JWT/OAuth · S3 · PDFBox"
        },
        {
          tag: "Realtime",
          name: "Node + Socket.IO",
          desc: "라운지 위치·채팅·이모트 (:4001)"
        },
        {
          tag: "DB",
          name: "PostgreSQL (운영) · MySQL (로컬)",
          desc: "유저·기록·크루·이벤트 · Entity 31"
        }
      ],
      decisions: [
        {
          area: "실시간",
          pick: "Socket.IO 분리 서버",
          why: "빈번한 상태(위치·채팅)를 REST와 분리",
          alt: "REST 폴링(부하·지연)"
        },
        {
          area: "인증",
          pick: "JWT access/refresh · 회전은 멈췄다가 2026.10 재도입",
          why: "동시 401 이 서로의 토큰을 무효화해 2026.04 에 중단, 30초 유예 창과 재사용 감지를 넣어 2026.10 에 재도입",
          alt: "유예 없는 회전 유지, 또는 서버 세션 방식"
        },
        {
          area: "서버상태",
          pick: "TanStack Query",
          why: "캐시·재검증으로 서버 상태 일원화",
          alt: "수동 fetch(중복 상태)"
        },
        {
          area: "AI 검증",
          pick: "표본 8건 × 5축 품질 하네스",
          why: "프롬프트를 고칠 때 좋아졌는지 숫자로 봅니다",
          alt: "응답을 수동으로 확인"
        },
        {
          area: "파일",
          pick: "로컬/S3 추상화",
          why: "개발은 로컬, 배포는 S3로 전환",
          alt: "S3 고정(로컬 불편)"
        }
      ],
      coreCode: [
        {
          filename: "realtime/src/server.ts",
          caption:
            "이동은 올 때마다 보내지 않습니다. 60ms 틱에서 변한 게 있을 때만 한 번 보냅니다. 램프 표의 브로드캐스트/s 가 상한 16.7Hz 에 못 미치는 것도, 사람이 늘수록 그 값이 올라가는 것도 이 게이트 때문입니다",
          highlightLines: [10],
          lines: [
            'socket.on("player:move", (payload) => {',
            "  // …좌표 유효성 검사 생략",
            "  const updated = updatePlayerPosition(socket.id, payload.x, payload.y);",
            "  if (!updated) return;",
            '  scheduleBroadcast();            // "보낼 게 있다"고 표시만 한다',
            "});",
            "",
            "let pendingBroadcast = false;",
            "setInterval(() => {",
            "  if (!pendingBroadcast) return;  // 변한 게 없으면 아예 안 보낸다",
            "  pendingBroadcast = false;",
            "  broadcastPlayers();             // lounge:players 로 방 전원에게",
            "}, 60);"
          ]
        },
        {
          filename: "axios-interceptor.ts",
          caption: "401이면 refresh로 토큰 갱신 후 재요청",
          highlightLines: [3],
          lines: [
            "api.interceptors.response.use(ok, async (err) => {",
            "  if (err.response?.status === 401) {",
            '    await api.post("/api/auth/refresh"); // access 재발급',
            "    return api(err.config); // 원요청 재시도",
            "  }",
            "  throw err;",
            "});"
          ]
        }
      ],
      work: [
        {
          g: "기획",
          items: ["기록→성장→커뮤니티 루프", "캐릭터 성장 모델"]
        },
        {
          g: "프론트",
          items: ["홈·라운지·랭킹·AI 화면", "TanStack Query·PWA"]
        },
        {
          g: "백엔드",
          items: ["Controller 28개", "JWT/OAuth·S3·PDF"]
        },
        {
          g: "실시간",
          items: ["Socket.IO 라운지 서버", "room 상태 관리"]
        }
      ],
      challenges: [
        {
          title: "토큰 회전을 멈췄다가, 유예 창을 넣어 다시 도입했습니다",
          problem:
            "같은 refresh 토큰을 가진 두 재발급 요청이 겹치면, A가 토큰 값을 바꿔 저장한 뒤 B가 이전 값으로 조회해 B가 실패했습니다. 항상 나는 문제는 아니고 처리 순서에 따라 났습니다.",
          solution:
            "2026.04 에 새 refresh 토큰 생성과 기존 레코드 갱신을 빼고, 검증한 기존 토큰을 그대로 돌려줬습니다. 클라이언트의 single-flight(refreshing 플래그와 대기 큐로 재발급 요청을 하나로 묶는 장치)는 그 전부터 있었습니다.\n\n2026.10 에 회전을 다시 넣었습니다. 폐기한 토큰에 30초 유예를 두어 여러 탭의 동시 재발급을 허용하고, 유예가 지난 뒤 재사용되면 탈취로 보고 전부 삭제합니다. 토큰은 해시로만 저장하고 리프레시는 HttpOnly 쿠키로만 받으며 테스트 5개로 확인합니다.",
          code: {
            filename: "RefreshTokenService.java · 2026.04 당시",
            lines: [
              "// Keep refresh token stable to prevent race-condition",
              "// logouts when parallel requests trigger refresh.",
              "return current.getToken();"
            ]
          },
          evidence: {
            status: "전후 코드로 확인",
            note: "2026.04 에는 서버가 토큰을 유지하도록 바꿨고, single-flight 는 그 전부터 있던 클라이언트 장치입니다. 지금 코드는 2026.10 에 다시 넣은 회전 방식입니다.",
            url: "https://github.com/toadsam/Ajou_MuscleUp/blob/main/backend/src/main/java/com/ajou/muscleup/service/RefreshTokenService.java"
          }
        },
        {
          title: "인덱스로 목록은 700배, 그래도 count 57ms 가 남았습니다",
          perfAfter: true,
          problem:
            "아래 목록 네 곳이 모두 정렬 페이지네이션인데 정렬·필터 컬럼에 인덱스가 없었습니다. 회원 55명이라 화면에서는 느리지 않습니다. 데이터가 늘었을 때 어떻게 되는지 재 봤습니다.",
          solution:
            "인덱스를 넣자 실행 계획에서 정렬이 사라지고 인덱스를 거꾸로 훑습니다. 목록 네 개가 668~2472배 빨라졌습니다. 합성 데이터 20만 행, 7회 중앙값으로 목록 SQL 과 count SQL 의 합산 시간을 쟀습니다.\n\n그런데 Page 는 목록과 함께 count 를 날리고, 인덱스는 count 를 못 고칩니다(57.2 → 57.4ms). 다음 병목은 count 이고, 커서 페이지네이션이나 근사 카운트로 풀 문제입니다. 인덱스 넷은 21MB 를 씁니다.",
          code: {
            filename: "EXPLAIN (ANALYZE) · 자랑방 목록 20만 행 · 7회 중앙값",
            lines: [
              "// 인덱스 없음 · 60.2ms",
              "Limit  (cost=14445.15..14446.32 rows=10)",
              "  -> Gather Merge  (rows=166666)",
              "     -> Sort  Sort Key: created_at DESC",
              "        -> Parallel Seq Scan on brag_post   // 20만 행 전부",
              "",
              "// 인덱스 있음 · 0.084ms  (buffers: shared hit=4)",
              "Limit  (cost=0.42..2.44 rows=10)",
              "  -> Index Scan Backward using idx_brag_post_created",
              "",
              "// 그런데 같은 페이지의 count 는 57.2ms -> 57.4ms. 안 변한다."
            ]
          },
          evidence: {
            status: "전후 코드로 확인",
            note: "인덱스 커밋과 벤치마크 커밋이 따로 있습니다. SQL 을 잰 기록입니다.",
            url: "https://github.com/toadsam/Ajou_MuscleUp/commit/75092f449839548df22cc52e5b735c939d61e7d5"
          }
        },
        {
          title: "동시접속 100명에서 p95 85ms, 원인은 N² 브로드캐스트였습니다",
          problem:
            "인덱스는 표당 20만 행으로 쟀고, 따로 떼어 낸 실시간 서버가 몇 명까지 감당하는지는 따로 확인해야 했습니다.",
          solution:
            "동시접속을 25 → 300 으로 늘리며 ping:check 왕복 시간을 쟀습니다. 50명에서 p95 9ms, 100명에서 p95 85ms 로 설계 주기 60ms 를 넘었습니다. 예상보다 적은 인원에서 밀렸습니다.\n\n150명부터 지연이 커지고 200명에서 p95 1.1초였습니다. 변경이 있을 때마다 전체 사용자 목록을 전원에게 보내서 전송량이 N² 으로 늘었기 때문입니다. 과제는 뷰포트 컬링과 변경분만 보내기였고, 2026.10 의 후속 커밋에서 100ms 주기로 변경분만 보내고 변경이 없으면 보내지 않게 고쳤습니다.",
          code: {
            filename: "동시접속 램프 · 16초 × 3회 중앙값 (한 대·루프백)",
            lines: [
              "// 명     p50      p95  브로드캐스트/s   서버송신   1인수신  1인당B   CPU",
              "   25     2ms      7ms          6.4    2.7MB/s  110KB/s    795   3.0%",
              "   50     3ms      9ms          7.7   12.2MB/s  250KB/s    795   4.7%",
              "  100     8ms     85ms         11.4   63.3MB/s  648KB/s    795  12.2%",
              "  150    94ms    443ms         12.4  137.4MB/s  938KB/s    796  15.6%",
              "  200   499ms   1115ms         12.7  216.8MB/s 1110KB/s    796  13.5%",
              "  300 51435ms  55818ms         10.0  376.1MB/s 1284KB/s    797  18.9%",
              "",
              "// 1인당 바이트는 795B 고정인데 서버 송신은 140배. 전원 목록을 전원에게 = N^2.",
              "// 무너져도 CPU 는 안 오른다 = 연산이 아니라 송신에서 막힌다.",
              "// 재현: realtime/ 에서 npm run bench (bench/lounge-ramp.mjs)"
            ]
          },
          evidence: {
            status: "전후 코드로 확인",
            note: "측정 당시 코드는 전체 목록 브로드캐스트이고 2026.10 의 후속 커밋은 변경분 전송입니다. 위 그래프와 표는 고치기 전 측정값입니다.",
            url: "https://github.com/toadsam/Ajou_MuscleUp/commit/89bd39c7eaf7c773f2393bdb33d0681296c937a9"
          }
        },
        {
          title: "AI 답변이 맞는 말인지 사람이 매번 읽어 볼 수 없었습니다",
          problem:
            "인바디 분석은 체성분 수치를 받아 운동과 식단을 권하는 기능이라, 모델이 그럴듯하지만 위험한 조언을 해도 화면은 멀쩡해 보입니다. 프롬프트를 고칠 때마다 나아졌는지 나빠졌는지 판단할 근거가 없었습니다.",
          solution:
            "테스트 형태의 품질 하네스를 만들었습니다. 체형과 목표가 다른 표본 8건을 고정해 두고 매번 같은 입력을 넣은 뒤, 응답을 구조·진단 적합·우선순위·설명 깊이·안전성 5개 축으로 채점해 마크다운 리포트로 뽑습니다. OPENAI_API_KEY 가 없으면 스스로 건너뛰어 키 없는 환경의 빌드를 깨지 않습니다.",
          code: {
            filename: "AiInbodyQualityHarnessTest.java",
            lines: [
              'scores.put("structure", scoreStructure(...));',
              'scores.put("diagnosisFit", scoreDiagnosisFit(...));',
              'scores.put("priorityFit", scorePriorityFit(...));',
              'scores.put("detailDepth", scoreDepth(...));',
              'scores.put("safety", scoreSafety(...));'
            ]
          },
          evidence: {
            status: "코드로 확인",
            note: "고정 표본 8개와 규칙 채점 축 5개를 넣은 테스트입니다. API 키가 없으면 건너뜁니다. 통과 여부는 매기지 않고 점수만 뽑는 도구입니다.",
            url: "https://github.com/toadsam/Ajou_MuscleUp/commit/3380e55cfca9b57238d7d24607bc2f087ba04e97"
          }
        },
        {
          title: "브라우저·배포 환경에서 인증 방식이 달랐습니다",
          problem:
            "쿠키로 인증하는 환경과 Bearer 토큰으로 인증하는 환경이 섞여 로그인이 자주 풀렸습니다.",
          solution:
            "프론트에서는 Authorization 헤더가 없는 요청에 저장된 access 토큰을 Bearer 로 넣고 401 재발급 경로에 연결했습니다. 백엔드에서는 Bearer 를 먼저 읽고 없으면 access 쿠키를 읽게 했습니다. 서버 쪽 변경은 토큰을 꺼내는 자리까지이고, 서명과 만료 검증은 기존 코드가 합니다. 기존 Authorization 헤더를 그대로 두기 때문에 재시도에서 옛 토큰이 다시 가는 경우가 남아 있습니다.",
          code: {
            filename: "auth-note",
            lines: [
              "// FE: access 자동 첨부 + 401 → refresh 재시도",
              "// BE: 쿠키/Bearer 둘 다 파싱 → 환경 차이 흡수"
            ]
          },
          evidence: {
            status: "전후 코드로 확인",
            note: "프론트와 백엔드 두 커밋입니다. 헤더에서 토큰을 꺼내는 부분만 바꿨고 검증 로직은 그대로입니다.",
            url: "https://github.com/toadsam/Ajou_MuscleUp/commit/1b0e2146e7798cd97d91d8bdfa14124273d3319a"
          }
        },
        {
          title: "한 번만 일어나야 하는 일은 DB 가 지키게 했습니다",
          problem:
            "같은 사람이 같은 날 출석을 거의 동시에 두 번 보내면 (user_id, workout_date) UNIQUE 에 걸려 500 이 났습니다. 오늘 할 일 보너스와 수집 상자도 요청이 겹치면 두 번 지급될 수 있는 자리였습니다.",
          solution:
            "출석은 UNIQUE 제약을 그대로 두고 저장을 한 번 더 시도하게 했습니다. 먼저 들어간 기록이 이미 커밋돼 있으므로 두 번째 시도는 「같은 내용」이나 「수정」 경로로 처리되고, 그래도 겹치면 409 와 안내 문구를 돌려줍니다(2026.10.11).\n\n보너스와 상자는 행을 잠그고 읽습니다. 오늘의 퀘스트 행과 수집 행을 PESSIMISTIC_WRITE 로 읽은 뒤에만 지급 여부를 정합니다(2026.10.13). 친구 관계와 채팅방은 두 사용자 id 를 작은 쪽·큰 쪽으로 정규화해 (user_low_id, user_high_id) UNIQUE 로 한 쌍에 하나만 생기게 했습니다. 한계는 검증입니다.",
          code: {
            filename: "AttendanceServiceImpl.java",
            lines: [
              "try {",
              "    response = tx.execute(status -> work.get());",
              "} catch (DataIntegrityViolationException first) {",
              "    try {",
              "        response = tx.execute(status -> work.get()); // 한 번 더",
              "    } catch (DataIntegrityViolationException second) {",
              "        throw new ResponseStatusException(HttpStatus.CONFLICT,",
              '            "같은 날 출석이 동시에 저장되고 있어요. …");',
              "    }",
              "}"
            ]
          },
          evidence: {
            status: "코드로 확인",
            note: "출석 저장, 오늘의 퀘스트, 수집 세 곳에 적용했습니다.",
            url: "https://github.com/toadsam/Ajou_MuscleUp/blob/main/backend/src/main/java/com/ajou/muscleup/service/AttendanceServiceImpl.java"
          }
        }
      ],
      tech: [
        "React 19",
        "TypeScript",
        "TanStack Query",
        "Spring Boot 3.5",
        "Socket.IO",
        "JWT/OAuth",
        "AWS S3"
      ],
      resultScreens: [
        {
          title: "muscleup/lounge",
          kind: "feed",
          feed: [
            "접속자 위치 동기화",
            "라운지 채팅/이모트",
            "응원 이벤트",
            "파티 요청"
          ]
        },
        {
          title: "muscleup/ai",
          kind: "cards",
          cards: [
            {
              l: "인바디 분석",
              sub: "이미지/PDF"
            },
            {
              l: "운동 계획",
              sub: "추천"
            },
            {
              l: "AI 채팅",
              sub: "상담"
            },
            {
              l: "PDF 리포트",
              sub: "공유"
            }
          ]
        }
      ],
      metrics: [
        {
          n: "55명",
          l: "가입 회원"
        },
        {
          n: "3 / 4",
          l: "반영한 사용자 피드백"
        },
        {
          n: "700배",
          l: "목록 정렬 · 한 페이지는 2.0배"
        },
        {
          n: "100명",
          l: "실측한 동시접속 한계"
        }
      ],
      perf: {
        rows: [
          {
            label: "자랑방 목록",
            before: 60.21,
            after: 0.08,
            unit: "ms"
          },
          {
            label: "캐릭터 랭킹",
            before: 58.56,
            after: 0.05,
            unit: "ms"
          },
          {
            label: "공유 인증 관리",
            before: 45.45,
            after: 0.07,
            unit: "ms"
          },
          {
            label: "프로그램 신청",
            before: 56.87,
            after: 0.02,
            unit: "ms"
          },
          {
            label: "한 페이지 전체 (목록 + count)",
            before: 117.4,
            after: 57.5,
            unit: "ms"
          }
        ],
        note: "맨 아랫줄이 사용자가 기다리는 시간입니다. 목록 막대는 사라지는데 페이지 막대는 절반에서 멈춥니다. 남은 57.5ms 가 인덱스로 못 고치는 count 입니다. PostgreSQL 17.4, 20만 행, 7회 중앙값."
      },
      metricsNote:
        "회원 수는 운영 API 실측(2026.10.18)입니다. 피드백 4건은 1.0 발표자료 p.24 원문입니다. 응답 시간과 동시접속은 저장소의 스크립트로 다시 잴 수 있습니다(backend/sql/bench, realtime/bench, 순서는 docs/BENCHMARKS.md).",
      kptLabels: {
        keep: "1.0 에서 배운 것 · 개발",
        problem: "아직 남은 것",
        try: "2.0 에서 배운 것 · 운영·사용자"
      },
      kpt: {
        keep: [
          "1.0 · 비밀 값을 하드코딩했다가 배포가 부팅부터 실패해, 프로필과 비밀 값을 갈라 뒀습니다",
          "1.0 · 환경마다 한글이 깨져서 DB 커넥션 문자열과 JVM 인코딩을 같이 맞췄습니다",
          "1.0 · SPA 새로고침의 CloudFront 403 은 호스팅 설정에서 풀었습니다",
          "1.0 · 위치와 채팅은 Socket.IO 서버, 나머지는 REST 로 나눴습니다"
        ],
        problem: [
          "AI 응답 속도는 아직 손대지 못했습니다",
          "analytics_events 를 쌓고는 있지만 그것으로 판단한 적은 없습니다",
          "테스트는 2026.10 에 130개(32파일)로 늘었지만 28개 파일이 스프링을 통째로 띄우고 로컬 MySQL 을 요구합니다. H2 나 컨테이너 DB 로 옮겨야 CI 에 올릴 수 있습니다",
          "CI 가 없어 테스트는 로컬에서만 돕니다. 배포 빌드(nixpacks)도 테스트를 건너뜁니다"
        ],
        try: [
          "2.0 · Refresh 회전은 2026.04 에 멈췄다가 2026.10 에 30초 유예 창과 재사용 감지를 넣어 다시 켰습니다. 테스트 5개로 확인합니다",
          "2.0 · 홈을 로비로 바꿔 첫 버튼을 「오늘 출석 시작」 하나로 줄였습니다",
          "2.0 · ‘소통하고 싶다’는 말에 게시판 대신 실시간 라운지로 답했습니다",
          "2.0 · 운동 기록을 캐릭터 레벨, 티어, 랭킹으로 돌려줬습니다",
          "2.0 · 쌓기만 하던 analytics_events 와 audit_logs 를 관리자 콘솔에서 읽게 했습니다",
          "2.0 · 인덱스를 넣어 목록 정렬은 700배, 페이지 전체는 2.0배 빨라졌습니다. count 쿼리가 남은 병목입니다."
        ]
      },
      learningLead:
        "2.0 에서 제일 먼저 고친 것은 홈 첫 화면입니다. 버튼 둘을 「오늘 출석 시작」 하나로 줄였습니다.",
      learning:
        "1.0 에서는 배포, 인증, 인코딩 문제를 풀었습니다. 2.0 에서는 첫 화면, 회원 간 소통, 운동 데이터 확인 피드백을 반영했습니다. AI 응답 지연은 아직 못 풀었습니다."
    }
  },
  intro4: {
    show: "운동 기록을 게임처럼 지속하게 만드는 피트니스 커뮤니티 플랫폼입니다. 1.0 사용자 피드백 4건 중 3건을 반영해 2.0 으로 다시 만들었습니다.",
    bold: "1.0 사용자 피드백 4건 중 3건을 반영해 2.0 으로 다시 만들었습니다.",
    more: [
      "헬스 동아리 회장으로 회원이 꾸준히 쓸 기능을 고민하며 만들었습니다.",
      "1.0 은 기능을 소개하는 랜딩이었고, 써 본 사람들은 “어디서 뭘 해야 할지 모르겠다”고 했습니다.",
      "AI 응답 지연은 아직 남은 과제이지만, 홈을 출석과 캐릭터 성장이 보이는 로비로 바꾸고 관리자가 운영 기록을 보게 개편해 1.0 피드백 4건 중 3건을 반영했습니다."
    ]
  },
  hl4: [
    {
      show: "Refresh Token Rotation 을 2026.04 에 멈췄다가 2026.10 에 30초 유예와 재사용 감지를 넣어 다시 도입했습니다.",
      more: "토큰은 해시로만 저장하고 리프레시는 HttpOnly 쿠키로만 받으며 테스트 5개로 확인합니다.",
      bold: true
    },
    {
      show: "1.0 AWS 배포의 HTTPS·Mixed Content·CORS credentials 문제를 해결했습니다.",
      more: "현재는 Railway · Vercel · S3 에서 돌아갑니다. 1.0 사용자 피드백 4건 중 3건을 2.0 에 반영했습니다."
    },
    {
      show: "Access/Refresh 토큰을 HttpOnly 이중 쿠키로 분리했습니다.",
      more: "운동 기록·커뮤니티·AI 코칭을 한 사용자 흐름으로 묶었습니다."
    }
  ],
  fb4: {
    show: "운동 기록이 캐릭터 성장, 랭킹, 라운지로 바로 이어지게 만들었습니다. 자주 바뀌는 위치·채팅·이모트는 Socket.IO 서버로 떼어 내 REST API 를 막지 않게 했습니다.",
    bold: "자주 바뀌는 위치·채팅·이모트는 Socket.IO 서버로 떼어 내 REST API 를 막지 않게 했습니다.",
    todoCut: "그때는 방법을 몰라 못 고쳤습니다."
  },
  brief4: [
    {
      problem: "refresh 토큰 재발급이 겹치면 뒤의 요청이 실패했습니다.",
      did: "2026.04 에 회전을 멈추고 기존 토큰을 돌려줬습니다. 2026.10 에 30초 유예와 재사용 감지를 넣어 다시 도입했습니다.",
      result:
        "동시 재발급은 허용하고, 유예 뒤 재사용은 탈취로 보고 전부 삭제합니다."
    },
    {
      problem: "정렬 페이지네이션 네 곳에 인덱스가 없었습니다.",
      did: "20만 행에 인덱스 넷을 넣고 7회 중앙값으로 쟀습니다. 목록 SQL 은 668~2472배 빨라졌습니다.",
      result:
        "한 페이지는 117.4ms → 57.5ms 로 2.0배이고, 남은 57ms 는 count 입니다."
    },
    {
      problem: "실시간 서버가 몇 명까지 감당하는지 확인해야 했습니다.",
      did: "동시접속을 25 → 300 으로 늘리며 p95 를 쟀습니다. 100명에서 85ms 로 설계 주기 60ms 를 넘었습니다.",
      result:
        "원인은 N² 브로드캐스트였고, 후속 커밋에서 변경분만 보내게 고쳤습니다."
    },
    {
      problem: "AI 인바디 조언이 맞는지 사람이 매번 읽어 볼 수 없었습니다.",
      did: "표본 8건을 고정해 같은 입력을 넣고 응답을 5개 축으로 채점하는 테스트를 만들었습니다. 결과는 마크다운 리포트로 나옵니다.",
      result:
        "프롬프트를 고칠 때 나아졌는지 숫자로 봅니다. 키가 없으면 건너뜁니다."
    },
    {
      problem: "쿠키 인증과 Bearer 토큰 환경이 섞여 로그인이 자주 풀렸습니다.",
      did: "프론트는 access 토큰을 Bearer 로 붙여 401 재발급에 연결하고, 백엔드는 Bearer 를 먼저 읽고 없으면 쿠키를 읽습니다.",
      result:
        "두 환경에서 로그인이 유지되고, 옛 토큰이 다시 가는 경우만 남았습니다."
    },
    {
      problem:
        "같은 날 출석을 거의 동시에 두 번 보내면 UNIQUE 에 걸려 500 이 났고, 보너스는 두 번 지급될 수 있었습니다.",
      did: "출석은 UNIQUE 를 그대로 두고 한 번 더 시도한 뒤 그래도 겹치면 409 를 주게 했습니다. 보너스와 수집 상자는 행을 잠그고 읽습니다.",
      result: "중복 방지를 DB 제약과 행 잠금에 맡겼습니다."
    }
  ],
  // 이야기 배치(story)의 절 제목과 이음말. 본문 문장은 여기 두지 않고 rich · brief4 에서 읽는다.
  // 제목은 기존 원고의 문장을 그대로 옮겼다(intro4.more · learningLead · kpt.try · 접힘 요약 · learning).
  // 새로 쓴 것은 표 제목 한 줄과 칸 이름, 안내 문구뿐이다.
  story4: {
    tagDone: "2.0 에서 반영",
    tagTodo: "아직",
    problem: {
      toc: "1.0 과 피드백",
      eyebrow: "01 · 1.0 과 피드백",
      title:
        "1.0 은 기능을 소개하는 랜딩이었고, 써 본 사람들은 “어디서 뭘 해야 할지 모르겠다”고 했습니다.",
      em: "“어디서 뭘 해야 할지 모르겠다”",
      lead: "헬스 동아리 회장으로 회원이 꾸준히 쓸 기능을 고민하며 만들었습니다. 1.0 은 AI 상담, 자랑방, 프로틴, 프로그램 신청을 소개하는 정보 중심 홈페이지였습니다.",
      quotesLabel: "1.0 을 써 본 사람들이 남긴 말 넷",
      hypLabel: "그래서 세운 가설"
    },
    first: {
      toc: "첫 화면",
      eyebrow: "02 · 첫 화면",
      title: "2.0 에서 제일 먼저 고친 것은 홈 첫 화면입니다.",
      em: "홈 첫 화면",
      lead: "피드백 넷을 기준으로 2026년 3월 한 달, 커밋 111개로 다시 만들었습니다. 홈은 버튼 둘을 「오늘 출석 시작」 하나로 줄였습니다.",
      hint: "바꾸기 전과 후 · 손잡이를 끌어 보세요",
      scopeLabel: "1.0 과 2.0 을 나란히 놓은 표 보기"
    },
    ledger: {
      toc: "피드백과 한 일",
      eyebrow: "03 · 한 일",
      title:
        "피드백 넷 중 셋에 기능으로 답했고, 막혔던 곳 여섯은 따로 풀었습니다.",
      em: "피드백 넷 중 셋",
      lead: "위 네 줄은 1.0 피드백과 2.0 에서 한 일이고, 그 아래는 막혔던 곳과 푼 방법입니다. 그림은 누르면 다시 재생됩니다.",
      moreLabel:
        "3건 더 보기 · AI 답변 품질 하네스, 인증 방식 차이, 한 번만 일어나야 하는 일",
      all: "전체",
      groups: [
        {
          label: "1.0 피드백 4건과 2.0 에서 한 일 · 2026.03",
          short: "피드백",
          cols: ["1.0 에서는", "2.0 에서 한 일", "결과"]
        },
        {
          label: "막혔던 곳과 푼 방법",
          short: "막혔던 곳",
          cols: ["문제", "한 일", "결과"]
        }
      ],
      // 피드백 줄의 결과 칸. 순서는 feedbackMap 과 같다.
      // 출처: beforeAfter.after.note 첫 문장 · secondRun.added[0].result · added[2].result · kpt.problem[0]
      fbResults: [
        "버튼 둘이 시키는 일 하나로 바뀌었습니다.",
        "REST 서버(:8080)와 실시간 서버가 갈린 3-tier 구조가 됐습니다.",
        "1.0 의 루틴 추천에서 체성분 분석으로 올라갔습니다.",
        "피드백 넷 중 유일하게 안 고친 것입니다."
      ]
    },
    built: {
      toc: "새로 만든 화면",
      eyebrow: "04 · 새로 만든 화면",
      title: "‘소통하고 싶다’는 말에 게시판 대신 실시간 라운지로 답했습니다.",
      em: "실시간 라운지",
      lead: "운동 기록은 캐릭터 레벨, 티어, 랭킹으로 돌려줬고, 쌓기만 하던 analytics_events 와 audit_logs 는 관리자 콘솔에서 읽게 했습니다."
    },
    result: {
      toc: "결과와 남은 것",
      eyebrow: "05 · 결과와 남은 것",
      title:
        "2.0 에서는 첫 화면, 회원 간 소통, 운동 데이터 확인 피드백을 반영했습니다. AI 응답 지연은 아직 못 풀었습니다.",
      em: "AI 응답 지연은 아직 못 풀었습니다."
    },
    deep: "아래는 더 깊이 볼 분을 위한 자료입니다. 구조, 핵심 코드, 만든 순서, 회고가 접혀 있습니다."
  },
  bench:
    "응답 시간과 동시접속은 저장소의 스크립트로 다시 잴 수 있습니다(backend/sql/bench, realtime/bench, 순서는 docs/BENCHMARKS.md)."
};

// PR · 커밋 · 코드 파일 링크는 화면에 걸지 않는다(lib/codeLinks.ts)
stripCodeLinks(MU4_DATA);

export type Mu4Data = typeof MU4_DATA;
