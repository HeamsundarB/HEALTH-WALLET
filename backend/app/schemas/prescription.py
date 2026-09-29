from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.models.prescription import PrescriptionStatus
from app.schemas.medication import MedicationCreate, MedicationResponse

class PrescriptionItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    route: str = Field(..., min_length=1, max_length=100)
    start_date: date
    stop_date: Optional[date] = None
    reminder_enabled: bool = False
    reminder_time: Optional[str] = None
    instructions: Optional[str] = None

    @field_validator("stop_date")
    @classmethod
    def validate_stop_date(cls, v, values):
        start_date = values.data.get("start_date")
        if v is not None and start_date is not None and v < start_date:
            raise ValueError("stop_date must not be before start_date")
        return v

class PrescriptionCreate(BaseModel):
    patient_user_id: int
    consultation_id: Optional[int] = None
    notes: Optional[str] = None
    medications: List[PrescriptionItemCreate] = Field(..., min_items=1)

class PrescriptionUpdate(BaseModel):
    notes: Optional[str] = None
    status: Optional[PrescriptionStatus] = None

class PrescriptionResponse(BaseModel):
    id: int
    patient_user_id: int
    doctor_profile_id: Optional[int] = None
    consultation_id: Optional[int] = None
    prescription_reference: str
    prescribed_date: date
    notes: Optional[str] = None
    status: PrescriptionStatus
    created_at: datetime
    updated_at: datetime
    
    # Optional nested details
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    medications: List[MedicationResponse] = []

    class Config:
        from_attributes = True
