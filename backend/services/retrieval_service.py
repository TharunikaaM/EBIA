import time
import logging
from typing import List, Dict, Any

from models.embedding_model import EmbeddingModel
from repositories.vector_repository import VectorRepository
from utils.text_cleaner import clean_text

logger = logging.getLogger(__name__)

class RetrievalService:
    """
    Orchestrates the retrieval of public market evidence using FAISS and Sentence-Transformers.
    """
    def __init__(self):
        self.embedding_model = EmbeddingModel().model
        self.repository = VectorRepository()
        
        # Populate index if it's empty but we have documents
        if self.repository.index.ntotal == 0 and self.repository.documents:
            texts = [doc["content"] for doc in self.repository.documents]
            vectors = self.embedding_model.encode(texts)
            self.repository.index.add(vectors)

    def retrieve_market_evidence(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves high-performance similarity search results from public documents only.
        """
        start_time = time.time()
        cleaned_text = clean_text(query_text)
        
        # Encode and search
        query_vector = self.embedding_model.encode([cleaned_text])[0]
        results = self.repository.search(query_vector, top_k=top_k)
        
        duration_ms = (time.time() - start_time) * 1000
        distances = [doc.get("_distance", 0) for doc in results]
        
        logger.info(f"Retrieval Service: ExecutionTime={duration_ms:.2f}ms, MatchDistances={distances}")
        return results
