from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.conversation import Conversation, ConversationStatus, ConversationType
from app.models.message import Message
from app.models.doctor_profile import DoctorProfile
from app.models.user import User, RoleName
from app.schemas.conversation import ConversationCreate

class ConversationService:

    @staticmethod
    def get_or_create_conversation(db: Session, patient_user_id: int, schema: ConversationCreate) -> Conversation:
        # Validate doctor profile exists
        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.id == schema.doctor_profile_id).first()
        if not doc_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified doctor profile not found")

        # Check for existing active conversation between this patient & doctor for the given conversation_type
        existing = db.query(Conversation).filter(
            Conversation.patient_user_id == patient_user_id,
            Conversation.doctor_profile_id == schema.doctor_profile_id,
            Conversation.conversation_type == schema.conversation_type,
            Conversation.status == ConversationStatus.ACTIVE
        ).first()

        if existing:
            if schema.initial_message:
                from app.services.message_service import MessageService
                MessageService.send_message(db, existing.id, patient_user_id, schema.initial_message)
            return existing

        # Create new conversation
        conversation = Conversation(
            patient_user_id=patient_user_id,
            doctor_profile_id=schema.doctor_profile_id,
            conversation_type=schema.conversation_type or ConversationType.GENERAL,
            status=ConversationStatus.ACTIVE
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        if schema.initial_message:
            from app.services.message_service import MessageService
            MessageService.send_message(db, conversation.id, patient_user_id, schema.initial_message)

        return conversation

    @staticmethod
    def get_user_conversations(db: Session, current_user_id: int) -> List[Conversation]:
        user = db.query(User).filter(User.id == current_user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        is_doctor = any(ur.role.name in [RoleName.DOCTOR, "DOCTOR"] for ur in user.roles)

        if is_doctor:
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user_id).first()
            if not doc_profile:
                return []
            return db.query(Conversation).filter(Conversation.doctor_profile_id == doc_profile.id).order_by(Conversation.updated_at.desc()).all()
        else:
            return db.query(Conversation).filter(Conversation.patient_user_id == current_user_id).order_by(Conversation.updated_at.desc()).all()

    @staticmethod
    def get_conversation_by_id(db: Session, conversation_id: int, current_user_id: int) -> Conversation:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        # Security check: Patient ownership or doctor profile ownership
        if conversation.patient_user_id != current_user_id:
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user_id).first()
            if not doc_profile or conversation.doctor_profile_id != doc_profile.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to conversation")

        return conversation

    @staticmethod
    def close_conversation(db: Session, conversation_id: int, current_user_id: int) -> Conversation:
        conversation = ConversationService.get_conversation_by_id(db, conversation_id, current_user_id)
        conversation.status = ConversationStatus.CLOSED
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def calculate_unread_count(db: Session, conversation_id: int, current_user_id: int) -> int:
        return db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_user_id != current_user_id,
            Message.is_read == False
        ).count()
