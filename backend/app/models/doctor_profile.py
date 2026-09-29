import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    profile_image_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    specialization = Column(String(255), nullable=False, index=True)
    qualification = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=0, nullable=False)
    languages = Column(String(255), default="English, Hindi", nullable=True)
    consultation_type = Column(String(100), default="IN_PERSON_AND_ONLINE", nullable=False)
    availability_info = Column(String(255), default="Mon - Fri (09:00 AM - 05:00 PM)", nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id])
    credential = relationship("DoctorCredential", back_populates="doctor_profile", uselist=False, cascade="all, delete-orphan")
    hospital_mappings = relationship("DoctorHospitalMapping", back_populates="doctor_profile", cascade="all, delete-orphan")

class DoctorCredential(Base):
    __tablename__ = "doctor_credentials"

    id = Column(Integer, primary_key=True, index=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    professional_id = Column(String(100), unique=True, nullable=False, index=True)
    qualification_summary = Column(String(255), nullable=False)
    certifications = Column(Text, nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor_profile = relationship("DoctorProfile", back_populates="credential")
    verified_by_user = relationship("User", foreign_keys=[verified_by_user_id])
