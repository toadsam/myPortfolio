# Portfolio Village FastAPI Backend

FastAPI backend for the living 3D portfolio village.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## Main endpoints

- `GET /health`
- `GET /activity/today`
- `POST /activity`
- `GET /village-state`
- `POST /npc/chat`
- `POST /github/sync`

`DATABASE_URL` defaults to SQLite for local development. Use a PostgreSQL URL in production.
