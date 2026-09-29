from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.doctor_profile import VerificationStatus
from app.schemas.doctor_profile import DoctorProfileOut
from app.schemas.hospital_profile import HospitalProfileOut

class ProviderVerificationReview(BaseModel):
    provider_type: str = Field(..., example="DOCTOR", description="DOCTOR or HOSPITAL")
    provider_id: int = Field(..., description="ID of doctor_profile or hospital_profile")
    action: str = Field(..., example="APPROVE", description="APPROVE or REJECT")
    remarks: Optional[str] = None

class ProviderVerificationItem(BaseModel):
    provider_type: str
    id: int
    name: str
    identifier: str
    details: str
    verification_status: VerificationStatus
    submitted_at: str

class DoctorSearchQuery(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    location_city: Optional[str] = None
    verified_only: Optional[bool] = False

class HospitalSearchQuery(BaseModel):
    name: Optional[str] = None
    location_city: Optional[str] = None
    department_name: Optional[str] = None
    verified_only: Optional[bool] = False
