from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from jose import jwt, JWTError
from datetime import datetime, timedelta
import logging
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Security settings
SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/google") # Generic placeholder

class TokenAuthRequest(BaseModel):
    token: str

class AuthResponse(BaseModel):
    message: str
    user_info: dict
    access_token: str
    token_type: str = "bearer"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return {"email": email, "name": payload.get("name")}
    except JWTError:
        raise credentials_exception

@router.post("/google", response_model=AuthResponse)
def google_auth(request: TokenAuthRequest):
    """Verifies a Google OAuth token and returns user info + JWT."""
    try:
        # For development/mocking purposes
        if request.token == "mock_token":
             user_info = {"name": "Dev User", "email": "dev@example.com", "picture": "dev"}
             access_token = create_access_token(data={"sub": user_info["email"], "name": user_info["name"]})
             return AuthResponse(
                message="Successfully authenticated (Mock)",
                user_info=user_info,
                access_token=access_token
            )
            
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            request.token, requests.Request(), GOOGLE_CLIENT_ID
        )

        user_info = {
            "name": idinfo.get("name"),
            "email": idinfo.get("email"),
            "picture": idinfo.get("picture"),
            "sub": idinfo.get("sub")
        }
        access_token = create_access_token(data={"sub": user_info["email"], "name": user_info["name"]})

        return AuthResponse(
            message="Successfully authenticated",
            user_info=user_info,
            access_token=access_token
        )

    except ValueError as e:
        logger.error(f"Invalid Token: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
         logger.error(f"Auth error: {e}")
         raise HTTPException(status_code=500, detail="Authentication server error")

@router.post("/guest", response_model=AuthResponse)
def guest_auth():
    """Allows a user to continue as a guest with a guest JWT."""
    user_info = {"name": "Guest", "email": "guest@local", "role": "guest"}
    access_token = create_access_token(data={"sub": "guest@local", "name": "Guest", "role": "guest"})
    return AuthResponse(
        message="Continuing as guest",
        user_info=user_info,
        access_token=access_token
    )
