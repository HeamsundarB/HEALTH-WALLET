from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.doctor_profile import VerificationStatus

class DoctorProfileUpdate(BaseModel):
    bio: Optional[str] = None
    specialization: Optional[str] = Field(None, min_length=2, max_length=255)
    qualification: Optional[str] = Field(None, min_length=2, max_length=255)
    experience_years: Optional[int] = Field(None, ge=0)
    languages: Optional[str] = None
    consultation_type: Optional[str] = None
    availability_info: Optional[str] = None
    profile_image_url: Optional[str] = None

class DoctorCredentialOut(BaseModel):
    id: int
    professional_id: str
    qualification_summary: str
    certifications: Optional[str] = None
    verification_status: VerificationStatus
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DoctorProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    specialization: str
    qualification: str
    experience_years: int
    languages: Optional[str] = None
    consultation_type: str
    availability_info: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    credential: Optional[DoctorCredentialOut] = None
    affiliated_hospitals: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
