from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.v1.deps import get_current_user, require_doctor
from app.models.user import User
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionResponse,
)
from app.schemas.medication import MedicationResponse
from app.services.prescription_service import PrescriptionService

router = APIRouter()

@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    schema: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor)
):
    prescription = PrescriptionService.create_prescription(db, current_doctor.id, schema)
    return build_prescription_response(prescription)

@router.get("", response_model=List[PrescriptionResponse])
def list_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rx_list = PrescriptionService.get_prescriptions_for_user(db, current_user.id)
    return [build_prescription_response(p) for p in rx_list]

@router.get("/{id}", response_model=PrescriptionResponse)
def get_prescription_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prescription = PrescriptionService.get_prescription_by_id(db, id, current_user.id)
    return build_prescription_response(prescription)

@router.put("/{id}", response_model=PrescriptionResponse)
def update_prescription(
    id: int,
    schema: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor)
):
    prescription = PrescriptionService.update_prescription(db, id, current_doctor.id, schema)
    return build_prescription_response(prescription)

@router.post("/{id}/cancel", response_model=PrescriptionResponse)
def cancel_prescription(
    id: int,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor)
):
    prescription = PrescriptionService.cancel_prescription(db, id, current_doctor.id)
    return build_prescription_response(prescription)

def build_prescription_response(p) -> PrescriptionResponse:
    resp = PrescriptionResponse.model_validate(p)
    if p.doctor_profile and p.doctor_profile.user:
        resp.doctor_name = f"Dr. {p.doctor_profile.user.full_name}"
    if p.patient_user:
        resp.patient_name = p.patient_user.full_name
    
    # Format attached medications
    med_responses = []
    for med in p.medications:
        m_resp = MedicationResponse.model_validate(med)
        m_resp.prescription_reference = p.prescription_reference
        if p.doctor_profile and p.doctor_profile.user:
            m_resp.doctor_name = f"Dr. {p.doctor_profile.user.full_name}"
        med_responses.append(m_resp)
    resp.medications = med_responses

    return resp
