from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from app.models.appointment import AppointmentStatus

class AppointmentCreate(BaseModel):
    doctor_profile_id: int = Field(..., description="ID of doctor profile")
    appointment_date: date = Field(..., description="Date of appointment (YYYY-MM-DD)")
    appointment_time: str = Field(..., description="Time of appointment e.g. '10:30 AM'")
    reason: Optional[str] = Field(None, description="Reason for visit")

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus = Field(..., description="New appointment status")

class AppointmentOut(BaseModel):
    id: int
    patient_user_id: int
    patient_name: Optional[str] = None
    doctor_profile_id: int
    doctor_name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    appointment_date: date
    appointment_time: str
    reason: Optional[str] = None
    status: AppointmentStatus
    consultation_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
