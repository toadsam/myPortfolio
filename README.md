# AI Portfolio Village

회사 제출용 인터랙티브 웹 포트폴리오입니다. 일반적인 스크롤형 포트폴리오가 아니라, 프로젝트, 기술 스택, GitHub 기록, 경험, 연락처를 하나의 작은 3D 마을로 표현합니다.

사용자는 마을에 입장한 뒤 건물과 NPC를 클릭하며 포트폴리오 정보를 탐색합니다. 현재 3D 에셋은 primitive geometry로 구성되어 있으며, 이후 GLB/glTF 모델로 교체하기 쉽도록 건물, NPC, 나무 컴포넌트를 분리했습니다.

## Tech Stack

- Next.js
- TypeScript
- React
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Tailwind CSS

## Concept

마을의 각 공간은 포트폴리오의 한 섹션을 의미합니다.

- 중앙 광장: Intro / 자기소개
- 프로젝트 연구소: Projects
- GitHub 작업실: GitHub / 기술 스택 / 코드 기록
- 기록관: Experience / 성장 과정
- 우체국: Contact / 이메일 / GitHub / 블로그

각 NPC는 해당 공간의 안내자 역할을 하며, 현재는 데이터 기반 고정 대사를 표시합니다.

## Getting Started

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. 포트가 사용 중이면 Next.js가 다른 포트를 안내합니다.

## Scripts

```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run start      # 빌드 결과 실행
npm run typecheck  # TypeScript 검사
```

## Project Structure

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ AIPortfolioVillage.tsx
│  ├─ village/
│  │  ├─ VillageScene.tsx
│  │  ├─ Building.tsx
│  │  ├─ NPC.tsx
│  │  ├─ Tree.tsx
│  │  └─ CameraController.tsx
│  └─ ui/
│     ├─ InfoPanel.tsx
│     ├─ DialogueBox.tsx
│     ├─ ProjectCard.tsx
│     ├─ SectionTabs.tsx
│     └─ Header.tsx
├─ data/
│  ├─ projects.ts
│  ├─ npcs.ts
│  ├─ skills.ts
│  ├─ links.ts
│  └─ experience.ts
├─ types/
│  └─ portfolio.ts
└─ lib/
   └─ constants.ts
```

## Current Features

- React Three Fiber Canvas 기반 3D 마을 렌더링
- 바닥, 도로, 건물 5개, NPC 5명, 나무 배치
- 건물 클릭 시 섹션 정보 패널 열림
- NPC 클릭 시 대화창 표시
- Framer Motion 기반 패널/대화창 애니메이션
- 프로젝트, NPC, 기술 스택, 링크, 경험 데이터 분리
- 데스크톱/모바일 반응형 레이아웃

## Data Editing

포트폴리오 내용은 아래 파일에서 수정합니다.

- 프로젝트: `src/data/projects.ts`
- NPC 대사: `src/data/npcs.ts`
- 기술 스택: `src/data/skills.ts`
- 연락처 링크: `src/data/links.ts`
- 경험 기록: `src/data/experience.ts`

## Future Extensions

- 실제 GLB/glTF 에셋 적용
- NPC별 자연어 대화 AI API 연결
- GitHub API 연동
- 프로젝트 검색 기능
- NPC끼리 자동 대화하는 시뮬레이션
- 시간대에 따른 마을 분위기 변경
- 클릭 기록 기반 추천 안내

## Credits

이 저장소는 기존 포트폴리오 프로젝트에서 출발했으며, 현재 구현은 AI Portfolio Village 컨셉에 맞춰 Next.js 기반으로 새롭게 구성했습니다. 기존 `LICENSE` 파일은 유지합니다.
