# 정재훈

Full-Stack Web Developer  
Email: toadsam@naver.com  
Phone: 010-6428-6247  
GitHub: https://github.com/toadsam  
Portfolio: https://jaehun.co.kr/  
Target: Web Full-Stack / Frontend / Backend

## Summary

React와 Spring Boot를 중심으로 서비스 구현, 인증/보안, 배포 운영 이슈까지 직접 다루는 신입 개발자입니다. 만든 기능은 배포한 뒤 HTTPS, CORS, 토큰 재발급에서 생긴 문제까지 직접 재현해 고쳐 왔습니다. 공개 GitHub에는 최신 웹 풀스택, 접근성/교육 서비스, 알고리즘, Unity 프로젝트가 함께 정리되어 있습니다.

- React/Spring Boot 기반 웹 풀스택, 프론트엔드, 백엔드 직무 지향
- JWT 이중 쿠키와 토큰 재발급 경쟁 상태, OAuth/Session, CORS, HTTPS, SSE 등 운영형 문제 해결 경험
- LLM 연동 시 응답 검증, 상하한 제한, 규칙 기반 폴백을 두는 신뢰성 설계 경험
- 공개 GitHub 44개 repository, TypeScript/Java/JavaScript/C++/C# 프로젝트 보유
- 2026년 최신 업데이트 repo: myPortfolio, FestFlow, Sign-Language, Ajou_MuscleUp, Algorithm

## Technical Skills

Frontend: React, TypeScript, Next.js, Three.js (R3F), Vite, React Query, Tailwind CSS, Expo, React Native
Backend: Spring Boot, Java, JPA, Spring Security, Node.js, Express, FastAPI (Python)
Auth: JWT, Refresh Token Rotation, OAuth2, Passport, Firebase Auth
Infra / Data: AWS, S3, CloudFront, MySQL, MongoDB, Firebase
AI / LLM: OpenAI API, Claude Agent SDK, 구조화 출력(JSON), 규칙 기반 폴백, 도구 호출 샌드박스
Unity / XR: Unity, C#, AR Foundation, XR Interaction Toolkit, NavMesh, Object Pooling

## GitHub Evidence

- Public Profile: 44 public repositories
- Current Web Repos: FestFlow, Sign-Language, Ajou_MuscleUp
- Public repo languages: TypeScript, Java, JavaScript, C++, C#, ShaderLab, HTML, Svelte, GDScript
- Recent evidence: FestFlow updated in May 2026, Sign-Language updated in May 2026, Ajou_MuscleUp updated in April 2026, Algorithm updated in March 2026

## Project Links

- myPortfolio (AI 포트폴리오 마을): https://github.com/toadsam/myPortfolio
- FestFlow: https://github.com/toadsam/FestFlow
- Ajou_MuscleUp: https://github.com/toadsam/Ajou_MuscleUp
- Sign-Language: https://github.com/toadsam/Sign-Language
- Algorithm: https://github.com/toadsam/Algorithm
- codebase-anatomy (Claude Code 스킬): https://github.com/toadsam/codebase-anatomy
- aClub: https://github.com/aClub2026/FE (aclub.co.kr 은 2026.03 모집 종료 후 닫음)
- Ajou Student Council: https://ajouchong.com
- Ajou Student Council 2026 개편 PR (프론트): https://github.com/ajouchong-dev/ajouchong-web/pull/36
- Ajou Student Council 대여·링크 API PR (백엔드): https://github.com/ajouchong-dev/ajouchong/pull/70

## Hiring Signals

- 서비스 전체 흐름 구현: 화면부터 API, 인증, DB, 배포까지 사용자가 지나가는 한 흐름으로 이어서 만듭니다.
- 운영 중 문제 해결: HTTPS/Mixed Content, CORS credentials, Refresh Token 재발급, 세션 저장소, SSE 연결처럼 배포 후에 드러나고 프론트와 서버 설정을 함께 봐야 하는 문제를 직접 재현해 수정했습니다.
- 실사용 피드백 반영: GA4/GSC 지표와 운영 피드백을 바탕으로 정보 구조, CTA, 링크 흐름, 문구를 개선했습니다.
- AI 코딩 도구 운용: 프로젝트 규칙과 이미 겪은 실패를 문서로 고정해 같은 실수가 반복되지 않게 했습니다(규칙 문서는 3개월간 24회 갱신). 도구가 제안한 값은 번들 크기, 텍스처 VRAM처럼 직접 측정해 확인한 뒤 반영했습니다. 반복되는 분석 작업은 Claude Code 스킬로 만들어 공개했습니다(codebase-anatomy).
- AI 기능의 신뢰성 설계: 에이전트에 진행 권한을 주지 않고 상태 전이를 순수 함수와 관리자 게이트로 분리했습니다. 모델이 낸 견적은 규칙 기반 기준의 0.6~1.8배로 제한하고, API 키가 없거나 호출이 실패하면 규칙 기반 응답으로 이어갑니다. 이 규칙들은 백엔드 테스트로 잠가 두었습니다.

