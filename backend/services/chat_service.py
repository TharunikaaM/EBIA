"""
Service for handling continuous chat related to a specific idea.
"""
from schemas.chat_schemas import ChatRequest, ChatResponse
from models.database import SessionLocal
from models.idea import IdeaModel
from models.chat import ChatHistoryModel
from repositories.chat_repository import ChatRepository
from repositories.idea_repository import IdeaRepository
from infrastructure.llm.base import LLMProvider
import logging
import json

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self, chat_repository: ChatRepository, idea_repository: IdeaRepository, llm_provider: LLMProvider):
        self.chat_repository = chat_repository
        self.idea_repository = idea_repository
        self.llm_provider = llm_provider

    def process_chat(self, idea_id: str, request: ChatRequest, user_id: str) -> ChatResponse:
        try:
            idea_record = self.idea_repository.get_by_id(idea_id)
            if not idea_record:
                raise ValueError(f"Idea with ID {idea_id} not found.")

            # Load chat history
            history_records = self.chat_repository.get_history_by_idea(idea_id, user_id)
            
            history_context = ""
            for record in history_records:
                history_context += f"\n[{record.role.upper()}]: {record.message}"

            # Save user message
            self.chat_repository.add_message(idea_id, user_id, "user", request.message)

            # Compile prompt
            prompt = f"""
            You are an expert startup advisor assisting the user with their startup idea.
            
            Idea: {idea_record.idea}
            Evaluation Data: {json.dumps(idea_record.evaluation_result)}
            Chat History: {history_context}
            User message: {request.message}
            
            Respond directly as a strategist. Provide actionable advice. Concise.
            """
            
            llm_response = self.llm_provider.generate(prompt, json_format=False)
            
            # Save assistant message
            self.chat_repository.add_message(idea_id, user_id, "assistant", llm_response)
            
            return ChatResponse(
                idea_id=idea_id,
                role="assistant",
                message=llm_response
            )
        except Exception as e:
            logger.error(f"Chat service error: {e}")
            raise e
