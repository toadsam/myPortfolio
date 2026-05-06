# 정재훈

Full-Stack Web Developer  
Email: toadsam@naver.com  
Phone: 010-6428-6247  
GitHub: https://github.com/toadsam  
Portfolio: https://toadsam.github.io/myPortfolio/  
Target: Web Full-Stack / Frontend / Backend

## Summary

React와 Spring Boot를 중심으로 서비스 구현, 인증/보안, 배포 운영 이슈까지 직접 다루는 신입 개발자입니다. 기능을 만드는 데서 멈추지 않고 사용자 흐름, API 책임, 토큰/세션 유지, HTTPS/CORS 같은 운영 조건까지 확인해 실제 서비스로 닫는 개발을 지향합니다. 공개 GitHub에는 최신 웹 풀스택, 접근성/교육 서비스, 알고리즘, Unity 프로젝트가 함께 정리되어 있습니다.

- React/Spring Boot 기반 웹 풀스택, 프론트엔드, 백엔드 직무 지향
- JWT Refresh Token Rotation, OAuth/Session, CORS, HTTPS, SSE 등 운영형 문제 해결 경험
- 공개 GitHub 44개 repository, TypeScript/Java/JavaScript/C++/C# 프로젝트 보유
- 2026년 최신 업데이트 repo: FestFlow, Sign-Language, Ajou_MuscleUp, Algorithm

## Technical Skills

Frontend: React, Vite, TypeScript, JavaScript, React Query, Axios, Expo, React Native, Tailwind CSS, Responsive UI  
Backend: Java, Spring Boot, Spring Security, JPA, REST API, Express, Passport, Session  
Auth / Infra / Data: JWT, Refresh Token Rotation, OAuth2, AWS, CloudFront, S3, CORS, HTTPS, SSE, Firebase, MySQL, MongoDB  
Unity / XR: Unity, C#, AR Foundation, XR Interaction Toolkit, NavMesh, Object Pooling

## GitHub Evidence

- Public Profile: 44 public repositories
- Current Web Repos: FestFlow, Sign-Language, Ajou_MuscleUp
- Public repo languages: TypeScript, Java, JavaScript, C++, C#, ShaderLab, HTML, Svelte, GDScript
- Recent evidence: FestFlow updated in May 2026, Sign-Language updated in May 2026, Ajou_MuscleUp updated in April 2026, Algorithm updated in March 2026

## Project Links

- FestFlow: https://github.com/toadsam/FestFlow
- Ajou_MuscleUp: https://github.com/toadsam/Ajou_MuscleUp
- Sign-Language: https://github.com/toadsam/Sign-Language
- Algorithm: https://github.com/toadsam/Algorithm
- aClub: https://ajouclub.co.kr
- Ajou Student Council: https://ajouchong.com

## Hiring Signals

- 서비스 전체 흐름 구현: 화면, API, 인증, DB, 배포 환경을 분리해서 보지 않고 사용자가 실제로 지나가는 흐름 기준으로 설계합니다.
- 운영 중 문제 해결: HTTPS, Mixed Content, CORS credentials, Refresh Token 재발급, 세션 저장소, SSE 실시간 스트림처럼 배포 후 드러나는 문제를 직접 재현하고 수정했습니다.
- 실사용 피드백 반영: GA4/GSC 지표와 운영 피드백을 바탕으로 정보 구조, CTA, 링크 흐름, 문구를 개선했습니다.
- 대표 트러블슈팅: CORS credentials, 쿠키 기반 세션 유지, HTTPS/Mixed Content, Refresh Token 재발급, SSE 연결처럼 프론트와 서버 설정을 함께 봐야 하는 문제를 다뤘습니다.

## Core Projects

### FestFlow

2026.05 업데이트 / 공개 GitHub repo / Full-Stack Festival Management Web App  
Role: React, Spring Boot, JWT, SSE, PWA 기반 사용자/관리자 기능 구현  
Scope: 개인 프로젝트 / 공개 GitHub repo / 사용자·관리자 양쪽 기능 구현  
Stack: React, Vite, Tailwind CSS, PWA, Spring Boot 3, JPA, Spring Security, JWT, SSE, MySQL

대학교 축제 운영을 위한 웹앱으로, 사용자 지도/부스 탐색과 관리자 운영, 실시간 공지·혼잡도·공연 상태를 함께 다루는 서비스입니다.

- Problem: 축제 현장에서는 부스 위치, 혼잡도, 공연 상태, 공지, 분실물, 관리자 운영 데이터가 빠르게 바뀌어 실시간성과 운영 권한이 중요합니다.
- Action: React(Vite)와 Tailwind 기반 PWA, Spring Boot 3/JPA/Security/JWT, MySQL 구조로 사용자 기능과 관리자 API를 분리했습니다.
- Result: SSE 기반 혼잡도·공연·공지 스트림, 관리자 CRUD/CSV 업로드, KPI/감사 로그, GPS 기반 혼잡도 계산, 분석 API까지 포함한 운영형 구조를 구현했습니다.
- Evidence: README 기준 SSE 스트림 3개, 관리자 보호 API, CSV 일괄 업로드, KPI, 감사 로그, PWA/오프라인 페이지 구조가 공개되어 있습니다.

### 득근득근 MuscleUp

2025.09 - 진행 중 / 개인 개발 / Full-Stack Web  
Role: 기획, UI 설계, API 개발, 인증/권한 구현, 배포 담당  
Scope: 개인 개발 / 기획, UI, 백엔드 API, 인증·권한, 배포 담당  
Stack: React, Spring Boot, JPA, JWT, Refresh Token Rotation, AWS, AI Coaching

