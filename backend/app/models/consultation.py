from datetime import datetime, date
from sqlalchemy import Column, Integer, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    symptoms = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    consultation_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    appointment = relationship("Appointment", back_populates="consultation")
    patient_user = relationship("User", foreign_keys=[patient_user_id])
    doctor_profile = relationship("DoctorProfile", foreign_keys=[doctor_profile_id])
