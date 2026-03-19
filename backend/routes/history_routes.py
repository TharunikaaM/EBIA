from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db, EvaluationHistory
from routes.auth_routes import get_current_user
from schemas.chat_request import ChatRequest
from schemas.chat_response import ChatResponse
from schemas.history_update import HistoryUpdateRequest
from controllers.chat_controller import ChatController
from services.export_service import ExportService
import logging
from typing import List

router = APIRouter(prefix="/history", tags=["History"])
logger = logging.getLogger(__name__)

@router.get("/")
def get_user_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Retrieves past evaluations for the logged-in user (owner or public)."""
    try:
        # User sees their own history + any public ones they might have (if we add public feature)
        # For now, strictly owner-based as per "Privacy Toggle" requirement
        history = db.query(EvaluationHistory).filter(
            EvaluationHistory.user_email == current_user["email"]
        ).order_by(EvaluationHistory.created_at.desc()).all()
        
        return [
            {
                "id": h.id,
                "idea_title": h.custom_title or (h.analysis_results.get("refined_idea", h.idea_text[:50]) if h.analysis_results else h.idea_text[:50]),
                "idea_text": h.idea_text,
                "is_private": h.is_private,
                "analysis_results": h.analysis_results,
                "status": h.status,
                "feasibility_score": h.analysis_results.get("feasibility_score", 0) if h.analysis_results else 0,
                "created_at": h.created_at.strftime("%b %d, %Y") if h.created_at else "—"
            }
            for h in history
        ]
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve history")

@router.patch("/{evaluation_id}")
def update_history_entry(
    evaluation_id: int,
    request: HistoryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Updates custom title or privacy status of an evaluation."""
    entry = db.query(EvaluationHistory).filter(
        EvaluationHistory.id == evaluation_id,
        EvaluationHistory.user_email == current_user["email"]
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found or unauthorized")
        
    if request.custom_title is not None:
        entry.custom_title = request.custom_title
    if request.is_private is not None:
        entry.is_private = request.is_private
        
    db.commit()
    return {"message": "Updated successfully"}

@router.delete("/{evaluation_id}")
def delete_history_entry(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletes a specific evaluation entry."""
    entry = db.query(EvaluationHistory).filter(
        EvaluationHistory.id == evaluation_id,
        EvaluationHistory.user_email == current_user["email"]
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found or unauthorized")
        
    db.delete(entry)
    db.commit()
    return {"message": "Deleted successfully"}

@router.delete("/")
def clear_user_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletes ALL history for the logged-in user."""
    db.query(EvaluationHistory).filter(
        EvaluationHistory.user_email == current_user["email"]
    ).delete()
    db.commit()
    return {"message": "History cleared successfully"}

@router.post("/delete-multiple")
def delete_multiple_entries(
    ids: List[int],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletes multiple evaluation entries."""
    db.query(EvaluationHistory).filter(
        EvaluationHistory.id.in_(ids),
        EvaluationHistory.user_email == current_user["email"]
    ).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Deleted {len(ids)} entries successfully"}

@router.get("/{evaluation_id}/export")
def export_evaluation(
    evaluation_id: int,
    format: str = "markdown", # markdown or pdf
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Exports the evaluation results as MD or PDF."""
    entry = db.query(EvaluationHistory).filter(
        EvaluationHistory.id == evaluation_id,
        EvaluationHistory.user_email == current_user["email"]
    ).first()
    
    if not entry or not entry.analysis_results:
        raise HTTPException(status_code=404, detail="Results not ready or unauthorized")
        
    if format == "pdf":
        try:
            pdf_bytes = ExportService.generate_pdf(entry.analysis_results)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=EBIA_Report_{evaluation_id}.pdf"}
            )
        except Exception as e:
            logger.error(f"PDF Export failed: {e}")
            raise HTTPException(status_code=500, detail="Could not generate PDF. Please try Markdown.")
            
    # Default to Markdown
    md_content = ExportService.generate_markdown(entry.analysis_results)
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=EBIA_Report_{evaluation_id}.md"}
    )

@router.post("/{evaluation_id}/chat", response_model=ChatResponse)
def chat_with_history(
    evaluation_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Initiates a grounded chat discussion based on a specific evaluation."""
    return ChatController.handle_chat(db, evaluation_id, current_user["email"], request)
