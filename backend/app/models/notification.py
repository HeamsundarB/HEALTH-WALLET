import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class NotificationType(str, enum.Enum):
    CONSENT_REQUEST = "CONSENT_REQUEST"
    CONSENT_APPROVED = "CONSENT_APPROVED"
    CONSENT_REJECTED = "CONSENT_REJECTED"
    CONSENT_REVOKED = "CONSENT_REVOKED"
    RECORD_ACCESS = "RECORD_ACCESS"
    ACCOUNT_ACTIVITY = "ACCOUNT_ACTIVITY"
    APPOINTMENT_REQUESTED = "APPOINTMENT_REQUESTED"
    APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED"
    APPOINTMENT_REJECTED = "APPOINTMENT_REJECTED"
    APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED"
    CONSULTATION_COMPLETED = "CONSULTATION_COMPLETED"
    PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED"
    PRESCRIPTION_UPDATED = "PRESCRIPTION_UPDATED"
    PRESCRIPTION_CANCELLED = "PRESCRIPTION_CANCELLED"
    MEDICATION_STARTED = "MEDICATION_STARTED"
    MEDICATION_UPDATED = "MEDICATION_UPDATED"
    MEDICATION_STOPPED = "MEDICATION_STOPPED"
    MEDICATION_COMPLETED = "MEDICATION_COMPLETED"
    MEDICATION_REMINDER = "MEDICATION_REMINDER"
    NEW_MESSAGE = "NEW_MESSAGE"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_type = Column(SQLEnum(NotificationType, native_enum=False), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    related_entity_type = Column(String(100), nullable=True)
    related_entity_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
