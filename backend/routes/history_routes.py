from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, EvaluationHistory
from routes.auth_routes import get_current_user
import logging

router = APIRouter(prefix="/history", tags=["History"])
logger = logging.getLogger(__name__)

@router.get("/")
def get_user_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Retrieves all past evaluations for the logged-in user."""
    try:
        history = db.query(EvaluationHistory).filter(
            EvaluationHistory.user_email == current_user["email"]
        ).order_by(EvaluationHistory.created_at.desc()).all()
        
        # Format the results for the frontend
        return [
            {
                "id": h.id,
                "idea_text": h.idea_text,
                "analysis_results": h.analysis_results,
                "created_at": h.created_at
            }
            for h in history
        ]
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve history")
