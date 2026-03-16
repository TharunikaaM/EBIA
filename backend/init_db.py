import json
import logging
from database import engine, Base, SessionLocal, Document
from models.embedding_model import EmbeddingModel
import faiss
import numpy as np
import os
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    # 1. Create Tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    # 2. Seed Data if empty
    if db.query(Document).count() == 0:
        logger.info("Seeding database from sample_documents.json...")
        if os.path.exists(settings.DATA_PATH):
            data = None
            # Try decodings in order of likelihood
            for encoding in ["utf-8-sig", "utf-8", "latin-1"]:
                try:
                    with open(settings.DATA_PATH, "r", encoding=encoding) as f:
                        data = json.load(f)
                    logger.info(f"Successfully loaded data using {encoding} encoding.")
                    break
                except (UnicodeDecodeError, json.JSONDecodeError) as e:
                    logger.debug(f"Failed to decode with {encoding}: {e}")
                    continue
            
            if data is None:
                logger.error(f"Failed to decode {settings.DATA_PATH} with common encodings.")
                return

            for item in data:
                doc = Document(
                    title=item.get("title", "Untitled"),
                    content=item.get("content", ""),
                    category=item.get("category", "General")
                )
                db.add(doc)
            db.commit()
            logger.info(f"Seeded {len(data)} documents.")
        else:
            logger.warning(f"Sample data not found at {settings.DATA_PATH}")
    else:
        logger.info("Database already contains data, skipping seed.")

    # 3. Generate FAISS Index
    logger.info("Generating FAISS index from database...")
    documents = db.query(Document).all()
    if not documents:
        logger.warning("No documents found in database to index.")
        return

    texts = [doc.content for doc in documents]
    model = EmbeddingModel().model
    vectors = model.encode(texts)
    vectors = np.array(vectors).astype('float32')

    dimension = vectors.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(vectors)

    os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)
    faiss.write_index(index, settings.FAISS_INDEX_PATH)
    logger.info(f"FAISS index saved to {settings.FAISS_INDEX_PATH}")
    logger.info("Database and FAISS index initialized successfully.")
    
    db.close()

if __name__ == "__main__":
    init_db()
