from typing import List, Dict, Any
import json
import logging
from services.llm_service import LLMService
from schemas.pivot_response import PivotResponse, PivotSuggestion, BudgetDetails

logger = logging.getLogger(__name__)

class PivotService:
    @staticmethod
    def generate_pivots(
        original_idea: str, 
        domain: str, 
        analysis_results: Dict[str, Any],
        location: str = "Global"
    ) -> PivotResponse:
        """
        Generates 3 evidence-based pivot suggestions with dynamic budgeting grounded in Location and Business Type.
        """
        # Extract extracted features for more grounding if available
        features = analysis_results.get("extracted_features", {})
        target_users = features.get("target_users", "N/A")
        
        prompt = f"""
        Role: Senior Startup Strategist & Financial Architect
        Task: Synthesize 3 strategic pivots for a startup concept in the {domain} sector.
        Context: The user is operating in {location}.
        
        Original Business Concept: {original_idea}
        Target Users: {target_users}
        
        Evidence-Based Grounding (Market Pain Points):
        {json.dumps(analysis_results.get('user_pain_points', []), indent=2)}
        
        Objectives:
        1. Pivot Identification: Propose 3 distinct, high-potential execution paths that solve the core problem but diverge from the original concept.
        2. Financial Modeling: Provide realistic budget estimates grounded in the regional reality of {location} for a {domain} business.
        3. Strategic Justification: Explicitly link each pivot to the "Evidence" provided.
        
        Strict Privacy Constraints:
        - Suggestions MUST only draw from Public market data.
        - NEVER reference internal user details marked as Private in the suggestions.
        
        Output Format: Strict JSON matching the PivotResponse schema.
        Budget Details must include "mvp_budget" and "scaling_budget" as structured strings with currency.
        
        Schema Template:
        {{
            "original_idea": "{original_idea}",
            "pivots": [
                {{
                    "idea_description": "Descriptive title and summary",
                    "strategic_advantage": "Why this path succeeds based on the specific market gaps identified",
                    "budget_details": {{
                        "mvp_budget": "[Local Currency] Amount (Reasoning for local costs)",
                        "scaling_budget": "[Local Currency] Amount (Reasoning for local growth)",
                        "resource_allocation": ["Alloc 1", "Alloc 2", "Alloc 3"]
                    }}
                }}
            ]
        }}
        """
        
        try:
            raw_response = LLMService.generate(prompt, json_format=True)
            cleaned_json = raw_response.replace('```json', '').replace('```', '').strip()
            result_data = json.loads(cleaned_json)
            
            # Ensure Pydantic validation
            return PivotResponse(**result_data)
            
        except Exception as e:
            logger.error(f"Strategic pivot synthesis failed for {location}/{domain}: {e}")
            return PivotResponse(original_idea=original_idea, pivots=[])
