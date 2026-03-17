from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_info: Optional[Dict[str, Any]] = None

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleToken(BaseModel):
    token: str
