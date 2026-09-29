from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.medication import MedicationStatus
from app.models.medication_history import MedicationAction

class MedicationHistoryResponse(BaseModel):
    id: int
    medication_id: int
    patient_user_id: int
    action: MedicationAction
    previous_status: Optional[MedicationStatus] = None
    new_status: MedicationStatus
    notes: Optional[str] = None
    changed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
