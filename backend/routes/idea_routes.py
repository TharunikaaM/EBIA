from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse, AsyncEvaluationResponse
from schemas.pivot_response import PivotResponse
from schemas.pivot_request import PivotRequest
from controllers.idea_controller import IdeaController
from database import get_db
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/idea", tags=["Idea Evaluation"])
controller = IdeaController()

@router.post(
    "/evaluate", 
    response_model=AsyncEvaluationResponse,
    summary="Initiate Background Idea Appraisal",
    description="Starts a comprehensive RAG-based analysis of a startup idea. Returns a task ID for status polling."
)
def execute_startup_appraisal(
    request: IdeaRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    return controller.process_idea_async(request, db=db, user_email=current_user["email"], background_tasks=background_tasks)

@router.get(
    "/status/{task_id}",
    summary="Check Appraisal Task Status",
    description="Retrieves the current status and results (if completed) of a background appraisal task."
)
def check_appraisal_status(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return controller.get_task_status(task_id, db=db)

@router.post(
    "/generate", 
    response_model=IdeaGenerateResponse,
    summary="Synthesize Novel Concept",
    description="Generates a new business idea based on specified parameters and executes the full evaluation pipeline."
)
def synthesis_new_concept(
    request: IdeaGenerateRequest, 
    current_user: dict = Depends(get_current_user)
):
    return controller.service.propose_new_concept(request)

@router.post(
    "/pivot", 
    response_model=PivotResponse,
    summary="Discover Strategic Pivots",
    description="Generates 3 evidence-based pivot suggestions and budgets grounding them in public market data."
)
def discover_strategic_pivots(
    request: PivotRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return controller.handle_pivots(
        evaluation_id=request.evaluation_id, 
        db=db, 
        user_email=current_user["email"],
        location_override=request.location,
        business_type_override=request.business_type
    )
