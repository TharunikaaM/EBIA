import json

class PromptConfig:
    @staticmethod
    def get_topic_cluster_synthesis_prompt(cluster_keywords: list, context_blob: str) -> str:
        return f"""
        Analyze these market documents and keywords: {", ".join(cluster_keywords)}
        Documents: {context_blob}
        
        Synthesize into ONE concise market reality sentence (max 15 words).
        """

    @staticmethod
    def get_llm_pattern_mining_prompt(idea_text: str) -> str:
        return f"""
        Mine specific market patterns from this idea: {idea_text}
        Categories: User Pain Points, Market Trends, Key Features.
        Return JSON format only.
        """

    @staticmethod
    def get_strategic_pivot_prompt(original_idea: str, domain: str, target_users: str, analysis_results: dict, location: str) -> str:
        pain_points_json = json.dumps(analysis_results.get('user_pain_points', []), indent=2)
        return f"""
        Role: Senior Startup Strategist & Financial Architect
        Task: Synthesize 3 strategic pivots for a startup concept in the {domain} sector.
        Context: The user is operating in {location}.
        
        Original Business Concept: {original_idea}
        Target Users: {target_users}
        
        Evidence-Based Grounding (Market Pain Points):
        {pain_points_json}
        
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

    @staticmethod
    def get_idea_synthesis_prompt(request_business_type: str, request_location: str, request_budget: str) -> str:
        return f"""
        Suggest 3 distinct, high-potential startup directions based on:
        Type: {request_business_type}
        Location: {request_location}
        Budget: {request_budget}
        
        For each idea, provide:
        - title: Short catchy name
        - description: One sentence summary
        - domain: e.g. Agri-Tech, FinTech
        - score: An integer (70-95) based on current market trends
        - features: List of 3 core features
        - budget: e.g. "₹15L" or "$20k"
        - market_fit_focus: e.g. "Budget Feasible", "High Retention"
        - time_to_build: e.g. "2-5 months"
        
        Return JSON structure:
        {{
            "ideas": [
                {{
                    "title": "...",
                    "description": "...",
                    "domain": "...",
                    "score": 0,
                    "features": ["...", "...", "..."],
                    "budget": "...",
                    "market_fit_focus": "...",
                    "time_to_build": "..."
                }},
                ...
            ]
        }}
        """

    @staticmethod
    def get_analysis_prompt(idea: str, evidence: str) -> str:
        return f"""
        Role: Friendly Startup Helper.
        Task: Explain this startup idea simply and check it against the market information provided.
        
        IMPORTANT: 
        1. Use very simple language that anyone can understand.
        2. If you find real companies or examples in the Market Evidence, mention them!
        3. Make the "refined_idea" sound like a clear, helpful pitch to a friend.
        
        Idea: {idea}
        Market Evidence:
        {evidence}
        
        Output JSON:
        {{
            "domain": "string (industry)",
            "target_users": "string (who is this for?)",
            "core_problem": "string (what problem are we fixing?)",
            "refined_idea": "string (a clear, simple explanation of the idea)",
            "competitors": [
                {{"competitor_name": "string", "strengths": ["string"], "weaknesses": ["string"], "strategic_impact": "string"}}
            ],
            "pain_points": ["string (at least 3 simple problems)"],
            "market_trends": ["string (at least 3 simple trends)"],
            "risk_factors": ["string (at least 2 things to watch out for)"],
            "monetization": ["string (at least 2 ways to make money)"],
            "improvements": ["string (simple ways to make it better)"]
        }}
        """

    @staticmethod
    def get_ethical_audit_prompt(audit_target: str, content_text: str) -> str:
        startup_ethics_policy = """
        Evaluate the startup idea or advice against these Ethical Integrity Pillars:
        1. Intellectual Property (IP): No plagiarism or direct cloning without significant innovation.
        2. Market Fairness: Avoid predatory pricing or anti-competitive strategies.
        3. Consumer Truth: No deceptive marketing, fraud, or misleading utility claims.
        4. Data Privacy: No non-consensual harvesting of private or sensitive user data.
        5. High-Risk Domains: Refuse illegal activities (fraud-as-a-service, unregulated weapons, etc).
        """
        return f"""
        Safety Assessment Task: Evaluate this {audit_target} for ethical integrity.
        
        {startup_ethics_policy}
        
        Content: {content_text}
        
        Return JSON:
        {{
            "is_safe": bool,
            "is_refusal": bool,
            "flags": ["violation details"],
            "correction_path": "constructive pivot",
            "educational_reason": "refusal explanation"
        }}
        """

    @staticmethod
    def get_chat_followup_prompt(original_idea: str, refined_idea: str, risk_factors: list, user_message: str, fresh_context: str) -> str:
        risks_str = ', '.join(risk_factors)
        context_str = fresh_context if fresh_context else "No specific new details found, but I can still help based on what I know."
        return f"""
        You are a helpful and friendly Startup Assistant. Your goal is to help the user improve their business idea using simple, everyday language.
        
        Information you previously found:
        - Original Idea: {original_idea}
        - Refined Concept: {refined_idea}
        - Potential Risks: {risks_str}
        
        New Information found after searching the network for '{user_message}':
        {context_str}

        Instructions:
        - Speak like a friendly human, not a formal advisor. 
        - Be direct, concise, and clear. 
        - Avoid business jargon (like "USP", "monetization", "mitigate"). Use "benefit", "making money", or "fixing problems" instead.
        - If the new information contains real companies or examples (like IT firms in Erode), mention them to be more helpful.
        - Answer the user's question directly.

        User's question: {user_message}
        """
