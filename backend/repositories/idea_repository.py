from sqlalchemy.orm import Session
from models.idea import IdeaModel
from typing import Optional, List
import json

class IdeaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, idea_id: str) -> Optional[IdeaModel]:
        return self.db.query(IdeaModel).filter(IdeaModel.id == idea_id).first()

    def create(self, user_id: str, idea_text: str, is_private: bool, evaluation_result: dict) -> IdeaModel:
        new_idea = IdeaModel(
            user_id=user_id,
            idea=idea_text,
            is_private=is_private,
            evaluation_result=evaluation_result
        )
        self.db.add(new_idea)
        self.db.commit()
        self.db.refresh(new_idea)
        return new_idea

    def update_evaluation(self, idea_id: str, idea_text: str, is_private: bool, evaluation_result: dict) -> Optional[IdeaModel]:
        idea = self.get_by_id(idea_id)
        if idea:
            idea.idea = idea_text
            idea.is_private = is_private
            idea.evaluation_result = evaluation_result
            self.db.commit()
        return idea
