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

class IdeaResponse(BaseModel):
    idea_id: str
    original_idea: str
    problem_statement: str
    refined_idea: str
    extracted_features: FeatureExtraction
    feasibility_score: int
    competitor_overview: List[CompetitorOverview]
    similar_ideas: List[str]
    key_features: List[str]
    user_pain_points: List[str]
    market_trends: List[str]
    risk_factors: List[str]
    monetization_suggestions: List[str]
    improvement_steps: List[str]
    ethical_flags: Optional[List[str]] = []
    status: str = "success"

class IdeaGenerateResponse(BaseModel):
    generated_idea: str
    evaluation: IdeaResponse
