"""
Database initialization script for EBIA.
Creates all tables, seeds market evidence data, and generates the FAISS index
using context-enriched 'Evidence Blobs' for better semantic search.
"""
import json
import logging
import os
import numpy as np
import faiss

from database import engine, Base, SessionLocal, MarketEvidence
from models.embedding_model import EmbeddingModel
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_evidence_blob(doc: MarketEvidence) -> str:
    """
    Creates a context-enriched string for richer FAISS vector embeddings.
    Merges title, category, content, and all metadata fields into one blob.
    """
    meta = doc.doc_metadata or {}
    trend = meta.get("market_trend") or ""
    risk = meta.get("risk") or ""
    location = meta.get("location") or ""

    blob = f"Industry: {doc.category}. Title: {doc.title}. Content: {doc.content}."
    if trend:
        blob += f" Trend: {trend}."
    if risk:
        blob += f" Risk: {risk}."
    if location:
        blob += f" Location: {location}."
    return blob.strip()


def init_db():
    # 1. Create all tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")

    db = SessionLocal()

    try:
        # 2. Seed market evidence data if the table is empty
        if db.query(MarketEvidence).count() == 0:
            logger.info("Seeding database from sample_documents.json...")
            if not os.path.exists(settings.DATA_PATH):
                logger.warning(f"Sample data not found at: {settings.DATA_PATH}")
            else:
                data = None
                for encoding in ["utf-8-sig", "utf-8", "latin-1"]:
                    try:
                        with open(settings.DATA_PATH, "r", encoding=encoding) as f:
                            data = json.load(f)
                        logger.info(f"Loaded data successfully with '{encoding}' encoding.")
                        break
                    except (UnicodeDecodeError, json.JSONDecodeError):
                        continue

                if data is None:
                    logger.error(f"Failed to decode '{settings.DATA_PATH}'. Aborting seed.")
                    return

                for item in data:
                    doc = MarketEvidence(
                        title=item.get("title") or item.get("domain") or "Untitled",
                        content=item.get("content", ""),
                        category=item.get("category") or item.get("domain") or "General",
                        doc_metadata=item.get("metadata")
                    )
                    db.add(doc)

                db.commit()
                logger.info(f"Seeded {len(data)} market evidence documents.")
        else:
            logger.info("Database already seeded. Skipping.")

        # 3. Regenerate the FAISS index from all evidence blobs
        logger.info("Generating FAISS index from enriched evidence blobs...")
        documents = db.query(MarketEvidence).all()

        if not documents:
            logger.warning("No documents found in database. FAISS index not created.")
            return

        blobs = [create_evidence_blob(doc) for doc in documents]
        logger.info(f"Encoding {len(blobs)} evidence blobs...")

        model = EmbeddingModel().model
        vectors = model.encode(blobs)
        vectors = np.array(vectors).astype("float32")

        dimension = vectors.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(vectors)

        os.makedirs(os.path.dirname(os.path.abspath(settings.FAISS_INDEX_PATH)), exist_ok=True)
        faiss.write_index(index, settings.FAISS_INDEX_PATH)
        logger.info(f"FAISS index saved with {index.ntotal} enriched vectors → {settings.FAISS_INDEX_PATH}")
        logger.info("✅ Database and FAISS index initialized successfully.")

    except Exception as e:
        logger.error(f"init_db failed: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
