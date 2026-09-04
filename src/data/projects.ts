import type {ProjectData} from "@/types/portfolio";

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
      "병목도 처방도 실측으로 정하는 습관, 그리고 자신의 첫 측정을 의심하는 태도를 배웠습니다.",
    problem:
      "정적 포트폴리오는 한 번 만들면 갱신이 끊기고, 읽는 사람은 질문할 수 없습니다. 활동이 화면에 반영되고 방문자가 물어볼 수 있는 구조가 필요했고, 동시에 첫 화면을 여는 채용 담당자에게 20MB 짜리 3D 를 내려받게 할 수는 없었습니다.",
    approach: [
      "관리자 페이지 입력을 FastAPI 서비스가 건물 밝기 4단계와 NPC 기분으로 변환하고, NPC 대사는 OpenAI 로 생성하되 키가 없거나 실패하면 규칙 대사로 폴백해 서비스가 멈추지 않게 했습니다.",
      "첫 화면을 three.js 를 전혀 싣지 않는 별도 라우트로 분리하고(JS 215KB · 3D 모델 0개), 마을은 마우스를 올리는 순간 미리 받습니다.",
      "성능은 감이 아니라 실측으로 — GLB 텍스처를 WebP 로 바꿔 54.0→30.3MB, 실광원 개수를 풀로 고정해 입장 멈춤을 없앴습니다.",
      "의뢰 공방 3단계는 Claude Agent SDK 로 기획·디자인·프론트·백엔드 네 에이전트가 실제 산출물을 쓰되, 진행 권한은 모델이 아니라 관리자의 게이트 함수 하나에만 두고 도구 호출은 콜백 샌드박스로 막았습니다. 개발 자체도 Claude Code 와 짝으로 하되 계획 승인·실측·검증은 사람이 쥐었습니다."
    ],
    contribution: [
      "Next.js 3 라우트(착륙장·마을·이력서)와 R3F 마을 씬 구현",
      "FastAPI 63 엔드포인트 · village_service 밝기 규칙 · NPC 관계 규칙",
      "관리자 배전반(활동 입력) · 의뢰 공방(릴레이 설문 · 견적 클램프)",
      "Playwright 헤드리스 렌더 계측 · 배치 정합성 검사 15종 · pytest 258",
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
    description:
      "거래 기록 기반 포트폴리오 분석과 AI 체크리스트, 그리고 자산 흐름 대시보드(MyWave)를 한 저장소에 담은 투자·자산 기록 서비스입니다.",
    role: "프론트엔드와 백엔드 구조 설계, 포트폴리오 계산 로직 구현",
    tech: [
      "React",
      "TypeScript",
      "Spring Boot",
      "Tailwind CSS",
      "Recharts",
      "MySQL"
    ],
    features: [
      "보유 종목 수익률 분석",
      "자산 비중 차트",
      "뉴스 영향 분석",
      "AI 체크리스트",
      "자산 흐름 대시보드 (MyWave)"
    ],
    learning:
      "실제 투자 데이터를 모델링하면서 도메인 복잡도를 구조적으로 낮추는 설계 경험을 쌓았습니다.",
    problem:
      "개인 투자자는 수익률, 자산 비중, 거래 기록, 뉴스 흐름을 따로 관리하는 경우가 많습니다. 투자 판단을 돕기 위해 여러 정보를 한 화면에서 연결할 필요가 있었습니다.",
    approach: [
      "사용자가 입력한 거래 기록을 기반으로 보유 종목과 수익률을 계산하는 구조를 설계했습니다.",
      "AI는 매수/매도 추천이 아니라 리스크, 편중, 기록 누락을 점검하는 체크리스트 역할로 제한했습니다.",
      "같은 백엔드 위에 자산 흐름 요약 화면(MyWave)을 얹어, 종목 단위 기록과 자산 전체 흐름을 나눠 보게 했습니다.",
      "외부 시세·뉴스 API 실패 시 화면이 비지 않도록 폴백 경로를 두었습니다."
    ],
    contribution: [
      "거래 기록 기반 포트폴리오 계산 로직 설계",
      "수익률, 자산 비중, 보유 종목 화면 구현",
      "AI 체크리스트 응답 구조와 투자 자문 아님 고지 처리",
      "Spring Boot 백엔드 도메인 구조 설계",
      "MyWave 자산 흐름 대시보드 화면 구현"
    ],
    result:
      "거래 기록만 넣으면 수익률·자산 비중·자산 흐름(MyWave)이 한 화면에서 이어지는 프로토타입까지 갔습니다. AI 는 매수·매도 추천이 아니라 리스크·편중·기록 누락을 짚는 체크리스트로 역할을 못 박았고, 시세·뉴스 API 가 실패해도 화면이 비지 않도록 폴백 경로를 뒀습니다.",
    nextStep:
      "실시간 시세 API와 자동 포트폴리오 업데이트 기능을 추가할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/MyStock-Desk"}]
  },
  {
    id: "festflow",
    title: "FestFlow",
    description: "대학 축제 운영자를 위한 실시간 부스 관리 시스템입니다.",
    role: "프론트엔드 중심 풀스택 개발",
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
      "SSE 기반 실시간 데이터 흐름과 역할별 권한 분리 설계를 경험했습니다.",
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
      "운영자가 고치면 현장 화면이 새로고침 없이 따라오는 구조까지 갔습니다 — 부스 혼잡도·공연 상태·공지 등이 각각 SSE 채널 7개로 흐릅니다. 백엔드 컨트롤러 26개로 사용자용과 관리자용 기능을 한 서비스 안에서 닫았습니다.",
    nextStep: "SMS 알림, 매출 집계, 현장 QR 체크인 기능을 추가할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/FestFlow"}]
  },
  {
    id: "sign-language",
    title: "수어지교",
    description:
      "수어 동작 영상을 보고 뜻을 맞히며 익히는 학습 앱입니다. (3D 아바타 제작은 팀원 담당)",
    role: "Spring Boot 백엔드 개발, API 설계, 데이터 처리",
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
      "정답률·연속 정답 피드백"
    ],
    learning:
      "영상 저장소와 메타데이터 저장소가 나뉘어 있을 때 조회 경로를 하나로 모으는 설계를 경험했습니다.",
    problem:
      "수어를 배우고 연습할 수 있는 접근성 높은 도구가 부족했습니다. 동작을 보고 의미를 이해하며 반복 학습할 수 있는 흐름이 필요했습니다.",
    approach: [
      "수어 동작 영상을 보여주고 보기 4개 중 뜻을 고르는 퀴즈 학습 구조를 설계했습니다.",
      "틀린 문항을 누적해 오답노트와 최다 오답 단어로 되돌려주는 흐름을 만들었습니다.",
      "Spring Boot에서 수어 데이터와 학습 결과를 처리하는 엔드포인트를 담당했습니다."
    ],
    contribution: [
      "Spring Boot 기반 백엔드 서버 구현",
      "수어 데이터 입력 처리와 API 설계",
      "퀴즈 채점·오답 집계와 영상 URL 폴백 로직 구현"
    ],
    result:
      "반복 학습과 오답 되짚기까지 동작하는 앱 프로토타입으로, 30개 이상의 수어 단어를 학습 흐름에 올렸습니다. 영상 저장소와 메타데이터 저장소가 나뉘어 있어 조회 경로를 백엔드에서 하나로 모았고, 영상 URL 이 없을 때의 폴백까지 처리했습니다.",
    nextStep: "학습 콘텐츠 확장과 실제 사용자 테스트를 진행할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/Sign-Language"}]
  },
  {
    id: "aclub",
    // 표기는 aClub 하나로 — 히어로·푸터·카드·본문이 ACLUB / aClub / AjouClub
    // 셋으로 갈려 있었다. 실서비스 이름(aclub.co.kr)을 따른다.
    title: "aClub",
    description:
      "동아리 탐색과 모집을 연결하는 캠퍼스 플랫폼 프론트엔드입니다.",
    role: "React + TypeScript 프론트엔드 개발",
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
      "사용자 흐름이 긴 플랫폼에서 라우팅과 상태 관리를 분리하는 방법을 익혔습니다.",
    problem:
      "동아리 정보가 여러 채널에 흩어져 있어 학생들이 원하는 동아리를 찾고 모집 일정을 확인하기 어려웠습니다.",
    approach: [
      "탐색, 필터링, 상세 조회, 지원까지 이어지는 사용자 흐름을 화면 단위로 설계했습니다.",
      "일반 사용자와 관리자 화면을 분리해 역할별 기능을 명확히 했습니다.",
      "React + TypeScript + Vite 기반으로 빠른 개발 환경을 구성했습니다."
    ],
    contribution: [
      "동아리 탐색, 필터, 상세 페이지 구현",
      "모집 공고 조회와 지원 화면 구현",
      "마이페이지와 관리자 화면 구조 설계",
      "공통 컴포넌트와 라우팅 구조 정리"
    ],
    result:
      "2025년 프론트 3인 중 한 명으로 참여한 뒤, 그 결과로 2026년 프로젝트장을 맡아 개편했습니다. GA4 실측(2026.01–03) 기준 활성 사용자 3,500명 · 조회수 8.8만 · 세션 참여율 93.4%로 운영 중입니다.",
    nextStep: "백엔드 API 연동과 실제 배포를 진행할 예정입니다.",
    links: [
      // 저장소가 둘인 이유를 라벨이 말해야 한다 — 어느 쪽이 내 코드냐고
      // 묻기 전에. 2025 는 팀원으로 참여한 원본, 2026 은 총괄한 개편본.
      {label: "GitHub (2026 · 총괄)", href: "https://github.com/aClub2026/FE"},
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
    learning: "Phaser 게임 루프와 오브젝트 생성/제거 최적화를 경험했습니다.",
    problem:
      "캠퍼스 생활을 가볍게 즐길 수 있는 웹 게임을 만들고 싶었습니다. 대학생이 공감할 수 있는 요소와 모바일 대응이 중요했습니다.",
    approach: [
      "캠퍼스 건물과 상징물을 발판과 배경 요소로 변환해 게임 맵을 구성했습니다.",
      "아이템, 장애물, 점수 시스템을 통해 짧은 플레이에도 반복 동기를 만들었습니다.",
      "낮/밤 배경 전환으로 진행감을 시각적으로 강화했습니다."
    ],
    contribution: [
      "Phaser 3 기반 게임 루프 설계 및 구현",
      "자동 발판 생성과 오브젝트 제거 최적화",
      "플레이어 액션과 점프 메커니즘 구현",
      "점수 시스템과 localStorage 저장 구현"
    ],
    result:
      "PC 와 모바일 브라우저에서 설치 없이 바로 도는 상태까지 갔습니다. 자동 생성되는 발판을 화면 밖에서 즉시 걷어내 긴 플레이에도 오브젝트가 쌓이지 않게 했고, 최고 점수는 localStorage 에 남아 다음 방문으로 이어집니다.",
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
      "대여사업 — 품목별 남은 수량, 관리자 −/+ 조정, 대여/반납 기록",
      "링크허브 — 인스타 프로필 링크 한도를 우회하는 링크 모음, 관리자가 직접 편집",
      "관리자 화면 — 대여·링크·공지·피드백 (ADMIN 권한만)",
      "홈페이지 도우미 — 퀵 메뉴 5개 + 의견 접수",
      "모바일 첫 화면 6갈래 · Docker + Nginx 배포"
    ],
    learning:
      "화면을 예쁘게 고치는 것보다 쓰는 사람이 스스로 고칠 수 있게 만드는 것이 운영형 서비스의 개선이라는 걸 배웠습니다.",
    problem:
      "학생은 물품이 남았는지 몰라 총학생회실까지 와서야 없다는 말을 들었고, 인스타 프로필에는 링크를 몇 개밖에 못 걸어 접수 폼 링크가 매번 밀려났습니다. 수량 하나, 링크 하나 바꾸는 데도 개발자가 배포해야 했습니다.",
    approach: [
      "RentalItem·RentalRecord·Link 엔티티와 사용자/관리자 컨트롤러를 Spring Boot로 만들고, 수량 조정은 서버가 0 미만·총량 초과를 거부하게 했습니다.",
      "학생 화면은 남은 수량을 읽기만 하고, 관리자 화면의 −/+ 가 API 로 바로 반영되게 했습니다.",
      "링크허브 한 페이지를 만들어 인스타 프로필엔 그 링크 하나만 걸고, 안의 링크는 총학생회가 직접 넣고 빼게 했습니다.",
      "모바일 첫 화면에 여섯 갈래를 펴고, Docker와 Nginx(try_files 폴백)로 배포했습니다."
    ],
    contribution: [
      "2025 — 대여사업 검색창, 정책집, 조직도 화면",
      "2026 — UI 전면 개편, 대여사업·링크허브·관리자 화면",
      "2026 — 대여·링크 API(Spring Boot·JPA), ADMIN 권한 분리",
      "Docker + Nginx 배포, 이미지 S3 업로드"
    ],
    result:
      "학생은 오기 전에 수량을 보고, 총학생회는 수량·링크·의견을 개발자 없이 직접 고칩니다. 2026.09 기준 대여 품목 10종·링크 11개가 실서비스에서 돌아가고, Search Console 기준(검색 유입, 2025.05~2026.08 16개월) 노출 12,314회 · 클릭 1,694회(CTR 13.8%)로 학생들이 검색을 통해 실제로 들어오고 있습니다.",
    nextStep:
      "대여 신청 자체를 온라인으로 받는 것과 접근성(대비·포커스) 보강이 남았습니다.",
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
      "게임화 피드백 루프와 커뮤니티 기능을 하나의 서비스로 묶는 설계를 경험했습니다.",
    problem:
      "운동 기록은 꾸준히 남기기 어렵습니다. 기록이 즉시 보상과 커뮤니티 반응으로 이어지면 지속성을 높일 수 있다고 판단했습니다.",
    approach: [
      "매일의 운동 기록을 캐릭터 성장, 출석, 퀘스트로 즉시 반영하는 게임형 루프를 설계했습니다.",
      "Socket.IO 기반 실시간 라운지로 사용자 간 상호작용을 강화했습니다.",
      "AI 인바디 분석을 통해 개인화된 운동 의사결정을 지원했습니다."
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
      "사용자 피드백을 근거로 서비스 성격 자체를 바꿔 다시 만들었습니다 — 소개형 홈페이지(도메인 4개)에서 출석·캐릭터 성장·실시간 라운지가 도는 운영형 플랫폼(도메인 8개 · 백엔드 Controller 28개)으로. 현재 약 50명이 이용 중입니다.",
    nextStep: "실사용자 테스트와 웨어러블 기기 연동을 검토할 예정입니다.",
    links: [
      {label: "시연 영상", href: "https://youtu.be/0X-BIADC1eQ"},
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_MuscleUp"}
    ]
  },
  {
    id: "darklab",
    title: "DarkLab",
    description: "1인칭 탐색 기반 3D 공포 어드벤처 게임 프로토타입입니다.",
    role: "게임 프로그래밍, 플레이어 제어, 상호작용, 카메라 연출",
    tech: ["Unity", "C#", "Cinemachine", "DOTween", "URP", "Input System"],
    features: [
      "1인칭 탐색",
      "오브젝트 상호작용",
      "Cinemachine 카메라 전환",
      "ScriptableObject 상태 관리",
      "NPC 이벤트 연출"
    ],
    learning:
      "Cinemachine과 DOTween을 활용한 카메라 연출, ScriptableObject 기반 데이터 구조 설계를 경험했습니다.",
    problem:
      "공포 게임의 긴장감은 공간 탐색과 오브젝트 상호작용에서 만들어집니다. 이를 자연스럽게 연결하는 카메라 연출과 이벤트 흐름이 필요했습니다.",
    approach: [
      "1인칭 플레이어 이동과 레이캐스트 기반 상호작용으로 몰입감 있는 탐색을 구현했습니다.",
      "Cinemachine으로 시야 제한과 카메라 전환을 구성해 공포 분위기를 강화했습니다.",
      "캐릭터 상태 데이터를 ScriptableObject로 분리해 유지보수가 쉬운 구조를 만들었습니다."
    ],
    contribution: [
      "1인칭 플레이어 이동과 Input System 연동",
      "레이캐스트 기반 오브젝트 상호작용 구현",
      "Cinemachine 카메라 전환과 연출",
      "ScriptableObject 기반 상태 데이터 설계"
    ],
    result:
      "탐색 → 상호작용 → 연출이 끊기지 않고 이어지는 3인 팀 프로토타입까지 갔습니다. 캐릭터 상태를 ScriptableObject 로 빼 데이터와 로직을 분리했고, 덕분에 팀원이 스크립트나 씬을 건드리지 않고 값만 바꿔 가며 밸런스를 볼 수 있었습니다.",
    nextStep:
      "퍼즐 요소와 엔딩 시퀀스를 추가해 챕터형 게임으로 확장할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/DarkLab"}]
  },
  {
    id: "tserof",
    title: "TSEROF",
    description:
      "잃어버린 아이템을 찾아 스테이지를 클리어하는 Unity 3D 플랫폼 게임입니다.",
    role: "게임 프로그래밍, 플레이어 제어, 스테이지 시스템",
    tech: ["Unity", "C#", "Unity 2022.3"],
    features: [
      "WASD 이동",
      "2단 점프",
      "스테이지 선택",
      "진행 상황 저장",
      "아이템 탐색",
      "이어하기"
    ],
    learning:
      "팀 작업에서 Unity 씬 충돌을 줄이고 역할을 분리하는 작업 방식을 경험했습니다.",
    problem:
      "3D 플랫폼 게임에서는 조작감과 스테이지 진행 구조가 맞물려야 플레이가 자연스럽습니다. 저장과 이어하기까지 고려한 흐름이 필요했습니다.",
    approach: [
      "WASD 이동과 2단 점프를 기반으로 조작감 있는 플레이어 컨트롤러를 구현했습니다.",
      "스테이지 선택, 잠금 해제, 진행 상황 저장을 통해 이어서 플레이할 수 있는 구조를 설계했습니다.",
      "팀 작업 중 씬 충돌을 줄이기 위해 기능 단위로 작업 범위를 나누었습니다."
    ],
    contribution: [
      "플레이어 이동과 2단 점프 컨트롤러 구현",
      "스테이지 선택과 잠금 해제 시스템 구현",
      "진행 상황 저장 로직 구현",
      "팀 Git 작업 구조 정리"
    ],
    result:
      "5인 팀에서 부팀장으로 참여해 Steam 스토어 출시까지 완주했습니다. 학내 과제로 끝나지 않고 누구나 상점에서 내려받을 수 있는 상태까지 간 유일한 프로젝트입니다.",
    nextStep: "추가 스테이지와 보스 패턴 설계의 완성도를 높일 예정입니다.",
    links: [
      {
        label: "Steam 스토어",
        href: "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana"
      },
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=1Lm-lpVsmq8"
      },
      {label: "GitHub", href: "https://github.com/KimEoJin24/TSEROF"}
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
    role: "AI 몬스터 시스템 · 감지 로직 · 중앙 제어 구조 설계 (몬스터 개발 · 메인 기획)",
    tech: ["Unity", "XR Interaction Toolkit", "C#", "NavMesh"],
    features: [
      "특수 카메라로만 보이는 퍼즐 단서",
      "손전등 사용 시 적 감지 범위 증가",
      "적 시야각(FOV) 회피와 추격",
      "NavMesh Patrol → Chase → Attack 상태 AI",
      "GameManager 중앙 토글로 퍼즐 ↔ 추격 연동"
    ],
    learning:
      "감지 로직과 AI 행동을 분리하고 중앙에서 토글하니, 퍼즐 조건이 늘어도 결합도가 낮게 확장됐습니다.",
    problem:
      "단순 추격만으로는 공포의 템포를 조절할 수 없었고, 감지 로직과 AI 로직이 직접 결합되면 유지보수가 어려웠습니다.",
    approach: [
      "몬스터 AI를 거리 기반 Patrol → Chase → Attack 상태로 나누고, Enable 토글로 퍼즐 진행과 연동했습니다.",
      "감지기(Detector)는 감지만 담당하고, GameManager 가 AI 행동을 중앙에서 켜고 끄도록 구조를 나눴습니다.",
      "플레이어 시야각 감지와 손전등 빛 원뿔 감지를 따로 두어, 손전등을 켜는 것이 실제 리스크가 되게 했습니다."
    ],
    contribution: [
      "MonsterAI — NavMesh 기반 배회/추격/공격 상태 전환",
      "EnemyDetector / EnemyLightZoneDetector — 시야각·손전등 원뿔 감지",
      "GameManager — 몬스터 활성/비활성 중앙 제어 (싱글톤)",
      "PlayerFlashlight — 손전등 상태와 빛 원뿔 정보 제공",
      "메인 기획"
    ],
    result:
      "퍼즐 진행에 따라 추격이 켜지고 꺼지는 구조까지 갔습니다 — 감지기 2종이 GameManager 를 통해 몬스터 2종(Doll · Bookhead)의 추격을 토글하고, 시야에서 벗어난 뒤 5초가 지나야 추격이 풀립니다. 추가 트리거·퍼즐 조건에도 결합도 낮게 확장할 수 있는 형태입니다.",
    nextStep: "퍼즐 조건과 몬스터 종류를 늘리고, 감지 규칙을 데이터로 빼는 것.",
    links: [{label: "GitHub", href: "https://github.com/kbwon/IMP_VR"}]
  },
  {
    // PDF 49–55쪽. 스크립트는 저장소의 Weapon-JJH / Weapon2_JJH 브랜치에 있다.
    id: "monsterpoint-ar",
    title: "INTO MONSTER POINT",
    description:
      "현실 공간을 스캔해 전투 공간으로 고정하고, 그 안에서 몬스터가 웨이브로 등장하는 AR 생존 슈터입니다.",
    role: "무기 제작 · 스폰 시스템 · 게임 루프 설계 (개발 · 기획)",
    tech: ["Unity", "AR Foundation", "C#"],
    features: [
      "Plane Detection 으로 전투 공간 고정",
      "평면 boundary 로 바닥·4방향 벽 자동 생성",
      "현실 공간 크기 기반 스폰",
      "웨이브 스폰 → 처치 수 도달 시 보스",
      "조이스틱 무기 발사 · 잠금/쿨타임 (활·칼·마법·총)"
    ],
    learning:
      "AR 에서는 플레이 공간을 코드가 정하는 게 아니라 스캔 결과가 정한다는 것 — 그래서 스폰·벽·바닥이 전부 boundary 에서 파생되게 설계했습니다.",
    problem:
      "현실 공간은 플레이할 때마다 크기와 모양이 다릅니다. 전투 공간·스폰 위치·경계를 고정값으로 두면 어떤 방에서는 벽 밖에 몬스터가 생깁니다.",
    approach: [
      "스캔 종료 시 탐지된 평면 boundary 를 월드 좌표로 바꿔 min/max 로 바닥 크기를 정하고, 그 네 꼭짓점으로 벽을 세웠습니다.",
      "바닥 꼭짓점(floorCorners)을 기준으로 스폰 위치를 만들고, 일정 간격 스폰 → 처치 수 누적 → 보스 등장으로 웨이브를 이었습니다.",
      "무기별 발사 속도·힘·딜레이를 분리하고, 잠금 무기는 발사되지 않게 막았습니다."
    ],
    contribution: [
      "AdjustmentSystem — boundary → 바닥/벽 생성",
      "Spawner — spawnInterval 스폰 루프 · counterBoss 보스 트리거",
      "무기 4종 발사·잠금·쿨타임",
      "게임 루프 설계 · 기획"
    ],
    result:
      "스캔한 방 크기대로 바닥과 벽이 서고, 그 안에서 일반 몬스터 10마리를 처치할 때마다 보스가 나오는 웨이브 루프까지 동작합니다. 무기는 활·칼·마법·총 네 종류입니다.",
    nextStep: "몬스터 종류별 난이도 곡선과 잠금 해제 조건을 다듬는 것.",
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
    role: "게임 시스템 설계/구현 — 코어 루프 · AI · UI · 전투 · 성장 (1인 개발)",
    tech: ["Unity", "C#", "NavMesh"],
    features: [
      "1인칭 ↔ 탑다운 시점 전환",
      "레벨업 시 랜덤 스킬 3개 중 선택",
      "NavMesh 일반 몬스터 · 패턴형 보스 AI",
      "인벤토리 · 캐릭터 선택 · 돌발 퀘스트 · 포탈 씬 전환",
      "웨이브 5단계 · 다섯 번째가 보스"
    ],
    learning:
      "기능을 하나씩 붙이는 게 아니라 Player · Skill · AI · UI · Event 시스템을 나눠 두니, 새 스킬이나 새 상태를 붙일 때 다른 시스템을 안 건드리게 됐습니다.",
    problem:
      "퍼즐 탐색과 전투는 요구하는 시야와 조작이 다릅니다. 하나의 카메라·컨트롤러로 둘을 다 하면 어느 쪽도 몰입이 안 됩니다.",
    approach: [
      "플레이 모드에 따라 카메라·컨트롤러·물리 제약을 함께 전환하는 1인칭↔탑다운 시스템을 만들었습니다 — 연출이 아니라 게임 시스템으로.",
      "레벨업 시 시간을 멈추고 랜덤 스킬 3개를 제시해 매 판 다른 빌드가 나오게 했습니다.",
      "몬스터는 Idle → Move → Chase → Attack 상태 기반으로, 보스는 랜덤 패턴 공격에 예고를 붙였습니다."
    ],
    contribution: [
      "PlayerModeManager — 시점 전환(카메라 Parent · 컨트롤러 분리 · Y축 잠금)",
      "InGameSkillManager — 레벨업 랜덤 스킬 3택",
      "MonsterAI · WaveManager — 상태 AI · 웨이브/보스",
      "RobotSummoner · Portal · 돌발 퀘스트 — 이벤트 시스템",
      "인벤토리·캐릭터 선택 UI ↔ 게임 오브젝트 연동"
    ],
    result:
      "탐색 → 전투 → 레벨업 → 스킬 선택 → 다음 웨이브로 이어지는 코어 루프가 돌고, 시점 전환·랜덤 스킬·상태 AI·이벤트(소환 20초/쿨타임 20초, 포탈, 돌발 퀘스트)가 각자 독립된 시스템으로 붙어 있습니다.",
    nextStep: "건물별 스테이지 테마와 최종 보스 ‘졸업’까지 콘텐츠를 채우는 것.",
    links: [
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=mtIiIWmrSdg"
      },
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_IndiGame"}
    ]
  }
];
