import requests
import logging
from infrastructure.llm.base import LLMProvider
from config import settings

logger = logging.getLogger(__name__)

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str, model_name: str):
        self.base_url = base_url
        self.model_name = model_name

    def generate(self, prompt: str, json_format: bool = False) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }
        if json_format:
            payload["format"] = "json"
            
        try:
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return "{}" if json_format else "Error generating response."
