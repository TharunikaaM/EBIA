"""
Core Database Configuration and SQLAlchemy Models for EBIA.
Enforces privacy flags and audit logging for Startup Idea Intelligence.
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class MarketEvidence(Base):
    """
    Represents market evidence documents (blogs, news, reviews).
    Used by the RAG pipeline to ground analysis in real market data.
    NOTE: 'metadata' is reserved by SQLAlchemy, so we use 'doc_metadata'.
    """
    __tablename__ = "market_evidence"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    category = Column(String, index=True)
    doc_metadata = Column(JSON, nullable=True)  # market_trend, risk, location
    is_public = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    """User account for platform access."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Null for Google OAuth users
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class EvaluationHistory(Base):
    """
    Stores historical analysis results.
    is_private: If True, evaluation is restricted to the owner.
    """
    __tablename__ = "evaluation_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True, nullable=False)
    user_email = Column(String, index=True)
    idea_text = Column(Text)
    analysis_results = Column(JSON, nullable=True)
    status = Column(String, default="PENDING")
    error_message = Column(Text, nullable=True)
    custom_title = Column(String, nullable=True)
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    """Tracks ethical triggers and system events for responsible AI auditing."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    action = Column(String, index=True)
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)


class SavedIdea(Base):
    """Stores ideas that the user wants to keep for later."""
    __tablename__ = "saved_ideas"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    title = Column(String)
    content = Column(JSON)  # Stores the full GeneratedIdea object
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
