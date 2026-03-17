"""
Pydantic schemas for response models.
"""
from pydantic import BaseModel
from typing import List, Optional

class FeatureExtraction(BaseModel):
    domain: str
    target_users: str
    core_problem: str

class CompetitorOverview(BaseModel):
    competitor_name: str
    strengths: List[str]
    weaknesses: List[str]
    strategic_impact: str # New: Why they matter for the proposed idea

class EvidenceSnippet(BaseModel):
    content: str
    source_title: str
    confidence_score: float

class IdeaResponse(BaseModel):
    original_idea: str
    refined_idea: str
    extracted_features: FeatureExtraction
    feasibility_score: int
    feasibility_reasoning: str
    competitor_overview: List[CompetitorOverview]
    user_pain_points: List[str]
    market_trends: List[str]
    risk_factors: List[str]
    monetization_suggestions: List[str]
    improvement_steps: List[str]
    supporting_evidence: Optional[List[EvidenceSnippet]] = [] # New: Link back to FAISS docs
    correction_path: Optional[str] = None # New: Ethical mitigation advice
    ethical_flags: Optional[List[str]] = []
    status: str = "success"

class AsyncEvaluationResponse(BaseModel):
    task_id: str
    status: str
    message: str

class IdeaGenerateResponse(BaseModel):
    generated_idea: str
    evaluation: IdeaResponse
