"""
Configuration settings for the EBIA application.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EBIA - Evidence-Based Improvement Advisor"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = "data/faiss_index.bin"
    DATA_PATH: str = "data/sample_documents.json"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    SECRET_KEY: str = "your-secret-key-here"
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/ebia.db"
    
    # Ollama Local LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL_NAME: str = "llama3"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"

    class Config:
        env_file = ".env"

settings = Settings()
