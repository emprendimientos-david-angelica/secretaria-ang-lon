from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://secretaria_user:secretaria_password@localhost:5432/secretaria_db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    class Config:
        env_file = ".env"

settings = Settings()
