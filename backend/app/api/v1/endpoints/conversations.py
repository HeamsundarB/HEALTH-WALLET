from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
)
from app.schemas.message import MessageCreate, MessageResponse
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService

router = APIRouter()

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    schema: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = ConversationService.get_or_create_conversation(db, current_user.id, schema)
    return build_conversation_response(db, conversation, current_user.id)

@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversations = ConversationService.get_user_conversations(db, current_user.id)
    return [build_conversation_response(db, c, current_user.id) for c in conversations]

@router.get("/{id}", response_model=ConversationResponse)
def get_conversation_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = ConversationService.get_conversation_by_id(db, id, current_user.id)
    return build_conversation_response(db, conversation, current_user.id)

@router.post("/{id}/close", response_model=ConversationResponse)
def close_conversation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = ConversationService.close_conversation(db, id, current_user.id)
    return build_conversation_response(db, conversation, current_user.id)

@router.post("/{id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    id: int,
    schema: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = MessageService.send_message(db, id, current_user.id, schema.message_text)
    return build_message_response(msg, current_user.id)

@router.get("/{id}/messages", response_model=List[MessageResponse])
def list_messages(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = MessageService.get_messages_for_conversation(db, id, current_user.id)
    return [build_message_response(m, current_user.id) for m in messages]

@router.post("/{id}/read-all")
def mark_all_messages_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = MessageService.mark_all_messages_read(db, id, current_user.id)
    return {"status": "ok", "read_count": count}

def build_conversation_response(db: Session, conv, current_user_id: int) -> ConversationResponse:
    resp = ConversationResponse.model_validate(conv)
    if conv.patient_user:
        resp.patient_name = conv.patient_user.full_name
    if conv.doctor_profile:
        resp.doctor_name = f"Dr. {conv.doctor_profile.user.full_name}" if conv.doctor_profile.user else "Doctor"
        resp.doctor_specialization = conv.doctor_profile.specialization
    
    resp.unread_count = ConversationService.calculate_unread_count(db, conv.id, current_user_id)
    if conv.messages:
        resp.latest_message = build_message_response(conv.messages[-1], current_user_id)
    return resp

def build_message_response(msg, current_user_id: int) -> MessageResponse:
    resp = MessageResponse.model_validate(msg)
    resp.sender_name = msg.sender_user.full_name if msg.sender_user else "User"
    resp.is_mine = (msg.sender_user_id == current_user_id)
    return resp
