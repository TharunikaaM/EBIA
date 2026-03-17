import json
from services.topic_service import mine_market_patterns_and_topics
from unittest.mock import patch, MagicMock

def test_topic_mining_fallback_llm(mock_llm):
    """Verifies that the system falls back to LLM extraction for small datasets."""
    mock_llm.return_value = json.dumps({
        "user_pain_points": ["Manual data entry"],
        "market_trends": ["Automation surge"],
        "key_features": ["Smart import"]
    })
    
    result = mine_market_patterns_and_topics("Small corpus idea")
    assert "user_pain_points" in result
    assert "Manual data entry" in result["user_pain_points"]
    assert len(result["market_trends"]) > 0

@patch('services.topic_service.BERTopic')
@patch('services.topic_service.ClassTfidfTransformer')
def test_topic_mining_bertopic_pipeline(mock_ctfidf, mock_bertopic_class, mock_llm):
    """Verifies the end-to-end BERTopic pattern mining pipeline."""
    mock_model = mock_bertopic_class.return_value
    mock_model.fit_transform.return_value = ([0, 0, 0], [1, 1, 1])
    
    import pandas as pd
    mock_model.get_topic_info.return_value = pd.DataFrame({
        'Topic': [0, -1], # Topic 0 and Noise -1
        'Count': [3, 1]
    })
    mock_model.get_topic.return_value = [('sustainability', 0.9)]
    
    # Mock LLM cluster synthesis
    mock_llm.return_value = "Emerging sustainability trend in urban agri-tech adoption"
    
    seed_text = "Sustainable urban farming platform."
    context = [
        {"content": "Vertical gardens for cities"},
        {"content": "Hydroponic systems in apartments"},
        {"content": "Green roof adoption"}
    ]
    
    result = mine_market_patterns_and_topics(seed_text, contextual_documents=context)
    
    assert "market_trends" in result
    assert any("sustainability" in s.lower() for s in result["market_trends"])
    mock_model.fit_transform.assert_called_once()
