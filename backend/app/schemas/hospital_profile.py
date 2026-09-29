from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.doctor_profile import VerificationStatus

class HospitalDepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class HospitalDepartmentOut(BaseModel):
    id: int
    hospital_profile_id: int
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HospitalProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    address: Optional[str] = None
    location_city: Optional[str] = None
    state: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    working_hours: Optional[str] = None
    services_summary: Optional[str] = None

class DoctorHospitalMappingCreate(BaseModel):
    doctor_professional_id: str = Field(..., example="DOC-1001")
    department_name: Optional[str] = None

class DoctorHospitalMappingOut(BaseModel):
    id: int
    doctor_profile_id: int
    doctor_name: str
    specialization: str
    hospital_profile_id: int
    hospital_name: str
    department_name: Optional[str] = None
    status: str
    joined_date: datetime

    class Config:
        from_attributes = True

class HospitalProfileOut(BaseModel):
    id: int
    admin_user_id: int
    name: str
    registration_number: str
    address: str
    location_city: str
    state: str
    contact_email: str
    contact_phone: str
    working_hours: str
    services_summary: Optional[str] = None
    verification_status: VerificationStatus
    verified_at: Optional[datetime] = None
    departments: List[HospitalDepartmentOut] = []
    affiliated_doctors_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
