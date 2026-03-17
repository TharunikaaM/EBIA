from pydantic import BaseModel

class ChatResponse(BaseModel):
    response: str
    status: str = "success"
