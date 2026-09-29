from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.conversation import ConversationType, ConversationStatus
from app.schemas.message import MessageResponse

class ConversationCreate(BaseModel):
    doctor_profile_id: int
    conversation_type: Optional[ConversationType] = ConversationType.GENERAL
    initial_message: Optional[str] = None

class ConversationResponse(BaseModel):
    id: int
    patient_user_id: int
    doctor_profile_id: int
    conversation_type: ConversationType
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime
    
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    unread_count: int = 0
    latest_message: Optional[MessageResponse] = None

    class Config:
        from_attributes = True
