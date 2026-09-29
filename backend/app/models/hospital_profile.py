from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.doctor_profile import VerificationStatus

class HospitalProfile(Base):
    __tablename__ = "hospital_profiles"

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    registration_number = Column(String(100), unique=True, nullable=False, index=True)
    address = Column(String(500), nullable=False)
    location_city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    working_hours = Column(String(255), default="24/7 Emergency & OPD (08:00 AM - 08:00 PM)", nullable=False)
    services_summary = Column(Text, nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    admin_user = relationship("User", foreign_keys=[admin_user_id])
    verified_by_user = relationship("User", foreign_keys=[verified_by_user_id])
    departments = relationship("HospitalDepartment", back_populates="hospital_profile", cascade="all, delete-orphan")
    doctor_mappings = relationship("DoctorHospitalMapping", back_populates="hospital_profile", cascade="all, delete-orphan")

class HospitalDepartment(Base):
    __tablename__ = "hospital_departments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_profile_id = Column(Integer, ForeignKey("hospital_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    hospital_profile = relationship("HospitalProfile", back_populates="departments")
    doctor_mappings = relationship("DoctorHospitalMapping", back_populates="department")

class DoctorHospitalMapping(Base):
    __tablename__ = "doctor_hospital_mappings"

    id = Column(Integer, primary_key=True, index=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_profile_id = Column(Integer, ForeignKey("hospital_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("hospital_departments.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    joined_date = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor_profile = relationship("DoctorProfile", back_populates="hospital_mappings")
    hospital_profile = relationship("HospitalProfile", back_populates="doctor_mappings")
    department = relationship("HospitalDepartment", back_populates="doctor_mappings")
