import requests
import json
import logging
from config import settings
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LLMService:
    @staticmethod
    def generate(prompt: str, json_format: bool = False) -> str:
        """
        Sends a prompt to the local Ollama instance.
        """
        payload = {
            "model": settings.OLLAMA_MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
        
        if json_format:
            payload["format"] = "json"
            
        try:
            response = requests.post(settings.OLLAMA_API_URL, json=payload, timeout=60)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except Exception as e:
            logger.error(f"Error communicating with Ollama: {e}")
            # Fallback for when LLM is unavailable during testing
            return "{}" if json_format else "Error generating response from LLM."
