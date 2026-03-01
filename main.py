"""
Main entry point for the EBIA FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import idea_routes
from config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Startup Idea Intelligence Chatbot with Evidence-Based Improvement Advisor",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(idea_routes.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the EBIA API. Head to /docs for the interactive documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
