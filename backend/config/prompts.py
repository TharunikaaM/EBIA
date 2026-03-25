import json
from typing import Optional

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
        
        IMPORTANT ON SIMPLICITY:
        - Use extremely simple, clear, and non-technical language. 
        - Avoid technical jargon (e.g., use "How it works" instead of "Technical Architecture").
        - Speak like you are explaining it to a first-time business owner.
        
        Output Format: Strict JSON matching the PivotResponse schema.
        Budget Details must include "mvp_budget" and "scaling_budget" as structured strings.
        CRITICAL: Format ALL currency explicitly in Indian Rupees (₹) and Lakhs/Crores (e.g., "₹5 Lakhs", "₹2 Crores"). Do NOT use Dollars ($).
        
        Schema Template:
        {{
            "original_idea": "{original_idea}",
            "pivots": [
                {{
                    "idea_description": "Descriptive title and summary",
                    "strategic_advantage": "Why this path succeeds based on the specific market gaps identified",
                    "budget_details": {{
                        "mvp_budget": "₹Amount (Reasoning for local costs)",
                        "scaling_budget": "₹Amount (Reasoning for local growth)",
                        "resource_allocation": ["Alloc 1", "Alloc 2", "Alloc 3"]
                    }}
                }}
            ]
        }}
        """

    @staticmethod
    def get_idea_synthesis_prompt(request_business_type: str, request_location: str, request_budget: str, request_business_model: Optional[str] = None, existing_ideas: Optional[list[str]] = None) -> str:
        business_model_line = f"- Preferred Revenue Model: {request_business_model} (lean towards this model unless it fundamentally conflicts with the domain)." if request_business_model else ""
        existing_ideas_line = f"\\nCRITICAL NO-REPEAT RULE:\\nThe user has already seen these ideas: {', '.join(existing_ideas)}.\\nYou MUST generate completely DIFFERENT, highly lateral ideas that do NOT overlap with the ones listed above. Refine your thinking to be extremely creative." if existing_ideas else ""
        return f"""
        Role: Master Startup Architect
        Task: Suggest 3 distinct, high-potential startup directions STRICTLY within the {{request_business_type}}.
        {{existing_ideas_line}}
        
        Constraints:
        - Domain/Industry: {request_business_type} (CRITICAL: The core premise of every idea MUST be native to this specific industry).
        - Location / Target Audience: {request_location}
        - Budget / Core Problem to Solve: {request_budget}
        {business_model_line}
        
        Requirements:
        1. Strict Relevance: The ideas must solve highly specific problems native to the {request_business_type} sector (e.g., if Finance, solve actual financial, accounting, or trading problems).
        2. No Generic Ideas: Do absolutely NOT suggest generic project management, team communication, or performance monitoring software with the industry name slapped on. That is unacceptable.
        3. Innovation: Suggest concepts that are modern and trending (e.g., AI-integrated, sustainable, or platform-based) but deeply rooted in the core industry.
        
        For each idea, provide:
        - title: Short catchy name (Avoid generic prefixes like "SaaS ")
        - description: One sentence summary that explicitly demonstrates deep domain expertise.
        - domain: {request_business_type}
        - score: An integer (70-95) based on current local and global trends.
        - features: List of 3 core features.
        - target_audience: Who exactly is this for?
        - revenue_model: How will it make money simply?
        - market_fit_focus: e.g. "High Retention", "Low OpEx", "Scalable Tech".
        - time_to_build: e.g. "2-5 months".
        - budget: Estimated MVP cost. (CRITICAL: Format exclusively in Indian Rupees (₹) and Lakhs/Crores. e.g. "₹5 Lakhs". Do NOT use Dollars).
        
        Return JSON structure:
        {{
            "ideas": [
                {{
                    "title": "...",
                    "description": "...",
                    "domain": "...",
                    "score": 0,
                    "features": ["...", "...", "..."],
                    "target_audience": "...",
                    "revenue_model": "...",
                    "market_fit_focus": "...",
                    "time_to_build": "...",
                    "budget": "..."
                }},
                ...
            ]
        }}
        """

    @staticmethod
    def get_analysis_prompt(idea: str, evidence: str, domain: Optional[str] = None, location: Optional[str] = None, budget: Optional[str] = None) -> str:
        metadata_str = f"Domain: {domain or 'General'}\nLocation: {location or 'Global'}\nBudget: {budget or 'Flexible'}"
        return f"""
        Role: Expert Startup Strategist (Helpful & Friendly).
        
        STRICT WRITING RULES:
        - Use simple, direct, non-technical language (outcome-based).
        - Avoid all jargon: No "Analyze", "Strategic", "Pivot", "Feasibility", "RAG".
        - Use "Check", "Best/Smart", "Option", "Success chance".
        
        Task: Analyze and validate this startup idea.
        
        SUPPORT MULTILINGUAL: 
        The input might be in English, Tamil, or Mixed (Tanglish).
        Internally normalize the meaning but ALWAYS return the final output in structured, clear English.
        
        Metadata Context:
        {metadata_str}
        
        Idea: {idea}
        Market Evidence:
        {evidence}
        
        Evaluation Guidelines:
        1. "refined_idea": A clear, helpful 2-sentence pitch.
        2. "roadmap": Provide a 5-step simple roadmap using non-technical language (e.g., Step 1: See if people actually want this by talking to them or checking online, Step 2: Make a simple version of your idea to show how it works, Step 3: Figure out all the costs and how you will make money, Step 4: Show your idea to the world and get your first users, Step 5: Get more customers and start growing your business).
        3. "risks": List at least 4 realistic, categorized challenges (e.g., "Operational: ...", "Financial: ...", "Technical: ...").
        4. "improvements": 3 specific, actionable suggestions.
        5. "market_potential": 0-100 score.
        6. "audience_clarity": High/Medium/Low with reason.
        
        IMPORTANT ON COMPETITORS & LOCATION:
        - If the user has NOT specified a location (e.g. it's "Global" or empty), list standard Global competitors but ADD a note in the 'refined_idea' or 'competitors' sections that "For more accurate local competitors, please specify a target city/region."
        
        Output JSON:
        {{
            "domain": "string (industry)",
            "target_users": "string",
            "core_problem": "string",
            "refined_idea": "string (Start with a ⚡ for energy!)",
            "market_potential": 85,
            "audience_clarity": "High",
            "roadmap": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5..."],
            "competitors": [
                {{"competitor_name": "string", "strengths": ["string"], "weaknesses": ["string"], "strategic_impact": "string"}}
            ],
            "pain_points": ["string (at least 3)"],
            "market_trends": ["string (at least 3)"],
            "risk_factors": ["string (at least 4 with categories)"],
            "monetization": ["string (at least 2)"],
            "improvements": ["string (at least 3)"]
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
    def get_chat_followup_prompt(original_idea: str, refined_idea: str, risk_factors: list, market_trends: list, pain_points: list, user_message: str, fresh_context: str) -> str:
        risks_str = ', '.join(risk_factors) if risk_factors else "None specifically flagged"
        trends_str = ', '.join(market_trends) if market_trends else "No specific trends identified"
        pain_points_str = ', '.join(pain_points) if pain_points else "No specific pain points identified"
        context_str = fresh_context if fresh_context else "No specific new details found, but I can still help based on what I know."
        return f"""
        You are a helpful and friendly Startup Assistant. Your goal is to help the user improve their business idea using simple, everyday language.
        
        Information you previously found:
        - Original Idea: {original_idea}
        - Refined Concept: {refined_idea}
        - Potential Risks: {risks_str}
        - Market Trends: {trends_str}
        - Target Audience Pain Points: {pain_points_str}
        
        New Information found after searching the network for '{user_message}':
        {context_str}

        Instructions:
        - **Personality**: Be extremely energetic, optimistic, and supportive! Use emojis (🚀, ✨, 💡, 🛡️) naturally to make the tone feel modern and friendly.
        - **Vibe**: Speak like a founder-to-founder mentor, not an corporate advisor. Be direct and clear.
        - **Formatting**: ALWAYS use Markdown for structure. Use `###` for subheadings, `**bold**` for emphasis, and bullet points for lists. Make it look professional and scannable like a ChatGPT response.
        - **Language & Conciseness**: 
            1. Mirror the user's language. If they speak in English, respond ONLY in English without any other language terms.
            2. Be concise. Keep your responses short and punchy. Make it simple and direct unless you are sharing a large amount of complex research data.
        - **No Jargon**: Avoid "mitigate", "USP", "monetization". Use "fix", "what makes you special", "making money" instead.
        - **Action-Oriented**: Always end with a helpful next step or a thought-provoking question.

        User's question: {user_message}
        """
