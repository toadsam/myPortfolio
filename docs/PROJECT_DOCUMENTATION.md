# AI Portfolio Village 전체 구현 설명서

이 문서는 `AI Portfolio Village` 프로젝트를 처음 보는 사람도 이해할 수 있도록 만든 상세 설명서입니다.

목표는 단순히 "무슨 파일이 있다"를 적는 것이 아니라, 이 프로젝트가 어떻게 실행되고, 프론트엔드와 백엔드가 어떻게 연결되고, 3D 마을과 AI NPC가 어떤 코드 흐름으로 움직이는지 기초부터 설명하는 것입니다.

현재 프로젝트는 크게 두 부분으로 나뉩니다.

- 프론트엔드: Next.js, React, TypeScript, React Three Fiber, Three.js, Framer Motion
- 백엔드: FastAPI, SQLAlchemy, SQLite 또는 PostgreSQL, OpenAI API 선택 연동, GitHub API 선택 연동

이 문서는 초보자 기준으로 작성되어 있습니다. 그래서 먼저 웹 개발의 기본 개념을 설명하고, 그 다음 실제 프로젝트 코드로 넘어갑니다.

---

## 1. 프로젝트 한 줄 요약

이 프로젝트는 정재훈의 포트폴리오를 일반적인 목록 페이지가 아니라, 3D 마을처럼 탐험할 수 있게 만든 웹 애플리케이션입니다.

방문자는 다음과 같은 행동을 할 수 있습니다.

- 3D 마을을 둘러본다.
- 건물을 클릭해서 프로젝트, 기술 스택, 경험, 연락처 공간으로 이동한다.
- NPC를 클릭해서 포트폴리오에 대해 질문한다.
- 프로젝트 건물 안에 들어가 몰입형 전시 화면을 본다.
- 이력서 모드에서 빠르게 전체 내용을 훑는다.
- 관리자 페이지에서 오늘의 활동을 기록하고, 그 기록이 마을 조명과 NPC 상태에 반영된다.

즉, 단순한 정적 포트폴리오가 아니라 다음 요소들이 합쳐진 프로젝트입니다.

```text
포트폴리오 데이터
  + 3D 마을 UI
  + 프로젝트 전시 화면
  + NPC 대화
  + 오늘 활동 기록
  + 관리자 페이지
  + FastAPI 백엔드
  + DB 저장
```

---

## 2. 초보자를 위한 기본 개념

### 2.1 프론트엔드란?

프론트엔드는 사용자가 브라우저에서 직접 보는 화면입니다.

이 프로젝트에서 프론트엔드는 다음을 담당합니다.

- 3D 마을을 화면에 그림
- 버튼, 패널, 모달, 대화창을 보여줌
- 사용자가 건물이나 NPC를 클릭했을 때 반응함
- 백엔드 API로 데이터를 요청함
- 받은 데이터를 이용해 건물 조명, NPC 상태, 활동 요약을 갱신함

대표 파일은 다음입니다.

```text
src/app/page.tsx
src/components/AIPortfolioVillage.tsx
src/components/village/VillageScene.tsx
src/components/ui/DialogueBox.tsx
src/lib/liveApi.ts
```

### 2.2 백엔드란?

백엔드는 브라우저 뒤에서 실행되는 서버입니다.

이 프로젝트에서 백엔드는 다음을 담당합니다.

- 오늘의 활동 기록 저장
- 마을 상태 계산
- NPC 대화 답변 생성
- NPC 자동 행동 생성
- 관리자용 데이터 제공
- GitHub 커밋 수 동기화
- 방문자 행동 로그 저장

대표 파일은 다음입니다.

```text
backend/app/main.py
backend/app/models.py
backend/app/schemas.py
backend/app/services/activity_service.py
backend/app/services/village_service.py
backend/app/services/chat_service.py
backend/app/services/npc_brain_service.py
```

### 2.3 API란?

API는 프론트엔드와 백엔드가 대화하는 약속입니다.

예를 들어 프론트엔드가 백엔드에게 이렇게 묻습니다.

```text
GET /village-state
```

그러면 백엔드는 이런 데이터를 돌려줍니다.

```json
{
  "summary": "오늘의 정재훈 마을은 안정적으로 움직이고 있습니다.",
  "buildings": [],
  "npcs": [],
  "unlocked_items": []
}
```

프론트엔드는 이 데이터를 받아서 화면을 바꿉니다.

### 2.4 데이터베이스란?

데이터베이스는 서버가 정보를 저장하는 공간입니다.

이 프로젝트에서는 기본적으로 SQLite를 사용합니다.

```env
DATABASE_URL=sqlite:///./portfolio_village.db
```

SQLite는 파일 하나로 동작하는 가벼운 DB입니다. 나중에 운영 환경에서는 PostgreSQL로 바꿀 수 있도록 설계되어 있습니다.

---

## 3. 전체 폴더 구조

중요한 폴더만 먼저 보면 다음과 같습니다.

```text
myPortfolio/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── env.example
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── admin/page.tsx
│   │   └── api/props/route.ts
│   ├── components/
│   │   ├── AIPortfolioVillage.tsx
│   │   ├── village/
│   │   ├── interior/
│   │   └── ui/
│   ├── data/
│   ├── lib/
│   └── types/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       └── services/
├── public/
│   └── models/
└── docs/
    └── PROJECT_DOCUMENTATION.md
```

각 폴더의 역할은 다음과 같습니다.

| 폴더 | 역할 |
|---|---|
| `src/app` | Next.js App Router 페이지, 레이아웃, API route |
| `src/components` | 화면을 구성하는 React 컴포넌트 |
| `src/components/village` | 3D 마을, 건물, NPC, 카메라, 캐릭터 이동 |
| `src/components/interior` | 건물 내부 전시실 화면 |
| `src/components/ui` | 패널, 대화창, 프로젝트 상세 뷰어, 이력서 모드 |
| `src/data` | 프로젝트, 스킬, NPC, 테마 같은 정적 데이터 |
| `src/lib` | API 호출 함수, 공통 상수, 상태 계산 보조 함수 |
| `src/types` | TypeScript 타입 정의 |
| `backend/app` | FastAPI 백엔드 코드 |
| `public/models` | GLB 3D 모델 파일 |

---

## 4. 실행 방법

### 4.1 프론트엔드만 실행

```bash
npm install
npm run dev
```

실행 후 브라우저에서 접속합니다.

```text
http://localhost:3000
```

관리자 페이지는 다음입니다.

```text
http://localhost:3000/admin
```

### 4.2 백엔드까지 실행

백엔드는 Python FastAPI 서버입니다.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
cd ..
npm run backend:dev
```

백엔드는 다음 주소에서 실행됩니다.

```text
http://localhost:8000
```

프론트엔드와 백엔드를 둘 다 실행하려면 터미널을 2개 열어도 됩니다.

터미널 1:

```bash
npm run backend:dev
```

터미널 2:

```bash
npm run dev
```

### 4.3 환경 변수

루트에는 `env.example`이 있습니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

이 값은 프론트엔드가 백엔드 API를 어디로 호출할지 알려줍니다.

프론트엔드에서 `NEXT_PUBLIC_`으로 시작하는 환경 변수는 브라우저 코드에서도 읽을 수 있습니다.

백엔드는 `backend/.env`를 사용합니다.

```env
DATABASE_URL=sqlite:///./portfolio_village.db
FRONTEND_ORIGIN=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_NPC_MODEL=gpt-5-nano
GITHUB_TOKEN=
GITHUB_USERNAME=toadsam
LOCAL_TIMEZONE=Asia/Seoul
```

`OPENAI_API_KEY`가 없으면 AI 호출 없이 규칙 기반 fallback 답변을 사용합니다.

`GITHUB_TOKEN`이 없으면 GitHub 커밋 동기화는 건너뜁니다.

---

## 5. package.json 설명

파일 위치:

```text
package.json
```

핵심 스니펫:

```json
{
  "scripts": {
    "dev": "next dev",
    "backend:dev": "node scripts/backend-dev.mjs",
    "optimize": "node scripts/optimize-glb.mjs",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@react-three/drei": "10.7.7",
    "@react-three/fiber": "9.6.1",
    "framer-motion": "12.42.0",
    "next": "16.2.9",
    "react": "19.2.7",
    "three": "0.183.0"
  }
}
```

각 스크립트의 의미는 다음과 같습니다.

| 명령어 | 의미 |
|---|---|
| `npm run dev` | Next.js 개발 서버 실행 |
| `npm run backend:dev` | FastAPI 백엔드 개발 서버 실행 |
| `npm run optimize` | GLB 모델 압축 스크립트 실행 |
| `npm run build` | 배포용 프론트엔드 빌드 |
| `npm run start` | 빌드된 Next.js 서버 실행 |
| `npm run typecheck` | TypeScript 타입 검사 |

중요한 라이브러리는 다음입니다.

| 라이브러리 | 역할 |
|---|---|
| `next` | React 기반 웹 프레임워크 |
| `react`, `react-dom` | UI 컴포넌트 작성 |
| `three` | WebGL 3D 그래픽 엔진 |
| `@react-three/fiber` | React 방식으로 Three.js 사용 |
| `@react-three/drei` | React Three Fiber 보조 컴포넌트 |
| `framer-motion` | UI 애니메이션 |

---

## 6. TypeScript 설정

파일 위치:

```text
tsconfig.json
```

핵심 스니펫:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

여기서 중요한 것은 `paths`입니다.

```ts
import {AIPortfolioVillage} from "@/components/AIPortfolioVillage";
```

위 코드는 사실 다음 경로를 짧게 쓴 것입니다.

```ts
import {AIPortfolioVillage} from "src/components/AIPortfolioVillage";
```

`@/`는 `src/`를 가리키는 별칭입니다.

---

## 7. Next.js 앱 진입점

### 7.1 첫 페이지

파일 위치:

```text
src/app/page.tsx
```

코드:

```tsx
import {AIPortfolioVillage} from "@/components/AIPortfolioVillage";

export default function Home() {
  return <AIPortfolioVillage />;
}
```

이 파일은 `/` 주소로 들어왔을 때 보여줄 페이지입니다.

이 프로젝트에서 메인 화면은 `AIPortfolioVillage` 컴포넌트 하나로 시작합니다.

즉, 브라우저에서 `http://localhost:3000`에 들어오면 흐름은 다음과 같습니다.

```text
브라우저 접속
  -> src/app/page.tsx 실행
  -> AIPortfolioVillage 렌더링
  -> 3D 마을, 인트로, 패널, NPC, 프로젝트 전시 기능 로드
```

### 7.2 전체 레이아웃

파일 위치:

```text
src/app/layout.tsx
```

핵심 스니펫:

```tsx
export const metadata: Metadata = {
  title,
  description,
  keywords: ["정재훈", "포트폴리오", "프론트엔드", "풀스택", "React", "Three.js", "3D"]
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`layout.tsx`는 모든 페이지를 감싸는 공통 틀입니다.

여기서 하는 일은 크게 두 가지입니다.

1. 검색엔진과 브라우저 탭에 보여줄 metadata 설정
2. 모든 페이지를 `Providers`로 감싸기

### 7.3 Providers

파일 위치:

```text
src/components/Providers.tsx
```

코드:

```tsx
"use client";

import {MotionConfig} from "framer-motion";
import {InteractionLayer} from "@/components/InteractionLayer";

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <InteractionLayer />
    </MotionConfig>
  );
}
```

`MotionConfig reducedMotion="user"`는 사용자의 OS 접근성 설정을 존중합니다.

예를 들어 사용자가 "동작 줄이기"를 켜두면 Framer Motion 애니메이션을 줄여줍니다.

`InteractionLayer`는 전역 클릭 효과 같은 인터랙션 레이어입니다.

---

## 8. "use client"의 의미

Next.js App Router에서는 컴포넌트가 기본적으로 서버 컴포넌트입니다.

하지만 다음 기능은 브라우저에서만 가능합니다.

- `useState`
- `useEffect`
- `window`
- `localStorage`
- 클릭 이벤트
- Three.js Canvas
- 오디오 재생

그래서 이런 기능을 쓰는 파일 맨 위에는 다음이 필요합니다.

```tsx
"use client";
```

예시:

```tsx
"use client";

import {useEffect, useRef, useState} from "react";

