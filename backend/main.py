import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import idea_routes, auth_routes, chat_routes
from config import settings
from models.database import engine, Base
from models.user import UserModel
from models.idea import IdeaModel
from models.chat import ChatHistoryModel
from models.evaluation import EvaluationHistoryModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print(">>> EBIA Backend starting up...")
    
    # Ensure data directory exists
    data_dir = os.path.join(os.getcwd(), "data")
    if not os.path.exists(data_dir):
        print(f">>> Creating data directory: {data_dir}")
        os.makedirs(data_dir, exist_ok=True)
        
    # Initialize Database
    print(">>> Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        print(">>> Database initialized successfully.")
    except Exception as e:
        print(f">>> CRITICAL: Database initialization failed: {e}")
        
    yield
    # Shutdown logic
    print(">>> EBIA Backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Startup Idea Intelligence Chatbot with Evidence-Based Improvement Advisor",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(idea_routes.router, prefix="/api/v1")
app.include_router(chat_routes.router, prefix="/api/v1")

@app.get("/")
def read_root():
    print(">>> Root route hit!")
    return {"message": "Welcome to the EBIA API. Head to /docs for the interactive documentation."}

if __name__ == "__main__":
    import uvicorn
    print(">>> Starting Uvicorn...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
