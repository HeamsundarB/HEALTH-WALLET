from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, RoleName
from app.schemas.patient_profile import PatientProfileOut, PatientProfileUpdate
from app.services.patient_service import PatientService
from app.api.v1.deps import require_roles

router = APIRouter()

@router.get(
    "/profile",
    response_model=PatientProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated Patient Profile",
    description="Returns the patient profile and Health Wallet ID for the authenticated PATIENT user. Enforces strict backend user ownership."
)
def get_patient_profile(
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return PatientService.get_or_create_profile(db, current_user)

@router.put(
    "/profile",
    response_model=PatientProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Update Authenticated Patient Profile",
    description="Updates basic profile details (DOB, gender, address, emergency contact) for the authenticated PATIENT user."
)
def update_patient_profile(
    data: PatientProfileUpdate,
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return PatientService.update_profile(db, current_user, data)
