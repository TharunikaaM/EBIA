from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .database import Base

class ChatHistoryModel(Base):
    __tablename__ = "chat_histories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String, ForeignKey("ideas.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    idea = relationship("IdeaModel", back_populates="chats")
    user = relationship("UserModel", back_populates="chats")
