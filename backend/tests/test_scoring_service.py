from services.scoring_service import calculate_idea_feasibility_score

def test_scoring_with_no_market_evidence():
    """Should return a neutral score when no public evidence is retrieved."""
    result = calculate_idea_feasibility_score("Any idea", [])
    assert "score" in result
    assert "reasoning" in result
    assert result["score"] == 50
    assert "limited public evidence" in result["reasoning"].lower()

def test_scoring_high_market_validation():
    """Low distance matches should yield high feasibility scores."""
    market_evidence = [
        {"_distance": 0.2, "content": "A very successful similar business model."},
        {"_distance": 0.3, "content": "Rapidly growing market adoption."}
    ]
    result = calculate_idea_feasibility_score("Scaling ecommerce", market_evidence)
    assert result["score"] > 70
    assert "strong market validation" in result["reasoning"].lower()

def test_scoring_execution_risk_indicators():
    """Historical pain point keywords should depress the feasibility score."""
    market_evidence = [
        {"_distance": 0.1, "content": "This business failed due to extreme high costs."},
        {"_distance": 0.2, "content": "Users were frustrated with the lack of transparency."}
    ]
    result = calculate_idea_feasibility_score("New fintech app", market_evidence)
    # 2 risk indicators (failed, frustrated) found
    # Risk hits should push it down even with low distance
    assert result["score"] < 65
    assert "indicators found" in result["reasoning"].lower()

def test_feasibility_score_boundaries():
    """Validates that scores remain within the 0-100 range."""
    # High distance (Low validation) + Risk
    market_evidence = [{"_distance": 1.2, "content": "Business closure due to bankruptcy."}]
    result = calculate_idea_feasibility_score("Risky idea", market_evidence)
    assert 0 <= result["score"] <= 100
