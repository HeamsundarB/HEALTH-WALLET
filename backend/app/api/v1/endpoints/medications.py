from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationStopRequest,
    MedicationReminderUpdate,
    MedicationResponse,
)
from app.schemas.medication_history import MedicationHistoryResponse
from app.services.medication_service import MedicationService

router = APIRouter()

@router.post("", response_model=MedicationResponse, status_code=status.HTTP_21_CREATED if hasattr(status, 'HTTP_21_CREATED') else status.HTTP_201_CREATED)
def create_medication(
    schema: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    medication = MedicationService.create_medication(db, current_user.id, schema)
    return build_medication_response(medication)

@router.get("", response_model=List[MedicationResponse])
def get_medications(
    status: Optional[str] = Query(None, description="ONGOING, STOPPED, COMPLETED"),
    category: Optional[str] = Query(None, description="recently_started, ongoing, past"),
    prescription_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meds = MedicationService.get_patient_medications(
        db, current_user.id, status_filter=status, category_filter=category, prescription_id=prescription_id
    )
    return [build_medication_response(m) for m in meds]

@router.get("/history", response_model=List[MedicationHistoryResponse])
def get_medication_history(
    medication_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MedicationService.get_medication_history(db, current_user.id, medication_id=medication_id)

@router.get("/{id}", response_model=MedicationResponse)
def get_medication_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = MedicationService.get_medication_by_id(db, id, current_user.id)
    return build_medication_response(med)

@router.put("/{id}", response_model=MedicationResponse)
def update_medication(
    id: int,
    schema: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = MedicationService.update_medication(db, id, current_user.id, schema)
    return build_medication_response(med)

@router.post("/{id}/stop", response_model=MedicationResponse)
def stop_medication(
    id: int,
    req: MedicationStopRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = MedicationService.stop_medication(db, id, current_user.id, req)
    return build_medication_response(med)

@router.post("/{id}/complete", response_model=MedicationResponse)
def complete_medication(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = MedicationService.complete_medication(db, id, current_user.id)
    return build_medication_response(med)

@router.put("/{id}/reminder", response_model=MedicationResponse)
def update_reminder(
    id: int,
    req: MedicationReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = MedicationService.update_reminder(db, id, current_user.id, req)
    return build_medication_response(med)

def build_medication_response(med) -> MedicationResponse:
    resp = MedicationResponse.model_validate(med)
    if med.prescription:
        resp.prescription_reference = med.prescription.prescription_reference
    if med.doctor_profile and med.doctor_profile.user:
        resp.doctor_name = f"Dr. {med.doctor_profile.user.full_name}"
    return resp