export function AIPortfolioVillage() {
  const [showIntro, setShowIntro] = useState(true);
}
```

이 뜻은 다음과 같습니다.

```text
이 컴포넌트는 서버에서만 계산하지 말고,
브라우저에서 실행되는 클라이언트 컴포넌트로 처리해라.
```

3D 마을, 대화창, 관리자 입력 폼은 모두 사용자 상호작용이 필요하므로 클라이언트 컴포넌트입니다.

---

## 9. 메인 프론트엔드 컴포넌트

파일 위치:

```text
src/components/AIPortfolioVillage.tsx
```

이 파일은 프로젝트 프론트엔드의 중심입니다.

이 컴포넌트가 하는 일은 다음과 같습니다.

- 현재 어떤 화면 모드인지 관리
- 인트로를 보여줄지 관리
- 선택된 구역과 프로젝트 관리
- NPC 선택 상태 관리
- 백엔드에서 마을 상태를 가져오기
- NPC 자동 행동 호출
- NPC끼리 만났을 때 대화 생성
- 건물 클릭 시 내부 화면으로 이동
- 사운드 상태 관리
- 이력서 모드 진입
- 화면 전환 오버레이 관리

### 9.1 동적 import

핵심 스니펫:

```tsx
const VillageScene = dynamic(
  () => import("@/components/village/VillageScene").then((m) => m.VillageScene),
  {
    loading: () => (
      <div className="relative grid h-[54vh] min-h-[420px] place-items-center overflow-hidden bg-[#050d1a] md:h-screen">
        ...
      </div>
    ),
    ssr: false
  }
);
```

`dynamic`은 특정 컴포넌트를 필요할 때 불러오는 기능입니다.

여기서 `ssr: false`가 중요합니다.

`VillageScene`은 Three.js Canvas를 사용합니다. Three.js는 브라우저의 WebGL 기능이 필요합니다. 서버에는 브라우저가 없기 때문에 서버에서 렌더링하면 문제가 생길 수 있습니다.

그래서 다음처럼 설정합니다.

```ts
ssr: false
```

뜻은 다음입니다.

```text
이 컴포넌트는 서버에서 미리 렌더링하지 말고,
브라우저에서만 렌더링해라.
```

### 9.2 상태 변수

핵심 스니펫:

```tsx
export function AIPortfolioVillage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>("click");
  const [soundOn, setSoundOn] = useState(true);
  const [viewMode, setViewMode] =
    useState<"village" | "interior" | "project-interior" | "resume">("village");
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [npcRuntimeStates, setNpcRuntimeStates] =
    useState<Record<string, NpcRuntimeState>>({});
}
```

초보자 관점에서 `useState`는 화면의 기억입니다.

예를 들어:

```tsx
const [showIntro, setShowIntro] = useState(true);
```

뜻은 다음입니다.

```text
showIntro라는 값을 기억한다.
처음 값은 true다.
setShowIntro(false)를 호출하면 showIntro가 false로 바뀌고 화면도 다시 그려진다.
```

주요 상태를 정리하면 다음과 같습니다.

| 상태 | 의미 |
|---|---|
| `activeSection` | 현재 선택된 구역 |
| `activeContentId` | 현재 선택된 상세 콘텐츠 ID |
| `selectedNpc` | 현재 대화 중인 NPC |
| `isPanelOpen` | 오른쪽 정보 패널 열림 여부 |
| `showIntro` | 첫 인트로 화면 표시 여부 |
| `explorationMode` | 클릭 탐색 모드 또는 WASD 직접 이동 모드 |
| `soundOn` | 사운드 켜짐 여부 |
| `viewMode` | 마을, 내부 공간, 프로젝트 전시실, 이력서 중 현재 화면 |
| `villageState` | 백엔드가 계산해준 오늘의 마을 상태 |
| `liveError` | 백엔드 연결 실패 메시지 |
| `npcRuntimeStates` | 브라우저에서 실시간으로 움직이는 NPC 상태 |

### 9.3 useRef

핵심 스니펫:

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const npcRuntimeStatesRef = useRef<Record<string, NpcRuntimeState>>({});
const npcPositionsRef = useRef<Record<string, Vector3Tuple>>({});
const npcMemoryRef = useRef<string[]>([]);
const npcTickBusyRef = useRef(false);
const encounterBusyRef = useRef(false);
```

`useRef`도 값을 기억합니다. 하지만 `useState`와 다르게 값이 바뀌어도 화면을 다시 그리지 않습니다.

그래서 다음처럼 자주 바뀌지만 화면 리렌더링이 필요 없는 값에 사용합니다.

- 타이머 ID
- NPC 현재 위치
- NPC 최근 기억
- API 호출 중인지 여부
- NPC 만남 cooldown

### 9.4 페이지 방문 로그

핵심 스니펫:

```tsx
useEffect(() => {
  trackVisitorEvent({event_type: "page_view", target_id: "home", label: "Portfolio Village"});
}, []);
```

`useEffect`는 컴포넌트가 화면에 나타난 뒤 실행됩니다.

뒤의 `[]`는 "처음 한 번만 실행"이라는 뜻입니다.

이 코드는 사용자가 페이지에 들어왔다는 이벤트를 백엔드로 보냅니다.

### 9.5 마을 상태 불러오기

핵심 스니펫:

```tsx
useEffect(() => {
  let ignore = false;

  async function loadVillageState() {
    try {
      const nextState = await fetchVillageState();
      if (!ignore) {
        setVillageState(nextState);
        setLiveError(null);
      }
    } catch {
      if (!ignore) {
        setLiveError("FastAPI 백엔드가 꺼져 있습니다");
      }
    }
  }

  loadVillageState();
  const intervalId = setInterval(loadVillageState, 60000);

  return () => {
    ignore = true;
    clearInterval(intervalId);
  };
}, []);
```

이 코드는 백엔드에서 현재 마을 상태를 가져옵니다.

흐름은 다음과 같습니다.

```text
화면 처음 로드
  -> fetchVillageState() 호출
  -> GET /village-state 요청
  -> 성공하면 villageState 저장
  -> 실패하면 liveError 저장
  -> 이후 60초마다 다시 호출
```

백엔드가 꺼져 있어도 화면 전체가 죽지 않습니다.

대신 다음 상태가 됩니다.

```text
liveError = "FastAPI 백엔드가 꺼져 있습니다"
```

이 값을 이용해 화면에 오프라인 안내를 보여줍니다.

### 9.6 NPC 자동 tick

핵심 스니펫:

```tsx
const tickInterval = setInterval(runTickBatch, 60000);
```

NPC tick은 NPC가 혼자 생각하거나 말풍선을 띄우는 기능입니다.

흐름은 다음과 같습니다.

```text
1분마다 일부 NPC 선택
  -> requestNpcTick() 호출
  -> POST /npc/tick
  -> 백엔드가 bubble_text, mood, energy, suggested_action 반환
  -> 프론트가 npcRuntimeStates 업데이트
  -> NPC 위에 말풍선 표시
```

중요한 점은 모든 NPC를 한 번에 호출하지 않는다는 것입니다.

코드에서는 한 번에 최대 2명만 처리합니다.

```tsx
const batch = Array.from({length: Math.min(2, autonomousNpcs.length)}, (_, index) => {
  const npc = autonomousNpcs[(npcTickCursorRef.current + index) % autonomousNpcs.length]!;
  return npc;
});
```

이렇게 하면 API 비용과 브라우저 부담을 줄일 수 있습니다.

### 9.7 NPC끼리 만났을 때 대화

핵심 스니펫:

```tsx
if (distance(npcAPosition, npcBPosition) > 1.45) continue;

const response = await requestNpcEncounter(
  {...},
  {...},
  npcMemoryRef.current.slice(-6)
);
```

프론트는 NPC 위치를 계속 알고 있습니다.

두 NPC가 가까워지면 백엔드에 "이 둘이 만났다"라고 요청합니다.

흐름:

```text
NPC 위치 확인
  -> 두 NPC 거리가 1.45 이하인지 검사
  -> requestNpcEncounter()
  -> POST /npc/encounter
  -> 백엔드가 4줄 대화 반환
  -> 프론트가 말풍선을 순서대로 띄움
  -> 엿듣기 패널에 대화 표시
```

### 9.8 건물 클릭 흐름

핵심 스니펫:

```tsx
function handleRequestEnter(buildingId: string) {
  const building = villageBuildings.find((b) => b.id === buildingId);
  if (!building) return;

  trackVisitorEvent({
    event_type: building.district === "projects" ? "project_open" : "building_enter",
    target_id: building.id,
    label: building.name,
    metadata: {district: building.district, contentId: building.contentId ?? ""}
  });

  if (building.district === "projects" && contentId) {
    setShowTransitionOverlay(true);
    timerRef.current = setTimeout(() => {
      setInteriorProjectId(contentId);
      setViewMode("project-interior");
      setShowTransitionOverlay(false);
    }, FADE_DURATION);
    return;
  }
}
```

건물을 클릭하면 다음 일이 벌어집니다.

```text
건물 클릭
  -> buildingId로 건물 데이터 찾기
  -> 방문자 이벤트 로그 전송
  -> 프로젝트 건물이면 project-interior 모드로 전환
  -> 기술/경험/연락 건물이면 해당 패널 또는 내부 공간 열기
```

`viewMode`는 현재 화면 종류를 결정합니다.

```tsx
const [viewMode, setViewMode] =
  useState<"village" | "interior" | "project-interior" | "resume">("village");
```

화면 렌더링 부분은 다음처럼 조건부로 나뉩니다.

```tsx
{viewMode === "village" ? <VillageScene ... /> : null}

{viewMode === "interior" && interiorSectionId ? (
  <InteriorScene sectionId={interiorSectionId} onBack={handleExitInterior} />
) : null}

{viewMode === "project-interior" && interiorProjectId ? (
  <ProjectInterior projectId={interiorProjectId} onBack={handleExitInterior} />
) : null}

{viewMode === "resume" ? (
  <ResumeMode onEnterVillage={enterVillageFromResume} />
) : null}
```

---

## 10. 프론트엔드 데이터 구조

### 10.1 포트폴리오 타입

파일 위치:

```text
src/types/portfolio.ts
```

핵심 스니펫:

```ts
export type SectionId = "intro" | "projects" | "github" | "experience" | "contact";
export type ExplorationMode = "click" | "walk";
export type District = "plaza" | "projects" | "skills" | "experience" | "contact" | "life";

export type Vector3Tuple = [number, number, number];

export interface BuildingData {
  id: string;
  sectionId: SectionId;
  district: District;
  contentId?: string;
  kind: BuildingKind;
  name: string;
  label: string;
  description: string;
  position: Vector3Tuple;
  size: Vector3Tuple;
  color: string;
  roofColor: string;
  accentColor: string;
  glbPath?: string;
  techStack?: string[];
}
```

이 타입은 건물 하나가 어떤 정보를 가져야 하는지 정의합니다.

예를 들어 건물은 다음 정보를 가집니다.

- ID
- 어느 구역인지
- 위치
- 크기
- 색상
- 클릭했을 때 연결되는 콘텐츠 ID
- GLB 모델 경로
- 기술 스택

`Vector3Tuple`은 3D 좌표입니다.

```ts
export type Vector3Tuple = [number, number, number];
```

Three.js에서 위치는 보통 다음처럼 표현합니다.

```text
[x, y, z]
```

- x: 좌우
- y: 위아래
- z: 앞뒤

### 10.2 건물 데이터

파일 위치:

```text
src/lib/constants.ts
```

핵심 스니펫:

```ts
const projectBuildings: BuildingData[] = [
  {
    id: "project-mywave",
    sectionId: "projects",
    district: "projects",
    contentId: "mywave",
    kind: "office-rounded",
    name: "MyWave",
    label: "Fintech",
    description: "개인 자산 흐름을 시각화하는 금융 관리 대시보드",
    position: [-7, 0, -4],
    size: [2.0, 1.9, 2.0],
    color: "#0d2a1a",
    roofColor: "#1a4a2a",
    accentColor: "#00ff88",
    techStack: ["React", "TypeScript", "Chart UI"]
  }
];
```

이 데이터는 3D 마을의 건물을 만드는 원본입니다.

건물 하나를 추가하려면 보통 여기에 데이터를 추가합니다.

중요한 필드:

| 필드 | 의미 |
|---|---|
| `id` | 건물 고유 ID |
| `sectionId` | 연결되는 큰 구역 |
| `district` | 마을 내 구역 종류 |
| `contentId` | 프로젝트 상세 데이터와 연결되는 ID |
| `kind` | 건물 모양 |
| `position` | 3D 위치 |
| `size` | 3D 크기 |
| `accentColor` | 강조 색상 |

