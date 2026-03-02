"""
Main service for orchestrating the idea evaluation process.
"""
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse, FeatureExtraction, CompetitorOverview
from services.retrieval_service import RetrievalService
from services.scoring_service import calculate_feasibility
from services.topic_service import extract_topics
from services.ethical_filter_service import check_ethical_flags
from services.llm_service import LLMService
from utils.text_cleaner import clean_text
import json
import logging

logger = logging.getLogger(__name__)

class IdeaService:
    def __init__(self):
        self.retrieval_service = RetrievalService()

    def evaluate_idea(self, request: IdeaRequest) -> IdeaResponse:
        """
        Evaluates the startup idea by executing the pipeline:
        1. Ethical Check
        2. Feature Extraction (LLM call)
        3. Vector Retrieval (FAISS)
        4. Topic Modeling
        5. Scoring
        6. Generating Insights
        """
        raw_idea = request.idea
        cleaned_idea = clean_text(raw_idea)
        
        # 1. Ethical Filtering
        ethical_flags = check_ethical_flags(raw_idea)
        
        # 2. Retrieval (Find similar ideas/docs)
        similar_docs = self.retrieval_service.get_similar_documents(cleaned_idea, top_k=3)
        doc_context = "\n".join([doc.get("content", "") for doc in similar_docs])
        
        # 3. Topic Extraction
        topics = extract_topics(raw_idea, context_docs=similar_docs)
        
        # 4 & 6. Feature Extraction & Insights Generation (LLM parsing)
        prompt = f"""
        Analyze the following startup idea. You MUST reply ONLY with a valid JSON object. Do NOT wrap the JSON in markdown blocks (e.g., ```json ... ```). Provide exactly the requested structure and nothing else.
        
        Idea: {raw_idea}
        Context (Similar past data): {doc_context}
        
        Required JSON Structure:
        {{
            "domain": "string",
            "target_users": "string",
            "core_problem": "string",
            "refined_idea": "string (A clear, structured, improved version of the idea)",
            "competitors": [
                {{
                    "competitor_name": "string",
                    "strengths": ["string", "string"],
                    "weaknesses": ["string", "string"]
                }}
            ],
            "pain_points": ["string", "string"],
            "market_trends": ["string", "string"],
            "risk_factors": ["string", "string"],
            "monetization": ["string", "string"],
            "improvements": ["string", "string"]
        }}
        """
        
        # Default mock fallback if LLM fails
        domain = request.domain if request.domain else "General"
        target_users = "Broad consumer base"
        core_problem = "Inefficiency in existing solutions"
        refined_idea = str(raw_idea).capitalize() + " - Optimized for market entry."
        competitors = [CompetitorOverview(competitor_name="Incumbent A", strengths=["Brand recognition"], weaknesses=["Slow innovation"])]
        pain_points = ["High costs", "Complex onboarding"]
        market_trends = [f"Growing demand in {domain}"]
        risk_factors = ["Regulatory changes", "High customer acquisition costs"]
        monetization = ["Freemium model", "B2B SaaS subscriptions"]
        improvements = ["Narrow down the target audience."]

        try:
            llm_response = LLMService.generate(prompt, json_format=True)
            logger.info(f"LLM evaluate raw response: {llm_response}")
            # Clean up potential markdown formatting from Ollama if json_format failed to enforce raw json
            cleaned_response = llm_response.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_response)
            
            domain = data.get("domain", domain)
            target_users = data.get("target_users", target_users)
            core_problem = data.get("core_problem", core_problem)
            refined_idea = data.get("refined_idea", refined_idea)
            
            if "competitors" in data:
                competitors = [CompetitorOverview(**comp) for comp in data["competitors"]]
            
            pain_points = data.get("pain_points", pain_points)
            market_trends = data.get("market_trends", market_trends)
            risk_factors = data.get("risk_factors", risk_factors)
            monetization = data.get("monetization", monetization)
            improvements = data.get("improvements", improvements)
            
        except Exception as e:
            logger.error(f"Error parsing LLM evaluation response: {e}, Raw: {llm_response if 'llm_response' in locals() else 'None'}")
            
        features = FeatureExtraction(
            domain=domain,
            target_users=target_users,
            core_problem=core_problem
        )

        # 5. Feasibility Score
        score = calculate_feasibility(raw_idea, similar_docs)

        # Construct Response
        return IdeaResponse(
            original_idea=raw_idea,
            refined_idea=refined_idea,
            extracted_features=features,
            feasibility_score=score,
            competitor_overview=competitors,
            user_pain_points=pain_points,
            market_trends=market_trends,
            risk_factors=risk_factors,
            monetization_suggestions=monetization,
            improvement_steps=improvements,
            ethical_flags=ethical_flags,
            status="success" if not ethical_flags else "warning_flags_present"
        )
        
    def generate_idea(self, request: IdeaGenerateRequest) -> IdeaGenerateResponse:
        """
        Generates a new startup idea based on business type, location, and budget.
        """
        biz = request.business_type
        loc = request.location
        budget = request.budget
        
        prompt = f"""
        Generate a single, realistic startup idea based on the following parameters. 
        It must be an idea that can actually be executed, not sci-fi.
        Return ONLY a JSON object with your response. Do NOT wrap it in markdown.
        
        Business Type: {biz}
        Location/Market: {loc}
        Budget/Scale: {budget}
        
        Required JSON Structure:
        {{
            "idea_description": "string (A comprehensive 3-5 sentence description of the startup idea)",
            "domain": "string (Primary industry or domain)"
        }}
        """
        
        generated_text = f"A novel {biz} solution targeting unmet needs in {loc}, utilizing a lean {budget} approach."
        domain = "General Setup"
        
        try:
            llm_response = LLMService.generate(prompt, json_format=True)
            logger.info(f"LLM generate raw response: {llm_response}")
            cleaned_response = llm_response.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_response)
            generated_text = data.get("idea_description", generated_text)
            domain = data.get("domain", domain)
        except Exception as e:
             logger.error(f"Error parsing LLM generation response: {e}")
            
        # Create an IdeaRequest to evaluate the newly generated idea
        eval_request = IdeaRequest(idea=generated_text, domain=domain)
        
        # Evaluate it
        evaluation_result = self.evaluate_idea(eval_request)
        
        return IdeaGenerateResponse(
            generated_idea=generated_text,
            evaluation=evaluation_result
        )
