from pydantic import BaseModel, Field
from typing import Optional

class PivotRequest(BaseModel):
    """
    Schema for strategic pivot discovery requests.
    """
    evaluation_id: int = Field(..., description="The ID of the historical evaluation to pivot from.")
    business_type: Optional[str] = Field(None, description="Optional override for business type to refine budgeting.")
    location: Optional[str] = Field(None, description="Optional override for location to refine regional budgeting.")
