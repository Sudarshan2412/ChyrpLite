from __future__ import annotations
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    project_name: str = "ChyrpLite"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/chyrplite"
    redis_url: str | None = None
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    upload_dir: str = "uploads"
    base_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        extra = "allow"

@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore
