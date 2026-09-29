import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class PrescriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    prescription_reference = Column(String(100), unique=True, nullable=False, index=True)
    prescribed_date = Column(Date, default=date.today, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(SQLEnum(PrescriptionStatus, native_enum=False), default=PrescriptionStatus.ACTIVE, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient_user = relationship("User", foreign_keys=[patient_user_id])
    doctor_profile = relationship("DoctorProfile", foreign_keys=[doctor_profile_id])
    consultation = relationship("Consultation", foreign_keys=[consultation_id])
    medications = relationship("Medication", back_populates="prescription", cascade="all, delete-orphan")
