"""
API Routing for the Idea endpoints.
"""
from fastapi import APIRouter
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse
from controllers.idea_controller import IdeaController

router = APIRouter(prefix="/idea", tags=["Idea Evaluation"])
controller = IdeaController()

@router.post("/evaluate", response_model=IdeaResponse)
def evaluate_startup_idea(request: IdeaRequest):
    """
    Evaluates a startup idea and returns a comprehensive evidence-based advisory report.
    """
    return controller.process_idea(request)

@router.post("/generate", response_model=IdeaGenerateResponse)
def generate_startup_idea(request: IdeaGenerateRequest):
    """
    Generates a new startup idea based on parameters and then evaluates it.
    """
    return controller.generate_idea(request)
