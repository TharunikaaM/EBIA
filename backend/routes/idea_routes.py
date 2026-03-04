"""
API Routing for the Idea endpoints.
"""
from fastapi import APIRouter, Depends, Header
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse
from controllers.idea_controller import IdeaController
from services.idea_service import IdeaService
from dependencies import get_idea_service

router = APIRouter(prefix="/idea", tags=["Idea Evaluation"])

def get_controller(service: IdeaService = Depends(get_idea_service)) -> IdeaController:
    return IdeaController(service)

@router.post("/evaluate", response_model=IdeaResponse)
def evaluate_startup_idea(
    request: IdeaRequest, 
    controller: IdeaController = Depends(get_controller),
    x_user_id: str = Header(..., alias="X-User-ID")
):
    """
    Evaluates a startup idea and returns a comprehensive report.
    """
    return controller.process_idea(request, x_user_id)

@router.post("/generate", response_model=IdeaGenerateResponse)
def generate_startup_idea(
    request: IdeaGenerateRequest,
    controller: IdeaController = Depends(get_controller),
    x_user_id: str = Header(..., alias="X-User-ID")
):
    """
    Generates a new startup idea based on parameters and then evaluates it.
    """
    return controller.generate_idea(request, x_user_id)
