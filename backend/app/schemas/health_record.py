from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from app.models.health_record import RecordType

class HealthRecordCreate(BaseModel):
    record_type: RecordType = Field(..., example="CONSULTATION")
    title: str = Field(..., min_length=2, max_length=255, example="Annual Wellness Consultation")
    description: Optional[str] = Field(None, example="Routine health checkup and vital signs assessment.")
    record_date: date = Field(..., example="2026-03-15")
    provider_name: Optional[str] = Field(None, example="Dr. Demo Physician")
    facility_name: Optional[str] = Field(None, example="City Innovation Healthcare")
    status: Optional[str] = Field("COMPLETED", example="COMPLETED")

class HealthRecordUpdate(BaseModel):
    record_type: Optional[RecordType] = None
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    record_date: Optional[date] = None
    provider_name: Optional[str] = None
    facility_name: Optional[str] = None
    status: Optional[str] = None

class HealthRecordOut(BaseModel):
    id: int
    patient_user_id: int
    record_type: RecordType
    title: str
    description: Optional[str] = None
    record_date: date
    provider_name: Optional[str] = None
    facility_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
