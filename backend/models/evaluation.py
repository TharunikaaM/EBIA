from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .database import Base

class EvaluationHistoryModel(Base):
    __tablename__ = "evaluations_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    input_fields = Column(JSON, nullable=False) # e.g., {"business_type": "EdTech", ...}
    generated_result = Column(JSON, nullable=False) # The raw string/data returned by LLM
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("UserModel", back_populates="evaluations")
