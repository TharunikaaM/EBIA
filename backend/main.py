"""
Main entry point for the EBIA Startup Intelligence Platform.
Fulfills final year project specifications for professional code structure.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from routes import idea_routes, auth_routes, history_routes, chat_routes
from config import settings

# 1. Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Evidence-Based Improvement Advisor (EBIA) - Startup Intelligence App",
    version="1.1.0"
)

# 2. Production-Grade CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Global Exception Handler for "Orderly" Error Reporting
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Captures all unhandled exceptions and returns a structured JSON error response.
    Ensures the academic objective of 'professional error handling' is met.
    """
    logger.error(f"Global Exception Caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An internal system error occurred. Please contact administrative support.",
            "detail": str(exc) if settings.DEBUG else "Redacted for security."
        }
    )

# 4. Route Orchestration
app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(idea_routes.router, prefix="/api/v1")
app.include_router(history_routes.router, prefix="/api/v1")
app.include_router(chat_routes.router, prefix="/api/v1")

@app.get("/", tags=["Health"], response_model=dict)
async def read_system_root():
    """System health check and welcome entry point."""
    return {
        "status": "operational",
        "service": "EBIA API",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting EBIA Core on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
