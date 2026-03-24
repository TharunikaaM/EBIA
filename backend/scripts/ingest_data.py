"""
Data ingestion pipeline for EBIA Market Evidence.
Loads data from local JSON, creates 'Evidence Blobs' for context-aware embeddings,
stores in the market_evidence table, and updates the FAISS index.
"""
import sys
import os
import json
import logging
import numpy as np
import faiss
from typing import List, Dict, Any

# Ensure the backend directory is on the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, MarketEvidence
from config import settings
from models.embedding_model import EmbeddingModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def load_local_json(file_path: str) -> List[Dict[str, Any]]:
    """Loads raw data from a local JSON file."""
    if not file_path or not os.path.exists(file_path):
        logger.warning(f"File not found: {file_path}")
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {e}")
        return []


def create_evidence_blob(title: str, category: str, content: str, doc_metadata: Dict) -> str:
    """Creates a context-enriched string for richer FAISS vector embeddings."""
    meta = doc_metadata or {}
    trend = meta.get("market_trend") or ""
    risk = meta.get("risk") or ""
    location = meta.get("location") or ""

    blob = f"Industry: {category}. Title: {title}. Content: {content}."
    if trend:
        blob += f" Trend: {trend}."
    if risk:
        blob += f" Risk: {risk}."
    if location:
        blob += f" Location: {location}."
    return blob.strip()


def ingest_data():
    """Main ingestion pipeline."""
    # Ensure the directory for FAISS index exists
    data_dir = os.path.dirname(os.path.abspath(settings.FAISS_INDEX_PATH))
    os.makedirs(data_dir, exist_ok=True)

    # 1. Load raw data
    all_data = load_local_json(settings.DATA_PATH)
    if not all_data:
        logger.info("No data found to ingest.")
        return

    db = SessionLocal()
    embedding_model = EmbeddingModel(settings.EMBEDDING_MODEL_NAME).model
    newly_added_blobs = []
    success_count = 0

    try:
        # 2. Store each entry in the database (skip duplicates)
        for entry in all_data:
            title = entry.get("title") or entry.get("domain") or "Untitled"
            content = entry.get("content", "")
            category = entry.get("category") or entry.get("domain") or "General"
            doc_metadata = entry.get("metadata") or {}

            if not content:
                logger.warning(f"Skipping entry with empty content: {title}")
                continue

            # Skip if already exists
            if db.query(MarketEvidence).filter(MarketEvidence.content == content).first():
                logger.debug(f"Already exists, skipping: {title[:40]}")
                continue

            new_doc = MarketEvidence(
                title=title,
                content=content,
                category=category,
                doc_metadata=doc_metadata
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)

            success_count += 1
            blob = create_evidence_blob(title, category, content, doc_metadata)
            newly_added_blobs.append(blob)
            logger.info(f"Saved: {title}")

        # 3. Update FAISS index with new vectors
        if newly_added_blobs:
            logger.info(f"Encoding {len(newly_added_blobs)} new evidence blobs...")
            new_vectors = embedding_model.encode(newly_added_blobs)
            new_vectors = np.array(new_vectors).astype("float32")
            dimension = new_vectors.shape[1]

            if os.path.exists(settings.FAISS_INDEX_PATH) and os.path.getsize(settings.FAISS_INDEX_PATH) > 0:
                index = faiss.read_index(settings.FAISS_INDEX_PATH)
                logger.info(f"Loaded existing FAISS index ({index.ntotal} vectors).")
            else:
                index = faiss.IndexFlatL2(dimension)
                logger.info("Created new FAISS index.")

            index.add(new_vectors)
            faiss.write_index(index, settings.FAISS_INDEX_PATH)
            logger.info(f"FAISS index updated. Total vectors: {index.ntotal}")
        else:
            logger.info("No new documents to index.")

        logger.info(f"✅ Ingestion complete. {success_count} new documents added.")

    except Exception as e:
        logger.error(f"Ingestion error: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    ingest_data()
