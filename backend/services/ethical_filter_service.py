"""
Service for applying multi-layered and contextual ethical filtering for startup ideas.
"""
import json
from services.llm_service import LLMService
import logging
from typing import Dict, Any, List

from database import AuditLog
from sqlalchemy.orm import Session
from datetime import datetime
from config.prompts import PromptConfig

logger = logging.getLogger(__name__)

async def audit_content_for_ethical_integrity(
    content_text: str, 
    is_generated_advice: bool = False, 
    db: Session = None, 
    user_email: str = None
) -> Dict[str, Any]:
    """
    Performs a multi-layered ethical audit on startup inputs or system-generated advice.
    Returns a structured safety evaluation and records triggers for compliance auditing.
    """
    audit_target = "GENERATED ADVICE" if is_generated_advice else "USER STARTUP IDEA"
    
    analysis_prompt = PromptConfig.get_ethical_audit_prompt(audit_target, content_text)
    
    # Initialize default safety state
    safety_report = {
        "is_safe": True,
        "is_refusal": False,
        "flags": [],
        "correction_path": None,
        "educational_reason": None
    }

    try:
        raw_llm_response = await LLMService.generate(analysis_prompt, json_format=True)
        llm_data = json.loads(raw_llm_response.replace('```json', '').replace('```', '').strip())
        safety_report.update(llm_data)
        
    except Exception as e:
        logger.error(f"Ethical Audit LLM Failure: {e}")

    # Compliance Layer: Persistence in Audit Log
    if db and user_email and (not safety_report["is_safe"] or safety_report["is_refusal"]):
        try:
            audit_entry = AuditLog(
                user_email=user_email,
                action="ETHICAL_INTEGRITY_TRIGGERED" if not safety_report["is_refusal"] else "EVALUATION_DENIED",
                details={
                    "audit_target": audit_target,
                    "flags": safety_report["flags"],
                    "is_refusal": safety_report["is_refusal"]
                }
            )
            db.add(audit_entry)
            db.commit()
            logger.warning(f"Ethical integrity audit triggered for {user_email}.")
        except Exception as audit_err:
            logger.error(f"Audit log persistence failure: {audit_err}")

    return safety_report
