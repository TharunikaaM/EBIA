from pydantic import BaseModel, Field
from typing import Optional

class IdeaRequest(BaseModel):
    idea_id: Optional[str] = Field(None, description="Optional idea ID to re-evaluate an existing idea.")
    idea: str = Field(..., description="The startup idea in natural language.")
    domain: Optional[str] = Field(None, description="Optional domain of the idea.")
    is_private: bool = Field(False, description="Flag to keep the idea private.")
    
    class Config:
        json_schema_extra = {
            "example": {
                "idea": "An app that connects local farmers directly to high-end restaurants for daily fresh deliveries.",
                "domain": "AgriTech",
                "is_private": True
            }
        }

class IdeaGenerateRequest(BaseModel):
    business_type: str = Field(..., description="Type of business (e.g., SaaS, E-commerce, Marketplace).")
    location: str = Field(..., description="Target location or market (e.g., Urban US, Global, Rural India).")
    budget: str = Field(..., description="Investment budget (e.g., Bootstrapped, $10k-$50k, VC Funding).")
    
    class Config:
        json_schema_extra = {
            "example": {
                "business_type": "Marketplace",
                "location": "Urban Europe",
                "budget": "$10k-$50k"
            }
        }
