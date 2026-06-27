# Portfolio Village FastAPI Backend

3D 포트폴리오 마을의 라이브 상태, 관리자 활동 저장, NPC 대화, GitHub 커밋 동기화를 담당하는 FastAPI 백엔드입니다.

## 로컬 실행

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API는 `http://localhost:8000`에서 실행됩니다.

## 주요 엔드포인트

- `GET /health`
- `GET /activity/today`
- `POST /activity`
- `GET /village-state`
- `POST /npc/chat`
- `POST /npc/tick`
- `POST /npc/encounter`
- `POST /github/sync`

## 환경 변수

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

`DATABASE_URL`은 기본적으로 로컬 SQLite를 사용합니다. 운영 환경에서는 PostgreSQL URL로 교체할 수 있습니다.
