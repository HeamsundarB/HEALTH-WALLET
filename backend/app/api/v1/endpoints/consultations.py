from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User, RoleName
from app.api.v1.deps import get_current_user, require_roles
from app.schemas.consultation import ConsultationOut
from app.services.consultation_service import ConsultationService

router = APIRouter()

@router.get(
    "/patient",
    response_model=List[ConsultationOut],
    status_code=status.HTTP_200_OK,
    summary="List Patient Consultations",
    description="Returns all completed consultations for the authenticated patient."
)
def get_patient_consultations(
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return ConsultationService.get_patient_consultations(db, current_user)

@router.get(
    "/doctor",
    response_model=List[ConsultationOut],
    status_code=status.HTTP_200_OK,
    summary="List Doctor Consultations",
    description="Returns all completed consultations recorded by the authenticated doctor."
)
def get_doctor_consultations(
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return ConsultationService.get_doctor_consultations(db, current_user)

@router.get(
    "/{consultation_id}",
    response_model=ConsultationOut,
    status_code=status.HTTP_200_OK,
    summary="Get Consultation Detail",
    description="Returns full clinical consultation details if owned by patient or conducting doctor."
)
def get_consultation_by_id(
    consultation_id: int = Path(..., description="ID of consultation"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ConsultationService.get_consultation_by_id(db, current_user, consultation_id)
