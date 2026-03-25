"""
Repository for handling FAISS vector database operations.
Loads market evidence from PostgreSQL and provides similarity search.
"""
import faiss
import numpy as np
import os
import logging
from typing import List, Dict, Any

from config import settings
from database import SessionLocal, MarketEvidence
from utils.helpers import load_json

logger = logging.getLogger(__name__)


class VectorRepository:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = None
        self.documents = []
        self._initialize_index()

    def _initialize_index(self):
        """Initializes the FAISS index and pre-loads document metadata from the DB."""
        self.index = faiss.IndexFlatL2(self.dimension)

        db = SessionLocal()
        try:
            db_docs = db.query(MarketEvidence).filter(MarketEvidence.is_public == True).all()
            
            if not db_docs:
                logger.warning("No documents found in DB. Falling back to JSON seed data.")
                raise Exception("Empty DB")
                
            self.documents = [
                {
                    "id": d.id,
                    "title": d.title,
                    "content": d.content,
                    "category": d.category,
                    "is_public": d.is_public,
                    "doc_metadata": d.doc_metadata,  # renamed from 'metadata'
                }
                for d in db_docs
            ]
            logger.info(f"Loaded {len(self.documents)} public market evidence documents from DB.")
        except Exception as e:
            logger.error(f"Failed to load from DB: {e}. Falling back to JSON: {settings.DATA_PATH}")
            if os.path.exists(settings.DATA_PATH):
                self.documents = load_json(settings.DATA_PATH)
            else:
                logger.error(f"Fallback JSON file not found at {settings.DATA_PATH}!")
        finally:
            db.close()

        # Load the pre-built FAISS index if it exists
        if os.path.exists(settings.FAISS_INDEX_PATH):
            self.index = faiss.read_index(settings.FAISS_INDEX_PATH)
            logger.info(f"Loaded FAISS index: {self.index.ntotal} vectors.")
        else:
            logger.warning("No FAISS index found. Run init_db.py to build one.")

    def search(self, query_vector: np.ndarray, top_k: int = 3) -> List[Dict[str, Any]]:
        """Searches for top_k most similar vectors in the FAISS index."""
        if self.index.ntotal == 0:
            logger.warning("FAISS index is empty. Skipping search.")
            return []

        query_vector = np.array([query_vector], dtype="float32") if query_vector.ndim == 1 else query_vector
        distances, indices = self.index.search(query_vector, top_k)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.documents):
                doc = dict(self.documents[idx])
                doc["_distance"] = float(distances[0][i])
                results.append(doc)
        return results

    def save_index(self):
        """Saves the FAISS index to disk."""
        os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)
        faiss.write_index(self.index, settings.FAISS_INDEX_PATH)
        logger.info(f"FAISS index saved to {settings.FAISS_INDEX_PATH}")