### 10.3 좌표 확대

핵심 스니펫:

```ts
export const SPREAD = 1.45;

export function spread(p: number[]): Vector3Tuple {
  return [
    Math.round((p[0] ?? 0) * SPREAD * 100) / 100,
    p[1] ?? 0,
    Math.round((p[2] ?? 0) * SPREAD * 100) / 100
  ];
}

export const villageBuildings: BuildingData[] = [
  plazaBuilding,
  ...projectBuildings,
  ...skillBuildings,
  ...experienceBuildings,
  ...lifeBuildings,
  contactBuilding
].map((b) => ({...b, position: spread(b.position)}));
```

건물 원본 좌표에 `SPREAD`를 곱해서 전체 마을 간격을 넓힙니다.

즉, 원본 데이터는 관리하기 쉽게 작은 좌표로 쓰고, 실제 렌더링할 때만 넓게 퍼뜨립니다.

### 10.4 프로젝트 데이터

파일 위치:

```text
src/data/projects.ts
```

핵심 스니펫:

```ts
export const projects: ProjectData[] = [
  {
    id: "mywave",
    title: "MyWave",
    description: "개인 자산 흐름을 한눈에 이해하도록 돕는 금융 관리 대시보드입니다.",
    role: "서비스 기획, UI 구조 설계, 프론트엔드 컴포넌트 설계",
    tech: ["React", "TypeScript", "Chart UI", "Tailwind CSS"],
    features: ["자산 흐름 시각화", "목표 관리", "개인 대시보드", "차트 기반 요약"],
    learning: "복잡한 금융 정보를 사용자의 다음 행동으로 이어지게 만드는 정보 설계의 중요성을 배웠습니다.",
    problem: "...",
    approach: ["...", "..."],
    contribution: ["...", "..."],
    result: "...",
    nextStep: "...",
    links: [{label: "GitHub", href: "https://github.com/toadsam"}]
  }
];
```

이 데이터는 프로젝트 상세 화면에서 사용됩니다.

건물 데이터와 프로젝트 데이터는 `contentId`와 `id`로 연결됩니다.

```text
건물 contentId: "mywave"
프로젝트 id: "mywave"
```

### 10.5 스킬 데이터

파일 위치:

```text
src/data/skills.ts
```

핵심 스니펫:

```ts
export const skills: SkillData[] = [
  {
    name: "Next.js",
    group: "Frontend",
    description: "App Router 기반 페이지 구조와 배포 가능한 포트폴리오 UI를 설계합니다."
  },
  {
    name: "FastAPI",
    group: "Backend",
    description: "라이브 마을 상태, NPC 대화, GitHub 동기화 API를 제공합니다."
  }
];
```

스킬 데이터는 기술 스택 패널과 이력서 모드에서 사용됩니다.

### 10.6 NPC 데이터

파일 위치:

```text
src/data/npcRoster.ts
```

핵심 스니펫:

```ts
const coreNpcs: NPCData[] = [
  {
    id: "guide-npc",
    sectionId: "intro",
    type: "guide",
    name: "루미",
    location: "중앙 광장",
    role: "마을 총괄 안내원",
    dialogue: "안녕하세요. 저는 이 포트폴리오 마을의 안내원 루미예요.",
    position: [0, 0, 1.6],
    color: "#7ecf68",
    accessoryColor: "#f5d26b",
    agent: {
      personality: "밝고 침착한 길잡이.",
      specialty: "첫 방문 안내, 전체 포트폴리오 흐름",
      currentGoal: "방문자가 30초 안에 첫 클릭을 고르고 헤매지 않게 만들기",
      presetQuestions: ["처음이면 어디부터 보면 돼?", "대표 프로젝트만 빠르게 골라줘"]
    }
  }
];
```

NPC는 단순 캐릭터가 아니라 다음 데이터를 가집니다.

- 이름
- 역할
- 위치
- 기본 대사
- 성격
- 전문 분야
- 추천 질문

또한 건물마다 자동 안내 NPC도 만들어집니다.

```ts
export const autonomousNpcs: NPCData[] = [
  ...coreNpcs,
  ...villageBuildings
    .filter((building) => building.id !== "central-plaza")
    .map((building, index) => {
      return {
        id: `npc-${building.id}`,
        sectionId: building.sectionId,
        type,
        name: `${building.name} 안내원`,
        location: building.name,
        role: `${building.name} 공간 안내`,
        position,
        color: color.body,
        accessoryColor: color.accessory,
        agent: sectionToAgent(building.sectionId, building.name, type)
      };
    })
];
```

즉, 프로젝트 건물을 하나 추가하면 그 건물의 안내 NPC도 자동으로 생기는 구조입니다.

---

## 11. 백엔드와 연결하는 프론트 API 함수

파일 위치:

```text
src/lib/liveApi.ts
```

이 파일은 프론트엔드에서 백엔드 API를 호출하는 함수들을 모아둔 곳입니다.

### 11.1 API 기본 주소

핵심 스니펫:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
```

환경 변수가 있으면 그 값을 사용하고, 없으면 기본적으로 `http://localhost:8000`을 사용합니다.

### 11.2 공통 요청 함수

핵심 스니펫:

```ts
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = (await response.json()) as {detail?: unknown};
      detail = typeof body.detail === "string" ? body.detail : undefined;
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}
```

이 함수는 백엔드 요청을 보낼 때 반복되는 코드를 줄입니다.

하는 일:

1. `API_BASE_URL + path`로 요청을 보낸다.
2. JSON 요청 헤더를 붙인다.
3. 응답이 실패면 `ApiError`를 던진다.
4. 성공이면 JSON을 반환한다.

`<T>`는 TypeScript 제네릭입니다.

예를 들어:

```ts
requestJson<VillageState>("/village-state")
```

뜻은 다음입니다.

```text
이 API 응답은 VillageState 모양일 것이다.
```

### 11.3 API 함수 목록

핵심 스니펫:

```ts
export function fetchVillageState(): Promise<VillageState> {
  return requestJson<VillageState>("/village-state", {cache: "no-store"});
}

export function saveActivity(payload: ActivityInput): Promise<DailyActivity> {
  return requestJson<DailyActivity>("/activity", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function sendNpcMessage(
  npcId: string,
  message: string,
  recentMessages: string[] = []
): Promise<NpcChatResponse> {
  return requestJson<NpcChatResponse>("/npc/chat", {
    method: "POST",
    body: JSON.stringify({npc_id: npcId, message, recent_messages: recentMessages.slice(-8)})
  });
}
```

프론트에서 직접 `fetch`를 여기저기 쓰지 않고, `liveApi.ts`에 모아두었습니다.

장점:

- API 주소가 한 곳에 모임
- 타입을 붙일 수 있음
- 에러 처리가 통일됨
- 컴포넌트 코드는 더 읽기 쉬워짐

---

## 12. 3D 마을 렌더링

### 12.1 VillageScene

파일 위치:

```text
src/components/village/VillageScene.tsx
```

이 파일은 실제 3D 마을을 그리는 중심입니다.

핵심 스니펫:

```tsx
export function VillageScene({
  activeSection,
  activeNpcId,
  explorationMode,
  isIntro = false,
  onSelectNpc,
  onRequestEnter,
  npcRuntimeStates,
  onNpcPositionChange,
  villageState,
  guideScriptedTarget,
  onGuideArrive,
  guideForceHold,
  cinematic
}: VillageSceneProps) {
  const isWalkMode = explorationMode === "walk";
  const propsApi = usePropsEditor();
  const editing = propsApi.enabled && propsApi.editMode;
  const sky = useMemo(() => timePalette(new Date().getHours()), []);

  return (
    <div className="relative h-[48vh] min-h-[390px] overflow-hidden ...">
      <Canvas camera={{fov: 40, position: [4, 14, 16]}}>
        ...
      </Canvas>
      <PropsEditorTray api={propsApi} />
    </div>
  );
}
```

`Canvas`는 React Three Fiber에서 3D 세상을 그리는 영역입니다.

HTML에서 `<div>`가 2D 화면의 박스라면, React Three Fiber에서 `<Canvas>`는 3D 장면을 담는 박스입니다.

### 12.2 시간대별 하늘색

핵심 스니펫:

```tsx
function timePalette(hour: number) {
  if (hour >= 20 || hour < 5) {
    return {sky: "#0b1430", fog: "#0a1830", label: "밤"};
  }
  if (hour < 8) {
    return {sky: "#e6b896", fog: "#e8c6a4", label: "새벽"};
  }
  if (hour < 17) {
    return {sky: "#a8c8e8", fog: "#b8d4ee", label: "낮"};
  }
  return {sky: "#e09a64", fog: "#e6ad7e", label: "노을"};
}
```

현재 시간에 따라 마을 분위기가 바뀝니다.

```text
밤: 어두운 파란 하늘
새벽: 따뜻한 주황빛
낮: 밝은 하늘색
노을: 주황빛
```

### 12.3 Canvas 내부 구성

핵심 스니펫:

```tsx
<Canvas camera={{fov: 40, position: [4, 14, 16]}}>
  <AdaptiveDpr pixelated={false} />
  <AdaptiveEvents />
  <color args={[sky.sky]} attach="background" />
  <fog args={[sky.fog, sky.near, sky.far]} attach="fog" />
  <ambientLight color="#ffffff" intensity={sky.amb} />
  <directionalLight color={sky.sun} intensity={sky.sunI} position={[8, 20, 8]} />

  <Suspense fallback={null}>
    <Selection>
      <Ground />
      <Statue />
      <DistrictSign label="Project District" ... />
      <BuildingNetwork buildings={projectNetworkBuildings} />
      <LiveDecorations villageState={villageState} />
      <PropsLayer api={propsApi} />

      {villageBuildings.map((building) => (
        <Building key={building.id} building={building} ... />
      ))}

      {autonomousNpcs.map((npc) => (
        <NPC key={npc.id} npc={npc} ... />
      ))}

      {isWalkMode
        ? <CharacterController />
        : <CameraController activeSection={activeSection} ... />}
    </Selection>
  </Suspense>
</Canvas>
```

이 구조를 쉽게 말하면 다음과 같습니다.

```text
Canvas
  -> 배경색, 안개, 조명
  -> 바닥 모델
  -> 석상 모델
  -> 구역 표지판
  -> 라이브 장식
  -> 건물 목록
  -> NPC 목록
  -> 나무, 바위
  -> 카메라 컨트롤 또는 캐릭터 컨트롤
```

---

## 13. 건물 컴포넌트

파일 위치:

```text
src/components/village/Building.tsx
```

건물 하나를 그리는 컴포넌트입니다.

### 13.1 건물 클릭

핵심 스니펫:

```tsx
export function Building({building, buildingState, isActive, onRequestEnter, edit}: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const liveGlow = lightIntensity(buildingState?.light_level);
  const isHighlighted = !editing && (hovered || isActive || liveGlow >= 0.65);

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onRequestEnter(building.id);
  }

  return (
    <group position={building.position}>
      <group
        onClick={editing ? undefined : handleClick}
        onPointerEnter={...}
        onPointerLeave={...}
      >
        <BuildingGeometry b={building} hl={isHighlighted} />
        <GroundRing color={building.accentColor} highlighted={isHighlighted} ... />
        <HighlightFX active={isHighlighted} ... />
      </group>

      <BuildingLabel
        building={building}
        buildingState={buildingState}
        onEnter={() => onRequestEnter(building.id)}
      />
    </group>
  );
}
```

건물을 클릭하면 `onRequestEnter(building.id)`가 실행됩니다.

이 함수는 부모인 `AIPortfolioVillage`에서 전달됩니다.

흐름:

```text
Building 클릭
  -> onRequestEnter(building.id)
  -> AIPortfolioVillage.handleRequestEnter()
  -> viewMode 변경
  -> 내부 전시실 또는 정보 패널 열림
```

### 13.2 건물 모양 선택

핵심 스니펫:

```tsx
function BuildingGeometry({b, hl}: {b: BuildingData; hl: boolean}) {
  if (b.glbPath) return <GlbModel glbPath={b.glbPath} size={b.size} />;

  switch (b.kind) {
    case "tower":          return <TowerBuilding b={b} hl={hl} />;
    case "office-rounded": return <OfficeRoundedBuilding b={b} hl={hl} />;
    case "flat-hub":       return <FlatHubBuilding b={b} hl={hl} />;
    case "dome":           return <DomeBuilding b={b} hl={hl} />;
    case "server-tower":   return <ServerTowerBuilding b={b} hl={hl} />;
    case "arcade":         return <ArcadeBuilding b={b} hl={hl} />;
    case "post":           return <PostBuilding b={b} hl={hl} />;
    case "plaza":          return <PlazaBuilding b={b} hl={hl} />;
    default:               return <TownhouseBuilding b={b} hl={hl} />;
  }
}
```

