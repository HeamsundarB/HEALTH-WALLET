import os
from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "HEALTH WALLET"
    TEAM_NAME: str = "MEDIMIND"
    TAGLINE: str = "One Patient. One Health Journey."
    API_V1_STR: str = "/api/v1"
    
    # Security Architecture Foundation
    SECRET_KEY: str = os.getenv("SECRET_KEY", "phase0-development-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ALGORITHM: str = "HS256"

    # Database Configuration Foundation
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://health_user:health_pass@localhost:5432/health_wallet_db"
    )

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
