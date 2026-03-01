"""
Service for applying rule-based ethical filtering to ideas.
"""

BANNED_KEYWORDS = [
    "weapon", "illegal", "fraud", "scam", "harm", "exploit", "unethical"
]

def check_ethical_flags(text: str) -> list:
    """
    Checks the proposed idea against a list of banned/unethical keywords.
    Returns a list of flagged terms or concerns.
    """
    flags = []
    text_lower = text.lower()
    
    for word in BANNED_KEYWORDS:
        if word in text_lower:
            flags.append(f"Potential ethical concern found related to: {word}")
            
    return flags
