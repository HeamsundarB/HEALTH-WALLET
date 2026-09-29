import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class ConversationType(str, enum.Enum):
    GENERAL = "GENERAL"
    APPOINTMENT = "APPOINTMENT"
    CONSULTATION = "CONSULTATION"
    PRESCRIPTION = "PRESCRIPTION"
    MEDICATION = "MEDICATION"

class ConversationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    conversation_type = Column(SQLEnum(ConversationType, native_enum=False), default=ConversationType.GENERAL, nullable=False)
    status = Column(SQLEnum(ConversationStatus, native_enum=False), default=ConversationStatus.ACTIVE, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient_user = relationship("User", foreign_keys=[patient_user_id])
    doctor_profile = relationship("DoctorProfile", foreign_keys=[doctor_profile_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at.asc()")
