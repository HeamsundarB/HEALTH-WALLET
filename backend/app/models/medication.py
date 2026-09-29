import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class MedicationStatus(str, enum.Enum):
    ONGOING = "ONGOING"
    STOPPED = "STOPPED"
    COMPLETED = "COMPLETED"

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    route = Column(String(100), nullable=False)  # Oral, Topical, Injection, Inhalation, etc.
    start_date = Column(Date, nullable=False)
    stop_date = Column(Date, nullable=True)
    status = Column(SQLEnum(MedicationStatus, native_enum=False), default=MedicationStatus.ONGOING, nullable=False)
    
    reminder_enabled = Column(Boolean, default=False, nullable=False)
    reminder_time = Column(String(50), nullable=True)  # e.g., "08:00 AM", "09:00 PM"
    hospital_name = Column(String(255), nullable=True)
    instructions = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient_user = relationship("User", foreign_keys=[patient_user_id])
    prescription = relationship("Prescription", back_populates="medications", foreign_keys=[prescription_id])
    doctor_profile = relationship("DoctorProfile", foreign_keys=[doctor_profile_id])
    history_entries = relationship("MedicationHistory", back_populates="medication", cascade="all, delete-orphan")
