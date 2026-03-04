from sqlalchemy.orm import Session
from fastapi import Depends
from models.database import get_db
from config import settings

from infrastructure.llm.ollama_provider import OllamaProvider
from repositories.user_repository import UserRepository
from repositories.idea_repository import IdeaRepository
from repositories.chat_repository import ChatRepository
from services.idea_service import IdeaService
from services.chat_service import ChatService
from services.auth_service import AuthService

# --- LLM Provider ---
def get_llm_provider() -> OllamaProvider:
    return OllamaProvider(
        base_url=settings.OLLAMA_BASE_URL,
        model_name=settings.OLLAMA_MODEL_NAME
    )

# --- Repositories ---
def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_idea_repository(db: Session = Depends(get_db)) -> IdeaRepository:
    return IdeaRepository(db)

def get_chat_repository(db: Session = Depends(get_db)) -> ChatRepository:
    return ChatRepository(db)

# --- Services ---
def get_idea_service(
    idea_repo: IdeaRepository = Depends(get_idea_repository),
    llm: OllamaProvider = Depends(get_llm_provider)
) -> IdeaService:
    return IdeaService(idea_repo, llm)

def get_chat_service(
    chat_repo: ChatRepository = Depends(get_chat_repository),
    idea_repo: IdeaRepository = Depends(get_idea_repository),
    llm: OllamaProvider = Depends(get_llm_provider)
) -> ChatService:
    return ChatService(chat_repo, idea_repo, llm)

def get_auth_service(user_repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(user_repo, settings.GOOGLE_CLIENT_ID)