## Core Projects

### AI 포트폴리오 마을 (myPortfolio)

2026.06 - 진행 중 / 개인 개발 / Full-Stack Web + 3D  
Role: Next.js 프론트, FastAPI 백엔드, 관리자 페이지, OpenAI NPC 연동(규칙 기반 폴백), Claude Agent SDK 직군 에이전트, 3D 성능 예산 전부 담당  
Scope: 개인 개발 / 공개 GitHub repo / 이 이력서가 실려 있는 사이트 자체  
Stack: Next.js 16, React 19, TypeScript, React Three Fiber, FastAPI, SQLAlchemy, SQLite, OpenAI API, Claude Agent SDK, pytest, Playwright

관리자가 적은 "오늘의 활동"이 3D 마을의 건물 불빛과 AI NPC의 기분·대화로 바뀌는, 살아 있는 포트폴리오 사이트입니다. 채용 담당자용 이력서 화면과 방문자가 웹사이트 제작을 의뢰하는 공방까지 한 서비스에 있습니다.

- Problem: 정적 포트폴리오는 한 번 만들면 갱신이 끊기고, 읽는 사람이 질문할 수 없습니다. 활동이 화면에 반영되고 방문자가 물어볼 수 있는 구조가 필요했습니다.
- Action: 관리자 페이지 입력을 FastAPI 서비스가 건물 밝기·NPC 기분으로 변환하고, NPC 대화는 OpenAI로 생성하되 키가 없거나 실패하면 규칙 기반 대사로 폴백해 서비스가 멈추지 않게 했습니다. 첫 화면은 three.js를 전혀 싣지 않는 별도 라우트로 분리하고(JS 215KB, 3D 모델 0개), 마을은 마우스를 올리는 순간 미리 받습니다. 의뢰 공방은 Claude Agent SDK로 네 직군 에이전트가 실제 산출물을 쓰되, 진행 권한은 관리자의 게이트 함수 하나에만 두고 도구 호출은 콜백 샌드박스로 막았습니다. 개발 자체도 Claude Code와 짝으로 하되 계획 승인·실측·검증은 사람이 쥐었습니다.
- Result: 공개·관리자 API 65개, 순수 로직 pytest 258개. 방문자가 쓰는 유일한 경로(제작 의뢰)는 허니팟, 전용 레이트리밋, 견적 상·하한 클램프로 막았고, 텍스처 VRAM과 실광원 수를 측정해 예산으로 잠갔습니다.
- Evidence: 저장소가 공개되어 있고, 이 이력서가 실린 사이트가 실행 결과입니다. 첫 화면 무게와 3D 모델 수는 빌드 산출물에서 측정한 값입니다.

### FestFlow

2026.04 - 2026.06 / 개인 프로젝트 · 공개 GitHub repo / Full-Stack Festival Management Web App  
Role: React, Spring Boot, JWT, SSE, PWA 기반 사용자/관리자 기능 구현  
Scope: 개인 프로젝트 / 공개 GitHub repo / 사용자·관리자 양쪽 기능 구현  
Stack: React, Vite, Tailwind CSS, PWA, Spring Boot 3, JPA, Spring Security, JWT, SSE, MySQL

대학교 축제 운영을 위한 웹앱으로, 사용자 지도/부스 탐색과 관리자 운영, 실시간 공지·혼잡도·공연 상태를 함께 다루는 서비스입니다.

- Problem: 축제 현장에서는 부스 위치, 혼잡도, 공연 상태, 공지, 분실물, 관리자 운영 데이터가 빠르게 바뀌어 실시간성과 운영 권한이 중요합니다.
- Action: 현장에서 바뀌는 혼잡도·공연·공지를 SSE 스트림으로 흘리고, 사용자 기능과 관리자 API를 분리했습니다. 스택은 React(Vite)·Tailwind PWA, Spring Boot 3/JPA/Security/JWT, MySQL입니다.
- Result: SSE 기반 혼잡도·공연·공지 스트림, 관리자 CRUD/CSV 업로드, KPI/감사 로그, GPS 기반 혼잡도 계산, 분석 API까지 포함한 운영형 구조를 구현했고, 2026.05 아주대학교 대동제에서 AI Match 기능을 1일간 실제 운영했습니다.
- Evidence: 현장 운영 실측(2026.05 아주대학교 대동제 · 1일): AI Match 등록자 169명, 매칭 신청 424건, 성사 매칭 36건, 관리자 처리 30건 이상, QA 참여 46명(본인 확인 2026-09-06 — 발표자료 15장의 15명은 등록자 47명·신청 23건과 같은 초기 스냅샷). 저장소에는 SSE 스트림, 관리자 보호 API, CSV 일괄 업로드, KPI, 감사 로그, PWA/오프라인 페이지 구조가 공개되어 있습니다.

