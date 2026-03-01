"""
Main service for orchestrating the idea evaluation process.
"""
from schemas.idea_request import IdeaRequest, IdeaGenerateRequest
from schemas.idea_response import IdeaResponse, IdeaGenerateResponse, FeatureExtraction, CompetitorOverview
from services.retrieval_service import RetrievalService
from services.scoring_service import calculate_feasibility
from services.topic_service import extract_topics
from services.ethical_filter_service import check_ethical_flags
from utils.text_cleaner import clean_text

class IdeaService:
    def __init__(self):
        self.retrieval_service = RetrievalService()

    def evaluate_idea(self, request: IdeaRequest) -> IdeaResponse:
        """
        Evaluates the startup idea by executing the pipeline:
        1. Ethical Check
        2. Feature Extraction (Simulated LLM call)
        3. Vector Retrieval (FAISS)
        4. Topic Modeling Simulation
        5. Scoring
        6. Generating Insights
        """
        raw_idea = request.idea
        cleaned_idea = clean_text(raw_idea)
        
        # 1. Ethical Filtering
        ethical_flags = check_ethical_flags(raw_idea)
        
        # 2. Retrieval (Find similar ideas/docs)
        similar_docs = self.retrieval_service.get_similar_documents(cleaned_idea, top_k=3)
        
        # 3. Topic Extraction
        topics = extract_topics(raw_idea)
        
        # 4. Feature Extraction (Mocked LLM parsing)
        # In a real app, this would be an LLM call to extract Domain, Users, Problem
        domain = request.domain if request.domain else (topics[0] if topics else "General")
        target_users = "Broad consumer base" # Mocked
        core_problem = "Inefficiency in existing solutions" # Mocked
        
        if "student" in cleaned_idea or "education" in cleaned_idea:
            target_users = "Students and Educators"
            domain = "EdTech"
        elif "farm" in cleaned_idea or "food" in cleaned_idea:
            target_users = "Farmers and Consumers"
            domain = "AgriTech"
            
        features = FeatureExtraction(
            domain=domain,
            target_users=target_users,
            core_problem=core_problem
        )

        # 5. Feasibility Score
        score = calculate_feasibility(raw_idea, similar_docs)
        
        # 6. Generate Insights (Mocked - would use LLM in production)
        refined_idea = str(raw_idea).capitalize() + " - Optimized for market entry."
        
        competitors = [
            CompetitorOverview(
                competitor_name="Incumbent A",
                strengths=["Brand recognition", "Capital"],
                weaknesses=["Slow innovation", "High prices"]
            )
        ]
        
        pain_points = ["High costs", "Complex onboarding", "Lack of transparency"]
        market_trends = [f"Growing demand in {domain}", "Shift towards AI-driven solutions"]
        risk_factors = ["Regulatory changes", "High customer acquisition costs"]
        monetization = ["Freemium model", "B2B SaaS subscriptions", "Transaction fees"]
        improvements = [
            "Narrow down the target audience for the initial launch.",
            "Focus on building a strong community before scaling.",
            "Consider a pilot program to gather early feedback."
        ]

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
        In a real scenario, this would call an LLM. Here, we mock the generation.
        """
        biz = request.business_type.lower()
        loc = request.location
        budget = request.budget
        
        # Simple mocked generation logic
        if "saas" in biz:
            generated_text = f"An AI-powered B2B platform tailored for the {loc} market that automates compliance and workflow management, designed specifically for a {budget} initial scale-up."
            domain = "Enterprise Software"
        elif "marketplace" in biz:
            generated_text = f"A hyper-local P2P marketplace in {loc} connecting freelance professionals with small businesses, optimized for a {budget} launch strategy."
            domain = "Marketplace"
        elif "ecommerce" in biz or "e-commerce" in biz:
            generated_text = f"A specialized direct-to-consumer sustainable brand focused on the {loc} demographic, leveraging a {budget} strategy for supply chain transparency."
            domain = "E-Commerce"
        else:
            generated_text = f"A novel {biz} solution targeting unmet needs in {loc}, utilizing a lean {budget} approach to test product-market fit."
            domain = "General Setup"
            
        # Create an IdeaRequest to evaluate the newly generated idea
        eval_request = IdeaRequest(idea=generated_text, domain=domain)
        
        # Evaluate it
        evaluation_result = self.evaluate_idea(eval_request)
        
        return IdeaGenerateResponse(
            generated_idea=generated_text,
            evaluation=evaluation_result
        )
