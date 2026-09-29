from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.consent import ConsentStatus, ConsentScope
from app.models.user import RoleName

class ConsentCreate(BaseModel):
    patient_health_wallet_id: str = Field(..., example="HW-2026-1234-5678", description="Synthetic Health Wallet ID of target patient")
    purpose: str = Field(..., min_length=3, max_length=255, example="Consultation & Clinical Evaluation")
    scope: ConsentScope = Field(..., example="ALL_HEALTH_RECORDS")
    start_at: Optional[datetime] = Field(None, description="Start date/time for consent validity")
    expires_at: Optional[datetime] = Field(None, description="Expiry date/time for consent validity")
    sensitive_data_allowed: Optional[bool] = Field(False, description="Flag permitting sensitive record access")

class ConsentOut(BaseModel):
    id: int
    patient_user_id: int
    requester_user_id: int
    requester_name: Optional[str] = None
    patient_name: Optional[str] = None
    patient_health_wallet_id: Optional[str] = None
    requester_role: RoleName
    purpose: str
    scope: ConsentScope
    status: ConsentStatus
    start_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    sensitive_data_allowed: bool = False
    requested_at: datetime
    responded_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

