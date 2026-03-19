"""
Controller handling the business logic delegation for Idea processing.
"""
from fastapi import HTTPException, BackgroundTasks
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse, AsyncEvaluationResponse
from services.idea_service import IdeaService
from services.pivot_service import PivotService
from schemas.pivot_response import PivotResponse
from sqlalchemy.orm import Session
from database import EvaluationHistory
import uuid
import logging

logger = logging.getLogger(__name__)

class IdeaController:
    def __init__(self):
        self.service = IdeaService()

    def process_idea_async(self, request: IdeaRequest, db: Session, user_email: str, background_tasks: BackgroundTasks) -> AsyncEvaluationResponse:
        """
        Starts an evaluation task in the background using the refactored pipeline.
        """
        if not request.idea or len(request.idea.strip()) < 10:
            raise HTTPException(status_code=400, detail="Idea is too short to evaluate.")
            
        task_id = str(uuid.uuid4())
        
        # Create initial pending entry (is_private defaults to value from request)
        new_entry = EvaluationHistory(
            task_id=task_id,
            user_email=user_email,
            idea_text=request.idea,
            status="PENDING",
            is_private=request.is_private
        )
        db.add(new_entry)
        db.commit()

        # Add background task using a fresh session (None triggers SessionLocal in service)
        background_tasks.add_task(self.service.execute_startup_evaluation_pipeline, request, None, task_id)
        
        return AsyncEvaluationResponse(
            task_id=task_id,
            status="PENDING",
            message="Your strategic appraisal has been queued for processing."
        )

    def get_task_status(self, task_id: str, db: Session) -> dict:
        """
        Retrieves the definitive status of a background task.
        """
        entry = db.query(EvaluationHistory).filter(EvaluationHistory.task_id == task_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Requested evaluation task not found.")
            
        return {
            "id": entry.id,
            "task_id": entry.task_id,
            "status": entry.status,
            "error": entry.error_message,
            "results": entry.analysis_results
        }

    def handle_pivots(
        self, 
        evaluation_id: int, 
        db: Session, 
        user_email: str,
        location_override: str = None,
        business_type_override: str = None
    ) -> PivotResponse:
        """
        Orchestrates the discovery of strategic alternative concepts (pivots) for an existing evaluation.
        """
        entry = db.query(EvaluationHistory).filter(
            EvaluationHistory.id == evaluation_id,
            EvaluationHistory.user_email == user_email
        ).first()
        
        if not entry or not entry.analysis_results:
            raise HTTPException(status_code=404, detail="Primary evaluation results not found or processing incomplete.")
            
        return PivotService.generate_pivots(
            original_idea=entry.idea_text,
            domain=business_type_override or entry.analysis_results.get("extracted_features", {}).get("domain", "General"),
            analysis_results=entry.analysis_results,
            location=location_override or "Global"
        )
