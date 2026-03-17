"""
Main service orchestration for the EBIA Startup Intelligence pipeline.
Implements the Service layer of the Controller-Service-Repository pattern.
"""
import json
import logging
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session

from database import EvaluationHistory
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import (
    IdeaResponse, 
    IdeaGenerateResponse, 
    FeatureExtraction, 
    CompetitorOverview
)
from services.retrieval_service import RetrievalService
from services.scoring_service import calculate_idea_feasibility_score
from services.topic_service import mine_market_patterns_and_topics
from services.ethical_filter_service import audit_content_for_ethical_integrity
from services.llm_service import LLMService
from utils.text_cleaner import clean_text

logger = logging.getLogger(__name__)

class IdeaService:
    """
    Orchestrates the end-to-end evaluation and generation of startup concepts.
    """
    def __init__(self):
        self.retrieval_service = RetrievalService()

    def execute_startup_evaluation_pipeline(
        self, 
        request: IdeaRequest, 
        db: Session = None, 
        task_id: str = None
    ) -> IdeaResponse:
        """
        Executes the full RAG-based evaluation pipeline for a startup idea.
        Includes safety checks, retrieval, pattern mining, and LLM-driven insights.
        """
        def update_task_status(status_label: str, results: Dict = None, error_msg: str = None):
            """Updates the background task status in PostgreSQL."""
            if db and task_id:
                entry = db.query(EvaluationHistory).filter(EvaluationHistory.task_id == task_id).first()
                if entry:
                    if status_label == "COMPLETED":
                        entry.status = "COMPLETED"
                        entry.analysis_results = results
                    elif status_label == "FAILED":
                        entry.status = "FAILED"
                        entry.error_message = error_msg
                    else:
                        entry.status = status_label
                    db.commit()

        raw_idea_text = request.idea
        cleaned_idea_text = clean_text(raw_idea_text)
        
        # 1. Ethical Safety Check (Input Validation)
        update_task_status("Performing Ethical Safety Check")
        
        user_email = None
        if db and task_id:
            entry = db.query(EvaluationHistory).filter(EvaluationHistory.task_id == task_id).first()
            if entry:
                user_email = entry.user_email
                
        safety_audit = audit_content_for_ethical_integrity(raw_idea_text, db=db, user_email=user_email)
        
        if safety_audit["is_refusal"]:
            update_task_status("FAILED", error_msg=safety_audit["educational_reason"])
            return self._generate_refusal_response(raw_idea_text, safety_audit)

        ethical_flags = safety_audit.get("flags", [])
        
        # 2. Market Evidence Retrieval (Public Data Only)
        update_task_status("Retrieving Market Evidence")
        market_evidence = self.retrieval_service.retrieve_market_evidence(cleaned_idea_text, top_k=3)
        
        # Prepare context and evidence mapping
        evidence_context = ""
        structured_evidence = []
        for i, doc in enumerate(market_evidence):
            source_id = i + 1
            evidence_context += f"\n[Source {source_id}]: {doc.get('title')}\n{doc.get('content')}\n"
            
            # Map distance to confidence (0.0 - 1.0)
            distance = doc.get("_distance", 1.0)
            confidence = max(0.0, min(1.0, 1.0 - (distance / 1.5))) 
            
            structured_evidence.append({
                "source_id": f"Source {source_id}",
                "source_title": doc.get("title"),
                "content": doc.get("content")[:200] + "...",
                "confidence_score": round(confidence, 2)
            })

        # 3. Topic & Pattern Mining
        update_task_status("Analyzing Market Patterns")
        market_patterns = mine_market_patterns_and_topics(raw_idea_text, contextual_documents=market_evidence)
        
        # 4. LLM Synthesis & Analysis
        update_task_status("Synthesizing Strategic Insights")
        analysis_prompt = self._build_analysis_prompt(raw_idea_text, evidence_context)
        
        try:
            llm_raw_response = LLMService.generate(analysis_prompt, json_format=True)
            llm_data = json.loads(llm_raw_response.replace('```json', '').replace('```', '').strip())
            
            # 5. Deterministic Feasibility Scoring
            scoring_result = calculate_idea_feasibility_score(raw_idea_text, market_evidence)
            
            # Map LLM result to Response Schema
            response = IdeaResponse(
                original_idea=raw_idea_text,
                refined_idea=llm_data.get("refined_idea", raw_idea_text),
                extracted_features=FeatureExtraction(
                    domain=llm_data.get("domain", request.domain or "General"),
                    target_users=llm_data.get("target_users", "Broad Market"),
                    core_problem=llm_data.get("core_problem", "Unmet Need")
                ),
                feasibility_score=scoring_result["score"],
                feasibility_reasoning=scoring_result["reasoning"],
                competitor_overview=[CompetitorOverview(**c) for c in llm_data.get("competitors", [])],
                user_pain_points=list(set(llm_data.get("pain_points", []) + market_patterns.get("user_pain_points", []))),
                market_trends=list(set(llm_data.get("market_trends", []) + market_patterns.get("market_trends", []))),
                risk_factors=llm_data.get("risk_factors", []),
                monetization_suggestions=llm_data.get("monetization", []),
                improvement_steps=list(set(llm_data.get("improvements", []) + market_patterns.get("key_features", []))),
                supporting_evidence=structured_evidence,
                ethical_flags=ethical_flags,
                status="success" if not ethical_flags else "warning"
            )

            # Final Output Safety Check
            advice_blob = f"{response.refined_idea} {' '.join(response.improvement_steps)}"
            output_safety = audit_content_for_ethical_integrity(advice_blob, is_generated_advice=True, db=db, user_email=user_email)
            if not output_safety["is_safe"]:
                response.ethical_flags = list(set(response.ethical_flags + output_safety["flags"]))
                if output_safety.get("correction_path"):
                    response.correction_path = output_safety["correction_path"]

            update_task_status("COMPLETED", results=response.dict())
            return response

        except Exception as e:
            logger.error(f"Critical Failure in Evaluation Pipeline: {e}")
            update_task_status("FAILED", error_msg=str(e))
            raise e

    def propose_new_concept(self, request: IdeaGenerateRequest) -> IdeaGenerateResponse:
        """
        Synthesizes a new startup concept based on market parameters.
        """
        prompt = f"""
        Suggest a viable, high-potential startup idea based on:
        Type: {request.business_type}
        Location: {request.location}
        Budget: {request.budget}
        
        Return JSON structure: {{"idea_description": "...", "domain": "..."}}
        """
        
        try:
            llm_response = LLMService.generate(prompt, json_format=True)
            data = json.loads(llm_response.replace('```json', '').replace('```', '').strip())
            
            # Evaluate the generated concept
            eval_request = IdeaRequest(idea=data["idea_description"], domain=data["domain"])
            evaluation = self.execute_startup_evaluation_pipeline(eval_request)
            
            return IdeaGenerateResponse(
                generated_idea=data["idea_description"],
                evaluation=evaluation
            )
        except Exception as e:
            logger.error(f"Error proposing new concept: {e}")
            raise e

    def _generate_refusal_response(self, idea_text: str, audit: Dict) -> IdeaResponse:
        """Generates a standardized refusal response for unethical inputs."""
        return IdeaResponse(
            original_idea=idea_text,
            refined_idea="Idea Refused",
            extracted_features=FeatureExtraction(domain="N/A", target_users="N/A", core_problem="N/A"),
            feasibility_score=0,
            feasibility_reasoning=audit["educational_reason"],
            competitor_overview=[],
            user_pain_points=[],
            market_trends=[],
            risk_factors=[],
            monetization_suggestions=[],
            improvement_steps=[],
            ethical_flags=audit["flags"],
            status="refusal"
        )

    def _build_analysis_prompt(self, idea: str, evidence: str) -> str:
        """Constructs the master synthesis prompt for the LLM."""
        return f"""
        Role: Senior Startup Strategist.
        Task: Analyze the idea below using Public Market Evidence. 
        Cite sources like [Source 1], [Source 2] for all derived insights.
        
        Idea: {idea}
        Market Evidence:
        {evidence}
        
        Output JSON:
        {{
            "domain": "string",
            "target_users": "string",
            "core_problem": "string",
            "refined_idea": "string",
            "competitors": [
                {{"competitor_name": "string", "strengths": ["string"], "weaknesses": ["string"], "strategic_impact": "string"}}
            ],
            "pain_points": ["string with citation"],
            "market_trends": ["string with citation"],
            "risk_factors": ["string with citation"],
            "monetization": ["string"],
            "improvements": ["string"]
        }}
        """
