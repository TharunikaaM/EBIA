from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta
import logging

from config import settings
from database import get_db, User
from schemas.auth import UserCreate, UserOut, Token, UserLogin
from utils.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Security settings
SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.ALGORITHM
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        if email == "guest@local":
             return {"email": email, "name": "Guest User"}
        raise credentials_exception
    return {"email": user.email, "name": user.full_name}

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user."""
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(request: UserLogin, db: Session = Depends(get_db)):
    """Log in a user and return a JWT token."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Keep legacy endpoints for backward compatibility if needed, but updated to the new flow
@router.post("/guest", response_model=Token)
def guest_auth():
    """Allows a user to continue as a guest with a guest JWT."""
    logger.info("New guest authentication request")
    access_token = create_access_token(data={"sub": "guest@local"})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_info": {"name": "Guest User", "email": "guest@local"}
    }

@router.post("/google", response_model=Token)
def google_auth(payload: dict):
    """
    Handles Google OAuth token exchange.
    For this prototype/academic project, we simulate the validation.
    """
    logger.info("Google authentication request received")
    # In a real app, we would verify the token with Google's API here
    # For now, we simulate a successful login for the mock_token
    guest_email = "google_user@local"
    access_token = create_access_token(data={"sub": guest_email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_info": {"name": "Google User", "email": guest_email}
    }
