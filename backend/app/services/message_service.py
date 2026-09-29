from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.services.conversation_service import ConversationService

class MessageService:

    @staticmethod
    def send_message(db: Session, conversation_id: int, sender_user_id: int, message_text: str) -> Message:
        conversation = ConversationService.get_conversation_by_id(db, conversation_id, sender_user_id)

        if not message_text or not message_text.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message text cannot be empty")

        message = Message(
            conversation_id=conversation.id,
            sender_user_id=sender_user_id,
            message_text=message_text.strip(),
            is_read=False
        )
        db.add(message)
        
        # Touch conversation updated_at
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(message)

        # Determine recipient user_id
        if sender_user_id == conversation.patient_user_id:
            recipient_user_id = conversation.doctor_profile.user_id if conversation.doctor_profile else None
            sender_name = conversation.patient_user.full_name if conversation.patient_user else "Patient"
        else:
            recipient_user_id = conversation.patient_user_id
            sender_name = f"Dr. {conversation.doctor_profile.user.full_name}" if conversation.doctor_profile and conversation.doctor_profile.user else "Doctor"

        # Create NEW_MESSAGE notification for recipient if resolved
        if recipient_user_id:
            notif = Notification(
                user_id=recipient_user_id,
                notification_type=NotificationType.NEW_MESSAGE,
                title=f"New Message from {sender_name}",
                message=message_text[:100],
                related_entity_type="conversation",
                related_entity_id=conversation.id,
                is_read=False
            )
            db.add(notif)
            db.commit()

        return message

    @staticmethod
    def get_messages_for_conversation(db: Session, conversation_id: int, current_user_id: int) -> List[Message]:
        conversation = ConversationService.get_conversation_by_id(db, conversation_id, current_user_id)
        
        # Auto-mark unread incoming messages as read when opening conversation
        db.query(Message).filter(
            Message.conversation_id == conversation.id,
            Message.sender_user_id != current_user_id,
            Message.is_read == False
        ).update({"is_read": True, "read_at": datetime.utcnow()}, synchronize_session=False)
        db.commit()

        return db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.created_at.asc()).all()

    @staticmethod
    def mark_message_read(db: Session, message_id: int, current_user_id: int) -> Message:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

        # Verify participant ownership of conversation
        ConversationService.get_conversation_by_id(db, message.conversation_id, current_user_id)

        if message.sender_user_id != current_user_id and not message.is_read:
            message.is_read = True
            message.read_at = datetime.utcnow()
            db.commit()
            db.refresh(message)

        return message

    @staticmethod
    def mark_all_messages_read(db: Session, conversation_id: int, current_user_id: int) -> int:
        conversation = ConversationService.get_conversation_by_id(db, conversation_id, current_user_id)
        
        count = db.query(Message).filter(
            Message.conversation_id == conversation.id,
            Message.sender_user_id != current_user_id,
            Message.is_read == False
        ).update({"is_read": True, "read_at": datetime.utcnow()}, synchronize_session=False)
        db.commit()

        return count
