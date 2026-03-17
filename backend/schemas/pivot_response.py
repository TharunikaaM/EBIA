from pydantic import BaseModel
from typing import List, Optional

class BudgetDetails(BaseModel):
    mvp_budget: str
    scaling_budget: str
    resource_allocation: List[str]

class PivotSuggestion(BaseModel):
    idea_description: str
    strategic_advantage: str
    budget_details: BudgetDetails

class PivotResponse(BaseModel):
    original_idea: str
    pivots: List[PivotSuggestion]
