from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, RoleName
from app.schemas.hospital_profile import (
    HospitalProfileOut,
    HospitalProfileUpdate,
    HospitalDepartmentCreate,
    HospitalDepartmentOut,
    DoctorHospitalMappingCreate,
    DoctorHospitalMappingOut,
)
from app.services.hospital_service import HospitalService
from app.api.v1.deps import require_roles, get_current_user

router = APIRouter()

@router.get(
    "/me",
    response_model=HospitalProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Get Authorized Hospital Profile",
    description="Returns hospital profile, registration details, departments, and doctor counts for authorized hospital admins/staff."
)
def get_own_hospital_profile(
    current_user: User = Depends(require_roles([RoleName.HOSPITAL_ADMIN, RoleName.HOSPITAL_STAFF])),
    db: Session = Depends(get_db)
):
    return HospitalService.get_own_hospital_profile(db, current_user)

@router.put(
    "/me",
    response_model=HospitalProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Update Authorized Hospital Profile",
    description="Updates hospital details, contact info, working hours, and services summary for authorized hospital admins/staff."
)
def update_own_hospital_profile(
    data: HospitalProfileUpdate,
    current_user: User = Depends(require_roles([RoleName.HOSPITAL_ADMIN, RoleName.HOSPITAL_STAFF])),
    db: Session = Depends(get_db)
):
    return HospitalService.update_own_hospital_profile(db, current_user, data)

@router.post(
    "/me/departments",
    response_model=HospitalDepartmentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add Hospital Department",
    description="Adds a new department specialty to the authorized hospital profile."
)
def add_department(
    data: HospitalDepartmentCreate,
    current_user: User = Depends(require_roles([RoleName.HOSPITAL_ADMIN, RoleName.HOSPITAL_STAFF])),
    db: Session = Depends(get_db)
):
    return HospitalService.add_department(db, current_user, data)

@router.post(
    "/me/doctors",
    response_model=DoctorHospitalMappingOut,
    status_code=status.HTTP_201_CREATED,
    summary="Assign Doctor to Hospital",
    description="Maps a doctor by Professional ID (e.g. DOC-1001) to an active affiliation with the authorized hospital."
)
def assign_doctor_to_hospital(
    data: DoctorHospitalMappingCreate,
    current_user: User = Depends(require_roles([RoleName.HOSPITAL_ADMIN, RoleName.HOSPITAL_STAFF])),
    db: Session = Depends(get_db)
):
    return HospitalService.assign_doctor_to_hospital(db, current_user, data)

@router.get(
    "/{hospital_id}",
    response_model=HospitalProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Get Hospital Profile by ID",
    description="Public lookup for hospital details, location, departments, and services."
)
def get_hospital_by_id(
    hospital_id: int = Path(..., description="ID of hospital profile"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return HospitalService.get_hospital_by_id(db, hospital_id)
