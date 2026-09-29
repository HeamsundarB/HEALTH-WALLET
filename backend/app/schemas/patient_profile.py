from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class PatientProfileUpdate(BaseModel):
    dob: Optional[date] = None
    gender: Optional[str] = Field(None, example="MALE")
    address: Optional[str] = Field(None, example="123 Innovation Drive")
    state: Optional[str] = Field(None, example="Karnataka")
    blood_group: Optional[str] = Field(None, example="O+")
    emergency_contact_name: Optional[str] = Field(None, example="John Doe")
    emergency_contact_phone: Optional[str] = Field(None, example="+91 98765 43210")

class PatientProfileOut(BaseModel):
    id: int
    user_id: int
    health_wallet_id: str
    email: str
    full_name: str
    phone_number: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
