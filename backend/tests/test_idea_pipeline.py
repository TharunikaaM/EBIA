import json
import pytest

def test_evaluate_startup_appraisal_async(client, db):
    """Verifies that the /evaluate endpoint correctly triggers an async task."""
    # Note: We don't need mock_llm here as it's a background task, 
    # we just check if the task is created and queued properly.
    
    response = client.post("/api/v1/idea/evaluate", json={
        "idea": "I want to build a smart plant pot for urban gardeners.",
        "domain": "AgriTech",
        "is_private": True
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data
    assert data["status"] == "PENDING"
    assert "queued" in data["message"].lower()

def test_check_appraisal_status_endpoint(client, db):
    """Verifies retrieval of task status from the database entry."""
    from database import EvaluationHistory
    import uuid
    
    task_id = str(uuid.uuid4())
    new_entry = EvaluationHistory(
        task_id=task_id,
        user_email="test@example.com",
        idea_text="Test Idea",
        status="COMPLETED",
        analysis_results={"refined_idea": "Optimized Idea"}
    )
    db.add(new_entry)
    db.commit()
    
    response = client.get(f"/api/v1/idea/status/{task_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"
    assert response.json()["results"]["refined_idea"] == "Optimized Idea"

def test_synthesis_new_concept_integration(client, mock_llm):
    """Verifies the /generate endpoint for synthesizing and auto-evaluating a concept."""
    # Mock LLM for concept proposal
    mock_llm.side_effect = [
        json.dumps({"idea_description": "A solar-powered drone for reef monitoring.", "domain": "EcoTech"}),
        # Mock LLM for subsequent pipeline evaluation (audit, insights, etc.)
        # This mocks the audit_content_for_ethical_integrity and the pipeline synthesis
        json.dumps({"is_safe": True, "is_refusal": False, "flags": []}),
        json.dumps({
            "refined_idea": "ReefGuardian AI",
            "domain": "EcoTech",
            "target_users": "Marine researchers",
            "core_problem": "Coral health tracking",
            "competitors": [],
            "pain_points": ["Manual monitoring is slow"],
            "market_trends": ["Sustainable tech"],
            "risk_factors": ["Saltwater corrosion"],
            "monetization": ["Research grants"],
            "improvements": ["Edge AI processing"]
        }),
        # Final output safety check
        json.dumps({"is_safe": True, "flags": []})
    ]
    
    response = client.post("/api/v1/idea/generate", json={
        "business_type": "Drones",
        "location": "Coastal Areas",
        "budget": "Government Grant"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "generated_idea" in data
    assert "Reef" in data["evaluation"]["refined_idea"]
    assert data["evaluation"]["status"] == "success"
