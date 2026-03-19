from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime

class SavedIdeaRequest(BaseModel):
    title: str
    content: Dict[str, Any]

class SavedIdeaResponse(BaseModel):
    id: int
    title: str
    content: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
