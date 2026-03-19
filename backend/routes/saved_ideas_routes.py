from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, SavedIdea
from routes.auth_routes import get_current_user
from schemas.saved_idea import SavedIdeaRequest, SavedIdeaResponse
import logging

router = APIRouter(prefix="/saved-ideas", tags=["Saved Ideas"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=SavedIdeaResponse)
def save_idea(
    request: SavedIdeaRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Saves a generated idea for the user."""
    try:
        new_saved_idea = SavedIdea(
            user_email=current_user["email"],
            title=request.title,
            content=request.content
        )
        db.add(new_saved_idea)
        db.commit()
        db.refresh(new_saved_idea)
        return new_saved_idea
    except Exception as e:
        logger.error(f"Error saving idea: {e}")
        raise HTTPException(status_code=500, detail="Could not save idea")

@router.get("/", response_model=List[SavedIdeaResponse])
def get_saved_ideas(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieves all saved ideas for the user."""
    try:
        return db.query(SavedIdea).filter(
            SavedIdea.user_email == current_user["email"]
        ).order_by(SavedIdea.created_at.desc()).all()
    except Exception as e:
        logger.error(f"Error fetching saved ideas: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve saved ideas")

@router.delete("/{idea_id}")
def delete_saved_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletes a saved idea."""
    idea = db.query(SavedIdea).filter(
        SavedIdea.id == idea_id,
        SavedIdea.user_email == current_user["email"]
    ).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
        
    db.delete(idea)
    db.commit()
    return {"message": "Idea deleted successfully"}
