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
                "budget": "<₹5 Lakhs"
            }
        }

class IdeaGenerateRequest(BaseModel):
    business_type: str = Field(..., description="E.g., B2B SaaS, E-commerce, EdTech")
    location: Optional[str] = Field(default="Global", description="Target market location (e.g., India, US, Global)")
    budget: Optional[str] = Field(default="Flexible", description="Available capital (e.g., <₹5 Lakhs, Flexible)")
    business_model: Optional[str] = Field(default=None, description="Preferred revenue model (e.g., Subscription, Marketplace)")
    existing_ideas: Optional[list[str]] = Field(default=None, description="List of already generated ideas to avoid repeating")
    
    class Config:
        json_schema_extra = {
            "example": {
                "business_type": "Marketplace",
                "location": "Urban Europe",
                "budget": "₹1L-₹5L",
                "business_model": "Subscription"
            }
        }
