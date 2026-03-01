"""
Configuration settings for the EBIA application.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EBIA - Evidence-Based Improvement Advisor"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = "data/faiss_index.bin"
    DATA_PATH: str = "data/sample_documents.json"
    
    # Simulate an external or local LLM connection
    OLLAMA_API_URL: str = "http://localhost:11434/api/generate"
    OLLAMA_MODEL_NAME: str = "llama3"

    class Config:
        env_file = ".env"

settings = Settings()
