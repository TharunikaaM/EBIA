"""
Singleton wrapper for the embedding model to ensure it is loaded only once.
"""
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class EmbeddingModel:
    _instance = None
    _model = None

    def __new__(cls, model_name: str = 'all-MiniLM-L6-v2'):
        if cls._instance is None:
            cls._instance = super(EmbeddingModel, cls).__new__(cls)
            logger.info(f"Loading embedding model: {model_name}...")
            # For a production setup, model caching should be implemented.
            cls._model = SentenceTransformer(model_name)
        return cls._instance

    @property
    def model(self) -> SentenceTransformer:
        return self._model
