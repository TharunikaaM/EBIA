"""
Service for topic modeling simulation.
"""
# Note: For a real application, BERTopic/LDA would be trained on a large corpus.
# Here we simulate topic modeling or use a lightweight approach.

def extract_topics(text: str) -> list:
    """
    Simulates topic extraction from the idea.
    In production, this would use BERTopic.find_topics() or similar.
    """
    # Placeholder mocked logic for topic modeling
    topics = ["Innovation", "Technology", "Market Disruption"]
    
    # Simple keyword-based mock
    text_lower = text.lower()
    if "data" in text_lower or "ai" in text_lower:
        topics.append("Artificial Intelligence")
    if "health" in text_lower or "medical" in text_lower:
        topics.append("Healthcare")
    if "finance" in text_lower or "money" in text_lower or "invest" in text_lower:
        topics.append("FinTech")
        
    return list(set(topics))
