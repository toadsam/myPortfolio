import type {ProjectData} from "@/types/portfolio";
import {withoutCodeLinks} from "../lib/codeLinks";

export const projects: ProjectData[] = [
  {
    // 이 사이트 자체. 이력서 대표 카드 `village-portfolio` 의 상세(ProjectOnePager)가
    // 여기서 찾는다. 마을 안에는 이 프로젝트의 건물이 없어 3D 전시실은 없다.
    // 수치 출처: docs/PORTFOLIO_INTERVIEW_STORIES.md · docs/VILLAGE_OVERHAUL_REPORT.md · CLAUDE.md
    id: "village-portfolio",
    title: "AI 포트폴리오 마을",
    description:
      "관리자가 적은 오늘의 활동이 3D 마을의 건물 불빛과 AI NPC 대화로 바뀌는, 살아 있는 포트폴리오 사이트입니다. 지금 보고 있는 이 사이트가 그 프로젝트입니다.",
    role: "Next.js 프론트, FastAPI 백엔드, 관리자 페이지, OpenAI NPC 연동(규칙 폴백), 3D 성능 예산 전부",
    tech: [
      "Next.js",
      "React Three Fiber",
      "TypeScript",
      "FastAPI",
      "SQLite",
      "OpenAI API",
      "Claude Agent SDK",
      "Playwright",
      "pytest"
    ],
    features: [
      "활동 → 건물 밝기·NPC 기분",
      "AI NPC 대화 + 규칙 폴백",
      "NPC 관계 사회",
      "의뢰 공방 릴레이 설문",
      "이력서 모드",
      "첫 화면 3D 0개 라우트 분리",
      "직군 에이전트 4명 (Claude Agent SDK)"
    ],
    learning:
      "첫 측정에서는 라벨을 원인으로 잡았다가 예열 뒤 다시 재니 아니어서, 실광원 개수를 풀로 고정해 입장 멈춤을 없앴습니다.",
    problem:
      "정적 포트폴리오는 한 번 만들면 갱신이 끊기고, 읽는 사람은 질문할 수 없습니다. 활동이 화면에 반영되고 방문자가 물어볼 수 있는 구조가 필요했고, 동시에 첫 화면을 여는 채용 담당자에게 20MB 짜리 3D 를 내려받게 할 수는 없었습니다.",
    approach: [
      "관리자 페이지 입력을 FastAPI 서비스가 건물 밝기 4단계와 NPC 기분으로 변환하고, NPC 대사는 OpenAI 로 생성하되 키가 없거나 실패하면 규칙 대사로 폴백해 서비스가 멈추지 않게 했습니다.",
      "첫 화면을 three.js 를 전혀 싣지 않는 별도 라우트로 분리하고(JS 215KB · 3D 모델 0개), 마을은 마우스를 올리는 순간 미리 받습니다.",
      "GLB 텍스처를 WebP 로 바꿔 54.0→30.3MB 로 줄이고, 실광원 개수를 풀로 고정해 입장 멈춤을 없앴습니다.",
      "의뢰 공방 3단계는 Claude Agent SDK 로 기획·디자인·프론트·백엔드 네 에이전트가 실제 산출물을 쓰되, 진행 권한은 관리자의 게이트 함수 하나에만 두고 도구 호출은 콜백 샌드박스로 막았습니다. 개발 자체도 Claude Code 와 짝으로 하되 계획 승인·실측·검증은 사람이 쥐었습니다."
    ],
    contribution: [
      "Next.js 3 라우트(착륙장·마을·이력서)와 R3F 마을 씬 구현",
      "FastAPI 70 엔드포인트 · village_service 밝기 규칙 · NPC 관계 규칙",
      "관리자 배전반(활동 입력) · 의뢰 공방(릴레이 설문 · 견적 클램프)",
      "Playwright 헤드리스 렌더 계측 · 배치 정합성 검사 15종 · pytest 375",
      "Claude Agent SDK 직군 에이전트 4명 · 게이트 상태 기계 · can_use_tool 샌드박스 (테스트 36)"
    ],
    result:
      "3D 다운로드 54.0→30.3MB(−44%, 화질 무손실 A/B 확인), 첫 화면 3D 모델 87개 20.7MB→0(JS 215KB), 마을 입장 최악 프레임 7,325→233ms. 방문자 수는 아직 계측하지 않았습니다.",
    nextStep:
      "배포 뒤 방문 계측을 붙이고, VRAM 283MB 를 KTX2(UASTC) 로 줄일지 다운로드 증가와 맞바꿔 실측으로 결정할 예정입니다.",
    links: [
      {label: "3D 마을", href: "/village"},
      {label: "GitHub", href: "https://github.com/toadsam/myPortfolio"}
    ]
  },
  {
    id: "mystock",
    title: "MyStock-Desk / MyWave",
    // 2026-11-13 저장소 README(2026-11) 기준. 「폴백 경로」는 코드엔 없고 갱신 건너뛰기라서 뺐다(README 가
    // 스스로 정정한 문장). 2026-11-10 mywave.day 공개.
    description:
      "대학생이 매일 여는 개인 재무 웹앱(MyWave)입니다. 홈의 숫자 하나 「오늘 더 써도 되는 돈」을 저장하지 않고 요청마다 기록에서 계산하고, 투자는 직접 입력한 매매 기록만으로 평균단가·수익률을 냅니다.",
    role: "1인 · 도메인 설계 · Spring Boot API · React 화면 · 공개 운영",
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Spring Boot",
      "JPA",
      "H2/MySQL",
      "Recharts",
      "Docker"
    ],
    features: [
      "오늘 더 써도 되는 돈 (요청마다 계산)",
      "소비 기록 네 갈래 (직접 입력·퀵버튼·문자·캡처)",
      "입력 거래 기반 투자 · 거래 수정 시 전체 재생",
      "규칙 기반 코치·리포트 (모델 호출은 테마 설명 한 곳)",
      "외부 연동 4곳 응답마다 출처 표시"
    ],
    learning:
      "「Yahoo 가 실패하면 Demo 로 자동 전환」이라고 적어 뒀던 것이 코드에는 갱신 건너뛰기였습니다. 결과가 같아도 메커니즘을 다르게 적으면 나머지 숫자까지 의심받으므로 다시 읽고 고쳤습니다.",
    problem:
      "소비·목표·투자가 화면마다 다른 숫자를 말하기 쉽고, 빈 화면을 예시 숫자로 채우면 「이거 내 기록 맞아?」가 됩니다. 증권사 연동 없이 직접 입력한 기록만으로 계산되고 기록이 없으면 0 이어야 했습니다.",
    approach: [
      "하루 예산·투자 가능 금액·달성률을 DB 에 저장하지 않고 요청마다 예산·소비·거래 기록에서 다시 계산합니다.",
      "거래를 고치면 보유를 증분 갱신하지 않고 처음부터 날짜순으로 다시 재생합니다.",
      "「AI」 화면 넷 중 모델을 부르는 곳은 테마 설명 하나뿐이고, 지시문으로 매수/매도·목표가·상승 확률을 금지했습니다.",
      "공개한 날 API 전수 검사 152건을 돌려 데모 계정 잠금·로그아웃 토큰 무효화 등 9건을 고쳤습니다."
    ],
    contribution: [
      "도메인 패키지 25개 · 컨트롤러 27개 · 엔드포인트 111개 설계",
      "TodayService · Holding.buy()/sell() · rebuildPortfolioFromTransactions 계산 로직",
      "화면 19개 (데스크톱·모바일 같은 주소)",
      "Railway 배포(mywave.day)와 공개일 점검 (테스트 29 → 41)"
    ],
    result:
      "2026-11-10 mywave.day 로 공개했습니다. 화면 19개, 엔드포인트 111개(MyWave 가 쓰는 것 55개), 엔티티 24개(쓰는 것 14개). 공개일 API 검사 152건 중 통과 137 → 146, 백엔드 테스트 29 → 41개. 배포본 성능을 잰 수치는 없습니다.",
    nextStep:
      "MyWave 가 쓰지 않는 엔드포인트 56개와 테이블 10개 정리, 외부 시세 범위 검증, Flyway 도입이 다음 순서입니다.",
    links: [
      {label: "사이트", href: "https://mywave.day"},
      {label: "GitHub", href: "https://github.com/toadsam/MyStock-Desk"}
    ]
  },
  {
    id: "festflow",
    title: "AjouFesta (구 FestFlow)",
    // 2026-11-13: "실시간 부스 관리 시스템" 은 5월판 문장이었다. 10월 가을축제에서 주점
    // 주문·소개팅·스태프 화면까지 이틀 운영한 지금 모습으로(resume.ts 카드 부제와 같은 말).
    description:
      "아주대 축제에서 두 번 실제로 운영한 축제 앱입니다. 5월 대동제에서 AI 소개팅을 하루 운영하고, 10월 가을축제에서 주점 QR 주문·소개팅·스태프 화면을 이틀 운영했습니다.",
    role: "기획 · 개발 · 배포 · 현장 운영 1인",
    tech: [
      "React",
      "Vite",
      "Tailwind CSS",
      "PWA",
      "Spring Boot",
      "JWT",
      "SSE",
      "MySQL",
      "React Leaflet"
    ],
    features: [
      "SSE 실시간 부스 현황",
      "지도 기반 배치",
      "스태프 권한 관리",
      "관리자 대시보드",
      "PWA 오프라인 지원"
    ],
    learning:
      "부스 상태가 바뀌어도 현장 화면이 따라오지 않아서, 상태 종류별로 SSE 채널 7개를 나눠 새로고침 없이 반영되게 했습니다.",
    problem:
      "축제 현장에서는 여러 부스의 운영 상태가 동시에 바뀝니다. 운영자는 변경 사항을 실시간으로 공유하고 역할별로 필요한 정보만 접근할 수 있어야 했습니다.",
    approach: [
      "SSE로 부스 상태 변경을 클라이언트에 즉시 전달하는 구조를 설계했습니다.",
      "React Leaflet으로 실제 지도 위에 부스를 배치해 현장성이 있는 운영 화면을 만들었습니다.",
      "관리자, 스태프, 일반 사용자를 JWT 기반 권한으로 분리했습니다."
    ],
    contribution: [
      "프론트엔드 주요 화면 구조 설계 및 구현",
      "SSE 기반 실시간 부스 상태 반영",
      "지도 기반 부스 배치 화면 구현",
      "PWA 설정과 오프라인 대응"
    ],
    result:
      "운영자가 고치면 현장 화면이 새로고침 없이 따라오는 구조까지 갔습니다. 부스 혼잡도·공연 상태·공지 등이 각각 SSE 채널 7개로 흐릅니다. 백엔드 컨트롤러 26개로 사용자용과 관리자용 기능을 한 서비스 안에서 닫았습니다.",
    // 예전 "SMS 알림, 매출 집계, 현장 QR 체크인 예정" 은 10월에 전부 만들어 운영했다.
    nextStep:
      "성사 97쌍 중 부스에서 만난 건 30쌍이라 만남 자리(44칸)를 늘리고, 피크 시간 주점 서빙(30~45분)을 줄이는 것이 다음 과제입니다.",
    // 저장소 비공개(2026-10). 사이트와 "요청 시 공개" 메일 링크로 대신한다.
    links: [
      {label: "사이트", href: "https://www.ajoufesta.com"},
      {label: "시연 영상", href: "https://www.youtube.com/watch?v=Jdo5ZNDG8Uk"},
      {
        label: "코드 (비공개 · 요청 시 공개)",
        href: "mailto:toadsam@naver.com?subject=FestFlow%20%EC%A0%80%EC%9E%A5%EC%86%8C%20%EC%97%B4%EB%9E%8C%20%EC%9A%94%EC%B2%AD"
      }
    ]
  },
  {
    id: "sign-language",
    title: "수어링고 (구 수어지교)",
    description:
      "수어 동작을 보고 뜻을 맞히며 익히는 학습 앱입니다. 5월에 수어지교로 배포했고 11월에 수어링고로 다시 그렸습니다.",
    role: "1학기 백엔드(분석기 선택 · 영상 조회 · 배포) · 2학기 동작 데이터와 자모표 · 11월 디자인 개편",
    tech: [
      "Spring Boot",
      "Firebase Firestore",
      "Firebase Storage",
      "Expo",
      "React Native"
    ],
    features: [
      "4지선다 수어 퀴즈",
      "오답노트·최다 오답 단어 집계",
      "단어 북마크",
      "정답률 배지 · 연속 목표 달성일",
      "문장을 수어 단어 순서로 바꾸는 통역기"
    ],
    learning:
      "정답 데이터가 없어 세 분석기(규칙·ETRI·OpenAI) 결과를 사전 적중 수로 고르게 했고, 이 기준은 정확도보다 재생 가능한 단어 수를 높이는 쪽이라는 한계를 기록했습니다.",
    problem:
      "수어를 배우고 연습할 수 있는 접근성 높은 도구가 부족했습니다. 동작을 보고 의미를 이해하며 반복 학습할 수 있는 흐름이 필요했습니다.",
    approach: [
      "수어 동작 영상을 보여주고 보기 4개 중 뜻을 고르는 퀴즈 학습 구조를 설계했습니다.",
      "한국어 문장을 조사 제거·기본형 복원·어순 재배열로 수어 단어 순서로 바꾸고, 단어마다 영상을 찾아 순서대로 넘기는 서버 경로를 맡았습니다.",
      "앱은 GitHub Actions 로 GitHub Pages 에, 서버는 Docker 이미지로 Cloud Run 에 올렸습니다."
    ],
    contribution: [
      "OpenAI 기본형 정규화와 세 갈래 토큰 선택, 어미 정규화",
      "Firebase Storage 단어별 영상 조회 캐시와 Firestore 주소 폴백",
      "Cloud Run · GitHub Pages 배포와 CORS · 웹 로그인 팝업 처리"
    ],
    result:
      "퀴즈 20문항과 사전 120단어로 동작하는 앱을 배포했습니다. 운영 서버에서 세어 보니 사전 단어 중 영상이 있는 단어는 17개였고, 같은 문장 왕복 중앙값은 101ms(규칙 경로)였습니다. 수어 표현은 전문가 감수를 받지 않았습니다.",
    nextStep: "학습 콘텐츠 확장과 실제 사용자 테스트를 진행할 예정입니다.",
    links: [
      {
        label: "웹 데모 열기",
        href: "https://toadsam.github.io/Sign-Language/home"
      },
      {label: "GitHub", href: "https://github.com/toadsam/Sign-Language"}
    ]
  },
  {
    id: "aclub",
    // 표기는 aClub 하나로 — 히어로·푸터·카드·본문이 ACLUB / aClub / AjouClub
    // 셋으로 갈려 있었다. 실서비스 이름(aclub.co.kr)을 따른다.
    title: "aClub",
    description: "동아리 탐색과 모집을 연결하는 캠퍼스 플랫폼입니다.",
    // 2026-11-13 밤: 커밋 기록에 맞춰 고쳤다. 2026 TypeScript 화면·훅·라우트는 팀원 둘이 2025.09~11 에 쓴 것이다.
    role: "2025 프론트 팀원(로그인 · API 연동) → 2026 프로젝트장(출시 · 운영 · 배포 수리)",
    tech: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    features: [
      "동아리 탐색",
      "필터링",
      "모집 공고 조회",
      "상세 페이지",
      "마이페이지",
      "관리자 화면"
    ],
    learning:
      "배포가 아홉 번 실패로 찍히는 동안 배포 자체는 성공하고 있었고, 실패한 곳은 알림 스텝이었습니다. 출시 당일에는 맞는 해법(백엔드 수정)을 기다릴 수 없어 임시 방편을 넣고 그게 임시라는 것을 적어 두었습니다.",
    problem:
      "동아리 정보가 여러 채널에 흩어져 있어 학생들이 원하는 동아리를 찾고 모집 일정을 확인하기 어려웠습니다.",
    approach: [
      "2025년 팀원으로 로그인·회원정보 화면과 동아리·모집공고 API 연동을 맡았습니다.",
      "2026년 프로젝트장으로 출시 일정, 동아리 회장 섭외, 에브리타임 홍보, 출시 저녁의 문의 응대를 맡았습니다.",
      "팀원들이 TypeScript 로 다시 짠 코드 위에서 출시를 막는 문제(배포 실패 · 필터 실패 · 모집 종류 표기)를 고쳤습니다."
    ],
    contribution: [
      "2025 로그인 · 구글 로그인 화면 · 토큰 재발급 · API 연동 (커밋 48/310)",
      "2026 배포 워크플로 수리 (연속 실패 9회 → 통과)",
      "출시 당일 필터 폴백 · 모집 종류 칩 · 상세 404 수정 (커밋 23/79)",
      "출시 · 홍보 · 문의 응대"
    ],
    result:
      "2025년 프론트 3인 중 한 명으로 참여한 뒤, 그 결과로 2026년 프로젝트장을 맡아 개편했습니다. GA4 실측(2026.01–03) 기준 활성 사용자 3,500명 · 조회수 8.8만 · 세션 참여율 93.4%로 운영 중입니다.",
    nextStep: "백엔드 API 연동과 실제 배포를 진행할 예정입니다.",
    links: [
      // 저장소가 둘인 이유를 라벨이 말해야 한다 — 어느 쪽이 내 코드냐고
      // 묻기 전에. 2025 는 팀원으로 참여한 원본, 2026 은 총괄한 개편본.
      {
        label: "GitHub (2026 · 프로젝트장)",
        href: "https://github.com/aClub2026/FE"
      },
      {
        label: "GitHub (2025 · 팀원)",
        href: "https://github.com/DBProject-24-2/DB_Project_FE"
      }
    ]
  },
  {
    id: "ajou-adventure",
    title: "아주분투",
    description:
      "아주대학교 캠퍼스를 청색/남색 네온 톤으로 재해석한 Phaser 3 기반 2D 러닝 게임입니다.",
    role: "게임 기획 및 전체 개발",
    tech: ["TypeScript", "Phaser 3", "Vite"],
    features: [
      "자동 맵 스크롤",
      "낮/밤 배경 전환",
      "플레이어 액션",
      "아이템과 장애물",
      "최고 점수 저장"
    ],
    learning:
      "발판이 계속 생성돼 긴 플레이에서 오브젝트가 쌓여서, 화면 밖으로 나간 발판을 즉시 걷어내게 했습니다.",
    problem:
      "캠퍼스 생활을 가볍게 즐길 수 있는 웹 게임을 만들고 싶었습니다. 대학생이 공감할 수 있는 요소와 모바일 대응이 중요했습니다.",
    approach: [
      "캠퍼스 건물과 상징물을 발판과 배경 요소로 변환해 게임 맵을 구성했습니다.",
      "아이템, 장애물, 점수 시스템으로 짧은 플레이에도 반복 동기를 만들었습니다.",
      "낮/밤 배경 전환으로 진행감을 시각적으로 강화했습니다."
    ],
    contribution: [
      "Phaser 3 기반 게임 루프 설계 및 구현",
      "자동 발판 생성과 오브젝트 제거 최적화",
      "플레이어 액션과 점프 메커니즘 구현",
      "점수 시스템과 localStorage 저장 구현"
    ],
    result:
      "이틀 만에 끝까지 플레이되는 브라우저 2D 러닝 게임을 만들었습니다. 화면 밖으로 나간 발판은 바로 지워 긴 플레이에도 오브젝트가 쌓이지 않고, 최고 점수는 localStorage 에 남습니다.",
    nextStep: "리더보드와 공유 기능을 추가할 예정입니다.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_Mini_Game"}
    ]
  },
  {
    id: "ajouchong",
    title: "아주총학",
    // 2026-09-04 사실 대조(org 저장소 두 곳 + 실서비스 API). 2025 는 프론트 3인 중
    // 한 명으로 화면 일부, 2026.04 부터 혼자 맡아 프론트·Spring Boot API·배포까지.
    // 이 항목의 `links` 는 원페이저(ProjectOnePager) CTA 버튼으로도 그려진다 —
    // 2026 작업은 main 이 아니라 develop 에 있어 PR 을 직접 건다.
    description:
      "아주대학교 총학생회 공식 웹사이트. 2025년엔 프론트 3인 중 한 명, 2026년부터 혼자 맡아 UI 전면 개편·대여사업·링크허브·관리자 화면을 프론트부터 API까지 만들었습니다.",
    role: "2025 프론트 화면 일부 → 2026 단독 담당(React 화면 + Spring Boot API + 배포)",
    tech: [
      "React",
      "React Router",
      "Spring Boot",
      "JPA",
      "PostgreSQL",
      "JWT",
      "Docker",
      "Nginx"
    ],
    features: [
      "대여사업 · 품목별 남은 수량, 관리자 −/+ 조정, 대여/반납 기록",
      "링크허브 · 인스타 프로필 링크 한도를 우회하는 링크 모음, 관리자가 직접 편집",
      "관리자 화면 · 대여·링크·공지·피드백 (ADMIN 권한만)",
      "홈페이지 도우미 · 퀵 메뉴 5개 + 의견 접수",
      "2026.09 프론트 전면 리디자인 · Docker + Nginx 배포"
    ],
    learning:
      "수량 하나, 링크 하나 바꾸는 데도 개발자 배포가 필요해서, 총학생회가 관리 화면에서 직접 고치게 바꿨습니다.",
    problem:
      "학생은 물품이 남았는지 몰라 총학생회실까지 와서야 없다는 말을 들었고, 인스타 프로필에는 링크를 몇 개밖에 못 걸어 접수 폼 링크가 매번 밀려났습니다. 수량 하나, 링크 하나 바꾸는 데도 개발자가 배포해야 했습니다.",
    approach: [
      "RentalItem·RentalRecord·Link 엔티티와 사용자/관리자 컨트롤러를 Spring Boot로 만들고, 수량 조정은 서버가 0 미만·총량 초과를 거부하게 했습니다.",
      "학생 화면은 남은 수량을 읽기만 하고, 관리자 화면의 −/+ 가 API 로 바로 반영되게 했습니다.",
      "링크허브 한 페이지를 만들어 인스타 프로필엔 그 링크 하나만 걸고, 안의 링크는 총학생회가 직접 넣고 빼게 했습니다.",
      "2026년 9월에 프론트 전체를 다시 디자인하고, Docker와 Nginx(try_files 폴백)로 배포했습니다."
    ],
    contribution: [
      "2025 · 대여사업 검색창, 정책집, 조직도 화면",
      "2026 · UI 전면 개편, 대여사업·링크허브·관리자 화면",
      "2026 · 대여·링크 API(Spring Boot·JPA), ADMIN 권한 분리",
      "Docker + Nginx 배포, 이미지 S3 업로드"
    ],
    result:
      "학생은 오기 전에 수량을 보고, 총학생회는 수량·링크·의견을 개발자 없이 직접 고칩니다. 2026.11 기준 대여 품목 10종·링크 9개가 실서비스에서 돌아가고, Search Console 기준(검색 유입, 2025.05~2026.08 16개월) 노출 12,314회 · 클릭 1,694회(CTR 13.8%)로 학생들이 검색으로 실제로 들어오고 있습니다.",
    nextStep:
      "대여 신청을 온라인으로 받는 것과 접근성(대비·포커스) 보강을 할 예정입니다.",
    links: [
      {label: "GitHub", href: "https://github.com/ajouchong-dev/ajouchong-web"},
      {
        label: "개편 PR (프론트 · 2026)",
        href: "https://github.com/ajouchong-dev/ajouchong-web/pull/36"
      },
      {
        label: "대여·링크 API PR (백엔드 · 2026)",
        href: "https://github.com/ajouchong-dev/ajouchong/pull/70"
      }
    ]
  },
  {
    id: "muscleup",
    title: "득근득근 (MuscleUp)",
    description:
      "운동 기록을 게임화와 커뮤니티로 연결하는 풀스택 피트니스 플랫폼입니다.",
    role: "풀스택 개발, 기획, 프론트엔드와 백엔드 구현",
    tech: ["TypeScript", "React", "Spring Boot", "JWT", "OAuth", "Socket.IO"],
    features: [
      "출석 체크",
      "캐릭터 성장",
      "운동 기록 루프",
      "실시간 라운지",
      "게시글/댓글",
      "AI 인바디 분석",
      "Google OAuth"
    ],
    learning:
      "소개형 홈페이지(도메인 4개)로는 부족하다는 사용자 피드백이 있어서, 출석·캐릭터 성장·실시간 라운지가 도는 운영형 플랫폼으로 다시 만들었습니다.",
    problem:
      "운동 기록은 꾸준히 남기기 어렵습니다. 기록이 즉시 보상과 커뮤니티 반응으로 이어지면 꾸준히 남기기 쉬워진다고 봤습니다.",
    approach: [
      "매일의 운동 기록을 캐릭터 성장, 출석, 퀘스트로 즉시 반영하는 게임형 루프를 설계했습니다.",
      "Socket.IO 기반 실시간 라운지로 사용자 간 상호작용을 강화했습니다.",
      "AI 인바디 분석으로 개인별 운동 판단을 돕게 했습니다."
    ],
    contribution: [
      "출석, 캐릭터 성장, 퀘스트 루프 설계 및 구현",
      "JWT + Google OAuth 인증 시스템 구현",
      "Socket.IO 기반 실시간 라운지(접속자 위치·채팅) 구현",
      "AI 인바디 분석 연동과 리포트 화면 구현"
    ],
    // `result` 는 **만든 것이 아니라 바뀐 것**을 적는다. "…를 완성했습니다" 는
    // 심사자에게 아무 정보도 주지 않는다 — 완성은 이 목록에 있다는 사실 자체로
    // 이미 전제이기 때문이다. 숫자가 있으면 숫자와 출처를, 없으면 어떤 상태까지
    // 갔는지와 그 과정에서 내린 판단을 쓴다. 지어내지는 않는다.
    result:
      "사용자 피드백을 근거로 소개형 홈페이지(도메인 4개)를 출석·캐릭터 성장·실시간 라운지가 도는 운영형 플랫폼(도메인 8개 · 백엔드 Controller 28개)으로 다시 만들었습니다. 가입 회원은 55명입니다(2026.10 운영 API 기준).",
    nextStep: "실사용자 테스트와 웨어러블 기기 연동을 검토할 예정입니다.",
    links: [
      // 배포 주소는 musclehub.co.kr (muscle-up.click 아님, 2026-09-05 확인).
      {label: "서비스 열기", href: "https://musclehub.co.kr"},
      {label: "시연 영상", href: "https://youtu.be/0X-BIADC1eQ"},
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_MuscleUp"}
    ]
  },
  {
    id: "darklab",
    title: "DarkLab",
    // 2026-11-13 담당 교정(저장소 커밋 작성자 기준, 본인 126/317). 「Cinemachine 카메라 전환」은 팀원이 쓴
    // CameraChange.cs(SetActive 전환)라 뺐고, ScriptableObject 는 저장소에 있으나 본인 작업으로 확인되지 않아 뺐다.
    description:
      "어두운 집을 1인칭으로 탐색하며 물건을 2초 응시해 조사하는 3인 팀 공포 프로토타입(Threshold)입니다.",
    role: "1인칭 조작 초기 · 응시 상호작용 · 할머니 NPC·램프·침대 공포 이벤트 · 눈/공포 UI",
    tech: ["Unity", "C#", "URP", "Input System", "Cinemachine", "DOTween"],
    features: [
      "1인칭 탐색 (상태 머신)",
      "응시 2초 상호작용 (CameraRays)",
      "할머니 NPC 이벤트 (이동·주시·추격·페이드)",
      "램프 맥동 · 침대 이벤트",
      "시간 경과로 달라지는 방"
    ],
    learning:
      "조사 가능한 물건이 안 보이는 문제는 키 입력 대신 2초 응시로 풀었고, NPC 가 안 무서운 문제(「할머니를 머지했는데 왜 안 무서울까?」 커밋)는 연출을 이동·주시·추격·페이드 네 단계로 쪼개서 풀었습니다.",
    problem:
      "공포 게임의 긴장감은 점프스케어보다 공간 탐색과 오브젝트 상호작용에서 나온다고 봤습니다. 무엇을 조사할 수 있는지, 언제 무언가가 나타나는지를 손으로 짜 넣어야 했습니다.",
    approach: [
      "화면 중앙 레이가 FocusObject 에 2초 머물면 조사가 실행되게 했습니다(GREEN_RAY_THRESHOLD 2.0f).",
      "할머니 NPC 가 이동하는 동안 플레이어 카메라를 강제로 돌리고 조작을 막은 뒤, 머티리얼 알파로 서서히 사라지게 했습니다.",
      "침대는 흔들리다 넘어가고 램프는 붉게 맥동하며 심장박동 소리를 내서, 시계가 넘어갈수록 같은 방이 달라지게 했습니다."
    ],
    contribution: [
      "1인칭 조작 초기(2024-07-29)와 응시 판정 SeeDetector(07-31) · CameraRays 공동 수정",
      "GrandMaMove(6/6 커밋) · BedEvent(2/2) · PulsingLamp(2/3)",
      "눈 UI · 공포이벤트 UI · 맵 C/D 구역 · 캐릭터 애니메이션"
    ],
    result:
      "커밋 317개 중 126개를 제가 쓴 3인 팀 PC 프로토타입입니다. 응시 판정과 세 공포 이벤트가 들어갔고, 로컬라이즈(3개국어)와 ScaryEvent 계층은 팀원 작업입니다. 플레이 지표는 없습니다.",
    nextStep:
      "퍼즐 요소와 엔딩 시퀀스를 추가해 챕터형 게임으로 확장할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/DarkLab"}]
  },
  {
    id: "tserof",
    title: "TSEROF",
    description:
      "잃어버린 아이템을 찾아 스테이지를 클리어하는 Unity 3D 플랫폼 게임입니다.",
    // 2026-09-06 담당 교정. 예전 문구(플레이어 컨트롤러·스테이지 선택·저장)는 저장소
    // README 기여자 표와 커밋 이력상 박지원(플레이어)·김형중(스테이지 선택)·김어진(저장)
    // 작업이다. 본인 몫은 스테이지 2 전체 + 기믹 + 3×3 퍼즐 — 브랜치 JJH_Stage2 ·
    // JJH_CodeClean · JJH_PJW_EndingScene, README 「Gimmick(정재훈)」 UML.
    role: "게임 프로그래밍 · 스테이지 2 · 장애물/기믹 · 3×3 퍼즐",
    tech: ["Unity", "C#", "Unity 2022.3", "Cinemachine"],
    features: [
      "스테이지 2 통합 씬 (2-1·2-2·2-3)",
      "3×3 패턴 퍼즐",
      "속성 큐브 (마그마·용암·물·얼음)",
      "대포·낙하물·회전 장애물·가시·레버",
      "나뭇잎 탑승·토네이도·히든맵",
      "기믹 인터페이스 (IMovable 등 5종)"
    ],
    learning:
      "스테이지 하나를 통째로 맡아 보니, 기믹은 하나씩 만드는 것보다 리스폰·카메라·클리어 판정 같은 공통 뼈대를 먼저 세워야 나중에 붙이기 쉽다는 걸 배웠습니다. 12월 코드 정리에서 기믹을 인터페이스로 묶은 이유이기도 합니다.",
    problem:
      "스테이지 2는 처음에 2-1·2-2·2-3 세 씬으로 나뉘어 있어 구간을 넘길 때마다 씬을 로드했고, 카메라·리스폰·클리어 판정이 구간마다 흩어져 있었습니다. 장애물과 퍼즐이 늘수록 이 셋을 한 곳에서 관리할 뼈대가 필요했습니다.",
    approach: [
      "세 씬을 한 씬으로 합치고 Stage2Manager 가 구간별 Cinemachine 카메라 전환·리스폰 지점·클리어 판정을 맡게 했습니다.",
      "3×3 패턴 퍼즐은 정답 패턴 5종을 코루틴으로 주기적으로 바꾸고, 플레이어가 놓은 배열을 정답과 순서대로 비교해 판정했습니다.",
      "속성 큐브는 마그마·용암·물·얼음·얼음벽을 enum 하나로 분기해 큐브 종류마다 스크립트를 따로 두지 않았습니다.",
      "12월 초 팀원과 함께 IMovable·IRotatable·IDisturbing·IPlayerRespawnable·IInteractable 인터페이스를 도입해 기믹을 같은 규약으로 묶었습니다."
    ],
    contribution: [
      "스테이지 2 전체 · 씬 통합 · Stage2Manager · 스테이지 2 카메라",
      "3×3 패턴 퍼즐 · PuzzleManager·PatternSign·PuzzleButton·PuzzleObjects 등 7개 스크립트",
      "속성 큐브 CubeType 과 장애물 기믹 · 대포·낙하물·회전·측면/투명 가시·레버·나뭇잎·토네이도·히든맵",
      "기믹 인터페이스 도입과 코드 정리(팀원과 공동) · 엔딩 씬 일부"
    ],
    result:
      "5인 팀에서 부팀장으로 참여해 Steam 스토어 출시까지 완주했습니다. 학내 과제로 끝나지 않고 누구나 상점에서 내려받을 수 있는 상태까지 간 유일한 프로젝트입니다.",
    nextStep:
      "기믹 인터페이스를 바탕으로 장애물 종류를 늘리고, 퍼즐 패턴을 코드 배열에서 데이터로 분리할 예정입니다.",
    links: [
      {
        label: "Steam 스토어",
        href: "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana"
      },
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=1Lm-lpVsmq8"
      }
      // GitHub(KimEoJin24/TSEROF)는 비공개로 바뀌어 404 — 링크를 걸지 않는다(2026-09-08).
    ]
  },

  // ─── 2026-09-03 추가: 이력서 카드에서 상세가 안 열리던 셋 ───────────────────
  // 문장은 포트폴리오 PDF(정재훈이력서긴버전)와 저장소 코드에서만 가져왔다.
  // 사용자 수·다운로드 같은 숫자는 근거가 없어 넣지 않았다.
  {
    // PDF 43–48쪽. 저장소는 팀원 소유(kbwon/IMP_VR), 내 스크립트는 Assets/JJH.
    id: "otherside-vr",
    title: "The Other Side (이면)",
    description:
      "정상 시야로는 안 보이는 단서를 특수 카메라로 찾고, 손전등을 켜면 적에게 들키는 리스크를 관리하며 퍼즐을 푸는 VR 공포 퍼즐·추격 게임입니다.",
    role: "AI 몬스터 시스템 · 감지 로직 · 중앙 제어 구조 설계 (몬스터 개발 · 기획 참여)",
    tech: ["Unity", "XR Interaction Toolkit", "C#", "NavMesh"],
    features: [
      "특수 카메라로만 보이는 퍼즐 단서",
      "손전등 빛 원뿔이 적 시야각에 걸리면 감지",
      "적 시야각(FOV) 회피와 추격",
      "NavMesh 배회(Wander) → Chase → Attack 상태 AI",
      "GameManager 중앙 토글로 퍼즐 ↔ 추격 연동"
    ],
    learning:
      "감지 로직과 AI 행동을 분리하고 중앙에서 토글하니, 퍼즐 조건이 늘어도 감지기는 GameManager 만 알면 됩니다.",
    problem:
      "단순 추격만으로는 공포의 템포를 조절할 수 없었고, 감지 로직과 AI 로직이 직접 결합되면 유지보수가 어려웠습니다.",
    approach: [
      "몬스터 AI를 거리 기반 배회 → 추격(8m) → 공격(2m) 상태로 나누고, GameManager 의 토글로 켜고 끄게 했습니다.",
      "감지기(Detector)는 감지만 담당하고, GameManager 가 AI 행동을 중앙에서 켜고 끄도록 구조를 나눴습니다.",
      "플레이어 시야각 감지와 손전등 빛 원뿔 감지를 따로 두어, 손전등을 켜는 것이 실제 리스크가 되게 했습니다."
    ],
    contribution: [
      "MonsterAI · NavMesh 기반 배회/추격/공격 상태 전환",
      "EnemyDetector / EnemyLightZoneDetector · 시야각·손전등 원뿔 감지",
      "GameManager · 몬스터 활성/비활성 중앙 제어 (싱글톤)",
      "PlayerFlashlight · 손전등 상태와 빛 원뿔 정보를 넘김",
      "메인 기획"
    ],
    result:
      "퍼즐 진행에 따라 추격이 켜지고 꺼지는 구조까지 갔습니다. 감지기 2종이 GameManager 로 몬스터 2종(Doll · Bookhead)의 추격을 토글하고, 시야에서 벗어난 뒤 5초가 지나야 추격이 풀립니다. 트리거나 퍼즐 조건을 늘려도 감지기 쪽은 고칠 것이 없습니다.",
    nextStep:
      "퍼즐 조건과 몬스터 종류를 늘리고, 감지 규칙을 데이터로 뺄 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/kbwon/IMP_VR"}]
  },
  {
    // PDF 49–55쪽. 스크립트는 저장소의 Weapon-JJH / Weapon2_JJH 브랜치에 있다.
    id: "monsterpoint-ar",
    title: "INTO MONSTER POINT",
    description:
      "현실 공간을 스캔해 전투 공간으로 고정하고, 그 안에서 몬스터가 웨이브로 등장하는 AR 생존 슈터입니다.",
    // 2026-11-13 저장소 작성자 대조: 바닥·벽(AdjustmentSystem)은 RBTylenol, 스폰(Spawner)은 kbwon. 내 코드는 Assets/Scripts/JJH.
    role: "무기 시스템(발사 · 전환 · 잠금 · 쿨타임) · 체력 · 게임 루프 기획",
    tech: ["Unity", "AR Foundation", "C#"],
    features: [
      "Plane Detection 으로 전투 공간 고정",
      "평면 boundary 로 바닥·4방향 벽 자동 생성",
      "현실 공간 크기 기반 스폰",
      "웨이브 스폰 → 처치 수 도달 시 보스",
      "조이스틱 무기 발사 · 잠금/쿨타임 (활·칼·마법·총)"
    ],
    learning:
      "전투 공간을 고정값으로 두면 방에 따라 벽 밖에 몬스터가 생겨서, 스폰·벽·바닥을 전부 스캔한 boundary 에서 파생되게 했습니다.",
    problem:
      "현실 공간은 플레이할 때마다 크기와 모양이 다릅니다. 전투 공간·스폰 위치·경계를 고정값으로 두면 어떤 방에서는 벽 밖에 몬스터가 생깁니다.",
    approach: [
      "스캔 종료 시 탐지된 평면 boundary 를 월드 좌표로 바꿔 min/max 로 바닥 크기를 정하고, 그 네 꼭짓점으로 벽을 세웠습니다.",
      "바닥 꼭짓점(floorCorners)을 기준으로 스폰 위치를 만들고, 일정 간격 스폰 → 처치 수 누적 → 보스 등장으로 웨이브를 이었습니다.",
      "무기별 발사 속도·힘·딜레이를 분리하고, 잠금 무기는 발사되지 않게 막았습니다."
    ],
    contribution: [
      "WeaponShooterWithJoystick · 조이스틱 방향 발사 · fireRate · 무기 4종 전환 · 잠금",
      "SkillCooldown · 6초 쿨타임 칸 UI",
      "PlayerHealth · ProjectileDamage",
      "게임 루프 기획 참여 (바닥·벽과 스폰·보스는 팀원 작성)"
    ],
    result:
      "스캔한 방 크기대로 바닥과 벽이 서고, 그 안에서 일반 몬스터 10마리를 처치할 때마다 보스가 나오는 웨이브 루프까지 동작합니다. 무기는 활·칼·마법·총 네 종류입니다.",
    nextStep: "몬스터 종류별 난이도 곡선과 잠금 해제 조건을 다듬을 예정입니다.",
    links: [
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=9Lf2K1qBJ2E"
      },
      {label: "GitHub", href: "https://github.com/toadsam/IMP"}
    ]
  },
  {
    // PDF 27–34쪽. 「아주분투」(ajou-adventure, Phaser 2D 러너)와 다른 게임이다.
    id: "ajou-indigame",
    title: "아주대탐험",
    description:
      "아주대학교 캠퍼스를 무대로 마스코트 ‘치토’가 졸업을 목표로 성장하는 Unity 3D 캐주얼 액션 어드벤처입니다.",
    role: "게임 시스템 설계/구현 (코어 루프 · AI · UI · 전투 · 성장 · 1인 개발)",
    tech: ["Unity", "C#", "NavMesh"],
    features: [
      "1인칭 ↔ 탑다운 시점 전환",
      "레벨업 시 랜덤 스킬 3개 중 선택",
      "NavMesh 일반 몬스터 · 패턴형 보스 AI",
      "인벤토리 · 캐릭터 선택 · 돌발 퀘스트 · 포탈 씬 전환",
      "웨이브 5단계 · 다섯 번째가 보스"
    ],
    learning:
      "Player · Skill · AI · UI · Event 를 시스템으로 나눠 두니, 새 스킬이나 새 상태를 붙일 때 다른 시스템을 안 건드리게 됐습니다.",
    problem:
      "퍼즐 탐색과 전투는 요구하는 시야와 조작이 다릅니다. 하나의 카메라·컨트롤러로 둘을 다 하면 어느 쪽도 몰입이 안 됩니다.",
    approach: [
      "플레이 모드에 따라 카메라·컨트롤러·물리 제약을 함께 전환하는 1인칭↔탑다운 시스템을 만들었습니다.",
      "레벨업 시 시간을 멈추고 랜덤 스킬 3개를 제시해 매 판 다른 빌드가 나오게 했습니다.",
      "몬스터는 Idle → Move → Chase → Attack 상태 기반이고, 보스는 랜덤 패턴 공격이며 보스 웨이브 앞에 3초 예고 패널을 띄웁니다."
    ],
    contribution: [
      "PlayerModeManager · 시점 전환(카메라 Parent · 컨트롤러 분리 · Y축 잠금)",
      "InGameSkillManager · 레벨업 랜덤 스킬 3택",
      "MonsterAI · WaveManager · 상태 AI · 웨이브/보스",
      "RobotSummoner · Portal · 돌발 퀘스트 · 이벤트 시스템",
      "인벤토리·캐릭터 선택 UI ↔ 게임 오브젝트 연동"
    ],
    result:
      "탐색 → 전투 → 레벨업 → 스킬 선택 → 다음 웨이브로 이어지는 코어 루프가 돌고, 시점 전환·랜덤 스킬·상태 AI·이벤트(소환 20초/쿨타임 20초, 포탈, 돌발 퀘스트)가 각자 독립된 시스템으로 붙어 있습니다.",
    nextStep:
      "건물별 스테이지 테마와 최종 보스 ‘졸업’까지 콘텐츠를 채울 예정입니다.",
    links: [
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=mtIiIWmrSdg"
      },
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_IndiGame"}
    ]
  }
];

// PR · 커밋 링크는 화면에 걸지 않는다(lib/codeLinks.ts). 위 목록에는 그대로 적어 둔다.
for (const p of projects) p.links = withoutCodeLinks(p.links);
