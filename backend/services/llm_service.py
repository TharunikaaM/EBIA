import requests
import json
import logging
import time
from config import settings
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LLMService:
    @staticmethod
    def generate(prompt: str, json_format: bool = False) -> str:
        """
        Sends a prompt to Groq API if key is present, otherwise falls back to local Ollama.
        """
        start_time = time.time()
        
        if settings.GROQ_API_KEY:
            response = LLMService._generate_groq(prompt, json_format)
        else:
            response = LLMService._generate_ollama(prompt, json_format)
            
        duration = (time.time() - start_time) * 1000 # ms
        logger.info(f"LLM Generation Performance: Total_Latency={duration:.2f}ms")
        
        return response

    @staticmethod
    def _generate_groq(prompt: str, json_format: bool) -> str:
        logger.info("Using Groq API for LLM generation.")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        # Use a more standard robust model ID
        payload: Dict[str, Any] = {
            "model": "llama3-70b-8192", 
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        if json_format:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            if response.status_code != 200:
                logger.error(f"Groq API Error: {response.status_code} - {response.text}")
                response.raise_for_status()
                
            result = response.json()
            usage = result.get("usage", {})
            logger.info(f"Groq Usage: Tokens={usage.get('total_tokens')}")
            
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Groq failure, checking for local fallback: {e}")
            # If Ollama is not expected to be there, we should fail gracefully instead of timing out again
            return LLMService._generate_ollama(prompt, json_format)

    @staticmethod
    def _generate_ollama(prompt: str, json_format: bool) -> str:
        logger.info("Checking local Ollama fallback...")
        payload: Dict[str, Any] = {
            "model": settings.OLLAMA_MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
        if json_format:
            payload["format"] = "json"
            
        try:
            # Short timeout for checking if Ollama exists locally
            response = requests.post(settings.OLLAMA_API_URL, json=payload, timeout=5)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except Exception as e:
            logger.warning(f"Ollama not available or failed: {e}")
            if json_format:
                return json.dumps({
                    "error": "LLM_UNAVAILABLE",
                    "reason": "Both Groq and local Ollama are unreachable.",
                    "educational_reason": "System is currently offline or API quota exceeded. Please check GROQ_API_KEY in .env"
                })
            return "Error: LLM services are currently unavailable. Please check your connection or Groq API key."
