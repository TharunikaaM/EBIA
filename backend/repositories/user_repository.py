from sqlalchemy.orm import Session
from models.user import UserModel
from datetime import datetime
from typing import Optional

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_id(self, user_id: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def create(self, email: str, name: str = None, picture: str = None) -> UserModel:
        user = UserModel(email=email, name=name, picture=picture, created_at=datetime.utcnow())
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_profile(self, user_id: str, name: str = None, picture: str = None) -> Optional[UserModel]:
        user = self.get_by_id(user_id)
        if user:
            if name: user.name = name
            if picture: user.picture = picture
            self.db.commit()
            self.db.refresh(user)
        return user