건물 데이터의 `kind` 값에 따라 다른 3D 모양을 그립니다.

예를 들어:

```ts
kind: "server-tower"
```

이면 `ServerTowerBuilding`을 사용합니다.

만약 `glbPath`가 있으면 직접 만든 GLB 모델을 불러옵니다.

```tsx
if (b.glbPath) return <GlbModel glbPath={b.glbPath} size={b.size} />;
```

### 13.3 라이브 조명

핵심 스니펫:

```tsx
const liveGlow = lightIntensity(buildingState?.light_level);

{liveGlow > 0 ? (
  <pointLight
    color={building.accentColor}
    decay={2}
    distance={4 + liveGlow * 4}
    intensity={liveGlow * 1.8}
    position={[0, h + 0.6, 0]}
  />
) : null}
```

백엔드가 건물마다 `light_level`을 줍니다.

프론트는 그 값을 `lightIntensity`로 숫자로 바꿉니다.

파일 위치:

```text
src/lib/liveState.ts
```

코드:

```ts
export function lightIntensity(lightLevel: BuildingState["light_level"] | undefined): number {
  if (lightLevel === "bright") return 1;
  if (lightLevel === "normal") return 0.65;
  if (lightLevel === "dim") return 0.35;
  return 0;
}
```

결과:

| 백엔드 값 | 프론트 조명 세기 |
|---|---|
| `bright` | 1 |
| `normal` | 0.65 |
| `dim` | 0.35 |
| `dark` | 0 |

---

## 14. NPC 컴포넌트

파일 위치:

```text
src/components/village/NPC.tsx
```

NPC 하나를 그리는 컴포넌트입니다.

### 14.1 NPC 이동

핵심 스니펫:

```tsx
useFrame(({clock}, delta) => {
  elapsedRef.current += delta;

  if (!groupRef.current) {
    return;
  }

  const speed = rawMood === "busy" ? 4.2 : rawMood === "sleepy" ? 1.2 : 2.4;
  const moveSpeed = rawMood === "busy" || rawMood === "excited"
    ? 0.95
    : rawMood === "sleepy"
      ? 0.22
      : 0.48;

  if (!isActing && (now > retargetAtRef.current || distanceToTarget(...) < 0.25)) {
    targetRef.current = pickTarget(home, roamRadius, buildings);
    retargetAtRef.current = now + 4 + Math.random() * 7;
  }

  ...
});
```

`useFrame`은 3D 애니메이션에서 매 프레임 실행되는 함수입니다.

보통 게임의 Update 함수와 비슷합니다.

NPC는 자신의 감정 상태에 따라 속도가 달라집니다.

| mood | 움직임 |
|---|---|
| `busy` | 빠르게 움직임 |
| `excited` | 빠르게 움직임 |
| `sleepy` | 느리게 움직임 |
| 그 외 | 보통 속도 |

### 14.2 NPC 클릭

핵심 스니펫:

```tsx
function handleClick(event: ThreeEvent<MouseEvent>) {
  event.stopPropagation();
  onSelect(npc);
}
```

NPC를 클릭하면 부모에게 `onSelect(npc)`를 호출합니다.

부모인 `AIPortfolioVillage`는 선택된 NPC를 `selectedNpc`에 저장하고, `DialogueBox`를 엽니다.

### 14.3 NPC 말풍선

핵심 스니펫:

```tsx
{bubbleText ? (
  <Billboard position={[0, 2.28, 0]}>
    <Html center distanceFactor={7.4}>
      <div className="rounded-xl border border-[#00d4ff]/35 bg-[#050d1a]/92 ...">
        {bubbleText}
      </div>
    </Html>
  </Billboard>
) : null}
```

`Billboard`는 카메라를 향해 항상 보이도록 만드는 Drei 컴포넌트입니다.

`Html`은 3D 공간 안에 HTML 요소를 붙일 수 있게 해줍니다.

즉, NPC 위에 말풍선 HTML을 3D 좌표로 띄우는 구조입니다.

### 14.4 NPC 행동 이펙트

핵심 스니펫:

```tsx
{currentAction ? (
  <NpcActionEffect
    action={currentAction}
    color={actionTarget?.accentColor ?? actionColor(currentAction.animationKey)}
    targetName={actionTarget?.name}
  />
) : null}
```

백엔드가 `suggested_action`을 반환하면 프론트는 이것을 `currentAction`으로 저장합니다.

그러면 NPC 주변에 다음 같은 이펙트가 표시됩니다.

- 생각하기
- 가리키기
- 타이핑
- 전송
- 홀로그램 열기

---

## 15. 카메라와 이동

### 15.1 클릭 탐색 모드 카메라

파일 위치:

```text
src/components/village/CameraController.tsx
```

핵심 스니펫:

```tsx
export function CameraController({activeSection, isIntro = false, lockRotate = false, cinematic = null}: CameraControllerProps) {
  const {camera, gl} = useThree();
  const sectionTarget = cameraTargets[activeSection] || cameraTargets.intro;
  const target = cinematic ?? sectionTarget;

  const desiredCamera = useMemo(() => new Vector3(...target.position), [target.position]);
  const desiredLookAt = useMemo(() => new Vector3(...target.lookAt), [target.lookAt]);

  useFrame((_, delta) => {
    camera.position.lerp(desiredCamera, lerpSpeed);
    controlsRef.current.target.lerp(desiredLookAt, targetSpeed);
    controlsRef.current.update();
  });
}
```

카메라는 현재 선택된 구역에 따라 부드럽게 이동합니다.

카메라 목표 위치는 `src/lib/constants.ts`에 있습니다.

```ts
const rawCameraTargets: Record<string, {position: Vector3Tuple; lookAt: Vector3Tuple}> = {
  intro: {position: [2, 16, 15], lookAt: [0, 0, 2]},
  projects: {position: [-10, 7, 3], lookAt: [-6.5, 1, 1]},
  github: {position: [3, 8, 0], lookAt: [2, 1, -4.5]},
  experience: {position: [10, 6, 6], lookAt: [7, 1, 5.5]},
  contact: {position: [2, 6, 13], lookAt: [0, 1, 8.5]}
};
```

`position`은 카메라 위치이고, `lookAt`은 카메라가 바라볼 지점입니다.

### 15.2 직접 이동 모드

파일 위치:

```text
src/components/village/CharacterController.tsx
```

핵심 스니펫:

```tsx
useFrame((_, delta) => {
  const keys = keysRef.current;
  const speed = SPEED * delta;

  if (keys.has("KeyA") || keys.has("ArrowLeft")) rotRef.current += turn;
  if (keys.has("KeyD") || keys.has("ArrowRight")) rotRef.current -= turn;

  if (keys.has("KeyW") || keys.has("ArrowUp")) {
    nextX += dx * speed;
    nextZ += dz * speed;
  }

  if (isWalkablePosition({x: nextX, z: nextZ}, villageBuildings, {padding: 0.42})) {
    posRef.current.x = nextX;
    posRef.current.z = nextZ;
  }

  camera.position.lerp(camPosRef.current, 0.1);
  camera.lookAt(posRef.current.x, 0.8, posRef.current.z);
});
```

이 컴포넌트는 WASD 또는 방향키로 캐릭터를 직접 움직이는 모드입니다.

충돌 검사는 `isWalkablePosition`으로 합니다.

즉, 건물 안으로 캐릭터가 뚫고 들어가지 않게 검사합니다.

---

## 16. 정보 패널

파일 위치:

```text
src/components/ui/InfoPanel.tsx
```

정보 패널은 오른쪽에서 열리는 UI입니다.

현재 선택한 구역에 따라 다른 내용을 보여줍니다.

핵심 스니펫:

```tsx
export function InfoPanel({activeSection, activeContentId, isOpen, onClose}: InfoPanelProps) {
  const section = sectionMeta.find((item) => item.id === activeSection) ?? sectionMeta[0]!;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside ...>
          ...
          {activeSection === "intro" && <IntroPanel color={color} />}
          {activeSection === "projects" && <ProjectsPanel color={color} initialProjectId={activeContentId} />}
          {activeSection === "github" && <SkillsPanel color={color} initialGroup={activeContentId} />}
          {activeSection === "experience" && <ExperiencePanel color={color} highlightTitle={activeContentId} />}
          {activeSection === "contact" && <ContactPanel color={color} />}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
```

`AnimatePresence`와 `motion.aside`는 Framer Motion 애니메이션입니다.

패널이 열리고 닫힐 때 자연스럽게 움직입니다.

구역별 렌더링:

| activeSection | 보여주는 컴포넌트 |
|---|---|
| `intro` | `IntroPanel` |
| `projects` | `ProjectsPanel` |
| `github` | `SkillsPanel` |
| `experience` | `ExperiencePanel` |
| `contact` | `ContactPanel` |

---

## 17. NPC 대화창

파일 위치:

```text
src/components/ui/DialogueBox.tsx
```

NPC를 클릭하면 이 컴포넌트가 열립니다.

### 17.1 대화 기록 저장

핵심 스니펫:

```tsx
function storageKey(npcId: string) {
  return `portfolio-village-chat:${npcId}`;
}

useEffect(() => {
  if (!npc || lines.length === 0) return;
  window.localStorage.setItem(storageKey(npc.id), JSON.stringify(lines.slice(-30)));
}, [lines, npc]);
```

대화 기록은 브라우저의 `localStorage`에 저장됩니다.

서버 DB에는 NPC 대화 로그도 저장되지만, 사용자의 브라우저에서 대화창을 다시 열 때 최근 대화를 복원하기 위해 `localStorage`도 사용합니다.

### 17.2 메시지 보내기

핵심 스니펫:

```tsx
async function ask(text: string) {
  if (!npc || !text.trim() || isSending) return;

  const nextMessage = text.trim();
  trackVisitorEvent({
    event_type: "npc_message",
    target_id: npc.id,
    label: npc.name,
    metadata: {sectionId: npc.sectionId, length: nextMessage.length}
  });

  setLines((current) => current.concat({role: "visitor", text: nextMessage}));
  setMessage("");
  setIsSending(true);

  const context: string[] = [`[상태] 지금 기분: ${moodText}`];
  if (npcRuntimeState?.memory) context.push(`[최근 사건] ${npcRuntimeState.memory}`);
  context.push(...recentMessages);

  try {
    const response = await sendNpcMessage(npc.id, nextMessage, context);
    onSuggestedAction(response.suggested_action);
    setFallbackMode(!response.used_ai);
    setLines((current) => current.concat({role: "npc", text: response.reply}));
  } catch {
    setFallbackMode(true);
    setLines((current) =>
      current.concat({
        role: "npc",
        text: "지금은 잠깐 생각이 끊겼어요. 잠시 후 다시 물어봐 주세요."
      })
    );
  } finally {
    setIsSending(false);
  }
}
```

흐름:

```text
사용자가 메시지 입력
  -> visitor 말풍선 추가
  -> sendNpcMessage() 호출
  -> POST /npc/chat
  -> 백엔드 답변 수신
  -> npc 말풍선 추가
  -> suggested_action이 있으면 NPC 액션 실행
```

### 17.3 AI 오프라인 표시

핵심 스니펫:

```tsx
const offline = Boolean(aiOffline) || fallbackMode;

{offline ? (
  <span className="...">
    AI 오프라인
  </span>
) : null}
```

백엔드가 꺼져 있거나, OpenAI API를 사용하지 못해서 fallback 답변을 사용하면 `AI 오프라인` 표시가 뜹니다.

---

## 18. 프로젝트 내부 전시실

파일 위치:

```text
src/components/interior/ProjectInterior.tsx
```

프로젝트 건물을 클릭하면 이 화면으로 이동합니다.

### 18.1 프로젝트 찾기

핵심 스니펫:

```tsx
export function ProjectInterior({projectId, onBack}: ProjectInteriorProps) {
  const project = projects.find((item) => item.id === projectId);
  const theme = getProjectTheme(projectId);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!project) return null;
}
```

`projectId`로 `src/data/projects.ts`에서 프로젝트를 찾습니다.