### 득근득근 MuscleUp

2025.09 - 2026.06 / 개인 개발 / Full-Stack Web  
Role: 기획, UI 설계, API 개발, 인증/권한 구현, 배포 담당  
Scope: 개인 개발 / 기획, UI, 백엔드 API, 인증·권한, 배포 담당  
Stack: React, Spring Boot, JPA, JWT 이중 쿠키(HttpOnly), AWS, AI Coaching

운동 기록, 커뮤니티, AI 코칭을 하나의 사용자 흐름으로 통합한 피트니스 커뮤니티 서비스입니다.

- Problem: 운동 기록, 커뮤니티, AI 코칭이 분리되면 사용자가 루틴을 지속하기 어렵고 인증/배포 조건까지 고려해야 했습니다.
- Action: React/Spring Boot 기반으로 화면과 API를 구성하고, Access/Refresh Token을 HttpOnly 이중 쿠키로 분리했습니다. Refresh Token Rotation을 적용했다가 병렬 요청이 서로의 토큰을 무효화해 로그아웃되는 경쟁 상태를 만나, 클라이언트 재발급 단일화(single-flight)로 대체했습니다.
- Result: AWS 배포 과정의 HTTPS, Mixed Content, CORS credentials 이슈를 해결해 운영 가능한 풀스택 서비스 형태로 완성했습니다.
- Evidence: GitHub에 Auth, AI, Analytics, Crew, Friend, Ranking, Review 등 도메인별 controller/entity 구조와 RefreshToken 엔티티가 공개되어 있습니다.

### Sign-Language

2026.01 - 2026.05 / 파란학기제 4인 팀 · 공개 GitHub repo / 수어 학습·표현 서비스  
Role: Expo/React Native 프론트, Spring Boot 백엔드, OAuth2/JWT/Firebase 기반 인증·학습 API 구성  
Scope: 팀 도전과제 시제품 / Expo 앱과 Spring Boot API 기반 학습·표현 흐름 구현  
Stack: TypeScript, Expo, React Native, Spring Boot, Spring Security, OAuth2, JWT, Firebase

수어 아바타 기반 퀴즈 학습과 텍스트 입력 기반 수어 표현을 결합한 접근성/교육 목적 서비스입니다.

- Problem: 수어를 처음 접하는 사용자는 동작과 의미를 반복적으로 연결해 학습할 도구가 부족하고, 입력한 표현을 즉시 수어로 확인하기 어렵습니다.
- Action: 수어 아바타 퀴즈로 동작과 의미를 반복해 맞히고 정답 피드백을 받는 학습 흐름과, 입력한 텍스트를 수어 표현으로 보여주는 흐름을 Expo/React Native 앱과 Spring Boot API(Google OAuth2, JWT, Firebase)로 만들었습니다.
- Result: 수어 읽기 학습, 정답 피드백, 텍스트 기반 수어 표현, 사용자 인증을 포함한 시제품 구조를 공개 repo로 관리했습니다.
- Evidence: README에 30개 이상 기본 수어 단어 학습 콘텐츠와 텍스트 기반 수어 표현 기능 목표가 정리되어 있고, backend/frontendcodes 구조가 공개되어 있습니다.

### 운영형 웹사이트 개선: aClub / 아주대학교 총학생회

2025.01 - 진행 중 (aClub 2025.01–2026.03 동아리 박람회까지 · 총학생회 웹 2025.03–진행 중) / 운영형 홍보·정보 제공 웹  
Role: Frontend 개발, 정보 구조 설계, GA4/GSC 기반 개선 · 총학생회는 2026년부터 단독 담당(프론트 + Spring Boot API + 배포)  
Scope: Frontend 개발 / 정보 구조 설계 / GA4·GSC 기반 운영 개선 / 총학생회 대여사업·링크허브·관리자 화면 · 백엔드 API  
Stack: React, Vite, Axios, Spring Boot, JPA, PostgreSQL, JWT, Docker, Nginx, GA4, GSC

동아리와 총학생회 정보를 공지, 모집, 행사, 자료, 신청 흐름으로 정리하고 운영 피드백과 분석 지표로 개선한 웹사이트입니다. 총학생회 웹은 2025년 프론트 3인 중 한 명으로 화면 일부를 맡았고, 2026년 4월부터 혼자 맡아 UI 전면 개편·대여사업·링크허브·관리자 화면을 프론트부터 API까지 만들었습니다.

