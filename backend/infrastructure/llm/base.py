from abc import ABC, abstractmethod
from typing import Optional

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, json_format: bool = False) -> str:
        """Generates a text or JSON response from the LLM."""
        pass
