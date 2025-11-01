"""
Configuration and settings for ResAlign AI backend.
Loads from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # === Core ===
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    APP_NAME: str = "ResAlign AI API"
    APP_VERSION: str = "0.1.0"

    # === Server ===
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # === CORS ===
    CORS_ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite dev
        "http://localhost:3000",  # Alt dev
    ]

    # Try to load from env; add Client Origins URL if provided
    if os.getenv("CLIENT_ORIGINS_URL"):
        CORS_ALLOWED_ORIGINS.append(os.getenv("CLIENT_ORIGINS_URL"))


    # === Supabase ===
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_BUCKET: str = os.getenv("SUPABASE_BUCKET")

    # === Reducto ===
    REDUCTO_API_KEY: str = os.getenv("REDUCTO_API_KEY")
    REDUCTO_RES_PIPELINE_ID: str = os.getenv("REDUCTO_RES_PIPELINE_ID")
    REDUCTO_JD_PIPELINE_ID: str = os.getenv("REDUCTO_JD_PIPELINE_ID")

    # === OpenAI / LLM ===
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.5-pro")

    # === Resume Processing ===
    RESUME_MAX_SIZE_MB: int = int(os.getenv("RESUME_MAX_SIZE_MB", "10"))
    RESUME_CLEANUP_HOURS: int = int(os.getenv("RESUME_CLEANUP_HOURS", "24"))

    # === Feature Flags ===
    USE_GEVAL_SCORING: bool = os.getenv("USE_GEVAL_SCORING", "True").lower() == "true"
    USE_REDUCTO_EXTRACTION: bool = os.getenv(
        "USE_REDUCTO_EXTRACTION", "True"
    ).lower() == "true"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
