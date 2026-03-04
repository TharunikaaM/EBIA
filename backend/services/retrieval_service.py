"""
Service for embedded retrieval.
"""
import numpy as np
from models.embedding_model import EmbeddingModel
from repositories.vector_repository import VectorRepository
from utils.text_cleaner import clean_text

class RetrievalService:
    def __init__(self):
        self.embedding_model = EmbeddingModel().model
        self.repository = VectorRepository()
        
        # Populate index if it's empty but we have documents (mocked initial state)
        if self.repository.index.ntotal == 0 and self.repository.documents:
            texts = [doc["content"] for doc in self.repository.documents]
            vectors = self.embedding_model.encode(texts)
            # We don't need to re-add the documents to the list since they are loaded
            self.repository.index.add(vectors)

    def get_similar_documents(self, text: str, top_k: int = 3):
        cleaned_text = clean_text(text)
        query_vector = self.embedding_model.encode([cleaned_text])[0]
        return self.repository.search(query_vector, top_k=top_k)
