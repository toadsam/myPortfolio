import type {ProjectData} from "@/types/portfolio";

export const projects: ProjectData[] = [
  {
    id: "mywave",
    title: "MyWave",
    description: "개인 자산 흐름을 한눈에 이해하도록 돕는 금융 관리 대시보드입니다.",
    role: "서비스 기획, UI 구조 설계, 프론트엔드 컴포넌트 설계",
    tech: ["React", "TypeScript", "Chart UI", "Tailwind CSS"],
    features: ["자산 흐름 시각화", "목표 관리", "개인 대시보드", "차트 기반 요약"],
    learning: "복잡한 금융 정보를 사용자의 다음 행동으로 이어지게 만드는 정보 설계의 중요성을 배웠습니다.",
    problem:
      "금융 서비스는 정보가 많아질수록 사용자가 부담을 느끼기 쉽습니다. 사용자가 소비와 자산 흐름을 빠르게 이해하고 다음 결정을 내릴 수 있는 구조가 필요했습니다.",
    approach: [
      "자산 흐름을 단순 목록이 아니라 시각적인 흐름과 지표로 보이도록 화면을 설계했습니다.",
      "목표 관리와 요약 대시보드를 분리해 현재 상태와 다음 행동을 구분했습니다.",
      "TypeScript 기반 데이터 모델을 정의해 차트와 카드 UI가 같은 데이터를 바라보도록 정리했습니다."
    ],
    contribution: [
      "핵심 사용자 흐름 기획",
      "금융 데이터 카드와 차트 UI 구조 설계",
      "대시보드 컴포넌트 분리 방향 정의",
      "개인화 화면 정보 구조 설계"
    ],
    result:
      "사용자가 자산 데이터를 단순 수치가 아니라 목표 중심으로 읽을 수 있는 금융 UX 프로토타입을 완성했습니다.",
    nextStep: "실제 금융 데이터 연동과 mock data 기반 대시보드 프로토타입 고도화를 진행할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam"}]
  },
  {
    id: "mystock",
    title: "MyStock-Desk",
    description: "거래 기록 기반 포트폴리오 분석과 AI 체크리스트를 제공하는 투자 기록 서비스입니다.",
    role: "프론트엔드와 백엔드 구조 설계, 포트폴리오 계산 로직 구현",
    tech: ["React", "TypeScript", "Spring Boot", "Tailwind CSS", "Recharts", "MySQL"],
    features: ["보유 종목 수익률 분석", "자산 비중 차트", "뉴스 영향 분석", "AI 체크리스트", "관찰 리스트"],
    learning: "실제 투자 데이터를 모델링하면서 도메인 복잡도를 구조적으로 낮추는 설계 경험을 쌓았습니다.",
    problem:
      "개인 투자자는 수익률, 자산 비중, 거래 기록, 뉴스 흐름을 따로 관리하는 경우가 많습니다. 투자 판단을 돕기 위해 여러 정보를 한 화면에서 연결할 필요가 있었습니다.",
    approach: [
      "사용자가 입력한 거래 기록을 기반으로 보유 종목과 수익률을 계산하는 구조를 설계했습니다.",
      "AI는 매수/매도 추천이 아니라 리스크, 편중, 기록 누락을 점검하는 체크리스트 역할로 제한했습니다.",
      "외부 API 실패 시 mock data로 화면을 유지하는 fallback 구조를 준비했습니다."
    ],
    contribution: [
      "거래 기록 기반 포트폴리오 계산 로직 설계",
      "수익률, 자산 비중, 보유 종목 화면 구현",
      "AI 체크리스트 응답 구조 설계",
      "Spring Boot 백엔드 도메인 구조 설계"
    ],
    result:
      "사용자가 입력한 데이터만으로 포트폴리오 상태와 AI 인사이트를 확인할 수 있는 프로토타입을 완성했습니다.",
    nextStep: "실시간 시세 API와 자동 포트폴리오 업데이트 기능을 추가할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/MyStock-Desk"}]
  },
  {
    id: "festflow",
    title: "FestFlow",
    description: "대학 축제 운영자를 위한 실시간 부스 관리 시스템입니다.",
    role: "프론트엔드 중심 풀스택 개발",
    tech: ["React", "Vite", "Tailwind CSS", "PWA", "Spring Boot", "JWT", "SSE", "MySQL", "React Leaflet"],
    features: ["SSE 실시간 부스 현황", "지도 기반 배치", "스태프 권한 관리", "관리자 대시보드", "PWA 오프라인 지원"],
    learning: "SSE 기반 실시간 데이터 흐름과 역할별 권한 분리 설계를 경험했습니다.",
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
      "운영자와 스태프가 실시간으로 부스 현황을 공유하고 관리할 수 있는 축제 운영 서비스 구조를 완성했습니다.",
    nextStep: "SMS 알림, 매출 집계, 현장 QR 체크인 기능을 추가할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/FestFlow"}]
  },
  {
    id: "sign-language",
    title: "수어지구",
    description: "수어 아바타를 활용한 학습 및 표현 서비스입니다.",
    role: "Spring Boot 백엔드 개발, API 설계, 데이터 처리",
    tech: ["Spring Boot", "React", "TypeScript", "3D Avatar"],
    features: ["수어 퀴즈 학습", "텍스트를 수어 아바타로 변환", "반복 학습 흐름", "정답 피드백"],
    learning: "3D 아바타 애니메이션과 백엔드 API가 연결되는 서비스 구조를 경험했습니다.",
    problem:
      "수어를 배우고 연습할 수 있는 접근성 높은 도구가 부족했습니다. 사용자가 동작을 보고 의미를 이해하며 반복 학습할 수 있는 흐름이 필요했습니다.",
    approach: [
      "수어 아바타가 동작을 보여주고 사용자가 의미를 입력하는 퀴즈 학습 구조를 설계했습니다.",
      "텍스트 입력을 수어 아바타 동작으로 변환하는 API 응답 흐름을 구성했습니다.",
      "Spring Boot에서 수어 데이터와 학습 결과를 처리하는 엔드포인트를 담당했습니다."
    ],
    contribution: [
      "Spring Boot 기반 백엔드 서버 구현",
      "수어 데이터 입력 처리와 API 설계",
      "퀴즈 정답 판정과 피드백 로직 구현"
    ],
    result:
      "수어 단어를 학습하고 텍스트를 수어 표현으로 확인할 수 있는 서비스 프로토타입을 만들었습니다.",
    nextStep: "학습 콘텐츠 확장과 실제 사용자 테스트를 진행할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/Sign-Language"}]
  },
  {
    id: "aclub",
    title: "ACLUB",
    description: "동아리 탐색과 모집을 연결하는 캠퍼스 플랫폼 프론트엔드입니다.",
    role: "React + TypeScript 프론트엔드 개발",
    tech: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    features: ["동아리 탐색", "필터링", "모집 공고 조회", "상세 페이지", "마이페이지", "관리자 화면"],
    learning: "사용자 흐름이 긴 플랫폼에서 라우팅과 상태 관리를 분리하는 방법을 익혔습니다.",
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
      "동아리 정보 탐색부터 모집 지원까지 하나의 서비스에서 처리할 수 있는 플랫폼 프론트엔드를 완성했습니다.",
    nextStep: "백엔드 API 연동과 실제 배포를 진행할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/aClub2026/FE"}]
  },
  {
    id: "ajou-adventure",
    title: "아주대모험",
    description: "아주대학교 캠퍼스를 배경으로 한 Phaser 3 기반 2D 캐주얼 게임입니다.",
    role: "게임 기획 및 전체 개발",
    tech: ["TypeScript", "Phaser 3", "Vite"],
    features: ["자동 맵 스크롤", "낮/밤 배경 전환", "플레이어 액션", "아이템과 장애물", "최고 점수 저장"],
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
      "PC와 모바일 브라우저에서 바로 플레이할 수 있는 캠퍼스 테마 캐주얼 게임을 완성했습니다.",
    nextStep: "리더보드와 공유 기능을 추가할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/Ajou_Mini_Game"}]
  },
  {
    id: "ajouchong",
    title: "아주총학",
    description: "아주대학교 총학생회 공식 웹사이트 프론트엔드입니다.",
    role: "React SPA 프론트엔드 개발",
    tech: ["React", "React Router", "JavaScript", "Docker", "Nginx"],
    features: ["공지사항 목록/상세", "Q&A 작성과 조회", "총학생회 소개", "복지 정보", "Docker + Nginx 배포"],
    learning: "실제 서비스 배포와 학생 대상 정보 구조를 고려한 SPA 설계를 경험했습니다.",
    problem:
      "총학생회 정보가 여러 채널에 분산되어 학생들이 공지, Q&A, 복지 정보를 한곳에서 확인하기 어려웠습니다.",
    approach: [
      "공지, 소개, Q&A, 자료, 복지 정보를 React Router로 연결하는 SPA 구조를 설계했습니다.",
      "로그인 상태를 Context로 관리하고 보호 라우트를 적용했습니다.",
      "Docker와 Nginx로 실제 서비스 배포 환경을 구성했습니다."
    ],
    contribution: [
      "React 기반 SPA 전체 라우팅 구조 설계",
      "공지사항, Q&A, 자료실 화면 구현",
      "AuthContext 기반 로그인 상태 관리",
      "Docker + Nginx 배포 설정"
    ],
    result:
      "학생들이 총학생회 정보를 한곳에서 확인하고 Q&A를 주고받을 수 있는 실제 웹 서비스를 배포했습니다.",
    nextStep: "알림 기능과 모바일 최적화를 추가할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/ajouchong-web"}]
  },
  {
    id: "muscleup",
    title: "근근 MuscleUp",
    description: "운동 기록을 게임화와 커뮤니티로 연결하는 풀스택 피트니스 플랫폼입니다.",
    role: "풀스택 개발, 기획, 프론트엔드와 백엔드 구현",
    tech: ["TypeScript", "React", "Spring Boot", "JWT", "OAuth", "SSE"],
    features: ["출석 체크", "캐릭터 성장", "운동 기록 루프", "실시간 챌린지", "게시글/댓글", "AI 인바디 분석", "Google OAuth"],
    learning: "게임화 피드백 루프와 커뮤니티 기능을 하나의 서비스로 묶는 설계를 경험했습니다.",
    problem:
      "운동 기록은 꾸준히 남기기 어렵습니다. 기록이 즉시 보상과 커뮤니티 반응으로 이어지면 지속성을 높일 수 있다고 판단했습니다.",
    approach: [
      "매일의 운동 기록을 캐릭터 성장, 출석, 퀘스트로 즉시 반영하는 게임형 루프를 설계했습니다.",
      "SSE 기반 실시간 챌린지로 사용자 간 상호작용을 강화했습니다.",
      "AI 인바디 분석을 통해 개인화된 운동 의사결정을 지원했습니다."
    ],
    contribution: [
      "출석, 캐릭터 성장, 퀘스트 루프 설계 및 구현",
      "JWT + Google OAuth 인증 시스템 구현",
      "SSE 기반 실시간 챌린지 구현",
      "AI 인바디 분석 연동과 리포트 화면 구현"
    ],
    result:
      "운동 기록, 커뮤니티, AI 분석을 하나의 흐름으로 연결한 풀스택 피트니스 플랫폼을 완성했습니다.",
    nextStep: "실사용자 테스트와 웨어러블 기기 연동을 검토할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/Ajou_MuscleUp"}]
  },
  {
    id: "darklab",
    title: "DarkLab",
    description: "1인칭 탐색 기반 3D 공포 어드벤처 게임 프로토타입입니다.",
    role: "게임 프로그래밍, 플레이어 제어, 상호작용, 카메라 연출",
    tech: ["Unity", "C#", "Cinemachine", "DOTween", "URP", "Input System"],
    features: ["1인칭 탐색", "오브젝트 상호작용", "Cinemachine 카메라 전환", "ScriptableObject 상태 관리", "NPC 이벤트 연출"],
    learning: "Cinemachine과 DOTween을 활용한 카메라 연출, ScriptableObject 기반 데이터 구조 설계를 경험했습니다.",
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
      "탐색, 상호작용, 연출이 유기적으로 연결된 3D 공포 게임 프로토타입을 완성했습니다.",
    nextStep: "퍼즐 요소와 엔딩 시퀀스를 추가해 챕터형 게임으로 확장할 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/toadsam/DarkLab"}]
  },
  {
    id: "tserof",
    title: "TSEROF",
    description: "잃어버린 아이템을 찾아 스테이지를 클리어하는 Unity 3D 플랫폼 게임입니다.",
    role: "게임 프로그래밍, 플레이어 제어, 스테이지 시스템",
    tech: ["Unity", "C#", "Unity 2022.3"],
    features: ["WASD 이동", "2단 점프", "스테이지 선택", "진행 상황 저장", "아이템 탐색", "이어하기"],
    learning: "팀 작업에서 Unity 씬 충돌을 줄이고 역할을 분리하는 작업 방식을 경험했습니다.",
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
      "스테이지 탐색과 진행 저장 구조를 갖춘 3D 플랫폼 게임 프로토타입을 완성했습니다.",
    nextStep: "추가 스테이지와 보스 패턴 설계의 완성도를 높일 예정입니다.",
    links: [{label: "GitHub", href: "https://github.com/KimEoJin24/TSEROF"}]
  }
];
