# AI Portfolio Village

![Developer's City — 밤의 포트폴리오 마을](docs/screenshots/hero-night.jpg)

정재훈의 프로젝트, 기술 스택, 경험, 연락처를 3D 마을로 탐색하는 Next.js 포트폴리오입니다. 방문자는 건물을 클릭해 프로젝트 내부 전시장으로 들어가고, AI NPC에게 프로젝트/기술/연락처 질문을 할 수 있습니다. 관리자가 기록한 오늘의 활동(공부·커밋·운동)이 건물 조명과 NPC 기분으로 실시간 반영되는 **살아있는 마을**입니다.

![낮의 마을 전경](docs/screenshots/hero-day.jpg)

## 실행 방법

프론트엔드만 실행:

```bash
npm install
npm run dev
```

백엔드까지 함께 실행:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
cd ..
npm run backend:dev
```

다른 터미널에서:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Backend API: `http://localhost:8000`

## 환경 변수

루트 `.env.local` 또는 실행 환경:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`backend/.env`:

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

`OPENAI_API_KEY`가 없으면 NPC는 내장 포트폴리오 데이터 기반 fallback 답변을 사용합니다. `GITHUB_TOKEN`이 없으면 GitHub 동기화 버튼은 안내 메시지를 보여주고 커밋 수를 0으로 저장합니다.

## 주요 기능

- React Three Fiber 기반 3D 마을
- 건물 클릭 후 확인창을 거쳐 프로젝트 내부 공간 입장
- 프로젝트별 3D 전시장과 상세 모달
- NPC 대화 UI, 프리셋 질문, 로컬 대화 기록
- Admin 페이지에서 공부 시간, 커밋 수, 운동 여부, 메모 저장
- 저장된 활동을 마을 조명, NPC 상태, 장식 해금에 반영
- FastAPI 백엔드 오프라인 상태 fallback

## 프로젝트 구조

```text
src/app/                 Next.js App Router
src/components/          3D 마을, 내부 공간, UI 패널
src/data/                프로젝트/기술/경험/링크 데이터
src/lib/                 마을 상수, API 클라이언트, 라이브 상태 유틸
src/types/               포트폴리오와 라이브 API 타입
backend/app/             FastAPI API, 활동 저장, NPC 응답, GitHub 동기화
```

## Legacy CRA 파일

`src/App.js`, `src/index.js`, `src/containers`, 일부 `.js/.jsx` 컴포넌트는 기존 Create React App 포트폴리오에서 보관된 자료입니다. 현재 서비스 진입점은 `src/app/page.tsx`이며, TypeScript 설정에서 CRA 파일은 빌드 대상이 아닙니다.

## 스크립트

```bash
npm run dev        # Next.js 개발 서버
npm run backend:dev # FastAPI 개발 서버
npm run build      # 프로덕션 빌드
npm run start      # 빌드 결과 실행
npm run typecheck  # TypeScript 검사
```
