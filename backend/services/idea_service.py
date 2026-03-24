"""
Main service orchestration for the EBIA Startup Intelligence pipeline.
Implements the Service layer of the Controller-Service-Repository pattern.
"""
import json
import re
import logging
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session

from database import EvaluationHistory, SessionLocal
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
from config.prompts import PromptConfig

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
        # Use a fresh session if none provided (crucial for background tasks)
        internal_db = db if db is not None else SessionLocal()
        
        def update_task_status(status_label: str, results: Dict = None, error_msg: str = None):
            """Updates the background task status in PostgreSQL."""
            if task_id:
                try:
                    entry = internal_db.query(EvaluationHistory).filter(EvaluationHistory.task_id == task_id).first()
                    if entry:
                        if status_label == "COMPLETED":
                            entry.status = "COMPLETED"
                            entry.analysis_results = results
                        elif status_label == "FAILED":
                            entry.status = "FAILED"
                            entry.error_message = error_msg
                        else:
                            entry.status = status_label
                        internal_db.commit()
                except Exception as e:
                    logger.error(f"Failed to update task status: {e}")

        try:
            raw_idea_text = request.idea
            cleaned_idea_text = clean_text(raw_idea_text)
            
            # Phase 1: Ethical safety check
            update_task_status("Reading your idea carefully")
            
            user_email = None
            if task_id:
                entry = internal_db.query(EvaluationHistory).filter(EvaluationHistory.task_id == task_id).first()
                if entry:
                    user_email = entry.user_email
                    
            safety_audit = audit_content_for_ethical_integrity(raw_idea_text, db=internal_db, user_email=user_email)
            if safety_audit["is_refusal"]:
                update_task_status("FAILED", error_msg=safety_audit["educational_reason"])
                return self._generate_refusal_response(raw_idea_text, safety_audit)

            # Phase 2: Context-aware evidence retrieval
            update_task_status("Searching market data and trends")
            market_evidence = self.retrieval_service.retrieve_market_evidence(
                cleaned_idea_text, 
                domain=request.domain, 
                location=request.location, 
                top_k=3
            )
            structured_evidence, evidence_context = self._process_market_evidence(market_evidence)

            # Phase 3: Pattern & Topic Mining
            update_task_status("Spotting patterns and competitors")
            market_patterns = mine_market_patterns_and_topics(raw_idea_text, contextual_documents=market_evidence)
            
            # Phase 4: Strategic LLM Synthesis
            update_task_status("Building your evaluation report")
            analysis_prompt = self._build_analysis_prompt(
                raw_idea_text, 
                evidence_context,
                domain=request.domain,
                location=request.location,
                budget=request.budget
            )
            
            llm_raw_response = LLMService.generate(analysis_prompt, json_format=True)
            llm_data = IdeaService._extract_json(llm_raw_response)
            
            # Phase 5: Deterministic Scoring & Hybrid Logic
            scoring_result = calculate_idea_feasibility_score(raw_idea_text, market_evidence)
            hybrid_score = self._calculate_hybrid_score(llm_data, scoring_result)

            # Phase 6: Response Assembly & Final Audit
            response = self._map_to_idea_response(
                raw_idea_text, 
                llm_data, 
                scoring_result, 
                hybrid_score, 
                market_patterns, 
                structured_evidence, 
                safety_audit
            )

            # Post-Generation Integrity Check
            response = self._perform_output_audit(response, internal_db, user_email)

            update_task_status("COMPLETED", results=response.dict())
            return response

        except Exception as e:
            logger.error(f"Critical Failure in Evaluation Pipeline: {e}")
            update_task_status("FAILED", error_msg=str(e))
        finally:
            if db is None: # We created our own session, so we close it
                internal_db.close()

    @staticmethod
    def _extract_json(llm_response: str) -> dict:
        """
        Robustly extracts a JSON object from an LLM response.
        Handles responses wrapped in markdown code fences or containing surrounding text.
        Raises ValueError if no valid JSON block is found.
        """
        # First try: the response is clean JSON
        try:
            return json.loads(llm_response.strip())
        except json.JSONDecodeError:
            pass
        
        # Second try: extract the first {...} block using regex (handles ```json ... ``` wrappers)
        json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Could not extract valid JSON from LLM response. Raw output: {llm_response[:300]}")

    def propose_new_concept(self, request: IdeaGenerateRequest) -> IdeaGenerateResponse:
        """
        Synthesizes 3 distinct startup concepts based on market parameters.
        """
        prompt = PromptConfig.get_idea_synthesis_prompt(
            request_business_type=request.business_type,
            request_location=request.location,
            request_budget=request.budget,
            request_business_model=request.business_model,
            existing_ideas=request.existing_ideas
        )
        
        try:
            llm_response = LLMService.generate(prompt, json_format=True)
            logger.info(f"RAW GROQ OUTPUT: {llm_response}")
            data = IdeaService._extract_json(llm_response)
            
            if "error" in data:
                from fastapi import HTTPException
                raise HTTPException(status_code=503, detail=data.get("reason", "LLM Generation failed"))
                
            ideas = data.get("ideas", [])
            if not ideas:
                from fastapi import HTTPException
                raise HTTPException(status_code=503, detail="AI returned an invalid format. Please try generating again.")
                
            return IdeaGenerateResponse(
                ideas=data.get("ideas", []),
                constraints={
                    "business_type": request.business_type,
                    "location": request.location,
                    "budget": request.budget,
                    "business_model": request.business_model
                }
            )
        except Exception as e:
            logger.error(f"Error proposing new concepts: {e}")
            raise e


    def _process_market_evidence(self, market_evidence: List[Dict]) -> (List[Dict], str):
        """Processes raw market evidence into structured snippets and prompt context."""
        evidence_context = ""
        structured_evidence = []
        for i, doc in enumerate(market_evidence):
            source_id = i + 1
            doc_title = doc.get("title") or doc.get("domain") or "Untitled"
            doc_content = doc.get("content") or ""
            doc_meta = doc.get("doc_metadata") or {}
            
            # Enrich context for LLM with trends and risks if available
            trend = doc_meta.get("market_trend") or ""
            risk = doc_meta.get("risk") or ""
            
            evidence_context += f"\n[Source {source_id}]: {doc_title}\n{doc_content}\n"
            if trend: evidence_context += f"Market Trend Found: {trend}\n"
            if risk: evidence_context += f"Risk Identified: {risk}\n"
            
            # Map distance to confidence (0.0 - 1.0)
            distance = doc.get("_distance", 1.0)
            confidence = max(0.0, min(1.0, 1.0 - (distance / 1.5))) 
            
            structured_evidence.append({
                "source_id": f"Source {source_id}",
                "source_title": doc_title,
                "content": doc_content[:200] + "...",
                "market_trend": trend,
                "risk_factor": risk,
                "confidence_score": round(confidence, 2)
            })
        return structured_evidence, evidence_context

    def _calculate_hybrid_score(self, llm_data: Dict, scoring_result: Dict) -> int:
        """Calculates a weighted average score between LLM insights and deterministic data."""
        llm_potential = int(llm_data.get("market_potential", 80))
        deterministic_score = scoring_result["score"]
        return int((llm_potential * 0.6) + (deterministic_score * 0.4))

    def _map_to_idea_response(self, raw_idea, llm_data, scoring_result, hybrid_score, market_patterns, structured_evidence, safety_audit) -> IdeaResponse:
        """Maps diverse data sources into a unified IdeaResponse object."""
        return IdeaResponse(
            original_idea=raw_idea,
            refined_idea=llm_data.get("refined_idea", raw_idea),
            extracted_features=FeatureExtraction(
                domain=llm_data.get("domain", "General"),
                target_users=llm_data.get("target_users", "Broad Market"),
                core_problem=llm_data.get("core_problem", "Unmet Need")
            ),
            feasibility_score=hybrid_score,
            feasibility_reasoning=scoring_result["reasoning"],
            competitor_overview=[CompetitorOverview(**c) for c in llm_data.get("competitors", [])],
            user_pain_points=list(set(llm_data.get("pain_points", []) + market_patterns.get("user_pain_points", []))),
            market_trends=list(set(llm_data.get("market_trends", []) + market_patterns.get("market_trends", []))),
            risk_factors=llm_data.get("risk_factors", []),
            monetization_suggestions=llm_data.get("monetization", []),
            improvement_steps=list(set(llm_data.get("improvements", []) + market_patterns.get("key_features", []))),
            supporting_evidence=structured_evidence,
            ethical_flags=safety_audit.get("flags", []),
            status="success" if not safety_audit.get("flags") else "warning"
        )

    def _perform_output_audit(self, response: IdeaResponse, db: Session, user_email: str) -> IdeaResponse:
        """Audits the final advisory content for ethical compliance before returning."""
        advice_blob = f"{response.refined_idea} {' '.join(response.improvement_steps)}"
        output_safety = audit_content_for_ethical_integrity(advice_blob, is_generated_advice=True, db=db, user_email=user_email)
        if not output_safety["is_safe"]:
            response.ethical_flags = list(set(response.ethical_flags + output_safety["flags"]))
            if output_safety.get("correction_path"):
                response.correction_path = output_safety["correction_path"]
        return response

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

    def _build_analysis_prompt(self, idea: str, evidence: str, domain: str = None, location: str = None, budget: str = None) -> str:
        """Constructs the master synthesis prompt for the LLM."""
        return PromptConfig.get_analysis_prompt(idea, evidence, domain=domain, location=location, budget=budget)
