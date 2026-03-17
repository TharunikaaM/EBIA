"""
Controller for handling individual chat sessions tied to evaluation history.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from schemas.chat_request import ChatRequest
from schemas.chat_response import ChatResponse
from services.chat_service import ChatService
import logging

logger = logging.getLogger(__name__)

class ChatController:
    @staticmethod
    def handle_chat(db: Session, evaluation_id: int, user_email: str, request: ChatRequest) -> ChatResponse:
        """
        Orchestrates the chat response generation.
        """
        if not request.message or len(request.message.strip()) < 2:
            raise HTTPException(status_code=400, detail="Message is too short.")
            
        try:
            response_text = ChatService.generate_follow_up(db, evaluation_id, user_email, request.message)
            return ChatResponse(response=response_text)
        except Exception as e:
            logger.error(f"Error handling chat request: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error during chat generation.")
