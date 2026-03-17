import numpy as np
import pytest
import os
from unittest.mock import MagicMock, patch

# We need to mock the FAISS index and the embedding model since it's heavy
@patch('services.retrieval_service.VectorRepository.load_index')
@patch('services.retrieval_service.EmbeddingModel')
def test_vector_repository_search(mock_model_class, mock_load_index):
    from services.retrieval_service import VectorRepository
    
    # Mock embedding model
    mock_model = mock_model_class.get_instance.return_value
    mock_model.encode.return_value = np.random.rand(1, 384).astype('float32')
    
    # Mock FAISS index
    mock_index = MagicMock()
    mock_index.search.return_value = (np.array([[0.1, 0.4]]), np.array([[10, 20]])) # distances, indices
    mock_load_index.return_value = mock_index
    
    # Mock Session and DB queries
    mock_db = MagicMock()
    mock_doc1 = MagicMock(title="Doc 1", content="Content 1", category="Cat 1")
    mock_doc2 = MagicMock(title="Doc 2", content="Content 2", category="Cat 2")
    
    # Mock query filter and all
    mock_db.query.return_value.get.side_effect = [mock_doc1, mock_doc2]
    
    repo = VectorRepository()
    results = repo.search_similar("test query", k=2, db=mock_db)
    
    assert len(results) == 2
    assert results[0]["title"] == "Doc 1"
    assert results[0]["_distance"] == pytest.approx(0.1)
    assert results[1]["_distance"] == pytest.approx(0.4)
