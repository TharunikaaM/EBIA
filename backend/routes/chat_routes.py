from fastapi import APIRouter, HTTPException, Depends, Header
from schemas.chat_schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService
from dependencies import get_chat_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chatbot Continuity"])

@router.post("/{idea_id}", response_model=ChatResponse)
def continue_chat(
    idea_id: str, 
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
    x_user_id: str = Header(..., alias="X-User-ID")
):
    """
    Continues a chat conversation around a specific evaluated idea.
    """
    if not request.message or len(request.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
        
    try:
        return service.process_chat(idea_id, request, x_user_id)
    except Exception as e:
        logger.error(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
