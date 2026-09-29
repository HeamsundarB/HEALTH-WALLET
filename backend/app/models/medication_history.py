import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.medication import MedicationStatus

class MedicationAction(str, enum.Enum):
    STARTED = "STARTED"
    UPDATED = "UPDATED"
    STOPPED = "STOPPED"
    COMPLETED = "COMPLETED"

class MedicationHistory(Base):
    __tablename__ = "medication_history"

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action = Column(SQLEnum(MedicationAction, native_enum=False), nullable=False)
    previous_status = Column(SQLEnum(MedicationStatus, native_enum=False), nullable=True)
    new_status = Column(SQLEnum(MedicationStatus, native_enum=False), nullable=False)
    notes = Column(Text, nullable=True)
    
    changed_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    medication = relationship("Medication", back_populates="history_entries", foreign_keys=[medication_id])
    patient_user = relationship("User", foreign_keys=[patient_user_id])
