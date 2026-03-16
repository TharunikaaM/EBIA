"""
Service for applying rule-based and LLM-based ethical filtering to ideas.
"""
import json
from services.llm_service import LLMService
import logging

logger = logging.getLogger(__name__)

BANNED_KEYWORDS = [
    "weapon", "illegal", "fraud", "scam", "harm", "exploit", "unethical"
]

def check_ethical_flags(text: str) -> list:
    """
    Checks the proposed idea against a list of banned/unethical keywords and uses an LLM.
    Returns a list of flagged terms or concerns.
    """
    flags = []
    text_lower = text.lower()
    
    for word in BANNED_KEYWORDS:
        if word in text_lower:
            flags.append(f"Potential ethical concern found related to: {word}")
            
    # LLM check
    prompt = f"""
    Analyze the following startup idea for any ethical concerns, such as direct competitor cloning, manipulative monetization, unrealistic promises, or psychological exploitation.
    Return ONLY a JSON array of specific strings highlighting the concerns. If there are no concerns, return an empty array [].
    
    Idea: {text}
    """
    try:
        response = LLMService.generate(prompt, json_format=True)
        llm_flags = json.loads(response)
        if isinstance(llm_flags, list):
            flags.extend(llm_flags)
        elif isinstance(llm_flags, dict) and "concerns" in llm_flags:
             flags.extend(llm_flags["concerns"])
    except Exception as e:
        logger.error(f"Error in ethical filter LLM call: {e}")
        
    return flags
