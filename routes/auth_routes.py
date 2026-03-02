from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import logging

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Replace with your actual Google Client ID if available, or load from config
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE"

class TokenAuthRequest(BaseModel):
    token: str

class AuthResponse(BaseModel):
    message: str
    user_info: dict

@router.post("/google", response_model=AuthResponse)
def google_auth(request: TokenAuthRequest):
    """
    Verifies a Google OAuth token and returns user info.
    """
    try:
        # For development/mocking purposes, if token is 'mock_token', allow it
        if request.token == "mock_token":
             return AuthResponse(
                message="Successfully authenticated (Mock)",
                user_info={"name": "Dev User", "email": "dev@example.com", "picture": ""}
            )
            
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            request.token, requests.Request(), GOOGLE_CLIENT_ID
        )

        return AuthResponse(
            message="Successfully authenticated",
            user_info={
                "name": idinfo.get("name"),
                "email": idinfo.get("email"),
                "picture": idinfo.get("picture"),
                "sub": idinfo.get("sub")
            }
        )

    except ValueError as e:
        logger.error(f"Invalid Token: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
         logger.error(f"Auth error: {e}")
         raise HTTPException(status_code=500, detail="Authentication server error")

@router.post("/guest", response_model=AuthResponse)
def guest_auth():
    """
    Allows a user to continue as a guest.
    """
    return AuthResponse(
        message="Continuing as guest",
        user_info={"name": "Guest", "email": "guest@local", "role": "guest"}
    )
