from pydantic import BaseModel, Field
from typing import Optional

class IdeaRequest(BaseModel):
    idea: str = Field(..., description="The startup idea in natural language.")
    domain: Optional[str] = Field(None, description="Optional domain of the idea.")
    location: Optional[str] = Field(None, description="Target location.")
    budget: Optional[str] = Field(None, description="Investment budget.")
    is_private: bool = Field(False, description="Whether to keep the evaluation private.")
    
    class Config:
        json_schema_extra = {
            "example": {
                "idea": "An app that connects local farmers directly to high-end restaurants for daily fresh deliveries.",
                "domain": "AgriTech",
                "location": "Local",
                "budget": "<$50k"
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
