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

    # 의뢰 공방 — 실제 외부인이 쓰는 유일한 공개 쓰기 경로라 별도 상한을 둔다.
    discord_webhook_url: str = ""          # 비어 있으면 접수 알림을 조용히 건너뛴다
    commission_rate_per_hour: int = 3      # IP당 시간당 '성공한' 접수 상한
    commission_attempts_per_hour: int = 20 # IP당 시간당 시도 상한(오타 재시도 허용, 봇 홍수 차단)
    commission_daily_limit: int = 40       # 전체 하루 접수 상한

    # 의뢰 공방 3단계 — 직군별 에이전트.
    #
    # agent_worker_enabled 는 **기본 꺼짐**이다. 켜면 관리자 페이지 버튼이
    # 이 프로세스 안에서 파일을 쓰는 에이전트를 띄운다. 공개 배포된 웹 서버에서
    # 그게 돌면 안 되므로, 로컬에서만 .env 로 켜고 배포본은 CLI 경로를 쓴다.
    agent_worker_enabled: bool = False
    agent_max_turns: int = 40              # 에이전트 한 번 실행의 도구 왕복 상한(비용 상한이기도 하다)
    agent_timeout_seconds: int = 900       # 한 번 실행이 이보다 길면 끊는다(15분)
    agent_workspace_dir: str = ""          # 비면 리포 루트의 workspace/
    agent_model: str = ""                  # 비면 Claude Code CLI 기본 모델
    anthropic_api_key: str | None = None   # 없으면 Claude Code CLI 로그인을 그대로 쓴다

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
