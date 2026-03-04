import httpx
import asyncio
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from repositories.user_repository import UserRepository
from models.user import UserModel
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, user_repository: UserRepository, google_client_id: str):
        self.user_repository = user_repository
        self.google_client_id = google_client_id

    async def verify_google_token(self, token: str) -> dict:
        """Verifies the Google OAuth2 token (JWT or Access Token) and returns the user info."""
        logger.info("Starting token verification...")
        
        # 1. Try as ID Token (JWT)
        try:
            # Note: verify_oauth2_token is blocking, but certs fetch can hang.
            # We run it in a thread to be safe.
            loop = asyncio.get_event_loop()
            id_info = await loop.run_in_executor(
                None, 
                lambda: id_token.verify_oauth2_token(
                    token, 
                    google_requests.Request(), 
                    self.google_client_id
                )
            )
            logger.info("JWT verification successful")
            return id_info
        except Exception as e:
            logger.info(f"JWT verification failed, trying access token: {e}")
            
        # 2. Try as Access Token via UserInfo API (Async)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=5.0
                )
                if response.status_code == 200:
                    logger.info("Access token verification successful")
                    return response.json()
                else:
                    logger.error(f"Access token verification failed: {response.status_code}")
        except Exception as e:
            logger.error(f"Error calling userinfo API: {e}")
            
        return None

    def get_or_create_user(self, email: str, name: str = None, picture: str = None) -> UserModel:
        """Retrieves an existing user by email or creates a new one via repository."""
        user = self.user_repository.get_by_email(email)
        if not user:
            user = self.user_repository.create(email, name, picture)
        else:
            # Sync name/picture if changed or missing
            if (name and not user.name) or (picture and not user.picture):
                user = self.user_repository.update_profile(user.id, name, picture)
        return user
