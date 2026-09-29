from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, RoleName
from app.schemas.doctor_profile import DoctorProfileOut, DoctorProfileUpdate
from app.services.doctor_service import DoctorService
from app.api.v1.deps import require_roles, get_current_user

router = APIRouter()

@router.get(
    "/me",
    response_model=DoctorProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Get Current Doctor Profile",
    description="Returns doctor profile and professional credentials belonging strictly to the authenticated DOCTOR user."
)
def get_own_doctor_profile(
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return DoctorService.get_own_doctor_profile(db, current_user)

@router.put(
    "/me",
    response_model=DoctorProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Update Current Doctor Profile",
    description="Updates editable profile fields (bio, specialization, qualification, experience, languages, availability) owned strictly by the authenticated DOCTOR user."
)
def update_own_doctor_profile(
    data: DoctorProfileUpdate,
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return DoctorService.update_own_doctor_profile(db, current_user, data)

@router.get(
    "/{doctor_id}",
    response_model=DoctorProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Get Doctor Profile by ID",
    description="Public lookup for doctor profile details, qualifications, experience, and affiliated hospitals."
)
def get_doctor_by_id(
    doctor_id: int = Path(..., description="ID of doctor profile"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoctorService.get_doctor_profile_by_id(db, doctor_id)