그리고 `getProjectTheme(projectId)`로 테마도 가져옵니다.

### 18.2 3D 전시실 구성

핵심 스니펫:

```tsx
<Canvas camera={{fov: 50, position: [0, 3.5, 8]}}>
  <ProjectScene project={project} onOpenViewer={openViewer} />
</Canvas>

<ProjectViewer project={viewerOpen ? project : null} onClose={() => setViewerOpen(false)} />
```

전시실은 두 단계로 구성됩니다.

1. 3D 공간 안에서 프로젝트 제목, 기능, 오브를 보여줌
2. "프로젝트 상세 보기"를 누르면 `ProjectViewer` 모달을 띄움

### 18.3 프로젝트 상세 열기 로그

핵심 스니펫:

```tsx
function openViewer() {
  trackVisitorEvent({
    event_type: "project_view",
    target_id: `project-${activeProject.id}`,
    label: activeProject.title,
    metadata: {projectId: activeProject.id}
  });
  setViewerOpen(true);
}
```

프로젝트 상세를 열면 백엔드에 방문자 행동 로그를 남깁니다.

---

## 19. 프로젝트 상세 뷰어

파일 위치:

```text
src/components/ui/ProjectViewer.tsx
```

이 컴포넌트는 프로젝트 상세 모달입니다.

### 19.1 카테고리별 뷰어 라우팅

핵심 스니펫:

```tsx
export function ProjectViewer({project, onClose}: Props) {
  const projectTheme = project ? getProjectTheme(project.id) : null;
  if (project && projectTheme) {
    const shared = {project, theme: projectTheme, onClose};
    const cat = projectTheme.category;
    let viewer: ReactNode = null;

    if (cat === "game") viewer = <GameProjectViewer key={project.id} {...shared} />;
    else if (cat === "dashboard") viewer = <DashboardProjectViewer key={project.id} {...shared} />;
    else if (cat === "realtime") viewer = <RealtimeProjectViewer key={project.id} {...shared} />;
    else if (cat === "platform") viewer = <PlatformProjectViewer key={project.id} {...shared} />;

    if (viewer) {
      return (
        <AnimatePresence>
          {viewer}
          {cat !== "game" ? <ProjectIntro ... /> : null}
          <SoundToggle ... />
        </AnimatePresence>
      );
    }
  }

  return <DefaultProjectViewer project={project} onClose={onClose} />;
}
```

프로젝트 테마의 `category`에 따라 다른 상세 화면을 보여줍니다.

| category | 컴포넌트 |
|---|---|
| `game` | `GameProjectViewer` |
| `dashboard` | `DashboardProjectViewer` |
| `realtime` | `RealtimeProjectViewer` |
| `platform` | `PlatformProjectViewer` |

### 19.2 프로젝트 테마

파일 위치:

```text
src/data/projectThemes.ts
```

핵심 스니펫:

```ts
export type ProjectCategory = "dashboard" | "realtime" | "platform" | "game";

export const projectThemes: Record<string, ProjectTheme> = {
  mywave: {
    category: "dashboard",
    primary: "#34d399",
    secondary: "#10b981",
    bg: "#04110c",
    accent: "#6ee7b7"
  },
  festflow: {
    category: "realtime",
    primary: "#fbbf24",
    secondary: "#f59e0b",
    bg: "#140f04",
    accent: "#fcd34d"
  },
  darklab: {
    category: "game",
    mood: "horror",
    primary: "#ef4444",
    secondary: "#991b1b",
    bg: "#070405",
    accent: "#ff5a4d"
  }
};
```

새 프로젝트를 추가할 때 프로젝트 상세 화면의 분위기를 바꾸려면 이 파일에 테마를 추가합니다.

### 19.3 richContent

파일 위치:

```text
src/components/ui/project-viewers/richContent/index.tsx
```

핵심 스니펫:

```tsx
const SIGNATURE: Partial<Record<string, (theme: ProjectTheme) => ReactNode>> = {
  festflow: (theme) => <FestFlowLiveDemo theme={theme} />,
  mystock: (theme) => <MyStockDemo theme={theme} />,
  muscleup: (theme) => <MuscleUpDemo theme={theme} />,
  aclub: (theme) => <AClubDemo theme={theme} />,
  "sign-language": (theme) => <SignLanguageDemo theme={theme} />,
  ajouchong: (theme) => <AjouchongDemo theme={theme} />,
  darklab: (theme) => <DarkLabReveal theme={theme} />,
  "ajou-adventure": (theme) => <AjouAdventureDemo theme={theme} />,
  tserof: (theme) => <TserofDemo theme={theme} />
};
```

프로젝트별로 고유한 인터랙티브 데모를 연결하는 곳입니다.

예:

```text
festflow -> FestFlowLiveDemo
mystock -> MyStockDemo
darklab -> DarkLabReveal
```

---

## 20. 이력서 모드

파일 위치:

```text
src/components/ui/ResumeMode.tsx
```

이력서 모드는 3D 탐험이 부담스러운 방문자가 빠르게 내용을 훑을 수 있는 화면입니다.

핵심 스니펫:

```tsx
export function ResumeMode({onEnterVillage}: Props) {
  const [selected, setSelected] = useState<ProjectData | null>(null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040608] text-white">
      <header className="sticky top-0 z-20 ...">
        <button onClick={onEnterVillage}>
          3D 마을 탐험
        </button>
      </header>

      <main>
        <section>히어로</section>
        <section>기술 스택</section>
        <section>프로젝트</section>
        <section>경험</section>
      </main>

      <ProjectViewer project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
```

이 화면에서도 프로젝트를 클릭하면 같은 `ProjectViewer`를 사용합니다.

즉, 프로젝트 상세 뷰어는 3D 전시실과 이력서 모드에서 재사용됩니다.

---

## 21. 관리자 페이지

파일 위치:

```text
src/app/admin/page.tsx
```

관리자 페이지는 오늘의 활동을 입력하는 곳입니다.

입력 가능한 항목:

- 오늘 기분
- 집중도
- 오늘 한 줄 메모
- 운동 여부
- 운동 시간
- 공부 시간
- 공부한 주제
- 총 코딩 시간
- GitHub 커밋 수
- 오늘 건드린 repo
- 프로젝트별 작업 시간

### 21.1 초기 form

핵심 스니펫:

```tsx
const initialForm: ActivityInput = {
  github_commits: 0,
  github_repos: [],
  study_minutes: 0,
  study_topics: [],
  studied_tech: [],
  coding_minutes: 0,
  project_minutes: {},
  workout_done: false,
  workout_minutes: 0,
  workout_type: "",
  focus_score: 50,
  memo: "",
  mood: "steady"
};
```

이 값은 백엔드의 `ActivityInput` 타입과 맞춰져 있습니다.

### 21.2 오늘 기록 불러오기

핵심 스니펫:

```tsx
async function loadToday() {
  try {
    const [activity, state] = await Promise.all([fetchTodayActivity(), fetchVillageState()]);
    setForm({
      github_commits: activity.github_commits,
      github_repos: activity.github_repos ?? [],
      study_minutes: activity.study_minutes,
      ...
    });
    setVillageState(state);
    setStatus("오늘의 기록을 불러왔습니다.");
  } catch {
    setStatus("FastAPI 백엔드에 연결하지 못했습니다. 백엔드를 실행한 뒤 새로고침하세요.");
  }
}
```

관리자 페이지는 처음 열릴 때 백엔드에서 오늘 기록과 마을 상태를 함께 가져옵니다.

### 21.3 저장하기

핵심 스니펫:

```tsx
async function handleSave(event?: React.FormEvent) {
  event?.preventDefault();
  setIsSaving(true);
  setStatus("오늘의 기록을 저장하고 마을 상태를 다시 계산하는 중입니다.");

  try {
    await saveActivity(normalizeForm(form));
    const state = await fetchVillageState();
    setVillageState(state);
    setStatus("기록이 저장되었습니다. 3D 마을 조명, NPC 상태, 장식이 갱신됐습니다.");
  } catch {
    setStatus("기록 저장에 실패했습니다. 백엔드 상태를 확인하세요.");
  } finally {
    setIsSaving(false);
  }
}
```

저장 흐름:

```text
관리자 입력
  -> saveActivity()
  -> POST /activity
  -> DB 저장
  -> fetchVillageState()
  -> GET /village-state
  -> 갱신된 마을 상태 미리보기
```

### 21.4 GitHub 커밋 동기화

핵심 스니펫:

```tsx
async function handleGithubSync() {
  setIsSaving(true);
  setStatus("GitHub 커밋 수를 동기화하는 중입니다.");

  try {
    const result = await syncGithubActivity();
    setForm((current) => ({...current, github_commits: result.commits}));
    const state = await fetchVillageState();
    setVillageState(state);
    setStatus(result.warning ?? `GitHub 커밋 ${result.commits}개를 오늘 기록에 반영했습니다.`);
  } catch {
    setStatus("GitHub 동기화에 실패했습니다. 토큰 또는 백엔드 상태를 확인하세요.");
  } finally {
    setIsSaving(false);
  }
}
```

`GITHUB_TOKEN`이 있으면 GitHub API에서 오늘 커밋 수를 가져옵니다.

---

## 22. 개발용 3D 소품 편집 기능

이 프로젝트에는 개발 환경에서만 켜지는 3D 소품 배치 편집 기능이 있습니다.

관련 파일:

```text
src/components/village/PropsEditor.tsx
src/app/api/props/route.ts
src/data/propsLayout.json
```

### 22.1 개발 환경에서만 활성화

핵심 스니펫:

```ts
const isDev = process.env.NODE_ENV === "development";
```

`npm run dev`로 실행할 때만 편집 도구가 보입니다.

### 22.2 소품 목록 불러오기

파일 위치:

```text
src/app/api/props/route.ts
```

핵심 스니펫:

```ts
const PROPS_DIR = join(process.cwd(), "public", "models", "props");
const LAYOUT_FILE = join(process.cwd(), "src", "data", "propsLayout.json");

export function GET() {
  return NextResponse.json({assets: listAssets(), layout: readLayout()});
}
```

이 API route는 `public/models/props` 아래의 `.glb` 파일 목록을 읽어서 프론트로 보냅니다.

### 22.3 배치 저장

핵심 스니펫:

```ts
export async function POST(req: Request) {
  const body = (await req.json()) as PropsLayout;
  const out = {props: body.props, buildings: body.buildings ?? {}};
  writeFileSync(LAYOUT_FILE, JSON.stringify(out, null, 2) + "\n", "utf-8");
  return NextResponse.json({ok: true, props: body.props.length});
}
```

편집 결과는 `src/data/propsLayout.json`에 저장됩니다.

현재 저장된 예:

```json
{
  "props": [],
  "buildings": {
    "project-festflow": {
      "position": [-0.6463166082485916, 0, -4.387663163458605]
    }
  }
}
```

---

## 23. 백엔드 전체 구조

백엔드는 `backend/app` 아래에 있습니다.

```text
backend/app/
├── main.py
├── config.py
├── database.py
├── models.py
├── schemas.py
├── catalog.py
├── time_utils.py
└── services/
    ├── activity_service.py
    ├── village_service.py
    ├── chat_service.py
    ├── npc_brain_service.py
    ├── npc_action_service.py
    ├── github_service.py
    └── admin_service.py
```

역할은 다음과 같습니다.

| 파일 | 역할 |
|---|---|
| `main.py` | FastAPI 앱과 API 엔드포인트 |
| `config.py` | 환경 변수 설정 |
| `database.py` | DB 연결과 세션 관리 |
| `models.py` | DB 테이블 구조 |
| `schemas.py` | API 요청/응답 데이터 구조 |
| `catalog.py` | 백엔드용 프로젝트/NPC 지식 베이스 |
| `activity_service.py` | 오늘 활동 저장/조회 |
| `village_service.py` | 활동 기록을 마을 상태로 변환 |
| `chat_service.py` | NPC 채팅 답변 |
| `npc_brain_service.py` | NPC 자동 말풍선/만남 대화 |
| `npc_action_service.py` | NPC 행동 추천 |
| `github_service.py` | GitHub API 동기화 |
| `admin_service.py` | 관리자 데이터와 분석 |

---

## 24. 백엔드 설정

파일 위치:

```text
backend/app/config.py
```

핵심 스니펫:

