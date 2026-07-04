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

    # 보안 — 관리자 인증. admin_password 가 비어 있으면 인증이 비활성(로컬 개발 편의).
    # 배포 전에는 반드시 ADMIN_PASSWORD 를 설정할 것.
    admin_password: str = ""
    admin_secret: str = "change-me-in-prod"  # 토큰 서명용 (ADMIN_SECRET)
    admin_token_ttl_hours: int = 168  # 로그인 토큰 유효기간 (7일)

    # AI 호출 레이트리밋 (비용/남용 방지)
    ai_rate_per_min: int = 30  # IP당 분당 AI 호출 상한
    ai_daily_limit: int = 800  # 전체 하루 AI 호출 상한

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