- Problem: 학생은 물품이 남았는지 몰라 총학생회실까지 와서야 없다는 말을 들었고, 인스타 프로필에는 링크를 몇 개밖에 못 걸어 접수 폼 링크가 매번 밀려났습니다. 수량 하나, 링크 하나 바꾸는 데도 개발자가 배포해야 했습니다.
- Action: Spring Boot로 대여 품목·대여 기록·링크 엔티티와 사용자/관리자 API를 만들고(수량 조정은 서버가 0 미만·총량 초과를 거부, 관리자 API는 ADMIN 권한만), 학생 화면은 남은 수량을 읽고 관리자 화면은 −/+로 바로 반영되게 했습니다. 링크허브 한 페이지로 인스타 프로필 링크 한도를 우회하고, 모바일 첫 화면에 여섯 갈래를 폈습니다.
- Result: 학생은 오기 전에 수량을 보고, 총학생회는 수량·링크·의견을 개발자 없이 직접 고칩니다. 2026.09 기준 대여 품목 10종·링크 11개가 실서비스에서 운영 중이고, Search Console 기준(검색 유입, 2025.05~2026.08) 노출 12,314회·클릭 1,694회(CTR 13.8%)입니다.
- Evidence: 아주대학교 총학생회 서비스 URL이 공개되어 있고(aClub 은 2026.03 운영 종료 · 저장소 공개), 총학생회 2026 작업은 조직 저장소 PR(프론트 #36, 백엔드 #70)로 확인할 수 있습니다. 포트폴리오에 GA4/GSC와 운영 피드백 기반 개선 기록을 정리했습니다.

## Additional Technical Projects

### Ajou Campus Foodmap

2024.10 - 2024.12 / React, Express, MongoDB  
Passport Local과 Google/Naver OAuth를 통합하고 MongoStore, withCredentials, CORS allowlist로 SPA/API 분리 환경의 세션 유지 문제를 해결했습니다.

### Algorithm

2026.03 업데이트 / C++  
BaekjoonHub로 C++ 문제 풀이를 별도 repo에 기록하고 있습니다.

### TSEROF · INTO MONSTER POINT · 아주대탐험

2023.10 - 2025.04 / Unity, C#, AR (TSEROF 2023.10–2024.02 · 아주대탐험 2024.09–12 · INTO MONSTER POINT 2025.03–04)  
TSEROF(Steam 출시, 5인 팀 부팀장)에서는 스테이지 2 통합 씬(구간별 Cinemachine 카메라·리스폰·클리어), 3×3 패턴 퍼즐, 속성 큐브, 대포·낙하물·회전·가시·레버 등 장애물 기믹과 기믹 인터페이스 도입을 맡았고, INTO MONSTER POINT·아주대탐험에서는 AR Plane 기반 전투 공간 생성, NavMesh AI, 스킬 선택 등 인터랙션과 게임 시스템 구현 경험을 쌓았습니다.

## Certifications

정보처리기사 (국가기술자격), 한국산업인력공단  
2026.09.11 취득 (2026년 2회 실기 · 자격번호 26202101324W)

SQL 개발자 SQLD (국가공인), 한국데이터산업진흥원  
2026.09.11 취득 (자격번호 SQLD-062024417 · 유효기간 2028.09.11)

## Education

아주대학교, 디지털미디어학과 전공  
2021.03 - 2027.02

아주대학교, 인공지능융합학과 복수전공, 메타버스기획마이크로전공  
2021.03 - 2027.02

스파르타 내일배움캠프(팀스파르타), 실무형 Unity 게임개발자 양성과정 (1,080시간)  
2023.08.07 - 2023.12.15 (HRD-Net 훈련확인증 기준)

구름(goorm) · 카카오엔터프라이즈, 군 장병 맞춤형 온라인 AI·SW 교육 — 입문 과정 · SW개발 초급과정 2 수료  
2023.03.08 - 2023.12.31 (수료증 기재 교육 기간, 발행 2023.06.16)

코드잇, 대학생 코딩캠프  
2021.03 - 2021.04 (기수 미확인 — 3기 2021.03.14~04.12 로 추정)

## Collaboration

헬스 동아리 회장, 정보통신대학교 학생회 대외협력국, 총학생회 생활복지국·소통발전국·소통개발국장을 맡아 일정과 역할을 나누고 문의·피드백을 받아 처리했습니다.

## Positioning

신입이지만 운영 가능한 서비스 완성을 기준으로 일하는 개발자입니다. React/Spring Boot 구현력과 인증/배포 이슈 해결 경험, 운영 피드백을 제품 개선으로 연결한 경험이 있습니다. AI 기능도 같은 기준으로 다룹니다. 모델 응답을 그대로 내보내지 않고, 틀리거나 호출이 실패했을 때의 경로를 먼저 만듭니다.