```py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]

class Settings(BaseSettings):
    database_url: str = "sqlite:///./portfolio_village.db"
    frontend_origin: str = "http://localhost:3000"
    openai_api_key: str | None = None
    openai_model: str = "gpt-5-mini"
    openai_npc_model: str = "gpt-5-nano"
    github_token: str | None = None
    github_username: str = "toadsam"
    local_timezone: str = "Asia/Seoul"

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
```

이 코드는 `backend/.env` 파일을 읽어서 설정값으로 사용합니다.

예를 들어 `.env`에 다음이 있으면:

```env
GITHUB_USERNAME=toadsam
```

Python 코드에서는 이렇게 사용합니다.

```py
settings.github_username
```

---

## 25. DB 연결

파일 위치:

```text
backend/app/database.py
```

핵심 스니펫:

```py
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

class Base(DeclarativeBase):
    pass

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
```

SQLAlchemy는 Python에서 DB를 다루는 라이브러리입니다.

`engine`은 DB 연결 엔진입니다.

`SessionLocal`은 DB 작업 단위인 세션을 만드는 함수입니다.

### 25.1 요청마다 DB 세션 만들기

핵심 스니펫:

```py
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

FastAPI는 이 함수를 이용해서 API 요청마다 DB 세션을 만들고, 요청이 끝나면 닫습니다.

### 25.2 테이블 생성

핵심 스니펫:

```py
def init_db() -> None:
    from app import models

    Base.metadata.create_all(bind=engine)
    _ensure_daily_activity_columns()
```

서버가 시작할 때 DB 테이블을 생성합니다.

SQLite에서는 기존 DB에 새 컬럼이 없을 수도 있어서 `_ensure_daily_activity_columns()`로 필요한 컬럼을 추가합니다.

---

## 26. DB 모델

파일 위치:

```text
backend/app/models.py
```

모델은 DB 테이블 구조입니다.

### 26.1 DailyActivity

핵심 스니펫:

```py
class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, unique=True, index=True)
    github_commits: Mapped[int] = mapped_column(Integer, default=0)
    github_repos: Mapped[list[str]] = mapped_column(JSON, default=list)
    study_minutes: Mapped[int] = mapped_column(Integer, default=0)
    study_topics: Mapped[list[str]] = mapped_column(JSON, default=list)
    studied_tech: Mapped[list[str]] = mapped_column(JSON, default=list)
    coding_minutes: Mapped[int] = mapped_column(Integer, default=0)
    project_minutes: Mapped[dict[str, int]] = mapped_column(JSON, default=dict)
    workout_done: Mapped[bool] = mapped_column(Boolean, default=False)
    workout_minutes: Mapped[int] = mapped_column(Integer, default=0)
    workout_type: Mapped[str] = mapped_column(String(80), default="")
    focus_score: Mapped[int] = mapped_column(Integer, default=50)
    memo: Mapped[str] = mapped_column(Text, default="")
    mood: Mapped[str] = mapped_column(String(40), default="steady")
```

이 테이블은 하루 활동 기록을 저장합니다.

이 기록이 마을 상태를 바꿉니다.

예:

```text
github_commits가 많다
  -> 프로젝트 구역이 밝아짐

study_minutes가 많다
  -> 기술 스택 구역이 밝아짐

workout_done이 true다
  -> 중앙 광장과 가이드 NPC가 활기차짐

memo가 있다
  -> 경험 기록관 상태 문구가 바뀜
```

### 26.2 VisitorEvent

핵심 스니펫:

```py
class VisitorEvent(Base):
    __tablename__ = "visitor_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    target_id: Mapped[str] = mapped_column(String(160), default="", index=True)
    label: Mapped[str] = mapped_column(String(200), default="")
    session_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
```

방문자 행동 로그입니다.

예:

- 페이지 방문
- 프로젝트 클릭
- NPC 메시지
- 연락 링크 클릭

### 26.3 NpcConversationLog

핵심 스니펫:

```py
class NpcConversationLog(Base):
    __tablename__ = "npc_conversation_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    npc_id: Mapped[str] = mapped_column(String(120), index=True)
    visitor_message: Mapped[str] = mapped_column(Text)
    npc_reply: Mapped[str] = mapped_column(Text)
    used_ai: Mapped[bool] = mapped_column(Boolean, default=False)
    suggested_action_id: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
```

NPC 대화 기록을 저장합니다.

`used_ai`는 실제 OpenAI API를 사용했는지 여부입니다.

### 26.4 ManagedProject, NpcPresetSetting, VillageBuildingOverride

이 세 테이블은 관리자 기능을 위한 것입니다.

| 테이블 | 역할 |
|---|---|
| `managed_project` | 관리자용 프로젝트 정보 |
| `npc_preset_setting` | NPC 추천 질문 설정 |
| `village_building_override` | 건물 조명/강조/비활성 설정 |

---

## 27. API 스키마

파일 위치:

```text
backend/app/schemas.py
```

스키마는 API 요청과 응답의 모양입니다.

DB 모델과 스키마는 다릅니다.

```text
models.py
  -> DB에 어떻게 저장할지

schemas.py
  -> API로 어떤 모양의 JSON을 주고받을지
```

### 27.1 ActivityIn

핵심 스니펫:

```py
class ActivityIn(BaseModel):
    date: dt_date | None = None
    github_commits: int = Field(default=0, ge=0)
    github_repos: list[str] = Field(default_factory=list)
    study_minutes: int = Field(default=0, ge=0)
    study_topics: list[str] = Field(default_factory=list)
    studied_tech: list[str] = Field(default_factory=list)
    coding_minutes: int = Field(default=0, ge=0)
    project_minutes: dict[str, int] = Field(default_factory=dict)
    workout_done: bool = False
    workout_minutes: int = Field(default=0, ge=0)
    workout_type: str = ""
    focus_score: int = Field(default=50, ge=0, le=100)
    memo: str = ""
    mood: str = "steady"
```

`Field(default=0, ge=0)`은 0 이상이어야 한다는 뜻입니다.

`focus_score`는 0 이상 100 이하입니다.

```py
focus_score: int = Field(default=50, ge=0, le=100)
```

### 27.2 VillageState

핵심 스니펫:

```py
class VillageState(BaseModel):
    activity: ActivityOut
    buildings: list[BuildingState]
    npcs: list[NpcState]
    unlocked_items: list[str]
    summary: str
```

프론트가 `GET /village-state`로 받는 데이터입니다.

구성:

- 오늘 활동 기록
- 건물 상태 목록
- NPC 상태 목록
- 잠금 해제된 장식 목록
- 요약 문구

### 27.3 NPC 관련 스키마

핵심 스니펫:

```py
class ChatMessageIn(BaseModel):
    npc_id: str
    message: str = Field(min_length=1, max_length=1000)
    recent_messages: list[str] = Field(default_factory=list)

class ChatMessageOut(BaseModel):
    npc_id: str
    reply: str
    used_ai: bool
    suggested_action: NpcActionOut | None = None
```

사용자가 NPC에게 메시지를 보내면 `ChatMessageIn` 형태로 들어옵니다.

백엔드는 `ChatMessageOut` 형태로 답합니다.

---

## 28. FastAPI main.py

파일 위치:

```text
backend/app/main.py
```

이 파일은 백엔드의 진입점입니다.

### 28.1 FastAPI 앱 생성

핵심 스니펫:

```py
app = FastAPI(title="AI Portfolio Village API", version="0.1.0")
```

FastAPI 앱을 만듭니다.

### 28.2 CORS 설정

핵심 스니펫:

```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

CORS는 브라우저 보안 정책입니다.

프론트엔드는 `localhost:3000`, 백엔드는 `localhost:8000`입니다.

서로 포트가 다르기 때문에 브라우저는 기본적으로 요청을 막을 수 있습니다.

그래서 백엔드에서 허용 주소를 등록합니다.

### 28.3 서버 시작 시 DB 초기화

핵심 스니펫:

```py
@app.on_event("startup")
def on_startup() -> None:
    init_db()
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed_admin_defaults(db)
    finally:
        db.close()
```

서버가 시작되면:

```text
1. DB 테이블 생성
2. 관리자 기본 데이터 seed
3. DB 세션 닫기
```

### 28.4 주요 API 목록

`main.py`에 정의된 엔드포인트:

| 메서드 | 경로 | 역할 |
|---|---|---|
| GET | `/health` | 서버 상태 확인 |
| GET | `/activity/today` | 오늘 활동 조회 |
| POST | `/activity` | 오늘 활동 저장 |
| GET | `/village-state` | 마을 상태 조회 |
| POST | `/npc/chat` | NPC 채팅 |
| POST | `/npc/tick` | NPC 자동 말풍선/상태 |
| POST | `/npc/encounter` | NPC끼리 만남 대화 |
| POST | `/github/sync` | GitHub 커밋 동기화 |
| POST | `/analytics/event` | 방문자 이벤트 저장 |
| GET | `/admin/overview` | 관리자 전체 요약 |
| GET | `/admin/analytics` | 분석 요약 |
| GET | `/admin/projects` | 관리자 프로젝트 목록 |
| PUT | `/admin/projects/{project_id}` | 프로젝트 관리 정보 수정 |
| GET | `/admin/npc/logs` | NPC 대화 로그 |
| GET | `/npc/presets` | NPC 추천 질문 목록 |
| PUT | `/admin/npc/presets/{npc_id}` | NPC 추천 질문 수정 |
| GET | `/admin/village/overrides` | 건물 override 목록 |
| PUT | `/admin/village/overrides/{building_id}` | 건물 override 수정 |

---

## 29. 오늘 활동 저장 로직

파일 위치:

```text
backend/app/services/activity_service.py
```

### 29.1 오늘 기록 가져오기 또는 생성

핵심 스니펫:

```py
def get_or_create_today(db: Session) -> DailyActivity:
    today = today_local()
    activity = db.query(DailyActivity).filter(DailyActivity.date == today).first()
    if activity:
        return activity

    activity = DailyActivity(date=today)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity
```

오늘 날짜의 기록이 있으면 가져오고, 없으면 새로 만듭니다.

### 29.2 upsert

핵심 스니펫:

```py
def upsert_activity(db: Session, payload: ActivityIn) -> DailyActivity:
    activity_date = payload.date or today_local()
    activity = db.query(DailyActivity).filter(DailyActivity.date == activity_date).first()

    if not activity:
        activity = DailyActivity(date=activity_date)
        db.add(activity)

    activity.github_commits = payload.github_commits
    activity.github_repos = _clean_list(payload.github_repos)
    activity.study_minutes = payload.study_minutes
    activity.project_minutes = {
        key.strip(): max(0, int(value))
        for key, value in payload.project_minutes.items()
        if key.strip() and int(value) > 0
    }
    activity.workout_done = payload.workout_done
    activity.focus_score = payload.focus_score
    activity.memo = payload.memo.strip()
    activity.mood = payload.mood.strip() or "steady"
    db.commit()
    db.refresh(activity)
    return activity
```

`upsert`는 update와 insert를 합친 말입니다.

```text
기록이 있으면 update
기록이 없으면 insert
```

---

## 30. 마을 상태 계산 로직

파일 위치:

```text
backend/app/services/village_service.py
```

이 파일은 오늘 활동 기록을 3D 마을 상태로 변환합니다.

### 30.1 점수 계산

핵심 스니펫:

```py
def derive_village_state(activity: DailyActivity) -> VillageState:
    commit_score = min(activity.github_commits * 18, 100)
    study_score = min(activity.study_minutes // 2 + len(activity.study_topics or []) * 8, 100)
    coding_score = min(activity.coding_minutes // 3 + sum((activity.project_minutes or {}).values()) // 4, 100)
    workout_score = min(activity.workout_minutes * 2, 100) if activity.workout_done else 0
    focus_score = max(0, min(activity.focus_score, 100))
    memo_score = 35 if activity.memo.strip() else 0
```

오늘 활동을 여러 점수로 바꿉니다.

| 점수 | 기반 데이터 |
|---|---|
| `commit_score` | GitHub 커밋 수 |
| `study_score` | 공부 시간, 공부 주제 수 |
| `coding_score` | 코딩 시간, 프로젝트별 작업 시간 |
| `workout_score` | 운동 여부, 운동 시간 |
| `focus_score` | 관리자 입력 집중도 |
| `memo_score` | 오늘 메모 존재 여부 |

### 30.2 점수를 조명 단계로 변환

핵심 스니펫:

```py
def _light_for_score(score: int) -> str:
    if score <= 0:
        return "dark"
    if score < 35:
        return "dim"
    if score < 75:
        return "normal"
    return "bright"
```

