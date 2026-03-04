"""
Utility functions for text cleaning and preprocessing.
"""
import re

def clean_text(text: str) -> str:
    """
    Cleans the input text by removing extra whitespaces, 
    special characters, and lowercasing it.
    """
    if not text:
        return ""
    
    # Remove special characters and digits (optional, based on need)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip().lower()
