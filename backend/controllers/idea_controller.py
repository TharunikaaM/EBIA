"""
Controller handling the business logic delegation for Idea processing.
"""
from fastapi import HTTPException
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse
from services.idea_service import IdeaService
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

class IdeaController:
    def __init__(self):
        self.service = IdeaService()

    def process_idea(self, request: IdeaRequest, db: Session = None, user_email: str = None) -> IdeaResponse:
        """
        Validates request and delegates to IdeaService.
        """
        if not request.idea or len(request.idea.strip()) < 10:
            raise HTTPException(status_code=400, detail="Idea is too short to evaluate.")
            
        try:
            result = self.service.evaluate_idea(request)
            if db and user_email:
                self.service.save_evaluation(db, user_email, request.idea, result)
            return result
        except Exception as e:
            logger.error(f"Error evaluating idea: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error during evaluation.")

    def generate_idea(self, request: IdeaGenerateRequest, db: Session = None, user_email: str = None) -> IdeaGenerateResponse:
        """
        Validates generation request and delegates to IdeaService.
        """
        if not request.business_type or not request.location or not request.budget:
            raise HTTPException(status_code=400, detail="All generation parameters are required.")
            
        try:
            result = self.service.generate_idea(request)
            if db and user_email:
                self.service.save_evaluation(db, user_email, result.generated_idea, result.evaluation)
            return result
        except Exception as e:
            logger.error(f"Error generating idea: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error during generation.")
