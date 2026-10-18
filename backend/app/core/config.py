from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    mistral_api_key: str = ""
    groq_api_key: str = ""
    gemini_api_key: str = ""
    ai_primary_provider: str = "mistral"
    ai_fallback_provider: str = "groq"
    mistral_model: str = "mistral-small-latest"
    groq_model: str = "openai/gpt-oss-120b"
    gemini_model: str = "gemini-3.8-flash"
    job_analysis_provider_order: str = "gemini,groq,mistral"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: str = "http://localhost:3000"
    chat_limit_per_minute: int = Field(default=10, ge=1, le=120)
    job_analysis_limit_per_minute: int = Field(default=3, ge=1, le=30)
    chat_max_output_tokens: int = Field(default=2048, ge=256, le=8192)
    job_analysis_max_output_tokens: int = Field(default=4096, ge=512, le=8192)
    ai_timeout_seconds: int = Field(default=45, ge=5, le=180)
    max_job_upload_bytes: int = Field(default=5 * 1024 * 1024, ge=1024, le=20 * 1024 * 1024)
    max_job_text_chars: int = Field(default=30_000, ge=1000, le=100_000)
    max_job_pdf_pages: int = Field(default=100, ge=1, le=500)

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