점수가 높을수록 건물이 밝아집니다.

| 점수 | 조명 |
|---|---|
| 0 이하 | `dark` |
| 1-34 | `dim` |
| 35-74 | `normal` |
| 75 이상 | `bright` |

### 30.3 프로젝트 건물 상태

핵심 스니펫:

```py
for project_id, building_id in PROJECT_BUILDING_IDS.items():
    minutes = int(project_minutes.get(project_id, 0))
    repo_bonus = 28 if _repo_matches_project(project_id, touched_repos) else 0
    project_score = min(minutes + repo_bonus + (commit_score // 3 if minutes > 0 else 0), 100)

    buildings.append(
        BuildingState(
            building_id=building_id,
            light_level=_light_for_score(project_score),
            activity_score=project_score,
            reason=_project_reason(project_id, minutes, repo_bonus, activity.github_commits),
        )
    )
```

프로젝트별 작업 시간이 있거나 GitHub repo 기록이 있으면 해당 프로젝트 건물이 밝아집니다.

### 30.4 NPC 상태 계산

핵심 스니펫:

```py
guide_mood = "training" if activity.workout_done else "sleepy" if overall_score <= 10 else "proud"
project_mood = "busy" if active_project_ids or activity.github_commits >= 5 else "calm"
developer_mood = "focused" if activity.study_minutes >= 90 or activity.coding_minutes >= 120 else "calm"
archivist_mood = "curious" if activity.memo.strip() else "calm"
```

오늘 활동에 따라 NPC의 기분도 바뀝니다.

예:

```text
운동 완료
  -> guide-npc mood = training

프로젝트 작업 있음
  -> project-npc mood = busy

공부 90분 이상
  -> developer-npc mood = focused

메모 있음
  -> archivist-npc mood = curious
```

---

## 31. NPC 채팅 로직

파일 위치:

```text
backend/app/services/chat_service.py
```

### 31.1 채팅 엔트리 함수

핵심 스니펫:

```py
async def answer_npc_message(
    npc_id: str,
    message: str,
    activity: DailyActivity,
    recent_messages: list[str] | None = None,
) -> tuple[str, bool, NpcActionOut]:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    context = build_context(npc_id, activity, recent_messages or [])
    suggested_action = choose_npc_action(npc_id, message=message, activity=activity, source="chat")

    if settings.openai_api_key:
        try:
            return await answer_with_openai(npc, context, message), True, suggested_action
        except Exception:
            return answer_without_ai(npc_id, message, activity), False, suggested_action

    return answer_without_ai(npc_id, message, activity), False, suggested_action
```

흐름:

```text
NPC 메시지 요청
  -> NPC 프로필 찾기
  -> 포트폴리오/오늘 활동 context 생성
  -> 행동 추천 생성
  -> OpenAI API 키가 있으면 AI 답변 시도
  -> 실패하거나 키가 없으면 fallback 답변
```

반환값:

```text
답변 문자열
AI 사용 여부
추천 행동
```

### 31.2 AI 답변

핵심 스니펫:

```py
async def answer_with_openai(npc: dict[str, Any], context: str, message: str) -> str:
    import httpx

    system_prompt = (
        "너는 정재훈의 살아있는 3D 포트폴리오 마을에 사는 AI NPC다. "
        "감정과 기억이 있는 것처럼 행동하되, 사실은 제공된 포트폴리오 데이터와 최근 대화만 근거로 말한다. "
        "모르는 내용은 지어내지 말고 확인 가능한 범위에서 답한다. "
        ...
    )

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "temperature": 0.65,
                "max_tokens": 650,
            },
        )
```

OpenAI API를 직접 `httpx`로 호출합니다.

프롬프트에는 다음 규칙이 들어갑니다.

- 포트폴리오 데이터에 근거해서 말하기
- 모르면 지어내지 않기
- 한국어로 답하기
- 너무 긴 마크다운 쓰지 않기
- NPC 성격 반영하기

### 31.3 fallback 답변

핵심 스니펫:

```py
def answer_without_ai(npc_id: str, message: str, activity: DailyActivity) -> str:
    if _contains(message, ["대표", "추천", "best", "main", "채용자"]):
        return (
            "채용자에게 먼저 보여줄 대표 프로젝트는 MyWave, FestFlow, 근근 MuscleUp 순서가 좋아요. "
            "MyWave는 문제 정의와 정보 구조화가 잘 보이고, FestFlow는 실시간 운영 UX와 권한 분리가 드러나요. "
            "근근 MuscleUp은 인증, SSE, 커뮤니티, AI 분석을 하나의 풀스택 흐름으로 묶은 점이 강합니다."
        )
```

AI가 없어도 특정 키워드에 따라 답변합니다.

장점:

- API 키 없이도 개발 가능
- AI 장애가 있어도 서비스가 완전히 멈추지 않음
- 포트폴리오 핵심 답변 품질을 어느 정도 보장 가능

---

## 32. NPC 자동 행동과 만남

파일 위치:

```text
backend/app/services/npc_brain_service.py
```

### 32.1 NPC tick

핵심 스니펫:

```py
async def generate_npc_tick(payload: NpcTickIn, activity: DailyActivity) -> NpcTickOut:
    npc = _npc_profile(payload.npc_id, payload.assigned_building_id)
    context = build_context(payload.npc_id, activity, payload.recent_memory)

    if settings.openai_api_key:
        try:
            data = await _call_json_model(
                system_prompt=_tick_system_prompt(npc, context),
                user_prompt=json.dumps(payload.model_dump(), ensure_ascii=False),
                max_tokens=260,
            )
            return _tick_from_data(payload.npc_id, data, used_ai=True, activity=activity)
        except Exception as exc:
            logger.warning("NPC tick OpenAI 호출 실패 → 폴백 사용")

    return _fallback_tick(payload, activity)
```

NPC tick은 방문자가 질문하지 않아도 NPC가 혼자 상태를 갱신하는 기능입니다.

반환되는 값:

- 말풍선 텍스트
- mood
- energy
- next_goal
- memory
- suggested_action

### 32.2 JSON 응답 요구

핵심 스니펫:

```py
json={
    "model": settings.openai_npc_model,
    "messages": [...],
    "temperature": 0.82,
    "max_tokens": max_tokens,
    "response_format": {"type": "json_object"},
}
```

NPC 자동 행동은 프론트에서 바로 사용해야 하므로 JSON 형태로 받습니다.

일반 채팅처럼 자유 텍스트만 받으면 mood, energy, memory를 안정적으로 파싱하기 어렵습니다.

### 32.3 NPC encounter

핵심 스니펫:

```py
async def generate_npc_encounter(
    npc_a: EncounterParticipant,
    npc_b: EncounterParticipant,
    recent_memory: list[str],
    activity: DailyActivity,
) -> NpcEncounterOut:
    ...
    return await generate...
```

두 NPC가 가까이 만났을 때 대화 4줄을 생성합니다.

프롬프트에서 다음을 요구합니다.

```text
dialogue MUST be an array of EXACTLY 4 objects
strict A, B, A, B order
```

그래서 프론트가 말풍선을 순서대로 띄우기 쉽습니다.

---

## 33. NPC 행동 추천

파일 위치:

```text
backend/app/services/npc_action_service.py
```

NPC 답변이나 자동 생각 이후, 어떤 행동을 할지 추천하는 로직입니다.

### 33.1 행동 정의

핵심 스니펫:

```py
ACTION_DEFINITIONS: dict[str, list[dict[str, Any]]] = {
    "guide-npc": [
        {
            "action_id": "welcome-visitor",
            "label": "방문자 환영",
            "description": "처음 온 방문자에게 마을의 첫 동선을 안내합니다.",
            "keywords": ["처음", "시작", "안내", "어디", "intro"],
            "moods": ["calm", "proud", "training"],
            "animation_key": "wave",
            "target_id": "central-plaza",
            "duration_ms": 4200,
        }
    ]
}
```

행동 하나는 다음 정보를 가집니다.

| 필드 | 의미 |
|---|---|
| `action_id` | 행동 ID |
| `label` | 화면 표시 이름 |
| `description` | 설명 |
| `keywords` | 메시지에 이 단어가 있으면 선택 가능 |
| `moods` | 이 기분일 때 어울리는 행동 |
| `animation_key` | 프론트에서 보여줄 이펙트 종류 |
| `target_id` | 가리킬 건물 ID |
| `duration_ms` | 행동 지속 시간 |

### 33.2 행동 선택

핵심 스니펫:

```py
def choose_npc_action(
    npc_id: str,
    message: str = "",
    mood: NpcMood | str = "calm",
    next_goal: str = "",
    activity: DailyActivity | None = None,
    source: ActionSource = "chat",
) -> NpcActionOut:
    canonical_id = _canonical_npc_id(npc_id)
    actions = ACTION_DEFINITIONS[canonical_id]
    haystack = f"{message} {next_goal}".lower()

    for action in actions:
        if any(str(keyword).lower() in haystack for keyword in action["keywords"]):
            return _to_action_out(npc_id, action, source)

    if activity:
        activity_action = _action_from_activity(canonical_id, activity)
        if activity_action:
            return _to_action_out(npc_id, activity_action, source)

    for action in actions:
        if mood in action["moods"]:
            return _to_action_out(npc_id, action, source)

    return _to_action_out(npc_id, actions[0], source)
```

선택 우선순위:

```text
1. 메시지 키워드와 맞는 행동
2. 오늘 활동과 맞는 행동
3. NPC mood와 맞는 행동
4. 기본 첫 번째 행동
```

---

## 34. 관리자 서비스

파일 위치:

```text
backend/app/services/admin_service.py
```

### 34.1 기본 데이터 seed

핵심 스니펫:

```py
def seed_admin_defaults(db: Session) -> None:
    for project_id, project in PROJECTS.items():
        exists = db.get(ManagedProject, project_id)
        if exists:
            continue
        db.add(
            ManagedProject(
                id=project_id,
                title=str(project["title"]),
                summary=str(project["summary"]),
                role=str(project["role"]),
                tech=list(project["tech"]),
                priority=80 if project_id in {"mywave", "festflow", "muscleup"} else 50,
                featured=project_id in {"mywave", "festflow", "muscleup"},
                visible=True,
            )
        )
```

서버가 처음 실행될 때 기본 프로젝트 관리 데이터를 DB에 넣습니다.

### 34.2 방문자 이벤트 저장

핵심 스니펫:

```py
def record_visitor_event(db: Session, payload: VisitorEventIn) -> VisitorEvent:
    event = VisitorEvent(
        event_type=payload.event_type.strip(),
        target_id=payload.target_id.strip(),
        label=payload.label.strip(),
        session_id=payload.session_id.strip(),
        metadata_json=dict(payload.metadata),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
```

프론트에서 `trackVisitorEvent()`를 호출하면 이 함수가 DB에 저장합니다.

### 34.3 분석 요약

핵심 스니펫:

```py
def analytics_summary(db: Session, limit: int = 30) -> AnalyticsSummary:
    total_events = db.query(func.count(VisitorEvent.id)).scalar() or 0
    unique_sessions = db.query(func.count(func.distinct(VisitorEvent.session_id))).filter(
        VisitorEvent.session_id != ""
    ).scalar() or 0
    npc_messages = db.query(func.count(NpcConversationLog.id)).scalar() or 0
    project_views = db.query(func.count(VisitorEvent.id)).filter(
        VisitorEvent.event_type.in_(["project_view", "project_open", "project_detail"])
    ).scalar() or 0
```

관리자 페이지에서 볼 수 있는 분석 데이터를 계산합니다.

---

## 35. GitHub 동기화

파일 위치:

```text
backend/app/services/github_service.py
```

핵심 스니펫:

```py
async def fetch_today_commit_count() -> int:
    if not settings.github_token:
        return 0

    today = today_local()
    local_midnight = datetime.combine(today, time.min, tzinfo=ZoneInfo(settings.local_timezone))
    since = local_midnight.astimezone(timezone.utc).isoformat()

    query = """
    query($username: String!, $since: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $since) {
          totalCommitContributions
        }
      }
    }
    """
```

GitHub GraphQL API를 사용해서 오늘 커밋 수를 가져옵니다.

중요한 점:

- `LOCAL_TIMEZONE=Asia/Seoul` 기준으로 오늘 자정을 계산합니다.
- 그 시간을 UTC로 바꿔 GitHub API에 넘깁니다.
- `GITHUB_TOKEN`이 없으면 0을 반환합니다.

