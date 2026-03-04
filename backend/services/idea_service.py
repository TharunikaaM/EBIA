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
    def __init__(self, repository: IdeaRepository, llm_provider: LLMProvider):
        self.repository = repository
        self.llm_provider = llm_provider
        self.retrieval_service = RetrievalService()

    def evaluate_idea(self, request: IdeaRequest, user_id: str) -> IdeaResponse:
        raw_idea = request.idea
        cleaned_idea = clean_text(raw_idea)
        
        # 1. Ethical Filtering
        ethical_flags = check_ethical_flags(raw_idea)
        
        # 2. Retrieval
        similar_docs = self.retrieval_service.get_similar_documents(cleaned_idea, top_k=3)
        doc_context = "\n".join([doc.get("content", "") for doc in similar_docs])
        
        # 3. Topic Extraction
        topics = extract_topics(raw_idea, context_docs=similar_docs)
        
        # 4 & 6. LLM Extraction
        prompt = self._get_evaluation_prompt(raw_idea, doc_context)
        
        # Default Fallbacks
        eval_data = self._get_default_eval_data(raw_idea, request.domain)

        try:
            llm_response = self.llm_provider.generate(prompt, json_format=True)
            logger.info(f"LLM evaluate raw response: {llm_response}")
            cleaned_response = llm_response.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_response)
            eval_data.update(data)
        except Exception as e:
            logger.error(f"LLM Error in evaluate_idea: {e}, Raw: {llm_response if 'llm_response' in locals() else 'None'}")
            
        features = FeatureExtraction(
            domain=eval_data["domain"], 
            target_users=eval_data["target_users"], 
            core_problem=eval_data["core_problem"]
        )
        score = calculate_feasibility(raw_idea, similar_docs)

        competitors = [CompetitorOverview(**comp) for comp in eval_data["competitors"]] if eval_data["competitors"] and isinstance(eval_data["competitors"][0], dict) else eval_data["competitors"]

        response_model = IdeaResponse(
            idea_id="temp",
            original_idea=raw_idea,
            problem_statement=eval_data["problem_statement"],
            refined_idea=eval_data["refined_idea"],
            extracted_features=features,
            feasibility_score=score,
            competitor_overview=competitors,
            similar_ideas=eval_data["similar_ideas"],
            key_features=eval_data["key_features"],
            user_pain_points=eval_data["pain_points"],
            market_trends=eval_data["market_trends"],
            risk_factors=eval_data["risk_factors"],
            monetization_suggestions=eval_data["monetization"],
            improvement_steps=eval_data["improvements"],
            ethical_flags=ethical_flags,
            status="success" if not ethical_flags else "warning"
        )
        
        # Persistence via Repository
        is_private = getattr(request, 'is_private', False)
        eval_result_json = json.loads(response_model.json())
        
        if hasattr(request, 'idea_id') and request.idea_id:
            idea_record = self.repository.update_evaluation(request.idea_id, raw_idea, is_private, eval_result_json)
            if idea_record:
                response_model.idea_id = idea_record.id
        else:
            idea_record = self.repository.create(user_id, raw_idea, is_private, eval_result_json)
            response_model.idea_id = idea_record.id
            
            # Update with final ID
            eval_result_json["idea_id"] = idea_record.id
            self.repository.update_evaluation(idea_record.id, raw_idea, is_private, eval_result_json)

        return response_model
        
    def generate_idea(self, request: IdeaGenerateRequest, user_id: str) -> IdeaGenerateResponse:
        prompt = f"""
        Generate a single, realistic startup idea based on the following parameters. 
        It must be an idea that can actually be executed, not sci-fi.
        Return ONLY a JSON object with your response. Do NOT wrap it in markdown.
        
        Business Type: {request.business_type}
        Location/Market: {request.location}
        Budget/Scale: {request.budget}
        
        Required JSON Structure:
        {{
            "idea_description": "string (A comprehensive 3-5 sentence description of the startup idea)",
            "domain": "string (Primary industry or domain)"
        }}
        """
        
        generated_text = f"A novel {request.business_type} solution targeting unmet needs in {request.location}, utilizing a lean {request.budget} approach."
        domain = "General Setup"
        
        try:
            llm_response = self.llm_provider.generate(prompt, json_format=True)
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
        evaluation_result = self.evaluate_idea(eval_request, db, user_id)
        
        return IdeaGenerateResponse(
            generated_idea=generated_text,
            evaluation=evaluation_result
        )