운동 기록, 커뮤니티, AI 코칭을 하나의 사용자 흐름으로 통합한 피트니스 커뮤니티 서비스입니다.

- Problem: 운동 기록, 커뮤니티, AI 코칭이 분리되면 사용자가 루틴을 지속하기 어렵고 인증/배포 조건까지 고려해야 했습니다.
- Action: React/Spring Boot 기반으로 화면과 API를 구성하고, Access/Refresh Token 분리와 Refresh Token Rotation을 적용했습니다.
- Result: AWS 배포 과정의 HTTPS, Mixed Content, CORS credentials 이슈를 해결해 운영 가능한 풀스택 서비스 형태로 완성했습니다.
- Evidence: GitHub에 Auth, AI, Analytics, Crew, Friend, Ranking, Review 등 도메인별 controller/entity 구조와 RefreshToken 엔티티가 공개되어 있습니다.

### Sign-Language

2026.05 업데이트 / 공개 GitHub repo / 수어 학습·표현 서비스  
Role: Expo/React Native 프론트, Spring Boot 백엔드, OAuth2/JWT/Firebase 기반 인증·학습 API 구성  
Scope: 팀 도전과제 시제품 / Expo 앱과 Spring Boot API 기반 학습·표현 흐름 구현  
Stack: TypeScript, Expo, React Native, Spring Boot, Spring Security, OAuth2, JWT, Firebase

수어 아바타 기반 퀴즈 학습과 텍스트 입력 기반 수어 표현을 결합한 접근성/교육 목적 서비스입니다.

- Problem: 수어를 처음 접하는 사용자는 동작과 의미를 반복적으로 연결해 학습할 도구가 부족하고, 입력한 표현을 즉시 수어로 확인하기 어렵습니다.
- Action: Expo/React Native 프론트와 Spring Boot 백엔드를 구성하고, Google OAuth2, JWT, Firebase, 퀴즈/번역 API 흐름을 설계했습니다.
- Result: 수어 읽기 학습, 정답 피드백, 텍스트 기반 수어 표현, 사용자 인증을 포함한 시제품 구조를 공개 repo로 관리했습니다.
- Evidence: README에 30개 이상 기본 수어 단어 학습 콘텐츠와 텍스트 기반 수어 표현 기능 목표가 정리되어 있고, backend/frontendcodes 구조가 공개되어 있습니다.

### 운영형 웹사이트 개선: aClub / 아주대학교 총학생회

2025.01 - 진행 중 / 운영형 홍보·정보 제공 웹  
Role: Frontend 개발, 정보 구조 설계, GA4/GSC 기반 개선  
Scope: Frontend 개발 / 정보 구조 설계 / GA4·GSC 기반 운영 개선  
Stack: React, Vite, Axios, GA4, GSC, UX, Operations

동아리와 총학생회 정보를 공지, 모집, 행사, 자료, 신청 흐름으로 정리하고 운영 피드백과 분석 지표로 개선한 웹사이트입니다.

- Problem: 학생 사용자가 필요한 정보를 찾고 신청/문의까지 이동하는 과정에서 메뉴, 공지, 링크 구조가 명확해야 했습니다.
- Action: 페이지 단위 정보 구조와 상세 CTA를 재배치하고, GA4/GSC와 운영 문의를 기준으로 문구·배치·링크 흐름을 반복 수정했습니다.
- Result: 실사용 운영에서 반복 문의가 생기는 지점을 개선하고, 공지 확인부터 신청/문의까지의 행동 동선을 짧게 만들었습니다.
- Evidence: aClub과 아주대학교 총학생회 서비스 URL이 공개되어 있으며, 포트폴리오에 GA4/GSC와 운영 피드백 기반 개선 기록을 정리했습니다.

## Additional Technical Projects

### Ajou Campus Foodmap

2024.10 - 2024.12 / React, Express, MongoDB  
Passport Local과 Google/Naver OAuth를 통합하고 MongoStore, withCredentials, CORS allowlist로 SPA/API 분리 환경의 세션 유지 문제를 해결했습니다.

### Algorithm

2026.03 업데이트 / C++  
BaekjoonHub 기반 알고리즘 풀이 repo를 별도로 관리하며 C++ 문제 풀이 기록을 지속적으로 축적했습니다.

### TSEROF · INTO MONSTER POINT · 아주대탐험

2023.11 - 2025.05 / Unity, C#, AR  
출시/배포 게임, AR Plane 기반 전투 공간 생성, NavMesh AI, 스킬 선택, Object Pooling, Raycast 최적화 등 인터랙션과 게임 시스템 구현 경험을 쌓았습니다.

## Education

아주대학교, 디지털미디어학과 전공  
2021.03 - 2026.02

아주대학교, 인공지능융합학과 복수전공, 메타버스기획마이크로전공  
2021.03 - 2026.02

스파르타 내일배움캠프, Unity 게임개발자 양성과정  
2023.09 - 2024.02

코드잇 · 구름, 웹 개발 및 AI/SW 역량 강화 과정  
2021 - 2023

## Collaboration

헬스 동아리 회장, 정보통신대학교 학생회 대외협력국, 총학생회 생활복지국·소통발전국 활동을 통해 일정, 역할, 문의, 피드백을 정리해 실행으로 연결한 경험이 있습니다.

## Positioning

신입이지만 단순 기능 구현보다 운영 가능한 서비스 완성을 기준으로 사고하는 개발자입니다. 웹 직무에서는 React/Spring Boot 기반 구현력과 인증/배포 이슈 해결 경험을, 협업에서는 실제 운영 피드백을 제품 개선으로 연결한 경험을 강점으로 제공합니다.
