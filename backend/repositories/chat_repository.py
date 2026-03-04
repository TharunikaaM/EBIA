from sqlalchemy.orm import Session
from models.chat import ChatHistoryModel
from typing import List

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_history_by_idea(self, idea_id: str, user_id: str) -> List[ChatHistoryModel]:
        return self.db.query(ChatHistoryModel).filter(
            ChatHistoryModel.idea_id == idea_id,
            ChatHistoryModel.user_id == user_id
        ).order_by(ChatHistoryModel.created_at).all()

    def add_message(self, idea_id: str, user_id: str, role: str, message: str) -> ChatHistoryModel:
        record = ChatHistoryModel(
            idea_id=idea_id,
            user_id=user_id,
            role=role,
            message=message
        )
        self.db.add(record)
        self.db.commit()
        return record
