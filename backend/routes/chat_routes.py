from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.chat_request import ChatRequest
from schemas.chat_response import ChatResponse
from controllers.chat_controller import ChatController
from database import get_db
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat Advisor"])
controller = ChatController()

@router.post(
    "/{evaluation_id}", 
    response_model=ChatResponse,
    summary="Startup Improvement Discussion",
    description="Engage with the Lotus-Logic advisor for evidence-based refinements of your startup idea."
)
def startup_improvement_discussion(
    evaluation_id: int,
    request: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    return controller.handle_chat(
        db=db, 
        evaluation_id=evaluation_id, 
        user_email=current_user["email"], 
        request=request
    )
