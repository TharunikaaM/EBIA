"""
Repository for handling vector database operations (using FAISS).
"""
import faiss
import numpy as np
import os
import json
import logging
from typing import List, Dict, Any

from config import settings
from utils.helpers import load_json

logger = logging.getLogger(__name__)

class VectorRepository:
    def __init__(self, dimension: int = 384): # Default for all-MiniLM-L6-v2
        self.dimension = dimension
        self.index = None
        self.documents = []
        self._initialize_index()

    def _initialize_index(self):
        """Initializes the FAISS index and loads data if available."""
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # Load sample documents
        if os.path.exists(settings.DATA_PATH):
            self.documents = load_json(settings.DATA_PATH)
            logger.info(f"Loaded {len(self.documents)} documents from data store.")
        else:
            logger.warning(f"Data file not found at {settings.DATA_PATH}. Initializing empty.")

    def add_vectors(self, vectors: np.ndarray, documents: List[Dict[str, Any]]):
        """Adds vectors to the FAISS index and stores corresponding documents."""
        if vectors.shape[1] != self.dimension:
            raise ValueError(f"Vector dimension mismatch. Expected {self.dimension}, got {vectors.shape[1]}")
        
        self.index.add(vectors)
        self.documents.extend(documents)
        logger.info(f"Added {vectors.shape[0]} vectors to index.")

    def search(self, query_vector: np.ndarray, top_k: int = 3) -> List[Dict[str, Any]]:
        """Searches for top_k most similar vectors in the index."""
        if self.index.ntotal == 0:
            logger.warning("Index is empty. Searching skipped.")
            return []

        # FAISS expects 2D array
        query_vector = np.array([query_vector], dtype='float32') if query_vector.ndim == 1 else query_vector
        
        distances, indices = self.index.search(query_vector, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.documents):
                doc = self.documents[idx]
                doc["_distance"] = float(distances[0][i])
                results.append(doc)
        
        return results

    def save_index(self):
        """Saves the FAISS index to disk."""
        os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)
        faiss.write_index(self.index, settings.FAISS_INDEX_PATH)
        logger.info(f"Saved FAISS index to {settings.FAISS_INDEX_PATH}")
