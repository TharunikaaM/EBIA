"""
Service to calculate a feasibility score for the idea.
"""
import random

def calculate_feasibility(idea: str, similar_docs: list) -> int:
    """
    Calculates a mocked feasibility score between 0 and 100.
    In a real scenario, this would involve complex multi-factor analysis
    using similarity scores, market trends, etc.
    """
    base_score = 50
    
    # If there are highly similar domains, it means market exists but competition is high
    if similar_docs:
        avg_distance = sum(doc.get("_distance", 1.0) for doc in similar_docs) / len(similar_docs)
        # Assuming lower distance = higher similarity
        if avg_distance < 0.5:
            base_score += 20 # Proven market
        else:
            base_score += 10 # Novel but risky
            
    # Add some randomness for simulation
    score = base_score + random.randint(-15, 25)
    
    # Cap between 10 and 95 for realism
    return max(10, min(95, score))
