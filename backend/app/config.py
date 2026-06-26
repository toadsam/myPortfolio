from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./portfolio_village.db"
    frontend_origin: str = "http://localhost:3000"
    openai_api_key: str | None = None
    openai_model: str = "gpt-5-mini"
    openai_npc_model: str = "gpt-5-nano"
    github_token: str | None = None
    github_username: str = "toadsam"
    local_timezone: str = "Asia/Seoul"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
