from typing import List, Dict, Any
import json
import logging
from services.llm_service import LLMService
from schemas.pivot_response import PivotResponse, PivotSuggestion, BudgetDetails
from config.prompts import PromptConfig

logger = logging.getLogger(__name__)

class PivotService:
    @staticmethod
    async def generate_pivots(
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
        
        prompt = PromptConfig.get_strategic_pivot_prompt(
            original_idea=original_idea, 
            domain=domain, 
            target_users=target_users, 
            analysis_results=analysis_results, 
            location=location
        )
        
        try:
            raw_response = await LLMService.generate(prompt, json_format=True)
            cleaned_json = raw_response.replace('```json', '').replace('```', '').strip()
            result_data = json.loads(cleaned_json)
            
            # Ensure Pydantic validation
            return PivotResponse(**result_data)
            
        except Exception as e:
            logger.error(f"Strategic pivot synthesis failed for {location}/{domain}: {e}")
            return PivotResponse(original_idea=original_idea, pivots=[])
