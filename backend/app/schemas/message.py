from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MessageCreate(BaseModel):
    message_text: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_user_id: int
    message_text: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    sender_name: Optional[str] = None
    is_mine: Optional[bool] = None

    class Config:
        from_attributes = True
