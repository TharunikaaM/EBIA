from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse
from controllers.idea_controller import IdeaController
from database import get_db
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/idea", tags=["Idea Evaluation"])
controller = IdeaController()

@router.post("/evaluate", response_model=IdeaResponse)
def evaluate_startup_idea(
    request: IdeaRequest, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Evaluates a startup idea and returns a comprehensive evidence-based advisory report.
    """
    return controller.process_idea(request, db=db, user_email=current_user["email"])

@router.post("/generate", response_model=IdeaGenerateResponse)
def generate_startup_idea(
    request: IdeaGenerateRequest, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a new startup idea based on parameters and then evaluates it.
    """
    return controller.generate_idea(request, db=db, user_email=current_user["email"])
