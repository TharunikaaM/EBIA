"""
Service for managing iterative chat discussions around startup ideas.
"""
import logging
from sqlalchemy.orm import Session
from database import EvaluationHistory
from services.llm_service import LLMService

logger = logging.getLogger(__name__)

class ChatService:
    @staticmethod
    def generate_follow_up(db: Session, evaluation_id: int, user_email: str, user_message: str) -> str:
        """
        Generates a follow-up response based on previous evaluation results.
        """
        # 1. Retrieve the previous evaluation
        history = db.query(EvaluationHistory).filter(
            EvaluationHistory.id == evaluation_id,
            EvaluationHistory.user_email == user_email
        ).first()

        if not history:
            return "Evaluation history not found or access denied."

        analysis = history.analysis_results
        original_idea = history.idea_text
        refined_idea = analysis.get("refined_idea", original_idea)
        
        # Extract context fields for grounding
        pain_points = analysis.get("user_pain_points", [])
        risk_factors = analysis.get("risk_factors", [])
        market_trends = analysis.get("market_trends", [])
        feasibility_score = analysis.get("feasibility_score", "N/A")
        feasibility_reasoning = analysis.get("feasibility_reasoning", "")

        # 2. Construct the Improvement Advisor Prompt
        system_prompt = f"""
        You are the EBIA (Evidence-Based Improvement Advisor) Chatbot. 
        Your goal is to guide the user in refining their startup idea by being an ethical, explainable, and constructive "Improvement Advisor."
        
        Context of the initial evaluation:
        - Original Idea: {original_idea}
        - Refined Concept: {refined_idea}
        - Feasibility Score: {feasibility_score}/100
        - Feasibility Reasoning: {feasibility_reasoning}
        - User Pain Points: {', '.join(pain_points)}
        - Risk Factors: {', '.join(risk_factors)}
        - Market Trends: {', '.join(market_trends)}

        Instruction:
        - Maintain consistency with the initial report above.
        - Ground your response in the retrieved evidence (Pain Points, Risks).
        - Provide specific, actionable steps to mitigate the risks or solve the pain points mentioned.
        - Be encouraging but realistic. Avoid speculative claims not backed by the "Context" provided.
        - If the user asks a question unrelated to startup improvement or their specific idea, politely steer them back to the discussion.

        User's follow-up message: {user_message}
        """

        try:
            # 3. Generate response using LLMService
            response = LLMService.generate(system_prompt, json_format=False)
            return response
        except Exception as e:
            logger.error(f"Error in ChatService follow-up: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."
