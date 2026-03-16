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
        Sends a prompt to Groq API if key is present, otherwise falls back to local Ollama.
        """
        if settings.GROQ_API_KEY:
            return LLMService._generate_groq(prompt, json_format)
        else:
            return LLMService._generate_ollama(prompt, json_format)

    @staticmethod
    def _generate_groq(prompt: str, json_format: bool) -> str:
        logger.info("Using Groq API for LLM generation.")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        if json_format:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Error communicating with Groq: {e}")
            return LLMService._generate_ollama(prompt, json_format)

    @staticmethod
    def _generate_ollama(prompt: str, json_format: bool) -> str:
        logger.info("Using local Ollama for LLM generation.")
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
            return "{}" if json_format else "Error generating response from LLM."
