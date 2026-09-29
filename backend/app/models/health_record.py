import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, Date, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class RecordType(str, PyEnum):
    CONSULTATION = "CONSULTATION"
    DIAGNOSIS = "DIAGNOSIS"
    TREATMENT = "TREATMENT"
    HOSPITAL_ADMISSION = "HOSPITAL_ADMISSION"
    SURGERY = "SURGERY"
    LAB_TEST = "LAB_TEST"
    IMAGING = "IMAGING"
    ALLERGY = "ALLERGY"
    VACCINATION = "VACCINATION"
    PRESCRIPTION = "PRESCRIPTION"

class HealthRecord(BaseModel):
    __tablename__ = "health_records"

    patient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    record_type = Column(Enum(RecordType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    record_date = Column(Date, nullable=False, index=True)
    provider_name = Column(String(255), nullable=True)
    facility_name = Column(String(255), nullable=True)
    status = Column(String(50), default="COMPLETED", nullable=False)

    patient_user = relationship("User", backref="health_records")
