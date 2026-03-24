from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import logging

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from config import settings
from database import get_db, User
from schemas.auth import UserCreate, UserOut, Token, UserLogin, GoogleToken
from utils.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.ALGORITHM
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)


def get_current_user(db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme)):
    guest_user = {"email": "guest@local", "name": "Guest User"}
    if not token:
        return guest_user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return guest_user
    except JWTError:
        return guest_user

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        return guest_user
    return {"email": user.email, "name": user.full_name}


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(email=user.email, hashed_password=get_password_hash(user.password), full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password",
                            headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/guest", response_model=Token)
def guest_auth():
    logger.info("Guest authentication active")
    access_token = create_access_token(data={"sub": "guest@local"})
    return {"access_token": access_token, "token_type": "bearer",
            "user_info": {"name": "Guest User", "email": "guest@local"}}


@router.post("/google", response_model=Token)
def google_auth(payload: GoogleToken, db: Session = Depends(get_db)):
    """
    Verify the Google ID token from the frontend, upsert the user in DB,
    and return a JWT.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            payload.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        logger.warning(f"Invalid Google token: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    email = id_info.get("email")
    name = id_info.get("name", email)
    picture = id_info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Upsert: find or create user (no password for Google users)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, hashed_password=None, full_name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.full_name != name:
        user.full_name = name
        db.commit()

    access_token = create_access_token(data={"sub": email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": {"name": name, "email": email, "picture": picture},
    }
