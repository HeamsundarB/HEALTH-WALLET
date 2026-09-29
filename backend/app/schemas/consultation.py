from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class ConsultationCreate(BaseModel):
    symptoms: Optional[str] = Field(None, description="Patient symptoms described during consult")
    diagnosis: str = Field(..., description="Clinical diagnosis summary")
    notes: Optional[str] = Field(None, description="Detailed physician notes")
    treatment_plan: Optional[str] = Field(None, description="Prescribed treatment plan & follow-up instructions")
    consultation_date: Optional[date] = Field(None, description="Date of consultation (defaults to today)")

class ConsultationOut(BaseModel):
    id: int
    appointment_id: int
    patient_user_id: int
    patient_name: Optional[str] = None
    doctor_profile_id: int
    doctor_name: Optional[str] = None
    specialization: Optional[str] = None
    symptoms: Optional[str] = None
    diagnosis: str
    notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    consultation_date: date
    health_record_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
