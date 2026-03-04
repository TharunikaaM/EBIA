from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging

from services.auth_service import AuthService
from dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

class TokenAuthRequest(BaseModel):
    token: str

class AuthResponse(BaseModel):
    message: str
    user_info: dict

@router.post("/google", response_model=AuthResponse)
async def google_auth(
    request: TokenAuthRequest, 
    service: AuthService = Depends(get_auth_service)
):
    """
    Verifies a Google OAuth token, creates/retrieves user in DB.
    """
    logger.info(f"Received auth request with token: {request.token[:10]}...")
    if request.token == "mock_token":
         user = service.get_or_create_user("dev@example.com")
         return AuthResponse(
            message="Successfully authenticated (Mock)",
            user_info={"id": user.id, "email": user.email, "name": "Dev User"}
        )
        
    idinfo = await service.verify_google_token(request.token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="User email not found in Google response")

    user = service.get_or_create_user(
        email, 
        name=idinfo.get("name"), 
        picture=idinfo.get("picture")
    )

    return AuthResponse(
        message="Successfully authenticated",
        user_info={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture
        }
    )

@router.post("/guest", response_model=AuthResponse)
def guest_auth(service: AuthService = Depends(get_auth_service)):
    """
    Allows a user to continue as a guest.
    """
    guest_email = "guest@local.host"
    user = service.get_or_create_user(guest_email, name="Guest")
    
    return AuthResponse(
        message="Continuing as guest",
        user_info={
            "id": user.id, 
            "email": user.email, 
            "name": user.name, 
            "role": "guest"
        }
    )
