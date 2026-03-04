from pydantic import BaseModel, Field
from typing import List

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's message to the chatbot.")

class ChatResponse(BaseModel):
    idea_id: str
    role: str = "assistant"
    message: str
