"""
Deterministic scoring engine for Startup Idea Intelligence.
Calculates feasibility based on market evidence, innovation, and execution risk.
"""
from typing import List, Dict, Any

def calculate_idea_feasibility_score(idea_text: str, similar_documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes a multi-factor logic-driven engine to calculate a feasibility score (0-100).
    
    Factors:
    1. Market Validation (30%): Distance proximity of similar concepts.
    2. Innovation/Novelty (30%): Uniqueness relative to retrieved evidence.
    3. Execution Risk (40%): Sentiment and keyword analysis of historical pain points.
    """
    if not similar_documents:
        return {
            "score": 50,
            "reasoning": "Neutral score assigned due to limited public evidence. Further empirical verification is recommended."
        }

    # 1. Market Validation (Proximity Analysis)
    # distance 0.0 -> 100 validation, distance 1.0+ -> 0 validation
    avg_distance = sum(doc.get("_distance", 1.0) for doc in similar_documents) / len(similar_documents)
    market_val_score = max(0, min(100, (1.0 - avg_distance) * 100))
    
    # 2. Innovation / Novelty
    # Higher distance = Higher Novelty.
    novelty_score = max(0, min(100, avg_distance * 100))
    
    # 3. Execution Risk (Retrieval-Based Sentiment/Pain Point Analysis)
    risk_keywords = ["failure", "closed", "regulation", "struggle", "unmet", "lack", "pain", "frustration", "bankrupt"]
    risk_hits = 0
    total_content = " ".join([doc.get("content", "").lower() for doc in similar_documents])
    
    for kw in risk_keywords:
        if kw in total_content:
            risk_hits += 1
            
    # Calculate Risk Score (0 = High Risk, 100 = Low Risk)
    execution_risk_score = max(10, 90 - (risk_hits * 10))
    
    # Weighted Final Score Initialization
    validation_weight = 0.4
    innovation_weight = 0.2
    risk_weight = 0.4
    
    # Base score from deterministic metrics
    base_score = (market_val_score * validation_weight) + \
                 (novelty_score * innovation_weight) + \
                 (execution_risk_score * risk_weight)
    
    # Add a slight "complexity" bonus for detailed ideas
    # 50-200 chars is the sweet spot for a good core idea
    complexity_bonus = min(5, len(idea_text) / 40)
    
    final_score = base_score + complexity_bonus
    
    # Generate Reasoning Narrative
    reasoning_parts = []
    
    if market_val_score > 70:
        reasoning_parts.append("High feasibility driven by strong market validation in retrieved evidence.")
    elif market_val_score < 30:
        reasoning_parts.append("Moderate feasibility due to limited historical precedents in public datasets.")
        
    if execution_risk_score < 50:
        reasoning_parts.append(f"Retrieved indices flag potential execution risks or historical pain points ({risk_hits} indicators found).")
    else:
        reasoning_parts.append("Market evidence suggests a sustainable path with manageable entry barriers.")
        
    if novelty_score > 70:
        reasoning_parts.append("The concept demonstrates high strategic novelty relative to existing solutions.")
    else:
        reasoning_parts.append("Similar solutions are active; focus on unique differentiation is critical.")

    return {
        "score": int(max(0, min(100, final_score))),
        "reasoning": " ".join(reasoning_parts)
    }