---

## 36. 전체 데이터 흐름

### 36.1 페이지 처음 로드

```text
사용자 브라우저 접속
  -> src/app/page.tsx
  -> AIPortfolioVillage 렌더링
  -> trackVisitorEvent(page_view)
  -> fetchVillageState()
  -> GET /village-state
  -> backend/app/main.py
  -> get_or_create_today()
  -> derive_village_state()
  -> apply_village_overrides()
  -> VillageState 반환
  -> 프론트가 건물 조명, NPC 상태, 라이브 패널 갱신
```

### 36.2 관리자에서 오늘 기록 저장

```text
/admin 접속
  -> fetchTodayActivity()
  -> fetchVillageState()
  -> 입력 폼 표시
  -> 사용자가 기록 입력
  -> saveActivity()
  -> POST /activity
  -> upsert_activity()
  -> daily_activity 테이블 저장
  -> fetchVillageState()
  -> 새 점수 계산
  -> 관리자 미리보기 갱신
```

### 36.3 건물 클릭

```text
건물 클릭
  -> Building.onClick()
  -> AIPortfolioVillage.handleRequestEnter(buildingId)
  -> trackVisitorEvent(project_open 또는 building_enter)
  -> 프로젝트 건물이라면
      setInteriorProjectId(contentId)
      setViewMode("project-interior")
  -> ProjectInterior 렌더링
  -> ProjectViewer 상세 열기 가능
```

### 36.4 NPC 채팅

```text
NPC 클릭
  -> selectedNpc 저장
  -> DialogueBox 열림
  -> 사용자 메시지 입력
  -> sendNpcMessage()
  -> POST /npc/chat
  -> answer_npc_message()
  -> OpenAI API 또는 fallback 답변
  -> log_npc_conversation()
  -> reply + suggested_action 반환
  -> 프론트 대화창에 답변 표시
  -> suggested_action이 있으면 NPC 이펙트 실행
```

### 36.5 NPC 자동 말풍선

```text
프론트 60초 interval
  -> 일부 NPC batch 선택
  -> requestNpcTick()
  -> POST /npc/tick
  -> generate_npc_tick()
  -> AI JSON 또는 fallback
  -> bubble_text, mood, energy 반환
  -> NPC 위 말풍선 표시
```

### 36.6 NPC 만남 대화

```text
프론트가 NPC 위치 기록
  -> 두 NPC 거리 계산
  -> 가까우면 requestNpcEncounter()
  -> POST /npc/encounter
  -> generate_npc_encounter()
  -> 4줄 대화 반환
  -> NPC 말풍선 순차 표시
  -> 엿듣기 패널 표시
```

---

## 37. 새 프로젝트 추가 방법

새 프로젝트를 추가하려면 보통 다음 파일을 수정합니다.

### 37.1 프로젝트 데이터 추가

파일:

```text
src/data/projects.ts
```

예시:

```ts
{
  id: "new-project",
  title: "New Project",
  description: "새 프로젝트 설명",
  role: "내 역할",
  tech: ["React", "FastAPI"],
  features: ["핵심 기능 1", "핵심 기능 2"],
  learning: "배운 점",
  problem: "해결하려던 문제",
  approach: ["접근 1", "접근 2"],
  contribution: ["기여 1", "기여 2"],
  result: "결과",
  nextStep: "다음 단계",
  links: [{label: "GitHub", href: "https://github.com/..."}]
}
```

### 37.2 건물 추가

파일:

```text
src/lib/constants.ts
```

예시:

```ts
{
  id: "project-new-project",
  sectionId: "projects",
  district: "projects",
  contentId: "new-project",
  kind: "tower",
  name: "New Project",
  label: "Service",
  description: "새 프로젝트 건물",
  position: [-12, 0, 4],
  size: [1.8, 2.2, 1.8],
  color: "#0d1a2e",
  roofColor: "#1a3a5a",
  accentColor: "#00d4ff",
  techStack: ["React", "FastAPI"]
}
```

중요한 연결:

```text
contentId: "new-project"
projects.ts의 id: "new-project"
```

둘이 같아야 합니다.

### 37.3 테마 추가

파일:

```text
src/data/projectThemes.ts
```

예시:

```ts
"new-project": {
  category: "dashboard",
  primary: "#38bdf8",
  secondary: "#0ea5e9",
  bg: "#040d18",
  accent: "#7dd3fc"
}
```

### 37.4 백엔드 마을 상태 매핑 추가

파일:

```text
backend/app/services/village_service.py
```

예시:

```py
PROJECT_BUILDING_IDS = {
    "new-project": "project-new-project",
}
```

이 매핑이 있어야 관리자 페이지에서 `project_minutes["new-project"]`를 입력했을 때 해당 건물 조명이 바뀝니다.

### 37.5 백엔드 지식 베이스 추가

파일:

```text
backend/app/catalog.py
```

NPC가 새 프로젝트에 대해 답할 수 있게 백엔드 지식 베이스에도 추가해야 합니다.

---

## 38. 새 기술 스택 추가 방법

파일:

```text
src/data/skills.ts
```

예시:

```ts
{
  name: "React Query",
  group: "Frontend",
  description: "서버 상태 캐싱과 비동기 데이터 관리를 구현합니다."
}
```

가능한 group은 `src/types/portfolio.ts`에 정의되어 있습니다.

```ts
export interface SkillData {
  name: string;
  group: "Frontend" | "3D / Motion" | "Backend" | "Game / XR" | "Workflow";
  description: string;
}
```

새 그룹을 만들고 싶으면 이 타입도 같이 수정해야 합니다.

---

## 39. 새 NPC 행동 추가 방법

파일:

```text
backend/app/services/npc_action_service.py
```

예시:

```py
{
    "action_id": "show-demo",
    "label": "데모 안내",
    "description": "방문자에게 데모 화면을 안내합니다.",
    "keywords": ["데모", "시연", "demo"],
    "moods": ["excited", "focused"],
    "animation_key": "open-hologram",
    "target_id": "project-mywave",
    "duration_ms": 5000,
}
```

프론트에서 가능한 `animation_key`는 `src/types/live.ts`에 있습니다.

```ts
export type NpcAnimationKey =
  | "wave"
  | "point"
  | "think"
  | "type"
  | "send"
  | "walk-to-building"
  | "open-hologram";
```

새 animation key를 만들려면 다음도 수정해야 합니다.

```text
src/types/live.ts
src/components/village/NPC.tsx
backend/app/schemas.py
```

---

## 40. 새 백엔드 API 추가 방법

예를 들어 `/stats` API를 추가한다고 가정합니다.

### 40.1 schema 추가

파일:

```text
backend/app/schemas.py
```

```py
class StatsOut(BaseModel):
    project_count: int
    skill_count: int
```

### 40.2 main.py에 endpoint 추가

파일:

```text
backend/app/main.py
```

```py
@app.get("/stats", response_model=StatsOut)
def stats():
    return StatsOut(project_count=10, skill_count=13)
```

### 40.3 프론트 API 함수 추가

파일:

```text
src/lib/liveApi.ts
```

```ts
export interface StatsOut {
  project_count: number;
  skill_count: number;
}

export function fetchStats(): Promise<StatsOut> {
  return requestJson<StatsOut>("/stats", {cache: "no-store"});
}
```

### 40.4 컴포넌트에서 호출

```tsx
useEffect(() => {
  fetchStats().then(setStats).catch(() => setStats(null));
}, []);
```

---

## 41. 자주 생길 수 있는 문제

### 41.1 백엔드가 꺼져 있을 때

증상:

```text
FastAPI 백엔드가 꺼져 있습니다
AI 오프라인
관리자 페이지 저장 실패
```

해결:

```bash
npm run backend:dev
```

### 41.2 프론트에서 API 호출 실패

확인할 것:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

그리고 백엔드 CORS 설정에 프론트 주소가 포함되어 있는지 확인합니다.

파일:

```text
backend/app/main.py
```

### 41.3 OpenAI 답변이 안 나올 때

확인할 것:

```env
OPENAI_API_KEY=
```

비어 있으면 fallback 답변이 사용됩니다.

이것은 오류가 아니라 의도된 동작입니다.

### 41.4 GitHub 동기화가 안 될 때

확인할 것:

```env
GITHUB_TOKEN=
GITHUB_USERNAME=toadsam
```

토큰이 없으면 백엔드는 다음 경고를 반환합니다.

```text
GITHUB_TOKEN이 없어 GitHub 동기화를 건너뛰었습니다.
```

### 41.5 3D 모델이 안 보일 때

확인할 것:

```text
public/models/
```

GLB 파일은 `public` 아래에 있어야 브라우저에서 `/models/...` 경로로 접근할 수 있습니다.

예:

```text
public/models/environment/ground.glb
```

코드에서는 이렇게 씁니다.

```tsx
useGLTF("/models/environment/ground.glb");
```

### 41.6 TypeScript 경로 alias가 안 먹을 때

확인할 것:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

파일:

```text
tsconfig.json
```

---

## 42. 현재 프로젝트에서 레거시 파일

파일 목록에는 다음 같은 기존 CRA 구조 파일도 있습니다.

```text
src/App.js
src/index.js
src/containers/
src/components/portfolioWorld/
src/components/digitalHabitat/
```

하지만 현재 Next.js 서비스 진입점은 다음입니다.

```text
src/app/page.tsx
```

그리고 실제 메인 컴포넌트는 다음입니다.

```text
src/components/AIPortfolioVillage.tsx
```

즉, 현재 앱을 이해할 때는 먼저 Next.js App Router 쪽을 봐야 합니다.

레거시 파일은 과거 포트폴리오 또는 참고용 코드일 가능성이 높습니다.

---

## 43. 초보자용 추천 읽는 순서

처음부터 모든 파일을 읽으면 헷갈릴 수 있습니다.

추천 순서는 다음입니다.

1. `src/app/page.tsx`
2. `src/components/AIPortfolioVillage.tsx`
3. `src/lib/constants.ts`
4. `src/data/projects.ts`
5. `src/components/village/VillageScene.tsx`
6. `src/components/village/Building.tsx`
7. `src/components/village/NPC.tsx`
8. `src/components/ui/DialogueBox.tsx`
9. `src/lib/liveApi.ts`
10. `backend/app/main.py`
11. `backend/app/schemas.py`
12. `backend/app/models.py`
13. `backend/app/services/village_service.py`
14. `backend/app/services/chat_service.py`
15. `backend/app/services/npc_brain_service.py`

이 순서로 보면 다음 흐름을 자연스럽게 이해할 수 있습니다.

```text
페이지 시작
  -> 메인 컴포넌트
  -> 데이터
  -> 3D 렌더링
  -> UI 패널
  -> 프론트 API
  -> 백엔드 API
  -> DB
  -> 마을 상태 계산
  -> NPC 답변
```

---

## 44. 핵심 요약

이 프로젝트의 핵심 구조는 다음입니다.

```text
Next.js 프론트엔드
  -> AIPortfolioVillage가 전체 화면 상태 관리
  -> VillageScene이 3D 마을 렌더링
  -> Building/NPC가 각각 3D 오브젝트 담당
  -> InfoPanel, DialogueBox, ProjectViewer가 UI 담당
  -> liveApi.ts가 백엔드 호출 담당

FastAPI 백엔드
  -> main.py가 API 엔드포인트 담당
  -> schemas.py가 요청/응답 타입 담당
  -> models.py가 DB 테이블 담당
  -> services가 실제 로직 담당
  -> activity_service가 오늘 기록 저장
  -> village_service가 마을 상태 계산
  -> chat_service가 NPC 채팅 답변
  -> npc_brain_service가 NPC 자동 행동과 만남 처리
```

가장 중요한 연결은 다음입니다.

```text
관리자 오늘 기록
  -> DB 저장
  -> 마을 상태 계산
  -> 건물 조명 변경
  -> NPC 기분 변경
  -> 방문자가 보는 3D 포트폴리오 변화
```

그리고 NPC 대화는 다음 구조입니다.

```text
방문자 질문
  -> 프론트 DialogueBox
  -> POST /npc/chat
  -> OpenAI 또는 fallback 답변
  -> suggested_action
  -> NPC 이펙트
  -> 대화 로그 저장
```

이 프로젝트는 단순히 예쁜 3D 화면을 만든 것이 아니라, 포트폴리오 데이터, 오늘 활동, AI NPC, 관리자 기록, 방문자 분석이 서로 연결되도록 구성되어 있습니다.

