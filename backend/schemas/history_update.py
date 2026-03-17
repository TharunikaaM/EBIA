from pydantic import BaseModel
from typing import Optional

class HistoryUpdateRequest(BaseModel):
    custom_title: Optional[str] = None
    is_private: Optional[bool] = None
