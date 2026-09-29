from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.models.medication import MedicationStatus

class MedicationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    route: str = Field(..., min_length=1, max_length=100)
    start_date: date
    stop_date: Optional[date] = None
    reminder_enabled: bool = False
    reminder_time: Optional[str] = None
    hospital_name: Optional[str] = None
    instructions: Optional[str] = None

    @field_validator("stop_date")
    @classmethod
    def validate_stop_date(cls, v, values):
        start_date = values.data.get("start_date")
        if v is not None and start_date is not None and v < start_date:
            raise ValueError("stop_date must not be before start_date")
        return v

    @field_validator("reminder_time")
    @classmethod
    def validate_reminder_time(cls, v, values):
        reminder_enabled = values.data.get("reminder_enabled")
        if reminder_enabled and not v:
            raise ValueError("reminder_time is required when reminder_enabled is True")
        return v

class MedicationCreate(MedicationBase):
    prescription_id: Optional[int] = None
    doctor_profile_id: Optional[int] = None

class MedicationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    dosage: Optional[str] = Field(None, min_length=1, max_length=100)
    frequency: Optional[str] = Field(None, min_length=1, max_length=100)
    route: Optional[str] = Field(None, min_length=1, max_length=100)
    start_date: Optional[date] = None
    stop_date: Optional[date] = None
    status: Optional[MedicationStatus] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None
    hospital_name: Optional[str] = None
    instructions: Optional[str] = None

    @field_validator("stop_date")
    @classmethod
    def validate_stop_date(cls, v, values):
        start_date = values.data.get("start_date")
        if v is not None and start_date is not None and v < start_date:
            raise ValueError("stop_date must not be before start_date")
        return v

class MedicationStopRequest(BaseModel):
    stop_date: Optional[date] = None
    notes: Optional[str] = None

class MedicationReminderUpdate(BaseModel):
    reminder_enabled: bool
    reminder_time: Optional[str] = None

    @field_validator("reminder_time")
    @classmethod
    def validate_reminder(cls, v, values):
        if values.data.get("reminder_enabled") and not v:
            raise ValueError("reminder_time is required when reminder_enabled is True")
        return v

class MedicationResponse(MedicationBase):
    id: int
    patient_user_id: int
    prescription_id: Optional[int] = None
    doctor_profile_id: Optional[int] = None
    status: MedicationStatus
    created_at: datetime
    updated_at: datetime
    
    # Optional nested details
    prescription_reference: Optional[str] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True
