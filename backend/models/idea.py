from sqlalchemy import Column, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .database import Base

class IdeaModel(Base):
    __tablename__ = "ideas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    idea = Column(String, nullable=False)
    is_private = Column(Boolean, default=False)
    evaluation_result = Column(JSON, nullable=True) # Output JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("UserModel", back_populates="ideas")
    chats = relationship("ChatHistoryModel", back_populates="idea")
