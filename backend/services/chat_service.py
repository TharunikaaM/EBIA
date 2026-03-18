"""
Service for managing iterative chat discussions around startup ideas.
"""
import logging
from sqlalchemy.orm import Session
from database import EvaluationHistory
from services.llm_service import LLMService
from services.retrieval_service import RetrievalService

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

        # 2. Perform fresh retrieval for the user's message (Searching the network)
        retrieval_service = RetrievalService()
        new_evidence = retrieval_service.retrieve_market_evidence(user_message, top_k=3)
        
        fresh_context = ""
        for i, doc in enumerate(new_evidence):
            source_id = i + 1
            fresh_context += f"\n- {doc.get('title')}: {doc.get('content')}\n"

        # 3. Construct the Simplified Advisor Prompt
        system_prompt = f"""
        You are a helpful and friendly Startup Assistant. Your goal is to help the user improve their business idea using simple, everyday language.
        
        Information you previously found:
        - Original Idea: {original_idea}
        - Refined Concept: {refined_idea}
        - Potential Risks: {', '.join(risk_factors)}
        
        New Information found after searching the network for '{user_message}':
        {fresh_context if fresh_context else "No specific new details found, but I can still help based on what I know."}

        Instructions:
        - Speak like a friendly human, not a formal advisor. 
        - Be direct, concise, and clear. 
        - Avoid business jargon (like "USP", "monetization", "mitigate"). Use "benefit", "making money", or "fixing problems" instead.
        - If the new information contains real companies or examples (like IT firms in Erode), mention them to be more helpful.
        - Answer the user's question directly.

        User's question: {user_message}
        """

        try:
            # 3. Generate response using LLMService
            response = LLMService.generate(system_prompt, json_format=False)
            return response
        except Exception as e:
            logger.error(f"Error in ChatService follow-up: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."
