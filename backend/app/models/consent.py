import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.user import RoleName

class ConsentStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class ConsentScope(str, enum.Enum):
    ALL_HEALTH_RECORDS = "ALL_HEALTH_RECORDS"
    CONSULTATIONS = "CONSULTATIONS"
    DIAGNOSES = "DIAGNOSES"
    TREATMENTS = "TREATMENTS"
    LAB_TESTS = "LAB_TESTS"
    IMAGING = "IMAGING"
    PRESCRIPTIONS = "PRESCRIPTIONS"

class ConsentPurpose(str, enum.Enum):
    CONSULTATION = "CONSULTATION"
    TREATMENT = "TREATMENT"
    LAB_REVIEW = "LAB_REVIEW"
    IMAGING_REVIEW = "IMAGING_REVIEW"
    PRESCRIPTION_REVIEW = "PRESCRIPTION_REVIEW"
    EMERGENCY = "EMERGENCY"
    GENERAL_HEALTHCARE = "GENERAL_HEALTHCARE"

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    requester_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    requester_role = Column(SQLEnum(RoleName), nullable=False)
    purpose = Column(String(255), nullable=False)
    scope = Column(SQLEnum(ConsentScope), nullable=False)
    status = Column(SQLEnum(ConsentStatus), default=ConsentStatus.REQUESTED, nullable=False)

    start_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    sensitive_data_allowed = Column(Boolean, default=False, nullable=False)

    requested_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    patient_user = relationship("User", foreign_keys=[patient_user_id])
    requester_user = relationship("User", foreign_keys=[requester_user_id])

