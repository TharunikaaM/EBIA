import sys
import os
import json
import logging
import numpy as np
import faiss
from typing import List, Dict, Any

# Add the backend directory to sys.path to allow imports from database, models, etc.
# This assumes the script is run from the backend directory or the root.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from database import SessionLocal, Document
    from config import settings
    from models.embedding_model import EmbeddingModel
except ImportError:
    # Fallback if pathing is slightly different in execution environment
    sys.path.append(os.getcwd())
    from database import SessionLocal, Document
    from config import settings
    from models.embedding_model import EmbeddingModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_local_json(file_path: str) -> List[Dict[str, Any]]:
    """Loads raw data from a local JSON file."""
    if not file_path:
        logger.warning("No file path provided for local JSON loading.")
        return []
        
    if not os.path.exists(file_path):
        logger.warning(f"File not found: {file_path}")
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            else:
                logger.warning(f"JSON data in {file_path} is not a list.")
                return []
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {e}")
        return []

def fetch_external_data() -> List[Dict[str, Any]]:
    """
    Placeholder function for a web scraper/API fetcher.
    Designed to pull data from public sources like 'Pelesis Blogs' or business forums.
    """
    logger.info("External data fetcher placeholder called.")
    # Future implementation: 
    # response = requests.get("https://pelesis.blogs/api/posts")
    # return response.json()
    return []

def ingest_data():
    """Main ingestion pipeline."""
    # Ensure data directory exists for FAISS
    data_dir = os.path.dirname(os.path.abspath(settings.FAISS_INDEX_PATH))
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        logger.info(f"Created directory: {data_dir}")

    # 1. Load data from sources
    raw_data = load_local_json(settings.DATA_PATH)
    external_data = fetch_external_data()
    all_data = raw_data + external_data

    if not all_data:
        logger.info("No data found to ingest.")
        return

    db = SessionLocal()
    
    # Initialize embedding model (singleton)
    embedding_instance = EmbeddingModel(settings.EMBEDDING_MODEL_NAME)
    embedding_model = embedding_instance.model
    
    newly_added_contents = []
    success_count = 0

    try:
        # 2. Processing & Storage in PostgreSQL
        for entry in all_data:
            # Map fields from JSON to Document model
            # Handling sample_documents.json structure (domain -> category)
            title = entry.get("title") or entry.get("domain") or "Untitled"
            content = entry.get("content", "")
            category = entry.get("category") or entry.get("domain") or "General"

            if not content:
                logger.warning("Skipping entry with empty content.")
                continue

            # Efficiency Requirements: Check if Exists logic
            existing_doc = db.query(Document).filter(Document.content == content).first()
            if existing_doc:
                logger.debug(f"Document already exists in database: {title[:30]}...")
                continue

            # Create new document entry
            new_doc = Document(
                title=title,
                content=content,
                category=category
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)
            
            success_count += 1
            newly_added_contents.append(content)
            logger.info(f"Successfully saved to database: {title}")

        # 3. Embedding Generation & FAISS Indexing
        if newly_added_contents:
            logger.info(f"Generating embeddings for {len(newly_added_contents)} new documents...")
            new_vectors = embedding_model.encode(newly_added_contents)
            
            # FAISS Indexing logic
            dimension = 384  # Dimension for all-MiniLM-L6-v2
            
            if os.path.exists(settings.FAISS_INDEX_PATH) and os.path.getsize(settings.FAISS_INDEX_PATH) > 0:
                index = faiss.read_index(settings.FAISS_INDEX_PATH)
                logger.info(f"Loaded existing FAISS index with {index.ntotal} vectors.")
            else:
                index = faiss.IndexFlatL2(dimension)
                logger.info("Created new FAISS index (IndexFlatL2).")

            # Add new vectors to index
            index.add(np.array(new_vectors).astype('float32'))
            
            # Save the resulting index
            faiss.write_index(index, settings.FAISS_INDEX_PATH)
            logger.info(f"Successfully added vectors to index. Total vectors: {index.ntotal}")
        else:
            logger.info("No new documents to index in FAISS.")

        logger.info(f"Ingestion complete. {success_count} documents processed.")

    except Exception as e:
        logger.error(f"An error occurred during data ingestion: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    ingest_data()
