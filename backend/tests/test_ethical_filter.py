import json
from services.ethical_filter_service import audit_content_for_ethical_integrity

def test_ethical_audit_safe_content(mock_llm):
    """Verifies that safe ideas pass the ethical audit."""
    mock_llm.return_value = json.dumps({
        "is_safe": True,
        "is_refusal": False,
        "flags": [],
        "correction_path": None,
        "educational_reason": None
    })
    
    result = audit_content_for_ethical_integrity("A local community garden project")
    assert result["is_safe"] is True
    assert len(result["flags"]) == 0

def test_ethical_audit_refusal_logic(mock_llm):
    """Verifies that harmful ideas trigger an ethical refusal."""
    mock_llm.return_value = json.dumps({
        "is_safe": False,
        "is_refusal": True,
        "flags": ["Policy Violation: Illegal Goods"],
        "correction_path": None,
        "educational_reason": "We do not support illegal weapons trading."
    })
    
    result = audit_content_for_ethical_integrity("Illegal weapons marketplace")
    assert result["is_refusal"] is True
    assert "Illegal Goods" in result["flags"][0]
    assert result["educational_reason"] is not None

def test_ethical_audit_correction_path(mock_llm):
    """Verifies that suspicious but salvageable ideas provide a correction path."""
    mock_llm.return_value = json.dumps({
        "is_safe": False,
        "is_refusal": False,
        "flags": ["Aggressive Data Gathering"],
        "correction_path": "Consider using public data APIs instead of scraping private profiles.",
        "educational_reason": None
    })
    
    result = audit_content_for_ethical_integrity("Scraping private social media profiles for ads")
    assert result["is_safe"] is False
    assert result["is_refusal"] is False
    assert "correction_path" in result and result["correction_path"] is not None
